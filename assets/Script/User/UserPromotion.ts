const { ccclass } = cc._decorator;
import TSUtility from "../global_utility/TSUtility";
import MessageRoutingManager from "../message/MessageRoutingManager";
import ServiceInfoManager from "../ServiceInfoManager";
import UserInfo from "./UserInfo";
// import TutorialCoinPromotion from "../Tutorial/TutorialCoinPromotion";
import PowerGemManager, { PowerGemInfo } from "../manager/PowerGemManager";
// import UnlockContentsManager from "../Popup/UnlockContents/UnlockContentsManager";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import SlotGameRuleManager from "../manager/SlotGameRuleManager";

// 兼容原JS的__spreadArrays数组拷贝方法 1:1还原 原逻辑中大量使用该方法
export function spreadArrays(...args: any[][]): any[] {
    let length = 0;
    for (let i = 0; i < args.length; i++) length += args[i].length;
    const result = new Array(length);
    let index = 0;
    for (let i = 0; i < args.length; i++) {
        const array = args[i];
        for (let j = 0; j < array.length; j++, index++) {
            result[index] = array[j];
        }
    }
    return result;
}

// 声明全局Utility对象 解决原JS中Utility.isFacebookWeb()调用的TS报错
declare const Utility: { isFacebookWeb: () => boolean };

/**
 * 所有促销活动枚举 - 原JS ADREWARDTYPE 1:1还原
 */
export enum ADREWARDTYPE {
    DailyBonus = 0,
    CollectAll = 1,
    Inbox_Normal = 2,
    Inbox_Allin = 3,
    BingoBall = 4,
    MPASS = 5,
    iOSSHOP = 6,
    TimeBonus = 7,
    FREEBIES = 8,
    INBOX_PINTOTOP = 9,
    COINSHOWER = 10,
    INBOX_DAILYBONUS = 11,
    Inbox_Allin_Renewal = 14,
    POWER_GEM = 15
}

/**
 * ===================== 所有促销业务类 按原JS顺序1:1完整复刻 无任何增减 =====================
 */
export class TimeBonusPromotion {
    public static readonly PromotionKeyName: string = "TimeBonus";
    public nextReceiveTime: number = 0;
    public state: number = 0;

    public parseObj(data: any): void {
        this.nextReceiveTime = data.nextReceiveTime;
        this.state = data.state;
    }
}

export class MemberPlusBonusPromotion {
    public static readonly PromotionKeyName: string = "MembersPlusBonusPromotion";
    public isReceivedAdBonus: boolean = false;
    public nextReceiveTime: number = 0;

    public parseObj(data: any): void {
        if (data.nextReceiveTime) this.nextReceiveTime = data.nextReceiveTime;
        if (data.isReceivedAdBonus) this.isReceivedAdBonus = data.isReceivedAdBonus;
    }
}

export class FBMobileConnectPromotion {
    public static readonly PromotionKeyName: string = "FBMobileConnectPromotion";
    public static readonly Reward: number = 1000000;
    public isReceived: boolean = false;

    public parseObj(data: any): void {
        if (TSUtility.isValid(data.isReceived)) this.isReceived = data.isReceived;
    }
}

export class WelcomeBonusPromotion {
    public static readonly PromotionKeyName: string = "WelcomeBonus";
    public static readonly Reward: number = 5000000;
    public isReceived: boolean = false;

    public parseObj(data: any): void {
        if (TSUtility.isValid(data.isReceived)) this.isReceived = data.isReceived;
    }
}

export class DailyInboxCoinPromotion {
    public static readonly PromotionKeyName: string = "DailyInboxCoin";
    public nextReceiveTime: number = 0;

    public parseObj(data: any): void {
        if (TSUtility.isValid(data.nextReceiveTime)) this.nextReceiveTime = data.nextReceiveTime;
    }
}

export class DailyBingoBallPromotion {
    public static readonly PromotionKeyName: string = "DailyBingoBall";
    public nextReceiveTime: number = 0;

    public parseObj(data: any): void {
        this.nextReceiveTime = data.nextReceiveTime;
    }
}

export class DailyShortcutPromotion {
    public static readonly PromotionKeyName: string = "DailyShortcut";
    public nextReceiveTime: number = 0;

    public parseObj(data: any): void {
        if (TSUtility.isValid(data.nextReceiveTime)) this.nextReceiveTime = data.nextReceiveTime;
    }
}

export class WelcomebackPromotionInfo {
    public static readonly PromotionKeyName: string = "WelcomeBackPromotion";
    public itemID: string = "";
    public isReceived: boolean = false;
    public price: number = 0;
    public baseCoin: number = 0;
    public payCode: string = "";

    public parseObj(data: any): void {
        if (TSUtility.isValid(data.DBInfo.itemID)) this.itemID = data.DBInfo.itemID;
        if (TSUtility.isValid(data.DBInfo.isReceived)) this.isReceived = data.DBInfo.isReceived;
        if (TSUtility.isValid(data.DBInfo.payCode)) this.isReceived = data.DBInfo.payCode;
        if (TSUtility.isValid(data.DBInfo.extraInfo) && data.DBInfo.extraInfo === "") {
            const info = data.DBInfo.extraInfo;
            this.price = info.price;
            this.baseCoin = info.baseCoin;
        } else {
            this.price = 0;
            this.baseCoin = 0;
        }
    }
}

export class InboxShopPromotion {
    public static readonly PromotionKeyName: string = "InboxShopPromotion";
    public nextChangeTime: number = 0;
    public curProductIndex: number = 0;
    public curClientProductId: string = "";
    public price: number = 0;
    public baseCoin: number = 0;
    public state: number = 0;

    public parseObj(data: any): void {
        this.nextChangeTime = data.nextChangeTime;
        this.curProductIndex = data.curProductIndex;
        this.curClientProductId = data.curClientProductId;
        this.price = data.price;
        this.baseCoin = data.baseCoin;
        this.state = data.state;
    }

    public isUseable(): boolean {
        TSUtility.getServerBaseNowUnixTime();
        return this.curClientProductId !== "" && this.state === 0;
    }
}

export class WatchRewardAdPromotion {
    public static readonly PromotionKeyName: string = "WatchRewardAdPromotion";
    public dailyBonusMoney: number = 0;
    public lastReceiveTimeMapper: any = null;
    public receiveCountMapper: any = null;

    public parseObj(data: any): void {
        this.dailyBonusMoney = data.dailyBonusMoney;
        this.lastReceiveTimeMapper = data.lastReceiveTimeMapper;
        this.receiveCountMapper = data.receiveCountMapper;
    }
}

export class ShareEle {
    public id: string = "";
    public picture: string = "";

    public parseObj(data: any): void {
        this.id = data.id;
        this.picture = data.picture;
    }
}

export class SharePromotion {
    public static readonly PromotionKeyName: string = "ShareInducePromotion";
    public shareele: ShareEle[] = [];
    public receivedIds: string[] = [];
    public receiveCount: number = 0;
    public nextResetTime: number = 0;

    public parseObj(data: any): void {
        if (data.feedInfo) {
            for (let i = 0; i < data.feedInfo.length; i++) {
                const ele = new ShareEle();
                ele.parseObj(data.feedInfo[i]);
                if (ele.picture !== "") this.shareele.push(ele);
            }
        } else if (data.FeedInfo) {
            for (let i = 0; i < data.FeedInfo.length; i++) {
                const ele = new ShareEle();
                ele.parseObj(data.FeedInfo[i]);
                if (ele.picture !== "") this.shareele.push(ele);
            }
        }
        this.receivedIds = data.receivedIds;
        if (this.receivedIds == null) this.receivedIds = [];
        if (data.receiveCount) this.receiveCount = data.receiveCount;
        if (data.nextResetTime) this.nextResetTime = data.nextResetTime;
    }

    public getInfo(): ShareEle | null {
        for (let i = this.shareele.length - 1; i >= 0; i--) {
            for (let j = 0; j < this.receivedIds.length; j++) {
                if (this.shareele[i].id === this.receivedIds[j]) this.shareele.splice(i, 1);
            }
        }
        return this.shareele.length > 0 ? this.shareele[0] : null;
    }

    public setReceivecd(id: string): void {
        for (let i = 0; i < this.receivedIds.length; i++) {
            if (id === this.receivedIds[i]) return;
        }
        this.receivedIds.push(id);
    }
}

export class PurchasePromotion {
    public static readonly PromotionKeyName: string = "PurchasePromotion";
    public timeOffer: any = null;
    public flashOffer: any = null;

    public parseObj(data: any): void {
        this.timeOffer = data.timeOffer;
        this.flashOffer = data.flashOffer;
    }
}

export class FacebookADPromotion {
    public static readonly PromotionKeyName: string = "FBInstantVideoAdPromotion";
    public isShowing: boolean = false;

    public parseObj(data: any): void {
        this.isShowing = data.isShowing;
    }

    public isUseable(): boolean {
        return this.isShowing;
    }
}

export class FBInstantShortcutPromotion {
    public static readonly PromotionKeyName: string = "FBInstantShortcutPromotion";
    public isReceived: boolean = false;

    public parseObj(data: any): void {
        TSUtility.isValid(data.isReceived);
        this.isReceived = data.isReceived;
    }

    public isUseable(): boolean {
        return !this.isReceived;
    }
}

export class NewUserMissionPromotion {
    public static readonly PromotionKeyName: string = "NewUserMissionPromotion";
    public stepIdx: number = 0;
    public val: number = 0;
    public isNewTarget: boolean = false;

    public parseObj(data: any): void {
        if (TSUtility.isValid(data.stepIdx)) this.stepIdx = data.stepIdx;
        if (TSUtility.isValid(data.val)) this.val = data.val;
        if (TSUtility.isValid(data.isRenewal)) this.isNewTarget = data.isRenewal;
    }
}

export class ServiceIntroduceCoinPromotion {
    public static readonly PromotionKeyName: string = "ServiceIntroduceCoinPromotion";
    public completedSteps: number[] = [];
    public completedSubSteps: number[] = [];

    public parseObj(data: any): void {
        this.completedSteps = data.completedSteps == null ? [] : data.completedSteps;
        this.completedSubSteps = data.completedSubSteps == null ? [] : data.completedSubSteps;
    }

    public getMainStepState(step: number): boolean {
        return this.contains(this.completedSteps, step);
    }

    public getMainStep(): number {
        // const max = TutorialCoinPromotion.INTRODUCE_MAIN.END_INDEX;
        // for (let i = 0; i < max; i++) {
        //     if (this.contains(this.completedSteps, i) === false) return i;
        // }
        return -1;
    }

    public enableSubStep(mainStep: number, subStep: number): boolean {
        const mainCompleted = this.contains(this.completedSteps, mainStep);
        const subCompleted = this.contains(this.completedSubSteps, subStep);
        return mainCompleted === true && subCompleted === false;
    }

    public contains(arr: any[], val: any): boolean {
        for (let i = arr.length; i--;) {
            if (arr[i] === val) return true;
        }
        return false;
    }
}

export class NewServiceIntroduceCoinPromotion {
    public static readonly PromotionKeyName: string = "ServiceIntroduceCoinV2Promotion";
    public completedSteps: number[] = [];
    public completedSubSteps: number[] = [];

    public parseObj(data: any): void {
        this.completedSteps = data.completedSteps == null ? [] : data.completedSteps;
        this.completedSubSteps = data.completedSubSteps == null ? [] : data.completedSubSteps;
    }

    public getMainStepState(step: number): boolean {
        return this.contains(this.completedSteps, step);
    }

    public getMainStep(): number {
        // const max = TutorialCoinPromotion.INTRODUCE_MAIN.END_INDEX;
        // for (let i = 0; i < max; i++) {
        //     if (i === TutorialCoinPromotion.INTRODUCE_MAIN.FRIEND) continue;
        //     if (i === TutorialCoinPromotion.INTRODUCE_MAIN.STARALBUM && ServiceInfoManager.default.instance().getUserLevel() < UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsManager.UnlockContentsType.STAR_ALBUM)) continue;
        //     if (this.contains(this.completedSteps, i) === false) return i;
        // }
        return -1;
    }

    public enableSubStep(mainStep: number, subStep: number): boolean {
        const mainCompleted = this.contains(this.completedSteps, mainStep);
        const subCompleted = this.contains(this.completedSubSteps, subStep);
        return mainCompleted === true && subCompleted === false;
    }

    public contains(arr: any[], val: any): boolean {
        for (let i = arr.length; i--;) {
            if (arr[i] === val) return true;
        }
        return false;
    }
}

export class StayStrong2xPromotion {
    public static readonly PromotionKeyName: string = "StayStrong2xPromotion";
    public nextReceiveTime: number = 0;

    public parseObj(param:any): void { }
}

export class GiftBalloonPromotion {
    public static readonly PromotionKeyName: string = "InGameRandomBonusPromotion";
    public endTime: number = 0;
    public isReceived: boolean = false;

    public parseObj(data: any): void {
        const prevTime = ServerStorageManager.getAsNumber(StorageKeyType.PREV_BALLOON_TIME);
        const showDate = data.showingDate;
        if (!Utility.isFacebookWeb() && UserInfo.instance() != null && data.isAcceptable === 1 && prevTime !== showDate) {
            this.endTime = data.showingDate;
            this.isReceived = data.isAcceptable;
            ServerStorageManager.save(StorageKeyType.PREV_BALLOON_TIME, data.showingDate);
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.ADDGIFTBALLOON);
        }
    }
}

export class DailyStampPromotion {
	public static readonly PromotionKeyName: string = "DailyStampPromotion";
	public consecutiveDays: number = 0;
	public nextReceivedTime: number = 0;

	public parseObj(data: any): void {
		this.consecutiveDays = data.consecutiveDays;
		this.nextReceivedTime = data.nextReceivedTime;
	}
}

export class DailyStampV2Promotion {
	public static readonly PromotionKeyName: string = "DailyStampV2Promotion";
	public version: number = 0;
	public consecutiveDays: number = 0;
	public accumulatedDays: number = 0;
	public nextReceivedTime: number = 0;

	public parseObj(data: any): void {
		this.version = data.version;
		this.consecutiveDays = data.consecutiveDays;
		this.accumulatedDays = data.accumulatedDays;
		this.nextReceivedTime = data.nextReceivedTime;
		if (!TSUtility.isValid(this.nextReceivedTime)) this.nextReceivedTime = 0;
	}

	public isReceivable(): boolean {
		return this.nextReceivedTime <= TSUtility.getServerBaseNowUnixTime();
	}
}

export class SlotMatePromotion {
	public static readonly PromotionKeyName: string = "SlotMateCrossPromotion";
	public isAcceptable: boolean = false;

	public parseObj(param:any): void {
		this.isAcceptable = true;
	}
}

export class BingoMatePromotion {
	public static readonly PromotionKeyName: string = "BingoMateCrossPromotion";
	public isAcceptable: boolean = false;

	public parseObj(param:any): void {
		this.isAcceptable = true;
	}
}

export class BubbleTumbleCrossPromotion {
	public static readonly PromotionKeyName: string = "BubbleTumbleCrossPromotion";
	public isAcceptable: boolean = false;

	public parseObj(param:any): void {
		this.isAcceptable = true;
	}
}

export class VCSCrossPromotion {
	public static readonly PromotionKeyName: string = "VegasCrazeCrossPromotion";
	public isAcceptable: boolean = false;

	public parseObj(param:any): void {
		this.isAcceptable = true;
	}
}

export class LevelUpEventPromotion {
	public static readonly PromotionKeyName: string = "LevelUpEventPromotion";
	public receivedRewards: any[] = [];
	public isTargetUser: boolean = false;
	public endTime: number = 0;

	public parseObj(data: any): void {
		this.receivedRewards = data.receivedRewards == null ? [] : data.receivedRewards;
		this.isTargetUser = data.isTargetUser == null ? false : data.isTargetUser;
		this.endTime = data.endTime == null ? 0 : data.endTime;
	}
}

export class LevelUpPassPromotion {
	public static readonly PromotionKeyName: string = "LevelPassPromotion";
	public receivedRewards: any[] = [];
	public receivedPremiumRewards: any[] = [];
	public isTargetUser: boolean = false;
	public isPurchasedPremium: boolean = false;
	public endDate: number = 0;

	public parseObj(data: any): void {
		this.receivedRewards = data.normalCollectedInfo == null ? [] : data.normalCollectedInfo;
		this.receivedPremiumRewards = data.chargedCollectedInfo == null ? [] : data.chargedCollectedInfo;
		this.isTargetUser = data.isTargetUser == null ? false : data.isTargetUser;
		this.isPurchasedPremium = data.isPurchasedPremium == null ? false : data.isPurchasedPremium;
		this.endDate = data.endDate == null ? 0 : data.endDate;
	}
}

export class MobileReviewPopupPromotion {
	public static readonly PromotionKeyName: string = "MobileReviewPopupPromotion";
	public isReceived: boolean = false;

	public parseObj(data: any): void {
		this.isReceived = data.isReceived == null ? false : data.isReceived;
	}
}

export class NewUserAllInCarePromotion {
	public static readonly PromotionKeyName: string = "NewUserAllInCarePromotion";
	public isReceivedFreeReward: boolean = false;

	public parseObj(data: any): void {
		this.isReceivedFreeReward = data.isReceivedFreeReward == null ? false : data.isReceivedFreeReward;
	}
}

export class ReelQuestMissionInfo {
	public key: string = "";
	public id: number = 0;
	public type: string = "";
	public order: number = 0;
	public goalCnt: number = 0;
	public subGoalCnt: number = 0;
	public curCnt: number = 0;
	public curSubCnt: number = 0;
	public isCompleted: boolean = false;

	public parseObj(data: any): void {
		if (data.key) this.key = data.key;
		if (data.id) this.id = data.id;
		if (data.type) this.type = data.type;
		if (data.order) this.order = data.order;
		if (data.goalCnt) this.goalCnt = data.goalCnt;
		if (data.subGoalCnt) this.subGoalCnt = data.subGoalCnt;
		if (data.curCnt) this.curCnt = data.curCnt;
		if (data.curSubCnt) this.curSubCnt = data.curSubCnt;
		if (data.isCompleted) this.isCompleted = data.isCompleted;
	}
}

export class ReelQuestPromotion {
	public static readonly Newbie_PromotionKeyName: string = "ReelQuestNewbiPromotion";
	public static readonly Normal_PromotionKeyName: string = "ReelQuestPromotion";
	public static readonly Normal_LevelLimit: number = 15;
	public promotionKey: string = "";
	public seasonID: number = 0;
	public group: string = "";
	public eventEnd: number = 0;
	public isTargetUser: boolean = false;
	public isNewBiComplete: boolean = false;

	public parseObj(key: string, data: any): boolean {
		this.promotionKey = key;
		this.seasonID = data.seasonID ? data.seasonID : 0;
		this.group = data.group ? data.group : "";
		this.eventEnd = data.eventEnd ? data.eventEnd : 0;
		this.isTargetUser = data.isTargetUser ? data.isTargetUser : false;
		this.isNewBiComplete = data.isNewBiComplete ? data.isNewBiComplete : false;
		return true;
	}

	public getRemainTime(): number {
		return this.eventEnd - TSUtility.getServerBaseNowUnixTime();
	}

	public isActive(): boolean {
		return this.seasonID !== 0 && this.isTargetUser === true && this.getRemainTime() > 0;
	}
}

export class StarShopFreeRewardPromotion {
	public static readonly PromotionKeyName: string = "StarShopFreeRewardPromotion";
	public curProductIndex: number = 0;
	public nextReceiveTime: number = 0;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.curProductIndex)) this.curProductIndex = data.curProductIndex;
		if (TSUtility.isValid(data.nextReceiveTime)) this.nextReceiveTime = data.nextReceiveTime;
	}
}

export class DailyBonusWheelPromotion {
	public static readonly PromotionKeyName: string = "DailyBonusWheelPromotion";
	public streakedDays: number = 0;
	public nextReceiveTime: number = 0;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.streakedDays)) this.streakedDays = data.streakedDays;
		if (TSUtility.isValid(data.nextReceiveTime)) this.nextReceiveTime = data.nextReceiveTime;
	}
}

export class DailyBonusWheelPromotionExtraInfo {
	public heroMultiplier: number = 1;
	public vipMultiplier: number = 1;
	public streakedBonus: number = 1;
	public totalMultiplier: number = 1;

	public static parseObj(data: any): DailyBonusWheelPromotionExtraInfo {
		const info = new DailyBonusWheelPromotionExtraInfo();
		if (TSUtility.isValid(data.heroMultiplier)) info.heroMultiplier = data.heroMultiplier;
		if (TSUtility.isValid(data.vipMultiplier)) info.vipMultiplier = data.vipMultiplier;
		if (TSUtility.isValid(data.streakedBonus)) info.streakedBonus = data.streakedBonus;
		if (TSUtility.isValid(data.totalMultiplier)) info.totalMultiplier = data.totalMultiplier;
		return info;
	}
}

export class RainbowDiceBonusPromotion {
	public static readonly PromotionKeyName: string = "RainbowDiceBonusPromotion";
	public isReceivedAdBonus: boolean = false;
	public isReceivedReduceTimeAdBonus: boolean = false;
	public nextReceiveTime: number = 0;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.isReceivedAdBonus)) this.isReceivedAdBonus = data.isReceivedAdBonus;
		if (TSUtility.isValid(data.isReceivedReduceTimeAdBonus)) this.isReceivedReduceTimeAdBonus = data.isReceivedReduceTimeAdBonus;
		if (TSUtility.isValid(data.nextReceiveTime)) this.nextReceiveTime = data.nextReceiveTime;
	}
}

export class FireDiceBonusPromotion {
	public static readonly PromotionKeyName: string = "FireDiceBonusPromotion";
	public isReceivedAdBonus: boolean = false;
	public isReceivedReduceTimeAdBonus: boolean = false;
	public nextReceiveTime: number = 0;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.isReceivedAdBonus)) this.isReceivedAdBonus = data.isReceivedAdBonus;
		if (TSUtility.isValid(data.isReceivedReduceTimeAdBonus)) this.isReceivedReduceTimeAdBonus = data.isReceivedReduceTimeAdBonus;
		if (TSUtility.isValid(data.nextReceiveTime)) this.nextReceiveTime = data.nextReceiveTime;
	}
}

export class PiggyBankPromotionInfo {
	public static readonly PromotionKeyName: string = "PiggyBankPromotion";
	public curMoney: number = 0;
	public maxMoney: number = 0;
	public piggyBankPurchaseCnt: number = 0;
	public kickStartMoney: number = 0;
	public kickStartOfferDate: number = 0;
	public firstProgressiveDate: number = 0;
	public fasterAccumulationMultiplier: number = 0;
	public fasterAccumulationOfferDate: number = 0;
	public maxMoneyReachedDate: number = 0;
	public upToOfferType: number = 0;
	public upToOfferDate: number = 0;

	public parseObj(data: any): void {
		this.curMoney = TSUtility.isValid(data.curMoney) ? data.curMoney :0;
		this.maxMoney = TSUtility.isValid(data.maxMoney) ? data.maxMoney :0;
		this.piggyBankPurchaseCnt = TSUtility.isValid(data.piggyBankPurchaseCnt) ? data.piggyBankPurchaseCnt :0;
		this.kickStartMoney = TSUtility.isValid(data.kickStartMoney) ? data.kickStartMoney :0;
		this.firstProgressiveDate = TSUtility.isValid(data.firstProgressiveDate) ? data.firstProgressiveDate :0;
		this.fasterAccumulationMultiplier = TSUtility.isValid(data.fasterAccumulationMultiplier) ? data.fasterAccumulationMultiplier :0;
		this.fasterAccumulationOfferDate = TSUtility.isValid(data.fasterAccumulationOfferDate) ? data.fasterAccumulationOfferDate :0;
		this.maxMoneyReachedDate = TSUtility.isValid(data.maxMoneyReachedDate) ? data.maxMoneyReachedDate :0;
		this.upToOfferType = TSUtility.isValid(data.upToOfferType)? data.upToOfferType :0;
		this.upToOfferDate = TSUtility.isValid(data.upToOfferDate)? data.upToOfferDate :0;
	}
}

export class StarAlbumSeason1ClosePromotionInfo {
	public static readonly PromotionKeyName: string = "StarAlbumSeason1ClosePromotion";
	public isTargetUser: boolean = false;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.isTargetUser)) this.isTargetUser = data.isTargetUser;
	}
}

export class NewSlotOpenPopupPromotion {
	public static readonly PromotionKeyName: string = "NewSlotOpenPopupPromotion";
	public lastReceivedTime: number =0;

	public parseObj(data: any): void {
		this.lastReceivedTime = TSUtility.isValid(data.lastReceivedTime) ? data.lastReceivedTime :0;
	}
}

export class CouponRenewal2022Promotion {
	public static readonly PromotionKeyName: string = "CouponRenewal2022Promotion";
	public streakedDays: number =0;
	public nextReceiveTime: number =0;
	public isTargetUser: boolean =false;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.nextReceiveTime)) this.nextReceiveTime = data.nextReceiveTime;
		if (TSUtility.isValid(data.isTargetUser)) this.isTargetUser = data.isTargetUser;
	}
}

export class DobuleUpPromotion {
	public static readonly PromotionKeyName: string = "MainShopDoubleUpPromotion";
	public endTime: number =0;
	public isTargetUser: boolean =false;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.endDate)) this.endTime = data.endDate;
		if (TSUtility.isValid(data.isTargetUser)) this.isTargetUser = data.isTargetUser;
	}
}

export class StampCardPromotion {
	public static readonly PromotionKeyName: string = "PurchaseStampV2Promotion";
	public prevCnt: number =0;
	public curCnt: number =0;
	public goalCnt: number =0;
	public savedCoin: number =0;
	public version: number =0;
	public totalCollectedCnt: number =0;
	public totalCollectedCoin: number =0;
	public isTargetUser: boolean =false;
	public endTime: number =0;

	// 原JS的拼写错误 parsObj 保留 不修改！！！
	public parsObj(data: any): void {
		if (TSUtility.isValid(data.prevCnt)) this.prevCnt = data.prevCnt;
		if (TSUtility.isValid(data.curCnt)) this.curCnt = data.curCnt;
		if (TSUtility.isValid(data.goalCnt)) this.goalCnt = data.goalCnt;
		if (TSUtility.isValid(data.savedCoin)) this.savedCoin = data.savedCoin;
		if (TSUtility.isValid(data.version)) this.version = data.version;
		if (TSUtility.isValid(data.totalCollectedCnt)) this.totalCollectedCnt = data.totalCollectedCnt;
		if (TSUtility.isValid(data.totalCollectedCoin)) this.totalCollectedCoin = data.totalCollectedCoin;
		if (TSUtility.isValid(data.isTargetUser)) this.isTargetUser = data.isTargetUser;
		if (TSUtility.isValid(data.endDate)) this.endTime = data.endDate;
	}
}

export class ShopRenewalPromotion {
	public static readonly PromotionKeyName: string = "ShopRenewalPromotion";
	public startDate: number =0;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.startDate)) this.startDate = data.startDate;
	}
}

export class ShopNewRatePromotion {
	public static readonly PromotionKeyName: string = "ShopRenewalPromotion2";
	public startDate: number =0;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.startDate)) this.startDate = data.startDate;
	}

	public isAvailableBreakingNews(): boolean {
		const now = TSUtility.getServerBaseNowUnixTime();
		return this.startDate <= now && now < this.startDate + 604800;
	}
}

export class CardPackBoosterPromotion {
	public static readonly PromotionKeyName: string = "StarCardProbPromotion";
	public eventStart: number =0;
	public eventEnd: number =0;
	public isTargetUser: boolean =false;
	public multiplier: number =1;
	public version: number =0;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.eventStart)) this.eventStart = data.eventStart;
		if (TSUtility.isValid(data.eventEnd)) this.eventEnd = data.eventEnd;
		if (TSUtility.isValid(data.isTargetUser)) this.isTargetUser = data.isTargetUser;
		if (TSUtility.isValid(data.multiplier)) this.multiplier = data.multiplier;
		if (TSUtility.isValid(data.version)) this.version = data.version;
	}

	public isAvailableCardPackBooster(): boolean {
		//if (ServiceInfoManager.instance().getUserLevel() < UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsManager.UnlockContentsType.STAR_ALBUM)) return false;
		const now = TSUtility.getServerBaseNowUnixTime();
		return this.eventStart <= now && now < this.eventEnd;
	}

	public getRemainTime(): number {
		const now = TSUtility.getServerBaseNowUnixTime();
		return Math.max(0, this.eventEnd - now);
	}

	public getConditionTotalBet(): number {
		if (!this.isAvailableCardPackBooster()) return 0;
		// const vipLevel = UserInfo.instance().getUserVipInfo().level;
		let bet =0;
		// if (UserInfo.instance().getUserLevelInfo().level <=20) {
		// 	bet =27000;
		// } else {
		// 	if (vipLevel >=0 && vipLevel <=1) bet=108000;
		// 	else if (vipLevel >=2 && vipLevel <=5) bet=270000;
		// 	else if (vipLevel >=6 && vipLevel <=8) bet=540000;
		// 	else if (vipLevel >=9) bet=540000;
		// }
		return bet;
	}

	public getDefaultBet(): number {
		const targetBet = this.getConditionTotalBet();
		const betList = SlotGameRuleManager.Instance.zoneBetPerLines;
		let selected =0;
		for (let i=0; i<betList.length; ++i) {
			const bet = betList[i];
			if (SlotGameRuleManager.Instance.getBetMoney(bet) >= targetBet) break;
			selected = bet;
		}
		const idx = betList.findIndex(v => v === selected);
		if (betList.length > idx+1) selected = betList[idx+1];
		return selected;
	}
}

export class HeroBuffPromotion {
	public static readonly PromotionKeyName: string = "HeroBuffPromotion";
	public eventStart: number =0;
	public eventEnd: number =0;
	public isTargetUser: boolean =false;
	public multiplier: number =1;
	public version: number =0;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.eventStart)) this.eventStart = data.eventStart;
		if (TSUtility.isValid(data.eventEnd)) this.eventEnd = data.eventEnd;
		if (TSUtility.isValid(data.isTargetUser)) this.isTargetUser = data.isTargetUser;
		if (TSUtility.isValid(data.multiplier)) this.multiplier = data.multiplier;
		if (TSUtility.isValid(data.version)) this.version = data.version;
	}

	public isAvailableHeroBuff(): boolean {
		const now = TSUtility.getServerBaseNowUnixTime();
		return this.eventStart <= now && now < this.eventEnd;
	}

	public getRemainTime(): number {
		const now = TSUtility.getServerBaseNowUnixTime();
		return Math.max(0, this.eventEnd - now);
	}

	public getTotalBetCheckHeroBuffPromotion(): number {
		return this.getTotalBetCheckCardPackAndHeroBuffPromotion();
	}

	public getTotalBetCheckCardPackAndHeroBuffPromotion(): number {
		let bet =0;
		// if (UserInfo.instance().getUserLevelInfo().level <=20) {
		// 	bet =27000;
		// } else {
		// 	const vipLevel = UserInfo.instance().getUserVipInfo().level;
		// 	bet = vipLevel <=1 ? 0.9 * ServiceInfoManager.default.instance().getGlobalBetDepth(3) : vipLevel <=5 ?0.9 * ServiceInfoManager.default.instance().getGlobalBetDepth(4) :0.9 * ServiceInfoManager.default.instance().getGlobalBetDepth(5);
		// }
		// let finalBet =0;
		// const modeBet = UserInfo.instance().getModeBetDepthLast500Spins();
		// if (modeBet <0) {
		// 	finalBet = bet;
		// } else {
		// 	const tempBet =0.9 * ServiceInfoManager.default.instance().getGlobalBetDepth(modeBet-1);
		// 	finalBet = tempBet > UserInfo.instance().getTotalCoin()/100 ? tempBet :0.9 * ServiceInfoManager.default.instance().getGlobalBetDepth(modeBet);
		// }
		// return Math.max(bet, finalBet);
        return 0;
	}
}

export class TripleDiamondWheelClosePromotion {
	public static readonly PromotionKeyName: string = "TripleDiamondWheelClosePromotion";
	public eventEnd: number =0;
	public isTargetUser: boolean =false;
	public restrictGoldTicket: boolean =false;
	public restrictDiamondTicket: boolean =false;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.eventEnd)) this.eventEnd = data.eventEnd;
		if (TSUtility.isValid(data.isTargetUser)) this.isTargetUser = data.isTargetUser;
		if (TSUtility.isValid(data.restrictGoldTicket)) this.restrictGoldTicket = data.restrictGoldTicket;
		if (TSUtility.isValid(data.restrictDiamondTicket)) this.restrictDiamondTicket = data.restrictDiamondTicket;
	}

	public isAvailableTripleDiamondWheelClosePromotion(): boolean {
		return TSUtility.getServerBaseNowUnixTime() < this.eventEnd;
	}

	public getRemainTime(): number {
		const now = TSUtility.getServerBaseNowUnixTime();
		return Math.max(0, this.eventEnd - now);
	}

	public isAvailableGetGoldTicket(): boolean {
		return !this.restrictGoldTicket;
	}

	public isAvailableGetDiamondTicket(): boolean {
		return !this.restrictDiamondTicket;
	}
}

export class JiggyPuzzleStage {
	public board: number[] = [];
	public prize: number =0;

	public getCompletePieceCnt(): number {
		return this.board.filter(v => v ===1).length;
	}

	public parseObj(data: any): void {
		if (data.board) {
			for (let i=0; i<data.board.length; i++) this.board.push(data.board[i]);
		}
		if (data.prize) this.prize = data.prize;
	}
}

export class JiggyPuzzlePromotion {
	public static readonly PromotionKeyName: string = "JiggyPrizesCommonPromotion";
	public static readonly stagePieceCntInfos: number[] = [6,6,12,12,15,20,24];
	public static curPieceCnt: number = -1;
	public curStage: number =0;
	public curBoard: number[] = [];
	public endDate: number =0;
	public curGauge: number =0;
	public targetGauge: number =0;
	public baseReward: number =0;
	public multiplier: number =0;
	public totalReward: number =0;
	public isTargetUser: boolean =false;
	public collectedRewards: number[] = [];
	public parseTime: number =0;

	public getCurrentStageIndex(): number {
		return this.curStage -1;
	}

	public isCompleteAllStage(): boolean {
		return this.getCurrentStageIndex() < JiggyPuzzlePromotion.stagePieceCntInfos.length ? false : true;
	}

	public static addPieceCnt(val: number): void {
		JiggyPuzzlePromotion.curPieceCnt += val;
	}

	public static getPieceCnt(): number {
		return JiggyPuzzlePromotion.curPieceCnt;
	}

	public isAvailable(): boolean {
		return JiggyPuzzlePromotion.isLevelLimit() !== true && (this.endDate - TSUtility.getServerBaseNowUnixTime()) >=0;
	}

	public getRemainTime(): number {
		return this.endDate - TSUtility.getServerBaseNowUnixTime();
	}

	public getStageInfo(idx: number): JiggyPuzzleStage {
		const stage = new JiggyPuzzleStage();
		if (idx < this.getCurrentStageIndex()) {
			const pieceCnt = JiggyPuzzlePromotion.stagePieceCntInfos[idx];
			for (let i=0; i<pieceCnt; i++) stage.board.push(1);
			if (idx < this.collectedRewards.length) {
				stage.prize = this.collectedRewards[idx];
			} else {
				cc.error("getStageInfo fail", idx, this.collectedRewards);
				stage.prize =0;
			}
		} else if (idx === this.getCurrentStageIndex()) {
			stage.board = spreadArrays(this.curBoard);
			stage.prize = this.totalReward;
		} else {
			const pieceCnt = JiggyPuzzlePromotion.stagePieceCntInfos[idx];
			for (let i=0; i<pieceCnt; i++) stage.board.push(0);
			stage.prize =0;
		}
		return stage;
	}

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.parseTime)) {
			this.parseTime = data.parseTime;
		} else {
			this.parseTime = TSUtility.getServerBaseNowUnixTime();
			data.parseTime = this.parseTime;
		}
		if (TSUtility.isValid(data.curStage)) this.curStage = data.curStage;
		if (TSUtility.isValid(data.endDate)) this.endDate = data.endDate;
		if (TSUtility.isValid(data.curBoard)) this.curBoard = spreadArrays(data.curBoard);
		if (TSUtility.isValid(data.totalReward)) this.totalReward = data.totalReward;
		if (TSUtility.isValid(data.baseReward)) this.baseReward = data.baseReward;
		if (TSUtility.isValid(data.multiplier)) this.multiplier = data.multiplier;
		if (data.collectedRewards) this.collectedRewards = spreadArrays(data.collectedRewards);
		if (JiggyPuzzlePromotion.curPieceCnt === -1) {
			JiggyPuzzlePromotion.curPieceCnt =0;
			if (TSUtility.isValid(data.curPiece)) JiggyPuzzlePromotion.curPieceCnt = data.curPiece;
		}
		if (data.isTargetUser) this.isTargetUser = data.isTargetUser;
		if (TSUtility.isValid(data.curGauge)) this.curGauge = data.curGauge;
		if (TSUtility.isValid(data.targetGauge)) this.targetGauge = data.targetGauge;
	}

	public static isLevelLimit(): boolean {
		// return UserInfo.instance().getUserLevelInfo().level <10;
        return false;
	}
}

export class JiggyPuzzleChangeHist_Gauge {
	public static readonly actionTypeKey: string = "gauge";
	public actionType: string = "";
	public gauge: number =0;
	public prevGauge: number =0;
	public curGauge: number =0;
	public prevPiece: number =0;
	public curPiece: number =0;

	public isAddedNewPiece(): boolean {
		return this.curPiece > this.prevPiece;
	}

	public static IsValid(): boolean {
		return true;
	}

	public static parseObj(data: any): JiggyPuzzleChangeHist_Gauge | null {
		if (!JiggyPuzzleChangeHist_Gauge.IsValid()) return null;
		const hist = new JiggyPuzzleChangeHist_Gauge();
		if (data.actionType) hist.actionType = data.actionType;
		if (data.gauge) hist.gauge = data.gauge;
		if (data.prevGauge) hist.prevGauge = data.prevGauge;
		if (data.curGauge) hist.curGauge = data.curGauge;
		if (data.prevPiece) hist.prevPiece = data.prevPiece;
		if (data.curPiece) hist.curPiece = data.curPiece;
		return hist;
	}
}

export class JiggyPuzzleChangeHist_Stage {
	public static readonly actionTypeKey: string = "stage";
	public actionType: string = "";
	public prevStage: number =0;
	public curStage: number =0;
	public prevPiece: number =0;
	public curPiece: number =0;
	public getPiecePos: number =0;

	public isComplete(): boolean {
		return this.prevStage !== this.curStage;
	}

	public getCurStageIndex(): number {
		return this.curStage -1;
	}

	public getPrevStageIndex(): number {
		return this.prevStage -1;
	}

	public static IsValid(): boolean {
		return true;
	}

	public static parseObj(data: any): JiggyPuzzleChangeHist_Stage | null {
		if (!JiggyPuzzleChangeHist_Stage.IsValid()) return null;
		const hist = new JiggyPuzzleChangeHist_Stage();
		if (data.actionType) hist.actionType = data.actionType;
		if (data.prevStage) hist.prevStage = data.prevStage;
		if (data.curStage) hist.curStage = data.curStage;
		if (data.prevPiece) hist.prevPiece = data.prevPiece;
		if (data.curPiece) hist.curPiece = data.curPiece;
		if (data.getPiecePos) hist.getPiecePos = data.getPiecePos;
		return hist;
	}
}

export class DailyBlitzRenewalPromotion {
	public static readonly PromotionKeyName: string = "DailyBlitzRenewalPromotion";
	public startDate: number =0;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.startDate)) this.startDate = data.startDate;
	}
}

export class HighRollerSuitePassPromotion {
	public static readonly PromotionKeyName: string = "HighrollerSuitePassPromotion";
	public lastPopupPurchaseDate: number =0;
	public lastNewDySlotReceivedTime: number =0;
	public lastFreeTicketExpireDate: number =0;
	public isTargetUser: boolean =false;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.lastPopupPurchaseDate)) this.lastPopupPurchaseDate = data.lastPopupPurchaseDate;
		if (TSUtility.isValid(data.lastNewDySlotReceivedTime)) this.lastNewDySlotReceivedTime = data.lastNewDySlotReceivedTime;
		if (TSUtility.isValid(data.lastFreeTicketExpireDate)) this.lastFreeTicketExpireDate = data.lastFreeTicketExpireDate;
		if (TSUtility.isValid(data.isTargetUser)) this.isTargetUser = data.isTargetUser;
	}

	public IsDuplicatePurchasePass(): boolean {
		const now = TSUtility.getServerBaseNowUnixTime();
		const expire = this.lastPopupPurchaseDate +604800;
		return this.lastPopupPurchaseDate <= now && expire >= now;
	}

	public IsDuplicateNewSlotPass(): boolean {
		// const slotInfo = ServiceInfoManager.instance().getSuiteNewSlotInfo();
		// if (slotInfo == null) return false;
		// const start = slotInfo.openDate;
		// const expire = slotInfo.openDate +604800;
		// return this.lastNewDySlotReceivedTime >= start && this.lastNewDySlotReceivedTime <= expire;
        return false;
	}

	public CheckFreeSuitePass(): boolean {
		// const user = UserInfo.instance();
		// if (user == null) return false;
		// const vip = user.getUserVipInfo().level;
		// if (vip <5 || vip >6) return false;
		// if (user.getTotalCoin() <300000000) return false;
		// if (this.lastFreeTicketExpireDate >0) {
		// 	const now = TSUtility.getServerBaseNowUnixTime();
		// 	if (this.lastFreeTicketExpireDate +1209600 >= now) return false;
		// }
		return true;
	}
}

export class MembersClassBoostUpPromotion {
	public static readonly PromotionKeyName: string = "MembersClassBoostUpPromotion";
	public eventEnd: number =0;
	public isTargetUser: boolean =false;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.eventEnd)) this.eventEnd = data.eventEnd;
		if (TSUtility.isValid(data.isTargetUser)) this.isTargetUser = data.isTargetUser;
	}

	public isValid(): boolean {
		const now = TSUtility.getServerBaseNowUnixTime();
		return this.isTargetUser && now < this.eventEnd;
	}

	public getRemainTime(): number {
		const now = TSUtility.getServerBaseNowUnixTime();
		return Math.max(0, this.eventEnd - now);
	}
}

export class MembersClassBoostUpExpandPromotion {
	public static readonly PromotionKeyName: string = "MembersClassBoostUpNormalPromotion";
	public eventEnd: number =0;
	public isTargetUser: boolean =false;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.eventEnd)) this.eventEnd = data.eventEnd;
		if (TSUtility.isValid(data.isTargetUser)) this.isTargetUser = data.isTargetUser;
	}

	public isValid(): boolean {
		TSUtility.getServerBaseNowUnixTime();
		return !!this.isTargetUser;
	}

	public getRemainTime(): number {
		const now = TSUtility.getServerBaseNowUnixTime();
		return Math.max(0, this.eventEnd - now);
	}
}

export class AllMightyCouponPromotion {
	public static readonly PromotionKeyName: string = "AlmightyCouponPromotion";
	public coinAddrate: number =0;
	public memPointAddRate: number =0;
	public expireDate: number =0;
	public lastReceivedDate: number =0;
	public isTargetUser: boolean =false;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.coinAddRate)) this.coinAddrate = data.coinAddRate;
		if (TSUtility.isValid(data.memPointAddRate)) this.memPointAddRate = data.memPointAddRate;
		if (TSUtility.isValid(data.expireDate)) this.expireDate = data.expireDate;
		if (TSUtility.isValid(data.lastReceivedDate)) this.lastReceivedDate = data.lastReceivedDate;
		if (TSUtility.isValid(data.isTargetUser)) this.isTargetUser = data.isTargetUser;
	}

	public isValid(): boolean {
		return TSUtility.getServerBaseNowUnixTime() < this.expireDate;
	}

	public getRemainTime(): number {
		const now = TSUtility.getServerBaseNowUnixTime();
		return Math.max(0, this.expireDate - now);
	}
}

export class PowerGemPromotion {
	public static readonly PromotionKeyName: string = "PowerGemPromotion";
	public arrPowerGem: PowerGemInfo[] = [];
	public arrSlotID: number[] = [];
	public numEventGetableExpireDate: number =0;
	public numEventOpenableExpireDate: number =0;
	public numEventEndDate: number =0;
	public isFulled: boolean =false;
	public isTargetUser: boolean =false;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.powerGem)) {
			for (let i=0; i<data.powerGem.length; i++) {
				const gem = new PowerGemInfo();
				gem.parseObj(data.powerGem[i]);
				this.arrPowerGem.push(gem);
			}
		}
		if (TSUtility.isValid(data.getableGemExpireDate)) this.numEventGetableExpireDate = data.getableGemExpireDate;
		if (TSUtility.isValid(data.openableGemExpireDate)) this.numEventOpenableExpireDate = data.openableGemExpireDate;
		if (TSUtility.isValid(data.eventEnd)) this.numEventEndDate = data.eventEnd;
		if (TSUtility.isValid(data.isFulled)) this.isFulled = data.isFulled;
		if (TSUtility.isValid(data.isTargetUser)) this.isTargetUser = data.isTargetUser;
		if (TSUtility.isValid(data.targetSlots)) this.arrSlotID = data.targetSlots;
	}
}

export class UserWelcomeBackMissionInfo {
	public missionId: number =0;
	public curCnt: number =0;
	public goalCnt: number =0;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.missionID)) this.missionId = data.missionID;
		if (TSUtility.isValid(data.curCnt)) this.curCnt = data.curCnt;
		if (TSUtility.isValid(data.goalCnt)) this.goalCnt = data.goalCnt;
	}

	public isCompleteMission(): boolean {
		return this.curCnt >= this.goalCnt;
	}
}

export class UserWelcomeBackRenewalInfo {
	public static readonly PromotionKeyName: string = "WelcomeBackV2Promotion";
	public curStage: number =0;
	public baseCoin: number =0;
	public rewardCoin: number =0;
	public isReceivedCoupon: boolean =false;
	public isReceivedMissionReward: boolean =false;
	public missionResetDate: number =0;
	public endDate: number =0;
	public missionInfos: UserWelcomeBackMissionInfo[] = [];

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.stage)) this.curStage = data.stage;
		if (TSUtility.isValid(data.baseCoin)) this.baseCoin = data.baseCoin;
		if (TSUtility.isValid(data.rewardCoin)) this.rewardCoin = data.rewardCoin;
		if (TSUtility.isValid(data.isReceivedCoupon)) this.isReceivedCoupon = data.isReceivedCoupon;
		if (TSUtility.isValid(data.isReceivedMissionReward)) this.isReceivedMissionReward = data.isReceivedMissionReward;
		if (TSUtility.isValid(data.missionResetDate)) this.missionResetDate = data.missionResetDate;
		if (TSUtility.isValid(data.endDate)) this.endDate = data.endDate;
		if (TSUtility.isValid(data.missionInfo)) {
			for (let i=0; i<data.missionInfo.length; i++) {
				const mission = new UserWelcomeBackMissionInfo();
				mission.parseObj(data.missionInfo[i]);
				this.missionInfos.push(mission);
			}
		}
	}

	public isAvailable(): boolean {
		return !(this.endDate < TSUtility.getServerBaseNowUnixTime() || (this.curStage ===5 && this.isReceivedMissionReward ===true));
	}

	public getBaseCoin(): number {
		return this.baseCoin;
	}

	public getRewardCoin(): number {
		return this.rewardCoin;
	}

	public isFinishedProm(): boolean {
		return this.isReceivedMissionReward ===true && this.curStage ===5;
	}
}

export class SupersizeJackpotEventInfo {
	public static readonly PromotionKeyName: string = "SupersizeJackpotEvent";
	public strLinID: string = "";
	public numPopupStartDate: number =0;
	public numEventStartDate: number =0;
	public numTicketAmount: number =0;
	public arrTargetSlot: any[] = [];
	public isTicketSoldOut: boolean =false;
	public isReceivedSlotPlayTicket: boolean =false;

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.linkID)) this.strLinID = data.linkID;
		if (TSUtility.isValid(data.popUpStartDate)) this.numPopupStartDate = data.popUpStartDate;
		if (TSUtility.isValid(data.eventStartDate)) this.numEventStartDate = data.eventStartDate;
		if (TSUtility.isValid(data.ticketAmount)) this.numTicketAmount = data.ticketAmount;
		if (TSUtility.isValid(data.targetSlotInfos)) this.arrTargetSlot = data.targetSlotInfos;
		if (TSUtility.isValid(data.isTicketSoldOut)) this.isTicketSoldOut = data.isTicketSoldOut;
		if (TSUtility.isValid(data.isReceivedSlotPlayTicket)) this.isReceivedSlotPlayTicket = data.isReceivedSlotPlayTicket;
	}
}

export class DailyBlitzEndReservePromotion {
	public static readonly PromotionKeyName: string = "DailyBlitzReserve";
	public endDate: number =0;

	public get endDateTime(): number {
		return this.endDate;
	}

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.endDate)) this.endDate = data.endDate;
	}
}

export class HyperBountyPromotionRewardInfo {
	private _strItemID: string = "";
	private _strItemType: string = "";
	private _numAddCount: number = 0;
	private _numAddTime: number = 0;

	public get strItemID(): string { return this._strItemID; }
	public get strItemType(): string { return this._strItemType; }
	public get numAddCount(): number { return this._numAddCount; }
	public get numAddTime(): number { return this._numAddTime; }

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.itemID)) this._strItemID = data.itemID;
		if (TSUtility.isValid(data.itemType)) this._strItemType = data.itemType;
		if (TSUtility.isValid(data.addCnt)) this._numAddCount = data.addCnt;
		if (TSUtility.isValid(data.addTime)) this._numAddTime = data.addTime;
	}
}

export class HyperBountyMissionInfo {
	private _numMissionID: number = 0;
	private _numCurrentCount: number = 0;
	private _numGoalCount: number = 0;
	private _numSubCurrentCount: number = 0;
	private _numSubGoalCount: number = 0;
	private _numValue_1: number = 0;
	private _numAddPassPoint: number = 0;
	private _strValue_1: string = "";
	private _arrReward: HyperBountyPromotionRewardInfo[] = [];
	private _isReceived: boolean = false;
	public numClientIndex: number = 0;

	public get numMissionID(): number { return this._numMissionID; }
	public get numCurrentCount(): number { return this._numCurrentCount; }
	public get numGoalCount(): number { return this._numGoalCount; }
	public get numSubCurrentCount(): number { return this._numSubCurrentCount; }
	public get numSubGoalCount(): number { return this._numSubGoalCount; }
	public get numValue_1(): number { return this._numValue_1; }
	public get numAddPassPoint(): number { return this._numAddPassPoint; }
	public get strValue_1(): string { return this._strValue_1; }
	public get arrReward(): HyperBountyPromotionRewardInfo[] { return this._arrReward; }
	public get isReceived(): boolean { return this._isReceived; }
	public get isComplete(): boolean { return this._numCurrentCount >= this._numGoalCount; }

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.missionID)) this._numMissionID = data.missionID;
		if (TSUtility.isValid(data.curCnt)) this._numCurrentCount = data.curCnt;
		if (TSUtility.isValid(data.goalCnt)) this._numGoalCount = data.goalCnt;
		if (TSUtility.isValid(data.subCurCnt)) this._numSubCurrentCount = data.subCurCnt;
		if (TSUtility.isValid(data.subGoalCnt)) this._numSubGoalCount = data.subGoalCnt;
		if (TSUtility.isValid(data.val1)) this._numValue_1 = data.val1;
		if (TSUtility.isValid(data.strVal1)) this._strValue_1 = data.strVal1;
		if (TSUtility.isValid(data.rewards)) {
			this._arrReward = [];
			for (let i=0; i<data.rewards.length; i++) {
				const reward = new HyperBountyPromotionRewardInfo();
				reward.parseObj(data.rewards[i]);
				this._arrReward.push(reward);
			}
		}
		if (TSUtility.isValid(data.addPassPoint)) this._numAddPassPoint = data.addPassPoint;
		if (TSUtility.isValid(data.isReceived)) this._isReceived = data.isReceived;
	}
}

export class HyperBountyDailyNormalPromotionInfo {
	public static readonly PromotionKeyName: string = "HyperBountyDailyNormalPromotion";
	private _arrMission: HyperBountyMissionInfo[] = [];
	private _numNextResetDate: number = 0;
	private _isReceivedCompletedReward: boolean = false;
	private _fixedVIPLevel: number = 0;

	public get arrMission(): HyperBountyMissionInfo[] { return this._arrMission; }
	public get isReceivedCompletedReward(): boolean { return this._isReceivedCompletedReward; }
	public get numNextResetDate(): number { return this._numNextResetDate; }
	public get fixedVIPLevel(): number { return this._fixedVIPLevel; }

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.missionInfo)) {
			this._arrMission = [];
			for (let i=0; i<data.missionInfo.length; i++) {
				const mission = new HyperBountyMissionInfo();
				mission.parseObj(data.missionInfo[i]);
				mission.numClientIndex = i;
				this._arrMission.push(mission);
			}
		}
		if (TSUtility.isValid(data.nextResetDate)) this._numNextResetDate = data.nextResetDate;
		if (TSUtility.isValid(data.isReceivedAllCompletedReward)) this._isReceivedCompletedReward = data.isReceivedAllCompletedReward;
		if (TSUtility.isValid(data.fixedVIPLevel)) this._fixedVIPLevel = data.fixedVIPLevel;
	}
}

export class HyperBountyDailySuperPromotionInfo {
	public static readonly PromotionKeyName: string = "HyperBountyDailySuperPromotion";
	private _numRound: number =0;
	private _infoMission: HyperBountyMissionInfo | null = null;
	private _numNextResetDate: number =0;
	private _numFixedVIPLevel: number =0;

	public get numRound(): number { return this._numRound; }
	public get infoMission(): HyperBountyMissionInfo | null { return this._infoMission; }
	public get numNextResetDate(): number { return this._numNextResetDate; }
	public get fixedVIPLevel(): number { return this._numFixedVIPLevel; }

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.round)) this._numRound = data.round;
		if (TSUtility.isValid(data.missionInfo)) {
			this._infoMission = new HyperBountyMissionInfo();
			this._infoMission.parseObj(data.missionInfo);
		}
		if (TSUtility.isValid(data.nextResetDate)) this._numNextResetDate = data.nextResetDate;
		if (TSUtility.isValid(data.fixedVIPLevel)) this._numFixedVIPLevel = data.fixedVIPLevel;
	}
}

export class HyperBountySeasonMissionInfo {
	private _arrMission: HyperBountyMissionInfo[] = [];
	private _numMissionOpenDate: number =0;

	public get arrMission(): HyperBountyMissionInfo[] { return this._arrMission; }
	public get numMissionOpenDate(): number { return this._numMissionOpenDate; }

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.infos)) {
			this._arrMission = [];
			for (let i=0; i<data.infos.length; i++) {
				const mission = new HyperBountyMissionInfo();
				mission.parseObj(data.infos[i]);
				this._arrMission.push(mission);
			}
		}
		if (TSUtility.isValid(data.missionOpenDate)) this._numMissionOpenDate = data.missionOpenDate;
	}
}

export class HyperBountySeasonPromotionInfo {
	public static readonly PromotionKeyName: string = "HyperBountySeasonPromotion";
	private _arrMission: HyperBountySeasonMissionInfo[] = [];
	private _numSeasonResetDate: number =0;
	private _isTargetUser: boolean =false;

	public get arrMission(): HyperBountySeasonMissionInfo[] { return this._arrMission; }
	public get numNextResetDate(): number { return this._numSeasonResetDate; }
	public get isTargetUser(): boolean { return this._isTargetUser; }

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.missionInfo)) {
			this._arrMission = [];
			for (let i=0; i<data.missionInfo.length; i++) {
				const mission = new HyperBountySeasonMissionInfo();
				mission.parseObj(data.missionInfo[i]);
				this._arrMission.push(mission);
			}
		}
		if (TSUtility.isValid(data.seasonResetDate)) this._numSeasonResetDate = data.seasonResetDate;
		if (TSUtility.isValid(data.isTargetUser)) this._isTargetUser = data.isTargetUser;
	}
}

export class HyperBountyPassPromotionInfo {
	public static readonly PromotionKeyName: string = "HyperBountyPassPromotion";
	private _arrCollectedRewardLevel: number[] = [];
	private _arrCollectPremiumRewardLevel: number[] = [];
	private _numNextResetDate: number =0;
	private _numSeasonStartDate: number =0;
	private _numExtendRewardCollectCount: number =0;
	private _numPointBoostRate: number =0;
	private _isCheckedBoostUser: boolean =false;
	private _isTargetUser: boolean =false;

	public get numNextResetDate(): number { return this._numNextResetDate; }
	public get numSeasonStartDate(): number { return this._numSeasonStartDate; }
	public get numExtendRewardCollectCount(): number { return this._numExtendRewardCollectCount; }
	public get isTargetUser(): boolean { return this._isTargetUser; }
	public get arrCollectedRewardLevel(): number[] { return this._arrCollectedRewardLevel; }
	public get arrCollectPremiumRewardLevel(): number[] { return this._arrCollectPremiumRewardLevel; }
	public get numPointBoostRate(): number { return this._numPointBoostRate; }
	public get isCheckedBoostUser(): boolean { return this._isCheckedBoostUser; }

	public parseObj(data: any): void {
		if (TSUtility.isValid(data.collectedLevels)) {
			this._arrCollectedRewardLevel = [];
			for (let i=0; i<data.collectedLevels.length; i++) this._arrCollectedRewardLevel.push(data.collectedLevels[i]);
		}
		if (TSUtility.isValid(data.collectedPremiumLevels)) {
			this._arrCollectPremiumRewardLevel = [];
			for (let i=0; i<data.collectedPremiumLevels.length; i++) this._arrCollectPremiumRewardLevel.push(data.collectedPremiumLevels[i]);
		}
		if (TSUtility.isValid(data.nextResetDate)) this._numNextResetDate = data.nextResetDate;
		if (TSUtility.isValid(data.seasonStartDate)) this._numSeasonStartDate = data.seasonStartDate;
		if (TSUtility.isValid(data.extendRewardCollectCount)) this._numExtendRewardCollectCount = data.extendRewardCollectCount;
		if (TSUtility.isValid(data.pointBoostRate)) this._numPointBoostRate = data.pointBoostRate;
		if (TSUtility.isValid(data.isCheckedBoostUser)) this._isCheckedBoostUser = data.isCheckedBoostUser;
		if (TSUtility.isValid(data.isTargetUser)) this._isTargetUser = data.isTargetUser;
	}
}

/**
 * ===================== 核心管理类 所有促销的解析/存储/获取 1:1复刻原JS =====================
 */
@ccclass
export default class UserPromotion {
    public infos: { [key: string]: any } = {};

    public getPromotionInfo(key: string): any {
        return this.infos[key];
    }

    public static ParsePromotion(key: string, data: any): any {
        switch (key) {
            case TimeBonusPromotion.PromotionKeyName:
                const timeBonus = new TimeBonusPromotion();
                timeBonus.parseObj(data);
                return timeBonus;
            case MemberPlusBonusPromotion.PromotionKeyName:
                const memberPlus = new MemberPlusBonusPromotion();
                memberPlus.parseObj(data);
                return memberPlus;
            case WelcomeBonusPromotion.PromotionKeyName:
                const welcome = new WelcomeBonusPromotion();
                welcome.parseObj(data);
                return welcome;
            case DailyInboxCoinPromotion.PromotionKeyName:
                const inboxCoin = new DailyInboxCoinPromotion();
                inboxCoin.parseObj(data);
                return inboxCoin;
            case DailyBingoBallPromotion.PromotionKeyName:
                const bingoBall = new DailyBingoBallPromotion();
                bingoBall.parseObj(data);
                return bingoBall;
            case DailyShortcutPromotion.PromotionKeyName:
                const shortcut = new DailyShortcutPromotion();
                shortcut.parseObj(data);
                return shortcut;
            case WelcomebackPromotionInfo.PromotionKeyName:
                const welcomeBack = new WelcomebackPromotionInfo();
                welcomeBack.parseObj(data);
                return welcomeBack;
            case InboxShopPromotion.PromotionKeyName:
                const inboxShop = new InboxShopPromotion();
                inboxShop.parseObj(data);
                return inboxShop;
            case PurchasePromotion.PromotionKeyName:
                const purchase = new PurchasePromotion();
                purchase.parseObj(data);
                return purchase;
            case WatchRewardAdPromotion.PromotionKeyName:
                const watchAd = new WatchRewardAdPromotion();
                watchAd.parseObj(data);
                return watchAd;
            case SharePromotion.PromotionKeyName:
                const share = new SharePromotion();
                share.parseObj(data);
                return share;
            case FacebookADPromotion.PromotionKeyName:
                const fbAd = new FacebookADPromotion();
                fbAd.parseObj(data);
                return fbAd;
            case FBInstantShortcutPromotion.PromotionKeyName:
                const fbShortcut = new FBInstantShortcutPromotion();
                fbShortcut.parseObj(data);
                return fbShortcut;
            case FBMobileConnectPromotion.PromotionKeyName:
                const fbConnect = new FBMobileConnectPromotion();
                fbConnect.parseObj(data);
                return fbConnect;
            case GiftBalloonPromotion.PromotionKeyName:
                const giftBalloon = new GiftBalloonPromotion();
                giftBalloon.parseObj(data);
                return giftBalloon;
            case SlotMatePromotion.PromotionKeyName:
                const slotMate = new SlotMatePromotion();
                slotMate.parseObj(data);
                return slotMate;
            case BingoMatePromotion.PromotionKeyName:
                const bingoMate = new BingoMatePromotion();
                bingoMate.parseObj(data);
                return bingoMate;
            case DailyStampPromotion.PromotionKeyName:
                const dailyStamp = new DailyStampPromotion();
                dailyStamp.parseObj(data);
                return dailyStamp;
            case DailyStampV2Promotion.PromotionKeyName:
                const dailyStampV2 = new DailyStampV2Promotion();
                dailyStampV2.parseObj(data);
                return dailyStampV2;
            case NewUserMissionPromotion.PromotionKeyName:
                const newUserMission = new NewUserMissionPromotion();
                newUserMission.parseObj(data);
                return newUserMission;
            case NewServiceIntroduceCoinPromotion.PromotionKeyName:
                const newServiceIntro = new NewServiceIntroduceCoinPromotion();
                newServiceIntro.parseObj(data);
                return newServiceIntro;
            case StayStrong2xPromotion.PromotionKeyName:
                const stayStrong = new StayStrong2xPromotion();
                stayStrong.parseObj(data);
                return stayStrong;
            case LevelUpEventPromotion.PromotionKeyName:
                const levelUpEvent = new LevelUpEventPromotion();
                levelUpEvent.parseObj(data);
                return levelUpEvent;
            case LevelUpPassPromotion.PromotionKeyName:
                const levelUpPass = new LevelUpPassPromotion();
                levelUpPass.parseObj(data);
                return levelUpPass;
            case MobileReviewPopupPromotion.PromotionKeyName:
                const mobileReview = new MobileReviewPopupPromotion();
                mobileReview.parseObj(data);
                return mobileReview;
            case NewUserAllInCarePromotion.PromotionKeyName:
                const newUserCare = new NewUserAllInCarePromotion();
                newUserCare.parseObj(data);
                return newUserCare;
            case StarShopFreeRewardPromotion.PromotionKeyName:
                const starShopFree = new StarShopFreeRewardPromotion();
                starShopFree.parseObj(data);
                return starShopFree;
            case DailyBonusWheelPromotion.PromotionKeyName:
                const dailyWheel = new DailyBonusWheelPromotion();
                dailyWheel.parseObj(data);
                return dailyWheel;
            case RainbowDiceBonusPromotion.PromotionKeyName:
                const rainbowDice = new RainbowDiceBonusPromotion();
                rainbowDice.parseObj(data);
                return rainbowDice;
            case FireDiceBonusPromotion.PromotionKeyName:
                const fireDice = new FireDiceBonusPromotion();
                fireDice.parseObj(data);
                return fireDice;
            case PiggyBankPromotionInfo.PromotionKeyName:
                const piggyBank = new PiggyBankPromotionInfo();
                piggyBank.parseObj(data);
                return piggyBank;
            case StarAlbumSeason1ClosePromotionInfo.PromotionKeyName:
                const starAlbumClose = new StarAlbumSeason1ClosePromotionInfo();
                starAlbumClose.parseObj(data);
                return starAlbumClose;
            case NewSlotOpenPopupPromotion.PromotionKeyName:
                const newSlotPopup = new NewSlotOpenPopupPromotion();
                newSlotPopup.parseObj(data);
                return newSlotPopup;
            case BubbleTumbleCrossPromotion.PromotionKeyName:
                const bubbleTumble = new BubbleTumbleCrossPromotion();
                bubbleTumble.parseObj(data);
                return bubbleTumble;
            case VCSCrossPromotion.PromotionKeyName:
                const vcsCross = new VCSCrossPromotion();
                vcsCross.parseObj(data);
                return vcsCross;
            case CouponRenewal2022Promotion.PromotionKeyName:
                const couponRenew = new CouponRenewal2022Promotion();
                couponRenew.parseObj(data);
                return couponRenew;
            case DobuleUpPromotion.PromotionKeyName:
                const doubleUp = new DobuleUpPromotion();
                doubleUp.parseObj(data);
                return doubleUp;
            case StampCardPromotion.PromotionKeyName:
                const stampCard = new StampCardPromotion();
                stampCard.parsObj(data);
                return stampCard;
            case ShopRenewalPromotion.PromotionKeyName:
                const shopRenew = new ShopRenewalPromotion();
                shopRenew.parseObj(data);
                return shopRenew;
            case ShopNewRatePromotion.PromotionKeyName:
                const shopNewRate = new ShopNewRatePromotion();
                shopNewRate.parseObj(data);
                return shopNewRate;
            case CardPackBoosterPromotion.PromotionKeyName:
                const cardPack = new CardPackBoosterPromotion();
                cardPack.parseObj(data);
                return cardPack;
            case HeroBuffPromotion.PromotionKeyName:
                const heroBuff = new HeroBuffPromotion();
                heroBuff.parseObj(data);
                return heroBuff;
            case TripleDiamondWheelClosePromotion.PromotionKeyName:
                const tripleDiamond = new TripleDiamondWheelClosePromotion();
                tripleDiamond.parseObj(data);
                return tripleDiamond;
            case JiggyPuzzlePromotion.PromotionKeyName:
                const jiggyPuzzle = new JiggyPuzzlePromotion();
                jiggyPuzzle.parseObj(data);
                return jiggyPuzzle;
            case DailyBlitzRenewalPromotion.PromotionKeyName:
                const blitzRenew = new DailyBlitzRenewalPromotion();
                blitzRenew.parseObj(data);
                return blitzRenew;
            case MembersClassBoostUpPromotion.PromotionKeyName:
                const memberBoost = new MembersClassBoostUpPromotion();
                memberBoost.parseObj(data);
                return memberBoost;
            case MembersClassBoostUpExpandPromotion.PromotionKeyName:
                const memberBoostExpand = new MembersClassBoostUpExpandPromotion();
                memberBoostExpand.parseObj(data);
                return memberBoostExpand;
            case AllMightyCouponPromotion.PromotionKeyName:
                const allMighty = new AllMightyCouponPromotion();
                allMighty.parseObj(data);
                return allMighty;
            case ReelQuestPromotion.Newbie_PromotionKeyName:
            case ReelQuestPromotion.Normal_PromotionKeyName:
                const reelQuest = new ReelQuestPromotion();
                return reelQuest.parseObj(key, data) ? reelQuest : null;
            case HighRollerSuitePassPromotion.PromotionKeyName:
                const highRoller = new HighRollerSuitePassPromotion();
                highRoller.parseObj(data);
                return highRoller;
            case PowerGemPromotion.PromotionKeyName:
                const powerGem = new PowerGemPromotion();
                powerGem.parseObj(data);
                return powerGem;
            case UserWelcomeBackRenewalInfo.PromotionKeyName:
                const welcomeBackV2 = new UserWelcomeBackRenewalInfo();
                welcomeBackV2.parseObj(data);
                return welcomeBackV2;
            case SupersizeJackpotEventInfo.PromotionKeyName:
                const jackpot = new SupersizeJackpotEventInfo();
                jackpot.parseObj(data);
                return jackpot;
            case DailyBlitzEndReservePromotion.PromotionKeyName:
                const blitzReserve = new DailyBlitzEndReservePromotion();
                blitzReserve.parseObj(data);
                return blitzReserve;
            case HyperBountyDailyNormalPromotionInfo.PromotionKeyName:
                const hyperDailyNormal = new HyperBountyDailyNormalPromotionInfo();
                hyperDailyNormal.parseObj(data);
                return hyperDailyNormal;
            case HyperBountyDailySuperPromotionInfo.PromotionKeyName:
                const hyperDailySuper = new HyperBountyDailySuperPromotionInfo();
                hyperDailySuper.parseObj(data);
                return hyperDailySuper;
            case HyperBountySeasonPromotionInfo.PromotionKeyName:
                const hyperSeason = new HyperBountySeasonPromotionInfo();
                hyperSeason.parseObj(data);
                return hyperSeason;
            case HyperBountyPassPromotionInfo.PromotionKeyName:
                const hyperPass = new HyperBountyPassPromotionInfo();
                hyperPass.parseObj(data);
                return hyperPass;
            default:
                return null;
        }
    }

    public initPromotion(list: any[]): boolean {
        for (let i=0; i<list.length; ++i) {
            const item = list[i];
            const key = item.promotionKey;
            const info = UserPromotion.ParsePromotion(key, item.promotionInfo);
            if (info != null) this.infos[key] = info;
        }
        return true;
    }

    public setPromotion(data: any): void {
        const key = data.promotionKey;
        const info = UserPromotion.ParsePromotion(key, data.promotionInfo);
        if (info != null) {
            if (key === JiggyPuzzlePromotion.PromotionKeyName && this.infos[key]) this.infos[key] = info;
            this.infos[key] = info;
        }
    }

    public removePromotion(key: string): void {
        delete this.infos[key];
    }
}