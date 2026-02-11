import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import SoundManager from "../../manager/SoundManager";

const { ccclass, property } = cc._decorator;

/**
 * 暮光龙（Twilight Dragon）免费旋转开始弹窗
 * 继承自 cc.Component，管控弹窗打开/关闭、动画、按钮交互、音效逻辑
 */
@ccclass()
export default class FreeSpinStartPopup_TwilightDragon extends cc.Component {
    // ======================================
    // Cocos 编辑器可绑定属性（对应原 JS 中的 f 装饰器）
    // ======================================
    /** 遮罩节点（阻止点击穿透，适配屏幕大小） */
    @property(cc.Node)
    public blockingBG: cc.Node = null;

    /** 弹窗根动画节点（包含 Animation 组件，播放弹窗入场/关闭动画） */
    @property(cc.Node)
    public nodeRootAnimation: cc.Node = null;

    /** 弹窗初始化根节点数组（控制子节点透明度） */
    @property({ type: [cc.Node] })
    public nodesInitRoot: cc.Node[] = [];

    /** 开始按钮（触发免费旋转，关闭弹窗） */
    @property(cc.Button)
    public btnStart: cc.Button = null;

    // ======================================
    // 私有属性
    // ======================================
    /** 弹窗关闭后的回调函数 */
    private _callback: (() => void) | null = null;

    // ======================================
    // Cocos 生命周期函数：节点加载完成时执行
    // ======================================
    onLoad(): void {
        this.refresh();
    }

    // ======================================
    // 辅助方法：刷新弹窗状态（适配遮罩大小）
    // ======================================
    public refresh(): void {
        if (this.blockingBG) {
            // 调用全局工具类，设置遮罩节点适配屏幕大小
            TSUtility.setNodeViewSizeFit(this.blockingBG);
        }
    }

    // ======================================
    // 辅助方法：根据免费旋转次数获取对应索引（原逻辑保留）
    // ======================================
    public getCountIndex(count: number): number | undefined {
        if (count === 7) {
            return 0;
        } else if (count === 10) {
            return 1;
        } else if (count === 15) {
            return 2;
        }
        return undefined;
    }

    // ======================================
    // 核心方法：打开免费旋转开始弹窗
    // ======================================
    public open(callback?: () => void): void {
        // 保存关闭后的回调函数
        this._callback = callback || null;

        // 1. 初始化弹窗节点状态
        this.node.opacity = 255;
        this.nodesInitRoot.forEach(node => {
            if (node) node.opacity = 0;
        });

        // 2. 显示遮罩，激活弹窗
        if (this.blockingBG) this.blockingBG.active = true;
        this.node.active = true;
        this.node.opacity = 255;

        // 3. 播放弹窗入场动画
        const popupAnimation = this.nodeRootAnimation?.getComponent(cc.Animation);
        if (popupAnimation) {
            popupAnimation.stop(); // 停止当前动画，避免叠加
            popupAnimation.play("Popup_FS_Start");
            popupAnimation.setCurrentTime(0); // 重置动画到起始帧
        }

        // 4. 播放弹窗入场音效
        SlotSoundController.Instance().playAudio("FreeSpinStartPopup", "FX");

        // 5. 延迟调整主音量（临时降低）
        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(0.1);
        }, 0);

        // 6. 延迟 1.83 秒，启用开始按钮并添加点击事件
        this.scheduleOnce(() => {
            if (this.btnStart) {
                this.btnStart.interactable = true;
                // 构建按钮点击事件（对应原 JS 中的 Utility.getComponent_EventHandler）
                const clickEventHandler = new cc.Component.EventHandler();
                clickEventHandler.target = this.node; // 事件绑定到当前节点
                clickEventHandler.component = "FreeSpinStartPopup_TwilightDragon"; // 组件名（与 @ccclass 一致）
                clickEventHandler.handler = "onClickBtn"; // 点击触发的方法名
                clickEventHandler.customEventData = ""; // 自定义参数（无）

                // 添加点击事件到按钮
                this.btnStart.clickEvents.push(clickEventHandler);
            }
        }, 1.83);

        // 7. 自动旋转模式下，延迟 10 秒自动触发按钮点击
        if (SlotReelSpinStateManager.Instance.getAutospinMode()) {
            this.scheduleOnce(() => {
                this.onClickBtn();
            }, 10);
        }
    }

    // ======================================
    // 核心方法：点击开始按钮（关闭弹窗，启动免费旋转）
    // ======================================
    public onClickBtn(): void {
        // 禁用按钮，防止重复点击
        if (this.btnStart) this.btnStart.interactable = false;

        // 处理弹窗关闭逻辑
        this.processEnd();
    }

    // ======================================
    // 核心方法：处理弹窗关闭流程（动画、音效、回调）
    // ======================================
    private processEnd(): void {
        // 1. 取消所有未执行的定时器
        this.unscheduleAllCallbacks();

        // 2. 清空开始按钮的点击事件
        if (this.btnStart) this.btnStart.clickEvents = [];

        // 3. 恢复主音量，停止弹窗音效
        SoundManager.Instance().resetTemporarilyMainVolume();
        SlotSoundController.Instance().stopAudio("FreeSpinStartPopup", "FX");

        // 4. 播放弹窗关闭动画
        const popupAnimation = this.nodeRootAnimation?.getComponent(cc.Animation);
        if (popupAnimation) {
            popupAnimation.play("Popup_Fs_Start_Close");

            // 5. 监听动画结束事件，隐藏弹窗并执行回调
            popupAnimation.once(cc.Animation.EventType.FINISHED, () => {
                // 隐藏遮罩和弹窗
                if (this.blockingBG) this.blockingBG.active = false;
                if (this.btnStart) this.btnStart.interactable = false;
                this.node.active = false;

                // 执行回调函数（启动免费旋转）
                if (this._callback) {
                    this._callback();
                    this._callback = null; // 清空回调，避免重复执行
                }
            }, this);
        }
    }
}