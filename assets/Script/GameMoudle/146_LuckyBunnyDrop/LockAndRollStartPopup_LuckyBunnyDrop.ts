import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import SlotManager from "../../manager/SlotManager";
import SoundManager from "../../manager/SoundManager";

const { ccclass, property } = cc._decorator;

/**
 * LuckyBunnyDrop LockAndRoll启动弹窗组件
 * 负责LockAndRoll模式启动时的弹窗展示、动画播放、音效控制、音量调整、按钮交互等逻辑
 */
@ccclass()
export default class LockAndRollStartPopup_LuckyBunnyDrop extends cc.Component {
    // 遮罩背景节点（阻止底层交互，适配画布大小）
    @property(cc.Node)
    public blockingBG: cc.Node = null;

    // 装饰节点（适配画布大小）
    @property(cc.Node)
    public decoNode: cc.Node = null;

    // 弹窗动画组件（注意：原JS拼写为popupAniamtion，保持一致避免动画名匹配错误）
    @property(cc.Animation)
    public popupAniamtion: cc.Animation | any = null;

    // 需要初始化透明度为0的节点数组
    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = [];

    // 需要初始化隐藏的节点数组
    @property([cc.Node])
    public nodesInitActive: cc.Node[] = [];

    // 旋转次数显示标签
    @property(cc.Label)
    public spinCount: cc.Label = null;

    // 开始按钮（控制交互状态）
    @property(cc.Button)
    public start_Button: cc.Button = null;

    // 私有变量：弹窗关闭后的回调函数
    private _callBack: Function = null;

    /**
     * 组件加载时执行（Cocos生命周期）
     * 适配遮罩背景和装饰节点的大小为画布大小
     */
    public onLoad(): void {
        // 获取画布组件
        const canvasComp = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
        if (!canvasComp?.node) return;

        // 适配遮罩背景大小
        this.blockingBG?.setContentSize(canvasComp.node.getContentSize());
        // 适配装饰节点大小
        this.decoNode?.setContentSize(canvasComp.node.getContentSize());
    }

    /**
     * 初始化弹窗状态（重置节点透明度和激活状态）
     */
    public setInitPopup(): void {
        // 重置节点透明度为0
        for (const node of this.nodesInitOpacity) {
            node.opacity = 0;
        }

        // 重置节点为隐藏状态
        for (const node of this.nodesInitActive) {
            node.active = false;
        }
    }

    /**
     * 打开LockAndRoll启动弹窗
     * @param spinNum 旋转次数
     * @param callback 弹窗关闭后的回调函数
     */
    public open(spinNum: number, callback: Function): void {
        // 禁用鼠标拖拽事件
        SlotManager.Instance.setMouseDragEventFlag(false);
        // 临时降低主音量至10%
        SoundManager.Instance().setMainVolumeTemporarily(0.1);

        // 保存回调函数
        this._callBack = callback;
        // 启用开始按钮交互
        this.start_Button!.interactable = true;

        // 设置旋转次数显示文本
        if (this.spinCount) {
            this.spinCount.string = spinNum.toString();
        }

        // 初始化节点状态
        this.setInitPopup();

        // 显示弹窗并播放打开动画
        this.node.active = true;
        if (this.popupAniamtion) {
            this.popupAniamtion.stop();
            this.popupAniamtion.currentTime = 0;
            this.popupAniamtion.play("LnR_Start_Open_Ani"); // 播放打开动画
        }

        // 播放LockAndRoll启动弹窗音效
        SlotSoundController.Instance().playAudio("LNRStartPopup", "FX");

        // 5秒后自动隐藏弹窗
        this.scheduleOnce(() => {
            this.hidePopup();
        }, 5);
    }

    /**
     * 隐藏弹窗（播放关闭动画+恢复状态+执行回调）
     */
    public hidePopup(): void {
        // 取消所有定时器
        this.unscheduleAllCallbacks();
        
        // 禁用开始按钮交互
        if (this.start_Button) {
            this.start_Button.interactable = false;
        }

        // 播放关闭动画
        if (this.popupAniamtion) {
            this.popupAniamtion.stop();
            this.popupAniamtion.currentTime = 0;
            this.popupAniamtion.play("LnR_Start_Close_Ani"); // 播放关闭动画
        }

        // 停止启动弹窗音效，播放切换音效
        SlotSoundController.Instance().stopAudio("LNRStartPopup", "FX");
        SlotSoundController.Instance().playAudio("LNRChange", "FX");

        // 恢复鼠标拖拽事件
        SlotManager.Instance.setMouseDragEventFlag(true);

        // 延迟1.83秒：恢复音量+隐藏弹窗+执行回调
        this.scheduleOnce(() => {
            // 恢复临时调整的主音量
            SoundManager.Instance().resetTemporarilyMainVolume();
            // 隐藏弹窗节点
            this.node.active = false;
            // 执行回调（检查回调有效性）
            if (TSUtility.isValid(this._callBack)) {
                this._callBack!();
            }
        }, 1.83);
    }
}