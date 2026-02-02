import Reel from "../../Slot/Reel";
import SlotSoundController from "../../Slot/SlotSoundController";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SlotManager from "../../manager/SlotManager";
import SubGameStateManager_Super25Deluxe from "./SubGameStateManager_Super25Deluxe";

const { ccclass } = cc._decorator;

/**
 * Super25Deluxe slot game manager, extends base SlotManager
 * Implements game-specific logic for Super25Deluxe slot
 */
@ccclass('Super25DeluxeManager')
export default class Super25DeluxeManager extends SlotManager {

    /**
     * Get singleton instance of Super25DeluxeManager
     * @returns Super25DeluxeManager instance
     */
    public static getInstance(): Super25DeluxeManager {
        return SlotManager.Instance as Super25DeluxeManager;
    }

    /**
     * Cocos Creator onLoad lifecycle method
     * Initialize game-specific properties
     */
    onLoad(): void {
        super.onLoad();
        this._reelSpinTexts = ["GOOD LUCK!", "PLAYING 9 LINES", "BET MULTIPLIER"];
    }

    /**
     * Play main BGM for the game
     * Combines base class logic with game-specific BGM playback
     */
    playMainBgm(): void {
        super.playMainBgm();
        SlotSoundController.Instance().playAudio("MainBGM", "BGM");
    }

    /**
     * Async prepare for scene load (empty implementation in original)
     */
    async asyncSceneLoadPrepare(): Promise<void> {
        // No specific preparation logic in original code
    }

    /**
     * Async sequence for scene load effects
     * Plays load effect then sets game state
     */
    async asyncSceneLoadEffect(): Promise<void> {
        await this.asyncPlaySceneLoadEffect();
        await this.asyncSetSlotGameStateAfterSceneLoadEffect();
    }

    /**
     * Async play scene load effect (plays main BGM)
     */
    async asyncPlaySceneLoadEffect(): Promise<void> {
        this.playMainBgm();
    }

    /**
     * Async set game state after load effect (empty implementation)
     */
    async asyncSetSlotGameStateAfterSceneLoadEffect(): Promise<void> {
        // No state setting logic after load effect in original code
    }

    /**
     * Get current sub-game state (only base game supported here)
     * @returns Base game state from SubGameStateManager
     */
    getSubGameState(): any {
        let gameState: any = null;
        if (this.getSubGameKeyAtStartSpin() === "base") {
            gameState = SubGameStateManager_Super25Deluxe.Instance().getBaseGameState();
        }
        return gameState;
    }

    /**
     * Update share info (jackpot and win banners)
     */
    processChangeShareInfo(): void {
        this.jackpotCommonShareImgName = "slot-super25deluxe-jackpot-20191213.jpg";
        this.bannerImgNameMinorWin = "slot-super25deluxe-win-super-20191213.jpg";
        this.bannerImgNameBigwin = "slot-super25deluxe-win-big-20191213.jpg";
        this.bannerImgNameSuperwin = "slot-super25deluxe-win-huge-20191213.jpg";
        this.bannerImgNameMegawin = "slot-super25deluxe-win-mega-20191213.jpg";
    }

    /**
     * Play random reel spin sound effect
     */
    playReelSpinSound(): void {
        const randomSoundIndex = Math.floor(Math.random() * 3);
        SlotSoundController.Instance().playAudio(`ReelSpin_${randomSoundIndex}`, "FXLoop");
    }

    /**
     * Stop all reel spin sound effects
     */
    stopReelSpinSound(): void {
        SlotSoundController.Instance().stopAudio("ReelSpin_0", "FXLoop");
        SlotSoundController.Instance().stopAudio("ReelSpin_1", "FXLoop");
        SlotSoundController.Instance().stopAudio("ReelSpin_2", "FXLoop");
    }

    /**
     * Get window range for each reel (excludes last reel)
     * @returns Array of [start, end] ranges for each reel window
     */
    getWindowRange(): number[][] {
        const rangeList: number[][] = [];
        // Exclude last reel from range calculation
        for (let i = 0; i < this.reelMachine.reels.length - 1; ++i) {
            const reelComponent = this.reelMachine.reels[i].getComponent(Reel);
            if (reelComponent) {
                rangeList.push([1, reelComponent.visibleRow + 1]);
            }
        }
        return rangeList;
    }

    /**
     * Get result windows from game result manager
     * @returns Reel stop windows data
     */
    getResultWindows(): any {
        return SlotGameResultManager.Instance.getReelStopWindows();
    }

    /**
     * Get adjusted symbol width (90% of original symbol width)
     * @returns Adjusted symbol width
     */
    getSymbolWidth(): number {
        return 0.9 * this._symbol_width;
    }

    /**
     * Get symbol height (double input value)
     * @param e Input value (likely original height)
     * @returns Adjusted symbol height
     */
    getSymbolHeight(e: number): number {
        return 2 * e;
    }
}
