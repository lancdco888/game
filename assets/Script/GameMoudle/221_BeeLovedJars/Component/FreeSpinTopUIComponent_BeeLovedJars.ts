import SlotSoundController from '../../../Slot/SlotSoundController';
import SlotGameResultManager from '../../../manager/SlotGameResultManager';
import SlotGameRuleManager from '../../../manager/SlotGameRuleManager';
import BeeLovedJarsManager from '../BeeLovedJarsManager';

const { ccclass, property } = cc._decorator;

/**
 * 符号信息接口（匹配原代码lastSymbolInfoWindow的结构）
 */
interface SymbolInfo {
    prize: number;
    [key: string]: any; // 兼容其他未定义字段
}

/**
 * BeeLovedJars 游戏免费旋转模式顶部UI组件
 * 负责顶部UI的奖金计算、动画控制、金额显示、音效播放等核心逻辑
 */
@ccclass('FreeSpinTopUIComponent_BeeLovedJars')
export default class FreeSpinTopUIComponent_BeeLovedJars extends cc.Component {
    // ===================== 核心动画组件 =====================
    // 左侧/右侧FX动画组件（each档位）
    @property({
        type: cc.Animation,
        displayName: "Each档位FX动画",
        tooltip: "顶部UI左侧/右侧each档位的特效动画组件"
    })
    each_FX: cc.Animation | null = null;

    // 奖励FX动画组件（award档位）
    @property({
        type: cc.Animation,
        displayName: "Award档位FX动画",
        tooltip: "顶部UI award档位的特效动画组件"
    })
    award_FX: cc.Animation | null = null;

    // 大奖FX动画组件（grand档位）
    @property({
        type: cc.Animation,
        displayName: "Grand档位FX动画",
        tooltip: "顶部UI grand档位的特效动画组件"
    })
    grand_FX: cc.Animation | null = null;

    // ===================== 显示标签 =====================
    // 单注奖金显示标签
    @property({
        type: cc.Label,
        displayName: "单注奖金标签",
        tooltip: "显示计算后的单注奖金金额（格式化后）"
    })
    each_Label: cc.Label | null = null;

    /**
     * 初始化顶部UI：计算奖金+显示+播放停留动画
     */
    init(): void {
        // 1. 计算总奖金（累加所有符号的prize）
        let totalPrize = 0;
        const lastSymbolInfo = SlotGameResultManager.Instance.getSubGameState("base").lastSymbolInfoWindow;
        
        // 空值+类型检查：确保lastSymbolInfo是二维数组
        if (Array.isArray(lastSymbolInfo)) {
            for (let row = 0; row < lastSymbolInfo.length; ++row) {
                const rowData = lastSymbolInfo[row];
                if (Array.isArray(rowData)) {
                    for (let col = 0; col < rowData.length; ++col) {
                        const symbolInfo = rowData[col] as SymbolInfo | null;
                        // 仅累加非空符号的prize
                        if (symbolInfo && symbolInfo.prize !== null && !isNaN(symbolInfo.prize)) {
                            totalPrize += symbolInfo.prize;
                        }
                    }
                }
            }
        }

        // 2. 计算最终金额（总奖金 * 当前每线投注额）
        const betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
        const finalAmount = totalPrize * betPerLine;

        // 3. 设置金额标签（格式化显示）
        if (this.each_Label) {
            const gameManager = BeeLovedJarsManager.getInstance();
            // 空值检查：确保格式化方法存在
            if (gameManager?.game_components?.formatEllipsisNumber) {
                this.each_Label.string = gameManager.game_components.formatEllipsisNumber(finalAmount);
            } else {
                this.each_Label.string = finalAmount.toString(); // 兜底显示
                console.warn("formatEllipsisNumber方法未找到，使用默认数字格式");
            }
        }

        // 4. 播放所有FX的停留动画
        this.playFXAnimation(this.each_FX, "Top_JP_L&R_side_stay");
        this.playFXAnimation(this.award_FX, "Top_JP_L&R_side_stay");
        this.playFXAnimation(this.grand_FX, "Top_JP_L&R_C_stay");
    }

    /**
     * 播放顶部UI出现特效：计算奖金+显示+播放出现动画+音效
     */
    appearFX(): void {
        // 1. 重新计算奖金（逻辑同init）
        let totalPrize = 0;
        const lastSymbolInfo = SlotGameResultManager.Instance.getSubGameState("base").lastSymbolInfoWindow;
        
        if (Array.isArray(lastSymbolInfo)) {
            for (let row = 0; row < lastSymbolInfo.length; ++row) {
                const rowData = lastSymbolInfo[row];
                if (Array.isArray(rowData)) {
                    for (let col = 0; col < rowData.length; ++col) {
                        const symbolInfo = rowData[col] as SymbolInfo | null;
                        if (symbolInfo && symbolInfo.prize !== null && !isNaN(symbolInfo.prize)) {
                            totalPrize += symbolInfo.prize;
                        }
                    }
                }
            }
        }

        // 2. 计算最终金额并更新标签
        const betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
        const finalAmount = totalPrize * betPerLine;

        if (this.each_Label) {
            const gameManager = BeeLovedJarsManager.getInstance();
            if (gameManager?.game_components?.formatEllipsisNumber) {
                this.each_Label.string = gameManager.game_components.formatEllipsisNumber(finalAmount);
            } else {
                this.each_Label.string = finalAmount.toString();
            }
        }

        // 3. 播放出现动画
        this.playFXAnimation(this.each_FX, "Top_JP_L&R_side");
        this.playFXAnimation(this.award_FX, "Top_JP_L&R_side");
        this.playFXAnimation(this.grand_FX, "Top_JP_L&R_C_appear");

        // 4. 播放出现音效
        SlotSoundController.Instance()?.playAudio("ModeUIAppear", "FX");
    }

    /**
     * 播放大奖中奖特效：播放grand档位win动画+中奖音效
     */
    winFX(): void {
        // 播放grand档位中奖动画
        this.playFXAnimation(this.grand_FX, "Top_JP_L&R_C_win");
        // 播放Jackpot中奖音效
        SlotSoundController.Instance()?.playAudio("JackpotModeWin", "FX");
    }

    /**
     * 通用FX动画播放方法（封装停止+播放逻辑，添加空值检查）
     * @param fxAnim 目标动画组件
     * @param animName 动画名称
     */
    private playFXAnimation(fxAnim: cc.Animation | null, animName: string): void {
        if (fxAnim && fxAnim.isValid) {
            fxAnim.stop(); // 停止当前动画
            fxAnim.play(animName, 0); // 播放指定动画（0=不循环）
        } else if (!fxAnim) {
            console.warn(`FX动画组件未绑定，无法播放动画: ${animName}`);
        } else {
            console.warn(`FX动画组件已销毁，无法播放动画: ${animName}`);
        }
    }
}