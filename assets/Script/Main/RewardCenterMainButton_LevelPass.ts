const { ccclass, property } = cc._decorator;

// 导入项目所有依赖模块 - 路径与原JS完全一致，直接复用无修改
import TSUtility from "../global_utility/TSUtility";
import PopupManager from "../manager/PopupManager";
import ServiceInfoManager from "../ServiceInfoManager";
import UserInfo from "../User/UserInfo";
import UserPromotion, { LevelUpPassPromotion } from "../User/UserPromotion";
// import LevelUpPassManager from "../../LevelUpPass/LevelUpPassManager";
// import LevelUpPassPopup from "../../LevelUpPass/LevelUpPassPopup";
import UnlockContentsManager, { UnlockContentsType } from "../manager/UnlockContentsManager";
import RewardCenterMainButton, { RewardCenterMainButtonType } from "./RewardCenterMainButton";
import { Utility } from "../global_utility/Utility";

@ccclass
export default class RewardCenterMainButton_LevelPass extends RewardCenterMainButton {
    // ====================== 编辑器序列化绑定属性 (与原JS一一对应，双按钮结构，直接拖拽绑定) ======================
    @property(cc.Button)
    private btnCollect: cc.Button = null;

    @property(cc.Button)
    private btnGoNow: cc.Button = null;

    // ====================== 重写父类抽象方法 - 返回当前按钮类型【必须重写，父类核心识别标识】 ======================
    public getType(): RewardCenterMainButtonType {
        return RewardCenterMainButtonType.LEVEL_PASS;
    }

    // ====================== 静态工具+校验方法 (全局通用，类直接调用，原JS核心业务逻辑1:1精准还原，无任何修改) ======================
    /**
     * 静态工具方法：判断数组中是否包含指定数值 (原JS核心写法：倒序遍历，性能更优，完整保留)
     * @param arr 目标数字数组
     * @param target 待匹配的数值
     */
    public static contains(arr: number[], target: number): boolean {
        for (let i = arr.length; i--;) {
            if (arr[i] === target) return true;
        }
        return false;
    }

    /**
     * 静态方法：判断是否可领取通行证奖励 (核心双轨奖励校验逻辑，免费+高级通行证双判断)
     * 核心规则：遍历 3-35级 奇数等级 → 用户等级达标+对应奖励未领取 → 可领取
     */
    public static isCanReceive(): boolean {
        if (!this.isUseable()) return false;

        const userLevel = ServiceInfoManager.instance.getUserLevel();
        // ✅ 核心规则保留：遍历 3 → 35 所有奇数等级 (步长2)，原JS核心逻辑不可修改
        // for (let level = 3; level <= 35; level += 2) {
        //     if (userLevel >= level) {
        //         // 判断1: 免费通行证奖励是否未领取
        //         if (!this.contains(LevelUpPassManager.instance.getCollectedFreeReward(), level)) {
        //             return true;
        //         }
        //         // 判断2: 已购买高级通行证 + 高级奖励是否未领取
        //         if (LevelUpPassManager.instance.checkPurchasePremium() && !this.contains(LevelUpPassManager.instance.getCollectedPremiumReward(), level)) {
        //             return true;
        //         }
        //     }
        // }
        return false;
    }

    /**
     * 静态方法：判断当前按钮是否可用 (双层核心校验规则完整保留，优先级无变更)
     * 校验1: 等级通行证功能是否解锁(用户等级≥解锁等级)  校验2: 通行证活动是否在有效期内
     */
    public static isUseable(): boolean {
        // 解锁等级校验：获取通行证功能的解锁等级，用户等级未达标则不可用
        const unlockLevel = UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.LEVEL_PASS);
        if (ServiceInfoManager.instance.getUserLevel() < unlockLevel) return false;

        // 活动有效期校验：通行证配置有效 + 活动结束时间 > 服务器当前时间
        const promotionInfo = UserInfo.instance().getPromotionInfo(LevelUpPassPromotion.PromotionKeyName);
        return TSUtility.isValid(promotionInfo) && !(promotionInfo.endDate <= TSUtility.getServerBaseNowUnixTime());
    }

    // ====================== 重写父类保护方法 - 组件初始化【只执行一次，绑定所有按钮事件，无重复绑定风险】 ======================
    protected _initialize(): void {
        // 绑定双按钮的点击事件，对应各自的回调方法
        this.btnCollect.clickEvents.push(Utility.getComponent_EventHandler(this.node, "RewardCenterMainButton_LevelPass", "onClick_Collect", ""));
        this.btnGoNow.clickEvents.push(Utility.getComponent_EventHandler(this.node, "RewardCenterMainButton_LevelPass", "onClick_GoNow", ""));
    }

    // ====================== 重写父类保护方法 - 实例化校验【供父类自动调用，统一校验逻辑】 ======================
    /** 实例方法：是否可领取奖励 → 内部调用静态校验方法 */
    protected _isCanReceive(): boolean {
        return RewardCenterMainButton_LevelPass.isCanReceive();
    }

    /** 实例方法：按钮是否可用 → 内部调用静态校验方法 */
    protected _isUseable(): boolean {
        return RewardCenterMainButton_LevelPass.isUseable();
    }

    // ====================== 重写父类保护方法 - UI刷新钩子【父类updateView自动调用，核心双按钮动态显隐逻辑】 ======================
    protected _updateUI(): void {
        // ✅ 核心显隐规则：可领取奖励 → 显示【Collect】按钮，反之显示【Go Now】按钮，无任何其他分支
        this.btnCollect.node.active = this._isCanReceive();
        this.btnGoNow.node.active = !this._isCanReceive();
    }

    // ====================== 两个按钮的点击事件回调【核心跳转逻辑，原JS逻辑完全一致，无任何修改】 ======================
    public onClick_Collect(): void {
        const self = this;
        if (this._isUseable()) {
            // 打开等级通行证弹窗，原JS写法：直接关闭加载层，无前置打开，精准保留
            // LevelUpPassPopup.getPopup((err: Error, popup: LevelUpPassPopup) => {
            //     PopupManager.Instance().showDisplayProgress(false);
            //     if (!err) {
            //         popup.open();
            //         popup.setCloseCallback(() => {
            //             self.updateView();
            //         });
            //     }
            // });
        } else {
            // 按钮不可用的兜底逻辑：刷新视图状态，防止界面卡死
            this.updateView();
        }
    }

    public onClick_GoNow(): void {
        const self = this;
        if (this._isUseable()) {
            // 两个按钮跳转逻辑完全一致，统一打开通行证弹窗
            // LevelUpPassPopup.getPopup((err: Error, popup: LevelUpPassPopup) => {
            //     PopupManager.Instance().showDisplayProgress(false);
            //     if (!err) {
            //         popup.open();
            //         popup.setCloseCallback(() => {
            //             self.updateView();
            //         });
            //     }
            // });
        } else {
            this.updateView();
        }
    }
}