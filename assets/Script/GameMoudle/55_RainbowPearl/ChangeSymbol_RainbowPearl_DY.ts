import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";

const { ccclass, property } = cc._decorator;

/**
 * RainbowPearl动态滚轮单个符号组件
 * 负责显示符号切换前后的奖金数值，并格式化数值展示
 */
@ccclass('ChangeSymbol_RainbowPearl_DY')
export default class ChangeSymbol_RainbowPearl_DY extends cc.Component {
    /** 切换前的奖金数值标签 */
    @property({ type: cc.Label })
    public labelBefore:cc.Label | null = null;

    /** 切换后的奖金数值标签 */
    @property({ type: cc.Label })
    public labelAfter: cc.Label | null = null;

    /**
     * 设置符号切换前后的奖金数值（自动格式化）
     * @param beforeMoney 切换前的奖金金额（数值类型）
     * @param afterMoney 切换后的奖金金额（数值类型）
     * @param _unusedBet 原调用传入的投注额参数（未实际使用，保留以兼容调用）
     */
    public setChangeMoney(beforeMoney: number, afterMoney: number, _unusedBet?: number): void {
        // 空值保护：避免标签节点未绑定导致报错
        if (this.labelBefore) {
            this.labelBefore.string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(beforeMoney, 3);
        }
        if (this.labelAfter) {
            this.labelAfter.string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(afterMoney, 3);
        }
    }
}