const { ccclass } = cc._decorator;

import TSUtility from "../global_utility/TSUtility";
import NotifyAction_CasinoJackpotWin from "../Action/NotifyAction_CasinoJackpotWin";
import NotifyAction_ClubChat from "../Action/NotifyAction_ClubChat";
import NotifyAction_Spin2Win from "../Action/NotifyAction_Spin2Win";
import NotifyAction_SuiteLeagueResult from "../Action/NotifyAction_SuiteLeagueResult";
import NotifyAction_SupersizeIt from "../Action/NotifyAction_SupersizeIt";
import {NotifyInfo} from "./NotifyInfo";


/** 通知类型枚举 */
export const NotifyType = {
    NONE: 0,
    CLUSTER_NODE: "ClusterNodeNoti",
    CASINO_JACKPOT_WIN: "CasinoJackpotWinNoti",
    SUITE_LEAGUE_REWARD: "SuiteLeagueRewardNoti",
    SUPERSIZE_IT: "SupersizeJackpotDecreaseTicketNoti",
    SPIN2WIN: "Spin2WinDecreaseTicketNoti",
    CLUB_CHAT: "ClubWallPostNoti"
};

/** 通知管理器 单例组件 */
@ccclass
export default class NotifyManager extends cc.Component {
    private static _instance: NotifyManager = null;
    private _arrNotifyAction: any[] = [];

    /** 单例实例访问器 */
    public static get instance(): NotifyManager {
        if (NotifyManager._instance == null) {
            NotifyManager._instance = new NotifyManager();
            NotifyManager._instance.initialize();
        }
        return NotifyManager._instance;
    }

    /** 初始化 注册所有通知Action */
    public initialize(): void {
        this._arrNotifyAction.push(new NotifyAction_CasinoJackpotWin);
        this._arrNotifyAction.push(new NotifyAction_SuiteLeagueResult);
        this._arrNotifyAction.push(new NotifyAction_SupersizeIt);
        this._arrNotifyAction.push(new NotifyAction_Spin2Win);
        this._arrNotifyAction.push(new NotifyAction_ClubChat);
    }

    /** 根据通知类型获取对应的处理Action */
    public getNotifyAction(type: string): any {
        for (let i = 0; i < this._arrNotifyAction.length; ++i) {
            const action = this._arrNotifyAction[i];
            if (TSUtility.isValid(action) && action.getType() == type) {
                return action;
            }
        }
        return null;
    }

    /** 设置通知数据并分发处理 */
    public setNotifyData(data: any): number {
        const pingRes = PingRes.parseObj(data);
        if (!TSUtility.isValid(pingRes)) {
            return -1;
        }
        if (!TSUtility.isValid(pingRes.arrNotify) || pingRes.arrNotify.length <= 0) {
            return -1;
        }

        for (let i = 0; i < pingRes.arrNotify.length; ++i) {
            const notifyInfo = pingRes.arrNotify[i];
            if (TSUtility.isValid(notifyInfo)) {
                const action = this.getNotifyAction(notifyInfo.strType);
                TSUtility.isValid(action) && action.append(notifyInfo);
            }
        }

        const lastIdx = pingRes.arrNotify.length - 1;
        return pingRes.arrNotify[lastIdx].numIndex;
    }
}

/** Ping返回的通知数据解析类 */
export class PingRes {
    private _arrNotify: NotifyInfo[] = [];

    public get arrNotify(): NotifyInfo[] {
        return this._arrNotify;
    }

    /** 静态解析方法 - 解析原始数据为PingRes实例 */
    public static parseObj(data: any): PingRes {
        if (!TSUtility.isValid(data)) {
            return null;
        }
        if (!TSUtility.isValid(data.notiList)) {
            return null;
        }

        const pingRes = new PingRes();
        for (let i = 0; i < data.notiList.length; ++i) {
            const info = new NotifyInfo();
            if (TSUtility.isValid(info.parseObj(data.notiList[i]))) {
                pingRes._arrNotify.push(info);
            }
        }
        return pingRes;
    }
}
