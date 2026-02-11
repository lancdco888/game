import SlotSoundController from "../../Slot/SlotSoundController";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import JackpotModePotUI_Zhuquefortune from "./JackpotModePotUI_Zhuquefortune";
import JackpotMoneyDisplay_WithMaxLength from "./JackpotMoneyDisplay_WithMaxLength";

// 符合 Cocos 2.4.x 原生写法：解构装饰器
const { ccclass, property } = cc._decorator;

/**
 * 朱雀运势 Jackpot 模式 UI 核心组件
 * 负责 Jackpot 模式的 UI 初始化、动画播放、Pot 管理、中奖结果展示
 */
@ccclass()
export default class JackpotModeUI_Zhuquefortune extends cc.Component {
    // UI 核心动画组件（绑定 Jackpot UI 相关动画剪辑）
    @property(cc.Animation)
    public ui_Animation: cc.Animation | null = null;

    // Jackpot 奖金显示组件（处理金额格式化与展示）
    @property(JackpotMoneyDisplay_WithMaxLength)
    public ui_JackpotMoney: JackpotMoneyDisplay_WithMaxLength | null = null;

    // 各级 Jackpot Pot UI（mini/ minor/ major/ grand/ double grand）
    @property(JackpotModePotUI_Zhuquefortune)
    public miniPotUI: JackpotModePotUI_Zhuquefortune = null;

    @property(JackpotModePotUI_Zhuquefortune)
    public minorPotUI: JackpotModePotUI_Zhuquefortune = null;

    @property(JackpotModePotUI_Zhuquefortune)
    public majorPotUI: JackpotModePotUI_Zhuquefortune = null;

    @property(JackpotModePotUI_Zhuquefortune)
    public grandPotUI: JackpotModePotUI_Zhuquefortune = null;

    @property(JackpotModePotUI_Zhuquefortune)
    public doubleGrandPotUI: JackpotModePotUI_Zhuquefortune = null;

    /**
     * 初始化 UI（重置所有 Pot UI 状态，开启所有 Jackpot 金额播放状态）
     */
    public initUI(): void {
        // 初始化各级 Pot UI
        this.miniPotUI?.initUI();
        this.minorPotUI?.initUI();
        this.majorPotUI?.initUI();
        this.grandPotUI?.initUI();
        this.doubleGrandPotUI?.initUI();

        // 开启所有 Jackpot 类型的金额播放状态（滚动展示）
        this.ui_JackpotMoney?.setPlayingState("mini", true);
        this.ui_JackpotMoney?.setPlayingState("minor", true);
        this.ui_JackpotMoney?.setPlayingState("major", true);
        this.ui_JackpotMoney?.setPlayingState("mega", true);
        this.ui_JackpotMoney?.setPlayingState("grand", true);
    }

    /**
     * 隐藏所有 Pot UI 的期望显示（中奖后隐藏未中奖的期望效果）
     */
    public hideExpect(): void {
        this.miniPotUI?.hideExpect();
        this.minorPotUI?.hideExpect();
        this.majorPotUI?.hideExpect();
        this.grandPotUI?.hideExpect();
        this.doubleGrandPotUI?.hideExpect();
    }

    /**
     * 启动 Jackpot UI 动画（根据子游戏类型选择对应动画流程）
     */
    public startAnimation(): void {
        const self = this;

        // 先初始化所有 Pot UI
        this.miniPotUI?.initUI();
        this.minorPotUI?.initUI();
        this.majorPotUI?.initUI();
        this.grandPotUI?.initUI();
        this.doubleGrandPotUI?.initUI();

        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const currentJackpotSuperState = SlotGameResultManager.Instance.getSubGameState("jackpot_super");

        // 分支 1：下一个子游戏是普通 jackpot
        if (nextSubGameKey === "jackpot") {
            this.ui_Animation?.stop();
            this.ui_Animation?.play("JackpotUI_Idle_JackpotMode", 0);
        }
        // 分支 2：下一个子游戏是 jackpot_super（超级 Jackpot）
        else {
            // 设置自定义投注线，播放初始闲置动画
            this.ui_JackpotMoney?.setCustomBetPerLine(currentJackpotSuperState.customBetPerLine);
            this.ui_Animation?.stop();
            this.ui_Animation?.play("JackpotUI_Idle_JackpotMode", 0);

            // 延迟 0.5 秒播放 UI 切换动画，播放对应音效
            this.scheduleOnce(() => {
                self.ui_Animation?.stop();
                self.ui_Animation?.play("JackpotUI_Change_Ani", 0);
                SlotSoundController.Instance().playAudio("SuperJackpotModeUI", "FX");
            }, 0.5);
        }
    }

    /**
     * 激活对应 Jackpot Pot（更新 Pot 状态，展示选中效果）
     * @param jackpotType Jackpot 类型索引（0-3）
     * @param potIndex Pot 内部索引（标记激活状态）
     */
    public aliveJackpot(jackpotType: number, potIndex: number): void {
        let targetPotUI: JackpotModePotUI_Zhuquefortune | null = null;
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();

        // 根据当前子游戏类型，匹配对应的 Pot UI
        if (currentSubGameKey === "jackpot") {
            switch (jackpotType) {
                case 0: targetPotUI = this.miniPotUI; break;
                case 1: targetPotUI = this.minorPotUI; break;
                case 2: targetPotUI = this.majorPotUI; break;
                case 3: targetPotUI = this.grandPotUI; break;
                default: break;
            }
        } else {
            switch (jackpotType) {
                case 0: targetPotUI = this.minorPotUI; break;
                case 1: targetPotUI = this.majorPotUI; break;
                case 2: targetPotUI = this.grandPotUI; break;
                case 3: targetPotUI = this.doubleGrandPotUI; break;
                default: break;
            }
        }

        // 激活目标 Pot 的对应状态
        targetPotUI?.alivePot(potIndex);
    }

    /**
     * 播放 Jackpot 中奖 UI（展示中奖金额、播放 Pot 中奖动画、隐藏其他期望效果）
     */
    public winJackpotUI(): void {
        // 1. 获取中奖结果数据
        const jackpotResult = SlotGameResultManager.Instance.getSpinResult().jackpotResults[0];
        if (!jackpotResult) {
            cc.warn("未获取到 Jackpot 中奖结果，无法播放中奖 UI");
            return;
        }

        const jackpotSubKey = jackpotResult.jackpotSubKey;
        const winningCoin = jackpotResult.winningCoin;
        let targetPotUI: JackpotModePotUI_Zhuquefortune | null = null;

        // 2. 匹配对应的中奖 Pot UI
        switch (jackpotSubKey) {
            case "mini": targetPotUI = this.miniPotUI; break;
            case "minor": targetPotUI = this.minorPotUI; break;
            case "major": targetPotUI = this.majorPotUI; break;
            case "mega": targetPotUI = this.grandPotUI; break;
            case "grand": targetPotUI = this.doubleGrandPotUI; break;
            default: break;
        }

        // 3. 执行中奖 UI 逻辑
        targetPotUI?.winUI(); // 播放 Pot 中奖动画
        this.ui_JackpotMoney?.setPlayingState(jackpotSubKey, false); // 停止该类型金额滚动
        this.ui_JackpotMoney?.setShowingMoney(jackpotSubKey, winningCoin); // 展示最终中奖金额

        // 4. 提升中奖 Pot 节点层级（确保显示在最上层）
        if (targetPotUI && targetPotUI.node && targetPotUI.node.parent) {
            targetPotUI.node.setSiblingIndex(targetPotUI.node.parent.childrenCount - 1);
        }

        // 5. 隐藏所有未中奖 Pot 的期望显示
        this.hideExpect();
    }

    /**
     * 清除自定义投注线（重置 Jackpot 奖金显示组件的投注线配置）
     */
    public clearBetperLine(): void {
        this.ui_JackpotMoney?.clearCustomBetPerLine();
    }
}