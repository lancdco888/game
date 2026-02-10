

const { ccclass, property } = cc._decorator;

@ccclass('WildSymbolComponent_LuckyBunnyDrop')
export default class WildSymbolComponent_LuckyBunnyDrop extends cc.Component {
    // 组件属性定义（与原JS完全一致）
    @property([cc.Node])
    public count_Nodes: cc.Node[] = [];

    @property([cc.Node])
    public appear_Nodes: cc.Node[] = [];

    @property([cc.Node])
    public change_Nodes: cc.Node[] = [];

    /**
     * 初始化符号所有节点状态（隐藏所有节点）
     */
    public initSymbol(): void {
        // 隐藏计数相关节点
        for (let e = 0; e < this.count_Nodes.length; e++) {
            this.count_Nodes[e].active = false;
        }
        // 隐藏出现相关节点
        for (let e = 0; e < this.appear_Nodes.length; e++) {
            this.appear_Nodes[e].active = false;
        }
        // 隐藏变化相关节点
        for (let e = 0; e < this.change_Nodes.length; e++) {
            this.change_Nodes[e].active = false;
        }
    }

    /**
     * 设置计数节点显示并播放动画
     * @param e 计数索引
     */
    public setCount(e: number): void {
        this.initSymbol();
        if (e < 0 || e >= this.count_Nodes.length) {
            cc.log("Not Have Count");
        } else {
            this.count_Nodes[e].active = true;
            this.playNode(this.count_Nodes[e]);
        }
    }

    /**
     * 设置出现节点显示并播放动画
     * @param e 出现索引
     */
    public setAppear(e: number): void {
        this.initSymbol();
        if (e < 0 || e >= this.appear_Nodes.length) {
            cc.log("Not Have Count");
        } else {
            this.appear_Nodes[e].active = true;
            this.playNode(this.appear_Nodes[e]);
        }
    }

    /**
     * 设置变化节点显示并播放动画
     * @param e 变化索引
     */
    public setChange(e: number): void {
        this.initSymbol();
        if (e < 0 || e >= this.change_Nodes.length) {
            cc.log("Not Have Count");
        } else {
            this.change_Nodes[e].active = true;
            this.playNode(this.change_Nodes[e]);
        }
    }

    /**
     * 播放指定节点的Spine动画
     * @param e 包含Spine组件的节点
     */
    public playNode(e: cc.Node): void {
        const skeleton = e.getComponent(sp.Skeleton);
        if (skeleton) {
            skeleton.setAnimation(0, skeleton.defaultAnimation, skeleton.loop);
        }
    }
}