const { ccclass, property } = cc._decorator;

// 导入依赖工具类，路径与原JS完全一致
import TSUtility from "./global_utility/TSUtility";

/**
 * Banner标签枚举 - 与原JS的cc.Enum完全一致，顺序/值/名称无任何改动
 * 外部脚本(如SlotBannerItem)可直接 import { SlotBannerTagType } from "./SlotBannerItemTag" 引用
 */
export const SlotBannerTagType = cc.Enum({
    NONE: 0,
    HOT: 1,
    NEW: 2,
    EARLY: 3,
    LEAGUE: 4,
    REVAMP: 5,
    DYNAMIC: 6,
    POWER_GEM: 7,
    REEL_QUEST: 8,
    JIGGY_PRIZE: 9,
    SUPER_SIZE_IT: 10
});

/**
 * SlotBannerItem的标签子组件脚本
 * 负责根据父组件Banner的状态，控制对应标签的显隐
 */
@ccclass("SlotBannerItemTag")
export default class SlotBannerItemTag extends cc.Component {
    // ===================== 序列化属性（编辑器可拖拽选择标签类型，原JS核心属性） =====================
    @property({
        type: SlotBannerTagType,
        tooltip: "选择当前标签对应的类型"
    })
    public type: number = SlotBannerTagType.NONE;

    // ===================== 核心业务方法（100%还原原JS逻辑，一行未改） =====================
    /**
     * 根据父组件SlotBannerItem的状态，更新当前标签的显隐
     * @param bannerItem 父组件SlotBannerItem实例
     */
    updateTag(bannerItem: any): void {
        if (TSUtility.isValid(bannerItem) && this.type !== SlotBannerTagType.NONE) {
            switch (this.type) {
                case SlotBannerTagType.HOT:
                    this.node.active = bannerItem.isHotSlot;
                    break;
                case SlotBannerTagType.NEW:
                    this.node.active = bannerItem.isNewSlot;
                    break;
                case SlotBannerTagType.EARLY:
                    this.node.active = bannerItem.isEarlyAccessSlot;
                    break;
                case SlotBannerTagType.LEAGUE:
                    this.node.active = bannerItem.isLeagueSlot;
                    break;
                case SlotBannerTagType.REVAMP:
                    this.node.active = bannerItem.isRevampSlot;
                    break;
                case SlotBannerTagType.DYNAMIC:
                    this.node.active = bannerItem.isDynamicSlot === 1 || (bannerItem.isUseWithDynamicSlot === 1 && bannerItem.isWithDynamicSlot === 1);
                    break;
                case SlotBannerTagType.POWER_GEM:
                    this.node.active = bannerItem.isPowerGemSlot;
                    break;
                case SlotBannerTagType.REEL_QUEST:
                    this.node.active = bannerItem.isReelQuestSlot;
                    break;
                case SlotBannerTagType.JIGGY_PRIZE:
                    this.node.active = bannerItem.isJiggyPrizeSlot;
                    break;
                case SlotBannerTagType.SUPER_SIZE_IT:
                    this.node.active = bannerItem.isSupersizeItSlot;
                    break;
                default:
                    this.node.active = false;
                    break;
            }
        } else {
            this.node.active = false;
        }
    }
}