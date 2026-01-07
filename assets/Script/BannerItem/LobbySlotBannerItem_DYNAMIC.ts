import TSUtility from "../global_utility/TSUtility";
import SlotBannerItemTag, { SlotBannerTagType } from "../SlotBannerItemTag";
import LobbySlotBannerItem from "../LobbySlotBannerItem";

const { ccclass, property } = cc._decorator;

/**
 * 老虎机大厅 - 动态双横幅子项组件 (继承基础横幅父类)
 * LobbySlotBannerItem_DYNAMIC
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class LobbySlotBannerItem_DYNAMIC extends LobbySlotBannerItem {
    // ===================== Cocos 序列化属性 【与原JS @property 1:1精准对应，无遗漏/无错配】 =====================
    @property({ type: cc.Prefab, displayName: "小横幅预制体" })
    public prefab: cc.Prefab = null;

    @property({ type: cc.Node, displayName: "第一个小横幅挂载节点" })
    public nodeSmallBanner_1: cc.Node = null;

    @property({ type: cc.Node, displayName: "第二个小横幅挂载节点" })
    public nodeSmallBanner_2: cc.Node = null;

    // ===================== 私有成员变量 【与原JS实例变量完全对应，补充TS类型声明】 =====================
    private _itemBanner_1: any = null;
    private _itemBanner_2: any = null;

    // ===================== 核心业务方法 【1:1完全等价还原原JS，逻辑一字不改，复用父类公共方法】 =====================
    /**
     * 初始化组件 - 创建双横幅实例 + 添加联赛标签隐藏规则
     * 父类公共方法 createSlotBanner 直接复用，无需重写
     */
    public initialize(): void {
        this._itemBanner_1 = this.createSlotBanner(this.prefab, this.nodeSmallBanner_1);
        this._itemBanner_1.addHideTagType(SlotBannerTagType.LEAGUE);

        this._itemBanner_2 = this.createSlotBanner(this.prefab, this.nodeSmallBanner_2);
        this._itemBanner_2.addHideTagType(SlotBannerTagType.LEAGUE);
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