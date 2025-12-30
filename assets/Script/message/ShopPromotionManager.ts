// 保留原项目所有依赖导入，路径与原代码完全一致
// import FirstBuyCouponManager from "../ServiceInfo/FirstBuyCouponManager";
// import ServiceInfoManager from "../ServiceInfo/ServiceInfoManager";
import UserInfo from "../User/UserInfo";
import TSUtility from "../global_utility/TSUtility";
import InboxMessagePrefabManager, { INBOX_ITEM_TYPE } from "../InboxMessagePrefabManager";

/**
 * 促销活动基础信息数据类
 */
export class PromotionInfo {
    public startDate: number = 0;
    public endDate: number = 0;
    public key: string = "";
    public promotionType: number = 0;
}

/**
 * 商店促销活动管理类 (单例模式) - 项目核心促销管理器
 */
const { ccclass } = cc._decorator;
@ccclass
export default class ShopPromotionManager {
    // ===== 单例核心 =====
    private static _instance: ShopPromotionManager = null;
    public static Instance(): ShopPromotionManager {
        if (ShopPromotionManager._instance == null) {
            ShopPromotionManager._instance = new ShopPromotionManager();
        }
        return ShopPromotionManager._instance;
    }

    // ===== 私有成员变量 =====
    private _seasonalPromotions: PromotionInfo[] = [];
    private _patchedPromotion: string[] = ["2025-christmas", "2025-boxing"];

    // ===== 初始化促销活动数据 =====
    public initSeasonalPromotionManager(data: any): void {
        if (TSUtility.isValid(data)) {
            this._seasonalPromotions = [];
            for (let i = 0; i < data.length; i++) {
                const promoInfo = this.initPromotinInfo(data[i]);
                this._seasonalPromotions.push(promoInfo);
            }
            // 按活动开始时间升序排序
            this._seasonalPromotions.sort((a, b) => {
                const dateA = a.startDate;
                const dateB = b.startDate;
                return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
            });
        }
    }

    // ===== 初始化单个促销活动信息 =====
    public initPromotinInfo(data: any): PromotionInfo {
        const promoInfo = new PromotionInfo();
        promoInfo.promotionType = data.saleType;
        promoInfo.startDate = data.startDate;
        promoInfo.endDate = data.endDate;
        promoInfo.key = data.key;
        return promoInfo;
    }

    // ===== 判断是否存在其他可用优惠券 =====
    public hasOtherCoupon(): boolean {
        // const couponInfo = UserInfo.instance().getUserInboxCouponInfo();
        let hasCoupon = false;
        // for (let i = 0; i < couponInfo.length; ++i) {
        //     const info = couponInfo[i];
        //     if ((info.message.mType === INBOX_ITEM_TYPE.INBOX_COUPON_RENEWAL_2002 || 
        //         info.message.mType === INBOX_ITEM_TYPE.INBOX_COUPON_WELCOME_BACK) && 
        //         info.message.expireDate > 0) {
        //         hasCoupon = true;
        //         break;
        //     }
        // }
        return hasCoupon;
    }

    // ===== 判断是否新手商店促销活动中 =====
    public isNewbieShopPromotionIng(): boolean {
        // if (ServiceInfoManager.instance().isAbleNewbieShopPromotion() === 1) {
        //     return true;
        // }
        return false;
    }

    // ===== 根据key判断当前是否有指定促销活动 =====
    public isCurrentPromotion(promoKey: string): boolean {
        const nowTime = TSUtility.getServerBaseNowUnixTime();
        for (let i = 0; i < this._seasonalPromotions.length; i++) {
            const promo = this._seasonalPromotions[i];
            if (promo.promotionType !== 6 && 
                promo.key === promoKey && 
                promo.startDate <= nowTime && 
                nowTime <= promo.endDate && 
                this.isPatchedPromotion(promo.key)) {
                return true;
            }
        }
        return false;
    }

    // ===== 校验是否有资格参与促销活动 =====
    public checkAblePromotion(): boolean {
        // return !FirstBuyCouponManager.default.instance.isHaveFirstBuyCouponByInbox();
        return false;
    }

    // ===== 获取通用促销活动信息 =====
    public getSeasonalPromotionInfo(): PromotionInfo | null {
        if (this.hasOtherCoupon()) return null;
        
        const nowTime = TSUtility.getServerBaseNowUnixTime();
        for (let i = 0; i < this._seasonalPromotions.length; ++i) {
            const promo = this._seasonalPromotions[i];
            if (promo.promotionType !==6 && 
                promo.startDate <= nowTime && 
                nowTime <= promo.endDate && 
                this.isPatchedPromotion(promo.key)) {
                return (promo.promotionType === 0 && this.isNewbieShopPromotionIng()) ? null : promo;
            }
        }
        return null;
    }

    // ===== 获取【商店类型】促销活动信息 =====
    public getSeasonalPromotionInfo_ShopType(): PromotionInfo | null {
        if (!this.checkAblePromotion()) return null;
        if (this.hasOtherCoupon()) return null;
        if (this.isNewbieShopPromotionIng()) return null;

        const nowTime = TSUtility.getServerBaseNowUnixTime();
        for (let i = 0; i < this._seasonalPromotions.length; ++i) {
            const promo = this._seasonalPromotions[i];
            if (promo.startDate <= nowTime && 
                nowTime <= promo.endDate && 
                this.isPatchedPromotion(promo.key) && 
                promo.promotionType === 0) {
                return promo;
            }
        }
        return null;
    }

    // ===== 获取【弹窗类型】促销活动信息 (1/2/3/4类型) =====
    public getSeasonalPromotionInfo_PopupType(): PromotionInfo | null {
        if (this.hasOtherCoupon()) return null;

        const nowTime = TSUtility.getServerBaseNowUnixTime();
        for (let i = 0; i < this._seasonalPromotions.length; ++i) {
            const promo = this._seasonalPromotions[i];
            if (promo.startDate <= nowTime && 
                nowTime <= promo.endDate && 
                this.isPatchedPromotion(promo.key) && 
                (promo.promotionType ===1 || promo.promotionType ===2 || promo.promotionType ===3 || promo.promotionType ===4)) {
                return promo;
            }
        }
        return null;
    }

    // ===== 获取【优惠券类型】促销活动信息 (5类型) =====
    public getSeasonalPromotionInfo_CouponType(): PromotionInfo | null {
        // 校验首购/回归优惠券
        // const couponInfo = UserInfo.instance().getUserInboxCouponInfo();
        // let hasSpecCoupon = false;
        // for (let i = 0; i < couponInfo.length; ++i) {
        //     const info = couponInfo[i];
        //     if ((info.message.mType === INBOX_ITEM_TYPE.INBOX_COUPON_FIRST_BUY || 
        //         info.message.mType === INBOX_ITEM_TYPE.INBOX_COUPON_WELCOME_BACK) && 
        //         info.message.expireDate >0) {
        //         hasSpecCoupon = true;
        //         break;
        //     }
        // }
        // if (hasSpecCoupon) return null;
        // if (this.isNewbieShopPromotionIng()) return null;

        // const nowTime = TSUtility.getServerBaseNowUnixTime();
        // for (let i =0; i < this._seasonalPromotions.length; ++i) {
        //     const promo = this._seasonalPromotions[i];
        //     if (promo.startDate <= nowTime && 
        //         nowTime <= promo.endDate && 
        //         this.isPatchedPromotion(promo.key) && 
        //         promo.promotionType ===5) {
        //         return promo;
        //     }
        // }
        return null;
    }

    // ===== 获取【占位类型】促销活动信息 (6类型) =====
    public getSeasonalPromotionInfo_DummyType(): PromotionInfo | null {
        const nowTime = TSUtility.getServerBaseNowUnixTime();
        for (let i =0; i < this._seasonalPromotions.length; ++i) {
            const promo = this._seasonalPromotions[i];
            if (promo.startDate <= nowTime && 
                nowTime <= promo.endDate && 
                this.isPatchedPromotion(promo.key) && 
                promo.promotionType ===6) {
                return promo;
            }
        }
        return null;
    }

    // ===== 获取促销活动信息【不校验补丁活动】 =====
    public getSeasonalPromotionInfo_NotCheckPatchedPromotion(): PromotionInfo | null {
        if (this.hasOtherCoupon()) return null;

        const nowTime = TSUtility.getServerBaseNowUnixTime();
        for (let i =0; i < this._seasonalPromotions.length; ++i) {
            const promo = this._seasonalPromotions[i];
            if (promo.promotionType !==6 && promo.startDate <= nowTime && nowTime <= promo.endDate) {
                return promo;
            }
        }
        return null;
    }

    // ===== 获取最晚结束的促销活动信息 =====
    public getSeasonalPromotionInfo_LastPromotion(): PromotionInfo | null {
        const promoList = [
            this.getSeasonalPromotionInfo(),
            this.getSeasonalPromotionInfo_ShopType(),
            this.getSeasonalPromotionInfo_PopupType(),
            this.getSeasonalPromotionInfo_CouponType(),
            this.getSeasonalPromotionInfo_DummyType(),
            this.getSeasonalPromotionInfo_NotCheckPatchedPromotion()
        ];

        let lastPromo: PromotionInfo | null = null;
        for (let i =0; i < promoList.length; i++) {
            const promo = promoList[i];
            if (TSUtility.isValid(promo)&& (lastPromo == null || lastPromo.endDate < promo.endDate)) {
                lastPromo = promo;
            }
        }
        return lastPromo;
    }

    // ===== 判断是否是弹窗类型促销 =====
    public isPopupTypePromotion(): boolean {
        const promo = this.getSeasonalPromotionInfo();
        return !(!TSUtility.isValid(promo) || 
            promo.promotionType !==1 && promo.promotionType !==2 && promo.promotionType !==3 && promo.promotionType !==4);
    }

    // ===== 判断是否是商店类型促销 =====
    public isShopTypePromotion(): boolean {
        const promo = this.getSeasonalPromotionInfo();
        return TSUtility.isValid(promo) && promo.promotionType ===0;
    }

    // ===== 判断是否是优惠券类型促销 =====
    public isCouponTypePromotion(): boolean {
        const promo = this.getSeasonalPromotionInfo();
        return TSUtility.isValid(promo) && promo.promotionType ===5;
    }

    // ===== 判断是否是补丁修复的促销活动 =====
    public isPatchedPromotion(promoKey: string): boolean {
        for (let i =0; i < this._patchedPromotion.length; i++) {
            if (this._patchedPromotion[i] === promoKey) {
                return true;
            }
        }
        return false;
    }

    // ===== 获取所有补丁修复的促销活动key =====
    public getPatchedPromotions(): string[] {
        return this._patchedPromotion;
    }

    // ===== 获取即将开始的促销活动开始时间 =====
    public getReadyPromotionStartDate(): number {
        const nowTime = TSUtility.getServerBaseNowUnixTime();
        for (let i =0; i < this._seasonalPromotions.length; i++) {
            const promo = this._seasonalPromotions[i];
            if (promo.promotionType !==6 && promo.startDate > nowTime) {
                return promo.startDate;
            }
        }
        return -1;
    }

    // ===== 判断是否悬赏售卖活动【原逻辑固定返回false】 =====
    public isBountySale(): boolean {
        return false;
    }

    // ===== 根据key获取促销活动结束时间 =====
    public getPromotionEndInfo(promoKey: string): number {
        for (let i =0; i < this._seasonalPromotions.length; i++) {
            const promo = this._seasonalPromotions[i];
            if (promo.promotionType !==6 && promo.key === promoKey) {
                return promo.endDate;
            }
        }
        return -1;
    }
}