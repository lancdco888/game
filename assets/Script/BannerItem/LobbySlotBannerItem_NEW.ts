import TSUtility from "../global_utility/TSUtility";
import SlotBannerItemTag, { SlotBannerTagType } from "../SlotBannerItemTag";
import LobbySlotBannerItem from "../LobbySlotBannerItem";

const { ccclass, property } = cc._decorator;

/**
 * 老虎机大厅 - 新样式双横幅子项组件 (继承基础横幅父类)
 * LobbySlotBannerItem_NEW
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class LobbySlotBannerItem_NEW extends LobbySlotBannerItem {
    // ===================== Cocos 序列化属性 【与原JS @property 1:1精准对应，无遗漏/无错配】 =====================
    @property({ type: cc.Prefab, displayName: "新横幅预制体" })
    public prefab: cc.Prefab = null;

    @property({ type: cc.Layout, displayName: "横幅布局节点" })
    public layout: cc.Layout = null;

    // ===================== 私有成员变量 【与原JS实例变量完全对应，补充TS类型声明】 =====================
    private _itemBanner_1: any = null;
    private _itemBanner_2: any = null;

    // ===================== 核心业务方法 【1:1完全等价还原原JS，样式调整数值一字不改，复用父类公共方法】 =====================
    /**
     * 初始化组件 - 创建双横幅实例 + 添加NEW标签隐藏 + 精细调整节点样式
     * 父类公共方法 createSlotBanner 直接复用，样式调整数值(+7/-7/1.08/-16)完全保留
     */
    public initialize(): void {
        // 创建两个新横幅实例
        this._itemBanner_1 = this.createSlotBanner(this.prefab, this.layout.node);
        this._itemBanner_1.addHideTagType(SlotBannerTagType.NEW);

        this._itemBanner_2 = this.createSlotBanner(this.prefab, this.layout.node);
        this._itemBanner_2.addHideTagType(SlotBannerTagType.NEW);

        // 调整第一个横幅的标签位置 (X轴偏移 ±7像素，Y轴不变)
        this._itemBanner_1.nodeTagLeft.position = new cc.Vec2(
            this._itemBanner_1.nodeTagLeft.position.x + 7,
            this._itemBanner_1.nodeTagLeft.position.y
        );
        this._itemBanner_1.nodeTagRight.position = new cc.Vec2(
            this._itemBanner_1.nodeTagRight.position.x - 7,
            this._itemBanner_1.nodeTagRight.position.y
        );

        // 调整第二个横幅的标签位置 (X轴偏移 ±7像素，Y轴不变)
        this._itemBanner_2.nodeTagLeft.position = new cc.Vec2(
            this._itemBanner_2.nodeTagLeft.position.x + 7,
            this._itemBanner_2.nodeTagLeft.position.y
        );
        this._itemBanner_2.nodeTagRight.position = new cc.Vec2(
            this._itemBanner_2.nodeTagRight.position.x - 7,
            this._itemBanner_2.nodeTagRight.position.y
        );

        // 调整第一个横幅Jackpot父节点样式 (缩放1.08倍，Y轴向下偏移16像素)
        this._itemBanner_1.nodeJackpotParent.scale = 1.08;
        this._itemBanner_1.nodeJackpotParent.position = new cc.Vec2(
            this._itemBanner_1.nodeJackpotParent.position.x,
            this._itemBanner_1.nodeJackpotParent.position.y - 16
        );

        // 调整第二个横幅Jackpot父节点样式 (缩放1.08倍，Y轴向下偏移16像素)
        this._itemBanner_2.nodeJackpotParent.scale = 1.08;
        this._itemBanner_2.nodeJackpotParent.position = new cc.Vec2(
            this._itemBanner_2.nodeJackpotParent.position.x,
            this._itemBanner_2.nodeJackpotParent.position.y - 16
        );
    }

    /**
     * 刷新双横幅数据 - 组件核心业务方法
     * 数据合法性校验 → 给两个横幅实例分别赋值对应数组数据
     * 父类公共方法 setSlotBannerInfo 直接复用
     */
    public refresh(): void {
        if (TSUtility.isValid(this.info) && this.info.arrSlotBanner.length > 0) {
            this.setSlotBannerInfo(this.info.arrSlotBanner[0], this._itemBanner_1);
            this.setSlotBannerInfo(this.info.arrSlotBanner[1], this._itemBanner_2);
        }
    }
}