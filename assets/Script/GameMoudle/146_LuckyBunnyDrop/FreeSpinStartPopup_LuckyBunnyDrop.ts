import SlotSoundController from "../../Slot/SlotSoundController";
import SlotManager from "../../manager/SlotManager";
import SoundManager from "../../manager/SoundManager";

const { ccclass, property } = cc._decorator;


/**
 * LuckyBunnyDrop 免费旋转开始弹窗组件
 */
@ccclass()
export default class FreeSpinStartPopup_LuckyBunnyDrop extends cc.Component {
    // 遮罩背景节点（用于阻止底层交互）
    @property(cc.Node)
    public blockingBG: cc.Node | null = null;

    // 装饰节点（适配画布大小）
    @property(cc.Node)
    public decoNode: cc.Node | null = null;

    // 弹窗启动动画组件
    @property(cc.Animation)
    public startAnimation: cc.Animation | any = null;

    // 免费旋转次数显示标签
    @property(cc.Label)
    public labelFreespinCount: cc.Label | null = null;

    // 需要初始化透明度为0的节点数组
    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = [];

    // 需要初始化隐藏的节点数组
    @property([cc.Node])
    public nodesInitActive: cc.Node[] = [];

    // 私有回调函数（弹窗结束后执行）
    private _callback: Function | null = null;

    /**
     * 组件加载时执行（Cocos生命周期）
     */
    public onLoad(): void {
        if (this.blockingBG && this.decoNode) {
            // 获取画布节点并适配遮罩/装饰节点大小
            const canvasComp = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
            if (canvasComp && canvasComp.node) {
                const canvasSize = canvasComp.node.getContentSize();
                this.blockingBG.setContentSize(canvasSize);
                this.decoNode.setContentSize(canvasSize);
            }
        }
    }

    /**
     * 设置免费旋转次数显示
     * @param count 免费旋转次数
     */
    public setFreespinCount(count: number): void {
        if (this.labelFreespinCount) {
            this.labelFreespinCount.string = ` ${count.toString()}`;
        }
    }

    /**
     * 打开免费旋转弹窗
     * @param freespinCount 免费旋转次数
     * @param callback 弹窗结束后的回调函数
     */
    public open(freespinCount: number, callback?: Function): void {
        // 禁用鼠标拖拽交互
        SlotManager.Instance.setMouseDragEventFlag(false);

        // 初始化节点透明度为0
        for (const node of this.nodesInitOpacity) {
            if (node) node.opacity = 0;
        }

        // 初始化节点为隐藏状态
        for (const node of this.nodesInitActive) {
            if (node) node.active = false;
        }

        // 临时降低主音量
        SoundManager.Instance().setMainVolumeTemporarily(0.1);
        
        // 显示弹窗并设置回调
        this.node.active = true;
        this._callback = callback;
        
        // 设置免费旋转次数并播放动画
        this.setFreespinCount(freespinCount);
        if (this.startAnimation) {
            this.startAnimation.stop();
            this.startAnimation.currentTime = 0;
            this.startAnimation.play();
        }

        // 播放弹窗启动音效
        SlotSoundController.Instance().playAudio("FreespinStartPopup", "FX");

        // 5秒后自动结束弹窗
        this.scheduleOnce(() => {
            this.processEnd();
        }, 5);
    }

    /**
     * 点击按钮触发弹窗结束（手动关闭）
     */
    public onClickBtn(): void {
        this.processEnd();
    }

    /**
     * 处理弹窗结束逻辑
     */
    public processEnd(): void {
        // 取消所有定时器
        this.unscheduleAllCallbacks();
        
        // 停止弹窗音效并恢复主音量
        SlotSoundController.Instance().stopAudio("FreespinStartPopup", "FX");
        SoundManager.Instance().resetTemporarilyMainVolume();
        
        // 恢复鼠标拖拽交互并隐藏弹窗
        SlotManager.Instance.setMouseDragEventFlag(true);
        this.node.active = false;

        // 执行回调并清空
        if (this._callback) {
            this._callback();
            this._callback = null;
        }
    }
}