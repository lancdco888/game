import GameResultPopup from "../../Slot/GameResultPopup";
import SlotSoundController from "../../Slot/SlotSoundController";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import NumberFormatHelper from "../../global_utility/NumberFormatHelper";
import TSUtility from "../../global_utility/TSUtility";
import { Utility } from "../../global_utility/Utility";
import ViewResizeManager from "../../global_utility/ViewResizeManager";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SlotManager from "../../manager/SlotManager";
import SoundManager from "../../manager/SoundManager";

const { ccclass, property } = cc._decorator;

/**
 * 鲨鱼攻击游戏免费旋转结果弹窗
 * 负责展示免费旋转奖金/倍数/次数、处理收集/分享逻辑、音效/动画控制
 */
@ccclass('FreeSpinResultPopup_SharkAttack')
export default class FreeSpinResultPopup_SharkAttack extends cc.Component {
    // 遮罩背景节点
    @property({ type: cc.Node })
    public blockingBG: cc.Node = null!;

    // 奖金展示标签
    @property({ type: cc.Label })
    public rewardLabel: cc.Label = null!;

    // 收集按钮
    @property({ type: cc.Button })
    public collectButton: cc.Button = null!;

    // 分享勾选框
    @property({ type: cc.Toggle })
    public shareToggle: cc.Toggle = null!;

    // 分享模块节点
    @property({ type: cc.Node })
    public shareNode: cc.Node = null!;

    // 线注倍数标签
    @property({ type: cc.Label })
    public lineBetLabel: cc.Label = null!;

    // 旋转次数标签
    @property({ type: cc.Label })
    public spinCountLabel: cc.Label = null!;

    // 初始化时需要缩放的节点列表
    @property({ type: [cc.Node] })
    public nodesInitScale: cc.Node[] = [];

    // 初始化时需要设置透明度的节点列表
    @property({ type: [cc.Node] })
    public nodesInitOpacity: cc.Node[] = [];

    // 奖金金额
    private _goldAmount: number = 0;

    // 弹窗关闭回调
    private _fnCallback: (() => void) | null = null;

    // 是否自动关闭（15秒超时）
    private _isAutoClose: boolean = false;

    /**
     * 生命周期：组件加载
     */
    onLoad(): void {
        this.refresh();
        // 注册视图大小调整监听
        ViewResizeManager.Instance().addHandler(this);
        // 为分享勾选框添加FB分享标记组件
        // this.shareToggle.addComponent(FBShareFlagToStorageInGame);
    }

    /**
     * 生命周期：组件销毁
     */
    onDestroy(): void {
        // 移除视图大小调整监听
        ViewResizeManager.RemoveHandler(this);
    }

    /**
     * 视图大小调整前回调（空实现，兼容父类）
     */
    onBeforeResizeView(): void {}

    /**
     * 视图大小调整中回调（空实现，兼容父类）
     */
    onResizeView(): void {}

    /**
     * 视图大小调整后回调
     */
    onAfterResizeView(): void {
        this.refresh();
    }

    /**
     * 刷新弹窗布局（适配视图大小）
     */
    refresh(): void {
        // 适配遮罩背景大小
        TSUtility.setNodeViewSizeFit(this.blockingBG);
    }

    /**
     * 打开免费旋转结果弹窗
     * @param rewardAmount 奖金金额
     * @param betPerLine 每线投注额
     * @param spinCount 旋转次数
     * @param callback 弹窗关闭回调
     */
    open(rewardAmount: number, betPerLine: number, spinCount: number, callback?: () => void): void {
        const self = this;
        this.refresh();
        
        // 临时静音主音量
        SoundManager.Instance().setMainVolumeTemporarily(0);
        
        // 播放免费旋转结果音效并获取时长
        const audioId = SlotSoundController.Instance().playAudio("FreeSpinResult", "FX");
        const audioDuration = audioId != null ? audioId.getDuration() : 0;

        // 初始化节点透明度（置0）
        for (let s = 0; s < this.nodesInitOpacity.length; ++s) {
            this.nodesInitOpacity[s].opacity = 0;
        }

        // 初始化节点缩放（置0）
        for (let s = 0; s < this.nodesInitScale.length; ++s) {
            this.nodesInitScale[s].scale = 0;
        }

        // 播放弹窗动画并激活节点
        this.node.getComponent(cc.Animation)!.play();
        this.node.active = true;
        this.node.opacity = 255;
        this.blockingBG.active = true;
        
        // 初始化状态变量
        this._isAutoClose = false;
        this._goldAmount = rewardAmount;
        this._fnCallback = callback;

        // 激活所有粒子系统
        const particleSystems = this.node.getComponentsInChildren(cc.ParticleSystem);
        for (let s = 0; s < particleSystems.length; ++s) {
            particleSystems[s].node.active = true;
        }

        // 根据FB分享开关显示/隐藏分享模块
        this.shareNode.active = SlotManager.Instance.isFBShareDisableTarget() === 0;

        // 计算并设置奖金倍数、奖金、旋转次数文本
        const multiplier = Math.floor(rewardAmount / betPerLine);
        this.collectButton.interactable = true;
        this.rewardLabel.string = CurrencyFormatHelper.formatNumber(rewardAmount);
        this.lineBetLabel.string = "X" + NumberFormatHelper.formatNumber(multiplier);
        this.spinCountLabel.string = NumberFormatHelper.formatNumber(spinCount);

        // 1.3秒后激活收集按钮并绑定点击事件
        this.scheduleOnce(() => {
            self.collectButton.interactable = true;
            self.collectButton.clickEvents.push(
                Utility.getComponent_EventHandler(self.node, "FreeSpinResultPopup_SharkAttack", "onClickCollect", "")
            );
        }, 1.3);

        // 音效播放完成后恢复部分主音量
        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(0.1);
        }, audioDuration);

        // 15秒超时自动关闭弹窗
        this.scheduleOnce(() => {
            self._isAutoClose = true;
            self.onClickCollect();
        }, 15);
    }

    /**
     * 点击收集按钮处理逻辑
     */
    onClickCollect(): void {
        const self = this;
        
        // 取消所有定时器
        this.unscheduleAllCallbacks();
        // 禁用收集按钮并清空点击事件
        this.collectButton.interactable = false;
        this.collectButton.clickEvents = [];
        // 停止免费旋转结果音效
        SlotSoundController.Instance().stopAudio("FreeSpinResult", "FX");

        // 非自动关闭且开启FB分享时执行分享逻辑
        if (SlotManager.Instance.isFBShareDisableTarget() === 0 && this.shareToggle.isChecked && !this._isAutoClose ) {
            SlotManager.Instance.facebookShare(
                GameResultPopup.getFreespinShareInfo(),
                () => {
                    self.endProcess();
                }
            );
        } else {
            // 直接结束流程
            this.endProcess();
        }
    }

    /**
     * 结束弹窗流程（关闭弹窗+回调+恢复音量）
     */
    endProcess(): void {
        // 普通中奖时预约新纪录弹窗
        if (SlotGameResultManager.Instance.getWinType(SlotGameResultManager.Instance.winMoneyInFreespinMode) ===SlotGameResultManager.WINSTATE_NORMAL) {
            SlotManager.Instance.reserveNewRecordPopup(this._goldAmount);
        }

        // 关闭弹窗
        this.node.active = false;
        // 恢复主音量
        SoundManager.Instance().resetTemporarilyMainVolume();
        // 执行回调
        if (this._fnCallback != null) {
            this._fnCallback();
        }
    }
}