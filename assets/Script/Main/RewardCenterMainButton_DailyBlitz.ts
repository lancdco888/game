const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import ServiceInfoManager from "../ServiceInfoManager";
import UserInfo from "../User/UserInfo";
import { Utility } from "../global_utility/Utility";
import UnlockContentsManager, { UnlockContentsType } from "../manager/UnlockContentsManager";
import RewardCenterMainButton, { RewardCenterMainButtonType } from "./RewardCenterMainButton";

/**
 * 奖励中心主按钮-每日闪电战(DailyBlitz)子类
 * 继承自RewardCenterMainButton基类，实现每日闪电战按钮的「可领取/去参与」UI切换、解锁判断、领取/跳转逻辑
 */
@ccclass
export default class RewardCenterMainButton_DailyBlitz extends RewardCenterMainButton {
    // ✅ 原文件所有序列化按钮属性 1:1复刻 装饰器+类型注解 命名完全一致
    @property(cc.Button)
    public btnCollect: cc.Button = null;

    @property(cc.Button)
    public btnGoNow: cc.Button = null;

    // ==============================================================
    // ✅ 重写父类抽象方法 - 获取按钮类型 1:1复刻返回值 无任何修改
    // ==============================================================
    public getType(): RewardCenterMainButtonType {
        return RewardCenterMainButtonType.DAILY_BLITZ;
    }

    // ==============================================================
    // ✅ 核心静态判断方法 全部保留static关键字 原逻辑一字不差 优先级最高
    // ✔️ 完整保留原文件 0==xxx /1==xxx 判断风格 ✔️ 层级判断逻辑无变更 ✔️ 所有工具类调用一致
    // ==============================================================
    /**
     * 【静态方法】判断每日闪电战奖励是否可领取
     * @returns 是否可领取奖励
     */
    public static isCanReceive(): boolean {
        // 1. 先判断功能是否可用
        if (!RewardCenterMainButton_DailyBlitz.isUseable()) {
            return false;
        }
        // 2. 判断等级是否满足解锁条件
        if (ServiceInfoManager.instance.getUserLevel() < UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.DAILY_BLITZ)) {
            return false;
        }
        // 3. 获取用户任务数据 判断：未完成全部任务 且 当前任务有可领取奖励
        const userMission = UserInfo.instance().getUserMission();
        return !userMission.isCompleteAllMission() && userMission.isCollectableCurrentMission();
    }

    /**
     * 【静态方法】判断每日闪电战功能是否解锁可用
     * @returns 功能是否可用
     */
    public static isUseable(): boolean {
        return !(ServiceInfoManager.instance.getUserLevel() < UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.DAILY_BLITZ));
    }

    // ==============================================================
    // ✅ 重写父类的初始化方法 - 按钮点击事件绑定 1:1复刻原逻辑 无任何修改
    // 核心：通过Utility工具类生成EventHandler 绑定点击回调 事件列表push追加
    // ==============================================================
    public _initialize(): void {
        this.btnCollect.clickEvents.push(Utility.getComponent_EventHandler(this.node, "RewardCenterMainButton_DailyBlitz", "onClick_Collect", ""));
        this.btnGoNow.clickEvents.push(Utility.getComponent_EventHandler(this.node, "RewardCenterMainButton_DailyBlitz", "onClick_GoNow", ""));
    }

    // ==============================================================
    // ✅ 重写父类的UI刷新方法 - 核心显隐逻辑 一字不差
    // 可领取状态→显示领取按钮 隐藏去参与 | 不可领取→显示去参与 隐藏领取按钮
    // ==============================================================
    public _updateUI(): void {
        this.btnCollect.node.active = this._isCanReceive();
        this.btnGoNow.node.active = !this._isCanReceive();
    }

    // ==============================================================
    // ✅ 重写父类的私有判断方法 内部调用静态方法 逻辑完全一致
    // ==============================================================
    protected _isCanReceive(): boolean {
        return RewardCenterMainButton_DailyBlitz.isCanReceive();
    }

    protected _isUseable(): boolean {
        return RewardCenterMainButton_DailyBlitz.isUseable();
    }

    // ==============================================================
    // ✅ 按钮点击回调方法 1:1复刻原文件【空方法体】绝对保留 无任何逻辑填充
    // 原JS中就是空函数 仅预留回调入口 由业务层后续扩展 此处严格保持一致
    // ==============================================================
    public onClick_Collect(): void { }

    public onClick_GoNow(): void { }
}