import AssetBundleManager from "./AssetBundle/AssetBundleManager";
import { LanguageType } from "./Config/LanguageManager";
import ErrorCatcher from "./ErrorCatcher";
import FireHoseSender, { FHLogType } from "./FireHoseSender";
import HRVFirehoseSetting from "./HRVService/HRVFirehoseSetting";
import HRVServiceUtil from "./HRVService/HRVServiceUtil";
import IntroPopup from "./IntroPopup";
import LoginProcess from "./LoginProcess";
import Analytics from "./Network/Analytics";
import CommonServer from "./Network/CommonServer";
import CommonPopup from "./Popup/CommonPopup";
import ServiceInfoManager from "./ServiceInfoManager";
import AsyncHelper from "./global_utility/AsyncHelper";
import CommonSoundSetter from "./global_utility/CommonSoundSetter";
import NativeUtil from "./global_utility/NativeUtil";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import { Utility, UuidUtils } from "./global_utility/Utility";
import LocalStorageManager from "./manager/LocalStorageManager";
import PopupManager from "./manager/PopupManager";
import ServerStorageManager, { StorageKeyType } from "./manager/ServerStorageManager";
import SoundManager from "./manager/SoundManager";
import MessageRoutingManager from "./message/MessageRoutingManager";

const { ccclass, property } = cc._decorator;



/**
 * 编辑器服务模式枚举
 */
export const EditorServiceMode = cc.Enum({
    Dev: 0,
    QA: 1
});

/**
 * 启动器场景组件
 * 负责游戏启动初始化、配置加载、补丁检查、登录流程启动等核心逻辑
 */
@ccclass()
export default class LauncherScene extends cc.Component {
    // ===== 可序列化属性（对应编辑器赋值）=====
    @property({ type: EditorServiceMode })
    public editorServiceMode: number = EditorServiceMode.Dev;

    @property(IntroPopup)
    public intro: IntroPopup = null;

    @property(CommonSoundSetter)
    public soundSetter: CommonSoundSetter = null;

    // ===== 私有属性 =====
    private commonServerUrl: string = "";
    private _launcherSceneName: string = "";
    private _lastWatchedBotPopupTime: number = 0;

    // ===== 静态配置 =====
    public static EditorAppSetting = [
        {
            facebookAppID: "689653411415651",
            serviceMode: "DEV",
            // serverIp: "https://app-dev.highrollervegas.net/"
            serverIp:"http://192.168.2.167:8080/api/"
            // serverIp:"http://1.13.80.243:8080/api/"
        },
        {
            facebookAppID: "249221922271985",
            serviceMode: "QA",
            // serverIp: "https://app-qa.highrollervegas.net/"
            serverIp:"http://192.168.2.167:8080/api/"
            // serverIp:"http://1.13.80.243:8080/api/"
        }
    ];

    /**
     * 组件加载时初始化
     */
    public onLoad(): void {
        // 初始化核心服务
        HRVServiceUtil.init();
        this.setAppConfig();
        HRVFirehoseSetting.Init();
        ErrorCatcher.Init();
        SDefine.preInit();
        // Analytics.luncherOnLoadStart();

        // 适配Canvas尺寸
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        const canvasSize = canvas.node.getContentSize();
        if (canvasSize.width / canvasSize.height > 1.7777) {
            canvas.fitHeight = true;
            canvas.fitWidth = false;
        } else {
            canvas.fitHeight = false;
            canvas.fitWidth = true;
        }
        canvas.getComponentInChildren(cc.Camera).cullingMask = 1;

        // 初始化场景信息
        this._launcherSceneName = cc.director.getScene().name;
        if (this.intro.blockBG) {
            this.intro.blockBG.setContentSize(canvas.node.getContentSize());
        }
        this.intro.clear();
        this.intro.setPersistNode();

        // 初始化弹窗管理器
        PopupManager.Init();
        PopupManager.Instance().setBaseBackBtnCallback(LauncherScene.baseBackBtnProcess);

        // 初始化通用服务器
        CommonServer.SetInstance(new CommonServer());
        CommonServer.Instance().setPersistentNodeComp(PopupManager.Instance());

        // 打印环境信息
        cc.log("lang ", cc.sys.language);
        cc.log("os ", cc.sys.os);
        cc.log("isMobile ", cc.sys.isMobile);
        cc.log("scene name ", cc.director.getScene().name);
        //NativeUtil.setObjValue_FBCrash("lang", cc.sys.language);

        // 初始化Intro弹窗显示状态
        this.intro.showProgressGroup(false);
        this.intro.showLoginBtnGroup(false);

        // 初始化流程（屏蔽Facebook Instant Game逻辑，直接走默认初始化）
        // if (1 == Utility.isFacebookInstant()) {
        //     this.asyncInitFacebookInstantGame();
        // } else {
        this.init();
        // }
    }

    /**
     * 异步初始化Facebook Instant Game
     */
    private async asyncInitFacebookInstantGame(): Promise<void> {
        try {
            // 等待FBInstant初始化或超时
            await Promise.race([
                // AsyncHelper.asyncWaitEndCondition(() => FBInstant_initializeAsync, this),
                AsyncHelper.delay(2)
            ]);

            // if (!window.FBInstant_initializeAsync) {
            //     cc.error("FBInstant_initializeAsync retry");
            //     try {
            //         await FBInstant.initializeAsync();
            //     } catch (error) {
            //         cc.error(error);
            //     }
            // }

            // 启动游戏并执行初始化
            // await FBInstant.startGameAsync();
            this.init();
        } catch (error) {
            cc.error(error);
        }
    }

    /**
     * 初始化流程（调试模式显示调试弹窗，否则直接启动补丁流程）
     */
    private init(): void {
        // if ((LocalStorageManager.isDebugMode()) || 
        //     (Utility.isMobileGame() )) {
        //     LauncherDebugPopup.getPopup((isCancel: boolean, popup: any) => {
        //         popup.open();
        //         popup.setCloseCallback(() => {
        //             this.startPatchProcessSync();
        //         });
        //     });
        // } else {
            this.startPatchProcessSync();
        // }
    }

    /**
     * 同步启动补丁处理流程
     */
    private async startPatchProcessSync(): Promise<void> {
        try {
            // Analytics.luncherStartPatchProcess();
            await AsyncHelper.delay(0);

            // Facebook初始化（非Instant Game且启用提前FB初始化）
            if (Utility.isFacebookInstant() && TSUtility.enableEarlyFBInit()) {
                // const fbInitResult = await FacebookUtil.initSync();
                // if (0 == fbInitResult) {
                //     CommonPopup.loginErrorPopup("Facebook Init fail");
                //     return;
                // }
            }

            // 初始化埋点
            // Analytics.init();

            // 移动端初始化
            if (Utility.isMobileGame()) {
                NativeUtil.init();
                if (LocalStorageManager.isFirstAppLaunch()) {
                    // Analytics.firstLaunch();
                    //NativeUtil.setObjValue_FBCrash("isFirstAppLaunch", "true");
                }
            }

            // // 提前FB初始化时记录appLaunch埋点
            // if (TSUtility.enableEarlyFBInit()) {
            //     Analytics.appLaunch();
            // }

            // 调试模式配置
            // if (!LocalStorageManager.isDebugMode()) {
            //     // 非调试模式直接跳过
            // } else {
            // const debugModeInfo = LocalStorageManager.getDebugModeInfo();
            // if (debugModeInfo.commonServerIp != "") {
            //     this.commonServerUrl = debugModeInfo.commonServerIp;
            //     CommonServer.setUseCumtomCommonServer(true);
            // }
            // cc.debug.setDisplayStats(true);
            
            // if (debugModeInfo.logServerIp == "") {
            //     //logModule.initLogModule("");
            // } else {
            //     //logModule.initLogModule(debugModeInfo.logServerIp);
            //     await AsyncHelper.delay(0.1);
            // }
            // }

            // 设置默认语言
            const defaultLang = LanguageType.EN;
            ServerStorageManager.save(StorageKeyType.CURRENT_LANGUAGE, defaultLang, false);
            LocalStorageManager.setLanguage(defaultLang);
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.SET_LANGUAGE);

            // 播放启动音效
            SoundManager.Instance().playFxOnce(this.soundSetter.getAudioClip("appstart_1"));

            // 移动端原生补丁系统检查
            if (Utility.isMobileGame() && NativeUtil.useNativePatchSystem()) {
                //Analytics.luncherAppVersionCheckStart();
                this.processAppVersionCheckSync();
                //Analytics.luncherAppVersionCheckComplete();
            }

            // 更新入口路径
            //Analytics.luncherStartUpdateEntrancePath();
            await LoginProcess.Instance().updateEntrancePath();
            //Analytics.luncherCompleteUpdateEntrancePath();

            // 获取登录流程状态
            const loginProcessState = LoginProcess.Instance().getLoginProcessState(
                this.commonServerUrl,
                NativeUtil.useNativePatchSystem(),
                this._launcherSceneName
            );

            // Facebook Instant Game相关逻辑
            if (Utility.isFacebookInstant()) {
                // 获取快捷方式数据
                this.intro.setInfoText("Instant Shortcut Data..");
                await this.fbinstantShortcutGetdata();

                // 获取Bot弹窗数据
                this.intro.setInfoText("Lobby Bot Popup Data...");
                await this.asyncFbinstantShowedLobbyBotPopupGetdata();

                // 检查Bot弹窗展示时间
                if (Utility.getUnixTimestamp() - (this._lastWatchedBotPopupTime + 7776000) < 0) {
                    //Analytics.luncherCompletePatchProcess();
                    loginProcessState.onStart();
                    return;
                }

                // 保存Bot弹窗最后展示时间
                const currentTime = Utility.getUnixTimestamp();
                try {
                    //await FBInstant.player.setDataAsync({ LastWatchedBotPopupTime: currentTime });
                    cc.log("LastWatchedBotPopupTime Save");
                } catch (error) {
                    cc.log("LastWatchedBotPopupTime save failed");
                }

                // 检查并订阅Bot
                try {
                    // const canSubscribe = await FBInstant.player.canSubscribeBotAsync();
                    // if (!canSubscribe) {
                    //     Analytics.luncherCompletePatchProcess();
                    //     loginProcessState.onStart();
                    //     return;
                    // }

                    //Analytics.chatbotOptinView();
                    try {
                        //await FBInstant.player.subscribeBotAsync();
                        //Analytics.chatbotOptinResult(1);
                    } catch (error) {
                        //Analytics.chatbotOptinResult(0);
                    }
                    //Analytics.luncherCompletePatchProcess();
                    loginProcessState.onStart();
                } catch (error) {
                    const err = new Error("startPatchProcessSync FBInstant.player.canSubscribeBotAsync fail");
                    FireHoseSender.Instance().sendAws(
                        FireHoseSender.Instance().getRecord(FHLogType.Exception, err, error)
                    );
                    loginProcessState.onStart();
                }
            } else {
                // 非Facebook Instant Game直接启动登录流程
                loginProcessState.onStart();
                //Analytics.luncherCompletePatchProcess();
            }
        } catch (error) {
            // 捕获异常并上报
            FireHoseSender.Instance().sendAws(
                FireHoseSender.Instance().getRecord(FHLogType.Exception, error)
            );
            console.error(error)
        }
    }

    /**
     * 获取Facebook Instant Game快捷方式数据
     */
    private fbinstantShortcutGetdata(): Promise<void> {
        return new Promise<void>((resolve) => {
            ServiceInfoManager.BOOL_PLAYING_INSTANT_SHORTCUT = true;
            // FBInstant.player.getDataAsync(["isShowedBigWinShortCut"])
            //     .then((data) => {
            //         if (data != null && data.isShowedBigWinShortCut != null) {
            //             ServiceInfoManager.BOOL_PLAYING_INSTANT_SHORTCUT = data.isShowedBigWinShortCut;
            //         } else {
            //             ServiceInfoManager.BOOL_PLAYING_INSTANT_SHORTCUT = false;
            //         }
            //         resolve();
            //     })
            //     .catch(() => {
            //         resolve();
            //     });
        });
    }

    /**
     * 异步获取Facebook Instant Game Bot弹窗展示数据
     */
    private asyncFbinstantShowedLobbyBotPopupGetdata(): Promise<void> {
        return new Promise<void>((resolve) => {
            this._lastWatchedBotPopupTime = TSUtility.getServerBaseNowUnixTime();
            // FBInstant.player.getDataAsync(["LastWatchedBotPopupTime"])
            //     .then((data) => {
            //         if (data != null && data.LastWatchedBotPopupTime != null) {
            //             this._lastWatchedBotPopupTime = data.LastWatchedBotPopupTime;
            //             cc.log("data : " + data.LastWatchedBotPopupTime);
            //         } else {
            //             this._lastWatchedBotPopupTime = 0;
            //             cc.log("No show data");
            //         }
            //         resolve();
            //     })
            //     .catch(() => {
            //         cc.log("error show data");
            //         resolve();
            //     });
        });
    }

    /**
     * 更新启动器进度显示
     * @param info 进度文本
     * @param progress 进度值（0-1）
     */
    public onProgressLauncher(info: string, progress: number): void {
        this.intro.showProgressGroup(true);
        this.intro.setInfoText(info);
        this.intro.setProgress(progress);
    }

    /**
     * 处理App版本检查
     */
    private processAppVersionCheckSync(): boolean {
        // 初始化资源包清单缓存
        AssetBundleManager.Instance().initFileManifestcache();
        cc.log("version ", Utility.getApplicationVersion());

        // 标记版本检查
       // NativeUtil.NativeUtil.setObjValue_FBCrash("checkMainfest", "true");

        // 清理旧清单和缓存
        const writablePath = jsb.fileUtils.getWritablePath();
        AssetBundleManager.removeFile("assets/main.manifest", writablePath);
        cc.sys.localStorage.removeItem("md5Setting_2_4_11");
        cc.sys.localStorage.removeItem("md5CocosJsb_2_4_11");
        
        // 保存当前版本
        cc.sys.localStorage.setItem("appVersion", Utility.getApplicationVersion());
        
        // 添加可写路径到搜索路径
        jsb.fileUtils.addSearchPath(jsb.fileUtils.getWritablePath(), true);
        jsb.fileUtils.purgeCachedEntries();
        cc.log("add SearchPath ", jsb.fileUtils.getWritablePath());

        return true;
    }

    /**
     * 设置应用配置（服务器地址、FB配置等）
     */
    private setAppConfig(): void {
        let clientSessionKey = "";

        // 移动端获取客户端会话密钥
        if (Utility.isMobileGame()) {
            clientSessionKey = NativeUtil.getClientSessionKey();
            NativeUtil.resetClientSessionKey();
        }

        // 生成会话密钥（无则创建）
        if (clientSessionKey == "") {
            const uuid = UuidUtils.generateUuidv4();
            clientSessionKey = UuidUtils.compressUuid(uuid, true);
        }
        TSUtility.setClientSessionKey(clientSessionKey);

        // Facebook Web端配置
        if (Utility.isFacebookWeb()) {
            let resourceVersion = "0";
            let webAccessDate = 0;

            // 从全局配置读取
            if (typeof window["__appConfig__"]  !== "undefined") {
                if (window["__appConfig__"].serverURL) {
                    this.commonServerUrl = decodeURIComponent(window["__appConfig__"].serverURL);
                }
                if (window["__appConfig__"].waccessDate) {
                    webAccessDate = parseInt(window["__appConfig__"].waccessDate);
                }
                if (window["__appConfig__"].resourceVersion) {
                    resourceVersion = window["__appConfig__"].resourceVersion;
                }
                if (window["__appConfig__"].fbid) {
                    //FacebookUtil.fbExceptionFBID = window["__appConfig__"].fbid;
                }
                if (window["__appConfig__"].oauthToken) {
                    //FacebookUtil.fbExceptionToken = window["__appConfig__"].oauthToken;
                }
                if (window["__appConfig__"].onFBInitCallback) {
                    //FacebookUtil.setOnFbInitCallback(window["__appConfig__"].onFBInitCallback);
                }
                if (window["__appConfig__"].facebookAppID) {
                    TSUtility.setFacebookAppId(window["__appConfig__"].facebookAppID);
                }
                if (window["__appConfig__"].serviceMode) {
                    TSUtility.setServiceMode(window["__appConfig__"].serviceMode);
                }
                if (window["__appConfig__"].entrancePath && window["__appConfig__"].entrancePath != "") {
                    TSUtility.setAppConfigEntrancePath(window["__appConfig__"].entrancePath);
                }
            } 
            else if (Utility.isCocosEditorPlay()) {
                const editorConfig = LauncherScene.EditorAppSetting[this.editorServiceMode];
                this.commonServerUrl = editorConfig.serverIp;
                TSUtility.setFacebookAppId(editorConfig.facebookAppID);
                TSUtility.setServiceMode(editorConfig.serviceMode);
            }else{
                const editorConfig = LauncherScene.EditorAppSetting[this.editorServiceMode];
                TSUtility.setServiceMode(editorConfig.serviceMode);
            }

            // 设置基础服务器地址
            TSUtility.setBasicCommonServerUrl(this.commonServerUrl);

            // CF加速服务器配置
            if (SDefine.Use_CF_AccelerationServer_Flag &&LocalStorageManager.getLocalCFAccelerationInfo().useCF) {
                this.commonServerUrl = TSUtility.getBasicCFCommonServerUrl();
            }

            // 从URL参数覆盖服务器地址
            if (document && document.location && document.location.href) {
                const serverUrlParam = TSUtility.getParameterByName("ServerURL", document.location.href);
                if (serverUrlParam && serverUrlParam != "") {
                    cc.log("change serverIp " + decodeURIComponent(serverUrlParam));
                    this.commonServerUrl = decodeURIComponent(serverUrlParam);
                    CommonServer.setUseCumtomCommonServer(true);
                }
            }

            // 设置Web访问日期和资源版本
            Utility.setWebAccessDate(webAccessDate);
            Utility.setResourceVersion(resourceVersion);
        }
        // Facebook Instant Game配置
        else if (Utility.isFacebookInstant()) {
            if (window["commonServerUrl"] !== undefined && window["commonServerUrl"] != "") {
                this.commonServerUrl = window["commonServerUrl"];
            } else if (typeof window["__appConfig__"] !== "undefined") {
                if (window["__appConfig__"].serverURL) {
                    this.commonServerUrl = decodeURIComponent(window["__appConfig__"].serverURL);
                }
                if (window["__appConfig__"].serviceMode) {
                    TSUtility.setServiceMode(window["__appConfig__"].serviceMode);
                }
            }

            // 设置基础服务器地址
            TSUtility.setBasicCommonServerUrl(this.commonServerUrl);

            // CF加速服务器配置
            if (SDefine.Use_CF_AccelerationServer_Flag && LocalStorageManager.getLocalCFAccelerationInfo().useCF) {
                this.commonServerUrl = TSUtility.getBasicCFCommonServerUrl();
            }

            // 从URL参数获取版本
            const versionParam = TSUtility.getParameterByName("version", document.location.href);
            cc.log("current verison " + versionParam);
            Utility.setResourceVersion(versionParam);
        }
        // 移动端/桌面端配置
        else {
            // 初始化资源包清单
            const localManifestInfo = AssetBundleManager.Instance().getLocalManifestInfo();
            AssetBundleManager.Instance().setMainManifest(localManifestInfo);

            // // 设置服务器地址
            // if (window["commonServerUrl"] !== undefined && window["commonServerUrl"] != "") {
            //     this.commonServerUrl = window["commonServerUrl"];
            // } else if (window["__appConfig__"] !== undefined) {
            //     if (window["__appConfig__"].serverURL) {
            //         this.commonServerUrl = decodeURIComponent(window["__appConfig__"].serverURL);
            //     }
            //     if (window["__appConfig__"].facebookAppID) {
            //         TSUtility.setFacebookAppId(window["__appConfig__"].facebookAppID);
            //     }
            //     if (window["__appConfig__"].serviceMode) {
            //         TSUtility.setServiceMode(window["__appConfig__"].serviceMode);
            //     }
            // } else {
            //     const editorConfig = LauncherScene.EditorAppSetting[1];
            //     this.commonServerUrl = editorConfig.serverIp;
            //     TSUtility.setFacebookAppId(editorConfig.facebookAppID);
            //     TSUtility.setServiceMode(editorConfig.serviceMode);
            //     Utility.setResourceVersion(0+"");
            // }

            // this.commonServerUrl = "http://1.13.80.243:8080/api/"
            this.commonServerUrl = "http://192.168.2.167:8080/api/"

            cc.log("this.commonServerUrl", this.commonServerUrl);

            // 设置基础服务器地址
            TSUtility.setBasicCommonServerUrl(this.commonServerUrl);

            // // CF加速服务器配置
            // if (SDefine.Use_CF_AccelerationServer_Flag &&LocalStorageManager.getLocalCFAccelerationInfo().useCF) {
            //     this.commonServerUrl = TSUtility.getBasicCFCommonServerUrl();
            // }

            // iOS移动端DeepLink处理
            if ( Utility.isMobileGame() && cc.sys.os == cc.sys.OS_IOS) {
                const deepLinkContent = NativeUtil.getDeepLinkContent();
                if (deepLinkContent && deepLinkContent != "") {
                    const deepLinkValue = TSUtility.getParameterByName("deep_link_value", deepLinkContent).toLowerCase();
                    if (deepLinkValue == "mistplay_install") {
                        LocalStorageManager.SetTrackMistPlay(true);
                    }
                }
            }
        }
    }

    /**
     * 基础返回按钮处理逻辑
     */
    public static baseBackBtnProcess(): void {
        if (Utility.isMobileGame()) {
            CommonPopup.getCommonPopup((isCancel: Error, popup: any) => {
                if (!isCancel) {
                    popup.closeBtn.node.active = false;
                    popup.open()
                        .setInfo("EXIT GAME", "Are you sure you\nwant to exit game?")
                        .setOkBtn("STAY", null)
                        .setCancelBtn("EXIT", () => {
                            TSUtility.endGame();
                        });
                    popup.setPopupType(0);
                }
            });
        }
    }
}