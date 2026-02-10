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
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotGameRuleManager, { ReelStrip } from '../../manager/SlotGameRuleManager';
import SlotManager, { SpecialSymbolInfo } from '../../manager/SlotManager';
import SoundManager from '../../manager/SoundManager';
// 导入龙珠游戏自定义组件
import GameComponents_DragonOrbs from './GameComponents_DragonOrbs';
import JackpotSymbol_DragonOrbs from './JackpotSymbol_DragonOrbs';
import Reel_DragonOrbs from './Reel_DragonOrbs';


// ===================== 龙珠游戏卷轴控制器 =====================
/**
 * 龙珠游戏卷轴控制器
 * 管理卷轴旋转/停止逻辑、大奖期望效果、符号动画/音效播放，区分基础游戏/免费旋转的卷轴行为
 */
@ccclass()
export default class ReelController_DragonOrbs extends ReelController_Base {
    // ===================== 私有属性（与原JS一致，补充类型注解） =====================
    /** 结果符号列表 */
    private _arrResultSymbolList: number[] = [];
    /** 是否显示出现动画 */
    private _isAppear: boolean = false;

    // ===================== 生命周期方法（完全保留原JS逻辑） =====================
    /** 加载时初始化 */
    public onLoad(): void {
        const self = this;
        // 补充dummy符号列表（原JS的push逻辑完全保留）
        this.dummySymbolList.push(91);
        this.dummySymbolList.push(92);
        this.dummySymbolList.push(94);
        this.dummySymbolList.push(96);
        this.dummySymbolList.push(71);
        this.dummySymbolList.push(72);
        this.dummySymbolList.push(73);
        this.dummySymbolList.push(31);
        this.dummySymbolList.push(22);
        this.dummySymbolList.push(21);
        this.dummySymbolList.push(13);
        this.dummySymbolList.push(12);
        this.dummySymbolList.push(11);

        // 补充旋转结束的缓动回调（原JS逻辑完全保留）
        this.easingFuncListOnSpinEnd.push(() => {
            const reel = self.node.getComponent(Reel);
            const jackpotExpectFlag = SlotManager.Instance.getComponent(GameComponents_DragonOrbs)!.getJackpotSingleExpectFlag(reel.reelindex);
            const upDownFlag = SlotManager.Instance.getComponent(GameComponents_DragonOrbs)!.getUpDownFlag(reel.reelindex);

            if (jackpotExpectFlag === 0 || upDownFlag === -1) {
                self.playReelStopSound();
                reel.setShaderValue("blurOffset", 0);
                // 第4个卷轴延迟停止旋转音效
                if (reel.reelindex === 4) {
                    self.node.runAction(cc.sequence(cc.delayTime(0.26), cc.callFunc(() => {
                        SlotSoundController.Instance().stopAudio("ReelSpin", "FXLoop");
                    })));
                }
            }
        });
    }

    // ===================== 核心旋转状态管理方法（完全保留原JS逻辑） =====================
    /**
     * 获取使用旋转请求时间的旋转状态（排除预旋转）
     * @param reelStopWindow 卷轴停止窗口
     * @param reelMachine 卷轴机
     * @returns 顺序执行状态
     */
    public getSpinExcludePreSpinUsingSpinRequestTimeState(reelStopWindow?: any, reelMachine?: any): SequencialState {
        const self = this;
        reelStopWindow = reelStopWindow ?? null;
        const state = new SequencialState();

        // 节点未激活则直接返回
        if (!this.node.active) return state;

        let index = 0;
        const reel = this.node.getComponent(Reel);
        const stopWindow = reelStopWindow ?? SlotManager.Instance.getReelStopWindow();
        const machine = reelMachine ?? SlotManager.Instance.reelMachine;

        // 获取子游戏状态和旋转控制信息
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey) as any;
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reel.reelindex] as any;

        // 卷轴旋转到停止前的状态
        const spinUntilStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReelRenewal(
            machine.reels, reel, reelStrip, subGameKey
        );
        spinUntilStopState.flagSkipActive = true;
        spinUntilStopState.addOnStartCallback(() => {
            reel.setShaderValue("blurOffset", 0.02);
        });
        state.insert(index++, spinUntilStopState);

        // 卷轴更新状态
        const reelRenewalState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReelRenewal(
            machine.reels, reel, reelStrip, subGameKey
        );
        reelRenewalState.flagSkipActive = true;
        state.insert(index++, reelRenewalState);

        // 构建缓动信息
        const easingType = spinControlInfo.postEasingType;
        const easingRate = spinControlInfo.postEasingRate;
        const easingDuration = spinControlInfo.postEasingDuration;
        const easingDistance = spinControlInfo.postEasingDistance;

        // 获取结果符号列表
        const resultSymbolList = this.getResultSymbolList(stopWindow.GetWindow(reel.reelindex), reel);
        const resultSymbolInfoList = this.getResultSymbolInfoList(stopWindow.GetWindow(reel.reelindex), reel);
        const resultSpecialSymbolInfoList = this.getResultSpecialSymbolInfoList(stopWindow.GetWindow(reel.reelindex), reel);

        // 构建缓动信息对象
        const easingInfo = new (class implements EasingInfo {
            easingType: string = easingType;
            easingDistance: number = easingDistance;
            easingDuration: number = easingDuration;
            easingRate: number = easingRate;
            onEasingStartFuncList: (() => void)[] = [];
        })();
        easingInfo.onEasingStartFuncList.push(() => {
            SlotSoundController.Instance().stopAudio("ReelExpect", "FX");
            self.setShowExpectEffects(false);
        });

        // 添加停止缓动的回调
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 卷轴移动状态
        const reelMoveState = this.getReelMoveStateWithLastSymbolList(
            reel, resultSymbolList, subGameKey, easingInfo, resultSymbolInfoList, resultSpecialSymbolInfoList
        );
        reelMoveState.addOnStartCallback(() => {
            self.getComponent(Reel)!.resetAllSiblingIndex();
        });
        reelMoveState.addOnEndCallback(() => {
            self.playAppearAnimation(reel);
            // 第4个卷轴停止旋转音效
            if (reel.reelindex === 4) SlotManager.Instance.stopReelSpinSound();
        });
        state.insert(index++, reelMoveState);

        // 旋转结束处理状态
        const spinEndState = new State();
        spinEndState.addOnStartCallback(() => {
            reel.resetPositionOfReelComponents();
            reel.setShaderValue("blurOffset", 0);
            // 最后一个卷轴恢复主音量
            if (machine.reels.length - 1 === reel.reelindex) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }
            SlotManager.Instance.setPlayReelExpectEffectState(reel.reelindex + 1);
            self.processSpinEnd(spinEndState.setDone.bind(spinEndState));
        });
        state.insert(index++, spinEndState);

        return state;
    }

    /**
     * 获取排除预旋转的旋转状态
     * @param reelStopWindow 卷轴停止窗口
     * @param reelMachine 卷轴机
     * @returns 顺序执行状态
     */
    public getSpinExcludePreSpinState(reelStopWindow?: any, reelMachine?: any): SequencialState {
        const self = this;
        reelStopWindow = reelStopWindow ?? null;
        const state = new SequencialState();

        // 节点未激活则直接返回
        if (!this.node.active) return state;

        let index = 0;
        const reel = this.node.getComponent(Reel);
        const stopWindow = reelStopWindow ?? SlotManager.Instance.getReelStopWindow();
        const machine = reelMachine ?? SlotManager.Instance.reelMachine;

        // 获取子游戏状态和旋转控制信息
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey) as ReelStrip;
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reel.reelindex] as any;

        // 获取结果符号列表并设置期望比例
        const resultSymbolList = this.getResultSymbolList(stopWindow.GetWindow(reel.reelindex), reel);
        const resultSymbolInfoList = this.getResultSymbolInfoList(stopWindow.GetWindow(reel.reelindex), reel);
        const resultSpecialSymbolInfoList = this.getResultSpecialSymbolInfoList(stopWindow.GetWindow(reel.reelindex), reel);
        
        const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
        gameComp!.setSingleLineExpectRatio(reel.reelindex, resultSymbolList);
        gameComp!.setUpDownFlag(reel.reelindex);

        // 卷轴旋转到停止前的状态
        const spinUntilStopState = this.getReelSpinStateUntileStopBeforeReelRenewal(
            machine.reels, reel, reelStrip, subGameKey
        );
        spinUntilStopState.flagSkipActive = true;
        spinUntilStopState.addOnStartCallback(() => {
            self._isAppear = false;
            // 设置旋转状态（可跳过/不可跳过）
            if (gameComp!._notSkipable === 1) {
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE);
            } else {
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_SKIPABLE);
            }

            // 检查前置卷轴是否激活
            let isFirstActiveReel = true;
            for (let i = reel.reelindex - 1; i >= 0; --i) {
                const prevReel = machine.reels[i].getComponent(Reel);
                if (prevReel.node.active === 1) {
                    isFirstActiveReel = false;
                    break;
                }
            }

            // 免费旋转模式下播放期望效果
            const leftCellCount = gameComp!.getLeftCellCount();
            const jackpotExpectFlag = gameComp!.getJackpotExpectFlag();
            const jackpotSingleExpectFlag = gameComp!.getJackpotSingleExpectFlag(self.getComponent(Reel)!.reelindex);
            if (
                reel.reelindex === 0 
                || leftCellCount === 1 
                || (jackpotExpectFlag === 1 && isFirstActiveReel) 
                || (jackpotSingleExpectFlag === 1 && isFirstActiveReel)
            ) {
                if (subGameKey !== "base") {
                    SlotManager.Instance.setPlayReelExpectForFreeSpin(reel.reelindex);
                }
            }

            reel.setShaderValue("blurOffset", 0.02);
        });
        state.insert(index++, spinUntilStopState);

        // 卷轴更新状态
        const reelRenewalState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReelRenewal(
            machine.reels, reel, reelStrip, subGameKey
        );
        reelRenewalState.flagSkipActive = true;
        state.insert(index++, reelRenewalState);

        // 构建缓动信息（区分大奖期望效果）
        const jackpotSymbolCnt = gameComp!.getJackpotSymbolCnt();
        const isJackpotExpect = gameComp!.getJackpotSingleExpectFlag(this.getComponent(Reel)!.reelindex) && jackpotSymbolCnt < 3;
        const upDownFlag = gameComp!.getUpDownFlag(this.getComponent(Reel)!.reelindex);

        let easingType: string, easingRate: number, easingDuration: number, easingDistance: number;
        if (spinControlInfo && (isJackpotExpect && upDownFlag > -1)) {
            easingType = spinControlInfo.postExEasingType;
            easingRate = spinControlInfo.postExEasingRate;
            easingDuration = spinControlInfo.postExEasingDuration;
            easingDistance = spinControlInfo.postExEasingDistance;
        } else if (spinControlInfo) {
            easingType = spinControlInfo.postEasingType;
            easingRate = spinControlInfo.postEasingRate;
            easingDuration = spinControlInfo.postEasingDuration;
            easingDistance = spinControlInfo.postEasingDistance;
        } else {
            easingType = "";
            easingRate = 0;
            easingDuration = 0;
            easingDistance = 0;
        }

        // 构建缓动信息对象
        const easingInfo = new (class implements EasingInfo {
            easingType: string = easingType;
            easingDistance: number = easingDistance;
            easingDuration: number = easingDuration;
            easingRate: number = easingRate;
            onEasingStartFuncList: (() => void)[] = [];
        })();
        easingInfo.onEasingStartFuncList.push(() => {
            if (!isJackpotExpect) {
                self.setShowExpectEffects(false);
            } else {
                reel.resetPositionOfReelComponents();
            }
        });

        // 添加停止缓动的回调
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 卷轴移动状态
        const reelMoveState = this.getReelMoveStateWithLastSymbolList(
            reel, resultSymbolList, subGameKey, easingInfo, resultSymbolInfoList, resultSpecialSymbolInfoList
        );
        reelMoveState.addOnStartCallback(() => {
            // 最后一个卷轴恢复主音量
            if (machine.reels.length - 1 === reel.reelindex) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }
            self.getComponent(Reel)!.resetAllSiblingIndex();
        });
        reelMoveState.addOnEndCallback(() => {
            self.playAppearAnimation(reel);
            // 第4个卷轴停止旋转音效
            if (reel.reelindex === 4) SlotManager.Instance.stopReelSpinSound();
        });
        state.insert(index++, reelMoveState);

        // 旋转结束处理状态
        const spinEndState = new State();
        spinEndState.addOnStartCallback(() => {
            reel.resetPositionOfReelComponents();
            reel.setShaderValue("blurOffset", 0);
            // 最后一个卷轴恢复主音量
            if (machine.reels.length - 1 === reel.reelindex) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }
            self.setShowExpectEffects(false);
            SlotSoundController.Instance().stopAudio("ReelExpect", "FX");

            // 设置下一个卷轴的期望效果
            const nextReelIndex = reel.reelindex + 1;
            if (nextReelIndex < SlotManager.Instance.reelMachine.reels.length) {
                const nextReel = SlotManager.Instance.reelMachine.reels[nextReelIndex].getComponent(Reel);
                if (nextReel.node.active === 1) {
                    SlotManager.Instance.setPlayReelExpectForFreeSpin(nextReelIndex);
                } else if (nextReel.node.active === 0 && reel.reelindex === 0) {
                    SlotManager.Instance.setPlayReelExpectForFreeSpin(nextReelIndex + 1);
                }
            }

            self.processSpinEnd(spinEndState.setDone.bind(spinEndState));
        });
        state.insert(index++, spinEndState);

        return state;
    }

    /**
     * 获取卷轴旋转到停止前的状态（更新前）
     * @param reels 卷轴数组
     * @param reel 目标卷轴
     * @param reelStrip 卷轴条数据
     * @param subGameKey 子游戏标识
     * @returns 状态对象
     */
    public getReelSpinStateUntileStopBeforeReelRenewal(reels: cc.Node[], reel: Reel, reelStrip: ReelStrip, subGameKey: string): State {
        const state = new State();
        const reelData = reelStrip.getReel(reel.reelindex);
        let moveAction: any = null;

        // 检查空白符号并控制下一个符号索引
        reelData.checkBlankSymbolAndControlNextSymbolIndex(reel);

        state.addOnStartCallback(() => {
            reel.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            let totalTime = 0;
            const spinRequestTime = SlotManager.Instance.getTimeSecSpinRequest();

            // 累加前置卷轴的旋转/停止时间
            for (let i = 0; i < reels.length; ++i) {
                const currReel = reels[i].getComponent(Reel);
                if (currReel.node.active && currReel.reelindex < reel.reelindex) {
                    totalTime += currReel.getReelSpinTimeRenewal(reels, spinRequestTime, subGameKey);
                    totalTime += currReel.getReelStopTime(subGameKey);

                    // 免费旋转模式下大奖期望效果额外延迟
                    const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
                    const jackpotExpectFlag = gameComp!.getJackpotSingleExpectFlag(currReel.reelindex);
                    const upDownFlag = gameComp!.getUpDownFlag(currReel.reelindex);
                    if (subGameKey !== "base" && jackpotExpectFlag === 1 && upDownFlag > -1) {
                        totalTime += 3;
                    }
                }
            }

            // 获取旋转控制参数
            let oneSymbolMoveSpeed = 0;
            let symbolHeight = 0;
            if (subGameKey) {
                const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reel.reelindex] as any;
                oneSymbolMoveSpeed = spinControlInfo.oneSymbolMoveSpeed;
                symbolHeight = spinControlInfo.symbolHeight;
            }

            // 计算移动距离和动作
            const moveCount = totalTime / oneSymbolMoveSpeed;
            const moveDistance = new cc.Vec2(0, -moveCount * symbolHeight);
            const moveBy = cc.moveBy(totalTime, moveDistance);

            // 设置下一个符号ID回调
            reel.setNextSymbolIdCallback(() => {
                const symbolId = reelData.getNextSymbolId();
                reelData.increaseNextSymbolIndex();
                return symbolId;
            });

            // 执行移动动作
            moveAction = reel.node.runAction(cc.sequence(moveBy, cc.callFunc(state.setDone.bind(state))));
        });

        // 结束回调：停止未完成的动作
        state.addOnEndCallback(() => {
            if (moveAction && !moveAction.isDone()) {
                reel.node.stopAction(moveAction);
            }
        });

        return state;
    }

    /**
     * 获取当前卷轴的更新旋转状态
     * @param reels 卷轴数组
     * @param reel 目标卷轴
     * @param reelStrip 卷轴条数据
     * @param subGameKey 子游戏标识
     * @returns 状态对象
     */
    public getReelSpinStateCurrentReelRenewal(reels: Node[], reel: Reel, reelStrip: ReelStrip, subGameKey: string): State {
        const state = new State();
        const reelData = reelStrip.getReel(reel.reelindex);
        let moveAction: any = null;

        state.addOnStartCallback(() => {
            reel.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            reelData.checkBlankSymbolAndControlNextSymbolIndex(reel);

            // 获取旋转控制参数
            let oneSymbolMoveSpeed = 0;
            let symbolHeight = 0;
            let maxSpeedInExpectEffect = 0;
            if (subGameKey) {
                const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reel.reelindex] as any;
                oneSymbolMoveSpeed = spinControlInfo.oneSymbolMoveSpeed;
                symbolHeight = spinControlInfo.symbolHeight;
                maxSpeedInExpectEffect = spinControlInfo.maxSpeedInExpectEffect;
            }

            // 计算旋转时间
            const spinRequestTime = SlotManager.Instance.getTimeSecSpinRequest();
            const spinTime = reel.getReelSpinTimeRenewal(reels, spinRequestTime, subGameKey);

            // 确定移动速度（区分期望效果）
            const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
            const jackpotExpectFlag = gameComp!.getJackpotSingleExpectFlag(reel.reelindex);
            const upDownFlag = gameComp!.getUpDownFlag(reel.reelindex);
            
            let moveSpeed = oneSymbolMoveSpeed;
            if (SlotUIRuleManager.Instance.getExpectEffectFlag(reel.reelindex, SlotGameResultManager.Instance.getVisibleSlotWindows())) {
                moveSpeed = maxSpeedInExpectEffect;
            } else if (subGameKey !== "base" && jackpotExpectFlag === 1 && upDownFlag > -1) {
                moveSpeed = maxSpeedInExpectEffect;
            }

            // 计算移动距离和动作
            const moveCount = Math.floor(spinTime / moveSpeed);
            const moveDistance = new cc.Vec2(0, -moveCount * reel.symbolHeight);
            const moveBy = cc.moveBy(spinTime, moveDistance);

            // 设置下一个符号ID回调
            reel.setNextSymbolIdCallback(() => {
                const symbolId = reelData.getNextSymbolId();
                reelData.increaseNextSymbolIndex();
                return symbolId;
            });

            // 执行移动动作
            moveAction = reel.node.runAction(cc.sequence(moveBy, cc.callFunc(state.setDone.bind(state))));
        });

        // 结束回调：停止未完成的动作，更新卷轴状态
        state.addOnEndCallback(() => {
            if (moveAction && !moveAction.isDone()) {
                reel.node.stopAction(moveAction);
            }
            reel.update();
            // 最后一个卷轴设置为不可跳过状态
            if (reel.reelindex === SlotGameRuleManager.Instance._slotWindows.size - 1) {
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE);
            }
        });

        return state;
    }

    /**
     * 获取带最后符号列表的卷轴移动状态（区分基础游戏/免费旋转）
     * @param reel 目标卷轴
     * @param symbolList 符号列表
     * @param subGameKey 子游戏标识
     * @param easingInfo 缓动信息
     * @param symbolInfoList 符号信息列表
     * @param specialSymbolInfoList 特殊符号信息列表
     * @returns 顺序执行状态
     */
    public getReelMoveStateWithLastSymbolList(
        reel: Reel,
        symbolList: number[],
        subGameKey: string,
        easingInfo: EasingInfo,
        symbolInfoList?: any[],
        specialSymbolInfoList?: SpecialSymbolInfo[]
    ): SequencialState {
        symbolInfoList = symbolInfoList ?? null;
        specialSymbolInfoList = specialSymbolInfoList ?? null;

        const state = new SequencialState();
        let index = 0;
        const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
        const jackpotExpectFlag = gameComp!.getJackpotSingleExpectFlag(reel.reelindex);
        const upDownFlag = gameComp!.getUpDownFlag(reel.reelindex);

        // 区分基础游戏/免费旋转/大奖期望效果的卷轴移动逻辑
        if (subGameKey === "base") {
            state.insert(index++, ReelSpinBehaviors.Instance.getReelMoveStateWithLastSymbolListNew(
                reel, symbolList, subGameKey, easingInfo, symbolInfoList, specialSymbolInfoList
            ));
        } else if (jackpotExpectFlag === 1 && upDownFlag > -1) {
            state.insert(index++, this.getReelMoveStateWithLastSymbolListNew(
                reel, symbolList, subGameKey, easingInfo, symbolInfoList, specialSymbolInfoList
            ));
        } else {
            state.insert(index++, ReelSpinBehaviors.Instance.getReelMoveStateWithLastSymbolListNew(
                reel, symbolList, subGameKey, easingInfo, symbolInfoList, specialSymbolInfoList
            ));
        }

        // 添加旋转结束事件状态
        state.insert(index++, this.getSpinEndEventState());

        return state;
    }

    /**
     * 新的带最后符号列表的卷轴移动状态（处理大奖期望效果）
     * @param reel 目标卷轴
     * @param symbolList 符号列表
     * @param subGameKey 子游戏标识
     * @param easingInfo 缓动信息
     * @param symbolInfoList 符号信息列表
     * @param specialSymbolInfoList 特殊符号信息列表
     * @returns 状态对象
     */
    public getReelMoveStateWithLastSymbolListNew(
        reel: Reel,
        symbolList: number[],
        subGameKey: string,
        easingInfo: EasingInfo,
        symbolInfoList?: any[],
        specialSymbolInfoList?: SpecialSymbolInfo[]
    ): State {
        symbolInfoList = symbolInfoList ?? null;
        specialSymbolInfoList = specialSymbolInfoList ?? null;

        const state = new State();
        let symbolHeight = 0;
        let oneSymbolMoveSpeed = 0;
        let moveAction: any = null;
        let symbolIndex = 0;
        let symbolInfoIndex = 0;
        let specialSymbolInfoIndex = 0;

        // 获取旋转控制参数
        if (subGameKey) {
            const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reel.reelindex] as any;
            symbolHeight = spinControlInfo.symbolHeight;
            oneSymbolMoveSpeed = spinControlInfo.oneSymbolMoveSpeed;
        }

        state.addOnStartCallback(() => {
            reel.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            const lastSymbol = reel.getLastSymbol();
            const lastSymbolY = reel.getPositionY(lastSymbol.node.y);
            const bufferRowHeight = reel.bufferRow * symbolHeight;

            // 检查是否有锁符号
            const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
            const jackpotExpectFlag = gameComp!.getJackpotSingleExpectFlag(reel.reelindex);
            const upDownFlag = gameComp!.getUpDownFlag(reel.reelindex);
            let hasLockSymbol = false;

            for (let i = 0; i < symbolList.length - 2; ++i) {
                if (symbolList[i] > 90 && gameComp!.lockSymbolLayer.checkLockSymbolPosition(reel.reelindex, i) === 0) {
                    hasLockSymbol = true;
                    break;
                }
            }

            // 大奖期望效果下替换符号
            if (!hasLockSymbol && jackpotExpectFlag === 1 && upDownFlag === 0) {
                reel.getComponent(Reel_DragonOrbs)!.changeLastSymbol(91);
            } else if (!hasLockSymbol && jackpotExpectFlag === 1 && upDownFlag === 1) {
                symbolList[3] = 91;
            }

            // 计算移动目标位置
            let targetY = lastSymbolY + (symbolList.length * symbolHeight - (easingInfo?.easingDistance ?? 0)) - bufferRowHeight;
            let easingDistance = easingInfo?.easingDistance ?? 0;
            if (!easingInfo) {
                targetY = lastSymbolY + symbolList.length * symbolHeight - bufferRowHeight;
            }

            // 设置符号/信息回调
            reel.setNextSymbolIdCallback(() => {
                let symbolId: number | undefined;
                if (symbolIndex < symbolList.length) {
                    symbolId = symbolList[symbolIndex];
                    symbolIndex++;
                }
                return symbolId;
            });

            reel.setNextSymbolInfoCallback(() => {
                let symbolInfo = null;
                if (symbolInfoList && symbolInfoIndex < symbolInfoList.length) {
                    symbolInfo = symbolInfoList[symbolInfoIndex];
                    symbolInfoIndex++;
                }
                return symbolInfo;
            });

            reel.setNextSpecialInfoCallback(() => {
                let specialInfo = new SpecialSymbolInfo(0);
                if (specialSymbolInfoList && specialSymbolInfoIndex < specialSymbolInfoList.length) {
                    specialInfo = specialSymbolInfoList[specialSymbolInfoIndex];
                    specialSymbolInfoIndex++;
                }
                return specialInfo;
            });

            // 构建移动动作（区分大奖期望效果）
            let move1: any, move2: any, easeMove: any;
            const moveTime = Math.abs(oneSymbolMoveSpeed * (targetY / symbolHeight));

            if (jackpotExpectFlag === 1 && upDownFlag === 1) {
                targetY += easingInfo.easingDistance;
                move1 = cc.moveBy(0.2, new cc.Vec2(0, -targetY));
                move2 = cc.moveBy(3, new cc.Vec2(0, -easingDistance));
                if (easingInfo) {
                    const easeAction = ReelSpinBehaviors.Instance.getEaseAction(easingInfo.easingType, easingInfo.easingRate);
                    easeMove = cc.moveBy(easingInfo.easingDuration, new cc.Vec2(0, easingDistance)).easing(easeAction);
                }
            } else if (jackpotExpectFlag === 1 && upDownFlag === 0) {
                targetY = lastSymbolY + (symbolList.length * symbolHeight - easingInfo.easingDistance) - bufferRowHeight;
                targetY -= easingInfo.easingDistance;
                move1 = cc.moveBy(moveTime, new cc.Vec2(0, -targetY));
                move2 = cc.moveBy(3, new cc.Vec2(0, -easingInfo.easingDistance));
                if (easingInfo) {
                    const easeAction = ReelSpinBehaviors.Instance.getEaseAction("easeBackOut", easingInfo.easingRate);
                    easeMove = cc.moveBy(easingInfo.easingDuration, new cc.Vec2(0, -easingDistance)).easing(easeAction);
                }
            } else {
                move1 = cc.moveBy(moveTime, new cc.Vec2(0, -targetY));
                if (easingInfo) {
                    const easeAction = ReelSpinBehaviors.Instance.getEaseAction(easingInfo.easingType, easingInfo.easingRate);
                    easeMove = cc.moveBy(easingInfo.easingDuration, new cc.Vec2(0, -easingDistance)).easing(easeAction);
                }
            }

            // 完成回调
            const completeFunc = cc.callFunc(() => {
                state.setDone();
            });

            // 执行动作序列
            if (!easeMove) {
                moveAction = reel.node.runAction(cc.sequence(move1, completeFunc));
            } else if (easingInfo.onEasingStartFuncList.length > 0) {
                const easingStartFunc = cc.callFunc(() => {
                    for (const func of easingInfo.onEasingStartFuncList) {
                        func();
                    }
                });

                if (jackpotExpectFlag === 1 && upDownFlag === 1) {
                    moveAction = reel.node.runAction(cc.sequence([move1, easingStartFunc, move2, easeMove, completeFunc]));
                } else if (jackpotExpectFlag === 1 && upDownFlag === 0) {
                    moveAction = reel.node.runAction(cc.sequence([
                        move1, 
                        cc.callFunc(() => cc.log("UPDOWN:" + reel.node.y)), 
                        move2, 
                        easeMove, 
                        completeFunc
                    ]));
                } else {
                    moveAction = reel.node.runAction(cc.sequence([move1, easingStartFunc, easeMove, completeFunc]));
                }
            } else {
                moveAction = reel.node.runAction(cc.sequence([move1, easeMove, completeFunc]));
            }
        });

        // 结束回调：补充剩余符号，处理旋转后逻辑
        state.addOnEndCallback(() => {
            reel.node.stopAction(moveAction);
            // 补充剩余符号到卷轴顶部
            while (symbolIndex < symbolList.length) {
                if (symbolIndex < symbolList.length) {
                    const symbolId = symbolList[symbolIndex];
                    const symbolInfo = symbolInfoList && symbolInfoList.length > symbolInfoIndex ? symbolInfoList[symbolInfoIndex] : null;
                    reel.pushSymbolAtTopOfReel(symbolId, symbolInfo);
                } else {
                    cc.error("invalid status tweenAction ");
                }
                symbolIndex++;
                symbolInfoIndex++;
            }
            // 处理旋转停止后的逻辑
            reel.processAfterStopSpin();
        });

        return state;
    }

    /**
     * 播放符号出现动画
     * @param reel 目标卷轴
     */
    public playAppearAnimation(reel: Reel): void {
        const self = this;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const window = lastHistoryWindows.GetWindow(reel.reelindex);
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        let playSound = false;

        // 遍历所有行播放动画
        const playSymbolAni = (rowIndex: number) => {
            const symbolVal = window.getSymbol(rowIndex);
            const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
            const isLockSymbol = gameComp!.lockSymbolLayer.checkLockSymbolPosition(reel.reelindex, rowIndex);

            // 符合条件的符号播放出现动画
            if (
                (symbolVal === 91 && SlotUIRuleManager.Instance.canPlayingAppearSymbomEffect(91, lastHistoryWindows, reel.reelindex)) 
                || (symbolVal > 91 && isLockSymbol === 0)
            ) {
                reel.getSymbol(rowIndex).active = false;
                self._isAppear = true;

                // 修正符号值
                let symbolId = symbolVal;
                if (symbolId > 100) symbolId -= 100;
                if (subGameKey !== "base" && symbolId % 2 === 1) symbolId -= 1;

                // 基础游戏模式下播放免费旋转计数音效
                if (subGameKey === "base" && symbolId > 91) {
                    SlotSoundController.Instance().playAudio("AddFreeSpinCnt", "FX");
                    gameComp!.featureComponents.movingOrbSymbol(reel.reelindex, rowIndex, symbolId);
                } else {
                    playSound = true;
                    // 播放符号动画
                    const aniSymbol = SymbolAnimationController.Instance.playAnimationSymbol(
                        reel.reelindex, rowIndex, symbolId + 100, null, null, false
                    );
                    const jackpotSymbol = aniSymbol.getComponent(JackpotSymbol_DragonOrbs);
                    if (TSUtility.isValid(jackpotSymbol)) {
                        jackpotSymbol.init();
                        // 免费旋转模式下设置符号信息
                        if (subGameKey !== "base") {
                            const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[reel.reelindex][rowIndex];
                            if (TSUtility.isValid(symbolInfo) && TSUtility.isValid(jackpotSymbol)) {
                                jackpotSymbol.setSymbol(symbolInfo);
                            }
                        }
                    }

                    // 延迟释放动画符号，添加锁符号
                    this.scheduleOnce(() => {
                        if (subGameKey !== "base") {
                            SymbolAnimationController.Instance.releaseAnimationSymbol_byKey(reel.reelindex, rowIndex);
                            gameComp!.lockSymbolLayer.addLockSymbol(reel.reelindex, rowIndex, symbolId);
                        }
                    }, 0.3);
                }
            }
        };

        // 遍历所有行
        for (let rowIndex = 0; rowIndex < window.size; ++rowIndex) {
            playSymbolAni(rowIndex);
        }

        // 播放出现音效
        if (playSound) {
            if (subGameKey === "base") {
                SlotSoundController.Instance().playAudio("ScatterAppear_1", "FX");
            } else {
                SlotSoundController.Instance().playAudio("ScatterAppear_3", "FX");
            }
        }
    }

    /**
     * 设置期望效果显示状态
     * @param isShow 是否显示
     */
    public setShowExpectEffects(isShow: boolean): void {
        // 跳过当前旋转则不显示
        if (!isShow || SlotManager.Instance.isSkipCurrentSpin === 1) return;

        const reel = this.getComponent(Reel);
        const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
        const isJackpotExpect = gameComp!.getJackpotExpectFlag() === 1 
            || (gameComp!.getJackpotSingleExpectFlag(reel!.reelindex) === 1 && gameComp!.getUpDownFlag(reel!.reelindex) > -1);
        const leftCellCount = gameComp!.getLeftCellCount() === 1;
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();

        // 基础游戏模式
        if (subGameKey === "base") {
            this.expectEffects[0].active = isShow;
        }
        // 免费旋转+大奖期望
        else if (subGameKey !== "base" && isJackpotExpect) {
            this.expectEffects[1].active = isShow;
            this.expectEffects[1].x = 145 + 200 * (reel!.reelindex - 1);
        }
        // 剩余单元格
        else if (leftCellCount) {
            const emptyRowIndex = gameComp!.lockSymbolLayer.getEmptyRowIndex();
            this.expectEffects[2].active = isShow;
            this.expectEffects[2].x = 145 + 200 * (reel!.reelindex - 1);
            this.expectEffects[2].y = 148 * (1 - emptyRowIndex);
        }
    }

    /**
     * 处理旋转结束逻辑
     * @param callback 完成回调
     */
    public processSpinEnd(callback: () => void): void {
        // 有出现动画则延迟执行
        if (this._isAppear) {
            this.scheduleOnce(() => {
                callback();
            }, 0.3);
        } else {
            callback();
        }
        this._isAppear = false;
        cc.log("processSpinEnd");
    }

    /**
     * 获取结果符号列表（补充dummy符号）
     * @param window 窗口数据
     * @param reel 目标卷轴
     * @returns 符号列表
     */
    public getResultSymbolList(window: any, reel: Reel): number[] {
        const symbolList: number[] = [];
        // 计算需要补充的dummy符号数量
        const needDummyCount = Math.max(0, (reel.visibleRow + 2 * reel.bufferRow - window.size) / 2);

        // 反向添加窗口符号
        for (let i = window.size - 1; i >= 0; --i) {
            symbolList.push(window.getSymbol(i));
        }

        // 检查是否有特殊符号
        const symbolArray = window.getSymbolArray();
        let hasSpecialSymbol = false;
        for (const symbol of symbolArray) {
            if (symbol > 90) {
                hasSpecialSymbol = true;
                break;
            }
        }

        // 选择dummy符号列表
        const dummyList = hasSpecialSymbol 
            ? [71, 72, 73, 31, 22, 21, 13, 12, 11] 
            : this.dummySymbolList;

        // 补充随机dummy符号
        for (let i = 0; i < needDummyCount; ++i) {
            const randomIndex = Math.floor(Math.random() * dummyList.length);
            symbolList.push(dummyList[randomIndex]);
        }

        return symbolList;
    }
}