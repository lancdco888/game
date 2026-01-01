import TSUtility from "../global_utility/TSUtility";
import SlotDataDefine from "../slot_common/SlotDataDefine";
import SupersizeItManager, { SupersizeJackpotUserInfo } from "../SupersizeItManager";
import NotifyManager, { NotifyType } from "./NotifyManager";

const { ccclass } = cc._decorator;

/** 通知信息基类 */
export class NotifyInfoBase {
    protected _strType: string = "";
    protected _numIssueDate: number = 0;

    public get strType(): string {
        return this._strType;
    }

    public get numIssueDate(): number {
        return this._numIssueDate;
    }

    public parseObj(data: any): void {
        this._strType = data.type;
        this._numIssueDate = data.issueDate;
    }
}

/** 赌场大奖中奖通知 - 继承基类 */
export class CasinoJackpotWinNotify extends NotifyInfoBase {
    private _info: any = null;

    public get info(): any {
        return this._info;
    }

    public parseObj(data: any): void {
        super.parseObj(data);
        this._info = SlotDataDefine.CasinoJackpotWinInfo.parseObj(data.noti);
    }
}


/** 联赛奖励结果数据实体 */
export class SuiteLeagueResultInfo {
    private _numLeagueStartDate: number = 0;
    private _numLeagueRewardDate: number = 0;

    public get numLeagueStartDate(): number {
        return this._numLeagueStartDate;
    }

    public get numLeagueRewardDate(): number {
        return this._numLeagueRewardDate;
    }

    public static parseObj(data: any): SuiteLeagueResultInfo {
        const info = new SuiteLeagueResultInfo();
        info._numLeagueStartDate = data.leagueStartDate;
        info._numLeagueRewardDate = data.leagueRewardDate;
        return info;
    }
}

/** 联赛奖励通知 - 继承基类 */
export class SuiteLeagueResultNotify extends NotifyInfoBase {
    private _info: SuiteLeagueResultInfo = null;

    public get info(): SuiteLeagueResultInfo {
        return this._info;
    }

    public parseObj(data: any): void {
        super.parseObj(data);
        this._info = SuiteLeagueResultInfo.parseObj(data.noti);
    }
}

/** SupersizeIt 数据实体 */
export class SupersizeItInfo {
    private _numBeforeCount: number = 0;
    private _numCurrentCount: number = 0;
    private _isEnd: boolean = false;
    private _isEndDate: number = 0;
    private _jackpotType: string = "";
    private _infoJackpotUser: SupersizeJackpotUserInfo = null;

    public get numBeforeCount(): number { return this._numBeforeCount; }
    public get numCurrentCount(): number { return this._numCurrentCount; }
    public get isEnd(): boolean { return this._isEnd; }
    public get isEndDate(): number { return this._isEndDate; }
    public get jackpotType(): string { return this._jackpotType; }
    public get infoJackpotUser(): SupersizeJackpotUserInfo { return this._infoJackpotUser; }

    public static parseObj(data: any): SupersizeItInfo {
        const info = new SupersizeItInfo();
        if (TSUtility.isValid(data.winUser)) {
            info._infoJackpotUser = new SupersizeJackpotUserInfo();
            info._infoJackpotUser.parseObj(data.winUser);
        }
        info._numCurrentCount = data.afterCount;
        info._numBeforeCount = data.beforeCount;
        info._isEnd = data.isEnd;
        info._isEndDate = data.endDate;
        info._jackpotType = data.jackpotType;
        return info;
    }
}


/** SupersizeIt 通知 - 继承基类 */
export class SupersizeItNotify extends NotifyInfoBase {
    private _info: SupersizeItInfo = null;

    public get info(): SupersizeItInfo {
        return this._info;
    }

    public parseObj(data: any): void {
        super.parseObj(data);
        this._info = SupersizeItInfo.parseObj(data.noti);
    }
}

/** Spin2Win 数据实体 */
export class Spin2WinInfo {
    private _numBeforeCount: number = 0;
    private _numCurrentCount: number = 0;
    private _isEnd: boolean = false;

    public get numBeforeCount(): number { return this._numBeforeCount; }
    public get numCurrentCount(): number { return this._numCurrentCount; }
    public get isEnd(): boolean { return this._isEnd; }

    public static parseObj(data: any): Spin2WinInfo {
        const info = new Spin2WinInfo();
        info._numCurrentCount = data.count;
        info._numBeforeCount = data.beforeCount;
        info._isEnd = data.isEnd;
        return info;
    }
}

/** 俱乐部聊天数据实体 */
export class ClubChatInfo {
    private _numClubID: number = 0;
    private _numPostType: number = 0;

    public get numClubID(): number { return this._numClubID; }
    public get numPostType(): number { return this._numPostType; }

    public static parseObj(data: any): ClubChatInfo {
        const info = new ClubChatInfo();
        info._numClubID = data.clubID;
        info._numPostType = data.postType;
        return info;
    }
}

/** Spin2Win 通知 - 继承基类 */
export class Spin2WinNotify extends NotifyInfoBase {
    private _info: Spin2WinInfo = null;

    public get info(): Spin2WinInfo {
        return this._info;
    }

    public parseObj(data: any): void {
        super.parseObj(data);
        this._info = Spin2WinInfo.parseObj(data.noti);
    }
}

/** 俱乐部聊天通知 - 继承基类 */
export class ClubChatNotify extends NotifyInfoBase {
    private _info: ClubChatInfo = null;

    public get info(): ClubChatInfo {
        return this._info;
    }

    public parseObj(data: any): void {
        super.parseObj(data);
        this._info = ClubChatInfo.parseObj(data.noti);
    }
}

/** 核心通知信息封装类【默认导出】 */
@ccclass
export class NotifyInfo {
    private _numIndex: number = 0;
    private _strType: string = "";
    private _infoBase: NotifyInfoBase = null;

    public get numIndex(): number {
        return this._numIndex;
    }

    public get strType(): string {
        return this._strType;
    }

    public get infoBase(): NotifyInfoBase {
        return this._infoBase;
    }

    /** 解析数据对象，分发对应通知类型实体 */
    public parseObj(data: any): boolean {
        this._numIndex = data.notiIndex;
        this._strType = data.type;

        switch (this._strType) {
            case NotifyType.CLUSTER_NODE:
                return false;
            case NotifyType.CASINO_JACKPOT_WIN:
                this._infoBase = new CasinoJackpotWinNotify();
                this._infoBase.parseObj(data.body);
                return true;
            case NotifyType.SUITE_LEAGUE_REWARD:
                this._infoBase = new SuiteLeagueResultNotify();
                this._infoBase.parseObj(data.body);
                return true;
            case NotifyType.SUPERSIZE_IT:
                this._infoBase = new SupersizeItNotify();
                this._infoBase.parseObj(data.body);
                return true;
            case NotifyType.SPIN2WIN:
                this._infoBase = new Spin2WinNotify();
                this._infoBase.parseObj(data.body);
                return true;
            case NotifyType.CLUB_CHAT:
                this._infoBase = new ClubChatNotify();
                this._infoBase.parseObj(data.body);
                return true;
            default:
                return false;
        }
    }
}