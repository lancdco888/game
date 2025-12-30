// 保留原项目依赖导入路径
import TSUtility from "./global_utility/TSUtility";

const { ccclass, property } = cc._decorator;

/**
 * 通用滑动手势识别组件 (核心封装)
 * 支持：水平/垂直滑动、滑动最小距离阈值、滑动与ScrollView冲突屏蔽、移动端/桌面端上下滑方向反转适配
 * 核心能力：监听节点的触摸滑动，触发对应方向的回调函数，自动处理滚动组件冲突问题
 */
@ccclass
export default class UISwipe extends cc.Component {
    // ===== 滑动最小触发距离阈值 (原代码常量 不可修改) =====
    private readonly MIN_SWIPE_DISTANCE: number = 100;

    // ===== 私有核心成员变量 =====
    private _posStart: cc.Vec2 = null;
    private _posEnd: cc.Vec2 = null;
    private _nodeTarget: cc.Node = null;
    private _isVertical: boolean = false;
    private _isIgnoreSwipe: boolean = false;

    // ===== 滑动回调函数 (Setter 方式赋值 与原代码一致) =====
    private _funcLeftSwipe: Function = null;
    private _funcRightSwipe: Function = null;
    private _funcUpSwipe: Function = null;
    private _funcDownSwipe: Function = null;

    public set funcLeftSwipe(callback: Function) {
        this._funcLeftSwipe = callback;
    }

    public set funcRightSwipe(callback: Function) {
        this._funcRightSwipe = callback;
    }

    public set funcUpSwipe(callback: Function) {
        this._funcUpSwipe = callback;
    }

    public set funcDownSwipe(callback: Function) {
        this._funcDownSwipe = callback;
    }

    // ===== 只读属性 - 判断是否为移动端 (原逻辑1:1复刻) =====
    public get isMobile(): boolean {
        const subServiceType = TSUtility.getSubServiceType();
        return subServiceType === "ANDROID" || subServiceType === "IOS";
    }

    // ===== 初始化滑动监听 (核心入口 必调用) =====
    // node: 监听滑动的目标节点 | isVertical: 是否开启垂直滑动(true=上下滑动 false=左右滑动)
    public initialize(node: cc.Node, isVertical: boolean): void {
        if (!node) return;
        
        this._nodeTarget = node;
        this._isVertical = isVertical;

        // 绑定触摸事件 + 优先级置顶(true) 优先响应滑动 避免被其他节点拦截
        this._nodeTarget.on(cc.Node.EventType.TOUCH_START, this.onTouchStart.bind(this), this, true);
        this._nodeTarget.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd.bind(this), this, true);
        this._nodeTarget.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd.bind(this), this, true);
    }

    // ===== Cocos生命周期 - 组件销毁 解绑事件 防止内存泄漏 =====
    public onDestroy(): void {
        if (!this._nodeTarget) return;
        
        this._nodeTarget.off(cc.Node.EventType.TOUCH_START, this.onTouchStart.bind(this), this);
        this._nodeTarget.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd.bind(this), this);
        this._nodeTarget.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd.bind(this), this);
    }

    // ===== 触摸开始 - 记录起始坐标 & 判断是否需要忽略本次滑动 =====
    private onTouchStart(event: cc.Event.EventTouch): void {
        this._posStart = event.getLocation();
        // 判断当前触摸节点是否存在滚动组件 存在则忽略滑动 避免冲突
        this._isIgnoreSwipe = !this.isPossibleSwipe(event);
    }

    // ===== 触摸结束 - 核心滑动逻辑判断 (重中之重 原逻辑1:1复刻) =====
    private onTouchEnd(event: cc.Event.EventTouch): void {
        // 忽略滑动/无有效坐标 直接返回
        if (this._isIgnoreSwipe || !this._posStart) return;

        this._posEnd = event.getLocation();
        const offsetY = this._posEnd.y - this._posStart.y; // Y轴滑动距离
        const offsetX = this._posEnd.x - this._posStart.x; // X轴滑动距离

        if (this._isVertical) {
            // ✅ 垂直滑动逻辑 - 核心：移动端/桌面端 上下滑方向反转适配 (原代码核心业务逻辑)
            if (Math.abs(offsetY) > Math.abs(offsetX) && Math.abs(offsetY) > this.MIN_SWIPE_DISTANCE) {
                if (offsetY > 0) {
                    // 向上滑 → 桌面端触发上滑回调 | 移动端触发下滑回调
                    this.isMobile ? this._funcDownSwipe?.() : this._funcUpSwipe?.();
                } else {
                    // 向下滑 → 桌面端触发下滑回调 | 移动端触发上滑回调
                    this.isMobile ? this._funcUpSwipe?.() : this._funcDownSwipe?.();
                }
            }
        } else {
            // ✅ 水平滑动逻辑 - 无反转 正常判断
            if (Math.abs(offsetX) > Math.abs(offsetY) && Math.abs(offsetX) > this.MIN_SWIPE_DISTANCE) {
                offsetX > 0 ? this._funcRightSwipe?.() : this._funcLeftSwipe?.();
            }
        }
    }

    // ===== 核心冲突判断 - 判断是否可以触发滑动 (解决与ScrollView的滑动冲突 原逻辑完整复刻) =====
    // 逻辑：触摸节点/其父节点如果存在同方向的ScrollView → 禁止触发滑动 优先滚动组件响应
    private isPossibleSwipe(event: cc.Event.EventTouch): boolean {
        let targetNode: cc.Node = event.target as cc.Node;
        if (!targetNode) return true;

        // 遍历触摸节点的所有父节点 直到Canvas
        while (targetNode && targetNode instanceof cc.Node) {
            const scrollView = targetNode.getComponent(cc.ScrollView);
            if (scrollView) {
                // 存在滚动组件 → 判断滚动方向是否与当前滑动方向一致
                if (scrollView.vertical && scrollView.horizontal) return false; // 自由滚动 直接屏蔽
                if (this._isVertical && scrollView.vertical && !scrollView.horizontal) return false; // 垂直滑动 vs 垂直滚动
                if (!this._isVertical && scrollView.horizontal && !scrollView.vertical) return false; // 水平滑动 vs 水平滚动
            }

            const parentNode = targetNode.parent;
            if (!parentNode || parentNode.name === "Canvas") break; // 到画布根节点停止遍历
            targetNode = parentNode;
        }
        return true;
    }
}