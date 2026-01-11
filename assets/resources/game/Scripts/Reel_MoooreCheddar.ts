import Reel from "../../../Script/Slot/Reel";
import TSUtility from "../../../Script/global_utility/TSUtility";
import SymbolPoolManager from "../../../Script/manager/SymbolPoolManager";
import PrizeSymbol_MoooreCheddar from "./PrizeSymbol_MoooreCheddar";


const { ccclass } = cc._decorator;

/**
 * MoooreCheddar 老虎机滚轮组件
 * 继承自通用滚轮基类 Reel，重写符号节点获取逻辑，适配该游戏的 PrizeSymbol 组件
 */
@ccclass()
export default class Reel_MoooreCheddar extends Reel {
    /**
     * 重写父类的符号节点获取方法
     * 针对特定符号 ID（计算后为9的情况）处理 PrizeSymbol_MoooreCheddar 组件的初始化逻辑
     * @param symbolId 符号ID（原始值）
     * @param symbolInfo 符号附加信息（传递给 PrizeSymbol_MoooreCheddar 的 SetSymbolInfo 方法）
     * @returns 处理后的符号节点
     */
    getSymbolNode(symbolId: number, symbolInfo: any): cc.Node {
        // 计算目标符号ID：若 Math.floor(0.1 * symbolId) 等于9，则使用9，否则使用原始symbolId
        const targetSymbolId = Math.floor(0.1 * symbolId) === 9 ? 9 : symbolId;
        
        // 从符号池管理器获取对应的符号节点
        const symbolNode = SymbolPoolManager.instance.getSymbol(targetSymbolId);
        
        // 获取符号节点上的 PrizeSymbol_MoooreCheddar 组件
        const prizeSymbolComp = symbolNode.getComponent(PrizeSymbol_MoooreCheddar);
        
        // 检查组件是否有效，根据符号ID执行不同初始化逻辑
        if (TSUtility.isValid(prizeSymbolComp)) {
            if (targetSymbolId === 9) {
                // 特殊符号（ID=9）：设置符号信息
                prizeSymbolComp.SetSymbolInfo(symbolInfo);
            } else {
                // 普通符号：执行基础初始化
                prizeSymbolComp.initialize();
            }
        }

        // 返回处理后的符号节点
        return symbolNode;
    }
}