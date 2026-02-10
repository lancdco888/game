const { ccclass, property } = cc._decorator;


import ReelController_Base from '../../ReelController_Base';
import ReelSpinBehaviors, { EasingInfo } from '../../ReelSpinBehaviors';
import Reel from '../../Slot/Reel';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import SlotSoundController from '../../Slot/SlotSoundController';
import State, { SequencialState } from '../../Slot/State';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import SlotUIRuleManager from '../../Slot/rule/SlotUIRuleManager';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameResultManager, { ResultSymbolInfo } from '../../manager/SlotGameResultManager';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotManager from '../../manager/SlotManager';
import SoundManager from '../../manager/SoundManager';
import GameComponent_LuckyBunnyDrop from './GameComponent_LuckyBunnyDrop';
import JackpotSymbolComponent_LucykyBunnyDrop from './JackpotSymbolComponent_LucykyBunnyDrop';
import JackpotSymbolInfoHelper_LuckyBunnyDrop from './JackpotSymbolInfoHelper_LuckyBunnyDrop';
import LuckyBunnyDropManager from './LuckyBunnyDropManager';
import ReelMachine_LuckyBunnyDrop from './ReelMachine_LuckyBunnyDrop';
import { Window } from '../../manager/SlotGameRuleManager';

/**
 * 幸运兔子掉落滚轮控制器（继承ReelController_Base）
 * 负责普通/LNR双模式滚轮自旋、Jackpot/Scatter符号动画、LockAndRoll状态、音效控制等核心逻辑
 */
@ccclass()
export default class ReelController_LuckyBunnyDrop extends ReelController_Base {
    // Jackpot滚轮预期特效节点
    @property(cc.Node)
    public jackpotReelExpect: cc.Node | null = null;

    // 是否为LNR（LockAndRoll）模式滚轮
    @property
    public isLNRReel: boolean = false;

    // 是否为Scatter预期状态
    private _isScatterExpect: boolean = false;

    /**
     * 组件加载时执行（Cocos生命周期）
     * 初始化dummySymbolList + 注册滚轮停止音效回调
     */
    public onLoad(): void {
        // 1. 根据模式初始化dummySymbolList
        if (!this.isLNRReel) {
            // 普通模式：添加普通dummy符号ID
            this.dummySymbolList.push(11, 12, 13, 14, 21, 22, 23, 24, 31, 32);
        } else {
            // LNR模式：添加LNR专属dummy符号ID
            this.dummySymbolList.push(90, 0);
        }

        // 2. 注册滚轮停止时的回调（处理模糊偏移+音效停止）
        this.easingFuncListOnSpinEnd.push(() => {
            const reelComp = this.node.getComponent(Reel);
            if (reelComp) {
                // 播放滚轮停止音效
                this.playReelStopSound();
                // 重置模糊偏移
                reelComp.setShaderValue("blurOffset", 0);
                
                // 第4个滚轮（索引4）延迟停止自旋/预期音效
                if (reelComp.reelindex === 4) {
                    this.node.runAction(cc.sequence(
                        cc.delayTime(0.26),
                        cc.callFunc(() => {
                            SlotSoundController.Instance().stopAudio("ReelSpin", "FXLoop");
                            SlotSoundController.Instance().stopAudio("ReelExpect", "FX");
                        })
                    ));
                }
            }
        });
    }

    /**
     * 处理滚轮自旋结束逻辑（核心：符号动画、音效、回调执行）
     * @param callback 自旋结束后的回调函数
     */
    public processSpinEnd(callback: () => void): void {
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelComp = this.node.getComponent(Reel);
        
        // 普通滚轮模式（非LNR）
        if (!this.isLNRReel) {
            if (subGameKey === "base" || subGameKey === "freeSpin") {
                let isScatterPlayed = false;
                let isJackpotPlayed = false;
                const window = SlotGameResultManager.Instance.getLastHistoryWindows().GetWindow(reelComp!.reelindex);

                // 遍历滚轮窗口内的所有符号
                for (let row = 0; row < window.size; row++) {
                    const symbolId = window.getSymbol(row);

                    // 1. Scatter符号（51）动画判断
                    if (symbolId === 51 && this.canPlayingScatterAppearSymbomEffect(
                        symbolId,
                        SlotGameResultManager.Instance.getVisibleSlotWindows(),
                        reelComp!.reelindex
                    )) {
                        // 播放Scatter出现动画
                        SymbolAnimationController.Instance.playAnimationSymbol(
                            reelComp!.reelindex,
                            row,
                            56,
                            null,
                            SlotManager.Instance.reelMachine,
                            false
                        );
                        // 隐藏该行原始符号
                        reelComp!.hideSymbolInRow(row);
                        isScatterPlayed = true;
                    }

                    // 2. Jackpot符号（≥90）动画判断
                    if (symbolId >= 90 && this.canPlayingJackpotSymbomEffect(
                        SlotGameResultManager.Instance.getVisibleSlotWindows(),
                        reelComp!.reelindex
                    )) {
                        // 播放Jackpot出现动画
                        const animNode = SymbolAnimationController.Instance.playAnimationSymbol(
                            reelComp!.reelindex,
                            row,
                            95,
                            null,
                            SlotManager.Instance.reelMachine,
                            false
                        );
                        // 获取Jackpot符号信息
                        const resultId = JackpotSymbolInfoHelper_LuckyBunnyDrop.getResultID(reelComp!.reelindex, row);
                        let jackpotType = -1;
                        let prize = -1;
                        let multiplier = -1;

                        // 解析Jackpot符号信息（区分普通/特殊符号）
                        const symbolInfo = JackpotSymbolInfoHelper_LuckyBunnyDrop.getSymbolInfo(resultId);
                        if (symbolInfo.multiplier === 0 && resultId !== 92 && resultId !== 93) {
                            // 从组件获取符号信息（兼容原逻辑）
                            const jackpotComp = this.getComponent(Reel)!.getSymbol(row).getComponent(JackpotSymbolComponent_LucykyBunnyDrop);
                            if (TSUtility.isValid(jackpotComp)) {
                                jackpotType = jackpotComp.getJackpotType();
                                multiplier = jackpotComp._multiplier;
                                prize = jackpotComp._prize;
                            }
                        } else {
                            // 从Helper获取符号信息
                            if (symbolInfo.type === "jackpot") {
                                jackpotType = symbolInfo.key === "mini" ? 1 :
                                               symbolInfo.key === "minor" ? 2 :
                                               symbolInfo.key === "major" ? 3 :
                                               symbolInfo.key === "mega" ? 4 : 5;
                            } else if (symbolInfo.type === "multiplier") {
                                jackpotType = 0;
                                prize = symbolInfo.prize;
                                multiplier = symbolInfo.multiplier;
                            }
                        }

                        // 设置Jackpot符号中心信息
                        animNode.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)!.setCenterInfo(resultId, jackpotType, multiplier);
                        // 隐藏该行原始符号
                        reelComp!.hideSymbolInRow(row);
                        isScatterPlayed = true;
                    }
                }

                // 播放对应音效并延迟执行回调
                if (isScatterPlayed || isJackpotPlayed) {
                    const audioKey = isScatterPlayed ? "ScatterAppear" : "JackpotAppear";
                    SlotSoundController.Instance().playAudio(audioKey, "FX");
                    this.scheduleOnce(() => callback(), 1);
                } else {
                    callback();
                }
            } else {
                callback();
            }
        } 
        // LNR滚轮模式
        else {
            const reelIndex = this.getComponent(Reel)!.reelindex;
            const lnrRow = Math.floor(reelIndex / 3);
            const lnrCol = Math.floor(reelIndex % 3);
            const windowSymbol = SlotGameResultManager.Instance.getHistoryWindow(0).GetWindow(lnrRow).getSymbol(lnrCol);
            const isFilled = SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop)!.lockAndRoll.isFilled(lnrRow, lnrCol);

            // Jackpot符号（≥90）且未填充 → 播放动画
            if (windowSymbol >= 90 && !isFilled) {
                // 播放Jackpot出现动画
                const animNode = SymbolAnimationController.Instance.playAnimationSymbol(
                    lnrRow,
                    lnrCol,
                    95,
                    null,
                    SlotManager.Instance.reelMachine,
                    false
                );
                let jackpotType = -1;
                let prize = -1;
                let multiplier = -1;
                let resultId = 90;

                // 解析LNR模式Jackpot符号信息
                if (windowSymbol === 91) {
                    resultId = JackpotSymbolInfoHelper_LuckyBunnyDrop.getResultID(lnrRow, lnrCol);
                    const symbolInfo = JackpotSymbolInfoHelper_LuckyBunnyDrop.getSymbolInfo(resultId);
                    if (symbolInfo.type === "jackpot") {
                        jackpotType = symbolInfo.key === "mini" ? 1 :
                                       symbolInfo.key === "minor" ? 2 :
                                       symbolInfo.key === "major" ? 3 :
                                       symbolInfo.key === "mega" ? 4 : 5;
                    } else if (symbolInfo.type === "multiplier") {
                        jackpotType = 0;
                        prize = symbolInfo.prize;
                        multiplier = symbolInfo.multiplier;
                    }
                } else {
                    resultId = windowSymbol;
                }

                // 设置Jackpot符号中心信息
                animNode.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)!.setCenterInfo(resultId, jackpotType, multiplier);
                // 隐藏该行原始符号
                this.getComponent(Reel)!.hideSymbolInRow(1);
                // 播放Jackpot音效并延迟执行回调
                SlotSoundController.Instance().playAudio("JackpotAppear", "FX");
                this.scheduleOnce(() => callback(), 0.5);
            } else {
                callback();
            }
        }
    }

    

    /**
     * 设置Jackpot预期特效显示状态
     * @param isShow 是否显示
     */
    public setShowJackpotExpectEffects(isShow: number): void {
        // 跳过条件：显示且跳过自旋 或 Scatter预期状态一致
        if ((isShow === 1 && SlotManager.Instance.isSkipCurrentSpin === 1) || this._isScatterExpect === (isShow === 1)) {
            return;
        }

        // 播放滚轮预期音效
        if (isShow === 1) {
            SlotSoundController.Instance().playAudio("ReelExpect", "FX");
        }

        // 更新Jackpot预期特效节点位置和显示状态
        if (this.jackpotReelExpect) {
            this.jackpotReelExpect.active = isShow === 1;
            this.jackpotReelExpect.x = 188 * (this.node.getComponent(Reel)!.reelindex - 2);
        }
    }

    /**
     * 获取自旋状态序列（排除预自旋，使用自旋请求时间状态）
     * @param stopWindows 停止窗口信息（可选）
     * @param reelMachine 滚轮机器实例（可选）
     * @returns 有序状态序列
     */
    public getSpinExcludePreSpinUsingSpinRequestTimeState(
        stopWindows?: any,
        reelMachine?: any
    ): SequencialState {
        // 初始化参数默认值
        stopWindows = stopWindows ?? null;
        reelMachine = reelMachine ?? SlotManager.Instance.reelMachine;
        
        // 节点未激活 → 返回空状态
        if (!this.node.active) {
            return new SequencialState();
        }

        // 获取核心依赖实例/数据
        const reelComp = this.node.getComponent(Reel)!;
        const finalStopWindows = stopWindows ?? SlotGameResultManager.Instance.getReelStopWindows();
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelComp.reelindex];
        
        // 构建有序状态序列
        const seqState = new SequencialState();
        let stateIndex = 0;

        // 1. 滚轮自旋到停止前状态（滚轮更新前）
        const spinUntilStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReelRenewal(
            reelMachine.reels, reelComp, reelStrip, subGameKey
        );
        spinUntilStopState.flagSkipActive = true;
        spinUntilStopState.addOnStartCallback(() => {
            reelComp.setShaderValue("blurOffset", 0.02);
        });
        seqState.insert(stateIndex++, spinUntilStopState);

        // 2. 滚轮当前更新状态
        const reelRenewalState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReelRenewal(
            reelMachine.reels, reelComp, reelStrip, subGameKey
        );
        reelRenewalState.flagSkipActive = true;
        seqState.insert(stateIndex++, reelRenewalState);

        // 3. 解析缓动参数
        const postEasingType = spinControlInfo?.postEasingType;
        const postEasingRate = spinControlInfo?.postEasingRate;
        const postEasingDuration = spinControlInfo?.postEasingDuration;
        const postEasingDistance = spinControlInfo?.postEasingDistance;

        // 4. 构建缓动信息
        const easingInfo = new EasingInfo();
        easingInfo.easingType = postEasingType;
        easingInfo.easingDistance = postEasingDistance;
        easingInfo.easingDuration = postEasingDuration;
        easingInfo.easingRate = postEasingRate;
        easingInfo.onEasingStartFuncList.push(() => {
            this._isScatterExpect = false;
            this.setShowExpectEffects(false);
            this.setShowJackpotExpectEffects(0);
        });
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 5. 获取结果符号列表/信息
        const resultWindow = finalStopWindows.GetWindow(reelComp.reelindex);
        const resultSymbolList = this.getResultSymbolList(resultWindow, reelComp);
        const resultSymbolInfoList = this.getResultSymbolInfoList(resultWindow, reelComp);

        // 6. 滚轮移动状态（带最后符号列表）
        const reelMoveState = this.getReelMoveStateWithLastSymbolList(
            reelComp, resultSymbolList, subGameKey, easingInfo
        );
        reelMoveState.addOnEndCallback(() => {
            // 第4个滚轮停止自旋音效
            if (reelComp.reelindex === 4) {
                SlotManager.Instance.stopReelSpinSound();
            }
        });
        seqState.insert(stateIndex++, reelMoveState);

        // 7. 自旋结束处理状态
        const endState = new State();
        endState.addOnStartCallback(() => {
            // 重置滚轮组件位置
            reelComp.resetPositionOfReelComponents();
            // 重置模糊偏移
            reelComp.setShaderValue("blurOffset", 0);
            // 最后一个滚轮重置主音量
            if (reelMachine.reels.length - 1 === reelComp.reelindex) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }
            // 更新预期特效状态
            SlotManager.Instance.getComponent(LuckyBunnyDropManager)!.setPlayReelExpectEffectState(reelComp.reelindex + 1);
            SlotManager.Instance.getComponent(LuckyBunnyDropManager)!.setPlayReelExpectJackpotEffectState(reelComp.reelindex + 1);
            // 处理自旋结束逻辑
            this.processSpinEnd(endState.setDone.bind(endState));
        });
        seqState.insert(stateIndex++, endState);

        return seqState;
    }

    /**
     * 判断是否可播放Scatter出现符号动画
     * @param symbolId Scatter符号ID
     * @param windows 可见窗口信息
     * @param reelIndex 滚轮索引
     * @returns 是否可播放
     */
    public canPlayingScatterAppearSymbomEffect(symbolId: number, windows: any, reelIndex: number): boolean {
        // 前3个滚轮直接返回true
        if (reelIndex < 3) return true;

        // 统计前N个滚轮中Scatter符号数量
        let scatterCount = 0;
        for (let r = 0; r < reelIndex; r++) {
            const window = windows.GetWindow(r);
            for (let row = 0; row < window.size; row++) {
                if (window.getSymbol(row) === symbolId) {
                    scatterCount++;
                }
            }
        }

        // 第3个滚轮：至少1个；第4+滚轮：至少2个
        return reelIndex === 3 ? scatterCount >= 1 : scatterCount >= 2;
    }

    /**
     * 判断是否可播放Jackpot出现符号动画
     * @param windows 可见窗口信息
     * @param reelIndex 滚轮索引
     * @returns 是否可播放
     */
    public canPlayingJackpotSymbomEffect(windows: any, reelIndex: number): boolean {
        // 前4个滚轮直接返回true
        if (reelIndex < 4) return true;

        // 统计前N个滚轮中Jackpot符号数量
        let jackpotCount = 0;
        for (let r = 0; r < reelIndex; r++) {
            const window = windows.GetWindow(r);
            for (let row = 0; row < window.size; row++) {
                if (window.getSymbol(row) >= 90) {
                    jackpotCount++;
                }
            }
        }

        // 第4+滚轮：超过3个
        return jackpotCount > 3;
    }

    /**
     * 获取LockAndRoll模式滚轮状态序列
     * @returns 有序状态序列
     */
    public getLockAndRollState(): SequencialState {
        // 节点未激活 → 返回空状态
        if (!this.node.active) {
            return new SequencialState();
        }

        // 获取免费旋转模式（原JS无使用，保留逻辑）
        SlotReelSpinStateManager.Instance.getFreespinMode();

        // 构建历史符号二维数组
        const historySymbols: number[][] = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
        const historyWindow = SlotGameResultManager.Instance.getHistoryWindow(0);
        for (let r = 0; r < 5; r++) {
            for (let row = 0; row < 3; row++) {
                historySymbols[r][row] = historyWindow.GetWindow(r).getSymbol(row);
            }
        }

        // 获取核心依赖实例/数据
        const reelComp = this.node.getComponent(Reel)!;
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelComp.reelindex];
        const lnrReels = SlotManager.Instance.reelMachine.getComponent(ReelMachine_LuckyBunnyDrop)!.lockAndRoll_Reels;
        
        // 构建有序状态序列
        const seqState = new SequencialState();
        let stateIndex = 0;

        // 1. 滚轮自旋到停止前状态
        const spinUntilStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReelRenewal(
            lnrReels, reelComp, reelStrip, subGameKey
        );
        spinUntilStopState.flagSkipActive = true;
        spinUntilStopState.addOnStartCallback(() => {
            reelComp.setShaderValue("blurOffset", 0.02);
        });
        seqState.insert(stateIndex++, spinUntilStopState);

        // 2. 滚轮当前更新状态
        const reelRenewalState = this.getReelSpinStateCurrentReel(reelComp, reelStrip, subGameKey);
        reelRenewalState.flagSkipActive = true;
        seqState.insert(stateIndex++, reelRenewalState);

        // 3. 解析缓动参数
        const postEasingType = spinControlInfo?.postEasingType;
        const postEasingRate = spinControlInfo?.postEasingRate;
        const postEasingDuration = spinControlInfo?.postEasingDuration;
        const postEasingDistance = spinControlInfo?.postEasingDistance;

        // 4. 构建缓动信息
        const easingInfo = new EasingInfo();
        easingInfo.easingType = postEasingType;
        easingInfo.easingDistance = postEasingDistance;
        easingInfo.easingDuration = postEasingDuration;
        easingInfo.easingRate = postEasingRate;
        easingInfo.onEasingStartFuncList.push(() => {
            this.setShowExpectEffects(false);
        });
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 5. 获取LockAndRoll结果窗口/符号列表
        const lnrResultWindow = this.getLockAndRollResultWindow(historySymbols, reelComp.reelindex);
        const resultSymbolList = this.getResultSymbolList(lnrResultWindow, reelComp);
        const resultSymbolInfoList = this.getResultSymbolInfoListJackpotMode(reelComp.reelindex);

        // 6. 滚轮移动状态
        const reelMoveState = ReelSpinBehaviors.Instance.getReelMoveStateWithLastSymbolListNew(
            reelComp, resultSymbolList, subGameKey, easingInfo, resultSymbolInfoList
        );
        reelMoveState.addOnEndCallback(() => {
            // 第8个滚轮停止自旋音效
            if (reelComp.reelindex === 8) {
                SlotManager.Instance.stopReelSpinSound();
            }
        });
        seqState.insert(stateIndex++, reelMoveState);

        // 7. LockAndRoll结束处理状态
        const endState = new State();
        endState.addOnStartCallback(() => {
            // 重置滚轮组件位置
            reelComp.resetPositionOfReelComponents();
            // 最后一个滚轮重置主音量
            if (lnrReels.length - 1 === reelComp.reelindex) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }
            // 更新预期特效状态（索引≥2）
            if (reelComp.reelindex >= 2) {
                SlotManager.Instance.setPlayReelExpectEffectStateWithLastHistoryWindow(reelComp.reelindex + 2);
            }
            // 处理自旋结束逻辑
            this.processSpinEnd(endState.setDone.bind(endState));
        });
        seqState.insert(stateIndex++, endState);

        return seqState;
    }

    /**
     * 重写基类方法：获取带符号信息的滚轮移动状态
     * @param reelComp 滚轮组件
     * @param symbolList 符号列表
     * @param subGameKey 子游戏标识
     * @param easingInfo 缓动信息
     * @returns 滚轮移动状态
     */
    public getReelMoveStateWithLastSymbolList(
        reelComp: Reel,
        symbolList: number[],
        subGameKey: string,
        easingInfo: EasingInfo
    ): any {
        const symbolInfoList = this.getSymbolInfoList(symbolList);
        return super.getReelMoveStateWithLastSymbolList.call(
            this, reelComp, symbolList, subGameKey, easingInfo, symbolInfoList
        );
    }

    /**
     * 获取滚轮当前更新状态（自定义自旋逻辑）
     * @param reelComp 滚轮组件
     * @param reelStrip 滚轮条数据
     * @param subGameKey 子游戏标识
     * @returns 滚轮自旋状态
     */
    public getReelSpinStateCurrentReel(
        reelComp: Reel,
        reelStrip: any,
        subGameKey: string
    ): State {
        const spinState = new State();
        const reelGroup = Math.floor(reelComp.reelindex / 3) + 1;
        const reelStripData = reelStrip.getReel(reelGroup);
        let spinAction: cc.Action = null;

        // 自旋开始回调
        spinState.addOnStartCallback(() => {
            // 设置自旋方向为向下
            reelComp.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            // 检查空白符号并控制下一个符号索引
            reelStripData.checkBlankSymbolAndControlNextSymbolIndex(reelComp);
            
            // 获取自旋控制参数
            const spinControlInfo = subGameKey ? SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelComp.reelindex] : null;
            const oneSymbolMoveSpeed = spinControlInfo?.oneSymbolMoveSpeed;
            const maxSpeedInExpectEffect = spinControlInfo?.maxSpeedInExpectEffect;

            // 计算自旋时间/速度
            const spinTime = reelComp.getReelSpinTime(subGameKey);
            const moveSpeed = SlotUIRuleManager.Instance.getExpectEffectFlag(reelComp.reelindex, SlotGameResultManager.Instance.getVisibleSlotWindows()) 
                ? maxSpeedInExpectEffect 
                : oneSymbolMoveSpeed;
            const moveCount = Math.floor(spinTime / moveSpeed);

            // 创建自旋动作
            const moveAction = cc.moveBy(spinTime, new cc.Vec2(0, -moveCount * reelComp.symbolHeight));
            // 设置下一个符号ID回调
            reelComp.setNextSymbolIdCallback(() => {
                const nextSymbolId = reelStripData.getNextSymbolId();
                reelStripData.increaseNextSymbolIndex();
                return nextSymbolId;
            });
            // 执行自旋动作
            spinAction = reelComp.node.runAction(cc.sequence(moveAction, cc.callFunc(spinState.setDone.bind(spinState))));
        });

        // 自旋结束回调
        spinState.addOnEndCallback(() => {
            // 停止未完成的自旋动作
            if (spinAction && !spinAction.isDone()) {
                reelComp.node.stopAction(spinAction);
            }
            // 更新滚轮状态
            reelComp.update();
            // 第14个滚轮设置自旋状态为不可跳过
            if (reelComp.reelindex === 14) {
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE);
            }
        });

        return spinState;
    }

    /**
     * 获取LockAndRoll结果窗口
     * @param historySymbols 历史符号二维数组
     * @param reelIndex 滚轮索引
     * @returns 结果窗口对象
     */
    public getLockAndRollResultWindow(historySymbols: number[][], reelIndex: number): Window {
        const resultWindow = new Window(3);
        const lnrRow = Math.floor(reelIndex / 3);
        const lnrCol = Math.floor(reelIndex % 3);
        const targetSymbol = historySymbols[lnrRow][lnrCol];

        // 设置窗口符号（仅中间行有效）
        resultWindow.setSymbol(0, 0);
        resultWindow.setSymbol(1, targetSymbol);
        resultWindow.setSymbol(2, 0);

        return resultWindow;
    }

    /**
     * 获取Jackpot模式结果符号信息列表
     * @param reelIndex 滚轮索引
     * @returns 符号信息列表
     */
    public getResultSymbolInfoListJackpotMode(reelIndex: number): any[] {
        const symbolInfoList: any[] = [];
        const lnrRow = Math.floor(reelIndex / 3);
        const lnrCol = Math.floor(reelIndex % 3);

        // 仅中间行（索引1）填充Jackpot符号信息
        for (let row = 0; row < 3; row++) {
            if (row === 1) {
                symbolInfoList.push(this.getJackpotSymbolInfo(lnrRow, lnrCol));
            } else {
                symbolInfoList.push(null);
            }
        }

        return symbolInfoList;
    }

    /**
     * 获取Jackpot符号信息
     * @param row 行索引
     * @param col 列索引
     * @returns Jackpot符号信息（null=无效）
     */
    public getJackpotSymbolInfo(row: number, col: number): any {
        const historyWindow = SlotGameResultManager.Instance.getHistoryWindow(0);
        const symbolId = historyWindow.GetWindow(row).getSymbol(col);
        const resultSymbolInfo = new ResultSymbolInfo();

        // 符号ID校验（>90 且 非90/100/200 且 有效）
        if (!(symbolId > 90 && (symbolId !== 90 && symbolId !== 100 && symbolId !== 200) && 1)) {
            return null;
        }

        // 获取结果ID并解析符号信息
        const resultId = JackpotSymbolInfoHelper_LuckyBunnyDrop.getResultID(row, col);
        return resultId < 0 ? null : JackpotSymbolInfoHelper_LuckyBunnyDrop.getSymbolInfo(resultId);
    }

    /**
     * 获取符号信息列表（解析Jackpot符号）
     * @param symbolList 符号ID列表
     * @returns 符号信息列表
     */
    public getSymbolInfoList(symbolList: number[]): any[] {
        const symbolInfoList: any[] = [];

        for (let i = 0; i < symbolList.length; i++) {
            const symbolId = symbolList[i];
            let symbolInfo: any = null;

            // 解析Jackpot符号信息（>90 且 非92/93 且 非90/100/200 且 有效）
            if (symbolId > 90 && symbolId !== 92 && symbolId !== 93 && (symbolId !== 90 && symbolId !== 100 && symbolId !== 200) && 1) {
                symbolInfo = JackpotSymbolInfoHelper_LuckyBunnyDrop.getSymbolInfo(symbolId);
            }

            symbolInfoList.push(symbolInfo);
        }

        return symbolInfoList;
    }
}
