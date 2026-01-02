const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import DialogBase, { DialogState } from "../DialogBase";
import HeroMainPopup from "../Hero/HeroMainPopup";
import PopupManager from "../manager/PopupManager";
import ServiceInfoManager from "../ServiceInfoManager";
import GameCommonSound from "../GameCommonSound";
import AsyncHelper from "../global_utility/AsyncHelper";
import MessageRoutingManager from "../message/MessageRoutingManager";
import TSUtility from "../global_utility/TSUtility";
import TimeFormatHelper from "../global_utility/TimeFormatHelper";
import CenturionCliqueInfoBigBox from "./CenturionCliqueInfoBigBox";
import CenturionCliqueManager from "../manager/CenturionCliqueManager";
import UnlockContentsManager, { UnlockContentsType } from "../manager/UnlockContentsManager";

@ccclass
export default class CenturionCliqueMainPopup extends DialogBase {
    // ===================== 序列化绑定节点属性 原数据完整保留 类型精准匹配 =====================
    @property(cc.Animation)
    private pivotAni: cc.Animation = null;

    @property(cc.Node)
    private rootRemainTime: cc.Node = null;

    @property(cc.Label)
    private labelRemainTime: cc.Label = null;

    @property(cc.Button)
    private btnGoSpin: cc.Button = null;

    @property(cc.Button)
    private btnGoToHeroes: cc.Button = null;

    @property(cc.Node)
    private rootSmallBox: cc.Node = null;

    @property(CenturionCliqueInfoBigBox)
    private rootBigBox: CenturionCliqueInfoBigBox = null;

    @property(cc.Node)
    private rootCharacter: cc.Node = null;

    @property(cc.Node)
    private rootGauge: cc.Node = null;

    @property(cc.Node)
    private rootBalloon: cc.Node = null;

    @property(cc.Node)
    private rootTutorialCharacter: cc.Node = null;

    @property(cc.Node)
    private rootTutorialBalloon: cc.Node = null;

    @property(cc.Node)
    private rootTutorialGauge: cc.Node = null;

    @property(cc.Node)
    private rootTutorialSmallBox: cc.Node = null;

    @property([cc.Button])
    private listBenefit_0: cc.Button[] = [];

    @property([cc.Button])
    private listBenefit_1: cc.Button[] = [];

    @property([cc.Button])
    private listBenefit_2: cc.Button[] = [];

    @property(cc.Node)
    private tooltipTutorial_01: cc.Node = null;

    @property(cc.Node)
    private tooltipTutorial_02: cc.Node = null;

    @property(cc.Node)
    private tooltipTutorial_03: cc.Node = null;

    @property(cc.Node)
    private eventBlocker: cc.Node = null;

    @property(cc.Node)
    private dimmedNodeForTutorial: cc.Node = null;

    // ===================== 生命周期 - 弹窗加载初始化 原逻辑完整保留 =====================
    public onLoad(): void {
        this.initDailogBase();
        this.rootSmallBox.active = true;
        this.rootBigBox.hide();
        this.setRemainTimeSchedular();

        const canvasNode = cc.director.getScene().getComponentInChildren(cc.Canvas);
        this.blockingBG.setContentSize(canvasNode.node.getContentSize());
        this.eventBlocker.setContentSize(canvasNode.node.getContentSize());
        this.dimmedNodeForTutorial.setContentSize(canvasNode.node.getContentSize());

        this.setInteractableButtons(false);
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.REFRESH_CENTURION_CLIQUE, this.onReceiveRefreshCenturionClique, this);
    }

    // ===================== 按钮交互总控 - 批量启用/禁用所有按钮 事件绑定/解绑 =====================
    private setInteractableButtons(isInteractable: boolean): void {
        this.setInteractableButtonClose(isInteractable);
        this.setInteractableButtonList(isInteractable);
        this.setInteractableButtonGoSpin(isInteractable);
        this.setInteractableButtonGoToHeroes(isInteractable);
    }

    private setInteractableButtonClose(isInteractable: boolean): void {
        this.closeBtn.interactable = isInteractable;
    }

    private setInteractableButtonGoSpin(isInteractable: boolean): void {
        this.btnGoSpin.interactable = isInteractable;
        if (isInteractable) {
            this.btnGoSpin.node.on(cc.Node.EventType.TOUCH_END, this.onTouchGoSpin, this);
        } else {
            this.btnGoSpin.node.off(cc.Node.EventType.TOUCH_END, this.onTouchGoSpin, this);
        }
    }

    private setInteractableButtonGoToHeroes(isInteractable: boolean): void {
        this.btnGoToHeroes.interactable = isInteractable;
        if (isInteractable) {
            if (ServiceInfoManager.instance.getUserLevel() >= UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.HERO)) {
                this.btnGoToHeroes.node.on(cc.Node.EventType.TOUCH_END, this.onTouchGoToHeroes, this);
            }
        } else {
            this.btnGoToHeroes.node.off(cc.Node.EventType.TOUCH_END, this.onTouchGoToHeroes, this);
        }
    }

    private setInteractableButtonList(isInteractable: boolean): void {
        this.listBenefit_0.forEach(btn => btn.interactable = isInteractable);
        this.listBenefit_1.forEach(btn => btn.interactable = isInteractable);
        this.listBenefit_2.forEach(btn => btn.interactable = isInteractable);

        const self = this;
        if (isInteractable) {
            this.listBenefit_0.forEach(btn => btn.node.on(cc.Node.EventType.TOUCH_END, self.onTouchBenefit_0, self));
            this.listBenefit_1.forEach(btn => btn.node.on(cc.Node.EventType.TOUCH_END, self.onTouchBenefit_1, self));
            this.listBenefit_2.forEach(btn => btn.node.on(cc.Node.EventType.TOUCH_END, self.onTouchBenefit_2, self));
        } else {
            this.listBenefit_0.forEach(btn => btn.node.off(cc.Node.EventType.TOUCH_END, self.onTouchBenefit_0, self));
            this.listBenefit_1.forEach(btn => btn.node.off(cc.Node.EventType.TOUCH_END, self.onTouchBenefit_1, self));
            this.listBenefit_2.forEach(btn => btn.node.off(cc.Node.EventType.TOUCH_END, self.onTouchBenefit_2, self));
        }
    }

    // ===================== 静态核心方法 - 加载弹窗预制体 异常上报+进度显示 逻辑完全一致 =====================
    public static getPopup(callback: Function): void {
        const popupPath: string = "Service/01_Content/CenturionClique/CenturionClique_Main";
        if (callback != null) {
            PopupManager.Instance().showDisplayProgress(true);
        }

        cc.loader.loadRes(popupPath, (error, prefab) => {
            if (callback != null) {
                PopupManager.Instance().showDisplayProgress(false);
            }

            if (error) {
                const loadError = new Error(`cc.loader.loadRes fail ${popupPath}: ${JSON.stringify(error)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, loadError));
                if (callback) callback(error, null);
                return;
            }

            if (callback) {
                const popupNode = cc.instantiate(prefab);
                const popupComp = popupNode.getComponent(CenturionCliqueMainPopup);
                popupNode.active = false;
                callback(null, popupComp);
            }
        });
    }

    // ===================== 弹窗开启动画 - 分权益激活/未激活两套动画 精准保留延迟时间 =====================
    private playOpenAnimation(): void {
        const self = this;
        let aniName: string = "";
        if (CenturionCliqueManager.Instance().isActiveCenturionClique()) {
            aniName = "Popup_Open";
            this.btnGoToHeroes.node.active = true;
            this.node.runAction(cc.sequence(cc.delayTime(2.5), cc.callFunc(() => {
                self.setInteractableButtonGoSpin(true);
                self.setInteractableButtonGoToHeroes(true);
            })));
            this.node.runAction(cc.sequence(cc.delayTime(2.83), cc.callFunc(() => {
                self.setInteractableButtonClose(true);
            })));
        } else {
            aniName = "Popup_Open_non";
            this.btnGoToHeroes.node.active = false;
            this.node.runAction(cc.sequence(cc.delayTime(1.83), cc.callFunc(() => {
                self.setInteractableButtonGoSpin(true);
                self.setInteractableButtonGoToHeroes(true);
            })));
            this.node.runAction(cc.sequence(cc.delayTime(2.33), cc.callFunc(() => {
                self.setInteractableButtonClose(true);
            })));
        }

        this.pivotAni.play(aniName);
        this.pivotAni.once("finished", () => {
            self.setInteractableButtonList(true);
        });
    }

    // ===================== 弹窗打开主逻辑 入口方法 =====================
    public openPopup(): CenturionCliqueMainPopup {
        GameCommonSound.playFxOnce("pop_etc");
        super._open(cc.fadeIn(0.3));
        this.playOpenAnimation();
        
        if (CenturionCliqueManager.Instance().isShowTutorial()) {
            this.startTutorial();
        }
        return this;
    }

    // ===================== 弹窗关闭逻辑 =====================
    public close(): void {
        if (this.isStateClose()) return;
        this.setState(DialogState.Close);
        this._close(null);
    }

    // ===================== 福利按钮点击事件 小盒子/大盒子切换逻辑 =====================
    private onTouchBenefit_0(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.rootSmallBox.active = false;
        this.rootBigBox.show(0, () => {
            this.rootSmallBox.active = true;
        });
    }

    private onTouchBenefit_1(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.rootSmallBox.active = false;
        this.rootBigBox.show(1, () => {
            this.rootSmallBox.active = true;
        });
    }

    private onTouchBenefit_2(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.rootSmallBox.active = false;
        this.rootBigBox.show(2, () => {
            this.rootSmallBox.active = true;
        });
    }

    // ===================== 快捷按钮点击事件 =====================
    private onTouchGoSpin(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.close();
    }

    private onTouchGoToHeroes(): void {
        GameCommonSound.playFxOnce("btn_etc");
        const self = this;
        HeroMainPopup.getPopup((error, popup) => {
            if (!error) {
                popup.open(HeroMainPopup.TypeHeroSubPopup.none);
                self.close();
            }
        });
    }

    // ===================== 剩余时间定时器 每秒刷新 过期自动销毁 =====================
    private setRemainTimeSchedular(): void {
        this.schedularRemainTime();
        this.schedule(this.schedularRemainTime.bind(this), 1);
    }

    private removeRemainTimeSchedular(): void {
        this.unscheduleAllCallbacks();
    }

    private schedularRemainTime(): void {
        const remainTime = CenturionCliqueManager.Instance().getRemainTimeCenturionClique();
        this.setRemainTime(remainTime);
    }

    private setRemainTime(remainTime: number): void {
        if (remainTime <= 0) {
            this.rootRemainTime.active = false;
            this.removeRemainTimeSchedular();
            return;
        }
        this.rootRemainTime.active = true;
        this.labelRemainTime.string = TimeFormatHelper.getTimeStringDayBaseHourFormatBig(remainTime);
    }

    // ===================== 核心异步教程逻辑 完整保留三步教程+Promise封装+双重触发 =====================
    private async startTutorial(): Promise<void> {
        this.eventBlocker.active = true;
        CenturionCliqueManager.Instance().setFlagShowTutorial();
        
        await AsyncHelper.delay(2.5);
        await this.playTutorial_01();
        await this.playTutorial_02();
        await this.playTutorial_03();
        
        this.endTutorial();
    }

    private showTutorial_01(): void {
        this.tooltipTutorial_01.active = true;
        this.tooltipTutorial_02.active = false;
        this.tooltipTutorial_03.active = false;
        this.eventBlocker.active = true;
        this.dimmedNodeForTutorial.active = true;

        while (this.rootCharacter.childrenCount > 0) {
            TSUtility.moveToNewParent(this.rootCharacter.children[0], this.rootTutorialCharacter);
        }
    }

    private showTutorial_02(): void {
        this.tooltipTutorial_01.active = false;
        this.tooltipTutorial_02.active = true;
        this.tooltipTutorial_03.active = false;
        this.eventBlocker.active = true;
        this.dimmedNodeForTutorial.active = true;

        while (this.rootTutorialCharacter.childrenCount > 0) {
            TSUtility.moveToNewParent(this.rootTutorialCharacter.children[0], this.rootCharacter);
        }
        while (this.rootGauge.childrenCount > 0) {
            TSUtility.moveToNewParent(this.rootGauge.children[0], this.rootTutorialGauge);
        }
        while (this.rootBalloon.childrenCount > 0) {
            TSUtility.moveToNewParent(this.rootBalloon.children[0], this.rootTutorialBalloon);
        }
    }

    private showTutorial_03(): void {
        this.tooltipTutorial_01.active = false;
        this.tooltipTutorial_02.active = false;
        this.tooltipTutorial_03.active = true;
        this.eventBlocker.active = true;
        this.dimmedNodeForTutorial.active = true;

        while (this.rootTutorialGauge.childrenCount > 0) {
            TSUtility.moveToNewParent(this.rootTutorialGauge.children[0], this.rootGauge);
        }
        while (this.rootTutorialBalloon.childrenCount > 0) {
            TSUtility.moveToNewParent(this.rootTutorialBalloon.children[0], this.rootBalloon);
        }
        while (this.rootSmallBox.childrenCount > 0) {
            TSUtility.moveToNewParent(this.rootSmallBox.children[0], this.rootTutorialSmallBox);
        }
    }

    private playTutorial_01(): Promise<void> {
        const self = this;
        return new Promise((resolve) => {
            self.showTutorial_01();
            self.eventBlocker.once(cc.Node.EventType.TOUCH_END, () => {
                GameCommonSound.playFxOnce("btn_etc");
                self.unscheduleAllCallbacks();
                resolve();
            });
            self.scheduleOnce(() => {
                self.eventBlocker.off(cc.Node.EventType.TOUCH_END);
                GameCommonSound.playFxOnce("btn_etc");
                resolve();
            }, 5);
        });
    }

    private playTutorial_02(): Promise<void> {
        const self = this;
        return new Promise((resolve) => {
            self.showTutorial_02();
            self.eventBlocker.once(cc.Node.EventType.TOUCH_END, () => {
                GameCommonSound.playFxOnce("btn_etc");
                self.unscheduleAllCallbacks();
                resolve();
            });
            self.scheduleOnce(() => {
                self.eventBlocker.off(cc.Node.EventType.TOUCH_END);
                GameCommonSound.playFxOnce("btn_etc");
                resolve();
            }, 5);
        });
    }

    private playTutorial_03(): Promise<void> {
        const self = this;
        return new Promise((resolve) => {
            self.showTutorial_03();
            self.eventBlocker.once(cc.Node.EventType.TOUCH_END, () => {
                GameCommonSound.playFxOnce("btn_etc");
                self.unscheduleAllCallbacks();
                resolve();
            });
            self.scheduleOnce(() => {
                self.eventBlocker.off(cc.Node.EventType.TOUCH_END);
                GameCommonSound.playFxOnce("btn_etc");
                resolve();
            }, 5);
        });
    }

    private endTutorial(): void {
        this.tooltipTutorial_01.active = false;
        this.tooltipTutorial_02.active = false;
        this.tooltipTutorial_03.active = false;

        while (this.rootTutorialSmallBox.childrenCount > 0) {
            TSUtility.moveToNewParent(this.rootTutorialSmallBox.children[0], this.rootSmallBox);
        }

        this.eventBlocker.active = false;
        this.dimmedNodeForTutorial.active = false;
    }

    // ===================== 消息监听 - 百夫长状态刷新 立即关闭弹窗 =====================
    private onReceiveRefreshCenturionClique(): void {
        this.close();
    }
}