const { ccclass, property } = cc._decorator;
import TSUtility from "./TSUtility";
import { Utility } from "./Utility";

export default class NativeUtil {
    private static nativePrevLog: Function = null;
    private static nativePrevLogCallCnt: number = 0;
    private static nativePrevError: Function = null;
    private static nativePrevErrorCallCnt: number = 0;
    private static currentContryCode: string = "";

    public static init(): void {
        NativeUtil.nativePrevLog = cc.log;
        cc.log = NativeUtil.log;
        NativeUtil.nativePrevError = cc.error;
        cc.error = NativeUtil.error;
    }

    public static log(...args: any[]): void {
        if (!(NativeUtil.nativePrevLogCallCnt > 1)) {
            const str = cc.js.formatStr.apply(null, args);
            NativeUtil.nativePrevLogCallCnt++;
            NativeUtil.customLog_FBCrash(str);
            NativeUtil.nativePrevLog(str);
            NativeUtil.nativePrevLogCallCnt--;
        }
    }

    public static error(...args: any[]): void {
        if (!(NativeUtil.nativePrevErrorCallCnt > 1)) {
            const str = cc.js.formatStr.apply(null, args);
            NativeUtil.nativePrevErrorCallCnt++;
            NativeUtil.customLog_FBCrash(str);
            NativeUtil.nativePrevError(str);
            NativeUtil.nativePrevErrorCallCnt--;
        }
    }

    public static useNativePatchSystem(): boolean {
        return !(!Utility.isMobileGame() || Utility.isCocosEditorPlay() || 
            (cc['skipPatchSystem'] !== undefined && cc['skipPatchSystem'] == 1 && (cc.log("cc.skipPatchSystem working"), true)));
    }

    public static getDeepLinkContent(): string {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            return NativeUtil.getDeepLinkContentAndroid();
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            return decodeURIComponent(NativeUtil.getDeepLinkContentIOS());
        } else {
            cc.log("getDeepLinkContent not found platform " + cc.sys.os);
            return "";
        }
    }

    public static getCountryCodeByUSIM(): string {
        cc.log("getCountryCodeByUSIM start");
        let code = "";
        if (Utility.isMobileGame()) {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                code = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getCountryCodeByUSIM", "()Ljava/lang/String;");
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                code = jsb.reflection.callStaticMethod("AppController", "getCountryCodeByUSIM","");
            }
        }
        cc.log("getCountryCodeByUSIM end: " + code);
        code = code || "";
        return code.toUpperCase();
    }

    public static getCountryCodeByNative(): string {
        cc.log("getCountryCodeByNative start");
        let code = "";
        if (Utility.isMobileGame()) {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                code = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getCountryCodeByNative", "()Ljava/lang/String;");
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                code = jsb.reflection.callStaticMethod("AppController", "getCountryCodeByNative","");
            }
        }
        cc.log("getCountryCodeByNative end: " + code);
        code = code || "";
        return code.toUpperCase();
    }

    public static getMarketInfo(): string {
        if (!Utility.isMobileGame()) {
            cc.error("is not mobile game");
            return "unknown";
        }
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            return "playstore";
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            return "appstore";
        } else {
            cc.error("getMarketInfo not found platform " + cc.sys.os);
            return "unknown_os";
        }
    }

    public static getCountryCode_Line(): string {
        let code = NativeUtil.getCountryCode();
        if (code == "KR") code = "JP";
        return code;
    }

    public static getCountryCode(): string {
        if (NativeUtil.currentContryCode != "") {
            return NativeUtil.currentContryCode;
        }
        let code = NativeUtil.getCountryCodeByUSIM();
        if (code == "") {
            code = NativeUtil.getCountryCodeByNative();
        }
        NativeUtil.currentContryCode = code;
        return NativeUtil.currentContryCode;
    }

    public static getClientSessionKey(): string {
        let key = "";
        try {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                key = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getClientSessionKey", "()Ljava/lang/String;");
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                key = jsb.reflection.callStaticMethod("AppController", "getClientSessionKey","");
            } else {
                cc.log("getClientSessionKey not found platform " + cc.sys.os);
            }
        } catch (error) {
            key = "";
            cc.log("getClientSessionKey exception");
        }
        if (key == null) {
            cc.log("not supported native clientSessionKey");
            key = "";
        }
        return key;
    }

    public static getOSVersion(): string {
        let version = "";
        try {
            version = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getOSVersion", "()Ljava/lang/String;");
        } catch (error) {
            version = "";
            cc.log("getOSVersion Exception");
        }
        if (version == null) version = "";
        else cc.log("OS VERSION :" + version);
        return version;
    }

    public static resetClientSessionKey(): void {
        try {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "resetClientSessionKey", "()V");
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                jsb.reflection.callStaticMethod("AppController", "resetClientSessionKey","");
            } else {
                cc.log("getClientSessionKey not found platform " + cc.sys.os);
            }
        } catch (error) {
            cc.log("getClientSessionKey exception");
        }
    }

    public static copyToClipBoard(str: string): void {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            NativeUtil.copyToClipBoardAndroid(str);
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            NativeUtil.copyToClipBoardIOS(str);
        } else {
            cc.log("copyToClipBoard not found platform " + cc.sys.os);
        }
    }

    public static isSupportLINEGrowthyAPI(): boolean {
        // const ver = TSUtility.getApplicationVersion();
        // return !(TSUtility.getApplicationVersionCode(ver) < TSUtility.getApplicationVersionCode("2.6.30"));
        return false;
    }

    public static lineGrowthy_setAdvertisingID(id: string, open: number): void {
        if (NativeUtil.isSupportLINEGrowthyAPI()) {
            let param = 0;
            if (open == 1) param = 1;
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "LineGrowthy_setAdvertisingID", "(Ljava/lang/String;F)V", id, param);
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                jsb.reflection.callStaticMethod("AppController", "LINEGrowthy_setAdvertisingID:withParam:", id, param);
            } else {
                cc.log("lineGrowthy_setAdvertisingID not found platform " + cc.sys.os);
            }
        } else {
            cc.log("isSupportLINEGrowthyAPI not supported");
        }
    }

    public static lineGrowthy_clearAdvertisingID(): void {
        if (NativeUtil.isSupportLINEGrowthyAPI()) {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "LineGrowthy_clearAdvertisingID", "()V");
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                jsb.reflection.callStaticMethod("AppController", "LINEGrowthy_clearAdvertisingInfo","");
            } else {
                cc.log("lineGrowthy_setAdvertisingID not found platform " + cc.sys.os);
            }
        } else {
            cc.log("isSupportLINEGrowthyAPI not supported");
        }
    }

    public static lineGrowthy_setUserId(id: string): void {
        if (NativeUtil.isSupportLINEGrowthyAPI()) {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "LineGrowthy_setUserId", "(Ljava/lang/String;)V", id);
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                jsb.reflection.callStaticMethod("AppController", "LINEGrowthy_setUserId:", id);
            } else {
                cc.log("lineGrowthy_setAdvertisingID not found platform " + cc.sys.os);
            }
        } else {
            cc.log("isSupportLINEGrowthyAPI not supported");
        }
    }

    public static lineGrowthy_trackCustomEvent(event: string, param: string): void {
        if (NativeUtil.isSupportLINEGrowthyAPI()) {
            cc.log(cc.js.formatStr("line Event [%s][%s]", event, param));
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "LineGrowth_trackCustomEvent", "(Ljava/lang/String;Ljava/lang/String;)V", event, param);
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                jsb.reflection.callStaticMethod("AppController", "LINEGrowthy_trackCustomEvent:withParam:", event, param);
            } else {
                cc.log("lineGrowthy_setAdvertisingID not found platform " + cc.sys.os);
            }
            cc.log("line Event end");
        } else {
            cc.log("isSupportLINEGrowthyAPI not supported");
        }
    }

    public static showFacebookInvitePopup(type: number): void {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            if (type == 0) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "facebookInviteFriends", "()V");
            } else {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/FacebookPlugIn", "facebookInviteFriends", "()V");
            }
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "facebookInviteFriends","");
        } else {
            cc.log("showFacebookInvitePopup not found platform " + cc.sys.os);
        }
    }

    public static setMultiTouch(isOpen: number): void {
        let param = 0;
        if (isOpen == 1) param = 1;
        cc.log(cc.js.formatStr("setMultiTouch %s", param.toString()));
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "setMultiTouch", "(F)V", param);
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "setMultiTouch:","", param);
        } else {
            cc.log("setMultiTouch not found platform " + cc.sys.os);
        }
    }

    public static fbLogEvent(event: string, param: any): void {
        const json = JSON.stringify(param);
        cc.log(cc.js.formatStr("fbLogEvent %s / %s", event, json));
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "fbLogEvent", "(Ljava/lang/String;Ljava/lang/String;)V", event, json);
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "fbLogEvent:withParam:", event, json);
        } else {
            cc.log("fbLogEvent not found platform " + cc.sys.os);
        }
        cc.log("fbLogEvent end");
    }

    public static fbLogEventSumValue(event: string, sumValue: number, param: any): void {
        const json = JSON.stringify(param);
        cc.log(cc.js.formatStr("fbLogEventSumValue %s / %s / %s", event, json, sumValue.toString()));
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "fbLogEventSumValue", "(Ljava/lang/String;Ljava/lang/String;F)V", event, json, sumValue);
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "fbLogEvent:withParam:withSumValue:", event, json, sumValue);
        } else {
            cc.log("fbLogEventSumValue not found platform " + cc.sys.os);
        }
        cc.log("fbLogEventSumValue end");
    }

    public static fireBaseLogEvent(event: string, param: any): void {
        const json = JSON.stringify(param);
        cc.log(cc.js.formatStr("fireBaseLogEvent %s / %s", event, json));
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "firebaseLogEvent", "(Ljava/lang/String;Ljava/lang/String;)V", event, json);
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "firebaseLogEvent:withParam:", event, json);
        } else {
            cc.log("fireBase not found platform" + cc.sys.os);
        }
        cc.log("fireBaseLogEvent end");
    }

    public static afLogEvent(event: string, param: any): void {
        const json = JSON.stringify(param);
        cc.log(cc.js.formatStr("afLogEvent %s / %s", event, json));
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "afLogEvent", "(Ljava/lang/String;Ljava/lang/String;)V", event, json);
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "afLogEvent:withParam:", event, json);
        } else {
            cc.log("afLogEvent not found platform " + cc.sys.os);
        }
        cc.log("afLogEvent end");
    }

    public static getAppsFlyerConversionData(): string {
        cc.log("getAppsFlyerConversionData start");
        let data = "";
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            data = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getAppsflyerConversionData", "()Ljava/lang/String;");
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            data = jsb.reflection.callStaticMethod("AppController", "getAppsflyerConversionData","");
        }
        cc.log("getAppsFlyerConversionData end: " + data);
        return data;
    }

    public static getAppsFlyerUID(): string {
        cc.log("getAppsFlyerUID start");
        let uid = "";
        if (!Utility.isMobileGame()) return uid;
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            uid = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getAppsflyerUID", "()Ljava/lang/String;");
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            // const ver = Utility.getApplicationVersion();
            // if (Utility.getApplicationVersionCode(ver) < Utility.getApplicationVersionCode("2.1.13")) {
            //     cc.log("getAppsFlyerUID not supported: " + ver);
            //     uid = "";
            // } else {
            //     uid = jsb.reflection.callStaticMethod("AppController", "getAppsflyerUID","");
            // }
        }
        cc.log("getAppsFlyerUID end: " + uid);
        return uid;
    }

    public static setAppsflyerCustomerUserId(uid: string): void {
        cc.log("setAppsflyerCustomerUserId start");
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "setAppsflyerCustomerUserId", "(Ljava/lang/String;)V", uid);
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "setAppsflyerCustomerUserId:", uid);
        }
        cc.log("setAppsflyerCustomerUserId end");
    }

    public static setAppsflyerConversionDataCallback(): void {
        cc.log("setAppsflyerConversionDataCallback start");
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "setAppsflyerConversionDataCallback", "()V");
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "setAppsflyerConversionDataCallback","");
        }
        cc.log("setAppsflyerConversionDataCallback end");
    }

    public static setUserIdentifier_FBCrash(id: string): void {
        if (Utility.isMobileGame()) {
            cc.log("setUserIdentifier_FBCrash start");
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "setUserIdentifier_FBCrash", "(Ljava/lang/String;)V", id);
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                jsb.reflection.callStaticMethod("AppController", "setUserIdentifier_FBCrash:", id);
            }
            cc.log("setUserIdentifier_FBCrash end");
        }
    }

    public static customLog_FBCrash(str: string): void { }

    public static setObjValue_FBCrash(key: string, value: string): void {
        if (Utility.isMobileGame()) {
            cc.log("setObjValue_FBCrash start");
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "setObjValue_FBCrash", "(Ljava/lang/String;Ljava/lang/String;)V", key, value);
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                jsb.reflection.callStaticMethod("AppController", "setObjValue_FBCrash:andValue:", key, value);
            }
            cc.log("setObjValue_FBCrash end");
        }
    }

    public static getMopubNativeInfo(): string {
        cc.log("getMopubNativeInfo_IOS start");
        let info = "";
        if (Utility.isMobileGame()) return info;
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            info = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getMopubNativeInfo", "()Ljava/lang/String;");
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            info = jsb.reflection.callStaticMethod("RootViewController", "getMopubNativeInfo","");
        }
        cc.log("getMopubNativeInfo result " + info);
        return info;
    }

    public static oneSignalSetSubscribe(isOpen: number): void {
        let param = 0;
        if (isOpen == 1) param = 1;
        cc.log(cc.js.formatStr("oneSignalSetSubscribe %s", param.toString()));
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/ApplicationClass", "oneSignalSetSubscribe", "(F)V", param);
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "oneSignalSetSubscribe:","", param);
        } else {
            cc.log("oneSignalSetSubscribe not found platform " + cc.sys.os);
        }
    }

    public static oneSignalGetAdditionalData(): string {
        cc.log("oneSignalGetAdditionalData start");
        let data = "";
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            data = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/ApplicationClass", "oneSignalGetAdditionalData", "()Ljava/lang/String;");
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            data = jsb.reflection.callStaticMethod("AppController", "oneSignalGetAdditionalData","");
        }
        cc.log("oneSignalGetAdditionalData end: " + data);
        return data;
    }

    public static oneSignalResetAdditionalData(): void {
        cc.log("oneSignalResetAdditionalData start");
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/ApplicationClass", "oneSignalResetAdditionalData", "()V");
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "oneSignalResetAdditionalData","");
        }
        cc.log("oneSignalResetAdditionalData end: ");
    }

    public static oneSignalGetNotificationData(): string {
        cc.log("oneSignalGetNotificationData start");
        let data = "";
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            data = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/ApplicationClass", "oneSignalGetNotificationData", "()Ljava/lang/String;");
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            data = jsb.reflection.callStaticMethod("AppController", "oneSignalGetNotificationData","");
        }
        cc.log("oneSignalGetNotificationData end: " + data);
        return data;
    }

    public static oneSignalGetUserID(): string {
        cc.log("oneSignalGetUserID start");
        let uid = "";
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            uid = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/ApplicationClass", "oneSignalGetUserID", "()Ljava/lang/String;");
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            uid = jsb.reflection.callStaticMethod("AppController", "oneSignalGetUserID","");
        }
        if (uid == null) uid = "";
        cc.log("oneSignalGetUserID end: " + uid);
        return uid;
    }

    public static copyToClipBoardAndroid(str: string): void {
        cc.log("copyToClipBoardAndroid start");
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "copyToClipBoard", "(Ljava/lang/String;)V", str);
        cc.log("copyToClipBoardAndroid end");
    }

    public static getDeepLinkContentAndroid(): string {
        cc.log("getDeepLinkContent start");
        const data = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getDeepLinkContent", "()Ljava/lang/String;");
        cc.log("getDeepLinkContent: " + data);
        return data;
    }

    public static getPackageName(): string {
        cc.log("getPackageName start ");
        const name = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getMyPackageName", "()Ljava/lang/String;");
        cc.log("getPackageName end " + name);
        return name;
    }

    public static appsflyerTrackPurchaseAndroid(product: string, type: string, price: number): void {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log(cc.js.formatStr("trackPurchaseAndroid start %s / %s / %s", product, type, price.toString()));
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "trackPurchase", "(Ljava/lang/String;Ljava/lang/String;I)V", product, type, Math.round(price));
            cc.log("trackPurchaseAndroid end");
        } else {
            cc.log("appsflyerTrackPurchaseAndroid not supported platform");
        }
    }

    public static appsflyerTrackPurchaseAndroidVer2(product: string, type: string, price: number): void {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log(cc.js.formatStr("trackPurchaseAndroidVer2 start %s / %s / %s", product, type, price.toString()));
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "trackPurchase_ver2", "(Ljava/lang/String;Ljava/lang/String;F)V", product, type, price);
            cc.log("trackPurchaseAndroidVer2 end");
        } else {
            cc.log("trackPurchaseAndroidVer2 not supported platform");
        }
    }

    public static getSSAID_AOS(): string {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("getSSAID_AOS start");
            const id = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getSSAID", "()Ljava/lang/String;");
            cc.log("getSSAID_AOS end ", id);
            return id;
        }
        cc.log("getSSAID_AOS not supported platform");
        return "";
    }

    public static getSharedPreferencesInfo_AOS(key: string): string {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("getSharedPreferencesInfo_AOS start");
            const val = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getSharedPreferencesInfo", "(Ljava/lang/String;)Ljava/lang/String;", key);
            cc.log("getSharedPreferencesInfo_AOS end ", val);
            return val;
        }
        cc.log("getSharedPreferencesInfo_AOS not supported platform");
        return "";
    }

    public static setSharedPreferencesInfo_AOS(key: string, val: string): boolean {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("setSharedPreferencesInfo_AOS start");
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "setSharedPreferencesInfo", "(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;", key, val);
            cc.log("setSharedPreferencesInfo_AOS end ", val);
            return true;
        }
        cc.log("setSharedPreferencesInfo_AOS not supported platform");
        return false;
    }

    public static initSkuInfo_AOS(sku: string): void {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("initSkuInfo_AOS start");
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/IAPPlugIn", "initSkuInfo", "(Ljava/lang/String;)V", sku);
            cc.log("initSkuInfo_AOS end");
        } else {
            cc.log("initSkuInfo_AOS not supported platform");
        }
    }

    public static getSkuInfo_AOS(sku: string): string {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("getSkuInfo_AOS start");
            let info = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/IAPPlugIn", "getSkuDetailsString", "(Ljava/lang/String;)Ljava/lang/String;", sku);
            cc.log("getSkuInfo_AOS end: ", info);
            if (!TSUtility.isValid(info)) info = "";
            return info;
        }
        cc.log("getSkuInfo_AOS not supported platform");
        return "";
    }

    public static purchaseProduct_AOS(sku: string): void {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("purchaseProduct_AOS start");
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/IAPPlugIn", "purchaseItem", "(Ljava/lang/String;)V", sku);
            cc.log("purchaseProduct_AOS end");
        } else {
            cc.log("purchaseProduct_AOS not supported platform");
        }
    }

    public static consumeProduct_AOS(sku: string): void {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("consumeProduct_AOS start");
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/IAPPlugIn", "consumeProduct", "(Ljava/lang/String;)V", sku);
            cc.log("consumeProduct_AOS end");
        } else {
            cc.log("consumeProduct_AOS not supported platform");
        }
    }

    public static getPurchaseHistory_AOS(): void {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("getPurchaseHistory_AOS start");
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/IAPPlugIn", "queryPurchasesHistory", "()V");
            cc.log("getPurchaseHistory_AOS end");
        } else {
            cc.log("getPurchaseHistory_AOS not supported platform");
        }
    }

    public static fb_IsLogin_AOS(): boolean {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("fb_IsLogin_AOS start");
            const isLogin = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/FacebookPlugIn", "isLoggedIn", "()Z");
            cc.log("fb_IsLogin_AOS end");
            return isLogin;
        }
        cc.log("fb_IsLogin_AOS not supported platform");
        return false;
    }

    public static fb_Login_AOS(perm: string): void {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("fb_IsLogin_AOS start");
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/FacebookPlugIn", "login", "(Ljava/lang/String;)V", perm);
            cc.log("fb_IsLogin_AOS end");
        } else {
            cc.log("fb_IsLogin_AOS not supported platform");
        }
    }

    public static fb_SendGift_AOS(id: string): void {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("fb_SendGift_AOS start " + id);
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/FacebookPlugIn", "sendGift", "(Ljava/lang/String;)V", id);
            cc.log("fb_SendGift_AOS end");
        } else {
            cc.log("fb_SendGift_AOS not supported platform");
        }
    }

    public static fb_Dialog_AOS(param: string): void {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("fb_Dialog_AOS start " + param);
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/FacebookPlugIn", "dialog", "(Ljava/lang/String;)V", param);
            cc.log("fb_Dialog_AOS end");
        } else {
            cc.log("fb_Dialog_AOS not supported platform");
        }
    }

    public static fb_GetPermissionList(): string {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("fb_GetPermissionList start");
            const list = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/FacebookPlugIn", "getPermissionList", "()Ljava/lang/String;");
            cc.log("fb_GetPermissionList end");
            return list;
        }
        cc.log("fb_GetPermissionList not supported platform");
        return "";
    }

    public static fb_GetAccessToken(): string {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("fb_GetAccessToken start");
            const token = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/FacebookPlugIn", "getAccessToken", "()Ljava/lang/String;");
            cc.log("fb_GetAccessToken end");
            return token;
        }
        cc.log("fb_GetAccessToken not supported platform");
        return "";
    }

    public static fb_GetId(): string {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("fb_GetId start");
            const id = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/FacebookPlugIn", "getID", "()Ljava/lang/String;");
            cc.log("fb_GetId end");
            return id;
        }
        cc.log("fb_GetId not supported platform");
        return "";
    }

    public static fb_Logout(): void {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("fb_Logout start");
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/FacebookPlugIn", "logout", "()V");
            cc.log("fb_Logout end");
        } else {
            cc.log("fb_Logout not supported platform");
        }
    }

    public static fb_RequestReadPermissions(perm: string): void {
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("fb_RequestReadPermissions start");
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/FacebookPlugIn", "requestReadPermissions", "(Ljava/lang/String;)V", perm);
            cc.log("fb_RequestReadPermissions end");
        } else {
            cc.log("fb_RequestReadPermissions not supported platform");
        }
    }

    public static showCMPPopup_AOS(): void {
        cc.log("showCMPPopup_IOS start");
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showCMPPopup", "()V");
        cc.log("showCMPPopup_IOS end");
    }

    public static isContentFlowUserGeography_AOS(): boolean {
        cc.log("isContentFlowUserGeography_AOS start");
        const res = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "isConsentFlowUserGeography", "()Z");
        cc.log("isContentFlowUserGeography_AOS result " + res);
        return res;
    }

    public static getIOSUdid(): string {
        cc.log("getIOSUdid start");
        const udid = jsb.reflection.callStaticMethod("AppController", "getUdidString","");
        cc.log("getIOSUdid result " + udid);
        return udid;
    }

    public static copyToClipBoardIOS(str: string): void {
        cc.log("copyToClipBoardIOS start");
        jsb.reflection.callStaticMethod("AppController", "copyToClipBoardIOS:", str);
        cc.log("copyToClipBoardIOS end");
    }

    public static getDeepLinkContentIOS(): string {
        cc.log("getDeepLinkContentIOS start");
        const data = jsb.reflection.callStaticMethod("AppController", "getDeepLinkContentIOS","");
        cc.log("getDeepLinkContentIOS result " + data);
        return data;
    }

    public static getRemainTransactionReceiptIOS(): string {
        cc.log("getRemainTransactionReceipt start");
        const data = jsb.reflection.callStaticMethod("AppController", "getRemainTransactionReceipt","");
        cc.log("getRemainTransactionReceipt result " + data);
        return data;
    }

    public static appsflyerTrackPurchaseIOS(product: string, type: string, price: number): void {
        cc.log(cc.js.formatStr("appsflyerTrackPurchaseIOS start %s / %s / %s", product, type, price.toString()));
        jsb.reflection.callStaticMethod("AppController", "trackPurchaseIOS:andType:andValue:", product, type, price);
        cc.log("appsflyerTrackPurchaseIOS end");
    }

    public static isAvailableAttrackingIOS(): boolean {
        cc.log("isAvailableAttrackingIOS start");
        const res = jsb.reflection.callStaticMethod("AppController", "isAvailableATTracking","");
        cc.log("isAvailableAttrackingIOS end", res);
        return res;
    }

    public static getATTrackingAuthorizationStatus(): number {
        cc.log("getATTrackingAuthorizationStatus start");
        const status = jsb.reflection.callStaticMethod("AppController", "getATTrackingAuthorizationStatus","");
        cc.log("getATTrackingAuthorizationStatus end", status);
        return status;
    }

    public static isIOSVersionMoreThan17(): boolean {
        cc.log("isIOSVersionMoreThan17 start");
        const res = jsb.reflection.callStaticMethod("AppController", "isIosVersionMoreThan17","");
        cc.log("isIOSVersionMoreThan17 end", res);
        return res;
    }

    public static requestATTrackingIOS(): void {
        cc.log("requestATTrackingIOS start");
        jsb.reflection.callStaticMethod("AppController", "requestATTracking","");
        cc.log("requestATTrackingIOS end");
    }

    public static setIdleTimerOffIOS(): void {
        cc.log("setIdleTimerOffIOS start");
        jsb.reflection.callStaticMethod("AppController", "setIdleTimerOff","");
        cc.log("setIdleTimerOffIOS end");
    }

    public static getCFUUID_IOS(): string {
        cc.log("getCFUUID_IOS start");
        const uuid = jsb.reflection.callStaticMethod("AppController", "getCFUUID","");
        cc.log("getCFUUID_IOS result " + uuid);
        return uuid;
    }

    public static getKeychainItemInfo_IOS(key: string): string {
        cc.log("getKeychainItemInfo_IOS start", key);
        const val = jsb.reflection.callStaticMethod("AppController", "getKeychainItemInfo:", key);
        cc.log("getKeychainItemInfo_IOS result " + val);
        return val;
    }

    public static setKeychainItemInfo_IOS(key: string, val: string): boolean {
        cc.log("setKeychainItemInfo_IOS start", key);
        const res = jsb.reflection.callStaticMethod("AppController", "setKeychainItemInfo:andValue:", key, val);
        cc.log("setKeychainItemInfo_IOS result " + res);
        return res;
    }

    public static isSupportAppleLogin(): boolean {
        cc.log("isSupportAppleLogin start");
        if (cc.sys.os != cc.sys.OS_IOS) {
            cc.log("isSupportAppleLogin not ios platform");
            return false;
        }
        const res = jsb.reflection.callStaticMethod("RootViewController", "isSupportAppleLogin","");
        cc.log("isSupportAppleLogin result " + res);
        return res;
    }

    public static getAppleLoginStatus_IOS(state: string): string {
        cc.log("getAppleLoginStatus_IOS start");
        const res = jsb.reflection.callStaticMethod("RootViewController", "getAppleLoginState:", state);
        cc.log("getAppleLoginStatus_IOS result " + res);
        return res;
    }

    public static requestAppleLogin_IOS(): string {
        cc.log("requestAppleLogin_IOS start");
        const res = jsb.reflection.callStaticMethod("RootViewController", "requestAppleLogin","");
        cc.log("requestAppleLogin_IOS result " + res);
        return res;
    }

    public static liftoffRecordEvent_IOS(event: string): void {
        cc.log("liftoffRecordEvent_IOS start", event);
        jsb.reflection.callStaticMethod("AppController", "liftoffRecordEvent:", event);
        cc.log("liftoffRecordEvent_IOS end");
    }

    public static liftoffRecordEventPurchase_IOS(event: string): void {
        cc.log("liftoffRecordEventPurchase_IOS start", event);
        jsb.reflection.callStaticMethod("AppController", "liftoffRecordEventPurchase:", event);
        cc.log("liftoffRecordEventPurchase_IOS end");
    }

    public static showCMPPopup_IOS(): void {
        cc.log("showCMPPopup_IOS start");
        jsb.reflection.callStaticMethod("AppController", "showCMPPopup","");
        cc.log("showCMPPopup_IOS end");
    }

    public static isContentFlowUserGeography_IOS(): boolean {
        cc.log("isContentFlowUserGeography_IOS start");
        const res = jsb.reflection.callStaticMethod("AppController", "isConsentFlowUserGeography","");
        cc.log("isContentFlowUserGeography_IOS result " + res);
        return res;
    }
}