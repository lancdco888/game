// IAPManager_AOS.ts
const { ccclass } = cc._decorator;
import Analytics from "../../Network/Analytics";
import FireHoseSender, { FHLogType } from "../../FireHoseSender";
import CommonPopup from "../../Popup/CommonPopup";
import PopupManager from "../../manager/PopupManager";
import HeroTooltipPopup, { HT_MakingInfo } from "../../Utility/HeroTooltipPopup";
import IAPManager, { AOS_BILLING_ERRCODE } from "./IAPManager";

/** 谷歌商店购买状态枚举 */
export enum PurchaseState {
    PURCHASED = 1,
    PENDING = 2
}

/** 谷歌内购商品详情数据模型 */
export class SkuDetailInfo {
    public productId: string = "";
    public type: string = "";
    public title: string = "";
    public name: string = "";
    public iconUrl: string = "";
    public description: string = "";
    public price: string = "";
    public price_amount_micros: number = 0;
    public price_currency_code: string = "";
    public skuDetailsToken: string = "";

    public static parseObj(obj: any): SkuDetailInfo {
        const info = new SkuDetailInfo();
        info.productId = obj.productId;
        info.type = obj.type;
        info.title = obj.title;
        info.name = obj.name;
        info.iconUrl = obj.iconUrl;
        info.description = obj.description;
        info.price = obj.price;
        info.price_amount_micros = obj.price_amount_micros;
        info.price_currency_code = obj.price_currency_code;
        info.skuDetailsToken = obj.skuDetailsToken;
        return info;
    }
}

/** 谷歌商店订单凭证信息-核心模型 */
export class PlaystoreRecieptInfo {
    public orderId: string = "";
    public packageName: string = "";
    public productId: string = "";
    public purchaseTime: number = 0;
    public purchaseState: number = 0;
    public purchaseToken: string = "";
    public obfuscatedAccountId: string = "";
    public quantity: number = 0;
    public acknowledged: boolean = false;

    public static parseObj(obj: any): PlaystoreRecieptInfo {
        const info = new PlaystoreRecieptInfo();
        info.orderId = obj.orderId;
        info.packageName = obj.packageName;
        info.productId = obj.productId;
        info.purchaseTime = Math.floor(obj.purchaseTime / 1000);
        info.purchaseState = obj.purchaseState;
        info.purchaseToken = obj.purchaseToken;
        if (obj.obfuscatedAccountId) info.obfuscatedAccountId = obj.obfuscatedAccountId;
        info.quantity = obj.quantity;
        info.acknowledged = obj.acknowledged;
        return info;
    }

    /** 获取订单状态 转枚举 */
    public getPurchaseState(): PurchaseState {
        if (this.purchaseState === 4) {
            return PurchaseState.PENDING;
        } else {
            return PurchaseState.PURCHASED;
        }
    }
}

/** 单次购买结果返回体 */
export class PurchaseResult {
    public receiptInfo: PlaystoreRecieptInfo = null;
    public receiptStr: string = "";
    public errorMsg: string = "";
    public errorCode: AOS_BILLING_ERRCODE = AOS_BILLING_ERRCODE.OK;

    public isError(): number {
        return this.errorCode !== AOS_BILLING_ERRCODE.OK ? 1 : 0;
    }

    public getErrorCode(): AOS_BILLING_ERRCODE {
        return this.errorCode;
    }

    public getErrorMsg(): string {
        return this.errorMsg || "";
    }

    public static parseObj(obj: any): PurchaseResult {
        const res = new PurchaseResult();
        if (obj.receiptStr) {
            res.receiptInfo = PlaystoreRecieptInfo.parseObj(JSON.parse(obj.receiptStr));
            res.receiptStr = obj.receiptStr;
        }
        if (obj.errorMsg) res.errorMsg = obj.errorMsg;
        if (obj.errorCode) res.errorCode = obj.errorCode;
        return res;
    }
}

/** 订单历史列表查询结果 */
export class PurchaseHistoryResult {
    public purchaseHistory: PlaystoreRecieptInfo[] = [];
    public errorMsg: string = "";
    public errorCode: AOS_BILLING_ERRCODE = AOS_BILLING_ERRCODE.OK;

    public isError(): number {
        return this.errorCode !== AOS_BILLING_ERRCODE.OK ? 1 : 0;
    }

    public getErrorCode(): AOS_BILLING_ERRCODE {
        return this.errorCode;
    }

    public getErrorMsg(): string {
        return this.errorMsg || "";
    }

    public static parseObj(obj: any): PurchaseHistoryResult {
        const res = new PurchaseHistoryResult();
        if (obj.purchaseHistory) {
            for (let i = 0; i < obj.purchaseHistory.length; i++) {
                const info = PlaystoreRecieptInfo.parseObj(obj.purchaseHistory[i]);
                res.purchaseHistory.push(info);
            }
        }
        if (obj.errorMsg) res.errorMsg = obj.errorMsg;
        if (obj.errorCode) res.errorCode = obj.errorCode;
        return res;
    }
}

/** 商品列表查询结果 */
export class SkuDetailResult {
    public skuDetailList: SkuDetailInfo[] = [];
    public errorMsg: string = null;

    public isError(): boolean {
        return this.errorMsg !== null;
    }

    public static parseObj(obj: any): SkuDetailResult {
        const res = new SkuDetailResult();
        if (obj.skuDetailList) {
            for (let i = 0; i < obj.skuDetailList.length; i++) {
                const info = SkuDetailInfo.parseObj(obj.skuDetailList[i]);
                res.skuDetailList.push(info);
            }
        }
        if (obj.errorMsg) res.errorMsg = obj.errorMsg;
        return res;
    }
}

/**
 * 安卓谷歌商店内购核心管理类 (IAPManager_AOS)
 * Cocos Creator 2.4.13 TypeScript 完整版
 * 核心：桥接安卓原生GooglePlay内购SDK、处理支付/订单查询/订单消费/延迟支付等全流程
 */
@ccclass
export default class IAPManager_AOS {
    // 单例模式-全局唯一实例
    private static _instance: IAPManager_AOS = null;
    public static Instance(): IAPManager_AOS {
        if (!this._instance) {
            this._instance = new IAPManager_AOS();
        }
        return this._instance;
    }

    // 成员属性
    private skuDetailList: SkuDetailInfo[] = [];
    private onPurchaseCallback: (res: PurchaseResult) => void = null;
    private onDelayedPurchaseCallback: (res: PurchaseResult) => void = null;
    private onPurchaseHistoryCallback: (res: PurchaseHistoryResult) => void = null;
    private delayedPurchaseTooltip: HeroTooltipPopup = null;

    private constructor() { }

    /**
     * 初始化内购 + 注册原生桥接回调
     * @param productInfos 商品ID配置列表
     */
    public init(productInfos: any[]): void {
        nativeJSBridge.addBridgeCallback("onIAPSetProductSkuInfos_AOS", this.onIAPSetProductSkuInfos.bind(this));
        nativeJSBridge.addBridgeCallback("onIAPPurchase_AOS", this.onIAPPurchase_AOS.bind(this));
        nativeJSBridge.addBridgeCallback("onIAPQueryPurchaseHistory_AOS", this.onIAPQueryPurchaseHistory_AOS.bind(this));
        this.setProductInfos(productInfos);
    }

    /** 检测内购是否初始化完成(商品列表是否加载成功) */
    public isReady(): boolean {
        return this.skuDetailList.length > 0;
    }

    /** 向安卓原生层设置商品配置信息 */
    public setProductInfos(productInfos: any[]): void {
        const params = { productInfos: productInfos };
        const jsonStr = JSON.stringify(params);
        jsb.reflection.callStaticMethod(
            "org/cocos2dx/javascript/IAPPlugIn",
            "setProductSkuInfos",
            "(Ljava/lang/String;)V",
            jsonStr
        );
    }

    /** 原生回调-商品列表设置完成 */
    private onIAPSetProductSkuInfos(_event: string, data: any): void {
        cc.log("onIAPSetProductSkuInfos", JSON.stringify(data));
        const res = SkuDetailResult.parseObj(data);
        if (res.isError()) {
            cc.error("onIAPSetProductSkuInfos error: " + res.errorMsg);
        } else {
            this.skuDetailList = res.skuDetailList;
        }
    }

    /**
     * 发起商品购买请求
     * @param productId 商品ID
     * @param params 购买参数
     * @param callback 购买结果回调
     */
    public purchase(productId: string, params: any, callback: (res: PurchaseResult) => void): void {
        const paramStr = JSON.stringify(params);
        cc.log("purchase", productId, paramStr);
        this.onPurchaseCallback = callback;
        jsb.reflection.callStaticMethod(
            "org/cocos2dx/javascript/IAPPlugIn",
            "purchaseItem",
            "(Ljava/lang/String;Ljava/lang/String;)V",
            productId,
            paramStr
        );
    }

    /** 原生回调-购买结果返回 */
    private onIAPPurchase_AOS(_event: string, data: any): void {
        cc.log("onIAPPurchase_AOS", JSON.stringify(data));
        const purchaseResult = PurchaseResult.parseObj(data);

        // 有错误 或 非挂起状态 直接回调结果
        if (purchaseResult.isError() || purchaseResult.receiptInfo.getPurchaseState() !== PurchaseState.PENDING) {
            if (this.onDelayedPurchaseCallback) {
                this.onDelayedPurchaseCallback(purchaseResult);
                this.onDelayedPurchaseCallback = null;
            } else {
                this.callOnPurchaseCallback(purchaseResult);
            }
            return;
        }

        // 处理延迟支付(PENDING)状态
        this.waitUntilDelayedPurchase(purchaseResult);
    }

    /** 触发购买结果回调并清空 */
    private callOnPurchaseCallback(res: PurchaseResult): void {
        if (this.onPurchaseCallback) {
            this.onPurchaseCallback(res);
            this.onPurchaseCallback = null;
        }
    }

    /** 显示延迟支付加载弹窗 */
    private async showDelayedPurchaseTooltip(): Promise<void> {
        this.delayedPurchaseTooltip = await HeroTooltipPopup.asyncGetPopup();
        this.delayedPurchaseTooltip.open();
        this.delayedPurchaseTooltip.setPivotPositionByVec2(cc.v2(0, 0));
        this.delayedPurchaseTooltip.setInfoText("Delayed Purchase Progress");

        const frameInfo = {
            paddingWidth: 100,
            paddingHeight: 80,
            textOffsetX: 0,
            textOffsetY: 0,
            useArrow: false,
            arrowPosType: 3,
            arrowPosAnchor: 0.5,
            arrowPosOffset: 0,
            baseFontSize: 26,
            fontLineHeight: 32,
            frameType: 0
        };

        const heroInfo = {
            anchorX: 0,
            anchorY: 0.5,
            offsetX: 0,
            offsetY: 0,
            heroId: "",
            heroRank: 0,
            iconType: "Small",
            heroState: 0
        };

        const settingInfo = {
            useBlockBG: true,
            useBlockFrame: false,
            reserveCloseTime: 0
        };

        const tooltipInfo = HT_MakingInfo.parseObj({
            frameInfo, heroInfo, settingInfo, startAniInfo: []
        });
        this.delayedPurchaseTooltip.setHero_HT_MakingInfo(tooltipInfo);
        this.delayedPurchaseTooltip.refreshUI();
    }

    /** 隐藏延迟支付弹窗 */
    private hideDelayedPurchaseTooltip(): void {
        if (this.delayedPurchaseTooltip) {
            this.delayedPurchaseTooltip.close();
            this.delayedPurchaseTooltip = null;
        }
    }

    /**
     * 轮询等待处理延迟支付(PENDING)订单
     * 谷歌内购特有：部分支付会处于挂起状态，需要轮询查询支付结果
     */
    private async waitUntilDelayedPurchase(pendingResult: PurchaseResult): Promise<void> {
        await this.showDelayedPurchaseTooltip();
        // 埋点：延迟支付开始
        Analytics.delayedPurchaseStart({ pendingReceipt: pendingResult });

        // 每5秒轮询一次订单状态
        const checkPurchaseState = async () => {
            const historyResult = await this.asyncGetPlaystorePurchaseHistoryList_AOS();
            if (historyResult.isError()) return;

            // 检查订单是否支付完成
            let isPurchased = false;
            for (const receipt of historyResult.purchaseHistory) {
                if (receipt.productId === pendingResult.receiptInfo.productId) {
                    isPurchased = true;
                    break;
                }
            }

            if (isPurchased) return;

            // 支付取消-返回错误回调
            const cancelResult = new PurchaseResult();
            cancelResult.errorCode = AOS_BILLING_ERRCODE.USER_CANCELED;
            cancelResult.errorMsg = "delayed purchase canceled";
            this.callOnPurchaseCallback(cancelResult);
            
            Analytics.delayedPurchaseCancel({ pendingReceipt: pendingResult });
            this.openDelayedPurchaseCancelPopup();
            
            PopupManager.Instance().unschedule(checkPurchaseState);
            this.hideDelayedPurchaseTooltip();
            this.onDelayedPurchaseCallback = null;
        };

        PopupManager.Instance().schedule(checkPurchaseState, 5);

        // 支付完成/失败的回调处理
        this.onDelayedPurchaseCallback = (completeResult) => {
            this.callOnPurchaseCallback(completeResult);
            Analytics.delayedPurchaseCancel({ pendingReceipt: pendingResult, completeReceipt: completeResult });
            PopupManager.Instance().unschedule(checkPurchaseState);
            this.hideDelayedPurchaseTooltip();
            this.onDelayedPurchaseCallback = null;
        };
    }

    /** 打开延迟支付取消的提示弹窗 */
    private openDelayedPurchaseCancelPopup(): void {
        CommonPopup.getCommonPopup((err, popup) => {
            if (!err) {
                popup.open()
                    .setInfo("Purchase", "The payment was not processed successfully and was canceled.")
                    .setOkBtn("OK", () => { });
            }
        });
    }

    /**
     * 消费订单(谷歌内购必做：消耗型商品必须消费，否则无法重复购买)
     * @param purchaseToken 订单凭证Token
     */
    public consume(purchaseToken: string): void {
        jsb.reflection.callStaticMethod(
            "org/cocos2dx/javascript/IAPPlugIn",
            "consumeItem",
            "(Ljava/lang/String;)V",
            purchaseToken
        );
    }

    /**
     * 【核心异步方法】查询谷歌商店所有未消费的订单历史列表
     * 与上一个UnprocessedPurchaseManager.ts 对接的核心方法
     */
    public async asyncGetPlaystorePurchaseHistoryList_AOS(): Promise<PurchaseHistoryResult> {
        cc.log("_asyncGetPlaystorePurchaseHistory start ");
        const startTime = Date.now();
        return new Promise((resolve) => {
            this.onPurchaseHistoryCallback = (data) => {
                const costTime = Date.now() - startTime;
                cc.log("_asyncGetPlaystorePurchaseHistory ", data, costTime);
                
                // 超时埋点上报
                if (costTime > 3000) {
                    const error = new Error(`asyncGetPlaystorePurchaseHistoryList_AOS [time:${costTime}][${JSON.stringify(data)}]`);
                    FireHoseSender.Instance().sendAws(
                        FireHoseSender.Instance().getRecord(FHLogType.Trace, error),
                        true,
                        FHLogType.Trace
                    );
                }
                resolve(data);
            };

            // 调用安卓原生查询订单历史
            jsb.reflection.callStaticMethod(
                "org/cocos2dx/javascript/IAPPlugIn",
                "queryPurchasesHistory",
                "()V"
            );
        });
    }

    /** 原生回调-订单历史查询结果返回 */
    private onIAPQueryPurchaseHistory_AOS(_event: string, data: any): void {
        cc.log("onIAPQueryPurchaseHistory_AOS", JSON.stringify(data));
        const historyResult = PurchaseHistoryResult.parseObj(data);
        if (this.onPurchaseHistoryCallback) {
            this.onPurchaseHistoryCallback(historyResult);
            this.onPurchaseHistoryCallback = null;
        }
    }
}

// ===================== 全局声明 - 解决TS语法报错 无需修改 =====================
declare const nativeJSBridge: {
    addBridgeCallback: (eventName: string, callback: (event: string, data: any) => void) => void;
};

declare interface String {
    format(...args: any[]): string;
}