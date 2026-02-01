
// 导入暮光龙游戏自定义模块
import ReelController_Base from "../../../../Script/ReelController_Base";
import ReelSpinBehaviors, { EasingInfo } from "../../../../Script/ReelSpinBehaviors";
import Reel from "../../../../Script/Slot/Reel";
import SlotSoundController from "../../../../Script/Slot/SlotSoundController";
import State, { SequencialState } from "../../../../Script/Slot/State";
import SlotUIRuleManager from "../../../../Script/Slot/rule/SlotUIRuleManager";
import SlotGameResultManager from "../../../../Script/manager/SlotGameResultManager";
import SlotGameRuleManager from "../../../../Script/manager/SlotGameRuleManager";
import SlotManager, { SpecialSymbolInfo } from "../../../../Script/manager/SlotManager";
import SoundManager from "../../../../Script/manager/SoundManager";
import GameComponents_TwilightDragon from "./GameComponents_TwilightDragon";
import JackpotSymbol_TwilightDragon from "./JackpotSymbol_TwilightDragon";
import Reel_TwilightDragon from "./Reel_TwilightDragon";
import { Window } from "../../../../Script/manager/SlotGameRuleManager";
import Symbol from "../../../../Script/Slot/Symbol";
import SymbolAnimationController from "../../../../Script/Slot/SymbolAnimationController";

const { ccclass, property } = cc._decorator;

// 定义常量：简化魔法值维护
const DUMMY_SYMBOL_LIST = [32, 33, 31, 13, 12, 14, 91, 71, 72, 73];
const JACKPOT_SYMBOL_ID = 91;
const ANIM_NAME_JACKPOT_APPEAR = "J1_Appear";
const ANIM_NAME_JACKPOT_FS_APPEAR = "J1_Appear_FS";
const SOUND_NAME_REEL_SPIN = "ReelSpin";
const SOUND_NAME_REEL_EXPECT = "ReelExpect";
const SOUND_NAME_JACKPOT_APPEAR = "JackpotAppear";
const SOUND_NAME_JACKPOT_FS_APPEAR = "JackpotFreeSpinAppear";

/**
 * 暮光龙滚轮控制器
 * 继承自ReelController_Base，负责滚轮旋转、停止、符号处理、动画/音效播放核心逻辑
 */
@ccclass("ReelController_TwilightDragon")
export default class ReelController_TwilightDragon extends ReelController_Base {
    /**
     * 组件加载时初始化（填充虚拟符号列表、注册滚轮停止回调）
     */
    onLoad(): void {
        // 填充虚拟符号列表
        this.dummySymbolList.push(...DUMMY_SYMBOL_LIST);

        // 注册滚轮停止时的回调（模糊效果重置、音效停止）
        this.easingFuncListOnSpinEnd.push(() => {
            const reel = this.node.getComponent(Reel);
            if (!reel) return;

            // 重置滚轮模糊偏移量
            reel.setShaderValue("blurOffset", 0);
            // 获取当前游戏结果子游戏Key（保留原始逻辑，无实际副作用）
            SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            // 播放滚轮停止音效（父类方法）
            this.playReelStopSound();

            // 最后一个滚轮停止时，停止旋转/预期音效
            const reelMachine = SlotManager.Instance.reelMachine;
            if (reel.reelindex === reelMachine.reels.length - 1) {
                const delayAction = cc.sequence(
                    cc.moveBy(0.26, cc.Vec2.ZERO), // 延迟0.26秒（占位动作，仅做延迟）
                    cc.callFunc(() => {
                        SlotSoundController.Instance().stopAudio(SOUND_NAME_REEL_SPIN, "FXLoop");
                        SlotSoundController.Instance().stopAudio(SOUND_NAME_REEL_EXPECT, "FX");
                    })
                );
                this.node.runAction(delayAction);
            }
        });
    }

    /**
     * 设置预期特效显示状态
     * @param isShow 是否显示预期特效
     */
    setShowExpectEffects(isShow: boolean): void {
        // 跳过条件：强制显示或当前旋转跳过
        if (!isShow || SlotManager.Instance.isSkipCurrentSpin === 1) {
            return;
        }

        // 显示/隐藏预期特效节点
        this.expectEffects.forEach((effectNode) => {
            if (effectNode) {
                effectNode.active = !!isShow;
            }
        });

        // 播放滚轮预期特效（游戏自定义组件）
        if (isShow) {
            const gameComponents = SlotManager.Instance.getComponent(GameComponents_TwilightDragon);
            gameComponents?.reelExpect();
        }
    }

    /**
     * 获取包含最后符号列表的滚轮移动状态（新版逻辑）
     * @param reel 滚轮实例
     * @param symbolList 符号列表
     * @param subGameKey 子游戏Key
     * @param easingInfo 缓动信息
     * @param symbolInfoList 符号信息列表
     * @param specialSymbolInfoList 特殊符号信息列表
     * @returns 顺序状态对象
     */
    getReelMoveStateWithLastSymbolList(
        reel: Reel,
        symbolList: number[],
        subGameKey: string,
        easingInfo?: EasingInfo | null,
        symbolInfoList?: any[] | null,
        specialSymbolInfoList?: SpecialSymbolInfo[] | null
    ): SequencialState {
        easingInfo = easingInfo ?? null;
        specialSymbolInfoList = specialSymbolInfoList ?? null;

        const seqState = new SequencialState();
        let index = 0;

        // 插入核心滚轮移动状态
        seqState.insert(index++, this.getReelMoveStateWithLastSymbolListNew(
            reel,
            symbolList,
            subGameKey,
            easingInfo,
            symbolInfoList,
            specialSymbolInfoList
        ));

        // 插入旋转结束事件状态
        seqState.insert(index++, this.getSpinEndEventState());

        return seqState;
    }

    /**
     * 获取包含空白符号的滚轮移动状态（基础版）
     * @param reel 滚轮实例
     * @param symbolList 符号列表
     * @param subGameKey 子游戏Key
     * @param easingInfo 缓动信息
     * @param symbolInfoList 符号信息列表
     * @param specialSymbolInfoList 特殊符号信息列表
     * @returns 顺序状态对象
     */
    getReelMoveStateWithLastSymbolListContainBlankSymbolNew(
        reel: Reel,
        symbolList: number[],
        subGameKey: string,
        easingInfo?: EasingInfo | null,
        symbolInfoList?: any[] | null,
        specialSymbolInfoList?: SpecialSymbolInfo[] | null
    ): SequencialState {
        symbolInfoList = symbolInfoList ?? null;
        specialSymbolInfoList = specialSymbolInfoList ?? null;

        const seqState = new SequencialState();
        let index = 0;

        // 插入基础空白符号处理状态
        seqState.insert(index++, this.getReelMoveStateWithLastSymbolListContainBlankSymbolNew_Base(
            reel,
            symbolList,
            subGameKey,
            easingInfo,
            symbolInfoList,
            specialSymbolInfoList
        ));

        // 插入旋转结束事件状态
        seqState.insert(index++, this.getSpinEndEventState());

        return seqState;
    }

    /**
     * 获取跳过预旋转的状态（常规旋转）
     * @param windowList 窗口列表
     * @param reelMachine 滚轮机器实例
     * @returns 顺序状态对象
     */
    getSpinExcludePreSpinUsingSpinRequestTimeState(
        windowList?: any | null,
        reelMachine?: any | null
    ): SequencialState {
        windowList = windowList ?? null;
        reelMachine = reelMachine ?? null;

        const seqState = new SequencialState();
        if (!this.node.active) return seqState;

        let index = 0;
        const reel = this.node.getComponent(Reel);
        if (!reel) return seqState;

        // 初始化窗口列表与滚轮机器
        const windows = windowList ?? SlotGameResultManager.Instance.getReelStopWindows();
        const machine = reelMachine ?? SlotManager.Instance.reelMachine;
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reel.reelindex];

        // 1. 滚轮旋转至更新前的状态
        const spinUntilRenewalState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReelRenewal(
            machine.reels,
            reel,
            reelStrip,
            subGameKey
        );
        spinUntilRenewalState.flagSkipActive = true;
        spinUntilRenewalState.addOnStartCallback(() => {
            const reelTwilight = this.getComponent(Reel_TwilightDragon);
            reelTwilight._blurFlag = true;
            reel.setShaderValue("blurOffset", 0.02);
        });
        seqState.insert(index++, spinUntilRenewalState);

        // 2. 滚轮当前更新状态
        const spinRenewalState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReelRenewal(
            machine.reels,
            reel,
            reelStrip,
            subGameKey
        );
        spinRenewalState.flagSkipActive = true;
        seqState.insert(index++, spinRenewalState);

        // 3. 提取缓动信息与符号列表
        const easingInfo = new EasingInfo();
        easingInfo.easingType = spinControlInfo?.postEasingType;
        easingInfo.easingRate = spinControlInfo?.postEasingRate;
        easingInfo.easingDuration = spinControlInfo?.postEasingDuration;
        easingInfo.easingDistance = spinControlInfo?.postEasingDistance;

        // 缓动开始时隐藏预期特效
        easingInfo.onEasingStartFuncList.push(() => {
            this.setShowExpectEffects(false);
        });

        // 添加滚轮停止缓动回调
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 4. 滚轮移动状态（包含空白符号处理）
        const symbolList = this.getResultSymbolList(windows.GetWindow(reel.reelindex), reel);
        const symbolInfoList = this.getResultSymbolInfoList(windows.GetWindow(reel.reelindex), reel);
        const specialSymbolInfoList = this.getResultSpecialSymbolInfoList(windows.GetWindow(reel.reelindex), reel);

        const reelMoveState = this.getReelMoveStateWithLastSymbolListContainBlankSymbolNew(
            reel,
            symbolList,
            subGameKey,
            easingInfo,
            symbolInfoList,
            specialSymbolInfoList
        );

        // 移动结束时停止对应音效（第4个滚轮）
        reelMoveState.addFrontOnStartCallback(() => {
            const reelTwilight = this.getComponent(Reel_TwilightDragon);
            reelTwilight._blurFlag = false;
        });

        reelMoveState.addOnEndCallback(() => {
            if (reel.reelindex === 4) {
                SlotManager.Instance.stopReelSpinSound();
            }
        });
        seqState.insert(index++, reelMoveState);

        // 5. 旋转结束处理状态
        const spinEndState = new State();
        spinEndState.addOnStartCallback(() => {
            // 重置滚轮组件位置与模糊效果
            reel.resetPositionOfReelComponents();
            reel.setShaderValue("blurOffset", 0);

            // 最后一个滚轮时重置主音量
            if (reel.reelindex === machine.reels.length - 1) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }

            // 更新预期特效播放状态
            SlotManager.Instance.setPlayReelExpectEffectState(reel.reelindex + 1);

            // 处理旋转结束逻辑
            this.processSpinEnd(() => {
                spinEndState.setDone();
            });
        });
        seqState.insert(index++, spinEndState);

        return seqState;
    }

    /**
     * 获取跳过预旋转的状态（免费旋转）
     * @param windowList 窗口列表
     * @param reelMachine 滚轮机器实例
     * @returns 顺序状态对象
     */
    getSpinExcludePreSpinUsingSpinRequestTimeState_FreeSpin(
        windowList?: any | null,
        reelMachine?: any | null
    ): SequencialState {
        windowList = windowList ?? null;
        reelMachine = reelMachine ?? null;

        const seqState = new SequencialState();
        if (!this.node.active) return seqState;

        let index = 0;
        const reel = this.node.getComponent(Reel);
        if (!reel) return seqState;

        // 初始化滚轮分组与基础数据
        const reelGroupIndex = Math.floor(reel.reelindex / 3);
        Math.floor(reel.reelindex % 3); // 保留原始逻辑，无实际赋值
        const windows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const machine = reelMachine;
        if (!machine) return seqState;

        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reel.reelindex];

        // 1. 免费旋转：滚轮旋转至更新前的状态
        const spinUntilRenewalState = this.getReelSpinStateUntileStopBeforeReelRenewal_FreeSpin(
            machine.reels,
            reel,
            reelStrip,
            subGameKey
        );
        spinUntilRenewalState.flagSkipActive = true;
        spinUntilRenewalState.addOnStartCallback(() => {
            reel.setShaderValue("blurOffset", 0.02);
        });
        seqState.insert(index++, spinUntilRenewalState);

        // 2. 免费旋转：滚轮当前更新状态
        const spinRenewalState = this.getReelSpinStateCurrentReelRenewal_FreeSpin(
            machine.reels,
            reel,
            reelStrip,
            subGameKey
        );
        spinRenewalState.flagSkipActive = true;
        seqState.insert(index++, spinRenewalState);

        // 3. 构建免费旋转窗口与符号列表
        const window = new Window(1);
        const reelColIndex = Math.floor(reel.reelindex % 3);
        const symbolId = windows.GetWindow(reelGroupIndex).getSymbol(reelColIndex);
        window.setSymbol(0, symbolId);

        const symbolList = this.getResultSymbolListFreeSpin(window, reel);
        const symbolInfoList = this.getResultSymbolInfoListFreeSpin(
            SlotGameResultManager.Instance.getResultSymbolInfoArray(),
            reel
        );
        const specialSymbolInfoList = this.getResultSpecialSymbolInfoList(window, reel);

        // 4. 配置免费旋转缓动信息
        const easingInfo = new EasingInfo();
        easingInfo.easingType = spinControlInfo?.postExEasingType;
        easingInfo.easingRate = spinControlInfo?.postExEasingRate;
        easingInfo.easingDuration = spinControlInfo?.postExEasingDuration;
        easingInfo.easingDistance = spinControlInfo?.postExEasingDistance;

        // 缓动开始时隐藏预期特效
        easingInfo.onEasingStartFuncList.push(() => {
            this.setShowExpectEffects(false);
        });

        // 添加滚轮停止缓动回调
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 5. 免费旋转：滚轮移动状态
        const reelMoveState = this.getReelMoveStateWithLastSymbolList(
            reel,
            symbolList,
            subGameKey,
            easingInfo,
            symbolInfoList,
            specialSymbolInfoList
        );

        reelMoveState.addOnEndCallback(() => {
            SlotSoundController.Instance().stopAudio(SOUND_NAME_REEL_EXPECT, "FXLoop");
        });
        seqState.insert(index++, reelMoveState);

        // 6. 免费旋转：旋转结束处理状态
        const spinEndState = new State();
        spinEndState.addOnStartCallback(() => {
            // 重置滚轮组件位置与模糊效果
            reel.resetPositionOfReelComponents();
            reel.setShaderValue("blurOffset", 0);

            // 最后一个滚轮时重置主音量
            if (reel.reelindex === machine.reels.length - 1) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }

            // 处理旋转结束逻辑
            this.processSpinEnd(() => {
                spinEndState.setDone();
            });
        });
        seqState.insert(index++, spinEndState);

        return seqState;
    }

    /**
     * 免费旋转：获取滚轮旋转至更新前的状态
     * @param reels 滚轮数组
     * @param reel 当前滚轮实例
     * @param reelStrip 滚轮符号条
     * @param subGameKey 子游戏Key
     * @returns 状态对象
     */
    getReelSpinStateUntileStopBeforeReelRenewal_FreeSpin(
        reels: Reel[],
        reel: Reel,
        reelStrip: any,
        subGameKey: string
    ): State {
        const state = new State();
        const reelData = reelStrip.getReel(reel.reelindex);
        let moveAction: cc.Action | null = null;

        // 检查空白符号并控制下一个符号索引
        reelData.checkBlankSymbolAndControlNextSymbolIndex(reel);

        state.addOnStartCallback(() => {
            // 设置滚轮旋转方向为向下
            reel.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);

            // 计算旋转时间
            let spinTime = reel.getPreSpinTime(subGameKey);
            const spinRequestTime = SlotManager.Instance.getTimeSecSpinRequest();

            // 累加前序滚轮的旋转/停止时间
            reels.forEach((itemReel) => {
                const itemReelComp = itemReel.getComponent(Reel);
                if (itemReelComp?.node.active && itemReelComp.reelindex < reel.reelindex) {
                    spinTime += itemReelComp.getReelSpinTimeRenewal(reels, spinRequestTime, subGameKey);
                    spinTime += itemReelComp.getReelStopTime(subGameKey);
                }
            });

            // 提取滚轮控制参数
            let symbolMoveSpeed = 0;
            let symbolHeight = 0;
            const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reel.reelindex];
            if (spinControlInfo) {
                symbolMoveSpeed = spinControlInfo.oneSymbolMoveSpeed;
                symbolHeight = spinControlInfo.symbolHeight;
            }

            // 计算移动距离与动作
            const moveDistanceRatio = spinTime / symbolMoveSpeed;
            const moveDistance = moveDistanceRatio * symbolHeight;
            const moveByAction = cc.moveBy(spinTime, new cc.Vec2(0, -moveDistance));

            // 设置下一个符号ID回调
            reel.setNextSymbolIdCallback(() => {
                const symbolId = reelData.getNextSymbolId();
                reelData.increaseNextSymbolIndex();
                return symbolId;
            });

            // 执行移动动作并标记状态完成
            moveAction = reel.node.runAction(
                cc.sequence(moveByAction, cc.callFunc(() => state.setDone()))
            );
        });

        // 状态结束时停止未完成的动作
        state.addOnEndCallback(() => {
            if (moveAction && !moveAction.isDone()) {
                reel.node.stopAction(moveAction);
            }
        });

        return state;
    }

    /**
     * 免费旋转：获取滚轮当前更新状态
     * @param reels 滚轮数组
     * @param reel 当前滚轮实例
     * @param reelStrip 滚轮符号条
     * @param subGameKey 子游戏Key
     * @returns 状态对象
     */
    getReelSpinStateCurrentReelRenewal_FreeSpin(
        reels: Reel[],
        reel: Reel,
        reelStrip: any,
        subGameKey: string
    ): State {
        const state = new State();
        const reelData = reelStrip.getReel(reel.reelindex % 3);
        let moveAction: cc.Action | null = null;

        state.addOnStartCallback(() => {
            // 设置滚轮旋转方向为向下
            reel.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            // 检查空白符号并控制下一个符号索引
            reelData.checkBlankSymbolAndControlNextSymbolIndex(reel);

            // 提取滚轮控制参数
            let symbolMoveSpeed = 0;
            let symbolHeight = 0;
            let maxExpectSpeed = 0;
            const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reel.reelindex];
            if (spinControlInfo) {
                symbolMoveSpeed = spinControlInfo.oneSymbolMoveSpeed;
                symbolHeight = spinControlInfo.symbolHeight;
                maxExpectSpeed = spinControlInfo.maxSpeedInExpectEffect;
            }

            // 计算旋转更新时间与移动速度
            const spinRequestTime = SlotManager.Instance.getTimeSecSpinRequest();
            const spinRenewalTime = reel.getReelSpinTimeRenewal(reels, spinRequestTime, subGameKey);
            const visibleWindows = SlotGameResultManager.Instance.getVisibleSlotWindows();
            const actualMoveSpeed = SlotUIRuleManager.Instance.getExpectEffectFlag(reel.reelindex, visibleWindows)
                ? maxExpectSpeed
                : symbolMoveSpeed;

            // 计算移动距离与动作
            const moveStep = Math.floor(spinRenewalTime / actualMoveSpeed);
            const moveDistance = moveStep * reel.symbolHeight;
            const moveByAction = cc.moveBy(spinRenewalTime, new cc.Vec2(0, -moveDistance));

            // 设置下一个符号ID回调
            reel.setNextSymbolIdCallback(() => {
                const symbolId = reelData.getNextSymbolId();
                reelData.increaseNextSymbolIndex();
                return symbolId;
            });

            // 执行移动动作并标记状态完成
            moveAction = reel.node.runAction(
                cc.sequence(moveByAction, cc.callFunc(() => state.setDone()))
            );
        });

        // 状态结束时停止未完成的动作并更新滚轮
        state.addOnEndCallback(() => {
            if (moveAction && !moveAction.isDone()) {
                reel.node.stopAction(moveAction);
            }
            reel.update();
        });

        return state;
    }

    /**
     * 获取包含最后符号列表的滚轮移动状态（新版基础逻辑）
     * @param reel 滚轮实例
     * @param symbolList 符号列表
     * @param subGameKey 子游戏Key
     * @param easingInfo 缓动信息
     * @param symbolInfoList 符号信息列表
     * @param specialSymbolInfoList 特殊符号信息列表
     * @returns 状态对象
     */
    getReelMoveStateWithLastSymbolListNew(
        reel: Reel,
        symbolList: number[],
        subGameKey: string,
        easingInfo?: EasingInfo | null,
        symbolInfoList?: any[] | null,
        specialSymbolInfoList?: SpecialSymbolInfo[] | null
    ): State {
        easingInfo = easingInfo ?? null;
        symbolInfoList = symbolInfoList ?? null;
        specialSymbolInfoList = specialSymbolInfoList ?? null;

        const state = new State();
        let moveAction: cc.Action | null = null;
        let symbolIndex = 0;
        let symbolInfoIndex = 0;
        let specialSymbolIndex = 0;

        // 提取滚轮控制参数
        let symbolHeight = 0;
        let symbolMoveSpeed = 0;
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reel.reelindex];
        if (spinControlInfo) {
            symbolHeight = spinControlInfo.symbolHeight;
            symbolMoveSpeed = spinControlInfo.oneSymbolMoveSpeed;
        }

        state.addOnStartCallback(() => {
            // 设置滚轮旋转方向为向下
            reel.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);

            // 处理最后一个符号（头奖符号随机替换）
            const lastSymbol = reel.getLastSymbol();
            if (!lastSymbol) return;

            const lastSymbolComp = lastSymbol.getComponent(Symbol);
            const lastSymbolY = reel.getPositionY(lastSymbol.node.y);
            const bufferRowOffset = reel.bufferRow * symbolHeight;

            // 头奖符号（91）随机替换为其他符号
            if (lastSymbolComp.symbolId === JACKPOT_SYMBOL_ID) {
                const replaceSymbolList = [12, 13, 14, 31, 32, 33, 71, 72, 73];
                const randomIndex = Math.floor(Math.random() * replaceSymbolList.length);
                const reelTwilight = this.getComponent(Reel_TwilightDragon);
                reelTwilight?.changeLastSymbol(replaceSymbolList[randomIndex]);
            }

            // 计算移动距离与时间
            let totalMoveDistance = 0;
            let easingMoveDistance = 0;

            if (easingInfo) {
                totalMoveDistance = lastSymbolY + (symbolList.length * symbolHeight - easingInfo.easingDistance) - bufferRowOffset;
                easingMoveDistance = easingInfo.easingDistance;
            } else {
                totalMoveDistance = lastSymbolY + symbolList.length * symbolHeight - bufferRowOffset;
            }

            const moveTime = Math.abs(symbolMoveSpeed * (totalMoveDistance / symbolHeight));
            const baseMoveAction = cc.moveBy(moveTime, new cc.Vec2(0, -totalMoveDistance));

            // 设置符号相关回调
            reel.setNextSymbolIdCallback(() => {
                if (symbolIndex >= symbolList.length) return undefined;
                return symbolList[symbolIndex++];
            });

            reel.setNextSymbolInfoCallback(() => {
                if (!symbolInfoList || symbolInfoIndex >= symbolInfoList.length) return null;
                return symbolInfoList[symbolInfoIndex++];
            });

            reel.setNextSpecialInfoCallback(() => {
                const defaultSpecialInfo = new SpecialSymbolInfo(0);
                if (!specialSymbolInfoList || specialSymbolIndex >= specialSymbolInfoList.length) return defaultSpecialInfo;
                return specialSymbolInfoList[specialSymbolIndex++];
            });

            // 构建动作序列
            const actionList: any[] = [baseMoveAction];
            const doneAction = cc.callFunc(() => state.setDone());

            // 添加缓动动作（如有）
            if (easingInfo && easingMoveDistance > 0) {
                const easeFunc = ReelSpinBehaviors.Instance.getEaseAction(easingInfo.easingType, easingInfo.easingRate);
                const easingMoveAction = cc.moveBy(easingInfo.easingDuration, new cc.Vec2(0, -easingMoveDistance));
                easingMoveAction.easing(easeFunc);

                // 缓动开始回调
                if (easingInfo.onEasingStartFuncList.length > 0) {
                    const easingStartAction = cc.callFunc(() => {
                        easingInfo.onEasingStartFuncList.forEach((func) => func());
                    });
                    actionList.push(easingStartAction, easingMoveAction);
                } else {
                    actionList.push(easingMoveAction);
                }
            }

            // 添加完成动作并执行
            actionList.push(doneAction);
            moveAction = reel.node.runAction(cc.sequence(actionList));
        });

        // 状态结束时补全符号并处理旋转后逻辑
        state.addOnEndCallback(() => {
            if (moveAction) {
                reel.node.stopAction(moveAction);
            }

            // 补全滚轮顶部未加载的符号
            while (symbolIndex < symbolList.length) {
                const symbolId = symbolList[symbolIndex];
                reel.pushSymbolAtTopOfReel(symbolId, symbolInfoList?.[symbolInfoIndex] ?? null);
                symbolIndex++;
                symbolInfoIndex++;
            }

            // 执行旋转停止后逻辑
            reel.processAfterStopSpin();
        });

        return state;
    }

    /**
     * 获取包含空白符号的滚轮移动状态（基础核心逻辑）
     * @param reel 滚轮实例
     * @param symbolList 符号列表
     * @param subGameKey 子游戏Key
     * @param easingInfo 缓动信息
     * @param symbolInfoList 符号信息列表
     * @param specialSymbolInfoList 特殊符号信息列表
     * @returns 状态对象
     */
    getReelMoveStateWithLastSymbolListContainBlankSymbolNew_Base(
        reel: Reel,
        symbolList: number[],
        subGameKey: string,
        easingInfo?: EasingInfo | null,
        symbolInfoList?: any[] | null,
        specialSymbolInfoList?: SpecialSymbolInfo[] | null
    ): State {
        easingInfo = easingInfo ?? null;
        symbolInfoList = symbolInfoList ?? null;
        specialSymbolInfoList = specialSymbolInfoList ?? null;

        const state = new State();
        let moveAction: cc.Action | null = null;
        let symbolIndex = 0;
        let symbolInfoIndex = 0;
        let specialSymbolIndex = 0;

        // 提取滚轮控制参数
        let symbolHeight = 0;
        let symbolMoveSpeed = 0;
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reel.reelindex];
        if (spinControlInfo) {
            symbolHeight = spinControlInfo.symbolHeight;
            symbolMoveSpeed = spinControlInfo.oneSymbolMoveSpeed;
        }

        state.addOnStartCallback(() => {
            if (symbolList.length === 0) return;

            // 设置滚轮旋转方向为向下
            reel.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);

            // 处理最后一个符号与空白符号补全
            const lastSymbol = reel.getLastSymbol();
            if (!lastSymbol) return;

            const lastSymbolY = reel.getPositionY(lastSymbol.node.y);
            const bufferRowOffset = reel.bufferRow * symbolHeight;
            const lastSymbolId = lastSymbol.symbolId;
            const firstSymbolId = symbolList[0];

            // 补全空白符号（保持滚轮符号结构一致性）
            let newSymbolList = [...symbolList];
            let newSymbolInfoList = symbolInfoList ? [...symbolInfoList] : null;
            let newSpecialSymbolList = specialSymbolInfoList ? [...specialSymbolInfoList] : null;

            if (lastSymbolId === 0 && firstSymbolId === 0) {
                // 两端均为空白符号：随机插入虚拟符号
                const randomSymbol = this.dummySymbolList[Math.floor(Math.random() * this.dummySymbolList.length)];
                newSymbolList = [randomSymbol, ...newSymbolList];
                newSymbolInfoList = newSymbolInfoList ? [null, ...newSymbolInfoList] : null;
                newSpecialSymbolList = newSpecialSymbolList ? [new SpecialSymbolInfo(0), ...newSpecialSymbolList] : null;
            } else if (lastSymbolId !== 0 && firstSymbolId !== 0) {
                // 两端均非空白符号：插入空白符号
                newSymbolList = [0, ...newSymbolList];
                newSymbolInfoList = newSymbolInfoList ? [null, ...newSymbolInfoList] : null;
                newSpecialSymbolList = newSpecialSymbolList ? [new SpecialSymbolInfo(0), ...newSpecialSymbolList] : null;
            }

            // 计算移动距离与时间
            let totalMoveDistance = 0;
            let easingMoveDistance = 0;

            if (easingInfo) {
                totalMoveDistance = lastSymbolY + (newSymbolList.length * symbolHeight - easingInfo.easingDistance) - bufferRowOffset;
                easingMoveDistance = easingInfo.easingDistance;
            } else {
                totalMoveDistance = lastSymbolY + newSymbolList.length * symbolHeight - bufferRowOffset;
            }

            const moveTime = symbolMoveSpeed * (totalMoveDistance / symbolHeight);
            const baseMoveAction = cc.moveBy(moveTime, new cc.Vec2(0, -totalMoveDistance));

            // 设置符号相关回调
            reel.setNextSymbolIdCallback(() => {
                if (symbolIndex >= newSymbolList.length) return undefined;
                return newSymbolList[symbolIndex++];
            });

            if (symbolInfoList) {
                reel.setNextSymbolInfoCallback(() => {
                    if (!newSymbolInfoList || symbolInfoIndex >= newSymbolInfoList.length) return null;
                    return newSymbolInfoList[symbolInfoIndex++];
                });
            }

            if (specialSymbolInfoList) {
                reel.setNextSpecialInfoCallback(() => {
                    const defaultSpecialInfo = new SpecialSymbolInfo(0);
                    if (!newSpecialSymbolList || specialSymbolIndex >= newSpecialSymbolList.length) return defaultSpecialInfo;
                    return newSpecialSymbolList[specialSymbolIndex++];
                });
            }

            // 构建动作序列
            const actionList: any[] = [baseMoveAction];
            const doneAction = cc.callFunc(() => state.setDone(), reel);

            // 添加缓动动作（如有）
            if (easingInfo && easingMoveDistance > 0) {
                const easeFunc = ReelSpinBehaviors.Instance.getEaseAction(easingInfo.easingType, easingInfo.easingRate);
                const easingMoveAction = cc.moveBy(easingInfo.easingDuration, new cc.Vec2(0, -easingMoveDistance));
                easingMoveAction.easing(easeFunc);

                // 缓动开始回调（模糊符号切换、播放出现动画）
                if (easingInfo.onEasingStartFuncList.length > 0) {
                    const easingStartAction = cc.callFunc(() => {
                        easingInfo.onEasingStartFuncList.forEach((func) => func());
                        const reelTwilight = this.getComponent(Reel_TwilightDragon);
                        reelTwilight?.changeAllBlurSymbol();

                        // 延迟播放出现动画
                        this.scheduleOnce(() => {
                            this.playAppearAnimation();
                        }, easingInfo.easingDuration / 2);
                    });
                    actionList.push(easingStartAction, easingMoveAction);
                } else {
                    actionList.push(easingMoveAction);
                }
            }

            // 添加完成动作并执行
            actionList.push(doneAction);
            moveAction = reel.node.runAction(cc.sequence(actionList));
        });

        // 状态结束时补全符号并处理旋转后逻辑
        state.addOnEndCallback(() => {
            if (moveAction) {
                reel.node.stopAction(moveAction);
            }

            // 补全滚轮顶部未加载的符号（兼容原始逻辑的重复索引自增）
            while (symbolIndex < symbolList.length) {
                const symbolId = symbolList[symbolIndex++];
                reel.pushSymbolAtTopOfReel(symbolId);
                symbolIndex++; // 保留原始逻辑的重复自增，确保功能一致
            }

            // 执行旋转停止后逻辑
            reel.processAfterStopSpin();
        });

        return state;
    }

    /**
     * 播放头奖符号出现动画
     */
    playAppearAnimation(): void {
        const reel = this.node.getComponent(Reel);
        if (!reel) return;

        const window = SlotGameResultManager.Instance.getLastHistoryWindows().GetWindow(reel.reelindex);
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        let isJackpotShow = false;

        // 遍历窗口符号，播放头奖出现动画
        for (let i = 0; i < window.size; i++) {
            const symbolId = window.getSymbol(i);
            const isJackpotSymbol = (reel.reelindex < 2 && symbolId >= JACKPOT_SYMBOL_ID) ||
                (symbolId >= JACKPOT_SYMBOL_ID && reel.reelindex === 2 && nextSubGameKey === "freeSpin");

            if (isJackpotSymbol) {
                isJackpotShow = true;
                // 播放头奖符号出现动画
                const animNode = SymbolAnimationController.Instance.playAnimationSymbolAbsoluteCoordinate(
                    reel.reelindex,
                    i,
                    JACKPOT_SYMBOL_ID,
                    ANIM_NAME_JACKPOT_APPEAR
                );

                // 设置头奖符号信息
                const jackpotSymbolComp = animNode.getComponent(JackpotSymbol_TwilightDragon);
                const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[reel.reelindex][i];
                if (jackpotSymbolComp && symbolInfo) {
                    jackpotSymbolComp.setSymbolInfo(symbolInfo);
                }
            }
        }

        // 播放头奖出现音效
        if (isJackpotShow) {
            SlotSoundController.Instance().playAudio(SOUND_NAME_JACKPOT_APPEAR, "FX");
        }
    }

    /**
     * 播放免费旋转下头奖符号出现动画
     */
    playAppearAnimationLockNRoll(): void {
        const reel = this.node.getComponent(Reel);
        if (!reel) return;

        const reelGroupIndex = Math.floor(reel.reelindex / 3);
        const reelColIndex = Math.floor(reel.reelindex % 3);
        const symbolId = SlotGameResultManager.Instance.getLastHistoryWindows().GetWindow(reelGroupIndex).getSymbol(reelColIndex);

        // 头奖符号时播放免费旋转专属动画
        if (symbolId >= JACKPOT_SYMBOL_ID) {
            reel.getSymbol(0).active = false;
            const gameComponents = SlotManager.Instance.getComponent(GameComponents_TwilightDragon);
            gameComponents?.freeSpinSymbolAniLayer.playSymbolAnimation(
                reelGroupIndex,
                reelColIndex,
                false,
                ANIM_NAME_JACKPOT_FS_APPEAR
            );

            // 播放免费旋转头奖出现音效
            SlotSoundController.Instance().playAudio(SOUND_NAME_JACKPOT_FS_APPEAR, "FX");
        }
    }

    /**
     * 获取免费旋转结果符号列表
     * @param window 窗口实例
     * @param reel 滚轮实例
     * @returns 符号列表
     */
    getResultSymbolListFreeSpin(window: Window, reel: Reel): number[] {
        const symbolList: number[] = [];
        const requiredSymbolCount = reel.visibleRow + 2 * reel.bufferRow;
        const needAddCount = window.size < requiredSymbolCount 
            ? Math.floor((requiredSymbolCount - window.size) / 2) 
            : 0;

        // 反向插入窗口符号
        for (let i = window.size - 1; i >= 0; i--) {
            symbolList.push(window.getSymbol(i));
        }

        // 移除头奖符号（避免重复）
        const dummySymbols = [...this.dummySymbolList];
        const jackpotSymbolIndex = dummySymbols.indexOf(JACKPOT_SYMBOL_ID);
        if (jackpotSymbolIndex > -1) {
            dummySymbols.splice(jackpotSymbolIndex, 1);
        }

        // 补充虚拟符号
        for (let i = 0; i < needAddCount; i++) {
            const randomSymbol = dummySymbols[Math.floor(Math.random() * dummySymbols.length)];
            symbolList.push(randomSymbol);
        }

        return symbolList;
    }

    /**
     * 获取常规旋转结果符号列表
     * @param window 窗口实例
     * @param reel 滚轮实例
     * @returns 符号列表
     */
    getResultSymbolList(window: Window, reel: Reel): number[] {
        const symbolList: number[] = [];
        const requiredSymbolCount = reel.visibleRow + 2 * reel.bufferRow;
        const needAddCount = window.size < requiredSymbolCount 
            ? Math.floor((requiredSymbolCount - window.size) / 2) 
            : 0;

        // 反向插入窗口符号
        for (let i = window.size - 1; i >= 0; i--) {
            symbolList.push(window.getSymbol(i));
        }

        // 补充空白/虚拟符号
        for (let i = 0; i < needAddCount; i++) {
            const lastSymbol = symbolList[symbolList.length - 1];
            const addSymbol = lastSymbol === 0 
                ? this.dummySymbolList[Math.floor(Math.random() * this.dummySymbolList.length)] 
                : 0;
            symbolList.push(addSymbol);
        }

        return symbolList;
    }

    /**
     * 获取免费旋转结果符号信息列表
     * @param symbolInfoArray 符号信息数组
     * @param reel 滚轮实例
     * @returns 符号信息列表
     */
    getResultSymbolInfoListFreeSpin(symbolInfoArray: any[], reel: Reel): any[] | null {
        const reelIndex = reel.reelindex;
        const reelGroupIndex = Math.floor(reelIndex / 3);
        const reelColIndex = Math.floor(reelIndex % 3);

        // 提取对应位置的符号信息
        const gameResult = SlotGameResultManager.Instance._gameResult;
        const symbolInfoWindow = gameResult?.spinResult?.symbolInfoWindow;
        if (!symbolInfoWindow || !symbolInfoWindow[reelGroupIndex] || !symbolInfoWindow[reelGroupIndex][reelColIndex]) {
            return null;
        }

        const symbolInfoList: any[] = [];
        symbolInfoList.push(symbolInfoWindow[reelGroupIndex][reelColIndex]);
        return symbolInfoList;
    }

    /**
     * 处理旋转结束逻辑（区分常规/免费旋转）
     * @param callback 完成回调
     */
    processSpinEnd(callback: () => void): void {
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();

        if (subGameKey === "freeSpin") {
            // 免费旋转：播放专属头奖动画
            this.playAppearAnimationLockNRoll();

            // 无倍率且有奖金时，延迟执行回调
            const freeSpinState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
            const spinMultiplier = freeSpinState?.spinMultiplier ?? 0;
            const totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();

            if (spinMultiplier <= 1 && totalWinMoney > 0) {
                this.scheduleOnce(() => {
                    callback();
                }, 0.5);
            } else {
                callback();
            }
        } else {
            // 常规旋转：直接执行回调
            callback();
        }
    }
}