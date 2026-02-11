import ChangeNumberComponent from "../../Slot/ChangeNumberComponent";
import GameResultPopup, { ResultPopupType } from "../../Slot/GameResultPopup";
import SlotSoundController from "../../Slot/SlotSoundController";
import UserInfo from "../../User/UserInfo";
import TSUtility from "../../global_utility/TSUtility";
import { Utility } from "../../global_utility/Utility";
import SoundManager from "../../manager/SoundManager";

const { ccclass, property } = cc._decorator;


/**
 * 龙珠游戏Jackpot结果弹窗组件
 * 管理Jackpot结果弹窗显隐、奖励显示、标题切换、分享控制、收集按钮交互、自动关闭等核心逻辑
 */
@ccclass()
export default class JackpotResultPopup_DragonOrbs extends cc.Component {
    // ===================== 序列化属性（与原JS一致） =====================
    /** 遮罩背景节点（阻止底层交互） */
    @property(cc.Node)
    public blockingBG: cc.Node | null = null;

    /** Jackpot标题节点列表（对应不同Jackpot类型） */
    @property([cc.Node])
    public title: cc.Node[] = [];

    /** 短文本奖励标签（金额<10亿） */
    @property(cc.Label)
    public rewardLabel_Short: cc.Label | null = null;

    /** 长文本奖励标签（金额≥10亿） */
    @property(cc.Label)
    public rewardLabel_Long: cc.Label | null = null;

    /** 收集按钮 */
    @property(cc.Button)
    public collectButton: cc.Button | null = null;

    /** 短文本奖励显示根节点 */
    @property(cc.Node)
    public shortRoot: cc.Node | null = null;

    /** 长文本奖励显示根节点 */
    @property(cc.Node)
    public longRoot: cc.Node | null = null;

    /** 分享切换开关 */
    @property(cc.Toggle)
    public shareToggle: cc.Toggle | null = null;

    /** 分享区域根节点 */
    @property(cc.Node)
    public shareRoot: cc.Node | null = null;

    /** 需要初始化缩放的节点列表 */
    @property([cc.Node])
    public nodesInitScale: cc.Node[] = [];

    /** 需要初始化透明度的节点列表 */
    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = [];

    /** 弹窗根节点 */
    @property(cc.Node)
    public root: cc.Node | null = null;

    // ===================== 私有状态（与原JS一致） =====================
    /** Jackpot奖励金币金额 */
    private _goldAmount: number = 0;

    /** 是否自动关闭 */
    private _isAutoClose: boolean = false;

    /** 当前状态标识 */
    private _currentStateKey: string = "";

    /** 音效标识 */
    private _soundKey: string = "";

    /** 是否完成按钮关闭流程 */
    private _closeCompleteBtn: boolean = false;

    /** 弹窗关闭回调函数 */
    private _fnCallback: (() => void) | null = null;

    /** Jackpot类型（0/1/2/3对应不同等级） */
    private _jackpotType: number = 0;

    // ===================== 生命周期/核心方法（与原JS逻辑1:1） =====================
    /**
     * 组件加载时初始化遮罩背景尺寸+添加分享存储组件
     */
    public onLoad(): void {
        // 获取场景中的Canvas组件
        const canvasComp = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
        if (!TSUtility.isValid(canvasComp)) return;

        // 设置遮罩背景尺寸
        const canvasSize = canvasComp.node.getContentSize();
        this.blockingBG!.setContentSize(canvasSize.width + 5, canvasSize.height + 100);

        // 为分享切换开关添加FB分享存储组件
        if (TSUtility.isValid(this.shareToggle)) {
            // this.shareToggle.addComponent(FBShareFlagToStorageInGame);
        }
    }

    /**
     * 打开Jackpot结果弹窗（初始化状态+显示奖励+播放动画/音效）
     * @param goldAmount Jackpot奖励金额
     * @param extraAmount 额外奖励金额
     * @param jackpotType Jackpot类型（0/1/2/3）
     * @param stateKey 状态标识
     * @param callback 弹窗关闭后的回调
     */
    public open(
        goldAmount: number,
        extraAmount: number,
        jackpotType: number,
        stateKey: string,
        callback: (() => void) | null
    ): void {
        const self = this;

        // 临时降低主音量
        SoundManager.Instance().setMainVolumeTemporarily(0.1);

        // 初始化回调和状态
        this._fnCallback = callback;
        this._closeCompleteBtn = false;
        this._soundKey = "JackpotResultPopup";
        this._jackpotType = jackpotType;
        this._currentStateKey = stateKey;

        // 播放Jackpot结果弹窗音效并获取时长
        const audioClip = SlotSoundController.Instance().playAudio(this._soundKey, "FX");
        const audioDuration = audioClip ? audioClip.getDuration() : 0;

        // 停止收集按钮动画
        const collectBtnPivotAni = this.collectButton!.node.getChildByName("Pivot")?.getComponent(cc.Animation);
        if (TSUtility.isValid(collectBtnPivotAni)) {
            collectBtnPivotAni.stop();
        }

        // 初始化弹窗基础状态
        this.node.active = true;
        this.node.opacity = 255;
        this.blockingBG!.active = true;
        this._isAutoClose = false;
        this._goldAmount = goldAmount;
        this.shareToggle!.interactable = false;
        this.collectButton!.interactable = false;

        // 选择奖励标签（短/长文本）
        let rewardLabel: cc.Label | null = null;
        if (this._goldAmount > 999999999) {
            this.longRoot!.active = true;
            this.shortRoot!.active = false;
            rewardLabel = this.rewardLabel_Long;
        } else {
            this.longRoot!.active = false;
            this.shortRoot!.active = true;
            rewardLabel = this.rewardLabel_Short;
        }
        // 清空奖励标签初始文本
        if (TSUtility.isValid(rewardLabel)) {
            rewardLabel.string = "";
        }

        // 1.1秒后激活分享切换开关
        this.scheduleOnce(() => {
            self.shareToggle!.interactable = true;
        }, 1.1);

        // 0.5秒后播放数字变化动画（2秒从0到总奖励金额）
        this.scheduleOnce(() => {
            if (TSUtility.isValid(rewardLabel)) {
                const changeNumComp = rewardLabel.getComponent(ChangeNumberComponent);
                if (TSUtility.isValid(changeNumComp)) {
                    changeNumComp.playChangeNumber(
                        0,
                        self._goldAmount + extraAmount,
                        () => {
                            // 数字动画完成后激活收集按钮+播放按钮动画+绑定点击事件
                            self.collectButton!.interactable = true;
                            if (TSUtility.isValid(collectBtnPivotAni)) {
                                collectBtnPivotAni.play();
                            }
                            self.collectButton!.clickEvents.push(
                                Utility.getComponent_EventHandler(
                                    self.node,
                                    "JackpotResultPopup_DragonOrbs",
                                    "onClickCollect",
                                    ""
                                )
                            );
                        },
                        2
                    );
                }
            }
        }, 0.5);

        // 初始化标题节点（全部隐藏）
        for (let i = 0; i < this.title.length; ++i) {
            this.title[i].active = false;
        }

        // 初始化透明节点为0透明度
        for (let i = 0; i < this.nodesInitOpacity.length; ++i) {
            this.nodesInitOpacity[i].opacity = 0;
        }

        // 初始化缩放节点为0缩放
        for (let i = 0; i < this.nodesInitScale.length; ++i) {
            this.nodesInitScale[i].scale = 0;
        }

        // 激活所有粒子系统
        const particleSystems = this.node.getComponentsInChildren(cc.ParticleSystem);
        for (let i = 0; i < particleSystems.length; ++i) {
            particleSystems[i].node.active = true;
        }

        // 控制分享区域显隐（判断是否禁用FB分享）
        this.shareRoot!.active = false;//UserInfo.instance().isFBShareDisableTarget() === 0;

        // 显示对应Jackpot类型的标题
        for (let i = 0; i < this.title.length; ++i) {
            this.title[i].active = i === jackpotType;
        }

        // 播放弹窗打开动画
        const rootAni = this.node.getComponent(cc.Animation);
        if (TSUtility.isValid(rootAni)) {
            rootAni.play("Jackpot_Open_Ani");
        }

        // 音频播放完成后恢复低音量
        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(0.1);
        }, audioDuration);

        // 15秒后自动关闭
        this.scheduleOnce(() => {
            self._isAutoClose = true;
            self.onClickCollect();
        }, 15);
    }

    /**
     * 点击收集按钮（处理分享判断+触发结束流程）
     */
    public onClickCollect(): void {
        const self = this;

        // 取消所有定时器+禁用收集按钮+清空按钮事件
        this.unscheduleAllCallbacks();
        this.collectButton!.interactable = false;
        this.collectButton!.clickEvents = [];

        // 停止Jackpot结果弹窗音效
        SlotSoundController.Instance().stopAudio(this._soundKey, "FX");

        // 判断是否分享：未禁用FB+勾选分享+非自动关闭 → 执行FB分享，否则直接结束流程
        const isShareEnabled = false;//UserInfo.instance().isFBShareDisableTarget() === 0;
        const isShareChecked = this.shareToggle!.isChecked;
        if (isShareEnabled && isShareChecked && !this._isAutoClose) {
            // 计算分享的Jackpot类型（3对应Grand Jackpot）
            let shareJackpotType = this._jackpotType + 1;
            if (this._jackpotType === 3) {
                shareJackpotType = ResultPopupType.JackpotResultGrand;
            }

            // // 执行FB分享，完成后触发结束流程
            // UserInfo.instance().facebookShare(
            //     GameResultPopup.getJackpotGameShareInfo(this._goldAmount, shareJackpotType),
            //     () => {
            //         self.endProcess();
            //     }
            // );
        } else {
            // 直接结束流程
            self.endProcess();
        }
    }

    /**
     * 结束弹窗流程（恢复音量+隐藏节点+触发回调）
     */
    public endProcess(): void {
        // 恢复临时调整的主音量
        SoundManager.Instance().resetTemporarilyMainVolume();
        this._closeCompleteBtn = true;

        // 隐藏弹窗节点
        this.node.active = false;

        // 触发关闭回调
        if (this._fnCallback) {
            this._fnCallback();
        }
    }
}
