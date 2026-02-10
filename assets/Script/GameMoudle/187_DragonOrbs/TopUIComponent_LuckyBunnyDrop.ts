
const { ccclass: ccclassDecorator, property: propertyDecorator } = cc._decorator;

@ccclassDecorator()
export default class TopUIComponent_LuckyBunnyDrop extends cc.Component {
    // 组件属性定义（与原JS完全一致）
    @propertyDecorator(cc.Animation)
    public enter_Animation: cc.Animation | null = null;

    @propertyDecorator([cc.Node])
    public enter_Nodes: cc.Node[] = [];

    @propertyDecorator([cc.Node])
    public idle_Nodes: cc.Node[] = [];

    @propertyDecorator([cc.Node])
    public idle_Spine_Nodes: cc.Node[] = [];

    /**
     * 设置进入态UI
     */
    public setEnterance(): void {
        // 隐藏空闲态节点
        for (let e = 0; e < this.idle_Nodes.length; e++) {
            this.idle_Nodes[e].active = false;
        }
        // 显示进入态节点
        for (let e = 0; e < this.enter_Nodes.length; e++) {
            this.enter_Nodes[e].active = true;
        }
        // 播放进入动画
        this.enter_Animation?.stop();
        this.enter_Animation?.play();
        this.enter_Animation?.setCurrentTime(0);
    }

    /**
     * 设置空闲态UI
     */
    public setIdle(): void {
        // 隐藏进入态节点
        for (let e = 0; e < this.enter_Nodes.length; e++) {
            this.enter_Nodes[e].active = false;
        }
        // 显示空闲态节点
        for (let e = 0; e < this.idle_Nodes.length; e++) {
            this.idle_Nodes[e].active = true;
        }
        // 恢复Spine节点动画播放
        for (let e = 0; e < this.idle_Spine_Nodes.length; e++) {
            const skeleton = this.idle_Spine_Nodes[e].getComponent(sp.Skeleton);
            if (skeleton) {
                skeleton.paused = false;
            }
        }
    }

    /**
     * 停止顶部UI所有动画/显示
     */
    public stopTopUI(): void {
        // 隐藏进入态节点
        for (let e = 0; e < this.enter_Nodes.length; e++) {
            this.enter_Nodes[e].active = false;
        }
        // 暂停所有Spine节点
        for (let e = 0; e < this.idle_Spine_Nodes.length; e++) {
            this.pauseSpine(this.idle_Spine_Nodes[e]);
        }
        // 停止并重置进入动画
        this.enter_Animation?.stop();
        this.enter_Animation?.setCurrentTime(0);
    }

    /**
     * 暂停指定Spine节点动画
     * @param e 包含Spine组件的节点
     */
    public pauseSpine(e: cc.Node): void {
        const skeleton = e.getComponent(sp.Skeleton);
        if (skeleton) {
            skeleton.setAnimation(0, skeleton.defaultAnimation, true);
            skeleton.paused = true;
        }
    }
}