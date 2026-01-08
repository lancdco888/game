import SDefine from "../../../Script/global_utility/SDefine";

const { ccclass, property } = cc._decorator;


/**
 * 符号动画控制组件
 * 支持cc.Animation、Spine动画、粒子系统的播放/停止控制
 */
@ccclass('SymbolAni')
export default class SymbolAni extends cc.Component {
    /** 符号ID */
    @property({ 
        type: Number, 
        displayName: '符号ID', 
        tooltip: '标识当前动画对应的符号编号' 
    })
    public symbolId: number = 0;

    /** Z轴渲染层级 */
    @property({ 
        displayName: 'Z轴层级', 
        tooltip: '控制动画节点的渲染层级' 
    })
    public zOrder: number = 0;

    /** 主动画节点（单个） */
    @property({ 
        type: cc.Node, 
        displayName: '主动画节点', 
        tooltip: '包含cc.Animation/Spine的主节点' 
    })
    public animationNode: cc.Node | null = null;

    /** 动画节点列表（多个） */
    @property({ 
        type: [cc.Node], 
        displayName: '动画节点列表', 
        tooltip: '需要批量控制的动画节点集合' 
    })
    public animationList: cc.Node[] = [];

    onLoad(): void {
        // 初始化逻辑（预留扩展）
    }

    /**
     * 播放动画（主节点 + 列表节点）
     * @param aniName 动画名称（不传则播放默认动画）
     * @param isLoop 是否循环播放（不传则使用节点自身配置）
     */
    public playAnimation(aniName?: string, isLoop?: boolean): void {
        // 播放前重置所有粒子系统
        this.resetParticleOnPlay();

        // 播放主动画节点
        if (this.animationNode) {
            this._resetNodeActive(this.node);
            this._playSingleNodeAnimation(this.animationNode, aniName, isLoop);
        }

        // 批量播放列表节点动画
        this.animationList.forEach(node => {
            if (node) {
                this.playAnimationNode(node, isLoop);
            }
        });
    }

    /**
     * 重置所有子节点的粒子系统
     */
    public resetParticleOnPlay(): void {
        const particleComps = this.node.getComponentsInChildren(cc.ParticleSystem);
        particleComps.forEach(particle => {
            if (particle && particle.enabled) {
                particle.resetSystem();
            }
        });
    }

    /**
     * 停止所有列表节点的动画
     */
    public stopAnimation(): void {
        this.animationList.forEach(node => {
            if (node) {
                this.stopAnimationNode(node);
            }
        });
    }

    /**
     * 播放单个节点的动画
     * @param node 目标动画节点
     * @param isLoop 是否循环播放
     */
    public playAnimationNode(node: cc.Node, isLoop?: boolean): void {
        if (!node) return;
        
        this._resetNodeActive(node);
        this._playSingleNodeAnimation(node, undefined, isLoop);
    }

    /**
     * 停止单个节点的动画
     * @param node 目标动画节点
     */
    public stopAnimationNode(node: cc.Node): void {
        if (!node) return;

        this._resetNodeActive(node);

        // 停止cc.Animation动画
        const animationComp = node.getComponent(cc.Animation);
        if (animationComp && animationComp.currentClip) {
            animationComp.stop();
            animationComp.setCurrentTime(animationComp.currentClip.duration);
        }

        // 停止Spine动画
        const spineComp = node.getComponent(sp.Skeleton);
        if (spineComp) {
            spineComp.setAnimation(0, spineComp.defaultAnimation, true);
            spineComp.enabled = true;
            spineComp.paused = true;
        }
    }

    // ===================== 私有辅助方法 =====================
    /**
     * 重置节点激活状态（触发动画重新播放）
     * @private
     */
    private _resetNodeActive(node: cc.Node): void {
        node.active = false;
        node.active = true;
    }

    /**
     * 播放单个节点的动画（内部核心逻辑）
     * @private
     */
    private _playSingleNodeAnimation(node: cc.Node, aniName?: string, isLoop?: boolean): void {
        // 处理cc.Animation组件
        const animationComp = node.getComponent(cc.Animation);
        if (animationComp) {
            animationComp.stop();
            
            // 设置循环模式
            if (isLoop !== undefined && animationComp.defaultClip) {
                animationComp.defaultClip.wrapMode = isLoop 
                    ? cc.WrapMode.Loop 
                    : cc.WrapMode.Normal;
                
                // 同步设置当前剪辑的循环模式
                if (animationComp.currentClip) {
                    animationComp.currentClip.wrapMode = animationComp.defaultClip.wrapMode;
                }
            }

            // 播放指定动画或默认动画
            aniName ? animationComp.play(aniName) : animationComp.play();
        }

        // 处理Spine组件
        const spineComp = node.getComponent(sp.Skeleton);
        if (spineComp) {
            spineComp.enabled = true;
            spineComp.paused = false;

            // 设置循环
            if (isLoop !== undefined) {
                spineComp.loop = isLoop;
            }

            // 确定播放的动画名称
            const playAniName = aniName || spineComp.defaultAnimation || spineComp.animation;
            if (playAniName) {
                spineComp.setAnimation(0, playAniName, spineComp.loop);
            }

            // 移动端Spine动画起始位置修正
            if (!SDefine.Mobile_SpineAnimationStart_Flag 
                && spineComp.getCurrent(0)) {
                spineComp.getCurrent(0).animationStart = 0;
            }
        }
    }
}