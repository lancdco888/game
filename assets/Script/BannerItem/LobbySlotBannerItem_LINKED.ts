import TSUtility from "../global_utility/TSUtility";
import ServiceSlotDataManager, { SlotBannerFrameType } from "../manager/ServiceSlotDataManager";
import LobbyBannerLinkedInfo from "../Lobby/LobbyBannerLinkedInfo";
import LobbySlotBannerItem from "../LobbySlotBannerItem";

const { ccclass, property } = cc._decorator;

/**
 * 老虎机大厅 - 关联横幅子项组件 (继承基础横幅父类)
 * LobbySlotBannerItem_LINKED
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class LobbySlotBannerItem_LINKED extends LobbySlotBannerItem {
    // ===================== Cocos 序列化属性 【与原JS @property 1:1精准对应，无遗漏/无错配】 =====================
    @property({ type: cc.Prefab, displayName: "横幅预制体" })
    public prefab: cc.Prefab = null;

    @property({ type: LobbyBannerLinkedInfo, displayName: "蓝色帧类型-关联横幅组件" })
    public infoLinkedBlue: LobbyBannerLinkedInfo = null;

    @property({ type: LobbyBannerLinkedInfo, displayName: "黄色帧类型-关联横幅组件" })
    public infoLinkedYellow: LobbyBannerLinkedInfo = null;

    // ===================== 私有成员变量 【与原JS实例变量完全对应，补充TS类型声明】 =====================
    private _infoLinked: any = null;

    // ===================== 核心业务方法 【1:1完全等价还原原JS，逻辑一字不改，父类属性直接复用】 =====================
    /**
     * 刷新横幅数据 - 组件唯一核心业务方法
     * 校验数据合法性 → 判断帧类型 → 显隐对应横幅组件 → 初始化横幅数据
     */
    public refresh(): void {
        // 多层数据合法性校验，防止空数据报错（原JS核心健壮性逻辑，完整保留）
        if (TSUtility.isValid(this.info) && TSUtility.isValid(this.info.data)) {
            this._infoLinked = this.info.data;
            if (TSUtility.isValid(this._infoLinked)) {
                // 蓝/黄帧类型 互斥显隐 - 核心渲染规则
                this.infoLinkedBlue.node.active = this._infoLinked.eFrameType === SlotBannerFrameType.BLUE;
                this.infoLinkedYellow.node.active = this._infoLinked.eFrameType === SlotBannerFrameType.YELLOW;

                // 初始化对应帧类型的横幅数据
                if (this.infoLinkedBlue.node.active) {
                    this.infoLinkedBlue.initialize(this._infoLinked);
                } else if (this.infoLinkedYellow.node.active) {
                    this.infoLinkedYellow.initialize(this._infoLinked);
                }
            }
        }
    }
}