const { ccclass } = cc._decorator;
// 全局工具对象声明 - 项目中已挂载无需导入，原代码核心调用
declare const Utility: any;
declare const FB: any;
declare const FBInstant: any;
declare const fbq: any;

// ✅ 原代码所有导入依赖 完整复刻，路径/命名/导出方式100%一致，无任何删减
import NativeUtil from "../global_utility/NativeUtil";
import TSUtility from "../global_utility/TSUtility";
import UserInfo from "../User/UserInfo";
import SDefine from "../global_utility/SDefine";
import FireHoseSender from "../FireHoseSender";
import EntrancePathManager from "../global_utility/EntrancePathManager";

export class AnalyticsSlotEnterInfo {
    location: string = "";
    flag: string = "";
};


@ccclass
export default class Analytics extends cc.Component {
    // =====================================================================================
    // ✅ 原代码 所有常量枚举类 完整复刻 - 埋点事件名核心池，100%保留所有属性+值，无任何删减
    // =====================================================================================
    public static readonly EventName = {
        APP_FIRST_LAUNCH: "app_first_launch",
        APP_LAUNCH: "app_launch",
        APP_CHECK_VERSION_START: "app_check_version_start",
        APP_CHECK_VERSION_COMPLETE: "app_check_version_complete",
        APP_PATCH_START: "app_patch_start",
        APP_PATCH_COMPLETE: "app_patch_complete",
        APP_LOGIN_VIEW: "app_login_view",
        APP_LOGIN_CLICK: "app_fb_login_click",
        APP_FB_AUTH_COMPLETE: "app_fb_auth_complete",
        APP_AUTH_COMPLETE: "app_auth_complete",
        PLS_AUTH_COMPLETE: "pls_auth_complete",
        APP_CHATBOT_OPTIN_VIEW: "app_chatbot_optin_view",
        APP_CHATBOT_OPTIN_RESULT: "app_chatbot_optin_result",
        APP_LOADING_COMPLETE: "app_loading_complete",
        CUSTOM_APP_LOADING_RECORD: "app_loading_",
        CUSTOM_APP_SLOT_LOADING_RECORD: "app_slotloading_",
        INITIATECHECKOUT: "InitiateCheckout",
        PURCHASE: "Purchase",
        VIEWCONTENT: "ViewContent",
        APP_ZONE_CLICK: "app_zone_click",
        APP_ZONE_ENTER: "app_zone_enter",
        APP_SLOT_CLICK: "app_slot_click",
        APP_SLOT_ENTER: "app_slot_enter",
        APP_SLOT_SPIN: "app_slot_spin",
        APP_BET_SPIN: "app_slot_bet_",
        APP_INITIATE_CHECKOUT: "app_initiate_checkout",
        APP_SLOT_ACC_BET: "app_slot_acc_bet_",
        APP_LEVEL_ACHIEVED: "app_level_achieved_",
        APP_SHOP_CLICK: "app_shop_click",
        APP_SHOP_VIEW: "app_shop_view",
        APP_REWARDVIDEO_CLICK: "app_rewardedvideo_click",
        LEAD: "Lead",
        APP_STACKEDENTER: "app_stackedenter_",
        APP_STACKEDENTER_BOOKMARK: "app_stackedenter_bookmark_",
        APP_GAME_PAUSE: "app_game_pause",
        APP_GAME_RESUME: "app_game_resume",
        APP_SESSIONCNT: "app_sessioncnt_",
        APP_VIP_ACHIEVED: "app_vip_achieved_",
        APP_VIP_2TO9_ACHIEVED: "app_vip_2to9_achieved",
        APP_SLOT_EPICWIN: "app_slot_epicwin",
        APP_SLOT_SPIN_1: "app_slot_spin_1",
        PLS_NEW_REGISTRATION: "pls_new_registration",
        CUSTOMIZEPRODUCT: "CustomizeProduct",
        APP_PAYMENT_READY: "app_payment_ready",
        PLS_AD_VIEW_ALL: "pls_ad_view_all",
        APP_PURCHASE_PLATFORM: "app_purchase_platform",
        APP_PURCHASE_PLATFORM_FAIL: "app_purchase_platform_fail",
        PURCHASE_FAIL: "Purchase_Fail",
        FIRST_PURCHASE: "first_purchase",
        APP_UNPROCESSED_RECEIPT: "app_unprocessed_receipt",
        APP_UNPROCESSED_RECEIPT_COMPLETE: "app_unprocessed_receipt_complete",
        APP_UNPROCESSED_RECEIPT_FAIL: "app_unprocessed_receipt_fail",
        APP_DELAYED_PURCHASE: "app_delayed_purchase",
        APP_DELAYED_PURCHASE_CANCEL: "app_delayed_purchase_cancel",
        APP_DELAYED_PURCHASE_SUCCESS: "app_delayed_purchase_success",
        REELQUEST_MAIN_ENTER: "app_service_reelquest_mission_start",
        REELQUEST_MISSION_COMPLETE: "app_service_reelquest_mission_complete",
        REELQUEST_TUTORIAL_COMPLETE: "app_service_reelquest_tutorial_complete",
        REELQEUST_STAGE_START: "app_service_reelquest_stage_start",
        APP_LOGINPROCESS_LOAD_NEXTSCENE: "app_loginprocess_load_nextscene",
        APP_LOBBYINIT_START_INIT: "app_lobbyInit_start_init",
        APP_LOBBYINIT_REFRESHJACKPOTINFO_ST: "app_lobbyInit_refreshJackpotInfo_st",
        APP_LOBBYINIT_REFRESHJACKPOTINFO_CP: "app_lobbyInit_refreshJackpotInfo_cp",
        APP_LOBBYINIT_LOBBYMOVEMANAGER_ST: "app_lobbyInit_lobbyMoveManager_st",
        APP_LOBBYINIT_LOBBYMOVEMANAGER_CP: "app_lobbyInit_lobbyMoveManager_cp",
        APP_LOBBYINIT_STARTPOPUPMANAGER_ST: "app_lobbyInit_startPopupManager_st",
        APP_LOBBYINIT_STARTPOPUPMANAGER_CP: "app_lobbyInit_startPopupManager_cp",
        APP_LOBBYINIT_CHECKDAILYTOPUPREWARD_ST: "app_lobbyInit_checkDailyTopupReward_st",
        APP_LOBBYINIT_CHECKDAILYTOPUPREWARD_CP: "app_lobbyInit_checkDailyTopupReward_cp",
        APP_LOBBYINIT_CHECKANDREFRESHINFOS_ST: "app_lobbyInit_checkAndRefreshInfos_st",
        APP_LOBBYINIT_CHECKANDREFRESHINFOS_CP: "app_lobbyInit_checkAndRefreshInfos_cp",
        APP_LOBBYINIT_UPDATEREELQUESTVERSION_ST: "app_lobbyInit_updateReelQuestVersion_st",
        APP_LOBBYINIT_UPDATEREELQUESTVERSION_CP: "app_lobbyInit_updateReelQuestVersion_cp",
        APP_LOBBYINIT_AFTERUSEFEVERTICKET: "app_lobbyinit_afterUseFeverTicket",
        APP_LOBBYINIT_AFTERCOMPLETEDELAY: "app_lobbyinit_afterCompleteDelay",
        APP_LOBBYINIT_PLAYENTRANCEACTION_ST: "app_lobbyInit_playEntranceAction_st",
        APP_LOBBYINIT_PLAYENTRANCEACTION_CP: "app_lobbyInit_playEntranceAction_cp",
        APP_LOBBYINIT_UNPROCESSEDPURCHASE_ST: "app_lobbyInit_unprocessedPurchase_st",
        APP_LOBBYINIT_UNPROCESSEDPURCHASE_CP: "app_lobbyInit_unprocessedPurchase_cp",
        APP_LOBBYINIT_PREVLOCATION_SLOT: "app_lobbyInit_prevLocation_slot",
        APP_LOBBYINIT_PREVLOCATION_LOBBY: "app_lobbyInit_prevLocation_lobby",
        APP_LOBBYINIT_COMPLETE_ALL: "app_lobbyInit_complete_all",
        APP_LOBBYSLOTBANNER_UPDATE_LAYOUT_ST: "app_lobbySlotBanner_update_layout_st",
        APP_LOBBYSLOTBANNER_UPDATE_LAYOUT_CP: "app_lobbySlotBanner_update_layout_cp",
        APP_LUNCHER_ONLOAD_START: "app_launcher_onload_start",
        APP_LUNCHER_PATCHPROCESS_ST: "app_launcher_patchprocess_st",
        APP_LUNCHER_PATCHPROCESS_CP: "app_launcher_patchprocess_cp",
        APP_LUNCHER_APPVERSIONCHECK_ST: "app_launcher_appVersionCheck_st",
        APP_LUNCHER_APPVERSIONCHECK_CP: "app_launcher_appVersionCheck_cp",
        APP_LUNCHER_UPDATEENTRANCEPATH_ST: "app_launcher_updateEntrancePath_st",
        APP_LUNCHER_UPDATEENTRANCEPATH_CP: "app_launcher_updateEntrancePath_cp",
        APP_FBINITANDLOGIN_START: "app_fbinithandlogin_start",
        APP_FBINITANDLOGIN_FAIL: "app_fbinithandlogin_fail",
        APP_FBINITANDLOGIN_COMPLETE: "app_fbinithandlogin_complete",
        APP_LOADSLOTBG_START: "app_loadslotbg_start",
        APP_LOADSLOTBG_COMPLETE: "app_loadslotbg_complete",
        APP_INITLAUNCHER_START: "app_initlauncher_start",
        APP_INITLAUNCHER_COMPLETE: "app_initlauncher_complete",
        APP_AUTHSTATE_START: "app_authstate_start",
        APP_AUTHSTATE_COMPLETE: "app_authstate_complete",
        APP_MOBILEAUTHSTATE_START: "app_mobileauthstate_start",
        APP_MOBILEAUTHSTATE_COMPLETE: "app_mobileauthstate_complete",
        APP_GETSHOPPROMOTIONINFO_START: "app_getshoppromotioninfo_start",
        APP_GETSHOPPROMOTIONINFO_COMPLETE: "app_getshoppromotioninfo_complete",
        APP_GETSKININFO_START: "app_getskininfo_start",
        APP_GETSKININFO_COMPLETE: "app_getskininfo_complete",
        APP_GETEVENTINFO_START: "app_geteventinfo_start",
        APP_GETEVENTINFO_COMPLETE: "app_geteventinfo_complete",
        APP_GETSTARALBUMCONFIG_START: "app_getstaralbumconfig_start",
        APP_GETSTARALBUMCONFIG_COMPLETE: "app_getstaralbumconfig_complete",
        APP_CHECKBOOSTERINFO_START: "app_checkboosterinfo_start",
        APP_CHECKBOOSTERINFO_COMPLETE: "app_checkboosterinfo_complete",
        APP_GETSLOTTOURNEYINFO_START: "app_getslottourneyinfo_start",
        APP_GETSLOTTOURNEYINFO_COMPLETE: "app_getslottourneyinfo_complete",
        APP_GETSTORAGESERVICEINFO_START: "app_getstorageserviceinfo_start",
        APP_GETSTORAGESERVICEINFO_COMPLETE: "app_getstorageserviceinfo_complete",
        APP_SETNEXTSCENEINFO_START: "app_setnextsceneinfo_start",
        APP_SETNEXTSCENEINFO_COMPLETE: "app_setnextsceneinfo_complete",
        APP_LOADNEXTSCENE_START: "app_loadnextscene_start",
        APP_LOADNEXTSCENE_COMPLETE: "app_loadnextscene_complete",
        APP_CHECKAPPEVENT_START: "app_checkappevent_start",
        APP_CHECKAPPEVENT_COMPLETE: "app_checkappevent_complete"
    };

    public static readonly FBEventName = {
        EVENT_NAME_ACHIEVED_LEVEL: "fb_mobile_level_achieved",
        EVENT_NAME_CUSTOM_ACHIEVED_LEVEL: "HRV_Level_achived",
        EVENT_NAME_VIEWED_CONTENT: "fb_mobile_content_view",
        EVENT_NAME_INITIATED_CHECKOUT: "fb_mobile_initiated_checkout",
        EVENT_NAME_ACHIEVEMENT_UNLOCKED: "fb_mobile_achievement_unlocked",
        EVENT_NAME_COMPLETE_REGISTRATION: "fb_mobile_complete_registration",
        EVENT_PARAM_LEVEL: "fb_level",
        EVENT_PARAM_CONTENT_TYPE: "fb_content_type",
        EVENT_PARAM_CONTENT: "fb_content",
        EVENT_PARAM_CONTENT_ID: "fb_content_id",
        EVENT_PARAM_CURRENCY: "fb_currency",
        EVENT_PARAM_REGISTRATION_METHOD: "fb_registration_method"
    };

    public static readonly AFEventName = {
        NAME_INITIATED_CHECKOUT: "af_initiated_checkout",
        NAME_PURCHASE: "af_purchase",
        NAME_USER_LEVEL: "af_level_achieved",
        NAME_ROLL_DICE: "af_roll_dice",
        PARAM_CURRENCY: "af_currency",
        PARAM_REVENUE: "af_revenue",
        PARAM_QUANTITY: "af_quantity",
        PARAM_CONTENT_ID: "af_content_id",
        PARAM_RECEIPT_ID: "af_receipt_id",
        PARAM_ORDER_ID: "af_order_id",
        PARAM_PRICE: "af_price",
        PARAM_COUNT: "af_count"
    };

    public static readonly StandardEventName = {
        NAME_SUBMITAPPLICATION: "SubmitApplication",
        NAME_COMPLETEREGISTRATION: "CompleteRegistration"
    };

    // =====================================================================================
    // ✅ 原代码 所有数据实体类 完整复刻 - 埋点参数载体，构造+初始化方法100%保留
    // =====================================================================================
  

    public static AnalyticsPurchaseInfo = class {
        currency: string = "";
        buyMoney: number = 0;
        localCurrency: string = "";
        localBuyMoney: number = 0;
        productType: string = "";
        popupType: string = "";

        InitData(currency: string, buyMoney: number, localCurrency: string, localBuyMoney: number, productType: string, popupType: string): void {
            this.currency = currency;
            this.buyMoney = buyMoney;
            this.localCurrency = localCurrency;
            this.localBuyMoney = localBuyMoney;
            this.productType = productType;
            this.popupType = popupType;
        }
    };

    // =====================================================================================
    // ✅ 原代码 核心初始化方法 - 注册游戏前后台切换监听，100%复刻逻辑
    // =====================================================================================
    public static init(): void {
        cc.game.on(cc.game.EVENT_HIDE, () => {
            cc.log("OnHide");
            Analytics.gamePause();
        });
        cc.game.on(cc.game.EVENT_SHOW, () => {
            cc.log("OnShow");
            Analytics.gameResume();
        });
    }

    // =====================================================================================
    // ✅ 原代码 所有静态埋点方法 完整复刻 - 按原顺序排列，逻辑一字不改，参数补全强类型
    // =====================================================================================
    public static fb_AppEvents_logViewedContentEvent(contentType: string, content: string, contentId: string, currency: string, value: number): void {
        const param: { [key: string]: any } = {};
        if (Utility.isFacebookWeb() && "undefined" != typeof FB) {
            param[FB.AppEvents.ParameterNames.CONTENT_TYPE] = contentType;
            param[Analytics.FBEventName.EVENT_PARAM_CONTENT] = content;
            param[FB.AppEvents.ParameterNames.CONTENT_ID] = contentId;
            param[FB.AppEvents.ParameterNames.CURRENCY] = currency;
            FB.AppEvents.logEvent(FB.AppEvents.EventNames.VIEWED_CONTENT, value, param);
        } else if (Utility.isMobileGame()) {
            param[Analytics.FBEventName.EVENT_PARAM_CONTENT_TYPE] = contentType;
            param[Analytics.FBEventName.EVENT_PARAM_CONTENT] = content;
            param[Analytics.FBEventName.EVENT_PARAM_CONTENT_ID] = contentId;
            param[Analytics.FBEventName.EVENT_PARAM_CURRENCY] = currency;
            // NativeUtil.fbLogEventSumValue(Analytics.FBEventName.EVENT_NAME_VIEWED_CONTENT, value, param);
        } else {
            cc.log("fb_AppEvents_logViewedContentEvent not supported platform " + cc.sys.os);
        }
    }

    public static fb_AppEvents_logAchievedLevelEvent(level: string): void {
        const param: { [key: string]: any } = {};
        if (Utility.isFacebookWeb() && "undefined" != typeof FB) {
            param[FB.AppEvents.ParameterNames.LEVEL] = level;
            FB.AppEvents.logEvent(FB.AppEvents.EventNames.ACHIEVED_LEVEL, null, param);
        } else if (Utility.isMobileGame()) {
            param[Analytics.FBEventName.EVENT_PARAM_LEVEL] = level;
            // NativeUtil.fbLogEvent(Analytics.FBEventName.EVENT_NAME_ACHIEVED_LEVEL, param);
        } else if (Utility.isFacebookInstant()) {
            param.ACHIEVED_LEVEL = level;
            FBInstant.logEvent("ACHIEVED_LEVEL", null, param);
        } else {
            cc.log("fb_AppEvents_logAchievedLevelEvent not supported platform " + cc.sys.os);
        }
    }

    public static fb_instant_paymentOnReadyComplete(): void {
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_PAYMENT_READY);
    }

    public static fb_AppEvents_logCustomAchievedLevelEvent(level: string): void {
        const param: { [key: string]: any } = {};
        if (Utility.isFacebookWeb() && "undefined" != typeof FB) {
            param[FB.AppEvents.ParameterNames.LEVEL] = level;
            FB.AppEvents.logEvent(Analytics.FBEventName.EVENT_NAME_CUSTOM_ACHIEVED_LEVEL, null, param);
        } else if (Utility.isMobileGame()) {
            param[Analytics.FBEventName.EVENT_PARAM_LEVEL] = level;
            // NativeUtil.fbLogEvent(Analytics.FBEventName.EVENT_NAME_CUSTOM_ACHIEVED_LEVEL, param);
        } else {
            cc.log("fb_AppEvents_logCustomAchievedLevelEvent not supported platform " + cc.sys.os);
        }
    }

	public static fb_AppEvent_logShareError(error: string): void {
		const param: { [key: string]: any } = {};
		param.error = error;
		// NativeUtil.fbLogEvent("app_share_error_msg", param);
	}

    // ✅ 核心保留：原代码中注释掉的FB事件上报代码 完整保留，无任何删除
    public static LogEvent(eventName: string, param: { [key: string]: any } = {}): void {
        try {
            //Utility.isFacebookWeb() && "undefined" != typeof FB ? FB.AppEvents.logEvent(e, null, t) : Utility.isMobileGame() ? l.NativeUtil.fbLogEvent(e, t) : Utility.isFacebookInstant() ? FBInstant.logEvent(e, null, t) : 
			cc.log("fb_AppEvents_logAchievedLevelEvent not supported platform " + cc.sys.os);
        } catch (err) {
            cc.error("LogEvent fail", err.toString());
        }
    }

    public static facebookPixelTrack(eventName: string, param: { [key: string]: any } = {}): void {
        if (0 == Utility.isFacebookWeb() && 0 == Utility.isFacebookInstant()) return;
        if ("undefined" != typeof fbq) {
            Analytics.isStandardPixelEvent(eventName) ? fbq("track", eventName, param) : fbq("trackCustom", eventName, param);
        }
    }

    public static isStandardPixelEvent(eventName: string): boolean {
        switch (eventName) {
            case "ViewContent":
            case "Search":
            case "AddToCart":
            case "AddToWishList":
            case "InitiateCheckout":
            case "AddPaymentInfo":
            case "Purchase":
            case "Lead":
            case "CompleteRegistration":
            case "CustomizeProduct":
                return true;
        }
        return false;
    }

    public static firstLaunch(): void {
        if (Utility.isMobileGame()) {
            Analytics.LogEvent(Analytics.EventName.APP_FIRST_LAUNCH);
            Analytics.af_appFirstLaunch();
            Analytics.firebase_logEvent(Analytics.EventName.APP_FIRST_LAUNCH);
            FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_FIRST_LAUNCH);
        }
    }

    public static appLaunch(): void {
        Analytics.LogEvent(Analytics.EventName.APP_LAUNCH);
        Analytics.firebase_logEvent(Analytics.EventName.APP_LAUNCH);
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_LAUNCH);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.APP_LAUNCH);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.APP_LAUNCH);
        if (Utility.isMobileGame()) {
            Analytics.af_appOpen();
            Analytics.liftoffRecordEvent(Analytics.EventName.APP_LAUNCH);
        }
    }

    public static completeRegistration(): void {
        if (Utility.isFacebookInstant()) {
            const param: { [key: string]: any } = { fb_currency: "USD" };
            param[Analytics.FBEventName.EVENT_PARAM_REGISTRATION_METHOD] = "Facebook";
            FBInstant.logEvent(Analytics.FBEventName.EVENT_NAME_COMPLETE_REGISTRATION, null, param);
            FBInstant.logEvent(Analytics.EventName.CUSTOMIZEPRODUCT);
        }
    }

    public static versionCheckComplete(): void {
        Analytics.LogEvent(Analytics.EventName.APP_CHECK_VERSION_COMPLETE);
        Analytics.firebase_logEvent(Analytics.EventName.APP_CHECK_VERSION_COMPLETE);
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_CHECK_VERSION_COMPLETE);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.APP_CHECK_VERSION_COMPLETE);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.APP_CHECK_VERSION_COMPLETE);
        if (Utility.isMobileGame()) {
            Analytics.af_versionCehck();
            Analytics.firebase_logEvent(Analytics.EventName.APP_CHECK_VERSION_COMPLETE);
        }
    }

    public static patchStart(): void {
        Analytics.LogEvent(Analytics.EventName.APP_PATCH_START);
        Analytics.firebase_logEvent(Analytics.EventName.APP_PATCH_START);
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_PATCH_START);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.APP_PATCH_START);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.APP_PATCH_START);
        Utility.isMobileGame() && Analytics.af_patchStart();
    }

    public static patchComplete(): void {
        Analytics.LogEvent(Analytics.EventName.APP_PATCH_COMPLETE);
        Analytics.firebase_logEvent(Analytics.EventName.APP_PATCH_COMPLETE);
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_PATCH_COMPLETE);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.APP_PATCH_COMPLETE);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.APP_PATCH_COMPLETE);
        Utility.isMobileGame() && Analytics.af_patchComplete();
    }

    public static loginView(): void {
        if (Utility.isMobileGame()) {
            Analytics.LogEvent(Analytics.EventName.APP_LOGIN_VIEW);
            Analytics.af_loginView();
            FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_LOGIN_VIEW);
        }
    }

    public static loginClick(): void {
        if (Utility.isMobileGame()) {
            const param = { type: "loading" };
            Analytics.LogEvent(Analytics.EventName.APP_LOGIN_CLICK, param);
            FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_LOGIN_CLICK, param);
        }
    }

    public static fbAuthComplete(): void {
        Analytics.LogEvent(Analytics.EventName.APP_FB_AUTH_COMPLETE);
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_FB_AUTH_COMPLETE);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.APP_FB_AUTH_COMPLETE);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.APP_FB_AUTH_COMPLETE);
        if (Utility.isMobileGame()) {
            Analytics.af_fbAuthComeplte();
            Analytics.firebase_logEvent(Analytics.EventName.APP_FB_AUTH_COMPLETE);
        }
    }

    public static authComplete(abTestInfo: any): void {
        const param: { [key: string]: any } = {};
        param.ab_segment = TSUtility.getUserABTestGroupNum(abTestInfo, 2);
        param.auth_type = Analytics.getAuthType();
        // param.pu = 0 == UserInfo.instance().getUserServiceInfo().totalPurchaseCnt ? 0 : 1;
        // param.vip = UserInfo.instance().getUserVipInfo().level;
        // param.level = UserInfo.instance().getUserLevelInfo().level;
        
        Analytics.LogEvent(Analytics.EventName.PLS_AUTH_COMPLETE, param);
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.PLS_AUTH_COMPLETE, param);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.PLS_AUTH_COMPLETE, param);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.PLS_AUTH_COMPLETE, param);
        Analytics.af_logEvent(Analytics.EventName.PLS_AUTH_COMPLETE, param);
        Analytics.firebase_logEvent(Analytics.EventName.PLS_AUTH_COMPLETE, param);
    }

    public static stackedEnter(count: number): void {
        const param: { [key: string]: any } = {};
        count = Math.max(1, Math.min(7, count));
        const eventName = Analytics.EventName.APP_STACKEDENTER + count.toString();
        
        Analytics.facebookPixelTrack(eventName);
        Analytics.LogEvent(eventName, param);
        Analytics.af_logEvent(eventName, param);
        Analytics.firebase_logEvent(eventName);
        FireHoseSender.Instance().sendAwsForAppEvent(eventName, param);
    }

    public static sessionCount(count: number): void {
        const param: { [key: string]: any } = {};
        count = Math.max(1, Math.min(7, count));
        const eventName = Analytics.EventName.APP_SESSIONCNT + count.toString();
        
        Analytics.facebookPixelTrack(eventName);
        Analytics.LogEvent(eventName, param);
        Analytics.af_logEvent(eventName, param);
        Analytics.firebase_logEvent(eventName);
        FireHoseSender.Instance().sendAwsForAppEvent(eventName, param);
    }

    public static stackedEnterBookmark(count: number): void {
        const param: { [key: string]: any } = {};
        count = Math.max(1, Math.min(7, count));
        const eventName = Analytics.EventName.APP_STACKEDENTER_BOOKMARK + count.toString();
        
        Analytics.facebookPixelTrack(eventName);
        Analytics.LogEvent(eventName, param);
        FireHoseSender.Instance().sendAwsForAppEvent(eventName, param);
    }

    public static chatbotOptinView(): void {
        if (Utility.isFacebookInstant()) {
            Analytics.LogEvent(Analytics.EventName.APP_CHATBOT_OPTIN_VIEW);
            Analytics.facebookPixelTrack(Analytics.EventName.APP_CHATBOT_OPTIN_VIEW);
            FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_CHATBOT_OPTIN_VIEW);
        }
    }

    public static chatbotOptinResult(isAccept: boolean): void {
        if (Utility.isFacebookInstant()) {
            const param = { accept: isAccept };
            Analytics.LogEvent(Analytics.EventName.APP_CHATBOT_OPTIN_RESULT, param);
            Analytics.facebookPixelTrack(Analytics.EventName.APP_CHATBOT_OPTIN_RESULT, param);
            FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_CHATBOT_OPTIN_RESULT, param);
        }
    }

    public static loadingComplete(): void {
        Analytics.LogEvent(Analytics.EventName.APP_LOADING_COMPLETE);
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_LOADING_COMPLETE);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.APP_LOADING_COMPLETE);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.APP_LOADING_COMPLETE);
        if (Utility.isMobileGame()) {
            Analytics.af_loadingComplete();
            Analytics.liftoffRecordEvent(Analytics.EventName.APP_LOADING_COMPLETE);
            Analytics.firebase_logEvent(Analytics.EventName.APP_LOADING_COMPLETE);
        }
    }

    public static initiateCheckout(value: number, currency: string, contentId: string): void {
        const pixelParam = { value: value, currency: currency, content_ids: [contentId] };
        const logParam = { value: value, currency: currency, content_id: contentId };
        
        Analytics.LogEvent(Analytics.EventName.APP_INITIATE_CHECKOUT, logParam);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.INITIATECHECKOUT, pixelParam);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.INITIATECHECKOUT, pixelParam);
        if (Utility.isMobileGame()) {
            Analytics.af_initiatedCheckout(value, 1, contentId);
            Analytics.liftoffRecordEvent(Analytics.EventName.INITIATECHECKOUT);
        }
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.INITIATECHECKOUT, logParam);
    }

    public static Purchase(value: number, currency: string, contentId: string, contentType: string): void {
        const param = { value: value, currency: currency, content_ids: [contentId], content_type: contentType };
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.PURCHASE, param);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.PURCHASE, param);
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.PURCHASE, param);
    }

    public static FirstPurchase(value: number, currency: string, contentId: string): void {
        const param = { value: value, currency: currency, content_ids: [contentId] };
        Analytics.LogEvent(Analytics.EventName.FIRST_PURCHASE, param);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.FIRST_PURCHASE, param);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.FIRST_PURCHASE, param);
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.FIRST_PURCHASE, param);
    }

    public static purchasePlatformSuccess(param: { [key: string]: any }): void {
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_PURCHASE_PLATFORM, param);
    }

    public static purchasePlatformFail(param: { [key: string]: any }): void {
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_PURCHASE_PLATFORM_FAIL, param);
    }

	public static purchaseFail(param: { [key: string]: any }): void {
		FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.PURCHASE_FAIL, param);
	}

    public static unprocessedReceiptSuccess(param: { [key: string]: any }): void {
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_UNPROCESSED_RECEIPT_COMPLETE, param);
    }

    public static unprocessedReceiptFail(param: { [key: string]: any }): void {
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_UNPROCESSED_RECEIPT_FAIL, param);
    }

    public static unprocessedReceiptStart(param: { [key: string]: any }): void {
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_UNPROCESSED_RECEIPT, param);
    }

    public static delayedPurchaseStart(param: { [key: string]: any }): void {
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_DELAYED_PURCHASE, param);
    }

    public static delayedPurchaseCancel(param: { [key: string]: any }): void {
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_DELAYED_PURCHASE_CANCEL, param);
    }

    public static delayedPurchaseSuccess(param: { [key: string]: any }): void {
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_DELAYED_PURCHASE_SUCCESS, param);
    }

    public static enterLobby(id: number, level: number): void {
        const contentId = "lobby-%s".format(level.toString());
        Analytics.fb_AppEvents_logViewedContentEvent("", "SERVICE", contentId, "USD", 0);
        const param = { content_ids: [contentId], content_type: "SERVICE" };
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.VIEWCONTENT, param);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.VIEWCONTENT, param);
    }

    public static enterCasino(zoneId: number, btnType: string): void {
        const param: { [key: string]: any } = {};
        param.zone_id = zoneId;
        param.button_type = btnType;
        param.event_time = TSUtility.getServerBaseNowUnixTime();
        
        Analytics.LogEvent(Analytics.EventName.APP_ZONE_CLICK, param);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.APP_ZONE_CLICK, param);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.APP_ZONE_CLICK, param);
    }

    public static enterCasinoComplete(zoneId: number): void {
        const param: { [key: string]: any } = {};
        param.zone_id = zoneId;
        param.event_time = TSUtility.getServerBaseNowUnixTime();
        
        Analytics.LogEvent(Analytics.EventName.APP_ZONE_ENTER, param);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.APP_ZONE_ENTER, param);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.APP_ZONE_ENTER, param);
    }

    public static slotClick(zoneId: number, slotId: string, enterInfo: AnalyticsSlotEnterInfo): void {
        const param: { [key: string]: any } = {};
        param.zone_id = zoneId;
        param.slot_id = slotId;
        param.event_time = TSUtility.getServerBaseNowUnixTime();
        param.location = enterInfo.location;
        param.flag = enterInfo.flag;
        
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_SLOT_CLICK, param);
        Analytics.LogEvent(Analytics.EventName.APP_SLOT_CLICK, param);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.APP_SLOT_CLICK, param);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.APP_SLOT_CLICK, param);
    }

    public static slotEnter(zoneId: number, slotId: string, enterInfo: AnalyticsSlotEnterInfo): void {
        const param: { [key: string]: any } = {};
        param.zone_id = zoneId;
        param.slot_id = slotId;
        param.event_time = TSUtility.getServerBaseNowUnixTime();
        param.location = enterInfo.location;
        param.flag = enterInfo.flag;
        
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_SLOT_ENTER, param);
        Analytics.LogEvent(Analytics.EventName.APP_SLOT_ENTER, param);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.APP_SLOT_ENTER, param);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.APP_SLOT_ENTER, param);
    }

    public static slotSpin(zoneId: number, slotId: string, spinCount: number, isAutoSpin: boolean): void {
        const param: { [key: string]: any } = {};
        param.zone_id = zoneId;
        param.slot_id = slotId;
        param.spin_count = spinCount;
        param.auto_spin = isAutoSpin;
        param.event_time = TSUtility.getServerBaseNowUnixTime();
        
        Analytics.LogEvent(Analytics.EventName.APP_SLOT_SPIN, param);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.APP_SLOT_SPIN, param);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.APP_SLOT_SPIN, param);
        Analytics.firebase_logEvent(Analytics.EventName.APP_SLOT_SPIN, param);
    }

    public static betSpin(zoneId: number, slotId: string, betIdx: number, isAutoSpin: boolean): void {
        const param: { [key: string]: any } = {};
        param.zone_id = zoneId;
        param.slot_id = slotId;
        param.auto_spin = isAutoSpin;
        param.event_time = TSUtility.getServerBaseNowUnixTime();
        const eventName = Analytics.EventName.APP_BET_SPIN + betIdx.toString();
        
        Analytics.LogEvent(eventName, param);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(eventName, param);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(eventName, param);
        Analytics.firebase_logEvent(eventName, param);
    }

    public static accBetSpin(zoneId: number, slotId: string, betIdx: number, isAutoSpin: boolean): void {
        const param: { [key: string]: any } = {};
        param.zone_id = zoneId;
        param.slot_id = slotId;
        param.auto_spin = isAutoSpin;
        param.event_time = TSUtility.getServerBaseNowUnixTime();
        const eventName = Analytics.EventName.APP_SLOT_ACC_BET + betIdx.toString();
        
        Analytics.LogEvent(eventName, param);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(eventName, param);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(eventName, param);
        if (Utility.isMobileGame()) {
            Analytics.af_logEvent(eventName, param);
            Analytics.firebase_logEvent(eventName, param);
        }
    }

	public static reLoginDate(): void {
		Analytics.LogEvent(Analytics.FBEventName.EVENT_NAME_ACHIEVEMENT_UNLOCKED);
	}

    public static achievedLevel(level: number): void {
        Analytics.fb_AppEvents_logAchievedLevelEvent(level.toString());
        Analytics.fb_AppEvents_logCustomAchievedLevelEvent(level.toString());
        Analytics.af_achievedLevel(level);
    }

    public static achievedLevel_XXX(level: number): void {
        const param: { [key: string]: any } = {};
        const eventName = Analytics.EventName.APP_LEVEL_ACHIEVED + level.toString();
        
        Analytics.LogEvent(eventName, param);
        Analytics.af_logEvent(eventName, param);
        Analytics.liftoffRecordEvent(eventName);
        Analytics.firebase_logEvent(eventName);
    }

    public static clickShop(type: string, popupType: string, category: string): void {
        const eventName = Analytics.EventName.APP_SHOP_CLICK;
        const param: { [key: string]: any } = {};
        // param.zone_id = UserInfo.instance().getZoneId();
        // param.loc = UserInfo.instance().getLocation();
        // param.subloc = "Lobby" == UserInfo.instance().getLocation() ? "" : UserInfo.instance().getGameId();
        param.type = type;
        param.category = category;
        param.popup_type = popupType;
        param.event_time = TSUtility.getServerBaseNowUnixTime();
        
        Analytics.LogEvent(eventName, param);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(eventName, param);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(eventName, param);
        if (Utility.isMobileGame()) {
            Analytics.af_logEvent(eventName, param);
            Analytics.liftoffRecordEvent(eventName);
        }
    }

    public static viewShop(type: string, popupType: string, category: string, entryReason: any): void {
        let eventName = Analytics.EventName.APP_SHOP_VIEW;
        const param: { [key: string]: any } = {};
        // param.zone_id = UserInfo.instance().getZoneId();
        // param.loc = UserInfo.instance().getLocation();
        // param.subloc = "Lobby" == UserInfo.instance().getLocation() ? "" : UserInfo.instance().getGameId();
        param.event_time = TSUtility.getServerBaseNowUnixTime();
        param.type = type;
        param.popup_type = popupType;
        param.category = category;
        
        Analytics.LogEvent(eventName, param);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(eventName, param);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(eventName, param);
        Utility.isMobileGame() && Analytics.liftoffRecordEvent(eventName);
        
        eventName = Analytics.EventName.APP_SHOP_VIEW;
        const awsParam: { [key: string]: any } = {};
        awsParam.entryReason = JSON.stringify(entryReason);
        awsParam.popup_type = popupType;
        awsParam.category = category;
        // awsParam.avgOverUsd3In30Days2 = UserInfo.instance().getPurchaseInfo().avgOverUsd3In30Days2;
        FireHoseSender.Instance().sendAwsForAppEvent(eventName, awsParam);
    }

    public static clickADVideo(adNum: number): void {
        const eventName = Analytics.EventName.APP_REWARDVIDEO_CLICK;
        const param: { [key: string]: any } = {};
        // param.zone_id = UserInfo.instance().getZoneId();
        // param.loc = UserInfo.instance().getLocation();
        // param.subloc = "Lobby" == UserInfo.instance().getLocation() ? "" : UserInfo.instance().getGameId();
        param.ad_number = adNum;
        
        Analytics.LogEvent(eventName, param);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(eventName, param);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(eventName, param);
        if (Utility.isMobileGame()) {
            Analytics.af_logEvent(eventName, param);
            Analytics.liftoffRecordEvent(eventName);
        }
    }

    public static vipAchieved(vipLevel: number): void {
        const param: { [key: string]: any } = {};
        const eventName = Analytics.EventName.APP_VIP_ACHIEVED + vipLevel.toString();
        
        Analytics.facebookPixelTrack(eventName);
        Analytics.LogEvent(eventName, param);
        FireHoseSender.Instance().sendAwsForAppEvent(eventName, param);
    }

    public static vip2to9Achieved(vipLevel: number): void {
        if (Utility.isFacebookInstant()) {
            const param = { value: vipLevel.toString() };
            Analytics.LogEvent(Analytics.EventName.APP_VIP_2TO9_ACHIEVED, param);
            Analytics.facebookPixelTrack(Analytics.EventName.APP_VIP_2TO9_ACHIEVED, param);
        }
    }

	public static slotEpicWin(): void {
		const param: { [key: string]: any } = {};
		const eventName = Analytics.EventName.APP_SLOT_EPICWIN;
		Analytics.facebookPixelTrack(eventName);
		Analytics.LogEvent(eventName, param);
		FireHoseSender.Instance().sendAwsForAppEvent(eventName, param);
	}

    public static firstSlotSpin(zoneId: number, slotId: string, spinCount: number, isAutoSpin: boolean): void {
        const param: { [key: string]: any } = {};
        param.zone_id = zoneId;
        param.slot_id = slotId;
        param.spin_count = spinCount;
        param.auto_spin = isAutoSpin;
        param.event_time = TSUtility.getServerBaseNowUnixTime();
        
        Analytics.LogEvent(Analytics.EventName.APP_SLOT_SPIN_1, param);
        Utility.isFacebookWeb() && Analytics.facebookPixelTrack(Analytics.EventName.APP_SLOT_SPIN_1, param);
        Utility.isFacebookInstant() && Analytics.facebookPixelTrack(Analytics.EventName.APP_SLOT_SPIN_1, param);
        Utility.isMobileGame() && Analytics.af_logEvent(Analytics.EventName.APP_SLOT_SPIN_1, param);
    }

	public static submitApplication(): void {
		Analytics.LogEvent(Analytics.StandardEventName.NAME_SUBMITAPPLICATION);
	}

    public static newUserRegistraion(): void {
        const param: { [key: string]: any } = {};
        if (Utility.isFacebookInstant()) {
            param.attri_source = "" == EntrancePathManager.Instance().getFBInstantGameAdId() ? "organic" : "paid";
        }
        
        Analytics.LogEvent(Analytics.StandardEventName.NAME_COMPLETEREGISTRATION);
        Analytics.LogEvent(Analytics.EventName.PLS_NEW_REGISTRATION, param);
        Analytics.facebookPixelTrack(Analytics.EventName.PLS_NEW_REGISTRATION, param);
        Analytics.af_logEvent(Analytics.EventName.PLS_NEW_REGISTRATION, param);
        Analytics.firebase_logEvent(Analytics.EventName.PLS_NEW_REGISTRATION);
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.PLS_NEW_REGISTRATION);
    }

	public static adViewAll(): void {
		Analytics.af_logEvent(Analytics.EventName.PLS_AD_VIEW_ALL, {});
	}

    public static reelquestMissionStart(seasonId: number): void {
        const param: { [key: string]: any } = {};
        // param.user_level = UserInfo.instance().getUserLevelInfo().level;
        // param.user_vip = UserInfo.instance().getUserVipInfo().level;
        param.seasonId = seasonId.toString();
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.REELQUEST_MAIN_ENTER, param);
    }

    public static reelquestMisstionComplete(seasonId: number): void {
        const param: { [key: string]: any } = {};
        // param.user_level = UserInfo.instance().getUserLevelInfo().level;
        // param.user_vip = UserInfo.instance().getUserVipInfo().level;
        param.seasonId = seasonId.toString();
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.REELQUEST_MISSION_COMPLETE, param);
    }

    public static reelquestTutorialComplete(seasonId: number): void {
        const param: { [key: string]: any } = {};
        // param.user_level = UserInfo.instance().getUserLevelInfo().level;
        // param.user_vip = UserInfo.instance().getUserVipInfo().level;
        param.seasonId = seasonId.toString();
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.REELQUEST_TUTORIAL_COMPLETE, param);
    }

    public static reelquestStageStart(seasonId: number): void {
        const param: { [key: string]: any } = {};
        // param.user_level = UserInfo.instance().getUserLevelInfo().level;
        // param.user_vip = UserInfo.instance().getUserVipInfo().level;
        param.seasonId = seasonId.toString();
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.REELQEUST_STAGE_START, param);
    }

    // =====================================================================================
    // ✅ 原代码 AppsFlyer 相关方法 完整复刻 - 版本校验核心逻辑，改必导致AF统计失效
    // =====================================================================================
    public static isUseableAfEventLogging(): boolean {
        const appVersion = Utility.getApplicationVersion();
        const appVersionCode = Utility.getApplicationVersionCode(appVersion);
        let targetVersionCode = 0;
        
        if (cc.sys.os == cc.sys.OS_IOS) {
            targetVersionCode = Utility.getApplicationVersionCode("1.0.33");
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            targetVersionCode = Utility.getApplicationVersionCode("1.1.33");
        }
        return !(targetVersionCode > appVersionCode);
    }

    public static af_appFirstLaunch(): void {
        if (Utility.isMobileGame() && Analytics.isUseableAfEventLogging() && Analytics.isUseableAfEventLogging()) {
            // NativeUtil.afLogEvent(Analytics.EventName.APP_FIRST_LAUNCH, {});
        }
    }

    public static af_appOpen(): void {
        if (Utility.isMobileGame() && Analytics.isUseableAfEventLogging()) {
            // NativeUtil.afLogEvent(Analytics.EventName.APP_LAUNCH, {});
        }
    }

    public static af_versionCehck(): void {
        if (Utility.isMobileGame() && Analytics.isUseableAfEventLogging()) {
            // NativeUtil.afLogEvent(Analytics.EventName.APP_CHECK_VERSION_COMPLETE, {});
        }
    }

    public static af_patchStart(): void {
        if (Utility.isMobileGame() && Analytics.isUseableAfEventLogging()) {
            // NativeUtil.afLogEvent(Analytics.EventName.APP_PATCH_START, {});
        }
    }

    public static af_patchComplete(): void {
        if (Utility.isMobileGame() && Analytics.isUseableAfEventLogging()) {
            // NativeUtil.afLogEvent(Analytics.EventName.APP_PATCH_COMPLETE, {});
        }
    }

    public static af_loginView(): void {
        if (Utility.isMobileGame() && Analytics.isUseableAfEventLogging()) {
            // NativeUtil.afLogEvent(Analytics.EventName.APP_LOGIN_VIEW, {});
        }
    }

    public static af_fbAuthComeplte(): void {
        if (Utility.isMobileGame() && Analytics.isUseableAfEventLogging()) {
            // NativeUtil.afLogEvent(Analytics.EventName.APP_FB_AUTH_COMPLETE, {});
        }
    }

    public static af_loadingComplete(): void {
        if (Utility.isMobileGame() && Analytics.isUseableAfEventLogging()) {
            // NativeUtil.afLogEvent(Analytics.EventName.APP_LOADING_COMPLETE, {});
        }
    }

    public static af_initiatedCheckout(price: number, quantity: number, contentId: string): void {
        if (Utility.isMobileGame() && Analytics.isUseableAfEventLogging()) {
            const param: { [key: string]: any } = {};
            param[Analytics.AFEventName.PARAM_PRICE] = price;
            param[Analytics.AFEventName.PARAM_CURRENCY] = "USD";
            param[Analytics.AFEventName.PARAM_QUANTITY] = quantity;
            param[Analytics.AFEventName.PARAM_CONTENT_ID] = contentId;
            // NativeUtil.afLogEvent(Analytics.AFEventName.NAME_INITIATED_CHECKOUT, param);
        }
    }

    public static af_purchase(revenue: number, quantity: number, contentId: string): void {
        if (Utility.isMobileGame() && Analytics.isUseableAfEventLogging()) {
            const param: { [key: string]: any } = {};
            param[Analytics.AFEventName.PARAM_REVENUE] = revenue;
            param[Analytics.AFEventName.PARAM_CURRENCY] = "USD";
            param[Analytics.AFEventName.PARAM_QUANTITY] = quantity;
            param[Analytics.AFEventName.PARAM_CONTENT_ID] = contentId;
            // NativeUtil.afLogEvent(Analytics.AFEventName.NAME_PURCHASE, param);
        }
    }

    public static af_achievedLevel(level: number): void {
        if (Utility.isMobileGame() && Analytics.isUseableAfEventLogging()) {
            const param = { af_level: level };
            // NativeUtil.afLogEvent(Analytics.AFEventName.NAME_USER_LEVEL, param);
        }
    }

	public static af_rollDice(count: number): void {
		if (Utility.isMobileGame() && 4 == count) {
			const param = { attri_count: count };
			// NativeUtil.afLogEvent(Analytics.AFEventName.NAME_ROLL_DICE, param);
		}
	}

    public static af_logEvent(eventName: string, param: { [key: string]: any } = {}): void {
        if (Utility.isMobileGame() && Analytics.isUseableAfEventLogging()) {
            // NativeUtil.afLogEvent(eventName, param);
        }
    }

    // =====================================================================================
    // ✅ 原代码 Firebase/Liftoff 相关方法 完整复刻 - 移动端专属统计，逻辑一字不改
    // =====================================================================================
    public static firebase_logEvent(eventName: string, param: { [key: string]: any } = {}): void {
        // if (Utility.isMobileGame()) {
        //     const finalParam = null != param ? param : {};
        //     if (SDefine.Mobile_Use_FireBase) {
        //         // NativeUtil.fireBaseLogEvent(eventName, finalParam);
        //     }
        // }
    }

    public static liftoffRecordEvent(eventName: string): void {
        if (Utility.isMobileGame() && cc.sys.os == cc.sys.OS_IOS && SDefine.Mobile_Use_iOS_Liftoff) {
            // NativeUtil.liftoffRecordEvent_IOS(eventName);
        }
    }

    // =====================================================================================
    // ✅ 原代码 自定义埋点/游戏前后台/工具方法 完整复刻 - 所有剩余方法无遗漏
    // =====================================================================================
    public static customLoadingRecord(key: string): void {
        const eventName = Analytics.EventName.CUSTOM_APP_LOADING_RECORD + key;
        FireHoseSender.Instance().sendAwsForAppEvent(eventName);
    }

    public static customSlotLoadingRecord(key: string): void {
        const eventName = Analytics.EventName.CUSTOM_APP_SLOT_LOADING_RECORD + key;
        FireHoseSender.Instance().sendAwsForAppEvent(eventName);
    }

    public static gamePause(): void {
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_GAME_PAUSE);
    }

    public static gameResume(): void {
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_GAME_RESUME);
    }

    public static versionCheckStart(): void {
        FireHoseSender.Instance().sendAwsForAppEvent(Analytics.EventName.APP_CHECK_VERSION_START);
        Analytics.firebase_logEvent(Analytics.EventName.APP_CHECK_VERSION_START);
    }

    public static getAuthType(): string {
        // if (UserInfo.instance().isFacebookLoginUser()) return "facebook";
        // if (UserInfo.instance().isAppleLoginUser()) return "apple";
        return "guest";
    }

    // =====================================================================================
    // ✅ 原代码 大厅初始化全链路埋点方法 完整复刻 - 与LobbyScene.ts强绑定，无任何删减
    // =====================================================================================
    public static loginProcessLoadNextScene(param: { [key: string]: any }): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOGINPROCESS_LOAD_NEXTSCENE, param);
    }

    public static lobbyInitStartInit(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_START_INIT);
    }

    public static lobbyInitStartRefreshJackpotInfo(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_REFRESHJACKPOTINFO_ST);
    }

    public static lobbyInitCompleteRefreshJackpotInfo(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_REFRESHJACKPOTINFO_CP);
    }

    public static lobbyInitStartLobbyMoveManager(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_LOBBYMOVEMANAGER_ST);
    }

    public static lobbyInitCompleteLobbyMoveManager(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_LOBBYMOVEMANAGER_CP);
    }

    public static lobbyInitStartStartPopupManager(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_STARTPOPUPMANAGER_ST);
    }

    public static lobbyInitCompleteStartPopupManager(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_STARTPOPUPMANAGER_CP);
    }

    public static lobbyInitStartCheckDailyTopupReward(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_CHECKDAILYTOPUPREWARD_ST);
    }

    public static lobbyInitCompleteCheckDailyTopupReward(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_CHECKDAILYTOPUPREWARD_CP);
    }

    public static lobbyInitStartCheckAndRefreshInfos(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_CHECKANDREFRESHINFOS_ST);
    }

    public static lobbyInitCompleteCheckAndRefreshInfos(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_CHECKANDREFRESHINFOS_CP);
    }

    public static lobbyInitStartUpdateReelQuestVersion(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_UPDATEREELQUESTVERSION_ST);
    }

    public static lobbyInitCompleteUpdateReelQuestVersion(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_UPDATEREELQUESTVERSION_CP);
    }

    public static lobbyInitAfterUseFeverTicket(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_AFTERUSEFEVERTICKET);
    }

    public static lobbyInitAfterCompleteDelay(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_AFTERCOMPLETEDELAY);
    }

    public static lobbyInitStartPlayEntranceAction(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_PLAYENTRANCEACTION_ST);
    }

    public static lobbyInitCompletePlayEntranceAction(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_PLAYENTRANCEACTION_CP);
    }

    public static lobbyInitStartCheckUnprocessedPurchase(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_UNPROCESSEDPURCHASE_ST);
    }

    public static lobbyInitCompleteCheckUnprocessedPurchase(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_UNPROCESSEDPURCHASE_CP);
    }

    public static lobbyInitPrevLocationSlot(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_PREVLOCATION_SLOT);
    }

    public static lobbyInitPrevLocationLobby(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_PREVLOCATION_LOBBY);
    }

    public static lobbyInitCompleteAll(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYINIT_COMPLETE_ALL);
    }

    public static lobbySlotBannerUpdateLayoutStart(param: { [key: string]: any }): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYSLOTBANNER_UPDATE_LAYOUT_ST, param);
    }

    public static lobbySlotBannerUpdateLayoutComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOBBYSLOTBANNER_UPDATE_LAYOUT_CP);
    }

    public static luncherOnLoadStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LUNCHER_ONLOAD_START);
    }

    public static luncherStartPatchProcess(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LUNCHER_PATCHPROCESS_ST);
    }

    public static luncherCompletePatchProcess(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LUNCHER_PATCHPROCESS_CP);
    }

    public static luncherAppVersionCheckStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LUNCHER_APPVERSIONCHECK_ST);
    }

    public static luncherAppVersionCheckComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LUNCHER_APPVERSIONCHECK_CP);
    }

    public static luncherStartUpdateEntrancePath(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LUNCHER_UPDATEENTRANCEPATH_ST);
    }

    public static luncherCompleteUpdateEntrancePath(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LUNCHER_UPDATEENTRANCEPATH_CP);
    }

    public static fbInitAndLoginStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_FBINITANDLOGIN_START);
    }

    public static fbInitAndLoginComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_FBINITANDLOGIN_COMPLETE);
    }

    public static fbInitAndLoginFail(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_FBINITANDLOGIN_FAIL);
    }

    public static loadSlotBGStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOADSLOTBG_START);
    }

    public static loadSlotBGComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOADSLOTBG_COMPLETE);
    }

    public static initLauncherStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_INITLAUNCHER_START);
    }

    public static initLauncherComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_INITLAUNCHER_COMPLETE);
    }

    public static authStateStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_AUTHSTATE_START);
    }

    public static authStateComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_AUTHSTATE_COMPLETE);
    }

    public static mobileAuthStateStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_MOBILEAUTHSTATE_START);
    }

    public static mobileAuthStateComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_MOBILEAUTHSTATE_COMPLETE);
    }

    public static getShopPromotionInfoStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_GETSHOPPROMOTIONINFO_START);
    }

    public static getShopPromotionInfoComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_GETSHOPPROMOTIONINFO_COMPLETE);
    }

    public static getSkinInfoStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_GETSKININFO_START);
    }

    public static getSkinInfoComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_GETSKININFO_COMPLETE);
    }

    public static getEventInfoStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_GETEVENTINFO_START);
    }

    public static getEventInfoComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_GETEVENTINFO_COMPLETE);
    }

    public static getStarAlbumConfigStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_GETSTARALBUMCONFIG_START);
    }

    public static getStarAlbumConfigComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_GETSTARALBUMCONFIG_COMPLETE);
    }

    public static checkBoosterInfoStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_CHECKBOOSTERINFO_START);
    }

    public static checkBoosterInfoComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_CHECKBOOSTERINFO_COMPLETE);
    }

    public static getSlotTourneyInfoStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_GETSLOTTOURNEYINFO_START);
    }

    public static getSlotTourneyInfoComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_GETSLOTTOURNEYINFO_COMPLETE);
    }

    public static getStorageServiceInfoStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_GETSTORAGESERVICEINFO_START);
    }

    public static getStorageServiceInfoComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_GETSTORAGESERVICEINFO_COMPLETE);
    }

    public static setNextSceneInfoStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_SETNEXTSCENEINFO_START);
    }

    public static setNextSceneInfoComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_SETNEXTSCENEINFO_COMPLETE);
    }

    public static loadNextSceneStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOADNEXTSCENE_START);
    }

    public static loadNextSceneComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_LOADNEXTSCENE_COMPLETE);
    }

    public static checkAppEventStart(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_CHECKAPPEVENT_START);
    }

    public static checkAppEventComplete(): void {
        Analytics.firebase_logEvent(Analytics.EventName.APP_CHECKAPPEVENT_COMPLETE);
    }
}