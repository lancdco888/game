import TSUtility from "../../../Script/global_utility/TSUtility";

const { ccclass, property } = cc._decorator;

/**
 * 机器框架组件
 * 负责控制框架背景显示、背景节点父级调整、狂热特效根节点管理
 */
@ccclass()
export default class MachineFrame extends cc.Component {
    // ===================== 序列化属性（对应编辑器绑定） =====================
    /** 框架背景节点 */
    @property({ type: cc.Node, displayName: "框架背景节点" })
    public frameBG: cc.Node = null!;

    /** 狂热特效根节点 */
    @property({ type: cc.Node, displayName: "狂热特效根节点" })
    public nodeFeverEffectRoot: cc.Node = null!;

    // ===================== 生命周期函数 =====================
    /**
     * 组件加载初始化（原代码为空，保留以兼容扩展）
     */
    onLoad(): void {}

    // ===================== 公共业务方法 =====================
    /**
     * 设置背景显示状态，可选将背景节点移动到新父节点
     * @param isShow 是否显示背景
     * @param newParent 新的父节点（可选，传值时才执行移动）
     */
    setShowBG(isShow: boolean, newParent?: cc.Node): void {
        // 检查背景节点是否有效
        if (this.frameBG != null) {
            // 设置背景节点的激活状态
            this.frameBG.active = isShow;
            
            // 若传入新父节点，调用工具类移动节点到新父级
            if (newParent) {
                TSUtility.moveToNewParent(this.frameBG, newParent);
            }
        }
    }
}