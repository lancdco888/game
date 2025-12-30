const {ccclass, property} = cc._decorator;

import SlotGameRuleManager from "./manager/SlotGameRuleManager";
import ServiceInfoManager from "./ServiceInfoManager";
import UserInfo from "./User/UserInfo";
import UserPromotion from "./User/UserPromotion";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import ServiceSlotDataManager from "./manager/ServiceSlotDataManager";
import MessageRoutingManager from './message/MessageRoutingManager';
import { UserSimpleInfo } from "./slot_common/SlotDataDefine";

export class SupersizeJackpotUserInfo {
    private _user: UserSimpleInfo | null = null;
    private _numWinCoin: number = 0;
    private _numWinDate: number = 0;
    private _strSlotID: string = "";

    public get user(): UserSimpleInfo | null {
        return this._user;
    }

    public get numWinCoin(): number {
        return this._numWinCoin;
    }

    public get numWinDate(): number {
        return this._numWinDate;
    }

    public get strSlotID(): string {
        return this._strSlotID;
    }

    public parseObj(e: any): void {
        TSUtility.isValid(e.user) && (this._user = new UserSimpleInfo(), this._user.parseObj(e.user));
        TSUtility.isValid(e.winCoin) && (this._numWinCoin = e.winCoin);
        TSUtility.isValid(e.winDate) && (this._numWinDate = e.winDate);
        TSUtility.isValid(e.slotID) && (this._strSlotID = e.slotID);
    }
}

@ccclass
export default class SupersizeItManager extends cc.Component {
    private static _instance: SupersizeItManager = null;
    public static get instance(): SupersizeItManager {
        if (SupersizeItManager._instance == null) {
            SupersizeItManager._instance = new SupersizeItManager();
        }
        return SupersizeItManager._instance;
    }

    // ✅ 保留所有常量 数值/数组 一字不改
    public SUPERSIZE_IT_TARGET_DATA = [{
        vip: 0, coin: 3e5
    }, {
        vip: 1, coin: 6e5
    }, {
        vip: 2, coin: 6e5
    }, {
        vip: 3, coin: 6e5
    }, {
        vip: 4, coin: 12e5
    }, {
        vip: 5, coin: 3e6
    }, {
        vip: 6, coin: 3e6
    }, {
        vip: 7, coin: 6e6
    }];
    public LIMIT_LEVEL = 15;
    public MAX_COUNT = 7777;
    public ENABLE_END_EVENT_TIME = 600;

    // ✅ 保留所有私有属性 初始化值不变
    private _infoJackpotUser: SupersizeJackpotUserInfo | null = null;
    private _numMaxTicketCount: number = this.MAX_COUNT;
    private _numCurrentTicketCount: number = 0;
    private _numEndDate: number = 0;
    private _isReservationOpenPopup: boolean = false;
    private _arrTargetSlotID: string[] = [];
    private _isEndNotify: boolean = false;

    public initialize(): void {
        var e = this.getPromotion();
        TSUtility.isValid(e) && (
            this._arrTargetSlotID = e.arrTargetSlot,
            this._numMaxTicketCount = e.numTicketAmount,
            e.isTicketSoldOut && (this._numCurrentTicketCount = 0),
            this._isReservationOpenPopup = false
        );
    }

    public parseNotify(e: any, t: boolean = true): void {
        if (TSUtility.isValid(e) && !this._isEndNotify) {
            var n = this._numCurrentTicketCount;
            this._numEndDate = e.info.isEndDate;
            this._numCurrentTicketCount = e.info.numCurrentCount;
            this._infoJackpotUser = e.info.infoJackpotUser;
            this._isReservationOpenPopup = false;
            
            (this._numEndDate > 0 || e.info.isEnd) && (this._numCurrentTicketCount = 0);

            if (t) {
                if (e.info.isEnd) {
                    this._isEndNotify = true;
                    MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REFRESH_SUPERSIZE_IT_END);
                } else if (n != this._numCurrentTicketCount && this._infoJackpotUser.user.uid != UserInfo.instance().getUid()) {
                    MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REFRESH_SUPERSIZE_IT_COUNT);
                } else if (n != this._numCurrentTicketCount && this._infoJackpotUser.user.uid == UserInfo.instance().getUid()) {
                    MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REFRESH_SUPERSIZE_IT_COUNT_SELF);
                }
            }
        }
    }

    public parseZoneInfo(e: any): void {
        TSUtility.isValid(e.ticketCount) && (this._numCurrentTicketCount = e.ticketCount);
        TSUtility.isValid(e.endDate) && (this._numEndDate = e.endDate);
        TSUtility.isValid(e.lastWinUser) && (
            this._infoJackpotUser = new SupersizeJackpotUserInfo(),
            this._infoJackpotUser.parseObj(e.lastWinUser)
        );
    }

    public getPromotion(): any {
        return UserInfo.instance().getPromotionInfo(UserPromotion.SupersizeJackpotEventInfo.PromotionKeyName);
    }

    public getConditionCoin(): number {
        for (var e = UserInfo.instance().getUserVipInfo().level, t = 0, n = 0; n < this.SUPERSIZE_IT_TARGET_DATA.length; n++) {
            if (this.SUPERSIZE_IT_TARGET_DATA[n].vip == e) {
                t = this.SUPERSIZE_IT_TARGET_DATA[n].coin;
                break;
            }
        }
        return 0 == t && e >7 && (t = this.SUPERSIZE_IT_TARGET_DATA[this.SUPERSIZE_IT_TARGET_DATA.length -1].coin), t;
    }

    public getMaxTicketCount(): number {
        return this._numMaxTicketCount;
    }

    // ✅ 保留原代码嵌套Math.max运算逻辑 一字不改
    public getCurrentTicketCount(): number {
        return Math.max(0, this._numMaxTicketCount - Math.max(0, this._numCurrentTicketCount));
    }

    public getJackpotUserInfo(): SupersizeJackpotUserInfo | null {
        return this._infoJackpotUser;
    }

    public isAvailablePromotion(): boolean {
        var e = this.getPromotion();
        if (!TSUtility.isValid(e)) return false;
        var t = UserInfo.instance().getUserLevelInfo().level;
        return !(this.LIMIT_LEVEL > t);
    }

    public isEnableStartPopup(): boolean {
        var e = this.getPromotion();
        if (!TSUtility.isValid(e)) return false;
        var t = TSUtility.getServerBaseNowUnixTime();
        var n = e.numPopupStartDate;
        if (n <=0 || n > t) return false;
        var o = e.numEventStartDate;
        return !(o <=0 || o <= t);
    }

    public isEnableEvent(): boolean {
        var e = this.getPromotion();
        if (!TSUtility.isValid(e)) return false;
        var t = TSUtility.getServerBaseNowUnixTime();
        var n = e.numPopupStartDate;
        if (n <=0 || n > t) return false;
        var o = e.numEventStartDate;
        return !(o <=0 || o > t) && !this.isDisableEvent();
    }

    public isDisableEvent(): boolean {
        return this._numEndDate > 0;
    }

    public isEnableEndEvent(): boolean {
        return !(this._numEndDate <=0 || TSUtility.getServerBaseNowUnixTime() >= this._numEndDate + this.ENABLE_END_EVENT_TIME);
    }

    public isTargetBet(): boolean {
        var e = SlotGameRuleManager.Instance.getCurrentBetMoney();
        return this.isBetAmountEnoughToAvailablePromotion(e);
    }

    public isBetAmountEnoughToAvailablePromotion(e: number): boolean {
        return e >= this.getConditionCoin();
    }

    public isPlayTargetSlot(): boolean {
        return this.isTargetSlotID(UserInfo.instance().getGameId());
    }

    public isTargetSlotID(e: string): boolean {
        return !(TSUtility.isValid(e) == false || e.length <=0) && this._arrTargetSlotID.includes(e);
    }

    public getTargetSlotBannerInfo(): any[] {
        var e = this._arrTargetSlotID;
        if (!TSUtility.isValid(e) || e.length <=0) return [];
        for (var t: any[] = [], n=0; n < e.length; n++) {
            var o = ServiceSlotDataManager.instance.getSlotBannerInfo(SDefine.VIP_LOUNGE_ZONEID, e[n]);
            TSUtility.isValid(o) && t.push(o);
        }
        return t;
    }

    // ✅ 保留原代码多层嵌套判断逻辑 完全一致
    public canReceiveLoungePass(): boolean {
        if (!TSUtility.isValid(this.getPromotion())) return false;
        if (UserInfo.instance().isPassAbleCasino(1, SDefine.VIP_LOUNGE_ZONENAME)) return false;
        if (this.getPromotion().isReceivedSlotPlayTicket) return false;
        
        const ticketItem = UserInfo.instance().getItemInventory().getItemsByItemId("i_supersize_slot_play_ticket")[0];
        if (TSUtility.isValid(ticketItem) && ticketItem.expireDate > TSUtility.getServerBaseNowUnixTime()) return false;
        
        if (ServiceInfoManager.BOOL_SUPERSIZE_TICKET_CLAIM) return false;
        
        var e = this.getTargetSlotBannerInfo();
        return !(TSUtility.isValid(e) && e.length >0 && !e[0].isNewSlot);
    }

    public setReservationOpenPopup(e: boolean): void {
        this._isReservationOpenPopup = e;
    }

    public isReservationOpenPopup(): boolean {
        return this._isReservationOpenPopup;
    }

    public getSupersizeFreeTicketRemainTime(): number {
        var e = 0;
        SupersizeItManager.instance.canReceiveLoungePass() 
            ? e = TSUtility.getServerBaseNowUnixTime() + 10800 
            : UserInfo.instance().hasSupersizeFreeTicket() && (e = UserInfo.instance().getItemInventory().getItemsByItemId("i_supersize_slot_play_ticket")[0].expireDate);
        return e - TSUtility.getServerBaseNowUnixTime();
    }

    public isHasSupersizeFreeTicket(): boolean {
        return this.getSupersizeFreeTicketRemainTime() > 0;
    }
}