import ReelController_Base from '../../ReelController_Base';
import ReelMachine_Base from '../../ReelMachine_Base';
import Reel from '../../Slot/Reel';
import State, { ConcurrentState, SequencialState } from '../../Slot/State';
import SlotManager from '../../manager/SlotManager';
import ReelController_BeeLovedJars from './ReelController_BeeLovedJars';

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏的滚轮管理器，继承自通用 ReelMachine_Base 基类
 */
@ccclass('ReelMachine_BeeLovedJars')
export default class ReelMachine_BeeLovedJars extends ReelMachine_Base {
    // Lock&Roll 模式下的滚轮数组（对应原代码的 lockNRoll_Reels）
    @property({
        type: ReelController_Base,
        displayName: "LockNRoll滚轮数组",
        tooltip: "Lock&Roll模式下使用的滚轮控制器数组"
    })
    lockNRoll_Reels: ReelController_Base[] = [];

    // 单符号层节点（对应原代码的 oneSymbolLayer）
    @property({
        type: Node,
        displayName: "单符号层",
        tooltip: "单符号显示层节点"
    })
    oneSymbolLayer: Node | null = null;

    /**
     * 显示基础滚轮（隐藏Lock&Roll滚轮）
     */
    showBaseReels(): void {
        // 隐藏所有Lock&Roll滚轮
        for (let e = 0; e < this.lockNRoll_Reels.length; e++) {
            if (this.lockNRoll_Reels[e]?.node) {
                this.lockNRoll_Reels[e].node.active = false;
            }
        }
        // 显示所有基础滚轮
        for (let e = 0; e < this.reels.length; e++) {
            if (this.reels[e]?.node) {
                this.reels[e].node.active = true;
            }
        }
    }

    /**
     * 显示Lock&Roll滚轮（隐藏基础滚轮），并初始化符号
     */
    showLockAndRollReels(): void {
        // 显示并初始化所有Lock&Roll滚轮
        for (let e = 0; e < this.lockNRoll_Reels.length; e++) {
            const reelCtrl = this.lockNRoll_Reels[e];
            if (reelCtrl?.node) {
                reelCtrl.node.active = true;
                const reelComp = reelCtrl.getComponent(Reel);
                if (reelComp) {
                    // 更换不同偏移量的符号
                    reelComp.changeSymbol(1, 0);
                    reelComp.changeSymbol(0, 0);
                    reelComp.changeSymbol(-1, 0);
                }
            }
        }
        // 隐藏所有基础滚轮
        for (let e = 0; e < this.reels.length; e++) {
            if (this.reels[e]?.node) {
                this.reels[e].node.active = false;
            }
        }
    }

    /**
     * 获取Lock&Roll滚轮的状态对象
     * @returns SequencialState 滚轮状态序列
     */
    getLockAndRollReelState(): SequencialState {
        const seqState = new SequencialState();
        const concurState = new ConcurrentState();

        // 遍历15个Lock&Roll滚轮（原代码固定遍历15个）
        for (let n = 0; n < 15; n++) {
            const reelCtrl = this.lockNRoll_Reels[n];
            if (reelCtrl?.node && reelCtrl.node.active) {
                // 获取BeeLovedJars专属的Lock&Roll状态
                const beeReelCtrl = reelCtrl as ReelController_BeeLovedJars;
                concurState.insert(beeReelCtrl.getLockAndRollState());
            }
        }

        // 空状态（用于触发回调）
        const emptyState = new State();
        emptyState.addOnStartCallback(() => {
            emptyState.setDone();
        });
        concurState.insert(emptyState);

        // 组装状态序列
        seqState.insert(0, concurState);
        
        // 播放/停止滚轮旋转音效
        SlotManager.Instance.playReelSpinSound();
        concurState.addOnEndCallback(() => {
            SlotManager.Instance.stopReelSpinSound();
        });

        return seqState;
    }

    /**
     * 获取第一个激活的Lock&Roll滚轮索引
     * @returns 滚轮索引（默认返回0）
     */
    getFirstLockNRollReelIndex(): number {
        // 修复原代码循环条件错误：原代码是 for(;this.lockNRoll_Reels.length;e++) 会无限循环
        for (let e = 0; e < this.lockNRoll_Reels.length; e++) {
            const reelCtrl = this.lockNRoll_Reels[e];
            if (reelCtrl?.node && reelCtrl.node.active) {
                return e;
            }
        }
        return 0;
    }

    /**
     * 获取最后一个激活的Lock&Roll滚轮索引
     * @returns 滚轮索引（默认返回数组最后一位）
     */
    getLastLockNRollReelIndex(): number {
        // 倒序遍历滚轮数组
        for (let e = this.lockNRoll_Reels.length - 1; e >= 0; e--) {
            const reelCtrl = this.lockNRoll_Reels[e];
            if (reelCtrl?.node && reelCtrl.node.active) {
                return e;
            }
        }
        return this.lockNRoll_Reels.length - 1;
    }

    /**
     * 获取无限旋转的开场状态（基于子游戏Key）
     * @param reels 可选的滚轮数组（默认使用基础滚轮）
     * @returns ConcurrentState 并发状态
     */
    getIntroInfiniteSpinUsingNextSubGameKeyState(reels?: ReelController_Base[]): ConcurrentState {
        // 确定目标滚轮数组（参数为空则用基础滚轮）
        const targetReels = reels ?? this.reels;
        const concurState = new ConcurrentState();

        // 遍历目标滚轮，收集无限旋转状态
        for (let o = 0; o < targetReels.length; ++o) {
            const reelCtrl = targetReels[o];
            if (reelCtrl) {
                const beeReelCtrl = reelCtrl as ReelController_BeeLovedJars;
                if (beeReelCtrl.node && beeReelCtrl.node.active) {
                    concurState.insert(beeReelCtrl.getInfiniteSpinUsingNextSubGameKeyState());
                }
            }
        }

        return concurState;
    }

}