import SlotSoundController from "../../../Script/Slot/SlotSoundController";
import AsyncHelper from "../../../Script/global_utility/AsyncHelper";
import CurrencyFormatHelper from "../../../Script/global_utility/CurrencyFormatHelper";
import TSUtility from "../../../Script/global_utility/TSUtility";
import { Utility } from "../../../Script/global_utility/Utility";
import SlotGameRuleManager from "../../../Script/manager/SlotGameRuleManager";
import SlotManager from "../../../Script/manager/SlotManager";

// 严格遵循指定的装饰器导出方式
const { ccclass, property } = cc._decorator;


/**
 * Jackpot 金额显示组件（MoooreCheddar Slots 专用）
 */
@ccclass()
export default class JackpotDisplay_MoooreCheddar extends cc.Component {
    // ================= 可序列化属性（对应编辑器面板配置） =================
    @property
    public biggestLength: number = 9;          // 最大显示长度（用于数字省略）
    @property
    public is_biggset: boolean = false;        // 是否启用最大长度限制
    @property([cc.Label])
    public grandLabel: cc.Label[] = [];           // 大奖金额标签（多个）
    @property([cc.Label])
    public megaLabel: cc.Label[] = [];            // 超级大奖金额标签（多个）
    @property([cc.Label])
    public majorLabel: cc.Label[] = [];           // 主要奖金额标签（多个）
    @property([cc.Label])
    public minorLabel: cc.Label[] = [];           // 次要奖金额标签（多个）
    @property([cc.Label])
    public miniLabel: cc.Label[] = [];            // 迷你奖金额标签（多个）
    @property
    public interval: number = 0.00145;         // 金额更新调度间隔（秒）
    @property([cc.Animation])
    public jackpot_hit: cc.Animation[] = [];      // Jackpot 命中动画组件

    // ================= 私有属性 =================
    private _jackpot_keys: string[] = ["mini", "minor", "major", "grand"]; // Jackpot 类型键
    private _prev_jackpot_money: number[] = [0, 0, 0, 0];                  // 上一次的 Jackpot 金额
    private _is_play_jackpot: boolean[] = [true, true, true, true];        // 是否播放对应 Jackpot 金额动画
    private _multiplier_jackpot: number[] = [1, 1, 1, 1];                 // Jackpot 倍率
    private prize: number[] = [0, 0, 0, 0];                               // 奖金池金额
    private pivot_multiplier: number[] = [125, 250, 1250, 25000];         // 基准倍率
    private _jackpotInfo: any = null;                                     // Jackpot 信息对象（来自 SlotManager）
    private _customBetPerLine: number = -1;                                // 自定义每线投注额（-1 表示使用默认值）
    private _total_labels: cc.Label[][] = [];                                // 所有金额标签的二维数组

    // ================= 生命周期函数 =================
    onLoad() {
        // 初始化所有金额标签的二维数组（按 mini -> minor -> major -> grand 顺序）
        this._total_labels = [this.miniLabel, this.minorLabel, this.majorLabel, this.grandLabel];
    }

    start() {
        this.initJackpot();
    }

    onDestroy() {
        // 销毁时取消所有调度器，避免内存泄漏
        this.unscheduleAllCallbacks();
    }

    // ================= 核心初始化方法 =================
    private async initJackpot() {
        // 等待 SlotInterface 初始化完成
        await AsyncHelper.asyncWaitEndCondition(() => {
            return SlotManager.Instance.slotInterface !== null;
        }, this);

        // 获取 Jackpot 信息并启动金额更新调度
        this._jackpotInfo = SlotManager.Instance.getSlotJackpotInfo();
        this.updateJackpotMoneyScedule();
        this.schedule(this.updateJackpotMoneyScedule, this.interval);
    }

    // ================= Jackpot 金额更新逻辑 =================
    /**
     * 调度更新所有 Jackpot 金额显示
     */
    private updateJackpotMoneyScedule() {
        const betPerLine = this.getBetPerLine();
        const maxBetPerLine = SlotGameRuleManager.Instance._maxBetPerLine;
        const biggestLength = this.getBiggstLength(betPerLine, maxBetPerLine);

        // 遍历所有 Jackpot 类型，更新金额显示
        for (let i = 0; i < this._jackpot_keys.length; ++i) {
            if (this._is_play_jackpot[i]) {
                this.updateMoneyText(i, this._total_labels[i], betPerLine, maxBetPerLine, biggestLength);
            }
        }
    }

    /**
     * 更新单个 Jackpot 类型的金额文本
     * @param index Jackpot 类型索引（对应 _jackpot_keys）
     * @param labels 金额标签数组
     * @param betPerLine 当前每线投注额
     * @param maxBetPerLine 最大每线投注额
     * @param biggestLength 最大显示长度
     */
    private updateMoneyText(
        index: number,
        labels: cc.Label[],
        betPerLine: number,
        maxBetPerLine: number,
        biggestLength: number = -1
    ) {
        // 校验标签数组有效性
        if (!TSUtility.isValid(labels) || labels.length === 0) return;

        // 获取当前 Jackpot 金额（经过显示格式化）
        const currentMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
            this._jackpot_keys[index],
            betPerLine,
            maxBetPerLine
        );
        const displayMoney = Utility.getDisplayJackpotMoney(this._prev_jackpot_money[index], currentMoney);

        // 更新所有对应标签的文本
        for (const label of labels) {
            label.string = CurrencyFormatHelper.formatEllipsisNumber(displayMoney, biggestLength);
        }

        // 记录本次金额，用于下次差值计算
        this._prev_jackpot_money[index] = displayMoney;
    }

    // ================= 状态控制方法 =================
    /**
     * 设置指定 Jackpot 类型的播放状态
     * @param jackpotKey Jackpot 类型键（mini/minor/major/grand）
     * @param isPlay 是否播放金额动画
     */
    public setPlayingState(jackpotKey: string, isPlay: boolean) {
        const index = this._jackpot_keys.indexOf(jackpotKey);
        if (index !== -1) {
            this._is_play_jackpot[index] = isPlay;
        }
    }

    /**
     * 强制设置指定 Jackpot 类型的显示金额
     * @param jackpotKey Jackpot 类型键
     * @param money 要显示的金额
     */
    public setShowingMoney(jackpotKey: string, money: number) {
        const betPerLine = this.getBetPerLine();
        const maxBetPerLine = SlotGameRuleManager.Instance._maxBetPerLine;
        const biggestLength = this.getBiggstLength(betPerLine, maxBetPerLine);

        // 格式化金额并更新标签
        const formattedMoney = CurrencyFormatHelper.formatEllipsisNumber(money, biggestLength);
        const index = this._jackpot_keys.indexOf(jackpotKey);
        
        if (index !== -1 && this._total_labels[index]) {
            for (const label of this._total_labels[index]) {
                label.string = formattedMoney;
            }
            this._prev_jackpot_money[index] = money;
        }
    }

    /**
     * 设置自定义每线投注额（用于特殊场景）
     * @param bet 自定义投注额
     */
    public setCustomBetPerLine(bet: number) {
        this._customBetPerLine = bet;
    }

    /**
     * 清空自定义每线投注额（恢复使用默认值）
     */
    public clearCustomBetPerLine() {
        this._customBetPerLine = -1;
    }

    /**
     * 获取当前每线投注额（优先使用自定义值）
     * @returns 每线投注额
     */
    public getBetPerLine(): number {
        return this._customBetPerLine !== -1 
            ? this._customBetPerLine 
            : SlotGameRuleManager.Instance.getCurrentBetPerLine();
    }

    /**
     * 设置指定 Jackpot 类型的倍率
     * @param jackpotKey Jackpot 类型键
     * @param multiplier 倍率值
     */
    public setMultiplierJackpot(jackpotKey: string, multiplier: number) {
        const index = this._jackpot_keys.indexOf(jackpotKey);
        if (index !== -1) {
            this._multiplier_jackpot[index] = multiplier;
        }
    }

    // ================= 辅助计算方法 =================
    /**
     * 计算 Jackpot 金额的最大显示长度（用于数字省略）
     * @param betPerLine 当前每线投注额
     * @param maxBetPerLine 最大每线投注额
     * @returns 最大显示长度
     */
    public getBiggstLength(betPerLine: number, maxBetPerLine: number): number {
        let offset = 0;
        if (this.is_biggset) {
            const grandKey = this._jackpot_keys[this._jackpot_keys.length - 1];
            let grandMoney = 0;

            // 获取大奖金额并计算显示长度偏移
            if (this._jackpotInfo.isExistJackpotKey(grandKey)) {
                grandMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                    grandKey,
                    betPerLine,
                    maxBetPerLine
                );
            }
            grandMoney = Utility.getDisplayJackpotMoney(0, grandMoney);

            // 超过最大长度时，每3位增加偏移（用于省略显示）
            while (Math.floor(grandMoney).toString().length - offset > this.biggestLength) {
                offset += 3;
            }
        }
        return offset;
    }

    /**
     * 设置指定 Jackpot 类型的基准倍率金额
     * @param index Jackpot 类型索引
     */
    public setBasicMultiplierMoney(index: number = 0) {
        const betPerLine = this.getBetPerLine();
        const maxBetPerLine = SlotGameRuleManager.Instance._maxBetPerLine;
        const basePrize = this._jackpotInfo.getJackpotMoneyInfo(index).basePrize * betPerLine;
        const biggestLength = this.getBiggstLength(betPerLine, maxBetPerLine);

        // 更新对应标签的基准金额
        if (this._total_labels[index]) {
            for (const label of this._total_labels[index]) {
                label.string = CurrencyFormatHelper.formatEllipsisNumber(basePrize, biggestLength);
            }
        }
    }

    // ================= 事件响应方法 =================
    /**
     * Jackpot 命中 UI 回调
     * @param params 命中参数 {flag: boolean, jackpot_subid: number, jackpot_key: string, reward: number}
     */
    public onJackpotUI(params: {
        flag: boolean;
        jackpot_subid: number;
        jackpot_key: string;
        reward: number;
    }) {
        if (params.flag) {
            // 命中时：停止金额动画、显示命中金额、播放命中动画
            for (let i = 0; i < this.jackpot_hit.length; ++i) {
                if (i === params.jackpot_subid) {
                    this.setPlayingState(params.jackpot_key, false);
                    this.setShowingMoney(params.jackpot_key, params.reward);
                    this.jackpot_hit[i].node.active = true;
                }
            }
            // 播放命中音效
            SlotSoundController.Instance().playAudio("J_UI_HIT", "FX");
        } else {
            // 未命中时：恢复金额动画、隐藏所有命中动画
            this.setPlayingState(params.jackpot_key, true);
            for (const anim of this.jackpot_hit) {
                anim.node.active = false;
            }
        }
    }

    /**
     * 重置 Jackpot 累进金额显示
     */
    public onResetJackpotProgressive() {
        const jackpotTypes = ["mini", "minor", "major", "mega", "grand"];
        for (const type of jackpotTypes) {
            this.setPlayingState(type, true);
        }
    }
}