const { ccclass, property } = cc._decorator;

import ReelController_Base from "../../ReelController_Base";
import Reel from "../../Slot/Reel";
import Reel_Zhuquefortune from "./Reel_Zhuquefortune";
import ReelMachine_Zhuquefortune from "./ReelMachine_Zhuquefortune";
import ZhuquefortuneManager, { EventBus } from "./ZhuquefortuneManager";
import SlotGameRuleManager, { Window } from "../../manager/SlotGameRuleManager";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import TSUtility from "../../global_utility/TSUtility";
import SlotManager, { SpecialSymbolInfo, SpecialType } from "../../manager/SlotManager";
import State, { SequencialState } from "../../Slot/State";
import SlotUIRuleManager from "../../Slot/rule/SlotUIRuleManager";
import ReelSpinBehaviors, { EasingInfo } from "../../ReelSpinBehaviors";
import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SoundManager from "../../manager/SoundManager";
import SlotSoundController from "../../Slot/SlotSoundController";
import SymbolAnimationController from "../../Slot/SymbolAnimationController";
import JackpotSymbolComponent_Zhuquefortune from "./JackpotSymbolComponent_Zhuquefortune";
import LockComponent_Zhuquefortune from "./LockComponent_Zhuquefortune";

/**
 * 朱雀财富滚轮控制器类
 * 继承自基础ReelController_Base，扩展Lock&Roll模式、Jackpot符号检测、专属旋转逻辑等功能
 */
@ccclass()
export default class ReelController_Zhuquefortune extends ReelController_Base {
    // ===== 编辑器可配置属性（对应原JS的property定义，补充TS类型）=====
    /** 是否为Lock&Roll模式滚轮 */
    @property
    public lockNRoll_Reel: boolean = false;

    // ===== 私有业务常量（补充TS类型注解，保留原业务逻辑）=====
    /** Lock&Roll模式下的虚拟符号列表 */
    private lockNRollDummySymboList: number[] = [0, 90, 0, 0];

    /** 无Wild符号的虚拟列表 */
    private noWildDummy: number[] = [12, 13, 14, 21, 22, 23, 24, 31, 90];

    /** 无Jackpot符号的虚拟列表 */
    private noJackpotDummy: number[] = [12, 13, 14, 21, 22, 23, 24, 31, 71];

    /** 旋转结束缓动回调列表（继承自父类，补充类型提示） */
    public easingFuncListOnSpinEnd: (() => void)[] = [];

    // ===== 生命周期方法 =====
    /**
     * 节点加载完成回调（初始化虚拟符号列表、注册旋转结束回调）
     */
    onLoad(): void {
        const reelComp = this.node.getComponent(Reel);
        if (!reelComp) return;

        // 1. 根据滚轮索引初始化虚拟符号列表
        const reelIndex = reelComp.reelindex;
        this.dummySymbolList = (reelIndex === 0 || reelIndex === 4)
            ? [12, 13, 14, 21, 22, 23, 24, 31, 90]
            : [12, 13, 14, 21, 22, 23, 24, 31, 71, 90];

        // 2. 注册旋转结束后的音效停止回调
        this.easingFuncListOnSpinEnd.push(() => {
            this.playReelStopSound();
            SlotSoundController.Instance()?.stopAudio("ReelExpect", "FX");
        });
    }

    // ===== 公共业务方法（实现朱雀专属滚轮控制逻辑）=====
    /**
     * 播放滚轮停止音效（区分Lock&Roll模式和普通模式）
     */
    public playReelStopSound(): void {
        const reelComp = this.node.getComponent(Reel);
        if (!reelComp) return;

        const slotManager = SlotManager.Instance;
        const reelMachine = slotManager.reelMachine.getComponent(ReelMachine_Zhuquefortune);
        if (!reelMachine) return;

        // 1. 判断是否跳过当前旋转
        if (slotManager.isSkipCurrentSpin === 0) return;

        // 2. 区分模式获取最后一个滚轮索引
        const lastReelIndex = this.lockNRoll_Reel
            ? reelMachine.getLastLockNRollReelIndex()
            : reelMachine.reels.length - 1;

        // 3. 仅最后一个滚轮播放停止音效
        if (reelComp.reelindex !== lastReelIndex) return;
        SlotSoundController.Instance()?.playAudio("ReelStop", "FX");
    }

    /**
     * 处理滚轮旋转结束逻辑（区分Lock&Roll模式，执行回调）
     * @param callback 旋转结束后的回调函数
     */
    public processSpinEnd(callback?: () => void): void {
        if (this.lockNRoll_Reel) {
            const reelComp = this.node.getComponent(Reel);
            if (!reelComp) return;

            const reelIndex = reelComp.reelindex;
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            if (!TSUtility.isValid(lastHistoryWindows)) return;

            // 计算窗口索引和符号索引
            const windowIndex = Math.floor(reelIndex / 3);
            const symbolIndex = Math.floor(reelIndex % 3);
            const targetWindow = lastHistoryWindows.GetWindow(windowIndex);
            const symbolId = targetWindow?.getSymbol(symbolIndex) || 0;

            // 隐藏Jackpot相关符号滚轮
            const isJackpotSymbol = Math.floor(symbolId / 10) === 9 || symbolId === 100;
            if (isJackpotSymbol) {
                this.node.opacity = 255;
                this.node.active = false;
            }
        }

        // 执行外部回调
        if (TSUtility.isValid(callback)) {
            callback();
        }
    }

    /**
     * 检测普通模式下出现的特殊符号（Jackpot），播放动画并发送事件
     * @param callback 检测完成后的回调函数
     * @returns 是否检测到特殊符号
     */
    public checkAppearSymbol(callback?: () => void): boolean {
        let hasSpecialSymbol = false;
        let hasJackpot = false;

        const reelComp = this.node.getComponent(Reel_Zhuquefortune);
        if (!reelComp) return hasSpecialSymbol;

        // 1. 获取历史窗口数据
        const gameResultManager = SlotGameResultManager.Instance;
        const historyWindows = gameResultManager.getHistoryWindows();
        const targetWindow = historyWindows.length > 1
            ? gameResultManager.getHistoryWindow(0)?.GetWindow(reelComp.reelindex)
            : gameResultManager.getLastHistoryWindows()?.GetWindow(reelComp.reelindex);

        if (!TSUtility.isValid(targetWindow)) return hasSpecialSymbol;

        // 2. 遍历窗口符号，检测Jackpot符号
        const symbolInfoArray = gameResultManager.getResultSymbolInfoArray();
        for (let i = 0; i < targetWindow.size; i++) {
            const symbolId = targetWindow.getSymbol(i);
            if (Math.floor(symbolId / 9) !== 10) continue; // 筛选Jackpot专属符号

            // 3. 播放符号动画，设置Jackpot信息
            const reelIndex = reelComp.reelindex;
            const symbolInfo = symbolInfoArray?.[reelIndex]?.[i] || null;
            const animNode = SymbolAnimationController.Instance.playAnimationSymbolAbsoluteCoordinate(reelIndex, i, symbolId + 5);
            const jackpotComp = animNode?.getComponent(JackpotSymbolComponent_Zhuquefortune);
            jackpotComp?.setInfo(symbolInfo);

            // 4. 隐藏对应行符号，发送奖池移动事件
            reelComp.hideSymbolInRowForAppear(i);
            EventBus.emit("movePot", reelIndex, i);

            hasSpecialSymbol = true;
            hasJackpot = true;
        }

        // 5. 延迟执行回调，播放Jackpot音效
        if (hasSpecialSymbol) {
            this.scheduleOnce(() => {
                if (TSUtility.isValid(callback)) callback();
            }, 0.6);
        }

        if (hasJackpot) {
            SlotSoundController.Instance()?.stopAudio("JackpotAppear", "FX");
            SlotSoundController.Instance()?.playAudio("JackpotAppear", "FX");
        }

        return hasSpecialSymbol;
    }

    /**
     * 检测Lock&Roll模式下出现的特殊符号，更新锁组件状态
     */
    public checkAppeSymbol_LockNRoll(): void {
        const reelComp = this.node.getComponent(Reel);
        if (!reelComp) return;

        const reelIndex = reelComp.reelindex;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        if (!TSUtility.isValid(lastHistoryWindows)) return;

        // 1. 计算窗口索引和符号索引
        const windowIndex = Math.floor(reelIndex / 3);
        const symbolIndex = Math.floor(reelIndex % 3);
        const targetWindow = lastHistoryWindows.GetWindow(windowIndex);
        let symbolId = targetWindow?.getSymbol(symbolIndex) || 0;

        // 2. 处理Jackpot符号，更新锁组件
        const isJackpotOrSpecial = Math.floor(symbolId / 10) === 9 || Math.floor(symbolId / 10) === 10;
        if (isJackpotOrSpecial) {
            symbolId = Math.floor(symbolId / 10) === 10 ? 100 : symbolId;
            const zhuqueManager = ZhuquefortuneManager.getInstance();
            const lockComp = zhuqueManager?.game_components.lockComponent.getComponent(LockComponent_Zhuquefortune);
            lockComp.setAppearSymbol(windowIndex, symbolIndex, symbolId);
            this.node.opacity = 0;
        }
    }

    /**
     * 获取排除预旋转的旋转状态（基于旋转请求时间）
     * @param reelStopWindow 滚轮停止窗口（可选）
     * @param reelMachine 滚轮机实例（可选）
     * @returns 封装后的时序状态对象
     */
    public getSpinExcludePreSpinUsingSpinRequestTimeState(
        reelStopWindow?: Window,
        reelMachine?: ReelMachine_Zhuquefortune
    ): SequencialState {
        const sequenceState = new SequencialState();
        if (!this.node.active) return sequenceState;

        // 1. 初始化基础参数
        const reelComp = this.node.getComponent(Reel);
        if (!reelComp) return sequenceState;

        const targetReelStopWindow = reelStopWindow || SlotGameResultManager.Instance.getReelStopWindows();
        const targetReelMachine = reelMachine || (SlotManager.Instance.reelMachine.getComponent(ReelMachine_Zhuquefortune) as ReelMachine_Zhuquefortune);
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reelComp.reelindex];
        if (!reelStrip || !spinControlInfo) return sequenceState;

        let stateIndex = 0;

        // 2. 构建滚轮旋转至停止前的状态
        const spinUntilStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReelRenewal(
            targetReelMachine.reels,
            reelComp,
            reelStrip,
            subGameKey
        );
        spinUntilStopState.flagSkipActive = true;
        spinUntilStopState.addOnStartCallback(() => {
            reelComp.setShaderValue("blurOffset", 0.02);
        });
        sequenceState.insert(stateIndex++, spinUntilStopState);

        // 3. 构建滚轮旋转更新状态
        const reelRenewalState = this.getReelSpinStateCurrentReelRenewal(
            targetReelMachine.reels,
            reelComp,
            reelStrip,
            subGameKey
        );
        reelRenewalState.flagSkipActive = true;
        sequenceState.insert(stateIndex++, reelRenewalState);

        // 4. 构建缓动信息
        const easingInfo = new EasingInfo();
        easingInfo.easingType = spinControlInfo.postEasingType;
        easingInfo.easingDistance = spinControlInfo.postEasingDistance;
        easingInfo.easingDuration = spinControlInfo.postEasingDuration;
        easingInfo.easingRate = spinControlInfo.postEasingRate;
        easingInfo.onEasingStartFuncList.push(() => {
            this.setShowExpectEffects(false);
        });
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 5. 构建滚轮移动状态
        const resultWindow = targetReelStopWindow.GetWindow(reelComp.reelindex);
        const symbolList = this.getResultSymbolList(resultWindow, reelComp);
        const symbolInfoList = this.getResultSymbolInfoList(resultWindow, reelComp);
        const specialSymbolInfoList = this.getResultSpecialSymbolInfoList(resultWindow, reelComp);

        const reelMoveState = this.getReelMoveStateWithLastSymbolListNew(
            reelComp,
            symbolList,
            subGameKey,
            easingInfo,
            symbolInfoList,
            specialSymbolInfoList
        );
        reelMoveState.addOnEndCallback(() => {
            if (reelComp.reelindex === 4) {
                SlotManager.Instance.stopReelSpinSound();
            }
        });
        sequenceState.insert(stateIndex++, reelMoveState);

        // 6. 构建旋转结束后的重置状态
        const resetState = new State();
        resetState.addOnStartCallback(() => {
            reelComp.resetPositionOfReelComponents();
            reelComp.setShaderValue("blurOffset", 0);

            if (reelComp.reelindex === targetReelMachine.reels.length - 1) {
                SoundManager.Instance()?.resetTemporarilyMainVolume();
            }

            if (reelComp.reelindex === 2 || reelComp.reelindex === 4) {
                SlotManager.Instance.setPlayReelExpectEffectState(reelComp.reelindex + 2);
            }

            this.processSpinEnd(resetState.setDone.bind(resetState));
        });
        sequenceState.insert(stateIndex++, resetState);

        return sequenceState;
    }

    /**
     * 获取当前滚轮旋转更新状态（处理旋转速度、移动距离）
     * @param reelArray 滚轮数组
     * @param reelComp 滚轮组件
     * @param reelStrip 滚轮符号条
     * @param subGameKey 子游戏密钥
     * @returns 封装后的状态对象
     */
    public getReelSpinStateCurrentReelRenewal(
        reelArray: any[],
        reelComp: Reel,
        reelStrip: any,
        subGameKey: string
    ): State {
        const spinState = new State();
        let moveAction: cc.Action = null;

        // 1. 旋转开始回调
        spinState.addOnStartCallback(() => {
            reelComp.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            reelStrip.checkBlankSymbolAndControlNextSymbolIndex(reelComp);

            // 获取旋转控制配置
            const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reelComp.reelindex];
            const oneSymbolMoveSpeed = spinControlInfo?.oneSymbolMoveSpeed || 0;
            const maxSpeedInExpectEffect = spinControlInfo?.maxSpeedInExpectEffect || 0;

            // 计算旋转时间和移动距离
            const spinRequestTime = SlotManager.Instance.getTimeSecSpinRequest();
            const spinTime = reelComp.getReelSpinTimeRenewal(reelArray, spinRequestTime, subGameKey);
            const moveSpeed = SlotUIRuleManager.Instance.getExpectEffectFlag(reelComp.reelindex, SlotGameResultManager.Instance.getVisibleSlotWindows())
                ? maxSpeedInExpectEffect
                : oneSymbolMoveSpeed;
            const symbolMoveCount = Math.floor(spinTime / moveSpeed);
            const moveDistance = symbolMoveCount * reelComp.symbolHeight;

            // 执行滚轮移动动作
            const moveByAction = cc.moveBy(spinTime, new cc.Vec2(0, -moveDistance));
            reelComp.setNextSymbolIdCallback(() => {
                const nextSymbolId = reelStrip.getNextSymbolId();
                reelStrip.increaseNextSymbolIndex();
                return nextSymbolId;
            });

            moveAction = reelComp.node.runAction(cc.sequence(moveByAction, cc.callFunc(() => spinState.setDone())));
        });

        // 2. 旋转结束回调
        spinState.addOnEndCallback(() => {
            if (moveAction && !moveAction.isDone()) {
                reelComp.node.stopAction(moveAction);
            }
            reelComp.update();

            // 更新旋转状态
            const lastReelIndex = this.lockNRoll_Reel
                ? SlotManager.Instance.reelMachine.getComponent(ReelMachine_Zhuquefortune)?.getLastLockNRollReelIndex() || 0
                : SlotManager.Instance.reelMachine.reels.length - 1;

            if (!this.lockNRoll_Reel && reelComp.reelindex === lastReelIndex) {
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE);
            }
        });

        return spinState;
    }

    /**
     * 获取滚轮移动状态（包含最终符号列表）
     * @param reelComp 滚轮组件
     * @param symbolList 符号列表
     * @param subGameKey 子游戏密钥
     * @param easingInfo 缓动信息
     * @param symbolInfoList 符号信息列表（可选）
     * @param specialSymbolInfoList 特殊符号信息列表（可选）
     * @returns 封装后的时序状态对象
     */
    public getReelMoveStateWithLastSymbolList(
        reelComp: Reel,
        symbolList: number[],
        subGameKey: string,
        easingInfo: EasingInfo,
        symbolInfoList?: any[],
        specialSymbolInfoList?: SpecialSymbolInfo[]
    ): SequencialState {
        const sequenceState = new SequencialState();
        let stateIndex = 0;

        // 插入滚轮移动核心状态和旋转结束事件状态
        sequenceState.insert(stateIndex++, this.getReelMoveStateWithLastSymbolListNew(
            reelComp,
            symbolList,
            subGameKey,
            easingInfo,
            symbolInfoList,
            specialSymbolInfoList
        ));
        sequenceState.insert(stateIndex++, this.getSpinEndEventState());

        return sequenceState;
    }

    /**
     * 获取滚轮移动核心状态（处理符号回调、缓动移动）
     * @param reelComp 滚轮组件
     * @param symbolList 符号列表
     * @param subGameKey 子游戏密钥
     * @param easingInfo 缓动信息（可选）
     * @param symbolInfoList 符号信息列表（可选）
     * @param specialSymbolInfoList 特殊符号信息列表（可选）
     * @returns 封装后的状态对象
     */
    public getReelMoveStateWithLastSymbolListNew(
        reelComp: Reel,
        symbolList: number[],
        subGameKey: string,
        easingInfo?: EasingInfo,
        symbolInfoList?: any[],
        specialSymbolInfoList?: SpecialSymbolInfo[]
    ): State {
        const moveState = new State();
        let moveAction: cc.Action | null = null;
        let symbolIndex = 0;
        let symbolInfoIndex = 0;
        let specialSymbolIndex = 0;

        // 获取旋转控制配置
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reelComp.reelindex];
        const symbolHeight = spinControlInfo?.symbolHeight || reelComp.symbolHeight;
        const oneSymbolMoveSpeed = spinControlInfo?.oneSymbolMoveSpeed || 0;

        // 1. 移动开始回调
        moveState.addOnStartCallback(() => {
            reelComp.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            const lastSymbol = reelComp.getLastSymbol();
            if (!lastSymbol) {
                moveState.setDone();
                return;
            }

            // 计算移动距离和时间
            const symbolPositionY = reelComp.getPositionY(lastSymbol.node.y);
            const bufferOffset = reelComp.bufferRow * symbolHeight;
            let totalMoveDistance = symbolPositionY + (symbolList.length * symbolHeight) - bufferOffset;
            let easingDistance = 0;

            if (easingInfo) {
                totalMoveDistance = symbolPositionY + (symbolList.length * symbolHeight - easingInfo.easingDistance) - bufferOffset;
                easingDistance = easingInfo.easingDistance;
            }

            const moveTime = Math.abs(oneSymbolMoveSpeed * (totalMoveDistance / symbolHeight));

            // 设置符号回调函数
            reelComp.setNextSymbolIdCallback(() => {
                if (symbolIndex >= symbolList.length) return undefined;
                return symbolList[symbolIndex++];
            });

            reelComp.setNextSymbolInfoCallback(() => {
                if (!symbolInfoList || symbolInfoIndex >= symbolInfoList.length) return null;
                return symbolInfoList[symbolInfoIndex++];
            });

            reelComp.setNextSpecialInfoCallback(() => {
                const defaultSpecialInfo = new SpecialSymbolInfo(SpecialType.NONE);
                if (!specialSymbolInfoList || specialSymbolIndex >= specialSymbolInfoList.length) return defaultSpecialInfo;
                return specialSymbolInfoList[specialSymbolIndex++];
            });

            // 构建移动动作序列
            const baseMoveAction = cc.moveBy(moveTime, new cc.Vec2(0, -totalMoveDistance));
            let actionSequence: any[] = [baseMoveAction];

            if (easingInfo && easingInfo.easingDistance > 0) {
                // 添加缓动动作
                const easeAction = ReelSpinBehaviors.Instance.getEaseAction(easingInfo.easingType, easingInfo.easingRate);
                const easingMoveAction = cc.moveBy(easingInfo.easingDuration, new cc.Vec2(0, -easingDistance)).easing(easeAction);

                // 添加缓动开始回调
                if (easingInfo.onEasingStartFuncList.length > 0) {
                    const easingStartCallback = cc.callFunc(() => {
                        easingInfo.onEasingStartFuncList.forEach(func => func());
                    });
                    actionSequence.push(easingStartCallback);
                }

                // 添加特殊符号检测回调
                const symbolCheckCallback = cc.callFunc(() => {
                    if (subGameKey === "base") {
                        this.checkAppearSymbol();
                    } else {
                        this.checkAppeSymbol_LockNRoll();
                    }
                });

                actionSequence.push(symbolCheckCallback);
                actionSequence.push(easingMoveAction);
            }

            // 添加移动结束回调
            const moveEndCallback = cc.callFunc(() => {
                moveState.setDone();
                if (subGameKey === "base") {
                    reelComp.resetAllSiblingIndex();
                    reelComp.onOverSizeSortFunction();
                }
            });
            actionSequence.push(moveEndCallback);

            // 执行动作序列
            moveAction = reelComp.node.runAction(cc.sequence(actionSequence));
        });

        // 2. 移动结束回调
        moveState.addOnEndCallback(() => {
            if (moveAction) reelComp.node.stopAction(moveAction);

            // 补充剩余符号到滚轮顶部
            while (symbolIndex < symbolList.length) {
                const symbolId = symbolList[symbolIndex];
                reelComp.pushSymbolAtTopOfReel(symbolId, null);
                symbolIndex++;
                symbolInfoIndex++;
            }

            reelComp.resetPositionOfReelComponents();
            if (subGameKey === "base") {
                reelComp.processAfterStopSpin();
            }
        });

        return moveState;
    }

    /**
     * 获取无限旋转基础状态（使用下一个子游戏密钥）
     * @returns 封装后的无限旋转状态
     */
    public getInfiniteSpinUsingNextSubGameKeyState_Base(): State {
        SlotGameResultManager.Instance.getNextSubGameKey();
        const reelComp = this.node.getComponent(Reel);
        if (!reelComp) return new State();

        return ReelSpinBehaviors.Instance.getInfiniteSpinStatePreResponseResult(reelComp, "base");
    }

    /**
     * 获取Lock&Roll模式下的滚轮旋转状态
     * @returns 封装后的时序状态对象
     */
    public getLockAndRollState(): SequencialState {
        const sequenceState = new SequencialState();
        if (!this.node.active) return sequenceState;

        // 1. 初始化基础参数
        const reelComp = this.node.getComponent(Reel);
        if (!reelComp) return sequenceState;

        let stateIndex = 0;
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reelComp.reelindex];
        const reelMachine = SlotManager.Instance.reelMachine.getComponent(ReelMachine_Zhuquefortune);
        if (!reelStrip || !spinControlInfo || !reelMachine || !subGameState) return sequenceState;

        // 2. 构建滚轮旋转至停止前的状态
        const spinUntilStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReelRenewal(
            reelMachine.lockNRoll_Reels,
            reelComp,
            reelStrip,
            subGameKey
        );
        spinUntilStopState.flagSkipActive = true;
        spinUntilStopState.addOnStartCallback(() => {
            reelComp.setShaderValue("blurOffset", 0.02);
        });
        sequenceState.insert(stateIndex++, spinUntilStopState);

        // 3. 构建滚轮旋转更新状态
        const reelRenewalState = this.getReelSpinStateCurrentReelRenewal(
            reelMachine.lockNRoll_Reels,
            reelComp,
            reelStrip,
            subGameKey
        );
        reelRenewalState.flagSkipActive = true;
        sequenceState.insert(stateIndex++, reelRenewalState);

        // 4. 构建缓动信息
        const easingInfo = new EasingInfo();
        easingInfo.easingType = spinControlInfo.postEasingType;
        easingInfo.easingDistance = spinControlInfo.postEasingDistance;
        easingInfo.easingDuration = spinControlInfo.postEasingDuration;
        easingInfo.easingRate = spinControlInfo.postEasingRate;
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 5. 构建Lock&Roll结果窗口和符号列表
        const resultWindow = this.getLockAndRollResultWindow(subGameState.lastWindows, reelComp.reelindex);
        const symbolList = this.getResultSymbolListLockNRoll(resultWindow, reelComp);
        const symbolInfoList = this.getResultSymbolInfoListLockAndRoll(resultWindow, reelComp.reelindex);

        // 6. 构建滚轮移动状态
        const reelMoveState = this.getReelMoveStateWithLastSymbolListNew(
            reelComp,
            symbolList,
            subGameKey,
            easingInfo,
            symbolInfoList
        );
        sequenceState.insert(stateIndex++, reelMoveState);

        // 7. 构建旋转结束后的重置状态
        const resetState = new State();
        resetState.addOnStartCallback(() => {
            reelComp.resetPositionOfReelComponents();
            this.processSpinEnd(resetState.setDone.bind(resetState));
        });
        sequenceState.insert(stateIndex++, resetState);

        return sequenceState;
    }

    // ===== 私有辅助方法（构建Lock&Roll模式的结果数据）=====
    /**
     * 构建Lock&Roll模式的结果窗口
     * @param lastWindows 最后窗口数据
     * @param reelIndex 滚轮索引
     * @returns 封装后的窗口对象
     */
    private getLockAndRollResultWindow(lastWindows: any[][], reelIndex: number): Window {
        const resultWindow = new Window(3);
        const windowIndex = Math.floor(reelIndex / 3);
        const symbolIndex = Math.floor(reelIndex % 3);
        const targetSymbolId = lastWindows[windowIndex]?.[symbolIndex] || 0;

        // 填充虚拟符号和目标符号
        const randomDummySymbol = this.lockNRollDummySymboList[Math.floor(Math.random() * this.lockNRollDummySymboList.length)];
        resultWindow.setSymbol(0, randomDummySymbol);
        resultWindow.setSymbol(1, targetSymbolId);
        resultWindow.setSymbol(2, this.lockNRollDummySymboList[Math.floor(Math.random() * this.lockNRollDummySymboList.length)]);

        return resultWindow;
    }

    /**
     * 构建Lock&Roll模式的结果符号列表
     * @param resultWindow 结果窗口
     * @param reelComp 滚轮组件
     * @returns 符号列表数组
     */
    public getResultSymbolListLockNRoll(resultWindow: Window, reelComp: Reel): number[] {
        const symbolList: number[] = [];
        const requiredSymbolCount = reelComp.visibleRow + 2 * reelComp.bufferRow;
        const dummySymbolCount = Math.max(0, Math.floor((requiredSymbolCount - resultWindow.size) / 2));

        // 反向填充窗口符号
        for (let i = resultWindow.size - 1; i >= 0; i--) {
            symbolList.push(resultWindow.getSymbol(i));
        }

        // 补充虚拟符号
        for (let i = 0; i < dummySymbolCount; i++) {
            symbolList.push(this.lockNRollDummySymboList[Math.floor(Math.random() * this.lockNRollDummySymboList.length)]);
        }

        return symbolList;
    }

    /**
     * 构建Lock&Roll模式的结果符号信息列表
     * @param resultWindow 结果窗口
     * @param reelIndex 滚轮索引
     * @returns 符号信息列表数组
     */
    public getResultSymbolInfoListLockAndRoll(resultWindow: Window, reelIndex: number): any[] | null {
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
        if (!subGameState?.lastSymbolInfoWindow) return null;

        const windowIndex = Math.floor(reelIndex / 3);
        const symbolIndex = Math.floor(reelIndex % 3);
        const targetSymbolInfo = subGameState.lastSymbolInfoWindow[windowIndex]?.[symbolIndex];
        if (!targetSymbolInfo) return null;

        // 解析扩展映射字符串（朱雀专属逻辑）
        const zhuqueManager = ZhuquefortuneManager.getInstance();
        const exMapString = zhuqueManager?.parseExMapString();
        if (TSUtility.isValid(exMapString)) {
            subGameState.lastSymbolInfoWindow = exMapString;
        }

        // 构建符号信息列表（仅中间位置填充有效信息）
        const symbolInfoList: any[] = [];
        for (let i = 0; i < 3; i++) {
            symbolInfoList.push(i === 1 ? targetSymbolInfo : null);
        }

        return symbolInfoList;
    }

    /**
     * 构建普通模式的结果符号列表
     * @param resultWindow 结果窗口
     * @param reelComp 滚轮组件
     * @returns 符号列表数组
     */
    public getResultSymbolList(resultWindow: Window, reelComp: Reel): number[] {
        const symbolList: number[] = [];
        let hasWild = false;
        let hasJackpot = false;

        // 检测是否包含Wild/Jackpot符号
        for (let i = resultWindow.size - 1; i >= 0; i--) {
            const symbolId = resultWindow.getSymbol(i);
            if (symbolId === 90) hasWild = true;
            if (symbolId === 71) hasJackpot = true;
        }

        // 选择对应的虚拟符号列表
        const dummySymbolList = hasWild ? this.noWildDummy : (hasJackpot ? this.noJackpotDummy : this.dummySymbolList);
        const requiredSymbolCount = reelComp.visibleRow + 2 * reelComp.bufferRow;
        const dummySymbolCount = Math.max(0, Math.floor((requiredSymbolCount - resultWindow.size) / 2));

        // 填充虚拟符号（顶部）
        symbolList.push(dummySymbolList[Math.floor(Math.random() * dummySymbolList.length)]);

        // 反向填充窗口符号
        for (let i = resultWindow.size - 1; i >= 0; i--) {
            symbolList.push(resultWindow.getSymbol(i));
        }

        // 补充虚拟符号（底部）
        for (let i = 0; i < dummySymbolCount; i++) {
            symbolList.push(dummySymbolList[Math.floor(Math.random() * dummySymbolList.length)]);
        }

        return symbolList;
    }

    /**
     * 构建普通模式的结果符号信息列表
     * @param resultWindow 结果窗口
     * @param reelComp 滚轮组件
     * @returns 符号信息列表数组
     */
    public getResultSymbolInfoList(resultWindow: Window, reelComp: Reel): any[] | null {
        const gameResult = SlotGameResultManager.Instance._gameResult;
        const symbolInfoWindow = gameResult?.spinResult?.symbolInfoWindow;
        if (!symbolInfoWindow || !symbolInfoWindow[reelComp.reelindex]) return null;

        const symbolInfoList: any[] = [];
        const targetSymbolInfo = symbolInfoWindow[reelComp.reelindex];
        const infoOffset = Math.max(0, Math.floor((resultWindow.size - targetSymbolInfo.length) / 2));

        // 填充空信息（顶部）
        symbolInfoList.push(null);
        for (let i = 0; i < infoOffset; i++) {
            symbolInfoList.push(null);
        }

        // 反向填充有效信息
        for (let i = targetSymbolInfo.length - 1; i >= 0; i--) {
            symbolInfoList.push(targetSymbolInfo[i]);
        }

        return symbolInfoList;
    }

    /**
     * 构建普通模式的特殊符号信息列表
     * @param resultWindow 结果窗口
     * @param reelComp 滚轮组件
     * @returns 特殊符号信息列表数组
     */
    public getResultSpecialSymbolInfoList(resultWindow: Window, reelComp: Reel): SpecialSymbolInfo[] {
        const specialSymbolInfoList: SpecialSymbolInfo[] = [];
        const windowRange = SlotManager.Instance.getWindowRange();
        const requiredSymbolCount = reelComp.visibleRow + 2 * reelComp.bufferRow;
        const dummySymbolCount = Math.max(0, Math.floor((requiredSymbolCount - resultWindow.size) / 2));

        // 填充顶部空特殊信息
        specialSymbolInfoList.push(new SpecialSymbolInfo(SpecialType.NONE));

        // 遍历窗口符号，构建特殊信息
        for (let i = resultWindow.size - 1; i >= 0; i--) {
            let specialType = SpecialType.NONE;
            const reelRange = windowRange[reelComp.reelindex];

            if (TSUtility.isValid(reelRange)) {
                if (reelRange[0] <= i && i < reelRange[1]) {
                    if (SlotManager.Instance.isCheckSpecialInfo(SpecialType.FEVER, reelComp.reelindex, i)) {
                        specialType |= SpecialType.FEVER;
                    }
                }
            }

            specialSymbolInfoList.push(new SpecialSymbolInfo(specialType));
        }

        // 填充底部空特殊信息
        for (let i = 0; i < dummySymbolCount; i++) {
            specialSymbolInfoList.push(new SpecialSymbolInfo(SpecialType.NONE));
        }

        return specialSymbolInfoList;
    }
}