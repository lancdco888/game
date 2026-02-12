
import UserInfo from '../../User/UserInfo';
// 游戏专属组件（保留原拼写Jakcpot避免业务异常）
import JakpotSymbol_SuperSevenBlasts from './JakpotSymbol_SuperSevenBlasts';
import GameComponents_SuperSevenBlasts from './GameComponents_SuperSevenBlasts';
import SuperSevenBlastsManager from './SuperSevenBlastsManager';
import Reel_SuperSevenBlasts from './Reel_SuperSevenBlasts';
import SubGameStateManager_Base from '../../SubGameStateManager_Base';
import State, { SequencialState } from '../../Slot/State';
import SlotManager from '../../manager/SlotManager';
import { BottomTextType } from '../../SubGame/BottomUIText';
import SlotGameResultManager, { Cell } from '../../manager/SlotGameResultManager';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import CurrencyFormatHelper from '../../global_utility/CurrencyFormatHelper';
import SlotSoundController from '../../Slot/SlotSoundController';
import GameComponents_Base from '../../game/GameComponents_Base';
import TSUtility from '../../global_utility/TSUtility';
import Reel from '../../Slot/Reel';
import ServicePopupManager from '../../manager/ServicePopupManager';
import SoundManager from '../../manager/SoundManager';

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts 子游戏状态管理器（核心状态流转控制）
 * 负责基础游戏/重旋转/奖励游戏的状态切换、动画、音效、结算逻辑
 */
@ccclass()
export default class SubGameStateManager_SuperSevenBlasts extends SubGameStateManager_Base {
    // ========== 游戏管理器引用 ==========
    public game_manager: SuperSevenBlastsManager = null;
    // ========== 业务常量（原JS硬编码值） ==========
    public increaseMoneyMultiplierBeforePlaySpecialWin: number = 1;

    /**
     * 设置游戏管理器引用
     * @param manager 游戏管理器实例
     */
    public setManager(manager: SuperSevenBlastsManager): void {
        this.game_manager = manager;
    }

    /**
     * 获取基础游戏状态流程
     * @returns 有序状态序列
     */
    public getBaseGameState(): SequencialState {
        const rootState = new SequencialState();
        let step = 0;
        const preSpinState = new SequencialState();

        // 预旋转状态序列
        preSpinState.insert(step++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        preSpinState.insert(step++, this.getStopSingleLineActionState());
        preSpinState.insert(step++, this.getStopAllSymbolAniState());
        preSpinState.insert(step++, this.hideCountJackpotUI());
        preSpinState.insert(step++, this.getNormalFrameState());
        preSpinState.insert(step++, this.setClearDimmedState());
        preSpinState.insert(step++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
        preSpinState.insert(step++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(0));
        preSpinState.insert(step++, this.showSpinFxState());
        preSpinState.insert(step++, SlotManager.Instance.getReelSpinStartState());
        rootState.insert(0, preSpinState);

        // 旋转后状态序列（带启动回调）
        const postSpinState = new SequencialState();
        postSpinState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest === 1) {
                postSpinState.insert(step++, this.setNextEffectState());
                const visibleWindows = SlotGameResultManager.Instance.getVisibleSlotWindows();
                postSpinState.insert(step++, this.getExpectFrameState());
                postSpinState.insert(step++, SlotManager.Instance.reelMachine.getNormalSpinReelStateRenewal(visibleWindows));
                postSpinState.insert(step++, this.hideSpinFxState());
                postSpinState.insert(step++, this.getNormalFrameState());
                postSpinState.insert(step++, this.getMoveJackpotDelayState());
                postSpinState.insert(step++, this.getCountJackpotState());
                postSpinState.insert(step++, this.getShowJackpotResultState());
                postSpinState.insert(step++, this.getShowTotalTriggeredPaylineState());

                // 支付线特效子序列
                const paylineEffectState = new SequencialState();
                paylineEffectState.insert(0, this.getStateShowTotalSymbolEffectOnPayLines());
                paylineEffectState.insert(1, this.getSingleLineEffectOnPaylineState());
                postSpinState.insert(step, paylineEffectState);
                postSpinState.insert(step, this.getSetBottomInfoIncreaseWinMoneyState());
                postSpinState.insert(step++, this.getWinMoneyState());
                postSpinState.insert(step++, this.getBigWinEffectState());
                postSpinState.insert(step++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
                postSpinState.insert(step++, this.getBonusGameStartState());
                postSpinState.insert(step++, this.getRespinStartState());
            }
        });
        rootState.insert(1, postSpinState);

        return rootState;
    }

    /**
     * 获取重旋转游戏状态流程
     * @returns 有序状态序列
     */
    public getRespinGameState(): SequencialState {
        const rootState = new SequencialState();
        let step = 0;
        const preRespinState = new SequencialState();

        // 预重旋转状态序列
        preRespinState.insert(step++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        preRespinState.insert(step++, this.getStopSingleLineActionState());
        preRespinState.insert(step++, this.getStopAllSymbolAniRespinState());
        preRespinState.insert(step++, this.setLockedSymbolIndexState());
        preRespinState.insert(step++, this.getClearMoveState());
        preRespinState.insert(step++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(0));
        preRespinState.insert(step++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.CustomData, "GOOD LUCK!"));
        preRespinState.insert(step++, this.decreaseRemainLockAndRollSpins());
        preRespinState.insert(step++, this.getSetRespinTextAtStartSpin());
        preRespinState.insert(step++, this.setDimmedState());
        preRespinState.insert(step++, this.showSpinFxState());
        preRespinState.insert(step++, this.game_manager.getReelRespinSpinStartState());
        rootState.insert(0, preRespinState);

        // 重旋转后状态序列（带启动回调）
        const postRespinState = new SequencialState();
        postRespinState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest === 1) {
                const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
                postRespinState.insert(step++, SlotManager.Instance.reelMachine.getNormalSpinReelStateRenewal(lastHistoryWindows));
                postRespinState.insert(step++, this.hideSpinFxState());
                postRespinState.insert(step++, this.getRespinFrameState());
                postRespinState.insert(step++, this.getBonusAddSymbolState());
                postRespinState.insert(step, this.getSetBottomInfoIncreaseWinMoneyState());
                postRespinState.insert(step++, this.updateRespinCountState());
                postRespinState.insert(step++, this.getCheckRespinEndState());
                postRespinState.insert(step++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
            }
        });
        rootState.insert(1, postRespinState);

        return rootState;
    }

    /**
     * 获取总符号特效播放状态
     * @returns 单个状态实例
     */
    public getStateShowTotalSymbolEffectOnPayLines(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
            // 计算特效时长（大额奖励翻倍）
            const effectDuration = totalWin > 3 * totalBet 
                ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2
                : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

            if (this.showTotalSymbolEffectOnPaylines()) {
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
     * 获取单支付线特效播放状态
     * @returns 单个状态实例
     */
    public getSingleLineEffectOnPaylineState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            const winningCells: Cell[] = [];

            // 无奖励或自动旋转/重旋转模式下直接完成
            if (SlotGameResultManager.Instance.getWinType() === SlotGameResultManager.WINSTATE_NORMAL) {
                if (!payOutResults || payOutResults.length === 0) {
                    state.setDone();
                    return;
                }
                if (SlotReelSpinStateManager.Instance.getAutospinMode() || SlotReelSpinStateManager.Instance.getRespinMode()) {
                    state.setDone();
                    return;
                }
            }

            // 统计奖励线数量（含Jackpot）
            let totalLines = 0;
            if (payOutResults) {
                totalLines = payOutResults.length;
            }
            if (SlotGameResultManager.Instance.getSpinResult().jackpotResults.length > 0) {
                totalLines++;
            }

            if (totalLines !== 0) {
                let currentLineIndex = 0;
                // 单支付线特效回调
                const lineEffectCallback = cc.callFunc(() => {
                    // 清理旧特效
                    SlotManager.Instance.paylineRenderer?.clearAll();
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();

                    if (currentLineIndex < (payOutResults?.length || 0)) {
                        const payLine = payOutResults![currentLineIndex].payLine;
                        // 绘制支付线
                        if (SlotManager.Instance.paylineRenderer && payLine !== -1) {
                            SlotManager.Instance.paylineRenderer.drawSingleLine(payLine, payOutResults![currentLineIndex].payOut.count);
                        }

                        // 收集获胜单元格
                        winningCells.length = 0;
                        payOutResults![currentLineIndex].winningCell.forEach(cell => {
                            winningCells.push(new Cell(cell[1], cell[0]));
                        });

                        // 播放符号动画
                        winningCells.forEach(cell => {
                            const symbol = lastHistoryWindows.GetWindow(cell.col).getSymbol(cell.row);
                            SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbol);
                            SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel)?.hideSymbolInRow(cell.row);
                        });

                        var lineNumber = 0;
                        var winningCoin = 0;
                        // 多线奖励时显示单行信息
                        if (totalLines > 1) {
                            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
                            lineNumber = payLine + 1;
                            winningCoin = payOutResults![currentLineIndex].winningCoin;
                            const lineText = `LINE ${lineNumber.toString()} PAYS ${CurrencyFormatHelper.formatNumber(winningCoin)}`;
                            SlotManager.Instance.bottomUIText.setWinMoney(totalWin, lineText);
                        }

                        this.showSinglePaylineInfoForLines(lineNumber, winningCoin, payOutResults![currentLineIndex].payOut.symbols);
                    } else {
                        // 处理Jackpot符号动画
                        const visibleWindows = SlotGameResultManager.Instance.getVisibleSlotWindows();
                        for (let col = 0; col < 5; col++) {
                            for (let row = 0; row < 3; row++) {
                                const symbol = visibleWindows.GetWindow(col).getSymbol(row);
                                if (symbol > 90) {
                                    SymbolAnimationController.Instance.playAnimationSymbol(col, row, symbol);
                                    SlotManager.Instance.reelMachine.reels[col].getComponent(Reel)?.hideSymbolInRow(row);
                                }
                            }
                        }

                        // 显示Jackpot奖励信息
                        const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
                        const jackpotCoin = SlotGameResultManager.Instance.getSpinResult().jackpotResults[0].winningCoin;
                        const jackpotText = `Jackpot ${CurrencyFormatHelper.formatNumber(jackpotCoin)}`;
                        SlotManager.Instance.bottomUIText.setWinMoney(totalWin, jackpotText);
                        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, jackpotText);
                    }

                    // 播放音效并更新索引
                    SlotSoundController.Instance().playAudio("ShowPayline", "FX");
                    currentLineIndex = (currentLineIndex + 1) % totalLines;
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
                });

                // 停止旧动画并播放新循环动画
                this.stopSingleLineAction();
                this.actionSingleLine = cc.repeatForever(
                    cc.sequence(lineEffectCallback, cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect))
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
     * 获取奖金展示状态（含大额奖励特效）
     * @returns 单个状态实例
     */
    public getWinMoneyState(): State {
        const state = new State();
        // 结束回调：播放奖金结算结束音效
        state.addOnEndCallback(() => {
            this.playIncrementEndCoinSound();
        });

        state.addOnStartCallback(() => {
            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
            let jackpotWin = 0;
            const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;

            // 计算Jackpot奖金
            if (jackpotResults) {
                jackpotResults.forEach(result => {
                    jackpotWin += result.winningCoin;
                });
            }
            const normalWin = totalWin - jackpotWin;

            // 奖金展示完成回调
            const winShowComplete = () => {
                SlotManager.Instance.bottomUIText.showWinEffect(false);
                SlotManager.Instance.setMouseDragEventFlag(true);
                SlotManager.Instance.applyGameResultMoney(normalWin);
                
                if (normalWin <= 0) {
                    state.setDone();
                } else {
                    SlotManager.Instance.scheduleOnce(() => {
                        state.setDone();
                    }, 0.5);
                }
            };

            // 无需展示奖金特效时直接完成
            if (this.isShowWinMoneyEffect() === 0) {
                winShowComplete();
                return;
            }

            // 展示奖金特效
            SlotManager.Instance.bottomUIText.showWinEffect(true);
            const winType = SlotGameResultManager.Instance.getWinType(normalWin);
            const totalBet = SlotGameRuleManager.Instance.getTotalBet();

            if (normalWin <= 0) {
                winShowComplete();
                return;
            }

            // 计算特效时长
            const effectDuration = jackpotWin === 0 && totalWin > 3 * totalBet
                ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2
                : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

            // 非Jackpot大额奖励特殊处理
            if (jackpotWin === 0 && winType !== SlotGameResultManager.WINSTATE_NORMAL) {
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base)?.effectBigWinNew;
                const effectPreDuration = SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

                // 预增奖金动画
                const preIncreaseAction = cc.callFunc(() => {
                    SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(
                        0,
                        0 + totalBet * this.increaseMoneyMultiplierBeforePlaySpecialWin,
                        null,
                        false,
                        effectPreDuration
                    );
                    SlotManager.Instance.setMouseDragEventFlag(false);
                });

                // 大额奖励特效
                const bigWinAction = cc.callFunc(() => {
                    if (!bigWinEffect) {
                        winShowComplete();
                        return;
                    }

                    const effectTime = bigWinEffect.playWinEffect(
                        totalWin,
                        totalBet,
                        winShowComplete,
                        () => {
                            SlotManager.Instance.bottomUIText.stopChangeWinMoney(totalWin);
                            this.playIncrementEndCoinSound();
                        }
                    );

                    SlotManager.Instance.bottomUIText.playChangeWinMoney(
                        0 + totalBet * this.increaseMoneyMultiplierBeforePlaySpecialWin,
                        totalWin,
                        () => {
                            this.playIncrementEndCoinSound();
                        },
                        false,
                        effectTime
                    );
                });

                // 执行奖励动画序列
                SlotManager.Instance.node.runAction(cc.sequence(preIncreaseAction, cc.delayTime(effectPreDuration), bigWinAction));
            } else {
                // 普通奖金展示
                SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                SlotManager.Instance.bottomUIText.playChangeWinMoney(0, totalWin, winShowComplete, true, effectDuration);
                UserInfo.instance().setBiggestWinCoin(totalWin);
            }
        });
        return state;
    }

    /**
     * 获取大额奖励特效状态
     * @returns 单个状态实例
     */
    public getBigWinEffectState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
            let jackpotWin = 0;
            const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;

            // 计算Jackpot奖金
            if (jackpotResults) {
                jackpotResults.forEach(result => {
                    jackpotWin += result.winningCoin;
                });
            }

            const winType = SlotGameResultManager.Instance.getWinType(totalWin);
            // Jackpot混合奖励且非普通奖励时播放大额特效
            if (jackpotWin > 0 && jackpotWin < totalWin && winType !==SlotGameResultManager.WINSTATE_NORMAL) {
                const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base)?.effectBigWinNew;
                const totalBet = SlotGameRuleManager.Instance.getTotalBet();

                if (bigWinEffect) {
                    bigWinEffect._isPlayExplodeCoin = false;
                    bigWinEffect.playWinEffectWithoutIncreaseMoney(
                        totalWin,
                        totalBet,
                        () => {
                            this.game_manager!.setKeyboardEventFlag(true);
                            state.setDone();
                        }
                    );
                } else {
                    state.setDone();
                }
            } else {
                state.setDone();
            }
        });
        return state;
    }

    // ===================== 基础状态方法（核心逻辑保留） =====================
    /**
     * 设置下一个特效状态
     * @returns 单个状态实例
     */
    public setNextEffectState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager!.setNextEffect();
            state.setDone();
        });
        return state;
    }

    /**
     * 获取期望框架状态（基础游戏）
     * @returns 单个状态实例
     */
    public getExpectFrameState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            if (this.game_manager!.getNextEffect()) {
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE);
                this.game_manager!.game_components.reelBGComponent.setBaseExpect();
            }
            state.setDone();
        });
        return state;
    }

    /**
     * 获取普通框架状态（基础游戏）
     * @returns 单个状态实例
     */
    public getNormalFrameState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager!.game_components.reelBGComponent.setBaseNormal();
            state.setDone();
        });
        return state;
    }

    /**
     * 隐藏Jackpot计数UI
     * @returns 单个状态实例
     */
    public hideCountJackpotUI(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager!.game_components.jackpotMoneyDisplay.hideCount();
            state.setDone();
        });
        return state;
    }

    /**
     * 获取Jackpot移动延迟状态
     * @returns 单个状态实例
     */
    public getMoveJackpotDelayState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
            const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;
            const hasJackpot = jackpotResults && jackpotResults.length > 0;
            const needDelay = nextSubGameKey !== "base" || hasJackpot;

            if (needDelay) {
                this.game_manager!.scheduleOnce(() => {
                    state.setDone();
                }, 1);
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 获取Jackpot计数状态
     * @returns 单个状态实例
     */
    public getCountJackpotState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;

            if (jackpotResults && jackpotResults.length > 0) {
                this.game_manager!.scheduleOnce(() => {
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
                    const jackpotCells: Cell[] = [];

                    // 收集Jackpot符号单元格
                    for (let col = 0; col < 5; col++) {
                        for (let row = 0; row < 3; row++) {
                            const symbol = lastHistoryWindows.GetWindow(col).getSymbol(row);
                            if ((symbol > 90 && symbol < 94) || (symbol > 93 && symbol < 100)) {
                                jackpotCells.push(new Cell(col, row));
                            }
                        }
                    }

                    let totalCount = 0;
                    let currentCount = 0;
                    let isFirst = true;
                    // 计算总计数
                    jackpotCells.forEach(cell => {
                        const symbol = lastHistoryWindows.GetWindow(cell.col).getSymbol(cell.row);
                        if (symbol > 90 && symbol < 94) {
                            totalCount += symbol - 90;
                        } else if (symbol > 93 && symbol < 100) {
                            totalCount += symbol - 93;
                        }
                    });
                    const countInterval = 0.5 / (totalCount - currentCount);

                    // 计数完成回调
                    const countComplete = () => {
                        if (++currentCount < jackpotCells.length) {
                            const cell = jackpotCells[currentCount];
                            const symbol = lastHistoryWindows.GetWindow(cell.col).getSymbol(cell.row);
                            
                            // 更新计数
                            if (symbol > 90 && symbol < 94) {
                                totalCount += symbol - 90;
                            } else if (symbol > 93 && symbol < 100) {
                                totalCount += symbol - 93;
                            }
                            
                            const interval = 0.5 / (totalCount - currentCount);
                            this.game_manager!.game_components.countUI.appearCount(currentCount, isFirst?1:0, interval, countRepeat);
                            
                            // 播放计数音效
                            const soundDelay = isFirst ? 0.35 : 0.24;
                            SlotManager.Instance.scheduleOnce(() => {
                                SlotSoundController.Instance().playAudio("LowCount", "FX");
                            }, soundDelay);
                            
                            // 单步计数
                            this.singleCountJackpot(cell.col, cell.row, symbol, countComplete);
                        } else {
                            this.game_manager!.game_components.countUI.hideUI();
                            state.setDone();
                        }
                    };

                    // 计数重复回调
                    const countRepeat = () => {
                        if (currentCount < totalCount) {
                            currentCount++;
                            this.game_manager!.game_components.countUI.appearCount(currentCount, isFirst?1:0, countInterval, countRepeat);
                            const soundDelay = isFirst ? 0.35 : 0.24;
                            SlotManager.Instance.scheduleOnce(() => {
                                SlotSoundController.Instance().playAudio("LowCount", "FX");
                            }, soundDelay);
                        }
                    };

                    // 初始化第一个计数
                    const firstCell = jackpotCells[0];
                    const firstSymbol = lastHistoryWindows.GetWindow(firstCell.col).getSymbol(firstCell.row);
                    if (firstSymbol > 90 && firstSymbol < 94) {
                        totalCount += firstSymbol - 90;
                    } else if (firstSymbol > 93 && firstSymbol < 100) {
                        totalCount += firstSymbol - 93;
                    }
                    
                    const initialInterval = 0.5 / (totalCount - currentCount);
                    currentCount++;
                    this.game_manager!.game_components.countUI.appearCount(currentCount, isFirst?1:0, initialInterval, countRepeat);
                    const initialSoundDelay = isFirst ? 0.35 : 0.24;
                    
                    SlotManager.Instance.scheduleOnce(() => {
                        SlotSoundController.Instance().playAudio("LowCount", "FX");
                    }, initialSoundDelay);
                    
                    isFirst = false;
                    this.singleCountJackpot(firstCell.col, firstCell.row, firstSymbol, countComplete);
                }, 1);
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 单步Jackpot计数
     * @param col 列索引
     * @param row 行索引
     * @param symbol 符号值
     * @param callback 完成回调
     */
    public singleCountJackpot(col: number, row: number, symbol: number, callback: () => void): void {
        const symbolAni = SymbolAnimationController.Instance.playAnimationSymbol(col, row, 392);
        symbolAni.getComponent(JakpotSymbol_SuperSevenBlasts)?.showSymbol(symbol);
        SlotManager.Instance.reelMachine.reels[col].getComponent(Reel)?.hideSymbolInRow(row);
        
        this.game_manager!.scheduleOnce(() => {
            if (TSUtility.isValid(callback)) {
                callback();
            }
        }, 0.5);
    }

    /**
     * 获取Jackpot结果展示状态
     * @returns 单个状态实例
     */
    public getShowJackpotResultState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;

            if (jackpotResults && jackpotResults.length > 0) {
                const visibleWindows = SlotGameResultManager.Instance.getVisibleSlotWindows();
                
                // 步骤1：播放Jackpot符号动画
                const playSymbolAni = cc.callFunc(() => {
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    for (let col = 0; col < 5; col++) {
                        for (let row = 0; row < 3; row++) {
                            const symbol = visibleWindows.GetWindow(col).getSymbol(row);
                            if (symbol > 90) {
                                SymbolAnimationController.Instance.playAnimationSymbol(col, row, symbol);
                                SlotManager.Instance.reelMachine.reels[col].getComponent(Reel)?.hideSymbolInRow(row);
                            }
                        }
                    }
                    SlotSoundController.Instance().playAudio("JackpotWin", "FX");
                });

                // 步骤2：播放奖金增长动画
                const playWinIncrease = cc.callFunc(() => {
                    let totalJackpotWin = 0;
                    jackpotResults.forEach(result => {
                        totalJackpotWin += result.winningCoin;
                    });
                    
                    SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "JACKPOT TRIGGERED");
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(0, totalJackpotWin, null, false, 1.5);
                });

                // 步骤3：展示Jackpot结果弹窗
                const showJackpotPopup = cc.callFunc(() => {
                    SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");
                    let totalJackpotWin = 0;
                    jackpotResults.forEach(result => {
                        totalJackpotWin += result.winningCoin;
                    });

                    // 累加普通奖励
                    const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
                    if (payOutResults && payOutResults.length > 0) {
                        const jackpotOnlyLines: number[] = [];
                        payOutResults.forEach((result, index) => {
                            let isJackpotOnly = true;
                            result.winningSymbol.forEach(symbol => {
                                if (symbol !== 100) {
                                    isJackpotOnly = false;
                                }
                            });
                            if (isJackpotOnly) {
                                jackpotOnlyLines.push(index);
                            }
                        });
                        jackpotOnlyLines.forEach(index => {
                            totalJackpotWin += payOutResults![index].winningCoin;
                        });
                    }

                    // 统计Jackpot符号数量
                    let symbolCount = 0;
                    for (let col = 0; col < 5; col++) {
                        for (let row = 0; row < 3; row++) {
                            const symbol = visibleWindows.GetWindow(col).getSymbol(row);
                            if (symbol > 90 && symbol < 94) {
                                symbolCount += symbol - 90;
                            } else if (symbol > 93 && symbol < 100) {
                                symbolCount += symbol - 93;
                            }
                        }
                    }

                    // 展示Jackpot结果弹窗
                    this.game_manager!.game_components.jackpotMoneyDisplay.setPlayingState(jackpotResults[0].jackpotSubKey, false);
                    this.game_manager!.game_components.jackpotMoneyDisplay.setShowingMoney(jackpotResults[0].jackpotSubKey, totalJackpotWin);
                    this.game_manager!.game_components.countUI.hideUI();
                    
                    SlotManager.Instance.getComponent(GameComponents_SuperSevenBlasts)?.openJackpotResultPopup(
                        totalJackpotWin,
                        symbolCount,
                        () => {
                            SymbolAnimationController.Instance.stopAllAnimationSymbol();
                            SlotManager.Instance.bottomUIText.setWinMoney(totalJackpotWin);
                            const winType = SlotGameResultManager.Instance.getWinType(totalJackpotWin);

                            // 大额Jackpot奖励特效
                            if (totalJackpotWin === SlotGameResultManager.Instance.getTotalWinMoney() && winType !==SlotGameResultManager.WINSTATE_NORMAL) {
                                const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base)?.effectBigWinNew;
                                const totalBet = SlotGameRuleManager.Instance.getTotalBet();
                                
                                if (bigWinEffect) {
                                    bigWinEffect._isPlayExplodeCoin = false;
                                    bigWinEffect.playWinEffectWithoutIncreaseMoney(
                                        totalJackpotWin,
                                        totalBet,
                                        () => {
                                            this.game_manager!.setKeyboardEventFlag(true);
                                            ServicePopupManager.instance().reserveNewRecordPopup(totalJackpotWin);
                                            this.game_manager!.game_components.jackpotMoneyDisplay.hideCount();
                                            this.game_manager!.game_components.jackpotMoneyDisplay.setPlayingState(jackpotResults[0].jackpotSubKey, true);
                                            state.setDone();
                                        }
                                    );
                                } else {
                                    state.setDone();
                                }
                            } else {
                                this.game_manager!.game_components.jackpotMoneyDisplay.setPlayingState(jackpotResults[0].jackpotSubKey, true);
                                this.game_manager!.game_components.jackpotMoneyDisplay.hideCount();
                                state.setDone();
                            }
                        }
                    );
                });

                // 执行Jackpot结果展示序列
                SlotManager.Instance.node.runAction(
                    cc.sequence(
                        cc.delayTime(1),
                        playSymbolAni,
                        cc.delayTime(1),
                        playWinIncrease,
                        cc.delayTime(1.6),
                        showJackpotPopup
                    )
                );
            } else {
                state.setDone();
            }
        });
        return state;
    }

    // ===================== 重旋转相关状态方法 =====================
    /**
     * 获取重旋转符号动画停止状态
     * @returns 单个状态实例
     */
    public getStopAllSymbolAniRespinState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.checkPaylineRenderer();
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            SlotManager.Instance.paylineRenderer?.clearAll();
            state.setDone();
        });
        return state;
    }

    /**
     * 设置锁定符号索引状态
     * @returns 单个状态实例
     */
    public setLockedSymbolIndexState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager!.game_components.moveBonusComponent.setLockedSymbols();
            state.setDone();
        });
        return state;
    }

    /**
     * 获取重旋转启动状态
     * @returns 有序状态序列
     */
    public getRespinStartState(): SequencialState {
        const state = new SequencialState();
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();

        if (nextSubGameKey === "respin") {
            // 步骤1：初始化重旋转状态
            const initState = new State();
            initState.addOnStartCallback(() => {
                SlotGameResultManager.Instance.winMoneyInLinkedJackpotMode = 0;
                // 禁用下注按钮
                SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(false);
                SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(false);
                this.game_manager!.setKeyboardEventFlag(false);
                this.game_manager!.game_components.lockComponent.clearFilledSymbols();
                this.stopSingleLineAction();
                SlotManager.Instance.paylineRenderer?.clearAll();
                SymbolAnimationController.Instance.stopAllAnimationSymbol();
                SlotManager.Instance.reelMachine.showAllSymbol();
                
                // 更新UI
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "RESPIN ACTIVATED");
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                SoundManager.Instance().setMainVolumeTemporarily(0);

                // 播放锁定符号动画
                const visibleWindows = SlotGameResultManager.Instance.getVisibleSlotWindows();
                for (let col = 0; col < 5; col++) {
                    for (let row = 0; row < 3; row++) {
                        let symbol = visibleWindows.GetWindow(col).getSymbol(row);
                        if (symbol > 90 && symbol < 94) {
                            // 修正符号值
                            if (symbol > 100 && symbol < 106) {
                                symbol -= 10;
                            }
                            SymbolAnimationController.Instance.playAnimationSymbolAbsoluteCoordinate(col, row, symbol);
                            SlotManager.Instance.reelMachine.reels[col].getComponent(Reel)?.hideSymbolInRow(row);
                        } else if (symbol > 93 && symbol < 100) {
                            // 展示准备符号
                            const symbolAni = SymbolAnimationController.Instance.playAnimationSymbolAbsoluteCoordinate(col, row, 398);
                            symbolAni.getComponent(JakpotSymbol_SuperSevenBlasts)?.showReadySymbol(symbol);
                            // 替换符号
                            const newSymbol = symbol - 3;
                            SlotManager.Instance.reelMachine.reels[col].getComponent(Reel)?.changeSymbol(row, newSymbol, null);
                            SlotManager.Instance.reelMachine.reels[col].getComponent(Reel)?.hideSymbolInRow(row);
                        }
                    }
                }

                // 播放重旋转音效
                SlotSoundController.Instance().playAudio("RespinHit", "FX");
                this.game_manager!.scheduleOnce(() => {
                    initState.setDone();
                }, 2);
            });

            // 步骤2：打开重旋转启动弹窗
            const popupState = new State();
            popupState.addOnStartCallback(() => {
                this.game_manager!.game_components.respinStartPopup.open(() => {
                    SlotManager.Instance.playMainBgm();
                    this.game_manager!.game_components.remainCountUI.showUI();
                    this.game_manager!.playMainBgm();
                    popupState.setDone();
                });
            });

            // 步骤3：恢复音量并设置重旋转背景
            const finalState = new State();
            finalState.addOnStartCallback(() => {
                SoundManager.Instance().resetTemporarilyMainVolume();
                const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");
                this.game_manager!.game_components.reelBGComponent.setRespinNormal();
                this.game_manager!.game_components.lockComponent.startRespin(baseGameState.lastWindows);

                // 设置重旋转符号暗化
                for (let col = 0; col < 5; col++) {
                    for (let row = 0; row < 3; row++) {
                        SlotManager.Instance.reelMachine.reels[col].getComponent(Reel_SuperSevenBlasts)?.setRespinSymbolsDimmActive(true);
                    }
                }
                finalState.setDone();
            });

            // 组装状态序列
            state.insert(1, initState);
            state.insert(2, popupState);
            state.insert(3, finalState);
        } else {
            state.setDone();
        }

        return state;
    }

    /**
     * 获取重旋转启动时文本设置状态
     * @returns 单个状态实例
     */
    public getSetRespinTextAtStartSpin(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            SlotManager.Instance.bottomUIText.setWinText("GOOD LUCK");
            state.setDone();
        });
        return state;
    }

    /**
     * 设置暗化状态
     * @returns 单个状态实例
     */
    public setDimmedState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager!.game_components.setDimmedAct(true);
            state.setDone();
        });
        return state;
    }

    /**
     * 清除暗化状态
     * @returns 单个状态实例
     */
    public setClearDimmedState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager!.game_components.setDimmedAct(false);
            state.setDone();
        });
        return state;
    }

    /**
     * 减少剩余重旋转次数
     * @returns 单个状态实例
     */
    public decreaseRemainLockAndRollSpins(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager!.game_components.remainCountUI.decreseCount();
            state.setDone();
        });
        return state;
    }

    /**
     * 获取锁定符号状态
     * @returns 单个状态实例
     */
    public getLockSymbols(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager!.game_components.lockComponent.addLockSymbols(() => {
                state.setDone();
            });
        });
        return state;
    }

    /**
     * 更新重旋转计数状态
     * @returns 单个状态实例
     */
    public updateRespinCountState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager!.game_components.remainCountUI.updateCount(() => {
                state.setDone();
            });
        });
        return state;
    }

    /**
     * 检查重旋转结束状态
     * @returns 有序状态序列
     */
    public getCheckRespinEndState(): SequencialState {
        const state = new SequencialState();
        state.addOnStartCallback(() => {
            const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
            if (nextSubGameKey === "base") {
                state.insert(0, this.getShowRespinResultState());
                state.insert(1, this.getShowJackpotRespinResultState());
                state.insert(3, this.getChangeUIToNormalState());
                state.insert(4, this.getStopAllSymbolAniState());
            }
        });
        return state;
    }

    /**
     * 获取重旋转结果展示状态
     * @returns 单个状态实例
     */
    public getShowRespinResultState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
            if (totalWin <= 0) {
                state.setDone();
                return;
            }

            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            SlotManager.Instance.paylineRenderer?.clearAll();
            this.game_manager!.game_components.lockComponent.CalculateRespin(() => {
                state.setDone();
            });
        });
        return state;
    }

    /**
     * 获取重旋转Jackpot结果展示状态
     * @returns 单个状态实例
     */
    public getShowJackpotRespinResultState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;

            if (jackpotResults && jackpotResults.length > 0) {
                const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
                
                // 步骤1：播放Jackpot符号动画
                const playSymbolAni = cc.callFunc(() => {
                    // 显示所有滚轮
                    SlotManager.Instance.reelMachine.reels.forEach(reel => {
                        reel.node.active = true;
                    });
                    this.game_manager!.game_components.lockComponent.clearFilledSymbols();
                    
                    // 播放符号动画
                    for (let col = 0; col < 5; col++) {
                        for (let row = 0; row < 3; row++) {
                            let symbol = lastHistoryWindows.GetWindow(col).getSymbol(row);
                            if (symbol > 100) {
                                symbol -= 10;
                            }
                            if (symbol > 90) {
                                SymbolAnimationController.Instance.playAnimationSymbol(col, row, symbol);
                            }
                        }
                    }
                    SlotSoundController.Instance().playAudio("JackpotWin", "FX");
                });

                // 步骤2：播放奖金增长动画
                const playWinIncrease = cc.callFunc(() => {
                    let totalJackpotWin = 0;
                    jackpotResults.forEach(result => {
                        totalJackpotWin += result.winningCoin;
                    });
                    
                    SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "JACKPOT TRIGGERED");
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(0, totalJackpotWin, null, false, 1.5);
                });

                // 步骤3：展示Jackpot结果弹窗
                const showJackpotPopup = cc.callFunc(() => {
                    SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");
                    let totalJackpotWin = 0;
                    jackpotResults.forEach(result => {
                        totalJackpotWin += result.winningCoin;
                    });

                    // 累加普通奖励
                    const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
                    if (payOutResults && payOutResults.length > 0) {
                        const jackpotOnlyLines: number[] = [];
                        payOutResults.forEach((result, index) => {
                            let isJackpotOnly = true;
                            result.winningSymbol.forEach(symbol => {
                                if (symbol !== 100) {
                                    isJackpotOnly = false;
                                }
                            });
                            if (isJackpotOnly) {
                                jackpotOnlyLines.push(index);
                            }
                        });
                        jackpotOnlyLines.forEach(index => {
                            totalJackpotWin += payOutResults![index].winningCoin;
                        });
                    }

                    // 统计Jackpot符号数量
                    let symbolCount = 0;
                    for (let col = 0; col < 5; col++) {
                        for (let row = 0; row < 3; row++) {
                            let symbol = lastHistoryWindows.GetWindow(col).getSymbol(row);
                            if (symbol > 100) {
                                symbol -= 10;
                            }
                            if (symbol > 90) {
                                symbolCount += symbol - 90;
                            }
                        }
                    }

                    // 展示Jackpot结果弹窗
                    this.game_manager!.game_components.countUI.hideUI();
                    this.game_manager!.game_components.jackpotMoneyDisplay.setPlayingState(jackpotResults[0].jackpotSubKey, false);
                    this.game_manager!.game_components.jackpotMoneyDisplay.setShowingMoney(jackpotResults[0].jackpotSubKey, totalJackpotWin);
                    
                    SlotManager.Instance.getComponent(GameComponents_SuperSevenBlasts)?.openJackpotResultPopup(
                        totalJackpotWin,
                        symbolCount,
                        () => {
                            SymbolAnimationController.Instance.stopAllAnimationSymbol();
                            this.game_manager!.setBaseMode();
                            SlotManager.Instance.bottomUIText.setWinMoney(totalJackpotWin);
                            const winType = SlotGameResultManager.Instance.getWinType(totalJackpotWin);

                            // 大额Jackpot奖励特效
                            if (winType !==SlotGameResultManager.WINSTATE_NORMAL) {
                                const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base)?.effectBigWinNew;
                                const totalBet = SlotGameRuleManager.Instance.getTotalBet();
                                
                                if (bigWinEffect) {
                                    bigWinEffect._isPlayExplodeCoin = false;
                                    bigWinEffect.playWinEffectWithoutIncreaseMoney(
                                        totalJackpotWin,
                                        totalBet,
                                        () => {
                                            this.game_manager!.setKeyboardEventFlag(true);
                                            this.game_manager!.game_components.jackpotMoneyDisplay.setPlayingState(jackpotResults[0].jackpotSubKey, true);
                                            ServicePopupManager.instance().reserveNewRecordPopup(totalJackpotWin);
                                            this.game_manager!.game_components.jackpotMoneyDisplay.hideCount();
                                            state.setDone();
                                        }
                                    );
                                } else {
                                    state.setDone();
                                }
                            } else {
                                this.game_manager!.game_components.jackpotMoneyDisplay.setPlayingState(jackpotResults[0].jackpotSubKey, true);
                                this.game_manager!.game_components.jackpotMoneyDisplay.hideCount();
                                state.setDone();
                            }
                        }
                    );
                });

                // 执行Jackpot结果展示序列
                SlotManager.Instance.node.runAction(
                    cc.sequence(
                        cc.delayTime(1),
                        playSymbolAni,
                        cc.delayTime(1),
                        playWinIncrease,
                        cc.delayTime(1.6),
                        showJackpotPopup
                    )
                );
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 恢复UI到普通状态
     * @returns 单个状态实例
     */
    public getChangeUIToNormalState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager!.setBaseMode();
            this.game_manager!.playMainBgm();
            state.setDone();
        });
        return state;
    }

    /**
     * 获取奖励符号添加状态
     * @returns 单个状态实例
     */
    public getBonusAddSymbolState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const lockedSymbols = this.game_manager!.game_components.moveBonusComponent.compareLokedSymbols();
            if (lockedSymbols.length <= 0) {
                state.setDone();
                return;
            }

            // 计算延迟时间
            const delayTime = !this.game_manager!.game_components.getAddDelay()? 0.01 : 1;
            SlotManager.Instance.scheduleOnce(() => {
                const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
                let targetCol = 0;
                let targetRow = 0;

                // 查找目标符号位置（61为奖励符号）
                for (let col = 0; col < 5; col++) {
                    for (let row = 0; row < 3; row++) {
                        if (lastHistoryWindows.GetWindow(col).getSymbol(row) === 61) {
                            targetCol = col;
                            targetRow = row;
                            break;
                        }
                    }
                }

                let currentIndex = 0;
                // 符号添加完成回调
                const addComplete = () => {
                    if (++currentIndex < lockedSymbols.length) {
                        const col = Math.floor(lockedSymbols[currentIndex] / 3);
                        const row = Math.floor(lockedSymbols[currentIndex] % 3);
                        this.singleBonusAddSymbol(targetCol, targetRow, col, row, addComplete);
                    } else {
                        this.game_manager!.game_components.countUI.hideUI();
                        state.setDone();
                    }
                };

                // 初始化第一个符号添加
                const firstCol = Math.floor(lockedSymbols[0] / 3);
                const firstRow = Math.floor(lockedSymbols[0] % 3);
                this.singleBonusAddSymbol(targetCol, targetRow, firstCol, firstRow, addComplete, true);
                SlotManager.Instance.reelMachine.reels[targetCol].getComponent(Reel)?.hideSymbolInRow(targetRow);
            }, delayTime);
        });
        return state;
    }

    /**
     * 单步奖励符号添加
     * @param fromCol 源列
     * @param fromRow 源行
     * @param toCol 目标列
     * @param toRow 目标行
     * @param callback 完成回调
     * @param isFirst 是否为第一个符号
     */
    public singleBonusAddSymbol(
        fromCol: number, 
        fromRow: number, 
        toCol: number, 
        toRow: number, 
        callback: () => void, 
        isFirst: boolean = false
    ): void {
        this.game_manager!.game_components.moveBonusComponent.playMoveBonus(
            fromCol,
            fromRow,
            toCol,
            toRow,
            () => {
                if (TSUtility.isValid(callback)) {
                    callback();
                }
            },
            isFirst
        );
    }

    /**
     * 获取移动特效清理状态
     * @returns 单个状态实例
     */
    public getClearMoveState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager!.game_components.moveBonusComponent.clearAllAnis();
            state.setDone();
        });
        return state;
    }

    /**
     * 获取重旋转框架状态
     * @returns 单个状态实例
     */
    public getRespinFrameState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            if (this.game_manager!.game_components.isSlotSlowSpin()) {
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE);
                this.game_manager!.game_components.reelBGComponent.setRespinNormal();
            }
            state.setDone();
        });
        return state;
    }

    /**
     * 获取奖励游戏启动状态
     * @returns 有序状态序列
     */
    public getBonusGameStartState(): SequencialState {
        const state = new SequencialState();
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();

        if (nextSubGameKey === "bonusGame") {
            // 步骤1：初始化奖励游戏状态
            const initState = new State();
            initState.addOnStartCallback(() => {
                // 禁用下注按钮
                SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(false);
                SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(false);
                TSUtility.setMultiTouch(false);
                SlotReelSpinStateManager.Instance.setSpinMode(false);
                SlotManager.Instance._bottomUI.setButtonActiveState(null);
                SlotManager.Instance.setKeyboardEventFlag(false);
                
                // 更新UI
                SuperSevenBlastsManager.getInstance().game_components.jackpotMoneyDisplay.hideCount();
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "BONUS MODE ACTIVATED");
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                SoundManager.Instance().setMainVolumeTemporarily(0);
                
                // 播放奖励启动音效和动画
                SlotSoundController.Instance().playAudio("BonusStart", "FX");
                this.game_manager!.game_components.topSevenComponent.setBonusStart();
                
                this.game_manager!.scheduleOnce(() => {
                    SlotManager.Instance.playMainBgm();
                    this.game_manager!.game_components.topSevenComponent.setBonusStartSecond();
                    initState.setDone();
                }, 1.5);
            });

            // 步骤2：启动奖励游戏
            const startState = new State();
            startState.addOnStartCallback(() => {
                this.game_manager!.game_components.startBonusGame();
                this.game_manager!.scheduleOnce(() => {
                    startState.setDone();
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "GOOD LUCK!");
                }, 1.23);
            });

            // 组装状态序列
            state.insert(0, this.getStopSingleLineActionState());
            state.insert(0, this.getStopAllSymbolAniState());
            state.insert(1, initState);
            state.insert(2, startState);
        }

        return state;
    }

    /**
     * 显示旋转特效状态
     * @returns 单个状态实例
     */
    public showSpinFxState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager!.game_components.setLastCol();
            this.game_manager!.game_components.reelBGComponent.showSpinFx();
            state.setDone();
        });
        return state;
    }

    /**
     * 隐藏旋转特效状态
     * @returns 单个状态实例
     */
    public hideSpinFxState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager!.game_components.reelBGComponent.hideSpinFx();
            state.setDone();
        });
        return state;
    }

    /**
     * 设置慢速旋转状态
     * @returns 单个状态实例
     */
    public setSlowSpinState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager!.game_components.setSlotSlowSpin();
            state.setDone();
        });
        return state;
    }
}