
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

    // public getGameId(): string {
    //     return this._gameId;
    // }

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

    // public getTotalCoin(): number {
    //     return this._userInfo!.userAssetInfo!.totalCoin;
    // }

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

    // public isPassAbleCasino(zoneId: number, zoneName: string, slotId: string = ""): boolean {
    //     if (this.hasVipPassBenefit(zoneId, zoneName)) return true;
    //     if (zoneId === SDefine.MAJORROLLER_ZONEID) {
    //         if (this.hasMajorRollerFreeTicket() && zoneName === SDefine.VIP_LOUNGE_ZONENAME) return true;
    //         if (this.hasSupersizeFreeTicket() && zoneName === SDefine.VIP_LOUNGE_ZONENAME) {
    //             if (slotId === "") return true;
    //             if (SupersizeItManager.instance.isTargetSlotID(slotId)) return true;
    //         }
    //     }
    //     if (zoneId === SDefine.SUITE_ZONEID && this.hasSuitePass() && zoneName === SDefine.SUITE_ZONENAME) return true;
    //     return false;
    // }

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
        const res = await this.asyncRefreshJackpotInfoByZoneId(Math.min(1, zoneId));
        return res;
    }

    public asyncRefreshJackpotInfoByZoneId(zoneId: number) {
        // const res = await CommonServer.Instance().requestZoneInfo();
        // if (!this.isValid) return false;
        // if (CommonServer.isServerResponseError(res)) {
        //     console.error("CommonServer.Instance().requestZoneInfo fail ");
        //     return false;
        // }

        var res1 = JSON.parse('{"casinoJackpotLastWins":{"1":{"user":{"uid":302074453663744,"fbid":"5907113125990374","fbInstantID":"5907113125990374","name":"Pamela","picUrl":"https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=1240743016530924&gaming_photo_type=unified_picture&ext=1770074227&hash=AT8_PX3STJHrige4_Rnc_cbc","createdDate":1698244516,"lastLoginDate":1767482240,"accountSite":0},"casinoJackpotWinID":486699373363200,"zoneID":1,"slotID":"alienamigos","totalPrize":10908358144,"basePrize":1000000000,"progressivePrize":9908358144,"betLine":50,"betPerLine":240000,"totalBetCoin":12000000,"winDate":1767490746,"winners":[302074453663744,333030598230017,434700321726464,371296150126592,459047967047680,300072214560768,43450894409728,159480283152384,254548719534080,237526650552320,483204761026560,63887040864256,126012260122624,353108748222464,36899219570688,231550094516224,477393626267648,132252893757441,124084333608960,79862628884480]}},"casinoJackpots":[{"zoneID":1,"slotID":"","jackpotSubID":0,"jackpotSubKey":"","jackpot":9754465452,"basePrize":1000000000,"basePrizeType":"FixedCoin","maxBasePrize":0,"minPrize":8041152251,"maxPrize":18002039048,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"error":{"code":0,"msg":""},"mostPlayedSlots":["mooorecheddar","dragonsandpearls","honeybeeparade","kingofsafari","libertyeaglefortune","horoscopeblessings"],"reqId":1767492998,"slotJackpotsAll":{"0":{"4thofjulywildrespin":[{"zoneID":0,"slotID":"4thofjulywildrespin","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":2258332996,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"4thofjulywildrespin","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":2792373606,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"4thofjulywildrespin","jackpotSubID":3,"jackpotSubKey":"major","jackpot":1001166369,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"4thofjulywildrespin","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":631010695,"basePrize":875,"basePrizeType":"BetPerLine","maxBasePrize":4200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"4thofjulywildrespin","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":296008296,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"4thofjulywildrespin","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":360000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"abracadabra":[{"zoneID":0,"slotID":"abracadabra","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1690886053,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":86400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"alienamigos":[{"zoneID":0,"slotID":"alienamigos","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":18801580373,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alienamigos","jackpotSubID":2,"jackpotSubKey":"major","jackpot":47754819523,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alienamigos","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alienamigos","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"allamerican":[{"zoneID":0,"slotID":"allamerican","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":25795033066,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"allamerican","jackpotSubID":2,"jackpotSubKey":"major","jackpot":15072330425,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"allamerican","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"allamerican","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":960000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"allstarcircus":[{"zoneID":0,"slotID":"allstarcircus","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5326761913,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"allstarcircus","jackpotSubID":2,"jackpotSubKey":"major","jackpot":663001231,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"allstarcircus","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":583322395,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"allstarcircus","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":309914057,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"alohahawaii":[{"zoneID":0,"slotID":"alohahawaii","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":395903812261,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":11256102620,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":7200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii","jackpotSubID":2,"jackpotSubKey":"major","jackpot":5439904675,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1440000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":720000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"alohahawaii_dy":[{"zoneID":0,"slotID":"alohahawaii_dy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":14400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":7200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":2880000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1440000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"american9eagles":[{"zoneID":0,"slotID":"american9eagles","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":78929827363,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"american9eagles","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":8093026083,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"american9eagles","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1891213270,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"american9eagles","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":696499503,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"american9eagles","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":192472332,"basePrize":320,"basePrizeType":"BetPerLine","maxBasePrize":960000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.045,"linked":false,"linkedKey":""}],"americanvalor":[{"zoneID":0,"slotID":"americanvalor","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5194564938,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"apocalypselasthope":[{"zoneID":0,"slotID":"apocalypselasthope","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":37370438.39999308,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"apocalypselasthope","jackpotSubID":2,"jackpotSubKey":"major","jackpot":447834036.6000048,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"apocalypselasthope","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":116965269.39999233,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"apocalypselasthope","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":48927673.599998534,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"aztecodyssey":[{"zoneID":0,"slotID":"aztecodyssey","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2004047451,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"aztecodyssey","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1483456522,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"aztecodyssey","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"aztecodyssey","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":80,"basePrizeType":"BetPerLine","maxBasePrize":240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"babysantawild":[{"zoneID":0,"slotID":"babysantawild","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":116167102005,"basePrize":980,"basePrizeType":"BetPerLine","maxBasePrize":117600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"babysantawild","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":21849742465,"basePrize":484,"basePrizeType":"BetPerLine","maxBasePrize":58080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"babysantawild","jackpotSubID":2,"jackpotSubKey":"major","jackpot":7010886834,"basePrize":188,"basePrizeType":"BetPerLine","maxBasePrize":22560000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"bankofwealth":[{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":9,"jackpotSubKey":"grand","jackpot":34271360377.604282,"basePrize":45000,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":8,"jackpotSubKey":"mega","jackpot":3406649218.6002045,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":7,"jackpotSubKey":"major","jackpot":424041557.5999138,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":5400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":6,"jackpotSubKey":"minor","jackpot":54567687.60001087,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":2700000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":5,"jackpotSubKey":"mini","jackpot":13121307.599999562,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":0,"jackpotSubKey":"classic1","jackpot":546091004.5999081,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":1,"jackpotSubKey":"classic2","jackpot":1051943760.6003487,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":5400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":2,"jackpotSubKey":"classic3","jackpot":7977329646.598581,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":3,"jackpotSubKey":"classic4","jackpot":4822294606.598789,"basePrize":45000,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":4,"jackpotSubKey":"classic5","jackpot":8953456626.598274,"basePrize":90000,"basePrizeType":"BetPerLine","maxBasePrize":108000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"beelovedjars":[{"zoneID":0,"slotID":"beelovedjars","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":588575628,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"beelovedjars","jackpotSubID":2,"jackpotSubKey":"major","jackpot":495544170,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"beelovedjars","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":504853319,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"beelovedjars","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":86723310,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"bellstrikefrenzy":[{"zoneID":0,"slotID":"bellstrikefrenzy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":903153512583,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"bigbucksbounty":[{"zoneID":0,"slotID":"bigbucksbounty","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":3356621307,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bigbucksbounty","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1020371207,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bigbucksbounty","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":117929489,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bigbucksbounty","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":34803105,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"bingotrio":[{"zoneID":0,"slotID":"bingotrio","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":123806891317,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bingotrio","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1995992332,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bingotrio","jackpotSubID":2,"jackpotSubKey":"major","jackpot":939290758,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bingotrio","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":155968015,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bingotrio","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":51511021,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""}],"birdjackpot":[{"zoneID":0,"slotID":"birdjackpot","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":86017183788,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2654738581,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":824780736,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":322315907,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":80458486,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""}],"birdjackpot_dy":[{"zoneID":0,"slotID":"birdjackpot_dy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":96000,"basePrizeType":"BetPerLine","maxBasePrize":288000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.008,"linked":false,"linkedKey":""}],"blackwhitetiger":[{"zoneID":0,"slotID":"blackwhitetiger","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6721167592.999855,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"blackwhitetiger","jackpotSubID":2,"jackpotSubKey":"major","jackpot":10446478872.499454,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"blackwhitetiger","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":328134987.99999595,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"blackwhitetiger","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":317163309.5000068,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"blazingbullwild":[{"zoneID":0,"slotID":"blazingbullwild","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":68266786659.99515,"basePrize":32000,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"blazingbullwild","jackpotSubID":3,"jackpotSubKey":"major","jackpot":22297865864.00275,"basePrize":6400,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"blazingbullwild","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":3108427818.9999976,"basePrize":1600,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"blazingbullwild","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":540525195.9999597,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"blazingbullwild","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":160,"basePrizeType":"BetPerLine","maxBasePrize":240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"bloodgems":[{"zoneID":0,"slotID":"bloodgems","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":7212151323.59994,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bloodgems","jackpotSubID":2,"jackpotSubKey":"major","jackpot":13815418945.199898,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bloodgems","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":20429859952.800358,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bloodgems","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1607775307.4001508,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"bonanzaexpress":[{"zoneID":0,"slotID":"bonanzaexpress","jackpotSubID":0,"jackpotSubKey":"grand","jackpot":220908202236,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"boonanza":[{"zoneID":0,"slotID":"boonanza","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":45767492696,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"boonanza","jackpotSubID":2,"jackpotSubKey":"major","jackpot":311947916,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"boonanza","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":201884019,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"boonanza","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":149129201,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"bunnybank":[{"zoneID":0,"slotID":"bunnybank","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1169694871,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"bunnybank_dy":[{"zoneID":0,"slotID":"bunnybank_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6000,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"candycastle":[{"zoneID":0,"slotID":"candycastle","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":3516925195,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"candycastle","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1377955869,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"candycastle","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":402931936,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":3200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"candycastle","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":198381857,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"captainblackpurr":[{"zoneID":0,"slotID":"captainblackpurr","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":43374225633,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"captainblackpurr","jackpotSubID":2,"jackpotSubKey":"major","jackpot":5471835042,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"captainblackpurr","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":5812777085,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"captainblackpurr","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":504591843,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"carnivalinrio":[{"zoneID":0,"slotID":"carnivalinrio","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":10496450858,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"cashshowdown":[{"zoneID":0,"slotID":"cashshowdown","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":1443421214,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"cashshowdown","jackpotSubID":1,"jackpotSubKey":"major","jackpot":994222727,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"cashshowdowndeluxe":[{"zoneID":0,"slotID":"cashshowdowndeluxe","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":1050,"basePrizeType":"BetPerLine","maxBasePrize":126000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"casinoroyale":[{"zoneID":0,"slotID":"casinoroyale","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":408418573451,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"casinoroyale","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"casinoroyale","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"casinoroyale","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"casinoroyale_dy":[{"zoneID":0,"slotID":"casinoroyale_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"casinoroyale_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"casinoroyale_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"casinoroyale_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"chilichilifever":[{"zoneID":0,"slotID":"chilichilifever","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":13422584029.400043,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"chilichilifever","jackpotSubID":2,"jackpotSubKey":"major","jackpot":10668538966.600153,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"chilichilifever","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":155598259.39996558,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"chilichilifever","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":143650348.60001597,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":900000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"classiclockrollgrand":[{"zoneID":0,"slotID":"classiclockrollgrand","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":321966380103,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classiclockrollgrand","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classiclockrollgrand","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":8640000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classiclockrollgrand","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":3600,"basePrizeType":"BetPerLine","maxBasePrize":4320000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"classicstar":[{"zoneID":0,"slotID":"classicstar","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":1589179489.0000668,"basePrize":1700,"basePrizeType":"BetPerLine","maxBasePrize":40800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classicstar","jackpotSubID":2,"jackpotSubKey":"major","jackpot":229059522.99999395,"basePrize":700,"basePrizeType":"BetPerLine","maxBasePrize":16800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classicstar","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":54703862.999999054,"basePrize":450,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classicstar","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":14427169.000001486,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0008,"linked":false,"linkedKey":""}],"classicstar_dy":[{"zoneID":0,"slotID":"classicstar_dy","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classicstar_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classicstar_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classicstar_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0008,"linked":false,"linkedKey":""}],"cupidlovespells":[{"zoneID":0,"slotID":"cupidlovespells","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":28122919,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"cupidlovespells","jackpotSubID":1,"jackpotSubKey":"major","jackpot":68521123650,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"cupidlovespells","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":55759625,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"cupidloveydovey":[{"zoneID":0,"slotID":"cupidloveydovey","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":85667020,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"cupidloveydovey","jackpotSubID":2,"jackpotSubKey":"major","jackpot":165483219,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"cupidloveydovey","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":200567868,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"cupidloveydovey","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":116045526.99999931,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"curiousmermaid":[{"zoneID":0,"slotID":"curiousmermaid","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":117341601608,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":true,"linkedKey":"mysticgypsi_curiousmermaid"},{"zoneID":0,"slotID":"curiousmermaid","jackpotSubID":2,"jackpotSubKey":"major","jackpot":16507856845,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"curiousmermaid","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"curiousmermaid","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"dakotafarmgirl":[{"zoneID":0,"slotID":"dakotafarmgirl","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":6000,"basePrizeType":"BetPerLine","maxBasePrize":14400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dakotafarmgirl","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":7200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dakotafarmgirl","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dakotafarmgirl","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dakotafarmgirl","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"davyjonesslocker":[{"zoneID":0,"slotID":"davyjonesslocker","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1846208095,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"davyjonesslocker","jackpotSubID":2,"jackpotSubKey":"major","jackpot":69182817,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"davyjonesslocker","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":62937555,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"davyjonesslocker","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":29920108,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"diamondbeamjackpot":[{"zoneID":0,"slotID":"diamondbeamjackpot","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":42840968916,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":480000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondbeamjackpot","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":4200009548,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondbeamjackpot","jackpotSubID":3,"jackpotSubKey":"major","jackpot":3419595756,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondbeamjackpot","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":1112671494,"basePrize":70,"basePrizeType":"BetPerLine","maxBasePrize":8400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondbeamjackpot","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":0,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondbeamjackpot","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"diamondstrike":[{"zoneID":0,"slotID":"diamondstrike","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":674894316284,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondstrike","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":25981936431,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondstrike","jackpotSubID":2,"jackpotSubKey":"major","jackpot":7224300862,"basePrize":1875,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondstrike","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4327478073,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.05,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondstrike","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1076588305,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.09,"linked":false,"linkedKey":""}],"dingdongjackpots":[{"zoneID":0,"slotID":"dingdongjackpots","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":68130654885,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dingdongjackpots","jackpotSubID":2,"jackpotSubKey":"major","jackpot":126839329770,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dingdongjackpots","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":120658640229,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dingdongjackpots","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":33201652743,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"dragonblast":[{"zoneID":0,"slotID":"dragonblast","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":21017407573,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonblast","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1019979304,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonblast","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":714911118,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonblast","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":78610123,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"dragonorbs":[{"zoneID":0,"slotID":"dragonorbs","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":5592888367,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonorbs","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1205618069,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonorbs","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1135393819,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonorbs","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":463300325,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"dragonsandpearls":[{"zoneID":0,"slotID":"dragonsandpearls","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":12889492301.19929,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonsandpearls","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":9150015379,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonsandpearls","jackpotSubID":2,"jackpotSubKey":"major","jackpot":889009256.8001074,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":7200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0037,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonsandpearls","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":256382646.40009856,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0076,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonsandpearls","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":198064046.60005796,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0079,"linked":false,"linkedKey":""}],"dragontales":[{"zoneID":0,"slotID":"dragontales","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":143920201119,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.009,"linked":true,"linkedKey":"dragontales_orientallanterns"},{"zoneID":0,"slotID":"dragontales","jackpotSubID":2,"jackpotSubKey":"major","jackpot":2896012248,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragontales","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":322789029,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragontales","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":70176921,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"dreamcitylights":[{"zoneID":0,"slotID":"dreamcitylights","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":996490909.6000136,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dreamcitylights","jackpotSubID":2,"jackpotSubKey":"major","jackpot":379772588.3999836,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dreamcitylights","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":107318380.59999618,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""}],"drmadwin":[{"zoneID":0,"slotID":"drmadwin","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"drmadwin","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"drmadwin","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"drmadwin","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"drmadwin","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"dualdiamondsstrike":[{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":8,"jackpotSubKey":"pink9jackpot","jackpot":156986777,"basePrize":4800,"basePrizeType":"BetPerLine","maxBasePrize":23040000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":7,"jackpotSubKey":"pink8jackpot","jackpot":568605373,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":5760000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":6,"jackpotSubKey":"pink7jackpot","jackpot":314094777,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":2880000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":5,"jackpotSubKey":"pink6jackpot","jackpot":95578492,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1440000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":4,"jackpotSubKey":"blue9jackpot","jackpot":156986777,"basePrize":4800,"basePrizeType":"BetPerLine","maxBasePrize":23040000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":3,"jackpotSubKey":"blue8jackpot","jackpot":568605373,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":5760000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":2,"jackpotSubKey":"blue7jackpot","jackpot":313390435,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":2880000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":1,"jackpotSubKey":"blue6jackpot","jackpot":94927659,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1440000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"dualfortunepot":[{"zoneID":0,"slotID":"dualfortunepot","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":65018190422.812645,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":3028641702.801652,"basePrize":3750,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":455097154.3997045,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":256537852.59999543,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0126,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":228386548.39993382,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0129,"linked":false,"linkedKey":""}],"dualfortunepot_dy":[{"zoneID":0,"slotID":"dualfortunepot_dy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":7500,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0126,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0129,"linked":false,"linkedKey":""}],"eggstraeaster":[{"zoneID":0,"slotID":"eggstraeaster","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":174853594.39999914,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"eggstraeaster","jackpotSubID":2,"jackpotSubKey":"major","jackpot":9867906.599996783,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"eggstraeaster","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1386100256.4000032,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"eggstraeaster","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":30121017.60000302,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"emeraldgreen":[{"zoneID":0,"slotID":"emeraldgreen","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":2036859945,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"emeraldgreen","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":1214527404,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"emeraldgreen","jackpotSubID":3,"jackpotSubKey":"major","jackpot":1004746829,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"emeraldgreen","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":297285341,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"emeraldgreen","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":43162964,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"emeraldgreen","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":700,"basePrizeType":"BetPerLine","maxBasePrize":840000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"emeraldislegold":[{"zoneID":0,"slotID":"emeraldislegold","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":103080574086,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"fatturkeywilds":[{"zoneID":0,"slotID":"fatturkeywilds","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":37920173921.4,"basePrize":980,"basePrizeType":"BetPerLine","maxBasePrize":117600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fatturkeywilds","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":19301390178.4,"basePrize":484,"basePrizeType":"BetPerLine","maxBasePrize":58080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fatturkeywilds","jackpotSubID":2,"jackpotSubKey":"major","jackpot":5206093926.8,"basePrize":188,"basePrizeType":"BetPerLine","maxBasePrize":22560000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"fireblastclassic":[{"zoneID":0,"slotID":"fireblastclassic","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":744899520,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fireblastclassic","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":434604893,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fireblastclassic","jackpotSubID":3,"jackpotSubKey":"major","jackpot":188744762,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fireblastclassic","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":57399277,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fireblastclassic","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":29769939,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fireblastclassic","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":5,"basePrizeType":"BetPerLine","maxBasePrize":120000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"firelockultimate":[{"zoneID":0,"slotID":"firelockultimate","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":430552785583,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"flamefurywheel":[{"zoneID":0,"slotID":"flamefurywheel","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":4700901186.798118,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"flamefurywheel","jackpotSubID":2,"jackpotSubKey":"major","jackpot":333435932.20147574,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"flamefurywheel","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":237610301.80395895,"basePrize":15,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"flamefurywheel","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":121009866.20430483,"basePrize":5,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"flameofliberty":[{"zoneID":0,"slotID":"flameofliberty","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":32524010144,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"flameofliberty","jackpotSubID":2,"jackpotSubKey":"major","jackpot":16026711254,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"flameofliberty","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3001957749,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"flameofliberty","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1332612204,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"fortunepot":[{"zoneID":0,"slotID":"fortunepot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":82015337361.41496,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortunepot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":26495188260.014626,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortunepot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":780246327.0850855,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0126,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortunepot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":548298321.7772859,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0129,"linked":false,"linkedKey":""}],"fortuneshrine":[{"zoneID":0,"slotID":"fortuneshrine","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":3313251962,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortuneshrine","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1503714815,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortuneshrine","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":114821734.99999845,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortuneshrine","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":71617654,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"fortunetree":[{"zoneID":0,"slotID":"fortunetree","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":560780095090,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortunetree","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":560656769844,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortunetree","jackpotSubID":2,"jackpotSubKey":"major","jackpot":172747642902,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortunetree","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3916496587,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortunetree","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1865487152,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""}],"frozenthronerespin":[{"zoneID":0,"slotID":"frozenthronerespin","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5979211608,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"fruityblast":[{"zoneID":0,"slotID":"fruityblast","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":1471876735.0997965,"basePrize":3990,"basePrizeType":"BetPerLine","maxBasePrize":47880000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fruityblast","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":7020477580.101599,"basePrize":1670,"basePrizeType":"BetPerLine","maxBasePrize":20040000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fruityblast","jackpotSubID":3,"jackpotSubKey":"major","jackpot":141651898322.79816,"basePrize":790,"basePrizeType":"BetPerLine","maxBasePrize":9480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fruityblast","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":74956705791.79768,"basePrize":270,"basePrizeType":"BetPerLine","maxBasePrize":3240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fruityblast","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":51415733426.601,"basePrize":110,"basePrizeType":"BetPerLine","maxBasePrize":1320000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fruityblast","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":9368026405.59981,"basePrize":40,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"fruityjewels":[{"zoneID":0,"slotID":"fruityjewels","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":24354279200,"basePrize":14400,"basePrizeType":"BetPerLine","maxBasePrize":43200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fruityjewels","jackpotSubID":2,"jackpotSubKey":"major","jackpot":14332179875,"basePrize":14400,"basePrizeType":"BetPerLine","maxBasePrize":43200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"gempackedwilds":[{"zoneID":0,"slotID":"gempackedwilds","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":7116658269,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"gempackedwilds","jackpotSubID":2,"jackpotSubKey":"major","jackpot":13005761392,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"gempackedwilds","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3027959598,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"gempackedwilds","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1307889591,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"gempackedwilds_dy":[{"zoneID":0,"slotID":"gempackedwilds_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"gempackedwilds_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"gempackedwilds_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":4320000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"gempackedwilds_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"golden100xdollar":[{"zoneID":0,"slotID":"golden100xdollar","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":536225231265.82,"basePrize":6000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"goldenbuffalofever":[{"zoneID":0,"slotID":"goldenbuffalofever","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":4559867838.2017975,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":80000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"goldenbuffalofever","jackpotSubID":2,"jackpotSubKey":"major","jackpot":5367104058.797469,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":10000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""}],"goldencrown":[{"zoneID":0,"slotID":"goldencrown","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":112655706237,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"goldeneagleking":[{"zoneID":0,"slotID":"goldeneagleking","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":69882779858,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"goldeneagleking","jackpotSubID":2,"jackpotSubKey":"major","jackpot":10677344459,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"goldeneagleking","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":148165021.99999356,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":900000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"goldeneagleking","jackpotSubID":0,"jackpotSubKey":"eagletrigger","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"goldenmoonfortune":[{"zoneID":0,"slotID":"goldenmoonfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":8814029326.999998,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":108000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"goldenmoonfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1088707954.0000157,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"goldenmoonfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":266261797,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":2160000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"goldenmoonfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":110867320.99999991,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"greatamerica":[{"zoneID":0,"slotID":"greatamerica","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":35893140680,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":21600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"greatamerica","jackpotSubID":1,"jackpotSubKey":"major","jackpot":2761915968,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"greatamerica","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":10428794285,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":5400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"highrisejackpot":[{"zoneID":0,"slotID":"highrisejackpot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":569206540.3999853,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"highrisejackpot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":395720871.60001403,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"highrisejackpot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":655408536.3999908,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"highrisejackpot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":455733242.6000142,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"hoardinggoblins":[{"zoneID":0,"slotID":"hoardinggoblins","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":966261876,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"hoardinggoblins","jackpotSubID":2,"jackpotSubKey":"major","jackpot":777442243,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"hoardinggoblins","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":293245707,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"hoardinggoblins","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":985597999,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"honeybeeparade":[{"zoneID":0,"slotID":"honeybeeparade","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":8157514961.599877,"basePrize":6250,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"honeybeeparade","jackpotSubID":2,"jackpotSubKey":"major","jackpot":5303386567.400122,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"honeybeeparade","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1411126079.600014,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"honeybeeparade","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":109233057.40000716,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":120000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"houndofhades":[{"zoneID":0,"slotID":"houndofhades","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":31536791750,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"houndofhades","jackpotSubID":2,"jackpotSubKey":"major","jackpot":7913217124,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"houndofhades","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":433769511,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"houndofhades","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":211332698,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"huffndoze":[{"zoneID":0,"slotID":"huffndoze","jackpotSubID":5,"jackpotSubKey":"mega","jackpot":12509412769,"basePrize":200000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"huffndoze","jackpotSubID":4,"jackpotSubKey":"major","jackpot":853964937,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"huffndoze","jackpotSubID":3,"jackpotSubKey":"minor2","jackpot":0,"basePrize":6000,"basePrizeType":"BetPerLine","maxBasePrize":7200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"huffndoze","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":0,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"huffndoze","jackpotSubID":1,"jackpotSubKey":"mini2","jackpot":0,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"huffndoze","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"imperialgoldfortune":[{"zoneID":0,"slotID":"imperialgoldfortune","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":43962252939,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"imperialgoldfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":54609150274,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"imperialgoldfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":11254164627,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"imperialgoldfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"imperialgoldfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"jacksmagicbeans":[{"zoneID":0,"slotID":"jacksmagicbeans","jackpotSubID":0,"jackpotSubKey":"freespin_feature","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"jiujiujiu999":[{"zoneID":0,"slotID":"jiujiujiu999","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":111408493168,"basePrize":32000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jiujiujiu999","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":205090840671,"basePrize":12000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jiujiujiu999","jackpotSubID":2,"jackpotSubKey":"major","jackpot":37060142083,"basePrize":2800,"basePrizeType":"BetPerLine","maxBasePrize":8400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jiujiujiu999","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":405127555,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jiujiujiu999","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"jollyrogerjackpot":[{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":10,"jackpotSubKey":"15jackpot","jackpot":1054985395,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":9,"jackpotSubKey":"14jackpot","jackpot":1419416847,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":8,"jackpotSubKey":"13jackpot","jackpot":682531477,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":19200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":7,"jackpotSubKey":"12jackpot","jackpot":149155646,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":6,"jackpotSubKey":"11jackpot","jackpot":214293438,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":7200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":5,"jackpotSubKey":"10jackpot","jackpot":138859763,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":4,"jackpotSubKey":"9jackpot","jackpot":147516829,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":3,"jackpotSubKey":"8jackpot","jackpot":130962095,"basePrize":65,"basePrizeType":"BetPerLine","maxBasePrize":1560000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":2,"jackpotSubKey":"7jackpot","jackpot":141345541,"basePrize":45,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":1,"jackpotSubKey":"6jackpot","jackpot":271430055,"basePrize":35,"basePrizeType":"BetPerLine","maxBasePrize":840000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":0,"jackpotSubKey":"5jackpot","jackpot":1707622901,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"jumbopiggies":[{"zoneID":0,"slotID":"jumbopiggies","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":8908430441,"basePrize":500000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jumbopiggies","jackpotSubID":2,"jackpotSubKey":"major","jackpot":3569380609,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jumbopiggies","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1811059709,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jumbopiggies","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":378809026,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"jurassicwildstomps":[{"zoneID":0,"slotID":"jurassicwildstomps","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jurassicwildstomps","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jurassicwildstomps","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":1500000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jurassicwildstomps","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"kongfury":[{"zoneID":0,"slotID":"kongfury","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2253005275.8000774,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"kongfury","jackpotSubID":2,"jackpotSubKey":"major","jackpot":2028796482.1999292,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"kongfury","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":439238720.8000663,"basePrize":1600,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"kongfury","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":521378691.1999701,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"kongsmash":[{"zoneID":0,"slotID":"kongsmash","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":17646967511,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"kongsmash","jackpotSubID":2,"jackpotSubKey":"major","jackpot":18675514549,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"kongsmash","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":6852323001,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"kongsmash","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1758282058.9999993,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"ladylibertyrespins":[{"zoneID":0,"slotID":"ladylibertyrespins","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":16331669933,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"ladylibertyrespins","jackpotSubID":2,"jackpotSubKey":"major","jackpot":11493580974,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"ladylibertyrespins","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3248239866,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"ladylibertyrespins","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":488804305,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":720000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"libertyeaglefortune":[{"zoneID":0,"slotID":"libertyeaglefortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":19476554689,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"libertyeaglefortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":19456628515,"basePrize":2700,"basePrizeType":"BetPerLine","maxBasePrize":32400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"libertyeaglefortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":44069637404,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"libertyeaglefortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":12830119495,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"locknrollfiver":[{"zoneID":0,"slotID":"locknrollfiver","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"locknrollfiver","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"locknrollfiver","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"locknrollfiver","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"lollylandgummyking":[{"zoneID":0,"slotID":"lollylandgummyking","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":555727386.0000134,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"lollylandgummyking","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1203464608.000036,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"lollylandgummyking","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":659225251.0000144,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"lollylandgummyking","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":56159875.00000107,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""}],"luckyamericanroll":[{"zoneID":0,"slotID":"luckyamericanroll","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":202540815543,"basePrize":4050,"basePrizeType":"BetPerLine","maxBasePrize":48600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"luckybunnydrop":[{"zoneID":0,"slotID":"luckybunnydrop","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"luckybunnydrop","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"luckybunnydrop","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"luckybunnydrop","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"luckybunnydrop","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"magmaficent":[{"zoneID":0,"slotID":"magmaficent","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":1509860574,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"magmaficent","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1355614045,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"magmaficent","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3203072126,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"magmaficent","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":384188359,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"makeitrain":[{"zoneID":0,"slotID":"makeitrain","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":26402310289,"basePrize":1950,"basePrizeType":"BetPerLine","maxBasePrize":46800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"marineadventure":[{"zoneID":0,"slotID":"marineadventure","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":47341011213,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":86400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"marineadventure","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":0,"basePrize":720,"basePrizeType":"BetPerLine","maxBasePrize":8640000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"marineadventure","jackpotSubID":1,"jackpotSubKey":"major","jackpot":0,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":2160000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"marineadventure","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"megabingoclassic":[{"zoneID":0,"slotID":"megabingoclassic","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":12696192576,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"megabingoclassic","jackpotSubID":2,"jackpotSubKey":"major","jackpot":4709875591,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"megabingoclassic","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"megabingoclassic","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"megatondynamite":[{"zoneID":0,"slotID":"megatondynamite","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":35676178582,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"megatondynamite","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":8640000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"megatondynamite","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":3600,"basePrizeType":"BetPerLine","maxBasePrize":4320000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"meowgicalhalloween":[{"zoneID":0,"slotID":"meowgicalhalloween","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"meowgicalhalloween","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"meowgicalhalloween","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"meowgicalhalloween","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"meowgicalhalloween","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":960000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"moneystax":[{"zoneID":0,"slotID":"moneystax","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":30872771645,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"moneystax","jackpotSubID":2,"jackpotSubKey":"major","jackpot":27047125572,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"moneystax","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":19881468343,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"moneystax","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":5583037166,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"moonlightwolf":[{"zoneID":0,"slotID":"moonlightwolf","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":10939777714,"basePrize":1950,"basePrizeType":"BetPerLine","maxBasePrize":46800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"moonlightwolf_dy":[{"zoneID":0,"slotID":"moonlightwolf_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":3950,"basePrizeType":"BetPerLine","maxBasePrize":94800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"mooorecheddar":[{"zoneID":0,"slotID":"mooorecheddar","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mooorecheddar","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mooorecheddar","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mooorecheddar","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"mysterrier":[{"zoneID":0,"slotID":"mysterrier","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":11262652963,"basePrize":75000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mysterrier","jackpotSubID":2,"jackpotSubKey":"major","jackpot":154119003,"basePrize":3750,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mysterrier","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mysterrier","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"mysticgypsy":[{"zoneID":0,"slotID":"mysticgypsy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":117341599808,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":true,"linkedKey":"mysticgypsi_curiousmermaid"},{"zoneID":0,"slotID":"mysticgypsy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":6462006306,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mysticgypsy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mysticgypsy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"nudginglockclassic":[{"zoneID":0,"slotID":"nudginglockclassic","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":7051444629.5,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"nudginglockclassic_dy":[{"zoneID":0,"slotID":"nudginglockclassic_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"nuttysquirrel":[{"zoneID":0,"slotID":"nuttysquirrel","jackpotSubID":2,"jackpotSubKey":"grand","jackpot":10812189932,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"nuttysquirrel","jackpotSubID":1,"jackpotSubKey":"major","jackpot":172507578,"basePrize":225,"basePrizeType":"BetPerLine","maxBasePrize":5400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"nuttysquirrel","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":182489414,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"orientallanterns":[{"zoneID":0,"slotID":"orientallanterns","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":143920573719,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.009,"linked":true,"linkedKey":"dragontales_orientallanterns"},{"zoneID":0,"slotID":"orientallanterns","jackpotSubID":2,"jackpotSubKey":"major","jackpot":3406092912,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"orientallanterns","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":489245055,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"orientallanterns","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":83104247,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"pawpawneko":[{"zoneID":0,"slotID":"pawpawneko","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":635720791,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawpawneko","jackpotSubID":2,"jackpotSubKey":"major","jackpot":553409878,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawpawneko","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":523052415,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawpawneko","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":34130137.99999718,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"pawsomepanda":[{"zoneID":0,"slotID":"pawsomepanda","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":7696373388,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawsomepanda","jackpotSubID":4,"jackpotSubKey":"super","jackpot":277711441,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawsomepanda","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":77268688,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawsomepanda","jackpotSubID":2,"jackpotSubKey":"major","jackpot":58744281,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawsomepanda","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":54306801,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawsomepanda","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":79895817,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""}],"peachyfortune":[{"zoneID":0,"slotID":"peachyfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":12936515024,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"peachyfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":3570451962,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"peachyfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":492449520,"basePrize":625,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"peachyfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":73685886.9999888,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"penguinforce":[{"zoneID":0,"slotID":"penguinforce","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2928017729.56,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"penguinforce","jackpotSubID":2,"jackpotSubKey":"major","jackpot":248045258.34,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"penguinforce","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":294510304.68,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"penguinforce","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":110599893.01999728,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"pharaohsbeetlelink":[{"zoneID":0,"slotID":"pharaohsbeetlelink","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":748598549633,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsbeetlelink","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsbeetlelink","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsbeetlelink","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"pharaohsbeetlelink_dy":[{"zoneID":0,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":60000,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.04,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"pharaohsecrets":[{"zoneID":0,"slotID":"pharaohsecrets","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":26561060958.40142,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsecrets","jackpotSubID":2,"jackpotSubKey":"major","jackpot":37490958875.601715,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsecrets","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":9463824703.399826,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsecrets","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":63455108.60001713,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"phoenixignite":[{"zoneID":0,"slotID":"phoenixignite","jackpotSubID":2,"jackpotSubKey":"grand","jackpot":16752813435,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"phoenixignite","jackpotSubID":1,"jackpotSubKey":"mega","jackpot":0,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"phoenixignite","jackpotSubID":0,"jackpotSubKey":"major","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"phoenixignite_dy":[{"zoneID":0,"slotID":"phoenixignite_dy","jackpotSubID":2,"jackpotSubKey":"grand","jackpot":0,"basePrize":80000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"phoenixignite_dy","jackpotSubID":1,"jackpotSubKey":"mega","jackpot":0,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"phoenixignite_dy","jackpotSubID":0,"jackpotSubKey":"major","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggybankriches":[{"zoneID":0,"slotID":"piggybankriches","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":905389807539,"basePrize":300000,"basePrizeType":"BetPerLine","maxBasePrize":720000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggybankriches","jackpotSubID":2,"jackpotSubKey":"major","jackpot":4140495546,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggybankriches","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggybankriches","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggybankriches_dy":[{"zoneID":0,"slotID":"piggybankriches_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6918714,"basePrize":300000,"basePrizeType":"BetPerLine","maxBasePrize":720000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggybankriches_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":13084764,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggybankriches_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggybankriches_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggyhouses":[{"zoneID":0,"slotID":"piggyhouses","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":13997457015.999834,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggyhouses","jackpotSubID":2,"jackpotSubKey":"major","jackpot":828722635.9999729,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggyhouses","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggyhouses","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggymania":[{"zoneID":0,"slotID":"piggymania","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":28374004565.200615,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":7771834369.599824,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0007,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania","jackpotSubID":3,"jackpotSubKey":"major","jackpot":262381540.39988142,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0018,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":326074429.7999829,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":56122086.199996114,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0054,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":19207309.999999586,"basePrize":30,"basePrizeType":"BetPerLine","maxBasePrize":360000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0072,"linked":false,"linkedKey":""}],"piggymania_dy":[{"zoneID":0,"slotID":"piggymania_dy","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":0,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania_dy","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":0,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0007,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania_dy","jackpotSubID":3,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0018,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania_dy","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania_dy","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0054,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania_dy","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":60,"basePrizeType":"BetPerLine","maxBasePrize":720000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0072,"linked":false,"linkedKey":""}],"pinataparade":[{"zoneID":0,"slotID":"pinataparade","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":58892265590,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinataparade","jackpotSubID":2,"jackpotSubKey":"major","jackpot":52270925268,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinataparade","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":7955688123,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"pinkstardiamonds":[{"zoneID":0,"slotID":"pinkstardiamonds","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":144269861168,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinkstardiamonds","jackpotSubID":2,"jackpotSubKey":"major","jackpot":46605235959,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinkstardiamonds","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1019018440,"basePrize":70,"basePrizeType":"BetPerLine","maxBasePrize":8400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinkstardiamonds","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"pinupparadise":[{"zoneID":0,"slotID":"pinupparadise","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":589135943,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinupparadise","jackpotSubID":2,"jackpotSubKey":"major","jackpot":607844991,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinupparadise","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":257948530,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinupparadise","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":134733835,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"piratebootyrapidhit":[{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":8,"jackpotSubKey":"30Jackpot","jackpot":85183705770,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":7,"jackpotSubKey":"24Jackpot","jackpot":54899734515,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":6,"jackpotSubKey":"21Jackpot","jackpot":3673696305,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":5,"jackpotSubKey":"18Jackpot","jackpot":1996997582,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":4,"jackpotSubKey":"15Jackpot","jackpot":382690940,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":3,"jackpotSubKey":"12Jackpot","jackpot":68827872,"basePrize":80,"basePrizeType":"BetPerLine","maxBasePrize":1920000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":2,"jackpotSubKey":"10Jackpot","jackpot":60498438,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":1,"jackpotSubKey":"08Jackpot","jackpot":20969713,"basePrize":35,"basePrizeType":"BetPerLine","maxBasePrize":840000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":0,"jackpotSubKey":"06Jackpot","jackpot":5164914,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"poseidonwildwaves":[{"zoneID":0,"slotID":"poseidonwildwaves","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":7250470068,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"poseidonwildwaves","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1365092823,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"poseidonwildwaves","jackpotSubID":2,"jackpotSubKey":"major","jackpot":28442036,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"poseidonwildwaves","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":6182722,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"poseidonwildwaves","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":8223865,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""}],"pumpkinfortune":[{"zoneID":0,"slotID":"pumpkinfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":18491496348.001354,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pumpkinfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":8335831729.999097,"basePrize":1875,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pumpkinfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":397158687.99998915,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pumpkinfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":432435655.0000174,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"raccoonshowdown":[{"zoneID":0,"slotID":"raccoonshowdown","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6112436183,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"raccoonshowdown","jackpotSubID":2,"jackpotSubKey":"major","jackpot":25753919618.60044,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0037,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"raccoonshowdown","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2240060140.799935,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0076,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"raccoonshowdown","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":335536086.1999843,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0079,"linked":false,"linkedKey":""}],"railroadraiders":[{"zoneID":0,"slotID":"railroadraiders","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":4791816743,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"railroadraiders","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"railroadraiders","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"railroadraiders","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"railroadraiders","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"rainbowpearl":[{"zoneID":0,"slotID":"rainbowpearl","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6538878591,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""}],"rainbowpearl_dy":[{"zoneID":0,"slotID":"rainbowpearl_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.03,"linked":false,"linkedKey":""}],"rapidhitantarctic":[{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":11,"jackpotSubKey":"grand","jackpot":9952035154,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":10,"jackpotSubKey":"mega","jackpot":2949710190,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":9,"jackpotSubKey":"major","jackpot":790398072,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":8,"jackpotSubKey":"minor","jackpot":224082155,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":7,"jackpotSubKey":"mini","jackpot":97212862,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":7200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":6,"jackpotSubKey":"10RapodHitJackpot","jackpot":0,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":5,"jackpotSubKey":"9RapodHitJackpot","jackpot":0,"basePrize":450,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":4,"jackpotSubKey":"8RapodHitJackpot","jackpot":0,"basePrize":270,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":3,"jackpotSubKey":"7RapodHitJackpot","jackpot":0,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":720000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":2,"jackpotSubKey":"6RapodHitJackpot","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":360000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":1,"jackpotSubKey":"5RapodHitJackpot","jackpot":0,"basePrize":60,"basePrizeType":"BetPerLine","maxBasePrize":240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":0,"jackpotSubKey":"4RapodHitJackpot","jackpot":0,"basePrize":30,"basePrizeType":"BetPerLine","maxBasePrize":120000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"rhinoblitz":[{"zoneID":0,"slotID":"rhinoblitz","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":16479043125.234697,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rhinoblitz","jackpotSubID":2,"jackpotSubKey":"major","jackpot":2949606286.1950297,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0011,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rhinoblitz","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2693086420.0351977,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":2880000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rhinoblitz","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":830050410.0349145,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":1440000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"robinhoodsecondshot":[{"zoneID":0,"slotID":"robinhoodsecondshot","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":409377709.39998704,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":40000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"robinhoodsecondshot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1343784293.8000088,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":8000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0011,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"robinhoodsecondshot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":261498770,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"robinhoodsecondshot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":228447542.40000555,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0023,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"robinhoodsecondshot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":48269249.3999982,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"rockingbell":[{"zoneID":0,"slotID":"rockingbell","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":17395058738.75,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"rollthedice":[{"zoneID":0,"slotID":"rollthedice","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":410740326601,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"rudolphexpress":[{"zoneID":0,"slotID":"rudolphexpress","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":94604963759,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"sakuraninja":[{"zoneID":0,"slotID":"sakuraninja","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5483150228,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"sakuraninja","jackpotSubID":2,"jackpotSubKey":"major","jackpot":84527569,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"sakuraninja","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":63806987,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"sakuraninja","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":36457783,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""}],"sevenglory":[{"zoneID":0,"slotID":"sevenglory","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":2071834995.3999455,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"sevenglory","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2512882361.6000447,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":21600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"sevenglory","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1161093466.6000433,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":21600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"sevenglory","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1828513620.2001016,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"sevenglory","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2024238722.2001011,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"shamrocklock":[{"zoneID":0,"slotID":"shamrocklock","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":31467826700,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shamrocklock","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":3617505908,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shamrocklock","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1355719931,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shamrocklock","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":312034130,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shamrocklock","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":121831763,"basePrize":40,"basePrizeType":"BetPerLine","maxBasePrize":960000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"shanghaiexpress":[{"zoneID":0,"slotID":"shanghaiexpress","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1061269513,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shanghaiexpress","jackpotSubID":2,"jackpotSubKey":"major","jackpot":700802123,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shanghaiexpress","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":81151671,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shanghaiexpress","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":42128994,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""}],"shanghaifullmoon":[{"zoneID":0,"slotID":"shanghaifullmoon","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":246612436731,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":86400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shanghaifullmoon","jackpotSubID":2,"jackpotSubKey":"major","jackpot":34539394395,"basePrize":720,"basePrizeType":"BetPerLine","maxBasePrize":8640000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shanghaifullmoon","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":2160000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shanghaifullmoon","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"shopaholic":[{"zoneID":0,"slotID":"shopaholic","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2651504930.199773,"basePrize":6250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shopaholic","jackpotSubID":2,"jackpotSubKey":"major","jackpot":9804134318.799662,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shopaholic","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":350612347.1999771,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shopaholic","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":189339053.80001685,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"smashncash":[{"zoneID":0,"slotID":"smashncash","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":26692586997,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"starryholidays":[{"zoneID":0,"slotID":"starryholidays","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":34270964402,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"starryholidays","jackpotSubID":2,"jackpotSubKey":"major","jackpot":53624014195,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"starryholidays","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":575529522,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"starryholidays","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":407329204,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":360000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"super25deluxe":[{"zoneID":0,"slotID":"super25deluxe","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1521501064,"basePrize":980,"basePrizeType":"BetPerLine","maxBasePrize":11760000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"super25deluxe_dy":[{"zoneID":0,"slotID":"super25deluxe_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"superdrumbash":[{"zoneID":0,"slotID":"superdrumbash","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":17222614950,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"superdrumbash","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":36164112748,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"superdrumbash","jackpotSubID":2,"jackpotSubKey":"major","jackpot":7741947038,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"superdrumbash","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":9182324740,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"superdrumbash","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2066895984,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"supernovablasts":[{"zoneID":0,"slotID":"supernovablasts","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":20493419779,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":480000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supernovablasts","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":12996507034,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supernovablasts","jackpotSubID":2,"jackpotSubKey":"major","jackpot":7690977489,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supernovablasts","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":388116746,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supernovablasts","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":29415658,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"supersevenblasts":[{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":8,"jackpotSubKey":"36Jackpot","jackpot":2691427884,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":7,"jackpotSubKey":"30Jackpot","jackpot":2369737116,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":6,"jackpotSubKey":"25Jackpot","jackpot":546359947,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":5,"jackpotSubKey":"21Jackpot","jackpot":209754231,"basePrize":700,"basePrizeType":"BetPerLine","maxBasePrize":8400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":4,"jackpotSubKey":"18Jackpot","jackpot":116404712,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":3,"jackpotSubKey":"15Jackpot","jackpot":65752848,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":2,"jackpotSubKey":"12Jackpot","jackpot":36055145,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":1,"jackpotSubKey":"09Jackpot","jackpot":16308721,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":0,"jackpotSubKey":"06Jackpot","jackpot":3038414,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"talesofarcadia":[{"zoneID":0,"slotID":"talesofarcadia","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":10278734129,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"talesofarcadia","jackpotSubID":4,"jackpotSubKey":"super","jackpot":4558766508,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"talesofarcadia","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":298547862,"basePrize":625,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"talesofarcadia","jackpotSubID":2,"jackpotSubKey":"major","jackpot":145002459,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"talesofarcadia","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":64143751,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"talesofarcadia","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":62584510,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""}],"templeofathena":[{"zoneID":0,"slotID":"templeofathena","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":288197335962,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"thanksgivinggalore":[{"zoneID":0,"slotID":"thanksgivinggalore","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5054297113.399985,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thanksgivinggalore","jackpotSubID":2,"jackpotSubKey":"major","jackpot":5509231054.599945,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thanksgivinggalore","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":358288242,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"thearcanealchemist":[{"zoneID":0,"slotID":"thearcanealchemist","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":3749398969,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":108000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thearcanealchemist","jackpotSubID":2,"jackpotSubKey":"major","jackpot":993298452,"basePrize":225,"basePrizeType":"BetPerLine","maxBasePrize":5400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thearcanealchemist","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":276303015,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thearcanealchemist","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":97120222,"basePrize":45,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"thebeastssecret":[{"zoneID":0,"slotID":"thebeastssecret","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1379773305,"basePrize":19200,"basePrizeType":"BetPerLine","maxBasePrize":23040000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thebeastssecret","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1291882735,"basePrize":4800,"basePrizeType":"BetPerLine","maxBasePrize":5760000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thebeastssecret","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":252323748,"basePrize":2400,"basePrizeType":"BetPerLine","maxBasePrize":2880000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thebeastssecret","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":494330145,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":1440000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"thehogmancer":[{"zoneID":0,"slotID":"thehogmancer","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":7984646584,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thehogmancer","jackpotSubID":2,"jackpotSubKey":"major","jackpot":66246781,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thehogmancer","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":12174223,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thehogmancer","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":10769454,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"themobking":[{"zoneID":0,"slotID":"themobking","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":29093956305,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"themobking","jackpotSubID":2,"jackpotSubKey":"major","jackpot":38575506045,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"themobking","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1736655300,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"theoddranch":[{"zoneID":0,"slotID":"theoddranch","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":17052146174,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"theoddranch","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"theoddranch","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"theoddranch","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"theoztales":[{"zoneID":0,"slotID":"theoztales","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":6374061677,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"theoztales","jackpotSubID":2,"jackpotSubKey":"major","jackpot":849153072,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"theoztales","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":523149723,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"theoztales","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":71113549.99999806,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"thunderstrike":[{"zoneID":0,"slotID":"thunderstrike","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":14952596577.129942,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thunderstrike","jackpotSubID":2,"jackpotSubKey":"major","jackpot":36307769672.84437,"basePrize":1875,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thunderstrike","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":99725332.72999518,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thunderstrike","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":203745358.79489926,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"toadallyrich":[{"zoneID":0,"slotID":"toadallyrich","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":18609430363,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"toadallyrich","jackpotSubID":2,"jackpotSubKey":"major","jackpot":945178699,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"toadallyrich","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":296465897,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"toadallyrich","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":117352106,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"triplewheelsupreme":[{"zoneID":0,"slotID":"triplewheelsupreme","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":10868341393,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"triplewheelsupreme","jackpotSubID":2,"jackpotSubKey":"major","jackpot":13271850701,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"triplewheelsupreme","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":409271135,"basePrize":160,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"triplewheelsupreme","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":515685909,"basePrize":80,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"twilightdragon":[{"zoneID":0,"slotID":"twilightdragon","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1427492649,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"twilightdragon","jackpotSubID":2,"jackpotSubKey":"major","jackpot":486818114,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"twilightdragon","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":34262383,"basePrize":40,"basePrizeType":"BetPerLine","maxBasePrize":960000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"twilightdragon","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":33519211,"basePrize":20,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"vampressmansion":[{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":9,"jackpotSubKey":"royalGrand","jackpot":0,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":8,"jackpotSubKey":"royalMega","jackpot":0,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":5400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":7,"jackpotSubKey":"royalMajor","jackpot":0,"basePrize":3600,"basePrizeType":"BetPerLine","maxBasePrize":4320000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":6,"jackpotSubKey":"royalMinor","jackpot":0,"basePrize":2700,"basePrizeType":"BetPerLine","maxBasePrize":3240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":5,"jackpotSubKey":"royalMini","jackpot":0,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":2160000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":5400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":2700000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":2160000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1350,"basePrizeType":"BetPerLine","maxBasePrize":1620000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"vivalasvegas":[{"zoneID":0,"slotID":"vivalasvegas","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":37185351821,"basePrize":12000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vivalasvegas","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":16948714238,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vivalasvegas","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vivalasvegas","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vivalasvegas","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"volcanictahiti":[{"zoneID":0,"slotID":"volcanictahiti","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"volcanictahiti","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":450,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"volcanictahiti","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"volcanictahiti","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"volcanictahiti","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":360000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"wickedlildevil":[{"zoneID":0,"slotID":"wickedlildevil","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":2358650482,"basePrize":200000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wickedlildevil","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":288125358,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wickedlildevil","jackpotSubID":2,"jackpotSubKey":"major","jackpot":244919767,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wickedlildevil","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":85008982,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wickedlildevil","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":74336164,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"wildbunch":[{"zoneID":0,"slotID":"wildbunch","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":254896919826,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"wildhearts":[{"zoneID":0,"slotID":"wildhearts","jackpotSubID":9,"jackpotSubKey":"9jackpot","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":8,"jackpotSubKey":"8jackpot","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":14400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":7,"jackpotSubKey":"7jackpot","jackpot":0,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":6,"jackpotSubKey":"6jackpot","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":5,"jackpotSubKey":"5jackpot","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":4,"jackpotSubKey":"4jackpot","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":25558247940,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1935080555,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":660782472,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":43195367,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"wildhearts_dy":[{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":9,"jackpotSubKey":"9jackpot","jackpot":0,"basePrize":3750,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":8,"jackpotSubKey":"8jackpot","jackpot":0,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":21600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":7,"jackpotSubKey":"7jackpot","jackpot":0,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":6,"jackpotSubKey":"6jackpot","jackpot":0,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":5,"jackpotSubKey":"5jackpot","jackpot":0,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":4,"jackpotSubKey":"4jackpot","jackpot":0,"basePrize":37,"basePrizeType":"BetPerLine","maxBasePrize":888000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"winningrolls":[{"zoneID":0,"slotID":"winningrolls","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":201729775764,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"winyourheart":[{"zoneID":0,"slotID":"winyourheart","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1233190251,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"winyourheart","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1891059404,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"winyourheart","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":208459327,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"winyourheart","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":83579650,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":960000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"witchpumpkins":[{"zoneID":0,"slotID":"witchpumpkins","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":3148255695,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchpumpkins","jackpotSubID":2,"jackpotSubKey":"major","jackpot":989146606,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchpumpkins","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":135171258.9999916,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchpumpkins","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":90291871,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"witchpumpkins_dy":[{"zoneID":0,"slotID":"witchpumpkins_dy","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":75000,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchpumpkins_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchpumpkins_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchpumpkins_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"witchsapples":[{"zoneID":0,"slotID":"witchsapples","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":21924322032,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchsapples","jackpotSubID":2,"jackpotSubKey":"major","jackpot":3027527332,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchsapples","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchsapples","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"zeusthundershower":[{"zoneID":0,"slotID":"zeusthundershower","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":14697199412,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zeusthundershower","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1722229296,"basePrize":7500,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zeusthundershower","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":508514722,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zeusthundershower","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":776025500,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"zhuquefortune":[{"zoneID":0,"slotID":"zhuquefortune","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":9496782849,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zhuquefortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5190713549,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zhuquefortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":8008452263,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zhuquefortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zhuquefortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"zippyjackpots":[{"zoneID":0,"slotID":"zippyjackpots","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":53222287805,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zippyjackpots","jackpotSubID":2,"jackpotSubKey":"major","jackpot":12252033578,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zippyjackpots","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1280527811,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zippyjackpots","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":215679436,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}]},"1":{"4thofjulywildrespin":[{"zoneID":1,"slotID":"4thofjulywildrespin","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":19698469059,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"4thofjulywildrespin","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":62898729040,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"4thofjulywildrespin","jackpotSubID":3,"jackpotSubKey":"major","jackpot":30205419539,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"4thofjulywildrespin","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":23141453179,"basePrize":875,"basePrizeType":"BetPerLine","maxBasePrize":105000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"4thofjulywildrespin","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":478106724,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"4thofjulywildrespin","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"abracadabra":[{"zoneID":1,"slotID":"abracadabra","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":199382143338,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":2160000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"alienamigos":[{"zoneID":1,"slotID":"alienamigos","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":837960805599,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alienamigos","jackpotSubID":2,"jackpotSubKey":"major","jackpot":833479889759,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alienamigos","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alienamigos","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"allamerican":[{"zoneID":1,"slotID":"allamerican","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":565537491692,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"allamerican","jackpotSubID":2,"jackpotSubKey":"major","jackpot":197039635689,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"allamerican","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"allamerican","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"allstarcircus":[{"zoneID":1,"slotID":"allstarcircus","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":18242093390,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"allstarcircus","jackpotSubID":2,"jackpotSubKey":"major","jackpot":6166182953,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"allstarcircus","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3665910084,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"allstarcircus","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":5317709927,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"alohahawaii":[{"zoneID":1,"slotID":"alohahawaii","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":2729873803220,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":260616596118,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii","jackpotSubID":2,"jackpotSubKey":"major","jackpot":140484405030,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"alohahawaii_dy":[{"zoneID":1,"slotID":"alohahawaii_dy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":2830112119960,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":317653525226,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":360000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":284895450717,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"american9eagles":[{"zoneID":1,"slotID":"american9eagles","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":627799069372,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"american9eagles","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":250495496599,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"american9eagles","jackpotSubID":2,"jackpotSubKey":"major","jackpot":74000883495,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"american9eagles","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":16048453266,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"american9eagles","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":8767022117,"basePrize":320,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.045,"linked":false,"linkedKey":""}],"americanvalor":[{"zoneID":1,"slotID":"americanvalor","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":119188887529,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"apocalypselasthope":[{"zoneID":1,"slotID":"apocalypselasthope","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":4499778533,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"apocalypselasthope","jackpotSubID":2,"jackpotSubKey":"major","jackpot":4651293602,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"apocalypselasthope","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":11446375123.999998,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"apocalypselasthope","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1195534674,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"aztecodyssey":[{"zoneID":1,"slotID":"aztecodyssey","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":55961673730,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"aztecodyssey","jackpotSubID":2,"jackpotSubKey":"major","jackpot":18153628612,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"aztecodyssey","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"aztecodyssey","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":80,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"babysantawild":[{"zoneID":1,"slotID":"babysantawild","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":1815538248895,"basePrize":980,"basePrizeType":"BetPerLine","maxBasePrize":2940000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"babysantawild","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":806652394482,"basePrize":484,"basePrizeType":"BetPerLine","maxBasePrize":1452000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"babysantawild","jackpotSubID":2,"jackpotSubKey":"major","jackpot":66028665535,"basePrize":188,"basePrizeType":"BetPerLine","maxBasePrize":564000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"bankofwealth":[{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":9,"jackpotSubKey":"grand","jackpot":648928888084,"basePrize":45000,"basePrizeType":"BetPerLine","maxBasePrize":1350000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":8,"jackpotSubKey":"mega","jackpot":31200810047,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":7,"jackpotSubKey":"major","jackpot":10408184490,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":135000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":6,"jackpotSubKey":"minor","jackpot":1298114299,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":67500000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":5,"jackpotSubKey":"mini","jackpot":378019198,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":0,"jackpotSubKey":"classic1","jackpot":8487325188,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":1,"jackpotSubKey":"classic2","jackpot":34323093322,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":135000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":2,"jackpotSubKey":"classic3","jackpot":276091497973,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":3,"jackpotSubKey":"classic4","jackpot":187357539531,"basePrize":45000,"basePrizeType":"BetPerLine","maxBasePrize":1350000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":4,"jackpotSubKey":"classic5","jackpot":337077589101,"basePrize":90000,"basePrizeType":"BetPerLine","maxBasePrize":2700000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"beelovedjars":[{"zoneID":1,"slotID":"beelovedjars","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":8193373172,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"beelovedjars","jackpotSubID":2,"jackpotSubKey":"major","jackpot":17674580903,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"beelovedjars","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":14891569682,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"beelovedjars","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":447347641,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"bellstrikefrenzy":[{"zoneID":1,"slotID":"bellstrikefrenzy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":6592657137839,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"bigbucksbounty":[{"zoneID":1,"slotID":"bigbucksbounty","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":147722212778,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bigbucksbounty","jackpotSubID":2,"jackpotSubKey":"major","jackpot":4519252383,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bigbucksbounty","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3904711246,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bigbucksbounty","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":714722525,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"bingotrio":[{"zoneID":1,"slotID":"bingotrio","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":1712537690080,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bingotrio","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":70652864019,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bingotrio","jackpotSubID":2,"jackpotSubKey":"major","jackpot":25302386693,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bingotrio","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4421135740,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bingotrio","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1339656775,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""}],"birdjackpot":[{"zoneID":1,"slotID":"birdjackpot","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":1984432881041.4,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":102194301843.4,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":33482535807.8,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":5437184966.2,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1849371799.2,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""}],"birdjackpot_dy":[{"zoneID":1,"slotID":"birdjackpot_dy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":608367681121,"basePrize":96000,"basePrizeType":"BetPerLine","maxBasePrize":7200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":131672728767,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":22302341709,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4974877031,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":927401923,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.008,"linked":false,"linkedKey":""}],"blackwhitetiger":[{"zoneID":1,"slotID":"blackwhitetiger","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":49353115234,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"blackwhitetiger","jackpotSubID":2,"jackpotSubKey":"major","jackpot":184860525490,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":225000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"blackwhitetiger","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":10789402474.999979,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"blackwhitetiger","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":9412663417,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"blazingbullwild":[{"zoneID":1,"slotID":"blazingbullwild","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":484969880801,"basePrize":32000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"blazingbullwild","jackpotSubID":3,"jackpotSubKey":"major","jackpot":397671739119,"basePrize":6400,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"blazingbullwild","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":77575668579,"basePrize":1600,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"blazingbullwild","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":18218130374,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"blazingbullwild","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":160,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"bloodgems":[{"zoneID":1,"slotID":"bloodgems","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":90826032132,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bloodgems","jackpotSubID":2,"jackpotSubKey":"major","jackpot":163614575797,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bloodgems","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":56661957951,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bloodgems","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":120742415958,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"bonanzaexpress":[{"zoneID":1,"slotID":"bonanzaexpress","jackpotSubID":0,"jackpotSubKey":"grand","jackpot":998636374024,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"boonanza":[{"zoneID":1,"slotID":"boonanza","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":389366480841,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"boonanza","jackpotSubID":2,"jackpotSubKey":"major","jackpot":6400519490,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"boonanza","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4444247599,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"boonanza","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2984913573,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"bunnybank":[{"zoneID":1,"slotID":"bunnybank","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":40799587700,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"bunnybank_dy":[{"zoneID":1,"slotID":"bunnybank_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":8317344210,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"candycastle":[{"zoneID":1,"slotID":"candycastle","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":8554119987,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"candycastle","jackpotSubID":2,"jackpotSubKey":"major","jackpot":8776508550,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"candycastle","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":12763359607,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":80000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"candycastle","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":4868897009,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"captainblackpurr":[{"zoneID":1,"slotID":"captainblackpurr","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":208647268110,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"captainblackpurr","jackpotSubID":2,"jackpotSubKey":"major","jackpot":118294514734,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"captainblackpurr","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":179964352399,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"captainblackpurr","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":18553640832,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"carnivalinrio":[{"zoneID":1,"slotID":"carnivalinrio","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":125006569253,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"cashshowdown":[{"zoneID":1,"slotID":"cashshowdown","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":35797750455,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"cashshowdown","jackpotSubID":1,"jackpotSubKey":"major","jackpot":32802185484,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"cashshowdowndeluxe":[{"zoneID":1,"slotID":"cashshowdowndeluxe","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":1050,"basePrizeType":"BetPerLine","maxBasePrize":3150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"casinoroyale":[{"zoneID":1,"slotID":"casinoroyale","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":7883373222662,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"casinoroyale","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"casinoroyale","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"casinoroyale","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"casinoroyale_dy":[{"zoneID":1,"slotID":"casinoroyale_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":186139560000,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"casinoroyale_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"casinoroyale_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"casinoroyale_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"chilichilifever":[{"zoneID":1,"slotID":"chilichilifever","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":77831830672,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"chilichilifever","jackpotSubID":2,"jackpotSubKey":"major","jackpot":239749842124,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"chilichilifever","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2448228329.9999943,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"chilichilifever","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":5480622020,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":22500000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"classiclockrollgrand":[{"zoneID":1,"slotID":"classiclockrollgrand","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":4594867508238,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classiclockrollgrand","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classiclockrollgrand","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":216000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classiclockrollgrand","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":3600,"basePrizeType":"BetPerLine","maxBasePrize":108000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"classicstar":[{"zoneID":1,"slotID":"classicstar","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":16495759527,"basePrize":1700,"basePrizeType":"BetPerLine","maxBasePrize":1020000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classicstar","jackpotSubID":2,"jackpotSubKey":"major","jackpot":3038473953,"basePrize":700,"basePrizeType":"BetPerLine","maxBasePrize":420000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classicstar","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1301118836.9999762,"basePrize":450,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classicstar","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":397118447,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0008,"linked":false,"linkedKey":""}],"classicstar_dy":[{"zoneID":1,"slotID":"classicstar_dy","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":14470404839,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classicstar_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1464449506,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classicstar_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":14172343539,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classicstar_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":402641133,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0008,"linked":false,"linkedKey":""}],"cupidlovespells":[{"zoneID":1,"slotID":"cupidlovespells","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":1220449977,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"cupidlovespells","jackpotSubID":1,"jackpotSubKey":"major","jackpot":198231763581,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"cupidlovespells","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":4778259899,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"cupidloveydovey":[{"zoneID":1,"slotID":"cupidloveydovey","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":2653428989,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"cupidloveydovey","jackpotSubID":2,"jackpotSubKey":"major","jackpot":14383977210,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"cupidloveydovey","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2831941157,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"cupidloveydovey","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2393105685.999976,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"curiousmermaid":[{"zoneID":1,"slotID":"curiousmermaid","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5319099596712,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":true,"linkedKey":"mysticgypsi_curiousmermaid"},{"zoneID":1,"slotID":"curiousmermaid","jackpotSubID":2,"jackpotSubKey":"major","jackpot":397261243566,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"curiousmermaid","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"curiousmermaid","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"dakotafarmgirl":[{"zoneID":1,"slotID":"dakotafarmgirl","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":6000,"basePrizeType":"BetPerLine","maxBasePrize":360000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dakotafarmgirl","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dakotafarmgirl","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dakotafarmgirl","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dakotafarmgirl","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"davyjonesslocker":[{"zoneID":1,"slotID":"davyjonesslocker","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":69902376911,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"davyjonesslocker","jackpotSubID":2,"jackpotSubKey":"major","jackpot":7185978221,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"davyjonesslocker","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1166341824,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"davyjonesslocker","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":803930135,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"diamondbeamjackpot":[{"zoneID":1,"slotID":"diamondbeamjackpot","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":480669186946,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondbeamjackpot","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":69307928539,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondbeamjackpot","jackpotSubID":3,"jackpotSubKey":"major","jackpot":78668701919,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":450000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondbeamjackpot","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":38635099308,"basePrize":70,"basePrizeType":"BetPerLine","maxBasePrize":210000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondbeamjackpot","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":0,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondbeamjackpot","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"diamondstrike":[{"zoneID":1,"slotID":"diamondstrike","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":5104872969801,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondstrike","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":551413387012,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondstrike","jackpotSubID":2,"jackpotSubKey":"major","jackpot":302166364432,"basePrize":1875,"basePrizeType":"BetPerLine","maxBasePrize":225000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondstrike","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":40056780062,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.05,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondstrike","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":51755899902,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.09,"linked":false,"linkedKey":""}],"dingdongjackpots":[{"zoneID":1,"slotID":"dingdongjackpots","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":348609406802,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dingdongjackpots","jackpotSubID":2,"jackpotSubKey":"major","jackpot":690118110839,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dingdongjackpots","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":705702694479,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dingdongjackpots","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":165815761305,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"dragonblast":[{"zoneID":1,"slotID":"dragonblast","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":307182301443,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonblast","jackpotSubID":2,"jackpotSubKey":"major","jackpot":29899934469,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonblast","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":7748635623,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonblast","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1967676116,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"dragonorbs":[{"zoneID":1,"slotID":"dragonorbs","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":103673147945,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonorbs","jackpotSubID":2,"jackpotSubKey":"major","jackpot":22506356699,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonorbs","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":22193119451,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonorbs","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":11389337369,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"dragonsandpearls":[{"zoneID":1,"slotID":"dragonsandpearls","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":90034422377,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonsandpearls","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":18649282673,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonsandpearls","jackpotSubID":2,"jackpotSubKey":"major","jackpot":43138792422,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0037,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonsandpearls","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":10049288308,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0076,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonsandpearls","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":6643603978.0001955,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0079,"linked":false,"linkedKey":""}],"dragontales":[{"zoneID":1,"slotID":"dragontales","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5575834931934,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.009,"linked":true,"linkedKey":"dragontales_orientallanterns"},{"zoneID":1,"slotID":"dragontales","jackpotSubID":2,"jackpotSubKey":"major","jackpot":136067040362,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragontales","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":10330290608,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragontales","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":760328209,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"dreamcitylights":[{"zoneID":1,"slotID":"dreamcitylights","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":9752282633.999994,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dreamcitylights","jackpotSubID":2,"jackpotSubKey":"major","jackpot":22294318957,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dreamcitylights","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3154533822,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""}],"drmadwin":[{"zoneID":1,"slotID":"drmadwin","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"drmadwin","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"drmadwin","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"drmadwin","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"drmadwin","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"dualdiamondsstrike":[{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":8,"jackpotSubKey":"pink9jackpot","jackpot":9955568838,"basePrize":4800,"basePrizeType":"BetPerLine","maxBasePrize":576000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":7,"jackpotSubKey":"pink8jackpot","jackpot":2378306636,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":6,"jackpotSubKey":"pink7jackpot","jackpot":4452610500,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":5,"jackpotSubKey":"pink6jackpot","jackpot":1584013118,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":4,"jackpotSubKey":"blue9jackpot","jackpot":9955568745,"basePrize":4800,"basePrizeType":"BetPerLine","maxBasePrize":576000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":3,"jackpotSubKey":"blue8jackpot","jackpot":2413387173,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":2,"jackpotSubKey":"blue7jackpot","jackpot":4503736076,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":1,"jackpotSubKey":"blue6jackpot","jackpot":1578062841,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"dualfortunepot":[{"zoneID":1,"slotID":"dualfortunepot","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":311018987746,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":51760355235,"basePrize":3750,"basePrizeType":"BetPerLine","maxBasePrize":225000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":10078906914,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4927097277,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0126,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":5472875542,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0129,"linked":false,"linkedKey":""}],"dualfortunepot_dy":[{"zoneID":1,"slotID":"dualfortunepot_dy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":130129635600,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":37189595592,"basePrize":7500,"basePrizeType":"BetPerLine","maxBasePrize":450000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":9777430889,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4223439040,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0126,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":5456278751,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0129,"linked":false,"linkedKey":""}],"eggstraeaster":[{"zoneID":1,"slotID":"eggstraeaster","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2458824138,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"eggstraeaster","jackpotSubID":2,"jackpotSubKey":"major","jackpot":11397201505,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"eggstraeaster","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":20210353756.999996,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"eggstraeaster","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":4810993118,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"emeraldgreen":[{"zoneID":1,"slotID":"emeraldgreen","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":176890754373,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"emeraldgreen","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":22439607961,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"emeraldgreen","jackpotSubID":3,"jackpotSubKey":"major","jackpot":29815867809,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"emeraldgreen","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":5073865504,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"emeraldgreen","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":1222809227,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"emeraldgreen","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":700,"basePrizeType":"BetPerLine","maxBasePrize":21000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"emeraldislegold":[{"zoneID":1,"slotID":"emeraldislegold","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":625879302529,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":450000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"fatturkeywilds":[{"zoneID":1,"slotID":"fatturkeywilds","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":1214672691950,"basePrize":980,"basePrizeType":"BetPerLine","maxBasePrize":2940000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fatturkeywilds","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":36801440237,"basePrize":484,"basePrizeType":"BetPerLine","maxBasePrize":1452000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fatturkeywilds","jackpotSubID":2,"jackpotSubKey":"major","jackpot":28102234611,"basePrize":188,"basePrizeType":"BetPerLine","maxBasePrize":564000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"fireblastclassic":[{"zoneID":1,"slotID":"fireblastclassic","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":51453533325,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fireblastclassic","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":3718829300,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":450000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fireblastclassic","jackpotSubID":3,"jackpotSubKey":"major","jackpot":7132405424,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fireblastclassic","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":1601073902,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fireblastclassic","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":578527166,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fireblastclassic","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":5,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"firelockultimate":[{"zoneID":1,"slotID":"firelockultimate","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2783881587219,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"flamefurywheel":[{"zoneID":1,"slotID":"flamefurywheel","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":52202294022,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"flamefurywheel","jackpotSubID":2,"jackpotSubKey":"major","jackpot":8752204144,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"flamefurywheel","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":5984498796.999956,"basePrize":15,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"flamefurywheel","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":3927180321,"basePrize":5,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"flameofliberty":[{"zoneID":1,"slotID":"flameofliberty","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":142852871458,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"flameofliberty","jackpotSubID":2,"jackpotSubKey":"major","jackpot":73251439679,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"flameofliberty","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":910223883,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"flameofliberty","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":4929334642,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"fortunepot":[{"zoneID":1,"slotID":"fortunepot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1585672311269.56,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortunepot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":423949560420.64,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortunepot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":19996577773.76,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0126,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortunepot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":13282845963.039999,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0129,"linked":false,"linkedKey":""}],"fortuneshrine":[{"zoneID":1,"slotID":"fortuneshrine","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":101597326817,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortuneshrine","jackpotSubID":2,"jackpotSubKey":"major","jackpot":24388744118,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortuneshrine","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3040997595.9999843,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortuneshrine","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1858792802,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"fortunetree":[{"zoneID":1,"slotID":"fortunetree","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":8101613187900,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortunetree","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":8101613187900,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortunetree","jackpotSubID":2,"jackpotSubKey":"major","jackpot":5865824601994,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortunetree","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":20201302554,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortunetree","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":33464099173,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""}],"frozenthronerespin":[{"zoneID":1,"slotID":"frozenthronerespin","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":18504077307,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"fruityblast":[{"zoneID":1,"slotID":"fruityblast","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":38451443562.5,"basePrize":3990,"basePrizeType":"BetPerLine","maxBasePrize":1197000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fruityblast","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":759822938284.5,"basePrize":1670,"basePrizeType":"BetPerLine","maxBasePrize":501000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fruityblast","jackpotSubID":3,"jackpotSubKey":"major","jackpot":998493825991,"basePrize":790,"basePrizeType":"BetPerLine","maxBasePrize":237000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fruityblast","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":842397995270,"basePrize":270,"basePrizeType":"BetPerLine","maxBasePrize":81000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fruityblast","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":280240638599,"basePrize":110,"basePrizeType":"BetPerLine","maxBasePrize":33000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fruityblast","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":96557408198,"basePrize":40,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"fruityjewels":[{"zoneID":1,"slotID":"fruityjewels","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":249360526687,"basePrize":14400,"basePrizeType":"BetPerLine","maxBasePrize":1080000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fruityjewels","jackpotSubID":2,"jackpotSubKey":"major","jackpot":603211339802,"basePrize":14400,"basePrizeType":"BetPerLine","maxBasePrize":1080000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"gempackedwilds":[{"zoneID":1,"slotID":"gempackedwilds","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":151447381779,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"gempackedwilds","jackpotSubID":2,"jackpotSubKey":"major","jackpot":400399203285,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"gempackedwilds","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":59836497200,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"gempackedwilds","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":64434528539,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"gempackedwilds_dy":[{"zoneID":1,"slotID":"gempackedwilds_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":64605218276,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"gempackedwilds_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":329419548594,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"gempackedwilds_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":7741460755,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":108000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"gempackedwilds_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":11420748000,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"golden100xdollar":[{"zoneID":1,"slotID":"golden100xdollar","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6497088348403,"basePrize":6000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"goldenbuffalofever":[{"zoneID":1,"slotID":"goldenbuffalofever","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":392789125638,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":2000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"goldenbuffalofever","jackpotSubID":2,"jackpotSubKey":"major","jackpot":182897206681,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":250000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""}],"goldencrown":[{"zoneID":1,"slotID":"goldencrown","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":803314253101,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"goldeneagleking":[{"zoneID":1,"slotID":"goldeneagleking","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":512073217769,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":375000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"goldeneagleking","jackpotSubID":2,"jackpotSubKey":"major","jackpot":245462347813,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"goldeneagleking","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2890654824.999967,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":22500000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"goldeneagleking","jackpotSubID":0,"jackpotSubKey":"eagletrigger","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"goldenmoonfortune":[{"zoneID":1,"slotID":"goldenmoonfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":53615487653,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":2700000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"goldenmoonfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":17534502389,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"goldenmoonfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":6429145407,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"goldenmoonfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1350635095,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"greatamerica":[{"zoneID":1,"slotID":"greatamerica","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":561594624664,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":540000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"greatamerica","jackpotSubID":1,"jackpotSubKey":"major","jackpot":140767336997,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"greatamerica","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":241817169171,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":135000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"highrisejackpot":[{"zoneID":1,"slotID":"highrisejackpot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":3237530742,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"highrisejackpot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":10944219379,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"highrisejackpot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":11414158424,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"highrisejackpot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":10815970669,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"hoardinggoblins":[{"zoneID":1,"slotID":"hoardinggoblins","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":5917559100,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"hoardinggoblins","jackpotSubID":2,"jackpotSubKey":"major","jackpot":13915004772,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"hoardinggoblins","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":5708760763,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"hoardinggoblins","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":19811382087.99992,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"honeybeeparade":[{"zoneID":1,"slotID":"honeybeeparade","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":34661574894,"basePrize":6250,"basePrizeType":"BetPerLine","maxBasePrize":375000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"honeybeeparade","jackpotSubID":2,"jackpotSubKey":"major","jackpot":99581160248,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"honeybeeparade","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":11920832376,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"honeybeeparade","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":6806095101,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"houndofhades":[{"zoneID":1,"slotID":"houndofhades","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":688826907155,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"houndofhades","jackpotSubID":2,"jackpotSubKey":"major","jackpot":262547325670,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"houndofhades","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":29704191876,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"houndofhades","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":8002705341,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"huffndoze":[{"zoneID":1,"slotID":"huffndoze","jackpotSubID":5,"jackpotSubKey":"mega","jackpot":379240323221,"basePrize":200000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"huffndoze","jackpotSubID":4,"jackpotSubKey":"major","jackpot":15485196435,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"huffndoze","jackpotSubID":3,"jackpotSubKey":"minor2","jackpot":0,"basePrize":6000,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"huffndoze","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":0,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"huffndoze","jackpotSubID":1,"jackpotSubKey":"mini2","jackpot":0,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"huffndoze","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"imperialgoldfortune":[{"zoneID":1,"slotID":"imperialgoldfortune","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":1421348442389,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"imperialgoldfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1274140543419,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"imperialgoldfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":371058418831,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"imperialgoldfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"imperialgoldfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"jacksmagicbeans":[{"zoneID":1,"slotID":"jacksmagicbeans","jackpotSubID":0,"jackpotSubKey":"freespin_feature","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"jiujiujiu999":[{"zoneID":1,"slotID":"jiujiujiu999","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":551042317191,"basePrize":32000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jiujiujiu999","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1090933847338,"basePrize":12000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jiujiujiu999","jackpotSubID":2,"jackpotSubKey":"major","jackpot":603887080192,"basePrize":2800,"basePrizeType":"BetPerLine","maxBasePrize":210000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jiujiujiu999","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":10633162743,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jiujiujiu999","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"jollyrogerjackpot":[{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":10,"jackpotSubKey":"15jackpot","jackpot":22252103353,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":9,"jackpotSubKey":"14jackpot","jackpot":22524310857,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":8,"jackpotSubKey":"13jackpot","jackpot":7266170807,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":480000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":7,"jackpotSubKey":"12jackpot","jackpot":5968089081,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":6,"jackpotSubKey":"11jackpot","jackpot":4259685920,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":5,"jackpotSubKey":"10jackpot","jackpot":4026207329,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":4,"jackpotSubKey":"9jackpot","jackpot":5284379100,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":3,"jackpotSubKey":"8jackpot","jackpot":3577498260,"basePrize":65,"basePrizeType":"BetPerLine","maxBasePrize":39000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":2,"jackpotSubKey":"7jackpot","jackpot":1770006399,"basePrize":45,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":1,"jackpotSubKey":"6jackpot","jackpot":7432072778,"basePrize":35,"basePrizeType":"BetPerLine","maxBasePrize":21000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":0,"jackpotSubKey":"5jackpot","jackpot":28802175519,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"jumbopiggies":[{"zoneID":1,"slotID":"jumbopiggies","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":311329423104,"basePrize":500000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jumbopiggies","jackpotSubID":2,"jackpotSubKey":"major","jackpot":20117480149,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jumbopiggies","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3901461813,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jumbopiggies","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":13086270527,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"jurassicwildstomps":[{"zoneID":1,"slotID":"jurassicwildstomps","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jurassicwildstomps","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jurassicwildstomps","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":37500000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jurassicwildstomps","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"kongfury":[{"zoneID":1,"slotID":"kongfury","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":25834751853,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"kongfury","jackpotSubID":2,"jackpotSubKey":"major","jackpot":42244722357,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"kongfury","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":32366788773,"basePrize":1600,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"kongfury","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":10051863798,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"kongsmash":[{"zoneID":1,"slotID":"kongsmash","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":167016843815,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"kongsmash","jackpotSubID":2,"jackpotSubKey":"major","jackpot":37557426778,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"kongsmash","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":86033841671,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"kongsmash","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":38940701872.99996,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"ladylibertyrespins":[{"zoneID":1,"slotID":"ladylibertyrespins","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":34230977391,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"ladylibertyrespins","jackpotSubID":2,"jackpotSubKey":"major","jackpot":79783839933,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"ladylibertyrespins","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":20716959814,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"ladylibertyrespins","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":9706601173,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"libertyeaglefortune":[{"zoneID":1,"slotID":"libertyeaglefortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":350392839997,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":3750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"libertyeaglefortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":354438839798,"basePrize":2700,"basePrizeType":"BetPerLine","maxBasePrize":810000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"libertyeaglefortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":632050705496,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"libertyeaglefortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":110844253837,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"locknrollfiver":[{"zoneID":1,"slotID":"locknrollfiver","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"locknrollfiver","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"locknrollfiver","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"locknrollfiver","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"lollylandgummyking":[{"zoneID":1,"slotID":"lollylandgummyking","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":11304615831.999994,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"lollylandgummyking","jackpotSubID":2,"jackpotSubKey":"major","jackpot":32196235064,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"lollylandgummyking","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":13055880203,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"lollylandgummyking","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2070373601,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""}],"luckyamericanroll":[{"zoneID":1,"slotID":"luckyamericanroll","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2397843996588,"basePrize":4050,"basePrizeType":"BetPerLine","maxBasePrize":1215000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"luckybunnydrop":[{"zoneID":1,"slotID":"luckybunnydrop","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"luckybunnydrop","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"luckybunnydrop","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"luckybunnydrop","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"luckybunnydrop","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"magmaficent":[{"zoneID":1,"slotID":"magmaficent","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":82413466787,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"magmaficent","jackpotSubID":2,"jackpotSubKey":"major","jackpot":81261986257,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"magmaficent","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":92361764136,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"magmaficent","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":8586003625.999978,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"makeitrain":[{"zoneID":1,"slotID":"makeitrain","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":278955490096,"basePrize":1950,"basePrizeType":"BetPerLine","maxBasePrize":1170000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"marineadventure":[{"zoneID":1,"slotID":"marineadventure","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":1285957895979,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":2160000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"marineadventure","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":0,"basePrize":720,"basePrizeType":"BetPerLine","maxBasePrize":216000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"marineadventure","jackpotSubID":1,"jackpotSubKey":"major","jackpot":0,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"marineadventure","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"megabingoclassic":[{"zoneID":1,"slotID":"megabingoclassic","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":255736385349,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"megabingoclassic","jackpotSubID":2,"jackpotSubKey":"major","jackpot":160004404584,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"megabingoclassic","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"megabingoclassic","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"megatondynamite":[{"zoneID":1,"slotID":"megatondynamite","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":823604511671,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"megatondynamite","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":216000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"megatondynamite","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":3600,"basePrizeType":"BetPerLine","maxBasePrize":108000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"meowgicalhalloween":[{"zoneID":1,"slotID":"meowgicalhalloween","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"meowgicalhalloween","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"meowgicalhalloween","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"meowgicalhalloween","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"meowgicalhalloween","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"moneystax":[{"zoneID":1,"slotID":"moneystax","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":243309146105,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"moneystax","jackpotSubID":2,"jackpotSubKey":"major","jackpot":328079275873,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"moneystax","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":137761316148,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"moneystax","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":4716675514,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"moonlightwolf":[{"zoneID":1,"slotID":"moonlightwolf","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":339099850856,"basePrize":1950,"basePrizeType":"BetPerLine","maxBasePrize":1170000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"moonlightwolf_dy":[{"zoneID":1,"slotID":"moonlightwolf_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":452055360006,"basePrize":3950,"basePrizeType":"BetPerLine","maxBasePrize":2370000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"mooorecheddar":[{"zoneID":1,"slotID":"mooorecheddar","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mooorecheddar","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mooorecheddar","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mooorecheddar","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"mysterrier":[{"zoneID":1,"slotID":"mysterrier","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":102705610886,"basePrize":75000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mysterrier","jackpotSubID":2,"jackpotSubKey":"major","jackpot":4608192528,"basePrize":3750,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mysterrier","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mysterrier","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"mysticgypsy":[{"zoneID":1,"slotID":"mysticgypsy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5319099601512,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":true,"linkedKey":"mysticgypsi_curiousmermaid"},{"zoneID":1,"slotID":"mysticgypsy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":193287564434,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mysticgypsy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mysticgypsy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"nudginglockclassic":[{"zoneID":1,"slotID":"nudginglockclassic","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":259519264837,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":675000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"nudginglockclassic_dy":[{"zoneID":1,"slotID":"nudginglockclassic_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1715347837328,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":1350000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"nuttysquirrel":[{"zoneID":1,"slotID":"nuttysquirrel","jackpotSubID":2,"jackpotSubKey":"grand","jackpot":338990576200,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"nuttysquirrel","jackpotSubID":1,"jackpotSubKey":"major","jackpot":5114356861,"basePrize":225,"basePrizeType":"BetPerLine","maxBasePrize":135000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"nuttysquirrel","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":6321771798.999918,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"orientallanterns":[{"zoneID":1,"slotID":"orientallanterns","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5575834956234,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.009,"linked":true,"linkedKey":"dragontales_orientallanterns"},{"zoneID":1,"slotID":"orientallanterns","jackpotSubID":2,"jackpotSubKey":"major","jackpot":55513129962,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"orientallanterns","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4140532204,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"orientallanterns","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1577063050,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"pawpawneko":[{"zoneID":1,"slotID":"pawpawneko","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":92178341176,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawpawneko","jackpotSubID":2,"jackpotSubKey":"major","jackpot":21482491217,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawpawneko","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":19712760445,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawpawneko","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":936940670.9999474,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"pawsomepanda":[{"zoneID":1,"slotID":"pawsomepanda","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":59972154518,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawsomepanda","jackpotSubID":4,"jackpotSubKey":"super","jackpot":7893912143,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawsomepanda","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2245568038,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawsomepanda","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1921498801,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawsomepanda","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1468499588,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawsomepanda","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1390493564,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""}],"peachyfortune":[{"zoneID":1,"slotID":"peachyfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":149863751956,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"peachyfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":97340849874,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"peachyfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":6704291706,"basePrize":625,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"peachyfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2477254966.9992876,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"penguinforce":[{"zoneID":1,"slotID":"penguinforce","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":59695579383,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"penguinforce","jackpotSubID":2,"jackpotSubKey":"major","jackpot":10389606620,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"penguinforce","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4683353001,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"penguinforce","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":7182480045.999984,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"pharaohsbeetlelink":[{"zoneID":1,"slotID":"pharaohsbeetlelink","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":7784063510148,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsbeetlelink","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsbeetlelink","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsbeetlelink","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"pharaohsbeetlelink_dy":[{"zoneID":1,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":9228039100189,"basePrize":60000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.04,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"pharaohsecrets":[{"zoneID":1,"slotID":"pharaohsecrets","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":210948553079,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsecrets","jackpotSubID":2,"jackpotSubKey":"major","jackpot":867988178418,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsecrets","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":102443645088,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsecrets","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":8665760959,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"phoenixignite":[{"zoneID":1,"slotID":"phoenixignite","jackpotSubID":2,"jackpotSubKey":"grand","jackpot":300810338017,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"phoenixignite","jackpotSubID":1,"jackpotSubKey":"mega","jackpot":0,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"phoenixignite","jackpotSubID":0,"jackpotSubKey":"major","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"phoenixignite_dy":[{"zoneID":1,"slotID":"phoenixignite_dy","jackpotSubID":2,"jackpotSubKey":"grand","jackpot":610120299906,"basePrize":80000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"phoenixignite_dy","jackpotSubID":1,"jackpotSubKey":"mega","jackpot":0,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"phoenixignite_dy","jackpotSubID":0,"jackpotSubKey":"major","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggybankriches":[{"zoneID":1,"slotID":"piggybankriches","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6576749620616,"basePrize":300000,"basePrizeType":"BetPerLine","maxBasePrize":18000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggybankriches","jackpotSubID":2,"jackpotSubKey":"major","jackpot":71000695401,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggybankriches","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggybankriches","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggybankriches_dy":[{"zoneID":1,"slotID":"piggybankriches_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":971656002000,"basePrize":300000,"basePrizeType":"BetPerLine","maxBasePrize":18000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggybankriches_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":174777152714,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggybankriches_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggybankriches_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggyhouses":[{"zoneID":1,"slotID":"piggyhouses","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":79198589905,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggyhouses","jackpotSubID":2,"jackpotSubKey":"major","jackpot":36472260611,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggyhouses","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggyhouses","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggymania":[{"zoneID":1,"slotID":"piggymania","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":288659490481,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":15000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":128636904717,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0007,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania","jackpotSubID":3,"jackpotSubKey":"major","jackpot":23781463669,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0018,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":3796885033,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":936158803,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0054,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":328432355,"basePrize":30,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0072,"linked":false,"linkedKey":""}],"piggymania_dy":[{"zoneID":1,"slotID":"piggymania_dy","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":109694614800,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania_dy","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":151853282031,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0007,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania_dy","jackpotSubID":3,"jackpotSubKey":"major","jackpot":10270559160,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0018,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania_dy","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":6415564904,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania_dy","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":4398633997,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0054,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania_dy","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":697048594,"basePrize":60,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0072,"linked":false,"linkedKey":""}],"pinataparade":[{"zoneID":1,"slotID":"pinataparade","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":200295714663,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinataparade","jackpotSubID":2,"jackpotSubKey":"major","jackpot":259739072039,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinataparade","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":58713296894,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"pinkstardiamonds":[{"zoneID":1,"slotID":"pinkstardiamonds","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":731609387189,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinkstardiamonds","jackpotSubID":2,"jackpotSubKey":"major","jackpot":624897263808,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":450000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinkstardiamonds","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":9278492214,"basePrize":70,"basePrizeType":"BetPerLine","maxBasePrize":210000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinkstardiamonds","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"pinupparadise":[{"zoneID":1,"slotID":"pinupparadise","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":25556132686,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinupparadise","jackpotSubID":2,"jackpotSubKey":"major","jackpot":7838274628,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinupparadise","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1479562832,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinupparadise","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":618572695,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"piratebootyrapidhit":[{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":8,"jackpotSubKey":"30Jackpot","jackpot":465842848606,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":7,"jackpotSubKey":"24Jackpot","jackpot":356596427508,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":6,"jackpotSubKey":"21Jackpot","jackpot":111596770518,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":5,"jackpotSubKey":"18Jackpot","jackpot":24940406056,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":4,"jackpotSubKey":"15Jackpot","jackpot":6708071668,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":3,"jackpotSubKey":"12Jackpot","jackpot":1595754915,"basePrize":80,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":2,"jackpotSubKey":"10Jackpot","jackpot":641323844,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":1,"jackpotSubKey":"08Jackpot","jackpot":367760408,"basePrize":35,"basePrizeType":"BetPerLine","maxBasePrize":21000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":0,"jackpotSubKey":"06Jackpot","jackpot":98755087,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"poseidonwildwaves":[{"zoneID":1,"slotID":"poseidonwildwaves","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":50627042051.5,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"poseidonwildwaves","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5537467876.5,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"poseidonwildwaves","jackpotSubID":2,"jackpotSubKey":"major","jackpot":403699132.5,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"poseidonwildwaves","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":262580035,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"poseidonwildwaves","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":170981731,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""}],"pumpkinfortune":[{"zoneID":1,"slotID":"pumpkinfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":184780176816,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pumpkinfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":89224764224,"basePrize":1875,"basePrizeType":"BetPerLine","maxBasePrize":225000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pumpkinfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":14947243864.999866,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pumpkinfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":13035089502,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"raccoonshowdown":[{"zoneID":1,"slotID":"raccoonshowdown","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":48143305021,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"raccoonshowdown","jackpotSubID":2,"jackpotSubKey":"major","jackpot":289324765915,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0037,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"raccoonshowdown","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":51843715104,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0076,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"raccoonshowdown","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":10041442081.000025,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0079,"linked":false,"linkedKey":""}],"railroadraiders":[{"zoneID":1,"slotID":"railroadraiders","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":207093140363,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"railroadraiders","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"railroadraiders","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"railroadraiders","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"railroadraiders","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"rainbowpearl":[{"zoneID":1,"slotID":"rainbowpearl","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":279976047185,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""}],"rainbowpearl_dy":[{"zoneID":1,"slotID":"rainbowpearl_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1173195504225,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.03,"linked":false,"linkedKey":""}],"rapidhitantarctic":[{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":11,"jackpotSubKey":"grand","jackpot":39932379463,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":10,"jackpotSubKey":"mega","jackpot":29148075661,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":9,"jackpotSubKey":"major","jackpot":17286511894,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":8,"jackpotSubKey":"minor","jackpot":4341479870,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":450000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":7,"jackpotSubKey":"mini","jackpot":2529459448,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":6,"jackpotSubKey":"10RapodHitJackpot","jackpot":0,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":5,"jackpotSubKey":"9RapodHitJackpot","jackpot":0,"basePrize":450,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":4,"jackpotSubKey":"8RapodHitJackpot","jackpot":0,"basePrize":270,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":3,"jackpotSubKey":"7RapodHitJackpot","jackpot":0,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":2,"jackpotSubKey":"6RapodHitJackpot","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":1,"jackpotSubKey":"5RapodHitJackpot","jackpot":0,"basePrize":60,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":0,"jackpotSubKey":"4RapodHitJackpot","jackpot":0,"basePrize":30,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"rhinoblitz":[{"zoneID":1,"slotID":"rhinoblitz","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":185283506185,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rhinoblitz","jackpotSubID":2,"jackpotSubKey":"major","jackpot":102894649704,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0011,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rhinoblitz","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":43905501150,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rhinoblitz","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":17405085030,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"robinhoodsecondshot":[{"zoneID":1,"slotID":"robinhoodsecondshot","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":12713367783,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":1000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"robinhoodsecondshot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":26324623826,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0011,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"robinhoodsecondshot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":9611498807,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"robinhoodsecondshot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":5027068954,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0023,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"robinhoodsecondshot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1244981238,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"rockingbell":[{"zoneID":1,"slotID":"rockingbell","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":85470436602.5,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"rollthedice":[{"zoneID":1,"slotID":"rollthedice","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":3991668507409.5,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"rudolphexpress":[{"zoneID":1,"slotID":"rudolphexpress","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1509756572417,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"sakuraninja":[{"zoneID":1,"slotID":"sakuraninja","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":106765725184,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"sakuraninja","jackpotSubID":2,"jackpotSubKey":"major","jackpot":2508824564,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"sakuraninja","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1961583777,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"sakuraninja","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":991025275,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""}],"sevenglory":[{"zoneID":1,"slotID":"sevenglory","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":39058730054.08,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":1350000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"sevenglory","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":45982000509.62,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":540000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"sevenglory","jackpotSubID":2,"jackpotSubKey":"major","jackpot":38758531886.62,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":540000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"sevenglory","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":52149027996.24,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"sevenglory","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":56612715139.24,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"shamrocklock":[{"zoneID":1,"slotID":"shamrocklock","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":957933402500,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shamrocklock","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":38382021906,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shamrocklock","jackpotSubID":2,"jackpotSubKey":"major","jackpot":48530725499,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shamrocklock","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":6104191802,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shamrocklock","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":3238124161,"basePrize":40,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"shanghaiexpress":[{"zoneID":1,"slotID":"shanghaiexpress","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":84935764898,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shanghaiexpress","jackpotSubID":2,"jackpotSubKey":"major","jackpot":13824269941,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shanghaiexpress","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1538247166,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shanghaiexpress","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":280918966,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""}],"shanghaifullmoon":[{"zoneID":1,"slotID":"shanghaifullmoon","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":9154009325402,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":2160000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shanghaifullmoon","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1374436813977,"basePrize":720,"basePrizeType":"BetPerLine","maxBasePrize":216000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shanghaifullmoon","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shanghaifullmoon","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"shopaholic":[{"zoneID":1,"slotID":"shopaholic","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":83056370895,"basePrize":6250,"basePrizeType":"BetPerLine","maxBasePrize":750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shopaholic","jackpotSubID":2,"jackpotSubKey":"major","jackpot":162537989404,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shopaholic","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":8566211850.999998,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shopaholic","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":6025018659,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"smashncash":[{"zoneID":1,"slotID":"smashncash","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":710722196670,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"starryholidays":[{"zoneID":1,"slotID":"starryholidays","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":118560768787,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"starryholidays","jackpotSubID":2,"jackpotSubKey":"major","jackpot":187110565854,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"starryholidays","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":10110906030,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"starryholidays","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":8181723438,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"super25deluxe":[{"zoneID":1,"slotID":"super25deluxe","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":29372456020,"basePrize":980,"basePrizeType":"BetPerLine","maxBasePrize":294000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"super25deluxe_dy":[{"zoneID":1,"slotID":"super25deluxe_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":27146174692,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"superdrumbash":[{"zoneID":1,"slotID":"superdrumbash","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":69536557137,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"superdrumbash","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":21396194542,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"superdrumbash","jackpotSubID":2,"jackpotSubKey":"major","jackpot":67103134117,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"superdrumbash","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":118633395366,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"superdrumbash","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":31950692218,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"supernovablasts":[{"zoneID":1,"slotID":"supernovablasts","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":183052999881,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supernovablasts","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":113596543433,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supernovablasts","jackpotSubID":2,"jackpotSubKey":"major","jackpot":45261374515,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supernovablasts","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":8804627472,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supernovablasts","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":888022629,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"supersevenblasts":[{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":8,"jackpotSubKey":"36Jackpot","jackpot":88717505140,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":7,"jackpotSubKey":"30Jackpot","jackpot":41939054220,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":6,"jackpotSubKey":"25Jackpot","jackpot":18240615371,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":5,"jackpotSubKey":"21Jackpot","jackpot":4021195172,"basePrize":700,"basePrizeType":"BetPerLine","maxBasePrize":210000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":4,"jackpotSubKey":"18Jackpot","jackpot":1703641970,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":3,"jackpotSubKey":"15Jackpot","jackpot":1315853679,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":2,"jackpotSubKey":"12Jackpot","jackpot":408490981,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":1,"jackpotSubKey":"09Jackpot","jackpot":423532518,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":0,"jackpotSubKey":"06Jackpot","jackpot":62470489,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"talesofarcadia":[{"zoneID":1,"slotID":"talesofarcadia","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":207691263985,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"talesofarcadia","jackpotSubID":4,"jackpotSubKey":"super","jackpot":55227455405,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"talesofarcadia","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":9916198960,"basePrize":625,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"talesofarcadia","jackpotSubID":2,"jackpotSubKey":"major","jackpot":2354487167,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"talesofarcadia","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1073369199,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"talesofarcadia","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1221926938,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""}],"templeofathena":[{"zoneID":1,"slotID":"templeofathena","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":818255784957,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"thanksgivinggalore":[{"zoneID":1,"slotID":"thanksgivinggalore","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":81136722356,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thanksgivinggalore","jackpotSubID":2,"jackpotSubKey":"major","jackpot":70712380580,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thanksgivinggalore","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":6810324829.999983,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"thearcanealchemist":[{"zoneID":1,"slotID":"thearcanealchemist","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":225516743210,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":2700000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thearcanealchemist","jackpotSubID":2,"jackpotSubKey":"major","jackpot":17691991528,"basePrize":225,"basePrizeType":"BetPerLine","maxBasePrize":135000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thearcanealchemist","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":12478952140,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thearcanealchemist","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1873631717,"basePrize":45,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"thebeastssecret":[{"zoneID":1,"slotID":"thebeastssecret","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":33162218670,"basePrize":19200,"basePrizeType":"BetPerLine","maxBasePrize":576000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thebeastssecret","jackpotSubID":2,"jackpotSubKey":"major","jackpot":26218769037,"basePrize":4800,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thebeastssecret","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":5544302132,"basePrize":2400,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thebeastssecret","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":9556500421,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"thehogmancer":[{"zoneID":1,"slotID":"thehogmancer","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":159510876828,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thehogmancer","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1595500208,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thehogmancer","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":162884376,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thehogmancer","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":135576415,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"themobking":[{"zoneID":1,"slotID":"themobking","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":193310833495,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"themobking","jackpotSubID":2,"jackpotSubKey":"major","jackpot":306173364364,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"themobking","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":149583610600,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"theoddranch":[{"zoneID":1,"slotID":"theoddranch","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":355886034237,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"theoddranch","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"theoddranch","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"theoddranch","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"theoztales":[{"zoneID":1,"slotID":"theoztales","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":128163873234,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"theoztales","jackpotSubID":2,"jackpotSubKey":"major","jackpot":14368929763,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"theoztales","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":9475852026,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"theoztales","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2647623660.999967,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"thunderstrike":[{"zoneID":1,"slotID":"thunderstrike","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":90390030323,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thunderstrike","jackpotSubID":2,"jackpotSubKey":"major","jackpot":337586730418,"basePrize":1875,"basePrizeType":"BetPerLine","maxBasePrize":225000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thunderstrike","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4877623443.9999695,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thunderstrike","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":5090349040,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"toadallyrich":[{"zoneID":1,"slotID":"toadallyrich","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":291220548985,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"toadallyrich","jackpotSubID":2,"jackpotSubKey":"major","jackpot":23917227370,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"toadallyrich","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":7103675662,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"toadallyrich","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":3401895209,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"triplewheelsupreme":[{"zoneID":1,"slotID":"triplewheelsupreme","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":29869076572,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"triplewheelsupreme","jackpotSubID":2,"jackpotSubKey":"major","jackpot":24752819763,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"triplewheelsupreme","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":13824177466,"basePrize":160,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"triplewheelsupreme","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":585538120,"basePrize":80,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"twilightdragon":[{"zoneID":1,"slotID":"twilightdragon","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":18909319738,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"twilightdragon","jackpotSubID":2,"jackpotSubKey":"major","jackpot":10531952249,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"twilightdragon","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":907538154,"basePrize":40,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"twilightdragon","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":171092388,"basePrize":20,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"vampressmansion":[{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":9,"jackpotSubKey":"royalGrand","jackpot":0,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":8,"jackpotSubKey":"royalMega","jackpot":0,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":135000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":7,"jackpotSubKey":"royalMajor","jackpot":0,"basePrize":3600,"basePrizeType":"BetPerLine","maxBasePrize":108000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":6,"jackpotSubKey":"royalMinor","jackpot":0,"basePrize":2700,"basePrizeType":"BetPerLine","maxBasePrize":81000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":5,"jackpotSubKey":"royalMini","jackpot":0,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":135000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":67500000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1350,"basePrizeType":"BetPerLine","maxBasePrize":40500000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"vivalasvegas":[{"zoneID":1,"slotID":"vivalasvegas","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":299150032760,"basePrize":12000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vivalasvegas","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":265629318329,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vivalasvegas","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vivalasvegas","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vivalasvegas","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"volcanictahiti":[{"zoneID":1,"slotID":"volcanictahiti","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"volcanictahiti","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":450,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"volcanictahiti","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"volcanictahiti","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"volcanictahiti","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"wickedlildevil":[{"zoneID":1,"slotID":"wickedlildevil","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":53115600110,"basePrize":200000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wickedlildevil","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6281656700,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wickedlildevil","jackpotSubID":2,"jackpotSubKey":"major","jackpot":5207268313,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wickedlildevil","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1169806896,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wickedlildevil","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1474907272,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"wildbunch":[{"zoneID":1,"slotID":"wildbunch","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":1587952843992,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":7500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"wildhearts":[{"zoneID":1,"slotID":"wildhearts","jackpotSubID":9,"jackpotSubKey":"9jackpot","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":8,"jackpotSubKey":"8jackpot","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":360000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":7,"jackpotSubKey":"7jackpot","jackpot":0,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":6,"jackpotSubKey":"6jackpot","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":5,"jackpotSubKey":"5jackpot","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":4,"jackpotSubKey":"4jackpot","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":253630445574.02,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":2,"jackpotSubKey":"major","jackpot":92373703002.015,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":36509218341.01,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":616553387.005,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"wildhearts_dy":[{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":9,"jackpotSubKey":"9jackpot","jackpot":0,"basePrize":3750,"basePrizeType":"BetPerLine","maxBasePrize":2250000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":8,"jackpotSubKey":"8jackpot","jackpot":0,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":540000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":7,"jackpotSubKey":"7jackpot","jackpot":0,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":225000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":6,"jackpotSubKey":"6jackpot","jackpot":0,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":5,"jackpotSubKey":"5jackpot","jackpot":0,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":4,"jackpotSubKey":"4jackpot","jackpot":0,"basePrize":37,"basePrizeType":"BetPerLine","maxBasePrize":22200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":649627533329,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":65699720138,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":83824968355,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":9921117377,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"winningrolls":[{"zoneID":1,"slotID":"winningrolls","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1384242194990,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"winyourheart":[{"zoneID":1,"slotID":"winyourheart","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":51657083185,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"winyourheart","jackpotSubID":2,"jackpotSubKey":"major","jackpot":35923522823,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"winyourheart","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4431979917,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"winyourheart","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1796864147,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"witchpumpkins":[{"zoneID":1,"slotID":"witchpumpkins","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":63514629076,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchpumpkins","jackpotSubID":2,"jackpotSubKey":"major","jackpot":19549010978,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchpumpkins","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3019053589.9999084,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchpumpkins","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2042874780,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"witchpumpkins_dy":[{"zoneID":1,"slotID":"witchpumpkins_dy","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":4515442500,"basePrize":75000,"basePrizeType":"BetPerLine","maxBasePrize":4500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchpumpkins_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":17654618406,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchpumpkins_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2357150058.9999127,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchpumpkins_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2250075725,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"witchsapples":[{"zoneID":1,"slotID":"witchsapples","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":265779448795,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchsapples","jackpotSubID":2,"jackpotSubKey":"major","jackpot":21386888208,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchsapples","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchsapples","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"zeusthundershower":[{"zoneID":1,"slotID":"zeusthundershower","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":76020585492,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zeusthundershower","jackpotSubID":2,"jackpotSubKey":"major","jackpot":16913458198,"basePrize":7500,"basePrizeType":"BetPerLine","maxBasePrize":225000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zeusthundershower","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":23629310502,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zeusthundershower","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":13674523348,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"zhuquefortune":[{"zoneID":1,"slotID":"zhuquefortune","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":215592915989,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zhuquefortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":247691986125,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zhuquefortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":181770964112,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zhuquefortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zhuquefortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"zippyjackpots":[{"zoneID":1,"slotID":"zippyjackpots","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":351055423490,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zippyjackpots","jackpotSubID":2,"jackpotSubKey":"major","jackpot":48441828019,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zippyjackpots","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":30370501087,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zippyjackpots","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":5075108431,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}]}},"supersizeJackpotInfo":{"ticketCount":0,"lastWinUser":{"user":{"uid":469802420355072,"fbid":"","name":"Guest27434","picUrl":"hrvavatar://103","createdDate":1759433651,"lastLoginDate":1762273068,"accountSite":1},"winCoin":9000000,"winDate":1762273734,"slotID":"alienamigos"},"endDate":1762273734},"tripleThrillJackpotDiamondWheelMaxGauge":1250,"tripleThrillJackpotGoldWheelMaxGauge":1000,"tripleThrillJackpotLastWins":{"tripleThrillJackpotWinID":486446817566720,"user":{"uid":0,"fbid":"","name":"Israr Oconnor","picUrl":"https://highrollervegas.akamaized.net/common/misc/profilepic/79.jpg","createdDate":0,"lastLoginDate":0,"accountSite":0},"jackpotCnt":4,"totalPrize":451021030053,"winDate":1767370318},"tripleThrillJackpotSliverWheelMaxGauge":600,"tripleThrillJackpots":[{"key":3,"isActive":true,"jackpot":61159749276.84992,"basePrize":10000000000},{"key":4,"isActive":true,"jackpot":230093652119.40714,"basePrize":150000000000},{"key":5,"isActive":false,"jackpot":0,"basePrize":300000000000},{"key":1,"isActive":true,"jackpot":316218473.7857056,"basePrize":125000000},{"key":2,"isActive":true,"jackpot":19689053844.54405,"basePrize":5000000000}],"zoneInfo":{"name":"mega roller casino","zoneID":1,"isActive":true,"slotList":[{"slotID":"thesailorman","flag":"early access","minLevel":635,"order":1},{"slotID":"railroadraiders","minLevel":605},{"slotID":"wrathofzeus","minLevel":0},{"slotID":"davyjonesslocker","minLevel":617},{"slotID":"dualfortunepot","minLevel":419},{"slotID":"nudginglockclassic","minLevel":59},{"slotID":"rainbowpearl","minLevel":110},{"slotID":"gempackedwilds","minLevel":431},{"slotID":"alohahawaii","minLevel":86},{"slotID":"dragonsandpearls","minLevel":404},{"slotID":"beelovedjars","minLevel":626},{"slotID":"twilightdragon","flag":"new","minLevel":632,"order":1},{"slotID":"fatturkeywilds","minLevel":194},{"slotID":"super25deluxe_dy","minLevel":2009},{"slotID":"firelockclassic","minLevel":0},{"slotID":"shanghaiexpress","minLevel":530},{"slotID":"rainbowpearl_dy","minLevel":2003},{"slotID":"100xdollar","flag":"hot","minLevel":23,"order":1},{"slotID":"jumbopiggies","minLevel":515},{"slotID":"emeraldgreen","minLevel":89},{"slotID":"fireblastclassic","minLevel":107},{"slotID":"golden100xdollar","minLevel":83},{"slotID":"super25deluxe","flag":"hot","minLevel":11,"order":2},{"slotID":"winyourheart","minLevel":290},{"slotID":"mooorecheddar","flag":"new","minLevel":629,"order":2},{"slotID":"thepurrglar","minLevel":521},{"slotID":"100xdollar_dy","minLevel":2012},{"slotID":"volcanictahiti","minLevel":353},{"slotID":"houndofhades","flag":"hot","minLevel":512,"order":3},{"slotID":"cashshowdowndeluxe","minLevel":479},{"slotID":"pharaohsbeetlelink","minLevel":62},{"slotID":"piggybankriches","minLevel":128},{"slotID":"birdjackpot","minLevel":41},{"slotID":"zhuquefortune","flag":"hot","minLevel":620,"order":4},{"slotID":"penguinforce","minLevel":623},{"slotID":"casinoroyale","minLevel":176},{"slotID":"thehogmancer","minLevel":566},{"slotID":"peachyfortune","minLevel":590},{"slotID":"christmasblings","minLevel":371},{"slotID":"blazingbullwild","minLevel":134},{"slotID":"huffndoze","minLevel":608},{"slotID":"babysantawild","minLevel":278},{"slotID":"firelockultimate","minLevel":236},{"slotID":"boomburst","minLevel":31},{"slotID":"fruityblast","minLevel":293},{"slotID":"supersevenblasts","minLevel":485},{"slotID":"classiclockrollgrand","minLevel":7},{"slotID":"witchpumpkins","minLevel":449},{"slotID":"orientallanterns","minLevel":45},{"slotID":"dragontales","minLevel":47},{"slotID":"tripleblastclassic","minLevel":65},{"slotID":"megatondynamite","minLevel":92},{"slotID":"fortunepot","minLevel":0},{"slotID":"wildsigniterespins","minLevel":551},{"slotID":"shopaholic","minLevel":203},{"slotID":"theoddranch","minLevel":584},{"slotID":"piggyhouses","minLevel":254},{"slotID":"sharkattack","minLevel":245},{"slotID":"flamefurywheel","minLevel":221},{"slotID":"wickedlildevil","minLevel":320},{"slotID":"allstarcircus","minLevel":509},{"slotID":"nuttysquirrel","minLevel":542},{"slotID":"wildfiremen","minLevel":302},{"slotID":"alienamigos","minLevel":407},{"slotID":"nudginglockclassic_dy","minLevel":2030},{"slotID":"boonanza","minLevel":458},{"slotID":"piratebootyrapidhit","minLevel":503},{"slotID":"diamondstrike","minLevel":56},{"slotID":"luckyamericanroll","minLevel":68},{"slotID":"sakuraninja","minLevel":593},{"slotID":"casinoroyale_dy","minLevel":2027},{"slotID":"bankofwealth","minLevel":5},{"slotID":"cashdash","minLevel":146},{"slotID":"toadallyrich","minLevel":560},{"slotID":"piggymania_dy","minLevel":2054},{"slotID":"smashncash","minLevel":536},{"slotID":"cashshowdownclassic","minLevel":266},{"slotID":"birdjackpot_dy","minLevel":2036},{"slotID":"rollthedice","minLevel":113},{"slotID":"pinkstardiamonds","minLevel":251},{"slotID":"zippyjackpots","minLevel":383},{"slotID":"wildhearts_dy","minLevel":2057},{"slotID":"curiousmermaid","minLevel":15},{"slotID":"mysticgypsy","minLevel":13},{"slotID":"pharaohsbeetlelink_dy","minLevel":2000},{"slotID":"apocalypselasthope","minLevel":611},{"slotID":"dakotafarmgirl","minLevel":455},{"slotID":"phoenixignite_dy","minLevel":2021},{"slotID":"marineadventure","minLevel":281},{"slotID":"jollyrogerjackpot","minLevel":335},{"slotID":"wildhearts","minLevel":443},{"slotID":"phoenixignite","minLevel":329},{"slotID":"frankendualshock","minLevel":29},{"slotID":"eggstraeaster","minLevel":581},{"slotID":"kongsmash","minLevel":578},{"slotID":"super25","minLevel":39},{"slotID":"emeraldislegold","minLevel":572},{"slotID":"megabingoclassic","minLevel":425},{"slotID":"gempackedwilds_dy","minLevel":2015},{"slotID":"wrathofzeus_dy","minLevel":2042},{"slotID":"alohahawaii_dy","minLevel":2039},{"slotID":"sevenrush","minLevel":122},{"slotID":"american9eagles","minLevel":155},{"slotID":"dualdiamondsstrike","minLevel":377},{"slotID":"goldeneagleking","minLevel":326},{"slotID":"dragonorbs","minLevel":524},{"slotID":"diamondbeamjackpot","minLevel":27},{"slotID":"abracadabra","minLevel":9},{"slotID":"leprechaunluckyrespins","minLevel":71},{"slotID":"mysterrier","minLevel":602},{"slotID":"wildwolf","minLevel":164},{"slotID":"goldentrain","minLevel":272},{"slotID":"bunnybank","minLevel":305},{"slotID":"dingdongjackpots","minLevel":464},{"slotID":"moneystax","minLevel":344},{"slotID":"thanksgivinggalore","minLevel":362},{"slotID":"gemdiggerjoe","minLevel":77},{"slotID":"moonlightwolf","minLevel":260},{"slotID":"pinataparade","minLevel":311},{"slotID":"jacksmagicbeans","minLevel":434},{"slotID":"pawpawneko","minLevel":614},{"slotID":"aliceinwonderland","minLevel":161},{"slotID":"frozenthronerespin","minLevel":158},{"slotID":"dualfortunepot_dy","minLevel":2006},{"slotID":"fortunetree","minLevel":17},{"slotID":"captainblackpurr","minLevel":533},{"slotID":"wildbunch","minLevel":365},{"slotID":"goldencrown","minLevel":51},{"slotID":"themobking","minLevel":416},{"slotID":"winningrolls","minLevel":392},{"slotID":"chilichilifever","minLevel":224},{"slotID":"leprechaunmagicdrop","minLevel":212},{"slotID":"bellstrikefrenzy","minLevel":33},{"slotID":"thearcanealchemist","minLevel":308},{"slotID":"jinlongcaifu","minLevel":569},{"slotID":"fatbilly","minLevel":269},{"slotID":"chronosphereegypt","minLevel":488},{"slotID":"candycastle","minLevel":440},{"slotID":"moonlightwolf_dy","minLevel":2018},{"slotID":"bigbucksbounty","minLevel":284},{"slotID":"pilingfortunes","minLevel":323},{"slotID":"santarudolph","minLevel":80},{"slotID":"pumpkinfortune","minLevel":173},{"slotID":"cashshowdown","minLevel":215},{"slotID":"pinupparadise","minLevel":554},{"slotID":"makeitrain","minLevel":152},{"slotID":"magiclamp","minLevel":116},{"slotID":"dualwheelaction","minLevel":140},{"slotID":"drmadwin","minLevel":437},{"slotID":"piggybankriches_dy","minLevel":2033},{"slotID":"mayantemplemagic","minLevel":218},{"slotID":"jiujiujiu999","minLevel":257},{"slotID":"pawsomepanda","minLevel":518},{"slotID":"4thofjulywildrespin","minLevel":119},{"slotID":"nudgewild","minLevel":35},{"slotID":"dragonblast","minLevel":575},{"slotID":"dreamcitylights","minLevel":43},{"slotID":"honeybeeparade","minLevel":53},{"slotID":"firelockclassic_dy","minLevel":2024},{"slotID":"witchpumpkins_dy","minLevel":2051},{"slotID":"shanghaifullmoon","minLevel":131},{"slotID":"shamrocklock","minLevel":296},{"slotID":"hoardinggoblins","minLevel":470},{"slotID":"ladylibertyrespins","minLevel":422},{"slotID":"goldenmoonfortune","minLevel":476},{"slotID":"superninebells","minLevel":188},{"slotID":"wudangjianshi","minLevel":287},{"slotID":"greatamerica","minLevel":239},{"slotID":"rhinoblitz","minLevel":25},{"slotID":"thebeastssecret","minLevel":386},{"slotID":"jurassicwildstomps","minLevel":506},{"slotID":"bloodgems","minLevel":491},{"slotID":"themightyviking","minLevel":21},{"slotID":"theoztales","minLevel":599},{"slotID":"magmaficent","minLevel":452},{"slotID":"superdrumbash","minLevel":497},{"slotID":"bonanzaexpress","minLevel":368},{"slotID":"robinhoodsecondshot","minLevel":389},{"slotID":"meowgicalhalloween","minLevel":356},{"slotID":"horoscopeblessings","minLevel":338},{"slotID":"bunnybank_dy","minLevel":2045},{"slotID":"piggymania","minLevel":398},{"slotID":"majesticlion","minLevel":125},{"slotID":"classicstar","minLevel":410},{"slotID":"witchsapples","minLevel":545},{"slotID":"libertyeaglefortune","minLevel":587},{"slotID":"wheelofvegas","minLevel":74},{"slotID":"carnivalinrio","minLevel":185},{"slotID":"americanvalor","minLevel":230},{"slotID":"sevenglory","minLevel":317},{"slotID":"kongfury","minLevel":242},{"slotID":"gummytummywild","minLevel":167},{"slotID":"patriotsquad","minLevel":596},{"slotID":"midastouchofriches","minLevel":37},{"slotID":"flameofliberty","minLevel":359},{"slotID":"fruityjewels","minLevel":95},{"slotID":"raccoonshowdown","minLevel":446},{"slotID":"locknrollfiver","minLevel":467},{"slotID":"rockingbell","minLevel":170},{"slotID":"talesofarcadia","minLevel":548},{"slotID":"cupidloveydovey","minLevel":563},{"slotID":"beaverstacks","minLevel":413},{"slotID":"kingofsafari","minLevel":104},{"slotID":"waikikisanta","minLevel":314},{"slotID":"classicstar_dy","minLevel":2048},{"slotID":"tomeoffate","minLevel":527},{"slotID":"pharaohsecrets","minLevel":206},{"slotID":"spookynight","minLevel":263},{"slotID":"bingotrio","minLevel":233},{"slotID":"cupidlovespells","minLevel":473},{"slotID":"blackwhitetiger","minLevel":143},{"slotID":"imperialgoldfortune","minLevel":227},{"slotID":"starryholidays","minLevel":461},{"slotID":"templeofathena","minLevel":539},{"slotID":"thebiggame","minLevel":299},{"slotID":"tajmahalprincess","minLevel":19},{"slotID":"supernovablasts","minLevel":341},{"slotID":"ladyoluck","minLevel":395},{"slotID":"blazingphoenix","minLevel":182},{"slotID":"highrisejackpot","minLevel":137},{"slotID":"allamerican","minLevel":500},{"slotID":"luckybunnydrop","minLevel":401},{"slotID":"ghosthunters","minLevel":197},{"slotID":"poseidonwildwaves","minLevel":557},{"slotID":"oktoberfestbierhaus","minLevel":98},{"slotID":"thunderstrike","minLevel":200},{"slotID":"vivalasvegas","minLevel":332},{"slotID":"sishenfortunes","minLevel":209},{"slotID":"fortuneshrine","minLevel":347},{"slotID":"aztecodyssey","minLevel":494},{"slotID":"vampressmansion","minLevel":350},{"slotID":"zeusthundershower","minLevel":482},{"slotID":"rapidhitantarctic","minLevel":275},{"slotID":"richrichfarm","minLevel":428},{"slotID":"kingdominperil","minLevel":248},{"slotID":"rudolphexpress","minLevel":101},{"slotID":"xinnianhao","minLevel":380},{"slotID":"triplewheelsupreme","minLevel":374}],"UpdateDate":1767493514}}')
        var res = res1 as any;


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