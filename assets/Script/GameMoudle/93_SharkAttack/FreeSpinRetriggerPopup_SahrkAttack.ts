import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import ViewResizeManager from "../../global_utility/ViewResizeManager";
import SoundManager from "../../manager/SoundManager";

const { ccclass, property } = cc._decorator;

/**
 * 鲨鱼攻击游戏免费旋转重新触发弹窗（注意：类名保留原拼写错误SahrkAttack以兼容原有引用）
 * 负责弹窗的打开/隐藏、视图适配、音效播放、音量临时控制等核心逻辑
 */
@ccclass('FreeSpinRetriggerPopup_SahrkAttack')
export default class FreeSpinRetriggerPopup_SahrkAttack extends cc.Component {
    // 弹窗遮罩背景（用于适配视图大小）
    @property({ type: cc.Node })
    blockingBG: cc.Node = null!;

    // 弹窗根节点（用于播放弹窗动画）
    @property({ type: cc.Node })
    nodeRoot: cc.Node = null!;

    // 需要初始化透明度的节点列表
    @property({ type: [cc.Node] })
    nodesInitOpacity: cc.Node[] = [];

    // 需要初始化缩放的节点列表
    @property({ type: [cc.Node] })
    nodesInitRoot: cc.Node[] = [];

    /**
     * 生命周期：组件加载时初始化视图并注册视图大小调整监听
     */
    onLoad(): void {
        this.refresh();
        ViewResizeManager.Instance().addHandler(this);
    }

    /**
     * 生命周期：组件销毁时移除视图大小调整监听
     */
    onDestroy(): void {
        ViewResizeManager.RemoveHandler(this);
    }

    /**
     * 视图大小调整前的回调（空实现，保留扩展）
     */
    onBeforeResizeView(): void {}

    /**
     * 视图大小调整中的回调（空实现，保留扩展）
     */
    onResizeView(): void {}

    /**
     * 视图大小调整后的回调：刷新遮罩背景大小适配
     */
    onAfterResizeView(): void {
        this.refresh();
    }

    /**
     * 刷新弹窗遮罩背景，适配当前视图大小
     */
    refresh(): void {
        TSUtility.setNodeViewSizeFit(this.blockingBG);
    }

    /**
     * 打开免费旋转重新触发弹窗
     * @param _unused 未使用参数（保留以兼容原有调用）
     * @param callback 弹窗关闭后的回调函数
     */
    open(_unused: any, callback: () => void): void {
        const self = this;

        // 临时将主音量设为0（静音）
        SoundManager.Instance().setMainVolumeTemporarily(0);

        // 初始化节点透明度（设为0）
        for (let o = 0; o < this.nodesInitOpacity.length; ++o) {
            this.nodesInitOpacity[o].opacity = 0;
        }

        // 初始化节点缩放（设为0）
        for (let o = 0; o < this.nodesInitRoot.length; ++o) {
            this.nodesInitRoot[o].scale = 0;
        }

        // 激活弹窗节点并播放根节点动画
        this.node.active = true;
        this.nodeRoot.getComponent(cc.Animation)!.play();
        
        // 再次设置主音量为0（保留原逻辑的重复设置，避免兼容问题）
        SoundManager.Instance().setMainVolumeTemporarily(0);

        // 播放免费旋转开始音效并获取音效时长
        const audioPlayResult = SlotSoundController.Instance().playAudio("FreeSpinStart", "FX");
        const audioDuration = audioPlayResult ? audioPlayResult.getDuration() : 0;

        // 音效播放期间将主音量设为0.1（低音量）
        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(0.1);
        }, audioDuration);

        // 3秒后关闭弹窗并执行回调
        this.scheduleOnce(() => {
            self.hide();
            callback();
        }, 3);
    }

    /**
     * 隐藏免费旋转重新触发弹窗
     */
    hide(): void {
        // 恢复主音量为1（正常音量）
        SoundManager.Instance().setMainVolumeTemporarily(1);
        // 停止免费旋转开始音效
        SlotSoundController.Instance().stopAudio("FreeSpinStart", "FX");
        // 隐藏弹窗节点
        this.node.active = false;
    }
}