// 游戏专属模块
import JackpotSymbol_SuperSevenBlasts from './JakpotSymbol_SuperSevenBlasts'; // 保留原拼写错误：Jakpot → Jackpot
import GameComponents_SuperSevenBlasts from './GameComponents_SuperSevenBlasts';
import Reel_SuperSevenBlasts from './Reel_SuperSevenBlasts';
import SuperSevenBlastsManager from './SuperSevenBlastsManager';
import ReelController_Base from '../../ReelController_Base';
import SlotSoundController from '../../Slot/SlotSoundController';
import Reel from '../../Slot/Reel';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import SlotManager from '../../manager/SlotManager';
import State, { SequencialState } from '../../Slot/State';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotUIRuleManager from '../../Slot/rule/SlotUIRuleManager';
import ReelSpinBehaviors, { EasingInfo } from '../../ReelSpinBehaviors';
import SoundManager from '../../manager/SoundManager';
import TSUtility from '../../global_utility/TSUtility';

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts 游戏专属滚轮控制器
 * 核心功能：滚轮旋转状态管理、Jackpot符号检测/移动、奖励符号动画、慢旋转/期望特效控制
 * 注意：原代码存在拼写错误（_addVlaue → _addValue、exepct → expect），保留原命名避免业务逻辑冲突
 */
@ccclass()
export default class ReelController_SuperSevenBlasts extends ReelController_Base {
    // ========== 编辑器配置属性 ==========
    /** 普通期望特效节点数组 */
    @property({
        type: [cc.Node],
        displayName: "普通期望特效节点",
        tooltip: "滚轮旋转时显示的期望特效节点"
    })
    public normal_expectEffects: cc.Node[] = [];

    // ========== 状态属性 ==========
    /** 附加数值（原代码拼写错误：Vlaue → Value，保留原命名） */
    public _addVlaue: number = 0;
    /** Respin模式下的虚拟符号列表 */
    private _respinDummySymbolList: number[] = [11, 12, 13, 14, 21, 22, 61, 71, 72, 73, 91, 92, 93];
    /** 基础虚拟符号列表（包含Jackpot符号） */
    public dummySymbolList: number[] = [];

    // ========== 生命周期 ==========
    onLoad(): void {
        super.onLoad();

        // 初始化基础虚拟符号列表
        this.dummySymbolList = [11, 12, 13, 14, 21, 22, 61, 71, 72, 73, 91, 92, 93, 94, 95, 96];

        // 向滚轮停止回调列表添加处理逻辑
        this.easingFuncListOnSpinEnd.push(() => {
            this.playReelStopSound();
            SlotSoundController.Instance().stopAudio("ReelExpect", "FX");
            const reelIndex = this.getComponent(Reel).reelindex -1;
            SuperSevenBlastsManager.getInstance().game_components.reelBGComponent.stopSpinFx(reelIndex);
        });
    }

    // ========== 滚轮旋转结束处理 ==========
    /**
     * 处理滚轮旋转结束逻辑
     * @param callback 完成回调
     */
    public processSpinEnd(callback: () => void): void {
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        
        if (subGameKey === "base") {
            // 基础游戏：检查Jackpot符号移动
            const reelComp = this.node.getComponent(Reel);
            if (reelComp) {
                this.checkMoveJackpotSymbol(reelComp.reelindex);
            }
        } else {
            // 子游戏：检查奖励符号并播放动画
            const reelSuperComp = this.node.getComponent(Reel_SuperSevenBlasts);
            if (!reelSuperComp) {
                callback();
                return;
            }

            const lastHistoryWindow = SlotGameResultManager.Instance.getLastHistoryWindows().GetWindow(reelSuperComp.reelindex);
            
            // 遍历滚轮行，检测奖励符号（61）
            const checkSymbol = (row: number) => {
                if (lastHistoryWindow.getSymbol(row) === 61) {
                    this.scheduleOnce(() => {
                        SlotSoundController.Instance().playAudio("BonusAppear", "FX");
                        SymbolAnimationController.Instance.playAnimationSymbolAbsoluteCoordinate(reelSuperComp.reelindex, row, 66);
                        reelSuperComp.hideSymbolInRow(row);
                    }, 0.2);
                }
            };

            for (let row = 0; row < lastHistoryWindow.size; row++) {
                checkSymbol(row);
            }

            // 慢旋转模式延迟检测Jackpot符号
            const isSlowSpin = SuperSevenBlastsManager.getInstance().game_components.isSlotSlowSpin();
            if (isSlowSpin) {
                this.scheduleOnce(() => {
                    this.checkAppearJackpotSymbol(reelSuperComp.reelindex);
                }, 0.3);
            } else {
                this.checkAppearJackpotSymbol(reelSuperComp.reelindex);
            }
        }

        // 执行完成回调
        callback();
    }

    /**
     * 检查并移动Jackpot符号（基础游戏）
     * @param reelIndex 滚轮索引
     */
    public checkMoveJackpotSymbol(reelIndex: number): void {
        let hasJackpotSymbol = false;
        let totalJackpotValue = 0;
        const visibleWindows = SlotGameResultManager.Instance.getVisibleSlotWindows();

        for (let row = 0; row < 3; row++) {
            const symbolId = visibleWindows.GetWindow(reelIndex).getSymbol(row);
            
            // 检测Jackpot符号（ID>90）
            if (symbolId > 90) {
                // 计算Jackpot数值
                const jackpotValue = symbolId < 94 ? symbolId - 90 : symbolId - 93;
                totalJackpotValue += jackpotValue;

                // 播放Jackpot符号动画
                const aniComp = SymbolAnimationController.Instance.playAnimationSymbolAbsoluteCoordinate(reelIndex, row, 392);
                const jackpotSymbolComp = aniComp.getComponent(JackpotSymbol_SuperSevenBlasts);
                jackpotSymbolComp?.showSymbol(symbolId);

                // 隐藏原位置符号并移动Jackpot符号
                const reelComp = SlotManager.Instance.reelMachine.reels[reelIndex]?.getComponent(Reel);
                reelComp?.hideSymbolInRow(row);
                SuperSevenBlastsManager.getInstance().game_components.moveJackpotComponent.moveJackpotSymbol(reelIndex, row, jackpotValue);

                hasJackpotSymbol = true;
            }
        }

        // 更新Jackpot计数并播放音效/特效
        SuperSevenBlastsManager.getInstance().game_components.jackpotMoneyDisplay.setBaseCount(totalJackpotValue);
        if (hasJackpotSymbol) {
            SlotSoundController.Instance().playAudio("MoveTopSeven", "FX");
            this.scheduleOnce(() => {
                SuperSevenBlastsManager.getInstance().game_components.moveJackpotComponent.aliveFx();
            }, 1);
        }
    }

    /**
     * 检查Jackpot符号出现（子游戏）
     * @param reelIndex 滚轮索引
     */
    public checkAppearJackpotSymbol(reelIndex: number): void {
        let hasJackpotSymbol = false;
        let totalJackpotValue = 0;
        const visibleWindows = SlotGameResultManager.Instance.getVisibleSlotWindows();

        for (let row = 0; row < 3; row++) {
            let symbolId = visibleWindows.GetWindow(reelIndex).getSymbol(row);
            
            // 检测Jackpot符号（ID>90）
            if (symbolId > 90) {
                // 修正符号ID（>100时减10）
                if (symbolId > 100) {
                    symbolId -= 10;
                }

                // 显示Jackpot符号并更新计数
                const lockComp = SlotManager.Instance.getComponent(SuperSevenBlastsManager)?.game_components.lockComponent;
                if (lockComp?.AppearJackpotSymbol(reelIndex, row, symbolId)) {
                    totalJackpotValue += symbolId - 90;
                    const reelComp = this.node.getComponent(Reel);
                    reelComp?.hideSymbolInRow(row);
                    hasJackpotSymbol = true;
                }
            }
        }

        // 播放Jackpot出现音效并更新计数
        if (hasJackpotSymbol) {
            SuperSevenBlastsManager.getInstance().game_components.jackpotMoneyDisplay.setBaseCount(totalJackpotValue);
            SlotSoundController.Instance().playAudio("JackpotAppear", "FX");
        }
    }

    /**
     * 获取滚轮旋转状态（排除预旋转，使用请求时间）
     * @param stopWindows 停止窗口（可选）
     * @param reelMachine 滚轮管理器（可选）
     * @returns 顺序状态机实例
     */
    public getSpinExcludePreSpinUsingSpinRequestTimeState(
        stopWindows?: any, 
        reelMachine?: any
    ): SequencialState {
        const seqState = new SequencialState();
        
        // 滚轮节点未激活则返回空状态机
        if (!this.node.active) {
            return seqState;
        }

        // 初始化变量
        let stateIndex = 0;
        const reelSuperComp = this.node.getComponent(Reel_SuperSevenBlasts);
        if (!reelSuperComp) {
            return seqState;
        }

        // 确定停止窗口和滚轮管理器
        const finalStopWindows = stopWindows ?? SlotGameResultManager.Instance.getReelStopWindows();
        const finalReelMachine = reelMachine ?? SlotManager.Instance.reelMachine;
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reelSuperComp.reelindex];

        // ========== 状态1：滚轮旋转至停止前（更新前） ==========
        const spinBeforeRenewalState = this.getReelSpinStateUntileStopBeforeReelRenewal(
            finalReelMachine.reels, 
            reelSuperComp, 
            reelStrip, 
            subGameKey
        );
        spinBeforeRenewalState.flagSkipActive = true;
        spinBeforeRenewalState.addOnStartCallback(() => {
            // 设置滚轮模糊状态
            reelSuperComp._flagBlur = true;
            reelSuperComp.changeNodesToBlurSymbol();

            // 播放期望特效和音效（下一个特效标记为1且是第一个滚轮）
            const superSevenManager = SlotManager.Instance.getComponent(SuperSevenBlastsManager);
            if (superSevenManager?.getNextEffect() === 1 && reelSuperComp.reelindex === 0) {
                const gameComp = SlotManager.Instance.getComponent(GameComponents_SuperSevenBlasts);
                gameComp?.shakeCamera();
                SlotSoundController.Instance().playAudio("ReelExpect", "FX");
                this.setShowExpectEffects(true);
            }

            // 慢旋转模式处理
            const gameComp = SlotManager.Instance.getComponent(GameComponents_SuperSevenBlasts);
            if (gameComp?.isSlotSlowSpin() === 1 && gameComp.firstReelIndex() === reelSuperComp.reelindex) {
                gameComp.shakeCamera();
                SlotSoundController.Instance().playAudio("SlowReelExpect", "FX");
                this.setShowExpectEffects(true);
            }
        });
        seqState.insert(stateIndex++, spinBeforeRenewalState);

        // ========== 状态2：滚轮更新状态 ==========
        const reelRenewalState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReelRenewal(
            finalReelMachine.reels, 
            reelSuperComp, 
            reelStrip, 
            subGameKey
        );
        reelRenewalState.flagSkipActive = true;
        seqState.insert(stateIndex++, reelRenewalState);

        // ========== 解析旋转控制参数 ==========
        let postEasingType: any = null;
        let postEasingRate: number = 0;
        let postEasingDuration: number = 0;
        let postEasingDistance: number = 0;

        if (spinControlInfo) {
            postEasingType = spinControlInfo.postEasingType;
            postEasingRate = spinControlInfo.postEasingRate;
            postEasingDuration = spinControlInfo.postEasingDuration;
            postEasingDistance = spinControlInfo.postEasingDistance;
        }

        // ========== 获取结果符号列表并创建缓动信息 ==========
        const resultWindow = finalStopWindows.GetWindow(reelSuperComp.reelindex);
        const resultSymbolList = this.getResultSymbolList(resultWindow, reelSuperComp);
        const resultSymbolInfoList = this.getResultSymbolInfoList(resultWindow, reelSuperComp);

        const easingInfo = new EasingInfo();
        easingInfo.easingType = postEasingType;
        easingInfo.easingDistance = postEasingDistance;
        easingInfo.easingDuration = postEasingDuration;
        easingInfo.easingRate = postEasingRate;

        // 缓动开始时隐藏期望特效
        easingInfo.onEasingStartFuncList.push(() => {
            this.setShowExpectEffects(false);
        });

        // 添加缓动停止回调
        this.addEasingFuncListOnStopEasing(easingInfo);

        // ========== 状态3：滚轮移动至最终位置 ==========
        const reelMoveState = this.getReelMoveStateWithLastSymbolListNew(
            reelSuperComp, 
            resultSymbolList, 
            subGameKey, 
            easingInfo, 
            resultSymbolInfoList
        );
        reelMoveState.addOnStartCallback(() => {
            // 恢复滚轮正常状态
            reelSuperComp._flagBlur = false;
            reelSuperComp.changeNodesToNormalSymbol();
        });
        reelMoveState.addOnEndCallback(() => {
            // 最后一个滚轮（索引4）停止旋转音效
            if (reelSuperComp.reelindex === 4) {
                SlotManager.Instance.stopReelSpinSound();
            }
        });
        seqState.insert(stateIndex++, reelMoveState);

        // ========== 状态4：旋转结束处理 ==========
        const spinEndState = new State();
        spinEndState.addOnStartCallback(() => {
            // 重置滚轮模糊偏移
            reelSuperComp.setShaderValue("blurOffset", 0);
            
            // 最后一个滚轮恢复主音量
            if (reelSuperComp.reelindex === finalReelMachine.reels.length - 1) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }

            // 更新期望特效状态并处理旋转结束逻辑
            SlotManager.Instance.setPlayReelExpectEffectState(reelSuperComp.reelindex + 1);
            this.processSpinEnd(spinEndState.setDone.bind(spinEndState));
        });
        seqState.insert(stateIndex++, spinEndState);

        return seqState;
    }

    /**
     * 获取滚轮旋转至停止前的状态（更新前）
     * @param reels 滚轮数组
     * @param reel 滚轮组件
     * @param reelStrip 滚轮条配置
     * @param subGameKey 子游戏标识
     * @returns 状态实例
     */
    public getReelSpinStateUntileStopBeforeReelRenewal(
        reels: any[], 
        reel: Reel_SuperSevenBlasts, 
        reelStrip: any, 
        subGameKey: string
    ): State {
        const state = new State();
        const reelConfig = reelStrip.getReel(reel.reelindex);
        let spinAction: any = null;

        // 检查空白符号并控制下一个符号索引
        reelConfig.checkBlankSymbolAndControlNextSymbolIndex(reel);

        state.addOnStartCallback(() => {
            // 设置滚轮旋转方向为向下
            reel.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);

            // 计算旋转时间（累加前置滚轮的旋转/停止时间）
            let totalSpinTime = 0;
            const spinRequestTime = SlotManager.Instance.getTimeSecSpinRequest();
            
            for (let i = 0; i < reels.length; ++i) {
                const reelComp = reels[i].getComponent(Reel);
                if (reelComp?.node.active && reelComp.reelindex < reel.reelindex) {
                    // 累加旋转更新时间和停止时间
                    totalSpinTime += reelComp.getReelSpinTimeRenewal(reels, spinRequestTime, subGameKey);
                    totalSpinTime += reelComp.getReelStopTime(subGameKey);
                    
                    // 慢旋转模式额外增加时间
                    const gameComp = SlotManager.Instance.getComponent(GameComponents_SuperSevenBlasts);
                    if (gameComp?.isSlotSlowSpin() === 1) {
                        totalSpinTime += 0.8;
                    }
                }
            }

            // 获取滚轮控制参数
            let symbolHeight = 0;
            let oneSymbolMoveSpeed = 0;
            if (subGameKey) {
                const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reel.reelindex];
                if (spinControlInfo) {
                    symbolHeight = spinControlInfo.symbolHeight;
                    oneSymbolMoveSpeed = spinControlInfo.oneSymbolMoveSpeed;
                }
            }

            // 计算移动距离和创建移动动作
            const moveDistance = totalSpinTime / oneSymbolMoveSpeed;
            const moveAction = cc.moveBy(totalSpinTime, new cc.Vec2(0, -moveDistance * symbolHeight));

            // 设置下一个符号ID回调
            reel.setNextSymbolIdCallback(() => {
                const nextSymbolId = reelConfig.getNextSymbolId();
                reelConfig.increaseNextSymbolIndex();
                return nextSymbolId;
            });

            // 执行移动动作并完成状态
            spinAction = reel.node.runAction(cc.sequence(moveAction, cc.callFunc(state.setDone.bind(state))));
        });

        // 状态结束时停止未完成的动作
        state.addOnEndCallback(() => {
            if (spinAction && !spinAction.isDone()) {
                reel.node.stopAction(spinAction);
            }
        });

        return state;
    }

    /**
     * 获取滚轮移动至最终符号列表的状态（新版）
     * @param reel 滚轮组件
     * @param symbolList 符号列表
     * @param subGameKey 子游戏标识
     * @param easingInfo 缓动信息
     * @param symbolInfoList 符号信息列表（可选）
     * @returns 状态实例
     */
    public getReelMoveStateWithLastSymbolListNew(
        reel: Reel_SuperSevenBlasts, 
        symbolList: number[], 
        subGameKey: string, 
        easingInfo: EasingInfo, 
        symbolInfoList?: any[]
    ): State {
        const state = new State();
        let symbolHeight = 0;
        let oneSymbolMoveSpeed = 0;
        let currentSymbolIndex = 0;
        let currentInfoIndex = 0;

        // 获取滚轮控制参数
        if (subGameKey) {
            const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList[reel.reelindex];
            if (spinControlInfo) {
                symbolHeight = spinControlInfo.symbolHeight;
                oneSymbolMoveSpeed = spinControlInfo.oneSymbolMoveSpeed;
            }
        }

        state.addOnStartCallback(() => {
            // 随机数（原代码保留）
            Math.random();

            // 设置附加偏移值（慢旋转模式）
            const gameComp = SlotManager.Instance.getComponent(GameComponents_SuperSevenBlasts);
            this._addVlaue = gameComp?.isSlotSlowSpin() === 1 ? -symbolHeight / 3 : 0;

            // 设置滚轮旋转方向
            reel.setReelSpinDirection(Reel.SPINDIRECTION_DOWN);

            // 计算目标位置
            const lastSymbol = reel.getLastSymbol();
            const lastSymbolY = reel.getPositionY(lastSymbol.node.y);
            const bufferOffset = reel.bufferRow * symbolHeight;
            
            // 计算基础移动距离
            let baseMoveDistance = lastSymbolY + (symbolList.length * symbolHeight - (easingInfo.easingDistance || 0)) - bufferOffset + this._addVlaue;
            const easingDistance = easingInfo.easingDistance || 0;
            const pureMoveDistance = baseMoveDistance - this._addVlaue;

            // 计算移动时间
            const moveTime = gameComp?.isSlotSlowSpin() === 1 
                ? Math.abs(oneSymbolMoveSpeed * (pureMoveDistance / symbolHeight)) + 1.5 
                : Math.abs(oneSymbolMoveSpeed * (pureMoveDistance / symbolHeight));

            // 创建基础移动动作
            const baseMoveAction = cc.moveBy(moveTime, new cc.Vec2(0, -baseMoveDistance));

            // 设置下一个符号ID回调
            reel.setNextSymbolIdCallback(() => {
                if (currentSymbolIndex < symbolList.length) {
                    const symbolId = symbolList[currentSymbolIndex];
                    currentSymbolIndex++;
                    return symbolId;
                }
                return undefined;
            });

            // 设置下一个符号信息回调
            reel.setNextSymbolInfoCallback(() => {
                let info = null;
                if (symbolInfoList && currentInfoIndex < symbolInfoList.length) {
                    info = symbolInfoList[currentInfoIndex];
                    currentInfoIndex++;
                }
                return info;
            });

            // 创建缓动动作
            let easingAction: any = null;
            if (easingInfo && easingInfo.easingType) {
                const easeFunc = ReelSpinBehaviors.Instance.getEaseAction(easingInfo.easingType, easingInfo.easingRate);
                easingAction = cc.moveBy(easingInfo.easingDuration || 0, new cc.Vec2(0, -easingDistance)).easing(easeFunc);
            }

            // 旋转完成回调
            const completeCallback = cc.callFunc(() => {
                // 补充剩余符号
                while (currentSymbolIndex < symbolList.length) {
                    if (currentSymbolIndex < symbolList.length) {
                        const symbolId = symbolList[currentSymbolIndex];
                        const symbolInfo = symbolInfoList && currentInfoIndex < symbolInfoList.length ? symbolInfoList[currentInfoIndex] : null;
                        reel.pushSymbolAtTopOfReel(symbolId, symbolInfo);
                    } else {
                        console.error("invalid status tweenAction");
                    }
                    currentSymbolIndex++;
                    currentInfoIndex++;
                }

                // 处理旋转停止后逻辑
                reel.processAfterStopSpin();

                // 无附加偏移直接完成，否则延迟完成
                if (this._addVlaue === 0) {
                    state.setDone();
                } else {
                    this.scheduleOnce(() => {
                        this.playReelStopSound();
                        SlotSoundController.Instance().stopAudio("ReelExpect", "FX");
                        const reelIndex = this.getComponent(Reel)?.reelindex ?? -1;
                        SuperSevenBlastsManager.getInstance().game_components.reelBGComponent.stopSpinFx(reelIndex);
                        state.setDone();
                    }, 0.21);
                }
            });

            // 缓动开始回调（如有）
            let easingStartCallback: any = null;
            if (easingInfo && easingInfo.onEasingStartFuncList.length > 0) {
                easingStartCallback = cc.callFunc(() => {
                    easingInfo.onEasingStartFuncList.forEach(func => func());
                });
            }

            // 组装动作序列
            if (!easingAction || gameComp?.isSlotSlowSpin() === 1) {
                reel.node.runAction(cc.sequence(baseMoveAction, completeCallback));
            } else if (easingStartCallback) {
                reel.node.runAction(cc.sequence(baseMoveAction, easingStartCallback, easingAction, completeCallback));
            } else {
                reel.node.runAction(cc.sequence(baseMoveAction, easingAction, completeCallback));
            }
        });

        state.addOnEndCallback(() => {});
        return state;
    }

    /**
     * 设置期望特效显示状态
     * @param isShow 是否显示
     */
    public setShowExpectEffects(isShow: boolean): void {
        // 跳过当前旋转时不显示
        if (isShow && SlotManager.Instance.isSkipCurrentSpin) {
            return;
        }

        // 根据游戏类型设置背景期望特效
        if (isShow) {
            const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const gameComp = SlotManager.Instance.getComponent(GameComponents_SuperSevenBlasts);
            if (subGameKey === "base") {
                gameComp?.reelBGComponent.setBaseExpect();
            } else {
                gameComp?.reelBGComponent.setRespinExpect();
            }
        }

        // 显示/隐藏期望特效节点
        this.normal_expectEffects.forEach(effectNode => {
            if (TSUtility.isValid(effectNode)) {
                effectNode.active = isShow;
            }
        });

        // 下一个特效标记为1时设置滚轮高亮期望特效（原代码拼写错误：exepct → expect）
        const superSevenManager = SuperSevenBlastsManager.getInstance();
        if (superSevenManager.getNextEffect() && isShow) {
            const reelComp = this.node.getComponent(Reel);
            if (reelComp) {
                superSevenManager.game_components.reelBGComponent.setDimmExepct(reelComp.reelindex);
            }
        }
    }

    /**
     * 获取结果符号列表
     * @param window 滚轮窗口
     * @param reel 滚轮组件
     * @returns 符号ID列表
     */
    public getResultSymbolList(window: any, reel: Reel_SuperSevenBlasts): number[] {
        const symbolList: number[] = [];
        const visibleRow = reel.visibleRow;
        const bufferRow = reel.bufferRow;

        // 计算补充符号数量
        let addSymbolCount = 0;
        if (window.size < visibleRow + 2 * bufferRow) {
            addSymbolCount = Math.floor((visibleRow + 2 * bufferRow - window.size) / 2);
        }

        // 慢旋转模式：处理锁定符号和Jackpot符号
        const gameComp = SuperSevenBlastsManager.getInstance().game_components;
        if (gameComp.isSlotSlowSpin()) {
            const visibleWindows = SlotGameResultManager.Instance.getVisibleSlotWindows();
            const historyWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            const lockComp = gameComp.lockComponent;

            // 倒序遍历窗口符号
            for (let row = window.size - 1; row >= 0; --row) {
                let symbolId = window.getSymbol(row);
                
                // 优先使用锁定符号
                if (lockComp._lockSymbolID[reel.reelindex][row] > 0) {
                    symbolId = lockComp._lockSymbolID[reel.reelindex][row];
                } 
                // 处理Jackpot符号
                else {
                    const visibleSymbol = visibleWindows.GetWindow(reel.reelindex).getSymbol(row);
                    const historySymbol = historyWindows.GetWindow(reel.reelindex).getSymbol(row);
                    if (visibleSymbol > 90 && visibleSymbol < historySymbol - 10) {
                        symbolId = visibleSymbol;
                    }
                }

                symbolList.push(symbolId);
            }
        } 
        // 普通模式：直接获取符号
        else {
            for (let row = window.size - 1; row >= 0; --row) {
                symbolList.push(window.getSymbol(row));
            }
        }

        // 补充虚拟符号
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        if (subGameKey === "base") {
            // 基础游戏：使用完整虚拟符号列表
            for (let i = 0; i < addSymbolCount; ++i) {
                const randomIndex = Math.floor(Math.random() * this.dummySymbolList.length);
                symbolList.push(this.dummySymbolList[randomIndex]);
            }
        } else {
            // 子游戏：使用Respin虚拟符号列表
            const randomIndex = Math.floor(Math.random() * this.dummySymbolList.length);
            symbolList.push(this._respinDummySymbolList[randomIndex]);
        }

        return symbolList;
    }
}