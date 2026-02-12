import TSUtility from "../../global_utility/TSUtility";

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts 游戏专属计数组件
 * 核心功能：显示计数数值、播放计数动画、隐藏计数UI
 */
@ccclass()
export default class CountComponent_SuperSevenBlasts extends cc.Component {
    // ========== 编辑器配置属性 ==========
    /** 计数动画组件 */
    @property({
        type: cc.Animation,
        displayName: "目标动画组件",
        tooltip: "控制计数显示/隐藏的动画组件"
    })
    public targetAni: cc.Animation = null;

    /** 上一次计数标签 */
    @property({
        type: cc.Label,
        displayName: "上一次计数标签",
        tooltip: "显示上一次计数数值的Label组件"
    })
    public prev_Label: cc.Label = null;

    /** 当前计数标签 */
    @property({
        type: cc.Label,
        displayName: "当前计数标签",
        tooltip: "显示当前计数数值的Label组件"
    })
    public current_Label: cc.Label = null;

    // ========== 状态属性 ==========
    /** 上一次计数数值 */
    private prevCount: number = 0;

    // ========== 核心业务逻辑 ==========
    /**
     * 显示计数并播放动画
     * @param count 要显示的计数值
     * @param isSpot 是否为Spot模式（控制动画类型）
     * @param delayTime 延迟回调时间（秒）
     * @param callback 延迟执行的回调函数
     */
    public appearCount(
        count: number, 
        isSpot: number, 
        delayTime: number, 
        callback?: () => void
    ): void {
        // 取消所有未执行的调度器
        this.unscheduleAllCallbacks();
        
        // 激活节点并设置标签文本
        this.node.active = true;
        if (this.prev_Label) {
            this.prev_Label.string = this.prevCount === 0 ? "" : this.prevCount.toString();
        }
        if (this.current_Label) {
            this.current_Label.string = count.toString();
        }
        
        // 更新上一次计数
        this.prevCount = count;

        // 根据模式播放对应动画
        const aniName = isSpot === 1 ? "Fx_Symbol_count_Spot" : "Fx_Symbol_count_Play";
        this.playAnimation(aniName);

        // 延迟执行回调（确保回调函数有效）
        this.scheduleOnce(() => {
            if (TSUtility.isValid(callback) && typeof callback === 'function') {
                callback();
            }
        }, delayTime);
    }

    /**
     * 隐藏计数UI并重置状态
     */
    public hideUI(): void {
        // 重置上一次计数
        this.prevCount = 0;
        
        // 播放结束动画
        this.playAnimation("Fx_Symbol_count_Fin");

        // 延迟隐藏节点
        this.scheduleOnce(() => {
            this.node.active = false;
        }, 0.5);
    }

    /**
     * 播放指定动画
     * @param aniName 动画名称
     */
    public playAnimation(aniName: string): void {
        // 空值安全检查：确保动画组件有效
        if (!TSUtility.isValid(this.targetAni)) {
            console.warn("[CountComponent] 目标动画组件未配置或已销毁");
            return;
        }

        // 停止当前动画 → 播放指定动画 → 重置动画时间到开头
        this.targetAni.stop();
        this.targetAni.play(aniName);
        this.targetAni.setCurrentTime(0);
    }
}