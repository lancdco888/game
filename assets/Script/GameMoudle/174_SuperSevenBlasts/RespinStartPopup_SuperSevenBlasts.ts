import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import SoundManager from "../../manager/SoundManager";

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts重旋转开始弹窗组件
 */
@ccclass()
export default class RespinStartPopup_SuperSevenBlasts extends cc.Component {
    // ========== 序列化属性（对应Cocos编辑器赋值） ==========
    /** 弹窗打开动画组件 */
    @property(cc.Animation)
    public openAni: cc.Animation | null = null;

    /** 遮挡背景节点（阻止底层交互） */
    @property(cc.Node)
    public blockingBG: cc.Node | null = null;

    /** 装饰节点 */
    @property(cc.Node)
    public decoNodes: cc.Node | null = null;

    /** 需要初始化缩放的节点数组 */
    @property([cc.Node])
    public nodesInitScale: cc.Node[] = [];

    /** 需要初始化透明度的节点数组 */
    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = [];

    // ========== 私有状态属性 ==========
    /** 弹窗关闭完成后的回调函数 */
    private _closeComplete: (() => void) | null = null;

    /**
     * 组件加载时初始化
     */
    public onLoad(): void {
        // 获取画布组件，设置遮挡背景和装饰节点尺寸
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        if (TSUtility.isValid(canvas)) {
            const canvasSize = canvas.node.getContentSize();
            const width = canvasSize.width + 5;
            const height = canvasSize.height + 5;

            if (TSUtility.isValid(this.blockingBG)) {
                this.blockingBG.setContentSize(width, height);
            }
            if (TSUtility.isValid(this.decoNodes)) {
                this.decoNodes.setContentSize(width, height);
            }
        }
    }

    /**
     * 打开重旋转开始弹窗
     * @param closeComplete 弹窗关闭后的回调函数
     */
    public open(closeComplete?: () => void): void {
        // 初始化弹窗基础状态
        if (TSUtility.isValid(this.node)) {
            this.node.opacity = 255;
            this.node.active = true;
        }

        // 初始化子节点透明度（置0）
        this.nodesInitOpacity.forEach(node => {
            if (TSUtility.isValid(node)) {
                node.opacity = 0;
            }
        });

        // 初始化子节点缩放（置0）
        this.nodesInitScale.forEach(node => {
            if (TSUtility.isValid(node)) {
                node.scale = 0;
            }
        });

        // 保存关闭回调
        this._closeComplete = closeComplete || null;

        // 播放打开动画
        if (TSUtility.isValid(this.openAni)) {
            this.openAni.stop();
            this.openAni.setCurrentTime(0);
            this.openAni.play();
        }

        // 播放音效并临时静音主音量
        SlotSoundController.Instance().playAudio("RespinStart", "FX");
        SoundManager.Instance().setMainVolumeTemporarily(0);

        // 2.5秒后自动触发关闭逻辑
        this.scheduleOnce(() => {
            this.onClickButton();
        }, 2.5);
    }

    /**
     * 点击按钮/自动关闭弹窗的核心逻辑
     */
    public onClickButton(): void {
        // 取消所有定时器
        this.unscheduleAllCallbacks();

        // 停止音效并恢复主音量
        SlotSoundController.Instance().stopAudio("RespinStart", "FX");
        SoundManager.Instance().resetTemporarilyMainVolume();

        // 执行关闭回调（确保回调有效）
        if (TSUtility.isValid(this._closeComplete) && typeof this._closeComplete === 'function') {
            this._closeComplete();
        }

        // 隐藏弹窗
        if (TSUtility.isValid(this.node)) {
            this.node.active = false;
        }
    }
}