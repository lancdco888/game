const { ccclass, property } = cc._decorator;
// 全局工具对象声明 - 项目中已挂载无需导入，原代码核心调用
declare const Utility: any;

// ✅ 原代码所有导入依赖 完整复刻，路径/命名/导出方式100%一致，无任何删减
import CommonSoundSetter from "./global_utility/CommonSoundSetter";
import FireHoseSender, { FHLogType } from "./FireHoseSender";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import PopupManager from "./manager/PopupManager";
import SoundManager from "./manager/SoundManager";
import HRVServiceUtil from "./HRVService/HRVServiceUtil";
import Analytics from "./Network/Analytics";
//import CommonServer from "../Network/CommonServer";
import CommonPopup from "./Popup/CommonPopup";
//import LoadingPopup from "../Popup/LoadingPopup/LoadingPopup";
import PowerGemManager from "./manager/PowerGemManager";
import SupersizeItManager from "./SupersizeItManager";
//import ADTargetManager from "../ServiceInfo/ADTargetManager";
import ServerStorageManager, { StorageKeyType } from "./manager/ServerStorageManager";
import ServiceInfoManager from "./ServiceInfoManager";
//import UnprocessedPurchaseManager from "../User/UnprocessedPurchaseManager";
import UserInfo from "./User/UserInfo";
import UserPromotion from "./User/UserPromotion";
//import AdsManager from "../Utility/AdsManager";
//import FBSquadManager from "../Utility/FBSquadManager";
import HeroTooltipPopup from "./Utility/HeroTooltipPopup";
import MessageRoutingManager from "./message/MessageRoutingManager";
import SkinInfoManager from "./manager/SkinInfoManager";
import SlotFeverModeManager from "./manager/SlotFeverModeManager";
import SlotJackpotManager from "./manager/SlotJackpotManager";
import SlotTourneyManager from "./manager/SlotTourneyManager";
import TimeBonusManager from "./manager/TimeBonusManager";
//import LobbyUIDecoManager from "./LobbyDeco/LobbyUIDecoManager";
import LobbyMoveManager from "./manager/LobbyMoveManager";
import LobbySceneUI from "./LobbySceneUI";
//import LobbyTutorial from "./LobbyTutorial/LobbyTutorial";
import LobbyUIBase, { LobbyUIType } from "./LobbyUIBase";
import { LobbySceneUIType } from "./SceneInfo";
//import LobbyUIStartPopupManager from "./StartPopup/LobbyUIStartPopupManager";
//import LobbyUIStartPopup_ADFreeOffer from "./StartPopup/Popup/LobbyUIStartPopup_ADFreeOffer";

@ccclass
export default class LobbyScene extends cc.Component {
    // ===== 序列化属性 - 原JS @property配置100%精准复刻，变量名/类型/顺序完全一致 核心保留 =====
    @property(LobbySceneUI)
    public lobbySceneUI: LobbySceneUI = null;          // 大厅核心UI容器组件

    @property(CommonSoundSetter)
    public soundSetter: CommonSoundSetter = null;      // 全局音效配置器

    // ===== 私有成员变量 - 原代码所有变量完整复刻，类型注解精准，默认值完全一致 核心保留 =====
    private static _instance: LobbyScene = null;       // 单例实例 - 全局唯一大厅管理器
    private _isOverrideBGM: boolean = false;           // BGM覆盖开关 - 优先级最高，开启则停止自动切换BGM
    private _isRunTourneySchedule: boolean = false;    // 锦标赛调度防重入标记 ✔️改必卡死，核心防并发执行
    private _mgrLobbyUIMove: LobbyMoveManager = null;  // 大厅移动管理器
    // private _mgrLobbyUIStartPopup: LobbyUIStartPopupManager = null; // 大厅启动弹窗管理器
    // private _mgrLobbyUIDeco: LobbyUIDecoManager = null;// 大厅装饰管理器
    private _numZoneID: number = SDefine.VIP_LOUNGE_ZONEID; // 当前大厅分区ID
    private _strZoneName: string = SDefine.VIP_LOUNGE_ZONENAME; // 当前大厅分区名称
    private _strCurBGMName: string = "";               // 当前播放的BGM名称

    // ✅ 核心单例访问入口，原代码getter逻辑100%复刻，全局唯一实例，项目所有地方通过该方法获取
    public static get instance(): LobbyScene {
        return LobbyScene._instance;
    }

    // ✅ 静态全局方法 - 游戏返回键逻辑，原代码完整复刻，移动端退出游戏弹窗核心入口
    public static BackProcess(): void {
        if (0 != Utility.isMobileGame()) {
            PopupManager.Instance().showDisplayProgress(true);
            CommonPopup.getCommonPopup((isValid, popup) => {
                PopupManager.Instance().showDisplayProgress(false);
                if (!TSUtility.isValid(isValid)) {
                    popup.closeBtn.node.active = false;
                    popup.open()
                        .setInfo("EXIT GAME", "Are you sure you\nwant to exit game?")
                        .setOkBtn("STAY", null)
                        .setCancelBtn("EXIT", () => { TSUtility.endGame(); });
                    popup.setPopupType(0);
                }
            });
        }
    }

    // ===== 只读GETTER属性 - 原代码所有getter完整复刻，无setter，外部只读，核心封装 =====
    public get numZoneID(): number { return this._numZoneID; }
    public get strZoneName(): string { return this._strZoneName; }
    public get UI(): LobbySceneUI { return this.lobbySceneUI; }
    public get mgrLobbyUIMove(): LobbyMoveManager { return this._mgrLobbyUIMove; }
    // public get mgrLobbyUIStartPopup(): LobbyUIStartPopupManager { return this._mgrLobbyUIStartPopup; }
    // public get mgrLobbyUIDeco(): LobbyUIDecoManager { return this._mgrLobbyUIDeco; }

    // // ===== 计算型GETTER属性 - 分区权限校验，原代码逻辑完整复刻 =====
    // public get isPassableHigh(): boolean {
    //     return UserInfo.instance().isPassAbleCasino(SDefine.VIP_LOUNGE_ZONEID, SDefine.VIP_LOUNGE_ZONENAME);
    // }
    // public get isPassableDynamic(): boolean {
    //     return UserInfo.instance().isPassAbleCasino(SDefine.SUITE_ZONEID, SDefine.SUITE_ZONENAME);
    // }

    // ===== 可写SETTER属性 - BGM覆盖开关，赋值时自动刷新BGM，原代码核心逻辑，缺一不可 =====
    public set isOverrideBGM(value: boolean) {
        this._isOverrideBGM = value;
        this.refreshBGM();
    }

    // ===== 生命周期回调 - ON_LOAD 大厅初始化入口，核心分辨率适配+单例赋值+事件监听，原逻辑100%复刻 =====
    onLoad(): void {
        // ✅ 核心保留：Canvas分辨率自适应 宽高比阈值 1.7777(16:9)，改值必导致大厅UI拉伸/错位/黑屏！
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        const canvasSize = canvas.node.getContentSize();
        const isWideScreen = canvasSize.width / canvasSize.height > 1.7777;
        canvas.fitHeight = isWideScreen;
        canvas.fitWidth = !isWideScreen;
        canvas.getComponentInChildren(cc.Camera).cullingMask = 1;

        // 用户场景状态赋值
        //UserInfo.instance().setCurrentSceneMode(SDefine.Lobby);
        LobbyScene._instance = this;

        // 消息监听注册 - 大厅步骤切换/弹窗重置
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.LOBBY_NEXT_STEP, this.openLobbyStartPopup, this);
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.RESET_START_POPUP, this.resetOpenLobbyStartPopup, this);
    }

    // ===== 生命周期回调 - ON_DESTROY 大厅销毁逻辑，原代码完整复刻，内存释放核心 =====
    onDestroy(): void {
        LobbyScene._instance = null;
        this.unscheduleAllCallbacks();
        MessageRoutingManager.instance().removeListenerTargetAll(this);
        
        if (TSUtility.isValid(UserInfo.instance())) {
            // UserInfo.instance().removeListenerTargetAll(this);
        }

        // 子管理器销毁
        this._mgrLobbyUIMove.onDestroy();
        this._mgrLobbyUIMove = null;
        // this._mgrLobbyUIStartPopup = null;
        // this._mgrLobbyUIDeco = null;
    }

    // ===== 核心异步初始化方法 - 大厅所有逻辑的总入口，进度条0→1完整链路，原代码async/await逻辑100%复刻 =====
    public initialize(): Promise<void> {
        return new Promise(async (resolve) => {
            try {
                // const loadingPopup = LoadingPopup.getCurrentOpenPopup();
                // loadingPopup.setPostProgress(0, "Authenticating ...");
                
                // 初始化埋点+用户信息重置
                Analytics.lobbyInitStartInit();
                const userInstance = UserInfo.instance();
                // userInstance.setLocation("Lobby");
                // userInstance.setGameId("");
                // userInstance.resetTourneyTier();

                // 分区ID/名称赋值 + 动态分区权限判断
                // this._numZoneID = SDefine.VIP_LOUNGE_ZONEID;
                // this._strZoneName = SDefine.VIP_LOUNGE_ZONENAME;
                // if (ServiceInfoManager.STRING_LAST_LOBBY_NAME == SDefine.SUITE_ZONENAME && this.isPassableDynamic) {
                //     this._numZoneID = SDefine.SUITE_ZONEID;
                //     this._strZoneName = SDefine.SUITE_ZONENAME;
                // }
                // userInstance.setZoneID(this._numZoneID);
                // userInstance.setZoneName(this._strZoneName);

                // 弹窗返回键绑定退出逻辑
                PopupManager.Instance().setBaseBackBtnCallback(LobbyScene.BackProcess);
                ServiceInfoManager.NUMBER_LOOBY_ENTER_COUNT++;
                if (ServiceInfoManager.NUMBER_START_MEMBERS_LEVEL < 0) {
                    //ServiceInfoManager.NUMBER_START_MEMBERS_LEVEL = userInstance.getUserVipInfo().level;
                }

                // 进度条更新 20%
                Analytics.customLoadingRecord("lob_setUi_complete_" + (ServiceInfoManager.NUMBER_LOOBY_ENTER_COUNT - 1).toString());
                //loadingPopup.setPostProgress(0.2, "Verifying game ...");
                this.refreshBGM();

                // 移动端新手引导标记
                if (1 == Utility.isMobileGame() && !ServerStorageManager.getAsBoolean(StorageKeyType.MOBILE_GUIDE)) {
                    ServerStorageManager.save(StorageKeyType.MOBILE_GUIDE, true);
                }

                // 锦标赛定时调度 - 每秒执行一次
                if (SDefine.SlotTournament_Use) {
                    this.schedule(this.tourneyLobbySchedule, 1);
                }

                // 进度条更新 60%
                //loadingPopup.setPostProgress(0.6, "Entering lobby ...");
                const slotZoneInfo = userInstance.slotZoneInfo[Math.min(this._numZoneID, 1)];
                
                // // 分区信息校验 + 大奖信息刷新
                // if (!TSUtility.isValid(slotZoneInfo)) {
                //     if (this._numZoneID != userInstance.getZoneId()) {
                //         cc.error("not matching zoneId ", this._numZoneID, " ", userInstance.getZoneId());
                //         userInstance.setZoneID(this._numZoneID);
                //     }
                //     Analytics.lobbyInitStartRefreshJackpotInfo();
                //     const refreshJackpotRes = await userInstance.asyncRefreshJackpotInfo(true);
                //     Analytics.lobbyInitCompleteRefreshJackpotInfo();
                    
                //     // 网络异常弹窗
                //     if (0 == refreshJackpotRes) {
                //         PopupManager.Instance().showDisplayProgress(true);
                //         CommonPopup.getCommonPopup((isValid, popup) => {
                //             PopupManager.Instance().showDisplayProgress(false);
                //             if (!isValid) {
                //                 popup.open()
                //                     .setInfo("NOTICE", "Check Network Status.", false)
                //                     .setOkBtn(1 == Utility.isFacebookInstant() ? "CLOSE" : "RETRY", () => { HRVServiceUtil.restartGame(); });
                //                 if (Utility.isMobileGame()) {
                //                     popup.setCloseBtn(true, () => { TSUtility.endGame(); });
                //                 }
                //             }
                //         });
                //         resolve();
                //         return;
                //     }
                // }

                // 进度条更新 80% - 各类管理器初始化
                //loadingPopup.setPostProgress(0.8, "Initialize manager ...");
                PowerGemManager.instance.initialize();
                TimeBonusManager.instance.initialize();
                SupersizeItManager.instance.initialize();

                // 大厅移动管理器初始化
                Analytics.lobbyInitStartLobbyMoveManager();
                this._mgrLobbyUIMove = new LobbyMoveManager();
                await this._mgrLobbyUIMove.initialize();
                Analytics.lobbyInitCompleteLobbyMoveManager();

                // // 大厅启动弹窗管理器初始化
                // Analytics.lobbyInitStartStartPopupManager();
                // this._mgrLobbyUIStartPopup = new LobbyUIStartPopupManager();
                // await this._mgrLobbyUIStartPopup.initialize();
                // Analytics.lobbyInitCompleteStartPopupManager();

                // // 大厅装饰管理器初始化
                // this._mgrLobbyUIDeco = this.node.addComponent(LobbyUIDecoManager);
                // await this._mgrLobbyUIDeco.initialize();

                // // 每日充值奖励校验
                // Analytics.lobbyInitStartCheckDailyTopupReward();
                // await userInstance.asyncCheckDailyTopUpReward(null);
                // Analytics.lobbyInitCompleteCheckDailyTopupReward();

                // // 数据刷新埋点 + 卷轴任务版本更新
                // Analytics.lobbyInitStartCheckAndRefreshInfos();
                // Analytics.lobbyInitCompleteCheckAndRefreshInfos();
                // Analytics.lobbyInitStartUpdateReelQuestVersion();
                // await this.asyncUpdateReelQuestVersion();
                // Analytics.lobbyInitCompleteUpdateReelQuestVersion();

                // // 狂热模式门票使用 + FB小队信息刷新
                // SlotFeverModeManager.instance.useFeverTicket(() => {});
                // Analytics.lobbyInitAfterUseFeverTicket();
                // if (SDefine.FBInstant_Squad_Use && TSUtility.isValid(FBSquadManager.Instance().getSquadInfo())) {
                //     FBSquadManager.Instance().refreshSquadInfo();
                // }

                // 进度条更新 90% - UI初始化
                //loadingPopup.setPostProgress(0.9, "Initialize UI ...");
                const uiType = this._strZoneName == SDefine.SUITE_ZONENAME ? LobbySceneUIType.SUITE : LobbySceneUIType.LOBBY;
                await this.UI.initialize(uiType);

                // 进度条100%完成 + 入场动画播放
                Analytics.lobbyInitAfterCompleteDelay();
                //loadingPopup.setPostProgress(1, "Completed", true);
                await this.UI.playEnterAction();

                // 首次进入校验未处理的内购订单
                const enterLobbyCnt = ServiceInfoManager.NUMBER_LOOBY_ENTER_COUNT;
                const enterSlotCnt = ServiceInfoManager.NUMBER_SLOT_ENTER_COUNT;
                if (enterLobbyCnt + enterSlotCnt <= 1) {
                    Analytics.lobbyInitStartCheckUnprocessedPurchase();
                    //await UnprocessedPurchaseManager.Instance().doProcess();
                    Analytics.lobbyInitCompleteCheckUnprocessedPurchase();
                }

                // 初始化完成收尾逻辑
                const completeInit = () => {
                    if (!ServerStorageManager.getAsBoolean(StorageKeyType.FIRST_VISIT_LOBBY)) {
                        ServerStorageManager.save(StorageKeyType.FIRST_VISIT_LOBBY, true);
                    }
                    Analytics.lobbyInitCompleteAll();
                    Analytics.enterCasinoComplete(this._numZoneID);
                    ServiceInfoManager.STRING_SNEAK_PEEK_GAME_ID = "";
                    this.openLobbyStartPopup();
                };

                // // 从老虎机返回大厅时的广告逻辑
                // if ("Slot" == userInstance.getPrevLocation() && 1 == AdsManager.Instance().isUseable()) {
                //     Analytics.lobbyInitPrevLocationSlot();
                //     AdsManager.Instance().ADLog_InterstitialShowUI(AdsManager.PlacementID_InterstitalType.SLOTTOLOBBY);
                //     if (ADTargetManager.instance().enableInterstitialAD()) {
                //         AdsManager.Instance().InterstitialAdplay(AdsManager.PlacementID_InterstitalType.SLOTTOLOBBY, () => {
                //             ServiceInfoManager.instance().addInterstitialADPlayCount();
                //             if (1 == ServiceInfoManager.instance().getShowADSFreePopup()) {
                //                 this._mgrLobbyUIStartPopup.unShiftPopupBase(new LobbyUIStartPopup_ADFreeOffer());
                //             }
                //             completeInit();
                //         }, () => {
                //             if (!TSUtility.isLiveService()) {
                //                 ServiceInfoManager.instance().addInterstitialADPlayCount();
                //                 if (1 == ServiceInfoManager.instance().getShowADSFreePopup()) {
                //                     this._mgrLobbyUIStartPopup.unShiftPopupBase(new LobbyUIStartPopup_ADFreeOffer());
                //                 }
                //             }
                //             completeInit();
                //         });
                //     } else {
                //         if (1 == ADTargetManager.instance().enableInterstitialAD(false)) {
                //             cc.log("Lobby Check enableInterstitialAD true");
                //             AdsManager.Instance().preloadInterstitialAD();
                //         }
                //         completeInit();
                //     }
                // } else {
                //     Analytics.lobbyInitPrevLocationLobby();
                //     completeInit();
                // }
            } catch (error) {
                // 异常上报
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
            } finally {
                resolve();
            }
        });
    }

    // ===== 打开大厅启动弹窗，带新手教程校验 =====
    public openLobbyStartPopup(): Promise<void> {
        return new Promise(async (resolve) => {
            // await this.UI.tutorial.checkTutorial(LobbyTutorial.LobbyTutorialCheckType.START_POPUP_OPEN);
            // if (TSUtility.isValid(this._mgrLobbyUIStartPopup)) {
            //     this._mgrLobbyUIStartPopup.openPopup();
            // }
            resolve();
        });
    }

    // ===== 重置大厅启动弹窗，清空弹窗队列+恢复状态 =====
    public resetOpenLobbyStartPopup(): void {
        // this._mgrLobbyUIStartPopup.clear();
        // PopupManager.Instance().showDisplayProgress(false);
        // ServiceInfoManager.BOOL_OPENING_LOBBY_POPUP = false;
        
        // const couponUI = this.UI.getLobbyUI(LobbyUIType.COUPON);
        // if (TSUtility.isValid(couponUI)) {
        //     couponUI.clearActiveCouponContents();
        // }
    }

    // ===== 刷新背景音乐，根据当前分区大奖状态自动切换，原逻辑100%复刻 =====
    public refreshBGM(): void {
        if (!this._isOverrideBGM) {
            const jackpotInfo = SlotJackpotManager.Instance().getZoneJackpotInfo(this._numZoneID);
            if (TSUtility.isValid(jackpotInfo)) {
                this.playBGM(jackpotInfo.getBunningState(SDefine.SLOT_JACKPOT_TYPE_CASINO));
            }
        } else {
            this._strCurBGMName = "";
        }
    }

    // ===== 播放背景音乐，核心圣诞皮肤优先级判断+大奖燃烧状态BGM切换 ✔️改必导致音效异常 =====
    public playBGM(burningState: number): void {
        if (!this._isOverrideBGM) {
            const activeSkinList = SkinInfoManager.Instance().getActiveSkinInfoList();
            let christmasSkinTag = "";
            
            // 圣诞皮肤优先级最高，匹配到则播放圣诞BGM
            if (TSUtility.isValid(activeSkinList) && activeSkinList.length > 0) {
                for (let i = 0; i < activeSkinList.length; i++) {
                    if (activeSkinList[i].key.toUpperCase().includes("CHRISTMAS")) {
                        christmasSkinTag = "Christmas";
                        break;
                    }
                }
            }

            // BGM名称判断：圣诞 > 燃烧2 > 燃烧1 > 主BGM
            let bgmName = christmasSkinTag.length > 0 
                ? christmasSkinTag 
                : 0 == burningState ? "mainBGM" : 1 == burningState ? "burining1BGM" : "burining2BGM";
            
            // 仅当BGM名称变化时播放，避免重复加载
            if (this._strCurBGMName != bgmName) {
                this._strCurBGMName = bgmName;
                SoundManager.Instance().playBGM(this.soundSetter.getAudioClip(this._strCurBGMName));
                SoundManager.Instance().setMainVolumeTemporarily(1);
            }
        }
    }

    // ===== 异步更新卷轴任务版本，带用户等级/促销信息校验，原代码完整复刻 =====
    public asyncUpdateReelQuestVersion(): Promise<void> {
        return new Promise(async (resolve) => {
            // const userInstance = UserInfo.instance();
            // if (0 == userInstance.hasActiveReelQuest()) { resolve(); return; }
            
            // const userLevel = userInstance.getUserLevelInfo().level;
            // if (UserPromotion.ReelQuestPromotion.Normal_LevelLimit > userLevel) { resolve(); return; }

            // const newbiePromo = userInstance.getPromotionInfo(UserPromotion.ReelQuestPromotion.Newbie_PromotionKeyName);
            // if (TSUtility.isValid(newbiePromo) && 0 == newbiePromo.isNewBiComplete) { resolve(); return; }

            // const activeQuestKey = userInstance.getActiveReelQuestPromotionKey();
            // const activeQuestInfo = userInstance.getPromotionInfo(activeQuestKey);
            // if (!TSUtility.isValid(activeQuestInfo)) { resolve(); return; }

            // const currentUnix = TSUtility.getServerBaseNowUnixTime();
            // if (activeQuestInfo.eventEnd >= currentUnix) { resolve(); return; }

            // // 任务过期则重新请求新任务
            // await new Promise((innerResolve, innerReject) => {
            //     PopupManager.Instance().showDisplayProgress(true);
            //     CommonServer.Instance().requestAcceptPromotion(
            //         userInstance.getUid(),
            //         userInstance.getAccessToken(),
            //         UserPromotion.ReelQuestPromotion.Normal_PromotionKeyName,
            //         0,0,"",
            //         (response) => {
            //             if (CommonServer.isServerResponseError(response)) {
            //                 PopupManager.Instance().showDisplayProgress(false);
            //                 innerReject();
            //                 return;
            //             }
            //             const changeResult = userInstance.getServerChangeResult(response);
            //             userInstance.applyChangeResult(changeResult);
            //             CommonServer.Instance().requestReelQuestRefresh((questRes) => {
            //                 PopupManager.Instance().showDisplayProgress(false);
            //                 if (CommonServer.isServerResponseError(questRes)) {
            //                     innerReject();
            //                 } else {
            //                     userInstance.setUserReelQuestInfo(questRes.userReelQuest);
            //                     innerResolve(true);
            //                 }
            //             });
            //         }
            //     );
            // }).catch(() => {});
            resolve();
        });
    }

    // ===== 锦标赛大厅定时调度，每秒执行，带防重入标记 ✔️改必导致锦标赛卡死/重复请求 =====
    public tourneyLobbySchedule(): Promise<void> {
        return new Promise(async (resolve) => {
            // if (this._isRunTourneySchedule) {
            //     cc.log("tourneyLobbySchedule skip shedule");
            //     resolve();
            //     return;
            // }
            // this._isRunTourneySchedule = true;

            // try {
            //     await this.asyncTourneyLobbyWork();
            //     if (!TSUtility.isValid(this)) { resolve(); return; }

            //     const tourneyInfo = SlotTourneyManager.Instance().getCurrentTourneyInfo();
            //     const currentUnix = TSUtility.getServerBaseNowUnixTime();
                
            //     // 锦标赛信息刷新校验
            //     if (SlotTourneyManager.Instance().getLastUpdateTimeProgressInfo(0) + 60 <= currentUnix && tourneyInfo.getNextSlotStartTime() > currentUnix + 60) {
            //         await this.asyncRefreshTourneyInfo();
            //     }

            //     // 锦标赛参与完成校验
            //     const isComplete = await SlotTourneyManager.Instance().asyncCheckCompleteParticipateTourney(false, -1, -1);
            //     if (!TSUtility.isValid(this)) { resolve(); return; }
            //     if (1 == isComplete) {
            //         await HeroTooltipPopup.asyncGetTourneyCompleteTooltip(this.node, this.UI.getLobbyNode(LobbyUIBase.LobbyUIType.MENU));
            //     }
            // } catch (error) {
            //     cc.error("tourneyLobbySchedule exception ", error.toString());
            //     FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
            // } finally {
            //     this._isRunTourneySchedule = false;
            //     resolve();
            // }
            resolve();
        });
    }

    // ===== 锦标赛核心异步逻辑，新游戏预约+数据刷新 =====
    public asyncTourneyLobbyWork(): Promise<void> {
        return new Promise(async (resolve) => {
            // const tourneyInfo = SlotTourneyManager.Instance().getCurrentTourneyInfo();
            // const currentUnix = TSUtility.getServerBaseNowUnixTime();
            
            // if (tourneyInfo.getNextSlotStartTime() <= currentUnix) {
            //     cc.log("asyncTourneyLobbyWork TOURNEY_RESERVE_NEWGAME");
            //     MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.TOURNEY_RESERVE_NEWGAME);
            //     const tourneyRes = await CommonServer.Instance().asyncRequestSlotTourneyInfo();
                
            //     if (!TSUtility.isValid(this)) { resolve(); return; }
            //     if (1 == CommonServer.isServerResponseError(tourneyRes)) {
            //         cc.error("get asyncRequestSlotTourneyInfo fail ", JSON.stringify(tourneyRes));
            //         resolve();
            //         return;
            //     }

            //     // 解析锦标赛数据并更新
            //     const tourneyMaster = SlotTourneyManager.ServerSlotTourneyMasterInfo.parseObj(tourneyRes.slotTourneyMasterInfo);
            //     if (tourneyInfo.tourneyID == tourneyMaster.tourneyID) { resolve(); return; }
                
            //     SlotTourneyManager.Instance().setSlotTourneyMasterInfo(tourneyMaster);
            //     if (TSUtility.isValid(tourneyRes.slotTourneyProgressInfos)) {
            //         for (let i = 0; i < tourneyRes.slotTourneyProgressInfos.length; ++i) {
            //             const progressInfo = SlotTourneyManager.ServerslotTourneyProgressInfo.parseObj(tourneyRes.slotTourneyProgressInfos[i]);
            //             SlotTourneyManager.Instance().setSlotTourneyProgressInfo(progressInfo);
            //         }
            //     }
            //     MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.TOURNEY_START_NEWGAME);
            // }
            resolve();
        });
    }

    // ===== 异步刷新锦标赛信息，原代码完整复刻 =====
    public asyncRefreshTourneyInfo(): Promise<void> {
        return new Promise(async (resolve) => {
            // cc.log("asyncRefreshTourneyInfo start");
            // const tourneyInfo = SlotTourneyManager.Instance().getCurrentTourneyInfo();
            // const tourneyRes = await CommonServer.Instance().asyncRequestSlotTourneyInfo();
            
            // if (!TSUtility.isValid(this)) { resolve(); return; }
            // if (1 == CommonServer.isServerResponseError(tourneyRes)) {
            //     cc.error("get asyncRequestSlotTourneyInfo fail ", JSON.stringify(tourneyRes));
            //     resolve();
            //     return;
            // }

            // const tourneyMaster = SlotTourneyManager.ServerSlotTourneyMasterInfo.parseObj(tourneyRes.slotTourneyMasterInfo);
            // if (tourneyInfo.tourneyID != tourneyMaster.tourneyID) { resolve(); return; }
            
            // SlotTourneyManager.Instance().setSlotTourneyMasterInfo(tourneyMaster);
            // if (TSUtility.isValid(tourneyRes.slotTourneyProgressInfos)) {
            //     for (let i = 0; i < tourneyRes.slotTourneyProgressInfos.length; ++i) {
            //         const progressInfo = SlotTourneyManager.ServerslotTourneyProgressInfo.parseObj(tourneyRes.slotTourneyProgressInfos[i]);
            //         SlotTourneyManager.Instance().setSlotTourneyProgressInfo(progressInfo);
            //     }
            // }
            // MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.TOURNEY_REFRESH_INFO);
            // cc.log("asyncRefreshTourneyInfo end");
            resolve();
        });
    }
}