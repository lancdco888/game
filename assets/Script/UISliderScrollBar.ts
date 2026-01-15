import GameCommonSound from "./GameCommonSound";
import { Utility } from "./global_utility/Utility";


const { ccclass, property } = cc._decorator;

/**
 * 滑动条滚动条组件（关联ScrollView，支持左右/上下按钮控制，自动隐藏滚动条）
 */
@ccclass('UISliderScrollBar')
export default class UISliderScrollBar extends cc.Component {
    // 按钮启用的间隔阈值
    private readonly BUTTON_ENABLE_INTERVAL: number = 10;

    // ===== 可序列化属性（对应编辑器赋值）=====
    @property(cc.ScrollView)
    public scrollView: cc.ScrollView = null;

    @property(cc.Slider)
    public slider: cc.Slider = null;

    @property(cc.Button)
    public btnLeft: cc.Button = null;

    @property(cc.Button)
    public btnRight: cc.Button = null;

    @property(cc.Button)
    public btnUp: cc.Button = null;

    @property(cc.Button)
    public btnDown: cc.Button = null;

    @property
    public enableButtonAutoHide: boolean = false;

    @property
    public moveButtonDistance: number = 100;

    // ===== 私有状态属性 =====
    private _numBeforeMaxOffset: number = 0;
    private _numBeforeOffset: number = 0;
    private _isScrollViewInertia: boolean = false;
    private _isScrollCancelInnerEvents: boolean = false;
    private _boundaryEpsilon: number = 0; // 边界容差值
    private _onLeftButtonCallback: (() => boolean) | null = null;
    private _onRightButtonCallback: (() => boolean) | null = null;

    /**
     * 边界容差值（get/set属性）
     */
    get boundaryEpsilon(): number {
        return this._boundaryEpsilon;
    }

    set boundaryEpsilon(value: number) {
        this._boundaryEpsilon = value;
    }

    /**
     * 组件加载时初始化
     */
    onLoad(): void {
        // 绑定按钮点击事件
        this.btnLeft?.clickEvents.push(Utility.getComponent_EventHandler(this.node, "UISliderScrollBar", "onClick_Left", ""));
        this.btnRight?.clickEvents.push(Utility.getComponent_EventHandler(this.node, "UISliderScrollBar", "onClick_Right", ""));
        this.btnUp?.clickEvents.push(Utility.getComponent_EventHandler(this.node, "UISliderScrollBar", "onClick_Up", ""));
        this.btnDown?.clickEvents.push(Utility.getComponent_EventHandler(this.node, "UISliderScrollBar", "onClick_Down", ""));

        // 绑定滑动条手柄的触摸事件
        if (this.slider?.handle?.node) {
            this.slider.handle.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.slider.handle.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
            this.slider.handle.node.on(cc.Node.EventType.MOUSE_UP, this.onTouchEnd, this);
            this.slider.slideEvents.push(Utility.getComponent_EventHandler(this.node, "UISliderScrollBar", "onTouchMove", ""));
        }

        // 初始化ScrollView关联
        this.setScrollView(this.scrollView);
    }

    /**
     * 延迟更新（同步ScrollView和滑动条状态）
     */
    lateUpdate(): void {
        if (!this.scrollView || !this.slider) return;

        // 隐藏滚动条（先执行）
        this.hideScrollBar();

        // 检测ScrollView偏移是否变化，避免重复更新
        let maxOffset: number, currentOffset: number;
        if (this.scrollView.horizontal) {
            maxOffset = this.scrollView.getMaxScrollOffset().x;
            currentOffset = this.scrollView.getScrollOffset().x;
            if (this._numBeforeMaxOffset === maxOffset && this._numBeforeOffset === currentOffset) return;
        } else {
            maxOffset = this.scrollView.getMaxScrollOffset().y;
            currentOffset = this.scrollView.getScrollOffset().y;
            if (this._numBeforeMaxOffset === maxOffset && this._numBeforeOffset === currentOffset) return;
        }

        // 更新记录值并同步滑动条
        this._numBeforeMaxOffset = maxOffset;
        this._numBeforeOffset = currentOffset;
        this.updateScroll();
    }

    /**
     * 设置关联的ScrollView
     * @param scrollView 目标ScrollView组件
     */
    setScrollView(scrollView: cc.ScrollView | null): void {
        if (!scrollView) return;

        this.scrollView = scrollView;

        // 先移除旧监听，再添加新监听
        this.scrollView.node.off("scrolling", this.updateScroll, this);
        this.scrollView.node.off("scroll-ended", this.updateScroll, this);
        this.scrollView.node.on("scrolling", this.updateScroll, this);
        this.scrollView.node.on("scroll-ended", this.updateScroll, this);

        // 保存ScrollView原始配置
        this._isScrollViewInertia = this.scrollView.inertia;
        this._isScrollCancelInnerEvents = this.scrollView.cancelInnerEvents;

        // 初始化状态
        this.hideScrollBar();
        this.updateScroll();
    }

    /**
     * 设置左按钮点击回调
     * @param callback 回调函数（返回true则拦截默认逻辑）
     */
    setOnLeftButtonCallback(callback: (() => boolean) | null): void {
        this._onLeftButtonCallback = callback;
    }

    /**
     * 设置右按钮点击回调
     * @param callback 回调函数（返回true则拦截默认逻辑）
     */
    setOnRightButtonCallback(callback: (() => boolean) | null): void {
        this._onRightButtonCallback = callback;
    }

    /**
     * 同步ScrollView和滑动条的状态
     */
    updateScroll(): void {
        if (!this.scrollView || !this.slider) return;

        if (this.scrollView.horizontal) {
            // 水平滚动逻辑
            if (this.enableButtonAutoHide) {
                const e = this._boundaryEpsilon;
                const currentX = this.scrollView.getScrollOffset().x;
                const maxX = this.scrollView.getMaxScrollOffset().x;
                const isAtLeft = Math.abs(currentX) <= e;
                const isAtRight = Math.abs(currentX + maxX) <= e;

                // 控制左右按钮显隐
                this.btnLeft.node.active = !isAtLeft && currentX < -(0 + e);
                this.btnRight.node.active = !isAtRight && currentX > -(maxX - e);
            }

            // 同步滑动条进度
            this.slider.progress = -this.scrollView.getScrollOffset().x / this.scrollView.getMaxScrollOffset().x;
        } else {
            // 垂直滚动逻辑
            if (this.enableButtonAutoHide) {
                const currentY = this.scrollView.getScrollOffset().y;
                const contentHeight = this.scrollView.content?.height || 0;
                const viewHeight = this.scrollView.node.getContentSize().height;

                // 控制上下按钮显隐
                this.btnUp.node.active = currentY >= this.BUTTON_ENABLE_INTERVAL;
                this.btnDown.node.active = currentY <= contentHeight - viewHeight - this.BUTTON_ENABLE_INTERVAL;
            }

            // 同步滑动条进度
            this.slider.progress = 1 - this.scrollView.getScrollOffset().y / this.scrollView.getMaxScrollOffset().y;
        }
    }

    /**
     * 根据ScrollView内容长度自动隐藏/显示滚动条
     */
    hideScrollBar(): void {
        if (!this.scrollView || !this.slider) return;

        let ratio: number;
        if (this.scrollView.horizontal) {
            // 水平滚动：计算可视区域占比
            const viewWidth = this.scrollView.node.getContentSize().width;
            const totalWidth = viewWidth + this.scrollView.getMaxScrollOffset().x;
            ratio = viewWidth / totalWidth;
        } else {
            // 垂直滚动：计算可视区域占比
            const viewHeight = this.scrollView.node.getContentSize().height;
            const totalHeight = viewHeight + this.scrollView.getMaxScrollOffset().y;
            ratio = viewHeight / totalHeight;
        }

        // 占比≥1则隐藏（内容未超出可视区域）
        this.node.opacity = ratio >= 1 ? 0 : 255;
    }

    /**
     * 滑动条手柄触摸结束时恢复ScrollView原始配置
     */
    onTouchEnd(): void {
        if (!this.scrollView || !this.slider) return;

        this.scrollView.inertia = this._isScrollViewInertia;
        this.scrollView.cancelInnerEvents = this._isScrollCancelInnerEvents;
    }

    /**
     * 滑动条拖动时同步ScrollView位置
     */
    onTouchMove(): void {
        if (!this.scrollView || !this.slider) return;

        // 临时关闭惯性和内部事件取消，避免冲突
        this.scrollView.inertia = false;
        this.scrollView.cancelInnerEvents = false;
        this.scrollView.stopAutoScroll();

        // 同步ScrollView位置到滑动条进度
        if (this.scrollView.horizontal) {
            this.scrollView.scrollToPercentHorizontal(this.slider.progress, 0.01, false);
        } else {
            this.scrollView.scrollToPercentVertical(this.slider.progress, 0.01, false);
        }
    }

    /**
     * 左按钮点击事件
     */
    onClick_Left(): void {
        if (!this.scrollView || !this.slider) return;

        // 播放按钮音效
        GameCommonSound.playFxOnce("btn_etc");

        // 执行回调，若返回true则拦截默认逻辑
        if (this._onLeftButtonCallback && this._onLeftButtonCallback()) return;

        // 计算新偏移并滚动
        const currentX = this.scrollView.getScrollOffset().x;
        const maxX = this.scrollView.getMaxScrollOffset().x;
        const newX = Math.max(-maxX, Math.abs(currentX) + -this.moveButtonDistance);
        this.scrollView.scrollToOffset(cc.v2(newX, 0), 0.25, true);
    }

    /**
     * 右按钮点击事件
     */
    onClick_Right(): void {
        if (!this.scrollView || !this.slider) return;

        // 播放按钮音效
        GameCommonSound.playFxOnce("btn_etc");

        // 执行回调，若返回true则拦截默认逻辑
        if (this._onRightButtonCallback && this._onRightButtonCallback()) return;

        // 计算新偏移并滚动
        const currentX = this.scrollView.getScrollOffset().x;
        const maxX = this.scrollView.getMaxScrollOffset().x;
        const newX = Math.max(-maxX, Math.abs(currentX) + this.moveButtonDistance);
        this.scrollView.scrollToOffset(cc.v2(newX, 0), 0.25, true);
    }

    /**
     * 上按钮点击事件
     */
    onClick_Up(): void {
        if (!this.scrollView || !this.slider) return;

        // 播放按钮音效
        GameCommonSound.playFxOnce("btn_etc");

        // 计算新偏移并滚动
        const currentY = this.scrollView.getScrollOffset().y;
        const maxY = this.scrollView.getMaxScrollOffset().y;
        const newY = Math.max(-maxY, Math.abs(currentY) + -this.moveButtonDistance);
        this.scrollView.scrollToOffset(cc.v2(0, newY), 0.25, true);
    }

    /**
     * 下按钮点击事件
     */
    onClick_Down(): void {
        if (!this.scrollView || !this.slider) return;

        // 播放按钮音效
        GameCommonSound.playFxOnce("btn_etc");

        // 计算新偏移并滚动
        const currentY = this.scrollView.getScrollOffset().y;
        const maxY = this.scrollView.getMaxScrollOffset().y;
        const newY = Math.max(-maxY, Math.abs(currentY) - this.moveButtonDistance);
        this.scrollView.scrollToOffset(cc.v2(0, newY), 0.25, true);
    }
}