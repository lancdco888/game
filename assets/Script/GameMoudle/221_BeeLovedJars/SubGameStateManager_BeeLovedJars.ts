// 游戏组件导入
import GameComponents_Base from '../../game/GameComponents_Base';
import CurrencyFormatHelper from '../../global_utility/CurrencyFormatHelper';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameResultManager, { Cell } from '../../manager/SlotGameResultManager';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotManager from '../../manager/SlotManager';
import CameraControl from '../../Slot/CameraControl';
import Reel from '../../Slot/Reel';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import SlotSoundController from '../../Slot/SlotSoundController';
import State, { SequencialState } from '../../Slot/State';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import { BottomTextType } from '../../SubGame/BottomUIText';
import SubGameStateManager_Base from '../../SubGameStateManager_Base';
import JackpotMoneyDisplay_WithMaxLength from '../219_Zhuquefortune/JackpotMoneyDisplay_WithMaxLength';
import BeeLovedJarsManager from './BeeLovedJarsManager';
import FeaturePrizeComponent_BellLovedJars from './Component/FeaturePrizeComponent_BellLovedJars';
import FreeSpinTopUIComponent_BeeLovedJars from './Component/FreeSpinTopUIComponent_BeeLovedJars';
import JackpotDisplayFxComponent_BeeLovedJars from './Component/JackpotDisplayFxComponent_BeeLovedJars';
import JackpotModeComponent_BeeLovedJars from './Component/JackpotModeComponent_BeeLovedJars';
import JackpotSymbolComponent_BeeLovedJars from './Component/JackpotSymbolComponent_BeeLovedJars';
import LockComponent_BeeLovedJars from './Component/LockComponent_BeeLovedJars';
import LockNRollTopUIComponent_BeeLovedJars from './Component/LockNRollTopUIComponent_BeeLovedJars';
import MovePrizeComponent_BeeLovedJars from './Component/MovePrizeComponent_BeeLovedJars';
import PotComponent_BeeLovedJars from './Component/PotComponent_BeeLovedJars';
import RemainCountComponent_BeeLovedJars from './Component/RemainCountComponent_BeeLovedJars';
import UIComponent_BeeLovedJars from './Component/UIComponent_BeeLovedJars';

// 弹窗组件导入
import FreeSpinChoosePopup_BeeLovedJars from './Popup/FreeSpinChoosePopup_BeeLovedJars';
import FreeSpinResultPopup_BeeLovedJars from './Popup/FreeSpinResultPopup_BeeLovedJars';
import FreeSpinRetriggerdPopup_BeeLovedJars from './Popup/FreeSpinRetriggerdPopup_BeeLovedJars';
import JackpotResultPopup_BeeLovedJars from './Popup/JackpotResultPopup_BeeLovedJars';
import LockNRollResultPopup_BeeLovedJars from './Popup/LockNRollResultPopup_BeeLovedJars';

// 卷轴相关导入
import Reel_BeeLovedJars from './Reel_BeeLovedJars';
import ReelMachine_BeeLovedJars from './ReelMachine_BeeLovedJars';

const { ccclass } = cc._decorator;

/**
 * BeeLovedJars 子游戏状态管理器
 * 继承自基础状态管理器，处理该游戏专属的状态流转逻辑
 */
@ccclass('SubGameStateManager_BeeLovedJars')
export default class SubGameStateManager_BeeLovedJars extends SubGameStateManager_Base {
    // 游戏管理器引用（补充类型注解）
    private game_manager: BeeLovedJarsManager = null;
    
    // 奖金增加倍数常量
    public increaseMoneyMultiplierBeforePlaySpecialWin: number = 10;

    /**
     * 设置游戏管理器引用，并初始化符号名称映射
     * @param manager 游戏管理器实例
     */
    public setManager(manager: any): void {
        this.game_manager = manager;
        
        // 初始化符号名称映射
        this.symbolNameList[14] = "ACES";
        this.symbolNameList[13] = "KINGS";
        this.symbolNameList[12] = "QUEENS";
        this.symbolNameList[22] = "AZALEAS";
        this.symbolNameList[21] = "IRISES";
        this.symbolNameList[31] = "GIRLS";
        this.symbolNameList[32] = "BOYS";
        this.symbolNameList[33] = "KIDS";
        this.symbolNameList[92] = "GREEN JARS";
    }

    /**
     * 获取基础游戏状态流程
     */
    public getBaseGameState(): SequencialState {
        const rootState = new SequencialState();
        let step = 0;
        const baseSubState = new SequencialState();

        // 基础状态流程：设置子游戏标记 → 停止单行特效 → 停止所有符号动画 → 底部文本 → 重置奖金池 → 卷轴旋转开始
        baseSubState.insert(step++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        baseSubState.insert(step++, this.getStopSingleLineActionState());
        baseSubState.insert(step++, this.getStopAllSymbolAniState());
        baseSubState.insert(step++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
        baseSubState.insert(step++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(0));
        baseSubState.insert(step++, this.getResetUpdatePot());
        baseSubState.insert(step++, SlotManager.Instance.getReelSpinStartState());
        rootState.insert(0, baseSubState);

        // 旋转结果处理流程
        const spinResultState = new SequencialState();
        spinResultState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                this.game_manager.setUpdateCount();
                const visibleWindows = SlotGameResultManager.Instance.getVisibleSlotWindows();
                
                spinResultState.insert(step++, SlotManager.Instance.reelMachine.getNormalSpinReelStateRenewal(visibleWindows));
                spinResultState.insert(step++, this.getScrollDownBeforeWinResultState());
                spinResultState.insert(step++, this.getSpinHitDelayState());

                // 中奖结果处理子流程
                const winResultSubState = new SequencialState();
                winResultSubState.insert(0, this.getWinResultStateOnAllLines());
                winResultSubState.insert(1, this.getSingleLineEffectForAllLinesState());
                spinResultState.insert(step, winResultSubState);
                spinResultState.insert(step, this.getSetBottomInfoIncreaseWinMoneyState());
                spinResultState.insert(step++, this.getWinMoneyState());
                spinResultState.insert(step++, this.getJackpotModeStartState());
                spinResultState.insert(step++, this.getCheckStartChooseState());
                spinResultState.insert(step++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
            }
        });

        rootState.insert(1, spinResultState);
        return rootState;
    }

    /**
     * 获取Jackpot游戏状态流程
     */
    public getJackpotGameState(): SequencialState {
        const rootState = new SequencialState();
        
        // Jackpot中奖结果展示状态
        const jackpotResultState = new State();
        jackpotResultState.addOnStartCallback(() => {
            if (!this.game_manager) return;

            const jackpotResult = SlotGameResultManager.Instance.getSpinResult().jackpotResults[0];
            const multiplier = SlotGameResultManager.Instance.getSubGameState("jackpot").getGaugesValue("multiplier");
            const totalWin = jackpotResult.baseWinningCoin + jackpotResult.jackpot;

            // 播放Jackpot特效
            this.game_manager.game_components.jackpotWinFxComponent.getComponent(JackpotDisplayFxComponent_BeeLovedJars)
                .winFX(jackpotResult.jackpotSubID);
            
            // 更新奖金显示
            const jackpotDisplay = this.game_manager.game_components.baseDisplay.getComponent(JackpotMoneyDisplay_WithMaxLength);
            jackpotDisplay.setPlayingState(jackpotResult.jackpotSubKey, false);
            jackpotDisplay.setShowingMoney(jackpotResult.jackpotSubKey, totalWin);

            // 设置底部文本
            const totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();
            SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "JACKPOT WIN");
            SlotManager.Instance.bottomUIText.setWinMoney(totalWinMoney);

            // 显示对应Jackpot弹窗
            const popupComponent = this.getJackpotPopupBySubID(jackpotResult.jackpotSubID);
            popupComponent.showPopup(jackpotResult, multiplier, () => {
                jackpotDisplay.setPlayingState(jackpotResult.jackpotSubKey, true);
                jackpotResultState.setDone();
            });
        });

        // 重置UI状态
        const resetUIState = new State();
        resetUIState.addOnStartCallback(() => {
            if (!this.game_manager) return;

            // 恢复基础UI
            this.game_manager.game_components.uiComponent.getComponent(UIComponent_BeeLovedJars).setBase();
            this.game_manager.setOverSizeSymbol();
            
            // 重置特效和奖金池
            this.game_manager.game_components.jackpotWinFxComponent.getComponent(JackpotDisplayFxComponent_BeeLovedJars).init();
            this.game_manager.game_components.potComponent.getComponent(PotComponent_BeeLovedJars).resetPot();

            // 延迟恢复输入
            this.game_manager.scheduleOnce(() => {
                this.game_manager?.setKeyboardEventFlag(true);
                this.game_manager?.setMouseDragEventFlag(true);
                SlotManager.Instance.playMainBgm();
                resetUIState.setDone();
            }, 0.3);
        });

        // 组装根状态
        rootState.insert(0, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        rootState.insert(1, this.getSendBonusState());

        // Jackpot核心流程
        const jackpotCoreState = new SequencialState();
        jackpotCoreState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                jackpotCoreState.insert(0, this.game_manager?.game_components.jackpotModeComponent.getComponent(JackpotModeComponent_BeeLovedJars)
                    .playJackpotGameState() || new State());
                jackpotCoreState.insert(1, jackpotResultState);
                jackpotCoreState.insert(2, this.getShowBigWinEffectEndJackpotState());
                jackpotCoreState.insert(3, resetUIState);
                jackpotCoreState.insert(4, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
            }
        });

        rootState.insert(2, jackpotCoreState);
        return rootState;
    }

    /**
     * 获取免费游戏状态流程
     */
    public getFreeSpinGameState(): SequencialState {
        const rootState = new SequencialState();
        let step = 0;
        const freeSpinBaseState = new SequencialState();

        // 基础状态初始化
        freeSpinBaseState.insert(step++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        freeSpinBaseState.insert(step++, this.getStopSingleLineActionState());
        freeSpinBaseState.insert(step++, this.getStopAllSymbolAniState());
        freeSpinBaseState.insert(step++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
        freeSpinBaseState.insert(step++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(SlotGameResultManager.Instance.winMoneyInFreespinMode));
        freeSpinBaseState.insert(step, SlotManager.Instance.getIncreaseFreespinPastCountStateRenewal());
        freeSpinBaseState.insert(step++, SlotManager.Instance.getReelSpinStartState());
        rootState.insert(0, freeSpinBaseState);

        // 免费游戏核心流程
        const freeSpinCoreState = new SequencialState();
        freeSpinCoreState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                const visibleWindows = SlotGameResultManager.Instance.getVisibleSlotWindows();
                
                freeSpinCoreState.insert(step++, this.getGrandEpxectState());
                freeSpinCoreState.insert(step++, SlotManager.Instance.reelMachine.getNormalSpinReelStateRenewal(visibleWindows));
                freeSpinCoreState.insert(step++, this.getFreeSpinHitDelayState());
                freeSpinCoreState.insert(step++, this.getScrollDownBeforeWinResultState());
                freeSpinCoreState.insert(step++, this.getGrandJackpotState());

                // 中奖结果处理
                const winResultSubState = new SequencialState();
                winResultSubState.insert(0, this.getWinResultStateOnAllLines());
                winResultSubState.insert(1, this.getSingleLineEffectForAllLinesState());
                freeSpinCoreState.insert(step, winResultSubState);
                freeSpinCoreState.insert(step, this.getSetBottomInfoIncreaseWinMoneyState());
                freeSpinCoreState.insert(step++, this.getWinMoneyFreeSpinState());
                freeSpinCoreState.insert(step++, this.getFreeSpinRetriggerState());
                freeSpinCoreState.insert(step++, this.getCheckFreespinEndState());
                freeSpinCoreState.insert(step++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
                freeSpinCoreState.insert(step++, this.getAddWinMoneyToFreespinEarningPotState());
            }
        });

        rootState.insert(1, freeSpinCoreState);
        return rootState;
    }

    /**
     * 获取Lock&Roll游戏状态流程
     */
    public getLockandRollGameState(): SequencialState {
        const rootState = new SequencialState();
        let step = 0;
        const lockNRollBaseState = new SequencialState();

        // 基础状态初始化
        lockNRollBaseState.insert(step++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        lockNRollBaseState.insert(step++, this.getDecreaseTotalCount());
        lockNRollBaseState.insert(step++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.CustomData, "GOOD LUCK"));
        
        // 获取Lock&Roll卷轴并启动旋转
        const lockNRollReels = this.game_manager?.reelMachine.getComponent(ReelMachine_BeeLovedJars).lockNRoll_Reels;
        lockNRollBaseState.insert(step++, this.game_manager?.getReelSpinStartState(lockNRollReels) || new State());
        rootState.insert(0, lockNRollBaseState);

        // Lock&Roll核心流程
        const lockNRollCoreState = new SequencialState();
        lockNRollCoreState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                lockNRollCoreState.insert(step++, SlotManager.Instance.reelMachine.getComponent(ReelMachine_BeeLovedJars)
                    .getLockAndRollReelState());
                lockNRollCoreState.insert(step++, this.getAddSpinDelayState());
                lockNRollCoreState.insert(step++, this.getMoveOneStep());
                lockNRollCoreState.insert(step++, this.getMoveTwoStep());
                lockNRollCoreState.insert(step++, this.getLockNRollGrandJackpotState());
                lockNRollCoreState.insert(step++, this.getCaculateSpinState());
                lockNRollCoreState.insert(step++, this.getUpdateTotalCount());
                lockNRollCoreState.insert(step++, this.getCheckLockNRollEndState());
                lockNRollCoreState.insert(step++, this.getResetSpecialNodeState());
                lockNRollCoreState.insert(step++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
            }
        });

        rootState.insert(1, lockNRollCoreState);
        return rootState;
    }

    /**
     * 获取旋转命中延迟状态（蜜蜂符号专用）
     */
    public getSpinHitDelayState(): State {
        const delayState = new State();
        delayState.addOnStartCallback(() => {
            const lastWindows = SlotGameResultManager.Instance.getSubGameState("base").lastWindows;
            let hasBeeSymbol = false;

            // 检查是否有蜜蜂符号(71)
            for (let col = 0; col < 5; col++) {
                for (let row = 0; row < 3; row++) {
                    if (lastWindows[col][row] === 71) {
                        hasBeeSymbol = true;
                        break;
                    }
                }
                if (hasBeeSymbol) break;
            }

            // 有蜜蜂符号则延迟1秒
            if (hasBeeSymbol) {
                this.game_manager?.scheduleOnce(() => {
                    delayState.setDone();
                }, 1);
            } else {
                delayState.setDone();
            }
        });
        return delayState;
    }

    /**
     * 获取重置奖金池更新状态
     */
    public getResetUpdatePot(): State {
        const resetState = new State();
        resetState.addOnStartCallback(() => {
            this.game_manager?.game_components.potComponent.getComponent(PotComponent_BeeLovedJars).resetUpdatePot();
            resetState.setDone();
        });
        return resetState;
    }

    /**
     * 获取Jackpot模式启动状态
     */
    public getJackpotModeStartState(): SequencialState {
        const rootState = new SequencialState();
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();

        if (nextSubGameKey === "jackpot") {
            // Jackpot触发延迟状态
            const delayState = new State();
            delayState.addOnStartCallback(() => {
                const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
                let hasBeeSymbol = false;

                // 禁用输入
                this.game_manager?.setMouseDragEventFlag(false);
                this.game_manager?.setKeyboardEventFlag(false);

                // 检查蜜蜂符号
                for (let col = 0; col < 5; col++) {
                    for (let row = 0; row < 3; row++) {
                        if (lastHistoryWindows.GetWindow(col).getSymbol(row) === 71) {
                            hasBeeSymbol = true;
                            break;
                        }
                    }
                    if (hasBeeSymbol) break;
                }

                // 有蜜蜂符号且无奖金则延迟
                if (hasBeeSymbol && SlotGameResultManager.Instance.getTotalWinMoney() === 0) {
                    this.game_manager?.scheduleOnce(() => {
                        delayState.setDone();
                    }, 0.5);
                } else {
                    delayState.setDone();
                }
            });

            // Jackpot UI切换状态
            const uiSwitchState = new State();
            uiSwitchState.addOnStartCallback(() => {
                // 禁用下注按钮
                SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(false);
                SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(false);

                // 延迟显示Jackpot提示
                this.game_manager?.scheduleOnce(() => {
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "JACKPOT TRIGGERED");
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                }, 1.5);

                // 播放奖金池触发动画
                this.game_manager?.game_components.potComponent.getComponent(PotComponent_BeeLovedJars)
                    .playTriggerAni(() => {
                        // 重置卷轴符号父节点
                        for (let i = 0; i < 5; i++) {
                            SlotManager.Instance.reelMachine.reels[i].getComponent(Reel)
                                .setParentAllSymbolsToSymbolLayer();
                        }
                        // 切换到Jackpot UI
                        this.game_manager?.game_components.uiComponent.getComponent(UIComponent_BeeLovedJars).setJackpotMode();
                        this.game_manager?.game_components.jackpotModeComponent.getComponent(JackpotModeComponent_BeeLovedJars)
                            .showJackpotMode(null);
                    });

                // 相机滚动+特效播放
                this.game_manager?.scheduleOnce(() => {
                    CameraControl.Instance.scrollDownScreen(0.5);
                    this.game_manager?.game_components.jackpotModeComponent.getComponent(JackpotModeComponent_BeeLovedJars)
                        .appearJackpotFX();
                    SlotManager.Instance.playMainBgm();
                    uiSwitchState.setDone();
                }, 6.5);
            });

            // 组装Jackpot状态流程
            rootState.insert(0, this.getStopSingleLineActionState());
            rootState.insert(0, this.getStopAllSymbolAniState());
            rootState.insert(1, delayState);
            rootState.insert(2, this.getForceScrollDownState());
            rootState.insert(3, uiSwitchState);
        } else {
            // 非Jackpot模式：检查蜜蜂符号并处理奖金池概率
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            let hasBeeSymbol = false;

            for (let col = 0; col < 5; col++) {
                for (let row = 0; row < 3; row++) {
                    if (lastHistoryWindows.GetWindow(col).getSymbol(row) === 71) {
                        hasBeeSymbol = true;
                        break;
                    }
                }
                if (hasBeeSymbol) break;
            }

            // 根据奖金池等级计算概率
            let probability = 0;
            const potLevel = this.game_manager?.game_components.potComponent.getComponent(PotComponent_BeeLovedJars).getPot() || 0;
            switch (potLevel) {
                case 1: probability = 0.005; break;
                case 2: probability = 0.01; break;
                case 3: probability = 0.02; break;
                case 4: probability = 0.04; break;
                default: probability = 0;
            }

            const isTrigger = Math.random() < probability;

            if (hasBeeSymbol && isTrigger) {
                // 触发Jackpot期望动画
                const delayState = new State();
                delayState.addOnStartCallback(() => {
                    const lastWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
                    let hasBee = false;

                    for (let col = 0; col < 5; col++) {
                        for (let row = 0; row < 3; row++) {
                            if (lastWindows.GetWindow(col).getSymbol(row) === 71) {
                                hasBee = true;
                                break;
                            }
                        }
                        if (hasBee) break;
                    }

                    if (hasBee && SlotGameResultManager.Instance.getTotalWinMoney() === 0) {
                        this.game_manager?.scheduleOnce(() => {
                            delayState.setDone();
                        }, 0.5);
                    } else {
                        delayState.setDone();
                    }
                });

                const expectState = new State();
                expectState.addOnStartCallback(() => {
                    // 禁用输入
                    SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(false);
                    SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(false);
                    this.game_manager?.setMouseDragEventFlag(false);
                    this.game_manager?.setKeyboardEventFlag(true);

                    // 播放期望触发动画
                    this.game_manager?.game_components.potComponent.getComponent(PotComponent_BeeLovedJars)
                        .playExpectTriggerAni(() => {
                            // 重置奖金池并恢复输入
                            this.game_manager?.game_components.potComponent.getComponent(PotComponent_BeeLovedJars).resetFailedPot();
                            SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(true);
                            SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(true);
                            this.game_manager?.setMouseDragEventFlag(true);
                            this.game_manager?.setKeyboardEventFlag(true);
                            expectState.setDone();
                        });
                });

                rootState.insert(0, this.getStopSingleLineActionState());
                rootState.insert(0, this.getStopAllSymbolAniState());
                rootState.insert(0, this.getForceScrollDownState());
                rootState.insert(1, delayState);
                rootState.insert(2, expectState);
            } else {
                rootState.setDone();
            }
        }

        return rootState;
    }

    /**
     * 获取免费游戏选择状态
     * @param isAutoStart 是否自动启动
     */
    public getCheckStartChooseState(isAutoStart: boolean = false): SequencialState {
        const rootState = new SequencialState();
        rootState.addOnStartCallback(() => {
            let step = 0;
            const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();

            if (nextSubGameKey === "freegameChoose") {
                // 延迟状态
                const delayState = new State();
                delayState.addOnStartCallback(() => {
                    SlotManager.Instance.scheduleOnce(() => {
                        delayState.setDone();
                    }, 0.5);
                });

                // 符号动画准备状态
                const symbolAniState = new State();
                symbolAniState.addOnStartCallback(() => {
                    this.stopSingleLineAction();
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    SlotManager.Instance.paylineRenderer?.clearAll();

                    // 播放选择符号动画
                    const lastWindows = SlotGameResultManager.Instance.getSubGameState("base").lastWindows;
                    const lastSymbolInfo = SlotGameResultManager.Instance.getSubGameState("base").lastSymbolInfoWindow;

                    for (let col = 0; col < 5; col++) {
                        for (let row = 0; row < 3; row++) {
                            if (lastWindows[col][row] === 90) {
                                // 播放选择符号动画
                                const aniNode = SymbolAnimationController.Instance.playAnimationSymbol(col, row, 91);
                                aniNode.getComponent(JackpotSymbolComponent_BeeLovedJars).setInfo(lastSymbolInfo[col][row]);
                                // 隐藏对应行符号
                                this.game_manager?.reelMachine.reels[col].getComponent(Reel_BeeLovedJars)
                                    .hideSymbolInRowForAppear(row);
                            }
                        }
                    }

                    // 设置底部文本和音效
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "FEATURE SELECT TRIGGERED");
                    SlotSoundController.Instance().playAudio("JackpotTrigger", "FX");

                    this.game_manager?.scheduleOnce(() => {
                        SlotManager.Instance.paylineRenderer?.clearAll();
                        symbolAniState.setDone();
                    }, 1.5);
                });

                // 奖励添加状态
                const addPrizeState = new State();
                addPrizeState.addOnStartCallback(() => {
                    const lastWindows = SlotGameResultManager.Instance.getSubGameState("base").lastWindows;
                    const prizeCells: Cell[] = [];

                    // 收集奖励单元格
                    for (let col = 0; col < 5; col++) {
                        for (let row = 0; row < 3; row++) {
                            if (lastWindows[col][row] === 90) {
                                prizeCells.push(new Cell(col, row));
                            }
                        }
                    }

                    // 显示奖励UI
                    this.game_manager.game_components.featurePrizeComponent.getComponent(FeaturePrizeComponent_BellLovedJars).showUI();

                    // 逐个添加奖励
                    let index = 0;
                    const addNextPrize = () => {
                        index++;
                        if (index < prizeCells.length) {
                            this.singleAddPrize(prizeCells[index], addNextPrize);
                        } else {
                            this.game_manager?.scheduleOnce(() => {
                                this.game_manager?.game_components.featurePrizeComponent.getComponent(FeaturePrizeComponent_BellLovedJars).hideUI();
                                addPrizeState.setDone();
                            }, 1.5);
                        }
                    };

                    this.game_manager?.scheduleOnce(() => {
                        this.singleAddPrize(prizeCells[index], addNextPrize);
                    }, 1);
                });

                // 免费游戏选择弹窗状态
                const choosePopupState = new State();
                choosePopupState.addOnStartCallback(() => {
                    this.game_manager?.game_components.freeSpinChoosePopup.getComponent(FreeSpinChoosePopup_BeeLovedJars)
                        .open((choice: any) => {
                            this.game_manager?.sendBonusGameRequest(() => {
                                choosePopupState.setDone();
                            }, [choice]);
                        });
                });

                // 免费游戏UI切换状态
                const freeSpinUISwitchState = new State();
                freeSpinUISwitchState.addOnStartCallback(() => {
                    if (SlotGameResultManager.Instance.getNextSubGameKey() === "freeSpin") {
                        SlotReelSpinStateManager.Instance.setSpinMode(true);
                        SlotGameResultManager.Instance.winMoneyInFreespinMode = 0;
                        
                        // 切换到免费游戏UI
                        this.game_manager?.game_components.uiComponent.getComponent(UIComponent_BeeLovedJars).setFreeSpin();
                        this.changeUIToFreeSpin();

                        // 播放免费游戏特效
                        this.game_manager?.scheduleOnce(() => {
                            this.game_manager?.game_components.freeSpinTopUI.getComponent(FreeSpinTopUIComponent_BeeLovedJars).appearFX();
                            SlotManager.Instance.playMainBgm();
                            this.game_manager?.setKeyboardEventFlag(true);
                            this.game_manager?.setMouseDragEventFlag(true);
                        }, 1.33);

                        this.game_manager?.scheduleOnce(() => {
                            freeSpinUISwitchState.setDone();
                        }, 2.33);
                    } else {
                        freeSpinUISwitchState.setDone();
                    }
                });

                // Lock&Roll UI切换状态
                const lockNRollUISwitchState = new State();
                lockNRollUISwitchState.addOnStartCallback(() => {
                    if (SlotGameResultManager.Instance.getNextSubGameKey() === "lockNRoll") {
                        this.stopSingleLineAction();
                        SymbolAnimationController.Instance.stopAllAnimationSymbol();
                        SlotManager.Instance.paylineRenderer?.clearAll();

                        // 重置卷轴符号父节点
                        for (let col = 0; col < 5; col++) {
                            SlotManager.Instance.reelMachine.reels[col].getComponent(Reel)
                                .setParentAllSymbolsToSymbolLayer();
                        }

                        SlotReelSpinStateManager.Instance.setSpinMode(true);
                        this.game_manager?.setLockNRollMode();
                        this.game_manager?.game_components.lockNRollTopUI.getComponent(LockNRollTopUIComponent_BeeLovedJars).init();

                        // 播放Lock&Roll特效
                        this.game_manager?.scheduleOnce(() => {
                            this.game_manager?.game_components.lockNRollTopUI.getComponent(LockNRollTopUIComponent_BeeLovedJars).appearFX();
                            this.game_manager?.game_components.remainCount.getComponent(RemainCountComponent_BeeLovedJars).appearUI();
                            SlotManager.Instance.playMainBgm();
                            this.game_manager?.setKeyboardEventFlag(true);
                            this.game_manager?.setMouseDragEventFlag(true);
                        }, 1.33);

                        this.game_manager?.scheduleOnce(() => {
                            lockNRollUISwitchState.setDone();
                        }, 2.33);
                    } else {
                        lockNRollUISwitchState.setDone();
                    }
                });

                // 组装状态流程（非自动启动时添加前置状态）
                if (!isAutoStart) {
                    rootState.insert(step++, this.getForceScrollDownState());
                    rootState.insert(step++, delayState);
                    rootState.insert(step, this.getStopSingleLineActionState());
                    rootState.insert(step++, this.getStopAllSymbolAniState());
                    rootState.insert(step++, symbolAniState);
                    rootState.insert(step++, addPrizeState);
                }

                rootState.insert(step++, choosePopupState);
                rootState.insert(step++, freeSpinUISwitchState);
                rootState.insert(step++, lockNRollUISwitchState);
            }
        });

        return rootState;
    }

    /**
     * 单个奖励添加逻辑
     * @param cell 奖励单元格
     * @param callback 完成回调
     */
    public singleAddPrize(cell: Cell, callback: () => void): void {
        // 释放符号动画
        SymbolAnimationController.Instance.releaseAnimationSymbol_byKey(cell.col, cell.row);
        
        // 播放奖励符号动画
        const aniNode = SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, 290);
        const symbolInfo = SlotGameResultManager.Instance.getSubGameState("base").lastSymbolInfoWindow[cell.col][cell.row];
        aniNode.getComponent(JackpotSymbolComponent_BeeLovedJars).setInfo(symbolInfo);

        // 移动奖励UI
        this.game_manager?.game_components.movePrizeComponent.getComponent(MovePrizeComponent_BeeLovedJars)
            .movePrize(cell.col, cell.row, () => {
                if (TSUtility.isValid(callback)) {
                    callback();
                }
            });
    }

    /**
     * 获取发送奖励请求状态
     */
    public getSendBonusState(): State {
        const sendState = new State();
        sendState.addOnStartCallback(() => {
            this.game_manager?.game_components.jackpotModeComponent.getComponent(JackpotModeComponent_BeeLovedJars)
                .setJackpotType(() => {
                    sendState.setDone();
                });
        });
        return sendState;
    }

    /**
     * 获取Jackpot大奖特效结束状态
     */
    public getShowBigWinEffectEndJackpotState(): State {
        const effectState = new State();
        effectState.addOnStartCallback(() => {
            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
            const winType = SlotGameResultManager.Instance.getWinType(totalWin);

            if (winType !== SlotGameResultManager.WINSTATE_NORMAL) {
                const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                const totalBet = SlotGameRuleManager.Instance.getTotalBet();
                
                bigWinEffect._isPlayExplodeCoin = false;
                bigWinEffect.playWinEffectWithoutIncreaseMoney(totalWin, totalBet, () => {
                    effectState.setDone();
                });
            } else {
                effectState.setDone();
            }
        });
        return effectState;
    }

    /**
     * 获取免费游戏命中延迟状态（绿罐符号专用）
     */
    public getFreeSpinHitDelayState(): State {
        const delayState = new State();
        delayState.addOnStartCallback(() => {
            const lastWindows = SlotGameResultManager.Instance.getSubGameState("freeSpin").lastWindows;
            let hasGreenJar = false;

            // 检查是否有绿罐符号(92)
            for (let col = 0; col < 5; col++) {
                for (let row = 0; row < 3; row++) {
                    if (lastWindows[col][row] === 92) {
                        hasGreenJar = true;
                        break;
                    }
                }
                if (hasGreenJar) break;
            }

            // 有绿罐符号则延迟1秒
            if (hasGreenJar) {
                this.game_manager?.scheduleOnce(() => {
                    delayState.setDone();
                }, 1);
            } else {
                delayState.setDone();
            }
        });
        return delayState;
    }

    /**
     * 获取大奖期望状态
     * @param effectFlag 特效标记
     */
    public getGrandEpxectState(effectFlag?: boolean): SequencialState {
        const rootState = new SequencialState();
        let step = 0;

        if (this.game_manager?.getNextEffect()) {
            SlotManager.Instance.setMouseDragEventFlag(false);

            // 空延迟状态
            const emptyState = new State();
            emptyState.addOnStartCallback(() => {
                emptyState.setDone();
            });

            // 无限旋转介绍状态
            const infiniteSpinState = SlotManager.Instance.reelMachine.getComponent(ReelMachine_BeeLovedJars)
                .getIntroInfiniteSpinUsingNextSubGameKeyState(effectFlag);

            // 大奖期望弹窗状态
            let grandState: State;
            const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;
            
            if (jackpotResults && jackpotResults.length > 0) {
                grandState = this.getGrandEpxectPopupState();
            } else {
                grandState = this.getGrandFailedPopupState();
            }

            // 组装状态流程
            rootState.insert(step, this.getForceScrollDownState());
            rootState.insert(step++, emptyState);
            rootState.insert(step, infiniteSpinState);
            rootState.insert(step, grandState);

            // 结束回调：恢复输入
            grandState.addOnEndCallback(() => {
                SlotManager.Instance.setMouseDragEventFlag(true);
                infiniteSpinState.setDoneAllSubStates();
            });
        } else {
            rootState.setDone();
        }

        return rootState;
    }

    /**
     * 获取大奖期望弹窗状态
     */
    public getGrandEpxectPopupState(): State {
        const popupState = new State();
        popupState.addOnStartCallback(() => {
            this.game_manager.game_components.grandJackpotExpect.active = true;
            SlotSoundController.Instance().playAudio("GrandEcpect", "FX");

            this.game_manager?.scheduleOnce(() => {
                this.game_manager.game_components.grandJackpotExpect.active = false;
                popupState.setDone();
            }, 4.33);
        });
        return popupState;
    }

    /**
     * 获取大奖失败弹窗状态
     */
    public getGrandFailedPopupState(): State {
        const popupState = new State();
        popupState.addOnStartCallback(() => {
            this.game_manager.game_components.grandJackpotFailed.active = true;
            SlotSoundController.Instance().playAudio("GrandEcpectFailed", "FX");

            this.game_manager?.scheduleOnce(() => {
                this.game_manager.game_components.grandJackpotFailed.active = false;
                popupState.setDone();
            }, 3.5);
        });
        return popupState;
    }

    /**
     * 获取大奖Jackpot状态
     */
    public getGrandJackpotState(): SequencialState {
        const rootState = new SequencialState();
        rootState.addOnStartCallback(() => {
            const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;
            
            if (jackpotResults && jackpotResults.length > 0) {
                // 大奖结果展示状态
                const jackpotShowState = new State();
                jackpotShowState.addOnStartCallback(() => {
                    this.stopSingleLineAction();
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    SlotManager.Instance.paylineRenderer?.clearAll();
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);

                    // 设置底部文本
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "JACKPOT WIN");
                    
                    const jackpotResult = jackpotResults[0];
                    SlotManager.Instance.bottomUIText.setWinMoney(jackpotResult.winningCoin);

                    // 播放免费游戏顶部UI特效
                    this.game_manager?.game_components.freeSpinTopUI.getComponent(FreeSpinTopUIComponent_BeeLovedJars).winFX();

                    // 更新奖金显示
                    const freeSpinDisplay = this.game_manager?.game_components.freeSpinDisplay.getComponent(JackpotMoneyDisplay_WithMaxLength);
                    freeSpinDisplay?.setPlayingState(jackpotResult.jackpotSubKey, false);
                    freeSpinDisplay?.setShowingMoney(jackpotResult.jackpotSubKey, jackpotResult.winningCoin);

                    // 显示大奖弹窗
                    this.game_manager?.scheduleOnce(() => {
                        this.game_manager?.game_components.grandeJackpotPopup.getComponent(JackpotResultPopup_BeeLovedJars)
                            .showPopup(jackpotResult, 1, () => {
                                freeSpinDisplay?.setPlayingState(jackpotResult.jackpotSubKey, true);
                                this.game_manager?.game_components.freeSpinTopUI.getComponent(FreeSpinTopUIComponent_BeeLovedJars).init();
                                jackpotShowState.setDone();
                            });
                    }, 1.67);
                });

                // 大奖特效播放状态
                const jackpotEffectState = new State();
                jackpotEffectState.addOnStartCallback(() => {
                    const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
                    const symbolInfoResults = SlotGameResultManager.Instance.getSpinResult().symbolInfoResults;
                    const payOutLen = TSUtility.isValid(payOutResults) ? payOutResults.length : 0;
                    const symbolInfoLen = TSUtility.isValid(symbolInfoResults) ? symbolInfoResults.length : 0;
                    const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
                    const winType = SlotGameResultManager.Instance.getWinType(totalWin);

                    if (winType !== SlotGameResultManager.WINSTATE_NORMAL && payOutLen <= 0 && symbolInfoLen <= 0) {
                        const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                        const totalBet = SlotGameRuleManager.Instance.getTotalBet();
                        
                        bigWinEffect._isPlayExplodeCoin = false;
                        bigWinEffect.playWinEffectWithoutIncreaseMoney(totalWin, totalBet, () => {
                            jackpotEffectState.setDone();
                        });
                    } else {
                        jackpotEffectState.setDone();
                    }
                });

                rootState.insert(0, jackpotShowState);
                rootState.insert(1, jackpotEffectState);
            } else {
                rootState.setDone();
            }
        });

        return rootState;
    }

    /**
     * 获取免费游戏结果展示状态
     */
    public getShowFreespinResultState(): State {
        const resultState = new State();
        resultState.addOnStartCallback(() => {
            const freeSpinWin = SlotGameResultManager.Instance.winMoneyInFreespinMode;

            // 无奖金直接结束
            if (freeSpinWin <= 0) {
                this.stopSingleLineAction();
                SymbolAnimationController.Instance.stopAllAnimationSymbol();
                SlotManager.Instance.paylineRenderer?.clearAll();
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
                
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "TOTAL WIN");
                SlotManager.Instance.bottomUIText.setWinMoney(freeSpinWin);
                resultState.setDone();
                return;
            }

            // 有奖金则展示结果
            const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const betPerLine = SlotGameResultManager.Instance.getSubGameState(subGameKey).betPerLines;

            this.stopSingleLineAction();
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            SlotManager.Instance.paylineRenderer?.clearAll();

            const freeSpinState = SlotGameResultManager.Instance.getSubGameState("freeSpin");
            const totalWin = freeSpinState.totalWinningCoin;
            const totalCount = freeSpinState.totalCnt;

            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "TOTAL WIN");
            SlotManager.Instance.bottomUIText.setWinMoney(freeSpinWin);

            // 显示免费游戏结果弹窗
            this.game_manager?.game_components.freeSpinReustPopup.getComponent(FreeSpinResultPopup_BeeLovedJars)
                .open(totalWin, totalCount, betPerLine, () => {
                    SlotManager.Instance.setMouseDragEventFlag(true);
                    resultState.setDone();
                });
        });

        return resultState;
    }

    /**
     * 获取免费游戏奖金展示状态
     */
    public getWinMoneyFreeSpinState(): State {
        const winState = new State();
        winState.addOnStartCallback(() => {
            const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;
            let jackpotWin = 0;
            
            if (jackpotResults.length > 0) {
                jackpotWin = jackpotResults[0].winningCoin;
            }

            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
            const completeCallback = () => {
                SlotManager.Instance.bottomUIText.showWinEffect(false);
                SlotManager.Instance.setMouseDragEventFlag(true);
                SlotManager.Instance.applyGameResultMoney(totalWin);
                winState.setDone();
            };

            // 无需展示奖金特效直接结束
            if (!this.isShowWinMoneyEffect()) {
                completeCallback();
                return;
            }

            const winType = SlotGameResultManager.Instance.getWinType();
            SlotManager.Instance.bottomUIText.showWinEffect(true);

            // 无奖金直接结束
            if (totalWin <= 0) {
                completeCallback();
                return;
            }

            // 计算奖金展示参数
            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
            const finalWin = jackpotWin + totalWin;
            const effectTime = totalWin > 3 * totalBet 
                ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2
                : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

            // 特殊大奖处理
            if (winType !== SlotGameResultManager.WINSTATE_NORMAL && jackpotResults.length === 0) {
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                
                const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                const increaseStep = totalBet * this.increaseMoneyMultiplierBeforePlaySpecialWin;
                const increaseTime = SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

                // 分步播放奖金增加动画
                const step1 = cc.callFunc(() => {
                    SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(jackpotWin, jackpotWin + increaseStep, null, false, increaseTime);
                    SlotManager.Instance.setMouseDragEventFlag(false);
                });

                const step2 = cc.callFunc(() => {
                    const effectDuration = bigWinEffect.playWinEffect(totalWin, totalBet, completeCallback, () => {
                        SlotManager.Instance.bottomUIText.stopChangeWinMoney(finalWin);
                        this.playIncrementEndCoinSound();
                    });

                    SlotManager.Instance.bottomUIText.playChangeWinMoney(
                        jackpotWin + increaseStep, 
                        finalWin, 
                        () => this.playIncrementEndCoinSound(), 
                        false, 
                        effectDuration
                    );
                });

                this.game_manager?.node.runAction(cc.sequence(step1, cc.delayTime(increaseTime), step2));
            } else {
                // 普通奖金展示
                SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                SlotManager.Instance.bottomUIText.playChangeWinMoney(jackpotWin, finalWin, completeCallback, true, effectTime);
                SlotManager.Instance.setBiggestWinCoin(totalWin);
            }
        });

        // 结束时播放奖金增加完成音效
        winState.addOnEndCallback(() => {
            this.playIncrementEndCoinSound();
        });

        return winState;
    }

    /**
     * 获取免费游戏重触发状态
     */
    public getFreeSpinRetriggerState(): SequencialState {
        const rootState = new SequencialState();
        const freeSpinState = SlotGameResultManager.Instance.getSubGameState("freeSpin");

        // 检查是否重触发（剩余次数增加）
        if (freeSpinState.totalCnt > SlotManager.Instance._freespinTotalCount) {
            // 延迟状态
            const delayState = new State();
            delayState.addOnStartCallback(() => {
                this.game_manager?.scheduleOnce(() => {
                    delayState.setDone();
                }, 0.5);
            });

            // 重触发符号动画状态
            const retriggerAniState = new State();
            retriggerAniState.addOnStartCallback(() => {
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "FREESPIN RETRIGGERED");
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                SlotManager.Instance.paylineRenderer?.clearAll();

                // 播放重触发符号动画
                const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
                const symbolInfoArray = SlotGameResultManager.Instance.getResultSymbolInfoArray();

                for (let col = 0; col < 5; col++) {
                    for (let row = 0; row < 3; row++) {
                        if (lastHistoryWindows.GetWindow(col).getSymbol(row) === 92) {
                            const aniNode = SymbolAnimationController.Instance.playAnimationSymbol(col, row, 93);
                            aniNode.getComponent(JackpotSymbolComponent_BeeLovedJars).setInfo(symbolInfoArray[col][row]);
                            this.game_manager?.reelMachine.reels[col].getComponent(Reel_BeeLovedJars)
                                .hideSymbolInRowForAppear(row);
                        }
                    }
                }

                this.game_manager?.scheduleOnce(() => {
                    retriggerAniState.setDone();
                }, 1);
            });

            // 重触发弹窗状态
            const retriggerPopupState = new State();
            retriggerPopupState.addOnStartCallback(() => {
                this.game_manager?.game_components.freeSpinRetriggerPopup.getComponent(FreeSpinRetriggerdPopup_BeeLovedJars)
                    .open(() => {
                        this.changeUIToFreeSpin(false);
                        retriggerPopupState.setDone();
                    });
            });

            // 组装状态流程
            rootState.insert(0, delayState);
            rootState.insert(0, this.getStopSingleLineActionState());
            rootState.insert(0, this.getStopAllSymbolAniState());
            rootState.insert(1, retriggerAniState);
            rootState.insert(2, this.getForceScrollDownState());
            rootState.insert(3, retriggerPopupState);
        } else {
            rootState.setDone();
        }

        return rootState;
    }

    /**
     * 获取检查免费游戏结束状态
     */
    public getCheckFreespinEndState(): SequencialState {
        const rootState = new SequencialState();
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();

        // 未结束则仅添加延迟状态
        if (currentSubGameKey !== "freeSpin" && currentSubGameKey !== "bonusWheel_freeSpin" || nextSubGameKey !== "base") {
            const delayState = new State();
            delayState.addOnStartCallback(() => {
                SlotManager.Instance.scheduleOnce(() => {
                    delayState.setDone();
                }, 0.5);
            });
            rootState.insert(0, delayState);
        } else {
            // 已结束则处理结果并恢复基础UI
            const freeSpinState = SlotGameResultManager.Instance.getSubGameState("freeSpin");
            SlotGameResultManager.Instance.winMoneyInFreespinMode = freeSpinState.totalWinningCoin;

            // 展示免费游戏结果
            const resultState = this.getShowFreespinResultState();
            
            rootState.insert(0, this.getForceScrollDownState());
            rootState.insert(0, resultState);
            rootState.insert(0, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
            rootState.insert(0, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(SlotGameResultManager.Instance.winMoneyInFreespinMode));

            // 恢复普通UI
            const normalUIState = this.getChangeUIToNormalState();
            rootState.insert(1, normalUIState);
            rootState.insert(2, this.getShowBigWinEffectEndFreespinState());
            rootState.insert(2, this.getStopSingleLineActionState());
            rootState.insert(2, this.getStopAllSymbolAniState());
        }

        return rootState;
    }

    /**
     * 获取免费游戏结束大奖特效状态
     */
    public getShowBigWinEffectEndFreespinState(): State {
        const effectState = new State();
        effectState.addOnStartCallback(() => {
            const freeSpinWin = SlotGameResultManager.Instance.winMoneyInFreespinMode;
            const winType = SlotGameResultManager.Instance.getWinType(freeSpinWin);

            if (winType !== SlotGameResultManager.WINSTATE_NORMAL) {
                const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                const totalBet = SlotGameRuleManager.Instance.getTotalBet();
                
                bigWinEffect._isPlayExplodeCoin = false;
                bigWinEffect.playWinEffectWithoutIncreaseMoney(freeSpinWin, totalBet, () => {
                    SlotManager.Instance.setMouseDragEventFlag(true);
                    effectState.setDone();
                });
            } else {
                SlotManager.Instance.setMouseDragEventFlag(true);
                effectState.setDone();
            }
        });
        return effectState;
    }

    /**
     * 获取重置特殊节点状态
     */
    public getResetSpecialNodeState(): State {
        const resetState = new State();
        resetState.addOnStartCallback(() => {
            this.game_manager?.game_components.lockComponent.getComponent(LockComponent_BeeLovedJars).resetSpecialSymbol();
            resetState.setDone();
        });
        return resetState;
    }

    /**
     * 获取旋转延迟状态（Lock&Roll专用）
     */
    public getAddSpinDelayState(): State {
        const delayState = new State();
        delayState.addOnStartCallback(() => {
            const historyWindows = SlotGameResultManager.Instance.getHistoryWindows();
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            let hasSpecialSymbol = false;

            // 检查是否有特殊符号(96/97)
            for (let i = 0; i < historyWindows.length; i++) {
                for (let col = 0; col < 5; col++) {
                    for (let row = 0; row < 3; row++) {
                        const symbol = historyWindows[i].GetWindow(col).getSymbol(row);
                        const lastSymbol = lastHistoryWindows.GetWindow(col).getSymbol(row);
                        
                        if ((symbol === 96 || symbol === 97) && lastSymbol !== 0) {
                            hasSpecialSymbol = true;
                            break;
                        }
                    }
                    if (hasSpecialSymbol) break;
                }
                if (hasSpecialSymbol) break;
            }

            // 有特殊符号则延迟1.5秒
            if (hasSpecialSymbol) {
                this.game_manager?.scheduleOnce(() => {
                    delayState.setDone();
                }, 1.5);
            } else {
                delayState.setDone();
            }
        });
        return delayState;
    }

    /**
     * 获取减少剩余次数状态（Lock&Roll专用）
     */
    public getDecreaseTotalCount(): State {
        const decreaseState = new State();
        decreaseState.addOnStartCallback(() => {
            this.game_manager?.game_components.remainCount.getComponent(RemainCountComponent_BeeLovedJars).decreseCount();
            decreaseState.setDone();
        });
        return decreaseState;
    }

    /**
     * 获取第一步收集奖金状态（Lock&Roll专用）
     */
    public getMoveOneStep(): State {
        const moveState = new State();
        moveState.addOnStartCallback(() => {
            this.game_manager?.game_components.lockComponent.getComponent(LockComponent_BeeLovedJars)
                .CollectJackpot(0, () => {
                    moveState.setDone();
                });
        });
        return moveState;
    }

    /**
     * 获取第二步收集奖金状态（Lock&Roll专用）
     */
    public getMoveTwoStep(): State {
        const moveState = new State();
        moveState.addOnStartCallback(() => {
            this.game_manager?.game_components.lockComponent.getComponent(LockComponent_BeeLovedJars)
                .CollectJackpot(1, () => {
                    moveState.setDone();
                });
        });
        return moveState;
    }

    /**
     * 获取Lock&Roll大奖状态
     */
    public getLockNRollGrandJackpotState(): SequencialState {
        const rootState = new SequencialState();
        const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;

        if (jackpotResults && jackpotResults.length > 0) {
            // 大奖触发状态
            const triggerState = new State();
            triggerState.addOnStartCallback(() => {
                // 隐藏剩余次数UI
                this.game_manager.game_components.remainCount.active = false;
                // 播放Lock&Roll触发特效
                this.game_manager?.game_components.lockComponent.getComponent(LockComponent_BeeLovedJars).triggerFX();

                const jackpotResult = jackpotResults[0];
                // 更新奖金显示
                const lockNRollDisplay = this.game_manager?.game_components.lockNRollDisplay.getComponent(JackpotMoneyDisplay_WithMaxLength);
                lockNRollDisplay?.setPlayingState(jackpotResult.jackpotSubKey, false);
                lockNRollDisplay?.setShowingMoney(jackpotResult.jackpotSubKey, jackpotResult.winningCoin);

                // 设置底部文本
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "JACKPOT WIN");
                SlotManager.Instance.bottomUIText.setWinMoney(jackpotResult.winningCoin);

                // 播放顶部UI特效
                this.game_manager?.game_components.lockNRollTopUI.getComponent(LockNRollTopUIComponent_BeeLovedJars).winFX();

                this.game_manager?.scheduleOnce(() => {
                    triggerState.setDone();
                }, 2);
            });

            // 大奖弹窗状态
            const popupState = new State();
            popupState.addOnStartCallback(() => {
                // 再次播放顶部UI特效
                this.game_manager?.game_components.lockNRollTopUI.getComponent(LockNRollTopUIComponent_BeeLovedJars).winFX();

                const jackpotResult = jackpotResults[0];
                // 显示大奖弹窗
                this.game_manager?.game_components.grandeJackpotPopup_LockNRoll.getComponent(JackpotResultPopup_BeeLovedJars)
                    .showPopup(jackpotResult, 1, () => {
                        const lockNRollDisplay = this.game_manager?.game_components.lockNRollDisplay.getComponent(JackpotMoneyDisplay_WithMaxLength);
                        lockNRollDisplay?.setPlayingState(jackpotResult.jackpotSubKey, true);
                        this.game_manager?.game_components.lockNRollTopUI.getComponent(LockNRollTopUIComponent_BeeLovedJars).init();
                        popupState.setDone();
                    });
            });

            rootState.insert(0, triggerState);
            rootState.insert(1, popupState);
        }

        return rootState;
    }

    /**
     * 获取计算旋转结果状态（Lock&Roll专用）
     */
    public getCaculateSpinState(): State {
        const calcState = new State();
        calcState.addOnStartCallback(() => {
            if (SlotGameResultManager.Instance.getNextSubGameKey() === "base") {
                // 隐藏剩余次数UI
                this.game_manager.game_components.remainCount.active = false;
                // 计算旋转结果
                this.game_manager.game_components.lockComponent.getComponent(LockComponent_BeeLovedJars)
                    .CalculateSpin(() => {
                        calcState.setDone();
                    });
            } else {
                calcState.setDone();
            }
        });
        return calcState;
    }

    /**
     * 获取更新剩余次数状态（Lock&Roll专用）
     */
    public getUpdateTotalCount(): State {
        const updateState = new State();
        updateState.addOnStartCallback(() => {
            if (SlotGameResultManager.Instance.getNextSubGameKey() !== "base") {
                this.game_manager?.game_components.remainCount.getComponent(RemainCountComponent_BeeLovedJars)
                    .updateCount(() => {
                        updateState.setDone();
                    });
            } else {
                updateState.setDone();
            }
        });
        return updateState;
    }

    /**
     * 获取检查Lock&Roll结束状态
     */
    public getCheckLockNRollEndState(): SequencialState {
        const rootState = new SequencialState();

        if (SlotGameResultManager.Instance.getNextSubGameKey() === "base") {
            // 展示Lock&Roll结果
            rootState.insert(0, this.getShowLockNRollResultState());
            // 播放大奖特效
            rootState.insert(1, this.getShowBigWinEffectEndLockNRollState());
            // 恢复普通UI
            rootState.insert(2, this.getChangeUIToNormalState(true));
        }

        return rootState;
    }

    /**
     * 获取展示Lock&Roll结果状态
     */
    public getShowLockNRollResultState(): State {
        const resultState = new State();
        resultState.addOnStartCallback(() => {
            const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const subGameState = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey);
            const totalWin = subGameState.totalWinningCoin;
            const betPerLine = subGameState.betPerLines;

            // 无奖金直接结束
            if (totalWin <= 0) {
                resultState.setDone();
                return;
            }

            // 显示Lock&Roll结果弹窗
            this.game_manager?.game_components.lockNRollResultPopup.getComponent(LockNRollResultPopup_BeeLovedJars)
                .open(totalWin, betPerLine, () => {
                    resultState.setDone();
                });
        });
        return resultState;
    }

    /**
     * 获取Lock&Roll结束大奖特效状态
     */
    public getShowBigWinEffectEndLockNRollState(): State {
        const effectState = new State();
        effectState.addOnStartCallback(() => {
            const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const totalWin = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey).totalWinningCoin;
            const winType = SlotGameResultManager.Instance.getWinType(totalWin);

            if (winType !==SlotGameResultManager.WINSTATE_NORMAL) {
                const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                const totalBet = SlotGameRuleManager.Instance.getTotalBet();
                
                bigWinEffect._isPlayExplodeCoin = false;
                bigWinEffect.playWinEffectWithoutIncreaseMoney(totalWin, totalBet, () => {
                    effectState.setDone();
                });
            } else {
                effectState.setDone();
            }
        });
        return effectState;
    }

    /**
     * 播放奖金增加完成音效
     */
    public playIncrementEndCoinSound(): void {
        SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");
        SlotSoundController.Instance().playAudio("IncrementCoinEnd", "FX");
    }

    /**
     * 根据Jackpot子ID获取对应弹窗组件
     * @param subID Jackpot子ID（0:Mini, 1:Minor, 2:Major, 3:Grande）
     */
    private getJackpotPopupBySubID(subID: number): JackpotResultPopup_BeeLovedJars {
        if (!this.game_manager) {
            throw new Error("Game manager is not initialized");
        }

        switch (subID) {
            case 0:
                return this.game_manager.game_components.miniJackpotPopup.getComponent(JackpotResultPopup_BeeLovedJars);
            case 1:
                return this.game_manager.game_components.minorJackpotPopup.getComponent(JackpotResultPopup_BeeLovedJars);
            case 2:
                return this.game_manager.game_components.majorJackpotPopup.getComponent(JackpotResultPopup_BeeLovedJars);
            default:
                return this.game_manager.game_components.grandeJackpotPopup.getComponent(JackpotResultPopup_BeeLovedJars);
        }
    }

    // ========== 继承自基础类的核心方法实现 ==========
    getWinResultStateOnAllLines() {
        var e = this
          , t = new State;
        return t.addOnStartCallback(function() {
            var n = SlotGameResultManager.Instance.getSpinResult().payOutResults
              , o = SlotGameResultManager.Instance.getSpinResult().symbolInfoResults
              , a = SlotGameResultManager.Instance.getLastHistoryWindows();
            if (null != n && null != n && n.length > 0 || null != o && null != o && o.length > 0) {
                for (var i = 0; i < n.length; ++i)
                    ;
                var l;
                l = cc.callFunc(function() {
                    for (var e, t, i = [], l = function(o) {
                        if (-1 == n[o].payLine || null != n[o].winningCell && 0 != n[o].winningCell.length) {
                            var l, r;
                            for (s = 0; s < n[o].winningCell.length; ++s)
                                l = n[o].winningCell[s][1],
                                r = n[o].winningCell[s][0],
                                i.some(function(e) {
                                    return e.x === l && e.y === r
                                }) || i.push(new cc.Vec2(l,r))
                        } else {
                            e = n[o].payLine;
                            for (var s = 0; s < 5; ++s) {
                                var c = Math.floor(e / (1e4 / Math.pow(10, s))) % 10;
                                if (0 != c) {
                                    t = true;
                                    for (var u = 0; u < i.length; ++u)
                                        if (i[u].x == s && i[u].y == c - 1 || 51 == a.GetWindow(i[u].x).getSymbol(i[u].y)) {
                                            t = false;
                                            break
                                        }
                                    t && i.push(new cc.Vec2(s,c - 1))
                                }
                            }
                        }
                    }, r = 0; r < n.length; ++r)
                        l(r);
                    var s = function(e) {
                        var t = o[e];
                        i.some(function(e) {
                            return e.x === t.winningCellX && e.y === t.winningCellY
                        }) || i.push(new cc.Vec2(t.winningCellX,t.winningCellY))
                    };
                    for (r = 0; r < o.length; ++r)
                        s(r);
                    var c = SlotManager.Instance.paylineRenderer.m_symbolWidth
                      , u = SlotManager.Instance.paylineRenderer.m_symbolHeight
                      , p = SlotManager.Instance.paylineRenderer.m_lineWidth;
                      SlotManager.Instance.paylineRenderer.drawWinningRect(i, c, u, null, p)
                });
                var r = cc.callFunc(function() {
                    t.setDone()
                }
                .bind(e))
                  , s = cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect);
                null != l ? SlotManager.Instance.node.runAction(cc.sequence(l, cc.callFunc(function() {
                    e.showTotalSymbolEffectOnAllLines()
                }), s, r)) : SlotManager.Instance.node.runAction(r)
            } else
                t.setDone()
        }),
        t.addOnEndCallback(function() {
            t.onEnd()
        }),
        t
    }
    
    showTotalSymbolEffectOnAllLines() {
        var e = SlotGameResultManager.Instance.getSpinResult().payOutResults
          , t = SlotGameResultManager.Instance.getSpinResult().symbolInfoResults
          , n = SlotGameResultManager.Instance.getLastHistoryWindows()
          , o = [];
        if (null != e && null != e && e.length > 0 || null != t && null != t && t.length > 0) {
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            var a = function(e) {
                for (var t = false, n = 0; n < o.length; ++n)
                    if (e.col == o[n].col && e.row == o[n].row) {
                        t = true;
                        break
                    }
                return t
            };
            if (TSUtility.isValid(e))
                for (var i = 0; i < e.length; ++i) {
                    var l = e[i].payLine;
                    if (null != e[i].winningCell && e[i].winningCell.length > 0)
                        for (var s = void 0, c = void 0, u = 0; u < e[i].winningCell.length; ++u)
                            s = e[i].winningCell[u][1],
                            c = e[i].winningCell[u][0],
                            !a(p = new Cell(s,c)) && o.push(p);
                    else
                        for (u = 0; u < 5; ++u) {
                            var p, m = Math.floor(l / (1e4 / Math.pow(10, u))) % 10;
                            0 != m && !a(p = new Cell(u,m - 1)) && o.push(p)
                        }
                }
            if (TSUtility.isValid(t) && t.length > 0) {
                var S = function(e) {
                    var n = t[e];
                    o.some(function(e) {
                        return e.col === n.winningCellX && e.row === n.winningCellY
                    }) || o.push(new Cell(n.winningCellX,n.winningCellY))
                };
                for (i = 0; i < t.length; ++i)
                    S(i)
            }
            o.length > 0 ? SlotManager.Instance.reelMachine.setSymbolsDimmActive(true) : SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            var g = SlotGameResultManager.Instance.getResultSymbolInfoArray();
            for (i = 0; i < o.length; ++i) {
                var b = o[i]
                  , C = n.GetWindow(b.col).getSymbol(b.row)
                  , v =SymbolAnimationController.Instance.playAnimationSymbol(b.col, b.row, C);
                  SlotManager.Instance.reelMachine.reels[b.col].getComponent(Reel).hideSymbolInRow(b.row),
                C > 90 && v.getComponent(JackpotSymbolComponent_BeeLovedJars).setInfo(g[b.col][b.row])
            }
            SymbolAnimationController.Instance.resetZorderSymbolAnimation(),
            SlotSoundController.Instance().playWinSound(SlotGameResultManager.Instance.getTotalWinSymbolList())
        }
    }
    
    getSingleLineEffectForAllLinesState = function() {
        var e = this
          , t = new State;
        return t.addOnStartCallback(function() {
            var n = SlotGameResultManager.Instance.getSpinResult().payOutResults
              , o = SlotGameResultManager.Instance.getSpinResult().symbolInfoResults
              , a = SlotGameResultManager.Instance.getLastHistoryWindows()
              , i = [];
            if (SlotGameResultManager.Instance.getWinType() == SlotGameResultManager.WINSTATE_NORMAL) {
                if (!(null != n && 0 != n.length || null != o && 0 != o.length))
                    return void t.setDone();
                if (SlotReelSpinStateManager.Instance.getAutospinMode() || SlotReelSpinStateManager.Instance.getFreespinMode() || SlotGameResultManager.Instance.getWinningCoinBySymbolId(51) > 0)
                    return void t.setDone()
            } else if (!(null != n && 0 != n.length || null != o && 0 != o.length))
                return void t.setDone();
            for (var s = 0, c = [], u = 0, p = TSUtility.isValid(n) ? n.length : 0, m = TSUtility.isValid(o) && o.length > 0 ? 1 : 0, y = p + m, g = 0; g < y; g++)
                if (u++,
                g < p)
                    for (var b = 0; b < n[g].payOut.symbols.length; ++b)
                        -1 == c.indexOf(n[g].payOut.symbols[b]) && c.push(n[g].payOut.symbols[b]);
                else
                    c.push(92);
            var C = cc.callFunc(function() {
                var e = 0
                  , t = [];
                  SymbolAnimationController.Instance.stopAllAnimationSymbol(),
                i.length = 0;
                var m = function(e) {
                    for (var t = false, n = 0; n < i.length; ++n)
                        if (e.col == i[n].col && e.row == i[n].row) {
                            t = true;
                            break
                        }
                    return t
                }
                  , S = 0
                  , g = 0
                  , b = 0;
                if (TSUtility.isValid(n) && s < p) {
                    e = c[s];
                    for (var C = 0; C < n.length; ++C) {
                        var v = n[C].payLine;
                        if (-1 != n[C].payOut.symbols.indexOf(e))
                            if (S += n[C].winningCoin,
                            g++,
                            b = 0,
                            null != n[C].winningCell && n[C].winningCell.length > 0) {
                                for (var I = void 0, R = void 0, P = void 0, O = 0; O < n[C].winningCell.length; ++O)
                                    I = n[C].winningCell[O][1],
                                    R = n[C].winningCell[O][0],
                                    P = new Cell(I,R),
                                    i.push(P),
                                    t.push(new cc.Vec2(I,R));
                                b < I + 1 && (b = I + 1)
                            } else
                                for (O = 0; O < 5; ++O) {
                                    var A = Math.floor(v / (1e4 / Math.pow(10, O))) % 10;
                                    0 != A && (!m(P = new Cell(O,A - 1)) && (i.push(P),
                                    t.push(new cc.Vec2(O,A - 1))),
                                    O + 1 > b && (b = O + 1))
                                }
                    }
                } else if (TSUtility.isValid(o) && o.length > 0)
                    for (e = 92,
                    C = 0; C < o.length; ++C) {
                        P = new Cell(o[C].winningCellX,o[C].winningCellY);
                        var w = new cc.Vec2(o[C].winningCellX,o[C].winningCellY);
                        i.push(P),
                        t.push(w),
                        S += o[C].winningCoin
                    }
                if (null != SlotManager.Instance.paylineRenderer) {
                    SlotManager.Instance.paylineRenderer.clearAll();
                    var T = SlotManager.Instance.paylineRenderer.m_symbolWidth
                      , k = SlotManager.Instance.paylineRenderer.m_symbolHeight
                      , B = SlotManager.Instance.paylineRenderer.m_lineWidth;
                      SlotManager.Instance.paylineRenderer.drawWinningRect(t, T, k, null, B)
                }
                var F = SlotGameResultManager.Instance.getResultSymbolInfoArray();
                for (C = 0; C < i.length; C++) {
                    var N = i[C]
                      , E = a.GetWindow(N.col).getSymbol(N.row)
                      , L = SymbolAnimationController.Instance.playAnimationSymbol(N.col, N.row, E);
                      SlotManager.Instance.reelMachine.reels[N.col].getComponent(Reel).hideSymbolInRow(N.row),
                    E > 90 && L.getComponent(JackpotSymbolComponent_BeeLovedJars).setInfo(F[N.col][N.row])
                }
                if (u > 1) {
                    var x = SlotGameResultManager.Instance.getTotalWinMoney()
                      , G = "PAYS " + CurrencyFormatHelper.formatNumber(S);
                      SlotManager.Instance.bottomUIText.setWinMoney(x, G)
                }
                this.showSinglePaylineInfoForAllLines(this.getSymbolName(e), b, g, S),
                s == y - 1 ? s = 0 : s++,
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(true),
                SymbolAnimationController.Instance.resetZorderSymbolAnimation()
            }
            .bind(e));
            e.stopSingleLineAction(),
            e.actionSingleLine = cc.repeatForever(cc.sequence(C, cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect))),
            SlotManager.Instance.node.runAction(e.actionSingleLine),
            t.setDone()
        }),
        t
    }
    
    getForceScrollDownState = function() {
        var e = new State;
        return e.addOnStartCallback(function() {
            if (1 == CameraControl.Instance.eStateOfCameraPosition || !CameraControl.Instance.isOriginalPos()) {
                var t = cc.callFunc(function() {
                    SlotManager.Instance.setMouseDragEventFlag(false),
                    CameraControl.Instance.scrollDownScreen(.5)
                })
                  , n = cc.callFunc(function() {
                    e.setDone()
                })
                  , o = cc.sequence(t, cc.delayTime(.5), n);
                  SlotManager.Instance.node.runAction(o)
            } else
                e.setDone()
        }),
        e
    }
    
    getChangeUIToNormalState = function(e = false) {
        var t = this;
        var n = new State;
        return n.addOnStartCallback(function() {
            t.game_manager.game_components.lockComponent.getComponent(LockComponent_BeeLovedJars).clearFilledSymbols(),
            t.game_manager.reelMachine.getComponent(ReelMachine_BeeLovedJars).showBaseReels(),
            t.game_manager.setOverSizeSymbol(),
            t.game_manager.game_components.uiComponent.getComponent(UIComponent_BeeLovedJars).setBase();
            var o = SlotGameResultManager.Instance.getSubGameState("base").lastWindows
              , a = SlotGameResultManager.Instance.getSubGameState("base").lastSymbolInfoWindow;
            if (e)
                for (var i = 0; i < 5; i++)
                    for (var l = 0; l < 3; l++) {
                        var r = o[i][l]
                          , s = a[i][l];
                        t.game_manager.reelMachine.getComponent(ReelMachine_BeeLovedJars).reels[i].getComponent(Reel).changeSymbol(l, r, s);
                        var c = t.game_manager.reelMachine.getComponent(ReelMachine_BeeLovedJars).reels[i].getComponent(Reel).getSymbol(l);
                        9 == Math.floor(r / 10) && c.getComponent(JackpotSymbolComponent_BeeLovedJars).setInfo(s)
                    }
            t.changeUIToNormal(),
            n.setDone()
        }),
        n
    }
    
    changeUIToNormal = function() {
        this.game_manager._bottomUI.hideFreespinUI(),
        this.game_manager.stopAllBGM(),
        this.game_manager.playMainBgm(),
        SlotReelSpinStateManager.Instance.setFreespinMode(false)
    }
    
    getFreeSpinUIState = function() {
        var e = this
          , t = new State;
        return t.addOnStartCallback(function() {
            e.game_manager.game_components.uiComponent.getComponent(UIComponent_BeeLovedJars).setFreeSpin(),
            e.changeUIToFreeSpin(),
            t.setDone()
        }),
        t
    }
    
    changeUIToFreeSpin = function(e=true) {
        var t = SlotGameResultManager.Instance.getSubGameState("freeSpin");
        SlotManager.Instance._freespinTotalCount = t.totalCnt,
        SlotManager.Instance._freespinPastCount = t.spinCnt,
        SlotManager.Instance._freespinMultiplier = t.spinMultiplier,
        SlotManager.Instance._bottomUI.showFreespinUI(),
        SlotManager.Instance._bottomUI.setShowFreespinMultiplier(false),
        SlotManager.Instance.setFreespinExtraInfoByCurrentState(),
        e && SlotManager.Instance.bottomUIText.setWinMoney(SlotGameResultManager.Instance.winMoneyInFreespinMode),
        SlotReelSpinStateManager.Instance.setFreespinMode(true)
    }
    
    isShowWinMoneyEffect() {
        var e = SlotGameResultManager.Instance.getSpinResult().payOutResults
          , t = SlotGameResultManager.Instance.getSpinResult().symbolInfoResults;
        return TSUtility.isValid(e) && e.length > 0 || TSUtility.isValid(t) && t.length > 0
    }
}