// 游戏专属模块
import RainbowPearlManager from './RainbowPearlManager';
import ReelMachine_RainbowPearl from './ReelMachine_RainbowPearl';
import JackpotSymbol_RainbowPearl from './JackpotSymbol_RainbowPearl';
import GameComponents_RainbowPearl from './GameComponents_RainbowPearl';
import ReelController_Base from '../../ReelController_Base';
import Reel from '../../Slot/Reel';
import SlotSoundController from '../../Slot/SlotSoundController';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import Symbol from '../../Slot/Symbol';
import SlotManager from '../../manager/SlotManager';
import State, { SequencialState } from '../../Slot/State';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotUIRuleManager from '../../Slot/rule/SlotUIRuleManager';
import ReelSpinBehaviors, { EasingInfo } from '../../ReelSpinBehaviors';
import SoundManager from '../../manager/SoundManager';
import { Window } from '../../manager/SlotGameRuleManager';

const { ccclass, property } = cc._decorator;

/**
 * RainbowPearl滚轮控制器（继承自基础滚轮控制器）
 * 负责滚轮旋转/停止逻辑、音效、Jackpot模式符号动画、Linked Jackpot状态管理
 */
@ccclass('ReelController_RainbowPearl')
export default class ReelController_RainbowPearl extends ReelController_Base {
    /** 虚拟符号ID列表（Jackpot模式填充用） */
    public dummySymbolList: number[] = [];
    /** 滚轮停止时的缓动函数列表 */
    public easingFuncListOnSpinEnd: Function[] = [];

    /**
     * 组件加载时初始化
     */
    public onLoad(): void {
        // 初始化虚拟符号列表
        this.dummySymbolList.push(21, 22, 23, 15, 14, 13, 12, 11);

        // 添加滚轮停止时的缓动回调（处理音效和模糊 shader）
        this.easingFuncListOnSpinEnd.push(() => {
            const reelComp = this.node.getComponent(Reel);
            if (!reelComp) return;

            // 播放滚轮停止音效
            this.playReelStopSound();

            // 最后一列滚轮停止时关闭旋转音效
            if (reelComp.reelindex === 4) {
                this.node.runAction(cc.sequence(
                    cc.delayTime(0.26),
                    cc.callFunc(() => {
                        SlotSoundController.Instance().stopAudio("ReelSpin", "FXLoop");
                        SlotSoundController.Instance().stopAudio("ReelExpect", "FX");
                    })
                ));
            }

            // 重置滚轮模糊偏移
            reelComp.setShaderValue("blurOffset", 0);
        });
    }

    /**
     * 处理滚轮旋转停止后的逻辑（分基础/Jackpot模式）
     * @param callback 停止完成后的回调函数
     */
    public processSpinEnd(callback: () => void): void {
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();

        // 基础游戏模式逻辑
        if (currentSubGameKey === "base") {
            this.processBaseGameSpinEnd(callback);
        }
        // Lock&Roll（Jackpot）模式逻辑
        else if (currentSubGameKey === "lockNRoll") {
            this.processLockNRollSpinEnd(callback);
        }
        // 其他模式直接执行回调
        else {
            callback();
        }
    }

    /**
     * 处理基础游戏模式滚轮停止逻辑
     * @param callback 停止完成后的回调函数
     */
    private processBaseGameSpinEnd(callback: () => void): void {
        const reelComp = this.node.getComponent(Reel);
        if (!reelComp) {
            callback();
            return;
        }

        const visibleWindow = SlotGameResultManager.Instance.getVisibleSlotWindows().GetWindow(reelComp.reelindex);
        let hasBurstSymbol = false; // 是否有Burst符号
        let hasJackpotSymbol = false; // 是否有Jackpot符号
        const animNodes: cc.Node[] = []; // 动画节点列表

        // 统计全局90/92符号数量（Jackpot相关符号）
        let jackpotSymbolCount = 0;
        for (let col = 0; col < 5; ++col) {
            for (let row = 0; row < 3; ++row) {
                const symbolId = SlotGameResultManager.Instance.getVisibleSlotWindows().GetWindow(col).getSymbol(row);
                if (symbolId === 90 || symbolId === 92) {
                    jackpotSymbolCount++;
                }
            }
        }

        // 处理当前滚轮的符号动画
        for (let row = 0; row < visibleWindow.size; ++row) {
            const symbolId = visibleWindow.getSymbol(row);
            // 处理Jackpot符号（90/92）
            if (symbolId === 90 || symbolId === 92) {
                const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[reelComp.reelindex][row];
                // 播放符号动画
                const animNode = SymbolAnimationController.Instance.playAnimationSymbol(
                    reelComp.reelindex, row, symbolId + 10, "", null, false
                );
                animNodes.push(animNode);

                // 设置Jackpot符号中心信息
                const jackpotSymbolComp = animNode.getComponent(JackpotSymbol_RainbowPearl);
                if (jackpotSymbolComp) {
                    const prizeType = symbolInfo.type === "multiplier" ? 0 : 5;
                    jackpotSymbolComp.setCenterInfoRainbowPearl(prizeType, symbolInfo.prize);
                }

                // 隐藏原符号
                reelComp.hideSymbolInRow(row);
                hasJackpotSymbol = true;
            }

            // 处理Burst符号（94）且有Jackpot符号时
            if (symbolId === 94 && jackpotSymbolCount > 0) {
                const animNode = SymbolAnimationController.Instance.playAnimationSymbol(
                    reelComp.reelindex, row, 104, "", null, false
                );
                animNodes.push(animNode);
                reelComp.hideSymbolInRow(row);
                hasBurstSymbol = true;
            }
        }

        // 有动画时延迟执行回调，否则直接执行
        if (hasBurstSymbol || hasJackpotSymbol) {
            const delayTime = 0.33;
            // 播放对应音效
            if (hasBurstSymbol) {
                SlotSoundController.Instance().playAudio("BurstAppear", "FX");
            }
            if (hasJackpotSymbol) {
                // 计算当前滚轮前的Jackpot符号数量
                let prevJackpotCount = 0;
                for (let col = 0; col < reelComp.reelindex; ++col) {
                    const winWindow = SlotGameResultManager.Instance.getVisibleSlotWindows().GetWindow(col);
                    if (winWindow.getSymbol(0) === 90 || winWindow.getSymbol(0) === 92) {
                        prevJackpotCount++;
                    }
                }
                SlotSoundController.Instance().playAudio(`JackpotAppear_${prevJackpotCount}`, "FX");
            }

            this.node.runAction(cc.sequence(
                cc.delayTime(delayTime),
                cc.callFunc(callback)
            ));
        } else {
            callback();
        }
    }

    /**
     * 处理Lock&Roll（Jackpot）模式滚轮停止逻辑
     * @param callback 停止完成后的回调函数
     */
    private processLockNRollSpinEnd(callback: () => void): void {
        const reelComp = this.node.getComponent(Reel);
        if (!reelComp) {
            callback();
            return;
        }

        let hasJackpotSymbol = false;
        const animNodes: cc.Node[] = [];
        const symbolComp = reelComp.getSymbol(0)?.getComponent(Symbol);
        if (!symbolComp) {
            callback();
            return;
        }

        const symbolId = symbolComp.symbolId;
        // 处理90-93区间的Jackpot符号
        if (symbolId >= 90 && symbolId < 94) {
            const col = Math.floor(reelComp.reelindex / 3);
            const row = Math.floor(reelComp.reelindex % 3);
            const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[col][row];
            
            // 播放对应动画（90/91 → 100，其他 → 102）
            const animSymbolId = (symbolId === 90 || symbolId === 91) ? 100 : 102;
            const animNode = SymbolAnimationController.Instance.playAnimationSymbol(
                col, row, animSymbolId, "", null, false
            );
            animNodes.push(animNode);

            // 设置Jackpot符号中心信息
            const jackpotSymbolComp = animNode.getComponent(JackpotSymbol_RainbowPearl);
            if (jackpotSymbolComp) {
                const prizeType = symbolInfo.type === "multiplier" ? 0 : 5;
                jackpotSymbolComp.setCenterInfoRainbowPearl(prizeType, symbolInfo.prize);
            }

            // 隐藏原符号
            reelComp.hideSymbolInRow(0);
            hasJackpotSymbol = true;
        }

        // 有Jackpot符号时延迟执行回调
        if (hasJackpotSymbol) {
            const delayTimeVal = 0.33;
            // 计算当前滚轮前的有效Jackpot符号数量
            let prevValidJackpotCount = 0;
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            const jackpotFixComp = SlotManager.Instance.getComponent(GameComponents_RainbowPearl)?.jackpotSymbolFixComponent;
            
            for (let idx = 0; idx < reelComp.reelindex; ++idx) {
                const col = Math.floor(reelComp.reelindex / 3);
                const row = Math.floor(reelComp.reelindex % 3);
                const symbolId = lastHistoryWindows.GetWindow(col).getSymbol(row);
                
                // 符号在90-93区间且未被固定时计数
                if (symbolId >= 90 && symbolId < 94) {
                    if (!jackpotFixComp?.fixJackpotSymbolObject[col][row]) {
                        prevValidJackpotCount++;
                    }
                }
            }

            // 限制最大计数为4
            prevValidJackpotCount = Math.min(prevValidJackpotCount, 4);
            SlotSoundController.Instance().playAudio(`JackpotAppear_${prevValidJackpotCount}`, "FX");

            this.node.runAction(cc.sequence(
                cc.delayTime(delayTimeVal),
                cc.callFunc(callback)
            ));
        } else {
            callback();
        }
    }

    /**
     * 获取Linked Jackpot模式下的滚轮旋转状态
     * @returns SequencialState 组合后的时序状态
     */
    public getLinkedJackpotSpinState(): SequencialState {
        const seqState = new SequencialState();
        // 节点未激活时直接返回空状态
        if (!this.node.active) {
            return seqState;
        }

        let stateIndex = 0;
        const reelComp = this.node.getComponent(Reel);
        if (!reelComp) {
            return seqState;
        }

        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const reelMachine = RainbowPearlManager.getInstance().reelMachine.getComponent(ReelMachine_RainbowPearl);
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(currentSubGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(currentSubGameKey)?.infoList[reelComp.reelindex];

        // 1. 添加Linked Jackpot预停止旋转状态
        const preStopSpinState = this.getReelSpinStateUntileStopBeforeReelInLinkedJackpot(
            reelMachine.jackpotReels, reelComp, reelStrip, currentSubGameKey
        );
        preStopSpinState.flagSkipActive = true;
        preStopSpinState.addOnStartCallback(() => {
            reelComp.setShaderValue("blurOffset", 0.02);
        });
        seqState.insert(stateIndex++, preStopSpinState);

        // 2. 添加滚轮刷新旋转状态
        const renewalSpinState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReelRenewal(
            reelMachine.jackpotReels, reelComp, reelStrip, currentSubGameKey
        );
        renewalSpinState.flagSkipActive = true;
        seqState.insert(stateIndex++, renewalSpinState);

        // 3. 构建缓动信息
        const easingInfo = new EasingInfo();
        if (spinControlInfo) {
            easingInfo.easingType = spinControlInfo.postEasingType;
            easingInfo.easingRate = spinControlInfo.postEasingRate;
            easingInfo.easingDuration = spinControlInfo.postEasingDuration;
            easingInfo.easingDistance = spinControlInfo.postEasingDistance;
        }

        // 获取Jackpot结果窗口和符号列表
        const jackpotResultWindow = this.getLinkedJackpotResultWindow(lastHistoryWindows, reelComp.reelindex);
        const resultSymbolList = this.getResultSymbolListJackpot(jackpotResultWindow, reelComp);
        const resultSymbolInfoList = this.getResultSymbolInfoListJackpotMode(jackpotResultWindow, reelComp.reelindex);

        // 缓动开始时关闭预期特效
        easingInfo.onEasingStartFuncList.push(() => {
            this.setShowExpectEffects(false);
        });
        // 添加停止时的缓动函数
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 4. 添加滚轮移动到最终符号的状态
        const reelMoveState = ReelSpinBehaviors.Instance.getReelMoveStateWithLastSymbolListNew(
            reelComp, resultSymbolList, currentSubGameKey, easingInfo, resultSymbolInfoList
        );
        reelMoveState.addOnEndCallback(() => {
            // 最后一列滚轮停止时关闭旋转音效
            if (reelComp.reelindex === 4) {
                SlotManager.Instance.stopReelSpinSound();
            }
        });
        seqState.insert(stateIndex++, reelMoveState);

        // 5. 添加停止后的重置状态
        const resetState = new State();
        resetState.addOnStartCallback(() => {
            // 重置滚轮组件位置和shader
            reelComp.resetPositionOfReelComponents();
            reelComp.setShaderValue("blurOffset", 0);

            // 最后一列滚轮时重置主音量
            if (reelComp.reelindex === SlotManager.Instance.reelMachine.reels.length - 1) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }

            // 更新预期特效状态并处理停止逻辑
            SlotManager.Instance.setPlayReelExpectEffectState(reelComp.reelindex + 1);
            this.processSpinEnd(resetState.setDone.bind(resetState));
        });
        seqState.insert(stateIndex++, resetState);

        return seqState;
    }

    /**
     * 获取Linked Jackpot模式下的结果窗口
     * @param historyWindows 历史窗口数据
     * @param reelIndex 滚轮索引
     * @returns SlotGameRuleManager.Window 结果窗口
     */
    public getLinkedJackpotResultWindow(historyWindows: any, reelIndex: number): any {
        const resultWindow = new Window(1);
        const col = Math.floor(reelIndex / 3);
        const row = Math.floor(reelIndex % 3);
        resultWindow.setSymbol(0, historyWindows.GetWindow(col).getSymbol(row));
        return resultWindow;
    }

    /**
     * 获取Jackpot模式下的符号信息列表
     * @param resultWindow 结果窗口
     * @param reelIndex 滚轮索引
     * @returns any[] 符号信息数组
     */
    public getResultSymbolInfoListJackpotMode(resultWindow: any, reelIndex: number): any[] | null {
        const col = Math.floor(reelIndex / 3);
        const row = Math.floor(reelIndex % 3);
        const symbolInfoWindow = SlotGameResultManager.Instance._gameResult?.spinResult?.symbolInfoWindow;
        
        // 校验数据有效性
        if (!symbolInfoWindow || !symbolInfoWindow[col] || !symbolInfoWindow[col][row]) {
            return null;
        }

        return [symbolInfoWindow[col][row]];
    }

    /**
     * 获取Linked Jackpot模式下滚轮预停止的旋转状态
     * @param jackpotReels Jackpot滚轮数组
     * @param reelComp 滚轮组件
     * @param reelStrip 滚轮条配置
     * @param subGameKey 子游戏标识
     * @returns State 预停止旋转状态
     */
    public getReelSpinStateUntileStopBeforeReelInLinkedJackpot(
        jackpotReels: ReelController_Base[],
        reelComp: Reel,
        reelStrip: any,
        subGameKey: string
    ): State {
        const preStopState = new State();
        const reelConfig = reelStrip.getReel(reelComp.reelindex);
        let moveAction: cc.ActionInterval | null = null;

        // 检查空白符号并控制下一个符号索引
        reelConfig.checkBlankSymbolAndControlNextSymbolIndex(reelComp);

        preStopState.addOnStartCallback(() => {
            let totalDelayTime = 0;
            let colCount = 0;
            let isFirstActiveReel = false;
            let startCol = 0;

            // 计算起始列（根据子游戏模式）
            if (subGameKey === "lockNRoll" || subGameKey === "lockNRoll_fromchoose") {
                startCol = reelComp.reelindex - Math.floor(reelComp.reelindex % 3);
            } else if (subGameKey === "lockNRollFreespin") {
                startCol = reelComp.reelindex < 3 ? 0 : 3;
            }

            // 计算前置滚轮的延迟时间
            for (let idx = 0; idx < startCol; ++idx) {
                colCount++;
                const prevReelComp = jackpotReels[idx]?.getComponent(Reel);
                if (prevReelComp?.node.active && prevReelComp.reelindex < reelComp.reelindex && !isFirstActiveReel) {
                    totalDelayTime += prevReelComp.getReelSpinTime(subGameKey);
                    totalDelayTime += prevReelComp.getReelStopTime(subGameKey);
                    isFirstActiveReel = true;
                }
                // 每3列重置激活标记
                if (colCount === 3) {
                    colCount = 0;
                    isFirstActiveReel = false;
                }
            }

            // 获取旋转控制参数
            let symbolMoveSpeed = 0;
            let symbolHeight = 0;
            const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reelComp.reelindex];
            if (spinControlInfo) {
                symbolMoveSpeed = spinControlInfo.oneSymbolMoveSpeed;
                symbolHeight = spinControlInfo.symbolHeight;
            }

            // 计算移动距离和动作
            const moveDistance = totalDelayTime / symbolMoveSpeed;
            const moveVec = new cc.Vec2(0, -moveDistance * symbolHeight);
            const moveByAction = cc.moveBy(totalDelayTime, moveVec);

            // 设置下一个符号ID回调
            reelComp.setNextSymbolIdCallback(() => {
                const nextSymbolId = reelConfig.getNextSymbolId();
                reelConfig.increaseNextSymbolIndex();
                return nextSymbolId;
            });

            // 执行移动动作
            moveAction = this.node.runAction(cc.sequence(
                moveByAction,
                cc.callFunc(preStopState.setDone.bind(preStopState))
            )) as cc.ActionInterval;
        });

        // 状态结束时停止未完成的动作
        preStopState.addOnEndCallback(() => {
            if (moveAction && !moveAction.isDone()) {
                this.node.stopAction(moveAction);
            }
        });

        return preStopState;
    }

    /**
     * 获取Jackpot模式下的结果符号列表
     * @param resultWindow 结果窗口
     * @param reelComp 滚轮组件
     * @returns number[] 符号ID列表
     */
    public getResultSymbolListJackpot(resultWindow: any, reelComp: Reel): number[] {
        const symbolList: number[] = [];
        const requiredSymbolCount = reelComp.visibleRow + 2 * reelComp.bufferRow;
        
        // 计算需要补充的符号数量
        let supplementCount = 0;
        if (resultWindow.size < requiredSymbolCount) {
            supplementCount = Math.floor((requiredSymbolCount - resultWindow.size) / 2);
        }

        // 倒序添加现有符号
        for (let i = resultWindow.size - 1; i >= 0; --i) {
            symbolList.push(resultWindow.getSymbol(i));
        }

        // 随机生成补充符号（优先90/92，否则用虚拟符号）
        const randomVal = Math.random();
        let randomSymbolId = 0;
        if (randomVal < 0.5) {
            randomSymbolId = 90;
        } else if (randomVal < 0.8) {
            randomSymbolId = 92;
        }

        // 补充符号到列表
        for (let i = 0; i < supplementCount; ++i) {
            if (i === 0 && randomSymbolId !== 0) {
                symbolList.push(randomSymbolId);
            } else {
                const randomDummyIdx = Math.floor(Math.random() * this.dummySymbolList.length);
                symbolList.push(this.dummySymbolList[randomDummyIdx]);
            }
        }

        return symbolList;
    }
}