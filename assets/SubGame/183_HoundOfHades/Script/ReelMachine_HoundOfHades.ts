import ReelController_Base from "../../../Script/ReelController_Base";
import ReelMachine_Base from "../../../Script/ReelMachine_Base";
import State, { ConcurrentState, SequencialState } from "../../../Script/Slot/State";
import SlotManager from "../../../Script/manager/SlotManager";
import ReelController_HoundOfHades from "./ReelController_HoundOfHades";


const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - 滚轮机管理器
 * 继承自基础滚轮机类，管理基础滚轮/LockNRoll滚轮的显示切换和状态控制
 */
@ccclass()
export default class ReelMachine_HoundOfHades extends ReelMachine_Base {
    // ====== Cocos 编辑器绑定属性 ======
    @property([ReelController_Base])
    public lockNRollReels: ReelController_Base[] = null;  // LockNRoll滚轮控制器数组

    @property(cc.Node)
    public lockNRoll_BG: cc.Node = null;                     // LockNRoll模式背景节点

    /**
     * 显示基础滚轮，隐藏LockNRoll滚轮和背景
     */
    showBaseReels() {
        if (!this.lockNRoll_BG || !this.lockNRollReels || !this.reels) {
            console.warn('ReelMachine_HoundOfHades: 滚轮/背景节点未绑定');
            return;
        }

        // 隐藏LockNRoll背景
        this.lockNRoll_BG.active = false;
        
        // 隐藏所有LockNRoll滚轮
        this.lockNRollReels.forEach(reel => reel.node.active = false);
        
        // 显示所有基础滚轮
        this.reels.forEach(reel => reel.node.active = true);
    }

    /**
     * 显示LockNRoll滚轮，隐藏基础滚轮，显示LockNRoll背景
     */
    showLockAndRollReels() {
        if (!this.lockNRoll_BG || !this.lockNRollReels || !this.reels) {
            console.warn('ReelMachine_HoundOfHades: 滚轮/背景节点未绑定');
            return;
        }

        // 显示LockNRoll背景
        this.lockNRoll_BG.active = true;
        
        // 显示所有LockNRoll滚轮
        this.lockNRollReels.forEach(reel => reel.node.active = true);
        
        // 隐藏所有基础滚轮
        this.reels.forEach(reel => reel.node.active = false);
    }

    /**
     * 获取LockNRoll滚轮的状态（用于动画/逻辑控制）
     * @returns 组合后的顺序状态对象
     */
    getLockAndRollReelState(): SequencialState {
        if (!this.lockNRollReels) {
            console.warn('ReelMachine_HoundOfHades: lockNRollReels未绑定');
            return new SequencialState();
        }

        // 创建顺序状态和并发状态容器
        const sequentialState = new SequencialState();
        const concurrentState = new ConcurrentState();

        // 遍历所有LockNRoll滚轮，收集激活滚轮的状态
        for (let n = 0; n < 15; n++) {
            const reel = this.lockNRollReels[n];
            if (reel && reel.node.active) {
                const reelController = reel.getComponent(ReelController_HoundOfHades);
                if (reelController) {
                    concurrentState.insert(reelController.getLockAndRollState());
                }
            }
        }

        // 创建空状态（用于触发完成）
        const emptyState = new State();
        emptyState.addOnStartCallback(() => {
            emptyState.setDone();
        });
        concurrentState.insert(emptyState);

        // 将并发状态插入顺序状态
        sequentialState.insert(0, concurrentState);

        // 播放滚轮旋转音效
        SlotManager.Instance.playReelSpinSound();
        
        // 并发状态结束时停止旋转音效
        concurrentState.addOnEndCallback(() => {
            SlotManager.Instance.stopReelSpinSound();
        });

        return sequentialState;
    }

    /**
     * 获取基于下一个子游戏Key的入场无限旋转状态
     * @param reels 目标滚轮数组（可选，默认使用基础滚轮）
     * @returns 组合后的并发状态对象
     */
    getIntroInfiniteSpinUsingNextSubGameKeyState(reels?: ReelController_Base[]): ConcurrentState {
        // 确定目标滚轮数组（默认使用基础滚轮）
        const targetReels = (reels == null || reels == null) ? this.reels : reels;
        const concurrentState = new ConcurrentState();

        if (!targetReels) {
            console.warn('ReelMachine_HoundOfHades: 目标滚轮数组为空');
            return concurrentState;
        }

        // 遍历目标滚轮，收集激活滚轮的无限旋转状态
        for (let o = 0; o < targetReels.length; ++o) {
            const reel = targetReels[o];
            if (reel != null) {
                const reelController = reel.getComponent(ReelController_HoundOfHades);
                if (reelController && reelController.node.active) {
                    concurrentState.insert(reelController.getInfiniteSpinUsingNextSubGameKeyState_Base());
                }
            }
        }

        return concurrentState;
    }

    /**
     * 获取最后一个激活的LockNRoll滚轮索引
     * @returns 激活滚轮索引（默认返回0）
     */
    getLastLockNRollReelIndex(): number {
        if (!this.lockNRollReels) {
            console.warn('ReelMachine_HoundOfHades: lockNRollReels未绑定');
            return 0;
        }

        // 修正原代码循环条件错误（原代码无终止条件）
        for (let e = 0; e < this.lockNRollReels.length; e++) {
            const reel = this.lockNRollReels[e];
            if (reel && reel.node.active) {
                return e;
            }
        }
        return 0;
    }
}