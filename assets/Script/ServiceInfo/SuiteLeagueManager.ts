const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import CommonServer from "../Network/CommonServer";
import UserInfo from "../User/UserInfo";
import MessageRoutingManager from "../message/MessageRoutingManager";
import TSUtility from "../global_utility/TSUtility";
import InboxMessagePrefabManager, { INBOX_ITEM_TYPE } from "../InboxMessagePrefabManager";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";

// ===================== 套装联赛用户信息数据模型类 =====================
export class UserInfoSuiteLeague {
    // 私有成员变量 与原JS一致 补全类型注解
    private _rank: number = -1;
    private _rankTier: number = -1;
    private _uid: number = -1;
    private _picURL: string = "";
    private _leaguePoint: number = 0;
    private _name: string = "";
    private _leagueCoin: number = 0;

    // 所有属性的get/set方法 完整保留原逻辑 规范实现
    public get rank(): number { return this._rank; }
    public set rank(value: number) { this._rank = value; }

    public get rankTier(): number { return this._rankTier; }
    public set rankTier(value: number) { this._rankTier = value; }

    public get uid(): number { return this._uid; }
    public set uid(value: number) { this._uid = value; }

    public get picURL(): string { return this._picURL; }
    public set picURL(value: string) { this._picURL = value; }

    public get leaguePoint(): number { return this._leaguePoint; }
    public set leaguePoint(value: number) { this._leaguePoint = value; }

    public get name(): string { return this._name; }
    public set name(value: string) { this._name = value; }

    public get leagueCoin(): number { return this._leagueCoin; }
    public set leagueCoin(value: number) { this._leagueCoin = value; }

    // 解析服务器返回的联赛用户数据 核心方法 完整保留原校验逻辑
    public parse(data: any): void {
        this.rank = TSUtility.isValid(data.rank) ? data.rank : -1;
        this.rankTier = TSUtility.isValid(data.rankTier) ? data.rankTier : -1;
        this.uid = TSUtility.isValid(data.uid) ? data.uid : -1;
        this.picURL = TSUtility.isValid(data.picURL) ? data.picURL : "";
        this.leaguePoint = TSUtility.isValid(data.leaguePoint) ? data.leaguePoint : 0;
        this.name = TSUtility.isValid(data.name) ? data.name : "";
        this.leagueCoin = TSUtility.isValid(data.leagueCoin) ? data.leagueCoin : 0;
    }
}

// ===================== 套装联赛核心管理器 单例模式 全局唯一 =====================
@ccclass
export default class SuiteLeagueManager {
    // ✅ 单例核心 - 静态私有实例 + 全局访问方法 完整保留原逻辑
    private static _instance: SuiteLeagueManager = null;
    public static instance(): SuiteLeagueManager {
        if (SuiteLeagueManager._instance == null) {
            SuiteLeagueManager._instance = new SuiteLeagueManager();
            SuiteLeagueManager._instance.initManager();
        }
        return SuiteLeagueManager._instance;
    }

    // ✅ 联赛排名奖励配置 静态常量 原数组精准保留 无任何修改
    private static _listRewardRangeRank: number[] = [1, 2, 3, 10, 100, 200, 300];
    private static _listReward: number[] = [2500, 1500, 1250, 1000, 500, 300, 150];

    // ===================== 私有成员变量 与原JS完全一致 补全类型注解+初始化值 =====================
    private _leagueKey: string = "";
    private _leaguePoint: number = 0;
    private _leagueCoin: number = 0;
    private _rank: number = 0;
    private _rankTier: number = 0;
    private _totalRankCount: number = 0;
    private _uid: number = 0;
    private _expireDate: number = 0;
    private _listRankUserTiers: UserInfoSuiteLeague[] = [];
    private _listHallOfFameUsers: UserInfoSuiteLeague[] = [];

    // ===================== 只读属性getter 完整保留原逻辑 只暴露读取不开放修改 =====================
    public get listRankUserTiers(): UserInfoSuiteLeague[] { return this._listRankUserTiers; }
    public get listHallOfFameUsers(): UserInfoSuiteLeague[] { return this._listHallOfFameUsers; }
    public get leagueCoin(): number { return this._leagueCoin; }
    public get leaguePoint(): number { return this._leaguePoint; }

    // ✅ 初始化管理器 原空方法完整保留 预留扩展
    public initManager(): void { }

    // ✅ 静态公有核心方法 - 根据联赛排名获取对应奖励值 原逻辑一字不差还原
    public static getRewardByRank(rank: number): number {
        if (rank <= 0) return 0;
        let reward = 0;
        for (let i = 0; i < SuiteLeagueManager._listRewardRangeRank.length; ++i) {
            if (SuiteLeagueManager._listRewardRangeRank[i] >= rank) {
                reward = SuiteLeagueManager._listReward[i];
                break;
            }
        }
        return reward;
    }

    // ✅ 核心方法 - 刷新联赛信息 异步请求服务器数据+解析+全局消息派发
    public refreshInfo(callback?: (isSuccess: boolean) => void): void {
        const self = this;
        CommonServer.Instance().requestSuiteLeagueInfo((response: any) => {
            // 服务器请求错误处理
            if (CommonServer.isServerResponseError(response)) {
                cc.error("requestSuiteLeagueInfo fail " + JSON.stringify(response));
                if (TSUtility.isValid(callback)) callback(false);
                return;
            }

            // 解析联赛核心信息 带完整有效性校验 与原逻辑一致
            if (TSUtility.isValid(response.leagueInfo)) {
                this._leaguePoint = TSUtility.isValid(response.leagueInfo.leaguePoint) ? response.leagueInfo.leaguePoint : -1;
                this._leagueKey = TSUtility.isValid(response.leagueInfo.leaguekey) ? response.leagueInfo.leaguekey : "";
                this._rank = TSUtility.isValid(response.leagueInfo.rank) ? response.leagueInfo.rank : -1;
                this._rankTier = TSUtility.isValid(response.leagueInfo.rankTier) ? response.leagueInfo.rankTier : -1;
                this._totalRankCount = TSUtility.isValid(response.leagueInfo.totalRankCount) ? response.leagueInfo.totalRankCount : -1;
                this._expireDate = TSUtility.isValid(response.leagueInfo.expireDate) ? response.leagueInfo.expireDate : -1;
                this._uid = TSUtility.isValid(response.leagueInfo.uid) ? response.leagueInfo.uid : -1;

                // 解析名人堂用户列表
                const hallOfFameUsers = response.leagueInfo.hallOfFameUsers;
                const rankUserTiers = response.leagueInfo.rankUserTiers;
                this._listHallOfFameUsers.length = 0;
                if (TSUtility.isValid(hallOfFameUsers)) {
                    for (let i = 0; i < hallOfFameUsers.length; ++i) {
                        const userInfo = new UserInfoSuiteLeague();
                        userInfo.parse(hallOfFameUsers[i]);
                        this._listHallOfFameUsers.push(userInfo);
                    }
                }

                // 解析段位排名用户列表
                this._listRankUserTiers.length = 0;
                if (TSUtility.isValid(rankUserTiers)) {
                    for (let i = 0; i < rankUserTiers.length; ++i) {
                        const userInfo = new UserInfoSuiteLeague();
                        userInfo.parse(rankUserTiers[i]);
                        this._listRankUserTiers.push(userInfo);
                    }
                }
            }

            // 更新自身用户的联赛积分和币
            const myLeagueInfo = this.getMyUserInfo();
            if (myLeagueInfo != null) {
                this._leaguePoint = myLeagueInfo.leaguePoint;
                this._leagueCoin = myLeagueInfo.leagueCoin;
            }

            // 派发联赛信息更新的全局消息 通知所有视图刷新
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.UPDATE_SUITE_LEAGUE);
            // 执行回调
            if (TSUtility.isValid(callback)) callback(true);
        });
    }

    // ✅ 获取当前登录用户的联赛个人信息 从名人堂列表匹配UID
    public getMyUserInfo(): UserInfoSuiteLeague {
        const myUid = UserInfo.instance().getUid();
        let myInfo: UserInfoSuiteLeague = null;
        for (let i = 0; i < this.listHallOfFameUsers.length; ++i) {
            if (this.listHallOfFameUsers[i].uid == myUid) {
                myInfo = this.listHallOfFameUsers[i];
                break;
            }
        }
        return myInfo;
    }

    // ✅ 获取联赛剩余有效时间 过期时间 - 当前服务器时间
    public getRemainTime(): number {
        return this._expireDate - TSUtility.getServerBaseNowUnixTime();
    }

    // ✅ 获取当前用户的联赛排名
    public getRank(): number {
        return this._rank;
    }

    // ✅ 判断是否需要展示联赛结果通知 对比本地存储时间和最新消息时间
    public isShowResultNotify(inboxData: any): boolean {
        const latestResult = this.getLatestSuiteLeagueResultInboxInfo(inboxData);
        const lastSaveTime = ServerStorageManager.getAsNumber(StorageKeyType.LAST_SUITE_LEAGUE_RESULT_CREATE_TIME);
        return latestResult != null && lastSaveTime < latestResult.message.createdDate;
    }

    // ✅ 核心方法 - 获取收件箱中最新的联赛结果消息 筛选奖励/失败消息+批量处理未读失败消息
    public getLatestSuiteLeagueResultInboxInfo(inboxData: any): any {
        const inboxMessages = inboxData.inboxMessages.slice();
        let latestMsg = null;
        const failedMsgUids: number[] = [];

        // 遍历收件箱消息 筛选联赛相关消息
        for (let i = 0; i < inboxMessages.length; ++i) {
            const msg = inboxMessages[i].message;
            // 收集联赛失败消息的UID 用于批量已读处理
            if (msg.mType == INBOX_ITEM_TYPE.INBOX_FAILED_TO_WIN_SUITELEAGUE) {
                failedMsgUids.push(msg.mUid);
            }
            // 筛选联赛奖励/失败消息 取最新的一条
            if (msg.mType === INBOX_ITEM_TYPE.INBOX_REWARD_SUITELEAGUE || 
                msg.mType === INBOX_ITEM_TYPE.INBOX_FAILED_TO_WIN_SUITELEAGUE) {
                if (latestMsg == null) {
                    latestMsg = inboxMessages[i];
                } else {
                    if (msg.createdDate > latestMsg.message.createdDate) {
                        latestMsg = inboxMessages[i];
                    }
                }
            }
        }

        // 批量请求标记联赛失败消息为已读
        if (failedMsgUids.length > 0) {
            const uid = UserInfo.instance().getUid();
            const token = UserInfo.instance().getAccessToken();
            CommonServer.Instance().requestAcceptInboxMessageMulti(uid, token, failedMsgUids, () => {});
        }

        return latestMsg;
    }
}