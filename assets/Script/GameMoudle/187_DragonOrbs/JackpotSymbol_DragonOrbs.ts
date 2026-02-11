import ChangeNumberComponent from "../../Slot/ChangeNumberComponent";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";

const { ccclass, property } = cc._decorator;


/**
 * Jackpot奖金数据接口（匹配原JS中e参数的结构）
 */
interface PrizeData {
    prize: number;
    prizeUnit: string;
    multiplier?: number;
}

/**
 * 龙珠游戏Jackpot符号组件
 * 管理Jackpot符号的奖金显示、倍数应用、奖金累加、虚拟符号奖金随机生成等核心逻辑
 */
@ccclass()
export default class JackpotSymbol_DragonOrbs extends cc.Component {
    // ===================== 序列化属性（与原JS一致） =====================
    /** 奖金数值文本标签 */
    @property(cc.Label)
    public prizeLabel: cc.Label = null;

    /** 奖金显示根节点（控制显隐） */
    @property(cc.Node)
    public prizeRoot: cc.Node = null;

    // ===================== 私有状态（与原JS一致） =====================
    /** 当前奖金数值 */
    private _currentPrize: number = 0;

    // ===================== 核心业务方法（与原JS逻辑1:1） =====================
    /**
     * 初始化组件（隐藏奖金显示根节点）
     */
    public init(): void {
        this.prizeRoot!.active = false;
    }

    /**
     * 设置符号奖金（根据奖金单位计算实际奖金）
     * @param prizeData 奖金数据（包含prize/prizeUnit等）
     */
    public setSymbol(prizeData: PrizeData | null): void {
        // 先初始化（隐藏根节点）
        this.init();

        // 奖金数据有效 → 计算并显示奖金
        if (TSUtility.isValid(prizeData)) {
            this.prizeRoot!.active = true;
            
            // 获取每线投注额
            const betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
            // 根据奖金单位计算实际奖金
            const actualPrize = prizeData.prizeUnit === "BetPerLine" 
                ? prizeData.prize * betPerLine 
                : prizeData.prize;

            // 更新奖金标签（格式化为最多3位小数的省略数字）
            this.prizeLabel!.string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(actualPrize, 3);
            this._currentPrize = actualPrize;
        }
    }

    /**
     * 设置固定奖金金额
     * @param fixedMoney 固定奖金数值
     */
    public setFixedMoney(fixedMoney: number): void {
        this.prizeRoot!.active = true;
        // 格式化并更新奖金标签
        this.prizeLabel!.string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(fixedMoney, 3);
        this._currentPrize = fixedMoney;
    }

    /**
     * 应用倍数到奖金（支持数字变化动画）
     * @param prizeData 奖金数据（包含prize/prizeUnit/multiplier等）
     */
    public applyMultiplier(prizeData: PrizeData | null): void {
        const self = this;
        // 先初始化（隐藏根节点）
        this.init();

        // 奖金数据有效 → 计算倍数前后的奖金
        if (TSUtility.isValid(prizeData)) {
            this.prizeRoot!.active = true;
            
            const betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
            let originalPrize = 0; // 倍数前奖金
            let finalPrize = 0;    // 倍数后奖金

            // 根据奖金单位计算
            if (prizeData.prizeUnit === "BetPerLine") {
                originalPrize = prizeData.prize * betPerLine;
                finalPrize = originalPrize * (prizeData.multiplier || 1);
            } else {
                finalPrize = prizeData.prize;
                // 获取当前子游戏状态的倍数，反推原始奖金
                const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                const spinMultiplier = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey)?.gauges.spinMultiplier || 1;
                originalPrize = finalPrize / spinMultiplier;
            }

            // 获取数字变化组件 → 有则播放动画，无则直接更新
            const changeNumberComp = this.node.getComponent(ChangeNumberComponent);
            if (TSUtility.isValid(changeNumberComp)) {
                changeNumberComp.playChangeNumberFormatEllipsisNumberUsingDotMaxCount(
                    originalPrize,
                    finalPrize,
                    3,
                    () => {
                        self.prizeLabel!.string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(finalPrize, 3);
                        self._currentPrize = finalPrize;
                    },
                    0.3 // 动画时长0.3秒
                );
            } else {
                this.prizeLabel!.string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(finalPrize, 3);
                this._currentPrize = finalPrize;
            }
        }
    }

    /**
     * 累加奖金（支持数字变化动画）
     * @param from 起始奖金
     * @param to 目标奖金
     */
    public addPrize(from: number, to: number): void {
        const self = this;
        // 获取数字变化组件 → 有则播放动画，无则直接更新
        const changeNumberComp = this.node.getComponent(ChangeNumberComponent);
        if (TSUtility.isValid(changeNumberComp)) {
            changeNumberComp.playChangeNumberFormatEllipsisNumberUsingDotMaxCount(
                from,
                to,
                3,
                () => {
                    self.prizeLabel!.string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(to, 3);
                },
                0.3 // 动画时长0.3秒
            );
            this._currentPrize = to;
        } else {
            this.prizeLabel!.string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(to, 3);
            this._currentPrize = to;
        }
    }

    /**
     * 设置虚拟符号奖金（随机生成奖金数值）
     */
    public setDummySymbol(): void {
        this.init();

        // 随机奖金基数数组
        const prizeBaseArr = [15, 10, 7, 5, 3, 1];
        const randomVal = Math.random() * 10;
        let prizeBase = 0;

        // 根据随机值选择基数
        if (randomVal < 1) prizeBase = prizeBaseArr[0];
        else if (randomVal < 3) prizeBase = prizeBaseArr[1];
        else if (randomVal < 5) prizeBase = prizeBaseArr[2];
        else if (randomVal < 7) prizeBase = prizeBaseArr[3];
        else if (randomVal < 9) prizeBase = prizeBaseArr[4];
        else prizeBase = prizeBaseArr[5];

        // 显示奖金根节点
        this.prizeRoot!.active = true;
        
        // 计算最终奖金：基数 × 每线投注 × 当前子游戏倍数
        let finalPrize = prizeBase * SlotGameRuleManager.Instance.getCurrentBetPerLine();
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const spinMultiplier = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey)?.spinMultiplier || 1;
        finalPrize *= spinMultiplier;

        // 更新奖金标签（格式化为最多2位小数的省略数字）
        this.prizeLabel!.string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(finalPrize, 2);
    }
}