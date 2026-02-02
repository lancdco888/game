const { ccclass, property } = cc._decorator;

import ReelController_Base from "../../ReelController_Base";
import ReelMachine_Base from "../../ReelMachine_Base";
import Reel from "../../Slot/Reel";
import State, { ConcurrentState, SequencialState } from "../../Slot/State";
import SlotManager from "../../manager/SlotManager";
import ReelController_Zhuquefortune from "./ReelController_Zhuquefortune";
import Reel_Zhuquefortune from "./Reel_Zhuquefortune";


/**
 * 朱雀财富滚轮机类
 * 继承自基础ReelMachine_Base，扩展基础滚轮/Lock&Roll滚轮切换、锁滚状态管理等专属功能
 */
@ccclass()
export default class ReelMachine_Zhuquefortune extends ReelMachine_Base {
    // ===== 编辑器可配置属性（对应原JS的property定义，补充TS类型）=====
    /** Lock&Roll模式下的滚轮控制器数组 */
    @property([ReelController_Base])
    public lockNRoll_Reels: ReelController_Base[] = [];

    /** 单个符号层级节点（用于滚轮视觉层级管理） */
    @property(cc.Node)
    public oneSymbolLayer: cc.Node = null;

    // ===== 公共业务方法（实现朱雀专属滚轮机逻辑）=====
    /**
     * 显示基础滚轮（隐藏Lock&Roll滚轮）
     */
    public showBaseReels(): void {
        // 1. 隐藏所有Lock&Roll滚轮
        for (let i = 0; i < this.lockNRoll_Reels.length; i++) {
            const lockReel = this.lockNRoll_Reels[i];
            if (lockReel && lockReel.node) {
                lockReel.node.active = false;
            }
        }

        // 2. 显示所有基础滚轮（继承自父类ReelMachine_Base的reels属性）
        for (let i = 0; i < this.reels.length; i++) {
            const baseReel = this.reels[i];
            if (baseReel && baseReel.node) {
                baseReel.node.active = true;
            }
        }
    }

    /**
     * 显示Lock&Roll滚轮（隐藏基础滚轮，并初始化Lock&Roll滚轮符号）
     */
    public showLockAndRollReels(): void {
        // 1. 显示并初始化所有Lock&Roll滚轮
        for (let i = 0; i < this.lockNRoll_Reels.length; i++) {
            const lockReel = this.lockNRoll_Reels[i];
            if (!lockReel || !lockReel.node) continue;

            // 激活Lock&Roll滚轮节点
            lockReel.node.active = true;

            // 获取滚轮组件，更新不同偏移量的符号
            const reelComp = lockReel.getComponent(Reel);
            if (reelComp) {
                reelComp.changeSymbol(1, 0);
                reelComp.changeSymbol(0, 0);
                reelComp.changeSymbol(-1, 0);
            }
        }

        // 2. 隐藏所有基础滚轮
        for (let i = 0; i < this.reels.length; i++) {
            const baseReel = this.reels[i];
            if (baseReel && baseReel.node) {
                baseReel.node.active = false;
            }
        }
    }

    /**
     * 获取Lock&Roll滚轮的整体状态（构建时序/并发状态，控制滚轮旋转逻辑）
     * @returns 封装后的SequentialState状态对象
     */
    public getLockAndRollReelState(): SequencialState {
        // 1. 初始化时序状态（串行执行）和并发状态（并行执行所有激活的滚轮状态）
        const sequenceState = new SequencialState();
        const concurrentState = new ConcurrentState();

        // 2. 遍历Lock&Roll滚轮，收集所有激活滚轮的锁滚状态
        for (let i = 0; i < this.lockNRoll_Reels.length; i++) {
            const lockReel = this.lockNRoll_Reels[i];
            if (!lockReel || !lockReel.node || !lockReel.node.active) continue;

            // 获取朱雀专属滚轮控制器，提取锁滚状态
            const reelCtrlComp = lockReel.getComponent(ReelController_Zhuquefortune);
            if (reelCtrlComp) {
                const lockRollState = reelCtrlComp.getLockAndRollState();
                concurrentState.insert(lockRollState);
            }
        }

        // 3. 构建空状态（用于触发状态完成回调）
        const emptyState = new State();
        emptyState.addOnStartCallback(() => {
            emptyState.setDone();
        });
        concurrentState.insert(emptyState);

        // 4. 组装时序状态，添加音效播放/停止回调
        sequenceState.insert(0, concurrentState);
        SlotManager.Instance.playReelSpinSound();

        concurrentState.addOnEndCallback(() => {
            SlotManager.Instance.stopReelSpinSound();
        });

        return sequenceState;
    }

    /**
     * 获取无限旋转（使用下一个子游戏密钥）的初始化状态
     * @param targetReels 目标滚轮数组（可选，默认使用基础滚轮）
     * @returns 封装后的ConcurrentState并发状态对象
     */
    public getIntroInfiniteSpinUsingNextSubGameKeyState(targetReels: any[]|null=null): ConcurrentState {
        // 1. 确定目标滚轮数组（默认使用父类的基础滚轮reels）
        const reelsToUse = targetReels || this.reels;
        const concurrentState = new ConcurrentState();

        // 2. 遍历目标滚轮，收集无限旋转状态
        for (let i = 0; i < reelsToUse.length; i++) {
            const reelNode = reelsToUse[i];
            if (!reelNode || !reelNode.active) continue;

            // 获取朱雀专属滚轮控制器，提取无限旋转基础状态
            const reelCtrlComp = reelNode.getComponent(ReelController_Zhuquefortune);
            if (reelCtrlComp) {
                const infiniteSpinState = reelCtrlComp.getInfiniteSpinUsingNextSubGameKeyState_Base();
                concurrentState.insert(infiniteSpinState);
            }
        }

        return concurrentState;
    }

    /**
     * 获取第一个激活的Lock&Roll滚轮索引
     * @returns 第一个激活滚轮的索引（默认返回0）
     */
    public getFirstLockNRollReelIndex(): number {
        // 修复原JS的遍历条件漏洞（原代码缺少 i < this.lockNRoll_Reels.length）
        for (let i = 0; i < this.lockNRoll_Reels.length; i++) {
            const lockReel = this.lockNRoll_Reels[i];
            if (lockReel && lockReel.node && lockReel.node.active) {
                return i;
            }
        }
        return 0;
    }

    /**
     * 获取最后一个激活的Lock&Roll滚轮索引
     * @returns 最后一个激活滚轮的索引（默认返回数组最后一位）
     */
    public getLastLockNRollReelIndex(): number {
        // 从后往前遍历，查找第一个激活的Lock&Roll滚轮
        for (let i = this.lockNRoll_Reels.length - 1; i >= 0; i--) {
            const lockReel = this.lockNRoll_Reels[i];
            if (lockReel && lockReel.node && lockReel.node.active) {
                return i;
            }
        }
        return this.lockNRoll_Reels.length - 1;
    }

    /**
     * 更新所有激活的Lock&Roll滚轮上的Jackpot符号
     */
    public updateJackpotSymbolOnReel(): void {
        for (let i = 0; i < this.lockNRoll_Reels.length; i++) {
            const lockReel = this.lockNRoll_Reels[i];
            if (!lockReel || !lockReel.node || !lockReel.node.active) continue;

            // 获取朱雀专属滚轮组件，执行Jackpot符号更新
            const reelZhuqueComp = lockReel.getComponent(Reel_Zhuquefortune);
            reelZhuqueComp?.updateJackpotSymbolOnReel();
        }
    }
}