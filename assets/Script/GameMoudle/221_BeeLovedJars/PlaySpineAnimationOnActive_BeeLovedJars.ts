const { ccclass, property } = cc._decorator;

/**
 * 在节点激活时播放指定的 Spine 动画
 * @author 
 * @date 
 */
@ccclass('PlaySpineAnimationOnActive_BeeLovedJars')
export default class PlaySpineAnimationOnActive_BeeLovedJars extends cc.Component {
    // 要播放的动画名称（为空时使用默认动画）
    @property({ 
        displayName: "动画名称",
        tooltip: "留空则使用Spine的默认动画"
    })
    animationName: string = "";

    // 是否循环播放
    @property({ 
        displayName: "是否循环",
        tooltip: "动画是否循环播放"
    })
    bLoop: boolean = false;

    onLoad() {
        // 原逻辑保留空实现，可根据需要扩展
    }

    /**
     * 节点激活时自动播放动画
     */
    onEnable() {
        this.playAnimation();
    }

    /**
     * 设置要播放的动画名称
     * @param name 动画名称
     */
    setAnimationName(name: string): void {
        this.animationName = name;
    }

    /**
     * 从开头重新播放动画（带混合模式设置）
     */
    fromBeginningPlay(): void {
        const spine: sp.Skeleton = this.getComponent(sp.Skeleton);
        if (!spine) {
            cc.warn("当前节点未挂载 Spine 组件！");
            return;
        }

        // 清空轨道、重置到初始姿势
        spine.clearTracks();
        spine.setToSetupPose();
        spine.premultipliedAlpha = true;
        
        // 设置混合模式（原逻辑中的 BlendFunc）
        spine["setBlendFunc"](cc.macro.BlendFactor.ONE, cc.macro.BlendFactor.ONE_MINUS_SRC_ALPHA);
        
        // 播放动画
        const playName = this.animationName || spine.defaultAnimation;
        spine.setAnimation(0, playName, this.bLoop);
    }

    // 核心播放逻辑抽离，便于复用
    private playAnimation(): void {
        const spine: sp.Skeleton = this.getComponent(sp.Skeleton);
        if (!spine) {
            cc.warn("当前节点未挂载 Spine 组件！");
            return;
        }

        // 清空轨道、重置到初始姿势
        spine.clearTracks();
        spine.setToSetupPose();
        spine.premultipliedAlpha = true;
        
        // 播放动画（为空时使用默认动画）
        const playName = this.animationName || spine.defaultAnimation;
        spine.setAnimation(0, playName, this.bLoop);
    }
}