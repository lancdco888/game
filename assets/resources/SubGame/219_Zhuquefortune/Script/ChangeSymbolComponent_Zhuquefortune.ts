import TSUtility from "../../../../Script/global_utility/TSUtility";
import SlotGameRuleManager from "../../../../Script/manager/SlotGameRuleManager";
import ZhuquefortuneManager from "./ZhuquefortuneManager";

// 符合 Cocos 2.4.x 原生写法：解构装饰器
const { ccclass, property } = cc._decorator;

/**
 * 符号切换与奖金展示组件
 * 负责根据符号ID切换对应符号节点，计算并展示奖金金额，区分普通奖金与高额奖金标签显示
 */
@ccclass("ChangeSymbolComponent_Zhuquefortune")
export default class ChangeSymbolComponent_Zhuquefortune extends cc.Component {
    // 普通符号节点数组（对应不同符号ID，索引与符号ID映射）
    @property([cc.Node])
    public normal_symbols: cc.Node[] = [];

    // 普通奖金标签（展示低于3倍总投注的奖金）
    @property(cc.Label)
    public normal_Label: cc.Label | null = null;

    // 高额奖金标签（展示高于等于3倍总投注的奖金）
    @property(cc.Label)
    public high_Label: cc.Label | null = null;

    /**
     * 设置符号与奖金信息（切换对应符号节点，计算并展示奖金金额）
     * @param symbolId 符号ID（用于匹配符号节点索引）
     * @param prizeInfo 奖金信息对象（包含奖金金额、奖金单位等）
     */
    public setInfo(symbolId: number, prizeInfo: any): void {
        // 1. 根据符号ID匹配对应的符号节点索引
        let targetSymbolIndex = 0;
        switch (symbolId) {
            case 14:
                targetSymbolIndex = 0;
                break;
            case 13:
                targetSymbolIndex = 1;
                break;
            case 12:
                targetSymbolIndex = 2;
                break;
            case 24:
                targetSymbolIndex = 3;
                break;
            case 23:
                targetSymbolIndex = 4;
                // 注意：原代码无break，穿透到case 22（故意设计，保留该逻辑）
            case 22:
                targetSymbolIndex = 5;
                break;
            case 21:
                targetSymbolIndex = 6;
                break;
            case 31:
                targetSymbolIndex = 7;
                break;
            case 71:
                targetSymbolIndex = 8;
                break;
            default:
                targetSymbolIndex = 0;
                cc.warn(`未知的符号ID：${symbolId}，默认使用索引 0 符号`);
                break;
        }

        // 2. 切换符号节点（仅激活目标索引节点，隐藏其他节点）
        this.normal_symbols.forEach((node, index) => {
            node.active = index === targetSymbolIndex;
        });

        // 3. 重置奖金标签显示（先清空两个标签内容）
        this.normal_Label.string = "";
        this.high_Label.string = "";

        // 4. 计算奖金金额
        let prizeAmount = 0;
        // 4.1 有效奖金信息则取对应奖金，否则随机取默认奖金数组值
        if (TSUtility.isValid(prizeInfo)) {
            prizeAmount = prizeInfo.prize;
        } else {
            const defaultPrizeArray = [6, 16, 30, 45, 60];
            prizeAmount = defaultPrizeArray[Math.floor(Math.random() * defaultPrizeArray.length)];
        }

        // 4.2 计算最终奖金（结合当期每线投注，兼容固定硬币单位）
        let finalPrize = prizeAmount * SlotGameRuleManager.Instance.getCurrentBetPerLine();
        if (TSUtility.isValid(prizeInfo) && prizeInfo.prizeUnit === "FixedCoin") {
            finalPrize = prizeInfo.prize;
        }

        // 5. 获取格式化工具，区分普通/高额奖金并展示
        const zhuqueManager = ZhuquefortuneManager.getInstance();
        if (!zhuqueManager || !zhuqueManager.game_components) {
            cc.warn("朱雀管理器或游戏组件未初始化，无法格式化奖金金额");
            return;
        }

        const formattedPrize = zhuqueManager.game_components.formatEllipsisNumber(finalPrize);
        const threeTimesTotalBet = 3 * SlotGameRuleManager.Instance.getTotalBet();

        // 5.1 高额奖金（>=3倍总投注）展示在high_Label
        // 5.2 普通奖金（<3倍总投注）展示在normal_Label
        if (finalPrize >= threeTimesTotalBet) {
            this.high_Label.string = formattedPrize;
        } else {
            this.normal_Label.string = formattedPrize;
        }
    }
}