const { ccclass, property } = cc._decorator;

/**
 * 暮光龙（Twilight Dragon）顶部 UI 管理类
 * 继承自 cc.Component，管控顶部 UI 动画、粒子特效、龙骨动画的状态切换
 */
@ccclass()
export default class TopUI_TwilightDragon extends cc.Component {
    // ======================================
    // Cocos 编辑器可绑定属性（对应原 JS 中的 s 装饰器）
    // ======================================
    /** 顶部 UI 根节点动画（整体布局动画） */
    @property(cc.Animation)
    public rootAni: cc.Animation = null;

    /** 顶部 UI 标题动画（标题文字/图标动画） */
    @property(cc.Animation)
    public titleAni: cc.Animation = null;

    /** 粒子特效数组（背景/装饰粒子） */
    @property({ type: [cc.ParticleSystem] })
    public particleArr: cc.ParticleSystem[] = [];

    /** 龙骨动画数组（龙形特效，Spine 组件） */
    @property({ type: [sp.Skeleton] })
    public dragonSpineArr: sp.Skeleton[] = [];

    /** 入场状态节点（仅入场动画时显示） */
    @property(cc.Node)
    public introNode: cc.Node = null;

    /** 默认状态节点（正常游戏时显示） */
    @property(cc.Node)
    public defaultNode: cc.Node = null;

    // ======================================
    // 核心方法：停止所有动画、粒子、龙骨特效
    // ======================================
    public stopAllAni(): void {
        // 停止 UI 根节点和标题动画
        if (this.rootAni) this.rootAni.stop();
        if (this.titleAni) this.titleAni.stop();

        // 停止所有粒子系统
        this.particleArr.forEach(particle => {
            if (particle) particle.stopSystem();
        });

        // 暂停所有龙骨动画
        this.dragonSpineArr.forEach(spine => {
            if (spine) spine.paused = true;
        });

        // 切换节点显示状态：隐藏入场节点，显示默认节点
        if (this.introNode) this.introNode.active = false;
        if (this.defaultNode) this.defaultNode.active = true;
    }

    // ======================================
    // 核心方法：播放入场动画（游戏启动/进入基础模式时）
    // ======================================
    public playIntroAni(): void {
        if (this.rootAni) this.rootAni.play("TopUI_Intro");
        if (this.titleAni) this.titleAni.play("TopUI_Title_Intro");
    }

    // ======================================
    // 核心方法：播放默认动画（正常游戏时的循环动画）
    // ======================================
    public playDefaultAni(): void {
        // 播放 UI 根节点和标题的默认循环动画
        if (this.rootAni) this.rootAni.play("TopUI_Normal");
        if (this.titleAni) this.titleAni.play("TopUI_Title_Normal");

        // 重置并启动所有粒子系统（循环播放）
        this.particleArr.forEach(particle => {
            if (particle) particle.resetSystem();
        });

        // 启动第 2 个龙骨动画（索引 1，循环闲置动画）
        // 索引对应编辑器中绑定的龙骨节点，保留原逻辑不变
        const mainDragonSpine = this.dragonSpineArr[1];
        if (mainDragonSpine) {
            mainDragonSpine.paused = false;
            mainDragonSpine.setAnimation(0, "TopUI_Idle", true); // true 表示循环播放
        }

        // 切换节点显示状态
        if (this.introNode) this.introNode.active = false;
        if (this.defaultNode) this.defaultNode.active = true;
    }

    // ======================================
    // 核心方法：播放免费旋转触发动画（触发 Free Spin 时）
    // ======================================
    public freeSpinTrigger(): void {
        if (this.rootAni) this.rootAni.play("TopUI_Trigger");

        // 启动第 3 个龙骨动画（索引 2，单次触发动画）
        const triggerDragonSpine = this.dragonSpineArr[2];
        if (triggerDragonSpine) {
            triggerDragonSpine.paused = false;
            triggerDragonSpine.setAnimation(0, "TopUI_Idle", false); // false 表示单次播放
        }
    }

    // ======================================
    // 核心方法：重连免费旋转模式（恢复上次 Free Spin 状态时）
    // ======================================
    public reconnectFreeSpin(): void {
        // 隐藏默认节点，将第 3 个龙骨节点设为透明
        if (this.defaultNode) this.defaultNode.active = false;
        
        const triggerDragonSpine = this.dragonSpineArr[2];
        if (triggerDragonSpine && triggerDragonSpine.node) {
            triggerDragonSpine.node.opacity = 0; // 设为完全透明（不可见）
        }
    }
}