import GameCommonSound from "../../../Script/GameCommonSound";
import CommonPopup from "../../../Script/Popup/CommonPopup";
import ServiceInfoManager from "../../../Script/ServiceInfoManager";
import CameraControl from "../../../Script/Slot/CameraControl";
import SlotReelSpinStateManager from "../../../Script/Slot/SlotReelSpinStateManager";
import SupersizeItManager from "../../../Script/SupersizeItManager";
import TutorialCoinPromotion from "../../../Script/TutorialCoinPromotion";
import UserInfo, { MSG } from "../../../Script/User/UserInfo";
// import UserInfo from "../../../Script/User/UserInfo";
// import UserInfo, { MSG } from "../../../Script/User/UserInfo";
import UserInven from "../../../Script/User/UserInven";
import UserPromotion, { JiggyPuzzlePromotion, LevelUpPassPromotion, NewUserMissionPromotion, PiggyBankPromotionInfo, WelcomeBonusPromotion } from "../../../Script/User/UserPromotion";
import AdsManager from "../../../Script/Utility/AdsManager";
import AsyncHelper from "../../../Script/global_utility/AsyncHelper";
import SDefine from "../../../Script/global_utility/SDefine";
import TSUtility from "../../../Script/global_utility/TSUtility";
import { Utility } from "../../../Script/global_utility/Utility";
import LevelManager from "../../../Script/manager/LevelManager";
import LocalStorageManager from "../../../Script/manager/LocalStorageManager";
import PopupManager, { OpenPopupInfo } from "../../../Script/manager/PopupManager";
import ServerStorageManager, { StorageKeyType } from "../../../Script/manager/ServerStorageManager";
import SlotGameRuleManager from "../../../Script/manager/SlotGameRuleManager";
import SlotManager from "../../../Script/manager/SlotManager";
import UnlockContentsManager, { UnlockContentsType } from "../../../Script/manager/UnlockContentsManager";
import MessageRoutingManager from "../../../Script/message/MessageRoutingManager";
import InGameBankRollPromotionUI from "./InGameBankRollPromotionUI";
import InGameHeroUI from "./InGameHeroUI";
import InGameMoveManager from "./InGameMoveManager";
import LevelInfoUI_2020 from "./LevelInfoUI_2020";

const { ccclass, property } = cc._decorator;



// ===================== 核心组件类 =====================
@ccclass()
export default class InGameUI_2020 extends cc.Component {
    // ===================== 常量定义 =====================
    private readonly HIGH_ENTRY_MIN_COIN = 120000;

    // ===================== Cocos 属性绑定（对应原 de 装饰器） =====================
    @property(cc.Button)
    homeBtn: cc.Button | null = null;

    @property(cc.Node)
    blockingBG: cc.Node | null = null;

    @property(cc.Node)
    bigwinCoinTarget: cc.Node | null = null;

    @property(LevelInfoUI_2020)
    levelUI: LevelInfoUI_2020 | null = null;

    @property(LevelInfoUI_2020)
    levelBoosterUI: LevelInfoUI_2020 | null = null;

    // @property(LevelUpPassProfileUIController)
    // levelUpPassUI: LevelUpPassProfileUIController | null = null;

    @property(cc.Button)
    menuBtn: cc.Button | null = null;

    // @property(FBPictureSetter)
    // myPicSetter: FBPictureSetter | null = null;

    // @property(InGameStarAlbumUI)
    // starAlbumUI: InGameStarAlbumUI | null = null;

    @property(InGameHeroUI)
    heroUI: InGameHeroUI | null = null;

    // @property(InGameTourneyUI)
    // tourneyUI: InGameTourneyUI | null = null;

    // @property(InGameReelQuestUI)
    // reelQuestUI: InGameReelQuestUI | null = null;

    // @property(IngameSuiteLeagueUI)
    // suiteLeagueUI: IngameSuiteLeagueUI | null = null;

    @property(cc.Node)
    tourneyLayoutIcon: cc.Node | null = null;

    @property(cc.Node)
    topLeftNode: cc.Node | null = null;

    @property(cc.Node)
    topRightNode: cc.Node | null = null;

    @property(cc.Node)
    leftNode: cc.Node | null = null;

    @property(cc.Node)
    rightNode: cc.Node | null = null;

    @property(cc.Node)
    bottomRightNode: cc.Node | null = null;

    @property(cc.Node)
    bankRollNode: cc.Node | null = null;

    @property(cc.Node)
    nodeProfile: cc.Node | null = null;

    // @property(GiftBalloon)
    // giftBalloon: GiftBalloon | null = null;

    @property(cc.Node)
    popupParentRoot: cc.Node | null = null;

    @property(cc.Node)
    bankRoll_IntroduceCoin: cc.Node | null = null;

    @property(cc.Node)
    payTable_IntoduceCoin: cc.Node | null = null;

    @property(cc.Layout)
    right_Layout: cc.Layout | null = null;

    @property(cc.Node)
    thrillWheelJackpotGaugeUI: cc.Node | null = null;

    // @property(IngameSaleIcon)
    // saleIcons: IngameSaleIcon | null = null;

    @property(cc.Node)
    leftUI_Layout: cc.Node | null = null;

    @property(cc.Node)
    fastModeTooltip: cc.Node | null = null;

    @property([cc.Node])
    fastModeInfos: cc.Node[] = [];

    // @property(InGamePiggyBankUI)
    // piggyBankUI: InGamePiggyBankUI | null = null;

    @property([cc.Node])
    sideMenu_Nodes: cc.Node[] = [];

    @property(cc.Node)
    cheatObjNode: cc.Node | null = null;

    // @property(InGameJiggyPuzzleUI)
    // jiggyPuzzleUI: InGameJiggyPuzzleUI | null = null;

    // @property(InGameWelcomeBackUI)
    // welcomeBackUI: InGameWelcomeBackUI | null = null;

    // @property(InGameSupersizeItIcon)
    // iconSupersizeIt: InGameSupersizeItIcon | null = null;

    @property(cc.Node)
    block_Node: cc.Node | null = null;

    @property(cc.Node)
    blockInputBeforeAnimNode: cc.Node | null = null;

    @property(cc.Node)
    nodeMenu: cc.Node | null = null;

    // @property(InGameUI_LevelUp)
    // levelUpUI: InGameUI_LevelUp | null = null;

    // @property(InGameUI_ContentsOpen)
    // contentsOpenUI: InGameUI_ContentsOpen | null = null;

    @property(cc.Node)
    nodeRightLayout: cc.Node | null = null;

    // ===================== 私有状态属性 =====================
    private _topLeftNodeOriginalPos: cc.Vec2 | null = null;
    private _topRightNodeOriginalPos: cc.Vec2 | null = null;
    private _leftNodeOriginalPos: cc.Vec2 | null = null;
    private _rightNodeOriginalPos: cc.Vec2 | null = null;
    private _bottomRightNodeOriginalPos: cc.Vec2 | null = null;
    private _coinEffects: Node[] = [];
    private _isReservedRandomGift = false;
    private _isFirstLevelEffect = false;
    private _rightIconValues: number[] = [80, 45, 20];
    private _onClickOptionButton = false;
    private _isOpenPaytablePopup = false;
    private _isOpenMainshop = false;
    private _firstDisplay = true;
    private _blockBGCount = 0;
    private _isShowFirstMissionTooltip = false;
    private _hasBoostItemWhenStart = false;
    private _isLogPrinted = false;
    // private _newbieWelcomeTutorial: InGameUI_Tutorial | null = null;
    private _mgrInGameUIMove: InGameMoveManager | null = null;
    private tempCnt = 0;

    // ===================== 生命周期方法 =====================
    onLoad(): void {
        if (!this.blockingBG || !this.block_Node || !this.blockInputBeforeAnimNode) {
            cc.error("InGameUI_2020: 核心UI节点未绑定");
            return;
        }

        // 初始化ServiceInfoManager的全局节点引用
        ServiceInfoManager.NODE_IN_GAME_BANKROLL = this.bankRollNode;
        ServiceInfoManager.NODE_IN_GAME_PROFILE = this.nodeProfile;

        // 首次访问Slot标记
        if (!ServerStorageManager.getAsBoolean(StorageKeyType.FIRST_VISIT_SLOT)) {
            ServerStorageManager.save(StorageKeyType.FIRST_VISIT_SLOT, true);
        }

        // 初始化全局状态
        ServiceInfoManager.BOOL_IS_ENTERING_SLOT_TOURNEY = false;
        UserInfo.instance().setPrevSceneSlot(true);
        UserInfo.instance().setCurrentSceneMode(SDefine.Slot);

        // 初始化UI移动管理器
        this._mgrInGameUIMove = new InGameMoveManager();
        this._mgrInGameUIMove.initialize();

        // 适配Canvas尺寸
        const canvas = cc.find("Canvas")?.getComponent(cc.Canvas);
        if (canvas) {
            const canvasSize = canvas.node.getContentSize();
            this.node.setContentSize(canvasSize);
            this.block_Node.setContentSize(canvasSize);
            this.blockInputBeforeAnimNode.setContentSize(canvasSize);
            this.blockingBG.setContentSize(canvasSize);
        }

        // 初始UI状态
        this.block_Node.active = true;
        this.blockingBG.active = false;
        // if (this.starAlbumUI) this.starAlbumUI.node.active = false;
        if (this.heroUI) this.heroUI.node.active = false;

        // 绑定按钮事件
        if (this.homeBtn) {
            this.homeBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "InGameUI_2020", "onClickHomeBtn", ""));
        }
        if (this.menuBtn) {
            this.menuBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "InGameUI_2020", "onClickOptionBtn", ""));
        }

        // 英雄切换事件监听
        UserInfo.instance().addListenerTarget(MSG.CHANGE_ACTIVE_HERO, () => {
            if (this.heroUI && !this.heroUI.node.active) {
                this.heroUI.node.active = true;
                this.refreshLeftLayout();
            }
            if (this.heroUI) this.heroUI.refreshHero();
        }, this);

        // // 加载用户头像
        // if (this.myPicSetter) {
        //     // this.myPicSetter.loadPictureByUrl(UserInfo.instance().getUserPicUrl(), FB_PICTURE_TYPE.NORMAL, null);
        //     // // 头像更新监听
        //     // UserInfo.instance().addListenerTarget(MSG.UPDATE_PICTURE, () => {
        //     //     this.myPicSetter?.loadPictureByUrl(UserInfo.instance().getUserPicUrl(), FB_PICTURE_TYPE.NORMAL, null);
        //     // }, this);
        // }

        // 注册全局事件监听
        UserInfo.instance().addListenerTarget(MSG.UPDATE_INVENTORY, this.onUpdateInventory, this);
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.ADDGIFTBALLOON, this.onBalloon, this);
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.RESERVEDONBALLOON, this.onReservedBalloon, this);
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.END_NEW_USER_MISSION_PROMOTION, this.setLeftUI, this);
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.UPDATE_SERVICE_INTRODUCE_COIN, this.updateServiceintroduce, this);
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.GAVE_WELCOME_BONUS, this.SetFirstLevelUIEffect, this);
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.REFRESH_INGAME_UI, this.refreshInGameSceneUI, this);
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.INGAME_LEVEL_UP_PASS_ICON_BOOST_EFFECT, this.setBoostNodeAlready, this);
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.OPEN_MESSAGE_BOX, this.openMessageBox, this);
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.OPEN_SLOT_ERROR_MESSAGE_BOX, this.openSlotErrorMessageBox, this);

        // 老虎机旋转状态监听
        this.node.on("changeReelSpinState", this.onSpinSlot.bind(this));
        SlotReelSpinStateManager.Instance.addObserver(this.node);

        // 初始化UI
        this.checkChangeLevelUI();
        this.refreshUI();
        this.schedule(this.refreshUI, 1);
        this.hideFastModeTooltip();

        // 欢迎奖励判断
        const welcomeBonusInfo = UserInfo.instance().getPromotionInfo(WelcomeBonusPromotion.PromotionKeyName);
        const isWelcomeBonusUnreceived = TSUtility.isValid(welcomeBonusInfo) && welcomeBonusInfo.isReceived === 0;

        // // 小猪存钱罐UI显示控制（iOS Instant商店兼容）
        // if (this.piggyBankUI) {
        //     this.piggyBankUI.node.active = !SDefine.FB_Instant_iOS_Shop_Flag;
        // }

        // 新手奖励UI控制
        if (!isWelcomeBonusUnreceived) {
            this.setLeftUI();
            if (this.block_Node) this.block_Node.active = false;
        } else {
            SlotManager.Instance.setMouseDragEventFlag(false);
            SlotManager.Instance.setKeyboardEventFlag(false);
            if (this.heroUI) this.heroUI.node.active = false;
            this.refreshLeftLayout();
        }

        // 作弊按钮（仅测试环境）
        if (this.cheatObjNode && !TSUtility.isLiveService()) {
            this.cheatObjNode.on(cc.Node.EventType.TOUCH_END, () => {
                SlotManager.Instance.toggleCheatObject();
            }, this);
        }

        // 初始化经验值
        ServiceInfoManager.NUMBER_CURRENT_GAUGE_EXP = UserInfo.instance().getUserLevelInfo().exp;

        // 分辨率适配
        this.setUILayoutPostionByResolution();

        // // 卷轴任务UI初始化
        // if (!UserInfo.instance().isJoinTourney() && UserInfo.instance().getZoneName() !== SDefine.SUITE_ZONENAME) {
        //     UserInfo.instance().addListenerTarget(UserInfo.MSG.REFRESH_REELQUEST_USERINFO, this.onRefreshReelQuestInfo, this);
            
        //     if (UserInfo.instance().hasActiveReelQuest() === 1) {
        //         const curMissionSlot = UserInfo.instance().getUserReelQuestInfo().curMissionSlot;
        //         const isCurrentSlot = SlotGameRuleManager.Instance.slotID === curMissionSlot;
                
        //         if (this.reelQuestUI) {
        //             this.reelQuestUI.refreshInGameReelQuest(isCurrentSlot);
        //             if (isCurrentSlot) {
        //                 this.reelQuestUI.openNormal(false);
        //             } else {
        //                 this.reelQuestUI.openMini(false);
        //             }
        //         }
        //     } else if (this.reelQuestUI) {
        //         this.reelQuestUI.close();
        //     }
        // } else if (this.reelQuestUI) {
        //     this.reelQuestUI.close();
        // }
    }

    start(): void {
        if (!UserInfo.instance()) return;

        // 检查启动时是否有等级提升道具
        const boostItems = UserInfo.instance().getItemInventory().getItemsByItemId(SDefine.ITEM_LEVEL_UP_BOOSTER);
        this._hasBoostItemWhenStart = boostItems.length > 0 && !boostItems[0].isExpire() && ServiceInfoManager.instance.getUserLevel() < 3;
    }

    onDestroy(): void {
        // 清理定时器和事件监听
        this.unscheduleAllCallbacks();
        
        if (UserInfo.instance()) {
            UserInfo.instance().removeListenerTargetAll(this);
        }
        MessageRoutingManager.instance().removeListenerTargetAll(this);
        if (this._mgrInGameUIMove) {
            MessageRoutingManager.instance().removeListenerTargetAll(this._mgrInGameUIMove);
        }
        this._mgrInGameUIMove = null;
    }

    // ===================== 核心业务方法 =====================
    /** 初始化老虎机锦标赛UI */
    initSlotTourney(): void {
        if (!SDefine.SlotTournament_Use) return;

        if (UserInfo.instance().isJoinTourney()) {
            this.refreshLeftLayout();
            if (this.tourneyLayoutIcon) this.tourneyLayoutIcon.active = true;
            // if (this.tourneyUI) {
            //     this.tourneyUI.init();
            //     this.tourneyUI.open();
            // }
        } else {
            if (this.tourneyLayoutIcon) this.tourneyLayoutIcon.active = false;
            // if (this.tourneyUI) this.tourneyUI.close();
        }
    }

    /** 显示JiggyPuzzle锁定提示 */
    showLockedTooltip_JiggyPuzzle(): void {
        // if (!this.jiggyPuzzleUI) return;

        // const jiggyPuzzleInfo = UserInfo.instance().getPromotionInfo(JiggyPuzzlePromotion.PromotionKeyName);
        // if (!TSUtility.isValid(jiggyPuzzleInfo) || jiggyPuzzleInfo.isAvailable() !== 1) return;

        // if (this.jiggyPuzzleUI.isLockUI() === 1) {
        //     this.jiggyPuzzleUI.openTooltip();
        // }
    }

    /** 初始化推广UI */
    setPromotionUI(): void {
        // if (TSUtility.isValid(this.jiggyPuzzleUI)) this.jiggyPuzzleUI.init();
        // if (TSUtility.isValid(this.welcomeBackUI)) this.welcomeBackUI.init();
        // if (TSUtility.isValid(this.iconSupersizeIt)) this.iconSupersizeIt.initialize();
    }

    /** 投注金额变化回调 */
    onBettingMoneyChange(): void {
        // const jiggyPuzzleInfo = UserInfo.instance().getPromotionInfo(JiggyPuzzlePromotion.PromotionKeyName);
        // if (TSUtility.isValid(jiggyPuzzleInfo) && jiggyPuzzleInfo.isAvailable() === 1) {
        //     this.jiggyPuzzleUI?.onBettingMoneyChange();
        // }
    }

    /** 刷新卷轴任务信息 */
    onRefreshReelQuestInfo(): void {
        // if (UserInfo.instance().hasActiveReelQuest() !== 1) {
        //     this.reelQuestUI?.close();
        //     return;
        // }

        // const curMissionSlot = UserInfo.instance().getUserReelQuestInfo().curMissionSlot;
        // const isCurrentSlot = SlotGameRuleManager.Instance.slotID === curMissionSlot;

        // if (this.reelQuestUI) {
        //     this.reelQuestUI.node.active = true;
        //     this.reelQuestUI.refreshInGameReelQuest(isCurrentSlot);
        //     this.reelQuestUI.initPlayAni();
            
        //     if (isCurrentSlot) {
        //         this.reelQuestUI.openNormal(false);
        //     } else {
        //         this.reelQuestUI.openMini(false);
        //     }
        // }
    }

    /** 初始化动态卷轴UI */
    initDynamicReelsUI(): void {
        this.refreshLeftLayout();

        // Suite区域适配
        if (UserInfo.instance()._zoneName === SDefine.SUITE_ZONENAME) {
            // this.suiteLeagueUI?.init();
            if (TSUtility.isValid(this.nodeRightLayout)) {
                this.nodeRightLayout.setPosition(this.nodeRightLayout.position.x, this.nodeRightLayout.position.y - 30);
            }
        }

        // VIP Lounge区域隐藏动态UI
        if (UserInfo.instance()._zoneName === SDefine.VIP_LOUNGE_ZONENAME) {
            this.hideDynamicReelsUI();
        }
    }

    /** 隐藏动态卷轴UI */
    hideDynamicReelsUI(): void {
        this.refreshLeftLayout();
        // this.suiteLeagueUI?.hide();
    }

    /** 设置左侧UI显示状态（根据解锁等级） */
    setLeftUI(): void {
        const userLevel = UserInfo.instance().getUserLevelInfo().level;
        
        // // 星册解锁等级
        // const starAlbumUnlockLevel = UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.STAR_ALBUM);
        // if (this.starAlbumUI) {
        //     this.starAlbumUI.node.active = userLevel >= starAlbumUnlockLevel;
        // }

        // // 英雄系统解锁等级
        // const heroUnlockLevel = UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.HERO);
        // if (this.heroUI) {
        //     this.heroUI.node.active = userLevel >= heroUnlockLevel;
        // }

        this.refreshLeftLayout();
    }

    /** 刷新整体UI */
    refreshUI(): void {
        this.checkChangeLevelUI();
        this.setPositionLeftTopUI();
    }

    /** 根据分辨率调整UI布局位置 */
    setUILayoutPostionByResolution(): void {
        let offsetY = 0;
        if (CameraControl.Instance.scaleAdjuster) {
            offsetY = CameraControl.Instance.scaleAdjuster.getResolutionRatio() * CameraControl.Instance.yOffset;
        }

        if (this.bottomRightNode) {
            this.bottomRightNode.setPosition(this.bottomRightNode.position.x, this.bottomRightNode.position.y + offsetY);
            
            // 动态Slot额外偏移
            if (TSUtility.isDynamicSlot(SlotGameRuleManager.Instance.slotID)) {
                this.bottomRightNode.setPosition(this.bottomRightNode.position.x, this.bottomRightNode.position.y + 40);
            }
        }
    }

    /** 设置右侧图标间距 */
    setIconsInterval(values: number[] = []): void {
        // 更新间距配置
        for (let i = 0; i < values.length; i++) {
            if (i < this._rightIconValues.length) {
                this._rightIconValues[i] = values[i];
            }
        }

        // 计算当前激活的图标数量
        let activeCount = 0;
        if (this.right_Layout?.node) {
            for (let i = 0; i < this.right_Layout.node.childrenCount; i++) {
                if (this.right_Layout.node.children[i].active) {
                    activeCount++;
                }
            }
        }

        // 根据数量设置间距
        let spacing = 0;
        switch (activeCount) {
            case 2:
                spacing = this._rightIconValues[0];
                break;
            case 3:
                spacing = this._rightIconValues[1];
                break;
            case 4:
                spacing = this._rightIconValues[2];
                break;
        }

        if (this.right_Layout) {
            this.right_Layout.spacingY = spacing;
        }
    }

    /** 设置左上UI位置 */
    setPositionLeftTopUI(): void {
        // this.saleIcons?.init();
        
        // VIP Lounge显示Jackpot进度条
        if (this.thrillWheelJackpotGaugeUI) {
            this.thrillWheelJackpotGaugeUI.active = SlotManager.Instance.getZoneId() === SDefine.VIP_LOUNGE_ZONEID;
        }
        
        this._firstDisplay = false;
    }

    /** 设置首次等级UI效果 */
    SetFirstLevelUIEffect(): void {
        this._isFirstLevelEffect = false;
        this.checkChangeLevelUI();
    }

    /** 老虎机旋转回调 */
    onSpinSlot(): void {
        SlotReelSpinStateManager.Instance.getCurrentState();
        // this.starAlbumUI?.closeGauge();
        this.hideFastModeTooltip();
    }

    /** 检查等级UI切换 */
    checkChangeLevelUI(): void {
        const welcomeBonusInfo = UserInfo.instance().getPromotionInfo(WelcomeBonusPromotion.PromotionKeyName);
        
        // 未领取欢迎奖励时的UI状态
        if (TSUtility.isValid(welcomeBonusInfo) && welcomeBonusInfo.isReceived === 0) {
            this._isFirstLevelEffect = true;
            this.levelUI?.setOnOff(true);
            this.levelBoosterUI?.setOnOff(false);
            this.refreshLevelUPPassUI();
            return;
        }

        // 已领取奖励，检查等级提升道具
        if (this._isFirstLevelEffect) return;

        const boostItems = UserInfo.instance().getItemInventory().getItemsByItemId(SDefine.ITEM_LEVEL_UP_BOOSTER);
        let hasValidBoost = false;
        
        if (boostItems.length > 0) {
            const boostItem = boostItems[0];
            if (!boostItem.isExpire()) {
                hasValidBoost = true;
                const multiplier = JSON.parse(boostItem.extraInfo).multiplier;
                this.levelBoosterUI?.setBoosterInfo(multiplier);
            }
        }

        // 更新等级UI显示
        this.levelUI?.setOnOff(!hasValidBoost);
        this.levelBoosterUI?.setOnOff(hasValidBoost);
        this.refreshLevelUPPassUI(hasValidBoost);
    }

    /** 刷新等级通行证UI */
    refreshLevelUPPassUI(hasBoost: boolean = false): void {
        // if (!this.levelUpPassUI) return;
        // this.levelUpPassUI.node.active = false;

        // const levelUpPassInfo = UserInfo.instance().getPromotionInfo(LevelUpPassPromotion.PromotionKeyName);
        // const unlockLevel = UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.LEVEL_PASS);
        
        // // 检查通行证有效性
        // const isAvailable = TSUtility.isValid(levelUpPassInfo) 
        //     && levelUpPassInfo.endDate > TSUtility.getServerBaseNowUnixTime()
        //     && ServiceInfoManager.instance.getUserLevel() >= unlockLevel;

        // if (isAvailable) {
        //     this.levelUpPassUI.node.active = true;
        //     this.levelUpPassUI.setUI();
        // } else {
        //     this.levelUpPassUI.node.active = false;
        // }
    }

    /** 标记已拥有提升道具 */
    setBoostNodeAlready(): void {
        this._hasBoostItemWhenStart = true;
    }

    /** 显示遮罩背景 */
    showBlockingBG(): void {
        if (this._blockBGCount === 0 && this.blockingBG) {
            this.blockingBG.active = true;
            this.blockingBG.opacity = 0;
            this.blockingBG.runAction(cc.fadeTo(0.6,200));
        }
        this._blockBGCount++;
    }

    /** 隐藏遮罩背景 */
    hideBlockingBG(): void {
        this._blockBGCount--;
        if (this._blockBGCount === 0 && this.blockingBG) {
            this.blockingBG.stopAllActions();
            this.blockingBG.active = false;
        }
    }

    /** 设置免广告弹窗 */
    setADSFreePopup(): void {
        if (!ServiceInfoManager.instance.getShowADSFreePopup()) return;
        
        PopupManager.Instance().addOpenPopup(this.getADSFreePopupInfo());
    }

    /** 获取免广告弹窗配置 */
    getADSFreePopupInfo(): OpenPopupInfo {
        const info = new OpenPopupInfo();
        info.type = "WelcomeBonus";
        // info.openCallback = () => {
        //     PopupManager.Instance().showDisplayProgress(true);
        //     ADFreeOfferPopup.getPopup(ServiceInfoManager.NUMBER_ADS_FREE_POPUP_KIND, (err, popup) => {
        //         PopupManager.Instance().showDisplayProgress(false);
        //         if (err) {
        //             PopupManager.Instance().checkNextOpenPopup();
        //         } else {
        //             popup.open();
        //             popup.setCloseCallback(() => {
        //                 PopupManager.Instance().checkNextOpenPopup();
        //             });
        //         }
        //     });
        // };
        return info;
    }

    /** 显示Jiggy奖励提示 */
    openJiggyPrizeTooltip(): void {
        // const jiggyPuzzleInfo = UserInfo.instance().getPromotionInfo(UserPromotion.JiggyPuzzlePromotion.PromotionKeyName);
        // if (!TSUtility.isValid(jiggyPuzzleInfo) || jiggyPuzzleInfo.isAvailable() !== 1) return;

        // const lastOpenTime = LocalStorageManager.getOpendIngameJiggyPuzzleTooltip(UserInfo.instance().getUid());
        // if (TSUtility.getServerBaseNowUnixTime() - lastOpenTime > 3600) {
        //     LocalStorageManager.setOpendIngameJiggyPuzzleTooltip(UserInfo.instance().getUid());
        //     this.jiggyPuzzleUI?.openTooltip();
        // }
    }

    /** 设置新手推广UI */
    setNewBiePromotion(): void {
        const welcomeBonusInfo = UserInfo.instance().getPromotionInfo(WelcomeBonusPromotion.PromotionKeyName);
        const isWelcomeBonusUnreceived = TSUtility.isValid(welcomeBonusInfo) && welcomeBonusInfo.isReceived === 0;

        const newUserMissionInfo = UserInfo.instance().getPromotionInfo(NewUserMissionPromotion.PromotionKeyName);
        const isNewTarget = TSUtility.isValid(newUserMissionInfo) && newUserMissionInfo.isNewTarget === 1 && newUserMissionInfo.stepIdx <= 2;

        // 新手引导
        if (isWelcomeBonusUnreceived) {
            this.playIngameUI_NewbieTutorial(false);
        } else if (!ServerStorageManager.getAsBoolean(StorageKeyType.NEW_IN_GAME_TUTORIAL) && isNewTarget) {
            this.playIngameUI_NewbieTutorial(true);
        }

        this.setIntroduceCoin();
    }

    /** 播放新手引导 */
    playIngameUI_NewbieTutorial(isSpinTutorial: boolean = false): void {
        PopupManager.Instance().showDisplayProgress(true);
        cc.loader.loadRes("IngameUI/InGameUI_Tutorial", (err, prefab) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (err) return;

            const tutorialNode = cc.instantiate(prefab);
            tutorialNode.parent = this.node;
            // this._newbieWelcomeTutorial = tutorialNode.getComponent(InGameUI_Tutorial);
            
            // if (isSpinTutorial) {
            //     this._newbieWelcomeTutorial?.startNewbieSpinTutorial();
            // } else {
            //     this._newbieWelcomeTutorial?.startNewbieWelcomeTutorial();
            // }
        });
    }

    /** 设置引导金币UI */
    setIntroduceCoin(): void {
        if (!SlotManager.Instance.bottomUI) return;

        // 支付表引导金币
        if (this.payTable_IntoduceCoin && SlotManager.Instance._bottomUI.getPayTableBtn()) {
            this.payTable_IntoduceCoin.setParent(SlotManager.Instance._bottomUI.getPayTableBtn().node);
            this.payTable_IntoduceCoin.setPosition(0, 50);
            this.updateServiceintroduce();
        }
    }

    // ===================== 按钮点击事件 =====================
    /** 点击主页按钮 */
    onClickHomeBtn(): void {
        GameCommonSound.playFxOnce("btn_etc");
        SlotManager.Instance.homeBtnProcess();
    }

    /** 点击设置按钮 */
    onClickOptionBtn(): void {
        GameCommonSound.playFxOnce("btn_etc");
        PopupManager.Instance().showDisplayProgress(true);
        
        // OptionPopup_2020.getPopup(false, (err, popup) => {
        //     PopupManager.Instance().showDisplayProgress(false);
        //     if (TSUtility.isValid(this) && !err) {
        //         popup.open(() => {});
        //     }
        // });
    }

    /** 点击银行roll按钮 */
    onClickBankRollBtn(): void {
        GameCommonSound.playFxOnce("btn_shop");
        
        // 避免重复打开商店
        if (ServiceInfoManager.STRING_CURRENT_INTRODUCE_NAME === "BANKROLL_INGAME" || this._isOpenMainshop) return;

        // 检查是否有引导奖励
        if (ServiceInfoManager.instance.isEnableInGameServiceIntroduceBankRoll()) {
            this.bankRoll_IntroduceCoin?.getComponent(TutorialCoinPromotion)?.onCollect();
        } else {
            // // 埋点统计
            // Analytics.clickShop("shop", "REGULAR_COINS_PACK", "REGULAR_COINS_PACK");
            // this._isOpenMainshop = true;

            // // iOS Instant商店兼容
            // if (SDefine.FB_Instant_iOS_Shop_Flag === 1) {
            //     Instant_iOS_Shop.getPopup((err, popup) => {
            //         if (!err) {
            //             popup.open();
            //             popup.setCloseCallback(() => {
            //                 this._isOpenMainshop = false;
            //             });
            //         }
            //     });
            // } else {
            //     // 普通商店
            //     MainShopPopupRenewal.getMainShopPopup((err, popup) => {
            //         if (err) return;

            //         const entryReason = new PurchaseEntryReason(SDefine.P_ENTRYPOINT_INGAMEBANKROLL, true);
            //         popup.open(entryReason, true);
            //         popup.setCloseCallback(() => {
            //             this._isOpenMainshop = false;
            //         });
            //     });
            // }
        }
    }

    /** 显示未实现弹窗 */
    showNotImplementPopup(): void {
        CommonPopup.getCommonPopup((err, popup) => {
            if (err) {
                cc.error("Get CommonPopup fail.");
                return;
            }
            popup.open().setInfo("NOTICE", "Not Implement.", false).setOkBtn("OK", () => {});
        });
    }

    // ===================== 位置与动画相关 =====================
    /** 记录UI原始位置 */
    setOriginalPos(): void {
        if (this.topLeftNode) this._topLeftNodeOriginalPos = this.topLeftNode.getPosition();
        if (this.topRightNode) this._topRightNodeOriginalPos = this.topRightNode.getPosition();
        if (this.leftNode) this._leftNodeOriginalPos = this.leftNode.getPosition();
        if (this.rightNode) this._rightNodeOriginalPos = this.rightNode.getPosition();
        if (this.bottomRightNode) this._bottomRightNodeOriginalPos = this.bottomRightNode.getPosition();
    }

    /** 添加等级经验 */
    addLevelExp(exp: number): void {
        const curLevel = LevelManager.Instance().getLevelFromExp(UserInfo.instance().getUserLevelInfo().exp);
        const newExp = UserInfo.instance().getUserLevelInfo().exp + exp;
        const newLevel = LevelManager.Instance().getLevelFromExp(newExp);

        // 标记等级变化
        ServiceInfoManager.BOOL_CHANGE_LEVEL = curLevel > 0 && newLevel > 0 && curLevel !== newLevel;

        // 更新等级UI
        this.levelUI?.addLevelInfo(exp);
        if (this.levelBoosterUI?.node.active) {
            this.levelBoosterUI.addLevelInfo(exp);
        }

        // // 内容解锁UI经验更新
        // if (TSUtility.isValid(this.contentsOpenUI) && exp > 0) {
        //     this.contentsOpenUI.addExp(exp, true);
        // }

        // 更新全局经验值
        ServiceInfoManager.NUMBER_CURRENT_GAUGE_EXP += exp;
    }

    /** 旋转投注回调 */
    onSpinBetting(result: any): void {
        // 英雄能量条更新
        if (this.heroUI?.node.active) {
            if (UserInfo.instance().getUserHeroInfo().activeHeroID !== "hero_winston") {
                this.heroUI.playSpinAni();
            }
            const heroResult = result.splitChangeResult_HeroPowerGaugeHist();
            UserInfo.instance().applyChangeResult(heroResult);
        }

        // // 小猪存钱罐更新
        // if (this.piggyBankUI?.node.active) {
        //     const piggyResult = result.splitChangeResultByPromotionInfo(PiggyBankPromotionInfo.PromotionKeyName);
        //     if (piggyResult.promotionHist.length > 0) {
        //         this.piggyBankUI.playPiggyBankCoinAni();
        //         UserInfo.instance().applyChangeResult(piggyResult);
        //     }
        // }
    }

    /** 淡入动画 */
    async fadeIn(duration: number): Promise<void> {
        this.node.stopAllActions();
        if (!this._topLeftNodeOriginalPos) this.setOriginalPos();

        // 初始偏移位置
        if (this.topLeftNode) this.topLeftNode.x = this._topLeftNodeOriginalPos.x - 200;
        if (this.topRightNode) this.topRightNode.x = this._topRightNodeOriginalPos.x + 200;
        if (this.leftNode) this.leftNode.x = this._leftNodeOriginalPos.x - 200;
        if (this.rightNode) this.rightNode.x = this._rightNodeOriginalPos.x + 200;
        if (this.bottomRightNode) this.bottomRightNode.x = this._bottomRightNodeOriginalPos.x + 200;

        // 淡入动画
        this.node.runAction(cc.fadeIn(duration / 2));

        var spawnAction = cc.spawn(cc.targetedAction(this.topLeftNode, cc.moveBy(duration, 200, 0).easing(cc.easeSineOut())), cc.targetedAction(this.topRightNode, cc.moveBy(duration, -200, 0).easing(cc.easeSineOut())), cc.targetedAction(this.leftNode, cc.moveBy(duration, 200, 0).easing(cc.easeSineOut())), cc.targetedAction(this.rightNode, cc.moveBy(duration, -200, 0).easing(cc.easeSineOut())), cc.targetedAction(this.bottomRightNode, cc.moveBy(duration, -200, 0).easing(cc.easeSineOut())))         
        this.node.runAction(spawnAction);

        // 延迟播放动画效果
        this.scheduleOnce(() => {
            this.playDongDongEffect();
        }, duration);

        // 等待动画完成
        await AsyncHelper.delayWithComponent(duration, this);
    }

    /** 淡出动画 */
    fadeOut(duration: number): void {
        this.node.stopAllActions();
        if (!this._topLeftNodeOriginalPos) this.setOriginalPos();

        // 恢复原始位置
        if (this.topLeftNode) this.topLeftNode.x = this._topLeftNodeOriginalPos.x;
        if (this.topRightNode) this.topRightNode.x = this._topRightNodeOriginalPos.x;
        if (this.leftNode) this.leftNode.x = this._leftNodeOriginalPos.x;
        if (this.rightNode) this.rightNode.x = this._rightNodeOriginalPos.x;
        if (this.bottomRightNode) this.bottomRightNode.x = this._bottomRightNodeOriginalPos.x;

        // 淡出动画
        this.node.runAction(cc.fadeOut(duration / 2));

        var spawnAction = cc.spawn(cc.targetedAction(this.topLeftNode, cc.moveBy(duration, -500, 0).easing(cc.easeSineIn())), cc.targetedAction(this.topRightNode, cc.moveBy(duration, 500, 0).easing(cc.easeSineIn())), cc.targetedAction(this.leftNode, cc.moveBy(duration, -500, 0).easing(cc.easeSineIn())), cc.targetedAction(this.rightNode, cc.moveBy(duration, 500, 0).easing(cc.easeSineIn())), cc.targetedAction(this.bottomRightNode, cc.moveBy(duration, 500, 0).easing(cc.easeSineIn())));
        this.node.runAction(spawnAction);
    }

    /** 播放咚咚动画效果 */
    playDongDongEffect(): void {
        if (this.blockInputBeforeAnimNode) this.blockInputBeforeAnimNode.active = false;
        // this.saleIcons?.playDongDongEffect();
    }

    /** 刷新左侧布局 */
    refreshLeftLayout(): void {
        const layout = this.leftNode?.getComponent(cc.Layout);
        if (!layout) {
            cc.error("refreshLeftLayout invalid comp");
            return;
        }

        // 检查子节点激活状态
        for (let i = 0; i < this.leftNode?.childrenCount; i++) {
            this.leftNode.children[i].active;
        }

        layout.spacingY = 20;
    }

    // ===================== 礼物气球相关 =====================
    /** 显示礼物气球 */
    onBalloon(): void {
        // if (AdsManager.Instance().isReadyRewardedAD() === 0) return;

        // if (PopupManager.Instance().isOpenPopupOpen()) {
        //     this._isReservedRandomGift = true;
        // } else {
        //     this.giftBalloon?.init();
        // }
    }

    /** 库存更新回调 */
    onUpdateInventory(itemChange: any, changeResult: any): void {
        // 卡牌包处理
        // if (UserInven.CardPackItemInfo.isCardPackItem(itemChange.itemId)) {
        //     let isSlotSpinCardPack = false;
        //     const targetPayCodes = [
        //         PayCode.SlotSpinCardPack,
        //         PayCode.HeroSkill_SlotSpinCardPack_BaseUp,
        //         PayCode.HeroSkill_SlotSpinCardPack_BigWinUp,
        //         PayCode.HeroSkill_SlotSpinCardPack_HotSlot
        //     ];

        //     // 检查是否为目标卡牌包
        //     if (itemChange.addCnt > 0 && targetPayCodes.indexOf(itemChange.payCode) !== -1) {
        //         isSlotSpinCardPack = true;
        //     }

        //     if (isSlotSpinCardPack) {
        //         // 计算卡牌包数量
        //         const prevCnt = UserInfo.instance().getItemInventory().getAllCardPackCnt() - itemChange.addCnt;
        //         const addCnt = itemChange.addCnt;
        //         const rarity = UserInven.CardPackItemInfo.getItemRarity(itemChange.itemId);
        //         const hasHero = UserInven.CardPackItemInfo.hasHero(itemChange.itemId);
                
        //         // 计算英雄力变化
        //         const heroForceHist = changeResult.getItemHistByItemId(SDefine.I_HERO_FORCE);
        //         let heroForceLoss = 0;
        //         for (let i = 0; i < heroForceHist.length; i++) {
        //             if (heroForceHist[i].addCnt < 0) {
        //                 heroForceLoss += -heroForceHist[i].addCnt;
        //             }
        //         }

        //         // 打开奖励弹窗
        //         CommonRewardPopup.getPopup((err, popup) => {
        //             if (err) return;

        //             const openInfo = new OpenPopupInfo();
        //             openInfo.type = "SlotSpin";
        //             openInfo.openCallback = () => {
        //                 const splitResult = changeResult.splitChangeResult(itemChange.pseq);
        //                 popup.open(
        //                     splitResult,
        //                     new CommonRewardTitleInfo({ title: CommonRewardTitleType.SPLENDID }),
        //                     CommonRewardButtonType.NONE,
        //                     new CommonRewardPopupInfo.SlotCardPackReward(hasHero, heroForceLoss)
        //                 );
        //                 popup.setCloseCallback(() => {
        //                     this.starAlbumUI?.refreshCardPackCntUI();
        //                     if (PopupManager.Instance().isOpenPopupOpen()) {
        //                         PopupManager.Instance().checkNextOpenPopup();
        //                     }
        //                 });
        //             };
        //             PopupManager.Instance().addOpenPopup(openInfo);
        //         });
        //     } else {
        //         this.starAlbumUI?.refreshCardPackCntUI();
        //     }
        // }

        // // 赏金卡牌包处理
        // if (UserInven.CardPackItemInfo.isBountyCardPackItem(itemChange.itemId)) {
        //     let isBountyCard = false;
        //     const targetPayCodes = [PayCode.BountyCard];

        //     if (itemChange.addCnt > 0 && targetPayCodes.indexOf(itemChange.payCode) !== -1) {
        //         isBountyCard = true;
        //     }

        //     if (isBountyCard) {
        //         const prevCnt = UserInfo.instance().getItemInventory().getAllCardPackCnt() - itemChange.addCnt;
        //         const addCnt = itemChange.addCnt;
        //         const rarity = UserInven.CardPackItemInfo.getItemRarity(itemChange.itemId);

        //         CollectCardPackPopup.OpenOnSlotSpinPopup(
        //             rarity,
        //             prevCnt,
        //             addCnt,
        //             false,
        //             0,
        //             itemChange.payCode,
        //             () => {
        //                 this.starAlbumUI?.refreshCardPackCntUI();
        //             },
        //             null,
        //             true
        //         );
        //     } else {
        //         this.starAlbumUI?.refreshCardPackCntUI();
        //     }
        // }
    }

    /** 延迟显示礼物气球 */
    onReservedBalloon(): void {
        //if (AdsManager.Instance().isReadyRewardedAD() === 0 || !this._isReservedRandomGift) return;

        this._isReservedRandomGift = false;
        // this.giftBalloon?.init();
    }

    // ===================== 服务引导相关 =====================
    /** 更新服务引导UI */
    updateServiceintroduce(introduceName: string = ""): void {
        if (introduceName !== "") {
            PopupManager.Instance().showDisplayProgress(false);
        }

        ServiceInfoManager.STRING_CURRENT_INTRODUCE_NAME = "";

        // 处理引导点击
        if (introduceName === "BANKROLL_INGAME") {
            this.onClickBankRollBtn();
        } else if (introduceName === "PAYTABLE_INGAME") {
            SlotManager.Instance._bottomUI?.onClickPaytableBtn();
        }

        // 更新引导UI显示
        if (this.bankRoll_IntroduceCoin) {
            this.bankRoll_IntroduceCoin.active = ServiceInfoManager.instance.isEnableInGameServiceIntroduceBankRoll();
        }
        if (this.payTable_IntoduceCoin) {
            this.payTable_IntoduceCoin.active = ServiceInfoManager.instance.isEnableInGameServiceIntroducePayTable();
        }
    }

    // ===================== 星册相关 =====================
    /** 打开星册进度条 */
    openStarAlbumGauge(value: number): void {
        // this.starAlbumUI?.openGauge(value);
    }

    /** 获取弹窗根节点 */
    getPopupRootNode(): cc.Node {
        return this.popupParentRoot;
    }

    // ===================== 快速模式提示 =====================
    /** 设置快速模式提示位置 */
    setFastModePosition(parent: cc.Node): void {
        if (!this.fastModeTooltip) return;
        TSUtility.moveToNewParent(this.fastModeTooltip, parent);
        this.fastModeTooltip.setPosition(cc.Vec2.ZERO);
    }

    /** 显示快速模式提示 */
    showFastModeTooltip(index: number): void {
        if (!this.fastModeTooltip) return;
        
        this.fastModeTooltip.active = true;
        this.unschedule(this.hideFastModeTooltip);
        this.scheduleOnce(this.hideFastModeTooltip, 2);

        // 显示对应提示信息
        for (let i = 0; i < this.fastModeInfos.length; i++) {
            this.fastModeInfos[i].active = i === index;
        }
    }

    /** 隐藏快速模式提示 */
    hideFastModeTooltip(): void {
        if (this.fastModeTooltip) {
            this.fastModeTooltip.active = false;
        }
        this.unschedule(this.hideFastModeTooltip);
    }

    // ===================== 提示框检查 =====================
    async checkTooltip(): Promise<void> {
        // 闪电战提示检查
        const blitzTooltipOpenTime = LocalStorageManager.getOpendIngameBlitzTooltip(UserInfo.instance().getUid()+"");
        const isBlitzTooltipFirstOpen = blitzTooltipOpenTime <= 0;
        const blitzUnlockLevel = UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.DAILY_BLITZ);
        const isBlitzUnlocked = ServiceInfoManager.instance.getUserLevel() >= blitzUnlockLevel;

        // // 任务提示检查
        // const userMission = UserInfo.instance().getUserMission();
        // const isMissionCollectable = userMission.isCompleteAllMission() === 0 && userMission.isCollectableCurrentMission() === 1;
        // const curMissionId = userMission.curMission.id;
        // const lastMissionTooltipTime = ServerStorageManager.getAsNumber(StorageKeyType.CURRENT_MISSION_TOOLTIP_TIME);
        // ServiceInfoManager.instance.dateDiff(lastMissionTooltipTime);
        // const isMissionTooltipEnabled = ServiceInfoManager.BOOL_ENABLE_MISSION_TOOLTIP;

        // // 首次任务提示
        // if (
        //     !this.starAlbumUI?.isOpen() 
        //     && !this.heroUI?.isShowHeroBuffTooltip 
        //     && !isMissionTooltipEnabled 
        //     && isBlitzUnlocked 
        //     && userMission.isCompleteAllMission() === 0
        // ) {
        //     if (!this._isShowFirstMissionTooltip) {
        //         this._isShowFirstMissionTooltip = true;
                
        //         if (isBlitzUnlocked && isMissionCollectable) {
        //             ServiceInfoManager.NUMBER_COMPLETE_TOOLTIP_MISSION_ID = curMissionId;
        //             ServerStorageManager.saveCurrentServerTime(StorageKeyType.COMPETE_TOOLTIP_MISSION_TIME);
        //             MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPENINGAMEMISSIONTOOLTIP);
        //             return;
        //         } else {
        //             ServerStorageManager.save(StorageKeyType.CURRENT_MISSION_TOOLTIP, curMissionId);
        //             ServerStorageManager.saveCurrentServerTime(StorageKeyType.CURRENT_MISSION_TOOLTIP_TIME);
        //             MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPENINGAMISSIONTOOLTIP_ADD);
        //             return;
        //         }
        //     }

        //     // 任务变化提示
        //     if (userMission.isCollectableCurrentMission() === 0 && curMissionId !== ServerStorageManager.getAsNumber(StorageKeyType.CURRENT_MISSION_TOOLTIP)) {
        //         ServerStorageManager.save(StorageKeyType.CURRENT_MISSION_TOOLTIP, curMissionId);
        //         ServerStorageManager.saveCurrentServerTime(StorageKeyType.CURRENT_MISSION_TOOLTIP_TIME);
        //         MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPENINGAMISSIONTOOLTIP_ADD);
        //         return;
        //     }

        //     // 任务完成提示
        //     if (isBlitzTooltipFirstOpen && isMissionCollectable && curMissionId !== ServiceInfoManager.NUMBER_COMPLETE_TOOLTIP_MISSION_ID) {
        //         const tooltipExpireTime = ServerStorageManager.getAsNumber(StorageKeyType.COMPETE_TOOLTIP_MISSION_TIME);
        //         if (tooltipExpireTime < TSUtility.getServerBaseNowUnixTime() + 600) {
        //             ServiceInfoManager.NUMBER_COMPLETE_TOOLTIP_MISSION_ID = curMissionId;
        //             ServerStorageManager.saveCurrentServerTime(StorageKeyType.COMPETE_TOOLTIP_MISSION_TIME);
        //             MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPENINGAMEMISSIONTOOLTIP);
        //             return;
        //         }
        //     }
        // }

        // // 英雄强化提示
        // const isHeroPowerUp = ServiceInfoManager.BOOL_POWER_UP_HERO;
        // ServiceInfoManager.BOOL_POWER_UP_HERO = false;
        
        // if (isHeroPowerUp) {
        //     this.heroUI?.openPowerUpTooltip();
        //     return;
        // }

        // // 卡牌包提示
        // const cardpackTooltipOpenTime = LocalStorageManager.getOpendIngameCardpackTooltip(UserInfo.instance().getUid());
        // const isCardpackTooltipExpired = TSUtility.getServerBaseNowUnixTime() - cardpackTooltipOpenTime > 3600;
        
        // if (UserInfo.instance().getItemInventory().getHeroCardPackCnt() > 0 && isCardpackTooltipExpired) {
        //     this.starAlbumUI?.openTooltip();
        // }
    }

    /** 关闭任务弹窗后显示提示 */
    showMissionTooltipAfterCloseMissionPopup(): void {
        // const blitzUnlockLevel = UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.DAILY_BLITZ);
        // ServiceInfoManager.instance().getUserLevel();
        
        // const userMission = UserInfo.instance().getUserMission();
        // const curMissionId = userMission.curMission.id;

        // if (userMission.isCompleteAllMission() === 0 && userMission.isCollectableCurrentMission() === 0) {
        //     if (curMissionId !== ServerStorageManager.getAsNumber(StorageKeyType.CURRENT_MISSION_TOOLTIP)) {
        //         ServerStorageManager.save(StorageKeyType.CURRENT_MISSION_TOOLTIP, curMissionId);
        //         ServerStorageManager.saveCurrentServerTime(StorageKeyType.CURRENT_MISSION_TOOLTIP_TIME);
        //         MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPENINGAMISSIONTOOLTIP_ADD);
        //     }
        // }
    }

    // ===================== 输入阻塞 =====================
    /** 设置输入阻塞状态 */
    setStateBlockInput(isBlock: boolean): void {
        if (this.block_Node) {
            this.block_Node.active = isBlock;
        }
    }

    /** 获取输入阻塞状态 */
    isActiveBlockInput(): boolean {
        return this.block_Node?.active ?? false;
    }

    // ===================== 英雄提示 =====================
    /** 显示英雄Buff提示 */
    async showIngameHeroBuffTooltip(): Promise<any> {
        return this.heroUI?.openHeroBuffTooltip() ?? false;
    }

    // /** 创建新的星册节点 */
    // createNewStarAlbumNode(parent: Node, cnt: number): InGameStarAlbumUI | null {
    //     if (!this.starAlbumUI) return null;

    //     const newNode = instantiate(this.starAlbumUI.node);
    //     const btn = newNode.getChildByName("btn")?.getComponent(Button);
    //     if (btn) btn.interactable = false;
        
    //     const bar = newNode.getChildByName("Bar");
    //     if (bar) bar.active = false;

    //     parent.addChild(newNode);
        
    //     // 同步位置
    //     const localPos = TSUtility.getLocalPosition(this.starAlbumUI.node, parent);
    //     newNode.setPosition(localPos);

    //     // 设置卡牌数量
    //     const starAlbumComp = newNode.getComponent(InGameStarAlbumUI);
    //     starAlbumComp?.setCardPackCntLabel(cnt);
        
    //     return starAlbumComp;
    // }

    // ===================== B2B UI 检查 =====================
    checkB2BUI(): void {
        if (!TSUtility.isTestDirectSlotMode()) return;

        // const b2bComp = this.node.getComponent(B2BUIControlComponent);
        // if (TSUtility.isValid(b2bComp)) {
        //     b2bComp.setShowActiveNodes(false);
        // }
    }

    // ===================== 最近游玩引导 =====================
    startRecentlyPlayedTutorial(): void {
        PopupManager.Instance().showDisplayProgress(true);
        
        // OptionPopup_2020.getPopup(false, (err, popup) => {
        //     PopupManager.Instance().showDisplayProgress(false);
        //     if (TSUtility.isValid(this) && !err) {
        //         popup.openTutorial_RecentlyPlayed(() => {}, this.nodeMenu);
        //     }
        // });
    }

    // ===================== 游戏内UI刷新 =====================
    refreshInGameSceneUI(): void {
        this.checkChangeLevelUI();

        // 银行roll UI刷新
        if (TSUtility.isValid(this.bankRollNode)) {
            const bankRollComp = this.bankRollNode.getComponent(InGameBankRollPromotionUI);
            if (TSUtility.isValid(bankRollComp)) {
                bankRollComp.updateCouponUI();
            }
        }

        // 英雄UI刷新
        if (TSUtility.isValid(this.heroUI)) {
            this.heroUI.refreshHero();
        }

        // // 星册UI刷新
        // if (TSUtility.isValid(this.starAlbumUI)) {
        //     this.starAlbumUI.refreshCardPackCntUI();
        //     this.starAlbumUI.refreshInGameSceneUI();
        // }
    }

    // ===================== 右侧节点位置 =====================
    setRightNodePositionY(y: number): void {
        if (this.rightNode) {
            this.rightNode.y = y;
        }
    }

    // ===================== 英雄图标创建 =====================
    createHeroIconNode(parent: cc.Node): InGameHeroUI | null {
        if (!this.heroUI) return null;

        const newNode = cc.instantiate(this.heroUI.node);
        const buttons = newNode.getComponentsInChildren(cc.Button);
        
        // 禁用所有按钮
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].interactable = false;
        }

        parent.addChild(newNode);
        
        // 同步位置
        const localPos = TSUtility.getLocalPosition(this.heroUI.node, parent);
        newNode.setPosition(localPos);

        // 设置英雄信息
        const heroComp = newNode.getComponent(InGameHeroUI);
        const heroInfo = UserInfo.instance().getUserHeroInfo();
        
        if (TSUtility.isValid(heroInfo) && heroInfo.activeHeroID.length > 0) {
            const heroDetail = heroInfo.getHeroInfo(heroInfo.activeHeroID);
            if (TSUtility.isValid(heroDetail)) {
                heroComp?.setHero(heroInfo.activeHeroID, heroDetail.rank);
            }
            if (TSUtility.isValid(heroComp?.heroInfoUI)) {
                heroComp.heroInfoUI.setPowerEffect(heroInfo.powerLevel);
            }
        }

        newNode.opacity = 255;
        return heroComp;
    }

    // ===================== 解锁内容更新 =====================
    async updateUnlockContents(callback?: () => void): Promise<void> {
        // if (!TSUtility.isValid(this.contentsOpenUI)) {
        //     callback?.();
        //     return;
        // }

        // this.setStateBlockInput(true);
        // await this.contentsOpenUI.updateExp(callback);
        this.setStateBlockInput(false);
    }

    // ===================== 侧边菜单 =====================
    /** 隐藏侧边菜单 */
    hideSideMenu(): void {
        for (let i = 0; i < this.sideMenu_Nodes.length; i++) {
            this.sideMenu_Nodes[i].active = false;
        }
    }

    /** 显示侧边菜单 */
    showSideMenu(): void {
        for (let i = 0; i < this.sideMenu_Nodes.length; i++) {
            this.sideMenu_Nodes[i].active = true;
        }
    }

    // ===================== SupersizeIt 相关 =====================
    /** 打开SupersizeIt图标 */
    openSupersizeItIcon(): void {
        // if (
        //     !SupersizeItManager.instance.isAvailablePromotion() 
        //     || !SupersizeItManager.instance.isEnableEvent()
        //     || !TSUtility.isValid(this.iconSupersizeIt)
        // ) return;

        // this.iconSupersizeIt.playOpenAnimation();
        // this.iconSupersizeIt.showTooltip();
    }

    /** 打开SupersizeIt弹窗 */
    openSupersizeItPopup(): void {
        // if (
        //     !SupersizeItManager.instance.isAvailablePromotion()
        //     || !SupersizeItManager.instance.isEnableEvent()
        //     || !SupersizeItManager.instance.isPlayTargetSlot()
        // ) return;

        // const openInfo = new OpenPopupInfo();
        // openInfo.type = "supersizeItInfo";
        // openInfo.openCallback = () => {
        //     PopupManager.Instance().showDisplayProgress(true);
        //     // SupersizeItInfoPopup.getPopup((err, popup) => {
        //     //     PopupManager.Instance().showDisplayProgress(false);
        //     //     if (!TSUtility.isValid(err)) {
        //     //         popup.open(true);
        //     //         popup.setCloseCallback(() => {
        //     //             PopupManager.Instance().checkNextOpenPopup();
        //     //         });
        //     //     } else {
        //     //         PopupManager.Instance().checkNextOpenPopup();
        //     //     }
        //     // });
        // };
        // PopupManager.Instance().addOpenPopup(openInfo);
    }

    // ===================== 老虎机启动 =====================
    /** 打开老虎机启动弹窗 */
    async openSlotStartPopup(): Promise<void> {
        this.openSupersizeItPopup();

        // 等待所有弹窗关闭
        if (PopupManager.Instance().getOpenPopupInfoCount() > 0 || PopupManager.Instance().isOpenPopupOpen()) {
            await new Promise<void>((resolve) => {
                PopupManager.Instance().setOpenPopupAllCloseCallback(resolve);
            });
        }
    }

    /** 打开老虎机启动提示 */
    async openSlotStartTooltip(): Promise<void> {
        // 英雄Buff提示
        if (this.heroUI?.node.active) {
            await this.showIngameHeroBuffTooltip();
        }

        // 各种提示显示
        this.openJiggyPrizeTooltip();
        this.heroUI?.openNewHeroTooltip();
        this.setNewBiePromotion();
        this.openSupersizeItIcon();
        this.showLockedTooltip_JiggyPuzzle();
    }

    // ===================== 通用弹窗 =====================
    /** 打开消息弹窗 */
    openMessageBox(config: {
        title?: string;
        message: string;
        isNotXButton?: boolean;
        close?: () => void;
    }): void {
        PopupManager.Instance().showDisplayProgress(true);
        // MessageBoxPopup.getPopup(TSUtility.isValid(config.title), (err, popup) => {
        //     PopupManager.Instance().showDisplayProgress(false);
        //     if (!TSUtility.isValid(err)) {
        //         popup.open(config);
        //     }
        // });
    }

    /** 打开老虎机错误弹窗 */
    async openSlotErrorMessageBox(): Promise<void> {
        this.openMessageBox({
            title: "ISSUE FOUND",
            message: "There was an issue while\nloading slot information.",
            isNotXButton: true,
            close: () => {
                PopupManager.Instance().removeAllPopup();
                
                let zoneId = SlotManager.Instance.getZoneId();
                let zoneName = SlotManager.Instance.getZoneName();
                
                if (SlotManager.Instance.isloungeNewSlot) {
                    zoneId = SDefine.SUITE_ZONEID;
                    zoneName = SDefine.SUITE_ZONENAME;
                }
                
                SlotManager.Instance.goToLobby(zoneId, zoneName);
            }
        });
    }
}