import PlayAniOnActiveCurrentNode from "../BigWinEffect/PlayAniOnActiveCurrentNode";
import GameCommonSound from "../GameCommonSound";
import LobbyUIBase, { LobbyUIType } from "../LobbyUIBase";
import Analytics from "../Network/Analytics";
import ServiceInfoManager from "../ServiceInfoManager";
import ChangeNumberComponent from "../Slot/ChangeNumberComponent";
import TutorialCoinPromotion, { IntroduceInfo } from "../TutorialCoinPromotion";
import UserInfo, { MSG } from "../User/UserInfo";
import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import SDefine from "../global_utility/SDefine";
import { Utility } from "../global_utility/Utility";
import MessageRoutingManager from "../message/MessageRoutingManager";
import ShopPromotionManager from "../message/ShopPromotionManager";
import LobbyUI_Coupon from "./LobbyUI_Coupon";

// 严格遵循指定的装饰器导出方式
const { ccclass, property } = cc._decorator;


/**
 * 大厅资金（金币）UI组件
 */
@ccclass()
export default class LobbyUI_Bankroll extends LobbyUIBase {
    // ===================== 序列化属性（对应编辑器绑定） =====================
    @property({ type: cc.Button })
    btnShop: cc.Button = null!; // 商店按钮

    @property({ type: cc.Button })
    btnCoin: cc.Button = null!; // 金币按钮

    @property({ type: cc.Button })
    btnBankroll: cc.Button = null!; // 资金按钮

    @property({ type: cc.Button })
    btnSale: cc.Button = null!; // 促销按钮

    @property({ type: cc.Node })
    nodeIntroCoin: cc.Node = null!; // 金币引导节点

    @property({ type: cc.Node })
    nodeCoinIcon: cc.Node = null!; // 金币图标节点

    @property({ type: cc.Label })
    lblCoin: cc.Label = null!; // 金币显示文本

    // ===================== 私有成员变量 =====================
    private _infoIntroduce: IntroduceInfo | null = null; // 引导信息对象

    // ===================== 只读属性（Getter） =====================
    /**
     * 获取UI类型（重写父类属性）
     */
    get eType(): LobbyUIType {
        return LobbyUIType.BANKROLL;
    }

    /**
     * 获取引导信息
     */
    get infoIntroduce(): IntroduceInfo | null {
        return this._infoIntroduce;
    }

    /**
     * 获取金币标签
     */
    get coinLabel(): cc.Label {
        return this.lblCoin;
    }

    // ===================== 生命周期函数 =====================
    onLoad(): void {
        // 绑定按钮点击事件
        this.btnShop.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "LobbyUI_Bankroll", "onClick_Shop", "")
        );
        this.btnCoin.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "LobbyUI_Bankroll", "onClick_Coin", "")
        );
        this.btnSale.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "LobbyUI_Bankroll", "onClick_Coin", "")
        );
        this.btnBankroll.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "LobbyUI_Bankroll", "onClick_Coin", "")
        );

        // // 初始化引导信息
        // this._infoIntroduce = new TutorialCoinPromotion.IntroduceInfo(
        //     TutorialCoinPromotion.INTRODUCE_MAIN.MAIN_SHOP,
        //     "MAIN_SHOP",
        //     this.nodeIntroCoin,
        //     this.openPopup.bind(this)
        // );

        // 注册消息监听
        MessageRoutingManager.instance().addListenerTarget(
            MessageRoutingManager.MSG.UPDATE_SERVICE_INTRODUCE_COIN,
            this.updateIntroduce,
            this
        );
    }

    onDestroy(): void {
        // 移除所有消息监听
        MessageRoutingManager.instance().removeListenerTargetAll(this);
        UserInfo.instance().removeListenerTargetAll(this);
        // 取消所有定时器
        this.unscheduleAllCallbacks();
    }

    onEnable(): void {
        // 注册资产更新监听
        UserInfo.instance().addListenerTarget(
            MSG.UPDATE_ASSET,
            this.refresh.bind(this),
            this
        );
    }

    onDisable(): void {
        // 移除资产更新监听
        UserInfo.instance().removeListenerTargetAll(this);
    }

    // ===================== 业务方法 =====================
    /**
     * 获取金币目标节点（用于特效等）
     */
    getCoinTarget(): cc.Node {
        return this.nodeCoinIcon;
    }

    /**
     * 刷新UI显示
     */
    refresh(): void {
        // 更新金币显示（格式化数字）
        this.lblCoin.string = CurrencyFormatHelper.formatNumber(
            UserInfo.instance()._userInfo.userAssetInfo.totalCoin
        );

        // 根据iOS商店标识切换按钮显示逻辑
        if (!SDefine.FB_Instant_iOS_Shop_Flag) {
            this.updatePromotionUI();
            // 每秒刷新一次促销UI
            this.schedule(this.updatePromotionUI, 1);
        } else {
            this.btnShop.node.active = false;
            this.btnSale.node.active = false;
            this.btnCoin.node.active = true;
        }
    }

    /**
     * 克隆节点后清理事件（静态方法）
     * @param target 目标组件/节点
     */
    static clearEvent_AfterCloneItem(target:any): void {
        const targetNode = target.node;
        // 禁用所有子节点的按钮
        targetNode.getComponentsInChildren(cc.Button).forEach(btn => {
            btn.enabled = false;
        });
        // 停止并禁用所有子节点的动画
        targetNode.getComponentsInChildren(cc.Animation).forEach(ani => {
            ani.stop();
            ani.enabled = false;
            ani.playOnLoad = false;
        });
        // 禁用BigWin特效组件
        targetNode.getComponentsInChildren(PlayAniOnActiveCurrentNode).forEach(comp => {
            comp.enabled = false;
        });
        // 移除优惠券组件
        const couponComp = target.getComponentInChildren(LobbyUI_Coupon);
        if (couponComp) {
            couponComp.node.removeComponent(LobbyUI_Coupon);
        }
        // 隐藏引导节点
        target.nodeIntroCoin.active = false; // 注：原代码中target应为当前类实例，需确认调用逻辑
        // 移除当前组件
        targetNode.removeComponent(LobbyUI_Bankroll);
    }

    /**
     * 为金币标签添加数字变化组件（静态方法）
     * @param target 当前类实例
     * @returns ChangeNumberComponent实例
     */
    static makeCoinLabelChangeNumberComponent(target: LobbyUI_Bankroll): ChangeNumberComponent {
        let changeNumComp = target.coinLabel.getComponent(ChangeNumberComponent);
        if (!changeNumComp) {
            changeNumComp = target.coinLabel.addComponent(ChangeNumberComponent);
            changeNumComp.label = target.coinLabel;
            changeNumComp.useComma = true;
            changeNumComp.changetimetick = 0.1;
            changeNumComp.totalchangetime = 1;
        }
        return changeNumComp;
    }

    /**
     * 获取红点数量（重写父类方法）
     */
    getRedDotCount(): number {
        return 0;
    }

    /**
     * 打开商店弹窗
     */
    openPopup(): void {
        // 埋点统计
        Analytics.clickShop("shop", "REGULAR_COINS_PACK", "REGULAR_COINS_PACK");

        // // 根据iOS商店标识切换弹窗类型
        // if (SDefine.FB_Instant_iOS_Shop_Flag) {
        //     PopupManager.Instance().showDisplayProgress(true);
        //     Instant_iOS_Shop.getPopup((err: any, popup: Instant_iOS_Shop) => {
        //         PopupManager.Instance().showDisplayProgress(false);
        //         if (!TSUtility.isValid(err)) {
        //             popup.open();
        //         }
        //     });
        // } else {
        //     PopupManager.Instance().showDisplayProgress(true);
        //     MainShopPopupRenewal.getMainShopPopup((err: any, popup: MainShopPopupRenewal) => {
        //         PopupManager.Instance().showDisplayProgress(false);
        //         if (!TSUtility.isValid(err)) {
        //             popup.open(
        //                 new CommonServer.PurchaseEntryReason(SDefine.P_ENTRYPOINT_LOBBYBANKROLL, true),
        //                 true
        //             );
        //         }
        //     });
        // }
    }

    /**
     * 商店按钮点击事件
     */
    onClick_Shop(): void {
        if (!this.isEnableIntroduce()) { // 注：需确认isEnableIntroduce方法是否在父类LobbyUIBase中定义
            GameCommonSound.playFxOnce("btn_shop");
            this.openPopup();
        }
    }

    /**
     * 金币按钮点击事件
     */
    onClick_Coin(): void {
        if (!this.isEnableIntroduce()) { // 注：需确认isEnableIntroduce方法是否在父类LobbyUIBase中定义
            GameCommonSound.playFxOnce("btn_shop");
            this.openPopup();
        }
    }

    /**
     * 更新促销UI显示
     */
    updatePromotionUI(): void {
        // 判断是否有促销活动
        const hasPromotion = 
            ShopPromotionManager.Instance().getSeasonalPromotionInfo_ShopType() != null ||
            ShopPromotionManager.Instance().getSeasonalPromotionInfo_PopupType() != null ||
            ServiceInfoManager.instance.isAbleNewbieShopPromotion();
        
        this.btnShop.node.active = !hasPromotion;
        this.btnSale.node.active = hasPromotion;
        this.btnCoin.node.active = false;
    }

    /**
     * 隐藏所有按钮
     */
    hideAllButton(): void {
        this.btnCoin.node.active = false;
        this.btnSale.node.active = false;
        this.hideShopButton();
    }

    /**
     * 隐藏商店按钮
     */
    hideShopButton(): void {
        this.btnShop.node.active = false;
        this.btnCoin.node.active = false;
    }

    /**
     * 更新引导UI（注：原代码中未实现，需根据业务补充）
     */
    updateIntroduce(): void {
        // 请根据实际业务逻辑补充引导UI的更新逻辑
    }

    /**
     * 检查引导是否启用（注：需确认父类或业务逻辑中的实现）
     */
    isEnableIntroduce(): boolean {
        // 请根据实际业务逻辑补充判断逻辑，示例返回false
        return false;
    }
}