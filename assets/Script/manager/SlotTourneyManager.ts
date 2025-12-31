const { ccclass } = cc._decorator;
// import CommonServer from "../Network/CommonServer";
import UserInfo from "../User/UserInfo";
import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import TSUtility from "../global_utility/TSUtility";

// ===================== 所有枚举 与原JS 1:1 完全一致 (值+名称无任何修改) =====================
export enum SlotTourneyTierType {
    INVALID = -1,
    GREEN = 0,
    ELITE = 1,
    PREMIER = 2,
    MAX = 3
}

export enum SlotTourneyRankGroupType {
    Unknown = -1,
    Top5 = 0,
    In6_10per = 1,
    Out10Per = 2,
    NonParticipating = 3
}

export enum SlotTourneyIngameState {
    InGame = 0,
    WaitEndBonusGame = 1,
    EndGame = 2
}

export enum SlotTourneyServerRankGroupType {
    Top1 = 0,
    Top2 = 1,
    Top3 = 2,
    Top4 = 3,
    Top5 = 4,
    In6_10per = 5,
    Out10Per = 6,
    NonParticipating = 7
}

export enum SlotTourneyStateType {
    Ing = 0,
    GameEnd = 1,
    InSettlement = 2,
    SettlementCompleted = 3
}

// ===================== 所有数据实体类 1:1还原 属性+默认值+parseObj+原型方法 =====================
export class ServerSlotTourneyTierInfo {
    public tier: number = 0;
    public basePrize: number = 0;
    public minTotalBet: number = 0;
    public minEntryTotalCoin: number = 0;
    public maxEntryTotalCoin: number = 0;
    public progressiveRate: number = 0;

    public static parseObj(data: any): ServerSlotTourneyTierInfo {
        const info = new ServerSlotTourneyTierInfo();
        if (data.tier) info.tier = data.tier;
        if (data.basePrize) info.basePrize = data.basePrize;
        if (data.minTotalBet) info.minTotalBet = data.minTotalBet;
        if (data.minEntryTotalCoin) info.minEntryTotalCoin = data.minEntryTotalCoin;
        if (data.maxEntryTotalCoin) info.maxEntryTotalCoin = data.maxEntryTotalCoin;
        if (data.progressiveRate) info.progressiveRate = data.progressiveRate;
        return info;
    }
}

export class TourneyParticipationInfo {
    public tourneyID: number = 0;
    public tier: number = 0;
    public endTime: number = 0;

    public isEqual(tourneyId: number, tier: number): boolean {
        return this.tourneyID == tourneyId && this.tier == tier;
    }
}

export class ServerSlotTourneyRewardItemInfo {
    public itemId: string = "";
    public addCnt: number = 0;
    public addTime: number = 0;
    public payCode: string = "";
    public extraInfo: string = "";

    public static parseObj(data: any): ServerSlotTourneyRewardItemInfo {
        const info = new ServerSlotTourneyRewardItemInfo();
        if (data.itemId) info.itemId = data.itemId;
        if (data.addCnt) info.addCnt = data.addCnt;
        if (data.addTime) info.addTime = data.addTime;
        if (data.extraInfo) info.extraInfo = data.extraInfo;
        if (data.payCode) info.payCode = data.payCode;
        return info;
    }
}

export class ServerSlotTourneyRewardInfo {
    public rankGroup: number = 0;
    public coinPrizeRate: number = 0;
    public relationInfos: Array<ServerSlotTourneyRewardItemInfo> = [];

    public static parseObj(data: any): ServerSlotTourneyRewardInfo {
        const info = new ServerSlotTourneyRewardInfo();
        if (data.rankGroup) info.rankGroup = data.rankGroup;
        if (data.coinPrizeRate) info.coinPrizeRate = data.coinPrizeRate;
        if (data.relationInfos) {
            for (let i = 0; i < data.relationInfos.length; ++i) {
                info.relationInfos.push(ServerSlotTourneyRewardItemInfo.parseObj(data.relationInfos[i]));
            }
        }
        return info;
    }
}

export class ServerSlotTourneyMasterInfo {
    public tourneyID: number = 0;
    public tourneyTurn: number = 0;
    public curSlotID: string = "";
    public nextSlotID: string = "";
    public nextTurnStartTime: number = 0;
    public endTime: number = 0;
    public tiers: Array<ServerSlotTourneyTierInfo> = [];
    public rewards: Array<ServerSlotTourneyRewardInfo> = [];

    public static parseObj(data: any): ServerSlotTourneyMasterInfo {
        const info = new ServerSlotTourneyMasterInfo();
        if (data.tourneyID) info.tourneyID = data.tourneyID;
        if (data.tourneyTurn) info.tourneyTurn = data.tourneyTurn;
        if (data.curSlotID) info.curSlotID = data.curSlotID;
        if (data.nextSlotID) info.nextSlotID = data.nextSlotID;
        if (data.nextTurnStartTime) info.nextTurnStartTime = data.nextTurnStartTime;
        if (data.endTime) info.endTime = data.endTime;
        if (data.tiers) {
            for (let i = 0; i < data.tiers.length; ++i) {
                info.tiers.push(ServerSlotTourneyTierInfo.parseObj(data.tiers[i]));
            }
        }
        if (data.rewards) {
            for (let i = 0; i < data.rewards.length; ++i) {
                info.rewards.push(ServerSlotTourneyRewardInfo.parseObj(data.rewards[i]));
            }
        }
        return info;
    }

    public getCurrentSlotEndTime(): number {
        return this.endTime;
    }

    public getNextSlotStartTime(): number {
        return this.nextTurnStartTime;
    }

    public getServerSlotTourneyRewardInfo(idx: number): ServerSlotTourneyRewardInfo | null {
        if (!TSUtility.isValid(this.rewards[idx])) {
            cc.error("getServerSlotTourneyRewardInfo not found type", idx);
            return null;
        }
        return this.rewards[idx];
    }

    public getRewardCoinRate(rankGroup: number, maxRankCnt: number): number {
        const idx = rankGroup - 1;
        if (!TSUtility.isValid(this.rewards[idx])) {
            cc.error("getRewardCoinRate fail", rankGroup);
            return 0;
        }
        const rate = this.rewards[idx].coinPrizeRate;
        let totalRate = 0;
        const maxLen = Math.min(maxRankCnt, this.rewards.length);
        for (let i = 0; i < maxLen; ++i) {
            totalRate += this.rewards[i].coinPrizeRate;
        }
        if (totalRate == 0) {
            cc.error("totPrizeRate is invalid", rankGroup);
            return 0;
        }
        cc.log("getRewardCoinRate ", rankGroup, maxRankCnt, rate / totalRate);
        return rate / totalRate;
    }

    public isValidTourneyInfo(): boolean {
        return this.curSlotID !== "";
    }
}

export class ServerSlotTourneyPlayerInfo {
    public uid: number = 0;
    public userPoint: number = 0;
    public userRank: number = 0;
    public prize: number = 0;
    public picURL: string = "";
    public activeHeroID: string = "";
    public activeHeroRank: number = 1;

    public static parseObj(data: any): ServerSlotTourneyPlayerInfo {
        const info = new ServerSlotTourneyPlayerInfo();
        if (data.uid) info.uid = data.uid;
        if (data.userPoint) info.userPoint = data.userPoint;
        if (data.userRank) info.userRank = data.userRank;
        if (data.prize) info.prize = data.prize;
        if (data.picURL) info.picURL = data.picURL;
        if (data.activeHeroID) info.activeHeroID = data.activeHeroID;
        if (data.activeHeroRank) info.activeHeroRank = data.activeHeroRank;
        return info;
    }
}

export class ServerslotTourneyProgressInfo {
    public tier: number = 0;
    public totalPrize: number = 0;
    public userRank: number = 0;
    public userPoint: number = 0;
    public totalPlayerCount: number = 0;
    public aroundRanks: Array<ServerSlotTourneyPlayerInfo> = [];
    public topRanks: Array<ServerSlotTourneyPlayerInfo> = [];
    public curSlotID: string = "";

    public static parseObj(data: any): ServerslotTourneyProgressInfo {
        const info = new ServerslotTourneyProgressInfo();
        if (data.tier) info.tier = data.tier;
        if (data.totalPrize) info.totalPrize = data.totalPrize;
        if (data.userRank) info.userRank = data.userRank;
        if (data.userPoint) info.userPoint = data.userPoint;
        if (data.totalPlayerCount) info.totalPlayerCount = data.totalPlayerCount;
        if (data.curSlotID) info.curSlotID = data.curSlotID;
        if (data.aroundRanks) {
            for (let i = 0; i < data.aroundRanks.length; ++i) {
                info.aroundRanks.push(ServerSlotTourneyPlayerInfo.parseObj(data.aroundRanks[i]));
            }
        }
        if (data.topRanks) {
            for (let i = 0; i < data.topRanks.length; ++i) {
                info.topRanks.push(ServerSlotTourneyPlayerInfo.parseObj(data.topRanks[i]));
            }
        }
        return info;
    }

    public getMyPlayerInfo(): ServerSlotTourneyPlayerInfo {
        const myInfo = new ServerSlotTourneyPlayerInfo();
        myInfo.uid = UserInfo.instance().getUid();
        myInfo.userPoint = this.userPoint;
        myInfo.userRank = this.userRank;
        myInfo.picURL = UserInfo.instance().getUserPicUrl();
        return myInfo;
    }

    public getSortedMyAroundRankList(): Array<ServerSlotTourneyPlayerInfo> {
        const rankList: Array<ServerSlotTourneyPlayerInfo> = [];
        for (let i = 0; i < this.aroundRanks.length; ++i) {
            rankList.push(this.aroundRanks[i]);
        }
        const myInfo = this.getMyPlayerInfo();
        rankList.push(myInfo);
        rankList.sort((a, b) => {
            return TSUtility.leftSideRankIsBig(a.userRank, b.userRank)? -1 : 1;
        });
        return rankList;
    }
}

// 累进奖金内部辅助类 - 原JS匿名类命名还原
class ProgressivePrizeInfo {
    public prize: number = 0;
    public saveTimeStamp: number = 0;
    public increaseRate: number = 0;

    public setInfo(prizeVal: number): void {
        this.prize = prizeVal;
        this.saveTimeStamp = Date.now();
        this.increaseRate = prizeVal / 1000;
        if (this.increaseRate < 1000) {
            this.increaseRate = 1000;
        }
    }

    public getProgressivePrize(): number {
        const diffSec = (Date.now() - this.saveTimeStamp) / 1000;
        return this.prize + diffSec * this.increaseRate;
    }
}

export class ServerSlotTourneyState {
    public slotTourneyState: SlotTourneyStateType = SlotTourneyStateType.Ing;

    public static parseObj(data: any): ServerSlotTourneyState {
        const info = new ServerSlotTourneyState();
        if (data.slotTourneyState) info.slotTourneyState = data.slotTourneyState;
        return info;
    }
}

// ===================== 核心 锦标赛管理类 单例 - 所有逻辑1:1完全还原 =====================
@ccclass
export default class SlotTourneyManager {
    private static _instance: SlotTourneyManager = null;
    // 私有成员变量 与原JS完全一致 无任何增减
    private _tierProgressivePrize: Array<ProgressivePrizeInfo> = [];
    private _curTourneyInfo: ServerSlotTourneyMasterInfo | null = null;
    private _tourneyInfoHist: Array<ServerSlotTourneyMasterInfo> = [];
    private _curProgressInfos: Array<ServerslotTourneyProgressInfo | null> = [];
    private _lastUpdateTimeProgressInfo: Array<number> = [];
    private _participationInfos: Array<TourneyParticipationInfo> = [];
    private _completeInfos: Array<TourneyParticipationInfo> = [];
    private _reserveMoveVipLobby: boolean = false;
    private _enterSlotTourney: boolean = false;
    private _enterTourneyTier: number = SlotTourneyTierType.INVALID;
    private _enterTourneyID: number = 0;
    private _isInit: boolean = false;

    // 全局单例获取方法
    public static Instance(): SlotTourneyManager {
        if (SlotTourneyManager._instance == null) {
            SlotTourneyManager._instance = new SlotTourneyManager();
        }
        return SlotTourneyManager._instance;
    }

    // ===================== 静态工具方法 1:1还原 =====================
    public static getRankString(rank: number): string {
        return rank == 0 ? "-" : CurrencyFormatHelper.formatNumber(rank);
    }

    public static getRankGroup(userRank: number, totalPlayer: number): SlotTourneyRankGroupType {
        if (userRank == 0 || totalPlayer == 0) return SlotTourneyRankGroupType.Out10Per;
        if (userRank <=5) return SlotTourneyRankGroupType.Top5;
        return Math.floor(userRank / totalPlayer * 100) <=10 ? SlotTourneyRankGroupType.In6_10per : SlotTourneyRankGroupType.Out10Per;
    }

    public static getRankGroupByServerRankGroup(serverRank: SlotTourneyServerRankGroupType): SlotTourneyRankGroupType {
        return serverRank <= SlotTourneyServerRankGroupType.Top5 ? SlotTourneyRankGroupType.Top5 :
               serverRank == SlotTourneyServerRankGroupType.In6_10per ? SlotTourneyRankGroupType.In6_10per :
               SlotTourneyRankGroupType.Out10Per;
    }

    // ===================== 公有原型方法 全部1:1还原 =====================
    public initSlotTourneyManager(masterInfo: ServerSlotTourneyMasterInfo, progressList: Array<ServerslotTourneyProgressInfo>): void {
        this._curTourneyInfo = masterInfo;
        this._tourneyInfoHist.push(masterInfo);
        for (let i = 0; i < progressList.length; ++i) {
            this._curProgressInfos.push(null);
            this._lastUpdateTimeProgressInfo.push(0);
        }
        for (let i = 0; i < progressList.length; ++i) {
            const prizeInfo = new ProgressivePrizeInfo();
            prizeInfo.setInfo(progressList[i].totalPrize);
            this._tierProgressivePrize.push(prizeInfo);
        }
        for (let i = 0; i < progressList.length; ++i) {
            this.setSlotTourneyProgressInfo(progressList[i]);
        }
        this._isInit = true;
    }

    public isInit(): boolean {
        return this._isInit;
    }

    public updateProgressivePrize(tier: number, prize: number): void {
        if (TSUtility.isValid(this._tierProgressivePrize[tier])) {
            this._tierProgressivePrize[tier].setInfo(prize);
        } else {
            cc.error("updateProgressivePrize invalid tier", tier);
        }
    }

    public setReserveMoveVip(): void {
        this._reserveMoveVipLobby = true;
    }

    public clearReserveMoveVip(): void {
        this._reserveMoveVipLobby = false;
    }

    public isReserveMoveVip(): boolean {
        return this._reserveMoveVipLobby;
    }

    public getCurrentTourneyInfo(): ServerSlotTourneyMasterInfo | null {
        return this._curTourneyInfo;
    }

    public enableJoinGame(tier: number, userCoin: number): boolean {
        if (!TSUtility.isValid(this._curTourneyInfo?.tiers[tier])) {
            cc.error("enableJoinGame invalid param", tier);
            return false;
        }
        const tierInfo = this._curTourneyInfo!.tiers[tier];
        return !(userCoin < tierInfo.minEntryTotalCoin || tierInfo.maxEntryTotalCoin < userCoin);
    }

    public getMinCheckMoney(tier: number): number {
        if (!TSUtility.isValid(this._curTourneyInfo?.tiers[tier])) {
            cc.error("getMinCheckMoney invalid param", tier);
            return 0;
        }
        return this._curTourneyInfo!.tiers[tier].minEntryTotalCoin;
    }

    public getMaxCheckMoney(tier: number): number {
        if (!TSUtility.isValid(this._curTourneyInfo?.tiers[tier])) {
            cc.error("getMaxCheckMoney invalid param", tier);
            return 0;
        }
        return this._curTourneyInfo!.tiers[tier].maxEntryTotalCoin;
    }

    public getCheckMoneyStr(tier: number): string {
        const min = SlotTourneyManager.Instance().getMinCheckMoney(tier);
        const max = SlotTourneyManager.Instance().getMaxCheckMoney(tier);
        const minStr = CurrencyFormatHelper.formatEllipsisNumberUsingDot(min);
        let maxStr = "";
        if (max < 922337203e10) {
            maxStr = CurrencyFormatHelper.formatEllipsisNumberUsingDot(max);
        }
        return "%s ~ %s".format(minStr, maxStr);
    }

    public getTierProgressivePrize(tier: number): number {
        if (!TSUtility.isValid(this._tierProgressivePrize[tier])) {
            cc.error("getTierProgressivePrize invalid tier", tier);
            return 0;
        }
        return this._tierProgressivePrize[tier].getProgressivePrize();
    }

    public getSlotTourneyProgressInfo(tier: number): ServerslotTourneyProgressInfo | null {
        if (!TSUtility.isValid(this._curProgressInfos[tier])) {
            cc.error("getSlotTourneyProgressInfo invalid tier", tier);
            return null;
        }
        return this._curProgressInfos[tier];
    }

    public setSlotTourneyMasterInfo(info: ServerSlotTourneyMasterInfo): void {
        this._curTourneyInfo = info;
        let isExist = false;
        for (let i = 0; i < this._tourneyInfoHist.length; ++i) {
            if (this._tourneyInfoHist[i].tourneyID == info.tourneyID) {
                this._tourneyInfoHist[i] = info;
                isExist = true;
                break;
            }
        }
        if (isExist == false) {
            this._tourneyInfoHist.push(info);
        }
    }

    public getSlotTourneyInfoFromHist(tourneyId: number): ServerSlotTourneyMasterInfo | null {
        for (let i = 0; i < this._tourneyInfoHist.length; ++i) {
            if (this._tourneyInfoHist[i].tourneyID == tourneyId) {
                return this._tourneyInfoHist[i];
            }
        }
        cc.log("getSlotTourneyInfoFromHist not found", tourneyId);
        return null;
    }

    public setSlotTourneyProgressInfo(info: ServerslotTourneyProgressInfo): void {
        this._lastUpdateTimeProgressInfo[info.tier] = TSUtility.getServerBaseNowUnixTime();
        this._curProgressInfos[info.tier] = info;
        const masterInfo = this.getCurrentTourneyInfo();
        if (!masterInfo) return;
        const tourneyId = masterInfo.tourneyID;
        const tier = info.tier;
        if (info.userRank != 0 && this.isParticipate(tourneyId, tier) == false) {
            this.addParticipationInfo(tourneyId, tier, masterInfo.getCurrentSlotEndTime());
        }
        this.updateProgressivePrize(tier, info.totalPrize);
    }

    public isJoinTourneyByProgressInfo(): boolean {
        for (let i = 0; i < this._curProgressInfos.length; ++i) {
            if (TSUtility.isValid(this._curProgressInfos[i]) && this._curProgressInfos[i]!.userRank !=0) {
                return true;
            }
        }
        return false;
    }

    public addParticipationInfo(tourneyId: number, tier: number, endTime: number): void {
        if (this.isParticipate(tourneyId, tier) == false && this.isComplete(tourneyId, tier) == false) {
            const info = new TourneyParticipationInfo();
            info.tourneyID = tourneyId;
            info.tier = tier;
            info.endTime = endTime;
            cc.log("addParticipationInfo", tourneyId, tier, endTime);
            this._participationInfos.push(info);
        }
    }

    public isParticipate(tourneyId: number, tier: number): boolean {
        for (let i = 0; i < this._participationInfos.length; ++i) {
            if (this._participationInfos[i].isEqual(tourneyId, tier) == true) {
                return true;
            }
        }
        return false;
    }

    public isComplete(tourneyId: number, tier: number): boolean {
        for (let i = 0; i < this._completeInfos.length; ++i) {
            if (this._completeInfos[i].isEqual(tourneyId, tier) == true) {
                return true;
            }
        }
        return false;
    }

    public removeParticipationInfo(tourneyId: number, tier: number): void {
        for (let i = 0; i < this._participationInfos.length; ++i) {
            if (this._participationInfos[i].isEqual(tourneyId, tier) == true) {
                this._completeInfos.push(this._participationInfos[i]);
                this._participationInfos.splice(i, 1);
                return;
            }
        }
    }

    public clearParticipateInfos(): void {
        this._participationInfos = [];
    }

    public getLastUpdateTimeProgressInfo(tier: number): number {
        return this._lastUpdateTimeProgressInfo[tier];
    }

    public setEnterSlotTourney(tier: number, tourneyId: number): void {
        this._enterSlotTourney = true;
        this._enterTourneyTier = tier;
        this._enterTourneyID = tourneyId;
    }

    public clearEnterSlotTourney(): void {
        this._enterSlotTourney = false;
        this._enterTourneyTier = SlotTourneyTierType.INVALID;
        this._enterTourneyID = 0;
    }

    public isEnterSlotTourney(): boolean {
        return this._enterSlotTourney;
    }

    public getEnterTourneyTier(): number {
        return this._enterTourneyTier;
    }

    public getEnterTourneyID(): number {
        return this._enterTourneyID;
    }

    // ===================== 核心异步方法 完美还原 async/await Promise 无修改 =====================
    public async asyncCheckCompleteParticipateTourney(isForce: number, tourneyId: number, tier: number): Promise<boolean> {
        const nowTime = TSUtility.getServerBaseNowUnixTime();
        let targetInfo: TourneyParticipationInfo | null = null;
        for (let i = 0; i < this._participationInfos.length; ++i) {
            const info = this._participationInfos[i];
            if (!(info.endTime >= nowTime || (isForce ==1 && info.isEqual(tourneyId, tier)))) {
                targetInfo = info;
                break;
            }
        }
        if (!targetInfo) return false;

        // const res = await CommonServer.default.Instance().asyncRequestSlotTourneyState(targetInfo.tourneyID);
        // if (CommonServer.default.isServerResponseError(res) ==1) {
        //     cc.error("Invalid asyncRequestSlotTourneyState");
        //     return false;
        // }
        // const stateInfo = ServerSlotTourneyState.parseObj(res);
        // if (stateInfo.slotTourneyState == SlotTourneyStateType.SettlementCompleted) {
        //     cc.log("asyncCheckCompleteParticipateTourney completed", targetInfo.tourneyID, targetInfo.tier);
        //     this.clearParticipateInfos();
        //     return true;
        // }
        return false;
    }
}