import SlotSoundController from '../../../Slot/SlotSoundController';
import TSUtility from '../../../global_utility/TSUtility';
import SlotGameResultManager from '../../../manager/SlotGameResultManager';
import SlotGameRuleManager from '../../../manager/SlotGameRuleManager';
import { SymbolInfo } from '../../../manager/SymbolPoolManager';
import BeeLovedJarsManager from '../BeeLovedJarsManager';

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏 Lock&Roll 模式顶部 UI 组件
 * 负责顶部UI初始化、绿/黄罐子金额标签设置、动画播放（停留/出现/胜利）、音效播放等逻辑
 */
@ccclass('LockNRollTopUIComponent_BeeLovedJars')
export default class LockNRollTopUIComponent_BeeLovedJars extends cc.Component {
    // 绿色罐子金额标签
    @property({
        type: cc.Label,
        displayName: "绿色罐子金额标签",
        tooltip: "显示Lock&Roll模式绿色罐子累计奖励金额的标签"
    })
    greenJars_Label: cc.Label | null = null;

    // 黄色罐子金额标签
    @property({
        type: cc.Label,
        displayName: "黄色罐子金额标签",
        tooltip: "显示Lock&Roll模式黄色罐子累计奖励金额的标签"
    })
    yellowJars_Label: cc.Label | null = null;

    // 绿色罐子动画组件
    @property({
        type: cc.Animation,
        displayName: "绿色罐子动画组件",
        tooltip: "控制绿色罐子的停留/出现动画播放"
    })
    greenJars_FX: cc.Animation | null = null;

    // 黄色罐子动画组件
    @property({
        type: cc.Animation,
        displayName: "黄色罐子动画组件",
        tooltip: "控制黄色罐子的停留/出现动画播放"
    })
    yellowJars_FX: cc.Animation | null = null;

    // 大奖（Grand）动画组件
    @property({
        type: cc.Animation,
        displayName: "大奖动画组件",
        tooltip: "控制大奖的停留/出现/胜利动画播放"
    })
    grand_FX: cc.Animation | null = null;

    /**
     * 初始化顶部UI
     * 计算累计奖励金额，设置绿色罐子标签，播放停留动画，初始化黄色罐子标签
     */
    init(): void {
        // 空值安全检查：核心标签/动画组件缺失时直接返回
        if (!this.greenJars_Label || !this.greenJars_FX || !this.yellowJars_FX || !this.grand_FX) return;

        // 1. 计算所有符号的累计奖励值
        let totalPrize = 0;
        const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");
        const lastSymbolInfoWindow = baseGameState?.lastSymbolInfoWindow as SymbolInfo[][];
        
        if (lastSymbolInfoWindow) {
            for (let n = 0; n < lastSymbolInfoWindow.length; ++n) {
                for (let o = 0; o < lastSymbolInfoWindow[n].length; ++o) {
                    const symbolInfo = lastSymbolInfoWindow[n][o] as any;
                    if (symbolInfo !== null) {
                        totalPrize += symbolInfo.prize;
                    }
                }
            }
        }

        // 2. 计算最终奖励金额（单线路投注倍数）
        const finalPrize = totalPrize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
        
        // 3. 设置绿色罐子金额标签（格式化显示）
        const formattedPrize = BeeLovedJarsManager.getInstance().game_components.formatEllipsisNumber(finalPrize);
        this.greenJars_Label.string = formattedPrize;

        // 4. 播放停留动画（停止原有动画，重新播放）
        this.greenJars_FX.stop();
        this.greenJars_FX.play("Top_JP_L&R_side_stay", 0);
        
        this.yellowJars_FX.stop();
        this.yellowJars_FX.play("Top_JP_L&R_side_stay", 0);
        
        this.grand_FX.stop();
        this.grand_FX.play("Top_JP_L&R_C_stay", 0);

        // 5. 初始化黄色罐子金额标签（从lockNRoll状态获取pot值）
        const lockNRollState = SlotGameResultManager.Instance.getSubGameState("lockNRoll");
        let yellowJarPot = finalPrize; // 默认使用绿色罐子金额
        if (lockNRollState !== null && TSUtility.isValid(lockNRollState.pots) 
            && TSUtility.isValid(lockNRollState.getPotInfo("yellow_jar"))) {
            yellowJarPot = lockNRollState.getPotInfo("yellow_jar").pot;
        }
        this.setYellowJarsLabel(yellowJarPot);
    }

    /**
     * 设置黄色罐子金额标签
     * @param prize 黄色罐子奖励金额
     */
    setYellowJarsLabel(prize: number): void {
        if (!this.yellowJars_Label) return;
        
        // 格式化金额并设置标签
        const formattedPrize = BeeLovedJarsManager.getInstance().game_components.formatEllipsisNumber(prize);
        this.yellowJars_Label.string = formattedPrize;
    }

    /**
     * 播放出现特效
     * 同步绿/黄罐子金额标签，播放出现动画，播放UI出现音效
     */
    appearFX(): void {
        // 空值安全检查：核心标签/动画组件缺失时直接返回
        if (!this.greenJars_Label || !this.yellowJars_Label || !this.greenJars_FX || !this.yellowJars_FX || !this.grand_FX) return;

        // 1. 重新计算累计奖励金额
        let totalPrize = 0;
        const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");
        const lastSymbolInfoWindow = baseGameState?.lastSymbolInfoWindow as SymbolInfo[][];
        
        if (lastSymbolInfoWindow) {
            for (let n = 0; n < lastSymbolInfoWindow.length; ++n) {
                for (let o = 0; o < lastSymbolInfoWindow[n].length; ++o) {
                    const symbolInfo = lastSymbolInfoWindow[n][o] as any;
                    if (symbolInfo !== null) {
                        totalPrize += symbolInfo.prize;
                    }
                }
            }
        }

        // 2. 计算最终奖励金额并同步绿/黄罐子标签
        const finalPrize = totalPrize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
        const formattedPrize = BeeLovedJarsManager.getInstance().game_components.formatEllipsisNumber(finalPrize);
        
        this.greenJars_Label.string = formattedPrize;
        this.yellowJars_Label.string = formattedPrize;

        // 3. 播放出现动画（停止原有动画，重新播放）
        this.greenJars_FX.stop();
        this.greenJars_FX.play("Top_JP_L&R_side", 0);
        
        this.yellowJars_FX.stop();
        this.yellowJars_FX.play("Top_JP_L&R_side", 0);
        
        this.grand_FX.stop();
        this.grand_FX.play("Top_JP_L&R_C_appear", 0);

        // 4. 播放UI出现音效
        SlotSoundController.Instance().playAudio("ModeUIAppear", "FX");
    }

    /**
     * 播放胜利特效
     * 仅播放大奖（Grand）的胜利动画
     */
    winFX(): void {
        if (!this.grand_FX) return;
        
        // 停止原有动画，播放胜利动画
        this.grand_FX.stop();
        this.grand_FX.play("Top_JP_L&R_C_win", 0);
    }
}