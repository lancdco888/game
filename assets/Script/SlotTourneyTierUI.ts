import SDefine from "./global_utility/SDefine";
import UserInfo from "./User/UserInfo";
import CurrencyFormatHelper from "./global_utility/CurrencyFormatHelper";
import SlotTourneyManager from "./manager/SlotTourneyManager";
import { Utility } from "./global_utility/Utility";

const { ccclass, property } = cc._decorator;

/**
 * 老虎机锦标赛-段位UI核心子项组件
 * 每个段位对应一个该组件实例，挂载于SlotTourneyPopup中
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class SlotTourneyTierUI extends cc.Component {
    // ===================== Cocos 序列化属性 【与原JS @property 1:1精准对应，无遗漏/无错配】 =====================
    @property({ type: cc.Label, displayName: "段位最低投注金额文本" })
    public minBetLabel: cc.Label = null;

    @property({ type: cc.Label, displayName: "我的排名文本" })
    public myRankLabel: cc.Label = null;

    @property({ type: cc.Label, displayName: "总参赛人数文本" })
    public totUserCntLabel: cc.Label = null;

    @property({ type: cc.Label, displayName: "段位奖金池金额文本" })
    public prizeLabel: cc.Label = null;

    @property({ type: cc.Button, displayName: "报名参赛按钮" })
    public joinBtn: cc.Button = null;

    @property({ type: cc.Button, displayName: "金币不足按钮" })
    public insufficientMoneyBtn: cc.Button = null;

    @property({ type: cc.Button, displayName: "奖金详情按钮" })
    public infoBtn: cc.Button = null;

    @property({ type: cc.Button, displayName: "关闭详情按钮" })
    public closeInfoBtn: cc.Button = null;

    // ===================== 私有成员变量 【与原JS实例变量完全对应，补充TS强类型】 =====================
    private _tier: number = 0;
    private prizeMoney: number = 0;

    // ===================== 业务方法 【1:1完全等价还原原JS，逻辑一字不改，注释同步】 =====================
    /**
     * 初始化组件状态 - 父组件调用，初始化详情按钮默认显隐状态
     */
    public init(): void {
        this.setInfoBtnState(true);
    }

    /**
     * 核心刷新方法 - 渲染当前段位的所有数据
     * @param tierIdx 当前段位索引
     * @param tourneyInfo 锦标赛全局信息对象
     */
    public refresh(tierIdx: number, tourneyInfo: any): void {
        // 清空所有定时器，防止叠加泄漏
        this.unscheduleAllCallbacks();
        this._tier = tierIdx;

        // 获取当前段位配置+进度信息
        const tierCfg = tourneyInfo.tiers[tierIdx];
        const progressInfo = SlotTourneyManager.Instance().getSlotTourneyProgressInfo(tierIdx);

        // 初始化奖金池金额并启动定时刷新动画
        this.updatePrizeMoneyJackpotMoneyScedule();
        this.schedule(this.updatePrizeMoneyJackpotMoneyScedule, SDefine.JACKPOT_DISPLAY_DEFAULT_INTERVAL);

        // 渲染最低投注金额
        this.minBetLabel.string = CurrencyFormatHelper.formatEllipsisNumberUsingDot(tierCfg.minTotalBet);

        // 渲染排名+参赛人数
        const totalPlayer = progressInfo.totalPlayerCount;
        const userRank = progressInfo.userRank;
        this.myRankLabel.string = userRank === 0 ? "-" : `${CurrencyFormatHelper.formatNumber(userRank)}${CurrencyFormatHelper.getOrdinalNumberPostfix(userRank)}`;
        this.totUserCntLabel.string = "(%s)".format(CurrencyFormatHelper.formatNumber(totalPlayer));

        // 校验并设置报名按钮状态
        this.setJoinable(true);
        if (SlotTourneyManager.Instance().isJoinTourneyByProgressInfo() && userRank !== 0) {
            this.setJoinable(true);
        } else {
            const isEnableJoin = SlotTourneyManager.Instance().enableJoinGame(this._tier, UserInfo.instance().getTotalCoin());
            this.setJoinable(isEnableJoin);
        }
    }

    /**
     * 切换奖金详情按钮显隐状态 - 互斥显示【详情按钮/关闭按钮】
     * @param isShowInfoBtn true=显示详情按钮 false=显示关闭按钮
     */
    public setInfoBtnState(isShowInfoBtn: boolean): void {
        this.closeInfoBtn.node.active = !isShowInfoBtn;
        this.infoBtn.node.active = isShowInfoBtn;
    }

    /**
     * 定时器调度方法 - 刷新奖金池金额，带渐变动画效果
     * 调用全局工具类实现开奖跳动的数值过渡，原JS核心动画逻辑
     */
    private updatePrizeMoneyJackpotMoneyScedule(): void {
        const targetPrize = SlotTourneyManager.Instance().getTierProgressivePrize(this._tier);
        this.prizeMoney = Utility.getDisplayJackpotMoney(this.prizeMoney, targetPrize);
        this.prizeLabel.string = CurrencyFormatHelper.formatNumber(this.prizeMoney);
    }

    /**
     * 设置报名按钮交互状态 - 核心显隐规则
     * @param isJoinable true=可报名(显示报名按钮) false=金币不足(显示金币不足按钮)
     */
    public setJoinable(isJoinable: boolean): void {
        this.joinBtn.interactable = isJoinable;
        this.joinBtn.node.active = isJoinable;
        this.insufficientMoneyBtn.node.active = !isJoinable;
    }
}