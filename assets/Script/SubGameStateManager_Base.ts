// 导入项目业务模块（请根据实际项目路径调整）
import SlotManager from './manager/SlotManager';
import State from './Slot/State';
import v2_PayLineRenderer from './v2_PayLineRenderer';
import Reel from './Slot/Reel';
import SoundManager from './manager/SoundManager';
import Symbol from './Slot/Symbol';
import TSUtility from './global_utility/TSUtility';
import LangLocaleManager from './manager/LangLocaleManager';
import CurrencyFormatHelper from './global_utility/CurrencyFormatHelper';
import { BottomTextType } from './SubGame/BottomUIText';
import SlotGameRuleManager from './manager/SlotGameRuleManager';
import SlotGameResultManager, { Cell } from './manager/SlotGameResultManager';
import GameComponents_Base from './game/GameComponents_Base';
import SlotSoundController from './Slot/SlotSoundController';
import SlotReelSpinStateManager from './Slot/SlotReelSpinStateManager';
import SymbolAnimationController from './Slot/SymbolAnimationController';
import CameraControl from './Slot/CameraControl';

const { ccclass } = cc._decorator;

/**
 * 子游戏状态管理基类
 * 负责奖金展示、符号动画、支付线渲染、音效控制等核心逻辑
 */
@ccclass()
export default class SubGameStateManager_Base {
    // ===================== 成员变量 =====================
    /** 符号名称列表 */
    public symbolNameList: string[] = [];
    /** 单行支付线动画action */
    public actionSingleLine: cc.Action = null;
    /** 特殊奖金前的金币倍增系数 */
    public increaseMoneyMultiplierBeforePlaySpecialWin: number = 8;
    /** 子游戏流程映射 */
    public subGameProcs: { [key: string]: any } = {};

    // ===================== 子游戏流程管理 =====================
    /**
     * 获取指定子游戏流程
     * @param key 子游戏流程标识
     * @returns 子游戏流程实例
     */
    public getSubGameProc(key: string): any {
        return this.subGameProcs[key];
    }

    // ===================== 支付线信息展示 =====================
    /**
     * 显示单行支付线信息
     * @param lineNum 支付线编号（0为无）
     * @param winMoney 奖金金额
     */
    public showSinglePaylineInfoForLines(lineNum: number, winMoney: number,b:any): void {
        let text = '';
        if (lineNum === 0) {
            const langText = LangLocaleManager.getInstance().getLocalizedText("PAYS ${0}");
            text = TSUtility.strFormat(langText.text, CurrencyFormatHelper.formatNumber(winMoney));
        } else {
            const langText = LangLocaleManager.getInstance().getLocalizedText("LINE ${0} PAYS ${1}");
            text = TSUtility.strFormat(langText.text, lineNum.toString(), CurrencyFormatHelper.formatNumber(winMoney));
        }
        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, text);
    }

    /**
     * 显示所有支付线的单行信息
     * @param symbolName 符号名称
     * @param colCount 列数
     * @param lineCount 行数
     * @param totalWin 总奖金
     */
    public showSinglePaylineInfoForAllLines(symbolName: string, colCount: number, lineCount: number, totalWin: number): void {
        let text = '';
        const winLang = LangLocaleManager.getInstance().getLocalizedText("WIN").text;
        const ellipsisCount = SlotGameRuleManager.Instance.getCurrentBetEllipsisCount();
        
        let adjustedEllipsisCount = ellipsisCount;
        if (Math.pow(10, adjustedEllipsisCount) > totalWin) {
            adjustedEllipsisCount -= 3;
        }

        if (colCount === 0 || colCount === 1) {
            text = totalWin > 0 
                ? `${totalWin.toString()} ${symbolName} ${winLang} ${CurrencyFormatHelper.formatEllipsisNumberUsingDot(totalWin)}`
                : `${symbolName} ${winLang} ${CurrencyFormatHelper.formatEllipsisNumberUsingDot(totalWin)}`;
        } else {
            const singleWin = totalWin / lineCount;
            let singleEllipsisCount = adjustedEllipsisCount;
            if (Math.pow(10, singleEllipsisCount) > singleWin) {
                singleEllipsisCount -= 3;
            }
            text = `${totalWin.toString()} ${symbolName} ${winLang} ${CurrencyFormatHelper.formatEllipsisNumberUsingDot(singleWin)} x ${lineCount.toString()} = ${CurrencyFormatHelper.formatEllipsisNumberUsingDot(totalWin)}`;
        }
        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, text);
    }

    // ===================== 奖金状态管理 =====================
    /**
     * 获取更新旋转结果支付状态
     * @returns 状态实例
     */
    public getUpdateSpinResultPayState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            state.setDone();
        });
        return state;
    }

    /**
     * 获取奖金展示状态
     * @returns 状态实例
     */
    public getWinMoneyState(): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            const spinResult = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();

            const completeCallback = () => {
                SlotManager.Instance.bottomUIText.showWinEffect(false);
                SlotManager.Instance.setMouseDragEventFlag(true);
                SlotManager.Instance.applyGameResultMoney(totalWin);
                state.setDone();
            };

            if (self.isShowWinMoneyEffect()) {
                const winType = SlotGameResultManager.Instance.getWinType();
                SlotManager.Instance.bottomUIText.showWinEffect(true);

                if (totalWin <= 0) {
                    completeCallback();
                    return;
                }

                const totalWinMoney = 0 + totalWin;
                const totalBet = SlotGameRuleManager.Instance.getTotalBet();
                const effectTime = totalWin > 3 * totalBet 
                    ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2
                    : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

                if (winType !==SlotGameResultManager.WINSTATE_NORMAL) {
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    const bet = SlotGameRuleManager.Instance.getTotalBet();
                    const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                    const increaseTime = SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

                    const increaseAction = cc.callFunc(() => {
                        SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                        SlotManager.Instance.bottomUIText.playChangeWinMoney(
                            0, 
                            0 + bet * self.increaseMoneyMultiplierBeforePlaySpecialWin, 
                            null, 
                            false, 
                            increaseTime
                        );
                        SlotManager.Instance.setMouseDragEventFlag(false);
                    });

                    const winEffectAction = cc.callFunc(() => {
                        const effectDuration = bigWinEffect.playWinEffect(
                            totalWin, 
                            bet, 
                            completeCallback, 
                            () => {
                                SlotManager.Instance.bottomUIText.stopChangeWinMoney(totalWinMoney);
                                self.playIncrementEndCoinSound();
                            }
                        );
                        
                        SlotManager.Instance.bottomUIText.playChangeWinMoney(
                            0 + bet * self.increaseMoneyMultiplierBeforePlaySpecialWin,
                            totalWinMoney,
                            () => self.playIncrementEndCoinSound(),
                            false,
                            effectDuration
                        );
                    });

                    SlotManager.Instance.node.runAction(cc.sequence(increaseAction, cc.delayTime(increaseTime), winEffectAction));
                } else {
                    SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                    SlotManager.Instance.bottomUIText.setWinMoney(0);
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(
                        0, 
                        totalWinMoney, 
                        completeCallback, 
                        true, 
                        effectTime
                    );
                    SlotManager.Instance.setBiggestWinCoin(totalWin);
                }
            } else {
                completeCallback();
            }
        });

        state.addOnEndCallback(() => {
            self.playIncrementEndCoinSound();
        });

        return state;
    }

    /**
     * 获取带金额控制的奖金展示状态
     * @param startMoney 起始金额
     * @param targetMoney 目标金额
     * @returns 状态实例
     */
    public getWinMoneyStateWithControlMoney(startMoney: number, targetMoney: number): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            const winDiff = targetMoney - startMoney;
            const completeCallback = () => {
                SlotManager.Instance.bottomUIText.showWinEffect(false);
                SlotManager.Instance.setMouseDragEventFlag(true);
                SlotManager.Instance.applyGameResultMoney(winDiff);
                state.setDone();
            };

            if (winDiff <= 0) {
                completeCallback();
                return;
            }

            const winType = SlotGameResultManager.Instance.getWinType(targetMoney);
            SlotManager.Instance.bottomUIText.showWinEffect(true);
            
            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
            const effectTime = targetMoney > 3 * totalBet
                ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2
                : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

            if (winType !== SlotGameResultManager.WINSTATE_NORMAL) {
                SlotManager.Instance.bottomUIText.setWinMoney(startMoney);
                const bet = SlotGameRuleManager.Instance.getTotalBet();
                const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                const increaseTime = SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

                let tempTarget = startMoney + bet * self.increaseMoneyMultiplierBeforePlaySpecialWin;
                if (tempTarget >= targetMoney) {
                    tempTarget = startMoney + 0.3 * (targetMoney - startMoney);
                }

                const increaseAction = cc.callFunc(() => {
                    SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(
                        startMoney,
                        tempTarget,
                        null,
                        false,
                        increaseTime
                    );
                    SlotManager.Instance.setMouseDragEventFlag(false);
                });

                const winEffectAction = cc.callFunc(() => {
                    const effectDuration = bigWinEffect.playWinEffect(
                        targetMoney,
                        bet,
                        completeCallback,
                        () => {
                            SlotManager.Instance.bottomUIText.stopChangeWinMoney(targetMoney);
                            self.playIncrementEndCoinSound();
                        },
                        true,
                        tempTarget
                    );

                    SlotManager.Instance.bottomUIText.playChangeWinMoney(
                        tempTarget,
                        targetMoney,
                        () => self.playIncrementEndCoinSound(),
                        false,
                        effectDuration
                    );
                });

                SlotManager.Instance.node.runAction(cc.sequence(increaseAction, cc.delayTime(increaseTime), winEffectAction));
            } else {
                SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                SlotManager.Instance.bottomUIText.playChangeWinMoney(
                    startMoney,
                    targetMoney,
                    completeCallback,
                    true,
                    effectTime
                );
                SlotManager.Instance.setBiggestWinCoin(targetMoney);
            }
        });

        state.addOnEndCallback(() => {
            self.playIncrementEndCoinSound();
        });

        return state;
    }

    /**
     * 获取带金额控制且忽略大额奖金特效的奖金展示状态
     * @param startMoney 起始金额
     * @param targetMoney 目标金额
     * @param useComma 是否使用逗号格式化
     * @returns 状态实例
     */
    public getWinMoneyStateWithControlMoneyIgnoreBigWinEffect(startMoney: number, targetMoney: number, useComma: boolean = true): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            const winDiff = targetMoney - startMoney;
            const completeCallback = () => {
                SlotManager.Instance.bottomUIText.showWinEffect(false);
                SlotManager.Instance.setMouseDragEventFlag(true);
                SlotManager.Instance.applyGameResultMoney(winDiff);
                state.setDone();
            };

            if (winDiff <= 0) {
                completeCallback();
                return;
            }

            SlotManager.Instance.bottomUIText.showWinEffect(true);
            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
            const effectTime = winDiff > 3 * totalBet
                ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2
                : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

            SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
            SlotManager.Instance.bottomUIText.setWinMoney(0);
            SlotManager.Instance.bottomUIText.playChangeWinMoney(
                startMoney,
                targetMoney,
                completeCallback,
                useComma,
                effectTime
            );
            SlotManager.Instance.setBiggestWinCoin(winDiff);

            state.addOnEndCallback(() => {
                self.mustPlayIncrementEndCoinSound();
            });
        });

        return state;
    }

    // ===================== 音效控制 =====================
    /**
     * 播放金币增长结束音效
     */
    public playIncrementEndCoinSound(): void {
        SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");
        const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
        if (totalWin > 0 && SlotSoundController.Instance().getAudioClip("IncrementEndCoin") != null) {
            SlotSoundController.Instance().playAudio("IncrementEndCoin", "FX");
        }
    }

    /**
     * 强制播放金币增长结束音效
     */
    public mustPlayIncrementEndCoinSound(): void {
        SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");
        if (SlotSoundController.Instance().getAudioClip("IncrementEndCoin") != null) {
            SlotSoundController.Instance().playAudio("IncrementEndCoin", "FX");
        }
    }

    /**
     * 获取连锁奖金展示状态
     * @returns 状态实例
     */
    public getWinMoneyCascadeState(): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            const spinResult = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();

            const completeCallback = () => {
                SlotManager.Instance.bottomUIText.showWinEffect(false);
                SlotManager.Instance.setMouseDragEventFlag(true);
                SlotManager.Instance.applyGameResultMoney(totalWin);
                state.setDone();
            };

            if (self.isShowWinMoneyEffect()) {
                const winType = SlotGameResultManager.Instance.getWinType();
                SlotManager.Instance.bottomUIText.showWinEffect(true);

                if (totalWin <= 0) {
                    completeCallback();
                    return;
                }

                const totalWinMoney = 0 + totalWin;
                if (winType !==SlotGameResultManager.WINSTATE_NORMAL) {
                    const totalBet = SlotGameRuleManager.Instance.getTotalBet();
                    const bigWinEffect = SlotManager.Instance.getComponent(GameComponents_Base).effectBigWinNew;
                    
                    bigWinEffect.playWinEffectWithoutIncreaseMoney(
                        totalWin,
                        totalBet,
                        completeCallback,
                        () => {
                            SlotManager.Instance.bottomUIText.stopChangeWinMoney(totalWinMoney);
                            self.playIncrementEndCoinSound();
                        }
                    );
                } else {
                    SlotManager.Instance.setBiggestWinCoin(totalWin);
                    completeCallback();
                }
            } else {
                completeCallback();
            }
        });

        state.addOnEndCallback(() => {
            self.playIncrementEndCoinSound();
        });

        return state;
    }

    // ===================== 支付线特效 =====================
    /**
     * 获取单行支付线特效状态
     * @returns 状态实例
     */
    public getSingleLineEffectOnPaylineState(): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            const cellList: Cell[] = [];
            let index = 0;

            // 非普通中奖/无奖金/自动旋转/免费旋转 直接结束
            if (SlotGameResultManager.Instance.getWinType() ===SlotGameResultManager.WINSTATE_NORMAL) {
                if (payOutResults == null || payOutResults.length === 0) {
                    state.setDone();
                    return;
                }
                if (SlotReelSpinStateManager.Instance.getAutospinMode() || 
                    SlotReelSpinStateManager.Instance.getFreespinMode() ||
                    SlotGameResultManager.Instance.getWinningCoinBySymbolId(51) > 0) {
                    state.setDone();
                    return;
                }
            }

            const lineCount = payOutResults.length;
            if (lineCount !== 0) {
                let isFirstPlaySound = false;

                const lineEffectAction = cc.callFunc(function(this: SubGameStateManager_Base) {
                    const payLine = payOutResults[index].payLine;
                    
                    // 绘制支付线
                    if (SlotManager.Instance.paylineRenderer != null) {
                        SlotManager.Instance.paylineRenderer.clearAll();
                        if (payLine !== -1) {
                            SlotManager.Instance.paylineRenderer.drawSingleLine(payLine, payOutResults[index].payOut.count);
                        }
                    }

                    // 播放音效
                    if (payOutResults.length > 1) {
                        SlotSoundController.Instance().playAudio("ShowPayline", "FX");
                    } else if (payOutResults.length === 1 && !isFirstPlaySound) {
                        SlotSoundController.Instance().playAudio("ShowPayline", "FX");
                        isFirstPlaySound = true;
                    }

                    // 停止所有符号动画
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    
                    // 收集中奖格子
                    cellList.length = 0;
                    for (let i = 0; i < payOutResults[index].winningCell.length; ++i) {
                        const cell = new Cell(
                            payOutResults[index].winningCell[i][1],
                            payOutResults[index].winningCell[i][0]
                        );
                        cellList.push(cell);
                    }

                    // 播放符号动画
                    for (let i = 0; i < cellList.length; ++i) {
                        const cell = cellList[i];
                        const symbol = lastHistoryWindows.GetWindow(cell.col).getSymbol(cell.row);
                        SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbol);
                        SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel).hideSymbolInRow(cell.row);
                    }

                    // 更新底部奖金信息
                    if (lineCount > 1) {
                        const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
                        const lineNum = payOutResults[index].payLine;
                        const winCoin = payOutResults[index].winningCoin;
                        const langText = LangLocaleManager.getInstance().getLocalizedText("LINE ${0} PAYS ${1}");
                        const text = TSUtility.strFormat(
                            langText.text, 
                            (lineNum + 1).toString(), 
                            CurrencyFormatHelper.formatNumber(winCoin)
                        );
                        SlotManager.Instance.bottomUIText.setWinMoney(totalWin, text);
                    }

                    // 显示支付线信息
                    this.showSinglePaylineInfoForLines(
                        payLine + 1, 
                        payOutResults[index].winningCoin,
                        payOutResults[index].payOut.symbols
                    );

                    // 切换到下一条线
                    index = (index + 1) % payOutResults.length;
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
                }.bind(self));

                // 停止原有动画
                self.stopSingleLineAction();
                
                // 循环播放单行特效
                self.actionSingleLine = cc.repeatForever(cc.sequence(
                    lineEffectAction,
                    cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect)
                ));
                
                SlotManager.Instance.node.runAction(self.actionSingleLine);
                state.setDone();
            } else {
                state.setDone();
            }
        });

        return state;
    }

    /**
     * 获取所有支付线的单行特效状态
     * @returns 状态实例
     */
    public getSingleLineEffectForAllLinesState(): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            const cellList: Cell[] = [];
            let symbolIndex = 0;
            const symbolList: number[] = [];

            // 非普通中奖/无奖金/自动旋转/免费旋转 直接结束
            if (SlotGameResultManager.Instance.getWinType() ===SlotGameResultManager.WINSTATE_NORMAL) {
                if (payOutResults == null || payOutResults.length === 0) {
                    state.setDone();
                    return;
                }
                if (SlotReelSpinStateManager.Instance.getAutospinMode() || 
                    SlotReelSpinStateManager.Instance.getFreespinMode() ||
                    SlotGameResultManager.Instance.getWinningCoinBySymbolId(51) > 0) {
                    state.setDone();
                    return;
                }
            }

            // 收集所有中奖符号
            const lineCount = payOutResults.length;
            for (let i = 0; i < lineCount; ++i) {
                for (let j = 0; j < payOutResults[i].payOut.symbols.length; ++j) {
                    if (symbolList.indexOf(payOutResults[i].payOut.symbols[j]) === -1) {
                        symbolList.push(payOutResults[i].payOut.symbols[j]);
                    }
                }
            }

            const symbolEffectAction = cc.callFunc(function(this: SubGameStateManager_Base) {
                const symbolId = symbolList[symbolIndex];
                const winPosList: cc.Vec2[] = [];
                
                // 停止所有符号动画
                SymbolAnimationController.Instance.stopAllAnimationSymbol();
                cellList.length = 0;

                // 检查单元格是否已存在
                const isCellExist = (cell: Cell): boolean => {
                    for (let i = 0; i < cellList.length; ++i) {
                        if (cell.col === cellList[i].col && cell.row === cellList[i].row) {
                            return true;
                        }
                    }
                    return false;
                };

                let totalWin = 0;
                let lineCount = 0;
                let maxCol = 0;

                // 收集所有中奖位置
                for (let i = 0; i < payOutResults.length; ++i) {
                    const payLine = payOutResults[i].payLine;
                    if (payOutResults[i].payOut.symbols.indexOf(symbolId) !== -1) {
                        totalWin += payOutResults[i].winningCoin;
                        lineCount++;
                        
                        if (payOutResults[i].winningCell != null && payOutResults[i].winningCell.length > 0) {
                            for (let j = 0; j < payOutResults[i].winningCell.length; ++j) {
                                const col = payOutResults[i].winningCell[j][1];
                                const row = payOutResults[i].winningCell[j][0];
                                const cell = new Cell(col, row);
                                cellList.push(cell);
                                winPosList.push(new cc.Vec2(col, row));
                                if (col + 1 > maxCol) maxCol = col + 1;
                            }
                        } else {
                            for (let j = 0; j < 5; ++j) {
                                const row = Math.floor(payLine / (10000 / Math.pow(10, j))) % 10;
                                if (row !== 0) {
                                    const cell = new Cell(j, row - 1);
                                    if (!isCellExist(cell)) {
                                        cellList.push(cell);
                                        winPosList.push(new cc.Vec2(j, row - 1));
                                    }
                                    if (j + 1 > maxCol) maxCol = j + 1;
                                }
                            }
                        }
                    }
                }

                // 绘制中奖矩形
                if (SlotManager.Instance.paylineRenderer != null) {
                    SlotManager.Instance.paylineRenderer.clearAll();
                    const symbolWidth = SlotManager.Instance.paylineRenderer.m_symbolWidth;
                    const symbolHeight = SlotManager.Instance.paylineRenderer.m_symbolHeight;
                    const lineWidth = SlotManager.Instance.paylineRenderer.m_lineWidth;
                    SlotManager.Instance.paylineRenderer.drawWinningRect(winPosList, symbolWidth, symbolHeight, null, lineWidth);
                }

                // 播放符号动画
                for (let i = 0; i < cellList.length; ++i) {
                    const cell = cellList[i];
                    const symbol = lastHistoryWindows.GetWindow(cell.col).getSymbol(cell.row);
                    SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbol);
                    SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel).hideSymbolInRow(cell.row);
                }

                // 更新底部奖金信息
                if (lineCount > 1) {
                    const totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();
                    const text = `PAYS ${CurrencyFormatHelper.formatNumber(totalWin)}`;
                    SlotManager.Instance.bottomUIText.setWinMoney(totalWinMoney, text);
                }

                // 显示支付线信息
                this.showSinglePaylineInfoForAllLines(
                    this.getSymbolName(symbolId),
                    maxCol,
                    lineCount,
                    totalWin
                );

                // 切换到下一个符号
                symbolIndex = symbolIndex === symbolList.length - 1 ? 0 : symbolIndex + 1;
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
            }.bind(self));

            // 停止原有动画
            self.stopSingleLineAction();
            
            // 循环播放符号特效
            self.actionSingleLine = cc.repeatForever(cc.sequence(
                symbolEffectAction,
                cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect)
            ));
            
            SlotManager.Instance.node.runAction(self.actionSingleLine);
            state.setDone();
        });

        return state;
    }

    /**
     * 获取停止单行特效的状态
     * @returns 状态实例
     */
    public getStopSingleLineActionState(): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            self.stopSingleLineAction();
            state.setDone();
        });

        return state;
    }

    /**
     * 停止单行特效动画
     */
    public stopSingleLineAction(): void {
        if (this.actionSingleLine != null) {
            SlotManager.Instance.node.stopAction(this.actionSingleLine);
            this.actionSingleLine = null;
        }
    }

    // ===================== 支付线渲染器 =====================
    /**
     * 检查并初始化支付线渲染器
     */
    public checkPaylineRenderer(): void {
        if (SlotManager.Instance.paylineRenderer == null) {
            const children = cc.director.getScene().children;
            for (let i = 0; i < children.length; ++i) {
                SlotManager.Instance.paylineRenderer = children[i].getComponentInChildren(v2_PayLineRenderer);
                if (SlotManager.Instance.paylineRenderer != null) {
                    break;
                }
            }
        }
    }

    /**
     * 获取符号名称
     * @param symbolId 符号ID
     * @returns 符号名称
     */
    public getSymbolName(symbolId: number): string {
        let name = '';
        if (this.symbolNameList[symbolId] != null) {
            name = this.symbolNameList[symbolId];
        }
        return name;
    }

    // ===================== 符号动画控制 =====================
    /**
     * 获取停止所有符号动画的状态
     * @returns 状态实例
     */
    public getStopAllSymbolAniState(): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            self.checkPaylineRenderer();
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            
            if (SlotManager.Instance.paylineRenderer != null) {
                SlotManager.Instance.paylineRenderer.clearAll();
            }
            
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            state.setDone();
        });

        return state;
    }

    /**
     * 获取显示总触发支付线的状态
     * @returns 状态实例
     */
    public getShowTotalTriggeredPaylineState(): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            
            if (payOutResults != null && payOutResults.length > 0) {
                // 统计有效支付线数量
                let lineCount = 0;
                for (let i = 0; i < payOutResults.length; ++i) {
                    if (payOutResults[i].payLine !== -1) {
                        lineCount++;
                    }
                }

                let currentLine = 0;
                const drawLineAction = cc.callFunc(function(this: SubGameStateManager_Base) {
                    if (currentLine >= payOutResults.length) return;
                    
                    // 找到有效支付线
                    let payLine = payOutResults[currentLine].payLine;
                    while (payLine === -1 && currentLine !== payOutResults.length - 1) {
                        payLine = payOutResults[++currentLine].payLine;
                    }
                    
                    if (SlotManager.Instance.paylineRenderer != null) {
                        SlotManager.Instance.paylineRenderer.drawLineNum(payLine);
                    }
                    currentLine++;
                }.bind(self));

                // 重复绘制所有支付线
                const repeatAction = cc.repeat(cc.sequence(drawLineAction, cc.delayTime(0.05)), lineCount);
                const completeAction = cc.callFunc(function(this: SubGameStateManager_Base) {
                    state.setDone();
                }.bind(self));

                if (repeatAction != null) {
                    SlotManager.Instance.node.runAction(cc.sequence(repeatAction, cc.delayTime(0.2), completeAction));
                } else {
                    state.setDone();
                }
            } else {
                state.setDone();
            }
        });

        return state;
    }

    /**
     * 获取显示支付线上所有符号特效的状态
     * @returns 状态实例
     */
    public getStateShowTotalSymbolEffectOnPayLines(): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
            const effectTime = totalWin > 3 * totalBet
                ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2
                : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

            if (self.showTotalSymbolEffectOnPaylines()) {
                SlotManager.Instance.scheduleOnce(() => {
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    state.setDone();
                }, effectTime);
            } else {
                state.setDone();
            }
        });

        return state;
    }

    /**
     * 获取显示按符号ID分组的支付线符号特效状态
     * @returns 状态实例
     */
    public getStateShowTotalSymbolEffectOnPayLinesBySymbolIdPayoutList(): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            const totalWin = SlotGameResultManager.Instance.getSpinResult().getSumOfWinningCoinPayoutResults();
            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
            const effectTime = totalWin > 3 * totalBet
                ? SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect * 2
                : SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect;

            if (self.showTotalSymbolEffectOnPaylinesBySymbolIdPayoutList()) {
                SlotManager.Instance.scheduleOnce(() => {
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    self.setDimmDeActiveTotalSymbolOnPaylines();
                    state.setDone();
                }, effectTime);
            } else {
                state.setDone();
            }
        });

        return state;
    }

    /**
     * 获取支付线上中奖结果展示状态
     * @returns 状态实例
     */
    public getWinResultStateOnPaylines(): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            
            if (payOutResults != null && payOutResults.length > 0) {
                // 统计有效支付线数量
                let lineCount = 0;
                for (let i = 0; i < payOutResults.length; ++i) {
                    if (payOutResults[i].payLine !== -1) {
                        lineCount++;
                    }
                }

                let currentLine = 0;
                const drawLineAction = cc.callFunc(function(this: SubGameStateManager_Base) {
                    if (currentLine >= payOutResults.length) return;
                    
                    // 找到有效支付线
                    let payLine = payOutResults[currentLine].payLine;
                    while (payLine === -1 && currentLine !== payOutResults.length - 1) {
                        payLine = payOutResults[++currentLine].payLine;
                    }
                    
                    if (SlotManager.Instance.paylineRenderer != null) {
                        SlotManager.Instance.paylineRenderer.drawLineNum(payLine);
                    }
                    currentLine++;
                }.bind(self));

                // 重复绘制所有支付线
                const repeatAction = cc.repeat(cc.sequence(drawLineAction, cc.delayTime(0.1)), lineCount);
                const delayAction = cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect);
                const completeAction = cc.callFunc(function(this: SubGameStateManager_Base) {
                    state.setDone();
                }.bind(self));

                if (repeatAction != null) {
                    SlotManager.Instance.node.runAction(cc.sequence(
                        repeatAction,
                        cc.delayTime(0.2),
                        cc.callFunc(() => self.showTotalSymbolEffectOnPaylines()),
                        delayAction,
                        completeAction
                    ));
                } else {
                    SlotManager.Instance.node.runAction(cc.sequence(delayAction, completeAction));
                }
            } else {
                state.setDone();
            }
        });

        state.addOnEndCallback(() => {
            State.prototype.onEnd();
        });

        return state;
    }

    /**
     * 获取所有线上中奖结果展示状态
     * @returns 状态实例
     */
    public getWinResultStateOnAllLines(): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            
            if (payOutResults != null && payOutResults.length > 0) {
                const drawWinRectAction = cc.callFunc(() => {
                    const winPosList: cc.Vec2[] = [];
                    
                    for (let i = 0; i < payOutResults.length; ++i) {
                        if (payOutResults[i].payLine === -1 || 
                            (payOutResults[i].winningCell != null && payOutResults[i].winningCell.length !== 0)) {
                            // 有中奖单元格
                            for (let j = 0; j < payOutResults[i].winningCell.length; ++j) {
                                const col = payOutResults[i].winningCell[j][1];
                                const row = payOutResults[i].winningCell[j][0];
                                if (lastHistoryWindows.GetWindow(col).getSymbol(row) !== 51) {
                                    winPosList.push(new cc.Vec2(col, row));
                                }
                            }
                        } else {
                            // 无中奖单元格，计算支付线位置
                            const payLine = payOutResults[i].payLine;
                            let isNewPos = true;
                            
                            for (let j = 0; j < 5; ++j) {
                                const row = Math.floor(payLine / (10000 / Math.pow(10, j))) % 10;
                                if (row !== 0) {
                                    isNewPos = true;
                                    for (let k = 0; k < winPosList.length; ++k) {
                                        if (winPosList[k].x === j && winPosList[k].y === row - 1 ||
                                            lastHistoryWindows.GetWindow(winPosList[k].x).getSymbol(winPosList[k].y) === 51) {
                                            isNewPos = false;
                                            break;
                                        }
                                    }
                                    if (isNewPos) {
                                        winPosList.push(new cc.Vec2(j, row - 1));
                                    }
                                }
                            }
                        }
                    }

                    // 绘制中奖矩形
                    if (SlotManager.Instance.paylineRenderer != null) {
                        const symbolWidth = SlotManager.Instance.paylineRenderer.m_symbolWidth;
                        const symbolHeight = SlotManager.Instance.paylineRenderer.m_symbolHeight;
                        const lineWidth = SlotManager.Instance.paylineRenderer.m_lineWidth;
                        SlotManager.Instance.paylineRenderer.drawWinningRect(winPosList, symbolWidth, symbolHeight, null, lineWidth);
                    }
                });

                const delayAction = cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect);
                const completeAction = cc.callFunc(function(this: SubGameStateManager_Base) {
                    state.setDone();
                }.bind(self));

                if (drawWinRectAction != null) {
                    SlotManager.Instance.node.runAction(cc.sequence(
                        drawWinRectAction,
                        cc.callFunc(() => self.showTotalSymbolEffectOnAllLines()),
                        delayAction,
                        completeAction
                    ));
                } else {
                    SlotManager.Instance.node.runAction(completeAction);
                }
            } else {
                state.setDone();
            }
        });

        state.addOnEndCallback(() => {
            State.prototype.onEnd();
        });

        return state;
    }

    // ===================== 符号特效展示 =====================
    /**
     * 显示支付线上的所有符号特效
     * @returns 是否显示了特效
     */
    public showTotalSymbolEffectOnPaylines(): boolean {
        const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const cellList: Cell[] = [];

        if (payOutResults != null && payOutResults.length > 0) {
            // 检查单元格是否已存在
            const isCellExist = (cell: Cell): boolean => {
                for (let i = 0; i < cellList.length; ++i) {
                    if (cell.col === cellList[i].col && cell.row === cellList[i].row) {
                        return true;
                    }
                }
                return false;
            };

            // 停止所有符号动画
            SymbolAnimationController.Instance.stopAllAnimationSymbol();

            // 收集所有中奖单元格
            for (let i = 0; i < payOutResults.length; ++i) {
                for (let j = 0; j < payOutResults[i].winningCell.length; ++j) {
                    const cell = new Cell(
                        payOutResults[i].winningCell[j][1],
                        payOutResults[i].winningCell[j][0]
                    );
                    if (!isCellExist(cell)) {
                        cellList.push(cell);
                    }
                }
            }

            // 按行排序
            cellList.sort((a, b) => a.row > b.row ? 1 : -1);

            // 播放符号动画
            for (let i = 0; i < cellList.length; ++i) {
                const cell = cellList[i];
                const symbol = lastHistoryWindows.GetWindow(cell.col).getSymbol(cell.row);
                SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbol, null, null, true);
                SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel).hideSymbolInRow(cell.row);
            }

            // 重置符号动画层级
            SymbolAnimationController.Instance.resetZorderSymbolAnimation();
            // 播放中奖音效
            SlotSoundController.Instance().playWinSound(SlotGameResultManager.Instance.getTotalWinSymbolList());
        }

        if (cellList.length === 0) {
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            return false;
        } else {
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
            return true;
        }
    }

    /**
     * 按符号ID分组显示支付线上的符号特效
     * @returns 是否显示了特效
     */
    public showTotalSymbolEffectOnPaylinesBySymbolIdPayoutList(): boolean {
        const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
        const cellList: Cell[] = [];
        const symbolMap: any[] = [];

        // 初始化符号映射
        for (let i = 0; i < SlotGameRuleManager.Instance._slotWindows.size; ++i) {
            symbolMap.push([]);
        }

        if (payOutResults != null && payOutResults.length > 0) {
            // 检查单元格是否已存在
            const isCellExist = (cell: Cell): boolean => {
                for (let i = 0; i < cellList.length; ++i) {
                    if (cell.col === cellList[i].col && cell.row === cellList[i].row) {
                        return true;
                    }
                }
                return false;
            };

            // 停止所有符号动画
            SymbolAnimationController.Instance.stopAllAnimationSymbol();

            // 收集所有中奖单元格和符号
            for (let i = 0; i < payOutResults.length; ++i) {
                for (let j = 0; j < payOutResults[i].winningCell.length; ++j) {
                    const cell = new Cell(
                        payOutResults[i].winningCell[j][1],
                        payOutResults[i].winningCell[j][0]
                    );
                    if (!isCellExist(cell)) {
                        cellList.push(cell);
                        symbolMap[cell.col][cell.row] = payOutResults[i].winningSymbol[j];
                    }
                }
            }

            // 按行排序
            cellList.sort((a, b) => a.row > b.row ? 1 : -1);

            // 播放符号动画
            for (let i = 0; i < cellList.length; ++i) {
                const cell = cellList[i];
                const symbol = symbolMap[cell.col][cell.row];
                SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbol, null, null, true);
                SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel).hideSymbolInRow(cell.row);
            }

            // 重置符号动画层级
            SymbolAnimationController.Instance.resetZorderSymbolAnimation();
            // 播放中奖音效
            SlotSoundController.Instance().playWinSound(SlotGameResultManager.Instance.getTotalWinSymbolList());
        }

        if (cellList.length === 0) {
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            return false;
        } else {
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
            return true;
        }
    }

    /**
     * 取消支付线上符号的暗化效果
     */
    public setDimmDeActiveTotalSymbolOnPaylines(): void {
        const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
        const cellList: Cell[] = [];

        if (payOutResults != null && payOutResults.length > 0) {
            // 检查单元格是否已存在
            const isCellExist = (cell: Cell): boolean => {
                for (let i = 0; i < cellList.length; ++i) {
                    if (cell.col === cellList[i].col && cell.row === cellList[i].row) {
                        return true;
                    }
                }
                return false;
            };

            // 停止所有符号动画
            SymbolAnimationController.Instance.stopAllAnimationSymbol();

            // 收集所有中奖单元格
            for (let i = 0; i < payOutResults.length; ++i) {
                for (let j = 0; j < payOutResults[i].winningCell.length; ++j) {
                    const cell = new Cell(
                        payOutResults[i].winningCell[j][1],
                        payOutResults[i].winningCell[j][0]
                    );
                    if (!isCellExist(cell)) {
                        cellList.push(cell);
                    }
                }
            }

            // 按行排序
            cellList.sort((a, b) => a.row > b.row ? 1 : -1);

            // 取消暗化效果
            for (let i = 0; i < cellList.length; ++i) {
                const cell = cellList[i];
                const reel = SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel);
                reel.showSymbolInRow(cell.row);
                reel.getSymbol(cell.row).getComponent(Symbol).setDimmActive(false);
            }
        }
    }

    /**
     * 显示所有线上的符号特效
     */
    public showTotalSymbolEffectOnAllLines(): void {
        const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const cellList: Cell[] = [];

        if (payOutResults != null && payOutResults.length > 0) {
            // 检查单元格是否已存在
            const isCellExist = (cell: Cell): boolean => {
                for (let i = 0; i < cellList.length; ++i) {
                    if (cell.col === cellList[i].col && cell.row === cellList[i].row) {
                        return true;
                    }
                }
                return false;
            };

            // 停止所有符号动画
            SymbolAnimationController.Instance.stopAllAnimationSymbol();

            // 收集所有中奖单元格
            for (let i = 0; i < payOutResults.length; ++i) {
                const payLine = payOutResults[i].payLine;
                
                if (payOutResults[i].winningCell != null && payOutResults[i].winningCell.length > 0) {
                    // 有中奖单元格
                    for (let j = 0; j < payOutResults[i].winningCell.length; ++j) {
                        const col = payOutResults[i].winningCell[j][1];
                        const row = payOutResults[i].winningCell[j][0];
                        const cell = new Cell(col, row);
                        if (!isCellExist(cell)) {
                            cellList.push(cell);
                        }
                    }
                } else {
                    // 无中奖单元格，计算支付线位置
                    for (let j = 0; j < 5; ++j) {
                        const row = Math.floor(payLine / (10000 / Math.pow(10, j))) % 10;
                        if (row !== 0) {
                            const cell = new Cell(j, row - 1);
                            if (!isCellExist(cell)) {
                                cellList.push(cell);
                            }
                        }
                    }
                }
            }

            // 播放符号动画
            for (let i = 0; i < cellList.length; ++i) {
                const cell = cellList[i];
                const symbol = lastHistoryWindows.GetWindow(cell.col).getSymbol(cell.row);
                SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbol, null, null, true);
                SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel).hideSymbolInRow(cell.row);
            }

            // 设置暗化状态
            if (cellList.length > 0) {
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
            } else {
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            }

            // 播放中奖音效
            SlotSoundController.Instance().playWinSound(SlotGameResultManager.Instance.getTotalWinSymbolList());
        }
    }

    // ===================== 免费旋转相关 =====================
    /**
     * 获取将奖金添加到免费旋转奖金池的状态
     * @returns 状态实例
     */
    public getAddWinMoneyToFreespinEarningPotState(): State {
        const state = new State();
        
        state.addOnStartCallback(() => {
            SlotGameResultManager.Instance.winMoneyInFreespinMode += SlotGameResultManager.Instance.getWinningCoin();
            state.setDone();
        });

        return state;
    }

    // ===================== 音效音量控制 =====================
    /**
     * 获取设置背景音乐音量的状态
     * @param ratio 音量比例
     * @returns 状态实例
     */
    public getSetBGSoundRatioState(ratio: number): State {
        const state = new State();
        
        state.addOnStartCallback(() => {
            SoundManager.Instance().setMainVolumeTemporarily(ratio);
            state.setDone();
        });

        return state;
    }

    /**
     * 获取重置背景音乐音量的状态
     * @returns 状态实例
     */
    public getResetBGSoundRatioState(): State {
        const state = new State();
        
        state.addOnStartCallback(() => {
            SoundManager.Instance().resetTemporarilyMainVolume();
            state.setDone();
        });

        return state;
    }

    // ===================== 辅助方法 =====================
    /**
     * 判断是否显示奖金特效
     * @returns 0=不显示，1=显示
     */
    public isShowWinMoneyEffect() {
        const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
        return (payOutResults != null && payOutResults.length !== 0);
    }

    /**
     * 获取设置底部奖金增长信息的状态
     * @returns 状态实例
     */
    public getSetBottomInfoIncreaseWinMoneyState(): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            if (self.isShowWinMoneyEffect()) {
                const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                if (subGameKey === "freeSpin") {
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.IncreaseWinMoneyFreespin);
                } else {
                    SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.IncreaseWinMoneyDefault);
                }
            }
            state.setDone();
        });

        return state;
    }

    /**
     * 获取刷新自动旋转状态的状态
     * @returns 状态实例
     */
    public getRefreshAutoSpinState(): State {
        const state = new State();
        
        state.addOnStartCallback(() => {
            SlotManager.Instance.refreshAutoSpinState();
            state.setDone();
        });

        return state;
    }

    // ===================== 相机控制 =====================
    /**
     * 获取奖金结果展示前向下滚动的状态
     * @returns 状态实例
     */
    public getScrollDownBeforeWinResultState(): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            if (self.isShowWinMoneyEffect()) {
                const winType = SlotGameResultManager.Instance.getWinType();
                const cameraState = CameraControl.Instance.eStateOfCameraPosition;
                if (winType === SlotGameResultManager.WINSTATE_NORMAL || (cameraState !== 1 && CameraControl.Instance.isOriginalPos())) {
                    state.setDone();
                } else {
                    const scrollDownAction = cc.callFunc(() => {
                        SlotManager.Instance.setMouseDragEventFlag(false);
                        CameraControl.Instance.scrollDownScreen(0.8);
                    });

                    const completeAction = cc.callFunc(() => {
                        SlotManager.Instance.setMouseDragEventFlag(true);
                        state.setDone();
                    });

                    const sequence = cc.sequence(scrollDownAction, cc.delayTime(0.8), completeAction);
                    SlotManager.Instance.node.runAction(sequence);
                }
            } else {
                state.setDone();
            }
        });

        return state;
    }

    /**
     * 获取奖金结果展示前向下滚动的更新版状态
     * @returns 状态实例
     */
    public getScrollDownBeforeWinResultStateRenewal(): State {
        const self = this;
        const state = new State();
        
        state.addOnStartCallback(() => {
            if (self.isShowWinMoneyEffect()) {
                SlotManager.Instance.setMouseDragEventFlag(false);
                const cameraState = CameraControl.Instance.eStateOfCameraPosition;

                if (cameraState === 1 || !CameraControl.Instance.isOriginalPos()) {
                    const scrollDownAction = cc.callFunc(() => {
                        CameraControl.Instance.scrollDownScreen(0.8);
                    });

                    const completeAction = cc.callFunc(() => {
                        SlotManager.Instance.setMouseDragEventFlag(true);
                        state.setDone();
                    });

                    const sequence = cc.sequence(scrollDownAction, cc.delayTime(0.8), completeAction);
                    SlotManager.Instance.node.runAction(sequence);
                } else {
                    state.setDone();
                }
            } else {
                state.setDone();
            }
        });

        return state;
    }

    /**
     * 获取免费旋转触发前向下滚动的状态
     * @returns 状态实例
     */
    public getScrollDownBeforeFreespinTrigger(): State {
        const state = new State();
        
        state.addOnStartCallback(() => {
            state.setDone();
        });

        return state;
    }

    /**
     * 获取Jackpot触发前向下滚动的状态
     * @returns 状态实例
     */
    public getScrollDownBeforeJackpotTrigger(): State {
        const state = new State();
        
        state.addOnStartCallback(() => {
            state.setDone();
        });

        return state;
    }

    /**
     * 获取向下滚动的状态
     * @param duration 滚动时长
     * @returns 状态实例
     */
    public getScrollDown(duration: number): State {
        const state = new State();
        
        state.addOnStartCallback(() => {
            const cameraState = CameraControl.Instance.eStateOfCameraPosition;
            const isOriginalPos = CameraControl.Instance.isOriginalPos();

            if (cameraState === 1 || !CameraControl.Instance.isOriginalPos()) {
                const scrollDownAction = cc.callFunc(() => {
                    CameraControl.Instance.scrollDownScreen(duration);
                });

                const completeAction = cc.callFunc(() => {
                    state.setDone();
                });

                const sequence = cc.sequence(scrollDownAction, cc.delayTime(duration), completeAction);
                SlotManager.Instance.node.runAction(sequence);
            } else {
                state.setDone();
            }
        });

        return state;
    }

    /**
     * 获取中奖特效展示时设置背景音乐的状态
     * @returns 状态实例
     */
    public getSetBGSoundOnShowWinEffectState(): State {
        const state = new State();
        
        state.addOnStartCallback(() => {
            const winType = SlotGameResultManager.Instance.getWinType();
            if (winType !== SlotGameResultManager.WINSTATE_NORMAL) {
                SoundManager.Instance().setMainVolumeTemporarily(0);
            }
            state.setDone();
        });

        return state;
    }

    /**
     * 设置支付线上符号的暗化效果
     */
    public setDimmActiveOnPaylines(): void {
        const payOutResults = SlotGameResultManager.Instance.getSpinResult().payOutResults;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const cellList: Cell[] = [];

        if (payOutResults != null && payOutResults.length > 0) {
            // 检查单元格是否已存在
            const isCellExist = (cell: Cell): boolean => {
                for (let i = 0; i < cellList.length; ++i) {
                    if (cell.col === cellList[i].col && cell.row === cellList[i].row) {
                        return true;
                    }
                }
                return false;
            };

            // 收集所有中奖单元格
            for (let i = 0; i < payOutResults.length; ++i) {
                for (let j = 0; j < payOutResults[i].winningCell.length; ++j) {
                    const cell = new Cell(
                        payOutResults[i].winningCell[j][1],
                        payOutResults[i].winningCell[j][0]
                    );
                    if (!isCellExist(cell)) {
                        cellList.push(cell);
                    }
                }
            }

            // 按行排序
            cellList.sort((a, b) => a.row > b.row ? 1 : -1);
            
            // 设置暗化状态
            SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);

            // 取消中奖符号的暗化
            for (let i = 0; i < cellList.length; ++i) {
                const cell = cellList[i];
                lastHistoryWindows.GetWindow(cell.col).getSymbol(cell.row);
                const symbol = SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel).getSymbol(cell.row);
                symbol.getComponent(Symbol).setDimmActive(false);
            }
        }
    }
}