const { ccclass, property,executeInEditMode } = cc._decorator;
import MultiNodeActivator from './Slot/MultiNodeActivator';
// 导入UI激活器组件（类型声明由项目其他文件提供）
import MultiComponentActivator from './UI/MultiComponentActivator';



/**
 * 服务模式枚举
 * HRV: 0, B2B: 1
 */
export const ServiceMode = cc.Enum({
    HRV: 0,
    B2B: 1
});

/**
 * Slot内容选择器（编辑器模式组件）
 * 核心职责：
 * 1. 定义ServiceMode枚举，通过contentIndex控制内容索引
 * 2. 当contentIndex变更时，刷新MultiNodeActivator和MultiComponentActivator的激活状态
 * 3. 支持编辑器模式下执行（无需运行游戏即可预览效果）
 */
@ccclass()
@executeInEditMode // 标记组件在编辑器模式下执行
export default class SlotContentSelector_Editor extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 内容索引（内部存储值） */
    @property({ displayName: "Content Index" })
    private _contentIndex: number = 0;

    /** 内容索引（对外访问的属性，关联ServiceMode枚举） */
    @property({ 
        type: ServiceMode, 
        displayName: "Service Mode / Content Index",
        tooltip: "切换服务模式/内容索引，自动刷新激活器状态"
    })
    get contentIndex(): number {
        return this._contentIndex;
    }

    set contentIndex(value: number) {
        if (this._contentIndex !== value) {
            this._contentIndex = value;
            this.refresh(); // 索引变更时刷新激活器状态
        }
    }

    // ====== 生命周期方法 ======
    /**
     * 组件加载回调（空实现，保留扩展）
     */
    onLoad(): void {}

    // ====== 核心方法 ======
    /**
     * 刷新内容激活状态
     * - 触发MultiNodeActivator的playEffect
     * - 遍历所有MultiComponentActivator并触发playEffect
     */
    refresh(): void {
        // 1. 触发节点激活器的效果（当前索引）
        const nodeActivator = this.getComponent(MultiNodeActivator);
        if (nodeActivator) {
            nodeActivator.playEffect(this.contentIndex);
        }

        // 2. 遍历所有组件激活器并触发效果（当前索引）
        const componentActivators = this.getComponents(MultiComponentActivator);
        for (let i = 0; i < componentActivators.length; ++i) {
            componentActivators[i].playEffect(this.contentIndex);
        }
    }
}