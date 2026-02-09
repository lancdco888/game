import ChangeNumberComponent from "../../Slot/ChangeNumberComponent";
import { ResultPopupType } from "../../Slot/GameResultPopup";
import Reel from "../../Slot/Reel";
import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../Slot/SlotSoundController";
import State, { SequencialState } from "../../Slot/State";
import SymbolAnimationController from "../../Slot/SymbolAnimationController";
import { BottomTextType } from "../../SubGame/BottomUIText";
import SubGameStateManager_Base from "../../SubGameStateManager_Base";
import UserInfo from "../../User/UserInfo";
import GameComponents_Base from "../../game/GameComponents_Base";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import SlotGameResultManager, { Cell } from "../../manager/SlotGameResultManager";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";
import SlotManager from "../../manager/SlotManager";
import GameComponents_Super25Deluxe from "./GameComponents_Super25Deluxe";

const { ccclass, property } = cc._decorator;

/**
 * 子游戏状态管理器（Super25Deluxe 专属）
 * 功能：构建游戏核心状态流程、处理中奖/Jackpot 特效、金额计算等
 * 单例模式，全局通过 SubGameStateManager_Super25Deluxe.Instance() 获取实例
 */
@ccclass()
export default class SubGameStateManager_Super25Deluxe extends SubGameStateManager_Base {
    // ====================== 单例相关属性 ======================
    private static _instance: SubGameStateManager_Super25Deluxe = null;
    // ====================== 类内部属性 ======================
    private _isShowJackpotPopup: boolean = false;
    public actionSingleLine: cc.Action = null; // 单条支付线动画动作
    // 未显式声明的属性（原 JS 中使用，补充初始化避免 TS 报错）
    public increaseMoneyMultiplierBeforePlaySpecialWin: number = 1; // 特殊赢钱前的金额乘数，可根据项目调整默认值

    // ====================== 单例获取方法 ======================
    public static Instance(): SubGameStateManager_Super25Deluxe {
        if (this._instance === null) {
            this._instance = new SubGameStateManager_Super25Deluxe();
        }
        return this._instance;
    }

    // ====================== 核心方法：构建基础游戏状态流程 ======================
    public getBaseGameState(): SequencialState {
        const self = this;
        const rootState = new SequencialState();
        let stateIndex = 0;
        const spinPrepareState = new SequencialState();

        // 构建旋转前准备状态队列
        spinPrepareState.insert(stateIndex++, this.getChangeJackpotFlagState());
        spinPrepareState.insert(stateIndex++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        spinPrepareState.insert(stateIndex++, this.getStopSingleLineActionState());
        spinPrepareState.insert(stateIndex++, this.getStopAllSymbolAniState());
        spinPrepareState.insert(stateIndex++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
        spinPrepareState.insert(stateIndex++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(0));
        spinPrepareState.insert(stateIndex++, this.getPlayFrameSpinExpectEffectState());
        spinPrepareState.insert(stateIndex++, this.getSetWinTextAtStartSpin());
        spinPrepareState.insert(stateIndex++, SlotManager.Instance.getReelSpinStartState());
        rootState.insert(0, spinPrepareState);

        // 构建旋转后结果处理状态队列
        const spinResultState = new SequencialState();
        spinResultState.addOnStartCallback(function() {
            if (SlotManager.Instance.flagSpinRequest) {
                spinResultState.insert(stateIndex++, SlotManager.Instance.reelMachine.getNormalSpinReelStateRenewal());
                spinResultState.insert(stateIndex++, self.getCheckJackpotHitState());
                spinResultState.insert(stateIndex++, self.getStopFrameEffectState());
                spinResultState.insert(stateIndex++, self.getScrollDownBeforeWinResultState());
                spinResultState.insert(stateIndex++, self.getShowTotalTriggeredPaylineState());

                const winEffectState = new SequencialState();
                winEffectState.insert(0, self.getPlayFrameWinEffectState());
                winEffectState.insert(0, self.getStateShowTotalSymbolEffectOnPayLines());
                winEffectState.insert(1, self.getAddDelayState());
                winEffectState.insert(2, self.getSingleLineEffectOnPaylineState());
                
                spinResultState.insert(stateIndex, winEffectState);
                spinResultState.insert(stateIndex, self.getSetBottomInfoIncreaseWinMoneyState());
                spinResultState.insert(stateIndex, self.getSetBGSoundRatioState(0.1));
                spinResultState.insert(stateIndex++, self.getWinMoneyStateSuper25Deluxe());
                spinResultState.insert(stateIndex++, self.getResetBGSoundRatioState());
                spinResultState.insert(stateIndex++, self.getShowJackpotResultState());
                spinResultState.insert(stateIndex++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
            }
        });
        rootState.insert(1, spinResultState);

        return rootState;
    }

    // ====================== 游戏状态辅助方法（原 JS 迁移，保持逻辑不变） ======================
    /**
     * 检查 Jackpot 命中状态
     */
    public getCheckJackpotHitState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(function() {
            self._isShowJackpotPopup = SlotGameResultManager.Instance.getSpinResult().jackpotResults.length === 0;
            state.setDone();
        });
        return state;
    }

    /**
     * 重置 Jackpot 标记状态
     */
    public getChangeJackpotFlagState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(function() {
            SlotManager.Instance.node.stopAllActions();
            self._isShowJackpotPopup = false;
            self.actionSingleLine = null;
            state.setDone();
        });
        return state;
    }

    /**
     * 旋转开始时设置赢钱文本
     */
    public getSetWinTextAtStartSpin(): State {
        const state = new State();
        state.addOnStartCallback(function() {
            SlotManager.Instance.bottomUIText.setWinText(SlotManager.Instance.getReelSpinStartText());
            state.setDone();
        });
        return state;
    }

    /**
     * 额外赢钱状态处理
     */
    public getExtraWinMoneyState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(function() {
            SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const onComplete = function() {
                state.setDone();
            };

            if (self.isExtraReelAvailable() !== 0) {
                const winType = SlotGameResultManager.Instance.getWinType();
                const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
                SlotManager.Instance.bottomUIText.showWinEffect(true);

                if (totalWin <= 0) {
                    onComplete();
                    return;
                }

                let baseWin: number, finalWin: number;
                const symbol = SlotGameResultManager.Instance.getLastHistoryWindows().GetWindow(3).getSymbol(0);
                let multiplier = 1;
                switch (symbol) {
                    case 71: multiplier = 2; break;
                    case 72: multiplier = 4; break;
                    case 73: multiplier = 10; break;
                    case 74: multiplier = 25; break;
                }
                baseWin = totalWin / multiplier;
                finalWin = totalWin;

                const effectDuration = totalWin > 3 * SlotGameRuleManager.Instance.getTotalBet() ? 4.32 : 2.16;
                if (winType === SlotGameResultManager.WINSTATE_ULTRA || winType === SlotGameResultManager.WINSTATE_MEGA) {
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.winMoney.node.getComponent(ChangeNumberComponent);
                    
                    const totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();
                    const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                    
                    const startIncrement = cc.callFunc(function() {
                        SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                        SlotManager.Instance.bottomUIText.playChangeWinMoney(baseWin, baseWin + 2 * SlotGameRuleManager.Instance.getTotalBet(), null, false, 1);
                    });

                    const playSpecialWin = cc.callFunc(function() {
                        const winEffectTime = bigWinEffect.playWinEffect(totalWinMoney, SlotGameRuleManager.Instance.getTotalBet(), onComplete, function() {
                            SlotManager.Instance.bottomUIText.stopChangeWinMoney(finalWin);
                            self.playIncrementEndCoinSound();
                        });
                        SlotManager.Instance.bottomUIText.playChangeWinMoney(baseWin + 2 * SlotGameRuleManager.Instance.getTotalBet(), finalWin, function() {
                            self.playIncrementEndCoinSound();
                        }, false, winEffectTime);
                    });

                    SlotManager.Instance.node.runAction(cc.sequence(startIncrement, cc.delayTime(1), playSpecialWin));
                } else {
                    SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(baseWin, finalWin, onComplete, true, effectDuration);
                    UserInfo.instance().setBiggestWinCoin(totalWin);
                }
            } else {
                state.setDone();
            }
        });

        state.addOnEndCallback(function() {
            SlotManager.Instance.bottomUIText.showWinEffect(false);
            self.playIncrementEndCoinSound();
        });

        return state;
    }

    /**
     * 检查是否有额外卷轴可用
     */
    public isExtraReelAvailable(): number {
        let isAvailable = false;
        const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;

        if (payOutResults !== null) {
            for (let i = 0; i < payOutResults.length; ++i) {
                if (payOutResults[i].payOut.symbols.indexOf(27) !== -1) {
                    isAvailable = true;
                    break;
                }
                if (payOutResults[i].payOut.count >= 4) {
                    isAvailable = true;
                    break;
                }
            }
        }

        return isAvailable ? 1 : 0;
    }

    /**
     * 默认总符号特效展示状态
     */
    public getStateShowTotalSymbolEffectSuper25Default(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(function() {
            const effectDuration = SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;
            if (self.showTotalSymbolEffectDefault()) {
                SlotManager.Instance.scheduleOnce(function() {
                    state.setDone();
                }, effectDuration);
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 展示默认总符号特效
     */
    public showTotalSymbolEffectDefault(): boolean {
        const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
        const historyWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const activeCells: Cell[] = [];

        const isCellExisted = function(cell: Cell): boolean {
            for (let i = 0; i < activeCells.length; ++i) {
                if (cell.col === activeCells[i].col && cell.row === activeCells[i].row) {
                    return true;
                }
            }
            return false;
        };

        if (payOutResults !== null && payOutResults.length > 0) {
            // 收集有效中奖单元格
            for (let i = 0; i < payOutResults.length; ++i) {
                if (payOutResults[i].payLine !== -1) {
                    for (let j = 0; j < payOutResults[i].winningCell.length; ++j) {
                        const cell = new Cell(payOutResults[i].winningCell[j][1], payOutResults[i].winningCell[j][0]);
                        if (!isCellExisted(cell)) {
                            activeCells.push(cell);
                        }
                    }
                }
            }

            // 播放符号动画并隐藏对应符号
            for (let i = 0; i < activeCells.length; ++i) {
                const cell = activeCells[i];
                if (cell.col !== 3) {
                    const symbol = historyWindows.GetWindow(cell.col).getSymbol(cell.row);
                    SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbol, null, null, true);
                    SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel).hideSymbolInRow(cell.row);
                }
            }

            // 播放赢钱音效
            SlotSoundController.Instance().playWinSound(SlotGameResultManager.Instance.getTotalWinSymbolList());
        }

        // 返回是否有有效特效
        if (activeCells.length === 0) {
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            return false;
        } else {
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
            return true;
        }
    }

    /**
     * 播放旋转预期帧动画状态
     */
    public getPlayFrameSpinExpectEffectState(): State {
        const state = new State();
        state.addOnStartCallback(function() {
            SlotManager.Instance.getComponent(GameComponents_Super25Deluxe).reelEffects.playFrameSpinExpectEffect();
            state.setDone();
        });
        return state;
    }

    /**
     * 停止帧动画状态
     */
    public getStopFrameEffectState(): State {
        const state = new State();
        state.addOnStartCallback(function() {
            SlotManager.Instance.getComponent(GameComponents_Super25Deluxe).reelEffects.stopAllFrameAnis();
            state.setDone();
        });
        return state;
    }

    /**
     * 播放中奖帧动画状态
     */
    public getPlayFrameWinEffectState(): State {
        const state = new State();
        state.addOnStartCallback(function() {
            const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            if (payOutResults !== null && payOutResults.length > 0) {
                SlotManager.Instance.getComponent(GameComponents_Super25Deluxe).reelEffects.playFrameWinEffect();
            }
            state.setDone();
        });
        return state;
    }

    /**
     * 添加延迟状态
     */
    public getAddDelayState(): State {
        const state = new State();
        state.addOnStartCallback(function() {
            let delayTime = 0;
            if (SlotGameResultManager.Instance.getSpinResult().jackpotResults.length > 0) {
                delayTime = 0.5;
            }
            SlotManager.Instance.scheduleOnce(function() {
                state.setDone();
            }, delayTime);
        });
        return state;
    }

    /**
     * 停止单条支付线动画（Super25Deluxe 专属）
     */
    public stopSingleLineActionSuper25Deluxe(): void {
        if (this.actionSingleLine && SlotManager.Instance.node) {
            SlotManager.Instance.node.stopAction(this.actionSingleLine);
        }
    }

    /**
     * 展示 Jackpot 结果状态
     */
    public getShowJackpotResultState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(function() {
            const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;
            if (jackpotResults !== null && jackpotResults.length > 0) {
                // 停止现有动画和特效
                self.stopSingleLineActionSuper25Deluxe();
                SymbolAnimationController.Instance.stopAllAnimationSymbol();
                SlotManager.Instance.paylineRenderer.clearAll();

                // 播放 Jackpot 符号动画
                const historyWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
                for (let i = 0; i < 3; ++i) {
                    for (let j = 0; j < 3; ++j) {
                        if (historyWindows.GetWindow(i).getSymbol(j) === 91) {
                            SymbolAnimationController.Instance.playAnimationSymbol(i, j, 91, null, null, true);
                        }
                    }
                }

                // 计算总 Jackpot 金额
                let totalJackpot = 0;
                for (let i = 0; i < jackpotResults.length; ++i) {
                    totalJackpot += jackpotResults[i].winningCoin;
                }

                // 播放 Jackpot 音效并更新文本
                SlotSoundController.Instance().playAudio("JackpotHit", "FX");
                if (SlotManager.Instance.bottomUIText.winText !== null) {
                    SlotManager.Instance.bottomUIText.setWinText("JACKPOT");
                } else {
                    SlotManager.Instance.bottomUIText.setWinMoney(totalJackpot);
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "JACKPOT");
                }

                // 调度 Jackpot 动画和弹窗
                SlotManager.Instance.scheduleOnce(function() {
                    SlotManager.Instance.getComponent(GameComponents_Super25Deluxe).jackpotUI.playJackpotAni();
                }, 1.67);

                SlotManager.Instance.scheduleOnce(function() {
                    SlotManager.Instance.bottomUIText.setWinMoney(totalJackpot);
                    SlotManager.Instance.showGameResultPopup(ResultPopupType.JackpotResultCommon, totalJackpot, 0, function() {
                        state.setDone();
                    });
                }, 4.17);
            } else {
                state.setDone();
            }
        });

        state.addOnEndCallback(function() {
            self._isShowJackpotPopup = true;
            if (self.actionSingleLine && SlotManager.Instance.node) {
                SlotManager.Instance.node.runAction(self.actionSingleLine);
            }
        });

        return state;
    }

    /**
     * Super25Deluxe 专属赢钱状态处理
     */
    public getWinMoneyStateSuper25Deluxe(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(function() {
            const totalWin = self.getTotalWinMoneySuper25Deluxe();
            const onComplete = function() {
                SlotManager.Instance.bottomUIText.showWinEffect(false);
                SlotManager.Instance.setMouseDragEventFlag(true);
                SlotManager.Instance.applyGameResultMoneyBySubFromResult(totalWin);
                state.setDone();
            };

            if (self.isShowWinMoneyEffect() !== 0) {
                const winType = SlotGameResultManager.Instance.getWinType(totalWin);
                SlotManager.Instance.bottomUIText.showWinEffect(true);

                if (totalWin <= 0) {
                    onComplete();
                    return;
                }

                const finalWin = 0 + totalWin;
                const totalBet = SlotGameRuleManager.Instance.getTotalBet();
                const effectDuration = totalWin > 3 * totalBet 
                    ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2 
                    : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

                if (winType !==SlotGameResultManager.WINSTATE_NORMAL) {
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.winMoney.node.getComponent(ChangeNumberComponent);
                    
                    const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                    const baseEffectDuration = SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

                    const startIncrement = cc.callFunc(function() {
                        SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                        SlotManager.Instance.bottomUIText.playChangeWinMoney(
                            0, 
                            0 + totalBet * self.increaseMoneyMultiplierBeforePlaySpecialWin, 
                            null, 
                            false, 
                            baseEffectDuration
                        );
                        SlotManager.Instance.setMouseDragEventFlag(false);
                    });

                    const playSpecialWin = cc.callFunc(function() {
                        const winEffectTime = bigWinEffect.playWinEffect(totalWin, totalBet, onComplete, function() {
                            SlotManager.Instance.bottomUIText.stopChangeWinMoney(finalWin);
                            self.playIncrementEndCoinSound();
                        });
                        SlotManager.Instance.bottomUIText.playChangeWinMoney(
                            0 + totalBet * self.increaseMoneyMultiplierBeforePlaySpecialWin, 
                            finalWin, 
                            function() {
                                self.playIncrementEndCoinSound();
                            }, 
                            false, 
                            winEffectTime
                        );
                    });

                    SlotManager.Instance.node.runAction(cc.sequence(startIncrement, cc.delayTime(baseEffectDuration), playSpecialWin));
                } else {
                    SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(0, finalWin, onComplete, true, effectDuration);
                    UserInfo.instance().setBiggestWinCoin(totalWin);
                }
            } else {
                onComplete();
            }
        });

        state.addOnEndCallback(function() {
            self.playIncrementEndCoinSound();
        });

        return state;
    }

    /**
     * 计算 Super25Deluxe 专属总赢钱金额
     */
    public getTotalWinMoneySuper25Deluxe(): number {
        const payOutResults = SlotGameResultManager.Instance._gameResult.spinResult.payOutResults;
        let betPerLine = 0;
        let totalWin = 0;

        if (payOutResults !== null) {
            for (let i = 0; i < payOutResults.length; ++i) {
                if (payOutResults[i].payOut.prizeUnit === "BetPerLine") {
                    betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
                }
                if (payOutResults[i].payOut.prizeType === "Multiplier") {
                    if (payOutResults[i].wildMultiplier !== null && payOutResults[i].wildMultiplier !== 0) {
                        totalWin += betPerLine * payOutResults[i].payOut.multiplier * payOutResults[i].wildMultiplier;
                    } else {
                        totalWin += betPerLine * payOutResults[i].payOut.multiplier;
                    }
                }
            }
        }

        return totalWin;
    }

    /**
     * 展示支付线上的总符号特效状态
     */
    public getStateShowTotalSymbolEffectOnPayLines(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(function() {
            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
            const effectDuration = totalWin > 3 * totalBet
                ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2
                : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

            if (self.showTotalSymbolEffectOnPaylines()) {
                // 停止符号动画和暗化效果
                SlotManager.Instance.scheduleOnce(function() {
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
                }, effectDuration);

                // 完成状态
                SlotManager.Instance.scheduleOnce(function() {
                    state.setDone();
                }, effectDuration + 0.5);
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 单条支付线特效状态
     */
    public getSingleLineEffectOnPaylineState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(function() {
            const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const historyWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            const activeCells: Cell[] = [];

            // 过滤正常赢钱状态的特殊场景
            if (SlotGameResultManager.Instance.getWinType() === SlotGameResultManager.WINSTATE_NORMAL) {
                if (SlotGameResultManager.Instance.getTotalWinMoney() <= 0) {
                    state.setDone();
                    return;
                }
                if (SlotReelSpinStateManager.Instance.getAutospinMode() || 
                    SlotReelSpinStateManager.Instance.getFreespinMode() || 
                    SlotGameResultManager.Instance.getWinningCoinBySymbolId(51) > 0 || 
                    SlotGameResultManager.Instance.getWinningCoinBySymbolId(52) > 0) {
                    state.setDone();
                    return;
                }
            }

            // 计算总状态数（支付线 + Jackpot）
            let index = 0;
            let totalStateCount = 0;
            const jackpotCount = SlotGameResultManager.Instance.getSpinResult().jackpotResults.length > 0 ? 1 : 0;
            totalStateCount += payOutResults.length;
            totalStateCount += jackpotCount;

            if (totalStateCount !== 0) {
                let isPlayedPaylineSound = false;
                const playPaylineEffect = cc.callFunc(function() {
                    // 停止现有动画
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    if (SlotManager.Instance.paylineRenderer !== null) {
                        SlotManager.Instance.paylineRenderer.clearAll();
                    }

                    if (index < payOutResults.length) {
                        const payLine = payOutResults[index].payLine;
                        // 绘制支付线并播放音效
                        if (SlotManager.Instance.paylineRenderer !== null) {
                            if (payLine !== -1) {
                                SlotManager.Instance.paylineRenderer.drawSingleLine(payLine, payOutResults[index].payOut.count);
                            }
                            if (payOutResults.length > 1) {
                                SlotSoundController.Instance().playAudio("ShowPayline", "FX");
                            } else if (payOutResults.length === 1 && !isPlayedPaylineSound) {
                                SlotSoundController.Instance().playAudio("ShowPayline", "FX");
                                isPlayedPaylineSound = true;
                            }
                        }

                        // 收集中奖单元格
                        activeCells.length = 0;
                        for (let i = 0; i < payOutResults[index].winningCell.length; ++i) {
                            const cell = new Cell(payOutResults[index].winningCell[i][1], payOutResults[index].winningCell[i][0]);
                            activeCells.push(cell);
                        }

                        // 播放符号动画
                        for (let i = 0; i < activeCells.length; ++i) {
                            const cell = activeCells[i];
                            const symbol = historyWindows.GetWindow(cell.col).getSymbol(cell.row);
                            SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbol);
                            SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel).hideSymbolInRow(cell.row);
                        }

                        // 更新赢钱文本
                        const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
                        const winningCoin = payOutResults[index].winningCoin;
                        let winText = "";
                        if (totalStateCount > 1 && self._isShowJackpotPopup) {
                            winText = "LINE " + (payLine + 1).toString() + " PAYS " + CurrencyFormatHelper.formatNumber(winningCoin);
                        }
                        if (self._isShowJackpotPopup) {
                            SlotManager.Instance.bottomUIText.setWinMoney(totalWin, winText);
                            self.showSinglePaylineInfoForLines(payLine + 1, winningCoin, payOutResults[index].payOut.symbols);
                        }
                    } else {
                        // 处理 Jackpot 支付线
                        let totalJackpot = 0;
                        const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;
                        for (let i = 0; i < jackpotResults.length; ++i) {
                            totalJackpot += jackpotResults[i].winningCoin;
                        }

                        // 播放 Jackpot 音效和符号动画
                        if (totalStateCount > 1) {
                            SlotSoundController.Instance().playAudio("ShowPayline", "FX");
                        } else if (totalStateCount === 1 && !isPlayedPaylineSound) {
                            SlotSoundController.Instance().playAudio("ShowPayline", "FX");
                            isPlayedPaylineSound = true;
                        }

                        let symbol = 0;
                        for (let i = 0; i < 3; ++i) {
                            for (let j = 0; j < 3; ++j) {
                                symbol = historyWindows.GetWindow(i).getSymbol(j);
                                if (symbol === 91) {
                                    SymbolAnimationController.Instance.playAnimationSymbol(i, j, symbol);
                                    SlotManager.Instance.reelMachine.reels[i].getComponent(Reel).hideSymbolInRow(j);
                                }
                            }
                        }

                        // 更新 Jackpot 文本
                        const winText = "JACKPOT " + CurrencyFormatHelper.formatNumber(totalJackpot);
                        const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
                        SlotManager.Instance.bottomUIText.setWinMoney(totalWin, winText);
                        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, winText);
                    }

                    // 循环索引并启用符号暗化
                    index = (index + 1) % totalStateCount;
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
                })

                // 停止现有单条支付线动画并创建新动画
                self.stopSingleLineAction();
                self.actionSingleLine = cc.repeatForever(cc.sequence(
                    playPaylineEffect,
                    cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect)
                ));
                if (SlotManager.Instance.node) {
                    SlotManager.Instance.node.runAction(self.actionSingleLine);
                }
                state.setDone();
            } else {
                state.setDone();
            }
        });
        return state;
    }

    // ====================== 未实现的抽象/辅助方法（原 JS 中引用，需根据项目补充） ======================
    /**
     * 停止单条支付线动画（基础方法，需在基类或当前类补充完整实现）
     */
    public stopSingleLineAction(): void {
        this.stopSingleLineActionSuper25Deluxe();
    }

    /**
     * 播放金额增长结束音效（基础方法，需根据项目补充完整实现）
     */
    public playIncrementEndCoinSound(): void {
        SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");
        // 可补充额外的结束音效播放逻辑
    }

    /**
     * 检查是否显示赢钱特效（基础方法，需根据项目补充完整实现）
     */
    public isShowWinMoneyEffect(): number {
        return SlotGameResultManager.Instance.getTotalWinMoney() > 0 ? 1 : 0;
    }

    /**
     * 展示支付线上的总符号特效（基础方法，需根据项目补充完整实现）
     */
    public showTotalSymbolEffectOnPaylines(): boolean {
        return this.showTotalSymbolEffectDefault();
    }

    /**
     * 展示单条支付线信息（基础方法，需根据项目补充完整实现）
     */
    public showSinglePaylineInfoForLines(lineNum: number, winningCoin: number, symbols: number[]): void {
        // 项目自定义逻辑：更新支付线信息文本、弹窗等
    }

    // ====================== 基类继承的未实现方法（需根据项目补充，此处留空保持编译通过） ======================
    public getStopSingleLineActionState(): State {
        const state = new State();
        state.addOnStartCallback(() => state.setDone());
        return state;
    }

    public getStopAllSymbolAniState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            state.setDone();
        });
        return state;
    }

    public getScrollDownBeforeWinResultState(): State {
        const state = new State();
        state.addOnStartCallback(() => state.setDone());
        return state;
    }

    public getShowTotalTriggeredPaylineState(): State {
        const state = new State();
        state.addOnStartCallback(() => state.setDone());
        return state;
    }

    public getSetBottomInfoIncreaseWinMoneyState(): State {
        const state = new State();
        state.addOnStartCallback(() => state.setDone());
        return state;
    }
}