import CurrencyFormatHelper from '../../global_utility/CurrencyFormatHelper';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import TopDollarComponent_HundredDollar from './TopDollarComponent_HundredDollar';


const { ccclass, property } = cc._decorator;

/**
 * 百元老虎机顶部UI组件
 * 负责管理顶部金额标签、美元动画、倍率显示等核心UI逻辑
 */
@ccclass('TopUI_HundredDollar')
export default class TopUI_HundredDollar extends cc.Component {
    /** 美元动画组件（包含入场/闲置/重试/中奖等动画剪辑） */
    @property({
        type: cc.Animation,
        displayName: "美元动画组件"
    })
    public dollarAnimation: cc.Animation | null = null;

    /** 黑色美元节点数组（未激活状态） */
    @property({
        type: [cc.Node],
        displayName: "黑色美元节点"
    })
    public blackDollars: cc.Node[] = [];

    /** 高亮美元节点数组（激活状态） */
    @property({
        type: [cc.Node],
        displayName: "高亮美元节点"
    })
    public brightDollars: cc.Node[] = [];

    /** 倍率高亮节点数组（2倍/4倍） */
    @property({
        type: [cc.Node],
        displayName: "倍率高亮节点"
    })
    public brightMultiplier: cc.Node[] = [];

    /** 100档位金额标签数组 */
    @property({
        type: [cc.Label],
        displayName: "100档位金额标签"
    })
    public labels_100: cc.Label[] = [];

    /** 50档位金额标签数组 */
    @property({
        type: [cc.Label],
        displayName: "50档位金额标签"
    })
    public labels_50: cc.Label[] = [];

    /** 20档位金额标签数组 */
    @property({
        type: [cc.Label],
        displayName: "20档位金额标签"
    })
    public labels_20: cc.Label[] = [];

    /** 10档位金额标签数组 */
    @property({
        type: [cc.Label],
        displayName: "10档位金额标签"
    })
    public labels_10: cc.Label[] = [];

    /** 4档位金额标签数组 */
    @property({
        type: [cc.Label],
        displayName: "4档位金额标签"
    })
    public labels_4: cc.Label[] = [];

    /** 2档位金额标签数组 */
    @property({
        type: [cc.Label],
        displayName: "2档位金额标签"
    })
    public labels_2: cc.Label[] = [];

    /** 100档位美元组件数组 */
    @property({
        type: [TopDollarComponent_HundredDollar],
        displayName: "100档位美元组件"
    })
    public dollars_100: TopDollarComponent_HundredDollar[] = [];

    /** 50档位美元组件数组 */
    @property({
        type: [TopDollarComponent_HundredDollar],
        displayName: "50档位美元组件"
    })
    public dollars_50: TopDollarComponent_HundredDollar[] = [];

    /** 20档位美元组件数组 */
    @property({
        type: [TopDollarComponent_HundredDollar],
        displayName: "20档位美元组件"
    })
    public dollars_20: TopDollarComponent_HundredDollar[] = [];

    /** 10档位美元组件数组 */
    @property({
        type: [TopDollarComponent_HundredDollar],
        displayName: "10档位美元组件"
    })
    public dollars_10: TopDollarComponent_HundredDollar[] = [];

    /** 4档位美元组件数组 */
    @property({
        type: [TopDollarComponent_HundredDollar],
        displayName: "4档位美元组件"
    })
    public dollars_4: TopDollarComponent_HundredDollar[] = [];

    /** 2档位美元组件数组 */
    @property({
        type: [TopDollarComponent_HundredDollar],
        displayName: "2档位美元组件"
    })
    public dollars_2: TopDollarComponent_HundredDollar[] = [];

    // 内部奖励档位列表（2/4/10/20/50/100 或 3/6/15/30/100/200）
    public _listReward: number[] = [];

    /**
     * 初始化UI控制逻辑
     */
    initControl(): void {
        // 根据是否动态slot初始化奖励档位列表
        const slotId = SlotGameRuleManager.Instance.slotID;
        this._listReward = TSUtility.isDynamicSlot(slotId) 
            ? [3, 6, 15, 30, 100, 200] 
            : [2, 4, 10, 20, 50, 100];

        // 绑定金额变更事件
        this.node.on("changeMoneyState", this.changeMoneyState.bind(this));
        // 添加到游戏规则管理器的观察者列表
        SlotGameRuleManager.Instance.addObserver(this.node);
        // 初始化金额显示
        this.changeMoneyState();
    }

    /**
     * 更新各档位金额标签显示（根据总投注额计算）
     * @param event 事件参数（可选）
     */
    changeMoneyState(event?: Event): void {
        const totalBet = SlotGameRuleManager.Instance.getTotalBet();

        // 更新2档位金额标签
        this.labels_2.forEach((label, index) => {
            if (label) {
                label.string = CurrencyFormatHelper.formatEllipsisNumberUsingDot(totalBet * this._listReward[0]);
            } else {
                cc.warn(`TopUI: 2档位金额标签索引 ${index} 未配置`);
            }
        });

        // 更新4档位金额标签
        this.labels_4.forEach((label, index) => {
            if (label) {
                label.string = CurrencyFormatHelper.formatEllipsisNumberUsingDot(totalBet * this._listReward[1]);
            } else {
                cc.warn(`TopUI: 4档位金额标签索引 ${index} 未配置`);
            }
        });

        // 更新10档位金额标签
        this.labels_10.forEach((label, index) => {
            if (label) {
                label.string = CurrencyFormatHelper.formatEllipsisNumberUsingDot(totalBet * this._listReward[2]);
            } else {
                cc.warn(`TopUI: 10档位金额标签索引 ${index} 未配置`);
            }
        });

        // 更新20档位金额标签
        this.labels_20.forEach((label, index) => {
            if (label) {
                label.string = CurrencyFormatHelper.formatEllipsisNumberUsingDot(totalBet * this._listReward[3]);
            } else {
                cc.warn(`TopUI: 20档位金额标签索引 ${index} 未配置`);
            }
        });

        // 更新50档位金额标签
        this.labels_50.forEach((label, index) => {
            if (label) {
                label.string = CurrencyFormatHelper.formatEllipsisNumberUsingDot(totalBet * this._listReward[4]);
            } else {
                cc.warn(`TopUI: 50档位金额标签索引 ${index} 未配置`);
            }
        });

        // 更新100档位金额标签
        this.labels_100.forEach((label, index) => {
            if (label) {
                label.string = CurrencyFormatHelper.formatEllipsisNumberUsingDot(totalBet * this._listReward[5]);
            } else {
                cc.warn(`TopUI: 100档位金额标签索引 ${index} 未配置`);
            }
        });
    }

    /**
     * 播放入场动画
     */
    playEnterAni(): void {
        this.playTargetAnimation("Enter_Fx", "Enter_Fx_suite");
    }

    /**
     * 播放开始动画
     */
    playStartAni(): void {
        this.playTargetAnimation("Enter_Fx", "Enter_Fx_suite");
    }

    /**
     * 播放闲置动画
     */
    playIdleAni(): void {
        this.playTargetAnimation("Idle_Fx", "Idle_Fx_suite");
    }

    /**
     * 播放重试动画
     */
    playRetryAni(): void {
        this.playTargetAnimation("Retry_Fx", "Retry_Fx_suite");
    }

    /**
     * 播放中奖动画
     */
    playWinAni(): void {
        this.playTargetAnimation("Win_Fx", "Win_Fx_suite");
    }

    /**
     * 停止所有动画并重置UI状态
     */
    stopAni(): void {
        if (this.dollarAnimation) {
            this.dollarAnimation.stop();
        }

        // 显示所有黑色美元节点
        this.blackDollars.forEach((node, index) => {
            if (node) {
                node.active = true;
            } else {
                cc.warn(`TopUI: 黑色美元节点索引 ${index} 未配置`);
            }
        });

        // 隐藏所有高亮美元节点
        this.brightDollars.forEach((node, index) => {
            if (node) {
                node.active = false;
            } else {
                cc.warn(`TopUI: 高亮美元节点索引 ${index} 未配置`);
            }
        });

        // 隐藏倍率高亮节点
        if (this.brightMultiplier[0]) {
            this.brightMultiplier[0].active = false;
        }
        if (this.brightMultiplier[1]) {
            this.brightMultiplier[1].active = false;
        }
    }

    /**
     * 通用动画播放方法（根据是否动态slot选择动画剪辑）
     * @param normalAni 普通slot动画名
     * @param dynamicAni 动态slot动画名
     */
    private playTargetAnimation(normalAni: string, dynamicAni: string): void {
        if (!this.dollarAnimation) {
            cc.warn("TopUI: 美元动画组件未挂载，无法播放动画");
            return;
        }

        // 根据是否动态slot选择动画剪辑
        const slotId = SlotGameRuleManager.Instance.slotID;
        const aniName = TSUtility.isDynamicSlot(slotId) ? dynamicAni : normalAni;

        // 停止当前动画并播放目标动画
        this.dollarAnimation.stop();
        this.dollarAnimation.play(aniName);
    }

    /**
     * 组件销毁时清理资源
     */
    onDestroy(): void {
        // 解绑事件
        this.node.off("changeMoneyState", this.changeMoneyState.bind(this));
        // 移除观察者
        SlotGameRuleManager.Instance.removeObserver(this.node);
    }
}