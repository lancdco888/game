const { ccclass } = cc._decorator;


import CameraControl from '../../Slot/CameraControl';
import Reel from '../../Slot/Reel';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import SlotSoundController from '../../Slot/SlotSoundController';
import State, { SequencialState } from '../../Slot/State';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import { BottomTextType } from '../../SubGame/BottomUIText';
import SubGameStateManager_Base from '../../SubGameStateManager_Base';
import GameComponents_Base from '../../game/GameComponents_Base';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameResultManager, { SpinResult } from '../../manager/SlotGameResultManager';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotManager from '../../manager/SlotManager';
import SoundManager from '../../manager/SoundManager';
import { SymbolInfo } from '../../manager/SymbolPoolManager';
// 导入龙珠游戏自定义组件
import GameComponents_DragonOrbs from './GameComponents_DragonOrbs';
import JackpotSymbol_DragonOrbs from './JackpotSymbol_DragonOrbs';
import ReelController_DragonOrbs from './ReelController_DragonOrbs';
import Reel_DragonOrbs from './Reel_DragonOrbs';


// ===================== 龙珠游戏子游戏状态管理器 =====================
/**
 * 龙珠游戏子游戏状态管理器
 * 管理基础游戏、免费旋转选择/运行/结束等核心状态，包含满窗/转盘/大奖检查、UI切换、动画/音效控制
 */
@ccclass('SubGameStateManager_DragonOrbs')
export default class SubGameStateManager_DragonOrbs extends SubGameStateManager_Base {
    // ===================== 单例模式（与原JS完全一致） =====================
    private static _instance: SubGameStateManager_DragonOrbs | null = null;

    /** 获取单例实例 */
    public static Instance(): SubGameStateManager_DragonOrbs {
        if (SubGameStateManager_DragonOrbs._instance === null) {
            SubGameStateManager_DragonOrbs._instance = new SubGameStateManager_DragonOrbs();
        }
        return SubGameStateManager_DragonOrbs._instance;
    }

    // ===================== 私有状态变量（与原JS一致，补充类型注解） =====================
    /** 免费旋转前的金额 */
    private _freeSpinBeforeMoney: number = 0;

    // ===================== 核心状态管理方法（与原JS逻辑1:1保留） =====================
    /**
     * 获取基础游戏状态
     * @returns 顺序执行状态对象
     */
    public getBaseGameState(): SequencialState {
        const self = this;
        const baseState = new SequencialState();
        let index = 0;
        const preState = new SequencialState();

        // 预执行状态：设置子游戏播放标记、停止单行动画、停止符号动画、更新底部UI等
        preState.insert(index++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        preState.insert(index++, this.getStopSingleLineActionState());
        preState.insert(index++, this.getStopAllSymbolAniState());
        preState.insert(index++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
        preState.insert(index++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(0));
        preState.insert(index++, this.getClearAllScheduleState());
        preState.insert(index++, SlotManager.Instance.getReelSpinStartState());

        // 主执行状态：处理旋转请求、卷轴旋转、中奖结果展示等
        const mainState = new SequencialState();
        mainState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                mainState.insert(index++, SlotManager.Instance.reelMachine.getNormalSpinReelStateRenewal());
                mainState.insert(index++, self.getScrollDownBeforeWinResultState());
                mainState.insert(index++, self.getShowTotalTriggeredPaylineState());
                mainState.insert(index, self.getSetBottomInfoIncreaseWinMoneyState());
                mainState.insert(index, self.getSetBGSoundOnShowWinEffectState());

                const symbolEffectState = new SequencialState();
                symbolEffectState.insert(0, self.getStateShowTotalSymbolEffectOnPayLines());
                symbolEffectState.insert(1, self.getSingleLineEffectOnPaylineState());
                mainState.insert(index, symbolEffectState);

                mainState.insert(index++, self.getWinMoneyState());
                mainState.insert(index++, self.getResetBGSoundRatioState());
                mainState.insert(index++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
                mainState.insert(index++, self.getCheckFreeSpinStartState());
            }
        });

        // 组合预状态和主状态
        baseState.insert(0, preState);
        baseState.insert(1, mainState);
        return baseState;
    }

    /**
     * 清除所有卷轴调度器
     * @returns 状态对象
     */
    public getClearAllScheduleState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            // 遍历3个卷轴，清除所有回调
            for (let i = 0; i < 3; ++i) {
                const reelNode = SlotManager.Instance.reelMachine.reels[i];
                if (TSUtility.isValid(reelNode)) {
                    const reelCtrl = reelNode.getComponent(ReelController_DragonOrbs);
                    if (TSUtility.isValid(reelCtrl)) {
                        reelCtrl.unscheduleAllCallbacks();
                    }
                }
            }
            state.setDone();
        });
        return state;
    }

    /**
     * 获取免费旋转选择状态
     * @returns 顺序执行状态对象
     */
    public getFreeSpinChooseState(): SequencialState {
        const self = this;
        const chooseState = new SequencialState();
        const preState = new SequencialState();

        // 预执行状态：相机移动、打开选择弹窗、设置选择项、等待选择
        preState.insert(0, this.getCameraMoveState());
        preState.insert(1, this.getOpenChoosePopupState());
        preState.insert(2, SlotManager.Instance.getComponent(GameComponents_DragonOrbs)!.getSettingChooseItemState());
        preState.insert(3, SlotManager.Instance.getComponent(GameComponents_DragonOrbs)!.getWaitSelectFreeSpinState());

        // 主执行状态：处理旋转请求、显示触发模式、关闭弹窗、切换到免费旋转UI
        const mainState = new SequencialState();
        mainState.addOnStartCallback(() => {
            let idx = 0;
            if (SlotManager.Instance.flagSpinRequest === 1) {
                mainState.insert(idx++, SlotManager.Instance.getComponent(GameComponents_DragonOrbs)!.getShowTriggerModeState());
                mainState.insert(idx++, SlotManager.Instance.getComponent(GameComponents_DragonOrbs)!.getCloseChoosePopupState());
                mainState.insert(idx++, self.getResetBGSoundRatioState());
                mainState.insert(idx++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
                mainState.insert(idx++, self.getChangeUIToFreeSpinState());
            }
        });

        // 组合预状态和主状态
        chooseState.insert(0, preState);
        chooseState.insert(1, mainState);
        return chooseState;
    }

    /**
     * 获取免费旋转运行状态
     * @returns 顺序执行状态对象
     */
    public getFreeSpinState(): SequencialState {
        const self = this;
        const freeSpinState = new SequencialState();
        let index = 0;
        const preState = new SequencialState();

        // 预执行状态：重置比例、设置子游戏标记、停止动画、更新免费旋转计数、更新底部UI等
        preState.insert(index++, this.getResetRatioState());
        preState.insert(index++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        preState.insert(index++, this.getStopSingleLineActionState());
        preState.insert(index++, this.getStopAllSymbolAniState());
        preState.insert(index, SlotManager.Instance.getIncreaseFreespinPastCountStateRenewal());
        preState.insert(index++, this.getBottomInfoState());
        preState.insert(index++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(SlotGameResultManager.Instance.winMoneyInFreespinMode));
        preState.insert(index++, SlotManager.Instance.getReelSpinStartState());

        // 主执行状态：处理旋转请求、卷轴旋转、满窗/转盘/大奖检查、奖励合并等
        const mainState = new SequencialState();
        mainState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                mainState.insert(index++, SlotManager.Instance.reelMachine.getFreeSpinReelStateRenewal());
                mainState.insert(index++, self.getScrollDownBeforeWinResultState());
                mainState.insert(index++, self.getSetBottomInfoIncreaseWinMoneyState());
                mainState.insert(index++, self.getCheckFullWindowState());
                mainState.insert(index++, self.getCheckWheelStartState());
                mainState.insert(index++, self.getWaitUntilWheelEndState());
                mainState.insert(index++, self.getDisapplyWheelState());
                mainState.insert(index++, self.getApplyWheelBonusState());
                mainState.insert(index++, self.getCheckJackpotState());
                mainState.insert(index++, self.getStateShowBigWinEffectOnlyTriggerJackpot());
                mainState.insert(index++, self.getCreateCenterFrameState());
                mainState.insert(index++, self.getMergePrizeState());
                mainState.insert(index++, self.getResetBGSoundRatioState());

                // 延迟状态 + 检查免费旋转结束
                const delayState = new SequencialState();
                const delay = new State();
                delay.addOnStartCallback(() => {
                    SlotManager.Instance.scheduleOnce(() => {
                        delay.setDone();
                    }, 0.5);
                });
                delayState.insert(0, delay);
                delayState.insert(1, self.getCheckEndFreeSpinState());
                mainState.insert(index++, delayState);

                mainState.insert(index++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
            }
        });

        // 组合预状态和主状态
        freeSpinState.insert(0, preState);
        freeSpinState.insert(1, mainState);
        return freeSpinState;
    }

    /**
     * 获取符号特效展示状态
     * @returns 状态对象
     */
    public getStateShowTotalSymbolEffectOnPayLines(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            // 根据中奖金额判断特效时长
            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
            const effectTime = totalWin > 3 * totalBet 
                ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2
                : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

            if (self.showTotalSymbolEffectOnPaylines()) {
                SlotManager.Instance.scheduleOnce(() => {
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    self.setDimmDeActiveTotalSymbolOnPaylines();
                    state.setDone();
                }, effectTime);
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 检查满窗状态（bonusWheelTrigger≥1）
     * @returns 状态对象
     */
    public getCheckFullWindowState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            if (self.getIsFull() !== 0) {
                // 临时降低主音量，播放满窗音效
                SlotSoundController.Instance().setMainVolumeTemporarily(0.1);
                SlotSoundController.Instance().playAudio("JackpotFull", "FX");

                // 隐藏锁符号层
                const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
                if (TSUtility.isValid(gameComp) && TSUtility.isValid(gameComp.lockSymbolLayer)) {
                    gameComp.lockSymbolLayer.node.opacity = 0;
                }

                // 遍历历史窗口，播放满窗符号动画
                const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows() as any;
                for (let reelIdx = 0; reelIdx < lastHistoryWindows.size; ++reelIdx) {
                    const window = lastHistoryWindows.GetWindow(reelIdx);
                    for (let rowIdx = 0; rowIdx < window.size; ++rowIdx) {
                        let symbolVal = window.getSymbol(rowIdx);
                        if (symbolVal > 91) {
                            // 修正符号值
                            if (symbolVal > 100) symbolVal -= 100;
                            if (symbolVal % 2 === 1) symbolVal -= 1;

                            // 隐藏原符号，播放动画符号
                            const reel = SlotManager.Instance.reelMachine.reels[reelIdx].getComponent(Reel);
                            reel.hideSymbolInRow(rowIdx);
                            const aniSymbol = SymbolAnimationController.Instance.playAnimationSymbolAbsoluteCoordinate(reelIdx, rowIdx, symbolVal + 500, null);
                            
                            // 设置大奖金额（中心位置特殊处理）
                            if (TSUtility.isValid(aniSymbol)) {
                                const jackpotComp = aniSymbol.getComponent(JackpotSymbol_DragonOrbs);
                                const accumulatePrize = gameComp!.lockSymbolLayer.getAccumulatePrize();
                                if (accumulatePrize > 0 && reelIdx === 1 && rowIdx === 1) {
                                    jackpotComp.setFixedMoney(accumulatePrize);
                                } else {
                                    jackpotComp.setSymbol(SlotGameResultManager.Instance.getResultSymbolInfoArray()[reelIdx][rowIdx]);
                                }
                            }
                        }
                    }
                }

                // 2秒后恢复锁符号层，停止动画
                SlotManager.Instance.scheduleOnce(() => {
                    if (TSUtility.isValid(gameComp) && TSUtility.isValid(gameComp.lockSymbolLayer)) {
                        gameComp.lockSymbolLayer.node.opacity = 255;
                    }
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    state.setDone();
                }, 2);
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 检查转盘启动状态
     * @returns 状态对象
     */
    public getCheckWheelStartState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            if (self.getIsFull() === 1) {
                // 获取当前子游戏状态，确定转盘触发类型
                const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
                const gaugeKeys = Object.keys(subGameState.gauges);
                
                let triggerType = "";
                for (let i = 0; i < gaugeKeys.length; ++i) {
                    const key = gaugeKeys[i];
                    if (subGameState.gauges[key] === 1 
                        && key !== "bonusWheelTrigger" 
                        && key !== "randomJackpot" 
                        && key !== "centerPot") {
                        triggerType = key;
                        break;
                    }
                }

                // 触发左侧UI动画和转盘，4秒后显示转盘
                const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
                gameComp!.wheelLeftUI.trigger();
                gameComp!.wheelTrigger();
                SlotManager.Instance.scheduleOnce(() => {
                    gameComp!.wheelComponent.appearWheel(triggerType, state.setDone.bind(state));
                }, 4);
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 等待转盘结束状态
     * @returns 状态对象
     */
    public getWaitUntilWheelEndState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            if (self.getIsFull() === 1) {
                const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
                gameComp!.wheelComponent.startSpin(state.setDone.bind(state));
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 判断是否满窗（bonusWheelTrigger≥1）
     * @returns 1:满窗 0:非满窗
     */
    public getIsFull(): number {
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
        return TSUtility.isValid(subGameState.gauges.bonusWheelTrigger) && subGameState.gauges.bonusWheelTrigger >= 1 ? 1 : 0;
    }

    /**
     * 隐藏转盘状态
     * @returns 状态对象
     */
    public getDisapplyWheelState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            if (self.getIsFull() === 1) {
                // 恢复主音量，隐藏转盘
                SlotSoundController.Instance().resetTemporarilyMainVolume();
                const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
                gameComp!.wheelComponent.disappearWheel(state.setDone.bind(state));
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 应用转盘奖励状态
     * @returns 状态对象
     */
    public getApplyWheelBonusState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);

            // 更新免费旋转计数或倍数
            if (SlotManager.Instance._freespinTotalCount < subGameState.totalCnt) {
                const symbolId = self.getSymbolIdByCurrentMode(subGameKey);
                const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
                gameComp!.featureComponents.updateCntInFreeSpin(symbolId);
                SlotManager.Instance._freespinTotalCount = subGameState.totalCnt;
            } else if (SlotManager.Instance._freespinMultiplier < SlotManager.Instance.getGauges("spinMultiplier")) {
                SlotManager.Instance._freespinMultiplier = SlotManager.Instance.getGauges("spinMultiplier");
                const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
                gameComp!.featureComponents.updateMultiplier(subGameKey);
            }

            // 更新免费旋转额外信息
            SlotManager.Instance.setFreespinExtraInfoByCurrentState();
            state.setDone();
        });
        return state;
    }

    /**
     * 检查大奖状态
     * @returns 状态对象
     */
    public getCheckJackpotState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const jackpotResults = (SlotGameResultManager.Instance.getSpinResult() as any).jackpotResults;
            if (jackpotResults.length > 0) {
                // 禁用输入事件
                SlotManager.Instance.setKeyboardEventFlag(false);
                SlotManager.Instance.setMouseDragEventFlag(false);

                const jackpot = jackpotResults[0];
                const jackpotText = jackpot.jackpotSubKey.toUpperCase() + " JACKPOT";
                
                // 更新底部UI和大奖展示
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, jackpotText);
                SlotManager.Instance.bottomUIText.setWinMoney(jackpot.winningCoin);
                
                const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
                gameComp!.jackpotDisplay.setPlayingState(jackpot.jackpotSubKey, false);
                gameComp!.jackpotDisplay.setShowingMoney(jackpot.jackpotSubKey, jackpot.winningCoin);
                
                // 打开大奖弹窗
                gameComp!.jackpotResultPopup.open(jackpot.winningCoin, 0, jackpot.jackpotSubID, 1, state.setDone.bind(state));
                SlotGameResultManager.Instance.winMoneyInFreespinMode += jackpot.winningCoin;

                // 结束回调：恢复输入事件和大奖展示状态
                state.addOnEndCallback(() => {
                    gameComp!.jackpotDisplay.setPlayingState(jackpot.jackpotSubKey, true);
                    SlotManager.Instance.setKeyboardEventFlag(true);
                    SlotManager.Instance.setMouseDragEventFlag(true);
                });
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 创建中心帧状态
     * @returns 状态对象
     */
    public getCreateCenterFrameState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
            if (self.getIsFull() === 1 && nextSubGameKey !== "base") {
                // 添加中心锁符号
                const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                const subGameState = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey);
                const symbolId = self.getSymbolIdByCurrentMode(currentSubGameKey);
                
                const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
                gameComp!.lockSymbolLayer.addMergeLockSymbol(1, 1, subGameState.pots!.centerPot.pot, symbolId);

                // 1秒后完成状态
                SlotManager.Instance.scheduleOnce(() => {
                    state.setDone();
                }, 1);
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 合并奖励状态
     * @returns 顺序执行状态对象
     */
    public getMergePrizeState(): SequencialState {
        const self = this;
        const mergeState = new SequencialState();
        mergeState.addOnStartCallback(() => {
            const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
            if (self.getIsFull() === 1 && nextSubGameKey !== "base") {
                // 延迟0.5秒
                const delayState = new State();
                delayState.addOnStartCallback(() => {
                    SlotManager.Instance.scheduleOnce(() => {
                        delayState.setDone();
                    }, 0.5);
                });
                mergeState.insert(0, delayState);

                // 遍历所有卷轴和行，创建合并奖励动画
                let idx = 1;
                const symbolInfoArray = SlotGameResultManager.Instance.getResultSymbolInfoArray() as any[][];
                const symbolId = self.getSymbolIdByCurrentMode(SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult());
                const randomSymbolList = [11, 12, 13, 31, 22, 21, 71, 72, 73];

                const processReel = (reelIdx: number) => {
                    const reel = SlotManager.Instance.reelMachine.reels[reelIdx].getComponent(Reel);
                    const processRow = (rowIdx: number) => {
                        const rowState = new State();
                        rowState.addOnStartCallback(() => {
                            // 中心位置跳过
                            if (reelIdx === 1 && rowIdx === 1) {
                                rowState.setDone();
                                return;
                            }

                            // 随机更换符号，创建中心合并动画
                            const randomSymbol = randomSymbolList[Math.floor(Math.random() * randomSymbolList.length)];
                            reel.changeSymbol(rowIdx, randomSymbol);
                            
                            const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
                            gameComp!.lockSymbolLayer.removeByKey(reelIdx, rowIdx);
                            
                            reel.hideSymbolInRow(rowIdx);
                            reel.node.active = true;
                            gameComp!.lockSymbolLayer.createToCenterObj(symbolId, reelIdx, rowIdx, symbolInfoArray[reelIdx][rowIdx]);
                            reel.resetAllSiblingIndex();

                            // 0.5秒后完成状态
                            SlotManager.Instance.scheduleOnce(() => {
                                rowState.setDone();
                            }, 0.5);
                        });
                        mergeState.insert(idx++, rowState);
                    };

                    // 遍历3行
                    for (let rowIdx = 0; rowIdx < 3; ++rowIdx) {
                        processRow(rowIdx);
                    }
                };

                // 遍历所有卷轴
                for (let reelIdx = 0; reelIdx < SlotManager.Instance.reelMachine.reels.length; ++reelIdx) {
                    processReel(reelIdx);
                }

                mergeState.insert(idx++, delayState);
            }
        });
        return mergeState;
    }

    /**
     * 更新底部UI信息状态
     * @returns 状态对象
     */
    public getBottomInfoState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
            const subGameState = SlotGameResultManager.Instance.getSubGameState(nextSubGameKey);
            
            // 根据中奖金额更新底部文本
            if (subGameState.totalWinningCoin > 0) {
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.SpinReel);
            } else {
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "DRAGON ORB BONUS");
            }
            state.setDone();
        });
        return state;
    }

    /**
     * 仅触发大奖时显示大额中奖特效
     * @returns 状态对象
     */
    public getStateShowBigWinEffectOnlyTriggerJackpot(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const jackpotResults = (SlotGameResultManager.Instance.getSpinResult() as SpinResult).jackpotResults;
            if (TSUtility.isValid(jackpotResults) && jackpotResults.length > 0) {
                const totalBet = SlotGameRuleManager.Instance.getTotalBet();
                const winningCoin = jackpotResults[0].winningCoin;
                
                // 判断是否为大额中奖
                if (SlotGameResultManager.Instance.getWinTypeByTotalBet(totalBet, winningCoin) !==SlotGameResultManager.WINSTATE_NORMAL) {
                    const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base)!.effectBigWinNew;
                    bigWinEffect._isPlayExplodeCoin = true;
                    
                    // 播放大额中奖特效
                    bigWinEffect.playWinEffectWithoutIncreaseMoney(winningCoin, totalBet, () => {
                        SlotManager.Instance.setKeyboardEventFlag(true);
                        SlotManager.Instance.bottomUIText.setWinMoney(SlotGameResultManager.Instance.winMoneyInFreespinMode);
                        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "TOTAL WIN");
                        state.setDone();
                    });
                } else {
                    state.setDone();
                }
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 检查免费旋转开始状态
     * @returns 顺序执行状态对象
     */
    public getCheckFreeSpinStartState(): SequencialState {
        const self = this;
        const state = new SequencialState();
        
        if (this.isFreeSpinStart() === 1) {
            const startState = new State();
            startState.addOnStartCallback(() => {
                // 禁用输入事件
                SlotManager.Instance.setKeyboardEventFlag(false);
                SlotManager.Instance.setMouseDragEventFlag(false);

                // 获取历史窗口，判断延迟时间
                const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows() as any;
                let delayTime = 2;
                if (lastHistoryWindows.GetWindow(2).getSymbolArray().indexOf(91) > -1) {
                    delayTime = 0.5;
                }

                // 停止动画，清除支付线，重置符号变暗状态
                self.stopSingleLineAction();
                SlotManager.Instance.paylineRenderer.clearAll();
                SymbolAnimationController.Instance.stopAllAnimationSymbol();
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);

                // 构建延迟+播放散点触发动画的动作序列
                const playScatterAni = cc.callFunc(() => {
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
                    SlotSoundController.Instance().playAudio("ScatterTrigger", "FX");
                    SoundManager.Instance().setMainVolumeTemporarily(0.1);

                    // 播放散点符号动画
                    for (let reelIdx = 0; reelIdx < lastHistoryWindows.size; ++reelIdx) {
                        const window = lastHistoryWindows.GetWindow(reelIdx);
                        const reel = SlotManager.Instance.reelMachine.reels[reelIdx].getComponent(Reel);
                        
                        for (let rowIdx = 0; rowIdx < window.size; ++rowIdx) {
                            const symbolVal = window.getSymbol(rowIdx);
                            if (symbolVal >= 91) {
                                SymbolAnimationController.Instance.mustPlayAnimationSymbol(reelIdx, rowIdx, symbolVal + 1000, null, SlotManager.Instance.reelMachine);
                                reel.hideSymbolInRow(rowIdx);
                            }
                        }
                    }

                    // 更新底部UI
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.TriggerScatter);
                });

                const completeState = cc.callFunc(() => {
                    startState.setDone();
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
                });

                // 执行动作序列
                SlotManager.Instance.node.runAction(cc.sequence(
                    cc.delayTime(delayTime),
                    playScatterAni,
                    cc.delayTime(2),
                    completeState
                ));
            });

            state.insert(0, startState);
            
            // 结束回调：恢复输入事件
            state.addOnEndCallback(() => {
                SlotManager.Instance.setKeyboardEventFlag(true);
                SlotManager.Instance.setMouseDragEventFlag(true);
            });
        }

        return state;
    }

    /**
     * 打开免费旋转选择弹窗状态
     * @returns 状态对象
     */
    public getOpenChoosePopupState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            // 禁用输入事件，打开选择弹窗
            SlotManager.Instance.setMouseDragEventFlag(false);
            SlotManager.Instance.setKeyboardEventFlag(false);
            const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
            gameComp!.freeSpinChoose.open(state.setDone.bind(state));
        });
        return state;
    }

    /**
     * 检查免费旋转结束状态
     * @returns 顺序执行状态对象
     */
    public getCheckEndFreeSpinState(): SequencialState {
        const self = this;
        const state = new SequencialState();
        state.addOnStartCallback(() => {
            const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
            if (nextSubGameKey === "base") {
                // 禁用输入事件，停止动画，重置UI
                SlotManager.Instance.setKeyboardEventFlag(false);
                SlotManager.Instance.setMouseDragEventFlag(false);
                self.stopSingleLineAction();
                SymbolAnimationController.Instance.stopAllAnimationSymbol();
                SlotManager.Instance.paylineRenderer.clearAll();
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.SpinReel);

                // 获取免费旋转总中奖金额
                const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                const subGameState = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey);
                const totalWinningCoin = subGameState.totalWinningCoin;

                // 显示免费旋转结果状态
                const showResultState = self.getShowFreespinResultState();
                showResultState.addOnStartCallback(() => {
                    SlotManager.Instance.scheduleOnce(() => {
                        SlotManager.Instance.bottomUIText.setWinMoney(totalWinningCoin);
                    }, 0.5);
                });

                // 构建状态序列
                state.insert(0, self.getCameraMoveState());
                if (totalWinningCoin > 0) {
                    state.insert(1, self.getAddMultiplierState());
                    state.insert(2, self.getCalculatePrizeState());
                    state.insert(3, showResultState);
                }
                state.insert(4, self.getStopSingleLineActionState());
                state.insert(5, self.getStopAllSymbolAniState());
                state.insert(5, self.getResetRatioState());
                state.insert(5, self.getChangeUIToNormalState());
                state.insert(6, self.getShowBigWinEffectEndFreespinState());

                // 结束回调：重置免费旋转金额，恢复输入事件
                state.addOnEndCallback(() => {
                    SlotGameResultManager.Instance.winMoneyInFreespinMode = 0;
                    SlotManager.Instance.setKeyboardEventFlag(true);
                    SlotManager.Instance.setMouseDragEventFlag(true);
                });
            }
        });
        return state;
    }

    /**
     * 应用倍数状态
     * @returns 倍数应用状态对象
     */
    public getAddMultiplierState(): State {
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const subGameState = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey);
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        
        const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
        return gameComp!.multiplierApplyComponent.getApplyMultiplierState(currentSubGameKey, nextSubGameKey, subGameState);
    }

    /**
     * 计算奖励状态
     * @returns 顺序执行状态对象
     */
    public getCalculatePrizeState(): SequencialState {
        const self = this;
        const state = new SequencialState();
        state.addOnStartCallback(() => {
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows() as any;
            self._freeSpinBeforeMoney = SlotGameResultManager.Instance.winMoneyInFreespinMode;
            
            let idx = 0;
            const symbolId = self.getSymbolIdByCurrentMode(SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult());

            // 遍历所有卷轴和行，计算奖励
            for (let reelIdx = 0; reelIdx < lastHistoryWindows.size; ++reelIdx) {
                const window = lastHistoryWindows.GetWindow(reelIdx);
                for (let rowIdx = 0; rowIdx < window.size; ++rowIdx) {
                    const symbolVal = window.getSymbol(rowIdx);
                    if (symbolVal > 91) {
                        const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[reelIdx][rowIdx] as any;
                        if (TSUtility.isValid(symbolInfo)) {
                            // 获取奖励计算状态
                            const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
                            const calculateState = gameComp!.lockSymbolLayer.getCalculateWinState(
                                self._freeSpinBeforeMoney, reelIdx, rowIdx, symbolInfo, symbolId
                            );
                            state.insert(idx++, calculateState);

                            // 计算奖励金额
                            let prize = 0;
                            if (symbolInfo.prizeUnit === "BetPerLine") {
                                prize = symbolInfo.prize! * SlotGameRuleManager.Instance.getCurrentBetPerLine() * symbolInfo.multiplier!;
                            } else {
                                prize = symbolInfo.prize! * symbolInfo.multiplier!;
                            }
                            self._freeSpinBeforeMoney += prize;
                        }
                    }
                }
            }
        });

        // 结束回调：播放金币动画，重置金额
        state.addOnEndCallback(() => {
            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
            const freeSpinWin = SlotGameResultManager.Instance.winMoneyInFreespinMode;
            if (totalWin - freeSpinWin > 0) {
                SlotManager.Instance.bottomUIText.playCoinEffectOfWinCoinArea();
            }
            self._freeSpinBeforeMoney = 0;
        });

        return state;
    }

    /**
     * 免费旋转结束时显示大额中奖特效
     * @returns 状态对象
     */
    public getShowBigWinEffectEndFreespinState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            // 停止动画，重置符号状态
            self.stopSingleLineAction();
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            if (SlotManager.Instance.paylineRenderer) {
                SlotManager.Instance.paylineRenderer.clearAll();
            }
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);

            // 获取免费旋转总中奖金额
            const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const subGameState = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey);
            const totalWinningCoin = subGameState.totalWinningCoin;

            // 判断是否为大额中奖
            if (SlotGameResultManager.Instance.getWinType(totalWinningCoin) !== SlotGameResultManager.WINSTATE_NORMAL) {
                const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base)!.effectBigWinNew;
                bigWinEffect._isPlayExplodeCoin = false;
                
                // 播放大额中奖特效
                bigWinEffect.playWinEffectWithoutIncreaseMoney(totalWinningCoin, SlotGameRuleManager.Instance.getTotalBet(), () => {
                    state.setDone();
                });
            } else {
                state.setDone();
            }

            // 恢复输入事件
            SlotManager.Instance.setKeyboardEventFlag(true);
            SlotManager.Instance.setMouseDragEventFlag(true);
        });
        return state;
    }

    /**
     * 显示免费旋转结果状态
     * @returns 状态对象
     */
    public getShowFreespinResultState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const subGameState = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey);
            
            const totalWinningCoin = subGameState.totalWinningCoin;
            const totalCnt = subGameState.totalCnt;
            const betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();

            // 打开免费旋转结果弹窗
            const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
            gameComp!.freeSpinResultPopup.open(totalWinningCoin, totalCnt, betPerLine, () => {
                state.setDone();
            });
        });
        return state;
    }

    /**
     * 切换到普通UI状态
     * @returns 状态对象
     */
    public getChangeUIToNormalState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            self.changeUIToNormal();
            state.setDone();
        });
        return state;
    }

    /**
     * 切换到免费旋转UI状态
     * @returns 状态对象
     */
    public getChangeUIToFreeSpinState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            SoundManager.Instance().stopBGM();
            SlotSoundController.Instance().playAudio("FreeSpinBGM", "BGM");
            self.changeUIToFreeSpin();
            state.setDone();
        });
        return state;
    }

    /**
     * 切换到免费旋转UI
     */
    public changeUIToFreeSpin(): void {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const subGameState = SlotGameResultManager.Instance.getSubGameState(nextSubGameKey);

        // 更新免费旋转计数和倍数
        SlotManager.Instance._freespinTotalCount = subGameState.totalCnt;
        SlotManager.Instance._freespinPastCount = subGameState.spinCnt;
        SlotManager.Instance._freespinMultiplier = SlotManager.Instance.getGauges("spinMultiplier");

        // 更新底部UI和左侧转盘UI
        SlotManager.Instance._bottomUI.showFreespinUI();
        SlotManager.Instance._bottomUI.setShowFreespinMultiplier(false);
        
        const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
        gameComp!.wheelLeftUI.show(nextSubGameKey);
        
        SlotManager.Instance.setFreespinExtraInfoByCurrentState();
        SlotReelSpinStateManager.Instance.setFreespinMode(true);
        
        // 更新底部UI金额
        SlotManager.Instance.bottomUIText.setWinMoney(subGameState.totalWinningCoin);
        SlotGameResultManager.Instance.winMoneyInFreespinMode = subGameState.totalWinningCoin;
        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.SpinReel);

        // 触发UI特效，恢复主音量
        gameComp!.triggerUIFxOn();
        SlotSoundController.Instance().resetTemporarilyMainVolume();

        // 设置卷轴符号变暗
        for (let i = 0; i < SlotManager.Instance.reelMachine.reels.length; ++i) {
            const reel = SlotManager.Instance.reelMachine.reels[i].getComponent(Reel_DragonOrbs);
            reel._dimmFlag = true;
            reel.setSymbolsDimmActive(true);
        }
    }

    /**
     * 切换到普通UI
     */
    public changeUIToNormal(): void {
        // 隐藏免费旋转UI，重置卷轴旋转状态
        SlotManager.Instance._bottomUI.hideFreespinUI();
        SlotReelSpinStateManager.Instance.setFreespinMode(false);
        
        // 停止免费旋转BGM，播放主BGM
        SlotManager.Instance.stopAllBGM();
        SlotSoundController.Instance().stopAudio("FreeSpinBGM", "BGM");
        SlotSoundController.Instance().playAudio("MainBGM", "BGM");

        // 重置锁符号层和UI特效
        const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
        gameComp!.lockSymbolLayer.removeAll();
        gameComp!.lockSymbolLayer.clearFrame();
        gameComp!.triggerUIFxOff();
        
        // 显示所有符号，重置卷轴变暗状态
        SlotManager.Instance.reelMachine.showAllSymbol();
        for (let i = 0; i < SlotManager.Instance.reelMachine.reels.length; ++i) {
            const reel = SlotManager.Instance.reelMachine.reels[i].getComponent(Reel_DragonOrbs);
            reel._dimmFlag = false;
            reel.processCheckOverSizeSymbol();
        }

        // 重置大奖累计奖励和功能组件
        gameComp!.lockSymbolLayer.initAccumulatePrize();
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        gameComp!.featureComponents.reset(currentSubGameKey);

        // 隐藏左侧转盘UI
        gameComp!.wheelLeftUI.hide();
    }

    /**
     * 切换到选择模式UI
     */
    public changeUIToChooseMode(): void {
        const lastWindows = SlotGameResultManager.Instance.getSubGameState("base").lastWindows as number[][];
        for (let reelIdx = 0; reelIdx < lastWindows.length; ++reelIdx) {
            const window = lastWindows[reelIdx];
            const reel = SlotManager.Instance.reelMachine.reels[reelIdx].getComponent(Reel);
            for (let rowIdx = 0; rowIdx < window.length; ++rowIdx) {
                const symbolVal = window[rowIdx];
                reel.changeSymbol(rowIdx, symbolVal);
            }
        }
    }

    /**
     * 判断是否开始免费旋转（base→freegameChoose）
     * @returns 1:是 0:否
     */
    public isFreeSpinStart(): number {
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        return currentSubGameKey === "base" && nextSubGameKey === "freegameChoose" ? 1 : 0;
    }

    /**
     * 重置比例状态
     * @returns 状态对象
     */
    public getResetRatioState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
            gameComp!.setJackpotExpectFlag(false);
            gameComp!._notSkipable = false;

            // 重置大奖期望标记和上下标志
            for (let i = 0; i < 3; ++i) {
                gameComp!.setJackpotSingleExpectFlag(i, false);
                gameComp!.setUpDownFlag(i);
            }

            state.setDone();
        });
        return state;
    }

    /**
     * 根据当前模式获取符号ID
     * @param mode 模式标识
     * @returns 符号ID（96:红 94:蓝 92:绿 -1:未知）
     */
    public getSymbolIdByCurrentMode(mode: string): number {
        if (mode === "freeSpin_red") return 96;
        if (mode === "freeSpin_blue") return 94;
        if (mode === "freeSpin_green") return 92;
        return -1;
    }

    /**
     * 停止所有符号动画状态
     * @returns 状态对象
     */
    public getStopAllSymbolAniState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            self.checkPaylineRenderer();
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            
            // 清除支付线
            if (SlotManager.Instance.paylineRenderer) {
                SlotManager.Instance.paylineRenderer.clearAll();
            }

            // 根据游戏模式设置符号变暗状态
            const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
            
            if (currentSubGameKey === "base" && nextSubGameKey === "base") {
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            } else if (currentSubGameKey !== "base" && nextSubGameKey !== "base") {
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
            }

            state.setDone();
        });
        return state;
    }

    /**
     * 相机移动状态
     * @returns 状态对象
     */
    public getCameraMoveState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            // 禁用输入事件
            SlotManager.Instance.setKeyboardEventFlag(false);
            SlotManager.Instance.setMouseDragEventFlag(false);

            // 相机向下滚动
            if (CameraControl.Instance.eStateOfCameraPosition) {
                CameraControl.Instance.scrollDownScreen(0.8);
                SlotManager.Instance.scheduleOnce(() => {
                    state.setDone();
                }, 0.8);
            } else {
                state.setDone();
            }
        });
        return state;
    }
}