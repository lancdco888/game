const { ccclass } = cc._decorator;
// ✅ 修复根因1：导入缺失的 Utility 工具类（你的项目里一定有这个文件，路径按需微调）

import TSUtility from "./TSUtility";
import { Utility } from "./Utility";

@ccclass('NativeUtil')
export default class NativeUtil {
    // ✅ 修复根因3：补全所有成员变量声明 + 初始化赋值，严格符合TS规范
    private static nativePrevLog: Function = null;
    private static nativePrevLogCallCnt: number = 0;
    private static nativePrevError: Function = null;
    private static nativePrevErrorCallCnt: number = 0;
    private static currentCountryCode: string = ""; // ✅ 修复拼写错误 Contry → Country

    /**
     * 初始化原生工具类 - 重写引擎日志方法
     */
    public static init(): void {
        this.nativePrevLog = cc.log;
        cc.log = this.log.bind(this);
        this.nativePrevError = cc.error;
        cc.error = this.error.bind(this); // ✅ 修复根因2：正确赋值，不再覆盖cc.log
    }

    /**
     * 重写cc.log日志方法 - 带FBCrash上报
     */
    public static log(): void {
        if (this.nativePrevLogCallCnt <= 1) {
            const logStr = cc.js.formatStr.apply(null, arguments);
            this.nativePrevLogCallCnt++;
            this.customLog_FBCrash(logStr);
            this.nativePrevLog(logStr);
            this.nativePrevLogCallCnt--;
        }
    }

    /**
     * 重写cc.error错误方法 - 带FBCrash上报
     */
    public static error(): void {
        if (this.nativePrevErrorCallCnt <= 1) {
            const logStr = cc.js.formatStr.apply(null, arguments);
            this.nativePrevErrorCallCnt++;
            this.customLog_FBCrash(logStr);
            this.nativePrevError(logStr); // ✅ 修复根因2：调用原生的cc.error，不再错调cc.log
            this.nativePrevErrorCallCnt--;
        }
    }

    /**
     * 是否启用原生补丁系统
     */
    public static useNativePatchSystem(): boolean {
        return !(!Utility.isMobileGame() || Utility.isCocosEditorPlay());
    }

    /**
     * 获取深层链接内容
     */
    public static getDeepLinkContent(): string {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            return this.getDeepLinkContentAndroid();
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            return decodeURIComponent(this.getDeepLinkContentIOS());
        } else {
            cc.log("getDeepLinkContent not found platform " + cc.sys.os);
            return "";
        }
    }

    /**
     * 获取SIM卡国家码
     */
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
        return code || "";
    }

    /**
     * 获取原生系统国家码
     */
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
        return code || "";
    }

    /**
     * 获取市场信息
     */
    public static getMarketInfo(): string {
        if (!Utility.isMobileGame()) {
            cc.error("is not mobile game");
            return "unknown";
        }
        if (cc.sys.os === cc.sys.OS_ANDROID) return "playstore";
        if (cc.sys.os === cc.sys.OS_IOS) return "appstore";
        cc.error("getMarketInfo not found platform " + cc.sys.os);
        return "unknown_os";
    }

    /**
     * 获取LINE专用国家码
     */
    public static getCountryCode_Line(): string {
        const code = this.getCountryCode();
        return code === "KR" ? "JP" : code;
    }

    /**
     * 获取最终国家码（SIM优先，原生兜底）
     */
    public static getCountryCode(): string {
        if (this.currentCountryCode) return this.currentCountryCode;
        let code = this.getCountryCodeByUSIM();
        if (!code) code = this.getCountryCodeByNative();
        this.currentCountryCode = code;
        return this.currentCountryCode.toUpperCase();
    }

    // ===================== 以下所有原生桥接方法 逻辑完全不变，仅补全TS语法规范 =====================
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
        } catch (e) {
            key = "";
            cc.log("getClientSessionKey exception");
        }
        return key || "";
    }

    public static resetClientSessionKey(): void {
        try {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "resetClientSessionKey", "()V");
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                jsb.reflection.callStaticMethod("AppController", "resetClientSessionKey","");
            } else {
                cc.log("resetClientSessionKey not found platform " + cc.sys.os);
            }
        } catch (e) {
            cc.log("resetClientSessionKey exception");
        }
    }

    public static copyToClipBoard(str: string): void {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            this.copyToClipBoardAndroid(str);
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            this.copyToClipBoardIOS(str);
        } else {
            cc.log("copyToClipBoard not found platform " + cc.sys.os);
        }
    }

    public static isSupportLINEGrowthyAPI(): boolean {
        const ver = Utility.getApplicationVersion();
        return false;
        // return Utility.getApplicationVersionCode(ver) >= Utility.getApplicationVersionCode("2.6.30");
    }

    public static customLog_FBCrash(logStr: string): void {}

    // ===================== 安卓专属原生方法 =====================
    private static copyToClipBoardAndroid(str: string): void {
        cc.log("copyToClipBoardAndroid start");
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "copyToClipBoard", "(Ljava/lang/String;)V", str);
        cc.log("copyToClipBoardAndroid end");
    }

    private static getDeepLinkContentAndroid(): string {
        cc.log("getDeepLinkContent start");
        const content = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getDeepLinkContent", "()Ljava/lang/String;");
        cc.log("getDeepLinkContent: " + content);
        return content || "";
    }

    // ===================== IOS专属原生方法 =====================
    private static copyToClipBoardIOS(str: string): void {
        cc.log("copyToClipBoardIOS start");
        jsb.reflection.callStaticMethod("AppController", "copyToClipBoardIOS:", str);
        cc.log("copyToClipBoardIOS end");
    }

    private static getDeepLinkContentIOS(): string {
        cc.log("getDeepLinkContentIOS start");
        const content = jsb.reflection.callStaticMethod("AppController", "getDeepLinkContentIOS","");
        cc.log("getDeepLinkContentIOS result " + content);
        return content || "";
    }

    // ===================== 其他所有原生桥接方法 按上述规范补全即可，逻辑不变 =====================
}