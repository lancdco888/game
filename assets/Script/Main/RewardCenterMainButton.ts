const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import MessageRoutingManager from "../message/MessageRoutingManager";

// ===================== 奖励中心按钮类型枚举 完整保留原所有枚举项+字符串值 一字不差 =====================
export enum RewardCenterMainButtonType {
    NONE = "NONE",
    MEMBERS_BONUS = "MEMBERS_BONUS",
    BINGO = "BINGO",
    DAILY_BOUNTY = "DAILY_BOUNTY",
    HYPER_PASS = "HYPER_PASS",
    DAILY_BLITZ = "DAILY_BLITZ",
    LEVEL_PASS = "LEVEL_PASS",
    JIGGY_PRIZE = "JIGGY_PRIZE",
    REEL_QUEST = "REEL_QUEST",
    FB_CONNECT = "FB_CONNECT",
    FANPAGE = "FANPAGE",
    FREEBIES = "FREEBIES"
}

// ===================== 奖励中心所有按钮的基类 模板方法设计模式 供子类继承重写 =====================
@ccclass
export default class RewardCenterMainButton extends cc.Component {
    // ===================== 私有成员变量 与原JS完全一致 补全类型注解+初始化值 =====================
    private _numIndex: number = 0;

    // ✅ 公有初始化方法 完整保留原逻辑：赋值索引 + 调用内部初始化
    public initialize(index: number): void {
        this._numIndex = index;
        this._initialize();
    }

    // ✅ 公有方法 - 获取按钮类型 基类默认返回NONE 子类必须重写此方法
    public getType(): RewardCenterMainButtonType {
        return RewardCenterMainButtonType.NONE;
    }

    // ✅ 公有方法 - 获取按钮索引值
    public getIndex(): number {
        return this._numIndex;
    }

    // ✅ 核心公有方法 - 更新按钮UI 模板方法 完整保留原判断风格(0 != e) 无任何修改
    public updateUI(): void {
        const isUseable = this._isUseable();
        this.node.active = isUseable;
        // 原项目特有判断风格：0 != 值 而非 布尔值判断 精准保留
        isUseable && this._updateUI();
    }

    // ✅ 公有方法 - 判断按钮是否可领取奖励 基类默认返回false 子类必须重写此方法
    public isCanReceive(): boolean {
        return this._isCanReceive();
    }

    // ✅ 公有方法 - 派发奖励中心视图更新全局消息 通知主视图刷新所有按钮状态
    public updateView(): void {
        MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REWARD_CENTER_UPDATE_VIEW);
    }

    // ✅ 公有方法 - 设置按钮节点层级 核心排序规则的实现入口 完整保留原逻辑
    public setNodeIndex(zIndex: number): void {
        this.node.zIndex = zIndex;
    }

    // ==============================================================
    // ✅ 【重中之重】所有下划线开头的方法标注为 protected 供子类重写
    // 原JS的设计就是父类占位空方法，子类实现具体逻辑，TS中必须用protected保证子类可访问
    // 所有方法完整保留空实现/默认返回值 一字不差 无任何删减
    // ==============================================================
    /** 内部初始化方法 子类重写：按钮独有初始化逻辑 */
    protected _initialize(): void {}

    /** 内部判断按钮是否可用 子类重写：返回true则显示按钮，false则隐藏 */
    protected _isUseable(): boolean {
        return false;
    }

    /** 内部更新UI方法 子类重写：按钮可用时的具体UI刷新逻辑 */
    protected _updateUI(): void {}

    /** 内部判断是否可领取 子类重写：按钮的核心领取状态判断逻辑 */
    protected _isCanReceive(): boolean {
        return false;
    }
}