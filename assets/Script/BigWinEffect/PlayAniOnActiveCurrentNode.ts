const { ccclass, property } = cc._decorator;

// 导入项目依赖常量配置
import SDefine from "../global_utility/SDefine";

@ccclass
export default class PlayAniOnActiveCurrentNode extends cc.Component {
    // ===================== 编辑器序列化属性 (与原JS完全一致，默认值精准匹配) =====================
    @property({ type: cc.Boolean })
    public loop: boolean = false;

    @property({ type: cc.Boolean })
    public ignoreLoopFlag: boolean = false;

    // ===================== 生命周期回调 =====================
    /** 节点激活时自动播放动画 - 核心触发逻辑 */
    onEnable(): void {
        this.playAnimation();
    }

    // ===================== 核心方法：播放动画 (原逻辑1:1精准还原) =====================
    public playAnimation(): void {
        const node = this.node;
        const animComp: cc.Animation | null = node.getComponent(cc.Animation);
        const spineComp: sp.Skeleton | null = node.getComponent(sp.Skeleton);

        // ✅ 处理 帧动画组件 cc.Animation
        if (animComp) {
            animComp.stop(); // 先停止原有动画
            // 播放当前剪辑，无剪辑则播放默认
            const playRes = animComp.play();
            if (!playRes && animComp.currentClip) {
                animComp.play(animComp.currentClip.name);
            }
            // 根据循环标记设置播放模式
            if (!this.ignoreLoopFlag && animComp.currentClip) {
                animComp.currentClip.wrapMode = this.loop ? cc.WrapMode.Loop : cc.WrapMode.Default;
            }
        }

        // ✅ 处理 骨骼动画组件 sp.Skeleton
        if (spineComp && spineComp.getCurrent(0)) {
            // 循环模式判定：忽略标记为true → 使用骨骼自身的loop，否则使用组件配置的loop
            const isLoop = this.ignoreLoopFlag ? spineComp.loop : this.loop;
            // 移动端骨骼动画启动帧兼容处理 (原逻辑保留)
            if (!SDefine.Mobile_SpineAnimationStart_Flag) {
                spineComp.getCurrent(0).animationStart = 0;
            }
            // 播放骨骼动画
            spineComp.setAnimation(0, spineComp.animation, isLoop);
        }
    }
}