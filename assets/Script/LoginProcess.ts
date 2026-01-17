import IntroPopup from "./IntroPopup";
import L_AuthState from "./L_AuthState";
import L_CheckAppEventState from "./L_CheckAppEventState";
import L_CheckWebVersionState from "./L_CheckWebVersionState";
import L_InitLauncher from "./L_InitLauncher";
import L_LoadNextSceneState from "./L_LoadNextSceneState";
import L_LoadSlotBGState from "./L_LoadSlotBGState";
import L_MobileAuthV2State from "./L_MobileAuthV2State";
import L_SetNextSceneInfoState from "./L_SetNextSceneInfoState";
import { AuthFacebookMergeInfo } from "./Network/CommonServer";
import FBInstantUtil from "./Network/FBInstantUtil";
import CommonPopup from "./Popup/CommonPopup";
import AllMightyCouponManager from "./ServiceInfo/AllMightyCouponManager";
import MembersClassBoostUpManager from "./ServiceInfo/MembersClassBoostUpManager";
import MembersClassBoostUpNormalManager from "./ServiceInfo/MembersClassBoostUpNormalManager";
import { SequencialState } from "./Slot/State";
import L_LoadSceneCompleteState from "./State/L_LoadSceneCompleteState";
import UserInfo from "./User/UserInfo";
import EntrancePathManager from "./global_utility/EntrancePathManager";
import NativeUtil from "./global_utility/NativeUtil";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";
import LocalStorageManager from "./manager/LocalStorageManager";
import { SlotTourneyTierType } from "./manager/SlotTourneyManager";

const { ccclass, property } = cc._decorator;

/**
 * 加载背景信息类
 * 存储Slot背景加载相关的配置信息（游戏ID、限时预览、B2B标识等）
 */
export class LoadingBGInfo {
    public gameId: string = "";
    public isSneakpeek: boolean = false;
    public isB2bSlot: boolean = false;
    public startTime: number = 0;
    public endTime: number = 0;

    /**
     * 初始化加载背景数据
     * @param gameId 游戏ID
     * @param isSneakpeek 是否限时预览
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param isB2bSlot 是否B2B Slot（默认false）
     */
    public initData(
        gameId: string,
        isSneakpeek: boolean,
        startTime: number,
        endTime: number,
        isB2bSlot: boolean = false
    ): void {
        this.gameId = gameId;
        this.isSneakpeek = isSneakpeek;
        this.isB2bSlot = isB2bSlot;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}

/**
 * 登录流程管理器（单例）
 * 负责登录全流程的状态机管理、授权信息获取、入口路径处理、登录选择交互等核心逻辑
 */
@ccclass()
export default class LoginProcess {
    // ===== 静态单例属性 =====
    private static _instance: LoginProcess = null;

    // ===== 公共属性 =====
    public selectLoadingBg: LoadingBGInfo = null;
    public introPopup: IntroPopup = null;
    public fbLoginData: { userID: string; accessToken: string } = null;
    public fbInstantData: {
        playerID: string;
        signature: string;
        playerName: string;
        playerPicURL: string;
    } = null;
    public isGuestUser: boolean = false;
    public slotBgItem: cc.Node = null;
    public zoneId: number = 0;
    public sceneName: string = "";
    public isGoToSlot: boolean = false;
    public tourneyID: number = 0;
    public tourneyTier: SlotTourneyTierType = SlotTourneyTierType.INVALID;
    public payloadObj: Record<string, any> = null;
    public authFBMergeInfo: AuthFacebookMergeInfo = null;

    // ===== 私有属性 =====
    private _getUdidCallback: ((code: number, udid: string) => void) = null;

    /**
     * 获取单例实例（懒加载初始化）
     */
    public static Instance(): LoginProcess {
        if (LoginProcess._instance === null) {
            LoginProcess._instance = new LoginProcess();
            LoginProcess._instance.init();
        }
        return LoginProcess._instance;
    }

    /**
     * 初始化登录流程管理器
     */
    public init(): void {
        CommonPopup.getCommonPopup(null);
        this.introPopup = IntroPopup.getIntroPopup();
    }

    /**
     * 设置Facebook登录数据
     * @param data Facebook登录返回数据
     */
    public setFbLoginData(data: { userID: string; accessToken: string }): void {
        this.fbLoginData = data;
    }

    /**
     * 设置Facebook Instant Game登录数据
     * @param data FB Instant登录返回数据
     */
    public setFbInstanceData(
        data: { playerID: string; signature: string; playerName: string; playerPicURL: string }
    ): void {
        this.fbInstantData = data;
    }

    /**
     * 构建登录流程状态机
     * @param param1 状态参数1
     * @param param2 状态参数2
     * @param param3 状态参数3
     * @returns 有序状态机实例
     */
    public getLoginProcessState(
        param1: any,
        param2: any,
        param3: any
    ): SequencialState {
        const stateMachine = new SequencialState();
        let index = 0;


        // 检查Web版本状态
        stateMachine.insert(index, new L_CheckWebVersionState(param1, param2, param3));
        index++;

        // 加载Slot背景状态
        stateMachine.insert(index, new L_LoadSlotBGState());
        // 初始化Launcher状态
        stateMachine.insert(index, new L_InitLauncher());

        // // 未提前初始化FB则在此处插入
        // if (!TSUtility.enableEarlyFBInit()) {
        //     stateMachine.insert(index, new L_FBInitAndLoginState());
        // }

        // 授权状态（区分Mobile Auth V2）
        index++;
        if (!SDefine.Use_Mobile_Auth_v2 && !TSUtility.isTestAudIDMode()) {
            stateMachine.insert(index, new L_AuthState());
        } else {
            stateMachine.insert(index, new L_MobileAuthV2State());
        }

        // 商店促销信息状态
        index++;
        // stateMachine.insert(index, new L_GetShopPromotionInfoState());
        // // 皮肤信息状态
        // stateMachine.insert(index, new L_GetSkinInfoState());
        // // 事件信息状态
        // stateMachine.insert(index, new L_GetEventInfoState());

        // // 收件箱信息状态
        // index++;
        // stateMachine.insert(index, new L_GetInboxInfoState());

        // // 明星相册配置状态
        // index++;
        // stateMachine.insert(index, new L_GetStarAlbumConfigState());

        // // 助推器信息检查状态
        // index++;
        // stateMachine.insert(index, new L_CheckBoosterInfoState());

        // // Slot锦标赛信息状态
        // index++;
        // stateMachine.insert(index, new L_GetSlotTourneyInfoState());
        // // 存储服务信息状态
        // stateMachine.insert(index, new L_GetStorageSeviceInfo());

        // // FB用户合并检查状态
        // index++;
        // stateMachine.insert(index, new L_CheckFBMergeUser());

        // 设置下一场景信息状态
        // index++;
        stateMachine.insert(index, new L_SetNextSceneInfoState());

        // 加载下一场景状态
        index++;
        stateMachine.insert(index, new L_LoadNextSceneState());

        // 加载场景完成状态
        index++;
        stateMachine.insert(index, new L_LoadSceneCompleteState());
        // 检查App事件状态
        stateMachine.insert(index, new L_CheckAppEventState());

        return stateMachine;
    }

    /**
     * 获取授权提交信息（根据平台类型区分）
     * @returns 授权信息对象
     */
    public async getAuthPostInfo(): Promise<Record<string, any> | void> {
        if (Utility.isFacebookWeb()) {
            return this.getAuthPost_FacebookInfo();
        } else if (Utility.isFacebookInstant()) {
            return this.getAuthPost_FBInstantInfo();
        } else {
            cc.error("not found valid authPost Info");
        }
    }

    /**
     * 判断是否游客登录
     * @returns 是否游客
     */
    public isGuest(): boolean {
        return this.isGuestUser;
    }

    /**
     * 设置游客登录标识
     * @param isGuest 是否游客
     */
    public setIsGuest(isGuest: boolean): void {
        this.isGuestUser = isGuest;
    }

    /**
     * 设置下一场景信息
     * @param zoneId 区域ID
     * @param sceneName 场景名称
     * @param isGoToSlot 是否前往Slot
     * @param tourneyID 锦标赛ID
     * @param tourneyTier 锦标赛等级
     */
    public setNextScene(
        zoneId: number,
        sceneName: string,
        isGoToSlot: boolean,
        tourneyID: number,
        tourneyTier: SlotTourneyTierType
    ): void {
        this.zoneId = zoneId;
        this.sceneName = sceneName;
        this.isGoToSlot = isGoToSlot;
        this.tourneyID = tourneyID;
        this.tourneyTier = tourneyTier;
    }

    /**
     * 获取Facebook Web授权提交信息
     * @returns Facebook授权信息对象
     */
    public async getAuthPost_FacebookInfo(): Promise<Record<string, any>> {
        const authInfo: Record<string, any> = {
            uid: 0,
            udid: "",
            fbid: this.fbLoginData.userID,
            fbAccessToken: this.fbLoginData.accessToken,
            waccessDate: Utility.getWebAccessDate(),
            clientVersion: Utility.getClientVersion(),
            serviceType: TSUtility.getServiceType(),
            market: TSUtility.getMarketType(),
            entrancePath: EntrancePathManager.Instance().entrancePath
        };

        cc.log("ENTRANCEPATH:", EntrancePathManager.Instance().entrancePath);

        // 移动端额外信息
        if (Utility.isMobileGame()) {
            const deviceInfo = LocalStorageManager.getLocalDeviceInfo();
            const loginInfo = LocalStorageManager.getLocalUserLoginInfo();
            
            cc.log("localLoginUser ", JSON.stringify(loginInfo));
            
            // authInfo.udid = deviceInfo.udid;
            // authInfo.oneSignalPlayerId = AppPushManager.Instance().getPlayerId();
            // authInfo.appsflyerUID = NativeUtil.getAppsFlyerUID();

            // if (loginInfo) {
            //     authInfo.uid = loginInfo.uid;
            //     authInfo.authToken = {
            //         token: loginInfo.paToken,
            //         tokenType: 0
            //     };
            // }
        }

        return authInfo;
    }

    /**
     * 更新入口路径（根据平台类型区分）
     */
    public async updateEntrancePath(): Promise<void> {
        if (Utility.isFacebookWeb()) {
            this.updateEntrancePath_FacebookWeb();
        } else if (Utility.isFacebookInstant()) {
            await this.updateEntrancePath_Instant();
        } else if (Utility.isMobileGame()) {
            this.updateEntrancePath_Mobile();
        }
    }

    /**
     * 更新Facebook Web端入口路径
     */
    public updateEntrancePath_FacebookWeb(): void {
        if (Utility.isFacebookWeb()) {
            // const pathParams = new EntrancePathManager.PathSearchParams(TSUtility.getQueryString());
            
            // try {
            //     const appConfigPath = TSUtility.getAppConfigEntrancePath();
            //     if (appConfigPath !== "") {
            //         new EntrancePathManager.PathSearchParams(appConfigPath).forEach((value, key) => {
            //             pathParams.append(key, value);
            //         });
            //     }

            //     const payload = TSUtility.getParameterByName("payload", document.location.href);
            //     if (payload !== null && payload !== "") {
            //         this.payloadObj = JSON.parse(payload);
            //         if (this.payloadObj !== null) {
            //             for (const key in this.payloadObj) {
            //                 pathParams.append(key, this.payloadObj[key]);
            //             }
            //         }
            //     }
            //     cc.log("PAYLOAD:", payload);
            // } catch (error) {
            //     cc.error("appConfigEntrancePath process fail");
            // }

            // const pathStr = pathParams.toString();
            // EntrancePathManager.Instance().entrancePath = pathStr ? "?" + pathStr : "";
        } else {
            EntrancePathManager.Instance().entrancePath = "";
        }

        // 测试环境AudID模式处理
        if (TSUtility.isTestAbleSeverMode()) {
            const testAudid = EntrancePathManager.Instance().getTestAudid();
            if (TSUtility.isValid(testAudid) && testAudid !== "") {
                TSUtility.TestAudID = testAudid;
            }

            const directSlotId = EntrancePathManager.Instance().getDirectSlotId();
            if (TSUtility.isValid(directSlotId) && directSlotId !== "") {
                TSUtility.TestDirectSlot = directSlotId;
            }

            if (directSlotId !== "" || testAudid !== "") {
                SDefine.setUseMobileAuth2();
            }
        }
    }

    /**
     * 更新移动端入口路径
     */
    public updateEntrancePath_Mobile(): void {
        // const pathParams = new EntrancePathManager.PathSearchParams("");
        // const deepLink = NativeUtil.getDeepLinkContent();

        // if (deepLink && deepLink !== "") {
        //     pathParams.appendFromQueryString(TSUtility.getQueryStringFromUrl(deepLink));
        // }

        // // App推送相关参数
        // if (1 === AppPushManager.Instance().isReceiveAppPush()) {
        //     cc.log("notificationData", AppPushManager.Instance().getOneSignalNotificationData());
        //     cc.log("additionalData", AppPushManager.Instance().getOneSignalNotiAdditionalData());
            
        //     pathParams.append("hrv_source", "mobile_apppush");
            
        //     const tokenInfo = AppPushManager.Instance().getTokenInfo();
        //     if (pathParams.get("hrv_shareinfo") === null && tokenInfo !== "") {
        //         pathParams.append("hrv_shareinfo", tokenInfo);
        //     }
        // }

        // const pathStr = pathParams.toString();
        // EntrancePathManager.Instance().entrancePath = pathStr ? "?" + pathStr : "";
    }

    /**
     * 更新Facebook Instant Game入口路径
     */
    public async updateEntrancePath_Instant(): Promise<void> {
        const entryPoint = await FBInstantUtil.asyncGetEntryPointAsync();
        cc.log("entryPoint : " + entryPoint);

        // const entryPointData = FBInstant.getEntryPointData();
        // if (entryPointData) {
        //     const entryPointStr = JSON.stringify(entryPointData);
        //     const error = new Error("EntryPoint %s".format(entryPointStr));
        //     FireHoseSender.Instance().sendAws(
        //         FireHoseSender.Instance().getRecord(FireHoseSender.FHLogType.Trace, error),
        //         true,
        //         FireHoseSender.FHLogType.Trace
        //     );
        // }

        // const pathParams = new EntrancePathManager.PathSearchParams("");
        // if (entryPointData) {
        //     for (const key in entryPointData) {
        //         pathParams.append(key, entryPointData[key]);
        //     }
        // }

        // if (TSUtility.getQueryString() !== "") {
        //     pathParams.appendFromQueryString(TSUtility.getQueryString());
        // }

        // if (entryPoint !== "") {
        //     pathParams.append("hrv_entrypoint", entryPoint);
        // }

        // const pathStr = pathParams.toString();
        // EntrancePathManager.Instance().entrancePath = pathStr ? "?" + pathStr : "";
    }

    /**
     * 获取Facebook Instant Game授权提交信息
     * @returns FB Instant授权信息对象
     */
    public async getAuthPost_FBInstantInfo() {
        // const authInfo: Record<string, any> = {
        //     uid: 0,
        //     udid: "",
        //     fbid: this.fbInstantData.playerID,
        //     fbAccessToken: this.fbInstantData.signature,
        //     waccessDate: Utility.getWebAccessDate(),
        //     clientVersion: Utility.getClientVersion(),
        //     fbInstantASID: "",
        //     market: "facebook",
        //     serviceType: TSUtility.getServiceType(),
        //     fbInstantName: this.fbInstantData.playerName,
        //     fbInstantPicURL: this.fbInstantData.playerPicURL,
        //     fbInstantOS: FBInstant.getPlatform(),
        //     entrancePath: EntrancePathManager.Instance().entrancePath
        // };

        // // 获取ASID异步信息
        // await FBInstant.player.getASIDAsync()
        //     .then((asid) => {
        //         if (asid !== null) {
        //             authInfo.fbInstantASID = asid;
        //             TSUtility.setESASID(asid);
        //         }
        //     })
        //     .catch(() => {
        //         authInfo.fbInstantASID = "";
        //     });

        // cc.log("getAuthPost_FBInstantInfo " + this.fbInstantData.playerName + "/" + this.fbInstantData.playerPicURL);
        // return authInfo;
    }

    /**
     * 等待用户选择登录方式（测试模式直接返回游客登录）
     * @returns 登录类型（FB/游客/Apple）
     */
    public async waitUntilLoginSelect(): Promise<string> {
        if (TSUtility.isTestAudIDMode()) {
            return SDefine.LOGINTYPE_GUEST+"";
        } else {
            this.showLoginBtns();
            return new Promise((resolve) => {
                // Facebook登录回调
                this.introPopup.setOnClickFacebookCallback(() => {
                    this.introPopup.resetOnClickCallback();
                    resolve(SDefine.LOGINTYPE_FACEBOOK+"");
                });

                // 游客登录回调
                this.introPopup.setOnClickGuestCallback(() => {
                    cc.log("this.introPopup.setOnClickGuestCallback");
                    this.introPopup.resetOnClickCallback();
                    resolve(SDefine.LOGINTYPE_GUEST+"");
                });

                // Apple登录回调
                this.introPopup.setOnClickAppleLoginCallback(() => {
                    this.introPopup.resetOnClickCallback();
                    resolve(SDefine.LOGINTYPE_APPLE+"");
                });
            });
        }
    }

    /**
     * 显示进度条
     */
    public showProgress(): void {
        this.introPopup.showProgressGroup(true);
        this.introPopup.showLoginBtnGroup(false);
    }

    /**
     * 重置进度条
     */
    public resetProgress(): void {
        this.introPopup.progressBar.reset();
    }

    /**
     * 显示Slot背景
     */
    public showSlotBG(): void {
        this.introPopup.progressBar.reset();
        this.introPopup.showBaseBGLayer(false);
        
        if (this.slotBgItem) {
            this.introPopup.node.addChild(this.slotBgItem);
            this.slotBgItem.setSiblingIndex(this.introPopup.progressBar.node.getSiblingIndex());
            this.slotBgItem.active = true;
            this.slotBgItem.opacity = 0;
            
            // 淡入动画
            this.slotBgItem.runAction(cc.sequence(
                cc.delayTime(0.25),
                cc.fadeIn(0.5)
            ));
        }
    }

    /**
     * 显示限时预览标识（区分HighRoller/MajorRoller）
     */
    public showSneakpeekMark(): void {
        if (this.selectLoadingBg.isB2bSlot) {
            // B2B Slot隐藏所有标识
            this.introPopup.highrollerMark_Node.active = false;
            this.introPopup.majorRolloerMark_Node.active = false;
        } else if (!this.selectLoadingBg.isSneakpeek) {
            // // 非限时预览，根据用户等级显示标识
            // let zoneId = SDefine.HIGHROLLER_ZONEID;
            // const maxCasino = UserInfo.instance().getMaximumPassableCasino();
            // zoneId = Math.min(UserInfo.instance().getlastPlayZoneID(), maxCasino);

            // // VIP等级判断
            // const isVip = UserInfo.instance().getUserVipInfo().level > 0;
            // const hasMajorRollerTicket = UserInfo.instance().hasMajorRollerFreeTicket();
            // const isHighBet = UserInfo.instance().getLastTotalBet() >= 120000;

            // if ((isVip && isHighBet) || (hasMajorRollerTicket && isHighBet)) {
            //     zoneId = SDefine.VIP_LOUNGE_ZONEID;
            // }

            // this.introPopup.highrollerMark_Node.active = zoneId === SDefine.HIGHROLLER_ZONEID;
            // this.introPopup.majorRolloerMark_Node.active = zoneId !== SDefine.HIGHROLLER_ZONEID;
        } else {
            // 限时预览显示MajorRoller标识
            this.introPopup.highrollerMark_Node.active = false;
            this.introPopup.majorRolloerMark_Node.active = true;
        }
    }

    /**
     * 设置分享信息（处理优惠券、FB Canvas参数等）
     */
    public setShareInfo(): void {
        // Web端页面卸载回调
        if (Utility.isFacebookWeb() || Utility.isFacebookInstant()) {
            // window.onbeforeunload = UserInfo.instance().onBeforeUnloadWeb.bind(UserInfo.instance());
        }

        // Facebook Web端Canvas参数设置
        if (Utility.isFacebookWeb()) {
            // if (typeof SetFBCanvasContactForm === "function") {
            //     // SetFBCanvasContactForm("ID_UID", UserInfo.instance().getUid());
            //     // SetFBCanvasContactForm("ID_FBID", UserInfo.instance().getFBID());
            //     // SetFBCanvasContactForm("ID_NAME", UserInfo.instance().getUserName());
            //     // SetFBCanvasContactForm("ID_EMAIL", UserInfo.instance().getEMail());
            //     // SetFBCanvasContactForm("ID_CLIENTVERSION", Utility.getClientVersion());
            //     // SetFBCanvasContactForm("ID_WACCESSDATE", Utility.getWebAccessDate());
            //     // SetFBCanvasContactForm("ID_PLATFORM", TSUtility.getServiceType());
            // } else {
            //     cc.log("not found func SetFBCanvasContactForm");
            // }
        }

        cc.log("setShareInfo");

        // 处理分享信息和优惠券
        let shareInfo = null;
        if (Utility.isFacebookWeb()) {
            shareInfo = this.payloadObj?.hrv_shareinfo || (document && document.location?.href ? EntrancePathManager.Instance().getHRVShareInfo() : null);
        } else {
            shareInfo = EntrancePathManager.Instance().getHRVShareInfo();
        }

        if (shareInfo && shareInfo !== "" && typeof shareInfo !== "undefined") {
            cc.log("SHAREINFO:", shareInfo);
            try {
                const decoded = TSUtility.atob(shareInfo);
                // const shareData = FBShareSubInfo.parse(JSON.parse(decoded));
                
                // cc.log("setShareInfo fbShareInfo", JSON.stringify(shareData));
                // if (shareData.puid !== UserInfo.instance().getUid()) {
                //     cc.log("setShareInfo setCouponID", JSON.stringify(shareData));
                //     UserInfo.instance().setCouponID(shareData.cid);
                // }
            } catch (error) {
                cc.error("exception ", error.toString());
                if ((error as Error).stack) {
                    cc.error("callstack ", (error as Error).stack.toString());
                }
                // FireHoseSender.Instance().sendAws(
                //     FireHoseSender.Instance().getRecord(FireHoseSender.FHLogType.Exception, error),
                // );
            }
        } else if (Utility.isFacebookInstant()) {
            // FB Instant特定活动优惠券
            cc.log("EntrancePatch Log :", EntrancePathManager.Instance().entrancePath);
            if (EntrancePathManager.Instance().entrancePath && 
                EntrancePathManager.Instance().entrancePath.indexOf("fb_instant_game_campaign_id=2384666060041037") !== -1) {
                cc.log("Instant SetCoupon");
                //UserInfo.instance().setCouponID("bti55ri1qacvl36ap4o0");
            }
        }
    }

    /**
     * 显示登录按钮组
     */
    public showLoginBtns(): void {
        this.introPopup.showLoginBtnGroup(true);
        this.introPopup.infoLabel.node.active = false;
        this.introPopup.showProgressGroup(false);
    }

    /**
     * 更新登录进度显示
     * @param text 进度文本
     * @param progress 进度值（0-1）
     */
    public onProgress(text: string, progress: number): void {
        this.showProgress();
        this.introPopup.setInfoText(text);
        this.introPopup.setProgress(progress);
    }

    /**
     * 设置FB用户合并授权信息
     * @param data 合并信息数据
     */
    public setAuthFBMergeInfo(data: { elsMergeInfo?: Record<string, any> }): void {
        if (data.elsMergeInfo !== null) {
            this.authFBMergeInfo = AuthFacebookMergeInfo.parseObj(data.elsMergeInfo);
        }
    }

    /**
     * 获取FB用户合并授权信息
     * @returns 合并信息对象
     */
    public getAuthFBMergeInfo(): AuthFacebookMergeInfo {
        return this.authFBMergeInfo;
    }

    /**
     * 获取设备UDID（区分平台）
     * @returns 设备UDID字符串
     */
    public async getUdid(): Promise<string> {
        if (Utility.isMobileGame()) {
            // if (cc.sys.os === cc.sys.OS_ANDROID) {
            //     // Android通过反射调用原生方法获取GAID
            //     jsb.reflection.callStaticMethod(
            //         "org/cocos2dx/javascript/AppActivity",
            //         "getGoogleAdvertisingId",
            //         "()V"
            //     );

            //     return new Promise((resolve) => {
            //         // cc.log("getUdid called");
            //         // this._getUdidCallback = (code: number, udid: string) => {
            //         //     cc.log("_getUdidCallback called");
            //         //     resolve(udid);
            //         // }.bind(this);
            //         // nativeJSBridge.addBridgeCallback("GetGoogleAd", this._getUdidCallback);
            //     });
            // } else if (cc.sys.os === cc.sys.OS_IOS) {
            //     // iOS直接获取UDID
            //     return NativeUtil.getIOSUdid();
            // } else {
            //     // 其他移动端返回调试UDID
            //     return "pc_debug_udid";
            // }
        } else {
            // 非移动端返回调试UDID
            return "pc_debug_udid";
        }
    }

    /**
     * 检查会员等级提升优惠是否可领取
     */
    public async checkMembersClassBoostUpAccept(): Promise<void> {
        return new Promise((resolve) => {
            cc.log("checkMembersClassBoostUpAccept start");
            const isAvailable = MembersClassBoostUpManager.instance().isMembersBoostUpPromotionAvailable();
            const isRunning = MembersClassBoostUpManager.instance().isRunningMembersBoostUpProcess();
            
            cc.log("isMembersBoostUpAvailable" + isAvailable);
            cc.log("isRunningMembersBoostUp" + isRunning);

            if (isAvailable && !isRunning) {
                MembersClassBoostUpManager.instance().sendAcceptMembersClassBoostUp(() => {
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * 检查全能优惠券是否可领取
     */
    public async checkAllMightyCouponAccept(): Promise<void> {
        return new Promise((resolve) => {
            AllMightyCouponManager.instance().checkAlmightyCouponAccept(() => {
                resolve();
            });
        });
    }

    /**
     * 检查普通会员等级提升扩展优惠是否可领取
     */
    public async checkMembersClassBoostNormalAccept(): Promise<void> {
        return new Promise((resolve) => {
            const isAvailable = MembersClassBoostUpNormalManager.instance().isMembersBoostUpExpandPromotionAvailable();
            const isRunning = MembersClassBoostUpNormalManager.instance().isRunningMembersBoostUpExpandProcess();

            if (isAvailable && !isRunning) {
                MembersClassBoostUpNormalManager.instance().sendAcceptMembersClassBoostUpExpand(() => {
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}