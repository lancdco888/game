
import JackpotSymbolComponent_BeeLovedJars from './Component/JackpotSymbolComponent_BeeLovedJars';
import LockComponent_BeeLovedJars from './Component/LockComponent_BeeLovedJars';
import Reel_BeeLovedJars from './Reel_BeeLovedJars';
import ReelMachine_BeeLovedJars from './ReelMachine_BeeLovedJars';
import BeeLovedJarsManager, { EventBus } from './BeeLovedJarsManager';
import ReelController_Base from '../../ReelController_Base';
import SlotSoundController from '../../Slot/SlotSoundController';
import Reel from '../../Slot/Reel';
import SlotManager, { SpecialSymbolInfo, SpecialType } from '../../manager/SlotManager';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import TSUtility from '../../global_utility/TSUtility';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import State, { SequencialState } from '../../Slot/State';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotUIRuleManager from '../../Slot/rule/SlotUIRuleManager';
import ReelSpinBehaviors, { EasingInfo } from '../../ReelSpinBehaviors';
import SoundManager from '../../manager/SoundManager';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import { Window } from '../../manager/SlotGameRuleManager';

const { ccclass, property } = cc._decorator;

@ccclass("ReelController_BeeLovedJars")
export default class ReelController_BeeLovedJars extends ReelController_Base {
    @property
    lockNRoll_Reel: boolean = false;

    // 保持原变量命名和初始值
    lockNRollDummySymboList: number[] = [0, 90, 0, 0];
    noWildDummy: number[] = [14, 12, 13, 21, 22, 31, 32, 33, 90];
    noJackpotDummy: number[] = [14, 12, 13, 21, 22, 31, 32, 33, 71];
    freeSpinDummy: number[] = [21, 22, 31, 32, 33];
    dummySymbolList!: number[];

    onLoad() {
        const self = this;
        this.dummySymbolList = [14, 12, 13, 21, 22, 31, 32, 33, 71, 90];
        this.easingFuncListOnSpinEnd.push(function () {
            self.playReelStopSound();
            SlotSoundController.Instance().stopAudio("ReelExpect", "FX");
        });
    }

    playReelStopSound() {
        const reelComp = this.node.getComponent(Reel);
        if (this.lockNRoll_Reel) {
            if (!(0 != SlotManager.Instance.isSkipCurrentSpin && reelComp.reelindex != SlotManager.Instance.reelMachine.getComponent(ReelMachine_BeeLovedJars).getLastLockNRollReelIndex())) {
                SlotSoundController.Instance().playAudio("ReelStop", "FX");
            }
        } else {
            if (!(0 != SlotManager.Instance.isSkipCurrentSpin && reelComp.reelindex != SlotManager.Instance.reelMachine.reels.length - 1)) {
                SlotSoundController.Instance().playAudio("ReelStop", "FX");
            }
        }
    }

    processSpinEnd(callback: Function | null) {
        if (this.lockNRoll_Reel) {
            const reelIndex = this.node.getComponent(Reel).reelindex;
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            const o = Math.floor(reelIndex / 3);
            const a = Math.floor(reelIndex % 3);

            if (TSUtility.isValid(lastHistoryWindows)) {
                const symbol = lastHistoryWindows.GetWindow(o).getSymbol(a);
                if (9 == Math.floor(symbol / 10)) {
                    this.node.active = false;
                }
            }
        }
        if (TSUtility.isValid(callback)) {
            callback!();
        }
    }

    checkAppearSymbol() {
        const reelComp = this.node.getComponent(Reel_BeeLovedJars);
        let t = false;
        let n = false;
        const historyWindow = SlotGameResultManager.Instance.getHistoryWindows().length > 1 
            ? SlotGameResultManager.Instance.getHistoryWindow(0).GetWindow(reelComp.reelindex) 
            : SlotGameResultManager.Instance.getLastHistoryWindows().GetWindow(reelComp.reelindex);

        if (TSUtility.isValid(historyWindow)) {
            for (let a = 0; a < historyWindow.size; ++a) {
                const symbol = historyWindow.getSymbol(a);
                if (10 == Math.floor(symbol / 9)) {
                    const r = reelComp.reelindex;
                    const s = a;
                    const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[r][s];
                    
                    SymbolAnimationController.Instance.playAnimationSymbolAbsoluteCoordinate(reelComp.reelindex, a, symbol + 100)
                        .getComponent(JackpotSymbolComponent_BeeLovedJars).setInfo(symbolInfo);
                    reelComp.hideSymbolInRowForAppear(a);
                    n = true;
                }

                if (71 == symbol) {
                    SymbolAnimationController.Instance.playAnimationSymbolAbsoluteCoordinate(reelComp.reelindex, a, symbol + 100);
                    reelComp.hideSymbolInRowForAppear(a);
                    EventBus.emit("movePot", reelComp.reelindex, a);
                    t = true;
                }
            }

            if (n) {
                SlotSoundController.Instance().stopAudio("JackpotAppear", "FX");
                SlotSoundController.Instance().playAudio("JackpotAppear", "FX");
            }
            if (t) {
                SlotSoundController.Instance().playAudio("WildAppear", "FX");
            }
        }
        SymbolAnimationController.Instance.resetZorderSymbolAnimation();
    }

    checkAppearFreeSpinSymbol() {
        const reelComp = this.node.getComponent(Reel_BeeLovedJars);
        let t = false;
        const historyWindow = SlotGameResultManager.Instance.getHistoryWindows().length > 1 
            ? SlotGameResultManager.Instance.getHistoryWindow(0).GetWindow(reelComp.reelindex) 
            : SlotGameResultManager.Instance.getLastHistoryWindows().GetWindow(reelComp.reelindex);

        if (TSUtility.isValid(historyWindow)) {
            for (let o = 0; o < historyWindow.size; ++o) {
                const symbol = historyWindow.getSymbol(o);
                if (92 == symbol) {
                    const i = reelComp.reelindex;
                    const r = o;
                    const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[i][r];
                    
                    SymbolAnimationController.Instance.playAnimationSymbolAbsoluteCoordinate(reelComp.reelindex, o, symbol + 300)
                        .getComponent(JackpotSymbolComponent_BeeLovedJars).setInfo(symbolInfo);
                    reelComp.getSymbol(o).getComponent(JackpotSymbolComponent_BeeLovedJars).setInfo(symbolInfo);
                    reelComp.hideSymbolInRowForAppear(o);
                    t = true;
                }
            }
            if (t) {
                SlotSoundController.Instance().playAudio("Jackpot2Appear", "FX");
            }
        }
    }

    checkAppeSymbol_LockNRoll() {
        const reelIndex = this.node.getComponent(Reel).reelindex;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const n = Math.floor(reelIndex / 3);
        const o = Math.floor(reelIndex % 3);
        const historyWindows = SlotGameResultManager.Instance.getHistoryWindows();

        if (TSUtility.isValid(lastHistoryWindows)) {
            let symbol = lastHistoryWindows.GetWindow(n).getSymbol(o);
            if (9 == Math.floor(symbol / 10)) {
                for (let s = 0; s < historyWindows.length; s++) {
                    if (96 == historyWindows[s].GetWindow(n).getSymbol(o)) {
                        symbol = 96;
                        break;
                    }
                }
                BeeLovedJarsManager.getInstance().game_components.lockComponent.getComponent(LockComponent_BeeLovedJars)
                    .setAppearSymbol(n, o, symbol);
            }
        }
    }

    getSpinExcludePreSpinUsingSpinRequestTimeState(e: any = null, t: any = null) {
        const self = this;
        const seqState = new SequencialState();
        
        if (!this.node.active) {
            return seqState;
        }

        let a: any, i: any, l = 0;
        const reelComp = this.node.getComponent(Reel);
        
        a = null != e ? e : SlotGameResultManager.Instance.getReelStopWindows();
        i = null != t && null != t ? t : SlotManager.Instance.reelMachine;

        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelComp.reelindex];
        
        const reelSpinState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReelRenewal(i.reels, reelComp, reelStrip, subGameKey);
        reelSpinState.flagSkipActive = true;
        reelSpinState.addOnStartCallback(function () {
            reelComp.setShaderValue("blurOffset", 0.02);
        });
        seqState.insert(l++, reelSpinState);

        const reelRenewalState = this.getReelSpinStateCurrentReelRenewal(i.reels, reelComp, reelStrip, subGameKey);
        reelRenewalState.flagSkipActive = true;
        seqState.insert(l++, reelRenewalState);

        let C: any = void 0, v: any = void 0, I: any = void 0, R: any = void 0;
        if (null != spinControlInfo) {
            C = spinControlInfo.postEasingType;
            v = spinControlInfo.postEasingRate;
            I = spinControlInfo.postEasingDuration;
            R = spinControlInfo.postEasingDistance;
        }

        const symbolList = this.getResultSymbolList(a.GetWindow(reelComp.reelindex), reelComp);
        const symbolInfoList = this.getResultSymbolInfoList(a.GetWindow(reelComp.reelindex), reelComp);
        const specialSymbolInfoList = this.getResultSpecialSymbolInfoList(a.GetWindow(reelComp.reelindex), reelComp);
        
        let A: any = void 0;
        const easingInfo = new EasingInfo();
        easingInfo.easingType = C;
        easingInfo.easingDistance = R;
        easingInfo.easingDuration = I;
        easingInfo.easingRate = v;
        easingInfo.onEasingStartFuncList.push(function () {
            self.setShowExpectEffects(false);
        });
        
        this.addEasingFuncListOnStopEasing(easingInfo);
        A = this.getReelMoveStateWithLastSymbolList(reelComp, symbolList, subGameKey, easingInfo, symbolInfoList, specialSymbolInfoList);
        A.addOnEndCallback(function () {
            if (4 == reelComp.reelindex) {
                SlotManager.Instance.stopReelSpinSound();
            }
        });
        seqState.insert(l++, A);

        const T = new State();
        T.addOnStartCallback(function () {
            reelComp.resetPositionOfReelComponents();
            reelComp.setShaderValue("blurOffset", 0);
            
            if (i.reels.length - 1 == reelComp.reelindex) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }
            
            SlotManager.Instance.setPlayReelExpectEffectState(reelComp.reelindex + 1);
            self.processSpinEnd(T.setDone.bind(T));
        });
        seqState.insert(l++, T);
        
        return seqState;
    }

    getReelSpinStateCurrentReelRenewal(e: any, t: any, n: any, o: any) {
        const self = this;
        const state = new State();
        const reelStrip = n.getReel(t.reelindex);
        let action: any = null;

        state.addOnStartCallback(function () {
            let spinTime: number, speed: number, symbolCount: number, p: number, d: number;
            
            t.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            reelStrip.checkBlankSymbolAndControlNextSymbolIndex(t);
            
            if (null != o && null != o) {
                const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(o).infoList[t.reelindex];
                p = spinControlInfo.oneSymbolMoveSpeed;
                d = spinControlInfo.maxSpeedInExpectEffect;
            }

            const spinRequestTime = SlotManager.Instance.getTimeSecSpinRequest();
            spinTime = t.getReelSpinTimeRenewal(e, spinRequestTime, o);
            speed = SlotUIRuleManager.Instance.getExpectEffectFlag(t.reelindex, SlotGameResultManager.Instance.getVisibleSlotWindows()) ? d : p;
            symbolCount = Math.floor(spinTime / speed);

            const moveAction = cc.moveBy(spinTime, new cc.Vec2(0, -symbolCount * t.symbolHeight));
            t.setNextSymbolIdCallback(function () {
                const symbolId = reelStrip.getNextSymbolId();
                reelStrip.increaseNextSymbolIndex();
                return symbolId;
            });

            action = t.node.runAction(cc.sequence(moveAction, cc.callFunc(state.setDone.bind(state))));
        });

        state.addOnEndCallback(function () {
            if (!(null == action || action.isDone())) {
                t.node.stopAction(action);
            }
            t.update(null);

            const lastReelIndex = self.lockNRoll_Reel 
                ? SlotManager.Instance.reelMachine.getComponent(ReelMachine_BeeLovedJars).getLastLockNRollReelIndex() 
                : SlotManager.Instance.reelMachine.reels.length - 1;

            if (!self.lockNRoll_Reel && t.reelindex == lastReelIndex) {
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE);
            }
        });

        return state;
    }

    getReelMoveStateWithLastSymbolList(e: any, t: any, n: any, o: any, a: any = null, i: any = null) {
        const seqState = new SequencialState();
        let r = 0;
        
        seqState.insert(r++, this.getReelMoveStateWithLastSymbolListNew(e, t, n, o, a, i));
        seqState.insert(r++, this.getSpinEndEventState());
        
        return seqState;
    }

    getReelMoveStateWithLastSymbolListNew(e: any, t: any, n: any, o: any, a: any = null, i: any = null) {
        const self = this;
        const state = new State();
        let action: any = null;
        let d = 0, m = 0, S = 0, symbolHeight = 0, moveSpeed = 0;

        if (null != n && null != n) {
            const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(n).infoList[e.reelindex];
            symbolHeight = spinControlInfo.symbolHeight;
            moveSpeed = spinControlInfo.oneSymbolMoveSpeed;
            spinControlInfo.maxSpeedInExpectEffect;
        }

        state.addOnStartCallback(function () {
            e.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            
            const lastSymbol = e.getLastSymbol();
            const symbolY = e.getPositionY(lastSymbol.node.y);
            const bufferHeight = e.bufferRow * symbolHeight;

            let moveDistance: number, easingDistance: number;
            if (null != o && null != o) {
                moveDistance = symbolY + (t.length * symbolHeight - o.easingDistance) - bufferHeight;
                easingDistance = o.easingDistance;
            } else {
                moveDistance = symbolY + t.length * symbolHeight - bufferHeight;
            }

            const moveTime = Math.abs(moveSpeed * (moveDistance / symbolHeight));

            e.setNextSymbolIdCallback(function () {
                const symbolId = t[d];
                if (t.length <= d) {
                    return void 0;
                } else {
                    t[d];
                    ++d;
                    return symbolId;
                }
            });

            e.setNextSymbolInfoCallback(function () {
                let info = null;
                if (null != a && a.length > m) {
                    info = a[m];
                    ++m;
                }
                return info;
            });

            e.setNextSpecialInfoCallback(function () {
                let specialInfo = new SpecialSymbolInfo(0);
                if (null != i && i.length > S) {
                    specialInfo = i[S];
                    ++S;
                }
                return specialInfo;
            });

            const moveAction = cc.moveBy(moveTime, new cc.Vec2(0, -moveDistance));
            let easingAction: any = null;

            if (null != o && null != o) {
                const easeFunc = ReelSpinBehaviors.Instance.getEaseAction(o.easingType, o.easingRate);
                easingAction = cc.moveBy(o.easingDuration, new cc.Vec2(0, -easingDistance)).easing(easeFunc);
            }

            const checkSymbolCall = cc.callFunc(function () {
                const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                if ("base" == subGameKey) {
                    self.checkAppearSymbol();
                } else if ("freeSpin" == subGameKey) {
                    self.checkAppearFreeSpinSymbol();
                } else {
                    self.checkAppeSymbol_LockNRoll();
                }
            });

            const doneCall = cc.callFunc(function () {
                state.setDone();
                if ("base" == SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult()) {
                    self.node.getComponent(Reel).resetAllSiblingIndex();
                    self.node.getComponent(Reel).onOverSizeSortFunction();
                }
            });

            if (null == easingAction) {
                action = e.node.runAction(cc.sequence(moveAction, doneCall));
            } else if (0 != o.onEasingStartFuncList.length) {
                const easingStartCall = cc.callFunc(function () {
                    for (let idx = 0; idx < o.onEasingStartFuncList.length; ++idx) {
                        o.onEasingStartFuncList[idx]();
                    }
                });
                action = e.node.runAction(cc.sequence([moveAction, easingStartCall, checkSymbolCall, easingAction, doneCall]));
            } else {
                action = e.node.runAction(cc.sequence([moveAction, checkSymbolCall, easingAction, doneCall]));
            }
        });

        state.addOnEndCallback(function () {
            e.node.stopAction(action);
            while (d < t.length) {
                if (d < t.length) {
                    const symbolId = t[d];
                    if (null != a && a.length > m) {
                        a[m];
                    }
                    e.pushSymbolAtTopOfReel(symbolId, null);
                } else {
                    cc.error("invalid status tweenAction ");
                }
                ++d;
                ++m;
            }

            e.resetPositionOfReelComponents();
            if ("base" == SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult()) {
                e.processAfterStopSpin();
            }
        });

        return state;
    }

    getInfiniteSpinUsingNextSubGameKeyState_Base() {
        SlotGameResultManager.Instance.getNextSubGameKey();
        return ReelSpinBehaviors.Instance.getInfiniteSpinStatePreResponseResult(this.node.getComponent(Reel), "base");
    }

    getLockAndRollState() {
        const self = this;
        const seqState = new SequencialState();
        
        if (!this.node.active) {
            return seqState;
        }

        let n = 0;
        const reelComp = this.node.getComponent(Reel);
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const lastWindows = SlotGameResultManager.Instance.getSubGameState(subGameKey).lastWindows;
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelComp.reelindex];
        const lockNRollReels = SlotManager.Instance.reelMachine.getComponent(ReelMachine_BeeLovedJars).lockNRoll_Reels;

        const reelSpinState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReelRenewal(lockNRollReels, reelComp, reelStrip, subGameKey);
        reelSpinState.flagSkipActive = true;
        reelSpinState.addOnStartCallback(function () {
            reelComp.setShaderValue("blurOffset", 0.02);
        });
        seqState.insert(n++, reelSpinState);

        const reelRenewalState = this.getReelSpinStateCurrentReelRenewal(lockNRollReels, reelComp, reelStrip, subGameKey);
        reelRenewalState.flagSkipActive = true;
        seqState.insert(n++, reelRenewalState);

        let _: any = void 0, b: any = void 0, C: any = void 0, I: any = void 0;
        if (null != spinControlInfo) {
            _ = spinControlInfo.postEasingType;
            b = spinControlInfo.postEasingRate;
            C = spinControlInfo.postEasingDuration;
            I = spinControlInfo.postEasingDistance;
        }

        const lockAndRollWindow = this.getLockAndRollResultWindow(lastWindows, reelComp.reelindex);
        const symbolList = this.getResultSymbolListLockNRoll(lockAndRollWindow, reelComp);
        const symbolInfoList = this.getResultSymbolInfoListLockAndRoll(lockAndRollWindow, reelComp.reelindex);
        
        let O: any = void 0;
        const easingInfo = new EasingInfo();
        easingInfo.easingType = _;
        easingInfo.easingDistance = I;
        easingInfo.easingDuration = C;
        easingInfo.easingRate = b;
        easingInfo.onEasingStartFuncList.push(function () { });
        
        this.addEasingFuncListOnStopEasing(easingInfo);
        O = this.getReelMoveStateWithLastSymbolListNew(reelComp, symbolList, subGameKey, easingInfo, symbolInfoList);
        O.addOnEndCallback(function () { });
        seqState.insert(n++, O);

        const w = new State();
        w.addOnStartCallback(function () {
            reelComp.resetPositionOfReelComponents();
            self.processSpinEnd(w.setDone.bind(w));
        });
        seqState.insert(n++, w);
        
        return seqState;
    }

    getLockAndRollResultWindow(e: any, t: number) {
        const window = new Window(3);
        const o = Math.floor(t / 3);
        const a = Math.floor(t % 3);
        const symbol = e[o][a];

        window.setSymbol(0, this.lockNRollDummySymboList[Math.floor(Math.random() * this.lockNRollDummySymboList.length)]);
        window.setSymbol(1, symbol);
        window.setSymbol(2, this.lockNRollDummySymboList[Math.floor(Math.random() * this.lockNRollDummySymboList.length)]);
        
        return window;
    }

    getResultSymbolListLockNRoll(e: any, t: any) {
        const symbolList = new Array<number>();
        let o = 0;

        if (e.size < t.visibleRow + 2 * t.bufferRow) {
            o = (t.visibleRow + 2 * t.bufferRow - e.size) / 2;
        }

        for (let a = e.size - 1; a >= 0; --a) {
            symbolList.push(e.getSymbol(a));
        }
        
        symbolList.length;
        for (let i = 0; i < o; ++i) {
            symbolList.push(this.lockNRollDummySymboList[Math.floor(Math.random() * this.lockNRollDummySymboList.length)]);
        }

        return symbolList;
    }

    getResultSymbolInfoListLockAndRoll(e: any, t: number) {
        let symbolInfoList: any = null;
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
        const i = Math.floor(t / 3);
        const l = Math.floor(t % 3);
        const symbolInfoWindow = subGameState.lastSymbolInfoWindow;

        if (null != symbolInfoWindow && null != symbolInfoWindow[i] && null != symbolInfoWindow[i][l]) {
            symbolInfoList = new Array<any>();
            for (let s = 0; s < 3; s++) {
                if (1 == s) {
                    const info = subGameState.lastSymbolInfoWindow[i][l];
                    symbolInfoList.push(info);
                } else {
                    symbolInfoList.push(null);
                }
            }
        }

        return symbolInfoList;
    }

    getResultSymbolList(e: any, t: any) {
        const symbolList = new Array<number>();
        let hasWild = false, hasJackpot = false;

        for (let i = e.size - 1; i >= 0; --i) {
            const symbol = e.getSymbol(i);
            if (90 == symbol) {
                hasWild = true;
                break;
            }
            if (71 == symbol) {
                hasJackpot = true;
                break;
            }
        }

        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const r = "freeSpin" == subGameKey ? this.freeSpinDummy : this.noWildDummy;
        const s = "freeSpin" == subGameKey 
            ? this.freeSpinDummy 
            : (hasWild ? this.noJackpotDummy : (hasJackpot ? this.noWildDummy : this.dummySymbolList));
        
        let c = 0;
        if (e.size < t.visibleRow + 2 * t.bufferRow) {
            c = (t.visibleRow + 2 * t.bufferRow - e.size) / 2;
        }

        const randomFlag = Math.random() < 0.5;
        let f = true;
        
        if (0 != t.reelindex && 4 != t.reelindex) {
            // do nothing
        } else {
            f = false;
        }

        if (f && e.getSymbol(e.size - 1) < 20 && randomFlag) {
            symbolList.push(s[Math.floor(Math.random() * s.length)]);
        } else {
            symbolList.push(r[Math.floor(Math.random() * r.length)]);
        }

        for (let i = e.size - 1; i >= 0; --i) {
            symbolList.push(e.getSymbol(i));
        }

        for (let d = 0; d < c; ++d) {
            if (f && !randomFlag && e.getSymbol(0) < 20) {
                symbolList.push(s[Math.floor(Math.random() * s.length)]);
            } else {
                symbolList.push(r[Math.floor(Math.random() * r.length)]);
            }
        }

        return symbolList;
    }

    getResultSymbolInfoList(e: any, t: any) {
        let symbolInfoList: any = null;
        
        if (null != SlotGameResultManager.Instance._gameResult.spinResult.symbolInfoWindow 
            && null != SlotGameResultManager.Instance._gameResult.spinResult.symbolInfoWindow[t.reelindex]) {
            
            symbolInfoList = new Array<any>();
            const infoWindow = SlotGameResultManager.Instance._gameResult.spinResult.symbolInfoWindow[t.reelindex];
            
            symbolInfoList.push(null);
            if (e.size >= SlotGameResultManager.Instance._gameResult.spinResult.symbolInfoWindow[t.reelindex].length) {
                const a = e.size - SlotGameResultManager.Instance._gameResult.spinResult.symbolInfoWindow[t.reelindex].length;
                for (let i = 0; i < a / 2; ++i) {
                    symbolInfoList.push(null);
                }
                for (let i = infoWindow.length - 1; i >= 0; --i) {
                    symbolInfoList.push(infoWindow[i]);
                }
            }
        }

        return symbolInfoList;
    }

    getResultSpecialSymbolInfoList(e: any, t: any) {
        const specialInfoList: any[] = [];
        let o = 0;

        if (e.size < t.visibleRow + 2 * t.bufferRow) {
            o = (t.visibleRow + 2 * t.bufferRow - e.size) / 2;
        }

        specialInfoList.push(new SpecialSymbolInfo(SpecialType.NONE));
        
        const windowRange = SlotManager.Instance.getWindowRange();
        for (let i = e.size - 1; i >= 0; --i) {
            if (TSUtility.isValid(windowRange[t.reelindex])) {
                let specialType = SpecialType.NONE;
                if (windowRange[t.reelindex][0] <= i && i < windowRange[t.reelindex][1] 
                    && SlotManager.Instance.isCheckSpecialInfo(SpecialType.FEVER, t.reelindex, i)) {
                    
                    specialType |= SpecialType.FEVER;
                }
                specialInfoList.push(new SpecialSymbolInfo(specialType));
            } else {
                specialInfoList.push(new SpecialSymbolInfo(SpecialType.NONE));
            }
        }

        for (let s = 0; s < o; ++s) {
            specialInfoList.push(new SpecialSymbolInfo(SpecialType.NONE));
        }

        return specialInfoList;
    }
}