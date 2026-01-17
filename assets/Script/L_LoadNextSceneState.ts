import FireHoseSender, { FHLogType } from "./FireHoseSender";
import LoadingLobbyProcess from "./Loading/LoadingLobbyProcess";
import LoginProcess from "./LoginProcess";
import LoadingPopup from "./Popup/LoadingPopup";
import ADTargetManager from "./ServiceInfo/ADTargetManager";
import State from "./Slot/State";
import AdsManager from "./Utility/AdsManager";
import SDefine from "./global_utility/SDefine";
import LoadingSlotProcess from "./manager/LoadingSlotProcess";

const { ccclass, property } = cc._decorator;


/**
 * 加载下一场景状态类
 * 负责根据登录流程标记的目标场景（Slot/Lobby）启动对应加载流程，同时完成广告预加载、埋点统计、异常处理
 */
@ccclass()
export default class L_LoadNextSceneState extends State {
    /**
     * 启动加载下一场景流程
     */
    public onStart(): void {
        cc.log("L_LoadNextSceneState start");
        this.doProcess();
    }

    /**
     * 核心处理逻辑
     */
    public doProcess(): void {
        // 1. 初始化埋点（加载下一场景开始）
       // Analytics.default.loadNextSceneStart();

        // 2. 上报加载下一场景的埋点数据
        const sceneTrackData = {
            nextSceneName: LoginProcess.Instance().sceneName
        };
        //Analytics.default.loginProcessLoadNextScene(sceneTrackData);

        // 3. 获取目标场景类型（是否跳转到Slot）
        const isGoToSlot = LoginProcess.Instance().isGoToSlot;
        let loadingProcess: any = null;

        // 4. 检查Loading弹窗是否可用（核心前置条件）
        if (LoadingPopup.isAvailableLoadingPopup()) {
            // 4.1 广告预加载逻辑（仅广告可用时执行）
            if (AdsManager.Instance().isUseable()) {
                // 判断是否启用插屏广告
                const isInterstitialADEnabled = ADTargetManager.instance().enableInterstitialAD(false);
                cc.log("AdsManager.Instance preload start");
                cc.log("AdsManager.Instance preload Interstitial Target", isInterstitialADEnabled);

                // 预加载高优先级插屏广告
                AdsManager.Instance().preloadInterstitialHighAd();

                // 根据Admob配置决定是否延迟预加载插屏广告
                if (SDefine.Mobile_Admob_Use) {
                    AdsManager.Instance().delayedPreloadInterstitialAD();
                } else if (isInterstitialADEnabled) {
                    AdsManager.Instance().delayedPreloadInterstitialAD();
                }

                // 预加载高优先级激励广告 + 延迟预加载激励广告
                AdsManager.Instance().preloadHighRewardedAD();
                AdsManager.Instance().delayedPreLoadRewardedAD();
            }

            // 4.2 选择对应的加载流程（Slot/Lobby）
            loadingProcess = isGoToSlot 
                ? LoadingSlotProcess.Instance().getLauncherToSlotState()
                : LoadingLobbyProcess.Instance().getLauncherToLobbyState();

            // 4.3 启动加载流程 + 绑定结束回调
            loadingProcess.onStart();
            loadingProcess.addOnEndCallback(() => {
                // 加载完成埋点 + 标记状态结束
                //Analytics.default.loadNextSceneComplete();
                this.setDone();
            });
        } else {
            // 5. Loading弹窗不可用 → 上报异常到FireHose
            const error = new Error(`L_LoadNextSceneState fail gotoSlot: ${isGoToSlot.toString()}`);
            FireHoseSender.Instance().sendAws(
                FireHoseSender.Instance().getRecord(FHLogType.Exception, error)
            );
        }
    }
}