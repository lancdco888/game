const { ccclass, property } = cc._decorator;

/**
 * 画布宽度半分设置组件 - 通用UI适配工具
 * HalfCanvasWidthSetter
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class HalfCanvasWidthSetter extends cc.Component {
    // ===================== Cocos 序列化属性 【与原JS @property 1:1精准对应，默认值false】 =====================
    @property({ 
        type: Boolean, 
        displayName: "使用Canvas高度", 
        tooltip: "是否将节点高度设置为Canvas的高度（默认使用节点自身高度）" 
    })

    public useCanvasHeight: boolean = false;

    constructor(){
        super()
    }


    // ===================== 生命周期方法 【1:1完全等价还原原JS逻辑，类型安全】 =====================
    public start(): void {
        // 1. 获取场景中的Canvas组件并读取其内容尺寸 (原逻辑完全保留)
        const canvasNode = cc.director.getScene().getComponentInChildren(cc.Canvas)?.node;
        if (!canvasNode) {
            console.warn("[HalfCanvasWidthSetter] 场景中未找到Canvas组件，跳过尺寸设置");
            return;
        }
        const canvasSize: cc.Size = canvasNode.getContentSize();

        // 2. 计算节点高度 (原逻辑等价转换：1 == this.useCanvasHeight → this.useCanvasHeight)
        let targetHeight: number = this.node.height;
        if (this.useCanvasHeight) {
            targetHeight = canvasSize.height;
        }

        // 3. 设置节点内容尺寸：宽度=Canvas宽度/2，高度=目标高度 (原核心逻辑完全保留)
        this.node.setContentSize(canvasSize.width / 2, targetHeight);
    }
}
