import JackpotMoneyDisplay from "../../JackpotMoneyDisplay";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import TSUtility from "../../global_utility/TSUtility";
import { Utility } from "../../global_utility/Utility";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";
import JackpotCounter_SuperSevenBlasts from "./JackpotCounter_SuperSevenBlasts";

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts 游戏专属Jackpot金额显示组件
 * 核心功能：Jackpot金额更新调度、播放状态控制、自定义投注设置、计数显示/隐藏
 * 注意：原代码存在拼写错误（_currentJakcpotCount → _currentJackpotCount、updateJackpotMoneyScedule → updateJackpotMoneySchedule），保留原命名避免业务逻辑冲突
 */
@ccclass('JackpotMoneyDisplay_SuperSevenBlasts')
export default class JackpotMoneyDisplay_SuperSevenBlasts extends JackpotMoneyDisplay {
    // ========== 编辑器配置属性 ==========
    /** Jackpot金额显示标签数组（对应36/30/25/21/18/15/12/09/06Jackpot） */
    @property({
        type: [cc.Label],
        displayName: "Jackpot金额标签",
        tooltip: "按顺序对应36/30/25/21/18/15/12/09/06Jackpot的金额显示标签"
    })
    public jackpotAmount_Labels: cc.Label[] = [];

    /** Jackpot计数器组件数组 */
    @property({
        type: [JackpotCounter_SuperSevenBlasts],
        displayName: "Jackpot计数器",
        tooltip: "Jackpot计数显示的组件数组"
    })
    public jackpotCounters: JackpotCounter_SuperSevenBlasts[] = [];

    /** 底部计数器节点数组 */
    @property({
        type: [cc.Node],
        displayName: "底部计数器节点",
        tooltip: "Jackpot计数对应的底部装饰节点数组"
    })
    public bottomCounters: cc.Node[] = [];

    // ========== 状态属性 ==========
    /** 当前Jackpot计数（原代码拼写错误：Jakcpot → Jackpot，保留） */
    private _currentJakcpotCount: number = 0;

    // 各档位Jackpot上一次显示的金额
    private _prevMoney06: number = 0;
    private _prevMoney09: number = 0;
    private _prevMoney12: number = 0;
    private _prevMoney15: number = 0;
    private _prevMoney18: number = 0;
    private _prevMoney21: number = 0;
    private _prevMoney25: number = 0;
    private _prevMoney30: number = 0;
    private _prevMoney36: number = 0;

    // 各档位Jackpot是否处于播放状态
    private _isPlaying06: boolean = true;
    private _isPlaying09: boolean = true;
    private _isPlaying12: boolean = true;
    private _isPlaying15: boolean = true;
    private _isPlaying18: boolean = true;
    private _isPlaying21: boolean = true;
    private _isPlaying25: boolean = true;
    private _isPlaying30: boolean = true;
    private _isPlaying36: boolean = true;

    // 各档位Jackpot倍率
    private _multiplier06: number = 1;
    private _multiplier09: number = 1;
    private _multiplier12: number = 1;
    private _multiplier15: number = 1;
    private _multiplier18: number = 1;
    private _multiplier21: number = 1;
    private _multiplier25: number = 1;
    private _multiplier30: number = 1;
    private _multiplier36: number = 1;


    // ========== 核心方法 - Jackpot金额更新 ==========
    /**
     * 调度更新Jackpot金额显示（原代码拼写错误：Scedule → Schedule，保留）
     * 逻辑：根据投注额、倍率计算各档位Jackpot金额，更新显示标签
     */
    public updateJackpotMoneyScedule(): void {
        // 获取当前每线投注额和最大每线投注额
        let currentBetPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
        const maxBetPerLine = SlotGameRuleManager.Instance._maxBetPerLine;

        // 使用自定义投注额（如果设置）
        if (this.customBetPerLine !== 0) {
            currentBetPerLine = this.customBetPerLine;
        }

        // 最大投注额为0时不执行更新
        if (maxBetPerLine === 0) return;
        // Jackpot信息为空时不执行更新
        if (!this._jackpotInfo) return;

        // ========== 36Jackpot 更新 ==========
        if (this._isPlaying36) {
            let jackpotMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey("36Jackpot", currentBetPerLine, maxBetPerLine);
            jackpotMoney *= this._multiplier36;
            jackpotMoney = Utility.getDisplayJackpotMoney(this._prevMoney36, jackpotMoney);
            
            if (TSUtility.isValid(this.jackpotAmount_Labels[0])) {
                this.jackpotAmount_Labels[0].string = CurrencyFormatHelper.formatNumber(jackpotMoney);
            }
            this._prevMoney36 = jackpotMoney;
        }

        // ========== 30Jackpot 更新 ==========
        if (this._isPlaying30) {
            let jackpotMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey("30Jackpot", currentBetPerLine, maxBetPerLine);
            jackpotMoney *= this._multiplier30;
            jackpotMoney = Utility.getDisplayJackpotMoney(this._prevMoney30, jackpotMoney);
            
            if (TSUtility.isValid(this.jackpotAmount_Labels[1])) {
                this.jackpotAmount_Labels[1].string = CurrencyFormatHelper.formatNumber(jackpotMoney);
            }
            this._prevMoney30 = jackpotMoney;
        }

        // ========== 25Jackpot 更新 ==========
        if (this._isPlaying25) {
            let jackpotMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey("25Jackpot", currentBetPerLine, maxBetPerLine);
            jackpotMoney *= this._multiplier25;
            jackpotMoney = Utility.getDisplayJackpotMoney(this._prevMoney25, jackpotMoney);
            
            if (TSUtility.isValid(this.jackpotAmount_Labels[2])) {
                this.jackpotAmount_Labels[2].string = CurrencyFormatHelper.formatNumber(jackpotMoney);
            }
            this._prevMoney25 = jackpotMoney;
        }

        // ========== 21Jackpot 更新 ==========
        if (this._isPlaying21) {
            let jackpotMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey("21Jackpot", currentBetPerLine, maxBetPerLine);
            jackpotMoney *= this._multiplier21;
            jackpotMoney = Utility.getDisplayJackpotMoney(this._prevMoney21, jackpotMoney);
            
            if (TSUtility.isValid(this.jackpotAmount_Labels[3])) {
                this.jackpotAmount_Labels[3].string = CurrencyFormatHelper.formatNumber(jackpotMoney);
            }
            this._prevMoney21 = jackpotMoney;
        }

        // ========== 18Jackpot 更新 ==========
        if (this._isPlaying18) {
            let jackpotMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey("18Jackpot", currentBetPerLine, maxBetPerLine);
            jackpotMoney *= this._multiplier18;
            jackpotMoney = Utility.getDisplayJackpotMoney(this._prevMoney18, jackpotMoney);
            
            if (TSUtility.isValid(this.jackpotAmount_Labels[4])) {
                this.jackpotAmount_Labels[4].string = CurrencyFormatHelper.formatNumber(jackpotMoney);
            }
            this._prevMoney18 = jackpotMoney;
        }

        // ========== 15Jackpot 更新 ==========
        if (this._isPlaying15) {
            let jackpotMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey("15Jackpot", currentBetPerLine, maxBetPerLine);
            jackpotMoney *= this._multiplier15;
            jackpotMoney = Utility.getDisplayJackpotMoney(this._prevMoney15, jackpotMoney);
            
            if (TSUtility.isValid(this.jackpotAmount_Labels[5])) {
                this.jackpotAmount_Labels[5].string = CurrencyFormatHelper.formatNumber(jackpotMoney);
            }
            this._prevMoney15 = jackpotMoney;
        }

        // ========== 12Jackpot 更新 ==========
        if (this._isPlaying12) {
            let jackpotMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey("12Jackpot", currentBetPerLine, maxBetPerLine);
            jackpotMoney *= this._multiplier12;
            jackpotMoney = Utility.getDisplayJackpotMoney(this._prevMoney12, jackpotMoney);
            
            if (TSUtility.isValid(this.jackpotAmount_Labels[6])) {
                this.jackpotAmount_Labels[6].string = CurrencyFormatHelper.formatNumber(jackpotMoney);
            }
            this._prevMoney12 = jackpotMoney;
        }

        // ========== 09Jackpot 更新 ==========
        if (this._isPlaying09) {
            let jackpotMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey("09Jackpot", currentBetPerLine, maxBetPerLine);
            jackpotMoney *= this._multiplier09;
            jackpotMoney = Utility.getDisplayJackpotMoney(this._prevMoney09, jackpotMoney);
            
            if (TSUtility.isValid(this.jackpotAmount_Labels[7])) {
                this.jackpotAmount_Labels[7].string = CurrencyFormatHelper.formatNumber(jackpotMoney);
            }
            this._prevMoney09 = jackpotMoney;
        }

        // ========== 06Jackpot 更新 ==========
        if (this._isPlaying06) {
            let jackpotMoney = this._jackpotInfo.getJackpotMoneyByCoinSizeUsingJackpotKey("06Jackpot", currentBetPerLine, maxBetPerLine);
            jackpotMoney *= this._multiplier06;
            jackpotMoney = Utility.getDisplayJackpotMoney(this._prevMoney06, jackpotMoney);
            
            if (TSUtility.isValid(this.jackpotAmount_Labels[8])) {
                this.jackpotAmount_Labels[8].string = CurrencyFormatHelper.formatNumber(jackpotMoney);
            }
            this._prevMoney06 = jackpotMoney;
        }
    }

    // ========== 核心方法 - 状态控制 ==========
    /**
     * 设置指定Jackpot的播放状态
     * @param jackpotKey Jackpot标识（如"36Jackpot"）
     * @param isPlaying 是否播放
     */
    public setPlayingState(jackpotKey: string, isPlaying: boolean): void {
        switch (jackpotKey) {
            case "36Jackpot":
                this._isPlaying36 = isPlaying;
                break;
            case "30Jackpot":
                this._isPlaying30 = isPlaying;
                break;
            case "25Jackpot":
                this._isPlaying25 = isPlaying;
                break;
            case "21Jackpot":
                this._isPlaying21 = isPlaying;
                break;
            case "18Jackpot":
                this._isPlaying18 = isPlaying;
                break;
            case "15Jackpot":
                this._isPlaying15 = isPlaying;
                break;
            case "12Jackpot":
                this._isPlaying12 = isPlaying;
                break;
            case "09Jackpot":
                this._isPlaying09 = isPlaying;
                break;
            case "06Jackpot":
                this._isPlaying06 = isPlaying;
                break;
            default:
                break;
        }
    }

    /**
     * 设置指定Jackpot的显示金额
     * @param jackpotKey Jackpot标识（如"36Jackpot"）
     * @param money 要显示的金额
     */
    public setShowingMoney(jackpotKey: string, money: number): void {
        // 计算省略位数（原逻辑保留）
        let ellipsisCount = SlotGameRuleManager.Instance.getCurrentBetEllipsisCount();
        ellipsisCount = Math.max(0, ellipsisCount + this.addEllipsisCnt);
        
        // 格式化金额
        const formattedMoney = CurrencyFormatHelper.formatNumber(money);

        // 根据Jackpot标识更新对应标签和缓存金额
        switch (jackpotKey) {
            case "36Jackpot":
                if (TSUtility.isValid(this.jackpotAmount_Labels[0])) {
                    this.jackpotAmount_Labels[0].string = formattedMoney;
                }
                this._prevMoney36 = money;
                break;
            case "30Jackpot":
                if (TSUtility.isValid(this.jackpotAmount_Labels[1])) {
                    this.jackpotAmount_Labels[1].string = formattedMoney;
                }
                this._prevMoney30 = money;
                break;
            case "25Jackpot":
                if (TSUtility.isValid(this.jackpotAmount_Labels[2])) {
                    this.jackpotAmount_Labels[2].string = formattedMoney;
                }
                this._prevMoney25 = money;
                break;
            case "21Jackpot":
                if (TSUtility.isValid(this.jackpotAmount_Labels[3])) {
                    this.jackpotAmount_Labels[3].string = formattedMoney;
                }
                this._prevMoney21 = money;
                break;
            case "18Jackpot":
                if (TSUtility.isValid(this.jackpotAmount_Labels[4])) {
                    this.jackpotAmount_Labels[4].string = formattedMoney;
                }
                this._prevMoney18 = money;
                break;
            case "15Jackpot":
                if (TSUtility.isValid(this.jackpotAmount_Labels[5])) {
                    this.jackpotAmount_Labels[5].string = formattedMoney;
                }
                this._prevMoney15 = money;
                break;
            case "12Jackpot":
                if (TSUtility.isValid(this.jackpotAmount_Labels[6])) {
                    this.jackpotAmount_Labels[6].string = formattedMoney;
                }
                this._prevMoney12 = money;
                break;
            case "09Jackpot":
                if (TSUtility.isValid(this.jackpotAmount_Labels[7])) {
                    this.jackpotAmount_Labels[7].string = formattedMoney;
                }
                this._prevMoney09 = money;
                break;
            case "06Jackpot":
                if (TSUtility.isValid(this.jackpotAmount_Labels[8])) {
                    this.jackpotAmount_Labels[8].string = formattedMoney;
                }
                this._prevMoney06 = money;
                break;
            default:
                break;
        }
    }

    /**
     * 设置自定义每线投注额
     * @param betPerLine 自定义每线投注额
     */
    public setCustomBetPerLine(betPerLine: number): void {
        this.customBetPerLine = betPerLine;
    }

    /**
     * 重置自定义每线投注额（恢复为0）
     */
    public resetCustomBetPerLine(): void {
        this.customBetPerLine = 0;
    }

    // ========== 核心方法 - 计数控制 ==========
    /**
     * 设置基础Jackpot计数（累加）
     * @param addCount 要累加的计数值
     */
    public setBaseCount(addCount: number): void {
        // 累加计数
        this._currentJakcpotCount += addCount;

        // 计数≤5时不显示计数器
        if (this._currentJakcpotCount <= 5) return;

        // 确定当前显示的计数器索引
        const counterIndex = this.getCounterIndexByCount(this._currentJakcpotCount);

        // 更新所有计数器的显示状态
        this.updateCountersDisplay(counterIndex, this._currentJakcpotCount);
    }

    /**
     * 设置奖励Jackpot计数（直接赋值）
     * @param count 目标计数值
     */
    public setBonusCount(count: number): void {
        // 直接赋值计数
        this._currentJakcpotCount = count;

        // 确定当前显示的计数器索引
        const counterIndex = this.getCounterIndexByCount(count);

        // 更新所有计数器的显示状态
        this.updateCountersDisplay(counterIndex, count);
    }

    /**
     * 隐藏所有Jackpot计数器
     */
    public hideCount(): void {
        // 遍历所有计数器，隐藏节点
        for (let i = 0; i < this.jackpotCounters.length; i++) {
            if (TSUtility.isValid(this.jackpotCounters[i]?.node)) {
                this.jackpotCounters[i].node.active = false;
            }
            if (TSUtility.isValid(this.bottomCounters[i])) {
                this.bottomCounters[i].active = false;
            }
        }

        // 重置当前计数
        this._currentJakcpotCount = 0;
    }

    // ========== 辅助方法 ==========
    /**
     * 根据计数值获取对应的计数器索引
     * @param count 计数值
     * @returns 计数器索引（0-8）
     */
    private getCounterIndexByCount(count: number): number {
        if (count < 9) return 0;
        if (count < 12) return 1;
        if (count < 15) return 2;
        if (count < 18) return 3;
        if (count < 21) return 4;
        if (count < 25) return 5;
        if (count < 30) return 6;
        if (count < 36) return 7;
        return 8;
    }

    /**
     * 更新计数器显示状态
     * @param targetIndex 目标显示的计数器索引
     * @param count 当前计数值
     */
    private updateCountersDisplay(targetIndex: number, count: number): void {
        for (let i = 0; i < this.jackpotCounters.length; i++) {
            // 设置计数器节点显示状态
            const isTarget = i === targetIndex;
            if (TSUtility.isValid(this.jackpotCounters[i]?.node)) {
                this.jackpotCounters[i].node.active = isTarget;
            }
            if (TSUtility.isValid(this.bottomCounters[i])) {
                this.bottomCounters[i].active = isTarget;
            }

            // 目标计数器更新显示内容
            if (isTarget &&TSUtility.isValid(this.jackpotCounters[i])) {
                this.jackpotCounters[i].setCountString(count);
                // 计数>5显示正常计数，否则显示低计数
                if (count > 5) {
                    this.jackpotCounters[i].setCount();
                } else {
                    this.jackpotCounters[i].setUnderCount();
                }
            }
        }
    }
}