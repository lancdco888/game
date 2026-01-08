const { ccclass, property } = cc._decorator;

import TSUtility from "../../../Script/global_utility/TSUtility";

/**
 * PowerGem老虎机底部提示组件 (自动关闭+点击遮罩关闭)
 * PowerGemSlotBottomToolTip
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class PowerGemSlotBottomToolTip extends cc.Component {
    // ===================== Cocos 序列化属性 【与原JS 1:1对应】 =====================
    @property({ type: cc.Node, displayName: "触摸遮罩节点" })
    public nodeTouchBG: cc.Node = null;

    // ===================== 私有成员变量 【补充TS强类型】 =====================
    private _closeCallback: Function = null;

    // ===================== 生命周期方法 【1:1还原原JS逻辑】 =====================
    onLoad(): void {
        // 绑定遮罩触摸事件
        this.nodeTouchBG.on(cc.Node.EventType.TOUCH_START, this.onTouchStart.bind(this), this);
        // 设置忽略起始触摸监听（原JS逻辑完全保留）
        TSUtility.setIgnoreStartTouchListener(this.nodeTouchBG);
    }

    /**
     * 设置关闭回调函数
     * @param callback 关闭后执行的回调
     */
    setCloseCallback(callback: Function): void {
        this._closeCallback = callback;
    }

    /**
     * 组件启用时 - 调度5秒后自动关闭
     */
    onEnable(): void {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(this.close.bind(this), 5);
    }

    /**
     * 组件禁用时 - 清除所有调度器
     */
    onDisable(): void {
        this.unscheduleAllCallbacks();
    }

    /**
     * 响应遮罩触摸事件 - 触发关闭逻辑
     */
    onTouchStart(): void {
        this.close();
    }

    /**
     * 关闭提示组件 - 隐藏节点并执行回调
     */
    close(): void {
        this.node.active = false;
        // 回调存在时执行
        if (this._closeCallback) {
            this._closeCallback();
        }
    }
}