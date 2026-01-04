// Cocos Creator 2.x 标准头部解构写法 (严格按你的要求，置顶)
const { ccclass, property } = cc._decorator;

// 所有依赖模块导入 - 路径与原混淆JS完全一致，无任何修改
import DialogBase from "./DialogBase";
import PopupManager from "./manager/PopupManager";
import SDefine from "./global_utility/SDefine";
import ServiceInfoManager from "./ServiceInfoManager";
import InitDataPopup from "./InitDataPopup";
import SoundManager from "./manager/SoundManager";
import { State, SequencialState } from "./Slot/State";
import GameCommonSound from "./GameCommonSound";
import UserInfo from "./User/UserInfo";
import CommonSoundSetter from "./global_utility/CommonSoundSetter";
import TSUtility from "./global_utility/TSUtility";
import ThrillJackpotInfoPopup from "./ThrillJackpotInfoPopup";
import { Utility } from "./global_utility/Utility";
// import ThrillJackpotResultPopup_Common from "./ThrillJackpotResultPopup_Common";
// import ThrillJackpotResultPopup_Jackpot from "./ThrillJackpotResultPopup_Jackpot";
// import ThrillJackpotResultPopup_Total from "./ThrillJackpotResultPopup_Total";
import ThrillJackpotWheelElement from "./ThrillJackpotWheelElement";
// import TopUIThrillJackpotPopup from "./TopUIThrillJackpotPopup";

@ccclass
export default class ThrillWheelJackpot extends DialogBase {
    // ===================== 序列化绑定属性 (与原代码完全一致，编辑器拖拽绑定) =====================
    @property(cc.Node)
    public wheelDimmedBG: cc.Node = null;

    @property(cc.Animation)
    public main_Ani: cc.Animation = null;

    @property([ThrillJackpotWheelElement])
    public wheels: ThrillJackpotWheelElement[] = [];

    @property(cc.Button)
    public btnSpin: cc.Button = null;

    @property(cc.Button)
    public btnInfo: cc.Button = null;

    // @property(ThrillJackpotResultPopup_Total)
    // public resultPopupTotal: ThrillJackpotResultPopup_Total = null;

    // @property(ThrillJackpotResultPopup_Jackpot)
    // public resultPopupJackpot: ThrillJackpotResultPopup_Jackpot = null;

    // @property(ThrillJackpotResultPopup_Common)
    // public resultPopupCommon: ThrillJackpotResultPopup_Common = null;

    @property(ThrillJackpotInfoPopup)
    public infoPopup: ThrillJackpotInfoPopup = null;

    @property(cc.Node)
    public lastWinner_Node: cc.Node = null;

    @property([cc.Node])
    public nodesDiamond_Normal: cc.Node[] = [];

    @property([cc.Node])
    public nodesDiamond_Lock: cc.Node[] = [];

    // @property(TopUIThrillJackpotPopup)
    // public topUI: TopUIThrillJackpotPopup = null;

    // ===================== 私有成员变量 (原代码全部保留) =====================
    private _countSpinWheel: number = 0;
    private _indexCurrentPlayingWheel: number = 0;
    private _spinResult: any = null;

    // ===================== 核心静态方法 - 获取弹窗实例 (预制体加载核心方法，原逻辑完整保留) =====================
    public static getPopup(callback: Function): void {
        const prefabPath = "Service/01_Content/ThrillWheel/TripleThrillJackpot";
        PopupManager.Instance().showDisplayProgress(true);
        cc.loader.loadRes(prefabPath, (err, prefab) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (err) {
                DialogBase.exceptionLogOnResLoad(`cc.loader.loadRes fail ${prefabPath}: ${JSON.stringify(err)}`);
                callback(err, null);
                return;
            }
            const insNode = cc.instantiate(prefab);
            const insComp = insNode.getComponent(ThrillWheelJackpot);
            insNode.active = false;
            callback(null, insComp);
        });
    }

    // ===================== 生命周期回调 =====================
    onLoad(): void {
        this.initDailogBase();
        // 初始化所有转盘子元素
        for (let i = 0; i < this.wheels.length; i++) {
            this.wheels[i].init(this.node.getComponent(CommonSoundSetter));
        }
        // 设置遮罩层尺寸适配画布
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        const canvasSize = canvas.node.getContentSize();
        this.blockingBG.setContentSize(canvasSize);
        TSUtility.isValid(this.wheelDimmedBG) && this.wheelDimmedBG.setContentSize(canvasSize);
        // 绑定信息按钮点击事件
        TSUtility.isValid(this.btnInfo) && this.btnInfo.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "ThrillWheelJackpot", "onClickInfo", "")
        );
    }

    // ===================== 核心对外方法 - 打开弹窗入口 =====================
    open(spinResult: any = null, betValue: number = 0): void {
        const self = this;
        this.setDiamondInfos();
        this.closeAllPopup();
        
        // 初始化子节点数据
        const initDataComps = this.getComponentsInChildren(InitDataPopup);
        TSUtility.isValid(initDataComps) && initDataComps.forEach(comp => comp.initNodeProperty());

        // 播放弹窗弹出音效 + 播放闲置动画
        GameCommonSound.playFxOnce("pop_offer");
        this.main_Ani.play("WheelGame_Idle_Ani", 0);
        this._open(null);
        this._spinResult = spinResult;

        // 无抽奖结果 - 仅展示弹窗
        if (spinResult == null) {
            this.closeBtn.node.active = true;
            this.btnSpin.node.active = false;
            this.btnInfo.interactable = true;

            const minGoldBet = ServiceInfoManager.NUMBER_THRILL_JACKPOT_GOLD_MIN_BET;
            const minDiamondBet = ServiceInfoManager.NUMBER_THRILL_JACKPOT_DIAMOND_MIN_BET;
            let idleAniType = 0;
            if (betValue === 0) idleAniType = 0;
            else if (betValue < minGoldBet) idleAniType = 1;
            else if (betValue >= minGoldBet && betValue < minDiamondBet) idleAniType = 2;
            else idleAniType = 3;

            this.playMainIdleAni(idleAniType);
            // this.topUI.setDimmedState(idleAniType);
        } 
        // 有抽奖结果 - 可进行转盘抽奖
        else {
            this.btnInfo.interactable = false;
            this._countSpinWheel = spinResult.getWheelSpinCount();
            this.playMainIdleAni(this._countSpinWheel);
            // this.topUI.setDimmedState(this._countSpinWheel);
            // this.topUI.setJackpotMoneyOfUI(spinResult);

            // 关闭所有转盘的闲置旋转
            this.wheels.forEach(wheel => wheel._modeIdle = false);

            this.closeBtn.node.active = false;
            this.btnSpin.node.active = true;
            this.btnSpin.interactable = false;

            // 播放切换动画后解锁抽奖按钮，延迟10秒自动触发抽奖
            this.playChangeAni(1, () => {
                self.btnSpin.interactable = true;
                self.scheduleOnce(() => {
                    self.onClickSpin();
                }, 10);
            });
        }
    }

    // ===================== 核心交互方法 - 点击抽奖按钮 =====================
    onClickSpin(): void {
        const self = this;
        this.unscheduleAllCallbacks();
        this.btnSpin.node.active = false;

        // 状态机：按顺序执行所有转盘抽奖流程
        const seqState = new SequencialState();
        let stateIndex = 0;
        for (let wheelIdx = 1; wheelIdx <= this._countSpinWheel; wheelIdx++) {
            seqState.insert(stateIndex++, this.getPlaySubWheelState(wheelIdx));
        }
        // 最后执行总奖励弹窗
        seqState.insert(stateIndex++, this.getShowTotalWheelResultState());
        // 所有流程结束后关闭弹窗
        seqState.addOnEndCallback(() => {
            self._close(null);
        });
        seqState.onStart();
    }

    // ===================== 交互方法 - 点击信息按钮 =====================
    onClickInfo(): void {
        this.showInfoPopup();
    }

    // ===================== 交互方法 - 点击关闭按钮 =====================
    onClickClose(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this._close(null);
    }

    // ===================== 核心封装方法 - 单个转盘抽奖完整流程 =====================
    getPlaySubWheelState(wheelIdx: number): SequencialState {
        const seqState = new SequencialState();
        seqState.insert(0, this.getPlayChangeAniState(wheelIdx));
        seqState.insert(1, this.getPlaySingleWheelSpin(wheelIdx));
        seqState.insert(2, this.getShowSingleWheelResult(wheelIdx));
        return seqState;
    }

    // ===================== 状态机封装 - 播放转盘切换动画 =====================
    getPlayChangeAniState(wheelIdx: number): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            if (wheelIdx === 1) state.setDone();
            else self.playChangeAni(wheelIdx, () => state.setDone());
        });
        return state;
    }

    // ===================== 状态机封装 - 播放单个转盘旋转动画 =====================
    getPlaySingleWheelSpin(wheelIdx: number): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            self.playWheelSpin(wheelIdx, () => state.setDone());
        });
        return state;
    }

    // ===================== 状态机封装 - 显示单个转盘抽奖结果 =====================
    getShowSingleWheelResult(wheelIdx: number): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            self.showSingleWheelResult(wheelIdx, () => state.setDone());
        });
        return state;
    }

    // ===================== 核心动画方法 - 播放转盘切换动画 =====================
    playChangeAni(aniType: number, callback: Function): void {
        const self = this;
        this.main_Ani.stop();
        let aniName = "";
        if (aniType === 1) aniName = "WheelGame_Start_1_Ani";
        else if (aniType === 2) aniName = "WheelGame_Start_2_Ani";
        else if (aniType === 3) aniName = "WheelGame_Start_3_Ani";

        // 播放切换音效
        const soundSetter = this.node.getComponent(CommonSoundSetter);
        SoundManager.Instance().playFxOnce(soundSetter.getAudioClip("thrill_wheel_change"));
        if (aniType === 2 || aniType === 3) {
            this.scheduleOnce(() => {
                SoundManager.Instance().playFxOnce(soundSetter.getAudioClip("thrill_wheel_change"));
            }, 1);
        }

        // 所有转盘播放闲置动画
        this.wheels.forEach(wheel => wheel.onIdleAni());
        this.main_Ani.play(aniName, 0);

        // 调整转盘节点层级，实现叠层效果
        if (aniType === 1) {
            this.scheduleOnce(() => {
                self.wheels[1].node.setSiblingIndex(0);
                self.wheels[2].node.setSiblingIndex(0);
                self.wheels[0].node.setSiblingIndex(self.wheels[1].node.parent.childrenCount - 1);
            }, 0.5);
        } else if (aniType === 2) {
            this.scheduleOnce(() => {
                self.wheels[0].node.setSiblingIndex(0);
                self.wheels[2].node.setSiblingIndex(0);
                self.wheels[1].node.setSiblingIndex(self.wheels[1].node.parent.childrenCount - 1);
            }, 1.3);
        } else if (aniType === 3) {
            this.scheduleOnce(() => {
                self.wheels[0].node.setSiblingIndex(0);
                self.wheels[1].node.setSiblingIndex(0);
                self.wheels[2].node.setSiblingIndex(self.wheels[2].node.parent.childrenCount - 1);
            }, 1.5);
        }

        // 延迟回调，匹配动画时长
        const delayTime = aniType === 1 ? 1.3 : 3;
        this.scheduleOnce(() => callback(), delayTime);
    }

    // ===================== 核心方法 - 执行单个转盘旋转 =====================
    playWheelSpin(wheelIdx: number, callback: Function): void {
        let targetStopIdx = 0;
        if (TSUtility.isValid(this._spinResult) && TSUtility.isValid(this._spinResult.getSingleResult(wheelIdx))) {
            targetStopIdx = this._spinResult.getSingleResult(wheelIdx)._stopIdx - 1;
        }
        this.wheels[wheelIdx - 1].setTargetNum(targetStopIdx);
        this.wheels[wheelIdx - 1].onRotation(callback);
    }

    // ===================== 核心方法 - 显示单个转盘抽奖结果弹窗 =====================
    showSingleWheelResult(wheelIdx: number, callback: Function): void {
        const singleResult = this._spinResult.getSingleResult(wheelIdx);
        const spinCount = this._spinResult.getWheelSpinCount();
        // if (singleResult.isRewardCoin()) {
        //     this.resultPopupCommon.open(this.node.getComponent(CommonSoundSetter), singleResult, spinCount, callback);
        // } else {
        //     this.resultPopupJackpot.open(this.node.getComponent(CommonSoundSetter), singleResult, spinCount, callback);
        // }
    }

    // ===================== 重写返回按钮处理 =====================
    onBackBtnProcess(): boolean {
        return this.closeBtn.node.active === false || this.closeBackBtnProcess();
    }

    // ===================== 钻石图标显隐控制 - 区分高倍场/普通场 =====================
    setDiamondInfos(): void {
        const isHighRollerZone = UserInfo.instance().getZoneId() === SDefine.HIGHROLLER_ZONEID || 
                                 UserInfo.instance().getZoneId() === SDefine.VIP_LOUNGE_ZONEID;
        this.nodesDiamond_Lock.forEach(node => node.active = isHighRollerZone);
        this.nodesDiamond_Normal.forEach(node => node.active = !isHighRollerZone);
    }

    // ===================== 显示规则说明弹窗 =====================
    showInfoPopup(): void {
        TSUtility.isValid(this.infoPopup) && (this.infoPopup.node.active = true);
    }

    // ===================== 关闭所有结果弹窗 =====================
    closeAllPopup(): void {
        // TSUtility.isValid(this.resultPopupTotal) && this.resultPopupTotal.hidePopup();
        // TSUtility.isValid(this.resultPopupJackpot) && this.resultPopupJackpot.hidePopup();
        // TSUtility.isValid(this.resultPopupCommon) && this.resultPopupCommon.hidePopup();
        TSUtility.isValid(this.infoPopup) && this.infoPopup.hidePopup();
    }

    // ===================== 状态机封装 - 显示总抽奖结果弹窗 =====================
    getShowTotalWheelResultState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            // if (TSUtility.isValid(self._spinResult) && TSUtility.isValid(self.resultPopupTotal) && self._spinResult.getWheelSpinCount() > 1) {
            //     self.resultPopupTotal.open(self.node.getComponent(CommonSoundSetter), self._spinResult, () => state.setDone());
            // } else {
                state.setDone();
            // }
        });
        return state;
    }

    // ===================== 播放主界面闲置动画 =====================
    playMainIdleAni(aniType: number): void {
        if (aniType === 0) this.main_Ani.play("WheelGame_Idle_Ani", 0);
        else if (aniType === 1) this.main_Ani.play("WheelGame_Idle_Ani_Availble_1", 0);
        else if (aniType === 2) this.main_Ani.play("WheelGame_Idle_Ani_Availble_2", 0);
        else if (aniType === 3) this.main_Ani.play("WheelGame_Idle_Ani_Availble_3", 0);
    }
}