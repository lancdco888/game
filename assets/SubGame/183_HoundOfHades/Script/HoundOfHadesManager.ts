import CameraControl, { CameraPositionState } from "../../../Script/Slot/CameraControl";
import Reel from "../../../Script/Slot/Reel";
import SlotSoundController from "../../../Script/Slot/SlotSoundController";
import State from "../../../Script/Slot/State";
import { BottomTextType } from "../../../Script/SubGame/BottomUIText";
import AsyncHelper from "../../../Script/global_utility/AsyncHelper";
import TSUtility from "../../../Script/global_utility/TSUtility";
import LangLocaleManager from "../../../Script/manager/LangLocaleManager";
import SlotGameResultManager from "../../../Script/manager/SlotGameResultManager";
import SlotGameRuleManager from "../../../Script/manager/SlotGameRuleManager";
import SlotManager from "../../../Script/manager/SlotManager";
import SoundManager from "../../../Script/manager/SoundManager";
import GameComponents_HoundOfHades from "./GameComponents_HoundOfHades";
import ReelMachine_HoundOfHades from "./ReelMachine_HoundOfHades";
import SubGameStateManager_HoundOfHades from "./SubGameStateManager_HoundOfHades";

const { ccclass, property } = cc._decorator;


/**
 * 哈迪斯之犬游戏管理器
 * 继承自通用SlotManager，处理该游戏的特有逻辑
 */
@ccclass()
export default class HoundOfHadesManager extends SlotManager {
    // 游戏组件引用
    public game_components: GameComponents_HoundOfHades = null;
    // 子游戏状态管理器
    private subgame_state: SubGameStateManager_HoundOfHades = null;
    // 下一个特效标记
    private next_Effect: boolean = false;
    // 滚轮旋转文本
   
    constructor(){
        super()
        this._reelSpinTexts = ["GOOD LUCK!", "BET MULTIPLIER"];
    }

    /**
     * 获取单例实例（继承自SlotManager）
     */
    public static getInstance(): HoundOfHadesManager {
        return SlotManager.Instance;
    }

    /**
     * 节点加载时执行
     */
    onLoad() {
        super.onLoad();
        this.game_components = this.node.getComponent(GameComponents_HoundOfHades);
        this.subgame_state = new SubGameStateManager_HoundOfHades();
        this.subgame_state.setManager(this);
    }

    /**
     * 获取当前子游戏状态
     */
    getSubGameState(): State {
        const subGameKey = this.getSubGameKeyAtStartSpin();
        return subGameKey === "base" 
            ? this.subgame_state!.getBaseGameState() 
            : this.subgame_state!.getLockandRollGameState();
    }

    /**
     * 播放主背景音乐
     */
    playMainBgm() {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        if (nextSubGameKey === "base") {
            SlotSoundController.Instance().playAudio("MainBGM", "BGM");
        } else {
            SlotSoundController.Instance().playAudio("RespinBGM", "BGM");
        }
    }

    /**
     * 初始化相机设置
     */
    initCameraSetting() {
        const pos1 = cc.v2(0, 0);
        const pos2 = cc.v2(0, 720);
        CameraControl.Instance.initCameraControl(pos1, pos2);
        
        if (!this.isSlotOrientationPortrait()) {
            CameraControl.Instance.scrollUpScreen(0);
        } else {
            CameraControl.Instance.scrollDownScreen(0);
        }
    }

    /**
     * 场景加载准备（异步）
     */
    async asyncSceneLoadPrepare() {
        this.setMouseDragEventFlag(false);
        this.setKeyboardEventFlag(false);
        SlotGameRuleManager.Instance.addObserver(this.node);
    }

    /**
     * 场景加载特效（异步）
     */
    async asyncSceneLoadEffect() {
        // 获取本地化欢迎文本
        const langText = LangLocaleManager.getInstance().getLocalizedText("Welcome to ${0}");
        const localizedText = TSUtility.strFormat(langText.text, SlotGameRuleManager.Instance.slotName);
        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, localizedText);
        
        // 显示顶部UI、播放入场音效、初始化猎犬组件
        this.game_components.topUI.appear();
        SlotSoundController.Instance().playAudio("Entrance", "FX");
        this.game_components._houndsComponent.initHound();
        this.game_components.jackpotDisplayFX.initFX();
        
        // 设置游戏模式
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        if (nextSubGameKey === "base") {
            this.setBaseMode();
        } else {
            this.setLockNRollMode();
        }

        // 延迟4秒
        await AsyncHelper.delay(4);

        // 设置相机回调、播放BGM、重置相机缩放
        CameraControl.Instance.callbackScrollUp = this.callbackOnScrollUp.bind(this);
        CameraControl.Instance.callbackScrollDown = this.callbackOnScrollDown.bind(this);
        this.playMainBgm();
        CameraControl.Instance.resetZoomRelative(1, false);
        CameraControl.Instance.scrollDownScreen(1, cc.easeOut(2));

        // 延迟1秒
        await AsyncHelper.delay(1);

        // 启用键盘事件、根据模式启用鼠标拖拽
        this.setKeyboardEventFlag(true);
        if (nextSubGameKey === "base") {
            this.setMouseDragEventFlag(true);
        }

        // 如果需要自动开始旋转则执行
        if (this.isNextSpinAutoStart()) {
            this.spinAfterCloseAllPopup();
        }
    }

    /**
     * 切换为竖屏模式时执行
     */
    onChangePortraitMode() {
        if (CameraControl.Instance.eStateOfCameraPosition === CameraPositionState.Down) {
            this.game_components!.topUI.idle();
        }
    }

    /**
     * 切换为横屏模式时执行
     */
    onChangeLandscapeMode() {
        if (CameraControl.Instance.eStateOfCameraPosition === CameraPositionState.Down) {
            this.game_components!.topUI.stay();
        }
    }

    /**
     * 相机上滑回调
     */
    callbackOnScrollUp() {
        this.game_components!.topUI.idle();
    }

    /**
     * 相机下滑回调
     */
    callbackOnScrollDown() {
        if (!this.isSlotOrientationPortrait()) {
            this.game_components!.topUI.stay();
        }
    }

    /**
     * 初始化猎犬组件
     */
    initHounds() {
        this.game_components._houndsComponent.initHound();
    }

    /**
     * 判断下一次旋转是否自动开始
     */
    isNextSpinAutoStart(): boolean {
        return SlotGameResultManager.Instance.getNextSubGameKey() !== "base" ;
    }

    /**
     * 初始化入场窗口
     */
    setEntranceWindow() {
        let nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        if (nextSubGameKey === "") {
            nextSubGameKey = "base";
        }

        const entranceWindow = SlotGameRuleManager.Instance.getEntranceWindow(nextSubGameKey);
        const symbolList = [9, 10, 11, 12, 13, 14, 21, 22, 23, 24];
        let reelStrip = SlotGameRuleManager.Instance.getReelStrip(nextSubGameKey);
        if (reelStrip == null) {
            reelStrip = SlotGameRuleManager.Instance.getReelStrip("base");
        }

        // 初始化基础滚轮
        for (let a = 0; a < this.reelMachine.reels.length; ++a) {
            const defaultBand = reelStrip.getReel(a).defaultBand;
            let windowData = null;
            if (entranceWindow != null) {
                windowData = entranceWindow.GetWindow(a);
            }

            const reelComp = this.reelMachine.reels[a].getComponent(Reel);
            if (windowData != null) {
                reelComp.invalidate(defaultBand, Math.floor(Math.random() * defaultBand.length), a, windowData);
            } else {
                reelComp.invalidate(defaultBand, Math.floor(Math.random() * defaultBand.length), a);
            }
            
            // 随机修改符号
            reelComp.changeSymbol(-1, symbolList[Math.floor(Math.random() * symbolList.length)]);
            reelComp.changeSymbol(3, symbolList[Math.floor(Math.random() * symbolList.length)]);
        }

        // 初始化LockNRoll滚轮
        const reelMachineComp = this.reelMachine.getComponent(ReelMachine_HoundOfHades);
        for (let a = 0; a < reelMachineComp.lockNRollReels.length; a++) {
            const reelIndex = Math.floor(a / 3);
            const defaultBand = reelStrip.getReel(reelIndex).defaultBand;
            const reelComp = reelMachineComp.lockNRollReels[a].getComponent(Reel);
            
            reelComp.invalidate(reelStrip.getReel(0).defaultBand, Math.floor(Math.random() * defaultBand.length), a);
            reelComp.changeSymbol(-1, symbolList[Math.floor(Math.random() * symbolList.length)]);
            reelComp.changeSymbol(0, symbolList[Math.floor(Math.random() * symbolList.length)]);
            reelComp.changeSymbol(1, symbolList[Math.floor(Math.random() * symbolList.length)]);
        }
    }

    /**
     * 重新初始化LockNRoll滚轮
     */
    reInvalidateLockNRollReels() {
        const symbolList = [9, 10, 11, 12, 13, 14, 21, 22, 23, 24];
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(nextSubGameKey);
        const reelMachineComp = this.reelMachine.getComponent(ReelMachine_HoundOfHades);

        for (let a = 0; a < reelMachineComp.lockNRollReels.length; a++) {
            const reelIndex = Math.floor(a / 3);
            const defaultBand = reelStrip.getReel(reelIndex).defaultBand;
            const reelNode = reelMachineComp.lockNRollReels[a];
            
            // 清空子节点并重新初始化
            reelNode.node.removeAllChildren(true);
            const reelComp = reelNode.getComponent(Reel);
            reelComp.invalidate(reelStrip.getReel(0).defaultBand, Math.floor(Math.random() * defaultBand.length), a);
            
            // 随机修改符号
            reelComp.changeSymbol(-1, symbolList[Math.floor(Math.random() * symbolList.length)]);
            reelComp.changeSymbol(0, symbolList[Math.floor(Math.random() * symbolList.length)]);
            reelComp.changeSymbol(1, symbolList[Math.floor(Math.random() * symbolList.length)]);
        }
    }

    /**
     * 设置下一个特效标记
     */
    setNextEffect() {
        this.next_Effect = Math.random() >= this.game_components!.getExpectRate();
    }

    /**
     * 获取下一个特效状态
     */
    getNextEffect(): boolean {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        return currentSubGameKey === "base" && nextSubGameKey !== "base" && this.next_Effect;
    }

    /**
     * 设置基础游戏模式
     */
    setBaseMode() {
        this.reelMachine.getComponent(ReelMachine_HoundOfHades).showBaseReels();
    }

    /**
     * 设置LockNRoll游戏模式
     */
    setLockNRollMode() {
        // 重置免费旋转奖金
        SlotGameResultManager.Instance.winMoneyInFreespinMode = 0;
        
        // 显示LockNRoll滚轮、禁用下注按钮、显示剩余次数UI
        this.reelMachine.getComponent(ReelMachine_HoundOfHades).showLockAndRollReels();
        SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(false);
        SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(false);
        this.game_components!.remainCount.showUI();

        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const subGameState = SlotGameResultManager.Instance.getSubGameState(nextSubGameKey);

        // 如果没有历史窗口数据，请求奖金游戏数据
        if (!TSUtility.isValid(subGameState.lastWindows) || subGameState.lastWindows.length <= 0) {
            SlotManager.Instance._freespinTotalCount = 3;
            SlotManager.Instance._freespinPastCount = 0;
            SlotManager.Instance._freespinMultiplier = 1;

            this.sendBonusGameRequestHoundOfHades((n: any) => {
                const newSubGameState = SlotGameResultManager.Instance.getSubGameState(nextSubGameKey);
                const reelMachineComp = this.reelMachine.getComponent(ReelMachine_HoundOfHades);
                
                // 更新LockNRoll滚轮符号
                for (let o = 0; o < reelMachineComp.lockNRollReels.length; ++o) {
                    const reelIndex = Math.floor(o / 3);
                    const windowIndex = Math.floor(o % 3);
                    const symbol = newSubGameState.lastWindows[reelIndex][windowIndex];
                    reelMachineComp.lockNRollReels[o].getComponent(Reel).changeSymbol(0, symbol);
                }

                this.game_components!.lockComponent.fixWindowNoneEffect(newSubGameState.lastWindows, newSubGameState.lastSymbolInfoWindow);
            });
        } else {
            // 使用历史窗口数据初始化
            SlotManager.Instance._freespinTotalCount = subGameState.totalCnt;
            SlotManager.Instance._freespinPastCount = subGameState.spinCnt;
            SlotManager.Instance._freespinMultiplier = subGameState.spinMultiplier;
            SlotGameResultManager.Instance.winMoneyInFreespinMode = subGameState.totalWinningCoin;

            // 更新LockNRoll滚轮符号
            const reelMachineComp = this.reelMachine.getComponent(ReelMachine_HoundOfHades);
            for (let o = 0; o < reelMachineComp.lockNRollReels.length; ++o) {
                const reelIndex = Math.floor(o / 3);
                const windowIndex = Math.floor(o % 3);
                const symbol = subGameState.lastWindows[reelIndex][windowIndex];
                reelMachineComp.lockNRollReels[o].getComponent(Reel).changeSymbol(0, symbol);
            }

            this.game_components!.lockComponent.fixWindowNoneEffect(subGameState.lastWindows, subGameState.lastSymbolInfoWindow);
        }

        // 重置底部赢钱显示、设置底部文本
        SlotManager.Instance.bottomUIText.setWinMoney(0);
        const respinText = LangLocaleManager.getInstance().getLocalizedText("HADES’ GATE RESPINS ACTIVATED");
        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, respinText.text);
    }

    /**
     * 发送哈迪斯之犬奖金游戏请求
     * @param callback 回调函数
     * @param params 请求参数
     */
    async sendBonusGameRequestHoundOfHades(callback: (result: any) => void, params: any[] = []) {
        const spinResult = await this.sendSpinRequest(null, params);
        
        // 检查有效性和错误状态
        if (!this.isValid || !this.isAvailable() || !this.checkSpinErrorState(spinResult)) {
            return;
        }

        // 处理旋转结果
        this.flagSpinRequest = true;
        SlotGameResultManager.Instance.resetGameResult();
        SlotGameResultManager.Instance.setGameResult(spinResult);
        
        const preProcessResult = this.slotInterface.onBeforeSpinProcess(spinResult);
        this.onSpinProcess(spinResult, preProcessResult);
        this.slotInterface.onAfterSpinProcess(spinResult, preProcessResult);
        
        // 执行回调
        callback(spinResult);
    }

    /**
     * 处理分享信息变更
     */
    processChangeShareInfo() {
        this.bannerImgNameBigwin = "slot-houndofhades-win-big-20240531.jpg";
        this.bannerImgNameMegawin = "slot-houndofhades-win-mega-20240531.jpg";
        this.bannerImgNameSuperwin = "slot-houndofhades-win-huge-20240531.jpg";
        this.lockandrollShareImgName = "slot-houndofhades-locknroll-20240531.jpg";
    }

    /**
     * 设置滚轮期望特效状态
     * @param reelIndex 滚轮索引
     */
    setPlayReelExpectEffectState(reelIndex: number) {
        // 隐藏所有期望特效
        this.reelMachine.hideAllExpectEffects();

        // 如果满足条件则播放期望特效
        if (this.reelMachine.reels.length > reelIndex && this.getNextEffect()) {
            if (this.reelMachine.shoeExpectEffect(reelIndex)) {
                const audioClip = SlotSoundController.Instance().getAudioClip("ReelExpect");
                if (SoundManager.Instance().isPlayingFxOnce(audioClip)) {
                    SoundManager.Instance().stopFxOnce(audioClip);
                }
                
                // 播放音效、调整音量、停止滚轮旋转音效、设置模糊效果
                SlotSoundController.Instance().playAudio("ReelExpect", "FX");
                SoundManager.Instance().setMainVolumeTemporarily(0.1);
                SlotManager.Instance.stopReelSpinSound();
                this.reelMachine.reels[reelIndex].getComponent(Reel).setShaderValue("blurOffset", 0.03);
            }
        } else {
            // 停止特效音效、恢复音量
            const audioClip = SlotSoundController.Instance().getAudioClip("ReelExpect");
            if (SoundManager.Instance().isPlayingFxOnce(audioClip)) {
                SoundManager.Instance().stopFxOnce(audioClip);
            }
            SoundManager.Instance().resetTemporarilyMainVolume();
        }
    }
}