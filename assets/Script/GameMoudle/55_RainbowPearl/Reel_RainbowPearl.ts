import Reel from "../../Slot/Reel";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";
import SymbolPoolManager, { SymbolInfo } from "../../manager/SymbolPoolManager";
import JackpotSymbol_RainbowPearl from "./JackpotSymbol_RainbowPearl";
import Symbol from "../../Slot/Symbol";

const { ccclass, property } = cc._decorator;


/**
 * RainbowPearl 滚轮组件
 * 核心功能：获取符号节点（区分Jackpot/普通符号）、控制符号变暗状态
 */
@ccclass('Reel_RainbowPearl')
export default class Reel_RainbowPearl extends Reel {
    //#region 组件属性
    /** 是否让普通符号变暗（Jackpot符号不受此标记影响） */
    @property
    public isDimmNormalSymbol: boolean = false;

    /** 普通模式随机倍数列表 */
    private listRandomMultiplier: number[] = [12, 24, 40, 120, 240, 400, 800];

    /** 动态模式随机倍数列表 */
    private listRandomMultiplier_DY: number[] = [100, 150, 200, 250, 500, 750, 1250, 2500, 5000];
    //#endregion

    /**
     * 获取符号节点（核心方法）
     * @param symbolId 符号ID（90-99为Jackpot符号，其他为普通符号）
     * @param symbolInfo 符号信息（Jackpot符号专用）
     * @returns 符号节点（Node）
     */
    public getSymbolNode(symbolId: number, symbolInfo?: any): cc.Node {
        // 从符号池获取符号节点
        const symbolNode = SymbolPoolManager.instance.getSymbol(symbolId);
        
        // 校验符号节点有效性（原代码逻辑修正：isValid为true才继续，否则报错）
        if (!TSUtility.isValid(symbolNode)) {
            cc.error(`[Reel_RainbowPearl] 未找到符号ID: ${symbolId}`);
            return symbolNode; // 兜底返回（符号池应保证返回有效节点，此处仅容错）
        }

        // 处理Jackpot符号（90-99）的特殊配置
        if (symbolId >= 90 && symbolId < 100) {
            let typeIdx = 0; // Jackpot符号中心信息类型索引
            let prizeValue = 0; // 奖金/倍数值

            // 无符号信息 → 随机生成倍数
            if (!symbolInfo || !symbolInfo.type) {
                // 判断是否为动态Slot，选择对应倍数列表
                const multiplierList = TSUtility.isDynamicSlot(SlotGameRuleManager.Instance.slotID) 
                    ? this.listRandomMultiplier_DY 
                    : this.listRandomMultiplier;
                // 随机取倍数值
                prizeValue = multiplierList[Math.floor(Math.random() * multiplierList.length)];
            } 
            // 有符号信息 → 按类型解析
            else {
                switch (symbolInfo.type) {
                    case "jackpot":
                        // Jackpot类型：mini/minor/major/mega对应不同索引
                        switch (symbolInfo.key) {
                            case "mini": typeIdx = 1; break;
                            case "minor": typeIdx = 2; break;
                            case "major": typeIdx = 3; break;
                            case "mega": typeIdx = 4; break;
                            default: typeIdx = 0; break;
                        }
                        break;
                    case "multiplier":
                        // 倍数类型：计算最终倍数值（兼容prize/multiplier参数）
                        typeIdx = 0;
                        prizeValue = symbolInfo.multiplier !== 0 
                            ? (10 * symbolInfo.prize * symbolInfo.multiplier) / 10 
                            : symbolInfo.prize;
                        break;
                    case "basic":
                        // 基础类型（FixedCoin）
                        if (symbolInfo.prizeUnit === "FixedCoin") {
                            typeIdx = 5;
                            prizeValue = symbolInfo.prize;
                        }
                        break;
                }
            }

            // 设置Jackpot符号中心信息（奖金/倍数、类型）
            const jackpotSymbolComp = symbolNode.getComponent(JackpotSymbol_RainbowPearl);
            if (jackpotSymbolComp) {
                jackpotSymbolComp.setCenterInfoRainbowPearl(typeIdx, prizeValue);
                jackpotSymbolComp.setDimmContents(false); // Jackpot符号默认不变暗
            }
        } 
        // 处理普通符号 → 按标记控制变暗状态
        else {
            const normalSymbolComp = symbolNode.getComponent(Symbol);
            if (normalSymbolComp) {
                normalSymbolComp.setDimmActive(this.isDimmNormalSymbol);
            }
        }

        return symbolNode;
    }

    /**
     * 设置滚轮内符号的变暗状态（Jackpot符号特殊处理）
     * - Jackpot符号（90-94）：不变暗
     * - 其他符号：强制变暗
     */
    public setSymbolsDimmActiveJackpot(): void {
        if (!this.symbolArray || this.symbolArray.length === 0) return;

        for (const symbolNode of this.symbolArray) {
            const symbolComp = symbolNode.getComponent(Symbol);
            if (!symbolComp) continue;

            // Jackpot符号（90-94）不变暗，其他符号变暗
            if (symbolComp.symbolId >= 90 && symbolComp.symbolId < 95) {
                symbolComp.setDimmActive(false);
            } else {
                symbolComp.setDimmActive(true);
            }
        }
    }

    /**
     * 设置普通符号是否变暗的标记（Jackpot符号不受此标记影响）
     * @param isDimm 是否变暗
     */
    public setFlagDimmNormalSymbols(isDimm: boolean): void {
        this.isDimmNormalSymbol = isDimm;
    }
}