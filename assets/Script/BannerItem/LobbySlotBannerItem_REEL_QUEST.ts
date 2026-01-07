import TSUtility from "../global_utility/TSUtility";
import LobbySlotBannerItem from "../LobbySlotBannerItem";
import SlotBannerItem from "../SlotBannerItem";

const { ccclass, property } = cc._decorator;

/**
 * 卷轴任务专属Banner项组件
 * LobbySlotBannerItem_REEL_QUEST
 * 继承自基础Banner组件 - Cocos 2.4.13
 */
@ccclass()
export default class LobbySlotBannerItem_REEL_QUEST extends LobbySlotBannerItem {
    // ===================== Cocos 序列化属性 【完全对应原JS的@property】 =====================
    @property({
        type: cc.Prefab,
        displayName: "Banner子项预制体",
        tooltip: "老虎机Banner的预制体文件"
    })
    public prefab: cc.Prefab = null;

    @property({
        type: cc.Node,
        displayName: "Banner根节点",
        tooltip: "Banner子项挂载的父节点"
    })
    public nodeBannerRoot: cc.Node = null;

    // ===================== 私有成员变量 【完全对应原JS的实例变量】 =====================
    private _itemBanner: SlotBannerItem = null;

    // ===================== 生命周期 & 业务方法 【1:1还原原JS逻辑】 =====================
    /**
     * 初始化Banner实例 + 样式偏移 【原JS的initialize方法】
     */
    public initialize(): void {
        this._itemBanner = this.createSlotBanner(this.prefab, this.nodeBannerRoot);
        // 左侧标签X轴左移 10px - 原JS的-10参数完全保留
        this._itemBanner.nodeTagLeft.position = cc.v3(this._itemBanner.nodeTagLeft.position.x - 10, this._itemBanner.nodeTagLeft.position.y);
        // 右侧标签X轴右移 10px - 原JS的+10参数完全保留
        this._itemBanner.nodeTagRight.position = cc.v3(this._itemBanner.nodeTagRight.position.x + 10, this._itemBanner.nodeTagRight.position.y);
    }

    /**
     * 刷新Banner数据 【原JS的refresh方法】
     * 原JS的短路逻辑：0 == isValid → 等价于 !isValid，完全还原
     */
    public refresh(): void {
        if (!TSUtility.isValid(this.info) || this.info.arrSlotBanner.length <= 0) {
            return;
        }
        // 只渲染第一条数据，原JS的 arrSlotBanner[0] 逻辑不变
        this.setSlotBannerInfo(this.info.arrSlotBanner[0], this._itemBanner);
    }
}