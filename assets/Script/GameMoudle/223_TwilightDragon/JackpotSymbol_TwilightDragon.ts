import ChangeNumberComponent from "../../Slot/ChangeNumberComponent";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";

const { ccclass, property } = cc._decorator;

// 定义接口：规范符号信息的结构（解决原始JS的隐式参数类型问题）
interface SymbolInfo {
    type: "jackpot" | string; // 类型：头奖或普通奖励
    subID?: number; // 头奖子ID（仅jackpot类型有效）
    prize?: number; // 普通奖励基础金额（仅非jackpot类型有效）
}

/**
 * 暮光龙插槽头奖符号组件
 */
@ccclass()
export default class JackpotSymbol_TwilightDragon extends cc.Component {
    // 对应原始JS中的属性，用@property标注供编辑器序列化
    @property(cc.Node)
    prizeRoot: cc.Node = null!; // 普通奖励根节点

    @property(cc.Node)
    jackpotRoot: cc.Node = null!; // 头奖根节点

    @property([cc.Label])
    prizeLabel: cc.Label[] = []; // 普通奖励文本标签数组

    @property([cc.Node])
    jackpotTitle: cc.Node[] = []; // 头奖标题节点数组

    @property([cc.Node])
    multiplierRoot: cc.Node[] = []; // 倍率根节点数组

    /**
     * 初始化组件状态（隐藏所有节点）
     */
    init(): void {
        this.prizeRoot.active = false;
        this.jackpotRoot.active = false;

        // 初始化倍率根节点及其子节点
        for (let e = 0; e < this.multiplierRoot.length; ++e) {
            this.multiplierRoot[e].active = false;
            for (let t = 0; t < this.multiplierRoot[e].children.length; ++t) {
                this.multiplierRoot[e].children[t].active = false;
            }
        }

        // 初始化奖励文本标签
        for (let e = 0; e < this.prizeLabel.length; ++e) {
            this.prizeLabel[e].node.active = false;
        }
    }

    /**
     * 设置符号显示信息
     * @param symbolInfo 符号信息（符合SymbolInfo接口规范）
     */
    setSymbolInfo(symbolInfo: SymbolInfo): void {
        this.init();

        if (symbolInfo.type === "jackpot") {
            // 显示头奖
            this.jackpotRoot.active = true;
            for (let t = 0; t < this.jackpotTitle.length; ++t) {
                this.jackpotTitle[t].active = symbolInfo.subID === t;
            }
        } else {
            // 显示普通奖励（计算实际金额并格式化）
            if (!symbolInfo.prize) return; // TS安全校验：避免prize未定义
            const actualPrize = symbolInfo.prize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
            this.prizeRoot.active = true;
            this.prizeLabel[0].node.active = true;
            this.prizeLabel[0].string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(actualPrize, 3);
        }
    }

    /**
     * 应用倍率计算
     * @param symbolInfo 符号信息
     * @param multiplier 倍率值
     * @param isPlayChangeAnim 是否播放数字变化动画
     */
    applyMultiplier(symbolInfo: SymbolInfo, multiplier: number, isPlayChangeAnim: boolean): void {
        if (multiplier <= 1) return; // 倍率≤1时无需处理

        this.init();

        if (symbolInfo.type === "jackpot") {
            // 头奖应用倍率
            this.jackpotRoot.active = true;
            for (let o = 0; o < this.jackpotTitle.length; ++o) {
                this.jackpotTitle[o].active = symbolInfo.subID === o;
            }

            const multiplierText = `${multiplier}X`;
            for (let o = 0; o < this.multiplierRoot.length; ++o) {
                this.multiplierRoot[o].active = o === symbolInfo.subID;
                const targetMultiplierNode = this.multiplierRoot[o].getChildByName(multiplierText);
                if (targetMultiplierNode) { // TS安全校验：避免节点不存在
                    targetMultiplierNode.active = true;
                }
            }
        } else {
            // 普通奖励应用倍率
            if (!symbolInfo.prize) return; // TS安全校验：避免prize未定义
            const betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
            const basePrize = symbolInfo.prize * betPerLine;
            const finalPrize = basePrize * multiplier;
            const prizeIndex = multiplier - 1;

            this.prizeRoot.active = true;
            for (let o = 0; o < this.prizeLabel.length; ++o) {
                if (o === prizeIndex) {
                    this.prizeLabel[o].node.active = true;
                    if (isPlayChangeAnim) {
                        // 播放数字变化动画
                        const changeNumberComp = this.prizeLabel[o].getComponent(ChangeNumberComponent);
                        if (changeNumberComp) { // TS安全校验：避免组件不存在
                            changeNumberComp.playChangeNumberFormatEllipsisNumberUsingDotMaxCount(
                                basePrize,
                                finalPrize,
                                3,
                                () => {},
                                0.5
                            );
                        }
                    } else {
                        // 直接显示最终金额
                        this.prizeLabel[o].string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(finalPrize, 3);
                    }
                }
            }
        }
    }

    /**
     * 设置虚拟符号（随机显示头奖或普通奖励）
     */
    setDummySymbol(): void {
        this.init();

        // 10%概率显示头奖
        if (Math.random() * 100 < 10) {
            this.jackpotRoot.active = true;
            const randomJackpotIndex = Math.floor(Math.random() * this.jackpotTitle.length);
            for (let t = 0; t < this.jackpotTitle.length; ++t) {
                this.jackpotTitle[t].active = t === randomJackpotIndex;
            }
        } else {
            // 90%概率显示普通奖励
            this.prizeRoot.active = true;
            if (this.prizeLabel.length <= 0) return; // TS安全校验：避免数组为空

            const prizeOptions = [15, 10, 5, 4, 3, 2, 1];
            const randomPrize = prizeOptions[Math.floor(Math.random() * prizeOptions.length)];
            const actualPrize = randomPrize * SlotGameRuleManager.Instance.getCurrentBetPerLine();

            this.prizeLabel[0].node.active = true;
            this.prizeLabel[0].string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(actualPrize, 3);
        }
    }

    /**
     * 设置入口符号
     * @param index 入口索引
     * @param type 入口类型（2为头奖类型，其他为普通奖励）
     */
    setEntranceSymbol(index: number, type: number): void {
        this.init();

        if (type === 2) {
            // 显示指定头奖
            this.jackpotRoot.active = true;
            const jackpotOrder = [0, 2, 1];
            const targetJackpotIndex = jackpotOrder[index];
            for (let o = 0; o < this.jackpotTitle.length; ++o) {
                this.jackpotTitle[o].active = o === targetJackpotIndex;
            }
        } else {
            // 显示普通奖励
            this.prizeRoot.active = true;
            if (this.prizeLabel.length <= 0) return; // TS安全校验：避免数组为空

            const prizeOptions = [15, 10, 5, 4, 3, 2, 1];
            const randomPrize = prizeOptions[Math.floor(Math.random() * prizeOptions.length)];
            const actualPrize = randomPrize * SlotGameRuleManager.Instance.getCurrentBetPerLine();

            this.prizeLabel[0].node.active = true;
            this.prizeLabel[0].string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(actualPrize, 3);
        }
    }
}