import { INBOX_ITEM_TYPE } from "./InboxMessagePrefabManager";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";
import ServerStorageManager, { StorageByOsKeyType, StorageKeyType } from "./manager/ServerStorageManager";
import MessageRoutingManager from "./message/MessageRoutingManager";

export default class ServiceInfoManager {
    private static _instance: ServiceInfoManager = null;
    _numUserLevel: number;
    _arrNewDynamicSlotInfo: any[];
    _arrNewEarlySlotInfo: any[];
    _arrSneakPeekSlotID: any[];
    _arrComingSoonSlotID: any[];
    _arrUnCheckedUID: any[];
    _arrSpinOpenPopup: any[];
    _arrWheelJackpotAmount: any[];
    _arrGlobalBetDepth: number[];
    public static get instance(): ServiceInfoManager {
        if (this._instance == null) {
            this._instance = new ServiceInfoManager();
        }
        return this._instance;
    }

    constructor() {
        this._numUserLevel = 0
        this._arrNewDynamicSlotInfo = []
        this._arrNewEarlySlotInfo = []
        this._arrSneakPeekSlotID = []
        this._arrComingSoonSlotID = []
        this._arrUnCheckedUID = []
        this._arrSpinOpenPopup = []
        this._arrWheelJackpotAmount = []
        this._arrGlobalBetDepth = [12e3, 3e4, 6e4, 12e4, 3e5, 6e5, 12e5, 3e6, 6e6, 12e6, 3e7, 6e7, 9e7, 12e7, 18e7, 24e7, 3e8, 6e8, 9e8, 12e8, 18e8, 24e8, 3e9]
    }

    setNewSlotInfo = function() {
		// var e = TSUtility.getPstToUtcTimestamp(Date.UTC(2025, 11, 18, 0, 0, 0) / 1e3)
		//   , t = TSUtility.getPstToUtcTimestamp(Date.UTC(2025, 11, 13, 0, 0, 0) / 1e3)
		//   , n = null;
		// (n = new C.NewSlotInfo).initData("twilightdragon", TSUtility.isLiveService() ? e : t, 0),
		// this._arrNewEarlySlotInfo.push(n)
	}
	
	setRevampSlotInfo = function() {
		// var e = TSUtility.getPstToUtcTimestamp(Date.UTC(2025, 6, 17, 0, 0, 0) / 1e3)
		//   , n = TSUtility.getPstToUtcTimestamp(Date.UTC(2025, 5, 12, 0, 0, 0) / 1e3)
		//   , o = null;
		// (o = new C.NewSlotInfo).initData(SDefine.SUBGAMEID_SLOT_DIAMONDBEAMJACKPOT, TSUtility.isLiveService() ? e : n, 0),
		// t.INFO_REVAMP_SLOT = o,
		// t.STRING_REVAMP_SLOT_ID = o.slotID
	}
	
	getDynamicNewSlot = function() {
		var e = [];
		return TSUtility.isDevService() ? (e.push(SDefine.SUBGAMEID_SLOT_WILDHEARTS_DY),
		e.push(SDefine.SUBGAMEID_SLOT_PIGGYMANIA_DY)) : (TSUtility.isQAService(),
		e.push(SDefine.SUBGAMEID_SLOT_WILDHEARTS_DY),
		e.push(SDefine.SUBGAMEID_SLOT_PIGGYMANIA_DY)),
		e
	}
	
	getDynamicComingSoonSlot = function() {
		return TSUtility.isDevService() || TSUtility.isQAService(),
		[]
	}
	
	getSuiteNewSlotInfo = function() {
		for (var e = 0; e < this._arrNewDynamicSlotInfo.length; e++)
			if (1 == this.checkEnableNewSlotInfo(this._arrNewDynamicSlotInfo[e]))
				return this._arrNewDynamicSlotInfo[e];
		return null
	}
	
	getEarlySlotInfo = function() {
		for (var e = 0; e < this._arrNewEarlySlotInfo.length; e++)
			if (1 == this.checkEnableNewSlotInfo(this._arrNewEarlySlotInfo[e]))
				return this._arrNewEarlySlotInfo[e];
		return null
	}
	
	getRevampSlotInfo = function() {
		// var e = t.INFO_REVAMP_SLOT;
		// if (0 == TSUtility.isValid(e))
		// 	return null;
		// if (TSUtility.isLiveService()) {
		// 	if (TSUtility.getServerBaseNowUnixTime() - (e.openDate + 259200) <= 0 && TSUtility.getServerBaseNowUnixTime() >= e.openDate)
		// 		return e
		// } else if (TSUtility.getServerBaseNowUnixTime() - (e.openDate + 1209600) <= 0 && TSUtility.getServerBaseNowUnixTime() >= e.openDate)
		// 	return e;
		return null
	}
	
	checkEnableNewSlotInfo = function(e) {
		if (TSUtility.isLiveService()) {
			if (TSUtility.getServerBaseNowUnixTime() - (e.openDate + 604800) <= 0 && TSUtility.getServerBaseNowUnixTime() >= e.openDate)
				return true
		} else if (TSUtility.getServerBaseNowUnixTime() - (e.openDate + 604800) <= 0 && TSUtility.getServerBaseNowUnixTime() >= e.openDate)
			return true;
		return false
	}
	
	isEnableNewSuiteSlotInfo = function() {
		var e = this.getSuiteNewSlotInfo();
		return TSUtility.isValid(e) && TSUtility.getServerBaseNowUnixTime() - (e.openDate + 604800) <= 0 && TSUtility.getServerBaseNowUnixTime() >= e.openDate
	}
	
	isEnableRevampSlotInfo = function() {
		var e = this.getRevampSlotInfo();
		return TSUtility.isValid(e) && TSUtility.getServerBaseNowUnixTime() - (e.openDate + 259200) <= 0 && TSUtility.getServerBaseNowUnixTime() >= e.openDate
	}
	
	getIsNewHeroWeek = function() {
		var e = TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 2, 11, 0, 0, 0) / 1e3)
		  , t = TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 2, 31, 1, 59, 59) / 1e3);
		TSUtility.isLiveService() && (e = TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 2, 29, 0, 0, 0) / 1e3),
		t = TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 3, 4, 23, 59, 59) / 1e3));
		var n = TSUtility.getServerBaseNowUnixTime();
		return e <= n && n <= t
	}
	
	getHeroWeekEndInfo = function() {
		var e = TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 2, 31, 1, 59, 59) / 1e3);
		return TSUtility.isLiveService() && (e = TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 3, 4, 23, 59, 59) / 1e3)),
		e
	}
	
	resetSpinOpenPopup = function() {
		this._arrSpinOpenPopup = []
	}
	
	addSpinOpenPopup = function(e) {
		-1 == this._arrSpinOpenPopup.indexOf(e) && this._arrSpinOpenPopup.push(e)
	}
	
	isSpinOpenPopup = function(e) {
		for (var t = 0; t < e.length; ++t)
			if (-1 != this._arrSpinOpenPopup.indexOf(e[t]))
				return true;
		return false
	}
	
	isCollectInboxFriendGiftToday = function() {
		// var e = r.default.instance().getUserFriendInfo();
		// return !(!TSUtility.isValid(e.sendGiftInfo) || !TSUtility.isValid(e.sendGiftInfo.receivedGiftCnt) || e.sendGiftInfo.receivedGiftCnt >= SDefine.INBOX_RECEIVED_GIFT_CNTLIMIT)
        return false;
	}
	
	isOverCerateSevenDay = function() {
		// var e = TSUtility.getServerBaseNowUnixTime()
		//   , t = r.default.instance().getCreateDate()
		//   , n = TSUtility.getUtcToPstTimeStamp(e)
		//   , o = TSUtility.getUtcToPstTimeStamp(t + 604800)
		//   , a = new Date(1e3 * n)
		//   , i = new Date(1e3 * o);
		// if (a.getUTCFullYear() == i.getUTCFullYear()) {
		// 	if (a.getUTCMonth() > i.getUTCMonth())
		// 		return true;
		// 	if (a.getUTCMonth() == i.getUTCMonth() && a.getUTCDate() > i.getUTCDate())
		// 		return true
		// } else if (a.getUTCFullYear() > i.getUTCFullYear())
		// 	return true;
		return false
	}
	
	isOverDay = function(e, t) {
		var n = TSUtility.getServerBaseNowUnixTime()
		  , o = TSUtility.getUtcToPstTimeStamp(n)
		  , a = TSUtility.getUtcToPstTimeStamp(e + 86400 * t)
		  , i = new Date(1e3 * o)
		  , r = new Date(1e3 * a);
		if (i.getUTCFullYear() == r.getUTCFullYear()) {
			if (i.getUTCMonth() > r.getUTCMonth())
				return true;
			if (i.getUTCMonth() == r.getUTCMonth() && i.getUTCDate() >= r.getUTCDate())
				return true
		} else if (i.getUTCFullYear() > r.getUTCFullYear())
			return true;
		return false
	}
	
	isOverHour = function(e, t) {
		var n = TSUtility.getServerBaseNowUnixTime()
		  , o = TSUtility.getUtcToPstTimeStamp(n)
		  , a = TSUtility.getUtcToPstTimeStamp(e + 3600 * t)
		  , i = new Date(1e3 * o)
		  , r = new Date(1e3 * a);
		return i.getUTCFullYear() > r.getUTCFullYear() || i.getUTCMonth() > r.getUTCMonth() || i.getUTCDate() > r.getUTCDate() || i.getUTCHours() > r.getUTCHours() || i.getUTCHours() == r.getUTCHours() && i.getUTCMinutes() >= r.getUTCMinutes()
	}
	
	setUserLevel = function(e) {
		// if (this._numUserLevel < e) {
		// 	this._numUserLevel = e;
		// 	var t = r.default.instance().getPromotionInfo(a.NewUserMissionPromotion.PromotionKeyName);
		// 	TSUtility.isValid(t) && MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.CHANGE_USERLEVEL)
		// }
	}
	
	getUserLevel = function() {
		return this._numUserLevel
	}
	
	setSneakPeekSlotID = function(e) {
		1 != this.isSneakPeekSlot(e) && this._arrSneakPeekSlotID.push(e)
	}
	
	isSneakPeekSlot = function(e) {
		return this._arrSneakPeekSlotID.includes(e)
	}
	
	setComingSoonSlotID = function(e) {
		1 != this.isComingSoonSlot(e) && this._arrComingSoonSlotID.push(e)
	}
	
	isComingSoonSlot = function(e) {
		return this._arrComingSoonSlotID.includes(e)
	}
	
	setUncheckedGiftBack = function(e) {
		1 != this.uncheckedGiftBack(e) && this._arrUnCheckedUID.push(e)
	}
	
	uncheckedGiftBack = function(e) {
		return this._arrUnCheckedUID.includes(e)
	}
	
	removeUncheckedGiftBack = function(e) {
		for (var t = this._arrUnCheckedUID.length - 1; 0 <= t; t--)
			this._arrUnCheckedUID[t] == e && this._arrUnCheckedUID.splice(t, 1)
	}
	
	checkHaveTopUp = function() {
		for (var e = 0; e < 5; e++) {
			var t = "";
			switch (e) {
			case 0:
				t = SDefine.ITEM_ATTENDANCE_DAILY_10;
				break;
			case 1:
				t = SDefine.ITEM_ATTENDANCE_DAILY_30;
				break;
			case 2:
				t = SDefine.ITEM_ATTENDANCE_DAILY_50;
				break;
			case 3:
				t = SDefine.ITEM_ATTENDANCE_DAILY_60;
				break;
			case 4:
				t = SDefine.ITEM_ATTENDANCE_DAILY_100
			}
			// for (var n = r.default.instance().getItemInventory().getItemsByItemId(t), o = 0; o < n.length; ++o)
			// 	if (TSUtility.isValid(n[o]) && 1 == c.ItemInfo.isValidDailyTopUpItem(n[o]))
			// 		return true
		}
		return false
	}
	
	isEpicWinOffer = function() {
		var e = ServerStorageManager.getAsNumber(StorageByOsKeyType.EPIC_WIN_TIME);
		if (e <= 0)
			return false;
		var t = TSUtility.getServerBaseNowUnixTime() - (e + 3600)
		  , n = ServerStorageManager.getAsNumberArray(StorageByOsKeyType.EPIC_WIN_OFFER_INDEX);
		return t <= 0 && n.length > 0
	}
	
	getEpicWinOfferRemainTime = function() {
		return ServerStorageManager.getAsNumber(StorageByOsKeyType.EPIC_WIN_TIME) + 3600 - TSUtility.getServerBaseNowUnixTime()
	}
	
	getLimitedTimeOfferRemainTime = function() {
		return ServerStorageManager.getAsNumber(StorageKeyType.SECRET_STASH_START_TIME) + 1800 - TSUtility.getServerBaseNowUnixTime()
	}
	
	isEnableLimitedTimeOffer = function() {
		// if (1 == this.isEpicWinOffer())
		// 	return false;
		// var e = r.default.instance().getUserServiceInfo().totalPurchaseCash
		//   , t = ServerStorageManager.getAsNumber(StorageKeyType.SECRET_STASH_START_TIME)
		//   , n = ServerStorageManager.getAsNumber(StorageKeyType.LAST_SECRET_STASH_TIME)
		//   , o = this.getLimitedTimeOfferRemainTime()
		//   , a = null != p.default.Instance().getSeasonalPromotionInfo() || this.isAbleNewbieShopPromotion();
		// return e > 0 && 0 == a && 0 == this.isAbleNewbieShopPromotion() && t > 0 && n < t && o > 0

        return false;
	}
	
	isRequireUpgrade = function() {
		// return Utility.getApplicationVersionCode(Utility.getApplicationVersion()) < ServiceInfoManager.NUMBER_REC_APP_VERSION
        return false;
	}
	
	isEnable1stBargain = function() {
		// return 0 == r.default.instance().getUserServiceInfo().totalPurchaseCash
        return false;
	}
	
	isEnable1stBargainSecond = function() {
		// var e = r.default.instance().getCreateDate();
		// return 0 == r.default.instance().getUserServiceInfo().totalPurchaseCash && TSUtility.getServerBaseNowUnixTime() - e > 14400 && TSUtility.getServerBaseNowUnixTime() - e <= 604800
        return false;
	}
	
	isEnable1stBargainThird = function() {
		// var e = r.default.instance().getCreateDate()
		//   , t = TSUtility.getServerBaseNowUnixTime();
		// return 0 == r.default.instance().getUserServiceInfo().totalPurchaseCash && t - e > 604800 && t - e <= 1209600
        return false;
	}
	
	isEnable1stBargainForth = function() {
		// var e = r.default.instance().getCreateDate()
		//   , t = TSUtility.getServerBaseNowUnixTime();
		// return 0 == r.default.instance().getUserServiceInfo().totalPurchaseCash && t - e > 1209600
        return false;
	}
	
	getRemainTimeJumpStarter = function() {
		var e = ServerStorageManager.getAsNumber(StorageKeyType.JUMP_STARTER_TIME);
		return 0 == e ? 0 : e + 1800 - TSUtility.getServerBaseNowUnixTime()
	}
	
	isNewbieAfterEndABTest = function() {
		// var e = r.default.instance().getCreateDate()
		//   , t = TSUtility.getPstToUtcTimestamp(Date.UTC(2025, 1, 1, 0, 0, 0) / 1e3);
		// return TSUtility.isLiveService() && (t = TSUtility.getPstToUtcTimestamp(Date.UTC(2025, 1, 20, 0, 0, 0) / 1e3)),
		// e >= t
        return false;
	}
	
	isAvailableJumpStarter = function() {
		// var e = this.getRemainTimeJumpStarter()
		//   , n = TSUtility.getUserABTestGroupNumNew(r.default.instance().getUid(), 2)
		//   , o = ServerStorageManager.getAsNumber(StorageKeyType.BOUGHT_1ST_BARGAIN)
		//   , a = ServerStorageManager.getAsNumber(StorageKeyType.JUMP_STARTER_BUY_COUNT)
		//   , i = 3 == o || 4 == o;
		// if (1 == this.isNewbieAfterEndABTest()) {
		// 	if (1 == i && e > 0 && 0 == SDefine.FB_Instant_iOS_Shop_Flag && a < ServiceInfoManager.NUMBER_JUMP_STARTER_MAX_COUNT)
		// 		return true
		// } else if (1 == n && e > 0 && 0 == SDefine.FB_Instant_iOS_Shop_Flag && a < ServiceInfoManager.NUMBER_JUMP_STARTER_MAX_COUNT)
		// 	return true;
		return false
	}
	
	isAvailableStepUpChance = function() {
		// var e = this.getRemainTimeJumpStarter()
		//   , n = TSUtility.getUserABTestGroupNumNew(r.default.instance().getUid(), 2)
		//   , o = ServerStorageManager.getAsNumber(StorageKeyType.BOUGHT_1ST_BARGAIN)
		//   , a = ServerStorageManager.getAsNumber(StorageKeyType.JUMP_STARTER_BUY_COUNT)
		//   , i = 1 == o || 2 == o;
		// if (1 == this.isNewbieAfterEndABTest()) {
		// 	if (1 == i && e > 0 && 0 == SDefine.FB_Instant_iOS_Shop_Flag && a < ServiceInfoManager.NUMBER_JUMP_STARTER_MAX_COUNT)
		// 		return true
		// } else if (0 == n && e > 0 && 0 == SDefine.FB_Instant_iOS_Shop_Flag && a < ServiceInfoManager.NUMBER_JUMP_STARTER_MAX_COUNT)
		// 	return true;
		return false
	}
	
	isJumpStarterThirdTestMember = function() {
		// var e = r.default.instance().getCreateDate()
		//   , t = TSUtility.getPstToUtcTimestamp(Date.UTC(2024, 2, 28, 0, 0, 0) / 1e3)
		//   , n = TSUtility.getPstToUtcTimestamp(Date.UTC(2024, 4, 1, 0, 0, 0) / 1e3);
		// TSUtility.isLiveService() && (n = TSUtility.getPstToUtcTimestamp(Date.UTC(2024, 4, 24, 0, 0, 0) / 1e3));
		// var o = TSUtility.getPstToUtcTimestamp(Date.UTC(2025, 1, 1, 0, 0, 0) / 1e3);
		// return TSUtility.isLiveService() && (o = TSUtility.getPstToUtcTimestamp(Date.UTC(2025, 1, 20, 0, 0, 0) / 1e3)),
		// !(e >= t && e <= n || e >= o)
        return false;
	}
	
	isAvailableJumpStarterFirstLobby = function() {
		var e = ServerStorageManager.getAsNumber(StorageKeyType.JUMP_STARTER_TIME);
		if (0 == e)
			return false;
		var n = ServerStorageManager.getAsNumber(StorageKeyType.JUMP_STARTER_BUY_COUNT);
		return !SDefine.FB_Instant_iOS_Shop_Flag && 1 == this.isOverDay(e, 1) && n < ServiceInfoManager.NUMBER_JUMP_STARTER_MAX_COUNT
	}
	
	// isEnableAllInOffer = function() {
	// 	return 1 != this.isEnable1stBargain() && !(r.default.instance().getUserServiceInfo().totalPurchaseCnt > 0 && this.isEnableLimitedTimeOffer()) && 1 != this.isEpicWinOffer() && 1 != SDefine.FB_Instant_iOS_Shop_Flag
	// }
	
	setIsIngAllInOffer = function(e) {
		var n = ServiceInfoManager.BOOL_ENABLE_ALL_IN_OFFER;
		ServiceInfoManager.BOOL_ENABLE_ALL_IN_OFFER = e,
		n && 0 == e && MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.ALL_IN_POPUP_END)
	}
	
	getAllInAdReward = function() {
		var e;
		//return r.default.instance().getModeBetDepth() < 0 ? (e = 20 * r.default.instance().getLastTotalBet()) < 4e6 ? e : 4e6 : (e = 20 * this._arrGlobalBetDepth[r.default.instance().getModeBetDepth()]) < 4e6 ? e : 4e6
        return null;
    }
	
	getGlobalBetDepth = function(e) {
		return e < 0 ? 0 : this._arrGlobalBetDepth.length <= e ? this._arrGlobalBetDepth[this._arrGlobalBetDepth.length - 1] : this._arrGlobalBetDepth[e]
	}
	
	addInterstitialADPlayCount = function() {
		// var e = 0;
		// Utility.isFacebookWeb() ? e = ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_PLAY_TIME_CANVAS) : Utility.isMobileGame() && cc.sys.os === cc.sys.OS_ANDROID ? e = ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_PLAY_TIME_AOS) : Utility.isMobileGame() && cc.sys.os === cc.sys.OS_IOS ? e = ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_PLAY_TIME_IOS) : Utility.isFacebookInstant() && (e = ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_PLAY_TIME_INSTANT)),
		// (e = TSUtility.getServerBasePstBaseTime(e)) < TSUtility.getServerBasePstBaseTime(TSUtility.getServerBaseNowUnixTime()) && (Utility.isFacebookWeb() ? (ServerStorageManager.save(StorageKeyType.INTERSTITIAL_AD_PLAY_COUNT_CANVAS, 0),
		// ServerStorageManager.saveCurrentServerTime(StorageKeyType.INTERSTITIAL_AD_PLAY_TIME_CANVAS)) : Utility.isMobileGame() && cc.sys.os === cc.sys.OS_ANDROID ? (ServerStorageManager.save(StorageKeyType.INTERSTITIAL_AD_PLAY_COUNT_AOS, 0),
		// ServerStorageManager.saveCurrentServerTime(StorageKeyType.INTERSTITIAL_AD_PLAY_TIME_AOS)) : Utility.isMobileGame() && cc.sys.os === cc.sys.OS_IOS ? (ServerStorageManager.save(StorageKeyType.INTERSTITIAL_AD_PLAY_COUNT_IOS, 0),
		// ServerStorageManager.saveCurrentServerTime(StorageKeyType.INTERSTITIAL_AD_PLAY_TIME_IOS)) : Utility.isFacebookInstant() && (ServerStorageManager.save(StorageKeyType.INTERSTITIAL_AD_PLAY_COUNT_INSTANT, 0),
		// ServerStorageManager.saveCurrentServerTime(StorageKeyType.INTERSTITIAL_AD_PLAY_TIME_INSTANT))),
		// Utility.isFacebookWeb() ? (ServerStorageManager.saveCurrentServerTime(StorageKeyType.INTERSTITIAL_AD_LAST_TIME_CANVAS),
		// ServerStorageManager.saveAfterAddCount(StorageKeyType.INTERSTITIAL_AD_PLAY_COUNT_CANVAS, 1)) : Utility.isMobileGame() && cc.sys.os === cc.sys.OS_ANDROID ? (ServerStorageManager.saveCurrentServerTime(StorageKeyType.INTERSTITIAL_AD_LAST_TIME_AOS),
		// ServerStorageManager.saveAfterAddCount(StorageKeyType.INTERSTITIAL_AD_PLAY_COUNT_AOS, 1)) : Utility.isMobileGame() && cc.sys.os === cc.sys.OS_IOS ? (ServerStorageManager.saveCurrentServerTime(StorageKeyType.INTERSTITIAL_AD_LAST_TIME_IOS),
		// ServerStorageManager.saveAfterAddCount(StorageKeyType.INTERSTITIAL_AD_PLAY_COUNT_IOS, 1)) : Utility.isFacebookInstant() && (ServerStorageManager.saveCurrentServerTime(StorageKeyType.INTERSTITIAL_AD_LAST_TIME_INSTANT),
		// ServerStorageManager.saveAfterAddCount(StorageKeyType.INTERSTITIAL_AD_PLAY_COUNT_INSTANT, 1))
	}
	
	setWheelJackpotAmount = function(e) {
		this._arrWheelJackpotAmount = [0, 0, 0];
		for (var t = 0; t < e.length; t++)
			this._arrWheelJackpotAmount[t] = e[t]
	}
	
	getWheelJackpotAmount = function() {
		return this._arrWheelJackpotAmount
	}
	
	contains = function(e, t) {
		for (var n = e.length; n--; )
			if (e[n] === t)
				return true;
		return false
	}
	
	isEnableInGameServiceIntroducePayTable = function() {
		// var e = r.default.instance().getPromotionInfo(f.NewServiceIntroduceCoinPromotion.PromotionKeyName);
		// return TSUtility.isValid(e) && 0 == e.getMainStepState(d.INTRODUCE_MAIN.PAY_TABLE_IN_GAME) && 1 == ServerStorageManager.getAsBoolean(StorageKeyType.FIRST_VISIT_SLOT)
        return false;
	}
	
	isEnableInGameServiceIntroduceBankRoll = function() {
		// if (1 == this.isEnableInGameServiceIntroducePayTable())
		// 	return false;
		// var e = r.default.instance().getPromotionInfo(f.NewServiceIntroduceCoinPromotion.PromotionKeyName);
		// return TSUtility.isValid(e) && 0 == e.getMainStepState(d.INTRODUCE_MAIN.BANKROLL_INGAME) && 1 == ServerStorageManager.getAsBoolean(StorageKeyType.FIRST_VISIT_SLOT)
        return false;
	}
	
	getShowADSFreePopup = function() {
		// return 0 != SDefine.Instance().isReadyRewardedAD() && (3 != t.NUMBER_ADS_FREE_POPUP_KIND && 4 != t.NUMBER_ADS_FREE_POPUP_KIND || 1 != SDefine.FB_Instant_iOS_Shop_Flag) && (1 != Utility.isFacebookInstant() || 1 != h.default.isTargetPlatform([h.default.PLATFORM_IOS, h.default.PLATFORM_ANDROID]) || 1 != this.isLobbyEnterUnder2NewbieTarget()) && t.BOOL_ENABLE_ADS_FREE_POPUP
        return false;
    }
	
	IsDualPriceTarget = function() {
		return Utility.isMobileGame() || Utility.isFacebookInstant() && cc.sys.os == cc.sys.OS_ANDROID
	}
	
	isSecretDealTarget = function() {
		// var e = r.default.instance().getUserServiceInfo().lastPurchaseDate
		//   , t = r.default.instance().getPurchaseInfo().lastPurchaseDateWithoutEx;
		// return !(r.default.instance().getUserServiceInfo().totalPurchaseCnt <= 0 || !(TSUtility.isValid(e) && this.dateDiff(e) > 0 && TSUtility.isValid(t) && t > 0 && this.dateDiff(t) > 3))
        return false;
	}
	
	isEnableSecretDeal = function() {
		// return !(r.default.instance().getUserInboxMainShopMessageCount() > 0) && 1 != SDefine.FB_Instant_iOS_Shop_Flag && 0 != this.isEnableStartSecretDeal() && (ServerStorageManager.getAsNumber(_.StorageByOsKeyType.SECRET_OPEN_TIME) + 43200 >= TSUtility.getServerBaseNowUnixTime() || 0 != this.isEnableStartSecretDeal() && !!(this.isSecretDealTarget() && this.dateDiff(ServerStorageManager.getAsNumber(_.StorageByOsKeyType.SECRET_OPEN_TIME)) >= 3) && (ServerStorageManager.save(_.StorageByOsKeyType.SECRET_INDEX, i.default.Instance().getSecretDealIndex()),
		// ServerStorageManager.save(_.StorageByOsKeyType.SECRET_PRICES, i.default.Instance().getSecretDealPrices()),
		// ServerStorageManager.saveCurrentServerTime(_.StorageByOsKeyType.SECRET_OPEN_TIME),
		// true))
        return false;
	}
	
	isEnableStartSecretDeal = function() {
		// if (null != p.default.Instance().getSeasonalPromotionInfo() || 1 == this.isAbleNewbieShopPromotion())
		// 	return false;
		// var e = r.default.instance().getPromotionInfo(a.DobuleUpPromotion.PromotionKeyName);
		// if (TSUtility.isValid(e) && 1 == e.endTime > TSUtility.getServerBaseNowUnixTime())
		// 	return false;
		// var t = r.default.instance().getPromotionInfo(a.StampCardPromotion.PromotionKeyName);
		// if (TSUtility.isValid(t) && t.endTime > TSUtility.getServerBaseNowUnixTime())
		// 	return false;
		// var n = p.default.Instance().getReadyPromotionStartDate() - 46800;
		// return !(p.default.Instance().getReadyPromotionStartDate() > 0 && n <= TSUtility.getServerBaseNowUnixTime())
        return false;
	}
	
	dateDiff = function(e) {
		var t = TSUtility.getServerBasePstBaseTime(TSUtility.getServerBaseNowUnixTime())
		  , n = TSUtility.getServerBasePstBaseTime(e)
		  , o = Math.abs(t - n);
		return Math.ceil(o / 86400)
	}
	
	haveOverFiveCard = function() {
		// for (var e = r.default.instance().getUserStarAlbumSimpleInfo(), t = 0; t < e.incompleteSets.length; t++)
		// 	if (e.incompleteSets[t].collectedCardsCnt >= 5)
		// 		return true;
		return false
	}
	
	isSeasonEndTerm = function() {
		// var e = m.default.instance().getCurrentSeasonInfo();
		// if (!TSUtility.isValid(e))
		// 	return false;
		// var t = TSUtility.getServerBaseNowUnixTime()
		//   , n = Math.max(0, e.numEndDate - t);
		// return 1 == Math.ceil(n / 86400) <= 14 && e.numEndDate > TSUtility.getServerBaseNowUnixTime()
        return false;
	}
	
	isSeasonEndNoticeTerm = function() {
		// var e = m.default.instance().getCurrentSeasonInfo();
		// return !TSUtility.isValid(e) && 1 == this.dateDiff(e.numEndDate) <= 10 && e.numEndDate > TSUtility.getServerBaseNowUnixTime()
        return false;
	}
	
	isInboxItemBingoResetShow = function() {
		// var e = t.INFO_BINGO;
		// if (!TSUtility.isValid(e))
		// 	return false;
		// var n = 1 == e.boards[0].state || 1 == e.boards[1].state
		//   , o = (null != e ? e.nextResetTime : 0) - TSUtility.getServerBaseNowUnixTime();
		// return 1 == n && o >= 0 && o <= 86400
        return false
	}
	
	isLobbyEnterUnder2NewbieTarget = function() {
		return ServiceInfoManager.BOOL_NEWBIE && ServiceInfoManager.NUMBER_LOOBY_ENTER_COUNT < 2
	}
	
	isAvailableSproutDeal = function(e) {
		// if (null != p.default.Instance().getSeasonalPromotionInfo_PopupType() || null != p.default.Instance().getSeasonalPromotionInfo_ShopType())
		// 	return false;
		// var t = r.default.instance().getPurchaseInfo().avgIn30Days2
		//   , n = i.default.Instance().getMainShopSproutAvgProduct_2023(t);
		// return !(e >= i.default.Instance().getHighestPrice()) && (0 == t || n <= e)
        return false;
	}
	
	isAvailableBigStackDeal = function(e) {
		// return null == p.default.Instance().getSeasonalPromotionInfo_PopupType() && null == p.default.Instance().getSeasonalPromotionInfo_ShopType() && !(i.default.Instance().getHighestPrice() > e)
        return false;
    }
	
	getHightestPrice = function() {
		return SDefine.Mobile_iOS_PurchaseLimit_Flag ? 99.99 : 399.99
	}
	
	// getReelQuestNormalSeasonID = function() {
	// 	var e = new ReelQuestStorageInfo;
	// 	return e.SetData(ServerStorageManager.getAsJson(StorageKeyType.REEL_QUEST_NORMAL)),
	// 	e.seasonID
	// }
	
	// getReelQuestNormalSlotID = function() {
	// 	var e = new ReelQuestStorageInfo;
	// 	return e.SetData(ServerStorageManager.getAsJson(StorageKeyType.REEL_QUEST_NORMAL)),
	// 	e.slotID
	// }
	
	// getReelQuestStorageInfo = function(e) {
	// 	var t = new ReelQuestStorageInfo;
	// 	return t.SetData(ServerStorageManager.getAsJson(StorageKeyType.REEL_QUEST)),
	// 	t.seasonID != e && (t.seasonID = e,
	// 	t.showTutorial = false),
	// 	t
	// }
	
	getHeroRandomIndex = function() {
		return ServiceInfoManager.NUMBER_HERO_RANDOM < 0 && (ServiceInfoManager.NUMBER_HERO_RANDOM = Math.floor(14 * Math.random())),
		ServiceInfoManager.NUMBER_HERO_RANDOM
	}
	
	isShowFanPageOverlayIntroducePopup = function(e) {
		if (void 0 === e && (e = false),
		!Utility.isFacebookInstant())
			return false;
		var t = ServerStorageManager.getAsNumber(StorageKeyType.FAN_PAGE_OVERLAY_INTRODUCE_POPUP_TIME);
		return 1 == e ? 0 == t : 0 == t || TSUtility.getServerBaseNowUnixTime() - t > 1209600
	}
	
	// isAvailableHeroBuffInfo = function() {
	// 	var e = r.default.instance().getPromotionInfo(a.HeroBuffPromotion.PromotionKeyName);
	// 	return TSUtility.isValid(e) && 1 == e.isAvailableHeroBuff()
	// }
	
	// isAvailableEndTripleWheelJackpotPromotion = function() {
	// 	var e = r.default.instance().getPromotionInfo(a.TripleDiamondWheelClosePromotion.PromotionKeyName);
	// 	return TSUtility.isValid(e) && 1 == e.isAvailableTripleDiamondWheelClosePromotion()
	// }
	
	// isAvailableGetGoldTicket = function() {
	// 	var e = r.default.instance().getPromotionInfo(a.TripleDiamondWheelClosePromotion.PromotionKeyName);
	// 	return TSUtility.isValid(e) || e.isAvailableGetGoldTicket()
	// }
	
	// isAvailableGetDiamondTicket = function() {
	// 	var e = r.default.instance().getPromotionInfo(a.TripleDiamondWheelClosePromotion.PromotionKeyName);
	// 	return TSUtility.isValid(e) || e.isAvailableGetDiamondTicket()
	// }
	
	isEnableDiamondJackpot = function(e) {
		return e != SDefine.HIGHROLLER_ZONEID && e != SDefine.VIP_LOUNGE_ZONEID
	}
	
	addPlayDiceGameCount = function() {
		Utility.isMobileGame() && (ServiceInfoManager.NUMBER_PLAY_DICE_GAME_COUNT >= 4 && (ServiceInfoManager.NUMBER_PLAY_DICE_GAME_COUNT = 0),
		ServiceInfoManager.NUMBER_PLAY_DICE_GAME_COUNT++)
	}
	
	// getNewbieSaleEndDate = function() {
	// 	var e = ServerStorageManager.getAsNumber(StorageKeyType.TIME_NEWBIE_SHOP_SALE_END_TIME);
	// 	return 0 != e ? e : r.default.instance().getCreateDate() + 864e3
	// }
	
	isAbleNewbieShopPromotion = function() {
		// if (0 == r.default.instance().isCPEUser())
		// 	return false;
		// var e = TSUtility.getServerBaseNowUnixTime() - r.default.instance().getCreateDate() < 864e3;
		// return (!ServerStorageManager.getAsBoolean(StorageKeyType.IS_START_NEWBIE_SHOP_SALE) || 0 != e) && 1 != y.default.instance.isHaveFirstBuyCouponByInbox() && 1 != this.getNewbieSaleEndDate() - TSUtility.getServerBaseNowUnixTime() < 1 && 1 != p.default.Instance().isCurrentPromotion("2025-thanksgiving") && (0 == ServerStorageManager.getAsNumber(StorageKeyType.TIME_NEWBIE_SHOP_SALE_END_TIME) && (ServerStorageManager.save(StorageKeyType.IS_START_NEWBIE_SHOP_SALE, true),
		// ServerStorageManager.saveCurrentServerTime(StorageKeyType.TIME_NEWBIE_SHOP_SALE_START_TIME),
		// ServerStorageManager.save(StorageKeyType.TIME_NEWBIE_SHOP_SALE_END_TIME, TSUtility.getServerBaseNowUnixTime() + 345600 + 86400 - TSUtility.getServerBaseNowUnixTime() % 86400)),
		// true)
        return false;
	}
	
	hasAnyCouponInbox = function() {
		// for (var e = r.default.instance().getUserInboxCouponInfo(), t = 0; t < e.length; ++t) {
		// 	var n = e[t];
		// 	if ((n.message.mType == INBOX_ITEM_TYPE.INBOX_COUPON_RENEWAL_2002 || n.message.mType == INBOX_ITEM_TYPE.INBOX_COUPON_WELCOME_BACK) && n.message.expireDate > 0)
		// 		return true
		// }
		// return 1 == y.default.instance.isRunningFirstBuyCouponProcess()
        return false;
	}
	
	inboxCountExcept = function(e) {
		for (var t = e.length - 1; t >= 0; --t)
			e[t].message.mType != INBOX_ITEM_TYPE.LEAGUE_REWARD_DAILYBONUS && e[t].message.mType != INBOX_ITEM_TYPE.SAQUADS_REWARD && e[t].message.mType != INBOX_ITEM_TYPE.INBOX_COUPON_RENEWAL_2002 && e[t].message.mType != INBOX_ITEM_TYPE.INBOX_COUPON_FIRST_BUY && e[t].message.mType != INBOX_ITEM_TYPE.INBOX_COUPON_WELCOME_BACK && e[t].message.mType != INBOX_ITEM_TYPE.INBOX_FAILED_TO_WIN_SUITELEAGUE || e.splice(t, 1)
	}
	
	getSecretStashHighestMul = function() {
		// return 100 * i.default.Instance().getSecretStashOfferInfo()[2].getMoreCoinsMultiplier()
        return true;
	}
	
	setBingoPopupOpen = function(e) {
		ServiceInfoManager.BOOL_BINGO_POPUP_OPEN = e
	}

	getBingoPopupOpen = function() {
		return ServiceInfoManager.BOOL_BINGO_POPUP_OPEN
	}

	static INFO_BINGO = null
	static INFO_REVAMP_SLOT = null
	static NODE_IN_GAME_BANKROLL = null
	static NODE_IN_GAME_PROFILE = null
	static STRING_TEST_SLOT_SCENE_NAME = ""
	static STRING_REVAMP_SLOT_ID = ""
	static STRING_STORE_OPEN_URL = ""
	static STRING_CURRENT_INTRODUCE_NAME = ""
	static STRING_SLOT_ENTER_LOCATION = ""
	static STRING_SLOT_ENTER_FLAG = ""
	static STRING_SNEAK_PEEK_GAME_ID = ""
	static STRING_PREV_SLOT_ID = ""
	static STRING_LAST_LOBBY_SLOT_GAME_ID = ""
	static STRING_LAST_LOBBY_NAME = ""
	static STRING_SWITCH_TO_HIGH_SLOT_ID = ""
	static STRING_MOVE_SLOT_INFO = ""
	static NUMBER_CURRENT_APP_VERSION = 0
	static NUMBER_REC_APP_VERSION = 0
	static NUMBER_SHOP_PROMOTION_OPEN_TIME = 0
	static NUMBER_OFFER_PROMOTION_OPEN_TIME = 0
	static NUMBER_FIRST_BARGAIN_OPEN_TIME = 0
	static NUMBER_EPIC_WIN_OFFER_OPEN_TIME = 0
	static NUMBER_RECORD_BREAKER_OPEN_TIME = 0
	static NUMBER_LIMITED_OPEN_TIME = 0
	static NUMBER_BIG_WIN_OVER_COUNT = 0
	static NUMBER_NEW_FRIENDS_REWARD_COUNT = 0
	static NUMBER_FAN_PAGE_POPUP_OPEN_TIME = 0
	static NUMBER_LINKED_FAN_PAGE_OPEN_TIME = 0
	static NUMBER_SPIN_COUNT = 0
	static NUMBER_BET_SPIN_COUNT = 0
	static NUMBER_NEW_USER_MISSION_REWARD = 0
	static NUMBER_ALL_IN_CARE_MONEY = 0
	static NUMBER_CURRENT_GAUGE_EXP = 0
	static NUMBER_MISSION_DESC_TOOLTIP_OPEN_TIME = 0
	static NUMBER_LOOBY_ENTER_COUNT = 0
	static NUMBER_SUITE_ENTER_COUNT = 0
	static NUMBER_SLOT_ENTER_COUNT = 0
	static NUMBER_SPROUT_DEAL_BUY_COUNT = 0
	static NUMBER_BIG_STACK_BUY_COUNT = 0
	static NUMBER_TEMP_UID = 0
	static NUMBER_STAMP_CARD_PREV_SAVED_COIN = 0
	static NUMBER_NEWBIE_SHOP_PROMOTION_OPEN_TIME = 0
	static NUMBER_ACCOUNT_STATUS = 0
	static NUMBER_ACCOUNT_DELETE_DATE = 0
	static NUMBER_COMPLETE_TOOLTIP_MISSION_ID = 0
	static NUMBER_PLAY_DICE_GAME_COUNT = 0
	static NUMBER_LAST_LOBBY_SCROLL_OFFSET = 0
	static NUMBER_TRIPLE_DIAMOND_MIN_BET = 27e6
	static NUMBER_THRILL_JACKPOT_GOLD_MIN_BET = 27e5
	static NUMBER_THRILL_JACKPOT_DIAMOND_MIN_BET = 108e6
	static NUMBER_LIMITED_TIME_OFFER_INDEX = -1
	static NUMBER_SECRET_STASH_INDEX = -1
	static NUMBER_HERO_RANDOM = -1
	static NUMBER_ADS_FREE_POPUP_KIND = 1
	static NUMBER_JUMP_STARTER_MAX_COUNT = 3
	static NUMBER_SPIN_2_WIN_TICKET_COUNT = 0
	static NUMBER_ENTRY_SLOT_BETTING_INDEX = -1
	static NUMBER_START_MEMBERS_LEVEL = -1
	static BOOL_EPIC_WIN_OFFER_TARGET = false
	static BOOL_GUEST_MERGE = false
	static BOOL_SHOP_OPEN = false
	static BOOL_ENABLE_INBOX_OFFER = false
	static BOOL_OPENED_RATE_US_POPUP = false
	static BOOL_TIME_BONUS_DELAY = false
	static BOOL_TUTORIAL_COME_IN = false
	static BOOL_ALL_IN = false
	static BOOL_OPENING_LOBBY_POPUP = false
	static BOOL_FROM_OPENING_POPUP = false
	static BOOL_BREAK_OPENING_POPUP = false
	static BOOL_OVER_SLOT_COUNT = false
	static BOOL_PLUS_BONUS = false
	static BOOL_PLAYING_JACKPOT_WHEEL = false
	static BOOL_RECEIVED_FAN_PAGE_REWARD = false
	static BOOL_PLAYING_INSTANT_SHORTCUT = false
	static BOOL_SHOWED_LOBBY_SHORTCUT = false
	static BOOL_ENABLE_VIP_STATUS_POPUP = false
	static BOOL_FROM_PROFILE_INTRODUCE = false
	static BOOL_NEW_USER_MISSION_COMPLETE = false
	static BOOL_ENABLE_EXP_BOOST_TOOLTIP = false
	static BOOL_CHANGE_LEVEL = false
	static BOOL_BINGO_POPUP_OPEN = false
	static BOOL_LASTSLOT_REVAMP_SLOT = false
	static BOOL_START_FIX_MINI_GAME_INFO = false
	static BOOL_POWER_UP_HERO = false
	static BOOL_RESERVE_UNLOCK_UI = false
	static BOOL_ENABLE_ADS_FREE_POPUP = false
	static BOOL_RESERVE_SUNNY_BUNNY_TOOLTIP = false
	static BOOL_NEWBIE = false
	static BOOL_ENABLE_PIGGY_UP_TO_MORE = false
	static BOOL_ENABLE_PIGGY_FASTER = false
	static BOOL_ENABLE_MISSION_TOOLTIP = false
	static BOOL_RESERVE_RESET_EFFECT = false
	static BOOL_ENABLE_FIRST_DEAL_POPUP = false
	static BOOL_LAST_LOBBY_SLOT_TOURNEY = false
	static BOOL_ENABLE_ALL_IN_OFFER = false
	static BOOL_LASTSLOT_SUPERSIZE_POPUP = false
	static BOOL_SUPERSIZE_TICKET_CLAIM = false
	static BOOL_IS_ENTERING_SLOT_TOURNEY = false
	static BOOL_IS_OPEN_NEW_SEASON_HYPER_BOUNTY = false
	static BOOL_IS_OPENING_LEVEL_UP_UI = false
	static BOOL_IS_OPENING_HYPER_BOUNTY_UI = false
	static BOOL_IS_CLUB_KEY_EARN_POPUP = false
	static ARRAY_SHUFFLE_HOT_SLOT = []
}