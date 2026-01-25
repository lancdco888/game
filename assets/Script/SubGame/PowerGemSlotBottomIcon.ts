const { ccclass, property } = cc._decorator;

// ===================== 顶部直接导入所有外部模块 =====================
import TSUtility from "../global_utility/TSUtility";
import SlotGameRuleManager from "../manager/SlotGameRuleManager";
import SlotManager from "../manager/SlotManager";
import SlotReelSpinStateManager from "../Slot/SlotReelSpinStateManager";
import GameCommonSound from "../GameCommonSound";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import UserInfo from "../User/UserInfo";
import PowerGemManager, { PowerGemLevelGradeType } from "../manager/PowerGemManager";
import PowerGemSlotBottomToolTip from "./PowerGemSlotBottomToolTip";
import PowerGemSlotBottomUI from "./PowerGemSlotBottomUI";

/**
 * PowerGem老虎机底部图标组件 (核心交互入口)
 * PowerGemSlotBottomIcon
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class PowerGemSlotBottomIcon extends cc.Component {
    // ===================== 常量定义 【与原JS完全一致】 =====================
    private readonly ANIMATION_NAME_CHANGE_BET: string = "Powergem_BottomIcon_Ani";

    // ===================== Cocos 序列化属性 【与原JS @property 1:1精准对应】 =====================
    @property({ type: cc.Prefab, displayName: "PowerGem Slot预制体" })
    public prefPowerGemSlot: cc.Prefab = null;

    @property({ type: cc.Prefab, displayName: "PowerGem提示预制体" })
    public prefPowerGemToolTip: cc.Prefab = null;

    @property({ type: cc.Prefab, displayName: "PowerGem打开提示预制体" })
    public prefPowerGemOpenToolTip: cc.Prefab = null;

    @property({ type: cc.Node, displayName: "PowerGem Slot根节点" })
    public nodePowerGemSlotRoot: cc.Node = null;

    @property({ type: cc.Node, displayName: "PowerGem提示根节点" })
    public nodePowerGemToolTipRoot: cc.Node = null;

    @property({ type: cc.Node, displayName: "暗淡图标节点" })
    public nodeIcon_Dimmed: cc.Node = null;

    @property({ type: cc.Node, displayName: "青铜图标节点" })
    public nodeIcon_Bronze: cc.Node = null;

    @property({ type: cc.Node, displayName: "白银图标节点" })
    public nodeIcon_Silver: cc.Node = null;

    @property({ type: cc.Node, displayName: "黄金图标节点" })
    public nodeIcon_Gold: cc.Node = null;

    @property({ type: cc.Label, displayName: "等级文本" })
    public lblLevel: cc.Label = null;

    @property({ type: cc.Label, displayName: "暗淡等级文本" })
    public lblDimLevel: cc.Label = null;

    // ===================== 私有成员变量 【补充TS强类型声明】 =====================
    private _anim: cc.Animation = null;
    private _btnIcon: cc.Button = null;
    private _uiPowerGemSlot: PowerGemSlotBottomUI = null;
    private _uiPowerGemToolTip: PowerGemSlotBottomToolTip = null;
    private _uiPowerGemOpenToolTip: PowerGemSlotBottomToolTip = null;
    private _isInitialized: boolean = false;
    private _numPrevTotalBet: number = 0;
    private _isActivePowerGemUI: boolean = false;
    private _isIconTouch: boolean = false;
    private _eGradeType: PowerGemLevelGradeType = PowerGemLevelGradeType.DIMMED;

    // ===================== 生命周期方法 【1:1还原原JS逻辑，移除this.模块引用】 =====================
    onLoad(): void {
        this.node.active = false;
        // // 监听用户等级升级、VIP积分变化事件
        // UserInfo.instance().addListenerTarget(
        //     UserInfo.MSG.UPDATE_LEVEL_UP,
        //     this.updatePowerGemEvent,
        //     this
        // );
        // UserInfo.instance().addListenerTarget(
        //     UserInfo.MSG.UPDATE_VIP_POINT,
        //     this.updatePowerGemUI,
        //     this
        // );
    }

    /**
     * 更新PowerGem事件状态 - 控制组件显隐、初始化
     * @param isLevelUp 是否等级升级触发（默认false）
     */
    updatePowerGemEvent(isLevelUp: boolean = false): void {
        // 移除this. → 直接使用PowerGemManager
        if (PowerGemManager.instance.isAvailablePowerGem(true)) {
            this.node.active = true;
            if (!this._isInitialized) {
                this.initialize();
                if (!isLevelUp) {
                    this._btnIcon.interactable = true;
                }
            }
        } else {
            this.node.active = false;
        }
    }

    /**
     * 创建PowerGem Slot UI实例
     * @returns 是否创建成功
     */
    createPowerGemSlot(): boolean {
        // 校验PowerGem可用性（移除this.）
        if (!PowerGemManager.instance.isAvailablePowerGem(true)) return false;
        // 已创建则直接返回成功
        if (this._uiPowerGemSlot) return true;

        // 获取游戏UI根节点（移除this.）
        const gameUINode = SlotManager.Instance._inGameUI.node;
        if (!TSUtility.isValid(gameUINode)) return false;

        // 实例化预制体
        const slotPrefab = cc.instantiate(this.prefPowerGemSlot);
        if (!TSUtility.isValid(slotPrefab)) return false;

        // 设置预制体状态并添加到父节点
        slotPrefab.active = true;
        gameUINode.addChild(slotPrefab);

        // 计算并设置坐标（世界坐标转本地坐标）
        const worldPos = this.nodePowerGemSlotRoot.convertToWorldSpaceAR(cc.v2(0, 0));
        const localPos = gameUINode.convertToNodeSpaceAR(worldPos);
        slotPrefab.setPosition(localPos);

        // 获取组件实例并初始化（移除this.）
        this._uiPowerGemSlot = slotPrefab.getComponent(PowerGemSlotBottomUI);
        this._uiPowerGemSlot.initialize(this.changeIconTouchEvent.bind(this));
        this._uiPowerGemSlot.node.active = false;

        return true;
    }

    /**
     * 创建PowerGem ToolTip提示UI实例
     * @returns 是否创建成功
     */
    createPowerGemToolTip(): boolean {
        // 校验PowerGem可用性（移除this.）
        if (!PowerGemManager.instance.isAvailablePowerGem(true)) return false;
        // 已创建则直接返回成功
        if (this._uiPowerGemToolTip) return true;

        // 获取游戏UI根节点（移除this.）
        const gameUINode = SlotManager.Instance._inGameUI.node;
        if (!TSUtility.isValid(gameUINode)) return false;

        // 实例化预制体
        const tooltipPrefab = cc.instantiate(this.prefPowerGemToolTip);
        if (!TSUtility.isValid(tooltipPrefab)) return false;

        // 设置预制体状态并添加到父节点
        tooltipPrefab.active = true;
        gameUINode.addChild(tooltipPrefab);

        // 计算并设置坐标（世界坐标转本地坐标）
        const worldPos = this.nodePowerGemToolTipRoot.convertToWorldSpaceAR(cc.v2(0, 0));
        const localPos = gameUINode.convertToNodeSpaceAR(worldPos);
        tooltipPrefab.setPosition(localPos);

        // 获取组件实例并设置回调（移除this.）
        this._uiPowerGemToolTip = tooltipPrefab.getComponent(PowerGemSlotBottomToolTip);
        this._uiPowerGemToolTip.node.active = false;
        this._uiPowerGemToolTip.setCloseCallback(() => {
            this._btnIcon.interactable = true;
        });

        return true;
    }

    /**
     * 创建PowerGem OpenToolTip提示UI实例
     * @returns 是否创建成功
     */
    createPowerGemOpenToolTip(): boolean {
        // 校验PowerGem可用性（移除this.）
        if (!PowerGemManager.instance.isAvailablePowerGem(true)) return false;
        // 已创建则直接返回成功
        if (this._uiPowerGemOpenToolTip) return true;

        // 获取游戏UI根节点（移除this.）
        const gameUINode = SlotManager.Instance._inGameUI.node;
        if (!TSUtility.isValid(gameUINode)) return false;

        // 实例化预制体
        const openTooltipPrefab = cc.instantiate(this.prefPowerGemOpenToolTip);
        if (!TSUtility.isValid(openTooltipPrefab)) return false;

        // 设置预制体状态并添加到父节点
        openTooltipPrefab.active = true;
        gameUINode.addChild(openTooltipPrefab);

        // 计算并设置坐标（世界坐标转本地坐标）
        const worldPos = this.nodePowerGemToolTipRoot.convertToWorldSpaceAR(cc.v2(0, 0));
        const localPos = gameUINode.convertToNodeSpaceAR(worldPos);
        openTooltipPrefab.setPosition(localPos);

        // 获取组件实例并设置回调（移除this.）
        this._uiPowerGemOpenToolTip = openTooltipPrefab.getComponent(PowerGemSlotBottomToolTip);
        this._uiPowerGemOpenToolTip.node.active = false;
        this._uiPowerGemOpenToolTip.setCloseCallback(() => {
            this._btnIcon.interactable = true;
        });

        return true;
    }

    /**
     * 初始化组件 - 绑定事件、获取组件、初始化状态
     */
    initialize(): void {
        // 注册PowerGem剩余时间更新回调（移除this.）
        PowerGemManager.instance.addUpdateTimeFunc(this.updateRemainEventTime.bind(this));
        
        // 绑定按钮交互事件
        this._btnIcon = this.getComponent(cc.Button);
        this._btnIcon.node.on(cc.Node.EventType.TOUCH_START, this.onClick_IconTouchStart.bind(this), this);
        this._btnIcon.node.on(cc.Node.EventType.TOUCH_END, this.onClick_Icon.bind(this), this);
        this._btnIcon.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onClick_IconTouchCancel.bind(this), this);
        this._btnIcon.interactable = false;

        // 监听投注金额变化、滚轮旋转状态变化事件（移除this.）
        this.node.on("changeMoneyState", this.onChangeMoneyState.bind(this));
        SlotGameRuleManager.Instance.addObserver(this.node);
        this.node.on("changeReelSpinState", this.onChangeReelSpinState.bind(this));
        SlotReelSpinStateManager.Instance.addObserver(this.node);

        // 获取动画组件（移除this.）
        const pivotNode = this.node.getChildByName("Pivot");
        if (TSUtility.isValid(pivotNode)) {
            this._anim = pivotNode.getComponent(cc.Animation);
        }

        // 初始化金额状态、标记初始化完成
        this.onChangeMoneyState();
        this._isInitialized = true;
    }

    /**
     * 响应滚轮旋转状态变化 - 关闭所有PowerGem UI并控制按钮交互性
     */
    onChangeReelSpinState(): void {
        // 关闭所有打开的PowerGem UI（移除this.）
        if (TSUtility.isValid(this._uiPowerGemSlot) && this._uiPowerGemSlot.node.active) {
            this._uiPowerGemSlot.node.active = false;
        }
        if (TSUtility.isValid(this._uiPowerGemToolTip) && this._uiPowerGemToolTip.node.active) {
            this._uiPowerGemToolTip.node.active = false;
        }
        if (TSUtility.isValid(this._uiPowerGemOpenToolTip) && this._uiPowerGemOpenToolTip.node.active) {
            this._uiPowerGemOpenToolTip.node.active = false;
        }

        // 获取当前滚轮状态并控制按钮交互性（移除this.）
        const reelStateManager = SlotReelSpinStateManager.Instance;
        const currentState = reelStateManager.getCurrentState();
        this._btnIcon.interactable = currentState === SlotReelSpinStateManager.STATE_STOP;

        // 滚轮停止且非自动旋转/免费旋转时，自动打开对应提示（移除this.）
        if (currentState === SlotReelSpinStateManager.STATE_STOP && 
            !reelStateManager.getAutospinMode() && 
            !reelStateManager.getFreespinMode()) {
            if (PowerGemManager.instance.isCompletePowerGem()) {
                this.openOpenToolTipUI();
            } else if (!PowerGemManager.instance.isReceivePowerGemAnymore()) {
                this.openToolTipUI();
            }
        }
    }

    /**
     * 响应投注金额变化 - 更新PowerGem UI并播放动画
     */
    onChangeMoneyState(): void {
        // 移除this. → 直接使用SlotGameRuleManager
        const currentBet = SlotGameRuleManager.Instance.getCurrentBetMoney();
        // 投注金额变化时才执行更新
        if (this._numPrevTotalBet !== currentBet) {
            this._numPrevTotalBet = currentBet;
            this.updatePowerGemUI();
            // 非暗淡等级时播放投注变化动画（移除this.）
            if (this._eGradeType !== PowerGemLevelGradeType.DIMMED && this._anim) {
                this._anim.play(this.ANIMATION_NAME_CHANGE_BET, 0);
            }
        }
    }

    /**
     * 更新PowerGem UI - 根据等级切换图标并更新等级文本
     */
    updatePowerGemUI(): void {
        // 获取用户VIP等级和PowerGem等级（移除this.）
        const userVipLevel = 0;//UserInfo.instance().getUserVipInfo().level;
        const powerGemLevel = PowerGemManager.instance.getPowerGemLevel(this._numPrevTotalBet);
        // 获取PowerGem等级类型（DIMMED/BRONZE/SILVER/GOLD）（移除this.）
        this._eGradeType = PowerGemManager.instance.getPowerGemGrade(powerGemLevel, userVipLevel);

        // 切换对应等级图标显隐（移除this.）
        if (TSUtility.isValid(this.nodeIcon_Dimmed)) {
            this.nodeIcon_Dimmed.active = this._eGradeType === PowerGemLevelGradeType.DIMMED;
        }
        if (TSUtility.isValid(this.nodeIcon_Bronze)) {
            this.nodeIcon_Bronze.active = this._eGradeType === PowerGemLevelGradeType.BRONZE;
        }
        if (TSUtility.isValid(this.nodeIcon_Silver)) {
            this.nodeIcon_Silver.active = this._eGradeType === PowerGemLevelGradeType.SILVER;
        }
        if (TSUtility.isValid(this.nodeIcon_Gold)) {
            this.nodeIcon_Gold.active = this._eGradeType === PowerGemLevelGradeType.GOLD;
        }

        // 更新等级文本（移除this.）
        if (TSUtility.isValid(this.lblLevel)) {
            this.lblLevel.string = powerGemLevel.toString();
            this.lblLevel.node.active = this._eGradeType !== PowerGemLevelGradeType.DIMMED;
        }
        if (TSUtility.isValid(this.lblDimLevel)) {
            this.lblDimLevel.string = powerGemLevel.toString();
        }
    }

    /**
     * 打开PowerGem信息UI - 根据状态选择打开对应UI
     */
    openPowerGemInfo(): void {
        // 仅滚轮停止时执行（移除this.）
        if (SlotReelSpinStateManager.Instance.getCurrentState() !== SlotReelSpinStateManager.STATE_STOP) {
            return;
        }

        // 校验新手教程条件（移除this.）
        const promotion = PowerGemManager.instance.getPromotion();
        if (TSUtility.isValid(promotion) && 
            promotion.numEventEndDate > ServerStorageManager.getAsNumber(StorageKeyType.TUTORIAL_POWER_GEM_FIRST_COMPLETE)) {
            
            const powerGemArr = PowerGemManager.instance.getPowerGemArrInfo();
            if (TSUtility.isValid(powerGemArr)) {
                let hasComplete = false;
                for (let i = 0; i < powerGemArr.length; i++) {
                    if (powerGemArr[i].isComplete()) {
                        hasComplete = true;
                        break;
                    }
                }
                if (hasComplete) {
                    this.playPowerGemTutorial(2);
                    return;
                }
            }
        }

        // 根据PowerGem状态打开对应UI（移除this.）
        if (PowerGemManager.instance.isCompletePowerGem()) {
            this.openOpenToolTipUI();
        } else if (!PowerGemManager.instance.isReceivePowerGemAnymore()) {
            this.openToolTipUI();
        } else {
            this.openPowerGemSlotUI();
            // 3秒后再次校验UI状态
            this.scheduleOnce(() => {
                if (this._uiPowerGemSlot && this._uiPowerGemSlot.node.active) {
                    this.openPowerGemSlotUI();
                }
            }, 3);
            this._btnIcon.interactable = true;
        }
    }

    /**
     * 打开ToolTip提示UI
     */
    openToolTipUI(): void {
        // 仅未领取完PowerGem时执行（移除this.）
        if (PowerGemManager.instance.isReceivePowerGemAnymore()) return;
        // 创建UI并控制显隐（移除this.）
        if (!this.createPowerGemToolTip() || !TSUtility.isValid(this._uiPowerGemToolTip)) {
            return;
        }

        // 关闭其他UI（移除this.）
        if (TSUtility.isValid(this._uiPowerGemOpenToolTip) && this._uiPowerGemOpenToolTip.node.active) {
            this._uiPowerGemOpenToolTip.node.active = false;
        }
        if (TSUtility.isValid(this._uiPowerGemSlot) && this._uiPowerGemSlot.node.active) {
            this._uiPowerGemSlot.node.active = false;
        }

        // 显示ToolTip UI
        this._uiPowerGemToolTip.node.active = true;
    }

    /**
     * 打开OpenToolTip提示UI
     */
    openOpenToolTipUI(): void {
        // 仅完成PowerGem时执行（移除this.）
        if (!PowerGemManager.instance.isCompletePowerGem()) return;
        // 创建UI并控制显隐（移除this.）
        if (!this.createPowerGemOpenToolTip() || !TSUtility.isValid(this._uiPowerGemOpenToolTip)) {
            return;
        }

        // 关闭其他UI（移除this.）
        if (TSUtility.isValid(this._uiPowerGemToolTip) && this._uiPowerGemToolTip.node.active) {
            this._uiPowerGemToolTip.node.active = false;
        }
        if (TSUtility.isValid(this._uiPowerGemSlot) && this._uiPowerGemSlot.node.active) {
            this._uiPowerGemSlot.node.active = false;
        }

        // 显示OpenToolTip UI
        this._uiPowerGemOpenToolTip.node.active = true;
    }

    /**
     * 打开PowerGem Slot UI
     */
    openPowerGemSlotUI(): void {
        // 未初始化则先初始化
        if (!this._isInitialized) {
            this.initialize();
        }

        // 创建UI并控制显隐（移除this.）
        if (!this.createPowerGemSlot() || !TSUtility.isValid(this._uiPowerGemSlot)) {
            return;
        }

        // 控制按钮交互性
        this._btnIcon.interactable = false;
        // 切换UI显隐状态
        if (this._uiPowerGemSlot.node.active) {
            this._uiPowerGemSlot.node.active = false;
        } else {
            this._uiPowerGemSlot.node.active = true;
            this._uiPowerGemSlot.updateUI();
        }

        // 清除所有调度器并0.5秒后恢复按钮交互
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this._btnIcon.interactable = true;
        }, 0.5);
    }

    /**
     * 响应图标按下事件 - 标记触摸状态
     */
    onClick_IconTouchStart(): void {
        this._isIconTouch = true;
    }

    /**
     * 响应图标触摸取消事件 - 重置触摸状态
     */
    onClick_IconTouchCancel(): void {
        this._isIconTouch = false;
    }

    /**
     * 响应图标点击事件 - 核心交互逻辑
     */
    onClick_Icon(): void {
        // 按钮不可交互或滚轮未停止时不执行（移除this.）
        if (!this._btnIcon.interactable || 
            SlotReelSpinStateManager.Instance.getCurrentState() !== SlotReelSpinStateManager.STATE_STOP) {
            return;
        }

        // 播放点击音效（移除this.）
        GameCommonSound.playFxOnce("btn_etc");

        // 关闭已打开的提示UI（移除this.）
        if (TSUtility.isValid(this._uiPowerGemToolTip) && this._uiPowerGemToolTip.node.active) {
            this._uiPowerGemToolTip.node.active = false;
        }
        if (TSUtility.isValid(this._uiPowerGemOpenToolTip) && this._uiPowerGemOpenToolTip.node.active) {
            this._uiPowerGemOpenToolTip.node.active = false;
        }

        // 切换PowerGem UI显隐状态
        if (this._isActivePowerGemUI) {
            if (!TSUtility.isValid(this._uiPowerGemSlot)) return;
            this._uiPowerGemSlot.node.active = false;
            this._isActivePowerGemUI = false;
        } else {
            this.openPowerGemSlotUI();
        }

        // 重置触摸状态
        this._isIconTouch = false;
    }

    /**
     * 更新PowerGem事件剩余时间 - 超时后清理资源
     * @param remainTime 剩余时间（秒）
     */
    updateRemainEventTime(remainTime: number): void {
        if (remainTime <= 0) {
            // 清除所有调度器
            this.unscheduleAllCallbacks();
            // 关闭所有PowerGem UI（移除this.）
            if (TSUtility.isValid(this._uiPowerGemSlot)) {
                this._uiPowerGemSlot.node.active = false;
            }
            if (TSUtility.isValid(this._uiPowerGemToolTip)) {
                this._uiPowerGemToolTip.node.active = false;
            }
            // 移除时间更新回调（移除this.）
            PowerGemManager.instance.removeUpdateTimeFunc(this.updateRemainEventTime.bind(this));
            // 隐藏组件（移除this.）
            if (TSUtility.isValid(this.node)) {
                this.node.active = false;
            }
        }
    }

    /**
     * 播放PowerGem新手教程
     * @param tutorialType 教程类型
     */
    async playPowerGemTutorial(tutorialType: number): Promise<void> {
        // 创建Slot UI失败则直接返回（移除this.）
        if (!this.createPowerGemSlot() || !TSUtility.isValid(this._uiPowerGemSlot)) {
            return;
        }

        // 显示并初始化教程UI
        this._uiPowerGemSlot.node.active = true;
        this._uiPowerGemSlot.updateUI();
        this._uiPowerGemSlot.node.opacity = 255;
        this._uiPowerGemSlot.unscheduleAllCallbacks();

        // 等待教程播放完成
        await new Promise((resolve) => {
            this._uiPowerGemSlot.playPowerGemTutorial(tutorialType, () => {
                // 销毁UI并重置实例
                this._uiPowerGemSlot.node.destroy();
                this._uiPowerGemSlot = null;
                // 重新打开Slot UI
                this.openPowerGemSlotUI();
                resolve(null);
            });
        });
    }

    /**
     * 切换图标触摸事件状态
     * @param isActive UI是否激活
     */
    changeIconTouchEvent(isActive: boolean): void {
        this._isActivePowerGemUI = isActive;
        // 0.1秒后校验触摸状态（移除this.）
        this.scheduleOnce(() => {
            if (this._isActivePowerGemUI && !this._isIconTouch) {
                this._isActivePowerGemUI = false;
            }
        }, 0.1);
    }

    /**
     * 设置PowerGem Slot根节点位置
     * @param targetPos 目标位置
     */
    setPowerGemSlotRootPos(targetPos: cc.Node): void {
        // 移除this. → 直接使用TSUtility
        const localPos = TSUtility.getLocalPosition(targetPos, this.nodePowerGemSlotRoot.parent);
        this.nodePowerGemSlotRoot.setPosition(localPos);
    }

    /**
     * 设置PowerGem ToolTip根节点位置
     * @param targetPos 目标位置
     */
    setPowerGemToolTipRootPos(targetPos: cc.Node): void {
        // 移除this. → 直接使用TSUtility
        const localPos = TSUtility.getLocalPosition(targetPos, this.nodePowerGemToolTipRoot.parent);
        this.nodePowerGemToolTipRoot.setPosition(localPos);
    }
}

// ===================== Cocos Creator 2.4.13 兼容配置 =====================
module.exports = PowerGemSlotBottomIcon;