import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import { Utility } from "../../global_utility/Utility";
import ViewResizeManager from "../../global_utility/ViewResizeManager";
import SoundManager from "../../manager/SoundManager";

const { ccclass, property } = cc._decorator;

/**
 * 鲨鱼攻击游戏免费旋转开始弹窗
 * 负责弹窗展示/关闭、音效控制、开始按钮事件绑定/自动触发、视图适配
 */
@ccclass('FreeSpinStartPopup_SharkAttack')
export default class FreeSpinStartPopup_SharkAttack extends cc.Component {
    // 开始按钮
    @property({ type: cc.Button })
    public btnStart: cc.Button = null!;

    // 遮罩背景节点
    @property({ type: cc.Node })
    public blockingBG: cc.Node = null!;

    // 弹窗关闭回调函数
    private _callback: (() => void) | null = null;

    /**
     * 生命周期：组件加载
     */
    onLoad(): void {
        this.refresh();
        // 注册视图大小调整监听
        ViewResizeManager.Instance().addHandler(this);
    }

    /**
     * 生命周期：组件销毁
     */
    onDestroy(): void {
        // 移除视图大小调整监听
        ViewResizeManager.RemoveHandler(this);
    }

    /**
     * 视图大小调整前回调（空实现，兼容父类接口）
     */
    onBeforeResizeView(): void {}

    /**
     * 视图大小调整中回调（空实现，兼容父类接口）
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
        // 适配遮罩背景大小到视图尺寸
        TSUtility.setNodeViewSizeFit(this.blockingBG);
    }

    /**
     * 打开免费旋转开始弹窗
     * @param callback 弹窗关闭后的回调函数
     */
    open(callback?: () => void): void {
        const self = this;
        
        // 保存关闭回调
        this._callback = callback;
        
        // 激活遮罩和弹窗节点，播放弹窗动画
        this.blockingBG.active = true;
        this.node.active = true;
        const aniComponent = this.node.getComponent(cc.Animation)!;
        aniComponent.stop();
        aniComponent.play();
        
        // 临时静音主音量
        SoundManager.Instance().setMainVolumeTemporarily(0);
        
        // 播放免费旋转开始音效并获取音效时长
        const audioId = SlotSoundController.Instance().playAudio("FreeSpinStart", "FX");
        const audioDuration = audioId != null ? audioId.getDuration() : 0;

        // 音效播放完成后恢复部分主音量（0.1）
        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(0.1);
        }, audioDuration);

        // 0.5秒后为开始按钮绑定点击事件
        this.scheduleOnce(() => {
            self.btnStart.clickEvents.push(
                Utility.getComponent_EventHandler(self.node, "FreeSpinStartPopup_SharkAttack", "onClickStart", "")
            );
        }, 0.5);

        // 5秒超时自动触发开始按钮逻辑
        this.scheduleOnce(() => {
            self.onClickStart();
        }, 5);
    }

    /**
     * 点击开始按钮处理逻辑
     */
    onClickStart(): void {
        // 清空开始按钮的点击事件
        this.btnStart.clickEvents = [];
        // 关闭弹窗
        this.close();
    }

    /**
     * 关闭弹窗（清理定时器+恢复音量+执行回调）
     */
    close(): void {
        // 取消所有定时器
        this.unscheduleAllCallbacks();
        // 隐藏弹窗节点
        this.node.active = false;
        // 恢复主音量到100%
        SoundManager.Instance().setMainVolumeTemporarily(1);
        // 停止免费旋转开始音效
        SlotSoundController.Instance().stopAudio("FreeSpinStart", "FX");
        
        // 执行回调并清空回调引用
        if (this._callback != null) {
            this._callback();
            this._callback = null;
        }
    }
}