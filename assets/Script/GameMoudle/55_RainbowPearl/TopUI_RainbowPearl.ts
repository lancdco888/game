const { ccclass, property } = cc._decorator;

/**
 * RainbowPearl顶部UI组件
 * 负责控制顶部角色骨骼动画、粒子特效、标题动画的播放/停止及入场动画
 */
@ccclass('TopUI_RainbowPearl')
export default class TopUI_RainbowPearl extends cc.Component {
    /** 角色骨骼动画组件（Spine） */
    @property({ type: sp.Skeleton })
    public skeletonCharacter: sp.Skeleton | null = null;

    /** 粒子特效组件数组 */
    @property({ type: [cc.ParticleSystem] })
    public particles: cc.ParticleSystem[] = [];

    /** 标题动画组件 */
    @property({ type: cc.Animation })
    public titleAnimation: cc.Animation | null = null;

    /**
     * 播放顶部UI入场动画
     */
    public playEntranceAni(): void {
        // 获取当前节点的动画组件并播放入场动画
        const selfAnim = this.getComponent(cc.Animation);
        if (selfAnim) {
            selfAnim.play("Top_Enter");
        }

        // 重启角色骨骼节点（先隐藏再显示，确保动画正常触发）
        if (this.skeletonCharacter?.node) {
            this.skeletonCharacter.node.active = false;
            this.skeletonCharacter.node.active = true;
        }
    }

    /**
     * 播放顶部UI常驻动画（Idle）
     */
    public playTopAni(): void {
        // 播放当前节点的Idle动画
        const selfAnim = this.getComponent(cc.Animation);
        if (selfAnim) {
            selfAnim.play("Top_Idle");
        }

        // 控制角色骨骼动画：若当前是Enter动画则切换为Idle循环
        if (this.skeletonCharacter) {
            if (this.skeletonCharacter.animation === "Enter") {
                this.skeletonCharacter.setAnimation(0, "Idle", true);
            }
            this.skeletonCharacter.paused = false;
        }

        // 重置并播放所有粒子特效
        this.particles.forEach(particle => {
            if (particle && particle.node.active) {
                particle.resetSystem();
            }
        });

        // 播放标题动画
        if (this.titleAnimation) {
            this.titleAnimation.play();
        }
    }

    /**
     * 停止顶部UI所有动画
     */
    public stopTopAni(): void {
        // 暂停角色骨骼动画
        if (this.skeletonCharacter) {
            this.skeletonCharacter.paused = true;
        }

        // 停止所有粒子特效
        this.particles.forEach(particle => {
            if (particle) {
                particle.stopSystem();
            }
        });

        // 停止标题动画
        if (this.titleAnimation) {
            this.titleAnimation.stop();
        }
    }
}