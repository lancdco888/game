
import CameraControl from '../../Slot/CameraControl';
import Reel from '../../Slot/Reel';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import SlotSoundController from '../../Slot/SlotSoundController';
import { BottomTextType } from '../../SubGame/BottomUIText';
import AsyncHelper from '../../global_utility/AsyncHelper';
import SDefine from '../../global_utility/SDefine';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotManager from '../../manager/SlotManager';
import { Window } from '../../manager/SlotGameRuleManager';

import EnteranceComponent_BeeLovedJars from './Component/EnteranceComponent_BeeLovedJars';
import FreeSpinTopUIComponent_BeeLovedJars from './Component/FreeSpinTopUIComponent_BeeLovedJars';
import JackpotDisplayFxComponent_BeeLovedJars from './Component/JackpotDisplayFxComponent_BeeLovedJars';
import JackpotModeComponent_BeeLovedJars from './Component/JackpotModeComponent_BeeLovedJars';
import LockComponent_BeeLovedJars from './Component/LockComponent_BeeLovedJars';
import LockNRollTopUIComponent_BeeLovedJars from './Component/LockNRollTopUIComponent_BeeLovedJars';
import PotComponent_BeeLovedJars from './Component/PotComponent_BeeLovedJars';
import RemainCountComponent_BeeLovedJars from './Component/RemainCountComponent_BeeLovedJars';
import UIComponent_BeeLovedJars from './Component/UIComponent_BeeLovedJars';
import GameComponents_BeeLovedJars from './GameComponents_BeeLovedJars';
import ReelMachine_BeeLovedJars from './ReelMachine_BeeLovedJars';
import SubGameStateManager_BeeLovedJars from './SubGameStateManager_BeeLovedJars';
import SoundManager from '../../manager/SoundManager';
import SlotUIRuleManager from '../../Slot/rule/SlotUIRuleManager';
import State, { SequencialState } from '../../Slot/State';

const { ccclass } = cc._decorator;

// 事件总线
export const EventBus: cc.EventTarget = new cc.EventTarget();

/**
 * BeeLovedJars 老虎机游戏管理器
 * 继承自通用 SlotManager，处理该游戏的专属逻辑
 */
@ccclass('BeeLovedJarsManager')
export default class BeeLovedJarsManager extends SlotManager {
    // 静态常量
    public static readonly SUBGAMEID_SLOT: string = "beelovedjars";
    public static readonly NAME_SLOT: string = "Bee Loved Jars";

    // 实例属性（补充类型注解）
    public game_components: GameComponents_BeeLovedJars | null = null;
    private subgame_state: SubGameStateManager_BeeLovedJars | null = null;
    private update_Count: number = 0;
    private total_Count: number = 0;
    public _reelSpinTexts: string[] = ["GOOD LUCK!", "BET MULTIPLIER"];


    /**
     * 获取单例实例（复用父类 SlotManager 的单例）
     */
    public static getInstance(): BeeLovedJarsManager {
        return SlotManager.Instance;
    }

    /**
     * 生命周期：加载时初始化
     */
    public onLoad(): void {
        super.onLoad();
        
        // 获取游戏组件引用
        this.game_components = this.node.getComponent(GameComponents_BeeLovedJars);
        // 初始化子游戏状态管理器
        this.subgame_state = new SubGameStateManager_BeeLovedJars();
        this.subgame_state.setManager(this);
    }

    /**
     * 播放主背景音乐
     * @param e 是否强制播放 jackpot BGM
     */
    public playMainBgm(e: boolean = false): void {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        
        if (nextSubGameKey === "base" && !e || nextSubGameKey === "freegameChoose") {
            SlotSoundController.Instance().playAudio("BaseBGM", "BGM");
        } else if (nextSubGameKey === "jackpot" || e) {
            SlotSoundController.Instance().playAudio("JackpotModeBGM", "BGM");
        } else {
            SlotSoundController.Instance().playAudio("BonusBGM", "BGM");
        }
    }

    /**
     * 异步准备场景加载（替代原生成器函数）
     */
    public async asyncSceneLoadPrepare(): Promise<void> {
        // 禁用键盘/鼠标拖拽事件
        this.setKeyboardEventFlag(false);
        this.setMouseDragEventFlag(false);

        // 初始化相机控制
        const startPos = new cc.Vec2(0, 0);
        const endPos = new cc.Vec2(0, 685);
        CameraControl.Instance.initCameraControl(startPos, endPos);
        CameraControl.Instance.scrollUpScreen(0);

        // 注册游戏规则观察者
        SlotGameRuleManager.Instance.addObserver(this.node);

        // 初始化奖池组件
        if (this.game_components?.potComponent) {
            const potComp = this.game_components.potComponent.getComponent(PotComponent_BeeLovedJars);
            potComp.initPot();
            potComp.hideBee();
        }

        // 初始化 jackpot 特效组件
        if (this.game_components?.jackpotWinFxComponent) {
            const jackpotFxComp = this.game_components.jackpotWinFxComponent.getComponent(JackpotDisplayFxComponent_BeeLovedJars);
            jackpotFxComp.init();
        }
    }

    /**
     * 异步执行场景加载特效
     */
    public async asyncSceneLoadEffect(): Promise<void> {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        
        // 设置底部文本
        SlotManager.Instance.bottomUIText.setBottomTextInfo(
            BottomTextType.CustomData, 
            "Welcome to " + SlotGameRuleManager.Instance.slotName
        );

        // 显示入场动画
        if (this.game_components?.enteranceComponent) {
            const enteranceComp = this.game_components.enteranceComponent.getComponent(EnteranceComponent_BeeLovedJars);
            enteranceComp.showIntro();
        }

        // 根据子游戏类型初始化UI和卷轴
        switch (nextSubGameKey) {
            case "base":
                this.game_components?.uiComponent?.getComponent(UIComponent_BeeLovedJars).setBase();
                this.reelMachine?.getComponent(ReelMachine_BeeLovedJars).showBaseReels();
                this.setOverSizeSymbol();
                break;
            
            case "freegameChoose":
                this.game_components?.uiComponent?.getComponent(UIComponent_BeeLovedJars)?.setBase();
                this.reelMachine?.getComponent(ReelMachine_BeeLovedJars)?.showBaseReels();
                SlotReelSpinStateManager.Instance.setSpinMode(false);
                SlotManager.Instance.setKeyboardEventFlag(false);
                SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(false);
                SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(false);
                SlotManager.Instance._bottomUI.setButtonActiveState(null);
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE);
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "BONUS SELECTION ACTIVATED");
                this.setOverSizeSymbol();
                break;
            
            case "jackpot":
                this.game_components?.uiComponent?.getComponent(UIComponent_BeeLovedJars)?.setJackpotMode();
                this.reelMachine?.getComponent(ReelMachine_BeeLovedJars)?.showBaseReels();
                
                // 设置所有卷轴符号父节点
                for (let t = 0; t < 5; t++) {
                    SlotManager.Instance.reelMachine.reels[t]?.getComponent(Reel)?.setParentAllSymbolsToSymbolLayer();
                }

                // 显示 jackpot 模式
                this.setJackpotMode(() => {
                    this.isNextSpinAutoStart() && this.spinAfterCloseAllPopup();
                });
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "JACKPOT TRIGGERED");
                break;
            
            case "freeSpin":
                this.game_components?.uiComponent?.getComponent(UIComponent_BeeLovedJars)?.setFreeSpin();
                this.reelMachine?.getComponent(ReelMachine_BeeLovedJars)?.showBaseReels();
                this.game_components?.freeSpinTopUI?.getComponent(FreeSpinTopUIComponent_BeeLovedJars)?.init();
                this.subgame_state.changeUIToFreeSpin();
                this.setOverSizeSymbol();
                break;
            
            default:
                this.setLockNRollMode();
                break;
        }

        // 延迟4秒
        await AsyncHelper.delay(4);
        
        // 播放背景音乐
        this.playMainBgm(nextSubGameKey === "jackpot");

        // 相机滚动回调
        CameraControl.Instance.callbackScrollUp = this.callbackOnScrollUp.bind(this);
        CameraControl.Instance.callbackScrollDown = this.callbackOnScrollDown.bind(this);
        CameraControl.Instance.resetZoomRelative(1, false);
        CameraControl.Instance.scrollDownScreen(1, cc.easeOut(2));

        // 延迟1秒
        await AsyncHelper.delay(1);

        // 处理自动旋转逻辑
        if (nextSubGameKey === "freegameChoose") {
            this.playFreegameChoose(true);
        } else if (nextSubGameKey !== "jackpot" && this.isNextSpinAutoStart()) {
            this.spinAfterCloseAllPopup();
        }

        // 显示蜜蜂（base模式）
        if (nextSubGameKey === "base" && this.game_components?.potComponent) {
            this.game_components.potComponent.getComponent(PotComponent_BeeLovedJars).showBee();
        }

        // 启用输入事件（特定模式下）
        if (["base", "freeSpin", "lockNRoll"].includes(nextSubGameKey)) {
            this.setKeyboardEventFlag(true);
            this.setMouseDragEventFlag(true);
        }
    }

    /**
     * 设置入场窗口（初始化卷轴显示）
     */
    public setEntranceWindow(): void {
        let nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        if (!nextSubGameKey) nextSubGameKey = "base";

        // 获取入场窗口和卷轴条数据
        const entranceWindow = SlotGameRuleManager.Instance.getEntranceWindow(nextSubGameKey);
        let reelStrip = SlotGameRuleManager.Instance.getReelStrip(nextSubGameKey);
        if (!reelStrip) reelStrip = SlotGameRuleManager.Instance.getReelStrip("base");

        // 符号池
        const symbolPool = [14, 12, 13, 21, 22, 31, 32, 33];

        // 初始化基础卷轴
        if (this.reelMachine?.reels) {
            for (let a = 0; a < this.reelMachine.reels.length; ++a) {
                const reelComp = this.reelMachine.reels[a].getComponent(Reel);
                const defaultBand = reelStrip.getReel(a).defaultBand;
                const window = entranceWindow?.GetWindow(a);

                if (reelComp) {
                    if (window) {
                        reelComp.invalidate(defaultBand, Math.floor(Math.random() * defaultBand.length), a, window);
                    } else {
                        reelComp.invalidate(defaultBand, Math.floor(Math.random() * defaultBand.length), a);
                    }
                    // 随机设置符号
                    reelComp.changeSymbol(-1, symbolPool[Math.floor(Math.random() * symbolPool.length)]);
                    reelComp.changeSymbol(3, symbolPool[Math.floor(Math.random() * symbolPool.length)]);
                }
            }
        }

        // 初始化 LockNRoll 卷轴
        const lockNRollReelStrip = SlotGameRuleManager.Instance.getReelStrip("lockNRoll");
        const lockNRollReels = this.reelMachine?.getComponent(ReelMachine_BeeLovedJars)?.lockNRoll_Reels;
        
        if (lockNRollReels && lockNRollReelStrip) {
            for (let a = 0; a < lockNRollReels.length; a++) {
                const reelComp = lockNRollReels[a].getComponent(Reel);
                const defaultBand = lockNRollReelStrip.getReel(a).defaultBand;
                
                // 创建空窗口
                const window = new Window(5);
                window.setSymbol(0, 0);
                window.setSymbol(1, 0);
                window.setSymbol(2, 0);
                window.setSymbol(3, 0);
                window.setSymbol(4, 0);

                if (reelComp) {
                    reelComp.invalidate(defaultBand, Math.floor(Math.random() * defaultBand.length), a, window);
                    reelComp.changeSymbol(-1, 0);
                    reelComp.changeSymbol(0, 0);
                    reelComp.changeSymbol(1, 0);
                }
            }
        }
    }

    /**
     * 判断下一次旋转是否自动启动
     */
    public isNextSpinAutoStart(): boolean {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        return nextSubGameKey !== "base" && nextSubGameKey !== "freegameChoose";
    }

    /**
     * 获取子游戏状态
     */
    public getSubGameState(): State | null {
        const subGameKey = this.getSubGameKeyAtStartSpin();
        
        switch (subGameKey) {
            case "base":
                return this.subgame_state?.getBaseGameState() ?? null;
            case "jackpot":
                return this.subgame_state?.getJackpotGameState() ?? null;
            case "freeSpin":
                return this.subgame_state?.getFreeSpinGameState() ?? null;
            default:
                return this.subgame_state?.getLockandRollGameState() ?? null;
        }
    }

    /**
     * 相机上滚回调
     */
    public callbackOnScrollUp(): void {
        if (this.game_components?.enteranceComponent) {
            this.game_components.enteranceComponent.getComponent(EnteranceComponent_BeeLovedJars).setIdle();
        }
        if (this.game_components?.potComponent) {
            this.game_components.potComponent.getComponent(PotComponent_BeeLovedJars).hideBee();
        }
    }

    /**
     * 相机下滚回调
     */
    public callbackOnScrollDown(): void {
        if (this.game_components?.enteranceComponent) {
            this.game_components.enteranceComponent.getComponent(EnteranceComponent_BeeLovedJars).setStop();
        }
        if (this.game_components?.potComponent) {
            this.game_components.potComponent.getComponent(PotComponent_BeeLovedJars).showBee();
        }
    }

    /**
     * 处理分享信息变更
     */
    public processChangeShareInfo(): void {
        this.bannerImgNameBigwin = "slot-beelovedjars-win-big-20251016.jpg";
        this.bannerImgNameSuperwin = "slot-beelovedjars-win-huge-20251016.jpg";
        this.bannerImgNameMegawin = "slot-beelovedjars-win-mega-20251016.jpg";
    }

    /**
     * 设置更新计数（蜜蜂相关）
     */
    public setUpdateCount(): void {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        let t = 0;

        // 统计符号71的数量
        for (let n = 0; n < 5; n++) {
            for (let o = 0; o < 3; o++) {
                if (lastHistoryWindows.GetWindow(n).getSymbol(o) === 71) {
                    t++;
                }
            }
        }

        this.update_Count = Math.floor(Math.random() * t);
        this.total_Count = t;
        
        if (this.game_components?.potComponent) {
            this.game_components.potComponent.getComponent(PotComponent_BeeLovedJars).initAliveCount();
        }
    }

    /**
     * 获取更新计数
     */
    public getUpdateCount(): number {
        return this.update_Count;
    }

    /**
     * 获取总计数
     */
    public getTotalCount(): number {
        return this.total_Count;
    }

    /**
     * 发送奖励游戏请求
     * @param callback 回调函数
     * @param params 请求参数
     */
    public async sendBonusGameRequest(callback: (result: any) => void, params: any[] = []): Promise<void> {
        // 发送旋转请求
        const spinResult = await this.sendSpinRequest(null, params);

        // 校验有效性
        if (!cc.isValid(this) || !this.isAvailable() || !this.checkSpinErrorState(spinResult)) {
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
     * 设置 Jackpot 模式
     * @param callback 完成回调
     */
    public setJackpotMode(callback: () => void): void {
        if (this.game_components?.jackpotModeComponent) {
            const jackpotModeComp = this.game_components.jackpotModeComponent.getComponent(JackpotModeComponent_BeeLovedJars);
            jackpotModeComp.showJackpotMode(callback);
        }
    }

    /**
     * 设置 LockNRoll 模式
     */
    public setLockNRollMode(): void {
        // 设置UI
        this.game_components?.uiComponent?.getComponent(UIComponent_BeeLovedJars)?.setLockNRoll();
        this.reelMachine?.getComponent(ReelMachine_BeeLovedJars)?.showLockAndRollReels();

        // 获取子游戏状态
        let nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        let subGameState = SlotGameResultManager.Instance.getSubGameState(nextSubGameKey);

        // 激活锁组件
        if (this.game_components?.lockComponent) {
            this.game_components.lockComponent.active = true;
        }
        
        // 初始化UI组件
        this.game_components?.lockNRollTopUI?.getComponent(LockNRollTopUIComponent_BeeLovedJars)?.init();
        this.game_components?.remainCount?.getComponent(RemainCountComponent_BeeLovedJars)?.updateCount(null);

        // 校验状态有效性
        if (!TSUtility.isValid(subGameState) || !TSUtility.isValid(subGameState.lastWindows) || subGameState.lastWindows.length === 0) {
            nextSubGameKey = "base";
            subGameState = SlotGameResultManager.Instance.getSubGameState(nextSubGameKey);
        }

        // 修复窗口特效
        const lastWindows = subGameState.lastWindows;
        const lastSymbolInfoWindow = subGameState.lastSymbolInfoWindow;
        
        if (this.game_components?.lockComponent) {
            const lockComp = this.game_components.lockComponent.getComponent(LockComponent_BeeLovedJars);
            lockComp.fixWindowNoneEffect(lastWindows, lastSymbolInfoWindow);
        }
    }

    /**
     * 播放免费游戏选择动画
     * @param e 是否自动开始
     */
    public playFreegameChoose(e: boolean): void {
        const state = new SequencialState();
        state.insert(0, this.subgame_state?.getCheckStartChooseState(e) ?? new State());
        
        this.curState = state;
        if (this.curState) {
            this.curState.addOnEndCallback(this.checkEndSpin.bind(this));
            this.curState.onStart();
        }
    }

    /**
     * 获取下一个特效（随机判定）
     */
    public getNextEffect(): boolean {
        const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;
        const randomFlag = Math.random() <= 0.01;
        
        return !!jackpotResults && jackpotResults.length > 0 || randomFlag;
    }

    /**
     * 设置卷轴期望特效状态
     * @param reelIndex 卷轴索引
     */
    public setPlayReelExpectEffectState(reelIndex: number): void {
        // 隐藏所有期望特效
        this.reelMachine?.hideAllExpectEffects();

        // 检查卷轴索引有效性
        if (this.reelMachine?.reels.length > reelIndex) {
            const expectEffectFlag = SlotUIRuleManager.Instance.getExpectEffectFlag(
                reelIndex, 
                SlotGameResultManager.Instance.getVisibleSlotWindows()
            );

            if (expectEffectFlag && this.reelMachine.shoeExpectEffect(reelIndex) && !SlotManager.Instance.isSkipCurrentSpin) {
                // 播放特效音效
                const audioClip = SlotSoundController.Instance().getAudioClip("ReelExpect");
                if (SoundManager.Instance().isPlayingFxOnce(audioClip)) {
                    SoundManager.Instance().stopFxOnce(audioClip);
                }
                SlotSoundController.Instance().playAudio("ReelExpect", "FX");
                
                // 临时调整主音量
                SoundManager.Instance().setMainVolumeTemporarily(0.1);
                SlotManager.Instance.stopReelSpinSound();
                
                // 设置卷轴模糊效果
                this.reelMachine.reels[reelIndex].getComponent(Reel)?.setShaderValue("blurOffset", 0.03);
                return;
            }
        }

        // 重置音效和音量
        const audioClip = SlotSoundController.Instance().getAudioClip("ReelExpect");
        if (SoundManager.Instance().isPlayingFxOnce(audioClip)) {
            SoundManager.Instance().stopFxOnce(audioClip);
        }
        SoundManager.Instance().resetTemporarilyMainVolume();
    }
}

// 注册游戏场景信息
SDefine.setSlotSceneInfo({
    sceneName: "221_BeeLovedJars",
    gameId: BeeLovedJarsManager.SUBGAMEID_SLOT,
    name: BeeLovedJarsManager.NAME_SLOT,
    prefabName: "simpleImg",
    useDev: true,
    useQA: true,
    useLive: true,
    sImg: "80_221_BeeLovedJars_S",
    nImg: "80_221_BeeLovedJars_L"
});
