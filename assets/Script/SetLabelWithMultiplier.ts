import CurrencyFormatHelper from "./global_utility/CurrencyFormatHelper";

const { ccclass, property } = cc._decorator;

/**
 * 带倍数的标签设置组件
 * 负责根据配置的倍数计算数值，并按普通/省略号格式格式化显示到 Label 组件
 */
@ccclass()
export default class SetLabelWithMultiplier extends cc.Component {
    // === 编辑器序列化属性 ===
    @property({ type: Number, displayName: '数值倍数', tooltip: '最终显示值 = 传入值 × 该倍数' })
    multiplier: number = 1;

    @property({ type: Boolean, displayName: '是否向下取整', tooltip: '仅省略号格式生效' })
    flagFloor: boolean = false;

    @property({ type: Boolean, displayName: '是否启用省略号格式', tooltip: '启用后使用省略号格式化数值' })
    flagEllipsis: boolean = false;

    @property({ type: String, displayName: '省略号位数范围', tooltip: '逗号分隔的数字，如"3,6,9,12"' })
    rangeEllipsis: string = "3,6,9,12";

    /**
     * 设置标签显示值（核心方法）
     * @param baseValue 基础数值，最终显示值 = baseValue × multiplier
     */
    setValue(baseValue: number): void {
        // 计算最终数值（基础值 × 倍数）
        const finalValue = baseValue * this.multiplier;
        const labelComponent = this.getComponent(cc.Label);
        if (!labelComponent) return; // 未挂载Label组件则直接返回

        // 省略号格式：按配置的位数范围格式化
        if (this.flagEllipsis) {
            // 确定取整函数（启用floor则用Math.floor，否则为null）
            const roundFunc: ((num: number) => number) | null = this.flagFloor ? Math.floor : null;
            
            // 拆分省略号位数范围为数字数组
            const ellipsisRange = this.rangeEllipsis.split(",").map(str => Number(str));
            
            // 格式化并设置标签文本
            labelComponent.string = CurrencyFormatHelper.formatEllipsisWithEllipsisRange(finalValue, ellipsisRange, roundFunc);
        } 
        // 普通格式：直接数值格式化
        else {
            labelComponent.string = CurrencyFormatHelper.formatNumber(finalValue);
        }
    }
}