import SlotReelSpinStateManager from "../../../Script/Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../../Script/Slot/SlotSoundController";
import ViewResizeManager from "../../../Script/global_utility/ViewResizeManager";
import SoundManager from "../../../Script/manager/SoundManager";
import HoundOfHadesManager from "./HoundOfHadesManager";

const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - Lock&Roll开始弹窗组件
 * 核心职责：
 * 1. 初始化弹窗状态，控制节点透明度/缩放、遮罩显示
 * 2. 根据宝石显示状态播放对应动画，控制弹窗打开动画和音效
 * 3. 处理领取按钮点击逻辑，支持自动旋转模式下的自动关闭
 * 4. 适配视图大小调整，控制遮罩背景尺寸
 */
@ccclass()
export default class LockNRollStartPopup_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 弹窗根节点 */
    @property(cc.Node)
    public root: cc.Node | null = null;

    /** 遮罩背景节点（阻止底层交互） */
    @property(cc.Node)
    public blockingBG: cc.Node | null = null;

    /** 弹窗开始动画组件 */
    @property(cc.Animation)
    public startAni: cc.Animation | null = null;

    /** 开始/领取按钮 */
    @property(cc.Button)
    public collectButton: cc.Button | null = null;

    /** 初始化时需要缩放的节点数组 */
    @property([cc.Node])
    public nodesInitScale: cc.Node[] = [];

    /** 初始化时需要调整透明度的节点数组 */
    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = [];

    /** 蓝色宝石动画组件 */
    @property(cc.Animation)
    public blue_Animation: cc.Animation | null = null;

    /** 红色宝石动画组件 */
    @property(cc.Animation)
    public red_Animation: cc.Animation | null = null;

    /** 绿色宝石动画组件 */
    @property(cc.Animation)
    public green_Animation: cc.Animation | null = null;

    // ====== 私有状态属性 ======
    /** 是否自动关闭弹窗（自动旋转模式） */
    private _autoClose: boolean = false;

    /** 按钮是否已点击（防止重复点击） */
    private _isClicked: boolean = false;

    /** 弹窗关闭后的回调函数 */
    private _callback: (() => void) | null = null;

    // ====== 生命周期方法 ======
    /**
     * 组件加载回调（空实现，保留扩展）
     */
    onLoad(): void {}

    /**
     * 组件激活时添加视图调整监听并刷新布局
     */
    onEnable(): void {
        this.onAfterResizeView();
        ViewResizeManager.Instance().addHandler(this);
    }

    /**
     * 组件失活时移除视图调整监听
     */
    onDisable(): void {
        ViewResizeManager.RemoveHandler(this);
    }

    // ====== 核心方法 ======
    /**
     * 初始化弹窗基础状态
     */
    init(): void {
        // 重置根节点状态
        if (this.root) {
            this.root.opacity = 255;
            this.root.scale = 1;
        }

        // 显示遮罩背景
        if (this.blockingBG) {
            this.blockingBG.active = true;
        }

        // 禁用领取按钮
        if (this.collectButton) {
            this.collectButton.interactable = false;
        }

        // 初始化自动关闭标记
        this._autoClose = true;

        // 重置节点透明度
        this.nodesInitOpacity.forEach(node => {
            if (node) node.opacity = 0;
        });

        // 重置节点缩放
        this.nodesInitScale.forEach(node => {
            if (node) node.scale = 0;
        });

        // 激活弹窗节点
        this.node.active = true;
    }

    /**
     * 显示Lock&Roll开始弹窗
     * @param callback 弹窗关闭后的回调函数
     */
    showPopup(callback?: () => void): void {
        const self = this;
        
        // 初始化弹窗状态
        this.init();
        
        // 重置状态标记
        this._autoClose = false;
        this._callback = callback || null;
        this._isClicked = false;

        // 获取游戏管理器实例
        const gameManager = HoundOfHadesManager.getInstance();
        if (!gameManager || !gameManager.game_components) {
            console.warn("LockNRollStartPopup: HoundOfHadesManager实例或game_components未找到！");
            return;
        }

        // 1. 根据宝石显示状态选择动画名（正常/暗淡）
        const redAniName = gameManager.game_components.isShowRedGem() 
            ? "PU_Lock&Roll_box" 
            : "PU_Lock&Roll_box_dim";
        
        const blueAniName = gameManager.game_components.isShowBlueGem() 
            ? "PU_Lock&Roll_box" 
            : "PU_Lock&Roll_box_dim";
        
        const greenAniName = gameManager.game_components.isShowGreenGem() 
            ? "PU_Lock&Roll_box" 
            : "PU_Lock&Roll_box_dim";

        // 2. 播放红/蓝/绿宝石动画
        if (this.red_Animation) {
            this.red_Animation.stop();
            this.red_Animation.play(redAniName);
            this.red_Animation.setCurrentTime(0);
        }

        if (this.blue_Animation) {
            this.blue_Animation.stop();
            this.blue_Animation.play(blueAniName);
            this.blue_Animation.setCurrentTime(0);
        }

        if (this.green_Animation) {
            this.green_Animation.stop();
            this.green_Animation.play(greenAniName);
            this.green_Animation.setCurrentTime(0);
        }

        // 3. 播放弹窗开始动画
        if (this.startAni) {
            this.startAni.stop();
            this.startAni.play();
            this.startAni.setCurrentTime(0);
        }

        // 4. 播放弹窗打开音效并临时降低主音量
        SlotSoundController.Instance().playAudio("LockNRollStartPopup", "FX");
        SoundManager.Instance().setMainVolumeTemporarily(0.1);

        // 5. 激活领取按钮
        if (this.collectButton) {
            this.collectButton.interactable = true;
        }

        // 6. 自动旋转模式下11.67秒后自动关闭
        if (SlotReelSpinStateManager.Instance.getAutospinMode()) {
            this.scheduleOnce(() => {
                self._autoClose = true;
                self.onClickCollect();
            }, 11.67);
        }
    }

    /**
     * 点击领取按钮的处理逻辑（防止重复点击）
     */
    onClickCollect(): void {
        // 已点击过则直接返回
        if (this._isClicked) return;

        // 标记为已点击，防止重复触发
        this._isClicked = true;
        
        // 取消所有定时回调
        this.unscheduleAllCallbacks();

        // 禁用领取按钮
        if (this.collectButton) {
            this.collectButton.interactable = false;
        }

        // 执行弹窗结束流程
        this.processEnd();
    }

    /**
     * 结束弹窗流程，恢复环境并执行回调
     */
    processEnd(): void {
        // 停止弹窗开始音效
        SlotSoundController.Instance().stopAudio("LockNRollStartPopup", "FX");

        // 取消所有定时回调
        this.unscheduleAllCallbacks();

        // 隐藏弹窗节点
        this.node.active = false;

        // 重置临时调整的主音量
        SoundManager.Instance().resetTemporarilyMainVolume();

        // 执行回调函数（如有）
        if (this._callback) {
            this._callback();
            this._callback = null; // 释放回调引用，避免内存泄漏
        }
    }

    // ====== 视图大小调整回调 ======
    /**
     * 视图调整前回调（空实现，保留扩展）
     */
    onBeforeResizeView(): void {}

    /**
     * 视图调整中回调（空实现，保留扩展）
     */
    onResizeView(): void {}

    /**
     * 视图调整后回调（适配遮罩背景尺寸）
     */
    onAfterResizeView(): void {
        // 获取Canvas节点
        const canvas = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
        if (!canvas || !canvas.node || !this.blockingBG) return;

        const canvasSize = canvas.node.getContentSize();
        
        // 适配遮罩背景尺寸（Canvas大小+5）
        this.blockingBG.setContentSize(
            canvasSize.width + 5,
            canvasSize.height + 5
        );
    }
}