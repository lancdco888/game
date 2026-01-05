// Cocos Creator 2.x 标准头部解构写法 (严格统一规范，置顶无修改)
const { ccclass, property } = cc._decorator;

// 所有依赖模块导入 - 路径与原混淆JS完全一致，无任何修改
import TSUtility from "../global_utility/TSUtility";
import LobbySlotBannerItem from "../LobbySlotBannerItem";
import SlotBannerItem from "../SlotBannerItem";

/**
 * 老虎机横幅子项 - 热门游玩(Most Played)专属版
 * 继承核心横幅基类，核心功能：固定创建6个小尺寸横幅实例，根据后台返回的热门老虎机数据自动填充，超出条数则置空占位，专用于热门游玩板块展示
 */
@ccclass
export default class LobbySlotBannerItem_MOST_PLAYED extends LobbySlotBannerItem {
    // ===================== 全局常量 (原代码完整保留，数值无修改) =====================
    public MAX_BANNER_COUNT: number = 6;

    // ===================== 序列化绑定属性 (与原代码完全一致，顺序不变，编辑器拖拽绑定) =====================
    @property(cc.Prefab)
    public prefabSmall: cc.Prefab = null!;

    @property(cc.Node)
    public nodeLayout: cc.Node = null!;

    // ===================== 成员变量 (原代码全部保留，补全精准TS类型注解，初始值完全一致) =====================
    public arrBannerItem: Array<SlotBannerItem> = [];

    // ===================== 核心初始化方法 (原逻辑完整保留，循环创建6个横幅实例，规则不变) =====================
    public initialize(): void {
        // 循环创建指定数量的小横幅实例，添加到布局节点 & 存储到数组
        for (let i = 0; i < this.MAX_BANNER_COUNT; i++) {
            const bannerItem = this.createSlotBanner(this.prefabSmall, this.nodeLayout);
            this.arrBannerItem.push(bannerItem);
        }
    }

    // ===================== 核心刷新方法 (原逻辑完整保留，数据校验+赋值规则精准还原，无任何修改) =====================
    public refresh(): void {
        // 数据有效性校验：无横幅数据/数据为空 → 所有6个横幅都置空占位
        if (!TSUtility.isValid(this.info) || this.info.arrSlotBanner.length <= 0) {
            for (let i = 0; i < this.MAX_BANNER_COUNT; i++) {
                this.setSlotBannerInfo(null, this.arrBannerItem[i]);
            }
        } 
        // 有有效数据 → 按数组下标匹配赋值，超出数据条数的横幅置空占位
        else {
            for (let i = 0; i < this.MAX_BANNER_COUNT; i++) {
                if (i < this.info.arrSlotBanner.length) {
                    this.setSlotBannerInfo(this.info.arrSlotBanner[i], this.arrBannerItem[i]);
                } else {
                    this.setSlotBannerInfo(null, this.arrBannerItem[i]);
                }
            }
        }
    }
}