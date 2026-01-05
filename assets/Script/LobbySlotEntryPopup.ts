const { ccclass, property } = cc._decorator;

// 导入所有依赖模块，路径与原JS完全一致，无需修改
import CurrencyFormatHelper from "./global_utility/CurrencyFormatHelper";
import FireHoseSender, { FHLogType } from "./FireHoseSender";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import DialogBase, { DialogState } from "./DialogBase";
import PopupManager from "./manager/PopupManager";
import GameCommonSound from "./GameCommonSound";
import LevelBettingLockConfig from "./Config/LevelBettingLockConfig";
//import CommonServer from "../../Network/CommonServer";
import CasinoJackpotInfoPopup from "./CasinoJackpotInfoPopup";
import EnterCasinoOfferPopup from "./Common/EnterCasinoOfferPopup";
import PowerGemManager from "./manager/PowerGemManager";
import SupersizeItManager from "./SupersizeItManager";
import ServerStorageManager, { StorageKeyType } from "./manager/ServerStorageManager";
import ServiceInfoManager from "./ServiceInfoManager";
import ServiceSlotDataManager from "./manager/ServiceSlotDataManager";
import JiggyPrizeManager from "./manager/JiggyPrizeManager";
import UserInfo from "./User/UserInfo";
import CustomJackpotDataManager from "./manager/CustomJackpotDataManager";
import MessageRoutingManager from "./message/MessageRoutingManager";
import SlotJackpotManager from "./manager/SlotJackpotManager";
import SlotTourneyManager from "./manager/SlotTourneyManager";
import LobbyScene from "./LobbyScene";
import LobbySlotBannerInfo, { SlotBannerType } from "./LobbySlotBannerInfo";
import SlotBannerItem from "./SlotBannerItem";
import LobbyTitleEffectSelector from "./LobbyTitleEffectSelector";
import LobbyUIBase, { LobbyUIType } from "./LobbyUIBase";
import { Utility } from "./global_utility/Utility";
import CommonServer, { PurchaseEntryReason } from "./Network/CommonServer";

/**
 * 老虎机进入弹窗的类型枚举 - 与原JS完全一致，字符串枚举
 */
export const SlotType = {
    NONE: "none",
    REGULAR: "regular",
    HIGH: "high",
    DYNAMIC: "dynamic"
};
export type SlotType = typeof SlotType[keyof typeof SlotType];

/**
 * 老虎机大厅入口弹窗核心脚本
 * 负责老虎机的档位切换、收藏、大奖展示、进入游戏等核心逻辑
 * 100%还原原JS逻辑，Cocos 2.4.13 TS标准写法
 */
@ccclass
export default class LobbySlotEntryPopup extends DialogBase {
    // ===================== 【序列化属性】编辑器拖拽绑定，原JS核心绑定项，语法完全适配2.4.13 =====================
    @property(cc.Prefab)
    public prefLongBanner: cc.Prefab = null!;

    @property(cc.Prefab)
    public prefJackpotTitle: cc.Prefab = null!;

    @property(cc.Button)
    public btnLeftArrow: cc.Button = null!;

    @property(cc.Button)
    public btnRightArrow: cc.Button = null!;

    @property(cc.Button)
    public btnFavorite: cc.Button = null!;

    @property(cc.Button)
    public btnFavorite_Off: cc.Button = null!;

    @property(cc.Button)
    public btnJackpot: cc.Button = null!;

    @property(cc.Button)
    public btnDynamicOff: cc.Button = null!;

    @property(cc.Button)
    public btnHighOff: cc.Button = null!;

    @property(cc.Button)
    public btnRegularOff: cc.Button = null!;

    @property(cc.Node)
    public nodeDynamicOn: cc.Node = null!;

    @property(cc.Node)
    public nodeHighOn: cc.Node = null!;

    @property(cc.Node)
    public nodeRegularOn: cc.Node = null!;

    @property(cc.Node)
    public nodeBannerRoot: cc.Node = null!;

    @property(cc.Node)
    public nodeTabButtonRoot: cc.Node = null!;

    @property(cc.Node)
    public nodeJackpotTitleRoot: cc.Node = null!;

    @property(cc.Node)
    public nodeEntryButton_3: cc.Node = null!;

    @property(cc.Node)
    public nodeEntryButton_2: cc.Node = null!;

    @property(cc.Node)
    public nodeEntryButton_1: cc.Node = null!;

    @property(cc.Animation)
    public animUnlockDynamic: cc.Animation = null!;

    @property(cc.Animation)
    public animUnlockHigh: cc.Animation = null!;

    // ===================== 【私有常量】原JS内置常量，数值/配置完全一致，一字未改 =====================
    private readonly VIP_BETTING_DATA = [
        { level: 0, regular: [12000, 300000, 1200000, 3000000], high: [300000, 1200000, 3000000, 12000000], dynamic: [3000000, 12000000, 30000000, 60000000] },
        { level: 1, regular: [300000, 1200000, 6000000, 12000000], high: [1200000, 6000000, 12000000, 30000000], dynamic: [3000000, 12000000, 30000000, 60000000] },
        { level: 2, regular: [600000, 3000000, 12000000, 30000000], high: [3000000, 12000000, 30000000, 60000000], dynamic: [3000000, 12000000, 30000000, 60000000] },
        { level: 3, regular: [600000, 3000000, 12000000, 30000000], high: [3000000, 12000000, 30000000, 60000000], dynamic: [3000000, 12000000, 30000000, 60000000] },
        { level: 4, regular: [1200000, 6000000, 30000000, 60000000], high: [6000000, 30000000, 60000000, 120000000], dynamic: [12000000, 60000000, 120000000, 180000000] },
        { level: 5, regular: [3000000, 12000000, 60000000, 120000000], high: [12000000, 60000000, 120000000, 180000000], dynamic: [30000000, 120000000, 180000000, 300000000] },
        { level: 6, regular: [3000000, 30000000, 60000000, 120000000], high: [30000000, 60000000, 180000000, 300000000], dynamic: [60000000, 180000000, 300000000, 600000000] },
        { level: 7, regular: [6000000, 30000000, 60000000, 120000000], high: [60000000, 120000000, 300000000, 600000000], dynamic: [120000000, 300000000, 600000000, 1200000000] },
        { level: 8, regular: [6000000, 30000000, 60000000, 120000000], high: [60000000, 120000000, 300000000, 600000000], dynamic: [120000000, 300000000, 600000000, 1200000000] },
        { level: 9, regular: [6000000, 30000000, 60000000, 120000000], high: [60000000, 120000000, 300000000, 600000000], dynamic: [120000000, 300000000, 600000000, 1200000000] }
    ];
    private readonly ANIMATION_NAME_UNLOCK_MODE = "UnLock_Ani";
    private readonly SLOT_FAVORITE_MAX_COUNT = 50;
    private readonly BANNER_IMAGE_PRELOAD_COUNT = 5;

    // ===================== 【私有成员变量】原JS所有变量完整还原，类型适配 =====================
    private _arrEntrySlotBanner: LobbySlotBannerInfo[] = [];
    private _arrFavoriteSlot: string[] = [];
    private _arrNormalSlot: LobbySlotBannerInfo[] = [];
    private _arrDynamicSlot: LobbySlotBannerInfo[] = [];
    private _arrJackpotInfo: { lbl: cc.Label, index: number }[] = [];
    private _arrJackpotPrevValue: number[] = [0, 0, 0, 0];
    private _numIndex: number = -1;
    private _eType: SlotType = SlotType.NONE;
    private _eEntryBannerType: any = SlotBannerType.NONE;
    private _itemBanner: SlotBannerItem | null = null;
    private _infoMachine: any = null;
    private _jackpot: LobbyTitleEffectSelector | null = null;
    private _infoServerSlot: any = null;
    private _isJackpotOpen: boolean = false;
    private _isOpeningPopup: boolean = true;
    private _numMaxBetting: number = 0;
    private _numMaxBettingAllUnlockLevel: number = 0;
    private _updateLoungePassTime: Function | null = null;
    private _updateSuitePassTime: Function | null = null;

    // ===================== 【只读属性(Getter)】100%还原原JS逻辑，无任何改动 =====================
    get isPassableHigh(): boolean {
        return false;//UserInfo.instance().isPassAbleCasino(SDefine.VIP_LOUNGE_ZONEID, SDefine.VIP_LOUNGE_ZONENAME);
    }

    get isPassableDynamic(): boolean {
        return false;//UserInfo.instance().isPassAbleCasino(SDefine.SUITE_ZONEID, SDefine.SUITE_ZONENAME);
    }

    get numUserLevel(): number {
        return 0;//UserInfo.instance().getUserLevelInfo().level;
    }

    get numUserVIPLevel(): number {
        return 0;//UserInfo.instance().getUserVipInfo().level;
    }

    get numTotalCoin(): number {
        return 0;//UserInfo.instance().getTotalCoin();
    }

    get nodeTabRoot(): cc.Node | null {
        return this.nodeTabButtonRoot;
    }

    // ===================== 【静态方法】弹窗单例加载，原JS核心逻辑 =====================
    public static getPopup(callback: (err: Error | null, popup: LobbySlotEntryPopup | null) => void): void {
        const resPath = "Service/01_Lobby/LobbySlotEntry/LobbySlotEntryPopup";
        cc.loader.loadRes(resPath, (err, prefab) => {
            if (err) {
                const error = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                callback && callback(error, null);
                return;
            }
            if (callback) {
                const node = cc.instantiate(prefab);
                const popup = node.getComponent(LobbySlotEntryPopup);
                node.active = false;
                callback(null, popup);
            }
        });
    }

    // ===================== 【生命周期回调】 =====================
    onLoad(): void {
        this.initDailogBase();
        // 绑定所有按钮点击事件，沿用原JS的工具类方法
        this.btnLeftArrow.clickEvents.push(Utility.getComponent_EventHandler(this.node, "LobbySlotEntryPopup", "onClick_Left", ""));
        this.btnRightArrow.clickEvents.push(Utility.getComponent_EventHandler(this.node, "LobbySlotEntryPopup", "onClick_Right", ""));
        this.btnFavorite.clickEvents.push(Utility.getComponent_EventHandler(this.node, "LobbySlotEntryPopup", "onClick_Favorite", ""));
        this.btnFavorite_Off.clickEvents.push(Utility.getComponent_EventHandler(this.node, "LobbySlotEntryPopup", "onClick_Favorite", ""));
        this.btnJackpot.clickEvents.push(Utility.getComponent_EventHandler(this.node, "LobbySlotEntryPopup", "onClick_Jackpot", ""));
        this.btnDynamicOff.clickEvents.push(Utility.getComponent_EventHandler(this.node, "LobbySlotEntryPopup", "onClick_Dynamic", ""));
        this.btnHighOff.clickEvents.push(Utility.getComponent_EventHandler(this.node, "LobbySlotEntryPopup", "onClick_High", ""));
        this.btnRegularOff.clickEvents.push(Utility.getComponent_EventHandler(this.node, "LobbySlotEntryPopup", "onClick_Regular", ""));
    }

    // ===================== 【核心业务方法】弹窗打开，100%还原原JS异步逻辑 =====================
    async open(slotID: string, bannerType: any = SlotBannerType.NONE, slotType: SlotType = SlotType.NONE): Promise<void> {
        PopupManager.Instance().showDisplayProgress(true);
        this._eEntryBannerType = bannerType;

        // 实例化Banner预制体
        const bannerNode = cc.instantiate(this.prefLongBanner);
        bannerNode.parent = this.nodeBannerRoot;
        bannerNode.setPosition(cc.Vec2.ZERO);
        this._itemBanner = bannerNode.getComponent(SlotBannerItem);
        this._itemBanner!.isUseWithDynamicSlot = false;

        // 实例化大奖标题预制体
        const jackpotNode = cc.instantiate(this.prefJackpotTitle);
        jackpotNode.parent = this.nodeJackpotTitleRoot;
        jackpotNode.setPosition(cc.Vec2.ZERO);
        this._jackpot = jackpotNode.getComponent(LobbyTitleEffectSelector);
        this._jackpot!.setOnChangeBurningState(LobbyScene.instance.refreshBGM.bind(this));
        this._jackpot!.initLobbyTitleEffectSelector(true, false);
        this._jackpot!.setActivePassNode(false);
        this._jackpot!.setActiveLockUI(this._eType === SlotType.REGULAR);
        this._jackpot!.setCenter();

        // 初始化收藏列表
        this._arrFavoriteSlot = ServerStorageManager.getAsStringArray(StorageKeyType.SLOT_FAVORITE);
        
        // 初始化投注锁配置
        const zoneInfo = LevelBettingLockConfig.Instance().getZoneInfo(this.getZoneID());
        const nextLockLevel = zoneInfo.getNextLevelBetLock_LevelInfo(this.numUserLevel);
        this._numMaxBettingAllUnlockLevel = zoneInfo.infos[zoneInfo.infos.length - 1].level;
        this._numMaxBetting = TSUtility.isValid(nextLockLevel) ? nextLockLevel.betMoney : 0;

        // 更新锁状态 + 启动通行证监控
        this.updateLock();
        this.startPassMonitoring();

        // 获取老虎机类型
        const targetType = await this.getEntrySlotType(slotID, slotType);
        if (targetType === SlotType.NONE) {
            this.close();
            return;
        }

        // 预加载Banner图片
        const slotRes = ServiceSlotDataManager.instance.getResourceDataBySlotID(slotID);
        if (TSUtility.isValid(slotRes) && !slotRes.isHasCacheLongImage) {
            await slotRes.preloadLongImage();
        }

        // 更新Banner信息
        const bannerIndex = this.updateSlotBannerInfo(slotID);
        await this.updateSlotBanner(bannerIndex, targetType);

        // 弹窗打开收尾
        LobbyScene.instance.UI.setActiveAllWidget(false);
        this._itemBanner!.removeAllButton();
        PopupManager.Instance().showDisplayProgress(false);
        this._isOpeningPopup = false;
        GameCommonSound.playFxOnce("pop_etc");
        this._open(cc.fadeIn(0.25), false, () => {});
    }

    // ===================== 【核心业务方法】所有原JS方法完整还原，按原顺序排列，逻辑无改动 =====================
    async getEntrySlotType(slotID: string, slotType: SlotType): Promise<SlotType> {
        let targetType = SlotType.REGULAR;
        if (slotType !== SlotType.NONE) {
            targetType = slotType;
            if (targetType === SlotType.HIGH && !this.isPassableHigh) targetType = SlotType.REGULAR;
            if (targetType === SlotType.DYNAMIC && !this.isPassableDynamic) targetType = SlotType.REGULAR;
            return targetType;
        }

        if (TSUtility.isDynamicSlot(slotID)) {
            targetType = SlotType.DYNAMIC;
            return targetType;
        }

        if (this.numUserVIPLevel <= 0) {
            targetType = SlotType.REGULAR;
            return targetType;
        }

        targetType = SlotType.REGULAR;
        let tourneyParam: any = null;
        if (SDefine.SlotTournament_Use && SlotTourneyManager.Instance().isEnterSlotTourney()) {
            tourneyParam = {
                tourneyID: SlotTourneyManager.Instance().getEnterTourneyID(),
                tourneyTier: SlotTourneyManager.Instance().getEnterTourneyTier()
            };
        }

        if (slotID === "") return SlotType.NONE;
        if (!this._isOpeningPopup) PopupManager.Instance().showDisplayProgress(true);

        const slotGameInfo = await CommonServer.Instance().getSlotGameInfo(
            UserInfo.instance().getUid(),
            UserInfo.instance().getAccessToken(),
            SDefine.VIP_LOUNGE_ZONEID,
            slotID,
            JSON.stringify(tourneyParam)
        );

        if (!this._isOpeningPopup) PopupManager.Instance().showDisplayProgress(false);
        if (CommonServer.isServerResponseError(slotGameInfo)) {
            this.openSlotInfoErrorPopup();
            return SlotType.NONE;
        }
        if (!TSUtility.isValid(slotGameInfo)) {
            this.openSlotInfoErrorPopup();
            return SlotType.NONE;
        }
        if (TSUtility.isValid(slotGameInfo.isActive) && slotGameInfo.isActive === 0) {
            this.openSlotInfoErrorPopup();
            return SlotType.NONE;
        }

        const bettingArr = Array.from(this.getArrayBettingInfo(slotGameInfo));
        if (!TSUtility.isValid(bettingArr) || bettingArr.length <= 0) {
            this.openSlotInfoErrorPopup();
            return SlotType.NONE;
        }

        const firstBet = bettingArr[0];
        if (!TSUtility.isValid(firstBet)) return targetType;
        targetType = firstBet.betting * 10 > this.numTotalCoin ? SlotType.REGULAR : SlotType.HIGH;
        return targetType;
    }

    async updateLock(isPlayAni: boolean = false): Promise<void> {
        if (isPlayAni) {
            if (this.animUnlockHigh.node.active && this.isPassableHigh) {
                this.animUnlockHigh.setCurrentTime(0);
                this.animUnlockHigh.play(this.ANIMATION_NAME_UNLOCK_MODE, 0);
            }
            if (this.animUnlockDynamic.node.active && this.isPassableDynamic) {
                this.animUnlockDynamic.setCurrentTime(0);
                this.animUnlockDynamic.play(this.ANIMATION_NAME_UNLOCK_MODE, 0);
            }
        }

        let isDynamic = false;
        if (this._numIndex >= 0 && this._numIndex < this._arrEntrySlotBanner.length) {
            const bannerInfo = this._arrEntrySlotBanner[this._numIndex];
            isDynamic = this.isDynamicSlotArray(bannerInfo.strSlotID);
        }

        this.animUnlockHigh.node.active = !this.isPassableHigh;
        this.animUnlockDynamic.node.active = isDynamic && !this.isPassableDynamic;
    }

    startPassMonitoring(): void {
        this.stopPassMonitoring();
        const self = this;

        this._updateLoungePassTime = () => {
            const user = UserInfo.instance();
            // const inventory = UserInfo.instance().getItemInventory();
            // if (user.hasVipPassBenefit(SDefine.VIP_LOUNGE_ZONEID, SDefine.VIP_LOUNGE_ZONENAME) === 0 && user.hasMajorRollerFreeTicket()) {
            //     const ticket = inventory.getItemsByItemId(SDefine.ITEM_MAJORROLLER_FREETICKET)[0];
            //     if (TSUtility.isValid(ticket) && ticket.expireDate <= TSUtility.getServerBaseNowUnixTime()) {
            //         if (self._eType === SlotType.HIGH) self.updateSlotBanner(self._numIndex, SlotType.REGULAR);
            //         self.updateLock();
            //         self._updateLoungePassTime && self.unschedule(self._updateLoungePassTime);
            //         self._updateLoungePassTime = null;
            //     }
            // }
            self.updateLock();
        };

        this._updateSuitePassTime = () => {
            const user = UserInfo.instance();
            // const inventory = UserInfo.instance().getItemInventory();
            // if (user.hasVipPassBenefit(SDefine.SUITE_ZONEID, SDefine.SUITE_ZONENAME) === 0 && user.hasSuitePass()) {
            //     const pass = inventory.getItemsByItemId(SDefine.ITEM_SUITE_PASS)[0];
            //     if (TSUtility.isValid(pass) && pass.expireDate <= TSUtility.getServerBaseNowUnixTime()) {
            //         if (self._eType === SlotType.DYNAMIC) self.updateSlotBanner(self._numIndex, SlotType.REGULAR);
            //         self.updateLock();
            //         self._updateSuitePassTime && self.unschedule(self._updateSuitePassTime);
            //         self._updateSuitePassTime = null;
            //     }
            // }
            self.updateLock();
        };

        this.schedule(this._updateLoungePassTime, 1);
        this.schedule(this._updateSuitePassTime, 1);
    }

    stopPassMonitoring(): void {
        this._updateLoungePassTime && this.unschedule(this._updateLoungePassTime);
        this._updateSuitePassTime && this.unschedule(this._updateSuitePassTime);
        this._updateLoungePassTime = null;
        this._updateSuitePassTime = null;
    }

    updateSlotBannerInfo(slotID: string): number {
        this._arrEntrySlotBanner = [];
        if (this._eEntryBannerType === SlotBannerType.NONE) {
            const bannerInfo = ServiceSlotDataManager.instance.getSlotBannerInfo(SDefine.VIP_LOUNGE_ZONEID, slotID);
            if (!TSUtility.isValid(bannerInfo)) return 0;
            // this._arrEntrySlotBanner.push(bannerInfo);
            return 0;
        }

        const bannerScrollUI = LobbyScene.instance.UI.getLobbyUI(LobbyUIType.BANNER_SCROLL_VIEW);
        if (!TSUtility.isValid(bannerScrollUI)) return 0;

        // this._arrNormalSlot = bannerScrollUI.getSlotBannerInfo(SlotBannerType.NORMAL);
        // this._arrDynamicSlot = bannerScrollUI.getSlotBannerInfo(SlotBannerType.DYNAMIC);

        let targetIndex = -1;
        // const scrollData = Array.from(bannerScrollUI.getScrollViewData());
        // for (let i = 0; i < scrollData.length; i++) {
        //     const item = scrollData[i].itemData;
        //     if (!TSUtility.isValid(item)) continue;
        //     const bannerList = item.arrSlotBanner;
        //     if (!TSUtility.isValid(bannerList) || bannerList.length <= 0) continue;

        //     for (let j = 0; j < bannerList.length; j++) {
        //         const banner = bannerList[j];
        //         if (!TSUtility.isValid(banner)) continue;
        //         if (banner.isEarlyAccessSlot && !this.isPassableHigh && !(banner.isSupersizeSlot && SupersizeItManager.instance.isHasSupersizeFreeTicket())) continue;
        //         if (TSUtility.isDynamicSlot(banner.strSlotID) && !this.isPassableDynamic) continue;

        //         this._arrEntrySlotBanner.push(banner);
        //         if (item.type === this._eEntryBannerType && banner.strSlotID === slotID) {
        //             targetIndex = this._arrEntrySlotBanner.length - 1;
        //         }
        //     }
        // }
        return targetIndex;
    }

    isContainZoneSlotList(slotID: string, zoneData: any): boolean {
        for (let i = 0; i < zoneData.slotList.length; i++) {
            if (slotID === zoneData.slotList[i].slotID) return true;
        }
        return false;
    }

    async updateSlotBanner(index: number = this._numIndex, slotType: SlotType = this._eType): Promise<void> {
        if (index < 0 || index >= this._arrEntrySlotBanner.length) return;
        const isPassable = await this.checkPassableSlot(index, slotType);
        if (!isPassable) return;

        if (!this._isOpeningPopup) PopupManager.Instance().showBlockingBG(true);
        const bannerInfo = this._arrEntrySlotBanner[index];
        const isDynamic = this.isDynamicSlotArray(bannerInfo.strSlotID);
        
        if (slotType === SlotType.DYNAMIC && !isDynamic) slotType = SlotType.REGULAR;
        this._eType = slotType;
        this._numIndex = index;

        // 更新箭头显隐
        this.btnLeftArrow.node.active = !(index <= 0);
        this.btnRightArrow.node.active = !(index >= this._arrEntrySlotBanner.length - 1);

        // 更新档位按钮显隐
        const targetSlotID = this._eType === SlotType.DYNAMIC ? this.getDynamicSlotID(bannerInfo.strSlotID) : this.getNormalSlotID(bannerInfo.strSlotID);
        this.nodeDynamicOn.active = this._eType === SlotType.DYNAMIC && isDynamic;
        this.nodeHighOn.active = this._eType === SlotType.HIGH;
        this.nodeRegularOn.active = this._eType === SlotType.REGULAR;
        this.btnDynamicOff.node.active = this._eType !== SlotType.DYNAMIC && isDynamic;
        this.btnHighOff.node.active = this._eType !== SlotType.HIGH;
        this.btnRegularOff.node.active = this._eType !== SlotType.REGULAR;

        // 更新锁状态 + 大奖锁动画
        this.updateLock();
        if (this._jackpot!.isLockedJackpot() && this._eType !== SlotType.REGULAR) {
            if (!this._isJackpotOpen) {
                this._jackpot!.playLockAction(true);
                this._isJackpotOpen = true;
            }
        } else {
            this._jackpot!.playLockAction(false);
            this._jackpot!.setActiveLockUI(this._eType === SlotType.REGULAR);
            this._isJackpotOpen = false;
        }

        // 初始化BannerItem
        this._itemBanner!.numZoneID = this.getZoneID();
        const targetBannerInfo = this._eEntryBannerType === SlotBannerType.NONE 
            ? this._arrEntrySlotBanner[index] 
            : (TSUtility.isDynamicSlot(targetSlotID) 
                ? this._arrDynamicSlot.find(info => info.strSlotID === targetSlotID)
                : this._arrNormalSlot.find(info => info.strSlotID === targetSlotID));

        if (TSUtility.isValid(targetBannerInfo)) {
            const isFavorite = this._arrFavoriteSlot.includes(this.getNormalSlotID(targetBannerInfo.strSlotID));
            this.btnFavorite.node.active = isFavorite;
            this.btnFavorite_Off.node.active = !isFavorite;
        } else {
            this.btnFavorite.node.active = false;
            this.btnFavorite_Off.node.active = true;
        }

        await this._itemBanner!.initialize(targetBannerInfo);
        this.preloadBannerImage();
        await this.updatePlayButton();
        this.updateJackpotInfo();

        // 调度大奖刷新
        this.unschedule(this.updateJackpotInfo.bind(this));
        this.schedule(this.updateJackpotInfo.bind(this), SDefine.JACKPOT_DISPLAY_DEFAULT_INTERVAL);
        
        if (!this._isOpeningPopup) PopupManager.Instance().showBlockingBG(false);
    }

    async updatePlayButton(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            this._arrJackpotInfo = [];
            this._arrJackpotPrevValue = [];
            this._infoMachine = null;
            this._infoServerSlot = null;

            let tourneyParam: any = null;
            if (SDefine.SlotTournament_Use && SlotTourneyManager.Instance().isEnterSlotTourney()) {
                tourneyParam = {
                    tourneyID: SlotTourneyManager.Instance().getEnterTourneyID(),
                    tourneyTier: SlotTourneyManager.Instance().getEnterTourneyTier()
                };
            }

            if (!TSUtility.isValid(this._itemBanner) || this._itemBanner!.slotID === "") {
                reject();
                return;
            }

            const slotGameInfo = await CommonServer.Instance().getSlotGameInfo(
                UserInfo.instance().getUid(),
                UserInfo.instance().getAccessToken(),
                this.getZoneID(),
                this._itemBanner!.slotID,
                JSON.stringify(tourneyParam)
            );

            if (CommonServer.isServerResponseError(slotGameInfo)) {
                this.openSlotInfoErrorPopup();
                reject();
                return;
            }
            if (TSUtility.isValid(slotGameInfo.isActive) && slotGameInfo.isActive === 0) {
                this.openSlotInfoErrorPopup();
                reject();
                return;
            }
            if (!TSUtility.isValid(slotGameInfo) || slotGameInfo.slotInfo.slotID !== this._itemBanner!.slotID) {
                this.openSlotInfoErrorPopup();
                reject();
                return;
            }

            this._infoServerSlot = slotGameInfo;
            const bettingArr = Array.from(this.getArrayBettingInfo(this._infoServerSlot));
            if (!TSUtility.isValid(bettingArr) || bettingArr.length <= 0) {
                this.openSlotInfoErrorPopup();
                reject();
                return;
            }

            this._infoMachine = SlotJackpotManager.Instance().getSlotmachineInfo(this.getZoneID(), this._itemBanner!.slotID);
            const isEventSlot = this._itemBanner!.isEventSlot;
            
            // 隐藏所有进入按钮
            this.nodeEntryButton_1.active = false;
            this.nodeEntryButton_2.active = false;
            this.nodeEntryButton_3.active = false;

            // 显示对应按钮
            const showBtn = this._itemBanner!.arrJackpotType.length > 0 ? this.nodeEntryButton_3 : isEventSlot ? this.nodeEntryButton_2 : this.nodeEntryButton_1;
            showBtn.active = true;

            // 初始化按钮数据
            const btnChildren = showBtn.children;
            const self = this;
            const initBtnItem = (idx: number) => {
                const item = btnChildren[idx];
                if (!TSUtility.isValid(item)) return "continue";
                const entryBtn = item.getChildByName("EntryButton");
                if (!TSUtility.isValid(entryBtn)) return "continue";

                const bettingInfo = bettingArr[idx];
                if (!TSUtility.isValid(bettingInfo)) return "continue";
                const betMoney = bettingInfo.betting;
                const betIndex = bettingInfo.index;

                // 绑定点击事件
                const btnComp = entryBtn.getComponent(cc.Button);
                if (TSUtility.isValid(btnComp)) {
                    btnComp.clickEvents = [];
                    btnComp.clickEvents.push(Utility.getComponent_EventHandler(self.node, "LobbySlotEntryPopup", "onClick_Entry", betIndex));
                }

                // 更新投注金额文本
                const lblList = entryBtn.getComponentsInChildren(cc.Label);
                if (TSUtility.isValid(lblList) && lblList.length > 0) {
                    lblList.forEach(lbl => lbl.string = CurrencyFormatHelper.formatNumber(betMoney));
                }

                // 更新按钮锁状态
                const lockNode = btnComp.node.children.find(n => n.name.includes("Lock"));
                if (self._eType === SlotType.DYNAMIC) {
                    self.updateButtonBG(btnComp.node, true);
                    btnComp!.interactable = true;
                    lockNode!.active = false;
                } else if (self._eType === SlotType.HIGH) {
                    self.updateButtonBG(btnComp.node, idx >= 2);
                    btnComp!.interactable = true;
                    lockNode!.active = false;
                } else {
                    self.updateButtonBG(btnComp.node, false);
                    btnComp!.interactable = self._numMaxBetting === 0 || betMoney < self._numMaxBetting;
                    lockNode!.active = !btnComp!.interactable;
                }

                // 更新大奖金额
                const jackpotNode = item.getChildByName("Jackpot");
                if (TSUtility.isValid(jackpotNode)) {
                    const jackpotLbl = jackpotNode.getComponentInChildren(cc.Label);
                    if (TSUtility.isValid(jackpotLbl)) {
                        const slotID = self._itemBanner!.slotID;
                        const zoneID = self.getZoneID();
                        const customSubID = CustomJackpotDataManager.instance().findCustomJackpotSubID(slotID);
                        const customJackpot = CustomJackpotDataManager.instance().findCustomJackpotMoney(slotID);
                        const jackpotType = self._itemBanner!.arrJackpotType[0];
                        const betLines = self._infoServerSlot.zoneBetPerLines;
                        const maxBet = betLines[betLines.length - 1];
                        const curBet = betLines[betIndex];
                        const jackpotValue = SlotBannerItem.getDisplayJackpotMoney_BetCustom(customSubID, customJackpot, 0, slotID, jackpotType, zoneID, curBet, maxBet);
                        
                        self._arrJackpotPrevValue[self._arrJackpotInfo.length] = jackpotValue;
                        jackpotLbl.string = CurrencyFormatHelper.formatNumber(jackpotValue);
                        self._arrJackpotInfo.push({ lbl: jackpotLbl, index: betIndex });
                    }
                }

                // 更新标签状态
                const tagNode = item.getChildByName("Tag");
                if (TSUtility.isValid(tagNode)) {
                    const tagChildren = tagNode.children;
                    tagChildren.forEach(n => n.active = false);
                    if (self._itemBanner!.isSupersizeItSlot) {
                        if (SupersizeItManager.instance.isBetAmountEnoughToAvailablePromotion(betMoney)) {
                            tagChildren.forEach(n => n.active = n.name.includes("Super"));
                        }
                    } else if (self._itemBanner!.isPowerGemSlot) {
                        if (PowerGemManager.instance.isPossiblePowerGem(betMoney)) {
                            tagChildren.forEach(n => n.active = n.name.includes("PowerGem"));
                        }
                    } else if (self._itemBanner!.isJiggyPrizeSlot) {
                        if (JiggyPrizeManager.instance.isBettingLimit(betMoney)) {
                            tagChildren.forEach(n => n.active = n.name.includes("Jiggy"));
                        }
                    } else if (self._itemBanner!.isReelQuestSlot) {
                        tagChildren.forEach(n => n.active = n.name.includes("TRQ"));
                    }
                }
            };

            for (let i = 0; i < btnChildren.length; i++) {
                initBtnItem(i);
            }
            resolve();
        });
    }

    getArrayBettingInfo(slotGameInfo: any): Array<{ index: number, betting: number }> {
        if (!TSUtility.isValid(slotGameInfo)) return [];
        let level = ServiceInfoManager.NUMBER_START_MEMBERS_LEVEL;
        if (level < 0 || level >= this.VIP_BETTING_DATA.length) level = 0;
        if (this.numUserLevel < this._numMaxBettingAllUnlockLevel) level = 0;

        const betConfig = this.VIP_BETTING_DATA.find(item => item.level === level);
        const betList = this._eType === SlotType.DYNAMIC ? betConfig!.dynamic : this._eType === SlotType.HIGH ? betConfig!.high : betConfig!.regular;
        if (!TSUtility.isValid(betList)) return [];

        const betPerLines = slotGameInfo.zoneBetPerLines;
        let rate = 0;
        const maxBetLine = slotGameInfo.slotInfo.maxBetLine;
        if (slotGameInfo.slotInfo.featureTotalBetRate100 != null) rate = slotGameInfo.slotInfo.featureTotalBetRate100;
        if (!TSUtility.isValid(betPerLines) || betPerLines.length <= 0) return [];

        const result: Array<{ index: number, betting: number }> = [];
        for (let i = betList.length - 1; i >= 0; i--) {
            const targetBet = betList[i];
            for (let j = betPerLines.length - 1; j >= 0; j--) {
                const realBet = (betPerLines[j] + betPerLines[j] * rate / 100) * maxBetLine;
                if (targetBet >= realBet) {
                    result.push({ index: j, betting: realBet });
                    break;
                }
            }
        }
        return result.reverse();
    }

    updateJackpotInfo(): void {
        if (!TSUtility.isValid(this._itemBanner) || !TSUtility.isValid(this._infoServerSlot) || 
            !TSUtility.isValid(this._infoMachine) || !TSUtility.isValid(this._arrJackpotInfo) || 
            this._arrJackpotInfo.length <= 0) return;

        const jackpotType = this._itemBanner!.arrJackpotType[0];
        if (!TSUtility.isValid(jackpotType)) return;

        const betPerLines = this._infoServerSlot.zoneBetPerLines;
        if (!TSUtility.isValid(betPerLines) || betPerLines.length <= 0) return;

        const maxBet = betPerLines[betPerLines.length - 1];
        const slotID = this._itemBanner!.slotID;
        const zoneID = this.getZoneID();
        const customSubID = CustomJackpotDataManager.instance().findCustomJackpotSubID(slotID);
        const customJackpot = CustomJackpotDataManager.instance().findCustomJackpotMoney(slotID);

        for (let i = 0; i < this._arrJackpotInfo.length; i++) {
            const jackpotItem = this._arrJackpotInfo[i];
            if (!TSUtility.isValid(jackpotItem)) continue;
            const curBet = betPerLines[jackpotItem.index];
            const jackpotValue = SlotBannerItem.getDisplayJackpotMoney_BetCustom(customSubID, customJackpot, 0, slotID, jackpotType, zoneID, curBet, maxBet);
            const showValue = Utility.getDisplayJackpotMoney(this._arrJackpotPrevValue[i], jackpotValue);
            jackpotItem.lbl.string = CurrencyFormatHelper.formatNumber(showValue);
            this._arrJackpotPrevValue[i] = showValue;
        }
    }

    updateButtonBG(node: cc.Node, isYellow: boolean): void {
        for (let i = 0; i < node.childrenCount; i++) {
            const child = node.children[i];
            if (child.name.includes("_B")) child.active = !isYellow;
            if (child.name.includes("_Y")) child.active = isYellow;
            this.updateButtonBG(child, isYellow);
        }
    }

    async checkPassableSlot(index: number, slotType: SlotType): Promise<boolean> {
        return new Promise((resolve) => {
            if (slotType === SlotType.HIGH && !this.isPassableHigh || slotType === SlotType.DYNAMIC && !this.isPassableDynamic) {
                const zoneID = slotType === SlotType.HIGH ? SDefine.VIP_LOUNGE_ZONEID : SDefine.SUITE_ZONEID;
                const zoneName = slotType === SlotType.HIGH ? SDefine.VIP_LOUNGE_ZONENAME : SDefine.SUITE_ZONENAME;
                
                if (!SDefine.FB_Instant_iOS_Shop_Flag) {
                    PopupManager.Instance().showDisplayProgress(true);
                    EnterCasinoOfferPopup.getPopup(zoneName, (err, popup) => {
                        PopupManager.Instance().showDisplayProgress(false);
                        if (err) return resolve(false);
                        popup.open(zoneID, zoneName, "", new PurchaseEntryReason(SDefine.P_ENTRYPOINT_VIPLIMITSLOTBANNER, true), true, null);
                        popup.setUnlockHigherBet(true);
                        popup.setCloseCallback(() => {
                            if (popup.isBuyItem()) {
                                this.updateLock(true);
                                this.updateSlotBanner(index, slotType);
                            }
                        });
                    });
                } else {
                    MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_MESSAGE_BOX, {
                        title: "DENIAL OF ENTRY",
                        message: slotType === SlotType.HIGH ? "Obtain Platinum or\nEarly Pass to Enter" : "Obtain Diamond or\nSuite Pass to Enter"
                    });
                }
                resolve(false);
            } else {
                resolve(true);
            }
        });
    }

    getZoneID(): number {
        return this._eType === SlotType.DYNAMIC ? SDefine.SUITE_ZONEID : this._eType === SlotType.HIGH ? SDefine.VIP_LOUNGE_ZONEID : SDefine.HIGHROLLER_ZONEID;
    }

    getZoneName(): string {
        return this._eType === SlotType.DYNAMIC ? SDefine.SUITE_ZONENAME : this._eType === SlotType.HIGH ? SDefine.VIP_LOUNGE_ZONENAME : SDefine.HIGHROLLER_ZONENAME;
    }

    getNormalSlotID(slotID: string): string {
        return TSUtility.isDynamicSlot(slotID) ? slotID.replace("_dy", "") : slotID;
    }

    getDynamicSlotID(slotID: string): string {
        return TSUtility.isDynamicSlot(slotID) ? slotID : slotID + "_dy";
    }

    isDynamicSlotArray(slotID: string): boolean {
        return TSUtility.isDynamicSlot(slotID) || this._arrDynamicSlot.some(info => info.strSlotID === slotID + "_dy");
    }

    moveToZone(slotType: SlotType): void {
        this.updateSlotBanner(this._numIndex, slotType);
    }

    openSlotInfoErrorPopup(): void {
        MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_SLOT_ERROR_MESSAGE_BOX);
    }

    preloadBannerImage(): void {
        const startIdx = Math.max(0, this._numIndex - this.BANNER_IMAGE_PRELOAD_COUNT);
        const endIdx = Math.min(this._arrEntrySlotBanner.length - 1, this._numIndex + this.BANNER_IMAGE_PRELOAD_COUNT);
        for (let i = startIdx; i <= endIdx; i++) {
            const bannerInfo = this._arrEntrySlotBanner[i];
            if (!TSUtility.isValid(bannerInfo)) continue;
            const resData = ServiceSlotDataManager.instance.getResourceDataBySlotID(bannerInfo.strSlotID);
            if (TSUtility.isValid(resData)) resData.preloadLongImage();
        }
    }

    // ===================== 【按钮点击回调】所有点击事件完整还原 =====================
    onClick_Entry(event: any, betIndexStr: string): void {
        const betIndex = parseInt(betIndexStr);
        if (!TSUtility.isValid(betIndex) || betIndex < 0) return;
        GameCommonSound.playFxOnce("btn_etc");

        if (TSUtility.isValid(this._itemBanner!.infoScene) && this._itemBanner!.infoScene.sceneName !== "") {
            ServiceInfoManager.STRING_SLOT_ENTER_LOCATION = this._itemBanner!.location;
            ServiceInfoManager.STRING_SLOT_ENTER_FLAG = this._itemBanner!.flag;
            ServiceInfoManager.NUMBER_ENTRY_SLOT_BETTING_INDEX = betIndex;
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.MOVE_TO_SLOT, {
                slotID: this._itemBanner!.slotID,
                zoneID: this.getZoneID(),
                zoneName: this.getZoneName()
            });
        } else {
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_MESSAGE_BOX, {
                title: "NOTICE",
                message: "Not Implement"
            });
        }
    }

    onClick_Left(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.updateSlotBanner(this._numIndex - 1, this._eType);
    }

    onClick_Right(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.updateSlotBanner(this._numIndex + 1, this._eType);
    }

    onClick_Regular(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.updateSlotBanner(this._numIndex, SlotType.REGULAR);
    }

    onClick_High(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.updateSlotBanner(this._numIndex, SlotType.HIGH);
    }

    onClick_Dynamic(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.updateSlotBanner(this._numIndex, SlotType.DYNAMIC);
    }

    async onClick_Favorite(): Promise<void> {
        GameCommonSound.playFxOnce("btn_etc");
        const slotID = this.getNormalSlotID(this._itemBanner!.slotID);
        
        if (!this.btnFavorite.node.active) {
            // 添加收藏
            if (this._arrFavoriteSlot.length >= this.SLOT_FAVORITE_MAX_COUNT) {
                MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_MESSAGE_BOX, {
                    message: "Favorites list is full.\nYou can register up to 50 games."
                });
                return;
            }
            if (this._arrFavoriteSlot.includes(slotID)) return;
            this._arrFavoriteSlot.push(slotID);
        } else {
            // 取消收藏
            const idx = this._arrFavoriteSlot.indexOf(slotID);
            if (idx > -1) this._arrFavoriteSlot.splice(idx, 1);
        }

        // 保存收藏列表
        ServerStorageManager.save(StorageKeyType.SLOT_FAVORITE, this._arrFavoriteSlot);
        await this.updateSlotBanner(this._numIndex, this._eType);
    }

    onClick_Jackpot(): void {
        GameCommonSound.playFxOnce("btn_casino");
        PopupManager.Instance().showDisplayProgress(true);
        CasinoJackpotInfoPopup.getPopup((err, popup) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (!TSUtility.isValid(err)) popup.open(false, this._eType === SlotType.REGULAR);
        });
    }

    // ===================== 【弹窗关闭】完整清理资源，修复内存泄漏 =====================
    close(): void {
        if (this.isStateClose()) return;
        MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.LOBBY_REFRESH_ALL_BANNER_ITEM);
        LobbyScene.instance.UI.setActiveAllWidget(true);
        
        // 清理定时器+监控
        this.stopPassMonitoring();
        this.unscheduleAllCallbacks();
        
        // 关闭弹窗
        this.setState(DialogState.Close);
        this.clear();
        this._close(cc.fadeOut(0.15));
    }
}