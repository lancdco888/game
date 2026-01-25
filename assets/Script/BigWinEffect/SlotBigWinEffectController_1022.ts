const { ccclass, property } = cc._decorator;

// 外部依赖模块导入
import PopupManager, { OpenPopupInfo } from "../manager/PopupManager";
import SlotManager from "../manager/SlotManager";
import SoundManager from "../manager/SoundManager";
import SymbolAnimationController from "../Slot/SymbolAnimationController";
import SlotSoundController from "../Slot/SlotSoundController";
import ChangeNumberComponent from "../Slot/ChangeNumberComponent";
import TSUtility from "../global_utility/TSUtility";
import NodeParticleSystem from "../global_utility/NodeParticleSystem";
// import FBShareFlagToStorageInGame from "../UI/FBShareFlagToStorageInGame";
import PowerGemWinEffect from "../PowerGemWinEffect";
import AsyncHelper from "../global_utility/AsyncHelper";
import ViewResizeManager from "../global_utility/ViewResizeManager";

@ccclass()
export default class SlotBigWinEffectController_1022 extends cc.Component {
    // ===================== 【编辑器绑定-动画组件】 =====================
    @property(cc.Animation)
    private bgAni: cc.Animation = null!;
    @property(cc.Animation)
    private textOverAni: cc.Animation = null!;
    @property(cc.Animation)
    private buttonAni: cc.Animation = null!;
    @property(cc.Animation)
    private instant_buttonAni: cc.Animation = null!;
    @property(cc.Animation)
    private textAniSuperWin: cc.Animation = null!;
    @property(cc.Animation)
    private textAniBigWin: cc.Animation = null!;
    @property(cc.Animation)
    private textAniHugeWin: cc.Animation = null!;
    @property(cc.Animation)
    private textAniMegaWin: cc.Animation = null!;
    @property(cc.Animation)
    private textAniEpicWin: cc.Animation = null!;
    @property(cc.Animation)
    private winCoinsAnimation: cc.Animation = null!;
    @property(cc.Animation)
    private commonFXAnimation: cc.Animation = null!;
    @property(cc.Animation)
    private winExplodeCoin: cc.Animation = null!;
    @property(cc.Animation)
    private fxCoinBorder: cc.Animation = null!;

    // ===================== 【编辑器绑定-按钮/交互组件】 =====================
    @property(cc.Button)
    private btnCollect: cc.Button = null!;
    @property(cc.Button)
    private btnSkip: cc.Button = null!;
    @property(cc.Button)
    private instant_btnSkip: cc.Button = null!;
    @property(cc.Toggle)
    private toggleShare: cc.Toggle = null!;
    @property(cc.Button)
    private instant_collect_Btn: cc.Button = null!;
    @property(cc.Button)
    private instant_close_Btn: cc.Button = null!;

    // ===================== 【编辑器绑定-数值/特效节点】 =====================
    @property(ChangeNumberComponent)
    private labelWinMoney: ChangeNumberComponent = null!;
    @property([cc.Node])
    private backgroundMoneySmall: cc.Node[] = [];
    @property([cc.Node])
    private backgroundMoneyBig: cc.Node[] = [];
    @property(cc.Node)
    private dimmObject: cc.Node = null!;
    @property(cc.Node)
    private txtAdd: cc.Node = null!;
    @property(cc.Node)
    private winCoin: cc.Node = null!;
    @property(cc.Node)
    private winCoinAdd: cc.Node = null!;
    @property(cc.Node)
    private fxUnder: cc.Node = null!;
    @property([NodeParticleSystem])
    private nodeParticles: NodeParticleSystem[] = [];
    @property(cc.Node)
    private winCoinCollectFx: cc.Node = null!;
    @property([cc.Node])
    private blockingBG: cc.Node[] = [];
    @property(cc.Node)
    private nodeBlock: cc.Node = null!;

    // // ===================== 【编辑器绑定-自定义业务组件】 =====================
    // @property(PowerGemWinEffect)
    // private powerGemWinEffect: PowerGemWinEffect = null!;

    // ===================== 【私有业务状态属性】 =====================
    private _earnMoney: number = 0;
    private _totalBet: number = 0;
    private fnCallback: Function | null = null;
    public coinTargetNode: cc.Node | null = null;
    public coinTargetNodeFreespin: cc.Node | null = null;
    private skipFunc: Function | null = null;
    private _isEpicWin: boolean = false;
    private _isOverBigWin: boolean = false;
    private _lastWatchedBotPopupTime: number = 0;
    private _exceptStopSymbolList: number[] = [];
    private _isEnableShareasync: boolean = true;
    private _isPlayExplodeCoin: boolean = true;
    private _isStartEndProcess: boolean = false;

    // ===================== 【生命周期函数】 =====================
    onLoad(): void {
        cc.log("SlotBigWinEffectController_1022 onLoad");
        for (let e = 0; e < this.nodeParticles.length; ++e) {
            this.nodeParticles[e].preLoad();
        }
        this.hideAllObject();
        this.node.active = false;

        // if (TSUtility.isFacebookInstant()) {
        //     const t: string[] = (window as any).FBInstant.getSupportedAPIs();
        //     this._isEnableShareasync = this.contains(t, "shareAsync");
        //     this._isEnableShareasync ? cc.log("Can Use shareAsync") : cc.log("Can't Use shareAsync");
        // }
    }

    public init(): void {
        // this.toggleShare.node.addComponent(FBShareFlagToStorageInGame);
        // this.toggleShare.node.active = SlotManager.Instance.isFBShareDisableTarget() !== 1;
    }

    onEnable(): void {
        this.onRefreshView();
        ViewResizeManager.Instance().addHandler(this);
    }

    onDisable(): void {
        ViewResizeManager.RemoveHandler(this);
    }

    onDestroy(): void { }

    // ===================== 【基础工具方法】 =====================
    private contains(e: string[], t: string): boolean {
        for (let n = e.length; n--;) {
            if (e[n] === t) return true;
        }
        return false;
    }

    private hideAllObject(): void {
        this.bgAni.node.active = false;
        this.textOverAni.node.active = false;
        this.buttonAni.node.active = false;
        this.instant_buttonAni.node.active = false;
        this.textAniSuperWin.node.active = false;
        this.textAniBigWin.node.active = false;
        this.textAniHugeWin.node.active = false;
        this.textAniMegaWin.node.active = false;
        this.textAniEpicWin.node.active = false;
        this.winCoinsAnimation.node.active = false;
        this.commonFXAnimation.node.active = false;
        this.winExplodeCoin.node.active = false;
        this.winCoinCollectFx.active = false;
        this.instant_collect_Btn.interactable = false;
        this.instant_close_Btn.interactable = false;
        this.btnCollect.interactable = false;
        // this.powerGemWinEffect.node.active = false;
    }

    private stopSymbolAni(): void {
        this._exceptStopSymbolList.length === 0
            ? SymbolAnimationController.Instance.stopAllAnimationSymbol()
            : SymbolAnimationController.Instance.stopAllAnimationSymbolExceptList(this._exceptStopSymbolList);
    }

    private switchMoneyBg(earnMoney: number): void {
        const isBigMoney = earnMoney >= 1e9;
        this.backgroundMoneyBig.forEach(node => node.active = isBigMoney);
        this.backgroundMoneySmall.forEach(node => node.active = !isBigMoney);
        this.fxCoinBorder.play(isBigMoney ? "WinCoin_Fx_Big_Ani" : "WinCoin_Fx_Small_Ani");
    }

    private handleSmallWin(callback: Function | null): void {
        if (callback) {
            this.endProcess();
            PopupManager.Instance().setOpenPopupAllCloseCallback(() => callback());
        }
        this.node.active = false;
        SlotManager.Instance.setBiggestWinCoin(this._earnMoney);
    }

    // ===================== 【对外暴露的公共方法】 =====================
    public endProcess(): void {
        if (!this._isStartEndProcess) {
            this._isStartEndProcess = true;
            if (SlotManager.Instance.bigWinEffectInterface.onEndProcess(this) === 0) {
                this.doEndCallback();
            }
        } else {
            this.doEndCallback();
        }
    }

    private doEndCallback(): void {
        if (!PopupManager.Instance().isOpenPopupOpen()) {
            PopupManager.Instance().checkNextOpenPopup();
        }
        cc.log("bigwin endProcess end");
    }

    public isEpicWin(): boolean { return this._isEpicWin; }
    public isOverBigWin(): boolean { return this._isOverBigWin; }
    public getEarnMoney(): number { return this._earnMoney; }

    public setExceptStopSymbolList(e: number[]): void {
        this._exceptStopSymbolList = e;
    }

    public fbinstantShowedLobbyBotPopupGetdata(): any {
        const t: any = new OpenPopupInfo();
        t.type = "LastWatchedBotPopupTime";
        t.openCallback = () => {
            this._lastWatchedBotPopupTime = TSUtility.getServerBaseNowUnixTime();
            PopupManager.Instance().showDisplayProgress(true);
            (window as any).FBInstant.player.getDataAsync(["LastWatchedBotPopupTime"])
                .then((res: any) => {
                    this._lastWatchedBotPopupTime = res?.LastWatchedBotPopupTime || 0;
                    PopupManager.Instance().showDisplayProgress(false);
                    PopupManager.Instance().checkNextOpenPopup();
                }).catch(() => {
                    PopupManager.Instance().showDisplayProgress(false);
                    PopupManager.Instance().checkNextOpenPopup();
                });
        };
        return t;
    }

    // ===================== 【核心业务-播放大奖特效 重载1：多线路中奖】 =====================
    public playWinEffectForMutiple(earnMoney: number, totalBet: number, callback: Function | null, skipFunc: Function | null, startNum: number): number {
        this.stopSymbolAni();
        SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
        this._isStartEndProcess = false;
        this.unscheduleAllCallbacks();
        this.node.stopAllActions();
        this.hideAllObject();
        this.node.active = true;

        this.skipFunc = skipFunc;
        this._earnMoney = earnMoney;
        this._totalBet = totalBet;
        this.winCoin.opacity = 0;

        let duration = 0, winLv = 0;
        this._isEpicWin = false;
        this._isOverBigWin = false;

        if (earnMoney < 5 * totalBet) { this.handleSmallWin(callback); return 0; }
        else if (earnMoney >= 5 * totalBet && earnMoney < 10 * totalBet) { duration = 3; winLv = 1; }
        else if (earnMoney >= 10 * totalBet && earnMoney < 20 * totalBet) { duration = earnMoney < 13 * totalBet ? 4 : earnMoney < 16 * totalBet ? 5 : 6; this._isOverBigWin = true; winLv = 2; }
        else if (earnMoney >= 20 * totalBet && earnMoney < 30 * totalBet) { duration = earnMoney < 22 * totalBet ? 7.2 : earnMoney < 24 * totalBet ? 8.4 : earnMoney < 27 * totalBet ? 9.6 : 10.8; this._isOverBigWin = true; winLv = 3; }
        else if (earnMoney >= 30 * totalBet && earnMoney < 50 * totalBet) { duration = earnMoney < 40 * totalBet ? 12 : 13.4; this._isOverBigWin = true; winLv = 4; }
        else { this._isOverBigWin = true; this._isEpicWin = true; duration = 14.6; winLv = 5; }

        const isShareAble = this.checkShareAble(winLv);
        const isHighWin = [2, 3, 4, 5].includes(winLv);
        SlotManager.Instance.bigWinEffectInterface.onPlayEffect_BigWinEffect(this, isHighWin, duration);
        this.switchMoneyBg(earnMoney);

        SlotManager.Instance.setMouseDragEventFlag(false);
        this.fnCallback = callback;
        this.dimmObject.active = true;

        this.playMainAni(winLv, duration);
        this.scheduleDelayEffect(duration);

        this.labelWinMoney.node.active = true;
        this.labelWinMoney.node.scale = 1;
        this.labelWinMoney.playChangeNumber(startNum, earnMoney, null, duration);

        // if (SlotManager.Instance.bigWinEffectInterface.isPlayPowerGemWinEffect(this, winLv, totalBet)) {
        //     this.winCoinsAnimation.node.setPosition(0, 20);
        //     // this.powerGemWinEffect.playPowerGemWinEffect_Step1(duration, earnMoney / totalBet);
        // }

        SoundManager.Instance().setMainVolumeTemporarily(0.1);
        return duration;
    }

    // ===================== 【核心业务-播放大奖特效 重载2：基础中奖】 =====================
    public playWinEffect(earnMoney: number, totalBet: number, callback: Function | null, skipFunc: Function | null = null, stopSymbolAni: boolean = true, startNum: number = -1): number {
        if (stopSymbolAni) this.stopSymbolAni();
        SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
        this._isStartEndProcess = false;
        this.unscheduleAllCallbacks();
        this.node.stopAllActions();
        this.hideAllObject();
        this.node.active = true;

        this.skipFunc = skipFunc;
        this._earnMoney = earnMoney;
        this._totalBet = totalBet;
        this.winCoin.opacity = 0;

        let duration = 0, winLv = 0;
        this._isEpicWin = false;
        this._isOverBigWin = false;

        if (earnMoney < 5 * totalBet) { 
            this.handleSmallWin(callback); return 0; 
        }else if (earnMoney >= 5 * totalBet && earnMoney < 10 * totalBet) {
            duration = 3; winLv = 1; 
        }else if (earnMoney >= 10 * totalBet && earnMoney < 20 * totalBet) { 
            duration = earnMoney < 13 * totalBet ? 4 : earnMoney < 16 * totalBet ? 5 : 6; this._isOverBigWin = true; winLv = 2; 
        }else if (earnMoney >= 20 * totalBet && earnMoney < 30 * totalBet) { 
            duration = earnMoney < 22 * totalBet ? 7.2 : earnMoney < 24 * totalBet ? 8.4 : earnMoney < 27 * totalBet ? 9.6 : 10.8; this._isOverBigWin = true; winLv = 3; 
        }else if (earnMoney >= 30 * totalBet && earnMoney < 50 * totalBet) { 
            duration = earnMoney < 40 * totalBet ? 12 : 13.4; this._isOverBigWin = true; winLv = 4; 
        }else { 
            this._isOverBigWin = true; this._isEpicWin = true; duration = 14.6; winLv = 5; 
        }

        const isShareAble = this.checkShareAble(winLv);
        const isHighWin = [2, 3, 4, 5].includes(winLv);
        SlotManager.Instance.bigWinEffectInterface.onPlayEffect_BigWinEffect(this, isHighWin, duration);
        this.switchMoneyBg(earnMoney);

        SlotManager.Instance.setMouseDragEventFlag(false);
        this.fnCallback = callback;
        this.dimmObject.active = true;

        this.playMainAni(winLv, duration);
        this.scheduleDelayEffect(duration);

        const startNumber = startNum === -1 ? 8 * totalBet : startNum;
        this.labelWinMoney.node.active = true;
        this.labelWinMoney.node.scale = 1;
        this.labelWinMoney.playChangeNumber(startNumber, earnMoney, null, duration);

        if (SlotManager.Instance.bigWinEffectInterface.isPlayPowerGemWinEffect(this, winLv, totalBet)) {
            this.winCoinsAnimation.node.setPosition(0, 20);
            // this.powerGemWinEffect.playPowerGemWinEffect_Step1(duration, earnMoney / totalBet);
        }

        SoundManager.Instance().setMainVolumeTemporarily(0.1);
        return duration;
    }

    // ===================== 【核心业务-播放大奖特效 重载3：无金额滚动】 =====================
    public playWinEffectWithoutIncreaseMoney(earnMoney: number, totalBet: number, callback: Function | null, skipFunc: Function | null = null, stopSymbolAni: boolean = true): void {
        if (stopSymbolAni) this.stopSymbolAni();
        SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
        this._isStartEndProcess = false;
        this.unscheduleAllCallbacks();
        this.node.stopAllActions();
        this.hideAllObject();
        this.node.active = true;

        this.skipFunc = skipFunc;
        this._earnMoney = earnMoney;
        this._totalBet = totalBet;
        this.winCoin.opacity = 0;

        let winLv = 0;
        this._isEpicWin = false;
        this._isOverBigWin = false;

        if (earnMoney < 5 * totalBet) { this.handleSmallWin(callback); return; }
        else if (earnMoney >= 10 * totalBet && earnMoney < 20 * totalBet) { this._isOverBigWin = true; winLv = 2; }
        else if (earnMoney >= 20 * totalBet && earnMoney < 30 * totalBet) { this._isOverBigWin = true; winLv = 3; }
        else if (earnMoney >= 30 * totalBet && earnMoney < 50 * totalBet) { this._isOverBigWin = true; winLv = 4; }
        else { this._isOverBigWin = true; this._isEpicWin = true; winLv = 5; }

        const isShareAble = this.checkShareAble(winLv);
        const isHighWin = [2, 3, 4, 5].includes(winLv);
        SlotManager.Instance.bigWinEffectInterface.onPlayEffect_BigWinEffect(this, isHighWin, 0);
        this.switchMoneyBg(earnMoney);

        SlotManager.Instance.setMouseDragEventFlag(false);
        this.fnCallback = callback;
        this.dimmObject.active = true;

        this.node.runAction(cc.callFunc(() => {
            SlotSoundController.Instance().playAudio("MegaWin", "FXLoop");
            SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");

            const { aniNode, bgAniName } = this.getWinAniConfig(winLv);
            this.txtAdd.opacity = 0;
            this.winCoin.scale = 0.9;
            this.winCoinAdd.opacity = 0;
            this.fxUnder.opacity = 0;

            this.bgAni.stop(); 
            this.bgAni.play(bgAniName); 
            this.bgAni.node.active = true;
            aniNode.stop(); 
            aniNode.play("Common_Win_Popup_Ani_Open_Txt"); 
            aniNode.node.active = true;
            this.textOverAni.stop(); 
            this.textOverAni.play("Common_Win_Popup_Ani_Open_Fx_Txt_Over"); 
            this.textOverAni.node.active = true;

            if (isShareAble) {
                this.instant_buttonAni.stop(); 
                this.instant_buttonAni.play("Common_Win_Popup_Ani_Open_Btn");
                this.instant_buttonAni.node.active = true; 
                this.buttonAni.node.active = false;
            } else {
                this.buttonAni.stop(); 
                this.buttonAni.play("Common_Win_Popup_Ani_Open_Btn");
                this.buttonAni.node.active = true; 
                this.instant_buttonAni.node.active = false;
            }

            this.btnSkip.interactable = true;
            this.instant_btnSkip.interactable = true;
            this.winCoinsAnimation.node.active = false;
            this.winCoinsAnimation.stop(); 
            this.winCoinsAnimation.play("Common_Win_Popup_WinCoins_Open");
            this.winCoinsAnimation.node.active = true; 
            this.winCoinsAnimation.node.setPosition(0, 0);

            this.commonFXAnimation.stop(); 
            this.commonFXAnimation.node.active = false;
            this.commonFXAnimation.play("Common_Win_Popup_Ani_Open");
        }));

        this.labelWinMoney.node.active = true;
        this.labelWinMoney.node.scale = 1;
        this.labelWinMoney.setNumber(earnMoney);

        if (SlotManager.Instance.bigWinEffectInterface.isPlayPowerGemWinEffect(this, winLv, totalBet)) {
            this.winCoinsAnimation.node.setPosition(0, 20);
            // this.powerGemWinEffect.playPowerGemWinEffect_Step1(0, earnMoney / totalBet, true);
        }

        SoundManager.Instance().setMainVolumeTemporarily(0.1);
        this.node.runAction(cc.sequence(
            cc.callFunc(() => this.playTextExplodeEffect()),
            cc.delayTime(2.17),
            cc.callFunc(() => this.activeBtnListener())
        ));
    }

    // ===================== 【核心动画逻辑】 =====================
    private getWinAniConfig(winLv: number): { aniNode: cc.Animation, bgAniName: string } {
        let aniNode: cc.Animation, bgAniName: string;
        switch (winLv) {
            case 1: aniNode = this.textAniSuperWin; bgAniName = "Common_Win_Popup_Ani_Open_Bg_Fx_Super"; break;
            case 2: aniNode = this.textAniBigWin; bgAniName = "Common_Win_Popup_Ani_Open_Bg_Fx_Big"; break;
            case 3: aniNode = this.textAniHugeWin; bgAniName = "Common_Win_Popup_Ani_Open_Bg_Fx_Huge"; break;
            case 4: aniNode = this.textAniMegaWin; bgAniName = "Common_Win_Popup_Ani_Open_Bg_Fx_Mega"; break;
            case 5: aniNode = this.textAniEpicWin; bgAniName = "Common_Win_Popup_Ani_Open_Bg_Fx_Epic"; break;
            default: aniNode = this.textAniSuperWin; bgAniName = "Common_Win_Popup_Ani_Open_Bg_Fx_Super"; break;
        }

        return { aniNode, bgAniName };
    }

    private playMainAni(winLv: number, duration: number): void {
        this.node.runAction(cc.callFunc(() => {
            SlotSoundController.Instance().playAudio("MegaWin", "FXLoop");
            SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");

            const { aniNode, bgAniName } = this.getWinAniConfig(winLv);
            // 文本淡入淡出动画
            this.txtAdd.opacity = 150;
            this.txtAdd.runAction(cc.sequence(cc.delayTime(0.5), cc.fadeTo(0.2, 0)));
            this.txtAdd.runAction(cc.sequence(cc.delayTime(1), cc.fadeTo(duration - 0.8, 150)));

            // 金币缩放动画
            this.winCoin.scale = 0.8;
            this.winCoin.runAction(cc.sequence(cc.delayTime(1), cc.scaleTo(duration - 0.85, 0.9)));

            // 额外金币文本动画
            this.winCoinAdd.opacity = 0;
            this.winCoinAdd.runAction(cc.sequence(
                cc.delayTime(1), cc.fadeTo(duration - 0.7, 50),
                cc.fadeTo(0.3, 150), cc.fadeTo(0.2, 100),
                cc.delayTime(2.4), cc.fadeTo(0.3, 0)
            ));

            // 底部光晕动画
            this.fxUnder.opacity = 0;
            this.fxUnder.runAction(cc.sequence(
                cc.delayTime(0.3), cc.fadeTo(0.1, 200), cc.fadeTo(0.2, 100),
                cc.delayTime(0.4), cc.fadeTo(duration - 0.8, 30),
                cc.fadeTo(0.2, 100), cc.fadeTo(0.3, 0)
            ));

            // 核心动画播放
            this.bgAni.stop(); 
            this.bgAni.play(bgAniName); 
            this.bgAni.node.active = true;
            aniNode.stop(); 
            aniNode.play("Common_Win_Popup_Ani_Open_Txt"); 
            aniNode.node.active = true;
            this.textOverAni.stop(); 
            this.textOverAni.play("Common_Win_Popup_Ani_Open_Fx_Txt_Over"); 
            this.textOverAni.node.active = true;

            // const isShareAble = this.checkShareAble(winLv);
            // if (isShareAble) {
            //     this.instant_buttonAni.stop(); 
            //     this.instant_buttonAni.play("Common_Win_Popup_Ani_Open_Btn");
            //     this.instant_buttonAni.node.active = true; 
            //     this.buttonAni.node.active = false;
            // } else {
            //     this.buttonAni.stop(); 
            //     this.buttonAni.play("Common_Win_Popup_Ani_Open_Btn");
            //     this.buttonAni.node.active = true; 
            //     this.instant_buttonAni.node.active = false;
            // }

            this.btnSkip.interactable = true;
            this.instant_btnSkip.interactable = true;
            this.winCoinsAnimation.node.active = false;
            this.winCoinsAnimation.stop(); 
            this.winCoinsAnimation.play("Common_Win_Popup_WinCoins_Open");
            this.winCoinsAnimation.node.active = true; 
            this.winCoinsAnimation.node.setPosition(0, 0);

            this.commonFXAnimation.stop(); 
            this.commonFXAnimation.node.active = false;
            this.commonFXAnimation.play("Common_Win_Popup_Ani_Open");
        }));
    }

    private scheduleDelayEffect(duration: number): void {
        this.node.runAction(cc.sequence(
            cc.delayTime(duration),
            cc.callFunc(() => this.playTextExplodeEffect()),
            cc.delayTime(2.17),
            cc.callFunc(() => this.activeBtnListener())
        ));
    }

    public playTextExplodeEffect(): void {
        const winLv = this.getWinLevel();
        const { aniNode } = this.getWinAniConfig(winLv);

        // 分享按钮显隐控制
        this.toggleShare.node.active = winLv !== 5 && !SlotManager.Instance.isFBShareDisableTarget();

        // 文本动画
        this.txtAdd.runAction(cc.sequence(
            cc.delayTime(0.2), cc.fadeTo(0.3, 255), cc.fadeTo(0.2, 150),
            cc.delayTime(0.4), cc.fadeTo(0.3, 200), cc.fadeTo(0.4, 0)
        ));

        // 核心爆炸动画
        this.bgAni.stop(); 
        this.bgAni.play("Common_Win_Popup_Ani_Burst_Bg_Fx");

        aniNode.stop(); 
        aniNode.play("Common_Win_Popup_Ani_Burst_Txt");
        this.textOverAni.stop(); 
        this.textOverAni.play("Common_Win_Popup_Ani_Burst_Fx_Txt_Over");

        // const isShareAble = this.checkShareAble(winLv);
        // if (isShareAble) {
        //     this.instant_buttonAni.stop(); this.instant_buttonAni.play("Common_Win_Popup_Ani_Burst_Btn");
        // } else {
        //     this.buttonAni.stop(); this.buttonAni.play("Common_Win_Popup_Ani_Burst_Btn");
        // }

        // 金币动画
        this.winCoinsAnimation.node.active = true;
        this.winCoinsAnimation.node.setPosition(0, 0);
        this.winCoinsAnimation.stop();
        this.scheduleOnce(() => {
            this.winCoinsAnimation.play("Common_Win_Popup_WinCoins_Burst");
            SlotManager.Instance.bigWinEffectInterface.onPlayTextExplodeEffect_WinCoins_Burst(this);
        }, 0.15);

        SlotManager.Instance.bigWinEffectInterface.onPlayTextExplodeEffect(this);
        this.commonFXAnimation.node.active = false;
        this.commonFXAnimation.stop(); 
        this.commonFXAnimation.play("Common_Win_Popup_Ani_Burst");
        this.commonFXAnimation.node.active = true;

        SlotSoundController.Instance().playAudio("BigWinTextAppear", "FX");

        // // 宝石特效
        // if (this.powerGemWinEffect.node.active) {
        //     this.scheduleOnce(() => this.powerGemWinEffect.playPowerGemWinEffect_Step2(), 0.5);
        // }
    }

    private getWinLevel(): number {
        const rate = this._earnMoney / this._totalBet;
        if (rate >= 5 && rate < 10) return 1;
        if (rate >= 10 && rate < 20) return 2;
        if (rate >= 20 && rate < 30) return 3;
        if (rate >= 30 && rate < 50) return 4;
        return 5;
    }

    public checkShareAble(winLv: number): boolean {
        return SlotManager.Instance.bigWinEffectInterface.checkShareAble_BigWinEffect(this, winLv) !== 0
            && [2, 3, 4].includes(winLv)
            && this._isEnableShareasync;
    }

    // ===================== 【按钮交互逻辑】 =====================
    public activeBtnListener(): void {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => this.playCollectAction(), 15);
        SlotManager.Instance.bigWinEffectInterface.onActiveBtnListener(this);

        this.btnCollect.interactable = true;
        this.instant_collect_Btn.interactable = true;
        this.instant_close_Btn.interactable = true;
    }

    public onClickShare(): void {
        this.onClickCollect(null, true);
    }

    public onClickCollect(e?: any, isShare: boolean = false): void {
        this.playCollectButtonAction(isShare);
    }

    public async playCollectButtonAction(isShare: boolean = false): Promise<void> {
        this.unscheduleAllCallbacks();
        this.btnCollect.interactable = false;
        this.instant_collect_Btn.interactable = false;
        this.instant_close_Btn.interactable = false;

        // // 宝石特效判断
        // if (this.powerGemWinEffect.node.active && !this.powerGemWinEffect.isStep2Complete && !this.powerGemWinEffect.isUpgradeAction && this.powerGemWinEffect.numTargetProgress >= 1) {
        //     this.powerGemWinEffect.setStep2Complete();
        //     await AsyncHelper.delayWithComponent(1, this);
        // }

        const winLv = this.getWinLevel();
        SlotManager.Instance.bigWinEffectInterface.onClickCollect_BigWinEffect(this, winLv, isShare, () => {
            this.playCollectAction();
        });
    }

    public onClickSkip(): void {
        this.btnSkip.interactable = false;
        this.btnSkip.node.active = false;
        this.instant_btnSkip.interactable = false;
        this.instant_btnSkip.node.active = false;

        this.node.stopAllActions();
        this.labelWinMoney.stopChangeNumber();
        this.labelWinMoney.setCurrentNumber(this._earnMoney);

        if (this.skipFunc) this.skipFunc();

        const act = cc.sequence(
            cc.callFunc(() => this.playTextExplodeEffect()),
            cc.delayTime(2.17),
            cc.callFunc(() => this.activeBtnListener())
        );
        this.node.runAction(act);

        // if (this.powerGemWinEffect.node.active) {
        //     this.powerGemWinEffect.setStep1Complete();
        // }
    }

    // ===================== 【奖励领取/金币爆炸逻辑】 =====================
    public async playCollectAction(): Promise<void> {
        const callback = this.fnCallback;
        PopupManager.Instance().setOpenPopupAllCloseCallback(() => {
            if (TSUtility.isValid(callback)) callback!();
        });

        SlotSoundController.Instance().stopAudio("MegaWin", "FXLoop");

        // 宝石奖励优先处理
        if (SlotManager.Instance.bigWinEffectInterface.isPowerGemRewarded(this) === 1) {
            this.hideAllObject();
            this.winExplodeCoin.node.active = false;
            SlotManager.Instance.applyGameResultMoneyBySubFromResult(this._earnMoney);
            await this.playPowerGem();
            await SlotManager.Instance.bigWinEffectInterface.onPlayPowerGemTutorial_GetPowerGem(this);
        } else {
            // 金币爆炸特效
            await this.playExplodeCoinEffect();
        }

        this.node.active = false;
        this.endProcess();
    }

    public async playExplodeCoinEffect(): Promise<void> {
        return new Promise(resolve => {
            if (!this._isPlayExplodeCoin) {
                this._isPlayExplodeCoin = true;
                resolve();
                return;
            }

            const targetNode = this.getCoinTargetNode();
            if (TSUtility.isValid(targetNode)) {
                const worldPos = targetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
                const localPos = this.winCoinCollectFx.parent.convertToNodeSpace(worldPos);
                this.winCoinCollectFx.setPosition(localPos);
            }

            const act = cc.sequence(
                cc.callFunc(() => {
                    this.hideAllObject();
                    this.winExplodeCoin.node.active = true;
                    this.dimmObject.active = false;
                    this.winExplodeCoin.stop();
                    this.winExplodeCoin.play();
                    SlotSoundController.Instance().playAudio("BigWin_CoinBurst", "FX");

                    this.scheduleOnce(() => SlotSoundController.Instance().playAudio("BigWin_CoinBurstMove", "FX"), 1.1);
                    this.scheduleOnce(() => this.winCoinCollectFx.active = true, 1.35);
                    this.scheduleOnce(() => this.winCoinCollectFx.active = false, 2.3);
                }),
                cc.delayTime(1.8),
                cc.callFunc(() => SlotManager.Instance.applyGameResultMoneyBySubFromResult(this._earnMoney)),
                cc.delayTime(1.2),
                cc.callFunc(() => resolve())
            );
            this.node.runAction(act);
        });
    }

    public async playPowerGem(): Promise<void> {
        if (SlotManager.Instance.bigWinEffectInterface.isPowerGemRewarded(this) === 0) return;
        await SlotManager.Instance.bigWinEffectInterface.onPlayPowerGem(this);
    }

    public getCoinTargetNode(): cc.Node {
        this.coinTargetNode = SlotManager.Instance.getBigWinCoinTarget();
        return this.coinTargetNode!;
    }

    // ===================== 【其他工具方法】 =====================
    public stopChildrenAni(e: cc.Node): void {
        const stack: cc.Node[] = [e];
        while (stack.length > 0) {
            const node = stack.pop()!;
            for (const child of node.children) stack.push(child);
            const ani = node.getComponent(cc.Animation);
            if (ani) ani.stop();
        }
    }

    public getBigWinShareInfo(): any {
        const info = SlotManager.Instance.makeBaseFacebookShareInfo();
        info.subInfo.st = "What a win!";
        info.subInfo.img = SlotManager.Instance.bannerImgNameBigwin;
        info.subInfo.tl = "First 5 clickers get 30,000 coins";
        info.desc = "Today is my lucky day. \nTap now and test your luck!";
        return info;
    }

    public getSuperWinShareInfo(): any {
        const info = SlotManager.Instance.makeBaseFacebookShareInfo();
        info.subInfo.st = "Super Win";
        info.subInfo.img = SlotManager.Instance.bannerImgNameSuperwin;
        info.subInfo.tl = "First 5 clickers get 30,000 coins";
        info.desc = "I knew the huge win was coming! \nClick now and try your luck!";
        return info;
    }

    public getMegaWinShareInfo(): any {
        const info = SlotManager.Instance.makeBaseFacebookShareInfo();
        info.subInfo.st = "Mega Win";
        info.subInfo.img = SlotManager.Instance.bannerImgNameMegawin;
        info.subInfo.tl = "First 5 clickers get 30,000 coins";
        info.subInfo.desc = "I just hit a Mega Win on this fun machine! \nTap here now and test it out yourself.";
        return info;
    }

    // ===================== 【屏幕适配】 =====================
    public onBeforeResizeView(): void { }
    public onResizeView(): void { }

    public onAfterResizeView(): void {
        this.onRefreshView();
    }

    public onRefreshView(): void {
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        const size = canvas.node.getContentSize();
        const center = new cc.Vec2(Math.floor(size.width / 2), Math.floor(size.height / 2));
        const singleWidth = size.width / this.blockingBG.length;

        this.blockingBG.forEach(node => {
            const pos = node.parent.convertToNodeSpaceAR(center);
            node.setPosition(node.x, pos.y);
            node.setContentSize(singleWidth + 20, size.height + 20);
        });

        const blockPos = this.nodeBlock.parent.convertToNodeSpaceAR(center);
        this.nodeBlock.setPosition(this.nodeBlock.x, blockPos.y);
        this.nodeBlock.setContentSize(size.width + 20, size.height + 20);
    }
}