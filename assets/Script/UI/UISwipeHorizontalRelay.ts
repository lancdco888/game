const { ccclass } = cc._decorator;

/**
 * 水平滑动事件中继器 - 通用工具组件
 * 解决嵌套ScrollView的水平滑动穿透问题，拦截子级水平滑动事件并透传给父级ScrollView
 * 无任何序列化属性、无业务依赖，可直接挂载在任意ScrollView节点上
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class UISwipeHorizontalRelay extends cc.Component {
    // ===================== 私有成员变量 【与原JS完全对应，补充精准TS强类型声明】 =====================
    private _scrParent: cc.ScrollView = null; // 父级滚动视图组件
    private _scr: cc.ScrollView = null;       // 自身挂载的滚动视图组件
    private _posStart: cc.Vec2 = null;        // 触摸开始的坐标
    private _isDetected: boolean = false;  // 是否已检测出滑动方向
    private _isHorizontalDrag: boolean = false; // 是否判定为水平滑动

    // ===================== Cocos 生命周期 【1:1等价还原，组件初始化+事件绑定】 =====================
    public onLoad(): void {
        // 获取自身节点挂载的ScrollView组件
        this._scr = this.node.getComponent(cc.ScrollView);
        if (this._scr) {
            // 查找父节点链上第一个ScrollView作为父级滚动视图
            this._scrParent = this.findParentScrollView(this.node);
            if (this._scrParent) {
                // 绑定所有触摸事件
                this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
                this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
                this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
                this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
            }
        }
    }

    // ===================== 核心私有方法 【1:1完全还原原JS逻辑，无任何修改】 =====================
    /**
     * 向上遍历父节点，查找第一个挂载了ScrollView的父节点组件
     * @param targetNode 目标子节点
     * @returns 父级ScrollView | null
     */
    private findParentScrollView(targetNode: cc.Node): cc.ScrollView {
        let parentNode = targetNode.parent;
        while (parentNode) {
            const parentScr = parentNode.getComponent(cc.ScrollView);
            if (parentScr) {
                return parentScr;
            }
            parentNode = parentNode.parent;
        }
        return null;
    }

    /**
     * 触摸开始回调 - 记录初始坐标，重置所有状态标记
     * @param event 触摸事件对象
     */
    private onTouchStart(event: cc.Event.EventTouch): void {
        this._posStart = event.getLocation();
        this._isDetected = false;
        this._isHorizontalDrag = false;
    }

    /**
     * 触摸移动回调 - 核心滑动方向判断+事件拦截+透传逻辑
     * @param event 触摸事件对象
     */
    private onTouchMove(event: cc.Event.EventTouch): void {
        // 只在首次滑动时判断方向，避免重复判定
        if (!this._isDetected) {
            const currPos = event.getLocation();
            // 水平偏移量绝对值 > 垂直偏移量绝对值 → 判定为水平滑动
            if (Math.abs(currPos.x - this._posStart.x) > Math.abs(currPos.y - this._posStart.y)) {
                this._isHorizontalDrag = true;
                this._isDetected = true;
                // 禁用自身滚动视图，防止垂直滚动干扰水平滑动
                this._scr && (this._scr.enabled = false);
            }
        }

        // 判定为水平滑动 → 拦截事件+透传给父级
        if (this._isHorizontalDrag) {
            event.stopPropagation(); // 阻止事件冒泡，避免多层滚动冲突
            this._scrParent.stopAutoScroll(); // 停止父级的自动滚动，保证手动滑动顺滑
            // 透传触摸移动事件给父级，兼容多种父级方法名
            this.tryCallParentMethod(
                ["_onTouchMove", "_onTouchMoved", "_onTouchMovedEvent", "_onTouchMoved_", "_onTouchMovedHandler", "_onTouchMovedHandler_", "_onTouchMovedHandler__"], 
                event
            );
        }
    }

    /**
     * 触摸结束/取消回调 - 恢复状态+透传结束事件
     * @param event 触摸事件对象
     */
    private onTouchEnd(event: cc.Event.EventTouch): void {
        // 水平滑动结束 → 透传结束事件给父级
        if (this._isHorizontalDrag && this._scrParent) {
            this.tryCallParentMethod(
                ["_onTouchEnded", "_onTouchEnd", "_onTouchEnded_", "_onTouchEndedHandler"], 
                event
            );
        }
        // 恢复自身滚动视图可用状态，重置标记
        this._scr.enabled = true;
        this._isDetected = false;
    }

    /**
     * 容错调用父级滚动视图的指定方法 - 原JS核心容错逻辑，方法名数组完全保留
     * 遍历方法名数组，找到父级存在的方法立即调用并返回，兼容所有自定义ScrollView的命名规范
     * @param methodNames 候选方法名数组
     * @param event 触摸事件对象
     * @returns 是否调用成功
     */
    private tryCallParentMethod(methodNames: Array<string>, event: cc.Event.EventTouch): boolean {
        for (let i = 0; i < methodNames.length; i++) {
            const methodName = methodNames[i];
            const targetMethod = this._scrParent[methodName];
            if (typeof targetMethod === "function") {
                targetMethod.call(this._scrParent, event);
                return true;
            }
        }
        return false;
    }
}