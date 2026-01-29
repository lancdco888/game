import CameraControl from "../../../../Script/Slot/CameraControl";
import Reel from "../../../../Script/Slot/Reel";
import SlotReelSpinStateManager from "../../../../Script/Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../../../Script/Slot/SlotSoundController";
import State, { SequencialState } from "../../../../Script/Slot/State";
import SymbolAnimationController from "../../../../Script/Slot/SymbolAnimationController";
import { BottomTextType } from "../../../../Script/SubGame/BottomUIText";
import SubGameStateManager_Base from "../../../../Script/SubGameStateManager_Base";
import GameComponents_Base from "../../../../Script/game/GameComponents_Base";
import CurrencyFormatHelper from "../../../../Script/global_utility/CurrencyFormatHelper";
import SDefine from "../../../../Script/global_utility/SDefine";
import TSUtility from "../../../../Script/global_utility/TSUtility";
import LangLocaleManager from "../../../../Script/manager/LangLocaleManager";
import SlotGameResultManager, { Cell } from "../../../../Script/manager/SlotGameResultManager";
import SlotGameRuleManager from "../../../../Script/manager/SlotGameRuleManager";
import SlotManager from "../../../../Script/manager/SlotManager";
import HoundsComponent_HoundOfHades from "./HoundsComponent_HoundOfHades";
import PrizeComponent_HoundOfHades from "./PrizeComponent_HoundOfHades";
import ReelMachine_HoundOfHades from "./ReelMachine_HoundOfHades";


const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - 子游戏状态管理器
 * 继承自基础子游戏状态管理器，管理基础游戏/LockNRoll模式的完整流程、猎犬组件、奖励计算、UI交互、动画/音效控制
 */
@ccclass()
export default class SubGameStateManager_HoundOfHades extends SubGameStateManager_Base {
    // ====== 静态实例 ======
    private static _Instance: SubGameStateManager_HoundOfHades = null;
    
    // ====== 成员变量 ======
    public game_manager: any = null; // 游戏管理器实例（根据项目实际类型替换）
    public symbolNameList: string[] = []; // 符号名称映射表
    public actionSingleLine: cc.Action = null; // 单行奖励动画动作
    public increaseMoneyMultiplierBeforePlaySpecialWin: number = 1; // 特殊奖励前的金币倍增系数

    // ====== 单例方法 ======
    public static Instance(): SubGameStateManager_HoundOfHades {
        if (!SubGameStateManager_HoundOfHades._Instance) {
            SubGameStateManager_HoundOfHades._Instance = new SubGameStateManager_HoundOfHades();
        }
        return SubGameStateManager_HoundOfHades._Instance;
    }

    /**
     * 设置游戏管理器并初始化符号名称映射
     * @param manager 游戏管理器实例
     */
    setManager(manager: any): void {
        this.game_manager = manager;
        
        // 初始化符号名称映射
        this.symbolNameList[9] = "NINES";
        this.symbolNameList[10] = "TENS";
        this.symbolNameList[11] = "JACKS";
        this.symbolNameList[12] = "QUEENS";
        this.symbolNameList[13] = "KINGS";
        this.symbolNameList[14] = "ACES";
        this.symbolNameList[21] = "KEY";
        this.symbolNameList[22] = "GRAIL";
        this.symbolNameList[23] = "WEAPON";
        this.symbolNameList[24] = "HELM";
        this.symbolNameList[31] = "HADES";
    }

    /**
     * 获取基础游戏状态（完整的基础游戏流程）
     * @returns 顺序状态对象
     */
    getBaseGameState(): SequencialState {
        const self = this;
        const baseGameState = new SequencialState();
        let index = 0;

        // 基础游戏前置准备状态
        const prepareState = new SequencialState();
        prepareState.insert(index++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        prepareState.insert(index++, this.getStopSingleLineActionState());
        prepareState.insert(index++, this.getStopAllSymbolAniState());
        prepareState.insert(index++, this.getIdleHoundState());
        prepareState.insert(index++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
        prepareState.insert(index++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(0));
        prepareState.insert(index++, SlotManager.Instance.getReelSpinStartState());
        baseGameState.insert(0, prepareState);

        // 基础游戏核心流程状态
        const coreGameState = new SequencialState();
        coreGameState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                coreGameState.insert(index++, self.getLockNRollIntroState());
                coreGameState.insert(index++, SlotManager.Instance.reelMachine.getNormalSpinReelStateRenewal(SlotGameResultManager.Instance.getLastHistoryWindows()));
                coreGameState.insert(index++, self.getScrollDownBeforeWinResultState());
                coreGameState.insert(index++, self.getUpdateHoundsState());
                
                // 奖励结算子状态
                const winResultSubState = new SequencialState();
                winResultSubState.insert(0, self.getWinResultStateOnAllLines());
                winResultSubState.insert(1, self.getSingleLineEffectForAllLinesState());
                coreGameState.insert(index, winResultSubState);
                
                coreGameState.insert(index, self.getSetBottomInfoIncreaseWinMoneyState());
                coreGameState.insert(index++, self.getWinMoneyState());
                coreGameState.insert(index++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
                coreGameState.insert(index++, self.getScrollDownBeforeLockNRollState());
                coreGameState.insert(index++, self.getTriggerHoundsState());
                coreGameState.insert(index++, self.getLockNRollStartState());
            }
        });
        baseGameState.insert(1, coreGameState);

        return baseGameState;
    }

    /**
     * 获取LockNRoll游戏状态（完整的LockNRoll模式流程）
     * @returns 顺序状态对象
     */
    getLockandRollGameState(): SequencialState {
        const self = this;
        const lockNRollState = new SequencialState();
        let index = 0;

        // LockNRoll前置准备状态
        const prepareState = new SequencialState();
        prepareState.insert(index++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        prepareState.insert(index++, this.getDecreaseTotalCount());
        prepareState.insert(index++, this.getInitLockNRollDelayState());
        
        // 设置"GOOD LUCK"提示文本
        const goodLuckText = LangLocaleManager.getInstance().getLocalizedText("GOOD LUCK");
        prepareState.insert(index++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.CustomData, goodLuckText.text));
        
        // 获取LockNRoll滚轮并开始旋转
        const lockNRollReels = this.game_manager.reelMachine.getComponent(ReelMachine_HoundOfHades).lockNRollReels;
        prepareState.insert(index++, this.game_manager.getReelSpinStartState(lockNRollReels));
        lockNRollState.insert(0, prepareState);

        // LockNRoll核心流程状态
        const coreLockNRollState = new SequencialState();
        coreLockNRollState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                coreLockNRollState.insert(index++, SlotManager.Instance.reelMachine.getComponent(ReelMachine_HoundOfHades).getLockAndRollReelState());
                coreLockNRollState.insert(index++, self.getBlueState());
                coreLockNRollState.insert(index++, self.getRedState());
                coreLockNRollState.insert(index++, self.getGreenState());
                coreLockNRollState.insert(index++, self.getTotalWinState());
                coreLockNRollState.insert(index++, self.getRefreshAutoSpinState());
                coreLockNRollState.insert(index++, self.getCaculateSpinState());
                coreLockNRollState.insert(index++, self.getUpdateTotalCount());
                coreLockNRollState.insert(index++, self.getCheckLockNRollEndState());
                coreLockNRollState.insert(index++, self.getLockNRollDelayState());
                coreLockNRollState.insert(index++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
            }
        });
        lockNRollState.insert(1, coreLockNRollState);

        return lockNRollState;
    }

    /**
     * LockNRoll入场前的屏幕向下滚动状态
     * @returns 状态对象
     */
    getScrollDownBeforeLockNRollIntroState(): State {
        const scrollState = new State();
        scrollState.addOnStartCallback(() => {
            // 相机位置需要调整时执行滚动
            if (CameraControl.Instance.eStateOfCameraPosition === 1 || !CameraControl.Instance.isOriginalPos()) {
                const scrollAction = cc.sequence(
                    cc.callFunc(() => {
                        SlotManager.Instance.setMouseDragEventFlag(false);
                        CameraControl.Instance.scrollDownScreen(0.8);
                    }),
                    cc.delayTime(0.8),
                    cc.callFunc(() => {
                        scrollState.setDone();
                    })
                );
                SlotManager.Instance.node.runAction(scrollAction);
            } else {
                scrollState.setDone();
            }
        });
        return scrollState;
    }

    /**
     * 猎犬闲置状态（播放闲置动画）
     * @returns 状态对象
     */
    getIdleHoundState(): State {
        const idleState = new State();
        idleState.addOnStartCallback(() => {
            this.game_manager.game_components.houndsComponent.getComponent(HoundsComponent_HoundOfHades).idleHounds();
            idleState.setDone();
        });
        return idleState;
    }

    /**
     * LockNRoll前的屏幕向下滚动状态
     * @returns 状态对象
     */
    getScrollDownBeforeLockNRollState(): State {
        const scrollState = new State();
        scrollState.addOnStartCallback(() => {
            const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
            
            // 下一个子游戏是基础模式，或相机位置无需调整时直接完成
            if (nextSubGameKey === "base" || (CameraControl.Instance.eStateOfCameraPosition !== 1 && CameraControl.Instance.isOriginalPos())) {
                scrollState.setDone();
            } else {
                const scrollAction = cc.sequence(
                    cc.callFunc(() => {
                        SlotManager.Instance.setMouseDragEventFlag(false);
                        CameraControl.Instance.scrollDownScreen(0.8);
                    }),
                    cc.delayTime(0.8),
                    cc.callFunc(() => {
                        scrollState.setDone();
                    })
                );
                SlotManager.Instance.node.runAction(scrollAction);
            }
        });
        return scrollState;
    }

    /**
     * 所有线路的奖励结果状态（绘制奖励区域、播放符号动画）
     * @returns 状态对象
     */
    getWinResultStateOnAllLines(): State {
        const self = this;
        const winResultState = new State();
        
        winResultState.addOnStartCallback(() => {
            const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            
            // 无奖励结果时直接完成
            if (!payOutResults || payOutResults.length <= 0) {
                winResultState.setDone();
                return;
            }

            // 收集奖励单元格坐标
            const drawWinningRect = cc.callFunc(() => {
                const winningCells: cc.Vec2[] = [];
                
                for (let a = 0; a < payOutResults.length; ++a) {
                    const result = payOutResults[a];
                    
                    // 有winningCell时直接收集
                    if (result.payLine === -1 || (result.winningCell && result.winningCell.length > 0)) {
                        for (let r = 0; r < result.winningCell.length; ++r) {
                            const col = result.winningCell[r][1];
                            const row = result.winningCell[r][0];
                            winningCells.push(new cc.Vec2(col, row));
                        }
                    } 
                    // 从payLine解析奖励单元格
                    else {
                        const payLine = result.payLine;
                        let hasValidCell = false;
                        
                        for (let r = 0; r < 5; ++r) {
                            const row = Math.floor(payLine / (10000 / Math.pow(10, r))) % 10;
                            if (row !== 0) {
                                hasValidCell = true;
                                // 检查是否已存在该单元格
                                let isDuplicate = false;
                                for (let c = 0; c < winningCells.length; ++c) {
                                    if (winningCells[c].x === r && winningCells[c].y === row - 1) {
                                        isDuplicate = true;
                                        break;
                                    }
                                }
                                if (!isDuplicate) {
                                    winningCells.push(new cc.Vec2(r, row - 1));
                                }
                            }
                        }
                    }
                }

                // 绘制奖励区域
                const symbolWidth = SlotManager.Instance.paylineRenderer.m_symbolWidth;
                const symbolHeight = SlotManager.Instance.paylineRenderer.m_symbolHeight;
                const lineWidth = SlotManager.Instance.paylineRenderer.m_lineWidth;
                SlotManager.Instance.paylineRenderer.drawWinningRect(winningCells, symbolWidth, symbolHeight, null, lineWidth);
            });

            // 状态完成回调
            const doneCallback = cc.callFunc(() => {
                winResultState.setDone();
            });

            // 符号特效延迟
            const effectDelay = cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect);

            // 执行奖励绘制和符号特效
            if (drawWinningRect) {
                SlotManager.Instance.node.runAction(cc.sequence(
                    drawWinningRect,
                    cc.callFunc(() => {
                        self.showTotalSymbolEffectOnAllLines();
                    }),
                    effectDelay,
                    doneCallback
                ));
            } else {
                SlotManager.Instance.node.runAction(doneCallback);
            }
        });

        winResultState.addOnEndCallback(() => {
            State.prototype.onEnd();
        });

        return winResultState;
    }

    /**
     * 显示所有线路的符号奖励特效
     */
    showTotalSymbolEffectOnAllLines(): void {
        const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const processedCells: Cell[] = [];

        // 无奖励结果时直接返回
        if (!payOutResults || payOutResults.length <= 0) return;

        // 停止所有符号动画
        SymbolAnimationController.Instance.stopAllAnimationSymbol();

        // 检查单元格是否已处理
        const isCellProcessed = (cell: Cell): boolean => {
            for (let o = 0; o < processedCells.length; ++o) {
                if (cell.col === processedCells[o].col && cell.row === processedCells[o].row) {
                    return true;
                }
            }
            return false;
        };

        // 收集所有奖励单元格
        for (let a = 0; a < payOutResults.length; ++a) {
            const result = payOutResults[a];
            const payLine = result.payLine;

            // 从winningCell收集
            if (result.winningCell && result.winningCell.length > 0) {
                for (let s = 0; s < result.winningCell.length; ++s) {
                    const col = result.winningCell[s][1];
                    const row = result.winningCell[s][0];
                    const cell = new Cell(col, row);
                    if (!isCellProcessed(cell)) {
                        processedCells.push(cell);
                    }
                }
            } 
            // 从payLine解析
            else {
                for (let s = 0; s < 5; ++s) {
                    const row = Math.floor(payLine / (10000 / Math.pow(10, s))) % 10;
                    if (row !== 0) {
                        const cell = new Cell(s, row - 1);
                        if (!isCellProcessed(cell)) {
                            processedCells.push(cell);
                        }
                    }
                }
            }
        }

        // 播放符号动画并隐藏原符号
        for (let a = 0; a < processedCells.length; ++a) {
            const cell = processedCells[a];
            const symbol = lastHistoryWindows.GetWindow(cell.col).getSymbol(cell.row);
            
            SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbol, null, null, true);
            SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel).hideSymbolInRow(cell.row);
        }

        // 播放胜利音效
        SlotSoundController.Instance().playWinSound(SlotGameResultManager.Instance.getTotalWinSymbolList());
    }

    /**
     * 所有线路的单行奖励特效状态（循环播放单行奖励动画）
     * @returns 状态对象
     */
    getSingleLineEffectForAllLinesState(): State {
        const self = this;
        const singleLineState = new State();
        
        singleLineState.addOnStartCallback(() => {
            const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            const processedCells: Cell[] = [];
            const symbolList: number[] = [];

            // 非普通胜利或无奖励结果时直接完成
            if (SlotGameResultManager.Instance.getWinType() !==SlotGameResultManager.WINSTATE_NORMAL || !payOutResults || payOutResults.length === 0) {
                singleLineState.setDone();
                return;
            }

            // 自动旋转/免费旋转或有51号符号奖励时直接完成
            if (SlotReelSpinStateManager.Instance.getAutospinMode() || 
                SlotReelSpinStateManager.Instance.getFreespinMode() || 
                SlotGameResultManager.Instance.getWinningCoinBySymbolId(51) > 0) {
                singleLineState.setDone();
                return;
            }

            // 收集唯一符号列表
            let lineCount = 0;
            for (let c = 0; c < payOutResults.length; ++c) {
                lineCount++;
                for (let u = 0; u < payOutResults[c].payOut.symbols.length; ++u) {
                    const symbol = payOutResults[c].payOut.symbols[u];
                    if (symbolList.indexOf(symbol) === -1) {
                        symbolList.push(symbol);
                    }
                }
            }

            // 单行奖励动画回调
            let symbolIndex = 0;
            const singleLineCallback = cc.callFunc(() => {
                const currentSymbol = symbolList[symbolIndex];
                const winningCells: cc.Vec2[] = [];
                let totalWinningCoin = 0;
                let lineCountForSymbol = 0;
                let maxCol = 0;

                // 停止所有符号动画
                SymbolAnimationController.Instance.stopAllAnimationSymbol();
                processedCells.length = 0;

                // 检查单元格是否已处理
                const isCellProcessed = (cell: Cell): boolean => {
                    for (let n = 0; n < processedCells.length; ++n) {
                        if (cell.col === processedCells[n].col && cell.row === processedCells[n].row) {
                            return true;
                        }
                    }
                    return false;
                };

                // 收集当前符号的奖励单元格
                for (let S = 0; S < payOutResults.length; ++S) {
                    const result = payOutResults[S];
                    const payLine = result.payLine;

                    // 当前符号在奖励列表中
                    if (result.payOut.symbols.indexOf(currentSymbol) !== -1) {
                        totalWinningCoin += result.winningCoin;
                        lineCountForSymbol++;
                        maxCol = 0;

                        // 从winningCell收集
                        if (result.winningCell && result.winningCell.length > 0) {
                            for (let v = 0; v < result.winningCell.length; ++v) {
                                const col = result.winningCell[v][1];
                                const row = result.winningCell[v][0];
                                const cell = new Cell(col, row);
                                processedCells.push(cell);
                                winningCells.push(new cc.Vec2(col, row));
                                if (col + 1 > maxCol) maxCol = col + 1;
                            }
                        } 
                        // 从payLine解析
                        else {
                            for (let v = 0; v < 5; ++v) {
                                const row = Math.floor(payLine / (10000 / Math.pow(10, v))) % 10;
                                if (row !== 0) {
                                    const cell = new Cell(v, row - 1);
                                    if (!isCellProcessed(cell)) {
                                        processedCells.push(cell);
                                        winningCells.push(new cc.Vec2(v, row - 1));
                                    }
                                    if (v + 1 > maxCol) maxCol = v + 1;
                                }
                            }
                        }
                    }
                }

                // 绘制奖励区域
                if (SlotManager.Instance.paylineRenderer) {
                    SlotManager.Instance.paylineRenderer.clearAll();
                    const symbolWidth = SlotManager.Instance.paylineRenderer.m_symbolWidth;
                    const symbolHeight = SlotManager.Instance.paylineRenderer.m_symbolHeight;
                    const lineWidth = SlotManager.Instance.paylineRenderer.m_lineWidth;
                    SlotManager.Instance.paylineRenderer.drawWinningRect(winningCells, symbolWidth, symbolHeight, null, lineWidth);
                }

                // 播放符号动画
                for (let S = 0; S < processedCells.length; ++S) {
                    const cell = processedCells[S];
                    const symbol = lastHistoryWindows.GetWindow(cell.col).getSymbol(cell.row);
                    
                    SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbol);
                    SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel).hideSymbolInRow(cell.row);
                }

                // 多行奖励时更新奖励文本
                if (lineCount > 1) {
                    const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
                    const payText = LangLocaleManager.getInstance().getLocalizedText("PAYS ${0}");
                    const formattedText = TSUtility.strFormat(payText.text, CurrencyFormatHelper.formatNumber(totalWinningCoin));
                    SlotManager.Instance.bottomUIText.setWinMoney(totalWin, formattedText);
                }

                // 显示单行奖励信息
                this.showSinglePaylineInfoForAllLines(
                    this.getSymbolName(currentSymbol), 
                    maxCol, 
                    lineCountForSymbol, 
                    totalWinningCoin
                );

                // 更新符号索引
                symbolIndex = (symbolIndex === symbolList.length - 1) ? 0 : symbolIndex + 1;
            });

            // 停止之前的单行动画
            self.stopSingleLineAction();
            
            // 创建循环动画
            self.actionSingleLine = cc.repeatForever(cc.sequence(
                singleLineCallback,
                cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect)
            ));
            
            // 执行动画
            SlotManager.Instance.node.runAction(self.actionSingleLine);
            singleLineState.setDone();
        });

        return singleLineState;
    }

    /**
     * 奖励金币结算状态（播放金币增长动画、应用奖励）
     * @returns 状态对象
     */
    getWinMoneyState(): State {
        const self = this;
        const winMoneyState = new State();
        
        winMoneyState.addOnStartCallback(() => {
            const totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();

            // 奖励结算完成回调
            const completeCallback = () => {
                self.playIncrementEndCoinSound();
                SlotManager.Instance.bottomUIText.showWinEffect(false);
                SlotManager.Instance.setMouseDragEventFlag(true);
                SlotManager.Instance.applyGameResultMoney(totalWinMoney);
                
                // 基础模式直接完成，LockNRoll模式延迟0.5秒
                if (SlotGameResultManager.Instance.getNextSubGameKey() === "base") {
                    winMoneyState.setDone();
                } else {
                    self.game_manager.scheduleOnce(() => {
                        winMoneyState.setDone();
                    }, 0.5);
                }
            };

            // 不显示奖励特效时直接结算
            if (this.isShowWinMoneyEffect() === 0) {
                completeCallback();
                return;
            }

            const winType = SlotGameResultManager.Instance.getWinType();
            SlotManager.Instance.bottomUIText.showWinEffect(true);

            // 无奖励时直接结算
            if (totalWinMoney <= 0) {
                completeCallback();
                return;
            }

            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
            const effectDuration = totalWinMoney > 3 * totalBet 
                ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2
                : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

            // 非普通胜利（特殊奖励）
            if (winType !== SlotGameResultManager.WINSTATE_NORMAL) {
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                const increaseDuration = SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;
                const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;

                // 金币增长前置动画
                const preIncreaseAction = cc.callFunc(() => {
                    SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(
                        0, 
                        0 + totalBet * self.increaseMoneyMultiplierBeforePlaySpecialWin, 
                        null, 
                        false, 
                        increaseDuration
                    );
                    SlotManager.Instance.setMouseDragEventFlag(false);
                });

                // 大额奖励特效
                const bigWinAction = cc.callFunc(() => {
                    const effectTime = bigWinEffect.playWinEffect(
                        SlotGameResultManager.Instance.getTotalWinMoney(), 
                        totalBet, 
                        completeCallback, 
                        () => {
                            SlotManager.Instance.bottomUIText.stopChangeWinMoney(totalWinMoney);
                            self.playIncrementEndCoinSound();
                        }
                    );

                    SlotManager.Instance.bottomUIText.playChangeWinMoney(
                        0 + totalBet * self.increaseMoneyMultiplierBeforePlaySpecialWin,
                        totalWinMoney,
                        () => { self.playIncrementEndCoinSound(); },
                        false,
                        effectTime
                    );
                });

                // 执行特殊奖励动画序列
                SlotManager.Instance.node.runAction(cc.sequence(
                    preIncreaseAction,
                    cc.delayTime(increaseDuration),
                    bigWinAction
                ));
            } 
            // 普通胜利
            else {
                SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                SlotManager.Instance.bottomUIText.playChangeWinMoney(
                    0, 
                    totalWinMoney, 
                    completeCallback, 
                    true, 
                    effectDuration
                );
                SlotManager.Instance.userInfoInterface.setBiggestWinCoin(totalWinMoney);
            }
        });

        winMoneyState.addOnEndCallback(() => {
            self.playIncrementEndCoinSound();
        });

        return winMoneyState;
    }

    /**
     * LockNRoll入场状态（无限旋转、弹窗、屏幕滚动）
     * @param reels 目标滚轮数组（可选）
     * @returns 顺序状态对象
     */
    getLockNRollIntroState(reels?: any[]): SequencialState {
        const lockNRollIntroState = new SequencialState();
        this.game_manager.setNextEffect();

        // 下一个特效开启时执行完整入场流程
        if (this.game_manager.getNextEffect() === 1) {
            this.game_manager.setKeyboardEventFlag(false);
            SlotManager.Instance._bottomUI.setButtonActiveState(null);
            SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE);

            // 禁用鼠标拖拽
            const disableDragState = new State();
            disableDragState.addOnStartCallback(() => {
                SlotManager.Instance.setMouseDragEventFlag(false);
                disableDragState.setDone();
            });

            // 无限旋转状态
            const infiniteSpinState = SlotManager.Instance.reelMachine.getComponent(ReelMachine_HoundOfHades)
                .getIntroInfiniteSpinUsingNextSubGameKeyState(reels);

            // LockNRoll入场弹窗状态
            const popupState = this.getLockNRollIntroPopupState();

            // 组装入场状态
            lockNRollIntroState.insert(0, disableDragState);
            lockNRollIntroState.insert(0, infiniteSpinState);
            lockNRollIntroState.insert(0, popupState);

            // 弹窗结束时停止无限旋转
            popupState.addOnEndCallback(() => {
                infiniteSpinState.setDoneAllSubStates();
            });
        } 
        // 无特效时直接完成
        else {
            this.game_manager.setKeyboardEventFlag(true);
            lockNRollIntroState.setDone();
        }

        return lockNRollIntroState;
    }

    /**
     * LockNRoll入场弹窗状态
     * @returns 顺序状态对象
     */
    getLockNRollIntroPopupState(): SequencialState {
        const self = this;
        const popupState = new SequencialState();
        let index = 0;

        // 屏幕滚动状态
        popupState.insert(index, this.getScrollDownBeforeLockNRollIntroState());

        // 弹窗显示状态
        const showPopupState = new State();
        showPopupState.addOnStartCallback(() => {
            self.game_manager.scheduleOnce(() => {
                self.game_manager.game_components.lockNRollIntroPopup.showPopup(() => {
                    showPopupState.setDone();
                });
            }, 1);
        });
        popupState.insert(index++, showPopupState);

        return popupState;
    }

    /**
     * 更新猎犬状态
     * @returns 状态对象
     */
    getUpdateHoundsState(): State {
        const self = this;
        const updateHoundState = new State();
        
        updateHoundState.addOnStartCallback(() => {
            self.game_manager.game_components._houndsComponent.updateHound(() => {
                updateHoundState.setDone();
            });
        });

        return updateHoundState;
    }

    /**
     * 触发猎犬特效（LockNRoll模式激活）
     * @returns 状态对象
     */
    getTriggerHoundsState(): State {
        const self = this;
        const triggerHoundState = new State();
        
        triggerHoundState.addOnStartCallback(() => {
            const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
            
            // 非基础模式时触发猎犬特效
            if (nextSubGameKey !== "base") {
                // 清理奖励绘制和符号动画
                SlotManager.Instance.paylineRenderer.clearAll();
                SymbolAnimationController.Instance.stopAllAnimationSymbol();
                self.stopSingleLineAction();
                
                // 重置UI状态
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                
                // 设置提示文本
                const activateText = LangLocaleManager.getInstance().getLocalizedText("HADES’ GATE RESPINS ACTIVATED");
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, activateText.text);
                
                // 触发猎犬特效
                self.game_manager.game_components._houndsComponent.triggerHounds();
                
                // 延迟3秒完成
                SlotManager.Instance.scheduleOnce(() => {
                    triggerHoundState.setDone();
                }, 3);
            } 
            // 基础模式直接完成
            else {
                triggerHoundState.setDone();
            }
        });

        return triggerHoundState;
    }

    /**
     * LockNRoll模式启动状态（弹窗、滚轮切换、请求奖励、初始化UI）
     * @returns 顺序状态对象
     */
    getLockNRollStartState(): SequencialState {
        const self = this;
        const lockNRollStartState = new SequencialState();
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();

        // 非基础模式时执行LockNRoll启动流程
        if (nextSubGameKey !== "base") {
            // 禁用投注按钮状态
            const disableBetBtnState = new State();
            disableBetBtnState.addOnStartCallback(() => {
                SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(false);
                SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(false);
                self.game_manager.game_components.lockComponent.clearFilledSymbols();
                disableBetBtnState.setDone();
            });

            // 显示启动弹窗状态
            const showPopupState = new State();
            showPopupState.addOnStartCallback(() => {
                self.game_manager.game_components.lockNRollStartPopup.showPopup(() => {
                    // 猎犬归位
                    self.game_manager.game_components._houndsComponent.returnHounds();
                    // 重置LockNRoll滚轮
                    self.game_manager.reInvalidateLockNRollReels();
                    // 切换到LockNRoll滚轮显示
                    self.game_manager.reelMachine.getComponent(ReelMachine_HoundOfHades).showLockAndRollReels();
                    // 设置首次奖励窗口
                    self.game_manager.game_components.lockComponent.setFirstBonusWindow();
                    // 播放主背景音乐
                    self.game_manager.playMainBgm();
                    // 启用键盘事件
                    self.game_manager.setKeyboardEventFlag(true);
                    
                    showPopupState.setDone();
                });
            });

            // 请求奖励游戏状态
            const requestBonusState = new State();
            requestBonusState.addOnStartCallback(() => {
                self.game_manager.sendBonusGameRequestHoundOfHades(() => {
                    requestBonusState.setDone();
                });
            });

            // 设置首次窗口状态
            const setFirstWindowState = new State();
            setFirstWindowState.addOnStartCallback(() => {
                self.game_manager.game_components.lockComponent.setFirstWindow(() => {
                    setFirstWindowState.setDone();
                });
            });

            // 显示剩余次数UI状态
            const showRemainCountState = new State();
            showRemainCountState.addOnStartCallback(() => {
                self.game_manager.game_components.remainCount.openUI();
                self.game_manager.scheduleOnce(() => {
                    showRemainCountState.setDone();
                }, 1);
            });

            // 组装LockNRoll启动状态
            lockNRollStartState.insert(0, this.getStopSingleLineActionState());
            lockNRollStartState.insert(0, this.getStopAllSymbolAniState());
            lockNRollStartState.insert(1, disableBetBtnState);
            lockNRollStartState.insert(1, this.getRefreshAutoSpinState());
            lockNRollStartState.insert(2, showPopupState);
            lockNRollStartState.insert(3, requestBonusState);
            lockNRollStartState.insert(4, setFirstWindowState);
            lockNRollStartState.insert(5, this.getBlueState());
            lockNRollStartState.insert(6, this.getRedState());
            lockNRollStartState.insert(7, this.getGreenState());
            lockNRollStartState.insert(8, showRemainCountState);
        } 
        // 基础模式直接完成
        else {
            lockNRollStartState.setDone();
        }

        return lockNRollStartState;
    }

    /**
     * 减少剩余旋转次数
     * @returns 状态对象
     */
    getDecreaseTotalCount(): State {
        const self = this;
        const decreaseCountState = new State();
        
        decreaseCountState.addOnStartCallback(() => {
            self.game_manager.game_components.remainCount.decreseCount();
            decreaseCountState.setDone();
        });

        return decreaseCountState;
    }

    /**
     * 更新剩余旋转次数UI
     * @returns 状态对象
     */
    getUpdateTotalCount(): State {
        const self = this;
        const updateCountState = new State();
        
        updateCountState.addOnStartCallback(() => {
            // 非基础模式时更新次数
            if (SlotGameResultManager.Instance.getNextSubGameKey() !== "base") {
                self.game_manager.game_components.remainCount.updateCount(() => {
                    updateCountState.setDone();
                });
            } 
            // 基础模式直接完成
            else {
                updateCountState.setDone();
            }
        });

        return updateCountState;
    }

    /**
     * 检查蓝色符号奖励
     * @returns 状态对象
     */
    getBlueState(): State {
        const self = this;
        const blueState = new State();
        
        blueState.addOnStartCallback(() => {
            self.game_manager.game_components.lockComponent.checkBlue(() => {
                blueState.setDone();
            });
        });

        return blueState;
    }

    /**
     * 检查红色符号奖励
     * @returns 状态对象
     */
    getRedState(): State {
        const self = this;
        const redState = new State();
        
        redState.addOnStartCallback(() => {
            self.game_manager.game_components.lockComponent.checkRed(() => {
                redState.setDone();
            });
        });

        return redState;
    }

    /**
     * 检查绿色符号奖励
     * @returns 状态对象
     */
    getGreenState(): State {
        const self = this;
        const greenState = new State();
        
        greenState.addOnStartCallback(() => {
            self.game_manager.game_components.lockComponent.checkGreen(() => {
                greenState.setDone();
            });
        });

        return greenState;
    }

    /**
     * 总奖励结算状态（播放奖励特效）
     * @returns 状态对象
     */
    getTotalWinState(): State {
        const self = this;
        const totalWinState = new State();
        
        totalWinState.addOnStartCallback(() => {
            const totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();
            
            // 基础模式且有奖励时播放总奖励特效
            if (SlotGameResultManager.Instance.getNextSubGameKey() === "base" && totalWinMoney > 0) {
                self.game_manager.scheduleOnce(() => {
                    self.game_manager.game_components.remainCount.hideUI();
                    self.game_manager.game_components.lockComponent.totalWinFx(() => {
                        totalWinState.setDone();
                    });
                }, 0.5);
            } 
            // 无奖励或非基础模式直接完成
            else {
                totalWinState.setDone();
            }
        });

        return totalWinState;
    }

    /**
     * 计算旋转奖励
     * @returns 状态对象
     */
    getCaculateSpinState(): State {
        const self = this;
        const calculateSpinState = new State();
        
        calculateSpinState.addOnStartCallback(() => {
            const totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();
            
            // 基础模式且有奖励时计算奖励
            if (SlotGameResultManager.Instance.getNextSubGameKey() === "base" && totalWinMoney > 0) {
                self.game_manager.game_components.lockComponent.CalculateSpin(() => {
                    calculateSpinState.setDone();
                });
            } 
            // 无奖励或非基础模式直接完成
            else {
                calculateSpinState.setDone();
            }
        });

        return calculateSpinState;
    }

    /**
     * 检查LockNRoll模式是否结束（返回基础模式）
     * @returns 顺序状态对象
     */
    getCheckLockNRollEndState(): SequencialState {
        const self = this;
        const checkEndState = new SequencialState();
        
        checkEndState.addOnStartCallback(() => {
            // 切换回基础模式时执行结束流程
            if (SlotGameResultManager.Instance.getNextSubGameKey() === "base") {
                checkEndState.insert(0, self.getRefreshAutoSpinState());
                checkEndState.insert(1, self.getShowLockNRollResultState());
                checkEndState.insert(2, self.getShowBigWinEffectEndLockNRollState());
                checkEndState.insert(3, self.getChangeUIToBaseState());
            }
        });

        return checkEndState;
    }

    /**
     * 初始化LockNRoll延迟状态
     * @returns 状态对象
     */
    getInitLockNRollDelayState(): State {
        const self = this;
        const initDelayState = new State();
        
        initDelayState.addOnStartCallback(() => {
            self.game_manager.game_components.setLockNRollDelay(true);
            initDelayState.setDone();
        });

        return initDelayState;
    }

    /**
     * LockNRoll延迟状态（根据配置延迟完成）
     * @returns 状态对象
     */
    getLockNRollDelayState(): State {
        const self = this;
        const delayState = new State();
        
        delayState.addOnStartCallback(() => {
            // 需要延迟时等待0.5秒
            if (self.game_manager.game_components.lockNRollNextDelay()) {
                self.game_manager.scheduleOnce(() => {
                    delayState.setDone();
                }, 0.5);
            } 
            // 无需延迟直接完成
            else {
                delayState.setDone();
            }
        });

        return delayState;
    }

    /**
     * 显示LockNRoll结果弹窗
     * @returns 状态对象
     */
    getShowLockNRollResultState(): State {
        const self = this;
        const showResultState = new State();
        
        showResultState.addOnStartCallback(() => {
            const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const subGameState = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey);
            const totalWinningCoin = subGameState.totalWinningCoin;
            const betPerLines = subGameState.betPerLines;

            // 无奖励时直接完成
            if (totalWinningCoin <= 0) {
                showResultState.setDone();
            } 
            // 有奖励时显示结果弹窗
            else {
                self.game_manager.game_components.lockNRollResultPopup.open(totalWinningCoin, betPerLines, () => {
                    showResultState.setDone();
                });
            }
        });

        return showResultState;
    }

    /**
     * LockNRoll结束时的大额奖励特效
     * @returns 状态对象
     */
    getShowBigWinEffectEndLockNRollState(): State {
        const bigWinState = new State();
        
        bigWinState.addOnStartCallback(() => {
            const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const totalWinningCoin = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey).totalWinningCoin;
            const winType = SlotGameResultManager.Instance.getWinType(totalWinningCoin);

            // 非普通胜利时播放大额奖励特效
            if (winType !== SlotGameResultManager.WINSTATE_NORMAL) {
                const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                const totalBet = SlotGameRuleManager.Instance.getTotalBet();
                
                bigWinEffect._isPlayExplodeCoin = false;
                bigWinEffect.playWinEffectWithoutIncreaseMoney(totalWinningCoin, totalBet, () => {
                    bigWinState.setDone();
                });
            } 
            // 普通胜利直接完成
            else {
                bigWinState.setDone();
            }
        });

        return bigWinState;
    }

    /**
     * 切换UI回基础模式（滚轮切换、重置组件、初始化猎犬、更新符号）
     * @returns 状态对象
     */
    getChangeUIToBaseState(): State {
        const self = this;
        const changeToBaseState = new State();
        
        changeToBaseState.addOnStartCallback(() => {
            // 切换回基础滚轮显示
            self.game_manager.reelMachine.getComponent(ReelMachine_HoundOfHades).showBaseReels();
            
            // 清理Lock组件状态
            self.game_manager.game_components.lockComponent.clearFilledSymbols();
            
            // 初始化猎犬
            self.game_manager.game_components._houndsComponent.initHound();
            
            // 播放主背景音乐
            self.game_manager.playMainBgm();
            
            // 启用Jackpot UI
            self.game_manager.game_components.jackpotUI.setPlayingState(SDefine.SLOT_JACKPOT_KEY_MINI, true);
            self.game_manager.game_components.jackpotUI.setPlayingState(SDefine.SLOT_JACKPOT_KEY_MINOR, true);
            self.game_manager.game_components.jackpotUI.setPlayingState(SDefine.SLOT_JACKPOT_KEY_MAJOR, true);
            self.game_manager.game_components.jackpotUI.setPlayingState(SDefine.SLOT_JACKPOT_KEY_MEGA, true);
            
            // 启用鼠标拖拽
            SlotManager.Instance.setMouseDragEventFlag(true);

            // 更新基础模式符号
            const baseSubGameState = SlotGameResultManager.Instance.getSubGameState("base");
            for (let o = 0; o < 5; o++) {
                for (let a = 0; a < 3; a++) {
                    const symbol = baseSubGameState.lastWindows[o][a];
                    const reelComponent = self.game_manager.reelMachine.reels[o].getComponent(Reel);
                    
                    // 更新符号显示
                    reelComponent.changeSymbol(a, baseSubGameState.lastWindows[o][a], baseSubGameState.lastSymbolInfoWindow[o][a]);
                    
                    // 奖励符号（十位为1 或 91）播放特效
                    if (Math.floor(symbol / 6) === 10 || symbol === 91) {
                        const aniNode = SymbolAnimationController.Instance.playAnimationSymbol(o, a, symbol + 200);
                        reelComponent.hideSymbolInRow(a);
                        aniNode.getComponent(PrizeComponent_HoundOfHades).initPrize();
                    }
                }
            }

            changeToBaseState.setDone();
        });

        return changeToBaseState;
    }
}