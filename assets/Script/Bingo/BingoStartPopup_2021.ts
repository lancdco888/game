const { ccclass, property } = cc._decorator;

import TSUtility from "../global_utility/TSUtility";
import UserInfo from "../User/UserInfo";
import PopupManager from "../manager/PopupManager";
import SDefine from "../global_utility/SDefine";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import BingoStartPopup_UI_2021, { BingoStartPopupType } from "./BingoStartPopup_UI_2021";
import { Utility } from "../global_utility/Utility";

@ccclass('BingoStartPopup_2021')
export default class BingoStartPopup_2021 extends cc.Component {
    @property([BingoStartPopup_UI_2021])
    public popups: BingoStartPopup_2021[] = [];

    // ===================== 静态对外方法 =====================
    public static getPopup(callBack: Function) {
        PopupManager.Instance().showDisplayProgress(true);
        cc.loader.loadRes("Service/01_Content/Bingo/Bingo_StartPopUp_2021", (err, prefab) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (err) {
                const error = new Error("cc.loader.loadRes fail BingoStartPopup: %s".format(JSON.stringify(err)));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                callBack(err, null);
                return;
            }
            const popupCom = cc.instantiate(prefab).getComponent(BingoStartPopup_2021);
            callBack(null, popupCom);
        });
    }

    // ===================== 私有成员方法 =====================
    private _setActivePopup(index: number) {
        for (let i = 0; i < this.popups.length; ++i) {
            this.popups[i].node.active = (i === index);
        }
    }

    // ===================== 公共成员方法 =====================
    public setOnStartCallback(callFunc: Function) {
        for (let i = 0; i < this.popups.length; ++i) {
            this.popups[i].setOnStartCallback(callFunc);
        }
    }

    public setOnRefreshUICallback(callFunc: Function) {
        for (let i = 0; i < this.popups.length; ++i) {
            this.popups[i].setOnRefreshUICallback(callFunc);
        }
    }

    public openStartPopup(bingoData: any) {
        // 每日次数重置判断
        if (bingoData.nextDailyResetTime < TSUtility.getServerBaseNowUnixTime()) {
            bingoData.dailyGameCnt = 0;
        }

        // 获取门票道具数据
        // const userInventory = UserInfo.instance().getItemInventory();
        // const gameTicketItems = userInventory.getItemsByItemId(SDefine.ITEM_BINGO_GAMETICKET);
        // const rewardTicketItems = userInventory.getItemsByItemId(SDefine.ITEM_BINGO_GAMETICKET_REWARD);

        // // 分支1: 拥有门票道具
        // if (gameTicketItems.length > 0 || rewardTicketItems.length > 0) {
        //     this._setActivePopup(BingoStartPopupType.PurchaseStart);
        //     this.popups[BingoStartPopupType.PurchaseStart].initStartPopup_UI(BingoStartPopupType.PurchaseStart, bingoData);
        //     return;
        // }

        // // 分支2: 每日游戏次数达标
        // if (bingoData.dailyGameCnt >= 1) {
        //     this._setActivePopup(BingoStartPopupType.PurchaseStart);
        //     this.popups[BingoStartPopupType.PurchaseStart].initStartPopup_UI(BingoStartPopupType.PurchaseStart, bingoData);
        //     return;
        // }

        // // 分支3: 好友数量判断 (FB小游戏特殊处理)
        // const friendInfo = UserInfo.instance().getUserFriendInfo();
        // let activeFriendCnt = friendInfo.getActiveFriendCnt();
        // if (Utility.isFacebookInstant()) {
        //     activeFriendCnt = friendInfo.getActiveFriendCnt() + friendInfo.getNonActiveFriendCnt();
        // }

        // if (activeFriendCnt >= SDefine.BINGO_FREEGAME_FRIEND_CNT) {
        //     this._setActivePopup(BingoStartPopupType.ActiveFriendStart);
        //     this.popups[BingoStartPopupType.ActiveFriendStart].initStartPopup_UI(BingoStartPopupType.ActiveFriendStart, bingoData);
        //     return;
        // }

        // 默认分支: 普通弹窗
        this._setActivePopup(BingoStartPopupType.NormalStart);
        this.popups[BingoStartPopupType.NormalStart].initStartPopup_UI(BingoStartPopupType.NormalStart, bingoData);
    }

    initStartPopup_UI = function(e, t){}
}