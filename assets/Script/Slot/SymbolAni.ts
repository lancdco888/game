const { ccclass, property } = cc._decorator;
import SDefine from "../global_utility/SDefine";

@ccclass
export default class SymbolAni extends cc.Component {
    // ===== 序列化属性 - 原JS @property配置100%精准复刻，变量名/类型/顺序完全一致 =====
    @property({ type: Number })
    public symbolId: number = 0; // 与SymbolPoolManager联动的符号ID

    @property
    public zOrder: number = 0; // 符号渲染层级

    @property({ type: cc.Node })
    public animationNode: cc.Node = null; // 主动画节点（挂载Animation/Spine）

    @property({ type: [cc.Node] })
    public animationList: cc.Node[] = []; // 子动画节点列表（多段动画拆分）

    // ===== 生命周期回调 - 原代码空实现，严格保留 =====
    onLoad(): void { }

    // ===== 播放核心动画 - 主入口方法，支持指定动画名+循环，粒子重置+双层null校验+节点激活重置全保留 =====
    playAnimation(animName?: string, isLoop?: boolean): void {
        this.resetParticleOnPlay(); // 播放前重置所有粒子特效
        if (null != this.animationNode) {
            // ✅ 保留原代码 神级重置逻辑【false→true】：强制刷新节点动画/骨骼/粒子状态，核心特征，改必失效！
            this.node.active = false;
            this.node.active = true;

            // 处理普通帧动画 cc.Animation
            const animCom = this.animationNode.getComponent(cc.Animation);
            if (null != animCom) {
                animCom.stop(); // 先停止避免动画叠加
                // ✅ 保留原代码 双层null校验核心特征：null != t && null != t 完全复刻！
                if (null != isLoop && null != isLoop) {
                    animCom.defaultClip.wrapMode = isLoop ? cc.WrapMode.Loop : cc.WrapMode.Normal;
                }
                // 无指定动画名则播放默认剪辑，有则播放指定动画
                null == animName ? animCom.play() : animCom.play(animName);
            }

            // 处理骨骼动画 sp.Skeleton (老虎机核心动画载体)
            const spineCom = this.animationNode.getComponent(sp.Skeleton);
            if (null != spineCom) {
                spineCom.enabled = true;
                // ✅ 双层null校验 再次保留
                if (null != isLoop && null != isLoop) {
                    spineCom.loop = !!isLoop;
                }
                // 取动画名：无指定则用默认动画
                const targetAnim = null == animName ? spineCom.defaultAnimation : animName;
                // 设置骨骼动画播放
                if (null != isLoop && null != isLoop) {
                    spineCom.setAnimation(0, targetAnim, isLoop);
                } else {
                    spineCom.setAnimation(0, targetAnim, spineCom.loop);
                }
                // ✅ 保留原代码 移动端Spine适配核心逻辑：修正骨骼动画启动帧，解决移动端首帧卡顿/偏移
                if (!SDefine.Mobile_SpineAnimationStart_Flag && null != spineCom.getCurrent(0)) {
                    spineCom.getCurrent(0).animationStart = 0;
                }
            }
        }

        // 遍历播放所有子动画节点
        for (let i = 0; i < this.animationList.length; ++i) {
            this.playAnimationNode(this.animationList[i], isLoop);
        }
    }

    // ===== 播放动画时重置所有粒子特效 - 原逻辑完全复刻，粒子系统满血复活 =====
    resetParticleOnPlay(): void {
        const particleList = this.node.getComponentsInChildren(cc.ParticleSystem);
        for (let t = 0; t < particleList.length; ++t) {
            particleList[t].resetSystem();
        }
    }

    // ===== 停止所有动画 - 批量调用子节点停止逻辑，无额外处理 =====
    stopAnimation(): void {
        for (let e = 0; e < this.animationList.length; ++e) {
            this.stopAnimationNode(this.animationList[e]);
        }
    }

    // ===== 播放子节点动画 - 与主动画逻辑一致，独立控制，核心特征全保留 =====
    playAnimationNode(animNode: cc.Node, isLoop?: boolean): void {
        // ✅ 再次保留 节点激活重置逻辑 false→true，子动画同样需要强制刷新
        animNode.active = false;
        animNode.active = true;

        // 处理子节点普通帧动画
        const animCom = animNode.getComponent(cc.Animation);
        if (null != animCom) {
            animCom.stop();
            // 无意义但保留原代码的空判断：读取currentClip不做处理
            null == animCom.currentClip || null == animCom.currentClip ? animCom.defaultClip : animCom.currentClip;
            // ✅ 双层null校验 核心特征
            if (null != isLoop && null != isLoop) {
                animCom.defaultClip.wrapMode = isLoop ? cc.WrapMode.Loop : cc.WrapMode.Normal;
                if (null != animCom.currentClip && null != animCom.currentClip) {
                    animCom.currentClip.wrapMode = isLoop ? cc.WrapMode.Loop : cc.WrapMode.Normal;
                }
            }
            animCom.play();
        }

        // 处理子节点骨骼动画
        const spineCom = animNode.getComponent(sp.Skeleton);
        if (null != spineCom) {
            spineCom.enabled = true;
            spineCom.paused = false;
            // ✅ 双层null校验 核心特征
            if (null != isLoop && null != isLoop) {
                spineCom.loop = !!isLoop;
            }
            const targetAnim = spineCom.animation;
            if (null != isLoop && null != isLoop) {
                spineCom.setAnimation(0, targetAnim, isLoop);
            } else {
                spineCom.setAnimation(0, targetAnim, spineCom.loop);
            }
            // ✅ 移动端Spine适配逻辑 同步保留
            if (!SDefine.Mobile_SpineAnimationStart_Flag && null != spineCom.getCurrent(0)) {
                spineCom.getCurrent(0).animationStart = 0;
            }
        }
    }

    // ===== 停止子节点动画 - 原代码核心逻辑【动画停最后一帧+骨骼暂停】，100%复刻，改必错位 =====
    stopAnimationNode(animNode: cc.Node): void {
        // ✅ 节点激活重置逻辑 同步保留
        animNode.active = false;
        animNode.active = true;

        // 处理普通帧动画：停止+强制设置到动画最后一帧，固化显示位，核心需求！
        const animCom = animNode.getComponent(cc.Animation);
        if (null != animCom) {
            animCom.stop();
            if (null != animCom.currentClip) {
                animCom.setCurrentTime(animCom.currentClip.duration);
            }
        }

        // 处理骨骼动画：播放默认动画+启用+暂停，骨骼停留在默认帧，原代码唯一停止逻辑！
        const spineCom = animNode.getComponent(sp.Skeleton);
        if (null != spineCom) {
            spineCom.setAnimation(0, spineCom.defaultAnimation, true);
            spineCom.enabled = true;
            spineCom.paused = true;
        }
    }
}