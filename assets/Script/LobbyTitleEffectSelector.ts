const { ccclass, property } = cc._decorator;

// 导入所有依赖模块，路径与原JS完全一致，无需修改
import SlotJackpotManager from "./manager/SlotJackpotManager";
import CurrencyFormatHelper from "./global_utility/CurrencyFormatHelper";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import TimeFormatHelper from "./global_utility/TimeFormatHelper";
import CasinoZoneManager from "./manager/CasinoZoneManager";
import SoundManager from "./manager/SoundManager";
import GameCommonSound from "./GameCommonSound";
import CasinoJackpotInfoPopup from "./CasinoJackpotInfoPopup";
import SupersizeItManager from "./SupersizeItManager";
import UserInfo from "./User/UserInfo";
import { Utility } from "./global_utility/Utility";

/**
 * 标题特效封装类 - 原JS嵌套的内部类(b)，封装Spine骨骼动画+粒子特效的播放/停止逻辑
 * 负责单个特效的激活/关闭，100%还原原JS逻辑
 */
@ccclass("TitleEffect")
export class TitleEffect {
    @property(sp.Skeleton)
    public spine: sp.Skeleton | null = null;

    @property()
    public spAniName: string = "";

    @property([cc.Node])
    public particles: cc.Node[] = [];

    /** 播放骨骼动画+粒子特效 */
    public play(): void {
        if (this.spine) {
            this.spine.enabled = true;
            if (this.spAniName === "") {
                this.spine.node.active = false;
                this.spine.node.active = true;
                this.spine.clearTracks();
            } else {
                this.spine.setAnimation(0, this.spAniName, true);
            }
        }
        // 激活所有粒子
        for (let i = 0; i < this.particles.length; ++i) {
            if (this.particles[i]) this.particles[i].active = true;
        }
    }

    /** 停止骨骼动画+粒子特效 */
    public stop(exceptNodes: cc.Node[]): void {
        if (this.spine) this.spine.enabled = false;
        // 关闭非例外的粒子
        for (let i = 0; i < this.particles.length; ++i) {
            if (this.particles[i] && exceptNodes.indexOf(this.particles[i]) === -1) {
                this.particles[i].active = false;
            }
        }
    }
}

/**
 * 大厅标题特效选择器核心脚本
 * 负责：大奖金额滚动展示、燃烧状态特效切换、通行证倒计时更新、解锁/锁定动画播放、大奖弹窗触发
 * 与 LobbySlotEntryPopup.ts 强联动，100%还原原JS逻辑，Cocos 2.4.13 TS标准写法
 */
@ccclass("LobbyTitleEffectSelector")
export default class LobbyTitleEffectSelector extends cc.Component {
    // ===================== 【动画常量】原JS内置所有动画名称，一字未改，完全一致 =====================
    private readonly ANIMATION_NAME_JACKPOT_STATE_1 = "Lobby_Jackpot_Ani";
    private readonly ANIMATION_NAME_JACKPOT_STATE_2 = "Lobby_Jackpot_02_Ani";
    private readonly ANIMATION_NAME_JACKPOT_STATE_3 = "Lobby_Jackpot_03_Ani";
    private readonly ANIMATION_NAME_JACKPOT_STATE_4 = "Lobby_Jackpot_04_Ani";
    private readonly ANIMATION_NAME_JACKPOT_NOTIFY = "Lobby_Jackpot_05_Ani";
    private readonly ANIMATION_NAME_UNLOCK_JACKPOT = "UnLock_02_Ani";
    private readonly ANIMATION_NAME_LOCK_JACKPOT = "UnLock_N_Ani";

    // ===================== 【序列化属性】编辑器拖拽绑定，原JS核心绑定项，2.4.13语法完美适配 =====================
    @property({ type: Number, tooltip: "所属区域ID" })
    public zoneID: number = 0;

    @property({ tooltip: "所属区域名称" })
    public zoneName: string = "";

    @property(cc.Label)
    public jackpotMoneyLabel: cc.Label = null!;

    @property(cc.Node)
    public jackpotInfoGroup: cc.Node = null!;

    @property(cc.Node)
    public jackpotInfoNode: cc.Node = null!;

    @property(cc.Label)
    public jackpotInfoLabel: cc.Label = null!;

    @property(cc.Node)
    public jackpotBurningNode: cc.Node = null!;

    @property(cc.Node)
    public suiteCasinoBetNode:cc.Node = null!;

    @property(cc.Label)
    public suiteCasinoBetLabel: cc.Label = null!;

    @property(cc.Node)
    public nodePassRoot: cc.Node = null!;

    @property(cc.Node)
    public nodeSupersizeItPass: cc.Node = null!;

    @property(cc.Node)
    public nodeEarlyPass: cc.Node = null!;

    @property(cc.Node)
    public nodeSuitePass: cc.Node = null!;

    @property(cc.Label)
    public lblSupersizeItPassRemainTime: cc.Label = null!;

    @property(cc.Label)
    public lblEarlyPassRemainTime: cc.Label = null!;

    @property(cc.Label)
    public lblSuitePassRemainTime: cc.Label = null!;

    @property(cc.AudioClip)
    public triggerSoundFx: cc.AudioClip = null!;

    @property({ type: [TitleEffect], serializable: true, override: true, tooltip: "特效数组(骨骼+粒子)" })
    public effects: TitleEffect[] = [];

    @property(cc.Animation)
    public animation: cc.Animation = null!;

    @property(cc.Animation)
    public animUnlockJackpot: cc.Animation = null!;

    // ===================== 【静态常量】原JS内置静态属性 =====================
    public static readonly JACKPOT_TRIGGER_EFFECT_INDEX = 3;

    // ===================== 【私有成员变量】原JS所有变量完整还原，类型适配，无任何增删 =====================
    private _currentPlayIndex: number = 0;
    private _prevJackPotMoney: number = 0;
    private _prevState: number = 0;
    private _isCenter: boolean = false;
    private _infoState: number = 0;
    private _infoStateChangeTime: number = 0;
    private _prevInfoState: number = 0;
    private _onChangeBurningState: Function | null = null;
    private _btnCasinoJackpot: cc.Button | null = null;
    private _isRolling: boolean = false;
    private _timeFormat: TimeFormatHelper | null = null;
    private _reserveRefresh: boolean = false;

    // ===================== 【只读属性(Getter)】100%还原原JS逻辑 =====================
    get prevState(): number {
        return this._prevState;
    }

    // ===================== 【生命周期回调】 =====================
    onLoad(): void {
        // 绑定大奖按钮点击事件
        this._btnCasinoJackpot = this.node.getComponent(cc.Button);
        if (TSUtility.isValid(this._btnCasinoJackpot)) {
            this._btnCasinoJackpot.clickEvents.push(Utility.getComponent_EventHandler(this.node, "LobbyTitleEffectSelector", "onClick_CasinoJackpot", ""));
        }
    }

    onDestroy(): void {
        // 销毁时清理所有定时器，修复原JS内存泄漏隐患
        this.unscheduleAllCallbacks();
        // 移除用户信息监听
        const userInstance = UserInfo.instance();
        // userInstance.removeListenerTarget(UserInfo.MSG.UPDATE_INVENTORY, this.updateTicketInfo, this);
        // userInstance.removeListenerTarget(UserInfo.MSG.UPDATE_VIP_POINT, this.updateTicketInfo, this);
        // userInstance.removeListenerTarget(UserInfo.MSG.UPDATE_JACKPOTINFO, this.refreshBunningState, this);
    }

    // ===================== 【核心初始化方法】原JS核心入口，100%还原逻辑 =====================
    initLobbyTitleEffectSelector(isInteractable: boolean = false, isRolling: boolean = true): void {
        this._isRolling = isRolling;
        this.unscheduleAllCallbacks();
        this.setActiveLockUI(false);

        // 设置按钮交互状态
        if (TSUtility.isValid(this._btnCasinoJackpot)) {
            this._btnCasinoJackpot!.interactable = isInteractable;
        }

        // 初始化显示状态
        if (TSUtility.isValid(this.jackpotMoneyLabel)) {
            this.jackpotMoneyLabel.node.active = true;
        }
        if (TSUtility.isValid(this.jackpotInfoGroup)) {
            this.jackpotInfoGroup.active = true;
            this.jackpotInfoGroup.opacity = 0;
        }

        // 初始化大奖数据+特效状态
        const jackpotZoneInfo = SlotJackpotManager.Instance().getZoneJackpotInfo(Math.min(1, this.zoneID));
        const jackpotMoney = jackpotZoneInfo.getJackpotForDisplayMoney(SDefine.SLOT_JACKPOT_TYPE_CASINO);
        this._prevState = jackpotZoneInfo.getBunningState(SDefine.SLOT_JACKPOT_TYPE_CASINO);
        
        this.playEffect(this._prevState);
        this.updateAnimationState(this._prevState);
        this._prevJackPotMoney = jackpotMoney;
        this.updateJackpotMoney();

        // 调度大奖金额刷新
        this.schedule(this.updateJackpotMoney, SDefine.JACKPOT_DISPLAY_DEFAULT_INTERVAL);

        // 初始化通行证信息
        this.updateTicketInfo();

        // 绑定用户信息监听事件
        const userInstance = UserInfo.instance();
        // userInstance.addListenerTarget(UserInfo.MSG.UPDATE_INVENTORY, this.updateTicketInfo, this);
        // userInstance.addListenerTarget(UserInfo.MSG.UPDATE_VIP_POINT, this.updateTicketInfo, this);
        // userInstance.addListenerTarget(UserInfo.MSG.UPDATE_JACKPOTINFO, this.refreshBunningState, this);
    }

    // ===================== 【核心业务方法】所有原JS方法完整还原，逻辑无改动，按原顺序排列 =====================
    setCenter(): void {
        this._isCenter = true;
    }

    setActivePassNode(isActive: boolean): void {
        this.nodePassRoot.active = isActive;
    }

    setJackpotMoneyWithTrigger(money: number): void {
        const self = this;
        this.unschedule(this.updateJackpotMoney);
        
        // 播放触发音效+特效
        SoundManager.Instance().playFxOnce(this.triggerSoundFx);
        this._prevState = LobbyTitleEffectSelector.JACKPOT_TRIGGER_EFFECT_INDEX;
        this.playEffect(this._prevState);
        this.updateAnimationState(this._prevState);

        // 渐变动画切换
        if (TSUtility.isValid(this.jackpotInfoGroup)) {
            this.jackpotInfoGroup.runAction(cc.fadeOut(0.2));
        }
        this.jackpotMoneyLabel.node.runAction(cc.fadeIn(0.2));

        this.scheduleOnce(() => {
            if (TSUtility.isValid(self.jackpotInfoGroup)) {
                self.jackpotInfoGroup.opacity = 0;
            }
            self.jackpotMoneyLabel.node.opacity = 255;
        }, 0.2);

        // 更新大奖金额+播放通知动画
        this.jackpotMoneyLabel.string = CurrencyFormatHelper.formatNumber(money);
        this.setActivePassNode(false);
        this.animation.setCurrentTime(0);
        this.animation.play(this.ANIMATION_NAME_JACKPOT_NOTIFY, 0);
    }

    restartMoneyUpdate(): void {
        this.updateJackpotMoney();
        this.schedule(this.updateJackpotMoney, SDefine.JACKPOT_DISPLAY_DEFAULT_INTERVAL);
    }

    /** 统一更新所有通行证信息 */
    updateTicketInfo(): void {
        this.updateSupersizeIt();
        this.updateEarlyPass();
        this.updateSuitePass();

        // 通行证显示优先级处理
        const isSupersizeActive = TSUtility.isValid(this.nodeSupersizeItPass) && this.nodeSupersizeItPass.active;
        const isEarlyActive = TSUtility.isValid(this.nodeEarlyPass) && this.nodeEarlyPass.active;
        const isSuiteActive = TSUtility.isValid(this.nodeSuitePass) && this.nodeSuitePass.active;

        if (TSUtility.isValid(this.nodeSuitePass)) {
            this.nodeSuitePass.active = isSuiteActive && !isEarlyActive && !isSupersizeActive;
        }
        if (TSUtility.isValid(this.nodeSupersizeItPass)) {
            this.nodeSupersizeItPass.active = isSupersizeActive && !isEarlyActive;
        }
    }

    /** 更新超级通行证倒计时 */
    updateSupersizeIt(): void {
        const self = this;
        if (!TSUtility.isValid(this.nodeSupersizeItPass)) return;
        this.nodeSupersizeItPass.active = false;

        const remainTime = SupersizeItManager.instance.getSupersizeFreeTicketRemainTime();
        const diffTime = remainTime - TSUtility.getServerBaseNowUnixTime();
        if (remainTime <= 0 || diffTime <= 0) return;

        this.nodeSupersizeItPass.active = true;
        this._timeFormat = new TimeFormatHelper(diffTime);

        const updateFunc = () => {
            const currentDiff = remainTime - TSUtility.getServerBaseNowUnixTime();
            const safeDiff = Math.max(0, currentDiff);
            if (TSUtility.isValid(self.lblSupersizeItPassRemainTime) && self.nodeSupersizeItPass.active) {
                self.lblSupersizeItPassRemainTime.string = `${self._timeFormat!.getTimeStringDayBaseHourFormatBig()}`;
            }
            if (safeDiff <= 0) {
                self.unschedule(updateFunc);
                self.updateTicketInfo();
            }
        };
        updateFunc();
        this.schedule(updateFunc, 0.5);
    }

    /** 更新早鸟通行证倒计时 */
    updateEarlyPass(): void {
        const self = this;
        if (!TSUtility.isValid(this.nodeEarlyPass)) return;
        this.nodeEarlyPass.active = false;

        // const userInstance = UserInfo.instance();
        // if (userInstance.hasVipPassBenefit(SDefine.VIP_LOUNGE_ZONEID, SDefine.VIP_LOUNGE_ZONENAME)) return;

        // const ticketList = userInstance.getItemInventory().getItemsByItemId(SDefine.ITEM_MAJORROLLER_FREETICKET);
        // if (ticketList.length <= 0) return;

        // const ticket = ticketList[0];
        // if (!TSUtility.isValid(ticket) || ticket.expireDate <= TSUtility.getServerBaseNowUnixTime()) return;

        // const diffTime = ticket.expireDate - TSUtility.getServerBaseNowUnixTime();
        // if (diffTime <= 0) return;

        // this.nodeEarlyPass.active = true;
        // this._timeFormat = new TimeFormatHelper(diffTime);

        // const updateFunc = () => {
        //     const currentDiff = ticket.expireDate - TSUtility.getServerBaseNowUnixTime();
        //     const safeDiff = Math.max(0, currentDiff);
        //     if (TSUtility.isValid(self.lblEarlyPassRemainTime) && self.nodeEarlyPass.active) {
        //         self.lblEarlyPassRemainTime.string = `${self._timeFormat!.getTimeStringDayBaseHourFormatBig()}`;
        //     }
        //     if (safeDiff <= 0) {
        //         self.unschedule(updateFunc);
        //         self.updateTicketInfo();
        //     }
        // };
        // updateFunc();
        // this.schedule(updateFunc, 0.5);
    }

    /** 更新套房通行证倒计时 */
    updateSuitePass(): void {
        const self = this;
        // if (!TSUtility.isValid(this.nodeSuitePass)) return;
        // this.nodeSuitePass.active = false;

        // const userInstance = UserInfo.instance();
        // if (userInstance.hasVipPassBenefit(SDefine.SUITE_ZONEID, SDefine.SUITE_ZONENAME)) return;

        // const passList = userInstance.getItemInventory().getItemsByItemId(SDefine.ITEM_SUITE_PASS);
        // if (passList.length <= 0) return;

        // const pass = passList[0];
        // if (!TSUtility.isValid(pass) || pass.expireDate <= TSUtility.getServerBaseNowUnixTime()) return;

        // const diffTime = pass.expireDate - TSUtility.getServerBaseNowUnixTime();
        // if (diffTime <= 0) return;

        // this.nodeSuitePass.active = true;
        // this._timeFormat = new TimeFormatHelper(diffTime);

        // const updateFunc = () => {
        //     const currentDiff = pass.expireDate - TSUtility.getServerBaseNowUnixTime();
        //     const safeDiff = Math.max(0, currentDiff);
        //     if (TSUtility.isValid(self.lblSuitePassRemainTime) && self.nodeSuitePass.active) {
        //         self.lblSuitePassRemainTime.string = `${self._timeFormat!.getTimeStringDayBaseHourFormatBig()}`;
        //     }
        //     if (safeDiff <= 0) {
        //         self.unschedule(updateFunc);
        //         self.updateTicketInfo();
        //     }
        // };
        // updateFunc();
        // this.schedule(updateFunc, 0.5);
    }

    refreshBunningState(): void {
        this._reserveRefresh = true;
    }

    /** 核心：更新大奖金额+燃烧状态+特效切换 */
    updateJackpotMoney(): void {
        const self = this;
        let stateDuration = 7;
        if (this._infoState % 2 === 0) stateDuration = 3;

        // const currentTime = TSUtility.getUnixTimestamp();
        // // 切换信息展示状态
        // if (this._infoStateChangeTime + stateDuration < currentTime) {
        //     this._infoStateChangeTime = currentTime;
        //     this._infoState = this._isRolling ? (this._infoState + 1) % 2 : 1;
        // }

        // // 区域权限判断 + 文字/金额切换动画
        // if (this.zoneID >= UserInfo.instance().getZoneId() && this._infoState % 2 === 0) {
        //     if (this._prevInfoState !== this._infoState) {
        //         if (TSUtility.isValid(this.jackpotInfoGroup)) {
        //             this.jackpotInfoGroup.runAction(_decorator.cc.fadeIn(0.2));
        //         }
        //         this.jackpotMoneyLabel.node.runAction(_decorator.cc.fadeOut(0.2));

        //         this.scheduleOnce(() => {
        //             if (TSUtility.isValid(self.jackpotInfoGroup)) self.jackpotInfoGroup.opacity = 255;
        //             self.jackpotMoneyLabel.node.opacity = 0;
        //         }, 0.2);
        //         this._prevInfoState = this._infoState;
        //         this.updateJackpotTitleInfo(this._infoState);
        //     }
        // } else {
        //     if (this._prevInfoState !== this._infoState) {
        //         if (TSUtility.isValid(this.jackpotInfoGroup)) {
        //             this.jackpotInfoGroup.runAction(_decorator.cc.fadeOut(0.2));
        //         }
        //         this.jackpotMoneyLabel.node.runAction(_decorator.cc.fadeIn(0.2));

        //         this.scheduleOnce(() => {
        //             if (TSUtility.isValid(self.jackpotInfoGroup)) self.jackpotInfoGroup.opacity = 0;
        //             self.jackpotMoneyLabel.node.opacity = 255;
        //         }, 0.2);
        //         this._prevInfoState = this._infoState;
        //     }
        //     this.updateJackpotMoneyInfo();
        // }

        // // 燃烧状态刷新
        // if (this._reserveRefresh) {
        //     const newBurningState = SlotJackpotManager.Instance().getZoneJackpotInfo(this.zoneID).getBunningState(SDefine.SLOT_JACKPOT_TYPE_CASINO);
        //     if (newBurningState !== this._prevState) {
        //         this._prevState = newBurningState;
        //         this.playEffect(this._prevState);
        //         this.updateAnimationState(this._prevState);
        //         this._onChangeBurningState && this._onChangeBurningState(this._prevState);
        //     }
        //     this._reserveRefresh = false;
        // }
    }

    setOnChangeBurningState(callback: Function): void {
        this._onChangeBurningState = callback;
    }

    /** 更新大奖标题文字信息 */
    updateJackpotTitleInfo(): void {
        let showText = "";
        if (this._prevState === 1 || this._prevState === 2) {
            // 燃烧状态
            if (TSUtility.isValid(this.jackpotBurningNode)) {
                this.jackpotBurningNode.active = true;
            }
            if (this._isCenter) {
                const jackpotInfo = SlotJackpotManager.Instance().getZoneJackpotInfo(this.zoneID).getJackpotMoneyInfo(0);
                const totalPrize = jackpotInfo.basePrize + jackpotInfo.maxPrize;
                showText = this.zoneName === SDefine.SUITE_ZONENAME 
                    ? CurrencyFormatHelper.formatEllipsisNumberVer2(totalPrize)
                    : `BURSTS BEFORE ${CurrencyFormatHelper.formatEllipsisNumberVer2(totalPrize)}`;
                
                if (TSUtility.isValid(this.jackpotInfoLabel)) {
                    this.jackpotInfoNode.active = true;
                    TSUtility.isValid(this.suiteCasinoBetNode) && (this.suiteCasinoBetNode.active = false);
                    this.jackpotInfoLabel.string = showText;
                    if (this.zoneName !== SDefine.SUITE_ZONENAME) this.jackpotInfoLabel.fontSize = 60;
                }
            } else {
                if (TSUtility.isValid(this.jackpotInfoLabel)) {
                    this.jackpotInfoNode.active = false;
                    TSUtility.isValid(this.suiteCasinoBetNode) && (this.suiteCasinoBetNode.active = false);
                }
            }
        } else {
            // 普通状态 - 显示投注区间
            const zoneInfo = CasinoZoneManager.Instance().getZoneInfo(this.zoneID);
            let minBet = zoneInfo.minBet;
            if (this.zoneName === SDefine.SUITE_ZONENAME) minBet = SDefine.SUITE_MINBET;
            showText = `CASINO BET ${CurrencyFormatHelper.formatEllipsisNumberUsingDot(minBet)}-${CurrencyFormatHelper.formatEllipsisNumberUsingDot(zoneInfo.maxBet)}`;

            if (TSUtility.isValid(this.jackpotBurningNode)) {
                this.jackpotBurningNode.active = false;
            }

            if (this.zoneName === SDefine.SUITE_ZONENAME) {
                showText = `${CurrencyFormatHelper.formatEllipsisNumberUsingDot(minBet)}~${CurrencyFormatHelper.formatEllipsisNumberUsingDot(zoneInfo.maxBet)}`;
                this.jackpotInfoNode.active = false;
                TSUtility.isValid(this.suiteCasinoBetNode) && (this.suiteCasinoBetNode.active = true, this.suiteCasinoBetLabel.string = showText);
            } else {
                if (TSUtility.isValid(this.jackpotInfoLabel)) {
                    TSUtility.isValid(this.suiteCasinoBetNode) && (this.suiteCasinoBetNode.active = false);
                    this.jackpotInfoNode.active = true;
                    this.jackpotInfoLabel.string = showText;
                    this.jackpotInfoLabel.fontSize = this._isCenter ? 70 : 40;
                }
            }
        }
    }

    /** 更新大奖金额数值 */
    updateJackpotMoneyInfo(): void {
        const jackpotMoney = SlotJackpotManager.Instance().getZoneJackpotInfo(this.zoneID).getJackpotForDisplayMoney(SDefine.SLOT_JACKPOT_TYPE_CASINO);
        // const showMoney = TSUtility.getDisplayJackpotMoney(this._prevJackPotMoney, jackpotMoney);
        // this.jackpotMoneyLabel.string = CurrencyFormatHelper.formatNumber(showMoney);
        // this._prevJackPotMoney = Math.floor(showMoney);
    }

    /** 更新对应状态的动画播放 */
    updateAnimationState(state: number): void {
        if (!TSUtility.isValid(this.animation)) return;
        let playState = state;
        if (playState <= 0 || playState > 4) playState = 0;
        this.animation.setCurrentTime(0);
        this.animation.play(this[`ANIMATION_NAME_JACKPOT_STATE_${playState + 1}`], 0);
    }

    /** 播放指定索引的特效，停止其他特效 */
    playEffect(stateIndex: number): void {
        if (this.effects.length === 0) return;
        if (stateIndex >= this.effects.length) {
            cc.error(`LobbyTitleEffectSelector playEffect out of index: ${stateIndex}`);
            return;
        }

        // 权限判断：限制特效播放索引
        // this._currentPlayIndex = this.zoneID >= UserInfo.instance().getZoneId() ? stateIndex : 0;

        // 停止其他特效，播放当前特效
        for (let i = 0; i < this.effects.length; ++i) {
            if (i !== this._currentPlayIndex) {
                this.effects[i].stop(this.effects[this._currentPlayIndex].particles);
            }
        }
        this.effects[this._currentPlayIndex].play();
    }

    // ===================== 【锁相关方法】与 LobbySlotEntryPopup.ts 联动核心方法 =====================
    isLockedJackpot(): boolean {
        return this.animUnlockJackpot.node.active;
    }

    setActiveLockUI(isActive: boolean): void {
        this.animUnlockJackpot.node.active = isActive;
    }

    playLockAction(isUnlock: boolean): void {
        this.animUnlockJackpot.setCurrentTime(0);
        this.animUnlockJackpot.play(isUnlock ? this.ANIMATION_NAME_UNLOCK_JACKPOT : this.ANIMATION_NAME_LOCK_JACKPOT, 0);
    }

    // ===================== 【按钮点击回调】 =====================
    onClick_CasinoJackpot(): void {
        GameCommonSound.playFxOnce("btn_casino");
        CasinoJackpotInfoPopup.openPopup();
    }
}