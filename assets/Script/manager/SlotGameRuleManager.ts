const { ccclass, property } = cc._decorator;
import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
// import SlotManager from "./SlotManager";
import SlotGameResultManager, { Cell } from "./SlotGameResultManager";
import SubGame from "../SubGame";
import SlotManager from "./SlotManager";

@ccclass
export default class SlotGameRuleManager extends cc.Component {
    @property()
    public slotID: string = "";
    @property()
    public slotName: string = "";

    public _slotWindows: SlotWindows | null = null;
    private _reelStrips: { [key: string]: ReelStrip } = {};
    private _symbols: { [key: string]: any } = {};
    private _rules: { [key: string]: any } = {};
    public _subGames: { [key: string]: SubGame } = {};
    public _listPayline: PayLines[] = [];
    public _zoneBetPerLines: number[] | null = null;
    public _maxBetLine: number = 0;
    public _featureTotalBetRate100: number = 0;
    public _currentBetPerLine: number = 0;
    public _currentBetEllipsisCount: number = 0;
    public _maxBetPerLine: number = 0;
    public _currentBetMoney: number = 0;
    public _defaultSubGame: string = "";
    public _flagLockIncreaseBetMoneyUpperGuideBetPerLine: boolean = false;
    public _guideBetPerLine: number = 0;
    public observers: any[] = [];

    public static Instance: SlotGameRuleManager = null;
    public static MSG = {
        UPDATE_BETTINGAMOUNT: "UPDATE_BETTINGAMOUNT"
    };

    get zoneBetPerLines(): number[] {
        return this._zoneBetPerLines;
    }

    set zoneBetPerLines(e: number[]) {
        const n: number[] = [];
        const o: number[] = [];
        e.forEach((val) => {
            const a = this.getTotalBet(val, this._maxBetLine);
            n.indexOf(a) === -1 && o.push(val);
        });
        this._zoneBetPerLines = o;
    }

    onLoad(): void {
        SlotGameRuleManager.Instance = this;
    }

    onDestroy(): void {
        if (SlotGameRuleManager.Instance === this) {
            SlotGameRuleManager.Instance.observers.length = 0;
            SlotGameRuleManager.Instance.observers = null;
            SlotGameRuleManager.Instance = null;
        } else {
            cc.error("SlotGameRuleManager.Instance onDestroy error");
        }
    }

    public getBetPerLineInfos(): number[] | null {
        return this.zoneBetPerLines;
    }

    public setCurrentBetPerLine(e: number): void {
        const t = this.zoneBetPerLines as number[];
        let targetBet = e;
        for (let n = t.length - 1; n >= 0; --n) {
            if (t[n] <= targetBet) {
                targetBet = t[n];
                break;
            }
        }
        if (targetBet < t[0]) targetBet = t[0];
        targetBet = SlotManager.Instance.slotInterface.onSetCurrentBetPerLine(targetBet);

        const o = this.getBetMoney(targetBet);
        this._currentBetPerLine = targetBet;
        this._currentBetMoney = o;
        this._currentBetEllipsisCount = CurrencyFormatHelper.getEllipsisCount(o);
        this.sendChangeMoneyStateEventToObservers();
    }

    public getBetMoney(e: number): number {
        return (e + e * this._featureTotalBetRate100 / 100) * this._maxBetLine;
    }

    public getCurrentBetMoney(): number {
        return this._currentBetMoney;
    }

    public getTotalBet(e?: number, t?: number): number {
        const o = this.getCurrentBetPerLineApplyFeatureTotalBetRate100(e);
        return (t ?? SlotGameRuleManager.Instance!._maxBetLine) * o;
    }

    public getCurrentBetPerLineApplyFeatureTotalBetRate100(e?: number): number {
        let t = this.getCurrentBetPerLine();
        t = e ?? this.getCurrentBetPerLine();
        return t + t * this._featureTotalBetRate100 / 100;
    }

    public getCurrentBetPerLine(): number {
        return this._currentBetPerLine;
    }

    public getCurrentBetEllipsisCount(): number {
        return this._currentBetEllipsisCount;
    }

    public setSlotInfo(e: any): void {
        const t: any = null;
        const n = e.zoneBetPerLines;
        const o = e.slotInfo.maxBetLine;
        const a = e.slotInfo.windowSize;

        if (e.slotInfo.slotID != null) this.slotID = e.slotInfo.slotID;
        if (e.slotInfo.featureTotalBetRate100 != null) this._featureTotalBetRate100 = e.slotInfo.featureTotalBetRate100;

        let payLineIns: PayLines | null = null;
        if (e.slotInfo.playLineInfos != null) {
            for (const l in e.slotInfo.playLineInfos) {
                payLineIns = new PayLines();
                payLineIns.initPayLines(l, e.slotInfo.playLineInfos[l].payLineType, e.slotInfo.playLineInfos[l].payLines, e.slotInfo.playLineInfos[l].payLineListType);
                this._listPayline.push(payLineIns);
            }
        } else {
            payLineIns = new PayLines();
            payLineIns.initPayLines("__default__", e.slotInfo.payLineType, e.slotInfo.payLines, e.slotInfo.payLineListType);
            this._listPayline.push(payLineIns);
        }

        this._slotWindows = new SlotWindows(a);
        const reelSource = e.slotInfo.clientReels != null ? e.slotInfo.clientReels : e.slotInfo.reelStrips;
        for (const l in reelSource) {
            const reelStrip = new ReelStrip();
            reelStrip.initReelStrip(l, reelSource[l].reels);
            this._reelStrips[l] = reelStrip;
        }

        for (const l in e.slotInfo.subGames) {
            const subGame = new SubGame();
            subGame.init(e.slotInfo.subGames[l]);
            this._subGames[l] = subGame;
        }

        this._maxBetLine = o;
        this.zoneBetPerLines = n;
        this._maxBetPerLine = (this.zoneBetPerLines as number[])[(this.zoneBetPerLines as number[]).length - 1];
        this.setCurrentBetPerLine((this.zoneBetPerLines as number[])[0]);
    }

    public getPaylines(e?: string): PayLines | null {
        let t = e ?? "__default__";
        if (!this.isExistPayline(t)) {
            t = this.isExistPayline("__default__") ? "__default__" : this._listPayline[0].getKey();
        }

        let targetPayline: PayLines | null = null;
        for (let o = 0; o < this._listPayline.length; ++o) {
            if (this._listPayline[o].getKey() === t) {
                targetPayline = this._listPayline[o];
                break;
            }
        }
        return targetPayline;
    }

    public isExistPayline(e: string): boolean {
        let isExist = false;
        for (let n = 0; n < this._listPayline.length; ++n) {
            if (this._listPayline[n].getKey() === e) {
                isExist = true;
                break;
            }
        }
        return isExist;
    }

    public increaseBetPerLine(): number {
        const e = this.zoneBetPerLines as number[];
        let t = e.indexOf(this.getCurrentBetPerLine());
        t = Math.min(e.length - 1, t + 1);
        this.setCurrentBetPerLine(e[t]);
        return t;
    }

    public getCurrentBetPerLineIndex(): number {
        const e = this.zoneBetPerLines as number[];
        for (let t = 0; t < e.length; ++t) {
            if (e[t] === this._currentBetPerLine) return t;
        }
        return 0;
    }

    public getMaxBetPerLineCnt(): number {
        return (this.zoneBetPerLines as number[]).length;
    }

    public isHighBetting(): boolean {
        const e = this.zoneBetPerLines as number[];
        return !(e.indexOf(this.getCurrentBetPerLine()) < e.length - 2);
    }

    public decreaseBetPerLine(): number {
        const e = this.zoneBetPerLines as number[];
        let t = e.indexOf(this.getCurrentBetPerLine());
        t = Math.max(0, t - 1);
        this.setCurrentBetPerLine(e[t]);
        return t;
    }

    public getNextIncreaseBetMoney(): number {
        const e = this.zoneBetPerLines as number[];
        let t = e.indexOf(this.getCurrentBetPerLine());
        t = Math.min(e.length - 1, t + 1);
        return (e[t] + e[t] * this._featureTotalBetRate100 / 100) * this._maxBetLine;
    }

    public isCurrentBetPerLineMinValue(): boolean {
        return (this.zoneBetPerLines as number[]).indexOf(this.getCurrentBetPerLine()) === 0;
    }

    public isCurrentBetPerLineMaxValue(): boolean {
        const e = this.zoneBetPerLines as number[];
        return e.indexOf(this.getCurrentBetPerLine()) === e.length - 1;
    }

    public setMaxBetPerLine(): void {
        const e = this.zoneBetPerLines as number[];
        this.setCurrentBetPerLine(e[e.length - 1]);
    }

    public getBasicGameReel(): ReelStrip {
        const e = this._subGames.base.physicalReelStripsKey;
        return this._reelStrips[e];
    }

    public getReelStrip(e: string): ReelStrip | null {
        let t = this._subGames[e].physicalReelStripsKey;
        if (t === "") t = this._subGames.base.physicalReelStripsKey;
        return this._reelStrips[t] ?? this._reelStrips[this._subGames[e].reelStripsKey] ?? null;
    }

    public addObserver(e: any): void {
        this.observers.push(e);
    }

    public removeObserver(e: any): void {
        for (let t = 0; t < this.observers.length; ++t) {
            if (this.observers[t] === e) {
                this.observers.splice(t, 1);
                break;
            }
        }
    }

    public sendChangeMoneyStateEventToObservers(): void {
        for (let e = 0; e < this.observers.length; ++e) {
            this.observers[e].emit("changeMoneyState");
        }
    }

    public getEntranceWindow(e: string): any | null {
        let t = null;
        if (this._subGames[e] != null && this._subGames[e].entranceWindow != null) {
            t = this._subGames[e].entranceWindow;
        }
        return t;
    }

    public setGuideBetPerLine(e: number): void {
        this._flagLockIncreaseBetMoneyUpperGuideBetPerLine = true;
        this._guideBetPerLine = e;
        SlotManager.Instance.bottomUI.setButtonActiveState(null);
    }

    public resetGuideBetPerLine(): void {
        this._flagLockIncreaseBetMoneyUpperGuideBetPerLine = false;
        this._guideBetPerLine = 0;
        SlotManager.Instance.bottomUI.setButtonActiveState(null);
    }

    public getSubGame(e: string): SubGame | null {
        return this._subGames[e] ?? null;
    }

    public getReel(e: string, t: number): ReelInfo | null {
        const n = this.getReelStrip(e);
        const o = this._subGames[e];
        let a: ReelInfo | null = null;
        let i = false;

        if (o.reelStripsType != null && (o.reelStripsType === "weightedRandomCell" || o.reelStripsType === "weightedRandomReel")) {
            i = true;
        }

        if (i) {
            let l = -1;
            if (Object.keys(SlotGameResultManager.Instance._gameResult.spinResults).length > 0) {
                const r = Object.keys(SlotGameResultManager.Instance._gameResult.spinResults);
                l = SlotGameResultManager.Instance._gameResult.spinResults[r[t]].selectedReelIdx;
            } else {
                l = SlotGameResultManager.Instance._gameResult.spinResult.selectedReelIdx;
            }
            a = l === -1 ? n!.getReelInfo(t) : n!.getReelInfo(l);
        } else {
            a = n!.getReelInfo(t);
        }
        return a;
    }

	public getReelInfoPreResponseResult(e: string, t: number): ReelInfo | null {
        const n = this.getReelStrip(e);
        const o = this._subGames[e];
        let a = false;

        if (o.reelStripsType != null && (o.reelStripsType === "weightedRandomCell" || o.reelStripsType === "weightedRandomReel")) {
            a = true;
        }
        return a ? n!.getReelInfo(o.physicalReelWRCDefaultNo) : n!.getReelInfo(t);
	}
}


export class Window {
    private _size: number = 0;
    private _symbols: number[] = [];

    get size(): number {
        return this._size;
    }

    constructor(e: number) {
        this._size = 0;
        this._symbols = [];
        this._size = e;
        for (let t = 0; t < e; ++t) {
            this._symbols.push(0);
        }
    }

    public setSymbol(e: number, t: number): void {
        if (e < 0 || this._symbols.length <= e) {
            cc.error("Window setSymbol out of index.");
        } else {
            this._symbols[e] = t;
        }
    }

    public setSymbolWithReel(e: ReelInfo, t: number): void {
        for (let n = 0; n < this._size; ++n) {
            this._symbols[n] = e.getSymbolId((t + n) % e.defaultBand.length);
        }
    }

    public getSymbol(e: number): number {
        if (!(e < 0 || this._symbols.length <= e)) {
            return this._symbols[e];
        }
        cc.error("Window getSymbol out of index.");
    }

    public getSymbolArray(): number[] {
        const e: number[] = [];
        for (let t = 0; t < this._symbols.length; ++t) {
            e.push(this._symbols[t]);
        }
        return e;
    }
}


export class SlotWindows {
    private _windows: Window[] = [];
	private _sizeInfo: number[] = [];

    get size(): number {
        return this._windows.length;
    }

    get sizeInfo(): number[] {
        return this._sizeInfo;
    }

    constructor(e: number[]) {
        this._windows = [];
        this._sizeInfo = e;
        for (let t = 0; t < e.length; ++t) {
            const n = new Window(e[t]);
            this._windows.push(n);
        }
    }

    public GetWindow(e: number): Window | null {
        if (e < 0 || this._windows.length <= e) {
            cc.error("SlotWindows GetWindow out of index.");
            return null;
        }
        return this._windows[e];
    }

    public pushWindow(e: Window): void {
        this._windows.push(e);
    }

    public isSymbolInReel(e: number, t: number): boolean {
        let n = false;
        const o = this.GetWindow(t);
        for (let a = 0; a < o!.size; ++a) {
            if (o!.getSymbol(a) === e) {
                n = true;
                break;
            }
        }
        return n;
    }

    public getSymbolCountInReel(e: number, t: number): number {
        let n = 0;
        const o = this.GetWindow(t);
        for (let a = 0; a < o!.size; ++a) {
            if (o!.getSymbol(a) === e) ++n;
        }
        return n;
    }

    public setWindowSymbols(e: number[][]): void {
        for (let t = 0; t < e.length; ++t) {
            const n = this.GetWindow(t);
            for (let o = 0; o < e[t].length; ++o) {
                n!.setSymbol(o, e[t][o]);
            }
        }
    }
}

@ccclass
export class ReelInfo {
    private _reelInfo: any = null;
	private _symbols: number[] = [];
	private _indexNextSymbol: number = -1;

    get defaultBand(): number[] {
        return this._reelInfo.band;
    }

    get symbols(): number[] {
        return this._symbols;
    }

    constructor() {
        this._reelInfo = null;
        this._symbols = [];
        this._indexNextSymbol = -1;
    }

    public initReel(e: any): void {
        this._reelInfo = e;
        this._symbols = Array.isArray(e) ? e.slice() : e.band.slice();
    }

    public resetReelCurrentReelInfo(): void {
        this._symbols.length = 0;
        this._symbols = null!;
        this._symbols = Array.isArray(this._reelInfo) ? this._reelInfo.slice() : this._reelInfo.band.slice();
    }

    public addSymbol(e: number): void {
        this._symbols.push(e);
    }

    public initReelWithSymbolArray(e: number[]): void {
        this._symbols.length = 0;
        for (let t = 0; t < e.length; ++t) {
            this._symbols.push(e[t]);
        }
    }

    public getSymbolSize(): number {
        return this._symbols.length;
    }

    public getSymbolId(e: number): number {
        if (e >= this._symbols.length) {
            cc.warn("ReelInfo getSymbolId() out of index.");
            e %= this._symbols.length;
        }
        return this._symbols[e];
    }

    public getNextSymbolId(): number {
        if (this._indexNextSymbol >= this._symbols.length) {
            cc.error("ReelInfo getNextSymbolId() out of index.");
        }
        if (this._indexNextSymbol === -1) {
            this._indexNextSymbol = Math.floor(Math.random() * this._symbols.length);
        }
        return this.getSymbolId(this._indexNextSymbol);
    }

    public increaseNextSymbolIndexOppossition(e?: number): void {
        let t = 1;
        if (e != null) t = e;
        this._indexNextSymbol = Math.floor((this._indexNextSymbol + t) % this._symbols.length);
    }

    public increaseNextSymbolIndex(e?: number): void {
        let t = 1;
        if (e != null) t = e;
        if (this._indexNextSymbol - t < 0) {
            this._indexNextSymbol = this.symbols.length + (this._indexNextSymbol - t);
        } else {
            this._indexNextSymbol = this._indexNextSymbol - t;
        }
    }

    public setRandomNextSymbolIndex(): void {
        this._indexNextSymbol = Math.floor(Math.random() * this.symbols.length);
    }

    public setNextSymbolIndex(e: number): void {
        if (e < 0 || e >= this.symbols.length) {
            cc.error("ReelInfo setNextSymbolIndex() out of index.");
        }
        this._indexNextSymbol = e;
    }

    public changeSymbolId(e: number, t: number): void {
        if (e >= this._symbols.length) {
            cc.warn("ReelInfo changeSymbolId() out of index");
            e %= this._symbols.length;
        }
        this._symbols[e] = t;
    }

    public isContainBlankSymbol(): boolean {
        let e = false;
        for (let t = 0; t < this._symbols.length; ++t) {
            if (this._symbols[t] === 0) {
                e = true;
                break;
            }
        }
        return e;
    }

    public checkBlankSymbolAndControlNextSymbolIndex(e: any): void {
        if (this.isContainBlankSymbol()) {
            const t = e.getLastSymbol();
            if ((t.symbolId === 0 && this.getNextSymbolId() === 0) || (t.symbolId !== 0 && this.getNextSymbolId() !== 0)) {
                this.increaseNextSymbolIndex();
            }
        }
    }

    public checkBlankSymbolAndControlNextSymbolIndexOpossitionReel(e: any): void {
        if (this.isContainBlankSymbol()) {
            const t = e.getFirstSymbolForOppositionReel();
            if ((t.symbolId === 0 && this.getNextSymbolId() === 0) || (t.symbolId !== 0 && this.getNextSymbolId() !== 0)) {
                this.increaseNextSymbolIndexOppossition();
            }
        }
    }
}

@ccclass
export class ReelStrip {
    private _name: string = "";
	private _reels: ReelInfo[] = [];

    constructor() {
        this._name = "";
        this._reels = [];
    }

    public initReelStrip(e: string, t: any): boolean {
        this._name = e;
        const n = Object.keys(t);
        for (let o = 0; o < n.length; ++o) {
            const a = n[o];
            const i = new ReelInfo();
            i.initReel(t[a]);
            this._reels.push(i);
        }
        return true;
    }

    public getReel(e: number): ReelInfo | null {
        let t: ReelInfo | null = null;
        let n = false;
        let o: any = null;

        for (const a in SlotGameRuleManager.Instance!._subGames) {
            if (this._name === SlotGameRuleManager.Instance!._subGames[a].physicalReelStripsKey) {
                if (SlotGameRuleManager.Instance!._subGames[a].reelStripsType != null && (SlotGameRuleManager.Instance!._subGames[a].reelStripsType === "weightedRandomCell" || SlotGameRuleManager.Instance!._subGames[a].reelStripsType === "weightedRandomReel")) {
                    o = SlotGameRuleManager.Instance!._subGames[a];
                    n = true;
                }
                break;
            }
        }

        if (n) {
            let i = -1;
            if (Object.keys(SlotGameResultManager.Instance._gameResult.spinResults).length > 0) {
                const l = Object.keys(SlotGameResultManager.Instance._gameResult.spinResults);
                i = SlotGameResultManager.Instance._gameResult.spinResults[l[e]].selectedReelIdx;
            } else {
                i = SlotGameResultManager.Instance._gameResult.spinResult.selectedReelIdx;
            }
            t = i === -1 ? this.getReelInfo(o.physicalReelWRCDefaultNo) : this.getReelInfo(i);
        } else {
            t = this.getReelInfo(e);
        }
        return t;
    }

    public getReelInfo(e: number): ReelInfo | null {
        if (e < 0 || this._reels.length <= e) {
            cc.log("ReelStrip out of index.");
            return null;
        }
        return this._reels[e];
    }

    public getCountReelInfo(): number {
        return this._reels.length;
    }

    public appendReelInfo(e: ReelInfo): void {
        this._reels.push(e);
    }
}

@ccclass
export class PayLine {
    public PAYLINE_LIST_TYPE_CELLNO = "cellNo";
    public payLineListType: string = "";
    private _rows: number[] = [];
	private _lineNum: number = 0;

    get lineNum(): number {
        return this._lineNum;
    }

    constructor() {
        this.PAYLINE_LIST_TYPE_CELLNO = "cellNo";
        this.payLineListType = "";
        this._rows = [];
        this._lineNum = 0;
    }

    public initPayLine(e: number[], t: number, n?: string): void {
        if (n != null && n === this.PAYLINE_LIST_TYPE_CELLNO) {
            this.payLineListType = n;
        }
        this._rows = e.slice();
        this._lineNum = t;
    }

    public getRowByCol(e: number): number {
        if (e < 0 || this._rows.length <= e) {
            cc.error("PayLine getRowByCol is out of index");
            return -1;
        }
        return this._rows[e];
    }

    public getAllRows(): number[] | null {
        let e: number[] | null = null;
        if (this._rows != null) e = this._rows.slice();
        return e;
    }

    public getAllCellPos(e: number): any[] {
        const t: any[] = [];
        if (this.payLineListType === this.PAYLINE_LIST_TYPE_CELLNO) {
            for (let n = 0; n < this._rows.length; ++n) {
                t.push(new Cell(Math.floor(this._rows[n] / e), Math.floor(this._rows[n] % e)));
            }
        } else {
            for (let n = 0; n < this._rows.length; ++n) {
                t.push(new Cell(n, this._rows[n]));
            }
        }
        return t;
    }
}

@ccclass
export class PayLines {
    private _key: string = "";
	private _type: string = "";
	private _payLineListType: string = "";
	private _paylines: PayLine[] = [];

    get type(): string {
        return this._type;
    }

    get paylines(): PayLine[] {
        return this._paylines;
    }

    get payLineListType(): string {
        return this._payLineListType;
    }

    constructor() {
        this._paylines = [];
    }

    public initPayLines(e: string, t: string, n: number[][] | null, o: string): boolean {
        this._key = e;
        this._type = t;
        this._payLineListType = o;
        this._paylines = [];

        if (n != null) {
            for (let a = 0; a < n.length; ++a) {
                const i = new PayLine();
                i.initPayLine(n[a], a, o);
                this._paylines.push(i);
            }
        }
        return true;
    }

    public getKey(): string {
        return this._key;
    }

    public getPayLine(e: number): PayLine | null {
        let t: PayLine | null = null;
        for (let n = 0; n < this._paylines.length; ++n) {
            const o = this._paylines[n];
            if (o.lineNum === e) {
                t = o;
                break;
            }
        }
        return t;
    }

    public getAllPaylineDataArray(): number[][] {
        const e: number[][] = [];
        for (let t = 0; t < this._paylines.length; ++t) {
            const n = this._paylines[t].getAllRows()!;
            e.push(n);
        }
        return e;
    }

    public getAllPaylineCellDataArray(e: number, t?: any): any[][] {
        const n: any[][] = [];
        for (let o = 0; o < this._paylines.length; ++o) {
            const a = this._paylines[o].getAllCellPos(e);
            n.push(a);
        }
        return n;
    }
}

@ccclass
export class Rule {
    private _name: string = "";
	private _highest: boolean = false;
	private _priority: number = 0;
	private _payList: PayInfo[] = [];

    get payList(): PayInfo[] {
        return this._payList;
    }

    constructor() {
        this._name = "";
        this._highest = false;
        this._priority = 0;
        this._payList = [];
    }

    public initRule(e: string, t: any): void {
        this._name = e;
        this._highest = t.highest;
        this._priority = t.priority;
        this._payList = [];

        if (Array.isArray(t.PayList)) {
            for (let n = 0; n < t.PayList.length; ++n) {
                const o = new PayInfo();
                o.initPayInfo(t.PayList[n]);
                this._payList.push(o);
            }
        } else {
            const o = new PayInfo();
            o.initPayInfo(t.PayList);
            this._payList.push(o);
        }
    }
}

@ccclass
export class Paytable {
    private _count: number = 0;
	private _lineBetWinPrize: number = 0;
	private _resultWinPrize: number = 0;

    get count(): number {
        return this._count;
    }

    get lineBetWinPrize(): number {
        return this._lineBetWinPrize;
    }

    get resultWinPrize(): number {
        return this._resultWinPrize;
    }

    constructor() {
        this._count = 0;
        this._lineBetWinPrize = 0;
    }

    public initPayTable(e: any): boolean {
        this._count = e.Count;
        this._lineBetWinPrize = e.LineBetWinPrize;
        if (e.ResultWinPrize !== void 0) this._resultWinPrize = e.ResultWinPrize;
        return true;
    }
}

@ccclass
export class PayInfo {
    private _symbols: number[] = [];
	private _winTriggerRule: string = "";
	private _paytables: Paytable[] = [];

    get winTriggerRule(): string {
        return this._winTriggerRule;
    }

    get symbols(): number[] {
        return this._symbols;
    }

    constructor() {
        this._symbols = [];
        this._winTriggerRule = "";
        this._paytables = [];
    }

    public isMaching(e: number): boolean {
        for (let t = 0; t < this._paytables.length; ++t) {
            if (e === this._paytables[t].count) return true;
        }
        return false;
    }

    public getMachingPayTable(e: number): Paytable | null {
        for (let t = 0; t < this._paytables.length; ++t) {
            const n = this._paytables[t];
            if (e === n.count) return n;
        }
        return null;
    }

    public initWith_PayoutInfo(e: any, t?: number[]): boolean {
        this._symbols = e.symbols.slice();
        if (t) this._symbols = this._symbols.concat(t);
        this._winTriggerRule = e.winTriggerRule;
        return true;
    }

    public initPayInfo(e: any): boolean {
        if (Array.isArray(e.Symbol)) {
            this._symbols = e.Symbol.slice();
        } else {
            this._symbols.push(e.Symbol);
        }
        this._winTriggerRule = e.WinTriggerRule;
        this._paytables = [];

        for (let t = 0; t < e.Paytable.length; ++t) {
            const n = new Paytable();
            n.initPayTable(e.Paytable[t]);
            this._paytables.push(n);
        }
        return true;
    }
}

@ccclass
export class PayRuleHelper {
    public static LeftToRight = "LeftToRight";
	public static onPayline = "onPayline";
	public static onAnyScreen = "on Any Screen";
	public static onScreen = "on Screen";
	public static AnyPayline = "AnyPayline";
	public static winTriggerOnPayLine = [PayRuleHelper.LeftToRight, PayRuleHelper.onPayline];

    constructor() {}

    public static isWinTriggerOnPayLine(t: string): boolean {
        return PayRuleHelper.winTriggerOnPayLine.indexOf(t) !== -1;
    }
}