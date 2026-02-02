import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import SoundManager from "../../manager/SoundManager";

const { ccclass, property } = cc._decorator;

/**
 * 朱雀财富通用弹窗类
 * 负责弹窗的开启/关闭、动画播放、音效控制、自动关闭（自动旋转模式下）等功能
 */
@ccclass()
export default class JustPopup_Zhuquefortune extends cc.Component {
    // ===== 编辑器可配置属性（对应原JS的property定义，补充TS类型）=====
    /** 遮罩背景（阻止弹窗下的界面交互） */
    @property(cc.Node)
    public blockingBG: cc.Node = null;

    /** 弹窗装饰节点（适配画布尺寸） */
    @property(cc.Node)
    public deco_Node: cc.Node = null;

    /** 弹窗动画组件（控制开启/关闭动画） */
    @property(cc.Animation)
    public startAni: cc.Animation = null;

    /** 初始化时需要设置为非激活状态的节点数组 */
    @property([cc.Node])
    public nodesInitActive: cc.Node[] = [];

    /** 初始化时需要设置透明度为0的节点数组 */
    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = [];

    /** 开启动画时长（单位：秒） */
    @property
    public aniTime: number = 0;

    /** 关闭动画时长（单位：秒） */
    @property
    public closeTime: number = 0;

    /** 开启动画剪辑名称 */
    @property
    public startAniName: string = "";

    /** 关闭动画剪辑名称 */
    @property
    public closeAniName: string = "";

    /** 开启音效名称 */
    @property
    public soundName: string = "";

    /** 关闭音效名称 */
    @property
    public closeSoundName: string = "";

    /** 开启音效延迟播放时间（单位：秒） */
    @property
    public soundDelay: number = 0;

    // ===== 私有成员变量（补充TS类型注解）=====
    /** 弹窗关闭后的回调函数 */
    private _callBack: (() => void) | null = null;

    /** 标记是否已点击关闭（防止重复触发关闭逻辑） */
    private _isClick: boolean = false;

    // ===== 生命周期方法 =====
    /**
     * 节点加载完成回调（初始化遮罩和装饰节点尺寸）
     */
    onLoad(): void {
        // 获取场景中的Canvas组件，用于适配弹窗尺寸
        const canvasComponent = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
        if (!canvasComponent || !this.blockingBG) return;

        // 设置遮罩背景尺寸（两倍画布尺寸，确保完全覆盖）
        const canvasSize = canvasComponent.node.getContentSize();
        this.blockingBG.setContentSize(2 * canvasSize.width, 2 * canvasSize.height);

        // 设置装饰节点尺寸（画布尺寸+5，适配边界）
        if (TSUtility.isValid(this.deco_Node)) {
            this.deco_Node.setContentSize(canvasSize.width + 5, canvasSize.height + 5);
        }
    }

    // ===== 公共业务方法 =====
    /**
     * 初始化弹窗状态（重置节点激活状态、透明度等）
     */
    public init(): void {
        // 激活当前弹窗节点和遮罩背景
        this.node.active = true;
        this.blockingBG.active = true;

        // 重置需要初始化透明度的节点（设置为完全透明）
        for (const node of this.nodesInitOpacity) {
            if (TSUtility.isValid(node)) {
                node.opacity = 0;
            }
        }

        // 重置需要初始化激活状态的节点（设置为非激活）
        for (const node of this.nodesInitActive) {
            if (TSUtility.isValid(node)) {
                node.active = false;
            }
        }

        // 若配置了开启音效，暂时静音主音量（避免音效冲突）
        if (this.soundName !== "") {
            SoundManager.Instance().setMainVolumeTemporarily(0);
        }

        // 重置点击标记，允许后续触发关闭逻辑
        this._isClick = false;
    }

    /**
     * 打开弹窗（播放开启动画、音效，支持自动关闭）
     * @param callback 弹窗关闭后的回调函数
     */
    public open(callback?: () => void): void {
        // 保存关闭回调
        this._callBack = callback || null;

        // 初始化弹窗状态
        this.init();

        // 播放开启动画（重置动画进度，避免残留上一次的状态）
        if (this.startAni && this.startAniName) {
            this.startAni.stop();
            this.startAni.play(this.startAniName);
            this.startAni.setCurrentTime(0);
        }

        // 播放开启音效（支持延迟播放）
        if (this.soundName !== "") {
            if (this.soundDelay > 0) {
                this.scheduleOnce(() => {
                    SlotSoundController.Instance()?.playAudio(this.soundName, "FX");
                }, this.soundDelay);
            } else {
                SlotSoundController.Instance()?.playAudio(this.soundName, "FX");
            }
        }

        // 自动旋转模式下，弹窗自动关闭（无需手动点击）
        if (SlotReelSpinStateManager.Instance.getAutospinMode()) {
            this.scheduleOnce(() => {
                this.onClickFunc();
            }, this.aniTime + 5);
        }
    }

    /**
     * 点击关闭弹窗（核心关闭逻辑，防止重复触发）
     */
    public onClickFunc(): void {
        // 若已点击过，直接返回，避免重复执行关闭逻辑
        if (this._isClick) return;
        this._isClick = true;

        // 取消所有未执行的延迟任务（避免残留的scheduleOnce触发）
        this.unscheduleAllCallbacks();

        // 停止开启动画，播放关闭动画
        if (this.startAni && this.closeAniName) {
            this.startAni.stop();
            this.startAni.play(this.closeAniName);
            this.startAni.setCurrentTime(0);
        }

        // 播放关闭音效
        if (this.closeSoundName !== "") {
            SlotSoundController.Instance()?.playAudio(this.closeSoundName, "FX");
        }

        // 延迟执行关闭回调（预留动画播放时间，适配原逻辑的closeTime-1）
        this.scheduleOnce(() => {
            if (TSUtility.isValid(this._callBack)) {
                this._callBack!();
            }
        }, this.closeTime - 1);

        // 延迟重置主音量并隐藏弹窗（等待关闭动画完成）
        this.scheduleOnce(() => {
            SoundManager.Instance()?.resetTemporarilyMainVolume();
            this.node.active = false;
        }, this.closeTime);
    }
}