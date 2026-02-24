import SlotSoundController from "../../../Slot/SlotSoundController";
import TSUtility from "../../../global_utility/TSUtility";
import SoundManager from "../../../manager/SoundManager";

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏免费旋转重触发弹窗组件
 * 负责重触发弹窗的尺寸适配、UI初始化、双动画播放、音效/音量控制、延迟自动关闭
 */
@ccclass('FreeSpinRetriggerdPopup_BeeLovedJars')
export default class FreeSpinRetriggerdPopup_BeeLovedJars extends cc.Component {
    // ===================== 核心UI节点/组件 =====================
    // 遮罩背景节点（阻挡底层交互，尺寸为2倍Canvas）
    @property({
        type: cc.Node,
        displayName: "遮罩背景节点",
        tooltip: "弹窗底层的全屏遮罩节点，尺寸设为2倍Canvas"
    })
    blockingBG: cc.Node | null = null;

    // 装饰节点（适配Canvas尺寸）
    @property({
        type: cc.Node,
        displayName: "装饰节点",
        tooltip: "需要适配Canvas尺寸+5的装饰节点"
    })
    deco_Node: cc.Node | null = null;

    // 弹窗主动画组件
    @property({
        type: cc.Animation,
        displayName: "主动画组件",
        tooltip: "弹窗核心播放的主动画组件"
    })
    startAni: cc.Animation | null = null;

    // 弹窗子动画组件
    @property({
        type: cc.Animation,
        displayName: "子动画组件",
        tooltip: "弹窗辅助播放的子动画组件"
    })
    subStartAni: cc.Animation | null = null;

    // 初始化时需要隐藏的节点数组
    @property({
        type: [cc.Node],
        displayName: "初始化隐藏节点数组",
        tooltip: "弹窗初始化时需要设置为active=false的节点数组"
    })
    nodesInitActive: cc.Node[] | null = [];

    // 初始化时需要透明的节点数组
    @property({
        type: [cc.Node],
        displayName: "初始化透明节点数组",
        tooltip: "弹窗初始化时需要设置opacity=0的节点数组"
    })
    nodesInitOpacity: cc.Node[] | null = [];

    // 初始化时需要缩放到0的节点数组
    @property({
        type: [cc.Node],
        displayName: "初始化缩放节点数组",
        tooltip: "弹窗初始化时需要设置scale=0的节点数组"
    })
    nodesInitScale: cc.Node[] | null = [];

    // ===================== 私有状态变量 =====================
    // 弹窗音效名称
    private _soundName: string = "RetriggerPopup";
    // 弹窗关闭回调函数
    private _callBack: (() => void) | null = null;
    // 是否已触发点击逻辑（防止重复执行）
    private _isClick: boolean = false;

    /**
     * 组件加载：初始化遮罩/装饰节点尺寸（适配Canvas）
     */
    onLoad(): void {
        // 1. 获取场景Canvas组件（空值检查避免报错）
        const canvasComponent = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
        if (!canvasComponent || !canvasComponent.node) {
            console.warn("未找到Canvas组件，遮罩/装饰节点尺寸适配失败");
            return;
        }
        const canvasSize = canvasComponent.node.getContentSize();

        // 2. 适配遮罩背景尺寸（2倍Canvas宽高）
        if (this.blockingBG && this.blockingBG.isValid) {
            this.blockingBG.setContentSize(2 * canvasSize.width, 2 * canvasSize.height);
        }

        // 3. 适配装饰节点尺寸（Canvas宽高+5）
        if (TSUtility.isValid(this.deco_Node) && this.deco_Node?.isValid) {
            this.deco_Node.setContentSize(canvasSize.width + 5, canvasSize.height + 5);
        }
    }

    /**
     * 初始化弹窗状态：重置UI+临时静音+重置点击状态
     */
    init(): void {
        // 1. 激活弹窗和遮罩
        this.node.active = true;
        this.blockingBG.active = true;

        // 2. 重置透明节点（opacity=0）
        if (this.nodesInitOpacity && this.nodesInitOpacity.length > 0) {
            this.nodesInitOpacity.forEach(node => {
                if (node && node.isValid) node.opacity = 0;
            });
        }

        // 3. 重置隐藏节点（active=false）
        if (this.nodesInitActive && this.nodesInitActive.length > 0) {
            this.nodesInitActive.forEach(node => {
                if (node && node.isValid) node.active = false;
            });
        }

        // 4. 重置缩放节点（scale=0）
        if (this.nodesInitScale && this.nodesInitScale.length > 0) {
            this.nodesInitScale.forEach(node => {
                if (node && node.isValid) node.scale = 0;
            });
        }

        // 5. 非空音效名称时临时静音
        if (this._soundName.trim() !== "") {
            SoundManager.Instance().setMainVolumeTemporarily(0);
        }

        // 6. 重置点击状态
        this._isClick = false;
    }

    /**
     * 打开弹窗：初始化+播放双动画+播放音效+延迟3.5秒触发关闭逻辑
     * @param callback 弹窗关闭后的回调函数
     */
    open(callback?: () => void): void {
        const self = this;
        // 1. 初始化弹窗状态
        this.init();

        // 2. 播放主动画（重置到开头）
        if (this.startAni && this.startAni.isValid) {
            this.startAni.stop();
            this.startAni.play(); // 播放默认动画
            this.startAni.setCurrentTime(0);
        }

        // 3. 播放子动画（重置到开头）
        if (this.subStartAni && this.subStartAni.isValid) {
            this.subStartAni.stop();
            this.subStartAni.play(); // 播放默认动画
            this.subStartAni.setCurrentTime(0);
        }

        // 4. 播放弹窗音效
        SlotSoundController.Instance()?.playAudio(this._soundName, "FX");

        // 5. 保存关闭回调
        this._callBack = callback || null;

        // 6. 延迟3.5秒自动触发点击关闭逻辑
        this.scheduleOnce(() => {
            self.onClickFunc();
        }, 3.5);
    }

    /**
     * 点击/自动关闭逻辑：停止所有回调+标记已点击+执行回调+重置音量+隐藏弹窗
     */
    onClickFunc(): void {
        // 已点击则直接返回，防止重复执行
        if (this._isClick) return;

        // 1. 停止所有计划任务
        this.unscheduleAllCallbacks();

        // 2. 标记为已点击
        this._isClick = true;

        // 3. 执行关闭回调（空值检查）
        if (TSUtility.isValid(this._callBack)) {
            this._callBack!();
        }

        // 4. 重置临时主音量
        SoundManager.Instance()?.resetTemporarilyMainVolume();

        // 5. 隐藏弹窗
        this.node.active = false;
    }
}