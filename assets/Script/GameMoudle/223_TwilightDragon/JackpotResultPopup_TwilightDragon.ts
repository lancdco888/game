import GameResultPopup from "../../Slot/GameResultPopup";
import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import SlotManager from "../../manager/SlotManager";
import SoundManager from "../../manager/SoundManager";
import ChangeNumberComponent_TwilightDragon from "./ChangeNumberComponent_TwilightDragon";

const { ccclass, property } = cc._decorator;

/**
 * 暮光龙（Twilight Dragon）Jackpot 中奖结果弹窗
 * 继承自 cc.Component，管控中奖展示、数字滚动、分享、音效与自动关闭逻辑
 */
@ccclass("JackpotResultPopup_TwilightDragon")
export default class JackpotResultPopup_TwilightDragon extends cc.Component {
    // ======================================
    // Cocos 编辑器可绑定属性（对应原 JS 中的 S 装饰器）
    // ======================================
    /** 遮罩节点（阻止点击穿透，适配屏幕大小） */
    @property(cc.Node)
    public blockingBG: cc.Node = null;

    /** 领取按钮（关闭弹窗，确认中奖奖励） */
    @property(cc.Button)
    public collectButton: cc.Button = null;

    /** 分享切换开关（是否开启 FB 分享） */
    @property(cc.Toggle)
    public shareToggle: cc.Toggle = null;

    /** 分享根节点（包含分享开关，控制分享界面显隐） */
    @property(cc.Node)
    public shareRoot: cc.Node = null;

    /** 初始化缩放节点数组（预留，原逻辑未完整使用） */
    @property({ type: [cc.Node] })
    public nodesInitScale: cc.Node[] = [];

    /** 初始化透明度节点数组（控制弹窗子节点初始透明度） */
    @property({ type: [cc.Node] })
    public nodesInitOpacity: cc.Node[] = [];

    /** Jackpot 标题节点数组（对应 mini/minor/major/mega 不同奖项） */
    @property({ type: [cc.Node] })
    public jackpotTitle: cc.Node[] = [];

    /** 短金额根节点（展示小额奖金，<10亿） */
    @property(cc.Node)
    public shortRoot: cc.Node = null;

    /** 长金额根节点（展示大额奖金，>=10亿） */
    @property(cc.Node)
    public longRoot: cc.Node = null;

    /** 长金额标签（大额奖金显示文本） */
    @property(cc.Label)
    public longRewardLabel: cc.Label = null;

    /** 短金额标签（小额奖金显示文本） */
    @property(cc.Label)
    public shortRewardLabel: cc.Label = null;

    /** 弹窗根节点（包含 Animation 组件，播放入场动画） */
    @property(cc.Node)
    public root: cc.Node = null;

    /** 倍数节点数组（展示奖金倍数，对应 multiNodes） */
    @property({ type: [cc.Node] })
    public multiNodes: cc.Node[] = [];

    // ======================================
    // 私有属性
    // ======================================
    /** 中奖总金额 */
    private _goldAmount: number = 0;

    /** 弹窗关闭后的回调函数 */
    private _fnCallback: (() => void) | null = null;

    /** 是否自动关闭（自动旋转模式下） */
    private _isAutoClose: boolean = false;

    /** 音效标识（用于停止对应音效） */
    private _soundKey: string = "";

    /** Jackpot 奖项类型（0=mini，1=minor，2=major，3=mega） */
    private _jackpotType: number = 0;

    /** Jackpot 奖项密钥（用于分享信息获取） */
    private _jackpotKey: string = "";

    // ======================================
    // Cocos 生命周期函数：节点加载完成时执行
    // ======================================
    onLoad(): void {
        // 给分享切换开关添加 FB 分享标记组件
        // if (this.shareToggle) {
        //     this.shareToggle.addComponent(FBShareFlagToStorageInGame);
        // }
        // 刷新弹窗遮罩大小
        this.refresh();
    }

    // ======================================
    // 辅助方法：刷新弹窗状态（适配遮罩大小）
    // ======================================
    public refresh(): void {
        if (this.blockingBG) {
            TSUtility.setNodeViewSizeFit(this.blockingBG);
        }
    }

    // ======================================
    // 核心方法：打开 Jackpot 中奖结果弹窗
    // ======================================
    public open(
        goldAmount: number,    // 中奖总金额
        jackpotKey: string,    // Jackpot 奖项密钥
        jackpotType: number,   // Jackpot 奖项类型
        baseAmount: number,    // 基础奖金金额
        multi: number,         // 奖金倍数
        callback?: () => void  // 弹窗关闭后的回调
    ): void {
        // 1. 初始化音量（临时静音）
        SoundManager.Instance().setMainVolumeTemporarily(0);

        // 2. 初始化私有属性
        this._jackpotType = jackpotType;
        this._jackpotKey = jackpotKey;
        this._soundKey = "JackpotResultPopup";
        if (multi > 1) {
            this._soundKey = "MultiJackpotResultPopup"; // 倍数奖金使用专属音效
        }

        // 3. 播放弹窗音效并获取音效时长
        const audioClip = SlotSoundController.Instance().playAudio(this._soundKey, "FX");
        const audioDuration = audioClip ? audioClip.getDuration() : 0;

        // 4. 初始化弹窗节点状态
        if (this.collectButton) this.collectButton.interactable = false;
        this.node.active = true;
        this.node.opacity = 255;
        if (this.blockingBG) {
            this.blockingBG.active = true;
            this.blockingBG.opacity = 0;
        }
        this._isAutoClose = false;
        this._goldAmount = goldAmount;
        this._fnCallback = callback || null;

        // 5. 初始化子节点透明度（设为完全透明）
        this.nodesInitOpacity.forEach(node => {
            if (node) node.opacity = 0;
        });

        // 6. 激活所有粒子系统（中奖特效）
        const particleSystems = this.node.getComponentsInChildren(cc.ParticleSystem);
        particleSystems.forEach(particle => {
            if (particle && particle.node) particle.node.active = true;
        });

        // 7. 控制分享根节点显隐（判断 FB 分享是否禁用）
        const isFBShareDisabled = SlotManager.Instance.isFBShareDisableTarget() === 1;
        if (this.shareRoot) this.shareRoot.active = !isFBShareDisabled;

        // 8. 控制倍数节点显隐（展示对应倍数）
        const multiIndex = multi - 2;
        this.multiNodes.forEach((node, idx) => {
            if (node) node.active = idx === multiIndex;
        });

        // 9. 选择动画标识与金额展示根节点
        const animKey = multi <= 1 ? "Popup_J_Result" : this.getAnimationKey(jackpotType);
        let amountRootNode: cc.Node | null = null;
        if (goldAmount > 999999999) {
            // 大额奖金：显示长金额节点
            if (this.longRoot) this.longRoot.active = true;
            if (this.shortRoot) this.shortRoot.active = false;
            amountRootNode = this.longRoot;
        } else {
            // 小额奖金：显示短金额节点
            if (this.longRoot) this.longRoot.active = false;
            if (this.shortRoot) this.shortRoot.active = true;
            amountRootNode = this.shortRoot;
        }

        // 10. 控制 Jackpot 标题显隐（对应奖项类型）
        this.jackpotTitle.forEach((node, idx) => {
            if (node) node.active = idx === jackpotType;
        });

        // 11. 初始化金额标签文本与分享开关状态
        if (goldAmount > 999999999 && this.longRewardLabel) {
            this.longRewardLabel.string = "0";
        } else if (this.shortRewardLabel) {
            this.shortRewardLabel.string = "0";
        }
        if (this.shareToggle) this.shareToggle.interactable = false;

        // 12. 播放弹窗入场动画
        const rootAnimation = this.root?.getComponent(cc.Animation);
        if (rootAnimation) {
            rootAnimation.stop();
            rootAnimation.play(animKey, 0);
        }

        // 13. 计算中间奖金金额（用于数字滚动分段展示）
        const middleAmount = (this._goldAmount - baseAmount) / multi + baseAmount;

        // 14. 延迟执行数字滚动动画（嵌套回调，处理倍数/非倍数场景）
        this.scheduleOnce(() => {
            const changeNumberComp = amountRootNode?.getComponent(ChangeNumberComponent_TwilightDragon);
            if (!changeNumberComp) return;

            // 第一阶段数字滚动：从 0 到中间金额
            changeNumberComp.playChangeNumber(0, middleAmount, () => {
                if (multi > 1) {
                    // 倍数奖金：延迟 2 秒，第二阶段滚动到总金额
                    this.scheduleOnce(() => {
                        changeNumberComp.playChangeNumber(middleAmount, this._goldAmount, () => {
                            // 滚动完成：激活开关与按钮，添加按钮点击事件
                            this.enableInteractableAndAddClickEvent();
                        }, 0.9);
                    }, 2);
                } else {
                    // 非倍数奖金：延迟 0.8 秒，激活开关与按钮
                    this.scheduleOnce(() => {
                        this.enableInteractableAndAddClickEvent();
                    }, 0.8);
                }
            }, 1.6);
        }, 0.07);

        // 15. 音效结束后，恢复低音量
        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(0.1);
        }, audioDuration);

        // 16. 自动旋转模式：延迟 17 秒自动关闭弹窗
        if (SlotReelSpinStateManager.Instance.getAutospinMode()) {
            this.scheduleOnce(() => {
                this._isAutoClose = true;
                this.onClickCollect();
            }, 17);
        }
    }

    // ======================================
    // 辅助方法：激活交互组件并添加按钮点击事件
    // ======================================
    private enableInteractableAndAddClickEvent(): void {
        // 激活分享开关与领取按钮
        if (this.shareToggle) this.shareToggle.interactable = true;
        if (this.collectButton) this.collectButton.interactable = true;

        // 构建领取按钮点击事件（对应原 JS 的 Utility.getComponent_EventHandler）
        if (!this.collectButton) return;
        const clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "JackpotResultPopup_TwilightDragon";
        clickEventHandler.handler = "onClickCollect";
        clickEventHandler.customEventData = "";

        // 添加点击事件到按钮
        this.collectButton.clickEvents.push(clickEventHandler);
    }

    // ======================================
    // 核心方法：点击领取按钮（关闭弹窗，启动分享/收尾流程）
    // ======================================
    public onClickCollect(): void {
        // 1. 取消所有未执行的定时器
        this.unscheduleAllCallbacks();

        // 2. 停止中奖音效
        SlotSoundController.Instance().stopAudio(this._soundKey, "FX");

        // 3. 执行分享逻辑
        this.share();
    }

    // ======================================
    // 核心方法：处理 FB 分享逻辑
    // ======================================
    private share(): void {
        // 1. 判断分享条件：未禁用 FB 分享、开关勾选、非自动关闭
        const isFBShareDisabled = SlotManager.Instance.isFBShareDisableTarget() === 1;
        if (
            !isFBShareDisabled && 
            this.shareToggle?.isChecked === true && 
            !this._isAutoClose
        ) {
            // 2. 构建分享参数（奖项类型 + 1 对应分享模板）
            const shareType = this._jackpotType + 1;
            const shareInfo = GameResultPopup.getJackpotGameShareInfo(this._goldAmount, shareType);

            // 3. 调用 FB 分享，分享完成后执行收尾流程
            SlotManager.Instance.facebookShare(shareInfo, () => {
                this.endProcess();
            });
        } else {
            // 不满足分享条件，直接执行收尾流程
            this.endProcess();
        }
    }

    // ======================================
    // 核心方法：弹窗收尾流程（隐藏节点、恢复音量、执行回调）
    // ======================================
    private endProcess(): void {
        // 1. 隐藏弹窗与遮罩
        this.node.active = false;
        if (this.blockingBG) this.blockingBG.active = false;

        // 2. 清空领取按钮点击事件
        if (this.collectButton) this.collectButton.clickEvents = [];

        // 3. 恢复主音量
        SoundManager.Instance().resetTemporarilyMainVolume();

        // 4. 执行弹窗关闭回调
        if (this._fnCallback) {
            this._fnCallback();
            this._fnCallback = null; // 清空回调，避免重复执行
        }
    }

    // ======================================
    // 辅助方法：根据 Jackpot 类型获取动画标识
    // ======================================
    private getAnimationKey(jackpotType: number): string {
        return jackpotType === 0 ? "Popup_J_Mini_Multi" : "Popup_J_Multi";
    }
}