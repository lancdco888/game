import ReelController_Base from '../../ReelController_Base';
import ReelMachine_Base from '../../ReelMachine_Base';
import { ConcurrentState, SequencialState } from '../../Slot/State';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotManager from '../../manager/SlotManager';
import GameComponents_DragonOrbs from './GameComponents_DragonOrbs';

const { ccclass: ccclassDecorator } = cc._decorator;

/**
 * 龙珠老虎机滚轮管理器（继承自基础滚轮管理器）
 */
@ccclassDecorator()
export default class ReelMachine_DragonOrbs extends ReelMachine_Base {

    /**
     * 获取普通旋转的滚轮状态（顺序执行）
     * @returns 顺序状态实例
     */
    getNormalSpinReelStateRenewal(): SequencialState {
        // 初始化顺序状态（按顺序执行子状态）
        const sequentialState = new SequencialState();
        // 初始化并发状态（同时执行子状态）
        const reelSpinConcurrentState = new ConcurrentState();

        // 为激活的滚轮添加无限旋转状态
        for (let i = 0; i < this.reels.length; ++i) {
            const reelNode = this.reels[i];
            if (reelNode.node.active) {
                reelSpinConcurrentState.insert(reelNode.getInfiniteSpinUsingSubGameKeyState("base"));
            }
        }

        // 获取功能介绍状态并添加结束回调
        const featureIntroState = SlotManager.Instance.getComponent(GameComponents_DragonOrbs).getPlayFeatureIntroState();
        featureIntroState.addOnEndCallback(() => {
            // 结束所有未完成的滚轮旋转子状态
            reelSpinConcurrentState.subStates.forEach(subState => {
                if (!subState.isDone()) {
                    subState.setDone();
                }
            });
        });
        reelSpinConcurrentState.insert(featureIntroState);

        // 初始化滚轮旋转的并发状态（排除预旋转）
        const reelSpinExcludePreState = new ConcurrentState();
        for (let i = 0; i < this.reels.length; ++i) {
            const reelController = this.reels[i].getComponent(ReelController_Base);
            reelSpinExcludePreState.insert(reelController.getSpinExcludePreSpinUsingSpinRequestTimeState());
        }

        // 旋转状态回调
        reelSpinConcurrentState.addOnStartCallback(() => {});
        reelSpinConcurrentState.addOnEndCallback(() => {
            SlotManager.Instance.stopReelSpinSound();
        });

        // 按顺序插入状态：滚轮旋转 → 排除预旋转 → 检查狂热移动图标
        sequentialState.insert(0, reelSpinConcurrentState);
        sequentialState.insert(1, reelSpinExcludePreState);
        sequentialState.insert(2, SlotManager.Instance.getCheckFeverMoveIcon());

        return sequentialState;
    }

    /**
     * 获取免费旋转的滚轮状态（顺序执行）
     * @returns 顺序状态实例
     */
    getFreeSpinReelStateRenewal(): SequencialState {
        const sequentialState = new SequencialState();
        const reelSpinConcurrentState = new ConcurrentState();

        // 为激活的滚轮添加对应子游戏key的无限旋转状态
        for (let i = 0; i < this.reels.length; ++i) {
            const reelNode = this.reels[i];
            if (reelNode.node.active) {
                const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                reelSpinConcurrentState.insert(reelNode.getInfiniteSpinUsingSubGameKeyState(subGameKey));
            }
        }

        // 功能介绍状态回调（结束未完成的旋转状态）
        const featureIntroState = SlotManager.Instance.getComponent(GameComponents_DragonOrbs).getPlayFeatureIntroState();
        featureIntroState.addOnEndCallback(() => {
            reelSpinConcurrentState.subStates.forEach(subState => {
                if (!subState.isDone()) {
                    subState.setDone();
                }
            });
        });
        reelSpinConcurrentState.insert(featureIntroState);

        // 滚轮旋转并发状态（排除预旋转）
        const reelSpinExcludePreState = new ConcurrentState();
        for (let i = 0; i < this.reels.length; ++i) {
            const reelController = this.reels[i].getComponent(ReelController_Base);
            reelSpinExcludePreState.insert(reelController.getSpinExcludePreSpinState());
        }

        // 旋转结束停止音效
        reelSpinConcurrentState.addOnEndCallback(() => {
            SlotManager.Instance.stopReelSpinSound();
        });

        // 插入顺序状态
        sequentialState.insert(0, reelSpinConcurrentState);
        sequentialState.insert(1, reelSpinExcludePreState);
        sequentialState.insert(2, SlotManager.Instance.getCheckFeverMoveIcon());

        return sequentialState;
    }

    /**
     * 显示滚轮期望效果（修正原代码拼写错误：shoe → show）
     * @param index 滚轮索引
     * @returns 是否成功显示
     */
    showExpectEffect(index: number): boolean {
        const reelNode = this.reels[index];
        if (reelNode && reelNode.node.active) {
            reelNode.setShowExpectEffects(true);
            return true;
        }
        return false;
    }

    /**
     * 隐藏指定索引的滚轮
     * @param index 滚轮索引
     */
    hideReel(index: number): void {
        const reelNode = this.reels[index];
        if (reelNode) {
            reelNode.node.active = false;
        }
    }

    /**
     * 显示指定索引的滚轮
     * @param index 滚轮索引
     */
    showReel(index: number): void {
        const reelNode = this.reels[index];
        if (reelNode) {
            reelNode.node.active = true;
        }
    }
}