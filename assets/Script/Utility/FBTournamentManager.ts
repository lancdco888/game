import TSUtility from "../global_utility/TSUtility";

/**
 * Facebook锦标赛 基础信息数据模型
 */
export class FBTournamentInfo {
    public tournamentID: string = "";
    public contextID: string = "";
    public title: string = "";
    public endTime: number = 0;
    public payload: string = "";

    /** 静态解析方法 - 解析JSON数据为当前模型实例 */
    public static parseObj(obj: any): FBTournamentInfo {
        const info = new FBTournamentInfo();
        if (obj.tournamentID) info.tournamentID = obj.tournamentID;
        if (obj.contextID) info.contextID = obj.contextID;
        if (obj.title) info.title = obj.title;
        if (obj.endTime) info.endTime = obj.endTime;
        if (obj.payload) info.payload = obj.payload;
        return info;
    }

    /** 判断当前赛事是否有效（未过期） */
    public isAvailable(): boolean {
        const currUnixTime = TSUtility.getServerBaseNowUnixTime();
        return this.endTime > currUnixTime;
    }
}

/**
 * Facebook锦标赛 玩家排名信息数据模型
 */
export class FBTournamentRankInfo {
    public tournamentID: string = "";
    public contextID: string = "";
    public userRank: number = 0;
    public userScore: number = 0;

    /** 静态解析方法 - 解析JSON数据为当前模型实例 */
    public static parseObj(obj: any): FBTournamentRankInfo {
        const rankInfo = new FBTournamentRankInfo();
        if (obj.tournamentID) rankInfo.tournamentID = obj.tournamentID;
        if (obj.contextID) rankInfo.contextID = obj.contextID;
        if (obj.userRank) rankInfo.userRank = obj.userRank;
        if (obj.userScore) rankInfo.userScore = obj.userScore;
        return rankInfo;
    }
}

/**
 * Facebook锦标赛 创建赛事信息数据模型
 */
export class FBTournament_CreateInfo {
    public tournamentID: string = "";
    public contextID: string = "";
    public title: string = "";
    public endTime: number = 0;
    public payload: string = "";
    public initialScore: number = 0;
}

/**
 * Facebook锦标赛 服务器响应体数据模型
 */
export class FBTournamentInfo_Res {
    public fbTournamentInfos: Array<FBTournamentInfo> = [];
    public fbTournamentRanks: Array<FBTournamentRankInfo> = [];

    /** 静态解析方法 - 解析服务器返回的完整赛事数据 */
    public static parseObj(obj: any): FBTournamentInfo_Res {
        const res = new FBTournamentInfo_Res();
        // 解析赛事信息数组
        if (obj.fbTournamentInfos && Array.isArray(obj.fbTournamentInfos)) {
            for (let i = 0; i < obj.fbTournamentInfos.length; ++i) {
                if (obj.fbTournamentInfos[i]) {
                    res.fbTournamentInfos.push(FBTournamentInfo.parseObj(obj.fbTournamentInfos[i]));
                }
            }
        }
        // 解析赛事排名数组
        if (obj.fbTournamentRanks && Array.isArray(obj.fbTournamentRanks)) {
            for (let i = 0; i < obj.fbTournamentRanks.length; ++i) {
                if (obj.fbTournamentRanks[i]) {
                    res.fbTournamentRanks.push(FBTournamentRankInfo.parseObj(obj.fbTournamentRanks[i]));
                }
            }
        }
        cc.log("FBTournamentInfo_Res.parseObj: ", JSON.stringify(res));
        return res;
    }
}

/**
 * Facebook锦标赛 全局单例数据管理器【核心类】
 * 纯逻辑工具类，无UI、无组件依赖，全局唯一实例管理所有FB赛事数据
 */
export default class FBTournamentManager {
    // 单例实例
    private static _instance: FBTournamentManager = null;
    // 赛事信息数组
    public infos: Array<FBTournamentInfo> = [];
    // 玩家排名信息数组
    public rankInfos: Array<FBTournamentRankInfo> = [];
    // 初始化状态标识
    private _init: boolean = false;

    /** 获取全局唯一单例实例 */
    public static Instance(): FBTournamentManager {
        if (FBTournamentManager._instance == null) {
            FBTournamentManager._instance = new FBTournamentManager();
        }
        return FBTournamentManager._instance;
    }

    /** 初始化FB赛事数据 - 由服务器数据驱动 */
    public init(resData: FBTournamentInfo_Res): void {
        this.infos = resData.fbTournamentInfos;
        this.rankInfos = resData.fbTournamentRanks;
        this._init = true;
    }

    /** 判断是否已完成初始化 */
    public isInit(): boolean {
        return this._init;
    }

    /** 判断玩家是否已报名指定赛事 */
    public isJoinFBTournament(tournamentID: string): boolean {
        return this.getInfo(tournamentID) != null;
    }

    /** 根据赛事ID获取赛事基础信息 */
    public getInfo(tournamentID: string): FBTournamentInfo {
        for (let i = 0; i < this.infos.length; ++i) {
            const info = this.infos[i];
            if (info.tournamentID == tournamentID) {
                return info;
            }
        }
        return null;
    }

    /** 根据赛事ID获取玩家排名信息 */
    public getRankInfo(tournamentID: string): FBTournamentRankInfo {
        for (let i = 0; i < this.rankInfos.length; ++i) {
            const rankInfo = this.rankInfos[i];
            if (rankInfo.tournamentID == tournamentID) {
                return rankInfo;
            }
        }
        return null;
    }

    /** 添加新的FB赛事信息到管理器 */
    public addFBTournament(tournament: any): boolean {
        if (this.isJoinFBTournament(tournament.getID())) {
            cc.error("addFBTournament already create.");
            return false;
        }
        const newInfo = new FBTournamentInfo();
        newInfo.tournamentID = tournament.getID();
        newInfo.contextID = tournament.getContextID();
        newInfo.title = tournament.getTitle();
        newInfo.endTime = tournament.getEndTime();
        this.infos.push(newInfo);
        return true;
    }

    /** 更新玩家在指定赛事的分数 */
    public updateScore(tournament: any, score: number): void {
        const tournamentID = tournament.getID();
        // 赛事信息不存在则先添加
        if (this.getInfo(tournamentID) == null) {
            this.addFBTournament(tournament);
        }
        // 更新分数，只保留更高的分数
        let rankInfo = this.getRankInfo(tournamentID);
        if (rankInfo == null) {
            rankInfo = new FBTournamentRankInfo();
            rankInfo.tournamentID = tournament.getID();
            rankInfo.contextID = tournament.getContextID();
            rankInfo.userScore = score;
            this.rankInfos.push(rankInfo);
            return;
        }
        if (rankInfo.userScore < score) {
            rankInfo.userScore = score;
        }
    }

    /** 筛选出可报名的最优有效赛事【核心算法】
     * 规则：筛选未过期的赛事中，玩家分数最低的赛事（优先报名低分局）
     */
    public getJoinableTournament(): FBTournamentInfo {
        let targetTournament: FBTournamentInfo = null;
        let targetRankInfo: FBTournamentRankInfo = null;

        for (let i = 0; i < this.infos.length; ++i) {
            const info = this.infos[i];
            // 只处理未过期的有效赛事
            if (info.isAvailable()) {
                const rankInfo = this.getRankInfo(info.tournamentID);
                if (rankInfo != null) {
                    // 首次匹配到有效赛事 或 当前赛事分数更低 → 更新目标赛事
                    if (targetRankInfo == null) {
                        cc.log("asyncFBInstantTournamentProcess find ", info.tournamentID);
                        targetRankInfo = rankInfo;
                        targetTournament = info;
                    } else if (targetRankInfo.userScore > rankInfo.userScore) {
                        cc.log("asyncFBInstantTournamentProcess find ", info.tournamentID);
                        targetRankInfo = rankInfo;
                        targetTournament = info;
                    }
                } else {
                    cc.log("asyncFBInstantTournamentProcess not found rankInfo ", info.tournamentID);
                }
            } else {
                cc.log("asyncFBInstantTournamentProcess unavailable ", info.tournamentID, info.endTime);
            }
        }
        return targetTournament;
    }
}