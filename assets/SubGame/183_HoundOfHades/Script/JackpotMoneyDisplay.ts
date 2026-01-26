import AsyncHelper from "../../../Script/global_utility/AsyncHelper";
import CurrencyFormatHelper from "../../../Script/global_utility/CurrencyFormatHelper";
import SDefine from "../../../Script/global_utility/SDefine";
import SlotGameRuleManager from "../../../Script/manager/SlotGameRuleManager";
import SlotManager from "../../../Script/manager/SlotManager";
import { SlotJackpotInfo } from "../../../Script/slot_common/SlotDataDefine";

const { ccclass, property } = cc._decorator;

/**
 * Jackpot类型Key枚举（映射SDefine中的常量，提升代码可读性）
 */
export class JackpotKey {
    static GRAND = SDefine.SLOT_JACKPOT_KEY_GRAND
    static MEGA = SDefine.SLOT_JACKPOT_KEY_MEGA
    static MAJOR = SDefine.SLOT_JACKPOT_KEY_MAJOR
    static MINOR = SDefine.SLOT_JACKPOT_KEY_MINOR
    static MINI = SDefine.SLOT_JACKPOT_KEY_MINI
    static MINISMALL = SDefine.SLOT_JACKPOT_KEY_MINISMALL
}

/**
 * 工具类补充（原代码中未定义的Utility，补充核心方法类型）
 */
declare class Utility {
    /**
     * 获取用于显示的Jackpot金额（平滑过渡）
     * @param prevMoney 上一次显示的金额
     * @param targetMoney 目标金额
     * @returns 最终显示金额
     */
    static getDisplayJackpotMoney(prevMoney: number, targetMoney: number): number;
}

/**
 * 哈迪斯之犬 - Jackpot奖金显示组件
 * 核心职责：
 * 1. 异步初始化，等待Slot接口就绪后启动定时更新
 * 2. 定时计算并更新各等级Jackpot奖金显示（支持普通/省略格式）
 * 3. 控制各Jackpot的显示状态、倍数、自定义投注额
 * 4. 提供Jackpot金额的获取/设置方法
 */
@ccclass('JackpotMoneyDisplay')
export default class JackpotMoneyDisplay extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** Grand级Jackpot显示标签 */
    @property(cc.Label)
    public grandLabel: cc.Label = null;

    /** Mega级Jackpot显示标签 */
    @property(cc.Label)
    public megaLabel: cc.Label = null;

    /** Major级Jackpot显示标签 */
    @property(cc.Label)
    public majorLabel: cc.Label = null;

    /** Minor级Jackpot显示标签 */
    @property(cc.Label)
    public minorLabel: cc.Label = null;

    /** Mini级Jackpot显示标签 */
    @property(cc.Label)
    public miniLabel: cc.Label = null;

    /** MiniSmall级Jackpot显示标签 */
    @property(cc.Label)
    public minismallLabel: cc.Label = null;

    /** 最大Jackpot金额显示标签 */
    @property(cc.Label)
    public biggestJackpotLabel: cc.Label = null;

    /** 是否使用省略位数格式化 */
    @property
    public useEllipsisCount: boolean = false;

    /** 额外添加的省略位数 */
    @property
    public addEllipsisCnt: number = 0;

    /** 是否降低一级省略位数（n>3时用n-3，否则用普通格式） */
    @property
    public isOneStepLowEllipsisCnt: boolean = false;

    /** 定时更新间隔（秒） */
    @property
    public interval: number = 0.2;

    // ====== 私有配置属性 ======
    /** 自定义单行列投注额（0表示使用默认值） */
    private customBetPerLine: number = 0;

    // ====== 私有状态属性（上一次显示的金额） ======
    private _prevGrandJackpotMoney: number = 0;
    private _prevMegaJackpotMoney: number = 0;
    private _prevMajorJackpotMoney: number = 0;
    private _prevMinorJackpotMoney: number = 0;
    private _prevMiniJackpotMoney: number = 0;
    private _prevMiniSmallJackpotMoney: number = 0;
    private _prevBiggestJackpotMoney: number = 0;

    // ====== 私有状态属性（播放状态） ======
    private _isPlayingGrand: boolean = true;
    private _isPlayingMega: boolean = true;
    private _isPlayingMajor: boolean = true;
    private _isPlayingMinor: boolean = true;
    private _isPlayingMini: boolean = true;
    private _isPlayingMiniSmall: boolean = true;

    // ====== 私有状态属性（倍数） ======
    private _multiplierGrand: number = 1;
    private _multiplierMega: number = 1;
    private _multiplierMajor: number = 1;
    private _multiplierMinor: number = 1;
    private _multiplierMini: number = 1;
    private _multiplierMiniSmall: number = 1;

    // ====== 私有状态属性（Jackpot信息） ======
    private _jackpotInfo: SlotJackpotInfo | null = null;

    // ====== 生命周期方法 ======
    /**
     * 组件启动（异步初始化）
     */
    async start(): Promise<void> {
        // 等待SlotInterface就绪
        await AsyncHelper.asyncWaitEndCondition(() => {
            return SlotManager.Instance?.slotInterface != null;
        }, this);

        // 获取Jackpot信息并启动定时更新
        this._jackpotInfo = SlotManager.Instance.getSlotJackpotInfo();
        this.updateJackpotMoneyScedule();
        this.schedule(this.updateJackpotMoneyScedule, this.interval);
    }

    /**
     * 组件销毁（取消所有定时回调）
     */
    onDestroy(): void {
        this.unscheduleAllCallbacks();
    }

    // ====== 核心方法 ======
    /**
     * 定时更新Jackpot金额显示（核心逻辑）
     */
    updateJackpotMoneyScedule(): void {
        // 安全校验：JackpotInfo为空时返回
        if (!this._jackpotInfo) {
            console.warn("JackpotMoneyDisplay: _jackpotInfo未初始化！");
            return;
        }

        // 1. 获取基础投注参数
        let currentBetPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
        const maxBetPerLine = SlotGameRuleManager.Instance._maxBetPerLine;
        let ellipsisCount = SlotGameRuleManager.Instance.getCurrentBetEllipsisCount();

        // 2. 处理省略位数（基础值 + 额外值，最小为0）
        ellipsisCount = Math.max(0, ellipsisCount + this.addEllipsisCnt);

        // 3. 处理自定义投注额
        if (this.customBetPerLine !== 0) {
            currentBetPerLine = this.customBetPerLine;
            // 计算自定义投注额对应的省略位数
            const totalBet = (currentBetPerLine + currentBetPerLine * SlotGameRuleManager.Instance._featureTotalBetRate100 / 100) 
                              * SlotGameRuleManager.Instance._maxBetLine;
            ellipsisCount = Math.max(0, CurrencyFormatHelper.getEllipsisCount(totalBet) + this.addEllipsisCnt);
        }

        // 4. 最大投注额有效时才更新显示
        if (maxBetPerLine !== 0) {
            // 4.1 更新最大Jackpot金额显示
            this.updateBiggestJackpotLabel(currentBetPerLine, maxBetPerLine);

            // 4.2 更新各等级Jackpot金额显示
            this.updateSingleJackpotLabel(JackpotKey.GRAND, currentBetPerLine, maxBetPerLine, ellipsisCount);
            this.updateSingleJackpotLabel(JackpotKey.MEGA, currentBetPerLine, maxBetPerLine, ellipsisCount);
            this.updateSingleJackpotLabel(JackpotKey.MAJOR, currentBetPerLine, maxBetPerLine, ellipsisCount);
            this.updateSingleJackpotLabel(JackpotKey.MINOR, currentBetPerLine, maxBetPerLine, ellipsisCount);
            this.updateSingleJackpotLabel(JackpotKey.MINI, currentBetPerLine, maxBetPerLine, ellipsisCount);
            this.updateSingleJackpotLabel(JackpotKey.MINISMALL, currentBetPerLine, maxBetPerLine, ellipsisCount);
        }
    }

    /**
     * 设置指定Jackpot的播放状态（是否显示更新）
     * @param jackpotKey Jackpot类型Key
     * @param isPlaying 是否播放/更新
     */
    setPlayingState(jackpotKey: string, isPlaying: boolean): void {
        switch (jackpotKey) {
            case JackpotKey.GRAND:
                this._isPlayingGrand = isPlaying;
                break;
            case JackpotKey.MEGA:
                this._isPlayingMega = isPlaying;
                break;
            case JackpotKey.MAJOR:
                this._isPlayingMajor = isPlaying;
                break;
            case JackpotKey.MINOR:
                this._isPlayingMinor = isPlaying;
                break;
            case JackpotKey.MINI:
                this._isPlayingMini = isPlaying;
                break;
            case JackpotKey.MINISMALL:
                this._isPlayingMiniSmall = isPlaying;
                break;
            default:
                console.warn(`JackpotMoneyDisplay: 未知的JackpotKey ${jackpotKey}`);
        }
    }

    /**
     * 手动设置指定Jackpot的显示金额
     * @param jackpotKey Jackpot类型Key
     * @param money 要显示的金额
     */
    setShowingMoney(jackpotKey: string, money: number): void {
        // 安全校验：金额非数字时返回
        if (typeof money !== 'number' || isNaN(money)) {
            console.warn(`JackpotMoneyDisplay: 金额${money}不是有效数字！`);
            return;
        }

        // 获取省略位数
        let ellipsisCount = SlotGameRuleManager.Instance.getCurrentBetEllipsisCount();
        ellipsisCount = Math.max(0, ellipsisCount + this.addEllipsisCnt);

        // 格式化金额
        const formattedMoney = this.formatJackpotMoney(money, ellipsisCount);

        // 更新标签和历史值
        switch (jackpotKey) {
            case JackpotKey.GRAND:
                this.grandLabel && (this.grandLabel.string = formattedMoney);
                this._prevGrandJackpotMoney = money;
                break;
            case JackpotKey.MEGA:
                this.megaLabel && (this.megaLabel.string = formattedMoney);
                this._prevMegaJackpotMoney = money;
                break;
            case JackpotKey.MAJOR:
                this.majorLabel && (this.majorLabel.string = formattedMoney);
                this._prevMajorJackpotMoney = money;
                break;
            case JackpotKey.MINOR:
                this.minorLabel && (this.minorLabel.string = formattedMoney);
                this._prevMinorJackpotMoney = money;
                break;
            case JackpotKey.MINI:
                this.miniLabel && (this.miniLabel.string = formattedMoney);
                this._prevMiniJackpotMoney = money;
                break;
            case JackpotKey.MINISMALL:
                this.minismallLabel && (this.minismallLabel.string = formattedMoney);
                this._prevMiniSmallJackpotMoney = money;
                break;
            default:
                console.warn(`JackpotMoneyDisplay: 未知的JackpotKey ${jackpotKey}`);
        }
    }

    /**
     * 获取指定Jackpot的当前显示金额
     * @param jackpotKey Jackpot类型Key
     * @returns 当前显示的金额
     */
    getCurrentJackpotMoney(jackpotKey: string): number {
        // 安全校验：JackpotInfo为空时返回0
        if (!this._jackpotInfo) {
            console.warn("JackpotMoneyDisplay: _jackpotInfo未初始化！");
            return 0;
        }

        const currentBetPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
        const maxBetPerLine = SlotGameRuleManager.Instance._maxBetPerLine;

        switch (jackpotKey) {
            case JackpotKey.GRAND: {
                const money = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(JackpotKey.GRAND, currentBetPerLine, maxBetPerLine);
                return Utility.getDisplayJackpotMoney(this._prevGrandJackpotMoney, money);
            }
            case JackpotKey.MEGA: {
                const money = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(JackpotKey.MEGA, currentBetPerLine, maxBetPerLine);
                return Utility.getDisplayJackpotMoney(this._prevMegaJackpotMoney, money);
            }
            case JackpotKey.MAJOR: {
                const money = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(JackpotKey.MAJOR, currentBetPerLine, maxBetPerLine);
                return Utility.getDisplayJackpotMoney(this._prevMajorJackpotMoney, money);
            }
            case JackpotKey.MINOR: {
                const money = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(JackpotKey.MINOR, currentBetPerLine, maxBetPerLine);
                return Utility.getDisplayJackpotMoney(this._prevMinorJackpotMoney, money);
            }
            case JackpotKey.MINI: {
                const money = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(JackpotKey.MINI, currentBetPerLine, maxBetPerLine);
                return Utility.getDisplayJackpotMoney(this._prevMiniJackpotMoney, money);
            }
            case JackpotKey.MINISMALL: {
                const money = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(JackpotKey.MINISMALL, currentBetPerLine, maxBetPerLine);
                return Utility.getDisplayJackpotMoney(this._prevMiniSmallJackpotMoney, money);
            }
            default:
                console.warn(`JackpotMoneyDisplay: 未知的JackpotKey ${jackpotKey}`);
                return 0;
        }
    }

    /**
     * 获取指定Jackpot的上一级JackpotKey
     * @param jackpotKey 当前JackpotKey
     * @returns 上一级JackpotKey（无则返回空字符串）
     */
    getBeforeJackpotKey(jackpotKey: string): string {
        switch (jackpotKey) {
            case JackpotKey.GRAND:
                return JackpotKey.MEGA;
            case JackpotKey.MEGA:
                return JackpotKey.MAJOR;
            case JackpotKey.MAJOR:
                return JackpotKey.MINOR;
            case JackpotKey.MINOR:
                return JackpotKey.MINI;
            case JackpotKey.MINI:
                return JackpotKey.MINISMALL;
            default:
                return "";
        }
    }

    /**
     * 设置自定义单行列投注额
     * @param betPerLine 自定义投注额
     */
    setCustomBetPerLine(betPerLine: number): void {
        this.customBetPerLine = betPerLine;
    }

    /**
     * 重置自定义单行列投注额（恢复默认值）
     */
    resetCustomBetPerLine(): void {
        this.customBetPerLine = 0;
    }

    // ====== 倍数设置方法 ======
    setMultiplierGrand(multiplier: number): void {
        this._multiplierGrand = multiplier;
    }

    setMultiplierMega(multiplier: number): void {
        this._multiplierMega = multiplier;
    }

    setMultiplierMajor(multiplier: number): void {
        this._multiplierMajor = multiplier;
    }

    setMultiplierMinor(multiplier: number): void {
        this._multiplierMinor = multiplier;
    }

    setMultiplierMini(multiplier: number): void {
        this._multiplierMini = multiplier;
    }

    setMultiplierMiniSmall(multiplier: number): void {
        this._multiplierMiniSmall = multiplier;
    }

    // ====== 私有辅助方法 ======
    /**
     * 更新最大Jackpot金额标签
     * @param currentBetPerLine 当前单行列投注额
     * @param maxBetPerLine 最大单行列投注额
     */
    private updateBiggestJackpotLabel(currentBetPerLine: number, maxBetPerLine: number): void {
        if (!this.biggestJackpotLabel || !this._jackpotInfo) return;

        let maxMoney = 0;
        // 遍历所有Jackpot类型，找到最大金额
        [JackpotKey.MINISMALL, JackpotKey.MINI, JackpotKey.MINOR, JackpotKey.MAJOR, JackpotKey.MEGA, JackpotKey.GRAND].forEach(key => {
            if (this._jackpotInfo.isExistJackpotKey(key)) {
                const money = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(key, currentBetPerLine, maxBetPerLine);
                maxMoney = Math.max(maxMoney, money);
            }
        });

        // 平滑过渡金额并格式化显示
        maxMoney = Utility.getDisplayJackpotMoney(this._prevBiggestJackpotMoney, maxMoney);
        this.biggestJackpotLabel.string = CurrencyFormatHelper.formatNumber(maxMoney);
        this._prevBiggestJackpotMoney = maxMoney;
    }

    /**
     * 更新单个Jackpot标签的显示
     * @param jackpotKey Jackpot类型Key
     * @param currentBetPerLine 当前单行列投注额
     * @param maxBetPerLine 最大单行列投注额
     * @param ellipsisCount 省略位数
     */
    private updateSingleJackpotLabel(
        jackpotKey: JackpotKey,
        currentBetPerLine: number,
        maxBetPerLine: number,
        ellipsisCount: number
    ): void {
        // 1. 获取播放状态和倍数
        let isPlaying = false;
        let multiplier = 1;
        let label: cc.Label = null;
        let prevMoney = 0;

        switch (jackpotKey) {
            case JackpotKey.GRAND:
                isPlaying = this._isPlayingGrand;
                multiplier = this._multiplierGrand;
                label = this.grandLabel;
                prevMoney = this._prevGrandJackpotMoney;
                break;
            case JackpotKey.MEGA:
                isPlaying = this._isPlayingMega;
                multiplier = this._multiplierMega;
                label = this.megaLabel;
                prevMoney = this._prevMegaJackpotMoney;
                break;
            case JackpotKey.MAJOR:
                isPlaying = this._isPlayingMajor;
                multiplier = this._multiplierMajor;
                label = this.majorLabel;
                prevMoney = this._prevMajorJackpotMoney;
                break;
            case JackpotKey.MINOR:
                isPlaying = this._isPlayingMinor;
                multiplier = this._multiplierMinor;
                label = this.minorLabel;
                prevMoney = this._prevMinorJackpotMoney;
                break;
            case JackpotKey.MINI:
                isPlaying = this._isPlayingMini;
                multiplier = this._multiplierMini;
                label = this.miniLabel;
                prevMoney = this._prevMiniJackpotMoney;
                break;
            case JackpotKey.MINISMALL:
                isPlaying = this._isPlayingMiniSmall;
                multiplier = this._multiplierMiniSmall;
                label = this.minismallLabel;
                prevMoney = this._prevMiniSmallJackpotMoney;
                break;
        }

        // 2. 播放状态关闭/标签为空时跳过
        if (!isPlaying || !label || !this._jackpotInfo) return;

        // 3. 获取基础金额并乘以倍数
        let money = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(jackpotKey, currentBetPerLine, maxBetPerLine);
        money *= multiplier;

        // 4. 格式化金额并更新标签
        if (this.useEllipsisCount) {
            // 使用省略格式
            label.string = this.formatJackpotMoney(money, ellipsisCount);
        } else {
            // 普通格式（平滑过渡）
            money = Utility.getDisplayJackpotMoney(prevMoney, money);
            label.string = CurrencyFormatHelper.formatNumber(money);
            
            // 更新历史值（修正原代码笔误：MINISMALL曾错误使用_prevMiniJackpotMoney）
            switch (jackpotKey) {
                case JackpotKey.GRAND: this._prevGrandJackpotMoney = money; break;
                case JackpotKey.MEGA: this._prevMegaJackpotMoney = money; break;
                case JackpotKey.MAJOR: this._prevMajorJackpotMoney = money; break;
                case JackpotKey.MINOR: this._prevMinorJackpotMoney = money; break;
                case JackpotKey.MINI: this._prevMiniJackpotMoney = money; break;
                case JackpotKey.MINISMALL: this._prevMiniSmallJackpotMoney = money; break;
            }
        }
    }

    /**
     * 格式化Jackpot金额（处理省略位数逻辑）
     * @param money 原始金额
     * @param ellipsisCount 省略位数
     * @returns 格式化后的字符串
     */
    private formatJackpotMoney(money: number, ellipsisCount: number): string {
        if (this.isOneStepLowEllipsisCnt) {
            return ellipsisCount > 3 
                ? CurrencyFormatHelper.formatEllipsisNumber(money, ellipsisCount - 3)
                : CurrencyFormatHelper.formatNumber(money);
        } else {
            return CurrencyFormatHelper.formatEllipsisNumber(money, ellipsisCount);
        }
    }
}