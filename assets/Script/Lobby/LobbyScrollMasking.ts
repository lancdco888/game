const { ccclass, property } = cc._decorator;

// ===================== 导入依赖模块 - 路径与原JS完全一致 =====================
import TSUtility from "../global_utility/TSUtility";

// ✅ 核心修复: 自定义Component组件 空@ccclass() 无类名 → 彻底根治类名指定报错
@ccclass()
export default class LobbyScrollMasking extends cc.Component {
    // ===================== 序列化配置属性 - 与原JS完全一致 =====================
    @property({ type: cc.Node, displayName: "滚动阴影遮罩节点" })
    public nodeShadow: cc.Node = null!;

    // ===================== 核心常量配置 - 原JS数值完整复刻 只读不可修改 =====================
    private readonly THRESHOLD_TIME: number = 0.2;
    private readonly CHECK_INTERVAL: number = 0.05;
    private readonly MASKING_ENABLE_INTERVAL: number = 15;

    // ===================== 私有成员变量 - 补全精准TS类型标注 原JS逻辑完整复刻 =====================
    private lastPosition: cc.Vec2 = cc.v2(0, 0);  // 上一次滚动偏移位置
    private numLastMoveTime: number = 0;          // 上一次滚动时间戳
    private numElapsed: number = 0;               // 累计检测间隔时间
    private isScrolling: boolean = false;         // 当前是否满足显示遮罩的滚动状态
    private isWasScrolling: boolean = false;      // 上一帧的滚动状态(防抖用)
    private _scr: any = null;                     // 外部传入的滚动容器对象 (含scrollView属性)

    // ===================== 核心初始化方法 - 绑定滚动视图 重置所有状态 =====================
    public updateScrollView(scrollContainer: any): void {
        this._scr = scrollContainer;
        // 停止遮罩节点所有动画 防止残留
        this.nodeShadow.stopAllActions();
        // 重置所有滚动状态标记
        this.isScrolling = false;
        this.isWasScrolling = false;
        // 隐藏遮罩节点 重置透明度
        this.nodeShadow.active = false;
        this.nodeShadow.opacity = 0;
        // 重置累计检测时间
        this.numElapsed = 0;
        // 记录当前时间戳 & 滚动偏移位置
        this.numLastMoveTime = Date.now() / 1000;
        this.lastPosition = this._scr.scrollView.getScrollOffset();
    }

    // ===================== 帧更新 - 核心滚动状态检测 带性能优化的间隔检测 =====================
    update(dt: number): void {
        // 滚动容器无效则直接返回
        if (TSUtility.isValid(this._scr)) return;

        // 累计帧间隔时间 达到检测阈值才执行判断 → 帧率优化 避免每帧执行
        this.numElapsed += dt;
        if (this.numElapsed < this.CHECK_INTERVAL) return;

        // 重置累计时间 执行状态检测
        this.numElapsed = 0;
        // ✅ 核心判断逻辑: 水平滚动偏移量 X ≤ -15 时 显示遮罩 (原JS逻辑1:1复刻)
        this.isScrolling = this._scr.scrollView.getScrollOffset().x <= -this.MASKING_ENABLE_INTERVAL;

        // 滚动状态发生变化 → 执行淡入/淡出动画
        if (this.isScrolling !== this.isWasScrolling) {
            this.isScrolling ? this.fadeInNode() : this.fadeOutNode();
            this.isWasScrolling = this.isScrolling;
        }
    }

    // ===================== 遮罩节点淡入动画 - 与原JS动画参数完全一致 =====================
    private fadeInNode(): void {
        this.nodeShadow.stopAllActions();
        // 节点未激活则初始化显示状态
        if (!this.nodeShadow.active) {
            this.nodeShadow.active = true;
            this.nodeShadow.opacity = 0;
        }
        // 0.3秒淡入动画
        this.nodeShadow.runAction(cc.fadeIn(0.3));
    }

    // ===================== 遮罩节点淡出动画 - 与原JS动画序列+回调完全一致 =====================
    private fadeOutNode(): void {
        this.nodeShadow.stopAllActions();
        // 0.3秒淡出 → 动画完成后隐藏节点 (原JS核心回调逻辑完整复刻)
        this.nodeShadow.runAction(cc.sequence(
            cc.fadeOut(0.3),
            cc.callFunc(() => {
                this.nodeShadow.active = false;
            })
        ));
    }
}