import UserInven, { CardPackItemInfo } from "./User/UserInven";
import SlotTourneyManager from "./manager/SlotTourneyManager";
import SlotTourneyPrizeInfo from "./SlotTourneyPrizeInfo";

const { ccclass, property } = cc._decorator;

/**
 * 老虎机锦标赛奖金详情子弹窗
 * SlotTourneyPrizeInfoPopup
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class SlotTourneyPrizeInfoPopup extends cc.Component {
    // ===================== Cocos 序列化属性 【与原JS @property 1:1完全对应，无遗漏/无新增】 =====================
    @property({ type: cc.Label, displayName: "参赛所需金额文本" })
    public requireMoneyLabel: cc.Label = null;

    @property({ type: SlotTourneyPrizeInfo, displayName: "奖金项模板预制体" })
    public prizeInfoTemplate: SlotTourneyPrizeInfo = null;

    @property({ type: [cc.Node], displayName: "段位背景节点数组" })
    public bgNodes: Array<cc.Node> = [];

    // ===================== 私有成员变量 【与原JS实例变量完全对应，补充TS类型声明】 =====================
    private _prizeInfos: Array<SlotTourneyPrizeInfo> = [];

    // ===================== 核心业务方法 【1:1等价还原原JS所有逻辑，无任何修改】 =====================
    /**
     * 打开奖金详情弹窗 - 核心入口
     * @param tierIdx 锦标赛段位索引
     * @param tourneyInfo 锦标赛全局信息对象
     */
    public open(tierIdx: number, tourneyInfo: any): void {
        this.node.active = true;
        // 根据段位索引显示对应背景，其余隐藏
        for (let i = 0; i < this.bgNodes.length; ++i) {
            this.bgNodes[i].active = i === tierIdx;
        }
        // 首次打开初始化奖金项模板
        if (this._prizeInfos.length === 0) {
            this.init();
        }
        // 获取对应段位的赛事进度信息
        const progressInfo = SlotTourneyManager.Instance().getSlotTourneyProgressInfo(tierIdx);
        // 刷新奖金数据渲染
        this.refresh(tierIdx, progressInfo.totalPrize, tourneyInfo, progressInfo);
    }

    /**
     * 初始化奖金项模板 - 实例化6个奖金项预制体，复用渲染【只执行一次】
     */
    public init(): void {
        const parentNode = this.prizeInfoTemplate.node.parent;
        this.prizeInfoTemplate.node.active = false; // 隐藏模板节点
        
        // 固定创建6个奖金项，原JS硬编码6次，完全保留
        for (let i = 0; i < 6; ++i) {
            const prizeItemIns = cc.instantiate(this.prizeInfoTemplate.node);
            const prizeItemCom = prizeItemIns.getComponent(SlotTourneyPrizeInfo);
            
            parentNode.addChild(prizeItemIns);
            prizeItemIns.active = true;
            prizeItemIns.setPosition(cc.Vec2.ZERO);
            
            prizeItemCom.init();
            this._prizeInfos.push(prizeItemCom);
        }
    }

    /**
     * 核心刷新方法 - 计算并渲染对应段位的所有奖金/奖励项
     * 完全还原原JS的奖金计算规则、奖励卡片逻辑、显示隐藏规则
     */
    public refresh(tierIdx: number, totalPrize: number, tourneyInfo: any, progressInfo: any): void {
        // 渲染参赛所需金额
        this.requireMoneyLabel.string = SlotTourneyManager.Instance().getCheckMoneyStr(tierIdx);
        
        const totalPlayerCount = progressInfo.totalPlayerCount;
        // 遍历6个奖金项，按需渲染
        for (let i = 0; i < this._prizeInfos.length; ++i) {
            const rank = i + 1;
            // 显示规则：非最后一名 或 总参赛人数≥55 才显示
            const isShow = i !== this._prizeInfos.length - 1 || totalPlayerCount >= 55;

            if (rank <= totalPlayerCount && isShow) {
                this._prizeInfos[i].node.active = true;
                // 获取对应排名的奖励配置
                const rewardInfo = tourneyInfo.getServerSlotTourneyRewardInfo(i);
                // 计算该排名的金币奖励
                const coinReward = totalPrize * tourneyInfo.getRewardCoinRate(rank, totalPlayerCount);
                
                // 卡牌奖励信息解析
                let cardRarity = 0;
                let cardCount = 0;
                let isHeroCard = false;
                if (rewardInfo.relationInfos.length > 0) {
                    const cardInfo = rewardInfo.relationInfos[0];
                    cardRarity = CardPackItemInfo.getItemRarity(cardInfo.itemId);
                    cardCount = cardInfo.addCnt;
                    isHeroCard = CardPackItemInfo.hasHero(cardInfo.itemId);
                }
                // 赋值奖金+卡牌信息
                this._prizeInfos[i].setInfo(coinReward, cardRarity, cardCount, isHeroCard);
            } else {
                // 不满足显示条件，隐藏奖金项
                this._prizeInfos[i].setInfo(-1, null, null, null);
            }
        }
    }

    /**
     * 关闭奖金详情弹窗 - 极简隐藏逻辑，与原JS一致
     */
    public close(): void {
        this.node.active = false;
    }
}