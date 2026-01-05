// Cocos Creator 2.x 标准头部解构写法 (严格统一规范，置顶无修改)
const { ccclass, property } = cc._decorator;

// 所有依赖模块导入 - 路径与原混淆JS完全一致，无任何修改
import TSUtility from "../global_utility/TSUtility";
import LobbySlotBannerItem from "../LobbySlotBannerItem";
import SlotBannerItem from "../SlotBannerItem";

/**
 * 老虎机横幅子项 - SUPERSIZE_IT 活动专属版
 * 继承基础横幅基类，核心扩展：创建独立横幅实例 + 横幅左右标签坐标偏移UI优化，专用于SupersizeIt活动场景展示
 */
@ccclass
export default class LobbySlotBannerItem_SUPERSIZE_IT extends LobbySlotBannerItem {
    // ===================== 序列化绑定属性 (与原代码完全一致，顺序不变，编辑器拖拽绑定) =====================
    @property(cc.Prefab)
    public prefab: cc.Prefab = null!;

    @property(cc.Node)
    public nodeBannerRoot: cc.Node = null!;

    // ===================== 私有成员变量 (原代码全部保留，补全精准TS类型注解，初始值完全一致) =====================
    private _itemBanner: SlotBannerItem = null!;

    // ===================== 核心初始化方法 (原逻辑完整保留，像素级还原坐标偏移核心UI调整) =====================
    public initialize(): void {
        // 基于指定预制体，在根节点创建横幅实例
        this._itemBanner = this.createSlotBanner(this.prefab, this.nodeBannerRoot);
        // ✅ 原代码核心UI调整：左侧标签X轴向左偏移10px，Y轴不变
        this._itemBanner.nodeTagLeft.position = cc.v3(this._itemBanner.nodeTagLeft.position.x - 10, this._itemBanner.nodeTagLeft.position.y);
        // ✅ 原代码核心UI调整：右侧标签X轴向右偏移10px，Y轴不变
        this._itemBanner.nodeTagRight.position = cc.v3(this._itemBanner.nodeTagRight.position.x + 10, this._itemBanner.nodeTagRight.position.y);
    }

    // ===================== 核心刷新方法 (原逻辑完整保留，数据校验+赋值规则完全一致) =====================
    public refresh(): void {
        // 数据有效性安全校验：数据为空 / 横幅数据数组为空 → 直接终止刷新逻辑
        if (!TSUtility.isValid(this.info) || this.info.arrSlotBanner.length <= 0) {
            return;
        }
        // 绑定数组第一条横幅数据到当前横幅实例
        this.setSlotBannerInfo(this.info.arrSlotBanner[0], this._itemBanner);
    }
}