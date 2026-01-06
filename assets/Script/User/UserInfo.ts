
import ChangeResult, { RewardResult, HeroBonusGaugeHist } from "./../Network/ChangeResult";
import CommonServer, { PurchasePayload_SmallInfo, UnProcessedPopupInfo } from "../Network/CommonServer";
import UserInven from "./UserInven";
import UserPromotion from "./UserPromotion";
import LevelManager from "../manager/LevelManager";
// import VipManager from "../VIP/VipManager";
// import VipStatusUpPopup from "../Popup/Vip/VipStatusUpPopup";
import SlotJackpotManager from "../manager/SlotJackpotManager";
import TSUtility from "../global_utility/TSUtility";
import SDefine from "../global_utility/SDefine";
import PopupManager from "../manager/PopupManager";
// import LoadingPopup from "../Popup/LoadingPopup/LoadingPopup";
import * as SlotDataDefine from "../slot_common/SlotDataDefine";
// import FacebookUtil from "../Network/FacebookUtil";
import CasinoZoneManager from "../manager/CasinoZoneManager";
import CommonPopup from "../Popup/CommonPopup";
import Analytics from "../Network/Analytics";
import {ProductConfig} from "../Config/ProductConfig";
import IAPManager, { PlayStoreBuyProductReq } from "../NativeUtil/Purchase/IAPManager";
import LocalStorageManager from "../manager/LocalStorageManager";
import ServiceInfoManager from "../ServiceInfoManager";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import ADTargetManager from "../ServiceInfo/ADTargetManager";
import UserMission from "./UserMission";
import MessageRoutingManager from "../message/MessageRoutingManager";
// import MinigameManager from "../ServiceInfo/MinigameManager";
import AsyncHelper from "../global_utility/AsyncHelper";
// import AppleLoginHelper from "../NativeUtil/AppleLoginHelper";
// import MobileDeviceHelper from "../NativeUtil/MobileDeviceHelper";
// import UserMergePopup from "../Popup/UserMerge/UserMergePopup";
// import UserBlastOffInfo from "./UserBlastOffInfo";
import UserHeroInfo from "./UserHeroInfo";
import HeroManager from "../manager/HeroManager";
// import StarAlbumManager from "../Utility/StarAlbumManager";
// import HeroTooltipTest from "../Test/HeroTooltipTest";
import SlotTourneyManager from "../manager/SlotTourneyManager";
// import PiggyBankPromotionManager from "../Popup/PiggyBank/PiggyBankPromotionManager";
// import FBSquadManager from "../Utility/FBSquadManager";
import AdsManager from "../Utility/AdsManager";
// import UserReelQuestInfo from "./UserReelQuestInfo";
import MembersClassBoostUpManager from "../ServiceInfo/MembersClassBoostUpManager";
import IAPManager_AOS from "../NativeUtil/Purchase/IAPManager_AOS";
import IAPManager_iOS from "../NativeUtil/Purchase/IAPManager_iOS";
import MembersClassBoostUpNormalManager from "../ServiceInfo/MembersClassBoostUpNormalManager";
// import UnProgressedPurchasePopup from "../Popup/UnProgressedPurchasePopup/UnProgressedPurchasePopup";
// import DailyStampManager from "../DailyStamp/2024/DailyStampManager";
// import UserInboxInfo from "./UserInboxInfo";
import ShopPromotionManager from "../message/ShopPromotionManager";
import UnprocessedPurchaseManager from "./UnprocessedPurchaseManager";
import HRVServiceUtil from "../HRVService/HRVServiceUtil";
// import InGameUI_LevelUp from "../SlotGame/InGameUI/InGameUI_LevelUp";
import NotifyManager from "../Notify/NotifyManager";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import SupersizeItManager from "../SupersizeItManager";
// import HyperBountyManager from "../Popup/HyperBounty/HyperBountyManager";
// import * as ClubServerInfo from "../Popup/Club/ClubServerInfo";
import ServiceSlotDataManager from "../manager/ServiceSlotDataManager";
import NativeUtil from "../global_utility/NativeUtil";
import { Utility } from "../global_utility/Utility";

const { ccclass: ccClass } = cc._decorator;

// ===================== 所有数据模型接口定义 =====================
export interface GameLocation {
    tourneyTier: number;
    loc?: string;
    subLoc?: string;
    zoneID?: number;
}

export interface LevelInfo {
    level: number;
    exp: number;
}

export interface StatusInfo {
    status: number;
    date: number;
}

export interface VipInfo {
    level: number;
    exp: number;
    issueDate: number;
    getCurrentGradeName(level: number): string;
}

export interface UserSuiteLeagueInfo {
    leagueCoin: number;
    leagueShopNextResetDate: number;
    leagueProductInfo: { [key: string]: { purchaseCnt: number } } | null;
    setLeagueProductInfo(info: any): void;
    getPurchaseCount(id: string): number;
    resetLeagueShopInfo(info: { productID: string, curPurchaseCnt: number }): void;
}

export interface UserServiceInfo {
    bingoBallCnt: number;
    totalPurchaseCnt: number;
    totalPurchaseCash: number;
    prevPurchaseCash: number;
    maxPurchaseCash: number;
    lastPurchaseDate: number;
    promotionCoolTime: number;
    spinBooster: number;
    SpinBoosterGroup: string;
    dailyAccBetCoinTimeBonus: number;
    cpeMedia: string;
}

export interface StreakedJoinInfo {
    all_Count: number;
    all_ModifiedDate: number;
    bookmark_Count: number;
    bookmark_ModifiedDate: number;
}

export interface UserPurchaseInfo {
    avgIn30Days: number;
    avgIn30Days2: number;
    cntIn30Days: number;
    avgOverUsd3In30Days: number;
    avgOverUsd3In30Days2: number;
    medOverUsdIn30Days: number;
    lastBuySalePriceIn10Days: number;
    lastBuyMinigame: number;
    todayInboxOfferBuyingCnt: number;
    maxOverUsd3In30Days: number;
    epicWinOfferInfo: any[];
    lastPurchaseDateOverUsd3: number;
    lastPurchaseDateWithoutEx: number;
    maxInLastPurchaseDateWithoutEx: number;
    recordBreakerInfo: any[];
    limitedTimeOfferInfo: any[];
    mainShopInfo: any[];
    minigameInfo: any[];
    initUserPurchaseInfo(data: any): boolean;
    getAvgABGroup(val?: number): number;
}

export interface UserAssetInfo {
    uid: number;
    totalCoin: number;
    biggestTotalCoin: number;
    paidCoin: number;
    initUserAssetInfo(data: any): boolean;
}

export interface UserMasterInfo {
    uid: number;
    fbid: string;
    fbasID: string;
    fbinstantID: string;
    name: string;
    picUrl: string;
    levelInfo: LevelInfo;
    vipInfo: VipInfo;
    suiteInfo: UserSuiteLeagueInfo;
    serviceInfo: UserServiceInfo | null;
    email: string;
    createdDate: number;
    lastLoginDate: number;
    appleID: string;
    lineID: string;
    streakedJoinInfo: StreakedJoinInfo;
    lastLoginGap: number;
    statusInfo: StatusInfo;
    sessionCount: number;
    initUserMasterInfo(data: any): boolean;
    getUserFBPlatformID(): string;
}

export interface UserGameInfo {
    createData: number;
    lastSpinData: number;
    lastTotalBet: number;
    lastAllinBet: number;
    lastAllInDate: number;
    minDateLast30spins: number;
    lastPlayZoneID: number;
    lastPlaySlotID: number;
    modifieData: number;
    totalBet: number;
    totalSpin: number;
    twoh_totalBet: number;
    twoh_totalSpin: number;
    avg_3000_bet: number;
    prevBiggestWinCoin: number;
    biggestWinCoin: number;
    isShowRecordRenewal: boolean;
    eighty_SpinCont: number;
    goldTicketGauge: number;
    modeBetDepth: number;
    modeBetDepthLast500Spins: number;
    diamondTicketGauge: number;
    goldWheelGauge: number;
    silverWheelGauge: number;
    diamondWheelGauge: number;
    favoriteList: any[];
    recentPlaySlots: any[];
    initUserGameInfo(data: any): boolean;
    setLastTotalbet(val: number): void;
    setBiggestWinCoin(val: number): void;
    getRecordRenewalFlag(): boolean;
    resetRecordRenewalFlag(): void;
}

export interface UserExMasterInfo {
    uid: number;
    fbPicURL: string;
    createdDate: number;
    modifiedDate: number;
    initUserExMasterInfo(data: any): boolean;
}

export interface IncompleteSetInfo {
    id: string | number;
    collectedCardsCnt: number;
    parseObj(data: any): void;
}

export interface UserStarAlbumSimpleInfo {
    group: string;
    collectedCardsCnt: number;
    incompleteSets: IncompleteSetInfo[];
    parse(data: any): void;
}

export interface UserSuiteInfo {
    isAcceptablePass: boolean;
    parse(data: any): void;
}

export interface SendGiftInfo {
    activeSendInfo: any[];
    nonActiveSendInfo: any[];
    receivedGiftCnt: number;
    recieveBingoBallCnt: number;
    nextResetDate: number;
    parse(data: any): SendGiftInfo;
    checkReset(): void;
}

export interface UserFriendInfo {
    activeFriends: SlotDataDefine.UserSimpleInfo[];
    nonActiveFriends: SlotDataDefine.UserSimpleInfo[];
    sendGiftInfo: SendGiftInfo | null;
    parse(data: any): UserFriendInfo;
    getSortActiveFriends(): SlotDataDefine.UserSimpleInfo[];
    getSortNonActiveFriends(): SlotDataDefine.UserSimpleInfo[];
    isSendGiftAble(uid: number): boolean;
    addActiveSendInfo(uid: number): void;
    addNonActiveSendInfo(uid: number): void;
    initSentGiftUserInfo(): void;
    getTodaySentCnt(): number;
    getActiveFriendCnt(): number;
    getNonActiveFriendCnt(): number;
}

export interface WheelGaugeInfo {
    curGauge: number;
    maxGauge: number;
    setGauge(cur: number, max: number): void;
}

export interface TripleDiamondWheelInfo {
    goldGaugeInfo: WheelGaugeInfo | null;
    diamondGaugeInfo: WheelGaugeInfo | null;
    initInfo(gold: number, diamond: number): void;
    setMaxInfo(goldMax: number, diamondMax: number): void;
    setGaugeInfo(type: number, cur: number, max: number): void;
}

export interface ThrillJackpotWheelInfo {
    goldWheelGaugeInfo: WheelGaugeInfo | null;
    silverWheelGaugeInfo: WheelGaugeInfo | null;
    diamondWheelGaugeInfo: WheelGaugeInfo | null;
    initInfo(silver: number, gold: number, diamond: number): void;
    setMaxInfo(silverMax: number, goldMax: number, diamondMax: number): void;
    setGaugeInfo(type: number, cur: number, max: number): void;
}

export interface UserInfoData {
    uid: number;
    userMasterInfo: UserMasterInfo | null;
    userExMasterInfo: UserExMasterInfo | null;
    userAssetInfo: UserAssetInfo | null;
    userInven: UserInven | null;
    // userReelQuest: UserReelQuestInfo | null;
    userPromotion: UserPromotion | null;
    userGameInfo: UserGameInfo | null;
    userInboxCnt: number;
    userInboxMainShopCnt: number;
    userLastModeBetDepth: number;
    collectEnableCnt: number;
    userPurchaseInfo: UserPurchaseInfo | null;
    userMission: UserMission | null;
    tripleDiamondWheelInfo: TripleDiamondWheelInfo | null;
    thrillJackpotWheelInfo: ThrillJackpotWheelInfo | null;
    // userBlastOffInfo: UserBlastOffInfo | null;
    userStarAlbumSimpleInfo: UserStarAlbumSimpleInfo | null;
    userSuiteInfo: UserSuiteInfo | null;
    userWelcomeBackInfo: any | null;
    init(data: any): boolean;
}

export interface ExceptionAuthInfo {
    entrancePath: string;
    clientIP: string;
    httpUserAgent: string;
    serviceType: string;
    market: string;
    deviceOS: string;
    isMobile: boolean;
    devicePlatform: string;
    jsEngine: string;
    countryISOCode: string;
    subdivisionsName: string;
    cityName: string;
    browser: string;
    deviceLang: string;
    deviceName: string;
}

// ===================== 常量枚举定义 =====================
const enum MSG {
    UPDATE_ASSET = "UPDATE_ASSET",
    UPDATE_VIP_POINT = "UPDATE_VIPPOINT",
    UPDATE_SHOP_VIP = "UPDATE_SHOP_VIP",
    UPDATE_LEVEL = "UPDATE_LEVEL",
    UPDATE_LEVEL_UP = "UPDATE_LEVEL_UP",
    UPDATE_INVENTORY = "UPDATE_INVENTORY",
    UPDATE_INBOXINFO = "UPDATE_INBOXINFO",
    UPDATE_PROMOTION = "UPDATE_PROMOTION",
    UPDATE_BINGOBALL = "UPDATE_BINGOBALL",
    UPDATE_JACKPOTINFO = "UPDATE_JACKPOTINFO",
    UPDATE_PURCHASE_INFO = "UPDATE_PURCHASEINFO",
    RELEASE_BETTINGLOCK = "RELEASE_BETTINGLOCK",
    OPEN_VIPBOOSTPOPUP = "OPEN_VIPBOOSTPOPUP",
    UPDATE_PICTURE = "UPDATE_PICTURE",
    UPDATE_WT_PIECEINFO = "UPDATE_WT_PIECEINFO",
    UPDATE_TRIPLEWHEELGAUGE = "UPDATE_TRIPLEWHEELGAUGE",
    UPDATE_THRILLWHEELGAUGE = "UPDATE_THRILLWHEELGAUGE",
    ADD_NEW_HERO = "ADD_NEW_HERO",
    CHANGE_ACTIVE_HERO = "CHANGE_ACTIVE_HERO",
    UPDATE_HERO_NEW = "UPDATE_HERO_NEW",
    UPDATE_HERO_RANKUP = "UPDATE_HERO_RANKUP",
    UPDATE_HERO_EXPUP = "UPDATE_HERO_EXPUP",
    UPDATE_HERO_BONUS_GRADEUP = "UPDATE_HERO_BONUS_GRADEUP",
    UPDATE_HERO_BONUS_EXPUP = "UPDATE_HERO_BONUS_EXPUP",
    CHANGE_STARALBUM_SEASON = "CHANGE_STARALBUM_SEASON",
    UPDATE_HERO_POWER_LEVELUP = "UPDATE_HERO_POWER_LEVELUP",
    UPDATE_COUPONINFO = "UPDATE_COUPONINFO",
    UPDATE_PURCHASE_COUNT = "UPDATE_PURCHASE_COUNT",
    UPDATE_REELQUEST_PROGRESS = " UPDATE_REELQUEST_PROGRESS",
    REFRESH_REELQUEST_USERINFO = " REFRESH_REELQUEST_USERINFO"
}

// ===================== 核心单例类 =====================
@ccClass
export default class UserInfo extends cc.Component {
    // 静态单例
    private static _instance: UserInfo | null = null;
    public static isAuth: boolean = true;

    // 私有属性
    public _userInfo: UserInfoData | null = null;
    private _userFriendInfo: UserFriendInfo = {} as UserFriendInfo;
    private _userHeroInfo: UserHeroInfo | null = null;
    // private _userInboxInfo: UserInboxInfo | null = null;
    private _accessToken: string = "";
    private _zoneId: number = 0;
    public _zoneName: string = SDefine.HIGHROLLER_ZONENAME;
    private _eventEmitter: cc.EventTarget = null;
    private _isFromSlot: boolean = false;
    private _currentSceneMode: string = "";
    private _isOpenAfterPurchase: boolean = false;
    private _rewardResult: RewardResult | null = null;
    private _firstPurchaseState: number = 0;
    private _firstPurchasePopInfo: any | null = null;
    private _location: string = "";
    private _gameId: string = "";
    private _tourneyTier: number = -1;
    private _tourneyID: number = 0;
    private _prevLocation: string = "";
    private _prevGameId: string = "";
    private _prevZoneId: number = 0;
    private _prevTourneyTier: number = -1;
    private _isOpenBoostPopup: boolean = false;
    private _isOpenStartEventPopup: boolean = false;
    private _IsOpenSalePoromtionShopPopup: boolean = false;
    private _isResetDailyMission: boolean = false;
    private _isResetMission: boolean = false;
    public slotZoneInfo: any[] = [];
    private _couponID: string = "";
    private _exceptionAuthInfo: ExceptionAuthInfo | null = null;
    private _couponInfoList: any[] = [];
    private _appsFlyerConversionData: { [key: string]: string } = {};
    private _lastStarAlbumCheckSeasonId: number = 0;
    // public infoClub: ClubServerInfo.ClubInfo | null = null;
    private _lastNotiIndex: number = 0;
    private _lastPingLatency: number = -1;
    private _isRequestRefresh: boolean = false;
    private _refreshMissionCallbacks: Function[] = [];
    private _lastRefreshFriendInfoTime: number = 0;
    public refreshJackpotCheckTime: number = 0;
    private _onAppsflyerConversionDataCallback: Function | null = null;

    public static instance(): UserInfo | null {
        return UserInfo._instance;
    }

    public static setInstance(userData: any, token: string, exceptionAuth: any): boolean {
        if (UserInfo.instance() !== null) return false;

        const userInfoData = userData;
        // if (!userInfoData.init(userData)) {
        //     console.error("MyUserInfo setInstance fail.");
        //     return false;
        // }

        ServiceInfoManager.NUMBER_TEMP_UID = userInfoData.uid;
        // ServiceInfoManager.NUMBER_ACCOUNT_STATUS = userInfoData.userMasterInfo!.statusInfo.status;
        // ServiceInfoManager.NUMBER_ACCOUNT_DELETE_DATE = userInfoData.userMasterInfo!.statusInfo.date + 2592000;

        const node = new cc.Node();
        const userInfo = node.addComponent(UserInfo);
        userInfo._userInfo = userInfoData;
        userInfo._accessToken = token;

        if (!userData.serverTime) {
            console.error("not find serverTime");
            return false;
        }

        TSUtility.setLoginTime(userData.serverTime);
        UserInfo._instance = userInfo;
        cc.director.getScene().addChild(node);
        // userInfo.setCurrentSceneMode(SDefine.Launcher);
        // userInfo.setExceptionAuthInfo(exceptionAuth);
        // ServiceInfoManager.instance.setUserLevel(userInfoData.userMasterInfo!.levelInfo.level);
        // ServiceInfoManager.BOOL_OVER_SLOT_COUNT = userInfoData.userGameInfo!.totalSpin >= 300;
        // ServiceInfoManager.NUMBER_CURRENT_GAUGE_EXP = userInfoData.userMasterInfo!.levelInfo.exp;
        
        // userInfo.pingScheduleWebWorker();
        // HyperBountyManager.instance.initialize();
        return true;
    }

    // public static isOpenedLoadingPopup(): boolean {
    //     return LoadingPopup.getCurrentOpenPopup() !== null;
    // }

    public static setAuthFail(): void {
        UserInfo.isAuth = false;
    }

    public static isAuthFail(): boolean {
        return UserInfo.isAuth === false;
    }

    // public static goCustomerSupport(): void {
    //     if (NativeUtil.isFacebookWeb() && typeof (window as any).GoFBCanvasContact === 'function') {
    //         (window as any).GoFBCanvasContact();
    //     } else if (NativeUtil.isFacebookInstant()) {
    //         CommonPopup.getCommonPopup((err, popup) => {
    //             popup.open().setInfo("NOTICE", "You may contact our support team via our website.\nPlease use our website at\nhttps://electricslots.net/contact.").setOkBtn("OK", () => { });
    //         });
    //     } else {
    //         let uid = "", fbid = "", name = "", email = "", audid = "";
    //         const inst = UserInfo.instance();
    //         if (inst) {
    //             uid = inst.getUid().toString();
    //             fbid = inst.getFBID();
    //             name = inst.getUserName();
    //             email = inst.getEMail();
    //         } else if (SDefine.Use_Mobile_Auth_v2) {
    //             const loginInfo = MobileDeviceHelper.Instance.getLoginInfo();
    //             uid = loginInfo.uid ? loginInfo.uid.toString() : "";
    //         }

    //         if (NativeUtil.isMobileGame() && SDefine.Use_Mobile_Auth_v2) {
    //             audid = MobileDeviceHelper.Instance.getLoginInfo().audid;
    //         }

    //         const param = `ID_UID=${encodeURIComponent(uid)}&ID_FBID=${encodeURIComponent(fbid)}&ID_NAME=${encodeURIComponent(name)}&ID_EMAIL=${encodeURIComponent(email)}&ID_CLIENTVERSION=${encodeURIComponent(NativeUtil.getClientVersion())}&ID_WACCESSDATE=${encodeURIComponent(NativeUtil.getWebAccessDate().toString())}&ID_PLATFORM=${encodeURIComponent(TSUtility.getServiceType())}&ID_AUDID=${encodeURIComponent(audid)}`;
    //         const url = `${SDefine.CONTACT_URL}?${param}`;
    //         console.log("onClickCustomerSupport: " + url);
    //         sys.openURL(url);
    //     }
    // }

    // public static setCurrentLoginInfo(type: number, loginInfo: any): void {
    //     switch (type) {
    //         case SDefine.LOGINTYPE_FACEBOOK:
    //             loginInfo.facebookLogin = true;
    //             if (loginInfo.appleLogin) loginInfo.appleLogin = false;
    //             break;
    //         case SDefine.LOGINTYPE_APPLE:
    //             loginInfo.appleLogin = true;
    //             if (loginInfo.facebookLogin) {
    //                 loginInfo.facebookLogin = false;
    //                 FacebookUtil.logout(() => { });
    //             }
    //             break;
    //     }
    // }

    // onLoad(): void {
    //     console.log("MyInfo add persistRootNode");
    //     game.addPersistRootNode(this.node);
    //     this._eventEmitter = new EventTarget();
    //     this._rewardResult = new RewardResult();
    //     this.schedule(this.pingSchedule.bind(this), 5);
    //     this.schedule(this.jackpotInfoSchedule.bind(this), 60);
    //     systemEvent.on(macro.KEY_DOWN, this.onKeyDown.bind(this), this.node);
    // }

    // clearEvent(): void {
    //     this.unscheduleAllCallbacks();
    // }

    // onDestroy(): void {
    //     systemEvent.off(macro.KEY_DOWN, this.onKeyDown.bind(this), this.node);
    //     this.unscheduleAllCallbacks();
    //     UserInfo._instance = null;
    // }

    // // ===================== 所有业务方法（完整保留原逻辑） =====================
    // public async refreshClubInfo(): Promise<boolean> {
    //     const res = await CommonServer.Instance().asyncRequestGetMyClubInfo();
    //     if (CommonServer.isServerResponseError(res)) return false;
    //     this.infoClub = ClubServerInfo.ClubInfo.parseObj(res);
    //     return true;
    // }

    // public refreshUserInfo(data: any): boolean {
    //     const userInfo = UserInfo.createUserInfoData();
    //     if (!userInfo.init(data)) {
    //         console.error("MyUserInfo setInstance fail.");
    //         return false;
    //     }
    //     this._userInfo = userInfo;
    //     ServiceInfoManager.instance().setUserLevel(userInfo.userMasterInfo!.levelInfo.level);
    //     ServiceInfoManager.NUMBER_CURRENT_GAUGE_EXP = userInfo.userMasterInfo!.levelInfo.exp;
    //     return true;
    // }

    // public setLocation(val: string): void {
    //     this._location = val;
    //     NativeUtil.setObjValue_FBCrash("Location", val);
    // }

    // public getLocation(): string {
    //     return this._location;
    // }

    // public setGameId(val: string): void {
    //     this._gameId = val;
    //     NativeUtil.setObjValue_FBCrash("GameId", val);
    // }

    public getGameId(): string {
        return this._gameId;
    }

    // public setTourneyTierInfo(tier: number, id: number): void {
    //     this._prevTourneyTier = this._tourneyTier;
    //     this._tourneyTier = tier;
    //     this._tourneyID = id;
    // }

    // public resetTourneyTier(): void {
    //     this._tourneyTier = SlotTourneyManager.SlotTourneyTierType.INVALID;
    // }

    // public getTourneyTier(): number {
    //     return this._tourneyTier;
    // }

    // public getTourneyId(): number {
    //     return this._tourneyID;
    // }

    // public isJoinTourney(): boolean {
    //     return this._tourneyTier !== SlotTourneyManager.SlotTourneyTierType.INVALID;
    // }

    // public getPrevTourneyTier(): number {
    //     return this._prevTourneyTier;
    // }

    // public setPrevLocation(val: string): void {
    //     this._prevLocation = val;
    // }

    // public getPrevLocation(): string {
    //     return this._prevLocation;
    // }

    // public setPrevGameId(val: string): void {
    //     this._prevGameId = val;
    // }

    // public getPrevGameId(): string {
    //     return this._prevGameId;
    // }

    // public setPrevZoneId(val: number): void {
    //     this._prevZoneId = val;
    // }

    // public getPrevZoneId(): number {
    //     return this._prevZoneId;
    // }

    // public isExistFirstPurchasePopup(state: number): boolean {
    //     return this._firstPurchaseState === state;
    // }

    // public getGameLocation(): GameLocation {
    //     const loc: GameLocation = { tourneyTier: this.getTourneyTier() };
    //     loc.loc = this.getLocation();
    //     loc.subLoc = this.getGameId();
    //     loc.zoneID = this.getZoneId();
    //     return loc;
    // }

    // public getPrevGameLocation(): GameLocation {
    //     const loc: GameLocation = { tourneyTier: this.getPrevTourneyTier() };
    //     loc.loc = this.getPrevLocation();
    //     loc.subLoc = this.getPrevGameId();
    //     loc.zoneID = this.getPrevZoneId();
    //     return loc;
    // }

    // public setFirstPurchaseInfo(state: number, info: any): void {
    //     this._firstPurchaseState = state;
    //     this._firstPurchasePopInfo = info;
    // }

    // public resetFirstPurchaseInfo(): void {
    //     this._firstPurchaseState = 0;
    // }

    // public getServerChangeResult(data: any): any {
    //     const res = CommonServer.getServerChangeResult(data);
    //     const reward = RewardResult.parse(data.changeResult, res);
    //     UserInfo.instance()!.addRewardResult(reward);
    //     return res;
    // }

    // public getExceptionAuthInfo(): ExceptionAuthInfo {
    //     if (!this._exceptionAuthInfo) {
    //         this._exceptionAuthInfo = {
    //             entrancePath: "", clientIP: "", httpUserAgent: "", serviceType: "", market: "",
    //             deviceOS: "", isMobile: false, devicePlatform: "", jsEngine: "", countryISOCode: "",
    //             subdivisionsName: "", cityName: "", browser: "", deviceLang: "", deviceName: ""
    //         };
    //     }
    //     return this._exceptionAuthInfo;
    // }

    // public setExceptionAuthInfo(data: any): void {
    //     this._exceptionAuthInfo = {
    //         entrancePath: data.entrancePath,
    //         clientIP: data.clientIP,
    //         httpUserAgent: data.httpUserAgent,
    //         serviceType: data.serviceType,
    //         market: data.market,
    //         deviceOS: data.deviceOS,
    //         isMobile: data.isMobile,
    //         devicePlatform: data.devicePlatform,
    //         jsEngine: data.jsEngine,
    //         countryISOCode: data.countryISOCode,
    //         subdivisionsName: data.subdivisionsName,
    //         cityName: data.cityName,
    //         browser: data.browser,
    //         deviceLang: "",
    //         deviceName: ""
    //     };
    // }

    // public onKeyDown(e: any): void {
    //     const keyCode = e.keyCode;
    //     if (TSUtility.isDevService() && keyCode === macro.KEY.h) {
    //         PopupManager.Instance().makeScreenShot(3, 1, () => {
    //             HeroTooltipTest.getPopup((err, popup) => {
    //                 if (!err) popup.open();
    //             });
    //         });
    //     }
    // }

    // public applyChangeResult(changeResult: any): void {
    //     let addVipExp = 0;
    //     for (const vip of changeResult.vipHist) addVipExp += vip.addExp;
    //     if (addVipExp > 0) this.addUserVipPoint(addVipExp);

    //     for (const promo of changeResult.promotionHist) this.setUserPromotionInfo(promo);
    //     for (const level of changeResult.levelHist) this.addUserLevelExp(level.addExp);
    //     for (const asset of changeResult.assetHist) {
    //         this.addUserAssetPaindMoney(asset.paidCoin);
    //         this.addUserAssetMoney(asset.changeCoin);
    //     }
    //     for (const item of changeResult.itemHist) {
    //         if (this.isExceptAddItem(item)) this.addUserInventoryItem(item, changeResult);
    //     }
    //     for (const bingo of changeResult.bingoBallHist) this.addBingoBallCnt(bingo.addCnt);
    //     for (const purchase of changeResult.purchaseInfoHist) this.addPurchaseInfo(purchase);

    //     if (changeResult.inboxAddHist.length > 0) this.addUserInboxMessage(changeResult.inboxAddHist);
    //     if (changeResult.inboxDeleteHist.length > 0) this.removeUserInboxMessage(changeResult.inboxDeleteHist);

    //     for (const mission of changeResult.missionHist) {
    //         this.setUserMissionInfo(mission);
    //         if (changeResult.missionHist.length > 1 && mission.isReset && mission.id === 8) {
    //             ServiceInfoManager.BOOL_RESERVE_RESET_EFFECT = true;
    //         }
    //     }

    //     if (changeResult.missionHist.length > 0) MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.MISSION_UPDATE);

    //     if (changeResult.tripleDiamondJackpotGaugeHist.length > 0) {
    //         for (const gauge of changeResult.tripleDiamondJackpotGaugeHist) {
    //             this.setTripleDiamondWheelGaugeInfo(gauge);
    //         }
    //     }

    //     if (changeResult.heroBonusGaugeHist.length > 0) {
    //         const heroGauge = new HeroBonusGaugeHist();
    //         for (const gauge of changeResult.heroBonusGaugeHist) {
    //             heroGauge.addGauge += gauge.addGauge;
    //             heroGauge.abilityBonusGauge += gauge.abilityBonusGauge;
    //         }
    //         this.applyHeroBonusGauge(heroGauge);
    //     }

    //     for (const power of changeResult.heroPowerGaugeHist) this.applyHeroPowerGauge(power);
    //     for (const quest of changeResult.reelQuestHist) this.applyReelQuestHist(quest);

    //     changeResult.clear();
    // }

    // public removeVipGradeUpReward(val: any): any {
    //     return this._rewardResult!.removeVipGradeUpReward(val);
    // }

    // public removeLevelUpReward(val: any): any {
    //     return this._rewardResult!.removeLevelUpReward(val);
    // }

    // public removeLevelMysteryBoxReward(val: any): any {
    //     return this._rewardResult!.removeLevelMysteryBoxReward(val);
    // }

    public getUid(): number {
        return 451249740898304;
    }

    public getUserName(): string {
        return this._userInfo!.userMasterInfo!.name;
    }

    public getUserPicUrl(): string {
        return this._userInfo!.userMasterInfo!.picUrl;
    }

    public getUserFBPicUrl(): string {
        return this._userInfo!.userExMasterInfo!.fbPicURL;
    }

    public getFBID(): string {
        return this._userInfo!.userMasterInfo!.fbid;
    }

    public getAppleID(): string {
        return this._userInfo!.userMasterInfo!.appleID;
    }

    public getLineID(): string {
        return this._userInfo!.userMasterInfo!.lineID;
    }

    public getEMail(): string {
        return this._userInfo!.userMasterInfo!.email;
    }

    public getAccessToken(): string {
        this._accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkIjoxNzY3NDkyMTM1LCJleHBpcmVkIjoxNzY3NzUxMzM1LCJ0b2tlblR5cGUiOjAsInVpZCI6IjQ1MTI0OTc0MDg5ODMwNCJ9.T-56Tijs5rTXNyCq02tDodeLIVqvWClgzVThbxlxpFQ";
        return this._accessToken;
    }

    public getCreateDate(): number {
        return this._userInfo!.userMasterInfo!.createdDate;
    }

    public getUserLastLoginDate(): number {
        return this._userInfo!.userMasterInfo!.lastLoginDate;
    }

    public getUserLastLoginGapDate(): number {
        return this._userInfo!.userMasterInfo!.lastLoginGap;
    }

    public getUserStreakedJoinInfo(): StreakedJoinInfo {
        return this._userInfo!.userMasterInfo!.streakedJoinInfo;
    }

    public getUserSessionCnt(): number {
        return this._userInfo!.userMasterInfo!.sessionCount;
    }

    public isFirstUserSession(): boolean {
        console.log(`isFirstUserSession [${this.getUserLastLoginDate().toString()}][${this.getCreateDate().toString()}]`);
        return this.getUserLastLoginDate() === this.getCreateDate();
    }

    public isGuestUser(): boolean {
        if (SDefine.Use_Mobile_Auth_v2 ) {
            console.log("isGuestUser this._userInfo.userMasterInfo.fbid", this._userInfo!.userMasterInfo!.fbid === "");
            return this._userInfo!.userMasterInfo!.fbid === "";
        } else {
            // console.log("isGuestUser FacebookUtil.isLogin", FacebookUtil.isLogin());
            // return FacebookUtil.isLogin() === 0;
            return true;
        }
    }

    // public isFacebookLoginUser(): boolean {
    //     if (SDefine.Use_Mobile_Auth_v2 === 0) {
    //         return this._userInfo!.userMasterInfo!.fbid !== "";
    //     } else {
    //         console.log("isFacebookLoginUser FacebookUtil.isLogin", FacebookUtil.isLogin());
    //         return FacebookUtil.isLogin() === 1;
    //     }
    // }

    // public isAppleLoginUser(): boolean {
    //     if (SDefine.Use_Mobile_Auth_v2 === 0) {
    //         console.log("isAppleLoginUser SDefine.Use_Mobile_Auth_v2 false");
    //         return false;
    //     }
    //     if (!NativeUtil.isMobileGame()) return false;
    //     const isLogin = AppleLoginHelper.Instance.isLogin();
    //     console.log("isAppleLoginUser ", isLogin);
    //     return isLogin;
    // }

    // public isFacebookLinkedUser(): boolean {
    //     return SDefine.Use_Mobile_Auth_v2 !== 0 && UserInfo.instance()!.getFBID() !== "";
    // }

    // public isAppleLinkedUser(): boolean {
    //     return SDefine.Use_Mobile_Auth_v2 !== 0 && UserInfo.instance()!.getAppleID() !== "";
    // }

    public isFBShareDisableTarget(): boolean {
        return this.isGuestUser() === true;
    }

    public getPromotionInfo(key: string): any {
        return  this._userInfo!.userPromotion!.getPromotionInfo(key);
    }

    // public removePromotionInfo(key: string): void {
    //     this._userInfo!.userPromotion!.removePromotion(key);
    // }

    // public getItemInventory(): UserInven {
    //     return this._userInfo!.userInven!;
    // }

    // public getUserReelQuestInfo(): UserReelQuestInfo {
    //     return this._userInfo!.userReelQuest!;
    // }

    // public setUserReelQuestInfo(data: any): void {
    //     const quest = new UserReelQuestInfo();
    //     quest.initReelQuestInfo(data);
    //     this._userInfo!.userReelQuest = quest;
    //     this._eventEmitter!.emit(MSG.REFRESH_REELQUEST_USERINFO);
    // }

    // public getUserInboxInfo(): UserInboxInfo {
    //     this._userInboxInfo!.refreshAndNotify();
    //     return this._userInboxInfo!;
    // }

    public getTotalCoin(): number {
        return 1000;//this._userInfo!.userAssetInfo!.totalCoin;
    }

    // public getPaidCoin(): number {
    //     return this._userInfo!.userAssetInfo!.paidCoin;
    // }

    // public getUserLevelInfo(): LevelInfo {
    //     return this._userInfo!.userMasterInfo!.levelInfo;
    // }

    // public getUserVipInfo(): VipInfo {
    //     return this._userInfo!.userMasterInfo!.vipInfo;
    // }

    // public getUserSuiteInfo(): UserSuiteLeagueInfo {
    //     return this._userInfo!.userMasterInfo!.suiteInfo;
    // }

    // public getUserSuitePassInfo(): UserSuiteInfo {
    //     return this._userInfo!.userSuiteInfo!;
    // }

    // public getUserFriendInfo(): UserFriendInfo {
    //     if (TSUtility.isValid(this._userFriendInfo.sendGiftInfo)) {
    //         this._userFriendInfo.sendGiftInfo!.checkReset();
    //     }
    //     return this._userFriendInfo;
    // }

    // public getFriendSimpleInfo(uid: number): SlotDataDefine.UserSimpleInfo | null {
    //     if (TSUtility.isValid(this._userFriendInfo.activeFriends)) {
    //         for (const friend of this._userFriendInfo.activeFriends) {
    //             if (friend.uid === uid) return friend;
    //         }
    //     }
    //     if (TSUtility.isValid(this._userFriendInfo.nonActiveFriends)) {
    //         for (const friend of this._userFriendInfo.nonActiveFriends) {
    //             if (friend.uid === uid) return friend;
    //         }
    //     }
    //     return null;
    // }

    // public getUserStarAlbumGroup(): string {
    //     return this._userInfo!.userStarAlbumSimpleInfo!.group;
    // }

    // public setUserStarAlbumGroup(val: string): void {
    //     this._userInfo!.userStarAlbumSimpleInfo!.group = val;
    // }

    // public getUserStarAlbumSimpleInfo(): UserStarAlbumSimpleInfo {
    //     return this._userInfo!.userStarAlbumSimpleInfo!;
    // }

    // public getUserServiceInfo(): UserServiceInfo {
    //     return this._userInfo!.userMasterInfo!.serviceInfo!;
    // }

    // public getUserInboxMessageCnt(): number {
    //     let cnt = 0;
    //     if (SDefine.FB_Instant_iOS_Shop_Flag === 0 && MinigameManager.instance().isEnableMinigame() === 1) cnt++;

    //     const adTime = LocalStorageManager.getNormalADViewTime(this.getUid()) + 300;
    //     const adFlag = TSUtility.getServerBaseNowUnixTime() > adTime ? 1 : 10;
    //     const adRemain = LocalStorageManager.getNormalLastADView(this.getUid()) + 60 * adFlag - TSUtility.getServerBaseNowUnixTime();
    //     if (AdsManager.Instance().isReadyRewardedAD() && (ADTargetManager.instance().enableInboxReward_AllIn() || (ADTargetManager.instance().enableInboxReward_Normal() && adRemain <= 60))) cnt++;

    //     const bingoPromo = UserInfo.instance()!.getPromotionInfo(UserPromotion.DailyBingoBallPromotion.PromotionKeyName);
    //     if (TSUtility.isValid(bingoPromo) && bingoPromo.nextReceiveTime - TSUtility.getServerBaseNowUnixTime() <= 0) cnt++;

    //     if (ServiceInfoManager.instance().isInboxItemBingoResetShow() === 1) cnt++;
    //     return this._userInfo!.userInboxCnt + cnt;
    // }

    // public getUserInboxCollectCnt(): number {
    //     return this._userInfo!.userInboxCnt;
    // }

    // public setUserInboxMessageCnt(val: number): void {
    //     this._userInfo!.userInboxCnt = val;
    //     this._eventEmitter!.emit(MSG.UPDATE_INBOXINFO);
    // }

    // public setUserInboxCollectEnableCnt(val: number): void {
    //     this._userInfo!.collectEnableCnt = val;
    // }

    // public getUserInboxMainShopMessageCount(): number {
    //     return this._userInfo!.userInboxMainShopCnt;
    // }

    // public setUserInboxMainShopMessageCnt(val: number): void {
    //     this._userInfo!.userInboxMainShopCnt = val;
    //     this._eventEmitter!.emit(MSG.UPDATE_COUPONINFO);
    // }

    // public setUserInboxCouponInfo(val: any[]): void {
    //     this._couponInfoList = val;
    // }

    // public getUserInboxCouponInfo(): any[] {
    //     return this._couponInfoList;
    // }

    // public removeUserInboxCouponInfo(uid: string): void {
    //     if (uid.length <= 0) return;
    //     for (let i = 0; i < this._couponInfoList.length; i++) {
    //         if (this._couponInfoList[i].message.mUid === uid) {
    //             this._couponInfoList.splice(i, 1);
    //             break;
    //         }
    //     }
    // }

    // public getUserInboxCollectEnableCnt(): number {
    //     return this._userInfo!.collectEnableCnt;
    // }

    // public addUserInboxMessage(data: any[]): void {
    //     if (!this._userInboxInfo) return;
    //     for (const msg of data) {
    //         const inboxMsg = new UserInboxInfo();
    //         inboxMsg.initInboxMessageUserInfo(msg.obj);
    //         this._userInboxInfo.addInboxMessage(inboxMsg);
    //     }
    // }

    // public removeUserInboxMessage(uidList: any[]): void {
    //     if (!this._userInboxInfo) return;
    //     for (const uid of uidList) {
    //         this._userInboxInfo.removeInboxMessage(uid.mUid);
    //     }
    // }

    // public getLastPurchaseDate(): number {
    //     return this._userInfo!.userMasterInfo!.serviceInfo!.lastPurchaseDate;
    // }

    // public getBoostPromotionCoolTime(): number {
    //     return this._userInfo!.userMasterInfo!.serviceInfo!.promotionCoolTime;
    // }

    public getBingoBallCnt(): number {
        let cnt = 0;
        // const items = UserInfo.instance()!.getItemInventory().getItemsByItemId(SDefine.I_BINGOBALL_OFFER);
        // for (const item of items) cnt += item.curCnt;
        // return this._userInfo!.userMasterInfo!.serviceInfo!.bingoBallCnt + cnt;
        return 0;
    }

    // public getFreeBingoBallCnt(): number {
    //     return this._userInfo!.userMasterInfo!.serviceInfo!.bingoBallCnt;
    // }

    // public getPaidBingoBallCnt(): number {
    //     let cnt = 0;
    //     const items = UserInfo.instance()!.getItemInventory().getItemsByItemId(SDefine.I_BINGOBALL_OFFER);
    //     for (const item of items) cnt += item.curCnt;
    //     return cnt;
    // }

    // public addBingoBallCnt(val: number): void {
    //     this._userInfo!.userMasterInfo!.serviceInfo!.bingoBallCnt += val;
    //     this._eventEmitter!.emit(MSG.UPDATE_BINGOBALL);
    // }

    // public getPurchaseInfo(): UserPurchaseInfo {
    //     return this._userInfo!.userPurchaseInfo!;
    // }

    // public addPurchaseInfo(data: any): void {
    //     this._userInfo!.userMasterInfo!.serviceInfo!.totalPurchaseCnt++;
    //     this._eventEmitter!.emit(MSG.UPDATE_PURCHASE_COUNT);
    //     if (data.cash) {
    //         this._userInfo!.userMasterInfo!.serviceInfo!.totalPurchaseCash += data.cash;
    //         this._userInfo!.userMasterInfo!.serviceInfo!.prevPurchaseCash = data.cash;
    //         if (this._userInfo!.userMasterInfo!.serviceInfo!.maxPurchaseCash < data.cash) {
    //             this._userInfo!.userMasterInfo!.serviceInfo!.maxPurchaseCash = data.cash;
    //         }
    //     }
    //     if (data.avgIn30Days) this._userInfo!.userPurchaseInfo!.avgIn30Days = data.avgIn30Days;
    //     if (data.avgOverUsd3In30Days2) this._userInfo!.userPurchaseInfo!.avgOverUsd3In30Days2 = data.avgOverUsd3In30Days2;
    //     if (data.avgOverUsd3In30Days) this._userInfo!.userPurchaseInfo!.avgOverUsd3In30Days = data.avgOverUsd3In30Days;
    //     if (TSUtility.isValid(data.medOverUsdIn30Days)) this._userInfo!.userPurchaseInfo!.medOverUsdIn30Days = data.medOverUsdIn30Days;
    //     if (data.lastBuySalePriceIn30Days) this._userInfo!.userPurchaseInfo!.lastBuySalePriceIn10Days = data.lastBuySalePriceIn30Days;
    //     if (data.epicWinOfferInfo) this._userInfo!.userPurchaseInfo!.epicWinOfferInfo = data.epicWinOfferInfo;
    //     if (data.recordBreakerInfo) {
    //         this._userInfo!.userPurchaseInfo!.recordBreakerInfo = data.recordBreakerInfo.histsIn30Days || [];
    //     }
    //     this._eventEmitter!.emit(MSG.UPDATE_PURCHASE_INFO);
    // }

    // public setCouponID(val: string): void {
    //     this._couponID = val;
    // }

    // public getCouponID(): string {
    //     return this._couponID;
    // }

    // public getUserBlastOffInfo(): UserBlastOffInfo {
    //     return this._userInfo!.userBlastOffInfo!;
    // }

    // public getUserMission(): UserMission {
    //     return this._userInfo!.userMission!;
    // }

    // public updateUserMission(data: any): void {
    //     this._userInfo!.userMission!.updateUserMission(data);
    // }

    // public addUserAssetMoney(val: number): void {
    //     if (val > 0) ServiceInfoManager.instance().setIsIngAllInOffer(false);
    //     const oldCoin = this._userInfo!.userAssetInfo!.totalCoin;
    //     this._userInfo!.userAssetInfo!.totalCoin += val;
    //     if (this._userInfo!.userAssetInfo!.totalCoin < 0) {
    //         console.error(`addUserAssetMoney fail...${val.toString()} - ${oldCoin.toString()}`);
    //         this._userInfo!.userAssetInfo!.totalCoin = 0;
    //     }
    //     this._userInfo!.userAssetInfo!.biggestTotalCoin = Math.max(this._userInfo!.userAssetInfo!.totalCoin, this._userInfo!.userAssetInfo!.biggestTotalCoin);
    //     this._eventEmitter!.emit(MSG.UPDATE_ASSET, oldCoin);
    // }

    // public addUserAssetPaindMoney(val: number): void {
    //     const oldPaid = this._userInfo!.userAssetInfo!.paidCoin;
    //     this._userInfo!.userAssetInfo!.paidCoin = val;
    //     if (this._userInfo!.userAssetInfo!.paidCoin < 0) {
    //         console.error(`addUserAssetMoney fail...${val.toString()} - ${oldPaid.toString()}`);
    //         this._userInfo!.userAssetInfo!.paidCoin = 0;
    //     }
    // }

    // public setUserPromotionInfo(data: any): void {
    //     const key = data.promotionKey;
    //     const oldPromo = this._userInfo!.userPromotion!.getPromotionInfo(key);
    //     this._userInfo!.userPromotion!.setPromotion(data);
    //     this._eventEmitter!.emit(MSG.UPDATE_PROMOTION, key, data, oldPromo);
    // }

    // public addJiggyPuzzlePieceCnt(val: number): void {
    //     UserPromotion.JiggyPuzzlePromotion.addPieceCnt(val);
    //     this._eventEmitter!.emit(MSG.UPDATE_WT_PIECEINFO);
    // }

    // public addUserVipPoint(val: number): void {
    //     const oldLevel = this._userInfo!.userMasterInfo!.vipInfo.level;
    //     this._userInfo!.userMasterInfo!.vipInfo.exp += val;
    //     this._userInfo!.userMasterInfo!.vipInfo.level = VipManager.Instance().getGradeFromExp(this._userInfo!.userMasterInfo!.vipInfo.exp);
    //     const maxGrade = VipManager.Instance().getMaxGradeCnt();
    //     if (this._userInfo!.userMasterInfo!.vipInfo.level === maxGrade) {
    //         this._userInfo!.userMasterInfo!.vipInfo.level = maxGrade - 1;
    //     }
    //     const newLevel = this._userInfo!.userMasterInfo!.vipInfo.level;

    //     if (oldLevel !== newLevel) {
    //         this._userInfo!.userMasterInfo!.vipInfo.issueDate = TSUtility.getServerBaseNowUnixTime();
    //         const curMode = UserInfo.instance()!.getCurrentSceneMode();
    //         if (curMode === SDefine.Lobby || curMode === SDefine.Slot) {
    //             ServiceInfoManager.BOOL_ENABLE_VIP_STATUS_POPUP = true;
    //             VipStatusUpPopup.OpenPopup(oldLevel, newLevel);
    //         }
    //         for (let i = oldLevel + 1; i <= newLevel; i++) {
    //             Analytics.vipAchieved(i);
    //             if (i >= 2 && i <=9) Analytics.vip2to9Achieved(i);
    //         }
    //     }
    //     this._eventEmitter!.emit(MSG.UPDATE_VIP_POINT);
    // }

    // public addUserInventoryItem(data: any, changeResult: any): void {
    //     this._userInfo!.userInven!.addItem(data.itemInfo, data.addCnt, data.addTime);
    //     this._eventEmitter!.emit(MSG.UPDATE_INVENTORY, data, changeResult);
    //     this._eventEmitter!.emit(MSG.UPDATE_BINGOBALL);
    // }

    // public addUserLevelExp(val: number): void {
    //     const oldLevel = LevelManager.Instance().getLevelFromExp(this._userInfo!.userMasterInfo!.levelInfo.exp);
    //     this._userInfo!.userMasterInfo!.levelInfo.exp += val;
    //     const newLevel = LevelManager.Instance().getLevelFromExp(this._userInfo!.userMasterInfo!.levelInfo.exp);
    //     ServiceInfoManager.instance().setUserLevel(newLevel);
    //     this._userInfo!.userMasterInfo!.levelInfo.level = newLevel;

    //     if (oldLevel !== newLevel) {
    //         InGameUI_LevelUp.playLevelUpResult(oldLevel, newLevel);
    //         ServiceInfoManager.BOOL_RESERVE_UNLOCK_UI = true;
    //         Analytics.achievedLevel(newLevel);
    //         if (NativeUtil.isFacebookInstant() && oldLevel <4 && newLevel >=4) {
    //             FBSquadManager.Instance().UpdateSquadStatus();
    //         }
    //         if (newLevel %5 ===0) Analytics.achievedLevel_XXX(newLevel);
    //         if (PiggyBankPromotionManager.instance().isUpToMore() ===1) {
    //             PiggyBankPromotionManager.instance().releaseUptoMore();
    //         }
    //         this._eventEmitter!.emit(MSG.UPDATE_LEVEL_UP);
    //     }
    //     this._eventEmitter!.emit(MSG.UPDATE_LEVEL);
    // }

    // public updateReleaseBettingLock(): void {
    //     this._eventEmitter!.emit(MSG.RELEASE_BETTINGLOCK);
    // }

    // public changeUserProfilePicUrl(val: string): void {
    //     this._userInfo!.userMasterInfo!.picUrl = val;
    //     this._eventEmitter!.emit(MSG.UPDATE_PICTURE);
    // }

    // public hasMajorRollerFreeTicket(): boolean {
    //     return UserInfo.instance()!.getItemInventory().getItemsByItemId(SDefine.ITEM_MAJORROLLER_FREETICKET).length >0;
    // }

    // public hasSupersizeFreeTicket(): boolean {
    //     return UserInfo.instance()!.getItemInventory().getItemsByItemId("i_supersize_slot_play_ticket").length >0;
    // }

    // public hasSuitePass(): boolean {
    //     return UserInfo.instance()!.getItemInventory().getItemsByItemId(SDefine.ITEM_SUITE_PASS).length >0;
    // }

    // public hasLevelUpBooster(): boolean {
    //     return UserInfo.instance()!.getItemInventory().getItemsByItemId(SDefine.ITEM_LEVEL_UP_BOOSTER).length >0;
    // }

    // public hasVipPassBenefit(zoneId: number, zoneName: string): boolean {
    //     const vipInfo = this.getUserVipInfo();
    //     let vipLevel = vipInfo.level;
    //     if (MembersClassBoostUpManager.instance().isRunningMembersBoostUpProcess()) {
    //         vipLevel = MembersClassBoostUpManager.instance().getBoostedMembersClass();
    //     } else if (MembersClassBoostUpNormalManager.instance().isRunningMembersBoostUpExpandProcess()) {
    //         vipLevel = MembersClassBoostUpNormalManager.instance().getBoostedMembersClass();
    //     }
    //     const gradeInfo = VipManager.Instance().getGradeInfo(vipLevel);
        
    //     if (zoneName === SDefine.HIGHROLLER_ZONENAME || zoneName === SDefine.LIGHTNING_ZONENAME) return true;
    //     if (zoneName === SDefine.VIP_LOUNGE_ZONENAME) {
    //         return gradeInfo.benefit.vipLoungePass ===1;
    //     }
    //     if (zoneName === SDefine.SUITE_ZONENAME && gradeInfo.grade >=7) return true;
    //     return false;
    // }

    // public hasActiveReelQuest(): boolean {
    //     const key = this.getActiveReelQuestPromotionKey();
    //     if (key === "") return false;
    //     const quest = this.getUserReelQuestInfo();
    //     const promo = UserInfo.instance()!.getPromotionInfo(key);
    //     return quest.seasonID === promo.seasonID && quest.curStage <= UserReelQuestInfo.MAX_STAGE_ID;
    // }

    // public getActiveReelQuestPromotionKey(): string {
    //     const normalPromo = UserInfo.instance()!.getPromotionInfo(UserPromotion.ReelQuestPromotion.Normal_PromotionKeyName);
    //     if (normalPromo && normalPromo.isActive()) {
    //         return this.getReelQuestValidPromotionKey(normalPromo);
    //     }
    //     const newbiePromo = UserInfo.instance()!.getPromotionInfo(UserPromotion.ReelQuestPromotion.Newbie_PromotionKeyName);
    //     if (newbiePromo && newbiePromo.isActive()) {
    //         return this.getReelQuestValidPromotionKey(newbiePromo);
    //     }
    //     return "";
    // }

    // public getReelQuestValidPromotionKey(promo: any): string {
    //     const quest = this.getUserReelQuestInfo();
    //     if (quest.seasonID !== promo.seasonID) return "";
    //     if (quest.curStage > UserReelQuestInfo.MAX_STAGE_ID) return "";
    //     return promo.promotionKey;
    // }

    // public getBlasterOffPoint(): number {
    //     return this.getUserBlastOffInfo().curCore;
    // }

    // public addBalsterOffPoint(val: number): number {
    //     const info = this.getUserBlastOffInfo();
    //     info.curCore += val;
    //     return info.curCore;
    // }

    // public getUserHeroInfo(): UserHeroInfo | null {
    //     return this._userHeroInfo;
    // }

    // public changeActiveHero(heroId: number): boolean {
    //     if (this._userHeroInfo!.changeActiveHero(heroId) ===0) {
    //         console.error("changeActiveHero fail", heroId);
    //         return false;
    //     }
    //     if (HeroManager.Instance().isNewTag(heroId)) HeroManager.Instance().clearNewTag(heroId);
    //     this._eventEmitter!.emit(MSG.CHANGE_ACTIVE_HERO);
    //     return true;
    // }

    // public addHeroExp(heroId: number, exp: number): void {
    //     const isNew = this._userHeroInfo!.hasHero(heroId) ===0;
    //     const oldLevel = this._userHeroInfo!.getHeroLevel(heroId);
    //     this._userHeroInfo!.addHeroExp(heroId, exp);
    //     const newLevel = this._userHeroInfo!.getHeroLevel(heroId);
        
    //     this._eventEmitter!.emit(MSG.UPDATE_HERO_EXPUP);
    //     if (oldLevel !== newLevel) this._eventEmitter!.emit(MSG.UPDATE_HERO_RANKUP, heroId);
    //     if (isNew) this._eventEmitter!.emit(MSG.ADD_NEW_HERO, heroId);
    // }

    public isPassAbleCasino(zoneId: number, zoneName: string, slotId: string = ""): boolean {
        // if (this.hasVipPassBenefit(zoneId, zoneName)) return true;
        // if (zoneId === SDefine.MAJORROLLER_ZONEID) {
        //     if (this.hasMajorRollerFreeTicket() && zoneName === SDefine.VIP_LOUNGE_ZONENAME) return true;
        //     if (this.hasSupersizeFreeTicket() && zoneName === SDefine.VIP_LOUNGE_ZONENAME) {
        //         if (slotId === "") return true;
        //         if (SupersizeItManager.instance.isTargetSlotID(slotId)) return true;
        //     }
        // }
        // if (zoneId === SDefine.SUITE_ZONEID && this.hasSuitePass() && zoneName === SDefine.SUITE_ZONENAME) return true;
        return false;
    }

    // public getMaximumPassableCasino(): number {
    //     const maxZone = CasinoZoneManager.Instance().getMaxZoneCount();
    //     const zoneNames = [SDefine.HIGHROLLER_ZONENAME, SDefine.VIP_LOUNGE_ZONENAME];
    //     for (let i = maxZone -1; i >=0; i--) {
    //         if (this.isPassAbleCasino(i, zoneNames[i])) return i;
    //     }
    //     return 0;
    // }

    // public setZoneID(val: number): void {
    //     this._zoneId = val;
    //     NativeUtil.setObjValue_FBCrash("ZoneId", val.toString());
    // }

    public getZoneId(): number {
        return this._zoneId;
    }

    public setZoneName(val: string): void {
        this._zoneName = val;
    }

    public getZoneName(): string {
        return this._zoneName;
    }

    public setPrevSceneSlot(val: boolean): void {
        this._isFromSlot = val;
    }

    public getPrevSceneSlot(): boolean {
        return this._isFromSlot;
    }

    public setCurrentSceneMode(val: string): void {
        this._currentSceneMode = val;
    }

    public getCurrentSceneMode(): string {
        return this._currentSceneMode;
    }

    // public addListenerTarget(event: string, cb: Function, target: any): void {
    //     this._eventEmitter!.on(event, cb, target);
    // }

    // public removeListenerTarget(event: string, cb: Function, target: any): void {
    //     this._eventEmitter!.off(event, cb, target);
    // }

    // public removeListenerTargetAll(target: any): void {
    //     this._eventEmitter!.targetOff(target);
    // }

    // public pingSchedule(): void {
    //     this.asyncRequestPing();
    // }

    // public async asyncRequestPing(): Promise<void> {
    //     const startTime = new Date().getTime();
    //     const res = await CommonServer.Instance().requestPing(this.getUid(), this.getAccessToken(), this._lastNotiIndex, this._lastPingLatency);
    //     if (CommonServer.isServerResponseError(res, 1)) {
    //         console.error("asyncRequestPing fail." + JSON.stringify(res));
    //         return;
    //     }
    //     const endTime = new Date().getTime();
    //     this._lastPingLatency = endTime - startTime;
    //     console.log("this._lastPingLatency " + this._lastPingLatency);

    //     let sendFlag = true;
    //     if (this._lastPingLatency <0 || Math.random() <0.8) sendFlag = false;
    //     if (sendFlag) {
    //         let platform = "";
    //         if (NativeUtil.isFacebookInstant()) platform = (window as any).FBInstant.getPlatform();
    //         const logData = JSON.stringify({
    //             uid: UserInfo.instance()!.getUid(),
    //             waccess_date: NativeUtil.getWebAccessDate(),
    //             ttl: this._lastPingLatency,
    //             country_iso_code: UserInfo.instance()!.getExceptionAuthInfo().countryISOCode,
    //             service_type: UserInfo.instance()!.getExceptionAuthInfo().serviceType,
    //             log_date: TSUtility.getServerBaseNowUnixTime(),
    //             service_mode: TSUtility.getServiceMode(),
    //             fbinstant_platform: platform,
    //             server_url: CommonServer.Instance().commonServerBaseURL
    //         });
    //         FireHoseSender.Instance().sendAwsForTTL(logData);
    //     }

    //     const notiIdx = NotifyManager.instance.setNotifyData(res);
    //     if (notiIdx >0) this._lastNotiIndex = notiIdx;
    // }

    // public pingScheduleWebWorker(): void {
    //     if (!NativeUtil.isMobileGame() && typeof Worker !== 'undefined') {
    //         let workerUrl = "";
    //         if (NativeUtil.isFacebookInstant()) {
    //             workerUrl = "pingWorker.js";
    //         } else {
    //             workerUrl = CommonServer.Instance().getCommonServerUrl() + "pingWorker.js";
    //         }
    //         try {
    //             console.log("pingScheduleWebWorker " + workerUrl);
    //             const worker = new Worker(workerUrl);
    //             worker.postMessage(JSON.stringify({
    //                 uid: this.getUid(),
    //                 accessToken: this.getAccessToken(),
    //                 commonServerBaseURL: CommonServer.Instance().getCommonServerUrl()
    //             }));
    //         } catch (e) {
    //             console.error(e);
    //         }
    //     }
    // }

    // public jackpotInfoSchedule(): void {
    //     this.asyncRefreshJackpotInfo(false);
    // }

    // public checkStarAlbumSeasonOver(): void {
    //     const season = StarAlbumManager.instance().getCurrentSeasonInfo();
    //     if (this._lastStarAlbumCheckSeasonId !== season.numSeasonID) {
    //         this._lastStarAlbumCheckSeasonId = season.numSeasonID;
    //         this._eventEmitter!.emit(MSG.CHANGE_STARALBUM_SEASON);
    //     }
    // }

    // public resetInfoBeforeSceneLoad(): void {
    //     const popupNode = PopupManager.Instance().node;
    //     for (let i = popupNode.childrenCount -1; i >=0; i--) {
    //         const child = popupNode.children[i];
    //         if (!child.getComponent(LoadingPopup)) {
    //             child.removeFromParent();
    //             child.destroy();
    //         }
    //     }
    //     this.resetRewardResult();
    //     PopupManager.Instance().resetOpenPopup();
    //     PopupManager.Instance().resetScreenShot();
    // }

    // public async asyncRefreshMissionFromServer(): Promise<void> {}
    // public refreshMissionFromServer(): void {}
    // public refreshBlastOffFromServer(): void {}

    // public setMissionRefresh(data: any): void {
    //     const mission = new UserMission();
    //     mission.initUserMission(data.userDailyMissionV3);
    //     this._userInfo!.userMission = mission;
    //     for (const cb of this._refreshMissionCallbacks) cb();
    //     this._refreshMissionCallbacks = [];
    //     MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.MISSION_UPDATE);
    // }

    // public setUserMissionInfo(data: any): void {
    //     UserInfo.instance()!.getUserMission().updateUserMission(data);
    // }

    // public async asyncCheckAndRefreshMissionInfo(): Promise<boolean> { return true; }
    // public async asyncCheckAndRefreshBlastOffInfo(): Promise<boolean> { return true; }

    // public async asyncCheckDailyTopUpReward(cb?: Function): Promise<void> {
    //     const item10 = this._userInfo!.userInven!.getItemsByItemId(SDefine.ITEM_ATTENDANCE_DAILY_10);
    //     for (const item of item10) await this.asyncUseDailyTopupItem(item);

    //     const item30 = this._userInfo!.userInven!.getItemsByItemId(SDefine.ITEM_ATTENDANCE_DAILY_30);
    //     for (const item of item30) await this.asyncUseDailyTopupItem(item);

    //     const item50 = this._userInfo!.userInven!.getItemsByItemId(SDefine.ITEM_ATTENDANCE_DAILY_50);
    //     for (const item of item50) await this.asyncUseDailyTopupItem(item);

    //     const item60 = this._userInfo!.userInven!.getItemsByItemId(SDefine.ITEM_ATTENDANCE_DAILY_60);
    //     for (const item of item60) await this.asyncUseDailyTopupItem(item);

    //     const item100 = this._userInfo!.userInven!.getItemsByItemId(SDefine.ITEM_ATTENDANCE_DAILY_100);
    //     for (const item of item100) await this.asyncUseDailyTopupItem(item);

    //     const item10Re = this._userInfo!.userInven!.getItemsByItemId(SDefine.ITEM_ATTENDANCE_DAILY_10_RE);
    //     for (const item of item10Re) await this.asyncUseDailyTopupItem(item);

    //     const item30Re = this._userInfo!.userInven!.getItemsByItemId(SDefine.ITEM_ATTENDANCE_DAILY_30_RE);
    //     for (const item of item30Re) await this.asyncUseDailyTopupItem(item);

    //     const item60Re = this._userInfo!.userInven!.getItemsByItemId(SDefine.ITEM_ATTENDANCE_DAILY_60_RE);
    //     for (const item of item60Re) await this.asyncUseDailyTopupItem(item);

    //     const item100Re = this._userInfo!.userInven!.getItemsByItemId(SDefine.ITEM_ATTENDANCE_DAILY_100_RE);
    //     for (const item of item100Re) await this.asyncUseDailyTopupItem(item);

    //     if (cb) cb();
    // }

    // public async asyncUseDailyTopupItem(item: any): Promise<void> {
    //     const extra = UserInven.AttendanceDailyExtraInfo.parse(e.extraInfo);
    //     if (TSUtility.getServerBaseNowUnixTime() < extra.nextReceiveTime) return;
    //     if (item.regDate + item.totCnt * SDefine.DAILY_TOPUP_INTERVAL < TSUtility.getServerBaseNowUnixTime()) return;
        
    //     const res = await CommonServer.Instance().asyncRequestUseItem(item.itemUniqueNo, 1, "");
    //     if (CommonServer.isServerResponseError(res)) {
    //         console.error("asyncRequestUseItem fail.");
    //         return;
    //     }
    //     const changeRes = UserInfo.instance()!.getServerChangeResult(res);
    //     UserInfo.instance()!.applyChangeResult(changeRes);
    // }

    // public async asyncRefreshFriendInfo(): Promise<void> {
    //     const now = NativeUtil.getUnixTimestamp();
    //     if (this._lastRefreshFriendInfoTime + 3600 > now) return;
    //     this._lastRefreshFriendInfoTime = now;
    //     console.log("TimeCheck asyncRefreshFriendInfo start");
    //     this.resetFriendInfo();

    //     if (NativeUtil.isFacebookInstant()) {
    //         const players = await (window as any).FBInstant.player.getConnectedPlayersAsync();
    //         const fbIds: string[] = [];
    //         players.map(p => fbIds.push(p.getID()));
    //         const res = await CommonServer.Instance().asyncRequestGetFriendInfo_Instant(UserInfo.instance()!.getUid(), UserInfo.instance()!.getAccessToken(), true, fbIds);
    //         if (CommonServer.isServerResponseError(res)) {
    //             console.error("CommonServer.Instance().requestGetFriendInfo_Instant fail ");
    //             return;
    //         }
    //         this.setFriendInfo(res);
    //     } else {
    //         if (FacebookUtil.isLogin() !==1) return;
    //         const res = await CommonServer.Instance().asyncRequestGetFriendInfo(this.getUid(), this.getAccessToken(), FacebookUtil.m_fbid, FacebookUtil.m_fbAccessToken, true);
    //         if (CommonServer.isServerResponseError(res)) {
    //             console.error("CommonServer.Instance().asyncRequestGetFriendInfo fail ");
    //             return;
    //         }
    //         this.setFriendInfo(res);
    //     }
    //     console.log("TimeCheck asyncRefreshFriendInfo end");
    // }

    // public setFriendInfo(data: any): void {
    //     this._userFriendInfo = UserInfo.parseUserFriendInfo(data);
    // }

    // public resetFriendInfo(): void {
    //     this._userFriendInfo = UserInfo.parseUserFriendInfo({});
    // }

    public async asyncRefreshHeroInfo(): Promise<void> {
        const res = await CommonServer.Instance().asyncRequestGetHeroInfo();
        if (CommonServer.isServerResponseError(res)) {
            console.error("CommonServer.Instance().asyncRefreshHeroInfo fail ");
            return;
        }
        // this.setUserHeroInfo(res.userHero);
    }

    // public setUserHeroInfo(data: any): void {
    //     this._userHeroInfo = UserHeroInfo.parse(data);
    // }

    public async asyncRefreshInboxInfo(): Promise<void> {
        const res = await CommonServer.Instance().asyncRequestInboxInfo(this.getUid(), this.getAccessToken());
        if (CommonServer.isServerResponseError(res)) {
            console.error("CommonServer.Instance().requestGetInboxInfo fail ");
            return;
        }
        // this.refreshInboxInfo(res.inbox);
    }

    // public refreshInboxInfo(data: any): void {
    //     this._userInboxInfo = new UserInboxInfo();
    //     this._userInboxInfo.initUserInboxInfo(data);
    // }

    public async asyncRefreshJackpotInfo(force: boolean): Promise<boolean> {
        const zoneId = this.getZoneId();
        const now = Utility.getUnixTimestamp();
        if (!force && this.refreshJackpotCheckTime +20 > now) return true;
        console.log("TimeCheck asyncRefreshJackpotInfo start");
        const res = await this.asyncRefreshJackpotInfoByZoneId(Math.min(1, zoneId),"");
        return res;
    }

    public asyncRefreshJackpotInfoByZoneId(zoneId: number,res:any) {
        // const res = await CommonServer.Instance().requestZoneInfo();
        // if (!this.isValid) return false;
        // if (CommonServer.isServerResponseError(res)) {
        //     console.error("CommonServer.Instance().requestZoneInfo fail ");
        //     return false;
        // }

        // var res1 = JSON.parse('')
        // var res = res1 as any;


        const now = Utility.getUnixTimestamp();
        this.refreshJackpotCheckTime = now;

        // 处理老虎机奖池
        for (const z in res.slotJackpotsAll) {
            const zone = parseInt(z);
            for (const s in res.slotJackpotsAll[z]) {
                const slotList = res.slotJackpotsAll[z][s];
                for (let i=0; i<slotList.length; i++) {
                    const jackpot = slotList[i];
                    const subKey = jackpot.jackpotSubKey;
                    const slotId = jackpot.slotID;
                    const subId = jackpot.jackpotSubID;
                    const basePrize = jackpot.basePrize;
                    const curJackpot = jackpot.jackpot;
                    const maxBase = jackpot.maxBasePrize;
                    const minPrize = jackpot.minPrize;
                    const maxPrize = jackpot.maxPrize;
                    let rate = curJackpot / 3000;
                    if (rate <1000) rate =1000;
                    if (jackpot.progressiveRate !== null && jackpot.progressiveRate ===0) rate =0;
                    const linked = jackpot.linked;
                    const linkedKey = jackpot.linkedKey;

                    // const slotInfo = SlotJackpotManager.Instance().getSlotmachineInfo(zone, slotId);
                    // if (linked) SlotJackpotManager.Instance().getLinkedJackpotInfo(zone, linkedKey).setTargetGame(slotId);
                    // slotInfo.setJackpotMoney(subId, basePrize, curJackpot, maxBase, rate, minPrize, maxPrize, linked, linkedKey, subKey);
                }
            }
        }

        // 处理赌场奖池
        this._initCasinoJackpot(res.casinoJackpots);
        const winKeys = Object.keys(res.casinoJackpotLastWins);
        for (let i=0; i<winKeys.length; i++) {
            const zone = winKeys[i];
            const winInfo = SlotDataDefine.CasinoJackpotWinInfo.parseObj(res.casinoJackpotLastWins[zone]);
            SlotJackpotManager.Instance().setCasinoLastWinInfo(winInfo.zoneID, winInfo);
        }

        // 处理区域信息
        this.slotZoneInfo[zoneId] = res.zoneInfo;
        for (let i=0; i<res.zoneInfo.slotList.length; i++) {
            const slot = res.zoneInfo.slotList[i];
            if (slot.flag === "sneak peek") {
                ServiceInfoManager.instance.setSneakPeekSlotID(slot.slotID);
            } else if (slot.flag === "revamp") {
                ServiceInfoManager.STRING_REVAMP_SLOT_ID = slot.slotID;
            }
        }

        // 处理三倍钻石奖池
        if (res.tripleDiamondJackpots) {
            for (let i=0; i<res.tripleDiamondJackpots.length; i++) {
                SlotJackpotManager.Instance().setTdjackpotInfo(i, res.tripleDiamondJackpots[i]);
            }
        }
        if (res.tripleDiamondJackpotLastWins) {
            SlotJackpotManager.Instance().setTdjackpotWinnerInfo(res.tripleDiamondJackpotLastWins);
        }

        // 处理三倍刺激奖池
        if (res.tripleThrillJackpots) {
            for (let i=0; i<res.tripleThrillJackpots.length; i++) {
                SlotJackpotManager.Instance().setThrillJackpotInfo(i, res.tripleThrillJackpots[i]);
            }
        }
        if (res.tripleThrillJackpotLastWins) {
            SlotJackpotManager.Instance().setThrillJackpotWinnerInfo(res.tripleThrillJackpotLastWins);
        }

        // 设置奖池进度条最大值
        // if (TSUtility.isValid(res.tripleDiamondGoldTicketMaxGauge) && TSUtility.isValid(res.tripleDiamondDiamondTicketMaxGauge)) {
        //     UserInfo.instance()!.setTripleDiamondWheelMaxGauge(res.tripleDiamondGoldTicketMaxGauge, res.tripleDiamondDiamondTicketMaxGauge);
        // }
        // if (TSUtility.isValid(res.tripleThrillJackpotSliverWheelMaxGauge) && TSUtility.isValid(res.tripleThrillJackpotGoldWheelMaxGauge) && TSUtility.isValid(res.tripleThrillJackpotDiamondWheelMaxGauge)) {
        //     UserInfo.instance()!.setThrillJackpotWheelMaxGauge(res.tripleThrillJackpotSliverWheelMaxGauge, res.tripleThrillJackpotGoldWheelMaxGauge, res.tripleThrillJackpotDiamondWheelMaxGauge);
        // }

        if (res.tripleDiamondDiamondTicketMinBet) ServiceInfoManager.NUMBER_TRIPLE_DIAMOND_MIN_BET = res.tripleDiamondDiamondTicketMinBet;
        if (res.supersizeJackpotInfo) SupersizeItManager.instance.parseZoneInfo(res.supersizeJackpotInfo);
        if (res.spin2WinInfo) ServiceInfoManager.NUMBER_SPIN_2_WIN_TICKET_COUNT = res.spin2WinInfo.ticketCount;
        if (res.mostPlayedSlots) ServiceSlotDataManager.instance.updateMostPlayedSlot(res.mostPlayedSlots);

        console.log("TimeCheck asyncRefreshJackpotInfo end");
        // this._eventEmitter!.emit(MSG.UPDATE_JACKPOTINFO);
        return true;
    }

    private _initCasinoJackpot(data: any[]): void {
        for (let i=0; i<data.length; i++) {
            const jackpot = data[i];
            const zoneId = jackpot.zoneID;
            const subId = jackpot.jackpotSubID;
            const basePrize = jackpot.basePrize;
            const curJackpot = jackpot.jackpot;
            const maxBase = jackpot.maxBasePrize;
            const minPrize = jackpot.minPrize;
            const maxPrize = jackpot.maxPrize;
            let rate = curJackpot /3000;
            if (rate <1) rate = Math.max(basePrize/1000/3000, rate);
            const linked = jackpot.linked;
            const linkedKey = jackpot.linkedKey;

            const zoneJackpot = SlotJackpotManager.Instance().getZoneJackpotInfo(zoneId);
            if (SDefine.VIP_LOUNGE_ZONEID < zoneId) continue;
            if (!zoneJackpot) {
                console.error(`_initCasinoJackpot getZoneJackpotInfo fail: ${zoneId}`);
                continue;
            }
            zoneJackpot.setJackpotMoney(subId, basePrize, curJackpot, maxBase, rate, minPrize, maxPrize, linked, linkedKey, "");
        }
        this.updateFavoriteSlot();
    }

    private updateFavoriteSlot(): void {
        const favSlots = ServerStorageManager.getAsStringArray(StorageKeyType.SLOT_FAVORITE);
        if (!TSUtility.isValid(favSlots) || favSlots.length <=0) return;
        const zoneInfo = this.slotZoneInfo[SDefine.VIP_LOUNGE_ZONEID];
        if (!TSUtility.isValid(zoneInfo)) return;
        const slotList = zoneInfo.slotList;
        if (!TSUtility.isValid(slotList) || slotList.length <=0) return;

        const delSlots: string[] = [];
        for (let i=0; i<favSlots.length; i++) {
            const slotId = favSlots[i];
            if (!TSUtility.isValid(slotId)) continue;
            const slot = slotList.find(s => s.slotID === slotId);
            if (!slot) delSlots.push(slotId);
        }

        if (delSlots.length <=0) return;
        for (const slotId of delSlots) {
            const idx = favSlots.indexOf(slotId);
            if (idx >=0) favSlots.splice(idx,1);
        }
        ServerStorageManager.save(StorageKeyType.SLOT_FAVORITE, favSlots);
    }

    public resetCasinoJackpot(): void {
        this.asyncRefreshJackpotInfo(true);
    }

    // public facebookShare(shareData: any, cb?: Function): void {
    //     PopupManager.Instance().showDisplayProgress(true);
    //     CommonServer.Instance().requestgetNewShareInfo(this.getUid(), this.getAccessToken(), (res) => {
    //         PopupManager.Instance().showDisplayProgress(false);
    //         if (CommonServer.isServerResponseError(res)) {
    //             if (cb) cb();
    //             return;
    //         }
    //         shareData.subInfo.cid = res.couponID;
    //         FacebookUtil.shareUi(shareData, cb);
    //     });
    // }

    // public facebookShareWithShareType(shareData: any, type: number, fbShareData: any, cb?: Function): void {
    //     PopupManager.Instance().showDisplayProgress(true);
    //     CommonServer.Instance().requestgetWinShareInfo(this.getUid(), this.getAccessToken(), type, (res) => {
    //         PopupManager.Instance().showDisplayProgress(false);
    //         if (CommonServer.isServerResponseError(res)) {
    //             if (cb) cb();
    //             return;
    //         }
    //         fbShareData.subInfo.cid = res.couponID;
    //         FacebookUtil.shareUi(fbShareData, cb);
    //     });
    // }

    // public fbInstantShareWithShareType(img: string, text: string, shareData: any, type: number, cb?: Function): void {
    //     PopupManager.Instance().showDisplayProgress(true);
    //     CommonServer.Instance().requestgetWinShareInfo(this.getUid(), this.getAccessToken(), type, (res) => {
    //         PopupManager.Instance().showDisplayProgress(false);
    //         if (CommonServer.isServerResponseError(res)) {
    //             if (cb) cb();
    //             return;
    //         }
    //         shareData.subInfo.cid = res.couponID;
    //         const dataStr = JSON.stringify(shareData.subInfo);
    //         const b64 = TSUtility.btoa(dataStr);
    //         console.log("fbInstantShareWithShareType " + dataStr + " / " + b64);
    //         (window as any).FBInstant.shareAsync({
    //             image: img,
    //             text: text,
    //             data: {
    //                 hrv_source: "FBInstant_Share",
    //                 hrv_shareinfo: b64
    //             }
    //         }).then(() => {
    //             if (cb) cb();
    //         }).catch((e: Error) => {
    //             console.log(e.message);
    //             if (cb) cb();
    //         });
    //     });
    // }

    // public onBeforeUnloadWeb(): void {
    //     CommonServer.Instance().requestLogout(this.getUid(), this.getAccessToken());
    // }

    // public contains(arr: any[], val: any): boolean {
    //     for (let i=arr.length; i--;) {
    //         if (arr[i] === val) return true;
    //     }
    //     return false;
    // }

    // public buyProduct_DEV(): void {}

    // public buyProduct(productId: string, popupType: string, extraInfo: string, cb: Function): void {
    //     if (NativeUtil.isFacebookWeb()) {
    //         this.facebookBuyProduct(productId, popupType, extraInfo, cb);
    //         return;
    //     }
    //     if (NativeUtil.isFacebookInstant()) {
    //         const apis = (window as any).FBInstant.getSupportedAPIs();
    //         if (this.contains(apis, "payments.purchaseAsync")) {
    //             this.fbInstantBuyProduct(productId, popupType, extraInfo, cb);
    //         } else {
    //             if (SDefine.FB_Instant_iOS_Shop_Flag ===1) {
    //                 CommonPopup.getCommonPopup((err, popup) => {
    //                     popup.open().setInfo("PURCHASE ERROR", "HAVING TROUBLE PURCHASING?").setOkBtn("HELP CENTER", () => {
    //                         UserInfo.goCustomerSupport();
    //                     });
    //                 });
    //                 cb(null);
    //                 return;
    //             }
    //             CommonPopup.getCommonPopup((err, popup) => {
    //                 popup.open().setInfo("Notice", "We encountered a temporary issue while retrieving payment methods. \nPlease try again in a few minutes.", false).setOkBtn("OK", () => {});
    //             });
    //             console.log("instant purchaseAsync not supported");
    //             cb(null);
    //         }
    //         return;
    //     }
    //     if (sys.os === sys.OS.ANDROID) {
    //         if (SDefine.Mobile_IAP_Renewal ===1) {
    //             this.playstoreBuyProduct_Renewal(productId, popupType, extraInfo, cb);
    //         } else {
    //             this.playstoreBuyProduct(productId, popupType, extraInfo, cb);
    //         }
    //         return;
    //     }
    //     if (sys.os === sys.OS.IOS) {
    //         if (SDefine.Mobile_IAP_Renewal ===1) {
    //             this.iosBuyProduct_Renewal(productId, popupType, extraInfo, cb);
    //         } else {
    //             this.iosBuyProduct(productId, popupType, extraInfo, cb);
    //         }
    //         return;
    //     }
    //     console.error("buyProduct fail.");
    //     cb(null);
    // }

    // public async asyncCheckAndAcceptPromotion_DailyStampPremium(productId: string): Promise<void> {
    //     if (productId !== SDefine.PRODUCT_DAILY_STAMP_PREMIUM) return;
    //     const promo = UserInfo.instance()!.getPromotionInfo(UserPromotion.DailyStampV2Promotion.PromotionKeyName);
    //     if (!TSUtility.isValid(promo)) return;
    //     DailyStampManager.instance.setDailyStampV2Promotion(promo);
        
    //     let flag =0, endDate=0;
    //     const seasonPromo = ShopPromotionManager.Instance().getSeasonalPromotionInfo_LastPromotion();
    //     if (TSUtility.isValid(seasonPromo)) {
    //         const day = DailyStampManager.instance.getDailyStampAccumulatedDay();
    //         const reward = DailyStampManager.instance.getAccumulatedDayRewardDataByDay(day);
    //         if (TSUtility.isValid(reward) && TSUtility.isValid(reward.Coupon)) {
    //             flag =1;
    //             endDate = seasonPromo.endDate;
    //         }
    //     }

    //     const res = await CommonServer.Instance().asyncRequestAcceptPromotion(UserInfo.instance()!.getUid(), UserInfo.instance()!.getAccessToken(), UserPromotion.DailyStampV2Promotion.PromotionKeyName, flag, endDate, "");
    //     if (CommonServer.isServerResponseError(res)) return;
    //     const changeRes = UserInfo.instance()!.getServerChangeResult(res);
    //     UnprocessedPurchaseManager.Instance().setDailyStampV2ChangeResult_Promotion(changeRes);
    // }

    // public async asyncPlaystoreExceptionBuyProduct(data: any): Promise<void> {
    //     const history = await IAPManager.Instance().asyncGetPlaystorePurchaseHistory(data.playstoreId);
    //     if (!history) {
    //         console.error("asyncPlaystoreExceptionBuyProduct not found history " + JSON.stringify(data));
    //         return;
    //     }
    //     const req = new IAPManager.PlayStoreBuyProductReq();
    //     req.uid = this.getUid();
    //     req.productId = data.productId;
    //     req.popupType = data.popupType;
    //     req.extraInfo = data.extraInfo;
    //     const receipt = new IAPManager.PlayStorePurchaseReceipt();
    //     receipt.packageName = NativeUtil.getPackageName();
    //     receipt.productId = data.playstoreId;
    //     receipt.purchaseToken = history.purchaseToken;
    //     req.receipt = JSON.stringify(receipt);
        
    //     IAPManager.Instance().finishTransaction(data.playstoreId);
    //     PopupManager.Instance().showDisplayProgress(true);
    //     CommonServer.Instance().requestPlayStoreBuyProduct(UserInfo.instance()!.getUid(), UserInfo.instance()!.getAccessToken(), req, (res) => {
    //         PopupManager.Instance().showDisplayProgress(false);
    //         if (!CommonServer.isServerResponseError(res)) {
    //             const changeRes = UserInfo.instance()!.getServerChangeResult(res);
    //             UserInfo.instance()!.applyChangeResult(changeRes);
    //         }
    //     });
    // }

    // public playstoreBuyProduct(productId: string, popupType: string, extraInfo: string, cb: Function): void {
    //     const self = this;
    //     PopupManager.Instance().showDisplayProgress(true);
    //     const product = ProductConfig.Instance().getProductInfo(productId);
    //     const trace = Math.floor(100000 * Math.random()).toString();
    //     console.log("playstoreBuyProduct " + product.playstoreId);
    //     Analytics.initiateCheckout(product.buyMoney, product.buyCurrency, product.productId);
        
    //     const log = new Error(`playstoreBuyProduct purchase start [trace:${trace}][pid:${productId}][${TSUtility.getServerBaseNowUnixTime().toString()}]`);
    //     FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FireHoseSender.FHLogType.Trace, log), true, FireHoseSender.FHLogType.Trace);
    //     LocalStorageManager.setPlaystorePurchaseInfo(productId, product.playstoreId, popupType, extraInfo);

    //     IAPManager.Instance().purchase(product.playstoreId, (receipt, err) => {
    //         LocalStorageManager.resetPlaystorePurchaseInfo();
    //         PopupManager.Instance().showDisplayProgress(false);
    //         if (!receipt) {
    //             const errMsg = err ? err : "undefined";
    //             const logErr = new Error(`playstoreBuyProduct IAPManager.Instance().purchase stopped [trace:${trace}][pid:${productId}][${errMsg}][${TSUtility.getServerBaseNowUnixTime().toString()}]`);
    //             FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FireHoseSender.FHLogType.Trace, logErr), true, FireHoseSender.FHLogType.Trace);
    //             cb(null);
    //             return;
    //         }
    //         const logSucc = new Error(`playstoreBuyProduct IAPManager.Instance().purchase success [trace:${trace}][pid:${productId}][${TSUtility.getServerBaseNowUnixTime().toString()}]`);
    //         FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FireHoseSender.FHLogType.Trace, logSucc), true, FireHoseSender.FHLogType.Trace);

    //         const req = new IAPManager.PlayStoreBuyProductReq();
    //         req.uid = self.getUid();
    //         req.productId = productId;
    //         req.popupType = popupType;
    //         req.extraInfo = extraInfo;
    //         req.receipt = receipt.receipt;
    //         IAPManager.Instance().finishTransaction(product.playstoreId);

    //         PopupManager.Instance().showDisplayProgress(true);
    //         CommonServer.Instance().requestPlayStoreBuyProduct(UserInfo.instance()!.getUid(), UserInfo.instance()!.getAccessToken(), req, (res) => {
    //             PopupManager.Instance().showDisplayProgress(false);
    //             if (CommonServer.isServerResponseError(res)) {
    //                 const logErr = new Error(`playstoreBuyProduct Server Error [trace:${trace}][pid:${productId}][${JSON.stringify(res)}][${TSUtility.getServerBaseNowUnixTime().toString()}]`);
    //                 FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FireHoseSender.FHLogType.Exception, logErr), true, FireHoseSender.FHLogType.Exception);
    //                 self.openCommonPopup_PurchaseError();
    //                 console.error("playstoreBuyProduct fail");
    //                 cb(null);
    //                 return;
    //             }
    //             const logSucc2 = new Error(`playstoreBuyProduct Purchase Success [${TSUtility.getServerBaseNowUnixTime().toString()}]`);
    //             FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FireHoseSender.FHLogType.Trace, logSucc2), true, FireHoseSender.FHLogType.Trace);
    //             self.appsflyerTrackPurchaseAndroid(popupType, productId, product.buyMoney);
    //             Analytics.Purchase(product.buyMoney, "USD", productId, "PRODUCT");
    //             if (UserInfo.instance()!.getUserServiceInfo().totalPurchaseCnt ===0) {
    //                 Analytics.FirstPurchase(product.buyMoney, "USD", productId);
    //             }
    //             UserInfo.instance()!.getUserServiceInfo().lastPurchaseDate = TSUtility.getServerBaseNowUnixTime();
    //             FacebookUtil.logPurchase(product.buyMoney, product.buyCurrency);
    //             const changeRes = UserInfo.instance()!.getServerChangeResult(res);
    //             cb(changeRes);
    //         });
    //     });
    // }

    // public appsflyerTrackPurchaseAndroid(popupType: string, productId: string, money: number): void {
    //     if (SDefine.Mobile_AF_PurchaseConnector_Use) return;
    //     if (SDefine.Mobile_AF_PurchaseLog_Revenue_Rounding) {
    //         NativeUtil.appsflyerTrackPurchaseAndroid(popupType, productId, money);
    //     } else {
    //         NativeUtil.appsflyerTrackPurchaseAndroidVer2(popupType, productId, money);
    //     }
    // }

    // public appsflyerTrackPurchaseIOS(popupType: string, productId: string, money: number): void {
    //     if (SDefine.Mobile_AF_PurchaseConnector_Use) return;
    //     NativeUtil.appsflyerTrackPurchaseIOS(popupType, productId, money);
    // }

    // public async asyncPlaystoreExceptionBuyProduct_Renewal(data: any): Promise<void> {
    //     const dataStr = JSON.stringify(data);
    //     const payload = PurchasePayload_SmallInfo.parseObj(JSON.parse(data.obfuscatedAccountId));
    //     const payloadStr = JSON.stringify(payload);
    //     const log = new Error(`asyncPlaystoreExceptionBuyProduct_Renewal start [${dataStr}][${payloadStr}]`);
    //     FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Trace, log), true, FHLogType.Trace);
        
    //     Analytics.unprocessedReceiptStart({ purchaseInfo: data, payload: payload });
    //     const req = new PlayStoreBuyProductReq() as any;
    //     req.uid = this.getUid();
    //     req.productId = payload.getProductId();
    //     req.popupType = "";
    //     req.extraInfo = payload.getExtraInfo();
    //     req.receipt = dataStr;

    //     await this.asyncCheckAndAcceptPromotion_DailyStampPremium(payload.getProductId());
    //     const res = await CommonServer.Instance().asyncRequestPlayStoreBuyProduct(UserInfo.instance()!.getUid(), UserInfo.instance()!.getAccessToken(), req);
    //     if (CommonServer.isServerResponseError(res)) {
    //         const logErr = new Error(`asyncPlaystoreExceptionBuyProduct_Renewal fail [${dataStr}][${JSON.stringify(res)}]`);
    //         FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Trace, logErr), true, FHLogType.Trace);
    //         Analytics.unprocessedReceiptFail({ payload: payload, server: res });
    //         if (CommonServer.getErrorCode(res) === SDefine.ERR_PAYMENT_ALREADY_EXIST) {
    //             const logDup = new Error(`asyncPlaystoreExceptionBuyProduct_Renewal ERR_PAYMENT_ALREADY_EXIST [${dataStr}]`);
    //             FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Trace, logDup), true, FHLogType.Trace);
    //             Analytics.unprocessedReceiptSuccess({ payload: payload, reason: "ERR_PAYMENT_ALREADY_EXIST" });
    //             IAPManager_AOS.Instance().consume(data.purchaseToken);
    //         }
    //         return;
    //     }
    //     const logSucc = new Error(`asyncPlaystoreExceptionBuyProduct_Renewal success [${dataStr}]`);
    //     FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Trace, logSucc), true, FHLogType.Trace);
    //     Analytics.unprocessedReceiptSuccess({ payload: payload });
    //     IAPManager_AOS.Instance().consume(data.purchaseToken);
    //     const changeRes = UserInfo.instance()!.getServerChangeResult(res);
    //     await this.asyncOpenUnProcessedInfoPopup(UnProcessedPopupInfo.newInst(payload.getProductId(), data.purchaseTime, changeRes));
    // }

    // public async asyncTestCanvasUnProcessedPurchase(): Promise<void> {}

    // public async asyncFacebookBuyProduct(productId: string, popupType: string, extraInfo: string): Promise<any> {
    //     return new Promise((resolve) => {
    //         this.facebookBuyProduct(productId, popupType, extraInfo, (res) => {
    //             resolve(res);
    //         });
    //     });
    // }

    // public async asyncOpenUnProcessedInfoPopup(data: any): Promise<void> {
    //     return new Promise((resolve) => {
    //         const changeRes = data.changeResult;
    //         let seq = -1;
    //         const item = changeRes.itemHist.find((i: any) => i.itemId === SDefine.I_DAILY_STAMP_PREMIUM && i.addCnt <0);
    //         if (item) {
    //             seq = item.seq;
    //             const split1 = changeRes.splitChangeResult(seq);
    //             const split2 = changeRes.splitChangeResult_Inbox();
    //             split1.addChangeResult(split2);
    //             UnprocessedPurchaseManager.Instance().setDailyStampV2ChangeResult_ItemUse(split1);
    //         }
    //         UnProgressedPurchasePopup.getPopup((err, popup) => {
    //             if (err) {
    //                 const log = new Error(`asyncOpenUnProcessedInfoPopup fail [${JSON.stringify(err)}]`);
    //                 FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Trace, log), true, FHLogType.Trace);
    //                 UserInfo.instance()!.applyChangeResult(data.changeResult);
    //                 resolve();
    //                 return;
    //             }
    //             popup.open();
    //             popup.setInfo(data);
    //             popup.setCloseCallback(() => {
    //                 resolve();
    //             });
    //         });
    //     });
    // }

    // // ===================== 公共方法区 =====================
    // public playstoreBuyProduct_Renewal(productId: string, popupType: number, extraInfo: string, callback: Function): void {
    //     const self = this;
    //     const productInfo = ProductConfig.Instance().getProductInfo(productId);
    //     const randomKey = Math.floor(1e5 * Math.random()).toString();
    //     const purchaseInfo = new LocalPlayStorePurchaseInfo();
    //     purchaseInfo.productId = productId;
    //     purchaseInfo.playstoreId = productInfo.playstoreId;
    //     purchaseInfo.popupType = popupType;
    //     purchaseInfo.extraInfo = extraInfo;
    //     purchaseInfo.randomKey = randomKey;

    //     const payload = JSON.stringify(purchaseInfo);
    //     const smallInfo = PurchasePayload_SmallInfo.parseFromInfo(productId, extraInfo);
    //     log("playstoreBuyProduct_Renewal " + productInfo.playstoreId);
    //     Analytics.default.initiateCheckout(productInfo.buyMoney, productInfo.buyCurrency, productInfo.productId);

    //     const startError = new Error(`playstoreBuyProduct_Renewal native purchase start [payload:${payload}]`);
    //     FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, startError), true, FireHoseSender.FHLogType.Trace);
    //     LoadingPopup.default.Instance().showDisplayProgress(true);

    //     IAPManager_AOS.default.Instance().purchase(productInfo.playstoreId, smallInfo, async (purchaseResult: any) => {
    //         LoadingPopup.default.Instance().showDisplayProgress(false);
    //         const endError = new Error(`playstoreBuyProduct_Renewal native purchase end [result:${JSON.stringify(purchaseResult)}][payload:${payload}]`);
    //         FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, endError), true, FireHoseSender.FHLogType.Trace);

    //         if (purchaseResult.isError() === 1) {
    //             Analytics.default.purchasePlatformFail({ payload: purchaseInfo, result: purchaseResult });
    //             callback(null);
    //             return;
    //         }

    //         if (SDefine.default.IAP_ReserveUnprocessedReceipt_Test === 1) {
    //             SDefine.default.IAP_ReserveUnprocessedReceipt_Test = false;
    //             Analytics.default.purchaseFail({ payload: purchaseInfo, result: purchaseResult, message: "IAP_ReserveUnprocessedReceipt_Test" });
    //             self.openCommonPopup_PurchaseError();
    //             error("IAP_ReserveUnprocessedReceipt_Test");
    //             callback(null);
    //             return;
    //         }

    //         Analytics.default.purchasePlatformSuccess({ payload: purchaseInfo, result: purchaseResult });
    //         const req = new PlayStoreBuyProductReq();
    //         req.uid = self.getUid();
    //         req.productId = productId;
    //         req.popupType = popupType;
    //         req.extraInfo = extraInfo;
    //         req.receipt = purchaseResult.receiptStr;

    //         LoadingPopup.default.Instance().showDisplayProgress(true);
    //         CommonServer.default.Instance().requestPlayStoreBuyProduct(ServiceInfoManager.instance().getUid(), ServiceInfoManager.instance().getAccessToken(), req, (serverRes: any) => {
    //             LoadingPopup.default.Instance().showDisplayProgress(false);
    //             if (SDefine.default.IAP_ServerResponseFail_Test === 1) {
    //                 SDefine.default.IAP_ServerResponseFail_Test = false;
    //                 Analytics.default.purchaseFail({ payload: purchaseInfo, result: purchaseResult, server: serverRes, message: "IAP_ServerResponseFail_Test" });
    //                 self.openCommonPopup_PurchaseError();
    //                 error("IAP_ServerResponseFail_Test");
    //                 callback(null);
    //                 return;
    //             }

    //             if (CommonServer.default.isServerResponseError(serverRes)) {
    //                 const err = new Error(`playstoreBuyProduct_Renewal Server Error [${JSON.stringify(serverRes)}][payload:${payload}]`);
    //                 FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Exception, err), true, FireHoseSender.FHLogType.Exception);
    //                 Analytics.default.purchaseFail({ payload: purchaseInfo, result: purchaseResult, server: serverRes });
    //                 error("playstoreBuyProduct_Renewal fail");
    //                 self.openCommonPopup_PurchaseError();
    //                 callback(null);
    //                 return;
    //             }

    //             const sucError = new Error(`playstoreBuyProduct_Renewal Purchase Success [payload:${payload}]`);
    //             FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, sucError), true, FireHoseSender.FHLogType.Trace);
    //             IAPManager_AOS.default.Instance().consume(purchaseResult.receiptInfo.purchaseToken);
    //             self.appsflyerTrackPurchaseAndroid(popupType, productId, productInfo.buyMoney);
    //             Analytics.default.Purchase(productInfo.buyMoney, "USD", productId, "PRODUCT");
                
    //             if (ServiceInfoManager.instance().getUserServiceInfo().totalPurchaseCnt === 0) {
    //                 Analytics.default.FirstPurchase(productInfo.buyMoney, "USD", productId);
    //             }
                
    //             HRVServiceUtil.default.logPurchase(productInfo.buyMoney, productInfo.buyCurrency);
    //             ServiceInfoManager.instance().getUserServiceInfo().lastPurchaseDate = TSUtility.default.getServerBaseNowUnixTime();
    //             const changeResult = ServiceInfoManager.instance().getServerChangeResult(serverRes);
    //             callback(changeResult);
    //         });
    //     });
    // }

    // public async asyncIOSExceptionBuyProduct(params: any): Promise<void> {
    //     const receipt = NativeUtil.getRemainTransactionReceiptIOS();
    //     if (receipt === "") {
    //         error("asyncIOSExceptionBuyProduct not found history " + JSON.stringify(params));
    //         return;
    //     }

    //     IAPManager.default.Instance().finishTransaction(params.appstoreId);
    //     const req = new IOSAppstoreBuyProductReq();
    //     req.uid = this.getUid();
    //     req.productId = params.productId;
    //     req.popupType = params.popupType;
    //     req.extraInfo = params.extraInfo;
    //     req.receipt = receipt;

    //     LoadingPopup.default.Instance().showDisplayProgress(true);
    //     CommonServer.default.Instance().requestIOSAppstoreBuyProduct(ServiceInfoManager.instance().getUid(), ServiceInfoManager.instance().getAccessToken(), req, (serverRes: any) => {
    //         LoadingPopup.default.Instance().showDisplayProgress(false);
    //         if (!CommonServer.default.isServerResponseError(serverRes)) {
    //             const changeResult = ServiceInfoManager.instance().getServerChangeResult(serverRes);
    //             ServiceInfoManager.instance().applyChangeResult(changeResult);
    //         }
    //     });
    // }

    // public async asyncFacebookExceptionBuyProduct(): Promise<void> {
    //     const req = new FBBuyProductRetryReq();
    //     CommonServer.default.Instance().requestFacebookRetryBuyProduct(ServiceInfoManager.instance().getUid(), ServiceInfoManager.instance().getAccessToken(), req, (serverRes: any) => {
    //         if (!CommonServer.default.isServerResponseError(serverRes)) {
    //             const changeResult = ServiceInfoManager.instance().getServerChangeResult(serverRes);
    //             ServiceInfoManager.instance().applyChangeResult(changeResult);
    //         }
    //     });
    // }

    // public async asyncRetryFacebookBuyProduct(req: any, callback: Function): Promise<void> {
    //     let retryCount = 0;
    //     const maxRetry = 12;
    //     while (retryCount < maxRetry) {
    //         await AsyncHelper.default.delayWithComponent(3, this);
    //         const serverRes = await CommonServer.default.Instance().asyncRequestFacebookRetryBuyProduct(ServiceInfoManager.instance().getUid(), ServiceInfoManager.instance().getAccessToken(), req);
    //         if (!CommonServer.default.isServerResponseError(serverRes) && CommonServer.default.getServerChangeResult(serverRes).hasAnyAssetChange() !== 0) {
    //             callback(serverRes);
    //             return;
    //         }
    //         retryCount++;
    //     }
    //     callback(null);
    // }

    // public iosBuyProduct(productId: string, popupType: number, extraInfo: string, callback: Function): void {
    //     const self = this;
    //     LoadingPopup.default.Instance().showDisplayProgress(true);
    //     const productInfo = ProductConfig.Instance().getProductInfo(productId);
    //     const randomKey = Math.floor(1e5 * Math.random()).toString();

    //     log("iosBuyProduct " + productInfo.appstoreId);
    //     Analytics.default.initiateCheckout(productInfo.buyMoney, productInfo.buyCurrency, productInfo.productId);

    //     const startError = new Error(`iosBuyProduct purchase start [trace:${randomKey}][pid:${productId}][${TSUtility.default.getServerBaseNowUnixTime().toString()}]`);
    //     FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, startError), true, FireHoseSender.FHLogType.Trace);
    //     LocalStorageManager.default.setIOSPurchaseInfo(productId, productInfo.appstoreId, popupType, extraInfo, productInfo.buyMoney, productInfo.buyCurrency);

    //     IAPManager.default.Instance().purchase(productInfo.appstoreId, (purchaseResult: any, errMsg: string) => {
    //         LocalStorageManager.default.resetIOSPurchaseInfo();
    //         LoadingPopup.default.Instance().showDisplayProgress(false);
    //         if (purchaseResult === null) {
    //             const errStr = errMsg ? errMsg : "undefined";
    //             const err = new Error(`iosBuyProduct IAPManager.Instance().purchase stopped [trace:${randomKey}][pid:${productId}][${errStr}][${TSUtility.default.getServerBaseNowUnixTime().toString()}]`);
    //             FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, err), true, FireHoseSender.FHLogType.Trace);
    //             callback(null);
    //             return;
    //         }

    //         const sucError = new Error(`iosBuyProduct IAPManager.Instance().purchase success [trace:${randomKey}][pid:${productId}][${TSUtility.default.getServerBaseNowUnixTime().toString()}]`);
    //         FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, sucError), true, FireHoseSender.FHLogType.Trace);
    //         log("IAPManager purchase success productInfo " + JSON.stringify(purchaseResult));

    //         const req = new IOSAppstoreBuyProductReq();
    //         req.uid = self.getUid();
    //         req.productId = productId;
    //         req.popupType = popupType;
    //         req.extraInfo = extraInfo;
    //         req.receipt = purchaseResult.receiptCipheredPayload;

    //         IAPManager.default.Instance().finishTransaction(productInfo.appstoreId);
    //         LoadingPopup.default.Instance().showDisplayProgress(true);
    //         CommonServer.default.Instance().requestIOSAppstoreBuyProduct(ServiceInfoManager.instance().getUid(), ServiceInfoManager.instance().getAccessToken(), req, (serverRes: any) => {
    //             LoadingPopup.default.Instance().showDisplayProgress(false);
    //             if (CommonServer.default.isServerResponseError(serverRes)) {
    //                 const err = new Error(`iosBuyProduct Server Error [trace:${randomKey}][pid:${productId}][${serverRes}][${TSUtility.default.getServerBaseNowUnixTime().toString()}]`);
    //                 FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Exception, err), true, FireHoseSender.FHLogType.Exception);
    //                 self.openCommonPopup_PurchaseError();
    //                 error("iosBuyProduct fail");
    //                 callback(null);
    //                 return;
    //             }

    //             const finalErr = new Error(`iosBuyProduct Purchase Success [${TSUtility.default.getServerBaseNowUnixTime().toString()}]`);
    //             FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, finalErr), true, FireHoseSender.FHLogType.Trace);
    //             self.appsflyerTrackPurchaseIOS(popupType, productId, productInfo.buyMoney);
    //             NativeUtil.liftoffRecordEventPurchase_IOS(productInfo.buyMoney);
    //             Analytics.default.Purchase(productInfo.buyMoney, "USD", productId, "PRODUCT");
                
    //             if (ServiceInfoManager.instance().getUserServiceInfo().totalPurchaseCnt === 0) {
    //                 Analytics.default.FirstPurchase(productInfo.buyMoney, "USD", productId);
    //             }
                
    //             ServiceInfoManager.instance().getUserServiceInfo().lastPurchaseDate = TSUtility.default.getServerBaseNowUnixTime();
    //             HRVServiceUtil.default.logPurchase(productInfo.buyMoney, productInfo.buyCurrency);
    //             const changeResult = ServiceInfoManager.instance().getServerChangeResult(serverRes);
    //             callback(changeResult);
    //         });
    //     });
    // }

    // public async asyncIOSExceptionBuyProduct_Renewal(params: any): Promise<void> {
    //     const paramStr = JSON.stringify(params);
    //     Analytics.default.unprocessedReceiptStart({ transaction: params });
    //     const localInfo = LocalStorageManager.default.getIOSPurchaseInfo_Renewal(params.productIdentifier);

    //     if (!localInfo) {
    //         const err = new Error(`asyncIOSExceptionBuyProduct_Renewal not found localInfo [${paramStr}]`);
    //         FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, err), true, FireHoseSender.FHLogType.Trace);
    //         Analytics.default.unprocessedReceiptFail({ transaction: params, reason: "not found localInfo" });
    //         return;
    //     }

    //     const localInfoStr = JSON.stringify(localInfo);
    //     const receipt = IAPManager_iOS.default.Instance().getReceiptCode_iOS();
    //     const startErr = new Error(`asyncIOSExceptionBuyProduct_Renewal start [${localInfoStr}][${paramStr}][${receipt}]`);
    //     FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, startErr), true, FireHoseSender.FHLogType.Trace);

    //     if (receipt === "") {
    //         error("asyncIOSExceptionBuyProduct_Renewal not found receipt");
    //         Analytics.default.unprocessedReceiptFail({ transaction: params, reason: "not found receipt" });
    //         return;
    //     }

    //     const req = new IOSAppstoreBuyProductReq();
    //     req.uid = this.getUid();
    //     req.productId = localInfo.productId;
    //     req.popupType = localInfo.popupType;
    //     req.extraInfo = localInfo.extraInfo;
    //     req.receipt = receipt;

    //     await this.asyncCheckAndAcceptPromotion_DailyStampPremium(localInfo.getProductId());
    //     const serverRes = await CommonServer.default.Instance().asyncRequestIOSAppstoreBuyProduct(ServiceInfoManager.instance().getUid(), ServiceInfoManager.instance().getAccessToken(), req);

    //     if (CommonServer.default.isServerResponseError(serverRes)) {
    //         const err = new Error(`asyncIOSExceptionBuyProduct_Renewal fail [${localInfoStr}][${JSON.stringify(serverRes)}]`);
    //         FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, err), true, FireHoseSender.FHLogType.Trace);
    //         Analytics.default.unprocessedReceiptFail({ payload: localInfo, receipt: receipt, server: serverRes });
            
    //         if (CommonServer.default.getErrorCode(serverRes) === SDefine.default.ERR_PAYMENT_ALREADY_EXIST) {
    //             const existErr = new Error(`asyncIOSExceptionBuyProduct_Renewal ERR_PAYMENT_ALREADY_EXIST [${paramStr}]`);
    //             FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, existErr), true, FireHoseSender.FHLogType.Trace);
    //             Analytics.default.unprocessedReceiptSuccess({ payload: localInfo, reason: "ERR_PAYMENT_ALREADY_EXIST" });
    //             IAPManager_iOS.default.Instance().finishTransaction(localInfo.appstoreId);
    //         }
    //         return;
    //     }

    //     IAPManager_iOS.default.Instance().finishTransaction(localInfo.appstoreId);
    //     const changeResult = ServiceInfoManager.instance().getServerChangeResult(serverRes);
    //     await this.asyncOpenUnProcessedInfoPopup(UnprocessedPurchaseManager.UnProcessedPopupInfo.newInst(localInfo.getProductId(), params.transactionTimeStamp, changeResult));
        
    //     const sucErr = new Error(`asyncIOSExceptionBuyProduct_Renewal success [${localInfoStr}]`);
    //     FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, sucErr), true, FireHoseSender.FHLogType.Trace);
    //     Analytics.default.unprocessedReceiptSuccess({ payload: localInfo });
    // }

    // public iosBuyProduct_Renewal(productId: string, popupType: number, extraInfo: string, callback: Function): void {
    //     const self = this;
    //     LoadingPopup.default.Instance().showDisplayProgress(true);
    //     const productInfo = ProductConfig.Instance().getProductInfo(productId);
    //     const randomKey = Math.floor(1e5 * Math.random()).toString();
    //     const purchaseInfo = new LocalIOSPurchaseInfo();
        
    //     purchaseInfo.productId = productId;
    //     purchaseInfo.appstoreId = productInfo.appstoreId;
    //     purchaseInfo.popupType = popupType;
    //     purchaseInfo.extraInfo = extraInfo;
    //     purchaseInfo.randomKey = randomKey;

    //     const payload = JSON.stringify(purchaseInfo);
    //     log("iosBuyProduct_Renewal " + productInfo.appstoreId);
    //     Analytics.default.initiateCheckout(productInfo.buyMoney, productInfo.buyCurrency, productInfo.productId);

    //     const startErr = new Error(`iosBuyProduct_Renewal purchase start [payload:${payload}]`);
    //     FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, startErr), true, FireHoseSender.FHLogType.Trace);
    //     LoadingPopup.default.Instance().showDisplayProgress(true);
    //     LocalStorageManager.default.setIOSPurchaseInfo_Renewal(purchaseInfo.appstoreId, purchaseInfo);

    //     IAPManager_iOS.default.Instance().purchase(productInfo.appstoreId, (purchaseResult: any) => {
    //         LoadingPopup.default.Instance().showDisplayProgress(false);
    //         const endErr = new Error(`iosBuyProduct_Renewal purchase end [result:${JSON.stringify(purchaseResult)}][payload:${payload}]`);
    //         FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, endErr), true, FireHoseSender.FHLogType.Trace);

    //         if (purchaseResult.isError() === 1) {
    //             Analytics.default.purchasePlatformFail({ payload: purchaseInfo, result: purchaseResult });
    //             callback(null);
    //             return;
    //         }

    //         const receipt = IAPManager_iOS.default.Instance().getReceiptCode_iOS();
    //         if (receipt === "") {
    //             Analytics.default.purchasePlatformFail({ payload: purchaseInfo, result: purchaseResult, reason: "not found receipt" });
    //             IAPManager_iOS.default.Instance().finishTransaction(purchaseInfo.appstoreId);
    //             self.openCommonPopup_PurchaseError();
    //             callback(null);
    //             return;
    //         }

    //         if (SDefine.default.IAP_ReserveUnprocessedReceipt_Test === 1) {
    //             SDefine.default.IAP_ReserveUnprocessedReceipt_Test = false;
    //             Analytics.default.purchaseFail({ payload: purchaseInfo, result: purchaseResult, message: "IAP_ReserveUnprocessedReceipt_Test" });
    //             self.openCommonPopup_PurchaseError();
    //             error("IAP_ReserveUnprocessedReceipt_Test");
    //             callback(null);
    //             return;
    //         }

    //         const receiptErr = new Error(`iosBuyProduct_Renewal receipt [receipt:${receipt}][payload:${payload}]`);
    //         FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, receiptErr), true, FireHoseSender.FHLogType.Trace);
    //         Analytics.default.purchasePlatformSuccess({ payload: purchaseInfo, result: purchaseResult, receipt: receipt });

    //         const req = new IOSAppstoreBuyProductReq();
    //         req.uid = self.getUid();
    //         req.productId = productId;
    //         req.popupType = popupType;
    //         req.extraInfo = extraInfo;
    //         req.receipt = receipt;

    //         LoadingPopup.default.Instance().showDisplayProgress(true);
    //         CommonServer.default.Instance().requestIOSAppstoreBuyProduct(ServiceInfoManager.instance().getUid(), ServiceInfoManager.instance().getAccessToken(), req, (serverRes: any) => {
    //             LoadingPopup.default.Instance().showDisplayProgress(false);
    //             if (SDefine.default.IAP_ServerResponseFail_Test === 1) {
    //                 SDefine.default.IAP_ServerResponseFail_Test = false;
    //                 Analytics.default.purchaseFail({ payload: purchaseInfo, result: purchaseResult, server: serverRes, message: "IAP_ServerResponseFail_Test" });
    //                 self.openCommonPopup_PurchaseError();
    //                 error("IAP_ServerResponseFail_Test");
    //                 callback(null);
    //                 return;
    //             }

    //             if (CommonServer.default.isServerResponseError(serverRes)) {
    //                 const err = new Error(`iosBuyProduct Server Error [trace:${randomKey}][pid:${productId}][${serverRes}][${TSUtility.default.getServerBaseNowUnixTime().toString()}]`);
    //                 FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Exception, err), true, FireHoseSender.FHLogType.Exception);
    //                 Analytics.default.purchaseFail({ payload: purchaseInfo, result: purchaseResult, server: serverRes });
    //                 self.openCommonPopup_PurchaseError();
    //                 error("iosBuyProduct fail");
    //                 callback(null);
    //                 return;
    //             }

    //             const sucErr = new Error(`iosBuyProduct Purchase Success [payload:${payload}]`);
    //             FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, sucErr), true, FireHoseSender.FHLogType.Trace);
    //             IAPManager_iOS.default.Instance().finishTransaction(purchaseInfo.appstoreId);
    //             self.appsflyerTrackPurchaseIOS(popupType, productId, productInfo.buyMoney);
    //             NativeUtil.liftoffRecordEventPurchase_IOS(productInfo.buyMoney);
    //             Analytics.default.Purchase(productInfo.buyMoney, "USD", productId, "PRODUCT");
                
    //             if (ServiceInfoManager.instance().getUserServiceInfo().totalPurchaseCnt === 0) {
    //                 Analytics.default.FirstPurchase(productInfo.buyMoney, "USD", productId);
    //             }
                
    //             ServiceInfoManager.instance().getUserServiceInfo().lastPurchaseDate = TSUtility.default.getServerBaseNowUnixTime();
    //             HRVServiceUtil.default.logPurchase(productInfo.buyMoney, productInfo.buyCurrency);
    //             const changeResult = ServiceInfoManager.instance().getServerChangeResult(serverRes);
    //             callback(changeResult);
    //         });
    //     });
    // }

    // public facebookBuyProduct(productId: string, popupType: number, extraInfo: string, callback: Function): void {
    //     const self = this;
    //     LoadingPopup.default.Instance().showDisplayProgress(true);
    //     const productInfo = ProductConfig.Instance().getProductInfo(productId);
    //     Analytics.default.initiateCheckout(productInfo.buyMoney, productInfo.buyCurrency, productInfo.productId);

    //     const payUrl = `${CommonServer.default.Instance().getCommonServerUrl()}facebook/product/${productId}`;
    //     log("purchase product: " + payUrl);
    //     const payParams = { method: "pay", action: "purchaseitem", product: payUrl };
    //     const startErr = new Error(`ASYNC_Purchase facebookBuyProduct before sendUi ${JSON.stringify(payParams)} / ${TSUtility.default.getServerBaseNowUnixTime().toString()}`);
    //     FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, startErr), true, FireHoseSender.FHLogType.Trace);

    //     if (TSUtility.default.isLiveService() === 1) {
    //         HRVServiceUtil.default.sendUi(payParams, (fbRes: any) => {
    //             LoadingPopup.default.Instance().showDisplayProgress(false);
    //             const endErr = new Error(`ASYNC_Purchase facebookBuyProduct sendUi complete ${JSON.stringify(fbRes)} / ${TSUtility.default.getServerBaseNowUnixTime().toString()}`);
    //             FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, endErr), true, FireHoseSender.FHLogType.Trace);

    //             if (TSUtility.default.isValid(fbRes) === 0) {
    //                 log("facebookBuyProduct sendUi fail. response is undefined");
    //                 callback(null);
    //                 return;
    //             }

    //             if (TSUtility.default.isLiveService() === 1) {
    //                 self.inner_fbBuyProduct_live(fbRes, productId, popupType, extraInfo, callback);
    //             } else {
    //                 self.inner_fbBuyProduct_dev(fbRes, productId, popupType, extraInfo, callback);
    //             }
    //         });
    //     } else {
    //         this.inner_fbBuyProduct_test(null, productId, popupType, extraInfo, callback);
    //     }
    // }

    // public inner_fbBuyProductRetry(fbRes: any, productId: string, popupType: number, extraInfo: string, callback: Function): void {
    //     const productInfo = ProductConfig.Instance().getProductInfo(productId);
    //     LoadingPopup.default.Instance().showDisplayProgress(true);
    //     const retryReq = new FBBuyProductRetryReq();
    //     const buyReq = new FBBuyProductReq();
        
    //     buyReq.uid = this.getUid();
    //     buyReq.productId = productId;
    //     buyReq.paymentInfo = new FBPaymentOrderInfo();
    //     buyReq.popupType = popupType;
    //     buyReq.extraInfo = extraInfo;
    //     retryReq.buyProductRetryReq.push(buyReq);

    //     this.asyncRetryFacebookBuyProduct(retryReq, (serverRes: any) => {
    //         LoadingPopup.default.Instance().showDisplayProgress(false);
    //         if (serverRes === null) {
    //             PopupManager.getCommonPopup((err: any, popup: any) => {
    //                 if (err) return;
    //                 popup.open().setInfo("Oops!", "Your transaction process has been interrupted before completion. You may find support below.")
    //                     .setOkBtn("SUPPORT", () => { ServiceInfoManager.goCustomerSupport(); })
    //                     .setCancelBtn("CLOSE", null);
    //             });
    //             callback(null);
    //             return;
    //         }

    //         Analytics.default.Purchase(productInfo.buyMoney, productInfo.buyCurrency, productInfo.productId, "PRODUCT");
    //         if (ServiceInfoManager.instance().getUserServiceInfo().totalPurchaseCnt === 0) {
    //             Analytics.default.FirstPurchase(productInfo.buyMoney, productInfo.buyCurrency, productInfo.productId);
    //         }
    //         ServiceInfoManager.instance().getUserServiceInfo().lastPurchaseDate = TSUtility.default.getServerBaseNowUnixTime();
            
    //         const changeResult = ServiceInfoManager.instance().getServerChangeResult(serverRes);
    //         callback(changeResult);
    //         const sucErr = new Error(`ASYNC_Purchase asyncRetryFacebookBuyProduct success ${JSON.stringify(fbRes)}`);
    //         FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, sucErr), true, FireHoseSender.FHLogType.Trace);
    //     });
    // }

    // public inner_fbBuyProduct_live(fbRes: any, productId: string, popupType: number, extraInfo: string, callback: Function): void {
    //     const self = this;
    //     const productInfo = ProductConfig.Instance().getProductInfo(productId);

    //     if (fbRes.error_code !== undefined) {
    //         log(`facebookBuyProduct sendUi fail. response is error ${JSON.stringify(fbRes)}`);
    //         if (fbRes.error_code === 1383010 || fbRes.error_code === -200 || fbRes.error_code === 1383131) {
    //             callback(null);
    //             return;
    //         }

    //         const err = new Error(`ASYNC_Purchase facebookBuyProduct fail ${JSON.stringify(fbRes)}`);
    //         FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, err), true, FireHoseSender.FHLogType.Trace);
    //         this.inner_fbBuyProductRetry(fbRes, productId, popupType, extraInfo, callback);
    //         return;
    //     }

    //     log(fbRes);
    //     const paymentInfo = new FBPaymentOrderInfo();
    //     if (paymentInfo.parseObj(fbRes) !== 0) {
    //         if (paymentInfo.status !== "completed") {
    //             const err = new Error(`ASYNC_Purchase facebookBuyProduct fail2 ${JSON.stringify(fbRes)}`);
    //             FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, err), true, FireHoseSender.FHLogType.Trace);
    //             this.inner_fbBuyProductRetry(fbRes, productId, popupType, extraInfo, callback);
    //             return;
    //         }

    //         Analytics.default.Purchase(productInfo.buyMoney, productInfo.buyCurrency, productInfo.productId, "PRODUCT");
    //         if (ServiceInfoManager.instance().getUserServiceInfo().totalPurchaseCnt === 0) {
    //             Analytics.default.FirstPurchase(productInfo.buyMoney, productInfo.buyCurrency, productInfo.productId);
    //         }
    //         ServiceInfoManager.instance().getUserServiceInfo().lastPurchaseDate = TSUtility.default.getServerBaseNowUnixTime();

    //         const req = new FBBuyProductReq();
    //         req.uid = this.getUid();
    //         req.productId = productId;
    //         req.paymentInfo = paymentInfo;
    //         req.popupType = popupType;
    //         req.extraInfo = extraInfo;

    //         LoadingPopup.default.Instance().showDisplayProgress(true);
    //         CommonServer.default.Instance().requestBuyProduct(ServiceInfoManager.instance().getUid(), ServiceInfoManager.instance().getAccessToken(), req, (serverRes: any) => {
    //             LoadingPopup.default.Instance().showDisplayProgress(false);
    //             if (CommonServer.default.isServerResponseError(serverRes)) {
    //                 self.openCommonPopup_PurchaseError();
    //                 error("facebookBuyProduct fail");
    //                 callback(null);
    //                 return;
    //             }
    //             const changeResult = ServiceInfoManager.instance().getServerChangeResult(serverRes);
    //             callback(changeResult);
    //         });
    //     } else {
    //         callback(null);
    //     }
    // }

    // public inner_fbBuyProduct_dev(fbRes: any, productId: string, popupType: number, extraInfo: string, callback: Function): void {
    //     const self = this;
    //     const paymentInfo = new FBPaymentOrderInfo();
    //     if (paymentInfo.parseObj(fbRes) !== 0) {
    //         const req = new FBBuyProductReq();
    //         req.uid = this.getUid();
    //         req.productId = productId;
    //         req.paymentInfo = paymentInfo;
    //         req.popupType = popupType;
    //         req.extraInfo = extraInfo;

    //         LoadingPopup.default.Instance().showDisplayProgress(true);
    //         CommonServer.default.Instance().requestBuyProduct_dev(ServiceInfoManager.instance().getUid(), ServiceInfoManager.instance().getAccessToken(), req, (serverRes: any) => {
    //             LoadingPopup.default.Instance().showDisplayProgress(false);
    //             if (CommonServer.default.isServerResponseError(serverRes)) {
    //                 self.openCommonPopup_PurchaseError();
    //                 error("facebookBuyProduct fail");
    //                 callback(null);
    //                 return;
    //             }
    //             const changeResult = ServiceInfoManager.instance().getServerChangeResult(serverRes);
    //             callback(changeResult);
    //         });
    //     } else {
    //         callback(null);
    //     }
    // }

    // public inner_fbBuyProduct_test(fbRes: any, productId: string, popupType: number, extraInfo: string, callback: Function): void {
    //     const self = this;
    //     const req = new FBBuyProductReq();
    //     req.uid = this.getUid();
    //     req.productId = productId;
    //     req.popupType = popupType;
    //     req.extraInfo = extraInfo;
        
    //     ServiceInfoManager.instance().getUserServiceInfo().lastPurchaseDate = TSUtility.default.getServerBaseNowUnixTime();
    //     LoadingPopup.default.Instance().showDisplayProgress(true);
        
    //     CommonServer.default.Instance().requestBuyProduct_test(ServiceInfoManager.instance().getUid(), ServiceInfoManager.instance().getAccessToken(), req, (serverRes: any) => {
    //         LoadingPopup.default.Instance().showDisplayProgress(false);
    //         if (CommonServer.default.isServerResponseError(serverRes)) {
    //             self.openCommonPopup_PurchaseError();
    //             error("facebookBuyProduct fail");
    //             callback(null);
    //             return;
    //         }
    //         const changeResult = ServiceInfoManager.instance().getServerChangeResult(serverRes);
    //         callback(changeResult);
    //     });
    // }

    // public openCommonPopup_PurchaseError(): void {
    //     PopupManager.getCommonPopup((err: any, popup: any) => {
    //         if (err) {
    //             error("openCommonPopup_PurchaseError error");
    //             return;
    //         }
    //         popup.open().setInfo("PURCHASE ERROR", "HAVING TROUBLE PURCHASING?")
    //             .setOkBtn("HELP CENTER", () => { ServiceInfoManager.goCustomerSupport(); })
    //             .setCloseBtn(true, () => { });
    //     });
    // }

    // public openCommonPopup_PurchaseError_instant(errMsg: string): void {
    //     PopupManager.getCommonPopup((err: any, popup: any) => {
    //         popup.open().setInfo("PURCHASE ERROR", errMsg)
    //             .setOkBtn("CLOSE", () => { })
    //             .setCloseBtn(true, () => { });
    //     });
    // }

    // public static goCustomerSupport(): void {
    //     if (Utility.isFacebookWeb() && typeof GoFBCanvasContact === "function") {
    //         GoFBCanvasContact();
    //     } else if (Utility.isFacebookInstant() === 1) {
    //         PopupManager.getCommonPopup((err: any, popup: any) => {
    //             popup.open().setInfo("NOTICE", "You may contact our support team via our website.\nPlease use our website at\nhttps://electricslots.net/contact.")
    //                 .setOkBtn("OK", () => { });
    //         });
    //     } else {
    //         let uid = "", fbid = "", userName = "", email = "", audid = "";
    //         if (ServiceInfoManager.instance()) {
    //             uid = ServiceInfoManager.instance().getUid().toString();
    //             fbid = ServiceInfoManager.instance().getFBID();
    //             userName = ServiceInfoManager.instance().getUserName();
    //             email = ServiceInfoManager.instance().getEMail();
    //         } else if (SDefine.default.Use_Mobile_Auth_v2 === 1) {
    //             const loginInfo = MobileDeviceHelper.Instance.getLoginInfo();
    //             uid = loginInfo.uid === 0 ? "" : loginInfo.uid.toString();
    //         }

    //         if (Utility.isMobileGame() === 1 && SDefine.default.Use_Mobile_Auth_v2 === 1) {
    //             const loginInfo = MobileDeviceHelper.Instance.getLoginInfo();
    //             audid = loginInfo.audid;
    //         }

    //         const param = `ID_UID=${encodeURIComponent(uid)}&ID_FBID=${encodeURIComponent(fbid)}&ID_NAME=${encodeURIComponent(userName)}&ID_EMAIL=${encodeURIComponent(email)}&ID_CLIENTVERSION=${encodeURIComponent(Utility.getClientVersion())}&ID_WACCESSDATE=${encodeURIComponent(Utility.getWebAccessDate().toString())}&ID_PLATFORM=${encodeURIComponent(TSUtility.default.getServiceType())}&ID_AUDID=${encodeURIComponent(audid)}`;
    //         const url = `${SDefine.default.CONTACT_URL}?${param}`;
    //         log("onClickCustomerSupport: " + url);
    //         sys.openURL(url);
    //     }
    // }

    // public fbInstantBuyProduct(productId: string, popupType: number, extraInfo: string, callback: Function): void {
    //     const self = this;
    //     if (SDefine.default.FB_Instant_iOS_Shop_Flag === 1) {
    //         this.openCommonPopup_PurchaseError();
    //         callback(null);
    //         return;
    //     }

    //     if (SDefine.default.FBInstant_PurchaseAPI_Useable !== 0) {
    //         LoadingPopup.default.Instance().showDisplayProgress(true);
    //         const productInfo = ProductConfig.Instance().getProductInfo(productId);
    //         Analytics.default.initiateCheckout(productInfo.buyMoney, productInfo.buyCurrency, productInfo.productId);
            
    //         log("fbInstantBuyProduct:" + productId);
    //         log("pMasterInfo:" + JSON.stringify(productInfo));
            
    //         const smallInfo = PurchasePayload_SmallInfo.parseFromInfo(productId, extraInfo);
    //         const smallInfoStr = JSON.stringify(smallInfo);
    //         const startErr = new Error(`fbInstantBuyProduct before purchaseAsync ${productId} / ${productInfo.instantId} / ${smallInfoStr}`);
            
    //         FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, startErr), true, FireHoseSender.FHLogType.Trace);
    //         // @ts-ignore FBInstant 是全局对象
    //         FBInstant.payments.purchaseAsync({ productID: productInfo.instantId, developerPayload: smallInfoStr })
    //             .then((purchaseResult: any) => {
    //                 const sucErr = new Error(`fbInstantBuyProduct purchaseAsync success ${productId} / ${JSON.stringify(purchaseResult)} / ${productInfo.instantId}`);
    //                 FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, sucErr), true, FireHoseSender.FHLogType.Trace);
    //                 LoadingPopup.default.Instance().showDisplayProgress(false);

    //                 if (!purchaseResult) {
    //                     log("fbInstantBuyProduct cancel");
    //                     self.openCommonPopup_PurchaseError_instant("An error has occurred during the purchase process.\nPlease use our website at\nhttps://electricslots.net/contact.");
    //                     callback(null);
    //                     return;
    //                 }

    //                 log("fbInstantBuyProduct " + JSON.stringify(purchaseResult));
    //                 if (SDefine.default.IAP_ReserveUnprocessedReceipt_Test === 1) {
    //                     SDefine.default.IAP_ReserveUnprocessedReceipt_Test = false;
    //                     Analytics.default.purchaseFail({ payload: smallInfoStr, result: purchaseResult, message: "IAP_ReserveUnprocessedReceipt_Test" });
    //                     self.openCommonPopup_PurchaseError_instant("An error has occurred during the purchase process.\nPlease use our website at\nhttps://electricslots.net/contact.");
    //                     error("IAP_ReserveUnprocessedReceipt_Test");
    //                     callback(null);
    //                     return;
    //                 }

    //                 const req = new FBInstantBuyProductReq();
    //                 req.uid = self.getUid();
    //                 req.productId = productId;
    //                 req.popupType = popupType;
    //                 req.extraInfo = extraInfo;
    //                 req.fbPaymentID = purchaseResult.paymentID;
    //                 req.fbPurchaseTime = parseInt(purchaseResult.purchaseTime);
    //                 req.fbProductID = purchaseResult.productID;
    //                 req.fbPurchaseToken = purchaseResult.purchaseToken;
    //                 req.fbSignedRequest = purchaseResult.signedRequest;

    //                 Analytics.default.Purchase(productInfo.buyMoney, productInfo.buyCurrency, productInfo.productId, "PRODUCT");
    //                 if (ServiceInfoManager.instance().getUserServiceInfo().totalPurchaseCnt === 0) {
    //                     Analytics.default.FirstPurchase(productInfo.buyMoney, productInfo.buyCurrency, productInfo.productId);
    //                 }
    //                 ServiceInfoManager.instance().getUserServiceInfo().lastPurchaseDate = TSUtility.default.getServerBaseNowUnixTime();

    //                 LoadingPopup.default.Instance().showDisplayProgress(true);
    //                 CommonServer.default.Instance().requestFBInstantBuyProduct(ServiceInfoManager.instance().getUid(), ServiceInfoManager.instance().getAccessToken(), req, (serverRes: any) => {
    //                     LoadingPopup.default.Instance().showDisplayProgress(false);
    //                     if (SDefine.default.IAP_ServerResponseFail_Test === 1) {
    //                         SDefine.default.IAP_ServerResponseFail_Test = false;
    //                         Analytics.default.purchaseFail({ payload: smallInfo, result: purchaseResult, server: serverRes, message: "IAP_ServerResponseFail_Test" });
    //                         self.openCommonPopup_PurchaseError();
    //                         error("IAP_ServerResponseFail_Test");
    //                         callback(null);
    //                         return;
    //                     }

    //                     if (CommonServer.default.isServerResponseError(serverRes)) {
    //                         const err = new Error(`fbInstantBuyProduct requestFBInstantBuyProduct fail ${productId} / ${TSUtility.default.getServerBaseNowUnixTime().toString()}`);
    //                         FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, err), true, FireHoseSender.FHLogType.Trace);
    //                         self.openCommonPopup_PurchaseError_instant("HAVING TROUBLE PURCHASING?\nPlease use our website at\nhttps://electricslots.net/contact.");
    //                         error("requestFBInstantBuyProduct fail");
    //                         callback(null);
    //                         return;
    //                     }

    //                     // @ts-ignore FBInstant 全局对象
    //                     FBInstant.payments.consumePurchaseAsync(purchaseResult.purchaseToken)
    //                         .then(() => { log("consume end"); })
    //                         .catch((err: any) => { log("consume error : " + JSON.stringify(err)); });
                        
    //                     const finalErr = new Error(`fbInstantBuyProduct complete ${productId} / ${TSUtility.default.getServerBaseNowUnixTime().toString()}`);
    //                     FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, finalErr), true, FireHoseSender.FHLogType.Trace);
    //                     const changeResult = ServiceInfoManager.instance().getServerChangeResult(serverRes);
    //                     callback(changeResult);
    //                 });
    //             })
    //             .catch((err: any) => {
    //                 log("instantBuyProduct purchaseAsync error : " + JSON.stringify(err));
    //                 const errObj = new Error(`instantBuyProduct purchaseAsync fail[${JSON.stringify(err)}]`);
    //                 FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, errObj), true, FireHoseSender.FHLogType.Trace);
    //                 LoadingPopup.default.Instance().showDisplayProgress(false);
    //                 callback(null);
    //             });
    //     } else {
    //         PopupManager.getCommonPopup((err: any, popup: any) => {
    //             popup.open().setInfo("Notice", "Facebook payment process is not ready and temporarily unavailable.").setOkBtn("CLOSE", null);
    //         });
    //         callback(null);
    //         const err = new Error(`fbInstantBuyProduct PurchaseAPI not useable.${productId}`);
    //         FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, err), true, FireHoseSender.FHLogType.Trace);
    //     }
    // }

    // public async UnprocessedReceipt(): Promise<void> {
    //     if (SDefine.default.FBInstant_PurchaseAPI_Useable === 0) return;
    //     LoadingPopup.default.Instance().showDisplayProgress(true);
    //     // @ts-ignore FBInstant 全局对象
    //     await FBInstant.payments.getCatalogAsync().catch(() => { });
    //     let purchases: any[] = [];
    //     // @ts-ignore FBInstant 全局对象
    //     await FBInstant.payments.getPurchasesAsync().then(res => purchases = res).catch(() => { });
    //     LoadingPopup.default.Instance().showDisplayProgress(false);

    //     try {
    //         for (const purchase of purchases) {
    //             await this.PurchasesSeverCall(purchase);
    //         }
    //     } catch (err) {
    //         log("UnprocessedReceipt Error " + err);
    //     }
    // }

    // public async PurchasesSeverCall(purchaseInfo: any): Promise<void> {
    //     const devPayload = purchaseInfo.developerPayload;
    //     let productId = "", popupType = "", extraInfo = "";
    //     let payload: any = null;

    //     try {
    //         payload = PurchasePayload_SmallInfo.parseObj(JSON.parse(devPayload));
    //         productId = payload.getProductId();
    //         extraInfo = payload.getExtraInfo();
    //     } catch (err) {
    //         const splitArr = devPayload.split("+", 3);
    //         productId = splitArr[0];
    //     }

    //     const startErr = new Error(`fbInstant UnprocessedReceipt  ${productId} / ${JSON.stringify(purchaseInfo)}`);
    //     FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Trace, startErr), true, FireHoseSender.FHLogType.Trace);
    //     Analytics.default.unprocessedReceiptStart({ purchaseInfo: purchaseInfo, payload: payload });

    //     const req = new FBInstantBuyProductReq();
    //     req.uid = this.getUid();
    //     req.productId = productId;
    //     req.popupType = popupType;
    //     req.extraInfo = extraInfo;
    //     req.fbPaymentID = purchaseInfo.paymentID;
    //     req.fbPurchaseTime = parseInt(purchaseInfo.purchaseTime);
    //     req.fbProductID = purchaseInfo.productID;
    //     req.fbPurchaseToken = purchaseInfo.purchaseToken;
    //     req.fbSignedRequest = purchaseInfo.signedRequest;

    //     log("requestFBInstantBuyProduct data : " + JSON.stringify(req));
    //     LoadingPopup.default.Instance().showDisplayProgress(true);
    //     await this.asyncCheckAndAcceptPromotion_DailyStampPremium(productId);
    //     const serverRes = await CommonServer.default.Instance().asyncRequestFBInstantBuyProduct(ServiceInfoManager.instance().getUid(), ServiceInfoManager.instance().getAccessToken(), req);
    //     LoadingPopup.default.Instance().showDisplayProgress(false);

    //     if (CommonServer.default.isServerResponseError(serverRes)) {
    //         Analytics.default.unprocessedReceiptFail({ payload: payload, server: serverRes });
    //         log("requestFBInstantBuyProduct fail. ", JSON.stringify(serverRes));
    //         if (CommonServer.default.getErrorCode(serverRes) === SDefine.default.ERR_PAYMENT_ALREADY_EXIST) {
    //             Analytics.default.unprocessedReceiptSuccess({ payload: payload, reason: "ERR_PAYMENT_ALREADY_EXIST" });
    //             // @ts-ignore FBInstant 全局对象
    //             FBInstant.payments.consumePurchaseAsync(purchaseInfo.purchaseToken).catch(() => { });
    //         }
    //         return;
    //     }

    //     Analytics.default.unprocessedReceiptSuccess({ payload: payload });
    //     // @ts-ignore FBInstant 全局对象
    //     FBInstant.payments.consumePurchaseAsync(purchaseInfo.purchaseToken).catch(() => { });
    //     const changeResult = ServiceInfoManager.instance().getServerChangeResult(serverRes);
    //     await this.asyncOpenUnProcessedInfoPopup(UnprocessedPurchaseManager.UnProcessedPopupInfo.newInst(payload.getProductId(), req.fbPurchaseTime, changeResult));
    // }

    // public setAppsflyerConversionDataCallback(): void {
    //     if (Utility.isMobileGame()) {
    //         log("setAppsflyerConversionDataCallback");
    //         this._onAppsflyerConversionDataCallback = this._onAppsflyerConversionData.bind(this);
    //         nativeJSBridge.addBridgeCallback("onAppsflyerConversionData", this._onAppsflyerConversionDataCallback);
    //         NativeUtil.setAppsflyerConversionDataCallback();
    //     }
    // }

    // private _onAppsflyerConversionData(e: any, dataStr: string): void {
    //     log("_onAppsflyerConversionData: " + dataStr);
    //     const data = JSON.parse(dataStr);
    //     const formatData: any = {};
    //     const keys = Object.keys(data);
    //     for (const key of keys) {
    //         if (data[key] !== null) formatData[key] = data[key].toString();
    //     }

    //     this._appsFlyerConversionData = formatData;
    //     log("isMediaSource_RewardAd " + this.isMediaSource_RewardAd());
    //     const dataJson = JSON.stringify(formatData);
        
    //     CommonServer.default.Instance().requestAppsflyerConversionDataSet(this.getUid(), this.getAccessToken(), dataJson, (serverRes: any) => {
    //         log("requestAppsflyerConversionDataSet " + JSON.stringify(serverRes));
    //         if (CommonServer.default.isServerResponseError(serverRes)) error("requestAppsflyerConversionDataSet fail.");
    //     });
        
    //     nativeJSBridge.removeBridgeCallback("onAppsflyerConversionData", this._onAppsflyerConversionDataCallback);
    // }

    // public isMediaSource_RewardAd(): boolean {
    //     if (!this._appsFlyerConversionData || !this._appsFlyerConversionData.media_source) return false;
    //     if (this._appsFlyerConversionData.media_source.indexOf("_rewardAD") !== -1) return true;
    //     if (TSUtility.default.isTestAbleSeverMode() && this._appsFlyerConversionData.media_source.indexOf("AppsFlyer_Test") !== -1) {
    //         log("AppsFlyer Test User");
    //         return true;
    //     }
    //     return false;
    // }

    public isNonOrganicUser(): boolean {
        return !!this._appsFlyerConversionData && !!this._appsFlyerConversionData.af_status && this._appsFlyerConversionData.af_status === "Non-organic";
    }

    // ===================== Get/Set 快捷方法区 =====================
    public setOpenBoostPopup(val: boolean): void { this._isOpenBoostPopup = val; }
    public getFromBoostDeal(): boolean { return this._isOpenBoostPopup; }
    public setIsOpenEventPopup(val: boolean): void { this._isOpenStartEventPopup = val; }
    public getIsOpenEventPopup(): boolean { return this._isOpenStartEventPopup; }
    public setIsOpenSalePoromtionShopPopup(val: boolean): void { this._IsOpenSalePoromtionShopPopup = val; }
    public getIsOpenSalePoromtionShopPopup(): boolean { return this._IsOpenSalePoromtionShopPopup; }
    public setLastTotalbet(val: number): void { if (val !== 0) this._userInfo.userGameInfo.setLastTotalbet(val); }
    public setBiggestWinCoin(val: number): void { this._userInfo.userGameInfo.setBiggestWinCoin(val); }
    public getlastPlayZoneID(): number { return this._userInfo.userGameInfo.lastPlayZoneID; }
    public getTwoH_TotalBet(): number { return this._userInfo.userGameInfo.twoh_totalBet; }
    public getTwoH_TotalSpin(): number { return this._userInfo.userGameInfo.twoh_totalSpin; }
    public setModeBetDepth(val: number): void { this._userInfo.userGameInfo.modeBetDepth = val; }
    public getModeBetDepth(): number { return this._userInfo.userGameInfo.modeBetDepth; }
    public setModeBetDeptyhLast500Spins(val: number): void { this._userInfo.userGameInfo.modeBetDepthLast500Spins = val; }
    public getModeBetDepthLast500Spins(): number { return this._userInfo.userGameInfo.modeBetDepthLast500Spins; }
    public setTwoH_TotalBet(val: number): void { this._userInfo.userGameInfo.twoh_totalBet = val; }
    public setTwoH_TotalSpin(val: number): void { this._userInfo.userGameInfo.twoh_totalSpin = val; }
    public getTotalBet(): number { return this._userInfo.userGameInfo.totalBet; }
    public getLastTotalBet(): number { return this._userInfo.userGameInfo.lastTotalBet; }
    public getLast3000AvgBet(): number { return this._userInfo.userGameInfo.avg_3000_bet; }
    public getLastAllinBet(): number { return this._userInfo.userGameInfo.lastAllinBet; }
    public getLastAllinDate(): number { return this._userInfo.userGameInfo.lastAllInDate; }
    public getMinDateLast30Spin(): number { return this._userInfo.userGameInfo.minDateLast30spins; }
    public getLastSpinDate(): number { return this._userInfo.userGameInfo.lastSpinData; }
    public getTotalSpinCount(): number { return this._userInfo.userGameInfo.totalSpin; }
    public addTotalSpinCount(): void { this._userInfo.userGameInfo.totalSpin++; }
    public getFavoriteSlotList(): any[] { return this._userInfo.userGameInfo.favoriteList; }
    public isShowRecordRenewal(): boolean { return this._userInfo.userGameInfo.getRecordRenewalFlag(); }
    public resetRecordRenewalFlag(): void { this._userInfo.userGameInfo.resetRecordRenewalFlag(); }
    public getPrevBiggestWinCoin(): number { return this._userInfo.userGameInfo.prevBiggestWinCoin; }
    public getBiggestWinCoin(): number { return this._userInfo.userGameInfo.biggestWinCoin; }
    public getEightySpinCount(): number { return this._userInfo.userGameInfo.eighty_SpinCont; }

    public setTripleDiamondWheelMaxGauge(val1: any, val2: any): void { this._userInfo.tripleDiamondWheelInfo.setMaxInfo(val1, val2); }
    public setThrillJackpotWheelMaxGauge(val1: any, val2: any, val3: any): void { this._userInfo.thrillJackpotWheelInfo.setMaxInfo(val1, val2, val3); }
    public setTripleDiamondWheelGaugeInfo(info: any): void {
        if (info) {
            const id = info.id;
            const curGauge = info.curGauge;
            const maxGauge = info.maxGauge;
            this._userInfo.tripleDiamondWheelInfo.setGaugeInfo(id, curGauge, maxGauge);
        }
        // this._eventEmitter.emit(MSG.UPDATE_TRIPLEWHEELGAUGE);
    }
    public getTripleDiamondWheelGaugeInfo(type: number): any {
        return type === SDefine.MAJORROLLER_ZONEID ? this._userInfo.tripleDiamondWheelInfo.goldGaugeInfo : this._userInfo.tripleDiamondWheelInfo.diamondGaugeInfo;
    }
    public setThrillJackpotWheelGaugeInfo(info: any): void {
        if (info) {
            const id = info.id;
            const curGauge = info.curGauge;
            const maxGauge = info.maxGauge;
            this._userInfo.thrillJackpotWheelInfo.setGaugeInfo(id, curGauge, maxGauge);
            // this._eventEmitter.emit(MSG.UPDATE_THRILLWHEELGAUGE);
        }
    }
    public getThrillJackpotWheelGaugeInfo(type: number): any {
        if (type === 0) return this._userInfo.thrillJackpotWheelInfo.silverWheelGaugeInfo;
        if (type === 1) return this._userInfo.thrillJackpotWheelInfo.goldWheelGaugeInfo;
        return this._userInfo.thrillJackpotWheelInfo.diamondWheelGaugeInfo;
    }

    public getTripleDiamondWheelGoldAmount(): number {
        const items = this._userInfo.userInven.getItemsByItemId(SDefine.I_TRIPLEDIA_JACKPOT_GOLD_TICKET);
        return items.length <= 0 ? 0 : items[0].curCnt;
    }
    public getStarShopPoint(): number {
        const items = this._userInfo.userInven.getItemsByItemId(SDefine.I_STAR_SHOP_COIN);
        return items.length === 0 ? 0 : items[0].curCnt;
    }
    public getSuiteLeagueBalance(): number {
        const items = this._userInfo.userInven.getItemsByItemId(SDefine.I_SUITE_LEAGUE_SHOP_BALANCE);
        return items.length === 0 ? 0 : items[0].curCnt;
    }
    public getTripleDiamondWheelDiaAmount(): number {
        const items = this._userInfo.userInven.getItemsByItemId(SDefine.I_TRIPLEDIA_JACKPOT_DIAMOND_TICKET);
        return items.length <= 0 ? 0 : items[0].curCnt;
    }

    public applyHeroBonusGauge(info: any): void {
        if (!this._userHeroInfo) {
            cc.error("applyHeroBonusGauge invalid heroStatus");
            return;
        }
        const oldGrade = HeroManager.Instance().getBonusGaugeGrade(this._userHeroInfo.getActiveHeroBonusGauge());
        this._userHeroInfo.addHeroBonusGauge(info.addGauge);
        const newGrade = HeroManager.Instance().getBonusGaugeGrade(this._userHeroInfo.getActiveHeroBonusGauge());
        // if (oldGrade !== newGrade) {
        //     this._eventEmitter.emit(MSG.UPDATE_HERO_BONUS_GRADEUP, info);
        // } else {
        //     this._eventEmitter.emit(MSG.UPDATE_HERO_BONUS_EXPUP, info);
        // }
    }

    // public applyHeroPowerGauge(info: any): void {
    //     if (!this._userHeroInfo) {
    //         cc.error("applyHeroBonusGauge invalid heroStatus");
    //         return;
    //     }
    //     this._userHeroInfo.setPowerInfo(info.curGauge, info.afterLevel);
    //     if (info.beforeLevel !== info.afterLevel) {
    //         SlotDataDefine.BOOL_POWER_UP_HERO = true;
    //         this._eventEmitter.emit(ServiceInfoManager.MSG.UPDATE_HERO_POWER_LEVELUP, info);
    //     }
    // }

    // public applyReelQuestHist(info: any): void {
    //     const questInfo = this.getUserReelQuestInfo();
    //     if (!questInfo) {
    //         error("applyReelQuestHist invalid");
    //         return;
    //     }
    //     questInfo.updateMissionProgress(info.missionID, info.curCnt);
    //     this._eventEmitter.emit(ServiceInfoManager.MSG.UPDATE_REELQUEST_PROGRESS, info);
    // }

    // public get200SpinModeValue(): number {
    //     return SlotDataDefine.default.instance().getGlobalBetDepth(this._userInfo.userLastModeBetDepth);
    // }

    // // ===================== 账号绑定相关异步方法 =====================
    // public async checkAndAccountLinkFacebook(): Promise<boolean> {
    //     try {
    //         const uid = ServiceInfoManager.instance().getUid();
    //         LoadingPopup.default.Instance().showDisplayProgress(true);
    //         const fbLoginRes = await FacebookUtil.default.loginSync();
    //         LoadingPopup.default.Instance().showDisplayProgress(false);

    //         if (!fbLoginRes) return false;
    //         const fbId = FacebookUtil.default.m_fbid;
    //         const fbToken = FacebookUtil.default.m_fbAccessToken;
            
    //         log("checkAndAccountLinkFacebook: ", JSON.stringify(fbLoginRes));
    //         FacebookUtil.default.getPermissionList(null);
    //         FacebookUtil.default.removeAppRequests();

    //         if (fbId === "") {
    //             log("checkAndAccountLinkFacebook fbid is empty");
    //             FacebookUtil.default.logout(() => { });
    //             PopupManager.authErrorPopup(SDefine.default.ERR_AuthInvalidFacebookToken);
    //             return false;
    //         }

    //         const curFbId = ServiceInfoManager.instance().getFBID();
    //         log("checkAndAccountLinkFacebook ", curFbId, fbId, fbLoginRes.userID);

    //         if (curFbId === fbId) {
    //             log("checkAndAccountLinkFacebook fb login success");
    //             const loginInfo = MobileDeviceHelper.Instance.getLoginInfo();
    //             ServiceInfoManager.setCurrentLoginInfo(SDefine.default.LOGINTYPE_FACEBOOK, loginInfo);
    //             MobileDeviceHelper.Instance.setLoginInfoObj(loginInfo);
    //             MessageRoutingManager.default.restartGame();
    //             return true;
    //         }

    //         if (curFbId !== "") {
    //             log("asyncDoFacebookLink already facebook Linked user");
    //             FacebookUtil.default.logout(() => { });
    //             PopupManager.authErrorPopup(SDefine.default.ERR_AUTH_FacebookLinked_otherFBID);
    //             return false;
    //         }

    //         const req = new AuthLinkReq();
    //         const loginInfo = MobileDeviceHelper.Instance.getLoginInfo();
    //         req.uid = uid;
    //         req.audid = loginInfo.audid;
    //         req.isForced = false;
    //         req.facebookAuth = new FacebookAuth();
    //         req.facebookAuth.id = fbId;
    //         req.facebookAuth.token = fbToken;

    //         LoadingPopup.default.Instance().showDisplayProgress(true);
    //         const serverRes = await CommonServer.default.Instance().ayncRequestAuthLink(uid, req);
    //         LoadingPopup.default.Instance().showDisplayProgress(false);

    //         if (CommonServer.default.isServerResponseError(serverRes)) {
    //             error("ayncRequestAuthLink fail", JSON.stringify(serverRes));
    //             if (serverRes.error === undefined) {
    //                 FacebookUtil.default.logout(() => { });
    //                 return false;
    //             }
    //             const resObj = AuthLinkRes.parseObj(serverRes);
    //             const isMerge = resObj.isPossibleMerge;
    //             if (resObj.error.code !== SDefine.default.ERR_AuthChangeUIDByFacebookUID) return false;
    //             const mergeRes = await this.asyncForceLinkMerge(resObj, req, SDefine.default.LOGINTYPE_FACEBOOK, null);
    //             if (isMerge === 1 && mergeRes === 1) LocalStorageManager.default.setMobileFacebookMergeUser();
    //             return mergeRes;
    //         }

    //         AuthLinkRes.parseObj(serverRes);
    //         const loginInfoObj = MobileDeviceHelper.Instance.getLoginInfo();
    //         loginInfoObj.facebookLogin = true;
    //         MobileDeviceHelper.Instance.setLoginInfoObj(loginInfoObj);
    //         MessageRoutingManager.default.restartGame();
    //         return true;
    //     } catch (err) {
    //         FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Exception, err as Error));
    //         return false;
    //     }
    // }

    // public static setCurrentLoginInfo(type: number, loginInfo: any): void {
    //     switch (type) {
    //         case SDefine.default.LOGINTYPE_FACEBOOK:
    //             loginInfo.facebookLogin = true;
    //             if (loginInfo.appleLogin) loginInfo.appleLogin = false;
    //             break;
    //         case SDefine.default.LOGINTYPE_APPLE:
    //             loginInfo.appleLogin = true;
    //             if (loginInfo.facebookLogin) {
    //                 loginInfo.facebookLogin = false;
    //                 FacebookUtil.default.logout(() => { });
    //             }
    //             break;
    //     }
    // }

    // public async asyncForceLinkMerge(resObj: any, req: any, loginType: number, appleInfo: any): Promise<boolean> {
    //     return new Promise((resolve) => {
    //         LoadingPopup.default.Instance().showDisplayProgress(true);
    //         UserMergePopup.getPopup((err: any, popup: any) => {
    //             LoadingPopup.default.Instance().showDisplayProgress(false);
    //             if (err) {
    //                 error("not found UserMergePopup");
    //                 if (loginType === SDefine.default.LOGINTYPE_FACEBOOK) FacebookUtil.default.logout(() => { });
    //                 resolve(false);
    //                 return;
    //             }

    //             popup.setLinkSuccessCallback((mergeRes: any) => {
    //                 if (loginType === SDefine.default.LOGINTYPE_APPLE) MobileDeviceHelper.Instance.setAppleLoginInfo(appleInfo);
    //                 MobileDeviceHelper.Instance.setLoginInfo(mergeRes.uid);
    //                 const loginInfo = MobileDeviceHelper.Instance.getLoginInfo();
    //                 ServiceInfoManager.setCurrentLoginInfo(loginType, loginInfo);
    //                 MobileDeviceHelper.Instance.setLoginInfoObj(loginInfo);
    //                 MessageRoutingManager.default.restartGame();
    //                 resolve(true);
    //             });

    //             popup.setLinkFailCallback(() => {
    //                 log("setLinkFailCallback call");
    //                 if (loginType === SDefine.default.LOGINTYPE_FACEBOOK) FacebookUtil.default.logout(() => { });
    //                 resolve(false);
    //             });

    //             popup.setCancelCallback(() => {
    //                 log("setCancelCallback call");
    //                 if (loginType === SDefine.default.LOGINTYPE_FACEBOOK) FacebookUtil.default.logout(() => { });
    //                 resolve(false);
    //             });

    //             popup.open(resObj, req);
    //         });
    //     });
    // }

    // public async checkAndAccountLinkAppleLogin(): Promise<boolean> {
    //     try {
    //         const uid = ServiceInfoManager.instance().getUid();
    //         LoadingPopup.default.Instance().showDisplayProgress(true);
    //         const appleRes = await AppleLoginHelper.default.Instance.asyncRequestAppleLogin();
    //         LoadingPopup.default.Instance().showDisplayProgress(false);

    //         if (appleRes.errorCode !== 0) {
    //             log("checkAndAccountLinkAppleLogin apple login fail", JSON.stringify(appleRes));
    //             return false;
    //         }

    //         const curAppleId = ServiceInfoManager.instance().getAppleID();
    //         if (curAppleId === appleRes.user) {
    //             log("checkAndAccountLinkAppleLogin apple login success");
    //             MobileDeviceHelper.Instance.setAppleLoginInfo(appleRes);
    //             const loginInfo = MobileDeviceHelper.Instance.getLoginInfo();
    //             ServiceInfoManager.setCurrentLoginInfo(SDefine.default.LOGINTYPE_APPLE, loginInfo);
    //             MobileDeviceHelper.Instance.setLoginInfoObj(loginInfo);
    //             MessageRoutingManager.default.restartGame();
    //             return true;
    //         }

    //         if (curAppleId !== "") {
    //             log("checkAndAccountLinkAppleLogin already Apple Linked user");
    //             PopupManager.authErrorPopup(SDefine.default.ERR_AUTH_AppleLinked_otherAppleID);
    //             return false;
    //         }

    //         const req = new AuthLinkReq();
    //         const loginInfo = MobileDeviceHelper.Instance.getLoginInfo();
    //         req.uid = uid;
    //         req.audid = loginInfo.audid;
    //         req.isForced = false;
    //         req.appleAuth = new AppleAuth();
    //         req.appleAuth.id = appleRes.user;
    //         req.appleAuth.token = appleRes.identityToken;
    //         req.appleEmail = appleRes.email;
    //         req.appleName = `${appleRes.givenName} ${appleRes.familyName}`;

    //         LoadingPopup.default.Instance().showDisplayProgress(true);
    //         const serverRes = await CommonServer.default.Instance().ayncRequestAuthLink(uid, req);
    //         LoadingPopup.default.Instance().showDisplayProgress(false);

    //         if (CommonServer.default.isServerResponseError(serverRes)) {
    //             error("ayncRequestAuthLink fail", JSON.stringify(serverRes));
    //             if (serverRes.error === undefined) return false;
    //             const resObj = AuthLinkRes.parseObj(serverRes);
    //             if (resObj.error.code !== SDefine.default.ERR_AuthChangeUIDByAppleUID) return false;
    //             const mergeRes = await this.asyncForceLinkMerge(resObj, req, SDefine.default.LOGINTYPE_APPLE, appleRes);
    //             if (resObj.error.code === SDefine.default.ERR_AuthAccountUserStateInvalid) {
    //                 LoadingPopup.default.Instance().showDisplayProgress(true);
    //                 AppleLoginHelper.default.Instance.setLogin(false);
    //                 PopupManager.authErrorPopup(resObj.error.code);
    //             } else {
    //                 PopupManager.authErrorPopup(resObj.error.code);
    //             }
    //             return mergeRes;
    //         }

    //         AuthLinkRes.parseObj(serverRes);
    //         MobileDeviceHelper.Instance.setAppleLoginInfo(appleRes);
    //         const loginInfoObj = MobileDeviceHelper.Instance.getLoginInfo();
    //         loginInfoObj.appleLogin = true;
    //         MobileDeviceHelper.Instance.setLoginInfoObj(loginInfoObj);
    //         MessageRoutingManager.default.restartGame();
    //         return true;
    //     } catch (err) {
    //         FireHoseSender.default.Instance().sendAws(FireHoseSender.default.Instance().getRecord(FireHoseSender.FHLogType.Exception, err as Error));
    //         return false;
    //     }
    // }

    // public isExceptAddItem(itemInfo: any): boolean {
    //     return itemInfo.itemId !== SDefine.default.I_SUITE_LEAGUE_FEVER_POINT && !(itemInfo.itemId === SDefine.default.I_SUITE_LEAGUE_FEVER_TICKET && itemInfo.addCnt >= 0);
    // }

    // public isCPEUser(): boolean {
    //     return this.getUserServiceInfo().cpeMedia !== "";
    // }
}