import SDefine from "../global_utility/SDefine";
import UserInfo from "../User/UserInfo";
import TSUtility from "../global_utility/TSUtility";

export class AssetHist {
    beforeCoin: number = 0;
    changeCoin: number = 0;
    totalCoin: number = 0;
    payCode: string = "";
    pseq: number = 0;
    paidCoin: number = 0;

    parseObj(data: any): void {
        this.beforeCoin = data.beforeCoin;
        this.changeCoin = data.changeCoin;
        this.totalCoin = data.totalCoin;
        this.payCode = data.payCode;
        this.pseq = data.pseq;
        this.paidCoin = data.paidCoin;
    }
}

export class ItemHist {
    itemInfo: any = {};
    addCnt: number = 0;
    addTime: number = 0;
    changeInfo: string = "";
    payCode: string = "";
    pseq: number = 0;
    seq: number = 0;

    parseObj(data: any): void {
        this.itemInfo = data.itemInfo;
        if (data.addCnt) this.addCnt = data.addCnt;
        if (data.addTime) this.addTime = data.addTime;
        if (data.changeInfo) this.changeInfo = data.changeInfo;
        if (data.pseq) this.pseq = data.pseq;
        if (data.seq) this.seq = data.seq;
        if (data.payCode) this.payCode = data.payCode;
    }

    get itemId(): number {
        return this.itemInfo.itemId;
    }

    get itemUniqueNo(): any {
        return this.itemInfo.itemUniqueNo;
    }

    get type(): any {
        return this.itemInfo.type;
    }

    get totCnt(): number {
        return this.itemInfo.totCnt;
    }

    get curCnt(): number {
        return this.itemInfo.curCnt;
    }

    get itemExtraInfo(): any {
        return this.itemInfo.extraInfo;
    }

    get regDate(): any {
        return this.itemInfo.regDate;
    }

    get updateDate(): any {
        return this.itemInfo.updateDate;
    }
}

export class VipHist {
    addExp: number = 0;
    totExp: number = 0;
    pseq: number = 0;
    type: string | null = null;

    static readonly POINT_TYPE_PURCHASE: string = "purchase";
    static readonly POINT_TYPE_MEMBERS_BOOST: string = "members_boost";
    static readonly POINT_TYPE_ALMIGHTY_COUPON: string = "almighty_coupon";

    parseObj(data: any): void {
        this.addExp = data.addExp;
        this.totExp = data.totExp;
        this.pseq = data.pseq;
        if (TSUtility.isValid(data.type)) this.type = data.type;
    }

    isType(type: string): boolean {
        return !!TSUtility.isValid(this.type) && type === this.type;
    }
}

export class LevelHist {
    addExp: number = 0;
    totExp: number = 0;
    pseq: number = 0;

    parseObj(data: any): void {
        this.addExp = data.addExp;
        this.totExp = data.totExp;
        this.pseq = data.pseq;
    }
}

export class BingoBallHist {
    addCnt: number = 0;
    totCnt: number = 0;
    payCode: string = "";
    pseq: number = 0;

    parseObj(data: any): void {
        this.addCnt = data.addCnt;
        this.totCnt = data.totCnt;
        this.pseq = data.pseq;
        if (data.payCode) this.payCode = data.payCode;
    }
}

export class PromotionChangeHist {
    pseq: number = 0;
    promotionKey: string = "";
    promotionInfo: any = null;
    changeInfo: string = "";
    seq: number = 0;

    parseObj(data: any): void {
        this.promotionKey = data.promotionKey;
        this.promotionInfo = data.promotionInfo;
        this.changeInfo = data.changeInfo;
        this.pseq = data.pseq;
        this.seq = data.seq;
    }
}

export class HeroPowerGaugeHist {
    addGauge: number = 0;
    curGauge: number = 0;
    beforeLevel: number = 0;
    afterLevel: number = 0;
    pseq: number = 0;
    seq: number = 0;

    parseObj(data: any): void {
        if (data.addGauge) this.addGauge = data.addGauge;
        if (data.curGauge) this.curGauge = data.curGauge;
        if (data.beforeLevel) this.beforeLevel = data.beforeLevel;
        if (data.afterLevel) this.afterLevel = data.afterLevel;
        if (data.pseq) this.pseq = data.pseq;
        if (data.seq) this.seq = data.seq;
    }
}

export class PurchaseAddInfo {
    cash: number = 0;
    avgIn30Days: number = 0;
    avgOverUsd3In30Days: number = 0;
    avgOverUsd3In30Days2: number = 0;
    medOverUsdIn30Days: number = 0;
    lastBuySalePriceIn30Days: number = 0;
    epicWinOfferInfo: any[] = [];
    recordBreakerInfo: any = null;

    parse(data: any): void {
        this.cash = data.cash;
        this.avgIn30Days = data.avgIn30Days;
        this.avgOverUsd3In30Days = data.avgOverUsd3In30Days;
        this.avgOverUsd3In30Days2 = data.avgOverUsd3In30Days2;
        this.lastBuySalePriceIn30Days = data.lastBuySalePriceIn30Days;
        this.epicWinOfferInfo = data.epicWinOfferInfo;
        this.recordBreakerInfo = data.recordBreakerInfo;
        this.medOverUsdIn30Days = data.medOverUsdIn30Days;
    }
}

export class LevelUpReward {
    level: number = 0;
    reward: ChangeResult | null = null;

    parse(data: any, target: ChangeResult): void {
        this.level = data.level;
        this.reward = target.splitChangeResult(data.seq);
    }
}

export class LevelMysteryBoxReward {
    level: number = 0;
    reward: ChangeResult | null = null;

    parse(data: any, target: ChangeResult): void {
        this.level = data.level;
        this.reward = target.splitChangeResult(data.seq);
    }
}

export class VipGradeUpReward {
    level: number = 0;
    reward: ChangeResult | null = null;

    parse(data: any, target: ChangeResult): void {
        this.level = data.level;
        this.reward = target.splitChangeResult(data.seq);
    }
}

export class TripleDiamondJackpotGaugeHist {
    curGauge: number = 0;
    maxGauge: number = 0;
    id: number = 0;
    pseq: number = 0;
    seq: number = 0;

    parse(data: any): void {
        this.curGauge = data.curGauge;
        this.maxGauge = data.maxGauge;
        this.id = data.id;
        this.pseq = data.pseq;
        this.seq = data.seq;
    }
}

export class ThrillWheelJackpotGaugeHist {
    curGauge: number = 0;
    maxGauge: number = 0;
    id: number = 0;
    pseq: number = 0;
    seq: number = 0;

    parse(data: any): void {
        this.curGauge = data.curGauge;
        this.maxGauge = data.maxGauge;
        this.id = data.id;
        this.pseq = data.pseq;
        this.seq = data.seq;
    }
}

export class InboxMessageAddHist {
    obj: any = null;

    get mType(): any {
        return this.obj.message.mType;
    }

    get extraInfo(): any {
        return this.obj.message.extraInfo;
    }

    parse(data: any): void {
        this.obj = {
            message: data.info,
            senderInfo: data.senderInfo
        };
    }
}

export class InboxDeleteHist {
    info: any = null;

    parse(data: any): boolean {
        if (!data || !data.info) return false;
        this.info = data.info;
        return true;
    }

    get mUid(): any {
        return this.info.mUid;
    }
}

export class MissionChangeHist {
    id: number = 0;
    curCnt: number = 0;
    curSubCnt: number = 0;
    seq: number = 0;
    isReset: boolean = false;

    parseObj(data: any): void {
        this.id = data.id;
        this.curCnt = data.curCnt;
        this.seq = data.seq;
        if (data.curSubCnt) this.curSubCnt = data.curSubCnt;
        if (data.isReset) this.isReset = data.isReset;
    }
}

export class clubPointHist {
    beforeGrade: number = 0;
    afterGrade: number = 0;
    clubPoint: number = 0;
    afterPoint: number = 0;

    parseObj(data: any): void {
        if (TSUtility.isValid(data.beforeGrade)) this.beforeGrade = data.beforeGrade;
        if (TSUtility.isValid(data.afterGrade)) this.afterGrade = data.afterGrade;
        if (TSUtility.isValid(data.clubPoint)) this.clubPoint = data.clubPoint;
        if (TSUtility.isValid(data.afterPoint)) this.afterPoint = data.afterPoint;
    }
}

export class ReelQuestPromotionChangeHist {
    actionType: string = "progress";
    group: string = "";
    seasonID: number = 0;
    missionID: number = 0;
    goalCnt: number = 0;
    prevCnt: number = 0;
    curCnt: number = 0;

    parseObj(data: any): void {
        if (data.actionType) this.actionType = data.actionType;
        if (data.group) this.group = data.group;
        if (data.seasonID) this.seasonID = data.seasonID;
        if (data.missionID) this.missionID = data.missionID;
        if (data.goalCnt) this.goalCnt = data.goalCnt;
        if (data.prevCnt) this.prevCnt = data.prevCnt;
        if (data.curCnt) this.curCnt = data.curCnt;
    }
}

export class ReelQuestStageHist {
    actionType: string = "";
    seasonID: number = 0;
    group: string = "";
    prevStage: number = 0;
    curStage: number = 0;
    curMissionSlot: string = "";

    parseObj(data: any): void {
        if (data.actionType) this.actionType = data.actionType;
        if (data.seasonID) this.seasonID = data.seasonID;
        if (data.group) this.group = data.group;
        if (data.prevStage) this.prevStage = data.prevStage;
        if (data.curStage) this.curStage = data.curStage;
        if (data.curMissionSlot) this.curMissionSlot = data.curMissionSlot;
    }
}

export class HeroBonusGaugeHist {
    addGauge: number = 0;
    abilityBonusGauge: number = 0;
    curGauge: number = 0;
    pseq: number = 0;
    seq: number = 0;

    parseObj(data: any): void {
        this.addGauge = data.addGauge;
        this.curGauge = data.curGauge;
        if (data.abilityBonusGauge) this.abilityBonusGauge = data.abilityBonusGauge;
        this.pseq = data.pseq;
        this.seq = data.seq;
    }
}

export default class ChangeResult {
    assetHist: AssetHist[] = [];
    promotionHist: PromotionChangeHist[] = [];
    itemHist: ItemHist[] = [];
    vipHist: VipHist[] = [];
    levelHist: LevelHist[] = [];
    bingoBallHist: BingoBallHist[] = [];
    purchaseInfoHist: PurchaseAddInfo[] = [];
    inboxAddHist: InboxMessageAddHist[] = [];
    inboxDeleteHist: InboxDeleteHist[] = [];
    missionHist: MissionChangeHist[] = [];
    clubPointHist: clubPointHist[] = [];
    tripleDiamondJackpotGaugeHist: TripleDiamondJackpotGaugeHist[] = [];
    tripleThrillJackpotGaugeHist: ThrillWheelJackpotGaugeHist[] = [];
    heroBonusGaugeHist: HeroBonusGaugeHist[] = [];
    heroPowerGaugeHist: HeroPowerGaugeHist[] = [];
    reelQuestHist: ReelQuestPromotionChangeHist[] = [];

    parseObj(data: any): void {
        if (data.assetHist) {
            data.assetHist.forEach((item: any) => {
                const hist = new AssetHist();
                hist.parseObj(item);
                this.assetHist.push(hist);
            });
        }

        if (data.promotionHist) {
            data.promotionHist.forEach((item: any) => {
                const hist = new PromotionChangeHist();
                hist.parseObj(item);
                this.promotionHist.push(hist);
            });
        }

        if (data.itemHist) {
            data.itemHist.forEach((item: any) => {
                const hist = new ItemHist();
                hist.parseObj(item);
                this.itemHist.push(hist);
            });
        }

        if (data.vipHist) {
            data.vipHist.forEach((item: any) => {
                const hist = new VipHist();
                hist.parseObj(item);
                this.vipHist.push(hist);
            });
        }

        if (data.levelHist) {
            data.levelHist.forEach((item: any) => {
                const hist = new LevelHist();
                hist.parseObj(item);
                this.levelHist.push(hist);
            });
        }

        if (data.bingoBallChangeHist) {
            data.bingoBallChangeHist.forEach((item: any) => {
                const hist = new BingoBallHist();
                hist.parseObj(item);
                this.bingoBallHist.push(hist);
            });
        }

        if (data.purchaseInfo) {
            data.purchaseInfo.forEach((item: any) => {
                const hist = new PurchaseAddInfo();
                hist.parse(item);
                this.purchaseInfoHist.push(hist);
            });
        }

        if (data.inboxAddHist) {
            data.inboxAddHist.forEach((item: any) => {
                const hist = new InboxMessageAddHist();
                hist.parse(item);
                this.inboxAddHist.push(hist);
            });
        }

        if (data.inboxDeleteHist) {
            data.inboxDeleteHist.forEach((item: any) => {
                const hist = new InboxDeleteHist();
                if (hist.parse(item)) this.inboxDeleteHist.push(hist);
            });
        }

        if (data.dailyMissionV3Hist) {
            data.dailyMissionV3Hist.forEach((item: any) => {
                const hist = new MissionChangeHist();
                hist.parseObj(item);
                this.missionHist.push(hist);
            });
        }

        if (data.tripleDiamondJackpotGaugeHist) {
            data.tripleDiamondJackpotGaugeHist.forEach((item: any) => {
                const hist = new TripleDiamondJackpotGaugeHist();
                hist.parse(item);
                this.tripleDiamondJackpotGaugeHist.push(hist);
            });
        }

        if (data.tripleThrillJackpotGaugeHist) {
            data.tripleThrillJackpotGaugeHist.forEach((item: any) => {
                const hist = new ThrillWheelJackpotGaugeHist();
                hist.parse(item);
                this.tripleThrillJackpotGaugeHist.push(hist);
            });
        }

        if (data.heroBonusGaugeHist) {
            data.heroBonusGaugeHist.forEach((item: any) => {
                const hist = new HeroBonusGaugeHist();
                hist.parseObj(item);
                this.heroBonusGaugeHist.push(hist);
            });
        }

        if (data.heroPowerGaugeHist) {
            data.heroPowerGaugeHist.forEach((item: any) => {
                const hist = new HeroPowerGaugeHist();
                hist.parseObj(item);
                this.heroPowerGaugeHist.push(hist);
            });
        }

        if (data.reelQuestHist) {
            data.reelQuestHist.forEach((item: any) => {
                const hist = new ReelQuestPromotionChangeHist();
                hist.parseObj(item);
                this.reelQuestHist.push(hist);
            });
        }

        if (data.clubPointHist) {
            data.clubPointHist.forEach((item: any) => {
                const hist = new clubPointHist();
                hist.parseObj(item);
                this.clubPointHist.push(hist);
            });
        }
    }

    hasAnyAssetChange(): boolean {
        return this.assetHist.length > 0 || this.itemHist.length > 0;
    }

    getTotalChangeCoin(): number {
        let total = 0;
        for (const hist of this.assetHist) {
            total += hist.changeCoin;
        }
        return total;
    }

    getTotalChangeBingoBall(): number {
        let total = 0;
        for (const hist of this.bingoBallHist) {
            total += hist.addCnt;
        }
        return total;
    }

    getTotalChangeRewardBingoBall(): number {
        let total = 0;
        for (const hist of this.bingoBallHist) {
            if (hist.addCnt > 0) total += hist.addCnt;
        }
        for (const hist of this.itemHist) {
            if (hist.itemId+"" === SDefine.I_BINGOBALL_OFFER) total += hist.addCnt;
        }
        return total;
    }

    getCheckByPayCode(payCode: string): boolean {
        for (let i = this.assetHist.length - 1; i >= 0; i--) {
            if (this.assetHist[i].payCode === payCode) return true;
        }
        return false;
    }

    getChangeCoinByPayCode(payCode: string): number {
        let total = 0;
        for (let i = this.assetHist.length - 1; i >= 0; i--) {
            if (this.assetHist[i].payCode === payCode) total += this.assetHist[i].changeCoin;
        }
        return total;
    }

    removeChangeCoinByPayCode(payCode: string): number {
        let total = 0;
        let paidCoin = -1;
        for (let i = this.assetHist.length - 1; i >= 0; i--) {
            if (this.assetHist[i].payCode === payCode) {
                total += this.assetHist[i].changeCoin;
                paidCoin = this.assetHist[i].paidCoin;
                this.assetHist.splice(i, 1);
            }
        }
        // if (paidCoin >= 0) UserInfo.instance().addUserAssetPaindMoney(paidCoin);
        return total;
    }

    removeChangeCoinByPayCodeAndMoney(payCode: string, money: number): boolean {
        let isRemove = false;
        let paidCoin = -1;
        for (let i = this.assetHist.length - 1; i >= 0; i--) {
            paidCoin = this.assetHist[i].paidCoin;
            if (this.assetHist[i].payCode === payCode && this.assetHist[i].changeCoin === money) {
                this.assetHist.splice(i, 1);
                isRemove = true;
            }
        }
        // if (paidCoin >= 0) UserInfo.instance().addUserAssetPaindMoney(paidCoin);
        return isRemove;
    }

    subChangeCoinByPayCodeAndMoney(payCode: string, money: number): boolean {
        let isSub = false;
        let paidCoin = -1;
        let subMoney = money;
        for (let i = this.assetHist.length - 1; i >= 0; i--) {
            paidCoin = this.assetHist[i].paidCoin;
            if (this.assetHist[i].payCode === payCode) {
                if (this.assetHist[i].changeCoin >= subMoney) {
                    this.assetHist[i].changeCoin -= subMoney;
                    if (this.assetHist[i].changeCoin === 0) this.assetHist.splice(i, 1);
                    isSub = true;
                    break;
                } else {
                    subMoney -= this.assetHist[i].changeCoin;
                    this.assetHist.splice(i, 1);
                }
            }
        }
        // if (paidCoin >= 0) UserInfo.instance().addUserAssetPaindMoney(paidCoin);
        return isSub;
    }

    subChangeCoinByPayCodeAndMaxMoney(payCode: string, money: number): number {
        let totalSub = 0;
        let paidCoin = -1;
        let subMoney = money;
        for (let i = this.assetHist.length - 1; i >= 0; i--) {
            paidCoin = this.assetHist[i].paidCoin;
            if (this.assetHist[i].payCode === payCode) {
                if (this.assetHist[i].changeCoin >= subMoney) {
                    totalSub += subMoney;
                    this.assetHist[i].changeCoin -= subMoney;
                    if (this.assetHist[i].changeCoin === 0) this.assetHist.splice(i, 1);
                    break;
                } else {
                    totalSub += this.assetHist[i].changeCoin;
                    subMoney -= this.assetHist[i].changeCoin;
                    this.assetHist.splice(i, 1);
                }
            }
        }
        // if (paidCoin >= 0) UserInfo.instance().addUserAssetPaindMoney(paidCoin);
        return totalSub;
    }

    getChangeCoinByPayCodeEachOther(payCode: string): number[] {
        const arr: number[] = [];
        let paidCoin = -1;
        for (let i = this.assetHist.length - 1; i >= 0; i--) {
            paidCoin = this.assetHist[i].paidCoin;
            if (this.assetHist[i].payCode === payCode) arr.push(this.assetHist[i].changeCoin);
        }
        // if (paidCoin >= 0) UserInfo.instance().addUserAssetPaindMoney(paidCoin);
        return arr;
    }

    getTotalChangeVipPoint(): number {
        let total = 0;
        for (const hist of this.vipHist) {
            if (hist.addExp > 0) total += hist.addExp;
        }
        return total;
    }

    getChangeVipPoint(type: string): number {
        let total = 0;
        for (const hist of this.vipHist) {
            if (hist.isType(type) && hist.addExp > 0) total += hist.addExp;
        }
        return total;
    }

    isContainMembersBoosterVipPoint(): boolean {
        for (const hist of this.vipHist) {
            if (hist.type === VipHist.POINT_TYPE_MEMBERS_BOOST) return true;
        }
        return false;
    }

    getTotalChangeLevelPoint(): number {
        let total = 0;
        for (const hist of this.levelHist) {
            total += hist.addExp;
        }
        return total;
    }

    isExistItemId(itemId: number): boolean {
        for (const hist of this.itemHist) {
            if (hist.itemId === itemId) return true;
        }
        return false;
    }

    getItemHistByItemId(itemId: number): ItemHist[] {
        const arr: ItemHist[] = [];
        for (const hist of this.itemHist) {
            if (hist.itemId === itemId) arr.push(hist);
        }
        return arr;
    }

    getPromotionHist(key: string): PromotionChangeHist | null {
        for (const hist of this.promotionHist) {
            if (hist.promotionKey === key) return hist;
        }
        return null;
    }

    splitChangeResultByItemId(itemId: number): ChangeResult {
        const result = new ChangeResult();
        for (let i = this.itemHist.length - 1; i >= 0; i--) {
            if (this.itemHist[i].itemId === itemId) {
                const temp = this.itemHist.splice(i, 1);
                result.itemHist.unshift(...temp);
            }
        }
        const subResult = new ChangeResult();
        for (const hist of result.itemHist) {
            const temp = this.splitChangeResult(hist.seq);
            subResult.addChangeResult(temp);
        }
        result.addChangeResult(subResult);
        return result;
    }

    splitChangeResultByPayCode(payCodes: string[]): ChangeResult | null {
        let result: ChangeResult | null = null;
        for (let i = this.itemHist.length - 1; i >= 0; i--) {
            if (payCodes.includes(this.itemHist[i].payCode)) {
                const temp = this.itemHist.splice(i, 1);
                if (!result) result = new ChangeResult();
                result.itemHist.unshift(...temp);
            }
        }

        for (let i = this.assetHist.length - 1; i >= 0; i--) {
            if (payCodes.includes(this.assetHist[i].payCode)) {
                const temp = this.assetHist.splice(i, 1);
                if (!result) result = new ChangeResult();
                result.assetHist.unshift(...temp);
            }
        }

        for (let i = this.inboxAddHist.length - 1; i >= 0; i--) {
            const hist = this.inboxAddHist[i];
            if (TSUtility.isValid(hist.extraInfo)) {
                const info = JSON.parse(hist.extraInfo);
                if (TSUtility.isValid(info) && TSUtility.isValid(info.payCode) && payCodes.includes(info.payCode)) {
                    const temp = this.inboxAddHist.splice(i, 1);
                    if (!result) result = new ChangeResult();
                    result.inboxAddHist.unshift(...temp);
                }
            }
        }
        return result;
    }

    splitChangeResult_BingoBallHistByPayCode(payCode: string): ChangeResult {
        const result = new ChangeResult();
        for (let i = this.bingoBallHist.length - 1; i >= 0; i--) {
            if (this.bingoBallHist[i].payCode === payCode) {
                const temp = this.bingoBallHist.splice(i, 1);
                result.bingoBallHist.unshift(...temp);
            }
        }
        return result;
    }

    splitChangeResultByItemOrder(index: number): ChangeResult {
        const result = new ChangeResult();
        if (index > this.itemHist.length) return result;
        const temp = this.itemHist.splice(index, 1);
        result.itemHist.unshift(...temp);
        const subResult = new ChangeResult();
        for (const hist of result.itemHist) {
            const tempRes = this.splitChangeResult(hist.seq);
            subResult.addChangeResult(tempRes);
        }
        result.addChangeResult(subResult);
        return result;
    }

    splitChangeResultByPromotionInfo(key: string): ChangeResult {
        const result = new ChangeResult();
        for (let i = this.promotionHist.length - 1; i >= 0; i--) {
            if (this.promotionHist[i].promotionKey === key) {
                const temp = this.promotionHist.splice(i, 1);
                result.promotionHist.unshift(...temp);
            }
        }
        const subResult = new ChangeResult();
        for (const hist of result.promotionHist) {
            const tempRes = this.splitChangeResult(hist.seq);
            subResult.addChangeResult(tempRes);
        }
        result.addChangeResult(subResult);
        return result;
    }

    splitChangeResult_HeroPowerGaugeHist(): ChangeResult {
        const result = new ChangeResult();
        for (let i = this.heroPowerGaugeHist.length - 1; i >= 0; i--) {
            const temp = this.heroPowerGaugeHist.splice(i, 1);
            result.heroPowerGaugeHist.unshift(...temp);
        }
        return result;
    }

    splitChangeResultByPromotionInfoNotSplitItem(key: string): ChangeResult {
        const result = new ChangeResult();
        for (let i = this.promotionHist.length - 1; i >= 0; i--) {
            if (this.promotionHist[i].promotionKey === key) {
                const temp = this.promotionHist.splice(i, 1);
                result.promotionHist.unshift(...temp);
            }
        }
        return result;
    }

    splitChangeResultByMission(): ChangeResult {
        const result = new ChangeResult();
        for (let i = this.missionHist.length - 1; i >= 0; i--) {
            const temp = this.missionHist.splice(i, 1);
            result.missionHist.unshift(...temp);
        }
        const subResult = new ChangeResult();
        for (const hist of result.missionHist) {
            const tempRes = this.splitChangeResult(hist.seq);
            subResult.addChangeResult(tempRes);
        }
        result.addChangeResult(subResult);
        return result;
    }

    splitChangeResult_Inbox(): ChangeResult {
        const result = new ChangeResult();
        for (let i = this.inboxAddHist.length - 1; i >= 0; i--) {
            const temp = this.inboxAddHist.splice(i, 1);
            result.inboxAddHist.unshift(...temp);
        }
        for (let i = this.inboxDeleteHist.length - 1; i >= 0; i--) {
            const temp = this.inboxDeleteHist.splice(i, 1);
            result.inboxDeleteHist.unshift(...temp);
        }
        return result;
    }

    splitChangeResult(pseq: number): ChangeResult {
        const result = new ChangeResult();
        for (let i = this.assetHist.length - 1; i >= 0; i--) {
            if (this.assetHist[i].pseq === pseq) {
                const temp = this.assetHist.splice(i, 1);
                result.assetHist.unshift(...temp);
            }
        }

        for (let i = this.promotionHist.length - 1; i >= 0; i--) {
            if (this.promotionHist[i].pseq === pseq) {
                const temp = this.promotionHist.splice(i, 1);
                result.promotionHist.unshift(...temp);
            }
        }

        for (let i = this.itemHist.length - 1; i >= 0; i--) {
            if (this.itemHist[i].pseq === pseq) {
                const temp = this.itemHist.splice(i, 1);
                result.itemHist.unshift(...temp);
            }
        }

        for (let i = this.vipHist.length - 1; i >= 0; i--) {
            if (this.vipHist[i].pseq === pseq) {
                const temp = this.vipHist.splice(i, 1);
                result.vipHist.unshift(...temp);
            }
        }

        for (let i = this.levelHist.length - 1; i >= 0; i--) {
            if (this.levelHist[i].pseq === pseq) {
                const temp = this.levelHist.splice(i, 1);
                result.levelHist.unshift(...temp);
            }
        }

        for (let i = this.bingoBallHist.length - 1; i >= 0; i--) {
            if (this.bingoBallHist[i].pseq === pseq) {
                const temp = this.bingoBallHist.splice(i, 1);
                result.bingoBallHist.unshift(...temp);
            }
        }

        for (let i = 0; i < this.heroBonusGaugeHist.length; i++) {
            if (this.heroBonusGaugeHist[i].pseq === pseq) {
                const temp = this.heroBonusGaugeHist.slice(i, 1);
                result.heroBonusGaugeHist.unshift(...temp);
            }
        }

        for (let i = 0; i < this.heroPowerGaugeHist.length; i++) {
            if (this.heroPowerGaugeHist[i].pseq === pseq) {
                const temp = this.heroPowerGaugeHist.slice(i, 1);
                result.heroPowerGaugeHist.unshift(...temp);
            }
        }
        return result;
    }

    addChangeResult(target: ChangeResult): void {
        this.assetHist.push(...target.assetHist);
        this.promotionHist.push(...target.promotionHist);
        this.itemHist.push(...target.itemHist);
        this.vipHist.push(...target.vipHist);
        this.levelHist.push(...target.levelHist);
        this.bingoBallHist.push(...target.bingoBallHist);
        this.purchaseInfoHist.push(...target.purchaseInfoHist);
        this.inboxAddHist.push(...target.inboxAddHist);
        this.inboxDeleteHist.push(...target.inboxDeleteHist);
        this.missionHist.push(...target.missionHist);
        this.tripleDiamondJackpotGaugeHist.push(...target.tripleDiamondJackpotGaugeHist);
        this.tripleThrillJackpotGaugeHist.push(...target.tripleThrillJackpotGaugeHist);
        this.heroBonusGaugeHist.push(...target.heroBonusGaugeHist);
        this.heroPowerGaugeHist.push(...target.heroPowerGaugeHist);
        this.reelQuestHist.push(...target.reelQuestHist);
        this.clubPointHist.push(...target.clubPointHist);
        target.clear();
    }

    clear(): void {
        this.assetHist = [];
        this.promotionHist = [];
        this.itemHist = [];
        this.vipHist = [];
        this.levelHist = [];
        this.bingoBallHist = [];
        this.purchaseInfoHist = [];
        this.inboxAddHist = [];
        this.inboxDeleteHist = [];
        this.missionHist = [];
        this.tripleDiamondJackpotGaugeHist = [];
        this.tripleThrillJackpotGaugeHist = [];
        this.heroBonusGaugeHist = [];
        this.heroPowerGaugeHist = [];
        this.reelQuestHist = [];
        this.clubPointHist = [];
    }
}

export class RewardResult {
    levelUpRewards: LevelUpReward[] = [];
    levelMysteryBoxRewards: LevelMysteryBoxReward[] = [];
    vipGradeUpRewards: VipGradeUpReward[] = [];

    static parse(data: any, target: ChangeResult): RewardResult {
        const result = new RewardResult();
        if (data.levelMysteryBoxReward) {
            data.levelMysteryBoxReward.forEach((item: any) => {
                const reward = new LevelMysteryBoxReward();
                reward.parse(item, target);
                result.levelMysteryBoxRewards.push(reward);
            });
        }

        if (data.levelUpReward) {
            data.levelUpReward.forEach((item: any) => {
                const reward = new LevelUpReward();
                reward.parse(item, target);
                result.levelUpRewards.push(reward);
            });
        }

        if (data.vipGradeUpReward) {
            data.vipGradeUpReward.forEach((item: any) => {
                const reward = new VipGradeUpReward();
                reward.parse(item, target);
                result.vipGradeUpRewards.push(reward);
            });
        }
        return result;
    }

    resetRewardResult(): void {
        this.levelMysteryBoxRewards = [];
        this.levelUpRewards = [];
        this.vipGradeUpRewards = [];
    }

    addRewardResult(target: RewardResult): void {
        this.levelMysteryBoxRewards.push(...target.levelMysteryBoxRewards);
        this.levelUpRewards.push(...target.levelUpRewards);
        this.vipGradeUpRewards.push(...target.vipGradeUpRewards);
    }

    removeVipGradeUpReward(level: number): VipGradeUpReward | null {
        for (let i = 0; i < this.vipGradeUpRewards.length; i++) {
            if (this.vipGradeUpRewards[i].level === level) {
                return this.vipGradeUpRewards.splice(i, 1)[0];
            }
        }
        return null;
    }

    removeLevelUpReward(level: number): LevelUpReward | null {
        for (let i = 0; i < this.levelUpRewards.length; i++) {
            if (this.levelUpRewards[i].level === level) {
                return this.levelUpRewards.splice(i, 1)[0];
            }
        }
        return null;
    }

    removeLevelMysteryBoxReward(level: number): LevelMysteryBoxReward | null {
        for (let i = 0; i < this.levelMysteryBoxRewards.length; i++) {
            if (this.levelMysteryBoxRewards[i].level === level) {
                return this.levelMysteryBoxRewards.splice(i, 1)[0];
            }
        }
        return null;
    }

    getLevelMysteryBoxReward(level: number): LevelMysteryBoxReward | null {
        for (const reward of this.levelMysteryBoxRewards) {
            if (reward.level === level) return reward;
        }
        return null;
    }
}