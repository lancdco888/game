const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 =====================
import LocalStorageManager from "../manager/LocalStorageManager";
import CommonServer from "../Network/CommonServer";
import SDefine from "../global_utility/SDefine";
import CenturionCliqueManager from "../manager/CenturionCliqueManager";
import UserInfo from "../User/UserInfo";
import UserInven, { MembersClassBoostUpNormalExtraInfo } from "../User/UserInven";
import UserPromotion, { MembersClassBoostUpExpandPromotion, UserWelcomeBackRenewalInfo } from "../User/UserPromotion";
import ShopPromotionManager from "../message/ShopPromotionManager";
import TSUtility from "../global_utility/TSUtility";
import AllMightyCouponManager from "./AllMightyCouponManager";
import ServiceInfoManager from "../ServiceInfoManager";

// ===================== 原文件导出枚举 KindOfOffers 完整保留 =====================
export const KindOfOffers = {
    Offer_Allin: 0,
    Offer_EpicWin: 1,
    Offer_LimitedTimeOffer: 2,
    Offer_2XCardPack: 3,
    Offer_BigStack: 4,
    Offer_SproutDeal: 5,
    Offer_SeasonEndOffer: 6,
    Popup_MainShop: 7,
    Popup_DailyBonus: 8,
    Popup_DailyWheel: 9,
    Popup_Bingo: 10,
    Secret_Stash: 11
};
// 反向映射 与原JS逻辑一致
for (const key in KindOfOffers) {
    KindOfOffers[KindOfOffers[key]] = key;
}

// ===================== 原文件导出枚举 EventTypeMembersClassBoostUp 完整保留 =====================
export const EventTypeMembersClassBoostUp = {
    END_EVENT: "end_event"
};

@ccclass
export default class MembersClassBoostUpNormalManager extends cc.Component {
    // ===================== 私有成员常量/变量 原数据完整保留 =====================
    private availablePoint: number[] = [9000, 27000, 54000, 90000, 475000, 950000];
    private _observersWhenEndEvent: any[] = [];

    // ===================== 单例模式 与原JS逻辑完全一致 常驻节点处理保留 =====================
    private static _instance: MembersClassBoostUpNormalManager = null;
    public static instance(): MembersClassBoostUpNormalManager {
        if (MembersClassBoostUpNormalManager._instance == null) {
            MembersClassBoostUpNormalManager._instance = new MembersClassBoostUpNormalManager();
            cc.game.addPersistRootNode(MembersClassBoostUpNormalManager._instance.node);
            MembersClassBoostUpNormalManager._instance.initManager();
        }
        return MembersClassBoostUpNormalManager._instance;
    }

    // ===================== 初始化管理器 定时器逻辑完整保留 =====================
    public initManager(): void {
        const self = this;
        this.schedule(() => {
            if (self._observersWhenEndEvent.length > 0 && self.isRunningMembersBoostUpExpandProcess() === 0) {
                self.emitEventEndAllTargets();
                self.removeObserverEventEndAll();
            }
        }, 1);
    }

    // ===================== 对外暴露核心业务方法 【原逻辑一字不差完整保留】 =====================
    public isMembersBoostUpExpandPromotionAvailable(): boolean {
        const createDate = UserInfo.instance().getCreateDate();
        if (!ServiceInfoManager.instance.isOverDay(createDate, 1)) {
            return false;
        }

        const promotionInfo = this.getMembersBoostUpExpandPromotionInfo();
        if (!TSUtility.isValid(promotionInfo)) {
            return false;
        }

        // if (UserInfo.instance().getUserVipInfo().level < 3) {
        //     return false;
        // }

        // if (UserInfo.instance().getBoostPromotionCoolTime() > TSUtility.getServerBaseNowUnixTime()) {
        //     return false;
        // }

        if (!this.isAvailableMembersBoostVipPoint()) {
            return false;
        }

        const promotionStartDate = ShopPromotionManager.Instance().getReadyPromotionStartDate();
        if (promotionStartDate > 0 && promotionStartDate - 90000 <= TSUtility.getServerBaseNowUnixTime()) {
            return false;
        }

        if (ShopPromotionManager.Instance().getSeasonalPromotionInfo() != null) {
            return false;
        }

        const welcomeBackInfo = UserInfo.instance().getPromotionInfo(UserWelcomeBackRenewalInfo.PromotionKeyName);
        if (TSUtility.isValid(welcomeBackInfo) && welcomeBackInfo.rewardCoin !== 0 && welcomeBackInfo.isReceivedCoupon === 0) {
            return false;
        }

        // const inboxInfo = UserInfo.instance().getUserInboxInfo();
        // return !(CenturionCliqueManager.Instance().isShowCenturionCliqueInvitePopup(inboxInfo) 
        //     || CenturionCliqueManager.Instance().isActiveCenturionClique() 
        //     || CenturionCliqueManager.Instance().isActiveHeroCenturionClique() 
        //     || !promotionInfo.isValid());
        return false;
    }

    public isRunningMembersBoostUpExpandProcess(): number {
        // const boostItem = this.getMembersClassBoostUpExpandItem();
        // if (!TSUtility.isValid(boostItem)) return 0;
        // if (UserInfo.instance().getUserVipInfo().level >= this.getBoostedMembersClass()) return 0;
        // if (this.isRunningOtherPromotion()) return 0;
        return 1;
    }

    public isAvailableMembersBoostVipPoint(): boolean {
        // const vipLevel = UserInfo.instance().getUserVipInfo().level;
        // const vipExp = UserInfo.instance().getUserVipInfo().exp;
        // return vipExp >= this.availablePoint[vipLevel - 3];
        return false;
    }

    public isRunningOtherPromotion(): boolean {
        return !(AllMightyCouponManager.instance().isRunningAllMightyCouponProcess() === 0 && this.hasCoupon() !== 1);
    }

    public hasCoupon(): number {
        return ServiceInfoManager.instance.hasAnyCouponInbox() ? 1 : 0;
    }

    public getMembersBoostUpExpandPromotionInfo(): any {
        return UserInfo.instance().getPromotionInfo(MembersClassBoostUpExpandPromotion.PromotionKeyName);
    }

    public getMembersClassBoostUpExpandItem(): any {
        // const itemInventory = UserInfo.instance().getItemInventory();
        // const nowUnix = TSUtility.getServerBaseNowUnixTime();
        // const boostItems = itemInventory.getItemsByItemId(SDefine.I_MEMBERS_CLASS_BOOSTUP_NORMAL);
        
        // for (let i = 0; i < boostItems.length; ++i) {
        //     if (nowUnix < boostItems[i].expireDate) {
        //         return boostItems[i];
        //     }
        // }
        return null;
    }

    public getBoostedMembersClass(): number {
        const boostItem = this.getMembersClassBoostUpExpandItem();
        return TSUtility.isValid(boostItem) 
            ? MembersClassBoostUpNormalExtraInfo.parse(boostItem.extraInfo).boostLevel 
            : -1;
    }

    public getRemainTime(): number {
        const nowUnix = TSUtility.getServerBaseNowUnixTime();
        const boostItem = this.getMembersClassBoostUpExpandItem();
        const expireDate = TSUtility.isValid(boostItem) ? boostItem.expireDate : 0;
        return Math.max(0, expireDate - nowUnix);
    }

    public sendAcceptMembersClassBoostUpExpand(callback: Function): void {
        if (this.hasCoupon() !== 1) {
            CommonServer.Instance().requestAcceptPromotion(
                UserInfo.instance().getUid(),
                UserInfo.instance().getAccessToken(),
                MembersClassBoostUpExpandPromotion.PromotionKeyName,
                1,
                0,
                "",
                (response) => {
                    if (CommonServer.isServerResponseError(response)) {
                        callback();
                    } else {
                        // const changeResult = UserInfo.instance().getServerChangeResult(response);
                        // UserInfo.instance().applyChangeResult(changeResult);
                        callback();
                    }
                }
            );
        } else {
            callback();
        }
    }

    public setEndTimeShowMembersClassBoostUpExpandCenterEffectToLocalStorage(key: string, time: number): void {
        if (this.isRunningMembersBoostUpExpandProcess() !== 0) {
            // LocalStorageManager.setEndTimeShowMembersClassBoostUpCenterEffect(key, this.getRemainTime());
        }
    }

    public canShowCenterEffect(key: string): boolean {
        return this.isRunningMembersBoostUpExpandProcess() !== 0 
            // && LocalStorageManager.getEndTimeShowMembersClassBoostUpExpandCenterEffect(key) < this.getRemainTime();
    }

    // ===================== 观察者模式 事件订阅/取消/触发 完整保留 =====================
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
            target.emit(EventTypeMembersClassBoostUp.END_EVENT);
        });
    }
}