import TSUtility from "../../global_utility/TSUtility";

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts Jackpot应用组件（保留原拼写Jakcpot，避免业务逻辑异常）
 * 核心功能：根据索引激活对应七星节点
 */
@ccclass()
export default class ApplyJakcpotComponent_SuperSevenBlasts extends cc.Component {
    // ========== 序列化属性（对应Cocos编辑器赋值） ==========
    /** 七星节点数组（索引对应不同Jackpot类型） */
    @property([cc.Node])
    public seven_Nodes: cc.Node[] = [];

    /**
     * 显示指定索引的Jackpot七星节点（其余节点隐藏）
     * @param index 目标节点索引（对应Jackpot类型）
     */
    public showJackpot(index: number): void {
        // 遍历七星节点数组，仅激活指定索引的节点
        this.seven_Nodes.forEach((node, nodeIndex) => {
            if (TSUtility.isValid(node)) {
                node.active = nodeIndex === index;
            }
        });
    }
}