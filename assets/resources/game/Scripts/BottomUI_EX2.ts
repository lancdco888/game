
import GameCommonSound from "../../../Script/GameCommonSound";
import SlotReelSpinStateManager from "../../../Script/Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../../Script/Slot/SlotSoundController";
import SlotUIRuleManager from "../../../Script/Slot/rule/SlotUIRuleManager";
import CustomButton from "../../../Script/global_utility/CustomButton";
import SDefine from "../../../Script/global_utility/SDefine";
import TSUtility from "../../../Script/global_utility/TSUtility";
import LocalStorageManager from "../../../Script/manager/LocalStorageManager";
import SlotGameRuleManager from "../../../Script/manager/SlotGameRuleManager";
import SlotManager from "../../../Script/manager/SlotManager";
import SoundManager from "../../../Script/manager/SoundManager";
import BottomUI from "./BottomUI";
const { ccclass, property } = cc._decorator;

/**
 * 老虎机底部UI扩展类（EX2）
 * 处理旋转、自动旋转、下注调整等核心交互逻辑
 */
@ccclass()
export default class BottomUI_EX2 extends BottomUI {
    // ========== 组件绑定 ==========
    @property(cc.Button)
    btnSpin: cc.Button = null;              // 普通旋转按钮
    @property(cc.Button)
    btnSpinInAutospin: cc.Button = null;    // 自动旋转状态下的旋转按钮
    @property(cc.Button)
    btnSpinInFreespin: cc.Button = null;    // 免费旋转状态下的旋转按钮
    @property(cc.Button)
    btnStopInAutospin: cc.Button = null;    // 自动旋转状态下的停止按钮
    @property(cc.Button)
    btnPlusBetPerLine: cc.Button = null;    // 单线下注增加按钮
    @property(cc.Button)
    btnMinusBetPerLine: cc.Button = null;   // 单线下注减少按钮
    @property(cc.Button)
    btnBetSelect: cc.Button = null;         // 下注选择按钮
    @property(cc.Button)
    btnBuyCoins: cc.Button = null;          // 购买金币按钮
    @property(cc.Button)
    btnMaxBet:cc.Button = null;            // 最大下注按钮
    @property(cc.Button)
    btnStop: cc.Button = null;              // 普通停止按钮
    @property(cc.Button)
    btnStopAutospin: cc.Button = null;      // 停止自动旋转按钮
    @property(cc.Button)
    btnAutoSpinSelect: cc.Button = null;    // 自动旋转选择按钮
    @property(cc.Label)
    autoSpinCntLabel: cc.Label = null;      // 自动旋转次数标签
    @property([cc.Button])
    fastModeBtns: cc.Button[] = [];         // 快速模式按钮组
    @property(cc.Node)
    fastModeTooltipRoot: cc.Node = null;    // 快速模式提示根节点
    @property(cc.Button)
    paytableBtn: cc.Button = null;          // 支付表按钮
    @property(cc.Animation)
    holdEffectOfSpinBtn: cc.Animation = null; // 旋转按钮按住特效
    @property(cc.Node)
    nodeTotalBetUI: cc.Node = null;         // 总下注UI节点
    @property(cc.Node)
    nodeNewSlotTooltip: cc.Node = null;     // 新老虎机提示节点
    @property(cc.Node)
    nodeFeverIconPos: cc.Node = null;       // 狂热模式图标位置节点
    @property(cc.Node)
    powerGemSlotBottomIconPos: cc.Node = null; // 能量宝石图标位置节点
    @property(cc.Node)
    hyperBountySlotBottomIconPos: cc.Node = null; // 超级奖励图标位置节点

    // ========== 业务状态 ==========
    betClips: any[] = [];                // 下注音效剪辑数组

    changeAutospinModeAction: any = null;// 自动旋转模式切换动作
    interactableFlagChangeBetPerLineBtn: boolean = true; // 下注调整按钮交互标记
    interactableFlagChangeMaxbetBtn: boolean = true;    // 最大下注按钮交互标记
    flagLockChangeTotalBet: boolean = false;            // 锁定总下注修改标记
    flagLockChangeToTalBetBigger: boolean = false;      // 锁定总下注增大标记
    betPerLineOnSetFlagLock: number = 0;                // 锁定时的单线下注值
    stringLockChangeTotalBet: string = "";              // 锁定下注提示文本
    widthLockTotalBetTooltip: number = 800;             // 锁定提示宽度
    heightLockTotalBetTooltip: number = 200;            // 锁定提示高度
    addXLockTotalBetTooltip: number = 10;               // 锁定提示X偏移
    addYLockTotalBetTooltip: number = 30;               // 锁定提示Y偏移
    show_tutorial_arrow: boolean = false;               // 教程箭头显示标记
    processIsDisableChangeBetBtn: () => boolean = null; // 禁用下注按钮的自定义逻辑
    fastMode: number = 0;                               // 快速模式（0/1/2...）
    blockAutoSpinFlag: boolean = false;                 // 阻止自动旋转标记
    startAutospinTimerBind: () => void = null;          // 自动旋转计时器绑定函数

    // ========== 生命周期 & 初始化 ==========
    onLoad() {
        super.onLoad && super.onLoad();
        // 绑定函数上下文（避免TS中this指向丢失）
        this.startAutospinTimerBind = this.startAutospinTimer.bind(this);
    }

    /**
     * 扩展初始化底部UI
     * @param params 初始化参数
     */
    initBottomUI_EX(params: any): void {
        super.initBottomUI_EX && super.initBottomUI_EX(params);

        const slotManager = SlotManager.Instance;
        const slotSoundCtrl = SlotSoundController.Instance();
        
        // 加载下注音效
        for (let i = 0; i < 9; ++i) {
            this.betClips.push(slotSoundCtrl.getAudioClip(`Betting_${i.toString()}`));
        }

        // ========== 按钮事件绑定 ==========
        // 旋转按钮
        if (this.btnSpin) {
            this.btnSpin.node.on(cc.Node.EventType.TOUCH_START, this.startAutospinTimerBind);
            this.btnSpin.node.on(cc.Node.EventType.TOUCH_END, this.endAutospinTimer.bind(this));
            this.btnSpin.node.on(cc.Node.EventType.TOUCH_CANCEL, this.endAutospinTimer.bind(this));
            
            // 添加点击事件（替换原Utility.getComponent_EventHandler，适配Cocos 2.4 TS）
            this.btnSpin.clickEvents.push(this.createEventHandler(slotManager.node, "SlotManager", "spinAll"));
            this.btnSpin.clickEvents.push(this.createEventHandler(slotSoundCtrl.node, "SlotSoundController", "playAudioEventHandler", JSON.stringify(["ClickSpinBtn", "FX"])));
            this.btnSpin.clickEvents.push(this.createEventHandler(this.node, "BottomUI_EX2", "hideLockChangeTotalBetPopup"));
            this.btnSpin.clickEvents.push(this.createEventHandler(this.node, "BottomUI_EX2", "setPlaySlotID"));
        }

        // 停止自动旋转按钮
        if (this.btnStopAutospin) {
            this.btnStopAutospin.clickEvents.push(this.createEventHandler(this.node, "BottomUI_EX2", "onClickStopAutoSpin"));
            this.btnStopAutospin.clickEvents.push(this.createEventHandler(slotSoundCtrl.node, "SlotSoundController", "playAudioEventHandler", JSON.stringify(["ClickOtherButton", "FX"])));
        }

        // 自动旋转状态下的停止按钮
        if (this.btnStopInAutospin) {
            this.btnStopInAutospin.clickEvents.push(this.createEventHandler(this.node, "BottomUI_EX2", "onClickStop"));
            this.btnStopInAutospin.clickEvents.push(this.createEventHandler(slotSoundCtrl.node, "SlotSoundController", "playAudioEventHandler", JSON.stringify(["ClickOtherButton", "FX"])));
        }

        // 普通停止按钮
        if (this.btnStop) {
            this.btnStop.clickEvents.push(this.createEventHandler(this.node, "BottomUI_EX2", "onClickStop"));
            this.btnStop.clickEvents.push(this.createEventHandler(slotSoundCtrl.node, "SlotSoundController", "playAudioEventHandler", JSON.stringify(["ClickOtherButton", "FX"])));
        }

        // 单线下注减少按钮
        if (this.btnMinusBetPerLine) {
            this.btnMinusBetPerLine.clickEvents.push(this.createEventHandler(this.node, "BottomUI_EX2", "onClickDecreaseTotalBet"));
            if (this.betClips.length === 0) {
                this.btnMinusBetPerLine.clickEvents.push(this.createEventHandler(slotSoundCtrl.node, "SlotSoundController", "playAudioEventHandler", JSON.stringify(["ClickOtherButton", "FX"])));
            }
        }

        // 下注选择按钮
        if (this.btnBetSelect) {
            this.btnBetSelect.clickEvents.push(this.createEventHandler(this.node, "BottomUI_EX2", "onClickBetSelect"));
            this.btnBetSelect.clickEvents.push(this.createEventHandler(slotSoundCtrl.node, "SlotSoundController", "playAudioEventHandler", JSON.stringify(["ClickOtherButton", "FX"])));
        }

        // 单线下注增加按钮
        if (this.btnPlusBetPerLine) {
            this.btnPlusBetPerLine.clickEvents.push(this.createEventHandler(this.node, "BottomUI_EX2", "onClickIncreaseTotalBet"));
            if (this.betClips.length === 0) {
                this.btnPlusBetPerLine.clickEvents.push(this.createEventHandler(slotSoundCtrl.node, "SlotSoundController", "playAudioEventHandler", JSON.stringify(["ClickOtherButton", "FX"])));
            }
        }

        // 最大下注按钮
        if (this.btnMaxBet) {
            this.btnMaxBet.clickEvents.push(this.createEventHandler(this.node, "BottomUI_EX2", "onClickMaxBet"));
            this.btnMaxBet.clickEvents.push(this.createEventHandler(slotSoundCtrl.node, "SlotSoundController", "playAudioEventHandler", JSON.stringify(["ClickSpinBtn", "FX"])));
        }

        // 购买金币按钮
        if (this.btnBuyCoins) {
            this.btnBuyCoins.clickEvents.push(this.createEventHandler(this.node, "BottomUI_EX2", "onClickBuyCoinBtn"));
            this.btnBuyCoins.clickEvents.push(this.createEventHandler(slotSoundCtrl.node, "SlotSoundController", "playAudioEventHandler", JSON.stringify(["ClickOtherButton", "FX"])));
        }

        // 旋转按钮按住特效初始化
        if (this.holdEffectOfSpinBtn) {
            this.holdEffectOfSpinBtn.stop();
            this.holdEffectOfSpinBtn.node.active = false;
        }

        // 支付表按钮
        if (this.paytableBtn) {
            this.paytableBtn.clickEvents.push(this.createEventHandler(this.node, "BottomUI_EX2", "onClickPaytableBtn"));
        }

        // 快速模式按钮组
        for (let i = 0; i < this.fastModeBtns.length; ++i) {
            this.fastModeBtns[i].clickEvents.push(this.createEventHandler(this.node, "BottomUI_EX2", "onClickFastModeBtn", i.toString()));
        }

        // 自动旋转选择按钮
        if (this.btnAutoSpinSelect) {
            this.btnAutoSpinSelect.clickEvents.push(this.createEventHandler(this.node, "BottomUI_EX2", "onClickAutoSpinSelect"));
            this.btnAutoSpinSelect.clickEvents.push(this.createEventHandler(slotSoundCtrl.node, "SlotSoundController", "playAudioEventHandler", JSON.stringify(["ClickOtherButton", "FX"])));
        }

        // ========== 快速模式初始化 ==========
        const userOption = LocalStorageManager.getLocalUserOptionInfo(slotManager.getUserId());
        this.fastMode = userOption.lastFastMode;
        SlotUIRuleManager.Instance.setFastMode(this.fastMode);
        SlotUIRuleManager.Instance.applyFastMode();
        this.setActiveFastModeBtn(this.fastMode);

        // ========== 事件监听 ==========
        this.node.on("changeReelSpinState", this.setButtonActiveState.bind(this));
        SlotReelSpinStateManager.Instance.addObserver(this.node);
        this.node.on("changeMoneyState", this.setButtonActiveState.bind(this));
        SlotGameRuleManager.Instance.addObserver(this.node);
        
        // 调用SlotManager的接口初始化
        slotManager.bottomUIInterface.onInitBottomUI_EX2(this);
        
        // 初始化按钮状态
        this.setButtonActiveState();
    }

    /**
     * 创建Cocos EventHandler（替代原Utility工具类）
     * @param target 目标节点
     * @param component 组件名
     * @param handler 方法名
     * @param customEventData 自定义数据
     * @returns EventHandler
     */
    private createEventHandler(target: cc.Node, component: string, handler: string, customEventData: string = ""): cc.Component.EventHandler {
        const eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        eventHandler.customEventData = customEventData;
        return eventHandler;
    }

    // ========== 核心逻辑 ==========
    /**
     * 设置按钮交互状态（核心方法）
     */
    setButtonActiveState(): void {
        const reelSpinMgr = SlotReelSpinStateManager.Instance;
        const currentState = reelSpinMgr.getCurrentState();
        let spinBtn: cc.Button = null;
        let stopBtn: cc.Button = null;

        // 免费旋转模式
        if (reelSpinMgr.getFreespinMode()) {
            spinBtn = this.btnSpin;
            stopBtn = this.btnStop;
        }

        // 自动旋转模式
        if (reelSpinMgr.getAutospinMode()) {
            spinBtn = this.btnSpinInAutospin;
            stopBtn = this.btnStopInAutospin;
            
            this.btnSpin && (this.btnSpin.node.active = false);
            this.btnStop && (this.btnStop.node.active = false);
            this.btnStopAutospin.node.active = true;
            this.setInteractableButton(this.btnMaxBet.node, false);
        } else {
            // 普通模式
            spinBtn = this.btnSpin;
            stopBtn = this.btnStop;
            
            this.btnSpinInAutospin && (this.btnSpinInAutospin.node.active = false);
            this.btnStopInAutospin && (this.btnStopInAutospin.node.active = false);
            this.btnStopAutospin.node.active = false;
            this.setInteractableButton(this.btnMaxBet.node, true);
        }

        // 下注按钮交互控制
        if (reelSpinMgr.getFreespinMode()) {
            this.setChangeBetPerLineBtnInteractable(false);
            this.setChangeMaxBetBtnInteractable(false);
        } else if (reelSpinMgr.getAutospinMode()) {
            this.setChangeBetPerLineBtnInteractable(false);
        } else {
            this.setChangeBetPerLineBtnInteractable(true);
        }

        // 根据滚轮旋转状态控制按钮
        switch (currentState) {
            case SlotReelSpinStateManager.STATE_STOP:
                spinBtn && (spinBtn.node.active = true);
                spinBtn && this.setInteractableSpinBtn(spinBtn, true);
                stopBtn && (stopBtn.node.active = false);
                this.setChangeMaxBetBtnInteractable(true);
                break;
            case SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE:
                spinBtn && (spinBtn.node.active = true);
                spinBtn && this.setInteractableSpinBtn(spinBtn, false);
                stopBtn && (stopBtn.node.active = false);
                this.setChangeBetPerLineBtnInteractable(false);
                this.setChangeMaxBetBtnInteractable(false);
                break;
            case SlotReelSpinStateManager.STATE_SPINNING_SKIPABLE:
                spinBtn && (spinBtn.node.active = false);
                spinBtn && this.setInteractableSpinBtn(spinBtn, false);
                stopBtn && (stopBtn.node.active = true);
                stopBtn && this.setInteractableButton(stopBtn.node, true);
                this.setChangeBetPerLineBtnInteractable(false);
                this.setChangeMaxBetBtnInteractable(false);
                break;
            case SlotReelSpinStateManager.STATE_CUSTOM_ACTIVE_SPINBUTTON:
                spinBtn && (spinBtn.node.active = true);
                spinBtn && this.setInteractableSpinBtn(spinBtn, true);
                stopBtn && (stopBtn.node.active = false);
                stopBtn && this.setInteractableButton(stopBtn.node, false);
                this.setChangeBetPerLineBtnInteractable(false);
                this.setChangeMaxBetBtnInteractable(false);
                break;
        }

        // 免费旋转模式额外控制
        if (reelSpinMgr.getFreespinMode()) {
            spinBtn && this.setInteractableSpinBtn(spinBtn, false);
            stopBtn && this.setInteractableButton(stopBtn.node, false);
        }

        // 旋转模式为0时禁用旋转按钮
        if (!reelSpinMgr.getSpinMode()) {
            spinBtn && this.setInteractableSpinBtn(spinBtn, false);
        }

        // 自定义禁用下注按钮逻辑
        if (this.processIsDisableChangeBetBtn && this.processIsDisableChangeBetBtn()) {
            this.setChangeBetPerLineBtnInteractable(false);
            this.setChangeMaxBetBtnInteractable(false);
        }

        // 扩展接口调用
        SlotManager.Instance.bottomUIInterface.onSetButtonActiveState_EX2(this);
    }

    /**
     * 启动自动旋转计时器（长按旋转按钮触发）
     */
    startAutospinTimer(): void {
        if (this.changeAutospinModeAction) return;
        if (this.blockAutoSpinFlag) return;

        this.changeAutospinModeAction = cc.sequence(
            cc.delayTime(1),
            cc.callFunc(() => {
                const reelSpinMgr = SlotReelSpinStateManager.Instance;
                reelSpinMgr.changeAutospinMode(!reelSpinMgr.getAutospinMode());
                this.bottomUIInterface.onChangeToAutospin(this);
                this.endAutospinTimer();
            })
        );

        this.node.runAction(this.changeAutospinModeAction);
        this.playHoldEffectOfSpinBtn();
    }

    /**
     * 结束自动旋转计时器
     */
    endAutospinTimer(): void {
        if (!this.changeAutospinModeAction) return;
        
        this.node.stopAction(this.changeAutospinModeAction);
        this.changeAutospinModeAction = null;
        this.stopHoldEffectOfSpinBtn();
    }

    /**
     * 设置单线下注按钮交互状态
     * @param isInteractable 是否可交互
     */
    setChangeBetPerLineBtnInteractable(isInteractable: boolean): void {
        // 全局禁用标记
        if (!this.interactableFlagChangeBetPerLineBtn ) {
            this.btnMinusBetPerLine && this.setInteractableButton(this.btnMinusBetPerLine.node, false);
            this.btnPlusBetPerLine && this.setInteractableButton(this.btnPlusBetPerLine.node, false);
            this.btnBetSelect && this.setInteractableButton(this.btnBetSelect.node, false);
            this.btnAutoSpinSelect && this.setInteractableButton(this.btnAutoSpinSelect.node, false);
            return;
        }

        // 传入的禁用标记
        if (!isInteractable) {
            this.btnMinusBetPerLine && this.setInteractableButton(this.btnMinusBetPerLine.node, false);
            this.btnPlusBetPerLine && this.setInteractableButton(this.btnPlusBetPerLine.node, false);
            this.btnBetSelect && this.setInteractableButton(this.btnBetSelect.node, false);
            this.btnAutoSpinSelect && this.setInteractableButton(this.btnAutoSpinSelect.node, false);
            return;
        }

        // 正常交互逻辑
        if (!SlotGameRuleManager.Instance) {
            this.btnMinusBetPerLine && this.setInteractableButton(this.btnMinusBetPerLine.node, true);
            this.btnPlusBetPerLine && this.setInteractableButton(this.btnPlusBetPerLine.node, true);
            this.btnBetSelect && this.setInteractableButton(this.btnBetSelect.node, true);
            this.btnAutoSpinSelect && this.setInteractableButton(this.btnAutoSpinSelect.node, true);
            return;
        }

        // 单线下注最小值判断
        const isMinBet = SlotGameRuleManager.Instance.isCurrentBetPerLineMinValue();
        const zoneId = SlotManager.Instance.getZoneId();
        this.btnMinusBetPerLine && this.setInteractableButton(this.btnMinusBetPerLine.node, isMinBet ? zoneId > 0 : false);

        // 单线下注最大值/引导限制判断
        const ruleMgr = SlotGameRuleManager.Instance;
        if (ruleMgr._flagLockIncreaseBetMoneyUpperGuideBetPerLine && 
            ruleMgr._guideBetPerLine <= ruleMgr.getCurrentBetPerLine()) {
            this.btnPlusBetPerLine && this.setInteractableButton(this.btnPlusBetPerLine.node, false);
        } else if (ruleMgr.isCurrentBetPerLineMaxValue()) {
            const isVIPZone = SlotManager.Instance.getZoneId() >= SDefine.VIP_LOUNGE_ZONEID;
            const isTourney = SlotManager.Instance.isJoinTourney();
            this.btnPlusBetPerLine && this.setInteractableButton(this.btnPlusBetPerLine.node, !(isVIPZone || isTourney));
        } else {
            this.btnPlusBetPerLine && this.setInteractableButton(this.btnPlusBetPerLine.node, true);
        }

        this.btnBetSelect && this.setInteractableButton(this.btnBetSelect.node, true);
        this.btnAutoSpinSelect && this.setInteractableButton(this.btnAutoSpinSelect.node, true);
    }

    /**
     * 设置最大下注按钮交互状态
     * @param isInteractable 是否可交互
     */
    setChangeMaxBetBtnInteractable(isInteractable: boolean): void {
        if (!this.interactableFlagChangeMaxbetBtn) {
            this.btnMaxBet && this.setInteractableButton(this.btnMaxBet.node, false);
            return;
        }

        if (!isInteractable) {
            this.btnMaxBet && this.setInteractableButton(this.btnMaxBet.node, false);
            return;
        }

        const reelSpinMgr = SlotReelSpinStateManager.Instance;
        const isDisable = reelSpinMgr.getFreespinMode() || reelSpinMgr.getAutospinMode() || reelSpinMgr.getJackpotMode();
        this.btnMaxBet && this.setInteractableButton(this.btnMaxBet.node, !isDisable);

        // 扩展接口调用
        SlotManager.Instance.bottomUIInterface.onSetChangeMaxBetBtnInteractable_EX2(this);
    }

    // ========== 按钮点击事件 ==========
    /**
     * 旋转按钮点击
     */
    onClickSpinBtn(): void {
        SlotManager.Instance.spinAll();
    }

    /**
     * 购买金币按钮点击（空实现，需业务补充）
     */
    onClickBuyCoinBtn(): void {}

    /**
     * 快速模式按钮点击
     * @param event 事件
     * @param customData 自定义数据（模式索引）
     */
    onClickFastModeBtn(event: Event, customData: string): void {
        const modeIdx = parseInt(customData);
        this.fastMode = (modeIdx + 1) % this.fastModeBtns.length;
        
        // 更新快速模式
        SlotUIRuleManager.Instance.setFastMode(this.fastMode);
        this.setActiveFastModeBtn(this.fastMode);
        GameCommonSound.playFxOnce("btn_etc");

        // 保存到本地存储
        const userId = SlotManager.Instance.getUserId();
        const userOption = LocalStorageManager.getLocalUserOptionInfo(userId);
        userOption.lastFastMode = this.fastMode;
        LocalStorageManager.saveUserOptionInfoToStorage(userId);

        // 扩展接口调用
        SlotManager.Instance.bottomUIInterface.onClickFastModeBtn(this);
    }

    /**
     * 自动旋转选择按钮点击
     */
    onClickAutoSpinSelect(): void {
        SlotManager.Instance.bottomUIInterface.onClickAutoSpinSelect(this);
    }

    /**
     * 支付表按钮点击
     */
    onClickPaytableBtn(): void {
        SlotManager.Instance.bottomUIInterface.onClickPaytableBtn(this);
    }

    /**
     * 增加总下注点击
     */
    onClickIncreaseTotalBet(): void {
        const reelSpinMgr = SlotReelSpinStateManager.Instance;
        if (reelSpinMgr.getCurrentState() !== SlotReelSpinStateManager.STATE_STOP) return;

        // 扩展接口前置判断
        if (SlotManager.Instance.bottomUIInterface.onClickIncreaseTotalBet_BottomEX2(this) === 0) return;

        // 增加单线下注
        const betLevel = SlotGameRuleManager.Instance.increaseBetPerLine();
        
        // 播放下注音效
        if (this.betClips.length === 0) return;
        const soundMgr = SoundManager.Instance();
        if (betLevel > 6) {
            soundMgr.playFxOnce(this.betClips[7]);
        } else {
            soundMgr.playFxOnce(this.betClips[betLevel]);
        }

        // 扩展接口后置调用
        SlotManager.Instance.bottomUIInterface.onAfterClickIncreaseTotalBet_BottomEX2(this);
    }

    /**
     * 减少总下注点击
     */
    onClickDecreaseTotalBet(): void {
        const reelSpinMgr = SlotReelSpinStateManager.Instance;
        if (reelSpinMgr.getCurrentState() !== SlotReelSpinStateManager.STATE_STOP) return;

        // 扩展接口前置判断
        if (SlotManager.Instance.bottomUIInterface.onClickDecreaseTotalBet_BottomEX2(this) === 0) return;

        // 减少单线下注
        const betLevel = SlotGameRuleManager.Instance.decreaseBetPerLine();
        
        // 播放下注音效
        if (this.betClips.length === 0) return;
        const soundMgr = SoundManager.Instance();
        if (betLevel > 6) {
            soundMgr.playFxOnce(this.betClips[8]);
        } else {
            soundMgr.playFxOnce(this.betClips[betLevel]);
        }

        // 扩展接口后置调用
        SlotManager.Instance.bottomUIInterface.onAfterClickDecreaseTotalBet_BottomEX2(this);
    }

    /**
     * 下注选择按钮点击
     */
    onClickBetSelect(): void {
        const reelSpinMgr = SlotReelSpinStateManager.Instance;
        if (reelSpinMgr.getCurrentState() === SlotReelSpinStateManager.STATE_STOP) {
            SlotManager.Instance.bottomUIInterface.onAfterClickSelectTotalBet_BottomEX2(this);
        }
    }

    /**
     * 最大下注按钮点击
     */
    onClickMaxBet(): void {
        const reelSpinMgr = SlotReelSpinStateManager.Instance;
        if (reelSpinMgr.getCurrentState() === SlotReelSpinStateManager.STATE_STOP) {
            SlotGameRuleManager.Instance.setMaxBetPerLine();
            this.bottomUIInterface.onClickMaxBet(this);
        }
    }

    /**
     * 停止自动旋转点击
     */
    onClickStopAutoSpin(): void {
        const reelSpinMgr = SlotReelSpinStateManager.Instance;
        reelSpinMgr.changeAutospinMode(false);
        this.endAutospinTimer();
    }

    /**
     * 停止旋转点击
     */
    onClickStop(): void {
        if (SlotReelSpinStateManager.Instance.getCurrentState() === SlotReelSpinStateManager.STATE_SPINNING_SKIPABLE) {
            SlotManager.Instance.skipReelSpin();
        }
    }

    // ========== 工具方法 ==========
    /**
     * 设置旋转按钮交互状态（带自动旋转模式判断）
     * @param btn 按钮
     * @param isInteractable 是否可交互
     */
    setInteractableSpinBtn(btn: cc.Button, isInteractable: boolean): void {
        if (!btn) return;
        
        const reelSpinMgr = SlotReelSpinStateManager.Instance;
        const finalState = isInteractable && !reelSpinMgr.getAutospinMode();
        this.setInteractableButton(btn.node, finalState);
    }

    /**
     * 设置快速模式按钮激活状态
     * @param modeIdx 模式索引
     */
    setActiveFastModeBtn(modeIdx: number): void {
        for (let i = 0; i < this.fastModeBtns.length; ++i) {
            this.fastModeBtns[i].node.active = (i === modeIdx);
        }
    }

    /**
     * 设置单线下注按钮交互标记
     * @param flag 标记值（0/1）
     */
    setInteractableFlagForBetPerLineBtns(flag: number): void {
        this.interactableFlagChangeBetPerLineBtn = (flag === 1);
        this.setChangeBetPerLineBtnInteractable(this.interactableFlagChangeBetPerLineBtn);
    }

    /**
     * 设置最大下注按钮交互标记
     * @param flag 标记值（0/1）
     */
    setInteractableFlagForMaxbetBtn(flag: number): void {
        this.interactableFlagChangeMaxbetBtn = (flag === 1);
        this.setChangeMaxBetBtnInteractable(this.interactableFlagChangeMaxbetBtn);
    }

    /**
     * 锁定总下注修改
     * @param flag 锁定标记
     * @param betPerLine 下注值（预留）
     * @param tipStr 提示文本
     * @param addX X偏移
     * @param addY Y偏移
     */
    setLockChangeTotalBet(flag: boolean, betPerLine?: number, tipStr?: string, addX?: number, addY?: number): void {
        this.flagLockChangeTotalBet = flag;
        if (flag) {
            this.betPerLineOnSetFlagLock = SlotGameRuleManager.Instance.getCurrentBetPerLine();
        }
        tipStr && (this.stringLockChangeTotalBet = tipStr);
        addX && (this.addXLockTotalBetTooltip = addX);
        addY && (this.addYLockTotalBetTooltip = addY);
    }

    /**
     * 锁定总下注增大
     * @param flag 锁定标记
     * @param betPerLine 下注值（预留）
     * @param tipStr 提示文本
     * @param addX X偏移
     * @param addY Y偏移
     */
    setLockChangeTotalBetBigger(flag: boolean, betPerLine?: number, tipStr?: string, addX?: number, addY?: number): void {
        this.flagLockChangeToTalBetBigger = flag;
        if (flag) {
            this.betPerLineOnSetFlagLock = SlotGameRuleManager.Instance.getCurrentBetPerLine();
            tipStr && (this.stringLockChangeTotalBet = tipStr);
            addX && (this.addXLockTotalBetTooltip = addX);
            addY && (this.addYLockTotalBetTooltip = addY);
        }
    }

    /**
     * 隐藏锁定下注弹窗
     */
    hideLockChangeTotalBetPopup(): void {
        this.bottomUIInterface.hideLockChangeTotalBetPopup();
    }

    /**
     * 播放旋转按钮按住特效
     */
    playHoldEffectOfSpinBtn(): void {
        const reelSpinMgr = SlotReelSpinStateManager.Instance;
        if (!reelSpinMgr.getAutospinMode() && this.holdEffectOfSpinBtn) {
            this.holdEffectOfSpinBtn.node.active = true;
            this.holdEffectOfSpinBtn.stop();
            this.holdEffectOfSpinBtn.play();
        }
    }

    /**
     * 停止旋转按钮按住特效
     */
    stopHoldEffectOfSpinBtn(): void {
        if (this.holdEffectOfSpinBtn) {
            this.holdEffectOfSpinBtn.stop();
            this.holdEffectOfSpinBtn.node.active = false;
        }
    }

    /**
     * 设置自动旋转阻止标记
     * @param flag 标记值（默认false）
     */
    setBlockAutoEvent(flag: boolean = false): void {
        this.blockAutoSpinFlag = flag;
    }

    /**
     * 设置按钮交互状态（兼容CustomButton和原生Button）
     * @param node 按钮节点
     * @param isInteractable 是否可交互
     */
    setInteractableButton(node: cc.Node, isInteractable: boolean): void {
        if (!node) return;
        
        // 自定义按钮
        const customBtn = node.getComponent(CustomButton);
        if (TSUtility.isValid(customBtn)) {
            customBtn.setInteractable(isInteractable);
        }

        // 原生按钮
        const nativeBtn = node.getComponent(cc.Button);
        if (TSUtility.isValid(nativeBtn)) {
            nativeBtn.interactable = isInteractable;
        }
    }

    // ========== Getter/Setter ==========
    /**
     * 获取旋转按钮
     * @returns 旋转按钮
     */
    getSpinBtn(): cc.Button {
        return this.btnSpin;
    }

    /**
     * 获取停止按钮
     * @returns 停止按钮
     */
    getStopBtn(): cc.Button {
        return this.btnStop;
    }

    /**
     * 获取支付表按钮
     * @returns 支付表按钮
     */
    getPayTableBtn(): cc.Button {
        return this.paytableBtn;
    }

    /**
     * 获取自动旋转计时器绑定函数
     * @returns 绑定函数
     */
    getStartAutospinTimerBind(): () => void {
        return this.startAutospinTimerBind;
    }

    /**
     * 设置禁用下注按钮的自定义逻辑
     * @param func 自定义逻辑函数
     */
    setProcessIsDisableChangeBetBtn(func: () => boolean): void {
        this.processIsDisableChangeBetBtn = func;
    }

    /**
     * 获取能量宝石底部图标-老虎机根节点
     * @returns 节点
     */
    getPowerGemBottomIcon_SlotRoot(): cc.Node {
        return this.powerGemSlotBottomIconPos.getChildByName("SlotRoot");
    }

    /**
     * 获取能量宝石底部图标-提示根节点
     * @returns 节点
     */
    getPowerGemBottomIcon_ToolTipRoot(): cc.Node {
        return this.powerGemSlotBottomIconPos.getChildByName("ToolTipRoot");
    }

    /**
     * 获取狂热模式图标-按钮根节点
     * @returns 节点
     */
    getFeverModeIcon_ButtonRoot(): cc.Node {
        return this.nodeFeverIconPos.getChildByName("ButtonRoot");
    }

    /**
     * 获取狂热模式图标-提示根节点
     * @returns 节点
     */
    getFeverModeIcon_ToolTipRoot(): cc.Node {
        return this.nodeFeverIconPos.getChildByName("ToolTipRoot");
    }

    /**
     * 设置自动旋转次数
     * @param count 次数
     */
    setAutoSpinCount(count: number): void {
        if (this.autoSpinCntLabel) {
            this.autoSpinCntLabel.string = count.toString();
        }
    }

    // ========== 生命周期 ==========
    onDestroy(): void {
        super.onDestroy && super.onDestroy();
        this.bottomUIInterface && this.bottomUIInterface.onDestroyBottomUI_EX2(this);
    }
}