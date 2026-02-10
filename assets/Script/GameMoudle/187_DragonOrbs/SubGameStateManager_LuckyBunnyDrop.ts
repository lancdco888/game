import CameraControl from "../../Slot/CameraControl";
import Reel from "../../Slot/Reel";
import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../Slot/SlotSoundController";
import State, { SequencialState } from "../../Slot/State";
import SymbolAnimationController from "../../Slot/SymbolAnimationController";
import BottomUIText, { BottomTextType } from "../../SubGame/BottomUIText";
import SubGameStateManager_Base from "../../SubGameStateManager_Base";
import UserInfo from "../../User/UserInfo";
import GameComponents_Base from "../../game/GameComponents_Base";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import TSUtility from "../../global_utility/TSUtility";
import ServicePopupManager from "../../manager/ServicePopupManager";
import SlotGameResultManager, { Cell } from "../../manager/SlotGameResultManager";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";
import SlotManager from "../../manager/SlotManager";
import GameComponent_LuckyBunnyDrop from "./GameComponent_LuckyBunnyDrop";
import JackpotSymbolComponent_LucykyBunnyDrop from "./JackpotSymbolComponent_LucykyBunnyDrop";
import JackpotSymbolInfoHelper_LuckyBunnyDrop from "./JackpotSymbolInfoHelper_LuckyBunnyDrop";
import LuckyBunnyDropManager from "./LuckyBunnyDropManager";
import ReelMachine_LuckyBunnyDrop from "./ReelMachine_LuckyBunnyDrop";
import WildSymbolComponent_LuckyBunnyDrop from "./WildSymbolComponent_LuckyBunnyDrop";


const { ccclass: ccclassDecorator } = cc._decorator;

@ccclassDecorator('SubGameStateManager_LuckyBunnyDrop')
export default class SubGameStateManager_LuckyBunnyDrop extends SubGameStateManager_Base {
    private static _instance: SubGameStateManager_LuckyBunnyDrop | null = null;
    public normalSymbolIDS: number[] = [11, 12, 13, 14, 21, 22, 23, 24, 32, 31];
    public actionSingleLine: any = null;
    public increaseMoneyMultiplierBeforePlaySpecialWin: number = 1; // 原代码隐含的默认值

    public static Instance(): SubGameStateManager_LuckyBunnyDrop {
        if (SubGameStateManager_LuckyBunnyDrop._instance === null) {
            SubGameStateManager_LuckyBunnyDrop._instance = new SubGameStateManager_LuckyBunnyDrop();
        }
        return SubGameStateManager_LuckyBunnyDrop._instance;
    }

    public getBaseGameState(): SequencialState {
        const self = this;
        const t = new SequencialState();
        let n = 0;
        const o = new SequencialState();
        o.insert(n++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        o.insert(n++, SlotManager.Instance.reelMachine.getStateSetSymbolsDimmActive(false));
        o.insert(n++, this.getStopSingleLineActionState());
        o.insert(n++, this.getStopAllSymbolAniState());
        o.insert(n++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
        o.insert(n++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(0));
        o.insert(n++, SlotManager.Instance.getReelSpinStartState());
        t.insert(0, o);

        const a = new SequencialState();
        a.addOnStartCallback(function () {
            if (SlotManager.Instance.flagSpinRequest) {
                a.insert(n++, SlotManager.Instance.reelMachine.getNormalSpinReelStateRenewal(SlotGameResultManager.Instance.getLastHistoryWindows()));
                a.insert(n++, self.getScrollDownBeforeWinResultState());
                a.insert(n++, self.getShowTotalTriggeredPaylineState());

                const t = new SequencialState();
                t.insert(0, self.getStateShowTotalSymbolEffectOnPayLines());
                t.insert(1, self.getSingleLineEffectOnPaylineState());
                a.insert(n, t);
                a.insert(n, self.getSetBGSoundRatioState(.1));
                a.insert(n, self.getSetBottomInfoIncreaseWinMoneyState());
                a.insert(n++, self.getWinMoneyState());
                a.insert(n++, self.getResetBGSoundRatioState());
                a.insert(n++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
                a.insert(n++, self.getFreespinStartState());
                a.insert(n++, self.getLockAndRollStartState());
            }
        });
        t.insert(1, a);
        return t;
    }

    public getFreespinGameState(): SequencialState {
        const self = this;
        const t = new SequencialState();
        let n = 0;
        const o = new SequencialState();
        o.insert(n++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        o.insert(n++, SlotManager.Instance.reelMachine.getStateSetSymbolsDimmActive(false));
        o.insert(n++, this.getStopSingleLineActionState());
        o.insert(n++, this.getStopAllSymbolAniState());
        o.insert(n++, this.getShowLockWildState());
        o.insert(n++, SlotManager.Instance.getIncreaseFreespinPastCountStateRenewal());
        o.insert(n++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
        o.insert(n++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(SlotGameResultManager.Instance.winMoneyInFreespinMode));
        o.insert(n++, SlotManager.Instance.getReelSpinStartState());
        t.insert(0, o);

        const a = new SequencialState();
        a.addOnStartCallback(function () {
            if (SlotManager.Instance.flagSpinRequest) {
                a.insert(n, SlotManager.Instance.reelMachine.getNormalSpinReelStateRenewal(SlotGameResultManager.Instance.getLastHistoryWindows()));
                a.insert(n++, self.getScrollDownBeforeWinResultState());
                a.insert(n++, self.getCheckLockWildState());
                a.insert(n++, self.getHideLockWildState());
                a.insert(n++, self.getShowTotalTriggeredPaylineState());

                const t = new SequencialState();
                t.insert(0, self.getStateShowTotalSymbolEffectOnPayLines());
                t.insert(1, self.getSingleLineEffectOnPaylineState());
                a.insert(n, t);
                a.insert(n, self.getSetBottomInfoIncreaseWinMoneyState());
                a.insert(n++, self.getWinMoneyState());
                a.insert(n++, self.getResetBGSoundRatioState());
                a.insert(n++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
                a.insert(n++, self.getAddWinMoneyToFreespinEarningPotState());
                a.insert(n++, self.getFreeSpinRetriggerState());
                a.insert(n++, self.getCheckFreespinEndState());
                a.insert(n++, self.getLockAndRollStartState());
            }
        });
        t.insert(1, a);
        return t;
    }

    public getLockAndRollGameState(): SequencialState {
        const self = this;
        const t = new SequencialState();
        let n = 0;
        const o = new SequencialState();
        o.insert(n++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        o.insert(n++, this.getStopSingleLineActionState());
        o.insert(n++, this.getStopAllSymbolAniState());
        o.insert(n++, this.getAddCountState());
        o.insert(n++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.CustomData, "TOTAL WIN"));
        o.insert(n++, SlotManager.Instance.getReelSpinStartState(SlotManager.Instance.reelMachine.getComponent(ReelMachine_LuckyBunnyDrop).lockAndRoll_Reels));
        t.insert(0, o);

        const a = new SequencialState();
        a.addOnStartCallback(function () {
            if (SlotManager.Instance.flagSpinRequest) {
                a.insert(n++, SlotManager.Instance.reelMachine.getComponent(ReelMachine_LuckyBunnyDrop).getLockAndRollReelState());
                a.insert(n++, self.getLockRockAndRollState());
                a.insert(n++, self.getLockRockAndRollMoveState());
                a.insert(n++, self.getUpdateCountState());
                a.insert(n++, self.getCheckLockAndRollEndState());
                a.insert(n++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
            }
        });
        t.insert(1, a);
        t.insert(2, this.getFreeSpinStartFromLockAndRollState());
        t.insert(3, this.getFreeSpinEndFromLockAndRollState());
        return t;
    }

    public getWinMoneyState(): State {
        const self = this;
        const t = new State();
        t.addOnStartCallback(function () {
            const n = SlotGameResultManager.Instance.getTotalWinMoney();
            const o = function () {
                SlotManager.Instance.bottomUIText.showWinEffect(false);
                SlotManager.Instance.setMouseDragEventFlag(true);
                SlotManager.Instance.applyGameResultMoney(n);
                t.setDone();
            };

            if (self.isShowWinMoneyEffect() !== 0) {
                const a = SlotGameResultManager.Instance.getWinType();
                SlotManager.Instance.bottomUIText.showWinEffect(true);

                if (n <= 0) {
                    o();
                } else {
                    const i = 0 + n;
                    let l: number;
                    const s = SlotGameRuleManager.Instance.getTotalBet();
                    l = n > 3 * s ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2 : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

                    if (a !== SlotGameResultManager.WINSTATE_NORMAL) {
                        SlotManager.Instance.bottomUIText.setWinMoney(0);
                        const c = SlotGameResultManager.Instance.getTotalWinMoney();
                        const u = SlotGameRuleManager.Instance.getTotalBet();
                        const p = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                        const d = SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;
                        const y = cc.callFunc(function () {
                            SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                            SlotManager.Instance.bottomUIText.playChangeWinMoney(0, 0 + u * self.increaseMoneyMultiplierBeforePlaySpecialWin, null, false, d);
                            SlotManager.Instance.setMouseDragEventFlag(false);
                        });
                        const _ = cc.callFunc(function () {
                            const t = p.playWinEffect(c, u, o, function () {
                                SlotManager.Instance.bottomUIText.stopChangeWinMoney(i);
                                self.playIncrementEndCoinSound();
                            });
                            SlotManager.Instance.bottomUIText.playChangeWinMoney(0 + u * self.increaseMoneyMultiplierBeforePlaySpecialWin, i, function () {
                                self.playIncrementEndCoinSound();
                            }, false, t);
                        });
                        SlotManager.Instance.node.runAction(cc.sequence(y, cc.delayTime(d), _));
                    } else {
                        SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                        SlotManager.Instance.bottomUIText.setWinMoney(0);
                        SlotManager.Instance.bottomUIText.playChangeWinMoney(0, i, function () {
                            SlotManager.Instance.scheduleOnce(function () {
                                o();
                            }, .5);
                        }, true, l);
                        UserInfo.instance().setBiggestWinCoin(n);
                    }
                }
            } else {
                o();
            }
        });

        t.addOnEndCallback(function () {
            self.playIncrementEndCoinSound();
        });
        return t;
    }

    public getChangeUIToNormalState(): State {
        const e = new State();
        e.addOnStartCallback(function () {
            SlotManager.Instance._bottomUI.hideFreespinUI();
            SlotReelSpinStateManager.Instance.setFreespinMode(false);
            SlotManager.Instance._bottomUI.getComponent(BottomUIText).setShowAverageBetText(false);
            e.setDone();
        });
        return e;
    }

    public changeUIToFreespinState(): State {
        const self = this;
        const t = new State();
        t.addOnStartCallback(function () {
            self.changeUIToFreespin();
            t.setDone();
        });
        return t;
    }

    public changeUIToFreespin(): void {
        SlotManager.Instance._bottomUI.setShowFreespinMultiplier(false);
        SlotManager.Instance._bottomUI.showFreespinUI();
        SlotManager.Instance.setFreespinExtraInfoByCurrentState();
        SlotReelSpinStateManager.Instance.setFreespinMode(true);
        SlotManager.Instance.bottomUIText.setWinMoney(SlotGameResultManager.Instance.winMoneyInFreespinMode);
    }

    public getStateShowTotalSymbolEffectOnPayLines(): State {
        const self = this;
        const t = new State();
        t.addOnStartCallback(function () {
            const n = SlotGameResultManager.Instance.getTotalWinMoney() > 3 * SlotGameRuleManager.Instance.getTotalBet() ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2 : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;
            if (self.showTotalSymbolEffectOnPaylines()) {
                SlotManager.Instance.scheduleOnce(function () {
                    if (!SlotReelSpinStateManager.Instance.getAutospinMode()&& !SlotReelSpinStateManager.Instance.getFreespinMode()) {
                        SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    }
                    t.setDone();
                }, n);
            } else {
                t.setDone();
            }
        });
        return t;
    }

    public showTotalSymbolEffectOnPaylines(): boolean {
        const e = SlotGameResultManager.Instance.getSpinResult().payOutResults;
        const t = SlotGameResultManager.Instance.getLastHistoryWindows();
        const n: Cell[] = [];
        const o: number[] = [];

        if (SlotReelSpinStateManager.Instance.getFreespinMode()) {
            for (let a = SlotGameRuleManager.Instance.getCurrentBetPerLine(), i = SlotGameResultManager.Instance.getSubGameState("freeSpin").exDataWithBetPerLine, l = 0; l < 5; ++l) {
                for (let r = 0; r < 3; ++r) {
                    let s: any = null;
                    if (i[a] !== null) {
                        const u = i[a].exDatas.selectedCell;
                        const p = 3 * l + r;
                        if (TSUtility.isValid(u) && TSUtility.isValid(u.datas)) {
                            s = u.datas[p];
                            o.push(TSUtility.isValid(s) ? Number(s.gauge) : 0);
                        } else {
                            o.push(0);
                        }
                    } else {
                        o.push(0);
                    }
                }
            }
        }

        if (e !== null && e.length > 0) {
            const f = function (e: Cell): boolean {
                for (let t = false, o = 0; o < n.length; ++o) {
                    if (e.col === n[o].col && e.row === n[o].row) {
                        t = true;
                        break;
                    }
                }
                return t;
            };

            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            for (let l = 0; l < e.length; ++l) {
                for (let r = 0; r < e[l].winningCell.length; ++r) {
                    const _ = new Cell(e[l].winningCell[r][1], e[l].winningCell[r][0]);
                    if (!f(_)) {
                        n.push(_);
                    }
                }
            }

            n.sort(function (e: Cell, t: Cell) {
                if (e.col < t.col) return 1;
                if (e.col > t.col) return -1;
                if (e.row < t.row) return -1;
                if (e.row > t.row) return 1;
                return 0;
            });

            for (let l = 0; l < n.length; ++l) {
                const C = n[l];
                let v = t.GetWindow(C.col).getSymbol(C.row);
                if (v < 90 && v >= 72) v = 72;

                const I = SymbolAnimationController.Instance.playAnimationSymbol(C.col, C.row, v, null, null, true);
                const M = SlotGameResultManager.Instance.getNextSubGameKey();

                if (v < 90 && v >= 72 && I.getComponent(WildSymbolComponent_LuckyBunnyDrop) !== null) {
                    const P = 3 * C.col + C.row;
                    let O = 0;
                    if (P < o.length) O = o[P];
                    if (M === "base") {
                        I.getComponent(WildSymbolComponent_LuckyBunnyDrop).setCount(0);
                    } else {
                        I.getComponent(WildSymbolComponent_LuckyBunnyDrop).setCount(O - 1);
                    }
                }
                SlotManager.Instance.reelMachine.reels[C.col].getComponent(Reel).hideSymbolInRow(C.row);
            }

            SymbolAnimationController.Instance.resetZorderSymbolAnimation();
            SlotSoundController.Instance().playWinSound(SlotGameResultManager.Instance.getTotalWinSymbolList());
        }

        if (n.length === 0) {
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            return false;
        } else {
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
            return true;
        }
    }

    public getSingleLineEffectOnPaylineState(): State {
        const self = this;
        const t = new State();
        t.addOnStartCallback(function () {
            const n = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const o = SlotGameResultManager.Instance.getLastHistoryWindows();
            const a: Cell[] = [];

            if (SlotGameResultManager.Instance.getWinType() === SlotGameResultManager.WINSTATE_NORMAL) {
                if (n === null || n.length === 0) {
                    t.setDone();
                    return;
                }
                if (SlotReelSpinStateManager.Instance.getAutospinMode() || SlotReelSpinStateManager.Instance.getFreespinMode() || SlotGameResultManager.Instance.getWinningCoinBySymbolId(51) > 0) {
                    t.setDone();
                    return;
                }
            }

            let i = 0, l = 0;
            for (let r = 0; r < n.length; ++r) ++l;

            if (l !== 0) {
                const u: number[] = [];
                if (SlotReelSpinStateManager.Instance.getFreespinMode()) {
                    const p = SlotGameRuleManager.Instance.getCurrentBetPerLine();
                    const f = SlotGameResultManager.Instance.getSubGameState("freeSpin").exDataWithBetPerLine;
                    for (let r = 0; r < 5; ++r) {
                        for (let _ = 0; _ < 3; ++_) {
                            let C: any = null;
                            if (f[p] !== null) {
                                const v = f[p].exDatas.selectedCell;
                                const I = 3 * r + _;
                                if (TSUtility.isValid(v) && TSUtility.isValid(v.datas)) {
                                    C = v.datas[I];
                                    u.push(TSUtility.isValid(C) ? Number(C.gauge) : 0);
                                } else {
                                    u.push(0);
                                }
                            } else {
                                u.push(0);
                            }
                        }
                    }
                }

                let M = false;
                const P = cc.callFunc(function () {
                    const e = n[i].payLine;
                    if (SlotManager.Instance.paylineRenderer !== null) {
                        SlotManager.Instance.paylineRenderer.clearAll();
                        if (e !== -1) {
                            SlotManager.Instance.paylineRenderer.drawSingleLine(e, n[i].payOut.count);
                        }
                    }

                    if (n.length > 1) {
                        SlotSoundController.Instance().playAudio("ShowPayline", "FX");
                    } else if (n.length === 1 && !M) {
                        SlotSoundController.Instance().playAudio("ShowPayline", "FX");
                        M = true;
                    }

                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    const t: number[] = [];
                    a.length = 0;

                    for (let r = 0; r < n[i].winningCell.length; ++r) {
                        const c = new Cell(n[i].winningCell[r][1], n[i].winningCell[r][0]);
                        a.push(c);
                    }

                    for (let p = 0; p < a.length; ++p) {
                        const f = a[p];
                        let h = o.GetWindow(f.col).getSymbol(f.row);
                        if (h < 90 && h >= 72) h = 72;

                        const y = SymbolAnimationController.Instance.playAnimationSymbol(f.col, f.row, h);
                        const _ = SlotGameResultManager.Instance.getNextSubGameKey();

                        if (h < 90 && h >= 72 && y.getComponent(WildSymbolComponent_LuckyBunnyDrop) !== null) {
                            const C = 3 * f.col + f.row;
                            let v = 0;
                            if (C < u.length) v = u[C];
                            if (_ === "base") {
                                y.getComponent(WildSymbolComponent_LuckyBunnyDrop).setCount(0);
                            } else {
                                y.getComponent(WildSymbolComponent_LuckyBunnyDrop).setCount(v - 1);
                            }
                        }

                        t.push(h);
                        SlotManager.Instance.reelMachine.reels[f.col].getComponent(Reel).hideSymbolInRow(f.row);
                    }

                    if (l > 1) {
                        const I = SlotGameResultManager.Instance.getTotalWinMoney();
                        const P = n[i].payLine;
                        const O = n[i].winningCoin;
                        const A = "LINE " + (P + 1).toString() + " PAYS " + CurrencyFormatHelper.formatNumber(O);
                        SlotManager.Instance.bottomUIText.setWinMoney(I, A);
                    }

                    this.showSinglePaylineInfoForLines(e + 1, n[i].winningCoin, n[i].payOut.symbols);
                    i = (i + 1) % n.length;
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
                }.bind(self));

                self.stopSingleLineAction();
                self.actionSingleLine = cc.repeatForever(cc.sequence(P, cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect)));
                SlotManager.Instance.node.runAction(self.actionSingleLine);
                t.setDone();
            } else {
                t.setDone();
            }
        });
        return t;
    }

    public getFreespinStartState(): SequencialState {
        const self = this;
        const t = new SequencialState();
        const n = new State();

        n.addOnStartCallback(function () {
            const t = SlotGameResultManager.Instance.getNextSubGameKey();
            if (t === "freeSpin") {
                if (CameraControl.Instance.eStateOfCameraPosition === 1) {
                    CameraControl.Instance.scrollDownScreen(.8);
                }

                const o = SlotGameResultManager.Instance.getSubGameState(t);
                self.stopSingleLineAction();
                SlotManager.Instance.paylineRenderer.clearAll();
                SymbolAnimationController.Instance.stopAllAnimationSymbol();
                SlotManager.Instance._freespinTotalCount = o.totalCnt;
                SlotManager.Instance._freespinPastCount = 0;
                SlotManager.Instance._freespinMultiplier = o.spinMultiplier;
                SlotGameResultManager.Instance.winMoneyInFreespinMode = o.totalWinningCoin;
                SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).lockWild.initComponent();

                const i = cc.callFunc(function () {
                    for (let e: number, t = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult(), n = 0; n < 5; ++n) {
                        for (let o = 0; o < 3; ++o) {
                            if ((e = SlotGameResultManager.Instance.getSubGameState(t).lastWindows[n][o]) === 51) {
                                SymbolAnimationController.Instance.playAnimationSymbol(n, o, e);
                                SlotManager.Instance.reelMachine.reels[n].getComponent(Reel).hideSymbolInRow(o);
                            }
                        }
                    }
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
                    SlotSoundController.Instance().playAudio("ScatterHit", "FX");
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.TriggerScatter);
                });

                const l = cc.callFunc(function () {
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                });

                const a = cc.sequence(i, cc.delayTime(2), l);
                const r = cc.callFunc(function () {
                    SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).freeSpinStartPopup.open(SlotManager.Instance._freespinTotalCount, function () {
                        SlotManager.Instance.playMainBgm();
                        SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
                        self.changeUIToFreespin();
                        n.setDone();
                    });
                });

                SlotManager.Instance.node.runAction(cc.sequence(cc.delayTime(.3), a, r));
            } else {
                n.setDone();
            }
        });

        t.insert(0, n);
        return t;
    }

    public getCheckFreespinEndState(): SequencialState {
        const self = this;
        const t = new SequencialState();
        t.addOnStartCallback(function () {
            const n = SlotGameResultManager.Instance.getSubGameState("freeSpin");
            const o = SlotGameResultManager.Instance.getNextSubGameKey();

            if (n !== null && n.totalCnt === n.spinCnt && o === "base") {
                const a = self.getShowFreespinResultState();
                t.insert(0, self.getScrollDown(.8));
                t.insert(0, a);
                t.insert(0, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
                t.insert(0, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(SlotGameResultManager.Instance.winMoneyInFreespinMode));
                t.insert(1, self.getShowBigWinEffectEndFreespinState());

                const i = new State();
                i.addOnStartCallback(function () {
                    SlotManager.Instance.setKeyboardEventFlag(true);
                    SlotManager.Instance.setMouseDragEventFlag(true);
                    SlotManager.Instance.playMainBgm();
                    i.setDone();
                });

                t.insert(2, self.getChangeUIToNormalState());
                t.insert(2, i);
            }
        });
        return t;
    }

    public getShowFreespinResultState(): State {
        const self = this;
        const t = new State();
        t.addOnStartCallback(function () {
            SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "TOTAL WIN");
            SlotManager.Instance.bottomUIText.setWinMoney(SlotGameResultManager.Instance.winMoneyInFreespinMode);

            if (SlotGameResultManager.Instance.winMoneyInFreespinMode > 0) {
                self.stopSingleLineAction();
                SymbolAnimationController.Instance.stopAllAnimationSymbol();
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
                if (SlotManager.Instance.paylineRenderer !== null) {
                    SlotManager.Instance.paylineRenderer.clearAll();
                }

                const n = SlotGameRuleManager.Instance.getCurrentBetPerLine();
                const o = SlotManager.Instance._freespinTotalCount;
                SlotManager.Instance.setMouseDragEventFlag(false);
                SlotManager.Instance.setKeyboardEventFlag(false);

                const a = SlotGameResultManager.Instance.getSubGameState("freeSpin");
                SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).freeSpinResultPopup.open(a.totalWinningCoin, n, o, function () {
                    for (let e = 0; e < 5; e++) {
                        for (let n = SlotManager.Instance.reelMachine.reels[e], o = 0; o < 3; o++) {
                            const a = n.getComponent(Reel).getSymbol(o);
                            if (TSUtility.isValid(a.getComponent(WildSymbolComponent_LuckyBunnyDrop))) {
                                a.getComponent(WildSymbolComponent_LuckyBunnyDrop).setCount(0);
                            }
                        }
                    }
                    SlotManager.Instance.setMouseDragEventFlag(true);
                    SlotManager.Instance.setKeyboardEventFlag(true);
                    t.setDone();
                });
            } else {
                t.setDone();
            }
        });
        return t;
    }

    public getShowBigWinEffectEndFreespinState(): State {
        const self = this;
        const t = new State();
        t.addOnStartCallback(function () {
            const n = SlotGameResultManager.Instance.winMoneyInFreespinMode;
            self.stopSingleLineAction();
            SymbolAnimationController.Instance.stopAllAnimationSymbol();

            if (SlotManager.Instance.paylineRenderer !== null) {
                SlotManager.Instance.paylineRenderer.clearAll();
            }

            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);

            if (SlotGameResultManager.Instance.getWinType(n) !==SlotGameResultManager.WINSTATE_NORMAL) {
                const o = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                const a = SlotGameRuleManager.Instance.getTotalBet();
                o._isPlayExplodeCoin = false;
                o.playWinEffectWithoutIncreaseMoney(n, a, function () {
                    ServicePopupManager.instance().reserveNewRecordPopup(n);
                    t.setDone();
                });
            } else {
                t.setDone();
            }
        });
        return t;
    }

    public getFreeSpinRetriggerState(): State {
        const e = new State();
        e.addOnStartCallback(function () {
            const t = SlotGameResultManager.Instance.getSubGameState("freeSpin");
            if (t !== null) {
                if (t.totalCnt > SlotManager.Instance._freespinTotalCount) {
                    SlotManager.Instance.setKeyboardEventFlag(false);
                    SlotManager.Instance.setMouseDragEventFlag(false);
                    if (CameraControl.Instance.eStateOfCameraPosition === 1) {
                        CameraControl.Instance.scrollDownScreen(.8);
                    }

                    const n = cc.callFunc(function () {
                        SlotManager.Instance.paylineRenderer.clearAll();
                        SymbolAnimationController.Instance.stopAllAnimationSymbol();
                        const e = SlotGameResultManager.Instance.getLastHistoryWindows();
                        SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);

                        for (let t = 0; t < 5; ++t) {
                            for (let n = SlotManager.Instance.reelMachine.reels[t].getComponent(Reel), o = 0; o < 3; ++o) {
                                const a = e.GetWindow(t).getSymbol(o);
                                if (a === 51) {
                                    SymbolAnimationController.Instance.playAnimationSymbol(t, o, a, null);
                                    n.hideSymbolInRow(o);
                                }
                            }
                        }

                        SlotSoundController.Instance().playAudio("ScatterHit", "FX");
                        SlotManager.Instance.bottomUIText.setWinMoney(0);
                        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "EXTRA SPINS ADDED");
                    });

                    const o = cc.callFunc(function () {
                        SymbolAnimationController.Instance.stopAllAnimationSymbol();
                        SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
                        SlotManager.Instance.reelMachine.showAllSymbol();
                    });

                    const a = cc.callFunc(function () {
                        const n = t.totalCnt - SlotManager.Instance._freespinTotalCount;
                        SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).freeSpinRetriggerPopup.open(n, function () {
                            SlotManager.Instance._freespinTotalCount = t.totalCnt;
                            SlotManager.Instance.setFreespinExtraInfoByCurrentState();
                            e.setDone();
                        });
                    });

                    SlotManager.Instance.node.runAction(cc.sequence(cc.delayTime(.3), n, cc.delayTime(1.67), o, a));
                } else {
                    e.setDone();
                }
            }
        });
        return e;
    }

    public getCheckLockWildState(): State {
        const e = new State();
        e.addOnStartCallback(function () {
            const t = SlotGameResultManager.Instance.getSubGameState("freeSpin");
            SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).lockWild.fixWindow(t.lastWindows, function () {
                e.setDone();
            });
        });
        return e;
    }

    public getShowLockWildState(): State {
        const e = new State();
        e.addOnStartCallback(function () {
            SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).lockWild.showLockWild();
            e.setDone();
        });
        return e;
    }

    public getHideLockWildState(): State {
        const e = new State();
        e.addOnStartCallback(function () {
            SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).lockWild.hideLockWild();
            e.setDone();
        });
        return e;
    }

    public getLockAndRollStartState(): SequencialState {
        const e = new SequencialState();
        const t = SlotGameResultManager.Instance.getNextSubGameKey();
        const n = SlotGameResultManager.Instance.getSubGameState(t);

        if ((t === "lockNRollTumble" || t === "lockNRollTumble_fromFreeSpin") && n !== null) {
            const o = new State();
            o.addOnStartCallback(function () {
                SlotManager.Instance.paylineRenderer.clearAll();
                SymbolAnimationController.Instance.stopAllAnimationSymbol();

                const e = SlotGameResultManager.Instance.getLastHistoryWindows();
                const t = cc.callFunc(function () {
                    for (let t: number, n: any, o: any, a = 0; a < 5; ++a) {
                        for (let i = 0; i < 3; ++i) {
                            t = e.GetWindow(a).getSymbol(i);
                            if (t >= 90) {
                                if (t > 100) {
                                    n = JackpotSymbolInfoHelper_LuckyBunnyDrop.getSymbolInfo(t);
                                }
                                if (n.type === "jackpot") {
                                    o = n.key === "mini" ? 1 : n.key === "minor" ? 2 : n.key === "major" ? 3 : 4;
                                } else if (n.type === "multiplier") {
                                    o = 0;
                                }

                                SymbolAnimationController.Instance.playAnimationSymbol(a, i, 90, null, null, false)
                                    .getComponent(JackpotSymbolComponent_LucykyBunnyDrop)
                                    .setCenterInfo(t, o, n.multiplier);
                                SlotManager.Instance.reelMachine.reels[a].getComponent(Reel).hideSymbolInRow(i);
                            }
                        }
                    }
                    SlotSoundController.Instance().playAudio("JackpotHit", "FX");
                });

                const n = cc.callFunc(function () {
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    SlotManager.Instance.reelMachine.showAllSymbol();
                });

                const a = cc.callFunc(function () {
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
                    SlotManager.Instance._bottomUI.setBlockAutoEvent(true);
                    SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).normal_Reels.active = false;
                    SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).lockAndRoll_Reels.active = true;
                    SlotSoundController.Instance().playAudio("LNRChange", "FX");

                    const e = SlotGameResultManager.Instance.getLastHistoryWindows();
                    const t = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
                    for (let n = 0; n < 5; n++) {
                        for (let a = 0; a < 3; a++) {
                            const i = e.GetWindow(n).getSymbol(a);
                            const l = 3 * n + a;
                            const r = SlotManager.Instance.reelMachine.getComponent(ReelMachine_LuckyBunnyDrop).lockAndRoll_Reels[l].getComponent(Reel);
                            if (i >= 90) {
                                r.changeSymbol(0, i);
                                t[n][a] = i;
                            } else {
                                r.changeSymbol(0, 0);
                            }
                        }
                    }

                    SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).showLockAndRollUI();
                    SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).lockAndRoll.setFixWindow(null, t);
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "LOCK N ROLL TUMBLE TRIGGERED!");

                    const s = SlotGameResultManager.Instance.getNextSubGameKey();
                    const c = SlotGameResultManager.Instance.getSubGameState(s);
                    SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).lockAndRollStartPopup.open(c.totalCnt - 1, function () {
                        SlotSoundController.Instance().playAudio("LNR_BGM", "BGM");
                        SlotManager.Instance.setKeyboardEventFlag(true);
                        SlotManager.Instance.setMouseDragEventFlag(true);
                        SlotManager.Instance.getComponent(LuckyBunnyDropManager).sendLockAndRollRequest(function () {
                            SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).updateRemainCount();
                            o.setDone();
                        });
                    });
                });

                SlotManager.Instance.node.runAction(cc.sequence(t, cc.delayTime(2), n, a));
            });

            e.insert(0, this.getStopSingleLineActionState());
            e.insert(0, this.getStopAllSymbolAniState());
            e.insert(0, this.getScrollDown(.8));
            e.insert(1, o);
            e.insert(2, this.getLockRockAndRollMoveState());
        }

        return e;
    }

    public getCheckLockAndRollEndState(): SequencialState {
        const self = this;
        const t = new SequencialState();
        t.addOnStartCallback(function () {
            const nextKey = SlotGameResultManager.Instance.getNextSubGameKey();
            if (nextKey !== "lockNRollTumble" && nextKey !== "lockNRollTumble_fromFreeSpin") {
                const n = self.getShowLockAndRollResultState();
                t.insert(0, self.getScrollDown(.8));
                t.insert(0, n);

                const o = self.getHideLockAndRollModeUIState();
                t.insert(1, self.getShowBigWinEffectEndLockAndRollState());
                t.insert(2, o);

                let a: State | undefined;
                const currentKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                if (currentKey === "lockNRollTumble" && nextKey === "base") {
                    a = self.getChangeUIToNormalState();
                    t.insert(2, a);
                } else if (currentKey === "lockNRollTumble_fromFreeSpin" && nextKey === "freeSpin") {
                    a = self.changeUIToFreespinState();
                    t.insert(2, a);
                }
            }
        });
        return t;
    }

    public getHideLockAndRollModeUIState(): State {
        const e = new State();
        e.addOnStartCallback(function () {
            SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).hideLockAndRollUI();
            SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).lockAndRoll.init();
            SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).normal_Reels.active = true;
            SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).lockAndRoll_Reels.active = false;
            SlotManager.Instance.playMainBgm();
            e.setDone();
        });
        return e;
    }

    public getShowLockAndRollResultState(): State {
        const e = new State();
        e.addOnStartCallback(function () {
            const t = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const n = SlotGameResultManager.Instance.getSubGameState(t);
            const o = SlotGameRuleManager.Instance.getCurrentBetPerLine();
            const a = TSUtility.isValid(n.gauges.potMultiplier) ? n.gauges.potMultiplier : "1";
            const i = SlotGameResultManager.Instance.getWinningCoin();
            const l = SlotGameResultManager.Instance.getSubGameState("freeSpin");

            if (TSUtility.isValid(l)) {
                SlotManager.Instance._freespinTotalCount = l.totalCnt;
                SlotManager.Instance._freespinPastCount = 0;
                SlotManager.Instance._freespinMultiplier = l.spinMultiplier;
                SlotGameResultManager.Instance.winMoneyInFreespinMode = l.totalWinningCoin;
            }

            if (i === 0) {
                SlotManager.Instance._bottomUI.setBlockAutoEvent(false);
                e.setDone();
            } else if (a === 1) {
                SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).freeSpinResultPopup.open(SlotGameResultManager.Instance.getWinningCoin(), o, n.totalCnt - 1, function () {
                    SlotManager.Instance._bottomUI.setBlockAutoEvent(false);
                    SlotManager.Instance.applyGameResultMoneyBySubFromResult(SlotGameResultManager.Instance.getWinningCoin());
                    e.setDone();
                }, false);
            } else {
                SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).lockAndRollRewardnUI.setTotalMulti(function () {
                    const t = SlotGameResultManager.Instance.getSubGamePotResults()[0].potPrize;
                    const a = SlotGameResultManager.Instance.getSubGamePotResults()[0].winningCoin;
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(t, a, function () {
                        SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).freeSpinResultPopup.open(SlotGameResultManager.Instance.getWinningCoin(), o, n.totalCnt - 1, function () {
                            SlotManager.Instance._bottomUI.setBlockAutoEvent(false);
                            SlotManager.Instance.applyGameResultMoneyBySubFromResult(SlotGameResultManager.Instance.getWinningCoin());
                            e.setDone();
                        }, false);
                    }, null, 1);
                });
            }
        });
        return e;
    }

    public getShowBigWinEffectEndLockAndRollState(): State {
        const e = new State();
        e.addOnStartCallback(function () {
            let t = 0;
            if (SlotGameResultManager.Instance.getSubGamePotResults().length > 0) {
                t = SlotGameResultManager.Instance.getSubGamePotResults()[0].winningCoin;
                if (SlotGameResultManager.Instance.getWinType(t) !==SlotGameResultManager.WINSTATE_NORMAL) {
                    const n = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                    const o = SlotGameRuleManager.Instance.getTotalBet();
                    n._isPlayExplodeCoin = false;
                    n.playWinEffectWithoutIncreaseMoney(t, o, function () {
                        ServicePopupManager.instance().reserveNewRecordPopup(t);
                        e.setDone();
                    });
                } else {
                    e.setDone();
                }
            } else {
                e.setDone();
            }
        });
        return e;
    }

    public getLockRockAndRollState(): State {
        const e = new State();
        e.addOnStartCallback(function () {
            SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).lockAndRoll.setFixWindow(function () {
                e.setDone();
            });
        });
        return e;
    }

    public getLockRockAndRollMoveState(): State {
        const e = new State();
        e.addOnStartCallback(function () {
            SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).lockAndRoll.moveCells(function () {
                e.setDone();
            });
        });
        return e;
    }

    public getAddCountState(): State {
        const e = new State();
        e.addOnStartCallback(function () {
            SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).addRemainCount();
            e.setDone();
        });
        return e;
    }

    public getUpdateCountState(): State {
        const e = new State();
        e.addOnStartCallback(function () {
            SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).updateRemainCount();
            e.setDone();
        });
        return e;
    }

    public getFreeSpinStartFromLockAndRollState(): SequencialState {
        const self = this;
        const t = new SequencialState();
        const n = new State();

        n.addOnStartCallback(function () {
            const t = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const o = SlotGameResultManager.Instance.getNextSubGameKey();

            if (t === "lockNRollTumble" && o === "freeSpin") {
                if (CameraControl.Instance.eStateOfCameraPosition === 1) {
                    CameraControl.Instance.scrollDownScreen(.8);
                }

                const a = SlotGameResultManager.Instance.getSubGameState(o);
                self.stopSingleLineAction();
                SlotManager.Instance.paylineRenderer.clearAll();
                SymbolAnimationController.Instance.stopAllAnimationSymbol();
                SlotManager.Instance._freespinTotalCount = a.totalCnt;
                SlotManager.Instance._freespinPastCount = 0;
                SlotManager.Instance._freespinMultiplier = a.spinMultiplier;
                SlotGameResultManager.Instance.winMoneyInFreespinMode = a.totalWinningCoin;
                SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).lockWild.initComponent();

                const l = cc.callFunc(function () {
                    for (let e: number, t = 0; t < 5; ++t) {
                        for (let n = 0; n < 3; ++n) {
                            if ((e = SlotGameResultManager.Instance.getSubGameState("base").lastWindows[t][n]) === 51) {
                                SymbolAnimationController.Instance.playAnimationSymbol(t, n, e);
                                SlotManager.Instance.reelMachine.reels[t].getComponent(Reel).hideSymbolInRow(n);
                            }
                        }
                    }
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
                    SlotSoundController.Instance().playAudio("ScatterHit", "FX");
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.TriggerScatter);
                });

                const r = cc.callFunc(function () {
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                });

                const i = cc.sequence(l, cc.delayTime(2), r);
                const s = cc.callFunc(function () {
                    SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop).freeSpinStartPopup.open(SlotManager.Instance._freespinTotalCount, function () {
                        SlotManager.Instance.playMainBgm();
                        SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
                        self.changeUIToFreespin();
                        n.setDone();
                    });
                });

                SlotManager.Instance.node.runAction(cc.sequence(cc.delayTime(.3), i, s));
            } else {
                n.setDone();
            }
        });

        t.insert(0, n);
        return t;
    }

    public getFreeSpinEndFromLockAndRollState(): SequencialState {
        const self = this;
        const t = new SequencialState();
        t.addOnStartCallback(function () {
            const currentKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const nextKey = SlotGameResultManager.Instance.getNextSubGameKey();
            if (currentKey === "lockNRollTumble_fromFreeSpin" && nextKey === "base") {
                const n = self.getCheckFreespinEndState();
                t.insert(0, n);
            }
        });
        return t;
    }

    // 原代码中隐含的基础方法（保证逻辑完整）
    public isShowWinMoneyEffect(): number {
        return 1; // 原代码隐含默认值
    }

    public playIncrementEndCoinSound(): void {
        SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");
        SlotSoundController.Instance().playAudio("IncrementEndCoin", "FX");
    }

    public stopSingleLineAction(): void {
        if (this.actionSingleLine) {
            SlotManager.Instance.node.stopAction(this.actionSingleLine);
            this.actionSingleLine = null;
        }
    }

    public getStopSingleLineActionState(): State {
        const e = new State();
        e.addOnStartCallback(() => {
            this.stopSingleLineAction();
            e.setDone();
        });
        return e;
    }

    public getStopAllSymbolAniState(): State {
        const e = new State();
        e.addOnStartCallback(() => {
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            e.setDone();
        });
        return e;
    }

    public getScrollDownBeforeWinResultState(): State {
        const e = new State();
        e.addOnStartCallback(() => {
            if (CameraControl.Instance.eStateOfCameraPosition === 1) {
                CameraControl.Instance.scrollDownScreen(.8);
            }
            e.setDone();
        });
        return e;
    }

    public getScrollDown(duration: number): State {
        const e = new State();
        e.addOnStartCallback(() => {
            if (CameraControl.Instance.eStateOfCameraPosition === 1) {
                CameraControl.Instance.scrollDownScreen(duration);
            }
            e.setDone();
        });
        return e;
    }
}