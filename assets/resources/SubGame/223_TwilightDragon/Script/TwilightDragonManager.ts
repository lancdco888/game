import EventChecker from "../../../../Script/EventChecker";
import CameraControl from "../../../../Script/Slot/CameraControl";
import Reel from "../../../../Script/Slot/Reel";
import SlotReelSpinStateManager from "../../../../Script/Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../../../Script/Slot/SlotSoundController";
import State, { SequencialState } from "../../../../Script/Slot/State";
import SlotUIRuleManager from "../../../../Script/Slot/rule/SlotUIRuleManager";
import AsyncHelper from "../../../../Script/global_utility/AsyncHelper";
import SDefine from "../../../../Script/global_utility/SDefine";
import SlotGameResultManager from "../../../../Script/manager/SlotGameResultManager";
import SlotGameRuleManager from "../../../../Script/manager/SlotGameRuleManager";
import SlotManager from "../../../../Script/manager/SlotManager";
import SoundManager from "../../../../Script/manager/SoundManager";
import GameComponents_TwilightDragon from "./GameComponents_TwilightDragon";
import JackpotSymbol_TwilightDragon from "./JackpotSymbol_TwilightDragon";
import ReelMachine_TwilightDragon from "./ReelMachine_TwilightDragon";
import SubGameStateManager_TwilightDragon from "./SubGameStateManager_TwilightDragon";

const { ccclass, property } = cc._decorator;

/**
 * 暮光龙（Twilight Dragon）老虎机核心管理类
 * 继承自通用老虎机管理类 SlotManager
 */
@ccclass()
export default class TwilightDragonManager extends SlotManager {
    // 【专属属性】免费旋转模式专属卷轴机器（Cocos 编辑器可拖拽绑定）
    @property(ReelMachine_TwilightDragon)
    public reelMachine_FreeSpin: ReelMachine_TwilightDragon = null;

    // 【静态属性】游戏配置常量
    public static readonly SUBGAMEID_SLOT_TWILIGHTDRAGON: string = "twilightdragon";
    public static readonly NAME_SLOT_TWILIGHTDRAGON: string = "twilight dragon";

    // ======================================
    // Cocos 生命周期函数：节点加载完成时执行
    // ======================================
    onLoad(): void {
        super.onLoad(); // 调用父类 onLoad 方法
        this._reelSpinTexts = ["GOOD LUCK!", "PLAYING 5 LINES", "BET MULTIPLIER"];
    }

    // ======================================
    // 核心业务方法：获取当前游戏子状态
    // ======================================
    getSubGameState(): any {
        const subGameKey = this.getSubGameKeyAtStartSpin();
        if (subGameKey === "base") {
            return SubGameStateManager_TwilightDragon.Instance().getBaseGameState();
        } else if (subGameKey === "freeSpin") {
            return SubGameStateManager_TwilightDragon.Instance().getFreeSpinState();
        }
        return undefined;
    }

    // ======================================
    // 核心业务方法：播放对应模式的主 BGM
    // ======================================
    playMainBgm(): void {
        const subGameKey = this.getSubGameKeyAtStartSpin();
        if (subGameKey === "base") {
            SlotSoundController.Instance().playAudio("MainBGM", "BGM");
        } else {
            SlotSoundController.Instance().playAudio("FreeSpinBGM", "BGM");
        }
    }

    // ======================================
    // 异步方法：场景加载准备（关闭事件、初始化相机）
    // ======================================
    async asyncSceneLoadPrepare(): Promise<void> {
        // 关闭鼠标/键盘事件
        this.setMouseDragEventFlag(false);
        this.setKeyboardEventFlag(false);

        // 初始化相机控制参数
        const cameraStartPos = new cc.Vec2(35, 0);
        const cameraTargetPos = new cc.Vec2(704, 685);
        CameraControl.Instance.initCameraControl(cameraStartPos, cameraTargetPos);
        CameraControl.Instance.setScreenTop();

        // 添加游戏规则观察者
        SlotGameRuleManager.Instance.addObserver(this.node);
    }

    // ======================================
    // 异步方法：场景加载特效（入场动画、模式初始化）
    // ======================================
    async asyncSceneLoadEffect(): Promise<void> {
        const subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const gameComponents = this.getComponent(GameComponents_TwilightDragon);

        // 1. 区分模式处理初始化
        if (subGameKey === "base") {
            // 基础模式：播放入场动画和相机震动
            gameComponents.topUI.playIntroAni();
            SlotSoundController.Instance().playAudio("Intro", "FX");
            this.scheduleOnce(() => {
                gameComponents.playCameraShaking();
            }, 2);
        } else {
            // 免费旋转模式：恢复上次旋转状态
            gameComponents.topUI.reconnectFreeSpin();
        }

        // 2. 初始化免费旋转入口窗口 & 停止卷轴旋转
        this.setFreeSpinEntranceWindow();
        (this as unknown as SlotManager).getComponent(GameComponents_TwilightDragon).stopReelSpin_Stay();

        // 3. 初始化 Jackpot 符号入口信息
        for (let t = 0; t < this.reelMachine.reels.length; t++) {
            const reel = this.reelMachine.reels[t].getComponent(Reel);
            for (let o = 0; o < 3; o++) {
                const symbolNode = reel.getSymbol(o);
                const jackpotSymbol = symbolNode.getComponent(JackpotSymbol_TwilightDragon);
                jackpotSymbol.setEntranceSymbol(t, o);
            }
        }

        // 4. 基础模式额外处理：相机滚动 & 延迟
        if (subGameKey === "base") {
            (this as unknown as SlotManager).getComponent(GameComponents_TwilightDragon).changeUIToNormal();
            await AsyncHelper.delay(4); // 延迟 4 秒

            // 相机缩放并向下滚动
            CameraControl.Instance.resetZoomRelative(0.8, false);
            CameraControl.Instance.scrollDownScreen(0.8, cc.easeOut(2));
            await AsyncHelper.delay(0.8); // 延迟 0.8 秒
        } else {
            // 5. 免费旋转模式额外处理：初始化 UI 进度条
            const freeSpinState = SlotGameResultManager.Instance.getSubGameState("freeSpin");
            const freeSpinUI = (this as unknown as SlotManager).getComponent(GameComponents_TwilightDragon).freeSpinUI;
            
            freeSpinUI.addOrb(freeSpinState.getGaugesValue("bonus"), 1, null);
            freeSpinUI.initLevelInfo();
            freeSpinUI.playIdleFx();
            freeSpinUI.playRewardFx();
            
            SubGameStateManager_TwilightDragon.Instance().changeUIToFreeSpin();
            if (freeSpinState.getGaugesValue("isFirstSpin") === 0) {
                SubGameStateManager_TwilightDragon.Instance().drawLastWindow();
            }
            CameraControl.Instance.setScreenBottom();
        }

        // 6. 公共后续处理：开启事件 & 绑定相机回调
        if (subGameKey === "base") {
            this.setMouseDragEventFlag(true);
            this.callbackOnScrollDown();
        }
        this.setKeyboardEventFlag(true);
        
        CameraControl.Instance.callbackScrollUp = this.callbackOnScrollUp.bind(this);
        CameraControl.Instance.callbackScrollDown = this.callbackOnScrollDown.bind(this);

        // 7. 延迟后自动触发旋转（若开启自动旋转）
        await AsyncHelper.delay(0.5);
        if (this.isNextSpinAutoStart()) {
            this.spinAfterCloseAllPopup();
        }
        this.playMainBgm();
    }

    // ======================================
    // 辅助方法：设置鼠标拖拽事件开关
    // ======================================
    setMouseDragEventFlag(enabled: boolean): void {
        const eventChecker = this.getComponent(EventChecker);
        if (eventChecker) {
            const freespinMode = SlotReelSpinStateManager.Instance.getFreespinMode();
            eventChecker.mouseEventEnabled = (!freespinMode) && enabled;
        }
    }

    // ======================================
    // 辅助方法：获取鼠标拖拽事件开关状态
    // ======================================
    getMouseDragEventFlag(): boolean {
        const eventChecker = this.getComponent(EventChecker);
        const freespinMode = SlotReelSpinStateManager.Instance.getFreespinMode();
        return !freespinMode && eventChecker && eventChecker.mouseEventEnabled;
    }

    // ======================================
    // 相机滚动回调：向下滚动停止所有动画
    // ======================================
    callbackOnScrollDown(): void {
        const gameComponents = this.getComponent(GameComponents_TwilightDragon);
        gameComponents.topUI.stopAllAni();
    }

    // ======================================
    // 相机滚动回调：向上滚动播放默认动画
    // ======================================
    callbackOnScrollUp(): void {
        const gameComponents = this.getComponent(GameComponents_TwilightDragon);
        gameComponents.topUI.playDefaultAni();
    }

    // ======================================
    // 核心方法：获取卷轴旋转开始状态
    // ======================================
    getReelSpinStartState(e: any): SequencialState {
        const state = new SequencialState();
        let index = 0;

        // 选择对应模式的卷轴机器
        const reelMachine = SlotGameResultManager.Instance.getNextSubGameKey() === "base" 
            ? (this as unknown as SlotManager).reelMachine 
            : this.reelMachine_FreeSpin;

        // 插入预旋转状态
        state.insert(index++, reelMachine.getPreSpinUsingNextSubGameKeyState(e));

        // 插入无限旋转状态
        const infiniteSpinState = reelMachine.getInfiniteSpinUsingNextSubGameKeyState(e);
        state.insert(index, infiniteSpinState);

        // 插入发送旋转请求状态
        const sendSpinState = (this as unknown as SlotManager).getSendSpinRequestState();
        state.insert(index++, sendSpinState);

        // 绑定回调：请求结束后标记旋转完成
        sendSpinState.addOnEndCallback(() => {
            infiniteSpinState.setDoneAllSubStates();
        });

        return state;
    }

    // ======================================
    // 核心方法：更新免费旋转已玩次数
    // ======================================
    getIncreaseFreespinPastCountStateRenewal(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this._freespinPastCount++;
            this.setFreespinExtraInfoByCurrentState();
            state.setDone();
        });
        return state;
    }

    // ======================================
    // 辅助方法：初始化免费旋转入口窗口
    // ======================================
    setFreeSpinEntranceWindow(): void {
        if (!this.reelMachine_FreeSpin) return;

        for (let e = 0; e < this.reelMachine_FreeSpin.reels.length; e++) {
            // 无用计算：JS 中遗留，保留以兼容原逻辑
            Math.floor(e / 3);
            Math.floor(e % 3);

            const reel = this.reelMachine_FreeSpin.reels[e].getComponent(Reel);
            reel.invalidate([0], 0, e);
        }
    }

    // ======================================
    // 核心方法：设置卷轴期望特效状态
    // ======================================
    setPlayReelExpectEffectState(e: number): void {
        this.reelMachine.hideAllExpectEffects();
        let symbolCount = 0;

        // 统计目标符号数量
        const reelStopWindow = (this as unknown as SlotManager).getReelStopWindow();
        for (let o = 0; o < 2; o++) {
            const window = reelStopWindow.GetWindow(o);
            for (let i = 0; i < window.size; i++) {
                const symbolId = window.getSymbol(i);
                if (symbolId === 91 || symbolId === 92) {
                    symbolCount++;
                }
            }
        }

        // 满足条件时播放特效
        const visibleWindows = SlotGameResultManager.Instance.getVisibleSlotWindows();
        if (e === 2 && symbolCount < 3 && this.reelMachine.reels.length > e && SlotUIRuleManager.Instance.getExpectEffectFlag(e, visibleWindows)) {
            if (this.reelMachine.shoeExpectEffect(e)) {
                const audioClip = SlotSoundController.Instance().getAudioClip("ReelExpect");
                if (SoundManager.Instance().isPlayingFxOnce(audioClip)) {
                    SoundManager.Instance().stopFxOnce(audioClip);
                }
                SlotSoundController.Instance().playAudio("ReelExpect", "FX");
                SoundManager.Instance().setMainVolumeTemporarily(0.1);
                (this as unknown as SlotManager).stopReelSpinSound();
                
                const reel = this.reelMachine.reels[e].getComponent(Reel);
                reel.setShaderValue("blurOffset", 0.03);
            }
        } else {
            // 停止特效并恢复音量
            const audioClip = SlotSoundController.Instance().getAudioClip("ReelExpect");
            if (SoundManager.Instance().isPlayingFxOnce(audioClip)) {
                SoundManager.Instance().stopFxOnce(audioClip);
            }
            SoundManager.Instance().resetTemporarilyMainVolume();
        }
    }

    // ======================================
    // Cocos 生命周期函数：每帧晚更新（处理自动旋转）
    // ======================================
    lateUpdate(): void {
        const currentState = SlotReelSpinStateManager.Instance.getCurrentState();
        const autoSpinMode = SlotReelSpinStateManager.Instance.getAutospinMode();

        if (currentState === SlotReelSpinStateManager.STATE_STOP && autoSpinMode) {
            const now = new Date().getTime();
            if (this.slotInterface.onCheckCanAutoSpin() === 0) {
                SlotReelSpinStateManager.Instance.changeAutospinMode(false);
                return;
            }

            // 获取自动旋转延迟，大赢时缩短延迟
            let autoSpinDelay = SlotUIRuleManager.Instance.getAutospinDelay();
            if (SlotGameResultManager.Instance.getTotalWinMoney() > 0) {
                autoSpinDelay = 0.9;
            }

            // 延迟达到后触发下一次旋转
            if (now - this.spinEndTime > autoSpinDelay * 1000) {
                this.spinAll();
            }
        }
    }

    // ======================================
    // 辅助方法：获取窗口范围
    // ======================================
    getWindowRange(): number[][] {
        const range: number[][] = [];
        for (let t = 0; t < this.reelMachine.reels.length; t++) {
            const reel = this.reelMachine.reels[t].getComponent(Reel);
            range.push([1, reel.visibleRow + 1]);
        }
        return range;
    }

    // ======================================
    // 辅助方法：获取结果窗口
    // ======================================
    getResultWindows(): any {
        return SlotGameResultManager.Instance.getReelStopWindows();
    }

    // ======================================
    // 辅助方法：获取符号高度
    // ======================================
    getSymbolHeight(): number {
        return 130;
    }

    // ======================================
    // 辅助方法：获取符号宽度
    // ======================================
    getSymbolWidth(): number {
        return 200;
    }

    // ======================================
    // 辅助方法：注册忽略符号
    // ======================================
    registerIgnoreSymbols(): void {
        this._special_ignore_symbolId = [0];
    }

    // ======================================
    // 辅助方法：处理分享图片配置
    // ======================================
    processChangeShareInfo(): void {
        this.bannerImgNameBigwin = "slot-twilightdragon-win-big-20251113.jpg";
        this.bannerImgNameSuperwin = "slot-twilightdragon-win-huge-20251113.jpg";
        this.bannerImgNameMegawin = "slot-twilightdragon-win-mega-20251113.jpg";
        this.jackpotMiniShareImgName = "slot-twilightdragon-jackpot-mini-20251113.jpg";
        this.jackpotMinorShareImgName = "slot-twilightdragon-jackpot-minor-20251113.jpg";
        this.jackpotMajorShareImgName = "slot-twilightdragon-jackpot-major-20251113.jpg";
        this.jackpotMegaShareImgName = "slot-twilightdragon-jackpot-mega-20251113.jpg";
        this.freespinShareImgName = "slot-twilightdragon-free-spins-20251113.jpg";
    }
}

// ======================================
// 初始化游戏场景配置（全局注册）
// ======================================
SDefine.setSlotSceneInfo({
    sceneName: "223_TwilightDragon",
    gameId: TwilightDragonManager.SUBGAMEID_SLOT_TWILIGHTDRAGON,
    name: TwilightDragonManager.NAME_SLOT_TWILIGHTDRAGON,
    prefabName: "",
    useDev: true,
    useQA: true,
    useLive: true,
    sImg: "",
    nImg: ""
});