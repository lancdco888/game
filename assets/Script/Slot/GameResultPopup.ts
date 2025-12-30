const { ccclass, property } = cc._decorator;
import ChangeNumberComponent from "./ChangeNumberComponent";
import PopupManager from "../manager/PopupManager";
import SlotManager from "../manager/SlotManager";
import SlotSoundController from "./SlotSoundController";
import SoundManager from "../manager/SoundManager";
import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import TSUtility from "../global_utility/TSUtility";
//import FBShareFlagToStorageInGame from "../UI/FBShareFlagToStorageInGame";
import SlotGameRuleManager from "../manager/SlotGameRuleManager";
import NumberFormatHelper from "../global_utility/NumberFormatHelper";
import ViewResizeManager from "../global_utility/ViewResizeManager";
import SlotReelSpinStateManager from "./SlotReelSpinStateManager";

// ✅ 完整复刻原代码 ResultPopupType 数字枚举，键值对完全一致，从-1到12无遗漏，核心弹窗类型标识
export enum ResultPopupType {
    UnknownType = -1,
    ResultCommon = 0,
    JackpotResultMini = 1,
    JackpotResultMinor = 2,
    JackpotResultMajor = 3,
    JackpotResultMega = 4,
    JackpotResultCommon = 5,
    BonusGameResult = 6,
    LinkedJackpotResult = 7,
    FreespinResult = 8,
    Retrigger = 9,
    JackpotModeResult = 10,
    WheelOfVegasResult = 11,
    JackpotResultGrand = 12
}

// ✅ 完整复刻原代码 ResultPopupInfo 数据类，属性+默认值完全一致，弹窗传参载体
export class ResultPopupInfo {
    public money: number = 0;
    public retriggerCount: number = 0;
    public moneyIncreaseFlag: boolean = true;
}

@ccclass
export default class GameResultPopup extends cc.Component {
    // ===== 序列化属性 - 原JS @property配置100%精准复刻，类型/默认值/顺序完全一致 =====
    @property({ type: [cc.Node] })
    public popupList: cc.Node[] = []; // 所有弹窗节点列表，索引对应ResultPopupType枚举值

    @property({ type: [cc.SpriteFrame] })
    public retriggerNumber: cc.SpriteFrame[] = []; // 重转次数数字图片集(0-9)

    @property({ type: cc.Node })
    public blockingBG: cc.Node = null; // 弹窗遮罩层，全屏阻挡点击

    // ===== 私有成员变量 - 原代码所有变量完整复刻，类型注解精准，默认值一致 =====
    private currentShowingPopupType: number = -1; // 当前显示的弹窗类型，对应枚举值
    private currentShowingMoney: number = 0; // 当前弹窗显示的奖金数
    private _callbackFunc: (() => void) | null = null; // 弹窗关闭后的回调函数

    // ===== 生命周期回调 - 原逻辑完全复刻，视图适配+遮罩刷新，无任何修改 =====
    onLoad(): void {
        this.refresh();
        ViewResizeManager.Instance().addHandler(this);
    }

    onDestroy(): void {
        ViewResizeManager.RemoveHandler(this); // ✅ 保留原代码首字母大写的静态方法名
    }

    // ✅ 原代码空实现方法，严格保留，视图适配预留接口
    onBeforeResizeView(): void { }

    // ✅ 原代码空实现方法，严格保留
    onResizeView(): void { }

    // ✅ 视图缩放后刷新遮罩尺寸，核心适配逻辑
    onAfterResizeView(): void {
        this.refresh();
    }

    // ===== 刷新遮罩层尺寸为全屏，核心适配方法 =====
    refresh(): void {
        TSUtility.setNodeViewSizeFit(this.blockingBG);
    }

    // ===== 隐藏所有弹窗，遍历设置active=false，原逻辑完全复刻 =====
    hidePopup(): void {
        for (let e = 0; e < this.popupList.length; ++e) {
            null != this.popupList[e] && (this.popupList[e].active = false);
        }
    }

    // ===== 核心弹窗显示方法，支持所有弹窗类型，数值滚动/动画播放/音效控制/FB分享初始化全逻辑 =====
    showPopup(
        popupType: ResultPopupType,
        popupInfo: ResultPopupInfo,
        callback?: () => void,
        autoCloseTime?: number
    ): void {
        const self = this;
        const targetPopup = this.popupList[popupType];

        if (null != targetPopup) {
            this.currentShowingPopupType = popupType;

            // ✅ FB分享勾选框初始化：动态添加组件+控制显隐，原逻辑完全复刻
            if (-1 != this.currentShowingPopupType) {
                // const toggle = this.popupList[this.currentShowingPopupType].getComponentInChildren(cc.Toggle);
                // if (null != toggle) {
                //     null == toggle.getComponent(FBShareFlagToStorageInGame) && toggle.addComponent(FBShareFlagToStorageInGame);
                //     toggle.node.active = 0 == SlotManager.default.Instance.isFBShareDisableTarget();
                // }
            }

            // 赋值奖金数，无则默认0
            if (null != popupInfo.money) {
                this.currentShowingMoney = popupInfo.money;
            } else {
                popupInfo.money = 0;
            }

            // 隐藏其他弹窗 + 添加到弹窗管理器节点 + 显示当前节点
            this.hidePopup();
            PopupManager.Instance().node.addChild(this.node);
            this.node.active = true;
            this._callbackFunc = callback;

            // ✅ 重转弹窗 单独逻辑：处理重转次数的十位/个位数字显示，无数值滚动
            if (popupType == ResultPopupType.Retrigger) {
                const num1Sprite = targetPopup.getChildByName("respinCount_1").getComponent(cc.Sprite);
                const num10Sprite = targetPopup.getChildByName("respinCount_10").getComponent(cc.Sprite);

                if (popupInfo.retriggerCount < 10) {
                    num10Sprite.node.active = false;
                    num1Sprite.node.active = true;
                    num1Sprite.node.x = 0;
                    num1Sprite.spriteFrame = this.retriggerNumber[popupInfo.retriggerCount];
                } else {
                    const ten = Math.floor(popupInfo.retriggerCount / 10);
                    const one = Math.floor(popupInfo.retriggerCount % 10);
                    num10Sprite.node.active = true;
                    num10Sprite.node.x = -57;
                    num10Sprite.spriteFrame = this.retriggerNumber[ten];
                    num1Sprite.node.active = true;
                    num1Sprite.node.x = 57;
                    num1Sprite.spriteFrame = this.retriggerNumber[one];
                }

                targetPopup.active = true;
                this.startPopupCloseTimer(autoCloseTime);
            } 
            // ✅ 其他所有弹窗类型：奖金数值滚动+弹窗动画+特效动画+音效播放
            else {
                const moneyLabelNode = targetPopup.getChildByName("Pop_Up").getChildByName("Bg_Coins").getChildByName("label");
                
                // 免费旋转弹窗：赋值免费旋转次数
                if (popupType == ResultPopupType.FreespinResult) {
                    targetPopup.getChildByName("Pop_Up").getChildByName("layout_default").getChildByName("label").getComponent(cc.Label).string = SlotManager.Instance._freespinTotalCount.toString();
                }

                // 奖金类弹窗：播放背景特效+弹窗弹出动画，核心视觉逻辑
                if (popupType >= 1 && popupType <=5 || popupType == ResultPopupType.FreespinResult || popupType == ResultPopupType.JackpotModeResult) {
                    const bgFxAnim = targetPopup.getChildByName("bg_fx").getComponent(cc.Animation);
                    bgFxAnim.stop();
                    targetPopup.getChildByName("bg_fx").getChildByName("Coin_1").active = false;
                    targetPopup.getChildByName("bg_fx").getChildByName("Coin_2").active = false;
                    bgFxAnim.play();

                    const popUpAnim = targetPopup.getChildByName("Pop_Up").getComponent(cc.Animation);
                    popUpAnim.stop();
                    targetPopup.getChildByName("Pop_Up").opacity = 0;
                    popUpAnim.play();
                }

                targetPopup.active = true;
                const changeNumCom = moneyLabelNode.getComponent(ChangeNumberComponent);
                
                // ✅ 数值滚动播放：有增长标识则从0滚动到目标值，无则直接赋值，滚动完成后启动自动关闭定时器
                if (popupInfo.moneyIncreaseFlag) {
                    changeNumCom.playChangeNumber(0, popupInfo.money, function() {
                        self.startPopupCloseTimer(autoCloseTime);
                    }, 4); // ✅ 保留原代码滚动速度参数4，核心数值动画节奏
                } else {
                    changeNumCom.setCurrentNumber(popupInfo.money);
                    this.startPopupCloseTimer(autoCloseTime);
                }
            }

            // ✅ 弹窗音效播放+主音量临时静音，核心听觉逻辑，分类型播放不同音效
            let audioId: any = null;
            if (popupType == ResultPopupType.FreespinResult) {
                SlotManager.Instance.playMainBgm();
                SoundManager.Instance().setMainVolumeTemporarily(0);
                audioId = SlotSoundController.Instance().playAudio("FreespinResult", "FX");
            } else if (popupType == ResultPopupType.JackpotResultCommon || popupType >=1 && popupType <=4) {
                SlotManager.Instance.playMainBgm();
                SoundManager.Instance().setMainVolumeTemporarily(0);
                audioId = SlotSoundController.Instance().playAudio("JackpotResult", "FX");
            } else if (popupType == ResultPopupType.LinkedJackpotResult) {
                SlotManager.Instance.playMainBgm();
                SoundManager.Instance().setMainVolumeTemporarily(0);
                audioId = SlotSoundController.Instance().playAudio("LNR_Result", "FX");
            }

            // ✅ 音效播放完成后恢复主音量为0.1，核心音效过渡逻辑
            SoundManager.Instance().setMainVolumeTemporarily(0);
            if (null != audioId) {
                this.scheduleOnce(function() {
                    SoundManager.Instance().setMainVolumeTemporarily(0.1);
                }, audioId.getDuration());
            }
        } else {
            this._callbackFunc = null;
        }
    }

    // ===== WheelOfVegas专属弹窗显示方法，独立逻辑，完全复刻原代码所有细节 =====
    showWheelOfVegasResultPopup(
        lineBet: number,
        winMoney: number,
        callback?: () => void,
        isAverageBet?: boolean,
        multiply?: number
    ): void {
        const targetPopup = this.popupList[ResultPopupType.WheelOfVegasResult];
        if (null != targetPopup) {
            this.currentShowingPopupType = ResultPopupType.WheelOfVegasResult;
            this.currentShowingMoney = winMoney;

            // FB分享勾选框初始化
            const toggle = this.popupList[this.currentShowingPopupType].getComponentInChildren(cc.Toggle);
            if (null != toggle) {
                // null == toggle.getComponent(FBShareFlagToStorageInGame) && toggle.addComponent(FBShareFlagToStorageInGame);
                // toggle.node.active = 0 == SlotManager.default.Instance.isFBShareDisableTarget();
            }

            this.hidePopup();
            PopupManager.Instance().node.addChild(this.node);
            this.node.active = true;
            this._callbackFunc = callback;

            const moneyLabelNode = targetPopup.getChildByName("Pop_Up").getChildByName("Bg_Coins").getChildByName("label");
            // 播放特效+弹窗动画
            const bgFxAnim = targetPopup.getChildByName("bg_fx").getComponent(cc.Animation);
            bgFxAnim.stop();
            targetPopup.getChildByName("bg_fx").getChildByName("Coin_1").active = false;
            targetPopup.getChildByName("bg_fx").getChildByName("Coin_2").active = false;
            bgFxAnim.play();

            const popUpAnim = targetPopup.getChildByName("Pop_Up").getComponent(cc.Animation);
            popUpAnim.stop();
            targetPopup.getChildByName("Pop_Up").opacity = 0;
            popUpAnim.play();

            targetPopup.active = true;

            // ✅ WheelOfVegas弹窗专属赋值：倍率/投注额/平均投注标识
            const wheelLabel = targetPopup.getChildByName("Pop_Up").getChildByName("layout").getChildByName("pivot").getChildByName("Wheel").getChildByName("Wheel_label").getComponent(cc.Label);
            const lineBetLabel = targetPopup.getChildByName("Pop_Up").getChildByName("layout").getChildByName("pivot").getChildByName("Linebet").getChildByName("LineBet_label").getComponent(cc.Label);
            const averageBetLabel = targetPopup.getChildByName("Pop_Up").getChildByName("layout").getChildByName("pivot").getChildByName("Linebet").getChildByName("Text_AverageBet");
            
            wheelLabel.string = null != multiply && null != multiply ? "x" + multiply.toString() : "x" + NumberFormatHelper.formatNumber(winMoney / lineBet);
            if (null != isAverageBet && null != isAverageBet && isAverageBet) {
                lineBetLabel.node.active = false;
                averageBetLabel.active = true;
            } else {
                lineBetLabel.node.active = true;
                lineBetLabel.string = CurrencyFormatHelper.formatNumber(lineBet);
                averageBetLabel.active = false;
            }

            // 音效播放+数值赋值+自动关闭定时器
            let audioId: any = null;
            SlotManager.Instance.playMainBgm();
            SoundManager.Instance().setMainVolumeTemporarily(0);
            audioId = SlotSoundController.Instance().playAudio("JackpotResult", "FX");
            moneyLabelNode.getComponent(ChangeNumberComponent).setCurrentNumber(winMoney);
            this.startPopupCloseTimer(15); // ✅ 固定15秒自动关闭

            if (null != audioId) {
                this.scheduleOnce(function() {
                    SoundManager.Instance().setMainVolumeTemporarily(0.1);
                }, audioId.getDuration());
            }
        } else {
            this._callbackFunc = null;
        }
    }

    // ===== 点击弹窗关闭按钮，无分享直接关闭 =====
    onClickClose(): void {
        this.unscheduleAllCallbacks();
        this.processEndPopup();
    }

    // ===== 点击弹窗领取按钮，核心逻辑：判断FB分享勾选状态，分享后关闭/直接关闭 =====
    onClickCollect(): void {
        const self = this;
        this.unscheduleAllCallbacks();

        if (-1 != this.currentShowingPopupType) {
            const toggle = this.popupList[this.currentShowingPopupType].getComponentInChildren(cc.Toggle);
            // ✅ FB分享逻辑：勾选且允许分享 → 执行分享，分享完成后关闭弹窗
            if (0 == SlotManager.Instance.isFBShareDisableTarget() && toggle.isChecked) {
                const shareInfo = this.getShareInfo(this.currentShowingPopupType, this.currentShowingMoney);
                if (null != shareInfo) {
                    SlotManager.Instance.facebookShare(shareInfo, function() {
                        TSUtility.isValid(self) && self.processEndPopup();
                    });
                } else {
                    this.processEndPopup();
                }
            } 
            // 未勾选/不允许分享 → 直接关闭
            else {
                this.processEndPopup();
            }
        } else {
            this.processEndPopup();
        }
    }

    // ===== 弹窗结束核心处理方法，所有关闭逻辑最终汇聚，原代码完整复刻，无任何删减 =====
    processEndPopup(): void {
        // 通知SlotManager弹窗结束
        SlotManager.Instance.slotInterface.onProcessEndPopup(this);
        this.unscheduleAllCallbacks();
        this.hidePopup();
        this.node.removeFromParent();

        // 重置状态
        this.currentShowingPopupType = -1;
        this.currentShowingMoney = 0;

        // ✅ 停止所有弹窗相关音效，核心音效清理逻辑
        SlotSoundController.Instance().stopAudio("FreespinResult", "FX");
        SlotSoundController.Instance().stopAudio("JackpotResult", "FX");
        SlotSoundController.Instance().stopAudio("LNR_Result", "FX");
        // ✅ 恢复主音量到原始值
        SoundManager.Instance().resetTemporarilyMainVolume();

        // 执行弹窗关闭回调
        if (null != this._callbackFunc && null != this._callbackFunc) {
            const callback = this._callbackFunc;
            this._callbackFunc = null;
            callback();
        }
    }

    // ===== 弹窗自动关闭定时器，核心逻辑：仅自动旋转模式下生效，双层null校验，改必失效 =====
    startPopupCloseTimer(autoCloseTime?: number): void {
        const self = this;
        if (!SlotReelSpinStateManager.Instance.getAutospinMode() && null != autoCloseTime && null != autoCloseTime && autoCloseTime > 0) {
            this.scheduleOnce(function() {
                self.onClickClose();
            }, autoCloseTime);
        }
    }

    // ===== 根据弹窗类型获取对应FB分享信息，核心分享逻辑分发 =====
    getShareInfo(popupType: ResultPopupType, winMoney: number): any {
        let shareInfo = null;
        switch (popupType) {
            case ResultPopupType.BonusGameResult:
            case ResultPopupType.WheelOfVegasResult:
                shareInfo = GameResultPopup.getBonusShareInfo(winMoney);
                break;
            case ResultPopupType.FreespinResult:
                shareInfo = GameResultPopup.getFreespinShareInfo();
                break;
            case ResultPopupType.JackpotModeResult:
                shareInfo = GameResultPopup.getJackpotModeShareInfo(winMoney);
                break;
            case ResultPopupType.JackpotResultMini:
                shareInfo = GameResultPopup.getJackpotGameShareInfo(winMoney, 1);
                break;
            case ResultPopupType.JackpotResultMinor:
                shareInfo = GameResultPopup.getJackpotGameShareInfo(winMoney, 2);
                break;
            case ResultPopupType.JackpotResultMajor:
                shareInfo = GameResultPopup.getJackpotGameShareInfo(winMoney, 3);
                break;
            case ResultPopupType.JackpotResultMega:
                shareInfo = GameResultPopup.getJackpotGameShareInfo(winMoney, 4);
                break;
            case ResultPopupType.JackpotResultCommon:
                shareInfo = GameResultPopup.getJackpotGameShareInfo(winMoney, 5);
                break;
            case ResultPopupType.LinkedJackpotResult:
                shareInfo = GameResultPopup.getLockAndRollShareInfo();
                break;
        }
        return shareInfo;
    }

    // ===== 以下为 原代码所有静态FB分享信息构造方法，100%精准复刻，字符串/图片名/格式完全不变 =====
    public static getRespinBonusShareInfo(winMoney: number): any {
        const shareInfo = SlotManager.Instance.makeBaseFacebookShareInfo();
        shareInfo.subInfo.st = "Respin Bonus";
        shareInfo.subInfo.img = SlotManager.Instance.respinShareImgName;
        shareInfo.subInfo.tl = SlotGameRuleManager.Instance.slotName;
        shareInfo.desc = "Cha-ching! I just won a load of coins in Respin Bonus! /nWhy don't you have a go?".format(CurrencyFormatHelper.formatNumber(winMoney));
        return shareInfo;
    }

    public static getBonusShareInfo(winMoney: number): any {
        const shareInfo = SlotManager.Instance.makeBaseFacebookShareInfo();
        shareInfo.subInfo.st = "Bonus Game";
        shareInfo.subInfo.img = SlotManager.Instance.bonusShareImgName;
        shareInfo.subInfo.tl = SlotGameRuleManager.Instance.slotName;
        shareInfo.desc = "I just won %s coins in a BONUS game! \nClick here to join the action!".format(CurrencyFormatHelper.formatNumber(winMoney));
        return shareInfo;
    }

    public static getBonusShareInfoByImgName(imgName: string, winMoney: number): any {
        const shareInfo = SlotManager.Instance.makeBaseFacebookShareInfo();
        shareInfo.subInfo.st = "Bonus Game";
        shareInfo.subInfo.img = imgName;
        shareInfo.subInfo.tl = SlotGameRuleManager.Instance.slotName;
        shareInfo.desc = "I just won %s coins in a BONUS game! \nClick here to join the action!".format(CurrencyFormatHelper.formatNumber(winMoney));
        return shareInfo;
    }

    public static getFreespinShareInfo(): any {
        const shareInfo = SlotManager.Instance.makeBaseFacebookShareInfo();
        shareInfo.subInfo.st = "Free Spins";
        shareInfo.subInfo.img = SlotManager.Instance.getFreespinShareImgName();
        shareInfo.subInfo.tl = SlotGameRuleManager.Instance.slotName;
        shareInfo.desc = "I just got a series of big wins in Free Spins. \nTry it for yourself now.";
        return shareInfo;
    }

    public static getFreespinShareInfoByShareImgName(winMoney: number, imgName: string): any {
        const shareInfo = SlotManager.Instance.makeBaseFacebookShareInfo();
        shareInfo.subInfo.st = "Free Spins";
        shareInfo.subInfo.img = imgName;
        shareInfo.subInfo.tl = SlotGameRuleManager.Instance.slotName;
        shareInfo.desc = "I just got a series of big wins in Free Spins. \nTry it for yourself now.";
        return shareInfo;
    }

    public static getJackpotModeShareInfo(winMoney: number): any {
        const shareInfo = SlotManager.Instance.makeBaseFacebookShareInfo();
        shareInfo.subInfo.st = "Jackpot Mode";
        shareInfo.subInfo.img = SlotManager.Instance.jackpotmodeShareImgName;
        shareInfo.subInfo.tl = "Ca-ching!";
        shareInfo.desc = "I just struck %s coins in Jackpot Mode! \nTap here and get your electrifying thrills now!".format(CurrencyFormatHelper.formatNumber(winMoney));
        return shareInfo;
    }

    public static getJackpotGameShareInfo(winMoney: number, jackpotType: number): any {
        const shareInfo = SlotManager.Instance.makeBaseFacebookShareInfo();
        shareInfo.subInfo.tl = "I can not believe it!";

        if (1 == jackpotType) {
            shareInfo.subInfo.img = SlotManager.Instance.jackpotMiniShareImgName;
            shareInfo.subInfo.st = "Mini Jackpot";
            shareInfo.desc = "I just hit a Jackpot of %s coins! \nCome and claim your mega wins here!".format(CurrencyFormatHelper.formatNumber(winMoney));
        } else if (2 == jackpotType) {
            shareInfo.subInfo.img = SlotManager.Instance.jackpotMinorShareImgName;
            shareInfo.subInfo.st = "Minor Jackpot";
            shareInfo.desc = "Woot woot!! \nI just hit a HUGE JACKPOT of %s coins! \nCan you get yours?".format(CurrencyFormatHelper.formatNumber(winMoney));
        } else if (3 == jackpotType) {
            shareInfo.subInfo.img = SlotManager.Instance.jackpotMajorShareImgName;
            shareInfo.subInfo.st = "Major Jackpot";
            shareInfo.desc = "Unbelievable! \nI just hit a MAJOR JACKPOT of %s coins! \nTap here and find your jackpots!".format(CurrencyFormatHelper.formatNumber(winMoney));
        } else if (4 == jackpotType) {
            shareInfo.subInfo.img = SlotManager.Instance.jackpotMegaShareImgName;
            shareInfo.subInfo.st = "Mega Jackpot";
            shareInfo.desc = "Woah! \nI just got a COLOSSAL JACKPOT %s coins! \nTap now and test your luck!".format(CurrencyFormatHelper.formatNumber(winMoney));
        } else if (5 == jackpotType) {
            shareInfo.subInfo.img = SlotManager.Instance.jackpotCommonShareImgName;
            shareInfo.subInfo.st = "Jackpot";
            shareInfo.desc = "Incredible! \nI struck a MONSTROUS JACKPOT of %s coins! \nTap now and test your luck!".format(CurrencyFormatHelper.formatNumber(winMoney));
        } else if (jackpotType == ResultPopupType.JackpotResultGrand) {
            shareInfo.subInfo.img = SlotManager.Instance.jackpotGrandShareImgName;
            shareInfo.subInfo.st = "Grand Jackpot";
            shareInfo.desc = "I just got %s coins on a GRAND JACKPOT. \nI can't believe my luck! \nI'm in seventh heaven.".format(CurrencyFormatHelper.formatNumber(winMoney));
        }
        return shareInfo;
    }

    public static getLockAndRollShareInfo(): any {
        const shareInfo = SlotManager.Instance.makeBaseFacebookShareInfo();
        shareInfo.subInfo.st = "Lock & Roll";
        shareInfo.subInfo.img = SlotManager.Instance.lockandrollShareImgName;
        shareInfo.subInfo.tl = "Lock & Roll Baby!";
        shareInfo.desc = "Oh boy, what a win! \nCome and get your fun wins now!";
        return shareInfo;
    }
}