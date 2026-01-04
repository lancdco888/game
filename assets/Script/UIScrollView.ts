const { ccclass, property } = cc._decorator;

// 导入子项组件 路径与原代码一致
import UIScrollViewItem from "./UIScrollViewItem";

/**
 * 滚动视图通用基类 (继承cc.Component)
 * 封装滚动列表的底层通用逻辑：对象池复用、数据增删改查、滚动事件绑定、尺寸监听、基础滚动方法
 * ✅ 设计思想：基类只做通用逻辑，所有【方向相关】的布局/滚动逻辑均为【空方法】，由子类(横向/纵向)继承重写
 * ✅ 核心特性：节点对象池(性能优化)、数据与视图解耦、编辑器序列化配置、无缝支持子类扩展
 */
@ccclass('UIScrollView')
export default class UIScrollView extends cc.Component {
    // ===== 滚动动画默认时长 常量 (原代码完整保留) =====
    public SCROLL_DURATION: number = 0.1;

    // ===== ✅ 编辑器序列化配置属性 (与原代码完全一致 类型+默认值无修改) =====
    @property({ type: cc.Prefab, displayName: "滚动子项预制体" })
    public prefab: cc.Prefab = null;

    @property({ type: cc.Integer, displayName: "对象池初始化数量" })
    public numNodePoolSize: number = 20;

    @property({ type: cc.Integer, displayName: "子项间距" })
    public numSpacing: number = 0;

    @property({ type: cc.Vec2, displayName: "容器内边距" })
    public numPadding: cc.Vec2 = new cc.Vec2(0, 0);

    @property({ type: cc.Integer, displayName: "可视区域扩展范围" })
    public numExtendVisibleRange: number = 0;

    @property({ type: cc.Integer, displayName: "鼠标滚轮滚动速度" })
    public numWheelSpeed: number = 5;

    // ===== ✅ 私有核心成员变量 (原代码初始化值+类型 1:1完整保留 顺序不变) =====
    public _scr: cc.ScrollView = null;               // 滚动视图组件
    public _nodeMaskView: cc.Node = null;            // 滚动蒙版节点 (View节点)
    public _arrData: Array<any> = new Array();    // 绑定的数据源数组
    public _arrNode: Array<UIScrollViewItem> = new Array(); // 显示中的子项组件数组
    public _arrNodePool: Array<UIScrollViewItem> = new Array(); // 子项对象池
    public _moveAsync: Promise<any> | null = null;// 异步滚动动画Promise对象
    public _nunViewWidth: number = 0;             // 蒙版宽度缓存
    public _numViewHeight: number = 0;            // 蒙版高度缓存

    constructor(){
        super()
    }

    // ===== ✅ 只读/读写访问器 (原逻辑完整保留 外部统一访问入口 无任何修改) =====
    public get scrollView(): cc.ScrollView {
        return this._scr;
    }

    public get content(): cc.Node {
        return this._scr == null ? null : this._scr.content;
    }

    public get view(): cc.Node {
        return this._nodeMaskView;
    }

    public get offset(): cc.Vec2 {
        return this._scr == null ? new cc.Vec2(0, 0) : this._scr.getScrollOffset();
    }

    public get spacing(): number {
        return this.numSpacing;
    }

    public set spacing(value: number) {
        this.numSpacing = value;
    }

    public get padding(): cc.Vec2 {
        return this.numPadding;
    }

    public set padding(value: cc.Vec2) {
        this.numPadding = value;
    }

    public get arrVisibleItemIndex(): Array<number> {
        return this.getVisibleItemIndexArray();
    }

    public get arrVisibleItem(): Array<UIScrollViewItem> {
        return this.getVisibleItemArray();
    }

    public get arrItem(): Array<UIScrollViewItem> {
        return this._arrNode;
    }

    // =========================================================================
    // ✅ 【空实现方法】所有滚动方向相关的核心逻辑 - 由子类(横向/纵向)继承重写
    // 原代码所有空方法完整保留，保证子类继承无报错，设计思想完全一致
    // =========================================================================
    public onValueChanged(): void { }

    public onRefresh(): void { }

    public getOffsetToIndex(param?): number {
        return -1;
    }

    public scrollToIndex(targetIndex: number, duration: number = 1): void { }

    public scrollToOffset(targetOffset: cc.Vec2, duration: number = 0.5): void { }

    public async scroll(targetX: number, duration: number): Promise<void> {
        return;
    }

    public getVisibleItemIndexArray(): Array<number> {
        return [];
    }

    public setupScrollWheel(): void { }

    public getCurrentPageIndex(): number {
        return 0;
    }

    public getPrevPageIndex(): number {
        return 0;
    }

    public getNextPageIndex(): number {
        return 0;
    }

    public getPageOffset(param?): number {
        return 0;
    }

    // =========================================================================
    // ✅ 【核心初始化方法】基类通用初始化逻辑 🔥 无任何修改 重中之重
    // 绑定滚动事件、初始化对象池、获取核心节点引用，只执行一次
    // =========================================================================
    public initialize(): void {
        if (this._scr != null) return;

        // 获取滚动视图组件 + 蒙版节点
        this._scr = this.node.getComponent(cc.ScrollView);
        this._nodeMaskView = this._scr.node.getChildByName("View");

        // 绑定滚动事件回调
        this._scr.node.on("scrolling", this.onValueChanged.bind(this), this);

        // 初始化对象池 - 创建指定数量的预制体 加入对象池 置为非激活状态
        for (let i = 0; i < this.numNodePoolSize; i++) {
            const itemNode = cc.instantiate(this.prefab);
            if (itemNode) {
                this._scr.content.addChild(itemNode);
                itemNode.active = false;
                const itemComp = itemNode.getComponent(UIScrollViewItem);
                if (itemComp) {
                    this._arrNodePool.push(itemComp);
                }
            }
        }

        // 缓存蒙版初始尺寸
        this._nunViewWidth = this._nodeMaskView.width;
        this._numViewHeight = this._nodeMaskView.height;

        // 初始化滚轮事件 (子类重写实现具体逻辑)
        this.setupScrollWheel();
    }

    // =========================================================================
    // ✅ 帧更新监听 - 蒙版尺寸变化自动刷新布局 适配节点动态缩放/分辨率变化
    // =========================================================================
    public lateUpdate(): void {
        if (this._scr == null) return;

        // 蒙版尺寸发生变化 → 刷新布局
        if (this._nunViewWidth !== this._nodeMaskView.width || this._numViewHeight !== this._nodeMaskView.height) {
            this._nunViewWidth = this._nodeMaskView.width;
            this._numViewHeight = this._nodeMaskView.height;
            this.onRefresh();
        }
    }

    // =========================================================================
    // ✅ 通用方法 - 获取子项间距 核心规则：最后一个子项无间距 避免尾部留白
    // =========================================================================
    public getSpacing(index: number = 0): number {
        return (this._arrData.length - 1) === index ? 0 : this.numSpacing;
    }

    // =========================================================================
    // ✅ 通用方法 - 获取可视区域内的子项组件数组
    // =========================================================================
    public getVisibleItemArray(): Array<UIScrollViewItem> {
        const visibleItems: Array<UIScrollViewItem> = [];
        const visibleIndexArr = this.getVisibleItemIndexArray();
        for (let i = 0; i < visibleIndexArr.length; i++) {
            const item = this._arrNode[visibleIndexArr[i]];
            if (item) {
                visibleItems.push(item);
            }
        }
        return visibleItems;
    }

    // =========================================================================
    // ✅ 【核心数据管理方法】所有对列表数据的增删改查 完全复刻原逻辑 无修改
    // 统一管理数据源_arrData，联动刷新视图，是列表的核心数据操作入口
    // =========================================================================
    /** 清空所有数据+所有显示节点 重置列表 */
    public clear(): void {
        if (this._scr == null) this.initialize();
        this.clearData();
        // 回收所有显示中的节点到对象池
        for (let i = 0; i < this._arrNode.length; i++) {
            this.restore(i);
        }
        this._arrNode = new Array();
        this.onRefresh();
    }

    /** 清空数据源 重置滚动位置 */
    public clearData(): void {
        this._scr.stopAutoScroll();
        this._scr.scrollToTop();
        this._arrData = new Array();
    }

    /** 批量添加数据数组 */
    public addArray(dataArr: Array<any>): void {
        for (let i = 0; i < dataArr.length; i++) {
            this.add(dataArr[i], false);
        }
        this.onRefresh();
    }

    /** 单个添加数据项 */
    public add(data: any, isRefresh: boolean = true): void {
        if (this._scr == null) this.initialize();
        this._arrData.push(data);
        this._arrNode.push(null);
        this.updateItemIndex();
        if (isRefresh) this.onRefresh();
    }

    /** 全量更新数据源 替换原有数据 */
    public updateAllData(dataArr: Array<any>): void {
        if (this._scr == null) this.initialize();
        this._arrData = [];
        this._arrData.push.apply(this._arrData, dataArr);
        this.updateItemIndex();
        this.onRefresh();
    }

    /** 更新指定索引的数据项 */
    public updateData(index: number, data: any): void {
        if (this._scr == null) this.initialize();
        if (index < 0 || index >= this._arrData.length) return;
        this._arrData[index] = data;
        this.onRefresh();
    }

    /** 删除指定索引的数据项 */
    public remove(index: number): void {
        if (this._scr == null) this.initialize();
        if (this._arrData.length === 0) return;
        this._arrData.splice(index, 1);
        this.updateItemIndex();
        this.onRefresh();
    }

    /** 更新所有数据项的索引值 同步子项的index属性 */
    public updateItemIndex(): void {
        for (let i = 0; i < this._arrData.length; i++) {
            this._arrData[i].setIndex(i);
        }
    }

    // =========================================================================
    // ✅ 快捷滚动方法 - 滚动到列表首位/末位 封装scrollToIndex
    // =========================================================================
    public scrollToLast(duration: number = 1): void {
        this.scrollToIndex(this._arrData.length - 1, duration);
    }

    public scrollToFirst(duration: number = 1): void {
        this.scrollToIndex(0, duration);
    }

    // =========================================================================
    // ✅ 【核心对象池方法】节点复用的核心实现 基类通用逻辑 子类可重写
    // pop: 从对象池取出节点 → 显示 + 绑定数据
    // restore: 把节点回收至对象池 → 隐藏 + 清空引用
    // =========================================================================
    public pop(index: number, pos: cc.Vec2): void {
        if (this._arrNode[index] == null) {
            const poolItem = this._arrNodePool.shift();
            if (poolItem) {
                poolItem.node.active = true;
                poolItem.data = this._arrData[index];
                poolItem.remove = this.remove.bind(this);
                poolItem.node.setPosition(pos.x, pos.y, 0);
                this._arrNode[index] = poolItem;
            }
        }
    }

    public restore(index: number): void {
        if (this._arrNode[index] != null) {
            const item = this._arrNode[index];
            if (item) {
                this._arrNode[index] = null;
                this._arrNodePool.push(item);
                item.node.active = false;
            }
        }
    }
}