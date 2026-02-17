const { ccclass, property } = cc._decorator;

/**
 * 鲨鱼攻击游戏顶部UI组件
 * 负责入场动画播放、粒子系统/普通动画/Spine骨骼动画的批量播放/停止控制
 */
@ccclass('TopUI_SharkAttack')
export default class TopUI_SharkAttack extends cc.Component {
    // 需批量控制的普通动画组件列表
    @property({ type: [cc.Animation] })
    public animations: cc.Animation[] = [];

    // 需批量控制的粒子系统组件列表
    @property({ type: [cc.ParticleSystem] })
    public particles: cc.ParticleSystem[] = [];

    // 需批量控制的Spine骨骼动画组件列表
    @property({ type: [sp.Skeleton] })
    public spines: sp.Skeleton[] = [];

    // 鲨鱼入场动画的Spine组件
    @property({ type: sp.Skeleton })
    public sharkIntro: sp.Skeleton = null!;

    /**
     * 播放顶部UI的入场动画
     */
    playEntranceAni(): void {
        // 停止当前动画并播放入场动画
        const aniComponent = this.getComponent(cc.Animation)!;
        aniComponent.stop();
        aniComponent.play("Top_Enter_Ani");
        
        // 播放鲨鱼入场的Spine动画（单次播放，不循环）
        this.sharkIntro.setAnimation(0, this.sharkIntro.defaultAnimation, false);
    }

    /**
     * 批量播放所有动画/粒子/Spine
     */
    playAnimation(): void {
        // 重置并播放所有粒子系统
        for (let e = 0; e < this.particles.length; ++e) {
            this.particles[e].resetSystem();
        }

        // 播放所有普通动画
        for (let e = 0; e < this.animations.length; ++e) {
            this.animations[e].play();
        }

        // 取消所有Spine骨骼动画的暂停状态
        for (let e = 0; e < this.spines.length; ++e) {
            this.spines[e].paused = false;
        }
    }

    /**
     * 批量停止所有动画/粒子/Spine
     */
    stopAnimation(): void {
        // 停止所有粒子系统
        for (let e = 0; e < this.particles.length; ++e) {
            this.particles[e].stopSystem();
        }

        // 停止所有普通动画
        for (let e = 0; e < this.animations.length; ++e) {
            this.animations[e].stop();
        }

        // 暂停所有Spine骨骼动画
        for (let e = 0; e < this.spines.length; ++e) {
            this.spines[e].paused = true;
        }
    }
}