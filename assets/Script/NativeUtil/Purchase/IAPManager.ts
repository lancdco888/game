// IAPManager.ts
const { ccclass } = cc._decorator;
import TSUtility from "../../global_utility/TSUtility";
import NativeUtil from "../../global_utility/NativeUtil";

/**
 * 【全局导出】安卓GooglePlay 官方计费错误码枚举 (核心)
 * 与 IAPManager_AOS.ts 中调用的错误码完全匹配，原数值一字未改
 */
export enum AOS_BILLING_ERRCODE {
    SERVICE_TIMEOUT = -3,        // 服务超时
    FEATURE_NOT_SUPPORTED = -2,  // 功能不支持
    SERVICE_DISCONNECTED = -1,   // 服务断开连接
    OK = 0,                      // 成功/无错误
    USER_CANCELED = 1,           // 用户取消支付
    SERVICE_UNAVAILABLE = 2,     // 服务不可用
    BILLING_UNAVAILABLE = 3,     // 计费服务不可用(设备未开通)
    ITEM_UNAVAILABLE = 4,        // 商品下架/区域不可用
    DEVELOPER_ERROR = 5,         // 开发者配置错误(密钥/商品ID)
    ERROR = 6,                   // 通用错误
    ITEM_ALREADY_OWNED = 7,      // 商品已拥有(非消耗品重复购买)
    ITEM_NOT_OWNED = 8           // 商品未拥有(无法消费/恢复)
}

/**
 * 谷歌订单凭证信息模型
 */
export class PlayStorePurchaseReceipt {
    public productId: string = "";
    public packageName: string = "";
    public purchaseToken: string = "";

    public static parseObj(obj: any): PlayStorePurchaseReceipt {
        const info = new PlayStorePurchaseReceipt();
        info.productId = obj.productId;
        info.packageName = obj.packageName;
        info.purchaseToken = obj.purchaseToken;
        return info;
    }
}

/**
 * 谷歌购买商品请求参数模型
 */
export class PlayStoreBuyProductReq { }

/**
 * 谷歌订单历史记录模型
 */
export class PlaystorePurchaseHistory {
    public productId: string = "";
    public purchaseToken: string = "";

    public static parseObj(obj: any): PlaystorePurchaseHistory {
        const info = new PlaystorePurchaseHistory();
        if (obj.productId) info.productId = obj.productId;
        if (obj.purchaseToken) info.purchaseToken = obj.purchaseToken;
        return info;
    }
}

/**
 * iOS AppStore 购买商品请求参数模型
 */
export class IOSAppstoreBuyProductReq { }

/**
 * 谷歌商店商品详情信息模型 (核心)
 */
export class PlayStoreSkuDetailInfo {
    public productId: string = "";
    public type: string = "";
    public title: string = "";
    public name: string = "";
    public price: string = "";
    public price_amount_micros: number = 0;
    public price_currency_code: string = "";
    public skuDetailsToken: string = "";

    /**
     * 格式化商品价格 (微单位转正常价格)
     * 谷歌价格单位是微币，需要除以1e6 保留4位小数
     */
    public getFormattedPriceAmount(): number {
        return Math.round(this.price_amount_micros / 1000000 * 10000) / 10000;
    }

    /**
     * 对象数据解析
     */
    public static parseObj(obj: any): PlayStoreSkuDetailInfo {
        if (!obj) {
            cc.error("PlayStoreSkuDetailInfo obj is null");
            return null;
        }
        const info = new PlayStoreSkuDetailInfo();
        TSUtility.copyValueObjToObj(obj, info, "productId");
        TSUtility.copyValueObjToObj(obj, info, "type");
        TSUtility.copyValueObjToObj(obj, info, "title");
        TSUtility.copyValueObjToObj(obj, info, "name");
        TSUtility.copyValueObjToObj(obj, info, "price");
        TSUtility.copyValueObjToObj(obj, info, "price_amount_micros");
        TSUtility.copyValueObjToObj(obj, info, "price_currency_code");
        TSUtility.copyValueObjToObj(obj, info, "skuDetailsToken");
        return info;
    }
}

/**
 * 内购核心公共管理类 (IAPManager)
 * Cocos Creator 2.4.13 TypeScript 完整版
 * 核心职责：统一管理安卓/iOS内购入口、双内购模式切换(SDKBox/原生)、公共内购方法封装、全局回调管理
 * 是整个游戏内购体系的父类，被 IAPManager_AOS/IAPManager_iOS 依赖调用
 */
@ccclass
export default class IAPManager {
    // ===================== 静态常量 & 单例 =====================
    private static _instance: IAPManager = null;
    public static AOS_V4_BILLING_USE: boolean = false; // 安卓原生V4计费开关 true=原生桥接 false=SDKBox
    private static _isInit: boolean = false;           // 初始化状态标记

    /** 标准单例 - 全局唯一实例 */
    public static Instance(): IAPManager {
        if (!this._instance) {
            this._instance = new IAPManager();
            this._instance.init();
        }
        return this._instance;
    }

    /** 检测是否已初始化 */
    public static isInit(): boolean {
        return IAPManager._isInit;
    }

    /** 外部调用初始化入口 */
    public static Init(): void {
        IAPManager.Instance();
    }

    // ===================== 成员属性 =====================
    private _onPurchaseCallback: (res?: any, errMsg?: string) => void = null;
    private _onPurchaseHistoryCallback: (data?: string) => void = null;

    // 私有构造函数 禁止外部实例化
    private constructor() { }

    // ===================== 核心生命周期 =====================
    /** 初始化内购核心逻辑 */
    public init(): void {
        IAPManager._isInit = true;
        cc.log("IAPManager Init");

        // 仅移动端初始化内购 网页端报错
        if (Utility.isMobileGame() !== 0) {
            // 安卓平台 - 开启原生V4计费模式
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                cc.log("Use IAPManager.AOS_V4_BILLING_USE");
                IAPManager.AOS_V4_BILLING_USE = true;
            }
            
            // 双模式切换：原生V4计费 / SDKBox内购
            if (IAPManager.AOS_V4_BILLING_USE === false) {
                this._initUseSDKBox();
            } else {
                this._initUseNativeAOS();
            }
        } else {
            cc.error("IAPManager isFacebookWeb is true");
        }
    }

    /** 销毁内购监听 - 页面销毁/游戏退出时调用 */
    public Destroy(): void {
        if (IAPManager.AOS_V4_BILLING_USE === false && typeof sdkbox !== "undefined" && sdkbox.IAP) {
            sdkbox.IAP.setListener({
                onSuccess: null,
                onFailure: null,
                onCanceled: null,
                onPurchaseHistory: null,
                onDeferred: null,
                onRestored: null,
                onProductRequestSuccess: null,
                onProductRequestFailure: null,
                onRestoreComplete: null,
                onConsumed: null,
                onShouldAddStorePayment: null
            });
        }
    }

    // ===================== 双内购模式初始化 =====================
    /** 初始化 SDKBox 内购 (兼容安卓/iOS 旧版内购) */
    private _initUseSDKBox(): void {
        if (typeof sdkbox !== "undefined" && typeof sdkbox.IAP !== "undefined") {
            // 开启用户侧校验
            sdkbox.IAP.enableUserSideVerification(true);
            
            // iOS 延迟支付回调注册
            if (cc.sys.os === cc.sys.OS_IOS) {
                nativeJSBridge.addBridgeCallback("onPurchaseDeferred", this._onPurchaseDeferred.bind(this));
            }

            // 设置SDKBox内购全回调监听
            sdkbox.IAP.setListener({
                onSuccess: this.onSuccess.bind(this),
                onFailure: this.onFailure.bind(this),
                onCanceled: this.onCanceled.bind(this),
                onPurchaseHistory: this.onPurchaseHistory.bind(this),
                onDeferred: this.onDeferred.bind(this),
                onRestored: (res) => { cc.log("onRestored " + JSON.stringify(res)); },
                onProductRequestSuccess: (res) => { cc.log("onProductRequestSuccess " + JSON.stringify(res)); },
                onProductRequestFailure: (err) => { cc.log("onProductRequestFailure " + err); },
                onRestoreComplete: (flag, res) => { cc.log("onRestoreComplete " + flag + " " + JSON.stringify(res)); },
                onConsumed: (res, err) => { cc.log("onConsumed " + JSON.stringify(res) + " err: " + err); },
                onShouldAddStorePayment: (res) => { cc.log("onShouldAddStorePayment " + res); }
            });

            sdkbox.IAP.setDebug(true);
            sdkbox.IAP.init(undefined);
        } else {
            cc.error("IAP is not found");
        }
    }

    /** 初始化 安卓原生V4 Billing内购 (新版谷歌计费，核心推荐) */
    private _initUseNativeAOS(): void {
        cc.log("_initUseNativeAOS start");
        if (cc.sys.os !== cc.sys.OS_ANDROID) return;

        // 注册安卓原生内购桥接回调
        nativeJSBridge.addBridgeCallback("onIAPSuccess", this._onSuccess_AOS.bind(this));
        nativeJSBridge.addBridgeCallback("onIAPPurchaseHistory", this._onPurchaseHistory_AOS.bind(this));
        nativeJSBridge.addBridgeCallback("onIAPCanceled", this._onCanceled_AOS.bind(this));
        nativeJSBridge.addBridgeCallback("onIAPFailed", this._onFailure_AOS.bind(this));

        // 安卓内购商品ID列表 原数据完全保留
        const productConfig = {
            productInfo: [
                "product_1", "product_2", "product_3", "product_4", "product_5", "product_6", "product_7", "product_8", "product_9", "product_10",
                "product_11", "product_12", "product_13", "product_14", "product_15", "product_16", "product_17", "product_18", "product_19", "product_20",
                "product_22", "product_24", "product_25", "product_26", "product_28", "product_30", "product_35", "product_40", "product_45", "product_50",
                "product_55", "product_60", "product_65", "product_70", "product_75", "product_80", "product_85", "product_90", "product_95", "product_100",
                "product_120", "product_150", "product_200", "product_250", "product_300", "product_360", "product_400"
            ]
        };
        cc.log("_initUseNativeAOS info", JSON.stringify(productConfig));
        NativeUtil.initSkuInfo_AOS(JSON.stringify(productConfig));
    }

    // ===================== 安卓原生内购 回调方法 =====================
    private _onSuccess_AOS(_event: string, data: string): void {
        cc.log("_onIAPSuccess_AOS " + data);
        if (this._onPurchaseCallback) {
            const result = { receipt: data };
            this._onPurchaseCallback(result);
            this._onPurchaseCallback = null;
        }
    }

    private _onCanceled_AOS(): void {
        cc.log("_onCanceled_AOS");
        if (this._onPurchaseCallback) {
            this._onPurchaseCallback(null, "cancel");
            this._onPurchaseCallback = null;
        }
    }

    private _onPurchaseHistory_AOS(_event: string, data: string): void {
        cc.log("onPurchaseHistory " + data);
        if (this._onPurchaseHistoryCallback) {
            this._onPurchaseHistoryCallback(data);
            this._onPurchaseHistoryCallback = null;
        }
    }

    private _onFailure_AOS(_event: string, errMsg: string, errCode: number, productId: string): void {
        cc.log("onFailure " + productId + "/" + errMsg + "/" + errCode);
        // 商品已拥有 自动完成交易
        if (cc.sys.os === cc.sys.OS_ANDROID && errCode === AOS_BILLING_ERRCODE.ITEM_ALREADY_OWNED) {
            this.finishTransaction(productId);
        }
        if (this._onPurchaseCallback) {
            this._onPurchaseCallback(null, errMsg);
            this._onPurchaseCallback = null;
        }
    }

    // ===================== 公共内购方法 (对外核心调用) =====================
    /**
     * 发起商品购买 (统一入口)
     * @param productId 商品ID
     * @param callback 购买结果回调
     */
    public purchase(productId: string, callback: (res?: any, errMsg?: string) => void): void {
        this._onPurchaseCallback = callback;
        if (IAPManager.AOS_V4_BILLING_USE === false) {
            sdkbox.IAP.purchase(productId);
        } else {
            this._purcahse_AOS(productId);
        }
    }

    /** 安卓原生购买调用 */
    private _purcahse_AOS(productId: string): void {
        NativeUtil.purchaseProduct_AOS(productId);
    }

    // ===================== SDKBox 内购 回调方法 =====================
    public onSuccess(res: any): void {
        cc.log("onSuccess " + JSON.stringify(res));
        if (this._onPurchaseCallback) {
            this._onPurchaseCallback(res);
            this._onPurchaseCallback = null;
        }
    }

    public onFailure(res: any, errMsg: string): void {
        cc.log("onFailure " + JSON.stringify(res) + "/" + errMsg);
        // 安卓商品已拥有 自动完成交易
        if (cc.sys.os === cc.sys.OS_ANDROID && errMsg === "7 item already owned") {
            sdkbox.IAP.finishTransaction(res.name);
        }
        if (this._onPurchaseCallback) {
            this._onPurchaseCallback(null, errMsg);
            this._onPurchaseCallback = null;
        }
    }

    public onCanceled(res: any): void {
        cc.log("onCanceled " + JSON.stringify(res));
        if (this._onPurchaseCallback) {
            this._onPurchaseCallback(null, "cancel");
            this._onPurchaseCallback = null;
        }
    }

    public onDeferred(res: any): void {
        cc.log("onDeferred " + JSON.stringify(res));
        if (this._onPurchaseCallback) {
            this._onPurchaseCallback(null, "deferred");
            this._onPurchaseCallback = null;
        }
    }

    private _onPurchaseDeferred(): void {
        cc.log("_onPurchaseDeferred");
        if (this._onPurchaseCallback) {
            this._onPurchaseCallback(null, "purchaseDeferred");
            this._onPurchaseCallback = null;
        }
    }

    public onPurchaseHistory(data: string): void {
        cc.log("onPurchaseHistory " + data);
        if (this._onPurchaseHistoryCallback) {
            this._onPurchaseHistoryCallback(data);
            this._onPurchaseHistoryCallback = null;
        }
    }

    // ===================== 核心工具方法 =====================
    /**
     * 完成交易/消费订单 (统一入口)
     * - 安卓原生：消费订单token
     * - SDKBox/iOS：完成交易收尾
     * - iOS必须调用、安卓消耗品必须调用，否则无法重复购买
     */
    public finishTransaction(productId: string): void {
        if (IAPManager.AOS_V4_BILLING_USE === false) {
            sdkbox.IAP.finishTransaction(productId);
        } else {
            NativeUtil.consumeProduct_AOS(productId);
        }
    }

    /**
     * 获取安卓商品详情信息
     * @param productId 商品ID
     * @returns 格式化后的商品详情模型
     */
    public getSkuDetailInfo_AOS(productId: string): PlayStoreSkuDetailInfo {
        const skuJson = NativeUtil.getSkuInfo_AOS(productId);
        if (TSUtility.isValid(skuJson) || skuJson === "") {
            cc.error("getSkuDetailInfo_AOS fail1", skuJson);
            return null;
        }

        const skuObj = TSUtility.jsonParseWithExceptionHandling(skuJson);
        if (!skuObj) {
            cc.error("getSkuDetailInfo_AOS fail2", skuJson);
            return null;
        }
        return PlayStoreSkuDetailInfo.parseObj(skuObj);
    }

    /**
     * 【异步】查询谷歌商店订单历史 (统一入口)
     * @param productId 商品ID
     * @returns 匹配的订单信息/null
     */
    public async asyncGetPlaystorePurchaseHistory(productId: string): Promise<PlaystorePurchaseHistory> {
        if (IAPManager.AOS_V4_BILLING_USE === false) {
            return new Promise((resolve) => {
                this._onPurchaseHistoryCallback = (data) => {
                    cc.log("asyncGetPlaystorePurchaseHistory " + data);
                    const res = JSON.parse(data);
                    for (let i = 0; i < res.purchaseHistory.length; ++i) {
                        const history = PlaystorePurchaseHistory.parseObj(res.purchaseHistory[i]);
                        if (history.productId === productId) {
                            cc.log("asyncGetPlaystorePurchaseHistory return" + JSON.stringify(history));
                            return resolve(history);
                        }
                    }
                    resolve(null);
                };
                sdkbox.IAP.getPurchaseHistory();
            });
        } else {
            return this._asyncGetPlaystorePurchaseHistory_AOS(productId);
        }
    }

    /** 安卓原生-异步查询订单历史 */
    private async _asyncGetPlaystorePurchaseHistory_AOS(productId: string): Promise<PlaystorePurchaseHistory> {
        cc.log("_asyncGetPlaystorePurchaseHistory start ");
        return new Promise((resolve) => {
            this._onPurchaseHistoryCallback = (data) => {
                cc.log("_asyncGetPlaystorePurchaseHistory " + data);
                const res = JSON.parse(data);
                for (let i = 0; i < res.purchaseHistory.length; ++i) {
                    const history = PlaystorePurchaseHistory.parseObj(res.purchaseHistory[i]);
                    cc.log("_asyncGetPlaystorePurchaseHistory " + i + " " + JSON.stringify(history) + "/" + productId);
                    if (history.productId === productId) {
                        return resolve(history);
                    }
                }
                resolve(null);
            };
            NativeUtil.getPurchaseHistory_AOS();
        });
    }

}

// ===================== 全局声明 - 解决TS语法报错 无需修改 =====================
declare const Utility: {
    isMobileGame: () => number;
};

declare const nativeJSBridge: {
    addBridgeCallback: (eventName: string, callback: (...args: any[]) => void) => void;
};

declare const sdkbox: {
    IAP: {
        enableUserSideVerification: (flag: boolean) => void;
        setListener: (listener: any) => void;
        setDebug: (flag: boolean) => void;
        init: (opt: any) => void;
        purchase: (productId: string) => void;
        finishTransaction: (productId: string) => void;
        getPurchaseHistory: () => void;
    };
};