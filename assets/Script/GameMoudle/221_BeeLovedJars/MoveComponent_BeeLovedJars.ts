const { ccclass, property } = cc._decorator;

/**
 * 移动动画控制组件 - BeeLovedJars 游戏
 * 接收参数并播放指定名称的动画
 * @author 
 * @date 
 */
@ccclass('MoveComponent_BeeLovedJars')
export default class MoveComponent_BeeLovedJars extends cc.Component {
    // 要控制的目标动画组件
    @property({
        type: cc.Animation,
        displayName: "目标动画组件",
        tooltip: "需要播放动画的 cc.Animation 组件"
    })
    target_Animation: cc.Animation = null;

    /**
     * 设置并播放指定动画
     * @param e 动画参数1（用于计算动画名称）
     * @param t 动画参数2（用于计算动画名称）
     */
    setAnimation(e: number, t: number): void {
        // 1. 空值校验，避免运行时错误
        if (!this.target_Animation) {
            cc.error("目标动画组件未配置，请检查 target_Animation 属性！");
            return;
        }

        // 2. 计算动画名称（原逻辑：Fx_move_to_top + (3*e + t)）
        const animationName = `Fx_move_to_top${(3 * e + t).toString()}`;
        
        // 3. 停止当前动画 -> 重置时间 -> 播放新动画（原逻辑顺序优化）
        this.target_Animation.stop(); // 停止当前播放的动画
        this.target_Animation.setCurrentTime(0); // 重置动画时间到开头（原逻辑顺序调整，更合理）
        this.target_Animation.play(animationName); // 播放计算后的动画

        // 4. 调试提示（可选，便于开发阶段排查问题）
        if (!this.target_Animation.getAnimationState(animationName)) {
            cc.warn(`动画 "${animationName}" 不存在，请检查动画剪辑名称！`);
        }
    }
}