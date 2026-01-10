import { INBOX_ITEM_TYPE } from "../../../Script/InboxMessagePrefabManager";
import ServiceInfoManager from "../../../Script/ServiceInfoManager";
import UserInboxInfo from "../../../Script/User/UserInboxInfo";
import UserInfo, { MSG } from "../../../Script/User/UserInfo";
import UserInven, { MainShopCouponExtraInfo } from "../../../Script/User/UserInven";
import SDefine from "../../../Script/global_utility/SDefine";
import TSUtility from "../../../Script/global_utility/TSUtility";
import ShopPromotionManager from "../../../Script/message/ShopPromotionManager";

const { ccclass, property } = cc._decorator;

/**
 * 游戏内资金促销UI组件（InGameBankRollPromotionUI）
 * 负责优惠券显示、促销状态更新、背景节点切换、优惠券禁用列表管理
 */
@ccclass()
export default class InGameBankRollPromotionUI extends cc.Component {
    // ================= 静态属性（优惠券禁用列表） =================
    public static listDisableCouponUI: number[] = []; // 禁用的优惠券UI类型列表

    // ================= 分区背景索引常量 =================
    private readonly _indexBGHighroller: number = 0; // Highroller分区背景索引
    private readonly _indexBGElectric: number = 1;   // Electric分区背景索引
    private readonly _indexBGVipLounge: number = 2;  // VIP Lounge分区背景索引
    private readonly _indexBGSuite: number = 3;      // Suite分区背景索引

    // ================= 可序列化属性（编辑器面板配置） =================
    @property(cc.Node)
    public nodeSale: cc.Node  = null; // 促销售卖节点

    @property(cc.Node)
    public nodeShop: cc.Node  = null; // 商店节点

    @property(cc.Node)
    public nodeCoin: cc.Node = null; // 金币节点

    @property(cc.Node)
    public couponIcon: cc.Node  = null; // 优惠券图标1

    @property(cc.Node)
    public couponIcon2: cc.Node  = null; // 优惠券图标2

    @property(cc.Node)
    public promotionCouponNode: cc.Node  = null; // 促销优惠券节点

    @property(cc.Label)
    public couponRate: cc.Label = null; // 优惠券倍率标签

    @property([cc.Node])
    public listBG: cc.Node[] = []; // 分区背景节点列表

    @property
    public isShopBankRoll: boolean = false; // 是否为资金商店

    // ================= 私有状态变量 =================
    private expireTime: number[] = []; // 优惠券过期时间列表
    private couponRateList: number[] = []; // 优惠券倍率列表（原代码未使用，保留）
    private listCouponType: number[] = []; // 优惠券类型列表

    // ================= 生命周期函数 =================
    onLoad() {
        // 监听优惠券信息更新事件
        UserInfo.instance().addListenerTarget(
            MSG.UPDATE_COUPONINFO,
            this.updateCouponUI.bind(this),
            this
        );

        // 初始化优惠券图标和UI状态
        this.updateCouponIcon(true);
        this.updateCouponUI();
    }

    // ================= 核心业务逻辑 =================
    /**
     * 更新优惠券整体UI状态
     */
    public updateCouponUI(): void {
        if (!SDefine.FB_Instant_iOS_Shop_Flag) {
            // iOS FB小游戏环境：初始化收件箱优惠券 + 启动促销状态刷新
            this.initInboxItem();
            this.updatePromotionState();
            this.schedule(this.updatePromotionState, 1); // 每1秒刷新促销状态
        } else {
            // 非iOS FB小游戏环境：隐藏商店/售卖节点，显示金币节点
            TSUtility.isValid(this.nodeShop) && (this.nodeShop.active = false);
            TSUtility.isValid(this.nodeSale) && (this.nodeSale.active = false);
            TSUtility.isValid(this.nodeCoin) && (this.nodeCoin.active = true);
            this.updateCouponIcon(true);
        }

        // 根据分区切换背景节点
        this.setBGNode();
    }

    /**
     * 初始化收件箱优惠券信息
     */
    public initInboxItem(): void {
        // 重置状态变量 + 取消所有调度
        this.expireTime = [];
        this.listCouponType = [];
        this.unscheduleAllCallbacks();

        // // 获取用户收件箱优惠券信息
        // const inboxCouponList = UserInfo.instance().getUserInboxCouponInfo();
        // if (inboxCouponList.length <= 0) {
        //     this.updateCouponIcon(true);
        //     return;
        // }

        // // 解析优惠券信息（过期时间、类型、倍率）
        // for (let i = 0; i < inboxCouponList.length; ++i) {
        //     const couponItem = inboxCouponList[i];
        //     if (couponItem.message.expireDate <= 0) continue;

        //     // 解析额外信息
        //     const extraInfoJson = JSON.parse(couponItem.message.extraInfo);
        //     const leagueRewardInfo = UserInboxInfo.InboxExtraInfoLeagueReward.parse(extraInfoJson);
        //     const couponExtraInfo = MainShopCouponExtraInfo.parse(leagueRewardInfo.rewardItem.extraInfo);

        //     // 记录过期时间和优惠券类型
        //     this.expireTime.push(couponItem.message.expireDate);
        //     this.listCouponType.push(couponItem.message.mType);

        //     // 更新优惠券倍率显示
        //     if (TSUtility.isValid(couponExtraInfo.moreCoinRate)) {
        //         this.couponRate!.string = `${couponExtraInfo.moreCoinRate.toString()}%`;
        //     }
        // }

        // 资金商店场景：延迟刷新优惠券状态（每0.5秒）
        if (this.isShopBankRoll) {
            this.updateCouponState();
            this.scheduleOnce(() => {
                this.updateCouponState();
                this.schedule(() => this.updateCouponState(), 0.5);
            }, 0.8);
        }
    }

    /**
     * 更新促销状态（控制商店/售卖节点显隐）
     */
    public updatePromotionState(): void {
        // 判断是否有促销活动
        const hasPromotion = 
            ShopPromotionManager.Instance().getSeasonalPromotionInfo_ShopType() !== null ||
            ShopPromotionManager.Instance().getSeasonalPromotionInfo_PopupType() !== null ||
            ServiceInfoManager.instance.isAbleNewbieShopPromotion();

        // 更新节点显隐
        TSUtility.isValid(this.nodeShop) && (this.nodeShop.active = !hasPromotion);
        TSUtility.isValid(this.nodeSale) && (this.nodeSale.active = hasPromotion);
        TSUtility.isValid(this.nodeCoin) && (this.nodeCoin.active = false);
    }

    /**
     * 更新优惠券状态（校验过期时间、首购优惠券状态）
     */
    public updateCouponState(): void {
        const currentTime = TSUtility.getServerBaseNowUnixTime();

        // 1. 移除已过期的优惠券
        for (let i = this.expireTime.length - 1; i >= 0; --i) {
            if (currentTime >= this.expireTime[i]) {
                this.expireTime.splice(i, 1);
                this.listCouponType.splice(i, 1);
            }
        }

        // 2. 移除首购优惠券（未在处理中）
        for (let i = this.listCouponType.length - 1; i >= 0; --i) {
            const couponType = this.listCouponType[i];
            if (
                couponType === INBOX_ITEM_TYPE.INBOX_COUPON_FIRST_BUY 
                //&&
                //!FirstBuyCouponManager.instance.isRunningFirstBuyCouponProcess()
            ) {
                this.expireTime.splice(i, 1);
                this.listCouponType.splice(i, 1);
            }
        }

        // 3. 无有效优惠券：隐藏图标 + 取消所有调度
        if (this.expireTime.length === 0) {
            this.updateCouponIcon(true);
            this.unscheduleAllCallbacks();
        } else {
            this.updateCouponIcon();
        }
    }

    /**
     * 更新优惠券图标显隐
     * @param isHideAll 是否隐藏所有图标（默认false）
     */
    public updateCouponIcon(isHideAll: boolean = false): void {
        if (isHideAll) {
            // 隐藏所有优惠券图标
            TSUtility.isValid(this.couponIcon) && (this.couponIcon.active = false);
            TSUtility.isValid(this.couponIcon2) && (this.couponIcon2.active = false);
            TSUtility.isValid(this.promotionCouponNode) && (this.promotionCouponNode.active = false);
            return;
        }

        // 判断是否包含首购优惠券
        const hasFirstBuyCoupon = this.listCouponType.some(
            (type) => type === INBOX_ITEM_TYPE.INBOX_COUPON_FIRST_BUY
        );

        // 判断首购优惠券UI是否可用
        const isFirstBuyCouponUIEnabled = 
            !this.isDisableCouponUI(INBOX_ITEM_TYPE.INBOX_COUPON_FIRST_BUY) && 
            hasFirstBuyCoupon;

        // 判断续费/回归优惠券UI是否可用
        const isRenewalWelcomeCouponUIEnabled = 
            !this.isDisableCouponUI(INBOX_ITEM_TYPE.INBOX_COUPON_RENEWAL_2002) &&
            !this.isDisableCouponUI(INBOX_ITEM_TYPE.INBOX_COUPON_WELCOME_BACK) &&
            UserInfo.instance().getUserInboxMainShopMessageCount() > 0;

        // 判断促销优惠券UI是否可用
        const isPromotionCouponUIEnabled = 
            !this.isDisableCouponUI(INBOX_ITEM_TYPE.INBOX_COUPON_RENEWAL_2002) &&
            ShopPromotionManager.Instance().getSeasonalPromotionInfo_CouponType() !== null;

        // 更新各图标显隐
        TSUtility.isValid(this.couponIcon2) && (this.couponIcon2.active = isFirstBuyCouponUIEnabled);
        TSUtility.isValid(this.couponIcon) && (
            this.couponIcon.active = !hasFirstBuyCoupon && isRenewalWelcomeCouponUIEnabled && !isPromotionCouponUIEnabled
        );
        TSUtility.isValid(this.promotionCouponNode) && (
            this.promotionCouponNode.active = !hasFirstBuyCoupon && isRenewalWelcomeCouponUIEnabled && isPromotionCouponUIEnabled
        );
    }

    /**
     * 判断优惠券UI是否被禁用
     * @param couponType 优惠券类型
     * @returns 是否禁用
     */
    public isDisableCouponUI(couponType: number): boolean {
        return InGameBankRollPromotionUI.listDisableCouponUI.some((type) => type === couponType);
    }

    /**
     * 激活/禁用优惠券UI
     * @param couponType 优惠券类型
     * @param isActive 是否激活（1=激活，0=禁用）
     */
    public activeCouponContents(couponType: number, isActive: number): void {
        if (isActive === 1) {
            // 激活：从禁用列表移除
            const index = InGameBankRollPromotionUI.listDisableCouponUI.findIndex((type) => type === couponType);
            if (index !== -1) {
                InGameBankRollPromotionUI.listDisableCouponUI.splice(index, 1);
            }
        } else {
            // 禁用：添加到禁用列表
            InGameBankRollPromotionUI.listDisableCouponUI.push(couponType);
        }

        // 刷新UI
        this.updateCouponUI();
    }

    /**
     * 清空优惠券禁用列表
     */
    public clearActiveCouponContents(): void {
        InGameBankRollPromotionUI.listDisableCouponUI = [];
        this.updateCouponUI();
    }

    /**
     * 根据游戏分区切换背景节点
     */
    public setBGNode(): void {
        if (this.listBG.length === 0) return;

        // 隐藏所有背景节点
        this.listBG.forEach((bgNode) => {
            bgNode.active = false;
        });

        // 根据当前分区确定背景索引
        let bgIndex: number | undefined;
        const currentZone = UserInfo.instance()._zoneName;
        switch (currentZone) {
            case SDefine.SUITE_ZONENAME:
                bgIndex = this._indexBGSuite;
                break;
            case SDefine.VIP_LOUNGE_ZONENAME:
                bgIndex = this._indexBGVipLounge;
                break;
            case SDefine.LIGHTNING_ZONENAME:
                bgIndex = this._indexBGElectric;
                break;
            case SDefine.HIGHROLLER_ZONENAME:
                bgIndex = this._indexBGHighroller;
                break;
            default:
                cc.log(`InGameBankRollPromotionUI: 未知分区 ${currentZone}，未切换背景`);
                return;
        }

        // 显示对应背景节点
        if (TSUtility.isValid(this.listBG[bgIndex])) {
            this.listBG[bgIndex].active = true;
        }
    }
}