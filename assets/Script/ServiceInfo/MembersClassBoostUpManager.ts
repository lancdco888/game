const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import LocalStorageManager from "../manager/LocalStorageManager";
import CommonServer from "../Network/CommonServer";
import SDefine from "../global_utility/SDefine";
import CenturionCliqueManager from "../manager/CenturionCliqueManager";
import UserInfo from "../User/UserInfo";
import UserInven, { MembersClassBoostUpExtraInfo } from "../User/UserInven";
import UserPromotion, { MembersClassBoostUpPromotion, UserWelcomeBackRenewalInfo } from "../User/UserPromotion";
import TSUtility from "../global_utility/TSUtility";
import AllMightyCouponManager from "../ServiceInfo/AllMightyCouponManager";
import ServiceInfoManager from "../ServiceInfoManager";

// ===================== 原文件枚举 KindOfOffers 标准化改写 数值完全一致 0-11 =====================
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
}

// ===================== 原文件事件常量类 EventTypeMembersClassBoostUp 完整保留 =====================
export const EventTypeMembersClassBoostUp = {
    END_EVENT: "end_event"
}

// ===================== 核心会员增益管理器 单例模式 继承cc.Component =====================
@ccclass
export default class MembersClassBoostUpManager extends cc.Component {
    // ===================== 静态单例实例 核心私有 =====================
    private static _instance: MembersClassBoostUpManager = null;

    // ===================== 私有成员变量 原数据完整保留 =====================
    private _observersWhenEndEvent: any[] = [];

    // ===================== 单例全局入口 原逻辑完整保留 常驻节点+初始化 =====================
    public static instance(): MembersClassBoostUpManager {
        if (MembersClassBoostUpManager._instance == null) {
            MembersClassBoostUpManager._instance = new MembersClassBoostUpManager();
            cc.game.addPersistRootNode(MembersClassBoostUpManager._instance.node);
            MembersClassBoostUpManager._instance.initManager();
        }
        return MembersClassBoostUpManager._instance;
    }

    // ===================== 初始化管理器 每秒定时器检查事件结束回调 =====================
    private initManager(): void {
        const self = this;
        this.schedule(() => {
            if (self._observersWhenEndEvent.length > 0 && !self.isRunningMembersBoostUpProcess()) {
                self.emitEventEndAllTargets();
                self.removeObserverEventEndAll();
            }
        }, 1);
    }

    // ===================== 核心判断：会员增益推广是否可用 多条件校验 逻辑一字不差 =====================
    public isMembersBoostUpPromotionAvailable(): boolean {
        const createDate = UserInfo.instance().getCreateDate();
        if (ServiceInfoManager.instance.isOverDay(createDate, 1) === false) {
            return false;
        }

        const promotionInfo = this.getMembersBoostUpPromotionInfo();
        if (!TSUtility.isValid(promotionInfo)) {
            return false;
        }

        if (UserInfo.instance().getUserVipInfo().level > 2) {
            return false;
        }

        const renewalInfo = UserInfo.instance().getPromotionInfo(UserWelcomeBackRenewalInfo.PromotionKeyName);
        if (TSUtility.isValid(renewalInfo) && renewalInfo.rewardCoin !== 0 && renewalInfo.isReceivedCoupon === 0) {
            return false;
        }

        const inboxInfo = UserInfo.instance().getUserInboxInfo();
        return !(CenturionCliqueManager.Instance().isShowCenturionCliqueInvitePopup(inboxInfo) 
            || CenturionCliqueManager.Instance().isActiveCenturionClique() 
            || CenturionCliqueManager.Instance().isActiveHeroCenturionClique() 
            || !promotionInfo.isValid());
    }

    // ===================== 判断：是否有其他推广活动在运行 =====================
    public isRunningOtherPromotion(): boolean {
        return !(AllMightyCouponManager.instance().isRunningAllMightyCouponProcess() === 0 && this.hasCoupon() !== 1);
    }

    // ===================== 判断：是否拥有优惠券 =====================
    public hasCoupon(): number {
        return ServiceInfoManager.instance.hasAnyCouponInbox()?1:0;
    }

    // ===================== 核心判断：会员增益流程是否正在运行 =====================
    public isRunningMembersBoostUpProcess(): boolean {
        const boostItem = this.getMembersClassBoostUpItem();
        return TSUtility.isValid(boostItem) 
            && !(UserInfo.instance().getUserVipInfo().level >= this.getBoostedMembersClass() 
                || this.isRunningOtherPromotion());
    }

    // ===================== 获取会员增益推广信息 =====================
    public getMembersBoostUpPromotionInfo(): any {
        return UserInfo.instance().getPromotionInfo(MembersClassBoostUpPromotion.PromotionKeyName);
    }

    // ===================== 获取会员增益道具 过滤未过期的 =====================
    public getMembersClassBoostUpItem(): any {
        const itemInventory = UserInfo.instance().getItemInventory();
        const nowUnix = TSUtility.getServerBaseNowUnixTime();
        const boostItems = itemInventory.getItemsByItemId(SDefine.I_MEMBERS_CLASS_BOOSTUP);
        
        for (let i = 0; i < boostItems.length; ++i) {
            if (nowUnix < boostItems[i].expireDate) {
                return boostItems[i];
            }
        }
        return null;
    }

    // ===================== 获取增益后的会员等级 解析道具扩展信息 =====================
    public getBoostedMembersClass(): number {
        const boostItem = this.getMembersClassBoostUpItem();
        return TSUtility.isValid(boostItem) 
            ? MembersClassBoostUpExtraInfo.parse(boostItem.extraInfo).boostLevel 
            : -1;
    }

    // ===================== 获取会员增益剩余时间 保底0 =====================
    public getRemainTime(): number {
        const nowUnix = TSUtility.getServerBaseNowUnixTime();
        const boostItem = this.getMembersClassBoostUpItem();
        const expireDate = TSUtility.isValid(boostItem) ? boostItem.expireDate : 0;
        return Math.max(0, expireDate - nowUnix);
    }

    // ===================== 网络请求：领取会员增益奖励 带回调处理 =====================
    public sendAcceptMembersClassBoostUp(callback: Function): void {
        if (this.hasCoupon() !== 1) {
            CommonServer.Instance().requestAcceptPromotion(
                UserInfo.instance().getUid(),
                UserInfo.instance().getAccessToken(),
                MembersClassBoostUpPromotion.PromotionKeyName,
                0,
                0,
                "",
                (response) => {
                    if (CommonServer.isServerResponseError(response)) {
                        callback();
                    } else {
                        const changeResult = UserInfo.instance().getServerChangeResult(response);
                        UserInfo.instance().applyChangeResult(changeResult);
                        callback();
                    }
                }
            );
        } else {
            callback();
        }
    }

    // ===================== 本地存储：设置会员增益中心特效结束时间 =====================
    public setEndTimeShowMembersClassBoostUpCenterEffectToLocalStorage(type: any): void {
        if (this.isRunningMembersBoostUpProcess()) {
            const promotionInfo = this.getMembersBoostUpPromotionInfo();
            //LocalStorageManager.setEndTimeShowMembersClassBoostUpCenterEffect(type, promotionInfo.eventEnd);
        }
    }

    // ===================== 判断：是否可以显示中心特效 =====================
    public canShowCenterEffect(type: any): boolean {
        return this.isRunningMembersBoostUpProcess() 
           //&& LocalStorageManager.getEndTimeShowMembersClassBoostUpExpandCenterEffect(type) < this.getMembersBoostUpPromotionInfo().eventEnd;
    }

    // ===================== 事件观察者：添加结束事件监听 =====================
    public addObserverEventEnd(target: any): void {
        if (this._observersWhenEndEvent.indexOf(target) === -1) {
            this._observersWhenEndEvent.push(target);
        }
    }

    // ===================== 事件观察者：移除单个结束事件监听 =====================
    public removeObserverEventEnd(target: any): void {
        for (let i = 0; i < this._observersWhenEndEvent.length; ++i) {
            if (this._observersWhenEndEvent[i] === target) {
                this._observersWhenEndEvent.splice(i, 1);
            }
        }
    }

    // ===================== 事件观察者：移除所有结束事件监听 =====================
    public removeObserverEventEndAll(): void {
        this._observersWhenEndEvent.length = 0;
    }

    // ===================== 事件观察者：派发结束事件到所有监听者 =====================
    public emitEventEndAllTargets(): void {
        this._observersWhenEndEvent.forEach((target) => {
            target.emit(EventTypeMembersClassBoostUp.END_EVENT);
        });
    }
}