import InitDataPopup from "../InitDataPopup";
import GameResultPopup, { ResultPopupType } from "../Slot/GameResultPopup";
import SlotReelSpinStateManager from "../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../Slot/SlotSoundController";
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";
import ViewResizeManager from "../global_utility/ViewResizeManager";
import CoinEffect_Components from "./CoinEffect_Components";
import PopupData from "./PopupData";
import SlotManager from "./SlotManager";
import SoundManager from "./SoundManager";

const { ccclass, property } = cc._decorator;
/**
 * 弹窗消息数据类
 * 用于传递弹窗打开的类型和参数
 */
export class Popup_Msg {
    public type: number = -1;      // 弹窗类型索引
    public params: any = {};       // 弹窗参数

    constructor(type: number, params: any = {}) {
        this.type = type;
        this.params = params;
    }
}

/**
 * 弹窗管理核心组件（PopupSetting）
 * 负责所有弹窗的打开/关闭、动画、音效、分享、视图适配、金币特效等逻辑
 */
@ccclass("PopupSetting")
export default class PopupSetting extends cc.Component {
    // ================= 可序列化属性（编辑器面板配置） =================
    @property([PopupData])
    public popup_list: PopupData[] = [];          // 弹窗配置列表
    @property(CoinEffect_Components)
    public coin_components: CoinEffect_Components = null!; // 金币特效组件

    // ================= 私有状态属性 =================
    public closepopup_callback: ((data?: any) => void) | null = null; // 弹窗关闭回调
    public gap_pos: number = 0;                   // 弹窗位置偏移量
    public initializeFunction: ((popup: PopupData, msg: Popup_Msg) => void) | null = null; // 弹窗初始化自定义函数

    // ================= 弹窗位置与索引管理 =================
    /**
     * 设置弹窗位置偏移量
     * @param pos 偏移值
     */
    public setPopupGapPosition(pos: number): void {
        this.gap_pos = pos;
    }

    /**
     * 将弹窗类型转换为列表索引（默认直接返回）
     * @param type 弹窗类型
     * @returns 列表索引
     */
    public getIndexToTypeIndex(type: number): number {
        return type;
    }

    /**
     * 检查索引是否超出弹窗列表范围
     * @param index 要检查的索引
     * @returns 是否越界
     */
    public checkRangeIndex(index: number): boolean {
        return index < 0 || this.popup_list.length <= index;
    }

    /**
     * 执行弹窗关闭回调
     * @param data 回调参数
     */
    public callCallback(data: any = null): void {
        if (this.closepopup_callback) {
            this.closepopup_callback(data);
        }
    }

    // ================= 生命周期函数 =================
    onLoad() {
        this.refreshView();
        // 注册视图适配回调
        ViewResizeManager.Instance().addHandler(this);

        // 初始化弹窗列表：添加输入屏蔽、绑定FB分享组件
        this.popup_list.forEach(popup => {
            // 为遮罩层添加输入屏蔽组件
            if (TSUtility.isValid(popup.blockingBG)) {
                if (!TSUtility.isValid(popup.blockingBG.getComponent(cc.BlockInputEvents))) {
                    popup.blockingBG.addComponent(cc.BlockInputEvents);
                }
            }
            // // 为分享按钮绑定FB分享组件
            // if (popup.btnShare) {
            //     popup.btnShare.addComponent(FBShareFlagToStorageInGame);
            // }
        });
    }

    onDestroy() {
        // 移除视图适配回调
        ViewResizeManager.RemoveHandler(this);
    }

    // ================= 弹窗打开核心逻辑 =================
    /**
     * 打开指定类型的弹窗
     * @param msg 弹窗消息（类型+参数）
     * @param callback 弹窗关闭回调
     */
    public onOpenPopup(msg: Popup_Msg, callback: ((data?: any) => void) | any = null): void {
        this.closepopup_callback = callback;
        const typeIndex = this.getIndexToTypeIndex(msg.type);

        // 检查索引越界
        if (this.checkRangeIndex(typeIndex)) {
            console.log("Volcanic Tahiti : Out of Range Popup Index!!");
            this.callCallback();
            return;
        }

        const popup = this.popup_list[typeIndex];
        // 刷新弹窗视图
        this.refreshPopupView(popup);

        // 初始状态：隐藏弹窗和动画根节点
        popup.node.active = false;
        if (popup.ani_pivot) {
            popup.ani_pivot.active = false;
        }

        // 初始化：音效、FB分享、按钮、弹窗数据
        this.onSoundInit(popup);
        this.onFacebookInit(popup);
        this.onButtonInit(popup, msg);
        this.onInitPopupData(popup);

        // 执行自定义初始化函数
        if (this.initializeFunction) {
            this.initializeFunction(popup, msg);
        }

        // 显示弹窗和动画根节点
        popup.node.active = true;
        if (popup.ani_pivot) {
            popup.ani_pivot.active = true;
        }

        // 处理忽略结束动画延迟的特殊场景
        if (popup.ignore_end_animation_delay && popup.end_animation === "") {
            const aniNode = popup.ani_pivot || popup.node;
            const ani = aniNode.getComponent(cc.Animation);
            if (ani) {
                ani.once(cc.Animation.EventType.FINISHED, () => {
                    ani.setCurrentTime(ani.currentClip!.duration);
                    popup.node.active = false;
                }, this);
            }
        }
    }

    // ================= 弹窗初始化子逻辑 =================
    /**
     * 弹窗音效初始化
     * @param popup 弹窗配置
     */
    private onSoundInit(popup: PopupData): void {
        // 临时静音主音量
        SoundManager.Instance().setMainVolumeTemporarily(0);

        let soundDuration = 0;
        // 播放弹窗音效并获取时长
        if (popup.sound_id !== "") {
            const audio = SlotSoundController.Instance().playAudio(popup.sound_id, "FX");
            soundDuration = audio ? audio.getDuration() : 0;
        }

        // 计算恢复音量的延迟时间（优先使用弹窗配置的auto_time）
        const delayTime = popup.auto_time < 0 ? soundDuration : popup.auto_time;
        const finalDelay = delayTime < soundDuration ? delayTime : soundDuration;

        // 延迟恢复主音量
        this.scheduleOnce(() => {
            SoundManager.Instance().setMainVolumeTemporarily(0.1);
        }, finalDelay);
    }

    /**
     * 弹窗Facebook分享按钮初始化
     * @param popup 弹窗配置
     */
    private onFacebookInit(popup: PopupData): void {
        if (popup.btnShare) {
            // 根据SlotManager判断是否禁用FB分享
            const isFBShareDisabled = SlotManager.Instance.isFBShareDisableTarget();
            popup.btnShare.node.parent!.active = !isFBShareDisabled;
        }
    }

    /**
     * 弹窗按钮初始化（收集按钮、自动关闭逻辑）
     * @param popup 弹窗配置
     * @param msg 弹窗消息
     */
    private onButtonInit(popup: PopupData, msg: Popup_Msg): void {
        let addAutoTime = 0;
        // 读取额外的自动关闭延迟
        if (TSUtility.isValid(msg.params.add_auto_time)) {
            addAutoTime = msg.params.add_auto_time;
        }

        // 处理收集按钮
        if (popup.btnCollect) {
            const customBtn = popup.btnCollect.getComponent("CustomButton");
            // 禁用按钮并延迟启用
            if (!customBtn) {
                popup.btnCollect.interactable = false;
                this.scheduleOnce(() => {
                    popup.btnCollect.interactable = true;
                }, popup.animation_time + addAutoTime);
            } else {
                customBtn.setInteractable(false);
                this.scheduleOnce(() => {
                    customBtn.setInteractable(true);
                    customBtn.setButtonVisibleState("normal");
                }, popup.animation_time + addAutoTime);
            }

            // 绑定收集按钮点击事件
            popup.btnCollect.clickEvents.push(Utility.getComponent_EventHandler(
                this.node,
                "PopupSetting",
                "onClickCollect",
                { auto: false, popup: popup, params: msg.params }
            ));

            // 自动旋转模式下，延迟自动点击收集按钮
            if (SlotReelSpinStateManager.Instance.getAutospinMode() && popup.auto_time > 0) {
                this.scheduleOnce(() => {
                    this.onClickCollect(null, { auto: true, popup: popup, params: msg.params });
                }, popup.auto_time);
            }
        } else if (popup.auto_time > 0) {
            // 无收集按钮时，直接延迟自动关闭
            this.scheduleOnce(() => {
                this.onClickCollect(null, { auto: true, popup: popup, params: msg.params });
            }, popup.auto_time);
        }
    }

    /**
     * 弹窗数据初始化（执行InitDataPopup组件的初始化）
     * @param popup 弹窗配置
     */
    private onInitPopupData(popup: PopupData): void {
        // 获取弹窗节点下的所有InitDataPopup组件并执行初始化
        const initDataComponents = popup.node.getComponentsInChildren(InitDataPopup);
        initDataComponents.forEach(component => {
            component.initNodeProperty();
        });
    }

    // ================= 收集按钮点击逻辑 =================
    /**
     * 收集按钮点击回调
     * @param _event 点击事件（未使用）
     * @param data 自定义数据 {auto: 是否自动触发, popup: 弹窗配置, params: 弹窗参数}
     */
    public onClickCollect(_event: Event | null, data: { auto: boolean, popup: PopupData, params: any }): void {
        // 取消所有延迟任务
        this.unscheduleAllCallbacks();

        // 禁用收集按钮并清空事件
        if (data.popup.btnCollect) {
            data.popup.btnCollect.clickEvents = [];
            data.popup.btnCollect.interactable = false;
        }

        // 停止弹窗音效
        if (data.popup.sound_id !== "") {
            SlotSoundController.Instance().stopAudio(data.popup.sound_id, "FX");
        }

        // 处理FB分享（非自动触发且分享按钮勾选时）
        if (!data.auto && data.popup.btnShare && !SlotManager.Instance.isFBShareDisableTarget()) {
            const toggle = data.popup.btnShare.getComponent("Toggle");
            if (toggle && toggle.isChecked) {
                const shareInfo = this.getShareInfo(data.popup.result_type, data.params.reward);
                SlotManager.Instance.facebookShare(shareInfo, this.endProcess.bind(this, data));
                return;
            }
        }

        // 直接执行结束流程
        this.endProcess(data);
    }

    // ================= 弹窗结束流程 =================
    /**
     * 弹窗结束处理（金币特效 + 关闭弹窗）
     * @param data 自定义数据 {popup: 弹窗配置, params: 弹窗参数}
     */
    private endProcess(data: { popup: PopupData, params: any }): void {
        // 恢复主音量
        SoundManager.Instance().resetTemporarilyMainVolume();

        const popup = data.popup;
        const popupData = popup.getComponent(PopupData);

        // 播放金币特效
        if (popupData.play_coin_effect) {
            popup.node.active = false;
            // 执行金币爆炸特效
            this.coin_components.playExplodeCoinEffect(
                data.params.reward,
                () => {
                    // 特效结束后关闭弹窗（非直接跳转下一轮）
                    if (!popupData.playing_coin_direct_next) {
                        this.closeProcess(popupData, popup);
                    }
                },
                popup.getTarget()
            );
            // 直接跳转下一轮时，立即关闭弹窗
            if (popupData.playing_coin_direct_next) {
                this.closeProcess(popupData, popup);
            }
        } else {
            // 无金币特效，直接关闭弹窗
            this.closeProcess(popupData, popup);
        }
    }

    /**
     * 弹窗关闭处理（播放关闭动画 + 执行回调）
     * @param popupData 弹窗数据组件
     * @param popupNode 弹窗节点
     */
    private closeProcess(popupData: PopupData, popupNode: PopupData): void {
        // 有关闭动画时，播放动画后关闭
        if (popupData && popupData.end_animation !== "") {
            let ani = popupNode.getComponent(cc.Animation);
            // 优先使用动画根节点的动画组件
            if (!TSUtility.isValid(ani) && popupNode.ani_pivot) {
                ani = popupNode.ani_pivot.getComponent(cc.Animation);
            }

            if (ani) {
                ani.play(popupData.end_animation, 0);
                // 忽略结束动画延迟：立即执行回调，动画结束后隐藏节点
                if (popupData.ignore_end_animation_delay) {
                    this.callCallback();
                    ani.once(cc.Animation.EventType.FINISHED, () => {
                        popupNode.node.active = false;
                    }, this);
                } else {
                    // 动画结束后执行回调并隐藏节点
                    ani.once(cc.Animation.EventType.FINISHED, () => {
                        this.callCallback();
                        popupNode.node.active = false;
                    }, this);
                }
            }
        } else {
            // 无关闭动画时，直接处理
            if (popupData.ignore_end_animation_delay) {
                this.callCallback();
            } else {
                this.callCallback();
                popupNode.node.active = false;
            }
        }
    }

    // ================= 分享信息获取 =================
    /**
     * 根据弹窗类型获取FB分享信息
     * @param resultType 结果弹窗类型
     * @param reward 奖励金额
     * @returns 分享信息对象
     */
    private getShareInfo(resultType: ResultPopupType, reward: number): any {
        let shareInfo: any = null;

        switch (resultType) {
            case ResultPopupType.BonusGameResult:
            case ResultPopupType.WheelOfVegasResult:
                shareInfo = GameResultPopup.getBonusShareInfo(reward);
                break;
            case ResultPopupType.FreespinResult:
                shareInfo = GameResultPopup.getFreespinShareInfo();
                break;
            case ResultPopupType.JackpotModeResult:
                shareInfo = GameResultPopup.getJackpotModeShareInfo(reward);
                break;
            case ResultPopupType.JackpotResultMini:
                shareInfo = GameResultPopup.getJackpotGameShareInfo(reward, 1);
                break;
            case ResultPopupType.JackpotResultMinor:
                shareInfo = GameResultPopup.getJackpotGameShareInfo(reward, 2);
                break;
            case ResultPopupType.JackpotResultMajor:
                shareInfo = GameResultPopup.getJackpotGameShareInfo(reward, 3);
                break;
            case ResultPopupType.JackpotResultMega:
                shareInfo = GameResultPopup.getJackpotGameShareInfo(reward, 4);
                break;
            case ResultPopupType.JackpotResultGrand:
                shareInfo = GameResultPopup.getJackpotGameShareInfo(reward, 12);
                break;
            case ResultPopupType.JackpotResultCommon:
                shareInfo = GameResultPopup.getJackpotGameShareInfo(reward, 5);
                break;
            case ResultPopupType.LinkedJackpotResult:
                shareInfo = GameResultPopup.getLockAndRollShareInfo();
                break;
            default:
                shareInfo = null;
                break;
        }

        return shareInfo;
    }

    // ================= 金币特效播放 =================
    /**
     * 播放金币爆炸特效
     * @param reward 奖励金额
     * @param callback 特效完成回调
     * @param target 特效目标节点
     */
    public onPlayCoinEffect(reward: number, callback: () => void, target: cc.Node): void {
        this.coin_components.playExplodeCoinEffect(reward, callback, target);
    }

    /**
     * 根据Jackpot类型设置弹窗结果类型
     * @param msg 弹窗消息
     * @param popupData 弹窗数据
     */
    public getJackpotType(msg: Popup_Msg|any, popupData: PopupData): void {
        switch (msg.params.jackpot_type) {
            case 4:
                popupData.result_type = ResultPopupType.JackpotResultGrand;
                break;
            case 3:
                popupData.result_type = ResultPopupType.JackpotResultMega;
                break;
            case 2:
                popupData.result_type = ResultPopupType.JackpotResultMajor;
                break;
            case 1:
                popupData.result_type = ResultPopupType.JackpotResultMinor;
                break;
            case 0:
                popupData.result_type = ResultPopupType.JackpotResultMini;
                break;
            default:
                break;
        }
    }

    // ================= 视图适配回调 =================
    /**
     * 视图调整前回调（空实现，供子类重写）
     */
    public onBeforeResizeView(): void {}

    /**
     * 视图调整中回调（空实现，供子类重写）
     */
    public onResizeView(): void {}

    /**
     * 视图调整后回调（刷新所有弹窗视图）
     */
    public onAfterResizeView(): void {
        this.refreshView();
    }

    // ================= 视图刷新 =================
    /**
     * 刷新所有弹窗的视图适配
     */
    public refreshView(): void {
        this.popup_list.forEach(popup => {
            this.refreshPopupView(popup);
        });
    }

    /**
     * 刷新单个弹窗的视图适配（遮罩层大小/位置）
     * @param popup 弹窗配置
     */
    public refreshPopupView(popup: PopupData): void {
        // 获取Canvas尺寸
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        const canvasSize = canvas.node.getContentSize();
        const canvasCenter = new cc.Vec2(Math.floor(canvasSize.width / 2), Math.floor(canvasSize.height / 2));

        // 调整遮罩层大小和位置
        if (popup.blockingBG) {
            // 获取父节点缩放比例
            let parentScale = TSUtility.getWorldParentScale(popup.blockingBG);
            if (parentScale === 0) {
                parentScale = 0.01;
            }

            // 转换Canvas中心到遮罩层父节点本地坐标
            const localCenter = popup.blockingBG.parent!.convertToNodeSpaceAR(canvasCenter);
            // 设置遮罩层位置和大小
            popup.blockingBG.setPosition(popup.blockingBG.x, localCenter.y);
            popup.blockingBG.setContentSize(new cc.Size(
                (canvasSize.width / parentScale) + 100,
                (canvasSize.height / parentScale) + 100
            ));
        }
    }
}