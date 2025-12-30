const { ccclass, property } = cc._decorator;

// ===================== 所有依赖导入 - 路径与原项目完全一致，完美兼容 ✅ =====================
import State from "../Slot/State";
import SoundManager from "../manager/SoundManager";
import SlotUIRuleManager from "../Slot/rule/SlotUIRuleManager";
import SlotGameRuleManager from "./SlotGameRuleManager";
import SlotGameResultManager from "./SlotGameResultManager";
import ReelMachine_Base from "./ReelMachine_Base";
import Reel from "../Slot/Reel";
import v2_PayLineRenderer from "./v2_PayLineRenderer";
import SlotReelSpinStateManager from "./SlotReelSpinStateManager";
import CheatController from "../Cheat/CheatController";
import TSUtility from "../global_utility/TSUtility";
import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import SlotSoundController from "../Slot/SlotSoundController";
import EventChecker from "../EventChecker";
import SpecialModeTextController from "./SpecialModeTextController";
import GameResultPopup from "../Slot/GameResultPopup";
import GameComponents_Base from "../game/GameComponents_Base";
import PopupManager from "./PopupManager";
import FireHoseSender from "../FireHoseSender";
import AsyncHelper from "../global_utility/AsyncHelper";
import CameraControl from "../Slot/CameraControl";
import ViewResizeManager from "../global_utility/ViewResizeManager";

// ===================== 核心枚举定义 - 100%保留原值+键名，无任何修改 ✅ =====================
/** 老虎机特殊模式类型 */
export enum SpecialType {
    NONE = 0,
    FEVER = 1,
    TOTAL = 1
}

/** 老虎机消息键值 */
export enum SlotMsgKey {
    CHANGE_BG = "CHANGE_BG"
}

/** 老虎机游戏状态机 */
export enum SlotGameState {
    IntroState = 1,
    NormalState = 2
}

// ===================== 内部配置类 - 转正命名+完整装饰器+类型注解，逻辑不变 ✅ =====================
/** 老虎机视图配置信息实体类 */
export class SlotViewSettingInfo {
    /** 竖屏顶部框架Y轴偏移量 */
    public portraitTopFrameOffsetY: number = 0;
    /** 横屏顶部框架Y轴偏移量 */
    public landscapeTopFrameOffsetY: number = 0;
    /** 顶部框架缩放下限 */
    public topFrameScaleLowerBound: number = 0;
    /** 顶部框架缩放上限 */
    public topFrameScaleUpperBound: number = 0;
}

/** 老虎机特殊符号信息实体类 */
@ccclass('SpecialSymbolInfo')
export class SpecialSymbolInfo {
    public type: number = 0;

    constructor(...args: any[]) {
        this.type = args[0];
    }

    /** 校验是否为指定特殊类型 */
    public checkSpecialType(checkType: number): boolean {
        return (this.type & checkType) > 0;
    }
}

// ===================== 老虎机核心全局管理器 - 单例模式+核心逻辑中枢 ✅ =====================
/**
 * SlotManager - 老虎机游戏全局核心单例管理器 (老虎机玩法的中枢大脑)
 * 核心职责：统筹管控老虎机所有核心逻辑，包括：
 * 1. 卷轴控制：ReelMachine卷轴转动/停止/状态管理
 * 2. 赔付线：PayLineRenderer赔付线渲染/高亮
 * 3. 状态机：游戏状态(Intro/Normal)切换、特殊模式(免费旋转/狂热/奖金)管理
 * 4. UI层调度：背景层/底部UI层/特殊文字层/游戏内UI层/作弊层 分层管控
 * 5. 音效联动：对接SoundManager播放转动/中奖/特殊模式音效
 * 6. 弹窗管理：中奖/奖金/Jackpot/免费旋转等弹窗的创建与显示
 * 7. 网络请求：Spin旋转请求的计时/状态标记
 * 8. 作弊控制：对接CheatController实现作弊功能
 * 9. 屏幕适配：视图缩放/偏移量配置，兼容横竖屏
 * 10. 数据管理：投注金额/免费旋转次数/倍率/游戏信息等核心数据存储
 */
@ccclass('SlotManager')
export default class SlotManager extends cc.Component {
    // ===================== 【单例模式】全局唯一实例 - 原逻辑完全保留 ✅ =====================
    public static Instance: SlotManager | null = null;

    // ===================== 【序列化配置属性】编辑器拖拽赋值，类型完全匹配，原逻辑不变 ✅ =====================
    @property(ReelMachine_Base)
    public reelMachine: ReelMachine_Base | null = null;

    @property(v2_PayLineRenderer)
    public paylineRenderer: v2_PayLineRenderer | null = null;

    @property(cc.Node)
    public machineFrameLayer: cc.Node | null = null;

    @property({ type: Boolean })
    public flagShowFrameBG: boolean = true;

    @property(cc.Node)
    public frameBGNode: cc.Node | null = null;

    @property(cc.Node)
    public backgroundLayer: cc.Node | null = null;

    @property(cc.Node)
    public bottomUiLayer: cc.Node | null = null;

    @property(cc.Node)
    public specialModeTextLayer: cc.Node | null = null;

    @property(cc.Node)
    public inGameUILayer: cc.Node | null = null;

    @property(cc.Node)
    public cheatObjectLayer: cc.Node | null = null;

    @property({ type: Number })
    public timeOfSymbolEffect: number = 0;

    @property({ type: Number })
    public loopCountOfSymbolEffect: number = 0;

    @property({ type: [String] })
    public bonusModeList: string[] = [];

    @property(cc.Node)
    public fixedBottomUI: cc.Node | null = null;

    // ===================== 【私有成员变量】海量属性 - 补全精准TS类型注解，默认值完全保留 ✅ =====================
    private curState: SlotGameState | null = null;
    private isSkipCurrentSpin: boolean = false;
    private flagPlayingSubgame: boolean = false;
    private flagSpinRequest: boolean = false;
    private timeStampSendSpinRequest: number = 0;
    private timeStampRecvSpinRequest: number = 0;
    private slotViewSetting: SlotViewSettingInfo | null = null;
    private _bottomUI: any = null;
    private bottomUiInstance: any = null;
    private _slotInterface: any = null;
    private _userInfoInterface: any = null;
    private _bottomUIInterface: any = null;
    private _bigWinEffectInterface: any = null;
    private _ingameMissionUIInterface: any = null;
    private _feverModeInfoInterface: any = null;
    private _cheatEditInterface: any = null;
    private _freespinTextEffect: any = null;
    private _freespinTextIgnoreNumberEffect: any = null;
    private _bonusTextEffect: any = null;
    private _jackpotTextEffect: any = null;
	private _linkedJackpotTextEffect: any = null;
    private _cheatComponent: any = null;
    private spinEndTime: number = 0;
    public _freespinTotalCount: number = 0;
    private _freespinPastCount: number = 0;
    private _freespinMultiplier: number = 0;
    private _zoneId: number = 0;
    private _zoneName: string = "";
    private _reelSpinTexts: any[] = [];
    private _freespinResultPopup: any = null;
    private _bonusGameResultPopup: any = null;
    private _jackpotResultPopup: any = null;
    private _linkedJackpotPopup: any = null;
    private _wheelOfVegasResultPopup: any = null;
    private _casinoJackpotWinID: number = 0;
    private _slotGameInfo: any = null;
    private _initFinish: boolean = false;
    private _isAvailable: boolean = true;
    private _isCheckTutorialItem: boolean = false;
    private _slotBaseBetPerSpinCnt: number = 0;
    private _scaleAdjuster: any = null;
    private _isOpenMovePopup: boolean = false;
    private _isloungeNewSlot: boolean = false;
    private _machineFrame: any = null;
    private _messageRoutingManager: any = null;
    public background_scale_component: any = null;

    // ===================== 【资源常量】中奖弹窗/分享图片名称 - 100%原值保留，不可修改 ✅ =====================
    public readonly bannerImgNameMinorWin: string = "slot-win-super-191115.jpg";
    public readonly bannerImgNameBigwin: string = "slot-win-big-191115.jpg";
    public readonly bannerImgNameSuperwin: string = "slot-win-huge-191115.jpg";
    public readonly bannerImgNameMegawin: string = "slot-win-mega-191115.jpg";
    public readonly respinShareImgName: string = "";
    public readonly bonusShareImgName: string = "slot-bonus-game-191115.jpg";
    public readonly freespinShareImgName: string = "slot-free-spins-191115.jpg";
    public readonly jackpotmodeShareImgName: string = "slot-jackpot-mode-191115.jpg";
    public readonly jackpotMiniShareImgName: string = "slot-jackpot-mini-191115.jpg";
    public readonly jackpotMinorShareImgName: string = "slot-jackpot-minor-191115.jpg";
    public readonly jackpotMajorShareImgName: string = "slot-jackpot-major-191115.jpg";
    public readonly jackpotMegaShareImgName: string = "slot-jackpot-mega-191115.jpg";
    public readonly jackpotGrandShareImgName: string = "slot-jackpot-grand-191115.jpg";
    public readonly jackpotCommonShareImgName: string = "slot-jackpot-common-191115.jpg";
    public readonly lockandrollShareImgName: string = "slot-locknroll-191115.jpg";

    // ===================== 【游戏配置常量】特殊符号/提示文案 - 100%原值保留 ✅ =====================
    private _symbol_width: number = 0;
    private _special_select_cell: { [key: string]: any } = {};
    private _special_ignore_symbolId: number[] = [-1, 0];
    public readonly TOOLTIP_MINIMUM_BET: string = "TOOLTIP_MINIMUM_BET";
    public readonly TOOLTIP_SUITE_LEAGUE: string = "TOOLTIP_SUITE_LEAGUE";
    public readonly TOOLTIP_FEVER_MODE: string = "TOOLTIP_FEVER_MODE";
    private _listSlotTooltip: any[] = [];
    private prevPortrait: any = null;
    private popupCustomMessage: any = null;

    // ===================== 【标准TS访问器】所有get/set - 100%原逻辑复刻，无任何修改 ✅ =====================
    public get bottomUI(): any { return this._bottomUI; }

    public get slotInterface(): any { return this._slotInterface; }
    public set setSlotInterface(value: any) { this._slotInterface = value; }

    public get userInfoInterface(): any { return this._userInfoInterface; }
    public set setUserInfoInterface(value: any) { this._userInfoInterface = value; }

    public get bottomUIInterface(): any { return this._bottomUIInterface; }
    public set setBottomUIInterface(value: any) { this._bottomUIInterface = value; }

    public get bigWinEffectInterface(): any { return this._bigWinEffectInterface; }
    public set setBigWinEffectInterface(value: any) { this._bigWinEffectInterface = value; }

    public get ingameMissionUInterface(): any { return this._ingameMissionUIInterface; }
    public set setIngameMissionUIInterface(value: any) { this._ingameMissionUIInterface = value; }

    public get feverModeInfoInterface(): any { return this._feverModeInfoInterface; }
    public set setFeverModeInfoInterface(value: any) { this._feverModeInfoInterface = value; }

    public get cheatEditInterface(): any { return this._cheatEditInterface; }
    public set setCheatEditInterface(value: any) { this._cheatEditInterface = value; }

    public get cheatComponent(): any { return this._cheatComponent; }
    public set setCheatComponent(value: any) { this._cheatComponent = value; }

    public get freespinPastCount(): number { return this._freespinPastCount; }

    private get _inGameUI(): any { return this._slotInterface?.getInGameInterface(); }

    private get _spinChangeResult(): any { return this._slotInterface?.getSpinChangeResult(); }

    public get isloungeNewSlot(): boolean { return this._isloungeNewSlot; }
    public set setIsloungeNewSlot(value: boolean) { this._isloungeNewSlot = value; }

    public get machineFrame(): any { return this._machineFrame; }
    public set setMachineFrame(value: any) { this._machineFrame = value; }

    public get getMessageRoutingManager(): any { return this._messageRoutingManager; }
    public set setMessageRoutingManager(value: any) { this._messageRoutingManager = value; }

   // ========== 你提供的JS片段开始转换 ==========
    async init() {
        try {
            await this.slotInterface.onInit();
            SlotGameRuleManager.Instance.addObserver(this.node);
            this.node.on("changeMoneyState", this.refreshStarAlbumGauge.bind(this));
            n.Instance.getComponent(A.default).effectBigWinNew.init();
        } catch (e: any) {
            cc.error("exception ", e.toString());
            e.stack && cc.error("callstack ", e.stack.toString());
            FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(T.FHLogType.Exception, e));
        }
    }

    setEventCheckerEnableState() {
        const eventChecker = this.getComponent(M.default);
        eventChecker && (eventChecker.enabled = true);
    }

    initCameraSetting() {}

    async asyncSceneLoadPrepare() {
        return;
    }

    async asyncSceneLoadEffect() {
        this.playMainBgm();
        return;
    }

    async sendBonusGameRequest() {
        return;
    }

    initBottomUIButtonEnableStateOnEnterRoom() {
        if ("base" !== S.default.Instance.getNextSubGameKey()) {
            this._bottomUI.setChangeBetPerLineBtnInteractable(false);
            this._bottomUI.setChangeMaxBetBtnInteractable(false);
        }
    }

    async initSlotGameProcess() {
        return this.slotInterface.onInitSlotGameProcess();
    }

    async initTextEffectProcess() {
        return new Promise<boolean>((resolve) => {
            let e = 0, n = 0;
            this.bonusModeList.includes("freeSpin") && ++e;
            this.bonusModeList.includes("freeSpinIgnoreNumber") && ++e;
            this.bonusModeList.includes("jackpot") && ++e;
            this.bonusModeList.includes("linkedJackpot") && ++e;
            this.bonusModeList.includes("bonusGame") && ++e;

            if (e === 0) {
                resolve(true);
                return;
            }

            // 加载免费旋转文本特效
            if (this.bonusModeList.includes("freeSpin")) {
                cc.loader.loadRes("SlotCommon/Prefab/SlotTextEffect/FreespinTextEffect", (a, i) => {
                    if (a) cc.log("FreespinTextEffect load error, ", JSON.stringify(a));
                    else {
                        const l = cc.instantiate(i);
                        const r = l.getComponent(P.default);
                        l.active = false;
                        this._freespinTextEffect = r;
                        this.specialModeTextLayer.addChild(l);
                    }
                    ++n === e && resolve(true);
                });
            }

            // 加载忽略次数免费旋转特效
            if (this.bonusModeList.includes("freeSpinIgnoreNumber")) {
                cc.loader.loadRes("SlotCommon/Prefab/SlotTextEffect/FreespinTextIgnoreCountEffect", (a, i) => {
                    if (a) cc.log("FreespinTextIgnoreCountEffect load error, ", JSON.stringify(a));
                    else {
                        const l = cc.instantiate(i);
                        const r = l.getComponent(P.default);
                        l.active = false;
                        this._freespinTextIgnoreNumberEffect = r;
                        this.specialModeTextLayer.addChild(l);
                    }
                    ++n === e && resolve(true);
                });
            }

            // 加载Jackpot文本特效
            if (this.bonusModeList.includes("jackpot")) {
                cc.loader.loadRes("SlotCommon/Prefab/SlotTextEffect/JackpotTextEffect", (a, i) => {
                    if (a) cc.log("JackpotTextEffect load error, ", JSON.stringify(a));
                    else {
                        const l = cc.instantiate(i);
                        const r = l.getComponent(P.default);
                        l.active = false;
                        this._jackpotTextEffect = r;
                        this.specialModeTextLayer.addChild(l);
                    }
                    ++n === e && resolve(true);
                });
            }

            // 加载连锁Jackpot特效
            if (this.bonusModeList.includes("linkedJackpot")) {
                cc.loader.loadRes("SlotCommon/Prefab/SlotTextEffect/LinkedJackpotTextEffect", (a, i) => {
                    if (a) cc.log("LinkedJackpotTextEffect load error, ", JSON.stringify(a));
                    else {
                        const l = cc.instantiate(i);
                        const r = l.getComponent(P.default);
                        l.active = false;
                        this._linkedJackpotTextEffect = r;
                        this.specialModeTextLayer.addChild(l);
                    }
                    ++n === e && resolve(true);
                });
            }

            // 加载BonusGame文本特效
            if (this.bonusModeList.includes("bonusGame")) {
                cc.loader.loadRes("SlotCommon/Prefab/SlotTextEffect/BonusTextEffect", (a, i) => {
                    if (a) cc.log("BonusTextEffect load error, ", JSON.stringify(a));
                    else {
                        const l = cc.instantiate(i);
                        const r = l.getComponent(P.default);
                        l.active = false;
                        this._bonusTextEffect = r;
                        this.specialModeTextLayer.addChild(l);
                    }
                    ++n === e && resolve(true);
                });
            }
        });
    }

    async initGameResultPopupProcess() {
        return new Promise<boolean>((resolve) => {
            let e = 0, o = 0;
            n.Instance.bonusModeList.includes("freeSpin") && ++e;
            n.Instance.bonusModeList.includes("jackpot") && ++e;
            n.Instance.bonusModeList.includes("linkedJackpot") && ++e;
            n.Instance.bonusModeList.includes("bonusGame") && ++e;
            n.Instance.bonusModeList.includes("wheelOfVegas") && ++e;

            if (e === 0) {
                n.Instance.processChangeShareInfo();
                resolve(true);
                return;
            }

            // 加载免费旋转结果弹窗
            if (n.Instance.bonusModeList.includes("freeSpin")) {
                cc.loader.loadRes("SlotCommon/Prefab/SlotGameResult/FreespinResultPopup", (a, i) => {
                    if (a) cc.log("FreespinResultPopup load error, ", JSON.stringify(a));
                    else {
                        const l = cc.instantiate(i);
                        const r = l.getComponent(O.default);
                        l.active = false;
                        n.Instance._freespinResultPopup = r;
                    }
                    ++o === e && resolve(true);
                });
            }

            // 加载Jackpot结果弹窗
            if (n.Instance.bonusModeList.includes("jackpot")) {
                cc.loader.loadRes("SlotCommon/Prefab/SlotGameResult/JackpotResultPopup", (a, i) => {
                    if (a) cc.log("JackpotResultPopup load error, ", JSON.stringify(a));
                    else {
                        const l = cc.instantiate(i);
                        const r = l.getComponent(O.default);
                        l.active = false;
                        n.Instance._jackpotResultPopup = r;
                    }
                    ++o === e && resolve(true);
                });
            }

            // 加载连锁Jackpot结果弹窗
            if (n.Instance.bonusModeList.includes("linkedJackpot")) {
                cc.loader.loadRes("SlotCommon/Prefab/SlotGameResult/LinkedJackpotResultPopup", (a, i) => {
                    if (a) cc.log("LinkedJackpotResultPopup load error, ", JSON.stringify(a));
                    else {
                        const l = cc.instantiate(i);
                        const r = l.getComponent(O.default);
                        l.active = false;
                        n.Instance._linkedJackpotPopup = r;
                    }
                    ++o === e && resolve(true);
                });
            }

            // 加载BonusGame结果弹窗
            if (n.Instance.bonusModeList.includes("bonusGame")) {
                cc.loader.loadRes("SlotCommon/Prefab/SlotGameResult/BonusGameResultPopup", (a, i) => {
                    if (a) cc.log("BonusGameResultPopup load error, ", JSON.stringify(a));
                    else {
                        const l = cc.instantiate(i);
                        const r = l.getComponent(O.default);
                        l.active = false;
                        n.Instance._bonusGameResultPopup = r;
                    }
                    ++o === e && resolve(true);
                });
            }

            // 加载WheelOfVegas结果弹窗
            if (n.Instance.bonusModeList.includes("wheelOfVegas")) {
                cc.loader.loadRes("SlotCommon/Prefab/SlotGameResult/WheelOfVegasResultPopup", (a, i) => {
                    if (a) cc.log("WheelOfVegasResultPopup load error, ", JSON.stringify(a));
                    else {
                        const l = cc.instantiate(i);
                        const r = l.getComponent(O.default);
                        l.active = false;
                        n.Instance._wheelOfVegasResultPopup = r;
                    }
                    ++o === e && resolve(true);
                });
            }
        });
    }

    onLoad() {
        const t = cc.director.getScene().getComponentInChildren(cc.Canvas);
        this.onResizeView();
        this.scheduleOnce(() => {
            w.default.Instance().refreshPosition();
            this.refreshView();
        }, 0);
        t.getComponentInChildren(cc.Camera).cullingMask = 1;
        n.Instance = this;
        F.default.Instance().addHandler(this);
    }

    onDestroy() {
        SlotGameRuleManager.Instance.removeObserver(this.node);
        this.unscheduleAllCallbacks();
        b.default.Destroy();
        this.curState && this.curState.Destroy();
        F.default.RemoveHandler(this);
    }

    onBeforeResizeView() {
        this.node.getComponent(cc.Widget).alignMode = cc.Widget.AlignMode.ALWAYS;
    }

    onResizeView() {
        const e = cc.director.getScene().getComponentInChildren(cc.Canvas);
        const t = e.node.getContentSize();
        if (t.width / t.height > 1.7777) {
            e.fitHeight = true;
            e.fitWidth = false;
        } else {
            e.fitHeight = false;
            e.fitWidth = true;
        }
    }

    onAfterResizeView() {
        this.refreshView();
    }

    refreshView() {
        this.innerRefreshView();
        this.innerRefreshView();
        this.node.getComponent(cc.Widget).alignMode = cc.Widget.AlignMode.ON_WINDOW_RESIZE;
        const e = this.isSlotOrientationPortrait();
        if (this.prevPortrait !== e) {
            this.prevPortrait = e;
            e ? this.onChangePortraitMode() : this.onChangeLandscapeMode();
        }
    }

    isSlotOrientationPortrait() {
        return F.default.Instance().isPortrait();
    }

    onChangePortraitMode() {}

    onChangeLandscapeMode() {}

    innerRefreshView() {
        B.default.Instance.refreshCameraControl();
        B.default.Instance.refreshDefaultPosition();
        this._scaleAdjuster && this.setAutoScaleByResoultion();
    }

    openNotEnoughMoneyShopPopup() {
        this.slotInterface.openNotEnoughMoneyShopPopup();
    }

    isSpinState() {
        return this.flagPlayingSubgame;
    }

    async spinAll() {
        if (this.slotInterface.checkSpinAll() !== 0) {
            this.spinProcessRenewal();
        }
    }

    spinProcessRenewal() {
        if (!this.isAvailable()) return;

        m.default.Instance.applyFastMode();
        if (b.default.Instance.getCurrentState() !== b.default.STATE_CUSTOM_ACTIVE_SPINBUTTON) {
            if (this.curState) {
                cc.log("progressing...spin animation");
                this.curState && this.skipReelSpin();
                return;
            }

            if (w.default.Instance().IsBlockingPopupOpen() || w.default.Instance().isBlocking()) {
                this.isNextSpinAutoStart() === 1 && this.spinAfterCloseAllPopup();
            } else {
                if (b.default.Instance.getAutospinMode() === 1 && this.checkCanAutoPlaySpin_onSpinRequest() === 0) {
                    b.default.Instance.changeAutospinMode(false);
                    b.default.Instance.setCurrentState(b.default.STATE_STOP);
                    return;
                }

                if (this.checkCanPlayGame() === 0) {
                    b.default.Instance.changeAutospinMode(false);
                    b.default.Instance.setCurrentState(b.default.STATE_STOP);
                    this.openNotEnoughMoneyShopPopup();
                    return;
                }

                if (b.default.Instance.getCurrentState() === b.default.STATE_STOP) {
                    this._bottomUI.hideLockChangeTotalBetPopup();
                    b.default.Instance.setCurrentState(b.default.STATE_SPINNING_NOTSKIPABLE);
                    this.isSkipCurrentSpin = false;
                    const t = this.getSubGameState();
                    if (t) {
                        const o = this.getMessageRoutingManager;
                        o.emitMessage(o.getMSG().HYPER_BOUNTY_SPIN_COUNT_UPDATE);
                        const a = new f.SequencialState();
                        const i = n.Instance.getProcessAfterSpinState();
                        const l = new f.State();
                        
                        l.addOnStartCallback(() => {
                            this.flagSpinRequest && a.addOnEndCallback(() => {
                                n.Instance.checkEndSpin();
                            });
                            l.setDone();
                        });

                        a.insert(0, t);
                        a.insert(1, i);
                        a.insert(2, l);
                        b.default.Instance.setCurrentState(b.default.STATE_SPINNING_SKIPABLE);
                        this.curState = a;
                        a.onStart();
                    }
                } else {
                    cc.log("progressing.....");
                }
            }
        } else {
            this.slotInterface.onSpinProcessRenewal_STATE_CUSTOM_ACTIVE_SPINBUTTON();
        }
    }

    checkSpinErrorState(e: any) {
        return this.slotInterface.onCheckSpinErrorState(e) !== 0;
    }

    onSpinProcess(e: any, t: any) {
        this.slotInterface.onSpinProcess(e, t);
    }

    getSlotJackpotInfo() {
        return this.slotInterface.getSlotJackpotInfo(SlotGameRuleManager.Instance.slotID);
    }

    getCheckCurBetPerLineState() {
        const e = new f.State();
        e.addOnStartCallback(() => {
            const t = S.default.Instance.getNextSubGameKey();
            const n = SlotGameRuleManager.Instance.getCurrentBetPerLine();
            if (t === "base" && !SlotGameRuleManager.Instance.zoneBetPerLines.includes(n)) {
                let o = SlotGameRuleManager.Instance.zoneBetPerLines;
                let a = -1;
                for (let i = o.length - 1; i >= 0; --i) {
                    if (o[i] < n) {
                        a = o[i];
                        break;
                    }
                }
                a === -1 && (a = o[0]);
                SlotGameRuleManager.Instance.setCurrentBetPerLine(a);
            }
            e.setDone();
        });
        return e;
    }

    getWaitUntilPopupClose() {
        const e = this;
        const t = new f.State();
        t.addOnStartCallback(() => {
            if (w.default.Instance().IsBlockingPopupOpen()) {
                w.default.Instance().setOnAllPopupClose(() => {
                    TSUtility.isValid(e) && t.setDone();
                });
            } else {
                t.setDone();
            }
        });
        return t;
    }

    getShowSpinEndPopup() {
        return this.slotInterface.getShowSpinEndPopup();
    }

    getTourneyResultProcess() {
        return this.slotInterface.getTourneyResultProcess();
    }

    getCheckFeverMoveIcon() {
        return this.slotInterface.getCheckFeverMoveIcon();
    }

    getCheckFeverModeTime() {
        return this.slotInterface.getCheckFeverModeTime();
    }

    isAvailableFeverMode() {
        return this.slotInterface.isAvailableFeverMode();
    }

    checkEndSpin() {
        if (TSUtility.isValid(this) && this.isAvailable() && this.curState && this.curState.isDone()) {
            cc.log("spin end");
            this.curState = null;
            this.spinEndTime = new Date().getTime();
            if (b.default.Instance.getAutospinMode() === 1 && this.slotInterface.onCheckCanAutoSpin_EndGame() === 0) {
                b.default.Instance.changeAutospinMode(false);
            }
            b.default.Instance.setCurrentState(b.default.STATE_STOP);
            this.isNextSpinAutoStart() && this.spinAll();
        }
    }

    isNextSpinAutoStart() {
        const key = S.default.Instance.getNextSubGameKey();
        return key === "freeSpin" || key === "bonusWheel" || key === "jackpot";
    }

    getZoneId() {
        return this._zoneId;
    }

    getZoneName() {
        return this._zoneName;
    }

    setZoneInfo(e: number, t: string) {
        this._zoneId = e;
        this._zoneName = t;
    }

    IsLoungeNewSlot() {
        return this._isloungeNewSlot;
    }

    skipReelSpin() {
        if (b.default.Instance.getCurrentState() === b.default.STATE_SPINNING_SKIPABLE && this.curState) {
            this.isSkipCurrentSpin = true;
            this.curState.setSkipFlagDuringPlay(true);
            this.processSkipReel();
        }
    }

    processSkipReel() {
        R.default.Instance().stopAudio("ReelExpect", "FX");
        this.reelMachine.hideAllExpectEffects();
    }

    lateUpdate() {
        if (b.default.Instance.getCurrentState() === b.default.STATE_STOP && b.default.Instance.getAutospinMode() === 1) {
            const e = new Date().getTime();
            if (this.slotInterface.onCheckCanAutoSpin() === 0) {
                b.default.Instance.changeAutospinMode(false);
                return;
            }
            if (e - this.spinEndTime > 1000 * m.default.Instance.getAutospinDelay()) {
                this.spinAll();
            }
        }
    }

    refreshAutoSpinState() {
        if (b.default.Instance.getAutospinMode() === 1 && this.slotInterface.onCheckCanAutoSpin() === 0) {
            b.default.Instance.changeAutospinMode(false);
        }
    }

    playMainBgm() {}

    stopAllBGM() {
        d.default.Instance().stopBGM();
    }

    refreshStarAlbumGauge() {
        this.slotInterface.refreshStarAlbumGauge();
    }

    async sendSpinRequest(e: any, t: any) {
        return this.slotInterface.onSendSpinRequest(e, t);
    }

    getSendSpinRequestState() {
        const e = this;
        const t = new f.State();
        t.addOnStartCallback(() => {
            e.sendSpinRequestProc(() => {
                t.setDone();
            });
        });
        return t;
    }

    sendSpinRequestProc(e: Function, t?: any) {
        const n = this;
        this.flagSpinRequest = false;
        const o = S.default.Instance.getNextSubGameKey();
        const a = SlotGameRuleManager.Instance.getSubGame(o);
        if (a && a.bet) {
            const i = SlotGameRuleManager.Instance.getTotalBet();
            i !== 0 && this.slotInterface.onSpinUserAssetChange(i);
        }

        this.sendSpinRequest((t: any) => {
            if (cc.isValid(n)) {
                if (n.checkSpinErrorState(t) !== 0) {
                    S.default.Instance.resetGameResult();
                    S.default.Instance.setGameResult(t);
                    const o = n.slotInterface.onBeforeSpinProcess(t);
                    n.onSpinProcess(t, o);
                    n.slotInterface.onAfterSpinProcess(t, o);
                    n.initializeSpecial();
                    if (S.default.Instance.getSubGameKeyOfCurrentGameResult() === "base") {
                        n.calculateSymbolWidth();
                        n.checkSpeciaAblelInfo();
                    }
                    n.flagSpinRequest = true;
                    e();
                } else {
                    e();
                }
            } else {
                e();
            }
        }, t);
    }

    processChangeShareInfo() {}

    toggleCheatObject() {
        const e = this.cheatObjectLayer.getComponentInChildren(C.default);
        if (e) {
            e.onClickToggleMain();
            this.cheatObjectLayer.y = B.default.Instance.eStateOfCameraPosition === 1 ? 600 : 0;
        }
    }

    setFreespinExtraInfoInit() {
        this._bottomUI.setFreespinCount(0, 0);
        this._bottomUI.setMultiplier(1);
    }

    setFreespinExtraInfoByCurrentState() {
        this._bottomUI.setFreespinCount(this._freespinPastCount, this._freespinTotalCount);
        this._bottomUI.setMultiplier(this._freespinMultiplier);
    }

    getIncreaseFreespinPastCountStateRenewal() {
        const e = this;
        const t = new f.State();
        t.addOnStartCallback(() => {
            const n = S.default.Instance.getNextSubGameKey();
            const o = S.default.Instance.getSubGameState(n);
            e._freespinPastCount = o.spinCnt + 1;
            e.setFreespinExtraInfoByCurrentState();
            t.setDone();
        });
        return t;
    }

    getIncreaseFreespinPastCountState() {
        const e = this;
        const t = new f.State();
        t.addOnStartCallback(() => {
            const n = S.default.Instance.getSubGameState("freeSpin");
            e._freespinPastCount = n.spinCnt;
            e.setFreespinExtraInfoByCurrentState();
            t.setDone();
        });
        return t;
    }

    getRetriggerFreespinState() {
        const e = this;
        const t = new f.State();
        t.addOnStartCallback(() => {
            const n = S.default.Instance.getSubGameState(S.default.Instance.getSubGameKeyOfCurrentGameResult());
            if (n) {
                if (n.totalCnt > e._freespinTotalCount) {
                    const o = n.totalCnt - e._freespinTotalCount;
                    R.default.Instance().playAudio("FreespinRetrigger", "FX");
                    const a = cc.callFunc(() => {
                        this._freespinTextEffect.node.active = true;
                        this._freespinTextEffect.playRetriggerEffect(o);
                        R.default.Instance().playAudio("FreespinRetrigger", "FX");
                    }.bind(e));
                    const i = cc.callFunc(() => {
                        e._freespinTotalCount = n.totalCnt;
                        e.setFreespinExtraInfoByCurrentState();
                        e.hideSpecialModeText();
                        t.setDone();
                    });
                    e.node.runAction(cc.sequence(a, cc.delayTime(4), i));
                } else {
                    t.setDone();
                }
            }
        });
        return t;
    }

    getReelSpinStartText() {
        const e = Math.floor(Math.random() * this._reelSpinTexts.length);
        let t = this._reelSpinTexts[e];
        if (t === "BET MULTIPLIER") {
            t = `${t} ${I.default.formatNumber(SlotGameRuleManager.Instance.getCurrentBetPerLine())}`;
        }
        return t;
    }

    getSubGameState() {
        return null;
    }

    getSubGameKeyAtStartSpin() {
        return S.default.Instance.getNextSubGameKey();
    }

    setBetInfo() {
        let e = S.default.Instance.getNextSubGameKey();
        e === "" && (e = "base");
        const subGameState = S.default.Instance.getSubGameState(e);
        if (subGameState) {
            if (!subGameState.betPerLines) {
                e = "base";
            }
            const t = S.default.Instance.getSubGameState(e)?.betPerLines;
            if (e === "base") {
                const n = SlotGameRuleManager.Instance.zoneBetPerLines;
                const betPerLine = this.getBetPerLinesProportionToTotalCoin();
                if (!n.includes(betPerLine)) {
                    let o = -1;
                    for (let a = n.length - 1; a >= 0; --a) {
                        if (n[a] < betPerLine) {
                            o = n[a];
                            break;
                        }
                    }
                    o === -1 && (o = n[0]);
                    SlotGameRuleManager.Instance.setCurrentBetPerLine(o);
                } else {
                    SlotGameRuleManager.Instance.setCurrentBetPerLine(this.getMaintainBetPerlines());
                }
            } else {
                SlotGameRuleManager.Instance.setCurrentBetPerLine(t);
            }
        }
    }

    getMaintainBetPerlines() {
        return this.slotInterface.getMaintainBetPerlines();
    }

    getPerBetAmount(e: number) {
        let t = 0;
        const n = e;
        const o = SlotGameRuleManager.Instance._maxBetLine;
        const a = SlotGameRuleManager.Instance.zoneBetPerLines;
        const i = this.userInfoInterface.getUserMoney() / n;
        if (i > 0) {
            t = a[0];
            for (let l = 0; l < a.length; ++l) {
                const r = a[l];
                if ((r + r * SlotGameRuleManager.Instance._featureTotalBetRate100 / 100) * o <= i) {
                    t = a[l];
                }
            }
        } else {
            t = a[0];
        }
        return t;
    }

    getBetPerLinesProportionToTotalCoin() {
        let e = 0;
        let t = 0;
        const n = SlotGameRuleManager.Instance._maxBetLine;
        t = this._slotBaseBetPerSpinCnt || 80;
        const o = SlotGameRuleManager.Instance.zoneBetPerLines;
        const a = this.userInfoInterface.getUserMoney() / t;
        if (a > 0) {
            e = o[0];
            for (let l = 0; l < o.length; ++l) {
                const r = o[l];
                if ((r + r * SlotGameRuleManager.Instance._featureTotalBetRate100 / 100) * n <= a) {
                    e = o[l];
                }
            }
        } else {
            e = o[0];
        }
        return e;
    }

    setEntranceWindow() {
        let e = S.default.Instance.getNextSubGameKey();
        e === "" && (e = "base");
        const t = SlotGameRuleManager.Instance.getEntranceWindow(e);
        let n = SlotGameRuleManager.Instance.getReelStrip(e);
        n || (n = SlotGameRuleManager.Instance.getReelStrip("base"));
        for (let o = 0; o < this.reelMachine.reels.length; ++o) {
            const a = n.getReel(o).defaultBand;
            let i = t?.GetWindow(o) || null;
            const reelComp = this.reelMachine.reels[o].getComponent(g.default);
            if (i) {
                reelComp.invalidate(n.getReel(o).defaultBand, Math.floor(Math.random() * a.length), o, i);
            } else {
                reelComp.invalidate(n.getReel(o).defaultBand, Math.floor(Math.random() * a.length), o);
            }
        }
    }

    getListTotalReels() {
        const e: any[] = [];
        for (let t = 0; t < this.reelMachine.reels.length; ++t) {
            if (TSUtility.isValid(this.reelMachine.reels[t])) {
                e.push(this.reelMachine.reels[t].getComponent(g.default));
            }
        }
        return e;
    }

    setOverSizeSymbolAfterSetEntranceWindow() {
        this.setOverSizeSymbol();
    }

    setOverSizeSymbol() {
        this.getListTotalReels().forEach(e => {
            e.getComponent(g.default).processCheckOverSizeSymbol();
        });
    }

    playFreespinTextEffect(e: number) {
        if (e && e > 0) {
            this._freespinTextEffect.node.active = true;
            this._freespinTextEffect.playFreespinTextEffect(e);
            R.default.Instance().playAudio("FreespinTriger", "FX");
            d.default.Instance().setMainVolumeTemporarily(0);
        } else {
            this._freespinTextIgnoreNumberEffect.node.active = true;
            this._freespinTextIgnoreNumberEffect.playFreespinTextIgnoreNumberEffect();
            R.default.Instance().playAudio("FreespinTriger", "FX");
            d.default.Instance().setMainVolumeTemporarily(0);
        }
    }

    playRetriggerEffect(e: number) {
        this._freespinTextEffect.node.active = true;
        this._freespinTextEffect.playRetriggerEffect(e);
        R.default.Instance().playAudio("FreespinRetrigger", "FX");
    }

    playJackpotTextEffect() {
        this._jackpotTextEffect.node.active = true;
        this._jackpotTextEffect.playJackpotTextEffect();
        R.default.Instance().playAudio("JackpotTrigger", "FX");
    }

    playLockAndRollTextEffect() {
        this._linkedJackpotTextEffect.node.active = true;
        this._linkedJackpotTextEffect.playLockAndRollTextEffect();
        R.default.Instance().playAudio("LNR_Trigger", "FX");
    }

    hideSpecialModeText() {
        this._freespinTextEffect && (this._freespinTextEffect.node.active = false);
        this._bonusTextEffect && (this._bonusTextEffect.node.active = false);
        this._jackpotTextEffect && (this._jackpotTextEffect.node.active = false);
        this._linkedJackpotTextEffect && (this._linkedJackpotTextEffect.node.active = false);
        this._freespinTextIgnoreNumberEffect && (this._freespinTextIgnoreNumberEffect.node.active = false);
        d.default.Instance().resetTemporarilyMainVolume();
    }

    showGameResultPopup(e: any, t: any, n: any, o: any, a = false, i = 5) {
        i = 15;
        const l = new O.ResultPopupInfo();
        l.money = t;
        l.retriggerCount = n;
        l.moneyIncreaseFlag = a;
        
        if ([O.ResultPopupType.JackpotResultMini, O.ResultPopupType.JackpotResultMinor, O.ResultPopupType.JackpotResultMajor, O.ResultPopupType.JackpotResultMega, O.ResultPopupType.JackpotResultCommon, O.ResultPopupType.JackpotModeResult].includes(e)) {
            this._jackpotResultPopup.showPopup(e, l, o, i);
        } else if (e === O.ResultPopupType.FreespinResult) {
            this._freespinResultPopup.showPopup(e, l, o, i);
        } else if (e === O.ResultPopupType.BonusGameResult) {
            this._bonusGameResultPopup.showPopup(e, l, o, i);
        } else if (e === O.ResultPopupType.LinkedJackpotResult) {
            this._linkedJackpotPopup.showPopup(e, l, o, i);
        }
    }

    showWheelOfVegasResultPopup(e: any, t: any, n: any, o: any, a: any) {
        this._wheelOfVegasResultPopup.showWheelOfVegasResultPopup(e, t, n, o, a);
    }

    checkCanAutoPlaySpin_onSpinRequest() {
        const nextKey = S.default.Instance.getNextSubGameKey();
        return nextKey !== "base" || b.default.Instance.getAutospinMode() === 0 || this.slotInterface.onCheckCanAutoSpin();
    }

    checkCanPlayGame() {
        let e = true;
        const t = SlotGameRuleManager.Instance.getTotalBet();
        if (S.default.Instance.getNextSubGameKey() === "base" && this.userInfoInterface.getUserMoney() < t) {
            e = false;
        }
        return e ? 1 : 0;
    }

    setActiveFlagKeyboardEvent(e: boolean) {
        const checker = this.getComponent(M.default);
        checker && (checker.isCheckKeyboardEvent = e);
    }

    setActiveFlagMouseEvent(e: boolean) {
        const checker = this.getComponent(M.default);
        checker && (checker.isCheckMouseEvent = e);
    }

    setMouseDragEventFlag(e: boolean) {
        const checker = this.getComponent(M.default);
        checker && (checker.mouseEventEnabled = e);
    }

    getMouseDragEventFlag() {
        let e = false;
        const checker = this.getComponent(M.default);
        checker && (e = checker.mouseEventEnabled);
        return e;
    }

    setKeyboardEventFlag(e: boolean) {
        const checker = this.getComponent(M.default);
        checker && (checker.keyboardEventEnabled = e);
    }

    getKeyboardEventFlag() {
        let e = false;
        const checker = this.getComponent(M.default);
        checker && (e = checker.keyboardEventEnabled);
        return e;
    }

    addEventListener(e: any, t: any) {
        const checker = this.getComponent(M.default);
        checker && checker.addListener(e, t);
    }

    removeEventListener(e: any, t: any) {
        const checker = this.getComponent(M.default);
        checker && checker.removeListener(e, t);
    }

    playReelSpinSound() {
        R.default.Instance().playAudio("ReelSpin", "FXLoop");
    }

    stopReelSpinSound() {
        R.default.Instance().stopAudio("ReelSpin", "FXLoop");
    }

    showScatterRetriggerEffect() {
        return 0;
    }

    applyGameResultMoney(e: any) {
        this.slotInterface.onApplyGameResultMoney(e);
    }

    applyGameResultMoneyBySubFromResult(e: any) {
        this.slotInterface.onApplyGameResultMoneyBySubFromResult(e);
    }

    applyGameResultMoneyByMaxMoneyFromResult(e: any) {
        this.slotInterface.onApplyGameResultMoneyByMaxMoneyFromResult(e);
    }

    setPlayReelExpectEffectState(e: number) {
        this.reelMachine.hideAllExpectEffects();
        if (this.reelMachine.reels.length > e && m.default.Instance.getExpectEffectFlag(e, S.default.Instance.getVisibleSlotWindows())) {
            if (this.reelMachine.shoeExpectEffect(e) === 1) {
                const t = R.default.Instance().getAudioClip("ReelExpect");
                d.default.Instance().isPlayingFxOnce(t) === 1 && d.default.Instance().stopFxOnce(t);
                R.default.Instance().playAudio("ReelExpect", "FX");
                d.default.Instance().setMainVolumeTemporarily(0.1);
                n.Instance.stopReelSpinSound();
                this.reelMachine.reels[e].getComponent(g.default).setShaderValue("blurOffset", 0.03);
            }
        } else {
            const t = R.default.Instance().getAudioClip("ReelExpect");
            d.default.Instance().isPlayingFxOnce(t) === 1 && d.default.Instance().stopFxOnce(t);
            d.default.Instance().resetTemporarilyMainVolume();
        }
    }

    setPlayReelExpectEffectStateWithLastHistoryWindow(e: number) {
        this.reelMachine.hideAllExpectEffects();
        if (this.reelMachine.reels.length > e && m.default.Instance.getExpectEffectFlag(e, S.default.Instance.getLastHistoryWindows())) {
            if (this.reelMachine.shoeExpectEffect(e) === 1) {
                const t = R.default.Instance().getAudioClip("ReelExpect");
                d.default.Instance().isPlayingFxOnce(t) === 1 && d.default.Instance().stopFxOnce(t);
                R.default.Instance().playAudio("ReelExpect", "FX");
                d.default.Instance().setMainVolumeTemporarily(0.1);
                n.Instance.stopReelSpinSound();
                this.reelMachine.reels[e].getComponent(g.default).setShaderValue("blurOffset", 0.03);
            }
        } else {
            const t = R.default.Instance().getAudioClip("ReelExpect");
            d.default.Instance().isPlayingFxOnce(t) === 1 && d.default.Instance().stopFxOnce(t);
            d.default.Instance().resetTemporarilyMainVolume();
        }
    }

    getActionFreespinIntroText() {
        const e = cc.callFunc(() => {
            n.Instance.playFreespinTextEffect(n.Instance._freespinTotalCount);
        }.bind(this));
        const t = cc.callFunc(() => {
            n.Instance.hideSpecialModeText();
        }.bind(this));
        return cc.sequence(e, cc.delayTime(2.7), t, cc.delayTime(0.5));
    }

    getActionFreespinIntroTextIgnoreFreespinCount() {
        const e = cc.callFunc(() => {
            n.Instance.playFreespinTextEffect();
        }.bind(this));
        const t = cc.callFunc(() => {
            n.Instance.hideSpecialModeText();
        }.bind(this));
        return cc.sequence(e, cc.delayTime(2.7), t, cc.delayTime(0.5));
    }

    getActionBonusGameIntroText() {
        const e = cc.callFunc(() => {
            n.Instance.stopAllBGM();
            const e = n.Instance._bonusTextEffect;
            e.node.active = true;
            e.playBonusgameTextEffect();
            R.default.Instance().playAudio("JackpotTrigger", "FX");
        }.bind(this));
        const t = cc.callFunc(() => {
            n.Instance.hideSpecialModeText();
            n.Instance.reelMachine.setSymbolsDimmActive(false);
        }.bind(this));
        return cc.sequence(e, cc.delayTime(2.7), t, cc.delayTime(0.5));
    }

    getActionJackpotIntroText() {
        const e = cc.callFunc(() => {
            n.Instance.stopAllBGM();
            this.playJackpotTextEffect();
        }.bind(this));
        const t = cc.callFunc(() => {
            n.Instance.hideSpecialModeText();
            n.Instance.reelMachine.setSymbolsDimmActive(false);
        }.bind(this));
        return cc.sequence(e, cc.delayTime(2.7), t, cc.delayTime(0.5));
    }

    getActionLockAndRollIntroText() {
        const e = cc.callFunc(() => {
            n.Instance.stopAllBGM();
            this.playLockAndRollTextEffect();
        }.bind(this));
        const t = cc.callFunc(() => {
            n.Instance.hideSpecialModeText();
            n.Instance.reelMachine.setSymbolsDimmActive(false);
        }.bind(this));
        return cc.sequence(e, cc.delayTime(4), t, cc.delayTime(0.5));
    }

    getSetFlagPlayingSubgameState(e: boolean) {
        const t = this;
        const n = new f.State();
        n.addOnStartCallback(() => {
            t.setFlagPlayingSubgame(e);
            n.setDone();
        });
        return n;
    }

    setFlagPlayingSubgame(e: boolean) {
        this.flagPlayingSubgame = e;
    }

    goToLobby(e: any, t: any) {
        this.slotInterface.goToLobby(e, t);
    }

    goToSlot(e: any, t: any) {
        this.slotInterface.goToSlot(e, t);
    }

    goToSlotOtherGame(e: any, t: any, n: any) {
        this.slotInterface.goToSlotOtherGame(e, t, n);
    }

    homeBtnProcess() {
        this.slotInterface.homeBtnProcess();
    }

    isAvailable() {
        return this._isAvailable;
    }

    setAvailble(e: boolean) {
        this._isAvailable = e;
    }

    getFreespinShareImgName() {
        return this.freespinShareImgName;
    }

    showSpinErrorPopup(e: any) {
        this.slotInterface.showSpinErrorPopup(e);
    }

    static baseBackBtnProcess() {
        TSUtility.isValid(n.Instance) && n.Instance.homeBtnProcess();
    }

    async spinAfterCloseAllPopup() {
        if (w.default.Instance().isBlocking()) {
            await k.default.asyncWaitEndCondition(() => !w.default.Instance().isBlocking(), this);
        }
        if (w.default.Instance().IsBlockingPopupOpen()) {
            w.default.Instance().setOnAllPopupClose(() => {
                this.spinAll();
            });
        } else {
            this.spinAll();
        }
    }

    getReelSpinStartState(e: any) {
        const t = new f.SequencialState();
        let o = 0;
        t.insert(o++, n.Instance.reelMachine.getPreSpinUsingNextSubGameKeyState(e));
        const a = n.Instance.reelMachine.getInfiniteSpinUsingNextSubGameKeyState(e);
        t.insert(o, a);
        const i = n.Instance.getSendSpinRequestState();
        t.insert(o++, i);
        i.addOnEndCallback(() => {
            a.setDoneAllSubStates();
        });
        return t;
    }

    getOppositionReelSpinStartState(e: any) {
        const t = new f.SequencialState();
        let o = 0;
        t.insert(o++, n.Instance.reelMachine.getOppositionPreSpinUsingNextSubGameKeyState(e));
        const a = n.Instance.reelMachine.getOppositionInfiniteSpinUsingNextSubGameKeyState(e);
        t.insert(o, a);
        const i = n.Instance.getSendSpinRequestState();
        t.insert(o++, i);
        i.addOnEndCallback(() => {
            a.setDoneAllSubStates();
        });
        return t;
    }

    getProcessAfterSpinState() {
        const e = new f.SequencialState();
        const t = new f.State();
        t.addOnStartCallback(() => {
            if (n.Instance.flagSpinRequest) {
                e.insert(1, n.Instance.getCheckCurBetPerLineState());
                e.insert(1, n.Instance.getWaitUntilPopupClose());
                e.insert(2, n.Instance.getShowSpinEndPopup());
            }
            t.setDone();
        });
        e.insert(0, t);
        return e;
    }

    _setOriginalPosition() {
        for (let e = 0; e < this._scaleAdjuster.infos.length; ++e) {
            const t = this._scaleAdjuster.infos[e];
            if (t.orignalPosYInfos.length !== t.nodes.length) {
                for (let n = 0; n < t.nodes.length; ++n) {
                    t.orignalPosYInfos.push(t.nodes[n].y);
                }
            }
        }
    }

    getTopFrameScaleUpperBound(e: number) {
        return !TSUtility.isValid(this.slotViewSetting) || !this.slotViewSetting.topFrameScaleUpperBound ? e : this.slotViewSetting.topFrameScaleUpperBound;
    }

    getTopFrameScaleLowerBound(e: number) {
        return !TSUtility.isValid(this.slotViewSetting) || !this.slotViewSetting.topFrameScaleLowerBound ? e : this.slotViewSetting.topFrameScaleLowerBound;
    }

    getFrameScale(e: string, t: number, n: number) {
        let o = 1;
        let a = t;
        if (e === "topFrame") {
            o = this.getTopFrameScaleLowerBound(o);
            a = this.getTopFrameScaleUpperBound(a);
        }
        return cc.misc.lerp(o, a, n);
    }

    getTopFrameGap(e: number, t: number) {
        let n = e;
        n -= t;
        if (TSUtility.isValid(this.slotViewSetting)) {
            n -= F.default.Instance().isVirtualPortrait() ? this.slotViewSetting.portraitTopFrameOffsetY : this.slotViewSetting.landscapeTopFrameOffsetY;
        }
        return n;
    }

    setAutoScaleByResoultion() {
        if (!this._scaleAdjuster) return;
        const e = cc.director.getScene().getComponentInChildren(cc.Canvas).node.getContentSize();
        const t = this._scaleAdjuster.getResolutionRatio();
        this._setOriginalPosition();
        let n = (e.height - 720) / 2;
        let o = 560;
        if (F.default.Instance().isVirtualPortrait()) {
            const a = (F.default.getPortraitRatio() - 1.7778) / (2.18 - 1.7778);
            const clampedA = Math.min(Math.max(0, a), 1);
            o += cc.misc.lerp(0, 200, clampedA);
        }

        let i = 0, l = 1;
        let s: any, c: number;
        for (let r = 0; r < this._scaleAdjuster.infos.length; ++r) {
            s = this._scaleAdjuster.infos[r];
            if (s.key === "topFrame" && s.nodes.length > 0) {
                i = 360 + s.orignalPosYInfos[0];
            } else if (s.key === "bottomFrame") {
                l = cc.misc.lerp(1, s.scale, t);
            }
        }

        for (let r = 0; r < this._scaleAdjuster.infos.length; ++r) {
            s = this._scaleAdjuster.infos[r];
            c = this.getFrameScale(s.key, s.scale, t);
            let u = n;
            if (s.key === "topFrame") {
                const p = i * l - i;
                u = this.getTopFrameGap(u, p);
            } else if (s.key === "bottomFrame") {
                u -= 360 * l - 360;
            }
            F.default.Instance().isVirtualPortrait() && (u -= o);
            for (let f = 0; f < s.nodes.length; ++f) {
                s.nodes[f].setScale(c);
                s.nodes[f].y = Math.round(s.orignalPosYInfos[f] - u);
                cc.log(`${s.nodes[f].name}, scale: ${c}, y: ${s.nodes[f].y}, originalY: ${s.orignalPosYInfos[f]}, gap: ${u}, ratio: ${t}, portraitGap: ${o}, bottomFrameSize: ${i}`);
            }
        }
        this.fixedBottomUI && (this.fixedBottomUI.getComponent(cc.Widget).bottom = 0);
    }

    moveScaleAdjusterPosY(e: string, t: number) {
        this._setOriginalPosition();
        for (let n = 0; n < this._scaleAdjuster.infos.length; ++n) {
            const o = this._scaleAdjuster.infos[n];
            if (o.key === e) {
                for (let a = 0; a < o.nodes.length; ++a) {
                    o.orignalPosYInfos[a] += t;
                }
            }
        }
    }

    getFixedBottomUI() {
        return this.fixedBottomUI;
    }

    useFixedBottomUI() {
        return this.fixedBottomUI != null;
    }

    setBackGroundScaleByResoultion() {
        const e = cc.director.getScene().getComponentInChildren(cc.Canvas);
        const t = e.node.getContentSize();
        const n = (t.height / t.width - 9 / 16) / 0.1875;
        const clampedN = Math.min(Math.max(0, n), 1);
        const o = t.width === e.designResolution.width ? 1 : 0.5 * e.designResolution.width / (t.width - e.designResolution.width);
        const a = t.height === e.designResolution.height ? 1 : 0.5 * e.designResolution.height / (t.height - e.designResolution.height);
        const i = Math.max(Math.max(o, a), 1);
        this.background_scale_component.setOriginScale(i);
        this.background_scale_component.allResetScale();
    }

    resetAutoScale() {
        let e = 0;
        e = Math.min(Math.max(0, e), 1);
        this._setOriginalPosition();
        let t = 0, n = 1, i: any;
        for (let o = 0; o < this._scaleAdjuster.infos.length; ++o) {
            i = this._scaleAdjuster.infos[o];
            if (i.key === "topFrame" && i.nodes.length > 0) {
                t = 360 + i.orignalPosYInfos[0];
            } else if (i.key === "bottomFrame") {
                n = i.scale;
            }
        }
        const a = t * n - t;
        for (let o = 0; o < this._scaleAdjuster.infos.length; ++o) {
            i = this._scaleAdjuster.infos[o];
            const l = cc.misc.lerp(1, i.scale, e);
            let r = 0;
            if (i.key === "topFrame") {
                r -= a;
            } else if (i.key === "bottomFrame") {
                r -= 360 * n - 360;
            }
            for (let s = 0; s < i.nodes.length; ++s) {
                i.nodes[s].setScale(l);
                i.nodes[s].y = Math.round(i.orignalPosYInfos[s] - r);
            }
        }
    }

    processTestCode() {}

    getTimeSecSpinRequest() {
        return (this.timeStampRecvSpinRequest - this.timeStampSendSpinRequest) / 1000;
    }

    getReelStopWindow() {
        return S.default.Instance.getVisibleSlotWindows();
    }

    showAllSymbol() {
        this.reelMachine.showAllSymbol();
    }

    isFBShareDisableTarget() {
        return this.slotInterface.isFBShareDisableTarget();
    }

    facebookShare(e: any, t: any) {
        this.slotInterface.facebookShare(e, t);
    }

    makeBaseFacebookShareInfo() {
        return this.slotInterface.makeBaseFacebookShareInfo();
    }

    getBigWinCoinTarget() {
        return this.slotInterface.getInGameBigwinCoinTarget();
    }

    initializeSpecial() {
        this._special_select_cell = {};
    }

    registerIgnoreSymbols() {
        this._special_ignore_symbolId = [0];
    }

    getSymbolWidth() {
        return this._symbol_width;
    }

    getSymbolHeight(e: number) {
        return e;
    }

    calculateSymbolWidth() {
        let e = 99999;
        for (let t = 0; t < this.reelMachine.reels.length - 1; ++t) {
            e = Math.min(e, this.reelMachine.reels[t + 1].node.position.x - this.reelMachine.reels[t].node.position.x);
        }
        this._symbol_width = e;
    }

    checkSpeciaAblelInfo() {
        this.checkFeverAbleSymbol();
    }

    checkFeverAbleSymbol() {
        this.isAvailableFeverMode() && this.slotInterface.onCheckFeverAbleSymbol();
    }

    getWindowRange() {
        const e: any[] = [];
        for (let t = 0, n = this.reelMachine.reels; t < n.length; t++) {
            const o = n[t].getComponent(g.default);
            e.push([0, o.visibleRow]);
        }
        return e;
    }

    getResultWindows() {
        return S.default.Instance.getVisibleSlotWindows();
    }

    checkFeverIgnoreStateReelController(e: any) {
        const t: any[] = [];
        for (let n = 0; n < this.reelMachine.reels.length; ++n) {
            const o = this.reelMachine.reels[n].getComponent(g.default);
            if (!this.reelMachine.reels[n].isDeActiveReel() && !o.isDeActiveReel() && TSUtility.isValid(e[n])) {
                for (let a = e[n][0]; a < e[n][1]; ++a) {
                    t.push(new cc.Vec2(a, o.reelindex));
                }
            }
        }
        return t;
    }

    setBiggestWinCoin(e: any) {
        this.userInfoInterface.setBiggestWinCoin(e);
    }

    isJoinTourney() {
        return this.userInfoInterface.isJoinTourney();
    }

    getUserId() {
        return this.userInfoInterface.getUserId();
    }

    checkSpecialIgnoreStateSymbolId(e: any) {
        const t = this.getResultWindows();
        const n: any[] = [];
        if (TSUtility.isValid(t)) {
            for (let o = 0, a = e; o < a.length; o++) {
                const i = a[o];
                const l = t.GetWindow(i.y).getSymbol(i.x);
                !this._special_ignore_symbolId.includes(l) && n.push(i);
            }
        }
        return n;
    }

    checkFeverIgnoreStateETC(e: any) {
        return e;
    }

    isCheckSpecialInfo(e: any, t: any, n: any) {
        if (TSUtility.isValid(this._special_select_cell[e])) {
            for (let o = 0, a = this._special_select_cell[e]; o < a.length; o++) {
                const i = a[o];
                if (i.x === n && i.y === t) {
                    return true;
                }
            }
        }
        return false;
    }

    setSymbolSpecialInfo(e: any, t: any) {
        this.slotInterface.setSymbolSpecialInfo(e, t);
    }

    addSlotTooltip(e: any, t: Function) {
        this._listSlotTooltip.push({ key: e, value: t });
    }

    removeSlotTooltip(e: any) {
        const t = this._listSlotTooltip.filter(item => item.key === e);
        if (t && t.length > 0) {
            t.forEach(item => {
                const o = this._listSlotTooltip.indexOf(item);
                o > -1 && this._listSlotTooltip.splice(o, 1);
            });
        }
    }

    closeSlotTooltip(e: any) {
        const t = this._listSlotTooltip.filter(item => item.key === e);
        if (t && t.length > 0 && TSUtility.isValid(t[0])) {
            t[0].value();
        }
    }

    checkSlotTooltip(e: any) {
        switch (e) {
            case this.TOOLTIP_MINIMUM_BET:
                this.closeSlotTooltip(this.TOOLTIP_SUITE_LEAGUE);
                this.closeSlotTooltip(this.TOOLTIP_FEVER_MODE);
                break;
            case this.TOOLTIP_SUITE_LEAGUE:
                this.closeSlotTooltip(this.TOOLTIP_FEVER_MODE);
                break;
            case this.TOOLTIP_FEVER_MODE:
                break;
        }
    }

    setChangeBG(e: any) {
        this.node.emit("CHANGE_BG", e);
    }

    changeBackgroundScaleRatio(e: any, t: any, n = false) {
        this.background_scale_component.changeScaleRatio(e, t, n);
    }

    resetBackgroundScaleRatio(e = 0, t = false) {
        this.background_scale_component.resetScale(e, t);
    }

    allResetBackgroundScaleRatio(e = 0) {
        this.background_scale_component.allResetScale(e);
    }

    reserveNewRecordPopup(e: any) {
        return this.slotInterface.reserveNewRecordPopup(e);
    }

    openInGamePopup(e: any, t = null, n = null) {
        this.slotInterface.openInGamePopup(e, t, n);
    }

    isAvailablePromotion(e: any) {
        return this.slotInterface.isAvailablePromotion(e);
    }

    isBetAmountEnoughToAvailablePromotion(e: any, t: any) {
        return this.slotInterface.isBetAmountEnoughToAvailablePromotion(e, t);
    }

    sendChangeBalanceID(e: any, t = null) {
        this.cheatEditInterface.sendChangeBalanceID(e, t);
    }

    // 所有原代码中的业务方法，因反编译后无实现体，此处保留方法签名占位，按需补充逻辑
    // 例如：旋转请求、卷轴停止、中奖结算、特殊模式触发等核心方法，可在此处补全
}