import ReelMachine_Base from "../../ReelMachine_Base";
import State, { ConcurrentState, SequencialState } from "../../Slot/State";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SlotManager from "../../manager/SlotManager";
import ReelController_LuckyBunnyDrop from "./ReelController_LuckyBunnyDrop";

const { ccclass, property } = cc._decorator;


/**
 * LuckyBunnyDrop 卷轴机组件（继承基础卷轴机）
 */
@ccclass()
export default class ReelMachine_LuckyBunnyDrop extends ReelMachine_Base {
    // LockAndRoll 卷轴节点数组（5列3行共15个）
    @property([ReelController_LuckyBunnyDrop])
    public lockAndRoll_Reels: ReelController_LuckyBunnyDrop[] = [];

    /**
     * 获取LockAndRoll卷轴的状态（用于状态机管理）
     * @returns SequencialState 序列化状态对象
     */
    public getLockAndRollReelState(): SequencialState {
        // 创建序列化状态和并发状态容器
        const seqState = new SequencialState();
        const concurrentState = new ConcurrentState();

        // 遍历5列3行所有LockAndRoll卷轴，收集状态
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const idx = 3 * col + row;
                const reelCtrl = this.lockAndRoll_Reels[idx];
                if (reelCtrl) {
                    concurrentState.insert(reelCtrl.getLockAndRollState());
                }
            }
        }

        // 创建结算状态：累加LinkedJackpot模式下的赢钱
        const settleState = new State();
        settleState.addOnStartCallback(() => {
            // 累加赢钱金额
            SlotGameResultManager.Instance.winMoneyInLinkedJackpotMode += SlotGameResultManager.Instance.getWinningCoin();
            settleState.setDone();
        });

        // 将结算状态加入并发状态
        concurrentState.insert(settleState);
        // 将并发状态加入序列化状态
        seqState.insert(0, concurrentState);

        // 播放卷轴旋转音效
        SlotManager.Instance.playReelSpinSound();

        // 并发状态结束时停止旋转音效
        concurrentState.addOnEndCallback(() => {
            SlotManager.Instance.stopReelSpinSound();
        });

        return seqState;
    }

    /**
     * 隐藏所有卷轴的Jackpot期望特效
     */
    public hideAllJackpotExpectEffects(): void {
        // 遍历基础卷轴数组（reels 继承自 ReelMachine_Base）
        for (let i = 0; i < this.reels.length; ++i) {
            const reelNode = this.reels[i];
            if (reelNode) {
                const reelCtrl = reelNode.getComponent(ReelController_LuckyBunnyDrop);
                if (reelCtrl) {
                    reelCtrl.setShowJackpotExpectEffects(0);
                }
            }
        }
    }

    /**
     * 显示指定列卷轴的Jackpot期望特效
     * @param col 列索引（0-4）
     * @returns 是否成功显示特效
     */
    public showJackpotExpectEffect(col: number): boolean {
        const reelNode = this.reels[col];
        if (!reelNode) return false;

        const reelCtrl = reelNode.getComponent(ReelController_LuckyBunnyDrop);
        if (reelCtrl) {
            reelCtrl.setShowJackpotExpectEffects(1);
            return true;
        }
        return false;
    }
}