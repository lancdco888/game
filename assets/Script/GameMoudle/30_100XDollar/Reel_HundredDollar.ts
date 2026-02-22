import Reel from "../../Slot/Reel";
import SymbolPoolManager from "../../manager/SymbolPoolManager";
import Symbol from "../../Slot/Symbol";


const { ccclass } = cc._decorator;

/**
 * 百元游戏（HundredDollar）专属滚轮组件
 * 继承自Reel，核心实现模糊符号/正常符号的切换逻辑
 */
@ccclass('Reel_HundredDollar')
export default class Reel_HundredDollar extends Reel {
    // 模糊符号标记：true=显示模糊符号，false=显示正常符号
    public _flagBlur: boolean = false;

    /**
     * 获取符号节点（根据模糊标记返回对应符号）
     * @param symbolId 原始符号ID
     * @returns 符号节点
     */
    getSymbolNode(symbolId: number): cc.Node {
        let symbolNode: cc.Node | null = null;

        // 模糊状态下的符号ID映射规则
        if (this._flagBlur) {
            if (symbolId === 0) {
                // 0号符号保持不变
                symbolNode = SymbolPoolManager.instance.getSymbol(0);
            } else if (symbolId !== 61) {
                // 非61号符号：ID+10（模糊版本）
                symbolNode = SymbolPoolManager.instance.getSymbol(symbolId + 10);
            } else if (symbolId === 61) {
                // 61号符号替换为62号（模糊版本）
                symbolNode = SymbolPoolManager.instance.getSymbol(62);
            }
        } else {
            // 正常状态：返回原始符号
            symbolNode = SymbolPoolManager.instance.getSymbol(symbolId);
        }

        // 容错：符号节点不存在时打印错误
        if (!symbolNode) {
            cc.error(`Reel_HundredDollar: 未找到符号ID ${symbolId}（模糊状态：${this._flagBlur}）`);
        }

        return symbolNode!; // 非空断言（确保游戏内符号配置完整）
    }

    /**
     * 将所有符号节点切换为模糊版本
     * 核心规则：0→0，61→62，21-25/71→ID+10，其他忽略
     */
    changeNodesToBlurSymbol(): void {
        for (let o = 0; o < this.symbolArray.length; ++o) {
            const oldSymbolNode = this.symbolArray[o];
            const oldSymbolComp = oldSymbolNode.getComponent(Symbol);
            if (!oldSymbolComp) continue; // 无Symbol组件则跳过

            const oldSymbolId = oldSymbolComp.symbolId;
            let newSymbolNode: cc.Node | null = null;

            // 模糊符号ID映射规则
            if (oldSymbolId === 0) {
                newSymbolNode = SymbolPoolManager.instance.getSymbol(0);
            } else if (oldSymbolId === 61) {
                newSymbolNode = SymbolPoolManager.instance.getSymbol(62);
            } else if ((oldSymbolId >= 21 && oldSymbolId <= 25) || oldSymbolId === 71) {
                newSymbolNode = SymbolPoolManager.instance.getSymbol(oldSymbolId + 10);
            }

            // 无匹配的模糊符号则跳过
            if (!newSymbolNode) continue;

            // 配置新符号节点的位置和层级
            newSymbolNode.x = oldSymbolNode.x;
            newSymbolNode.y = oldSymbolNode.y;

            // 替换符号数组并释放旧符号
            this.symbolArray[o] = newSymbolNode;
            SymbolPoolManager.instance.releaseSymbol(oldSymbolComp);

            // 添加新节点到滚轮并应用Shader
            this.node.addChild(newSymbolNode);
            this.applyShader(newSymbolNode);
        }

        // 重置所有符号的层级顺序
        this.resetAllSiblingIndex();
    }

    /**
     * 将所有符号节点切换为正常版本
     * 核心规则：0→0，62→61，其他模糊符号（ID-10）→原始ID
     */
    changeNodesToNormalSymbol(): void {
        for (let o = 0; o < this.symbolArray.length; ++o) {
            const oldSymbolNode = this.symbolArray[o];
            const oldSymbolComp = oldSymbolNode.getComponent(Symbol);
            if (!oldSymbolComp) continue; // 无Symbol组件则跳过

            const oldSymbolId = oldSymbolComp.symbolId;
            let newSymbolNode: cc.Node | null = null;

            // 正常符号ID映射规则（还原模糊符号）
            if (oldSymbolId === 0) {
                newSymbolNode = SymbolPoolManager.instance.getSymbol(0);
            } else if (oldSymbolId === 62) {
                // 62号模糊符号还原为61号
                newSymbolNode = SymbolPoolManager.instance.getSymbol(61);
            } else {
                // 其他模糊符号：ID-10（还原为原始ID）
                newSymbolNode = SymbolPoolManager.instance.getSymbol(oldSymbolId - 10);
            }

            // 容错：符号节点不存在时打印错误
            if (!newSymbolNode) {
                cc.error(`Reel_HundredDollar: 未找到还原后的符号ID ${oldSymbolId - 10}（原始模糊ID：${oldSymbolId}）`);
                continue;
            }

            // 配置新符号节点的位置和层级
            newSymbolNode.x = oldSymbolNode.x;
            newSymbolNode.y = oldSymbolNode.y;

            // 替换符号数组并释放旧符号
            this.symbolArray[o] = newSymbolNode;
            SymbolPoolManager.instance.releaseSymbol(oldSymbolComp);

            // 添加新节点到滚轮并应用Shader
            this.node.addChild(newSymbolNode);
            this.applyShader(newSymbolNode);
        }

        // 重置所有符号的层级顺序
        this.resetAllSiblingIndex();
    }
}