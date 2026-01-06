import TSUtility from "../global_utility/TSUtility";
import LobbySlotBannerItem from "../LobbySlotBannerItem";
import SlotBannerItem from "../SlotBannerItem";

const { ccclass, property } = cc._decorator;

/**
 * 推荐精选版Banner项组件
 * LobbySlotBannerItem_FEATURED
 * 继承自基础Banner组件 - Cocos Creator 2.4.13 完美兼容
 */
@ccclass()
export default class LobbySlotBannerItem_FEATURED extends LobbySlotBannerItem {
    // ===================== Cocos 序列化属性 【与原JS的@property完全一一对应】 =====================
    @property({
        type: cc.Prefab,
        displayName: "Banner子项预制体",
        tooltip: "老虎机Banner预制体文件"
    })
    public prefab: cc.Prefab = null;

    @property({
        type: cc.Node,
        displayName: "第一个Banner根节点",
        tooltip: "第一个Banner子项挂载父节点"
    })
    public nodeBanner_1: cc.Node = null;

    @property({
        type: cc.Node,
        displayName: "第二个Banner根节点",
        tooltip: "第二个Banner子项挂载父节点"
    })
    public nodeBanner_2: cc.Node = null;

    // ===================== 私有成员变量 【与原JS实例变量完全对应，补充TS类型】 =====================
    private _itemBanner_1: SlotBannerItem = null;
    private _itemBanner_2: SlotBannerItem = null;


    // ===================== 业务方法 【1:1等价还原原JS所有逻辑，无任何修改】 =====================
    /**
     * 初始化双Banner实例 【原JS的initialize方法】
     */
    public initialize(): void {
        this._itemBanner_1 = this.createSlotBanner(this.prefab, this.nodeBanner_1);
        this._itemBanner_2 = this.createSlotBanner(this.prefab, this.nodeBanner_2);
    }

    /**
     * 刷新双Banner数据 + 容错隐藏 【原JS的refresh方法】
     * 原JS 0 == l.default.isValid(this.info) 等价于 !TSUtility.default.isValid(this.info)，逻辑完全一致
     * 原JS的逗号表达式 转 TS标准写法，执行结果无差异
     */
    public refresh(): void {
        // 数据源无效/空数组 直接return，不执行任何渲染
        if (!TSUtility.isValid(this.info) || this.info.arrSlotBanner.length <= 0) {
            return;
        }
        
        // 必渲染第一条数据
        this.setSlotBannerInfo(this.info.arrSlotBanner[0], this._itemBanner_1);
        
        // 容错处理：数据不足2条 → 隐藏第二个Banner；反之赋值第二条数据并显示
        if (this.info.arrSlotBanner.length < 2) {
            this._itemBanner_2.node.active = false;
        } else {
            this._itemBanner_2.node.active = true;
            this.setSlotBannerInfo(this.info.arrSlotBanner[1], this._itemBanner_2);
        }
    }
}