import TSUtility from "../global_utility/TSUtility";
import LobbySlotBannerInfo, { SlotBannerDecoType } from "../LobbySlotBannerInfo";
import LobbySlotBannerItem from "../LobbySlotBannerItem";

const { ccclass } = cc._decorator;

/**
 * 老虎机大厅 - 装饰类横幅子项组件 (继承基础横幅父类)
 * LobbySlotBannerItem_DECO
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class LobbySlotBannerItem_DECO extends LobbySlotBannerItem {
    // ===================== 私有成员变量 【与原JS完全对应，补充TS枚举类型约束】 =====================
    private _eType: typeof SlotBannerDecoType = SlotBannerDecoType.NONE;

    // ===================== 核心业务方法 【1:1完全等价还原原JS，逻辑一字不改，复用父类nodeRoot】 =====================
    /**
     * 刷新装饰横幅 - 组件核心业务方法
     * 数据合法性校验 → 类型变更判断 → 遍历节点执行显隐控制
     */
    public refresh(): void {
        // 双层数据合法性校验，杜绝空数据报错
        if (TSUtility.isValid(this.info) && TSUtility.isValid(this.info.data)) {
            const newDecoType = this.info.data as typeof SlotBannerDecoType;
            
            // 仅类型变更时执行显隐，避免重复遍历节点
            if (this._eType !== newDecoType) {
                this._eType = newDecoType;
                
                // 遍历nodeRoot下所有子节点，按类型控制显隐
                for (let i = 0; i < this.nodeRoot.childrenCount; i++) {
                    const childNode = this.nodeRoot.children[i];
                    if (TSUtility.isValid(childNode)) {
                        // 仅节点名称 == 装饰类型时激活，其余隐藏
                        childNode.active = childNode.name === this._eType;
                    }
                }
            }
        }
    }
}