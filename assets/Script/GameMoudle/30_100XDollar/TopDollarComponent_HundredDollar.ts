const { ccclass, property } = cc._decorator;

/**
 * 百元老虎机顶部美元档位组件
 * 负责控制单个美元档位的黑色/高亮状态切换
 */
@ccclass()
export default class TopDollarComponent_HundredDollar extends cc.Component {
    /** 黑色美元节点（未激活状态） */
    @property({
        type: cc.Node,
        displayName: "黑色美元节点"
    })
    public nodeBlack: cc.Node | null = null;

    /** 高亮美元节点（激活状态） */
    @property({
        type: cc.Node,
        displayName: "高亮美元节点"
    })
    public nodeLight: cc.Node | null = null;

    /**
     * 切换为显示黑色美元节点（隐藏高亮节点）
     */
    setShowBlack(): void {
        // 空值检查，避免运行时错误
        if (this.nodeBlack) {
            this.nodeBlack.active = true;
        } else {
            cc.warn("TopDollarComponent: 黑色美元节点未挂载");
        }

        if (this.nodeLight) {
            this.nodeLight.active = false;
        } else {
            cc.warn("TopDollarComponent: 高亮美元节点未挂载");
        }
    }

    /**
     * 切换为显示高亮美元节点（隐藏黑色节点）
     */
    setShowLight(): void {
        // 空值检查，避免运行时错误
        if (this.nodeBlack) {
            this.nodeBlack.active = false;
        } else {
            cc.warn("TopDollarComponent: 黑色美元节点未挂载");
        }

        if (this.nodeLight) {
            this.nodeLight.active = true;
        } else {
            cc.warn("TopDollarComponent: 高亮美元节点未挂载");
        }
    }
}