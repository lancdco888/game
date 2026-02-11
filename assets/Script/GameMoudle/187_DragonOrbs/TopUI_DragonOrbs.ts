import TSUtility from "../../global_utility/TSUtility";

const { ccclass, property } = cc._decorator;

// ===================== 龙珠游戏顶部UI组件 =====================
/**
 * 龙珠游戏顶部UI组件
 * 管理顶部UI的开场动画、默认循环动画、所有动画停止逻辑，包含龙骨动画和粒子系统的状态控制
 */
@ccclass()
export default class TopUI_DragonOrbs extends cc.Component {
    // ===================== 序列化属性（与原JS完全一致） =====================
    /** 开场龙骨动画组件 */
    @property(sp.Skeleton)
    public intro: sp.Skeleton = null;

    /** 闲置循环龙骨动画组件 */
    @property(sp.Skeleton)
    public idle: sp.Skeleton = null;

    /** 开场动画节点（承载Animation组件） */
    @property(cc.Node)
    public IntroAni: cc.Node = null;

    /** 粒子系统组件 */
    @property(cc.ParticleSystem)
    public particle: cc.ParticleSystem = null;

    /** 标题节点（包含子龙骨动画） */
    @property(cc.Node)
    public title: cc.Node = null;


    constructor(){
        super()
    }

    // ===================== 核心业务方法（与原JS逻辑1:1保留） =====================
    /**
     * 播放开场动画
     */
    public playIntroAni(): void {
        // 重置开场动画节点显隐
        if (TSUtility.isValid(this.intro)) this.intro.node.active = false;
        if (TSUtility.isValid(this.IntroAni)) this.IntroAni.active = false;
        
        // 激活开场动画相关节点/组件
        if (TSUtility.isValid(this.intro)) this.intro.node.active = true;
        if (TSUtility.isValid(this.IntroAni)) this.IntroAni.active = true;

        // 播放顶部入场动画
        const aniComp = this.getComponent(cc.Animation);
        if (TSUtility.isValid(aniComp)) {
            aniComp.stop();
            aniComp.play("Top_Enter_Ani");
        }

        // 播放开场龙骨动画（非循环）
        if (TSUtility.isValid(this.intro)) {
            this.intro.paused = false;
            this.intro.setAnimation(0, this.intro.defaultAnimation, false);
        }

        // 隐藏闲置动画节点
        if (TSUtility.isValid(this.idle)) this.idle.node.active = false;
    }

    /**
     * 播放默认循环动画
     */
    public playDefaultAni(): void {
        // 隐藏开场动画，激活闲置动画
        if (TSUtility.isValid(this.intro)) this.intro.node.active = false;
        if (TSUtility.isValid(this.idle)) {
            this.idle.node.active = true;
            this.idle.paused = false;
            // 播放闲置循环龙骨动画
            this.idle.setAnimation(0, this.idle.defaultAnimation, true);
        }

        // 重置并播放粒子系统
        if (TSUtility.isValid(this.particle)) {
            this.particle.resetSystem();
        }

        // 恢复标题下所有子龙骨动画
        if (TSUtility.isValid(this.title)) {
            const titleSkeletons = this.title.getComponentsInChildren(sp.Skeleton);
            for (let i = 0; i < titleSkeletons.length; ++i) {
                titleSkeletons[i].paused = false;
            }
        }
    }

    /**
     * 停止所有动画（龙骨+粒子+关键帧动画）
     */
    public stopAllAni(): void {
        // 激活闲置动画节点，隐藏开场动画
        if (TSUtility.isValid(this.idle)) this.idle.node.active = true;
        if (TSUtility.isValid(this.intro)) {
            this.intro.node.active = false;
            this.intro.paused = true;
        }

        // 暂停闲置龙骨动画
        if (TSUtility.isValid(this.idle)) {
            this.idle.paused = true;
        }

        // 停止粒子系统
        if (TSUtility.isValid(this.particle)) {
            this.particle.stopSystem();
        }

        // 停止开场动画节点的关键帧动画
        if (TSUtility.isValid(this.IntroAni)) {
            const introAniComp = this.IntroAni.getComponent(cc.Animation);
            if (TSUtility.isValid(introAniComp)) {
                introAniComp.stop();
            }
        }

        // 暂停标题下所有子龙骨动画
        if (TSUtility.isValid(this.title)) {
            const titleSkeletons = this.title.getComponentsInChildren(sp.Skeleton);
            for (let i = 0; i < titleSkeletons.length; ++i) {
                titleSkeletons[i].paused = true;
            }
        }
    }
}