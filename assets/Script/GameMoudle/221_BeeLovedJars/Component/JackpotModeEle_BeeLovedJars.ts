import SlotSoundController from "../../../Slot/SlotSoundController";
import TSUtility from "../../../global_utility/TSUtility";

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏 Jackpot 模式单个罐子元素组件
 * 负责单个罐子的鼠标交互、动画状态控制、倍数显示、音效播放等核心逻辑
 */
@ccclass('JackpotModeEle_BeeLovedJars')
export default class JackpotModeEle_BeeLovedJars extends cc.Component {
    // ===================== 核心组件/节点 =====================
    // 罐子主动画组件（控制闲置/点击/选中/中奖等核心动画）
    @property({
        type: cc.Animation,
        displayName: "罐子主动画组件",
        tooltip: "控制罐子核心状态的动画组件（idle/click/select/win等）"
    })
    main_Animation: cc.Animation | null = null;

    // 文本动画组件数组（倍数/类型文本的动画）
    @property({
        type: [cc.Animation],
        displayName: "文本动画组件数组",
        tooltip: "罐子倍数/类型文本的动画组件数组"
    })
    text_Animation: cc.Animation[] | null = [];

    // 倍数显示标签（显示X2/X3等倍数）
    @property({
        type: cc.Label,
        displayName: "倍数显示标签",
        tooltip: "显示罐子倍数的Label组件（如X2/X5）"
    })
    multi_Label: cc.Label | null = null;

    // Jackpot类型节点数组（对应0-3类型的显示节点）
    @property({
        type: [cc.Node],
        displayName: "Jackpot类型节点数组",
        tooltip: "对应0-3种Jackpot类型的显示节点数组"
    })
    jackpot_Nodes: cc.Node[] | null = [];

    // ===================== 私有状态变量 =====================
    // 是否启用交互
    public _isEnable: boolean = true;
    // 是否处于事件处理中（防止重复触发）
    public _isEvent: boolean = false;
    // 鼠标进入回调函数
    public _enterFunc: (() => void) | null = null;
    // 鼠标离开回调函数
    public _leaveFunc: (() => void) | null = null;
    // 当前Jackpot类型（0-3，-1为未设置）
    public _jackpotType: number = -1; // 公开以便父组件访问
    // 是否播放双倍特效
    public _doublePlay: boolean = false;

    /**
     * 组件加载：绑定鼠标进入/离开事件
     */
    onLoad(): void {
        const self = this;

        // 绑定鼠标进入事件
        this.node.on(cc.Node.EventType.MOUSE_ENTER, (event: any) => {
            // 空值检查：回调函数有效、交互启用、非事件处理中
            if (TSUtility.isValid(self._enterFunc) && self._isEnable && !self._isEvent) {
                self.node.scale = 1.1; // 放大罐子
                self._enterFunc!(); // 执行进入回调
            } else {
                self.node.scale = 1; // 重置缩放
            }
        }, this);

        // 绑定鼠标离开事件
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, (event: any) => {
            // 空值检查：回调函数有效
            if (TSUtility.isValid(self._leaveFunc)) {
                self.node.scale = 1; // 重置缩放
                self._leaveFunc!(); // 执行离开回调
            }
        }, this);
    }

    /**
     * 初始化罐子状态
     * @param enterFunc 鼠标进入回调
     * @param leaveFunc 鼠标离开回调
     */
    initJars(enterFunc?: (() => void), leaveFunc?: (() => void)): void {
        // 重置状态变量
        this._isEnable = true;
        this._jackpotType = -1;
        this._doublePlay = false;
        this.node.scale = 1; // 重置缩放
        this._enterFunc = enterFunc || null;
        this._leaveFunc = leaveFunc || null;

        // 停止并播放闲置动画
        if (this.main_Animation && this.main_Animation.isValid) {
            this.main_Animation.stop();
            this.main_Animation.play("JP2_jackpot_idle", 0); // 0=不循环
        }

        // 隐藏倍数标签
        if (this.multi_Label && this.multi_Label.node) {
            this.multi_Label.node.active = false;
            this.multi_Label.string = "";
        }

        // 隐藏所有Jackpot类型节点
        if (this.jackpot_Nodes && this.jackpot_Nodes.length > 0) {
            for (let i = 0; i < this.jackpot_Nodes.length; i++) {
                const node = this.jackpot_Nodes[i];
                if (node && node.isValid) node.active = false;
            }
        }
    }

    /**
     * 播放罐子摇晃（点击前）特效
     */
    shakeCoin(): void {
        const self = this;

        // 播放点击动画
        if (this.main_Animation && this.main_Animation.isValid) {
            this.main_Animation.stop();
            this.main_Animation.play("JP2_jackpot_click", 0);
        }

        // 延迟1秒恢复闲置状态
        this.scheduleOnce(() => {
            self.showIdleJars();
        }, 1);
    }

    /**
     * 播放双倍选中特效
     */
    doubleSelectCoin(): void {
        if (this._doublePlay) return; // 已播放过则直接返回

        this.unscheduleAllCallbacks();
        this._doublePlay = true;

        // 播放双倍特效动画
        if (this.main_Animation && this.main_Animation.isValid) {
            this.main_Animation.stop();
            this.main_Animation.play("JP2_jackpot_ex", 0);
        }
    }

    /**
     * 选中罐子（播放选中动画+显示类型+倍数）
     * @param jackpotType Jackpot类型（0-3）
     * @param multi 倍数（1为默认，>1显示倍数标签）
     */
    selectJars(jackpotType: number, multi: number): void {
        const self = this;

        this.unscheduleAllCallbacks();
        this._isEnable = false;
        this._jackpotType = jackpotType;
        this.node.scale = 1; // 重置缩放

        // 播放选中动画
        if (this.main_Animation && this.main_Animation.isValid) {
            this.main_Animation.stop();
            this.main_Animation.play("JP2_jackpot_select", 0);
        }

        // 显示对应Jackpot类型节点
        if (
            this.jackpot_Nodes && 
            jackpotType >= 0 && 
            jackpotType < this.jackpot_Nodes.length
        ) {
            const typeNode = this.jackpot_Nodes[jackpotType];
            if (typeNode && typeNode.isValid) typeNode.active = true;
        }

        // 播放选中音效
        SlotSoundController.Instance().playAudio("Jackpot_Select", "FX");

        // 显示倍数标签（倍数>1时）
        if (multi > 1 && this.multi_Label && this.multi_Label.node) {
            this.multi_Label.node.active = true;
            this.multi_Label.string = "X" + multi.toString();
        }

        // 延迟1.5秒恢复闲置状态
        this.scheduleOnce(() => {
            self.showIdleJars();
        }, 1.5);
    }

    /**
     * 显示罐子闲置状态（打开后的闲置）
     */
    showIdleJars(): void {
        if (this.main_Animation && this.main_Animation.isValid) {
            this.main_Animation.stop();
            this.main_Animation.play("JP2_jackpot_open_idle", 0);
        }
    }

    /**
     * 播放罐子中奖动画
     */
    winCoin(): void {
        this._isEnable = false;
        this.unscheduleAllCallbacks();

        // 播放中奖动画
        if (this.main_Animation && this.main_Animation.isValid) {
            this.main_Animation.stop();
            this.main_Animation.play("JP2_jackpot_win", 0);
        }
    }

    /**
     * 未选中罐子（播放变暗动画+显示类型+倍数）
     * @param jackpotType Jackpot类型（0-3）
     * @param multi 倍数（1为默认，>1显示倍数标签）
     */
    noneSelectCoin(jackpotType: number, multi: number): void {
        this._isEnable = false;

        // 播放变暗动画
        if (this.main_Animation && this.main_Animation.isValid) {
            this.main_Animation.stop();
            this.main_Animation.play("JP2_jackpot_dim", 0);
        }

        // 显示对应Jackpot类型节点
        if (
            this.jackpot_Nodes && 
            jackpotType >= 0 && 
            jackpotType < this.jackpot_Nodes.length
        ) {
            const typeNode = this.jackpot_Nodes[jackpotType];
            if (typeNode && typeNode.isValid) typeNode.active = true;
        }

        // 显示倍数标签（倍数>1时）
        if (multi > 1 && this.multi_Label && this.multi_Label.node) {
            this.multi_Label.node.active = true;
            this.multi_Label.string = "X" + multi.toString();
        }
    }

    /**
     * 播放罐子变暗2（已选中但未中奖）动画
     */
    dimmedCoin(): void {
        this._isEnable = false;

        // 播放变暗2动画
        if (this.main_Animation && this.main_Animation.isValid) {
            this.main_Animation.stop();
            this.main_Animation.play("JP2_jackpot_dim2", 0);
        }
    }
}