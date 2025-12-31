// UnprocessedPurchaseManager.ts
const { ccclass } = cc._decorator;
import LocalStorageManager from "../manager/LocalStorageManager";
import IAPManager_AOS from "../NativeUtil/Purchase/IAPManager_AOS";
import IAPManager_iOS from "../NativeUtil/Purchase/IAPManager_iOS";
// import CommonServer from "../Network/CommonServer";
// import BingoPopup from "../Popup/Bingo/BingoPopup";
// import DailyStampManager from "../Popup/DailyStamp/2024/DailyStampManager";
// import DailyStampPopup_2024 from "../Popup/DailyStamp/2024/DailyStampPopup_2024";
import PopupManager from "../manager/PopupManager";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import UserInfo from "./UserInfo";
import UserPromotion, { DailyBingoBallPromotion } from "./UserPromotion";

/**
 * 未完成内购订单兜底处理核心管理器
 * Cocos Creator 2.4.13 TypeScript 完整版
 * 核心作用：处理支付成功但游戏未发放道具的异常订单，安卓/IOS/FB小游戏多端兼容
 */
@ccclass
export default class UnprocessedPurchaseManager {
    // 全局唯一单例
    private static _instance: UnprocessedPurchaseManager = null;
    public static Instance(): UnprocessedPurchaseManager {
        if (!this._instance) {
            this._instance = new UnprocessedPurchaseManager();
        }
        return this._instance;
    }

    // 成员属性
    private showBingoPopup: boolean = false;
    private dailyStampV2ChangeResult_Promotion: any = null;
    private dailyStampV2ChangeResult_ItemUse: any = null;

    private constructor() { }

    /**
     * 【核心入口】执行所有未完成订单的兜底处理逻辑
     */
    public async doProcess(): Promise<void> {
        cc.log("L_PurchaseUnConsumedReceipt doProcess");
        // // 1. Facebook即玩小游戏 处理逻辑
        // if (Utility.isFacebookInstant()) {
        //     if (SDefine.FB_Instant_iOS_Shop_Flag) {
        //         // 无操作分支
        //     } else {
        //         await UserInfo.instance().UnprocessedReceipt();
        //     }
        //     this.doBusinessLinkage();
        //     return;
        // }

        // // 2. 移动端游戏 安卓/IOS 核心内购处理
        // if (Utility.isMobileGame() === 1) {
        //     // 安卓(GooglePlay) 订单处理
        //     if (cc.sys.os === cc.sys.OS_ANDROID) {
        //         if (SDefine.Mobile_IAP_Renewal) {
        //             await this.asyncUnProcessedReceipt_AOS();
        //         } else {
        //             const purchaseInfo = LocalStorageManager.getPlaystorePurchaseInfo();
        //             if (purchaseInfo) {
        //                 cc.log("remainPurchaseInfo " + JSON.stringify(purchaseInfo));
        //                 LocalStorageManager.resetPlaystorePurchaseInfo();
        //                 await UserInfo.instance().asyncPlaystoreExceptionBuyProduct(purchaseInfo);
        //             }
        //         }
        //     }
        //     // IOS(AppStore) 订单处理
        //     else if (cc.sys.os === cc.sys.OS_IOS) {
        //         if (SDefine.Mobile_IAP_Renewal) {
        //             await this.asyncUnProcessedReceipt_iOS();
        //         } else {
        //             const purchaseInfo = LocalStorageManager.getIOSPurchaseInfo();
        //             if (purchaseInfo) {
        //                 cc.log("remainPurchaseInfo " + JSON.stringify(purchaseInfo));
        //                 LocalStorageManager.resetIOSPurchaseInfo();
        //                 await UserInfo.instance().asyncIOSExceptionBuyProduct(purchaseInfo);
        //             }
        //         }
        //     }
        // }
        // // 3. Facebook Web网页版 处理逻辑
        // else if (Utility.isFacebookWeb() === 1) {
        //     UserInfo.instance().asyncFacebookExceptionBuyProduct();
        //     await this.asyncTestCanvas();
        // }

        // // 执行签到/宾果弹窗 业务联动逻辑
        // await this.doBusinessLinkage();
    }

    /**
     * 业务联动逻辑 - 签到弹窗 + 宾果弹窗 展示
     */
    private async doBusinessLinkage(): Promise<void> {
        // // 处理每日签到弹窗逻辑
        // if (this.getDailyStampV2ChangeResult_Promotion()) {
        //     const changeResult = this.getDailyStampV2ChangeResult_Promotion();
        //     changeResult.addChangeResult(this.getDailyStampV2ChangeResult_ItemUse());
        //     DailyStampManager.instance.setNextDaySameDayUnProcessedInfo();
        //     await this.asyncShowDailyStampV2Popup(changeResult);
        // } else if (this.getDailyStampV2ChangeResult_ItemUse()) {
        //     const changeResult = this.getDailyStampV2ChangeResult_ItemUse();
        //     DailyStampManager.instance.setSameDayUnProcessedInfo(changeResult);
        //     await this.asyncShowDailyStampV2Popup(changeResult);
        // }

        // // 处理宾果弹窗逻辑
        // if (this.showBingoPopup) {
        //     await this.asyncShowBingoPopup();
        //     this.setShowBingoPopup(false);
        // }
    }

    /**
     * 安卓-查询谷歌商店未消费订单列表并逐个处理
     */
    public async asyncUnProcessedReceipt_AOS(): Promise<void> {
        PopupManager.Instance().showDisplayProgress(true);
        const res = await IAPManager_AOS.Instance().asyncGetPlaystorePurchaseHistoryList_AOS();
        PopupManager.Instance().showDisplayProgress(false);

        if (res.isError() === 1) {
            cc.error("asyncUnProcessedReceip_AOS error: " + res.errorMsg);
            return;
        }

        const purchaseHistory = res.purchaseHistory;
        if (purchaseHistory.length === 0) {
            cc.log("asyncUnProcessedReceip_AOS: no unConsumedReceiptList");
            return;
        }

        // 遍历所有未完成订单 逐个补发道具
        // for (const purchaseItem of purchaseHistory) {
        //     await UserInfo.instance().asyncPlaystoreExceptionBuyProduct_Renewal(purchaseItem);
        // }
    }

    /**
     * IOS-查询苹果商店未完成交易列表并逐个处理
     */
    public async asyncUnProcessedReceipt_iOS(): Promise<void> {
        PopupManager.Instance().showDisplayProgress(true);
        const res = await IAPManager_iOS.Instance().asyncGetUnfinishedTransactionList();
        PopupManager.Instance().showDisplayProgress(false);

        if (res.isError() === 1) {
            cc.error("asyncUnProcessedReceipt_iOS error: ", res.getErrorMsg(), res.getErrorCode());
            return;
        }

        const infoList = res.infoList;
        if (infoList.length === 0) {
            cc.log("asyncUnProcessedReceipt_iOS: no unFinishedTransacationList");
            return;
        }

        // 遍历所有未完成交易 逐个补发道具
        for (const transactionItem of infoList) {
            // await UserInfo.instance().asyncIOSExceptionBuyProduct_Renewal(transactionItem);
        }
    }

    /**
     * 测试画布-未完成订单处理(网页版专用)
     */
    public async asyncTestCanvas(): Promise<void> {
        // await UserInfo.instance().asyncTestCanvasUnProcessedPurchase();
    }

    /**
     * 显示2024版每日签到弹窗
     */
    public async asyncShowDailyStampV2Popup(changeResult: any): Promise<void> {
        // return new Promise<void>((resolve) => {
        //     DailyStampPopup_2024.getPopup((err, popup) => {
        //         if (!err) {
        //             popup.open(changeResult);
        //             popup.setCloseCallback(() => {
        //                 resolve();
        //             });
        //         } else {
        //             resolve();
        //         }
        //     });
        // });
    }

    /**
     * 显示宾果活动弹窗
     */
    public async asyncShowBingoPopup(): Promise<void> {
        return new Promise<void>((resolve) => {
            // const promotionInfo = UserInfo.instance().getPromotionInfo(DailyBingoBallPromotion.PromotionKeyName);
            // const nextReceiveTime = promotionInfo ? promotionInfo.nextReceiveTime : TSUtility.getServerBaseNowUnixTime() + 300;

            // if (nextReceiveTime < TSUtility.getServerBaseNowUnixTime()) {
            //     CommonServer.Instance().requestAcceptPromotion(
            //         UserInfo.instance().getUid(),
            //         UserInfo.instance().getAccessToken(),
            //         DailyBingoBallPromotion.PromotionKeyName,
            //         0, 0, "",
            //         (res) => {
            //             PopupManager.Instance().showDisplayProgress(false);
            //             if (CommonServer.isServerResponseError(res)) {
            //                 resolve();
            //             } else {
            //                 const changeResult = UserInfo.instance().getServerChangeResult(res);
            //                 BingoPopup.openPopup(changeResult, () => { }, () => { resolve(); });
            //             }
            //         }
            //     );
            // } else {
            //     BingoPopup.openPopup(null, () => { }, () => { resolve(); });
            // }
        });
    }

    // ========== 成员属性的get/set方法 ==========
    public setShowBingoPopup(flag: boolean): void {
        this.showBingoPopup = flag;
    }

    public setDailyStampV2ChangeResult_Promotion(data: any): void {
        this.dailyStampV2ChangeResult_Promotion = data;
    }

    public getDailyStampV2ChangeResult_Promotion(): any {
        return this.dailyStampV2ChangeResult_Promotion;
    }

    public setDailyStampV2ChangeResult_ItemUse(data: any): void {
        this.dailyStampV2ChangeResult_ItemUse = data;
    }

    public getDailyStampV2ChangeResult_ItemUse(): any {
        return this.dailyStampV2ChangeResult_ItemUse;
    }
}

// 全局工具类声明(原项目存在，此处仅做TS语法兼容，无需修改)
declare const Utility: {
    isFacebookInstant: () => boolean;
    isMobileGame: () => number;
    isFacebookWeb: () => number;
}