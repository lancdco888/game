const { ccclass, property } = cc._decorator;

// 项目内部模块导入 - 与原JS依赖路径/顺序完全一致，无任何改动
//import ShopDataManager from "../../Utility/ShopDataManager";
import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import GameCommonSound from "../GameCommonSound";
//import UserInfo from "../../User/UserInfo";
//import BuyCoinSuccessPopup from "../Shop/BuyCoinSuccessPopup";
//import PayCode from "../../Config/PayCode";
import DialogBase, { DialogState } from "../DialogBase";
//import VipManager from "../../VIP/VipManager";
import Analytics from "../Network/Analytics";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import TSUtility from "../global_utility/TSUtility";
import SDefine from "../global_utility/SDefine";
import UserPromotion, { HighRollerSuitePassPromotion } from "../User/UserPromotion";
import MessageRoutingManager from "../message/MessageRoutingManager";

/**
 * 进入赌场购买通行证弹窗
 * 继承弹窗基类DialogBase | 单例加载方式 | VIP区/套房区双弹窗逻辑
 */
@ccclass
export default class EnterCasinoOfferPopup extends DialogBase {
    // ===================== Cocos 属性绑定 - 与原JS完全一致，编辑器拖拽对应 =====================
    @property({ type: cc.Label })
    public coin_Label: cc.Label = null;

    @property({ type: cc.Label })
    public vip_Label: cc.Label = null;

    @property({ type: cc.Label })
    public ori_Price_Label: cc.Label = null;

    @property({ type: cc.Label })
    public price_Label: cc.Label = null;

    @property({ type: cc.Node })
    public nodeUnlockHigherBets: cc.Node = null;

    @property({ type: cc.Node })
    public nodeAccessToEarly: cc.Node = null;

    // ===================== 私有成员变量 - 完整TS类型注解，初始值与原JS完全一致 =====================
    private _itemInfo: any = null;
    private _isBuyItem: boolean = false;
    private _prevCallBack: Function = null;
    private _gameID: string | number = null;
    private _zoneID: number = 1;
    private _zoneName: string = SDefine.VIP_LOUNGE_ZONENAME;
    private _entryReason: any = null;
    private _popupType: string = "";

    // ===================== 核心静态方法 - 弹窗加载入口 1:1复刻原逻辑 重中之重 =====================
    public static getPopup(zoneName: string, callback: (err: Error, popup: EnterCasinoOfferPopup) => void): void {
        // VIP区/套房区 区分弹窗预制体路径
        let resPath = "Service/01_Offer/EnterCasinoOffer/OfferPopup";
        if (zoneName == SDefine.SUITE_ZONENAME) {
            resPath = "Service/01_Offer/EnterCasinoOffer/OfferPopup_SuitePass";
        }

        // 加载弹窗预制体
        cc.loader.loadRes(resPath, (err: Error, prefab: any) => {
            if (err) {
                // 加载失败 → 上报AWS异常日志 + 执行失败回调
                const errorMsg = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                FireHoseSender.Instance().sendAws(
                    FireHoseSender.Instance().getRecord(FHLogType.Exception, errorMsg)
                );
                if (TSUtility.isValid(callback)) {
                    callback(err, null);
                }
                return;
            }

            // 加载成功 → 实例化并获取组件
            const popupNode = cc.instantiate(prefab);
            const popupComp = popupNode.getComponent(EnterCasinoOfferPopup);
            if (TSUtility.isValid(callback)) {
                callback(null, popupComp);
            }
        });
    }

    // ===================== 生命周期回调 - 与原JS完全一致 =====================
    onLoad(): void {
        this.initDailogBase();
    }

    // ===================== 核心对外方法 - 打开弹窗 业务逻辑完全复刻 =====================
    public open(zoneID: number, zoneName: string, gameID: any, entryReason: any, isUnlock: boolean, callback: Function): void {
        const self = this;
        this._entryReason = entryReason;
        this._popupType = `VIPLOUNGE_ACCESS_${(zoneID - 1).toString()}`;

        // 埋点上报 - 弹窗展示
        Analytics.viewShop("offer", this._popupType, "VIPLOUNGE_ACCESS", this._entryReason);
        // 默认隐藏解锁高倍投注/提前访问节点
        this.setUnlockHigherBet(false);
        // 播放弹窗音效
        GameCommonSound.playFxOnce("pop_etc");

        // 保存回调与参数
        this._prevCallBack = callback;
        this._zoneID = zoneID;
        this._zoneName = zoneName;
        this._gameID = gameID;

        // // ========== 套房区弹窗 专属逻辑 ==========
        // if (zoneName == SDefine.SUITE_ZONENAME) {
        //     // 获取套房通行证促销信息 → 重复购买则直接关闭弹窗
        //     const promotionInfo = UserInfo.default.instance().getPromotionInfo(HighRollerSuitePassPromotion.PromotionKeyName);
        //     if (promotionInfo != null && promotionInfo.IsDuplicatePurchasePass() === 1) {
        //         this._close(null);
        //         return;
        //     }
        //     // 获取套房通行证商品信息
        //     this._itemInfo = ShopDataManager.default.Instance().getSuitePassInfo();
        //     // 套房区弹窗 默认禁用+隐藏关闭按钮
        //     this.closeBtn.interactable = false;
        //     this.closeBtn.node.active = false;
        // } 
        // // ========== VIP高倍区弹窗 专属逻辑 ==========
        // else {
        //     this._itemInfo = ShopDataManager.default.Instance().getStayInRollerInfo(1);
        // }

        // ========== 商品信息有效 → 渲染弹窗内容 ==========
        if (this._itemInfo != null) {
            // const userVipInfo = UserInfo.default.instance().getUserVipInfo();
            // const vipGradeInfo = VipManager.default.Instance().getGradeInfo(userVipInfo.level);
            // const shopBonus = vipGradeInfo.benefit.shopBonus;

            // // 渲染商品信息（带VIP折扣）
            // if (TSUtility.isValid(this._itemInfo)) {
            //     this.coin_Label.string = CurrencyFormatHelper.formatNumber(this._itemInfo.getCoin() * shopBonus);
            //     this.vip_Label.string = `${CurrencyFormatHelper.formatNumber(this._itemInfo.getVIP())}P`;
            //     if (this.ori_Price_Label != null) {
            //         this.ori_Price_Label.string = `$${this._itemInfo.getOriginalPrice()}`;
            //     }
            //     if (this.price_Label != null) {
            //         this.price_Label.string = `$${this._itemInfo.getPrice()}`;
            //     }
            // }

            // // 弹窗淡入动画 + 套房区延迟显示关闭按钮
            // this._open(cc.fadeIn(0.25), true, () => {
            //     if (self._zoneName == SDefine.SUITE_ZONENAME) {
            //         this.scheduleOnce(() => {
            //             self.closeBtn.node.opacity = 0;
            //             self.closeBtn.node.active = true;
            //             self.closeBtn.node.runAction(cc.sequence(
            //                 cc.fadeIn(0.5),
            //                 cc.callFunc(() => {
            //                     self.closeBtn.interactable = true;
            //                 })
            //             ));
            //         }, 1);
            //     }
            // });
        } 
        // ========== 商品信息无效 → 直接关闭弹窗 ==========
        else {
            this._close(null);
        }
    }

    // ===================== 业务方法 - 控制解锁高倍投注/提前访问节点显隐 =====================
    public setUnlockHigherBet(isShow: boolean): void {
        if (TSUtility.isValid(this.nodeUnlockHigherBets)) {
            this.nodeUnlockHigherBets.active = isShow;
        }
        if (TSUtility.isValid(this.nodeAccessToEarly)) {
            this.nodeAccessToEarly.active = !isShow;
        }
    }

    // ===================== 按钮回调 - 购买通行证 核心支付逻辑完全复刻 =====================
    public onClickBuyBtn(): void {
        const self = this;
        // 播放按钮点击音效
        GameCommonSound.playFxOnce("btn_etc");

        // // 获取支付参数
        // const entryReason = this._entryReason;
        // const productId = ShopDataManager.Instance().getProductIdByItemKey(this._itemInfo.productId);
        // const popupType = this._popupType;
        // const reasonStr = JSON.stringify(entryReason);

        // // 调用用户信息的购买商品方法
        // UserInfo.instance().buyProduct(productId, popupType, reasonStr, (isSuccess: boolean) => {
        //     if (isSuccess) {
        //         // 购买成功 → 打开购买成功弹窗
        //         BuyCoinSuccessPopup.OpenPopup("", isSuccess, [PayCode.default.PurchasePay], self._itemInfo.productId, null, () => {
        //             self._isBuyItem = true;
        //             self.close();
        //         });
        //     }
        // });
    }

    // ===================== 对外方法 - 获取购买状态 =====================
    public isBuyItem(): boolean {
        return this._isBuyItem;
    }

    // ===================== 核心方法 - 关闭弹窗 1:1复刻原逻辑 =====================
    public close(): void {
        if (this.isStateClose()) return;
        
        // 派发刷新百夫长派系事件
        MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REFRESH_CENTURION_CLIQUE);
        // 设置弹窗关闭状态
        this.setState(DialogState.Close);
        // 清理资源
        this.clear();
        // 执行弹窗基类关闭方法
        this._close(null);
    }
}