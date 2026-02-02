import ReelController_Base from "../../ReelController_Base";
import ReelSpinBehaviors, { EasingInfo } from "../../ReelSpinBehaviors";
import Reel from "../../Slot/Reel";
import SlotSoundController from "../../Slot/SlotSoundController";
import State, { SequencialState } from "../../Slot/State";
import SymbolAnimationController from "../../Slot/SymbolAnimationController";
import SlotUIRuleManager from "../../Slot/rule/SlotUIRuleManager";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";
import SlotManager from "../../manager/SlotManager";

const { ccclass, property } = cc._decorator;

/**
 * Reel Controller for Super25Deluxe Extra Spins
 * Extends base reel controller with game-specific logic
 */
@ccclass()
export default class ReelControllerExtra_Super25Deluxe extends ReelController_Base {
    // Dummy symbols for reel spin transitions
    private _dummySymbols: number[] = [72,73,74,75,76,77];

    /**
     * Initialize reel settings on load
     */
    onLoad() {
        super.onLoad();

        // Add dummy symbols to base class list
        this.dummySymbolList.push(...[72,73,74,75,76,77]);

        // Add easing function for spin end
        this.easingFuncListOnSpinEnd.push(() => {
            const reel = this.node.getComponent(Reel);
            if (!reel) return;

            this.playReelStopSound();

            // Stop all reel spin sounds when last reel stops
            if (reel.reelindex ===4) {
                this.node.runAction(cc.sequence(
                    cc.delayTime(0.26),
                    cc.callFunc(() => {
                        SlotSoundController.Instance().stopAudio("ReelSpin_0", "FXLoop");
                        SlotSoundController.Instance().stopAudio("ReelSpin_1", "FXLoop");
                        SlotSoundController.Instance().stopAudio("ReelSpin_2", "FXLoop");
                        SlotSoundController.Instance().stopAudio("ReelExpect", "FX");
                    })
                ));
            }

            reel.setShaderValue("blurOffset",0);
        });
    }

    /**
     * Process post-spin logic (symbol animations, sound)
     * @param callback Callback to trigger after processing
     */
    processSpinEnd(callback: () => void) {
        const reel = this.node.getComponent(Reel);
        if (!reel) { callback(); return; }

        const visibleWindow = SlotGameResultManager.Instance.getVisibleSlotWindows().GetWindow(reel.reelindex);
        const animNodes: cc.Node[] = [];
        let hasJackpotSymbol = false;

        // Check for jackpot symbol (91) and play animations
        for (let i=0; i<visibleWindow.size; i++) {
            const symbol = visibleWindow.getSymbol(i);
            if (symbol ===91 && SlotUIRuleManager.Instance.canPlayingAppearSymbomEffect(91, visibleWindow, reel.reelindex)) {
                const animNode = SymbolAnimationController.Instance.playAnimationSymbol(reel.reelindex, i,92);
                if (animNode) animNodes.push(animNode);
                hasJackpotSymbol = true;
            }
        }

        // Finalize spin end
        const finish = () => {
            animNodes.forEach(node => node.active = false);
            reel.showAllSymbol();
            callback();
        };

        if (hasJackpotSymbol) {
            SlotSoundController.Instance().playAudio("JackpotAppear", "FX");
            this.node.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(finish)));
        } else {
            finish();
        }
    }

    /**
     * Get spin state sequence for normal spins
     * @returns SequencialState for reel spin behavior
     */
    getSpinState(): SequencialState {
        const state = new SequencialState();
        if (!this.node.active) return state;

        const reel = this.node.getComponent(Reel);
        if (!reel) return state;

        const stopWindows = SlotGameResultManager.Instance.getReelStopWindows();
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const basicReel = SlotGameRuleManager.Instance.getBasicGameReel();
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reel.reelindex];

        // Initial state
        const initialState = new State();
        initialState.addOnStartCallback(() => initialState.setDone());
        state.insert(0, initialState);

        // Pre-spin up/down state
        const preSpinState = ReelSpinBehaviors.Instance.getPreSpinUpDownState(reel, stopWindows, subGameKey);
        preSpinState.flagSkipActive = true;
        state.insert(1, preSpinState);

        // Spin until stop before reel
        const spinUntilStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReel(SlotManager.Instance.reelMachine.reels, reel, basicReel, subGameKey);
        spinUntilStopState.flagSkipActive = true;
        state.insert(2, spinUntilStopState);

        // Spin current reel
        const currentReelSpinState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReel(reel, basicReel, subGameKey);
        currentReelSpinState.flagSkipActive = true;
        state.insert(3, currentReelSpinState);

        // Easing info
        const easingInfo = new EasingInfo();
        if (spinControlInfo) {
            easingInfo.easingType = spinControlInfo.postEasingType;
            easingInfo.easingRate = spinControlInfo.postEasingRate;
            easingInfo.easingDuration = spinControlInfo.postEasingDuration;
            easingInfo.easingDistance = spinControlInfo.postEasingDistance;
        }

        easingInfo.onEasingStartFuncList.push(() => this.setShowExpectEffects(false));
        easingInfo.onEasingStartFuncList.push(() => SlotSoundController.Instance().playAudio("ReelStop_Mystery25", "FX"));
        this.addEasingFuncListOnStopEasing(easingInfo);

        // Move reel to final position
        const resultSymbols = this.getResultSymbolList(stopWindows.GetWindow(reel.reelindex), reel);
        const moveState = ReelSpinBehaviors.Instance.getReelMoveStateWithLastSymbolListContainBlankSymbolNew(reel, resultSymbols, this._dummySymbols,easingInfo, subGameKey);
        state.insert(4, moveState);

        // Final state
        const finalState = new State();
        finalState.addOnStartCallback(() => {
            reel.resetPositionOfReelComponents();
            reel.setShaderValue("blurOffset",0);
            SlotManager.Instance.setPlayReelExpectEffectState(reel.reelindex+1);
            this.processSpinEnd(() => finalState.setDone());
        });
        state.insert(5, finalState);

        return state;
    }

    /**
     * Get spin state sequence for extra spins
     * @returns SequencialState for extra reel spin behavior
     */
    getExtraReelSpinState(): SequencialState {
        const state = new SequencialState();
        if (!this.node.active) return state;

        const reel = this.node.getComponent(Reel);
        if (!reel) return state;

        const stopWindows = SlotGameResultManager.Instance.getReelStopWindows();
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const basicReel = SlotGameRuleManager.Instance.getBasicGameReel();

        // Pre-spin up/down state
        const preSpinState = ReelSpinBehaviors.Instance.getPreSpinUpDownState(reel, stopWindows, subGameKey);
        preSpinState.flagSkipActive = true;
        state.insert(0, preSpinState);

        // Spin current reel
        const currentReelSpinState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReel(reel, basicReel, subGameKey);
        currentReelSpinState.flagSkipActive = true;
        currentReelSpinState.addOnStartCallback(() => SlotSoundController.Instance().playAudio("4ReelSpin_Mystery25", "FX"));
        state.insert(1, currentReelSpinState);

        // Prepare symbol list
        const window = stopWindows.GetWindow(reel.reelindex);
        const symbolList: number[] = [];
        for (let i=window.size-1; i>=0; i++) symbolList.push(window.getSymbol(i));

        // Easing info
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reel.reelindex];
        const easingInfo = new EasingInfo();
        if (spinControlInfo) {
            easingInfo.easingType = spinControlInfo.postEasingType;
            easingInfo.easingRate = spinControlInfo.postEasingRate;
            easingInfo.easingDuration = spinControlInfo.postEasingDuration;
            easingInfo.easingDistance = spinControlInfo.postEasingDistance;
        }

        // Move reel to final position
        const moveState = ReelSpinBehaviors.Instance.getReelMoveStateWithLastSymbolListNew(reel, symbolList, subGameKey, easingInfo);
        state.insert(2, moveState);

        // Final state
        const finalState = new State();
        finalState.addOnStartCallback(() => {
            reel.resetPositionOfReelComponents();
            const firstSymbol = symbolList[0];
            let soundName: string | null = null;

            switch(firstSymbol) {
                case 71: soundName = "MultiplierWin2_Mystery25"; break;
                case 72: soundName = "MultiplierWin4_Mystery25"; break;
                case 73: soundName = "MultiplierWin10_Mystery25"; break;
                case 74: soundName = "MultiplierWin25_Mystery25"; break;
            }

            if (soundName) SlotSoundController.Instance().playAudio(soundName, "FX");
            finalState.setDone();
        });
        state.insert(3, finalState);

        return state;
    }

    /**
     * Generate result symbol list with dummy symbols if needed
     * @param window Slot window to get symbols from
     * @param reel Reel component reference
     * @returns Symbol list for reel spin
     */
    public getResultSymbolList(window: SlotWindow, reel: Reel): number[] {
        const symbolList: number[] = [];
        const requiredSize = reel.visibleRow + (2 * reel.bufferRow);
        const offset = window.size < requiredSize ? Math.floor((requiredSize - window.size)/2) :0;

        // Add symbols from window (reverse order)
        for (let i=window.size-1; i>=0; i++) symbolList.push(window.getSymbol(i));

        // Add dummy symbols
        for (let r=0; r<offset; r++) {
            const lastSymbol = symbolList[symbolList.length-1];
            if (lastSymbol === 0) {
                symbolList.push(r%2 === 0 ? this.getRandomDummySymbol() :0);
            } else {
                symbolList.push(r%2 !==0 ? Math.floor(Math.random()*3+21) :0);
            }
        }

        return symbolList;
    }

    /**
     * Helper to get random dummy symbol for reel transitions
     * @returns Random dummy symbol ID
     */
    private getRandomDummySymbol(): number {
        const rand = Math.floor(Math.random()*6);
        return rand <3 ? rand+21 : (rand-3)+11;
    }
}

/**
 * Interface for slot window (symbol grid)
 */
interface SlotWindow {
    size: number;
    getSymbol(index: number): number;
}