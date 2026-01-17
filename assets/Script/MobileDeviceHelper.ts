import NativeUtil from "./global_utility/NativeUtil";
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";

const { ccclass, property } = cc._decorator;



/**
 * 移动端登录信息数据模型
 * 封装登录相关的核心字段（AUDID/UID/UDID/第三方登录状态）及操作方法
 */
export class MobileLoginInfo {
    // ===== 公共属性 =====
    public audid: string = "";
    public uid: number = 0;
    public udid: string = "";
    public facebookLogin: boolean = false;
    public appleLogin: boolean = false;

    /**
     * 初始化登录信息
     * @param data 登录信息数据对象
     */
    public init(data: Partial<MobileLoginInfo>): void {
        this.audid = data.audid ?? this.audid;
        this.uid = data.uid ?? this.uid;
        if (data.udid !== undefined) this.udid = data.udid;
        if (data.facebookLogin !== undefined) this.facebookLogin = data.facebookLogin;
        if (data.appleLogin !== undefined) this.appleLogin = data.appleLogin;
    }

    /**
     * 重置登录信息（清空UID和第三方登录状态）
     */
    public resetLoginInfo(): void {
        this.uid = 0;
        this.facebookLogin = false;
        this.appleLogin = false;
    }

    /**
     * 设置为游客登录状态（清空第三方登录标记）
     */
    public setGuestLogin(): void {
        this.facebookLogin = false;
        this.appleLogin = false;
    }
}

/**
 * 移动端设备助手类（单例）
 * 负责登录信息的存储/读取、跨平台持久化（iOS钥匙串/Android SharedPreferences）、AUDID生成、Apple登录信息管理
 */
@ccclass()
export default class MobileDeviceHelper {
    // ===== 静态常量 =====
    private static readonly LoginInfoKey: string = "UserLoginInfo_v2";
    private static readonly AppleLoginInfoKey: string = "AppleLoginInfo";
    
    // ===== 单例实例 =====
    private static _instance: MobileDeviceHelper | null = null;
    public static get Instance(): MobileDeviceHelper {
        if (this._instance === null) {
            this._instance = new MobileDeviceHelper();
            this._instance.init();
        }
        return this._instance;
    }

    /**
     * 初始化方法
     */
    public init(): void {
        // 初始化逻辑（原代码无具体实现，保留空方法）
    }

    /**
     * 获取登录信息（优先本地存储 → 持久化存储 → 生成新AUDID）
     * @returns 移动端登录信息对象
     */
    public getLoginInfo(): MobileLoginInfo {
        // 1. 测试AUDID模式：返回测试用登录信息
        if (TSUtility.isTestAudIDMode()) {
            const testLoginInfo = new MobileLoginInfo();
            testLoginInfo.audid = TSUtility.TestAudID;
            testLoginInfo.udid = "test_guest_dummy";
            return testLoginInfo;
        }

        // 2. 从本地存储读取
        const localLoginInfoStr = cc.sys.localStorage.getItem(MobileDeviceHelper.LoginInfoKey);
        if (localLoginInfoStr) {
            try {
                const localLoginInfoObj = JSON.parse(localLoginInfoStr);
                cc.log("getLoginInfo from local storage.", localLoginInfoStr);
                
                const loginInfo = new MobileLoginInfo();
                loginInfo.init(localLoginInfoObj);
                
                // 有效AUDID直接返回（iOS平台特殊异常处理：持久化信息为空时同步）
                if (loginInfo.audid !== "") {
                    if (Utility.isMobileGame() && cc.sys.os === cc.sys.OS_IOS && this._getPersistentLoginInfo() === null) {
                        cc.log("getLoginInfo ios exception status!!!");
                        this._setPersistentLoginInfo(loginInfo);
                    }
                    return loginInfo;
                }
            } catch (error) {
                cc.error("Parse local login info failed", error);
            }
        }

        // 3. 从持久化存储（iOS钥匙串/Android SharedPreferences）读取
        const persistentLoginInfo = this._getPersistentLoginInfo();
        if (persistentLoginInfo) {
            const persistentLoginInfoStr = JSON.stringify(persistentLoginInfo);
            cc.log("getLoginInfo from persistent", persistentLoginInfoStr);
            cc.sys.localStorage.setItem(MobileDeviceHelper.LoginInfoKey, persistentLoginInfoStr);
            return persistentLoginInfo;
        }

        // 4. 生成新的登录信息（含AUDID）
        const newLoginInfo = new MobileLoginInfo();
        newLoginInfo.audid = this._generateAUDID();
        newLoginInfo.uid = 0;
        
        const newLoginInfoStr = JSON.stringify(newLoginInfo);
        cc.log("generate audid", newLoginInfoStr);
        
        // 同步到持久化存储和本地存储
        this._setPersistentLoginInfo(newLoginInfo);
        cc.sys.localStorage.setItem(MobileDeviceHelper.LoginInfoKey, newLoginInfoStr);
        
        return newLoginInfo;
    }

    /**
     * 设置登录信息的UID
     * @param uid 要设置的UID
     * @returns 是否设置成功
     */
    public setLoginInfo(uid: number): boolean {
        const loginInfo = this.getLoginInfo();
        if (loginInfo.uid === uid) return true;

        loginInfo.uid = uid;
        cc.log("setLoginInfo uid", JSON.stringify(loginInfo));
        
        // 同步到持久化存储和本地存储
        this._setPersistentLoginInfo(loginInfo);
        const loginInfoStr = JSON.stringify(loginInfo);
        cc.sys.localStorage.setItem(MobileDeviceHelper.LoginInfoKey, loginInfoStr);
        
        return true;
    }

    /**
     * 设置登录信息的UDID
     * @param udid 要设置的UDID
     */
    public setLoginInfoUdid(udid: string): void {
        const loginInfo = this.getLoginInfo();
        loginInfo.udid = udid;
        cc.log("setLoginInfo udid", JSON.stringify(loginInfo));
        
        // 同步到持久化存储和本地存储
        this._setPersistentLoginInfo(loginInfo);
        const loginInfoStr = JSON.stringify(loginInfo);
        cc.sys.localStorage.setItem(MobileDeviceHelper.LoginInfoKey, loginInfoStr);
    }

    /**
     * 设置完整的登录信息对象
     * @param loginInfo 登录信息对象
     * @returns 是否设置成功
     */
    public setLoginInfoObj(loginInfo: MobileLoginInfo): boolean {
        cc.log("setLoginInfoObj", JSON.stringify(loginInfo));
        
        // 同步到持久化存储和本地存储
        this._setPersistentLoginInfo(loginInfo);
        const loginInfoStr = JSON.stringify(loginInfo);
        cc.sys.localStorage.setItem(MobileDeviceHelper.LoginInfoKey, loginInfoStr);
        
        return true;
    }

    // /**
    //  * 设置Apple登录信息（iOS钥匙串）
    //  * @param appleLoginInfo Apple登录信息
    //  * @returns 处理后的Apple登录信息
    //  */
    // public setAppleLoginInfo(appleLoginInfo: AppleLoginInfo): AppleLoginInfo {
    //     // 读取原有Apple登录信息（补充空字段）
    //     const prevAppleLoginInfoStr = NativeUtil.NativeUtil.getKeychainItemInfo_IOS(MobileDeviceHelper.AppleLoginInfoKey);
    //     if (prevAppleLoginInfoStr !== "") {
    //         cc.log("setAppleLoginInfo prevInfo", prevAppleLoginInfoStr);
    //         const prevAppleLoginInfo = AppleLoginInfo.parseJsonStr(prevAppleLoginInfoStr);
            
    //         // 补充空字段（保持原有信息）
    //         if (prevAppleLoginInfo.user === appleLoginInfo.user) {
    //             if (appleLoginInfo.familyName === "" && prevAppleLoginInfo.familyName !== "") {
    //                 appleLoginInfo.familyName = prevAppleLoginInfo.familyName;
    //             }
    //             if (appleLoginInfo.givenName === "" && prevAppleLoginInfo.givenName !== "") {
    //                 appleLoginInfo.givenName = prevAppleLoginInfo.givenName;
    //             }
    //             if (appleLoginInfo.email === "" && prevAppleLoginInfo.email !== "") {
    //                 appleLoginInfo.email = prevAppleLoginInfo.email;
    //             }
    //         }
    //     }

    //     // 保存到iOS钥匙串
    //     const appleLoginInfoStr = JSON.stringify(appleLoginInfo);
    //     cc.log("setAppleLoginInfo newInfo", appleLoginInfoStr);
    //     //NativeUtil.NativeUtil.setKeychainItemInfo_IOS(MobileDeviceHelper.AppleLoginInfoKey, appleLoginInfoStr);
        
    //     return appleLoginInfo;
    // }

    /**
     * 获取Apple登录信息（仅iOS平台）
     * @returns Apple登录信息 | null
     */
    public getAppleLoginInfo(): any | null {
        // // 非iOS平台直接返回null
        // if (cc.sys.os !== cc.sys.OS_IOS) {
        //     cc.log("getAppleLoginInfo invalid platform", cc.sys.os);
        //     return null;
        // }

        // // 从iOS钥匙串读取
        // const appleLoginInfoStr = NativeUtil.NativeUtil.getKeychainItemInfo_IOS(MobileDeviceHelper.AppleLoginInfoKey);
        // if (appleLoginInfoStr === "") {
        //     cc.log("getAppleLoginInfo empty");
        //     return null;
        // }

        // return AppleLoginInfo.parseJsonStr(appleLoginInfoStr);
    }

    /**
     * 移除登录信息（本地存储+持久化存储）
     */
    public removeLoginInfo(): void {
        cc.sys.localStorage.removeItem(MobileDeviceHelper.LoginInfoKey);
        this._removePersistentLoginInfo();
    }

    /**
     * 移除Apple登录信息（iOS钥匙串）
     */
    public removeAppleLoginInfo(): void {
        // if (NativeUtil.isSupportAppleLogin() === 1) {
        //     NativeUtil.setKeychainItemInfo_IOS(MobileDeviceHelper.AppleLoginInfoKey, "");
        // }
    }

    // ===== 私有方法 =====

    /**
     * 从持久化存储读取登录信息
     * - iOS: 钥匙串 | Android: SharedPreferences | Windows: null
     * @returns 登录信息 | null
     */
    private _getPersistentLoginInfo(): MobileLoginInfo | null {
        // 非移动端直接返回null
        if (!Utility.isMobileGame()) return null;

        let persistentLoginInfoStr = "";
        switch (cc.sys.os) {
            // case cc.sys.OS_IOS:
            //     persistentLoginInfoStr = NativeUtil.getKeychainItemInfo_IOS(MobileDeviceHelper.LoginInfoKey);
            //     break;
            // case cc.sys.OS_ANDROID:
            //     persistentLoginInfoStr = NativeUtil.getSharedPreferencesInfo_AOS(MobileDeviceHelper.LoginInfoKey);
            //     break;
            case cc.sys.OS_WINDOWS:
                cc.log("_getPersistentLoginInfo debug window", cc.sys.os);
                return null;
            default:
                cc.error("_getPersistentLoginInfo invalid platform", cc.sys.os);
                return null;
        }

        // 空字符串表示无数据
        if (persistentLoginInfoStr === "") return null;

        try {
            const persistentLoginInfoObj = JSON.parse(persistentLoginInfoStr);
            const loginInfo = new MobileLoginInfo();
            loginInfo.init(persistentLoginInfoObj);
            return loginInfo;
        } catch (error) {
            cc.error("Parse persistent login info failed", error);
            return null;
        }
    }

    /**
     * 将登录信息写入持久化存储
     * - iOS: 钥匙串 | Android: SharedPreferences | Windows: 仅日志
     * @param loginInfo 登录信息对象
     */
    private _setPersistentLoginInfo(loginInfo: MobileLoginInfo): void {
        // 非移动端不处理
        if (Utility.isMobileGame()) return;

        const loginInfoStr = JSON.stringify(loginInfo);
        switch (cc.sys.os) {
            // case cc.sys.OS_IOS:
            //     NativeUtil.setKeychainItemInfo_IOS(MobileDeviceHelper.LoginInfoKey, loginInfoStr);
            //     break;
            // case cc.sys.OS_ANDROID:
            //     NativeUtil.setSharedPreferencesInfo_AOS(MobileDeviceHelper.LoginInfoKey, loginInfoStr);
            //     break;
            case cc.sys.OS_WINDOWS:
                cc.log("_setPersistentLoginInfo debug window", loginInfoStr);
                break;
        }
    }

    /**
     * 移除持久化存储的登录信息
     * - iOS: 清空钥匙串 | Android: 清空SharedPreferences | Windows: 仅日志
     */
    private _removePersistentLoginInfo(): void {
        // 非移动端不处理
        if (Utility.isMobileGame()) return;

        switch (cc.sys.os) {
            // case cc.sys.OS_IOS:
            //     NativeUtil.setKeychainItemInfo_IOS(MobileDeviceHelper.LoginInfoKey, "");
            //     break;
            // case cc.sys.OS_ANDROID:
            //     NativeUtil.setSharedPreferencesInfo_AOS(MobileDeviceHelper.LoginInfoKey, "");
            //     break;
            case cc.sys.OS_WINDOWS:
                cc.log("_removePersistentLoginInfo debug window");
                break;
        }
    }

    /**
     * 生成AUDID（设备唯一标识）
     * - iOS: CFUUID | Android: SSAID | Windows: 随机数 | 其他: 空字符串
     * @returns AUDID字符串
     */
    private _generateAUDID(): string {
        // 非移动端返回空
        if (!Utility.isMobileGame()) return "";

        switch (cc.sys.os) {
            // case cc.sys.OS_IOS:
            //     return NativeUtil.getCFUUID_IOS();
            // case cc.sys.OS_ANDROID:
            //     return NativeUtil.getSSAID_AOS();
            case cc.sys.OS_WINDOWS:
                return (1e9 * Math.random()).toString();
            default:
                cc.error("_generateAUDID invalid platform", cc.sys.os);
                return "";
        }
    }
}