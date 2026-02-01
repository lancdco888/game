import ChangeNumberComponent from "../../../../Script/Slot/ChangeNumberComponent";
import GameResultPopup from "../../../../Script/Slot/GameResultPopup";
import SlotReelSpinStateManager from "../../../../Script/Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../../../Script/Slot/SlotSoundController";
import NumberFormatHelper from "../../../../Script/global_utility/NumberFormatHelper";
import TSUtility from "../../../../Script/global_utility/TSUtility";
import SlotGameResultManager from "../../../../Script/manager/SlotGameResultManager";
import SlotManager from "../../../../Script/manager/SlotManager";
import SoundManager from "../../../../Script/manager/SoundManager";

const { ccclass, property } = cc._decorator;

/**
 * 暮光龙（Twilight Dragon）免费旋转结果弹窗
 * 严格还原原 JS 逻辑，不额外拓展方法
 */
@ccclass("FreeSpinResultPopup_TwilightDragon")
export default class FreeSpinResultPopup_TwilightDragon extends cc.Component {
    // ======================================
    // 编辑器绑定属性（严格对应原 JS 的 g 装饰器）
    // ======================================
    @property(cc.Node)
    public blockingBG: cc.Node | null = null;

    @property(cc.Button)
    public collectButton: cc.Button | null = null;

    @property(cc.Toggle)
    public shareToggle: cc.Toggle | null = null;

    @property(cc.Node)
    public shareRoot: cc.Node | null = null;

    @property(cc.Label)
    public spinCnt: cc.Label | null = null;

    @property(cc.Label)
    public lineBetLabel: cc.Label | null = null;

    @property(cc.Node)
    public longRoot: cc.Node | null = null;

    @property(cc.Node)
    public shortRoot: cc.Node | null = null;

    @property(cc.Label)
    public longLabel: cc.Label | null = null;

    @property(cc.Label)
    public shortLabel: cc.Label | null = null;

    @property({ type: [cc.Node] })
    public nodesInitOpacity: cc.Node[] = [];

    @property(cc.Node)
    public root:cc.Node | null = null;

    // ======================================
    // 私有属性（严格对应原 JS 内部变量）
    // ======================================
    private _goldAmount: number = 0;
    private _fnCallback: (() => void) | null = null;
    private _isAutoClose: boolean = false;

    // ======================================
    // 生命周期方法（严格还原原 JS onLoad）
    // ======================================
    onLoad(): void {
        this.refresh();
        // if (this.shareToggle) {
        //     this.shareToggle.addComponent(FBShareFlagToStorageInGame);
        // }
    }

    // ======================================
    // 还原原 JS refresh 方法
    // ======================================
    refresh(): void {
        if (this.blockingBG) {
            TSUtility.setNodeViewSizeFit(this.blockingBG);
        }
    }

    // ======================================
    // 还原原 JS open 方法
    // ======================================
    open(
        e: number,    // 中奖总金额
        t: number,    // 旋转次数
        n: number,    // 基础金额
        o: (() => void) | null  // 回调函数
    ): void {
        const a = this;
        // 临时设置低音量
        SoundManager.Instance().setMainVolumeTemporarily(0.1);

        // 播放弹窗音效
        const i = SlotSoundController.Instance().playAudio("FreeSpinResultPopup", "FX");
        if (i) {
            i.getDuration();
        }

        // 初始化弹窗根节点缩放与状态
        if (this.root) {
            this.root.scale = 1;
        }
        this.node.active = true;
        if (this.root) {
            this.root.active = false;
        }
        if (this.blockingBG) {
            this.blockingBG.active = true;
            this.blockingBG.opacity = 0;
            // 遮罩淡入动作
            this.blockingBG.runAction(cc.fadeTo(0.33, 180));
        }

        // 初始化私有变量
        this._isAutoClose = false;
        this._goldAmount = e;
        this._fnCallback = o;

        // 激活根节点并播放动画
        if (this.root) {
            this.root.active = true;
            const rootAnim = this.root.getComponent(cc.Animation);
            if (rootAnim) {
                rootAnim.stop();
                rootAnim.play();
            }
        }

        // 初始化子节点透明度
        for (let r = 0; r < this.nodesInitOpacity.length; ++r) {
            const node = this.nodesInitOpacity[r];
            if (node) {
                node.opacity = 0;
            }
        }

        // 激活所有粒子系统
        const c = this.node.getComponentsInChildren(cc.ParticleSystem);
        for (let r = 0; r < c.length; ++r) {
            const particle = c[r];
            if (particle && particle.node) {
                particle.node.active = true;
            }
        }

        // 控制分享根节点显隐
        const isFBShareDisabled = SlotManager.Instance.isFBShareDisableTarget() === 1;
        if (this.shareRoot) {
            this.shareRoot.active = !isFBShareDisabled;
        }

        // 计算倍数并禁用交互组件
        const u = Math.floor(e / n);
        if (this.collectButton) {
            this.collectButton.interactable = false;
        }
        if (this.shareToggle) {
            this.shareToggle.interactable = false;
        }

        // 定时器：激活分享开关
        this.scheduleOnce(function() {
            if (a.shareToggle) {
                a.shareToggle.interactable = true;
            }
        }, 1.83);

        // 定时器：激活领取按钮并添加点击事件
        this.scheduleOnce(function() {
            if (a.collectButton) {
                a.collectButton.interactable = true;
                // 构建按钮点击事件（严格还原原 JS 的 Utility.getComponent_EventHandler）
                const clickEventHandler = new cc.Component.EventHandler();
                clickEventHandler.target = a.node;
                clickEventHandler.component = "FreeSpinResultPopup_TwilightDragon";
                clickEventHandler.handler = "onClickCollect";
                clickEventHandler.customEventData = "";
                a.collectButton.clickEvents.push(clickEventHandler);
            }
        }, 1.75);

        // 设置旋转次数文本
        if (this.spinCnt) {
            this.spinCnt.string = t.toString();
        }

        // 数字滚动相关逻辑
        const h = this._goldAmount / 100;
        let S: cc.Label | null = null;
        if (e > 999999999) {
            S = this.longLabel;
            if (this.shortRoot) this.shortRoot.active = false;
            if (this.longRoot) this.longRoot.active = true;
        } else {
            S = this.shortLabel;
            if (this.shortRoot) this.shortRoot.active = true;
            if (this.longRoot) this.longRoot.active = false;
        }

        // 执行数字滚动动画
        if (S) {
            const changeNumberComp = S.getComponent(ChangeNumberComponent);
            if (changeNumberComp) {
                changeNumberComp.playChangeNumber(h / 100, this._goldAmount, function() {}, 1);
            }
        }

        // 设置倍数标签文本
        if (this.lineBetLabel) {
            this.lineBetLabel.string = "X" + NumberFormatHelper.formatNumber(u);
        }

        // 自动旋转模式：自动关闭弹窗
        if (SlotReelSpinStateManager.Instance.getAutospinMode()) {
            this.scheduleOnce(function() {
                a._isAutoClose = true;
                a.onClickCollect();
            }, 17.33);
        }
    }

    // ======================================
    // 还原原 JS onClickCollect 方法
    // ======================================
    onClickCollect(): void {
        const e = this;
        // 取消所有定时器
        this.unscheduleAllCallbacks();

        // 禁用领取按钮
        if (this.collectButton) {
            this.collectButton.interactable = false;
        }

        // 停止弹窗音效
        SlotSoundController.Instance().stopAudio("FreeSpinResultPopup", "FX");

        // 分享逻辑判断
        const isFBShareDisabled = SlotManager.Instance.isFBShareDisableTarget() === 1;
        if (!isFBShareDisabled && this.shareToggle?.isChecked === true && this._isAutoClose === false) {
            SlotManager.Instance.facebookShare(GameResultPopup.getFreespinShareInfo(), function() {
                e.endProcess();
            });
        } else {
            this.endProcess();
        }
    }

    // ======================================
    // 还原原 JS endProcess 方法
    // ======================================
    endProcess(): void {
        // 预留新记录弹窗判断
        const winState = SlotGameResultManager.Instance.getWinType(this._goldAmount);
        if (winState === SlotGameResultManager.WINSTATE_NORMAL) {
            SlotManager.Instance.reserveNewRecordPopup(this._goldAmount);
        }

        // 隐藏弹窗与遮罩
        this.node.active = false;
        if (this.blockingBG) {
            this.blockingBG.active = false;
        }

        // 恢复主音量
        SoundManager.Instance().resetTemporarilyMainVolume();

        // 执行回调函数
        if (this._fnCallback) {
            this._fnCallback();
        }
    }
}