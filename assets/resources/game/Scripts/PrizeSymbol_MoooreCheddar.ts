import CurrencyFormatHelper from "../../../Script/global_utility/CurrencyFormatHelper";
import TSUtility from "../../../Script/global_utility/TSUtility";
import SlotGameRuleManager from "../../../Script/manager/SlotGameRuleManager";

const { ccclass, property } = cc._decorator;
/**
 * MoooreCheddar老虎机奖励符号组件
 * 负责控制奖励金额、倍数、Jackpot类型的显示逻辑
 */
@ccclass()
export default class PrizeSymbol_MoooreCheddar extends cc.Component {
    /** Jackpot类型节点列表（共4个，对应不同Jackpot等级） */
    @property({
        type: [cc.Node],
        displayName: 'Jackpot类型节点',
        tooltip: '索引0-3对应不同Jackpot类型的显示节点'
    })
    public jackpot_type: cc.Node[] = [];

    /** 倍数标签（显示Xn） */
    @property({
        type: cc.Label,
        displayName: '倍数标签',
        tooltip: '显示奖励倍数的Label组件'
    })
    public multiplier_label: cc.Label | null = null;

    /** 奖励金额标签 */
    @property({
        type: cc.Label,
        displayName: '奖励金额标签',
        tooltip: '显示奖励金额的Label组件'
    })
    public prize_label: cc.Label | null = null;

    // ===================== 静态常量/属性 =====================
    /** 预设奖励金额列表 */
    public static readonly PRIZE: number[] = [2, 5, 10, 25, 30, 50, 60, 75, 100, 125, 250];
    
    /** 固定Jackpot类型（-1表示随机） */
    public static FIX_JACKPOT: number = -1;

    /** 自由旋转Jackpot（仅setter，同步到FIX_JACKPOT） */
    public static set FREESPIN_JACKPOT(value: number) {
        PrizeSymbol_MoooreCheddar.FIX_JACKPOT = value;
    }

    // ===================== 核心方法 =====================
    /**
     * 设置符号基础信息
     * @param info 符号信息对象 { type: 'multiplier' | 'jackpot', prize?: number, subID?: number }
     */
    public SetSymbolInfo(info: { type: string; prize?: number; subID?: number }): void {
        this.initialize();

        if (TSUtility.isValid(info)) {
            if (info.type === 'multiplier' && info.prize !== undefined) {
                // 计算实际奖励（投注额 * 奖励值）
                const betRate = SlotGameRuleManager.Instance.getCurrentBetPerLineApplyFeatureTotalBetRate100();
                const actualPrize = info.prize * betRate;
                this.setPrizeLabel(actualPrize);
            } else {
                // 显示Jackpot类型
                if (this.jackpot_type.length > 0 && this.jackpot_type[0].parent) {
                    this.jackpot_type[0].parent.active = true;
                }
                // 激活对应subID的Jackpot节点
                for (let n = 0; n < 4; ++n) {
                    if (this.jackpot_type[n]) {
                        this.jackpot_type[n].active = n === info.subID;
                    }
                }
            }
        } else {
            // 信息无效时随机生成奖励值
            this.onRandomValue();
        }
    }

    /**
     * 通过高符号信息设置符号内容
     * @param highSymbolInfo [奖励金额, Jackpot子ID, 预留, 倍数]
     */
    public SetSymbolInfoByHighSymbol(highSymbolInfo: [number, number, any, number]): void {
        this.initialize();

        // 设置奖励金额
        this.setPrizeLabel(highSymbolInfo[0]);

        // 处理Jackpot类型
        if (highSymbolInfo[3] > 0) {
            if (this.jackpot_type.length > 0 && this.jackpot_type[0].parent) {
                this.jackpot_type[0].parent.active = true;
            }
            for (let t = 0; t < 4; ++t) {
                if (this.jackpot_type[t]) {
                    this.jackpot_type[t].active = t === highSymbolInfo[1];
                }
            }
        }

        // 处理倍数标签
        if (this.multiplier_label) {
            if (highSymbolInfo[3] < 2) {
                this.multiplier_label.string = '';
                this.multiplier_label.node.active = false;
            } else {
                this.multiplier_label.string = `X${highSymbolInfo[3].toString()}`;
                this.multiplier_label.node.active = true;
            }
        }
    }

    /**
     * 随机生成奖励值（80%概率普通奖励，20%概率Jackpot）
     */
    public onRandomValue(): void {
        const randomVal = 100 * Math.random();

        if (randomVal < 80) {
            // 80%概率：随机普通奖励
            const randomPrize = PrizeSymbol_MoooreCheddar.PRIZE[
                Math.floor(Math.random() * PrizeSymbol_MoooreCheddar.PRIZE.length)
            ];
            const betRate = SlotGameRuleManager.Instance.getCurrentBetPerLineApplyFeatureTotalBetRate100();
            this.setPrizeLabel(randomPrize * betRate);
        } else {
            // 20%概率：Jackpot（优先使用固定值，否则随机）
            const jackpotType = PrizeSymbol_MoooreCheddar.FIX_JACKPOT > -1 
                ? PrizeSymbol_MoooreCheddar.FIX_JACKPOT 
                : Math.floor(4 * Math.random());
            
            if (this.jackpot_type.length > 0 && this.jackpot_type[0].parent) {
                this.jackpot_type[0].parent.active = true;
            }
            for (let o = 0; o < 4; ++o) {
                if (this.jackpot_type[o]) {
                    this.jackpot_type[o].active = o === jackpotType;
                }
            }
        }
    }

    /**
     * 初始化所有标签和节点状态（重置为默认）
     */
    public initialize(): void {
        // 重置倍数标签
        if (this.multiplier_label) {
            this.multiplier_label.string = '';
            this.multiplier_label.node.active = false;
        }

        // 重置Jackpot类型节点
        this.jackpot_type.forEach(node => {
            if (node) node.active = false;
        });
        if (this.jackpot_type.length > 0 && this.jackpot_type[0].parent) {
            this.jackpot_type[0].parent.active = false;
        }

        // 重置奖励标签
        if (this.prize_label) {
            this.prize_label.string = '';
            this.prize_label.node.active = false;
        }
    }

    /**
     * 设置奖励金额标签（格式化显示）
     * @param prize 奖励金额
     */
    public setPrizeLabel(prize: number): void {
        if (this.prize_label) {
            // 格式化数字（最多3位小数，带省略号）
            this.prize_label.string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(prize, 3);
            this.prize_label.node.active = true;
        }
    }
}