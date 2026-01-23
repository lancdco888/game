import { CommonRewardActionType, CommonRewardButtonType, CommonRewardSubTitleType, CommonRewardTitleType } from "../../resources/game/Scripts/CommonRewardEnum";
import CommonRewardPopup from "../../resources/game/Scripts/CommonRewardPopup";
import PowerGemSlotPopup, { PowerGemSlotOpenType } from "../../resources/game/Scripts/PowerGemSlotPopup";
import CommonServer from "../Network/CommonServer";
import ServiceInfoManager from "../ServiceInfoManager";
import SlotReelSpinStateManager from "../Slot/SlotReelSpinStateManager";
import UserInfo from "../User/UserInfo";
import { MobileReviewPopupPromotion } from "../User/UserPromotion";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";
import LocalStorageManager from "../manager/LocalStorageManager";
import PopupManager, { OpenPopupInfo } from "../manager/PopupManager";
import PowerGemManager, { PowerGemActionType } from "../manager/PowerGemManager";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import SlotGameRuleManager from "../manager/SlotGameRuleManager";
import SlotManager from "../manager/SlotManager";
import SoundManager from "../manager/SoundManager";
import ShopPromotionManager from "../message/ShopPromotionManager";
import HRVSlotService from "./HRVSlotService";

const { ccclass, property } = cc._decorator;
/**
 * 大赢（BigWin）特效服务组件
 * 负责处理SLOT大赢/史诗赢后的弹窗调度、PowerGem奖励、FBInstant截图/GIF生成、分享逻辑、各类促销弹窗加载等核心逻辑
 */
@ccclass()
export default class HRVSlotBigWinEffectService extends cc.Component {
    // === 实例属性 ===
    private hrvSlotService: HRVSlotService = null; // HRVSlot服务实例
    private _updateTakeScreenShot: Function = null; // GIF截图调度函数

    // === 静态方法 ===
    /**
     * 创建服务实例（挂载到Canvas节点下）
     * @param hrvSlotService HRVSlot服务实例
     * @returns HRVSlotBigWinEffectService 实例
     */
    static createInstance(hrvSlotService: HRVSlotService): HRVSlotBigWinEffectService {
        const node = new cc.Node("HRVSlotIngameMissionUIService");
        const component = node.addComponent(HRVSlotBigWinEffectService);
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        
        if (canvas) {
            node.parent = canvas.node;
        }
        
        component.InitData(hrvSlotService);
        return component;
    }

    // === 实例方法 ===
    /**
     * 初始化数据（绑定HRVSlot服务）
     * @param hrvSlotService HRVSlot服务实例
     */
    InitData(hrvSlotService: HRVSlotService): void {
        this.hrvSlotService = hrvSlotService;
    }

    /**
     * 大赢特效结束处理（核心入口方法）
     * @param winInfo 赢奖信息对象（包含isEpicWin/isOverBigWin/getEarnMoney/fnCallback等属性）
     * @returns boolean - 是否继续后续流程
     */
    onEndProcess(winInfo: {
        isEpicWin: () => number;
        getEarnMoney: () => number;
        isOverBigWin: () => number;
        fnCallback?: Function;
    }): boolean {
        // 1. 史诗赢埋点 + 恢复鼠标拖拽 + 重置音量 + 记录最大赢奖金额
        if (winInfo.isEpicWin() === 1) {
            //Analytics.slotEpicWin();
        }
        SlotManager.Instance.setMouseDragEventFlag(true);
        SoundManager.Instance().resetTemporarilyMainVolume();
        SlotManager.Instance.setBiggestWinCoin(winInfo.getEarnMoney());

        // 测试模式：直接检查下一个弹窗并终止
        if (TSUtility.isTestDirectSlotMode()) {
            PopupManager.Instance().checkNextOpenPopup();
            return false;
        }

        // 2. 非免费旋转/重旋转模式下，大赢且需要显示新记录弹窗 + 检查评分弹窗
        if (
            !SlotReelSpinStateManager.Instance.getFreespinMode() &&
            !SlotReelSpinStateManager.Instance.getRespinMode() &&
            winInfo.isOverBigWin() === 1 
            //&&ServicePopupManager.instance().reserveNewRecordPopup(winInfo.getEarnMoney()) === 1
        ) {
            this.checkAndAddRateUsPopup(winInfo);
        }

        // 3. 大赢且需要显示粉丝页弹窗：添加粉丝页介绍弹窗
        if (
            winInfo.isOverBigWin() === 1 &&
            ServiceInfoManager.instance.isShowFanPageOverlayIntroducePopup(0)
        ) {
            PopupManager.Instance().addOpenPopup(this.addFanpageOverlayIntroducePopupInfo());
        }

        // 4. FBInstant环境（安卓/网页）且非史诗赢：添加FBInstant弹窗
        if (
            Utility.isFacebookInstant()&&
            winInfo.isEpicWin() === 0 &&
            !ServiceInfoManager.BOOL_PLAYING_INSTANT_SHORTCUT 
            //&&FBInstantUtil.isTargetPlatform([FBInstantUtil.PLATFORM_ANDROID, FBInstantUtil.PLATFORM_WEB]) === 1
        ) {
            PopupManager.Instance().addOpenPopup(this.addFbinstatantPopoup());
            return false;
        }

        // 5. iOS FBInstant商店未启用且大赢：处理各类促销弹窗
        if (!SDefine.FB_Instant_iOS_Shop_Flag && winInfo.isOverBigWin() === 1) {
            let isFirstBargainEnable = false;
            
            // 首次优惠启用标记
            if (ServiceInfoManager.instance.isEnable1stBargain()) {
                isFirstBargainEnable = true;
            }

            // 5.1 史诗赢且首次优惠未启用：请求购买信息并加载史诗赢优惠弹窗
            if (
                !ServiceInfoManager.instance.isEpicWinOffer()&&
                winInfo.isEpicWin() === 1 &&
                isFirstBargainEnable === false
            ) {
                // CommonServer.Instance().requestPurchaseInfo(
                //     UserInfo.instance().getUid(),
                //     UserInfo.instance().getAccessToken(),
                //     (response: any) => {
                //         PopupManager.Instance().showDisplayProgress(false);
                        
                //         // 服务器响应错误：终止
                //         if (CommonServer.isServerResponseError(response)) {
                //             return false;
                //         }

                //         // 初始化购买信息 + 保存史诗赢时间 + 修正优惠索引 + 加载史诗赢优惠弹窗
                //         UserInfo.instance()._userInfo.userPurchaseInfo.initUserPurchaseInfo(response.userPurchaseInfo);
                //         ServerStorageManager.saveCurrentServerTime(StorageByOsKeyType.EPIC_WIN_TIME);
                        
                //         const epicWinOfferIndex = ShopDataManager.Instance().getEpicWinOfferInfoIndex_2023();
                //         if (TSUtility.isValid(epicWinOfferIndex)) {
                //             for (let i = 0; i < epicWinOfferIndex.length; ++i) {
                //                 epicWinOfferIndex[i] = epicWinOfferIndex[i] < 0 ? 0 : (epicWinOfferIndex[i] > 13 ? 13 : epicWinOfferIndex[i]);
                //             }
                //         }
                        
                //         ServerStorageManager.save(StorageByOsKeyType.EPIC_WIN_OFFER_INDEX, epicWinOfferIndex);
                //         PopupManager.Instance().addOpenPopup(this.addEpicWinOfferInfo());
                //         this.checkAndAddRateUsPopup(winInfo);
                //     }
                // );
                return false;
            }

            // 5.2 非首次访问大厅且等级<10：终止
            const userLevel = UserInfo.instance().getUserLevelInfo().level;
            if (
                !ServerStorageManager.getAsBoolean(StorageKeyType.FIRST_VISIT_LOBBY) &&
                userLevel < 10
            ) {
                return true;
            }

            // // 5.3 加载促销优惠弹窗
            // const firstBargainPopInfo = FirstBargainSaleManager.Instance().getOpenablePopInfo(false);
            // const isFirstBargainPopInvalid = firstBargainPopInfo == null || firstBargainPopInfo.isAvailable() === 0;
            // const offerInfo = this.addOfferInfo(winInfo, false);
            // const lastBigWinOfferTime = LocalStorageManager.getOpenBigwinOffer(UserInfo.instance().getUid());
            // const isBigWinOfferExpired = TSUtility.getServerBaseNowUnixTime() - lastBigWinOfferTime >= 3600;
            // let isForceShowFirstBargain = false;

            // // 首次优惠弹窗强制显示标记
            // if (
            //     offerInfo != null &&
            //     offerInfo.type === "FirstBargainNew" &&
            //     (FirstBargainSaleManager.Instance().getReserveForceedPopupOffer() || isFirstBargainPopInvalid)
            // ) {
            //     isForceShowFirstBargain = true;
            // }

            // // 优惠弹窗有效且过期/强制显示：加载弹窗
            // if (offerInfo != null && (isBigWinOfferExpired || isForceShowFirstBargain)) {
            //     LocalStorageManager.setOpenBigwinOffer(UserInfo.instance().getUid());
            //     PopupManager.Instance().addOpenPopup(offerInfo);
            //     this.checkAndAddRateUsPopup(winInfo);
            //     return false;
            // }
        }

        return true;
    }

    /**
     * 检查并添加评分弹窗（仅移动端、非移动弹窗打开状态下生效）
     * @param winInfo 赢奖信息对象
     */
    checkAndAddRateUsPopup(winInfo: {
        isOverBigWin: () => number;
        fnCallback?: Function;
    }): void {
        if (!Utility.isMobileGame() && !SlotManager.Instance._isOpenMovePopup) {
            // Android版本限制：终止
            if (SDefine.Mobile_AOS_ReviceVersion_Limitation) {
                return;
            }

            // 获取评分弹窗促销信息 + 大赢次数 + 已打开评分弹窗标记
            const reviewPromotion = UserInfo.instance().getPromotionInfo(MobileReviewPopupPromotion.PromotionKeyName);
            const bigWinOverCount = ServiceInfoManager.NUMBER_BIG_WIN_OVER_COUNT;
            const isRateUsPopupOpened = ServiceInfoManager.BOOL_OPENED_RATE_US_POPUP;
            const isReviewPromotionReceived = reviewPromotion == null || reviewPromotion.isReceived;

            // 日志输出
            cc.log(
                `checkAndAddRateUsPopup [isReceived:${isReviewPromotionReceived.toString()}]` +
                `[bigWinCnt:${bigWinOverCount.toString()}][haveOpenPopup:${isRateUsPopupOpened.toString()}]`
            );

            // 未领取促销 + 大赢次数>1 + 未打开评分弹窗 + 非首次会话：添加评分弹窗
            if (
                isReviewPromotionReceived === 0 &&
                bigWinOverCount > 1 &&
                !isRateUsPopupOpened  &&
                !UserInfo.instance().isFirstUserSession()
            ) {
                if (ServiceInfoManager.BOOL_CHANGE_LEVEL) {
                    cc.log("checkAndAddRateUsPopup setReserveRateUsPopup");
                } else {
                    cc.log("checkAndAddRateUsPopup addRateUsInfo");
                    PopupManager.Instance().addOpenPopup(this.addRateUsInfo(winInfo));
                }
            }
        }
    }

    /**
     * 构建评分弹窗信息
     * @param winInfo 赢奖信息对象
     * @returns OpenPopupInfo - 评分弹窗配置
     */
    addRateUsInfo(winInfo: { fnCallback?: Function }): OpenPopupInfo {
        const popupInfo = new OpenPopupInfo();
        const winCallback = winInfo.fnCallback;

        popupInfo.type = "RateUsPopup";
        popupInfo.openCallback = () => {
            // 非移动弹窗打开状态：加载评分弹窗
            if (!SlotManager.Instance._isOpenMovePopup) {
                // PopupManager.Instance().showDisplayProgress(true);
                // RateUsPopup.getPopup((err: Error | null, popup: RateUsPopup) => {
                //     PopupManager.Instance().showDisplayProgress(false);
                    
                //     if (err) {
                //         PopupManager.Instance().checkNextOpenPopup();
                //     } else {
                //         ServiceInfoManager.BOOL_OPENED_RATE_US_POPUP = true;
                //         popup.open();
                //         popup.setCloseCallback(() => {
                //             if (TSUtility.isValid(winCallback)) {
                //                 winCallback();
                //             }
                //             PopupManager.Instance().checkNextOpenPopup();
                //         });
                //     }
                // });
            } else {
                PopupManager.Instance().checkNextOpenPopup();
            }
        };

        return popupInfo;
    }

    /**
     * 构建粉丝页介绍弹窗信息
     * @returns OpenPopupInfo - 粉丝页弹窗配置
     */
    addFanpageOverlayIntroducePopupInfo(): OpenPopupInfo {
        const popupInfo = new OpenPopupInfo();

        popupInfo.type = "addFanpageOverlayIntroducePopup";
        popupInfo.openCallback = () => {
            // PopupManager.Instance().showDisplayProgress(true);
            // FanpageOverayIntroducePopup.getPopup((err: Error | null, popup: FanpageOverayIntroducePopup) => {
            //     PopupManager.Instance().showDisplayProgress(false);
                
            //     if (!err) {
            //         popup.open();
            //         popup.setCloseCallback(() => {
            //             PopupManager.Instance().checkNextOpenPopup();
            //         });
            //     }
            // });
        };

        return popupInfo;
    }

    /**
     * 构建FBInstant弹窗信息
     * @returns OpenPopupInfo - FBInstant弹窗配置
     */
    addFbinstatantPopoup(): OpenPopupInfo {
        const popupInfo = new OpenPopupInfo();

        popupInfo.type = "isShowedLobbyShortCut";
        popupInfo.openCallback = () => {
            // const shortcutPromotion = UserInfo.instance().getPromotionInfo(FBInstantShortcutPromotion.PromotionKeyName);
            
            // // 快捷方式促销可用：添加快捷方式弹窗
            // if (shortcutPromotion != null && shortcutPromotion.isUseable()) {
            //     PopupManager.Instance().addOpenPopup(this.getShortCutPopupInfo());
            // }
            
            // PopupManager.Instance().checkNextOpenPopup();
        };

        return popupInfo;
    }

    /**
     * 构建FBInstant快捷方式弹窗信息
     * @returns OpenPopupInfo - 快捷方式弹窗配置
     */
    getShortCutPopupInfo(): OpenPopupInfo {
        const popupInfo = new OpenPopupInfo();

        popupInfo.type = "ShotCutPromotion";
        popupInfo.openCallback = () => {
            // // 检查是否可创建快捷方式
            // FBInstant.canCreateShortcutAsync().then((isAble: boolean) => {
            //     if (isAble) {
            //         // 保存快捷方式显示标记
            //         FBInstant.player.setDataAsync({ isShowedBigWinShortCut: true })
            //             .then(() => log("isShowedBigWinShortCut Save"))
            //             .catch(() => log("isShowedBigWinShortCut save failed"));
                    
            //         ServiceInfoManager.BOOL_PLAYING_INSTANT_SHORTCUT = true;
                    
            //         // 创建快捷方式并领取促销奖励
            //         FBInstant.createShortcutAsync().then(() => {
            //             CommonServer.Instance().requestAcceptPromotion(
            //                 UserInfo.instance().getUid(),
            //                 UserInfo.instance().getAccessToken(),
            //                 FBInstantShortcutPromotion.PromotionKeyName,
            //                 1,
            //                 0,
            //                 "",
            //                 (response: any) => {
            //                     if (CommonServer.isServerResponseError(response)) {
            //                         PopupManager.Instance().checkNextOpenPopup();
            //                     } else {
            //                         // 应用奖励并播放金币动画
            //                         const changeResult = UserInfo.instance().getServerChangeResult(response);
            //                         const oldCoin = UserInfo.instance().getTotalCoin();
            //                         const changeCoin = changeResult.getTotalChangeCoin();
                                    
            //                         InstantsRewardPopoup.getPopup((err: Error | null, popup: InstantsRewardPopoup) => {
            //                             popup.open();
            //                             popup.setRewardAmount(changeCoin, 0, 0);
            //                             popup.setCollectCallback(() => {
            //                                 UserInfo.instance().applyChangeResult(changeResult);
            //                                 const newCoin = UserInfo.instance().getTotalCoin();
                                            
            //                                 CoinToTargetEffect.playEffectToMyCoinInGameInfo(
            //                                     popup.collectButton.node,
            //                                     oldCoin,
            //                                     newCoin,
            //                                     changeCoin,
            //                                     () => {
            //                                         popup.close();
            //                                         PopupManager.Instance().checkNextOpenPopup();
            //                                     }
            //                                 );
            //                             });
            //                         });
            //                     }
            //                 }
            //             );
            //         }).catch(() => {
            //             PopupManager.Instance().checkNextOpenPopup();
            //         });
            //     } else {
            //         PopupManager.Instance().checkNextOpenPopup();
            //     }
            // }).catch((err: Error) => {
            //     // 上报异常日志
            //     const errorMsg = new Error("getShortCutPopupInfo FBInstant.player.canCreateShortcutAsync fail SlotBigWinEffect");
            //     FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FireHoseSender.FHLogType.Exception, errorMsg, err));
            //     PopupManager.Instance().checkNextOpenPopup();
            // });
        };

        return popupInfo;
    }

    /**
     * 构建Bot订阅弹窗信息（备用逻辑）
     * @returns OpenPopupInfo - Bot弹窗配置
     */
    getBotPopupInfo(): OpenPopupInfo {
        const popupInfo = new OpenPopupInfo();

        popupInfo.type = "bot";
        popupInfo.openCallback = () => {
            const now = Utility.getUnixTimestamp();
            
            // // 保存Bot弹窗最后查看时间
            // FBInstant.player.setDataAsync({ LastWatchedBotPopupTime: now })
            //     .then(() => log("LastWatchedBotPopupTime Save"))
            //     .catch(() => log("LastWatchedBotPopupTime save failed"));
            
            // // 检查是否可订阅Bot
            // FBInstant.player.canSubscribeBotAsync().then((isAble: boolean) => {
            //     if (isAble) {
            //         FBInstant.player.subscribeBotAsync()
            //             .then(() => PopupManager.Instance().checkNextOpenPopup())
            //             .catch(() => PopupManager.Instance().checkNextOpenPopup());
            //     } else {
            //         PopupManager.Instance().checkNextOpenPopup();
            //     }
            // }).catch((err: Error) => {
            //     // 上报异常日志
            //     const errorMsg = new Error("getBotPopupInfo FBInstant.player.canSubscribeBotAsync fail SlotBigWinEffect");
            //     FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FireHoseSender.FHLogType.Exception, errorMsg, err));
            //     PopupManager.Instance().checkNextOpenPopup();
            // });
        };

        return popupInfo;
    }

    /**
     * 构建史诗赢优惠弹窗信息
     * @returns OpenPopupInfo - 史诗赢优惠弹窗配置
     */
    addEpicWinOfferInfo(): OpenPopupInfo {
        const popupInfo = new OpenPopupInfo();

        popupInfo.type = "EpicWinOffer";
        popupInfo.openCallback = () => {
            ServiceInfoManager.instance.addSpinOpenPopup("EpicWin");
            ServiceInfoManager.NUMBER_EPIC_WIN_OFFER_OPEN_TIME = TSUtility.getServerBaseNowUnixTime();
            
            // PopupManager.Instance().showDisplayProgress(true);
            // EpicWinOfferPopup.getPopup((err: Error | null, popup: EpicWinOfferPopup) => {
            //     PopupManager.Instance().showDisplayProgress(false);
                
            //     if (!err) {
            //         const purchaseReason = new PurchaseEntryReason(SDefine.P_ENTRYPOINT_INGAMEOFFER, false);
            //         popup.open(purchaseReason, true);
            //         popup.setCloseCallback(() => {
            //             PopupManager.Instance().checkNextOpenPopup();
            //         });
            //     }
            // });
        };

        return popupInfo;
    }

    /**
     * 构建促销优惠弹窗信息（首次优惠/季节性促销/限时优惠）
     * @param winInfo 赢奖信息对象
     * @param isSecretStash 是否为SecretStash优惠
     * @returns OpenPopupInfo | null - 优惠弹窗配置（无则返回null）
     */
    addOfferInfo(winInfo: { fnCallback?: Function }, isSecretStash: boolean): OpenPopupInfo | null {
        // iOS FBInstant商店启用：返回null
        if (SDefine.FB_Instant_iOS_Shop_Flag) {
            return null;
        }

        // // 标记：首次优惠/季节性促销/限时优惠是否启用
        // const isFirstBargainEnable = ServiceInfoManager.instance.isEnable1stBargain();
        // const isSeasonalPromotionEnable = ShopPromotionManager.Instance().getSeasonalPromotionInfo_PopupType() != null;
        // const isLimitedTimeOfferEnable = UserInfo.instance().getUserServiceInfo().totalPurchaseCnt > 0 && ServiceInfoManager.instance().isEnableLimitedTimeOffer() === 1;
        
        // // 构建购买入口原因
        // const purchaseReason = new PurchaseEntryReason(SDefine.P_ENTRYPOINT_INGAMEOFFER, false);

        // // 1. 首次优惠弹窗
        // if (isFirstBargainEnable) {
        //     const popupInfo = new OpenPopupInfo();
        //     popupInfo.type = "FirstBargainNew";
        //     popupInfo.openCallback = () => {
        //         ServiceInfoManager.instance().addSpinOpenPopup(popupInfo.type);
        //         PopupManager.Instance().showDisplayProgress(true);
                
        //         // 获取首次优惠弹窗信息
        //         let firstBargainPopInfo = FirstBargainSaleManager.Instance().getOpenablePopInfo(false);
        //         if (firstBargainPopInfo == null || firstBargainPopInfo.isAvailable() === 0) {
        //             FirstBargainSaleManager.Instance().setStartFirstBargain();
        //             firstBargainPopInfo = FirstBargainSaleManager.Instance().getOpenablePopInfo(false);
        //         }

        //         // 根据弹窗类型加载对应弹窗
        //         switch (firstBargainPopInfo.type) {
        //             case "3": // 第四次优惠
        //                 FirstBargainRenewalForthOffer.openPopup(
        //                     purchaseReason,
        //                     winInfo.fnCallback,
        //                     (popup: FirstBargainRenewalForthOffer) => {
        //                         PopupManager.Instance().showDisplayProgress(false);
        //                         popup.setCloseCallback(() => PopupManager.Instance().checkNextOpenPopup());
        //                     }
        //                 );
        //                 break;
        //             case "2": // 第三次优惠
        //                 FirstBargainRenewalThirdOffer.openPopup(
        //                     purchaseReason,
        //                     winInfo.fnCallback,
        //                     (popup: FirstBargainRenewalThirdOffer) => {
        //                         PopupManager.Instance().showDisplayProgress(false);
        //                         popup.setCloseCallback(() => PopupManager.Instance().checkNextOpenPopup());
        //                     }
        //                 );
        //                 break;
        //             case "1": // 第二次优惠
        //                 FirstBargainRenewalSecondOffer.openPopup(
        //                     purchaseReason,
        //                     winInfo.fnCallback,
        //                     (popup: FirstBargainRenewalSecondOffer) => {
        //                         PopupManager.Instance().showDisplayProgress(false);
        //                         popup.setCloseCallback(() => PopupManager.Instance().checkNextOpenPopup());
        //                     }
        //                 );
        //                 break;
        //             default: // 首次优惠
        //                 FirstBargainRenewalPopup.openPopup(
        //                     purchaseReason,
        //                     winInfo.fnCallback,
        //                     (popup: FirstBargainRenewalPopup) => {
        //                         PopupManager.Instance().showDisplayProgress(false);
        //                         popup.setCloseCallback(() => PopupManager.Instance().checkNextOpenPopup());
        //                     }
        //                 );
        //                 break;
        //         }
        //     };
        //     return popupInfo;
        // }

        // // 2. 季节性促销弹窗（非SecretStash模式）
        // if (isSeasonalPromotionEnable && isSecretStash === false) {
        //     const popupInfo = new OpenPopupInfo();
        //     popupInfo.type = "OfferPromotion";
        //     popupInfo.openCallback = () => {
        //         ServiceInfoManager.instance().addSpinOpenPopup(popupInfo.type);
        //         PopupManager.Instance().showDisplayProgress(true);
                
        //         OfferPromotionPopup.getPopup((err: Error | null, popup: OfferPromotionPopup) => {
        //             PopupManager.Instance().showDisplayProgress(false);
                    
        //             if (err) {
        //                 PopupManager.Instance().checkNextOpenPopup();
        //             } else {
        //                 popup.open(purchaseReason, winInfo.fnCallback);
        //                 popup.setCloseCallback(() => PopupManager.Instance().checkNextOpenPopup());
        //             }
        //         });
        //     };
        //     return popupInfo;
        // }

        // // 3. 限时优惠弹窗（SecretStash模式）
        // if (isLimitedTimeOfferEnable && isSecretStash === true) {
        //     const popupInfo = new OpenPopupInfo();
        //     popupInfo.type = "SecretStashOffer";
        //     popupInfo.openCallback = () => {
        //         ServiceInfoManager.instance().addSpinOpenPopup(popupInfo.type);
        //         PopupManager.Instance().showDisplayProgress(true);
                
        //         SecretStashPopup.getPopup((err: Error | null, popup: SecretStashPopup) => {
        //             PopupManager.Instance().showDisplayProgress(false);
                    
        //             if (err) {
        //                 PopupManager.Instance().checkNextOpenPopup();
        //             } else {
        //                 popup.open(purchaseReason, winInfo.fnCallback);
        //                 popup.setCloseCallback(() => PopupManager.Instance().checkNextOpenPopup());
        //             }
        //         });
        //     };
        //     return popupInfo;
        // }

        return null;
    }

    /**
     * 大赢分享按钮点击处理（FB分享/GIF生成）
     * @param shareInfo 分享信息对象
     * @param winType 赢奖类型（2=BigWin/3=SuperWin/4=MegaWin）
     * @param isShare  是否分享
     * @param callback 分享完成回调
     */
    onClickCollect_BigWinEffect(
        shareInfo: {
            checkShareAble: (winType: number) => number;
            getBigWinShareInfo: () => any;
            getSuperWinShareInfo: () => any;
            getMegaWinShareInfo: () => any;
        },
        winType: number,
        isShare: number,
        callback: Function
    ): void {
        // 可分享且选择分享：处理分享逻辑
        if (shareInfo.checkShareAble(winType) === 1 && isShare === 1) {
            let winShareInfo: any;
            
            // 根据赢奖类型获取分享信息
            if (winType === 2) {
                winShareInfo = shareInfo.getBigWinShareInfo();
            } else if (winType === 3) {
                winShareInfo = shareInfo.getSuperWinShareInfo();
            } else if (winType === 4) {
                winShareInfo = shareInfo.getMegaWinShareInfo();
            }

            // // FBInstant环境：使用GIF截图分享
            // if (Utility.isFacebookInstant() === 1) {
            //     const gifBase64 = InstantGifMaker.Instance().getBase64GifData();
            //     UserInfo.instance().fbInstantShareWithShareType(
            //         gifBase64,
            //         "The BIG Win Slot Machines are ready.",
            //         winShareInfo,
            //         FBShareType.WinShare,
            //         callback
            //     );
            // } 
            // // 普通环境：直接FB分享
            // else {
            //     UserInfo.instance().facebookShareWithShareType(
            //         winShareInfo,
            //         FBShareType.WinShare,
            //         callback
            //     );
            // }
        } 
        // 不分享：直接执行回调
        else {
            callback();
        }

        // FBInstant环境：重置GIF生成器
        if (Utility.isFacebookInstant()) {
            //InstantGifMaker.Reset();
        }
    }

    /**
     * 大赢特效播放处理（启动GIF截图调度）
     * @param winInfo 赢奖信息对象
     * @param isBigWin 是否大赢
     * @param interval 截图间隔
     */
    onPlayEffect_BigWinEffect(winInfo: any, isBigWin: number, interval: number): void {
        // 移动端且大赢：增加大赢次数
        if (Utility.isMobileGame() && isBigWin === 1) {
            ServiceInfoManager.NUMBER_BIG_WIN_OVER_COUNT++;
        }
        
        // 启动GIF截图调度
        this.startInstantGifScreenShotScheduler(interval);
    }

    /**
     * 赢奖金币爆炸文字特效播放处理（完成GIF截图）
     */
    onPlayTextExplodeEffect_WinCoins_Burst(): void {
        // FBInstant环境：截图并结束调度
        if (Utility.isFacebookInstant()) {
            //InstantGifMaker.TakeScreenShot();
            this.finishInstantGifScreenShotScheduler();
        }
    }

    /**
     * 启动GIF截图调度（FBInstant环境）
     * @param interval 截图间隔
     */
    startInstantGifScreenShotScheduler(interval: number): void {
        if (Utility.isFacebookInstant()) {
            // // 重置GIF生成器
            // InstantGifMaker.Reset();
            
            // // 定义截图调度函数（截2张图后停止）
            // this._updateTakeScreenShot = () => {
            //     InstantGifMaker.TakeScreenShot();
                
            //     if (InstantGifMaker.Instance().getScreenShotCnt() === 2 && this._updateTakeScreenShot) {
            //         this.unschedule(this._updateTakeScreenShot);
            //         this._updateTakeScreenShot = null;
            //     }
            // };

            // 启动调度（间隔为总时长/3）
            // this.schedule(this._updateTakeScreenShot, interval / 3);
        }
    }

    /**
     * 结束GIF截图调度（补全3张截图）
     */
    finishInstantGifScreenShotScheduler(): void {
        if (Utility.isFacebookInstant()) {
            // 停止调度
            if (this._updateTakeScreenShot) {
                this.unschedule(this._updateTakeScreenShot);
                this._updateTakeScreenShot = null;
            }

            // // 补全3张截图（不足时用最后一张补充）
            // const screenShotCnt = InstantGifMaker.Instance().getScreenShotCnt();
            // if (screenShotCnt < 3) {
            //     const need补全 = 3 - screenShotCnt;
            //     const lastTexture = InstantGifMaker.Instance().getScreenShotTexture(screenShotCnt - 1);
                
            //     for (let i = 0; i < need补全; ++i) {
            //         InstantGifMaker.Instance().pushScreenShot(lastTexture);
            //     }
            // }
        }
    }

    /**
     * 爆炸文字特效播放处理（延迟截图）
     */
    onPlayTextExplodeEffect(): void {
        // FBInstant环境：0.7秒后截图
        if (Utility.isFacebookInstant()) {
            this.scheduleOnce(() => {
                //InstantGifMaker.TakeScreenShot();
            }, 0.7);
        }
    }

    /**
     * 按钮激活监听处理（截图）
     */
    onActiveBtnListener(): void {
        // FBInstant环境：截图
        if (Utility.isFacebookInstant()) {
            //InstantGifMaker.TakeScreenShot();
        }
    }

    /**
     * 检查大赢是否可分享（游客账号不可分享）
     * @returns boolean - 是否可分享
     */
    checkShareAble_BigWinEffect(): boolean {
        // 移动端且游客账号：不可分享
        if (Utility.isMobileGame() && UserInfo.instance().isGuestUser()) {
            return false;
        }
        return true;
    }

    /**
     * 播放PowerGem奖励特效（异步）
     * @returns Promise<void> - 异步操作Promise
     */
    async onPlayPowerGem(): Promise<void> {
        const powerGemInfo = PowerGemManager.instance.getActionPowerGemInfo();
        
        // PowerGem信息无效：终止
        if (!TSUtility.isValid(powerGemInfo)) {
            return;
        }

        // PowerGem类型：获取奖励
        if (powerGemInfo.getActionType() === PowerGemActionType.GET) {
            // await new Promise<void>((resolve, reject) => {
            //     PopupManager.Instance().showDisplayProgress(true);
            //     CommonRewardPopup.getPopup((err: Error | null, popup: CommonRewardPopup) => {
            //         PopupManager.Instance().showDisplayProgress(false);
                    
            //         if (err) {
            //             reject(err);
            //             return;
            //         }

            //         // 打开PowerGem奖励弹窗
            //         const actionInfo = PowerGemManager.instance.getActionPowerGemInfo();
            //         popup.openSingleResult(
            //             CommonRewardActionType.POWER_GEM,
            //             {
            //                 title: CommonRewardTitleType.POWER_GEM,
            //                 subTitle: CommonRewardSubTitleType.YOU_WON
            //             },
            //             CommonRewardButtonType.NONE,
            //             new CommonRewardPopupInfo_PowerGem(actionInfo)
            //         );
                    
            //         popup.setCloseCallback(() => {
            //             resolve();
            //         });
            //     });
            // });
        } 
        // PowerGem类型：升级
        else if (powerGemInfo.getActionType() === PowerGemActionType.UPGRADE) {
            await new Promise<void>((resolve, reject) => {
                PopupManager.Instance().showDisplayProgress(true);
                PowerGemSlotPopup.getPopup((err: Error | null, popup: PowerGemSlotPopup) => {
                    PopupManager.Instance().showDisplayProgress(false);
                    
                    if (err) {
                        reject(err);
                        return;
                    }

                    // 打开PowerGem升级弹窗
                    const actionInfo = PowerGemManager.instance.getActionPowerGemInfo();
                    if (TSUtility.isValid(actionInfo)) {
                        popup.open(PowerGemSlotOpenType.SLOT_UPGRADE, actionInfo.getSlotIndex());
                        popup.setCloseCallback(() => {
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            });
        }
    }

    /**
     * 检查是否播放PowerGem赢奖特效
     * @param winInfo 赢奖信息对象
     * @param winType 赢奖类型
     * @param winAmount 赢奖金额
     * @returns boolean - 是否播放
     */
    isPlayPowerGemWinEffect(winInfo: any, winType: number, winAmount: number): boolean {
        return PowerGemManager.instance.isPlayPowerGemWinEffect(winType, winAmount);
    }

    /**
     * 播放PowerGem教程-获取PowerGem（异步）
     * @param tutorialInfo 教程信息对象（包含nodeBlock/dimmObject等属性）
     * @returns Promise<void> - 异步操作Promise
     */
    async onPlayPowerGemTutorial_GetPowerGem(tutorialInfo: {
        nodeBlock: cc.Node;
        dimmObject: cc.Node;
    }): Promise<void> {
        const powerGemPromotion = PowerGemManager.instance.getPromotion();
        
        // PowerGem促销信息无效：终止
        if (!TSUtility.isValid(powerGemPromotion)) {
            return;
        }

        // 促销结束时间 <= 教程已完成时间：终止
        const promotionEndTime = powerGemPromotion.numEventEndDate;
        const tutorialFinishTime = ServerStorageManager.getAsNumber(StorageKeyType.TUTORIAL_POWER_GEM_FIRST_GET_POWER_GEM);
        if (promotionEndTime <= tutorialFinishTime) {
            return;
        }

        // 底部UI/PowerGem图标无效：终止
        if (!TSUtility.isValid(SlotManager.Instance.bottomUI) || !TSUtility.isValid(HRVSlotService.instance().getPowerGemSlotBottomIcon())) {
            return;
        }

        // 显示教程并播放动画
        tutorialInfo.nodeBlock.active = false;
        tutorialInfo.dimmObject.active = false;
        await HRVSlotService.instance().getPowerGemSlotBottomIcon().playPowerGemTutorial(1);
        
        // 恢复遮罩并关闭自动旋转
        tutorialInfo.nodeBlock.active = true;
        SlotReelSpinStateManager.Instance.changeAutospinMode(false);
        
        // 清空PowerGem动作信息
        PowerGemManager.instance.setActionPowerGemInfo(null);
    }

    /**
     * 检查PowerGem是否已奖励（非免费旋转模式）
     * @returns boolean - 是否已奖励
     */
    isPowerGemRewarded(): boolean {
        const powerGemInfo = PowerGemManager.instance.getActionPowerGemInfo();
        
        // PowerGem信息有效 + 类型为获取/升级 + 非免费旋转模式：已奖励
        return (
            TSUtility.isValid(powerGemInfo) &&
            (powerGemInfo.getActionType() === PowerGemActionType.GET || powerGemInfo.getActionType() === PowerGemActionType.UPGRADE) &&
            !SlotReelSpinStateManager.Instance.getFreespinMode()
        );
    }

    /**
     * 设置PowerGem奖励UI
     * @param uiInfo UI信息对象（包含isUpgradeAction/setLevelUI/arrResultGrade等属性）
     */
    setPowerGemRewardUI(uiInfo: {
        isUpgradeAction: boolean;
        setLevelUI: (level: number, grade: number) => void;
        arrResultGrade: cc.Node[];
    }): void {
        const powerGemInfo = PowerGemManager.instance.getActionPowerGemInfo();

        // PowerGem信息无效：设置基础等级UI
        if (!TSUtility.isValid(powerGemInfo)) {
            // 标记是否为升级操作
            uiInfo.isUpgradeAction = PowerGemManager.instance.isUpgradeAllows();
            
            if (uiInfo.isUpgradeAction === false) {
                // 获取当前投注金额/VIP等级 → 计算PowerGem等级/星级
                const currentBet = SlotGameRuleManager.Instance.getCurrentBetMoney();
                const vipLevel = UserInfo.instance().getUserLevel();
                const powerGemLevel = PowerGemManager.instance.getPowerGemLevel(currentBet);
                const powerGemGrade = PowerGemManager.instance.getPowerGemGrade(powerGemLevel, vipLevel);
                
                // 设置等级UI + 星级显示
                uiInfo.setLevelUI(powerGemLevel, powerGemGrade);
                uiInfo.arrResultGrade.forEach((node, index) => {
                    node.active = index === powerGemGrade;
                });
            } else {
                // 升级模式：获取开启的PowerGem信息
                const openingPowerGem = PowerGemManager.instance.getOpeningPowerGem();
                
                if (TSUtility.isValid(openingPowerGem)) {
                    uiInfo.setLevelUI(openingPowerGem.getPowerGemLevel(), openingPowerGem.getPowerGemLevelGradeType());
                    uiInfo.arrResultGrade.forEach((node, index) => {
                        node.active = index === openingPowerGem.getPowerGemGradeType();
                    });
                }
            }
        } 
        // PowerGem信息有效：设置奖励等级UI
        else {
            uiInfo.setLevelUI(powerGemInfo.getPowerGemLevel(), powerGemInfo.getPowerGemLevelGradeType());
            uiInfo.arrResultGrade.forEach((node, index) => {
                node.active = index === powerGemInfo.getPowerGemGradeType();
            });
            uiInfo.isUpgradeAction = powerGemInfo.getActionType() === PowerGemActionType.UPGRADE;
        }
    }
}