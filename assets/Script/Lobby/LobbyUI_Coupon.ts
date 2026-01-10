import { INBOX_ITEM_TYPE } from "../InboxMessagePrefabManager";
import LobbyUIBase, { LobbyUIType } from "../LobbyUIBase";
import UserInfo from "../User/UserInfo";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import ShopPromotionManager from "../message/ShopPromotionManager";


const { ccclass, property } = cc._decorator;

/**
 * 大厅优惠券UI组件
 */
@ccclass('LobbyUI_Coupon')
export default class LobbyUI_Coupon extends LobbyUIBase {
    // ===================== 序列化属性（对应编辑器绑定） =====================
    @property({ type: cc.Node })
    nodeCouponIcon_1: cc.Node = null!; // 优惠券图标1

    @property({ type: cc.Node })
    nodeCouponIcon_2: cc.Node = null!; // 优惠券图标2

    @property({ type: cc.Node })
    promotionCouponNode: cc.Node = null!; // 促销优惠券节点

    @property({ type: cc.Label })
    lblCouponRate: cc.Label = null!; // 优惠券倍率显示文本

    // ===================== 私有成员变量 =====================
    private _arrExpireTime: number[] = []; // 优惠券过期时间数组
    private _arrCouponType: INBOX_ITEM_TYPE[] = []; // 优惠券类型数组

    // ===================== 静态成员变量 =====================
    static arrDisableCouponUI: INBOX_ITEM_TYPE[] = []; // 禁用的优惠券UI类型数组

    // ===================== 只读属性（Getter） =====================
    /**
     * 获取UI类型（重写父类属性）
     */
    get eType(): LobbyUIType {
        return LobbyUIType.COUPON;
    }

    /**
     * 获取主优惠券图标节点（兼容原有逻辑）
     */
    get nodeCouponIcon(): cc.Node {
        return this.nodeCouponIcon_1;
    }

    // ===================== 生命周期函数 =====================
    onLoad(): void {
        // 初始化隐藏所有优惠券UI
        this.hideCouponUI();
    }

    /**
     * 刷新优惠券UI（核心入口方法）
     */
    refresh(): void {
        // 根据iOS商店标识切换更新逻辑
        if (!SDefine.FB_Instant_iOS_Shop_Flag) {
            this.updateInboxItem();
        } else {
            this.updateCouponIcon(true);
        }
    }

    // ===================== 核心业务方法 =====================
    /**
     * 更新优惠券图标显示状态
     * @param forceHide 是否强制隐藏所有优惠券图标
     */
    updateCouponIcon(forceHide: boolean = false): void {
        if (!forceHide) {
            // 判断首购优惠券是否显示
            const hasFirstBuyCoupon = this._arrCouponType.some(type => 
                type === INBOX_ITEM_TYPE.INBOX_COUPON_FIRST_BUY
            );
            const showFirstBuyIcon = !this.isDisableCouponUI(INBOX_ITEM_TYPE.INBOX_COUPON_FIRST_BUY) && hasFirstBuyCoupon;

            // 判断普通优惠券是否显示
            const showNormalIcon = 
                !this.isDisableCouponUI(INBOX_ITEM_TYPE.INBOX_COUPON_RENEWAL_2002) &&
                !this.isDisableCouponUI(INBOX_ITEM_TYPE.INBOX_COUPON_WELCOME_BACK) &&
                UserInfo.instance().getUserInboxMainShopMessageCount() > 0 &&
                !hasFirstBuyCoupon;

            // 判断促销优惠券是否显示
            const showPromotionIcon = 
                !this.isDisableCouponUI(INBOX_ITEM_TYPE.INBOX_COUPON_RENEWAL_2002) &&
                ShopPromotionManager.Instance().getSeasonalPromotionInfo_CouponType() != null &&
                !hasFirstBuyCoupon &&
                UserInfo.instance().getUserInboxMainShopMessageCount() > 0;

            // 更新各节点显示状态（先判断节点是否有效）
            if (TSUtility.isValid(this.nodeCouponIcon_2)) {
                this.nodeCouponIcon_2.active = showFirstBuyIcon;
            }
            if (TSUtility.isValid(this.nodeCouponIcon_1)) {
                this.nodeCouponIcon_1.active = showNormalIcon;
            }
            if (TSUtility.isValid(this.promotionCouponNode)) {
                this.promotionCouponNode.active = showPromotionIcon;
            }
        } else {
            // 强制隐藏所有优惠券图标
            if (TSUtility.isValid(this.nodeCouponIcon_1)) {
                this.nodeCouponIcon_1.active = false;
            }
            if (TSUtility.isValid(this.nodeCouponIcon_2)) {
                this.nodeCouponIcon_2.active = false;
            }
            if (TSUtility.isValid(this.promotionCouponNode)) {
                this.promotionCouponNode.active = false;
            }
        }
    }

    /**
     * 判断指定类型的优惠券UI是否被禁用
     * @param couponType 优惠券类型
     * @returns 是否禁用
     */
    isDisableCouponUI(couponType: INBOX_ITEM_TYPE): boolean {
        return LobbyUI_Coupon.arrDisableCouponUI.some(type => type === couponType);
    }

    /**
     * 激活/禁用指定类型的优惠券UI
     * @param couponType 优惠券类型
     * @param isActive 是否激活（1=激活，0=禁用）
     */
    activeCouponContents(couponType: INBOX_ITEM_TYPE, isActive: number): void {
        if (isActive === 1) {
            // 激活：从禁用数组中移除
            const index = LobbyUI_Coupon.arrDisableCouponUI.findIndex(type => type === couponType);
            if (index !== -1) {
                LobbyUI_Coupon.arrDisableCouponUI.splice(index, 1);
            }
        } else {
            // 禁用：添加到禁用数组
            LobbyUI_Coupon.arrDisableCouponUI.push(couponType);
        }
        // 刷新UI
        this.refresh();
    }

    /**
     * 清空所有优惠券UI的激活状态
     */
    clearActiveCouponContents(): void {
        LobbyUI_Coupon.arrDisableCouponUI = [];
        this.refresh();
    }

    /**
     * 更新优惠券状态（检查过期、首购优惠券流程状态）
     */
    updateCouponState(): void {
        const currentTime = TSUtility.getServerBaseNowUnixTime();
        
        // 过滤过期的优惠券
        for (let i = this._arrExpireTime.length - 1; i >= 0; i--) {
            if (currentTime >= this._arrExpireTime[i]) {
                this._arrExpireTime.splice(i, 1);
                this._arrCouponType.splice(i, 1);
            }
        }

        // 过滤首购优惠券（未在流程中则移除）
        for (let i = this._arrExpireTime.length - 1; i >= 0; i--) {
            if (
                this._arrCouponType[i] === INBOX_ITEM_TYPE.INBOX_COUPON_FIRST_BUY 
                // &&!FirstBuyCouponManager.instance.isRunningFirstBuyCouponProcess()
            ) {
                this._arrExpireTime.splice(i, 1);
                this._arrCouponType.splice(i, 1);
            }
        }

        // 根据优惠券数组是否为空更新UI
        if (this._arrExpireTime.length === 0) {
            this.updateCouponIcon(true);
            this.unscheduleAllCallbacks();
        } else {
            this.updateCouponIcon();
        }
    }

    /**
     * 更新收件箱中的优惠券信息
     */
    updateInboxItem(): void {
        // 重置优惠券数组和定时器
        this._arrExpireTime = [];
        this._arrCouponType = [];
        this.unscheduleAllCallbacks();

        // const inboxCouponList = UserInfo.instance().getUserInboxCouponInfo();
        // if (inboxCouponList.length > 0) {
        //     // 遍历优惠券列表解析信息
        //     for (const couponItem of inboxCouponList) {
        //         if (couponItem.message.expireDate > 0) {
        //             // 解析优惠券额外信息
        //             const extraInfoJson = JSON.parse(couponItem.message.extraInfo);
        //             const leagueRewardInfo = InboxExtraInfoLeagueReward.parse(extraInfoJson);
        //             const couponExtraInfo = MainShopCouponExtraInfo.parse(leagueRewardInfo.rewardItem.extraInfo);

        //             // 存储过期时间和类型
        //             this._arrExpireTime.push(couponItem.message.expireDate);
        //             this._arrCouponType.push(couponItem.message.mType);

        //             // 更新优惠券倍率显示
        //             if (TSUtility.isValid(couponExtraInfo.moreCoinRate)) {
        //                 this.lblCouponRate.string = `${couponExtraInfo.moreCoinRate.toString()}%`;
        //             }
        //         }
        //     }

        //     // 先更新一次状态，然后定时刷新（延迟0.8s后，每0.5s刷新一次）
        //     this.updateCouponState();
        //     this.scheduleOnce(() => {
        //         this.schedule(() => {
        //             this.updateCouponState();
        //         }, 0.5);
        //     }, 0.8);
        // } else {
        //     // 无优惠券时强制隐藏UI
        //     this.updateCouponIcon(true);
        // }
    }

    /**
     * 隐藏所有优惠券UI
     */
    hideCouponUI(): void {
        this.nodeCouponIcon_1.active = false;
        this.nodeCouponIcon_2.active = false;
        this.promotionCouponNode.active = false;
    }
}