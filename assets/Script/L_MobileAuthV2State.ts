import DeleteAccount_Cancle_Popoup from "./DeleteAccount_Cancle_Popoup";
import FireHoseSender, { FHLogType } from "./FireHoseSender";
import HRVServiceUtil from "./HRVService/HRVServiceUtil";
import LoginProcess from "./LoginProcess";
import MobileDeviceHelper from "./MobileDeviceHelper";
import Analytics from "./Network/Analytics";
import CommonServer, { AppleAuth, Auth2Req, AuthError, FacebookAuth } from "./Network/CommonServer";
import CommonPopup from "./Popup/CommonPopup";
import ServiceInfoManager from "./ServiceInfoManager";
import State from "./Slot/State";
import TermsPopup_HighRoller from "./TermsPopup_HighRoller";
import UserInfo from "./User/UserInfo";
import AsyncHelper from "./global_utility/AsyncHelper";
import EntrancePathManager from "./global_utility/EntrancePathManager";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";
import LocalStorageManager from "./manager/LocalStorageManager";
import PopupManager from "./manager/PopupManager";

const { ccclass, property } = cc._decorator;


/**
 * 移动端V2版本授权状态类
 * 负责移动端专属的登录授权逻辑：支持Facebook/Apple/游客登录，区分手动/自动登录流程，处理账号绑定、条款弹窗、异常容错等
 */
@ccclass()
export default class L_MobileAuthV2State extends State {
    // ===== 类属性 =====
    private appleToken: string = "";
    private linkableFacebook: boolean = false;
    private linkFacebookInfo: FacebookAuth | null = null;
    private linkableAppleLogin: boolean = false;
    //private linkAppleInfo: AppleLoginResult | null = null;
    private linkableLine: boolean = false;

    /**
     * 启动授权状态
     */
    public onStart(): void {
        cc.log("L_MobileAuthV2State start");
        this._done = false;
        this.doProcess();
    }

    /**
     * 授权核心处理逻辑
     */
    public async doProcess(): Promise<void> {
        try {
            Analytics.mobileAuthStateStart();
            
            // 1. 获取设备登录信息，校验audid有效性
            const loginInfo = MobileDeviceHelper.Instance.getLoginInfo();
            if (loginInfo.audid === "") {
                const error = new Error(`Auth V2 get audid fail [${JSON.stringify(loginInfo)}]`);
                FireHoseSender.Instance().sendAws(
                    FireHoseSender.Instance().getRecord(FHLogType.Exception, error),
                    true,
                    FHLogType.Exception
                );
                return;
            }

            // 2. 同步UDID（若不一致则更新）
            const udid = await LoginProcess.Instance().getUdid();
            if (udid !== loginInfo.udid) {
                cc.log("set Device ID", udid);
                loginInfo.udid = udid;
                MobileDeviceHelper.Instance.setLoginInfoUdid(loginInfo.udid);
            }

            // 3. 区分手动/自动登录流程
            let loginSuccess = false;
            if (loginInfo.uid !== 0) {
                // 已有UID：自动登录
                loginSuccess = await this.asyncAutoLogin(loginInfo);
            } else {
                // 无UID：手动登录（等待用户选择登录方式）
                loginSuccess = await this.asyncManualLogin(loginInfo);
            }

            // 4. 登录成功后完成状态
            if (loginSuccess) {
                LoginProcess.Instance().showSlotBG();
                Analytics.mobileAuthStateComplete();
                this.setDone();
            }
        } catch (error) {
            // 全局异常捕获并上报
            FireHoseSender.Instance().sendAws(
                FireHoseSender.Instance().getRecord(FHLogType.Exception, error)
            );
        }
    }

    /**
     * 手动登录流程（用户选择登录方式）
     * @param loginInfo 设备登录信息
     * @returns 登录是否成功
     */
    private async asyncManualLogin(loginInfo: any): Promise<boolean> {
        let loginType = 0;
        let loginCompleted = false;

        while (!loginCompleted) {
            cc.log("waitUntilLoginSelect start ", loginType);
            // // 等待用户选择登录方式（Facebook/Apple/游客）
            // loginType = await LoginProcess.Instance().waitUntilLoginSelect();
            // cc.log("loginType is ", loginType);

            // // 1. 构建授权请求参数
            // const authReq = new Auth2Req();
            // authReq.uid = loginInfo.uid;
            // authReq.audid = loginInfo.audid;
            // authReq.udid = loginInfo.udid;
            // authReq.entrancePath = EntrancePathManager.Instance().entrancePath;
            // authReq.waccessDate = Utility.getWebAccessDate();
            // authReq.clientVersion = Utility.getClientVersion();
            // authReq.serviceType = TSUtility.getServiceType();
            // authReq.market = TSUtility.getMarketType();
            // authReq.oneSignalPlayerId = AppPushManager.Instance().getPlayerId();
            // authReq.appsflyerUID = NativeUtil.NativeUtil.getAppsFlyerUID();

            let authReady = false;
            // let appleLoginResult: AppleLoginResult | null = null;

            // 2. 根据登录类型处理授权信息
            switch (loginType) {
                case SDefine.LOGINTYPE_FACEBOOK:
                    // // Facebook登录
                    // cc.log("facebookLogin call");
                    // const fbLoginRes = await FacebookUtil.loginSync();
                    // if (fbLoginRes === null) {
                    //     cc.log("facebookLogin fail");
                    //     loginType = 0;
                    //     continue;
                    // }
                    // // 填充Facebook授权信息
                    // authReq.facebookAuth = new FacebookAuth();
                    // authReq.facebookAuth.id = FacebookUtil.m_fbid;
                    // authReq.facebookAuth.token = FacebookUtil.m_fbAccessToken;
                    // FacebookAuth.getPermissionList(null);
                    // FacebookUtil.removeAppRequests();
                    // TSUtility.setPlatformInfo(FacebookUtil.m_fbid, SDefine.AccSite_Facebook);
                    // Analytics.fbAuthComplete();
                    authReady = true;
                    break;

                case SDefine.LOGINTYPE_GUEST:
                    // 游客登录（无需额外授权信息）
                    cc.log("do guest login SDefine.LOGINTYPE_GUEST");
                    authReady = true;
                    break;

                case SDefine.LOGINTYPE_APPLE:
                    // Apple登录
                    cc.log("Apple login call");
                    // appleLoginResult = await AppleLoginHelper.Instance.asyncRequestAppleLogin();
                    // if (appleLoginResult === null || appleLoginResult.errorCode !== 0) {
                    //     cc.log("Apple login fail", JSON.stringify(appleLoginResult));
                    //     loginType = 0;
                    //     continue;
                    // }
                    // // 填充Apple授权信息
                    // authReq.appleAuth = new AppleAuth();
                    // authReq.appleAuth.id = appleLoginResult.user;
                    // authReq.appleAuth.token = appleLoginResult.identityToken;
                    // authReq.appleEmail = appleLoginResult.email;
                    // authReq.appleName = `${appleLoginResult.givenName} ${appleLoginResult.familyName}`;
                    // this.appleToken = appleLoginResult.identityToken;
                    // authReady = true;
                    // TSUtility.setPlatformInfo(appleLoginResult.user, SDefine.AccSite_AppleLogin);
                    break;

                default:
                    cc.error("unknown loginType", loginType);
                    continue;
            }

            // 3. 授权信息未准备好则重试
            if (!authReady) {
                continue;
            }

            // 4. 首次登录显示条款弹窗（非测试模式）
            if (!LocalStorageManager.isOpenFirstTermsPopup() && !TSUtility.isTestDirectSlotMode()) {
                await this.openTermsPopup();
                LocalStorageManager.setOpenFirstTermsPopup();
            }

            // 5. 发送登录请求
            PopupManager.Instance().showDisplayProgress(true);
            let authRes = await CommonServer.Instance().asyncRequestLoginV2("0", 0);
            PopupManager.Instance().showDisplayProgress(false);
            cc.log("Auth Result: ", JSON.stringify(authRes));

            let loginRetrySuccess = false;
            // 6. 处理登录请求错误
            if (CommonServer.isServerResponseError(authRes)) {
                const statusCode = CommonServer.getErrorStatusCode(authRes);
                const errorMsg = CommonServer.getErrorMsg(authRes);
                const authError = AuthError.parseObj(authRes.error);
                
                cc.log("statusCode: ", statusCode, "/ msg: ", errorMsg);
                const error = new Error(
                    `asyncManualLogin fail statusCode:${statusCode} msg:${errorMsg} [error:${JSON.stringify(authError)}][req:${JSON.stringify("")}]`
                );
                FireHoseSender.Instance().sendAws(
                    FireHoseSender.Instance().getRecord(FHLogType.Exception, error),
                    true,
                    FHLogType.Exception
                );

                // Facebook账号不匹配但可绑定的特殊处理
                if (loginType === SDefine.LOGINTYPE_FACEBOOK && authError && authError.code === SDefine.ERR_AuthUIDFacebookIDDoNotMatchButLinkable) {
                    cc.log("Do asyncManualLogin Second Chance");
                    // this.linkFacebookInfo = authReq.facebookAuth;
                    // authReq.facebookAuth = null;
                    
                    // // 重试登录（不带Facebook信息）
                    // const retryRes = await CommonServer.Instance().asyncRequestLoginV2(authReq.uid, authReq);
                    // if (!CommonServer.isServerResponseError(retryRes)) {
                    //     cc.log("Do asyncManualLogin Second Chance success");
                    //     loginRetrySuccess = true;
                    //     this.linkableFacebook = true;
                    //     authRes = retryRes; // 替换为重试成功的响应
                    // } else {
                    //     const retryError = new Error(
                    //         `asyncManualLogin fail second chance [res:${JSON.stringify(retryRes)}][req:${JSON.stringify(authReq)}]`
                    //     );
                    //     FireHoseSender.Instance().sendAws(
                    //         FireHoseSender.Instance().getRecord(FHLogType.Exception, retryError),
                    //         true,
                    //         FHLogType.Exception
                    //     );
                    // }

                    // // 重试失败则登出Facebook
                    // if (!loginRetrySuccess) {
                    //     //await FacebookAuth.logout(() => {});
                    // }
                }

                // 登录失败显示错误弹窗并重试
                if (!loginRetrySuccess) {
                    CommonPopup.authErrorPopup(authError.code);
                    continue;
                }
            }

            // 7. 保存登录状态
            switch (loginType) {
                case SDefine.LOGINTYPE_FACEBOOK:
                    if (!this.linkableFacebook) {
                        loginInfo.facebookLogin = true;
                        MobileDeviceHelper.Instance.setLoginInfoObj(loginInfo);
                    }
                    break;
                case SDefine.LOGINTYPE_APPLE:
                    loginInfo.appleLogin = true;
                    MobileDeviceHelper.Instance.setLoginInfoObj(loginInfo);
                    // AppleLoginHelper.Instance.setLogin(true);
                    // MobileDeviceHelper.Instance.setAppleLoginInfo(appleLoginResult!);
                    break;
            }

            // 8. 授权后处理（获取用户信息、初始化等）
            const afterAuthRes = await this.asyncAfterAuth(authRes);
            if (!afterAuthRes) {
                continue;
            }

            // 9. 标记登录完成
            loginCompleted = true;
        }

        return true;
    }

    /**
     * 打开条款弹窗
     * @returns 弹窗操作完成Promise
     */
    private async openTermsPopup(): Promise<void> {
        return new Promise((resolve) => {
            TermsPopup_HighRoller.getPopup((isCancel: Error, popup: any) => {
                if (isCancel) {
                    resolve();
                } else {
                    popup.setCloseCallback(() => resolve());
                    popup.open();
                }
            });
        });
    }

    /**
     * 自动登录流程（已有UID，无需用户交互）
     * @param loginInfo 设备登录信息
     * @returns 登录是否成功
     */
    private async asyncAutoLogin(loginInfo: any): Promise<boolean> {
        // 1. 构建授权请求参数
        // const authReq = new Auth2Req();
        // authReq.uid = loginInfo.uid;
        // authReq.audid = loginInfo.audid;
        // authReq.udid = loginInfo.udid;
        // authReq.entrancePath = EntrancePathManager.Instance().entrancePath;
        // authReq.waccessDate = Utility.getWebAccessDate();
        // authReq.clientVersion = Utility.getClientVersion();
        // authReq.serviceType = TSUtility.getServiceType();
        // authReq.market = TSUtility.getMarketType();
        // authReq.oneSignalPlayerId = AppPushManager.Instance().getPlayerId();
        // authReq.appsflyerUID = NativeUtil.NativeUtil.getAppsFlyerUID();

        // // 2. Facebook自动登录校验
        // if (loginInfo.facebookLogin === true) {
        //     UserInfo.setCurrentLoginInfo(SDefine.LOGINTYPE_FACEBOOK, loginInfo);
        //     MobileDeviceHelper.Instance.setLoginInfoObj(loginInfo);
            
        //     const fbStatus: FacebookLoginStatus = await FacebookUtil.asyncCheckLoginStatus();
        //     if (fbStatus.status === "connected") {
        //         cc.log("asyncAutoLogin facebook login", JSON.stringify(fbStatus));
        //         authReq.facebookAuth = new FacebookAuth();
        //         authReq.facebookAuth.id = fbStatus.authResponse!.userID;
        //         authReq.facebookAuth.token = fbStatus.authResponse!.accessToken;
        //         FacebookUtil.getPermissionList(null);
        //         FacebookUtil.removeAppRequests();
        //         TSUtility.setPlatformInfo(fbStatus.authResponse!.userID, SDefine.AccSite_Facebook);
        //         Analytics.fbAuthComplete();
        //     } else {
        //         loginInfo.facebookLogin = false;
        //         MobileDeviceHelper.Instance.setLoginInfoObj(loginInfo);
        //     }
        // }

        // // 3. Apple自动登录校验
        // if (loginInfo.appleLogin === true) {
        //     UserInfo.setCurrentLoginInfo(SDefine.LOGINTYPE_APPLE, loginInfo);
        //     MobileDeviceHelper.Instance.setLoginInfoObj(loginInfo);
            
        //     if (NativeUtil.NativeUtil.isSupportAppleLogin() === 1) {
        //         const appleLoginInfo = MobileDeviceHelper.Instance.getAppleLoginInfo();
        //         if (appleLoginInfo === null) {
        //             cc.log("not found appleLogin info");
        //             loginInfo.appleLogin = false;
        //             MobileDeviceHelper.Instance.setLoginInfoObj(loginInfo);
        //         } else if (appleLoginInfo.errorCode !== 0) {
        //             cc.log("appleLoginInfo info fail", JSON.stringify(appleLoginInfo));
        //             loginInfo.appleLogin = false;
        //             MobileDeviceHelper.Instance.setLoginInfoObj(loginInfo);
        //         } else {
        //             const appleLoginState = await AppleLoginHelper.Instance.asyncGetAppleLoginState(appleLoginInfo.user);
        //             if (appleLoginState === 1) {
        //                 cc.log("asyncAutoLogin apple login", JSON.stringify(appleLoginInfo));
        //                 AppleLoginHelper.Instance.setLogin(true);
        //                 authReq.appleAuth = new AppleAuth();
        //                 authReq.appleAuth.id = appleLoginInfo.user;
        //                 TSUtility.setPlatformInfo(appleLoginInfo.user, SDefine.AccSite_AppleLogin);
        //             }
        //         }
        //     }
        // }

        // 4. 发送自动登录请求
        let authRes = await CommonServer.Instance().asyncRequestAutoAuthV2("0", "0");
        cc.log("Auth Result: ", JSON.stringify(authRes));

        // 5. 处理自动登录错误
        if (CommonServer.isServerResponseError(authRes)) {
            cc.log("Error Popup");
            const statusCode = CommonServer.getErrorStatusCode(authRes);
            const errorMsg = CommonServer.getErrorMsg(authRes);
            const authError = AuthError.parseObj(authRes.error);

            // AUDID为空特殊处理：重置登录信息并重启
            if (authError && authError.code === SDefine.ERR_AuthAccountsAUDIDIsEmpty) {
                // await FacebookUtil.logout(() => {});
                // if (NativeUtil.NativeUtil.isSupportAppleLogin()) {
                //     MobileDeviceHelper.Instance.removeAppleLoginInfo();
                // }
                // loginInfo.resetLoginInfo();
                // MobileDeviceHelper.Instance.setLoginInfoObj(loginInfo);
                HRVServiceUtil.restartGame();
                return false;
            }

            // 通用错误处理
            cc.log("statusCode: ", statusCode, "/ msg: ", errorMsg);
            const error = new Error(
                `asyncAutoLogin fail statusCode:${statusCode} msg:${errorMsg} [error:${JSON.stringify(authError)}][req:${JSON.stringify("authReq")}]`
            );
            FireHoseSender.Instance().sendAws(
                FireHoseSender.Instance().getRecord(FHLogType.Exception, error),
                true,
                FHLogType.Exception
            );

            // 错误弹窗关闭后尝试游客登录
            const popupClose = await CommonPopup.asyncAuthErrorPopupClose(authError.code);
            if (!popupClose) {
                TSUtility.endGame();
                return false;
            }

            cc.log("asyncAutoLogin play as guest");
            // 清空第三方授权信息，以游客身份重试
            // authReq.facebookAuth = null;
            // authReq.appleAuth = null;
            // authReq.lineAuth = null;
            
            const guestAuthRes = await CommonServer.Instance().asyncRequestAutoAuthV2("0", 0);
            if (CommonServer.isServerResponseError(guestAuthRes)) {
                await CommonPopup.asyncAuthErrorPopupClose(authError.code);
                TSUtility.endGame();
                return false;
            }

            // 游客登录成功，重置登录状态
            if (loginInfo.facebookLogin) {
                // await FacebookUtil.logout(() => {});
            }
            if (loginInfo.appleLogin) {
                // AppleLoginHelper.Instance.setLogin(false);
            }
            loginInfo.setGuestLogin();
            MobileDeviceHelper.Instance.setLoginInfoObj(loginInfo);
            authRes = guestAuthRes;
        }

        // 6. 授权后处理
        return this.asyncAfterAuth(authRes);
    }

    /**
     * 授权成功后后续处理（获取用户信息、初始化等）
     * @param authRes 授权响应数据
     * @returns 处理是否成功
     */
    private async asyncAfterAuth(authRes: any): Promise<boolean> {
        try {
            const isNewUser = authRes.isNewUser === 1;
            
            // 1. 保存授权信息
            CommonServer.Instance().setAuthInfo(authRes.uid, authRes.accessToken.token);
            LoginProcess.Instance().setAuthFBMergeInfo(authRes);
            const userId = authRes.uid;
            const accessToken = authRes.accessToken.token;
            const abTestKeys = TSUtility.isValid(authRes.abTestKey) ? authRes.abTestKey : [];
            
            // AB测试分段处理
            if (TSUtility.isValid(authRes.abSegment)) {
                authRes.abSegment;
            }

            // 移动端Appsflyer/Facebook Crash用户标识
            if (Utility.isMobileGame()) {
                // NativeUtil.NativeUtil.setAppsflyerCustomerUserId(userId.toString());
                // NativeUtil.NativeUtil.setUserIdentifier_FBCrash(userId.toString());
            }

            // 标记Epic Win Offer目标用户
            for (const key of abTestKeys) {
                if (key === SDefine.EPICWIN_OFFERKEY) {
                    ServiceInfoManager.BOOL_EPIC_WIN_OFFER_TARGET = true;
                }
            }

            // 2. 清理本地存储的旧登录信息
            LocalStorageManager.removeDeviceInfoFromStorage();
            LocalStorageManager.clearLocalUserLoginInfo();
            //MobileDeviceHelper.Instance.setLoginInfo(userId);
            const extraInfo = authRes.extraInfo;

            // 3. 更新进度并获取用户详细信息
            LoginProcess.Instance().onProgress("Authenticating ...", 0.3);
            const userInfoRes = await CommonServer.Instance().getUserInfo(userId);
            cc.log("UserInfo Result: ", JSON.stringify(userInfoRes));

            // 4. 校验用户信息响应错误
            if (CommonServer.isServerResponseError(userInfoRes)) {
                CommonPopup.loginErrorPopup("Get UserInfo fail.");
                const statusCode = CommonServer.getErrorStatusCode(userInfoRes);
                const errorMsg = CommonServer.getErrorMsg(userInfoRes);
                throw new Error(`getUserInfo fail code:${statusCode} msg:${errorMsg}`);
            }

            // 5. 初始化用户信息实例
            const userInfoInit = UserInfo.setInstance(userInfoRes, accessToken);
            if (!userInfoInit) {
                const accountStatus = ServiceInfoManager.NUMBER_ACCOUNT_STATUS;
                // 账号状态98：删除账号确认弹窗
                if (accountStatus === 98) {
                    DeleteAccount_Cancle_Popoup.getPopup((isCancel: Error, popup: any) => {
                        if (isCancel) {
                            TSUtility.endGame();
                            return false;
                        }
                        popup.open();
                    });
                } 
                // 其他异常账号状态：显示支持弹窗
                else if (accountStatus !== 0) {
                    CommonPopup.getCommonPopup((isCancel: Error, popup: any) => {
                        popup.open()
                            .setInfo("WARNING", "Faulty authentication information.\nIf the error persists, please tap the 'SUPPORT' button.")
                            .setOkBtn("SUPPORT", () => {
                                //UserInfo.goCustomerSupport();
                            });
                    });
                } 
                // 基础授权失败
                else {
                    CommonPopup.loginErrorPopup(`${userId} ${accessToken}`);
                }
                return false;
            }

            // 6. 新用户统计
            if (isNewUser) {
                Analytics.newUserRegistraion();
                Analytics.completeRegistration();
            }

            // // 7. 初始化用户状态
            // UserInfo.instance().setLocation("Login");
            // UserInfo.instance().setGameId("");
            // UserInfo.instance().resetTourneyTier();

            Analytics.authComplete(userId);
            LoginProcess.Instance().showSneakpeekMark();

            // // 8. 持久化用户信息
            // LocalStorageManager.setUserUID(UserInfo.instance().getUid());
            // LocalStorageManager.setAccessToken(UserInfo.instance().getAccessToken());

            // 移动端Appsflyer转化数据回调
            if (Utility.isMobileGame()) {
                //UserInfo.instance().setAppsflyerConversionDataCallback();
            }

            // 初始化用户信息相关配置
            //SDefine.InitAfterGetUserInfo(UserInfo.instance().getUid());

            // 9. 连续登录&会话统计
            const streakedJoinInfo = UserInfo.instance().getUserStreakedJoinInfo();
            Analytics.stackedEnter(streakedJoinInfo.all_Count);
            if (UserInfo.instance().getUserSessionCnt() === 7) {
                Analytics.sessionCount(7);
            }

            // 10. 设置分享信息
            LoginProcess.Instance().setShareInfo();

            // 11. Facebook账号绑定检查
            if (this.linkableFacebook) {
                const linkRes = await UserInfo.instance().checkAndAccountLinkFacebook();
                if (linkRes) {
                    return false;
                }
                await AsyncHelper.delayWithComponent(0.1, UserInfo.instance());
            }

            // 12. 移动端更新奖励处理
            const updateReward = LocalStorageManager.getUpdateReward();
            if (Utility.isMobileGame() && updateReward >= 0 && !ServiceInfoManager.instance.isRequireUpgrade()) {
                CommonServer.Instance().requestAcceptPromotion(
                    UserInfo.instance().getUid(),
                    UserInfo.instance().getAccessToken(),
                    "MobileUpdateRewardPromotion",
                    updateReward,
                    0,
                    "",
                    null
                );
                LocalStorageManager.setUpdateReward(-1);
            }

            // // 13. 商店数据校验
            // cc.log("TimeCheck compareShopItemIDandJson start");
            // const shopItemError = ShopDataManager.Instance().compareShopItemIDandJson();
            // if (shopItemError !== "") {
            //     CommonPopup.getCommonPopup((isCancel: boolean, popup: any) => {
            //         if (shopItemError === "null") {
            //             popup.setInfo("Null Exception", "Item of _itemKeyProductMaps is null");
            //         } else {
            //             popup.setInfo("No Data From Json", `Json file is not have ProductID : ${shopItemError}`);
            //         }
            //     });
            // }
            // cc.log("TimeCheck compareShopItemIDandJson end");

            return true;
        } catch (error) {
            throw error;
        }
    }
}