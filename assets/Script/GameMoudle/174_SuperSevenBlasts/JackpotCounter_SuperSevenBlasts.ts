import TSUtility from "../../global_utility/TSUtility";

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts 游戏专属Jackpot计数器组件
 * 核心功能：计数文本设置、不同状态动画播放（正常计数/低计数/出场/循环）
 * 注意：原代码存在拼写错误（bottonAnimation → bottomAnimation），保留原命名避免业务逻辑冲突
 */
@ccclass()
export default class JackpotCounter_SuperSevenBlasts extends cc.Component {
    // ========== 编辑器配置属性 ==========
    /** 目标动画组件（计数器主体动画） */
    @property({
        type: cc.Animation,
        displayName: "目标动画组件",
        tooltip: "Jackpot计数器主体的动画组件"
    })
    public targetAnimation: cc.Animation | null = null;

    /** 底部动画组件（原代码拼写错误：botton → bottom，保留） */
    @property({
        type: cc.Animation,
        displayName: "底部动画组件",
        tooltip: "Jackpot计数器底部装饰的动画组件"
    })
    public bottonAnimation: cc.Animation | null = null;

    /** 计数显示标签 */
    @property({
        type: cc.Label,
        displayName: "计数标签",
        tooltip: "显示Jackpot计数值的文本标签"
    })
    public targetLabel: cc.Label | null = null;

    // ========== 核心方法 - 计数文本设置 ==========
    /**
     * 设置计数器显示的文本内容
     * @param count 计数值（数字类型）
     */
    public setCountString(count: number): void {
        if (TSUtility.isValid(this.targetLabel)) {
            this.targetLabel.string = count.toString();
        }
    }

    // ========== 核心方法 - 正常计数动画 ==========
    /**
     * 播放正常计数状态动画（非低计数）
     * 逻辑：停止所有调度器 → 播放计数动画 → 延迟1秒播放循环动画
     */
    public setCount(): void {
        // 取消所有已调度的回调
        this.unscheduleAllCallbacks();
        
        // 播放计数选中动画
        this.playAnimation("Fx_Top_score_Select_count");
        
        // 延迟1秒切换到循环动画
        this.scheduleOnce(() => {
            this.setLoop();
        }, 1);
    }

    // ========== 核心方法 - 低计数动画 ==========
    /**
     * 播放低计数状态动画（≤5）
     * 逻辑：停止所有调度器 → 播放低计数动画 → 延迟1秒播放低计数循环动画
     */
    public setUnderCount(): void {
        // 取消所有已调度的回调
        this.unscheduleAllCallbacks();
        
        // 播放低计数选中动画（u6代表under 6，即≤5）
        this.playAnimation("Fx_Top_score_Select_count_u6");
        
        // 延迟1秒切换到低计数循环动画
        this.scheduleOnce(() => {
            this.setUnderLoop();
        }, 1);
    }

    // ========== 核心方法 - 出场动画 ==========
    /**
     * 播放计数器出场动画
     * 逻辑：停止所有调度器 → 播放出场动画 → 延迟2秒播放循环动画
     */
    public setAppear(): void {
        // 取消所有已调度的回调
        this.unscheduleAllCallbacks();
        
        // 播放出场动画
        this.playAnimation("Fx_Top_score_Select_appear");
        
        // 延迟2秒切换到正常循环动画
        this.scheduleOnce(() => {
            this.setLoop();
        }, 2);
    }

    // ========== 核心方法 - 循环动画 ==========
    /**
     * 播放正常计数循环动画
     */
    public setLoop(): void {
        this.playAnimation("Fx_Top_score_Select_loop");
    }

    /**
     * 播放低计数循环动画
     */
    public setUnderLoop(): void {
        this.playAnimation("Fx_Top_score_Select_loop_u6");
    }

    // ========== 核心方法 - 动画播放通用逻辑 ==========
    /**
     * 通用动画播放方法
     * @param animName 动画剪辑名称
     */
    public playAnimation(animName: string): void {
        // 播放目标动画（主体）
        if (TSUtility.isValid(this.targetAnimation)) {
            this.targetAnimation.stop(); // 停止当前动画
            this.targetAnimation.play(animName); // 播放指定动画
            this.targetAnimation.setCurrentTime(0); // 重置动画到起始帧
        }

        // 播放底部动画（装饰）
        if (TSUtility.isValid(this.bottonAnimation)) {
            this.bottonAnimation.stop(); // 停止当前动画
            this.bottonAnimation.play(animName); // 播放指定动画
            this.bottonAnimation.setCurrentTime(0); // 重置动画到起始帧
        }
    }
}