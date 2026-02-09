// 导入暮光龙专属组件
import CameraControl from "../../Slot/CameraControl";
import Reel from "../../Slot/Reel";
import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../Slot/SlotSoundController";
import State, { SequencialState } from "../../Slot/State";
import SymbolAni from "../../Slot/SymbolAni";
import SymbolAnimationController from "../../Slot/SymbolAnimationController";
import BottomUIText, { BottomTextType } from "../../SubGame/BottomUIText";
import SubGameStateManager_Base from "../../SubGameStateManager_Base";
import GameComponents_Base from "../../game/GameComponents_Base";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import TSUtility from "../../global_utility/TSUtility";
import LangLocaleManager from "../../manager/LangLocaleManager";
import SlotGameResultManager, { Cell } from "../../manager/SlotGameResultManager";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";
import SlotManager from "../../manager/SlotManager";
import SoundManager from "../../manager/SoundManager";
import GameComponents_TwilightDragon from "./GameComponents_TwilightDragon";
import JackpotSymbol_TwilightDragon from "./JackpotSymbol_TwilightDragon";
import ReelMachine_TwilightDragon from "./ReelMachine_TwilightDragon";
import Symbol from "../../Slot/Symbol";

const { ccclass: ccClassDecorator } = cc._decorator;

/**
 * 暮光龙（Twilight Dragon）子游戏状态管理器
 * 严格还原原 JS 逻辑，继承自 SubGameStateManager_Base，不额外拓展方法
 */
@ccClassDecorator()
export default class SubGameStateManager_TwilightDragon extends SubGameStateManager_Base {
    // ======================================
    // 静态单例属性与方法（严格还原原 JS 单例模式）
    // ======================================
    private static _instance: SubGameStateManager_TwilightDragon | null = null;
    public static Instance(): SubGameStateManager_TwilightDragon {
        if (SubGameStateManager_TwilightDragon._instance === null) {
            SubGameStateManager_TwilightDragon._instance = new SubGameStateManager_TwilightDragon();
        }
        return SubGameStateManager_TwilightDragon._instance;
    }

    // ======================================
    // 私有属性（严格还原原 JS 内部变量）
    // ======================================
    private _leftOrbPosition: Array<[number, number]> = [];

    // ======================================
    // 构造函数（严格还原原 JS 初始化逻辑）
    // ======================================
    constructor() {
        super();
        this._leftOrbPosition = [];
    }

    // ======================================
    // 严格还原原 JS getBaseGameState 方法
    // ======================================
    getBaseGameState(): SequencialState {
        const e = this;
        const t = new SequencialState();
        let n = 0;
        const o = new SequencialState();

        o.insert(n++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        o.insert(n++, this.getStopSingleLineActionState());
        o.insert(n++, this.getStopAllSymbolAniState());
        o.insert(n++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(0));
        o.insert(n++, this.getSetWinTextAtStartSpin());
        o.insert(n++, this.getPlayReelLightState("reelSpin"));
        o.insert(n++, SlotManager.Instance.getReelSpinStartState());

        const a = new SequencialState();
        a.addOnStartCallback(function() {
            if (SlotManager.Instance.flagSpinRequest) {
                a.insert(n++, SlotManager.Instance.reelMachine.getNormalSpinReelStateRenewal());
                const t = SlotGameResultManager.Instance.getTotalWinMoney() > 0 ? "win" : "noWin";
                a.insert(n++, e.getScrollDownBeforeWinResultState());
                a.insert(n, e.getSetBGSoundOnShowWinEffectState());
                a.insert(n++, e.getShowTotalTriggeredPaylineState());
                a.insert(n++, e.getPlayReelLightState(t));

                const o = new SequencialState();
                o.insert(1, e.getStateShowTotalSymbolEffectOnPayLines());
                o.insert(2, e.getSingleLineEffectOnPaylineState());
                a.insert(n, o);
                a.insert(n, e.getSetBottomInfoIncreaseWinMoneyState());
                a.insert(n++, e.getWinMoneyState());
                a.insert(n++, e.getResetBGSoundRatioState());
                a.insert(n++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
                a.insert(n++, e.getCheckFreeSpinStartState());
            }
        });

        t.insert(0, o);
        t.insert(1, a);
        return t;
    }

    // ======================================
    // 严格还原原 JS getFreeSpinState 方法
    // ======================================
    getFreeSpinState(): SequencialState {
        const e = this;
        const t = new SequencialState();
        const n = new SequencialState();
        let o = 0;

        n.insert(o++, this.getClearLeftOrbCountState());
        n.insert(o++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        n.insert(o++, this.getStopSingleLineActionState());
        n.insert(o++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(SlotGameResultManager.Instance.winMoneyInFreespinMode, "TOTAL WIN"));
        n.insert(o++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));

        const a = SlotGameResultManager.Instance.getSubGameState("freeSpin");
        let i = false;
        if (a.getGaugesValue("isFirstSpin") > 0) {
            n.insert(o++, SlotManager.Instance.getIncreaseFreespinPastCountStateRenewal());
            n.insert(o++, SlotManager.Instance.getReelSpinStartState());
        } else {
            i = true;
            n.insert(o++, SlotManager.Instance.getSendSpinRequestState());
        }

        const l = new SequencialState();
        l.addOnStartCallback(function() {
            if (SlotManager.Instance.flagSpinRequest) {
                if (i) {
                    l.insert(o++, SlotManager.Instance.reelMachine_FreeSpin.getComponent(ReelMachine_TwilightDragon).getFreeSpinReelStateRenewal());
                }
                l.insert(o++, e.getScrollDownBeforeWinResultState());
                l.insert(o++, e.getMouseLockState(0));
                l.insert(o++, e.getApplyMultiplierState());
                l.insert(o++, e.getCollectPayoutState());
                l.insert(o++, e.getCollectOrbState());
                l.insert(o++, e.getCheckLevelUpState());
                l.insert(o++, e.getAddOverOrbsState());
                l.insert(o++, e.getAddWinMoneyToFreespinEarningPotState());
                l.insert(o++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
                l.insert(o++, e.getCheckFreespinEndState());
                l.insert(o++, e.getMouseLockState(1));
                l.insert(o++, e.getStopAllSymbolAniState());
            }
        });

        t.insert(0, n);
        t.insert(1, l);
        return t;
    }

    // ======================================
    // 严格还原原 JS getMouseLockState 方法
    // ======================================
    getMouseLockState(e: number): State {
        const t = new State();
        t.addOnStartCallback(function() {
            if (0 == e && 1 == CameraControl.Instance.eStateOfCameraPosition) {
                CameraControl.Instance.scrollDownScreen(0.8);
            }
            SlotManager.Instance.setMouseDragEventFlag(Boolean(e));
            t.setDone();
        });
        return t;
    }

    // ======================================
    // 严格还原原 JS getApplyMultiplierState 方法
    // ======================================
    getApplyMultiplierState(): SequencialState {
        const e = new SequencialState();
        e.addOnStartCallback(function() {
            const t = SlotGameResultManager.Instance.getLastHistoryWindows();
            const n = SlotGameResultManager.Instance.getSubGameState("freeSpin").spinMultiplier;

            if (n > 1 && SlotGameResultManager.Instance.getTotalWinMoney() > 0) {
                const o = new State();
                o.addOnStartCallback(function() {
                    SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinUI.applyMultiplier();
                    SlotManager.Instance.scheduleOnce(function() {
                        o.setDone();
                    }, 1.17);
                });
                e.insert(0, o);

                const a = new State();
                a.addOnStartCallback(function() {
                    SlotManager.Instance.getComponent(GameComponents_TwilightDragon).playCameraShaking();

                    for (let e = 0; e < t.size; ++e) {
                        const o = t.GetWindow(e);
                        const i = function(t: number) {
                            if (o.getSymbol(t) >= 91) {
                                const a = SlotGameResultManager.Instance.getResultSymbolInfoArray()[e][t];
                                const i = SlotManager.Instance.reelMachine_FreeSpin;
                                const l = 3 * e + t;
                                const r = i.reels[l].getComponent(Reel);

                                r.getSymbol(0).getComponent(JackpotSymbol_TwilightDragon).applyMultiplier(a, n, false);
                                SymbolAnimationController.Instance.releaseAnimationSymbol_byKey(l, 0);
                                SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinSymbolAniLayer.releaseSymbolAnimationByKey(e, t);

                                const s = SymbolAnimationController.Instance.playAnimationSymbol(l, 0, 1092, "J1_Multi", i, false);
                                s.getComponent(JackpotSymbol_TwilightDragon).setSymbolInfo(a);
                                SlotManager.Instance.scheduleOnce(function() {
                                    s.getComponent(JackpotSymbol_TwilightDragon).applyMultiplier(a, n, true);
                                }, 0.2);
                                r.getSymbol(0).active = false;
                            }
                        };

                        for (let l = 0; l < o.size; ++l) {
                            i(l);
                        }
                    }

                    SlotManager.Instance.scheduleOnce(function() {
                        a.setDone();
                    }, 1.1);
                });
                e.insert(1, a);
            }
        });
        return e;
    }

    // ======================================
    // 严格还原原 JS getCollectPayoutState 方法
    // ======================================
    getCollectPayoutState(): SequencialState {
        const e = new SequencialState();
        e.addOnStartCallback(function() {
            if (SlotGameResultManager.Instance.getTotalWinMoney() <= 0) {
                e.setDone();
            } else {
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "WIN");
                SlotManager.Instance.bottomUIText.setWinMoney(0);

                const t = SlotGameResultManager.Instance.getLastHistoryWindows();
                let n = 0;
                let o = 0;

                const a = function(a: number) {
                    const i = t.GetWindow(a);
                    const l = function(t: number) {
                        const l = i.getSymbol(t);
                        if (l >= 91) {
                            const r = SlotManager.Instance.reelMachine_FreeSpin;
                            const s = 3 * a + t;
                            let c = SlotGameResultManager.Instance.getResultSymbolInfoArray()[a][t];

                            if (192 == l || l >= 200) {
                                const u = SlotGameResultManager.Instance.getSubGameState("base");
                                c = u.lastSymbolInfoWindow[a][t];
                            }

                            const p = SlotGameResultManager.Instance.getSubGameState("freeSpin");
                            if ("jackpot" == c.type) {
                                const m = new State();
                                m.addOnStartCallback(function() {
                                    let n: any = null;
                                    const e = SlotGameResultManager.Instance.getSpinResult().jackpotResults;
                                    for (let o = 0; o < e.length; ++o) {
                                        if (a == e[o].winningCellX && t == e[o].winningCellY) {
                                            n = e[o];
                                            break;
                                        }
                                    }

                                    SymbolAnimationController.Instance.releaseAnimationSymbol_byKey(s, 0);
                                    SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinSymbolAniLayer.releaseSymbolAnimationByKey(a, t);
                                    SlotSoundController.Instance().playAudio("JackpotTrigger", "FX");

                                    const i = SymbolAnimationController.Instance.playAnimationSymbol(s, 0, 1092, "J1_Count_J", r, false);
                                    i.getComponent(JackpotSymbol_TwilightDragon).setSymbolInfo(c);
                                    i.getComponent(JackpotSymbol_TwilightDragon).applyMultiplier(c, p.spinMultiplier, false);
                                    r.reels[s].getComponent(Reel).getSymbol(0).active = false;

                                    SlotManager.Instance.scheduleOnce(function() {
                                        i.getComponent(SymbolAni).animationNode.getComponent(cc.Animation).setCurrentTime(0);
                                        i.getComponent(SymbolAni).animationNode.getComponent(cc.Animation).stop();
                                        SlotManager.Instance.getComponent(GameComponents_TwilightDragon).playHitJackpotFx(c.subID, n.jackpotSubKey, n.baseWinningCoin + n.jackpot);

                                        SlotManager.Instance.getComponent(GameComponents_TwilightDragon).jackpotResultPopup.open(
                                            n.winningCoin,
                                            n.jackpotSubKey,
                                            n.jackpotSubID,
                                            n.jackpot,
                                            p.spinMultiplier,
                                            function() {
                                                SlotManager.Instance.getComponent(GameComponents_TwilightDragon).hideJackpotFx();
                                                SlotManager.Instance.getComponent(GameComponents_TwilightDragon).setShowingMoney(n.jackpotSubKey, n.baseWinningCoin);
                                                m.setDone();
                                            }
                                        );
                                    }, 1.33);
                                });
                                e.insert(n++, m);
                            }

                            const S = new State();
                            S.addOnStartCallback(function() {
                                SymbolAnimationController.Instance.releaseAnimationSymbol_byKey(s, 0);
                                SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinSymbolAniLayer.releaseSymbolAnimationByKey(a, t);

                                const e = "jackpot" == c.type ? "J1_Count_J2" : "J1_Count";
                                const n = SymbolAnimationController.Instance.playAnimationSymbol(s, 0, 1092, e, r, false);
                                n.getComponent(JackpotSymbol_TwilightDragon).setSymbolInfo(c);
                                n.getComponent(JackpotSymbol_TwilightDragon).applyMultiplier(c, p.spinMultiplier, false);
                                r.reels[s].getComponent(Reel).getSymbol(0).active = false;

                                const i = SlotGameResultManager.Instance.getSpinResult().symbolInfoResults;
                                const l = SlotGameResultManager.Instance.getSpinResult().jackpotResults;
                                let u = 0;

                                if ("jackpot" == c.type) {
                                    for (let m = 0; m < l.length; ++m) {
                                        if (a == l[m].winningCellX && t == l[m].winningCellY) {
                                            u += l[m].winningCoin;
                                            break;
                                        }
                                    }
                                    SlotSoundController.Instance().playAudio("JackpotCalculate", "FX");
                                } else {
                                    for (let m = 0; m < i.length; ++m) {
                                        if (a == i[m].winningCellX && t == i[m].winningCellY) {
                                            u += i[m].winningCoin;
                                            break;
                                        }
                                    }
                                    SlotSoundController.Instance().playAudio("Calculate", "FX");
                                }

                                o += u;
                                SlotManager.Instance.getComponent(GameComponents_TwilightDragon).movingObjectLayer.createObjectFreeSpinPayout(a, t, "jackpot" == c.type, function() {
                                    SlotManager.Instance.bottomUIText.stopChangeWinMoney(o - u);
                                    SlotManager.Instance.bottomUIText.playChangeWinMoney(o - u, o, null, false, 1.1);
                                    SlotManager.Instance.scheduleOnce(function() {
                                        S.setDone();
                                    }, 0.8);
                                });
                            });
                            e.insert(n++, S);
                        }
                    };

                    for (let r = 0; r < i.size; ++r) {
                        l(r);
                    }
                };

                for (let i = 0; i < t.size; ++i) {
                    a(i);
                }

                const l = new State();
                l.addOnStartCallback(function() {
                    let e = 0;
                    const t = SlotGameResultManager.Instance.getSpinResult().symbolInfoResults;
                    SlotManager.Instance.getComponent(GameComponents_TwilightDragon).setPlayJackpotDisplayMoney();

                    for (let n = 0; n < t.length; ++n) {
                        e += t[n].winningCoin;
                    }

                    const o = SlotGameResultManager.Instance.getSpinResult().jackpotResults;
                    for (let n = 0; n < o.length; ++n) {
                        if (3 != o[n].jackpotSubID) {
                            e += o[n].winningCoin;
                        }
                    }

                    SlotManager.Instance.getComponent(GameComponents_TwilightDragon).movingObjectLayer.removeObject();
                    SlotManager.Instance.applyGameResultMoneyBySubFromResult(e);
                    SlotManager.Instance.bottomUIText.playCoinEffectOfWinCoinArea();

                    SlotManager.Instance.scheduleOnce(function() {
                        l.setDone();
                    }, 1);
                });
                e.insert(n++, l);
            }
        });
        return e;
    }

    // ======================================
    // 严格还原原 JS getCollectOrbState 方法
    // ======================================
    getCollectOrbState(): SequencialState {
        const e = this;
        const t = new SequencialState();

        t.addOnStartCallback(function() {
            if ("freeSpin" == SlotGameResultManager.Instance.getNextSubGameKey()) {
                const n = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                const o = SlotGameResultManager.Instance.getSubGameState(n);
                let a = o.lastSymbolInfoWindow;

                if (2 == o.getGaugesValue("isFirstSpin")) {
                    const i = SlotGameResultManager.Instance.getSubGameState("base");
                    a = i.lastSymbolInfoWindow;
                }

                const l = SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinUI._currentCount;
                const r = o.getGaugesValue("bonus");
                const s = o.lastWindows;
                let c = l;
                let u = 0;

                const p = function(n: number) {
                    const i = function(i: number) {
                        if (s[n][i] >= 91) {
                            const l = new State();
                            l.addOnStartCallback(function() {
                                if (c < 9) {
                                    const t = 3 * n + i;
                                    SymbolAnimationController.Instance.releaseAnimationSymbol_byKey(t, 0);

                                    const s = SlotManager.Instance.reelMachine_FreeSpin;
                                    const u = SymbolAnimationController.Instance.playAnimationSymbol(t, 0, 1092, "J1_Gauge", s, false);
                                    const p = a[n][i];

                                    u.getComponent(JackpotSymbol_TwilightDragon).setSymbolInfo(p);
                                    u.getComponent(JackpotSymbol_TwilightDragon).applyMultiplier(p, o.spinMultiplier, false);

                                    SlotManager.Instance.getComponent(GameComponents_TwilightDragon).movingObjectLayer.createOrbObject(n, i, c, function() {
                                        SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinUI.addOrb(r, false, l.setDone.bind(l));
                                    });
                                    c++;
                                } else {
                                    e._leftOrbPosition.push([n, i]);
                                    l.setDone();
                                }
                            });
                            t.insert(u++, l);
                        }
                    };

                    for (let l = 0; l < s[n].length; ++l) {
                        i(l);
                    }
                };

                for (let f = 0; f < s.length; ++f) {
                    p(f);
                }

                const m = new State();
                m.addOnStartCallback(function() {
                    SlotManager.Instance.scheduleOnce(function() {
                        m.setDone();
                    }, 1);
                });
                t.insert(u++, m);
            } else {
                t.setDone();
            }
        });

        return t;
    }

    // ======================================
    // 严格还原原 JS getAddOverOrbsState 方法
    // ======================================
    getAddOverOrbsState(): SequencialState {
        const e = this;
        const t = new SequencialState();

        t.addOnStartCallback(function() {
            const n = SlotGameResultManager.Instance.getNextSubGameKey();
            if (e._leftOrbPosition.length > 0 && "freeSpin" == n) {
                const o = SlotGameResultManager.Instance.getSubGameState("freeSpin");
                const a = o.lastSymbolInfoWindow;
                const i = SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinUI._currentCount;
                const l = o.getGaugesValue("bonus");
                let r = i;
                let s = 0;

                const c = function(n: number) {
                    const i = e._leftOrbPosition[n][0];
                    const c = e._leftOrbPosition[n][1];
                    const u = 3 * i + c;
                    const p = new State();

                    p.addOnStartCallback(function() {
                        SymbolAnimationController.Instance.releaseAnimationSymbol_byKey(u, 0);
                        const e = SlotManager.Instance.reelMachine_FreeSpin;
                        const t = SymbolAnimationController.Instance.playAnimationSymbol(u, 0, 1092, "J1_Gauge", e, false);
                        const n = a[i][c];

                        t.getComponent(JackpotSymbol_TwilightDragon).setSymbolInfo(n);
                        t.getComponent(JackpotSymbol_TwilightDragon).applyMultiplier(n, o.spinMultiplier, false);

                        SlotManager.Instance.getComponent(GameComponents_TwilightDragon).movingObjectLayer.createOrbObject(i, c, r, function() {
                            SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinUI.addOrb(l, false, p.setDone.bind(p));
                        });
                        r++;
                    });
                    t.insert(s++, p);
                };

                for (let u = 0; u < e._leftOrbPosition.length; ++u) {
                    c(u);
                }
            }
        });

        t.addOnEndCallback(function() {
            e._leftOrbPosition = [];
        });

        return t;
    }

    // ======================================
    // 严格还原原 JS getCheckLevelUpState 方法
    // ======================================
    getCheckLevelUpState(): SequencialState {
        const e = SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinUI.getPlayFullOrbFxState(
            function() {
                let t: any = null;
                const e = SlotGameResultManager.Instance.getSpinResult().jackpotResults;
                for (let n = 0; n < e.length; ++n) {
                    if (3 == e[n].jackpotSubID) {
                        t = e[n];
                        break;
                    }
                }
                SlotManager.Instance.getComponent(GameComponents_TwilightDragon).playHitJackpotFx(3, "mega", t.winningCoin);
            },
            function() {
                SlotManager.Instance.getComponent(GameComponents_TwilightDragon).hideJackpotFx();
            }
        );

        e.addOnStartCallback(function() {
            const e = SlotGameResultManager.Instance.getSubGameState("freeSpin");
            SlotManager.Instance._freespinTotalCount = e.totalCnt - 1;
        });

        return e;
    }

    // ======================================
    // 严格还原原 JS getCheckFreeSpinStartState 方法
    // ======================================
    getCheckFreeSpinStartState(): SequencialState {
        const e = this;
        const t = new SequencialState();

        t.addOnStartCallback(function() {
            if (1 == e.isFreeSpinStart()) {
                const n = new State();
                n.addOnStartCallback(function() {
                    CameraControl.Instance.scrollDownScreen(0.5);
                    SlotManager.Instance.setMouseDragEventFlag(false);

                    SlotManager.Instance.scheduleOnce(function() {
                        SlotManager.Instance.getComponent(GameComponents_TwilightDragon).paylineController.clearAll();
                        n.setDone();
                    }, 0.5);
                });
                t.insert(0, n);

                const o = new State();
                o.addOnStartCallback(function() {
                    e.stopSingleLineAction();
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);

                    const t = SlotGameResultManager.Instance.getLastHistoryWindows();
                    SlotManager.Instance.bottomUIText.setWinText("FREESPINS TRIGGERED");
                    SlotSoundController.Instance().playAudio("ScatterTrigger", "FX");

                    const n = function(e: number) {
                        const n = t.GetWindow(e);
                        const a = function(t: number) {
                            if (n.getSymbol(t) >= 91) {
                                SlotManager.Instance.reelMachine.reels[e].getComponent(Reel).getSymbol(t).active = false;
                                const a = SymbolAnimationController.Instance.playAnimationSymbol(e, t, 91, "J1_Trigger1", SlotManager.Instance.reelMachine, false);
                                const i = SlotGameResultManager.Instance.getResultSymbolInfoArray()[e][t];

                                a.getComponent(JackpotSymbol_TwilightDragon).setSymbolInfo(i);

                                SlotManager.Instance.scheduleOnce(function() {
                                    SymbolAnimationController.Instance.releaseAnimationSymbol_byKey(e, t);
                                    SymbolAnimationController.Instance.playAnimationSymbol(e, t, 91, "J1_Trigger2", SlotManager.Instance.reelMachine, false).getComponent(JackpotSymbol_TwilightDragon).setSymbolInfo(i);
                                    SlotManager.Instance.getComponent(GameComponents_TwilightDragon).movingObjectLayer.createObject(e, t, o.setDone.bind(o));
                                }, SlotManager.Instance.timeOfSymbolEffect + 0.5);
                            }
                        };

                        for (let i = 0; i < n.size; ++i) {
                            a(i);
                        }
                    };

                    for (let a = 0; a < t.size; ++a) {
                        n(a);
                    }
                });
                t.insert(1, o);

                const a = e.getFreeSpinStartPopupState();
                t.insert(2, a);

                const i = e.getSceneChangeToFreeSpinState();
                t.insert(3, i);
            }
        });

        return t;
    }

    // ======================================
    // 严格还原原 JS getSceneChangeToFreeSpinState 方法
    // ======================================
    getSceneChangeToFreeSpinState(): State {
        const e = this;
        const t = new State();

        t.addOnStartCallback(function() {
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            SlotManager.Instance.getComponent(GameComponents_TwilightDragon).movingObjectLayer.removeObject();
            SlotSoundController.Instance().playAudio("SceneChange", "FX");

            SlotManager.Instance.scheduleOnce(function() {
                SlotManager.Instance.getComponent(GameComponents_TwilightDragon).playSceneChangeAni();
                SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinUI.initLevelInfo();
                SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinUI.playIdleFx();
                SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinUI.playRewardFx();
                e.changeUIToFreeSpin();
                e.drawLastWindow();
            }, 2);

            SlotManager.Instance.scheduleOnce(function() {
                SlotManager.Instance.getComponent(GameComponents_TwilightDragon).stopSceneChangeAni();
                SlotSoundController.Instance().playAudio("FreeSpinBGM", "BGM");
                t.setDone();
            }, 5);
        });

        return t;
    }

    // ======================================
    // 严格还原原 JS drawLastWindow 方法
    // ======================================
    drawLastWindow(): void {
        const e = SlotManager.Instance.reelMachine_FreeSpin;
        const t = SlotGameResultManager.Instance.getSubGameState("base").lastWindows;
        const n = SlotGameResultManager.Instance.getSubGameState("base").lastSymbolInfoWindow;

        for (let o = 0; o < t.length; ++o) {
            const a = t[o];
            for (let i = 0; i < a.length; ++i) {
                const l = 3 * o + i;
                const r = e.reels[l].getComponent(Reel);

                if (a[i] >= 91) {
                    r.changeSymbol(0, 91, n[o][i]);
                } else {
                    const s = [31, 32, 33, 12, 13, 14, 71, 72, 73];
                    r.changeSymbol(0, s[Math.floor(Math.random() * s.length)]);
                }
            }
        }

        SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinSymbolAniLayer.drawLastWindow();
    }

    // ======================================
    // 严格还原原 JS getFreeSpinStartPopupState 方法
    // ======================================
    getFreeSpinStartPopupState(): State {
        const e = new State();

        e.addOnStartCallback(function() {
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinStartPopup.open(e.setDone.bind(e));
        });

        e.addOnEndCallback(function() {
            SlotManager.Instance.getComponent(GameComponents_TwilightDragon).topUI.freeSpinTrigger();
            SlotManager.Instance.getComponent(GameComponents_TwilightDragon).baseBG.play("Base_BG_Trigger");
        });

        return e;
    }

    // ======================================
    // 严格还原原 JS getChangeUIToFreeSpinState 方法
    // ======================================
    getChangeUIToFreeSpinState(): State {
        const e = this;
        const t = new State();

        t.addOnStartCallback(function() {
            e.changeUIToFreeSpin();
            t.setDone();
        });

        return t;
    }

    // ======================================
    // 严格还原原 JS changeUIToFreeSpin 方法
    // ======================================
    changeUIToFreeSpin(): void {
        SlotManager.Instance.getComponent(GameComponents_TwilightDragon).changeUIToFreeSpin();

        const e = SlotGameResultManager.Instance.getNextSubGameKey();
        const t = SlotGameResultManager.Instance.getSubGameState(e);
        const n = t.totalCnt - 1;

        SlotManager.Instance._freespinTotalCount = n;
        SlotManager.Instance._freespinPastCount = t.spinCnt > 0 ? t.spinCnt - 1 : 0;
        SlotManager.Instance._freespinMultiplier = t.spinMultiplier;
        SlotGameResultManager.Instance.winMoneyInFreespinMode = t.totalWinningCoin;

        SlotManager.Instance.bottomUIText.setWinMoney(t.totalWinningCoin, "TOTAL WIN");
        SlotManager.Instance._bottomUI.showFreespinUI();
        SlotManager.Instance._bottomUI.setShowFreespinMultiplier(false);
        SlotManager.Instance.setFreespinExtraInfoByCurrentState();
        SlotReelSpinStateManager.Instance.setFreespinMode(true);
    }

    // ======================================
    // 严格还原原 JS getCheckFreespinEndState 方法
    // ======================================
    getCheckFreespinEndState(): SequencialState {
        const e = this;
        const t = new SequencialState();

        t.addOnStartCallback(function() {
            if ("base" == SlotGameResultManager.Instance.getNextSubGameKey()) {
                CameraControl.Instance.scrollDownScreen(0.8);
                t.insert(0, e.getStopSingleLineActionState());
                t.insert(3, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(SlotGameResultManager.Instance.winMoneyInFreespinMode, "TOTAL WIN"));
                t.insert(4, e.getOpenFreeSpinResultState());
                t.insert(5, e.getStopAllSymbolAniState());
                t.insert(6, e.getChangeUIToNormalState());
                t.insert(7, e.getShowBigWinEffectEndFreespinState());
            }
        });

        return t;
    }

    // ======================================
    // 严格还原原 JS getOpenFreeSpinResultState 方法
    // ======================================
    getOpenFreeSpinResultState(): State {
        const e = new State();

        e.addOnStartCallback(function() {
            const t = SlotGameResultManager.Instance.getSubGameState("freeSpin");
            const n = t.totalWinningCoin;

            if (n <= 0) {
                e.setDone();
            } else {
                const o = t.totalCnt;
                const a = t.betPerLines;

                SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinResultPopup.open(n, o - 1, a, e.setDone.bind(e));
            }
        });

        return e;
    }

    // ======================================
    // 严格还原原 JS getShowBigWinEffectEndFreespinState 方法
    // ======================================
    getShowBigWinEffectEndFreespinState(): State {
        const e = new State();

        e.addOnStartCallback(function() {
            const t = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const n = SlotGameResultManager.Instance.getSubGameState(t).totalWinningCoin;

            SlotManager.Instance.getComponent(GameComponents_TwilightDragon).paylineController.clearAll();
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);

            if (SlotGameResultManager.Instance.getWinType(n) != SlotGameResultManager.WINSTATE_NORMAL) {
                const o = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                o._isPlayExplodeCoin = false;

                o.playWinEffectWithoutIncreaseMoney(n, SlotGameRuleManager.Instance.getTotalBet(), function() {
                    e.setDone();
                    SoundManager.Instance().resetTemporarilyMainVolume();
                }, null, false);
            } else {
                e.setDone();
            }
        });

        return e;
    }

    // ======================================
    // 严格还原原 JS getChangeUIToNormalState 方法
    // ======================================
    getChangeUIToNormalState(): State {
        const e = this;
        const t = new State();

        t.addOnStartCallback(function() {
            SlotSoundController.Instance().playAudio("MainBGM", "BGM");
            e.changeUIToNormal();
            t.setDone();
        });

        return t;
    }

    // ======================================
    // 严格还原原 JS changeUIToNormal 方法
    // ======================================
    changeUIToNormal(): void {
        SlotManager.Instance.getComponent(GameComponents_TwilightDragon).changeUIToNormal();

        const e = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const t = SlotGameResultManager.Instance.getSubGameState(e);

        SlotManager.Instance.setFreespinExtraInfoByCurrentState();
        SlotReelSpinStateManager.Instance.setFreespinMode(false);
        SlotManager.Instance._bottomUI.hideFreespinUI();
        SlotGameResultManager.Instance.winMoneyInFreespinMode = 0;

        SlotManager.Instance.bottomUIText.setWinMoney(t.totalWinningCoin, "TOTAL WIN");
        SlotManager.Instance.setMouseDragEventFlag(true);
        SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinUI.removeOrb();
        SlotManager.Instance.stopAllBGM();
        SlotSoundController.Instance().playAudio("MainBGM", "BGM");
    }

    // ======================================
    // 严格还原原 JS getPlayReelLightState 方法
    // ======================================
    getPlayReelLightState(e: string): State {
        const t = new State();

        t.addOnStartCallback(function() {
            SlotManager.Instance.getComponent(GameComponents_TwilightDragon).playReelLight(e);
            t.setDone();
        });

        return t;
    }

    // ======================================
    // 严格还原原 JS isFreeSpinStart 方法
    // ======================================
    isFreeSpinStart(): number {
        const e = SlotGameResultManager.Instance.getNextSubGameKey();
        const t = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();

        return ("freeSpin" == e && "base" == t) ? 1 : 0;
    }

    // ======================================
    // 严格还原原 JS getStopAllSymbolAniState 方法
    // ======================================
    getStopAllSymbolAniState(): State {
        const e = this;
        const t = new State();

        t.addOnStartCallback(function() {
            e.checkPaylineRenderer();
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            SlotManager.Instance.getComponent(GameComponents_TwilightDragon).paylineController.clearAll();
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            SlotManager.Instance.getComponent(GameComponents_TwilightDragon).freeSpinSymbolAniLayer.releaseAllSymbolAnimation();
            SlotManager.Instance.reelMachine_FreeSpin.showAllSymbol();
            t.setDone();
        });

        return t;
    }

    // ======================================
    // 严格还原原 JS getShowTotalTriggeredPaylineState 方法
    // ======================================
    getShowTotalTriggeredPaylineState(): State {
        const e = this;
        const t = new State();

        t.addOnStartCallback(function() {
            const n = SlotGameResultManager.Instance.getSpinResult().payOutResults;

            if (null != n && n.length > 0) {
                let o = 0;
                for (let a = 0; a < n.length; ++a) {
                    if (-1 != n[a].payLine) {
                        ++o;
                    }
                }

                let i: any = null;
                let l = 0;
                const r = cc.callFunc(function() {
                    if (!(l >= n.length)) {
                        let e = n[l].payLine;
                        while (-1 == e && l != n.length - 1) {
                            e = n[++l].payLine;
                        }
                        SlotManager.Instance.getComponent(GameComponents_TwilightDragon).paylineController.showPayline(e);
                        ++l;
                    }
                }.bind(e));

                i = cc.repeat(cc.sequence(r, cc.delayTime(0.05)), o);

                const s = cc.callFunc(function() {
                    t.setDone();
                }.bind(e));

                if (null != i) {
                    SlotManager.Instance.node.runAction(cc.sequence(i, cc.delayTime(0.2), s));
                } else {
                    t.setDone();
                }
            } else {
                t.setDone();
            }
        });

        return t;
    }

    // ======================================
    // 严格还原原 JS getSingleLineEffectOnPaylineState 方法
    // ======================================
    getSingleLineEffectOnPaylineState(): State {
        const e = this;
        const t = new State();

        t.addOnStartCallback(function() {
            const n = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const o = SlotGameResultManager.Instance.getLastHistoryWindows();
            const a: any[] = [];

            if (SlotGameResultManager.Instance.getWinType() == SlotGameResultManager.WINSTATE_NORMAL) {
                if (null == n || 0 == n.length) {
                    return void t.setDone();
                }
                if (SlotReelSpinStateManager.Instance.getAutospinMode() || SlotReelSpinStateManager.Instance.getFreespinMode() || SlotGameResultManager.Instance.getWinningCoinBySymbolId(51) > 0) {
                    return void t.setDone();
                }
            }

            let i = 0;
            let c = 0;
            for (let u = 0; u < n.length; ++u) {
                ++c;
            }

            if (0 != c) {
                let p = false;
                const m = cc.callFunc(function() {
                    const e = n[i].payLine;
                    SlotManager.Instance.getComponent(GameComponents_TwilightDragon).paylineController.clearAll();
                    SlotManager.Instance.getComponent(GameComponents_TwilightDragon).paylineController.showPayline(e);

                    if (n.length > 1) {
                        SlotSoundController.Instance().playAudio("ShowPayline", "FX");
                    } else if (1 == n.length && !p) {
                        SlotSoundController.Instance().playAudio("ShowPayline", "FX");
                        p = true;
                    }

                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    const t: number[] = [];
                    a.length = 0;

                    for (let u = 0; u < n[i].winningCell.length; ++u) {
                        const m = new Cell(n[i].winningCell[u][1], n[i].winningCell[u][0]);
                        a.push(m);
                    }

                    for (let S = 0; S < a.length; ++S) {
                        let g: number | null = null;
                        const _ = a[S];
                        g = o.GetWindow(_.col).getSymbol(_.row);

                        if (g !== null) {
                            SymbolAnimationController.Instance.playAnimationSymbol(_.col, _.row, g);
                            t.push(g);
                            SlotManager.Instance.reelMachine.reels[_.col].getComponent(Reel).hideSymbolInRow(_.row);
                        }
                    }

                    if (c > 1) {
                        const b = SlotGameResultManager.Instance.getTotalWinMoney();
                        const C = n[i].payLine;
                        const I = n[i].winningCoin;
                        const M = LangLocaleManager.getInstance().getLocalizedText("LINE ${0} PAYS ${1}");
                        const P = TSUtility.strFormat(M.text, (C + 1).toString(), CurrencyFormatHelper.formatNumber(I));

                        SlotManager.Instance.bottomUIText.setWinMoney(b, P);
                    }

                    this.showSinglePaylineInfoForLines(e + 1, n[i].winningCoin, n[i].payOut.symbols);
                    i = (i + 1) % n.length;
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
                }.bind(e));

                e.stopSingleLineAction();
                e.actionSingleLine = cc.repeatForever(cc.sequence(m, cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect)));
                SlotManager.Instance.node.runAction(e.actionSingleLine!);
                t.setDone();
            } else {
                t.setDone();
            }
        });

        return t;
    }

    // ======================================
    // 严格还原原 JS getSetWinTextAtStartSpin 方法
    // ======================================
    getSetWinTextAtStartSpin(): State {
        const e = new State();

        e.addOnStartCallback(function() {
            SlotManager.Instance.bottomUIText.setWinText(SlotManager.Instance.getReelSpinStartText());
            e.setDone();
        });

        return e;
    }

    // ======================================
    // 严格还原原 JS getStateShowTotalSymbolEffectOnPayLines 方法
    // ======================================
    getStateShowTotalSymbolEffectOnPayLines(): State {
        const e = this;
        const t = new State();

        t.addOnStartCallback(function() {
            const n = SlotGameResultManager.Instance.getTotalWinMoney();
            const o = SlotGameRuleManager.Instance.getTotalBet();
            const a = n > 3 * o ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2 : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

            if (e.showTotalSymbolEffectOnPaylines()) {
                SlotManager.Instance.scheduleOnce(function() {
                    if (SlotGameResultManager.Instance.getWinType(n) != SlotGameResultManager.WINSTATE_NORMAL && SlotReelSpinStateManager.Instance.getAutospinMode()) {
                        SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    }
                    e.setDimmDeActiveTotalSymbolOnPaylines();
                    t.setDone();
                }, a);
            } else {
                t.setDone();
            }
        });

        return t;
    }

    // ======================================
    // 严格还原原 JS setDimmDeActiveTotalSymbolOnPaylines 方法
    // ======================================
    setDimmDeActiveTotalSymbolOnPaylines(): void {
        const e = SlotGameResultManager.Instance.getSpinResult().payOutResults;
        const t: Cell[] = [];

        if (null != e && e.length > 0) {
            const o = function(e: Cell): boolean {
                for (let n = 0; n < t.length; ++n) {
                    if (e.col == t[n].col && e.row == t[n].row) {
                        return true;
                    }
                }
                return false;
            };

            for (let a = 0; a < e.length; ++a) {
                for (let i = 0; i < e[a].winningCell.length; ++i) {
                    const l = new Cell(e[a].winningCell[i][1], e[a].winningCell[i][0]);
                    if (!o(l)) {
                        t.push(l);
                    }
                }
            }

            t.sort(function(e, t) {
                return e.row > t.row ? 1 : -1;
            });

            for (let a = 0; a < t.length; ++a) {
                const r = t[a];
                const n = SlotManager.Instance.reelMachine.reels[r.col].getComponent(Reel);
                n.showSymbolInRow(r.row);
                var symNode = n.getSymbol(r.row)
                var sym = symNode.getComponent(Symbol);
                sym.setDimmActive(false);
            }
        }
    }

    // ======================================
    // 严格还原原 JS getClearLeftOrbCountState 方法
    // ======================================
    getClearLeftOrbCountState(): State {
        const e = this;
        const t = new State();

        t.addOnStartCallback(function() {
            e._leftOrbPosition = [];
            t.setDone();
        });

        return t;
    }
}