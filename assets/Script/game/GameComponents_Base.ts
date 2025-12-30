const { ccclass, property } = cc._decorator;
import SlotBigWinEffectController_1022 from "../BigWinEffect/SlotBigWinEffectController_1022";
import SlotPrefabManager from "./SlotPrefabManager";

@ccclass
export default class GameComponents_Base extends cc.Component {
    // ===== 序列化属性 - 原JS @property配置100%精准复刻，类型/变量名/默认值完全一致 =====
    @property({ type: cc.Node })
    public winEffectLayer: cc.Node = null;

    @property({ type: cc.Node })
    public coinTarget: cc.Node = null;

    // ===== 私有成员变量 - 原JS隐式声明，补全精准TS类型+初始化值，变量名完全保留 =====
    private effectBigWinNew: SlotBigWinEffectController_1022 = null;

    // ===== 生命周期回调 - onLoad 原逻辑一字不改，判空顺序/实例化逻辑/节点操作 完全复刻 =====
    onLoad(): void {
        if (this.winEffectLayer) {
            const winEffectPrefab = cc.instantiate(SlotPrefabManager.Instance().getPrefab("winEffect"));
            this.winEffectLayer.addChild(winEffectPrefab);
            this.effectBigWinNew = winEffectPrefab.getComponent(SlotBigWinEffectController_1022);
        }
        // 原JS的 null != 判空写法 严格保留，不改为 !== null
        null != this.effectBigWinNew && (this.effectBigWinNew.node.active = false);
    }
}