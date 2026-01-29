import SlotSoundController from "../../../../Script/Slot/SlotSoundController";
import TSUtility from "../../../../Script/global_utility/TSUtility";
import ViewResizeManager from "../../../../Script/global_utility/ViewResizeManager";

const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - Lock&Roll介绍弹窗组件
 * 核心职责：
 * 1. 初始化弹窗节点透明度，控制宝石节点显示状态
 * 2. 播放介绍弹窗音效，支持定时执行回调和自动关闭弹窗
 * 3. 适配视图大小调整，控制遮罩节点尺寸
 */
@ccclass()
export default class LockNRollIntroPopup_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 遮罩节点（阻止底层交互） */
    @property(cc.Node)
    public block_Node: cc.Node | null = null;

    /** 蓝色宝石节点 */
    @property(cc.Node)
    public blud_Node: cc.Node | null = null; // 注：原代码拼写为blud（应为blue），保留原命名避免适配问题

    /** 红色宝石节点 */
    @property(cc.Node)
    public red_Node: cc.Node | null = null;

    /** 绿色宝石节点 */
    @property(cc.Node)
    public green_Node: cc.Node | null = null;

    /** 初始化时需要调整透明度的节点数组 */
    @property([cc.Node])
    public initOpacity_Nodes: cc.Node[] = [];

    // ====== 私有状态属性 ======
    /** 弹窗关闭前的回调函数 */
    private _callback: (() => void) | null = null;

    // ====== 生命周期方法 ======
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
     * 初始化弹窗状态（重置节点透明度）
     */
    initPopup(): void {
        // 重置所有需要初始化透明度的节点为完全透明
        this.initOpacity_Nodes.forEach(node => {
            if (node) node.opacity = 0;
        });
    }

    /**
     * 显示Lock&Roll介绍弹窗
     * @param callback 弹窗显示后4.5秒执行的回调函数（可选）
     */
    showPopup(callback?: () => void): void {
        const self = this;
        
        // 初始化弹窗状态
        this.initPopup();
        
        // 保存回调函数（未传则设为null）
        this._callback = callback || null;
        
        // 激活弹窗节点
        this.node.active = true;

        // 播放介绍弹窗音效
        SlotSoundController.Instance().playAudio("LockNRollIntro", "FX");

        // 隐藏所有宝石节点
        if (this.blud_Node) this.blud_Node.active = false;
        if (this.red_Node) this.red_Node.active = false;
        if (this.green_Node) this.green_Node.active = false;

        // 4.5秒后执行回调（如有且有效）
        this.scheduleOnce(() => {
            if (TSUtility.isValid(self._callback)) {
                self._callback!(); // 已通过isValid校验，非空断言
            }
        }, 4.5);

        // 5秒后关闭弹窗
        this.scheduleOnce(() => {
            self.closePopup();
        }, 5);
    }

    /**
     * 关闭弹窗（隐藏节点）
     */
    closePopup(): void {
        this.node.active = false;
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
     * 视图调整后回调（适配遮罩节点尺寸）
     */
    onAfterResizeView(): void {
        // 获取Canvas节点
        const canvas = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
        if (!canvas || !canvas.node || !this.block_Node) return;

        const canvasSize = canvas.node.getContentSize();
        
        // 适配遮罩节点尺寸（Canvas大小+5）
        this.block_Node.setContentSize(
            canvasSize.width + 5,
            canvasSize.height + 5
        );
    }
}