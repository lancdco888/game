
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
import SlotTourneyManager, { SlotTourneyTierType } from "../manager/SlotTourneyManager";
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

/**
 * UserGameInfo 接口的实现类
 * 处理用户游戏信息的存储和更新逻辑
 */
export class UserGameInfo  {
    // 基础时间/数值属性，默认初始化为0（时间戳默认0表示未初始化）
    createData: number = 0;
    lastSpinData: number = 0;
    lastTotalBet: number = 0;
    lastAllinBet: number = 0;
    lastAllInDate: number = 0;
    minDateLast30spins: number = 0;
    lastPlayZoneID: number = 0;
    lastPlaySlotID: number = 0;
    modifieData: number = 0; // 保留接口原拼写，建议后续修正为 modifiedData
    totalBet: number = 0;
    totalSpin: number = 0;
    twoh_totalBet: number = 0;
    twoh_totalSpin: number = 0;
    avg_3000_bet: number = 0;
    prevBiggestWinCoin: number = 0;
    biggestWinCoin: number = 0;
    isShowRecordRenewal: boolean = false;
    eighty_SpinCont: number = 0;
    goldTicketGauge: number = 0;
    modeBetDepth: number = 0;
    modeBetDepthLast500Spins: number = 0;
    diamondTicketGauge: number = 0;
    goldWheelGauge: number = 0;
    silverWheelGauge: number = 0;
    diamondWheelGauge: number = 0;
    // 数组属性默认初始化为空数组
    favoriteList: any[] = [];
    recentPlaySlots: any[] = [];

    /**
     * 初始化用户游戏信息
     * @param data 包含用户游戏信息的数据源
     * @returns 是否初始化成功
     */
    initUserGameInfo(data: any): boolean {
        // 校验数据源合法性
        if (!data || typeof data !== 'object') {
            return false;
        }

        // 批量赋值（仅赋值存在的字段，避免覆盖默认值）
        Object.keys(this).forEach(key => {
            if (data.hasOwnProperty(key)) {
                (this as any)[key] = data[key];
            }
        });

        // 特殊处理：确保时间戳为数字类型
        const dateKeys = ['createData', 'lastSpinData', 'lastAllInDate', 'minDateLast30spins', 'modifieData'];
        dateKeys.forEach(key => {
            if (typeof (this as any)[key] !== 'number') {
                (this as any)[key] = 0;
            }
        });

        return true;
    }

    /**
     * 设置最后一次总投注金额
     * @param val 投注金额
     */
    setLastTotalbet(val: number): void {
        // 校验数值合法性（非负）
        if (typeof val !== 'number' || val < 0) {
            console.warn('无效的投注金额：必须是非负数');
            return;
        }
        this.lastTotalBet = val;
        // 同步更新总投注（可选业务逻辑）
        this.totalBet += val;
    }

    /**
     * 设置最大赢币数（核心业务逻辑）
     * @param val 新的赢币数
     */
    setBiggestWinCoin(val: number): void {
        if (typeof val !== 'number' || val < 0) {
            console.warn('无效的赢币数：必须是非负数');
            return;
        }

        // 记录更新前的最大赢币（用于对比）
        this.prevBiggestWinCoin = this.biggestWinCoin;
        // 更新当前最大赢币
        this.biggestWinCoin = val;

        // 业务逻辑：如果新赢币数超过历史记录，标记显示刷新提示
        if (val > this.prevBiggestWinCoin) {
            this.isShowRecordRenewal = true;
        }
    }

    /**
     * 获取记录刷新提示的标记
     * @returns 是否显示刷新提示
     */
    getRecordRenewalFlag(): boolean {
        return this.isShowRecordRenewal;
    }

    /**
     * 重置记录刷新提示标记
     */
    resetRecordRenewalFlag(): void {
        this.isShowRecordRenewal = false;
    }
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
export enum MSG {
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
    private _rewardResult: RewardResult = null;
    private _firstPurchaseState: number = 0;
    private _firstPurchasePopInfo: any | null = null;
    private _location: string = "";
    private _gameId: string = "";
    private _tourneyTier: number = 0;
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
    public _totalCoin = 10000000000;
    public _vipLevel = 0;

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
        userInfo._userInfo.userPromotion = new UserPromotion()
        userInfo._userInfo.userGameInfo = new UserGameInfo()
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

    onLoad(): void {
        console.log("MyInfo add persistRootNode");
        cc.game.addPersistRootNode(this.node);
        this._eventEmitter = new cc.EventTarget();
        this._rewardResult = new RewardResult();
        this.schedule(this.pingSchedule.bind(this), 5);
        this.schedule(this.jackpotInfoSchedule.bind(this), 60);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown.bind(this), this.node)
    }

    clearEvent(): void {
        this.unscheduleAllCallbacks();
    }

    onDestroy(): void {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown.bind(this), this.node);
        this.unscheduleAllCallbacks();
        UserInfo._instance = null;
    }

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

    public getTourneyTier(): number {
        return this._tourneyTier;
    }

    // public getTourneyId(): number {
    //     return this._tourneyID;
    // }

    public isJoinTourney(): boolean {
        return this._tourneyTier !== SlotTourneyTierType.INVALID;
    }

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

    public getServerChangeResult(data: any): any {
        const res = CommonServer.getServerChangeResult(data);
        const reward = RewardResult.parse(data.changeResult, res);
        UserInfo.instance().addRewardResult(reward);
        return res;
    }

    public addRewardResult(e) {
        this._rewardResult.addRewardResult(e)
    }
    
    public resetRewardResult() {
        this._rewardResult.resetRewardResult()
    }

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

    public onKeyDown(e: any): void {
        const keyCode = e.keyCode;
        if (TSUtility.isDevService() && keyCode === cc.macro.KEY.h) {
            PopupManager.Instance().makeScreenShot(3, 1, () => {
                // HeroTooltipTest.getPopup((err, popup) => {
                //     if (!err) popup.open();
                // });
            });
        }
    }

    public applyChangeResult(changeResult: any): void {
        
    }
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

    public removePromotionInfo(key: string): void {
        this._userInfo!.userPromotion!.removePromotion(key);
    }

    public getItemInventory(): UserInven {
        return this._userInfo!.userInven!;
    }

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
        return this._totalCoin;//this._userInfo!.userAssetInfo!.totalCoin;
    }

    public getUserLevel():number{
        return this._vipLevel;
    }

    // public getPaidCoin(): number {
    //     return this._userInfo!.userAssetInfo!.paidCoin;
    // }

    public getUserLevelInfo(): LevelInfo {
        return this._userInfo!.userMasterInfo!.levelInfo;
    }

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

    public getUserInboxMainShopMessageCount(): number {
        return this._userInfo!.userInboxMainShopCnt;
    }

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

    public addUserAssetMoney(val: number): void {
        if (val > 0) ServiceInfoManager.instance.setIsIngAllInOffer(false);
        const oldCoin = this._userInfo!.userAssetInfo!.totalCoin;
        this._userInfo!.userAssetInfo!.totalCoin += val;
        if (this._userInfo!.userAssetInfo!.totalCoin < 0) {
            console.error(`addUserAssetMoney fail...${val.toString()} - ${oldCoin.toString()}`);
            this._userInfo!.userAssetInfo!.totalCoin = 0;
        }
        this._userInfo!.userAssetInfo!.biggestTotalCoin = Math.max(this._userInfo!.userAssetInfo!.totalCoin, this._userInfo!.userAssetInfo!.biggestTotalCoin);
        this._eventEmitter!.emit(MSG.UPDATE_ASSET, oldCoin);
    }

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

    public changeUserProfilePicUrl(val: string): void {
        this._userInfo!.userMasterInfo!.picUrl = val;
        this._eventEmitter!.emit(MSG.UPDATE_PICTURE);
    }

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

    public getUserHeroInfo(): UserHeroInfo | null {
        return this._userHeroInfo;
    }

    // public changeActiveHero(heroId: number): boolean {
    //     if (this._userHeroInfo!.changeActiveHero(heroId) ===0) {
    //         console.error("changeActiveHero fail", heroId);
    //         return false;
    //     }
    //     if (HeroManager.Instance().isNewTag(heroId)) HeroManager.Instance().clearNewTag(heroId);
    //     this._eventEmitter!.emit(MSG.CHANGE_ACTIVE_HERO);
    //     return true;
    // }

    public addHeroExp(heroId: any, exp: number): void {
        const isNew = !this._userHeroInfo!.hasHero(heroId);
        const oldLevel = this._userHeroInfo!.getHeroLevel(heroId);
        this._userHeroInfo!.addHeroExp(heroId, exp);
        const newLevel = this._userHeroInfo!.getHeroLevel(heroId);
        
        this._eventEmitter!.emit(MSG.UPDATE_HERO_EXPUP);
        if (oldLevel !== newLevel) this._eventEmitter!.emit(MSG.UPDATE_HERO_RANKUP, heroId);
        if (isNew) this._eventEmitter!.emit(MSG.ADD_NEW_HERO, heroId);
    }

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

    public setZoneID(val: any): void {
        this._zoneId = val;
        // NativeUtil.setObjValue_FBCrash("ZoneId", val.toString());
    }

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

    public addListenerTarget(event: string, cb: Function, target: any): void {
        this._eventEmitter!.on(event, cb, target);
    }

    public removeListenerTarget(event: string, cb: Function, target: any): void {
        this._eventEmitter!.off(event, cb, target);
    }

    public removeListenerTargetAll(target: any): void {
        this._eventEmitter!.targetOff(target);
    }

    public pingSchedule(): void {
        // this.asyncRequestPing();
    }

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

    public jackpotInfoSchedule(): void {
        this.asyncRefreshJackpotInfo(false);
    }

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

    public setUserHeroInfo(data: any): void {
        this._userHeroInfo = UserHeroInfo.parse(data);
    }

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
        const res = this.asyncRefreshJackpotInfoByZoneId(Math.min(1, zoneId),"");
        return res;
    }

    public asyncRefreshJackpotInfoByZoneId(zoneId: number,res2:any) {
        // const res = await CommonServer.Instance().requestZoneInfo();
        // if (!this.isValid) return false;
        // if (CommonServer.isServerResponseError(res)) {
        //     console.error("CommonServer.Instance().requestZoneInfo fail ");
        //     return false;
        // }

        var res1 = JSON.parse('{"casinoJackpotLastWins":{"1":{"user":{"uid":132889215811584,"fbid":"3059320660845008","fbInstantID":"3059320660845008","name":"Lawrence","picUrl":"https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=5346251888804707&gaming_photo_type=unified_picture&ext=1772275245&hash=AT-o4G177mUvOF1qT3Zlzxef","createdDate":1698236779,"lastLoginDate":1769683266,"accountSite":0},"casinoJackpotWinID":491300770234368,"zoneID":1,"slotID":"megatondynamite","totalPrize":11846923402,"basePrize":1000000000,"progressivePrize":10846923402,"betLine":20,"betPerLine":9000000,"totalBetCoin":900000000,"winDate":1769684863,"winners":[132889215811584,490785009205248,157727015903232,488721021599744,166458929758208,389010902024192,197958599499776,438530566340608,159480283152384,95875045023744,362489086820352,209666581774336,101965667237888,289024185057280,478434895814656,491187876298752,198737339138048,265357568868352,206305398693888,100302334214144]}},"casinoJackpots":[{"zoneID":1,"slotID":"","jackpotSubID":0,"jackpotSubKey":"","jackpot":11529125340,"basePrize":1000000000,"basePrizeType":"FixedCoin","maxBasePrize":0,"minPrize":7946752536,"maxPrize":17628865190,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"endDateClub":32472172800,"error":{"code":0,"msg":""},"isActiveClub":true,"mostPlayedSlots":["mooorecheddar","dragonsandpearls","honeybeeparade","libertyeaglefortune","kingofsafari","beaverstacks"],"reqId":1769687677,"slotJackpotsAll":{"0":{"4thofjulywildrespin":[{"zoneID":0,"slotID":"4thofjulywildrespin","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":2518469042,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"4thofjulywildrespin","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":1248239724,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"4thofjulywildrespin","jackpotSubID":3,"jackpotSubKey":"major","jackpot":1013594786,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"4thofjulywildrespin","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":627904055,"basePrize":875,"basePrizeType":"BetPerLine","maxBasePrize":4200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"4thofjulywildrespin","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":152064793,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"4thofjulywildrespin","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":360000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"abracadabra":[{"zoneID":0,"slotID":"abracadabra","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6376835661,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":86400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"alienamigos":[{"zoneID":0,"slotID":"alienamigos","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":11923564459,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alienamigos","jackpotSubID":2,"jackpotSubKey":"major","jackpot":26232565281,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alienamigos","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alienamigos","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"allamerican":[{"zoneID":0,"slotID":"allamerican","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":26184580364,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"allamerican","jackpotSubID":2,"jackpotSubKey":"major","jackpot":14849779021,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"allamerican","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"allamerican","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":960000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"allstarcircus":[{"zoneID":0,"slotID":"allstarcircus","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":4659866101,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"allstarcircus","jackpotSubID":2,"jackpotSubKey":"major","jackpot":478651490,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"allstarcircus","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":513340054,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"allstarcircus","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":166958106,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"alohahawaii":[{"zoneID":0,"slotID":"alohahawaii","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":469101970201,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":9842840646,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":7200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii","jackpotSubID":2,"jackpotSubKey":"major","jackpot":6400812504,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1440000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":720000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"alohahawaii_dy":[{"zoneID":0,"slotID":"alohahawaii_dy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":14400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":7200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":2880000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"alohahawaii_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1440000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"american9eagles":[{"zoneID":0,"slotID":"american9eagles","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":80839598716,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"american9eagles","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":13620810813,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"american9eagles","jackpotSubID":2,"jackpotSubKey":"major","jackpot":3247460644,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"american9eagles","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":224027611,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"american9eagles","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":370880024,"basePrize":320,"basePrizeType":"BetPerLine","maxBasePrize":960000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.045,"linked":false,"linkedKey":""}],"americanvalor":[{"zoneID":0,"slotID":"americanvalor","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5139677383,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"apocalypselasthope":[{"zoneID":0,"slotID":"apocalypselasthope","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":49311319.599993125,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"apocalypselasthope","jackpotSubID":2,"jackpotSubKey":"major","jackpot":550573566.4000045,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"apocalypselasthope","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":189470507.5999921,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"apocalypselasthope","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":41188487.39999849,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"aztecodyssey":[{"zoneID":0,"slotID":"aztecodyssey","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1954721985,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"aztecodyssey","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1144775476,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"aztecodyssey","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"aztecodyssey","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":80,"basePrizeType":"BetPerLine","maxBasePrize":240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"babysantawild":[{"zoneID":0,"slotID":"babysantawild","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":118822084618,"basePrize":980,"basePrizeType":"BetPerLine","maxBasePrize":117600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"babysantawild","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":25290998847,"basePrize":484,"basePrizeType":"BetPerLine","maxBasePrize":58080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"babysantawild","jackpotSubID":2,"jackpotSubKey":"major","jackpot":5629508990,"basePrize":188,"basePrizeType":"BetPerLine","maxBasePrize":22560000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"bankofwealth":[{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":9,"jackpotSubKey":"grand","jackpot":35489440631.20437,"basePrize":45000,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":8,"jackpotSubKey":"mega","jackpot":3698284553.2002096,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":7,"jackpotSubKey":"major","jackpot":397148303.1999127,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":5400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":6,"jackpotSubKey":"minor","jackpot":73998992.20001096,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":2700000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":5,"jackpotSubKey":"mini","jackpot":21308578.19999956,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":0,"jackpotSubKey":"classic1","jackpot":567167006.1999068,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":1,"jackpotSubKey":"classic2","jackpot":1649019024.2003534,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":5400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":2,"jackpotSubKey":"classic3","jackpot":8565522143.198561,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":3,"jackpotSubKey":"classic4","jackpot":5324848698.198769,"basePrize":45000,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bankofwealth","jackpotSubID":4,"jackpotSubKey":"classic5","jackpot":9545015719.198254,"basePrize":90000,"basePrizeType":"BetPerLine","maxBasePrize":108000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"beelovedjars":[{"zoneID":0,"slotID":"beelovedjars","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":410882270,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"beelovedjars","jackpotSubID":2,"jackpotSubKey":"major","jackpot":762976411,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"beelovedjars","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":493237922,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"beelovedjars","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":94284274,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"bellstrikefrenzy":[{"zoneID":0,"slotID":"bellstrikefrenzy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":906272844783,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"bigbucksbounty":[{"zoneID":0,"slotID":"bigbucksbounty","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2337829546,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bigbucksbounty","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1040186488,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bigbucksbounty","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":80158528,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bigbucksbounty","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":26578909,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"bingotrio":[{"zoneID":0,"slotID":"bingotrio","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":123845134436,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bingotrio","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2509022703,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bingotrio","jackpotSubID":2,"jackpotSubKey":"major","jackpot":739785279,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bingotrio","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":165411901,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bingotrio","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":48040432,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""}],"birdjackpot":[{"zoneID":0,"slotID":"birdjackpot","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":75583638435,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5131744752,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1193875605,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":357666758,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":60147352,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""}],"birdjackpot_dy":[{"zoneID":0,"slotID":"birdjackpot_dy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":96000,"basePrizeType":"BetPerLine","maxBasePrize":288000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"birdjackpot_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.008,"linked":false,"linkedKey":""}],"blackwhitetiger":[{"zoneID":0,"slotID":"blackwhitetiger","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6740856434.5998535,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"blackwhitetiger","jackpotSubID":2,"jackpotSubKey":"major","jackpot":10458919486.89945,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"blackwhitetiger","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":381027916.5999959,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"blackwhitetiger","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":273215699.9000069,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"blazingbullwild":[{"zoneID":0,"slotID":"blazingbullwild","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":68506135089.795074,"basePrize":32000,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"blazingbullwild","jackpotSubID":3,"jackpotSubKey":"major","jackpot":22557222314.20282,"basePrize":6400,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"blazingbullwild","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":3787106729.7999935,"basePrize":1600,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"blazingbullwild","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":594436025.1999586,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"blazingbullwild","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":160,"basePrizeType":"BetPerLine","maxBasePrize":240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"bloodgems":[{"zoneID":0,"slotID":"bloodgems","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":7293328976.599937,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bloodgems","jackpotSubID":2,"jackpotSubKey":"major","jackpot":13865245906.199892,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bloodgems","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":20453523714.80036,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"bloodgems","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1832215250.4001503,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"bonanzaexpress":[{"zoneID":0,"slotID":"bonanzaexpress","jackpotSubID":0,"jackpotSubKey":"grand","jackpot":222655906656,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"boonanza":[{"zoneID":0,"slotID":"boonanza","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":47264578098,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"boonanza","jackpotSubID":2,"jackpotSubKey":"major","jackpot":269288738,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"boonanza","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":147914250,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"boonanza","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":116903885,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"bunnybank":[{"zoneID":0,"slotID":"bunnybank","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2313111567,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"bunnybank_dy":[{"zoneID":0,"slotID":"bunnybank_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6000,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"candycastle":[{"zoneID":0,"slotID":"candycastle","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":3105378471,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"candycastle","jackpotSubID":2,"jackpotSubKey":"major","jackpot":901908909,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"candycastle","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":449449251,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":3200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"candycastle","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":180205184,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"captainblackpurr":[{"zoneID":0,"slotID":"captainblackpurr","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":42129192202,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"captainblackpurr","jackpotSubID":2,"jackpotSubKey":"major","jackpot":6316450715,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"captainblackpurr","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":5635109504,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"captainblackpurr","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":384373828,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"carnivalinrio":[{"zoneID":0,"slotID":"carnivalinrio","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":10364177129,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"cashshowdown":[{"zoneID":0,"slotID":"cashshowdown","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":923441193,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"cashshowdown","jackpotSubID":1,"jackpotSubKey":"major","jackpot":864829460,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"cashshowdowndeluxe":[{"zoneID":0,"slotID":"cashshowdowndeluxe","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":1050,"basePrizeType":"BetPerLine","maxBasePrize":126000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"casinoroyale":[{"zoneID":0,"slotID":"casinoroyale","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":301003545525,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"casinoroyale","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"casinoroyale","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"casinoroyale","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"casinoroyale_dy":[{"zoneID":0,"slotID":"casinoroyale_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"casinoroyale_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"casinoroyale_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"casinoroyale_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"chilichilifever":[{"zoneID":0,"slotID":"chilichilifever","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":13515386123.000055,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"chilichilifever","jackpotSubID":2,"jackpotSubKey":"major","jackpot":10860466668.00014,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"chilichilifever","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":126636162.99996537,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"chilichilifever","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":114670536.00001614,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":900000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"classiclockrollgrand":[{"zoneID":0,"slotID":"classiclockrollgrand","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":286321672191,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classiclockrollgrand","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classiclockrollgrand","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":8640000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classiclockrollgrand","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":3600,"basePrizeType":"BetPerLine","maxBasePrize":4320000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"classicstar":[{"zoneID":0,"slotID":"classicstar","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":1589270403.8000698,"basePrize":1700,"basePrizeType":"BetPerLine","maxBasePrize":40800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classicstar","jackpotSubID":2,"jackpotSubKey":"major","jackpot":206840458.59999424,"basePrize":700,"basePrizeType":"BetPerLine","maxBasePrize":16800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classicstar","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":58731005.39999905,"basePrize":450,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classicstar","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":12406482.20000153,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0008,"linked":false,"linkedKey":""}],"classicstar_dy":[{"zoneID":0,"slotID":"classicstar_dy","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classicstar_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classicstar_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"classicstar_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0008,"linked":false,"linkedKey":""}],"cupidlovespells":[{"zoneID":0,"slotID":"cupidlovespells","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":38064822,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"cupidlovespells","jackpotSubID":1,"jackpotSubKey":"major","jackpot":67368953548,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"cupidlovespells","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":141526459,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"cupidloveydovey":[{"zoneID":0,"slotID":"cupidloveydovey","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":29185998,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"cupidloveydovey","jackpotSubID":2,"jackpotSubKey":"major","jackpot":342919802,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"cupidloveydovey","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":99675156,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"cupidloveydovey","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":130737111.99999924,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"curiousmermaid":[{"zoneID":0,"slotID":"curiousmermaid","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":98698830939,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":true,"linkedKey":"mysticgypsi_curiousmermaid"},{"zoneID":0,"slotID":"curiousmermaid","jackpotSubID":2,"jackpotSubKey":"major","jackpot":15926722423,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"curiousmermaid","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"curiousmermaid","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"dakotafarmgirl":[{"zoneID":0,"slotID":"dakotafarmgirl","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":6000,"basePrizeType":"BetPerLine","maxBasePrize":14400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dakotafarmgirl","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":7200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dakotafarmgirl","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dakotafarmgirl","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dakotafarmgirl","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"davyjonesslocker":[{"zoneID":0,"slotID":"davyjonesslocker","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":472425360,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"davyjonesslocker","jackpotSubID":2,"jackpotSubKey":"major","jackpot":14953950,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"davyjonesslocker","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":19877805,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"davyjonesslocker","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":20797795,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"diamondbeamjackpot":[{"zoneID":0,"slotID":"diamondbeamjackpot","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":33903489224,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":480000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondbeamjackpot","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":4601788836,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondbeamjackpot","jackpotSubID":3,"jackpotSubKey":"major","jackpot":3717848882,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondbeamjackpot","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":714022607,"basePrize":70,"basePrizeType":"BetPerLine","maxBasePrize":8400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondbeamjackpot","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":0,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondbeamjackpot","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"diamondstrike":[{"zoneID":0,"slotID":"diamondstrike","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":681116569831,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondstrike","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":41060100334,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondstrike","jackpotSubID":2,"jackpotSubKey":"major","jackpot":6810281828,"basePrize":1875,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondstrike","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3033951539,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.05,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"diamondstrike","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1098227692,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.09,"linked":false,"linkedKey":""}],"dingdongjackpots":[{"zoneID":0,"slotID":"dingdongjackpots","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":68241685842,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dingdongjackpots","jackpotSubID":2,"jackpotSubKey":"major","jackpot":126516225220,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dingdongjackpots","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":120888134813,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dingdongjackpots","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":29270594197,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"dragonblast":[{"zoneID":0,"slotID":"dragonblast","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":21339819201,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonblast","jackpotSubID":2,"jackpotSubKey":"major","jackpot":948936233,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonblast","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":91769575,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonblast","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":40179871,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"dragonorbs":[{"zoneID":0,"slotID":"dragonorbs","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":5774193038,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonorbs","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1220933972,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonorbs","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":998848576,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonorbs","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":618035652,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"dragonsandpearls":[{"zoneID":0,"slotID":"dragonsandpearls","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":12574778920.59912,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonsandpearls","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":7432739957,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonsandpearls","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1570237737.4001176,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":7200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0037,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonsandpearls","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":550232522.200103,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0076,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragonsandpearls","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":308923980.8000598,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0079,"linked":false,"linkedKey":""}],"dragontales":[{"zoneID":0,"slotID":"dragontales","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":161822160516,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.009,"linked":true,"linkedKey":"dragontales_orientallanterns"},{"zoneID":0,"slotID":"dragontales","jackpotSubID":2,"jackpotSubKey":"major","jackpot":3323090223,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragontales","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":324661474,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dragontales","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":74530015,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"dreamcitylights":[{"zoneID":0,"slotID":"dreamcitylights","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1046790603.0000138,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dreamcitylights","jackpotSubID":2,"jackpotSubKey":"major","jackpot":464401806.99998325,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dreamcitylights","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":87951498.99999611,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""}],"drmadwin":[{"zoneID":0,"slotID":"drmadwin","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"drmadwin","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"drmadwin","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"drmadwin","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"drmadwin","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"dualdiamondsstrike":[{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":8,"jackpotSubKey":"pink9jackpot","jackpot":95782107,"basePrize":4800,"basePrizeType":"BetPerLine","maxBasePrize":23040000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":7,"jackpotSubKey":"pink8jackpot","jackpot":67424650,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":5760000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":6,"jackpotSubKey":"pink7jackpot","jackpot":301963822,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":2880000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":5,"jackpotSubKey":"pink6jackpot","jackpot":68841938,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1440000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":4,"jackpotSubKey":"blue9jackpot","jackpot":95782107,"basePrize":4800,"basePrizeType":"BetPerLine","maxBasePrize":23040000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":3,"jackpotSubKey":"blue8jackpot","jackpot":67424650,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":5760000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":2,"jackpotSubKey":"blue7jackpot","jackpot":301977375,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":2880000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualdiamondsstrike","jackpotSubID":1,"jackpotSubKey":"blue6jackpot","jackpot":69123324,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1440000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"dualfortunepot":[{"zoneID":0,"slotID":"dualfortunepot","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":67730683891.613914,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2221812880.601679,"basePrize":3750,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":457505463.79969674,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":180629362.19999504,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0126,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":199361760.79993168,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0129,"linked":false,"linkedKey":""}],"dualfortunepot_dy":[{"zoneID":0,"slotID":"dualfortunepot_dy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":7500,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0126,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"dualfortunepot_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0129,"linked":false,"linkedKey":""}],"eggstraeaster":[{"zoneID":0,"slotID":"eggstraeaster","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":138410051.59999895,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"eggstraeaster","jackpotSubID":2,"jackpotSubKey":"major","jackpot":244622258.39999694,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"eggstraeaster","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":397289935.60000366,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"eggstraeaster","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":294429065.4000032,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"emeraldgreen":[{"zoneID":0,"slotID":"emeraldgreen","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":6500336994,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"emeraldgreen","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":1572592710,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"emeraldgreen","jackpotSubID":3,"jackpotSubKey":"major","jackpot":695802213,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"emeraldgreen","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":152859874,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"emeraldgreen","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":66857547,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"emeraldgreen","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":700,"basePrizeType":"BetPerLine","maxBasePrize":840000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"emeraldislegold":[{"zoneID":0,"slotID":"emeraldislegold","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":96641165285,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"fatturkeywilds":[{"zoneID":0,"slotID":"fatturkeywilds","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":35664284376.4,"basePrize":980,"basePrizeType":"BetPerLine","maxBasePrize":117600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fatturkeywilds","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":19312214416.4,"basePrize":484,"basePrizeType":"BetPerLine","maxBasePrize":58080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fatturkeywilds","jackpotSubID":2,"jackpotSubKey":"major","jackpot":6186904183.8,"basePrize":188,"basePrizeType":"BetPerLine","maxBasePrize":22560000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"fireblastclassic":[{"zoneID":0,"slotID":"fireblastclassic","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":1394762312,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fireblastclassic","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":387661567,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fireblastclassic","jackpotSubID":3,"jackpotSubKey":"major","jackpot":139871588,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fireblastclassic","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":49431111,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fireblastclassic","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":19776885,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fireblastclassic","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":5,"basePrizeType":"BetPerLine","maxBasePrize":120000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"firelockultimate":[{"zoneID":0,"slotID":"firelockultimate","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":366403179127,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"flamefurywheel":[{"zoneID":0,"slotID":"flamefurywheel","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":3390006738.1980996,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"flamefurywheel","jackpotSubID":2,"jackpotSubKey":"major","jackpot":175146232.8014768,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"flamefurywheel","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":180739650.20395765,"basePrize":15,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"flamefurywheel","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":68809407.80430482,"basePrize":5,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"flameofliberty":[{"zoneID":0,"slotID":"flameofliberty","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":32745053753,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"flameofliberty","jackpotSubID":2,"jackpotSubKey":"major","jackpot":13683165315,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"flameofliberty","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1851605168,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"flameofliberty","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":440125045,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"fortunepot":[{"zoneID":0,"slotID":"fortunepot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":83656137606.8153,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortunepot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":24789880291.614708,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortunepot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":809950235.4850864,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0126,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortunepot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":477645248.37728465,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0129,"linked":false,"linkedKey":""}],"fortuneshrine":[{"zoneID":0,"slotID":"fortuneshrine","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":3025534505,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortuneshrine","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1487036953,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortuneshrine","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":76029060.99999844,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortuneshrine","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":42425279,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"fortunetree":[{"zoneID":0,"slotID":"fortunetree","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":563547674860,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortunetree","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":563424349614,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortunetree","jackpotSubID":2,"jackpotSubKey":"major","jackpot":177786320817,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortunetree","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":5580372442,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fortunetree","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2154026769,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""}],"frozenthronerespin":[{"zoneID":0,"slotID":"frozenthronerespin","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5914023953,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"fruityblast":[{"zoneID":0,"slotID":"fruityblast","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":3484235925.599803,"basePrize":3990,"basePrizeType":"BetPerLine","maxBasePrize":47880000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fruityblast","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":17486311954.601574,"basePrize":1670,"basePrizeType":"BetPerLine","maxBasePrize":20040000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fruityblast","jackpotSubID":3,"jackpotSubKey":"major","jackpot":150161771283.79913,"basePrize":790,"basePrizeType":"BetPerLine","maxBasePrize":9480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fruityblast","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":81108891158.79745,"basePrize":270,"basePrizeType":"BetPerLine","maxBasePrize":3240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fruityblast","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":53511774686.60111,"basePrize":110,"basePrizeType":"BetPerLine","maxBasePrize":1320000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fruityblast","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":842785352.5997845,"basePrize":40,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"fruityjewels":[{"zoneID":0,"slotID":"fruityjewels","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":25077838176,"basePrize":14400,"basePrizeType":"BetPerLine","maxBasePrize":43200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"fruityjewels","jackpotSubID":2,"jackpotSubKey":"major","jackpot":8251659251,"basePrize":14400,"basePrizeType":"BetPerLine","maxBasePrize":43200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"gempackedwilds":[{"zoneID":0,"slotID":"gempackedwilds","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":7202283445,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"gempackedwilds","jackpotSubID":2,"jackpotSubKey":"major","jackpot":10532451715,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"gempackedwilds","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3366006788,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"gempackedwilds","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2384940167,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"gempackedwilds_dy":[{"zoneID":0,"slotID":"gempackedwilds_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"gempackedwilds_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"gempackedwilds_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":4320000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"gempackedwilds_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"golden100xdollar":[{"zoneID":0,"slotID":"golden100xdollar","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":547614988269.82,"basePrize":6000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"goldenbuffalofever":[{"zoneID":0,"slotID":"goldenbuffalofever","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":4559867838.2017975,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":80000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"goldenbuffalofever","jackpotSubID":2,"jackpotSubKey":"major","jackpot":5367104058.797469,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":10000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""}],"goldencrown":[{"zoneID":0,"slotID":"goldencrown","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":113934273733,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"goldeneagleking":[{"zoneID":0,"slotID":"goldeneagleking","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":71223709177,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"goldeneagleking","jackpotSubID":2,"jackpotSubKey":"major","jackpot":2257713602,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"goldeneagleking","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":153880141.9999934,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":900000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"goldeneagleking","jackpotSubID":0,"jackpotSubKey":"eagletrigger","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"goldenmoonfortune":[{"zoneID":0,"slotID":"goldenmoonfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":8728527674.90003,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":108000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"goldenmoonfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1028748846.7000129,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"goldenmoonfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":204110426.5,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":2160000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"goldenmoonfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":101495396.90000004,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"greatamerica":[{"zoneID":0,"slotID":"greatamerica","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":34941954241,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":21600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"greatamerica","jackpotSubID":1,"jackpotSubKey":"major","jackpot":3289055256,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"greatamerica","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":10094032518,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":5400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"highrisejackpot":[{"zoneID":0,"slotID":"highrisejackpot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":455676866.1999853,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"highrisejackpot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":312063744.8000141,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"highrisejackpot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":557877715.1999909,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"highrisejackpot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":288809643.80001426,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"hoardinggoblins":[{"zoneID":0,"slotID":"hoardinggoblins","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":916748171,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"hoardinggoblins","jackpotSubID":2,"jackpotSubKey":"major","jackpot":382426922,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"hoardinggoblins","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":176961228,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"hoardinggoblins","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1293715327,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"honeybeeparade":[{"zoneID":0,"slotID":"honeybeeparade","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":8190208050.799876,"basePrize":6250,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"honeybeeparade","jackpotSubID":2,"jackpotSubKey":"major","jackpot":4131239461.200123,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"honeybeeparade","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1435168024.8000143,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"honeybeeparade","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":53546343.20000719,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":120000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"houndofhades":[{"zoneID":0,"slotID":"houndofhades","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":39811872873,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"houndofhades","jackpotSubID":2,"jackpotSubKey":"major","jackpot":6393476153,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"houndofhades","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":711785818,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"houndofhades","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":127921548,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"huffndoze":[{"zoneID":0,"slotID":"huffndoze","jackpotSubID":5,"jackpotSubKey":"mega","jackpot":14974463054,"basePrize":200000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"huffndoze","jackpotSubID":4,"jackpotSubKey":"major","jackpot":534848953,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"huffndoze","jackpotSubID":3,"jackpotSubKey":"minor2","jackpot":0,"basePrize":6000,"basePrizeType":"BetPerLine","maxBasePrize":7200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"huffndoze","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":0,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"huffndoze","jackpotSubID":1,"jackpotSubKey":"mini2","jackpot":0,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"huffndoze","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"imperialgoldfortune":[{"zoneID":0,"slotID":"imperialgoldfortune","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":47143802226,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"imperialgoldfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":44607223349,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"imperialgoldfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":12128290949,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"imperialgoldfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"imperialgoldfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"jacksmagicbeans":[{"zoneID":0,"slotID":"jacksmagicbeans","jackpotSubID":0,"jackpotSubKey":"freespin_feature","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"jiujiujiu999":[{"zoneID":0,"slotID":"jiujiujiu999","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":111968936896,"basePrize":32000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jiujiujiu999","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":206211728127,"basePrize":12000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jiujiujiu999","jackpotSubID":2,"jackpotSubKey":"major","jackpot":38030709201,"basePrize":2800,"basePrizeType":"BetPerLine","maxBasePrize":8400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jiujiujiu999","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":52842900,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jiujiujiu999","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"jollyrogerjackpot":[{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":10,"jackpotSubKey":"15jackpot","jackpot":1196544120,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":9,"jackpotSubKey":"14jackpot","jackpot":1086513577,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":8,"jackpotSubKey":"13jackpot","jackpot":527319892,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":19200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":7,"jackpotSubKey":"12jackpot","jackpot":254289731,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":6,"jackpotSubKey":"11jackpot","jackpot":216102197,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":7200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":5,"jackpotSubKey":"10jackpot","jackpot":55327041,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":4,"jackpotSubKey":"9jackpot","jackpot":133040119,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":3,"jackpotSubKey":"8jackpot","jackpot":100910705,"basePrize":65,"basePrizeType":"BetPerLine","maxBasePrize":1560000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":2,"jackpotSubKey":"7jackpot","jackpot":195267887,"basePrize":45,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":1,"jackpotSubKey":"6jackpot","jackpot":176550604,"basePrize":35,"basePrizeType":"BetPerLine","maxBasePrize":840000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jollyrogerjackpot","jackpotSubID":0,"jackpotSubKey":"5jackpot","jackpot":1428764965,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"jumbopiggies":[{"zoneID":0,"slotID":"jumbopiggies","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":9611410416,"basePrize":500000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jumbopiggies","jackpotSubID":2,"jackpotSubKey":"major","jackpot":2720046433,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jumbopiggies","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1855404334,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jumbopiggies","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":371913012,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"jurassicwildstomps":[{"zoneID":0,"slotID":"jurassicwildstomps","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jurassicwildstomps","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jurassicwildstomps","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":1500000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"jurassicwildstomps","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"kongfury":[{"zoneID":0,"slotID":"kongfury","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2218706322.000076,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"kongfury","jackpotSubID":2,"jackpotSubKey":"major","jackpot":2057944876.9999287,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"kongfury","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":789926170.0000665,"basePrize":1600,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"kongfury","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":522086563.99997014,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"kongsmash":[{"zoneID":0,"slotID":"kongsmash","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":18185907551,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"kongsmash","jackpotSubID":2,"jackpotSubKey":"major","jackpot":19320527322,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"kongsmash","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":6499831338,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"kongsmash","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1754102101.9999993,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"ladylibertyrespins":[{"zoneID":0,"slotID":"ladylibertyrespins","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":15799254686,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"ladylibertyrespins","jackpotSubID":2,"jackpotSubKey":"major","jackpot":10901026802,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"ladylibertyrespins","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2879193409,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"ladylibertyrespins","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":381452804,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":720000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"libertyeaglefortune":[{"zoneID":0,"slotID":"libertyeaglefortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":20041017877,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"libertyeaglefortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":19921204084,"basePrize":2700,"basePrizeType":"BetPerLine","maxBasePrize":32400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"libertyeaglefortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":44944650229,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"libertyeaglefortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":13501398369,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"locknrollfiver":[{"zoneID":0,"slotID":"locknrollfiver","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"locknrollfiver","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"locknrollfiver","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"locknrollfiver","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"lollylandgummyking":[{"zoneID":0,"slotID":"lollylandgummyking","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":555727386.0000134,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"lollylandgummyking","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1203464608.000036,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"lollylandgummyking","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":659225251.0000144,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"lollylandgummyking","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":56159875.00000107,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""}],"luckyamericanroll":[{"zoneID":0,"slotID":"luckyamericanroll","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":204214797295,"basePrize":4050,"basePrizeType":"BetPerLine","maxBasePrize":48600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"luckybunnydrop":[{"zoneID":0,"slotID":"luckybunnydrop","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"luckybunnydrop","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"luckybunnydrop","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"luckybunnydrop","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"luckybunnydrop","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"magmaficent":[{"zoneID":0,"slotID":"magmaficent","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":1697972067,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"magmaficent","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1383121104,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"magmaficent","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2746705815,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"magmaficent","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":340986956,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"makeitrain":[{"zoneID":0,"slotID":"makeitrain","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":7595884103,"basePrize":1950,"basePrizeType":"BetPerLine","maxBasePrize":46800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"marineadventure":[{"zoneID":0,"slotID":"marineadventure","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":48207183984,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":86400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"marineadventure","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":0,"basePrize":720,"basePrizeType":"BetPerLine","maxBasePrize":8640000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"marineadventure","jackpotSubID":1,"jackpotSubKey":"major","jackpot":0,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":2160000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"marineadventure","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"megabingoclassic":[{"zoneID":0,"slotID":"megabingoclassic","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":12491450312,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"megabingoclassic","jackpotSubID":2,"jackpotSubKey":"major","jackpot":4725695411,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"megabingoclassic","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"megabingoclassic","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"megatondynamite":[{"zoneID":0,"slotID":"megatondynamite","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":42449111757,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"megatondynamite","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":8640000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"megatondynamite","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":3600,"basePrizeType":"BetPerLine","maxBasePrize":4320000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"meowgicalhalloween":[{"zoneID":0,"slotID":"meowgicalhalloween","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"meowgicalhalloween","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"meowgicalhalloween","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"meowgicalhalloween","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"meowgicalhalloween","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":960000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"moneystax":[{"zoneID":0,"slotID":"moneystax","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":31437925059,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"moneystax","jackpotSubID":2,"jackpotSubKey":"major","jackpot":19386298487,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"moneystax","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":19256914788,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"moneystax","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":5244739196,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"moonlightwolf":[{"zoneID":0,"slotID":"moonlightwolf","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":11982504753,"basePrize":1950,"basePrizeType":"BetPerLine","maxBasePrize":46800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"moonlightwolf_dy":[{"zoneID":0,"slotID":"moonlightwolf_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":3950,"basePrizeType":"BetPerLine","maxBasePrize":94800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"mooorecheddar":[{"zoneID":0,"slotID":"mooorecheddar","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mooorecheddar","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mooorecheddar","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mooorecheddar","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"mysterrier":[{"zoneID":0,"slotID":"mysterrier","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":10906085345,"basePrize":75000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mysterrier","jackpotSubID":2,"jackpotSubKey":"major","jackpot":201405747,"basePrize":3750,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mysterrier","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mysterrier","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"mysticgypsy":[{"zoneID":0,"slotID":"mysticgypsy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":98702365779,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":true,"linkedKey":"mysticgypsi_curiousmermaid"},{"zoneID":0,"slotID":"mysticgypsy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":5846871873,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mysticgypsy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"mysticgypsy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"nudginglockclassic":[{"zoneID":0,"slotID":"nudginglockclassic","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6886030039.5,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"nudginglockclassic_dy":[{"zoneID":0,"slotID":"nudginglockclassic_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"nuttysquirrel":[{"zoneID":0,"slotID":"nuttysquirrel","jackpotSubID":2,"jackpotSubKey":"grand","jackpot":11631405136,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"nuttysquirrel","jackpotSubID":1,"jackpotSubKey":"major","jackpot":98585787,"basePrize":225,"basePrizeType":"BetPerLine","maxBasePrize":5400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"nuttysquirrel","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":158272947,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"orientallanterns":[{"zoneID":0,"slotID":"orientallanterns","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":161822413722,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.009,"linked":true,"linkedKey":"dragontales_orientallanterns"},{"zoneID":0,"slotID":"orientallanterns","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1363508567,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"orientallanterns","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":702570571,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"orientallanterns","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":121302420,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"pawpawneko":[{"zoneID":0,"slotID":"pawpawneko","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":1024899088,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawpawneko","jackpotSubID":2,"jackpotSubKey":"major","jackpot":819140171,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawpawneko","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":571578640,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawpawneko","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":21941336.99999694,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"pawsomepanda":[{"zoneID":0,"slotID":"pawsomepanda","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":7472309302,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawsomepanda","jackpotSubID":4,"jackpotSubKey":"super","jackpot":245645659,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawsomepanda","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":64841193,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawsomepanda","jackpotSubID":2,"jackpotSubKey":"major","jackpot":84972709,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawsomepanda","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":80454683,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pawsomepanda","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":57483228,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""}],"peachyfortune":[{"zoneID":0,"slotID":"peachyfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":12967355387,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"peachyfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":6538108671,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"peachyfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":445159118,"basePrize":625,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"peachyfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":117788863.99998756,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"penguinforce":[{"zoneID":0,"slotID":"penguinforce","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":4385060457.56,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"penguinforce","jackpotSubID":2,"jackpotSubKey":"major","jackpot":235947829.34,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"penguinforce","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":190083056.68,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"penguinforce","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":110481938.01999646,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"pharaohsbeetlelink":[{"zoneID":0,"slotID":"pharaohsbeetlelink","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":772681718002,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsbeetlelink","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsbeetlelink","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsbeetlelink","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"pharaohsbeetlelink_dy":[{"zoneID":0,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":60000,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.04,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"pharaohsecrets":[{"zoneID":0,"slotID":"pharaohsecrets","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":26651915629.801437,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsecrets","jackpotSubID":2,"jackpotSubKey":"major","jackpot":38912788331.20178,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsecrets","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2055735804.7998266,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pharaohsecrets","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":137023929.20001733,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"phoenixignite":[{"zoneID":0,"slotID":"phoenixignite","jackpotSubID":2,"jackpotSubKey":"grand","jackpot":20715811548,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"phoenixignite","jackpotSubID":1,"jackpotSubKey":"mega","jackpot":0,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"phoenixignite","jackpotSubID":0,"jackpotSubKey":"major","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"phoenixignite_dy":[{"zoneID":0,"slotID":"phoenixignite_dy","jackpotSubID":2,"jackpotSubKey":"grand","jackpot":0,"basePrize":80000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"phoenixignite_dy","jackpotSubID":1,"jackpotSubKey":"mega","jackpot":0,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"phoenixignite_dy","jackpotSubID":0,"jackpotSubKey":"major","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggybankriches":[{"zoneID":0,"slotID":"piggybankriches","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":915582409176,"basePrize":300000,"basePrizeType":"BetPerLine","maxBasePrize":720000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggybankriches","jackpotSubID":2,"jackpotSubKey":"major","jackpot":16990459700,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggybankriches","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggybankriches","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggybankriches_dy":[{"zoneID":0,"slotID":"piggybankriches_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6918714,"basePrize":300000,"basePrizeType":"BetPerLine","maxBasePrize":720000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggybankriches_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":13084764,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggybankriches_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggybankriches_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggyhouses":[{"zoneID":0,"slotID":"piggyhouses","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":10714361229.199848,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggyhouses","jackpotSubID":2,"jackpotSubKey":"major","jackpot":302379707.7999721,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggyhouses","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggyhouses","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggymania":[{"zoneID":0,"slotID":"piggymania","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":29878978406.800674,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":9563448560.399841,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0007,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania","jackpotSubID":3,"jackpotSubKey":"major","jackpot":868786134.5998803,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0018,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":171828021.1999828,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":37401233.79999607,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0054,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":18267820.79999956,"basePrize":30,"basePrizeType":"BetPerLine","maxBasePrize":360000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0072,"linked":false,"linkedKey":""}],"piggymania_dy":[{"zoneID":0,"slotID":"piggymania_dy","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":0,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania_dy","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":0,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0007,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania_dy","jackpotSubID":3,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0018,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania_dy","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania_dy","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0054,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piggymania_dy","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":60,"basePrizeType":"BetPerLine","maxBasePrize":720000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0072,"linked":false,"linkedKey":""}],"pinataparade":[{"zoneID":0,"slotID":"pinataparade","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":59366760610,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinataparade","jackpotSubID":2,"jackpotSubKey":"major","jackpot":49751328162,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinataparade","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":5747228788,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"pinkstardiamonds":[{"zoneID":0,"slotID":"pinkstardiamonds","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":148230917601,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinkstardiamonds","jackpotSubID":2,"jackpotSubKey":"major","jackpot":181501992,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinkstardiamonds","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":492570905,"basePrize":70,"basePrizeType":"BetPerLine","maxBasePrize":8400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinkstardiamonds","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"pinupparadise":[{"zoneID":0,"slotID":"pinupparadise","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":964373714,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinupparadise","jackpotSubID":2,"jackpotSubKey":"major","jackpot":481094567,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinupparadise","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":88209947,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pinupparadise","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":54437684,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"piratebootyrapidhit":[{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":8,"jackpotSubKey":"30Jackpot","jackpot":86702514882,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":7,"jackpotSubKey":"24Jackpot","jackpot":54239359708,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":6,"jackpotSubKey":"21Jackpot","jackpot":2954962429,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":5,"jackpotSubKey":"18Jackpot","jackpot":608064730,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":4,"jackpotSubKey":"15Jackpot","jackpot":293495814,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":3,"jackpotSubKey":"12Jackpot","jackpot":98901334,"basePrize":80,"basePrizeType":"BetPerLine","maxBasePrize":1920000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":2,"jackpotSubKey":"10Jackpot","jackpot":68456891,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":1,"jackpotSubKey":"08Jackpot","jackpot":19825212,"basePrize":35,"basePrizeType":"BetPerLine","maxBasePrize":840000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"piratebootyrapidhit","jackpotSubID":0,"jackpotSubKey":"06Jackpot","jackpot":5471863,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"poseidonwildwaves":[{"zoneID":0,"slotID":"poseidonwildwaves","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":6769057772,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"poseidonwildwaves","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1096845111,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"poseidonwildwaves","jackpotSubID":2,"jackpotSubKey":"major","jackpot":41726152,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"poseidonwildwaves","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":10088596,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"poseidonwildwaves","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":8377934,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""}],"pumpkinfortune":[{"zoneID":0,"slotID":"pumpkinfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":18743425087.201366,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pumpkinfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":8549576295.799099,"basePrize":1875,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pumpkinfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":72056341.19998902,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"pumpkinfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":240461200.8000176,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"raccoonshowdown":[{"zoneID":0,"slotID":"raccoonshowdown","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6161736461,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"raccoonshowdown","jackpotSubID":2,"jackpotSubKey":"major","jackpot":26053889733.80044,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0037,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"raccoonshowdown","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1669416740.3999343,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0076,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"raccoonshowdown","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":271983257.5999843,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0079,"linked":false,"linkedKey":""}],"railroadraiders":[{"zoneID":0,"slotID":"railroadraiders","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":6514619257,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"railroadraiders","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"railroadraiders","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"railroadraiders","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"railroadraiders","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"rainbowpearl":[{"zoneID":0,"slotID":"rainbowpearl","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1634716385,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""}],"rainbowpearl_dy":[{"zoneID":0,"slotID":"rainbowpearl_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.03,"linked":false,"linkedKey":""}],"rapidhitantarctic":[{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":11,"jackpotSubKey":"grand","jackpot":10050646972,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":10,"jackpotSubKey":"mega","jackpot":3008562607,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":9,"jackpotSubKey":"major","jackpot":785927370,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":8,"jackpotSubKey":"minor","jackpot":130145306,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":7,"jackpotSubKey":"mini","jackpot":26711651,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":7200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":6,"jackpotSubKey":"10RapodHitJackpot","jackpot":0,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":5,"jackpotSubKey":"9RapodHitJackpot","jackpot":0,"basePrize":450,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":4,"jackpotSubKey":"8RapodHitJackpot","jackpot":0,"basePrize":270,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":3,"jackpotSubKey":"7RapodHitJackpot","jackpot":0,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":720000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":2,"jackpotSubKey":"6RapodHitJackpot","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":360000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":1,"jackpotSubKey":"5RapodHitJackpot","jackpot":0,"basePrize":60,"basePrizeType":"BetPerLine","maxBasePrize":240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rapidhitantarctic","jackpotSubID":0,"jackpotSubKey":"4RapodHitJackpot","jackpot":0,"basePrize":30,"basePrizeType":"BetPerLine","maxBasePrize":120000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"rhinoblitz":[{"zoneID":0,"slotID":"rhinoblitz","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":16280499431.834686,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rhinoblitz","jackpotSubID":2,"jackpotSubKey":"major","jackpot":3330391396.395028,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0011,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rhinoblitz","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1666916242.6351974,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":2880000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"rhinoblitz","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":586514413.6349143,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":1440000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"robinhoodsecondshot":[{"zoneID":0,"slotID":"robinhoodsecondshot","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":425060528.7999871,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":40000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"robinhoodsecondshot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":909881861.6000086,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":8000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0011,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"robinhoodsecondshot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":108735943,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"robinhoodsecondshot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":243690418.80000558,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0023,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"robinhoodsecondshot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":44305735.7999982,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"rockingbell":[{"zoneID":0,"slotID":"rockingbell","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":17390861552.75,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"rollthedice":[{"zoneID":0,"slotID":"rollthedice","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":415487279797,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"rudolphexpress":[{"zoneID":0,"slotID":"rudolphexpress","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":95415914438,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"sakuraninja":[{"zoneID":0,"slotID":"sakuraninja","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":4972811826,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"sakuraninja","jackpotSubID":2,"jackpotSubKey":"major","jackpot":103061156,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"sakuraninja","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":70563464,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"sakuraninja","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":32799704,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""}],"sevenglory":[{"zoneID":0,"slotID":"sevenglory","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":1343109096.799945,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"sevenglory","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2512628248.200043,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":21600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"sevenglory","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1408048522.200044,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":21600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"sevenglory","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2449238408.4001026,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"sevenglory","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1883810930.4001021,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"shamrocklock":[{"zoneID":0,"slotID":"shamrocklock","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":31689918862,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shamrocklock","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":3511049246,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shamrocklock","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1391372307,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shamrocklock","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":328020489,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shamrocklock","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":102296741,"basePrize":40,"basePrizeType":"BetPerLine","maxBasePrize":960000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"shanghaiexpress":[{"zoneID":0,"slotID":"shanghaiexpress","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1231060931,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shanghaiexpress","jackpotSubID":2,"jackpotSubKey":"major","jackpot":920252708,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shanghaiexpress","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":77602915,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shanghaiexpress","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":40104798,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""}],"shanghaifullmoon":[{"zoneID":0,"slotID":"shanghaifullmoon","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":252214012079,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":86400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shanghaifullmoon","jackpotSubID":2,"jackpotSubKey":"major","jackpot":39222922918,"basePrize":720,"basePrizeType":"BetPerLine","maxBasePrize":8640000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shanghaifullmoon","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":2160000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shanghaifullmoon","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"shopaholic":[{"zoneID":0,"slotID":"shopaholic","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2704542940.59977,"basePrize":6250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shopaholic","jackpotSubID":2,"jackpotSubKey":"major","jackpot":10090199967.399652,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shopaholic","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":338373568.5999769,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"shopaholic","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":228168355.400017,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"smashncash":[{"zoneID":0,"slotID":"smashncash","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":27030101875,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"starryholidays":[{"zoneID":0,"slotID":"starryholidays","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":34347590438,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"starryholidays","jackpotSubID":2,"jackpotSubKey":"major","jackpot":53054367766,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"starryholidays","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":458606980,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"starryholidays","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":336384088,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":360000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"super25deluxe":[{"zoneID":0,"slotID":"super25deluxe","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":699215873,"basePrize":980,"basePrizeType":"BetPerLine","maxBasePrize":11760000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"super25deluxe_dy":[{"zoneID":0,"slotID":"super25deluxe_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"superdrumbash":[{"zoneID":0,"slotID":"superdrumbash","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":16979085655,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"superdrumbash","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":33599406503,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"superdrumbash","jackpotSubID":2,"jackpotSubKey":"major","jackpot":6877055787,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"superdrumbash","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":8456442067,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"superdrumbash","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2493351548,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"supernovablasts":[{"zoneID":0,"slotID":"supernovablasts","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":20439930644,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":480000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supernovablasts","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":12465569294,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supernovablasts","jackpotSubID":2,"jackpotSubKey":"major","jackpot":7934251311,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":9600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supernovablasts","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":367874040,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supernovablasts","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":24713245,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"supersevenblasts":[{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":8,"jackpotSubKey":"36Jackpot","jackpot":1393124478,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":7,"jackpotSubKey":"30Jackpot","jackpot":2463774455,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":6,"jackpotSubKey":"25Jackpot","jackpot":466183981,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":5,"jackpotSubKey":"21Jackpot","jackpot":189729629,"basePrize":700,"basePrizeType":"BetPerLine","maxBasePrize":8400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":4,"jackpotSubKey":"18Jackpot","jackpot":122725552,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":3,"jackpotSubKey":"15Jackpot","jackpot":58506468,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":2,"jackpotSubKey":"12Jackpot","jackpot":29910949,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":1,"jackpotSubKey":"09Jackpot","jackpot":20000492,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"supersevenblasts","jackpotSubID":0,"jackpotSubKey":"06Jackpot","jackpot":3075603,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"talesofarcadia":[{"zoneID":0,"slotID":"talesofarcadia","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":10605915894,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"talesofarcadia","jackpotSubID":4,"jackpotSubKey":"super","jackpot":4403581728,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"talesofarcadia","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":140665316,"basePrize":625,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"talesofarcadia","jackpotSubID":2,"jackpotSubKey":"major","jackpot":97563707,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"talesofarcadia","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":35215096,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"talesofarcadia","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":41218368,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""}],"templeofathena":[{"zoneID":0,"slotID":"templeofathena","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":287855109643,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"thanksgivinggalore":[{"zoneID":0,"slotID":"thanksgivinggalore","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5271458624.399994,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thanksgivinggalore","jackpotSubID":2,"jackpotSubKey":"major","jackpot":4717120885.599937,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thanksgivinggalore","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":312262748,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"thearcanealchemist":[{"zoneID":0,"slotID":"thearcanealchemist","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":4345657328,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":108000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thearcanealchemist","jackpotSubID":2,"jackpotSubKey":"major","jackpot":884397403,"basePrize":225,"basePrizeType":"BetPerLine","maxBasePrize":5400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thearcanealchemist","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":384205176,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thearcanealchemist","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":115291958,"basePrize":45,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"thebeastssecret":[{"zoneID":0,"slotID":"thebeastssecret","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1436690853,"basePrize":19200,"basePrizeType":"BetPerLine","maxBasePrize":23040000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thebeastssecret","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1135856279,"basePrize":4800,"basePrizeType":"BetPerLine","maxBasePrize":5760000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thebeastssecret","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":289259329,"basePrize":2400,"basePrizeType":"BetPerLine","maxBasePrize":2880000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thebeastssecret","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":419227738,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":1440000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"thehogmancer":[{"zoneID":0,"slotID":"thehogmancer","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":3266695739,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thehogmancer","jackpotSubID":2,"jackpotSubKey":"major","jackpot":83518430,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thehogmancer","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":15543609,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thehogmancer","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":9659153,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"themobking":[{"zoneID":0,"slotID":"themobking","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":29756456805,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"themobking","jackpotSubID":2,"jackpotSubKey":"major","jackpot":35180613315,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"themobking","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2702422990,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"theoddranch":[{"zoneID":0,"slotID":"theoddranch","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":17510737991,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"theoddranch","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"theoddranch","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"theoddranch","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"theoztales":[{"zoneID":0,"slotID":"theoztales","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":6503728142,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"theoztales","jackpotSubID":2,"jackpotSubKey":"major","jackpot":623018352,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"theoztales","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":183717848,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"theoztales","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":92757143.99999803,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"thunderstrike":[{"zoneID":0,"slotID":"thunderstrike","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":15009323944.329948,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thunderstrike","jackpotSubID":2,"jackpotSubKey":"major","jackpot":31948000458.644386,"basePrize":1875,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thunderstrike","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":323249150.9299951,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"thunderstrike","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":347360928.5948993,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"toadallyrich":[{"zoneID":0,"slotID":"toadallyrich","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":19366847495,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"toadallyrich","jackpotSubID":2,"jackpotSubKey":"major","jackpot":883644937,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"toadallyrich","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":296642476,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"toadallyrich","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":111275317,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"triplewheelsupreme":[{"zoneID":0,"slotID":"triplewheelsupreme","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":10908554677,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"triplewheelsupreme","jackpotSubID":2,"jackpotSubKey":"major","jackpot":9076136701,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"triplewheelsupreme","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":386952763,"basePrize":160,"basePrizeType":"BetPerLine","maxBasePrize":4800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"triplewheelsupreme","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":340044961,"basePrize":80,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"twilightdragon":[{"zoneID":0,"slotID":"twilightdragon","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1281763760,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"twilightdragon","jackpotSubID":2,"jackpotSubKey":"major","jackpot":596112570,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"twilightdragon","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":43214428,"basePrize":40,"basePrizeType":"BetPerLine","maxBasePrize":960000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"twilightdragon","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":44492963,"basePrize":20,"basePrizeType":"BetPerLine","maxBasePrize":480000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"vampressmansion":[{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":9,"jackpotSubKey":"royalGrand","jackpot":0,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":10800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":8,"jackpotSubKey":"royalMega","jackpot":0,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":5400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":7,"jackpotSubKey":"royalMajor","jackpot":0,"basePrize":3600,"basePrizeType":"BetPerLine","maxBasePrize":4320000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":6,"jackpotSubKey":"royalMinor","jackpot":0,"basePrize":2700,"basePrizeType":"BetPerLine","maxBasePrize":3240000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":5,"jackpotSubKey":"royalMini","jackpot":0,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":2160000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":5400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":2700000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":2160000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1350,"basePrizeType":"BetPerLine","maxBasePrize":1620000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vampressmansion","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":1080000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"vikingsaga":[{"zoneID":0,"slotID":"vikingsaga","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":210648959,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vikingsaga","jackpotSubID":2,"jackpotSubKey":"major","jackpot":93223568,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vikingsaga","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":106373447,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vikingsaga","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":68312913,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"vivalasvegas":[{"zoneID":0,"slotID":"vivalasvegas","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":37352988954,"basePrize":12000,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vivalasvegas","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":17366669628,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vivalasvegas","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vivalasvegas","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"vivalasvegas","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"volcanictahiti":[{"zoneID":0,"slotID":"volcanictahiti","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"volcanictahiti","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":450,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"volcanictahiti","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"volcanictahiti","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"volcanictahiti","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":360000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"wickedlildevil":[{"zoneID":0,"slotID":"wickedlildevil","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":2588742101,"basePrize":200000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wickedlildevil","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":311780967,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wickedlildevil","jackpotSubID":2,"jackpotSubKey":"major","jackpot":231492461,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wickedlildevil","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":101111225,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wickedlildevil","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":53621864,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"wildbunch":[{"zoneID":0,"slotID":"wildbunch","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":257277178050,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"wildhearts":[{"zoneID":0,"slotID":"wildhearts","jackpotSubID":9,"jackpotSubKey":"9jackpot","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":8,"jackpotSubKey":"8jackpot","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":14400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":7,"jackpotSubKey":"7jackpot","jackpot":0,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":6,"jackpotSubKey":"6jackpot","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":5,"jackpotSubKey":"5jackpot","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":4,"jackpotSubKey":"4jackpot","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":20511573267,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":2,"jackpotSubKey":"major","jackpot":3578755452,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1350772416,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":25646521,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"wildhearts_dy":[{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":9,"jackpotSubKey":"9jackpot","jackpot":0,"basePrize":3750,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":8,"jackpotSubKey":"8jackpot","jackpot":0,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":21600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":7,"jackpotSubKey":"7jackpot","jackpot":0,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":6,"jackpotSubKey":"6jackpot","jackpot":0,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":3600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":5,"jackpotSubKey":"5jackpot","jackpot":0,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":1800000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":4,"jackpotSubKey":"4jackpot","jackpot":0,"basePrize":37,"basePrizeType":"BetPerLine","maxBasePrize":888000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"wildhearts_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"winningrolls":[{"zoneID":0,"slotID":"winningrolls","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":204499216885,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"winyourheart":[{"zoneID":0,"slotID":"winyourheart","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":3026441478,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":96000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"winyourheart","jackpotSubID":2,"jackpotSubKey":"major","jackpot":2862217379,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"winyourheart","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":294273199,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"winyourheart","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":105850410,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":960000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"witchpumpkins":[{"zoneID":0,"slotID":"witchpumpkins","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":3616141002,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchpumpkins","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1078170250,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchpumpkins","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":78684862.99999137,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchpumpkins","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":70374413,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"witchpumpkins_dy":[{"zoneID":0,"slotID":"witchpumpkins_dy","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":75000,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchpumpkins_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchpumpkins_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchpumpkins_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":600000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"witchsapples":[{"zoneID":0,"slotID":"witchsapples","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":19976341093,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchsapples","jackpotSubID":2,"jackpotSubKey":"major","jackpot":2280797156,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchsapples","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"witchsapples","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"zeusrampage":[{"zoneID":0,"slotID":"zeusrampage","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":190526658,"basePrize":120000,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zeusrampage","jackpotSubID":2,"jackpotSubKey":"major","jackpot":266294895,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zeusrampage","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":213152914,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zeusrampage","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":72744207.99999994,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"zeusthundershower":[{"zoneID":0,"slotID":"zeusthundershower","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":10034914936,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zeusthundershower","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1761685752,"basePrize":7500,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zeusthundershower","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":711069335,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zeusthundershower","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":416756592,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"zhuquefortune":[{"zoneID":0,"slotID":"zhuquefortune","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":8385235417,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zhuquefortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":7081811239,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zhuquefortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":5943146142,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zhuquefortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zhuquefortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"zippyjackpots":[{"zoneID":0,"slotID":"zippyjackpots","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":53770450447,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zippyjackpots","jackpotSubID":2,"jackpotSubKey":"major","jackpot":10514994571,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zippyjackpots","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1164338481,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":2400000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":0,"slotID":"zippyjackpots","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":214106955,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":1200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}]},"1":{"4thofjulywildrespin":[{"zoneID":1,"slotID":"4thofjulywildrespin","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":20733150017,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"4thofjulywildrespin","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":63308403564,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"4thofjulywildrespin","jackpotSubID":3,"jackpotSubKey":"major","jackpot":31622624416,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"4thofjulywildrespin","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":22379711525,"basePrize":875,"basePrizeType":"BetPerLine","maxBasePrize":105000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"4thofjulywildrespin","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":5199958320,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"4thofjulywildrespin","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"abracadabra":[{"zoneID":1,"slotID":"abracadabra","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":265650990221,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":2160000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"alienamigos":[{"zoneID":1,"slotID":"alienamigos","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":860738712378,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alienamigos","jackpotSubID":2,"jackpotSubKey":"major","jackpot":821044743689,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alienamigos","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alienamigos","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"allamerican":[{"zoneID":1,"slotID":"allamerican","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":567925242423,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"allamerican","jackpotSubID":2,"jackpotSubKey":"major","jackpot":198666799540,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"allamerican","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"allamerican","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"allstarcircus":[{"zoneID":1,"slotID":"allstarcircus","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":21768030490,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"allstarcircus","jackpotSubID":2,"jackpotSubKey":"major","jackpot":9179270344,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"allstarcircus","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":9256864704,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"allstarcircus","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":7388605050,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"alohahawaii":[{"zoneID":1,"slotID":"alohahawaii","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":3062025344420,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":180003919519,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii","jackpotSubID":2,"jackpotSubKey":"major","jackpot":228530285670,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"alohahawaii_dy":[{"zoneID":1,"slotID":"alohahawaii_dy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":3006967798360,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":446860370661,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":360000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":276562856294,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"alohahawaii_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"american9eagles":[{"zoneID":1,"slotID":"american9eagles","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":681070166568,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"american9eagles","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":268838770085,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"american9eagles","jackpotSubID":2,"jackpotSubKey":"major","jackpot":46241222372,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"american9eagles","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":21134039879,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"american9eagles","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":9594246817,"basePrize":320,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.045,"linked":false,"linkedKey":""}],"americanvalor":[{"zoneID":1,"slotID":"americanvalor","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":123095907998,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"apocalypselasthope":[{"zoneID":1,"slotID":"apocalypselasthope","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":4437094965,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"apocalypselasthope","jackpotSubID":2,"jackpotSubKey":"major","jackpot":6578902438,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"apocalypselasthope","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1786565918.9999988,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"apocalypselasthope","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":720896993,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"aztecodyssey":[{"zoneID":1,"slotID":"aztecodyssey","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":56228207486,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"aztecodyssey","jackpotSubID":2,"jackpotSubKey":"major","jackpot":19007490407,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"aztecodyssey","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"aztecodyssey","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":80,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"babysantawild":[{"zoneID":1,"slotID":"babysantawild","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":163715394961,"basePrize":980,"basePrizeType":"BetPerLine","maxBasePrize":2940000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"babysantawild","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":878073967388,"basePrize":484,"basePrizeType":"BetPerLine","maxBasePrize":1452000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"babysantawild","jackpotSubID":2,"jackpotSubKey":"major","jackpot":91352220565,"basePrize":188,"basePrizeType":"BetPerLine","maxBasePrize":564000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"bankofwealth":[{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":9,"jackpotSubKey":"grand","jackpot":652974047283,"basePrize":45000,"basePrizeType":"BetPerLine","maxBasePrize":1350000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":8,"jackpotSubKey":"mega","jackpot":36914785802,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":7,"jackpotSubKey":"major","jackpot":10761608140,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":135000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":6,"jackpotSubKey":"minor","jackpot":1521763770,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":67500000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":5,"jackpotSubKey":"mini","jackpot":367196871,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":0,"jackpotSubKey":"classic1","jackpot":10687667437,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":1,"jackpotSubKey":"classic2","jackpot":35697326746,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":135000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":2,"jackpotSubKey":"classic3","jackpot":278424489768,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":3,"jackpotSubKey":"classic4","jackpot":190166971173,"basePrize":45000,"basePrizeType":"BetPerLine","maxBasePrize":1350000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bankofwealth","jackpotSubID":4,"jackpotSubKey":"classic5","jackpot":329626673705,"basePrize":90000,"basePrizeType":"BetPerLine","maxBasePrize":2700000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"beelovedjars":[{"zoneID":1,"slotID":"beelovedjars","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":10132112104,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"beelovedjars","jackpotSubID":2,"jackpotSubKey":"major","jackpot":19017487095,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"beelovedjars","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":13659169611,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"beelovedjars","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":3313396626,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"bellstrikefrenzy":[{"zoneID":1,"slotID":"bellstrikefrenzy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":6605425572839,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"bigbucksbounty":[{"zoneID":1,"slotID":"bigbucksbounty","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":156124928366,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bigbucksbounty","jackpotSubID":2,"jackpotSubKey":"major","jackpot":15904767953,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bigbucksbounty","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":5234356533,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bigbucksbounty","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":37995568,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"bingotrio":[{"zoneID":1,"slotID":"bingotrio","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":1726682394953,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bingotrio","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":66099778250,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bingotrio","jackpotSubID":2,"jackpotSubKey":"major","jackpot":21204171140,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bingotrio","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4420591304,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bingotrio","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1020351018,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""}],"birdjackpot":[{"zoneID":1,"slotID":"birdjackpot","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":1839787333787.4,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":111020052765.4,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":18645284638.8,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":7427878697.2,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1576262431.2,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""}],"birdjackpot_dy":[{"zoneID":1,"slotID":"birdjackpot_dy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":647403870553,"basePrize":96000,"basePrizeType":"BetPerLine","maxBasePrize":7200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":99937298200,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":20487810071,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4940059714,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"birdjackpot_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1288881736,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.008,"linked":false,"linkedKey":""}],"blackwhitetiger":[{"zoneID":1,"slotID":"blackwhitetiger","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":50002750558,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"blackwhitetiger","jackpotSubID":2,"jackpotSubKey":"major","jackpot":189038231568,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":225000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"blackwhitetiger","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":23117248619.99998,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"blackwhitetiger","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1147759277,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"blazingbullwild":[{"zoneID":1,"slotID":"blazingbullwild","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":492274382393,"basePrize":32000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"blazingbullwild","jackpotSubID":3,"jackpotSubKey":"major","jackpot":394287082115,"basePrize":6400,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"blazingbullwild","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":971852256,"basePrize":1600,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"blazingbullwild","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":25424993058,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"blazingbullwild","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":160,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"bloodgems":[{"zoneID":1,"slotID":"bloodgems","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":91455642922,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bloodgems","jackpotSubID":2,"jackpotSubKey":"major","jackpot":165076097885,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bloodgems","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":58864403498,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"bloodgems","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":122440256031,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"bonanzaexpress":[{"zoneID":1,"slotID":"bonanzaexpress","jackpotSubID":0,"jackpotSubKey":"grand","jackpot":1028112181941,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"boonanza":[{"zoneID":1,"slotID":"boonanza","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":397282440720,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"boonanza","jackpotSubID":2,"jackpotSubKey":"major","jackpot":7095290549,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"boonanza","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4951409322,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"boonanza","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2354045876,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"bunnybank":[{"zoneID":1,"slotID":"bunnybank","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":24432535412,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"bunnybank_dy":[{"zoneID":1,"slotID":"bunnybank_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":47439381926,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"candycastle":[{"zoneID":1,"slotID":"candycastle","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":9781609781,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"candycastle","jackpotSubID":2,"jackpotSubKey":"major","jackpot":10061925046,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"candycastle","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3200547882,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":80000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"candycastle","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":8323504726,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"captainblackpurr":[{"zoneID":1,"slotID":"captainblackpurr","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":230226855849,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"captainblackpurr","jackpotSubID":2,"jackpotSubKey":"major","jackpot":13827473650,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"captainblackpurr","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":204354502846,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"captainblackpurr","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":21078301347,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"carnivalinrio":[{"zoneID":1,"slotID":"carnivalinrio","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":109769252821,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"cashshowdown":[{"zoneID":1,"slotID":"cashshowdown","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":29819517600,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"cashshowdown","jackpotSubID":1,"jackpotSubKey":"major","jackpot":14089793827,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"cashshowdowndeluxe":[{"zoneID":1,"slotID":"cashshowdowndeluxe","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":1050,"basePrizeType":"BetPerLine","maxBasePrize":3150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"casinoroyale":[{"zoneID":1,"slotID":"casinoroyale","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":8164029674466,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"casinoroyale","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"casinoroyale","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"casinoroyale","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"casinoroyale_dy":[{"zoneID":1,"slotID":"casinoroyale_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":974221740000,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"casinoroyale_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"casinoroyale_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"casinoroyale_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"chilichilifever":[{"zoneID":1,"slotID":"chilichilifever","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":79454526148,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"chilichilifever","jackpotSubID":2,"jackpotSubKey":"major","jackpot":241870162529,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"chilichilifever","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":32967885.999993794,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"chilichilifever","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":7255235169,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":22500000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"classiclockrollgrand":[{"zoneID":1,"slotID":"classiclockrollgrand","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":4685180427567,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classiclockrollgrand","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classiclockrollgrand","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":216000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classiclockrollgrand","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":3600,"basePrizeType":"BetPerLine","maxBasePrize":108000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"classicstar":[{"zoneID":1,"slotID":"classicstar","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":17745271532,"basePrize":1700,"basePrizeType":"BetPerLine","maxBasePrize":1020000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classicstar","jackpotSubID":2,"jackpotSubKey":"major","jackpot":4504347822,"basePrize":700,"basePrizeType":"BetPerLine","maxBasePrize":420000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classicstar","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3507668331.9999757,"basePrize":450,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classicstar","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":228005609,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0008,"linked":false,"linkedKey":""}],"classicstar_dy":[{"zoneID":1,"slotID":"classicstar_dy","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":16334045985,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classicstar_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":149034360,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classicstar_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":20726492739,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"classicstar_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":907309314,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0008,"linked":false,"linkedKey":""}],"cupidlovespells":[{"zoneID":1,"slotID":"cupidlovespells","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":579520383,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"cupidlovespells","jackpotSubID":1,"jackpotSubKey":"major","jackpot":207920614537,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"cupidlovespells","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":488794712,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"cupidloveydovey":[{"zoneID":1,"slotID":"cupidloveydovey","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":2774001227,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"cupidloveydovey","jackpotSubID":2,"jackpotSubKey":"major","jackpot":13653789572,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"cupidloveydovey","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2688275314,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"cupidloveydovey","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2973207136.999976,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"curiousmermaid":[{"zoneID":1,"slotID":"curiousmermaid","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5218229792573,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":true,"linkedKey":"mysticgypsi_curiousmermaid"},{"zoneID":1,"slotID":"curiousmermaid","jackpotSubID":2,"jackpotSubKey":"major","jackpot":53068112033,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"curiousmermaid","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"curiousmermaid","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"dakotafarmgirl":[{"zoneID":1,"slotID":"dakotafarmgirl","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":6000,"basePrizeType":"BetPerLine","maxBasePrize":360000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dakotafarmgirl","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dakotafarmgirl","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dakotafarmgirl","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dakotafarmgirl","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"davyjonesslocker":[{"zoneID":1,"slotID":"davyjonesslocker","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":77610089438,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"davyjonesslocker","jackpotSubID":2,"jackpotSubKey":"major","jackpot":6637071050,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"davyjonesslocker","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3340122181,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"davyjonesslocker","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1162206351,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"diamondbeamjackpot":[{"zoneID":1,"slotID":"diamondbeamjackpot","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":533150049750,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondbeamjackpot","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":28602992188,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondbeamjackpot","jackpotSubID":3,"jackpotSubKey":"major","jackpot":9057616451,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":450000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondbeamjackpot","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":66091434828,"basePrize":70,"basePrizeType":"BetPerLine","maxBasePrize":210000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondbeamjackpot","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":0,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondbeamjackpot","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"diamondstrike":[{"zoneID":1,"slotID":"diamondstrike","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":5236026132203,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondstrike","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":760374405312,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondstrike","jackpotSubID":2,"jackpotSubKey":"major","jackpot":294116923238,"basePrize":1875,"basePrizeType":"BetPerLine","maxBasePrize":225000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondstrike","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":62395852870,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.05,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"diamondstrike","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":31638253873,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.09,"linked":false,"linkedKey":""}],"dingdongjackpots":[{"zoneID":1,"slotID":"dingdongjackpots","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":355940092816,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dingdongjackpots","jackpotSubID":2,"jackpotSubKey":"major","jackpot":703809062002,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dingdongjackpots","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":725028184978,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dingdongjackpots","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":177408282796,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"dragonblast":[{"zoneID":1,"slotID":"dragonblast","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":309877125391,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonblast","jackpotSubID":2,"jackpotSubKey":"major","jackpot":28891327398,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonblast","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":10353340439,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonblast","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1968313651,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"dragonorbs":[{"zoneID":1,"slotID":"dragonorbs","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":104132198191,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonorbs","jackpotSubID":2,"jackpotSubKey":"major","jackpot":21694477181,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonorbs","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":22395525931,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonorbs","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":11784810839,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"dragonsandpearls":[{"zoneID":1,"slotID":"dragonsandpearls","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":91949913912,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonsandpearls","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":21835443912,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonsandpearls","jackpotSubID":2,"jackpotSubKey":"major","jackpot":46119350851,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0037,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonsandpearls","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4147275439,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0076,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragonsandpearls","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":4049758005.000198,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0079,"linked":false,"linkedKey":""}],"dragontales":[{"zoneID":1,"slotID":"dragontales","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5687744833985,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.009,"linked":true,"linkedKey":"dragontales_orientallanterns"},{"zoneID":1,"slotID":"dragontales","jackpotSubID":2,"jackpotSubKey":"major","jackpot":140974255835,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragontales","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":8497274295,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dragontales","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1377107707,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"dreamcitylights":[{"zoneID":1,"slotID":"dreamcitylights","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":10144348608.999994,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dreamcitylights","jackpotSubID":2,"jackpotSubKey":"major","jackpot":22999089939,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dreamcitylights","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3643764786,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""}],"drmadwin":[{"zoneID":1,"slotID":"drmadwin","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"drmadwin","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"drmadwin","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"drmadwin","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"drmadwin","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"dualdiamondsstrike":[{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":8,"jackpotSubKey":"pink9jackpot","jackpot":16359828558,"basePrize":4800,"basePrizeType":"BetPerLine","maxBasePrize":576000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":7,"jackpotSubKey":"pink8jackpot","jackpot":5477074858,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":6,"jackpotSubKey":"pink7jackpot","jackpot":4246051069,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":5,"jackpotSubKey":"pink6jackpot","jackpot":2044846008,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":4,"jackpotSubKey":"blue9jackpot","jackpot":16359828484,"basePrize":4800,"basePrizeType":"BetPerLine","maxBasePrize":576000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":3,"jackpotSubKey":"blue8jackpot","jackpot":5475697126,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":2,"jackpotSubKey":"blue7jackpot","jackpot":4231837308,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualdiamondsstrike","jackpotSubID":1,"jackpotSubKey":"blue6jackpot","jackpot":2045228229,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"dualfortunepot":[{"zoneID":1,"slotID":"dualfortunepot","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":317443164011,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":55878386506,"basePrize":3750,"basePrizeType":"BetPerLine","maxBasePrize":225000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":9916686179,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":8882985477,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0126,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":3704289315,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0129,"linked":false,"linkedKey":""}],"dualfortunepot_dy":[{"zoneID":1,"slotID":"dualfortunepot_dy","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":136297077300,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":42981877406,"basePrize":7500,"basePrizeType":"BetPerLine","maxBasePrize":450000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":13403179216,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":6563504869,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0126,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"dualfortunepot_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":7419644312,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0129,"linked":false,"linkedKey":""}],"eggstraeaster":[{"zoneID":1,"slotID":"eggstraeaster","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2698843252,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"eggstraeaster","jackpotSubID":2,"jackpotSubKey":"major","jackpot":12101484311,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"eggstraeaster","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":27568056991.999996,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"eggstraeaster","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":7607436144,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"emeraldgreen":[{"zoneID":1,"slotID":"emeraldgreen","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":137447432820,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"emeraldgreen","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":38135154859,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"emeraldgreen","jackpotSubID":3,"jackpotSubKey":"major","jackpot":24651333279,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"emeraldgreen","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":3195351330,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"emeraldgreen","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":1982449389,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"emeraldgreen","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":700,"basePrizeType":"BetPerLine","maxBasePrize":21000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"emeraldislegold":[{"zoneID":1,"slotID":"emeraldislegold","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":675583596816,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":450000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"fatturkeywilds":[{"zoneID":1,"slotID":"fatturkeywilds","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":1696416397872,"basePrize":980,"basePrizeType":"BetPerLine","maxBasePrize":2940000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fatturkeywilds","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":421315272023,"basePrize":484,"basePrizeType":"BetPerLine","maxBasePrize":1452000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fatturkeywilds","jackpotSubID":2,"jackpotSubKey":"major","jackpot":170159957810,"basePrize":188,"basePrizeType":"BetPerLine","maxBasePrize":564000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"fireblastclassic":[{"zoneID":1,"slotID":"fireblastclassic","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":45046845098,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fireblastclassic","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":14011850209,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":450000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fireblastclassic","jackpotSubID":3,"jackpotSubKey":"major","jackpot":4254864625,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fireblastclassic","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":1970075087,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fireblastclassic","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":708948696,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fireblastclassic","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":0,"basePrize":5,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"firelockultimate":[{"zoneID":1,"slotID":"firelockultimate","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":3036770322196,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"flamefurywheel":[{"zoneID":1,"slotID":"flamefurywheel","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":56294698448,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"flamefurywheel","jackpotSubID":2,"jackpotSubKey":"major","jackpot":6928539917,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"flamefurywheel","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3232180891.999956,"basePrize":15,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"flamefurywheel","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":519778169,"basePrize":5,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"flameofliberty":[{"zoneID":1,"slotID":"flameofliberty","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":147687183321,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"flameofliberty","jackpotSubID":2,"jackpotSubKey":"major","jackpot":8472142832,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"flameofliberty","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":12555951146,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"flameofliberty","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2378085319,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"fortunepot":[{"zoneID":1,"slotID":"fortunepot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1597851960257.56,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortunepot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":450792371991.64,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortunepot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":35967321959.76,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0126,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortunepot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":17137526349.039999,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0129,"linked":false,"linkedKey":""}],"fortuneshrine":[{"zoneID":1,"slotID":"fortuneshrine","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":101388941639,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortuneshrine","jackpotSubID":2,"jackpotSubKey":"major","jackpot":25500019681,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortuneshrine","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3134535628.9999843,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortuneshrine","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2127731592,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"fortunetree":[{"zoneID":1,"slotID":"fortunetree","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":8125786541100,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortunetree","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":8125786541100,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortunetree","jackpotSubID":2,"jackpotSubKey":"major","jackpot":5911810170972,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortunetree","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":86637923557,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fortunetree","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":24230647046,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.015,"linked":false,"linkedKey":""}],"frozenthronerespin":[{"zoneID":1,"slotID":"frozenthronerespin","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":20076464972,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"fruityblast":[{"zoneID":1,"slotID":"fruityblast","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":3359977222.5,"basePrize":3990,"basePrizeType":"BetPerLine","maxBasePrize":1197000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fruityblast","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":810653715976.5,"basePrize":1670,"basePrizeType":"BetPerLine","maxBasePrize":501000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fruityblast","jackpotSubID":3,"jackpotSubKey":"major","jackpot":1084323209104,"basePrize":790,"basePrizeType":"BetPerLine","maxBasePrize":237000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fruityblast","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":928581100094,"basePrize":270,"basePrizeType":"BetPerLine","maxBasePrize":81000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fruityblast","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":308987183938,"basePrize":110,"basePrizeType":"BetPerLine","maxBasePrize":33000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fruityblast","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":118349291616,"basePrize":40,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"fruityjewels":[{"zoneID":1,"slotID":"fruityjewels","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":252546992384,"basePrize":14400,"basePrizeType":"BetPerLine","maxBasePrize":1080000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"fruityjewels","jackpotSubID":2,"jackpotSubKey":"major","jackpot":600850869660,"basePrize":14400,"basePrizeType":"BetPerLine","maxBasePrize":1080000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"gempackedwilds":[{"zoneID":1,"slotID":"gempackedwilds","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":168156189011,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"gempackedwilds","jackpotSubID":2,"jackpotSubKey":"major","jackpot":370990987848,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"gempackedwilds","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":90214209913,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"gempackedwilds","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":112230585244,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"gempackedwilds_dy":[{"zoneID":1,"slotID":"gempackedwilds_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":78375775840,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"gempackedwilds_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":366020362716,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"gempackedwilds_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":60738747698,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":108000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"gempackedwilds_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":45442589820,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"golden100xdollar":[{"zoneID":1,"slotID":"golden100xdollar","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6632557864571,"basePrize":6000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"goldenbuffalofever":[{"zoneID":1,"slotID":"goldenbuffalofever","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":392789125638,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":2000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"goldenbuffalofever","jackpotSubID":2,"jackpotSubKey":"major","jackpot":182897206681,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":250000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""}],"goldencrown":[{"zoneID":1,"slotID":"goldencrown","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":823174148011,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"goldeneagleking":[{"zoneID":1,"slotID":"goldeneagleking","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":516447080069,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":375000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"goldeneagleking","jackpotSubID":2,"jackpotSubKey":"major","jackpot":242434241816,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"goldeneagleking","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2814696928.999967,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":22500000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"goldeneagleking","jackpotSubID":0,"jackpotSubKey":"eagletrigger","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"goldenmoonfortune":[{"zoneID":1,"slotID":"goldenmoonfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":56127169157.5,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":2700000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"goldenmoonfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":23274161904.5,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"goldenmoonfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3000914846.5,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"goldenmoonfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":4211016480.5,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"greatamerica":[{"zoneID":1,"slotID":"greatamerica","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":566362709852,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":540000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"greatamerica","jackpotSubID":1,"jackpotSubKey":"major","jackpot":145303512422,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"greatamerica","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":247738706131,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":135000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"highrisejackpot":[{"zoneID":1,"slotID":"highrisejackpot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":3483214552,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"highrisejackpot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":12115670736,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"highrisejackpot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":11460091042,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"highrisejackpot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":7917068378,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"hoardinggoblins":[{"zoneID":1,"slotID":"hoardinggoblins","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":7495573087,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"hoardinggoblins","jackpotSubID":2,"jackpotSubKey":"major","jackpot":15278247877,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"hoardinggoblins","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":8498675809,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"hoardinggoblins","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":30416092442.99992,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"honeybeeparade":[{"zoneID":1,"slotID":"honeybeeparade","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":34798941258,"basePrize":6250,"basePrizeType":"BetPerLine","maxBasePrize":375000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"honeybeeparade","jackpotSubID":2,"jackpotSubKey":"major","jackpot":97152213956,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"honeybeeparade","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":13669911629,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"honeybeeparade","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":6221995802,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"houndofhades":[{"zoneID":1,"slotID":"houndofhades","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":773461251081,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"houndofhades","jackpotSubID":2,"jackpotSubKey":"major","jackpot":306068267175,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"houndofhades","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":18204493509,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"houndofhades","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":5327013348,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"huffndoze":[{"zoneID":1,"slotID":"huffndoze","jackpotSubID":5,"jackpotSubKey":"mega","jackpot":394161026190,"basePrize":200000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"huffndoze","jackpotSubID":4,"jackpotSubKey":"major","jackpot":15699903286,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"huffndoze","jackpotSubID":3,"jackpotSubKey":"minor2","jackpot":0,"basePrize":6000,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"huffndoze","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":0,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"huffndoze","jackpotSubID":1,"jackpotSubKey":"mini2","jackpot":0,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"huffndoze","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"imperialgoldfortune":[{"zoneID":1,"slotID":"imperialgoldfortune","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":1328635368232,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"imperialgoldfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1294244344601,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"imperialgoldfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":388132382333,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"imperialgoldfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"imperialgoldfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"jacksmagicbeans":[{"zoneID":1,"slotID":"jacksmagicbeans","jackpotSubID":0,"jackpotSubKey":"freespin_feature","jackpot":0,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"jiujiujiu999":[{"zoneID":1,"slotID":"jiujiujiu999","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":560199797601,"basePrize":32000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jiujiujiu999","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1109248808158,"basePrize":12000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jiujiujiu999","jackpotSubID":2,"jackpotSubKey":"major","jackpot":626021843642,"basePrize":2800,"basePrizeType":"BetPerLine","maxBasePrize":210000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jiujiujiu999","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":21834680971,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jiujiujiu999","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"jollyrogerjackpot":[{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":10,"jackpotSubKey":"15jackpot","jackpot":348167225,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":9,"jackpotSubKey":"14jackpot","jackpot":1946557457,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":8,"jackpotSubKey":"13jackpot","jackpot":4136808461,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":480000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":7,"jackpotSubKey":"12jackpot","jackpot":3866350566,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":6,"jackpotSubKey":"11jackpot","jackpot":4325645462,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":5,"jackpotSubKey":"10jackpot","jackpot":3788705052,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":4,"jackpotSubKey":"9jackpot","jackpot":1174131274,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":3,"jackpotSubKey":"8jackpot","jackpot":27362296,"basePrize":65,"basePrizeType":"BetPerLine","maxBasePrize":39000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":2,"jackpotSubKey":"7jackpot","jackpot":211911471,"basePrize":45,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":1,"jackpotSubKey":"6jackpot","jackpot":1610908156,"basePrize":35,"basePrizeType":"BetPerLine","maxBasePrize":21000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jollyrogerjackpot","jackpotSubID":0,"jackpotSubKey":"5jackpot","jackpot":40672765591,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"jumbopiggies":[{"zoneID":1,"slotID":"jumbopiggies","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":319594449220,"basePrize":500000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jumbopiggies","jackpotSubID":2,"jackpotSubKey":"major","jackpot":32546638311,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jumbopiggies","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":30475001917,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jumbopiggies","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":12652649246,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"jurassicwildstomps":[{"zoneID":1,"slotID":"jurassicwildstomps","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jurassicwildstomps","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jurassicwildstomps","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":37500000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"jurassicwildstomps","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"kongfury":[{"zoneID":1,"slotID":"kongfury","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":26657484003,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"kongfury","jackpotSubID":2,"jackpotSubKey":"major","jackpot":44346955579,"basePrize":8000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"kongfury","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":813669493,"basePrize":1600,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"kongfury","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":10019788488,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"kongsmash":[{"zoneID":1,"slotID":"kongsmash","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":170315330615,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"kongsmash","jackpotSubID":2,"jackpotSubKey":"major","jackpot":42129395573,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"kongsmash","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":93537018400,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"kongsmash","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":41746059076.99996,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"ladylibertyrespins":[{"zoneID":1,"slotID":"ladylibertyrespins","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":36498022988,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"ladylibertyrespins","jackpotSubID":2,"jackpotSubKey":"major","jackpot":84161691610,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"ladylibertyrespins","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":24925062952,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"ladylibertyrespins","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":12981144254,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"libertyeaglefortune":[{"zoneID":1,"slotID":"libertyeaglefortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":354579055537,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":3750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"libertyeaglefortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":358625055338,"basePrize":2700,"basePrizeType":"BetPerLine","maxBasePrize":810000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"libertyeaglefortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":639140305975,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"libertyeaglefortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":113009925908,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"locknrollfiver":[{"zoneID":1,"slotID":"locknrollfiver","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"locknrollfiver","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"locknrollfiver","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"locknrollfiver","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"lollylandgummyking":[{"zoneID":1,"slotID":"lollylandgummyking","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":11304615831.999994,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"lollylandgummyking","jackpotSubID":2,"jackpotSubKey":"major","jackpot":32196235064,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0019,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"lollylandgummyking","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":13055880203,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"lollylandgummyking","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2070373601,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""}],"luckyamericanroll":[{"zoneID":1,"slotID":"luckyamericanroll","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":2426593324445,"basePrize":4050,"basePrizeType":"BetPerLine","maxBasePrize":1215000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"luckybunnydrop":[{"zoneID":1,"slotID":"luckybunnydrop","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"luckybunnydrop","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"luckybunnydrop","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"luckybunnydrop","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"luckybunnydrop","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"magmaficent":[{"zoneID":1,"slotID":"magmaficent","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":83178757337,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"magmaficent","jackpotSubID":2,"jackpotSubKey":"major","jackpot":76044803949,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"magmaficent","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":92855643685,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"magmaficent","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":7807796697.999978,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"makeitrain":[{"zoneID":1,"slotID":"makeitrain","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":320913970150,"basePrize":1950,"basePrizeType":"BetPerLine","maxBasePrize":1170000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"marineadventure":[{"zoneID":1,"slotID":"marineadventure","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":1327871465311,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":2160000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"marineadventure","jackpotSubID":2,"jackpotSubKey":"mega","jackpot":0,"basePrize":720,"basePrizeType":"BetPerLine","maxBasePrize":216000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"marineadventure","jackpotSubID":1,"jackpotSubKey":"major","jackpot":0,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"marineadventure","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"megabingoclassic":[{"zoneID":1,"slotID":"megabingoclassic","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":252057336367,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"megabingoclassic","jackpotSubID":2,"jackpotSubKey":"major","jackpot":161656350574,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"megabingoclassic","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"megabingoclassic","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"megatondynamite":[{"zoneID":1,"slotID":"megatondynamite","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":596586948353,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"megatondynamite","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":216000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"megatondynamite","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":3600,"basePrizeType":"BetPerLine","maxBasePrize":108000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"meowgicalhalloween":[{"zoneID":1,"slotID":"meowgicalhalloween","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"meowgicalhalloween","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"meowgicalhalloween","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"meowgicalhalloween","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"meowgicalhalloween","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"moneystax":[{"zoneID":1,"slotID":"moneystax","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":252947794609,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"moneystax","jackpotSubID":2,"jackpotSubKey":"major","jackpot":331128818173,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"moneystax","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":155806332485,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"moneystax","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":17362396947,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"moonlightwolf":[{"zoneID":1,"slotID":"moonlightwolf","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":322889944120,"basePrize":1950,"basePrizeType":"BetPerLine","maxBasePrize":1170000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"moonlightwolf_dy":[{"zoneID":1,"slotID":"moonlightwolf_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":538946873766,"basePrize":3950,"basePrizeType":"BetPerLine","maxBasePrize":2370000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"mooorecheddar":[{"zoneID":1,"slotID":"mooorecheddar","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":0,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mooorecheddar","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mooorecheddar","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mooorecheddar","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"mysterrier":[{"zoneID":1,"slotID":"mysterrier","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":110668228829,"basePrize":75000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mysterrier","jackpotSubID":2,"jackpotSubKey":"major","jackpot":842546932,"basePrize":3750,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mysterrier","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mysterrier","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"mysticgypsy":[{"zoneID":1,"slotID":"mysticgypsy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5218230158573,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":true,"linkedKey":"mysticgypsi_curiousmermaid"},{"zoneID":1,"slotID":"mysticgypsy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":66447192858,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mysticgypsy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"mysticgypsy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"nudginglockclassic":[{"zoneID":1,"slotID":"nudginglockclassic","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":322194357060,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":675000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"nudginglockclassic_dy":[{"zoneID":1,"slotID":"nudginglockclassic_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1785684137661,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":1350000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"nuttysquirrel":[{"zoneID":1,"slotID":"nuttysquirrel","jackpotSubID":2,"jackpotSubKey":"grand","jackpot":337471396759,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"nuttysquirrel","jackpotSubID":1,"jackpotSubKey":"major","jackpot":853578867,"basePrize":225,"basePrizeType":"BetPerLine","maxBasePrize":135000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"nuttysquirrel","jackpotSubID":0,"jackpotSubKey":"minor","jackpot":1511587197.999918,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"orientallanterns":[{"zoneID":1,"slotID":"orientallanterns","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":5687744801585,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.009,"linked":true,"linkedKey":"dragontales_orientallanterns"},{"zoneID":1,"slotID":"orientallanterns","jackpotSubID":2,"jackpotSubKey":"major","jackpot":70548922031,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"orientallanterns","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":8428456457,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"orientallanterns","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":3417353372,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"pawpawneko":[{"zoneID":1,"slotID":"pawpawneko","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":96424445793,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawpawneko","jackpotSubID":2,"jackpotSubKey":"major","jackpot":27100482762,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawpawneko","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1254587787,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawpawneko","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":943675271.9999455,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"pawsomepanda":[{"zoneID":1,"slotID":"pawsomepanda","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":64422324586,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawsomepanda","jackpotSubID":4,"jackpotSubKey":"super","jackpot":7458559222,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawsomepanda","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":274359028,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawsomepanda","jackpotSubID":2,"jackpotSubKey":"major","jackpot":3897475685,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawsomepanda","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":608119155,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pawsomepanda","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2892008371,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""}],"peachyfortune":[{"zoneID":1,"slotID":"peachyfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":150108654101,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"peachyfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":111709121218,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"peachyfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":5485240798,"basePrize":625,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"peachyfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2497522964.9992857,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"penguinforce":[{"zoneID":1,"slotID":"penguinforce","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":64354008942,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"penguinforce","jackpotSubID":2,"jackpotSubKey":"major","jackpot":7765671466,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"penguinforce","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":5572036708,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"penguinforce","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":3130921566.999982,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"pharaohsbeetlelink":[{"zoneID":1,"slotID":"pharaohsbeetlelink","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":7928688544282,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":1800000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsbeetlelink","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsbeetlelink","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsbeetlelink","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"pharaohsbeetlelink_dy":[{"zoneID":1,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":10108473878186,"basePrize":60000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.04,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsbeetlelink_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"pharaohsecrets":[{"zoneID":1,"slotID":"pharaohsecrets","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":212357996573,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsecrets","jackpotSubID":2,"jackpotSubKey":"major","jackpot":877062566771,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsecrets","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":76535608664,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pharaohsecrets","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":6242307903,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"phoenixignite":[{"zoneID":1,"slotID":"phoenixignite","jackpotSubID":2,"jackpotSubKey":"grand","jackpot":340488400359,"basePrize":40000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"phoenixignite","jackpotSubID":1,"jackpotSubKey":"mega","jackpot":0,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"phoenixignite","jackpotSubID":0,"jackpotSubKey":"major","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"phoenixignite_dy":[{"zoneID":1,"slotID":"phoenixignite_dy","jackpotSubID":2,"jackpotSubKey":"grand","jackpot":659171841128,"basePrize":80000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"phoenixignite_dy","jackpotSubID":1,"jackpotSubKey":"mega","jackpot":0,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"phoenixignite_dy","jackpotSubID":0,"jackpotSubKey":"major","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggybankriches":[{"zoneID":1,"slotID":"piggybankriches","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6674756842884,"basePrize":300000,"basePrizeType":"BetPerLine","maxBasePrize":18000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggybankriches","jackpotSubID":2,"jackpotSubKey":"major","jackpot":159376715480,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggybankriches","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggybankriches","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggybankriches_dy":[{"zoneID":1,"slotID":"piggybankriches_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":999360369000,"basePrize":300000,"basePrizeType":"BetPerLine","maxBasePrize":18000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggybankriches_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":239420675714,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggybankriches_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggybankriches_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggyhouses":[{"zoneID":1,"slotID":"piggyhouses","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":81503561270,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggyhouses","jackpotSubID":2,"jackpotSubKey":"major","jackpot":42649125560,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggyhouses","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggyhouses","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"piggymania":[{"zoneID":1,"slotID":"piggymania","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":291218997817,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":15000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":131113533541,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0007,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania","jackpotSubID":3,"jackpotSubKey":"major","jackpot":23117656221,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0018,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":4307736494,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":1049287914,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0054,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":353974080,"basePrize":30,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0072,"linked":false,"linkedKey":""}],"piggymania_dy":[{"zoneID":1,"slotID":"piggymania_dy","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":122455456800,"basePrize":100000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania_dy","jackpotSubID":4,"jackpotSubKey":"mega","jackpot":173860507468,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":6000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0007,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania_dy","jackpotSubID":3,"jackpotSubKey":"major","jackpot":38326238218,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0018,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania_dy","jackpotSubID":2,"jackpotSubKey":"minor","jackpot":7338686998,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0036,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania_dy","jackpotSubID":1,"jackpotSubKey":"mini","jackpot":985402119,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0054,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piggymania_dy","jackpotSubID":0,"jackpotSubKey":"mini_small","jackpot":422038517,"basePrize":60,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0072,"linked":false,"linkedKey":""}],"pinataparade":[{"zoneID":1,"slotID":"pinataparade","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":214156062099,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinataparade","jackpotSubID":2,"jackpotSubKey":"major","jackpot":279718764984,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinataparade","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":81199413310,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"pinkstardiamonds":[{"zoneID":1,"slotID":"pinkstardiamonds","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":755027867849,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinkstardiamonds","jackpotSubID":2,"jackpotSubKey":"major","jackpot":667016926474,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":450000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinkstardiamonds","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":20772657385,"basePrize":70,"basePrizeType":"BetPerLine","maxBasePrize":210000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinkstardiamonds","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":10,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"pinupparadise":[{"zoneID":1,"slotID":"pinupparadise","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":26407393608,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinupparadise","jackpotSubID":2,"jackpotSubKey":"major","jackpot":8910480783,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinupparadise","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3100580714,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pinupparadise","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1707182924,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"piratebootyrapidhit":[{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":8,"jackpotSubKey":"30Jackpot","jackpot":471078929441,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":7,"jackpotSubKey":"24Jackpot","jackpot":355667732998,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":6,"jackpotSubKey":"21Jackpot","jackpot":115580368921,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":5,"jackpotSubKey":"18Jackpot","jackpot":27965368097,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":4,"jackpotSubKey":"15Jackpot","jackpot":9203359638,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":3,"jackpotSubKey":"12Jackpot","jackpot":3316299141,"basePrize":80,"basePrizeType":"BetPerLine","maxBasePrize":48000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":2,"jackpotSubKey":"10Jackpot","jackpot":502431007,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":1,"jackpotSubKey":"08Jackpot","jackpot":569779923,"basePrize":35,"basePrizeType":"BetPerLine","maxBasePrize":21000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"piratebootyrapidhit","jackpotSubID":0,"jackpotSubKey":"06Jackpot","jackpot":161868373,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"poseidonwildwaves":[{"zoneID":1,"slotID":"poseidonwildwaves","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":49219411905,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"poseidonwildwaves","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":6051092373,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"poseidonwildwaves","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1289966847,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"poseidonwildwaves","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":206989856,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"poseidonwildwaves","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":46072205,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""}],"pumpkinfortune":[{"zoneID":1,"slotID":"pumpkinfortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":186528101012,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pumpkinfortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":91083787763,"basePrize":1875,"basePrizeType":"BetPerLine","maxBasePrize":225000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pumpkinfortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":12262093240.999866,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"pumpkinfortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":10587950510,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"raccoonshowdown":[{"zoneID":1,"slotID":"raccoonshowdown","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":48449100931,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"raccoonshowdown","jackpotSubID":2,"jackpotSubKey":"major","jackpot":290995690074,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0037,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"raccoonshowdown","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":55186358502,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0076,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"raccoonshowdown","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":5153203184.000025,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0079,"linked":false,"linkedKey":""}],"railroadraiders":[{"zoneID":1,"slotID":"railroadraiders","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":155438169407,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"railroadraiders","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"railroadraiders","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"railroadraiders","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"railroadraiders","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"rainbowpearl":[{"zoneID":1,"slotID":"rainbowpearl","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":198026138505,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""}],"rainbowpearl_dy":[{"zoneID":1,"slotID":"rainbowpearl_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":129478115996,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.03,"linked":false,"linkedKey":""}],"rapidhitantarctic":[{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":11,"jackpotSubKey":"grand","jackpot":40297584943,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":10,"jackpotSubKey":"mega","jackpot":29443053750,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":9,"jackpotSubKey":"major","jackpot":17243064186,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":8,"jackpotSubKey":"minor","jackpot":4304730762,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":450000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":7,"jackpotSubKey":"mini","jackpot":2437176454,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":180000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":6,"jackpotSubKey":"10RapodHitJackpot","jackpot":0,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":5,"jackpotSubKey":"9RapodHitJackpot","jackpot":0,"basePrize":450,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":4,"jackpotSubKey":"8RapodHitJackpot","jackpot":0,"basePrize":270,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":3,"jackpotSubKey":"7RapodHitJackpot","jackpot":0,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":18000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":2,"jackpotSubKey":"6RapodHitJackpot","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":1,"jackpotSubKey":"5RapodHitJackpot","jackpot":0,"basePrize":60,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rapidhitantarctic","jackpotSubID":0,"jackpotSubKey":"4RapodHitJackpot","jackpot":0,"basePrize":30,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"rhinoblitz":[{"zoneID":1,"slotID":"rhinoblitz","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":186650590807,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":1200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rhinoblitz","jackpotSubID":2,"jackpotSubKey":"major","jackpot":106368172807,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0011,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rhinoblitz","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":59890174583,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"rhinoblitz","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":19310052348,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"robinhoodsecondshot":[{"zoneID":1,"slotID":"robinhoodsecondshot","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":12785322180,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":1000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"robinhoodsecondshot","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":26282172810,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":200000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0011,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"robinhoodsecondshot","jackpotSubID":2,"jackpotSubKey":"major","jackpot":9329058992,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"robinhoodsecondshot","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":5134986333,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0023,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"robinhoodsecondshot","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1265317504,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"rockingbell":[{"zoneID":1,"slotID":"rockingbell","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":85737148196.5,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"rollthedice":[{"zoneID":1,"slotID":"rollthedice","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":4079890919059.5,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"rudolphexpress":[{"zoneID":1,"slotID":"rudolphexpress","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1510507331890,"basePrize":48000,"basePrizeType":"BetPerLine","maxBasePrize":3600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"sakuraninja":[{"zoneID":1,"slotID":"sakuraninja","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":110299397152,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"sakuraninja","jackpotSubID":2,"jackpotSubKey":"major","jackpot":2210948496,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"sakuraninja","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2013783919,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"sakuraninja","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1026332455,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""}],"sevenglory":[{"zoneID":1,"slotID":"sevenglory","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":44051296372.08,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":1350000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"sevenglory","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":28212612788.62,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":540000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"sevenglory","jackpotSubID":2,"jackpotSubKey":"major","jackpot":55518072981.62,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":540000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"sevenglory","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":64380665502.24,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"sevenglory","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":43097838014.24,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"shamrocklock":[{"zoneID":1,"slotID":"shamrocklock","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":1002416113522,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shamrocklock","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":71387397645,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shamrocklock","jackpotSubID":2,"jackpotSubKey":"major","jackpot":66300058580,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shamrocklock","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1385888576,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shamrocklock","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1812800403,"basePrize":40,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"shanghaiexpress":[{"zoneID":1,"slotID":"shanghaiexpress","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":84105568768,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shanghaiexpress","jackpotSubID":2,"jackpotSubKey":"major","jackpot":11733514255,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.00075,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shanghaiexpress","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2793777190,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shanghaiexpress","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1186005424,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0005,"linked":false,"linkedKey":""}],"shanghaifullmoon":[{"zoneID":1,"slotID":"shanghaifullmoon","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":9222520465682,"basePrize":7200,"basePrizeType":"BetPerLine","maxBasePrize":2160000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shanghaifullmoon","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1383856549936,"basePrize":720,"basePrizeType":"BetPerLine","maxBasePrize":216000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.02,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shanghaifullmoon","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":180,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shanghaifullmoon","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"shopaholic":[{"zoneID":1,"slotID":"shopaholic","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":89568898443,"basePrize":6250,"basePrizeType":"BetPerLine","maxBasePrize":750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shopaholic","jackpotSubID":2,"jackpotSubKey":"major","jackpot":203348749550,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shopaholic","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3768365213.999994,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"shopaholic","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":4362124740,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"smashncash":[{"zoneID":1,"slotID":"smashncash","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":655642049843,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"starryholidays":[{"zoneID":1,"slotID":"starryholidays","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":121979510227,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"starryholidays","jackpotSubID":2,"jackpotSubKey":"major","jackpot":193835079445,"basePrize":1250,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"starryholidays","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1789951351,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"starryholidays","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1145966867,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"super25deluxe":[{"zoneID":1,"slotID":"super25deluxe","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":35999234504,"basePrize":980,"basePrizeType":"BetPerLine","maxBasePrize":294000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"super25deluxe_dy":[{"zoneID":1,"slotID":"super25deluxe_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":20370916768,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"superdrumbash":[{"zoneID":1,"slotID":"superdrumbash","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":71452307135,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"superdrumbash","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":26044420403,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"superdrumbash","jackpotSubID":2,"jackpotSubKey":"major","jackpot":67944461691,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"superdrumbash","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":124838192695,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"superdrumbash","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":41672379128,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"supernovablasts":[{"zoneID":1,"slotID":"supernovablasts","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":198935588014,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":12000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supernovablasts","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":22642402972,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supernovablasts","jackpotSubID":2,"jackpotSubKey":"major","jackpot":60836372589,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":240000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supernovablasts","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2341227425,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supernovablasts","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":797457077,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"supersevenblasts":[{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":8,"jackpotSubKey":"36Jackpot","jackpot":65963830719,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":7,"jackpotSubKey":"30Jackpot","jackpot":50878080,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":6,"jackpotSubKey":"25Jackpot","jackpot":20416863322,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":5,"jackpotSubKey":"21Jackpot","jackpot":171640516,"basePrize":700,"basePrizeType":"BetPerLine","maxBasePrize":210000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":4,"jackpotSubKey":"18Jackpot","jackpot":2481596783,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":3,"jackpotSubKey":"15Jackpot","jackpot":2342576917,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":2,"jackpotSubKey":"12Jackpot","jackpot":837506341,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":1,"jackpotSubKey":"09Jackpot","jackpot":711045551,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"supersevenblasts","jackpotSubID":0,"jackpotSubKey":"06Jackpot","jackpot":99298688,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"talesofarcadia":[{"zoneID":1,"slotID":"talesofarcadia","jackpotSubID":5,"jackpotSubKey":"grand","jackpot":208848555865,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"talesofarcadia","jackpotSubID":4,"jackpotSubKey":"super","jackpot":55921029723,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"talesofarcadia","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":10139293068,"basePrize":625,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"talesofarcadia","jackpotSubID":2,"jackpotSubKey":"major","jackpot":2512465335,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"talesofarcadia","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1054251706,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"talesofarcadia","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1248996658,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""}],"templeofathena":[{"zoneID":1,"slotID":"templeofathena","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":859031203557,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.01,"linked":false,"linkedKey":""}],"thanksgivinggalore":[{"zoneID":1,"slotID":"thanksgivinggalore","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":81946531340,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thanksgivinggalore","jackpotSubID":2,"jackpotSubKey":"major","jackpot":74394323766,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0039,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thanksgivinggalore","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":7732383634.999983,"basePrize":750,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0055,"linked":false,"linkedKey":""}],"thearcanealchemist":[{"zoneID":1,"slotID":"thearcanealchemist","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":224379247869,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":2700000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thearcanealchemist","jackpotSubID":2,"jackpotSubKey":"major","jackpot":20541049842,"basePrize":225,"basePrizeType":"BetPerLine","maxBasePrize":135000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thearcanealchemist","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":13349787016,"basePrize":125,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thearcanealchemist","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2259899436,"basePrize":45,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"thebeastssecret":[{"zoneID":1,"slotID":"thebeastssecret","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":33551938765,"basePrize":19200,"basePrizeType":"BetPerLine","maxBasePrize":576000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thebeastssecret","jackpotSubID":2,"jackpotSubKey":"major","jackpot":24094908913,"basePrize":4800,"basePrizeType":"BetPerLine","maxBasePrize":144000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thebeastssecret","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":5489086955,"basePrize":2400,"basePrizeType":"BetPerLine","maxBasePrize":72000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thebeastssecret","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":9412248618,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":36000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"thehogmancer":[{"zoneID":1,"slotID":"thehogmancer","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":32447129395,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thehogmancer","jackpotSubID":2,"jackpotSubKey":"major","jackpot":1640873997,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thehogmancer","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":281141597,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thehogmancer","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":469642838,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""}],"themobking":[{"zoneID":1,"slotID":"themobking","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":199545764370,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"themobking","jackpotSubID":2,"jackpotSubKey":"major","jackpot":319446472184,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"themobking","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":159335812508,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"theoddranch":[{"zoneID":1,"slotID":"theoddranch","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":361145908287,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"theoddranch","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"theoddranch","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"theoddranch","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"theoztales":[{"zoneID":1,"slotID":"theoztales","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":128467309712,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"theoztales","jackpotSubID":2,"jackpotSubKey":"major","jackpot":12317728968,"basePrize":12500,"basePrizeType":"BetPerLine","maxBasePrize":750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"theoztales","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":9792667662,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"theoztales","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2327481087.999967,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"thunderstrike":[{"zoneID":1,"slotID":"thunderstrike","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":90936403523,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thunderstrike","jackpotSubID":2,"jackpotSubKey":"major","jackpot":340051506017,"basePrize":1875,"basePrizeType":"BetPerLine","maxBasePrize":225000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0013,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thunderstrike","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":9360928892.99997,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0042,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"thunderstrike","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":8115983532,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0043,"linked":false,"linkedKey":""}],"toadallyrich":[{"zoneID":1,"slotID":"toadallyrich","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":293240165586,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"toadallyrich","jackpotSubID":2,"jackpotSubKey":"major","jackpot":26067517093,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"toadallyrich","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":7769002937,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"toadallyrich","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":3239871357,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0035,"linked":false,"linkedKey":""}],"triplewheelsupreme":[{"zoneID":1,"slotID":"triplewheelsupreme","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":34779533445,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"triplewheelsupreme","jackpotSubID":2,"jackpotSubKey":"major","jackpot":27595755992,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"triplewheelsupreme","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":14033902863,"basePrize":160,"basePrizeType":"BetPerLine","maxBasePrize":120000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"triplewheelsupreme","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2072026680,"basePrize":80,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"twilightdragon":[{"zoneID":1,"slotID":"twilightdragon","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":32397715014,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"twilightdragon","jackpotSubID":2,"jackpotSubKey":"major","jackpot":15821377715,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"twilightdragon","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":1045460497,"basePrize":40,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"twilightdragon","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1291238535,"basePrize":20,"basePrizeType":"BetPerLine","maxBasePrize":12000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"vampressmansion":[{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":9,"jackpotSubKey":"royalGrand","jackpot":0,"basePrize":9000,"basePrizeType":"BetPerLine","maxBasePrize":270000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":8,"jackpotSubKey":"royalMega","jackpot":0,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":135000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":7,"jackpotSubKey":"royalMajor","jackpot":0,"basePrize":3600,"basePrizeType":"BetPerLine","maxBasePrize":108000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":6,"jackpotSubKey":"royalMinor","jackpot":0,"basePrize":2700,"basePrizeType":"BetPerLine","maxBasePrize":81000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":5,"jackpotSubKey":"royalMini","jackpot":0,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":4500,"basePrizeType":"BetPerLine","maxBasePrize":135000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":2250,"basePrizeType":"BetPerLine","maxBasePrize":67500000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1800,"basePrizeType":"BetPerLine","maxBasePrize":54000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1350,"basePrizeType":"BetPerLine","maxBasePrize":40500000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vampressmansion","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":27000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"vikingsaga":[{"zoneID":1,"slotID":"vikingsaga","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":2874865123,"basePrize":25000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vikingsaga","jackpotSubID":2,"jackpotSubKey":"major","jackpot":404141300,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vikingsaga","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":559826798,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":6000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vikingsaga","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":463278922,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":3000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"vivalasvegas":[{"zoneID":1,"slotID":"vivalasvegas","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":301591114317,"basePrize":12000,"basePrizeType":"BetPerLine","maxBasePrize":900000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vivalasvegas","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":268175722678,"basePrize":4000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vivalasvegas","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":1200,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vivalasvegas","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"vivalasvegas","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":400,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"volcanictahiti":[{"zoneID":1,"slotID":"volcanictahiti","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":0,"basePrize":1500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"volcanictahiti","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":0,"basePrize":450,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"volcanictahiti","jackpotSubID":2,"jackpotSubKey":"major","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"volcanictahiti","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"volcanictahiti","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":90,"basePrizeType":"BetPerLine","maxBasePrize":9000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"wickedlildevil":[{"zoneID":1,"slotID":"wickedlildevil","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":54737251248,"basePrize":200000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wickedlildevil","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":7445627601,"basePrize":10000,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wickedlildevil","jackpotSubID":2,"jackpotSubKey":"major","jackpot":3534972203,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wickedlildevil","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":742565305,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wickedlildevil","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2133031671,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"wildbunch":[{"zoneID":1,"slotID":"wildbunch","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":1636779751092,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":7500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""}],"wildhearts":[{"zoneID":1,"slotID":"wildhearts","jackpotSubID":9,"jackpotSubKey":"9jackpot","jackpot":0,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":8,"jackpotSubKey":"8jackpot","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":360000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":7,"jackpotSubKey":"7jackpot","jackpot":0,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":6,"jackpotSubKey":"6jackpot","jackpot":0,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":5,"jackpotSubKey":"5jackpot","jackpot":0,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":4,"jackpotSubKey":"4jackpot","jackpot":0,"basePrize":25,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":288686383698.02,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":2,"jackpotSubKey":"major","jackpot":9868354727.015,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":49070032644.01,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1274975576.005,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"wildhearts_dy":[{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":9,"jackpotSubKey":"9jackpot","jackpot":0,"basePrize":3750,"basePrizeType":"BetPerLine","maxBasePrize":2250000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":8,"jackpotSubKey":"8jackpot","jackpot":0,"basePrize":900,"basePrizeType":"BetPerLine","maxBasePrize":540000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":7,"jackpotSubKey":"7jackpot","jackpot":0,"basePrize":375,"basePrizeType":"BetPerLine","maxBasePrize":225000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":6,"jackpotSubKey":"6jackpot","jackpot":0,"basePrize":150,"basePrizeType":"BetPerLine","maxBasePrize":90000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":5,"jackpotSubKey":"5jackpot","jackpot":0,"basePrize":75,"basePrizeType":"BetPerLine","maxBasePrize":45000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":4,"jackpotSubKey":"4jackpot","jackpot":0,"basePrize":37,"basePrizeType":"BetPerLine","maxBasePrize":22200000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":686499686397,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":142751701064,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":135461630641,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"wildhearts_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1150859400,"basePrize":0,"basePrizeType":"BetPerLine","maxBasePrize":0,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"winningrolls":[{"zoneID":1,"slotID":"winningrolls","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":1434632351255,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.005,"linked":false,"linkedKey":""}],"winyourheart":[{"zoneID":1,"slotID":"winyourheart","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":24798957758,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":2400000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"winyourheart","jackpotSubID":2,"jackpotSubKey":"major","jackpot":24257484881,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"winyourheart","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4406342357,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"winyourheart","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1648998737,"basePrize":200,"basePrizeType":"BetPerLine","maxBasePrize":24000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""}],"witchpumpkins":[{"zoneID":1,"slotID":"witchpumpkins","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":62661170745,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchpumpkins","jackpotSubID":2,"jackpotSubKey":"major","jackpot":20693471561,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchpumpkins","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":2826503161.9999084,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchpumpkins","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1793983520,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"witchpumpkins_dy":[{"zoneID":1,"slotID":"witchpumpkins_dy","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":21327729593,"basePrize":75000,"basePrizeType":"BetPerLine","maxBasePrize":4500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0025,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchpumpkins_dy","jackpotSubID":2,"jackpotSubKey":"major","jackpot":27839384968,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":150000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchpumpkins_dy","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":3516528966.999911,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchpumpkins_dy","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":1902545938,"basePrize":250,"basePrizeType":"BetPerLine","maxBasePrize":15000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""}],"witchsapples":[{"zoneID":1,"slotID":"witchsapples","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":266226175556,"basePrize":50000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchsapples","jackpotSubID":2,"jackpotSubKey":"major","jackpot":5511630550,"basePrize":5000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.006,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchsapples","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"witchsapples","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"zeusrampage":[{"zoneID":1,"slotID":"zeusrampage","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":1918238840,"basePrize":120000,"basePrizeType":"BetPerLine","maxBasePrize":4500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zeusrampage","jackpotSubID":2,"jackpotSubKey":"major","jackpot":2844619612,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":750000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0015,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zeusrampage","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":4221756916,"basePrize":2000,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zeusrampage","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":2653359997.9999995,"basePrize":800,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.0045,"linked":false,"linkedKey":""}],"zeusthundershower":[{"zoneID":1,"slotID":"zeusthundershower","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":78538206449,"basePrize":20000,"basePrizeType":"BetPerLine","maxBasePrize":600000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zeusthundershower","jackpotSubID":2,"jackpotSubKey":"major","jackpot":22120119439,"basePrize":7500,"basePrizeType":"BetPerLine","maxBasePrize":225000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zeusthundershower","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":408382453,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":75000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zeusthundershower","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":9290255431,"basePrize":1000,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}],"zhuquefortune":[{"zoneID":1,"slotID":"zhuquefortune","jackpotSubID":4,"jackpotSubKey":"grand","jackpot":232966605369,"basePrize":30000,"basePrizeType":"BetPerLine","maxBasePrize":3000000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zhuquefortune","jackpotSubID":3,"jackpotSubKey":"mega","jackpot":289340548221,"basePrize":15000,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zhuquefortune","jackpotSubID":2,"jackpotSubKey":"major","jackpot":135436147598,"basePrize":3000,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.007,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zhuquefortune","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":0,"basePrize":600,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zhuquefortune","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":0,"basePrize":300,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0,"linked":false,"linkedKey":""}],"zippyjackpots":[{"zoneID":1,"slotID":"zippyjackpots","jackpotSubID":3,"jackpotSubKey":"grand","jackpot":361607233970,"basePrize":2500,"basePrizeType":"BetPerLine","maxBasePrize":1500000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.001,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zippyjackpots","jackpotSubID":2,"jackpotSubKey":"major","jackpot":65868460097,"basePrize":500,"basePrizeType":"BetPerLine","maxBasePrize":300000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.002,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zippyjackpots","jackpotSubID":1,"jackpotSubKey":"minor","jackpot":12675938938,"basePrize":100,"basePrizeType":"BetPerLine","maxBasePrize":60000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.003,"linked":false,"linkedKey":""},{"zoneID":1,"slotID":"zippyjackpots","jackpotSubID":0,"jackpotSubKey":"mini","jackpot":8921178877,"basePrize":50,"basePrizeType":"BetPerLine","maxBasePrize":30000000000,"minPrize":0,"maxPrize":0,"increaseRate":0,"progressiveRate":0.004,"linked":false,"linkedKey":""}]}},"startDateClub":1768273200,"supersizeJackpotInfo":{"ticketCount":0,"lastWinUser":{"user":{"uid":469802420355072,"fbid":"","name":"Guest27434","picUrl":"hrvavatar://103","createdDate":1759433651,"lastLoginDate":1762273068,"accountSite":1},"winCoin":9000000,"winDate":1762273734,"slotID":"alienamigos"},"endDate":1762273734},"tripleThrillJackpotDiamondWheelMaxGauge":1250,"tripleThrillJackpotGoldWheelMaxGauge":1000,"tripleThrillJackpotLastWins":{"tripleThrillJackpotWinID":491007863062528,"user":{"uid":0,"fbid":"","name":"Maya Thomas","picUrl":"https://highrollervegas.akamaized.net/common/misc/profilepic/129.jpg","createdDate":0,"lastLoginDate":0,"accountSite":0},"jackpotCnt":4,"totalPrize":451099116439,"winDate":1769545194},"tripleThrillJackpotSliverWheelMaxGauge":600,"tripleThrillJackpots":[{"key":1,"isActive":true,"jackpot":275108448.36588806,"basePrize":125000000},{"key":2,"isActive":true,"jackpot":13494475432.712767,"basePrize":5000000000},{"key":3,"isActive":true,"jackpot":68676603746.60992,"basePrize":10000000000},{"key":4,"isActive":true,"jackpot":260574888280.6395,"basePrize":150000000000},{"key":5,"isActive":false,"jackpot":0,"basePrize":300000000000}],"zoneInfo":{"name":"mega roller casino","zoneID":1,"isActive":true,"slotList":[{"slotID":"houndofhades","minLevel":512},{"slotID":"railroadraiders","minLevel":605},{"slotID":"dualfortunepot","minLevel":419},{"slotID":"rainbowpearl","minLevel":110},{"slotID":"golden100xdollar","minLevel":83},{"slotID":"nudginglockclassic","minLevel":59},{"slotID":"davyjonesslocker","minLevel":617},{"slotID":"alohahawaii","minLevel":86},{"slotID":"fatturkeywilds","minLevel":194},{"slotID":"vikingsaga","flag":"new","minLevel":638,"order":1},{"slotID":"wrathofzeus","minLevel":0},{"slotID":"birdjackpot","minLevel":41},{"slotID":"thepurrglar","minLevel":521},{"slotID":"super25deluxe_dy","minLevel":2009},{"slotID":"alienamigos","minLevel":407},{"slotID":"penguinforce","minLevel":623},{"slotID":"100xdollar","flag":"hot","minLevel":23,"order":1},{"slotID":"shanghaiexpress","minLevel":530},{"slotID":"firelockclassic","minLevel":0},{"slotID":"thesailorman","flag":"new","minLevel":635,"order":2},{"slotID":"wildsigniterespins","minLevel":551},{"slotID":"casinoroyale","minLevel":176},{"slotID":"super25deluxe","flag":"hot","minLevel":11,"order":2},{"slotID":"100xdollar_dy","minLevel":2012},{"slotID":"flamefurywheel","minLevel":221},{"slotID":"dragonsandpearls","minLevel":404},{"slotID":"bankofwealth","minLevel":5},{"slotID":"twilightdragon","flag":"hot","minLevel":632,"order":3},{"slotID":"firelockultimate","minLevel":236},{"slotID":"supersevenblasts","minLevel":485},{"slotID":"fireblastclassic","minLevel":107},{"slotID":"thehogmancer","minLevel":566},{"slotID":"zhuquefortune","flag":"hot","minLevel":620,"order":4},{"slotID":"rainbowpearl_dy","minLevel":2003},{"slotID":"emeraldgreen","minLevel":89},{"slotID":"boomburst","minLevel":31},{"slotID":"phoenixignite","minLevel":329},{"slotID":"piggybankriches","minLevel":128},{"slotID":"pharaohsbeetlelink","minLevel":62},{"slotID":"winyourheart","minLevel":290},{"slotID":"rollthedice","minLevel":113},{"slotID":"cashdash","minLevel":146},{"slotID":"jumbopiggies","minLevel":515},{"slotID":"volcanictahiti","minLevel":353},{"slotID":"nudginglockclassic_dy","minLevel":2030},{"slotID":"bigbucksbounty","minLevel":284},{"slotID":"cashshowdowndeluxe","minLevel":479},{"slotID":"fortunepot","minLevel":0},{"slotID":"abracadabra","minLevel":9},{"slotID":"mysticgypsy","minLevel":13},{"slotID":"curiousmermaid","minLevel":15},{"slotID":"casinoroyale_dy","minLevel":2027},{"slotID":"classiclockrollgrand","minLevel":7},{"slotID":"super25","minLevel":39},{"slotID":"orientallanterns","minLevel":45},{"slotID":"dragontales","minLevel":47},{"slotID":"eggstraeaster","minLevel":581},{"slotID":"wildfiremen","minLevel":302},{"slotID":"peachyfortune","minLevel":590},{"slotID":"fruityblast","minLevel":293},{"slotID":"dualfortunepot_dy","minLevel":2006},{"slotID":"witchpumpkins","minLevel":449},{"slotID":"moonlightwolf","minLevel":260},{"slotID":"piggyhouses","minLevel":254},{"slotID":"smashncash","minLevel":536},{"slotID":"birdjackpot_dy","minLevel":2036},{"slotID":"cashshowdownclassic","minLevel":266},{"slotID":"frankendualshock","minLevel":29},{"slotID":"huffndoze","minLevel":608},{"slotID":"goldeneagleking","minLevel":326},{"slotID":"phoenixignite_dy","minLevel":2021},{"slotID":"goldencrown","minLevel":51},{"slotID":"winningrolls","minLevel":392},{"slotID":"mooorecheddar","minLevel":629},{"slotID":"magmaficent","minLevel":452},{"slotID":"diamondbeamjackpot","minLevel":27},{"slotID":"alohahawaii_dy","minLevel":2039},{"slotID":"dualdiamondsstrike","minLevel":377},{"slotID":"mysterrier","minLevel":602},{"slotID":"toadallyrich","minLevel":560},{"slotID":"allstarcircus","minLevel":509},{"slotID":"theoddranch","minLevel":584},{"slotID":"american9eagles","minLevel":155},{"slotID":"beelovedjars","minLevel":626},{"slotID":"tripleblastclassic","minLevel":65},{"slotID":"pilingfortunes","minLevel":323},{"slotID":"wildhearts","minLevel":443},{"slotID":"sharkattack","minLevel":245},{"slotID":"bellstrikefrenzy","minLevel":33},{"slotID":"megatondynamite","minLevel":92},{"slotID":"mayantemplemagic","minLevel":218},{"slotID":"moneystax","minLevel":344},{"slotID":"pumpkinfortune","minLevel":173},{"slotID":"nuttysquirrel","minLevel":542},{"slotID":"bunnybank","minLevel":305},{"slotID":"cashshowdown","minLevel":215},{"slotID":"piggymania_dy","minLevel":2054},{"slotID":"babysantawild","minLevel":278},{"slotID":"christmasblings","minLevel":371},{"slotID":"pinataparade","minLevel":311},{"slotID":"gempackedwilds","minLevel":431},{"slotID":"marineadventure","minLevel":281},{"slotID":"leprechaunluckyrespins","minLevel":71},{"slotID":"pharaohsbeetlelink_dy","minLevel":2000},{"slotID":"bingotrio","minLevel":233},{"slotID":"piggymania","minLevel":398},{"slotID":"leprechaunmagicdrop","minLevel":212},{"slotID":"imperialgoldfortune","minLevel":227},{"slotID":"makeitrain","minLevel":152},{"slotID":"pharaohsecrets","minLevel":206},{"slotID":"sevenglory","minLevel":317},{"slotID":"ghosthunters","minLevel":197},{"slotID":"gummytummywild","minLevel":167},{"slotID":"magiclamp","minLevel":116},{"slotID":"santarudolph","minLevel":80},{"slotID":"luckybunnydrop","minLevel":401},{"slotID":"midastouchofriches","minLevel":37},{"slotID":"horoscopeblessings","minLevel":338},{"slotID":"diamondstrike","minLevel":56},{"slotID":"tomeoffate","minLevel":527},{"slotID":"bunnybank_dy","minLevel":2045},{"slotID":"sakuraninja","minLevel":593},{"slotID":"rapidhitantarctic","minLevel":275},{"slotID":"emeraldislegold","minLevel":572},{"slotID":"kongsmash","minLevel":578},{"slotID":"chilichilifever","minLevel":224},{"slotID":"jinlongcaifu","minLevel":569},{"slotID":"rhinoblitz","minLevel":25},{"slotID":"carnivalinrio","minLevel":185},{"slotID":"theoztales","minLevel":599},{"slotID":"fortuneshrine","minLevel":347},{"slotID":"wildbunch","minLevel":365},{"slotID":"pinkstardiamonds","minLevel":251},{"slotID":"frozenthronerespin","minLevel":158},{"slotID":"bonanzaexpress","minLevel":368},{"slotID":"aliceinwonderland","minLevel":161},{"slotID":"gemdiggerjoe","minLevel":77},{"slotID":"pawpawneko","minLevel":614},{"slotID":"tajmahalprincess","minLevel":19},{"slotID":"thunderstrike","minLevel":200},{"slotID":"wildhearts_dy","minLevel":2057},{"slotID":"witchpumpkins_dy","minLevel":2051},{"slotID":"boonanza","minLevel":458},{"slotID":"classicstar_dy","minLevel":2048},{"slotID":"waikikisanta","minLevel":314},{"slotID":"sevenrush","minLevel":122},{"slotID":"dingdongjackpots","minLevel":464},{"slotID":"goldenmoonfortune","minLevel":476},{"slotID":"blazingbullwild","minLevel":134},{"slotID":"blackwhitetiger","minLevel":143},{"slotID":"shanghaifullmoon","minLevel":131},{"slotID":"piratebootyrapidhit","minLevel":503},{"slotID":"shamrocklock","minLevel":296},{"slotID":"dragonblast","minLevel":575},{"slotID":"jurassicwildstomps","minLevel":506},{"slotID":"luckyamericanroll","minLevel":68},{"slotID":"4thofjulywildrespin","minLevel":119},{"slotID":"kingdominperil","minLevel":248},{"slotID":"thearcanealchemist","minLevel":308},{"slotID":"highrisejackpot","minLevel":137},{"slotID":"witchsapples","minLevel":545},{"slotID":"locknrollfiver","minLevel":467},{"slotID":"ladyoluck","minLevel":395},{"slotID":"zeusthundershower","minLevel":482},{"slotID":"kingofsafari","minLevel":104},{"slotID":"blazingphoenix","minLevel":182},{"slotID":"bloodgems","minLevel":491},{"slotID":"drmadwin","minLevel":437},{"slotID":"ladylibertyrespins","minLevel":422},{"slotID":"wudangjianshi","minLevel":287},{"slotID":"oktoberfestbierhaus","minLevel":98},{"slotID":"robinhoodsecondshot","minLevel":389},{"slotID":"xinnianhao","minLevel":380},{"slotID":"shopaholic","minLevel":203},{"slotID":"gempackedwilds_dy","minLevel":2015},{"slotID":"zippyjackpots","minLevel":383},{"slotID":"moonlightwolf_dy","minLevel":2018},{"slotID":"firelockclassic_dy","minLevel":2024},{"slotID":"captainblackpurr","minLevel":533},{"slotID":"dakotafarmgirl","minLevel":455},{"slotID":"classicstar","minLevel":410},{"slotID":"jollyrogerjackpot","minLevel":335},{"slotID":"themobking","minLevel":416},{"slotID":"hoardinggoblins","minLevel":470},{"slotID":"wrathofzeus_dy","minLevel":2042},{"slotID":"pawsomepanda","minLevel":518},{"slotID":"superninebells","minLevel":188},{"slotID":"wickedlildevil","minLevel":320},{"slotID":"libertyeaglefortune","minLevel":587},{"slotID":"thanksgivinggalore","minLevel":362},{"slotID":"goldentrain","minLevel":272},{"slotID":"fruityjewels","minLevel":95},{"slotID":"vampressmansion","minLevel":350},{"slotID":"fatbilly","minLevel":269},{"slotID":"wheelofvegas","minLevel":74},{"slotID":"jacksmagicbeans","minLevel":434},{"slotID":"dragonorbs","minLevel":524},{"slotID":"triplewheelsupreme","minLevel":374},{"slotID":"piggybankriches_dy","minLevel":2033},{"slotID":"spookynight","minLevel":263},{"slotID":"jiujiujiu999","minLevel":257},{"slotID":"majesticlion","minLevel":125},{"slotID":"fortunetree","minLevel":17},{"slotID":"cupidlovespells","minLevel":473},{"slotID":"americanvalor","minLevel":230},{"slotID":"thebiggame","minLevel":299},{"slotID":"starryholidays","minLevel":461},{"slotID":"pinupparadise","minLevel":554},{"slotID":"raccoonshowdown","minLevel":446},{"slotID":"thebeastssecret","minLevel":386},{"slotID":"dualwheelaction","minLevel":140},{"slotID":"sishenfortunes","minLevel":209},{"slotID":"kongfury","minLevel":242},{"slotID":"nudgewild","minLevel":35},{"slotID":"patriotsquad","minLevel":596},{"slotID":"apocalypselasthope","minLevel":611},{"slotID":"dreamcitylights","minLevel":43},{"slotID":"allamerican","minLevel":500},{"slotID":"honeybeeparade","minLevel":53},{"slotID":"vivalasvegas","minLevel":332},{"slotID":"greatamerica","minLevel":239},{"slotID":"superdrumbash","minLevel":497},{"slotID":"themightyviking","minLevel":21},{"slotID":"supernovablasts","minLevel":341},{"slotID":"aztecodyssey","minLevel":494},{"slotID":"chronosphereegypt","minLevel":488},{"slotID":"wildwolf","minLevel":164},{"slotID":"talesofarcadia","minLevel":548},{"slotID":"rockingbell","minLevel":170},{"slotID":"templeofathena","minLevel":539},{"slotID":"richrichfarm","minLevel":428},{"slotID":"megabingoclassic","minLevel":425},{"slotID":"rudolphexpress","minLevel":101},{"slotID":"poseidonwildwaves","minLevel":557},{"slotID":"beaverstacks","minLevel":413},{"slotID":"meowgicalhalloween","minLevel":356},{"slotID":"flameofliberty","minLevel":359},{"slotID":"candycastle","minLevel":440},{"slotID":"cupidloveydovey","minLevel":563},{"slotID":"zeusrampage","flag":"early access","minLevel":641,"order":1}],"UpdateDate":1769687673}}')
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

                    const slotInfo = SlotJackpotManager.Instance().getSlotmachineInfo(zone, slotId);
                    if (linked) SlotJackpotManager.Instance().getLinkedJackpotInfo(zone, linkedKey).setTargetGame(slotId);
                    slotInfo.setJackpotMoney(subId, basePrize, curJackpot, maxBase, rate, minPrize, maxPrize, linked, linkedKey, subKey);
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
        // this.asyncRefreshJackpotInfo(true);
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
    public async checkAndAccountLinkFacebook(): Promise<boolean> {
        return new Promise(()=>{
            
        })
    }
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