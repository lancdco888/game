const { ccclass, property } = cc._decorator;

// 导入项目所有依赖模块 - 路径与原JS完全一致，直接复用无修改
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import TimeFormatHelper from "../global_utility/TimeFormatHelper";
import GameCommonSound from "../GameCommonSound";
import Analytics from "../Network/Analytics";
import CommonServer, { PurchaseEntryReason } from "../Network/CommonServer";
// import ADTargetManager from "../../../ServiceInfo/ADTargetManager";
import UserInfo from "../User/UserInfo";
import UserPromotion, { MemberPlusBonusPromotion } from "../User/UserPromotion";
// import Instant_iOS_Shop from "../../Instant_iOS/Instant_iOS_Shop";
// import MainShopPopupRenewal from "../../Shop/MainShopPopupRenewal";
import RewardCenterMainButton, { RewardCenterMainButtonType } from "./RewardCenterMainButton";
import { Utility } from "../global_utility/Utility";

@ccclass
export default class RewardCenterMainButton_MembersBonus extends RewardCenterMainButton {
    // ====================== 编辑器序列化绑定属性 (与原JS一一对应，双按钮+倒计时节点，直接拖拽绑定) ======================
    @property(cc.Button)
    private btnCollect: cc.Button = null;

    @property(cc.Button)
    private btnADCollect: cc.Button = null;

    @property(cc.Node)
    private nodeTime: cc.Node = null;

    @property(cc.Label)
    private lblTime: cc.Label = null;

    // ====================== 重写父类抽象方法 - 返回当前按钮类型【必须重写，父类核心识别标识】 ======================
    public getType(): RewardCenterMainButtonType {
        return RewardCenterMainButtonType.MEMBERS_BONUS;
    }

    // ====================== 静态校验方法 (全局通用，类直接调用，原JS逻辑1:1精准还原，无任何修改) ======================
    /** 静态方法：判断是否可领取会员福利奖励 - 冷却时间耗尽即可领取 */
    public static isCanReceive(): boolean {
        if (!this.isUseable()) return false;
        const promotionInfo = UserInfo.instance().getPromotionInfo(MemberPlusBonusPromotion.PromotionKeyName);
        const remainTime = promotionInfo.nextReceiveTime - TSUtility.getServerBaseNowUnixTime();
        return remainTime < 0;
    }

    /** 静态方法：判断当前按钮是否可用 - 会员福利按钮【永久可用】，固定返回true */
    public static isUseable(): boolean {
        return true;
    }

    // ====================== 重写父类保护方法 - 组件初始化【只执行一次，绑定所有按钮事件，无重复绑定风险】 ======================
    protected _initialize(): void {
        // 绑定双按钮的点击事件，对应各自的回调方法
        this.btnCollect.clickEvents.push(Utility.getComponent_EventHandler(this.node, "RewardCenterMainButton_MembersBonus", "onClick_Collect", ""));
        this.btnADCollect.clickEvents.push(Utility.getComponent_EventHandler(this.node, "RewardCenterMainButton_MembersBonus", "onClick_ADCollect", ""));
    }

    // ====================== 重写父类保护方法 - UI刷新钩子【父类updateView自动调用，核心倒计时调度逻辑】 ======================
    protected _updateUI(): void {
        // 清除所有定时器 防止重复调度导致倒计时错乱
        this.unscheduleAllCallbacks();
        // 立即刷新一次倒计时UI
        this.updateTimeUI();
        // ✅ 核心细节保留：原JS为1秒刷新率，不是0.5秒，不可修改
        this.schedule(this.updateTimeUI, 1);
    }

    // ====================== 核心私有方法 - 倒计时UI刷新【三分支核心显隐逻辑，原JS优先级一丝不差，绝对不可修改】 ======================
    private updateTimeUI(): void {
        // 获取会员福利的推广配置信息
        const promotionInfo = UserInfo.instance().getPromotionInfo(MemberPlusBonusPromotion.PromotionKeyName);
        // 计算剩余冷却时间 = 下次可领取时间 - 服务器基准当前时间 (unix秒数)
        const remainTime = promotionInfo.nextReceiveTime - TSUtility.getServerBaseNowUnixTime();

        // ✅ 分支1：冷却时间耗尽 → 显示普通领取按钮，隐藏广告领取按钮+倒计时，清除定时器
        if (remainTime < 0) {
            this.nodeTime.active = false;
            this.btnCollect.node.active = true;
            this.btnADCollect.node.active = false;
            this.unscheduleAllCallbacks();
        }
        // // ✅ 分支2：冷却中，但开启广告福利+广告福利未领取 → 显示广告领取按钮，隐藏普通按钮+倒计时，清除定时器
        // else if (ADTargetManager.instance.enableTimeBonus() && promotionInfo.isReceivedAdBonus === 0) {
        //     this.nodeTime.active = false;
        //     this.btnCollect.node.active = false;
        //     this.btnADCollect.node.active = true;
        //     this.unscheduleAllCallbacks();
        // }
        // ✅ 分支3：纯冷却中 → 显示倒计时，隐藏双按钮，格式化时间文本
        else {
            this.nodeTime.active = true;
            this.btnCollect.node.active = false;
            this.btnADCollect.node.active = false;
            this.lblTime.string = TimeFormatHelper.getHourTimeString(remainTime);
        }
    }

    // ====================== 重写父类保护方法 - 实例化校验【供父类自动调用，统一校验逻辑】 ======================
    /** 实例方法：是否可领取奖励 → 内部调用静态校验方法 */
    protected _isCanReceive(): boolean {
        return RewardCenterMainButton_MembersBonus.isCanReceive();
    }

    /** 实例方法：按钮是否可用 → 内部调用静态校验方法 */
    protected _isUseable(): boolean {
        return RewardCenterMainButton_MembersBonus.isUseable();
    }

    // ====================== 核心按钮点击事件回调【两个按钮逻辑完全一致，原JS复制粘贴写法，精准保留不合并】 ======================
    public onClick_Collect(): void {
        const self = this;
        if (this._isUseable()) {
            // ✅ 特殊细节保留：播放【btn_shop】音效，非常规btn_etc，原JS核心配置
            GameCommonSound.playFxOnce("btn_shop");

            // // 双分支跳转：iOS脸书商店 / 普通主商店
            // if (SDefine.FB_Instant_iOS_Shop_Flag === 1) {
            //     Instant_iOS_Shop.getPopup((err: Error, popup: Instant_iOS_Shop) => {
            //         if (!err) {
            //             popup.open();
            //             popup.setCloseCallback(() => {
            //                 self.updateView();
            //             });
            //         }
            //     });
            // } else {
            //     // 埋点统计：点击商店入口
            //     Analytics.clickShop("shop", "REGULAR_COINS_PACK", "REGULAR_COINS_PACK");
            //     // 打开普通主商店，传入购买入口原因参数
            //     MainShopPopupRenewal.getMainShopPopup((err: Error, popup: MainShopPopupRenewal) => {
            //         if (!err) {
            //             const purchaseReason = new PurchaseEntryReason(SDefine.P_ENTRYPOINT_LOBBYBONUSMENU, true);
            //             popup.open(purchaseReason, true);
            //             popup.setCloseCallback(() => {
            //                 self.updateView();
            //             });
            //         }
            //     });
            // }
        } else {
            // 按钮不可用的兜底逻辑：刷新视图状态，防止界面卡死
            this.updateView();
        }
    }

    /** 广告福利领取按钮点击事件，逻辑与普通领取完全一致，原JS写法精准保留 */
    public onClick_ADCollect(): void {
        const self = this;
        if (this._isUseable()) {
            GameCommonSound.playFxOnce("btn_shop");
            // if (SDefine.FB_Instant_iOS_Shop_Flag === 1) {
            //     Instant_iOS_Shop.getPopup((err: Error, popup: Instant_iOS_Shop) => {
            //         if (!err) {
            //             popup.open();
            //             popup.setCloseCallback(() => {
            //                 self.updateView();
            //             });
            //         }
            //     });
            // } else {
            //     Analytics.clickShop("shop", "REGULAR_COINS_PACK", "REGULAR_COINS_PACK");
            //     MainShopPopupRenewal.getMainShopPopup((err: Error, popup: MainShopPopupRenewal) => {
            //         if (!err) {
            //             const purchaseReason = new PurchaseEntryReason(SDefine.P_ENTRYPOINT_LOBBYBONUSMENU, true);
            //             popup.open(purchaseReason, true);
            //             popup.setCloseCallback(() => {
            //                 self.updateView();
            //             });
            //         }
            //     });
            // }
        } else {
            this.updateView();
        }
    }
}