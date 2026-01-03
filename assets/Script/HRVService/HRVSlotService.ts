const { ccclass, property } = cc._decorator;

// 工具类导入
import AsyncHelper from "../global_utility/AsyncHelper";
import LocalStorageManager from "../manager/LocalStorageManager";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";

// 公共组件/核心管理器导入
// import PopupManager, { OpenPopupInfo } from "../../slot_common/Script/Popup/PopupManager";
// import BottomUI from "../../slot_common/Script/SlotCommon/BottomUI";
// import BottomUIText, { BottomTextType } from "../../slot_common/Script/SlotCommon/BottomUIText";
// import CameraControl, { ORDER_TYPE_TOPPOS_CENTER } from "../../slot_common/Script/SlotCommon/CameraControl";
// import GameComponents_Base from "../../slot_common/Script/SlotCommon/GameComponents_Base";
// import GameResultPopup, { ResultPopupType } from "../../slot_common/Script/SlotCommon/GameResultPopup";
// import IngameSuiteLeagueFeverToolTipUI from "../../slot_common/Script/SlotCommon/IngameSuiteLeagueFeverToolTipUI";
// import MachineFrame from "../../slot_common/Script/SlotCommon/MachineFrame";
// import SlotGameResultManager from "../../slot_common/Script/SlotCommon/SlotGameResultManager";
// import SlotGameRuleManager from "../../slot_common/Script/SlotCommon/SlotGameRuleManager";
// import SlotManager, { SpecialType, TOOLTIP_SUITE_LEAGUE } from "../../slot_common/Script/SlotCommon/SlotManager";
// import SlotPrefabManager from "../../slot_common/Script/SlotCommon/SlotPrefabManager";
// import SlotReelSpinStateManager, { STATE_STOP } from "../../slot_common/Script/SlotCommon/SlotReelSpinStateManager";
// import SlotmachineBackground from "../../slot_common/Script/SlotCommon/SlotmachineBackground";
// import SlotmachineBackgroundSide from "../../slot_common/Script/SlotCommon/SlotmachineBackgroundSide";
// import SlotDataDefine, { FBShareInfo } from "../../slot_common/Script/SlotDataDefine";
// import GameCommonSound from "../../slot_common/Script/Sound/GameCommonSound";
// import State, { SequencialState } from "../../slot_common/Script/State";
// import SlotContentSelector_Editor, { ServiceMode } from "../../slot_common/Script/Editor/SlotContentSelector_Editor";

// 业务配置导入
import LevelBettingLockConfig from "../Config/LevelBettingLockConfig";
import PayCode from "../Config/PayCode";

// Loading相关
import LoadingLobbyProcess from "../Loading/LoadingLobbyProcess";
// import LoadingSlotProcess from "../Loading/LoadingSlotProcess";

// 业务管理器导入
// import FirstBargainSaleManager from "../Lobby/FirstBargainSaleManager";
import Analytics, { AnalyticsSlotEnterInfo } from "../Network/Analytics";
import ChangeResult from "../Network/ChangeResult";
import CommonServer, { PurchaseEntryReason } from "../Network/CommonServer";
import ADTargetManager from "../ServiceInfo/ADTargetManager";
// import MinigameManager from "../ServiceInfo/MinigameManager";
// import ServiceInfoManager from "../ServiceInfo/ServiceInfoManager";
// import ServicePopupManager from "../ServiceInfo/ServicePopupManager";
// import ServerStorageManager, { StorageKeyType } from "../ServiceInfo/ServerStorageManager";
import AdsManager, { PlacementID_InterstitalType } from "../Utility/AdsManager";
import HeroTooltipPopup, { HT_MakingInfo } from "../Utility/HeroTooltipPopup";
// import MessageRoutingManager, { MSG } from "../Utility/MessageRoutingManager";
// import SlotFeverModeManager, { FeverSymbolInfo } from "../Utility/SlotFeverModeManager";
// import SlotJackpotManager from "../Utility/SlotJackpotManager";
// import SlotSuiteLeagueManager from "../Utility/SlotSuiteLeagueManager";
// import SlotTourneyManager, { SlotTourneyIngameState, SlotTourneyStateType, ServerslotTourneyProgressInfo, ServerSlotTourneyState } from "../Utility/SlotTourneyManager";
// import StarAlbumManager from "../Utility/StarAlbumManager";
// import TimeBonusManager from "../Utility/TimeBonusManager";

// 弹窗组件导入
// import AllinCarePopup from "../Popup/AllinCarePopup/AllinCarePopup";
// import ShareAdvicePopup from "../Popup/BGL/ShareAdvicePopup";
// import CasinoJackpotResultPopup from "../Popup/CasinoJackpot/CasinoJackpotResultPopup";
// import CommonPopup from "../Popup/CommonPopup";
// import Instant_iOS_AllinPopup from "../Popup/Instant_iOS/Instant_iOS_AllinPopup";
// import LoadingPopup from "../Popup/LoadingPopup/LoadingPopup";
// import PayTablePopup from "../Popup/PayTablePopup";
// import PayTablePopup_B2B from "../Popup/PayTablePopup_B2B";
// import PowerGemManager from "../Popup/PowerGem/PowerGemManager";
// import PowerGemSlotBottomIcon from "../Popup/PowerGem/PowerGemSlotBottomIcon";
// import ReelQuestMissionCompletePopup from "../Popup/ReelQuest/ReelQuestMissionCompletePopup";
// import ReelQuestMissionStartPopup from "../Popup/ReelQuest/ReelQuestMissionStartPopup";
// import InboxMessagePrefabManager, { INBOX_ITEM_TYPE } from "../Popup/RewardCenter/Inbox/InboxMessagePrefabManager";
// import RewardCenterPopup from "../Popup/RewardCenter/RewardCenterPopup";
// import RewardCenterView, { RewardCenterViewType } from "../Popup/RewardCenter/View/RewardCenterView";
// import AllinOffer_Popup from "../Popup/Shop/AllinOffer_Popup";
// import FirstBargainRenewalForthOffer from "../Popup/Shop/FirstBargainRenewalForthOffer";
// import FirstBargainRenewalPopup from "../Popup/Shop/FirstBargainRenewalPopup";
// import FirstBargainRenewalSecondOffer from "../Popup/Shop/FirstBargainRenewalSecondOffer";
// import FirstBargainRenewalThirdOffer from "../Popup/Shop/FirstBargainRenewalThirdOffer";
// import MainShopPopupRenewal from "../Popup/Shop/MainShopPopupRenewal";
// import BetGuidePopup, { BetGuideState } from "../Popup/Slot/BetGuidePopup";
// import Bet_LowerPopup from "../Popup/Slot/Bet_LowerPopup";
// import SlotTourneyResultPopup from "../Popup/SlotTourney/SlotTourneyResultPopup";
// import SupersizeItInGamePopup from "../Popup/SupersizeIt/SupersizeItInGamePopup";
// import SupersizeItManager from "../Popup/SupersizeIt/SupersizeItManager";
// import SupersizeItLobbyPopup from "../Popup/SupersizeIt/SupersizeItLobbyPopup";
// import ClubVaultPopup from "../Popup/Club/ClubVaultPopup";
// import HyperBountyManager from "../Popup/HyperBounty/HyperBountyManager";
// import HyperBountyInGameUI from "../Popup/HyperBounty/HyperBountyInGameUI";

// 其他业务模块
// import ThrillJackpotIngameIcon from "../ThrillWheel/ThrillJackpotIngameIcon";
// import ThrillJackpotStartPopup from "../ThrillWheel/ThrillJackpotStartPopup";
// import ThrillJackpotWheelSpinResult from "../ThrillWheel/ThrillJackpotWheelSpinResult";
// import ThrillWheelJackpot from "../ThrillWheel/ThrillWheelJackpot";
// import TutorialCoinPromotion from "../Tutorial/TutorialCoinPromotion";
import UnprocessedPurchaseManager from "../User/UnprocessedPurchaseManager";
// import UserInboxInfo, { InboxExtraInfoSlotTourneyReward } from "../User/UserInboxInfo";
import UserInfo from "../User/UserInfo";
import UserInven, { CardPackItemInfo } from "../User/UserInven";
import UserPromotion, { JiggyPuzzlePromotion, NewServiceIntroduceCoinPromotion, NewUserMissionPromotion, WelcomeBonusPromotion } from "../User/UserPromotion";
import SlotTourneyManager, { ServerSlotTourneyState, ServerslotTourneyProgressInfo, SlotTourneyIngameState, SlotTourneyStateType } from "../manager/SlotTourneyManager";
import SlotManager, { SpecialType } from "../manager/SlotManager";
import ServiceInfoManager from "../ServiceInfoManager";
import CameraControl from "../Slot/CameraControl";
import SlotGameRuleManager from "../manager/SlotGameRuleManager";
import PopupManager, { OpenPopupInfo } from "../manager/PopupManager";
import LoadingPopup from "../Popup/LoadingPopup";
import SlotPrefabManager from "../game/SlotPrefabManager";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import SupersizeItManager from "../SupersizeItManager";
import CommonPopup from "../Popup/CommonPopup";
import SlotFeverModeManager, { FeverSymbolInfo } from "../manager/SlotFeverModeManager";
import MessageRoutingManager from "../message/MessageRoutingManager";
import SlotGameResultManager from "../manager/SlotGameResultManager";
import SlotReelSpinStateManager from "../Slot/SlotReelSpinStateManager";
import State, { SequencialState } from "../Slot/State";
import HyperBountyManager from "../manager/HyperBountyManager";
import TimeBonusManager from "../manager/TimeBonusManager";
import { FBShareInfo } from "../slot_common/SlotDataDefine";
import SlotJackpotManager from "../manager/SlotJackpotManager";
import { ResultPopupType } from "../Slot/GameResultPopup";

// 当前模块依赖
// import HRVSlotBigWinEffectService from "./HRVSlotBigWinEffectService";

// 全局工具类声明（原代码中使用的Utility）
declare const Utility: {
    getUnixTimestamp(): number;
    getUnixTimestamp_MilliSecond(): number;
    isMobileGame(): boolean;
};

@ccclass('HRVSlotService')
export default class HRVSlotService extends cc.Component {
    // 单例实例
    private static _instance: HRVSlotService = null;
    
    // // 序列化属性-与原代码一致
    // @property(PowerGemSlotBottomIcon)
    // private _powerGemSlotBottomIcon: PowerGemSlotBottomIcon | null = null;

    // 所有属性添加精准TS类型声明
    private _tourneyState: SlotTourneyIngameState = SlotTourneyIngameState.InGame;
    private _spinChangeResult: ChangeResult | null = null;
    private _inGameUI: {
        [key: string]: any;
        initSlotTourney: () => void;
        tourneyUI: { close: () => void; refreshInfo: () => void; _curTourneyInfo: any; setEndTourney: () => void; openWithUserRank: () => void };
        initDynamicReelsUI: () => void;
        hideDynamicReelsUI: () => void;
        fadeOut: (duration: number) => void;
        fadeIn: (duration: number) => Promise<void>;
        setPromotionUI: () => void;
        suiteLeagueUI: { feverUI: { updateFeverMode: (enable: boolean) => void; prefabFeverEffect: cc.Node; setFeverEffectNode: (node: cc.Node) => void; isPlayFeverTime: () => boolean; playFeverTime: () => void; refreshFeverLevel: () => void }; setLoungeSlotInfo: () => void; playStartAni: () => void };
        reelQuestUI: { initPlayAni: () => void; openNormal: (bool: boolean) => void };
        openSlotStartTooltip: () => Promise<void>;
        openSlotStartPopup: () => Promise<void>;
        bigwinCoinTarget: cc.Node;
        starAlbumUI: { init: (value: number) => void };
        heroUI: { init: () => void };
        setStateBlockInput: (block: boolean) => void;
        setADSFreePopup: () => void;
        checkB2BUI: () => void;
        onBettingMoneyChange: (changeResult: ChangeResult) => void;
        addLevelExp: (exp: number) => void;
        jiggyPuzzleUI: { refreshUI: (info: any) => void };
        showBlockingBG: () => void;
        hideBlockingBG: () => void;
        thrillWheelJackpotGaugeUI: cc.Node;
        piggyBankUI: { isReadyMaxMoneyPopOpen: () => boolean; resetReadyMaxMoneyPopOpen: () => void; showPiggyBankOfferPopup: () => void };
        iconSupersizeIt: { node: cc.Node; initialize: () => void; playOpenAnimation: () => void };
        checkTooltip: () => void;
        updateUnlockContents: (callback: () => void) => void;
        setFastModePosition: (root: cc.Node) => void;
        showFastModeTooltip: (isFast: boolean) => void;
        _isOpenPaytablePopup: boolean;
        payTable_IntoduceCoin: cc.Node;
        btnSpin: { node: cc.Node };
        nodeNewSlotTooltip: cc.Node;
        nodeTotalBetUI: cc.Node;
        setIntroduceCoin: () => void;
        startRecentlyPlayedTutorial: () => void;
    } = {} as any;
    // private _hrvSlotBigWinEffectService: HRVSlotBigWinEffectService  = null;
    // private _feverModeIcon: IngameSuiteLeagueFeverToolTipUI  = null;
    // private _hyperBountyIngameIcon: HyperBountyInGameUI = null;
    private _isRunTourneySchedule: boolean = false;
    private _doTourneyEndProcess: boolean = false;
    private _isProcessingTourneyShowGameResult: boolean = false;
    private _changeResultThrillJackpotItemInfo: ChangeResult  = null;
    public popupCustomMessage: cc.Node  = null;
    private _isEnableAllinRoot: boolean = true;
    private _activeNewSlotTooltip: boolean = false;
    private _activeNewSlotTooltipInit: boolean = false;
    private _tooltip: HeroTooltipPopup  = null;
    public popupLockTotalBet: HeroTooltipPopup  = null;

    /**
     * 获取单例实例
     */
    public static instance(): HRVSlotService  {
        return this._instance;
    }

    /**
     * 创建单例实例 - 挂载到Canvas节点下
     */
    public static createInstance(): void {
        if (HRVSlotService._instance === null) {
            const node = new cc.Node("HRVSlotService");
            HRVSlotService._instance = node.addComponent(HRVSlotService);
            const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
            if (canvas) node.parent = canvas.node;
        }
    }

    /**
     * 生命周期-销毁时清空单例
     */
    onDestroy(): void {
        HRVSlotService._instance = null;
    }

    /**
     * 初始化核心服务
     * @param slotManager SlotManager实例
     */
    init(slotManager: SlotManager): void {
        console.log("HRVSlotService init");
        if (SlotManager.Instance) {
            // this._hrvSlotBigWinEffectService = HRVSlotBigWinEffectService.createInstance(this);
            slotManager.setSlotInterface = this;
            slotManager.setUserInfoInterface = this;
            slotManager.setBottomUIInterface = this;
            // slotManager.setBigWinEffectInterface = this._hrvSlotBigWinEffectService;
            slotManager.setFeverModeInfoInterface = this;
            slotManager.setCheatEditInterface = this;
            slotManager.setMessageRoutingManager = this;
        } else {
            console.error("SlotManager.Instance is null");
        }
    }

    /**
     * 异步初始化游戏核心逻辑
     */
    async onInit(): Promise<void> {
        // try {
        //     // 广告打点 + 页面位置记录
        //     if (UserInfo.instance().getPrevLocation() === "Lobby" && AdsManager.Instance().isUseable()) {
        //         AdsManager.Instance().ADLog_InterstitialShowUI(PlacementID_InterstitalType.LOBBYTOSLOT);
        //         if (ADTargetManager.instance().enableInterstitialAD()) {
        //             AdsManager.Instance().InterstitialAdplay(PlacementID_InterstitalType.LOBBYTOSLOT, () => {
        //                 ServiceInfoManager.instance.addInterstitialADPlayCount();
        //             }, () => {
        //                 if (!TSUtility.isLiveService()) ServiceInfoManager.instance.addInterstitialADPlayCount();
        //             });
        //         } else if (ADTargetManager.instance().enableInterstitialAD(false)) {
        //             console.log("Slot Check enableInterstitialAD true");
        //             AdsManager.Instance().preloadInterstitialAD();
        //         }
        //     }
        //     UserInfo.instance().setPrevLocation("Slot");
        //     CameraControl.Instance.setOrderTypeTopPos(ORDER_TYPE_TOPPOS_CENTER);
        //     ServiceInfoManager.NUMBER_SPIN_COUNT = 0;
        //     ServiceInfoManager.NUMBER_BET_SPIN_COUNT = 0;
        //     ServiceInfoManager.STRING_PREV_SLOT_ID = SlotGameRuleManager.Instance.slotID;

        //     await AsyncHelper.delayWithComponent(0, this);
        //     SlotManager.Instance._scaleAdjuster = CameraControl.Instance.scaleAdjuster;
        //     if (SlotManager.Instance._scaleAdjuster) SlotManager.Instance.setAutoScaleByResoultion();
        //     PopupManager.Instance().setBaseBackBtnCallback(SlotManager.baseBackBtnProcess);

        //     // 加载弹窗进度更新
        //     const loadingPopup = LoadingPopup.getCurrentOpenPopup();
        //     loadingPopup.setPostProgress(0, "Authenticating ...");
        //     this._spinChangeResult = new ChangeResult();
        //     this.setZoneInfo();

        //     // 初始化老虎机游戏核心
        //     console.log("initSlotGameProcess start");
        //     loadingPopup.setPostProgress(.25, "Setting up Slot .");
        //     const initSlotRes = await SlotManager.Instance.initSlotGameProcess();
        //     console.log("initSlotGameProcess end");
        //     if (!initSlotRes) {
        //         this.showLoginErrorPopup();
        //         return;
        //     }

        //     // 初始化文本特效+游戏结果弹窗
        //     loadingPopup.setPostProgress(.27, "Setting up Slot ..");
        //     const [textEffectRes, gameResultRes] = await Promise.all([
        //         SlotManager.Instance.initTextEffectProcess(),
        //         SlotManager.Instance.initGameResultPopupProcess()
        //     ]);
        //     if (!textEffectRes || !gameResultRes) {
        //         this.showLoginErrorPopup();
        //         return;
        //     }
        //     Analytics.customSlotLoadingRecord("initSlotRes_complete");
        //     ServiceInfoManager.instance.resetSpinOpenPopup();
        //     loadingPopup.setPostProgress(.3, "Setting up Slot ...");

        //     // 初始化游戏内UI
        //     this.setInGameUI();
        //     if (SDefine.SlotTournament_Use) this.getInGameUI().initSlotTourney();
        //     else this.getInGameUI().tourneyUI.close();
            
        //     if (UserInfo.instance()._zoneName === SDefine.SUITE_ZONENAME || UserInfo.instance()._zoneName === SDefine.VIP_LOUNGE_ZONENAME) {
        //         this.getInGameUI().initDynamicReelsUI();
        //     } else {
        //         this.getInGameUI().hideDynamicReelsUI();
        //     }

        //     await AsyncHelper.delayWithComponent(0, this);
        //     this.getInGameUI().fadeOut(0);
        //     loadingPopup.setPostProgress(.4, "Setting up Slot ....");
            
        //     // 投注信息 + 窗口初始化
        //     SlotManager.Instance.setBetInfo();
        //     SlotManager.Instance.setEntranceWindow();
        //     SlotManager.Instance.setOverSizeSymbolAfterSetEntranceWindow();
        //     loadingPopup.setPostProgress(.8, "Setting up Slot .....");

        //     await AsyncHelper.delayWithComponent(0, this);
        //     // 加载老虎机框架
        //     if (SlotManager.Instance.machineFrameLayer) {
        //         const machineFramePrefab = cc.instantiate(SlotPrefabManager.Instance().getPrefab("machineFrame"));
        //         SlotManager.Instance.machineFrameLayer.addChild(machineFramePrefab);
        //         SlotManager.Instance.setMachineFrame = machineFramePrefab.getComponent(MachineFrame);
        //         SlotManager.Instance.machineFrame.setShowBG(SlotManager.Instance.flagShowFrameBG, SlotManager.Instance.frameBGNode);
        //     }

        //     // 加载背景
        //     if (SlotManager.Instance.backgroundLayer) {
        //         if (SlotPrefabManager.Instance().isPrefabExist("BackgroundSide")) {
        //             const bgSide = cc.instantiate(SlotPrefabManager.Instance().getPrefab("BackgroundSide"));
        //             const bgSideComp = bgSide.getComponent(SlotmachineBackgroundSide);
        //             await bgSideComp.asyncLoadBg();
        //             SlotManager.Instance.backgroundLayer.addChild(bgSide);
        //             bgSide.setPosition(cc.Vec2.ZERO);
        //         }
        //         const bg = cc.instantiate(SlotPrefabManager.Instance().getPrefab("Background"));
        //         SlotManager.Instance.background_scale_component = bg.getComponent(SlotmachineBackground);
        //         console.log("asyncLoadBg start");
        //         await SlotManager.Instance.background_scale_component.asyncLoadBg();
        //         SlotManager.Instance.backgroundLayer.addChild(bg);
        //         bg.setPosition(cc.Vec2.ZERO);
        //         console.log("asyncLoadBg end");
        //     }

        //     // 初始化底部UI
        //     if (SlotManager.Instance.bottomUiInstance) {
        //         const bottomUI = SlotManager.Instance.bottomUiInstance.getComponent(BottomUI);
        //         bottomUI.initBottomUI_EX(this);
        //         bottomUI.initUI();
        //         SlotManager.Instance._bottomUI = bottomUI;
        //     } else {
        //         const bottomUIPrefab = cc.instantiate(SlotPrefabManager.Instance().getPrefab("bottomUI"));
        //         SlotManager.Instance.bottomUiLayer.addChild(bottomUIPrefab);
        //         const bottomUI = bottomUIPrefab.getComponent(BottomUI);
        //         bottomUI.initBottomUI_EX(this);
        //         bottomUI.initUI();
        //         SlotManager.Instance._bottomUI = bottomUI;
        //         if (!SlotManager.Instance.bottomUIText) {
        //             SlotManager.Instance.bottomUIText = bottomUIPrefab.getComponent(BottomUIText);
        //         }
        //         SlotManager.Instance.bottomUIText.setBottomUIAutoScaleByResoultion();
        //     }

        //     // 内容选择器初始化
        //     this.setContentSelector();
        //     // 宝石系统初始化
        //     if (PowerGemManager.instance.isAvailablePowerGem(true) && this.getPowerGemSlotBottomIcon()) {
        //         this.getPowerGemSlotBottomIcon().updatePowerGemEvent(true);
        //     }

        //     // 测试模式-作弊组件
        //     if (!TSUtility.isLiveService() && SlotManager.Instance.cheatObjectLayer) {
        //         const cheatPrefab = cc.instantiate(SlotPrefabManager.Instance().getPrefab("cheatObject"));
        //         SlotManager.Instance.cheatObjectLayer.addChild(cheatPrefab);
        //         SlotManager.Instance.setCheatComponent = cheatPrefab.getComponent("CheatController");
        //         SlotManager.Instance.cheatComponent.setGameId(SlotGameRuleManager.Instance.slotID);
        //         // const balanceName = LocalStorageManager.getMultiBalanceName(SlotGameRuleManager.Instance.slotID);
        //         // if (TSUtility.isValid(balanceName)) {
        //         //     this.sendChangeBalanceID(balanceName, SlotManager.Instance.cheatComponent.responseMultiBalanceSet.bind(SlotManager.Instance.cheatComponent));
        //         // }
        //     }

        //     // 赔付线初始化
        //     if (SlotManager.Instance.paylineRenderer) {
        //         const paylines = SlotGameRuleManager.Instance.getPaylines();
        //         if (paylines.payLineListType && paylines.payLineListType === "cellNo") {
        //             const x = SlotManager.Instance.paylineRenderer.m_reelLayout.x;
        //             const y = SlotManager.Instance.paylineRenderer.m_reelLayout.y;
        //             SlotManager.Instance.paylineRenderer.initPaylineRendererWithCellInfo("AllPayLine", paylines.getAllPaylineCellDataArray(x, y));
        //         } else {
        //             SlotManager.Instance.paylineRenderer.initPaylineRenderer("AllPayLine", paylines.getAllPaylineDataArray());
        //         }
        //     }

        //     // 底部文本初始化
        //     if (SlotManager.Instance.bottomUIText) {
        //         SlotManager.Instance.bottomUIText.initUI(this);
        //     }

        //     // 大奖特效绑定
        //     if (SlotManager.Instance.getComponent(GameComponents_Base)?.effectBigWinNew) {
        //         SlotManager.Instance.getComponent(GameComponents_Base)!.effectBigWinNew.coinTargetNode = this.getInGameUI().bigwinCoinTarget;
        //         SlotManager.Instance.getComponent(GameComponents_Base)!.effectBigWinNew.coinTargetNodeFreespin = SlotManager.Instance.bottomUIText.getCoinTargetBigWinEffectInFreespin();
        //     }

        //     SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.EnterGame);
        //     SlotManager.Instance.initBottomUIButtonEnableStateOnEnterRoom();
        //     this.getInGameUI().setPromotionUI();

        //     // 狂热模式初始化
        //     const feverCallback = () => {
        //         this.getInGameUI().suiteLeagueUI.feverUI.updateFeverMode(true);
        //     };
        //     SlotFeverModeManager.instance.useFeverTicket(feverCallback.bind(this));
        //     this.getInGameUI().suiteLeagueUI.setLoungeSlotInfo();
        //     this.node.on("changeMoneyState", this.getInGameUI().onBettingMoneyChange.bind(this.getInGameUI()));
        //     this.setFeverModeUI();

        //     console.log("asyncSceneLoadPrepare start");
        //     await SlotManager.Instance.asyncSceneLoadPrepare();
        //     await AsyncHelper.delayWithComponent(.2, this);
        //     console.log("asyncSceneLoadPrepare end");

        //     loadingPopup.setPostProgress(1, "Complete Slot Loading", true);
        //     Analytics.customSlotLoadingRecord("load_slotgame_complete");
        //     SlotManager.Instance.registerIgnoreSymbols();
        //     SlotManager.Instance.initCameraSetting();
        //     await SlotManager.Instance.asyncSceneLoadEffect();
        //     await this.onGameStartSceneLoadEffectEnd();

        //     // 星级相册 + 英雄UI初始化
        //     const betIndex = SlotGameRuleManager.Instance.getCurrentBetPerLineIndex();
        //     const maxBetIndex = SlotGameRuleManager.Instance.getMaxBetPerLineCnt() - 1;
        //     this.getInGameUI().starAlbumUI.init(betIndex / maxBetIndex);
        //     this.getInGameUI().heroUI.init();
        //     this.getInGameUI().setADSFreePopup();
        //     this.getInGameUI().checkB2BUI();
        //     this.getInGameUI().setStateBlockInput(true);
        //     await this.getInGameUI().fadeIn(.3);

        //     // 未处理的购买项
        //     const lobbyCount = ServiceInfoManager.NUMBER_LOOBY_ENTER_COUNT;
        //     const slotCount = ServiceInfoManager.NUMBER_SLOT_ENTER_COUNT;
        //     if (lobbyCount + slotCount <= 1) {
        //         await UnprocessedPurchaseManager.Instance().doProcess();
        //     }

        //     await this.onGameStartInGameUIFadeInEnd();
        //     SlotManager.Instance.setEventCheckerEnableState();

        //     // 延迟执行开局动画+逻辑
        //     this.scheduleOnce(async () => {
        //         this.getInGameUI().suiteLeagueUI.playStartAni();
        //         if (SlotManager.Instance._bottomUI) {
        //             if (UserInfo.instance()._zoneName === SDefine.SUITE_ZONENAME && SlotFeverModeManager.instance.isOpenFeverMode()) {
        //                 this._feverModeIcon && this._feverModeIcon.playStartAni();
        //             } else {
        //                 this._feverModeIcon && this._feverModeIcon.activeTooltipUI(false);
        //             }
        //             this.getPowerGemSlotBottomIcon() && this.getPowerGemSlotBottomIcon().openPowerGemInfo();
        //         }
        //         SlotGameRuleManager.Instance.addObserver(this.node);
        //         SlotManager.Instance.refreshStarAlbumGauge();
        //         await this.getInGameUI().openSlotStartTooltip();

        //         // 锦标赛UI打开
        //         if (SDefine.SlotTournament_Use && UserInfo.instance().isJoinTourney()) {
        //             this.getInGameUI().tourneyUI.openWithUserRank();
        //         }
        //         this.getInGameUI().setStateBlockInput(false);
        //     }, .3);

        //     // 游戏可用状态+定时任务
        //     SlotManager.Instance._isAvailable = true;
        //     SlotManager.Instance._initFinish = true;
        //     if (SDefine.SlotTournament_Use) {
        //         this.schedule(this.tourneyInGameSchedule.bind(this), 1);
        //     }

        //     // 埋点统计
        //     const slotEnterInfo = new AnalyticsSlotEnterInfo();
        //     slotEnterInfo.location = ServiceInfoManager.STRING_SLOT_ENTER_LOCATION;
        //     slotEnterInfo.flag = ServiceInfoManager.STRING_SLOT_ENTER_FLAG;
        //     this.playRecentlyPlayedTutorial();
        //     Analytics.slotEnter(SlotManager.Instance.getZoneId(), SlotGameRuleManager.Instance.slotID, slotEnterInfo);
        // } catch (error) {
        //     this.showLoginErrorPopup();
        //     FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error as Error));
        // }
    }

    /**
     * 设置内容选择器
     */
    setContentSelector(): void {
        const contentSelector = SlotManager.Instance.node.getChildByName("contentSelector");
        // if (contentSelector) {
        //     const selectorComp = contentSelector.getComponent(SlotContentSelector_Editor);
        //     if (selectorComp) {
        //         selectorComp.contentIndex = ServiceMode.HRV;
        //         selectorComp.refresh();
        //     }
        // }
    }

    /**
     * 设置区域信息
     */
    setZoneInfo(): void {
        const zoneId = UserInfo.instance().getZoneId();
        const zoneName = UserInfo.instance().getZoneName();
        SlotManager.Instance.setZoneInfo(zoneId, zoneName);

        // const userOption = LocalStorageManager.getLocalUserOptionInfo(UserInfo.instance().getUid());
        // if (userOption.lastCasinoZone !== zoneId) {
        //     userOption.lastCasinoZone = zoneId;
        //     LocalStorageManager.saveUserOptionInfoToStorage(UserInfo.instance().getUid());
        // }

        if (ServerStorageManager.getAsNumber(StorageKeyType.LAST_ZONE_ID) !== zoneId ||
            ServerStorageManager.getAsString(StorageKeyType.LAST_ZONE_NAME) !== zoneName) {
            ServerStorageManager.save(StorageKeyType.LAST_ZONE_ID, zoneId);
            ServerStorageManager.save(StorageKeyType.LAST_ZONE_NAME, zoneName);
        }

        SlotManager.Instance.setIsloungeNewSlot = false;
        if (!TSUtility.isDynamicSlot(SlotGameRuleManager.Instance.slotID) && zoneName === SDefine.SUITE_ZONENAME) {
            SlotManager.Instance.setZoneInfo(SDefine.VIP_LOUNGE_ZONEID, SDefine.VIP_LOUNGE_ZONENAME);
            SlotManager.Instance.setIsloungeNewSlot = true;
        }

        if (SlotGameRuleManager.Instance.slotID === ServiceInfoManager.STRING_REVAMP_SLOT_ID) {
            ServiceInfoManager.BOOL_LASTSLOT_REVAMP_SLOT = true;
        }
        if (SupersizeItManager.instance.isTargetSlotID(SlotGameRuleManager.Instance.slotID)) {
            ServiceInfoManager.BOOL_LASTSLOT_SUPERSIZE_POPUP = true;
        }
    }

    /**
     * 显示登录失败弹窗
     */
    showLoginErrorPopup(): void {
        // CommonPopup.getCommonPopup((err, popup) => {
        //     if (err) {
        //         console.error("Get CommonPopup fail.");
        //         return;
        //     }
        //     popup.open().setInfo("NOTICE", "Slot Login Fail.", false)
        //         .setOkBtn("GOTO LOBBY", () => {
        //             const loadingPopup = LoadingPopup.getCurrentOpenPopup();
        //             loadingPopup && loadingPopup.setPostProgress(1, "Error Slot Game Init", true);
        //             const zoneId = UserInfo.instance().getZoneId();
        //             const zoneName = UserInfo.instance().getZoneName();
        //             this.goToLobby(zoneId, zoneName);
        //         });
        // });
    }

    /**
     * 跳转到大厅
     * @param zoneId 区域ID
     * @param zoneName 区域名称
     */
    goToLobby(zoneId: number, zoneName: string): void {
        if (LoadingPopup.isAvailableLoadingPopup()) {
            // UserInfo.instance().setPrevGameId(SlotGameRuleManager.Instance.slotID);
            // UserInfo.instance().setZoneID(zoneId);
            UserInfo.instance().setZoneName(zoneName);
            SlotManager.Instance.setAvailble(false);
            LoadingLobbyProcess.Instance().getSlotToLobbyState(zoneId, zoneName).onStart();
        } else {
            const error = new Error(`SlotManager goToLobby fail zoneId: ${zoneId.toString()}`);
            FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
        }
    }

    /**
     * 跳转到其他老虎机
     * @param zoneId 区域ID
     * @param zoneName 区域名称
     * @param slotId 老虎机ID
     */
    goToSlotOtherGame(zoneId: number, zoneName: string, slotId: string): void {
    //     const slotSceneInfo = SDefine.getSlotSceneInfo(slotId);
    //     if (LoadingPopup.isAvailableLoadingPopup()) {
    //         const jumpFunc = () => {
    //             if (!ServerStorageManager.getAsBoolean(StorageKeyType.FIRST_VISIT_SLOT)) {
    //                 ServerStorageManager.save(StorageKeyType.FIRST_VISIT_SLOT, true);
    //             }
    //             ServiceInfoManager.STRING_SLOT_ENTER_LOCATION = "";
    //             ServiceInfoManager.STRING_SLOT_ENTER_FLAG = "";
    //             UserInfo.instance().setPrevGameId(SlotGameRuleManager.Instance.slotID);
    //             SlotManager.Instance.setAvailble(false);
    //             LoadingSlotProcess.Instance().getSlotToSlotState(zoneId, zoneName, slotSceneInfo.sceneName, slotSceneInfo.gameId).onStart();
    //         };

    //         // 锦标赛进行中-离开确认
    //         if (SDefine.SlotTournament_Use && UserInfo.instance().isJoinTourney() && this._tourneyState === SlotTourneyIngameState.WaitEndBonusGame) {
    //             SlotManager.Instance._isOpenMovePopup = true;
    //             CommonPopup.getPopup("TypeB", (err, popup) => {
    //                 popup.open().setOkBtn("YES", () => {
    //                     PopupManager.Instance().resetOpenPopup();
    //                     PopupManager.Instance().resetScreenShot();
    //                     SlotManager.Instance._isOpenMovePopup = false;
    //                     jumpFunc();
    //                 }).setCancelBtn("NO", () => {
    //                     SlotManager.Instance._isOpenMovePopup = false;
    //                 }).setInfo("Spin in progress.\nAre you sure you want to leave?", "Moving back to the lobby will reset the feature spin progress, and the result will be discarded.");
    //             });
    //             return;
    //         }

    //         // 旋转中-离开确认
    //         if (SlotManager.Instance.isSpinState()) {
    //             SlotManager.Instance._isOpenMovePopup = true;
    //             CommonPopup.getPopup("TypeB", (err, popup) => {
    //                 popup.open().setOkBtn("YES", () => {
    //                     PopupManager.Instance().resetOpenPopup();
    //                     PopupManager.Instance().resetScreenShot();
    //                     SlotManager.Instance._isOpenMovePopup = false;
    //                     jumpFunc();
    //                 }).setCancelBtn("NO", () => {
    //                     SlotManager.Instance._isOpenMovePopup = false;
    //                 }).setInfo("Spin in progress.\nAre you sure you want to leave?", "* The spin result will apply to your \nbalance automatically");
    //             });
    //         } else {
    //             jumpFunc();
    //         }
    //     } else {
    //         const error = new Error(`SlotManager goToSlot fail zoneId: ${zoneId.toString()} slotId:${slotId}`);
    //         FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
    //     }
    // }

    // /**
    //  * 主页按钮点击逻辑
    //  */
    // homeBtnProcess(): void {
    //     if (SlotManager.Instance.isAvailable() && SlotManager.Instance._initFinish) {
    //         let zoneId = SlotManager.Instance.getZoneId();
    //         let zoneName = SlotManager.Instance.getZoneName();
    //         if (SlotManager.Instance.isloungeNewSlot) {
    //             zoneId = SDefine.SUITE_ZONEID;
    //             zoneName = SDefine.SUITE_ZONENAME;
    //         }

    //         const jumpFunc = () => {
    //             CommonServer.Instance().requestAvgBetInfo(UserInfo.instance().getUid(), UserInfo.instance().getAccessToken(), (res) => {
    //                 if (!CommonServer.isServerResponseError(res) && TSUtility.isValid(res.userAvgBetInfo)) {
    //                     if (TSUtility.isValid(res.userAvgBetInfo.totalBet)) UserInfo.instance().setTwoH_TotalBet(res.userAvgBetInfo.totalBet);
    //                     if (TSUtility.isValid(res.userAvgBetInfo.totalSpin)) UserInfo.instance().setTwoH_TotalSpin(res.userAvgBetInfo.totalSpin);
    //                 }
    //             });
    //             if (!ServerStorageManager.getAsBoolean(StorageKeyType.FIRST_VISIT_SLOT)) {
    //                 ServerStorageManager.save(StorageKeyType.FIRST_VISIT_SLOT, true);
    //             }
    //             PopupManager.Instance().setOnAllPopupClose(null);
    //             MinigameManager.instance().createMiniGameInfo();
    //             SlotManager.Instance.goToLobby(zoneId, zoneName);
    //             Analytics.enterCasino(zoneId, "slot_home");
    //         };

    //         // 锦标赛进行中-离开确认
    //         if (SDefine.SlotTournament_Use && UserInfo.instance().isJoinTourney() && this._tourneyState === SlotTourneyIngameState.WaitEndBonusGame) {
    //             SlotManager.Instance._isOpenMovePopup = true;
    //             CommonPopup.getPopup("TypeB", (err, popup) => {
    //                 popup.open().setOkBtn("YES", () => {
    //                     PopupManager.Instance().resetOpenPopup();
    //                     PopupManager.Instance().resetScreenShot();
    //                     SlotManager.Instance._isOpenMovePopup = false;
    //                     jumpFunc();
    //                 }).setCancelBtn("NO", () => {
    //                     SlotManager.Instance._isOpenMovePopup = false;
    //                 }).setInfo("Spin in progress.\nAre you sure you want to leave?", "Moving back to the lobby will reset the feature spin progress, and the result will be discarded.");
    //             });
    //             return;
    //         }

    //         // 旋转中-离开确认
    //         if (SlotManager.Instance.isSpinState()) {
    //             SlotManager.Instance._isOpenMovePopup = true;
    //             CommonPopup.getPopup("TypeB", (err, popup) => {
    //                 popup.open().setOkBtn("YES", () => {
    //                     PopupManager.Instance().resetOpenPopup();
    //                     PopupManager.Instance().resetScreenShot();
    //                     SlotManager.Instance._isOpenMovePopup = false;
    //                     jumpFunc();
    //                 }).setCancelBtn("NO", () => {
    //                     SlotManager.Instance._isOpenMovePopup = false;
    //                 }).setInfo("Spin in progress.\nAre you sure you want to leave?", "* The spin result will apply to your \nbalance automatically");
    //             });
    //             return;
    //         }

    //         jumpFunc();
    //     }
    }

    /**
     * 设置游戏内UI实例
     */
    setInGameUI(): void {
        // const ingameUINode = LoadingSlotProcess.Instance().ingameUI.node;
        // if (!SlotManager.Instance.inGameUILayer) {
        //     ingameUINode.parent = this.node;
        // } else {
        //     ingameUINode.parent = SlotManager.Instance.inGameUILayer;
        // }
        // this._inGameUI = LoadingSlotProcess.Instance().ingameUI;
    }

    /**
     * 获取游戏内UI实例
     */
    getInGameUI(): typeof this._inGameUI {
        return this._inGameUI;
    }

    /**
     * 获取游戏内接口
     */
    getInGameInterface(): typeof this._inGameUI {
        return this._inGameUI;
    }

    /**
     * 获取大奖硬币目标节点
     */
    getInGameBigwinCoinTarget(): cc.Node {
        return this.getInGameUI().bigwinCoinTarget;
    }

    /**
     * 获取消息路由管理器接口
     */
    getMessageRoutingManagerInterface(): MessageRoutingManager {
        return MessageRoutingManager.instance();
    }

    /**
     * 设置狂热模式UI
     */
    setFeverModeUI(): void {
        if (this.isAvailableFeverMode()) {
            SlotFeverModeManager.instance.initialize();
            const feverUI = this._inGameUI.suiteLeagueUI.feverUI;
            if (TSUtility.isValid(feverUI) && SlotManager.Instance.machineFrame?.nodeFeverEffectRoot) {
                const feverEffect = cc.instantiate(feverUI.prefabFeverEffect);
                if (feverEffect) {
                    SlotManager.Instance.machineFrame.nodeFeverEffectRoot.addChild(feverEffect);
                    feverEffect.setPosition(cc.Vec2.ZERO);
                    feverUI.setFeverEffectNode(feverEffect);
                }
            }
        }
    }

    /**
     * 检查狂热模式是否可用
     */
    isAvailableFeverMode(): boolean {
        return SlotFeverModeManager.instance.isOpenFeverMode() && UserInfo.instance()._zoneName === SDefine.SUITE_ZONENAME && TSUtility.isValid(this._inGameUI);
    }

    /**
     * 游戏场景加载特效结束回调
     */
    async onGameStartSceneLoadEffectEnd(): Promise<void> {
        // if (UserInfo.instance().isJoinTourney() || UserInfo.instance().getZoneName() === SDefine.SUITE_ZONENAME) {
        //     return;
        // }
        // if (!UserInfo.instance().hasActiveReelQuest()) {
        //     return;
        // }
        // const reelQuestInfo = UserInfo.instance().getUserReelQuestInfo();
        // const curMissionSlot = reelQuestInfo.curMissionSlot;
        // if (SlotGameRuleManager.Instance.slotID !== curMissionSlot) {
        //     return;
        // }
        // const promotionKey = UserInfo.instance().getActiveReelQuestPromotionKey();
        // const promotionInfo = UserInfo.instance().getPromotionInfo(promotionKey);
        await AsyncHelper.delayWithComponent(.15, this);
        // await this.asyncOpenReelQuestMissionStartPopup(reelQuestInfo, promotionInfo);
    }

    /**
     * 游戏内UI淡入结束回调
     */
    async onGameStartInGameUIFadeInEnd(): Promise<void> {
        // if (UserInfo.instance().isJoinTourney() || UserInfo.instance().getZoneName() === SDefine.SUITE_ZONENAME) {
        //     await this.getInGameUI().openSlotStartPopup();
        //     return;
        // }
        // if (!UserInfo.instance().hasActiveReelQuest()) {
        //     await this.getInGameUI().openSlotStartPopup();
        //     return;
        // }
        // const reelQuestInfo = UserInfo.instance().getUserReelQuestInfo();
        // const curMissionSlot = reelQuestInfo.curMissionSlot;
        // const isCurSlot = SlotGameRuleManager.Instance.slotID === curMissionSlot;
        // this.getInGameUI().reelQuestUI.initPlayAni();
        // if (isCurSlot) {
        //     await AsyncHelper.delayWithComponent(.2, this);
        //     this.getInGameUI().reelQuestUI.openNormal(true);
        // }
        await this.getInGameUI().openSlotStartPopup();
    }

    /**
     * 异步打开卷轴任务开始弹窗
     * @param reelQuestInfo 卷轴任务信息
     * @param promotionInfo 活动信息
     */
    async asyncOpenReelQuestMissionStartPopup(reelQuestInfo: any, promotionInfo: any): Promise<void> {
        // if (!reelQuestInfo.isCompleteAllMission()) {
        //     await new Promise<void>((resolve) => {
        //         ReelQuestMissionStartPopup.getPopup((err, popup) => {
        //             if (err) {
        //                 resolve();
        //                 return;
        //             }
        //             popup.setCloseCallback(() => {
        //                 resolve();
        //             });
        //             popup.open(promotionInfo);
        //         });
        //     });
        // } else {
        //     await new Promise<void>((resolve) => {
        //         AsyncHelper.delayWithComponent(.3, this);
        //         const openPopupInfo = new OpenPopupInfo();
        //         openPopupInfo.type = "ReelQuestCompletePopup";
        //         openPopupInfo.openCallback = () => {
        //             ReelQuestMissionCompletePopup.getPopup((err, popup) => {
        //                 if (err) {
        //                     resolve();
        //                     return;
        //                 }
        //                 popup.setCloseCallback(() => {
        //                     PopupManager.Instance().checkNextOpenPopup();
        //                     resolve();
        //                 });
        //                 popup.open(promotionInfo);
        //             });
        //         };
        //         PopupManager.Instance().addOpenPopup(openPopupInfo);
        //     });
        // }
    }

    /**
     * 刷新星级相册进度条
     */
    refreshStarAlbumGauge(): void {
        // const starAlbumGroup = UserInfo.instance().getUserStarAlbumGroup();
        // const currentBet = SlotGameRuleManager.Instance.getCurrentBetMoney();
        // const gauge = StarAlbumManager.instance().getEventBettingGauge(starAlbumGroup, currentBet);
        // const maxGauge = StarAlbumManager.instance().getEventMaxBettingGauge(starAlbumGroup);
        // this.getInGameUI().openStarAlbumGauge(gauge / maxGauge);
    }

    /**
     * 锦标赛游戏内定时任务
     */
    async tourneyInGameSchedule(): Promise<void> {
        if (this._isRunTourneySchedule) return;
        if (this._doTourneyEndProcess) return;
        this._isRunTourneySchedule = true;

        try {
            let isTourney = false;
            let tourneyId = -1;
            let tourneyTier = -1;

            // if (UserInfo.instance().isJoinTourney()) {
            //     isTourney = true;
            //     tourneyId = UserInfo.instance().getTourneyId();
            //     tourneyTier = UserInfo.instance().getTourneyTier();
            //     const curTourneyInfo = this.getInGameUI().tourneyUI._curTourneyInfo;
            //     const currentTime = TSUtility.getServerBaseNowUnixTime();

            //     if (curTourneyInfo.getCurrentSlotEndTime() >= currentTime) {
            //         const lastUpdateTime = SlotTourneyManager.Instance().getLastUpdateTimeProgressInfo(tourneyTier);
            //         if (lastUpdateTime + 60 <= currentTime && !SlotManager.Instance.isSpinState()) {
            //             await this.asyncRefreshTourneyInfo();
            //         }
            //     } else {
            //         this.unschedule(this.tourneyInGameSchedule.bind(this));
            //         if (!SlotManager.Instance.isSpinState()) {
            //             await this.asyncTourneyShowGameResult(false);
            //         }
            //     }
            // }

            const isComplete = await SlotTourneyManager.Instance().asyncCheckCompleteParticipateTourney(isTourney?1:0, tourneyId, tourneyTier);
            if (!isComplete) {
                return;
            }

            await HeroTooltipPopup.asyncGetTourneyCompleteTooltip(this.getInGameUI().node, this.getInGameUI().menuBtn.node);
        } catch (error) {
            console.error("tourneyLobbySchedule exception ", (error as Error).toString());
            FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error as Error));
        } finally {
            this._isRunTourneySchedule = false;
        }
    }

    /**
     * 异步刷新锦标赛信息
     */
    async asyncRefreshTourneyInfo(): Promise<boolean> {
        // const tourneyId = UserInfo.instance().getTourneyId();
        // const tourneyTier = UserInfo.instance().getTourneyTier();
        // const res = await CommonServer.Instance().asyncRequestSlotTourneyInfoByTourneyInfo(tourneyId, tourneyTier);
        // console.log("asyncRequestSlotTourneyInfoByTourneyInfo", JSON.stringify(res));

        // if (!TSUtility.isValid(this)) return false;
        // if (CommonServer.isServerResponseError(res)) {
        //     console.error("asyncRequestSlotTourneyInfoByTourneyInfo fail.");
        //     return false;
        // }

        // const progressInfo = ServerslotTourneyProgressInfo.parseObj(res.slotTourneyProgressInfo);
        // const currentTime = TSUtility.getServerBaseNowUnixTime();
        // const lastUpdateTime = SlotTourneyManager.Instance().getLastUpdateTimeProgressInfo(tourneyTier);

        // if (lastUpdateTime + 60 <= currentTime && !SlotManager.Instance.isSpinState()) {
        //     SlotTourneyManager.Instance().setSlotTourneyProgressInfo(progressInfo);
        //     this.getInGameUI().tourneyUI.refreshInfo();
        // }

        console.log("asyncRefreshTourneyInfo");
        return true;
    }

    /**
     * 异步显示锦标赛游戏结果
     * @param isForce 是否强制显示
     */
    async asyncTourneyShowGameResult(isForce: boolean): Promise<boolean> {
        if (this._isProcessingTourneyShowGameResult) return false;
        this._isProcessingTourneyShowGameResult = true;
        this.getInGameUI().showBlockingBG();

        try {
            const result = await this.asyncInner_TourneyShowGameResult(isForce);
            return result;
        } finally {
            this.getInGameUI().hideBlockingBG();
            this._isProcessingTourneyShowGameResult = false;
        }
    }

    /**
     * 内部-异步显示锦标赛游戏结果
     * @param isForce 是否强制显示
     */
    async asyncInner_TourneyShowGameResult(isForce: boolean): Promise<boolean> {
        const curTourneyInfo = this.getInGameUI().tourneyUI._curTourneyInfo;
        // const tourneyId = UserInfo.instance().getTourneyId();
        // const tourneyTier = UserInfo.instance().getTourneyTier();

        // if (!curTourneyInfo) {
        //     console.error("asycTourneyInGameWork invalid status");
        //     return false;
        // }

        // if (this._tourneyState === SlotTourneyIngameState.EndGame) {
        //     return false;
        // }

        let decisionState = -1;
        if (isForce) {
            if (this._tourneyState === SlotTourneyIngameState.InGame) {
                decisionState = 1;
            } else if (this._tourneyState === SlotTourneyIngameState.WaitEndBonusGame) {
                decisionState = 3;
            }
        } else {
            console.log("isSpinState true");
            if (!SlotGameResultManager.Instance.isBaseGameNextSubGameKey()) {
                if (this._tourneyState === SlotTourneyIngameState.InGame) {
                    decisionState = 2;
                } else if (this._tourneyState === SlotTourneyIngameState.WaitEndBonusGame) {
                    decisionState = 4;
                }
            } else {
                if (this._tourneyState === SlotTourneyIngameState.InGame) {
                    decisionState = 1;
                } else if (this._tourneyState === SlotTourneyIngameState.WaitEndBonusGame) {
                    decisionState = 3;
                }
            }
        }

        console.log("decisionState ", decisionState, isForce, this._tourneyState, SlotGameResultManager.Instance.isBaseGameNextSubGameKey(), SlotManager.Instance.isSpinState());
        if (decisionState === -1) {
            console.error("invalid decisionState", decisionState);
            decisionState = 1;
        }

        if (decisionState === 4) {
            return true;
        }

        // if (decisionState !== 3) {
        //     return await this.processTourneyNormalResult(decisionState, tourneyId, tourneyTier);
        // }

        // 处理结束状态
        this.setSlotTourneyState(SlotTourneyIngameState.EndGame);
        PopupManager.Instance().showDisplayProgress(true);
        await AsyncHelper.delayWithComponent(1.5, this);
        PopupManager.Instance().showDisplayProgress(false);

        await new Promise<void>((resolve) => {
            CommonPopup.getCommonPopup((err, popup) => {
                if (err) {
                    console.error("Get CommonPopup fail.");
                    resolve();
                    return;
                }
                popup.open().setInfo(
                    "The Slot Tourney round is over.",
                    "\nFeature spins have expired. They are available for 10 minutes after the end of Slot Tourney.\n\nPress 'OK' to move back to the lobby."
                ).setOkBtn("OK", () => {
                    const zoneId = UserInfo.instance().getZoneId();
                    const zoneName = UserInfo.instance().getZoneName();
                    this.goToLobby(zoneId, zoneName);
                    resolve();
                });
            });
        });

        return true;
    }

    /**
     * 处理锦标赛普通结果
     * @param decisionState 决策状态
     * @param tourneyId 锦标赛ID
     * @param tourneyTier 锦标赛等级
     */
    private async processTourneyNormalResult(decisionState: number, tourneyId: number, tourneyTier: number): Promise<boolean> {
        if (decisionState === 1) {
            SlotManager.Instance._isAvailable = false;
        }

        let isSettled = false;
        while (!isSettled) {
            const stateRes = await CommonServer.Instance().asyncRequestSlotTourneyState(tourneyId);
            if (!TSUtility.isValid(this)) return false;
            if (CommonServer.isServerResponseError(stateRes)) {
                console.error("Invalid asyncRequestSlotTourneyState");
                await AsyncHelper.delayWithComponent(.5, this);
                continue;
            }

            const tourneyState = ServerSlotTourneyState.parseObj(stateRes);
            if (tourneyState.slotTourneyState === SlotTourneyStateType.SettlementCompleted) {
                isSettled = true;
                break;
            }

            await AsyncHelper.delayWithComponent(.5, this);
        }

        const infoRes = await CommonServer.Instance().asyncRequestSlotTourneyInfoByTourneyInfo(tourneyId, tourneyTier);
        console.log("asyncRequestSlotTourneyInfoByTourneyInfo", JSON.stringify(infoRes));

        if (!TSUtility.isValid(this)) return false;
        if (CommonServer.isServerResponseError(infoRes)) {
            console.error("asyncRequestSlotTourneyInfoByTourneyInfo fail.");
            return false;
        }

        // const progressInfo = ServerslotTourneyProgressInfo.parseObj(infoRes.slotTourneyProgressInfo);
        // let inboxExtraInfo: InboxExtraInfoSlotTourneyReward | null = null;
        // let changeResult: ChangeResult | null = null;

        // if (progressInfo.userRank !== 0) {
        //     await UserInfo.instance().asyncRefreshInboxInfo();
        //     const inboxInfo = UserInfo.instance().getUserInboxInfo();
        //     let messageUid = "";

        //     for (let i = 0; i < inboxInfo.inboxMessages.length; ++i) {
        //         const msg = inboxInfo.inboxMessages[i];
        //         if (msg.message.mType === INBOX_ITEM_TYPE.TOURNEY_RESULT) {
        //             const extra = JSON.parse(msg.message.extraInfo);
        //             inboxExtraInfo = InboxExtraInfoSlotTourneyReward.parse(extra);
        //             if (inboxExtraInfo.tourneyID === tourneyId && inboxExtraInfo.tier === tourneyTier) {
        //                 messageUid = msg.message.mUid;
        //                 break;
        //             }
        //         }
        //     }

        //     if (messageUid === "") {
        //         console.error("not found inbox message...");
        //         return false;
        //     }

        //     const acceptRes = await CommonServer.Instance().asyncRequestAcceptInboxMessageMulti(UserInfo.instance().getUid(), UserInfo.instance().getAccessToken(), [messageUid]);
        //     if (!TSUtility.isValid(this)) return false;
        //     if (CommonServer.isServerResponseError(acceptRes)) {
        //         console.error("acceptResult fail", acceptRes);
        //         return false;
        //     }

        //     changeResult = UserInfo.instance().getServerChangeResult(acceptRes);
        // } else {
        //     inboxExtraInfo = new InboxExtraInfoSlotTourneyReward();
        //     inboxExtraInfo.tier = tourneyTier;
        //     inboxExtraInfo.tourneyID = tourneyId;
        //     inboxExtraInfo.rank = 0;
        //     inboxExtraInfo.rankGroup = SlotTourneyManager.SlotTourneyServerRankGroupType.Out10Per;
        //     changeResult = new ChangeResult();
        // }

        // SlotTourneyManager.Instance().removeParticipationInfo(tourneyId, tourneyTier);
        // this._doTourneyEndProcess = true;

        // const resultPopup = await SlotTourneyResultPopup.asyncGetPopup();
        // if (!resultPopup) {
        //     UserInfo.instance().applyChangeResult(changeResult!);
        //     return false;
        // }

        // return await new Promise<boolean>((resolve) => {
        //     resultPopup.open(inboxExtraInfo!, progressInfo, changeResult!);
        //     resultPopup.setCloseCallback(() => {
        //         if (decisionState === 1) {
        //             const zoneId = UserInfo.instance().getZoneId();
        //             const zoneName = UserInfo.instance().getZoneName();
        //             this.goToLobby(zoneId, zoneName);
        //             this.setSlotTourneyState(SlotTourneyIngameState.EndGame);
        //         } else {
        //             this.setSlotTourneyState(SlotTourneyIngameState.WaitEndBonusGame);
        //             this.asyncWaitEndBonusGameTooltip(SlotManager.Instance._bottomUI!.getRootNode(), SlotManager.Instance._bottomUI!.getSpinBtn().node);
        //         }
        //         resolve(true);
        //     });
        // });
    }

    /**
     * 设置锦标赛状态
     * @param state 锦标赛状态
     */
    setSlotTourneyState(state: SlotTourneyIngameState): void {
        this._tourneyState = state;
        if (state === SlotTourneyIngameState.WaitEndBonusGame) {
            this.getInGameUI().tourneyUI.setEndTourney();
        }
    }

    /**
     * 异步显示锦标赛结束提示弹窗
     * @param parent 父节点
     * @param target 目标节点
     */
    async asyncWaitEndBonusGameTooltip(parent: cc.Node, target: cc.Node): Promise<HeroTooltipPopup> {
        const popup = await HeroTooltipPopup.asyncGetPopup();
        if (!TSUtility.isValid(parent) || !TSUtility.isValid(popup)) {
            return null;
        }

        popup.open(parent);
        popup.setPivotPosition(target, -30, 30);
        popup.setInfoText("The Slot Tourney round has ended.\nYou may still complete the feature spins left.");

        const frameInfo: any = {
            paddingWidth: 100,
            paddingHeight: 80,
            textOffsetX: 0,
            textOffsetY: 0,
            useArrow: true,
            arrowPosType: 0,
            arrowPosAnchor: 1,
            arrowPosOffset: -60,
            baseFontSize: 26,
            fontLineHeight: 32
        };

        const heroInfo: any = {
            anchorX: 0,
            anchorY: 0.5,
            offsetX: 0,
            offsetY: 0,
            heroId: "",
            heroRank: 0,
            iconType: "Small",
            heroState: 0
        };

        const settingInfo: any = {
            useBlockBG: false,
            reserveCloseTime: 4
        };

        const makingInfo = HT_MakingInfo.parseObj({ frameInfo, heroInfo, settingInfo, startAniInfo: [] });
        makingInfo.heroInfo.heroId = "";
        makingInfo.heroInfo.heroRank = 0;
        popup.setHero_HT_MakingInfo(makingInfo);
        popup.refreshUI();

        return popup;
    }

    /**
     * 播放最近游玩教程
     */
    playRecentlyPlayedTutorial(): void {
        if (ServerStorageManager.getAsBoolean(StorageKeyType.RECENTLY_PLAYED_TUTORIAL)) {
            return;
        }

        // const curMissionSlot = UserInfo.instance().getUserReelQuestInfo().curMissionSlot;
        // if (SlotGameRuleManager.Instance.slotID === curMissionSlot) {
        //     return;
        // }

        let recentPlays = UserInfo.instance()._userInfo.userGameInfo.recentPlaySlots;
        if (!TSUtility.isValid(recentPlays)) {
            recentPlays = [];
        }

        let recentCount = recentPlays.length;
        // const currentSlotId = UserInfo.instance().getGameId();
        // const isCurrentInRecent = recentPlays.some(play => play.slotID === currentSlotId);
        // if (isCurrentInRecent) {
        //     recentCount -= 1;
        // }

        if (recentCount <= 0) {
            return;
        }

        this.getInGameUI().startRecentlyPlayedTutorial();
        ServerStorageManager.save(StorageKeyType.RECENTLY_PLAYED_TUTORIAL, true);
    }

    /**
     * 初始化老虎机游戏流程
     */
    async onInitSlotGameProcess(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const zoneId = SlotManager.Instance.getZoneId();
            let tourneyParam = null;

            if (SDefine.SlotTournament_Use && SlotTourneyManager.Instance().isEnterSlotTourney()) {
                const tourneyTier = SlotTourneyManager.Instance().getEnterTourneyTier();
                const tourneyId = SlotTourneyManager.Instance().getEnterTourneyID();
                tourneyParam = { tourneyID: tourneyId, tourneyTier: tourneyTier };
            }

            // CommonServer.Instance().getSlotGameInfo(
            //     UserInfo.instance().getUid(),
            //     UserInfo.instance().getAccessToken(),
            //     zoneId,
            //     SlotGameRuleManager.Instance.slotID,
            //     JSON.stringify(tourneyParam)
            // ).then((res) => {
            //     if (CommonServer.isServerResponseError(res)) {
            //         if (UserInfo.isAuthFail()) {
            //             resolve(false);
            //             return;
            //         }
            //         resolve(false);
            //         return;
            //     }

            //     SlotManager.Instance._slotGameInfo = res;
            //     SlotGameRuleManager.Instance.setSlotInfo(res);
            //     SlotGameResultManager.Instance.setSlotInfo(res);

            //     const leagueInfo = TSUtility.isValid(res.leagueInfo) ? res.leagueInfo : null;
            //     SlotSuiteLeagueManager.Instance.setLeagueInfo(leagueInfo);
            //     SlotFeverModeManager.instance.setFeverModeInfo(leagueInfo);

            //     UserInfo.instance().setLocation("Slot");
            //     UserInfo.instance().setGameId(SlotGameRuleManager.Instance.slotID);

            //     if (SDefine.SlotTournament_Use) {
            //         if (SlotTourneyManager.Instance().isEnterSlotTourney()) {
            //             if (!res.slotTourneyProgressInfo) {
            //                 SlotTourneyManager.Instance().clearEnterSlotTourney();
            //                 resolve(false);
            //                 return;
            //             }
            //             const progressInfo = ServerslotTourneyProgressInfo.parseObj(res.slotTourneyProgressInfo);
            //             SlotTourneyManager.Instance().setSlotTourneyProgressInfo(progressInfo);
            //             const tourneyTier = SlotTourneyManager.Instance().getEnterTourneyTier();
            //             const tourneyId = SlotTourneyManager.Instance().getEnterTourneyID();
            //             UserInfo.instance().setTourneyTierInfo(tourneyTier, tourneyId);
            //         } else {
            //             UserInfo.instance().resetTourneyTier();
            //         }
            //         SlotTourneyManager.Instance().clearEnterSlotTourney();
            //     }

            //     SlotManager.Instance.processChangeShareInfo();
            //     resolve(true);
            // }).catch(() => {
            //     resolve(false);
            // });
        });
    }

    /**
     * 旋转前处理
     * @param res 服务器返回结果
     */
    onBeforeSpinProcess(res: any): ChangeResult {
        // if (TSUtility.isValid(res.leagueInfo)) {
        //     SlotSuiteLeagueManager.Instance.changeLeagueInfo(res.leagueInfo);
        //     SlotFeverModeManager.instance.setFeverModeInfo(res.leagueInfo);
        // } else {
        //     SlotSuiteLeagueManager.Instance.changeLeagueInfo(null);
        // }

        // const casinoJackpotResult = SlotGameResultManager.Instance.getCasinoJackpotResult();
        // if (casinoJackpotResult) {
        //     SlotManager.Instance._casinoJackpotWinID = casinoJackpotResult.casinoJackpotWinID;
        // }

        // const changeResult = UserInfo.instance().getServerChangeResult(res);
        // const betWithdraw = changeResult.removeChangeCoinByPayCode(PayCode.SlotBetWithdraw);
        // if (betWithdraw !== 0) {
        //     this.getInGameUI().onSpinBetting(changeResult);
        // }
        // UserInfo.instance().setLastTotalbet(-1 * betWithdraw);

        // const levelPoint = changeResult.getTotalChangeLevelPoint();
        // this.getInGameUI().addLevelExp(levelPoint);

        // return changeResult;
        return null;
    }

    /**
     * 旋转中处理
     * @param res 服务器返回结果
     * @param changeResult 变更结果
     */
    onSpinProcess(res: any, changeResult: ChangeResult): void {
        // if (SDefine.SlotTournament_Use && UserInfo.instance().isJoinTourney() && res.slotTourneyProgressInfo) {
        //     const progressInfo = ServerslotTourneyProgressInfo.parseObj(res.slotTourneyProgressInfo);
        //     SlotTourneyManager.Instance().setSlotTourneyProgressInfo(progressInfo);
        // }

        // const jiggyPuzzleHist = changeResult.getPromotionHist(JiggyPuzzlePromotion.PromotionKeyName);
        // if (jiggyPuzzleHist) {
        //     this.getInGameUI().jiggyPuzzleUI.refreshUI(jiggyPuzzleHist);
        // }
    }

    /**
     * 旋转后处理
     * @param res 服务器返回结果
     * @param changeResult 变更结果
     */
    onAfterSpinProcess(res: any, changeResult: ChangeResult): void {
        const newUserMissionHist = changeResult.getPromotionHist(NewUserMissionPromotion.PromotionKeyName);
        if (newUserMissionHist) {
            const newUserMissionReward = changeResult.removeChangeCoinByPayCode(PayCode.NEWUSERMISSION);
            ServiceInfoManager.NUMBER_NEW_USER_MISSION_REWARD = newUserMissionReward;
            // UserInfo.instance().setUserPromotionInfo(newUserMissionHist);
        }

        this._spinChangeResult!.addChangeResult(changeResult);
    }

    /**
     * 检查旋转错误状态
     * @param res 服务器返回结果
     */
    onCheckSpinErrorState(res: any): boolean {
        const errorCode = CommonServer.getErrorCode(res);

        // if (SDefine.SlotTournament_Use && UserInfo.instance().isJoinTourney() && errorCode === SDefine.ERR_TOURNEY_ALREADY_END) {
        //     console.log("spin fail", errorCode);
        //     this.asyncTourneyShowGameResult(true);
        //     return false;
        // }

        // if (CommonServer.isServerResponseError(res)) {
        //     if (!UserInfo.isAuthFail()) {
        //         this.showSpinErrorPopup(res);
        //     }
        //     SlotReelSpinStateManager.Instance.setCurrentState(STATE_STOP);
        //     if (SlotReelSpinStateManager.Instance.getAutospinMode()) {
        //         SlotReelSpinStateManager.Instance.changeAutospinMode(false);
        //     }
        //     SlotManager.Instance.flagSpinRequest = false;
        //     return false;
        // }

        return true;
    }

    /**
     * 显示旋转错误弹窗
     * @param res 服务器返回结果
     */
    showSpinErrorPopup(res: any): void {
        if (!TSUtility.isValid(res)) return;

        const errorCode = res.errorCode?.toString() || "";
        const errorStatusCode = res.errorStatusCode?.toString() || "";

        if (errorCode === "2097155" || errorStatusCode === "2097155") {
            // MessageRoutingManager.instance().emitMessage(MSG.OPEN_SLOT_ERROR_MESSAGE_BOX);
            return;
        }

        CommonPopup.getCommonPopup((err, popup) => {
            if (err) {
                console.error("Get CommonPopup fail.");
                return;
            }
            const errorMsg = `errorCode: ${errorCode}\nerrorMsg: ${res.errorMsg}\nerrorStatusCode: ${errorStatusCode}`;
            popup.open().setInfo("Slot Spin Fail.", errorMsg);
        });
    }

    /**
     * 获取狂热模式图标移动状态
     */
    getCheckFeverMoveIcon(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            if (this.isAvailableFeverMode()) {
                if (SlotFeverModeManager.instance.getCreateFeverItemCount() > 0) {
                    SlotFeverModeManager.instance.playMoveFeverIconFromFeverUILayer();
                }
                state.setDone();
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 获取狂热模式时间检查状态
     */
    getCheckFeverModeTime = function() {
        var e = this
            , t = new State;
        return t.addOnStartCallback(function() {
            if (0 != e.isAvailableFeverMode()) {
                var n = e.getInGameUI().suiteLeagueUI.feverUI;
                if (!TSUtility.isValid(n) && 1 != n.isPlayFeverTime()) {
                    var o = SlotFeverModeManager.instance.getWaitMoveTime()
                        , a = SlotFeverModeManager.instance.getFeverTicket();
                    TSUtility.isValid(a) ? (e.getInGameUI().setStateBlockInput(true),
                    e.scheduleOnce(function() {
                        n.playFeverTime(),
                        e.scheduleOnce(function() {
                            e.getInGameUI().setStateBlockInput(false),
                            n.refreshFeverLevel(),
                            t.setDone()
                        }
                        .bind(e), 5)
                    }
                    .bind(e), o)) : (n.refreshFeverLevel(),
                    t.setDone())
                } else
                    t.setDone()
            } else
                t.setDone()
        }),
        t
    }
    
    getShowSpinEndPopup = function() {
        var e = new SequencialState
            , t = 0;
        return TSUtility.isTestDirectSlotMode() ? e.insert(0, this.getApplyGameResultProsess()) : (e.insert(t++, this.changeSuiteLeagueRank()),
        e.insert(t++, this.saveThrillJackpotItemInfo()),
        e.insert(t++, this.getCheckThrillJackpotPopup()),
        e.insert(t++, this.getApplyGameResultProsess()),
        e.insert(t++, this.getCheckSupersizeIt()),
        e.insert(t++, this.getCheckUnlockContents()),
        e.insert(t++, this.getCheckFeverModeTime()),
        e.insert(t++, this.getTourneyResultProcess()),
        e.insert(t++, this.getCheckPiggyBankPopup()),
        e.insert(t++, this.getCheckToolTip()),
        e.insert(t++, this.getCheckHyperBountySeasonMissionComplete())),
        e
    }
    
    getCheckToolTip = function() {
        var e = this
            , t = new State;
        return t.addOnStartCallback(function() {
            e.getInGameUI().checkTooltip(),
            t.setDone()
        }),
        t
    }
    
    getCheckUnlockContents = function() {
        var e = this
            , t = new State;
        return t.addOnStartCallback(function() {
            !SlotGameResultManager.Instance.isBaseGameNextSubGameKey() ? e.getInGameUI().updateUnlockContents(function() {
                PopupManager.Instance().isOpenPopupOpen() ? e.scheduleOnce(function() {
                    PopupManager.Instance().isOpenPopupOpen() ? PopupManager.Instance().setOpenPopupAllCloseCallback(function() {
                        t.setDone()
                    }) : t.setDone()
                }, .1) : t.setDone()
            }) : t.setDone()
        }),
        t
    }
    
    getCheckPiggyBankPopup = function() {
        var e = this
            , t = new State;
        return t.addOnStartCallback(function() {
            SlotGameResultManager.Instance.isBaseGameNextSubGameKey() ? (1 == e._inGameUI.piggyBankUI.isReadyMaxMoneyPopOpen() && (e._inGameUI.piggyBankUI.resetReadyMaxMoneyPopOpen(),
            !ServiceInfoManager.instance.isSpinOpenPopup(["RecordBreaker", "EpicWin"]) && e._inGameUI.piggyBankUI.showPiggyBankOfferPopup()),
            ServiceInfoManager.instance.resetSpinOpenPopup(),
            !PopupManager.Instance().isOpenPopupOpen() ? t.setDone() : e.scheduleOnce(function() {
                PopupManager.Instance().isOpenPopupOpen() ? PopupManager.Instance().setOpenPopupAllCloseCallback(function() {
                    MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.RESERVEDONBALLOON),
                    t.setDone()
                }) : t.setDone()
            }, .1)) : t.setDone()
        }),
        t
    }
   
    getCheckSupersizeIt = function() {
        var e = this
            , t = new State;
        return t.addOnStartCallback(function() {
            SupersizeItManager.instance.isAvailablePromotion() ? (TSUtility.isValid(e._inGameUI) && TSUtility.isValid(e._inGameUI.iconSupersizeIt) && SupersizeItManager.instance.isEnableEvent() && 0 == e._inGameUI.iconSupersizeIt.node.active && (SupersizeItManager.instance.initialize(),
            e._inGameUI.iconSupersizeIt.initialize(),
            e._inGameUI.iconSupersizeIt.playOpenAnimation(),
            SlotManager.Instance.node.emit("onSupersizeItStart")),
            !SupersizeItManager.instance.isReservationOpenPopup() ? t.setDone() : e.openInGamePopup("SuperSizeItLobby", function() {
                SupersizeItManager.instance.setReservationOpenPopup(false)
            }, function() {
                t.setDone()
            })) : t.setDone()
        }),
        t
    }
    
    getCheckHyperBountySeasonMissionComplete = function() {
        var e = new State;
        return e.addOnStartCallback(function() {
            if (HyperBountyManager.instance._arrCompletedSeasonMissionArray.length) {
                for (var t = 0; t < HyperBountyManager.instance._arrCompletedSeasonMissionArray.length; t++) {
                    var n = HyperBountyManager.instance._arrCompletedSeasonMissionArray[t];
                    TSUtility.isValid(n) && (n.hyperBountyMissionInfo.numMissionID <= 401 && n.hyperBountyMissionInfo.numMissionID >= 101 || 901 == n.hyperBountyMissionInfo.numMissionID) && (PopupManager.Instance().addOpenPopup(n.openPopupInfo),
                    HyperBountyManager.instance._arrCompletedSeasonMissionArray[t] = null)
                }
                e.setDone()
            } else
                e.setDone()
        }),
        e
    }
    
    asyncTourneyResultProcess = function(e) {
        // return l(this, void 0, void 0, function() {
        //     var t, n;
        //     return r(this, function(o) {
        //         switch (o.label) {
        //         case 0:
        //             return 0 ==SDefine.SlotTournament_Use ? (e.setDone(),
        //             [2]) : 0 == UserInfo.instance().isJoinTourney() ? (e.setDone(),
        //             [2]) : (this._inGameUI.tourneyUI.refreshInfo(),
        //             t = this._inGameUI.tourneyUI._curTourneyInfo,
        //             n = TSUtility.getServerBaseNowUnixTime(),
        //             t.getCurrentSlotEndTime() >= n ? (e.setDone(),
        //             [2]) : [4, this.asyncTourneyShowGameResult(false)]);
        //         case 1:
        //             return o.sent(),
        //             0 == TSUtility.isValid(this) ? [2] : (e.setDone(),
        //             [2])
        //         }
        //     })
        // })
    }
    
    getTourneyResultProcess = function() {
        var e = this
            , t = new State;
        return t.addOnStartCallback(function() {
            e.asyncTourneyResultProcess(t)
        }),
        t
    }
    
    getCheckThrillJackpotPopup = function() {
        // var e = this
        //     , t = new SequencialState;
        // return t.addOnStartCallback(function() {
        //     if (null != e._changeResultThrillJackpotItemInfo) {
        //         for (var n = e._changeResultThrillJackpotItemInfo, o = null, a = 0; a < n.itemHist.length; ++a)
        //             if ("" != n.itemHist[a].changeInfo) {
        //                 (o = new ThrillJackpotWheelSpinResult).parse(JSON.parse(n.itemHist[a].changeInfo));
        //                 break
        //             }
        //         var i = new State;
        //         i.addOnStartCallback(function() {
        //             var t = e.getInGameUI().thrillWheelJackpotGaugeUI.getComponent(ThrillJackpotIngameIcon);
        //             TSUtility.isValid(t) ? (t.setInteractiveIconBtn(false),
        //             e.getInGameUI().setStateBlockInput(true),
        //             t.playFullAni(function() {
        //                 i.setDone()
        //             })) : i.setDone()
        //         });
        //         var l = new State;
        //         l.addOnStartCallback(function() {
        //             he.default.getPopup(function(e, t) {
        //                 t.open(o.getWheelSpinCount()),
        //                 t.setCloseCallback(function() {
        //                     l.setDone()
        //                 })
        //             })
        //         });
        //         var r = new State;
        //         r.addOnStartCallback(function() {
        //             ye.default.getPopup(function(t, n) {
        //                 n.open(o),
        //                 n.setCloseCallback(function() {
        //                     e.getInGameUI().thrillWheelJackpotGaugeUI.getComponent(ThrillJackpotIngameIcon).setInteractiveIconBtn(true),
        //                     e.getInGameUI().setStateBlockInput(false),
        //                     r.setDone()
        //                 })
        //             })
        //         });
        //         var s = new State;
        //         s.addOnStartCallback(function() {
        //             e.getInGameUI().thrillWheelJackpotGaugeUI.getComponent(ThrillJackpotIngameIcon).setCurrentGauge(true),
        //             s.setDone()
        //         }),
        //         t.insert(0, i),
        //         t.insert(1, l),
        //         t.insert(2, r),
        //         t.insert(3, s)
        //     }
        // }),
        // t
    }
   
    saveThrillJackpotItemInfo = function() {
        var e = this
            , t = new State;
        return t.addOnStartCallback(function() {
            e._changeResultThrillJackpotItemInfo = null;
            for (var n = e._spinChangeResult, o = 0; o < n.itemHist.length; ++o) {
                var a = n.itemHist[o];
                if (a.itemId ==SDefine.I_TRIPLE_THRILL_SILVER || a.itemId ==SDefine.I_TRIPLE_THRILL_GOLD || a.itemId ==SDefine.I_TRIPLE_THRILL_DIAMOND) {
                    var i = a.itemId;
                    e._changeResultThrillJackpotItemInfo = e._spinChangeResult.splitChangeResultByItemId(i);
                    break
                }
            }
            var l = [PayCode.TripleThrillSilver, PayCode.TripleThrillGold, PayCode.TripleThrillDiamond, PayCode.TripleThrillJackpotSilver, PayCode.TripleThrillJackpotGold, PayCode.TripleThrillJackpotDiamond];
            for (o = n.assetHist.length - 1; o >= 0; --o) {
                var r = n.assetHist[o];
                -1 != l.indexOf(r.payCode) && (e._changeResultThrillJackpotItemInfo.assetHist.push(r),
                n.assetHist.splice(o, 1))
            }
            if (n.tripleThrillJackpotGaugeHist.length > 0)
                for (o = 0; o < n.tripleThrillJackpotGaugeHist.length; ++o)
                    UserInfo.instance().setThrillJackpotWheelGaugeInfo(n.tripleThrillJackpotGaugeHist[o]);
            n.tripleThrillJackpotGaugeHist.length = 0,
            t.setDone()
        }),
        t
    }
    
    changeSuiteLeagueRank = function() {
        var e = this
            , t = new State;
        return t.addOnStartCallback(function() {
            var n = SlotGameRuleManager.Instance.slotID;
            TSUtility.isDynamicSlot(n) || SlotManager.Instance.IsLoungeNewSlot() ? (e._inGameUI.suiteLeagueUI.updateUI(null),
            t.setDone()) : t.setDone()
        }),
        t
    }
    
    getApplyGameResultProsess = function() {
        var e = this
            , t = new State;
    //     return t.addOnStartCallback(function() {
    //         if (0 == SlotGameResultManager.Instance.isBaseGameNextSubGameKey()) {
    //             for (var n = false, o = 0; o < e._spinChangeResult.itemHist.length; ++o) {
    //                 var a = e._spinChangeResult.itemHist[o];
    //                 if (1 == ve.CardPackItemInfo.isCardPackItem(a.itemId)) {
    //                     var i = e._spinChangeResult.splitChangeResultByItemId(a.itemId)
    //                         , l = e._spinChangeResult.splitChangeResultByItemId(SDefine.I_HERO_FORCE);
    //                     i.addChangeResult(l),
    //                     UserInfo.instance().applyChangeResult(i),
    //                     n = true
    //                 }
    //             }
    //             return 1 == n ? void (1 == PopupManager.Instance().isOpenPopupOpen() ? e.scheduleOnce(function() {
    //                 1 == PopupManager.Instance().isOpenPopupOpen() ? PopupManager.Instance().setOpenPopupAllCloseCallback(function() {
    //                     t.setDone()
    //                 }) : t.setDone()
    //             }, .1) : t.setDone()) : void t.setDone()
    //         }
    //         var r = PayCode.GetCasinoJackpotPay(SlotManager.Instance.getZoneId())
    //             , s = e._spinChangeResult.removeChangeCoinByPayCode(r);
    //         s > 0 && e.showCasinoJackpotPopup(s),
    //         1 == z.default.instance.isRefreshPromotion() && e._spinChangeResult.splitChangeResultByPromotionInfo(Ie.PowerGemPromotion.PromotionKeyName),
    //         e._spinChangeResult.clubPointHist.length > 0 && e._spinChangeResult.clubPointHist[0].beforeGrade != e._spinChangeResult.clubPointHist[0].afterGrade && e.showClubVaultUpgradePopup(),
    //         UserInfo.instance().applyChangeResult(e._spinChangeResult),
    //         MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.UPDATE_TUTORIAL),
    //         MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.HYPER_BOUNTY_MISSION_UPDATE, false),
    //         1 != PopupManager.Instance().isOpenPopupOpen() ? t.setDone() : e.scheduleOnce(function() {
    //             1 == PopupManager.Instance().isOpenPopupOpen() ? PopupManager.Instance().setOpenPopupAllCloseCallback(function() {
    //                 MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.RESERVEDONBALLOON),
    //                 t.setDone()
    //             }) : t.setDone()
    //         }, .1)
    //     }),
    //     t
    // }
    
    // showCasinoJackpotPopup = function(e) {
    //     var t = this;
    //     UserInfo.instance()._zoneId,
    //     UserInfo.instance()._zoneName,
    //     j.default.getPopup(function() {});
    //     var n = new d.OpenPopupInfo;
    //     n.type = "CasinoJackpot",
    //     n.openCallback = function() {
    //         0 != TSUtility.isValid(t) ? (PopupManager.Instance().showBlockingBG(true),
    //         t._inGameUI.showBlockingBG(),
    //         t.scheduleOnce(function() {
    //             j.default.getPopup(function(n, o) {
    //                 PopupManager.Instance().showBlockingBG(false),
    //                 t._inGameUI.hideBlockingBG(),
    //                 UserInfo.instance().resetCasinoJackpot(SlotManager.Instance.getZoneId()),
    //                 n ? PopupManager.Instance().checkNextOpenPopup() : o.open(e, SlotManager.Instance._casinoJackpotWinID)
    //             })
    //         }, 1.4)) : PopupManager.Instance().checkNextOpenPopup()
    //     }
    //     .bind(this),
    //     PopupManager.Instance().addOpenPopup(n)
    // }
    
    // onSendSpinRequest = function(e, t) {
    //     return l(this, void 0, Promise, function() {
    //         var n = this;
    //         return r(this, function() {
    //             return [2, new Promise(function(o) {
    //                 return l(n, void 0, void 0, function() {
    //                     var n, a, i, l, s, c, u, p;
    //                     return r(this, function(r) {
    //                         switch (r.label) {
    //                         case 0:
    //                             if ((a = {}).uid = UserInfo.instance().getUid(),
    //                             a.betLine = 0,
    //                             a.betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine(),
    //                             a.machineID = SlotGameResultManager.Instance.getMachineID(),
    //                             a.subGameKey = SlotGameResultManager.Instance.getNextSubGameKey(),
    //                             a.isAutoSpin =SlotReelSpinStateManager.Instance.getAutospinMode(),
    //                             a.spinSessionKey = SlotGameResultManager.Instance.getSpinSessionKey(),
    //                             1 == UserInfo.instance().isJoinTourney() && (a.tourneyID = UserInfo.instance().getTourneyId(),
    //                             a.tourneyTier = UserInfo.instance().getTourneyTier()),
    //                             null != t && null != t && (a.intParams = t),
    //                             null != SlotManager.Instance.cheatComponent && "" != (i = SlotManager.Instance.cheatComponent.getCheatString()))
    //                                 try {
    //                                     a.cheatKey = JSON.parse(i)
    //                                 } catch (f) {
    //                                     "jackpot" != i && alert("cheat string is not valid json format.\n" + f)
    //                                 }
    //                             return MessageRoutingManager.NUMBER_SPIN_COUNT++,
    //                             1 != (l = MessageRoutingManager.NUMBER_SPIN_COUNT) && 10 != l && 50 != l && 100 != l && 150 != l && 200 != l && 300 != l && 400 != l && 500 != l || L.default.slotSpin(SlotManager.Instance.getZoneId(), SlotGameRuleManager.Instance.slotID, l,SlotReelSpinStateManager.Instance.getAutospinMode() ? 1 : 0),
    //                             s = SlotManager.Instance.getZoneId(),
    //                             SlotManager.Instance.timeStampSendSpinRequest = Utility.getUnixTimestamp_MilliSecond(),
    //                             [4, G.default.Instance().requestSlotSpin(UserInfo.instance().getUid(), UserInfo.instance().getAccessToken(), s, SlotGameRuleManager.Instance.slotID, JSON.stringify(a))];
    //                         case 1:
    //                             return n = r.sent(),
    //                             SlotManager.Instance.timeStampRecvSpinRequest = Utility.getUnixTimestamp_MilliSecond(),
    //                             cc.log("spin result: " + JSON.stringify(n)),
    //                             1 == (c = G.default.getServerChangeResult(n)).getCheckByPayCode(PayCode.SlotBetWithdraw) && (MessageRoutingManager.NUMBER_BET_SPIN_COUNT++,
    //                             1 != (u = MessageRoutingManager.NUMBER_BET_SPIN_COUNT) && 10 != u && 50 != u && 100 != u && 150 != u && 200 != u && 300 != u && 400 != u && 500 != u || L.default.betSpin(SlotManager.Instance.getZoneId(), SlotGameRuleManager.Instance.slotID, u,SlotReelSpinStateManager.Instance.getAutospinMode() ? 1 : 0),
    //                             UserInfo.instance().addTotalSpinCount(),
    //                             1 == (p = UserInfo.instance().getTotalSpinCount()) && (L.default.submitApplication(),
    //                             L.default.accBetSpin(SlotManager.Instance.getZoneId(), SlotGameRuleManager.Instance.slotID, p,SlotReelSpinStateManager.Instance.getAutospinMode() ? 1 : 0))),
    //                             Utility.isMobileGame() && 0 == ClubVaultPopup.getAsBoolean(de.StorageKeyType.MOBILE_GUIDE) && ClubVaultPopup.save(de.StorageKeyType.MOBILE_GUIDE, true),
    //                             SlotFeverModeManager.instance.setFeverModeInfoByItemHist(c.itemHist),
    //                             z.default.instance.setPowerGemInfoByPromotionHist(c.promotionHist, c.levelHist),
    //                             e && e(n),
    //                             o(n),
    //                             [2]
    //                         }
    //                     })
    //                 })
    //             }
    //             )]
    //         })
    //     })
    }
    
    getSpinChangeResult = function() {
        return this._spinChangeResult
    }
    
    onApplyGameResultMoney = function(e) {
        // 1 == this._spinChangeResult.removeChangeCoinByPayCodeAndMoney(PayCode.SpinResultPay, e) && UserInfo.instance().addUserAssetMoney(e)
    }
    
    onApplyGameResultMoneyBySubFromResult = function(e) {
        // 1 == this._spinChangeResult.subChangeCoinByPayCodeAndMoney(PayCode.SpinResultPay, e) && UserInfo.instance().addUserAssetMoney(e)
    }
   
    onApplyGameResultMoneyByMaxMoneyFromResult = function(e) {
        var t = this._spinChangeResult.subChangeCoinByPayCodeAndMaxMoney(PayCode.SpinResultPay, e);
        // t > 0 && UserInfo.instance().addUserAssetMoney(t)
    }
    
    setSymbolSpecialInfo = function(e, t) {
        SlotFeverModeManager.instance.isOpenFeverMode() && (SlotFeverModeManager.instance.createFeverIcon(new FeverSymbolInfo(e,SlotManager.Instance.getSymbolWidth(),SlotManager.Instance.getSymbolHeight(t))),
        e.once("sendSpecialModeMessage", function(t) {
            (t & SpecialType.FEVER) > 0 && SlotFeverModeManager.instance.moveFeverSymbolToFeverUILayer(e)
        }))
    }
    
    onSpinUserAssetChange = function(e) {
        // UserInfo.instance().addUserAssetMoney(-e),
        MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.SPIN_COUNT_UPDATE),
        TimeBonusManager.instance.addSpinBoosterExp(e)
    }
    
    onSetCurrentBetPerLine = function(e) {
        var t = e
            , n = SlotGameRuleManager.Instance.getBetMoney(t);
        // if (SDefine.LevelBettingLock_Flag) {
        //     var o = UserInfo.instance().getZoneId();
        //     if (LevelBettingLockConfig.Instance().isUseLevelBettingLock(o)) {
        //         var a = LevelBettingLockConfig.Instance().getZoneInfo(o).getNextLevelBetLock_LevelInfo(UserInfo.instance().getUserLevel());
        //         if (null != a && a.betMoney <= n)
        //             for (var i = SlotGameRuleManager.Instance.zoneBetPerLines, l = 1; l < i.length; ++l) {
        //                 var r = SlotGameRuleManager.Instance.getBetMoney(i[l]);
        //                 if (a.betMoney <= r) {
        //                     t = i[l - 1];
        //                     break
        //                 }
        //             }
        //     }
        // }
        
        // SlotGameRuleManager.Instance._flagLockIncreaseBetMoneyUpperGuideBetPerLine && SlotGameRuleManager.Instance._guideBetPerLine < t && (t = SlotGameRuleManager.Instance._guideBetPerLine);
        // var s = UserInfo.instance().getPromotionInfo(WelcomeBonusPromotion.PromotionKeyName)
        //     , c = TSUtility.isValid(s) && 0 == s.isReceived;
        // return 0 == UserInfo.instance().getTotalCoin() && c && !UserInfo.instance().isJoinTourney() && SlotGameRuleManager.Instance.slotID ==SDefine.TUTORIAL_SLOTID && SlotManager.Instance.getZoneId() ==SDefine.HIGHROLLER_ZONEID && (t =SDefine.tutorialBetLine),
        // t
    }
    
    onSpinProcessRenewal_STATE_CUSTOM_ACTIVE_SPINBUTTON = function() {
        var e = this;
        null == this.popupCustomMessage && CommonPopup.getCommonPopup(function(t, n) {
            var o =SlotReelSpinStateManager.Instance.customCaption
                , a =SlotReelSpinStateManager.Instance.customMessage;
            e.popupCustomMessage = n.node,
            n.open().setInfo(o, a).setOkBtn("OK", function() {
                n.close(),
                e.popupCustomMessage = null
            })
        })
    }
    
    openNotEnoughMoneyShopPopup = function() {
        var e = this;
        // if (0 != this._isEnableAllinRoot) {
        //     if (this._isEnableAllinRoot = false,
        //     SDefine.FB_Instant_iOS_Shop_Flag)
        //         return MessageRoutingManager.BOOL_ALL_IN = true,
        //         void ((UserInfo.instance().getUserInboxCollectEnableCnt() > 9 || UserInfo.instance().enableInboxReward_AllIn() || UserInfo.instance().enableInboxReward_Normal()) && G.default.Instance().requestAvgBetInfo(UserInfo.instance().getUid(), UserInfo.instance().getAccessToken(), function(t) {
        //             if (!G.default.isServerResponseError(t)) {
        //                 TSUtility.isValid(t.userAvgBetInfo) && (TSUtility.isValid(t.userAvgBetInfo.totalBet) && UserInfo.instance().setTwoH_TotalBet(t.userAvgBetInfo.totalBet),
        //                 TSUtility.isValid(t.userAvgBetInfo.totalSpin) && UserInfo.instance().setTwoH_TotalSpin(t.userAvgBetInfo.totalSpin)),
        //                 PopupManager.Instance().showDisplayProgress(true);
        //                 var n = SlotGameResultManager.getAllInLastADView(UserInfo.instance().getUid()) + 60 * (Utility.getUnixTimestamp() > SlotGameResultManager.getAllinADViewTime(UserInfo.instance().getUid()) + 300 ? 1 : 3) - TSUtility.getServerBaseNowUnixTime();
        //                 UserInfo.instance().enableInboxReward_AllIn() && n < 0 ? H.default.getPopup(function(t, n) {
        //                     PopupManager.Instance().showDisplayProgress(false),
        //                     null == t ? (n.open(),
        //                     n.setCloseCallback(function() {
        //                         e._isEnableAllinRoot = true,
        //                         MessageRoutingManager.BOOL_ALL_IN = false
        //                     })) : cc.error("Instant_iOS_AllinPopup.getPopup invalid status")
        //                 }) : Q.default.getPopup(function(t, n) {
        //                     PopupManager.Instance().showDisplayProgress(false),
        //                     null == t && (n.open($.RewardCenterViewType.INBOX_INBOX),
        //                     n.setCloseCallback(function() {
        //                         e._isEnableAllinRoot = true
        //                     }))
        //                 })
        //             }
        //         }));
        //     G.default.Instance().requestAvgBetInfo(UserInfo.instance().getUid(), UserInfo.instance().getAccessToken(), function(t) {
        //         G.default.isServerResponseError(t) || (TSUtility.isValid(t.userAvgBetInfo) && (TSUtility.isValid(t.userAvgBetInfo.totalBet) && UserInfo.instance().setTwoH_TotalBet(t.userAvgBetInfo.totalBet),
        //         TSUtility.isValid(t.userAvgBetInfo.totalSpin) && UserInfo.instance().setTwoH_TotalSpin(t.userAvgBetInfo.totalSpin)),
        //         G.default.Instance().requestModeBetInfo(UserInfo.instance().getUid(), UserInfo.instance().getAccessToken(), function(t) {
        //             if (!G.default.isServerResponseError(t)) {
        //                 TSUtility.isValid(t.modeBetDepth) && UserInfo.instance().setModeBetDepth(t.modeBetDepth),
        //                 PopupManager.Instance().showDisplayProgress(true);
        //                 var n = MessageRoutingManager.instance().isEnableAllInOffer();
        //                 if (MessageRoutingManager.instance().isEnable1stBargain()) {
        //                     var o = new G.PurchaseEntryReason(SDefine.P_ENTRYPOINT_NOTENOUGHMONEY,false);
        //                     PopupManager.Instance().showDisplayProgress(true);
        //                     var a = E.default.Instance().getOpenablePopInfo(false);
        //                     null == a && (E.default.Instance().setStartFirstBargain(),
        //                     a = E.default.Instance().getOpenablePopInfo(false)),
        //                     ie.default.getMainShopPopup(function(t, n) {
        //                         t || (n.setOpenComplete(function() {
        //                             var e = new G.PurchaseEntryReason(SDefine.P_ENTRYPOINT_NOTENOUGHMONEY,true)
        //                                 , t = E.default.Instance().getOpenablePopInfo(false);
        //                             null != t && t.isAvailable() && ("0" == t.type ? (PopupManager.Instance().showDisplayProgress(true),
        //                             ne.default.openPopup(e, null, function() {
        //                                 PopupManager.Instance().showDisplayProgress(false)
        //                             })) : "1" == t.type ? (PopupManager.Instance().showDisplayProgress(true),
        //                             SlotFeverModeManager.openPopup(e, null, function() {
        //                                 PopupManager.Instance().showDisplayProgress(false)
        //                             })) : "2" == t.type ? (PopupManager.Instance().showDisplayProgress(true),
        //                             ae.default.openPopup(e, null, function() {
        //                                 PopupManager.Instance().showDisplayProgress(false)
        //                             })) : "3" == t.type && (PopupManager.Instance().showDisplayProgress(true),
        //                             te.default.openPopup(e, null, function() {
        //                                 PopupManager.Instance().showDisplayProgress(false)
        //                             })))
        //                         }),
        //                         n.open(o, false),
        //                         n.setCloseCallback(function() {
        //                             e.addAllInCareFlow()
        //                         }))
        //                     })
        //                 } else if (1 == n) {
        //                     MessageRoutingManager.instance().setIsIngAllInOffer(true),
        //                     MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.ALLINPOPUP_START);
        //                     var i = new G.PurchaseEntryReason(SDefine.P_ENTRYPOINT_NOTENOUGHMONEY,false);
        //                     PopupManager.Instance().showDisplayProgress(true),
        //                     ie.default.getMainShopPopup(function(t, n) {
        //                         t || (n.setOpenComplete(function() {
        //                             SupersizeItManager.openPopup(new G.PurchaseEntryReason(SDefine.P_ENTRYPOINT_NOTENOUGHMONEY,false), null)
        //                         }),
        //                         n.open(i, false),
        //                         n.setCloseCallback(function() {
        //                             e.addAllInCareFlow()
        //                         }))
        //                     })
        //                 } else {
        //                     var l = new G.PurchaseEntryReason(SDefine.P_ENTRYPOINT_NOTENOUGHMONEY,false);
        //                     PopupManager.Instance().showDisplayProgress(true),
        //                     ie.default.getMainShopPopup(function(t, n) {
        //                         t || (n.open(l, false),
        //                         n.setCloseCallback(function() {
        //                             e.addAllInCareFlow()
        //                         }))
        //                     })
        //                 }
        //             }
        //         }))
        //     })
        // }
    }
    
    addAllInCareFlow = function() {
        var e = this;
        // 0 == UserInfo.instance().getUserServiceInfo().totalPurchaseCnt && UserInfo.instance().getUserLevelInfo().level >= 20 ? (MessageRoutingManager.NUMBER_ALL_IN_CARE_MONEY = UserInfo.instance().getTotalCoin(),
        // PopupManager.Instance().showDisplayProgress(true),
        // PopupManager.getPopup(function(t, n) {
        //     if (PopupManager.Instance().showDisplayProgress(false),
        //     !t) {
        //         var o = new G.PurchaseEntryReason(SDefine.P_ENTRYPOINT_NOTENOUGHMONEY,false);
        //         n.open(o),
        //         n.setAllInFunc(function() {
        //             e._isEnableAllinRoot = true
        //         }),
        //         n.setCloseCallback(function() {
        //             MessageRoutingManager.NUMBER_ALL_IN_CARE_MONEY == UserInfo.instance().getTotalCoin() && e.addAllInInboxFlow()
        //         })
        //     }
        // })) : this.addAllInInboxFlow()
    }
    
    addAllInInboxFlow = function() {
        var e = this
        //     , t = UserInfo.instance().getUserFriendInfo()
        //     , n = UserInfo.instance().getUserInboxCollectEnableCnt() > 9;
        // 1 == TSUtility.isValid(t) && 1 == TSUtility.isValid(t.sendGiftInfo) && (n = t.sendGiftInfo.receivedGiftCnt <SDefine.INBOX_RECEIVED_GIFT_CNTLIMIT && UserInfo.instance().getUserInboxCollectEnableCnt() > 9),
        // MessageRoutingManager.BOOL_ALL_IN = true,
        // 1 == n || UserInfo.instance().enableInboxReward_AllIn() ? G.default.Instance().requestAvgBetInfo(UserInfo.instance().getUid(), UserInfo.instance().getAccessToken(), function(t) {
        //     G.default.isServerResponseError(t) || (TSUtility.isValid(t.userAvgBetInfo) && (TSUtility.isValid(t.userAvgBetInfo.totalBet) && UserInfo.instance().setTwoH_TotalBet(t.userAvgBetInfo.totalBet),
        //     TSUtility.isValid(t.userAvgBetInfo.totalSpin) && UserInfo.instance().setTwoH_TotalSpin(t.userAvgBetInfo.totalSpin)),
        //     PopupManager.Instance().showDisplayProgress(true),
        //     Q.default.getPopup(function(t, n) {
        //         PopupManager.Instance().showDisplayProgress(false),
        //         null == t && (n.open($.RewardCenterViewType.INBOX_INBOX),
        //         n.setCloseCallback(e.addAllInFreebiesFlow.bind(e)))
        //     }))
        // }) : this.addAllInFreebiesFlow()
    }
    
    addAllInFreebiesFlow = function() {
        var e = this;
        // if (!UserInfo.instance().isFBShareDisableTarget() && UserInfo.instance().getTotalCoin() <= 1e6) {
        //     var t = UserInfo.instance().getPromotionInfo(Ie.SharePromotion.PromotionKeyName);
        //     null != t && null != t.getInfo() ? (PopupManager.Instance().showDisplayProgress(true),
        //     U.default.getPopup(function(t, n) {
        //         PopupManager.Instance().showDisplayProgress(false),
        //         t ? e._isEnableAllinRoot = true : (n.open(),
        //         n.setCloseCallback(function() {
        //             e._isEnableAllinRoot = true
        //         }))
        //     })) : this._isEnableAllinRoot = true
        // } else
        //     this._isEnableAllinRoot = true
    }
    
    checkSpinAll = function() {
        // var e = UserInfo.instance().getPromotionInfo(NewUserMissionPromotion.PromotionKeyName);
        // return !(TSUtility.isValid(e) && 1 == e.isNewTarget) || 0 != ClubVaultPopup.getAsBoolean(StorageKeyType.NEW_IN_GAME_TUTORIAL)
    }
   
    isFBShareDisableTarget = function() {
        return UserInfo.instance().isFBShareDisableTarget()
    }
    
    _getMaintainBetPerlines_withBettingIndex = function(e) {
        var t = SlotGameRuleManager.Instance.zoneBetPerLines;
        return e < 0 || e >= t.length ? (cc.error("_invalid betting index in _getMaintainBetPerlines_withBettingIndex: ", e),
        this._getMaintainBetPerlines_legacy()) : t[e]
    }
    
    _getMaintainBetPerlines_legacy = function() {
        var e = 0
            , t = UserInfo.instance().getLastSpinDate();
        if (43200 < Utility.getUnixTimestamp() - t)
            e = SlotManager.Instance.getPerBetAmount(80);
        else {
            var n = SlotGameRuleManager.Instance._maxBetLine
                , o = UserInfo.instance().getLastTotalBet() / n;
            e = o > SlotManager.Instance.getPerBetAmount(80) ? o >= SlotManager.Instance.getPerBetAmount(50) ? SlotManager.Instance.getPerBetAmount(50) : o : SlotManager.Instance.getPerBetAmount(80)
        }
        return e
    }
    
    getMaintainBetPerlines = function() {
        var e = 0;
        // if (-1 != MessageRoutingManager.NUMBER_ENTRY_SLOT_BETTING_INDEX ? (e = this._getMaintainBetPerlines_withBettingIndex(MessageRoutingManager.NUMBER_ENTRY_SLOT_BETTING_INDEX),
        // MessageRoutingManager.NUMBER_ENTRY_SLOT_BETTING_INDEX = -1) : e = this._getMaintainBetPerlines_legacy(),
        // LevelBettingLockConfig.Instance().isUseLevelBettingLock(SlotManager.Instance.getZoneId())) {
        //     var t = LevelBettingLockConfig.Instance().getZoneInfo(SlotManager.Instance.getZoneId()).getNextLevelBetLock_LevelInfo(MessageRoutingManager.instance().getUserLevel());
        //     return null != t ? e < t.betMoney ? e : t.betMoney : e
        // }
        return e
    }
    
    facebookShare = function(e, t) {
        // UserInfo.instance().facebookShare(e, t)
    }
    
    makeBaseFacebookShareInfo = function() {
        var e = new FBShareInfo;
        return e.subInfo.puid = UserInfo.instance().getUid(),
        e.subInfo.st = "",
        // e.subInfo.sl = "%s".format(UserInfo.instance().getLocation()),
        // e.subInfo.ssl = UserInfo.instance().getGameId(),
        // e.subInfo.zid = UserInfo.instance().getZoneId(),
        e.subInfo.img = "",
        e.subInfo.tl = "",
        e.desc = "",
        e
    }
    
    getSlotJackpotInfo = function(e) {
        var t = UserInfo.instance().getZoneId();
        return SlotJackpotManager.Instance().getSlotmachineInfo(t, e)
    }
    
    onProcessEndPopup = function(e) {
        // if ((SlotReelSpinStateManager.Instance.getFreespinMode() && e.currentShowingPopupType == ResultPopupType.FreespinResult || !SlotReelSpinStateManager.Instance.getFreespinMode() && e.currentShowingPopupType != ResultPopupType.LinkedJackpotResult) && ServicePopupManager.instance().reserveNewRecordPopup(e.currentShowingMoney),
        // !SlotReelSpinStateManager.Instance.getFreespinMode() && e.currentShowingPopupType == ResultPopupType.LinkedJackpotResult) {
        //     var t = SlotGameResultManager.Instance.getSubGameState("freeSpin");
        //     //(null != t && t.spinCnt == t.totalCnt || null == t) && ServicePopupManager.instance().reserveNewRecordPopup(e.currentShowingMoney)
        // }
    }
    
    onCheckFeverAbleSymbol = function() {
        var e = SlotManager.Instance.getWindowRange()
            , t = SlotManager.Instance.checkFeverIgnoreStateReelController(e);
        t = SlotManager.Instance.checkSpecialIgnoreStateSymbolId(t),
        t = SlotManager.Instance.checkFeverIgnoreStateETC(t),
        SlotManager.Instance._special_select_cell[SpecialType.FEVER] = SlotFeverModeManager.instance.getCellWithDrawLots(t)
    }
    
    onCheckCanAutoSpin = function() {
        return true
    }
    
    onCheckCanAutoSpin_EndGame = function() {
        return true
    }
    
    getUserId = function() {
        return UserInfo.instance().getUid()
    }
    
    getUserMoney = function() {
        return 0;//UserInfo.instance().getTotalCoin()
    }
    
    getZoneName = function() {
        return UserInfo.instance().getZoneName()
    }
   
    setBiggestWinCoin = function(e) {
        UserInfo.instance().setBiggestWinCoin(e)
    }
    
    isJoinTourney = function() {
        // return UserInfo.instance().isJoinTourney()
        return false;
    }
   
    onInitBottomUI_EX2 = function(e) {
        var t = this;
        // if (e.fastModeTooltipRoot && this.getInGameUI().setFastModePosition(e.fastModeTooltipRoot),
        // this.node.on("changeMoneyState", function() {
        //     t.checkLoungeNewSlot(e)
        // }),
        // UserInfo.instance().addListenerTarget(MSG.RELEASE_BETTINGLOCK, function() {
        //     t.addMaxBettingUnlockEffect(e.btnPlusBetPerLine.node)
        // }, this),
        // e.powerGemSlotBottomIconPos) {
        //     var n = LoadingSlotProcess.Instance().getPrefab("Service/01_Content/PowerGem/PowerGemSlotBottomIcon")
        //         , o = cc.instantiate(n);
        //     this._powerGemSlotBottomIcon = o.getComponent(PowerGemSlotBottomIcon),
        //     o.setParent(e.powerGemSlotBottomIconPos),
        //     o.setPosition(cc.Vec2.ZERO);
        //     var a = e.getPowerGemBottomIcon_SlotRoot()
        //         , i = e.getPowerGemBottomIcon_ToolTipRoot();
        //     this._powerGemSlotBottomIcon.setPowerGemSlotRootPos(a),
        //     this._powerGemSlotBottomIcon.setPowerGemToolTipRootPos(i)
        // }
        // if (e.nodeFeverIconPos) {
        //     n = LoadingSlotProcess.Instance().getPrefab("Service/01_Content/FeverMode/FeverModeIcon");
        //     var l = cc.instantiate(n);
        //     this._feverModeIcon = l.getComponent(IngameSuiteLeagueFeverToolTipUI.default),
        //     l.setParent(e.nodeFeverIconPos),
        //     l.setPosition(cc.Vec2.ZERO);
        //     var r = e.getFeverModeIcon_ButtonRoot();
        //     i = e.getFeverModeIcon_ToolTipRoot(),
        //     this._feverModeIcon.setFeverModeButtonRootPos(r),
        //     this._feverModeIcon.setFeverModeToolTipRootPos(i)
        // }
        // if (e.hyperBountySlotBottomIconPos) {
        //     var s = null;
        //     cc.loader.loadRes("Service/01_Content/HyperBounty/IngameHyperBounty/HyperBounty_" + e.node.name, function(n, o) {
        //         n || (s = cc.instantiate(o),
        //         t._hyperBountyIngameIcon = s.getComponent(HyperBountyInGameUI),
        //         s.setParent(e.hyperBountySlotBottomIconPos),
        //         s.setPosition(cc.Vec2.ZERO),
        //         e.hyperBountySlotBottomIconPos.getChildByName("HB-80_Frame_Off").active = false)
        //     })
        // }
    }
    
    getPowerGemSlotBottomIcon = function() {
        return this._powerGemSlotBottomIcon
    }
    
    onDestroyBottomUI_EX2 = function() {
        // UserInfo.instance().removeListenerTargetAll(this)
    }
    
    addMaxBettingUnlockEffect = function(e, t) {
        var n = this;
        void 0 === t && (t = null);
        // var o = SlotGameRuleManager.Instance.getNextIncreaseBetMoney();
        // if (LevelBettingLockConfig.Instance().isReleaseBettingLock(MessageRoutingManager.instance().getUserLevel(), o, SlotManager.Instance.getZoneId())) {
        //     var a = new OpenPopupInfo;
        //     a.type = "BettingLockRelease",
        //     a.openCallback = function() {
        //         var t = "Popup/Prefab/Slot/Unlock_bet_btn_Effect";
        //         cc.loader.loadRes(t, function(o, a) {
        //             if (o) {
        //                 var i = new Error("cc.loader.loadRes fail %s: %s".format(t, JSON.stringify(o)));
        //                 FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, i))
        //             } else {
        //                 var l = cc.instantiate(a);
        //                 e.addChild(l),
        //                 0 == e.anchorX ? l.setPosition(e.getContentSize().width / 2, -e.getContentSize().height / 2) : l.setPosition(0, 0),
        //                 n.scheduleOnce(function() {
        //                     l.removeFromParent(),
        //                     l.destroy(),
        //                     PopupManager.Instance().checkNextOpenPopup()
        //                 }, 3)
        //             }
        //         })
        //     }
        //     ,
        //     PopupManager.Instance().addOpenPopup(a)
        // }
    }
    
    checkLoungeNewSlot = function(e) {
        // if (0 != SlotManager.Instance.IsLoungeNewSlot()) {
        //     var t = SlotGameRuleManager.Instance.getCurrentBetMoney();
        //     0 == this._activeNewSlotTooltipInit && (this._activeNewSlotTooltip = t < 27e5,
        //     this._activeNewSlotTooltipInit = true),
        //     0 != SlotManager.Instance._initFinish &&SlotReelSpinStateManager.Instance.getCurrentState() == SlotReelSpinStateManager.defaulState_STOP && (t >= 27e5 && (this._activeNewSlotTooltip = false,
        //     null != this._tooltip && this._tooltip.close()),
        //     t < 27e5 && 0 == this._activeNewSlotTooltip && (this.asyncTooltipNewSlot(e),
        //     this._activeNewSlotTooltip = true))
        // }
    }
    
    asyncTooltipNewSlot = function(e) {
        // return l(this, void 0, void 0, function() {
        //     var t, n, o, a, i, l, s, c = this;
        //     return r(this, function(r) {
        //         switch (r.label) {
        //         case 0:
        //             return t = e.nodeNewSlotTooltip,
        //             n = HeroTooltipPopup.asyncGetPopup(),
        //             o = this,
        //             [4, n];
        //         case 1:
        //             return o._tooltip = r.sent(),
        //             !TSUtility.isValid(this) || !TSUtility.isValid(this._tooltip) || !TSUtility.isValid(t) ? [2] : (a = null != t && null != e.nodeTotalBetUI && t.name == e.nodeTotalBetUI.name,
        //             i = {
        //                 settingInfo: {
        //                     useBlockBG: false,
        //                     useBlockFrame: true,
        //                     reserveCloseTime: 1.5
        //                 },
        //                 frameInfo: {
        //                     frameType: 0,
        //                     paddingWidth: 80,
        //                     paddingHeight: 60,
        //                     textOffsetX: 0,
        //                     textOffsetY: 0,
        //                     useArrow: false,
        //                     baseFontSize: 26,
        //                     fontLineHeight: 28
        //                 },
        //                 startAniInfo: [{
        //                     action: "move",
        //                     duration: .3,
        //                     easingType: "easeOut",
        //                     startOffsetX: -20,
        //                     startOffsetY: 0
        //                 }, {
        //                     action: "fadeIn",
        //                     duration: .4
        //                 }]
        //             },
        //             this._tooltip.open(),
        //             this._tooltip.setPivotPosition(t, a ? 0 : -30, a ? 100 : 30),
        //             this._tooltip.setInfoText("<color=#FFFFFF>THIS BET DOES NOT QUALIFY\nFOR THE SUITE LEAGUE</color>"),
        //             l = HT_MakingInfo.parseObj(i),
        //             this._tooltip.setHero_HT_MakingInfo(l),
        //             this._tooltip.refreshUI(false, a),
        //             this._tooltip.setCloseCallback(function() {
        //                 c._tooltip = null,
        //                 SlotManager.Instance.removeEventListener(cc.Node.EventType.TOUCH_START, s.bind(c)),
        //                 SlotManager.Instance.removeSlotTooltip(SlotManager.Instance.TOOLTIP_SUITE_LEAGUE)
        //             }),
        //             s = function() {
        //                 TSUtility.isValid(c._tooltip) && c._tooltip.close()
        //             }
        //             ,
        //             SlotManager.Instance.addEventListener(cc.Node.EventType.TOUCH_START, s.bind(this)),
        //             SlotManager.Instance.addSlotTooltip(SlotManager.Instance.TOOLTIP_SUITE_LEAGUE, s.bind(this)),
        //             SlotManager.Instance.checkSlotTooltip(SlotManager.Instance.TOOLTIP_SUITE_LEAGUE),
        //             [2])
        //         }
        //     })
        // })
    }
    
    onSetButtonActiveState_EX2 = function() {
        var e = UserInfo.instance().getPromotionInfo(NewServiceIntroduceCoinPromotion.PromotionKeyName);
        null != e && null != e && this.getInGameUI().setIntroduceCoin()
    }
    
    onSetChangeMaxBetBtnInteractable_EX2 = function() {
        var e = UserInfo.instance().getPromotionInfo(NewServiceIntroduceCoinPromotion.PromotionKeyName);
        null != e && null != e && this.getInGameUI().setIntroduceCoin()
    }
    
    onClickFastModeBtn = function(e) {
        this.getInGameUI().showFastModeTooltip(e.fastMode)
    }
    
    onClickPaytableBtn = function() {
        // var e = this;
        // "PAYTABLE_INGAME" != MessageRoutingManager.STRING_CURRENT_INTRODUCE_NAME && 1 != this.getInGameUI()._isOpenPaytablePopup && (1 != MessageRoutingManager.instance().isEnableInGameServiceIntroducePayTable() ? (this.getInGameUI()._isOpenPaytablePopup = true,
        // TSUtility.isTestDirectSlotMode() ? LevelBettingLockConfig.getPopup(function(t, n) {
        //     n.open(SlotGameRuleManager.Instance.getCurrentBetPerLine()),
        //     w.default.playFxOnce("btn_etc"),
        //     n.setCloseCallback(function() {
        //         e.getInGameUI()._isOpenPaytablePopup = false
        //     })
        // }) : SlotGameRuleManager.getPopup(function(t, n) {
        //     n.open(SlotGameRuleManager.Instance.getCurrentBetPerLine()),
        //     w.default.playFxOnce("btn_etc"),
        //     n.setCloseCallback(function() {
        //         e.getInGameUI()._isOpenPaytablePopup = false
        //     })
        // })) : this.getInGameUI().payTable_IntoduceCoin.getComponent(ge.default).onCollect())
    }
    
    onClickAutoSpinSelect = function() {}
    
    onClickIncreaseTotalBet_BottomEX2 = function(e) {
        // var t = SlotManager.Instance.getZoneId();
        // if (1 == SlotGameRuleManager.Instance.isCurrentBetPerLineMaxValue()) {
        //     if (1 == SlotManager.Instance.isJoinTourney())
        //         return cc.log("slot tourney enter"),
        //         false;
        //     var n = SlotManager.Instance.getZoneId()
        //         , o = SlotGameRuleManager.Instance.getNextIncreaseBetMoney();
        //     return le.default.openBetGuidePopup(le.BetGuideState.MAXBET_GO, n, e.btnPlusBetPerLine.node, o),
        //     false
        // }
        // return 1 !=SDefine.LevelBettingLock_Flag || 0 != this.checkLevelBettingLock(t) || (o = SlotGameRuleManager.Instance.getNextIncreaseBetMoney(),
        // UserInfo.instance().isPassAbleCasino(SDefine.VIP_LOUNGE_ZONEID,SDefine.VIP_LOUNGE_ZONENAME) && UserInfo.instance().getTotalCoin() >= 15e6 && MessageRoutingManager.instance().getUserLevel() > 9 ? le.default.openBetGuidePopup(le.BetGuideState.LEVELLOCK_MOVE, SlotManager.Instance.getZoneId(), e.btnPlusBetPerLine.node, o) : le.default.openBetGuidePopup(le.BetGuideState.LEVELLOCK, SlotManager.Instance.getZoneId(), e.btnPlusBetPerLine.node, o),
        // false)
    }
    
    onAfterClickIncreaseTotalBet_BottomEX2 = function(e) {
        1 == e.flagLockChangeTotalBet ? e.betPerLineOnSetFlagLock == SlotGameRuleManager.Instance.getCurrentBetPerLine() ? this.hideLockChangeTotalBetPopup() : null == this.popupLockTotalBet && this.asyncLockTotalBetTooltip(e) : 1 == e.flagLockChangeToTalBetBigger && (e.betPerLineOnSetFlagLock >= SlotGameRuleManager.Instance.getCurrentBetPerLine() ? this.hideLockChangeTotalBetPopup() : null == this.popupLockTotalBet && this.asyncLockTotalBetTooltip(e))
    }
    
    onClickDecreaseTotalBet_BottomEX2 = function(e) {
        // if (null != SlotGameRuleManager.Instance && SlotGameRuleManager.Instance.isCurrentBetPerLineMinValue()) {
        //     var t = SlotManager.Instance.getZoneId()
        //         , n = SlotManager.Instance.getZoneName();
        //     if (t > 0)
        //         return re.default.openBetLowerkPopup(t, n, e.btnPlusBetPerLine.node),
        //         false
        // }
        return true
    }
    
    onAfterClickDecreaseTotalBet_BottomEX2 = function(e) {
        1 == e.flagLockChangeTotalBet ? e.betPerLineOnSetFlagLock == SlotGameRuleManager.Instance.getCurrentBetPerLine() ? this.hideLockChangeTotalBetPopup() : null == this.popupLockTotalBet && this.asyncLockTotalBetTooltip(e) : 1 == e.flagLockChangeToTalBetBigger && (e.betPerLineOnSetFlagLock >= SlotGameRuleManager.Instance.getCurrentBetPerLine() ? this.hideLockChangeTotalBetPopup() : null == this.popupLockTotalBet && this.asyncLockTotalBetTooltip(e))
    }
    
    onAfterClickSelectTotalBet_BottomEX2 = function() {}
    
    hideLockChangeTotalBetPopup = function() {
        null != this.popupLockTotalBet && (this.popupLockTotalBet.close(),
        this.popupLockTotalBet = null)
    }
    
    asyncLockTotalBetTooltip = function(e) {
        // return l(this, void 0, void 0, function() {
        //     var t, n, o;
        //     return r(this, function(a) {
        //         switch (a.label) {
        //         case 0:
        //             return [4, HeroTooltipPopup.asyncGetPopup()];
        //         case 1:
        //             return (t = a.sent()).open(e.btnSpin.node),
        //             t.setInfoText(e.stringLockChangeTotalBet),
        //             t.setPivotPosition(e.btnSpin.node, e.addXLockTotalBetTooltip, e.addYLockTotalBetTooltip),
        //             n = {
        //                 frameInfo: {
        //                     paddingWidth: 80,
        //                     paddingHeight: 30,
        //                     textOffsetX: 0,
        //                     textOffsetY: 0,
        //                     useArrow: true,
        //                     arrowPosType: 0,
        //                     arrowPosAnchor: .5,
        //                     arrowPosOffset: 100,
        //                     baseFontSize: 20,
        //                     fontLineHeight: 32,
        //                     frameType: 1
        //                 },
        //                 heroInfo: {
        //                     anchorX: 0,
        //                     anchorY: .5,
        //                     offsetX: 0,
        //                     offsetY: 0,
        //                     heroId: "",
        //                     heroRank: 0,
        //                     iconType: "Small",
        //                     heroState: 0
        //                 },
        //                 settingInfo: {
        //                     useBlockBG: false,
        //                     reserveCloseTime: 0
        //                 },
        //                 startAniInfo: []
        //             },
        //             o = HT_MakingInfo.parseObj(n),
        //             t.setHero_HT_MakingInfo(o),
        //             t.refreshUI(),
        //             this.popupLockTotalBet = t,
        //             [2]
        //         }
        //     })
        // })
    }
    
    onClickMaxBet = function(e) {
        1 == e.flagLockChangeTotalBet ? e.betPerLineOnSetFlagLock == SlotGameRuleManager.Instance.getCurrentBetPerLine() ? this.hideLockChangeTotalBetPopup() : null == this.popupLockTotalBet && this.asyncLockTotalBetTooltip(e) : 1 == e.flagLockChangeToTalBetBigger && (e.betPerLineOnSetFlagLock >= SlotGameRuleManager.Instance.getCurrentBetPerLine() ? this.hideLockChangeTotalBetPopup() : null == this.popupLockTotalBet && this.asyncLockTotalBetTooltip(e))
    }
    
    onChangeToAutospin = function() {
        this.hideLockChangeTotalBetPopup()
    }
    
    checkLevelBettingLock = function(e) {
        // if (LevelBettingLockConfig.Instance().isUseLevelBettingLock(e)) {
        //     var t = LevelBettingLockConfig.Instance().getZoneInfo(e).getNextLevelBetLock_LevelInfo(MessageRoutingManager.instance().getUserLevel());
        //     if (null != t) {
        //         var n = SlotGameRuleManager.Instance.getNextIncreaseBetMoney();
        //         if (t.betMoney <= n)
        //             return false
        //     }
        // }
        return true
    }
    
    onInitUI_BottomUIText = function(e) {
        // UserInfo.instance().addListenerTarget(MSG.UPDATE_ASSET, function() {
        //     e.setMyMoney()
        // }, e)
    }
    
    onDestroy_BottomUIText = function(e) {
        // UserInfo.instance() && UserInfo.instance().removeListenerTargetAll(e)
    }
    
    isOpenFeverMode = function() {
        return SlotFeverModeManager.instance.isOpenFeverMode()
    }
    
    getFeverModePointData = function(e) {
        return SlotFeverModeManager.instance.getFeverModePointData(e)
    }
    
    reserveNewRecordPopup = function(e) {
        // return fe.default.instance().reserveNewRecordPopup(e)
    }
    
    openInGamePopup = function(e, t, n) {
        // var o = this;
        // switch (void 0 === t && (t = null),
        // void 0 === n && (n = null),
        // e) {
        // case "SuperSizeItInGame":
        //     PopupManager.Instance().showDisplayProgress(true),
        //     Ne.default.getPopup(function(e, a) {
        //         PopupManager.Instance().showDisplayProgress(false),
        //         1 != TSUtility.isValid(e) && (null != t && a.setOpenComplete(t.bind(o)),
        //         null != n && a.setCloseCallback(n.bind(o)),
        //         a.open())
        //     });
        //     break;
        // case "SuperSizeItLobby":
        //     PopupManager.Instance().showDisplayProgress(true),
        //     Le.default.getPopup(function(e, a) {
        //         PopupManager.Instance().showDisplayProgress(false),
        //         1 != TSUtility.isValid(e) && (null != t && a.setOpenComplete(t.bind(o)),
        //         null != n && a.setCloseCallback(n.bind(o)),
        //         a.open())
        //     })
        // }
    }
    
    isAvailablePromotion = function(e) {
        switch (e) {
        case "SuperSizeItInGame":
            return SupersizeItManager.instance.isAvailablePromotion() && SupersizeItManager.instance.isEnableEvent() && SupersizeItManager.instance.isPlayTargetSlot()
        }
        return false
    }
    
    isBetAmountEnoughToAvailablePromotion = function(e, t) {
        switch (e) {
        case "SuperSizeItInGame":
            return SupersizeItManager.instance.isBetAmountEnoughToAvailablePromotion(t)
        }
    }
    
    showClubVaultUpgradePopup = function() {
        var e = new OpenPopupInfo;
        // e.type = "clubVaultUpgrade",
        // e.openCallback = function() {
        //     PopupManager.Instance().showDisplayProgress(true),
        //     ClubVaultPopup.getPopup(function(e, t) {
        //         PopupManager.Instance().showDisplayProgress(false),
        //         !TSUtility.isValid(e) ? (t.setCloseCallback(function() {
        //             PopupManager.Instance().checkNextOpenPopup()
        //         }),
        //         t.open(1)) : PopupManager.Instance().checkNextOpenPopup()
        //     })
        // }
        // ,
        PopupManager.Instance().addOpenPopup(e)
    }
    
    emitMessage = function(e, t) {
        MessageRoutingManager.instance().emitMessage(e, t)
    }
    
    getMSG = function() {
        return MessageRoutingManager.instance().getMSG()
    }
    
    sendChangeBalanceID = function(e, t) {
        // HyperBountyManager.Instance().requestMultiBalance(SlotGameRuleManager.Instance.slotID, e, function(e, n) {
        //     var o = SlotManager.Instance.bottomUI.getSpinBtn()
        //         , a = o.node.getChildByName("BalanceID");
        //     if (TSUtility.isValid(a) && (a.setParent(null),
        //     a.destroy()),
        //     0 == n) {
        //         var i = (a = new cc.Node("BalanceID")).addComponent(cc.Label)
        //             , l = a.addComponent(cc.LabelOutline);
        //         l.color = cc.Color.BLACK,
        //         l.width = 1,
        //         i.string = e.balanceId,
        //         a.setParent(o.node),
        //         a.setPosition(0, 80)
        //     }
        //     SlotGameResultManager.setMultiBalanceName(SlotGameRuleManager.Instance.slotID, e.balanceId),
        //     TSUtility.isValid(t) && t(e, n)
        // })
    }
}