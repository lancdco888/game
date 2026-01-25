import CameraControl from "../Slot/CameraControl";
import Reel from "../Slot/Reel";
import Symbol from "../Slot/Symbol";
import SlotReelSpinStateManager from "../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../Slot/SlotSoundController";
import State, { ConcurrentState, SequencialState } from "../Slot/State";
import SymbolAnimationController from "../Slot/SymbolAnimationController";
import SubGameStateManager_Base from "../SubGameStateManager_Base";
import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import TSUtility from "../global_utility/TSUtility";
import LangLocaleManager from "../manager/LangLocaleManager";
import PopupSetting, { Popup_Msg } from "../manager/PopupSetting";
import SlotGameResultManager, { Cell } from "../manager/SlotGameResultManager";
import SlotGameRuleManager from "../manager/SlotGameRuleManager";
import SlotManager from "../manager/SlotManager";
import { BottomTextType } from "./BottomUIText";
import { JACKPOT_MSG, PICK_END, PICK_PRE_EFFECT, PICK_RESULT, PICK_ROLLUP, PICK_START, SIDE_ANI } from "./MsgDataType_MoooreCheddar";
import PrizeSymbol_MoooreCheddar from "./PrizeSymbol_MoooreCheddar";
import UtilityStateComponent from "./UtilityStateComponent";

// 严格遵循指定装饰器导出方式
const { ccclass, property } = cc._decorator;



/**
 * Mooore Cheddar子游戏状态管理器
 * 核心：基游戏/免费游戏/奖励游戏的状态流转、Jackpot计算、动画控制
 */
@ccclass()
export default class SubGameStateManager_MoooreCheddar extends SubGameStateManager_Base {
    // ================= 业务属性 =================
    private game_manager: SlotManager = null;
    private game_animation_time: number = 0;
    private utility_component: UtilityStateComponent = null;
    private pre_jackpot_type: number = -1;
    private pre_jackpot_count: number = 0;
    private pre_jackpot_value: number = 0;
    public pre_pot: number = 0;
    public total_money: number = 0;
    public chedda_cheese: number = 0;
    public chedda_cheese_explain: boolean = false;
    public actionSingleLine: cc.Action = null; // 单行奖励动画

    // ================= Getter 访问器 =================
    get PreJackpotType(): number {
        return this.pre_jackpot_type;
    }

    get PreJackpotCount(): number {
        return this.pre_jackpot_count;
    }

    get PreJackpotValue(): number {
        return this.pre_jackpot_value;
    }

    get PrePot(): number {
        return this.pre_pot;
    }

    // ================= 基础方法 =================
    addPrePot(value: number): void {
        this.pre_pot += value;
    }

    setManager(slotManager: SlotManager, node: any, aniTime: number): void {
        this.game_manager = slotManager;
        this.game_animation_time = aniTime;
        this.utility_component = new UtilityStateComponent(this.game_manager, node);
    }

    getSelectState(): SequencialState {
        const subGameKey = this.game_manager.getSubGameKeyAtStartSpin();
        if (subGameKey === "base") return this.getBaseGameState();
        if (subGameKey.indexOf("bonusGame") > -1) return this.getPickBonusState();
        return this.getFreeGameState();
    }

    // ================= 游戏状态核心 =================
    private getBaseGameState(): SequencialState {
        const self = this;
        const baseState = new SequencialState();
        const initState = new SequencialState();
        let idx = 0;

        initState.insert(idx++, this.game_manager.getSetFlagPlayingSubgameState(true));
        initState.insert(idx++, this.getStopSingleLineActionState());
        initState.insert(idx++, this.getStopAllSymbolAniState());
        initState.insert(idx++, this.game_manager.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
        initState.insert(idx++, this.game_manager.bottomUIText.getChangeWinMoneyTextState(0));
        initState.insert(idx++, this.onSpinInit());
        initState.insert(idx++, this.game_manager.getReelSpinStartState());
        
        baseState.insert(0, initState);

        const spinResultState = new SequencialState();
        spinResultState.addOnStartCallback(() => {
            if (self.game_manager.flagSpinRequest) {
                let tIdx = 0;
                const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();

                spinResultState.insert(tIdx++, self.onCheckRandomAnimation());
                spinResultState.insert(tIdx++, self.game_manager.reelMachine.getNormalSpinReelStateRenewal());
                spinResultState.insert(tIdx++, self.getShowTotalTriggeredPaylineState());

                const lineEffectState = new SequencialState();
                lineEffectState.insert(0, self.getStateShowTotalSymbolEffectOnPayLines());
                lineEffectState.insert(1, self.getSingleLineEffectOnPaylineState());

                spinResultState.insert(tIdx, lineEffectState);
                spinResultState.insert(tIdx, self.getSetBottomInfoIncreaseWinMoneyState());
                spinResultState.insert(tIdx++, self.utility_component.getWinMoneyState());
                spinResultState.insert(tIdx++, self.game_manager.getSetFlagPlayingSubgameState(false));
                spinResultState.insert(tIdx++, self.onTriggerPickBonusState(nextSubGameKey));
                spinResultState.insert(tIdx++, self.onTriggerFreespinState(nextSubGameKey));
            }
        });

        baseState.insert(1, spinResultState);
        return baseState;
    }

    private getFreeGameState(): SequencialState {
        const self = this;
        const freeGameState = new SequencialState();
        const initState = new SequencialState();
        let idx = 0;

        initState.insert(idx++, this.game_manager.getSetFlagPlayingSubgameState(true));
        initState.insert(idx++, this.getStopSingleLineActionState());
        initState.insert(idx++, this.getStopAllSymbolAniState());
        initState.insert(idx++, this.game_manager.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
        initState.insert(idx++, this.game_manager.bottomUIText.getChangeWinMoneyTextState(SlotGameResultManager.Instance.winMoneyInFreespinMode));
        initState.insert(idx++, this.game_manager.getIncreaseFreespinPastCountStateRenewal());
        initState.insert(idx++, this.onSpinInit());
        initState.insert(idx++, this.game_manager.getReelSpinStartState());
        freeGameState.insert(0, initState);

        const spinResultState = new SequencialState();
        spinResultState.addOnStartCallback(() => {
            if (self.game_manager.flagSpinRequest) {
                let tIdx = 0;
                const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();

                if (self.chedda_cheese_explain) {
                    spinResultState.insert(tIdx++, self.playFreeSpinExpectEffect());
                    self.chedda_cheese_explain = false;
                } else {
                    spinResultState.insert(tIdx++, self.onCheckRandomAnimation(false));
                }

                spinResultState.insert(tIdx++, self.game_manager.reelMachine.getFreeSpinReelStateRenewal());
                spinResultState.insert(tIdx++, self.getShowTotalTriggeredPaylineState());

                const mouseDisableState = new State();
                mouseDisableState.addOnStartCallback(() => {
                    self.game_manager.setActiveFlagMouseEvent(false);
                    mouseDisableState.setDone();
                });

                const spinResult = SlotGameResultManager.Instance.getSpinResult();
                if (spinResult.subGamePotResults.length > 0) {
                    spinResultState.insert(tIdx, self.getStateShowTotalSymbolEffectOnPayLines());
                    spinResultState.insert(tIdx, self.getSetBottomInfoIncreaseWinMoneyState());

                    let totalWin = 0;
                    spinResult.payOutResults.forEach(res => totalWin += res.winningCoin);

                    if (totalWin > 0) {
                        const rollupState = new State();
                        rollupState.addOnStartCallback(() => {
                            self.game_manager.node.emit("onRollupWinMoney", totalWin, () => rollupState.setDone());
                        });
                        spinResultState.insert(tIdx++, rollupState);
                    }

                    spinResultState.insert(tIdx++, self.onCalculateHighSymbolInFreeSpin());
                    spinResultState.insert(tIdx, self.getSingleLineEffectOnPaylineState());
                    spinResultState.insert(tIdx, mouseDisableState);
                    spinResultState.insert(tIdx++, self.utility_component.getWinMoneyState(
                        self.utility_component.option_skip | self.utility_component.option_ignore_unlock
                    ));
                } else {
                    const normalEffectState = new SequencialState();
                    normalEffectState.insert(0, self.getStateShowTotalSymbolEffectOnPayLines());
                    normalEffectState.insert(1, self.getSingleLineEffectOnPaylineState());

                    spinResultState.insert(tIdx, normalEffectState);
                    spinResultState.insert(tIdx, self.getSetBottomInfoIncreaseWinMoneyState());
                    spinResultState.insert(tIdx, mouseDisableState);
                    spinResultState.insert(tIdx++, self.utility_component.getWinMoneyState(
                        self.utility_component.option_ignore_unlock
                    ));
                }

                spinResultState.insert(tIdx++, self.getAddWinMoneyToFreespinEarningPotState());
                spinResultState.insert(tIdx++, self.onRetriggerFreeSpin());
                spinResultState.insert(tIdx++, self.onTriggerPickBonusState(nextSubGameKey));
                spinResultState.insert(tIdx++, self.game_manager.getSetFlagPlayingSubgameState(false));

                if (nextSubGameKey.indexOf("free") < 0) {
                    spinResultState.insert(tIdx++, self.onEndedFreeSpinProcess());
                } else {
                    const mouseEnableState = new State();
                    mouseEnableState.addOnStartCallback(() => {
                        self.game_manager.setActiveFlagMouseEvent(true);
                        mouseEnableState.setDone();
                    });
                    spinResultState.insert(tIdx++, mouseEnableState);
                }
            }
        });

        freeGameState.insert(1, spinResultState);
        freeGameState.insert(2, this.utility_component.onEventControlState(true));
        return freeGameState;
    }

    private getPickBonusState(): SequencialState {
        const self = this;
        const pickBonusState = new SequencialState();
        const initState = new SequencialState();
        let idx = 0;

        initState.insert(idx++, this.game_manager.getSetFlagPlayingSubgameState(true));
        initState.insert(idx++, this.utility_component.onEventControlState(false));

        let bonusKey = -1;
        const pickStartState = new State();
        pickStartState.addOnStartCallback(() => {
            self.total_money = 0;
            const pickStartMsg = new PICK_START();
            pickStartMsg.onInit((key: number) => {
                bonusKey = key;
                pickStartState.setDone();
            });
            self.game_manager.node.emit("sendPickBonus", pickStartMsg);
        });
        initState.insert(idx++, pickStartState);

        const spinRequestState = new State();
        spinRequestState.addOnStartCallback(() => {
            self.game_manager.sendSpinRequestProc(() => spinRequestState.setDone(), [bonusKey]);
        });
        initState.insert(idx++, spinRequestState);
        pickBonusState.insert(0, initState);

        const pickResultState = new SequencialState();
        pickResultState.addOnStartCallback(() => {
            if (self.game_manager.flagSpinRequest) {
                let tIdx = 0;
                const currentKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                const nextKey = SlotGameResultManager.Instance.getNextSubGameKey();
                const spinResult = SlotGameResultManager.Instance.getSpinResult();

                pickResultState.insert(tIdx++, self.utility_component.onEventControlState(false));

                const resultInitState = new State();
                resultInitState.addOnStartCallback(() => {
                    const pickResultMsg = new PICK_RESULT();
                    pickResultMsg.onInit(
                        parseInt(spinResult.probResults[0].key),
                        nextKey.indexOf("bonusGame") > -1,
                        () => resultInitState.setDone()
                    );
                    self.game_manager.node.emit("sendPickBonus", pickResultMsg);
                });
                pickResultState.insert(tIdx++, resultInitState);
                pickResultState.insert(tIdx++, self.utility_component.getDelayState(0.25));

                if (spinResult.probResults[0].key < 5) {
                    const jackpotRes = spinResult.jackpotResults[0];
                    const jackpotState = new SequencialState();
                    jackpotState.addOnStartCallback(() => {
                        const jackpotMsg = new JACKPOT_MSG();
                        jackpotMsg.onInit(true, jackpotRes.jackpotSubKey, jackpotRes.jackpotSubID, jackpotRes.winningCoin);
                        self.game_manager.node.emit("onJackpotDisplayFunction", jackpotMsg);
                    });
                    jackpotState.insert(1, self.utility_component.openPopupState(new Popup_Msg(5, {
                        jackpot: jackpotRes.jackpotSubID,
                        reward: jackpotRes.winningCoin,
                        multiplier: 1,
                        playcoin: true
                    })));
                    jackpotState.insert(2, self.onWinRollupState());
                    jackpotState.addOnEndCallback(() => {
                        const jackpotMsg = new JACKPOT_MSG();
                        jackpotMsg.onInit(false, jackpotRes.jackpotSubKey, jackpotRes.jackpotSubID, jackpotRes.winningCoin);
                        self.game_manager.node.emit("onJackpotDisplayFunction", jackpotMsg);
                    });
                    pickResultState.insert(tIdx++, jackpotState);
                } else {
                    if (currentKey.indexOf("free") > -1 && spinResult.probResults[0].key === 5) {
                        self.setCheddaCheese();
                    } else {
                        pickResultState.insert(tIdx++, self.onWinRollupState(true));
                    }
                }

                pickResultState.insert(tIdx++, self.game_manager.getSetFlagPlayingSubgameState(false));

                if (nextKey.indexOf("bonus") < 0) {
                    pickResultState.insert(tIdx++, self.utility_component.getDelayState(0.5));

                    const pickEndState = new State();
                    pickEndState.addOnStartCallback(() => {
                        self.game_manager.setActiveFlagMouseEvent(false);
                        const pickEndMsg = new PICK_END();
                        pickEndMsg.onInit(() => pickEndState.setDone());
                        self.game_manager.node.emit("sendPickBonus", pickEndMsg);
                    });
                    pickResultState.insert(tIdx++, pickEndState);
                    pickResultState.insert(tIdx++, self.utility_component.getDelayState(1));

                    const subGameState = SlotGameResultManager.Instance.getSubGameState(currentKey);
                    const totalWin = subGameState.totalWinningCoin - self.chedda_cheese;
                    if (totalWin > 0) {
                        pickResultState.insert(tIdx++, self.game_manager.bottomUIText.getChangeWinMoneyTextState(totalWin));
                        pickResultState.insert(tIdx++, self.game_manager.bottomUIText.getBottomInfoState(BottomTextType.CustomData, "TOTAL WIN"));
                        pickResultState.insert(tIdx++, self.utility_component.openPopupState(new Popup_Msg(4, {
                            reward: totalWin,
                            multiplier: Math.floor(totalWin / subGameState.betPerLines)
                        })));
                        pickResultState.insert(tIdx++, self.onGameEndBigWinState(subGameState, totalWin, false));
                    }

                    const bgmState = new State();
                    bgmState.addOnStartCallback(() => {
                        SlotSoundController.Instance().playAudio(subGameState.prevSubGameKey, "BGM");
                        bgmState.setDone();
                    });
                    pickResultState.insert(tIdx++, bgmState);

                    tIdx = self.onEventTriggerCameraMoving(pickResultState, tIdx);

                    const cameraInitState = new State();
                    cameraInitState.addOnStartCallback(() => {
                        const ratio = CameraControl.Instance.scaleAdjuster.getResolutionRatio();
                        const yPos = cc.misc.lerp(710, 690, ratio);
                        CameraControl.Instance.initCameraControl(cc.v2(40, 0), cc.v2(720, yPos));
                        self.game_manager.node.emit("openPickBonus", false);
                        cameraInitState.setDone();
                    });
                    pickResultState.insert(tIdx++, cameraInitState);

                    if (self.chedda_cheese > 0) {
                        self.chedda_cheese_explain = true;
                        pickResultState.insert(tIdx++, self.onCheddaCheeseState());

                        const highSymbolState = new State();
                        highSymbolState.addOnStartCallback(() => {
                            for (let t = 1; t < 4; ++t) {
                                const reel = self.game_manager.reelMachine.reels[t].getComponent(Reel);
                                for (let o = 0; o < 3; ++o) {
                                    const symbol = reel.getSymbol(o).getComponent(Symbol);
                                    if (symbol.symbolId === 131) {
                                        const aniNode = SymbolAnimationController.Instance.playAnimationSymbol(t, o, 631);
                                        const prizeSymbol = aniNode.getComponent(PrizeSymbol_MoooreCheddar);
                                        if (TSUtility.isValid(prizeSymbol)) {
                                            prizeSymbol.SetSymbolInfoByHighSymbol([
                                                self.PrePot, self.PreJackpotType, self.PreJackpotValue, self.PreJackpotCount
                                            ]);
                                        }
                                        reel.hideSymbolInRow(o);
                                    }
                                }
                            }
                            highSymbolState.setDone();
                        });
                        pickResultState.insert(tIdx++, highSymbolState);

                        const cheeseWinState = self.utility_component.getWinMoneyState(
                            self.utility_component.option_skip | self.utility_component.option_ignore_unlock,
                            () => self.chedda_cheese
                        );
                        pickResultState.insert(tIdx++, cheeseWinState);

                        if (SlotGameResultManager.Instance.getWinType(self.chedda_cheese) ===SlotGameResultManager.WINSTATE_NORMAL) {
                            pickResultState.insert(tIdx++, self.utility_component.getDelayState(self.game_animation_time));
                        }
                        pickResultState.insert(tIdx++, self.getStopAllSymbolAniState());
                    }

                    if (subGameState.prevSubGameKey !== nextKey) {
                        if (nextKey === "base") {
                            self.chedda_cheese_explain = false;
                            pickResultState.insert(tIdx++, self.onEndedFreeSpinProcess());
                        } else {
                            pickResultState.insert(tIdx++, self.onTriggerFreespinState(nextKey, false));
                        }
                    } else if (nextKey === "freeSpin") {
                        const freeSpinState = SlotGameResultManager.Instance.getSubGameState("freeSpin");
                        if (self.game_manager._freespinTotalCount < freeSpinState.totalCnt) {
                            pickResultState.insert(tIdx++, self.game_manager.bottomUIText.getChangeWinMoneyTextState(0));
                            pickResultState.insert(tIdx++, self.game_manager.bottomUIText.getBottomInfoState(BottomTextType.CustomData, "FREE SPIN RETRIGGERED"));
                            pickResultState.insert(tIdx++, self.onRetriggerPopup());
                        }
                    }

                    const mouseEnableState = new State();
                    mouseEnableState.addOnStartCallback(() => {
                        self.game_manager.setActiveFlagMouseEvent(true);
                        self.chedda_cheese = 0;
                        mouseEnableState.setDone();
                    });
                    pickResultState.insert(tIdx++, mouseEnableState);
                }

                if (currentKey.includes("free")) {
                    pickResultState.insert(tIdx++, self.getAddWinMoneyToFreespinEarningPotState());
                }
            }
        });

        pickBonusState.insert(1, pickResultState);
        pickBonusState.insert(2, this.utility_component.onEventControlState(true));
        return pickBonusState;
    }

    // ================= 缺失方法补全（核心） =================
    public getSingleLineEffectOnPaylineState(): State {
        const self = this;
        const currentKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        
        if (currentKey === "base") return super.getSingleLineEffectOnPaylineState();

        const singleLineState = new State();
        singleLineState.addOnStartCallback(() => {
            const payOutRes = SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const potRes = SlotGameResultManager.Instance.getSpinResult().subGamePotResults;
            const historyWin = SlotGameResultManager.Instance.getLastHistoryWindows();
            const cellList: Cell[] = [];

            const winType = SlotGameResultManager.Instance.getWinType();
            if (winType === SlotGameResultManager.WINSTATE_NORMAL) {
                if (!payOutRes || payOutRes.length === 0) {
                    singleLineState.setDone();
                    return;
                }
                if (self.checkSkipSingleLineEffect()) {
                    singleLineState.setDone();
                    return;
                }
            }

            let count = 0;
            let totalCount = payOutRes.length;
            if (TSUtility.isValid(potRes) && potRes.length > 0) totalCount += 1;

            if (totalCount !== 0) {
                let isFirstPlay = false;
                const highSymbolData = [self.PrePot, self.PreJackpotType, self.PreJackpotValue, self.PreJackpotCount];

                const lineEffectCb = cc.callFunc(() => {
                    if (SlotManager.Instance.paylineRenderer) SlotManager.Instance.paylineRenderer.clearAll();
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    cellList.length = 0;

                    let displayText = "";
                    if (count === 0) {
                        // 奖池奖励逻辑
                        for (let n = 0; n < self.game_manager.reelMachine.reels.length; ++n) {
                            const winWindow = historyWin.GetWindow(n);
                            for (let y = 0; y < winWindow.size; ++y) {
                                if (winWindow.getSymbol(y) === 31) {
                                    cellList.push(new Cell(n, y));
                                }
                            }
                        }

                        cellList.forEach(cell => {
                            const aniNode = SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, 631);
                            const prizeSymbol = aniNode.getComponent(PrizeSymbol_MoooreCheddar);
                            if (TSUtility.isValid(prizeSymbol)) {
                                prizeSymbol.SetSymbolInfoByHighSymbol(highSymbolData);
                            }
                            SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel).hideSymbolInRow(cell.row);
                        });

                        const potValue = self.onCalculatePotValue(highSymbolData);
                        displayText = `POT PAYS ${CurrencyFormatHelper.formatNumber(potValue)}`;
                    } else {
                        // 普通奖励逻辑
                        const resIdx = count - 1;
                        const payLine = payOutRes[resIdx].payLine;

                        if (SlotManager.Instance.paylineRenderer && payLine > -1) {
                            SlotManager.Instance.paylineRenderer.drawSingleLine(payLine, payOutRes[resIdx].payOut.count);
                        }

                        if (payOutRes.length > 1) {
                            SlotSoundController.Instance().playAudio("ShowPayline", "FX");
                        } else if (!isFirstPlay) {
                            SlotSoundController.Instance().playAudio("ShowPayline", "FX");
                            isFirstPlay = true;
                        }

                        payOutRes[resIdx].winningCell.forEach(cell => {
                            cellList.push(new Cell(cell[1], cell[0]));
                        });

                        cellList.forEach(cell => {
                            let symbolId = historyWin.GetWindow(cell.col).getSymbol(cell.row);
                            if (symbolId === 31) symbolId = 531;

                            const aniNode = SymbolAnimationController.Instance.playAnimationSymbol(cell.col, cell.row, symbolId);
                            const prizeSymbol = aniNode.getComponent(PrizeSymbol_MoooreCheddar);
                            if (TSUtility.isValid(prizeSymbol)) {
                                prizeSymbol.SetSymbolInfoByHighSymbol(highSymbolData);
                            }
                            SlotManager.Instance.reelMachine.reels[cell.col].getComponent(Reel).hideSymbolInRow(cell.row);
                        });

                        const langText = LangLocaleManager.getInstance().getLocalizedText("LINE ${0} PAYS ${1}");
                        displayText = TSUtility.strFormat(langText.text, 
                            (payLine + 1).toString(), 
                            CurrencyFormatHelper.formatNumber(payOutRes[resIdx].winningCoin)
                        );
                    }

                    if (totalCount > 1) {
                        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, displayText);
                        const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
                        SlotManager.Instance.bottomUIText.setWinMoney(totalWin, displayText);
                    }

                    count = (count + 1) % totalCount;
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
                });

                self.stopSingleLineAction();
                self.actionSingleLine = cc.repeatForever(
                    cc.sequence(lineEffectCb, cc.delayTime(SlotManager.Instance.timeOfSymbolEffect * SlotManager.Instance.loopCountOfSymbolEffect))
                );
                SlotManager.Instance.node.runAction(self.actionSingleLine);
                singleLineState.setDone();
            } else {
                singleLineState.setDone();
            }
        });
        return singleLineState;
    }

    // ================= 其他工具方法 =================
    private onSpinInit(): State {
        const self = this;
        const spinInitState = new State();
        spinInitState.addFrontOnStartCallback(() => {
            self.total_money = 0;
            self.game_manager.node.emit("onResetPlayAnimationWhileSpinning");
            spinInitState.setDone();
        });
        return spinInitState;
    }

    private onWinRollupState(isApply: boolean = false): State {
        const self = this;
        const winRollupState = new State();
        winRollupState.addOnStartCallback(() => {
            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
            const rollupMsg = new PICK_ROLLUP();
            rollupMsg.onInit(totalWin, () => {
                if (isApply) self.game_manager.applyGameResultMoney(totalWin);
                winRollupState.setDone();
            });
            self.game_manager.node.emit("sendPickBonus", rollupMsg);
        });
        return winRollupState;
    }

    onUpdatePotValue(isReset: boolean = false): void {
        const baseState = SlotGameResultManager.Instance.getSubGameState("base");
        const freeState = SlotGameResultManager.Instance.getSubGameState("freeSpin");

        if (TSUtility.isValid(freeState) && !isReset) {
            this.pre_jackpot_type = baseState.getGaugesValue("freespinType");
            this.pre_jackpot_type = this.pre_jackpot_type > 0 ? this.pre_jackpot_type - 1 : -1;
            this.pre_jackpot_count = baseState.getGaugesValue("jackpotCnt");

            const freePot = freeState.spinCnt === 0 ? baseState.pots.freeSpinPot : freeState.pots.freeSpinPot;
            this.pre_pot = freePot.pot;

            if (this.pre_jackpot_count > 0) {
                const jackpotInfo = SlotManager.Instance.getSlotJackpotInfo();
                const basePrize = jackpotInfo.getJackpotMoneyInfo(this.pre_jackpot_type).basePrize;
                const betRate = SlotGameRuleManager.Instance.getCurrentBetPerLineApplyFeatureTotalBetRate100();
                this.pre_jackpot_value = basePrize * betRate;
                this.pre_pot -= this.pre_jackpot_value * this.pre_jackpot_count;
            }
        } else {
            this.pre_jackpot_type = -1;
            this.pre_jackpot_count = 0;
            this.pre_jackpot_value = 0;
            this.pre_pot = 0;
        }

        PrizeSymbol_MoooreCheddar.FREESPIN_JACKPOT = this.pre_jackpot_type;
    }

    private onTriggerFreespinState(subGameKey: string = "base", isTrigger: boolean = true): SequencialState {
        const self = this;
        const freeSpinState = new SequencialState();

        if (subGameKey.indexOf("free") > -1) {
            let idx = 0;
            freeSpinState.insert(idx++, self.utility_component.onEventControlState(false));
            idx = self.onEventTriggerCameraMoving(freeSpinState, idx);
            freeSpinState.insert(idx++, self.getStopSingleLineActionState());
            freeSpinState.insert(idx++, self.getStopAllSymbolAniState());
            freeSpinState.insert(idx++, self.game_manager.bottomUIText.getChangeWinMoneyTextState(0));
            freeSpinState.insert(idx++, self.game_manager.bottomUIText.getBottomInfoState(BottomTextType.CustomData, "FREE SPINS TRIGGERED"));

            if (isTrigger) freeSpinState.insert(idx++, self.onJackpotEffectState(0, 0, 0));
            self.onUpdatePotValue();

            if (!isTrigger) {
                const infoState = new State();
                infoState.addOnStartCallback(() => {
                    self.game_manager.node.emit("updateFreeSpinInfo");
                    infoState.setDone();
                });
                freeSpinState.insert(idx++, infoState);
                freeSpinState.insert(idx++, self.utility_component.getDelayState(0.1));

                const ruleState = new State();
                ruleState.addOnStartCallback(() => {
                    self.game_manager.node.emit("onGameRuleText", false);
                    ruleState.setDone();
                });
                freeSpinState.insert(idx++, ruleState);
            }

            const aniState = new State();
            aniState.addOnStartCallback(() => {
                self.game_manager.node.emit("onSideCharacterAnimation", SIDE_ANI.TRIGGER);
                aniState.setDone();
            });
            freeSpinState.insert(idx++, aniState);
            freeSpinState.insert(idx++, self.utility_component.getDelayState(4));
            freeSpinState.insert(idx++, self.onChangeUI_State("freeSpin"));
            freeSpinState.insert(idx++, self.onChangeBGM());
            freeSpinState.insert(idx++, self.utility_component.getDelayState(0.5));
            freeSpinState.insert(idx++, self.utility_component.openPopupState(new Popup_Msg(0, {
                jackpot: self.PreJackpotType,
                jackpot_count: self.PreJackpotCount,
                pot: self.PrePot
            })));
            freeSpinState.insert(idx++, self.utility_component.getDelayState(0.5));
            freeSpinState.insert(idx++, self.utility_component.onEventControlState(true));
        }

        return freeSpinState;
    }

    private onTriggerPickBonusState(subGameKey: string = "base"): SequencialState {
        const self = this;
        const pickBonusState = new SequencialState();

        if (subGameKey.indexOf("bonusGame") > -1) {
            let idx = 0;
            pickBonusState.insert(idx++, self.utility_component.onEventControlState(false));
            idx = self.onEventTriggerCameraMoving(pickBonusState, idx);
            pickBonusState.insert(idx++, self.getStopSingleLineActionState());
            pickBonusState.insert(idx++, self.getStopAllSymbolAniState());
            pickBonusState.insert(idx++, self.game_manager.bottomUIText.getChangeWinMoneyTextState(0));
            pickBonusState.insert(idx++, self.game_manager.bottomUIText.getBottomInfoState(BottomTextType.CustomData, "BONUS GAME TRIGGERED"));
            pickBonusState.insert(idx++, self.onScatterEffectState());

            const aniState = new State();
            aniState.addOnStartCallback(() => {
                self.game_manager.node.emit("onSideCharacterAnimation", SIDE_ANI.TRIGGER);
                aniState.setDone();
            });
            pickBonusState.insert(idx++, aniState);
            pickBonusState.insert(idx++, self.utility_component.getDelayState(3.5));

            const cameraState = new State();
            cameraState.addOnStartCallback(() => {
                CameraControl.Instance.initCameraControl(cc.v2(40, 0), cc.v2(720, 600));
                self.game_manager.node.emit("openPickBonus", true, subGameKey.indexOf("free") > -1);
                cameraState.setDone();
            });
            pickBonusState.insert(idx++, cameraState);
            pickBonusState.insert(idx++, self.getStopAllSymbolAniState());
            pickBonusState.insert(idx++, self.utility_component.getMovingCameraState(true, 0.8));
            pickBonusState.insert(idx++, self.utility_component.getDelayState(0.5));
            pickBonusState.insert(idx++, self.utility_component.openPopupState(new Popup_Msg(2)));
            pickBonusState.insert(idx++, self.onChangeBGM());

            const preEffectState = new State();
            preEffectState.addOnStartCallback(() => {
                const preMsg = new PICK_PRE_EFFECT();
                preMsg.onInit(() => preEffectState.setDone());
                self.game_manager.node.emit("sendPickBonus", preMsg);
            });
            pickBonusState.insert(idx++, preEffectState);
            pickBonusState.insert(idx++, self.utility_component.getDelayState(0.5));
        }

        return pickBonusState;
    }

    private onRetriggerFreeSpin(): SequencialState {
        const self = this;
        const retriggerState = new SequencialState();
        let idx = 0;
        const freeState = SlotGameResultManager.Instance.getSubGameState("freeSpin");

        if (self.game_manager._freespinTotalCount < freeState.totalCnt) {
            retriggerState.insert(idx++, self.utility_component.onEventControlState(false));
            idx = self.onEventTriggerCameraMoving(retriggerState, idx);
            retriggerState.insert(idx++, self.getStopSingleLineActionState());
            retriggerState.insert(idx++, self.getStopAllSymbolAniState());
            retriggerState.insert(idx++, self.game_manager.bottomUIText.getChangeWinMoneyTextState(0));
            retriggerState.insert(idx++, self.game_manager.bottomUIText.getBottomInfoState(BottomTextType.CustomData, "FREE SPIN RETRIGGERED"));
            retriggerState.insert(idx++, self.onJackpotEffectState(self.PreJackpotType, self.PreJackpotCount, self.PrePot));
            retriggerState.insert(idx++, self.onRetriggerPopup());
        }

        return retriggerState;
    }

    private onRetriggerPopup(): SequencialState {
        const self = this;
        const popupState = new SequencialState();
        let idx = 0;
        const seqState = new SequencialState();

        seqState.addOnStartCallback(() => {
            let tIdx = 0;
            self.onUpdatePotValue();

            const infoState = new State();
            infoState.addOnStartCallback(() => {
                self.game_manager.scheduleOnce(() => {
                    self.game_manager.node.emit("updateFreeSpinInfo");
                }, 0.5);
                infoState.setDone();
            });
            seqState.insert(tIdx, infoState);
            seqState.insert(tIdx++, self.utility_component.openPopupState(new Popup_Msg(1, {
                jackpot: self.PreJackpotType,
                jackpot_count: self.PreJackpotCount,
                pot: self.PrePot
            })));
            seqState.insert(tIdx++, SymbolAnimationController.Instance.getStopAllAnimationSymbolState());
            seqState.insert(tIdx++, self.onUpdateFreeSpinCount());
        });

        popupState.insert(idx++, seqState);
        return popupState;
    }

    private onEndedFreeSpinProcess(): SequencialState {
        const self = this;
        const endState = new SequencialState();
        let idx = 0;

        const mouseDisableState = new State();
        mouseDisableState.addOnStartCallback(() => {
            self.game_manager.setActiveFlagMouseEvent(false);
            mouseDisableState.setDone();
        });
        endState.insert(idx++, mouseDisableState);
        endState.insert(idx++, self.getStopSingleLineActionState());
        endState.insert(idx++, self.getStopAllSymbolAniState());
        endState.insert(idx++, self.utility_component.onEventControlState(false));
        idx = self.onEventTriggerCameraMoving(endState, idx);

        const freeState = SlotGameResultManager.Instance.getSubGameState("freeSpin");
        if (freeState.totalWinningCoin > 0) {
            endState.insert(idx++, self.game_manager.bottomUIText.getChangeWinMoneyTextState(freeState.totalWinningCoin));
            endState.insert(idx++, self.game_manager.bottomUIText.getBottomInfoState(BottomTextType.CustomData, "TOTAL WIN"));
            endState.insert(idx++, self.utility_component.openPopupState(new Popup_Msg(3, {
                reward: freeState.totalWinningCoin,
                multiplier: Math.floor(freeState.totalWinningCoin / freeState.betPerLines),
                spins: freeState.totalCnt
            })));
            endState.insert(idx++, self.onGameEndBigWinState(freeState));
        }

        const aniState = new State();
        aniState.addOnStartCallback(() => {
            self.game_manager.node.emit("onSideCharacterAnimation", SIDE_ANI.TRIGGER);
            aniState.setDone();
        });
        endState.insert(idx++, aniState);
        endState.insert(idx++, self.utility_component.getDelayState(4));

        const potResetState = new State();
        potResetState.addOnStartCallback(() => {
            self.onUpdatePotValue(true);
            self.game_manager.node.emit("onGameRuleText", true);
            potResetState.setDone();
        });
        endState.insert(idx++, potResetState);
        endState.insert(idx++, self.onChangeScrrenState());

        const mouseEnableState = new State();
        mouseEnableState.addOnStartCallback(() => {
            self.game_manager.setActiveFlagMouseEvent(true);
            mouseEnableState.setDone();
        });
        endState.insert(idx++, mouseEnableState);

        return endState;
    }

    private onUpdateFreeSpinCount(): State {
        const self = this;
        const updateState = new State();
        updateState.addOnStartCallback(() => {
            const freeState = SlotGameResultManager.Instance.getSubGameState("freeSpin");
            self.game_manager._freespinTotalCount = freeState.totalCnt;
            self.game_manager.setFreespinExtraInfoByCurrentState();
            updateState.setDone();
        });
        return updateState;
    }

    private onScatterEffectState(): SequencialState {
        const self = this;
        const scatterState = new SequencialState();
        let idx = 0;

        const aniState = new State();
        aniState.addOnStartCallback(() => {
            const historyWin = SlotGameResultManager.Instance.getLastHistoryWindows();
            for (let n = 0; n < historyWin.size; ++n) {
                const winWindow = historyWin.GetWindow(n);
                const reel = self.game_manager.reelMachine.reels[n].getComponent(Reel);
                for (let l = 0; l < winWindow.size; ++l) {
                    const symbolId = winWindow.getSymbol(l);
                    if (symbolId === 61) {
                        SymbolAnimationController.Instance.playAnimationSymbol(n, l, symbolId);
                        reel.hideSymbolInRow(l);
                    }
                }
            }
            SlotSoundController.Instance().playAudio("BT", "FX");
            self.game_manager.node.emit("onSideCharacterAnimation", SIDE_ANI.EXPECT_WIN);
            aniState.setDone();
        });
        scatterState.insert(idx++, aniState);
        scatterState.insert(idx++, self.utility_component.getDelayState(2));

        return scatterState;
    }

    private onJackpotEffectState(jackpotType: number = 0, jackpotCount: number = 0, pot: number = 0): SequencialState {
        const self = this;
        const jackpotState = new SequencialState();
        let idx = 0;

        const aniState = new State();
        aniState.addOnStartCallback(() => {
            const historyWin = SlotGameResultManager.Instance.getLastHistoryWindows();
            const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray();
            for (let n = 0; n < historyWin.size; ++n) {
                const winWindow = historyWin.GetWindow(n);
                const reel = self.game_manager.reelMachine.reels[n].getComponent(Reel);
                for (let r = 0; r < winWindow.size; ++r) {
                    const symbolId = winWindow.getSymbol(r);
                    if (symbolId > 90) {
                        const aniNode = SymbolAnimationController.Instance.playAnimationSymbol(n, r, 9);
                        const prizeSymbol = aniNode.getComponent(PrizeSymbol_MoooreCheddar);
                        if (TSUtility.isValid(prizeSymbol)) {
                            prizeSymbol.SetSymbolInfo(symbolInfo[n][r]);
                        }
                        reel.hideSymbolInRow(r);
                    }
                }
            }
            SlotSoundController.Instance().playAudio("JT", "FX");
            self.game_manager.node.emit("onSideCharacterAnimation", SIDE_ANI.SNICKER);
            aniState.setDone();
        });
        jackpotState.insert(idx++, aniState);
        jackpotState.insert(idx++, self.utility_component.getDelayState(2));
        jackpotState.insert(idx++, self.getStopAllSymbolAniState());

        const infoState = new State();
        infoState.addOnStartCallback(() => {
            self.game_manager.node.emit("stepUpgradeFreeInfo", jackpotType, jackpotCount, pot, () => infoState.setDone());
        });
        jackpotState.insert(idx++, infoState);

        return jackpotState;
    }

    private onCheddaCheeseState(): SequencialState {
        const self = this;
        const cheeseState = new SequencialState();
        const highData = [self.PrePot, self.PreJackpotType, self.PreJackpotValue, self.PreJackpotCount];
        let idx = 0;

        cheeseState.insert(idx++, self.utility_component.getDelayState(0.5));
        cheeseState.insert(idx++, self.getStopSingleLineActionState());
        cheeseState.insert(idx++, self.getStopAllSymbolAniState());

        const processReel = (reelIdx: number) => {
            const reel = self.game_manager.reelMachine.reels[reelIdx].getComponent(Reel);
            const processRow = (rowIdx: number) => {
                const symbol = reel.getSymbol(rowIdx).getComponent(Symbol);
                if (symbol.symbolId === 61) {
                    const aniState = new State();
                    aniState.addOnStartCallback(() => {
                        SlotSoundController.Instance().playAudio("HSC", "FX");
                        const aniNode = SymbolAnimationController.Instance.playAnimationSymbol(reelIdx, rowIdx, 361);
                        const prizeSymbol = aniNode.getComponent(PrizeSymbol_MoooreCheddar);
                        if (TSUtility.isValid(prizeSymbol)) {
                            prizeSymbol.SetSymbolInfoByHighSymbol(highData);
                        }
                        reel.hideSymbolInRow(rowIdx);

                        aniNode.getComponentInChildren(cc.Animation).once(cc.Animation.EventType.FINISHED, () => {
                            reel.changeSymbol(rowIdx, 131);
                            const newSymbol = reel.getSymbol(rowIdx).getComponent(PrizeSymbol_MoooreCheddar);
                            if (TSUtility.isValid(newSymbol)) {
                                newSymbol.SetSymbolInfoByHighSymbol(highData);
                            }
                            SymbolAnimationController.Instance.releaseAnimationSymbol_byKey(reelIdx, rowIdx);
                        });
                        aniState.setDone();
                    });
                    cheeseState.insert(idx++, aniState);
                    cheeseState.insert(idx++, self.utility_component.getDelayState(0.8));

                    const collectState = new State();
                    collectState.addOnStartCallback(() => {
                        self.game_manager.node.emit("onCollectMove", reelIdx, rowIdx, highData[0], () => collectState.setDone());
                    });

                    if (highData[2] > 0) {
                        cheeseState.insert(idx++, self.onPlayPotJackpot(highData, collectState));
                    } else {
                        cheeseState.insert(idx++, collectState);
                    }
                    cheeseState.insert(idx++, self.utility_component.getDelayState(0.5));
                }
            };

            for (let c = 0; c < 3; ++c) processRow(c);
        };

        for (let l = 0; l < self.game_manager.reelMachine.reels.length; ++l) processReel(l);

        return cheeseState;
    }

    private onChangeScrrenState(): SequencialState {
        const screenState = new SequencialState();
        let idx = 0;
        screenState.insert(idx++, this.onChangeUI_State());
        screenState.insert(idx++, this.onChangeBGM());
        screenState.insert(idx++, this.utility_component.getDelayState(0.5));
        return screenState;
    }

    private onGameEndBigWinState(subGameState: any, winMoney: number = -1, isNormal: boolean = true): SequencialState {
        const bigWinState = new SequencialState();
        let idx = 0;
        const actualWin = winMoney > 0 ? winMoney : subGameState.totalWinningCoin;

        if (actualWin > 0) {
            let delay = 0.8;
            let options = this.utility_component.option_skip | this.utility_component.option_ignore_explodecoin | this.utility_component.option_ignore_unlock;
            if (!isNormal) {
                options |= this.utility_component.option_bigwin_up_screen;
                delay = 0;
            }
            bigWinState.insert(idx++, this.utility_component.getWinMoneyState(options, () => actualWin, null, delay));
        }

        return bigWinState;
    }

    private onCheckRandomAnimation(isCheckWin: boolean = true): SequencialState {
        const self = this;
        const randomState = new SequencialState();
        const historyWin = SlotGameResultManager.Instance.getLastHistoryWindows();

        let scatterCount = 0;
        let highSymbolCount = 0;
        for (let l = 0; l < 4; ++l) {
            const winWindow = historyWin.GetWindow(l);
            for (let s = 0; s < 3; ++s) {
                const symbolId = winWindow.getSymbol(s);
                if (l < 3 && symbolId === 61) scatterCount++;
                else if (Math.floor(0.1 * symbolId) === 9) highSymbolCount++;
            }
        }

        if (scatterCount < 2 && highSymbolCount < 4) {
            const rand = 100 * Math.random();
            if (rand < 20) {
                const expectState = new State();
                expectState.addOnStartCallback(() => {
                    self.game_manager.node.emit("onPlayCharacterAnimationWhileSpinning", SIDE_ANI.EXPECT_FEATURE);
                    expectState.setDone();
                });
                randomState.insert(0, expectState);
            } else if (isCheckWin && (100 * Math.random()) < 50) {
                const winState = new State();
                winState.addOnStartCallback(() => {
                    self.game_manager.node.emit("onPlayCharacterAnimationWhileSpinning", SIDE_ANI.EXPECT_WIN);
                    winState.setDone();
                });
                randomState.insert(0, winState);
            }
        }

        return randomState;
    }

    checkIncludeCellInfo(cellList: Cell[], cell: Cell): boolean {
        return cellList.some(c => c.row === cell.row && c.col === cell.col);
    }

    private onCalculateHighSymbolInFreeSpin(): SequencialState {
        const self = this;
        const highSymbolState = new SequencialState();
        const historyWin = SlotGameResultManager.Instance.getLastHistoryWindows();
        const spinResult = SlotGameResultManager.Instance.getSpinResult();

        if (spinResult.subGamePotResults.length > 0) {
            const highData = [self.PrePot, self.PreJackpotType, self.PreJackpotValue, self.PreJackpotCount];
            let idx = 0;

            highSymbolState.insert(idx++, self.utility_component.onEventControlState(false));
            idx = self.onEventTriggerCameraMoving(highSymbolState, idx);
            highSymbolState.insert(idx++, self.getStopSingleLineActionState());
            highSymbolState.insert(idx++, self.getStopAllSymbolAniState());

            const processReel = (reelIdx: number) => {
                const winWindow = historyWin.GetWindow(reelIdx);
                const reel = self.game_manager.reelMachine.reels[reelIdx].getComponent(Reel);
                const processRow = (rowIdx: number) => {
                    if (winWindow.getSymbol(rowIdx) === 31) {
                        const aniState = new State();
                        aniState.addOnStartCallback(() => {
                            SlotSoundController.Instance().playAudio("HST", "FX");
                            const aniNode = SymbolAnimationController.Instance.playAnimationSymbol(reelIdx, rowIdx, 331);
                            const prizeSymbol = aniNode.getComponent(PrizeSymbol_MoooreCheddar);
                            if (TSUtility.isValid(prizeSymbol)) {
                                prizeSymbol.SetSymbolInfoByHighSymbol(highData);
                            }
                            reel.hideSymbolInRow(rowIdx);

                            aniNode.getComponentInChildren(cc.Animation).once(cc.Animation.EventType.FINISHED, () => {
                                reel.changeSymbol(rowIdx, 131);
                                const newSymbol = reel.getSymbol(rowIdx).getComponent(PrizeSymbol_MoooreCheddar);
                                if (TSUtility.isValid(newSymbol)) {
                                    newSymbol.SetSymbolInfoByHighSymbol(highData);
                                }
                                SymbolAnimationController.Instance.releaseAnimationSymbol_byKey(reelIdx, rowIdx);
                            });
                            aniState.setDone();
                        });
                        highSymbolState.insert(idx++, aniState);
                        highSymbolState.insert(idx++, self.utility_component.getDelayState(0.75));

                        const collectState = new State();
                        collectState.addOnStartCallback(() => {
                            self.game_manager.node.emit("onCollectMove", reelIdx, rowIdx, highData[0], () => collectState.setDone());
                        });

                        if (highData[2] > 0) {
                            highSymbolState.insert(idx++, self.onPlayPotJackpot(highData, collectState));
                            highSymbolState.insert(idx++, self.utility_component.getDelayState(0.5));
                        } else {
                            highSymbolState.insert(idx++, collectState);
                        }
                    }
                };

                for (let p = 0; p < winWindow.size; ++p) processRow(p);
            };

            for (let r = 0; r < historyWin.size; ++r) processReel(r);

            if (highData[2] === 0) {
                highSymbolState.insert(idx++, self.utility_component.getDelayState(1.5));
            }

            const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
            const winType = SlotGameResultManager.Instance.getWinType(totalWin);
            highSymbolState.insert(idx++, self.utility_component.onEventControlState(winType ===SlotGameResultManager.WINSTATE_NORMAL));
        }

        return highSymbolState;
    }

    private onPlayPotJackpot(jackpotData: number[], collectState: State): SequencialState {
        const self = this;
        const potJackpotState = new SequencialState();
        let idx = 0;
        const jackpotTypes = ["MINI", "MINOR", "MAJOR", "GRAND"];
        const seqState = new SequencialState();

        seqState.addOnStartCallback(() => {
            const jackpotMsg = new JACKPOT_MSG();
            jackpotMsg.onInit(true, jackpotTypes[jackpotData[1]].toLowerCase(), jackpotData[1], jackpotData[2]);
            self.game_manager.node.emit("onJackpotDisplayFunction", jackpotMsg);
        });
        seqState.insert(0, collectState);
        seqState.insert(1, self.utility_component.getDelayState(0.5));

        const textState = new State();
        textState.addOnStartCallback(() => {
            const multiplierText = jackpotData[3] > 1 ? jackpotData[3] + " " : "";
            const jackpotText = `${multiplierText}${jackpotTypes[jackpotData[1]]} JACKPOT ${CurrencyFormatHelper.formatNumber(jackpotData[2] * jackpotData[3])}`;
            SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, jackpotText);
            self.game_manager.node.emit("onRollupWinMoney", jackpotData[2] * jackpotData[3]);
            textState.setDone();
        });
        seqState.insert(2, textState);
        seqState.insert(3, self.utility_component.openPopupState(new Popup_Msg(5, {
            jackpot: jackpotData[1],
            reward: jackpotData[2],
            multiplier: jackpotData[3],
            total_reward: jackpotData[2] * jackpotData[3],
            add_auto_time: jackpotData[3] > 1 ? 2.5 : 0
        })));

        seqState.addOnEndCallback(() => {
            const jackpotMsg = new JACKPOT_MSG();
            jackpotMsg.onInit(false, jackpotTypes[jackpotData[1]].toLowerCase(), jackpotData[1], jackpotData[2]);
            self.game_manager.node.emit("onJackpotDisplayFunction", jackpotMsg);
            SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "WIN");
        });

        potJackpotState.insert(idx++, seqState);
        return potJackpotState;
    }

    checkSkipSingleLineEffect(): boolean {
        let isSkip = SlotGameResultManager.Instance.getWinType() ===SlotGameResultManager.WINSTATE_NORMAL;
        if (isSkip) {
            const autoSpin = SlotReelSpinStateManager.Instance.getAutospinMode();
            const freeSpin = SlotReelSpinStateManager.Instance.getFreespinMode();
            const scatterWin = SlotGameResultManager.Instance.getWinningCoinBySymbolId(61) > 0;
            isSkip = autoSpin || freeSpin || scatterWin;
        }
        return isSkip;
    }

    private onCameraZoomInShake(isShake: boolean = false): SequencialState {
        return new SequencialState();
    }

    private onChangeUI_State(gameMode: string = "base"): State {
        const self = this;
        const uiState = new State();
        uiState.addOnStartCallback(() => {
            self.game_manager.node.emit("changeGameModeUI", gameMode);
            uiState.setDone();
        });
        return uiState;
    }

    private onChangeBGM(): State {
        const self = this;
        const bgmState = new State();
        bgmState.addOnStartCallback(() => {
            self.game_manager.playMainBgm();
            bgmState.setDone();
        });
        return bgmState;
    }

    private onEventTriggerCameraMoving(state: SequencialState, idx: number): number {
        const self = this;
        const cameraState = new State();
        cameraState.addOnStartCallback(() => {
            if (CameraControl.Instance.eStateOfCameraPosition === 1 || !CameraControl.Instance.isOriginalPos()) {
                self.utility_component.getMovingCameraState(false, 0.8).onStart();
                self.game_manager.scheduleOnce(() => cameraState.setDone(), 0.8);
            } else {
                cameraState.setDone();
            }
        });
        state.insert(idx++, cameraState);
        return idx;
    }

    private playFreeSpinExpectEffect(): SequencialState {
        const self = this;
        const expectState = new SequencialState();
        const concurrentState = new ConcurrentState();
        const infSpinState = this.game_manager.reelMachine.getInfinitiSpinState();
        const seqState = new SequencialState();
        let idx = 0;

        seqState.insert(idx++, self.utility_component.onEventControlState(false));
        idx = self.onEventTriggerCameraMoving(seqState, idx);

        const totalBet = SlotGameRuleManager.Instance.getTotalBet();
        this.addPrePot(totalBet);

        const infoState = new State();
        infoState.addOnStartCallback(() => {
            self.game_manager.scheduleOnce(() => {
                self.game_manager.node.emit("updateFreeSpinInfo");
            }, 0.5);
            infoState.setDone();
        });
        seqState.insert(idx++, infoState);
        seqState.insert(idx++, self.utility_component.openPopupState(new Popup_Msg(6, {
            after: {
                jackpot: self.PreJackpotType,
                jackpot_count: self.PreJackpotCount,
                pot: self.PrePot
            },
            spins: self.game_manager._freespinTotalCount - self.game_manager._freespinPastCount
        })));
        seqState.insert(idx++, self.utility_component.getDelayState(0.5));
        seqState.addOnEndCallback(() => infSpinState.setDoneAllSubStates());

        concurrentState.insert(infSpinState);
        concurrentState.insert(seqState);
        expectState.insert(0, concurrentState);

        return expectState;
    }

    setCheddaCheese(): void {
        const freeState = SlotGameResultManager.Instance.getSubGameState("freeSpin");
        if (TSUtility.isValid(freeState) && TSUtility.isValid(freeState.pots.beforefreeSpinPot)) {
            this.chedda_cheese = 3 * freeState.pots.beforefreeSpinPot.pot;
        } else {
            this.chedda_cheese = 0;
        }
    }

    private onCalculatePotValue(jackpotData: number[]): number {
        return jackpotData[0] + jackpotData[2] * jackpotData[3];
    }

    // ================= 父类方法覆盖 =================
    public getStopSingleLineActionState(): State {
        const stopState = new State();
        stopState.addOnStartCallback(() => {
            this.stopSingleLineAction();
            stopState.setDone();
        });
        return stopState;
    }

    stopSingleLineAction(): void {
        if (this.actionSingleLine) {
            SlotManager.Instance.node.stopAction(this.actionSingleLine);
            this.actionSingleLine = null;
        }
    }
}