import ReelController_Base from "../../ReelController_Base";
import ReelSpinBehaviors, { EasingInfo } from "../../ReelSpinBehaviors";
import Reel from "../../Slot/Reel";
import SlotSoundController from "../../Slot/SlotSoundController";
import State, { SequencialState } from "../../Slot/State";
import SlotUIRuleManager from "../../Slot/rule/SlotUIRuleManager";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";
import SlotManager, { SpecialSymbolInfo, SpecialType } from "../../manager/SlotManager";
import SoundManager from "../../manager/SoundManager";
import Reel_HundredDollar from "./Reel_HundredDollar";

const { ccclass } = cc._decorator;

/**
 * 百元老虎机滚轮控制器
 * 继承自基础滚轮控制器，扩展百元机特有逻辑
 */
@ccclass('ReelController_HundredDollar')
export default class ReelController_HundredDollar extends ReelController_Base {

    onLoad() {
        // 向虚拟符号列表添加百元机特有符号ID
        this.dummySymbolList.push(21, 22, 23, 24, 25, 71, 72);
        
        // 旋转结束时的缓动回调函数
        this.easingFuncListOnSpinEnd.push(() => {
            const reelComp = this.node.getComponent(Reel);
            if (!reelComp) return;

            // 播放滚轮停止音效
            this.playReelStopSound();

            // 第三个滚轮（索引2）延迟停止旋转音效
            if (reelComp.reelindex === 2) {
                this.node.runAction(cc.sequence(
                    cc.delayTime(0.26),
                    cc.callFunc(() => {
                        SlotSoundController.Instance().stopAudio("ReelSpin_0", "FXLoop");
                        SlotSoundController.Instance().stopAudio("ReelSpin_1", "FXLoop");
                        SlotSoundController.Instance().stopAudio("ReelSpin_2", "FXLoop");
                        SlotSoundController.Instance().stopAudio("ReelSpin_3", "FXLoop");
                        SlotSoundController.Instance().stopAudio("ReelExpect", "FX");
                    })
                ));
            }

            // 重置模糊偏移量（关闭模糊效果）
            reelComp.setShaderValue("blurOffset", 0);
        });
    }

    /**
     * 处理旋转结束逻辑
     * @param callback 旋转结束后的回调函数
     */
    processSpinEnd(callback: Function) {
        const reelComp = this.node.getComponent(Reel);
        if (!reelComp) {
            callback();
            return;
        }

        // 获取可见窗口（原代码中未使用n，保留逻辑）
        const visibleWindow = SlotGameResultManager.Instance.getVisibleSlotWindows().GetWindow(reelComp.reelindex);
        const emptyList: any[] = [];

        // 原代码逻辑：隐藏符号→显示所有符号→执行回调
        cc.callFunc(() => {
            for (let i = 0; i < emptyList.length; ++i) {
                emptyList[i].active = false;
            }
            reelComp.showAllSymbol();
            callback();
        });
        
        // 执行外部回调
        callback();
    }

    /**
     * 获取滚轮旋转状态机
     * @returns 有序状态机实例
     */
    getSpinState(): SequencialState {
        const stateMachine = new SequencialState();
        
        // 节点未激活时返回空状态机
        if (!this.node.active) {
            return stateMachine;
        }

        let stateIndex = 0;
        const reelComp = this.node.getComponent(Reel_HundredDollar);
        if (!reelComp) {
            return stateMachine;
        }

        // 获取游戏配置
        const reelStopWindows = SlotGameResultManager.Instance.getReelStopWindows();
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelComp.reelindex];

        // 1. 预旋转上下状态
        const preSpinState = ReelSpinBehaviors.Instance.getPreSpinUpDownState(reelComp, reelStopWindows, subGameKey);
        preSpinState.flagSkipActive = true;
        stateMachine.insert(stateIndex++, preSpinState);

        // 2. 旋转直到停止前的状态
        const spinUntilStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReel(
            SlotManager.Instance.reelMachine.reels,
            reelComp,
            reelStrip,
            subGameKey
        );
        spinUntilStopState.flagSkipActive = true;
        // 开始旋转时开启模糊效果
        spinUntilStopState.addOnStartCallback(() => {
            reelComp._flagBlur = true;
            reelComp.changeNodesToBlurSymbol();
        });
        stateMachine.insert(stateIndex++, spinUntilStopState);

        // 3. 当前滚轮旋转状态
        const currentReelSpinState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReel(
            reelComp,
            reelStrip,
            subGameKey
        );
        currentReelSpinState.flagSkipActive = true;
        stateMachine.insert(stateIndex++, currentReelSpinState);

        // 4. 缓动配置（从旋转控制信息中获取）
        let postEasingType: string | undefined;
        let postEasingRate: number | undefined;
        let postEasingDuration: number | undefined;
        let postEasingDistance: number | undefined;

        if (spinControlInfo) {
            postEasingType = spinControlInfo.postEasingType;
            postEasingRate = spinControlInfo.postEasingRate;
            postEasingDuration = spinControlInfo.postEasingDuration;
            postEasingDistance = spinControlInfo.postEasingDistance;
        }

        // 获取结果符号列表和信息
        const windowData = reelStopWindows.GetWindow(reelComp.reelindex);
        const resultSymbolList = this.getResultSymbolList(windowData, reelComp);
        const resultSymbolInfoList = this.getResultSymbolInfoList(windowData, reelComp);

        // 构建缓动信息
        const easingInfo = new EasingInfo();
        easingInfo.easingType = postEasingType;
        easingInfo.easingDistance = postEasingDistance;
        easingInfo.easingDuration = postEasingDuration;
        easingInfo.easingRate = postEasingRate;

        // 缓动开始时关闭预期效果
        easingInfo.onEasingStartFuncList.push(() => {
            this.setShowExpectEffects(false);
        });

        // 添加自定义缓动函数
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 5. 最终移动状态（带结果符号）
        const finalMoveState = ReelSpinBehaviors.Instance.getReelMoveStateWithLastSymbolListNew(
            reelComp,
            resultSymbolList,
            subGameKey,
            easingInfo,
            resultSymbolInfoList
        );

        // 开始移动前关闭模糊
        finalMoveState.addFrontOnStartCallback(() => {
            reelComp._flagBlur = false;
        });

        // 最后一个滚轮停止时停止旋转音效
        finalMoveState.addOnEndCallback(() => {
            if (reelComp.reelindex === 4) {
                SlotManager.Instance.stopReelSpinSound();
            }
        });
        stateMachine.insert(stateIndex++, finalMoveState);

        // 6. 收尾状态（重置位置、恢复音量、触发回调）
        const finalState = new State();
        finalState.addOnStartCallback(() => {
            // 重置滚轮组件位置
            reelComp.resetPositionOfReelComponents();
            
            // 最后一个滚轮时恢复主音量
            if (reelComp.reelindex === SlotManager.Instance.reelMachine.reels.length - 1) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }

            // 设置预期效果状态
            SlotManager.Instance.setPlayReelExpectEffectState(reelComp.reelindex + 1);
            
            // 处理旋转结束逻辑
            this.processSpinEnd(() => {
                finalState.setDone();
            });
        });
        stateMachine.insert(stateIndex++, finalState);

        return stateMachine;
    }

    /**
     * 获取结果特殊符号信息列表
     * @param window 滚轮窗口数据
     * @param reel 滚轮组件实例
     * @returns 特殊符号信息列表
     */
    getResultSpecialSymbolInfoList(window: any, reel: Reel_HundredDollar): SpecialSymbolInfo[] {
        const specialSymbolInfoList: SpecialSymbolInfo[] = [];
        let offset = 0;

        // 计算偏移量（补全符号数量）
        const requiredSymbolCount = reel.visibleRow + 2 * reel.bufferRow;
        if (window.size < requiredSymbolCount) {
            offset = (requiredSymbolCount - window.size) / 2;
        }

        // 遍历窗口符号，检测特殊符号
        const windowRange = SlotManager.Instance.getWindowRange();
        for (let i = window.size - 1; i >= 0; --i) {
            let specialType = SpecialType.NONE;
            const symbolIndex = i - 1;

            // 检测FEVER特殊类型
            if (TSUtility.isValid(windowRange[reel.reelindex])) {
                const [start, end] = windowRange[reel.reelindex];
                if (symbolIndex >= start && symbolIndex < end) {
                    if (SlotManager.Instance.isCheckSpecialInfo(SpecialType.FEVER, reel.reelindex, symbolIndex)) {
                        specialType |= SpecialType.FEVER;
                    }
                }
            }

            specialSymbolInfoList.push(new SpecialSymbolInfo(specialType));
        }

        // 补充空的特殊符号信息（补全偏移量）
        for (let i = 0; i < offset; ++i) {
            specialSymbolInfoList.push(new SpecialSymbolInfo(SpecialType.NONE));
        }

        return specialSymbolInfoList;
    }
}