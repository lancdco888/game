const { ccclass, property } = cc._decorator;

// ===================== 顶部导入所有外部模块 =====================
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";
import PopupManager from "../manager/PopupManager";
import PowerGemSlotBottomUI_Tutorial from "./PowerGemSlotBottomUI_Tutorial";
import PowerGemSlotItem from "./PowerGemSlotItem";
import PowerGemSlotPopup from "./PowerGemSlotPopup";

/**
 * PowerGem老虎机底部核心UI组件 (Slot项管理+教程控制)
 * PowerGemSlotBottomUI
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class PowerGemSlotBottomUI extends cc.Component {
    // ===================== Cocos 序列化属性 【与原JS 1:1精准对应】 =====================
    @property({ type: cc.Node, displayName: "触摸遮罩节点" })
    public nodeTouchBG: cc.Node = null;

    @property({ type: cc.Layout, displayName: "Slot项布局节点" })
    public layout: cc.Layout = null;

    @property({ type: PowerGemSlotBottomUI_Tutorial, displayName: "教程组件" })
    public tutorial: PowerGemSlotBottomUI_Tutorial = null;

    // ===================== 私有成员变量 【补充TS强类型声明】 =====================
    private _arrSlotButton: PowerGemSlotItem[] = [];
    private _isPlayTutorial: boolean = false;
    private _changeEvent: Function = null;

    // ===================== 属性访问器 【与原JS完全一致】 =====================
    get arrSlotButton(): PowerGemSlotItem[] {
        return this._arrSlotButton;
    }

    // ===================== 生命周期/核心方法 【1:1还原原JS逻辑】 =====================
    /**
     * 初始化组件 - 绑定事件、初始化Slot项、更新UI
     * @param changeEvent UI状态变化回调函数
     */
    initialize(changeEvent: Function): void {
        // 绑定遮罩触摸事件
        this.nodeTouchBG.on(cc.Node.EventType.TOUCH_START, this.onTouchStart.bind(this), this);
        TSUtility.setIgnoreStartTouchListener(this.nodeTouchBG);

        // 初始化所有Slot项
        this.layout.node.children.forEach((childNode: cc.Node, index: number) => {
            const slotItem = childNode.getComponent(PowerGemSlotItem);
            // 初始化Slot项并绑定弹窗打开回调
            slotItem.initialize(this.openPowerGemSlotPopup.bind(this), index);
            this._arrSlotButton.push(slotItem);

            // 给Slot项按钮添加点击事件（原JS逻辑保留）
            const button = childNode.getComponent(cc.Button);
            button.clickEvents.push(Utility.getComponent_EventHandler(this.node, "PowerGemSlotBottomUI", "onClick_Slot", ""));
        });

        // 更新UI、隐藏教程、保存状态变化回调
        this.updateUI();
        this.tutorial.node.active = false;
        this._changeEvent = changeEvent;
    }

    /**
     * 组件启用时 - 清除所有调度器
     */
    onEnable(): void {
        this.unscheduleAllCallbacks();
    }

    /**
     * 组件禁用时 - 清除所有调度器
     */
    onDisable(): void {
        this.unscheduleAllCallbacks();
    }

    /**
     * 更新所有Slot项UI并播放动画
     */
    updateUI(): void {
        // 校验Slot项数组有效性（原JS 0 != isValid → 等价于 isValid）
        if (TSUtility.isValid(this._arrSlotButton) && this._arrSlotButton.length > 0) {
            this._arrSlotButton.forEach((slotItem: PowerGemSlotItem) => {
                slotItem.updateSlotItem();
                slotItem.playAnimation();
            });
        }
    }

    /**
     * 获取指定索引的Slot项
     * @param index Slot项索引
     * @returns 对应索引的Slot项实例
     */
    getSlotItem(index: number): PowerGemSlotItem {
        return this._arrSlotButton[index];
    }

    /**
     * 响应遮罩触摸事件 - 关闭UI并触发状态回调
     */
    onTouchStart(): void {
        // 非教程播放状态时关闭UI
        if (!this._isPlayTutorial) {
            this.node.active = false;
            // 回调存在时执行
            if (TSUtility.isValid(this._changeEvent)) {
                this._changeEvent(true);
            }
        }
    }

    /**
     * Slot项点击事件 - 隐藏UI（设置透明度为0）
     */
    onClick_Slot(): void {
        this.node.opacity = 0;
    }

    /**
     * 打开PowerGem Slot弹窗
     * @param param1 弹窗参数1（原JS e）
     * @param param2 弹窗参数2（原JS t）
     */
    openPowerGemSlotPopup(param1: any, param2: any): void {
        // 显示加载进度
        PopupManager.Instance().showDisplayProgress(true);

        // 获取弹窗实例并处理
        PowerGemSlotPopup.getPopup((isError: Error, popupInstance: PowerGemSlotPopup) => {
            // 出错时更新Slot项并恢复透明度
            if (isError) {
                this._arrSlotButton.forEach((slotItem: PowerGemSlotItem) => {
                    slotItem.updateSlotItem();
                    slotItem.playAnimation();
                });
                this.node.opacity = 255;
                return;
            }

            // 隐藏加载进度
            PopupManager.Instance().showDisplayProgress(false);

            // 设置弹窗关闭回调
            popupInstance.setCloseCallback(() => {
                this._arrSlotButton.forEach((slotItem: PowerGemSlotItem) => {
                    slotItem.updateSlotItem();
                    slotItem.playAnimation();
                });
                this.node.opacity = 255;
            });

            // 打开弹窗
            popupInstance.open(param1, param2);
        });
    }

    /**
     * 播放PowerGem新手教程
     * @param tutorialType 教程类型（1:首次获取PowerGem | 2:首次完成PowerGem）
     * @param completeCallback 教程完成回调
     */
    playPowerGemTutorial(tutorialType: number, completeCallback: Function): void {
        // 显示UI并触发状态回调
        this.node.active = true;
        if (TSUtility.isValid(this._changeEvent)) {
            this._changeEvent(true);
        }

        // 标记教程播放状态，显示教程组件
        this._isPlayTutorial = true;
        this.tutorial.node.active = true;

        // 根据教程类型播放对应教程
        if (tutorialType === 1) {
            this.tutorial.playPowerGemTutorial_FirstGetPowerGem(this, completeCallback);
        } else if (tutorialType === 2) {
            this.tutorial.playPowerGemTutorial_FirstComplete(this, completeCallback);
        }
    }
}