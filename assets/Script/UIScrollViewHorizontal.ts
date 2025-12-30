
const { ccclass, property } = cc._decorator;

// 导入父类 路径与原代码一致
import UIScrollView from "./UIScrollView";

/**
 * 横向滚动视图核心实现类 (继承基础滚动基类 UIScrollView)
 * 封装所有横向滚动专属逻辑：横向布局算法、分页计算、鼠标滚轮横向滚动、横向缓动滚动、左右边界判断
 * 核心特性：子项对象池复用、可视区域裁剪、动态尺寸适配、平滑滚动动画、分页跳转，无业务耦合的通用组件
 */
@ccclass('UIScrollViewHorizontal')
export default class UIScrollViewHorizontal extends UIScrollView {
    // ===== 私有核心成员变量 (原代码初始化值+类型 1:1完整保留 顺序不变) =====
    private _isAtLeft: boolean = true;          // 是否滚动到最左侧边界
    private _isAtRight: boolean = true;         // 是否滚动到最右侧边界
    private _arrPageOffsets: Array<number> = [];// 分页偏移量数组 - 核心分页逻辑数据

    constructor(){
        super()
    }


    // ===== ✅ 只读访问器 (原逻辑完整保留 外部仅可读取边界状态 不可修改) =====
    public get isAtLeft(): boolean {
        return this._isAtLeft;
    }

    public get isAtRight(): boolean {
        return this._isAtRight;
    }

    // ===== 重写父类初始化方法 (调用父类初始化 + 重置自身状态) =====
    public initialize(): void {
        super.initialize();
        this._isAtLeft = true;
        this._isAtRight = true;
    }

    // ===== ✅ 核心重写方法 - 滚动值变更回调 横向布局核心逻辑 🔥 无任何修改 =====
    // 滚动时动态计算可视区域 显示/隐藏子项 核心性能优化逻辑 (对象池复用)
    public onValueChanged(param?): void {
        if (this._arrData.length === 0) return;

        const maskWidth = this._nodeMaskView.width;
        const scrollX = -this._scr.content.x;
        let currentX = this.numPadding.x;
        const visibleRange = new cc.Vec2(scrollX - this.numExtendVisibleRange, scrollX + maskWidth + this.numExtendVisibleRange);

        // 第一步：隐藏可视区域外的子项
        for (let i = 0; i < this._arrData.length; i++) {
            const itemRange = new cc.Vec2(currentX, currentX + this._arrData[i].itemSize.width);
            if (itemRange.y < visibleRange.x || itemRange.x > visibleRange.y) {
                this.restore(i);
            }
            currentX += this._arrData[i].itemSize.width + this.getSpacing(i);
        }

        // 第二步：显示可视区域内的子项 并设置层级
        currentX = this.numPadding.x;
        for (let i = 0; i < this._arrData.length; i++) {
            const itemRange = new cc.Vec2(currentX, currentX + this._arrData[i].itemSize.width);
            if (itemRange.y >= visibleRange.x && itemRange.x <= visibleRange.y) {
                this.pop(i, new cc.Vec2(currentX, 0));
                // 控制节点层级 保证滚动时显示正确
                if (itemRange.y >= visibleRange.x) {
                    this._arrNode[i].node.setSiblingIndex(this._arrNode.length - 1);
                } else {
                    this._arrNode[i].node.setSiblingIndex(0);
                }
            }
            currentX += this._arrData[i].itemSize.width + this.getSpacing(i);
        }

        // 第三步：更新左右边界状态 判断是否滚动到尽头 (保留原代码0.001精度)
        if (this._scr.content.width > maskWidth) {
            this._isAtLeft = (visibleRange.x + this.numExtendVisibleRange) <= 0.001;
            this._isAtRight = (this._scr.content.width - visibleRange.y + this.numExtendVisibleRange) <= 0.001;
        } else {
            this._isAtLeft = true;
            this._isAtRight = true;
        }
    }

    // ===== 重写父类刷新方法 - 处理节点尺寸异步加载问题 =====
    public onRefresh(): void {
        if (this._scr == null) this.initialize();
        // 若蒙版宽度为0 延迟一帧刷新 (节点未加载完成) 原逻辑完整保留
        if (this._nodeMaskView.width === 0) {
            this.scheduleOnce(this.doRefresh.bind(this), 0);
        } else {
            this.doRefresh();
        }
    }

    // ===== ✅ 核心方法 - 执行刷新 重新计算布局+分页+Content尺寸 🔥 无修改 =====
    private doRefresh(): void {
        this._arrPageOffsets = [];
        this._arrPageOffsets.push(0);

        const maskWidth = this._nodeMaskView.width;
        let pageContentWidth = 0;
        let currentX = this.numPadding.x;

        // 计算分页偏移量 核心分页逻辑
        for (let i = 0; i < this._arrData.length; i++) {
            if (maskWidth <= pageContentWidth + this._arrData[i].itemSize.width) {
                this._arrPageOffsets.push(currentX);
                pageContentWidth = 0;
            }
            pageContentWidth += this._arrData[i].itemSize.width + this.getSpacing(i);
            currentX += this._arrData[i].itemSize.width + this.getSpacing(i);
        }

        // 隐藏所有子项 重置对象池
        for (let i = 0; i < this._arrNode.length; i++) {
            this.restore(i);
        }

        // 设置滚动容器总宽度
        currentX += this.numPadding.x;
        this._scr.content.setContentSize(currentX, this._scr.content.height);
        // 刷新可视区域布局
        this.onValueChanged(this._scr.getScrollOffset());
    }

    // ===== ✅ 分页相关方法 全部原逻辑复刻 无修改 =====
    /** 获取当前所在的分页索引 */
    public getCurrentPageIndex(): number {
        const scrollX = -this.scrollView.getScrollOffset().x;
        for (let i = 1; i < this._arrPageOffsets.length; i++) {
            if (scrollX + 0.1 < this._arrPageOffsets[i]) {
                return i - 1;
            }
        }
        return 0;
    }

    /** 获取当前可视区域第一个子项的索引 */
    public getCurrentVisibleDataIndex(): number {
        const visibleIndexArr = this.getVisibleItemIndexArray();
        return visibleIndexArr.length === 0 ? -1 : visibleIndexArr[0];
    }

    /** 获取上一页索引 (边界判断 最小为0) */
    public getPrevPageIndex(): number {
        const curPage = this.getCurrentPageIndex();
        const pageOffset = this.getPageOffset(curPage);
        const scrollX = -this.scrollView.getScrollOffset().x;
        return Math.abs(scrollX - pageOffset) < 0.1 ? Math.max(curPage - 1, 0) : curPage;
    }

    /** 获取下一页索引 (边界判断 最大为最后一页) */
    public getNextPageIndex(): number {
        return Math.min(this.getCurrentPageIndex() + 1, this._arrPageOffsets.length - 1);
    }

    /** 根据分页索引获取对应的偏移量 */
    public getPageOffset(pageIndex: number): number {
        if (pageIndex < 0 || pageIndex >= this._arrPageOffsets.length) return 0;
        return this._arrPageOffsets[pageIndex];
    }

    // ===== ✅ 获取可视区域内所有子项的索引数组 核心辅助方法 =====
    public getVisibleItemIndexArray(): Array<number> {
        const visibleIndexArr: Array<number> = [];
        if (this._arrData.length === 0) return visibleIndexArr;

        const maskWidth = this._nodeMaskView.width;
        const scrollX = -this._scr.content.x;
        let currentX = this.numPadding.x;
        const visibleRange = new cc.Vec2(scrollX - this.numExtendVisibleRange, scrollX + maskWidth + this.numExtendVisibleRange);

        for (let i = 0; i < this._arrData.length; i++) {
            const itemRange = new cc.Vec2(currentX, currentX + this._arrData[i].itemSize.width);
            if (itemRange.y >= visibleRange.x && itemRange.x <= visibleRange.y) {
                visibleIndexArr.push(i);
            }
            currentX += this._arrData[i].itemSize.width + this.getSpacing(i);
        }
        return visibleIndexArr;
    }

    // ===== ✅ 获取指定子项索引对应的滚动偏移量 核心定位方法 =====
    public getOffsetToIndex(targetIndex: number): number {
        if (this._scr == null || targetIndex >= this._arrData.length) return -1;
        if (this._scr.content.width < this._nodeMaskView.width) return -1;

        let targetX = this.numPadding.x;
        for (let i = 0; i < targetIndex; i++) {
            targetX += this._arrData[i].itemSize.width + this.getSpacing(i);
        }
        // 边界限制 不超过滚动最大范围
        return Math.min(this._scr.content.width - this._nodeMaskView.width, targetX);
    }

    // ===== ✅ 滚动到指定子项索引 带动画缓动 =====
    public scrollToIndex(targetIndex: number, duration: number = 1): void {
        const targetOffset = this.getOffsetToIndex(targetIndex);
        if (targetOffset < 0 || this._scr.content.x === -targetOffset) return;
        if (!this.node.activeInHierarchy) return;

        // 中断之前的滚动动画
        if (this._moveAsync) this._moveAsync = null;
        this._moveAsync = this.scroll(-targetOffset, duration);
    }

    // ===== ✅ 滚动到指定偏移量 带动画缓动 核心滚动方法 =====
    public scrollToOffset(targetOffset: cc.Vec2, duration: number = 0.5): void {
        if (this._scr == null || this._scr.content.width < this._nodeMaskView.width) return;
        if (this._scr.content.x === targetOffset.x || !this.node.activeInHierarchy) return;

        // 中断之前的滚动动画
        if (this._moveAsync) this._moveAsync = null;

        // 计算滚动边界 限制偏移量
        const maxScrollX = this._scr.content.width - this._nodeMaskView.width;
        if (targetOffset.x <= -maxScrollX) targetOffset.x = -maxScrollX;
        if (targetOffset.x >= 0) targetOffset.x = 0;

        this._moveAsync = this.scroll(targetOffset.x, duration);
    }

    // ===== ✅ 核心异步方法 - 平滑滚动动画 原Promise+缓动逻辑完整复刻 🔥 重中之重 =====
    // TS原生async/await实现 替代原编译后的__awaiter/__generator 逻辑完全一致
    public async scroll(targetX: number, duration: number): Promise<void> {
        this._scr.stopAutoScroll();
        const startX = this._scr.content.position.x;
        let elapsedTime = 0;

        // 缓动插值循环 直到时间耗尽
        while (elapsedTime < duration) {
            elapsedTime += cc.director.getDeltaTime();
            const progress = elapsedTime / duration;
            // 线性插值计算当前位置
            this._scr.content.x = cc.misc.lerp(startX, targetX, progress);
            // 实时更新布局
            this.onValueChanged(this._scr.getScrollOffset());
            // 帧延迟 保证流畅度 原逻辑setTimeout(0)
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        // 滚动结束 修正最终位置 + 刷新布局
        this._scr.content.x = targetX;
        this.onValueChanged(this._scr.getScrollOffset());
        this._moveAsync = null;
    }

    // ===== ✅ 重写父类删除方法 - 横向专属删除逻辑 调整滚动位置 =====
    public remove(targetIndex: number): void {
        const removedItem = this._arrData[targetIndex];
        // 调用父类删除逻辑
        super.remove(targetIndex);
        // 调整滚动容器位置 保证视觉连贯
        const curOffset = this._scr.getScrollOffset();
        this._scr.content.x -= removedItem.itemSize.width + this.getSpacing(targetIndex);
        this._scr.scrollToOffset(curOffset, 0);
    }

    // ===== ✅ 重写父类显示子项方法 - 横向布局的节点位置赋值 =====
    public pop(itemIndex: number, pos: cc.Vec2): void {
        if (this._arrNode[itemIndex] == null) {
            const poolItem = this._arrNodePool.shift();
            if (poolItem) {
                poolItem.node.active = true;
                poolItem.data = this._arrData[itemIndex];
                poolItem.remove = this.remove.bind(this);
                // 横向核心：X轴居中定位 原逻辑完整保留
                poolItem.node.setPosition(pos.x + poolItem.data.itemSize.width / 2, pos.y, 0);
                this._arrNode[itemIndex] = poolItem;
            }
        }
    }

    // ===== ✅ 核心方法 - 绑定鼠标滚轮事件 实现横向滚动 原逻辑完整复刻 =====
    public setupScrollWheel(): void {
        if (!this.scrollView || !this.scrollView.node) return;

        this.scrollView.node.on(cc.Node.EventType.MOUSE_WHEEL, (event) => {
            // 滚轮Y轴滚动量 转为 横向X轴滚动量
            const wheelDelta = -event.getScrollY();
            let curScrollX = -this.scrollView.getScrollOffset().x;
            const curScrollY = this.scrollView.getScrollOffset().y;

            // 计算新的滚动位置 + 滚轮速度倍率
            let newScrollX = curScrollX + wheelDelta * this.numWheelSpeed;
            const maxScrollX = this.scrollView.getMaxScrollOffset().x;
            // 边界限制
            newScrollX = Math.max(0, Math.min(maxScrollX, newScrollX));

            // 处理边界吸附
            if ((newScrollX <= 0 && curScrollX === 0) || (newScrollX >= maxScrollX && curScrollX === maxScrollX)) {
                event.stopPropagation();
                this.scrollView.stopAutoScroll();
                this.scrollView.content.x = -newScrollX;
                this.onValueChanged(this.scrollView.getScrollOffset());
            } else {
                event.stopPropagation();
                this.scrollToOffset(new cc.Vec2(-newScrollX, curScrollY), this.SCROLL_DURATION);
            }
        }, this.scrollView.node);
    }
}