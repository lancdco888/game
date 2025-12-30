// 保留原项目所有依赖导入，路径与原代码一致
import TSUtility from "../global_utility/TSUtility";
import ServiceInfoManager from "../ServiceInfoManager";
import SDefine from "../global_utility/SDefine";
import UserInven from "./UserInven";
import UserInfo from "./UserInfo";

/**
 * 任务奖励数据类
 */
export class MissionReward {
    public itemId: string = "";
    public addCnt: number = 0;
    public addTime: number = 0;
    public extraInfo: string = "";
    public extraInfoObj: any = null;

    /** 解析数据对象为奖励实例 */
    public static parseObj(data: any): MissionReward {
        const reward = new MissionReward();
        if (data.itemId) reward.itemId = data.itemId;
        
        // 核心逻辑：新英雄周 奖励数量翻倍
        if (data.addCnt) {
            reward.addCnt = ServiceInfoManager.instance().getIsNewHeroWeek() === 0 
                ? data.addCnt 
                : 2 * data.addCnt;
        }
        
        if (data.addTime) reward.addTime = data.addTime;
        if (data.extraInfo) {
            reward.extraInfo = data.extraInfo;
            try {
                reward.extraInfoObj = JSON.parse(reward.extraInfo);
            } catch (error) {
                cc.error("MissionReward parseObj json parse fail", reward.extraInfo);
            }
        }
        return reward;
    }

    /** 获取奇妙宝箱类型 */
    public getWonderBoxType(): number {
        // if (!UserInven.WonderBoxItemInfo.isWonderBoxItem(this.itemId)) {
        //     cc.error("getWonderBoxType fail", this.itemId);
        //     return -1;
        // }
        // return UserInven.WonderBoxItemInfo.getBoxType(this.itemId);
        return 0;
    }
}

/**
 * 任务详情数据类
 */
export class MissionInfo {
    public id: number = 0;
    public type: string = "";
    public goalCnt: number = 0;
    public curCnt: number = 0;
    public val1: number = 0;
    public val2: number = 0;
    public subGoalCnt: number = 0;
    public curSubCnt: number = 0;
    public strVal1: string = "";
    public rewards: MissionReward[] = [];
    public isCompleted: boolean = false;
    public isReset: boolean = false;

    /** 初始化任务详情数据 */
    public initMissionInfo(data: any): void {
        if (data.id) this.id = data.id;
        if (data.type) this.type = data.type;
        if (data.val1) this.val1 = data.val1;
        if (data.val2) this.val2 = data.val2;
        if (data.strVal1) this.strVal1 = data.strVal1;
        if (data.goalCnt) this.goalCnt = data.goalCnt;
        if (data.subGoalCnt) this.subGoalCnt = data.subGoalCnt;
        if (data.curSubCnt) this.curSubCnt = data.curSubCnt;
        
        // 核心逻辑：当前进度 不超过目标进度
        if (data.curCnt) this.curCnt = Math.min(data.curCnt, this.goalCnt);
        
        if (data.isCompleted) this.isCompleted = data.isCompleted;
        if (data.isReset) this.isReset = data.isReset;

        this.rewards = [];
        if (data.rewards) {
            for (let i = 0; i < data.rewards.length; ++i) {
                this.rewards.push(MissionReward.parseObj(data.rewards[i]));
            }
        }
    }

    /** 获取任务描述字符串 */
    public getDescStr(): string {
        const desc = {
            id: this.id,
            type: this.type,
            goalCnt: this.goalCnt,
            curCnt: this.curCnt,
            val1: this.val1,
            val2: this.val2,
            strVal1: this.strVal1,
            isCompleted: this.isCompleted
        };
        return JSON.stringify(desc);
    }

    /** 根据道具ID获取奖励 */
    public getReward(itemId: string): MissionReward | null {
        // 原代码保留的重复判断逻辑，原样复刻
        for (let i = 0; i < this.rewards.length; ++i) {
            const reward = this.rewards[i];
            if (reward.itemId == itemId) return reward;
            if (reward.itemId == itemId) return reward;
        }
        return null;
    }

    /** 获取奇妙宝箱奖励 */
    public getWonderBoxReward(): MissionReward | null {
        for (let i = 0; i < this.rewards.length; ++i) {
            const reward = this.rewards[i];
            if (UserInven.WonderBoxItemInfo.isWonderBoxItem(reward.itemId)) {
                return reward;
            }
        }
        return null;
    }

    /** 获取游戏ID */
    public getGameId(): string {
        return this.strVal1;
    }

    /** 是否可领取(进度达标) */
    public isCollectable(): boolean {
        return this.curCnt >= this.goalCnt;
    }
}

/**
 * 任务类型 字符串常量枚举 (原逻辑完全保留)
 */
export const MISSION_TYPE = {
    SPIN_CNT: "SPIN_CNT",
    SPIN_CNT_SLOT: "SPIN_CNT_SLOT",
    SPIN_CNT_BET: "SPIN_CNT_BET",
    ACHIEVE_LEVEL: "ACHIEVE_LEVEL",
    WIN_CNT: "WIN_CNT",
    WIN_CNT_BET: "WIN_CNT_BET",
    WIN_COIN: "WIN_COIN",
    BIGWIN_CNT: "BIGWIN_CNT",
    HUGEWIN_CNT: "HUGEWIN_CNT",
    FREESPIN_CNT: "FREESPIN_CNT",
    MEGAWIN_CNT: "MEGAWIN_CNT",
    CARDPACK_CNT: "CARDPACK_CNT",
    SPIN_CNT_TOURNEY: "SPIN_CNT_TOURNEY",
    WIN_COIN_SPIN: "WIN_COIN_SPIN",
    WIN_OVER_COIN: "WIN_CNT_COIN",
    WIN_CNT_DIV: "WIN_CNT_DIV",
    WIN_CNT_BET_DIV: "WIN_CNT_BET_DIV",
    SPIN_CNT_BET_DIV: "SPIN_CNT_BET_DIV",
    WIN_CNT_MUL: "WIN_CNT_MUL",
    SPIN_CNT_BET_MUL: "SPIN_CNT_BET_MUL",
    WIN_CNT_BET_MUL: "WIN_CNT_BET_MUL",
    SPIN_DIFF_SLOT: "SPIN_DIFF_SLOT"
};

/**
 * 任务ID 数字常量枚举 (原逻辑完全保留)
 */
export const MISSION_ID = {
    1: "SPIN_CNT_SLOT",
    2: "ACHIEVE_LEVEL",
    3: "SPIN_CNT",
    4: "WIN_CNT_1",
    5: "BIGWIN_CNT",
    6: "WIN_COIN",
    7: "HUGEWIN_CNT",
    8: "WIN_COIN_SPIN",
    9: "WIN_OVER_COIN",
    101: "CARDPACK_CNT_1",
    201: "SPIN_CNT_BET",
    202: "WIN_CNT_BET",
    203: "WIN_CNT_2",
    204: "FREESPIN_CNT",
    205: "MEGAWIN_CNT",
    206: "CARDPACK_CNT_2",
    301: "WIN_CNT_DIV",
    302: "WIN_CNT_BET_DIV",
    303: "SPIN_CNT_BET_DIV",
    401: "WIN_CNT_MUL",
    402: "SPIN_CNT_BET_MUL",
    403: "WIN_CNT_BET_MUL",
    404: "SPIN_DIFF_SLOT",
    SPIN_CNT_SLOT: 1,
    ACHIEVE_LEVEL: 2,
    SPIN_CNT: 3,
    WIN_CNT_1: 4,
    BIGWIN_CNT: 5,
    WIN_COIN: 6,
    HUGEWIN_CNT:7,
    WIN_COIN_SPIN:8,
    WIN_OVER_COIN:9,
    CARDPACK_CNT_1:101,
    SPIN_CNT_BET:201,
    WIN_CNT_BET:202,
    WIN_CNT_2:203,
    FREESPIN_CNT:204,
    MEGAWIN_CNT:205,
    CARDPACK_CNT_2:206,
    WIN_CNT_DIV:301,
    WIN_CNT_BET_DIV:302,
    SPIN_CNT_BET_DIV:303,
    WIN_CNT_MUL:401,
    SPIN_CNT_BET_MUL:402,
    WIN_CNT_BET_MUL:403,
    SPIN_DIFF_SLOT:404
};

/**
 * 用户任务简易信息类
 */
export class UserMissionSimpleInfo {
    public curMissionIsCompleted: boolean = false;
    public curMissionCurCnt: number = 0;
    public curMissionGoalCnt: number = 0;
    public remainMissionLen: number = 0;
    public nextRefreshDate: number = 0;

    /** 初始化简易任务数据 */
    public initMission(data: any): void {
        if (data.curMissionIsCompleted) this.curMissionIsCompleted = data.curMissionIsCompleted;
        if (data.curMissionGoalCnt) this.curMissionGoalCnt = data.curMissionGoalCnt;
        if (data.curMissionCurCnt) this.curMissionCurCnt = Math.min(this.curMissionGoalCnt, data.curMissionCurCnt);
        if (data.remainMissionLen) this.remainMissionLen = data.remainMissionLen;
        if (data.nextRefreshDate) this.nextRefreshDate = data.nextRefreshDate;
    }

    /** 更新用户任务进度 */
    public updateUserMission(data: any): void {
        if (TSUtility.default.isValid(data) !== 0) {
            this.curMissionCurCnt = Math.min(data.curCnt, this.curMissionGoalCnt);
        }
    }

    /** 重置用户任务数据 */
    public resetUserMission(data: any): void {
        this.curMissionIsCompleted = data.curMission.isCompleted;
        this.curMissionCurCnt = data.curMission.curCnt;
        this.curMissionGoalCnt = data.curMission.goalCnt;
        this.remainMissionLen = data.remainMissions.length;
        this.nextRefreshDate = data.nextRefreshDate;
    }

    /** 获取剩余任务数量 */
    public getRemainMissionCnt(): number {
        return this.remainMissionLen;
    }

    /** 当前任务是否完成 */
    public isCompleteCurrentMission(): boolean {
        return this.curMissionIsCompleted;
    }

    /** 当前任务是否可领取(未完成+进度达标) */
    public isCollectableCurrentMission(): boolean {
        return this.curMissionIsCompleted !== true && this.curMissionCurCnt >= this.curMissionGoalCnt;
    }

    /** 所有任务是否完成 */
    public isCompleteAllMission(): boolean {
        return this.remainMissionLen === 0 && this.isCompleteCurrentMission() === true;
    }

    /** 是否超过刷新时间 */
    public isOverNextRefreshDate(): boolean {
        return this.nextRefreshDate - TSUtility.default.getServerBaseNowUnixTime() < 0;
    }
}

/**
 * 用户任务主类 (默认导出，项目核心调用类)
 */
export default class UserMission {
    public nextRefreshDate: number = 0;
    public group: string = "";
    public remainMissions: any[] = [];
    public completedMissions: any[] = [];
    public curMission: MissionInfo | null = null;

    /** 初始化用户任务核心数据 */
    public initUserMission(data: any): boolean {
        if (data.nextRefreshDate) this.nextRefreshDate = data.nextRefreshDate;
        if (data.group) this.group = data.group;
        if (data.remainMissions) this.remainMissions = data.remainMissions;
        if (data.completedMissions) this.completedMissions = data.completedMissions;
        
        this.curMission = new MissionInfo();
        if (data.curMission) {
            this.curMission.initMissionInfo(data.curMission);
        }
        return true;
    }

    /** 更新当前任务进度 */
    public updateUserMission(data: any): void {
        if (TSUtility.default.isValid(data) !== 0 && this.curMission !== null && this.curMission.id === data.id) {
            this.curMission.curCnt = Math.min(data.curCnt, this.curMission.goalCnt);
            this.curMission.isReset = data.isReset;
            this.curMission.curSubCnt = data.curSubCnt;
        }
    }

    /** 获取剩余任务数量 */
    public getRemainMissionCnt(): number {
        return this.remainMissions.length;
    }

    /** 当前任务是否可领取 */
    public isCollectableCurrentMission(): boolean {
        return this.curMission!.isCompleted !== true && this.curMission!.curCnt >= this.curMission!.goalCnt;
    }

    /** 是否在其他游戏中被锁定 (核心业务逻辑 完全保留) */
    public isLockedInOtherGame(): boolean {
        if (UserInfo.default.instance().getLocation() === "Slot" 
            && this.curMission!.type === MISSION_TYPE.SPIN_CNT_SLOT 
            && this.curMission!.isCompleted !== true) 
        {
            const gameId = this.curMission!.getGameId();
            if (gameId === SDefine.default.MISSION_SPIN_TOURNEY) {
                return UserInfo.default.instance().getTourneyTier() === -1;
            } else {
                return UserInfo.default.instance().getGameId() !== gameId;
            }
        }
        return false;
    }

    /** 所有任务是否完成 */
    public isCompleteAllMission(): boolean {
        return this.remainMissions.length === 0 && this.curMission!.isCompleted === true;
    }

    /** 是否超过任务刷新时间 */
    public isOverNextRefreshDate(): boolean {
        return this.nextRefreshDate - TSUtility.default.getServerBaseNowUnixTime() < 0;
    }

    /** 获取当前任务进度 */
    public getCurMissionCurCnt(): number {
        return this.curMission!.curCnt;
    }

    /** 获取当前任务目标进度 */
    public getCurMissionGoalCnt(): number {
        return this.curMission!.goalCnt;
    }
}