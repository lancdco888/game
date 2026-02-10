const { ccclass, property } = cc._decorator;

import TSUtility from '../../global_utility/TSUtility';
// 导入外部依赖模块（路径与原JS保持一致）
import OrbResultItem_DragonOrbs from './OrbResultItem_DragonOrbs';

/**
 * 龙珠游戏免费旋转选择项组件
 * 管理单个龙珠选择项的hover效果、结果项显隐、龙珠打开/关闭等核心逻辑
 */
@ccclass()
export default class FreeSpinChooseItem_DragonOrbs extends cc.Component {
    // ===================== 序列化属性（与原JS一致） =====================
    /** 龙珠结果项组件列表（对应不同免费旋转类型的结果显示） */
    @property([OrbResultItem_DragonOrbs])
    public resultOrbItems: OrbResultItem_DragonOrbs[] = [];

    /** hover效果节点（鼠标移入时显示） */
    @property(cc.Node)
    public hoverNode: cc.Node = null;

    // ===================== 核心业务方法（与原JS逻辑1:1） =====================
    /**
     * 启动时初始化（原JS空实现，保留方法兼容）
     */
    public initForStart(): void {}

    /**
     * 显示hover效果（激活hover节点）
     */
    public showHover(): void {
        this.hoverNode!.active = true;
    }

    /**
     * 隐藏hover效果（禁用hover节点）
     */
    public hideHover(): void {
        this.hoverNode!.active = false;
    }

    /**
     * 打开龙珠（显示匹配stateKey的结果项，隐藏其他项）
     * @param stateKey 状态标识（freeSpin_red/blue/green）
     */
    public openOrb(stateKey: string): void {
        // 先隐藏hover效果
        this.hideHover();

        // 遍历所有结果项，匹配状态的显示结果，其余隐藏
        for (let i = 0; i < this.resultOrbItems.length; ++i) {
            const resultItem = this.resultOrbItems[i];
            if (!TSUtility.isValid(resultItem)) continue; // 组件无效则跳过
            
            if (resultItem.stateKey === stateKey) {
                resultItem.setResult();
            } else {
                resultItem.node.active = false;
            }
        }
    }

    /**
     * 关闭龙珠（遍历所有结果项执行关闭逻辑）
     */
    public close(): void {
        for (let i = 0; i < this.resultOrbItems.length; ++i) {
            const resultItem = this.resultOrbItems[i];
            if (TSUtility.isValid(resultItem)) {
                resultItem.close();
            }
        }
    }
}