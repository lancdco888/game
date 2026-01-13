import AssetBundleManager from "../../../Script/AssetBundle/AssetBundleManager";
import LanguageManager from "../../../Script/Config/LanguageManager";
import CommonServer from "../../../Script/Network/CommonServer";
import CommonPopup from "../../../Script/Popup/CommonPopup";
import LoadingPopup from "../../../Script/Popup/LoadingPopup";
import UserInfo from "../../../Script/User/UserInfo";
import SDefine from "../../../Script/global_utility/SDefine";
import TSUtility from "../../../Script/global_utility/TSUtility";
import LoadingSlotProcess from "../../../Script/manager/LoadingSlotProcess";
import PopupManager from "../../../Script/manager/PopupManager";
import ServiceSlotDataManager from "../../../Script/manager/ServiceSlotDataManager";
import SlotManager from "../../../Script/manager/SlotManager";
import SlotTourneyManager from "../../../Script/manager/SlotTourneyManager";
import MessageRoutingManager from "../../../Script/message/MessageRoutingManager";

const { ccclass, property } = cc._decorator;

/**
 * 游戏内场景移动管理器（主要处理Slots场景跳转逻辑）
 */
@ccclass()
export default class InGameMoveManager extends cc.Component {
    // 高进入门槛的最低金币数
    private HIGH_ENTRY_MIN_COIN: number = 120000;
    // 跳转信息缓存
    private _info: any = null;
    // 是否正在执行场景移动
    private _isMoveScene: boolean = false;

    /**
     * 设置是否正在移动场景（仅写属性）
     */
    set isMoveScene(value: boolean) {
        this._isMoveScene = value;
    }

    /**
     * 初始化方法（注册消息监听）
     */
    public async initialize(): Promise<void> {
        MessageRoutingManager.instance().addListenerTarget(
            MessageRoutingManager.MSG.MOVE_TO_SLOT,
            this.asyncMoveToSlot,
            this
        );
    }

    /**
     * 组件销毁时清理监听
     */
    public onDestroy(): void {
        MessageRoutingManager.instance().removeListenerTargetAll(this);
    }

    /**
     * 异步跳转到Slots场景
     * @param e 跳转参数（包含slotID/zoneID/zoneName/sceneName等）
     */
    public async asyncMoveToSlot(e: any): Promise<void> {
        // 过滤无效请求
        if (this._isMoveScene || !TSUtility.isValid(e) || !TSUtility.isValid(e.slotID)) {
            return;
        }

        // 检查是否正在Spin状态
        const isSpinAble = await this.isSpinState();
        if (!isSpinAble) {
            return;
        }

        this._info = e;
        this.setZoneInfo();
        PopupManager.Instance().showDisplayProgress(true);

        // 验证Slots有效性
        const isSlotValid = await this.isSlotValidation();
        if (!isSlotValid) {
            PopupManager.Instance().showDisplayProgress(false);
            return;
        }

        this._isMoveScene = true;

        // 检查Casino访问权限
        if (!this.isPassableCasino()) {
            this._isMoveScene = false;
            PopupManager.Instance().setOnAllPopupClose(null);
            SlotManager.Instance.goToLobby(this._info.zoneID, this._info.zoneName);
            return;
        }

        try {
            // 更新Slots场景资源
            const needShowDownloadPopup = await this.updateSlotScene();
            if (!needShowDownloadPopup) {
                this.moveToSlot();
            }
        } catch (t) {
            cc.error("exception ", t.toString());
            // FireHoseSender.Instance().sendAws(
            //     FireHoseSender.Instance().getRecord(FireHoseSender.FHLogType.Exception, t)
            // );
        }
    }

    /**
     * 检查当前是否处于Spin状态，并处理确认弹窗
     * @returns 是否可以继续跳转（true=可以，false=取消）
     */
    public async isSpinState(): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            // 如果不在Spin状态，直接允许跳转
            if (!SlotManager.Instance.isSpinState()) {
                resolve(true);
                return;
            }

            PopupManager.Instance().showDisplayProgress(true);
            
            // 显示确认弹窗
            CommonPopup.getPopup("TypeB", (isCancel: Error, popup: any) => {
                PopupManager.Instance().showDisplayProgress(false);
                
                if (isCancel) {
                    resolve(false);
                } else {
                    popup.open()
                        .setOkBtn("YES", () => {
                            PopupManager.Instance().resetOpenPopup();
                            PopupManager.Instance().resetScreenShot();
                            resolve(true);
                        })
                        .setCancelBtn("NO", () => {
                            resolve(false);
                        })
                        .setInfo(
                            "Spin in progress.\nAre you sure you want to leave?",
                            "* The spin result will apply to your \nbalance automatically"
                        );
                }
            });
        });
    }

    /**
     * 验证Slots的有效性（请求服务器检查）
     * @returns 是否有效
     */
    public async isSlotValidation(): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            let tourneyParams = null;
            
            // 组装锦标赛参数
            if (SDefine.SlotTournament_Use && SlotTourneyManager.Instance().isEnterSlotTourney()) {
                tourneyParams = {
                    tourneyID: SlotTourneyManager.Instance().getEnterTourneyID(),
                    tourneyTier: SlotTourneyManager.Instance().getEnterTourneyTier()
                };
            }

            PopupManager.Instance().showDisplayProgress(true);

            try {
                // 请求服务器获取Slots信息
                const slotGameInfo = await CommonServer.Instance().getSlotGameInfo(
                    UserInfo.instance().getUid(),
                    UserInfo.instance().getAccessToken(),
                    this._info.zoneID,
                    this._info.slotID,
                    JSON.stringify(tourneyParams)
                );

                PopupManager.Instance().showDisplayProgress(false);

                // 检查服务器返回错误
                if (CommonServer.isServerResponseError(slotGameInfo)) {
                    MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_SLOT_ERROR_MESSAGE_BOX);
                    resolve(false);
                    return;
                }

                // 检查Slots是否激活
                if (!TSUtility.isValid(slotGameInfo) || (TSUtility.isValid(slotGameInfo.isActive) && !slotGameInfo.isActive)) {
                    MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_SLOT_ERROR_MESSAGE_BOX);
                    resolve(false);
                    return;
                }

                // 检查是否有保存的进度
                let hasSavedProgress = false;
                if (TSUtility.isValid(slotGameInfo.slotState)) {
                    const nextSubGameKey = slotGameInfo.slotState.nextSubGameKey;
                    if (TSUtility.isValid(nextSubGameKey) && nextSubGameKey !== "" && nextSubGameKey !== "base") {
                        hasSavedProgress = true;
                    }

                    // 检查GaugeStackSlot的投注状态
                    if (ServiceSlotDataManager.instance.isGaugeStackSlot(this._info.slotID)) {
                        const baseSubGameState = slotGameInfo.slotState.subGameState.base;
                        if (TSUtility.isValid(baseSubGameState) && baseSubGameState.betLines > 0 && baseSubGameState.betPerLines > 0) {
                            hasSavedProgress = true;
                        }
                    }
                }

                // 有保存进度则显示提示弹窗
                if (hasSavedProgress) {
                    MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_MESSAGE_BOX, {
                        title: "SAVED PROGRESS FOUND",
                        message: "The previously saved play\nprogress will be resumed.",
                        isNotXButton: true,
                        close: () => {
                            resolve(true);
                        }
                    });
                } else {
                    resolve(true);
                }
            } catch (error) {
                PopupManager.Instance().showDisplayProgress(false);
                MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_SLOT_ERROR_MESSAGE_BOX);
                resolve(false);
            }
        });
    }

    /**
     * 更新Slots场景资源（检查是否需要下载）
     * @returns 是否需要显示下载弹窗
     */
    public async updateSlotScene(): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            // 不需要补丁系统或iOS下载提示关闭时，直接返回false
            if (!AssetBundleManager.Instance().isUsePatchSystem() || !SDefine.Mobile_iOS_DownloadNotiPopup_Flag) {
                resolve(false);
                return;
            }

            PopupManager.Instance().showDisplayProgress(true);

            // 获取下载信息
            const downloadInfo = await AssetBundleManager.Instance().getDownloadSceneInfoSync(this._info.sceneName);
            PopupManager.Instance().showDisplayProgress(false);
            
            cc.log("downloadInfo:" + JSON.stringify(downloadInfo));

            // 有需要下载的内容时显示弹窗
            if (downloadInfo.totFileSize > 0) {
                PopupManager.Instance().showDisplayProgress(true);
                
                CommonPopup.getCommonPopup((isCancel: Error, popup: any) => {
                    PopupManager.Instance().showDisplayProgress(false);
                    
                    if (isCancel) {
                        resolve(false);
                    } else {
                        const downloadText = LanguageManager.Instance().getCommonText("Download Contents.(%sMB)");
                        const noticeTitle = LanguageManager.Instance().getCommonText("Notice");
                        
                        popup.open()
                            .setInfo(noticeTitle, downloadText.format(downloadInfo.getMBFileSize().toFixed(2)), false)
                            .setOkBtn("OK", () => {
                                this.moveToSlot();
                            })
                            .setCancelBtn("CANCEL", () => {
                                this._isMoveScene = false;
                            });
                        resolve(true);
                    }
                });
            } else {
                resolve(false);
            }
        });
    }

    /**
     * 设置Zone信息（根据VIP等级和金币数调整）
     */
    public setZoneInfo(): void {
        if (!TSUtility.isValid(this._info.zoneID) || !TSUtility.isValid(this._info.zoneName)) {
            // 动态Slots默认分配Suite Zone
            if (TSUtility.isDynamicSlot(this._info.slotID)) {
                this._info.zoneID = SDefine.SUITE_ZONEID;
                this._info.zoneName = SDefine.SUITE_ZONENAME;
                return;
            }

            // 默认分配HighRoller Zone
            this._info.zoneID = SDefine.HIGHROLLER_ZONEID;
            this._info.zoneName = SDefine.HIGHROLLER_ZONENAME;

            // // VIP等级>=1则分配VIP Lounge
            // if (UserInfo.instance().getUserVipInfo().level >= 1) {
            //     this._info.zoneID = SDefine.VIP_LOUNGE_ZONEID;
            //     this._info.zoneName = SDefine.VIP_LOUNGE_ZONENAME;
            // }

            // 金币不足则降级为HighRoller
            if (UserInfo.instance().getTotalCoin() <= this.HIGH_ENTRY_MIN_COIN) {
                this._info.zoneID = SDefine.HIGHROLLER_ZONEID;
                this._info.zoneName = SDefine.HIGHROLLER_ZONENAME;
            }
        }
    }

    /**
     * 执行跳转到Slots场景的核心逻辑
     */
    public async moveToSlot(): Promise<void> {
        // 检查Loading弹窗是否可用
        if (!LoadingPopup.isAvailableLoadingPopup()) {
            const errorMsg = new Error(`_moveSlotScene fail zoneId: ${this._info.zoneID.toString()} sceneName:${this._info.sceneName}`);
            // FireHoseSender.Instance().sendAws(
            //     FireHoseSender.Instance().getRecord(FireHoseSender.FHLogType.Exception, errorMsg)
            // );
            return;
        }

        // 设置场景跳转前置信息
        UserInfo.instance().setPrevSceneSlot(false);
        UserInfo.instance().setZoneID(this._info.zoneID);
        UserInfo.instance().setZoneName(this._info.zoneName);

        // VIP Lounge特殊处理
        if (this._info.zoneName === SDefine.VIP_LOUNGE_ZONENAME) {
            const hasNewTag = ServiceSlotDataManager.instance.getHasTagSlot(
                SDefine.VIP_LOUNGE_ZONEID, 
                "new", 
                this._info.slotID
            );
            const hasEarlyAccessTag = ServiceSlotDataManager.instance.getHasTagSlot(
                SDefine.VIP_LOUNGE_ZONEID, 
                "early access", 
                this._info.slotID
            );

            // 有新标签/提前访问标签且可访问Suite Zone时，切换到Suite Zone
            if (
                (TSUtility.isValid(hasNewTag) && hasNewTag.numOrder) || 
                TSUtility.isValid(hasEarlyAccessTag)
            && UserInfo.instance().isPassAbleCasino(SDefine.SUITE_ZONEID, SDefine.SUITE_ZONENAME)) {
                this._info.zoneName = SDefine.SUITE_ZONENAME;
                UserInfo.instance().setZoneID(SDefine.SUITE_ZONEID);
                UserInfo.instance().setZoneName(SDefine.SUITE_ZONENAME);
            }
        }

        // 获取Slots资源数据
        const resourceData = ServiceSlotDataManager.instance.getResourceDataBySlotID(this._info.slotID);
        if (TSUtility.isValid(resourceData) && !resourceData.isHasCacheLongImage) {
            PopupManager.Instance().showDisplayProgress(true);
            await resourceData.preloadLongImage();
            PopupManager.Instance().showDisplayProgress(false);
        }

        // 启动Loading流程
        const loadingState = LoadingSlotProcess.Instance().getSlotToSlotState(
            this._info.zoneID,
            this._info.zoneName,
            SDefine.getSlotSceneInfo(this._info.slotID).sceneName,
            this._info.slotID
        );
        if (TSUtility.isValid(loadingState)) {
            loadingState.onStart();
        }
    }

    /**
     * 检查当前Zone/Casino是否可访问
     * @returns 是否可访问
     */
    public isPassableCasino(): boolean {
        return UserInfo.instance().isPassAbleCasino(
            this._info.zoneID, 
            this._info.zoneName, 
            this._info.slotID
        );
    }
}