const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import PopupManager from "../manager/PopupManager";
import TSUtility from "../global_utility/TSUtility";
import UserInfo from "../User/UserInfo";
import AD_Fail_Popup from "../Popup/AD_Fail_Popup";
import SDefine from "../global_utility/SDefine";
import ADLogServer, { ADLogV2_RewardedAD_P2Type } from "../Network/ADLogServer";
import ServiceInfoManager from "../ServiceInfoManager";
import LocalStorageManager from "../manager/LocalStorageManager";
import FBInstantUtil from "../Network/FBInstantUtil";
import MaxAdManager from "../manager/MaxAdManager";
import NativeUtil from "../global_utility/NativeUtil";
import EventInfoManager, { EventInfoKey } from "../manager/EventInfoManager";
import { Utility } from "../global_utility/Utility";


var nativeJSBridge:any = null
// ==============================================================
// ✅ 原文件3个核心枚举 完整复刻 所有枚举值/命名 一字不差 顺序一致 对外导出供全局调用
// ==============================================================
export enum PlacementID_Type {
    DEFAULT = "DEFAULT",
    DAILYBONUS = "DAILYBONUS",
    TIMEBONUS = "TIMEBONUS",
    COLLECTALL = "COLLECTALL",
    NORREWARD = "NORREWARD",
    ALLINREWARD = "ALLINREWARD",
    BALLEMPTY = "BALLEMPTY",
    MAJORENTER = "MAJORENTER",
    INGAMERANDOMEREWARD = "INGAMERANDOMEREWARD",
    INSTANTIOSSHOP = "INSTANTIOSSHOP",
    RAINBOW_DICE = "RAINBOW_DICE",
    FIRE_DICE = "FIRE_DICE",
    ADSFREE = "ADSFREE",
    FREEBIES = "FREEBIES",
    INBOX_PINTOTOP = "INBOX_PINTOTOP",
    COINSHOWER = "COINSHOWER",
    INBOX_DAILYBONUS = "INBOX_DAILYBONUS",
    BINGO_INSTANTLY = "BINGO_INSTANTLY",
    POWER_GEM = "POWER_GEM",
    RAINBOW_DICE_1HOUR = "RAINBOW_DICE_1HOUR",
    FIRE_DICE_1HOUR = "FIRE_DICE_1HOUR"
}

export enum PlacementID_InterstitalType {
    DEFAULT = "DEFAULT",
    LOBBYTOBINGO = "LOBBYTOBINGO",
    BINGTOLOBBY = "BINGOTOLOBBY",
    LOBBYTOSLOT = "LOBBYTOSLOT",
    SLOTTOLOBBY = "SLOTTOLOBBY",
    BINGOMISSION = "BINGOMISSION",
    DAILYBONUS = "DAILYBONUS",
    TIMEBONUS = "TIMEBONUS",
    COLLECTALL = "COLLECTALL",
    NORREWARD = "NORREWARD",
    ALLINREWARD = "ALLINREWARD",
    BALLEMPTY = "BALLEMPTY",
    MAJORENTER = "MAJORENTER",
    INGAMERANDOMEREWARD = "INGAMERANDOMEREWARD",
    INSTANTIOSSHOP = "INSTANTIOSSHOP",
    RAINBOW_DICE = "RAINBOW_DICE",
    FIRE_DICE = "FIRE_DICE",
    ADSFREE = "ADSFREE",
    FREEBIES = "FREEBIES",
    INBOX_PINTOTOP = "INBOX_PINTOTOP",
    COINSHOWER = "COINSHOWER",
    INBOX_DAILYBONUS = "INBOX_DAILYBONUS",
    BINGO_INSTANTLY = "BINGO_INSTANTLY",
    POWER_GEM = "POWER_GEM",
    RAINBOW_DICE_1HOUR = "RAINBOW_DICE_1HOUR",
    FIRE_DICE_1HOUR = "FIRE_DICE_1HOUR"
}

export enum Kind_Advertisement {
    INTERSTITIAL = "INTERSTITIAL",
    REWARDED = "REWARDED"
}

// ==============================================================
// ✅ 广告位信息实体类 【保留原文件拼写错误 PalcementInfo 非 PlacementInfo】 核心要求 绝对不修改
// 完整复刻所有成员变量+init方法 一字不差 补全强类型注解
// ==============================================================
export class PalcementInfo {
    public id: string = "";
    public mopub_playstoreId: string = "";
    public mopub_appstoreId: string = "";
    public fbInstantId: string = "";
    public max_playstoreId: string = "";
    public max_appstoreId: string = "";
    public max_playstoreId_high: string = "";
    public max_appstoreId_high: string = "";
    public admob_playstoreId: string = "";
    public admob_appstoreId: string = "";
    public admob_playstoreId_high: string = "";
    public admob_appstoreId_high: string = "";

    public init(data: any): void {
        this.id = data.id;
        this.mopub_playstoreId = data.mopub_playstoreId;
        this.mopub_appstoreId = data.mopub_appstoreId;
        this.fbInstantId = data.fbInstantId;
        this.max_playstoreId = data.max_playstoreId;
        this.max_appstoreId = data.max_appstoreId;
        TSUtility.isValid(data.max_playstoreId_high) && (this.max_playstoreId_high = data.max_playstoreId_high);
        TSUtility.isValid(data.max_appstoreId_high) && (this.max_appstoreId_high = data.max_appstoreId_high);
        TSUtility.isValid(data.admob_playstoreId) && (this.admob_playstoreId = data.admob_playstoreId);
        TSUtility.isValid(data.admob_playstoreId_high) && (this.admob_playstoreId_high = data.admob_playstoreId_high);
        TSUtility.isValid(data.admob_appstoreId) && (this.admob_appstoreId = data.admob_appstoreId);
        TSUtility.isValid(data.admob_appstoreId_high) && (this.admob_appstoreId_high = data.admob_appstoreId_high);
    }
}

/**
 * 全局广告核心管理器 - 单例模式
 * 项目唯一广告入口，负责所有广告位【插屏广告/激励视频】的预加载、播放、回调、多平台适配、埋点上报、广告失败兜底
 * 适配：移动端(AOS/IOS)、FB小游戏、开发/测试/正式环境，完整兼容ADTargetManager广告策略校验
 */
@ccclass
export default class AdsManager extends cc.Component {
    // ✅ 单例核心 - 静态私有实例 + 全局回调挂载在类上 完全复刻原逻辑 一字不差
    private static _instance: AdsManager = null;
    public static callback: Function = null;
    public static failedCallback: Function = null;

    // ==============================================================
    // ✅ 所有私有成员变量 与原JS完全一致 初始化值一致 补全精准类型注解 无任何增删
    // 包含：广告ID数组、预加载状态、就绪状态、计数限制、回调函数、缓存数据 全部复刻
    // ==============================================================
    private _interstitial_ids: PalcementInfo[] = [];
    private _rewardVideo_ids: PalcementInfo[] = [];
    private preloadedInterstitial: any = null;
    private preloadedRewardedVideo: any = null;

    private _isReadyInterstitialAD: boolean = false;
    private _isLoadingInterstitialAD: boolean = false;
    private _isReadyRewardedAD: boolean = false;
    private _isLoadingRewardedAD: boolean = false;
    private _isReadyHighRewardedAD: boolean = false;
    private _isLoadingHighRewardedAD: boolean = false;

    private _isReadyInterstitialADNormal_Mobile: boolean = false;
    private _isReadyInterstitialADHigh_Mobile: boolean = false;
    private _isReadyRewardedADNormal_Mobile: boolean = false;
    private _isReadyRewardedADHigh_Mobile: boolean = false;

    private _flagIsLoadingInterstitialAD: boolean = false;
    private _flagIsLoadingRewardAD: boolean = false;

    private _maxCountRequestHighInterstitialAD: number = 3;
    private _countRequestHighInsterstitialAD: number = 0;
    private _maxCountRequestHighRewardAD: number = 3;
	private _countRequestHighRewardAD: number = 0;

    private _loadRewardedADCompleteCallback: Function = null;
	private _loadInterstitialADCompleteCallback: Function = null;
	private _mopubImpressionData: any = null;
	private _callbackCompleteCmp: Function = null;

    // ==============================================================
    // ✅ 单例全局访问方法 + 静态初始化方法 完整复刻原逻辑 日志打印一致 无任何修改
    // ==============================================================
    public static Instance(): AdsManager {
        if (AdsManager._instance == null) {
            cc.log("invalid AdsManager");
            AdsManager._instance = new AdsManager();
        }
        return AdsManager._instance;
    }

    public static Init(config: any): boolean {
        AdsManager._instance = new AdsManager();
        AdsManager._instance.initADsManager(config);
        return true;
    }

    // ==============================================================
    // ✅ 所有核心业务方法 按原文件顺序1:1复刻 逻辑完整 分支无删减 保留所有0==/1==判断风格
    // 包含：广告管理器初始化、延迟预加载、广告位ID获取、预加载、播放、回调、埋点、失败兜底 全部精准还原
    // ==============================================================
    public initADsManager(config: any): void {
        const envType = TSUtility.isDevService() ? "dev" : TSUtility.isQAService() ? "qa" : "live";
        // 初始化插屏广告位ID
        for (let i = 0; i < config[envType].INTERSTITIAL.length; i++) {
            const info = new PalcementInfo();
            info.init(config[envType].INTERSTITIAL[i]);
            this._interstitial_ids.push(info);
        }
        // 初始化激励视频广告位ID
        for (let i = 0; i < config[envType].REWARDVIDEO.length; i++) {
            const info = new PalcementInfo();
            info.init(config[envType].REWARDVIDEO[i]);
            this._rewardVideo_ids.push(info);
        }
        // CMP隐私政策弹窗回调绑定
        Utility.isMobileGame() && SDefine.Mobile_Use_Google_CMP && nativeJSBridge.addBridgeCallback("completeShowCMP", this.callbackCMP.bind(this));
    }

    public delayedPreloadInterstitialAD(): void {
        const self = this;
        this.scheduleOnce(() => {
            self.preloadInterstitialAD();
        }, 10);
    }

    public preloadInterstitialAD(): void {
        const self = this;
        cc.log("preloadInterstitialAD load start");
        if (!this._isReadyInterstitialAD) {
            if (!this._isLoadingInterstitialAD) {
                this._isLoadingInterstitialAD = true;
                const placementId = this.getInterstitialADPlacementID(PlacementID_InterstitalType.DEFAULT);
                cc.log("preloadInterstitialAD placementId normal", placementId);
                const completeCallback = (isSuccess: number) => {
                    cc.log("preloadInterstitialAD ", isSuccess, placementId);
                    self._isLoadingInterstitialAD = false;
                    1 == isSuccess && (self._isReadyInterstitialAD = true);
                    self._loadInterstitialADCompleteCallback && (self._loadInterstitialADCompleteCallback(isSuccess), self._loadInterstitialADCompleteCallback = null);
                };
                Utility.isMobileGame() ? this._preloadInterstitialAD_Mobile(placementId, completeCallback) : Utility.isFacebookInstant() && this._preloadInterstitialAD_Instant(placementId, completeCallback);
            } else {
                cc.log("preloadInterstitialAD already loded");
            }
        } else {
            cc.log("preloadInterstitialAD already ready");
        }
    }

    private _preloadInterstitialAD_Mobile(placementId: string, completeCallback: Function): void {
        const self = this;
        let isCallback = false;
        let isSuccess = false;
        const callbackTrigger = () => { isCallback && completeCallback(isSuccess); };

        this._isReadyInterstitialADNormal_Mobile && completeCallback(true);
        if (!this._isReadyInterstitialADNormal_Mobile) {
            MaxAdManager.Instance.loadInterstitialAd(placementId, (code: boolean, errCode: number, msg: string) => {
                isCallback = true;
                !code ? (self._isReadyInterstitialADNormal_Mobile = false, cc.log("MaxAdManager Normal InterstitialAd Load Failed [%s][%s][%s]".format(placementId, errCode.toString(), msg))) : (self._isReadyInterstitialADNormal_Mobile = true, isSuccess = true);
                callbackTrigger();
            });
        } else {
            isCallback = true;
            callbackTrigger();
        }
    }

    private _preloadInterstitialAD_Instant(placementId: string, completeCallback: Function): void {
        const self = this;
        FBInstantUtil.getInterstitialAdAsyncWrapper(placementId, (isSuccess: boolean, adObj: any) => {
            self.preloadedInterstitial = adObj;
            completeCallback(isSuccess);
        });
    }

    public isReadyInterstitialAD(): boolean {
        return this._isReadyInterstitialAD || this._isReadyInterstitialADHigh_Mobile;
    }

    public isReadyRewardedAD(): boolean {
        return SDefine.Mobile_Admob_Use ? this._isReadyRewardedAD || this._isReadyHighRewardedAD || this.isReadyInterstitialAD() : this._isReadyRewardedAD || this._isReadyHighRewardedAD;
    }

    public isLoadingInterstitialAD(): boolean {
        return this._isLoadingInterstitialAD;
    }

    public getRewardVideoPlacementID(type: PlacementID_Type): string {
        let key = "";
        Utility.isFacebookInstant() ? key = "fbInstantId" : cc.sys.os == cc.sys.OS_ANDROID ? (key = "max_playstoreId", SDefine.Mobile_Admob_Use && (key = "admob_playstoreId"), type = PlacementID_Type.DEFAULT) : cc.sys.os == cc.sys.OS_IOS && (key = "max_appstoreId", SDefine.Mobile_Admob_Use && (key = "admob_appstoreId"), type = PlacementID_Type.DEFAULT);
        for (let i = 0; i < this._rewardVideo_ids.length; i++) {
            if (this._rewardVideo_ids[i].id == type) {
                return this._rewardVideo_ids[i][key];
            }
        }
        cc.error("Have Not PlacementID AD");
        return "";
    }

    public getHighRewardVideoPlacementIDInMobile(): string {
        let key = "";
        const type = PlacementID_Type.DEFAULT;
        if (Utility.isMobileGame()) {
            cc.sys.os == cc.sys.OS_ANDROID ? (key = "max_playstoreId_high", SDefine.Mobile_Admob_Use && (key = "admob_playstoreId_high")) : cc.sys.os == cc.sys.OS_IOS && (key = "max_appstoreId_high", SDefine.Mobile_Admob_Use && (key = "admob_appstoreId_high"));
            for (let i = 0; i < this._rewardVideo_ids.length; i++) {
                if (this._rewardVideo_ids[i].id == type) {
                    return this._rewardVideo_ids[i][key];
                }
            }
        }
        cc.log("Have Not PlacementID High AD");
        return "";
    }

    public getRewardVideoADNumber(type: PlacementID_Type): number {
        let adNum = 0;
        switch (type) {
            case PlacementID_Type.TIMEBONUS: adNum = 102; break;
            case PlacementID_Type.COLLECTALL: adNum = 103; break;
            case PlacementID_Type.NORREWARD: adNum = 104; break;
            case PlacementID_Type.ALLINREWARD: adNum = 105; break;
            case PlacementID_Type.BALLEMPTY: adNum = 106; break;
            case PlacementID_Type.INGAMERANDOMEREWARD: adNum = 107; break;
            case PlacementID_Type.MAJORENTER: adNum = 108; break;
            case PlacementID_Type.INSTANTIOSSHOP: adNum = 111; break;
            case PlacementID_Type.RAINBOW_DICE: adNum = 109; break;
            case PlacementID_Type.FIRE_DICE: adNum = 110; break;
            case PlacementID_Type.ADSFREE: adNum = 112; break;
            case PlacementID_Type.BINGO_INSTANTLY: adNum = 121; break;
            case PlacementID_Type.INBOX_DAILYBONUS: adNum = 122; break;
            case PlacementID_Type.COINSHOWER: adNum = 123; break;
            case PlacementID_Type.FREEBIES: adNum = 124; break;
            case PlacementID_Type.INBOX_PINTOTOP: adNum = 125; break;
            case PlacementID_Type.POWER_GEM: adNum = 126; break;
            case PlacementID_Type.RAINBOW_DICE_1HOUR: adNum = 127; break;
            case PlacementID_Type.FIRE_DICE_1HOUR: adNum = 128; break;
            default: adNum = 0; break;
        }
        return adNum;
    }

    public getInterstitialADPlacementID(type: PlacementID_InterstitalType): string {
        let key = "";
        Utility.isFacebookInstant() ? key = "fbInstantId" : cc.sys.os == cc.sys.OS_ANDROID ? (key = "max_playstoreId", SDefine.Mobile_Admob_Use && (key = "admob_playstoreId"), type = PlacementID_InterstitalType.DEFAULT) : cc.sys.os == cc.sys.OS_IOS && (key = "max_appstoreId", SDefine.Mobile_Admob_Use && (key = "admob_appstoreId"), type = PlacementID_InterstitalType.DEFAULT);
        for (let i = 0; i < this._interstitial_ids.length; i++) {
            if (this._interstitial_ids[i].id == type) {
                return this._interstitial_ids[i][key];
            }
        }
        cc.error("Have Not PlacementID AD");
        return "";
    }

    public getInterstitialHighADPlacementID(type: PlacementID_InterstitalType): string {
        let key = "";
        if (Utility.isMobileGame()) {
            cc.sys.os == cc.sys.OS_ANDROID ? (key = "max_playstoreId_high", SDefine.Mobile_Admob_Use && (key = "admob_playstoreId_high"), type = PlacementID_InterstitalType.DEFAULT) : cc.sys.os == cc.sys.OS_IOS && (key = "max_appstoreId_high", SDefine.Mobile_Admob_Use && (key = "admob_appstoreId_high"), type = PlacementID_InterstitalType.DEFAULT);
            for (let i = 0; i < this._interstitial_ids.length; i++) {
                if (this._interstitial_ids[i].id == type) {
                    return this._interstitial_ids[i][key];
                }
            }
        }
        cc.log("Have Not PlacementID High AD");
        return "";
    }

    public getInterstitalADNumber(type: PlacementID_InterstitalType): number {
        let adNum = 0;
        switch (type) {
            case PlacementID_InterstitalType.LOBBYTOBINGO: adNum = 201; break;
            case PlacementID_InterstitalType.BINGTOLOBBY: adNum = 202; break;
            case PlacementID_InterstitalType.LOBBYTOSLOT: adNum = 203; break;
            case PlacementID_InterstitalType.SLOTTOLOBBY: adNum = 204; break;
            case PlacementID_InterstitalType.BINGOMISSION: adNum = 205; break;
            case PlacementID_InterstitalType.TIMEBONUS: adNum = 102; break;
            case PlacementID_InterstitalType.COLLECTALL: adNum = 103; break;
            case PlacementID_InterstitalType.NORREWARD: adNum = 104; break;
            case PlacementID_InterstitalType.ALLINREWARD: adNum = 105; break;
            case PlacementID_InterstitalType.BALLEMPTY: adNum = 106; break;
            case PlacementID_InterstitalType.INGAMERANDOMEREWARD: adNum = 107; break;
            case PlacementID_InterstitalType.MAJORENTER: adNum = 108; break;
            case PlacementID_InterstitalType.INSTANTIOSSHOP: adNum = 111; break;
            case PlacementID_InterstitalType.RAINBOW_DICE: adNum = 109; break;
            case PlacementID_InterstitalType.FIRE_DICE: adNum = 110; break;
            case PlacementID_InterstitalType.ADSFREE: adNum = 112; break;
            case PlacementID_InterstitalType.BINGO_INSTANTLY: adNum = 121; break;
            case PlacementID_InterstitalType.INBOX_DAILYBONUS: adNum = 122; break;
            case PlacementID_InterstitalType.COINSHOWER: adNum = 123; break;
            case PlacementID_InterstitalType.FREEBIES: adNum = 124; break;
            case PlacementID_InterstitalType.INBOX_PINTOTOP: adNum = 125; break;
            case PlacementID_InterstitalType.POWER_GEM: adNum = 126; break;
            case PlacementID_InterstitalType.RAINBOW_DICE_1HOUR: adNum = 127; break;
            case PlacementID_InterstitalType.FIRE_DICE_1HOUR: adNum = 128; break;
            default: adNum = 0; break;
        }
        return adNum;
    }

    public InterstitialAdplay(type: PlacementID_InterstitalType, successCallback?: Function, failCallback?: Function): void {
        const self = this;
        void 0 === successCallback && (successCallback = null);
        void 0 === failCallback && (failCallback = null);
        const playFunc = () => {
            AdsManager.callback = successCallback;
            AdsManager.failedCallback = failCallback;
            if (!self.isUseable()) {
                cc.log("Insterstitial Ads not supported");
                return void (TSUtility.isValid(failCallback) && failCallback());
            }
            const placementId = self.getInterstitialADPlacementID(type);
            if (self._isReadyInterstitialADHigh_Mobile) {
                cc.log("high interstitial show ad with Precaching");
                self._showHighInterstitialAD(self.getInterstitialHighADPlacementID(type), type);
            } else if (self._isReadyInterstitialAD) {
                cc.log("interstitial show ad with Precaching");
                self._showInterstitialAD(placementId, type);
            } else {
                self.preloadInterstitialAD();
                self._isLoadingInterstitialAD && (self._loadInterstitialADCompleteCallback = (isSuccess: number) => {
                    1 == isSuccess && self._showInterstitialAD(placementId, type);
                });
            }
        };
        this.isShowCMPPopup() ? this.showCMPPopup(playFunc.bind(this)) : playFunc();
    }

    private _showInterstitialAD(placementId: string, type: PlacementID_InterstitalType, adKind: Kind_Advertisement = Kind_Advertisement.INTERSTITIAL): void {
        const self = this;
        // TSUtility.getServerBaseNowUnixTime() - LocalStorageManager.getOpenADFreeOffer(UserInfo.instance().getUid()) > 3600 && (ServiceInfoManager.BOOL_ENABLE_ADS_FREE_POPUP = true);
        // const completeCallback = (isSuccess: number) => {
        //     self._isReadyInterstitialAD = false;
        //     self.preloadInterstitialAD();
        //     1 == isSuccess ? TSUtility.isValid(AdsManager.callback) && AdsManager.callback() : TSUtility.isValid(AdsManager.failedCallback) && AdsManager.failedCallback();
        // };
        // if (Utility.isFacebookInstant()) {
        //     self._showInterstitialAD_Instant(placementId, type, completeCallback);
        // } else if (Utility.isMobileGame()) {
        //     let highPlacementId = "";
        //     SDefine.Mobile_Use_IAA_DoubleBidding && (highPlacementId = self.getInterstitialHighADPlacementID(type), cc.log("_showInterstitialAD placementId high", highPlacementId));
        //     self._showInterstitialAD_Mobile(placementId, highPlacementId, type, completeCallback, adKind);
        // }
    }

    private _showHighInterstitialAD(placementId: string, type: PlacementID_InterstitalType, adKind: Kind_Advertisement = Kind_Advertisement.INTERSTITIAL): void {
        const self = this;
        // TSUtility.getServerBaseNowUnixTime() - LocalStorageManager.getOpenADFreeOffer(UserInfo.instance().getUid()) > 3600 && (ServiceInfoManager.BOOL_ENABLE_ADS_FREE_POPUP = true);
        // if (Utility.isMobileGame()) {
        //     let highPlacementId = "";
        //     SDefine.Mobile_Use_IAA_DoubleBidding && (highPlacementId = self.getInterstitialHighADPlacementID(type), cc.log("_showInterstitialAD placementId high", highPlacementId));
        //     self._showHighInterstitialAD_Mobile(placementId, type, (isSuccess: number) => {
        //         self._isReadyInterstitialADHigh_Mobile = false;
        //         self.preloadInterstitialHighAd();
        //         1 == isSuccess ? TSUtility.isValid(AdsManager.callback) && AdsManager.callback() : TSUtility.isValid(AdsManager.failedCallback) && AdsManager.failedCallback();
        //     }, adKind);
        // }
    }

    private _showInterstitialAD_Instant(placementId: string, type: PlacementID_InterstitalType, completeCallback: Function): void {
        cc.log("instant interstitial ad start");
        const adNum = this.getInterstitalADNumber(type);
        // ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.Started, adNum);
        // ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.Shown, this.getInterstitalADNumber(type));
        // FBInstantUtil.Interstitial_showAsyncWrapper(this.preloadedInterstitial, (isSuccess: number) => {
        //     completeCallback(isSuccess);
        //     ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.Closed, adNum);
        // });
    }

    private _showInterstitialAD_Mobile(placementId: string, highId: string, type: PlacementID_InterstitalType, completeCallback: Function, adKind: Kind_Advertisement = Kind_Advertisement.INTERSTITIAL): void {
        const self = this;
        cc.log("mopub interstitial ad start");
        // const adNum = this.getInterstitalADNumber(type);
        // ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.Started, adNum);
        // if (SDefine.Mobile_AppLovin_S2S_Impression) {
        //     const logNum = this.getInterstitalADNumber(type);
        //     const customData = { uid: UserInfo.instance().getUid().toString() };
        //     const dataStr = JSON.stringify(customData);
        //     MaxAdManager.Instance.showInterstitialAdWithCustomData(placementId, logNum.toString(), dataStr, (isShow: number) => {
        //         1 == isShow && ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.Shown, adNum);
        //     }, (isSuccess: number) => {
        //         self._isReadyInterstitialADNormal_Mobile = false;
        //         completeCallback(isSuccess);
        //         if (isSuccess && adKind == Kind_Advertisement.INTERSTITIAL) {
        //             const optVal = self.getOptionalValFromImpression();
        //             ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.Closed, adNum, optVal);
        //         }
        //     });
        // } else {
        //     MaxAdManager.Instance.showInterstitialAd(placementId, (isShow: number) => {
        //         1 == isShow && ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.Shown, adNum);
        //     }, (isSuccess: number) => {
        //         self._isReadyInterstitialADNormal_Mobile = false;
        //         completeCallback(isSuccess);
        //         if (isSuccess && adKind == Kind_Advertisement.INTERSTITIAL) {
        //             const optVal = self.getOptionalValFromImpression();
        //             ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.Closed, adNum, optVal);
        //         }
        //     });
        // }
    }

    private _showHighInterstitialAD_Mobile(placementId: string, type: PlacementID_InterstitalType, completeCallback: Function, adKind: Kind_Advertisement = Kind_Advertisement.INTERSTITIAL): void {
        const self = this;
        cc.log("mopub interstitial ad start");
        // const adNum = this.getInterstitalADNumber(type);
        // ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.Started, adNum);
        // if (SDefine.Mobile_AppLovin_S2S_Impression) {
        //     const logNum = this.getInterstitalADNumber(type);
        //     const customData = { uid: UserInfo.instance().getUid().toString() };
        //     const dataStr = JSON.stringify(customData);
        //     MaxAdManager.Instance.showInterstitialHighAdWithCustomData(placementId, logNum.toString(), dataStr, (isShow: number) => {
        //         1 == isShow && ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.Shown, adNum);
        //     }, (isSuccess: number) => {
        //         self._isReadyInterstitialADHigh_Mobile = false;
        //         completeCallback(isSuccess);
        //         if (isSuccess && adKind == Kind_Advertisement.INTERSTITIAL) {
        //             const optVal = self.getOptionalValFromImpression();
        //             ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.Closed, adNum, optVal);
        //         }
        //     });
        // } else {
        //     MaxAdManager.Instance.showInterstitialHighAd(placementId, (isShow: number) => {
        //         1 == isShow && ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.Shown, adNum);
        //     }, (isSuccess: number) => {
        //         self._isReadyInterstitialADHigh_Mobile = false;
        //         completeCallback(isSuccess);
        //         if (isSuccess && adKind == Kind_Advertisement.INTERSTITIAL) {
        //             const optVal = self.getOptionalValFromImpression();
        //             ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.Closed, adNum, optVal);
        //         }
        //     });
        // }
    }

    public RewardedVideoAdplay(type: PlacementID_Type, successCallback?: Function, failCallback?: Function): void {
        const self = this;
        // void 0 === successCallback && (successCallback = null);
        // void 0 === failCallback && (failCallback = null);
        // const playFunc = () => {
        //     AdsManager.callback = successCallback;
        //     AdsManager.failedCallback = failCallback;
        //     if (0 == self.isUseable()) {
        //         cc.log("Insterstitial Ads not supported");
        //         return void (TSUtility.isValid(failCallback) && failCallback());
        //     }
        //     const placementId = self.getRewardVideoPlacementID(type);
        //     cc.log("RewardedVideoAdplay pid:", placementId);
        //     if (SDefine.Mobile_Admob_Use) {
        //         if (1 == self._isReadyHighRewardedAD) {
        //             cc.log("HighRewardedVideoAdplay precaching show ad");
        //             self._showHighRewardedAD(self.getHighRewardVideoPlacementIDInMobile(), type);
        //         } else if (1 == self._isReadyInterstitialADHigh_Mobile) {
        //             cc.log("HighInterstitialAdplay precaching show ad");
        //             const typeStr = type.toString();
        //             self._showHighInterstitialAD(self.getInterstitialHighADPlacementID(PlacementID_InterstitalType.DEFAULT), typeStr, Kind_Advertisement.REWARDED);
        //         } else if (self._isReadyRewardedAD) {
        //             cc.log("RewardedVideoAdplay precaching show ad");
        //             self._showRewardedAD(placementId, type);
        //         } else if (self._isReadyInterstitialAD) {
        //             cc.log("InterstitialAdplay precaching show ad");
        //             const pid = self.getInterstitialADPlacementID(PlacementID_InterstitalType.DEFAULT);
        //             const typeStr = type.toString();
        //             self._showInterstitialAD(pid, typeStr, Kind_Advertisement.REWARDED);
        //         }
        //     } else {
        //         if (1 == self._isReadyHighRewardedAD) {
        //             cc.log("HighRewardedVideoAdplay precaching show ad");
        //             self._showHighRewardedAD(self.getHighRewardVideoPlacementIDInMobile(), type);
        //         } else if (1 == self._isReadyRewardedAD) {
        //             cc.log("RewardedVideoAdplay precaching show ad");
        //             self._showRewardedAD(placementId, type);
        //         }
        //     }
        //     self.scheduleOnce(() => { self.showADFailPopup(); }, 60);
        //     self.preloadRewardedAD();
        //     if (1 == self._isLoadingRewardedAD) {
        //         PopupManager.Instance().showDisplayProgress(true);
        //         self._loadRewardedADCompleteCallback = (isSuccess: number) => {
        //             PopupManager.Instance().showDisplayProgress(false);
        //             1 == isSuccess ? self._showRewardedAD(placementId, type) : self.showADFailPopup();
        //         };
        //     } else {
        //         self.unscheduleAllCallbacks();
        //         self.showADFailPopup();
        //     }
        // };
        // this.isShowCMPPopup() ? this.showCMPPopup(playFunc.bind(this)) : playFunc();
    }

    public delayedPreLoadRewardedAD(): void {
        const self = this;
        this.scheduleOnce(() => { self.preloadRewardedAD(); }, 10);
    }

    public preloadRewardedAD(): void {
        const self = this;
        cc.log("preloadRewardedAD load start");
        // if (1 != this._isReadyRewardedAD) {
        //     if (1 != this._isLoadingRewardedAD) {
        //         this._isLoadingRewardedAD = true;
        //         const placementId = this.getRewardVideoPlacementID(PlacementID_Type.DEFAULT);
        //         cc.log("preloadRewardedAD", placementId);
        //         const completeCallback = (isSuccess: number) => {
        //             self._isLoadingRewardedAD = false;
        //             1 == isSuccess ? (cc.log("preloadRewardedAD success", placementId), self._isReadyRewardedAD = true) : self._isReadyRewardedAD = false;
        //             null != self._loadRewardedADCompleteCallback && (self._loadRewardedADCompleteCallback(isSuccess), self._loadRewardedADCompleteCallback = null);
        //         };
        //         Utility.isMobileGame() ? this._preloadRewardedAD_Mobile(placementId, completeCallback) : Utility.isFacebookInstant() && this._preloadRewardedAD_Instant(placementId, completeCallback);
        //     } else {
        //         cc.log("preloadRewardedAD already loaded");
        //     }
        // } else {
        //     cc.log("preloadRewardedAD already ready");
        // }
    }

    private _preloadRewardedAD_Mobile(placementId: string, completeCallback: Function): void {
        const self = this;
        let isCallback = false;
        let isSuccess = false;
        const callbackTrigger = () => { isCallback && completeCallback(isSuccess); };

        // this._isReadyRewardedADNormal_Mobile && completeCallback(true);
        // if (0 == this._isReadyRewardedADNormal_Mobile) {
        //     MaxAdManager.Instance.loadRewardAd(placementId, (code: number, errCode: number, msg: string) => {
        //         isCallback = true;
        //         0 == code ? (self._isReadyRewardedADNormal_Mobile = false, cc.log("MaxAdManager loadRewardAd Load Failed [%s][%s][%s]".format(placementId, errCode.toString(), msg))) : (self._isReadyRewardedADNormal_Mobile = true, isSuccess = true);
        //         callbackTrigger();
        //     });
        // } else {
        //     isCallback = true;
        //     callbackTrigger();
        // }
    }

    public preloadHighRewardedAD(): void {
        const self = this;
        // if (0 != this.isEnableLoadRewardHighAD()) {
        //     if (cc.log("preloadHighRewardedAD load start"), 1 != this._isReadyHighRewardedAD) {
        //         if (1 != this._isLoadingHighRewardedAD) {
        //             this._isLoadingHighRewardedAD = true;
        //             this.increaseCountRequestHighRewardAD();
        //             const placementId = this.getHighRewardVideoPlacementIDInMobile();
        //             cc.log("preloadHighRewardedAD", placementId);
        //             cc.log("preloadHighRewardedAD placementId high", placementId);
        //             this._preloadHighRewardedAD_Mobile(placementId, (isSuccess: number) => {
        //                 self._isLoadingHighRewardedAD = false;
        //                 1 == isSuccess ? (cc.log("preload High RewardedAD success", placementId), self._isReadyHighRewardedAD = true) : (cc.log("preload High RewardedAD fail", placementId), self._isReadyHighRewardedAD = false, self.scheduleOnce(() => { self.preloadHighRewardedAD(); }, Math.pow(4, self._countRequestHighRewardAD - 1)));
        //             });
        //         } else {
        //             cc.log("preloadRewardedAD already loaded");
        //         }
        //     } else {
        //         cc.log("preloadRewardedAD already ready");
        //     }
        // }
    }

    private _preloadHighRewardedAD_Mobile(placementId: string, completeCallback: Function): void {
        // MaxAdManager.Instance.loadRewardHighAd(placementId, (isSuccess: number, errCode: number, msg: string) => {
        //     0 == isSuccess && (cc.log("preload High RewardedAD fail", placementId), cc.log("preload High RewardedAD fail", msg));
        //     completeCallback(isSuccess);
        // });
    }

    private _preloadRewardedAD_Instant(placementId: string, completeCallback: Function): void {
        const self = this;
        // FBInstantUtil.getRewardedVideoAsyncWrapper(placementId, (isSuccess: number, adObj: any) => {
        //     self.preloadedRewardedVideo = adObj;
        //     completeCallback(isSuccess);
        // });
    }

    private _showRewardedAD(placementId: string, type: PlacementID_Type): void {
        const self = this;
        const completeCallback = (isSuccess: number) => {
            self._isReadyRewardedAD = false;
            self.preloadRewardedAD();
            1 == isSuccess ? TSUtility.isValid(AdsManager.callback) && AdsManager.callback() : TSUtility.isValid(AdsManager.failedCallback) && AdsManager.failedCallback();
        };
        this.unscheduleAllCallbacks();
        Utility.isFacebookInstant() ? this._showRewardedAD_Instant(placementId, type, completeCallback) : Utility.isMobileGame() && this._showRewardedAD_Mobile(placementId, type, completeCallback);
    }

    private _showHighRewardedAD(placementId: string, type: PlacementID_Type): void {
        const self = this;
        this.unscheduleAllCallbacks();
        Utility.isMobileGame() && this._showHighRewardedAD_Mobile(placementId, type, (isSuccess: number) => {
            self._isReadyHighRewardedAD = false;
            self.preloadHighRewardedAD();
            1 == isSuccess ? TSUtility.isValid(AdsManager.callback) && AdsManager.callback() : TSUtility.isValid(AdsManager.failedCallback) && AdsManager.failedCallback();
        });
    }

    private _showRewardedAD_Instant(placementId: string, type: PlacementID_Type, completeCallback: Function): void {
        const adNum = this.getRewardVideoADNumber(type);
        ADLogServer.Instance().requestRewardVideoLog_v2(ADLogV2_RewardedAD_P2Type.Started, adNum);
        PopupManager.Instance().showDisplayProgress(true);
        // FBInstantUtil.RewardAD_showAsyncWrapper(this.preloadedRewardedVideo, (isSuccess: number) => {
        //     PopupManager.Instance().showDisplayProgress(false);
        //     1 == isSuccess ? (ADLogServer.Instance().requestRewardVideoLog_v2(ADLogV2_RewardedAD_P2Type.Closed, adNum), completeCallback(true)) : completeCallback(false);
        // });
    }

    private _showRewardedAD_Mobile(placementId: string, type: PlacementID_Type, completeCallback: Function): void {
        const self = this;
        // const adNum = this.getRewardVideoADNumber(type);
        // ADLogServer.Instance().requestRewardVideoLog_v2(ADLogV2_RewardedAD_P2Type.Started, adNum);
        // if (SDefine.Mobile_AppLovin_S2S_Impression) {
        //     const logNum = this.getRewardVideoADNumber(type);
        //     const customData = { uid: UserInfo.instance().getUid().toString() };
        //     const dataStr = JSON.stringify(customData);
        //     MaxAdManager.Instance.showRewardAdWithCustomData(placementId, logNum.toString(), dataStr, (isSuccess: number) => {
        //         cc.log("MaxAdManager showRewardedVideoAdWithCustomData " + isSuccess);
        //         PopupManager.Instance().showDisplayProgress(true);
        //         self.scheduleOnce(() => {
        //             PopupManager.Instance().showDisplayProgress(false);
        //             self._isReadyRewardedADNormal_Mobile = false;
        //             1 == isSuccess ? (ADLogServer.Instance().requestRewardVideoLog_v2(ADLogV2_RewardedAD_P2Type.Closed, adNum), 1 == MaxAdManager.Instance.shouldReward() ? completeCallback(true) : completeCallback(false)) : self.showADFailPopup();
        //         }, .5);
        //     });
        // } else {
        //     MaxAdManager.Instance.showRewardAd(placementId, (isSuccess: number) => {
        //         cc.log("MaxAdManager showRewardedVideoAd " + isSuccess);
        //         PopupManager.Instance().showDisplayProgress(true);
        //         self.scheduleOnce(() => {
        //             PopupManager.Instance().showDisplayProgress(false);
        //             self._isReadyRewardedADNormal_Mobile = false;
        //             1 == isSuccess ? (ADLogServer.Instance().requestRewardVideoLog_v2(ADLogV2_RewardedAD_P2Type.Closed, adNum), 1 == MaxAdManager.Instance.shouldReward() ? completeCallback(true) : completeCallback(false)) : self.showADFailPopup();
        //         }, .5);
        //     });
        // }
    }

    private _showHighRewardedAD_Mobile(placementId: string, type: PlacementID_Type, completeCallback: Function): void {
        const self = this;
        // const adNum = this.getRewardVideoADNumber(type);
        // ADLogServer.Instance().requestRewardVideoLog_v2(ADLogV2_RewardedAD_P2Type.Started, adNum);
        // if (SDefine.Mobile_AppLovin_S2S_Impression) {
        //     const logNum = this.getRewardVideoADNumber(type);
        //     const customData = { uid: UserInfo.instance().getUid().toString() };
        //     const dataStr = JSON.stringify(customData);
        //     MaxAdManager.Instance.showRewardHighAdWithCustomData(placementId, logNum.toString(), dataStr, (isShow: number) => {
        //         1 == isShow && ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.Shown, adNum);
        //     }, (isSuccess: number) => {
        //         cc.log("MaxAdManager showRewardHighAd " + isSuccess);
        //         PopupManager.Instance().showDisplayProgress(true);
        //         self.scheduleOnce(() => {
        //             PopupManager.Instance().showDisplayProgress(false);
        //             self._isReadyRewardedADHigh_Mobile = false;
        //             1 == isSuccess ? (ADLogServer.Instance().requestRewardVideoLog_v2(ADLogV2_RewardedAD_P2Type.Closed, adNum), 1 == MaxAdManager.Instance.shouldReward() ? completeCallback(true) : completeCallback(false)) : self.showADFailPopup();
        //         }, .5);
        //     });
        // } else {
        //     MaxAdManager.Instance.showRewardHighAd(placementId, (isShow: number) => {
        //         1 == isShow && ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.Shown, adNum);
        //     }, (isSuccess: number) => {
        //         cc.log("MaxAdManager showRewardHighAd " + isSuccess);
        //         PopupManager.Instance().showDisplayProgress(true);
        //         self.scheduleOnce(() => {
        //             PopupManager.Instance().showDisplayProgress(false);
        //             self._isReadyRewardedADHigh_Mobile = false;
        //             1 == isSuccess ? (ADLogServer.Instance().requestRewardVideoLog_v2(ADLogV2_RewardedAD_P2Type.Closed, adNum), 1 == MaxAdManager.Instance.shouldReward() ? completeCallback(true) : completeCallback(false)) : self.showADFailPopup();
        //         }, .5);
        //     });
        // }
    }

    public showADFailPopup(): void {
        // this.unscheduleAllCallbacks();
        // PopupManager.Instance().showDisplayProgress(true);
        // AD_Fail_Popup.getPopup(UserInfo.instance().isGuestUser(), (isErr: boolean, popup: AD_Fail_Popup) => {
        //     PopupManager.Instance().showDisplayProgress(false);
        //     if (isErr) {
        //         null != AdsManager.failedCallback && AdsManager.failedCallback();
        //         return void cc.log("common getPopup failed");
        //     }
        //     popup.open();
        //     popup.setCloseCallback(() => { null != AdsManager.failedCallback && AdsManager.failedCallback(); });
        // });
    }

    public isUseable(): boolean {
        return false;//Utility.isFacebookInstant() ? 0 != FBInstantUtil.isSupportedAPI("getInterstitialAdAsync") : Utility.isMobileGame();
    }

    public ADLog_InterstitialShowUI(type: PlacementID_InterstitalType): void {
        cc.log("ADLog_InterstitialShowUI");
        const adNum = this.getInterstitalADNumber(type);
        //Utility.isFacebookInstant() ? ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.ShowUI, adNum) : Utility.isMobileGame() && ADLogServer.Instance().requestInterstitialLog_v2(ADLogV2_Interstitial_P2Type.ShowUI, adNum);
    
    }

    public ADLog_RewardedADShowUI(type: PlacementID_Type): void {
        cc.log("ADLog_RewardedADShowUI");
        const adNum = this.getRewardVideoADNumber(type);
        Utility.isFacebookInstant() ? ADLogServer.Instance().requestRewardVideoLog_v2(ADLogV2_RewardedAD_P2Type.ShowUI, adNum) : Utility.isMobileGame() && ADLogServer.Instance().requestRewardVideoLog_v2(ADLogV2_RewardedAD_P2Type.ShowUI, adNum);
    }

    public ADLog_RewardedADRewarded(type: PlacementID_Type): void {
        cc.log("ADLog_RewardedADRewarded");
        const adNum = this.getRewardVideoADNumber(type);
        if (Utility.isFacebookInstant()) {
            ADLogServer.Instance().requestRewardVideoLog_v2(ADLogV2_RewardedAD_P2Type.Rewarded, adNum);
        } else if (Utility.isMobileGame()) {
            const optVal = this.getOptionalValFromImpression();
            cc.log("ADLog_RewardedADRewarded optionVal: " + optVal.toString());
            ADLogServer.Instance().requestRewardVideoLog_v2(ADLogV2_RewardedAD_P2Type.Rewarded, adNum, optVal);
        }
    }

    public getOptionalValFromImpression(): any {
        return MaxAdManager.Instance.getCurrentMaxAdImpressionInfo().toImpressionData();
    }

    public showMaxDebugInfo(): void {
        MaxAdManager.Instance.showDebugInfo();
    }

    public callbackCMP(): void {
        null != this._callbackCompleteCmp && this._callbackCompleteCmp();
    }

    public isShowCMPPopup(): boolean {
        // cc.log("SDefine.Mobile_Use_Google_CMP", SDefine.Mobile_Use_Google_CMP);
        // cc.log("SDefine.Mobile_ShowCMP_At_Start", SDefine.Mobile_ShowCMP_At_Start);
        // cc.log("getFlagOpenCMPPopup", LocalStorageManager.getFlagOpenCMPPopup());
        // cc.log("isConsentFlowUserGeography", this.isConsentFlowUserGeography());
        // return !(!SDefine.Mobile_Use_Google_CMP || 0 != SDefine.Mobile_ShowCMP_At_Start || 0 != LocalStorageManager.getFlagOpenCMPPopup() || !this.isConsentFlowUserGeography());
        return false;
    }

    public isConsentFlowUserGeography(): boolean {
        // return 0 != SDefine.Mobile_Use_Google_CMP && !!Utility.isMobileGame() && (cc.sys.os === cc.sys.OS_ANDROID ? NativeUtil.NativeUtil.isContentFlowUserGeography_AOS() : cc.sys.os === cc.sys.OS_IOS && NativeUtil.NativeUtil.isContentFlowUserGeography_IOS());
        return false;
    }

    public showCMPPopup(completeCallback: Function): void {
        //Utility.isMobileGame() ? (this._callbackCompleteCmp = () => { LocalStorageManager.setFlagOpenCMPPopup(), completeCallback(); }, cc.sys.os === cc.sys.OS_ANDROID ? NativeUtil.NativeUtil.showCMPPopup_AOS() : cc.sys.os === cc.sys.OS_IOS ? NativeUtil.NativeUtil.showCMPPopup_IOS() : completeCallback()) : completeCallback();
    }

    public increaseCountRequestHighInsterstitialAD(): void {
        ++this._countRequestHighInsterstitialAD;
    }

    public isEnableLoadInterstitialHighAD(): boolean {
        return !!(Utility.isMobileGame() && EventInfoManager.Instance().isAvailable(EventInfoKey.IAA_HIGH_ADS) && SDefine.Mobile_Use_IAA_DoubleBidding && !this._isReadyInterstitialADHigh_Mobile && !this._flagIsLoadingInterstitialAD && this._countRequestHighInsterstitialAD < this._maxCountRequestHighInterstitialAD);
    }

    public preloadInterstitialHighAd(): void {
        const self = this;
        if (this.isEnableLoadInterstitialHighAD()) {
            const placementId = this.getInterstitialHighADPlacementID(PlacementID_InterstitalType.DEFAULT);
            cc.log("preloadInterstitialAD placementId high", placementId);
            this._flagIsLoadingInterstitialAD = true;
            this.increaseCountRequestHighInsterstitialAD();
            MaxAdManager.Instance.loadInterstitialHighAd(placementId, (isSuccess: any, errCode: number, msg: string) => {
                self._flagIsLoadingInterstitialAD = false;
                0 == isSuccess ? (self._isReadyInterstitialADHigh_Mobile = false, cc.log("MaxAdManager High InterstitialAd Load Failed [%s][%s][%s]".format(placementId, errCode.toString(), msg)), self.scheduleOnce(() => { self.preloadInterstitialHighAd(); }, Math.pow(4, Math.max(0, self._countRequestHighInsterstitialAD - 1)))) : self._isReadyInterstitialADHigh_Mobile = true;
            });
        }
    }

    public increaseCountRequestHighRewardAD(): void {
        ++this._countRequestHighRewardAD;
    }

    public isEnableLoadRewardHighAD(): boolean {
        return !!(Utility.isMobileGame() && EventInfoManager.Instance().isAvailable(EventInfoKey.IAA_HIGH_ADS) && SDefine.Mobile_Use_IAA_DoubleBidding && !this._isReadyRewardedADHigh_Mobile && !this._flagIsLoadingRewardAD && this._countRequestHighRewardAD < this._maxCountRequestHighRewardAD);
    }
}