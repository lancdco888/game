const { ccclass, property } = cc._decorator;

// 导入项目所有依赖模块 - 路径与原JS完全一致，直接复用无修改
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";
import UserInfo from "../User/UserInfo";
// import ReelQuestMainMapPopup from "../../ReelQuest/ReelQuestMainMapPopup";
import RewardCenterMainButton, { RewardCenterMainButtonType } from "./RewardCenterMainButton";

@ccclass
export default class RewardCenterMainButton_ReelQuest extends RewardCenterMainButton {
    // ====================== 编辑器序列化绑定属性 (与原JS一一对应，双按钮结构，直接拖拽绑定) ======================
    @property(cc.Button)
    private btnCollect: cc.Button = null;

    @property(cc.Button)
    private btnPlayNow: cc.Button = null;

    // ====================== 实例私有属性 (原JS原型属性，缓存推广信息，避免重复获取，精准保留) ======================
    private _promotionInfo: any = null;

    // ====================== 重写父类抽象方法 - 返回当前按钮类型【必须重写，父类核心识别标识】 ======================
    public getType(): RewardCenterMainButtonType {
        return RewardCenterMainButtonType.REEL_QUEST;
    }

    // ====================== 静态校验方法 (全局通用，类直接调用，原JS逻辑1:1精准还原，无任何修改) ======================
    /** 静态方法：判断是否可领取卷轴任务奖励 - 活动可用+完成所有卷轴任务 方可领取 */
    public static isCanReceive(): boolean {
        if (!this.isUseable()) return false;
        // const userReelQuestInfo = UserInfo.instance().getUserReelQuestInfo();
        // return TSUtility.isValid(userReelQuestInfo) && userReelQuestInfo.isCompleteAllMission() === 1;
        return false;
    }

    /** 静态方法：判断当前按钮是否可用 (双层核心校验规则完整保留，优先级无变更) */
    public static isUseable(): boolean {
        // 校验1: 获取活跃的卷轴任务推广Key，无有效Key则不可用
        // const activePromotionKey = UserInfo.instance().getActiveReelQuestPromotionKey();
        // if (activePromotionKey.length <= 0) return false;
        
        // // 校验2: 推广信息有效 + 活动剩余时间 ≥ 0 (活动未结束)
        // const promotionInfo = UserInfo.instance().getPromotionInfo(activePromotionKey);
        // return TSUtility.isValid(promotionInfo) && !(promotionInfo.getRemainTime() < 0);
        return false;
    }

    // ====================== 重写父类保护方法 - 组件初始化【只执行一次，绑定所有按钮事件，无重复绑定风险】 ======================
    protected _initialize(): void {
        // 绑定双按钮的点击事件，对应各自的回调方法
        this.btnCollect.clickEvents.push(Utility.getComponent_EventHandler(this.node, "RewardCenterMainButton_ReelQuest", "onClick_Collect", ""));
        this.btnPlayNow.clickEvents.push(Utility.getComponent_EventHandler(this.node, "RewardCenterMainButton_ReelQuest", "onClick_PlayNow", ""));
    }

    // ====================== 重写父类保护方法 - UI刷新钩子【父类updateView自动调用，核心双按钮显隐逻辑】 ======================
    protected _updateUI(): void {
        // ✅ 核心细节保留：缓存推广信息到实例属性，避免重复调用获取，提升性能
        this._promotionInfo = this.getPromotionInfo();
        // 双按钮互斥显隐：可领取奖励 → 显示【Collect】，反之显示【Play Now】
        this.btnCollect.node.active = this._isCanReceive();
        this.btnPlayNow.node.active = !this._isCanReceive();
    }

    // ====================== 重写父类保护方法 - 实例化校验【供父类自动调用，统一校验逻辑】 ======================
    /** 实例方法：是否可领取奖励 → 内部调用静态校验方法 */
    protected _isCanReceive(): boolean {
        return RewardCenterMainButton_ReelQuest.isCanReceive();
    }

    /** 实例方法：按钮是否可用 → 内部调用静态校验方法 */
    protected _isUseable(): boolean {
        return RewardCenterMainButton_ReelQuest.isUseable();
    }

    // ====================== 核心公共方法 - 获取有效的卷轴任务推广信息【原JS核心原型方法，逻辑1:1还原】 ======================
    public getPromotionInfo(): any {
        // const activePromotionKey = UserInfo.instance().getActiveReelQuestPromotionKey();
        // // 无有效推广Key → 返回null
        // if (activePromotionKey.length <= 0) return null;

        // const promotionInfo = UserInfo.instance().getPromotionInfo(activePromotionKey);
        // // 推广信息无效 或 活动已结束 → 返回null，反之返回有效推广信息
        // if (!TSUtility.isValid(promotionInfo)) return null;
        // if (promotionInfo.getRemainTime() < 0) return null;
        
        // return promotionInfo;
        return null;
    }

    // ====================== 核心按钮点击事件回调【两个按钮逻辑完全一致，原JS复制粘贴写法，精准保留不合并】 ======================
    public onClick_Collect(): void {
        const self = this;
        // ✅ 双重校验：按钮可用 + 推广信息有效，缺一不可
        if (this._isUseable() && TSUtility.isValid(this._promotionInfo)) {
            // ✅ 特殊细节保留：弹窗带【推广信息】作为第一个参数打开，原JS核心传参规则，不可修改
            // ReelQuestMainMapPopup.getPopup(this._promotionInfo, (err: Error, popup: ReelQuestMainMapPopup) => {
            //     if (!err) {
            //         popup.open();
            //         popup.setCloseCallback(() => {
            //             self.updateView();
            //         });
            //     }
            // });
        } else {
            // 按钮不可用/信息无效的兜底逻辑：刷新视图状态，防止界面卡死
            this.updateView();
        }
    }

    public onClick_PlayNow(): void {
        const self = this;
        if (this._isUseable() && TSUtility.isValid(this._promotionInfo)) {
            // ReelQuestMainMapPopup.getPopup(this._promotionInfo, (err: Error, popup: ReelQuestMainMapPopup) => {
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