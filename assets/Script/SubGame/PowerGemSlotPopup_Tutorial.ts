const { ccclass, property } = cc._decorator;

import GameCommonSound from "../GameCommonSound";
import TutorialBase, { TutorialState } from "../Lobby/TutorialBase";
import CommonServer from "../Network/CommonServer";
import UserInfo from "../User/UserInfo";
import { PowerGemPromotion } from "../User/UserPromotion";
import TSUtility from "../global_utility/TSUtility";
import PopupManager from "../manager/PopupManager";
import PowerGemManager from "../manager/PowerGemManager";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import SlotManager from "../manager/SlotManager";
import PowerGemSlotPopup, { PowerGemSlotOpenType } from "./PowerGemSlotPopup";

/**
 * PowerGem首次打开教程主组件
 * 继承自教程基类，负责PowerGem新手引导的整体控制
 */
@ccclass()
export default class PowerGemSlotPopup_Tutorial extends TutorialBase {
    // ================= 可序列化属性（编辑器面板配置） =================
    @property(cc.Node)
    public nodeToolTip_1: cc.Node | null = null; // 教程提示框1

    @property(cc.Node)
    public nodeFinger: cc.Node | null = null; // 手指指引节点

    @property(cc.Node)
    public nodeUIRoot: cc.Node | null = null; // UI根节点

    @property(cc.Node)
    public nodeBtnStart: cc.Node | null = null; // 开始按钮节点

    // ================= 核心教程方法 =================
    /**
     * 播放PowerGem首次打开教程
     * @param slotIndex 插槽索引
     * @param mainPopup PowerGem主弹窗实例
     */
    public playPowerGemTutorial_FirstOpenPowerGem(
        slotIndex: number,
        mainPopup: { setUI: (type: PowerGemSlotOpenType, index: number, isForce: boolean) => void }
    ): void {
        if (!this.nodeBtnStart || !this.nodeToolTip_1 || !this.nodeFinger || !this.nodeUIRoot) {
            cc.log("PowerGemSlotPopup_Tutorial: 教程节点未配置完整");
            return;
        }

        // 添加教程步骤数据
        this.addTutorialData(new PowerGemTutorial_FirstOpenPowerGem(
            this.nodeBtnStart,
            this.nodeToolTip_1,
            this.nodeFinger,
            this.nodeUIRoot,
            slotIndex,
            mainPopup
        ));

        // 禁用键盘事件
        SlotManager.Instance.setKeyboardEventFlag(false);

        // 启动教程，完成后恢复键盘事件
        this.onStart(() => {
            SlotManager.Instance.setKeyboardEventFlag(true);
        }, false);

        // 记录PowerGem促销信息到存储
        const promotionInfo = PowerGemManager.instance.getPromotion();
        if (TSUtility.isValid(promotionInfo)) {
            ServerStorageManager.save(
                StorageKeyType.TUTORIAL_POWER_GEM_FIRST_OPEN,
                promotionInfo.numEventEndDate
            );
        }
    }
}

/**
 * PowerGem首次打开教程状态类（单步教程逻辑）
 * 继承自教程状态基类，负责具体教程步骤的执行
 */
export class PowerGemTutorial_FirstOpenPowerGem extends TutorialState {
    // ================= 常量定义 =================
    private readonly TIME_DELAY: number = 5; // 延迟时间（原代码未使用，保留）

    // ================= 私有状态变量 =================
    private _nodeBtnStart: cc.Node | null = null; // 开始按钮节点
    private _nodeToolTip: cc.Node | null = null; // 提示框节点
    private _nodeFinger: cc.Node | null = null; // 手指指引节点
    private _nodeUIRoot: cc.Node | null = null; // UI根节点
    private _numSlotIndex: number = 0; // 插槽索引
    private _mainPopup: { setUI: (type: PowerGemSlotOpenType, index: number, isForce: boolean) => void } | null = null; // 主弹窗实例

    /**
     * 构造函数
     * @param btnStart 开始按钮
     * @param toolTip 提示框
     * @param finger 手指指引
     * @param uiRoot UI根节点
     * @param slotIndex 插槽索引
     * @param mainPopup 主弹窗
     */
    constructor(
        btnStart: cc.Node,
        toolTip: cc.Node,
        finger: cc.Node,
        uiRoot: cc.Node,
        slotIndex: number,
        mainPopup: { setUI: (type: PowerGemSlotOpenType, index: number, isForce: boolean) => void }
    ) {
        super();
        this._nodeBtnStart = btnStart;
        this._nodeToolTip = toolTip;
        this._nodeFinger = finger;
        this._nodeUIRoot = uiRoot;
        this._numSlotIndex = slotIndex;
        this._mainPopup = mainPopup;
    }

    // ================= 教程生命周期方法 =================
    /**
     * 教程开始（初始化UI状态）
     */
    protected _onStart(): void {
        if (!this._tutorialBase || !this._nodeToolTip || !this._nodeFinger) return;

        // 初始化遮罩按钮状态
        this._tutorialBase.btnDim.node.active = true;
        this._tutorialBase.btnDim.interactable = false;
        this._tutorialBase.btnDim.node.opacity = 0;

        // 初始化提示框和手指指引状态
        this._nodeToolTip.opacity = 0;
        this._nodeToolTip.active = true;
        this._nodeFinger.opacity = 0;
        this._nodeFinger.active = true;
    }

    /**
     * 教程执行（显示提示框和手指指引动画）
     */
    protected async _onProcess(): Promise<void> {
        if (
            !this._tutorialBase ||
            !this._nodeBtnStart ||
            !this._nodeUIRoot ||
            !this._nodeFinger ||
            !this._nodeToolTip
        ) {
            cc.log("PowerGemTutorial_FirstOpenPowerGem: 教程执行节点缺失");
            return;
        }

        try {
            // 1. 创建开始按钮克隆节点并绑定点击事件
            const cloneBtn = this._tutorialBase.createCloneNode(this._nodeBtnStart, this._nodeUIRoot, 0.5);
            this._tutorialBase.changeButtonEvent(cloneBtn, this.onClick_Start.bind(this));

            // 2. 计算手指指引位置（转换坐标并偏移）
            const fingerWorldPos = this._nodeBtnStart.convertToWorldSpaceAR(new cc.Vec2(0, 0));
            const fingerLocalPos = this._tutorialBase.nodeRoot.convertToNodeSpaceAR(fingerWorldPos);
            fingerLocalPos.x -= 70;
            fingerLocalPos.y -= 38;
            this._nodeFinger.setPosition(fingerLocalPos);

            // 3. 计算提示框位置（转换坐标并偏移）
            const tooltipWorldPos = this._nodeBtnStart.convertToWorldSpaceAR(new cc.Vec2(0, 0));
            const tooltipLocalPos = this._tutorialBase.nodeRoot.convertToNodeSpaceAR(tooltipWorldPos);
            tooltipLocalPos.y -= 150;
            this._nodeToolTip.setPosition(tooltipLocalPos);

            // 4. 播放提示框淡入动画
            this.scheduleOnce(() => {
                if (this._nodeToolTip) {
                    this._nodeToolTip.runAction(cc.fadeTo(0.3, 255) as cc.ActionInterval);
                }
            }, 0.5);

            // 5. 播放手指指引淡入动画
            this.scheduleOnce(() => {
                if (this._nodeFinger) {
                    this._nodeFinger.runAction(cc.fadeTo(0.3, 255) as cc.ActionInterval);
                }
            }, 0.6);

            // 6. 启用遮罩按钮交互
            this.scheduleOnce(() => {
                if (this._tutorialBase) {
                    this._tutorialBase.btnDim.interactable = true;
                }
            }, 0.7);
        } catch (err) {
            cc.error(`PowerGemTutorial_FirstOpenPowerGem: 教程执行异常 - ${err}`);
        }
    }

    /**
     * 教程结束（恢复按钮状态）
     */
    protected _onEnd(): void {
        if (this._nodeBtnStart) {
            this._nodeBtnStart.active = true;
        }
    }

    // ================= 按钮点击回调 =================
    /**
     * 开始按钮点击回调（请求服务器接受促销）
     */
    private onClick_Start(): void {
        if (!this._mainPopup || !UserInfo.instance()) return;

        // 1. 播放按钮音效
        GameCommonSound.playFxOnce("btn_etc");

        // 2. 显示加载进度
        PopupManager.Instance().showDisplayProgress(true);

        // 3. 请求服务器接受PowerGem促销
        CommonServer.Instance().requestAcceptPromotion(
            UserInfo.instance().getUid(),
            UserInfo.instance().getAccessToken(),
            PowerGemPromotion.PromotionKeyName,
            1,
            this._numSlotIndex,
            "",
            (response: any) => {
                // 4. 隐藏加载进度
                PopupManager.Instance().showDisplayProgress(false);

                // 5. 检查服务器响应是否正常
                if (CommonServer.isServerResponseError(response)) {
                    cc.error(`PowerGemTutorial_FirstOpenPowerGem: 促销请求失败 - ${response}`);
                    return;
                }

                try {
                    // 6. 应用服务器返回的状态变更
                    const changeResult = UserInfo.instance().getServerChangeResult(response);
                    UserInfo.instance().applyChangeResult(changeResult);

                    // 7. 更新PowerGem促销刷新状态
                    PowerGemManager.instance.setRefreshPromotion(true);

                    // 8. 清理PowerGem动作信息（匹配插槽索引）
                    const actionInfo = PowerGemManager.instance.getActionPowerGemInfo();
                    if (TSUtility.isValid(actionInfo) && actionInfo.getSlotIndex() === this._numSlotIndex) {
                        PowerGemManager.instance.setActionPowerGemInfo(null);
                    }

                    // 9. 更新PowerGem主弹窗UI
                    this._mainPopup.setUI(PowerGemSlotOpenType.SLOT_START, this._numSlotIndex, true);

                    // 10. 标记教程完成
                    this.onDone();
                } catch (err) {
                    cc.error(`PowerGemTutorial_FirstOpenPowerGem: 处理促销响应异常 - ${err}`);
                }
            }
        );
    }
}