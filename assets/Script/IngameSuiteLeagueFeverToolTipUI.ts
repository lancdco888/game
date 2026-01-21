import GameCommonSound from "./GameCommonSound";
import SlotReelSpinStateManager from "./Slot/SlotReelSpinStateManager";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";
import SlotGameRuleManager from "./manager/SlotGameRuleManager";
import SlotManager from "./manager/SlotManager";
import SoundManager from "./manager/SoundManager";

const { ccclass, property } = cc._decorator;

/**
 * FeverMode 提示框 UI 状态枚举
 */
export enum FeverTooltipUIState {
    NONE = 1,
    LOCK = 2,
    NORMAL = 3
}

/**
 * SuiteLeague 狂热模式（FeverMode）提示框组件
 * 负责 FeverMode 提示框的创建、显示、动画切换、数值更新、事件交互等
 */
@ccclass()
export default class IngameSuiteLeagueFeverToolTipUI extends cc.Component {
    // === 动画名称常量 ===
    private readonly ANIMATION_NAME_ON_IDLE = "SuiteLeague_Tooltip_On_Idle_Ani";
    private readonly ANIMATION_NAME_OFF_IDLE = "SuiteLeague_Tooltip_Off_Idle_Ani";
    private readonly ANIMATION_NAME_CHANGE_ON = "SuiteLeague_Tooltip_Change_On_Ani";
    private readonly ANIMATION_NAME_CHANGE_OFF = "SuiteLeague_Tooltip_Change_Off_Ani";
    private readonly ANIMATION_NAME_CHANGE_NUM = "SuiteLeague_Tooltip_Change_Num_Ani";
    private readonly ACTIVE_TIME = 2; // 提示框激活时长（秒）

    // === 编辑器序列化属性 ===
    @property({ type: cc.Prefab, displayName: '提示框预制体' })
    prefTooltip: cc.Prefab = null;

    @property({ type: cc.Node, displayName: '提示框根节点（定位用）' })
    nodeTooltipRoot: cc.Node = null;

    @property({ type: cc.Button, displayName: '打开提示框按钮' })
    btnOpen: cc.Button = null;

    // === 私有状态属性 ===
    private _nodeTooltip: cc.Node = null; // 实例化后的提示框节点
    private _aniNode: cc.Animation = null; // 提示框动画组件
    private _lblPoint: cc.Label = null; // 提示框数值文本
    private _curPoint: number = -1; // 当前显示的数值
    private _numCountTime: number = 0; // 提示框倒计时
    private _eUIState: FeverTooltipUIState = FeverTooltipUIState.NONE; // 当前UI状态

    onLoad() {
        // 绑定按钮点击事件
        this.btnOpen.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "IngameSuiteLeagueFeverToolTipUI", "onClick_Open", "")
        );

        // 校验是否为 Suite 区域且 FeverMode 已开启，否则隐藏UI并轮询检查
        const isSuiteZone = SlotManager.Instance.userInfoInterface.getZoneName() === SDefine.SUITE_ZONENAME;
        const isFeverModeOpen = SlotManager.Instance.feverModeInfoInterface.isOpenFeverMode() !== 0;
        if (!(isSuiteZone && isFeverModeOpen)) {
            this.activeTooltipUI(false);
            this.schedule(this.openFeverMode.bind(this), 1); // 每秒检查一次
        }
    }

    /**
     * 轮询检查并打开 FeverMode 提示UI
     */
    openFeverMode() {
        if (SlotManager.Instance.feverModeInfoInterface.isOpenFeverMode() !== 0) {
            this.unscheduleAllCallbacks(); // 停止轮询
            // 校验区域并激活UI
            if (SlotManager.Instance.userInfoInterface.getZoneName() === SDefine.SUITE_ZONENAME) {
                this.activeTooltipUI(true);
            }
        }
    }

    /**
     * 创建提示框实例（预制体实例化 + 节点挂载 + 事件绑定）
     * @returns 是否创建成功
     */
    createTooltip(): boolean {
        // FeverMode 未开启则创建失败
        if (SlotManager.Instance.feverModeInfoInterface.isOpenFeverMode() === 0) {
            return false;
        }

        // 提示框已存在则直接返回成功
        if (this._nodeTooltip !== null) {
            return true;
        }

        // 获取游戏UI根节点
        const inGameUINode = SlotManager.Instance._inGameUI?.node;
        if (!inGameUINode) {
            return false;
        }

        // 实例化提示框预制体
        const tooltipNode = cc.instantiate(this.prefTooltip);
        if (!tooltipNode) {
            return false;
        }

        // 挂载节点并设置位置
        tooltipNode.active = true;
        inGameUINode.addChild(tooltipNode);
        // 转换坐标（世界坐标转本地坐标）
        const worldPos = this.nodeTooltipRoot.convertToWorldSpaceAR(cc.v2(0, 0));
        const localPos = inGameUINode.convertToNodeSpaceAR(worldPos);
        tooltipNode.setPosition(localPos);

        // 获取提示框内部组件
        this._aniNode = tooltipNode.getChildByName("Pivot")?.getComponent(cc.Animation);
        this._lblPoint = this._aniNode?.node.getChildByName("Font_Bet")?.getComponent(cc.Label);
        this._nodeTooltip = tooltipNode;
        this._nodeTooltip.active = false; // 初始隐藏

        // 绑定关闭事件
        SlotManager.Instance.addEventListener(cc.Node.EventType.TOUCH_START, this.onClose.bind(this));
        SlotManager.Instance.addSlotTooltip(SlotManager.Instance.TOOLTIP_FEVER_MODE, this.onClose.bind(this));
        SlotManager.Instance.checkSlotTooltip(SlotManager.Instance.TOOLTIP_FEVER_MODE);

        // 监听滚轮旋转状态变化，更新按钮交互性
        this.node.on("changeReelSpinState", this.setButtonActiveState.bind(this));
        SlotReelSpinStateManager.Instance.addObserver(this.node);

        return true;
    }

    /**
     * 帧更新：处理提示框倒计时
     * @param deltaTime 帧间隔时间（秒）
     */
    update(deltaTime: number) {
        if (!this._nodeTooltip || !this._nodeTooltip.active) {
            return;
        }

        this._numCountTime -= deltaTime;
        if (this._numCountTime <= 0) {
            this._numCountTime = 0;
            this.onClose(); // 倒计时结束关闭提示框
        }
    }

    /**
     * 设置按钮交互状态（滚轮停止时可点击）
     */
    setButtonActiveState() {
        const currentState = SlotReelSpinStateManager.Instance.getCurrentState();
        this.btnOpen.interactable = currentState === SlotReelSpinStateManager.STATE_STOP;
    }

    /**
     * 点击打开提示框按钮回调
     */
    onClick_Open() {
        // 仅滚轮停止时响应
        if (SlotReelSpinStateManager.Instance.getCurrentState() !== SlotReelSpinStateManager.STATE_STOP) {
            return;
        }

        // 播放按钮音效
        if (SoundManager.Instance()) {
            GameCommonSound.playFxOnce("btn_etc");
        }

        // 创建提示框并处理显示逻辑
        const isTooltipCreated = this.createTooltip();
        if (isTooltipCreated) {
            const isTooltipValid = TSUtility.isValid(this._nodeTooltip);
            if (isTooltipValid && !this._nodeTooltip.active) {
                this.setFeverTooltipInfo(true); // 显示提示框
            } else {
                this.onClose(); // 已显示则关闭
            }
        }
    }

    /**
     * 设置 FeverMode 提示框信息（数值、动画、状态）
     * @param isForceUpdate 是否强制更新
     */
    setFeverTooltipInfo(isForceUpdate: boolean = false) {
        // 确保提示框已创建
        if (!this.createTooltip()) {
            return;
        }

        // 更新提示框位置（确保定位准确）
        if (TSUtility.isValid(SlotManager.Instance._inGameUI)) {
            const worldPos = this.nodeTooltipRoot.convertToWorldSpaceAR(cc.v2(0, 0));
            const localPos = SlotManager.Instance._inGameUI.node.convertToNodeSpaceAR(worldPos);
            this._nodeTooltip.setPosition(localPos);
        }

        // 获取当前投注金额和对应的 FeverMode 点数
        const currentBet = SlotGameRuleManager.Instance.getCurrentBetMoney();
        const feverPoint = SlotManager.Instance.feverModeInfoInterface.getFeverModePointData(currentBet);

        // 点数未变化且非强制更新则跳过
        if (this._curPoint === feverPoint && !isForceUpdate) {
            return;
        }

        // 重置倒计时并显示提示框
        this._numCountTime = this.ACTIVE_TIME;
        this._nodeTooltip.active = true;
        this._curPoint = feverPoint;
        this._lblPoint.string = feverPoint > 0 ? feverPoint.toString() : "";

        // 根据UI状态切换动画
        switch (this._eUIState) {
            case FeverTooltipUIState.NONE:
                // 初始状态：根据点数设置状态并播放初始动画
                this._eUIState = feverPoint > 0 ? FeverTooltipUIState.NORMAL : FeverTooltipUIState.LOCK;
                this._aniNode.stop();
                this._aniNode.play(
                    this._eUIState === FeverTooltipUIState.NORMAL 
                        ? this.ANIMATION_NAME_ON_IDLE 
                        : this.ANIMATION_NAME_OFF_IDLE
                );
                // 监听投注金额变化
                SlotGameRuleManager.Instance.addObserver(this.node);
                this.node.on("changeMoneyState", this.setFeverTooltipInfo.bind(this));
                break;

            case FeverTooltipUIState.LOCK:
                // 锁定状态 → 正常状态（点数>0）
                if (feverPoint > 0) {
                    this._eUIState = FeverTooltipUIState.NORMAL;
                    this._aniNode.stop();
                    this._aniNode.play(this.ANIMATION_NAME_CHANGE_ON);
                }
                break;

            case FeverTooltipUIState.NORMAL:
                // 正常状态 → 锁定状态（点数≤0） 或 数值更新（点数>0）
                if (feverPoint <= 0) {
                    this._eUIState = FeverTooltipUIState.LOCK;
                    this._aniNode.stop();
                    this._aniNode.play(this.ANIMATION_NAME_CHANGE_OFF);
                } else {
                    this._aniNode.stop();
                    this._aniNode.play(this.ANIMATION_NAME_CHANGE_NUM);
                }
                break;
        }
    }

    /**
     * 关闭提示框
     */
    onClose() {
        if (TSUtility.isValid(this._nodeTooltip)) {
            this._nodeTooltip.active = false;
        }
    }

    /**
     * 播放提示框启动动画
     */
    playStartAni() {
        this.node.active = true;
        this.setFeverTooltipInfo();
        this._numCountTime = 1.5;
    }

    /**
     * 激活/隐藏提示框UI根节点
     * @param isActive 是否激活
     */
    activeTooltipUI(isActive: boolean) {
        this.node.active = isActive;
    }

    /**
     * 设置 FeverMode 按钮根节点位置
     * @param targetPos 目标位置（世界坐标）
     */
    setFeverModeButtonRootPos(targetPos: cc.Node) {
        const localPos = TSUtility.getLocalPosition(targetPos, this.btnOpen.node.parent);
        this.btnOpen.node.setPosition(localPos);
    }

    /**
     * 设置 FeverMode 提示框根节点位置
     * @param targetPos 目标位置（世界坐标）
     */
    setFeverModeToolTipRootPos(targetPos: cc.Node) {
        const localPos = TSUtility.getLocalPosition(targetPos, this.nodeTooltipRoot.parent);
        this.nodeTooltipRoot.setPosition(localPos);
    }
}