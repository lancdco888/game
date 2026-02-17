
import Reel_SharkAttack from './Reel_SharkAttack';
import JackpotSymbol_SharkAttack from './JackpotSymbol_SharkAttack';
import GameComponents_SharkAttack from './GameComponents_SharkAttack';
import ReelController_Base from '../../ReelController_Base';
import Reel from '../../Slot/Reel';
import SlotSoundController from '../../Slot/SlotSoundController';
import State, { SequencialState } from '../../Slot/State';
import SlotUIRuleManager from '../../Slot/rule/SlotUIRuleManager';
import ReelSpinBehaviors, { EasingInfo } from '../../ReelSpinBehaviors';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotManager from '../../manager/SlotManager';
import SoundManager from '../../manager/SoundManager';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import SymbolPoolManager from '../../manager/SymbolPoolManager';
import SymbolAni from '../../Slot/SymbolAni';
import SlotUIRuleManager_SharkAttack from './SlotUIRuleManager_SharkAttack';

const { ccclass, property } = cc._decorator;

/**
 * 鲨鱼攻击游戏滚轮控制器
 * 继承自ReelController_Base，负责滚轮旋转/停止全流程、特殊符号动画/音效、缓动控制、无限旋转等核心逻辑
 */
@ccclass('ReelController_SharkAttack')
export default class ReelController_SharkAttack extends ReelController_Base {
    // 滚轮停止前的计时
    public timeToStopBeforeReel: number = 0;
    // 滚轮信息索引
    public reelInfoIndex: number = 0;
    // 结果符号列表
    public arrResultSymbolList: number[] = [];

    /**
     * 生命周期：组件加载
     */
    onLoad(): void {
        const self = this;
        // 初始化虚拟符号列表
        this.dummySymbolList.push(31);
        this.dummySymbolList.push(24);
        this.dummySymbolList.push(23);
        this.dummySymbolList.push(22);
        this.dummySymbolList.push(21);
        this.dummySymbolList.push(14);
        this.dummySymbolList.push(13);
        this.dummySymbolList.push(12);
        this.dummySymbolList.push(11);
        this.dummySymbolList.push(10);

        // 绑定滚轮旋转结束的缓动回调（处理音效和模糊效果）
        this.easingFuncListOnSpinEnd.push(function() {
            const reelComp = self.node.getComponent(Reel)!;
            // 播放滚轮停止音效（前5个滚轮）
            if (reelComp.reelindex < 5) {
                self.playReelStopSound();
            }
            // 重置模糊偏移
            reelComp.setShaderValue("blurOffset", 0);
            // 第4个滚轮停止时关闭旋转音效
            if (reelComp.reelindex === 4) {
                self.node.runAction(cc.sequence(
                    cc.delayTime(0.26),
                    cc.callFunc(() => {
                        SlotSoundController.Instance().stopAudio("ReelSpin", "FXLoop");
                        SlotSoundController.Instance().stopAudio("ReelExpect", "FX");
                    })
                ));
            }
        });
    }

    /**
     * 获取预旋转的上下状态
     * @param reel 滚轮组件
     * @param windows 滚轮窗口数据
     * @param subGameKey 子游戏Key
     * @returns 预旋转状态
     */
    getPreSpinUpDownState(reel: Reel, windows: any, subGameKey: string | null): State {
        const preSpinState = new State();
        let preSpinAction: any = null;

        preSpinState.addOnStartCallback(function(this: ReelController_SharkAttack) {
            // 设置滚轮旋转方向为向下
            reel.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);
            reel.originalYPos = reel.node.y;

            let preEasingType: string | null = null;
            let preEasingRate: number | null = null;
            let preEasingDuration: number | null = null;
            let preEasingDistance: number | null = null;
            let oneSymbolMoveSpeed: number | null = null;

            // 获取预旋转控制信息
            if (subGameKey != null) {
                const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey);
                const reelInfo = spinControlInfo.infoList[reel.reelindex % 5];
                preEasingType = reelInfo.preEasingType;
                preEasingRate = reelInfo.preEasingRate;
                preEasingDuration = reelInfo.preEasingDuration;
                preEasingDistance = reelInfo.preEasingDistance;
                oneSymbolMoveSpeed = reelInfo.oneSymbolMoveSpeed;
            }

            // 无缓动时长则直接完成状态
            if (preEasingDuration! <= 0) {
                preSpinState.setDone();
                return;
            }

            // 创建缓动移动动画
            const easeAction = ReelSpinBehaviors.Instance.getEaseAction(preEasingType!, preEasingRate!);
            const move1 = cc.moveBy(preEasingDuration!, new cc.Vec2(0, preEasingDistance!)).easing(easeAction);
            const move2 = cc.moveBy((oneSymbolMoveSpeed! / 5), new cc.Vec2(0, -preEasingDistance!));
            
            // 执行动画序列
            preSpinAction = reel.node.runAction(cc.sequence(
                move1,
                move2,
                cc.callFunc(preSpinState.setDone.bind(preSpinState))
            ));
        }.bind(this));

        // 状态结束时停止未完成的动画
        preSpinState.addOnEndCallback(function() {
            if (preSpinAction != null && !preSpinAction.isDone()) {
                reel.node.stopAction(preSpinAction);
            }
        });

        return preSpinState;
    }

    /**
     * 获取滚轮旋转的核心状态（组合多个子状态）
     * @returns 滚轮旋转的序列状态
     */
    getSpinState(): SequencialState {
        const self = this;
        const spinSequenceState = new SequencialState();

        // 节点未激活则直接返回空状态
        if (this.node.active === false) {
            return spinSequenceState;
        }

        // 初始化状态变量
        this.arrResultSymbolList = [];
        this.timeToStopBeforeReel = 0;
        this.reelInfoIndex = 0;

        let stateIndex = 0;
        const reelComp = this.node.getComponent(Reel_SharkAttack) as any;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelComp.reelindex % 5];

        // 1. 滚轮旋转到停止前的状态
        const reelSpinBeforeStopState = this.getReelSpinStateUntileStopBeforeReel(
            SlotManager.Instance.reelMachine.reels,
            reelComp,
            reelStrip,
            subGameKey
        );
        reelSpinBeforeStopState.flagSkipActive = true;
        reelSpinBeforeStopState.addOnStartCallback(function() {
            reelComp.setShaderValue("blurOffset", 0.02);
        });
        spinSequenceState.insert(stateIndex++, reelSpinBeforeStopState);

        // 2. 当前滚轮的旋转状态
        const currentReelSpinState = this.getReelSpinStateCurrentReel(reelComp, reelStrip, subGameKey);
        currentReelSpinState.flagSkipActive = true;
        spinSequenceState.insert(stateIndex++, currentReelSpinState);

        // 3. 解析后缓动参数
        let postEasingType: string | undefined;
        let postEasingRate: number | undefined;
        let postEasingDuration: number | undefined;
        let postEasingDistance: number | undefined;
        if (spinControlInfo != null) {
            postEasingType = spinControlInfo.postEasingType;
            postEasingRate = spinControlInfo.postEasingRate;
            postEasingDuration = spinControlInfo.postEasingDuration;
            postEasingDistance = spinControlInfo.postEasingDistance;
        }

        // 4. 获取结果符号列表（前5个滚轮）
        if (reelComp.reelindex < 5) {
            this.arrResultSymbolList = this.getResultSymbolList(
                lastHistoryWindows.GetWindow(reelComp.reelindex % 5),
                reelComp
            );
        } else {
            // 超出5个滚轮则复用前5个的结果
            const targetReel = SlotManager.Instance.reelMachine.reels[reelComp.reelindex % 5];
            this.arrResultSymbolList = targetReel.arrResultSymbolList;
        }

        // 5. 获取结果符号信息列表
        const resultSymbolInfoList = this.getResultSymbolInfoList(
            lastHistoryWindows.GetWindow(reelComp.reelindex % 5),
            reelComp
        );

        // 6. 创建缓动信息对象
        const easingInfo = new EasingInfo();
        easingInfo.easingType = postEasingType;
        easingInfo.easingDistance = postEasingDistance;
        easingInfo.easingDuration = postEasingDuration;
        easingInfo.easingRate = postEasingRate;
        easingInfo.onEasingStartFuncList.push(function() {
            self.setShowExpectEffects(false);
        });
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 7. 滚轮移动到最终符号列表的状态
        const reelMoveToFinalState = this.getReelMoveStateWithLastSymbolListNew(
            reelComp,
            this.arrResultSymbolList,
            subGameKey,
            easingInfo,
            resultSymbolInfoList
        );
        reelMoveToFinalState.addOnEndCallback(function() {
            // 第4个滚轮停止时关闭旋转音效
            if (reelComp.reelindex === 4) {
                SlotManager.Instance.stopReelSpinSound();
            }
        });
        spinSequenceState.insert(stateIndex++, reelMoveToFinalState);

        // 8. 旋转结束后的清理状态
        const spinEndState = new State();
        spinEndState.addOnStartCallback(function() {
            // 重置滚轮组件位置
            reelComp.resetPositionOfReelComponents();
            reelComp.setShaderValue("blurOffset", 0);

            // 前5个滚轮的特殊处理
            if (reelComp.reelindex < 5) {
                // 最后一个滚轮恢复主音量
                if (SlotManager.Instance.reelMachine.reels.length - 1 === reelComp.reelindex) {
                    SoundManager.Instance().resetTemporarilyMainVolume();
                }
                // 设置期望效果播放状态
                SlotManager.Instance.setPlayReelExpectEffectState(reelComp.reelindex + 1);
                // 第1个滚轮检查扩展状态
                if (reelComp.reelindex === 1) {
                    SlotManager.Instance.getComponent(GameComponents_SharkAttack)!.reelExpandComponent.getCheckExpandState();
                }
            }

            // 处理旋转结束逻辑
            self.processSpinEnd(spinEndState.setDone.bind(spinEndState));
        });
        spinSequenceState.insert(stateIndex++, spinEndState);

        return spinSequenceState;
    }

    /**
     * 获取滚轮旋转到停止前的状态
     * @param reels 滚轮数组
     * @param reel 目标滚轮
     * @param reelStrip 滚轮符号条
     * @param subGameKey 子游戏Key
     * @returns 滚轮旋转状态
     */
    getReelSpinStateUntileStopBeforeReel(
        reels: ReelController_SharkAttack[],
        reel: Reel_SharkAttack,
        reelStrip: any,
        subGameKey: string | null
    ): State {
        const self = this;
        const spinBeforeStopState = new State();
        const reelStripData = reelStrip.getReel(reel.reelindex % 5);
        let spinAction: any = null;

        // 初始化滚轮信息索引
        if (reel.reelindex < 5) {
            this.reelInfoIndex = Math.floor(Math.random() * reelStripData.getSymbolSize());
        } else {
            this.reelInfoIndex = reels[reel.reelindex % 5].reelInfoIndex;
        }

        spinBeforeStopState.addOnStartCallback(function() {
            // 设置旋转方向为向下
            reel.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);

            // 计算所有前置滚轮的停止时间总和
            for (let f = 0; f < 5; ++f) {
                const targetReel = reels[f].getComponent(Reel)!;
                if (targetReel.node.active === true && targetReel.reelindex < reel.reelindex) {
                    self.timeToStopBeforeReel += targetReel.getReelSpinTime(subGameKey);
                    self.timeToStopBeforeReel += targetReel.getReelStopTime(subGameKey);
                }
            }

            // 超出5个滚轮则复用前置滚轮的计时
            if (reel.reelindex > 4) {
                const targetReel = reels[reel.reelindex % 5];
                self.timeToStopBeforeReel = targetReel.timeToStopBeforeReel;
            }

            // 获取滚轮控制参数
            let oneSymbolMoveSpeed: number | null = null;
            let symbolHeight: number | null = null;
            if (subGameKey != null) {
                const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey);
                const reelInfo = spinControlInfo.infoList[reel.reelindex % 5];
                oneSymbolMoveSpeed = reelInfo.oneSymbolMoveSpeed;
                symbolHeight = reelInfo.symbolHeight;
            }

            // 计算移动距离和动画
            const moveCount = self.timeToStopBeforeReel / oneSymbolMoveSpeed!;
            const moveAction = cc.moveBy(
                self.timeToStopBeforeReel,
                new cc.Vec2(0, -moveCount * symbolHeight!)
            );

            // 设置下一个符号ID的回调
            reel.setNextSymbolIdCallback(function() {
                const symbolId = reelStripData.getSymbolId(self.reelInfoIndex);
                self.reelInfoIndex = (self.reelInfoIndex + 1) % reelStripData.getSymbolSize();
                return symbolId;
            });

            // 执行移动动画
            spinAction = reel.node.runAction(cc.sequence(
                moveAction,
                cc.callFunc(spinBeforeStopState.setDone.bind(spinBeforeStopState))
            ));
        });

        // 状态结束时停止未完成的动画
        spinBeforeStopState.addOnEndCallback(function() {
            if (spinAction != null && !spinAction.isDone()) {
                reel.node.stopAction(spinAction);
            }
        });

        return spinBeforeStopState;
    }

    /**
     * 获取当前滚轮的旋转状态
     * @param reel 目标滚轮
     * @param reelStrip 滚轮符号条
     * @param subGameKey 子游戏Key
     * @returns 滚轮旋转状态
     */
    getReelSpinStateCurrentReel(
        reel: Reel_SharkAttack,
        reelStrip: any,
        subGameKey: string | null
    ): State {
        const self = this;
        const currentSpinState = new State();
        const reelStripData = reelStrip.getReel(reel.reelindex % 5);
        let spinAction: any = null;

        // 初始化滚轮信息索引
        if (reel.reelindex < 5) {
            this.reelInfoIndex = Math.floor(Math.random() * reelStripData.getSymbolSize());
        } else {
            const reels = SlotManager.Instance.reelMachine.reels;
            this.reelInfoIndex = reels[reel.reelindex % 5].reelInfoIndex;
        }

        currentSpinState.addOnStartCallback(function() {
            // 设置旋转方向为向下
            reel.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);

            // 获取滚轮控制参数
            let oneSymbolMoveSpeed: number | null = null;
            let symbolHeight: number | null = null;
            let maxSpeedInExpectEffect: number | null = null;
            if (subGameKey != null) {
                const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey);
                const reelInfo = spinControlInfo.infoList[reel.reelindex % 5];
                oneSymbolMoveSpeed = reelInfo.oneSymbolMoveSpeed;
                symbolHeight = reelInfo.symbolHeight;
                maxSpeedInExpectEffect = reelInfo.maxSpeedInExpectEffect;
            }

            // 计算旋转时间和速度
            const spinTime = reel.getReelSpinTime(subGameKey);
            const moveSpeed = SlotUIRuleManager.Instance.getExpectEffectFlag(
                reel.reelindex % 5,
                SlotGameResultManager.Instance.getVisibleSlotWindows()
            ) ? maxSpeedInExpectEffect! : oneSymbolMoveSpeed!;
            const moveCount = Math.floor(spinTime / moveSpeed);
            const moveAction = cc.moveBy(
                spinTime,
                new cc.Vec2(0, -moveCount * reel.symbolHeight)
            );

            // 设置下一个符号ID的回调
            reel.setNextSymbolIdCallback(function() {
                const symbolId = reelStripData.getSymbolId(self.reelInfoIndex);
                self.reelInfoIndex = (self.reelInfoIndex + 1) % reelStripData.getSymbolSize();
                return symbolId;
            });

            // 执行移动动画
            spinAction = reel.node.runAction(cc.sequence(
                moveAction,
                cc.callFunc(currentSpinState.setDone.bind(currentSpinState))
            ));
        });

        // 状态结束时的清理逻辑
        currentSpinState.addOnEndCallback(function() {
            if (spinAction != null && !spinAction.isDone()) {
                reel.node.stopAction(spinAction);
            }
            reel.update();
            // 最后一个滚轮旋转时设置不可跳过状态
            if (reel.reelindex === SlotGameRuleManager.Instance._slotWindows.size - 1) {
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE);
            }
        });

        return currentSpinState;
    }

    /**
     * 获取滚轮移动到最终符号列表的状态（含缓动效果）
     * @param reel 目标滚轮
     * @param symbolList 符号列表
     * @param subGameKey 子游戏Key
     * @param easingInfo 缓动信息
     * @param symbolInfoList 符号信息列表
     * @returns 滚轮移动状态
     */
    getReelMoveStateWithLastSymbolListNew(
        reel: Reel_SharkAttack,
        symbolList: number[],
        subGameKey: string | null,
        easingInfo: EasingInfo | null,
        symbolInfoList: any[] | null = null
    ): State {
        const moveState = new State();
        let moveAction: any = null;
        let symbolIndex = 0;
        let symbolInfoIndex = 0;

        // 获取滚轮控制参数
        let symbolHeight: number | null = null;
        let oneSymbolMoveSpeed: number | null = null;
        if (subGameKey != null) {
            const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey);
            const reelInfo = spinControlInfo.infoList[reel.reelindex % 5];
            symbolHeight = reelInfo.symbolHeight;
            oneSymbolMoveSpeed = reelInfo.oneSymbolMoveSpeed;
        }

        moveState.addOnStartCallback(function() {
            // 设置旋转方向为向下
            reel.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);

            // 计算移动基础参数
            const lastSymbol = reel.getLastSymbol();
            const symbolYPos = reel.getPositionY(lastSymbol.node.y);
            const bufferOffset = reel.bufferRow * symbolHeight!;
            
            // 更新滚轮符号
            reel.changeSymbolOutOfReel(symbolList);

            // 计算移动距离（含缓动）
            let moveDistance = 0;
            let easingDistance = 0;
            if (easingInfo != null && easingInfo != null) {
                moveDistance = symbolYPos + (symbolList.length * symbolHeight!) - easingInfo.easingDistance! - bufferOffset;
                easingDistance = easingInfo.easingDistance!;
            } else {
                moveDistance = symbolYPos + symbolList.length * symbolHeight! - bufferOffset;
            }
            const moveTime = Math.abs(oneSymbolMoveSpeed! * (moveDistance / symbolHeight!));

            // 设置下一个符号ID的回调
            reel.setNextSymbolIdCallback(function() {
                let symbolId: number | undefined = undefined;
                if (symbolIndex < symbolList.length) {
                    symbolId = symbolList[symbolIndex];
                    symbolIndex++;
                }
                return symbolId;
            });

            // 设置下一个符号信息的回调
            reel.setNextSymbolInfoCallback(function() {
                let symbolInfo: any = null;
                if (symbolInfoList != null && symbolInfoIndex < symbolInfoList.length) {
                    symbolInfo = symbolInfoList[symbolInfoIndex];
                    symbolInfoIndex++;
                }
                return symbolInfo;
            });

            // 创建基础移动动画
            const baseMove = cc.moveBy(moveTime, new cc.Vec2(0, -moveDistance));
            let easingMove: any = null;

            // 创建缓动动画（如果有缓动信息）
            if (easingInfo != null && easingInfo != null) {
                const easeAction = ReelSpinBehaviors.Instance.getEaseAction(easingInfo.easingType!, easingInfo.easingRate!);
                easingMove = cc.moveBy(easingInfo.easingDuration!, new cc.Vec2(0, -easingDistance)).easing(easeAction);
            }

            // 状态完成回调
            const doneCallback = cc.callFunc(function() {
                moveState.setDone();
            });

            // 组合动画序列
            if (easingMove == null) {
                moveAction = reel.node.runAction(cc.sequence(baseMove, doneCallback));
            } else if (easingInfo!.onEasingStartFuncList.length > 0) {
                // 缓动开始前执行回调
                const easingStartCallback = cc.callFunc(function() {
                    for (let i = 0; i < easingInfo!.onEasingStartFuncList.length; ++i) {
                        easingInfo!.onEasingStartFuncList[i]();
                    }
                });
                moveAction = reel.node.runAction(cc.sequence([baseMove, easingStartCallback, easingMove, doneCallback]));
            } else {
                moveAction = reel.node.runAction(cc.sequence([baseMove, easingMove, doneCallback]));
            }
        });

        // 状态结束时的清理逻辑
        moveState.addOnEndCallback(function() {
            // 停止移动动画
            reel.node.stopAction(moveAction);

            // 补充剩余符号到滚轮顶部
            while (symbolIndex < symbolList.length) {
                if (symbolIndex < symbolList.length) {
                    const symbolId = symbolList[symbolIndex];
                    const symbolInfo = symbolInfoList != null && symbolInfoIndex < symbolInfoList.length ? symbolInfoList[symbolInfoIndex] : null;
                    reel.pushSymbolAtTopOfReel(symbolId, symbolInfo);
                } else {
                    cc.error("invalid status tweenAction");
                }
                symbolIndex++;
                symbolInfoIndex++;
            }

            // 重置滚轮组件位置
            reel.resetPositionOfReelComponents();
        });

        return moveState;
    }

    /**
     * 处理滚轮旋转结束逻辑（特殊符号动画/音效）
     * @param doneCallback 完成回调
     */
    processSpinEnd(doneCallback: () => void): void {
        const reelComp = this.node.getComponent(Reel_SharkAttack)!;

        // 超出5个滚轮直接完成
        if (reelComp.reelindex > 4) {
            doneCallback();
            return;
        }

        // 标记滚轮已停止旋转
        reelComp._isSpinning = false;

        const reelIndex = reelComp.reelindex % 5;
        const windowData = SlotGameResultManager.Instance.getLastHistoryWindows().GetWindow(reelIndex);
        const resultSymbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[reelIndex];

        // 特殊符号状态标记
        let isJackpotSymbol = false;
        let isScatterSymbol = false;
        let isWildSymbol = false;
        let isMultipleWildSymbol = false;

        // 符号动画/信息缓存
        const scatterAniList: cc.Node[] = [];
        const scatterRowList: number[] = [];
        const wildAniList: cc.Node[] = [];
        const wildRowList: number[] = [];

        // 遍历窗口符号
        for (let row = 0; row < windowData.size; ++row) {
            const symbolId = windowData.getSymbol(row);
            const symbolInfo = resultSymbolInfo[row];

            // 1. Jackpot符号（91）处理
            if (symbolId === 91 && this.canPlayingAppearJackpotSymbolEffect(SlotGameResultManager.Instance.getLastHistoryWindows(), reelIndex)) {
                isJackpotSymbol = true;
                // 播放Jackpot符号动画
                const jackpotAni = SymbolAnimationController.Instance.playAnimationSymbol(reelIndex, row, 191);
                jackpotAni.getComponent(JackpotSymbol_SharkAttack)!.setSymbolInfo(symbolInfo);
                // 隐藏原符号
                reelComp.hideSymbolInRow(row);
            }

            // 2. Scatter符号（51）处理
            if (symbolId === 51) {
                if (SlotUIRuleManager_SharkAttack.Instance.canPlayingAppearSymbomEffect(51, SlotGameResultManager.Instance.getLastHistoryWindows(), reelIndex)) {
                    isScatterSymbol = true;
                    // 播放Scatter出现动画
                    const scatterAni = SymbolAnimationController.Instance.playAnimationSymbol(
                        reelIndex, row, 151, null, SlotManager.Instance.reelMachine, false
                    );
                    scatterAniList.push(scatterAni);
                    scatterRowList.push(row);
                    reelComp.hideSymbolInRow(row);
                } else {
                    // 播放Scatter默认动画
                    SymbolAnimationController.Instance.playAnimationSymbol(
                        reelIndex, row, 251, null, SlotManager.Instance.reelMachine, true
                    );
                    reelComp.hideSymbolInRow(row);
                }
            }

            // 3. Wild符号（71/72/73）处理
            if (symbolId === 71 || symbolId === 72 || symbolId === 73) {
                // 播放Wild出现动画
                const wildAni = SymbolAnimationController.Instance.playAnimationSymbol(reelIndex, row, symbolId + 100);
                wildAniList.push(wildAni);
                wildRowList.push(row);
                reelComp.hideSymbolInRow(row);
                // 标记多倍Wild/普通Wild
                isMultipleWildSymbol = symbolId === 73 || symbolId === 72;
                isWildSymbol = true;
            }
        }

        // 播放对应音效
        if (isScatterSymbol) {
            SlotSoundController.Instance().playAudio("ScatterAppear", "FX");
        } else if (isMultipleWildSymbol) {
            SlotSoundController.Instance().playAudio("MultipleWildAppear", "FX");
        } else if (isWildSymbol) {
            SlotSoundController.Instance().playAudio("WildAppear", "FX");
        } else if (isJackpotSymbol) {
            SlotSoundController.Instance().playAudio("JackpotAppear", "FX");
        }

        // 有特殊符号动画则延迟完成
        if (isJackpotSymbol || isScatterSymbol || isWildSymbol) {
            // 重置符号动画层级
            SymbolAnimationController.Instance.resetZorderSymbolAnimation();

            this.scheduleOnce(function() {
                // 释放Scatter动画并播放默认动画
                for (let i = 0; i < scatterAniList.length; ++i) {
                    const scatterAni = scatterAniList[i];
                    SymbolPoolManager.instance.releaseSymbolAni(scatterAni);
                    SymbolAnimationController.Instance.mustPlayAnimationSymbol(
                        reelIndex, scatterRowList[i], 251, null, SlotManager.Instance.reelMachine, true
                    );
                }

                // 释放Wild动画并更新滚轮符号
                for (let i = 0; i < wildAniList.length; ++i) {
                    const wildAni = wildAniList[i];
                    const originalSymbolId = wildAni.getComponent(SymbolAni)!.symbolId - 100;
                    reelComp.changeSymbolSharkAttack(wildRowList[i], originalSymbolId);
                    SymbolPoolManager.instance.releaseSymbolAni(wildAni);
                }

                // 执行完成回调
                doneCallback();
            }, 0.5);
        } else {
            // 无特殊符号直接完成
            doneCallback();
        }

        // 第4个滚轮停止时的额外处理
        if (reelComp.reelindex === 4) {
            // 停止水波纹循环动画
            SlotManager.Instance.getComponent(GameComponents_SharkAttack)!.reelExpandComponent.stopWaterLoop();
            // 停止Scatter期望音效
            SlotSoundController.Instance().stopAudio("ScatterExpect", "FX");
        }
    }

    /**
     * 判断是否可以播放Jackpot符号效果
     * @param windows 窗口数据
     * @param reelIndex 滚轮索引
     * @returns 是否可播放
     */
    canPlayingAppearJackpotSymbolEffect(windows: any, reelIndex: number): boolean {
        // 检查前2个滚轮是否有Wild符号（71-73）
        for (let n = 0; n < 2; ++n) {
            let wildCount = 0;
            const windowData = windows.GetWindow(n);
            for (let i = 0; i < windowData.size; ++i) {
                const symbolId = windowData.getSymbol(i);
                if (symbolId >= 71 && symbolId <= 73) {
                    wildCount++;
                }
            }
            if (wildCount === 0) {
                return false;
            }
        }

        // 检查目标滚轮范围内的Jackpot符号（91）
        let jackpotCount2 = 0; // 第2个滚轮的Jackpot数量
        let jackpotCountOther = 0; // 其他滚轮的Jackpot数量

        for (let n = 2; n < reelIndex + 1; ++n) {
            let jackpotCount = 0;
            const windowData = windows.GetWindow(n);
            for (let i = 0; i < windowData.size; ++i) {
                const symbolId = windowData.getSymbol(i);
                if (symbolId === 91) {
                    jackpotCount++;
                    if (n === 2) {
                        jackpotCount2++;
                    } else {
                        jackpotCountOther++;
                    }
                }
            }
            if (jackpotCount === 0) {
                return false;
            }
        }

        // 第2个滚轮或同时有多个Jackpot符号则返回true
        return reelIndex === 2 || (jackpotCount2 > 0 && jackpotCountOther > 0);
    }

    /**
     * 设置期望效果的显示状态
     * @param isShow 是否显示
     */
    setShowExpectEffects(isShow: boolean): void {
        // 跳过旋转或无期望效果则不处理
        if ((!isShow || SlotManager.Instance.isSkipCurrentSpin) && this.expectEffects.length === 0) {
            return;
        }

        if (!isShow) {
            // 隐藏所有期望效果
            for (let i = 0; i < this.expectEffects.length; ++i) {
                this.expectEffects[i].active = isShow;
            }
        } else {
            // 显示对应行的期望效果
            let targetRow = 0;
            const reelComp = this.getComponent(Reel)!;
            if (reelComp.reelindex > 2) {
                const gaugeReelRow = SlotGameResultManager.Instance.getSubGameState(
                    SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult()
                ).gauges.reelRow;
                targetRow = gaugeReelRow != null ? gaugeReelRow : 0;
            }
            this.expectEffects[targetRow].active = isShow;
        }
    }

    /**
     * 切换期望效果
     * @param index 效果索引
     */
    changeExpectEffect(index: number): void {
        if (this.expectEffects.length === 0) {
            return;
        }

        // 隐藏所有效果
        for (let i = 0; i < this.expectEffects.length; ++i) {
            this.expectEffects[i].active = false;
        }

        // 显示目标效果
        this.expectEffects[index].active = true;
    }

    /**
     * 获取结果符号列表（含虚拟符号补充）
     * @param windowData 窗口数据
     * @param reel 滚轮组件
     * @returns 结果符号列表
     */
    getResultSymbolList(windowData: any, reel: Reel_SharkAttack): number[] {
        const symbolList: number[] = [];
        let offset = 0;

        // 计算需要补充的虚拟符号数量
        const requiredSymbolCount = reel.visibleRow + 2 * reel.bufferRow;
        if (windowData.size < requiredSymbolCount) {
            offset = Math.floor((requiredSymbolCount - windowData.size) / 2);
        }

        // 反向遍历窗口符号（检测Scatter符号）
        let hasScatter = false;
        for (let i = windowData.size - 1; i >= 0; --i) {
            const symbolId = windowData.getSymbol(i);
            if (symbolId === 51) {
                hasScatter = true;
            }
            symbolList.push(symbolId);
        }

        // 选择虚拟符号列表（Scatter专用/默认）
        const dummyList = hasScatter 
            ? [31, 24, 23, 22, 21, 14, 13, 12, 11, 10] 
            : this.dummySymbolList;

        // 补充虚拟符号
        for (let i = 0; i < offset; ++i) {
            const randomIndex = Math.floor(Math.random() * dummyList.length);
            symbolList.push(dummyList[randomIndex]);
        }

        return symbolList;
    }

    /**
     * 播放滚轮停止音效
     */
    playReelStopSound(): void {
        const reelComp = this.node.getComponent(Reel)!;
        // 非跳过旋转且不是第4个滚轮则播放音效
        if (SlotManager.Instance.isSkipCurrentSpin === 0 || reelComp.reelindex !== 4) {
            SlotSoundController.Instance().playAudio("ReelStop", "FX");
        }
    }

    /**
     * 获取使用下一个子游戏Key的预旋转状态
     * @returns 预旋转状态
     */
    getPreSpinUsingNextSubGameKeyState(): State {
        const reelComp = this.node.getComponent(Reel)!;
        const reelStopWindows = SlotGameResultManager.Instance.getReelStopWindows();
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        
        const preSpinState = this.getPreSpinUpDownState(reelComp, reelStopWindows, nextSubGameKey);
        preSpinState.flagSkipActive = true;
        
        return preSpinState;
    }

    /**
     * 获取使用下一个子游戏Key的无限旋转状态
     * @returns 无限旋转状态
     */
    getInfiniteSpinUsingNextSubGameKeyState(): State {
        const reelComp = this.node.getComponent(Reel)!;
        const reelStopWindows = SlotGameResultManager.Instance.getReelStopWindows();
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(nextSubGameKey);
        
        return this.getInfiniteSpinStateSharkAttack(reelComp, reelStrip, nextSubGameKey);
    }

    /**
     * 鲨鱼攻击游戏的无限旋转状态
     * @param reel 滚轮组件
     * @param reelStrip 滚轮符号条
     * @param subGameKey 子游戏Key
     * @param moveSpeed 移动速度（可选）
     * @param resetSymbolIndex 是否重置符号索引（可选）
     * @param targetSymbolIndex 目标符号索引（可选）
     * @returns 无限旋转状态
     */
    getInfiniteSpinStateSharkAttack(
        reel: Reel,
        reelStrip: any,
        subGameKey: string | null,
        moveSpeed?: number,
        resetSymbolIndex?: number,
        targetSymbolIndex?: number
    ): State {
        const infiniteSpinState = new State();
        const reelStripData = reelStrip.getReel(reel.reelindex % 5);

        // 检查空白符号并控制下一个符号索引
        reelStripData.checkBlankSymbolAndControlNextSymbolIndex(reel);

        // 获取滚轮控制参数
        let oneSymbolMoveSpeed = moveSpeed;
        let symbolHeight: number | null = null;
        if (subGameKey != null && oneSymbolMoveSpeed == null) {
            const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey);
            const reelInfo = spinControlInfo.infoList[reel.reelindex % 5];
            oneSymbolMoveSpeed = reelInfo.oneSymbolMoveSpeed;
            symbolHeight = reelInfo.symbolHeight;
        }

        // 重置符号索引（如果需要）
        if (resetSymbolIndex != null && resetSymbolIndex === 0) {
            if (targetSymbolIndex != null) {
                reelStripData.setNextSymbolIndex(targetSymbolIndex);
            } else {
                reelStripData.setNextSymbolIndex(0);
            }
        }

        infiniteSpinState.addOnStartCallback(function() {
            // 设置旋转方向为向下
            reel.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);

            // 设置下一个符号ID的回调
            reel.setNextSymbolIdCallback(function() {
                const symbolId = reelStripData.getNextSymbolId();
                reelStripData.increaseNextSymbolIndex();
                return symbolId;
            });

            // 持续调度滚轮移动
            reel.schedule(function(dt: number) {
                const moveDistance = (dt / oneSymbolMoveSpeed!) * symbolHeight!;
                reel.node.y = reel.node.y - moveDistance;
            }, 0.01);
        });

        infiniteSpinState.addOnEndCallback(function() {
            // 停止调度并补充最后一次移动
            const finalMoveDistance = (0.02 / oneSymbolMoveSpeed!) * symbolHeight!;
            reel.node.y = reel.node.y - finalMoveDistance;
            reel.unscheduleAllCallbacks();
        });

        return infiniteSpinState;
    }
}