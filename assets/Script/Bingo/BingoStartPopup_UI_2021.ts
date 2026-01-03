const { ccclass, property } = cc._decorator;

import UserInfo from "../User/UserInfo";
import SDefine from "../global_utility/SDefine";
// import FBPictureSetter from "../UI/FBPictureSetter";
import TSUtility from "../global_utility/TSUtility";
import TimeFormatHelper from "../global_utility/TimeFormatHelper";
// import ShopDataManager from "../manager/ShopDataManager";
import PopupManager from "../manager/PopupManager";
import CommonServer, { PurchaseEntryReason } from "../Network/CommonServer";
import ServiceInfoManager from "../ServiceInfoManager";
import Analytics from "../Network/Analytics";
import HeroTooltipPopup, { HT_MakingInfo } from "../Utility/HeroTooltipPopup";
import AsyncHelper from "../global_utility/AsyncHelper";
import UnlockContentsManager, { UnlockContentsType } from "../manager/UnlockContentsManager";
import { Utility } from "../global_utility/Utility";
// import Utility from "../global_utility/Utility";

// 弹窗类型枚举 - 完整保留原JS所有值
export enum BingoStartPopupType {
    NormalStart = 0,
    ActiveFriendStart = 1,
    PurchaseStart = 2,
    RewardStart = 3
}

@ccclass('BingoStartPopup_UI_2021')
export default class BingoStartPopup_UI_2021 extends cc.Component {
    @property(cc.Button)
    public playOneBoardBtn: cc.Button = null;

    @property(cc.Button)
    public playTwoBoardBtn: cc.Button = null;

    @property(cc.Label)
    public priceLabel1: cc.Label = null;

    @property(cc.Label)
    public priceLabel2: cc.Label = null;

    @property([cc.Node])
    public instantIOSShopDisableNodes: cc.Node[] = [];

    @property([cc.Node])
    public trial_UI_Nodes: cc.Node[] = [];

    @property([cc.Node])
    public free_UI_Nodes: cc.Node[] = [];

    // @property(FBPictureSetter)
    // public friendPicTemplate: FBPictureSetter = null;

    @property(cc.Label)
    public remainTime: cc.Label = null;

    @property(cc.Node)
    public lock_Node: cc.Node = null;

    @property(cc.Node)
    public nodeLockLevel_7: cc.Node = null;

    @property(cc.Node)
    public nodeLockLevel_9: cc.Node = null;

    // 私有成员变量
    private fbPicPos: cc.Vec2[] = [
        cc.v2(-297, 137), cc.v2(-124, 139), cc.v2(34, 144), cc.v2(8, 83), 
        cc.v2(-217, 60), cc.v2(-148, 74), cc.v2(122, 85), cc.v2(-36, 176), 
        cc.v2(-66, 51), cc.v2(-224, 165)
    ];
    private nextResetTime: number = 0;
    // private friendPics: FBPictureSetter[] = [];
    private _purchaseEntryReason: any = null;
    private _purchasePopupType: string = "";
    private _onStartCallback: Function = null;
    private _onRefreshUICallback: Function = null;
    private delayedPurchaseTooltip: HeroTooltipPopup = null;
    public popupType: BingoStartPopupType = BingoStartPopupType.NormalStart;

    // ===================== 生命周期 =====================
    onLoad() {
        if (this.playOneBoardBtn) {
            this.playOneBoardBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoStartPopup_UI_2021", "onClickPlayOneBoardBtn", ""));
        }
        if (this.playTwoBoardBtn) {
            this.playTwoBoardBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoStartPopup_UI_2021", "onClickPlayTwoBoardBtn", ""));
        }

        // if (this.friendPicTemplate) {
        //     this.friendPicTemplate.node.setPosition(this.fbPicPos[0]);
        //     this.friendPics.push(this.friendPicTemplate);
        //     for (let i = 1; i < SDefine.BINGO_FREEGAME_FRIEND_CNT; ++i) {
        //         const picNode = cc.instantiate(this.friendPicTemplate.node);
        //         const picCom = picNode.getComponent(FBPictureSetter);
        //         this.friendPicTemplate.node.parent.addChild(picNode);
        //         picNode.setPosition(this.fbPicPos[i]);
        //         this.friendPics.push(picCom);
        //     }
        // }
    }

    onDisable() {
        this.unscheduleAllCallbacks();
    }

    // ===================== 公共回调绑定 =====================
    public setOnStartCallback(callFunc: Function) {
        this._onStartCallback = callFunc;
    }

    public setOnRefreshUICallback(callFunc: Function) {
        this._onRefreshUICallback = callFunc;
    }

    // ===================== 核心初始化 =====================
    public initStartPopup_UI(popupType: BingoStartPopupType, bingoData: any) {
        const iosShopFlag = SDefine.FB_Instant_iOS_Shop_Flag;
        // iOS商店屏蔽节点显隐控制
        for (let i = 0; i < this.instantIOSShopDisableNodes.length; ++i) {
            this.instantIOSShopDisableNodes[i].active = !iosShopFlag;
        }
        // 免费UI/试用UI 显隐控制
        for (let i = 0; i < this.free_UI_Nodes.length; i++) {
            this.free_UI_Nodes[i].active = !iosShopFlag;
        }
        for (let i = 0; i < this.trial_UI_Nodes.length; i++) {
            this.trial_UI_Nodes[i].active = iosShopFlag;
        }

        this.popupType = popupType;
        const friendInfo = UserInfo.instance().getUserFriendInfo();

        // 弹窗类型分支初始化
        switch (this.popupType) {
            case BingoStartPopupType.NormalStart:
                this.init_Normal();
                break;
            case BingoStartPopupType.ActiveFriendStart:
                this.init_ActiveFriend(friendInfo);
                break;
            case BingoStartPopupType.PurchaseStart:
                this.init_Purchase(bingoData);
                break;
        }
    }

    // 普通弹窗初始化
    private init_Normal() {
        const unlockLevel = UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.BINGO);
        const userLevel = ServiceInfoManager.instance.getUserLevel();
        // 等级未解锁
        if (userLevel < unlockLevel) {
            this.lock_Node.active = true;
            this.nodeLockLevel_7.active = (unlockLevel === 7);
            this.nodeLockLevel_9.active = (unlockLevel === 9);
            return;
        }
        this.lock_Node.active = false;

        // 购买埋点上报
        this._purchaseEntryReason = new PurchaseEntryReason(SDefine.P_ENTRYPOINT_BINGOSTART, false);
        this._purchasePopupType = "BINGO_CARD";
        Analytics.viewShop("offer", this._purchasePopupType, "BINGO_CARD", this._purchaseEntryReason);

        // 新手门票判断
        const newbieTicket = UserInfo.instance().getItemInventory().getItemsByItemId(SDefine.ITEM_NEWBIE_BINGO_TICKET);
        if (newbieTicket.length > 0 && newbieTicket[0].isAvailable()) {
            this.priceLabel1.node.active = false;
            if (SDefine.FB_Instant_iOS_Shop_Flag) {
                for (let i = 0; i < this.instantIOSShopDisableNodes.length; ++i) {
                    this.instantIOSShopDisableNodes[i].active = true;
                }
                for (let i = 0; i < this.free_UI_Nodes.length; i++) {
                    this.free_UI_Nodes[i].active = false;
                }
                for (let i = 0; i < this.trial_UI_Nodes.length; i++) {
                    this.trial_UI_Nodes[i].active = true;
                }
            } else {
                for (let i = 0; i < this.free_UI_Nodes.length; i++) {
                    this.free_UI_Nodes[i].active = true;
                }
            }
        } else {
            this.priceLabel1.node.active = true;
            for (let i = 0; i < this.free_UI_Nodes.length; i++) {
                this.free_UI_Nodes[i].active = false;
            }
        }
    }

    // 好友激活弹窗初始化
    private init_ActiveFriend(friendInfo: any) {
        const unlockLevel = UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.BINGO);
        const userLevel = ServiceInfoManager.instance.getUserLevel();
        if (userLevel < unlockLevel) {
            this.lock_Node.active = true;
            this.nodeLockLevel_7.active = (unlockLevel === 7);
            this.nodeLockLevel_9.active = (unlockLevel === 9);
        } else {
            this.lock_Node.active = false;
        }

        let activeFriendCnt = friendInfo.getActiveFriendCnt();
        activeFriendCnt = Math.min(SDefine.BINGO_FREEGAME_FRIEND_CNT, activeFriendCnt);
        const self = this;

        // 好友头像加载+缩放动画
        const loadFriendPic = (index: number) => {
            // self.friendPics[index].node.active = false;
            // if (index < activeFriendCnt && friendInfo.activeFriends[index].picUrl !== "") {
            //     self.friendPics[index].loadPictureByUrl(friendInfo.activeFriends[index].picUrl, FBPictureSetter.FB_PICTURE_TYPE.SMALL, () => {});
            //     self.friendPics[index].scheduleOnce(() => {
            //         const originScale = self.friendPics[index].node.scale;
            //         self.friendPics[index].node.active = true;
            //         self.friendPics[index].node.setScale(0.5 * originScale);
            //         self.friendPics[index].node.runAction(cc.scaleTo(0.25, originScale, originScale).easing(cc.easeBackOut()));
            //     }, 0.3 + 0.1 * index);
            // }
        };

        for (let i = 0; i < SDefine.BINGO_FREEGAME_FRIEND_CNT; i++) {
            loadFriendPic(i);
        }
    }

    // 购买弹窗初始化 (异步方法 完整保留原逻辑)
    private async init_Purchase(bingoData: any) {
        this._purchaseEntryReason = new PurchaseEntryReason(SDefine.P_ENTRYPOINT_BINGOSTART, false);
        this._purchasePopupType = "BINGO_CARD";
        Analytics.viewShop("offer", this._purchasePopupType, "BINGO_CARD", this._purchaseEntryReason);

        this.nextResetTime = bingoData.nextDailyResetTime;
        let remainTime = this.nextResetTime - TSUtility.getServerBaseNowUnixTime();
        this.refreshResetTime(remainTime);

        const inventory = UserInfo.instance().getItemInventory();
        const gameTicket = inventory.getItemsByItemId(SDefine.ITEM_BINGO_GAMETICKET);
        const rewardTicket = inventory.getItemsByItemId(SDefine.ITEM_BINGO_GAMETICKET_REWARD);

        // 拥有门票道具 自动使用
        if (gameTicket.length > 0 || rewardTicket.length > 0) {
            PopupManager.Instance().showDisplayProgress(true);
            await Promise.all([AsyncHelper.delayWithComponent(1, this), this.showIncompletePurchaseTooltip(rewardTicket.length > 0)]);
            await AsyncHelper.delayWithComponent(1, this);
            this.hideIncompletePurchaseTooltip();
            
            if ((gameTicket.length > 0 && gameTicket[0].curCnt >= 2) || (rewardTicket.length > 0 && rewardTicket[0].curCnt >= 2)) {
                this.onClickPlayTwoBoardBtn();
            } else {
                this.onClickPlayOneBoardBtn();
            }
            PopupManager.Instance().showDisplayProgress(false);
        } else {
            // 无门票 开启倒计时刷新
            this.schedule(this.updateRemainTimeSchedule, 1);
        }
    }

    // ===================== 按钮点击事件 =====================
    public onClickPlayOneBoardBtn() {
        const self = this;
        switch (this.popupType) {
            case BingoStartPopupType.NormalStart:
            case BingoStartPopupType.ActiveFriendStart:
                this._onStartCallback(this.popupType, false, 0);
                break;
            case BingoStartPopupType.PurchaseStart:
                const inventory = UserInfo.instance().getItemInventory();
                const gameTicket = inventory.getItemsByItemId(SDefine.ITEM_BINGO_GAMETICKET);
                const rewardTicket = inventory.getItemsByItemId(SDefine.ITEM_BINGO_GAMETICKET_REWARD);
                // 有门票直接开始
                if (gameTicket.length > 0 && gameTicket[0].curCnt >=1 || rewardTicket.length >0 && rewardTicket[0].curCnt >=1) {
                    this._onStartCallback(this.popupType, false, 1);
                } else {
                    // 无门票 购买单张
                    // const productId = ShopDataManager.Instance().getProductIdByItemKey("bingoGameTicket_01");
                    // this.purchase(productId, 1, () => {
                    //     self._onStartCallback(self.popupType, false, 1);
                    // });
                }
                break;
        }
    }

    public onClickPlayTwoBoardBtn() {
        const self = this;
        switch (this.popupType) {
            case BingoStartPopupType.NormalStart:
                this.playTwoBoardNormalStart();
                break;
            case BingoStartPopupType.ActiveFriendStart:
                this._onStartCallback(this.popupType, false, 0);
                break;
            case BingoStartPopupType.PurchaseStart:
                const inventory = UserInfo.instance().getItemInventory();
                const gameTicket = inventory.getItemsByItemId(SDefine.ITEM_BINGO_GAMETICKET);
                const rewardTicket = inventory.getItemsByItemId(SDefine.ITEM_BINGO_GAMETICKET_REWARD);
                // 有两张门票直接开始
                if (gameTicket.length >0 && gameTicket[0].curCnt >=2 || rewardTicket.length>0 && rewardTicket[0].curCnt >=2) {
                    this._onStartCallback(this.popupType, false, 2);
                } else {
                    // 无门票 购买两张
                    // const productId = ShopDataManager.Instance().getProductIdByItemKey("bingoGameTicket_02");
                    // this.purchase(productId, 1, () => {
                    //     self._onStartCallback(self.popupType, false, 2);
                    // });
                }
                break;
        }
    }

    // 普通弹窗-双棋盘开始逻辑
    private playTwoBoardNormalStart() {
        const self = this;
        const inventory = UserInfo.instance().getItemInventory();
        const newbieTicket = inventory.getItemsByItemId(SDefine.ITEM_NEWBIE_BINGO_TICKET);
        // 新手门票
        // if (newbieTicket.length >0 && newbieTicket[0].isAvailable() ===1) {
        //     this._onStartCallback(BingoStartPopupType.NormalStart, true, 0);
        // } else {
        //     const gameTicket = inventory.getItemsByItemId(SDefine.ITEM_BINGO_GAMETICKET);
        //     const rewardTicket = inventory.getItemsByItemId(SDefine.ITEM_BINGO_GAMETICKET_REWARD);
        //     if (gameTicket.length>0 && gameTicket[0].curCnt >=1 || rewardTicket.length>0 && rewardTicket[0].curCnt >=1) {
        //         this._onStartCallback(BingoStartPopupType.NormalStart, false, 1);
        //     } else {
        //         const productId = ShopDataManager.Instance().getProductIdByItemKey("bingoGameTicket_01");
        //         this.purchase(productId, 0, () => {
        //             self._onStartCallback(BingoStartPopupType.NormalStart, false, 1);
        //         });
        //     }
        // }
    }

    // ===================== 支付购买逻辑 =====================
    private purchase(productId: string, type: number, callFunc: Function) {
        PopupManager.Instance().showDisplayProgress(true);
        // 购买埋点标识
        this._purchaseEntryReason.entryPoint = type ===0 ? SDefine.P_ENTRYPOINT_BINGONOFRIEND : SDefine.P_ENTRYPOINT_BINGONOFREECARD;
        const reasonStr = JSON.stringify(this._purchaseEntryReason);
        const popupType = this._purchasePopupType;

        UserInfo.instance().buyProduct(productId, popupType, reasonStr, (resData) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (resData) {
                UserInfo.instance().applyChangeResult(resData);
                let purchaseCnt = UserInfo.instance().getPurchaseInfo().cntIn30Days;
                UserInfo.instance().getPurchaseInfo().cntIn30Days = purchaseCnt +1;
                callFunc();
            }
        });
    }

    // ===================== 倒计时刷新 =====================
    private refreshResetTime(remainSec: number) {
        this.remainTime.string = TimeFormatHelper.getHourTimeString(remainSec);
    }

    private updateRemainTimeSchedule() {
        const remainSec = this.nextResetTime - TSUtility.getServerBaseNowUnixTime();
        const safeRemainSec = Math.max(remainSec, 0);
        this.refreshResetTime(safeRemainSec);
        // 倒计时结束 刷新UI
        if (safeRemainSec === 0) {
            this.unscheduleAllCallbacks();
            if (this._onRefreshUICallback) {
                this._onRefreshUICallback();
            }
        }
    }

    // ===================== 购买提示弹窗 =====================
    private async showIncompletePurchaseTooltip(isReward: boolean) {
        this.delayedPurchaseTooltip = await HeroTooltipPopup.asyncGetPopup();
        const progressNode = PopupManager.Instance().getDelayProgress().node;
        this.delayedPurchaseTooltip.open(progressNode);
        this.delayedPurchaseTooltip.setPivotPositionByVec2(cc.v2(0,70));
        this.delayedPurchaseTooltip.setInfoText(isReward ? "PROMOTION BINGO CARD" : "PROCESSING INCOMPLETE PURCHASE");

        // 弹窗样式配置
        const tooltipConfig = {
            frameInfo: {
                paddingWidth: 100, paddingHeight: 80, textOffsetX:0, textOffsetY:0,
                useArrow: false, arrowPosType:0, arrowPosAnchor:0.5, arrowPosOffset:0,
                baseFontSize:26, fontLineHeight:32, frameType:0
            },
            heroInfo: {
                anchorX:0, anchorY:0.5, offsetX:0, offsetY:0,
                heroId:"", heroRank:0, iconType:"Small", heroState:0
            },
            settingInfo: { useBlockBG:true, useBlockFrame:false, reserveCloseTime:0 },
            startAniInfo: []
        };
        const tooltipInfo = HT_MakingInfo.parseObj(tooltipConfig);
        this.delayedPurchaseTooltip.setHero_HT_MakingInfo(tooltipInfo);
        this.delayedPurchaseTooltip.refreshUI();
    }

    private hideIncompletePurchaseTooltip() {
        if (this.delayedPurchaseTooltip) {
            this.delayedPurchaseTooltip.close();
            this.delayedPurchaseTooltip = null;
        }
    }
}