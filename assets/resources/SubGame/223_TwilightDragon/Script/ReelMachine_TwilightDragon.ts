import ReelMachine_Base from "../../../../Script/ReelMachine_Base";
import { SequencialState, ConcurrentState } from "../../../../Script/Slot/State";
import SlotManager from "../../../../Script/manager/SlotManager";
import ReelController_TwilightDragon from "./ReelController_TwilightDragon";

const { ccclass, property } = cc._decorator;

/**
 * 暮光龙（Twilight Dragon）卷轴机器组件
 * 严格还原原 JS 逻辑，继承自 ReelMachine_Base，不额外拓展方法
 */
@ccclass("ReelMachine_TwilightDragon")
export default class ReelMachine_TwilightDragon extends ReelMachine_Base {
    // ======================================
    // 严格还原原 JS 的 getFreeSpinReelStateRenewal 方法
    // ======================================
    getFreeSpinReelStateRenewal(e: any): SequencialState {
        // 初始化顺序状态与并发状态（严格对应原 JS 的 s.SequencialState / s.ConcurrentState）
        const t = new SequencialState();
        const n = new ConcurrentState();

        // 遍历父类中的 reels 数组（来自 ReelMachine_Base）
        for (let o = 0; o < this.reels.length; ++o) {
            // 判空：卷轴存在且节点处于激活状态
            if (this.reels[o] && this.reels[o].node && this.reels[o].node.active) {
                // 获取暮光龙专属卷轴控制器组件
                const a = this.reels[o].getComponent(ReelController_TwilightDragon);
                if (a) {
                    // 插入免费旋转专属状态到并发状态中
                    n.insert(a.getSpinExcludePreSpinUsingSpinRequestTimeState_FreeSpin(e, this));
                }
            }
        }

        // 向顺序状态中插入并发状态（索引 0）
        t.insert(0, n);

        // 给并发状态添加开始回调（空实现，严格还原原 JS）
        n.addOnStartCallback(function() {});

        // 给并发状态添加结束回调（停止卷轴旋转音效）
        n.addOnEndCallback(function() {
            SlotManager.Instance.stopReelSpinSound();
        });

        // 返回构建完成的顺序状态
        return t;
    }
}