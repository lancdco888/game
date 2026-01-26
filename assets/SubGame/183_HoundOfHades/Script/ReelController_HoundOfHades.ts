const { ccclass, property } = cc._decorator;

import ReelController_Base from '../../../Script/ReelController_Base';
import ReelSpinBehaviors, { EasingInfo } from '../../../Script/ReelSpinBehaviors';
import Reel from '../../../Script/Slot/Reel';
import SlotSoundController from '../../../Script/Slot/SlotSoundController';
import State, { SequencialState } from '../../../Script/Slot/State';
import SymbolAnimationController from '../../../Script/Slot/SymbolAnimationController';
import SlotUIRuleManager from '../../../Script/Slot/rule/SlotUIRuleManager';
import TSUtility from '../../../Script/global_utility/TSUtility';
import SlotGameResultManager from '../../../Script/manager/SlotGameResultManager';
import SlotGameRuleManager from '../../../Script/manager/SlotGameRuleManager';
import SlotManager, { SpecialSymbolInfo, SpecialType } from '../../../Script/manager/SlotManager';
import SoundManager from '../../../Script/manager/SoundManager';
import HoundOfHadesManager from './HoundOfHadesManager';
import ReelMachine_HoundOfHades from './ReelMachine_HoundOfHades';
import { Window } from '../../../Script/manager/SlotGameRuleManager';


/**
 * 哈迪斯之犬 - 滚轮控制器
 * 继承自基础滚轮控制器，实现基础模式/LockNRoll模式的滚轮旋转、停止、符号检测、动画/音效控制
 */
@ccclass()
export default class ReelController_HoundOfHades extends ReelController_Base {
    // ====== 私有成员变量（符号列表配置）======
    private lockNRollDummySymboList: number[] = [9, 10, 11, 12, 13, 14, 21, 22, 23, 24, 31];
    private firstReelDummySymbolList: number[] = [9, 10, 11, 12, 13, 14, 21, 22, 23, 24, 31, 61, 62, 63, 71];
    public dummySymbolList: number[] = [9, 10, 11, 12, 13, 14, 21, 22, 23, 24, 31, 71, 61, 62, 63];

    /**
     * 节点加载初始化
     */
    onLoad() {
        super.onLoad();
        const self = this;

        // 补充滚轮停止时的缓动回调（重置模糊、停止音效）
        this.easingFuncListOnSpinEnd.push(() => {
            const reel = self.node.getComponent(Reel);
            if (!reel) return;

            self.playReelStopSound();
            reel.setShaderValue("blurOffset", 0);
            
            // 第4个滚轮停止时关闭旋转音效
            if (reel.reelindex === 4) {
                SlotSoundController.Instance().stopAudio("ReelSpin", "FXLoop");
                SlotSoundController.Instance().stopAudio("ReelExpect", "FX");
            }
        });
    }

    /**
     * 播放滚轮停止音效（区分基础/LockNRoll模式）
     */
    playReelStopSound() {
        const reel = this.node.getComponent(Reel);
        if (!reel) return;

        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const slotManager = SlotManager.Instance;

        // 基础模式：最后一个滚轮播放停止音效
        if (currentSubGameKey === "base") {
            if (slotManager.isSkipCurrentSpin || reel.reelindex === slotManager.reelMachine.reels.length - 1) {
                SlotSoundController.Instance().playAudio("ReelStop", "FX");
            }
        } 
        // LockNRoll模式：最后一个激活的LockNRoll滚轮播放停止音效
        else {
            const reelMachine = slotManager.reelMachine.getComponent(ReelMachine_HoundOfHades);
            const lastLockNRollIndex = reelMachine.getLastLockNRollReelIndex();
            
            if (slotManager.isSkipCurrentSpin || reel.reelindex === lastLockNRollIndex) {
                SlotSoundController.Instance().playAudio("ReelStop", "FX");
            }
        }
    }

    /**
     * 处理滚轮旋转结束逻辑（区分基础/LockNRoll模式）
     * @param callback 旋转结束回调
     */
    processSpinEnd(callback?: () => void) {
        const reel = this.node.getComponent(Reel);
        if (!reel) {
            callback?.();
            return;
        }

        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const lastBonusIndex = this.lastBonusReelIndex();

        // 基础模式：需要更新猎犬时延迟2秒执行回调
        if (currentSubGameKey === "base") {
            const houndsComponent = HoundOfHadesManager.getInstance().game_components._houndsComponent;
            if (houndsComponent?.isUpdateHound() && reel.reelindex === lastBonusIndex) {
                this.scheduleOnce(() => {
                    if (TSUtility.isValid(callback)) callback();
                }, 2);
                return;
            }
        } 
        // LockNRoll模式：检查滚轮显示/隐藏状态
        else {
            this.checkAppearHideReel_LockNRoll(reel.reelindex);
        }

        // 直接执行回调
        if (TSUtility.isValid(callback)) callback();
    }

    /**
     * 获取最后一个包含奖励符号的滚轮索引
     * @returns 奖励滚轮索引
     */
    lastBonusReelIndex(): number {
        let bonusReelIndex = 0;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();

        // 遍历5个滚轮，3行符号，查找奖励符号（十位为1的符号）
        for (let n = 0; n < 5; n++) {
            for (let o = 0; o < 3; o++) {
                const symbol = lastHistoryWindows.GetWindow(n).getSymbol(o);
                // 符号十位为1（如1x）判定为奖励符号
                if (Math.floor(symbol / 6) === 10) {
                    bonusReelIndex = n;
                }
            }
        }
        return bonusReelIndex;
    }

    /**
     * 基础模式：检查并处理出现的特殊符号（播放动画、移动罐值）
     */
    checkAppearSymbol_Base() {
        const reel = this.node.getComponent(Reel);
        if (!reel) return;

        const visibleWindows = SlotGameResultManager.Instance.getVisibleSlotWindows();
        const window = visibleWindows.GetWindow(reel.reelindex);
        if (!TSUtility.isValid(window)) return;

        let hasSpecialSymbol = false;

        // 遍历当前滚轮的所有可见符号
        for (let o = 0; o < window.size; ++o) {
            const symbol = window.getSymbol(o);
            // 检测奖励符号（十位为1）
            if (Math.floor(symbol / 6) === 10) {
                // 播放符号动画
                SymbolAnimationController.Instance.playAnimationSymbolAbsoluteCoordinate(reel.reelindex, o, symbol + 105);
                // 隐藏该行符号
                reel.hideSymbolInRow(o);
                // 移动罐值
                HoundOfHadesManager.getInstance().game_components.movePot.moveSymbol(symbol, reel.reelindex, o);
                hasSpecialSymbol = true;
            }
        }

        // 有特殊符号时播放音效
        if (hasSpecialSymbol) {
            SlotSoundController.Instance().playAudio("MovePot", "FX");
            SlotSoundController.Instance().playAudio("BonusAppear", "FX");
        }

        // 触发旋转结束事件
        this.getSpinEndEventState().onStart();
    }

    /**
     * LockNRoll模式：检查并处理出现的特殊符号
     * @param reelIndex 滚轮索引
     */
    checkAppearSymbol_LockNRoll(reelIndex: number) {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        if (!TSUtility.isValid(lastHistoryWindows)) return;

        // 计算滚轮行列
        const n = Math.floor(reelIndex / 3);
        const o = Math.floor(reelIndex % 3);
        const symbol = lastHistoryWindows.GetWindow(n).getSymbol(o);

        // 检测目标符号（161/162/163/191）
        if ([161, 162, 163, 191].includes(symbol)) {
            HoundOfHadesManager.getInstance().game_components.lockComponent.setAppearSymbol(n, o, symbol);
        }
    }

    /**
     * LockNRoll模式：检查并处理滚轮的显示/隐藏
     * @param reelIndex 滚轮索引
     */
    checkAppearHideReel_LockNRoll(reelIndex: number) {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        if (!TSUtility.isValid(lastHistoryWindows)) return;

        // 计算滚轮行列
        const n = Math.floor(reelIndex / 3);
        const o = Math.floor(reelIndex % 3);
        const symbol = lastHistoryWindows.GetWindow(n).getSymbol(o);

        // 检测目标符号（161/162/163/191）
        if ([161, 162, 163, 191].includes(symbol)) {
            HoundOfHadesManager.getInstance().game_components.lockComponent.setHideReel(n, o, symbol);
        }
    }

    /**
     * 获取基于下一个子游戏Key的无限旋转状态
     * @returns 无限旋转状态对象
     */
    getInfiniteSpinUsingNextSubGameKeyState(): State {
        const reel = this.node.getComponent(Reel);
        if (!reel) return new State();

        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        return ReelSpinBehaviors.Instance.getInfiniteSpinStatePreResponseResult(reel, nextSubGameKey);
    }

    /**
     * 获取基础模式的无限旋转状态
     * @returns 无限旋转状态对象
     */
    getInfiniteSpinUsingNextSubGameKeyState_Base(): State {
        const reel = this.node.getComponent(Reel);
        if (!reel) return new State();

        SlotGameResultManager.Instance.getNextSubGameKey();
        return ReelSpinBehaviors.Instance.getInfiniteSpinStatePreResponseResult(reel, "base");
    }

    /**
     * 获取排除预旋转的滚轮旋转状态（基于旋转请求时间）
     * @param reelStopWindows 滚轮停止窗口（可选）
     * @param reelMachine 滚轮机实例（可选）
     * @returns 顺序状态对象
     */
    getSpinExcludePreSpinUsingSpinRequestTimeState(
        reelStopWindows?: Window,
        reelMachine?: any // 实际应为ReelMachine_Base，根据项目类型调整
    ): SequencialState {
        const self = this;
        reelStopWindows = reelStopWindows ?? null;
        const sequentialState = new SequencialState();

        // 节点未激活时返回空状态
        if (!this.node.active) return sequentialState;

        let index = 0;
        const reel = this.node.getComponent(Reel);
        if (!reel) return sequentialState;

        // 确定滚轮停止窗口和滚轮机实例
        const targetStopWindows = reelStopWindows ?? SlotGameResultManager.Instance.getReelStopWindows();
        const targetReelMachine = reelMachine ?? SlotManager.Instance.reelMachine;

        // 获取子游戏配置和滚轮控制信息
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(currentSubGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(currentSubGameKey).infoList[reel.reelindex];

        // 1. 添加滚轮旋转到停止前的状态
        const spinUntilStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReelRenewal(
            targetReelMachine.reels, reel, reelStrip, currentSubGameKey
        );
        spinUntilStopState.flagSkipActive = true;
        spinUntilStopState.addOnStartCallback(() => {
            reel.setShaderValue("blurOffset", 0.02);
            
            // 下一个特效开启时调整音量、播放音效、显示期望特效
            if (HoundOfHadesManager.getInstance().getNextEffect()) {
                SoundManager.Instance().setMainVolumeTemporarily(0.1);
                if (reel.reelindex === 0) {
                    SlotSoundController.Instance().playAudio("ReelExpect", "FX");
                }
                SlotManager.Instance.reelMachine.reels[0].setShowExpectEffects(true);
            }
        });
        sequentialState.insert(index++, spinUntilStopState);

        // 2. 添加滚轮更新状态
        const reelRenewalState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReelRenewal(
            targetReelMachine.reels, reel, reelStrip, currentSubGameKey
        );
        reelRenewalState.flagSkipActive = true;
        sequentialState.insert(index++, reelRenewalState);

        // 提取缓动参数
        const postEasingType = spinControlInfo?.postEasingType;
        const postEasingRate = spinControlInfo?.postEasingRate;
        const postEasingDuration = spinControlInfo?.postEasingDuration;
        const postEasingDistance = spinControlInfo?.postEasingDistance;

        // 3. 获取结果符号列表和信息
        const resultSymbolList = this.getResultSymbolList(targetStopWindows.GetWindow(reel.reelindex), reel);
        const resultSymbolInfoList = this.getResultSymbolInfoList(targetStopWindows.GetWindow(reel.reelindex), reel);
        const resultSpecialSymbolInfoList = this.getResultSpecialSymbolInfoList(targetStopWindows.GetWindow(reel.reelindex), reel);

        // 构建缓动信息
        const easingInfo = new EasingInfo();
        easingInfo.easingType = postEasingType;
        easingInfo.easingDistance = postEasingDistance;
        easingInfo.easingDuration = postEasingDuration;
        easingInfo.easingRate = postEasingRate;
        easingInfo.onEasingStartFuncList.push(() => {});
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 4. 添加滚轮移动状态
        const reelMoveState = this.getReelMoveStateWithLastSymbolList(reel, resultSymbolList, currentSubGameKey, easingInfo, resultSymbolInfoList, resultSpecialSymbolInfoList);
        reelMoveState.addOnEndCallback(() => {
            self.setShowExpectEffects(false);
            if (reel.reelindex === 4) {
                SlotManager.Instance.stopReelSpinSound();
            }
        });
        sequentialState.insert(index++, reelMoveState);

        // 5. 添加旋转结束处理状态
        const endState = new State();
        endState.addOnStartCallback(() => {
            reel.resetPositionOfReelComponents();
            reel.setShaderValue("blurOffset", 0);
            
            // 最后一个滚轮时重置音量
            if (reel.reelindex === targetReelMachine.reels.length - 1) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }

            SlotManager.Instance.setPlayReelExpectEffectState(reel.reelindex + 1);
            self.processSpinEnd(endState.setDone.bind(endState));
        });
        sequentialState.insert(index++, endState);

        return sequentialState;
    }

    /**
     * 获取结果符号列表（补充虚拟符号）
     * @param window 滚轮窗口
     * @param reel 滚轮实例
     * @returns 符号列表
     */
    getResultSymbolList(window: any, reel: Reel): number[] {
        const symbolList: number[] = [];
        let offset = 0;

        // 计算补充的虚拟符号数量
        if (window.size < reel.visibleRow + 2 * reel.bufferRow) {
            offset = (reel.visibleRow + 2 * reel.bufferRow - window.size) / 2;
        }

        // 头部添加随机虚拟符号
        symbolList.push(this.lockNRollDummySymboList[Math.floor(Math.random() * this.lockNRollDummySymboList.length)]);

        // 添加窗口内的符号（倒序）
        for (let a = window.size - 1; a >= 0; --a) {
            symbolList.push(window.getSymbol(a));
        }

        // 尾部添加随机虚拟符号
        for (let i = 0; i < offset; ++i) {
            symbolList.push(this.lockNRollDummySymboList[Math.floor(Math.random() * this.lockNRollDummySymboList.length)]);
        }

        return symbolList;
    }

    /**
     * 获取结果特殊符号信息列表
     * @param window 滚轮窗口
     * @param reel 滚轮实例
     * @returns 特殊符号信息列表
     */
    getResultSpecialSymbolInfoList(window: any, reel: Reel): SpecialSymbolInfo[] {
        const specialInfoList: SpecialSymbolInfo[] = [];
        let offset = 0;

        // 计算补充的虚拟符号数量
        if (window.size < reel.visibleRow + 2 * reel.bufferRow) {
            offset = (reel.visibleRow + 2 * reel.bufferRow - window.size) / 2;
        }

        // 头部添加空特殊符号信息
        specialInfoList.push(new SpecialSymbolInfo(SpecialType.NONE));

        // 添加窗口内的特殊符号信息
        const windowRange = SlotManager.Instance.getWindowRange();
        for (let i = window.size - 1; i >= 0; --i) {
            let specialType = SpecialType.NONE;
            
            if (TSUtility.isValid(windowRange[reel.reelindex])) {
                // 检测FEVER类型特殊符号
                if (windowRange[reel.reelindex][0] <= i && i < windowRange[reel.reelindex][1]) {
                    if (SlotManager.Instance.isCheckSpecialInfo(SpecialType.FEVER, reel.reelindex, i)) {
                        specialType |= SpecialType.FEVER;
                    }
                }
            }

            specialInfoList.push(new SpecialSymbolInfo(specialType));
        }

        // 尾部添加空特殊符号信息
        for (let s = 0; s < offset; ++s) {
            specialInfoList.push(new SpecialSymbolInfo(SpecialType.NONE));
        }

        return specialInfoList;
    }

    /**
     * 获取LockNRoll模式的滚轮旋转状态
     * @returns 顺序状态对象
     */
    getLockAndRollState(): SequencialState {
        const self = this;
        const sequentialState = new SequencialState();

        // 节点未激活时返回空状态
        if (!this.node.active) return sequentialState;

        let index = 0;
        const reel = this.node.getComponent(Reel);
        if (!reel) return sequentialState;

        // 获取子游戏配置和滚轮控制信息
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(currentSubGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(currentSubGameKey).infoList[reel.reelindex];
        const reelMachine = SlotManager.Instance.reelMachine.getComponent(ReelMachine_HoundOfHades);
        const lockNRollReels = reelMachine.lockNRollReels;

        // 1. 添加滚轮旋转到停止前的状态
        const spinUntilStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReelRenewal(
            lockNRollReels, reel, reelStrip, currentSubGameKey
        );
        spinUntilStopState.flagSkipActive = true;
        spinUntilStopState.addOnStartCallback(() => {
            reel.setShaderValue("blurOffset", 0.02);
        });
        sequentialState.insert(index++, spinUntilStopState);

        // 2. 添加滚轮更新状态
        const reelRenewalState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReel(reel, reelStrip, currentSubGameKey);
        reelRenewalState.flagSkipActive = true;
        sequentialState.insert(index++, reelRenewalState);

        // 提取缓动参数
        const postEasingType = spinControlInfo?.postEasingType;
        const postEasingRate = spinControlInfo?.postEasingRate;
        const postEasingDuration = spinControlInfo?.postEasingDuration;
        const postEasingDistance = spinControlInfo?.postEasingDistance;

        // 3. 获取LockNRoll结果窗口和符号信息
        const lastWindows = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey).lastWindows;
        const resultWindow = this.getLockAndRollResultWindow(lastWindows, reel.reelindex);
        const resultSymbolList = this.getResultSymbolList(resultWindow, reel);
        const resultSymbolInfoList = this.getResultSymbolInfoListLockAndRoll(resultWindow, reel.reelindex);

        // 构建缓动信息
        const easingInfo = new EasingInfo();
        easingInfo.easingType = postEasingType;
        easingInfo.easingDistance = postEasingDistance;
        easingInfo.easingDuration = postEasingDuration;
        easingInfo.easingRate = postEasingRate;
        easingInfo.onEasingStartFuncList.push(() => {});
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 4. 添加滚轮移动状态
        const reelMoveState = this.getReelMoveStateWithLastSymbolListNew(reel, resultSymbolList, currentSubGameKey, easingInfo, resultSymbolInfoList);
        reelMoveState.addOnEndCallback(() => {});
        sequentialState.insert(index++, reelMoveState);

        // 5. 添加旋转结束处理状态
        const endState = new State();
        endState.addOnStartCallback(() => {
            reel.resetPositionOfReelComponents();
            self.processSpinEnd(endState.setDone.bind(endState));
        });
        sequentialState.insert(index++, endState);

        return sequentialState;
    }

    /**
     * 包装滚轮移动状态（兼容旧接口）
     * @param reel 滚轮实例
     * @param symbolList 符号列表
     * @param subGameKey 子游戏Key
     * @param easingInfo 缓动信息
     * @param symbolInfoList 符号信息列表（可选）
     * @param specialInfoList 特殊符号信息列表（可选）
     * @returns 顺序状态对象
     */
    getReelMoveStateWithLastSymbolList(
        reel: Reel,
        symbolList: number[],
        subGameKey: string,
        easingInfo: EasingInfo,
        symbolInfoList?: any[], // 根据项目实际类型调整
        specialInfoList?: SpecialSymbolInfo[]
    ): SequencialState {
        symbolInfoList = symbolInfoList ?? null;
        specialInfoList = specialInfoList ?? null;

        const sequentialState = new SequencialState();
        sequentialState.insert(0, this.getReelMoveStateWithLastSymbolListNew(reel, symbolList, subGameKey, easingInfo, symbolInfoList, specialInfoList));
        return sequentialState;
    }

    /**
     * 获取滚轮移动状态（核心逻辑）
     * @param reel 滚轮实例
     * @param symbolList 符号列表
     * @param subGameKey 子游戏Key
     * @param easingInfo 缓动信息
     * @param symbolInfoList 符号信息列表（可选）
     * @param specialInfoList 特殊符号信息列表（可选）
     * @returns 状态对象
     */
    getReelMoveStateWithLastSymbolListNew(
        reel: Reel,
        symbolList: number[],
        subGameKey: string,
        easingInfo: EasingInfo,
        symbolInfoList?: any[],
        specialInfoList?: SpecialSymbolInfo[]
    ): State {
        const self = this;
        symbolInfoList = symbolInfoList ?? null;
        specialInfoList = specialInfoList ?? null;

        const moveState = new State();
        let tweenAction: any = null; // 动画动作对象
        let symbolIndex = 0;
        let infoIndex = 0;
        let specialIndex = 0;

        // 滚轮控制参数
        let symbolHeight = 0;
        let oneSymbolMoveSpeed = 0;
        let maxSpeedInExpectEffect = 0;

        // 获取滚轮控制配置
        if (subGameKey) {
            const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reel.reelindex];
            symbolHeight = spinControlInfo.symbolHeight;
            oneSymbolMoveSpeed = spinControlInfo.oneSymbolMoveSpeed;
            maxSpeedInExpectEffect = spinControlInfo.maxSpeedInExpectEffect;
        }

        moveState.addOnStartCallback(() => {
            // 设置滚轮旋转方向为向下
            reel.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);

            // 计算移动距离和速度
            const lastSymbol = reel.getLastSymbol();
            const lastSymbolPosY = reel.getPositionY(lastSymbol.node.y);
            const bufferRowOffset = reel.bufferRow * symbolHeight;

            let moveDistance = 0;
            let easingDistance = 0;

            if (easingInfo) {
                moveDistance = lastSymbolPosY + (symbolList.length * symbolHeight - easingInfo.easingDistance) - bufferRowOffset;
                easingDistance = easingInfo.easingDistance;
            } else {
                moveDistance = lastSymbolPosY + symbolList.length * symbolHeight - bufferRowOffset;
            }

            // 计算移动时间（区分期望特效）
            const moveTime = (HoundOfHadesManager.getInstance() as HoundOfHadesManager).getNextEffect() 
                ? Math.abs(maxSpeedInExpectEffect * (moveDistance / symbolHeight))
                : Math.abs(oneSymbolMoveSpeed * (moveDistance / symbolHeight));

            // 设置符号回调（逐行推送符号）
            reel.setNextSymbolIdCallback(() => {
                if (symbolIndex >= symbolList.length) return undefined;
                const symbol = symbolList[symbolIndex];
                symbolIndex++;
                return symbol;
            });

            // 设置符号信息回调
            reel.setNextSymbolInfoCallback(() => {
                let info = null;
                if (symbolInfoList && symbolInfoList.length > infoIndex) {
                    info = symbolInfoList[infoIndex];
                    infoIndex++;
                }
                return info;
            });

            // 设置特殊符号信息回调
            reel.setNextSpecialInfoCallback(() => {
                let specialInfo = new SpecialSymbolInfo(0);
                if (specialInfoList && specialInfoList.length > specialIndex) {
                    specialInfo = specialInfoList[specialIndex];
                    specialIndex++;
                }
                return specialInfo;
            });

            // 创建基础移动动作
            const baseMoveAction = cc.moveBy(moveTime, new cc.Vec2(0, -moveDistance));
            let easingMoveAction:cc.ActionInterval = null;

            // 创建缓动动作
            if (easingInfo) {
                const easeFunc = ReelSpinBehaviors.Instance.getEaseAction(easingInfo.easingType, easingInfo.easingRate);
                easingMoveAction = cc.moveBy(easingInfo.easingDuration, new cc.Vec2(0, -easingDistance)).easing(easeFunc);
            }

            // 符号检测回调
            const symbolCheckCallback = cc.callFunc(() => {
                const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                if (currentSubGameKey === "base") {
                    self.checkAppearSymbol_Base();
                } else {
                    self.checkAppearSymbol_LockNRoll(reel.reelindex);
                }
            });

            // 状态完成回调
            const doneCallback = cc.callFunc(() => {
                moveState.setDone();
            });

            // 缓动开始回调
            const easingStartCallback = cc.callFunc(() => {
                easingInfo.onEasingStartFuncList.forEach(func => func());
            });

            // 组合动作并执行
            if (!easingMoveAction) {
                tweenAction = reel.node.runAction(cc.sequence(baseMoveAction, doneCallback));
            } else if (easingInfo.onEasingStartFuncList.length > 0) {
                tweenAction = reel.node.runAction(cc.sequence(baseMoveAction, easingStartCallback, symbolCheckCallback, easingMoveAction, doneCallback));
            } else {
                tweenAction = reel.node.runAction(cc.sequence(baseMoveAction, symbolCheckCallback, easingMoveAction, doneCallback));
            }
        });

        // 状态结束回调（清理剩余符号）
        moveState.addOnEndCallback(() => {
            // 停止动画
            if (tweenAction) reel.node.stopAction(tweenAction);

            // 推送剩余符号到滚轮顶部
            while (symbolIndex < symbolList.length) {
                if (symbolIndex < symbolList.length) {
                    const symbol = symbolList[symbolIndex];
                    if (symbolInfoList && symbolInfoList.length > infoIndex) {
                        symbolInfoList[infoIndex];
                    }
                    reel.pushSymbolAtTopOfReel(symbol, null);
                } else {
                    cc.error("invalid status tweenAction");
                }
                symbolIndex++;
                infoIndex++;
            }

            // 重置滚轮组件位置
            reel.resetPositionOfReelComponents();
        });

        return moveState;
    }

    /**
     * 获取LockNRoll模式的结果窗口（补充虚拟符号）
     * @param lastWindows 历史窗口数据
     * @param reelIndex 滚轮索引
     * @returns 结果窗口
     */
    getLockAndRollResultWindow(lastWindows: any[], reelIndex: number): Window {
        const resultWindow = new Window(3);
        const n = Math.floor(reelIndex / 3);
        const o = Math.floor(reelIndex % 3);
        const targetSymbol = lastWindows[n][o];

        // 顶部添加随机虚拟符号
        resultWindow.setSymbol(0, this.lockNRollDummySymboList[Math.floor(Math.random() * this.lockNRollDummySymboList.length)]);
        // 中间添加目标符号
        resultWindow.setSymbol(1, targetSymbol);
        // 底部添加随机虚拟符号
        resultWindow.setSymbol(2, this.lockNRollDummySymboList[Math.floor(Math.random() * this.lockNRollDummySymboList.length)]);

        return resultWindow;
    }

    /**
     * 获取LockNRoll模式的结果符号信息列表
     * @param window 滚轮窗口
     * @param reelIndex 滚轮索引
     * @returns 符号信息列表
     */
    getResultSymbolInfoListLockAndRoll(window: Window, reelIndex: number): any[] | null {
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const subGameState = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey);
        
        const n = Math.floor(reelIndex / 3);
        const o = Math.floor(reelIndex % 3);

        // 检查符号信息是否存在
        if (!subGameState.lastSymbolInfoWindow || !subGameState.lastSymbolInfoWindow[n] || !subGameState.lastSymbolInfoWindow[n][o]) {
            return null;
        }

        // 构建符号信息列表（仅中间位置有有效信息）
        const symbolInfoList: any[] = [];
        for (let r = 0; r < 3; r++) {
            if (r === 1) {
                symbolInfoList.push(subGameState.lastSymbolInfoWindow[n][o]);
            } else {
                symbolInfoList.push(null);
            }
        }

        return symbolInfoList;
    }
}