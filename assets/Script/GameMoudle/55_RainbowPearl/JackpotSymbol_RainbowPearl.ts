import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";

const { ccclass, property } = cc._decorator;

/**
 * RainbowPearl Jackpot符号组件
 * 负责Jackpot符号的奖金显示、随机内容生成、明暗状态切换
 */
@ccclass('JackpotSymbol_RainbowPearl')
export default class JackpotSymbol_RainbowPearl extends cc.Component {
    /** 常规奖金数值标签（小额奖金） */
    @property({ type: cc.Label })
    public labelMoney: cc.Label | null = null;

    /** 高额奖金数值标签（大额奖金） */
    @property({ type: cc.Label })
    public labelMoneyHigh: cc.Label | null = null;

    /** 暗显状态奖金数值标签 */
    @property({ type: cc.Label })
    public labelMoneyDimm: cc.Label | null = null;

    /** Jackpot类型文本节点数组（对应不同Jackpot等级） */
    @property({ type: [cc.Node] })
    public jackpotTexts: cc.Node[] = [];

    /** 移动锚点节点（预留动画使用） */
    @property({ type: cc.Node })
    public movePivot: cc.Node | null = null;

    /** 奖金乘数列表（随机金额时使用） */
    public multiplierList: number[] = [9, 18, 27, 36, 45];

    /** 当前Jackpot类型：0-乘数奖金 | 1-4-Jackpot等级 | 5-固定金额 */
    public jackpotType: number = 0;

    /** 当前显示的奖金金额 */
    public money: number = 0;

    /**
     * 随机设置符号内容（金额/Jackpot等级）
     */
    public setRandomContentsInfo(): void {
        this.hideAllContents();
        // 无Jackpot文本时随机金额；有则70%概率金额，30%概率Jackpot（修复原代码Math.random()<7的逻辑错误）
        if (this.jackpotTexts.length === 0) {
            this.setRandomMoney();
        } else {
            const randomVal = Math.random();
            randomVal < 0.7 ? this.setRandomMoney() : this.setRandomJackpot();
        }
    }

    /**
     * 设置RainbowPearl Jackpot符号中心信息
     * @param jackpotTypeParam Jackpot类型：0-乘数奖金 | 1-4-Jackpot等级 | 5-固定金额
     * @param prizeValue 奖金值（乘数/固定金额）
     */
    public setCenterInfoRainbowPearl(jackpotTypeParam: number, prizeValue: number = 0): void {
        this.hideAllContents();
        this.jackpotType = jackpotTypeParam;

        // 类型0：乘数奖金（基于每线投注额计算）
        if (jackpotTypeParam === 0) {
            if (!this.labelMoney || !this.labelMoneyHigh) return;

            const currentBetPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
            const calculatedMoney = currentBetPerLine * prizeValue;

            // 小额奖金显示常规标签，大额（≥250倍投注）显示高额标签
            const isHighMoney = calculatedMoney >= 250 * currentBetPerLine;
            this.labelMoney.node.active = !isHighMoney;
            this.labelMoneyHigh.node.active = isHighMoney;

            // 格式化并设置奖金文本
            const formattedMoney = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(calculatedMoney, 3);
            this.labelMoney.string = formattedMoney;
            this.labelMoneyHigh.string = formattedMoney;
            this.money = calculatedMoney;

            // 设置暗显标签文本（若存在）
            if (this.labelMoneyDimm) {
                this.labelMoneyDimm.string = formattedMoney;
            }
        }
        // 类型5：固定金额奖金
        else if (jackpotTypeParam === 5) {
            if (!this.labelMoney || !this.labelMoneyHigh) return;

            const calculatedMoney = prizeValue;
            // 固定金额仅显示常规标签
            this.labelMoney.node.active = true;
            this.labelMoneyHigh.node.active = false;

            // 格式化并设置奖金文本
            const formattedMoney = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(calculatedMoney, 3);
            this.labelMoney.string = formattedMoney;
            this.labelMoneyHigh.string = formattedMoney;
            this.money = calculatedMoney;

            // 设置暗显标签文本（若存在）
            if (this.labelMoneyDimm) {
                this.labelMoneyDimm.string = formattedMoney;
            }
        }
        // 类型1-4：Jackpot等级文本
        else if (this.jackpotTexts.length > 0) {
            // 隐藏所有Jackpot文本，显示对应等级的文本
            this.jackpotTexts.forEach(textNode => textNode.active = false);
            const textIndex = jackpotTypeParam - 1;
            if (textIndex >= 0 && textIndex < this.jackpotTexts.length) {
                this.jackpotTexts[textIndex].active = true;
            }
        }
    }

    /**
     * 随机设置乘数奖金（从multiplierList中随机选）
     */
    public setRandomMoney(): void {
        if (!this.labelMoney || !this.labelMoneyHigh) return;

        const randomIndex = Math.floor(Math.random() * this.multiplierList.length);
        const randomMultiplier = this.multiplierList[randomIndex];
        this.setCenterInfoRainbowPearl(0, randomMultiplier);
    }

    /**
     * 随机设置Jackpot等级（1-4级）
     */
    public setRandomJackpot(): void {
        const randomVal = Math.random();
        let jackpotLevel = 1;

        // 修复原代码Math.random()<6的逻辑错误（0-1区间）
        if (randomVal < 0.6) {
            jackpotLevel = 1; // 60%概率1级
        } else if (randomVal < 0.85) {
            jackpotLevel = 2; // 25%概率2级
        } else if (randomVal < 0.95) {
            jackpotLevel = 3; // 10%概率3级
        } else {
            jackpotLevel = 4; // 5%概率4级
        }

        this.setCenterInfoRainbowPearl(jackpotLevel);
    }

    /**
     * 隐藏所有内容节点（奖金标签/Jackpot文本）
     */
    public hideAllContents(): void {
        // 隐藏奖金标签
        if (this.labelMoney) this.labelMoney.node.active = false;
        if (this.labelMoneyHigh) this.labelMoneyHigh.node.active = false;
        if (this.labelMoneyDimm) this.labelMoneyDimm.node.active = false;

        // 隐藏Jackpot文本
        this.jackpotTexts.forEach(textNode => textNode.active = false);
    }

    /**
     * 设置内容的暗显/激活状态
     * @param isDimm 是否暗显
     */
    public setDimmContents(isDimm: boolean): void {
        if (!this.labelMoney || !this.labelMoneyHigh || !this.labelMoneyDimm) return;

        // Jackpot等级类型（1-4）：直接隐藏所有奖金标签
        if (this.jackpotType >= 1 && this.jackpotType <= 4) {
            this.labelMoney.node.active = false;
            this.labelMoneyHigh.node.active = false;
            this.labelMoneyDimm.node.active = false;
        }
        // 奖金类型（0/5）：切换明暗状态
        else {
            if (isDimm) {
                // 暗显：显示暗标签，隐藏普通标签
                this.labelMoney.node.active = false;
                this.labelMoneyHigh.node.active = false;
                this.labelMoneyDimm.node.active = true;
                this.labelMoneyDimm.node.opacity = 200;
            } else {
                // 激活：显示普通标签，隐藏暗标签
                const currentBetPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
                const isHighMoney = this.jackpotType === 0 && (this.money / currentBetPerLine) >= 250;
                
                this.labelMoney.node.active = !isHighMoney;
                this.labelMoneyHigh.node.active = isHighMoney;
                this.labelMoneyDimm.node.active = false;
            }
        }

        // 调整Jackpot文本的透明度
        this.jackpotTexts.forEach(textNode => {
            textNode.opacity = isDimm ? 150 : 255;
        });
    }
}