const { ccclass } = cc._decorator;

// 项目内部模块导入 - 与原JS依赖完全一致
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import PopupManager from "../manager/PopupManager";
import AssetBundleManager from "../AssetBundle/AssetBundleManager";
import LanguageManager from "../Config/LanguageManager";
//import LoadingSlotProcess from "../Loading/LoadingSlotProcess";
import Analytics, { AnalyticsSlotEnterInfo } from "../Network/Analytics";
//import CommonServer from "../Network/CommonServer";
import EnterCasinoOfferPopup from "../Common/EnterCasinoOfferPopup";
import CommonPopup from "../Popup/CommonPopup";
// import LoadingPopup from "../Popup/LoadingPopup/LoadingPopup";
import ServiceInfoManager from "../ServiceInfoManager";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import UserInfo from "../User/UserInfo";
import MessageRoutingManager from "../message/MessageRoutingManager";
import LobbyScene from "../LobbyScene";
import SlotTourneyManager from "./SlotTourneyManager";
import ServiceSlotDataManager from "./ServiceSlotDataManager";
import LoadingSlotProcess from "./LoadingSlotProcess";


@ccclass
export default class LobbyMoveManager extends cc.Component {
    // ===================== 常量定义 - 与原JS完全一致 =====================
    private readonly HIGH_ENTRY_MIN_COIN: number = 120000; // 12e4

    // ===================== 私有成员变量 - 完整TS类型注解 =====================
    private _info: any = null;
    private _isMoveScene: boolean = false;

    // ===================== 访问器 - 还原原JS的isMoveScene属性劫持 功能完全一致 =====================
    public set isMoveScene(value: boolean) {
        this._isMoveScene = value;
    }

    // ===================== 生命周期 & 初始化 =====================
    public initialize(): Promise<void> {
        return new Promise(async (resolve) => {
            MessageRoutingManager.instance().addListenerTarget(
                MessageRoutingManager.MSG.MOVE_TO_SLOT, 
                this.asyncMoveToSlot, 
                this
            );
            resolve();
        });
    }

    onDestroy(): void {
        MessageRoutingManager.instance().removeListenerTargetAll(this);
    }

    // ===================== 核心业务方法 - 大厅跳转老虎机主入口 =====================
    public asyncMoveToSlot = async (data: any): Promise<void> => {
        if (this._isMoveScene || !TSUtility.isValid(data) || !TSUtility.isValid(data.slotID)) {
            return;
        }

        this._info ={slotID:"mooorecheddar"};
        this.setZoneInfo();
        PopupManager.Instance().showDisplayProgress(true);

        // 老虎机合法性校验
        // const isValid = await this.isSlotValidation();
        // if (!isValid) {
        //     PopupManager.Instance().showDisplayProgress(false);
        //     return;
        // }

        this._isMoveScene = true;
        this.setTournamentInfo();
        // this.setSlotMoveLog();

        // // 进入赌场权限校验
        // if (!this.isPassableCasino()) {
        //     this._isMoveScene = false;
        //     return;
        // }

        try {
            // 更新老虎机场景资源信息
            // const isNeedDownload = await this.updateSlotScene();
            // if (!isNeedDownload) {
                await this.moveToSlot();
            // }
        } catch (err) {
            const errorMsg = err as Error;
            cc.error("exception ", errorMsg.toString());
            // FireHoseSender.Instance().sendAws(
            //     FireHoseSender.Instance().getRecord(FHLogType.Exception, errorMsg)
            // );
        }
    }

    // ===================== 私有核心方法 - 老虎机合法性校验 =====================
    private isSlotValidation = async (): Promise<boolean> => {
        return new Promise(async (resolve) => {
            let tourneyParam = null;
            // 锦标赛模式参数组装
            if (SDefine.SlotTournament_Use && SlotTourneyManager.Instance().isEnterSlotTourney()) {
                tourneyParam = {
                    tourneyID: SlotTourneyManager.Instance().getEnterTourneyID(),
                    tourneyTier: SlotTourneyManager.Instance().getEnterTourneyTier()
                };
            }

            PopupManager.Instance().showDisplayProgress(true);
            // // 请求老虎机游戏信息
            // const res = await CommonServer.Instance().getSlotGameInfo(
            //     UserInfo.instance().getUid(),
            //     UserInfo.instance().getAccessToken(),
            //     this._info.zoneID,
            //     this._info.slotID,
            //     JSON.stringify(tourneyParam)
            // );
            // PopupManager.Instance().showDisplayProgress(false);

            // // 服务器返回错误 → 打开错误弹窗
            // if (CommonServer.isServerResponseError(res)) {
            //     MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_SLOT_ERROR_MESSAGE_BOX);
            //     resolve(false);
            //     return;
            // }

            // 老虎机未激活 → 打开错误弹窗
            // if (!TSUtility.isValid(res) || (TSUtility.isValid(res.isActive) && res.isActive === 0)) {
            //     MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_SLOT_ERROR_MESSAGE_BOX);
            //     resolve(false);
            //     return;
            // }

            // // 检测是否有保存的游戏进度 → 弹出恢复提示
            // let hasSavedProgress = false;
            // if (TSUtility.isValid(res.slotState)) {
            //     const nextSubGameKey = res.slotState.nextSubGameKey;
            //     if (TSUtility.isValid(nextSubGameKey) && nextSubGameKey !== "" && nextSubGameKey !== "base") {
            //         hasSavedProgress = true;
            //     }

            //     // 检测GaugeStack老虎机进度
            //     if (ServiceSlotDataManager.instance.isGaugeStackSlot(this._info.slotID)) {
            //         const baseState = res.slotState.subGameState.base;
            //         if (TSUtility.isValid(baseState) && baseState.betLines > 0 && baseState.betPerLines > 0) {
            //             hasSavedProgress = true;
            //         }
            //     }
            // }

            // if (hasSavedProgress) {
            //     MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_MESSAGE_BOX, {
            //         title: "SAVED PROGRESS FOUND",
            //         message: "The previously saved play\nprogress will be resumed.",
            //         isNotXButton: true,
            //         close: () => { resolve(true); }
            //     });
            // } else {
            //     resolve(true);
            // }
        });
    }

    // ===================== 私有核心方法 - 更新老虎机场景资源信息 =====================
    private updateSlotScene = async (): Promise<boolean> => {
        return new Promise(async (resolve) => {
            // 无需补丁/非iOS环境 → 直接跳转
            // if (!AssetBundleManager.Instance().isUsePatchSystem() || !SDefine.Mobile_iOS_DownloadNotiPopup_Flag) {
            //     resolve(false);
            //     return;
            // }

            PopupManager.Instance().showDisplayProgress(true);
            const downloadInfo = await AssetBundleManager.Instance().getDownloadSceneInfoSync(this._info.sceneName);
            PopupManager.Instance().showDisplayProgress(false);
            
            cc.log("downloadInfo:" + JSON.stringify(downloadInfo));
            // 无资源需要下载 → 直接跳转
            if (downloadInfo.totFileSize <= 0) {
                resolve(false);
                return;
            }

            PopupManager.Instance().showDisplayProgress(true);
            // 弹出资源下载确认弹窗
            CommonPopup.getCommonPopup((isCancel, popup) => {
                PopupManager.Instance().showDisplayProgress(false);
                if (isCancel) {
                    resolve(false);
                    return;
                }

                const downloadText = LanguageManager.Instance().getCommonText("Download Contents.(%sMB)");
                const noticeTitle = LanguageManager.Instance().getCommonText("Notice");
                const mbSize = downloadInfo.getMBFileSize().toFixed(2);

                popup.open()
                    .setInfo(noticeTitle, downloadText.format(mbSize), false)
                    .setOkBtn("OK", () => { this.moveToSlot(); })
                    .setCancelBtn("CANCEL", () => { this._isMoveScene = false; });
                resolve(true);
            });
        });
    }

    // ===================== 私有方法 - 设置区域信息（VIP/高倍/套房区） =====================
    private setZoneInfo(): void {
        if (!TSUtility.isValid(this._info.zoneID) || !TSUtility.isValid(this._info.zoneName)) {
            // 动态老虎机 → 套房区
            if (TSUtility.isDynamicSlot(this._info.slotID)) {
                this._info.zoneID = SDefine.SUITE_ZONEID;
                this._info.zoneName = SDefine.SUITE_ZONENAME;
                return;
            }

            // 默认高倍区 → VIP等级达标则切换VIP区
            this._info.zoneID = SDefine.HIGHROLLER_ZONEID;
            this._info.zoneName = SDefine.HIGHROLLER_ZONENAME;
            
            // if (UserInfo.instance().getUserVipInfo().level >= 1) {
            //     this._info.zoneID = SDefine.VIP_LOUNGE_ZONEID;
            //     this._info.zoneName = SDefine.VIP_LOUNGE_ZONENAME;
            // }

            // // 金币不足门槛 → 切回高倍区
            // if (UserInfo.instance().getTotalCoin() <= this.HIGH_ENTRY_MIN_COIN) {
            //     this._info.zoneID = SDefine.HIGHROLLER_ZONEID;
            //     this._info.zoneName = SDefine.HIGHROLLER_ZONENAME;
            // }
        }
    }

    // ===================== 私有核心方法 - 执行老虎机场景跳转 =====================
    private moveToSlot = async (): Promise<void> => {
        // 保存大厅滚动位置
        // const scrollView = LobbyScene.instance.UI.getScrollView();
        // if (TSUtility.isValid(scrollView) && typeof scrollView.getCurrentScrollOffset === "function") {
        //     ServiceInfoManager.NUMBER_LAST_LOBBY_SCROLL_OFFSET = scrollView.getCurrentScrollOffset();
        // }

        // // 标记首次访问大厅
        // if (!ServerStorageManager.getAsBoolean(StorageKeyType.FIRST_VISIT_LOBBY)) {
        //     ServerStorageManager.save(StorageKeyType.FIRST_VISIT_LOBBY, true);
        // }

        // // 加载弹窗不可用 → 上报异常
        // if (!LoadingPopup.isAvailableLoadingPopup()) {
        //     const err = new Error("_moveSlotScene fail zoneId: %s sceneName:%s".format(
        //         this._info.zoneID.toString(), 
        //         this._info.sceneName
        //     ));
        //     FireHoseSender.Instance().sendAws(
        //         FireHoseSender.Instance().getRecord(FHLogType.Exception, err)
        //     );
        //     return;
        // }

        // // 设置用户位置信息
        // UserInfo.instance().setPrevLocation("Lobby");
        // UserInfo.instance().setPrevSceneSlot(false);
        // UserInfo.instance().setZoneID(this._info.zoneID);
        // UserInfo.instance().setZoneName(this._info.zoneName);

        // VIP区特殊处理 → 切换到套房区
        if (this._info.zoneName === SDefine.VIP_LOUNGE_ZONENAME) {
            const hasNewTag = ServiceSlotDataManager.instance.getHasTagSlot(SDefine.VIP_LOUNGE_ZONEID, "new", this._info.slotID);
            const hasEarlyAccessTag = ServiceSlotDataManager.instance.getHasTagSlot(SDefine.VIP_LOUNGE_ZONEID, "early access", this._info.slotID);
            
            // if (
            //     (TSUtility.isValid(hasNewTag) && hasNewTag.numOrder === 1) || 
            //     TSUtility.isValid(hasEarlyAccessTag)
            // && UserInfo.instance().isPassAbleCasino(SDefine.SUITE_ZONEID, SDefine.SUITE_ZONENAME) {
            //     this._info.zoneName = SDefine.SUITE_ZONENAME;
            //     UserInfo.instance().setZoneID(SDefine.SUITE_ZONEID);
            //     UserInfo.instance().setZoneName(SDefine.SUITE_ZONENAME);
            // }
        }

        // 预加载老虎机长图资源
        const resData = ServiceSlotDataManager.instance.getResourceDataBySlotID(this._info.slotID);
        if (TSUtility.isValid(resData) && !resData.isHasCacheLongImage) {
            PopupManager.Instance().showDisplayProgress(true);
            await resData.preloadLongImage();
            PopupManager.Instance().showDisplayProgress(false);
        }

        // // 启动加载流程
        // const loadingState = LoadingSlotProcess.Instance().getLobbyToSlotState();
        // if (TSUtility.isValid(loadingState)) {
        //     ServiceInfoManager.STRING_MOVE_SLOT_INFO = JSON.stringify({
        //         slotID: this._info.slotID,
        //         zoneID: this._info.zoneID,
        //         zoneName: this._info.zoneName,
        //         sceneName: SDefine.getSlotSceneInfo(this._info.slotID).sceneName
        //     });

        //     loadingState.onStart();
        //     loadingState.addOnEndCallback(() => {
        //         ServiceInfoManager.STRING_MOVE_SLOT_INFO = "";
        //     });
        // }
         // 3. 执行Cocos场景加载
         cc.director.loadScene(
            "222_MoooreCheddar"
        );
    }

    // ===================== 私有方法 - 设置锦标赛信息 =====================
    private setTournamentInfo(): void {
        if (SDefine.SlotTournament_Use&& TSUtility.isValid(this._info.gotoSlotTourney) && this._info.gotoSlotTourney !== 0) {
            SlotTourneyManager.Instance().clearEnterSlotTourney();
            SlotTourneyManager.Instance().setEnterSlotTourney(this._info.TourneyTier, this._info.TourneyID);
        }
    }

    // ===================== 私有方法 - 上报老虎机点击日志 =====================
    private setSlotMoveLog(): void {
        const enterInfo = new AnalyticsSlotEnterInfo();
        enterInfo.location = ServiceInfoManager.STRING_SLOT_ENTER_LOCATION;
        enterInfo.flag = ServiceInfoManager.STRING_SLOT_ENTER_FLAG;
        Analytics.slotClick(this._info.zoneID, this._info.slotID, enterInfo);
    }

    // ===================== 私有核心方法 - 进入赌场权限校验 =====================
    private isPassableCasino(): boolean {
        // 有权限 → 直接放行
        // if (UserInfo.instance().isPassAbleCasino(this._info.zoneID, this._info.zoneName, this._info.slotID)) {
        //     return true;
        // }

        // // 无权限 → 弹出对应弹窗
        // if (!SDefine.FB_Instant_iOS_Shop_Flag) {
        //     PopupManager.Instance().showDisplayProgress(true);
        //     EnterCasinoOfferPopup.getPopup(this._info.zoneName, (isCancel, popup) => {
        //         PopupManager.Instance().showDisplayProgress(false);
        //         if (isCancel) return;

        //         popup.open(
        //             this._info.zoneID, 
        //             this._info.zoneName, 
        //             "", 
        //             new CommonServer.PurchaseEntryReason(SDefine.P_ENTRYPOINT_VIPLIMITSLOTBANNER, true), 
        //             true, 
        //             null
        //         ).setUnlockHigherBet(true);
        //     });
        // } else {
        //     // 弹出权限拒绝弹窗
        //     const denyTitle = "DENIAL OF ENTRY";
        //     const denyMsg = this._info.zoneID === SDefine.VIP_LOUNGE_ZONEID 
        //         ? "Obtain Platinum orEarly Pass to Enter" 
        //         : "Obtain Diamond or\nSuite Pass to Enter";
            
        //     MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_MESSAGE_BOX, {
        //         title: denyTitle,
        //         message: denyMsg
        //     });
        // }

        return false;
    }
}