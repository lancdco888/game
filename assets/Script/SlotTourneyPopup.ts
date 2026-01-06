import LocalStorageManager from "./manager/LocalStorageManager";
import CommonServer from "./Network/CommonServer";
import FBInstantUtil from "./Network/FBInstantUtil";
import FireHoseSender, { FHLogType } from "./FireHoseSender";
import SDefine from "./global_utility/SDefine";
import ServiceInfoManager from "./ServiceInfoManager";
import GameCommonSound from "./GameCommonSound";
import UserInfo from "./User/UserInfo";
import FBTournamentManager, { FBTournamentInfo_Res } from "./Utility/FBTournamentManager";
import HeroTooltipPopup, { HT_MakingInfo } from "./Utility/HeroTooltipPopup";
import MessageRoutingManager from "./message/MessageRoutingManager";
import SlotTourneyManager from "./manager/SlotTourneyManager";
import TimeFormatHelper from "./global_utility/TimeFormatHelper";
import TSUtility from "./global_utility/TSUtility";
import DialogBase, { DialogState } from "./DialogBase";
import PopupManager from "./manager/PopupManager";
import SlotTourneyPrizeInfoPopup from "./SlotTourneyPrizeInfoPopup";
import SlotTourneyTierUI from "./SlotTourneyTierUI";
import LobbyScene from "./LobbyScene";
import ServiceSlotDataManager from "./manager/ServiceSlotDataManager";
import ServerStorageManager, { StorageKeyType } from "./manager/ServerStorageManager";
import { Utility } from "./global_utility/Utility";

const { ccclass, property } = cc._decorator;

/**
 * 老虎机锦标赛核心弹窗
 * SlotTourneyPopup
 * 继承通用弹窗基类 DialogBase
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class SlotTourneyPopup extends DialogBase {
    // ===================== Cocos 序列化属性 【与原JS @property 1:1完全对应，无遗漏/无新增】 =====================
    @property({ type: cc.Label, displayName: "赛事剩余时间文本" })
    public remainTimeLabel: cc.Label = null;

    @property({ type: cc.Sprite, displayName: "当前老虎机展示图" })
    public slotImg: cc.Sprite = null;

    @property({ type: cc.Sprite, displayName: "下一场老虎机展示图" })
    public nextSlotImg: cc.Sprite = null;

    @property({ type: cc.Label, displayName: "老虎机标题文本" })
    public slotTitleLabel: cc.Label = null;

    @property({ type: [SlotTourneyTierUI], displayName: "锦标赛段位UI数组" })
    public tierUis: Array<SlotTourneyTierUI> = [];

    @property({ type: SlotTourneyPrizeInfoPopup, displayName: "奖金详情弹窗" })
    public prizeInfoPop: SlotTourneyPrizeInfoPopup = null;

    @property({ type: cc.Button, displayName: "赛事说明按钮" })
    public infoBtn: cc.Button = null;

    @property({ type: cc.Node, displayName: "金币不足弹窗节点" })
    public insufficientPopup: cc.Node = null;

    @property({ type: cc.Node, displayName: "金币不足弹窗遮罩" })
    public insufficientblockingBG: cc.Node = null;

    @property({ type: cc.Button, displayName: "金币不足弹窗关闭按钮" })
    public insufficientCloseBtn: cc.Button = null;

    @property({ type: cc.Button, displayName: "金币不足弹窗确认按钮" })
    public insufficientOKBtn: cc.Button = null;

    @property({ type: cc.Label, displayName: "金币不足弹窗所需金额文本" })
    public insufficientRequireMoneyLabel: cc.Label = null;

    @property({ type: [cc.Node], displayName: "金币不足弹窗段位图标数组" })
    public insufficientTierIcons: Array<cc.Node> = [];

    // ===================== 私有成员变量 【与原JS实例变量完全对应，补充TS类型声明】 =====================
    private _gameId: string = "";
    private _curTourneyInfo: any = null;
    private _infoHeroTooltip: HeroTooltipPopup = null;

    // ===================== 静态核心方法【弹窗单例获取】原JS 1:1还原，项目弹窗调用的核心入口 =====================
    public static getPopup(callback: (err: any, popup: SlotTourneyPopup) => void): void {
        if (TSUtility.isValid(LobbyScene.instance)) {
            LobbyScene.instance.asyncRefreshTourneyInfo();
        }
        const resPath = "Service/01_Content/SlotTournament/Slot_Tourney/SlotTourneyPopup";
        if (callback) PopupManager.Instance().showDisplayProgress(true);

        cc.loader.loadRes(resPath, (err, prefab) => {
            if (callback) PopupManager.Instance().showDisplayProgress(false);
            if (err) {
                if (callback) {
                    DialogBase.exceptionLogOnResLoad(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                    callback(err, null);
                }
                return;
            }
            if (callback) {
                const ins = cc.instantiate(prefab);
                const popupCom = ins.getComponent(SlotTourneyPopup);
                ins.active = false;
                callback(null, popupCom);
            }
        });
    }

    // ===================== 生命周期方法 =====================
    public onLoad(): void {
        this.initDailogBase();
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        this.blockingBG.setContentSize(canvas.node.getContentSize());
        this.insufficientblockingBG.setContentSize(canvas.node.getContentSize());
    }

    public onDestroy(): void {
        super.onDestroy();
        MessageRoutingManager.instance().removeListenerTargetAll(this);
        this.unscheduleAllCallbacks();
    }

    // ===================== 弹窗基础控制方法 =====================
    public open(): SlotTourneyPopup {
        GameCommonSound.playFxOnce("pop_etc");
        this._open(null);
        this.init();
        return this;
    }

    public close(): void {
        if (this.isStateClose()) return;
        this.unscheduleAllCallbacks();
        this.setState(DialogState.Close);
        this.clear();
        this._close(DialogBase.getFadeOutAction(0.3));
    }

    public onBackBtnProcess(): boolean {
        if (this.insufficientPopup.active) {
            this.closeInsufficentPopup();
            return true;
        } else {
            this.onClickClose();
            return true;
        }
    }

    // ===================== 核心初始化方法 =====================
    public init(): void {
        const msgMgr = MessageRoutingManager.instance();
        // 注册全局赛事消息监听
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.TOURNEY_RESERVE_NEWGAME, this.reserveNewGame, this);
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.TOURNEY_START_NEWGAME, this.startNewGame, this);
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.TOURNEY_REFRESH_INFO, this.refreshProgressInfo, this);

        // 绑定金币不足弹窗按钮事件
        this.insufficientOKBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "SlotTourneyPopup", "onClickInsufficientClose", ""));
        this.insufficientCloseBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "SlotTourneyPopup", "onClickInsufficientClose", ""));
        this.infoBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "SlotTourneyPopup", "onClickInfoBtn", ""));

        // 初始化弹窗默认状态
        this.prizeInfoPop.close();
        this.closeInsufficentPopup();

        // 初始化所有段位UI + 绑定段位按钮事件
        for (let i = 0; i < this.tierUis.length; ++i) {
            this.tierUis[i].init();
            this.tierUis[i].joinBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "SlotTourneyPopup", "onClickJoinBtn", i));
            this.tierUis[i].infoBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "SlotTourneyPopup", "onClickPrizeInfoBtn", i));
            this.tierUis[i].closeInfoBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "SlotTourneyPopup", "onClickClosePrizeInfoBtn", i));
            this.tierUis[i].insufficientMoneyBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "SlotTourneyPopup", "onClickInsufficientMoney", i));
        }

        // 刷新整体UI数据
        this.refreshUI();

        // // FB赛事 - 首次打开弹窗显示赛事说明Tooltip
        // if (Utility.isFacebookInstant() && SDefine.FBInstant_Tournament_Use && !LocalStorageManager.getIsOpenTourneyInfoTooltip(UserInfo.default.instance().getUid())) {
        //     this.scheduleOnce(() => {
        //         LocalStorageManager.setIsOpenTourneyInfoTooltip(UserInfo.instance().getUid());
        //         this.asyncToggleInfoBtn(8);
        //     }, 1.5);
        // }
    }

    // ===================== 核心UI刷新方法 =====================
    public refreshUI(): void {
        this.unscheduleAllCallbacks();
        this._curTourneyInfo = SlotTourneyManager.Instance().getCurrentTourneyInfo();
        this._gameId = this._curTourneyInfo.curSlotID;
        this.slotTitleLabel.string = SDefine.getSlotName(this._gameId);

        const nextSlotId = this._curTourneyInfo.nextSlotID;
        // 每秒刷新剩余时间
        this.updateRemainTime();
        this.schedule(this.updateRemainTime, 1);

        // 刷新所有段位UI数据
        for (let i = 0; i < this.tierUis.length; ++i) {
            this.tierUis[i].refresh(i, this._curTourneyInfo);
        }

        // 异步加载老虎机图片
        this.updateImage(this.slotImg, this._gameId);
        this.updateImage(this.nextSlotImg, nextSlotId);
    }

    /** 异步加载老虎机图片 - 原JS Promise 等价转为 TS async/await */
    public async updateImage(spriteCom: cc.Sprite, slotId: string): Promise<void> {
        spriteCom.spriteFrame = null;
        const slotRes = ServiceSlotDataManager.instance.getResourceDataBySlotID(slotId);
        if (!ServiceSlotDataManager.instance.isContainsSlotID(slotId) || !TSUtility.isValid(slotRes)) {
            return;
        }
        await new Promise<void>((resolve) => {
            slotRes.loadSmallImage((spFrame) => {
                if (TSUtility.isValid(this) && TSUtility.isValid(spFrame)) {
                    spriteCom.spriteFrame = spFrame;
                }
                resolve();
            });
        });
    }

    // ===================== 全局消息回调方法 =====================
    public reserveNewGame(): void {
        cc.log("SlotTourneyPopup reserveNewGame");
        for (let i = 0; i < this.tierUis.length; ++i) {
            this.tierUis[i].setJoinable(false);
        }
    }

    public startNewGame(): void {
        cc.log("SlotTourneyPopup startNewGame");
        this.refreshUI();
    }

    public refreshProgressInfo(): void {
        cc.log("SlotTourneyPopup refreshProgressInfo");
        for (let i = 0; i < this.tierUis.length; ++i) {
            this.tierUis[i].refresh(i, this._curTourneyInfo);
        }
    }

    // ===================== 赛事倒计时更新 =====================
    public updateRemainTime(): void {
        let timeDiff = this._curTourneyInfo.getNextSlotStartTime() - TSUtility.getServerBaseNowUnixTime();
        timeDiff = Math.max(0, timeDiff);
        if (timeDiff === 0) this.reserveNewGame();
        this.remainTimeLabel.string = TimeFormatHelper.getTotMiniuteTimeString(timeDiff);
    }

    // ===================== 参赛报名核心逻辑 =====================
    public onClickJoinBtn(event: any, tierIdx: number): void {
        GameCommonSound.playFxOnce("btn_etc");
        let zoneId = SDefine.HIGHROLLER_ZONEID;
        let zoneName = SDefine.HIGHROLLER_ZONENAME;

        // 校验玩家进入赛事的区域权限
        if (ServerStorageManager.getAsNumber(StorageKeyType.TOURNEY_REGULAR_ENTER_TIME) < this._curTourneyInfo.getNextSlotStartTime()) {
            const isPassVip = UserInfo.instance().isPassAbleCasino(SDefine.VIP_LOUNGE_ZONEID, SDefine.VIP_LOUNGE_ZONENAME);
            zoneId = isPassVip ? SDefine.VIP_LOUNGE_ZONEID : SDefine.HIGHROLLER_ZONEID;
            zoneName = isPassVip ? SDefine.VIP_LOUNGE_ZONENAME : SDefine.HIGHROLLER_ZONENAME;
            ServerStorageManager.save(StorageKeyType.TOURNEY_REGULAR_ENTER_TIME, zoneId === SDefine.HIGHROLLER_ZONEID ? this._curTourneyInfo.getNextSlotStartTime() : 0);
        }
        this.asyncJoinProcess(zoneId, zoneName, tierIdx);
    }

    /** 异步参赛流程 - 原JS最核心的异步逻辑，等价转TS async/await */
    public async asyncJoinProcess(zoneId: string|number, zoneName: string, tierIdx: number): Promise<void> {
        try {
            // FB Instant 赛事专属处理
            if (Utility.isFacebookInstant() && SDefine.FBInstant_Tournament_Use) {
                await this.asyncFBInstantTournamentProcess();
            }
            // 发送跳转老虎机赛事消息
            ServiceInfoManager.STRING_SLOT_ENTER_LOCATION = "slotTourney_popup";
            ServiceInfoManager.STRING_SLOT_ENTER_FLAG = "";
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.MOVE_TO_SLOT, {
                slotID: this._gameId,
                zoneID: zoneId,
                zoneName: zoneName,
                gotoSlotTourney: true,
                TourneyTier: tierIdx,
                TourneyID: this._curTourneyInfo.tourneyID
            });
        } catch (err) {
            cc.error("exception ", err.toString());
            FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, err));
        }
    }

    /** FB Instant 锦标赛异步处理流程 - 完整还原原JS逻辑 */
    public async asyncFBInstantTournamentProcess(): Promise<void> {
        cc.log("asyncFBInstantTournamentProcess start");
        PopupManager.Instance().showDisplayProgress(true);
        // 校验是否已报名赛事
        const fbTourneyInfo = await FBInstantUtil.asyncGetTournamentInfo();
        if (fbTourneyInfo.isJoinTournament()) {
            cc.log("asyncFBInstantTournamentProcess already join");
            PopupManager.Instance().showDisplayProgress(false);
            return;
        }
        // 初始化FB赛事信息
        if (!FBTournamentManager.Instance().isInit()) {
            const res = await CommonServer.Instance().asyncRequestGetFBTournamentInfos();
            if (!CommonServer.isServerResponseError(res)) {
                const tourneyData = FBTournamentInfo_Res.parseObj(res);
                FBTournamentManager.Instance().init(tourneyData);
            }
        }
        // 切换赛事上下文
        const joinableTourney = FBTournamentManager.Instance().getJoinableTournament();
        if (!joinableTourney) {
            cc.log("asyncFBInstantTournamentProcess not found joinableTournament");
            PopupManager.Instance().showDisplayProgress(false);
            return;
        }
        cc.log("asyncFBInstantTournamentProcess try SwitchContext");
        await FBInstantUtil.asyncSwitchContext(joinableTourney.contextID);
        PopupManager.Instance().showDisplayProgress(false);
    }

    // ===================== 奖金详情弹窗控制 =====================
    public onClickPrizeInfoBtn(event: any, tierIdx: number): void {
        GameCommonSound.playFxOnce("btn_etc");
        for (let i = 0; i < this.tierUis.length; ++i) {
            this.tierUis[i].setInfoBtnState(i !== tierIdx);
        }
        this.closeInfoTooltip();
        this.prizeInfoPop.open(tierIdx, this._curTourneyInfo);
    }

    public onClickClosePrizeInfoBtn(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.closePrizePopup();
    }

    public closePrizePopup(): void {
        for (let i = 0; i < this.tierUis.length; ++i) {
            this.tierUis[i].setInfoBtnState(true);
        }
        this.prizeInfoPop.close();
    }

    // ===================== 金币不足弹窗控制 =====================
    public closeInsufficentPopup(): void {
        this.insufficientPopup.active = false;
    }

    public openInsufficentPopup(tierIdx: number): void {
        this.insufficientPopup.active = true;
        this.insufficientRequireMoneyLabel.string = SlotTourneyManager.Instance().getCheckMoneyStr(tierIdx);
        for (let i = 0; i < this.insufficientTierIcons.length; ++i) {
            this.insufficientTierIcons[i].active = i === tierIdx;
        }
    }

    public onClickInsufficientClose(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.closeInsufficentPopup();
    }

    public onClickInsufficientMoney(event: any, tierIdx: number): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.openInsufficentPopup(tierIdx);
    }

    // ===================== 赛事说明Tooltip弹窗控制 =====================
    public onClickInfoBtn(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.asyncToggleInfoBtn(10);
    }

    public async asyncToggleInfoBtn(delayCloseTime: number): Promise<void> {
        this.unschedule(this.closeInfoTooltip);
        // 已有tooltip弹窗则关闭
        if (this._infoHeroTooltip) {
            this._infoHeroTooltip.close();
            this._infoHeroTooltip = null;
            return;
        }
        // 关闭奖金弹窗，打开说明tooltip
        this.closePrizePopup();
        PopupManager.Instance().showDisplayProgress(true);
        this._infoHeroTooltip = await HeroTooltipPopup.asyncGetPopup();
        PopupManager.Instance().showDisplayProgress(false);

        if (!TSUtility.isValid(this) || !TSUtility.isValid(this._infoHeroTooltip)) return;
        
        // 初始化tooltip弹窗数据
        this._infoHeroTooltip.open(this.infoBtn.node);
        this._infoHeroTooltip.setPivotPosition(this.infoBtn.node, 0, -20);
        const tooltipText = HeroTooltipPopup.getTourneyInfoText();
        this._infoHeroTooltip.setInfoText(tooltipText);

        // tooltip样式配置
        const tooltipCfg = {
            frameInfo: { paddingWidth: 100, paddingHeight: 80, textOffsetX: 0, textOffsetY: 0, useArrow: true, arrowPosType: 3, arrowPosAnchor: 0, arrowPosOffset: 60, baseFontSize: 26, fontLineHeight: 32 },
            heroInfo: { anchorX: 0, anchorY: 0.5, offsetX: 0, offsetY: 0, heroId: "", heroRank: 0, iconType: "Small", heroState: 0 },
            settingInfo: { useBlockBG: false, reserveCloseTime: 0 },
            startAniInfo: [{ action: "scaleUp", duration: 0.2, easingType: "easeOut" }]
        };
        const makeInfo = HT_MakingInfo.parseObj(tooltipCfg);
        makeInfo.heroInfo.heroId = "";
        makeInfo.heroInfo.heroRank = 0;
        this._infoHeroTooltip.setHero_HT_MakingInfo(makeInfo);
        this._infoHeroTooltip.refreshUI();
        
        // 延时自动关闭
        this.scheduleOnce(this.closeInfoTooltip, delayCloseTime);
    }

    public closeInfoTooltip(): void {
        this.unschedule(this.closeInfoTooltip);
        if (this._infoHeroTooltip) {
            this._infoHeroTooltip.close();
            this._infoHeroTooltip = null;
        }
    }
}
