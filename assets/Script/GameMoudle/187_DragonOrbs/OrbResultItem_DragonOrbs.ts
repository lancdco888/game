import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SlotManager from "../../manager/SlotManager";

const { ccclass, property } = cc._decorator;


/**
 * 龙珠游戏结果项组件
 * 管理单个龙珠结果项的显示、旋转计数文本更新、结果项关闭等核心逻辑
 */
@ccclass('OrbResultItem_DragonOrbs')
export default class OrbResultItem_DragonOrbs extends cc.Component {
    // ===================== 序列化属性（与原JS一致） =====================
    /** 旋转计数文本标签列表（多位置显示同一计数） */
    @property([cc.Label])
    public spinCntLabels: cc.Label[] = [];

    /** 闲置状态根节点（控制显隐/透明度/缩放） */
    @property(cc.Node)
    public idlePivot: cc.Node | null = null;

    /** 状态标识（freeSpin_red/blue/green） */
    @property
    public stateKey: string = "";

    /** 计量表标识（对应Gauge数据） */
    @property
    public gaugeKey: string = "";

    // ===================== 核心业务方法（与原JS逻辑1:1） =====================
    /**
     * 设置龙珠结果显示（激活节点+计算并更新旋转计数）
     */
    public setResult(): void {
        // 激活当前结果项节点
        this.node.active = true;

        // 基础计数为8
        let spinCount = 8;
        // 获取下一个子游戏状态标识
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();

        // 匹配当前状态 → 从子游戏状态获取总计数
        if (nextSubGameKey === this.stateKey) {
            const subGameState = SlotGameResultManager.Instance.getSubGameState(nextSubGameKey);
            if (subGameState) {
                spinCount = subGameState.totalCnt;
            }
            // 激活并重置闲置节点状态
            this.idlePivot!.active = true;
            this.idlePivot!.opacity = 255;
            this.idlePivot!.scale = 1;
        } else {
            // 不匹配状态 → 基础计数 + 计量表数值
            spinCount += SlotManager.Instance.getGauges(this.gaugeKey);
        }

        // 遍历更新所有旋转计数文本标签
        for (let i = 0; i < this.spinCntLabels.length; ++i) {
            if (TSUtility.isValid(this.spinCntLabels[i])) {
                this.spinCntLabels[i].string = CurrencyFormatHelper.formatNumber(spinCount);
            }
        }
    }

    /**
     * 关闭结果项（隐藏节点）
     */
    public close(): void {
        this.node.active = false;
    }
}