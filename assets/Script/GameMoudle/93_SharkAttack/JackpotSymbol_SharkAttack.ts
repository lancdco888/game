import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";

const { ccclass, property } = cc._decorator;

/**
 * 鲨鱼攻击游戏大奖符号组件
 * 负责计算并显示大奖符号的奖金数值，支持真实奖金（基于游戏规则）和随机虚拟奖金两种模式
 */
@ccclass('JackpotSymbol_SharkAttack')
export default class JackpotSymbol_SharkAttack extends cc.Component {
    // 奖金数值显示标签
    @property({ type: cc.Label })
    prize: cc.Label = null!;

    /**
     * 设置真实的大奖符号奖金信息
     * @param symbolInfo 符号信息对象（包含基础奖金prize字段）
     */
    setSymbolInfo(symbolInfo: any): void {
        // 计算实际奖金：基础奖金 * (总投注额 / 100)
        const actualPrize = symbolInfo.prize * (SlotGameRuleManager.Instance.getTotalBet() / 100);
        // 格式化奖金数值（最多保留3位小数，带省略号处理）
        this.prize.string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(actualPrize, 3);
    }

    /**
     * 设置虚拟的大奖符号奖金信息（随机数值）
     */
    setDummySymbolInfo(): void {
        // 随机奖金基数数组
        const prizeBaseList = [20, 50, 150, 75, 200];
        // 随机选取基数并计算实际奖金：随机基数 * (总投注额 / 100)
        const randomBase = prizeBaseList[Math.floor(Math.random() * prizeBaseList.length)];
        const actualPrize = randomBase * (SlotGameRuleManager.Instance.getTotalBet() / 100);
        // 格式化奖金数值（最多保留3位小数，带省略号处理）
        this.prize.string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(actualPrize, 3);
    }
}