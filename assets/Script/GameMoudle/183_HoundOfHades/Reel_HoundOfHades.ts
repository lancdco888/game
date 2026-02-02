import Reel from "../../Slot/Reel";
import SymbolPoolManager from "../../manager/SymbolPoolManager";
import PrizeComponent_HoundOfHades from "./PrizeComponent_HoundOfHades";
import Symbol from "../../Slot/Symbol";

const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - 滚轮（Reel）组件
 * 核心职责：重写基类的getSymbolNode方法，适配游戏专属的符号获取逻辑（含Respin状态、Prize符号处理）
 */
@ccclass()
export default class Reel_HoundOfHades extends Reel {
    // ====== Cocos 属性面板配置 ======
    /** 是否为重新旋转状态（Respin） */
    @property({ 
        type: Boolean,
        displayName: "Is Respin",
        tooltip: "是否处于重新旋转状态，控制符号的dimm效果"
    })
    public isRespin: boolean = false;

    // ====== 核心方法重写 ======
    /**
     * 重写基类方法：获取符号节点
     * @param symbolId 符号ID（大于100时会减100处理）
     * @param prizeInfo 奖金信息（传给91号符号的PrizeComponent）
     * @returns 符号节点（null表示获取失败）
     */
    getSymbolNode(symbolId: number, prizeInfo: any): cc.Node {
        let targetSymbolId = symbolId;
        let symbolNode: cc.Node = null;

        // 处理符号ID：大于100时减100
        if (symbolId > 100) {
            targetSymbolId -= 100;
        }

        // 从符号池获取对应ID的符号节点
        symbolNode = SymbolPoolManager.instance.getSymbol(targetSymbolId);
        if (!symbolNode) return null;

        // 获取Symbol组件，设置dimm激活状态
        const symbolComp = symbolNode.getComponent(Symbol);
        if (symbolComp) {
            // Respin状态下，排除61/62/63/91号符号，其余设置dimm激活
            const isDimmActive = this.isRespin === true 
                && targetSymbolId !== 61 
                && targetSymbolId !== 62 
                && targetSymbolId !== 63 
                && targetSymbolId !== 91;
            
            symbolComp.setDimmActive(isDimmActive);
        }

        // 91号符号：设置PrizeComponent的中心信息
        if (targetSymbolId === 91) {
            const prizeComp = symbolNode.getComponent(PrizeComponent_HoundOfHades);
            if (prizeComp) {
                prizeComp.setCenterInfo(prizeInfo, true);
            }
        }

        return symbolNode;
    }
}