import CurrencyFormatHelper from "./global_utility/CurrencyFormatHelper";
// import PrizeCardPackItem from "../StarCollection/StarAlbum/PrizeCardPackItem";

const { ccclass, property } = cc._decorator;

/**
 * 老虎机锦标赛奖金详情-最小渲染子项
 * SlotTourneyPrizeInfo
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class SlotTourneyPrizeInfo extends cc.Component {
    // ===================== Cocos 序列化属性 【与原JS @property 1:1精准对应，无遗漏】 =====================
    @property({ type: cc.Node, displayName: "有奖励根节点" })
    public prizeNode: cc.Node = null;

    @property({ type: cc.Node, displayName: "无奖励占位节点" })
    public notPrizeNode: cc.Node = null;

    @property({ type: cc.Label, displayName: "金币奖励文本" })
    public prizeLabel: cc.Label = null;

    @property({ type: cc.Label, displayName: "无金币奖励文本" })
    public noPrizeLabel: cc.Label = null;

    // @property({ type: PrizeCardPackItem, displayName: "卡牌礼包信息组件" })
    // public cardPackInfo: PrizeCardPackItem = null;

    // ===================== 业务方法 【1:1完全等价还原原JS，逻辑一字不改】 =====================
    /**
     * 初始化方法 - 父组件调用，原JS为空方法，保留空实现不删除
     */
    public init(): void { }

    /**
     * 核心渲染方法 - 控制所有UI显隐+数据赋值，原JS的核心逻辑完全照搬
     * @param coinReward 金币奖励金额 (-1 = 无奖励，0 = 有奖励但无金币，>0 = 有金币奖励)
     * @param cardRarity 卡牌稀有度
     * @param cardCount 卡牌数量
     * @param isHeroCard 是否为英雄卡牌标识
     */
    public setInfo(coinReward: number, cardRarity: number, cardCount: number, isHeroCard: boolean): void {
        // 优先级1：金币<0 → 无奖励，显示占位节点
        if (coinReward < 0) {
            this.prizeNode.active = false;
            this.notPrizeNode.active = true;
        } 
        // 优先级2：金币≥0 → 有奖励，显示奖励节点
        else {
            this.prizeNode.active = true;
            this.notPrizeNode.active = false;

            // 子规则1：金币=0 → 无金币奖励，显示对应文本
            if (coinReward === 0) {
                this.prizeLabel.node.active = false;
                this.noPrizeLabel.node.active = true;
            } 
            // 子规则2：金币>0 → 显示格式化后的金币数值
            else {
                this.prizeLabel.node.active = true;
                this.noPrizeLabel.node.active = false;
                this.prizeLabel.string = CurrencyFormatHelper.formatEllipsisNumberToFixed(coinReward, 0);
            }

            // // 卡牌礼包渲染规则：数量为0则隐藏，反之赋值渲染
            // if (cardCount === 0) {
            //     this.cardPackInfo.node.active = false;
            // } else {
            //     this.cardPackInfo.node.active = true;
            //     this.cardPackInfo.setInfo(cardRarity, cardCount);
            //     this.cardPackInfo.setHeroMark(isHeroCard);
            // }
        }
    }
}