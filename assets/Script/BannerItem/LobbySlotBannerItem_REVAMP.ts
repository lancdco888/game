// Cocos Creator 2.x 标准头部解构写法 (严格按要求置顶)
const { ccclass, property } = cc._decorator;

// 所有依赖模块导入 - 路径与原混淆JS完全一致，无任何修改
import TSUtility from "../global_utility/TSUtility";
import LobbySlotBannerItem from "../LobbySlotBannerItem";
import SlotBannerItem from "../SlotBannerItem";

/**
 * 老虎机横幅子项 改版增强版
 * 继承基础横幅项，核心扩展：动态创建横幅预制体 + 横幅标签坐标偏移优化，复用父类所有核心逻辑
 */
@ccclass
export default class LobbySlotBannerItem_REVAMP extends LobbySlotBannerItem {
    // ===================== 序列化绑定属性 (与原代码完全一致，编辑器拖拽绑定，顺序不变) =====================
    @property(cc.Prefab)
    public prefab: cc.Prefab = null;

    @property(cc.Node)
    public nodeBannerRoot: cc.Node = null;

    // ===================== 私有成员变量 (原代码全部保留，补全精准TS类型注解) =====================
    private _itemBanner: SlotBannerItem = null;

    // ===================== 核心初始化方法 (原逻辑完整保留，坐标偏移值精准还原) =====================
    public initialize(): void {
        // 基于预制体创建横幅实例并挂载到指定根节点
        this._itemBanner = this.createSlotBanner(this.prefab, this.nodeBannerRoot);
        // 核心UI优化：左侧标签X轴向左偏移10px，原数值精准保留
        this._itemBanner.nodeTagLeft.position = cc.v3(this._itemBanner.nodeTagLeft.position.x - 10, this._itemBanner.nodeTagLeft.position.y);
        // 核心UI优化：右侧标签X轴向右偏移10px，原数值精准保留
        this._itemBanner.nodeTagRight.position = cc.v3(this._itemBanner.nodeTagRight.position.x + 10, this._itemBanner.nodeTagRight.position.y);
    }

    // ===================== 核心刷新方法 (原逻辑完整保留，数据校验+赋值逻辑不变) =====================
    public refresh(): void {
        // 数据有效性校验：数据为空 / 横幅数据数组为空 → 不执行刷新
        if (!TSUtility.isValid(this.info) || this.info.arrSlotBanner.length <= 0) {
            return;
        }
        // 调用父类方法，赋值数组第一条横幅数据到当前横幅实例
        this.setSlotBannerInfo(this.info.arrSlotBanner[0], this._itemBanner);
    }
}