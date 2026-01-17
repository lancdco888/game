import FireHoseSender, { FHLogType } from "./FireHoseSender";
import LoginProcess from "./LoginProcess";
import Analytics from "./Network/Analytics";
import CommonServer from "./Network/CommonServer";
import CommonPopup from "./Popup/CommonPopup";
import ServiceInfoManager from "./ServiceInfoManager";
import State from "./Slot/State";
import UserInfo from "./User/UserInfo";
import EntrancePathManager from "./global_utility/EntrancePathManager";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";
import LocalStorageManager from "./manager/LocalStorageManager";
import PopupManager from "./manager/PopupManager";

const { ccclass, property } = cc._decorator;

// 导入依赖模块
// import { State } from "../../../slot_common/Script/State";
// import CommonServer from "../../Network/CommonServer";
// import LoginProcess from "../../Login/LoginProcess";
// import LocalStorageManager from "../../../global_utility/LocalStorageManager";
// import CommonPopup from "../../Popup/CommonPopup";
// import ServiceInfoManager from "../../ServiceInfo/ServiceInfoManager";
// import UserInfo from "../../User/UserInfo";
// import SDefine from "../../../global_utility/SDefine";
// import TSUtility from "../../../global_utility/TSUtility";
// import ShopDataManager from "../../Utility/ShopDataManager";
// import FireHoseSender from "../../../global_utility/Network/FireHoseSender";
// import FacebookUtil from "../../Network/FacebookUtil";
// import PopupManager from "../../../slot_common/Script/Popup/PopupManager";
// import Analytics from "../../Network/Analytics";
// import InstantGifMaker from "../../Popup/InstantGifMaker";
// import DeleteAccount_Cancle_Popoup from "../../Popup/Option/DeleteAccount_Cancle_Popoup";
// import EntrancePathManager from "../../Utility/EntrancePathManager";
// import HRVServiceUtil from "../../HRVService/HRVServiceUtil";


/**
 * 授权状态类
 * 负责登录流程中的核心授权逻辑：获取授权信息、发送授权请求、校验授权结果、获取用户信息、处理授权异常等
 */
@ccclass()
export default class L_AuthState extends State {
    /**
     * 启动授权状态
     */
    public onStart(): void {
        this._done = false;
        LoginProcess.Instance().showSlotBG();
        this.doProcess();
    }

    /**
     * 授权核心处理逻辑
     */
    public async doProcess(): Promise<void> {
        try {
            // 1. 初始化授权状态，更新进度显示
            //Analytics.authStateStart();
            LoginProcess.Instance().onProgress("Authenticating ...", 0.2);

            // // 2. 获取授权提交信息（区分不同登录平台）
            // const authPostInfo = await LoginProcess.Instance().getAuthPostInfo() as any;
            // const initialUid = authPostInfo.uid;
            // authPostInfo.isRenewal = true; // 标记为续期授权

            // 3. 发送授权请求到服务器
            const authResult: any = JSON.parse('{"uid":0,"udid":"","fbid":"123456789","fbAccessToken":"saafdddxddddssx","waccessDate":1768651317880,"clientVersion":"2.4.11.0","serviceType":"canvas","market":"facebook","entrancePath":"?hrv_source=refresh"}');//await CommonServer.Instance().requestAuth(initialUid, JSON.stringify(authPostInfo));
            cc.log("Auth Result: ", JSON.stringify(authResult));

            // // 4. 校验授权响应错误
            // if (CommonServer.isServerResponseError(authResult)) {
            //     LocalStorageManager.resetLoginType(); // 重置登录类型
            //     const statusCode = CommonServer.getErrorStatusCode(authResult);
            //     const errorMsg = CommonServer.getErrorMsg(authResult);
                
            //     cc.log("statusCode: ", statusCode, "/ msg: ", errorMsg);
                
            //     // // 记录授权失败日志到FireHose
            //     // const error = new Error(`Auth fail code:${statusCode.toString()} msg:${errorMsg}`);
            //     // FireHoseSender.Instance().sendAws(
            //     //     FireHoseSender.Instance().getRecord(FHLogType.Trace, error),
            //     //     true,
            //     //     FHLogType.Exception
            //     // );

            //     // Facebook校验失败特殊处理：登出并重启游戏
            //     if (500 === statusCode && errorMsg.indexOf("facebook check fail") !== -1) {
            //         PopupManager.Instance().showDisplayProgress(true);
            //         // FacebookUtil.logout(() => {
            //         //     HRVServiceUtil.restartGame();
            //         // });
            //         return;
            //     }

            //     // 通用授权失败处理
            //     CommonPopup.loginErrorPopup("ayncLoginProgressLoading fail");
            //     throw new Error(`Auth fail code:${statusCode.toString()} msg:${errorMsg}`);
            // }

            // 5. 新用户统计及授权信息配置
            if (1 === authResult.isNewUser) {
                Analytics.newUserRegistraion(); // 新用户注册统计
                Analytics.completeRegistration(); // 完成注册统计
            }

            // 保存授权信息到CommonServer
            //CommonServer.Instance().setAuthInfo(authResult.uid, authResult.accessToken.token);
            // 设置FB用户合并信息
            // LoginProcess.Instance().setAuthFBMergeInfo(authResult);
            // 标记游客合并状态
            ServiceInfoManager.BOOL_GUEST_MERGE = authResult.isGuestMerge;

            const extraInfo = authResult.extraInfo;
            const userId = authResult.uid;
            // const accessToken = authResult.accessToken.token;
            const accessToken = "";
            // 处理AB测试Key（空值兼容）
            const abTestKeys = TSUtility.isValid(authResult.abTestKey) ? authResult.abTestKey : [];
            
            // AB测试分段处理（兼容空值）
            if (TSUtility.isValid(authResult.abSegment)) {
                authResult.abSegment;
            }

            // 检查Epic Win Offer目标用户标记
            for (let i = 0; i < abTestKeys.length; i++) {
                if (abTestKeys[i] === SDefine.EPICWIN_OFFERKEY) {
                    ServiceInfoManager.BOOL_EPIC_WIN_OFFER_TARGET = true;
                }
            }

            // 6. 获取用户详细信息，更新进度
            LoginProcess.Instance().onProgress("Authenticating ...", 0.3);
            const userInfoResult: any = await CommonServer.Instance().getUserInfo(userId);
            cc.log("UserInfo Result: ", JSON.stringify(userInfoResult));

            // // 7. 校验用户信息响应错误
            // if (CommonServer.isServerResponseError(userInfoResult)) {
            //     LocalStorageManager.resetLoginType();
            //     CommonPopup.loginErrorPopup("Get UserInfo fail.");
                
            //     const statusCode = CommonServer.getErrorStatusCode(userInfoResult);
            //     const errorMsg = CommonServer.getErrorMsg(userInfoResult);
            //     throw new Error(`getUserInfo fail code:${statusCode.toString()} msg:${errorMsg}`);
            // }

            // 8. 初始化用户信息实例
            const accountStatus = ServiceInfoManager.NUMBER_ACCOUNT_STATUS;
            if (UserInfo.setInstance(userInfoResult, accessToken, extraInfo)) {
                // 账号状态98：删除账号确认弹窗
                if (98 === accountStatus) {
                    // DeleteAccount_Cancle_Popoup.getPopup((isCancel: boolean, popup: any) => {
                    //     if (isCancel) {
                    //         TSUtility.endGame();
                    //         return false;
                    //     }
                    //     popup.open();
                    // });
                } 
                // 其他异常账号状态：显示支持弹窗
                else if (0 !== accountStatus) {
                    CommonPopup.getCommonPopup((isCancel: Error, popup: any) => {
                        popup.open()
                            .setInfo("WARNING", "Faulty authentication information.\nIf the error persists, please tap the 'SUPPORT' button.")
                            .setOkBtn("SUPPORT", () => {
                                //UserInfo.instance().goCustomerSupport();
                            });
                    });
                } 
                // 基础授权失败：显示错误弹窗
                else {
                    CommonPopup.loginErrorPopup(`${userId} ${accessToken}`);
                }
                return;
            }

            // // 9. 用户信息初始化完成后的配置
            // UserInfo.instance().setLocation("Login"); // 设置用户当前位置
            // UserInfo.instance().setGameId(""); // 重置游戏ID
            // UserInfo.instance().resetTourneyTier(); // 重置锦标赛等级
            //Analytics.authComplete(userId); // 授权完成统计
            
            // 显示限时预览标识（HighRoller/MajorRoller）
            LoginProcess.Instance().showSneakpeekMark();

            // // 持久化用户UID和AccessToken到本地存储
            // LocalStorageManager.setUserUID(UserInfo.instance().getUid());
            // LocalStorageManager.setAccessToken(UserInfo.instance().getAccessToken());
            
            // // 初始化用户信息相关配置
            // SDefine.InitAfterGetUserInfo(UserInfo.instance().getUid());

            // // 10. Facebook Instant Game特有：初始化GifMaker
            // if (1 === Utility.isFacebookInstant()) {
            //     await InstantGifMaker.asyncInit();
            // }

            // 11. 连续登录&会话统计
            //const streakedJoinInfo = UserInfo.instance().getUserStreakedJoinInfo();
            //Analytics.stackedEnter(streakedJoinInfo.all_Count);
            
            // // 7次会话特殊统计
            // if (7 === UserInfo.instance().getUserSessionCnt()) {
            //     Analytics.sessionCount(7);
            // }

            // // 12. 书签进入统计（区分Facebook Web/Instant）
            // let isBookmarkEntry = false;
            // if (Utility.isFacebookWeb()) {
            //     const fbSource = EntrancePathManager.Instance().getFBSource();
            //     const ref = EntrancePathManager.Instance().getRef();
            //     isBookmarkEntry = (fbSource === "bookmark" && ref === "bookmarks");
            // } else if (Utility.isFacebookInstant()) {
            //     const entryPoint = EntrancePathManager.Instance().getHRVEntryPoint();
            //     isBookmarkEntry = (entryPoint === "bookmark");
            //     cc.log("is www_bookmark", entryPoint);
            // }

            // if (isBookmarkEntry) {
            //     Analytics.stackedEnterBookmark(streakedJoinInfo.bookmark_Count);
            // }

            // 13. 处理分享信息和商店数据校验
            LoginProcess.Instance().setShareInfo();
            cc.log("TimeCheck compareShopItemIDandJson start");
            
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
            
            cc.log("TimeCheck compareShopItemIDandJson end");

            // 14. 授权状态完成
            // Analytics.authStateComplete();
            this.setDone();

        } catch (error) {
            // 全局异常捕获，上报到FireHose日志系统
            // FireHoseSender.Instance().sendAws(
            //     FireHoseSender.Instance().getRecord(FHLogType.Exception, error)
            // );
            cc.error(error)
        }
    }
}