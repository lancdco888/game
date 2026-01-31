const { ccclass, property } = cc._decorator;

import ChangeSymbolComponent_Zhuquefortune from "./ChangeSymbolComponent_Zhuquefortune";
import EnteranceComponent_Zhuquefortune from "./EnteranceComponent_Zhuquefortune";
import ExpectComponent_Zhuquefortune from "./ExpectComponent_Zhuquefortune";
import JackpotModeComponent_Zhuquefortune from "./JackpotModeComponent_Zhuquefortune";
import JackpotSymbolComponent_Zhuquefortune from "./JackpotSymbolComponent_Zhuquefortune";
import LockComponent_Zhuquefortune from "./LockComponent_Zhuquefortune";
import PotComponent_Zhuquefortune from "./PotComponent_Zhuquefortune";
import RemainCountComponent_Zhuquefortune from "./RemainCountComponent_Zhuquefortune";
import UIComponent_Zhuquefortune from "./UIComponent_Zhuquefortune";
import JackpotResultPopup_Zhuquefortune from "./JackpotResultPopup_Zhuquefortune";
import JustPopup_Zhuquefortune from "./JustPopup_Zhuquefortune";
import LockNRollResultPopup_Zhuquefortune from "./LockNRollResultPopup_Zhuquefortune";
import Reel_Zhuquefortune from "./Reel_Zhuquefortune";
import ReelMachine_Zhuquefortune from "./ReelMachine_Zhuquefortune";
import ZhuquefortuneManager from "./ZhuquefortuneManager";
import SubGameStateManager_Base from "../../../../Script/SubGameStateManager_Base";
import State, { SequencialState } from "../../../../Script/Slot/State";
import SlotManager from "../../../../Script/manager/SlotManager";
import { BottomTextType } from "../../../../Script/SubGame/BottomUIText";
import SlotGameResultManager, { Cell } from "../../../../Script/manager/SlotGameResultManager";
import CameraControl from "../../../../Script/Slot/CameraControl";
import SlotGameRuleManager from "../../../../Script/manager/SlotGameRuleManager";
import SymbolAnimationController from "../../../../Script/Slot/SymbolAnimationController";
import SlotSoundController from "../../../../Script/Slot/SlotSoundController";
import Reel from "../../../../Script/Slot/Reel";
import SlotReelSpinStateManager from "../../../../Script/Slot/SlotReelSpinStateManager";
import LangLocaleManager from "../../../../Script/manager/LangLocaleManager";
import TSUtility from "../../../../Script/global_utility/TSUtility";
import CurrencyFormatHelper from "../../../../Script/global_utility/CurrencyFormatHelper";
import SoundManager from "../../../../Script/manager/SoundManager";
import GameComponents_Base from "../../../../Script/game/GameComponents_Base";

/**
 * 朱雀财富子游戏状态管理类
 * 继承自SubGameStateManager_Base，负责管理基础游戏、Jackpot、Lock&Roll三大子游戏的状态流转和逻辑执行
 */
@ccclass()
export default class SubGameStateManager_Zhuquefortune extends SubGameStateManager_Base {
    // 实例成员变量（补充TS类型注解）
    private game_manager: ZhuquefortuneManager | null = null;

    /**
     * 设置游戏管理类实例引用
     * @param manager ZhuquefortuneManager实例
     */
    public setManager(manager: ZhuquefortuneManager): void {
        this.game_manager = manager;
    }

    /**
     * 获取基础游戏状态（核心状态流转逻辑）
     */
    public getBaseGameState(): SequencialState {
        const rootState = new SequencialState();
        const preSpinState = new SequencialState();
        let stateIndex = 0;

        // 预旋转状态初始化
        preSpinState.insert(stateIndex++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        preSpinState.insert(stateIndex++, this.getStopSingleLineActionState());
        preSpinState.insert(stateIndex++, this.getStopAllSymbolAniState());
        preSpinState.insert(stateIndex++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
        preSpinState.insert(stateIndex++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(0));
        preSpinState.insert(stateIndex++, this.getAddSuperPotState());
        preSpinState.insert(stateIndex++, this.getInitPot());
        preSpinState.insert(stateIndex++, SlotManager.Instance.getReelSpinStartState());
        rootState.insert(0, preSpinState);

        // 旋转核心逻辑状态
        const spinCoreState = new SequencialState();
        spinCoreState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                this.game_manager?.setNextEffect();
                this.game_manager?.setUpdateCount();

                const visibleSlotWindows = SlotGameResultManager.Instance.getVisibleSlotWindows();
                stateIndex = 0; // 重置内部索引
                spinCoreState.insert(stateIndex++, this.getSpinResultFxState());
                spinCoreState.insert(stateIndex++, SlotManager.Instance.reelMachine.getNormalSpinReelStateRenewal(visibleSlotWindows));
                spinCoreState.insert(stateIndex++, this.getUpdateSuperPotState());
                spinCoreState.insert(stateIndex++, this.getScrollDownBeforeWinResultState());
                spinCoreState.insert(stateIndex++, this.getShowTotalTriggeredPaylineState());

                // 符号特效和赔付线逻辑
                const symbolPaylineState = new SequencialState();
                symbolPaylineState.insert(0, this.getStateShowTotalSymbolEffectOnPayLines());
                symbolPaylineState.insert(1, this.getSingleLineEffectOnPaylineState());
                spinCoreState.insert(stateIndex, symbolPaylineState);
                spinCoreState.insert(stateIndex, this.getSetBottomInfoIncreaseWinMoneyState());
                spinCoreState.insert(stateIndex++, this.getWinMoneyState());
                spinCoreState.insert(stateIndex++, this.getRandomeTriggerState());
                spinCoreState.insert(stateIndex++, this.getLockNRollStartState());
                spinCoreState.insert(stateIndex++, this.setFalseFXState());
                spinCoreState.insert(stateIndex++, this.getJackpotModeStartState());
                spinCoreState.insert(stateIndex++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
            }
        });

        rootState.insert(1, spinCoreState);
        return rootState;
    }

    /**
     * 获取Jackpot游戏状态（核心状态流转逻辑）
     */
    public getJackpotGameState(): SequencialState {
        const rootState = new SequencialState();
        const self = this;

        // Jackpot结果展示状态
        const jackpotResultState = new State();
        jackpotResultState.addOnStartCallback(() => {
            const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults[0];
            this.game_manager?.game_components.jackpotModeNode.getComponent(JackpotModeComponent_Zhuquefortune)?.winJackpotUI();

            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
            const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const jackpotTitle = subGameKey === "jackpot" ? "JACKPOT WIN" : "SUPER JACKPOT WIN";

            SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, jackpotTitle);
            SlotManager.Instance.bottomUIText.setWinMoney(totalWin);

            this.game_manager?.game_components.jackpotResultPopup.getComponent(JackpotResultPopup_Zhuquefortune)?.showPopup(
                jackpotResults,
                () => jackpotResultState.setDone()
            );
        });

        // Jackpot结束清理状态
        const jackpotCleanState = new State();
        jackpotCleanState.addOnStartCallback(() => {
            this.game_manager?.game_components.jackpotModeNode.getComponent(JackpotModeComponent_Zhuquefortune)?.hideJackpotMode();
            SlotManager.Instance.setMouseDragEventFlag(false);
            CameraControl.Instance.scrollDownScreen(0.3);

            this.game_manager?.scheduleOnce(() => {
                this.game_manager?.setKeyboardEventFlag(true);
                this.game_manager?.setMouseDragEventFlag(true);
                SlotManager.Instance.playMainBgm();
                jackpotCleanState.setDone();
            }, 0.3);
        });

        // 根状态组装
        rootState.insert(0, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        rootState.insert(1, this.getSendBonusState());

        const jackpotCoreState = new SequencialState();
        jackpotCoreState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                jackpotCoreState.insert(0, this.game_manager?.game_components.jackpotModeNode.getComponent(JackpotModeComponent_Zhuquefortune)?.playJackpotGameState()!);
                jackpotCoreState.insert(1, jackpotResultState);
                jackpotCoreState.insert(2, this.getShowBigWinEffectEndJackpotState());
                jackpotCoreState.insert(3, jackpotCleanState);
                jackpotCoreState.insert(4, this.getLockNRollStartState());
                jackpotCoreState.insert(5, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
            }
        });

        rootState.insert(2, jackpotCoreState);
        return rootState;
    }

    /**
     * 获取Lock&Roll游戏状态（核心状态流转逻辑）
     */
    public getLockandRollGameState(): SequencialState {
        const rootState = new SequencialState();
        const preSpinState = new SequencialState();
        let stateIndex = 0;
        const self = this;

        // 预旋转状态初始化
        preSpinState.insert(stateIndex++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        preSpinState.insert(stateIndex++, this.getDecreaseTotalCount());
        preSpinState.insert(stateIndex++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.CustomData, "GOOD LUCK"));

        const lockNRollReels = this.game_manager?.reelMachine.getComponent(ReelMachine_Zhuquefortune)?.lockNRoll_Reels;
        preSpinState.insert(stateIndex++, this.game_manager?.getReelSpinStartState(lockNRollReels)!);
        rootState.insert(0, preSpinState);

        // Lock&Roll核心逻辑状态
        const lockCoreState = new SequencialState();
        lockCoreState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                lockCoreState.insert(stateIndex++, SlotManager.Instance.reelMachine.getComponent(ReelMachine_Zhuquefortune)?.getLockAndRollReelState()!);
                lockCoreState.insert(stateIndex++, this.getUpdateLockNRoll()); // 修复原JS拼写错误：Lcok→Lock
                lockCoreState.insert(stateIndex++, this.getUpdateTotalCount());
                lockCoreState.insert(stateIndex++, this.getCheckLockNRollEndState());
                lockCoreState.insert(stateIndex++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
            }
        });

        rootState.insert(1, lockCoreState);
        return rootState;
    }

    /**
     * 获取总符号特效展示状态
     */
    public getStateShowTotalSymbolEffectOnPayLines(): State {
        const state = new State();
        const self = this;

        state.addOnStartCallback(() => {
            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
            const effectDuration = totalWin > 3 * totalBet
                ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2
                : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

            if (self.showTotalSymbolEffectOnPaylines()) {
                SlotManager.Instance.scheduleOnce(() => {
                    state.setDone();
                }, effectDuration);
            } else {
                state.setDone();
            }
        });

        return state;
    }

    /**
     * 展示所有赔付线上的符号特效
     */
    public showTotalSymbolEffectOnPaylines(): boolean {
        const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
        const historyWindows = SlotGameResultManager.Instance.getHistoryWindows()[0];
        const processedCells: Cell[] = [];

        if (!payOutResults || payOutResults.length === 0) {
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            return false;
        }

        // 去重判断函数
        const isCellProcessed = (cell: Cell): boolean => {
            for (const processedCell of processedCells) {
                if (cell.col === processedCell.col && cell.row === processedCell.row) {
                    return true;
                }
            }
            return false;
        };

        // 停止所有符号动画并收集需要处理的单元格
        SymbolAnimationController.Instance.stopAllAnimationSymbol();
        for (const payOutResult of payOutResults) {
            for (const winningCell of payOutResult.winningCell) {
                const cell = new Cell(winningCell[1], winningCell[0]);
                if (!isCellProcessed(cell)) {
                    processedCells.push(cell);
                }
            }
        }

        // 排序并播放符号动画
        processedCells.sort((a, b) => a.row - b.row);
        for (const cell of processedCells) {
            const symbolId = historyWindows.GetWindow(cell.col).getSymbol(cell.row);
            SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbolId, null, null, true);
            SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel)?.hideSymbolInRow(cell.row);
        }

        // 重置符号动画层级并播放胜利音效
        SymbolAnimationController.Instance.resetZorderSymbolAnimation();
        SlotSoundController.Instance().playWinSound(SlotGameResultManager.Instance.getTotalWinSymbolList());

        // 返回是否有特效需要展示
        if (processedCells.length === 0) {
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            return false;
        } else {
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
            return true;
        }
    }

    /**
     * 获取单条赔付线特效展示状态
     */
    public getSingleLineEffectOnPaylineState(): State {
        const state = new State();
        const self = this;

        state.addOnStartCallback(() => {
            const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            const historyWindowCount = SlotGameResultManager.Instance.getHistoryWindows().length;
            const processedCells: Cell[] = [];

            // 校验是否需要展示单条赔付线
            if (SlotGameResultManager.Instance.getWinType() === SlotGameResultManager.WINSTATE_NORMAL) {
                if (!payOutResults || payOutResults.length === 0) {
                    state.setDone();
                    return;
                }
                if (SlotReelSpinStateManager.Instance.getAutospinMode() ||
                    SlotReelSpinStateManager.Instance.getFreespinMode() ||
                    (historyWindowCount > 1 && SlotGameResultManager.Instance.getWinType() === SlotGameResultManager.WINSTATE_NORMAL) ||
                    SlotGameResultManager.Instance.getWinningCoinBySymbolId(51) > 0) {
                    state.setDone();
                    return;
                }
            }

            const payLineCount = payOutResults?.length || 0;
            if (payLineCount > 0) {
                let isFirstPayLine = false;
                let currentPayLineIndex = 0;

                // 单条赔付线展示回调
                const showSinglePayLineCallback = cc.callFunc(() => {
                    const currentPayOut = payOutResults![currentPayLineIndex];
                    const payLine = currentPayOut.payLine;

                    // 绘制赔付线
                    if (SlotManager.Instance.paylineRenderer) {
                        SlotManager.Instance.paylineRenderer.clearAll();
                        if (payLine !== -1) {
                            SlotManager.Instance.paylineRenderer.drawSingleLine(payLine, currentPayOut.payOut.count);
                        }
                        // 播放赔付线音效
                        if (payOutResults!.length > 1) {
                            SlotSoundController.Instance().playAudio("ShowPayline", "FX");
                        } else if (payOutResults!.length === 1 && !isFirstPayLine) {
                            SlotSoundController.Instance().playAudio("ShowPayline", "FX");
                            isFirstPayLine = true;
                        }
                    }

                    // 停止并播放符号动画
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    processedCells.length = 0;
                    for (const winningCell of currentPayOut.winningCell) {
                        processedCells.push(new Cell(winningCell[1], winningCell[0]));
                    }

                    const symbolIds: number[] = [];
                    for (const cell of processedCells) {
                        const symbolId = lastHistoryWindows.GetWindow(cell.col).getSymbol(cell.row);
                        SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbolId);
                        symbolIds.push(symbolId);
                        SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel)?.hideSymbolInRow(cell.row);
                    }

                    // 更新底部胜利信息
                    if (payLineCount > 1) {
                        const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
                        const winningCoin = currentPayOut.winningCoin;
                        const langText = LangLocaleManager.getInstance().getLocalizedText("LINE ${0} PAYS ${1}");
                        const formattedText = TSUtility.strFormat(
                            langText.text,
                            (payLine + 1).toString(),
                            CurrencyFormatHelper.formatNumber(winningCoin)
                        );
                        SlotManager.Instance.bottomUIText.setWinMoney(totalWin, formattedText);
                    }

                    // 展示单条赔付线详情（原JS未实现具体逻辑，保留调用）
                    this.showSinglePaylineInfoForLines(payLine + 1, currentPayOut.winningCoin, currentPayOut.payOut.symbols);
                    currentPayLineIndex = (currentPayLineIndex + 1) % payOutResults!.length;
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
                });

                // 停止原有动作并播放新的循环动作
                this.stopSingleLineAction();
                this.actionSingleLine = cc.repeatForever(
                    cc.sequence(
                        showSinglePayLineCallback,
                        cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect)
                    )
                );
                SlotManager.Instance.node.runAction(this.actionSingleLine);
                state.setDone();
            } else {
                state.setDone();
            }
        });

        return state;
    }

    /**
     * 清除虚假特效标记状态
     */
    public setFalseFXState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager?.setFalseFX();
            state.setDone();
        });
        return state;
    }

    /**
     * 获取添加超级奖池状态
     */
    public getAddSuperPotState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager?.game_components.potComponent.getComponent(PotComponent_Zhuquefortune)?.setSuperPot();
            state.setDone();
        });
        return state;
    }

    /**
     * 获取更新超级奖池状态
     */
    public getUpdateSuperPotState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager?.game_components.potComponent.getComponent(PotComponent_Zhuquefortune)?.updateSuperPot();
            state.setDone();
        });
        return state;
    }

    /**
     * 获取初始化奖池状态
     */
    public getInitPot(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager?.game_components.potComponent.getComponent(PotComponent_Zhuquefortune)?.initUpdatePot();
            state.setDone();
        });
        return state;
    }

    /**
     * 获取Jackpot模式启动状态
     */
    public getJackpotModeStartState(): SequencialState {
        const rootState = new SequencialState();
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const self = this;

        // 普通Jackpot模式
        if (nextSubGameKey === "jackpot") {
            // 延迟等待状态
            const delayState = new State();
            delayState.addOnStartCallback(() => {
                const hasSymbol90 = this.checkIfHasSymbol90();
                if (hasSymbol90 && SlotGameResultManager.Instance.getTotalWinMoney() === 0) {
                    this.game_manager?.scheduleOnce(() => {
                        delayState.setDone();
                    }, 0.5);
                } else {
                    delayState.setDone();
                }
            });

            // Jackpot触发状态
            const triggerState = new State();
            triggerState.addOnStartCallback(() => {
                // 禁用下注按钮
                SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(false);
                SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(false);
                this.game_manager?.setMouseDragEventFlag(false);
                this.game_manager?.setKeyboardEventFlag(false);

                // 延迟更新底部文本
                this.game_manager?.scheduleOnce(() => {
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "JACKPOT TRIGGERED");
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                }, 1.5);

                // 播放奖池触发动画
                this.game_manager?.game_components.potComponent.getComponent(PotComponent_Zhuquefortune)?.playTriggerAni();
                triggerState.setDone();
            });

            // Jackpot弹窗展示状态
            const popupState = new State();
            popupState.addOnStartCallback(() => {
                this.game_manager?.game_components.jackpotModeStartPopup.getComponent(JustPopup_Zhuquefortune)?.open(() => {
                    SlotManager.Instance.playMainBgm();
                    CameraControl.Instance.scrollUpScreen(0.01);
                    this.game_manager?.game_components.jackpotModeNode.getComponent(JackpotModeComponent_Zhuquefortune)?.showJackpotMode(() => {
                        popupState.setDone();
                    });
                    this.game_manager?.game_components.potComponent.getComponent(PotComponent_Zhuquefortune)?.resetPot();
                });
            });

            // 组装状态
            rootState.insert(0, this.getStopSingleLineActionState());
            rootState.insert(0, this.getStopAllSymbolAniState());
            rootState.insert(0, this.getForceScrollDownState());
            rootState.insert(1, delayState);
            rootState.insert(2, triggerState);
            rootState.insert(3, popupState);
        }
        // 超级Jackpot模式
        else if (nextSubGameKey === "jackpot_super") {
            // 延迟等待状态
            const delayState = new State();
            delayState.addOnStartCallback(() => {
                const hasSymbol90 = this.checkIfHasSymbol90();
                if (hasSymbol90) {
                    this.game_manager?.scheduleOnce(() => {
                        delayState.setDone();
                    }, 0.5);
                } else {
                    delayState.setDone();
                }
            });

            // 超级Jackpot触发状态
            const triggerState = new State();
            triggerState.addOnStartCallback(() => {
                // 禁用下注按钮
                SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(false);
                SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(false);
                this.game_manager?.setMouseDragEventFlag(false);
                this.game_manager?.setKeyboardEventFlag(false);

                // 更新底部文本
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "SUPER JACKPOT TRIGGERED");
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                SoundManager.Instance().setMainVolumeTemporarily(0);

                // 播放超级奖池触发动画（修复原JS拼写错误：trigget→trigger）
                this.game_manager.game_components.potComponent.getComponent(PotComponent_Zhuquefortune).triggetSuperPot(() => {
                    triggerState.setDone();
                });
            });

            // 超级Jackpot弹窗展示状态
            const popupState = new State();
            popupState.addOnStartCallback(() => {
                this.game_manager?.game_components.superJackpotModeStartPopup.getComponent(JustPopup_Zhuquefortune)?.open(() => {
                    SlotManager.Instance.playMainBgm();
                    CameraControl.Instance.scrollUpScreen(0.01);
                    this.game_manager?.game_components.jackpotModeNode.getComponent(JackpotModeComponent_Zhuquefortune)?.showJackpotMode(() => {
                        popupState.setDone();
                    });
                    this.game_manager?.game_components.potComponent.getComponent(PotComponent_Zhuquefortune)?.resetFailedPot();
                    this.game_manager?.game_components.potComponent.getComponent(PotComponent_Zhuquefortune)?.initSuperPot();
                });
            });

            // 组装状态
            rootState.insert(0, this.getStopSingleLineActionState());
            rootState.insert(0, this.getStopAllSymbolAniState());
            rootState.insert(0, this.getForceScrollDownState());
            rootState.insert(1, delayState);
            rootState.insert(2, triggerState);
            rootState.insert(3, popupState);
        }
        // 普通模式下的预期Jackpot触发
        else {
            const hasSymbol90 = this.checkIfHasSymbol90();
            const potLevel = this.game_manager?.game_components.potComponent.getComponent(PotComponent_Zhuquefortune)?.getPot() || 0;
            const triggerProbability = this.getPotTriggerProbability(potLevel);
            const isTrigger = Math.random() < triggerProbability;

            if (hasSymbol90 && isTrigger) {
                // 延迟等待状态
                const delayState = new State();
                delayState.addOnStartCallback(() => {
                    const hasSymbol90 = this.checkIfHasSymbol90();
                    if (hasSymbol90 && SlotGameResultManager.Instance.getTotalWinMoney() === 0) {
                        this.game_manager?.scheduleOnce(() => {
                            delayState.setDone();
                        }, 0.5);
                    } else {
                        delayState.setDone();
                    }
                });

                // 预期触发状态
                const expectTriggerState = new State();
                expectTriggerState.addOnStartCallback(() => {
                    // 禁用下注按钮
                    SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(false);
                    SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(false);
                    this.game_manager?.setMouseDragEventFlag(false);
                    this.game_manager?.setKeyboardEventFlag(false);

                    // 播放预期触发动画
                    this.game_manager?.game_components.potComponent.getComponent(PotComponent_Zhuquefortune)?.playExpectTriggerAni(() => {
                        this.game_manager?.game_components.potComponent.getComponent(PotComponent_Zhuquefortune)?.resetFailedPot();
                        // 恢复下注按钮
                        SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(true);
                        SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(true);
                        this.game_manager?.setMouseDragEventFlag(true);
                        this.game_manager?.setKeyboardEventFlag(true);
                        expectTriggerState.setDone();
                    });
                });

                // 组装状态
                rootState.insert(0, this.getStopSingleLineActionState());
                rootState.insert(0, this.getStopAllSymbolAniState());
                rootState.insert(0, this.getForceScrollDownState());
                rootState.insert(1, delayState);
                rootState.insert(2, expectTriggerState);
            } else {
                rootState.setDone();
            }
        }

        return rootState;
    }

    /**
     * 获取发送奖励请求状态
     */
    public getSendBonusState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager?.game_components.jackpotModeNode.getComponent(JackpotModeComponent_Zhuquefortune)?.setJackpotType(() => {
                state.setDone();
            });
        });
        return state;
    }

    /**
     * 获取Jackpot结束时的大额胜利特效展示状态
     */
    public getShowBigWinEffectEndJackpotState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
            const winType = this.getWinType(totalWin);

            if (winType !==SlotGameResultManager.WINSTATE_NORMAL) {
                const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base)?.effectBigWinNew;
                let totalBet = SlotGameRuleManager.Instance.getTotalBet();

                // 超级Jackpot模式下更新总投注额
                if (SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult() === "jackpot_super") {
                    const superJackpotState = SlotGameResultManager.Instance.getSubGameState("jackpot_super");
                    totalBet = SlotGameRuleManager.Instance._maxBetLine * superJackpotState.customBetPerLine;
                }

                if (bigWinEffect) {
                    bigWinEffect._isPlayExplodeCoin = false;
                    bigWinEffect.playWinEffectWithoutIncreaseMoney(totalWin, totalBet, () => {
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
     * 获取胜利类型（普通、大额、超大额、终极大额）
     * @param winAmount 胜利金额
     */
    public getWinType(winAmount?: number): any {
        let totalBet = SlotGameRuleManager.Instance.getTotalBet();
        let totalWin = SlotGameResultManager.Instance.getTotalWinMoney();

        // 超级Jackpot模式下更新总投注额
        if (SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult() === "jackpot_super") {
            const superJackpotState = SlotGameResultManager.Instance.getSubGameState("jackpot_super");
            totalBet = SlotGameRuleManager.Instance._maxBetLine * superJackpotState.customBetPerLine;
        }

        // 优先使用传入的胜利金额
        if (winAmount !== undefined) {
            totalWin = winAmount;
        }

        // 判断胜利类型
        if (30 * totalBet <= totalWin) {
            return SlotGameResultManager.WINSTATE_ULTRA;
        } else if (20 * totalBet <= totalWin) {
            return SlotGameResultManager.WINSTATE_MEGA;
        } else if (10 * totalBet <= totalWin) {
            return SlotGameResultManager.WINSTATE_BIG;
        } else {
            return SlotGameResultManager.WINSTATE_NORMAL;
        }
    }

    /**
     * 获取旋转结果特效状态
     */
    public getSpinResultFxState(): SequencialState {
        const rootState = new SequencialState();
        const introSpinState = this.game_manager?.reelMachine.getComponent(ReelMachine_Zhuquefortune).getIntroInfiniteSpinUsingNextSubGameKeyState();
        const hasNextEffect = this.game_manager?.getNextEffect() || false;
        const hasNextFalseEffect = this.game_manager?.getNextFalseEffect() || false;

        if (hasNextEffect) {
            // 真实特效流程
            this.game_manager?.setMouseDragEventFlag(false);
            const expectState = this.getExpectState();

            rootState.insert(0, this.getForceScrollDownState());
            rootState.insert(1, introSpinState!);
            rootState.insert(2, expectState);

            // 特效结束回调
            expectState.addOnEndCallback(() => {
                SlotManager.Instance.setMouseDragEventFlag(true);
                introSpinState?.setDoneAllSubStates();
            });
            expectState.addOnEndCallback(() => {
                SlotManager.Instance.setMouseDragEventFlag(true);
            });
        } else if (hasNextFalseEffect) {
            // 虚假特效流程
            this.game_manager?.setMouseDragEventFlag(false);
            const falseExpectState = this.getFalseExpectState();

            rootState.insert(0, this.getForceScrollDownState());
            rootState.insert(1, introSpinState!);
            rootState.insert(2, falseExpectState);

            // 特效结束回调
            falseExpectState.addOnEndCallback(() => {
                SlotManager.Instance.setMouseDragEventFlag(true);
                introSpinState?.setDoneAllSubStates();
            });
            falseExpectState.addOnEndCallback(() => {
                SlotManager.Instance.setMouseDragEventFlag(true);
            });
        } else {
            // 无特效，直接完成
            rootState.setDone();
        }

        return rootState;
    }

    /**
     * 获取虚假预期特效状态
     */
    public getFalseExpectState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager?.game_components.expectComponent.getComponent(ExpectComponent_Zhuquefortune)?.showFalse();
            this.game_manager?.scheduleOnce(() => {
                state.setDone();
            }, 2);
        });
        return state;
    }

    /**
     * 获取随机预期特效状态
     */
    public getRandomExpectState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            this.stopSingleLineAction();
            SlotManager.Instance.paylineRenderer?.clearAll();
            SymbolAnimationController.Instance.stopAllAnimationSymbol();

            this.game_manager?.game_components.expectComponent.getComponent(ExpectComponent_Zhuquefortune)?.showExpect();
            this.game_manager?.scheduleOnce(() => {
                state.setDone();
            }, 2.5);
        });
        return state;
    }

    /**
     * 获取预期特效状态
     */
    public getExpectState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager?.game_components.expectComponent.getComponent(ExpectComponent_Zhuquefortune)?.showExpect();
            this.game_manager?.scheduleOnce(() => {
                state.setDone();
            }, 4.5);
        });
        return state;
    }

    /**
     * 获取随机触发状态
     */
    public getRandomeTriggerState(): SequencialState {
        const rootState = new SequencialState();
        const historyWindowCount = SlotGameResultManager.Instance.getHistoryWindows().length;

        if (historyWindowCount > 1) {
            const randomTriggerState = new State();
            randomTriggerState.addOnStartCallback(() => {
                if (SlotGameResultManager.Instance.getHistoryWindows().length !== 1) {
                    const firstHistoryWindow = SlotGameResultManager.Instance.getHistoryWindow(0);
                    const lastHistoryWindow = SlotGameResultManager.Instance.getLastHistoryWindows();
                    const targetCells: Cell[] = [];

                    // 收集需要随机触发的单元格
                    for (let col = 0; col < 5; col++) {
                        for (let row = 0; row < 3; row++) {
                            const oldSymbol = firstHistoryWindow.GetWindow(col).getSymbol(row);
                            const newSymbol = lastHistoryWindow.GetWindow(col).getSymbol(row);
                            if (Math.floor(oldSymbol / 10) !== 9 && Math.floor(newSymbol / 10) === 9) {
                                targetCells.push(new Cell(col, row));
                            }
                        }
                    }

                    // 打乱单元格顺序并逐个触发
                    if (targetCells.length > 0) {
                        this.shuffleTargetCells(targetCells);
                        let currentIndex = 0;

                        const triggerNextCell = () => {
                            currentIndex++;
                            if (currentIndex < targetCells.length) {
                                this.singleRandomAppear(targetCells[currentIndex], triggerNextCell);
                            } else {
                                this.game_manager?.scheduleOnce(() => {
                                    randomTriggerState.setDone();
                                }, 1);
                            }
                        };

                        this.singleRandomAppear(targetCells[currentIndex], triggerNextCell);
                    } else {
                        randomTriggerState.setDone();
                    }
                } else {
                    randomTriggerState.setDone();
                }
            });

            // 组装状态
            rootState.insert(0, this.getRandomExpectState());
            rootState.insert(1, randomTriggerState);
        } else {
            rootState.setDone();
        }

        return rootState;
    }

    /**
     * 打乱目标单元格数组顺序（洗牌算法）
     * @param cells 目标单元格数组
     */
    public shuffleTargetCells(cells: Cell[]): void {
        for (let i = cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cells[i], cells[j]] = [cells[j], cells[i]];
        }
    }

    /**
     * 获取Lock&Roll启动状态
     */
    public getLockNRollStartState(): SequencialState {
        const rootState = new SequencialState();
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();

        if (nextSubGameKey === "lockNRoll_mini") {
            // 延迟等待状态
            const delayState = new State();
            delayState.addOnStartCallback(() => {
                const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");
                const hasSymbol90 = this.checkIfHasSymbol90InWindows(baseGameState.lastWindows);

                if (hasSymbol90) {
                    this.game_manager?.scheduleOnce(() => {
                        delayState.setDone();
                    }, 0.5);
                } else {
                    delayState.setDone();
                }
            });

            // Lock&Roll触发状态
            const triggerState = new State();
            triggerState.addOnStartCallback(() => {
                this.game_manager?.game_components.setJackpotSymbolID();
                SlotManager.Instance.setMouseDragEventFlag(false);
                SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(false);
                SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(false);
                this.game_manager?.game_components.lockComponent.getComponent(LockComponent_Zhuquefortune)?.clearFilledSymbols();

                const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");
                const lastWindows = baseGameState.lastWindows;
                const lastSymbolInfoWindow = baseGameState.lastSymbolInfoWindow;

                // 播放符号动画
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
                for (let col = 0; col < 5; col++) {
                    for (let row = 0; row < 3; row++) {
                        const symbolId = lastWindows[col][row];
                        if (Math.floor(symbolId / 10) === 9) {
                            const symbolAni = SymbolAnimationController.Instance.playAnimationSymbol(col, row, symbolId);
                            symbolAni.getComponent(JackpotSymbolComponent_Zhuquefortune)?.setInfo(lastSymbolInfoWindow[col][row]);
                            SlotManager.Instance.reelMachine.reels[col].getComponent(Reel)?.hideSymbolInRow(row);
                        }
                    }
                }

                // 更新底部文本并播放音效
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "LOCK&ROLL TRIGGERED");
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                SlotSoundController.Instance().playAudio("JackpotTrigger", "FX");

                this.game_manager?.scheduleOnce(() => {
                    triggerState.setDone();
                }, 2);
            });

            // Lock&Roll弹窗展示状态
            const popupState = new State();
            popupState.addOnStartCallback(() => {
                this.game_manager?.game_components.lockNRollStartPopup.getComponent(JustPopup_Zhuquefortune)?.open(() => {
                    this.game_manager?.playMainBgm();
                    this.game_manager?.setKeyboardEventFlag(true);
                    popupState.setDone();
                });
            });

            // Lock&Roll UI初始化状态
            const uiInitState = new State();
            uiInitState.addOnStartCallback(() => {
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
                this.game_manager?.game_components.uiComponent.getComponent(UIComponent_Zhuquefortune)?.setLockNRoll();
                this.game_manager?.reelMachine.getComponent(ReelMachine_Zhuquefortune)?.showLockAndRollReels();
                this.game_manager?.game_components.setJackpotSymbolID();
                this.game_manager?.reelMachine.getComponent(ReelMachine_Zhuquefortune)?.updateJackpotSymbolOnReel();

                const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");
                const lastWindows = baseGameState.lastWindows;
                const lastSymbolInfoWindow = baseGameState.lastSymbolInfoWindow;

                this.game_manager.game_components.lockComponent.getComponent(LockComponent_Zhuquefortune)?.fixWindowNoneEffect(lastWindows, lastSymbolInfoWindow);
                this.game_manager.game_components.lockComponent.active = true;
                this.game_manager.game_components.remainCount.getComponent(RemainCountComponent_Zhuquefortune)?.showUI();

                this.game_manager?.scheduleOnce(() => {
                    uiInitState.setDone();
                }, 0.1);
            });

            // Lock&Roll启动特效状态
            const fxState = new State();
            fxState.addOnStartCallback(() => {
                this.game_manager?.game_components.uiComponent.getComponent(UIComponent_Zhuquefortune)?.getStartFXZhuque();
                this.game_manager?.scheduleOnce(() => {
                    fxState.setDone();
                }, 1);
            });

            // 组装状态
            rootState.insert(0, this.getStopSingleLineActionState());
            rootState.insert(0, this.getStopAllSymbolAniState());
            rootState.insert(1, delayState);
            rootState.insert(2, triggerState);
            rootState.insert(3, this.getForceScrollDownState());
            rootState.insert(4, popupState);
            rootState.insert(5, this.getStopAllSymbolAniState());
            rootState.insert(6, uiInitState);
            rootState.insert(7, fxState);
        } else {
            rootState.setDone();
        }

        return rootState;
    }

    /**
     * 单个单元格随机触发特效
     * @param cell 目标单元格
     * @param callback 触发完成后的回调
     */
    public singleRandomAppear(cell: Cell, callback: () => void): void {
        const oldSymbol = SlotGameResultManager.Instance.getHistoryWindow(0).GetWindow(cell.col).getSymbol(cell.row);
        const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[cell.col][cell.row];

        // 播放符号变更动画
        const changeSymbolAni = SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, 190);
        changeSymbolAni.getComponent(ChangeSymbolComponent_Zhuquefortune)?.setInfo(oldSymbol, symbolInfo);

        // 更新滚轮符号
        this.game_manager?.reelMachine.reels[cell.col].getComponent(Reel_Zhuquefortune)?.changeSymbol(cell.row, 90);
        this.game_manager?.reelMachine.reels[cell.col].getComponent(Reel)?.getSymbol(cell.row)?.getComponent(JackpotSymbolComponent_Zhuquefortune)?.setInfo(symbolInfo);
        this.game_manager?.reelMachine.reels[cell.col].getComponent(Reel_Zhuquefortune)?.hideSymbolInRowForAppear(cell.row);

        // 播放音效并执行回调
        this.game_manager?.scheduleOnce(() => {
            SlotSoundController.Instance().playAudio("RandomTrigger", "FX");
        }, 0.3);

        this.game_manager?.scheduleOnce(() => {
            if (TSUtility.isValid(callback)) {
                callback();
            }
        }, 0.5);
    }

    /**
     * 获取剩余次数减少状态（修复原JS拼写错误：decrese→decrease）
     */
    public getDecreaseTotalCount(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager?.game_components.remainCount.getComponent(RemainCountComponent_Zhuquefortune)?.decreaseCount();
            state.setDone();
        });
        return state;
    }

    /**
     * 获取剩余次数更新状态
     */
    public getUpdateTotalCount(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager?.game_components.remainCount.getComponent(RemainCountComponent_Zhuquefortune)?.updateCount(() => {
                state.setDone();
            });
        });
        return state;
    }

    /**
     * 获取Lock&Roll更新状态（修复原JS拼写错误：Lcok→Lock）
     */
    public getUpdateLockNRoll(): SequencialState {
        const rootState = new SequencialState();
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        let hasSpecialSymbol = false;

        // 检查是否有特殊符号（101-104）
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const symbolId = lastHistoryWindows.GetWindow(col).getSymbol(row);
                if ([101, 102, 103, 104].includes(symbolId)) {
                    hasSpecialSymbol = true;
                    break;
                }
            }
            if (hasSpecialSymbol) break;
        }

        if (hasSpecialSymbol) {
            const collectJackpotState = new State();
            collectJackpotState.addOnStartCallback(() => {
                this.game_manager?.game_components.lockComponent.getComponent(LockComponent_Zhuquefortune)?.CollectJackpot(() => {
                    collectJackpotState.setDone();
                });
            });
            rootState.insert(0, collectJackpotState);
        } else {
            rootState.setDone();
        }

        return rootState;
    }

    /**
     * 获取Lock&Roll结束检查状态
     */
    public getCheckLockNRollEndState(): SequencialState {
        const rootState = new SequencialState();
        rootState.addOnStartCallback(() => {
            if (SlotGameResultManager.Instance.getNextSubGameKey() === "base") {
                // 隐藏剩余次数UI并计算旋转结果
                const hideCountState = new State();
                hideCountState.addOnStartCallback(() => {
                    this.game_manager?.game_components.remainCount.getComponent(RemainCountComponent_Zhuquefortune)?.hideUI();
                    this.game_manager?.game_components.lockComponent.getComponent(LockComponent_Zhuquefortune)?.CalculateSpin(() => {
                        SlotManager.Instance.setMouseDragEventFlag(true);
                        hideCountState.setDone();
                    });
                });

                // 组装结束流程状态
                rootState.insert(0, hideCountState);
                rootState.insert(1, this.getShowLockNRollResultState());
                rootState.insert(2, this.getShowBigWinEffectEndLockNRollState());
                rootState.insert(3, this.getChangeUIToBaseState());
            }
        });
        return rootState;
    }

    /**
     * 获取Lock&Roll结果展示状态
     */
    public getShowLockNRollResultState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
            const totalWinningCoin = subGameState.totalWinningCoin;
            const betPerLines = subGameState.betPerLines;

            if (totalWinningCoin <= 0) {
                state.setDone();
            } else {
                this.game_manager?.game_components.lockNRollResultPopup.getComponent(LockNRollResultPopup_Zhuquefortune)?.open(
                    totalWinningCoin,
                    betPerLines,
                    () => state.setDone()
                );
            }
        });
        return state;
    }

    /**
     * 获取Lock&Roll结束时的大额胜利特效展示状态
     */
    public getShowBigWinEffectEndLockNRollState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
            const totalWinningCoin = subGameState.totalWinningCoin;
            const winType = SlotGameResultManager.Instance.getWinType(totalWinningCoin);

            if (winType !== SlotGameResultManager.WINSTATE_NORMAL) {
                const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base)?.effectBigWinNew;
                const totalBet = SlotGameRuleManager.Instance.getTotalBet();

                if (bigWinEffect) {
                    bigWinEffect._isPlayExplodeCoin = false;
                    bigWinEffect.playWinEffectWithoutIncreaseMoney(totalWinningCoin, totalBet, () => {
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
     * 获取切换到基础游戏UI的状态
     */
    public getChangeUIToBaseState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager.reelMachine.getComponent(ReelMachine_Zhuquefortune)?.showBaseReels();
            this.game_manager.game_components.uiComponent.getComponent(UIComponent_Zhuquefortune)?.setBase();
            this.game_manager.game_components.enteranceComponent.getComponent(EnteranceComponent_Zhuquefortune)?.setIdle();
            this.game_manager.game_components.lockComponent.getComponent(LockComponent_Zhuquefortune)?.clearFilledSymbols();
            this.game_manager.game_components.lockComponent.active = false;
            this.game_manager.game_components.setJackpotSymbolID();
            this.game_manager.playMainBgm();
            SlotManager.Instance.setMouseDragEventFlag(true);

            // 恢复基础游戏滚轮符号
            const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");
            for (let col = 0; col < 5; col++) {
                for (let row = 0; row < 3; row++) {
                    this.game_manager?.reelMachine.reels[col].getComponent(Reel)?.changeSymbol(
                        row,
                        baseGameState.lastWindows[col][row],
                        baseGameState.lastSymbolInfoWindow[col][row]
                    );
                }
            }

            state.setDone();
        });
        return state;
    }

    /**
     * 获取强制相机下滚状态
     */
    public getForceScrollDownState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            if (CameraControl.Instance.eStateOfCameraPosition === 1 || !CameraControl.Instance.isOriginalPos()) {
                const scrollDownAction = cc.sequence(
                    cc.callFunc(() => {
                        SlotManager.Instance.setMouseDragEventFlag(false);
                        CameraControl.Instance.scrollDownScreen(0.5);
                    }),
                    cc.delayTime(0.5),
                    cc.callFunc(() => {
                        state.setDone();
                    })
                );
                SlotManager.Instance.node.runAction(scrollDownAction);
            } else {
                state.setDone();
            }
        });
        return state;
    }

    // ===================== 私有辅助方法 =====================
    /**
     * 停止单条赔付线动画动作
     */
    public stopSingleLineAction(): void {
        if (this.actionSingleLine) {
            SlotManager.Instance.node.stopAction(this.actionSingleLine);
            this.actionSingleLine = null;
        }
    }

    /**
     * 检查是否包含符号ID=90的符号
     */
    private checkIfHasSymbol90(): boolean {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                if (lastHistoryWindows.GetWindow(col).getSymbol(row) === 90) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 检查窗口中是否包含符号ID=90的符号
     * @param windows 窗口数据
     */
    private checkIfHasSymbol90InWindows(windows: any[][]): boolean {
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                if (windows[col][row] === 90) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 根据奖池等级获取触发概率
     * @param potLevel 奖池等级
     */
    private getPotTriggerProbability(potLevel: number): number {
        switch (potLevel) {
            case 1:
                return 0.005;
            case 2:
                return 0.01;
            case 3:
                return 0.02;
            case 4:
                return 0.04;
            default:
                return 0;
        }
    }

    /**
     * 获取滚动到胜利结果前的相机下滚状态（原JS引用，保留空实现）
     */
    public getScrollDownBeforeWinResultState(): State {
        const state = new State();
        state.addOnStartCallback(() => state.setDone());
        return state;
    }

    /**
     * 获取展示所有触发赔付线的状态（原JS引用，保留空实现）
     */
    public getShowTotalTriggeredPaylineState(): State {
        const state = new State();
        state.addOnStartCallback(() => state.setDone());
        return state;
    }

    /**
     * 获取设置底部胜利金额增长信息的状态（原JS引用，保留空实现）
     */
    public getSetBottomInfoIncreaseWinMoneyState(): State {
        const state = new State();
        state.addOnStartCallback(() => state.setDone());
        return state;
    }

    /**
     * 获取胜利金额展示状态（原JS引用，保留空实现）
     */
    public getWinMoneyState(): State {
        const state = new State();
        state.addOnStartCallback(() => state.setDone());
        return state;
    }

    /**
     * 停止所有符号动画状态
     */
    public getStopAllSymbolAniState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            state.setDone();
        });
        return state;
    }
}