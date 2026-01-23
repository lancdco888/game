const { ccclass, property } = cc._decorator;
import SlotDataDefine from "../slot_common/SlotDataDefine";
import SlotGameRuleManager, { PayRuleHelper, SlotWindows } from "./SlotGameRuleManager";

@ccclass
export default class SlotGameResultManager extends cc.Component {
    // ===================== 静态常量 =====================
    public static readonly WINSTATE_NORMAL = "winstate_normal";
    public static readonly WINSTATE_EPIC = "winstate_epic";
    public static readonly WINSTATE_BIG = "winstate_big";
    public static readonly WINSTATE_MEGA = "winstate_mega";
    public static readonly WINSTATE_ULTRA = "winstate_ultra";

    // ===================== 单例模式 =====================
    private static _instance: SlotGameResultManager = null;
    public static get Instance(): SlotGameResultManager {
        if (!this._instance) {
            this._instance = new SlotGameResultManager();
        }
        return this._instance;
    }

    // ===================== 私有成员变量 =====================
    public _gameResult: GameResult = null;
    private _winMoneyInFreespinMode: number = 0;
    private _winMoneyInJackpotMode: number = 0;
    private _winMoneyInLinkedJackpotMode: number = 0;
    private _winMoneyInRespinMode: number = 0;

    // ===================== 访问器 =====================
    get winMoneyInFreespinMode(): number { return this._winMoneyInFreespinMode; }
    set winMoneyInFreespinMode(val: number) { this._winMoneyInFreespinMode = val; }

    get winMoneyInJackpotMode(): number { return this._winMoneyInJackpotMode; }
    set winMoneyInJackpotMode(val: number) { this._winMoneyInJackpotMode = val; }

    get winMoneyInLinkedJackpotMode(): number { return this._winMoneyInLinkedJackpotMode; }
    set winMoneyInLinkedJackpotMode(val: number) { this._winMoneyInLinkedJackpotMode = val; }

    get winMoneyInRespinMode(): number { return this._winMoneyInRespinMode; }
    set winMoneyInRespinMode(val: number) { this._winMoneyInRespinMode = val; }

    // ===================== 生命周期 =====================
    onLoad() { }

    // ===================== 核心业务方法 =====================
    setGameResult(data: any): void {
        this._gameResult = new GameResult();
        this._gameResult.setGameResult(data);
    }

    resetGameResult(): void { }

    getWinningCoin(): number {
        return this._gameResult?.winningCoin || 0;
    }

    getWinningCoinBySymbolId(symbolId: number): number {
        let totalWin = 0;
        if (!this._gameResult?.spinResult?.payOutResults) return totalWin;

        for (let i = 0; i < this._gameResult.spinResult.payOutResults.length; ++i) {
            const payoutResult = this._gameResult.spinResult.payOutResults[i];
            if (payoutResult.payOut.symbols.indexOf(symbolId) !== -1) {
                let betValue = 0;
                if (payoutResult.payOut.prizeUnit === "BetPerLine") {
                    betValue = SlotGameRuleManager.Instance.getCurrentBetPerLine();
                } else if (payoutResult.payOut.prizeUnit === "TotalBet") {
                    betValue = SlotGameRuleManager.Instance.getTotalBet();
                }

                if (payoutResult.payOut.prizeType === "Multiplier") {
                    if (cc.isValid(payoutResult.wildMultiplier) && payoutResult.wildMultiplier !== 0) {
                        totalWin += betValue * payoutResult.payOut.multiplier * payoutResult.wildMultiplier;
                    } else {
                        totalWin += betValue * payoutResult.payOut.multiplier;
                    }
                }
            }
        }
        return totalWin;
    }

    getProbResults(): any {
        if (this._gameResult?.spinResult?.probResults) {
            return this._gameResult.spinResult.probResults;
        } else {
            cc.error("this._currentGameResult.spinResult.probResults not found");
            return null;
        }
    }

    getReelStopWindows(): any {
        return this._gameResult?.spinResult?.window;
    }

    getReelStopWindowsInMultipleResults(idx: number): any {
        return this._gameResult?.spinResults?.[idx]?.window;
    }

    getCasinoJackpotResult(): any {
        return this._gameResult?.spinResult?.casinoJackpotResult;
    }

    getVisibleSlotWindows(): SlotWindows {
        let visibleWindow = null;
        if (cc.isValid(this._gameResult) && cc.isValid(this._gameResult.spinResult.window)) {
            visibleWindow = new SlotWindows(SlotGameRuleManager.Instance._slotWindows.sizeInfo);
            for (let i = 0; i < visibleWindow.size; ++i) {
                const offset = (this._gameResult.spinResult.window.GetWindow(i).size - visibleWindow.GetWindow(i).size) / 2;
                for (let j = 0; j < visibleWindow.GetWindow(i).size; ++j) {
                    visibleWindow.GetWindow(i).setSymbol(j, this._gameResult.spinResult.window.GetWindow(i).getSymbol(j + offset));
                }
            }
        }
        return visibleWindow;
    }

    getHistoryWindows(): any[] {
        return this._gameResult?.spinResult?.windows || [];
    }

    getHistoryWindow(idx: number): any {
        let windowData = null;
        if (cc.isValid(this._gameResult?.spinResult?.windows) && this._gameResult.spinResult.windows.length > idx) {
            windowData = this._gameResult.spinResult.windows[idx];
        }
        return windowData;
    }

    getPayOutWindow(): any {
        let windowData = null;
        const winIdx = this._gameResult?.spinResult?.payOutWindowIndex;
        if (winIdx !== -1 && cc.isValid(this._gameResult?.spinResult?.windows) && this._gameResult.spinResult.windows.length > winIdx) {
            windowData = this._gameResult.spinResult.windows[winIdx];
        }
        return windowData;
    }

    getLastHistoryWindows(): any {
        let windowData = null;
        if (cc.isValid(this._gameResult?.spinResult?.windows)) {
            windowData = this._gameResult.spinResult.windows[this._gameResult.spinResult.windows.length - 1];
        }
        return windowData;
    }

    changeLastHistoryWindowsSymbol(targetSymbols: number[], replaceSymbols: number[]): void {
        if (!cc.isValid(this._gameResult?.spinResult?.windows)) return;

        const lastWindow = this._gameResult.spinResult.windows[this._gameResult.spinResult.windows.length - 1];
        for (let i = 0; i < lastWindow.size; ++i) {
            const reelWindow = lastWindow.GetWindow(i);
            for (let j = 0; j < reelWindow.size; ++j) {
                if (targetSymbols.indexOf(reelWindow.getSymbol(j)) !== -1) {
                    const randIdx = Math.floor(Math.random() * replaceSymbols.length);
                    reelWindow.setSymbol(j, replaceSymbols[randIdx]);
                }
            }
        }
    }

    isSymbolExistInHistoryWindows(col: number, row: number, symbolId: number): boolean {
        if (!cc.isValid(this._gameResult?.spinResult?.windows)) return false;

        for (let i = 0; i < this._gameResult.spinResult.windows.length; ++i) {
            if (this._gameResult.spinResult.windows[i].GetWindow(col).getSymbol(row) === symbolId) {
                return true;
            }
        }
        return false;
    }

    getResultSymbolInfoArray(): ResultSymbolInfo[][] {
        return this._gameResult?.spinResult?.symbolInfoWindow || [];
    }

    getLockNRollResults(): LockNRollResult[] {
        const symbolInfoArr = this.getResultSymbolInfoArray();
        if (!cc.isValid(symbolInfoArr)) return this._gameResult.spinResult.lockNRollResults;

        for (let x = 0; x < this._gameResult.spinResult.symbolInfoWindow.length; ++x) {
            for (let y = 0; y < this._gameResult.spinResult.symbolInfoWindow[x].length; ++y) {
                const info = symbolInfoArr[x][y];
                if (cc.isValid(info) && info.type !== "") {
                    if (this.isCellInLockNRollResults(x, y) === 0) {
                        const lockNRollResult = new LockNRollResult();
                        lockNRollResult.winningCellX = x;
                        lockNRollResult.winningCellY = y;
                        lockNRollResult.jackpotKey = info.key;
                        lockNRollResult.prizeType = info.type;

                        if (info.prizeUnit === "BetPerLine") {
                            const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
                            const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
                            lockNRollResult.winningCoin = info.prize * subGameState.betPerLines;
                        } else {
                            lockNRollResult.winningCoin = info.prize;
                        }
                        this.insertLockNRollResult(lockNRollResult);
                    }
                }
            }
        }
        return this._gameResult.spinResult.lockNRollResults;
    }

    isCellInLockNRollResults(x: number, y: number): number {
        for (let i = 0; i < this._gameResult.spinResult.lockNRollResults.length; ++i) {
            const result = this._gameResult.spinResult.lockNRollResults[i];
            if (result.winningCellX === x && result.winningCellY === y) {
                return 1;
            }
        }
        return 0;
    }

    insertLockNRollResult(result: LockNRollResult): void {
        let isInserted = false;
        for (let i = 0; i < this._gameResult.spinResult.lockNRollResults.length; ++i) {
            const item = this._gameResult.spinResult.lockNRollResults[i];
            if (item.winningCellX > result.winningCellX || (item.winningCellX === result.winningCellX && item.winningCellY >= result.winningCellY)) {
                this._gameResult.spinResult.lockNRollResults.splice(i, 0, result);
                isInserted = true;
                break;
            }
        }
        if (!isInserted) {
            this._gameResult.spinResult.lockNRollResults.push(result);
        }
    }

    getSymbolCellListInVisibleSlotWindows(symbolId: number): Cell[] {
        const cellList: Cell[] = [];
        const visibleWindow = this.getVisibleSlotWindows();
        if (!cc.isValid(visibleWindow)) return cellList;

        for (let i = 0; i < visibleWindow.size; ++i) {
            const reelWindow = visibleWindow.GetWindow(i);
            for (let j = 0; j < reelWindow.size; ++j) {
                if (reelWindow.getSymbol(j) === symbolId) {
                    cellList.push(new Cell(i, j));
                }
            }
        }
        return cellList;
    }

    getSymbolCellListInWindowParam(symbolId: number, windowParam: any): Cell[] {
        const cellList: Cell[] = [];
        const targetWindow = windowParam;
        if (!cc.isValid(targetWindow)) return cellList;

        for (let i = 0; i < targetWindow.size; ++i) {
            const reelWindow = targetWindow.GetWindow(i);
            for (let j = 0; j < reelWindow.size; ++j) {
                if (reelWindow.getSymbol(j) === symbolId) {
                    cellList.push(new Cell(i, j));
                }
            }
        }
        return cellList;
    }

    getSymbolCellListInVisibleSlotWindowsWithPayline(symbolId: number): Cell[] {
        const cellList: Cell[] = [];
        const isWinCell = [
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false],
            [false, false, false]
        ];
        const visibleWindow = this.getVisibleSlotWindows();
        if (!cc.isValid(visibleWindow)) return cellList;

        const paylines = SlotGameRuleManager.Instance.getPaylines().paylines;
        for (let i = 0; i < paylines.length; ++i) {
            const rows = paylines[i].getAllRows();
            let isWin = true;
            for (let j = 0; j < rows.length; ++j) {
                if (visibleWindow.GetWindow(j).getSymbol(rows[j]) !== symbolId) {
                    isWin = false;
                    if (j >= 3) {
                        for (let k = 0; k < j; ++k) {
                            isWinCell[k][rows[k]] = true;
                        }
                    }
                    break;
                }
                if (visibleWindow.GetWindow(j).getSymbol(rows[j]) === symbolId && j === 4) {
                    for (let k = 0; k < 5; ++k) {
                        isWinCell[k][rows[k]] = true;
                    }
                }
            }
        }

        for (let i = 0; i < 5; ++i) {
            for (let j = 0; j < 3; ++j) {
                if (isWinCell[i][j]) {
                    cellList.push(new Cell(i, j));
                }
            }
        }
        return cellList;
    }

    getTotalWinMoney(): number {
        return this._gameResult?.winningCoin || 0;
    }

    getTotalSubGamePotResultsMoney(): number {
        let total = 0;
        const potResults = this._gameResult?.spinResult?.subGamePotResults || [];
        for (let i = 0; i < potResults.length; ++i) {
            const pot = potResults[i];
            if (cc.isValid(pot)) total += pot.winningCoin;
        }
        return total;
    }

    getSubGamePotResults(): SubGamePotResult[] {
        return this._gameResult?.spinResult?.subGamePotResults || [];
    }

    getWinType(customWin?: number): string {
        const totalBet = SlotGameRuleManager.Instance.getTotalBet();
        let winCoin = this.getTotalWinMoney();
        if (cc.isValid(customWin)) winCoin = customWin;

        // if (winCoin >= 30 * totalBet) return SlotGameResultManager.WINSTATE_ULTRA;
        // if (winCoin >= 20 * totalBet) return SlotGameResultManager.WINSTATE_MEGA;
        // if (winCoin >= 10 * totalBet) return SlotGameResultManager.WINSTATE_BIG;
        return SlotGameResultManager.WINSTATE_NORMAL;
    }

    getWinTypeByTotalBet(totalBet: number, customWin?: number): string {
        let winCoin = this.getTotalWinMoney();
        if (cc.isValid(customWin)) winCoin = customWin;

        // if (winCoin >= 30 * totalBet) return SlotGameResultManager.WINSTATE_ULTRA;
        // if (winCoin >= 20 * totalBet) return SlotGameResultManager.WINSTATE_MEGA;
        // if (winCoin >= 10 * totalBet) return SlotGameResultManager.WINSTATE_BIG;
        return SlotGameResultManager.WINSTATE_NORMAL;
    }

    getSubGameKeyOfCurrentGameResult(): string {
        if (!cc.isValid(this._gameResult)) return "base";

        const spinResultKeys = Object.keys(this._gameResult.spinResults || {});
        if (spinResultKeys.length > 0 && cc.isValid(this._gameResult.spinResults[spinResultKeys[0]].subGameKey)) {
            return this._gameResult.spinResults[spinResultKeys[0]].subGameKey === "" ? "base" : this._gameResult.spinResults[spinResultKeys[0]].subGameKey;
        } else if (cc.isValid(this._gameResult.spinResult.subGameKey)) {
            return this._gameResult.spinResult.subGameKey === "" ? "base" : this._gameResult.spinResult.subGameKey;
        }
        return "base";
    }

    getMachineID(): string {
        return this._gameResult?.slotState?.machineID || "";
    }

    getSpinSessionKey(): number {
        return this._gameResult?.spinSessionKey || 0;
    }

    getNextSubGameKey(): string {
        if (!cc.isValid(this._gameResult)) return "base";
        return this._gameResult.slotState.nextSubGameKey === "" ? "base" : this._gameResult.slotState.nextSubGameKey;
    }

    isBaseGameNextSubGameKey(): boolean {
        return this.getNextSubGameKey() === "base";
    }

    getSpinResult(): SpinResult {
        return this._gameResult?.spinResult;
    }

    getSubGameState(key: string): SubGameState {
        return this._gameResult?.slotState?.getSubGameState(key) || null;
    }

    getSubGameStateByMapKey(key: string): SubGameState {
        return this._gameResult?.slotState?.getSubGameStateByMapKey(key) || null;
    }

    GetWinResult(slotWindow: any, payRule: any, winInfoResult: WinInfoResult): WinInfoResult {
        for (let i = 0; i < payRule.payList.length; ++i) {
            const payItem = payRule.payList[i];
            if (PayRuleHelper.isWinTriggerOnPayLine(payItem.winTriggerRule)) {
                const paylines = SlotGameRuleManager.Instance.getPaylines().paylines;
                for (let j = 0; j < paylines.length; ++j) {
                    const payline = paylines[j];
                    const winInfo = PayRuleChecker.getWinInfoWithPayLine(slotWindow, payItem, payline);
                    if (cc.isValid(winInfo) && winInfoResult.setWinInfo(winInfo)) {
                        cc.log("matching " + j + "1 " + JSON.stringify(payItem) + " " + JSON.stringify(payline));
                    }
                }
            } else {
                const winInfo = PayRuleChecker.getWinInfo(slotWindow, payItem);
                if (cc.isValid(winInfo)) {
                    winInfoResult.setWinInfo(winInfo);
                    cc.log("matching " + JSON.stringify(payItem));
                }
            }
        }
        return winInfoResult;
    }

    isEnterFreespinMode(): boolean {
        return false;
    }

    getTotalWinSymbolList(): number[] {
        const symbolList: number[] = [];
        const cellList: Cell[] = [];
        const payoutResults = this._gameResult?.spinResult?.payOutResults || [];

        for (let i = 0; i < payoutResults.length; ++i) {
            const payout = payoutResults[i];
            payout.ways;
            for (let j = 0; j < payout.winningCell.length; ++j) {
                cellList.push(new Cell(payout.winningCell[j][1], payout.winningCell[j][0]));
            }
        }

        const lastWindow = SlotGameResultManager.Instance.getLastHistoryWindows();
        for (let i = 0; i < cellList.length; ++i) {
            const cell = cellList[i];
            const symbol = lastWindow.GetWindow(cell.col).getSymbol(cell.row);
            if (symbolList.indexOf(symbol) === -1) {
                symbolList.push(symbol);
            }
        }
        return symbolList;
    }

    setSlotInfo(data: any): void {
        this._gameResult = new GameResult();
        this._gameResult.setGameResult(data);

        const freeSpinState = this.getSubGameState("freeSpin");
        if (cc.isValid(freeSpinState)) this._winMoneyInFreespinMode = freeSpinState.totalWinningCoin;

        const jackpotState = this.getSubGameState("jackpot");
        if (cc.isValid(jackpotState)) this._winMoneyInJackpotMode = jackpotState.totalWinningCoin;

        const subGameKey = this._gameResult.spinResult.subGameKey;
        if (subGameKey === "lockBRoll") {
            const lockNRollState = this.getSubGameState("lockNRoll");
            if (cc.isValid(lockNRollState)) this._winMoneyInLinkedJackpotMode = lockNRollState.totalWinningCoin;
        } else if (subGameKey === "lockNRoll_fromchoose") {
            const lockNRollState = this.getSubGameState("lockNRoll_fromchoose");
            if (cc.isValid(lockNRollState)) this._winMoneyInLinkedJackpotMode = lockNRollState.totalWinningCoin;
        } else if (subGameKey === "lockNRoll_infreespin") {
            const lockNRollState = this.getSubGameState("lockNRoll_infreespin");
            if (cc.isValid(lockNRollState)) this._winMoneyInLinkedJackpotMode = lockNRollState.totalWinningCoin;
        } else if (subGameKey === "respin") {
            const respinState = this.getSubGameState("respin");
            if (cc.isValid(respinState)) {
                this._winMoneyInRespinMode = cc.isValid(respinState.totalWinningCoin) ? respinState.totalWinningCoin : 0;
            } else {
                this._winMoneyInRespinMode = 0;
            }
        }
    }
}

// ===================== 所有独立实体类/工具类 (完整保留原逻辑) =====================
export class WinInfo {
    public winPayInfo: any;
    public winPayTable: any;
    public payLine: any;
    public winSymbols: Cell[];

    constructor(winPayInfo: any, winPayTable: any, payLine: any, winSymbols: Cell[]) {
        this.winPayInfo = winPayInfo;
        this.winPayTable = winPayTable;
        this.payLine = payLine;
        this.winSymbols = winSymbols;
    }

    public isUsePayLine(): boolean {
        return cc.isValid(this.payLine);
    }
}

export class WinInfoResult {
    public winInfosWithPayLine: { [key: number]: WinInfo } = {};
    public winInfos: WinInfo[] = [];
    public totalBetMoney: number = 0;

    public setWinInfo(winInfo: WinInfo): boolean {
        if (winInfo.isUsePayLine()) {
            const lineNum = winInfo.payLine.lineNum;
            if (this.winInfosWithPayLine[lineNum]) {
                if (this.winInfosWithPayLine[lineNum].winPayTable.lineBetWinPrize < winInfo.winPayTable.lineBetWinPrize) {
                    this.winInfosWithPayLine[lineNum] = winInfo;
                }
                return false;
            } else {
                this.winInfosWithPayLine[lineNum] = winInfo;
                return true;
            }
        } else {
            this.winInfos.push(winInfo);
            return true;
        }
    }

    public hasBonusGame(): boolean {
        for (let i = 0; i < this.winInfos.length; ++i) {
            if (this.winInfos[i].winPayTable.resultWinPrize) return true;
        }
        return false;
    }

    public getBonusGame(): string {
        for (let i = 0; i < this.winInfos.length; ++i) {
            const info = this.winInfos[i];
            if (info.winPayTable.resultWinPrize) {
                cc.log(info.winPayTable.resultWinPrize);
                return info.winPayTable.resultWinPrize;
            }
        }
        return "";
    }
}

export class Cell {
    public row: number = 0;
    public col: number = 0;

    constructor(col: number, row: number) {
        this.col = col;
        this.row = row;
    }

    public isEqual(cell: Cell): boolean {
        return cell.col === this.col && cell.row === this.row;
    }
}

export class PayRuleChecker {
    public static getWinInfoWithPayLine(slotWindow: any, payRule: any, payLine: any): WinInfo {
        switch (payRule.winTriggerRule) {
            case PayRuleHelper.LeftToRight:
                return this.getWinInfoLeftToRight(slotWindow, payRule, payLine);
            case PayRuleHelper.onPayline:
                return this.getWinInfoOnPayline(slotWindow, payRule, payLine);
            case PayRuleHelper.AnyPayline:
                return this.getWinInfoAnyPayline(slotWindow, payRule, payLine);
            default:
                return null;
        }
    }

    public static getWinInfo(slotWindow: any, payRule: any): WinInfo {
        switch (payRule.winTriggerRule) {
            case PayRuleHelper.onAnyScreen:
            case PayRuleHelper.onScreen:
                return this.getWinInfoOnAnyScreen(slotWindow, payRule);
            default:
                return null;
        }
    }

    public static getWinningCells(payoutResult: any): Cell[] {
        const cellList: Cell[] = [];
        const winCells = payoutResult.winningCell;
        for (let i = 0; i < winCells.length; ++i) {
            cellList.push(new Cell(winCells[i][1], winCells[i][0]));
        }
        return cellList;
    }

    public static getWinInfoAnyPayline(slotWindow: any, payRule: any, payLine: any): WinInfo {
        const cellList: Cell[] = [];
        for (let i = 0; i < slotWindow.size; ++i) {
            const reelWin = slotWindow.GetWindow(i);
            const row = payLine.getRowByCol(i);
            if (payRule.symbols.indexOf(reelWin.getSymbol(row)) !== -1) {
                cellList.push(new Cell(i, row));
            }
        }
        return new WinInfo(payRule, null, payLine, cellList);
    }

    public static getWinInfoLeftToRight(slotWindow: any, payRule: any, payLine: any): WinInfo {
        const cellList: Cell[] = [];
        for (let i = 0; i < slotWindow.size; ++i) {
            const row = payLine.getRowByCol(i);
            cellList.push(new Cell(i, row));
        }
        return new WinInfo(payRule, null, payLine, cellList);
    }

    public static getWinInfoOnPayline(slotWindow: any, payRule: any, payLine: any): WinInfo {
        const cellList: Cell[] = [];
        for (let i = 0; i < slotWindow.size; ++i) {
            const reelWin = slotWindow.GetWindow(i);
            const row = payLine.getRowByCol(i);
            if (payRule.symbols.indexOf(reelWin.getSymbol(row)) !== -1) {
                cellList.push(new Cell(i, row));
            }
        }
        return new WinInfo(payRule, null, payLine, cellList);
    }

    public static getWinInfoOnAnyScreen(slotWindow: any, payRule: any): WinInfo {
        const cellList: Cell[] = [];
        for (let i = 0; i < slotWindow.size; ++i) {
            const reelWin = slotWindow.GetWindow(i);
            for (let j = 0; j < reelWin.size; ++j) {
                if (payRule.symbols.indexOf(reelWin.getSymbol(j)) !== -1) {
                    cellList.push(new Cell(i, j));
                }
            }
        }
        return new WinInfo(payRule, null, null, cellList);
    }

    public static checkingWithPayLine(slotWindow: any, payRule: any, payLine: any): boolean {
        switch (payRule.winTriggerRule) {
            case PayRuleHelper.LeftToRight:
                return this.checkingLeftToRight(slotWindow, payRule, payLine);
            default:
                return false;
        }
    }

    public static checking(slotWindow: any, payRule: any): boolean {
        switch (payRule.winTriggerRule) {
            case PayRuleHelper.onAnyScreen:
            case PayRuleHelper.onScreen:
                return this.checkingOnAnyScreen(slotWindow, payRule);
            default:
                return false;
        }
    }

    public static checkingOnAnyScreen(slotWindow: any, payRule: any): boolean {
        let matchCount = 0;
        for (let i = 0; i < slotWindow.size; ++i) {
            const reelWin = slotWindow.GetWindow(i);
            for (let j = 0; j < reelWin.size; ++j) {
                if (payRule.symbols.indexOf(reelWin.getSymbol(j)) !== -1) matchCount++;
            }
        }
        return payRule.isMaching(matchCount);
    }

    public static checkingLeftToRight(slotWindow: any, payRule: any, payLine: any): boolean {
        let matchCount = 0;
        for (let i = 0; i < slotWindow.size; ++i) {
            const reelWin = slotWindow.GetWindow(i);
            const row = payLine.getRowByCol(i);
            if (payRule.symbols.indexOf(reelWin.getSymbol(row)) === -1) break;
            matchCount++;
        }
        return payRule.isMaching(matchCount);
    }
}

export class GameResultIndex {
    public index: number = 0;
}

@ccclass("GameResult")
export class GameResult {
    public betCoin: number = 0;
    public error: any = null;
    public machineID: string = "";
    public reqId: number = 0;
    public slotState: SlotState = new SlotState();
    public spinResult: SpinResult = new SpinResult();
    public spinResults: { [key: string]: SpinResult } = null;
    public winningCoin: number = 0;
    public spinSessionKey: number = 0;

    public setGameResult(data: any): void {
        this.betCoin = data.betCoin;
        this.error = data.error;
        this.machineID = data.machineID;
        this.reqId = data.reqId;

        if (cc.isValid(data.slotState)) this.slotState.setSlotState(data.slotState);
        if (cc.isValid(data.spinResult)) this.spinResult.setSpinResult(data.spinResult);

        this.spinResults = {};
        if (cc.isValid(data.spinResults)) {
            for (const key in data.spinResults) {
                const spinResult = new SpinResult();
                spinResult.setSpinResult(data.spinResults[key]);
                this.spinResults[key] = spinResult;
            }
        }

        this.winningCoin = data.winningCoin;
        this.spinSessionKey = cc.isValid(data.spinSessionKey) ? data.spinSessionKey : 0;
    }
}

@ccclass("SpinResult")
export class SpinResult {
    public betLine: number = 0;
    public symbolInfoWindow: ResultSymbolInfo[][] = [];
    public windows: any[] = [];
    public window: any = null;
    public subGameKey: string = "";
    public payOutWindowIndex: number = -1;
    public payOutResults: PayoutResult[] = [];
    public probResults: any = null;
    public jackpotResults: JackpotResult[] = [];
    public lockNRollResults: LockNRollResult[] = [];
    public symbolInfoResults: SymbolInfoResult[] = [];
    public subGamePotResults: SubGamePotResult[] = [];
    public casinoJackpotResult: any = null;
    public exData: any[] = [];
    public exData2: any[] = [];
    public exMapString: string = "";
    public exIntData: number[] = [];
    public selectedReelIdx: number = -1;

    public setSpinResult(data: any): void {
        this.betLine = data.betLine;

        if (cc.isValid(data.windows)) {
            for (let i = 0; i < data.windows.length; ++i) {
                const sizeArr: number[] = [];
                for (let j = 0; j < data.windows[i].length; ++j) sizeArr.push(data.windows[i][j].length);
                const slotWin = new SlotWindows(sizeArr);
                slotWin.setWindowSymbols(data.windows[i]);
                this.windows.push(slotWin);
            }
        }

        if (cc.isValid(data.window)) {
            const sizeArr: number[] = [];
            for (let i = 0; i < data.window.length; ++i) sizeArr.push(data.window[i].length);
            const slotWin = new SlotWindows(sizeArr);
            slotWin.setWindowSymbols(data.window);
            this.window = slotWin;
        }

        this.subGameKey = data.subGameKey;
        if (cc.isValid(data.payOutWindowIndex)) this.payOutWindowIndex = data.payOutWindowIndex;

        if (cc.isValid(data.payOutResults)) {
            for (let i = 0; i < data.payOutResults.length; ++i) {
                const payout = new PayoutResult();
                payout.setPayoutResult(data.payOutResults[i]);
                this.payOutResults.push(payout);
            }
        }

        this.probResults = data.probResults;

        if (cc.isValid(data.jackpotResults)) {
            for (let i = 0; i < data.jackpotResults.length; ++i) {
                const jackpot = new JackpotResult();
                jackpot.setJackpotResult(data.jackpotResults[i]);
                this.jackpotResults.push(jackpot);
            }
        }

        if (cc.isValid(data.lockNRollResults)) {
            for (let i = 0; i < data.lockNRollResults.length; ++i) {
                const lockNRoll = new LockNRollResult();
                lockNRoll.setLockNRollResult(data.lockNRollResults[i]);
                this.lockNRollResults.push(lockNRoll);
            }
        }

        if (cc.isValid(data.symbolInfoResults)) {
            for (let i = 0; i < data.symbolInfoResults.length; ++i) {
                const symbolInfo = new SymbolInfoResult();
                symbolInfo.setSymbolInfoResults(data.symbolInfoResults[i]);
                this.symbolInfoResults.push(symbolInfo);
            }
        }

        if (cc.isValid(data.subGamePotResults)) {
            for (let i = 0; i < data.subGamePotResults.length; ++i) {
                const potResult = new SubGamePotResult();
                potResult.setSubGamePotResult(data.subGamePotResults[i]);
                this.subGamePotResults.push(potResult);
            }
        }

        if (cc.isValid(data.casinoJackpotResult)) {
            this.casinoJackpotResult = SlotDataDefine.CasinoJackpotWinInfo.parseObj(data.casinoJackpotResult);
        }

        this.symbolInfoWindow = [];
        if (cc.isValid(data.symbolInfoWindow)) {
            for (let i = 0; i < data.symbolInfoWindow.length; ++i) {
                const colArr: ResultSymbolInfo[] = [];
                for (let j = 0; j < data.symbolInfoWindow[i].length; ++j) {
                    if (cc.isValid(data.symbolInfoWindow[i][j])) {
                        const info = new ResultSymbolInfo();
                        info.init(data.symbolInfoWindow[i][j]);
                        colArr.push(info);
                    } else {
                        colArr.push(null);
                    }
                }
                this.symbolInfoWindow.push(colArr);
            }
        }

        if (cc.isValid(data.exIntData)) {
            for (let i = 0; i < data.exIntData.length; ++i) this.exIntData.push(data.exIntData[i]);
        }

        if (cc.isValid(data.exData)) {
            for (let i = 0; i < data.exData.length; ++i) this.exData.push(data.exData[i]);
        }

        if (cc.isValid(data.exData2)) {
            for (let i = 0; i < data.exData2.length; ++i) this.exData2.push(data.exData2[i]);
        }

        if (cc.isValid(data.exMapString)) this.exMapString = data.exMapString;
        this.selectedReelIdx = cc.isValid(data.selectedReelIdx) ? data.selectedReelIdx : -1;
    }

    public getSymbolListUnderAllPaylines(): number[] {
        const symbolList: number[] = [];
        if (!cc.isValid(this.payOutResults)) return symbolList;

        for (let i = 0; i < this.payOutResults.length; ++i) {
            const payout = this.payOutResults[i];
            for (let j = 0; j < payout.winningCell.length; ++j) {
                const row = payout.winningCell[j][0];
                const col = payout.winningCell[j][1];
                const symbol = this.windows[this.windows.length - 1].GetWindow(col).getSymbol(row);
                if (symbolList.indexOf(symbol) === -1) symbolList.push(symbol);
            }
        }
        return symbolList;
    }

    public getSumOfWinningCoinPayoutResults(): number {
        let total = 0;
        this.payOutResults.forEach(item => total += item.winningCoin);
        return total;
    }

    public getSumOfWinningCoinSymbolInfoResults(): number {
        this.symbolInfoResults.forEach(item => {
            item.prizeType; item.prize; item.jackpotKey; item.prizeUnit;
        });
        return 0;
    }
}

@ccclass("SlotState")
export class SlotState {
    public machineID: string = "";
    public winningSteak: number = 0;
    public nextSubGameKey: string = "";
    public spinCnt: number = 0;
    public subGameStack: any = null;
    public subGameState: { [key: string]: SubGameState } = {};

    public setSlotState(data: any): void {
        this.machineID = data.machineID;
        this.nextSubGameKey = data.nextSubGameKey;
        if (cc.isValid(data.winningSteak)) this.winningSteak = data.winningSteak;
        if (cc.isValid(data.spinCnt)) this.spinCnt = data.spinCnt;
        if (cc.isValid(data.subGameStack)) this.subGameStack = data.subGameStack;

        if (cc.isValid(data.subGameState)) {
            const keys = Object.keys(data.subGameState);
            for (let i = 0; i < keys.length; ++i) {
                const state = new SubGameState();
                state.setSubGameState(data.subGameState[keys[i]]);
                this.subGameState[keys[i]] = state;
            }
        }
    }

    public getSubGameState(key: string): SubGameState {
        for (const k in this.subGameState) {
            if (this.subGameState[k].subGameKey === key) {
                return this.subGameState[k];
            }
        }
        return null;
    }

    public getSubGameStateByMapKey(key: string): SubGameState {
        for (const k in this.subGameState) {
            if (k === key) {
                return this.subGameState[k];
            }
        }
        return null;
    }
}

@ccclass("PayoutResult")
export class PayoutResult {
    public payLine: number = 0;
    public payOut: Payout = new Payout();
    public wildMultiplier: number = 0;
    public prize: number = 0;
    public winningCoin: number = 0;
    public winningCell: number[][] = [];
    public winningSymbol: any = null;
    public ways: any = null;
    public windowIndex: number = 0;
    public spinMultiplier: number = 0;

    public setPayoutResult(data: any): void {
        if (cc.isValid(data.payLine)) this.payLine = data.payLine;
        if (cc.isValid(data.payOut)) this.payOut.setPayout(data.payOut);
        if (cc.isValid(data.wildMultiplier)) this.wildMultiplier = data.wildMultiplier;
        if (cc.isValid(data.prize)) this.prize = data.prize;
        if (cc.isValid(data.winningCoin)) this.winningCoin = data.winningCoin;
        if (cc.isValid(data.spinMultiplier)) this.spinMultiplier = data.spinMultiplier;

        if (!cc.isValid(data.winningCell)) {
            for (let i = 0; i < 5; ++i) {
                const num = Math.floor(this.payLine / (10000 / Math.pow(10, i))) % 10;
                if (num <= 0) break;
                this.winningCell.push([num - 1, i]);
            }
        } else {
            for (let i = 0; i < data.winningCell.length; ++i) {
                this.winningCell.push([data.winningCell[i][0], data.winningCell[i][1]]);
            }
        }

        if (cc.isValid(data.winningSymbol)) this.winningSymbol = data.winningSymbol;
        if (cc.isValid(data.ways)) this.ways = data.ways;
        if (cc.isValid(data.windowIndex)) this.windowIndex = data.windowIndex;
    }
}

@ccclass("JackpotResult")
export class JackpotResult {
    public zoneID: number = 0;
    public slotID: string = "";
    public jackpotSubID: number = 0;
    public jackpotSubKey: string = "";
    public jackpot: number = 0;
    public baseWinningCoin: number = 0;
    public winningCoin: number = 0;
    public winningCellX: number = 0;
    public winningCellY: number = 0;
    public windowIndex: number = 0;
    public isSuperSizeIt: boolean = false;

    public setJackpotResult(data: any): void {
        if (cc.isValid(data.zoneID)) this.zoneID = data.zoneID;
        if (cc.isValid(data.slotID)) this.slotID = data.slotID;
        if (cc.isValid(data.jackpotSubID)) this.jackpotSubID = data.jackpotSubID;
        if (cc.isValid(data.jackpotSubKey)) this.jackpotSubKey = data.jackpotSubKey;
        if (cc.isValid(data.jackpot)) this.jackpot = data.jackpot;
        if (cc.isValid(data.baseWinningCoin)) this.baseWinningCoin = data.baseWinningCoin;
        if (cc.isValid(data.winningCoin)) this.winningCoin = data.winningCoin;
        if (cc.isValid(data.winningCellX)) this.winningCellX = data.winningCellX;
        if (cc.isValid(data.winningCellY)) this.winningCellY = data.winningCellY;
        if (cc.isValid(data.windowIndex)) this.windowIndex = data.windowIndex;
        if (cc.isValid(data.isSuperSizeIt)) this.isSuperSizeIt = data.isSuperSizeIt;
    }
}

@ccclass("LockNRollResult")
export class LockNRollResult {
    public winningCoin: number = 0;
    public winningCellX: number = 0;
    public winningCellY: number = 0;
    public prizeType: string = "";
    public jackpotKey: string = "";
    public prize: number = 0;
    public multiplier: number = 0;

    public setLockNRollResult(data: any): void {
        this.winningCoin = data.winningCoin;
        this.winningCellX = data.winningCellX;
        this.winningCellY = data.winningCellY;
        this.prizeType = data.prizeType;
        this.jackpotKey = data.jackpotKey;
        if (cc.isValid(data.prize)) this.prize = data.prize;
        if (cc.isValid(data.multiplier)) this.multiplier = data.multiplier;
    }
}

@ccclass("SubGamePotResult")
export class SubGamePotResult {
    public zoneID: number = 0;
    public slotID: string = "";
    public potKey: string = "";
    public winningCoin: number = 0;
    public multiplier: number = 0;
    public potPrize: number = 0;

    public setSubGamePotResult(data: any): void {
        this.zoneID = data.zoneID;
        this.slotID = data.slotID;
        this.potKey = data.potKey;
        this.winningCoin = data.winningCoin;
        this.multiplier = data.multiplier;
        this.potPrize = data.potPrize;
    }
}

@ccclass("SymbolInfoResult")
export class SymbolInfoResult {
    public jackpotKey: string = "";
    public prize: number = 0;
    public prizeType: string = "";
    public prizeUnit: string = "";
    public winningCellX: number = 0;
    public winningCellY: number = 0;
    public winningCoin: number = 0;

    public setSymbolInfoResults(data: any): void {
        this.winningCoin = data.winningCoin;
        this.winningCellX = data.winningCellX;
        this.winningCellY = data.winningCellY;
        this.prizeType = data.prizeType;
        this.jackpotKey = data.jackpotKey;
        this.prize = data.prize;
        this.prizeUnit = data.prizeUnit;
    }
}

@ccclass("Payout")
export class Payout {
    public payType: string = "";
    public symbols: number[] = [];
    public count: number = 0;
    public prizeType: string = "";
    public prizeUnit: string = "";
    public multiplier: number = 0;
    public winTriggerRule: string = "";
    public applyPayline: any = null;

    public setPayout(data: any): void {
        if (cc.isValid(data.payType)) this.payType = data.payType;
        if (cc.isValid(data.symbols)) {
            for (let i = 0; i < data.symbols.length; ++i) this.symbols.push(data.symbols[i]);
        }
        if (cc.isValid(data.count)) this.count = data.count;
        if (cc.isValid(data.prizeType)) this.prizeType = data.prizeType;
        if (cc.isValid(data.prizeUnit)) this.prizeUnit = data.prizeUnit;
        if (cc.isValid(data.multiplier)) this.multiplier = data.multiplier;
        if (cc.isValid(data.winTriggerRule)) this.winTriggerRule = data.winTriggerRule;
        if (cc.isValid(data.applyPayline)) this.applyPayline = data.applyPayline;
    }
}

@ccclass("ResultSymbolInfo")
export class ResultSymbolInfo {
    public type: string = "";
    public key: string = "";
    public prize: number = 0;
    public prizeUnit: string = "";
    public subID: number = 0;
    public multiplier: number = 0;
    public exValue: number = 0;
    public orgPrize: number = 0;
    public symbol: number = -1;
    public subSymbolInfos: SubSymbolInfo[] = [];

    public init(data: any): void {
        if (cc.isValid(data.key)) this.key = data.key;
        if (cc.isValid(data.prize)) this.prize = data.prize;
        if (cc.isValid(data.prizeUnit)) this.prizeUnit = data.prizeUnit;
        if (cc.isValid(data.subID)) this.subID = data.subID;
        if (cc.isValid(data.type)) this.type = data.type;
        if (cc.isValid(data.multiplier)) this.multiplier = data.multiplier;
        if (cc.isValid(data.exValue)) this.exValue = data.exValue;
        if (cc.isValid(data.orgPrize)) this.orgPrize = data.orgPrize;
        if (cc.isValid(data.symbol)) this.symbol = data.symbol;

        if (cc.isValid(data.subSymbolInfos)) {
            for (let i = 0; i < data.subSymbolInfos.length; ++i) {
                const subInfo = new SubSymbolInfo();
                subInfo.init(data.subSymbolInfos[i]);
                this.subSymbolInfos.push(subInfo);
            }
        }
    }
}

export class SubSymbolInfo {
    public type: string = "";
    public key: string = "";
    public prize: number = 0;
    public prizeUnit: string = "";
    public subID: number = 0;
    public multiplier: number = 0;
    public exValue: number = 0;
    public symbol: number = -1;
    public betPerLine: number = 0;

    public init(data: any): void {
        if (cc.isValid(data.betPerLine)) this.betPerLine = data.betPerLine;
        if (cc.isValid(data.key)) this.key = data.key;
        if (cc.isValid(data.exValue)) this.exValue = data.exValue;
        if (cc.isValid(data.prize)) this.prize = data.prize;
        if (cc.isValid(data.type)) this.type = data.type;
        if (cc.isValid(data.prizeUnit)) this.prizeUnit = data.prizeUnit;
        if (cc.isValid(data.symbol)) this.symbol = data.symbol;
        if (cc.isValid(data.subID)) this.subID = data.subID;
        if (cc.isValid(data.multiplier)) this.multiplier = data.multiplier;
    }
}

@ccclass("PartSubGames")
export class PartSubGames {
    public index: number = 0;
    public partSubGameKey: string = "";
    public subGameKey: string = "";
    public subGameStateKey: string = "";
    public isActive: boolean = false;

    public setSubGamePotResult(data: any): void {
        this.index = data.index;
        this.partSubGameKey = data.partSubGameKey;
        this.subGameKey = data.subGameKey;
        this.subGameStateKey = data.subGameStateKey;
        this.isActive = data.isActive;
    }
}

export class FreeSpinState {
    public totalCnt: number = 0;
    public currCnt: number = 0;
    public multiplier: number = 0;
    public spinMultiplier: number = 0;
    public totalWinningCoin: number = 0;
    public totalPrize: number = 0;
    public isFinal: boolean = false;

    public clearFreeSpinState(): void {
        this.totalCnt = 0;
        this.currCnt = 0;
        this.multiplier = 0;
        this.spinMultiplier = 0;
        this.totalWinningCoin = 0;
        this.totalPrize = 0;
        this.isFinal = false;
    }

    public setFreeSpinState(data: any): void {
        this.totalCnt = data.totalCnt;
        this.currCnt = data.currCnt;
        this.multiplier = data.multiplier;
        this.spinMultiplier = data.spinMultiplier;
        this.totalWinningCoin = data.totalWinningCoin;
        this.totalPrize = data.totalPrize;
        this.isFinal = data.isFinal;
    }

    public isStartFreespinMode(): boolean {
        return this.totalCnt > 0 && this.currCnt === 0;
    }

    public getRemainFreespinCount(): number {
        return this.totalCnt - this.currCnt;
    }
}

@ccclass("SubGameState")
export class SubGameState {
    public subGameKey: string = "";
    public betLines: number = 0;
    public betPerLines: number = 0;
    public customBetPerLine: number = 0;
    public totalCnt: number = 0;
    public spinCnt: number = 0;
    public multiplier: number = 0;
    public spinMultiplier: number = 0;
    public totalWinningCoin: number = 0;
    public totalPrize: number = 0;
    public gauge: number = 0;
    public gaugeTotalBet: number = 0;
    public gauges: { [key: string]: number } = {};
    public gaugeExs: { [key: string]: any } = {};
    public gaugeWithBetPerLine: { [key: string]: any } = {};
    public potWithBetPerLine: { [key: string]: any } = {};
    public pots: { [key: string]: PotInfo } = {};
    public exData: { [key: string]: any } = {};
    public exTopReels: { [key: string]: any } = {};
    public exDataWithBetPerLine: { [key: string]: any } = {};
    public partSubGames: PartSubGames[] = [];
    public winningCoins: number[] = null;
    public activedCellNos: number[] = [];
    public activedCellNosWBP: { [key: string]: any } = {};
    public savedProbabilities: { [key: string]: any } = {};
    public isInited: boolean = false;
    public lastSymbolInfoWindow: any = null;
    public lastWindows: any = null;
    public lastFullWindow: any = null;
    public lockedWindow: any = null;
    public prevSubGameKey: string = "";
    public maxGauge: number = 0;
    public partitionCount: number = 0;
    public savedReels: any = null;

    public clearFreeSpinState(): void {
        this.betLines = 0;
        this.betPerLines = 0;
        this.customBetPerLine = 0;
        this.totalCnt = 0;
        this.spinCnt = 0;
        this.multiplier = 0;
        this.spinMultiplier = 0;
        this.subGameKey = "";
        this.totalWinningCoin = 0;
        this.totalPrize = 0;
        this.pots = {};
        this.exData = {};
        this.partSubGames = [];
        this.exDataWithBetPerLine = {};
        this.exTopReels = {};
        this.gauge = 0;
        this.gaugeTotalBet = 0;
        this.gauges = {};
        this.gaugeExs = {};
        this.gaugeWithBetPerLine = {};
        this.potWithBetPerLine = {};
        this.activedCellNos = [];
        this.activedCellNosWBP = {};
        this.savedProbabilities = {};
        this.isInited = false;
        this.lastSymbolInfoWindow = null;
        this.lastWindows = null;
        this.lockedWindow = null;
        this.lastFullWindow = null;
        this.prevSubGameKey = "";
        this.maxGauge = 0;
        this.partitionCount = 0;
        this.savedReels = null;
        if (cc.isValid(this.winningCoins)) {
            this.winningCoins = null;
        }
    }

    public setSubGameState(data: any): void {
        if (cc.isValid(data.betLines)) this.betLines = data.betLines;
        if (cc.isValid(data.betPerLines)) this.betPerLines = data.betPerLines;
        if (cc.isValid(data.totalCnt)) this.totalCnt = data.totalCnt;
        if (cc.isValid(data.spinCnt)) this.spinCnt = data.spinCnt;
        if (cc.isValid(data.multiplier)) this.multiplier = data.multiplier;
        if (cc.isValid(data.spinMultiplier)) this.spinMultiplier = data.spinMultiplier;
        if (cc.isValid(data.subGameKey)) this.subGameKey = data.subGameKey;
        if (cc.isValid(data.totalWinningCoin)) this.totalWinningCoin = data.totalWinningCoin;
        if (cc.isValid(data.totalPrize)) this.totalPrize = data.totalPrize;
        if (cc.isValid(data.prevSubGameKey)) this.prevSubGameKey = data.prevSubGameKey;
        if (cc.isValid(data.gauge)) this.gauge = data.gauge;
        if (cc.isValid(data.gaugeTotalBet)) this.gaugeTotalBet = data.gaugeTotalBet;

        if (cc.isValid(data.gauges)) {
            const keys = Object.keys(data.gauges);
            keys.forEach(k => this.gauges[k] = data.gauges[k]);
        }

        if (cc.isValid(data.gaugeExs)) {
            const keys = Object.keys(data.gaugeExs);
            keys.forEach(k => this.gaugeExs[k] = data.gaugeExs[k]);
        }

        if (cc.isValid(data.gaugeWithBetPerLine)) {
            const keys = Object.keys(data.gaugeWithBetPerLine);
            keys.forEach(k => this.gaugeWithBetPerLine[k] = data.gaugeWithBetPerLine[k]);
        }

        if (cc.isValid(data.potWithBetPerLine)) {
            const keys = Object.keys(data.potWithBetPerLine);
            keys.forEach(k => this.potWithBetPerLine[k] = data.potWithBetPerLine[k]);
        }

        if (cc.isValid(data.customBetPerLine)) this.customBetPerLine = data.customBetPerLine;
        if (cc.isValid(data.partitionCount)) this.partitionCount = data.partitionCount;
        if (cc.isValid(data.maxGauge)) this.maxGauge = data.maxGauge;

        if (cc.isValid(data.pots)) {
            const keys = Object.keys(data.pots);
            for (let i = 0; i < keys.length; ++i) {
                const potInfo = new PotInfo();
                const key = keys[i];
                potInfo.pot = data.pots[key].pot;
                potInfo.cnt = data.pots[key].cnt;
                potInfo.type = cc.isValid(data.pots[key].type) ? data.pots[key].type : 0;
                potInfo.subtype = cc.isValid(data.pots[key].subtype) ? data.pots[key].subtype : 0;
                if (potInfo.subtype === 0) potInfo.subtype = cc.isValid(data.pots[key].subType) ? data.pots[key].subType : 0;
                potInfo.isPayed = cc.isValid(data.pots[key].isPayed) && data.pots[key].isPayed;
                this.pots[key] = potInfo;
            }
        }

        if (cc.isValid(data.partSubGames)) {
            const keys = Object.keys(data.partSubGames);
            for (let i = 0; i < keys.length; i++) {
                if (data.partSubGames[keys[i]] !== "") {
                    const partGame = new PartSubGames();
                    partGame.setSubGamePotResult(data.partSubGames[keys[i]]);
                    this.partSubGames.push(partGame);
                }
            }
        }

        if (cc.isValid(data.exData)) {
            const keys = Object.keys(data.exData);
            for (let i = 0; i < keys.length; ++i) {
                if (data.exData[keys[i]] !== "") {
                    this.exData[keys[i]] = JSON.parse(data.exData[keys[i]]);
                }
            }
        }

        if (cc.isValid(data.exDataWithBetPerLine)) {
            const keys = Object.keys(data.exDataWithBetPerLine);
            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                this.exDataWithBetPerLine[key] = {};
                this.exDataWithBetPerLine[key].exDatas = {};
                const exDatas = data.exDataWithBetPerLine[key].exDatas;
                if (cc.isValid(exDatas)) {
                    const exKeys = Object.keys(exDatas);
                    exKeys.forEach(k => {
                        if (exDatas[k] !== "") this.exDataWithBetPerLine[key].exDatas[k] = JSON.parse(exDatas[k]);
                    });
                }
            }
        }

        if (cc.isValid(data.exTopReels)) {
            const keys = Object.keys(data.exTopReels);
            keys.forEach(k => {
                if (data.exTopReels[k] !== "") this.exTopReels[k] = data.exTopReels[k];
            });
        }

        this.isInited = cc.isValid(data.isInited) ? data.isInited : false;

        if (cc.isValid(data.lastSymbolInfoWindow)) {
            this.lastSymbolInfoWindow = [];
            for (let i = 0; i < data.lastSymbolInfoWindow.length; ++i) {
                this.lastSymbolInfoWindow.push([]);
                for (let j = 0; j < data.lastSymbolInfoWindow[i].length; ++j) {
                    if (cc.isValid(data.lastSymbolInfoWindow[i][j])) {
                        const info = new ResultSymbolInfo();
                        info.init(data.lastSymbolInfoWindow[i][j]);
                        this.lastSymbolInfoWindow[i].push(info);
                    } else {
                        this.lastSymbolInfoWindow[i].push(null);
                    }
                }
            }
        }

        if (cc.isValid(data.symbolLockedWindow)) {
            this.lockedWindow = [];
            for (const key in data.symbolLockedWindow) {
                const pos = key.split(",");
                const x = Number(pos[0]);
                const y = Number(pos[1]);
                const val = data.symbolLockedWindow[key];
                if (!this.lockedWindow[x]) this.lockedWindow[x] = [];
                this.lockedWindow[x][y] = val;
            }
        }

        if (cc.isValid(data.lastWindows)) {
            this.lastWindows = [];
            for (let i = 0; i < data.lastWindows.length; ++i) {
                this.lastWindows.push([]);
                for (let j = 0; j < data.lastWindows[i].length; ++j) {
                    this.lastWindows[i][j] = data.lastWindows[i][j];
                }
            }
        }

        if (cc.isValid(data.lastFullWindow)) {
            this.lastFullWindow = [];
            for (let i = 0; i < data.lastFullWindow.length; ++i) {
                this.lastFullWindow.push([]);
                for (let j = 0; j < data.lastFullWindow[i].length; ++j) {
                    this.lastFullWindow[i][j] = data.lastFullWindow[i][j];
                }
            }
        }

        if (cc.isValid(data.savedReels)) {
            this.savedReels = [];
            for (let i = 0; i < data.savedReels.length; ++i) {
                this.savedReels.push([]);
                for (let j = 0; j < data.savedReels[i].length; ++j) {
                    this.savedReels[i][j] = data.savedReels[i][j];
                }
            }
        }

        if (cc.isValid(data.winningCoins)) {
            this.winningCoins = [];
            data.winningCoins.forEach(val => this.winningCoins.push(val));
        }

        if (cc.isValid(data.activedCellNos)) {
            this.activedCellNos = [];
            data.activedCellNos.forEach(val => this.activedCellNos.push(val));
        }

        if (cc.isValid(data.activedCellNosWBP)) {
            const keys = Object.keys(data.activedCellNosWBP);
            keys.forEach(k => this.activedCellNosWBP[k] = data.activedCellNosWBP[k]);
        }

        if (cc.isValid(data.savedProbabilities)) {
            const keys = Object.keys(data.savedProbabilities);
            keys.forEach(k => this.savedProbabilities[k] = data.savedProbabilities[k]);
            if (keys.length <= 0) this.savedProbabilities = null;
        } else {
            this.savedProbabilities = null;
        }
    }

    public isStartFreespinMode(subGameKey: string = "freeSpin"): boolean {
        return this.subGameKey === subGameKey && this.totalCnt > 0 && this.spinCnt === 0;
    }

    public getRemainFreespinCount(): number {
        return this.subGameKey !== "freeSpin" ? -1 : this.totalCnt - this.spinCnt;
    }

    public isStartSuperFreespinMode(): boolean {
        return this.subGameKey === "superfreeSpin" && this.totalCnt > 0 && this.spinCnt === 0;
    }

    public getRemainSuperFreespinCount(): number {
        return this.subGameKey !== "superfreeSpin" ? -1 : this.totalCnt - this.spinCnt;
    }

    public getRemainCount(): number {
        const total = cc.isValid(this.totalCnt) ? this.totalCnt : 0;
        const spin = cc.isValid(this.spinCnt) ? this.spinCnt : 0;
        return Math.max(0, total - spin);
    }

    public getGaugesValue(key: string): number {
        return cc.isValid(this.gauges[key]) ? this.gauges[key] : 0;
    }

    public isLockedWindowInState(): boolean {
        return cc.isValid(this.lockedWindow);
    }

    public getLockedWindowSymbol(x: number, y: number): number {
        let symbol = -1;
        if (cc.isValid(this.lockedWindow) && cc.isValid(this.lockedWindow[x]) && cc.isValid(this.lockedWindow[x][y])) {
            symbol = this.lockedWindow[x][y];
        }
        return symbol;
    }

    public getPotInfo(key: string): PotInfo {
        return this.pots[key];
    }

    public getGaugeWithBetPerLine(key1: string, key2: string): number {
        if (cc.isValid(this.gaugeWithBetPerLine) && cc.isValid(this.gaugeWithBetPerLine[key1]) && cc.isValid(this.gaugeWithBetPerLine[key1].gauges) && cc.isValid(this.gaugeWithBetPerLine[key1].gauges[key2])) {
            return this.gaugeWithBetPerLine[key1].gauges[key2];
        }
        return 0;
    }

    public getPotWithBetPerLine(key1: string, key2: string): number {
        if (cc.isValid(this.potWithBetPerLine) && cc.isValid(this.potWithBetPerLine[key1]) && cc.isValid(this.potWithBetPerLine[key1].pots) && cc.isValid(this.potWithBetPerLine[key1].pots[key2]) && cc.isValid(this.potWithBetPerLine[key1].pots[key2].pot)) {
            return this.potWithBetPerLine[key1].pots[key2].pot;
        }
        return 0;
    }
}

@ccclass("PotInfo")
export class PotInfo {
    public pot: number = 0;
    public cnt: number = 0;
    public type: number = 0;
    public subtype: number = 0;
    public isPayed: boolean = false;
}