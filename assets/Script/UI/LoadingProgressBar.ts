const { ccclass, property } = cc._decorator;

// 导入分离式进度条子组件（同目录依赖）
import SeperateProgressBar from "./SeperateProgressBar";

/**
 * 游戏全局通用加载进度条组件
 * 特性：支持原生ProgressBar/自定义分离式进度条双适配 + 进度平滑过渡动画 + 百分比文本实时更新 + 进度最小值阈值限制
 * 被 LoadingPopup 核心弹窗组件依赖调用
 */
@ccclass("LoadingProgressBar")
export default class LoadingProgressBar extends cc.Component {
    // ====================== Cocos 序列化绑定属性 - 编辑器拖拽赋值 ======================
    /** Cocos原生进度条组件（主进度条） */
    @property(cc.ProgressBar)
    public progressBar: cc.ProgressBar = null!;

    /** 自定义分离式进度条组件（备用进度条，二选一使用） */
    @property
    public progressBar2: SeperateProgressBar = null!;

    /** 进度百分比文本 (如: 50%) */
    @property(cc.Label)
    public percentInfo: cc.Label = null!;

    /** 进度描述文本 (如: Loading...) */
    @property(cc.Label)
    public infoLabel: cc.Label = null!;

    /** 进度条上的滑块/手柄节点数组 */
    @property([cc.Node])
    public handles: cc.Node[] = [];

    // ====================== 成员属性 ======================
    /** 上一帧的进度值 (0-1) */
    public prevProgress: number = 0;
    /** 当前目标进度值 (0-1) */
    public curProgress: number = 0;
    /** 进度平滑过渡的速度系数 - 原逻辑固定0.5 */
    private _speed: number = 0.5;

    // ====================== 核心公共方法（供外部调用） ======================
    /**
     * 重置进度条所有状态 - 回到初始0%状态
     * LoadingPopup 打开时会调用该方法
     */
    public reset(): void {
        this._setProgress(0);
        this.prevProgress = 0;
        this.curProgress = 0;
    }

    /**
     * 设置目标进度值（外部核心调用方法）
     * @param value 目标进度 [0,1]
     * 特性1: 进度值只增不减，防止加载回退的视觉bug
     * 特性2: 进度最小值阈值0.05，避免进度条完全不动的体验问题
     * 特性3: 进度到1时直接满值渲染，无过渡动画
     */
    public setProgress(value: number): void {
        // 进度值 只增不减
        let targetProgress = Math.max(this.curProgress, value);
        // 进度最小值阈值：小于0.05则强制设为0.05，避免进度条完全无变化
        targetProgress = targetProgress === 0 ? 0 : (targetProgress < 0.05 ? 0.05 : targetProgress);
        this.curProgress = targetProgress;
        // 进度满值时 直接渲染完成状态
        if (targetProgress === 1) {
            this._setProgress(1);
        }
    }

    // ====================== 私有核心方法 ======================
    /**
     * 实际渲染进度到UI的内部方法
     * @param value 要渲染的进度值 [0,1]
     */
    private _setProgress(value: number): void {
        // 边界值处理：进度最大不超过1
        const renderProgress = Math.min(value, 1);
        this.prevProgress = renderProgress;

        // 更新百分比文本：取整 + 拼接百分号 (如: 36%)
        if (this.percentInfo) {
            this.percentInfo.string = `${(100 * this.prevProgress).toFixed(0)}%`;
        }

        // 双进度条适配逻辑 【核心原逻辑完全保留】
        if (!this.progressBar) {
            // 无原生进度条 → 使用自定义分离式进度条
            this.progressBar2 && this.progressBar2.setProgress(this.prevProgress);
        } else {
            // 有原生进度条 → 更新进度值
            this.progressBar.progress = this.prevProgress;
            // 进度条滑块/手柄 跟随进度移动
            for (let i = 0; i < this.handles.length; i++) {
                if (this.progressBar.barSprite.type === cc.Sprite.Type.FILLED) {
                    this.handles[i].x = this.prevProgress * this.progressBar.barSprite.node.width;
                } else {
                    this.handles[i].x = this.progressBar.barSprite.node.width;
                }
            }
        }
    }

    // ====================== 生命周期 - 帧更新（平滑进度动画核心） ======================
    /**
     * 每帧执行 - 实现进度条的平滑过渡动画
     * @param dt 帧间隔时间
     */
    public update(dt: number): void {
        // 目标进度与当前渲染进度不一致时，才执行平滑过渡
        if (this.prevProgress !== this.curProgress) {
            // 限制帧间隔最大值，防止帧率波动导致进度跳动
            const deltaTime = Math.min(dt, 0.1);
            // 计算本次帧更新的进度步长
            const step = this._speed * deltaTime;
            // 计算目标差值
            const progressDiff = this.curProgress - this.prevProgress;
            
            // 根据差值正负，平滑增减进度值，保证动画流畅
            if (progressDiff > 0) {
                this.prevProgress += Math.min(progressDiff, step);
            } else {
                this.prevProgress += Math.max(progressDiff, -step);
            }
            // 渲染最新进度
            this._setProgress(this.prevProgress);
        }
    }
}