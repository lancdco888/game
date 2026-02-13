const { ccclass, property } = cc._decorator;

/**
 * Spine组件初始化器
 * 用于统一设置Spine骨骼的premultipliedAlpha属性
 */
@ccclass()
export default class InitSpineComponent extends cc.Component {
    /** 
     * Spine是否启用预乘alpha
     * @default true
     */
    @property({
        type: Boolean,
        tooltip: "Spine骨骼是否启用预乘alpha"
    })
    preMultipliedAlpha: boolean = true;

    /**
     * 组件加载时执行（Cocos生命周期函数）
     */
    onLoad(): void {
        this.setSpineInfo();
    }

    /**
     * 设置Spine组件的核心配置（主要是premultipliedAlpha）
     */
    setSpineInfo(): void {
        // 获取当前节点上的Spine Skeleton组件
        const spineSkeleton = this.getComponent(sp.Skeleton);
        if (spineSkeleton) {
            // 赋值预乘alpha属性
            spineSkeleton.premultipliedAlpha = this.preMultipliedAlpha;
        }
    }
}