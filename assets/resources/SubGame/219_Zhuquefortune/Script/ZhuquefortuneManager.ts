const { ccclass, property } = cc._decorator;

import EnteranceComponent_Zhuquefortune from "./EnteranceComponent_Zhuquefortune";
import ExpectComponent_Zhuquefortune from "./ExpectComponent_Zhuquefortune";
import JackpotModeComponent_Zhuquefortune from "./JackpotModeComponent_Zhuquefortune";
import JackpotSymbolComponent_Zhuquefortune from "./JackpotSymbolComponent_Zhuquefortune";
import LockComponent_Zhuquefortune from "./LockComponent_Zhuquefortune";
import PotComponent_Zhuquefortune from "./PotComponent_Zhuquefortune";
import RemainCountComponent_Zhuquefortune from "./RemainCountComponent_Zhuquefortune";
import UIComponent_Zhuquefortune from "./UIComponent_Zhuquefortune";
import GameComponents_Zhuquefortune from "./GameComponents_Zhuquefortune";
import ReelMachine_Zhuquefortune from "./ReelMachine_Zhuquefortune";
import SubGameStateManager_Zhuquefortune from "./SubGameStateManager_Zhuquefortune";
import SlotManager from "../../../../Script/manager/SlotManager";
import SlotGameResultManager, { ResultSymbolInfo } from "../../../../Script/manager/SlotGameResultManager";
import SlotSoundController from "../../../../Script/Slot/SlotSoundController";
import CameraControl from "../../../../Script/Slot/CameraControl";
import SlotGameRuleManager from "../../../../Script/manager/SlotGameRuleManager";
import { BottomTextType } from "../../../../Script/SubGame/BottomUIText";
import SlotUIRuleManager from "../../../../Script/Slot/rule/SlotUIRuleManager";
import AsyncHelper from "../../../../Script/global_utility/AsyncHelper";
import Reel from "../../../../Script/Slot/Reel";
import Symbol from "../../../../Script/Slot/Symbol";
import { Window } from "../../../../Script/manager/SlotGameRuleManager";
import TSUtility from "../../../../Script/global_utility/TSUtility";
import SDefine from "../../../../Script/global_utility/SDefine";

// 事件总线（与原JS保持一致）
export const EventBus = new cc.EventTarget();

/**
 * 朱雀财富游戏管理类
 * 继承自SlotManager，负责游戏场景初始化、模式切换、旋转逻辑等核心功能
 */
@ccclass("ZhuquefortuneManager")
export default class ZhuquefortuneManager extends SlotManager {
    // 静态常量（与原JS保持一致）
    public static readonly SUBGAMEID_SLOT: string = "zhuquefortune";
    public static readonly NAME_SLOT: string = "Zhuque Fortune";

    // 实例成员变量（补充TS类型注解）
    public game_components: GameComponents_Zhuquefortune = null;
    private subgame_state: SubGameStateManager_Zhuquefortune = null;
    private next_Effect: boolean = false;
    private next_FalseEffect: boolean = false;
    private update_Count: number = 0;
    public _reelSpinTexts: string[] = ["GOOD LUCK!", "BET MULTIPLIER"];

    // 横幅图片名称（用于分享奖励信息）
    public bannerImgNameBigwin: string = "";
    public bannerImgNameSuperwin: string = "";
    public bannerImgNameMegawin: string = "";

    /**
     * 获取单例实例（与原JS保持一致，继承自SlotManager的Instance）
     */
    public static getInstance(): ZhuquefortuneManager {
        return SlotManager.Instance as ZhuquefortuneManager;
    }

    /**
     * 节点加载时执行（重写父类方法）
     */
    onLoad(): void {
        super.onLoad(); // 调用父类onLoad

        // 初始化组件引用
        this.game_components = this.node.getComponent(GameComponents_Zhuquefortune);
        this.subgame_state = new SubGameStateManager_Zhuquefortune();
        this.subgame_state?.setManager(this);
    }

    /**
     * 播放主背景音乐（根据当前子游戏模式切换BGM）
     */
    public playMainBgm(): void {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const soundController = SlotSoundController.Instance();

        switch (nextSubGameKey) {
            case "base":
                soundController.playAudio("BaseBGM", "BGM");
                break;
            case "jackpot":
            case "jackpot_super":
                soundController.playAudio("JackpotModeBGM", "BGM");
                break;
            default:
                soundController.playAudio("LockNRollBGM", "BGM");
                break;
        }
    }

    /**
     * 异步准备场景加载（无返回值异步方法，原JS的__awaiter转换为async/await）
     */
    public async asyncSceneLoadPrepare(): Promise<void> {
        // 关闭键盘和鼠标拖拽事件
        this.setKeyboardEventFlag(false);
        this.setMouseDragEventFlag(false);

        // 初始化相机控制
        const cameraStartPos = cc.v2(0, 0);
        const cameraTargetPos = cc.v2(0, 685);
        CameraControl.Instance.initCameraControl(cameraStartPos, cameraTargetPos);
        CameraControl.Instance.scrollUpScreen(0);

        // 注册游戏规则观察者、初始化奖池
        SlotGameRuleManager.Instance.addObserver(this.node);
        const potComponent = this.game_components?.potComponent?.getComponent(PotComponent_Zhuquefortune);
        potComponent.initPot();
        potComponent.updateSuperPot();
        potComponent.setSuperPot(true);

        // 设置Jackpot符号ID
        this.game_components?.setJackpotSymbolID();
    }

    /**
     * 异步执行场景加载特效（核心初始化逻辑，转换为async/await）
     */
    public async asyncSceneLoadEffect(): Promise<void> {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();

        // 设置底部欢迎文本
        SlotManager.Instance.bottomUIText.setBottomTextInfo(
            BottomTextType.CustomData,
            `Welcome to ${SlotGameRuleManager.Instance.slotName}`
        );

        // 分支处理不同游戏模式
        if (nextSubGameKey === "base") {
            this.setBaseMode();
            // 显示入场介绍和闲置状态
            this.game_components?.enteranceComponent?.getComponent(EnteranceComponent_Zhuquefortune)?.showIntro();
            this.game_components?.expectComponent?.getComponent(ExpectComponent_Zhuquefortune)?.setIdle();

            // 延迟3秒（对应原JS的AsyncHelper.delay）
            await AsyncHelper.delay(3);
        } else if (this.isLockNRollMode(nextSubGameKey)) {
            this.setLockNRollMode();
        } else if (nextSubGameKey === "jackpot" || nextSubGameKey === "jackpot_super") {
            await new Promise<void>((resolve) => {
                this.setJackpotMode(() => {
                    // 自动启动下一次旋转
                    if (this.isNextSpinAutoStart()) {
                        this.spinAfterCloseAllPopup();
                    }
                    resolve();
                });
            });
        }

        // 播放背景音乐、初始化相机回调
        this.playMainBgm();
        CameraControl.Instance.callbackScrollUp = this.callbackOnScrollUp.bind(this);
        CameraControl.Instance.callbackScrollDown = this.callbackOnScrollDown.bind(this);

        // 相机缩放和滚动
        const zoomRatio = nextSubGameKey === "base" ? 1 : 0;
        CameraControl.Instance.resetZoomRelative(zoomRatio, false);
        CameraControl.Instance.scrollDownScreen(zoomRatio, cc.easeOut(2));

        // 延迟对应时间（对应原JS的AsyncHelper.delay）
        await AsyncHelper.delay(zoomRatio);

        // 开启输入事件、延迟加载UI规则
        this.setKeyboardEventFlag(true);
        this.setMouseDragEventFlag(true);
        SlotUIRuleManager.Instance.delayLoad();

        // 自动启动下一次旋转
        if (this.isNextSpinAutoStart()) {
            this.spinAfterCloseAllPopup();
        }
    }

    /**
     * 设置入场窗口（初始化滚轮符号显示）
     */
    public setEntranceWindow(): void {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey() || "base";
        const entranceWindow = SlotGameRuleManager.Instance.getEntranceWindow(nextSubGameKey);
        const baseReelStrip = SlotGameRuleManager.Instance.getReelStrip("base");
        const reelMachine = this.reelMachine as ReelMachine_Zhuquefortune;

        // 初始化基础滚轮
        for (let o = 0; o < reelMachine.reels.length; o++) {
            const reelBand = baseReelStrip.getReel(o).defaultBand;
            const window = entranceWindow?.GetWindow(o);
            const randomIndex = Math.floor(Math.random() * reelBand.length);

            const reelComponent = reelMachine.reels[o].getComponent(Reel);
            if (window) {
                reelComponent.invalidate(baseReelStrip.getReel(o).defaultBand, randomIndex, o, window);
            } else {
                reelComponent.invalidate(baseReelStrip.getReel(o).defaultBand, randomIndex, o);
            }
        }

        // 处理base模式下的Jackpot符号（符号ID=90）
        if (nextSubGameKey === "base") {
            for (let o = 0; o < 5; o++) {
                for (let l = 0; l < 3; l++) {
                    const symbolNode = reelMachine.reels[o].getComponent(Reel).getSymbol(l);
                    const symbolComponent = symbolNode.getComponent(Symbol);
                    if (symbolComponent.symbolId === 90) {
                        symbolNode.getComponent(JackpotSymbolComponent_Zhuquefortune)?.setEnranceInfo();
                    }
                }
            }
        }

        // 初始化LockNRoll滚轮
        const lockNRollReelStrip = SlotGameRuleManager.Instance.getReelStrip("lockNRoll_mini");
        for (let o = 0; o < reelMachine.lockNRoll_Reels.length; o++) {
            const reelBand = lockNRollReelStrip.getReel(o).defaultBand;
            const randomIndex = Math.floor(Math.random() * reelBand.length);
            const window = new Window(5);
            
            // 初始化窗口符号为0
            for (let i = 0; i < 5; i++) {
                window.setSymbol(i, 0);
            }

            const reelComponent = reelMachine.lockNRoll_Reels[o].getComponent(Reel);
            reelComponent.invalidate(lockNRollReelStrip.getReel(o).defaultBand, randomIndex, o, window);
            
            // 修改符号状态
            reelComponent.changeSymbol(-1, 0);
            reelComponent.changeSymbol(0, 0);
            reelComponent.changeSymbol(1, 0);
        }
    }

    /**
     * 判断是否自动启动下一次旋转
     */
    public isNextSpinAutoStart(): boolean {
        return SlotGameResultManager.Instance.getNextSubGameKey() !== "base";
    }

    /**
     * 获取当前子游戏状态
     */
    public getSubGameState(): any {
        const subGameKey = this.getSubGameKeyAtStartSpin();
        if (!this.subgame_state) return null;

        switch (subGameKey) {
            case "base":
                return this.subgame_state.getBaseGameState();
            case "jackpot":
            case "jackpot_super":
                return this.subgame_state.getJackpotGameState();
            default:
                return this.subgame_state.getLockandRollGameState();
        }
    }

    /**
     * 相机上滚回调（播放入场骨骼动画）
     */
    public callbackOnScrollUp(): void {
        this.game_components?.enteranceComponent?.getComponent(EnteranceComponent_Zhuquefortune)?.playSkeletons();
    }

    /**
     * 相机下滚回调（暂停入场骨骼动画）
     */
    public callbackOnScrollDown(): void {
        this.game_components?.enteranceComponent?.getComponent(EnteranceComponent_Zhuquefortune)?.pauseSkeletons();
    }

    /**
     * 处理分享信息变更（设置横幅图片名称）
     */
    public processChangeShareInfo(): void {
        this.bannerImgNameBigwin = "slot-zhuquefortune-win-big-20250919.jpg";
        this.bannerImgNameSuperwin = "slot-zhuquefortune-win-huge-20250919.jpg";
        this.bannerImgNameMegawin = "slot-zhuquefortune-win-mega-20250919.jpg";
    }

    /**
     * 设置基础游戏模式
     */
    public setBaseMode(): void {
        this.game_components?.uiComponent?.getComponent(UIComponent_Zhuquefortune)?.setBase();
        (this.reelMachine as ReelMachine_Zhuquefortune)?.showBaseReels();
    }

    /**
     * 设置Lock&Roll游戏模式
     */
    public setLockNRollMode(): void {
        this.game_components.uiComponent?.getComponent(UIComponent_Zhuquefortune)?.setLockNRoll();
        (this.reelMachine as ReelMachine_Zhuquefortune)?.showLockAndRollReels();

        const subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);

        // 激活锁组件和剩余次数UI
        this.game_components.lockComponent.active = true;
        this.game_components.remainCount?.getComponent(RemainCountComponent_Zhuquefortune)?.showUI();

        let targetSubGameKey = subGameKey;
        let targetSubGameState = subGameState;

        // 验证子游戏状态有效性，无效则降级处理
        if (!TSUtility.isValid(targetSubGameState) || !TSUtility.isValid(targetSubGameState.lastWindows) || targetSubGameState.lastWindows.length === 0) {
            targetSubGameKey = this.getDegradedLockNRollKey(subGameKey);
            targetSubGameState = SlotGameResultManager.Instance.getSubGameState(targetSubGameKey);
        }

        const lastWindows = targetSubGameState.lastWindows;
        const lastSymbolInfoWindow = targetSubGameState.lastSymbolInfoWindow;
        const lockComponent = this.game_components?.lockComponent?.getComponent(LockComponent_Zhuquefortune);

        if (targetSubGameKey === "base") {
            lockComponent?.fixWindowNoneEffect(lastWindows, lastSymbolInfoWindow);
        } else {
            lockComponent?.fixFirstWindowNoneEffect(lastWindows, lastSymbolInfoWindow);
        }
    }

    /**
     * 设置Jackpot游戏模式
     * @param callback 模式切换完成后的回调
     */
    public setJackpotMode(callback: () => void): void {
        this.game_components?.jackpotModeNode?.getComponent(JackpotModeComponent_Zhuquefortune)?.showJackpotMode(callback);
        (this.reelMachine as ReelMachine_Zhuquefortune)?.showBaseReels();
    }

    /**
     * 设置下一次特效标记
     */
    public setNextEffect(): void {
        this.next_Effect = false;
        const subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const isJackpotMode = subGameKey === "jackpot";
        const historyWindows = SlotGameResultManager.Instance.getHistoryWindows()[0];

        // 统计符号ID=90的数量
        let symbol90Count = 0;
        for (let a = 0; a < 5; a++) {
            for (let i = 0; i < 3; i++) {
                if (historyWindows.GetWindow(a).getSymbol(i) === 90) {
                    symbol90Count++;
                }
            }
        }

        // 设置特效标记
        if (symbol90Count >= 6) {
            this.next_Effect = Math.random() >= 0.5;
        }
        if (symbol90Count < 6 && isJackpotMode) {
            this.next_Effect = Math.random() >= 0.5;
        }
        if (subGameKey === "base") {
            const isRare = Math.random() < 0.005;
            if (symbol90Count > 0 && isRare) {
                this.next_FalseEffect = true;
            }
        }
    }

    /**
     * 清除虚假特效标记
     */
    public setFalseFX(): void {
        this.next_Effect = false;
        this.next_FalseEffect = false;
    }

    /**
     * 获取下一次特效标记
     */
    public getNextEffect(): boolean {
        return this.next_Effect;
    }

    /**
     * 获取下一次虚假特效标记
     */
    public getNextFalseEffect(): boolean {
        return this.next_FalseEffect;
    }

    /**
     * 设置更新计数
     */
    public setUpdateCount(): void {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        let symbol90Count = 0;

        // 统计符号ID=90的数量
        for (let n = 0; n < 5; n++) {
            for (let o = 0; o < 3; o++) {
                if (lastHistoryWindows.GetWindow(n).getSymbol(o) === 90) {
                    symbol90Count++;
                }
            }
        }

        this.update_Count = Math.floor(Math.random() * symbol90Count);
    }

    /**
     * 获取更新计数
     */
    public getUpdateCount(): number {
        return this.update_Count;
    }

    /**
     * 发送奖励游戏请求
     * @param callback 请求完成后的回调
     */
    async sendBonusGameRequest(callback: (result: any) => void, params: any[] = []) {
        const spinResult = await this.sendSpinRequest(null);

        // 验证实例有效性和旋转状态
        if (!TSUtility.isValid(this) || !this.isAvailable() || !this.checkSpinErrorState(spinResult)) {
            return;
        }

        this.flagSpinRequest = true;
        SlotGameResultManager.Instance.resetGameResult();
        SlotGameResultManager.Instance.setGameResult(spinResult);

        // 执行旋转前后的处理逻辑
        const beforeSpinResult = this.slotInterface.onBeforeSpinProcess(spinResult);
        this.onSpinProcess(spinResult, beforeSpinResult);
        this.slotInterface.onAfterSpinProcess(spinResult, beforeSpinResult);

        // 执行回调
        callback(spinResult);
    }

    /**
     * 解析扩展映射字符串
     */
    public parseExMapString(): (ResultSymbolInfo[][] | null) {
        const exMapString = SlotGameResultManager.Instance.getSpinResult().exMapString;
        if (!TSUtility.isValid(exMapString) || exMapString === "") {
            return null;
        }

        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        return this.parseSymbolData(exMapString[currentSubGameKey]);
    }

    /**
     * 解析符号数据（JSON字符串转ResultSymbolInfo二维数组）
     * @param jsonStr 符号数据JSON字符串
     */
    public parseSymbolData(jsonStr: string): ResultSymbolInfo[][] | null {
        try {
            const symbolData = JSON.parse(jsonStr) as any[][];
            const result: ResultSymbolInfo[][] = [];

            for (let o = 0; o < symbolData.length; o++) {
                const row: ResultSymbolInfo[] = [];
                const rowData = symbolData[o];

                for (let l = 0; l < rowData.length; l++) {
                    const cellData = rowData[l];
                    const symbolInfo = new ResultSymbolInfo();

                    // 赋值符号信息属性
                    symbolInfo.type = cellData.type || "";
                    symbolInfo.key = `${o}-${l}`;
                    symbolInfo.prize = cellData.prize || 0;
                    symbolInfo.prizeUnit = cellData.prizeUnit || "";
                    symbolInfo.subID = 0;
                    symbolInfo.multiplier = cellData.multiplier || 1;
                    symbolInfo.exValue = cellData.freq || 0;
                    symbolInfo.orgPrize = cellData.prize || 0;
                    symbolInfo.symbol = cellData.symbol;
                    symbolInfo.subSymbolInfos = [];

                    row.push(symbolInfo);
                }

                result.push(row);
            }

            return result;
        } catch (error) {
            console.error("朱雀财富：符号数据JSON解析失败", error);
            throw new Error("无效的符号数据JSON格式");
        }
    }

    // ===================== 私有辅助方法 =====================
    /**
     * 判断是否为Lock&Roll模式
     * @param subGameKey 子游戏Key
     */
    private isLockNRollMode(subGameKey: string): boolean {
        return [
            "lockNRoll_mini",
            "lockNRoll_minor",
            "lockNRoll_major",
            "lockNRoll_mega",
            "lockNRoll_grand"
        ].includes(subGameKey);
    }

    /**
     * 获取降级后的Lock&Roll模式Key
     * @param originalKey 原始子游戏Key
     */
    private getDegradedLockNRollKey(originalKey: string): string {
        switch (originalKey) {
            case "lockNRoll_minor":
                return "lockNRoll_mini";
            case "lockNRoll_major":
                return "lockNRoll_minor";
            case "lockNRoll_mega":
                return "lockNRoll_major";
            case "lockNRoll_grand":
                return "lockNRoll_mega";
            default:
                return "base";
        }
    }
}

// 配置插槽场景信息（与原JS保持一致）
SDefine.setSlotSceneInfo({
    sceneName: "219_Zhuquefortune",
    gameId: ZhuquefortuneManager.SUBGAMEID_SLOT,
    name: ZhuquefortuneManager.NAME_SLOT,
    prefabName: "simpleImg",
    useDev: true,
    useQA: true,
    useLive: true,
    sImg: "80_219_ZhuqueFortune_S",
    nImg: "80_219_ZhuqueFortune_L"
});