import CustomRichText from "../slot_common/CustomRichText";

const { ccclass, property } = cc._decorator;
/**
 * PowerGem插槽升级子组件（单等级项）
 */
@ccclass()
export class PowerGemSlotUpgrade extends cc.Component {
    // ================= 可序列化属性（编辑器面板配置） =================
    @property({displayName: "等级类型" })
    public grade: number = 0; // 等级类型

    @property({ type: [cc.Node], displayName: "箭头节点列表" })
    public arrArrow: cc.Node[] = []; // 箭头节点列表

    @property({ type: [cc.Animation], displayName: "动画组件列表" })
    public arrAni: cc.Animation[] = []; // 动画组件列表

    @property({ type: CustomRichText, displayName: "等级文本" })
    public lblLevel: CustomRichText | null = null; // 等级富文本标签
}