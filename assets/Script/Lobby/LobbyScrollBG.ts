const { ccclass, property } = cc._decorator;

// ✅ 核心修复: 自定义Component组件 必须使用 空的@ccclass() 无类名字符串 - 彻底根治类名指定报错
@ccclass()
export default class LobbyScrollBG extends cc.Component {
    // ===================== 序列化配置属性 - 与原JS完全一致 含tooltip韩文注释+默认值 =====================
    @property({ type: cc.ScrollView, displayName: "滚动视图组件" })
    public scrollView: cc.ScrollView = null!;

    @property({ type: cc.Node, displayName: "背景节点模板" })
    public nodeBG: cc.Node = null!;

    @property({ 
        type: cc.Float, 
        tooltip: "배경 이동 속도 비율 (1 = 스크롤과 동일 속도)" 
    })
    public speedFactor: number = 1;

    @property({ 
        type: cc.Integer, 
        tooltip: "시작 위치 (L:-830 S:273 Y:-985)" 
    })
    public startPosition: number = 0;

    // ===================== 私有成员变量 - 补全精准TS类型标注 原JS逻辑完整复刻 =====================
    private _arrBG: cc.Node[] = [];          // 背景节点数组(克隆+原节点 共2个)
    private _sizeBG: cc.Size = cc.size(0, 0); // 背景节点尺寸
    private _lastOffset: cc.Vec2 = cc.v2(0, 0);// 上一帧滚动偏移量
    private _numBeforeMaxOffset: number = 0;  // 上一帧最大滚动偏移量
    private _numBeforeOffset: number = 0;     // 上一帧当前滚动偏移量

    // ===================== 生命周期 - onLoad 初始化逻辑 与原JS完全一致 =====================
    onLoad(): void {
        if (this.scrollView !== null && this.nodeBG !== null) {
            // 获取背景节点原始尺寸
            this._sizeBG = this.nodeBG.getContentSize();
            // 克隆背景节点 实现无缝拼接
            const cloneBg = cc.instantiate(this.nodeBG);
            cloneBg.parent = this.nodeBG.parent;
            // 存入背景数组 克隆节点在前 原节点在后
            this._arrBG.push(cloneBg);
            this._arrBG.push(this.nodeBG);
            // 绑定滚动视图的滚动事件
            this.scrollView.node.on("scrolling", this.onScrolling, this);
            // 初始化背景节点位置
            this.repositionBG();
            // 立即执行一次滚动逻辑
            this.onScrolling();
        }
    }

    // ===================== 帧更新 - 检测滚动偏移量变化 防止重复执行 =====================
    lateUpdate(): void {
        if (this.scrollView === null) return;

        // 水平滚动模式
        if (this.scrollView.horizontal) {
            const curMaxOffset = this.scrollView.getMaxScrollOffset().x;
            const curOffset = this.scrollView.getScrollOffset().x;
            if (this._numBeforeMaxOffset === curMaxOffset && this._numBeforeOffset === curOffset) {
                return;
            }
            this._numBeforeMaxOffset = curMaxOffset;
            this._numBeforeOffset = curOffset;
        } 
        // 垂直滚动模式
        else {
            const curMaxOffset = this.scrollView.getMaxScrollOffset().y;
            const curOffset = this.scrollView.getScrollOffset().y;
            if (this._numBeforeMaxOffset === curMaxOffset && this._numBeforeOffset === curOffset) {
                return;
            }
            this._numBeforeMaxOffset = curMaxOffset;
            this._numBeforeOffset = curOffset;
        }
        // 偏移量变化 执行滚动逻辑
        this.onScrolling();
    }

    // ===================== 核心滚动逻辑 - 计算偏移量 驱动背景节点移动 =====================
    private onScrolling(): void {
        if (this.scrollView === null) return;

        const curOffset = this.scrollView.getScrollOffset();
        let offsetDelta: number = 0;

        // 计算滚动偏移差值 * 速度倍率
        if (this.scrollView.horizontal) {
            offsetDelta = (curOffset.x - this._lastOffset.x) * this.speedFactor;
            this.updateHorizontalBG(offsetDelta);
        } else {
            offsetDelta = (curOffset.y - this._lastOffset.y) * this.speedFactor;
            this.updateVerticalBG(offsetDelta);
        }
        // 保存当前偏移量 (克隆防止引用覆盖)
        this._lastOffset = curOffset.clone();
    }

    // ===================== 水平滚动背景更新 - 核心无缝循环逻辑 =====================
    private updateHorizontalBG(offsetDelta: number): void {
        // 所有背景节点跟随滚动偏移
        for (let i = 0; i < this._arrBG.length; i++) {
            this._arrBG[i].x -= offsetDelta;
        }

        const bgFirst = this._arrBG[0];
        const bgSecond = this._arrBG[1];

        // 第一个背景节点完全移出右侧可视区 → 拼接到第二个节点右侧
        if (bgFirst.x + this._sizeBG.width < 0) {
            bgFirst.x = bgSecond.x + this._sizeBG.width;
            this._arrBG.push(this._arrBG.shift()!);
        }
        // 第二个背景节点完全移出左侧可视区 → 拼接到第一个节点左侧
        else if (bgSecond.x - this._sizeBG.width > 0) {
            bgSecond.x = bgFirst.x - this._sizeBG.width;
            this._arrBG.unshift(this._arrBG.pop()!);
        }
    }

    // ===================== 垂直滚动背景更新 - 核心无缝循环逻辑 =====================
    private updateVerticalBG(offsetDelta: number): void {
        // 所有背景节点跟随滚动偏移
        for (let i = 0; i < this._arrBG.length; i++) {
            this._arrBG[i].y -= offsetDelta;
        }

        const bgFirst = this._arrBG[0];
        const bgSecond = this._arrBG[1];

        // 第一个背景节点完全移出下侧可视区 → 拼接到第二个节点下侧
        if (bgFirst.y + this._sizeBG.height < 0) {
            bgFirst.y = bgSecond.y + this._sizeBG.height;
            this._arrBG.push(this._arrBG.shift()!);
        }
        // 第二个背景节点完全移出上侧可视区 → 拼接到第一个节点上侧
        else if (bgSecond.y - this._sizeBG.height > 0) {
            bgSecond.y = bgFirst.y - this._sizeBG.height;
            this._arrBG.unshift(this._arrBG.pop()!);
        }
    }

    // ===================== 背景节点初始位置重置 =====================
    private repositionBG(): void {
        if (this.scrollView.horizontal) {
            // 水平模式 两个背景节点左右拼接
            this._arrBG[0].x = 0;
            this._arrBG[1].x = this._sizeBG.width;
            // 叠加起始位置偏移
            this._arrBG[0].x += this.startPosition;
            this._arrBG[1].x += this.startPosition;
        } else {
            // 垂直模式 两个背景节点上下拼接
            this._arrBG[0].y = 0;
            this._arrBG[1].y = this._sizeBG.height;
            // 叠加起始位置偏移
            this._arrBG[0].y += this.startPosition;
            this._arrBG[1].y += this.startPosition;
        }
    }
}