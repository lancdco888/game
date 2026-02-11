import SlotSoundController from "../../Slot/SlotSoundController";
import SoundManager from "../../manager/SoundManager";

const { ccclass, property } = cc._decorator;


/**
 * LuckyBunnyDrop 免费旋转重触发弹窗组件
 * 负责展示免费旋转重触发的次数、播放动画和音效、控制音量等逻辑
 */
@ccclass()
export default class FreeSpinRetriggerPopup_LuckyBunnyDrop extends cc.Component {
    // 遮罩背景节点（阻止底层交互，适配画布大小）
    @property(cc.Node)
    public blockingBG: cc.Node | null = null;

    // 免费旋转次数显示标签
    @property(cc.Label)
    public spinCount: cc.Label | null = null;

    // 弹窗启动动画组件
    @property(cc.Animation)
    public startAnimation: cc.Animation | any = null;

    // 需要初始化透明度为0的节点数组
    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = [];

    // 需要初始化隐藏的节点数组
    @property([cc.Node])
    public nodesInitActive: cc.Node[] = [];

    /**
     * 组件加载时执行（Cocos生命周期）
     * 适配遮罩背景节点大小为画布大小
     */
    public onLoad(): void {
        if (!this.blockingBG) return;
        
        // 获取画布组件并适配遮罩大小
        const canvasComp = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
        if (canvasComp?.node) {
            this.blockingBG.setContentSize(canvasComp.node.getContentSize());
        }
    }

    /**
     * 打开免费旋转重触发弹窗
     * @param addSpinCount 新增的免费旋转次数
     * @param callback 弹窗关闭后的回调函数
     */
    public open(addSpinCount: number, callback: Function): void {
        // 临时降低主音量至10%
        SoundManager.Instance().setMainVolumeTemporarily(0.1);

        // 设置新增旋转次数显示（格式：+X）
        if (this.spinCount) {
            this.spinCount.string = `+${addSpinCount.toString()}`;
        }

        // 初始化节点透明度为0
        for (const node of this.nodesInitOpacity) {
            node.opacity = 0;
        }

        // 初始化节点为隐藏状态
        for (const node of this.nodesInitActive) {
            node.active = false;
        }

        // 显示弹窗并播放动画
        this.node.active = true;
        if (this.startAnimation) {
            this.startAnimation.stop();
            this.startAnimation.currentTime = 0;
            this.startAnimation.play();
        }

        // 播放重触发弹窗音效
        SlotSoundController.Instance().playAudio("FreespinRetriggerPopup", "FX");

        // 3秒后自动隐藏弹窗并执行回调
        this.scheduleOnce(() => {
            this.hide();
            callback();
        }, 3);
    }

    /**
     * 隐藏弹窗（恢复音量+隐藏节点）
     */
    public hide(): void {
        // 恢复临时调整的主音量
        SoundManager.Instance().resetTemporarilyMainVolume();
        // 隐藏弹窗节点
        this.node.active = false;
    }
}