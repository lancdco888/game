import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SlotManager from "../../manager/SlotManager";
import FreeSpinChooseItem_DragonOrbs from "./FreeSpinChooseItem_DragonOrbs";

const { ccclass, property } = cc._decorator;


/**
 * 龙珠游戏免费旋转选择弹窗组件
 * 管理弹窗显隐、龙珠选择交互、动画/音效控制、事件绑定/移除、回调触发等核心逻辑
 */
@ccclass('FreeSpinChoosePopup_DragonOrbs')
export default class FreeSpinChoosePopup_DragonOrbs extends cc.Component {
    // ===================== 序列化属性（与原JS一致） =====================
    /** 遮罩背景节点（阻止底层交互） */
    @property(cc.Node)
    public blockingBG: cc.Node | null = null;

    /** 需要初始化透明度的节点列表 */
    @property([cc.Node])
    public nodesInitOpacity: cc.Node[] = [];

    /** 选择项（龙珠）组件列表 */
    @property([FreeSpinChooseItem_DragonOrbs])
    public chooseItems: FreeSpinChooseItem_DragonOrbs[] = [];

    /** 结果背景特效节点列表 */
    @property([cc.Node])
    public resultBGFxList: cc.Node[] = [];

    /** 根动画组件（控制弹窗整体动画） */
    @property(cc.Animation)
    public rootAnimation: cc.Animation | null = null;

    // ===================== 私有状态（与原JS一致） =====================
    /** 选择完成后的回调函数 */
    private _selectCallback: (() => void) | null = null;

    /** 当前选中的龙珠节点 */
    private _currentTarget: cc.Node | null = null;

    /** 当前命中的免费旋转类型索引（0=红/1=蓝/2=绿） */
    private _currentHitFreeSpinIndex: number = -1;

    /** 免费旋转类型标识列表 */
    private _freeSpinKeyList: string[] = ["freeSpin_red", "freeSpin_blue", "freeSpin_green"];

    // ===================== 生命周期/核心方法（与原JS逻辑1:1） =====================
    /**
     * 组件加载时初始化遮罩背景尺寸
     */
    public onLoad(): void {
        // 获取场景中的Canvas组件
        const canvasComp = cc.director.getScene()?.getComponentInChildren(cc.Canvas);
        if (!TSUtility.isValid(canvasComp)) return;

        // 设置遮罩背景尺寸（Canvas尺寸+偏移）
        const canvasSize = canvasComp.node.getContentSize();
        this.blockingBG!.setContentSize(canvasSize.width + 5, canvasSize.height + 100);
    }

    /**
     * 打开弹窗（初始化状态+播放动画/音效+触发回调）
     * @param openCallback 弹窗打开完成后的回调
     */
    public open(openCallback: () => void): void {
        // 初始化所有需要透明的节点为0透明度
        for (let i = 0; i < this.nodesInitOpacity.length; ++i) {
            this.nodesInitOpacity[i].opacity = 0;
        }

        // 获取下一个子游戏类型并记录索引
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        this._currentHitFreeSpinIndex = this._freeSpinKeyList.indexOf(nextSubGameKey);

        // 播放音效（BGM+弹窗出现FX）
        SlotSoundController.Instance().playAudio("FreeSpinChooseBGM", "BGM");
        SlotSoundController.Instance().playAudio("FreeSpinChooseAppear", "FX");
        // 临时降低主音量
        SlotSoundController.Instance().setMainVolumeTemporarily(0.1);

        // 播放弹窗打开动画
        this.rootAnimation!.play("Feature_Choice_Open_Ani", 0);

        // 1.5秒后恢复音量并触发打开回调
        this.scheduleOnce(() => {
            SlotSoundController.Instance().resetTemporarilyMainVolume();
            openCallback();
        }, 1.5);

        // 激活弹窗节点
        this.node.active = true;
    }

    /**
     * 绑定所有龙珠选择项的交互事件（hover/leave/click）
     */
    public addAllEventListener(): void {
        for (let i = 0; i < this.chooseItems.length; ++i) {
            const itemNode = this.chooseItems[i].node;
            // 绑定鼠标移入/移出/点击事件
            itemNode.on(cc.Node.EventType.MOUSE_ENTER, this.onHoverOrb, this);
            itemNode.on(cc.Node.EventType.MOUSE_LEAVE, this.onLeaveOrb, this);
            itemNode.on(cc.Node.EventType.TOUCH_END, this.onClickOrb, this);
        }
    }

    /**
     * 设置选择完成后的回调函数
     * @param callback 回调函数
     */
    public setSelectCallback(callback: () => void): void {
        this._selectCallback = callback;
    }

    /**
     * 鼠标移入龙珠时的处理（显示hover效果）
     * @param event 鼠标事件
     */
    private onHoverOrb(event: cc.Event.EventMouse): void {
        const chooseItem = event.currentTarget.getComponent(FreeSpinChooseItem_DragonOrbs);
        if (TSUtility.isValid(chooseItem)) {
            chooseItem.showHover();
        }
    }

    /**
     * 鼠标移出龙珠时的处理（隐藏hover效果）
     * @param event 鼠标事件
     */
    private onLeaveOrb(event: cc.Event.EventMouse): void {
        const chooseItem = event.currentTarget.getComponent(FreeSpinChooseItem_DragonOrbs);
        if (TSUtility.isValid(chooseItem)) {
            chooseItem.hideHover();
        }
    }

    /**
     * 点击龙珠时的处理（移除事件+发送奖金游戏请求）
     * @param event 触摸事件
     */
    private onClickOrb(event: cc.Event.EventTouch): void {
        // 移除所有交互事件
        this.removeAllListener();
        // 记录当前选中的龙珠节点
        this._currentTarget = event.currentTarget;

        // 播放选择音效
        SlotSoundController.Instance().playAudio("FreeSpinChoice", "FX");
        // 发送奖金游戏请求并绑定回调
        SlotManager.Instance.sendBonusGameRequest(this.onReceive.bind(this));
    }

    /**
     * 接收奖金游戏响应后的处理（打开选中龙珠+播放动画+触发回调）
     */
    private onReceive(): void {
        const self = this;
        // 获取下一个子游戏类型
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        // 计算当前选中龙珠的索引
        const targetIndex = this.chooseItems.indexOf(this._currentTarget!.getComponent(FreeSpinChooseItem_DragonOrbs));
        this._currentHitFreeSpinIndex = targetIndex;

        // 播放对应胜利动画
        const winAniName = `Popup_Feature_Choice_Win_${targetIndex}_Ani`;
        // 打开选中龙珠
        this._currentTarget!.getComponent(FreeSpinChooseItem_DragonOrbs).openOrb(nextSubGameKey);
        // 打开所有龙珠
        this.openAll();
        // 播放胜利动画
        this.rootAnimation!.play(winAniName);

        // 1秒后触发选择完成回调
        if (this._selectCallback) {
            this.scheduleOnce(() => {
                self._selectCallback!();
            }, 1);
        }
    }

    /**
     * 打开所有龙珠（除选中的外）
     */
    private openAll(): void {
        // 免费旋转类型列表
        const freeSpinKeys = ["freeSpin_red", "freeSpin_blue", "freeSpin_green"];
        // 当前子游戏类型
        const currentSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        let nonTargetIndex = 0;

        // 播放打开音效
        SlotSoundController.Instance().playAudio("FreeSpinStartPopup", "FX");

        // 移除当前子游戏类型（只保留未选中的）
        for (let i = 0; i < freeSpinKeys.length; ++i) {
            if (freeSpinKeys[i] === currentSubGameKey) {
                freeSpinKeys.splice(i, 1);
                break;
            }
        }

        // 遍历所有龙珠，打开非选中的龙珠
        for (let i = 0; i < this.chooseItems.length; ++i) {
            if (this.chooseItems[i].node !== this._currentTarget) {
                this.chooseItems[i].openOrb(freeSpinKeys[nonTargetIndex]);
                nonTargetIndex++;
            }
        }
    }

    /**
     * 显示当前触发的龙珠特效（播放结果动画+触发回调）
     * @param showCallback 显示完成后的回调
     */
    public showCurrentTriggerOrb(showCallback: () => void): void {
        // 结果动画名称
        const resultAniName = `Popup_Feature_Result_${this._currentHitFreeSpinIndex}_Open_Ani`;
        // 当前子游戏类型索引
        const currentSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const currentIndex = this._freeSpinKeyList.indexOf(currentSubGameKey);

        // 激活并显示对应结果背景特效
        this.resultBGFxList[currentIndex].active = true;
        this.resultBGFxList[currentIndex].opacity = 255;

        // 播放结果动画，完成后触发回调
        this.rootAnimation!.once("finished", () => {
            showCallback();
        });
        this.rootAnimation!.play(resultAniName, 0);
    }

    /**
     * 移除所有龙珠选择项的交互事件（修复原JS中MOUSE_LEAVE绑定错误的问题）
     */
    private removeAllListener(): void {
        for (let i = 0; i < this.chooseItems.length; ++i) {
            const itemNode = this.chooseItems[i].node;
            // 移除所有绑定的事件（原JS中MOUSE_LEAVE错误绑定为onHoverOrb，此处修正）
            itemNode.off(cc.Node.EventType.MOUSE_ENTER, this.onHoverOrb, this);
            itemNode.off(cc.Node.EventType.MOUSE_LEAVE, this.onLeaveOrb, this);
            itemNode.off(cc.Node.EventType.TOUCH_END, this.onClickOrb, this);
        }
    }

    /**
     * 关闭弹窗（播放动画/音效+触发回调+隐藏节点）
     * @param closeCallback 弹窗关闭完成后的回调
     */
    public close(closeCallback: () => void): void {
        const self = this;
        // 清空当前选中节点
        this._currentTarget = null;
        // 移除所有交互事件
        this.removeAllListener();

        // 关闭动画名称
        const closeAniName = `Popup_Feature_Result_${this._currentHitFreeSpinIndex}_Close_Ani`;
        // 当前子游戏类型索引
        const currentSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const currentIndex = this._freeSpinKeyList.indexOf(currentSubGameKey);

        // 播放关闭动画
        this.rootAnimation!.play(closeAniName, 0);
        // 临时降低主音量
        SlotSoundController.Instance().setMainVolumeTemporarily(0.1);
        // 播放弹窗消失音效
        SlotSoundController.Instance().playAudio("FreeSpinChooseDisappear", "FX");

        // 动画完成后隐藏特效+节点，触发关闭回调
        this.rootAnimation!.once("finished", () => {
            self.resultBGFxList[currentIndex].active = false;
            self.node.active = false;
            closeCallback();
        });
    }
}