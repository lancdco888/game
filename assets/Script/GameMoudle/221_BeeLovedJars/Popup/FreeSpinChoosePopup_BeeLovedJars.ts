import SlotSoundController from '../../../Slot/SlotSoundController';
import { BottomTextType } from '../../../SubGame/BottomUIText';
import CustomButton from '../../../global_utility/CustomButton';
import TSUtility from '../../../global_utility/TSUtility';
import SlotGameResultManager from '../../../manager/SlotGameResultManager';
import SlotGameRuleManager from '../../../manager/SlotGameRuleManager';
import SlotManager from '../../../manager/SlotManager';
import SoundManager from '../../../manager/SoundManager';
import { SymbolInfo } from '../../../manager/SymbolPoolManager';
import BeeLovedJarsManager from '../BeeLovedJarsManager';

const { ccclass, property } = cc._decorator;


/**
 * BeeLovedJars 游戏免费旋转选择弹窗组件
 * 负责FreeSpin/Lock&Roll模式选择、奖金显示、交互控制、动画/音效/音量管理
 */
@ccclass('FreeSpinChoosePopup_BeeLovedJars')
export default class FreeSpinChoosePopup_BeeLovedJars extends cc.Component {
    // ===================== 核心UI节点 =====================
    // 遮罩背景节点（阻挡底层交互）
    @property({
        type: cc.Node,
        displayName: "遮罩背景节点",
        tooltip: "弹窗底层的全屏遮罩节点"
    })
    blockingBG: cc.Node | null = null;

    // 装饰节点（适配Canvas尺寸）
    @property({
        type: cc.Node,
        displayName: "装饰节点",
        tooltip: "需要适配Canvas尺寸的装饰节点"
    })
    deco_Node: cc.Node | null = null;

    // 弹窗核心动画组件
    @property({
        type: cc.Animation,
        displayName: "弹窗动画组件",
        tooltip: "控制弹窗打开/选择结束的核心动画组件"
    })
    startAni: cc.Animation | null = null;

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

    // 奖金显示标签
    @property({
        type: cc.Label,
        displayName: "奖金显示标签",
        tooltip: "显示计算后的奖金金额（格式化后）"
    })
    prize_Label: cc.Label | null = null;

    // FreeSpin选择按钮
    @property({
        type: cc.Button,
        displayName: "FreeSpin按钮",
        tooltip: "选择FreeSpin模式的按钮组件"
    })
    btnFreeSpin: cc.Button | null = null;

    // Lock&Roll选择按钮
    @property({
        type: cc.Button,
        displayName: "Lock&Roll按钮",
        tooltip: "选择Lock&Roll模式的按钮组件"
    })
    btnLockNRoll: cc.Button | null = null;

    // ===================== 私有状态变量 =====================
    // 选择完成回调函数（参数：0=FreeSpin，1=Lock&Roll）
    private _callback: ((type: number) => void) | null = null;
    // 弹窗音效名称
    private _soudnName: string = "FreeSpinChoosePopup"; // 原代码拼写错误，保留以兼容音效配置
    // 是否已选择（防止重复点击）
    private _isSelected: boolean = false;

    /**
     * 组件加载：初始化尺寸+绑定按钮鼠标事件
     */
    onLoad(): void {
        // 1. 获取场景Canvas并适配遮罩/装饰节点尺寸
        const canvasComponent = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
        if (canvasComponent && canvasComponent.node) {
            const canvasSize = canvasComponent.node.getContentSize();
            
            // 适配遮罩背景尺寸（2倍Canvas尺寸）
            if (this.blockingBG && this.blockingBG.isValid) {
                this.blockingBG.setContentSize(2 * canvasSize.width, 2 * canvasSize.height);
            }

            // 适配装饰节点尺寸（Canvas尺寸+5）
            if (TSUtility.isValid(this.deco_Node) && this.deco_Node?.isValid) {
                this.deco_Node.setContentSize(canvasSize.width + 5, canvasSize.height + 5);
            }
        }

        // 2. 绑定按钮鼠标进入/离开事件
        if (this.btnFreeSpin?.node) {
            this.btnFreeSpin.node.on(cc.Node.EventType.MOUSE_ENTER, this.onFreeSpinBtn.bind(this));
            this.btnFreeSpin.node.on(cc.Node.EventType.MOUSE_LEAVE, this.leaveFreeSpinBtn.bind(this));
        }
        if (this.btnLockNRoll?.node) {
            this.btnLockNRoll.node.on(cc.Node.EventType.MOUSE_ENTER, this.onLockNRollBtn.bind(this));
            this.btnLockNRoll.node.on(cc.Node.EventType.MOUSE_LEAVE, this.leaveLockNRollBtn.bind(this));
        }
    }

    /**
     * FreeSpin按钮鼠标进入：禁用Lock&Roll按钮（未选择状态下）
     */
    onFreeSpinBtn(): void {
        if (!this._isSelected && this.btnLockNRoll) {
            const customBtn = this.btnLockNRoll.getComponent(CustomButton);
            customBtn?.setInteractable(false);
        }
    }

    /**
     * FreeSpin按钮鼠标离开：恢复Lock&Roll按钮（未选择状态下）
     */
    leaveFreeSpinBtn(): void {
        if (!this._isSelected && this.btnLockNRoll) {
            const customBtn = this.btnLockNRoll.getComponent(CustomButton);
            customBtn?.setInteractable(true);
        }
    }

    /**
     * Lock&Roll按钮鼠标进入：禁用FreeSpin按钮（未选择状态下）
     */
    onLockNRollBtn(): void {
        if (!this._isSelected && this.btnFreeSpin) {
            const customBtn = this.btnFreeSpin.getComponent(CustomButton);
            customBtn?.setInteractable(false);
        }
    }

    /**
     * Lock&Roll按钮鼠标离开：恢复FreeSpin按钮（未选择状态下）
     */
    leaveLockNRollBtn(): void {
        if (!this._isSelected && this.btnFreeSpin) {
            const customBtn = this.btnFreeSpin.getComponent(CustomButton);
            customBtn?.setInteractable(true);
        }
    }

    /**
     * 初始化弹窗状态：重置UI+禁用主音量
     */
    init(): void {
        // 1. 激活弹窗和遮罩
        this.node.active = true;
        this.blockingBG.active = true;

        // 2. 重置选择状态
        this._isSelected = false;

        // 3. 重置透明节点（opacity=0）
        if (this.nodesInitOpacity && this.nodesInitOpacity.length > 0) {
            this.nodesInitOpacity.forEach(node => {
                if (node && node.isValid) node.opacity = 0;
            });
        }

        // 4. 重置隐藏节点（active=false）
        if (this.nodesInitActive && this.nodesInitActive.length > 0) {
            this.nodesInitActive.forEach(node => {
                if (node && node.isValid) node.active = false;
            });
        }

        // 5. 恢复两个按钮可交互
        if (this.btnFreeSpin) {
            const fsCustomBtn = this.btnFreeSpin.getComponent(CustomButton);
            fsCustomBtn?.setInteractable(true);
        }
        if (this.btnLockNRoll) {
            const lrCustomBtn = this.btnLockNRoll.getComponent(CustomButton);
            lrCustomBtn?.setInteractable(true);
        }

        // 6. 临时禁用主音量
        SoundManager.Instance()?.setMainVolumeTemporarily(0);
    }

    /**
     * 打开弹窗：初始化+计算奖金+播放动画/音效+恢复音量
     * @param callback 选择完成后的回调函数
     */
    open(callback?: (type: number) => void): void {
        // 1. 初始化弹窗
        this.init();
        this._callback = callback || null;

        // 2. 禁用鼠标拖拽事件
        SlotManager.Instance.setMouseDragEventFlag(false);

        // 3. 播放弹窗打开动画
        if (this.startAni && this.startAni.isValid) {
            this.startAni.stop();
            this.startAni.play("FG", 0); // 0=不循环
        }

        // 4. 计算奖金（累加所有符号prize * 每线投注额）
        let totalPrize = 0;
        const lastSymbolInfo = SlotGameResultManager.Instance.getSubGameState("base").lastSymbolInfoWindow;
        if (Array.isArray(lastSymbolInfo)) {
            for (let row = 0; row < lastSymbolInfo.length; ++row) {
                const rowData = lastSymbolInfo[row] as SymbolInfo[] | any[];
                if (Array.isArray(rowData)) {
                    for (let col = 0; col < rowData.length; ++col) {
                        const symbolInfo = rowData[col];
                        if (symbolInfo && symbolInfo.prize !== null && !isNaN(symbolInfo.prize)) {
                            totalPrize += symbolInfo.prize;
                        }
                    }
                }
            }
        }
        const betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
        const finalAmount = totalPrize * betPerLine;

        // 5. 格式化并显示奖金
        if (this.prize_Label) {
            const gameManager = BeeLovedJarsManager.getInstance();
            if (gameManager.game_components.formatEllipsisNumber) {
                this.prize_Label.string = gameManager.game_components.formatEllipsisNumber(finalAmount);
            } else {
                this.prize_Label.string = finalAmount.toString();
                console.warn("formatEllipsisNumber方法未找到，使用默认数字格式");
            }
        }

        // 6. 播放弹窗音效，并在音效结束后恢复少量音量
        const soundInst = SlotSoundController.Instance()?.playAudio(this._soudnName, "FX");
        const soundDuration = soundInst ? soundInst.getDuration() : 0;
        this.scheduleOnce(() => {
            SoundManager.Instance()?.setMainVolumeTemporarily(0.1);
        }, soundDuration);
    }

    /**
     * 点击FreeSpin按钮：处理选择逻辑（0=FreeSpin）
     */
    onClickFreeSpin(): void {
        if (this._isSelected) return; // 已选择则直接返回

        this._isSelected = true;

        // 1. 停止弹窗音效
        SlotSoundController.Instance()?.stopAudio(this._soudnName, "FX");

        // 2. 禁用两个按钮
        if (this.btnFreeSpin) {
            const fsCustomBtn = this.btnFreeSpin.getComponent(CustomButton);
            fsCustomBtn?.setInteractable(false);
        }
        if (this.btnLockNRoll) {
            const lrCustomBtn = this.btnLockNRoll.getComponent(CustomButton);
            lrCustomBtn?.setInteractable(false);
        }

        // 3. 播放FreeSpin结束动画
        if (this.startAni && this.startAni.isValid) {
            this.startAni.stop();
            this.startAni.play("FG_end_FS", 0);
        }

        // 4. 播放选择音效+设置底部文本
        SlotSoundController.Instance()?.playAudio("FreeSpinChoose", "FX");
        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "FREE SPINS TRIGGERED");

        // 5. 执行结束流程（参数0=FreeSpin）
        this.endProcess(0);
    }

    /**
     * 点击Lock&Roll按钮：处理选择逻辑（1=Lock&Roll）
     */
    onClickLockNRoll(): void {
        if (this._isSelected) return; // 已选择则直接返回

        this._isSelected = true;

        // 1. 停止弹窗音效
        SlotSoundController.Instance()?.stopAudio(this._soudnName, "FX");

        // 2. 禁用两个按钮
        if (this.btnFreeSpin) {
            const fsCustomBtn = this.btnFreeSpin.getComponent(CustomButton);
            fsCustomBtn?.setInteractable(false);
        }
        if (this.btnLockNRoll) {
            const lrCustomBtn = this.btnLockNRoll.getComponent(CustomButton);
            lrCustomBtn?.setInteractable(false);
        }

        // 3. 播放Lock&Roll结束动画
        if (this.startAni && this.startAni.isValid) {
            this.startAni.stop();
            this.startAni.play("FG_end_L&R", 0);
        }

        // 4. 播放选择音效+设置底部文本
        SlotSoundController.Instance()?.playAudio("FreeSpinChoose", "FX");
        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "LOCK&ROLL TRIGGERED");

        // 5. 执行结束流程（参数1=Lock&Roll）
        this.endProcess(1);
    }

    /**
     * 选择结束流程：执行回调+隐藏弹窗+恢复状态
     * @param type 选择类型（0=FreeSpin，1=Lock&Roll）
     */
    endProcess(type: number): void {
        const self = this;

        // 1. 延迟1秒执行回调
        this.scheduleOnce(() => {
            if (self._callback) {
                self._callback(type);
                self._callback = null; // 执行后清空回调，防止重复调用
            }
        }, 1);

        // 2. 延迟2.33秒隐藏弹窗+恢复鼠标拖拽+重置音量
        this.scheduleOnce(() => {
            self.node.active = false;
            SlotManager.Instance.setMouseDragEventFlag(true);
            SoundManager.Instance()?.resetTemporarilyMainVolume();
        }, 2.33);
    }
}