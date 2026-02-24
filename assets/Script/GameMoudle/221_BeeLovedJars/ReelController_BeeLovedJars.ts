
import JackpotSymbolComponent_BeeLovedJars from './Component/JackpotSymbolComponent_BeeLovedJars';
import LockComponent_BeeLovedJars from './Component/LockComponent_BeeLovedJars';
import Reel_BeeLovedJars from './Reel_BeeLovedJars';
import ReelMachine_BeeLovedJars from './ReelMachine_BeeLovedJars';
import BeeLovedJarsManager, { EventBus } from './BeeLovedJarsManager';
import ReelController_Base from '../../ReelController_Base';
import SlotSoundController from '../../Slot/SlotSoundController';
import Reel from '../../Slot/Reel';
import SlotManager, { SpecialSymbolInfo, SpecialType } from '../../manager/SlotManager';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import TSUtility from '../../global_utility/TSUtility';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import State, { SequencialState } from '../../Slot/State';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotUIRuleManager from '../../Slot/rule/SlotUIRuleManager';
import ReelSpinBehaviors, { EasingInfo } from '../../ReelSpinBehaviors';
import SoundManager from '../../manager/SoundManager';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import { Window } from '../../manager/SlotGameRuleManager';

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏的滚轮控制器，继承自通用 ReelController_Base 基类
 * 负责滚轮旋转、停止、符号显示/动画、音效播放等核心逻辑
 */
@ccclass('ReelController_BeeLovedJars')
export default class ReelController_BeeLovedJars extends ReelController_Base {
    // Lock&Roll 模式滚轮标识
    @property({
        displayName: "LockNRoll滚轮",
        tooltip: "是否为Lock&Roll模式专用滚轮"
    })
    lockNRoll_Reel: boolean = false;

    // Lock&Roll 模式占位符号列表
    private lockNRollDummySymboList: number[] = [0, 90, 0, 0];
    // 无Wild符号的占位列表
    private noWildDummy: number[] = [14, 12, 13, 21, 22, 31, 32, 33, 90];
    // 无Jackpot符号的占位列表
    private noJackpotDummy: number[] = [14, 12, 13, 21, 22, 31, 32, 33, 71];
    // 免费旋转模式占位符号列表
    private freeSpinDummy: number[] = [21, 22, 31, 32, 33];


    /**
     * 生命周期：加载完成
     */
    onLoad(): void {
        const self = this;
        // 初始化默认占位符号列表
        this.dummySymbolList = [14, 12, 13, 21, 22, 31, 32, 33, 71, 90];
        
        // 旋转结束的缓动函数列表添加回调（播放停止音效+停止期待音效）
        this.easingFuncListOnSpinEnd.push(() => {
            self.playReelStopSound();
            SlotSoundController.Instance().stopAudio("ReelExpect", "FX");
        });
    }

    /**
     * 播放滚轮停止音效
     */
    playReelStopSound(): void {
        const reelComp = this.node.getComponent(Reel);
        if (!reelComp) return;

        const slotManager = SlotManager.Instance;
        const reelMachineComp = slotManager.reelMachine.getComponent(ReelMachine_BeeLovedJars);
        
        // Lock&Roll模式逻辑
        if (this.lockNRoll_Reel) {
            if (slotManager.isSkipCurrentSpin === 0 || 
                reelComp.reelindex === reelMachineComp.getLastLockNRollReelIndex()) {
                SlotSoundController.Instance().playAudio("ReelStop", "FX");
            }
        } 
        // 普通模式逻辑
        else {
            if (slotManager.isSkipCurrentSpin === 0 || 
                reelComp.reelindex === slotManager.reelMachine.reels.length - 1) {
                SlotSoundController.Instance().playAudio("ReelStop", "FX");
            }
        }
    }

    /**
     * 处理旋转结束逻辑
     * @param callback 旋转结束后的回调函数
     */
    processSpinEnd(callback?: () => void): void {
        if (this.lockNRoll_Reel) {
            const reelComp = this.node.getComponent(Reel);
            if (!reelComp) return;

            const reelIndex = reelComp.reelindex;
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            
            const windowIdx = Math.floor(reelIndex / 3);
            const symbolIdx = Math.floor(reelIndex % 3);

            // 隐藏9开头符号的滚轮（Lock&Roll模式）
            if (TSUtility.isValid(lastHistoryWindows)) {
                const symbolId = lastHistoryWindows.GetWindow(windowIdx).getSymbol(symbolIdx);
                if (Math.floor(symbolId / 10) === 9) {
                    this.node.active = false;
                }
            }
        }

        // 执行回调
        if (TSUtility.isValid(callback)) {
            callback();
        }
    }

    /**
     * 检查并播放普通模式下符号出现动画
     */
    checkAppearSymbol(): void {
        const reelComp = this.node.getComponent(Reel_BeeLovedJars);
        if (!reelComp) return;

        let hasJackpot = false;
        let hasWild = false;
        const gameResultMgr = SlotGameResultManager.Instance;
        
        // 获取当前滚轮对应的窗口数据
        const targetWindow = gameResultMgr.getHistoryWindows().length > 1 
            ? gameResultMgr.getHistoryWindow(0).GetWindow(reelComp.reelindex)
            : gameResultMgr.getLastHistoryWindows().GetWindow(reelComp.reelindex);

        if (TSUtility.isValid(targetWindow)) {
            // 遍历窗口内所有符号
            for (let a = 0; a < targetWindow.size; ++a) {
                const symbolId = targetWindow.getSymbol(a);
                
                // 处理Jackpot符号（9开头，Math.floor(i/9)=10 为原代码逻辑，保留）
                if (Math.floor(symbolId / 9) === 10) {
                    const reelIdx = reelComp.reelindex;
                    const symbolIdx = a;
                    const symbolInfo = gameResultMgr.getResultSymbolInfoArray()[reelIdx][symbolIdx];
                    
                    // 播放符号动画并设置信息
                    const animNode = SymbolAnimationController.Instance.playAnimationSymbolAbsoluteCoordinate(
                        reelComp.reelindex, a, symbolId + 100
                    );
                    const jackpotComp = animNode.getComponent(JackpotSymbolComponent_BeeLovedJars);
                    if (jackpotComp) jackpotComp.setInfo(symbolInfo);
                    
                    // 隐藏原符号
                    reelComp.hideSymbolInRowForAppear(a);
                    hasJackpot = true;
                }

                // 处理Wild符号（71）
                if (symbolId === 71) {
                    // 播放Wild动画
                    SymbolAnimationController.Instance.playAnimationSymbolAbsoluteCoordinate(
                        reelComp.reelindex, a, symbolId + 100
                    );
                    // 隐藏原符号
                    reelComp.hideSymbolInRowForAppear(a);
                    // 触发奖池移动事件
                    EventBus.emit("movePot", reelComp.reelindex, a);
                    hasWild = true;
                }
            }

            // 播放对应音效
            if (hasJackpot) {
                SlotSoundController.Instance().stopAudio("JackpotAppear", "FX");
                SlotSoundController.Instance().playAudio("JackpotAppear", "FX");
            }
            if (hasWild) {
                SlotSoundController.Instance().playAudio("WildAppear", "FX");
            }
        }

        // 重置符号动画的Z轴层级
        SymbolAnimationController.Instance.resetZorderSymbolAnimation();
    }

    /**
     * 检查并播放免费旋转模式下符号出现动画（92号符号）
     */
    checkAppearFreeSpinSymbol(): void {
        const reelComp = this.node.getComponent(Reel_BeeLovedJars);
        if (!reelComp) return;

        let hasJackpot2 = false;
        const gameResultMgr = SlotGameResultManager.Instance;
        
        // 获取当前滚轮对应的窗口数据
        const targetWindow = gameResultMgr.getHistoryWindows().length > 1 
            ? gameResultMgr.getHistoryWindow(0).GetWindow(reelComp.reelindex)
            : gameResultMgr.getLastHistoryWindows().GetWindow(reelComp.reelindex);

        if (TSUtility.isValid(targetWindow)) {
            // 遍历窗口内所有符号
            for (let o = 0; o < targetWindow.size; ++o) {
                const symbolId = targetWindow.getSymbol(o);
                
                // 处理免费旋转模式Jackpot符号（92）
                if (symbolId === 92) {
                    const reelIdx = reelComp.reelindex;
                    const symbolIdx = o;
                    const symbolInfo = gameResultMgr.getResultSymbolInfoArray()[reelIdx][symbolIdx];
                    
                    // 播放符号动画并设置信息
                    const animNode = SymbolAnimationController.Instance.playAnimationSymbolAbsoluteCoordinate(
                        reelComp.reelindex, o, symbolId + 300
                    );
                    const jackpotComp = animNode.getComponent(JackpotSymbolComponent_BeeLovedJars);
                    if (jackpotComp) jackpotComp.setInfo(symbolInfo);
                    
                    // 设置原符号信息并隐藏
                    const originSymbolNode = reelComp.getSymbol(o);
                    const originJackpotComp = originSymbolNode.getComponent(JackpotSymbolComponent_BeeLovedJars);
                    if (originJackpotComp) originJackpotComp.setInfo(symbolInfo);
                    reelComp.hideSymbolInRowForAppear(o);
                    
                    hasJackpot2 = true;
                }
            }

            // 播放Jackpot2出现音效
            if (hasJackpot2) {
                SlotSoundController.Instance().playAudio("Jackpot2Appear", "FX");
            }
        }
    }

    /**
     * 检查并处理Lock&Roll模式下符号出现逻辑
     */
    checkAppeSymbol_LockNRoll(): void {
        const reelComp = this.node.getComponent(Reel);
        if (!reelComp) return;

        const reelIndex = reelComp.reelindex;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const historyWindows = SlotGameResultManager.Instance.getHistoryWindows();
        
        const windowIdx = Math.floor(reelIndex / 3);
        const symbolIdx = Math.floor(reelIndex % 3);

        if (TSUtility.isValid(lastHistoryWindows)) {
            let symbolId = lastHistoryWindows.GetWindow(windowIdx).getSymbol(symbolIdx);
            
            // 检查是否有96号符号，有则替换
            if (Math.floor(symbolId / 10) === 9) {
                for (let s = 0; s < historyWindows.length; s++) {
                    if (historyWindows[s].GetWindow(windowIdx).getSymbol(symbolIdx) === 96) {
                        symbolId = 96;
                        break;
                    }
                }
            }

            // 设置Lock组件的出现符号
            const beeMgr = BeeLovedJarsManager.getInstance();
            const lockComp = beeMgr.game_components.lockComponent.getComponent(LockComponent_BeeLovedJars);
            lockComp.setAppearSymbol(windowIdx, symbolIdx, symbolId);
        }
    }

    /**
     * 获取排除预旋转的滚轮旋转状态（基于旋转请求时间）
     * @param stopWindows 滚轮停止窗口数据（可选）
     * @param reelMachine 滚轮管理器实例（可选）
     * @returns 有序状态对象
     */
    getSpinExcludePreSpinUsingSpinRequestTimeState(
        stopWindows?: Window, 
        reelMachine?: any
    ): SequencialState {
        const self = this;
        const seqState = new SequencialState();
        
        // 滚轮未激活则直接返回空状态
        if (!this.node.active) return seqState;

        let stateIdx = 0;
        const reelComp = this.node.getComponent(Reel);
        if (!reelComp) return seqState;

        // 确定停止窗口和滚轮管理器
        const targetStopWindows = stopWindows ?? SlotGameResultManager.Instance.getReelStopWindows();
        const targetReelMachine = reelMachine ?? SlotManager.Instance.reelMachine;
        
        // 获取游戏配置
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelComp.reelindex];

        // 1. 添加滚轮旋转到停止前的状态（更新前）
        const spinUntilStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReelRenewal(
            targetReelMachine.reels, reelComp, reelStrip, subGameKey
        );
        spinUntilStopState.flagSkipActive = true;
        spinUntilStopState.addOnStartCallback(() => {
            reelComp.setShaderValue("blurOffset", 0.02);
        });
        seqState.insert(stateIdx++, spinUntilStopState);

        // 2. 添加滚轮更新状态
        const reelRenewalState = this.getReelSpinStateCurrentReelRenewal(
            targetReelMachine.reels, reelComp, reelStrip, subGameKey
        );
        reelRenewalState.flagSkipActive = true;
        seqState.insert(stateIdx++, reelRenewalState);

        // 解析缓动配置
        const easingType = spinControlInfo?.postEasingType;
        const easingRate = spinControlInfo?.postEasingRate;
        const easingDuration = spinControlInfo?.postEasingDuration;
        const easingDistance = spinControlInfo?.postEasingDistance;

        // 3. 获取结果符号列表并添加移动状态
        const symbolList = this.getResultSymbolList(targetStopWindows.GetWindow(reelComp.reelindex), reelComp);
        const symbolInfoList = this.getResultSymbolInfoList(targetStopWindows.GetWindow(reelComp.reelindex), reelComp);
        const specialSymbolInfoList = this.getResultSpecialSymbolInfoList(targetStopWindows.GetWindow(reelComp.reelindex), reelComp);

        const easingInfo = new EasingInfo();
        easingInfo.easingType = easingType;
        easingInfo.easingDistance = easingDistance;
        easingInfo.easingDuration = easingDuration;
        easingInfo.easingRate = easingRate;
        easingInfo.onEasingStartFuncList.push(() => {
            self.setShowExpectEffects(false);
        });
        this.addEasingFuncListOnStopEasing(easingInfo);

        const reelMoveState = this.getReelMoveStateWithLastSymbolList(
            reelComp, symbolList, subGameKey, easingInfo, symbolInfoList, specialSymbolInfoList
        );
        reelMoveState.addOnEndCallback(() => {
            // 第4个滚轮停止时停止旋转音效
            if (reelComp.reelindex === 4) {
                SlotManager.Instance.stopReelSpinSound();
            }
        });
        seqState.insert(stateIdx++, reelMoveState);

        // 4. 添加旋转结束重置状态
        const resetState = new State();
        resetState.addOnStartCallback(() => {
            reelComp.resetPositionOfReelComponents();
            reelComp.setShaderValue("blurOffset", 0);
            // 最后一个滚轮停止时重置主音量
            if (reelComp.reelindex === targetReelMachine.reels.length - 1) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }
            SlotManager.Instance.setPlayReelExpectEffectState(reelComp.reelindex + 1);
            self.processSpinEnd(() => resetState.setDone());
        });
        seqState.insert(stateIdx++, resetState);

        return seqState;
    }

    /**
     * 获取滚轮更新时的旋转状态
     * @param reels 滚轮数组
     * @param reelComp 滚轮组件
     * @param reelStrip 滚轮条数据
     * @param subGameKey 子游戏标识
     * @returns 状态对象
     */
    getReelSpinStateCurrentReelRenewal(
        reels: ReelController_Base[], 
        reelComp: Reel, 
        reelStrip: any, 
        subGameKey: string
    ): State {
        const self = this;
        const state = new State();
        let moveAction: any = null;

        state.addOnStartCallback(() => {
            // 设置滚轮旋转方向为向下
            reelComp.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            // 检查空白符号并控制下一个符号索引
            reelStrip.checkBlankSymbolAndControlNextSymbolIndex(reelComp);

            // 获取旋转速度配置
            const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reelComp.reelindex];
            const oneSymbolMoveSpeed = spinControlInfo?.oneSymbolMoveSpeed;
            const maxSpeedInExpectEffect = spinControlInfo?.maxSpeedInExpectEffect;

            // 计算旋转时间和速度
            const spinRequestTime = SlotManager.Instance.getTimeSecSpinRequest();
            const spinTime = reelComp.getReelSpinTimeRenewal(reels, spinRequestTime, subGameKey);
            const moveSpeed = SlotUIRuleManager.Instance.getExpectEffectFlag(reelComp.reelindex, SlotGameResultManager.Instance.getVisibleSlotWindows()) 
                ? maxSpeedInExpectEffect 
                : oneSymbolMoveSpeed;
            const symbolMoveCount = Math.floor(spinTime / moveSpeed);

            // 创建移动动作
            const moveDistance = symbolMoveCount * reelComp.symbolHeight;
            const moveByAction = cc.moveBy(spinTime, new cc.Vec2(0, -moveDistance));
            
            // 设置下一个符号回调
            reelComp.setNextSymbolIdCallback(() => {
                const nextSymbolId = reelStrip.getNextSymbolId();
                reelStrip.increaseNextSymbolIndex();
                return nextSymbolId;
            });

            // 执行移动动作
            moveAction = reelComp.node.runAction(cc.sequence(moveByAction, cc.callFunc(() => state.setDone())));
        });

        state.addOnEndCallback(() => {
            // 停止未完成的动作
            if (moveAction && !moveAction.isDone()) {
                reelComp.node.stopAction(moveAction);
            }
            reelComp.update();

            // 非Lock&Roll模式且是最后一个滚轮时，设置旋转状态为不可跳过
            const reelMachineComp = SlotManager.Instance.reelMachine.getComponent(ReelMachine_BeeLovedJars);
            const lastReelIndex = this.lockNRoll_Reel 
                ? reelMachineComp.getLastLockNRollReelIndex() 
                : SlotManager.Instance.reelMachine.reels.length - 1;
            
            if (!this.lockNRoll_Reel && reelComp.reelindex === lastReelIndex) {
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE);
            }
        });

        return state;
    }

    /**
     * 获取带最后符号列表的滚轮移动状态（外层封装）
     * @param reelComp 滚轮组件
     * @param symbolList 符号列表
     * @param subGameKey 子游戏标识
     * @param easingInfo 缓动信息
     * @param symbolInfoList 符号信息列表（可选）
     * @param specialSymbolInfoList 特殊符号信息列表（可选）
     * @returns 有序状态对象
     */
    getReelMoveStateWithLastSymbolList(
        reelComp: Reel, 
        symbolList: number[], 
        subGameKey: string, 
        easingInfo?: EasingInfo, 
        symbolInfoList?: any[], 
        specialSymbolInfoList?: SpecialSymbolInfo[]
    ): SequencialState {
        const seqState = new SequencialState();
        let stateIdx = 0;

        // 添加核心移动状态
        seqState.insert(stateIdx++, this.getReelMoveStateWithLastSymbolListNew(
            reelComp, symbolList, subGameKey, easingInfo, symbolInfoList, specialSymbolInfoList
        ));
        // 添加旋转结束事件状态
        seqState.insert(stateIdx++, this.getSpinEndEventState());

        return seqState;
    }

    /**
     * 获取带最后符号列表的滚轮移动状态（核心实现）
     * @param reelComp 滚轮组件
     * @param symbolList 符号列表
     * @param subGameKey 子游戏标识
     * @param easingInfo 缓动信息（可选）
     * @param symbolInfoList 符号信息列表（可选）
     * @param specialSymbolInfoList 特殊符号信息列表（可选）
     * @returns 状态对象
     */
    getReelMoveStateWithLastSymbolListNew(
        reelComp: Reel, 
        symbolList: number[], 
        subGameKey: string, 
        easingInfo?: EasingInfo, 
        symbolInfoList?: any[], 
        specialSymbolInfoList?: SpecialSymbolInfo[]
    ): State {
        const self = this;
        const state = new State();
        let moveAction: any = null;
        
        // 符号索引计数器
        let symbolIdx = 0;
        let symbolInfoIdx = 0;
        let specialSymbolInfoIdx = 0;
        
        // 获取旋转控制配置
        const spinControlInfo = subGameKey ? SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelComp.reelindex] : null;
        const symbolHeight = spinControlInfo?.symbolHeight || 0;
        const oneSymbolMoveSpeed = spinControlInfo?.oneSymbolMoveSpeed || 0;

        state.addOnStartCallback(() => {
            // 设置旋转方向为向下
            reelComp.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            
            // 计算移动距离和时间
            const lastSymbol = reelComp.getLastSymbol();
            if (!lastSymbol) {
                state.setDone();
                return;
            }

            const currentY = reelComp.getPositionY(lastSymbol.node.y);
            const bufferOffset = reelComp.bufferRow * symbolHeight;
            
            let totalMoveDistance = 0;
            let easingMoveDistance = 0;
            
            // 计算基础移动距离
            if (easingInfo) {
                totalMoveDistance = currentY + (symbolList.length * symbolHeight - easingInfo.easingDistance) - bufferOffset;
                easingMoveDistance = easingInfo.easingDistance;
            } else {
                totalMoveDistance = currentY + symbolList.length * symbolHeight - bufferOffset;
            }
            
            const moveTime = Math.abs(oneSymbolMoveSpeed * (totalMoveDistance / symbolHeight));

            // 设置符号回调函数
            reelComp.setNextSymbolIdCallback(() => {
                if (symbolIdx >= symbolList.length) return undefined;
                const symbolId = symbolList[symbolIdx];
                symbolIdx++;
                return symbolId;
            });

            reelComp.setNextSymbolInfoCallback(() => {
                if (!symbolInfoList || symbolInfoIdx >= symbolInfoList.length) return null;
                const symbolInfo = symbolInfoList[symbolInfoIdx];
                symbolInfoIdx++;
                return symbolInfo;
            });

            reelComp.setNextSpecialInfoCallback(() => {
                const defaultSpecialInfo = new SpecialSymbolInfo(SpecialType.NONE);
                if (!specialSymbolInfoList || specialSymbolInfoIdx >= specialSymbolInfoList.length) return defaultSpecialInfo;
                const specialInfo = specialSymbolInfoList[specialSymbolInfoIdx];
                specialSymbolInfoIdx++;
                return specialInfo;
            });

            // 创建基础移动动作
            const baseMoveAction = cc.moveBy(moveTime, new cc.Vec2(0, -totalMoveDistance));
            let easingMoveAction: any = null;

            // 创建缓动动作（如果有配置）
            if (easingInfo && easingInfo.easingDuration && easingMoveDistance > 0) {
                const easeFunc = ReelSpinBehaviors.Instance.getEaseAction(easingInfo.easingType, easingInfo.easingRate);
                easingMoveAction = cc.moveBy(easingInfo.easingDuration, new cc.Vec2(0, -easingMoveDistance)).easing(easeFunc);
            }

            // 符号出现检查回调
            const checkSymbolAppearAction = cc.callFunc(() => {
                const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                if (currentSubGameKey === "base") {
                    self.checkAppearSymbol();
                } else if (currentSubGameKey === "freeSpin") {
                    self.checkAppearFreeSpinSymbol();
                } else {
                    self.checkAppeSymbol_LockNRoll();
                }
            });

            // 旋转结束回调
            const spinEndAction = cc.callFunc(() => {
                state.setDone();
                // 基础模式下重置滚轮层级
                if (SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult() === "base") {
                    reelComp.resetAllSiblingIndex();
                    reelComp.onOverSizeSortFunction();
                }
            });

            // 缓动开始回调
            const easingStartAction = cc.callFunc(() => {
                if (easingInfo?.onEasingStartFuncList) {
                    easingInfo.onEasingStartFuncList.forEach(func => func());
                }
            });

            // 组装动作序列
            const actionSequence: any[] = [];
            actionSequence.push(baseMoveAction);

            if (easingMoveAction) {
                if (easingInfo?.onEasingStartFuncList?.length) {
                    actionSequence.push(easingStartAction);
                    actionSequence.push(checkSymbolAppearAction);
                }
                actionSequence.push(easingMoveAction);
            }
            
            actionSequence.push(spinEndAction);

            // 执行动作
            moveAction = reelComp.node.runAction(cc.sequence(actionSequence));
        });

        state.addOnEndCallback(() => {
            // 停止未完成的动作
            if (moveAction) {
                reelComp.node.stopAction(moveAction);
            }

            // 补充剩余符号到滚轮顶部
            while (symbolIdx < symbolList.length) {
                const symbolId = symbolList[symbolIdx];
                const symbolInfo = symbolInfoList && symbolInfoIdx < symbolInfoList.length ? symbolInfoList[symbolInfoIdx] : null;
                reelComp.pushSymbolAtTopOfReel(symbolId, symbolInfo);
                symbolIdx++;
                symbolInfoIdx++;
            }

            // 重置滚轮组件位置
            reelComp.resetPositionOfReelComponents();
            
            // 基础模式下处理旋转停止后逻辑
            if (SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult() === "base") {
                reelComp.processAfterStopSpin();
            }
        });

        return state;
    }

    /**
     * 获取基础模式下基于下一个子游戏Key的无限旋转状态
     * @returns 无限旋转状态
     */
    getInfiniteSpinUsingNextSubGameKeyState_Base(): State {
        SlotGameResultManager.Instance.getNextSubGameKey();
        return ReelSpinBehaviors.Instance.getInfiniteSpinStatePreResponseResult(
            this.node.getComponent(Reel), "base"
        );
    }

    /**
     * 获取Lock&Roll模式下的滚轮旋转状态
     * @returns 有序状态对象
     */
    getLockAndRollState(): SequencialState {
        const self = this;
        const seqState = new SequencialState();
        
        // 滚轮未激活则返回空状态
        if (!this.node.active) return seqState;

        let stateIdx = 0;
        const reelComp = this.node.getComponent(Reel);
        if (!reelComp) return seqState;

        // 获取游戏配置和数据
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const lastWindows = SlotGameResultManager.Instance.getSubGameState(subGameKey).lastWindows;
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelComp.reelindex];
        const reelMachineComp = SlotManager.Instance.reelMachine.getComponent(ReelMachine_BeeLovedJars);
        const lockNRollReels = reelMachineComp.lockNRoll_Reels;

        // 1. 添加滚轮旋转到停止前的状态
        const spinUntilStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReelRenewal(
            lockNRollReels, reelComp, reelStrip, subGameKey
        );
        spinUntilStopState.flagSkipActive = true;
        spinUntilStopState.addOnStartCallback(() => {
            reelComp.setShaderValue("blurOffset", 0.02);
        });
        seqState.insert(stateIdx++, spinUntilStopState);

        // 2. 添加滚轮更新状态
        const reelRenewalState = this.getReelSpinStateCurrentReelRenewal(
            lockNRollReels, reelComp, reelStrip, subGameKey
        );
        reelRenewalState.flagSkipActive = true;
        seqState.insert(stateIdx++, reelRenewalState);

        // 解析缓动配置
        const easingType = spinControlInfo?.postEasingType;
        const easingRate = spinControlInfo?.postEasingRate;
        const easingDuration = spinControlInfo?.postEasingDuration;
        const easingDistance = spinControlInfo?.postEasingDistance;

        // 3. 获取Lock&Roll结果窗口和符号列表
        const resultWindow = this.getLockAndRollResultWindow(lastWindows, reelComp.reelindex);
        const symbolList = this.getResultSymbolListLockNRoll(resultWindow, reelComp);
        const symbolInfoList = this.getResultSymbolInfoListLockAndRoll(resultWindow, reelComp.reelindex);

        // 构建缓动信息
        const easingInfo = new EasingInfo();
        easingInfo.easingType = easingType;
        easingInfo.easingDistance = easingDistance;
        easingInfo.easingDuration = easingDuration;
        easingInfo.easingRate = easingRate;
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 添加滚轮移动状态
        const reelMoveState = this.getReelMoveStateWithLastSymbolListNew(
            reelComp, symbolList, subGameKey, easingInfo, symbolInfoList
        );
        seqState.insert(stateIdx++, reelMoveState);

        // 4. 添加重置状态
        const resetState = new State();
        resetState.addOnStartCallback(() => {
            reelComp.resetPositionOfReelComponents();
            self.processSpinEnd(() => resetState.setDone());
        });
        seqState.insert(stateIdx++, resetState);

        return seqState;
    }

    /**
     * 获取Lock&Roll模式的结果窗口
     * @param lastWindows 最后历史窗口数据
     * @param reelIndex 滚轮索引
     * @returns 结果窗口对象
     */
    getLockAndRollResultWindow(lastWindows: any[], reelIndex: number): Window {
        const resultWindow = new Window(3);
        const windowIdx = Math.floor(reelIndex / 3);
        const symbolIdx = Math.floor(reelIndex % 3);
        const targetSymbolId = lastWindows[windowIdx][symbolIdx];

        // 随机设置上下占位符号，中间为目标符号
        const randomDummy1 = this.lockNRollDummySymboList[Math.floor(Math.random() * this.lockNRollDummySymboList.length)];
        const randomDummy2 = this.lockNRollDummySymboList[Math.floor(Math.random() * this.lockNRollDummySymboList.length)];
        
        resultWindow.setSymbol(0, randomDummy1);
        resultWindow.setSymbol(1, targetSymbolId);
        resultWindow.setSymbol(2, randomDummy2);

        return resultWindow;
    }

    /**
     * 获取Lock&Roll模式的结果符号列表
     * @param resultWindow 结果窗口
     * @param reelComp 滚轮组件
     * @returns 符号列表
     */
    getResultSymbolListLockNRoll(resultWindow: Window, reelComp: Reel): number[] {
        const symbolList: number[] = [];
        // 计算需要补充的符号数量
        const needAddCount = resultWindow.size < (reelComp.visibleRow + 2 * reelComp.bufferRow) 
            ? (reelComp.visibleRow + 2 * reelComp.bufferRow - resultWindow.size) / 2 
            : 0;

        // 倒序添加窗口内符号
        for (let a = resultWindow.size - 1; a >= 0; --a) {
            symbolList.push(resultWindow.getSymbol(a));
        }

        // 补充占位符号
        for (let i = 0; i < needAddCount; ++i) {
            const randomDummy = this.lockNRollDummySymboList[Math.floor(Math.random() * this.lockNRollDummySymboList.length)];
            symbolList.push(randomDummy);
        }

        return symbolList;
    }

    /**
     * 获取Lock&Roll模式的结果符号信息列表
     * @param resultWindow 结果窗口
     * @param reelIndex 滚轮索引
     * @returns 符号信息列表
     */
    getResultSymbolInfoListLockAndRoll(resultWindow: Window, reelIndex: number): any[] | null {
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
        const lastSymbolInfoWindow = subGameState.lastSymbolInfoWindow;
        
        const windowIdx = Math.floor(reelIndex / 3);
        const symbolIdx = Math.floor(reelIndex % 3);

        // 无符号信息则返回null
        if (!lastSymbolInfoWindow || !lastSymbolInfoWindow[windowIdx] || !lastSymbolInfoWindow[windowIdx][symbolIdx]) {
            return null;
        }

        // 构建符号信息列表（仅中间位置有信息）
        const symbolInfoList: any[] = [];
        for (let s = 0; s < 3; s++) {
            if (s === 1) {
                symbolInfoList.push(lastSymbolInfoWindow[windowIdx][symbolIdx]);
            } else {
                symbolInfoList.push(null);
            }
        }

        return symbolInfoList;
    }

    /**
     * 获取普通模式的结果符号列表
     * @param resultWindow 结果窗口
     * @param reelComp 滚轮组件
     * @returns 符号列表
     */
    getResultSymbolList(resultWindow: Window, reelComp: Reel): number[] {
        const symbolList: number[] = [];
        let hasJackpot = false;
        let hasWild = false;

        // 检查窗口内是否有Jackpot(90)或Wild(71)符号
        for (let i = resultWindow.size - 1; i >= 0; --i) {
            const symbolId = resultWindow.getSymbol(i);
            if (symbolId === 90) {
                hasJackpot = true;
                break;
            }
            if (symbolId === 71) {
                hasWild = true;
                break;
            }
        }

        // 确定占位符号列表
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const defaultDummyList = subGameKey === "freeSpin" ? this.freeSpinDummy : this.noWildDummy;
        const targetDummyList = subGameKey === "freeSpin" 
            ? this.freeSpinDummy 
            : hasJackpot ? this.noJackpotDummy : hasWild ? this.noWildDummy : this.dummySymbolList;

        // 计算需要补充的符号数量
        const needAddCount = resultWindow.size < (reelComp.visibleRow + 2 * reelComp.bufferRow) 
            ? (reelComp.visibleRow + 2 * reelComp.bufferRow - resultWindow.size) / 2 
            : 0;

        // 随机标识（控制占位符号选择）
        const isRandom = Math.random() < 0.5;
        // 非首尾滚轮才启用随机逻辑
        const enableRandom = reelComp.reelindex !== 0 && reelComp.reelindex !== 4;

        // 添加首个占位符号
        if (enableRandom && resultWindow.getSymbol(resultWindow.size - 1) < 20 && isRandom) {
            symbolList.push(targetDummyList[Math.floor(Math.random() * targetDummyList.length)]);
        } else {
            symbolList.push(defaultDummyList[Math.floor(Math.random() * defaultDummyList.length)]);
        }

        // 倒序添加窗口内符号
        for (let i = resultWindow.size - 1; i >= 0; --i) {
            symbolList.push(resultWindow.getSymbol(i));
        }

        // 补充末尾占位符号
        for (let d = 0; d < needAddCount; ++d) {
            if (enableRandom && isRandom && resultWindow.getSymbol(0) < 20) {
                symbolList.push(targetDummyList[Math.floor(Math.random() * targetDummyList.length)]);
            } else {
                symbolList.push(defaultDummyList[Math.floor(Math.random() * defaultDummyList.length)]);
            }
        }

        return symbolList;
    }

    /**
     * 获取结果符号信息列表
     * @param resultWindow 结果窗口
     * @param reelComp 滚轮组件
     * @returns 符号信息列表
     */
    getResultSymbolInfoList(resultWindow: Window, reelComp: Reel): any[] | null {
        const gameResult = SlotGameResultManager.Instance._gameResult;
        // 无符号信息则返回null
        if (!gameResult?.spinResult?.symbolInfoWindow || !gameResult.spinResult.symbolInfoWindow[reelComp.reelindex]) {
            return null;
        }

        const symbolInfoList: any[] = [];
        const targetSymbolInfo = gameResult.spinResult.symbolInfoWindow[reelComp.reelindex];
        
        // 添加首个空信息
        symbolInfoList.push(null);

        // 补充空信息到匹配窗口长度
        if (resultWindow.size >= targetSymbolInfo.length) {
            const needAddNullCount = (resultWindow.size - targetSymbolInfo.length) / 2;
            for (let i = 0; i < needAddNullCount; ++i) {
                symbolInfoList.push(null);
            }
            // 倒序添加符号信息
            for (let i = targetSymbolInfo.length - 1; i >= 0; --i) {
                symbolInfoList.push(targetSymbolInfo[i]);
            }
        }

        return symbolInfoList;
    }

    /**
     * 获取结果特殊符号信息列表
     * @param resultWindow 结果窗口
     * @param reelComp 滚轮组件
     * @returns 特殊符号信息列表
     */
    getResultSpecialSymbolInfoList(resultWindow: Window, reelComp: Reel): SpecialSymbolInfo[] {
        const specialSymbolInfoList: SpecialSymbolInfo[] = [];
        // 计算需要补充的符号数量
        const needAddCount = resultWindow.size < (reelComp.visibleRow + 2 * reelComp.bufferRow) 
            ? (reelComp.visibleRow + 2 * reelComp.bufferRow - resultWindow.size) / 2 
            : 0;

        // 添加首个空特殊信息
        specialSymbolInfoList.push(new SpecialSymbolInfo(SpecialType.NONE));

        // 获取窗口范围并遍历符号
        const windowRange = SlotManager.Instance.getWindowRange();
        for (let i = resultWindow.size - 1; i >= 0; --i) {
            let specialType = SpecialType.NONE;
            
            // 检查是否为FEVER类型特殊符号
            if (TSUtility.isValid(windowRange[reelComp.reelindex])) {
                const [start, end] = windowRange[reelComp.reelindex];
                if (start <= i && i < end && SlotManager.Instance.isCheckSpecialInfo(SpecialType.FEVER, reelComp.reelindex, i)) {
                    specialType |= SpecialType.FEVER;
                }
            }

            specialSymbolInfoList.push(new SpecialSymbolInfo(specialType));
        }

        // 补充末尾空特殊信息
        for (let s = 0; s < needAddCount; ++s) {
            specialSymbolInfoList.push(new SpecialSymbolInfo(SpecialType.NONE));
        }

        return specialSymbolInfoList;
    }
}