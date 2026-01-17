import AssetBundleManager from "./AssetBundle/AssetBundleManager";
import FireHoseSender, { FHLogType } from "./FireHoseSender";
import HRVServiceUtil from "./HRVService/HRVServiceUtil";
import LoginProcess from "./LoginProcess";
import Analytics from "./Network/Analytics";
import CommonServer from "./Network/CommonServer";
import { MultiDownLoader } from "./Network/Downloader";
import CommonPopup from "./Popup/CommonPopup";
import ServiceInfoManager from "./ServiceInfoManager";
import State from "./Slot/State";
import AdsManager from "./Utility/AdsManager";
import NativeUtil from "./global_utility/NativeUtil";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";
import ConfigManager from "./manager/ConfigManager";
import LocalStorageManager from "./manager/LocalStorageManager";

const { ccclass, property } = cc._decorator;



/**
 * 版本检查状态类
 * 负责登录流程中的版本校验、CF加速服务器选择、资源补丁下载、多平台适配等核心逻辑
 */
@ccclass()
export default class L_CheckWebVersionState extends State {
    // ===== 类属性 =====
    public commonServerUrl: string = "";
    public useNativePatchSystem: boolean = true;
    private _launcherSceneName: string = "";

    // ===== 构造函数 =====
    constructor(commonServerUrl: string, useNativePatchSystem: boolean, launcherSceneName: string) {
        super();
        this.commonServerUrl = commonServerUrl;
        this.useNativePatchSystem = useNativePatchSystem;
        this._launcherSceneName = launcherSceneName;
    }

    // ===== 核心方法 =====
    /**
     * 启动版本检查状态
     */
    public onStart(): void {
        cc.log("L_CheckWebVersionState");
        this._done = false;
        this.doProcess();
    }

    /**
     * 版本检查核心处理逻辑
     */
    public async doProcess(): Promise<void> {
        try {
            // 1. 初始化版本检查
            //Analytics.versionCheckStart();
            LoginProcess.Instance().introPopup.setInfoText("Checking version...");
            
            const startTime = new Date().getTime();
            // 获取服务器版本信息
            const versionRes: any = await CommonServer.Instance().getVersion(this.commonServerUrl);
            
            LoginProcess.Instance().introPopup.setInfoText("Checking version end");
            const requestTime = new Date().getTime() - startTime;
            cc.log("getVersion result ", JSON.stringify(versionRes));

            // 2. 检查服务器响应错误
            if (CommonServer.isServerResponseError(versionRes)) {
                if (!CommonServer.isDisconnectError(versionRes)) {
                    CommonPopup.loginErrorPopup("Oopsie! Please check your\n connection and try again.");
                }
                cc.error("getVersion fail");
                return;
            }

            // 3. CF加速服务器选择（仅当启用CF加速且请求超时）
            if (SDefine.Use_CF_AccelerationServer_Flag) {
                if (CommonServer.isUseCumtomCommonServer() && requestTime > 200) {
                    const cfAccInfo: any = LocalStorageManager.getLocalCFAccelerationInfo();
                    if (1 !== cfAccInfo.isExpire()) {
                        await this.ayncDoCFAcceleration(cfAccInfo);
                    }
                }
            }

            // 4. 配置通用服务器和版本信息
            CommonServer.Instance().setCommonServerUrl(this.commonServerUrl);
            TSUtility.setServiceMode(versionRes.version.serviceMode);
            SDefine.Init();
            TSUtility.setShareServerAddress(versionRes.version.shareImgURL);
            TSUtility.setCommonResourceUrl(versionRes.version.commonResourceURL);
            
            // 设置Web访问日期
            if (0 === Utility.getWebAccessDate()) {
                Utility.setWebAccessDate(versionRes.wacesssDate);
            }

            // 5. Facebook初始化（非Instant/非提前初始化场景）
            if (Utility.isFacebookInstant() && !TSUtility.enableEarlyFBInit()) {
                TSUtility.setFacebookAppId(versionRes.version.facebookAppID);
                // const fbInitRes = await FacebookUtil.initSync();
                // if (0 === fbInitRes) {
                //     CommonPopup.loginErrorPopup("Facebook Init fail");
                //     return;
                // }
                //Analytics.appLaunch();
            }

            // 6. 设置CDN资源地址
            const resourceURL = versionRes.version.resourceURL;
            if (resourceURL !== "") {
                TSUtility.setCDNHostURL(resourceURL);
                if (Utility.isFacebookInstant()) {
                    TSUtility.changeSubPackagePath(resourceURL);
                }
            } else {
                cc.error("resourceUrl is empty");
            }

            // // 7. 配置作弊工具URL
            // const slotCheatUrl = versionRes.version.slotCheatUrl;
            // SlotCheatManager.Instance().setRootUrl(slotCheatUrl);
            //Analytics.versionCheckComplete();

            // 8. 加载广告配置（Facebook Instant/移动端）
            if (Utility.isFacebookInstant() || Utility.isMobileGame()) {
                // const adConfigPath = "Config/Common/placementID";
                // const adConfig = await ConfigManager.ayncLoadConfig(adConfigPath);
                // if (adConfig === null) {
                //     cc.error("load fail " + adConfigPath);
                //     CommonPopup.loginErrorPopup("load fail " + adConfigPath);
                //     return;
                // }
                // AdsManager.Init(adConfig);
            }

            // 9. 原生平台补丁系统处理
            if (cc.sys.isNative) {
                this.handleNativePatchSystem(versionRes);
                return;
            } else {
                // 非原生平台直接完成状态
                this.setDone();
            }
        } catch (error) {
            // 异常捕获并上报到FireHose
            FireHoseSender.Instance().sendAws(
                FireHoseSender.Instance().getRecord(FHLogType.Exception, error)
            );
        }
    }

    /**
     * 原生平台补丁系统处理逻辑
     * @param versionRes 服务器版本响应数据
     */
    private async handleNativePatchSystem(versionRes: any): Promise<void> {
        // 不使用原生补丁系统
        if (!this.useNativePatchSystem) {
            cc.log("not use nativePatchSystem");
            AssetBundleManager.Instance().setUsePatchSystem(false);
            this.setDone();
            return;
        }

        // // 1. 应用版本校验
        // const appVersion = Utility.getApplicationVersion();
        // const appVersionCode = Utility.getApplicationVersionCode(appVersion);
        // const minAppVersionCode = Utility.getApplicationVersionCode(versionRes.version.minAppVersion);
        // const curAppVersionCode = Utility.getApplicationVersionCode(versionRes.version.curAppVersion);
        // const recAppVersionCode = Utility.getApplicationVersionCode(versionRes.version.recAppVersion);

        // // 2. 平台特定版本处理
        // // iOS：检查版本并请求ATT权限
        // if (cc.sys.os === cc.sys.OS_IOS) {
        //     const revAppVersionCode = Utility.getApplicationVersionCode(versionRes.version.revAppVersion);
        //     if (appVersionCode >= revAppVersionCode) {
        //         SDefine.Mobile_iOS_DownloadNotiPopup_Flag = true;
        //         if (1 === NativeUtil.isAvailableAttrackingIOS() && 
        //             NativeUtil.getATTrackingAuthorizationStatus() === SDefine.ATTrackingAuthorizationStatus_NotDetermined) {
        //             NativeUtil.requestATTrackingIOS();
        //         }
        //     }
        // }

        // // Android：版本限制标记
        // if (cc.sys.os === cc.sys.OS_ANDROID) {
        //     const revAppVersionCode = Utility.getApplicationVersionCode(versionRes.version.revAppVersion);
        //     if (appVersionCode >= revAppVersionCode) {
        //         SDefine.Mobile_AOS_ReviceVersion_Limitation = true;
        //     }
        // }

        // // 3. 设置服务信息版本
        // ServiceInfoManager.NUMBER_CURRENT_APP_VERSION = curAppVersionCode;
        // ServiceInfoManager.NUMBER_REC_APP_VERSION = recAppVersionCode;
        // ServiceInfoManager.STRING_STORE_OPEN_URL = versionRes.version.storeURL;

        // cc.log("appVersionCode ", appVersionCode, " minAppVersionCode ", minAppVersionCode, " curAppVersionCode ", curAppVersionCode);

        // // 4. 版本过低显示更新弹窗
        // if (Utility.isMobileGame() && !TSUtility.isDevService() && appVersionCode < minAppVersionCode) {
        //     PopupManager.Instance().showDisplayProgress(true);
        //     UpdateGuidePopup.getPopup((isCancel: boolean, popup: any) => {
        //         PopupManager.Instance().showDisplayProgress(false);
        //         if (!isCancel) {
        //             popup.open(true, versionRes.version.storeURL);
        //         }
        //     });
        //     return;
        // }

        // 5. 资源版本校验
        cc.log("setResCDNUrl ", versionRes.version.resourceURL);
        AssetBundleManager.Instance().setResCDNUrl(versionRes.version.resourceURL);
        
        // 获取本地资源清单
        const localManifest: any = AssetBundleManager.Instance().getLocalManifestInfo();
        const clientResourceVersion = versionRes.version.clientResourceVersion;

        // 调试模式资源版本覆盖
        if (LocalStorageManager.isDebugMode()) {
            const debugModeInfo = LocalStorageManager.getDebugModeInfo();
            if (0 !== debugModeInfo.mobileClientResVersion) {
                const originalVersion = clientResourceVersion;
                const debugVersion = debugModeInfo.mobileClientResVersion;
                cc.log("Debug mobile resource version change", originalVersion, debugVersion);
            }
        }

        // 记录资源版本到FB崩溃日志
        //NativeUtil.setObjValue_FBCrash("resourceVersion", clientResourceVersion.toString());

        // 资源版本一致则完成
        if (localManifest.version === clientResourceVersion) {
            AssetBundleManager.Instance().setMainManifest(localManifest);
            this.setDone();
            return;
        }

        // 6. 下载新资源清单
        Analytics.patchStart();
        cc.log("curResourceVersion ", localManifest.version);
        cc.log("newResourceVersion ", clientResourceVersion);

        const newManifest = await AssetBundleManager.Instance().downloadMainmanifestSync(clientResourceVersion);
        if (!newManifest || newManifest.errorCode) {
            let btnText = "RETRY";
            if (Utility.isFacebookInstant()) {
                btnText = "CLOSE";
            }
            CommonPopup.getCommonPopup((isCancel: Error, popup: any) => {
                popup.open()
                    .setInfo("NETWORK ERROR", "Oopsie! Please check your\n connection and try again.")
                    .setOkBtn(btnText, () => {
                        HRVServiceUtil.restartGame();
                    });
                if (Utility.isMobileGame()) {
                    popup.setCloseBtn(true, () => {
                        TSUtility.endGame();
                    });
                }
            });
            cc.error("downloadMainmanifest fail");
            return;
        }

        // 7. 下载场景资源
        AssetBundleManager.Instance().setMainManifest(newManifest);
        AssetBundleManager.Instance().resetSceneManifest();
        LoginProcess.Instance().resetProgress();

        const sceneNames = [this._launcherSceneName, SDefine.LOBBY_SCENE_HIGHROLLER_NAME];
        let baseProgress = 0;
        const progressPerScene = 0.5 / sceneNames.length;

        // 场景下载处理函数
        const downloadScene = async (index: number) => {
            baseProgress = progressPerScene * index;
            const downloadRes = await AssetBundleManager.Instance().downloadSceneResourceSync(
                sceneNames[index],
                (sceneName: string, loaded: number, total: number) => {
                    cc.log("downloadSceneResourceSync progress ", sceneName, " ", loaded, " ", total);
                    let progress = 0;
                    if (total !== 0) {
                        progress = baseProgress + (loaded / total) * progressPerScene;
                    } else {
                        progress = baseProgress + progressPerScene;
                    }
                    const progressText = "Patching " + sceneName;
                    this.onProgressLauncher(progressText, progress);
                }
            );

            if (!downloadRes) {
                let btnText = "RETRY";
                if (Utility.isFacebookInstant()) {
                    btnText = "CLOSE";
                }
                CommonPopup.getCommonPopup((isCancel: Error, popup: any) => {
                    popup.open()
                        .setInfo("NETWORK ERROR", "Oopsie! Please check your\n connection and try again.")
                        .setOkBtn(btnText, () => {
                            HRVServiceUtil.restartGame();
                        });
                    if (Utility.isMobileGame()) {
                        popup.setCloseBtn(true, () => {
                            TSUtility.endGame();
                        });
                    }
                });
                return false;
            }
            return true;
        };

        // 遍历下载所有场景
        for (let i = 0; i < sceneNames.length; i++) {
            const res = await downloadScene(i);
            if (!res) {
                return;
            }
        }

        // 8. 下载公共资源变更列表
        baseProgress = 0.5;
        const remainingProgress = 1 - baseProgress;
        cc.log("get resources change list");
        
        const changedSrcList = AssetBundleManager.Instance().getChangedSrcList(localManifest.src, newManifest.src);
        if (changedSrcList.length > 0) {
            const downloader = new MultiDownLoader();
            const downloadRes = await downloader.asyncDownloadFiles(
                changedSrcList,
                (loaded: number, total: number) => {
                    const progress = baseProgress + (loaded / total) * remainingProgress;
                    this.onProgressLauncher("Updating common resource ...", progress);
                }
            );

            if (downloadRes) {
                let btnText = "RETRY";
                if (Utility.isFacebookInstant()) {
                    btnText = "CLOSE";
                }
                CommonPopup.getCommonPopup((isCancel: Error, popup: any) => {
                    popup.open()
                        .setInfo("WARNING", "Network fail\n Check WIFI")
                        .setOkBtn(btnText, () => {
                            HRVServiceUtil.restartGame();
                        });
                    if (Utility.isMobileGame()) {
                        popup.setCloseBtn(true, () => {
                            TSUtility.endGame();
                        });
                    }
                });
                return;
            }
        }

        // 9. 补丁完成处理
        Analytics.patchComplete();
        AssetBundleManager.Instance().setCompleteMainManifest();
        jsb.fileUtils.purgeCachedEntries();

        // 有资源变更则重启游戏
        if (changedSrcList.length > 0) {
            cc.log("game restart");
            HRVServiceUtil.restartGame();
            return;
        }

        // 完成状态
        this.setDone();
    }

    /**
     * 更新启动器进度显示
     * @param text 进度提示文本
     * @param progress 进度值（0-1）
     */
    public onProgressLauncher(text: string, progress: number): void {
        LoginProcess.Instance().onProgress(text, progress);
    }

    /**
     * 异步处理CF加速服务器选择
     * @param cfAccInfo CF加速信息对象
     */
    public async ayncDoCFAcceleration(cfAccInfo: any): Promise<void> {
        cc.log("check cf target");
        const basicCommonUrl = TSUtility.getBasicCommonServerUrl();
        const basicCFCommonUrl = TSUtility.getBasicCFCommonServerUrl();
        
        // 检查基础服务器延迟
        const basicUrlInfo: { success: boolean; avgTtl: number; ttl: number } = {
            success: true,
            avgTtl: 0,
            ttl: 0
        };
        await this.checkAvgTTLLatency(basicCommonUrl, basicUrlInfo);

        // 基础URL延迟达标则使用
        if (basicUrlInfo.success && basicUrlInfo.avgTtl <= 200) {
            this.commonServerUrl = basicCommonUrl;
            cfAccInfo.setUseCF(false);
            return;
        }

        // 检查CF加速服务器延迟
        const cfUrlInfo: { success: boolean; avgTtl: number; ttl: number } = {
            success: true,
            avgTtl: 0,
            ttl: 0
        };
        await this.checkAvgTTLLatency(basicCFCommonUrl, cfUrlInfo);

        if (cfUrlInfo.success && cfUrlInfo.avgTtl <= 200) {
            this.commonServerUrl = basicCFCommonUrl;
            cfAccInfo.setUseCF(true);
            return;
        }

        // 两者都达标则选延迟低的，否则保持原有设置
        if (basicUrlInfo.success && cfUrlInfo.success) {
            cfAccInfo.setUseCF(basicUrlInfo.avgTtl > cfUrlInfo.avgTtl);
        } else {
            cfAccInfo.setUseCF(cfAccInfo.useCF);
        }
    }

    /**
     * 检查服务器平均TTL延迟（3次请求取平均）
     * @param url 服务器地址
     * @param result 延迟检查结果
     * @returns 是否检查成功
     */
    public async checkAvgTTLLatency(
        url: string, 
        result: { success: boolean; ttl: number; avgTtl: number }
    ): Promise<boolean> {
        result.success = true;
        result.ttl = 0;
        let requestCount = 0;

        while (requestCount < 3) {
            const startTime = new Date().getTime();
            try {
                const versionRes = await CommonServer.Instance().getVersion(url);
                result.ttl += new Date().getTime() - startTime;

                if (CommonServer.isServerResponseError(versionRes)) {
                    result.success = false;
                    return false;
                }
            } catch (error) {
                result.success = false;
                return false;
            }
            requestCount++;
        }

        result.avgTtl = result.ttl / 3;
        cc.log("url:%s, ret:%s".format(url, JSON.stringify(result)));
        return true;
    }
}