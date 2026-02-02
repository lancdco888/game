import AsyncHelper from "../../global_utility/AsyncHelper";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import SDefine from "../../global_utility/SDefine";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";
import SlotManager from "../../manager/SlotManager";

// 符合 Cocos 2.4.x 原生写法：解构装饰器
const { ccclass, property } = cc._decorator;

// 声明全局 Utility 类型（兼容原代码中的 Utility.getDisplayJackpotMoney 调用）
declare const Utility: {
    getDisplayJackpotMoney(prevMoney: number, currentMoney: number): number;
};

/**
 * Jackpot 奖金展示组件（带最大长度限制）
 * 负责 Jackpot 奖金的定时滚动更新、金额格式化、省略位数计算、播放状态控制
 */
@ccclass("JackpotMoneyDisplay_WithMaxLength")
export default class JackpotMoneyDisplay_WithMaxLength extends cc.Component {
    // 各级 Jackpot 奖金标签
    @property(cc.Label)
    public grandLabel: cc.Label | null = null;

    @property(cc.Label)
    public megaLabel: cc.Label | null = null;

    @property(cc.Label)
    public majorLabel: cc.Label | null = null;

    @property(cc.Label)
    public minorLabel: cc.Label | null = null;

    @property(cc.Label)
    public miniLabel: cc.Label | null = null;

    @property(cc.Label)
    public minismallLabel: cc.Label | null = null;

    @property(cc.Label)
    public biggestJackpotLabel: cc.Label | null = null;

    // 各级 Jackpot 奖金显示最大长度
    @property
    public lengthGrand: number = 9;

    @property
    public lengthMega: number = 9;

    @property
    public lengthMajor: number = 9;

    @property
    public lengthMinor: number = 9;

    @property
    public lengthMini: number = 9;

    @property
    public lengthMinismall: number = 9;

    // 奖金更新时间间隔（秒）
    @property
    public interval: number = 0.2;

    // 是否根据最大奖金统一计算省略位数
    @property
    public isEllipsisByBiggestJackpot: boolean = false;

    // 是否一步降低省略位数
    @property
    public isOneStepLowEllipsisCnt: boolean = false;

    // 私有属性：上一次的奖金金额
    private _prevGrandJackpotMoney: number = 0;
    private _prevMegaJackpotMoney: number = 0;
    private _prevMajorJackpotMoney: number = 0;
    private _prevMinorJackpotMoney: number = 0;
    private _prevMiniJackpotMoney: number = 0;
    private _prevMiniSmallJackpotMoney: number = 0;

    // 私有属性：各级奖金是否处于播放（滚动）状态
    private _isPlayingGrand: boolean = true;
    private _isPlayingMega: boolean = true;
    private _isPlayingMajor: boolean = true;
    private _isPlayingMinor: boolean = true;
    private _isPlayingMini: boolean = true;
    private _isPlayingMiniSmall: boolean = true;

    // 私有属性：Jackpot 信息对象
    private _jackpotInfo: any = null;

    // 私有属性：各级奖金乘数
    private _multiplierGrand: number = 1;
    private _multiplierMega: number = 1;
    private _multiplierMajor: number = 1;
    private _multiplierMinor: number = 1;
    private _multiplierMini: number = 1;
    private _multiplierMiniSmall: number = 1;

    // 私有属性：省略位数缓存
    private _grand_ellipsisCount: number = -1;
    private _mega_ellipsisCount: number = -1;
    private _major_ellipsisCount: number = -1;
    private _minor_ellipsisCount: number = -1;
    private _mini_ellipsisCount: number = -1;

    // 私有属性：自定义投注线金额
    private _customBetPerLine: number = -1;

    /**
     * 组件启动（异步等待 Slot 接口就绪，初始化 Jackpot 信息，调度奖金更新）
     */
    public async start(): Promise<void> {
        // 异步等待 SlotInterface 就绪
        await AsyncHelper.asyncWaitEndCondition(() => {
            return SlotManager.Instance.slotInterface !== null;
        }, this);

        // 初始化 Jackpot 信息，调度奖金更新
        this._jackpotInfo = SlotManager.Instance.getSlotJackpotInfo();
        this.updateJackpotMoneyScedule();
        this.schedule(this.updateJackpotMoneyScedule, this.interval);
    }

    /**
     * 组件销毁（取消所有定时器，防止内存泄漏）
     */
    public onDestroy(): void {
        this.unscheduleAllCallbacks();
    }

    /**
     * 定时更新 Jackpot 奖金（计算各级奖金金额，格式化后更新标签显示）
     */
    public updateJackpotMoneyScedule(): void {
        if (!this._jackpotInfo) {
            cc.warn("Jackpot 信息未初始化，无法更新奖金显示");
            return;
        }

        // 获取投注相关数据
        SlotGameRuleManager.Instance.getTotalBet();
        const betPerLine = this.getBetPerLine();
        const maxBetPerLine = SlotGameRuleManager.Instance._maxBetPerLine;
        let ellipsisCount = 0;

        // 计算最大奖金省略位数（若需要）
        if (this.biggestJackpotLabel !== null) {
            ellipsisCount = this.getEllipsisCountBiggestJackpot();
        }

        // 更新 Grand 奖金标签
        if (this.grandLabel !== null && this._isPlayingGrand) {
            let grandMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                SDefine.SLOT_JACKPOT_KEY_GRAND,
                betPerLine,
                maxBetPerLine
            );
            grandMoney = Utility.getDisplayJackpotMoney(this._prevGrandJackpotMoney, grandMoney);
            grandMoney *= this._multiplierGrand;
            ellipsisCount = this.getEllipsisCount(SDefine.SLOT_JACKPOT_KEY_GRAND);
            this.grandLabel.string = CurrencyFormatHelper.formatEllipsisNumber(grandMoney, ellipsisCount);
            this._prevGrandJackpotMoney = grandMoney;
        }

        // 更新 Mega 奖金标签
        if (this.megaLabel !== null && this._isPlayingMega) {
            let megaMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                SDefine.SLOT_JACKPOT_KEY_MEGA,
                betPerLine,
                maxBetPerLine
            );
            megaMoney = Utility.getDisplayJackpotMoney(this._prevMegaJackpotMoney, megaMoney);
            megaMoney *= this._multiplierMega;
            ellipsisCount = this.getEllipsisCount(SDefine.SLOT_JACKPOT_KEY_MEGA);
            this.megaLabel.string = CurrencyFormatHelper.formatEllipsisNumber(megaMoney, ellipsisCount);
            this._prevMegaJackpotMoney = megaMoney;
        }

        // 更新 Major 奖金标签
        if (this.majorLabel !== null && this._isPlayingMajor) {
            let majorMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                SDefine.SLOT_JACKPOT_KEY_MAJOR,
                betPerLine,
                maxBetPerLine
            );
            majorMoney = Utility.getDisplayJackpotMoney(this._prevMajorJackpotMoney, majorMoney);
            majorMoney *= this._multiplierMajor;
            ellipsisCount = this.getEllipsisCount(SDefine.SLOT_JACKPOT_KEY_MAJOR);
            this.majorLabel.string = CurrencyFormatHelper.formatEllipsisNumber(majorMoney, ellipsisCount);
            this._prevMajorJackpotMoney = majorMoney;
        }

        // 更新 Minor 奖金标签
        if (this.minorLabel !== null && this._isPlayingMinor) {
            let minorMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                SDefine.SLOT_JACKPOT_KEY_MINOR,
                betPerLine,
                maxBetPerLine
            );
            minorMoney = Utility.getDisplayJackpotMoney(this._prevMinorJackpotMoney, minorMoney);
            minorMoney *= this._multiplierMinor;
            ellipsisCount = this.getEllipsisCount(SDefine.SLOT_JACKPOT_KEY_MINOR);
            this.minorLabel.string = CurrencyFormatHelper.formatEllipsisNumber(minorMoney, ellipsisCount);
            this._prevMinorJackpotMoney = minorMoney;
        }

        // 更新 Mini 奖金标签
        if (this.miniLabel !== null && this._isPlayingMini) {
            let miniMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                SDefine.SLOT_JACKPOT_KEY_MINI,
                betPerLine,
                maxBetPerLine
            );
            miniMoney = Utility.getDisplayJackpotMoney(this._prevMiniJackpotMoney, miniMoney);
            miniMoney *= this._multiplierMini;
            ellipsisCount = this.getEllipsisCount(SDefine.SLOT_JACKPOT_KEY_MINI);
            this.miniLabel.string = CurrencyFormatHelper.formatEllipsisNumber(miniMoney, ellipsisCount);
            this._prevMiniJackpotMoney = miniMoney;
        }

        // 更新 MiniSmall 奖金标签
        if (this.minismallLabel !== null && this._isPlayingMiniSmall) {
            let miniSmallMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                SDefine.SLOT_JACKPOT_KEY_MINISMALL,
                betPerLine,
                maxBetPerLine
            );
            miniSmallMoney = Utility.getDisplayJackpotMoney(this._prevMiniJackpotMoney, miniSmallMoney);
            miniSmallMoney *= this._multiplierMiniSmall;
            ellipsisCount = this.getEllipsisCount(SDefine.SLOT_JACKPOT_KEY_MINISMALL);
            this.minismallLabel.string = CurrencyFormatHelper.formatEllipsisNumber(miniSmallMoney, ellipsisCount);
            this._prevMiniSmallJackpotMoney = miniSmallMoney;
        }
    }

    /**
     * 设置指定 Jackpot 类型的播放（滚动）状态
     * @param jackpotKey Jackpot 类型密钥（来自 SDefine）
     * @param isPlaying 是否开启播放（滚动）状态
     */
    public setPlayingState(jackpotKey: string, isPlaying: boolean): void {
        switch (jackpotKey) {
            case SDefine.SLOT_JACKPOT_KEY_GRAND:
                this._isPlayingGrand = isPlaying;
                break;
            case SDefine.SLOT_JACKPOT_KEY_MEGA:
                this._isPlayingMega = isPlaying;
                break;
            case SDefine.SLOT_JACKPOT_KEY_MAJOR:
                this._isPlayingMajor = isPlaying;
                break;
            case SDefine.SLOT_JACKPOT_KEY_MINOR:
                this._isPlayingMinor = isPlaying;
                break;
            case SDefine.SLOT_JACKPOT_KEY_MINI:
                this._isPlayingMini = isPlaying;
                break;
            case SDefine.SLOT_JACKPOT_KEY_MINISMALL:
                this._isPlayingMiniSmall = isPlaying;
                break;
            default:
                cc.warn(`未知的 Jackpot 类型密钥：${jackpotKey}`);
                break;
        }
    }

    /**
     * 设置指定 Jackpot 类型的固定展示金额（停止滚动，显示最终中奖金额）
     * @param jackpotKey Jackpot 类型密钥（来自 SDefine）
     * @param money 要展示的固定金额
     */
    public setShowingMoney(jackpotKey: string, money: number): void {
        if (!this._jackpotInfo) {
            cc.warn("Jackpot 信息未初始化，无法设置固定展示金额");
            return;
        }

        const ellipsisCount = this.getEllipsisCount(jackpotKey);
        const formattedMoney = CurrencyFormatHelper.formatEllipsisNumber(money, ellipsisCount);

        switch (jackpotKey) {
            case SDefine.SLOT_JACKPOT_KEY_GRAND:
                this.grandLabel.string = formattedMoney;
                this._prevGrandJackpotMoney = money;
                break;
            case SDefine.SLOT_JACKPOT_KEY_MEGA:
                this.megaLabel.string = formattedMoney;
                this._prevMegaJackpotMoney = money;
                break;
            case SDefine.SLOT_JACKPOT_KEY_MAJOR:
                this.majorLabel.string = formattedMoney;
                this._prevMajorJackpotMoney = money;
                break;
            case SDefine.SLOT_JACKPOT_KEY_MINOR:
                this.minorLabel.string = formattedMoney;
                this._prevMinorJackpotMoney = money;
                break;
            case SDefine.SLOT_JACKPOT_KEY_MINI:
                this.miniLabel.string = formattedMoney;
                this._prevMiniJackpotMoney = money;
                break;
            case SDefine.SLOT_JACKPOT_KEY_MINISMALL:
                this.minismallLabel.string = formattedMoney;
                this._prevMiniSmallJackpotMoney = money;
                break;
            default:
                cc.warn(`未知的 Jackpot 类型密钥：${jackpotKey}`);
                break;
        }
    }

    /**
     * 计算指定 Jackpot 类型的金额省略位数
     * @param jackpotKey Jackpot 类型密钥（来自 SDefine）
     * @returns 省略位数（3的倍数，用于金额格式化）
     */
    public getEllipsisCount(jackpotKey: string): number {
        // 若开启统一按最大奖金计算，直接返回最大奖金省略位数
        if (this.isEllipsisByBiggestJackpot) {
            return this.getEllipsisCountBiggestJackpot();
        }

        const betPerLine = this.getBetPerLine();
        const maxBetPerLine = SlotGameRuleManager.Instance._maxBetPerLine;
        let maxLength = 0;
        let jackpotMoney = 0;
        let ellipsisCount = 0;

        // 匹配对应 Jackpot 类型的最大长度和当前金额
        switch (jackpotKey) {
            case SDefine.SLOT_JACKPOT_KEY_GRAND:
                maxLength = this.lengthGrand;
                jackpotMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                    SDefine.SLOT_JACKPOT_KEY_GRAND,
                    betPerLine,
                    maxBetPerLine
                );
                break;
            case SDefine.SLOT_JACKPOT_KEY_MEGA:
                maxLength = this.lengthMega;
                jackpotMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                    SDefine.SLOT_JACKPOT_KEY_MEGA,
                    betPerLine,
                    maxBetPerLine
                );
                break;
            case SDefine.SLOT_JACKPOT_KEY_MAJOR:
                maxLength = this.lengthMajor;
                jackpotMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                    SDefine.SLOT_JACKPOT_KEY_MAJOR,
                    betPerLine,
                    maxBetPerLine
                );
                break;
            case SDefine.SLOT_JACKPOT_KEY_MINOR:
                maxLength = this.lengthMinor;
                jackpotMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                    SDefine.SLOT_JACKPOT_KEY_MINOR,
                    betPerLine,
                    maxBetPerLine
                );
                break;
            case SDefine.SLOT_JACKPOT_KEY_MINI:
                maxLength = this.lengthMini;
                jackpotMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                    SDefine.SLOT_JACKPOT_KEY_MINI,
                    betPerLine,
                    maxBetPerLine
                );
                break;
            case SDefine.SLOT_JACKPOT_KEY_MINISMALL:
                maxLength = this.lengthMinismall;
                jackpotMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                    SDefine.SLOT_JACKPOT_KEY_MINISMALL,
                    betPerLine,
                    maxBetPerLine
                );
                break;
            default:
                return 0;
        }

        // 计算需要省略的位数（确保金额长度不超过最大限制，每次省略3位）
        while (Math.floor(jackpotMoney).toString().length - ellipsisCount > maxLength) {
            ellipsisCount += 3;
        }

        return ellipsisCount;
    }

    /**
     * 计算最大 Jackpot 奖金的省略位数（用于统一格式化所有奖金）
     * @returns 省略位数（3的倍数，用于金额格式化）
     */
    public getEllipsisCountBiggestJackpot(): number {
        if (!this._jackpotInfo) {
            return 0;
        }

        const betPerLine = this.getBetPerLine();
        const maxBetPerLine = SlotGameRuleManager.Instance._maxBetPerLine;
        let maxJackpotMoney = 0;
        let maxLength = 0;
        let currentMoney = 0;

        // 遍历所有 Jackpot 类型，找到最大奖金和对应的最大长度
        if (this._jackpotInfo.isExistJackpotKey(SDefine.SLOT_JACKPOT_KEY_MINISMALL)) {
            currentMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                SDefine.SLOT_JACKPOT_KEY_MINISMALL,
                betPerLine,
                maxBetPerLine
            );
            if (maxJackpotMoney < currentMoney) {
                maxJackpotMoney = currentMoney;
                maxLength = this.lengthMinismall;
            }
        }

        if (this._jackpotInfo.isExistJackpotKey(SDefine.SLOT_JACKPOT_KEY_MINI)) {
            currentMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                SDefine.SLOT_JACKPOT_KEY_MINI,
                betPerLine,
                maxBetPerLine
            );
            if (maxJackpotMoney < currentMoney) {
                maxJackpotMoney = currentMoney;
                maxLength = this.lengthMini;
            }
        }

        if (this._jackpotInfo.isExistJackpotKey(SDefine.SLOT_JACKPOT_KEY_MINOR)) {
            currentMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                SDefine.SLOT_JACKPOT_KEY_MINOR,
                betPerLine,
                maxBetPerLine
            );
            if (maxJackpotMoney < currentMoney) {
                maxJackpotMoney = currentMoney;
                maxLength = this.lengthMinor;
            }
        }

        if (this._jackpotInfo.isExistJackpotKey(SDefine.SLOT_JACKPOT_KEY_MAJOR)) {
            currentMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                SDefine.SLOT_JACKPOT_KEY_MAJOR,
                betPerLine,
                maxBetPerLine
            );
            if (maxJackpotMoney < currentMoney) {
                maxJackpotMoney = currentMoney;
                maxLength = this.lengthMajor;
            }
        }

        if (this._jackpotInfo.isExistJackpotKey(SDefine.SLOT_JACKPOT_KEY_MEGA)) {
            currentMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                SDefine.SLOT_JACKPOT_KEY_MEGA,
                betPerLine,
                maxBetPerLine
            );
            if (maxJackpotMoney < currentMoney) {
                maxJackpotMoney = currentMoney;
                maxLength = this.lengthMega;
            }
        }

        if (this._jackpotInfo.isExistJackpotKey(SDefine.SLOT_JACKPOT_KEY_GRAND)) {
            currentMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey(
                SDefine.SLOT_JACKPOT_KEY_GRAND,
                betPerLine,
                maxBetPerLine
            );
            if (maxJackpotMoney < currentMoney) {
                maxJackpotMoney = currentMoney;
                maxLength = this.lengthGrand;
            }
        }

        // 格式化最大奖金，计算省略位数
        maxJackpotMoney = Utility.getDisplayJackpotMoney(0, maxJackpotMoney);
        let ellipsisCount = 0;
        while (Math.floor(maxJackpotMoney).toString().length - ellipsisCount > maxLength) {
            ellipsisCount += 3;
        }

        return ellipsisCount;
    }

    /**
     * 设置自定义投注线金额（用于覆盖默认投注线计算奖金）
     * @param betPerLine 自定义投注线金额
     */
    public setCustomBetPerLine(betPerLine: number): void {
        this._customBetPerLine = betPerLine;
    }

    /**
     * 清除自定义投注线金额（恢复默认投注线计算奖金）
     */
    public clearCustomBetPerLine(): void {
        this._customBetPerLine = -1;
    }

    /**
     * 获取当前投注线金额（优先返回自定义投注线，否则返回默认投注线）
     * @returns 当前投注线金额
     */
    public getBetPerLine(): number {
        return this._customBetPerLine !== -1 
            ? this._customBetPerLine 
            : SlotGameRuleManager.Instance.getCurrentBetPerLine();
    }

    // 各级奖金乘数设置方法
    public setMultiplierGrand(multiplier: number): void {
        this._multiplierGrand = multiplier;
    }

    public setMultiplierMega(multiplier: number): void {
        this._multiplierMega = multiplier;
    }

    public setMultiplierMajor(multiplier: number): void {
        this._multiplierMajor = multiplier;
    }

    public setMultiplierMinor(multiplier: number): void {
        this._multiplierMinor = multiplier;
    }

    public setMultiplierMini(multiplier: number): void {
        this._multiplierMini = multiplier;
    }

    public setMultiplierMiniSmall(multiplier: number): void {
        this._multiplierMiniSmall = multiplier;
    }
}