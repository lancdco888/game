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
import { Window } from "../../manager/SlotGameRuleManager";

const { ccclass, property } = cc._decorator;

@ccclass()
export default class ReelController_Super25Deluxe extends ReelController_Base {
    private _dummySymbols: number[] = [21, 22, 23, 11, 12, 13];

    constructor() {
        super();
        this._dummySymbols = [21, 22, 23, 11, 12, 13];
    }

    onLoad(): void {
        super.onLoad();
        
        // Add dummy symbols to base class list
        this.dummySymbolList.push(...[21, 22, 23, 11, 12, 13]);
        
        // Add easing function for spin end
        this.easingFuncListOnSpinEnd.push(() => {
            const reel = this.node.getComponent(Reel);
            if (!reel) return;
            
            this.playReelStopSound();
            
            if (reel.reelindex === 4) {
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
            
            reel.setShaderValue("blurOffset", 0);
        });
    }

    /**
     * Handles spin end logic and calls the callback when done
     * @param callback Callback to trigger after processing
     */
    processSpinEnd(callback: Function): void {
        const reel = this.node.getComponent(Reel);
        if (!reel) { callback(); return; }
        
        const visibleWindow = SlotGameResultManager.Instance.getVisibleSlotWindows().GetWindow(reel.reelindex);
        let hasJackpotSymbol = false;
        const animNodes: cc.Node[] = [];

        // Check for jackpot symbols and play animations
        for (let i = 0; i < visibleWindow.size; ++i) {
            const symbol = visibleWindow.getSymbol(i);
            if (symbol === 91 && SlotUIRuleManager.Instance.canPlayingAppearSymbomEffect(91, SlotGameResultManager.Instance.getVisibleSlotWindows(), reel.reelindex)) {
                const animNode = SymbolAnimationController.Instance.playAnimationSymbol(reel.reelindex, i, 92);
                if (animNode) animNodes.push(animNode);
                reel.hideSymbolInRow(i);
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
     * Returns the spin state sequence for the reel
     */
    getSpinState(): SequencialState {
        const seqState = new SequencialState();
        if (!this.node.active) return seqState;

        const reel = this.node.getComponent(Reel);
        if (!reel) return seqState;

        const reelStopWindows = SlotGameResultManager.Instance.getReelStopWindows();
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const basicGameReel = SlotGameRuleManager.Instance.getBasicGameReel();
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reel.reelindex];

        // Initial state (immediate done)
        const initialState = new State();
        initialState.addOnStartCallback(() => initialState.setDone());
        seqState.insert(0, initialState);

        // Pre-spin up/down state
        const preSpinState = ReelSpinBehaviors.Instance.getPreSpinUpDownState(reel, reelStopWindows, subGameKey);
        preSpinState.flagSkipActive = true;
        seqState.insert(1, preSpinState);

        // Spin until stop before reel
        const spinUntilStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReel(
            SlotManager.Instance.reelMachine.reels, reel, basicGameReel, subGameKey
        );
        spinUntilStopState.flagSkipActive = true;
        seqState.insert(2, spinUntilStopState);

        // Spin current reel
        const currentReelSpinState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReel(reel, basicGameReel, subGameKey);
        currentReelSpinState.flagSkipActive = true;
        seqState.insert(3, currentReelSpinState);

        // Easing info from spin control
        const easingInfo = new EasingInfo();
        if (spinControlInfo) {
            easingInfo.easingType = spinControlInfo.postEasingType;
            easingInfo.easingRate = spinControlInfo.postEasingRate;
            easingInfo.easingDuration = spinControlInfo.postEasingDuration;
            easingInfo.easingDistance = spinControlInfo.postEasingDistance;
        }

        // Easing start callbacks
        easingInfo.onEasingStartFuncList.push(() => this.setShowExpectEffects(false));
        easingInfo.onEasingStartFuncList.push(() => SlotSoundController.Instance().playAudio("ReelStop_Mystery25", "FX"));
        
        this.addEasingFuncListOnStopEasing(easingInfo);

        // Reel move state with result symbols
        const resultSymbolList = this.getResultSymbolList(reelStopWindows.GetWindow(reel.reelindex), reel);
        const reelMoveState = ReelSpinBehaviors.Instance.getReelMoveStateWithLastSymbolListContainBlankSymbolNew(
            reel, resultSymbolList, this._dummySymbols, easingInfo,subGameKey
        );
        seqState.insert(4, reelMoveState);

        // Final state (reset + process spin end)
        const finalState = new State();
        finalState.addOnStartCallback(() => {
            reel.resetPositionOfReelComponents();
            reel.setShaderValue("blurOffset", 0);
            SlotManager.Instance.setPlayReelExpectEffectState(reel.reelindex + 1);
            this.processSpinEnd(() => finalState.setDone());
        });
        seqState.insert(5, finalState);

        return seqState;
    }

    /**
     * Returns the extra reel spin state sequence
     */
    getExtraReelSpinState(): SequencialState {
        const seqState = new SequencialState();
        if (!this.node.active) return seqState;

        const reel = this.node.getComponent(Reel);
        if (!reel) return seqState;

        const reelStopWindows = SlotGameResultManager.Instance.getReelStopWindows();
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const basicGameReel = SlotGameRuleManager.Instance.getBasicGameReel();

        // Pre-spin up/down state
        const preSpinState = ReelSpinBehaviors.Instance.getPreSpinUpDownState(reel, reelStopWindows, subGameKey);
        preSpinState.flagSkipActive = true;
        seqState.insert(0, preSpinState);

        // Spin current reel
        const currentReelSpinState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReel(reel, basicGameReel, subGameKey);
        currentReelSpinState.flagSkipActive = true;
        currentReelSpinState.addOnStartCallback(() => SlotSoundController.Instance().playAudio("4ReelSpin_Mystery25", "FX"));
        seqState.insert(1, currentReelSpinState);

        // Build symbol list from window
        const window = reelStopWindows.GetWindow(reel.reelindex);
        const symbolList: number[] = [];
        for (let i = window.size -1; i >= 0; --i) symbolList.push(window.getSymbol(i));

        // Easing info from spin control
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reel.reelindex];
        const easingInfo = new EasingInfo();
        if (spinControlInfo) {
            easingInfo.easingType = spinControlInfo.postEasingType;
            easingInfo.easingRate = spinControlInfo.postEasingRate;
            easingInfo.easingDuration = spinControlInfo.postEasingDuration;
            easingInfo.easingDistance = spinControlInfo.postEasingDistance;
        }

        // Reel move state
        const reelMoveState = ReelSpinBehaviors.Instance.getReelMoveStateWithLastSymbolListNew(
            reel, symbolList, subGameKey, easingInfo
        );
        seqState.insert(2, reelMoveState);

        // Final state (reset + play sound)
        const finalState = new State();
        finalState.addOnStartCallback(() => {
            reel.resetPositionOfReelComponents();
            
            let soundName: string | null = null;
            switch (symbolList[0]) {
                case 71: soundName = "MultiplierWin2_Mystery25"; break;
                case 72: soundName = "MultiplierWin4_Mystery25"; break;
                case 73: soundName = "MultiplierWin10_Mystery25"; break;
                case 74: soundName = "MultiplierWin25_Mystery25"; break;
            }
            if (soundName) SlotSoundController.Instance().playAudio(soundName, "FX");
            
            finalState.setDone();
        });
        seqState.insert(3, finalState);

        return seqState;
    }

    /**
     * Generates the result symbol list for the reel
     */
    public getResultSymbolList(window: Window, reel: Reel): number[] {
        const resultList: number[] = [];
        const requiredSize = reel.visibleRow + 2 * reel.bufferRow;
        const offset = window.size < requiredSize ? Math.floor((requiredSize - window.size) / 2) : 0;

        // Add symbols from window (reverse order)
        for (let i = window.size -1; i >=0; --i) resultList.push(window.getSymbol(i));

        // Add dummy symbols based on offset
        for (let r =0; r < offset; ++r) {
            const lastSymbol = resultList[resultList.length - 1];
            if (lastSymbol ===0) {
                if (r%2 ===0) {
                    const rand = Math.floor(Math.random()*6);
                    resultList.push(rand <3 ? rand+21 : rand-3+11);
                } else resultList.push(0);
            } else {
                if (r%2 !==0) resultList.push(Math.floor(Math.random()*3 +21));
                else resultList.push(0);
            }
        }

        return resultList;
    }
}