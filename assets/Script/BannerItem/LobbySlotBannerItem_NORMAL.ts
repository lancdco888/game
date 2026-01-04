// Cocos Creator 2.x 标准头部解构写法 (严格按要求置顶，语法统一)
const { ccclass, property } = cc._decorator;

// 所有依赖模块导入 - 路径与原混淆JS完全一致，无任何修改
import TSUtility from "../global_utility/TSUtility";
import LobbySlotBannerItem from "../LobbySlotBannerItem";
import SlotBannerItem from "../SlotBannerItem";

/**
 * 老虎机横幅子项 - 标准普通版 (核心布局组件)
 * 继承基础横幅项，核心功能：动态创建【双小横幅+单长横幅】组合布局，根据横幅数据数量自动切换显示规则
 */
@ccclass
export default class LobbySlotBannerItem_NORMAL extends LobbySlotBannerItem {
    // ===================== 序列化绑定属性 (与原代码完全一致，顺序不变，编辑器拖拽绑定) =====================
    @property(cc.Prefab)
    public prefabSmall: cc.Prefab = null!;

    @property(cc.Prefab)
    public prefabLong: cc.Prefab = null!;

    @property(cc.Node)
    public nodeSmallBanner_1: cc.Node = null!;

    @property(cc.Node)
    public nodeSmallBanner_2: cc.Node = null!;

    @property(cc.Node)
    public nodeLongBanner_1: cc.Node = null!;

    // ===================== 私有成员变量 (原代码全部保留，补全精准TS类型注解，初始值完全一致) =====================
    private _itemBannerSmall_1: SlotBannerItem = null!;
    private _itemBannerSmall_2: SlotBannerItem = null!;
    private _itemBannerLong: SlotBannerItem = null!;

    // ===================== 核心初始化方法 (原逻辑完整保留，动态创建3个横幅实例) =====================
    public initialize(): void {
        // 基于小横幅预制体，在指定节点创建两个小横幅实例
        this._itemBannerSmall_1 = this.createSlotBanner(this.prefabSmall, this.nodeSmallBanner_1);
        this._itemBannerSmall_2 = this.createSlotBanner(this.prefabSmall, this.nodeSmallBanner_2);
        // 基于长横幅预制体，在指定节点创建一个长横幅实例
        this._itemBannerLong = this.createSlotBanner(this.prefabLong, this.nodeLongBanner_1);
    }

    // ===================== 核心刷新方法 (原逻辑完整保留，核心显示规则精准还原，无任何修改) =====================
    public refresh(): void {
        // 数据有效性校验：数据为空 / 横幅数据数组为空 → 不执行刷新
        if (!TSUtility.isValid(this.info) || this.info.arrSlotBanner.length <= 0) {
            return;
        }
        
        // ✅ 核心显示规则 - 原代码逻辑一字未改：
        // 规则1: 横幅数据只有1条 → 显示【长横幅】，隐藏两个小横幅
        // 规则2: 横幅数据有2条 → 显示【两个小横幅】，隐藏长横幅
        this._itemBannerLong.node.active = this.info.arrSlotBanner.length === 1;
        this._itemBannerSmall_1.node.active = this.info.arrSlotBanner.length === 2;
        this._itemBannerSmall_2.node.active = this.info.arrSlotBanner.length === 2;

        // 按数据数量给对应横幅赋值数据
        if (this.info.arrSlotBanner.length === 1) {
            this.setSlotBannerInfo(this.info.arrSlotBanner[0], this._itemBannerLong);
        } else {
            this.setSlotBannerInfo(this.info.arrSlotBanner[0], this._itemBannerSmall_1);
            this.setSlotBannerInfo(this.info.arrSlotBanner[1], this._itemBannerSmall_2);
        }
    }
}