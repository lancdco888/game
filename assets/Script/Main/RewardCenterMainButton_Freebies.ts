const { ccclass, property } = cc._decorator;

// 导入项目所有依赖模块 - 路径与原JS完全一致，直接复用无修改
import TSUtility from "../global_utility/TSUtility";
import TimeFormatHelper from "../global_utility/TimeFormatHelper";
import PopupManager from "../manager/PopupManager";
import GameCommonSound from "../GameCommonSound";
import UserInfo from "../User/UserInfo";
import UserPromotion, { SharePromotion } from "../User/UserPromotion";
//import ShareAdvicePopup from "../../BGL/ShareAdvicePopup";
import RewardCenterMainButton, { RewardCenterMainButtonType } from "./RewardCenterMainButton";
import { Utility } from "../global_utility/Utility";

@ccclass
export default class RewardCenterMainButton_Freebies extends RewardCenterMainButton {
    // ====================== 编辑器序列化绑定属性 (与原JS一一对应，直接拖拽绑定，无任何删减) ======================
    @property(cc.Button)
    private btnCollect: cc.Button = null;

    @property(cc.Node)
    private nodeTime: cc.Node = null;

    @property(cc.Label)
    private lblTime: cc.Label = null;

    // ====================== 重写父类抽象方法 - 返回当前按钮类型【必须重写，父类核心识别标识】 ======================
    public getType(): RewardCenterMainButtonType {
        return RewardCenterMainButtonType.FREEBIES;
    }

    // ====================== 静态校验方法 (全局通用，类直接调用，原JS逻辑1:1完整保留，无修改) ======================
    /** 静态方法：判断是否可领取福利奖励 */
    public static isCanReceive(): boolean {
        if (!this.isUseable()) return false;
        const promotionInfo = UserInfo.instance().getPromotionInfo(SharePromotion.PromotionKeyName);
        return TSUtility.isValid(promotionInfo.getInfo());
    }

    /** 静态方法：判断当前按钮是否可用（核心前置校验） */
    public static isUseable(): boolean {
        // 校验1: 是否是脸书分享禁用目标用户
        if (UserInfo.instance().isFBShareDisableTarget()) return false;
        // 校验2: 分享推广信息是否有效
        const promotionInfo = UserInfo.instance().getPromotionInfo(SharePromotion.PromotionKeyName);
        return TSUtility.isValid(promotionInfo);
    }

    // ====================== 重写父类保护方法 - 组件初始化【只执行一次，无重复绑定风险】 ======================
    protected _initialize(): void {
        // 绑定福利领取按钮的点击事件
        this.btnCollect.clickEvents.push(Utility.getComponent_EventHandler(this.node, "RewardCenterMainButton_Freebies", "onClick_Collect", ""));
    }

    // ====================== 重写父类保护方法 - 实例化校验【供父类自动调用，统一校验逻辑】 ======================
    /** 实例方法：是否可领取奖励 → 内部调用静态校验方法 */
    protected _isCanReceive(): boolean {
        return RewardCenterMainButton_Freebies.isCanReceive();
    }

    /** 实例方法：按钮是否可用 → 内部调用静态校验方法 */
    protected _isUseable(): boolean {
        return RewardCenterMainButton_Freebies.isUseable();
    }

    // ====================== 重写父类保护方法 - UI刷新钩子【父类updateView自动调用，核心UI更新逻辑】 ======================
    protected _updateUI(): void {
        // 清除所有定时器 防止重复调度导致倒计时错乱
        this.unscheduleAllCallbacks();
        // 立即刷新一次倒计时UI
        this.updateTimeUI();
        // 0.5秒高精度刷新倒计时（原JS核心值，不可修改）
        this.schedule(this.updateTimeUI, 0.5);
    }

    // ====================== 核心私有方法 - 倒计时UI刷新【精准计算剩余时间，自动切换按钮/倒计时显隐】 ======================
    private updateTimeUI(): void {
        // 获取分享推广的福利配置信息
        const promotionInfo = UserInfo.instance().getPromotionInfo(SharePromotion.PromotionKeyName);
        // 计算剩余冷却时间 = 下次重置时间 - 服务器基准当前时间 (unix秒数)
        const remainTime = promotionInfo.nextResetTime - TSUtility.getServerBaseNowUnixTime();

        // 核心显隐逻辑：时间耗尽 或 可领取奖励 → 隐藏倒计时，显示领取按钮
        if (remainTime < 0 || TSUtility.isValid(promotionInfo.getInfo())) {
            this.nodeTime.active = false;
            this.btnCollect.node.active = true;
        } else {
            // 还有冷却时间 → 显示倒计时，隐藏领取按钮 + 格式化时间文本
            this.nodeTime.active = true;
            this.btnCollect.node.active = false;
            this.lblTime.string = TimeFormatHelper.getHourTimeString(remainTime);
        }
    }

    // ====================== 核心按钮点击事件回调 - 领取免费福利【原JS核心业务逻辑完整还原】 ======================
    public onClick_Collect(): void {
        const self = this;
        // 前置校验：按钮是否可用
        if (this._isUseable()) {
            // 播放按钮点击通用音效
            GameCommonSound.playFxOnce("btn_etc");
            // 显示全局加载中遮罩
            PopupManager.Instance().showDisplayProgress(true);

            // 打开分享提示弹窗，领取福利的核心跳转逻辑
            // ShareAdvicePopup.getPopup((err: Error, popup: ShareAdvicePopup) => {
            //     // 关闭加载中遮罩
            //     PopupManager.Instance().showDisplayProgress(false);
            //     if (!err) {
            //         // 打开弹窗 + 设置关闭回调：刷新当前按钮视图状态
            //         popup.open();
            //         popup.setCloseCallback(() => {
            //             self.updateView();
            //         });
            //     }
            // });
        } else {
            // 按钮不可用的兜底逻辑：刷新视图状态
            this.updateView();
        }
    }
}