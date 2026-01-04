const { ccclass, property } = cc._decorator;

/**
 * 序列化配置数据类 - 节点初始化属性配置项
 * 原代码内部的 InitData 嵌套类，完整保留所有序列化字段
 */
@ccclass("InitData")
export class InitData {
    @property({ tooltip: "需要初始化的节点属性名" })
    public property: string = "";

    @property({ tooltip: "初始化的属性值" })
    public initValue: number = 0;
}

/**
 * 节点属性初始化组件
 * 核心作用：预制体初始化时，根据配置自动设置节点的 透明度/缩放/显隐/宽度适配画布 等属性
 */
@ccclass
export default class InitDataPopup extends cc.Component {
    /** 序列化配置数组 - 挂载多个节点初始化配置项 */
    @property([InitData])
    public values: InitData[] = [];

    // ===================== 核心对外调用方法 (原逻辑完整保留) =====================
    /**
     * 初始化节点属性的入口方法
     * 遍历配置项，根据 property 字段自动赋值对应节点属性
     */
    public initNodeProperty(): void {
        for (let i = 0; i < this.values.length; ++i) {
            const cfg = this.values[i];
            const propName = cfg.property;
            const propValue = cfg.initValue;
            
            switch (propName) {
                // 设置节点透明度
                case "opacity":
                    this.node.opacity = propValue;
                    break;
                // 设置节点缩放值
                case "scale":
                    this.node.scale = propValue;
                    break;
                // 设置节点显隐状态 (0为隐藏，非0为显示)
                case "active":
                    this.node.active = propValue !== 0;
                    break;
                // 节点宽度适配画布宽度 (铺满全屏宽度)
                case "resizeWidthToCanvas":
                    const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
                    this.node.width = canvas.node.getContentSize().width;
                    break;
            }
        }
    }
}