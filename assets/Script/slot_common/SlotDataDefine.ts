const { ccclass } = cc._decorator;
import TSUtility from '../global_utility/TSUtility';
import { Utility } from '../global_utility/Utility';

@ccclass
export class SlotJackpotMoney {
    private _saveTimeStamp: number = 0;
    public basePrize: number = 0;
    public originalBaseJackpotMoney: number = 0;
    public baseJackpotMoney: number = 0;
    public maxBasePrize: number = 0;
    public increaseRate: number = 0;
    public minPrize: number = 0;
    public maxPrize: number = 0;
    public linked: boolean = false;
    public linkedKey: string = "";
    public jackpotKey: string = "";

    public setNowJackpot(e: number, t: number, n: number, o: number, a: number, i: number, l: boolean, r: string, s: string): void {
        this.basePrize = e;
        this.originalBaseJackpotMoney = t;
        this.baseJackpotMoney = .98 * t;
        this.maxBasePrize = n;
        this.increaseRate = o;
        this.minPrize = a;
        this.maxPrize = i;
        this.linked = l;
        this.linkedKey = r;
        this._saveTimeStamp = Date.now();
        this.jackpotKey = s;
    }

    public getJackpotForDisplay(): number {
        var e = (Date.now() - this._saveTimeStamp) / 1e3;
        return this.baseJackpotMoney + e * this.increaseRate + this.basePrize;
    }

    public getJackpotByCoinSize(e: number, t: number): number {
        var n = (Date.now() - this._saveTimeStamp) / 1e3;
        return this.basePrize * e + (this.baseJackpotMoney + n * this.increaseRate) * (e / t);
    }

    public getJackpotForLobbySlot(): number {
        var e = (Date.now() - this._saveTimeStamp) / 1e3;
        return this.baseJackpotMoney + e * this.increaseRate + this.maxBasePrize;
    }

    public isProgressiveJackpot(): boolean {
        return 0 != this.increaseRate;
    }

    public getBunningState(): number {
        var e = this.originalBaseJackpotMoney;
        return e < this.minPrize ? 0 : e < this.minPrize + .1 * (this.maxPrize - this.minPrize) ? 1 : 2;
    }
}

@ccclass
export class SlotJackpotInfo {
    private _id: string = "";
    private _mapReserveMoney: { [key: string]: SlotJackpotMoney } = {};
    private _hasLinkedJackpot: boolean = false;
    private _likedJackpotKey: string = ""; // ✅ 保留原代码拼写错误 liked 不修正

    constructor(e: string|number) {
        this._id = "";
        this._mapReserveMoney = {};
        this._hasLinkedJackpot = false;
        this._likedJackpotKey = "";
        this._id = e+"";
    }

    public isJackpotMoneyExist(e: string): boolean {
        return !!this._mapReserveMoney[e];
    }

    public getJackpotMoneyByCoinSize(e: string, t: number, n: number): number {
        return this._mapReserveMoney[e] ? this._mapReserveMoney[e].getJackpotByCoinSize(t, n) : (cc.warn("not found jackpot type ", e, " ", this._id), 0);
    }

    public getJackpotMoneyByCoinSizeUsingJackpotKey(e: string, t: number, n: number): number {
        var o: SlotJackpotMoney | null = null;
        for (var a in this._mapReserveMoney) {
            if (o = this._mapReserveMoney[a], 0 == e.localeCompare(o.jackpotKey, void 0, { sensitivity: "base" })) break;
            o = null;
        }
        return null == o ? (cc.warn("not found jackpot key ", e, " ", this._id), 0) : o.getJackpotByCoinSize(t, n);
    }

    public getIncreaseRate(e: string): number {
        var t: SlotJackpotMoney | null = null;
        for (var n in this._mapReserveMoney) {
            if ((t = this._mapReserveMoney[n]).jackpotKey == e) break;
            t = null;
        }
        return null == t ? (cc.warn("not found jackpot key ", e, " ", this._id), 0) : t.increaseRate;
    }

    public getJackpotForDisplayMoney(e: string): number {
        return this._mapReserveMoney[e] ? this._mapReserveMoney[e].getJackpotForDisplay() : (cc.warn("not found jackpot type ", e, " ", this._id), 0);
    }

    public getBunningState(e: string): number {
        return this._mapReserveMoney[e] ? this._mapReserveMoney[e].getBunningState() : (cc.warn("not found jackpot type ", e, " ", this._id), 0);
    }

    public getJackpotForLobbySlot(e: string): number {
        return this._mapReserveMoney[e] ? this._mapReserveMoney[e].getJackpotForLobbySlot() : (cc.warn("not found jackpot type ", e, " ", this._id), 0);
    }

    public isExistJackpotType(e: string): boolean {
        return !!this._mapReserveMoney[e];
    }

    public isExistJackpotKey(e: string): boolean {
        var t = false;
        for (var n in this._mapReserveMoney)
            if (this._mapReserveMoney[n].jackpotKey.toLowerCase() == e.toLowerCase()) {
                t = true; break;
            }
        return t;
    }

    public isProgressiveJackpot(e: string): boolean {
        return this._mapReserveMoney[e] ? this._mapReserveMoney[e].isProgressiveJackpot() : (cc.warn("not found jackpot type ", e, " ", this._id), false);
    }

    public isExistLinkedJackpot(): boolean {
        return this._hasLinkedJackpot;
    }

    public getLinkedJackpotKey(): string {
        return this._likedJackpotKey; // ✅ 保留原代码拼写错误 liked 不修正
    }

    public setJackpotMoney(e: string, t: number, n: number, o: number, i: number, l: number, r: number, s: boolean, c: string, u: string): void {
        this._mapReserveMoney[e] || (this._mapReserveMoney[e] = new SlotJackpotMoney);
        s && (this._hasLinkedJackpot = true, this._likedJackpotKey = c);
        this._mapReserveMoney[e].setNowJackpot(t, n, o, i, l, r, s, c, u);
    }

    public getJackpotMoneyInfo(e: string): SlotJackpotMoney | undefined {
        return this._mapReserveMoney[e];
    }
}

@ccclass
export class FBShareSubInfo {
    public cid: string = "";
    public st: string = "";
    public sl: string = "";
    public ssl: string = "";
    public spt: number = 0;
    public puid: number = 0;
    public img: string = "";
    public tl: string = "";
    public zid: number = 0;

    public static parse(t: any): FBShareSubInfo {
        var n = new FBShareSubInfo;
        return n.cid = t.cid, n.st = t.st, n.sl = t.sl, n.spt = t.spt, n.puid = t.puid, n.img = t.img, n.tl = t.tl, n;
    }
}

@ccclass
export class FBShareInfo {
    public subInfo: FBShareSubInfo | null = null;
    public desc: string = "";

    constructor() {
        this.subInfo = null;
        this.desc = "";
        this.subInfo = new FBShareSubInfo;
    }
}

@ccclass
export class UserSimpleInfo {
    public uid: any = null;
    public name: string = "";
    public picUrl: string = "";
    public createdDate: any = null;
    public lastLoginDate: any = null;
    public totalCoin: number = 0;
    public fbid: string = "";
    public fbasID: string = "";
    public fbInstantID: string = "";
    public lineID: string = "";

    public getUserFBPlatformID(): string {
        return Utility.isFacebookInstant() ? this.fbInstantID : this.fbasID;
    }

    public parseObj(e: any): void {
        this.uid = e.uid;
        this.name = e.name;
        this.picUrl = e.picUrl;
        this.createdDate = e.createdDate;
        this.lastLoginDate = e.lastLoginDate;
        TSUtility.isValid(e.totalCoin) ? this.totalCoin = e.totalCoin : this.totalCoin = 0;
        TSUtility.isValid(e.fbid) ? this.fbid = e.fbid : this.fbid = "";
        TSUtility.isValid(e.fbasID) ? this.fbasID = e.fbasID : TSUtility.isValid(e.fbasid) ? this.fbasID = e.fbasid : this.fbasID = "";
        TSUtility.isValid(e.fbInstantID) ? this.fbInstantID = e.fbInstantID : this.fbInstantID = "";
        TSUtility.isValid(e.lineID) ? this.lineID = e.lineID : this.lineID = "";
    }
}

@ccclass
export class CasinoJackpotWinInfo {
    public user: UserSimpleInfo = new UserSimpleInfo;
    public casinoJackpotWinID: any = null;
	public zoneID: any = null;
	public slotID: any = null;
	public totalPrize: number = 0;
	public betLine: number = 0;
	public betPerLine: number = 0;
	public winDate: any = null;
	public totalBetCoin: number = -1;

    constructor() {
        this.totalBetCoin = -1;
    }

    public static parseObj(t: any): CasinoJackpotWinInfo {
        var n = new CasinoJackpotWinInfo;
        return n.user = new UserSimpleInfo, n.user.parseObj(t.user), n.casinoJackpotWinID = t.casinoJackpotWinID, n.zoneID = t.zoneID, n.slotID = t.slotID, n.totalPrize = t.totalPrize, n.betLine = t.betLine, n.betPerLine = t.betPerLine, n.winDate = t.winDate, null != t.totalBetCoin && (n.totalBetCoin = t.totalBetCoin), n;
    }
}

// 保持原导出顺序
export default {
    SlotJackpotMoney,
    SlotJackpotInfo,
    FBShareInfo,
    FBShareSubInfo,
    CasinoJackpotWinInfo,
    UserSimpleInfo
}