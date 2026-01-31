import TSUtility from "../../../../Script/global_utility/TSUtility";
import SlotGameResultManager from "../../../../Script/manager/SlotGameResultManager";
import SlotGameRuleManager from "../../../../Script/manager/SlotGameRuleManager";
import ZhuquefortuneManager from "./ZhuquefortuneManager";

const { ccclass, property } = cc._decorator;
/**
 * 朱雀运势Jackpot符号组件
 * 负责奖金金额计算、高低金额标签切换、金额格式化为易读形式
 */
@ccclass()
export default class JackpotSymbolComponent_Zhuquefortune extends cc.Component {
    // 普通金额标签（显示较低奖金）
    @property(cc.Label)
    public normal_Label: cc.Label | null = null;

    // 高额金额标签（显示较高奖金，与普通标签互斥）
    @property(cc.Label)
    public high_Label: cc.Label | null = null;

    // 符号类型（对应不同奖池档位，0-5分别对应不同奖金数组）
    @property
    public symbolType: number = 0;

    /**
     * 设置Jackpot基础信息，计算并显示对应奖金金额
     * @param jackpotData 奖金数据对象（包含prize、prizeUnit等属性）
     */
    public setInfo(jackpotData?: { prize: number; prizeUnit?: string }): void {
        // 先清空两个标签内容，确保初始状态干净
        this.clearLabelContent();

        let prize = 0;

        // 1. 优先从传入的奖金数据中获取金额
        if (TSUtility.isValid(jackpotData)) {
            prize = jackpotData.prize;
        } else {
            // 2. 无传入数据时，根据符号类型获取随机奖金数组并随机取值
            let prizeArray: number[] = [5, 15, 25, 35, 45]; // 默认数组（对应symbolType 0/1）

            switch (this.symbolType) {
                case 0:
                case 1:
                    prizeArray = [5, 15, 25, 35, 45];
                    break;
                case 2:
                    prizeArray = [10, 35, 60, 85, 110];
                    break;
                case 3:
                    prizeArray = [30, 70, 110, 150, 190];
                    break;
                case 4:
                    prizeArray = [60, 100, 140, 180, 220];
                    break;
                case 5:
                    prizeArray = [240, 280, 320, 360, 400];
                    break;
                default:
                    prizeArray = [5, 15, 25, 35, 45];
                    break;
            }

            // 从对应奖金数组中随机选取一个金额
            prize = prizeArray[Math.floor(Math.random() * prizeArray.length)];
        }

        // 3. 计算最终奖金（结合当前每线投注金额）
        let finalPrize = prize * SlotGameRuleManager.Instance.getCurrentBetPerLine();

        // 4. 若奖金单位为"FixedCoin"，直接使用原始奖金金额，不做倍率计算
        if (TSUtility.isValid(jackpotData) && jackpotData.prizeUnit === "FixedCoin") {
            finalPrize = jackpotData.prize;
        }

        // 5. 确定高额奖金判断阈值（根据符号类型获取对应倍率）
        let highPrizeMultiple = 2;
        switch (this.symbolType) {
            case 0:
            case 1:
                highPrizeMultiple = 2;
                break;
            case 2:
                highPrizeMultiple = 4;
                break;
            case 3:
                highPrizeMultiple = 6;
                break;
            case 4:
                highPrizeMultiple = 12;
                break;
            case 5:
                highPrizeMultiple = 14;
                break;
            default:
                highPrizeMultiple = 2;
                break;
        }

        // 6. 对比最终奖金与阈值，切换高低标签显示
        const totalBet = SlotGameRuleManager.Instance.getTotalBet();
        const highPrizeThreshold = totalBet * highPrizeMultiple;
        this.updateLabelDisplay(finalPrize, highPrizeThreshold);
    }

    /**
     * 追加奖金并更新显示
     * @param addedPrize 追加的奖金金额
     */
    public addPrize(addedPrize: number): void {
        // 先清空两个标签内容，确保初始状态干净
        this.clearLabelContent();

        // 1. 确定高额奖金判断阈值（根据当前子游戏类型获取对应倍率）
        let highPrizeMultiple = 2;
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();

        switch (currentSubGameKey) {
            case "base":
            case "lockNRoll_mini":
                highPrizeMultiple = 2;
                break;
            case "lockNRoll_minor":
                highPrizeMultiple = 4;
                break;
            case "lockNRoll_major":
                highPrizeMultiple = 6;
                break;
            case "lockNRoll_mega":
                highPrizeMultiple = 12;
                break;
            case "lockNRoll_grand":
                highPrizeMultiple = 14;
                break;
            default:
                highPrizeMultiple = 2;
                break;
        }

        // 2. 对比追加奖金与阈值，切换高低标签显示
        const totalBet = SlotGameRuleManager.Instance.getTotalBet();
        const highPrizeThreshold = totalBet * highPrizeMultiple;
        this.updateLabelDisplay(addedPrize, highPrizeThreshold);
    }

    /**
     * 设置入口信息（默认显示固定金额的奖金）
     */
    public setEnranceInfo(): void { // 保留原代码拼写（Enrance），避免影响业务调用
        // 先清空两个标签内容，确保初始状态干净
        this.clearLabelContent();

        // 1. 计算默认入口奖金金额
        const defaultPrize = 45 * SlotGameRuleManager.Instance.getCurrentBetPerLine();

        // 2. 对比默认奖金与阈值（2倍总投注），切换高低标签显示
        const totalBet = SlotGameRuleManager.Instance.getTotalBet();
        const highPrizeThreshold = totalBet * 2;
        this.updateLabelDisplay(defaultPrize, highPrizeThreshold);
    }

    /**
     * 清空两个金额标签的内容（辅助方法，避免重复代码）
     */
    private clearLabelContent(): void {
        if (this.normal_Label) {
            this.normal_Label.string = "";
        }
        if (this.high_Label) {
            this.high_Label.string = "";
        }
    }

    /**
     * 更新标签显示（根据奖金金额与阈值，切换高低标签并格式化金额）
     * @param prize 要显示的奖金金额
     * @param highThreshold 高额奖金的判断阈值
     */
    private updateLabelDisplay(prize: number, highThreshold: number): void {
        // 校验格式化工具是否有效，避免空指针异常
        const zhuquefortuneManager = ZhuquefortuneManager.getInstance();
        if (!zhuquefortuneManager || !zhuquefortuneManager.game_components) {
            console.warn("ZhuquefortuneManager 或 game_components 无效，无法格式化奖金金额");
            return;
        }

        const formattedPrize = zhuquefortuneManager.game_components.formatEllipsisNumber(prize);

        // 3. 奖金大于等于阈值显示高额标签，否则显示普通标签
        if (prize >= highThreshold) {
            if (this.high_Label) {
                this.high_Label.string = formattedPrize;
            }
            if (this.normal_Label) {
                this.normal_Label.string = "";
            }
        } else {
            if (this.normal_Label) {
                this.normal_Label.string = formattedPrize;
            }
            if (this.high_Label) {
                this.high_Label.string = "";
            }
        }
    }
}