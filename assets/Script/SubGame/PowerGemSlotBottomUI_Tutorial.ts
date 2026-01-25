const { ccclass, property } = cc._decorator;


import TutorialBase, { TutorialState } from "../Lobby/TutorialBase";
import TSUtility from "../global_utility/TSUtility";
import PopupManager from "../manager/PopupManager";
import PowerGemManager from "../manager/PowerGemManager";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import SlotManager from "../manager/SlotManager";
import PowerGemSlotPopup, { PowerGemSlotOpenType } from "./PowerGemSlotPopup";

/**
 * PowerGem老虎机底部UI教程组件 (新手引导+交互指引)
 * PowerGemSlotBottomUI_Tutorial
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class PowerGemSlotBottomUI_Tutorial extends TutorialBase {
    // ===================== Cocos 序列化属性 【与原JS 1:1精准对应】 =====================
    @property({ type: cc.Node, displayName: "提示框1节点" })
    public nodeToolTip_1: cc.Node = null;

    @property({ type: cc.Node, displayName: "提示框2节点" })
    public nodeToolTip_2: cc.Node = null;

    @property({ type: cc.Node, displayName: "提示框1箭头节点" })
    public nodeToolTip_1_Arrow: cc.Node = null;

    @property({ type: cc.Node, displayName: "提示框2箭头节点" })
    public nodeToolTip_2_Arrow: cc.Node = null;

    @property({ type: cc.Node, displayName: "手指指引节点" })
    public nodeFinger: cc.Node = null;

    @property({ type: cc.Node, displayName: "UI根节点" })
    public nodeUIRoot: cc.Node = null;

    // ===================== 私有成员变量 【补充TS强类型声明】 =====================
    private _bottomSlotUI: any = null; // 底部SlotUI实例（根据项目实际类型替换）
    private _finish: Function = null;

    // ===================== 核心方法 【1:1还原原JS逻辑】 =====================
    /**
     * 初始化教程组件
     */
    public initialize(): void {
        // 隐藏所有教程提示节点
        if (TSUtility.isValid(this.nodeToolTip_1)) {
            this.nodeToolTip_1.active = false;
        }
        if (TSUtility.isValid(this.nodeToolTip_2)) {
            this.nodeToolTip_2.active = false;
        }
        if (TSUtility.isValid(this.nodeFinger)) {
            this.nodeFinger.active = false;
        }
    }

    /**
     * 播放"首次获取PowerGem"教程
     * @param bottomSlotUI 底部SlotUI实例
     * @param finishCallback 完成回调
     */
    public playPowerGemTutorial_FirstGetPowerGem(bottomSlotUI: any, finishCallback: Function): void {
        this._bottomSlotUI = bottomSlotUI;
        this._finish = finishCallback;

        // 添加教程数据（首次获取教程状态）
        this.addTutorialData(new PowerGemTutorial_FirstGetPowerGem(
            this._bottomSlotUI,
            this.nodeToolTip_1,
            this.nodeFinger,
            this.nodeUIRoot,
            this.nodeToolTip_1_Arrow
        ));

        // 禁用键盘事件，启动教程
        SlotManager.Instance.setKeyboardEventFlag(false);
        this.onStart(() => {
            // 教程完成后恢复键盘事件，执行回调
            SlotManager.Instance.setKeyboardEventFlag(true);
            if (TSUtility.isValid(this._finish)) {
                this._finish();
            }

            // 记录教程完成时间
            const promotion = PowerGemManager.instance.getPromotion();
            if (TSUtility.isValid(promotion)) {
                ServerStorageManager.save(
                    StorageKeyType.TUTORIAL_POWER_GEM_FIRST_GET_POWER_GEM,
                    promotion.numEventEndDate
                );
            }
        }, false);
    }

    /**
     * 播放"首次完成PowerGem"教程
     * @param bottomSlotUI 底部SlotUI实例
     * @param finishCallback 完成回调
     */
    public playPowerGemTutorial_FirstComplete(bottomSlotUI: any, finishCallback: Function): void {
        this._bottomSlotUI = bottomSlotUI;
        this._finish = finishCallback;

        // 添加教程数据（首次完成教程状态）
        this.addTutorialData(new PowerGemTutorial_FirstComplete(
            this._bottomSlotUI,
            this.nodeToolTip_2,
            this.nodeFinger,
            this.nodeUIRoot,
            this.nodeToolTip_2_Arrow
        ));

        // 禁用键盘事件，启动教程
        SlotManager.Instance.setKeyboardEventFlag(false);
        this.onStart(() => {
            // 教程完成后恢复键盘事件，执行回调
            SlotManager.Instance.setKeyboardEventFlag(true);
            if (TSUtility.isValid(this._finish)) {
                this._finish();
            }
        }, false);

        // 记录教程完成时间
        const promotion = PowerGemManager.instance.getPromotion();
        if (TSUtility.isValid(promotion)) {
            ServerStorageManager.save(
                StorageKeyType.TUTORIAL_POWER_GEM_FIRST_COMPLETE,
                promotion.numEventEndDate
            );
        }
    }
}

/**
 * "首次获取PowerGem"教程状态类
 * 继承自TutorialState基类
 */
export class PowerGemTutorial_FirstGetPowerGem extends TutorialState {
    // ===================== 常量定义 【与原JS完全一致】 =====================
    private readonly TIME_DELAY: number = 5;

    // ===================== 私有成员变量 【补充TS强类型声明】 =====================
    private _bottomSlotUI: any = null;
    private _nodeToolTip: cc.Node = null;
    private _nodeFinger: cc.Node = null;
    private _nodeUIRoot: cc.Node = null;
    private _nodeArrow: cc.Node = null;
    private _nodeBeforeParent: cc.Node = null;
    private _numSlotIndex: number = 0;

    /**
     * 教程启动逻辑
     */
    public _onStart(): void {
        // 解析教程数据
        this._bottomSlotUI = this._listData[0];
        this._nodeToolTip = this._listData[1];
        this._nodeFinger = this._listData[2];
        this._nodeUIRoot = this._listData[3];
        this._nodeArrow = this._listData[4];

        // 获取PowerGem信息数组
        const powerGemArrInfo = PowerGemManager.instance.getPowerGemArrInfo();

        // 信息数组有效时处理
        if (TSUtility.isValid(powerGemArrInfo) && powerGemArrInfo.length > 0) {
            // 查找第一个非空的Slot索引
            for (let i = 0; i < powerGemArrInfo.length; i++) {
                if (!powerGemArrInfo[i].isEmpty()) {
                    this._numSlotIndex = i;
                    break;
                }
            }

            // 底部SlotUI有效时处理节点挂载和显隐
            if (TSUtility.isValid(this._bottomSlotUI)) {
                this._nodeBeforeParent = this._bottomSlotUI.node.parent;
                const inGameUINode = SlotManager.Instance._inGameUI.node;

                if (TSUtility.isValid(inGameUINode)) {
                    // 移动底部SlotUI到游戏UI节点下
                    this._bottomSlotUI.node.removeFromParent();
                    inGameUINode.addChild(this._bottomSlotUI.node);

                    // 初始化遮罩和提示节点状态
                    this._tutorialBase.btnDim.node.active = true;
                    this._tutorialBase.btnDim.node.opacity = 0;
                    this._nodeToolTip.opacity = 0;
                    this._nodeToolTip.active = true;
                    this._nodeFinger.opacity = 0;
                    this._nodeFinger.active = true;
                } else {
                    this.onDone();
                }
            } else {
                this.onDone();
            }
        } else {
            this.onDone();
        }
    }

    /**
     * 教程流程处理（核心交互逻辑）
     */
    public async _onProcess(): Promise<void> {
        // 遮罩淡入动画
        this._tutorialBase.btnDim.node.runAction(cc.fadeTo(0.3, 150));

        // 克隆底部SlotUI节点并修改按钮事件
        const bottomSlotClone = this._tutorialBase.createCloneNode(this._bottomSlotUI.node, this._nodeUIRoot, 0.5);
        this._tutorialBase.changeButtonEvent(bottomSlotClone, this.onClick_Other.bind(this));

        // 获取目标Slot项节点并克隆
        const targetSlotNode = this._bottomSlotUI.getSlotItem(this._numSlotIndex).node;
        const slotClone = this._tutorialBase.createCloneNode(targetSlotNode, this._nodeUIRoot, 0.5);
        this._tutorialBase.changeButtonEvent(slotClone, this.onClick_Slot.bind(this));

        // 计算并设置手指指引位置
        const fingerPos = this._tutorialBase.nodeRoot.convertToNodeSpaceAR(
            targetSlotNode.convertToWorldSpaceAR(cc.v2())
        );
        this._nodeFinger.setPosition(new cc.Vec2(fingerPos.x - 70, fingerPos.y - 38));

        // 设置箭头位置
        this._nodeArrow.setPosition(new cc.Vec2(fingerPos.x, this._nodeArrow.y));

        // 计算并设置提示框位置
        const tooltipPos = this._tutorialBase.nodeRoot.convertToNodeSpaceAR(
            this._bottomSlotUI.node.convertToWorldSpaceAR(cc.v2())
        );
        tooltipPos.y = tooltipPos.y + 150;
        this._nodeToolTip.setPosition(tooltipPos);

        // 提示框淡入动画
        this.scheduleOnce(() => {
            this._nodeToolTip.runAction(cc.fadeTo(0.3, 255));
        }, 0.5);

        // 手指指引淡入动画
        this.scheduleOnce(() => {
            this._nodeFinger.runAction(cc.fadeTo(0.3, 255));
        }, 0.6);

        // 启用遮罩交互
        this.scheduleOnce(() => {
            this._tutorialBase.btnDim.interactable = true;
        }, 0.7);
    }

    /**
     * 教程结束逻辑
     */
    public _onEnd(): void {
        // 恢复底部SlotUI的父节点
        this._bottomSlotUI.node.removeFromParent();
        this._nodeBeforeParent.addChild(this._bottomSlotUI.node);
    }

    /**
     * 点击其他区域事件
     */
    public onClick_Other(): void {
        this.onDone();
    }

    /**
     * 点击Slot项事件
     */
    public onClick_Slot(): void {
        // 显示加载进度
        PopupManager.Instance().showDisplayProgress(true);

        // 获取并打开PowerGem弹窗
        PowerGemSlotPopup.getPopup((error: Error, popup: PowerGemSlotPopup) => {
            if (error) {
                this.onDone();
                return;
            }

            // 隐藏加载进度
            PopupManager.Instance().showDisplayProgress(false);

            // 设置弹窗关闭回调
            popup.setCloseCallback(() => {
                // 更新所有Slot项并播放动画
                this._bottomSlotUI.arrSlotButton.forEach((slotItem: any) => {
                    slotItem.updateSlotItem();
                    slotItem.playAnimation();
                });
                this.onDone();
            });

            // 打开弹窗
            popup.open(PowerGemSlotOpenType.SLOT_MAIN, this._numSlotIndex);
        });
    }
}

/**
 * "首次完成PowerGem"教程状态类
 * 继承自TutorialState基类
 */
export class PowerGemTutorial_FirstComplete extends TutorialState {
    // ===================== 常量定义 【与原JS完全一致】 =====================
    private readonly TIME_DELAY: number = 5;

    // ===================== 私有成员变量 【补充TS强类型声明】 =====================
    private _bottomSlotUI: any = null;
    private _nodeToolTip: cc.Node = null;
    private _nodeFinger: cc.Node = null;
    private _nodeUIRoot: cc.Node = null;
    private _nodeArrow: cc.Node = null;
    private _nodeBeforeParent: cc.Node = null;
    private _numSlotIndex: number = 0;

    /**
     * 教程启动逻辑
     */
    public _onStart(): void {
        // 解析教程数据
        this._bottomSlotUI = this._listData[0];
        this._nodeToolTip = this._listData[1];
        this._nodeFinger = this._listData[2];
        this._nodeUIRoot = this._listData[3];
        this._nodeArrow = this._listData[4];

        // 获取PowerGem信息数组
        const powerGemArrInfo = PowerGemManager.instance.getPowerGemArrInfo();

        // 信息数组有效时处理
        if (TSUtility.isValid(powerGemArrInfo) && powerGemArrInfo.length > 0) {
            // 查找第一个已完成的Slot索引
            for (let i = 0; i < powerGemArrInfo.length; i++) {
                if (powerGemArrInfo[i].isComplete()) {
                    this._numSlotIndex = i;
                    break;
                }
            }

            // 底部SlotUI有效时处理节点挂载和显隐
            if (TSUtility.isValid(this._bottomSlotUI)) {
                this._nodeBeforeParent = this._bottomSlotUI.node.parent;
                const inGameUINode = SlotManager.Instance._inGameUI.node;

                if (TSUtility.isValid(inGameUINode)) {
                    // 移动底部SlotUI到游戏UI节点下
                    this._bottomSlotUI.node.removeFromParent();
                    inGameUINode.addChild(this._bottomSlotUI.node);

                    // 初始化遮罩和提示节点状态
                    this._tutorialBase.btnDim.node.active = true;
                    this._tutorialBase.btnDim.node.opacity = 0;
                    this._nodeToolTip.opacity = 0;
                    this._nodeToolTip.active = true;
                    this._nodeFinger.opacity = 0;
                    this._nodeFinger.active = true;
                } else {
                    this.onDone();
                }
            } else {
                this.onDone();
            }
        } else {
            this.onDone();
        }
    }

    /**
     * 教程流程处理（核心交互逻辑）
     */
    public async _onProcess(): Promise<void> {
        // 遮罩淡入动画
        this._tutorialBase.btnDim.node.runAction(cc.fadeTo(0.3, 150));

        // 克隆底部SlotUI节点并修改按钮事件
        const bottomSlotClone = this._tutorialBase.createCloneNode(this._bottomSlotUI.node, this._nodeUIRoot, 0.5);
        this._tutorialBase.changeButtonEvent(bottomSlotClone, this.onClick_Other.bind(this));

        // 获取目标Slot项节点并克隆
        const targetSlotNode = this._bottomSlotUI.getSlotItem(this._numSlotIndex).node;
        const slotClone = this._tutorialBase.createCloneNode(targetSlotNode, this._nodeUIRoot, 0.5);
        this._tutorialBase.changeButtonEvent(slotClone, this.onClick_Slot.bind(this));

        // 计算并设置手指指引位置
        const fingerPos = this._tutorialBase.nodeRoot.convertToNodeSpaceAR(
            targetSlotNode.convertToWorldSpaceAR(cc.v2())
        );
        this._nodeFinger.setPosition(new cc.Vec2(fingerPos.x - 70, fingerPos.y - 38));

        // 设置箭头位置
        this._nodeArrow.setPosition(new cc.Vec2(fingerPos.x, this._nodeArrow.y));

        // 计算并设置提示框位置
        const tooltipPos = this._tutorialBase.nodeRoot.convertToNodeSpaceAR(
            this._bottomSlotUI.node.convertToWorldSpaceAR(cc.v2())
        );
        tooltipPos.y = tooltipPos.y + 150;
        this._nodeToolTip.setPosition(tooltipPos);

        // 提示框淡入动画
        this.scheduleOnce(() => {
            this._nodeToolTip.runAction(cc.fadeTo(0.3, 255));
        }, 0.5);

        // 手指指引淡入动画
        this.scheduleOnce(() => {
            this._nodeFinger.runAction(cc.fadeTo(0.3, 255));
        }, 0.6);

        // 启用遮罩交互
        this.scheduleOnce(() => {
            this._tutorialBase.btnDim.interactable = true;
        }, 0.7);
    }

    /**
     * 教程结束逻辑
     */
    public _onEnd(): void {
        // 恢复底部SlotUI的父节点
        this._bottomSlotUI.node.removeFromParent();
        this._nodeBeforeParent.addChild(this._bottomSlotUI.node);
    }

    /**
     * 点击其他区域事件
     */
    public onClick_Other(): void {
        this.onDone();
    }

    /**
     * 点击Slot项事件
     */
    public onClick_Slot(): void {
        // 显示加载进度
        PopupManager.Instance().showDisplayProgress(true);

        // 获取并打开PowerGem弹窗
        PowerGemSlotPopup.getPopup((error: Error, popup: PowerGemSlotPopup) => {
            if (error) {
                this.onDone();
                return;
            }

            // 隐藏加载进度
            PopupManager.Instance().showDisplayProgress(false);

            // 设置弹窗关闭回调
            popup.setCloseCallback(() => {
                // 更新所有Slot项并播放动画
                this._bottomSlotUI.arrSlotButton.forEach((slotItem: any) => {
                    slotItem.updateSlotItem();
                    slotItem.playAnimation();
                });
                this.onDone();
            });

            // 打开弹窗
            popup.open(PowerGemSlotOpenType.SLOT_MAIN, this._numSlotIndex);
        });
    }
}