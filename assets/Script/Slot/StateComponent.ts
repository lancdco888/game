const { ccclass, property } = cc._decorator;

@ccclass
export default class StateComponent extends cc.Component {
    // ===== 序列化属性 - 原JS装饰器配置【完全复刻】override+serializable 核心配置 缺一不可，默认值严格保留 =====
    @property({
        override: true,
        serializable: true
    })
    public stateName: string = "hello";

    // ===== 生命周期回调 - 原JS空方法 严格保留，一行不改 =====
    onLoad(): void { }
}