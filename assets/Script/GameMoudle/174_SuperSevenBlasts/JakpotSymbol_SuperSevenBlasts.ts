import TSUtility from "../../global_utility/TSUtility";

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts 游戏专属 Jackpot 符号组件
 * 核心功能：根据不同 Jackpot 符号 ID 显示对应的符号节点、管理就绪/添加符号的显示逻辑
 * 注意：原代码中 "Jakpot" 为拼写笔误，规范命名为 "Jackpot"，代码中已修正
 */
@ccclass()
export default class JackpotSymbol_SuperSevenBlasts extends cc.Component {
    /** Jackpot 符号节点数组（在编辑器中配置对应ID的符号节点） */
    @property({
        type: [cc.Node],
        displayName: "Jackpot符号节点数组",
        tooltip: "按顺序对应不同Jackpot符号ID的显示节点"
    })
    public symbol_Nodes: cc.Node[] = [];

    /**
     * 根据 Jackpot 符号 ID 显示对应的符号节点
     * @param symbolId Jackpot符号ID（91-96）
     */
    public showSymbol(symbolId: number): void {
        // 初始化要显示的节点索引
        let targetIndex = 0;

        // 根据不同的Jackpot符号ID匹配对应节点索引
        switch (symbolId) {
            case 93:
                targetIndex = 0;
                break;
            case 92:
                targetIndex = 1;
                break;
            case 91:
                targetIndex = 2;
                break;
            case 96:
                targetIndex = 3;
                break;
            case 95:
                targetIndex = 4;
                break;
            case 94:
                targetIndex = 5;
                break;
            default:
                // 未知ID默认隐藏所有节点
                targetIndex = -1;
                console.warn(`[JackpotSymbol] 未知的Jackpot符号ID: ${symbolId}`);
                break;
        }

        // 遍历符号节点数组，只激活目标索引的节点，其余隐藏
        for (let i = 0; i < this.symbol_Nodes.length; i++) {
            const node = this.symbol_Nodes[i];
            if (TSUtility.isValid(node)) {
                node.active = (i === targetIndex);
            }
        }
    }

    /**
     * 显示就绪状态的 Jackpot 符号
     * @param symbolId 就绪符号ID（94-96）
     */
    public showReadySymbol(symbolId: number): void {
        // 初始化要显示的节点索引
        let targetIndex = 0;

        // 根据就绪状态的Jackpot符号ID匹配对应节点索引
        switch (symbolId) {
            case 96:
                targetIndex = 0;
                break;
            case 95:
                targetIndex = 1;
                break;
            case 94:
                targetIndex = 2;
                break;
            default:
                // 未知ID默认隐藏所有节点
                targetIndex = -1;
                console.warn(`[JackpotSymbol] 未知的就绪Jackpot符号ID: ${symbolId}`);
                break;
        }

        // 遍历符号节点数组，只激活目标索引的节点，其余隐藏
        for (let i = 0; i < this.symbol_Nodes.length; i++) {
            const node = this.symbol_Nodes[i];
            if (TSUtility.isValid(node)) {
                node.active = (i === targetIndex);
            }
        }
    }

    /**
     * 显示指定索引的添加符号节点
     * @param index 要显示的节点索引
     */
    public showAddSymbol(index: number): void {
        // 遍历符号节点数组，只激活目标索引的节点，其余隐藏
        for (let i = 0; i < this.symbol_Nodes.length; i++) {
            const node = this.symbol_Nodes[i];
            if (TSUtility.isValid(node)) {
                node.active = (i === index);
            }
        }
    }
}