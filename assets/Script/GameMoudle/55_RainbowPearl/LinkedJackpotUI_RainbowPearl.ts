import SlotSoundController from "../../Slot/SlotSoundController";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";

const { ccclass, property } = cc._decorator;

/**
 * RainbowPearl Linked Jackpot玩法UI组件
 * 负责：剩余旋转次数展示、UI模式切换、奖池奖金设置、各类动画/音效播放
 */
@ccclass('LinkedJackpotUI_RainbowPearl')
export default class LinkedJackpotUI_RainbowPearl extends cc.Component {
    //#region 组件引用
    /** 基础模式中间UI节点 */
    @property({ type: cc.Node })
    public uiBase: cc.Node | null = null;

    /** Linked模式中间UI节点 */
    @property({ type: cc.Node })
    public uiLinked: cc.Node | null = null;

    /** 奖池奖金金额标签 */
    @property({ type: cc.Label })
    public labelPotPrize: cc.Label | null = null;

    /** 彩虹奖池增加动画组件 */
    @property({ type: cc.Animation })
    public addRainbowPotAni: cc.Animation | null = null;

    /** 旋转次数重置动画组件 */
    @property({ type: cc.Animation })
    public resetSpinCountAni: cc.Animation | null = null;

    /** Jackpot触发动画组件 */
    @property({ type: cc.Animation })
    public jackpotTriggerAni: cc.Animation | null = null;

    /** 剩余旋转次数节点列表（1/2/3次） */
    @property({ type: [cc.Node] })
    public spinCounts: cc.Node[] = [];

    /** 剩余旋转次数为0的节点 */
    @property({ type: cc.Node })
    public spinCountZero: cc.Node | null = null;
    //#endregion

    /**
     * 展示剩余旋转次数（常规模式）
     * @param count 剩余旋转次数（0-3）
     */
    public showRemainSpins(count: number): void {
        this.hideAllSpinCounts();
        // 仅在次数为0-3时显示对应节点
        if (count >= 0 && count < 4 && this.spinCounts[count]) {
            this.spinCounts[count].active = true;
        }
    }

    /**
     * 展示Lock&Roll模式下的剩余旋转次数
     * @param count 剩余旋转次数
     */
    public showRemainSpinsStartLockandRoll(count: number): void {
        this.hideAllSpinCounts();
        if (count === 0) {
            this.spinCountZero?.active && (this.spinCountZero.active = true);
        } else if (count > 0 && count < 4 && this.spinCounts[count]) {
            this.spinCounts[count].active = true;
        }
    }

    /**
     * 隐藏所有剩余旋转次数节点
     */
    public hideAllSpinCounts(): void {
        // 隐藏1-3次旋转次数节点
        this.spinCounts.forEach(node => {
            node.active = false;
        });
        // 隐藏0次旋转次数节点
        this.spinCountZero?.active && (this.spinCountZero.active = false);
    }

    /**
     * 切换到Linked模式中间UI
     */
    public showLinkedMiddleUI(): void {
        this.uiBase?.active && (this.uiBase.active = false);
        this.uiLinked?.active && (this.uiLinked.active = true);
    }

    /**
     * 切换到基础模式中间UI
     */
    public showBaseMiddleUI(): void {
        this.uiBase?.active && (this.uiBase.active = true);
        this.uiLinked?.active && (this.uiLinked.active = false);
    }

    /**
     * 展示Linked Jackpot启动文本（奖金置0，旋转次数置0）
     */
    public showStartLinkedJackpotText(): void {
        this.labelPotPrize && (this.labelPotPrize.string = "0");
        this.showRemainSpinsStartLockandRoll(0);
    }

    /**
     * 播放初始旋转次数递增动画（0→1→2→3），配套音效
     */
    public showInitialSpins(): void {
        // 初始显示0次旋转次数
        this.showRemainSpinsStartLockandRoll(0);
        
        let currentCount = 0;
        // 每0.35秒递增一次，共执行2次（0→1→2→3）
        this.schedule(() => {
            currentCount++;
            if (currentCount === 1) {
                // 播放1次旋转次数递增音效
                SlotSoundController.Instance().playAudio("LockAndRollSpinCountIncrease1", "FX");
                this.showRemainSpins(1);
            } else if (currentCount === 2) {
                // 播放2次旋转次数递增音效
                SlotSoundController.Instance().playAudio("LockAndRollSpinCountIncrease2", "FX");
                this.showRemainSpins(2);
            } else if (currentCount === 3) {
                // 播放旋转次数重置音效
                SlotSoundController.Instance().playAudio("LockAndRollSpinCountReset", "FX");
                this.showRemainSpins(3);
            }
        }, 0.35, 2); // 间隔0.35s，重复2次（总计3次执行）
    }

    /**
     * 设置奖池奖金金额（格式化显示）
     * @param prize 奖金金额
     */
    public setPrize(prize: number): void {
        this.labelPotPrize && (this.labelPotPrize.string = CurrencyFormatHelper.formatNumber(prize));
    }

    /**
     * 播放彩虹奖池增加动画
     */
    public playRainbowPotAni(): void {
        this.addRainbowPotAni?.node && (this.addRainbowPotAni.node.active = true);
        this.addRainbowPotAni?.play();
    }

    /**
     * 隐藏并停止彩虹奖池增加动画
     */
    public hideRainbowPotAni(): void {
        this.addRainbowPotAni?.stop();
        this.addRainbowPotAni?.node && (this.addRainbowPotAni.node.active = false);
    }

    /**
     * 播放旋转次数重置动画
     */
    public playResetSpinCountAni(): void {
        this.resetSpinCountAni?.node && (this.resetSpinCountAni.node.active = true);
        this.resetSpinCountAni?.play();
    }

    /**
     * 隐藏并停止旋转次数重置动画
     */
    public hideResetSpinCountAni(): void {
        this.resetSpinCountAni?.stop();
        this.resetSpinCountAni?.node && (this.resetSpinCountAni.node.active = false);
    }

    /**
     * 播放Jackpot触发动画
     */
    public playJackpotTriggerAni(): void {
        this.jackpotTriggerAni?.node && (this.jackpotTriggerAni.node.active = true);
        this.jackpotTriggerAni?.play();
    }

    /**
     * 隐藏并停止Jackpot触发动画
     */
    public hideJackpotTriggerAni(): void {
        this.jackpotTriggerAni?.stop();
        this.jackpotTriggerAni?.node && (this.jackpotTriggerAni.node.active = false);
    }
}