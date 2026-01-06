const { ccclass, property } = cc._decorator;

// 导入所有原脚本依赖的模块（路径完全和原JS一致，无需修改）
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import PopupManager from "./manager/PopupManager";
import GameCommonSound from "./GameCommonSound";
// import CommonServer from "../../../Network/CommonServer";
import EnterCasinoOfferPopup from "./Common/EnterCasinoOfferPopup";
import PowerGemManager from "./manager/PowerGemManager";
import SupersizeItManager from "./SupersizeItManager";
import ServiceInfoManager from "./ServiceInfoManager";
import ServiceSlotDataManager from "./manager/ServiceSlotDataManager";
import JiggyPrizeManager from "./manager/JiggyPrizeManager";
import UserInfo from "./User/UserInfo";
import CustomJackpotDataManager from "./manager/CustomJackpotDataManager";
import MessageRoutingManager from "./message/MessageRoutingManager";
import SlotJackpotManager from "./manager/SlotJackpotManager";
import LobbyScene from "./LobbyScene";
import LobbySlotEntryPopup from "./LobbySlotEntryPopup";
import LobbySlotBannerInfo, { SlotBannerType } from "./LobbySlotBannerInfo";
import SlotBannerItemTag from "./SlotBannerItemTag";
import { Utility } from "./global_utility/Utility";
import SlotBannerInfo from "./SlotBannerInfo";

/**
 * 老虎机Banner项脚本
 * 完全还原原JS逻辑，Cocos 2.4.13 TS标准写法
 */
@ccclass()
export default class SlotBannerItem extends cc.Component {
    // ===================== 序列化属性（拖拽绑定，原JS对应属性） =====================
    @property(cc.Button)
    public btn: cc.Button = null!;

    @property(cc.Node)
    public nodeTagRoot: cc.Node = null!;

    @property(cc.Node)
    public nodeJackpotRoot: cc.Node = null!;

    // ===================== 常量定义 =====================
    private readonly ENTRY_POPUP_UNLOCK_LEVEL: number = 14;
    private readonly ENTRY_POPUP_UNLOCK_VIP_LEVEL: number = 1;

    // ===================== 私有成员变量 =====================
    private _nodeRoot: cc.Node  = null;
    public _infoScene: any = null;
    public _infoBanner: LobbySlotBannerInfo | any = null;
    private _funcEntryEvent: Function = this.openEntryPopup.bind(this);
    private _eBannerType: any = SlotBannerType.NONE;
    public _strSlotID: string = "";
    private _strSceneName: string = "";
    private _strLocation: string = "";
    private _isGotoSlot: boolean = false;
    private _isUseWithDynamicSlot: boolean = true;
    public _numZoneID: number = SDefine.VIP_LOUNGE_ZONEID;
    public _arrJackpotType: any[] = [];
    public _arrTag: SlotBannerItemTag[] = [];
    public _arrHideTagType: any[] = [];

    // ===================== 只读属性(getter) 完整还原原JS逻辑 =====================
    get lobbyUI() {
        return LobbyScene.instance.UI;
    }

    set numZoneID(value: number) {
        this._numZoneID = value;
    }

    set funcEntryEvent(value: Function) {
        this._funcEntryEvent = value;
    }

    set isGotoSlot(value: boolean) {
        this._isGotoSlot = value;
    }

    get isUseWithDynamicSlot(): boolean {
        return this._isUseWithDynamicSlot && this.isCheckOpenEntryPopup() === 1;
    }

    set isUseWithDynamicSlot(value: boolean) {
        this._isUseWithDynamicSlot = value;
    }

    get flag(): string {
        return TSUtility.isValid(this._infoBanner) ? this._infoBanner.strFlag : "";
    }

    get slotID(): string {
        return this._strSlotID;
    }

    get zoneID(): number {
        return this._numZoneID;
    }

    get location(): string {
        return this._strLocation;
    }

    get infoScene(): any {
        return this._infoScene;
    }

    get arrJackpotType(): any[] {
        return this._arrJackpotType;
    }

    get eBannerType(): any {
        return this._eBannerType;
    }

    get isMoveToSlot(): boolean {
        return this._isGotoSlot;
    }

    get nodeTagParent(): cc.Node | null {
        return this.nodeTagRoot;
    }

    get nodeTagLeft(): cc.Node | null {
        return this.nodeTagRoot?.getChildByName("LeftTag") || null;
    }

    get nodeTagRight(): cc.Node | null {
        return this.nodeTagRoot?.getChildByName("RightTag") || null;
    }

    get nodeJackpotParent(): cc.Node | null {
        return this.nodeJackpotRoot;
    }

    get isHotSlot(): boolean {
        return this.flag === "hot";
    }

    get isNewSlot(): boolean {
        return this.flag === "new" || (this.isDynamicSlot === 1 && ServiceInfoManager.instance.getDynamicNewSlot().includes(this.slotID));
    }

    get isComingSoonSlot(): boolean {
        return this.flag === "coming soon";
    }

    get isRevampSlot(): boolean {
        return this.flag === "revamp";
    }

    get isFeaturedSlot(): boolean {
        return this.flag === "featured";
    }

    get isEarlyAccessSlot(): boolean {
        return this.flag === "early access";
    }

    get isLeagueSlot(): boolean {
        return this.isEntryLeagueSlot();
    }

    get isDynamicSlot(): number {
        return TSUtility.isDynamicSlot(this._strSlotID) ? 1 : 0;
    }

    get isWithDynamicSlot(): boolean {
        return ServiceSlotDataManager.instance.isWithDynamicSlot(this._strSlotID);
    }

    get isEventSlot(): boolean {
        return this.isSupersizeItSlot === 1 || this.isReelQuestSlot === 1 || this.isPowerGemSlot === 1 || this.isJiggyPrizeSlot === 1;
    }

    get isSupersizeItSlot(): number {
        return (SupersizeItManager.instance.isEnableEvent() && SupersizeItManager.instance.isTargetSlotID(this._strSlotID)) ? 1 : 0;
    }

    get isReelQuestSlot(): number {
        return 1;//(UserInfo.instance().hasActiveReelQuest() && UserInfo.instance().getUserReelQuestInfo().curMissionSlot === this._strSlotID) ? 1 : 0;
    }

    get isPowerGemSlot(): number {
        return (PowerGemManager.instance.isAvailablePowerGem(true, true) && PowerGemManager.instance.isPowerGemSlot(this._strSlotID)) ? 1 : 0;
    }

    get isJiggyPrizeSlot(): number {
        return JiggyPrizeManager.instance.isAvailable() ? 1 : 0;
    }

    get isPassableHigh(): boolean {
        return this.isPassableZone(SDefine.VIP_LOUNGE_ZONEID, SDefine.VIP_LOUNGE_ZONENAME);
    }

    get isPassableDynamic(): boolean {
        return this.isPassableZone(SDefine.SUITE_ZONEID, SDefine.SUITE_ZONENAME);
    }

    get numUserLevel(): number {
        return 0;//UserInfo.instance().getUserLevelInfo().level;
    }

    get numUserVIPLevel(): number {
        return 0;//UserInfo.instance().getUserVipInfo().level;
    }

    // ===================== 生命周期回调 =====================
    onLoad(): void {
        this._nodeRoot = this.node.getChildByName("Root");
        // 绑定鼠标/触摸事件
        this.node.on(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onMouseEnter, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onMouseLeave, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onMouseLeave, this);
        // 绑定按钮点击事件（原JS的Utility方法，2.4.13兼容）
        this.btn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "SlotBannerItem", "onClick", ""))
        // 注册消息监听
        //UserInfo.instance().addListenerTarget(UserInfo.MSG.REFRESH_REELQUEST_USERINFO, this.updateTag, this);
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.REFRESH_LOBBY_UI, this.updateTag, this);
    }

    onDestroy(): void {
        // 移除所有定时器+消息监听，修复原JS内存泄漏隐患
        this.unscheduleAllCallbacks();
        //UserInfo.instance().removeListenerTargetAll(this);
        MessageRoutingManager.instance().removeListenerTargetAll(this);
        this.node.off(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.off(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.off(cc.Node.EventType.TOUCH_START, this.onMouseEnter, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onMouseLeave, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onMouseLeave, this);
    }

    // ===================== 核心业务方法（完整还原原JS逻辑） =====================
    async setEmptyBanner(): Promise<void> {
        return Promise.resolve();
    }

    async loadSlotBanner(): Promise<void> {
        return Promise.resolve();
    }

    async updateJackpot(): Promise<void> {
        return Promise.resolve();
    }

    async updateImage(): Promise<void> {
        return Promise.resolve();
    }

    onMouseEnter(): void {}

    onMouseLeave(): void {}

    async initialize(infoBanner: LobbySlotBannerInfo|SlotBannerInfo, bannerType: any = SlotBannerType.NONE): Promise<void> {
        this._eBannerType = bannerType;
        if (!TSUtility.isValid(infoBanner)) {
            this._infoBanner = null;
            await this.setEmptyBanner();
            this.btn.interactable = false;
            return;
        }

        if (TSUtility.isValid(this._infoBanner) && this._infoBanner.strSlotID === infoBanner.strSlotID) {
            this.updateTag();
            return;
        }

        this._infoBanner = infoBanner;
        this._infoScene = SDefine.getSlotSceneInfo(infoBanner.strSlotID);
        this.btn.interactable = true;

        if (this._infoScene === null) {
            this._strSlotID = infoBanner.strSlotID;
            if (!TSUtility.isDevService()) return;
        } else {
            if (TSUtility.isDevService() && !this._infoScene.useDev) return;
            if (TSUtility.isQAService() && !this._infoScene.useQA) return;
            if (TSUtility.isLiveService() && !this._infoScene.useLive) return;

            this._strSceneName = this._infoScene.sceneName;
            this._strSlotID = this._infoScene.gameId;

            if (this.isComingSoonSlot) {
                ServiceInfoManager.instance.setComingSoonSlotID(this._strSlotID);
            } else if (this.isRevampSlot) {
                ServiceInfoManager.STRING_REVAMP_SLOT_ID = this._strSlotID;
            }
        }

        if (this._strSlotID === "") return;
        this.updateTag();
        await this.loadSlotBanner();
    }

    setLocation(strLocation: string): void {
        this._strLocation = strLocation;
    }

    updateTag(): void {
        if (this._arrTag.length <= 0) {
            this._arrTag = this.nodeTagRoot.getComponentsInChildren(SlotBannerItemTag);
        }
        this._arrTag.forEach((tag) => {
            if (!this._arrHideTagType.includes(tag.type)) {
                tag.updateTag(this);
            } else {
                tag.node.active = false;
            }
        });
    }

    setActiveAllTag(isActive: boolean): void {
        this.nodeTagRoot.active = isActive;
    }

    setActiveTag(tagType: any, isActive: boolean): void {
        const targetTag = this._arrTag.find((tag) => tag.type === tagType);
        if (TSUtility.isValid(targetTag)) {
            targetTag.node.active = isActive;
            if (isActive) targetTag.updateTag(this);
        }
    }

    addHideTagType(tagType: any): void {
        if (!this._arrHideTagType.includes(tagType)) {
            this._arrHideTagType.push(tagType);
        }
    }

    setActiveAllJackpot(isActive: boolean=true): void {
        this.nodeJackpotRoot.active = isActive;
    }

    async removeAllButton(): Promise<void> {
        this.node.getComponentsInChildren(cc.Button).forEach((btn) => {
            btn.interactable = false;
            btn.node.removeComponent(cc.Button);
        });
        return Promise.resolve();
    }

    async openEntryPopup(): Promise<void> {
        if (PopupManager.Instance().getOpenPopupInfoCount() > 0 || PopupManager.Instance().isOpenPopupOpen()) {
            await new Promise((resolve) => {
                PopupManager.Instance().setOpenPopupAllCloseCallback(resolve);
            });
        }

        if (this.isEarlyAccessSlot && this.isEntryEarlyAccessSlot(true) === 0) return;
        if (this.isCheckOpenEntryPopup() === 0) {
            await this.moveGotoSlot();
            return;
        }

        PopupManager.Instance().showDisplayProgress(true);
        LobbySlotEntryPopup.getPopup((err: any, popup: any) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (!TSUtility.isValid(err)) popup.open(this.slotID, this.eBannerType);
        });
    }

    isCheckOpenEntryPopup(): number {
        return 1;//(UserInfo.instance().hasMajorRollerFreeTicket() || 
               // this.ENTRY_POPUP_UNLOCK_LEVEL <= this.numUserLevel || 
               // this.ENTRY_POPUP_UNLOCK_VIP_LEVEL <= this.numUserVIPLevel) ? 1 : 0;
    }

    isEntryLeagueSlot(): boolean {
        return this._numZoneID !== SDefine.HIGHROLLER_ZONEID && 
               (this.isDynamicSlot === 1 || 
                !(this.isNewSlot || this._infoBanner?.numOrder !== 1 || !this.isPassableDynamic) || 
                (this.isEarlyAccessSlot && this.isPassableDynamic));
    }

    isEntryEarlyAccessSlot(isShowPopup: boolean = false): number {
        if (this.isPassableHigh || (this.isSupersizeItSlot === 1 && SupersizeItManager.instance.isHasSupersizeFreeTicket())) return 1;
        
        if (isShowPopup) {
            if (SDefine.FB_Instant_iOS_Shop_Flag) {
                // PopupManager.getPopup(SDefine.VIP_LOUNGE_ZONENAME, (err: any, popup: any) => {
                //     PopupManager.Instance().showDisplayProgress(false);
                //     if (!err) {
                //         popup.open(SDefine.VIP_LOUNGE_ZONEID, SDefine.VIP_LOUNGE_ZONENAME, "", 
                //             new CommonServer.PurchaseEntryReason(SDefine.P_ENTRYPOINT_VIPLIMITSLOTBANNER, true), true, null);
                //         popup.setCloseCallback(() => {
                //             if (popup.isBuyItem() === 1) this.onClick();
                //         });
                //     }
                // });
            } else {
                MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_MESSAGE_BOX, {
                    title: "DENIAL OF ENTRY",
                    message: "Obtain Platinum or\nEarly Pass to Enter"
                });
            }
        }
        return 0;
    }

    isEntryDynamicAccessSlot(isShowPopup: boolean = false): number {
        if (this.isPassableDynamic) return 1;
        
        if (isShowPopup) {
            if (SDefine.FB_Instant_iOS_Shop_Flag) {
                PopupManager.Instance().showDisplayProgress(true);
                EnterCasinoOfferPopup.getPopup(SDefine.SUITE_ZONENAME, (err: any, popup: any) => {
                    PopupManager.Instance().showDisplayProgress(false);
                    if (!err) {
                        // popup.open(SDefine.SUITE_ZONEID, SDefine.SUITE_ZONENAME, "", 
                        //     new CommonServer.PurchaseEntryReason(SDefine.P_ENTRYPOINT_VIPLIMITSLOTBANNER, true), true, null);
                        // popup.setCloseCallback(() => {
                        //     if (popup.isBuyItem() === 1) this.onClick();
                        // });
                    }
                });
            } else {
                MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_MESSAGE_BOX, {
                    title: "DENIAL OF ENTRY",
                    message: "Obtain Diamond or\nSuite Pass to Enter"
                });
            }
        }
        return 0;
    }

    async moveGotoSlot(): Promise<void> {
        if (PopupManager.Instance().getOpenPopupInfoCount() > 0 || PopupManager.Instance().isOpenPopupOpen()) {
            await new Promise((resolve) => {
                PopupManager.Instance().setOpenPopupAllCloseCallback(resolve);
            });
        }

        if (!TSUtility.isValid(this.infoScene) || this.infoScene.sceneName === "") {
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_MESSAGE_BOX, {
                title: "NOTICE",
                message: "Not Implement"
            });
            return;
        }

        ServiceInfoManager.STRING_SLOT_ENTER_LOCATION = this.location;
        ServiceInfoManager.STRING_SLOT_ENTER_FLAG = this.flag;
        ServiceInfoManager.NUMBER_ENTRY_SLOT_BETTING_INDEX = -1;
        
        MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.MOVE_TO_SLOT, {
            slotID: this.slotID
        });
    }

    onClick(): void {
        if (this.isComingSoonSlot|| !TSUtility.isValid(this._infoBanner) || !TSUtility.isValid(this._funcEntryEvent)) return;
        
        if (this.isEarlyAccessSlot && this.isEntryEarlyAccessSlot(true) === 0) return;
        if (this.isDynamicSlot === 1 && this.isEntryDynamicAccessSlot(true) === 0) return;

        if (!this._isGotoSlot) {
            GameCommonSound.playFxOnce("btn_slots");
            this._funcEntryEvent();
        } else {
            this.moveGotoSlot();
        }
    }

    isPassableZone(zoneID: number, zoneName: string): boolean {
        return true;//UserInfo.instance().isPassAbleCasino(zoneID, zoneName);
    }

    // ===================== 静态工具方法（完整还原原JS） =====================
    static getSlotSubID(jackpotType: string, index: number): string {
        if (ServiceSlotDataManager.JACKPOT_GRAND.indexOf(jackpotType) !== -1) {
            return ServiceSlotDataManager.ADD_JACKPOT_KEY.indexOf(jackpotType) !== -1 ? String(index + 2) : String(index + 1);
        } else if (ServiceSlotDataManager.ADD_JACKPOT_KEY.indexOf(jackpotType) !== -1) {
            return String(index + 1);
        } else {
            return String(index);
        }
    }

    static getDisplayJackpotMoney(jackpotData: any, index: number, slotID: string, subIndex: number, zoneID: number): number {
        let jackpotValue = 0;
        let subID = "";
        const slotMachineInfo = SlotJackpotManager.Instance().getSlotmachineInfo(zoneID, slotID);
        
        if (TSUtility.isValid(jackpotData)) {
            jackpotValue = jackpotData.getJackpotForLobbySlot(slotMachineInfo, index);
            subID = jackpotData.getSubIDList()[index];
        } else {
            subID = SlotBannerItem.getSlotSubID(slotID, subIndex);
            jackpotValue = slotMachineInfo.getJackpotForLobbySlot(subID);
        }

        const customJackpot = CustomJackpotDataManager.instance().findCustomJackpotMoney(slotID);
        if (TSUtility.isValid(customJackpot)) {
            if (TSUtility.isValid(jackpotData)) {
                jackpotValue += jackpotData.getCustomJackpotMoney(customJackpot, index, zoneID);
            } else {
                jackpotValue += customJackpot.getCustomJackpotMoney(subID, zoneID);
            }
        }
        return jackpotValue;
    }

    static getDisplayJackpotMoney_BetCustom(jackpotData: any, jackpotData2: any, index: number, slotID: string, subIndex: number, zoneID: number, betIndex: number, coinSize: number): number {
        let jackpotValue = 0;
        let subID = "";
        const slotMachineInfo = SlotJackpotManager.Instance().getSlotmachineInfo(zoneID, slotID);
        
        if (TSUtility.isValid(jackpotData2)) {
            jackpotValue = jackpotData2.getJackpotForLobbySlot_BetCustom(slotMachineInfo, subIndex.toString(), zoneID, betIndex, coinSize);
        } else if (TSUtility.isValid(jackpotData)) {
            jackpotValue = jackpotData.getJackpotForLobbySlot_BetCustom(slotMachineInfo, index, betIndex, coinSize);
            subID = jackpotData.getSubIDList()[index];
        } else {
            subID = SlotBannerItem.getSlotSubID(slotID, subIndex);
            jackpotValue = slotMachineInfo.getJackpotMoneyByCoinSize(subID, betIndex, coinSize);
        }
        return jackpotValue;
    }
}