
const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - 顶部UI组件
 * 负责控制顶部UI的动画状态（appear/idle/stay）和Hades骨骼动画的播放
 */
@ccclass()
export default class TopUIComponent_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 顶部UI动画组件（控制标题动画） */
    @property(cc.Animation)
    public topUI_Ani: cc.Animation | null = null;

    /** Hades角色骨骼组件（Spine） */
    @property(sp.Skeleton)
    public hades: sp.Skeleton | null = null;

    // ====== 核心动画控制方法 ======
    /**
     * 播放顶部UI"出现"动画 + Hades骨骼出场动画
     * - 标题播放：Open_title_appear（单次）
     * - Hades先播放：Open_Ani（单次），2.45秒后切换为Open_Ani_idle（循环）
     */
    appear(): void {
        // 安全检查：动画组件和骨骼组件必须存在
        if (!this.topUI_Ani || !this.hades) {
            console.warn("TopUIComponent: topUI_Ani 或 hades 组件未配置！");
            return;
        }

        // 控制顶部UI动画：停止当前动画 → 播放出场动画 → 重置动画时间到开头
        this.topUI_Ani.stop();
        this.topUI_Ani.play("Open_title_appear");
        this.topUI_Ani.setCurrentTime(0);

        // 控制Hades骨骼动画：先播放出场动画（非循环）
        this.hades.setAnimation(0, "Open_Ani", false);
        
        // 2.45秒后切换为空闲动画（循环）
        this.scheduleOnce(() => {
            if (this.hades) { // 二次安全检查，避免组件销毁后调用
                this.hades.setAnimation(0, "Open_Ani_idle", true);
            }
        }, 2.45);
    }

    /**
     * 播放顶部UI"空闲"动画 + Hades骨骼空闲动画
     * - 标题播放：Open_title_idle（循环）
     * - Hades播放：Open_Ani_idle（循环）
     */
    idle(): void {
        // 安全检查
        if (!this.topUI_Ani || !this.hades) {
            console.warn("TopUIComponent: topUI_Ani 或 hades 组件未配置！");
            return;
        }

        // 控制顶部UI动画：停止当前 → 播放空闲动画 → 重置时间
        this.topUI_Ani.stop();
        this.topUI_Ani.play("Open_title_idle");
        this.topUI_Ani.setCurrentTime(0);

        // 控制Hades骨骼动画：播放空闲动画（循环）
        this.hades.setAnimation(0, "Open_Ani_idle", true);
    }

    /**
     * 播放顶部UI"停留"动画 + Hades骨骼停留动画
     * - 标题播放：Open_title_stay（循环）
     * - Hades播放：Open_Ani_stay（循环）
     */
    stay(): void {
        // 安全检查
        if (!this.topUI_Ani || !this.hades) {
            console.warn("TopUIComponent: topUI_Ani 或 hades 组件未配置！");
            return;
        }

        // 控制顶部UI动画：停止当前 → 播放停留动画 → 重置时间
        this.topUI_Ani.stop();
        this.topUI_Ani.play("Open_title_stay");
        this.topUI_Ani.setCurrentTime(0);

        // 控制Hades骨骼动画：播放停留动画（循环）
        this.hades.setAnimation(0, "Open_Ani_stay", true);
    }
}