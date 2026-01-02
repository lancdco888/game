const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 =====================
import LocalStorageManager from "../../global_utility/LocalStorage/LocalStorageManager";
import CommonServer from "../Network/CommonServer";
import CenturionCliqueManager from "../Service/CenturionClique/CenturionCliqueManager";
import UserInfo from "../User/UserInfo";
import UserPromotion from "../User/UserPromotion";
import ShopPromotionManager from "../Utility/ShopPromotionManager";
import TSUtility from "../../global_utility/TSUtility";
import MembersClassBoostUpManager from "./MembersClassBoostUpManager";
import MembersClassBoostUpNormalManager from "./MembersClassBoostUpNormalManager";
import ServiceInfoManager from "./ServiceInfoManager";

// ===================== 原文件导出枚举 KindOfOffers_AlmightyCoupon 完整保留 =====================
export const KindOfOffers_AlmightyCoupon = {
    Offer_Allin: 0,
    Offer_EpicWin: 1,
    Offer_LimitedTimeOffer: 2,
    Offer_BigStack: 3,
    Offer_SproutDeal: 4,
    Popup_MainShop: 5,
    Secret_Stash: 6
};
// 反向映射 与原JS逻辑一致 无修改
for (const key in KindOfOffers_AlmightyCoupon) {
    KindOfOffers_AlmightyCoupon[KindOfOffers_AlmightyCoupon[key]] = key;
}

// ===================== 原文件导出枚举 EventTypeAlmightyCoupon 完整保留 =====================
export const EventTypeAlmightyCoupon = {
    END_EVENT: "end_event"
};

@ccclass
export default class AllMightyCouponManager extends cc.Component {
    // ===================== 私有成员常量/变量 原数据完整保留 =====================
    private _date20Days: number = 1728000; // 原1728e3 数值不变
    private _observersWhenEndEvent: any[] = [];

    // ===================== 单例模式 与原JS逻辑完全一致 常驻节点处理保留 =====================
    private static _instance: AllMightyCouponManager = null;
    public static instance(): AllMightyCouponManager {
        if (AllMightyCouponManager._instance == null) {
            AllMightyCouponManager._instance = new AllMightyCouponManager();
            cc.game.addPersistRootNode(AllMightyCouponManager._instance.node);
            AllMightyCouponManager._instance.initManager();
        }
        return AllMightyCouponManager._instance;
    }

    // ===================== 初始化管理器 1秒定时器逻辑完整保留 =====================
    public initManager(): void {
        const self = this;
        this.schedule(() => {
            if (self._observersWhenEndEvent.length > 0 && self.isRunningAllMightyCouponProcess() === 0) {
                self.emitEventEndAllTargets();
                self.removeObserverEventEndAll();
            }
        }, 1);
    }

    // ===================== 对外暴露核心业务方法 【原逻辑一字不差完整保留】 =====================
    public isPossibleStartAllMightyCoupon(): boolean {
        const couponPromotion = UserInfo.default.instance().getPromotionInfo(UserPromotion.AllMightyCouponPromotion.PromotionKeyName);
        if (TSUtility.default.isValid(couponPromotion) && couponPromotion.isValid()) {
            return false;
        }

        const isPurchased = UserInfo.default.instance().getUserServiceInfo().totalPurchaseCnt > 0;
        const lastPurchaseDate = UserInfo.default.instance().getPurchaseInfo().lastPurchaseDateOverUsd3;
        const nowUnix = TSUtility.default.getServerBaseNowUnixTime();

        if (isPurchased === 0 || nowUnix - lastPurchaseDate < this._date20Days) {
            return false;
        }

        if (this.isRunningOtherPromotion()) {
            return false;
        }

        const inboxInfo = UserInfo.default.instance().getUserInboxInfo();
        if (CenturionCliqueManager.Instance().isShowCenturionCliqueInvitePopup(inboxInfo) 
            || CenturionCliqueManager.Instance().isActiveCenturionClique() 
            || CenturionCliqueManager.Instance().isActiveHeroCenturionClique()) 
        {
            return false;
        }

        const promotionStartDate = ShopPromotionManager.default.Instance().getReadyPromotionStartDate();
        return !(promotionStartDate > 0 && promotionStartDate - 46800 <= TSUtility.default.getServerBaseNowUnixTime());
    }

    public isPossibleRequestEndAlmightyCoupon(): boolean {
        const couponPromotion = UserInfo.default.instance().getPromotionInfo(UserPromotion.AllMightyCouponPromotion.PromotionKeyName);
        return TSUtility.default.isValid(couponPromotion) !== 0 
            && couponPromotion.isValid() !== 0 
            && this.isRunningOtherPromotion();
    }

    public isRunningAllMightyCouponProcess(): number {
        const couponPromotion = UserInfo.default.instance().getPromotionInfo(UserPromotion.AllMightyCouponPromotion.PromotionKeyName);
        if (TSUtility.default.isValid(couponPromotion) === 0) return 0;
        if (couponPromotion.isValid() === 0) return 0;
        if (this.isRunningOtherPromotion()) return 0;
        return 1;
    }

    public isRunningOtherPromotion(): boolean {
        let isRunning = false;
        if (ShopPromotionManager.default.Instance().getSeasonalPromotionInfo_NotCheckPatchedPromotion() != null) {
            isRunning = true;
        }

        const welcomeBackInfo = UserInfo.default.instance().getPromotionInfo(UserPromotion.UserWelcomeBackRenewalInfo.PromotionKeyName);
        const hasWelcomeBackReward = TSUtility.default.isValid(welcomeBackInfo) && welcomeBackInfo.rewardCoin !== 0 && welcomeBackInfo.isReceivedCoupon === 0;
        
        const isBoostUpRunning = MembersClassBoostUpManager.default.instance().isRunningMembersBoostUpProcess();
        const isNormalBoostUpRunning = MembersClassBoostUpNormalManager.default.instance().isRunningMembersBoostUpExpandProcess();
        
        return !!(isRunning || isBoostUpRunning || isNormalBoostUpRunning || this.hasOtherCoupon() || hasWelcomeBackReward);
    }

    public isRunningOtherPromotionExceptCheckCoupon(): boolean {
        let isRunning = false;
        if (ShopPromotionManager.default.Instance().getSeasonalPromotionInfo_NotCheckPatchedPromotion() != null) {
            isRunning = true;
        }

        const isBoostUpRunning = MembersClassBoostUpManager.default.instance().isRunningMembersBoostUpProcess();
        const isNormalBoostUpRunning = MembersClassBoostUpNormalManager.default.instance().isRunningMembersBoostUpExpandProcess();
        
        return !!(isRunning || isBoostUpRunning || isNormalBoostUpRunning || this.hasOtherCoupon());
    }

    public hasOtherCoupon(): boolean {
        return ServiceInfoManager.default.instance().hasAnyCouponInbox();
    }

    public sendAcceptAllMightyCoupon(callback: Function): void {
        if (this.hasOtherCoupon() !== true) {
            CommonServer.default.Instance().requestAcceptPromotion(
                UserInfo.default.instance().getUid(),
                UserInfo.default.instance().getAccessToken(),
                UserPromotion.AllMightyCouponPromotion.PromotionKeyName,
                0,
                0,
                "",
                (response) => {
                    if (CommonServer.default.isServerResponseError(response)) {
                        callback();
                    } else {
                        const changeResult = UserInfo.default.instance().getServerChangeResult(response);
                        UserInfo.default.instance().applyChangeResult(changeResult);
                        callback();
                    }
                }
            );
        } else {
            callback();
        }
    }

    public getAlmightyCouponPromotionInfo(): any {
        return UserInfo.default.instance().getPromotionInfo(UserPromotion.AllMightyCouponPromotion.PromotionKeyName);
    }

    public getRemainTime(): number {
        const couponPromotion = this.getAlmightyCouponPromotionInfo();
        return TSUtility.default.isValid(couponPromotion) && couponPromotion.isValid() ? couponPromotion.getRemainTime() : 0;
    }

    public getCoinAddRate(): number {
        const couponPromotion = this.getAlmightyCouponPromotionInfo();
        return TSUtility.default.isValid(couponPromotion) && couponPromotion.isValid() ? couponPromotion.coinAddrate : 1;
    }

    public canShowCenterEffect(key: string): boolean {
        return this.isRunningAllMightyCouponProcess() !== 0 
            && LocalStorageManager.default.getEndTimeShowAlmightyCouponCenterEffect(key) !== this.getAlmightyCouponPromotionInfo().expireDate;
    }

    public setEndTimeShowAlmightyCouponCenterEffectToLocalStorage(key: string): void {
        if (this.isRunningAllMightyCouponProcess() !== 0) {
            const couponPromotion = this.getAlmightyCouponPromotionInfo();
            LocalStorageManager.default.setEndTimeShowAlmightyCouponCenterEffect(key, couponPromotion.expireDate);
        }
    }

    // ===================== 观察者模式 事件订阅/取消/批量触发 完整保留 =====================
    public addObserverEventEnd(target: any): void {
        if (this._observersWhenEndEvent.indexOf(target) === -1) {
            this._observersWhenEndEvent.push(target);
        }
    }

    public removeObserverEventEnd(target: any): void {
        for (let i = 0; i < this._observersWhenEndEvent.length; ++i) {
            if (this._observersWhenEndEvent[i] === target) {
                this._observersWhenEndEvent.splice(i, 1);
                break;
            }
        }
    }

    public removeObserverEventEndAll(): void {
        this._observersWhenEndEvent.length = 0;
    }

    public emitEventEndAllTargets(): void {
        this._observersWhenEndEvent.forEach((target) => {
            target.emit(EventTypeAlmightyCoupon.END_EVENT);
        });
    }

    // ===================== 核心检查&执行方法 回调逻辑完整保留 =====================
    public checkAlmightyCouponAccept(callback: Function): void {
        if (this.isPossibleStartAllMightyCoupon()) {
            this.sendAcceptAllMightyCoupon(() => {
                callback();
            });
        } else if (this.isPossibleRequestEndAlmightyCoupon()) {
            this.sendAcceptAllMightyCoupon(() => {
                callback();
            });
        } else {
            callback();
        }
    }
}