import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";

/**
 * 设备信息本地存储类
 */
export class LocalDeviceInfo {
    public lastLoginType: number = 0;  // 最后登录类型
    public udid: string | undefined;   // 设备唯一标识

    /**
     * 保存设备信息到本地存储
     */
    public saveToStorage(): void {
       cc.sys.localStorage.setItem("DeviceInfo", JSON.stringify(this));
    }
}

/**
 * 用户登录信息本地存储类
 */
export class LocalUserLoginInfo {
    public udid: string = "";              // 设备唯一标识
    public uid: number = 0;                // 用户ID
    public paToken: string = "";           // 登录Token
    public paTokenExpireDate: number = 0;  // Token过期时间（时间戳）

    /**
     * 校验登录信息是否有效
     * @returns true=有效，false=无效
     */
    public IsValid(): boolean {
        if (!this.udid || this.udid === "") {
            cc.log("udid invalid");
            return false;
        }
        if (!this.uid || this.uid === 0) {
            cc.log("uid invalid");
            return false;
        }
        if (!this.paToken || this.paToken === "") {
            cc.log("paToken invalid");
            return false;
        }
        const currentTime = Utility.getUnixTimestamp();
        if (!this.paTokenExpireDate || (this.paTokenExpireDate - currentTime) < 2592000) { // 30天 = 2592000秒
            cc.log("expireDate invalid");
            return false;
        }
        return true;
    }
}

/**
 * 系统配置信息本地存储类
 */
export class LocalSystemInfo {
    public mainBgmOnOff: boolean = true;        // 主BGM开关
    public effectSoundOnOff: boolean = true;    // 音效开关
    public notificationOnOff: boolean = true;   // 通知开关
    public shareOnOff: boolean = true;          // 分享开关
    public inGameShareOnOff: boolean = true;    // 游戏内分享开关
    public mainBgmVolume: number = 0.7;         // 主BGM音量
    public effectSoundVolume: number = 0.7;     // 音效音量

    /**
     * 保存系统配置到本地存储
     */
    public saveToStorage(): void {
        cc.sys.localStorage.setItem("SystemInfo", JSON.stringify(this));
    }
}

/**
 * 用户选项信息本地存储类
 */
export class LocalOptionInfo {
    public lastCasinoZone: number = 0;                  // 最后进入的赌场区域
    public lastInboxShowDate: number = 0;               // 最后显示收件箱的时间
    public lastDailyShortcutPopupDate: number = 0;      // 最后显示每日快捷弹窗的时间
    public lastAllinOfferZoneDates: number[] = [0, 0, 0];// 最后显示全押优惠区域的时间
    public lastAttendShopPopupData: number = 0;         // 最后显示签到商店弹窗的时间
    public lastAllinOfferDate: number = 0;              // 最后显示全押优惠的时间
    public firtMemberDate: number = 0;                  // 首次成为会员的时间
    public lastFastMode: number = 0;                    // 最后使用快速模式的时间
    public lastCardPackX2OfferDate: number = 0;         // 最后显示双倍卡包优惠的时间
    public lastCollectionSeasonEndPopupDate: number = 0;// 最后显示收藏赛季结束弹窗的时间
    public lastHeroOpenEventPopupDate: number = 0;      // 最后显示英雄开启事件弹窗的时间

    constructor() {
        this.lastAllinOfferZoneDates = [];
    }
}

/**
 * 调试模式信息本地存储类
 */
export class LocalDebugModeInfo {
    public isDebugMode: boolean = false;        // 是否开启调试模式
    public commonServerIp: string = "";         // 通用服务器IP
    public logServerIp: string = "";            // 日志服务器IP
    public mobileClientResVersion: number = 0;  // 移动端资源版本

    /**
     * 保存调试模式配置到本地存储
     */
    public saveToStorage(): void {
        cc.sys.localStorage.setItem("DeveloperDebug", JSON.stringify(this));
    }

    /**
     * 从对象解析调试模式信息
     * @param obj 原始对象
     * @returns 调试模式信息实例
     */
    public static parseObj(obj: any): LocalDebugModeInfo {
        const info = new LocalDebugModeInfo();
        if (obj === null) {
            info.isDebugMode = false;
            info.commonServerIp = "";
            info.logServerIp = "";
            info.mobileClientResVersion = 0;
        } else {
            info.isDebugMode = obj.isDebugMode;
            info.commonServerIp = obj.commonServerIp;
            info.logServerIp = obj.logServerIp;
            if (obj.mobileClientResVersion) {
                info.mobileClientResVersion = obj.mobileClientResVersion;
            }
        }
        return info;
    }
}

/**
 * Google Play 购买信息本地存储类
 */
export class LocalPlayStorePurchaseInfo {
    public productId: string = "";    // 产品ID
    public playstoreId: string = "";  // Play商店ID
    public popupType: string = "";    // 弹窗类型
    public extraInfo: string = "";    // 额外信息
    public randomKey: string = "";    // 随机密钥

    /**
     * 从对象解析Play商店购买信息
     * @param obj 原始对象
     * @returns Play商店购买信息实例
     */
    public static parseObj(obj: any): LocalPlayStorePurchaseInfo {
        const info = new LocalPlayStorePurchaseInfo();
        if (obj.productId) info.productId = obj.productId;
        if (obj.playstoreId) info.playstoreId = obj.playstoreId;
        if (obj.popupType) info.popupType = obj.popupType;
        if (obj.extraInfo) info.extraInfo = obj.extraInfo;
        if (obj.randomKey) info.randomKey = obj.randomKey;
        return info;
    }
}

/**
 * iOS AppStore 购买信息本地存储类
 */
export class LocalIOSPurchaseInfo {
    public productId: string = "";    // 产品ID
    public appstoreId: string = "";   // AppStore ID
    public popupType: string = "";    // 弹窗类型
    public extraInfo: string = "";    // 额外信息
    public buyMoney: number = 0;      // 购买金额
    public buyCurrency: string = "";  // 购买货币类型
    public randomKey: string = "";    // 随机密钥

    /**
     * 获取产品ID
     * @returns 产品ID
     */
    public getProductId(): string {
        return this.productId;
    }

    /**
     * 从对象解析iOS购买信息
     * @param obj 原始对象
     * @returns iOS购买信息实例
     */
    public static parseObj(obj: any): LocalIOSPurchaseInfo {
        const info = new LocalIOSPurchaseInfo();
        info.productId = obj.productId;
        info.appstoreId = obj.appstoreId;
        info.popupType = obj.popupType;
        info.extraInfo = obj.extraInfo;
        info.buyMoney = obj.buyMoney;
        info.buyCurrency = obj.buyCurrency;
        if (obj.randomKey) info.randomKey = obj.randomKey;
        return info;
    }
}

/**
 * CF加速信息本地存储类
 */
export class LocalCFAccelerationInfo {
    public useCF: boolean = false;    // 是否使用CF加速
    public lastCheckDate: number = 0; // 最后检查时间（时间戳）

    /**
     * 保存CF加速信息到本地存储
     */
    public saveToStorage(): void {
        cc.sys.localStorage.setItem("CFAcceleration", JSON.stringify(this));
    }

    /**
     * 设置是否使用CF加速
     * @param useCF 是否使用
     */
    public setUseCF(useCF: boolean): void {
        this.useCF = useCF;
        this.lastCheckDate = Utility.getUnixTimestamp();
        this.saveToStorage();
    }

    /**
     * 检查CF加速信息是否过期（7天 = 604800秒）
     * @returns true=过期，false=未过期
     */
    public isExpire(): boolean {
        return this.lastCheckDate + 604800 < Utility.getUnixTimestamp();
    }
}

/**
 * 本地存储管理核心类（单例模式，所有方法为静态）
 */
export default class LocalStorageManager {
    // ================= 静态属性 =================
    private static _userData: LocalDeviceInfo | null = null;               // 设备信息
    private static _userLoginData: LocalUserLoginInfo | null = null;       // 用户登录信息
    private static _systemData: LocalSystemInfo | null = null;             // 系统配置信息
    private static _optionInfo: LocalOptionInfo | null = null;             // 用户选项信息
    private static _optionUid: number = 0;                                 // 用户选项关联的UID
    private static _lastADWatchTime: number = 0;                           // 最后观看广告时间
    private static _botTime: number = 0;                                   // Bot时间
    private static _openVipBooster: boolean = false;                       // 是否打开VIP booster
    private static _isOpenGoleBoost: boolean = false;                      // 是否打开黄金boost
    private static _isOpenPlatinumBoost: boolean = false;                  // 是否打开铂金boost
    private static _isOpenTourneyInfoTooltip: boolean | null = null;       // 是否打开锦标赛提示
    private static _debugMode: LocalDebugModeInfo | null = null;           // 调试模式信息
    private static _cfAcceleration: LocalCFAccelerationInfo | null = null; // CF加速信息
    private static _isTrackMistPlay: boolean = false;                      // 是否跟踪MistPlay
    private static _subKey: string = "";                                   // 子键

    // ================= 子键管理 =================
    /**
     * 设置子键
     * @param subKey 子键值
     */
    public static setSubKey(subKey: string): void {
        LocalStorageManager._subKey = subKey;
    }

    /**
     * 获取子键
     * @returns 子键值
     */
    public static getSubKey(): string {
        return LocalStorageManager._subKey;
    }

    // ================= 核心工具方法 =================
    /**
     * 带异常处理的JSON解析
     * @param jsonStr JSON字符串
     * @param tag 日志标签（用于定位错误）
     * @returns 解析后的对象或null
     */
    private static jsonParseWithExceptionHandling(jsonStr: string | null, tag: string): any {
        let result = null;
        try {
            if (jsonStr) {
                result = JSON.parse(jsonStr);
            }
        } catch (err) {
            cc.error(`JSON.parse fail: [${jsonStr}][${tag}]`);
            result = null;
        }
        return result;
    }

    // ================= 设备信息管理 =================
    /**
     * 获取本地设备信息
     * @returns 设备信息实例
     */
    public static getLocalDeviceInfo(): LocalDeviceInfo {
        if (!LocalStorageManager._userData) {
            LocalStorageManager.loadDeviceInfoFromStorage();
        }
        return LocalStorageManager._userData!;
    }

    /**
     * 从本地存储加载设备信息
     */
    private static loadDeviceInfoFromStorage(): void {
        const jsonStr = cc.sys.localStorage.getItem("DeviceInfo");
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(jsonStr, "loadDeviceInfoFromStorage");
        
        if (obj === null) {
            LocalStorageManager._userData = new LocalDeviceInfo();
            LocalStorageManager._userData.lastLoginType = 0;
            LocalStorageManager._userData.udid = undefined;
        } else {
            LocalStorageManager._userData = new LocalDeviceInfo();
            LocalStorageManager._userData.lastLoginType = obj.lastLoginType;
            LocalStorageManager._userData.udid = obj.udid;
        }
    }

    /**
     * 从本地存储移除设备信息
     */
    public static removeDeviceInfoFromStorage(): void {
        cc.sys.localStorage.removeItem("DeviceInfo");
    }

    // ================= 用户登录信息管理 =================
    /**
     * 获取本地用户登录信息
     * @returns 登录信息实例或null
     */
    public static getLocalUserLoginInfo(): LocalUserLoginInfo | null {
        if (!LocalStorageManager._userLoginData) {
            LocalStorageManager.loadUserLoginInfoFromStorage();
        }
        return LocalStorageManager._userLoginData;
    }

    /**
     * 从本地存储加载用户登录信息
     * @returns true=加载成功，false=加载失败
     */
    private static loadUserLoginInfoFromStorage(): boolean {
        const jsonStr = cc.sys.localStorage.getItem("UserLoginInfo");
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(jsonStr, "loadUserLoginInfoFromStorage");
        
        if (obj !== null) {
            LocalStorageManager._userLoginData = new LocalUserLoginInfo();
            LocalStorageManager._userLoginData.udid = obj.udid;
            LocalStorageManager._userLoginData.uid = obj.uid;
            LocalStorageManager._userLoginData.paToken = obj.paToken;
            LocalStorageManager._userLoginData.paTokenExpireDate = obj.paTokenExpireDate;
            return true;
        }
        return false;
    }

    /**
     * 设置本地用户登录信息
     * @param loginInfo 登录信息实例
     */
    public static setLocalUserLoginInfo(loginInfo: LocalUserLoginInfo): void {
        LocalStorageManager._userLoginData = loginInfo;
        cc.sys.localStorage.setItem("UserLoginInfo", JSON.stringify(loginInfo));
    }

    /**
     * 重置登录类型
     */
    public static resetLoginType(): void {
        const deviceInfo = LocalStorageManager.getLocalDeviceInfo();
        deviceInfo.lastLoginType = 0;
        deviceInfo.saveToStorage();
    }

    /**
     * 设置登录类型为Facebook
     */
    public static setLoginTypeFacebook(): void {
        if (!SDefine.Use_Mobile_Auth_v2) {
            const deviceInfo = LocalStorageManager.getLocalDeviceInfo();
            deviceInfo.lastLoginType = SDefine.LOGINTYPE_FACEBOOK;
            deviceInfo.saveToStorage();
        }
    }

    /**
     * 清空本地用户登录信息
     */
    public static clearLocalUserLoginInfo(): void {
        LocalStorageManager._userLoginData = null;
        cc.sys.localStorage.removeItem("UserLoginInfo");
    }

    // ================= 系统配置信息管理 =================
    /**
     * 获取本地系统配置信息
     * @returns 系统配置实例
     */
    public static getLocalSystemInfo(): LocalSystemInfo {
        if (!LocalStorageManager._systemData) {
            LocalStorageManager.loadSystemInfoFromStorage();
        }
        return LocalStorageManager._systemData!;
    }

    /**
     * 从本地存储加载系统配置信息
     */
    private static loadSystemInfoFromStorage(): void {
        const jsonStr = cc.sys.localStorage.getItem("SystemInfo");
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(jsonStr, "loadSystemInfoFromStorage");
        
        if (obj === null) {
            LocalStorageManager._systemData = new LocalSystemInfo();
            LocalStorageManager._systemData.mainBgmOnOff = true;
            LocalStorageManager._systemData.effectSoundOnOff = true;
            LocalStorageManager._systemData.notificationOnOff = true;
            LocalStorageManager._systemData.shareOnOff = true;
            LocalStorageManager._systemData.inGameShareOnOff = true;
            LocalStorageManager._systemData.saveToStorage();
        } else {
            LocalStorageManager._systemData = new LocalSystemInfo();
            LocalStorageManager._systemData.mainBgmOnOff = obj.mainBgmOnOff;
            LocalStorageManager._systemData.effectSoundOnOff = obj.effectSoundOnOff;
            LocalStorageManager._systemData.notificationOnOff = obj.notificationOnOff;
            LocalStorageManager._systemData.shareOnOff = obj.shareOnOff ?? true;
            LocalStorageManager._systemData.inGameShareOnOff = obj.inGameShareOnOff ?? true;
            LocalStorageManager._systemData.mainBgmVolume = obj.mainBgmVolume ?? 0.7;
            LocalStorageManager._systemData.effectSoundVolume = obj.effectSoundVolume ?? 0.7;
        }
    }

    // ================= 用户选项信息管理 =================
    /**
     * 获取本地用户选项信息
     * @param uid 用户ID
     * @returns 用户选项实例
     */
    public static getLocalUserOptionInfo(uid: any): LocalOptionInfo {
        LocalStorageManager._optionUid = uid;
        if (!LocalStorageManager._optionInfo || LocalStorageManager._optionUid !== uid) {
            LocalStorageManager.loadOptionInfoFromStorage(uid);
        }
        return LocalStorageManager._optionInfo!;
    }

    /**
     * 从本地存储加载用户选项信息
     * @param uid 用户ID
     */
    private static loadOptionInfoFromStorage(uid: number): void {
        const key = `OptionInfo_${uid}`;
        const jsonStr = cc.sys.localStorage.getItem(key);
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(jsonStr, "loadOptionInfoFromStorage");
        
        if (obj === null) {
            LocalStorageManager._optionInfo = new LocalOptionInfo();
            LocalStorageManager._optionInfo.lastCasinoZone = 0;
            LocalStorageManager._optionInfo.lastInboxShowDate = 0;
            LocalStorageManager._optionInfo.lastDailyShortcutPopupDate = 0;
            LocalStorageManager._optionInfo.lastAllinOfferZoneDates = [0, 0, 0];
            LocalStorageManager._optionInfo.lastAttendShopPopupData = 0;
            LocalStorageManager._optionInfo.lastAllinOfferDate = 0;
            LocalStorageManager._optionInfo.firtMemberDate = 0;
            LocalStorageManager._optionInfo.lastFastMode = 0;
            LocalStorageManager._optionInfo.lastCardPackX2OfferDate = 0;
            LocalStorageManager._optionInfo.lastCollectionSeasonEndPopupDate = 0;
            LocalStorageManager._optionInfo.lastHeroOpenEventPopupDate = 0;
        } else {
            LocalStorageManager._optionInfo = new LocalOptionInfo();
            LocalStorageManager._optionInfo.lastCasinoZone = obj.lastCasinoZone;
            LocalStorageManager._optionInfo.lastInboxShowDate = obj.lastInboxShowDate ?? 0;
            LocalStorageManager._optionInfo.lastDailyShortcutPopupDate = obj.lastDailyShortcutPopupDate ?? 0;
            LocalStorageManager._optionInfo.lastAllinOfferZoneDates = [0, 0, 0];
            LocalStorageManager._optionInfo.lastAttendShopPopupData = obj.lastAttendShopPopupData ?? 0;
            LocalStorageManager._optionInfo.lastAllinOfferDate = obj.lastAllinOfferDate ?? 0;
            LocalStorageManager._optionInfo.firtMemberDate = obj.firtMemberDate ?? 0;
            LocalStorageManager._optionInfo.lastFastMode = obj.lastFastMode ?? 0;
            LocalStorageManager._optionInfo.lastCardPackX2OfferDate = obj.lastCardPackX2OfferDate ?? 0;
            LocalStorageManager._optionInfo.lastCollectionSeasonEndPopupDate = obj.lastCollectionSeasonEndPopupDate ?? 0;
            LocalStorageManager._optionInfo.lastHeroOpenEventPopupDate = obj.lastHeroOpenEventPopupDate ?? 0;
        }
    }

    /**
     * 保存用户选项信息到本地存储
     * @param uid 用户ID
     */
    public static saveUserOptionInfoToStorage(uid: any): void {
        if (LocalStorageManager._optionInfo && LocalStorageManager._optionUid === uid) {
            const key = `OptionInfo_${uid}`;
            cc.sys.localStorage.setItem(key, JSON.stringify(LocalStorageManager._optionInfo));
        } else {
            cc.log("saveUserOptionInfoToStorage is invalid");
        }
    }

    // ================= CF加速信息管理 =================
    /**
     * 获取本地CF加速信息
     * @returns CF加速信息实例
     */
    public static getLocalCFAccelerationInfo(): LocalCFAccelerationInfo {
        if (!LocalStorageManager._cfAcceleration) {
            LocalStorageManager.loadLocalCFAccelerationInfoFromStorage();
        }
        return LocalStorageManager._cfAcceleration!;
    }

    /**
     * 从本地存储加载CF加速信息
     */
    private static loadLocalCFAccelerationInfoFromStorage(): void {
        const jsonStr = cc.sys.localStorage.getItem("CFAcceleration");
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(jsonStr, "loadLocalCFAccelerationInfoFromStorage");
        
        if (obj === null) {
            LocalStorageManager._cfAcceleration = new LocalCFAccelerationInfo();
            LocalStorageManager._cfAcceleration.useCF = false;
            LocalStorageManager._cfAcceleration.lastCheckDate = 0;
        } else {
            LocalStorageManager._cfAcceleration = new LocalCFAccelerationInfo();
            LocalStorageManager._cfAcceleration.useCF = obj.useCF;
            LocalStorageManager._cfAcceleration.lastCheckDate = obj.lastCheckDate;
        }
    }

    // ================= 调试模式管理 =================
    /**
     * 判断是否开启调试模式
     * @returns true=开启，false=关闭
     */
    public static isDebugMode(): boolean {
        if (LocalStorageManager._debugMode === null) {
            const jsonStr = cc.sys.localStorage.getItem("DeveloperDebug");
            const obj = LocalStorageManager.jsonParseWithExceptionHandling(jsonStr, "isDebugMode");
            LocalStorageManager._debugMode = LocalDebugModeInfo.parseObj(obj);
        }
        return LocalStorageManager._debugMode.isDebugMode;
    }

    /**
     * 获取调试模式信息
     * @returns 调试模式信息实例
     */
    public static getDebugModeInfo(): LocalDebugModeInfo {
        if (LocalStorageManager._debugMode === null) {
            const jsonStr = cc.sys.localStorage.getItem("DeveloperDebug");
            const obj = LocalStorageManager.jsonParseWithExceptionHandling(jsonStr, "getDebugModeInfo");
            LocalStorageManager._debugMode = LocalDebugModeInfo.parseObj(obj);
        }
        return LocalStorageManager._debugMode;
    }

    /**
     * 清空调试模式信息
     */
    public static clearDebugMode(): void {
        LocalStorageManager._debugMode = null;
        cc.sys.localStorage.removeItem("DeveloperDebug");
    }

    // ================= 购买信息管理（Google Play） =================
    /**
     * 设置Play商店购买信息
     * @param productId 产品ID
     * @param playstoreId Play商店ID
     * @param popupType 弹窗类型
     * @param extraInfo 额外信息
     */
    public static setPlaystorePurchaseInfo(productId: string, playstoreId: string, popupType: string, extraInfo: string): void {
        const info = new LocalPlayStorePurchaseInfo();
        info.productId = productId;
        info.playstoreId = playstoreId;
        info.popupType = popupType;
        info.extraInfo = extraInfo;
        cc.sys.localStorage.setItem("PlaystorePurchase", JSON.stringify(info));
    }

    /**
     * 获取Play商店购买信息
     * @returns Play商店购买信息实例或null
     */
    public static getPlaystorePurchaseInfo(): LocalPlayStorePurchaseInfo | null {
        const jsonStr = cc.sys.localStorage.getItem("PlaystorePurchase");
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(jsonStr, "getPlaystorePurchaseInfo");
        return obj === null ? null : LocalPlayStorePurchaseInfo.parseObj(obj);
    }

    /**
     * 重置Play商店购买信息
     */
    public static resetPlaystorePurchaseInfo(): void {
        cc.sys.localStorage.removeItem("PlaystorePurchase");
    }

    /**
     * 设置Play商店续费购买信息
     * @param key 自定义键
     * @param info 购买信息
     */
    public static setPlaystorePurchaseInfo_Renewal(key: string, info: any): void {
        const storageKey = `AOS_PurchaseInfo_${key}`;
        cc.log(`setPlaystorePurchaseInfo_Renewal key: ${storageKey}`);
        cc.sys.localStorage.setItem(storageKey, JSON.stringify(info));
    }

    /**
     * 获取Play商店续费购买信息
     * @param key 自定义键
     * @returns 购买信息实例或null
     */
    public static getPlaystorePurchaseInfo_Renewal(key: string): LocalPlayStorePurchaseInfo | null {
        const storageKey = `AOS_PurchaseInfo_${key}`;
        cc.log(`getPlaystorePurchaseInfo_Renewal key: ${storageKey}`);
        const jsonStr = cc.sys.localStorage.getItem(storageKey);
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(jsonStr, "getPlaystorePurchaseInfo_Renewal");
        return obj === null ? null : LocalPlayStorePurchaseInfo.parseObj(obj);
    }

    /**
     * 重置Play商店续费购买信息
     * @param key 自定义键
     */
    public static resetPlaystorePurchaseInfo_Renewal(key: string): void {
        const storageKey = `AOS_PurchaseInfo_${key}`;
        cc.sys.localStorage.removeItem(storageKey);
    }

    // ================= 购买信息管理（iOS） =================
    /**
     * 设置iOS购买信息
     * @param productId 产品ID
     * @param appstoreId AppStore ID
     * @param popupType 弹窗类型
     * @param extraInfo 额外信息
     * @param buyMoney 购买金额
     * @param buyCurrency 购买货币
     */
    public static setIOSPurchaseInfo(
        productId: string,
        appstoreId: string,
        popupType: string,
        extraInfo: string,
        buyMoney: number,
        buyCurrency: string
    ): void {
        const info = new LocalIOSPurchaseInfo();
        info.productId = productId;
        info.appstoreId = appstoreId;
        info.popupType = popupType;
        info.extraInfo = extraInfo;
        info.buyMoney = buyMoney;
        info.buyCurrency = buyCurrency;
        cc.sys.localStorage.setItem("IOSAppstorePurcahse", JSON.stringify(info));
    }

    /**
     * 获取iOS购买信息
     * @returns iOS购买信息实例或null
     */
    public static getIOSPurchaseInfo(): LocalIOSPurchaseInfo | null {
        const jsonStr = cc.sys.localStorage.getItem("IOSAppstorePurcahse");
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(jsonStr, "getIOSPurchaseInfo");
        return obj === null ? null : LocalIOSPurchaseInfo.parseObj(obj);
    }

    /**
     * 重置iOS购买信息
     */
    public static resetIOSPurchaseInfo(): void {
        cc.sys.localStorage.removeItem("IOSAppstorePurcahse");
    }

    /**
     * 设置iOS续费购买信息
     * @param key 自定义键
     * @param info 购买信息
     */
    public static setIOSPurchaseInfo_Renewal(key: string, info: any): void {
        const storageKey = `IOS_PurchaseInfo_${key}`;
        cc.log(`setIOSPurchaseInfo_Renewal key: ${storageKey}`);
        cc.sys.localStorage.setItem(storageKey, JSON.stringify(info));
    }

    /**
     * 获取iOS续费购买信息
     * @param key 自定义键
     * @returns 购买信息实例或null
     */
    public static getIOSPurchaseInfo_Renewal(key: string): LocalIOSPurchaseInfo | null {
        const storageKey = `IOS_PurchaseInfo_${key}`;
        cc.log(`getIOSPurchaseInfo_Renewal key: ${storageKey}`);
        const jsonStr = cc.sys.localStorage.getItem(storageKey);
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(jsonStr, "getIOSPurchaseInfo_Renewal");
        return obj === null ? null : LocalIOSPurchaseInfo.parseObj(obj);
    }

    /**
     * 重置iOS续费购买信息
     * @param key 自定义键
     */
    public static resetIOSPurchaseInfo_Renewal(key: string): void {
        const storageKey = `IOS_PurchaseInfo_${key}`;
        cc.sys.localStorage.removeItem(storageKey);
    }

    // ================= 其他通用存储方法（保留原有所有逻辑） =================
    /**
     * 设置Bot时间
     * @param key 自定义键
     */
    public static SetLocalBotTime(key: string): void {
        const storageKey = `BotTime_${key}`;
        cc.sys.localStorage.setItem(storageKey, Utility.getUnixTimestamp().toString());
    }

    /**
     * 获取Bot时间
     * @param key 自定义键
     * @returns Bot时间戳
     */
    public static getLocalBotTime(key: string): number {
        if (!LocalStorageManager._botTime) {
            LocalStorageManager.loadBotTimefoFromStorage(key);
        }
        return LocalStorageManager._botTime;
    }

    /**
     * 从本地存储加载Bot时间
     * @param key 自定义键
     */
    private static loadBotTimefoFromStorage(key: string): void {
        const storageKey = `BotTime_${key}`;
        const jsonStr = cc.sys.localStorage.getItem(storageKey);
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(jsonStr, "loadBotTimefoFromStorage");
        LocalStorageManager._botTime = obj === null ? 0 : obj;
    }

    /**
     * 兼容旧方法：设置Bot时间
     * @param key 自定义键
     */
    public static SetBotTime(key: string): void {
        LocalStorageManager.SetLocalBotTime(key);
    }

    /**
     * 判断是否打开锦标赛提示
     * @param key 自定义键
     * @returns true=已打开，false=未打开
     */
    public static getIsOpenTourneyInfoTooltip(key: string): boolean {
        if (LocalStorageManager._isOpenTourneyInfoTooltip === null) {
            const storageKey = `OpenTourneyInfoTooltip_${key}`;
            const value = cc.sys.localStorage.getItem(storageKey);
            LocalStorageManager._isOpenTourneyInfoTooltip = value !== null && value !== "";
        }
        return LocalStorageManager._isOpenTourneyInfoTooltip;
    }

    /**
     * 设置打开锦标赛提示
     * @param key 自定义键
     */
    public static setIsOpenTourneyInfoTooltip(key: string): void {
        LocalStorageManager._isOpenTourneyInfoTooltip = true;
        const storageKey = `OpenTourneyInfoTooltip_${key}`;
        cc.sys.localStorage.setItem(storageKey, "1");
    }

    /**
     * 设置移动端Facebook合并用户标记
     */
    public static setMobileFacebookMergeUser(): void {
        cc.sys.localStorage.setItem("MobileFacebookMergeUser", "1");
    }

    /**
     * 判断是否是移动端Facebook合并用户
     * @returns true=是，false=否
     */
    public static isMobileFacebookMergeUser(): boolean {
        const value = cc.sys.localStorage.getItem("MobileFacebookMergeUser");
        return value !== null && value === "1";
    }

    /**
     * 清空移动端Facebook合并用户标记
     */
    public static clearMobileFacebookMergeUser(): void {
        cc.sys.localStorage.removeItem("MobileFacebookMergeUser");
    }

    /**
     * 判断是否首次打开条款弹窗
     * @returns true=是，false=否
     */
    public static isOpenFirstTermsPopup(): boolean {
        const value = cc.sys.localStorage.getItem("FirstTermsPopup");
        return !!value && value === "1";
    }

    /**
     * 设置首次打开条款弹窗标记
     */
    public static setOpenFirstTermsPopup(): void {
        cc.sys.localStorage.setItem("FirstTermsPopup", "1");
    }

    /**
     * 判断是否是App首次启动
     * @returns true=是，false=否
     */
    public static isFirstAppLaunch(): boolean {
        const appFirstLaunch = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem("AppFirstLaunch"),
            "isFirstAppLaunch"
        );
        if (appFirstLaunch === null) {
            cc.sys.localStorage.setItem("AppFirstLaunch", "false");
        }
        return cc.sys.localStorage.getItem("UserLoginInfo") === null;
    }

    // ========== 以下为原有其他所有存储方法，仅补充类型注解，逻辑完全保留 ==========
    public static SetLocalOpenVipBooster(key: string, value: any): void {
        const storageKey = `VipBoosterOpen_${key}`;
        cc.sys.localStorage.setItem(storageKey, value);
    }

    public static SetLocalOpenShortcutLobby(key: string): void {
        const storageKey = `ShortCutOpenLobby_${key}`;
        cc.sys.localStorage.setItem(storageKey, "true");
    }

    public static GetLocalOpenShortcutLobby(key: string): boolean {
        const storageKey = `ShortCutOpenLobby_${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "GetLocalOpenShortcutLobby"
        );
        return obj !== null && obj;
    }

    public static SetLocalOpenShortcutBigwin(key: string): void {
        const storageKey = `ShortCutOpenBigwin_${key}`;
        cc.sys.localStorage.setItem(storageKey, "true");
    }

    public static GetLocalOpenShortcutBigwin(key: string): boolean {
        const storageKey = `ShortCutOpenBigwin_${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "GetLocalOpenShortcutBigwin"
        );
        return obj !== null && obj;
    }

    public static getLocalLikeOpenLvel(key: string): number {
        const storageKey = `LikePopupOpen_${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getLocalLikeOpenLvel"
        );
        return obj === null ? 0 : obj;
    }

    public static SetLocalLikeOpenLevel(key: string, value: number): void {
        const storageKey = `LikePopupOpen_${key}`;
        cc.sys.localStorage.setItem(storageKey, value.toString());
    }

    public static getLocalSaveAndFollowOpenLvel(key: string): number {
        const storageKey = `SaveAndFollowPopupOpenLevel_${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getLocalSaveAndFollowOpenLvel"
        );
        return obj === null ? 0 : obj;
    }

    public static setLocalSaveAndFollowOpenLevel(key: string, value: number): void {
        const storageKey = `SaveAndFollowPopupOpenLevel_${key}`;
        cc.sys.localStorage.setItem(storageKey, value.toString());
    }

    public static getLocalSaveAndFollowOpenTime(key: string): number {
        const storageKey = `SaveAndFollowPopupOpenTime_${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getLocalSaveAndFollowOpenTime"
        );
        return obj === null ? 0 : obj;
    }

    public static setLocalSaveAndFollowOpenTime(key: string): void {
        const storageKey = `SaveAndFollowPopupOpenTime_${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getFirstMissionStart(key: string): boolean {
        const storageKey = `FirstMissionStart_${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getFirstMissionStart"
        );
        return obj !== null && obj;
    }

    public static SetFirstMissionStart(key: string): void {
        const storageKey = `FirstMissionStart_${key}`;
        cc.sys.localStorage.setItem(storageKey, "true");
    }

    public static getNormalADViewTime(key: string): number {
        const storageKey = `NoramlADView_${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getNormalADViewTime"
        );
        return obj === null ? 0 : obj.third;
    }

    public static SetNormalADViewTime(key: string): void {
        const storageKey = `NoramlADView_${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "SetNormalADViewTime"
        );
        const data = obj === null ? {
            first: TSUtility.getServerBaseNowUnixTime(),
            second: 0,
            third: 0
        } : {
            first: TSUtility.getServerBaseNowUnixTime(),
            second: obj.first,
            third: obj.second
        };
        cc.sys.localStorage.setItem(storageKey, JSON.stringify(data));
    }

    public static getAllinADViewTime(key: string): number {
        const storageKey = `AllinADViewTime${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getAllinADViewTime"
        );
        return obj === null ? 0 : obj.third;
    }

    public static SetAllinADViewTime(key: string): void {
        const storageKey = `AllinADViewTime${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "SetAllinADViewTime"
        );
        const data = obj === null ? {
            first: TSUtility.getServerBaseNowUnixTime(),
            second: 0,
            third: 0
        } : {
            first: TSUtility.getServerBaseNowUnixTime(),
            second: obj.first,
            third: obj.second
        };
        cc.sys.localStorage.setItem(storageKey, JSON.stringify(data));
    }

    public static getAllinADViewTimeForiOSInstant(key: string): number {
        const storageKey = `AllinADViewTime_iOSInstant${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getAllinADViewTimeForiOSInstant"
        );
        return obj === null ? 0 : obj.fifth;
    }

    public static setAllinADViewTimeForiOSInstant(key: string): void {
        const storageKey = `AllinADViewTime_iOSInstant${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "setAllinADViewTimeForiOSInstant"
        );
        const data = obj === null ? {
            first: TSUtility.getServerBaseNowUnixTime(),
            second: 0,
            third: 0,
            forth: 0,
            fifth: 0
        } : {
            first: TSUtility.getServerBaseNowUnixTime(),
            second: obj.first,
            third: obj.second,
            forth: obj.third,
            fifth: obj.forth
        };
        cc.sys.localStorage.setItem(storageKey, JSON.stringify(data));
    }

    public static getNormalLastADView(key: string): number {
        const storageKey = `NormalLastADView${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getNormalLastADView"
        );
        return obj === null ? 0 : obj;
    }

    public static SetNormalLastADView(key: string): void {
        const storageKey = `NormalLastADView${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getLanguage(): number {
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem("LANGUAGE"),
            "getLanguage"
        );
        return obj === null ? -1 : obj;
    }

    public static setLanguage(value: number): void {
        cc.sys.localStorage.setItem("LANGUAGE", value.toString());
    }

    public static getAllInLastADView(key: string): number {
        const storageKey = `AllInLastADView${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "SetNormalLastADView"
        );
        return obj === null ? 0 : obj;
    }

    public static SetAllInLastADView(key: string): void {
        const storageKey = `AllInLastADView${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getBingoLastADView(key: string): number {
        const storageKey = `BingoLastADView${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getBingoLastADView"
        );
        return obj === null ? 0 : obj;
    }

    public static SetBingoLastADView(key: string): void {
        const storageKey = `BingoLastADView${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static setViewTimebonusAD(key: string, value: any): void {
        const storageKey = `ViewTimebonusAD${key}`;
        cc.sys.localStorage.setItem(storageKey, value);
    }

    public static getViewTimebonusAD(key: string): boolean {
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(`ViewTimebonusAD${key}`),
            "getViewTimebonusAD"
        );
        return obj !== null && obj;
    }

    public static setUserUID(value: string): void {
        cc.sys.localStorage.setItem("userID", value);
    }

    public static getUserUID(): string | null {
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem("userID"),
            "getUserUID"
        );
        return obj === null ? null : obj;
    }

    public static setAccessToken(value: string): void {
        cc.sys.localStorage.setItem("AToken", value);
    }

    public static getAccessToken(): string | null {
        const value = cc.sys.localStorage.getItem("AToken");
        return value === null ? null : value;
    }

    public static setOpenUpdatePopup(key: string): void {
        const storageKey = `OpenUpdatePopup${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getOpenUpdatePopup(key: string): number {
        const storageKey = `OpenUpdatePopup${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOpenUpdatePopup"
        );
        return obj === null ? 0 : obj;
    }

    public static setOpenMobileInstall(key: string): void {
        const storageKey = `OpenMobileInstall${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getOpenMobileInstall(key: string): number {
        const storageKey = `OpenMobileInstall${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOpenMobileInstall"
        );
        return obj === null ? 0 : obj;
    }

    public static setOpenFBLoginGuide(key: string): void {
        const storageKey = `OpenFBLoginGuide${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getOpenFBLoginGuide(key: string): number {
        const storageKey = `OpenFBLoginGuide${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOpenFBLoginGuide"
        );
        return obj === null ? 0 : obj;
    }

    public static setOpenAstroRollerOpenPopup(key: string): void {
        const storageKey = `OpenAstroRollerOpenPopup${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getOpenAstroRollerOpenPopup(key: string): number {
        const storageKey = `OpenAstroRollerOpenPopup${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOpenAstroRollerOpenPopup"
        );
        return obj === null ? 0 : obj;
    }

    public static setMinigameHist(key: string, value: number): void {
        const storageKey = `MiniGameHist${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "setMinigameHist"
        );
        const data = obj === null ? [0, 0] : obj;
        data[0] = data[1];
        data[1] = value;
        cc.sys.localStorage.setItem(storageKey, JSON.stringify(data));
    }

    public static getMinigameHist(key: string): number[] {
        const storageKey = `MiniGameHist${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getMinigameHist"
        );
        return obj === null ? [0, 0] : obj;
    }

    public static setOfferPopupKind(): void {
        const storageKey = `OfferPopupKind${LocalStorageManager.getSubKey()}`;
        const value = Math.floor(2 * Math.random()) + 1;
        cc.sys.localStorage.setItem(storageKey, value.toString());
    }

    public static getOfferPopupKind(key: string): number {
        const storageKey = `OfferPopupKind${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOfferPopupKind"
        );
        return obj === null ? 1 : (obj <= 1 ? 1 : 2);
    }

    public static setOpenSMCrossPopup(): void {
        const storageKey = `OpenSMCrossPopup${LocalStorageManager.getSubKey()}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getOpenSMCrossPopup(): number {
        const storageKey = `OpenSMCrossPopup${LocalStorageManager.getSubKey()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOpenSMCrossPopup"
        );
        return obj === null ? 0 : obj;
    }

    public static setDonwShowAgainCross(): void {
        const time = TSUtility.getPstToUtcTimestamp(Date.UTC(2023, 1, 22, 23, 59, 59) / 1000);
        const storageKey = `OpenSMCrossPopup${LocalStorageManager.getSubKey()}`;
        cc.sys.localStorage.setItem(storageKey, time.toString());
    }

    public static setMasinShopScrollviewLastPositionY(value: number): void {
        const storageKey = `MasinShopScrollviewLastPositionY${LocalStorageManager.getSubKey()}`;
        cc.sys.localStorage.setItem(storageKey, value.toString());
    }

    public static getMasinShopScrollviewLastPositionY(): number | null {
        const storageKey = `MasinShopScrollviewLastPositionY${LocalStorageManager.getSubKey()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getMasinShopScrollviewLastPositionY"
        );
        return obj === null ? null : obj;
    }

    public static setUpdateReward(value: number): void {
        cc.sys.localStorage.setItem("CompulsionUpdate", value.toString());
    }

    public static getUpdateReward(): number {
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem("CompulsionUpdate"),
            "getUpdateReward"
        );
        return obj === null ? -1 : obj;
    }

    public static setTimbonusADTime(value: number): void {
        const storageKey = `TimbonusADtIME${LocalStorageManager.getSubKey()}`;
        cc.sys.localStorage.setItem(storageKey, value.toString());
    }

    public static getTimbonusADTime(): number {
        const storageKey = `TimbonusADtIME${LocalStorageManager.getSubKey()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getTimbonusADTime"
        );
        return obj === null ? 0 : obj;
    }

    public static setOpenStayStrongPopup(): void {
        const storageKey = `OpenStayStrongPopup${LocalStorageManager.getSubKey()}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getOpenStayStrongPopup(): number {
        const storageKey = `OpenStayStrongPopup${LocalStorageManager.getSubKey()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOpenStayStrongPopup"
        );
        return obj === null ? 0 : obj;
    }

    public static setLevelUpEventPopup(): void {
        const storageKey = `LevelUpEventPopup${LocalStorageManager.getSubKey()}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getLevelUpEventPopup(): number {
        const storageKey = `LevelUpEventPopup${LocalStorageManager.getSubKey()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getLevelUpEventPopup"
        );
        return obj === null ? 0 : obj;
    }

    public static setFirstLevelUpEventPopup(): void {
        const storageKey = `LevelUpEventPopupFirst${LocalStorageManager.getSubKey()}`;
        cc.sys.localStorage.setItem(storageKey, "true");
    }

    public static getFirstLevelUpEventPopup(): boolean {
        const storageKey = `LevelUpEventPopupFirst${LocalStorageManager.getSubKey()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getFirstLevelUpEventPopup"
        );
        return obj !== null;
    }

    public static setLevelUpPassPopup(): void {
        const storageKey = `LevelUpEventPopup${LocalStorageManager.getSubKey()}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getLevelUpPassPopup(): number {
        const storageKey = `LevelUpEventPopup${LocalStorageManager.getSubKey()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getLevelUpEventPopup"
        );
        return obj === null ? 0 : obj;
    }

    public static setFirstLevelUpPassPopup(): void {
        const storageKey = `LevelUpEventPopupFirst${LocalStorageManager.getSubKey()}`;
        cc.sys.localStorage.setItem(storageKey, "true");
    }

    public static getFirstLevelUpPassPopup(): boolean {
        const storageKey = `LevelUpEventPopupFirst${LocalStorageManager.getSubKey()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getFirstLevelUpEventPopup"
        );
        return obj !== null;
    }

    public static setPopupStorePopupOpen(): void {
        const storageKey = `popupsStorePopupOpen${LocalStorageManager.getSubKey()}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getPopupStorePopupOpen(): number {
        const storageKey = `popupsStorePopupOpen${LocalStorageManager.getSubKey()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getPopupStorePopupOpen"
        );
        return obj === null ? 0 : obj;
    }

    public static setLastOpenNewslotPopup(value: number): void {
        const storageKey = `lastOpenNewslotPopup${LocalStorageManager.getSubKey()}`;
        cc.sys.localStorage.setItem(storageKey, value.toString());
    }

    public static getLastOpenNewslotPopup(): number {
        const storageKey = `lastOpenNewslotPopup${LocalStorageManager.getSubKey()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getLastOpenNewslotPopup"
        );
        return obj === null ? 0 : obj;
    }

    public static setPopupStorePopup(): void {
        const storageKey = `popupStorePopupKind${LocalStorageManager.getSubKey()}`;
        const value = Math.floor(2 * Math.random());
        cc.sys.localStorage.setItem(storageKey, value.toString());
    }

    public static getPopupStorePopup(): number {
        const storageKey = `popupStorePopupKind${LocalStorageManager.getSubKey()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getPopupStorePopup"
        );
        return obj === null ? 0 : obj;
    }

    public static getDailyTopUpOpenTime(key: string): number {
        const storageKey = `dailyTopUpOpenTime_${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getDailyTopUpOpenTime"
        );
        return obj === null ? 0 : obj;
    }

    public static setDailyTopUpOpenTime(key: string, value: number): void {
        const storageKey = `dailyTopUpOpenTime_${key}`;
        cc.sys.localStorage.setItem(storageKey, value.toString());
    }

    public static setFirstDailyBlitzPopup(): void {
        const storageKey = `FirstDailyBlitzPopup${LocalStorageManager.getSubKey()}`;
        cc.sys.localStorage.setItem(storageKey, "true");
    }

    public static getFirstDailyBlitzPopup(): boolean {
        const storageKey = `FirstDailyBlitzPopup${LocalStorageManager.getSubKey()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getFirstDailyBlitzPopup"
        );
        return obj === null;
    }

    public static setOpenStarAlbum(key: string): void {
        const storageKey = `OpenStarAlbum${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getOpenStarAlbum(key: string): number {
        const storageKey = `OpenStarAlbum${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOpenStarAlbum"
        );
        return obj === null ? 0 : obj;
    }

    public static setOpenBigwinOffer(key: string): void {
        const storageKey = `OpenBigwinOffer${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static setOpenBigwinOfferWithTime(time: number, key: string): void {
        const storageKey = `OpenBigwinOffer${key}`;
        cc.sys.localStorage.setItem(storageKey, time.toString());
    }

    public static getOpenBigwinOffer(key: string): number {
        const storageKey = `OpenBigwinOffer${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOpenBigwinOffer"
        );
        return obj === null ? 0 : obj;
    }

    public static setOpenADFreeOffer(key: string): void {
        const storageKey = `OpenADFreeOffer${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getOpenADFreeOffer(key: string): number {
        const storageKey = `OpenADFreeOffer${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOpenADFreeOffer"
        );
        return obj === null ? 0 : obj;
    }

    public static setOpendIngameCardpackTooltip(key: string): void {
        const storageKey = `OpendCardpackTooltip${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getOpendIngameCardpackTooltip(key: string): number {
        const storageKey = `OpendCardpackTooltip${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOpendIngameCardpackTooltip"
        );
        return obj === null ? 0 : obj;
    }

    public static setOpendIngameJiggyPuzzleTooltip(key: string): void {
        const storageKey = `OpendJiggyPuzzleTooltip_2023_winter${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getOpendIngameJiggyPuzzleTooltip(key: string): number {
        const storageKey = `OpendJiggyPuzzleTooltip_2023_winter${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOpendIngameJiggyPuzzleTooltip"
        );
        return obj === null ? 0 : obj;
    }

    public static setOpendIngameBlitzTooltip(key: string): void {
        const storageKey = `OpendIngameBlitzTooltip${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static resetsetOpendIngameBlitzTooltip(key: string): void {
        const storageKey = `OpendIngameBlitzTooltip${key}`;
        cc.sys.localStorage.setItem(storageKey, "0");
    }

    public static getOpendIngameBlitzTooltip(key: string): number {
        const storageKey = `OpendIngameBlitzTooltip${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOpendIngameBlitzTooltip"
        );
        return obj === null ? 0 : obj;
    }

    public static setOpendLobbyCardpackTooltip(key: string): void {
        const storageKey = `OpendLobbyCardpackTooltip${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getOpendLobbyCardpackTooltip(key: string): number {
        const storageKey = `OpendLobbyCardpackTooltip${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOpendLobbyCardpackTooltip"
        );
        return obj === null ? 0 : obj;
    }

    public static setOpendLobbyMissionTooltip(key: string): void {
        const storageKey = `OpendLobbyMissionTooltip${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getOpendLobbyMissionTooltip(key: string): number {
        const storageKey = `OpendLobbyMissionTooltip${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOpendLobbyMissionTooltip"
        );
        return obj === null ? 0 : obj;
    }

    public static setOpendSecrectDealMainPopup(key: string): void {
        const storageKey = `OpendSecrectDealMainPopup${key}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getOpendSecrectDealMainPopup(key: string): number {
        const storageKey = `OpendSecrectDealMainPopup${key}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getOpendSecrectDealMainPopup"
        );
        return obj === null ? 0 : obj;
    }

    public static setSeasonEndOfferKind(key: string): void {
        const storageKey = `SeasonEndOfferKind${key}`;
        LocalStorageManager.getSeasonEndOfferKind();
        cc.sys.localStorage.setItem(storageKey, "0");
    }

    public static getSeasonEndOfferKind(): number {
        return 0;
    }

    public static setTDJTooltipTime(): void {
        const storageKey = `TDJTooltipTime${LocalStorageManager.getSubKey()}`;
        cc.sys.localStorage.setItem(storageKey, TSUtility.getServerBaseNowUnixTime().toString());
    }

    public static getTDJTooltipTime(): number {
        const storageKey = `TDJTooltipTime${LocalStorageManager.getSubKey()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getTDJTooltipTime"
        );
        return obj === null ? 0 : obj;
    }

    public static setShowTermsPopoup(key: number): void {
        const storageKey = `ShowTermsPopoup${key.toString()}`;
        cc.sys.localStorage.setItem(storageKey, "true");
    }

    public static getShowTermsPopoup(key: number): boolean {
        const storageKey = `ShowTermsPopoup${key.toString()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getShowTermsPopoup"
        );
        return obj !== null;
    }

    public static setDailyBlitzToolTipTime(value: number): void {
        const storageKey = `dailyBlitzTooltipTime${LocalStorageManager.getSubKey()}`;
        cc.sys.localStorage.setItem(storageKey, value.toString());
    }

    public static getDailyBlitzToolTipTime(): number {
        const storageKey = `dailyBlitzTooltipTime${LocalStorageManager.getSubKey()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "getShowTermsPopoup"
        );
        return obj === null ? 0 : obj;
    }

    public static SetTrackMistPlay(value: boolean): void {
        cc.sys.localStorage.setItem("TrackMistPlay", value.toString());
    }

    public static GetTrackMistPlay(): boolean {
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem("TrackMistPlay"),
            "GetTrackMistPlay"
        );
        LocalStorageManager._isTrackMistPlay = obj !== null && obj;
        return Utility.isMobileGame() && cc.sys.os === "ios" && LocalStorageManager._isTrackMistPlay;
    }

    public static setFlagOpenCMPPopup(): void {
        const storageKey = `flagOpenCMPPopup${LocalStorageManager.getSubKey()}`;
        cc.sys.localStorage.setItem(storageKey, "true");
    }

    public static getFlagOpenCMPPopup(): boolean {
        const storageKey = `flagOpenCMPPopup${LocalStorageManager.getSubKey()}`;
        const obj = LocalStorageManager.jsonParseWithExceptionHandling(
            cc.sys.localStorage.getItem(storageKey),
            "flagOpenCMPPopup"
        );
        return obj !== null && obj;
    }


    
    public static setEndTimeShowMembersClassBoostUpCenterEffect = function(t, n) {
        var o = "showMembersClassBoostUpCenterEffect_" + t + "_" + LocalStorageManager.getSubKey();
        cc.sys.localStorage.setItem(o, n)
    }
    
    public static getEndTimeShowMembersClassBoostUpExpandCenterEffect = function(t) {
        var n = "showMembersClassBoostUpCenterEffect_" + t + "_" + LocalStorageManager.getSubKey()
          , o = LocalStorageManager.jsonParseWithExceptionHandling(cc.sys.localStorage.getItem(n), "showMembersClassBoostUpCenterEffect");
        return null == o ? 0 : o
    }
    
    public static setEndTimeShowAlmightyCouponCenterEffect = function(t, n) {
        var o = "showAlmightyCouponCenterEffect_" + t + "_" + LocalStorageManager.getSubKey();
        cc.sys.localStorage.setItem(o, n)
    }
    
    public static getEndTimeShowAlmightyCouponCenterEffect = function(t) {
        var n = "showAlmightyCouponCenterEffect_" + t + "_" + LocalStorageManager.getSubKey()
          , o = LocalStorageManager.jsonParseWithExceptionHandling(cc.sys.localStorage.getItem(n), "showAlmightyCouponCenterEffect");
        return null == o ? 0 : o
    }
    
    public static setMultiBalanceName = function(t, n) {
        var a = "MultiBalanceName_" + t + "_" + LocalStorageManager.getSubKey();
        !TSUtility.isValid(n) || "" == n ? cc.sys.localStorage.removeItem(a) : cc.sys.localStorage.setItem(a, n)
    }

    public static getMultiBalanceName = function(t) {
        var n = "MultiBalanceName_" + t + "_" + LocalStorageManager.getSubKey()
          , a = cc.sys.localStorage.getItem(n);
        return TSUtility.isValid(a) ? a : null
    }


}