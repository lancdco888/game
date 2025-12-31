// IAPManager_iOS.ts
const { ccclass } = cc._decorator;

/**
 * iOS 内购交易状态枚举 (对应原生 StoreKit SKPaymentTransactionState)
 * AppStore内购核心状态，原生枚举值完全一致
 */
export enum SKPaymentTransactionState {
    SKPaymentTransactionStatePurchasing = 0,    // 支付中
    SKPaymentTransactionStatePurchased = 1,     // 支付成功
    SKPaymentTransactionStateFailed = 2,        // 支付失败
    SKPaymentTransactionStateRestored = 3,      // 恢复购买
    SKPaymentTransactionStateDeferred = 4,      // 支付延迟(家庭共享/家长审核)
    SKPaymentTransactionStateUnknown = 100      // 未知状态(自定义)
}

/**
 * iOS 内购错误码枚举 (对应原生 StoreKit SKError)
 * 包含原生错误码 + 自定义业务错误码
 */
export enum SKError {
    SKErrorUnknown = 0,                 // 未知错误
    SKErrorClientInvalid = 1,           // 客户端无效
    SKErrorPaymentCancelled = 2,        // 用户取消支付
    SKErrorPaymentInvalid = 3,          // 支付参数无效
    SKErrorPaymentNotAllowed = 4,       // 设备不允许内购(未开启内购权限)
    SKErrorStoreProductNotAvailable =5, // 商品区域不可用/下架
    CustomErrorDeferred = 101           // 自定义：支付延迟错误
}

/**
 * iOS AppStore 商品详情数据模型
 */
export class IOSProductInfo {
    public priceLocale: string = "";            // 价格地区
    public productIdentifier: string = "";      // 商品ID (核心)
    public localizedTitle: string = "";         // 本地化商品标题
    public localizedDescription: string = "";   // 本地化商品描述
    public price: number = 0;                   // 商品价格

    public static parseObj(obj: any): IOSProductInfo {
        const info = new IOSProductInfo();
        info.priceLocale = obj.priceLocale;
        info.productIdentifier = obj.productIdentifier;
        info.localizedTitle = obj.localizedTitle;
        info.localizedDescription = obj.localizedDescription;
        info.price = obj.price;
        return info;
    }
}

/**
 * iOS AppStore 内购交易凭证信息-核心模型
 * 全局导出，供 UnprocessedPurchaseManager 调用
 */
export class IOSPurchaseTransactionInfo {
    public transactionState: SKPaymentTransactionState = SKPaymentTransactionState.SKPaymentTransactionStateUnknown;
    public transactionIdentifier: string = "";  // 交易唯一ID
    public productIdentifier: string = "";      // 对应商品ID
    public transactionTimeStamp: number = 0;    // 交易时间戳

    public static parseObj(obj: any): IOSPurchaseTransactionInfo {
        const info = new IOSPurchaseTransactionInfo();
        info.transactionState = obj.transactionState;
        info.transactionIdentifier = obj.transactionIdentifier;
        info.productIdentifier = obj.productIdentifier;
        if (obj.transactionTimeStamp) info.transactionTimeStamp = obj.transactionTimeStamp;
        return info;
    }
}

/**
 * iOS 商品列表查询结果体
 */
class IOSProductListResult {
    public infos: IOSProductInfo[] = [];
    public errorMsg: string = null;

    public isError(): boolean {
        return this.errorMsg !== null;
    }

    public static parseObj(obj: any): IOSProductListResult {
        const res = new IOSProductListResult();
        if (obj.infos) {
            for (let i = 0; i < obj.infos.length; i++) {
                const info = IOSProductInfo.parseObj(obj.infos[i]);
                res.infos.push(info);
            }
        }
        if (obj.errorMsg) res.errorMsg = obj.errorMsg;
        return res;
    }
}

/**
 * iOS 单次购买结果返回体
 */
export class IOSPurchaseResult {
    public transactionInfo: IOSPurchaseTransactionInfo = null;
    public transactionState: SKPaymentTransactionState = SKPaymentTransactionState.SKPaymentTransactionStateUnknown;
    public errorCode: SKError = null;
    public errorMsg: string = null;

    /** 是否支付异常/错误 */
    public isError(): boolean {
        return this.errorCode !== null || this.transactionInfo === null;
    }

    /** 是否是用户主动取消支付 */
    public isCanceled(): boolean {
        return this.errorCode === SKError.SKErrorPaymentCancelled;
    }

    /** 是否是支付延迟状态(家长审核/家庭共享) */
    public isDeferred(): boolean {
        return this.transactionState === SKPaymentTransactionState.SKPaymentTransactionStateDeferred;
    }

    public static parseObj(obj: any): IOSPurchaseResult {
        const res = new IOSPurchaseResult();
        if (obj.transactionInfo) res.transactionInfo = IOSPurchaseTransactionInfo.parseObj(obj.transactionInfo);
        if (obj.transactionState) res.transactionState = obj.transactionState;
        if (obj.errorCode) res.errorCode = obj.errorCode;
        if (obj.errorMsg) res.errorMsg = obj.errorMsg;
        return res;
    }
}

/**
 * iOS 未完成交易列表查询结果体
 * 核心返回体，供 UnprocessedPurchaseManager 对接调用
 */
export class IOSUnfinishedTransactionResult {
    public infoList: IOSPurchaseTransactionInfo[] = [];
    public errorMsg: string = null;
    public errorCode: number = null;

    /** 是否查询异常/错误 */
    public isError(): number {
        return this.errorCode !== null ? 1 : 0;
    }

    /** 获取错误码 */
    public getErrorCode(): number {
        return this.errorCode || 0;
    }

    /** 获取错误信息 */
    public getErrorMsg(): string {
        return this.errorMsg || "";
    }

    public static parseObj(obj: any): IOSUnfinishedTransactionResult {
        const res = new IOSUnfinishedTransactionResult();
        if (obj.infoList) {
            for (let i = 0; i < obj.infoList.length; i++) {
                const info = IOSPurchaseTransactionInfo.parseObj(obj.infoList[i]);
                res.infoList.push(info);
            }
        }
        if (obj.errorMsg) res.errorMsg = obj.errorMsg;
        if (obj.errorCode) res.errorCode = obj.errorCode;
        return res;
    }
}

/**
 * iOS AppStore内购核心管理类 (IAPManager_iOS)
 * Cocos Creator 2.4.13 TypeScript 完整版
 * 核心：桥接iOS原生StoreKit内购SDK、处理支付/未完成交易查询/交易收尾/凭证获取等全流程
 * 注意：iOS内购必须调用 finishTransaction 完成交易，否则交易会常驻未完成列表
 */
@ccclass
export default class IAPManager_iOS {
    // 标准单例模式 - 全局唯一实例 (与安卓IAPManager_AOS 写法一致)
    private static _instance: IAPManager_iOS = null;
    public static Instance(): IAPManager_iOS {
        if (!this._instance) {
            this._instance = new IAPManager_iOS();
        }
        return this._instance;
    }

    // 成员属性
    private infos: IOSProductInfo[] = [];
    private onPurchaseCallback: ((result: IOSPurchaseResult) => void) = null;

    // 私有构造函数，禁止外部实例化
    private constructor() { }

    /**
     * 初始化iOS内购 + 注册原生桥接回调事件
     * @param productInfos 商品ID配置列表
     */
    public init(productInfos: any[]): void {
        nativeJSBridge.addBridgeCallback("onIAPSetProductInfo_iOS", this.onIAPSetProductInfo_iOS.bind(this));
        nativeJSBridge.addBridgeCallback("onIAPPurchase_iOS", this.onIAPPurchase_iOS.bind(this));
        this.setProductInfos(productInfos);
    }

    /**
     * 检测内购是否初始化就绪(商品信息是否加载完成)
     */
    public isReady(): boolean {
        return this.infos.length > 0;
    }

    /**
     * 向iOS原生层传递商品配置信息
     * @param productInfos 商品ID配置列表
     */
    public setProductInfos(productInfos: any[]): void {
        const jsonStr = JSON.stringify(productInfos);
        jsb.reflection.callStaticMethod("IAPController", "setProductInfo_iOS:", jsonStr);
    }

    /**
     * 原生回调 - iOS商品信息加载完成回调
     */
    private onIAPSetProductInfo_iOS(_event: string, data: string): void {
        cc.log("onIAPSetProductInfo_iOS:", data);
        const result = IOSProductListResult.parseObj(JSON.parse(data));
        if (result.isError()) {
            cc.error("onIAPSetProductInfo_iOS error:", result.errorMsg);
        } else {
            this.infos = result.infos;
        }
    }

    /**
     * 发起iOS商品购买请求
     * @param productId 商品唯一标识
     * @param callback 购买结果回调
     */
    public purchase(productId: string, callback: (result: IOSPurchaseResult) => void): void {
        cc.log("purchase ios:", productId);
        this.onPurchaseCallback = callback;
        jsb.reflection.callStaticMethod("IAPController", "purchase_iOS:", productId);
    }

    /**
     * 原生回调 - iOS购买结果返回回调
     */
    private onIAPPurchase_iOS(_event: string, data: string): void {
        cc.log("onIAPPurchase_iOS", data);
        const purchaseResult = IOSPurchaseResult.parseObj(JSON.parse(data));
        if (this.onPurchaseCallback) {
            this.onPurchaseCallback(purchaseResult);
            this.onPurchaseCallback = null;
        }
    }

    /**
     * 获取iOS内购凭证编码 (用于后端校验订单合法性)
     */
    public getReceiptCode_iOS(): string {
        cc.log("getReceiptCode_iOS");
        const receiptCode = jsb.reflection.callStaticMethod("IAPController", "getReceiptCode_iOS","");
        cc.log("getReceiptCode_iOS result:", receiptCode);
        return receiptCode;
    }

    /**
     * 完成交易【iOS内购必调用】
     * iOS的未完成交易必须调用该方法收尾，否则交易会永久保存在未完成列表中，无法重复购买同商品
     * @param transactionId 交易唯一ID
     */
    public finishTransaction(transactionId: string): void {
        cc.log("finishTransaction_iOS:", transactionId);
        jsb.reflection.callStaticMethod("IAPController", "finishTransaction_iOS:", transactionId);
    }

    /**
     * 【核心异步方法】查询iOS所有未完成的交易列表
     * 与 UnprocessedPurchaseManager.ts 对接的核心方法，订单兜底核心逻辑
     */
    public async asyncGetUnfinishedTransactionList(): Promise<IOSUnfinishedTransactionResult> {
        cc.log("asyncGetUnfinishedTransactionList");
        const transactionJson = jsb.reflection.callStaticMethod("IAPController", "getUnfinishedTransactionList_iOS","");
        cc.log("asyncGetUnfinishedTransactionList result:", transactionJson);
        return IOSUnfinishedTransactionResult.parseObj(JSON.parse(transactionJson));
    }

}

// ===================== 全局声明 - 解决TS语法报错 无需修改 =====================
declare const nativeJSBridge: {
    addBridgeCallback: (eventName: string, callback: (event: string, data: any) => void) => void;
};