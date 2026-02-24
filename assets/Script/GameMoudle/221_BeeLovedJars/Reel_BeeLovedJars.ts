import Reel from '../../Slot/Reel';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SymbolPoolManager from '../../manager/SymbolPoolManager';
import JackpotSymbolComponent_BeeLovedJars from './Component/JackpotSymbolComponent_BeeLovedJars';

const { ccclass } = cc._decorator;

/**
 * BeeLovedJars 游戏的滚轮类，继承自通用 Reel 基类
 */
@ccclass('Reel_BeeLovedJars')
export default class Reel_BeeLovedJars extends Reel {
    /**
     * 获取符号节点（核心业务逻辑，完全保留原有逻辑）
     * @param symbolId 符号ID
     * @param row 行号
     * @returns 符号节点
     */
    getSymbolNode(symbolId: number, row: number): cc.Node {
        // 获取当前游戏结果的子游戏标识
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        let targetSymbolId = symbolId;

        // 处理 9 开头的特殊符号ID（91→90、93→92、95→94）
        if (Math.floor(targetSymbolId / 10) === 9) {
            targetSymbolId = targetSymbolId === 91 ? 90 :
                             targetSymbolId === 93 ? 92 :
                             targetSymbolId === 95 ? 94 : targetSymbolId;
        }

        // 从符号池获取符号节点
        const symbolNode = SymbolPoolManager.instance.getSymbol(targetSymbolId);
        
        // 处理 jackpot 符号组件的信息设置
        const jackpotComp = symbolNode.getComponent(JackpotSymbolComponent_BeeLovedJars);
        if (Math.floor(targetSymbolId / 10) === 9 && targetSymbolId !== 97 && targetSymbolId !== 96) {
            jackpotComp?.setInfo(row);
        }

        // freeSpin 模式下隐藏 92 号符号的信息
        if (subGameKey === 'freeSpin' && symbolId === 92) {
            jackpotComp?.hideInfo();
        }

        // lockNRoll 模式下隐藏所有 9 开头符号的信息
        if (subGameKey === 'lockNRoll' && Math.floor(targetSymbolId / 10) === 9) {
            if (TSUtility.isValid(jackpotComp)) {
                jackpotComp.hideInfo();
            }
        }

        return symbolNode;
    }

    /**
     * 为符号出现动画隐藏指定行的符号
     * @param rowOffset 行偏移量
     */
    hideSymbolInRowForAppear(rowOffset: number): void {
        const targetRow = this.bufferRow + rowOffset;
        // 确保数组索引有效（增加健壮性，原代码未处理，TS 中补充）
        if (this.symbolArray && this.symbolArray[targetRow]) {
            this.symbolArray[targetRow].active = false;
        }
    }
}