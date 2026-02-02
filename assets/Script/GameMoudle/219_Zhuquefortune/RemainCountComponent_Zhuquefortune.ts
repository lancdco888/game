import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";

const { ccclass, property } = cc._decorator;

/**
 * 朱雀运势剩余次数组件
 * 负责展示、更新、重置老虎机/抽奖的剩余转动次数
 */
@ccclass()
export default class RemainCountComponent_Zhuquefortune extends cc.Component {
    // 剩余次数数字标签节点数组（对应 1、2、3 等次数）
    @property([cc.Node])
    public countLabel_Nodes: cc.Node[] = [];

    // 单数描述节点（"spin"）
    @property(cc.Node)
    public spin_Node: cc.Node | null = null;

    // 复数描述节点（"spins"）
    @property(cc.Node)
    public spins_Node: cc.Node | null = null;

    // 最后一次描述节点（"last spin"）
    @property(cc.Node)
    public lastSpin_Node: cc.Node | null = null;

    // UI 动画组件（控制出现、消失、重置动画）
    @property(cc.Animation)
    public ui_Animation: cc.Animation | null = null;

    // 私有变量：当前剩余次数（仅内部更新和使用）
    private _remainCount: number = 0;

    /**
     * 获取当前剩余次数（核心业务逻辑，从游戏结果管理器中获取并计算）
     * @returns {number} 剩余转动次数
     */
    public getRemainCount(): number {
        // 获取当前游戏结果的子游戏Key
        let subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        // 如果是基础游戏，获取下一个子游戏Key
        if (subGameKey === "base") {
            subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        }

        // 获取子游戏状态
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
        // 计算剩余次数：总次数（默认3） - 已转动次数
        const remainCount = (subGameState.totalCnt === 0 ? 3 : subGameState.totalCnt) - subGameState.spinCnt;
        const lastWindows = subGameState.lastWindows;
        let hasSpecialIcon = false;

        // 检查最后一次窗口是否包含特殊图标（十位为10的图标，即 10x 格式）
        if (TSUtility.isValid(lastWindows) && lastWindows.length > 0) {
            for (let i = 0; i < 5; i++) {
                for (let s = 0; s < 3; s++) {
                    const iconValue = lastWindows[i][s];
                    if (Math.floor(iconValue / 10) === 10) {
                        hasSpecialIcon = true;
                        break; // 找到后跳出内层循环
                    }
                }
                if (hasSpecialIcon) break; // 找到后跳出外层循环
            }

            // 存在特殊图标时，强制返回剩余次数3
            if (hasSpecialIcon) {
                return 3;
            }
        }

        // 返回正常计算的剩余次数
        return remainCount;
    }

    /**
     * 显示UI（播放出现动画，更新剩余次数）
     */
    public showUI(): void {
        if (!this.ui_Animation) return; // 避免空指针异常

        this.ui_Animation.stop();
        this.ui_Animation.play("LnR_SpinNum_UI_Appear_Ani");
        this.ui_Animation.setCurrentTime(0); // 重置动画到起始帧

        this._remainCount = this.getRemainCount();
        this.setUpdateCount();
    }

    /**
     * 隐藏UI（播放消失动画）
     */
    public hideUI(): void {
        if (!this.ui_Animation) return; // 避免空指针异常

        this.ui_Animation.stop();
        this.ui_Animation.play("LnR_SpinNum_UI_Disappear_Ani");
        this.ui_Animation.setCurrentTime(0); // 重置动画到起始帧
    }

    /**
     * 更新剩余次数（对比新旧次数，有变化则播放更新逻辑，完成后执行回调）
     * @param {() => void} callback 次数更新完成后的回调函数
     */
    public updateCount(callback?: () => void): void {
        const newRemainCount = this.getRemainCount();

        // 新旧次数不一致时，更新并延迟执行回调
        if (this._remainCount !== newRemainCount) {
            this._remainCount = newRemainCount;
            this.setUpdateCount();

            this.scheduleOnce(() => {
                if (TSUtility.isValid(callback)) {
                    callback!();
                }
            }, 1);
        } else {
            // 次数无变化，直接执行回调
            if (TSUtility.isValid(callback)) {
                callback!();
            }
        }
    }

    /**
     * 减少剩余次数（手动扣减1次，更新UI显示）
     */
    public decreaseCount(): void { // 修复原代码拼写错误：decrese → decrease
        this.node.active = true;
        this._remainCount--;
        this.setUpdateCount();
    }

    /**
     * 设置并更新UI上的次数显示（控制各节点的显隐）
     */
    public setUpdateCount(): void {
        // 控制数字标签的显隐：只显示当前剩余次数对应的标签
        if (this._remainCount > 0) {
            for (let i = 0; i < this.countLabel_Nodes.length; i++) {
                const labelNode = this.countLabel_Nodes[i];
                if (labelNode) {
                    labelNode.active = (i === this._remainCount);
                }
            }
        } else {
            // 剩余次数为0，隐藏所有数字标签
            for (let i = 0; i < this.countLabel_Nodes.length; i++) {
                const labelNode = this.countLabel_Nodes[i];
                if (labelNode) {
                    labelNode.active = false;
                }
            }
        }

        // 控制描述文字节点的显隐
        if (this.spin_Node) {
            this.spin_Node.active = (this._remainCount === 1 && this._remainCount > 0);
        }
        if (this.spins_Node) {
            this.spins_Node.active = (this._remainCount !== 1 && this._remainCount > 0);
        }
        if (this.lastSpin_Node) {
            this.lastSpin_Node.active = (this._remainCount === 0);
        }
    }

    /**
     * 重置UI（将剩余次数重置为3，播放重置动画）
     */
    public resetUI(): void {
        if (this._remainCount !== 3 && this.ui_Animation) {
            this._remainCount = 3;
            this.ui_Animation.stop();
            this.ui_Animation.play("LnR_SpinNum_UI_Num_Reset_Ani");
            this.ui_Animation.setCurrentTime(0); // 重置动画到起始帧
            this.setUpdateCount();
        }
    }
}