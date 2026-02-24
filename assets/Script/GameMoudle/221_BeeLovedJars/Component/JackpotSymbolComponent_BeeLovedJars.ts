import TSUtility from '../../../global_utility/TSUtility';
import SlotGameRuleManager from '../../../manager/SlotGameRuleManager';
import { SymbolInfo } from '../../../manager/SymbolPoolManager';
import BeeLovedJarsManager from '../BeeLovedJarsManager';

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏 Jackpot 符号标签组件
 * 负责Jackpot符号的奖励金额显示、高低金额标签切换、金额格式化等逻辑
 */
@ccclass('JackpotSymbolComponent_BeeLovedJars')
export default class JackpotSymbolComponent_BeeLovedJars extends cc.Component {
    // 普通金额标签（低于3倍总投注）
    @property({
        type: cc.Label,
        displayName: "普通金额标签",
        tooltip: "显示低于3倍总投注的Jackpot奖励金额标签"
    })
    normal_Label: cc.Label | null = null;

    // 高额金额标签（高于/等于3倍总投注）
    @property({
        type: cc.Label,
        displayName: "高额金额标签",
        tooltip: "显示高于/等于3倍总投注的Jackpot奖励金额标签"
    })
    high_Label: cc.Label | null = null;

    /**
     * 隐藏所有金额标签并清空内容
     * 重置标签状态，避免残留金额显示
     */
    hideInfo(): void {
        // 空值安全检查：标签不存在时直接返回
        if (!this.normal_Label || !this.high_Label) return;

        // 隐藏标签节点
        this.normal_Label.node.active = false;
        this.high_Label.node.active = false;

        // 清空标签内容
        this.normal_Label.string = "";
        this.high_Label.string = "";
    }

    /**
     * 设置Jackpot符号的奖励金额信息
     * @param symbolInfo 符号奖励信息（包含prize/prizeUnit等字段）
     */
    setInfo(symbolInfo: SymbolInfo | any): void {
        // 初始化：先隐藏并清空所有标签
        this.hideInfo();
        if (!this.normal_Label || !this.high_Label) return;

        let prize = 0;
        // 1. 有效符号信息：使用配置的奖励值
        if (TSUtility.isValid(symbolInfo)) {
            prize = symbolInfo.prize;
        } 
        // 2. 无效符号信息：随机生成奖励值 [6,16,30,45,60]
        else {
            const randomPrizeList = [6, 16, 30, 45, 60];
            prize = randomPrizeList[Math.floor(Math.random() * randomPrizeList.length)];
        }

        // 3. 计算最终奖励金额（支持固定金币/FixedCoin）
        let finalPrize = prize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
        if (TSUtility.isValid(symbolInfo) && symbolInfo!.prizeUnit === "FixedCoin") {
            finalPrize = symbolInfo!.prize;
        }

        // 4. 判断金额等级，切换显示对应标签（≥3倍总投注显示高额标签）
        const totalBet = SlotGameRuleManager.Instance.getTotalBet();
        const formattedPrize = BeeLovedJarsManager.getInstance().game_components.formatEllipsisNumber(finalPrize);
        
        if (finalPrize >= 3 * totalBet) {
            this.high_Label.node.active = true;
            this.high_Label.string = formattedPrize;
        } else {
            this.normal_Label.node.active = true;
            this.normal_Label.string = formattedPrize;
        }
    }

    /**
     * 累加奖励金额并更新显示
     * @param addPrize 累加后的总奖励金额
     */
    addPrize(addPrize: number): void {
        // 空值安全检查：标签不存在时直接返回
        if (!this.normal_Label || !this.high_Label) return;

        // 清空原有内容
        this.normal_Label.string = "";
        this.high_Label.string = "";

        // 判断金额等级，更新对应标签
        const totalBet = SlotGameRuleManager.Instance.getTotalBet();
        const formattedPrize = BeeLovedJarsManager.getInstance().game_components.formatEllipsisNumber(addPrize);
        
        if (addPrize >= 3 * totalBet) {
            this.high_Label.string = formattedPrize;
        } else {
            this.normal_Label.string = formattedPrize;
        }
    }

    /**
     * 设置入场时的默认奖励金额信息
     * 固定使用60倍单线路投注计算默认金额
     */
    setEnranceInfo(): void {
        // 空值安全检查：标签不存在时直接返回
        if (!this.normal_Label || !this.high_Label) return;

        // 清空原有内容
        this.normal_Label.string = "";
        this.high_Label.string = "";

        // 计算默认金额：60倍单线路投注
        const defaultPrize = 60 * SlotGameRuleManager.Instance.getCurrentBetPerLine();
        const totalBet = SlotGameRuleManager.Instance.getTotalBet();
        const formattedPrize = BeeLovedJarsManager.getInstance().game_components.formatEllipsisNumber(defaultPrize);
        
        // 判断金额等级，切换显示对应标签
        if (defaultPrize >= 3 * totalBet) {
            this.high_Label.string = formattedPrize;
        } else {
            this.normal_Label.string = formattedPrize;
        }
    }
}