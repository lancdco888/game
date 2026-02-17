
import CameraControl from '../../Slot/CameraControl';
import ChangeNumberComponent from '../../Slot/ChangeNumberComponent';
import Reel from '../../Slot/Reel';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import SlotSoundController from '../../Slot/SlotSoundController';
import State, { ConcurrentState, SequencialState } from '../../Slot/State';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import { BottomTextType } from '../../SubGame/BottomUIText';
import SubGameStateManager_Base from '../../SubGameStateManager_Base';
import GameComponents_Base from '../../game/GameComponents_Base';
import CurrencyFormatHelper from '../../global_utility/CurrencyFormatHelper';
import TSUtility from '../../global_utility/TSUtility';
import LangLocaleManager from '../../manager/LangLocaleManager';
import SlotGameResultManager, { Cell } from '../../manager/SlotGameResultManager';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotManager from '../../manager/SlotManager';
import GameComponents_SharkAttack from './GameComponents_SharkAttack';
import SharkAttackManager from './SharkAttackManager';

const { ccclass } = cc._decorator;

/**
 * 鲨鱼攻击游戏子游戏状态管理器
 * 负责基础游戏/免费旋转全流程状态控制（滚轮、奖金、特效、UI、大奖、倍数等）
 * 保留原拼写错误（如jackpotCollcetComponent、Multuplier）以兼容原有调用
 */
@ccclass('SubGameStateManager_SharkAttack')
export default class SubGameStateManager_SharkAttack extends SubGameStateManager_Base {
    // 单例实例
    private static _instance: SubGameStateManager_SharkAttack | null = null;
    // 单行特效动作缓存
    public actionSingleLine: any = null;
    // 特殊奖金播放前的金额乘数
    public increaseMoneyMultiplierBeforePlaySpecialWin: number = 1;

    /**
     * 单例获取方法
     * @returns SubGameStateManager_SharkAttack 单例实例
     */
    public static Instance(): SubGameStateManager_SharkAttack {
        if (this._instance === null) {
            this._instance = new SubGameStateManager_SharkAttack();
        }
        return this._instance;
    }

    constructor() {
        super();
        // 初始化符号名称映射
        this.symbolNameList[51] = "SCATTER";
        this.symbolNameList[31] = "SHARK";
        this.symbolNameList[24] = "HAMMERHEAD SHARK";
        this.symbolNameList[23] = "ORCA";
        this.symbolNameList[22] = "BATOIDEA";
        this.symbolNameList[21] = "PIRANHA";
        this.symbolNameList[14] = "ACES";
        this.symbolNameList[13] = "KINGS";
        this.symbolNameList[12] = "QUEENS";
        this.symbolNameList[11] = "JACKS";
        this.symbolNameList[10] = "TENS";
    }

    /**
     * 获取基础游戏状态序列
     * @returns SequencialState 基础游戏状态序列
     */
    public getBaseGameState(): SequencialState {
        const self = this;
        const baseState = new SequencialState();
        let step = 0;
        const preSpinState = new SequencialState();

        // 预旋转状态序列
        preSpinState.insert(step++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        preSpinState.insert(step++, this.getStopSingleLineActionState());
        preSpinState.insert(step++, this.getStopAllSymbolAniState());
        preSpinState.insert(step++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
        preSpinState.insert(step++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(0));
        preSpinState.insert(step++, this.getResetReelState());
        preSpinState.insert(step++, SlotManager.Instance.getReelSpinStartState());

        // 恢复滚轮旋转状态
        const resumeReelState = new State();
        resumeReelState.addOnStartCallback(() => {
            SharkAttackManager.getInstance().resumeReelSpin();
            resumeReelState.setDone();
        });
        preSpinState.insert(step++, resumeReelState);
        baseState.insert(0, preSpinState);

        // 旋转核心逻辑状态
        const spinCoreState = new SequencialState();
        spinCoreState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                spinCoreState.insert(step++, SlotManager.Instance.reelMachine.getNormalSpinReelState());
                spinCoreState.insert(step++, this.getScrollDownBeforeWinResultState());

                // 中奖结果处理子序列
                const winResultSubState = new SequencialState();
                winResultSubState.insert(0, this.getWinResultStateOnAllLines());
                winResultSubState.insert(1, this.getSingleLineEffectForAllLinesState());
                spinCoreState.insert(step, winResultSubState);
                spinCoreState.insert(step, this.getSetBottomInfoIncreaseWinMoneyState());

                // 大奖倍数/奖金判断
                const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
                const potMultiplier = subGameState.gauges.potMultiplier;
                const potResults = SlotGameResultManager.Instance.getSpinResult().subGamePotResults;

                // 有倍数或大奖奖金时插入基础奖金状态
                if ((potMultiplier != null && potMultiplier > 0) || (potResults.length > 0 && potResults[0].winningCoin > 0)) {
                    spinCoreState.insert(step++, this.getBasePayoutState());
                }

                // 有大奖奖金时插入大奖收集状态
                if (potResults.length > 0 && potResults[0].winningCoin > 0) {
                    spinCoreState.insert(step++, this.getCheckJackpotPrizeCollectState());
                    spinCoreState.insert(step++, this.getSingleLineEffectForAllLinesState());
                }

                // 奖金结算、重置、免费旋转检查
                spinCoreState.insert(step++, this.getWinMoneyState());
                spinCoreState.insert(step++, this.getResetCollectInfo());
                spinCoreState.insert(step++, this.getFreespinStartState());
                spinCoreState.insert(step++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
            }
        });
        baseState.insert(1, spinCoreState);

        return baseState;
    }

    /**
     * 获取免费旋转游戏状态序列
     * @returns SequencialState 免费旋转状态序列
     */
    public getFreeSpinGameState(): SequencialState {
        const self = this;
        const freeSpinState = new SequencialState();
        let step = 0;
        const preSpinState = new SequencialState();

        // 预旋转状态序列
        preSpinState.insert(step++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        preSpinState.insert(step++, this.getStopSingleLineActionState());
        preSpinState.insert(step++, this.getStopAllSymbolAniState());
        preSpinState.insert(step++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
        preSpinState.insert(step++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(SlotGameResultManager.Instance.winMoneyInFreespinMode));
        preSpinState.insert(step++, this.getResetReelState());
        preSpinState.insert(step++, SlotManager.Instance.getIncreaseFreespinPastCountStateRenewal());
        preSpinState.insert(step++, SlotManager.Instance.getReelSpinStartState());

        // 恢复滚轮旋转状态
        const resumeReelState = new State();
        resumeReelState.addOnStartCallback(() => {
            SharkAttackManager.getInstance().resumeReelSpin();
            resumeReelState.setDone();
        });
        preSpinState.insert(step++, resumeReelState);
        freeSpinState.insert(0, preSpinState);

        // 旋转核心逻辑状态
        const spinCoreState = new SequencialState();
        spinCoreState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                spinCoreState.insert(step++, SlotManager.Instance.reelMachine.getFreeSpinReelState());
                spinCoreState.insert(step++, this.getScrollDownBeforeWinResultState());

                // 中奖结果处理子序列
                const winResultSubState = new SequencialState();
                winResultSubState.insert(0, this.getWinResultStateOnAllLines());
                winResultSubState.insert(1, this.getSingleLineEffectForAllLinesState());
                spinCoreState.insert(step, winResultSubState);
                spinCoreState.insert(step, this.getSetBottomInfoIncreaseWinMoneyState());

                // 大奖倍数/奖金判断
                const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
                const potMultiplier = subGameState.gauges.potMultiplier;
                const potResults = SlotGameResultManager.Instance.getSpinResult().subGamePotResults;

                // 有倍数或大奖奖金时插入基础奖金状态
                if ((potMultiplier != null && potMultiplier > 0) || (potResults.length > 0 && potResults[0].winningCoin > 0)) {
                    spinCoreState.insert(step++, this.getBasePayoutState());
                }

                // 有大奖奖金时插入大奖收集状态
                if (potResults.length > 0 && potResults[0].winningCoin > 0) {
                    spinCoreState.insert(step++, this.getCheckJackpotPrizeCollectState());
                    // 无倍数时才插入单行特效状态
                    if (!(potMultiplier != null && potMultiplier > 0)) {
                        spinCoreState.insert(step++, this.getSingleLineEffectForAllLinesState());
                    }
                }

                // 有总奖金且有倍数时插入倍数应用状态
                if (SlotGameResultManager.Instance.getTotalWinMoney() > 0 && potMultiplier != null && potMultiplier > 0) {
                    spinCoreState.insert(step++, this.getApplyMultiplierState());
                    spinCoreState.insert(step++, this.getSingleLineEffectForAllLinesState());
                }

                // 奖金结算、重置、状态恢复
                spinCoreState.insert(step++, this.getWinMoneyState());
                spinCoreState.insert(step++, this.getResetCollectInfo());
                spinCoreState.insert(step++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
                spinCoreState.insert(step++, this.getAddWinMoneyToFreespinEarningPotState());

                // 免费旋转重新触发+结束检查并行状态
                const retriggerSubState = new SequencialState();
                retriggerSubState.insert(0, this.getFreeSpinRetriggerState());
                retriggerSubState.insert(1, this.getCheckFreespinEndState());

                // 延迟状态（0.5秒）
                const delayState = new State();
                delayState.addOnStartCallback(() => {
                    SlotManager.Instance.scheduleOnce(() => {
                        delayState.setDone();
                    }, 0.5);
                });

                // 并行执行重新触发检查和延迟
                const concurrentState = new ConcurrentState();
                concurrentState.insert(retriggerSubState);
                concurrentState.insert(delayState);
                spinCoreState.insert(step++, concurrentState);
            }
        });
        freeSpinState.insert(1, spinCoreState);

        return freeSpinState;
    }

    /**
     * 获取基础奖金结算状态
     * @returns State 基础奖金结算状态
     */
    public getBasePayoutState(): State {
        const self = this;
        const payoutState = new State();

        payoutState.addOnStartCallback(() => {
            const basePayout = self.getBasePayoutResult();
            if (basePayout !== 0) {
                // 播放奖金递增音效
                SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                // 播放奖金数字变化动画
                SlotManager.Instance.bottomUIText.playChangeWinMoney(0, basePayout, () => {
                    SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");
                    SlotSoundController.Instance().playAudio("IncrementEndCoin", "FX");
                    SlotManager.Instance.scheduleOnce(() => {
                        payoutState.setDone();
                    }, 0.1);
                }, false, 1);
            } else {
                payoutState.setDone();
            }
        });

        return payoutState;
    }

    /**
     * 计算基础奖金结果（扣除倍数前的奖金）
     * @returns number 基础奖金金额
     */
    public getBasePayoutResult(): number {
        let total = 0;
        const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;

        if (payOutResults == null || payOutResults.length === 0) {
            return 0;
        }

        let multiplier = 1;
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);

        // 有大奖倍数时应用倍数
        if (subGameState.gauges.potMultiplier != null && subGameState.gauges.potMultiplier > 0) {
            multiplier = subGameState.gauges.potMultiplier;
        }

        // 累加所有奖金
        for (let i = 0; i < payOutResults.length; ++i) {
            total += payOutResults[i].winningCoin;
        }

        return total / multiplier;
    }

    /**
     * 获取奖金结算状态（最终奖金展示+音效+特效）
     * @returns State 奖金结算状态
     */
    public getWinMoneyState(): State {
        const self = this;
        const winMoneyState = new State();

        winMoneyState.addOnStartCallback(() => {
            SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();

            // 奖金结算完成回调
            const onWinComplete = () => {
                SlotManager.Instance.bottomUIText.showWinEffect(false);
                SlotManager.Instance.setMouseDragEventFlag(true);
                SlotManager.Instance.applyGameResultMoney(totalWin);
                winMoneyState.setDone();
            };

            const winType = SlotGameResultManager.Instance.getWinType();
            SlotManager.Instance.bottomUIText.showWinEffect(true);

            // 获取大奖倍数
            let multiplier = 1;
            const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
            if (subGameState.gauges.potMultiplier != null && subGameState.gauges.potMultiplier > 0) {
                multiplier = subGameState.gauges.potMultiplier;
            }

            // 获取大奖奖金结果
            const potResults = SlotGameResultManager.Instance.getSpinResult().subGamePotResults;
            const totalBet = SlotGameRuleManager.Instance.getTotalBet();

            // 无特殊奖金时直接结算
            if (totalWin <= 0 || (multiplier > 1 && winType ===SlotGameResultManager.WINSTATE_NORMAL) || (potResults.length > 0 && potResults[0].winningCoin > 0 && winType === SlotGameResultManager.WINSTATE_NORMAL)) {
                onWinComplete();
            } else {
                const finalWin = 0 + totalWin;
                // 计算特效时长（大额奖金加倍）
                const effectTime = totalWin > 3 * totalBet 
                    ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2 
                    : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

                // 特殊奖金（非普通中奖）处理
                if (winType !== SlotGameResultManager.WINSTATE_NORMAL) {
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.getWinMoneyLabel().node.getComponent(ChangeNumberComponent);
                    
                    const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                    const increaseTime = SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;
                    const bet = SlotGameRuleManager.Instance.getTotalBet();

                    // 第一步：播放初始奖金递增
                    const startIncrease = cc.callFunc(() => {
                        SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                        SlotManager.Instance.bottomUIText.playChangeWinMoney(
                            0, 
                            bet * self.increaseMoneyMultiplierBeforePlaySpecialWin, 
                            null, 
                            false, 
                            increaseTime
                        );
                        SlotManager.Instance.setMouseDragEventFlag(false);
                    });

                    // 第二步：播放大额奖金特效
                    const playBigWinEffect = cc.callFunc(() => {
                        const effectDuration = bigWinEffect.playWinEffect(
                            totalWin, 
                            bet, 
                            onWinComplete, 
                            () => {
                                SlotManager.Instance.bottomUIText.stopChangeWinMoney(finalWin);
                                self.playIncrementEndCoinSound();
                            }
                        );

                        SlotManager.Instance.bottomUIText.playChangeWinMoney(
                            bet * self.increaseMoneyMultiplierBeforePlaySpecialWin, 
                            finalWin, 
                            () => self.playIncrementEndCoinSound(), 
                            false, 
                            effectDuration
                        );
                    });

                    // 执行奖金递增+特效序列
                    SlotManager.Instance.node.runAction(cc.sequence(
                        startIncrease,
                        cc.delayTime(increaseTime),
                        playBigWinEffect
                    ));
                } else {
                    // 普通奖金处理
                    SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(0, finalWin, onWinComplete, true, effectTime);
                    SlotManager.Instance.setBiggestWinCoin(totalWin);
                }
            }
        });

        // 奖金结算结束后播放结束音效
        winMoneyState.addOnEndCallback(() => {
            self.playIncrementEndCoinSound();
        });

        return winMoneyState;
    }

    /**
     * 获取免费旋转开始状态（UI切换+特效+音效）
     * @returns SequencialState 免费旋转开始状态序列
     */
    public getFreespinStartState(): SequencialState {
        const self = this;
        const freeSpinStartState = new SequencialState();
        const freeSpinSubGameState = SlotGameResultManager.Instance.getSubGameState("freeSpin");

        if (freeSpinSubGameState != null && freeSpinSubGameState.isStartFreespinMode()) {
            // 免费旋转初始化状态
            const initState = new State();
            initState.addOnStartCallback(() => {
                SlotManager.Instance.setKeyboardEventFlag(false);
                SlotManager.Instance.setMouseDragEventFlag(false);

                // 相机滚动延迟
                let cameraDelay = 1;
                if (CameraControl.Instance.eStateOfCameraPosition === 1) {
                    CameraControl.Instance.scrollDownScreen(0.8);
                    cameraDelay = 1;
                }

                // 停止特效和清空线框
                self.stopSingleLineAction();
                SlotManager.Instance.paylineRenderer.clearAll();
                SymbolAnimationController.Instance.stopAllAnimationSymbol();

                // 初始化免费旋转参数
                SlotManager.Instance._freespinTotalCount = freeSpinSubGameState.totalCnt;
                SlotManager.Instance._freespinPastCount = 0;
                SlotManager.Instance._freespinMultiplier = freeSpinSubGameState.spinMultiplier;
                SlotGameResultManager.Instance.winMoneyInFreespinMode = freeSpinSubGameState.totalWinningCoin;

                // 播放Scatter触发特效
                const playScatterEffect = cc.callFunc(() => {
                    const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
                    SlotSoundController.Instance().playAudio("ScatterTrigger", "FX");

                    // 遍历Scatter符号并播放动画
                    for (let t = 0; t < lastHistoryWindows.size; ++t) {
                        const reelComp = SlotManager.Instance.reelMachine.reels[t + 5].getComponent(Reel);
                        for (let o = 0; o < lastHistoryWindows.GetWindow(t).size; ++o) {
                            const symbol = lastHistoryWindows.GetWindow(t).getSymbol(o);
                            if (symbol === 51) { // SCATTER符号
                                SymbolAnimationController.Instance.playAnimationSymbol(t, o, symbol, null, SlotManager.Instance.reelMachine, true);
                                reelComp.hideSymbolInRow(o);
                            }
                        }
                    }

                    // 更新奖金和底部文本
                    const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
                    SlotManager.Instance.bottomUIText.setWinMoney(totalWin);
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.TriggerScatter);
                });

                // 执行相机延迟+特效+隐藏动画序列
                SlotManager.Instance.node.runAction(cc.sequence(
                    cc.delayTime(cameraDelay),
                    playScatterEffect,
                    cc.delayTime(2),
                    cc.callFunc(() => {
                        SymbolAnimationController.Instance.stopAllAnimationSymbol();
                        initState.setDone();
                    })
                ));
            });

            // 组装免费旋转开始状态序列
            freeSpinStartState.insert(0, initState);
            freeSpinStartState.insert(1, this.getOpenFreeSpinPopup());
            freeSpinStartState.insert(2, this.getChangeUIToFreeSpinState());
            
            // 结束后播放免费旋转BGM
            freeSpinStartState.addOnEndCallback(() => {
                SlotSoundController.Instance().playAudio("FreeSpinBGM", "BGM");
            });
        }

        return freeSpinStartState;
    }

    /**
     * 获取免费旋转重新触发状态（Scatter重新触发逻辑）
     * @returns State 免费旋转重新触发状态
     */
    public getFreeSpinRetriggerState(): State {
        const self = this;
        const retriggerState = new State();

        retriggerState.addOnStartCallback(() => {
            const subGameState = SlotGameResultManager.Instance.getSubGameState(SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult());
            if (subGameState != null) {
                // 有新的免费旋转次数时触发
                if (subGameState.totalCnt > SlotManager.Instance._freespinTotalCount) {
                    // 相机滚动延迟
                    let cameraDelay = 0.5;
                    if (CameraControl.Instance.eStateOfCameraPosition === 1) {
                        CameraControl.Instance.scrollDownScreen(0.8);
                        cameraDelay = 1;
                    }

                    // 停止特效和清空线框
                    self.stopSingleLineAction();
                    if (SlotManager.Instance.paylineRenderer != null) {
                        SlotManager.Instance.paylineRenderer.clearAll();
                    }
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();

                    // 播放Scatter触发特效
                    const playScatterEffect = cc.callFunc(() => {
                        SlotManager.Instance.bottomUIText.setWinMoney(SlotGameResultManager.Instance.getTotalWinMoney());
                        // 获取本地化文本
                        const retriggerText = LangLocaleManager.getInstance().getLocalizedText("FREE SPIN RETRIGGERED");
                        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, retriggerText.text);

                        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
                        SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
                        SlotSoundController.Instance().playAudio("ScatterTrigger", "FX");

                        // 遍历Scatter符号并播放动画
                        for (let o = 0; o < lastHistoryWindows.size; ++o) {
                            const reelComp = SlotManager.Instance.reelMachine.reels[o + 5].getComponent(Reel);
                            for (let i = 0; i < lastHistoryWindows.GetWindow(o).size; ++i) {
                                const symbol = lastHistoryWindows.GetWindow(o).getSymbol(i);
                                if (symbol === 51) { // SCATTER符号
                                    SymbolAnimationController.Instance.playAnimationSymbol(o, i, symbol, null, SlotManager.Instance.reelMachine, true);
                                    reelComp.hideSymbolInRow(i);
                                }
                            }
                        }
                    });

                    // 停止符号动画
                    const stopSymbolAni = cc.callFunc(() => {
                        SymbolAnimationController.Instance.stopAllAnimationSymbol();
                        SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
                    });

                    // 打开重新触发弹窗
                    const openRetriggerPopup = cc.callFunc(() => {
                        const addCount = subGameState.totalCnt - SlotManager.Instance._freespinTotalCount;
                        SlotManager.Instance.getComponent(GameComponents_SharkAttack).freeSpinRetriggerPopup.open(addCount, () => {
                            SlotManager.Instance._freespinTotalCount = subGameState.totalCnt;
                            SlotManager.Instance.setFreespinExtraInfoByCurrentState();
                            retriggerState.setDone();
                        });
                    });

                    // 执行延迟+特效+停止+弹窗序列
                    SlotManager.Instance.node.runAction(cc.sequence(
                        cc.delayTime(cameraDelay),
                        playScatterEffect,
                        cc.delayTime(2),
                        stopSymbolAni,
                        cc.delayTime(1),
                        openRetriggerPopup
                    ));
                } else {
                    retriggerState.setDone();
                }
            }
        });

        return retriggerState;
    }

    /**
     * 获取免费旋转结束检查状态（切换回普通UI+展示结果）
     * @returns SequencialState 免费旋转结束检查状态序列
     */
    public getCheckFreespinEndState(): SequencialState {
        const self = this;
        const checkEndState = new SequencialState();

        checkEndState.addOnStartCallback(() => {
            // 切换回基础游戏时处理
            if (SlotGameResultManager.Instance.getNextSubGameKey() === "base") {
                const showResultState = this.getShowFreespinResultState();
                
                // 延迟状态1秒
                const delayState1 = new State();
                delayState1.addOnStartCallback(() => {
                    SlotManager.Instance.scheduleOnce(() => {
                        delayState1.setDone();
                    }, 1);
                });

                // 相机滚动延迟状态
                const cameraDelayState = new State();
                cameraDelayState.addOnStartCallback(() => {
                    if (CameraControl.Instance.eStateOfCameraPosition === 1) {
                        CameraControl.Instance.scrollDownScreen(0.8);
                    }
                    SlotManager.Instance.scheduleOnce(() => {
                        cameraDelayState.setDone();
                    }, 0.8);
                });

                // 组装结束状态序列
                checkEndState.insert(0, delayState1);
                checkEndState.insert(0, cameraDelayState);
                checkEndState.insert(1, this.getStopAllSymbolAniState());
                checkEndState.insert(1, showResultState);
                checkEndState.insert(1, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
                checkEndState.insert(1, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(SlotGameResultManager.Instance.winMoneyInFreespinMode));

                // 切换回普通UI
                const changeUINormalState = this.getChangeUIToNormalState();
                checkEndState.insert(2, changeUINormalState);
                checkEndState.insert(3, this.getStopSingleLineActionState());
                checkEndState.insert(4, this.getStopAllSymbolAniState());
                checkEndState.insert(5, this.getShowBigWinEffectEndFreespinState());
            }
        });

        return checkEndState;
    }

    /**
     * 获取免费旋转结果展示状态（打开结果弹窗）
     * @returns State 免费旋转结果展示状态
     */
    public getShowFreespinResultState(): State {
        const self = this;
        const showResultState = new State();

        showResultState.addOnStartCallback(() => {
            // 禁用输入+相机滚动+停止特效
            SlotManager.Instance.setKeyboardEventFlag(false);
            SlotManager.Instance.setMouseDragEventFlag(false);
            if (CameraControl.Instance.eStateOfCameraPosition === 1) {
                CameraControl.Instance.scrollDownScreen(0.8);
            }
            self.stopSingleLineAction();
            if (SlotManager.Instance.paylineRenderer != null) {
                SlotManager.Instance.paylineRenderer.clearAll();
            }
            SymbolAnimationController.Instance.stopAllAnimationSymbol();

            // 有免费旋转奖金时打开结果弹窗
            if (SlotGameResultManager.Instance.winMoneyInFreespinMode > 0) {
                const freeSpinSubGameState = SlotGameResultManager.Instance.getSubGameState("freeSpin");
                const betPerLines = freeSpinSubGameState.betPerLines;
                const totalCnt = freeSpinSubGameState.totalCnt;

                SlotSoundController.Instance().playAudio("freespinResult", "FX");
                SlotManager.Instance.getComponent(GameComponents_SharkAttack).freeSpinResultPopup.open(
                    freeSpinSubGameState.totalWinningCoin,
                    betPerLines,
                    totalCnt,
                    () => {
                        showResultState.setDone();
                    }
                );
            } else {
                showResultState.setDone();
            }
        });

        return showResultState;
    }

    /**
     * 获取免费旋转结束时的大额奖金特效状态
     * @returns State 大额奖金特效状态
     */
    public getShowBigWinEffectEndFreespinState(): State {
        const self = this;
        const bigWinState = new State();

        bigWinState.addOnStartCallback(() => {
            const totalFreeSpinWin = SlotGameResultManager.Instance.winMoneyInFreespinMode;

            // 停止特效+清空线框+恢复符号显示
            self.stopSingleLineAction();
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            if (SlotManager.Instance.paylineRenderer != null) {
                SlotManager.Instance.paylineRenderer.clearAll();
            }
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);

            // 非普通中奖时播放大额奖金特效
            if (SlotGameResultManager.Instance.getWinType(totalFreeSpinWin) !==SlotGameResultManager.WINSTATE_NORMAL) {
                SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                bigWinEffect._isPlayExplodeCoin = false;
                bigWinEffect.playWinEffectWithoutIncreaseMoney(
                    totalFreeSpinWin,
                    SlotGameRuleManager.Instance.getTotalBet(),
                    () => {
                        bigWinState.setDone();
                    }
                );
            } else {
                bigWinState.setDone();
            }

            // 恢复输入
            SlotManager.Instance.setKeyboardEventFlag(true);
            SlotManager.Instance.setMouseDragEventFlag(true);
        });

        return bigWinState;
    }

    /**
     * 获取所有线路中奖结果状态（绘制中奖框+播放符号特效）
     * @returns State 中奖结果状态
     */
    public getWinResultStateOnAllLines(): State {
        const self = this;
        const winResultState = new State();

        winResultState.addOnStartCallback(() => {
            const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            const cellKeys: number[] = [];
            const winningCells: cc.Vec2[] = [];

            if (payOutResults != null && payOutResults.length > 0) {
                // 遍历所有中奖结果，收集中奖单元格
                const collectWinningCells = cc.callFunc(() => {
                    for (let l = 0; l < payOutResults.length; ++l) {
                        const payOut = payOutResults[l];
                        // 自定义中奖单元格（非线路）
                        if (payOut.payLine === -1 || (payOut.winningCell != null && payOut.winningCell.length > 0)) {
                            for (let c = 0; c < payOut.winningCell.length; ++c) {
                                const col = payOut.winningCell[c][1];
                                const row = payOut.winningCell[c][0];
                                // 排除Scatter且未记录的单元格
                                if (lastHistoryWindows.GetWindow(col).getSymbol(row) !== 51 && cellKeys.indexOf(5 * col + row) === -1) {
                                    winningCells.push(new cc.Vec2(col, row));
                                    cellKeys.push(5 * col + row);
                                }
                            }
                        } else {
                            // 线路中奖
                            const payLine = payOut.payLine;
                            let hasNewCell = false;
                            for (let c = 0; c < 5; ++c) {
                                const row = Math.floor(payLine / (10000 / Math.pow(10, c))) % 10;
                                if (row !== 0) {
                                    hasNewCell = true;
                                    // 检查是否已记录
                                    for (let f = 0; f < winningCells.length; ++f) {
                                        if (winningCells[f].x === c && winningCells[f].y === row - 1 || 
                                            lastHistoryWindows.GetWindow(winningCells[f].x).getSymbol(winningCells[f].y) === 51) {
                                            hasNewCell = false;
                                            break;
                                        }
                                    }
                                    if (hasNewCell) {
                                        winningCells.push(new cc.Vec2(c, row - 1));
                                    }
                                }
                            }
                        }
                    }

                    // 绘制中奖框并播放动画
                    const paylineRenderer = SlotManager.Instance.paylineRenderer;
                    paylineRenderer.drawWinningRect(winningCells, 176, 140, null, 0);
                    for (let l = 0; l < paylineRenderer.listPayBox.length; ++l) {
                        const aniComp = paylineRenderer.listPayBox[l].getComponent(Animation)!;
                        aniComp.setCurrentTime(0);
                        aniComp.play();
                    }
                });

                // 播放符号特效+延迟+完成
                const playSymbolEffect = cc.callFunc(() => {
                    self.showTotalSymbolEffectOnAllLines();
                });

                const onComplete = cc.callFunc(() => {
                    winResultState.setDone();
                });

                // 计算特效时长（大额奖金加倍）
                const effectTime = SlotGameResultManager.Instance.getTotalWinMoney() > 3 * SlotGameRuleManager.Instance.getTotalBet()
                    ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2
                    : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

                // 执行收集单元格+播放特效+延迟+完成
                if (collectWinningCells) {
                    SlotManager.Instance.node.runAction(cc.sequence(
                        collectWinningCells,
                        playSymbolEffect,
                        cc.delayTime(effectTime),
                        onComplete
                    ));
                } else {
                    SlotManager.Instance.node.runAction(onComplete);
                }
            } else {
                winResultState.setDone();
            }
        });

        winResultState.addOnEndCallback(() => {
            State.prototype.onEnd();
        });

        return winResultState;
    }

    /**
     * 展示所有线路的符号特效（播放中奖符号动画+隐藏符号+播放音效）
     */
    public showTotalSymbolEffectOnAllLines(): void {
        const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const winningCells: Cell[] = [];

        if (payOutResults != null && payOutResults.length > 0) {
            // 停止所有符号动画
            SymbolAnimationController.Instance.stopAllAnimationSymbol();

            // 检查单元格是否已记录
            const isCellRecorded = (cell: Cell): boolean => {
                for (let o = 0; o < winningCells.length; ++o) {
                    if (cell.col === winningCells[o].col && cell.row === winningCells[o].row) {
                        return true;
                    }
                }
                return false;
            };

            // 收集所有中奖单元格
            for (let a = 0; a < payOutResults.length; ++a) {
                const payOut = payOutResults[a];
                const payLine = payOut.payLine;

                // 自定义中奖单元格
                if (payOut.winningCell != null && payOut.winningCell.length > 0) {
                    for (let u = 0; u < payOut.winningCell.length; ++u) {
                        const col = payOut.winningCell[u][1];
                        const row = payOut.winningCell[u][0];
                        const cell = new Cell(col, row);
                        if (!isCellRecorded(cell)) {
                            winningCells.push(cell);
                        }
                    }
                } else {
                    // 线路中奖单元格
                    for (let u = 0; u < 5; ++u) {
                        const row = Math.floor(payLine / (10000 / Math.pow(10, u))) % 10;
                        if (row !== 0) {
                            const cell = new Cell(u, row - 1);
                            if (!isCellRecorded(cell)) {
                                winningCells.push(cell);
                            }
                        }
                    }
                }
            }

            // 播放符号动画+隐藏符号
            for (let a = 0; a < winningCells.length; ++a) {
                const cell = winningCells[a];
                const symbol = lastHistoryWindows.GetWindow(cell.col).getSymbol(cell.row);
                SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbol, null, SlotManager.Instance.reelMachine, true);

                // Scatter符号偏移滚轮索引
                let reelIndex = cell.col;
                if (symbol === 51) {
                    reelIndex += 5;
                }
                SlotManager.Instance.reelMachine.reels[reelIndex].getComponent(Reel)!.hideSymbolInRow(cell.row);
            }

            // 显示符号暗化效果+播放中奖音效
            if (winningCells.length > 0) {
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
            } else {
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            }
            SlotSoundController.Instance().playWinSound(SlotGameResultManager.Instance.getTotalWinSymbolList());
        }
    }

    /**
     * 获取所有线路的单行特效状态（循环播放不同符号的中奖特效）
     * @returns State 单行特效状态
     */
    public getSingleLineEffectForAllLinesState(): State {
        const self = this;
        const singleLineState = new State();

        singleLineState.addOnStartCallback(() => {
            const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            const winningCells: Cell[] = [];
            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
            const winType = SlotGameResultManager.Instance.getWinTypeByTotalBet(totalBet);

            if (payOutResults != null && payOutResults.length > 0) {
                // 自动旋转/免费旋转/Scatter中奖时跳过单行特效
                if (winType ===SlotGameResultManager.WINSTATE_NORMAL && (SlotReelSpinStateManager.Instance.getAutospinMode() || 
                    SlotReelSpinStateManager.Instance.getFreespinMode() || 
                    SlotGameResultManager.Instance.getWinningCoinBySymbolId(51) > 0)) {
                    singleLineState.setDone();
                    return;
                }

                // 收集所有中奖符号类型
                let lineCount = 0;
                const symbolTypes: number[] = [];
                for (let y = 0; y < payOutResults.length; ++y) {
                    ++lineCount;
                    for (let g = 0; g < payOutResults[y].payOut.symbols.length; ++g) {
                        if (symbolTypes.indexOf(payOutResults[y].payOut.symbols[g]) === -1) {
                            symbolTypes.push(payOutResults[y].payOut.symbols[g]);
                        }
                    }
                }

                // 循环播放不同符号的单行特效
                let currentSymbolIndex = 0;
                const playSingleSymbolEffect = cc.callFunc(() => {
                    const symbolId = symbolTypes[currentSymbolIndex];
                    let totalWinForSymbol = 0;
                    let lineCountForSymbol = 0;
                    winningCells.length = 0;
                    const winningVec2: cc.Vec2[] = [];

                    // 停止所有符号动画
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();

                    // 检查单元格是否已记录
                    const isCellRecorded = (cell: Cell): boolean => {
                        for (let n = 0; n < winningCells.length; ++n) {
                            if (cell.col === winningCells[n].col && cell.row === winningCells[n].row) {
                                return true;
                            }
                        }
                        return false;
                    };
                    let maxCol = 0;
                    // 收集当前符号的中奖单元格
                    for (let y = 0; y < payOutResults.length; ++y) {
                        const payOut = payOutResults[y];
                        if (payOut.payOut.symbols.indexOf(symbolId) !== -1) {
                            totalWinForSymbol += payOut.winningCoin;
                            ++lineCountForSymbol;
                           

                            // 自定义中奖单元格
                            if (payOut.winningCell != null && payOut.winningCell.length > 0) {
                                for (let R = 0; R < payOut.winningCell.length; ++R) {
                                    const col = payOut.winningCell[R][1];
                                    const row = payOut.winningCell[R][0];
                                    const cell = new Cell(col, row);
                                    if (!isCellRecorded(cell)) {
                                        winningCells.push(cell);
                                        if (col !== 51) {
                                            winningVec2.push(new cc.Vec2(col, row));
                                        }
                                    }
                                    if (maxCol < col + 1) {
                                        maxCol = col + 1;
                                    }
                                }
                            } else {
                                // 线路中奖单元格
                                const payLine = payOut.payLine;
                                for (let R = 0; R < 5; ++R) {
                                    const row = Math.floor(payLine / (10000 / Math.pow(10, R))) % 10;
                                    if (row !== 0) {
                                        const cell = new Cell(R, row - 1);
                                        if (!isCellRecorded(cell)) {
                                            winningCells.push(cell);
                                            winningVec2.push(new cc.Vec2(R, row - 1));
                                        }
                                        if (R + 1 > maxCol) {
                                            maxCol = R + 1;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // 绘制中奖框并播放动画
                    const paylineRenderer = SlotManager.Instance.paylineRenderer;
                    if (paylineRenderer != null) {
                        paylineRenderer.clearAll();
                        paylineRenderer.drawWinningRect(winningVec2, 176, 140, null, 0);
                        for (let y = 0; y < paylineRenderer.listPayBox.length; ++y) {
                            const aniComp = paylineRenderer.listPayBox[y].getComponent(Animation)!;
                            aniComp.setCurrentTime(0);
                            aniComp.play();
                        }
                    }

                    // 播放符号动画+隐藏符号
                    let scatterCount = 0;
                    for (let y = 0; y < winningCells.length; ++y) {
                        const cell = winningCells[y];
                        const symbol = lastHistoryWindows.GetWindow(cell.col).getSymbol(cell.row);
                        SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbol, null, SlotManager.Instance.reelMachine, true);

                        let reelIndex = cell.col;
                        if (symbol === 51) {
                            scatterCount++;
                            reelIndex += 5;
                        }
                        SlotManager.Instance.reelMachine.reels[reelIndex].getComponent(Reel)!.hideSymbolInRow(cell.row);
                    }

                    // 多线路时更新底部奖金文本
                    if (lineCount > 1) {
                        const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
                        const payText = LangLocaleManager.getInstance().getLocalizedText("PAYS ${0}");
                        const formattedText = TSUtility.strFormat(payText.text, CurrencyFormatHelper.formatNumber(totalWinForSymbol));
                        SlotManager.Instance.bottomUIText.setWinMoney(totalWin, formattedText);
                    }

                    // 显示单行奖金信息（区分Scatter和普通符号）
                    if (symbolId !== 51) {
                        self.showSinglePaylineInfoForAllLines(self.getSymbolName(symbolId), maxCol, lineCountForSymbol, totalWinForSymbol);
                    } else {
                        self.showSinglePaylineInfoForAllLines(self.getSymbolName(symbolId), scatterCount, lineCountForSymbol, totalWinForSymbol);
                    }

                    // 切换到下一个符号（循环）
                    if (currentSymbolIndex === symbolTypes.length - 1) {
                        currentSymbolIndex = 0;
                    } else {
                        currentSymbolIndex++;
                    }

                    // 启用符号暗化效果
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
                });

                // 停止现有单行特效
                self.stopSingleLineAction();
                // 创建循环特效动作
                self.actionSingleLine = cc.repeatForever(cc.sequence(
                    playSingleSymbolEffect,
                    cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect)
                ));
                SlotManager.Instance.node.runAction(self.actionSingleLine);
                singleLineState.setDone();
            } else {
                singleLineState.setDone();
            }
        });

        return singleLineState;
    }

    /**
     * 获取打开免费旋转弹窗状态
     * @returns State 打开弹窗状态
     */
    public getOpenFreeSpinPopup(): State {
        const openPopupState = new State();
        openPopupState.addOnStartCallback(() => {
            SlotManager.Instance.getComponent(GameComponents_SharkAttack).freeSpinStartPopup.open(openPopupState.setDone.bind(openPopupState));
        });
        return openPopupState;
    }

    /**
     * 获取切换到免费旋转UI状态
     * @returns State UI切换状态
     */
    public getChangeUIToFreeSpinState(): State {
        const self = this;
        const changeUIState = new State();

        changeUIState.addOnStartCallback(() => {
            self.changeUIToFreespin();
            changeUIState.addOnEndCallback(() => {
                SlotManager.Instance.setKeyboardEventFlag(true);
                SlotManager.Instance.setMouseDragEventFlag(true);
            });
            changeUIState.setDone();
        });

        return changeUIState;
    }

    /**
     * 获取切换到普通UI状态
     * @returns State UI切换状态
     */
    public getChangeUIToNormalState(): State {
        const self = this;
        const changeUIState = new State();

        changeUIState.addOnStartCallback(() => {
            self.changeUIToNormal();
            changeUIState.setDone();
        });

        return changeUIState;
    }

    /**
     * 获取重置滚轮状态（收缩扩展滚轮）
     * @returns State 重置滚轮状态
     */
    public getResetReelState(): State {
        const resetReelState = new State();
        resetReelState.addOnStartCallback(() => {
            SlotManager.Instance.getComponent(GameComponents_SharkAttack).reelExpandComponent.resetReel();
            resetReelState.setDone();
        });
        return resetReelState;
    }

    /**
     * 获取检查大奖收集状态（播放大奖收集特效+累加奖金）
     * 注意：保留原拼写错误jackpotCollcetComponent以兼容
     * @returns SequencialState 大奖收集状态序列
     */
    public getCheckJackpotPrizeCollectState(): SequencialState {
        const jackpotCollectState = new SequencialState();
        const potResults = SlotGameResultManager.Instance.getSpinResult().subGamePotResults;

        if (potResults.length > 0 && potResults[0].winningCoin > 0) {
            // 停止特效
            jackpotCollectState.insert(1, this.getStopAllSymbolAniState());
            jackpotCollectState.insert(2, this.getStopSingleLineActionState());
            // 播放大奖闲置动画
            jackpotCollectState.insert(3, SlotManager.Instance.getComponent(GameComponents_SharkAttack).jackpotCollcetComponent.getJackpotIdleAnimationState());

            // 遍历大奖符号，插入收集状态
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            const symbolInfoArray = SlotGameResultManager.Instance.getResultSymbolInfoArray();
            const basePayout = this.getBasePayoutResult();
            let collectStep = 0;

            for (let l = 2; l < lastHistoryWindows.size; ++l) {
                let jackpotCount = 0;
                const window = lastHistoryWindows.GetWindow(l);
                for (let f = 0; f < window.size; ++f) {
                    if (window.getSymbol(f) === 91) { // 大奖符号
                        jackpotCount++;
                        // 计算符号奖金
                        const symbolPrize = SlotGameResultManager.Instance.getResultSymbolInfoArray()[l][f].prize * (SlotGameRuleManager.Instance.getTotalBet() / 100);
                        // 插入收集状态
                        jackpotCollectState.insert(4 + collectStep, SlotManager.Instance.getComponent(GameComponents_SharkAttack).jackpotCollcetComponent.getCollectPrizeState(
                            l, f, symbolPrize, basePayout, symbolInfoArray[l][f], collectStep
                        ));
                        collectStep++;
                    }
                }
                if (jackpotCount === 0) break;
            }

            // 收集结束后恢复状态
            jackpotCollectState.addOnEndCallback(() => {
                const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                const potMultiplier = SlotGameResultManager.Instance.getSubGameState(subGameKey).gauges.potMultiplier;
                const winType = SlotGameResultManager.Instance.getWinType();

                // 无倍数且普通中奖时播放奖金硬币特效
                if ((potMultiplier == null || potMultiplier === 0) && winType === SlotGameResultManager.WINSTATE_NORMAL) {
                    SlotManager.Instance.bottomUIText.playCoinEffectOfWinCoinArea();
                }
                // 移除水流特效
                SlotManager.Instance.getComponent(GameComponents_SharkAttack).jackpotCollcetComponent.removeAllWaterLight();
            });
        }

        return jackpotCollectState;
    }

    /**
     * 获取应用倍数状态（播放Wild倍数收集特效）
     * 注意：保留原拼写错误Multuplier以兼容
     * @returns SequencialState 倍数应用状态序列
     */
    public getApplyMultiplierState(): SequencialState {
        const multiplierState = new SequencialState();
        let step = 0;

        // 停止特效
        multiplierState.insert(step, this.getStopAllSymbolAniState());
        multiplierState.insert(step, this.getStopSingleLineActionState());

        // 计算基础奖金和倍数
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        let basePayout = this.getBasePayoutResult();
        let currentMultiplier = 1;
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const totalMultiplier = SlotGameResultManager.Instance.getSubGameState(subGameKey).gauges.potMultiplier;

        // 遍历Wild倍数符号（72/73）
        for (let r = 0; r < lastHistoryWindows.size; ++r) {
            const window = lastHistoryWindows.GetWindow(r);
            for (let u = 0; u < window.size; ++u) {
                const symbol = window.getSymbol(u);
                if (symbol === 72 || symbol === 73) { // Wild倍数符号
                    const symbolMultiplier = symbol - 70;
                    currentMultiplier *= symbolMultiplier;
                    // 是否达到总倍数且普通中奖
                    const isFinal = currentMultiplier === totalMultiplier && SlotGameResultManager.Instance.getWinType() ===SlotGameResultManager.WINSTATE_NORMAL;
                    // 插入倍数收集状态
                    multiplierState.insert(step++, SlotManager.Instance.getComponent(GameComponents_SharkAttack).jackpotCollcetComponent.getCollectWildMultuplierState(
                        r, u, symbolMultiplier, basePayout, isFinal
                    ));
                }
            }
        }

        // 倍数应用结束后移除特效
        multiplierState.addOnEndCallback(() => {
            SlotManager.Instance.getComponent(GameComponents_SharkAttack).jackpotCollcetComponent.removeWildMultiplier();
        });

        return multiplierState;
    }

    /**
     * 获取停止所有符号动画状态
     * @returns State 停止符号动画状态
     */
    public getStopAllSymbolAniState(): State {
        const self = this;
        const stopAniState = new State();

        stopAniState.addOnStartCallback(() => {
            self.checkPaylineRenderer();
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            if (SlotManager.Instance.paylineRenderer != null) {
                SlotManager.Instance.paylineRenderer.clearAll();
            }
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            SlotManager.Instance.reelMachine.showAllSymbol();
            stopAniState.setDone();
        });

        return stopAniState;
    }

    /**
     * 获取重置大奖收集信息状态（清空累计奖金）
     * @returns State 重置收集信息状态
     */
    public getResetCollectInfo(): State {
        const resetState = new State();
        resetState.addOnStartCallback(() => {
            SlotManager.Instance.getComponent(GameComponents_SharkAttack).jackpotCollcetComponent.resetBeforeWinningCoin();
            resetState.setDone();
        });
        return resetState;
    }

    /**
     * 切换UI到免费旋转模式
     */
    public changeUIToFreespin(): void {
        SlotManager.Instance._bottomUI.showFreespinUI();
        SlotManager.Instance._bottomUI.setShowFreespinMultiplier(false);
        SlotManager.Instance.setFreespinExtraInfoByCurrentState();
        SlotReelSpinStateManager.Instance.setFreespinMode(true);
        SlotManager.Instance.bottomUIText.setWinMoney(SlotGameResultManager.Instance.winMoneyInFreespinMode);
    }

    /**
     * 切换UI到普通模式
     */
    public changeUIToNormal(): void {
        SlotManager.Instance._bottomUI.hideFreespinUI();
        SlotReelSpinStateManager.Instance.setFreespinMode(false);
        SlotManager.Instance.stopAllBGM();
        SlotSoundController.Instance().playAudio("MainBGM", "BGM");
    }

    /**
     * 播放奖金递增结束音效
     */
    public playIncrementEndCoinSound(): void {
        SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");
        if (SlotGameResultManager.Instance.getTotalWinMoney() > 0 && SlotSoundController.Instance().getAudioClip("IncrementEndCoin")) {
            SlotSoundController.Instance().playAudio("IncrementEndCoin", "FX");
        }
    }
}