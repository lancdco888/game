const { ccclass, property } = cc._decorator;

/**
 * 节点激活时播放Spine动画组件
 * 功能：节点启用（onEnable）时自动播放指定Spine动画，支持手动控制动画播放
 */
@ccclass()
export default class PlaySpineAnimationOnActive extends cc.Component {
    /** 要播放的Spine动画名称（为空则使用默认动画） */
    @property({
        displayName: 'Spine动画名称',
        tooltip: '留空则使用Spine组件的默认动画'
    })
    public animationName: string = '';

    /** 是否循环播放动画 */
    @property({
        displayName: '是否循环播放',
        tooltip: 'true：循环播放；false：播放一次'
    })
    public bLoop: boolean = false;

    
    onLoad(): void {
        // 原代码onLoad为空，保留扩展空间
    }

    /**
     * 节点启用时自动播放Spine动画
     * （节点active从false变true时触发）
     */
    onEnable(): void {
        this._playSpineAnimation();
    }

    // ========== 公开方法 ==========
    /**
     * 设置要播放的Spine动画名称
     * @param name 动画名称
     */
    public setAnimationName(name: string): void {
        this.animationName = name;
    }

    /**
     * 从头开始播放指定的Spine动画
     * （手动触发播放，效果同onEnable）
     */
    public fromBeginningPlay(): void {
        this._playSpineAnimation();
    }

    // ========== 私有核心方法 ==========
    /**
     * 内部播放Spine动画的核心逻辑
     * （封装重复逻辑，提升代码复用性）
     */
    private _playSpineAnimation(): void {
        // 获取当前节点的Spine组件（sp.Skeleton）
        const spineComp = this.getComponent(sp.Skeleton);
        
        // 空值保护：避免Spine组件不存在导致报错
        if (!spineComp) {
            cc.error(`[PlaySpineAnimationOnActive] 节点${this.node.name}未挂载sp.Skeleton组件！`);
            return;
        }

        // 确定要播放的动画名称（优先使用指定名称，否则用默认动画）
        const playAniName = this.animationName.trim() !== '' 
            ? this.animationName 
            : spineComp.defaultAnimation;

        // 空值二次保护：避免动画名称为空
        if (!playAniName) {
            cc.error(`[PlaySpineAnimationOnActive] 节点${this.node.name}无可用的Spine动画名称（指定名称为空且默认动画未配置）！`);
            return;
        }

        // 播放Spine动画（轨道0，指定动画名，是否循环）
        spineComp.setAnimation(0, playAniName, this.bLoop);
    }
}