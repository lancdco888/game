// 业务模块导入
import UserInfo from '../../User/UserInfo';
// 游戏专属模块导入
import RainbowPearlManager from './RainbowPearlManager';
import ReelMachine_RainbowPearl from './ReelMachine_RainbowPearl';
import GameComponents_RainbowPearl from './GameComponents_RainbowPearl';
import JackpotSymbol_RainbowPearl from './JackpotSymbol_RainbowPearl';
import SubGameStateManager_Base from '../../SubGameStateManager_Base';
import State, { SequencialState } from '../../Slot/State';
import SlotManager from '../../manager/SlotManager';
import { BottomTextType } from '../../SubGame/BottomUIText';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import SlotSoundController from '../../Slot/SlotSoundController';
import SlotGameResultManager, { Cell } from '../../manager/SlotGameResultManager';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import SoundManager from '../../manager/SoundManager';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import Reel from '../../Slot/Reel';
import GameComponents_Base from '../../game/GameComponents_Base';
import ServicePopupManager from '../../manager/ServicePopupManager';
import CurrencyFormatHelper from '../../global_utility/CurrencyFormatHelper';

const { ccclass, property } = cc._decorator;

/**
 * RainbowPearl子游戏状态管理器（单例）
 * 统筹基础游戏/Lock&Roll模式的状态流转、动画/音效控制、UI切换、奖金展示等核心逻辑
 */
@ccclass('SubGameStateManager_RainbowPearl')
export default class SubGameStateManager_RainbowPearl extends SubGameStateManager_Base {
    //#region 单例配置
    private static _instance: SubGameStateManager_RainbowPearl | null = null;
    public static Instance(): SubGameStateManager_RainbowPearl {
        if (!this._instance) {
            this._instance = new SubGameStateManager_RainbowPearl();
        }
        return this._instance;
    }
    //#endregion

    //#region 公共属性
    /** 剩余Linked Jackpot旋转次数 */
    public remainLinkedJackpotSpins: number = 0;
    /** 单行动画实例（用于PayLine特效循环） */
    public actionSingleLine: cc.ActionInterval | null = null;
    /** 奖金递增前的倍数（特殊胜利效果用） */
    public increaseMoneyMultiplierBeforePlaySpecialWin: number = 1;
    //#endregion

    constructor() {
        super();
        // 初始化符号名称映射
        this.symbolNameList[23] = "MERA";
        this.symbolNameList[22] = "SHARK";
        this.symbolNameList[21] = "WATER HORSE";
        this.symbolNameList[15] = "ACE";
        this.symbolNameList[14] = "KING";
        this.symbolNameList[13] = "QUEEN";
        this.symbolNameList[12] = "JACK";
        this.symbolNameList[11] = "TEN";
    }

    //#region 基础游戏状态管理
    /**
     * 获取基础游戏完整状态流
     * @returns SequencialState 组合后的时序状态
     */
    public getBaseGameState(): SequencialState {
        const rootState = new SequencialState();
        const preSpinState = new SequencialState();
        let stateIndex = 0;

        // 预旋转状态：标记子游戏中、停止单行动画、停止符号动画、更新底部UI、重置奖金、启动滚轮旋转
        preSpinState.insert(stateIndex++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        preSpinState.insert(stateIndex++, this.getStopSingleLineActionState());
        preSpinState.insert(stateIndex++, this.getStopAllSymbolAniState());
        preSpinState.insert(stateIndex++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
        preSpinState.insert(stateIndex++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(0));
        preSpinState.insert(stateIndex++, SlotManager.Instance.getReelSpinStartState());
        rootState.insert(0, preSpinState);

        // 旋转后状态流（动态插入，仅当有旋转请求时执行）
        const postSpinState = new SequencialState();
        postSpinState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                // 滚轮正常旋转、滚动展示奖金、Burst特效、PayLine触发展示
                postSpinState.insert(stateIndex++, SlotManager.Instance.reelMachine.getNormalSpinReelStateRenewal());
                postSpinState.insert(stateIndex++, this.getScrollDownBeforeWinResultState());
                postSpinState.insert(stateIndex++, this.getShowBurstEffectState());
                postSpinState.insert(stateIndex++, this.getShowTotalTriggeredPaylineState());

                // PayLine符号特效状态组
                const symbolEffectState = new SequencialState();
                symbolEffectState.insert(0, this.getStateShowTotalSymbolEffectOnPayLines());
                symbolEffectState.insert(1, this.getSingleLineEffectForAllLinesStateRainbowPearl());
                postSpinState.insert(stateIndex, symbolEffectState);

                // 奖金更新、音效控制、Jackpot结果展示、Lock&Roll启动
                postSpinState.insert(stateIndex, this.getSetBottomInfoIncreaseWinMoneyState());
                postSpinState.insert(stateIndex, this.getSetBGSoundRatioState(0));
                postSpinState.insert(stateIndex++, this.getWinMoneyState());
                postSpinState.insert(stateIndex++, this.getResetBGSoundRatioState());
                postSpinState.insert(stateIndex++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
                postSpinState.insert(stateIndex, this.getShowJackpotResultState());
                postSpinState.insert(stateIndex++, this.getLockAndRollStartState());

                // 设置滚轮旋转状态为可跳过
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_SKIPABLE);
            }
        });
        rootState.insert(1, postSpinState);

        return rootState;
    }
    //#endregion

    //#region Lock&Roll（Jackpot）模式状态管理
    /**
     * 获取Lock&Roll游戏完整状态流
     * @returns SequencialState 组合后的时序状态
     */
    public getLockAndRollGameState(): SequencialState {
        const rootState = new SequencialState();
        const preSpinState = new SequencialState();
        let stateIndex = 0;

        // 获取Jackpot滚轮列表
        const reelMachineComp = SlotManager.Instance.reelMachine.getComponent(ReelMachine_RainbowPearl);
        const jackpotReels = reelMachineComp?.jackpotReels || [];

        // 预旋转状态：标记子游戏中、停止动画、减少剩余旋转次数、更新底部UI、启动Jackpot滚轮旋转
        preSpinState.insert(stateIndex++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        preSpinState.insert(stateIndex++, this.getStopSingleLineActionState());
        preSpinState.insert(stateIndex++, this.getStopAllSymbolAniState());
        preSpinState.insert(stateIndex++, this.decreaseRemainLinkedJackpotSpins());
        preSpinState.insert(stateIndex++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.CustomData, "Lock and Roll"));
        preSpinState.insert(stateIndex++, SlotManager.Instance.getReelSpinStartState(jackpotReels));
        rootState.insert(0, preSpinState);

        // 旋转后状态流（动态插入）
        const postSpinState = new SequencialState();
        postSpinState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                // Jackpot滚轮旋转、符号固定、结果展示、奖金汇总、结束判断
                postSpinState.insert(stateIndex++, reelMachineComp?.getLinkedJackpotReelState() || new State());
                postSpinState.insert(stateIndex++, this.getFixJackpotSymbolState());
                postSpinState.insert(stateIndex++, this.getShowJackpotResultState());
                postSpinState.insert(stateIndex++, this.playEffectSumOfJackpotResults());
                postSpinState.insert(stateIndex++, this.getCheckLockAndRollEndState());
                postSpinState.insert(stateIndex++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
            }
        });
        rootState.insert(1, postSpinState);

        return rootState;
    }

    /**
     * 减少剩余Linked Jackpot旋转次数
     * @returns State 状态实例
     */
    public decreaseRemainLinkedJackpotSpins(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.remainLinkedJackpotSpins--;
            // 更新UI剩余次数并播放音效
            const gameComponents = SlotManager.Instance.getComponent(GameComponents_RainbowPearl);
            gameComponents?.linkedJackpotUI?.showRemainSpins(this.remainLinkedJackpotSpins);
            SlotSoundController.Instance().playAudio("LockAndRollSpinCountDecrease", "FX");
            state.setDone();
        });
        return state;
    }

    /**
     * 检查Lock&Roll模式是否结束
     * @returns SequencialState 结束流程状态流
     */
    public getCheckLockAndRollEndState(): SequencialState {
        const state = new SequencialState();
        state.addOnStartCallback(() => {
            const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
            // 非Lock&Roll模式时执行结束流程
            if (nextSubGameKey !== "lockNRoll" && nextSubGameKey !== "lockNRoll_fromchoose") {
                // 锁定结果特效、Lock&Roll结果展示、隐藏UI、切换回普通UI、大胜利特效
                state.insert(0, this.getShowLockedResultEffectState());
                state.insert(1, this.getShowLockAndRollResultState());
                state.insert(2, this.getHideLinkedJackpotModeUIState());

                // 切换回基础游戏UI（若下一个状态是base）
                if (nextSubGameKey === "base") {
                    state.insert(2, this.getChangeUIToNormalState());
                } else {
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                }

                state.insert(3, this.getShowBigWinEffectEndFreespinState());
            }
        });
        return state;
    }

    /**
     * 获取Lock&Roll结果展示状态
     * @returns State 状态实例
     */
    public getShowLockAndRollResultState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            // 临时静音主音量，播放主BGM
            SoundManager.Instance().setMainVolumeTemporarily(0);
            SlotManager.Instance.playMainBgm();

            // 获取投注和奖金数据
            const currentBetPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
            const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const subGameState = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey);

            if (!subGameState) {
                state.setDone();
                return;
            }

            // 更新底部UI奖金并打开结果面板
            SlotManager.Instance.bottomUIText.setWinMoney(subGameState.totalWinningCoin);
            const gameComponents = SlotManager.Instance.getComponent(GameComponents_RainbowPearl);
            gameComponents?.lockAndRollResult?.open(subGameState.totalWinningCoin, currentBetPerLine, () => {
                state.setDone();
            });
        });
        return state;
    }
    //#endregion

    //#region UI状态切换
    /**
     * 切换UI到普通模式（基础游戏）
     */
    public changeUIToNormal(): void {
        // 隐藏免费旋转UI、显示基础UI、重置Jackpot符号层级、切换滚轮状态为基础模式
        SlotManager.Instance._bottomUI.hideFreespinUI();
        const gameComponents = SlotManager.Instance.getComponent(GameComponents_RainbowPearl);
        gameComponents?.linkedJackpotUI?.showBaseMiddleUI();
        gameComponents?.jackpotSymbolFixComponent?.resetLayer();
        RainbowPearlManager.getInstance().setShowingReelState("base");
    }

    /**
     * 切换UI到Lock&Roll模式
     */
    public changeUIToLockAndRoll(): void {
        // 显示Linked Jackpot UI、激活滚轮框架
        const gameComponents = SlotManager.Instance.getComponent(GameComponents_RainbowPearl);
        gameComponents?.linkedJackpotUI?.showLinkedMiddleUI();
        gameComponents?.reelFrameLinkedJackpot && (gameComponents.reelFrameLinkedJackpot.active = true);
    }

    /**
     * 显示Linked Jackpot启动UI
     */
    public showStartLinkedJackpotUI(): void {
        const gameComponents = SlotManager.Instance.getComponent(GameComponents_RainbowPearl);
        gameComponents?.linkedJackpotUI?.showStartLinkedJackpotText();
    }

    /**
     * 获取切换到普通UI的状态
     * @returns State 状态实例
     */
    public getChangeUIToNormalState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.changeUIToNormal();
            this.changeBaseReelSymbolAtEndLockAndRollMode();
            SlotReelSpinStateManager.Instance.setFreespinMode(false);
            SlotManager.Instance.stopAllBGM();
            SlotSoundController.Instance().playAudio("MainBGM", "BGM");
            state.setDone();
        });
        return state;
    }

    /**
     * Lock&Roll模式结束时恢复基础滚轮符号
     */
    public changeBaseReelSymbolAtEndLockAndRollMode(): void {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const resultSymbolInfoArray = SlotGameResultManager.Instance.getResultSymbolInfoArray();

        if (!lastHistoryWindows || lastHistoryWindows.size <= 0) return;

        // 遍历所有滚轮和行，恢复/替换符号
        for (let col = 0; col < 5; ++col) {
            for (let row = 0; row < 3; ++row) {
                const symbolId = lastHistoryWindows.GetWindow(col).getSymbol(row);
                const symbolInfo = resultSymbolInfoArray[col][row];
                const reelComp = SlotManager.Instance.reelMachine.reels[col]?.getComponent(Reel);
                if (!reelComp) continue;

                // 替换92/93符号为99，其他保持原符号
                const targetSymbolId = (symbolId === 92 || symbolId === 93) ? 99 : symbolId;
                reelComp.changeSymbol(row, targetSymbolId, symbolInfo);

                // 设置Jackpot符号暗显状态
                const symbolNode = reelComp.getSymbol(row);
                if (symbolNode) {
                    if (symbolId >= 90 && symbolId < 95) {
                        // Jackpot符号：暗显文本，关闭符号暗显
                        symbolNode.getComponent(JackpotSymbol_RainbowPearl)?.setDimmContents(true);
                        symbolNode.getComponent(Symbol)?.setDimmActive(false);
                    } else {
                        // 普通符号：开启暗显
                        symbolNode.getComponent(Symbol)?.setDimmActive(true);
                    }
                }
            }
        }
    }

    /**
     * 获取隐藏Linked Jackpot模式UI的状态
     * @returns State 状态实例
     */
    public getHideLinkedJackpotModeUIState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            // 启用投注按钮交互
            SlotManager.Instance._bottomUI.setInteractableFlagForBetPerLineBtns(true);
            SlotManager.Instance._bottomUI.setInteractableFlagForMaxbetBtn(true);
            state.setDone();
        });
        return state;
    }
    //#endregion

    //#region Jackpot相关状态
    /**
     * 获取Jackpot结果展示状态
     * @returns State 状态实例
     */
    public getShowJackpotResultState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;
            // 无Jackpot结果时直接完成
            if (!jackpotResults || jackpotResults.length <= 0) {
                state.setDone();
                return;
            }

            // 确定Jackpot等级（mega:4, major:3, minor:2, mini:1）
            const jackpotSubKey = jackpotResults[0].jackpotSubKey;
            let jackpotLevel = 0;
            if (jackpotSubKey === "mega") jackpotLevel = 4;
            else if (jackpotSubKey === "major") jackpotLevel = 3;
            else if (jackpotSubKey === "minor") jackpotLevel = 2;
            else if (jackpotSubKey === "mini") jackpotLevel = 1;

            // 无效等级直接完成
            if (jackpotLevel === 0) {
                state.setDone();
                return;
            }

            // 延迟1秒展示Jackpot结果
            SlotManager.Instance.scheduleOnce(() => {
                const winningCoin = jackpotResults[0].winningCoin;
                const currentBetPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();

                // 停止动画、设置滚轮符号暗显
                this.stopSingleLineAction();
                SymbolAnimationController.Instance.stopAllAnimationSymbol();
                
                const reelMachineComp = SlotManager.Instance.reelMachine.getComponent(ReelMachine_RainbowPearl);
                // 基础滚轮暗显
                reelMachineComp?.reels.forEach(reel => {
                    reel.getComponent(Reel)?.setSymbolsDimmActive(false);
                });
                // Jackpot滚轮暗显
                reelMachineComp?.jackpotReels.forEach(reel => {
                    reel.getComponent(Reel)?.setSymbolsDimmActive(false);
                });

                // 更新底部UI并打开Jackpot结果面板
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "JACKPOT");
                SlotManager.Instance.bottomUIText.setWinMoney(winningCoin);
                
                const gameComponents = SlotManager.Instance.getComponent(GameComponents_RainbowPearl);
                gameComponents?.jackpotResult?.open(winningCoin, currentBetPerLine, () => {
                    SlotManager.Instance.unscheduleAllCallbacks();
                    state.setDone();
                });
            }, 1);
        });
        return state;
    }

    /**
     * 获取Lock&Roll启动状态
     * @returns SequencialState 启动流程状态流
     */
    public getLockAndRollStartState(): SequencialState {
        const state = new SequencialState();
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const subGameState = nextSubGameKey ? SlotGameResultManager.Instance.getSubGameState(nextSubGameKey) : null;

        // 仅当从基础游戏切换到Lock&Roll时执行
        if (subGameState && subGameState.prevSubGameKey === "base" && nextSubGameKey === "lockNRoll") {
            const startState = new State();
            startState.addOnStartCallback(() => {
                // 清空PayLine、停止符号动画、重置Jackpot奖金
                SlotManager.Instance.paylineRenderer?.clearAll();
                SymbolAnimationController.Instance.stopAllAnimationSymbol();
                SlotGameResultManager.Instance.winMoneyInLinkedJackpotMode = 0;

                const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
                const resultSymbolInfoArray = SlotGameResultManager.Instance.getResultSymbolInfoArray();

                // 步骤1：播放Jackpot符号触发动画
                const playJackpotSymbolAni = cc.callFunc(() => {
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    // 遍历所有符号，播放90/91符号动画
                    for (let col = 0; col < 5; ++col) {
                        for (let row = 0; row < 3; ++row) {
                            const symbolId = lastHistoryWindows.GetWindow(col).getSymbol(row);
                            const symbolInfo = resultSymbolInfoArray[col][row];
                            if (symbolId === 90 || symbolId === 91) {
                                const animNode = SymbolAnimationController.Instance.playAnimationSymbol(col, row, 97, null, null, false);
                                animNode.getComponent(JackpotSymbol_RainbowPearl)?.setCenterInfoRainbowPearl(0, symbolInfo.prize);
                                SlotManager.Instance.reelMachine.reels[col].getComponent(Reel)?.hideSymbolInRow(row);
                            }
                        }
                    }
                    // 更新底部UI并播放触发音效
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "LOCK & ROLL ACTIVATED!");
                    SlotSoundController.Instance().playAudio("JackpotSymbolTrigger", "FX");
                });

                // 步骤2：停止触发音效，显示所有符号
                const stopTriggerSound = cc.callFunc(() => {
                    SlotSoundController.Instance().stopAudio("JackpotSymbolTrigger", "FX");
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    SlotManager.Instance.reelMachine.showAllSymbol();
                });

                // 步骤3：切换UI到Lock&Roll模式
                const switchToLockAndRollUI = cc.callFunc(() => {
                    SlotReelSpinStateManager.Instance.changeAutospinMode(false);
                    this.changeUIToLockAndRoll();
                    this.showStartLinkedJackpotUI();
                    if (nextSubGameKey === "lockNRoll") {
                        RainbowPearlManager.getInstance().setShowingReelState("jackpot");
                    }
                    RainbowPearlManager.getInstance().reelMachine.getComponent(ReelMachine_RainbowPearl)?.showJackpotReel();
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.BetMultiplier);
                    this.remainLinkedJackpotSpins = -1;
                });

                // 步骤4：固定Jackpot窗口
                const fixJackpotWindow = cc.callFunc(() => {
                    RainbowPearlManager.getInstance().fixJackpotWindow(lastHistoryWindows, resultSymbolInfoArray, null);
                });

                // 步骤5：初始化剩余旋转次数
                const initRemainSpins = cc.callFunc(() => {
                    this.remainLinkedJackpotSpins = 3;
                    const gameComponents = SlotManager.Instance.getComponent(GameComponents_RainbowPearl);
                    gameComponents?.linkedJackpotUI?.showInitialSpins();
                });

                // 步骤6：播放Lock&Roll BGM
                const playLockAndRollBgm = cc.callFunc(() => {
                    SlotSoundController.Instance().playAudio("LockAndRollBGM", "BGM");
                    startState.setDone();
                });

                // 统计有效符号信息数量
                let validSymbolInfoCount = 0;
                if (resultSymbolInfoArray) {
                    for (let col = 0; col < resultSymbolInfoArray.length; ++col) {
                        for (let row = 0; row < resultSymbolInfoArray[col].length; ++row) {
                            const symbolInfo = resultSymbolInfoArray[col][row];
                            if (symbolInfo && symbolInfo.type !== "") {
                                validSymbolInfoCount++;
                            }
                        }
                    }
                }

                // 15个有效符号时直接结束（无旋转次数），否则执行完整流程
                if (validSymbolInfoCount === 15) {
                    this.remainLinkedJackpotSpins = 0;
                    SlotManager.Instance.stopAllBGM();
                    startState.setDone();
                } else {
                    const lockAndRollIntroAction = SlotManager.Instance.getActionLockAndRollIntroText();
                    SlotManager.Instance.node.runAction(cc.sequence(
                        cc.delayTime(0.5),
                        playJackpotSymbolAni,
                        cc.delayTime(2),
                        stopTriggerSound,
                        lockAndRollIntroAction,
                        switchToLockAndRollUI,
                        cc.delayTime(2),
                        fixJackpotWindow,
                        cc.delayTime(1),
                        initRemainSpins,
                        cc.delayTime(1.2),
                        playLockAndRollBgm
                    ));
                }
            });

            // 预启动状态：停止动画
            state.insert(0, this.getStopSingleLineActionState());
            state.insert(0, this.getStopAllSymbolAniState());
            state.insert(1, startState);
        }

        return state;
    }

    /**
     * 获取固定Jackpot符号的状态
     * @returns State 状态实例
     */
    public getFixJackpotSymbolState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            const resultSymbolInfoArray = SlotGameResultManager.Instance.getResultSymbolInfoArray();
            
            // 停止符号动画，显示未固定的Jackpot符号
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            const gameComponents = SlotManager.Instance.getComponent(GameComponents_RainbowPearl);
            const reelMachineComp = SlotManager.Instance.reelMachine.getComponent(ReelMachine_RainbowPearl);

            if (gameComponents?.jackpotSymbolFixComponent && reelMachineComp?.jackpotReels) {
                for (let col = 0; col < 5; ++col) {
                    for (let row = 0; row < 3; ++row) {
                        // 未固定的符号显示所有内容
                        if (!gameComponents.jackpotSymbolFixComponent.fixJackpotSymbolObject[col][row]) {
                            const jackpotReel = reelMachineComp.jackpotReels[3 * col + row];
                            jackpotReel.getComponent(Reel)?.showAllSymbol();
                        }
                    }
                }
            }

            // 固定Jackpot窗口并完成状态
            RainbowPearlManager.getInstance().fixJackpotWindow(lastHistoryWindows, resultSymbolInfoArray, () => {
                state.setDone();
            });
        });
        return state;
    }

    /**
     * 播放Jackpot结果汇总特效（预留扩展）
     * @returns State 状态实例
     */
    public playEffectSumOfJackpotResults(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            state.setDone();
        });
        return state;
    }

    /**
     * 检查剩余Linked Jackpot旋转次数（不足时重置）
     */
    public checkRemainLinkedJackpotCount(): void {
        const subGameState = SlotGameResultManager.Instance.getSubGameState("lockNRoll");
        if (subGameState && subGameState.spinCnt === 0 && this.remainLinkedJackpotSpins < 3) {
            this.remainLinkedJackpotSpins = 3;
            // 更新UI并播放重置音效
            const gameComponents = SlotManager.Instance.getComponent(GameComponents_RainbowPearl);
            gameComponents?.linkedJackpotUI?.showRemainSpins(this.remainLinkedJackpotSpins);
            gameComponents?.linkedJackpotUI?.playResetSpinCountAni();
            SlotSoundController.Instance().playAudio("LockAndRollSpinCountReset", "FX");
        }
    }

    /**
     * 获取锁定结果特效状态
     * @returns State 状态实例
     */
    public getShowLockedResultEffectState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const spinResult = SlotGameResultManager.Instance.getSpinResult();
            const gameComponents = SlotManager.Instance.getComponent(GameComponents_RainbowPearl);
            gameComponents?.jackpotSymbolFixComponent?.playResultEffect(spinResult, () => {
                gameComponents.jackpotSymbolFixComponent.moveLightComponent.clearAllAnis();
                state.setDone();
            });
        });
        return state;
    }

    /**
     * 获取Burst结果特效状态
     * @returns State 状态实例
     */
    public getShowBurstResultEffectState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const gameComponents = SlotManager.Instance.getComponent(GameComponents_RainbowPearl);
            gameComponents?.jackpotSymbolFixComponent?.playBurstResultEffect(() => {
                state.setDone();
            });
        });
        return state;
    }
    //#endregion

    //#region 特效与动画控制
    /**
     * 获取Burst特效展示状态
     * @returns State 状态实例
     */
    public getShowBurstEffectState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const subGamePotResults = SlotGameResultManager.Instance.getSpinResult().subGamePotResults;
            // 无Burst结果时直接完成
            if (subGamePotResults.length <= 0) {
                state.setDone();
                return;
            }

            // 播放Burst结果特效
            const gameComponents = SlotManager.Instance.getComponent(GameComponents_RainbowPearl);
            gameComponents?.jackpotSymbolFixComponent?.playBurstResultEffect(() => {
                const winningCoin = subGamePotResults[0].winningCoin;
                const totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();
                const winType = SlotGameResultManager.Instance.getWinType(winningCoin);
                const isTotalWinDifferent = totalWinMoney !== winningCoin;

                // 无奖金时直接完成
                if (winningCoin === 0) {
                    state.setDone();
                    return;
                }

                // 奖金递增结束回调
                const finishIncrement = () => {
                    SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");
                    if (!isTotalWinDifferent) {
                        SlotManager.Instance.bottomUIText.showWinEffect(false);
                    }
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    state.setDone();
                };

                // 播放奖金递增音效，更新底部UI
                SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                if (!isTotalWinDifferent) {
                    SlotManager.Instance.bottomUIText.showWinEffect(true);
                }
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                SlotManager.Instance.bottomUIText.playChangeWinMoney(0, winningCoin, null, false, 1);
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.IncreaseWinMoneyDefault);

                // 非普通胜利时播放特殊胜利特效
                if (!isTotalWinDifferent && winType !==SlotGameResultManager.WINSTATE_NORMAL) {
                    const totalBet = SlotGameRuleManager.Instance.getTotalBet();
                    const effectBigWin = SlotManager.Instance.getComponent(GameComponents_Base)?.effectBigWinNew;
                    if (!effectBigWin) {
                        SlotManager.Instance.scheduleOnce(finishIncrement, 1.1);
                        return;
                    }

                    const symbolEffectTime = SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;
                    // 步骤1：预递增奖金
                    const preIncrement = cc.callFunc(() => {
                        SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                        const preWinMoney = totalBet * this.increaseMoneyMultiplierBeforePlaySpecialWin;
                        SlotManager.Instance.bottomUIText.playChangeWinMoney(0, preWinMoney, null, false, symbolEffectTime);
                        SlotManager.Instance.setMouseDragEventFlag(false);
                    });

                    // 步骤2：播放大胜利特效
                    const playBigWinEffect = cc.callFunc(() => {
                        const effectDuration = effectBigWin.playWinEffect(
                            totalWinMoney, totalBet, finishIncrement,
                            () => {
                                SlotManager.Instance.bottomUIText.stopChangeWinMoney(winningCoin);
                                this.playIncrementEndCoinSound();
                            },
                            false
                        );
                        SlotManager.Instance.bottomUIText.playChangeWinMoney(
                            totalBet * this.increaseMoneyMultiplierBeforePlaySpecialWin,
                            winningCoin,
                            () => this.playIncrementEndCoinSound(),
                            false,
                            effectDuration
                        );
                    });

                    // 执行特效流程
                    SlotManager.Instance.node.runAction(cc.sequence(
                        preIncrement,
                        cc.delayTime(symbolEffectTime),
                        playBigWinEffect
                    ));
                } else {
                    // 普通胜利：延迟1.1秒完成
                    SlotManager.Instance.scheduleOnce(finishIncrement, 1.1);
                }
            });
        });
        return state;
    }

    /**
     * 获取PayLine上总符号特效展示状态
     * @returns State 状态实例
     */
    public getStateShowTotalSymbolEffectOnPayLines(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();
            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
            // 计算特效时长（大额奖金加倍）
            const effectDuration = totalWinMoney > 3 * totalBet
                ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2
                : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

            // 显示符号特效并延迟完成
            if (this.showTotalSymbolEffectOnPaylines()) {
                SlotManager.Instance.scheduleOnce(() => {
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    this.setDimmDeActiveTotalSymbolOnPaylines();
                    state.setDone();
                }, effectDuration);
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 获取大胜利特效展示状态（免费旋转结束时）
     * @returns State 状态实例
     */
    public getShowBigWinEffectEndFreespinState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const subGameState = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey);
            if (!subGameState) {
                state.setDone();
                return;
            }

            const totalWinningCoin = subGameState.totalWinningCoin;
            // 重置滚轮符号暗显状态
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            const winType = SlotGameResultManager.Instance.getWinType(totalWinningCoin);

            // 非普通胜利时播放大胜利特效
            if (winType !==SlotGameResultManager.WINSTATE_NORMAL) {
                const effectBigWin = SlotManager.Instance.getComponent(GameComponents_Base)?.effectBigWinNew;
                if (!effectBigWin) {
                    state.setDone();
                    return;
                }

                const totalBet = SlotGameRuleManager.Instance.getTotalBet();
                effectBigWin._isPlayExplodeCoin = false;
                effectBigWin.playWinEffectWithoutIncreaseMoney(
                    totalWinningCoin, totalBet,
                    () => {
                        // 恢复主音量，弹出新纪录提示
                        SoundManager.Instance().resetTemporarilyMainVolume();
                        ServicePopupManager.instance().reserveNewRecordPopup(totalWinningCoin);
                        state.setDone();
                    },
                    null,
                    false
                );
            } else {
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 获取RainbowPearl专属的单行PayLine特效状态
     * @returns State 状态实例
     */
    public getSingleLineEffectForAllLinesStateRainbowPearl(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            const winType = SlotGameResultManager.Instance.getWinType();

            // 无PayLine结果时直接完成
            if (!payOutResults || payOutResults.length === 0) {
                state.setDone();
                return;
            }

            // 自动旋转/免费旋转/特殊符号胜利时跳过特效
            if (winType ===SlotGameResultManager.WINSTATE_NORMAL && 
                (SlotReelSpinStateManager.Instance.getAutospinMode() || 
                 SlotReelSpinStateManager.Instance.getFreespinMode() || 
                 SlotGameResultManager.Instance.getWinningCoinBySymbolId(51) > 0)) {
                state.setDone();
                return;
            }

            // 收集所有胜利符号ID
            const symbolIds: number[] = [];
            let resultCount = 0;
            for (let i = 0; i < payOutResults.length; ++i) {
                resultCount++;
                for (let j = 0; j < payOutResults[i].payOut.symbols.length; ++j) {
                    const symbolId = payOutResults[i].payOut.symbols[j];
                    if (symbolIds.indexOf(symbolId) === -1) {
                        symbolIds.push(symbolId);
                    }
                }
            }

            // 定义单行特效播放逻辑
            let currentSymbolIndex = 0;
            const winningCells: Cell[] = [];

            // 检查单元格是否已存在
            const isCellExisted = (cell: Cell): boolean => {
                for (let i = 0; i < winningCells.length; ++i) {
                    if (cell.col === winningCells[i].col && cell.row === winningCells[i].row) {
                        return true;
                    }
                }
                return false;
            };

            // 播放单个符号的PayLine特效
            const playSingleSymbolEffect = cc.callFunc(() => {
                const currentSymbolId = symbolIds[currentSymbolIndex];
                winningCells.length = 0;
                const winningPositions: cc.Vec2[] = [];
                let totalWin = 0;
                let lineCount = 0;
                let maxCol = 0;

                // 停止所有符号动画
                SymbolAnimationController.Instance.stopAllAnimationSymbol();

                // 遍历所有PayLine结果，收集胜利单元格
                for (let i = 0; i < payOutResults.length; ++i) {
                    const payLineResult = payOutResults[i];
                    if (payLineResult.payOut.symbols.indexOf(currentSymbolId) === -1) continue;

                    // 累加奖金和行数
                    totalWin += payLineResult.winningCoin;
                    lineCount++;

                    // 从winningCell收集位置
                    if (payLineResult.winningCell && payLineResult.winningCell.length > 0) {
                        for (let j = 0; j < payLineResult.winningCell.length; ++j) {
                            const row = payLineResult.winningCell[j][1];
                            const col = payLineResult.winningCell[j][0];
                            const cell = new Cell(col, row);
                            if (!isCellExisted(cell)) {
                                winningCells.push(cell);
                                winningPositions.push(new cc.Vec2(col, row));
                            }
                            maxCol = Math.max(maxCol, col + 1);
                        }
                    } 
                    // 从PayLine计算位置
                    else {
                        const payLine = payLineResult.payLine;
                        for (let col = 0; col < 5; ++col) {
                            const row = Math.floor(payLine / (10000 / Math.pow(10, col))) % 10;
                            if (row !== 0) {
                                const cell = new Cell(col, row - 1);
                                if (!isCellExisted(cell)) {
                                    winningCells.push(cell);
                                    winningPositions.push(new cc.Vec2(col, row - 1));
                                }
                                maxCol = Math.max(maxCol, col + 1);
                            }
                        }
                    }
                }

                // 绘制胜利矩形
                SlotManager.Instance.paylineRenderer?.clearAll();
                SlotManager.Instance.paylineRenderer?.drawWinningRect(winningPositions, 194, 156, null, 0);

                // 播放符号动画并隐藏原符号
                for (let i = 0; i < winningCells.length; ++i) {
                    const cell = winningCells[i];
                    const symbolId = lastHistoryWindows.GetWindow(cell.col).getSymbol(cell.row);
                    SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbolId);
                    SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel)?.hideSymbolInRow(cell.row);
                }

                // 多结果时更新底部UI奖金
                if (resultCount > 1) {
                    const totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();
                    const winText = "PAYS " + CurrencyFormatHelper.formatNumber(totalWin);
                    SlotManager.Instance.bottomUIText.setWinMoney(totalWinMoney, winText);
                }

                // 显示单行PayLine信息
                this.showSinglePaylineInfoForAllLines(
                    this.getSymbolName(currentSymbolId),
                    maxCol,
                    lineCount,
                    totalWin
                );

                // 切换到下一个符号（循环）
                currentSymbolIndex = (currentSymbolIndex === symbolIds.length - 1) ? 0 : currentSymbolIndex + 1;
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
            });

            // 停止原有单行动画，播放循环特效
            this.stopSingleLineAction();
            this.actionSingleLine = cc.repeatForever(cc.sequence(
                playSingleSymbolEffect,
                cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect)
            ));
            SlotManager.Instance.node.runAction(this.actionSingleLine);
            state.setDone();
        });
        return state;
    }
    //#endregion

    //#region 奖金处理
    /**
     * 获取奖金展示状态
     * @returns State 状态实例
     */
    public getWinMoneyState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();
            const subGamePotMoney = SlotGameResultManager.Instance.getTotalSubGamePotResultsMoney();
            const isShowWinEffect = this.isShowWinMoneyEffect();

            // 奖金应用完成回调
            const finishApplyWinMoney = () => {
                SlotManager.Instance.bottomUIText.showWinEffect(false);
                SlotManager.Instance.setMouseDragEventFlag(true);
                UserInfo.instance().setBiggestWinCoin(totalWinMoney);
                SlotManager.Instance.applyGameResultMoney(totalWinMoney);
                state.setDone();
            };

            // 无需展示奖金特效时直接完成
            if (isShowWinEffect === 0 || totalWinMoney === subGamePotMoney) {
                finishApplyWinMoney();
                return;
            }

            const winType = SlotGameResultManager.Instance.getWinType();
            SlotManager.Instance.bottomUIText.showWinEffect(true);

            // 无奖金时直接完成
            if (totalWinMoney <= 0) {
                finishApplyWinMoney();
                return;
            }

            const startWinMoney = subGamePotMoney;
            const targetWinMoney = totalWinMoney;
            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
            // 计算特效时长（大额奖金加倍）
            const effectDuration = targetWinMoney > 3 * totalBet
                ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2
                : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

            // 非普通胜利时播放特殊奖金递增特效
            if (winType !==SlotGameResultManager.WINSTATE_NORMAL) {
                SlotManager.Instance.bottomUIText.setWinMoney(startWinMoney);
                const effectBigWin = SlotManager.Instance.getComponent(GameComponents_Base)?.effectBigWinNew;
                if (!effectBigWin) {
                    // 无特效组件时直接播放递增
                    SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(startWinMoney, targetWinMoney, finishApplyWinMoney, true, effectDuration);
                    return;
                }

                const symbolEffectTime = SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;
                const preWinMoney = startWinMoney + Math.floor((targetWinMoney - startWinMoney) / 4);

                // 步骤1：预递增奖金
                const preIncrement = cc.callFunc(() => {
                    SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(startWinMoney, preWinMoney, null, false, symbolEffectTime);
                    SlotManager.Instance.setMouseDragEventFlag(false);
                });

                // 步骤2：播放多倍胜利特效
                const playMutipleWinEffect = cc.callFunc(() => {
                    const effectDuration = effectBigWin.playWinEffectForMutiple(
                        targetWinMoney, totalBet, finishApplyWinMoney,
                        () => {
                            SlotManager.Instance.bottomUIText.stopChangeWinMoney(targetWinMoney);
                            this.playIncrementEndCoinSound();
                        },
                        preWinMoney
                    );
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(
                        preWinMoney, targetWinMoney,
                        () => this.playIncrementEndCoinSound(),
                        false,
                        effectDuration
                    );
                });

                // 执行特效流程
                SlotManager.Instance.node.runAction(cc.sequence(
                    preIncrement,
                    cc.delayTime(symbolEffectTime),
                    playMutipleWinEffect
                ));
            } else {
                // 普通胜利：直接播放奖金递增
                SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                SlotManager.Instance.bottomUIText.setWinMoney(startWinMoney);
                SlotManager.Instance.bottomUIText.playChangeWinMoney(startWinMoney, targetWinMoney, finishApplyWinMoney, true, effectDuration);
            }
        });

        // 状态结束时播放奖金递增结束音效
        state.addOnEndCallback(() => {
            this.playIncrementEndCoinSound();
        });

        return state;
    }

    /**
     * 判断是否展示奖金特效
     * @returns number 1-展示 0-不展示
     */
    public isShowWinMoneyEffect(): number {
        // 基础类判断 或 有SubGamePot结果时展示
        const baseShowFlag = super.isShowWinMoneyEffect();
        const hasSubGamePotResults = SlotGameResultManager.Instance.getSpinResult().subGamePotResults.length > 0;
        return (baseShowFlag === 1 || hasSubGamePotResults) ? 1 : 0;
    }

    /**
     * 播放奖金递增结束音效
     */
    public playIncrementEndCoinSound(): void {
        SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");
        SlotSoundController.Instance().playAudio("IncrementCoinEnd", "FX");
    }
    //#endregion

    //#region 通用工具方法
    /**
     * 获取符号名称
     * @param symbolId 符号ID
     * @returns string 符号名称
     */
    public getSymbolName(symbolId: number): string {
        return this.symbolNameList[symbolId] || "UNKNOWN";
    }
    //#endregion
}