import FireHoseSender, { FHLogType } from "../FireHoseSender";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import CustomButton from "../global_utility/CustomButton";
import DialogBase, { DialogState } from "../DialogBase";
import PopupManager from "../manager/PopupManager";
import GameCommonSound from "../GameCommonSound";
import CommonServer from "../Network/CommonServer";
import UserInfo from "../User/UserInfo";
import { UserWelcomeBackRenewalInfo } from "../User/UserPromotion";
import MessageRoutingManager from "../message/MessageRoutingManager";
import RewardCenterView, { RewardCenterViewType } from "../View/RewardCenterView";
import DailyStampManager from "../DailyStamp/2024/DailyStampManager";
import InboxMessagePrefabManager from "../InboxMessagePrefabManager";
import HyperBountyManager from "../manager/HyperBountyManager";
// import DailyStampManager from "../DailyStamp/2024/DailyStampManager";
// import HyperBountyManager from "../manager/HyperBountyManager";
// import WelcomeBackManager from "../Welcome/WelcomeBackRenewal_2025/WelcomeBackManager";
// import InboxMessagePrefabManager from "../InboxMessagePrefabManager";
import RewardCenterTab from "./RewardCenterTab";
// import RewardCenterView, { RewardCenterViewType } from "../View/RewardCenterView";
// import RewardCenterView_CheckInBonus from "../View/RewardCenterView_CheckInBonus";
// import RewardCenterView_Inbox from "./View/RewardCenterView_Inbox";
// import RewardCenterView_InboxSendGift_ELS from "./View/RewardCenterView_InboxSendGift_ELS";
// import RewardCenterView_InboxSendGift_ELS_EmptyFriend from "./View/RewardCenterView_InboxSendGift_ELS_EmptyFriend";
// import RewardCenterView_InboxSendGift_HRV from "./View/RewardCenterView_InboxSendGift_HRV";
// import RewardCenterView_InboxSendGift_HRV_EmptyFriend from "./View/RewardCenterView_InboxSendGift_HRV_EmptyFriend";
// import RewardCenterView_InboxSendGift_HRV_Guest from "./View/RewardCenterView_InboxSendGift_HRV_Guest";
// import RewardCenterView_InboxSendGift_HRV_GuestFirst from "./View/RewardCenterView_InboxSendGift_HRV_GuestFirst";
// import RewardCenterView_InboxSendGift_HRV_Permission from "./View/RewardCenterView_InboxSendGift_HRV_Permission";
// import RewardCenterView_InboxShare from "./View/RewardCenterView_InboxShare";
// import RewardCenterView_Main from "./View/RewardCenterView_Main";
// import RewardCenterView_TimeBonus from "./View/RewardCenterView_TimeBonus";

const { ccclass, property } = cc._decorator;

// 声明全局Utility 兼容原代码调用
declare const Utility: any;

@ccclass("RewardCenterPopup")
export default class RewardCenterPopup extends DialogBase {
    // 标签切换动画常量
    private readonly ANIMATION_NAME_TAB_MAIN = "BTN_Main_Active_Ani";
    private readonly ANIMATION_NAME_TAB_INBOX = "BTN_Inbox_Active_Ani";
    private readonly ANIMATION_NAME_TAB_TIME_BONUS = "BTN_TB_Active_Ani";
    private readonly ANIMATION_NAME_TAB_CHECK_IN_BONUS = "BTN_CB_Active_Ani";

    // Cocos 序列化属性
    @property(cc.Animation)
    public aniTab: cc.Animation = null!;

    @property(cc.Node)
    public nodeBlockTouch: cc.Node = null!;

    @property(cc.Node)
    public nodeLobbyBG: cc.Node = null!;

    @property(cc.Node)
    public nodeSlotBG: cc.Node = null!;

    // 内部成员变量
    private _arrTab: RewardCenterTab[] = [];
    private _arrView: RewardCenterView[] = [];
    private _curView: RewardCenterView | null = null;
    private _closeBtn: CustomButton | null = null;
	private _arrPopup: cc.Node[] = [];
	private _eCurTabType: RewardCenterViewType = RewardCenterViewType.NONE;

    /**
     * 【静态方法】加载奖励中心弹窗预制体 (全局调用入口)
     */
    public static getPopup(callback: (err: Error | null, popup: RewardCenterPopup | null) => void): void {
        const resPath = "Service/01_Content/RewardCenter/RewardCenterPopup";
        cc.loader.loadRes(resPath, (err, prefab) => {
            if (err) {
                const error = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                callback && callback(error, null);
                return;
            }
            if (callback) {
                const node = cc.instantiate(prefab);
                const popup = node.getComponent(RewardCenterPopup);
                node.active = false;
                callback(null, popup);
            }
        });
    }

    /**
     * 【静态方法】获取奖励中心所有可领取奖励的总数
     */
    public static getRewardCenterReceiveCount(): number {
        let count = 0;
        count += this.getGroupReceiveCount(RewardCenterViewType.MAIN);
        count += this.getGroupReceiveCount(RewardCenterViewType.INBOX_INBOX);
        count += this.getGroupReceiveCount(RewardCenterViewType.TIME_BONUS);
        count += this.getGroupReceiveCount(RewardCenterViewType.CHECK_IN_BONUS);
        return count;
    }

    /**
     * 【静态方法】按分组统计可领取奖励数
     */
    public static getGroupReceiveCount(type: RewardCenterViewType): number {
        const typeKeys: string[] = [];
        Object.keys(RewardCenterViewType).forEach((key) => {
            if (RewardCenterViewType[key].includes(type)) {
                typeKeys.push(key);
            }
        });

        let count = 0;
        typeKeys.forEach((key) => {
            count += this.getReceiveCount(key);
        });
        return count;
    }

    /**
     * 【静态方法】按视图类型获取单个分类可领取奖励数
     */
    public static getReceiveCount(typeKey: string): number {
        const viewType = RewardCenterViewType[typeKey];
        switch (viewType) {
            // case RewardCenterViewType.MAIN:
            //     return RewardCenterView_Main.getReceiveCount();
            // case RewardCenterViewType.INBOX_INBOX:
            //     return RewardCenterView_Inbox.getReceiveCount();
            // case RewardCenterViewType.INBOX_SEND_GIFT_HRV:
            //     return RewardCenterView_InboxSendGift_HRV.getReceiveCount();
            // case RewardCenterViewType.INBOX_SEND_GIFT_HRV_EMPTY_FRIEND:
            //     return RewardCenterView_InboxSendGift_HRV_EmptyFriend.getReceiveCount();
            // case RewardCenterViewType.INBOX_SEND_GIFT_HRV_GUEST_FIRST:
            //     return RewardCenterView_InboxSendGift_HRV_GuestFirst.getReceiveCount();
            // case RewardCenterViewType.INBOX_SEND_GIFT_HRV_GUEST:
            //     return RewardCenterView_InboxSendGift_HRV_Guest.getReceiveCount();
            // case RewardCenterViewType.INBOX_SEND_GIFT_HRV_PERMISSION:
            //     return RewardCenterView_InboxSendGift_HRV_Permission.getReceiveCount();
            // case RewardCenterViewType.INBOX_SEND_GIFT_ELS:
            //     return RewardCenterView_InboxSendGift_ELS.getReceiveCount();
            // case RewardCenterViewType.INBOX_SEND_GIFT_ELS_EMPTY_FRIEND:
            //     return RewardCenterView_InboxSendGift_ELS_EmptyFriend.getReceiveCount();
            // case RewardCenterViewType.INBOX_SHARE:
            //     return RewardCenterView_InboxShare.getReceiveCount();
            // case RewardCenterViewType.TIME_BONUS:
            //     return RewardCenterView_TimeBonus.getReceiveCount();
            // case RewardCenterViewType.CHECK_IN_BONUS:
            //     return RewardCenterView_CheckInBonus.getReceiveCount();
            default:
                return 0;
        }
    }

    // ===================== 生命周期方法 =====================
    onLoad(): void {
        this.initDailogBase();
        const msgMgr = MessageRoutingManager.instance();
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.REWARD_CENTER_CHANGE_VIEW, this.changeViewEvent, this);
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.REWARD_CENTER_SHOW_SENT_POPUP, this.showSentSuccessFully, this);
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.REWARD_CENTER_UPDATE_VIEW, this.updateView, this);
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.REWARD_CENTER_UPDATE_UI_TIME_BONUS, this.updateView, this);
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.REWARD_CENTER_BLOCK_TOUCH, this.setBlockBG, this);
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.REWARD_CENTER_CLOSE_DISABLE, this.setCloseDisable, this);
    }

    onDestroy(): void {
        DailyStampManager.instance.setRewardCenter(false);
    }

    /**
     * 返回按钮点击逻辑
     */
    onBackBtnProcess(): boolean {
        if (TSUtility.isValid(this._curView) || this._curView.isOnBackAvailable()) {
            this.close();
            return true;
        }
        return false;
    }

    // ===================== 核心业务方法 =====================
    /**
     * 打开奖励中心弹窗
     * @param viewType 打开的默认视图类型
     */
    open(viewType: RewardCenterViewType = RewardCenterViewType.MAIN): void {
        GameCommonSound.playFxOnce("pop_etc");
        
        // 视图类型容错处理
        if (viewType === RewardCenterViewType.NONE) {
            viewType = RewardCenterViewType.MAIN;
        } else if (viewType === RewardCenterViewType.INBOX_SEND_GIFT) {
            viewType = Utility.isFacebookInstant() === 1 ? RewardCenterViewType.INBOX_SEND_GIFT_ELS : RewardCenterViewType.INBOX_SEND_GIFT_HRV;
        }

        // 根据场景显示对应背景
        this.nodeLobbyBG.active = UserInfo.instance().getCurrentSceneMode() === SDefine.Lobby;
        this.nodeSlotBG.active = UserInfo.instance().getCurrentSceneMode() === SDefine.Slot;

        this.initialize();
        this.setChangeViewTab(viewType);
        this.setChangeView(viewType);
        
        this._open(cc.fadeIn(0.25), true, () => {
            this.checkWelcomeBackMission();
        });
    }

    /**
     * 初始化弹窗所有节点、视图、标签数据
     */
    initialize(): void {
        this.setBlockBG(false);

        // 初始化所有子视图
        const viewPort = this.rootNode.getChildByName("ViewPort");
        if (TSUtility.isValid(viewPort)) {
            this._arrView = viewPort.getComponentsInChildren(RewardCenterView);
            this._arrView.forEach(view => view.node.active = false);
        }

        // 初始化所有标签按钮
        const mainTab = this.rootNode.getChildByName("MainTab");
        if (TSUtility.isValid(mainTab)) {
            Object.keys(RewardCenterViewType).forEach((key) => {
                const btnNode = mainTab.getChildByName(`Btn_${RewardCenterViewType[key]}`);
                if (TSUtility.isValid(btnNode)) {
                    const tab = btnNode.addComponent(RewardCenterTab);
                    if (TSUtility.isValid(tab)) {
                        this._arrTab.push(tab.initialize(key as any));
                        const eventHandler = Utility.getComponent_EventHandler(this.node, "RewardCenterPopup", "onClick_ChangeView", RewardCenterViewType[key].toString());
                        tab.getButton().clickEvents.push(eventHandler);
                    }
                }
            });
        }

        // 初始化弹窗预制体
        const popupRoot = this.rootNode.getChildByName("PopupRoot");
        if (TSUtility.isValid(popupRoot)) {
            for (let i = 0; i < popupRoot.childrenCount; i++) {
                const popupNode = popupRoot.children[i];
                if (TSUtility.isValid(popupNode)) {
                    popupNode.active = false;
                    this._arrPopup.push(popupNode);
                }
            }
        }

        // 清理收件箱头像缓存
        InboxMessagePrefabManager.instance.clearProfileImage();
    }

    /**
     * 接收消息切换视图的异步事件
     * @param msg 消息体(JSON字符串)
     */
    private async changeViewEvent(msg: string): Promise<void> {
        const viewData = JSON.parse(msg);
        if (!TSUtility.isValid(viewData)) return;
        await this.setChangeView(viewData);
    }

    /**
     * 点击标签切换视图的回调
     * @param event 点击事件
     * @param tabType 标签类型字符串
     */
    onClick_ChangeView(event: Event, tabType: string): void {
        const viewType = tabType as unknown as RewardCenterViewType;
        if (TSUtility.isValid(viewType) && this._eCurTabType !== viewType) {
            GameCommonSound.playFxOnce("btn_etc");
            this.setChangeViewTab(viewType);
            this.setChangeView(viewType);
        }
    }

    /**
     * 设置标签选中状态 & 播放标签动画
     * @param viewType 视图类型
     */
    private setChangeViewTab(viewType: RewardCenterViewType): void {
        if (TSUtility.isValid(this._curView) && this._curView.getType() === viewType) return;

        // 播放对应标签激活动画
        this._arrTab.forEach(tab => {
            const tabViewType = RewardCenterViewType[tab.getType()];
            if (viewType.includes(tabViewType)) {
                if (tabViewType === RewardCenterViewType.MAIN) {
                    this.aniTab.play(this.ANIMATION_NAME_TAB_MAIN);
                } else if (tabViewType === RewardCenterViewType.INBOX_INBOX) {
                    this.aniTab.play(this.ANIMATION_NAME_TAB_INBOX);
                } else if (tabViewType === RewardCenterViewType.TIME_BONUS) {
                    this.aniTab.play(this.ANIMATION_NAME_TAB_TIME_BONUS);
                } else if (tabViewType === RewardCenterViewType.CHECK_IN_BONUS) {
                    this.aniTab.play(this.ANIMATION_NAME_TAB_CHECK_IN_BONUS);
                }
            }
        });

        // 设置标签按钮交互状态
        this._arrTab.forEach(tab => {
            const tabViewType = RewardCenterViewType[tab.getType()];
            tab.getButton().interactable = !viewType.includes(tabViewType);
        });

        this._eCurTabType = viewType;
    }

    /**
     * 切换视图核心逻辑 (异步)
     * @param viewType 目标视图类型
     */
    private async setChangeView(viewType: RewardCenterViewType): Promise<void> {
        if (viewType === RewardCenterViewType.NONE) return;
        if (TSUtility.isValid(this._curView) && this._curView.getType() === viewType) return;

        const targetView = this.getView(viewType);
        if (!TSUtility.isValid(targetView)) return;

        // 关闭当前视图
        if (TSUtility.isValid(this._curView)) {
            this._curView.onDisableView();
            this._curView = null;
        }

        // 激活目标视图
        this._curView = targetView;
        this.updateView();
        await this._curView.onEnableView();
    }

    /**
     * 根据视图类型获取对应的视图组件
     */
    private getView(viewType: RewardCenterViewType): RewardCenterView | null {
        const targetView = this._arrView.find(view => view.getType() === viewType);
        return TSUtility.isValid(targetView) ? targetView : null;
    }

    /**
     * 根据名称获取弹窗节点
     */
    private getPopup(popupName: string): cc.Node | null {
        const targetPopup = this._arrPopup.find(popup => popup.name === popupName);
        return TSUtility.isValid(targetPopup) ? targetPopup : null;
    }

    /**
     * 显示发送成功弹窗动画
     */
    showSentSuccessFully(callback?: () => void): void {
        const popupNode = this.getPopup("SentSuccessFully");
        if (!TSUtility.isValid(popupNode)) return;

        popupNode.stopAllActions();
        const fadeIn = cc.fadeIn(0.2);
        const callFunc = cc.callFunc(() => callback && callback());
        const delay = cc.delayTime(1);
        const fadeOut = cc.fadeOut(0.2);
        const hideNode = cc.callFunc(() => popupNode.active = false);

        popupNode.active = true;
        popupNode.runAction(cc.sequence(fadeIn, callFunc, delay, fadeOut, hideNode));
    }

    /**
     * 更新视图UI、红点状态
     */
    updateView(): void {
        this._arrTab.forEach(tab => tab.updateRedDot());
        if (this._eCurTabType !== RewardCenterViewType.CHECK_IN_BONUS) {
            this.setCloseDisable(false);
        }
    }

    /**
     * 设置遮罩层显示隐藏 (屏蔽触摸)
     */
    setBlockBG(isBlock: boolean): void {
        if (TSUtility.isValid(isBlock) && TSUtility.isValid(this.nodeBlockTouch)) {
            this.nodeBlockTouch.active = isBlock;
        }
    }

    /**
     * 检查欢迎回归任务-打开奖励中心
     */
    private checkWelcomeBackMission(): void {
        // if (WelcomeBackManager.instance.isContainsMission(WelcomeBackManager.prototype.WelcomeBackMissionType.OPEN_REWARD_CENTER)) {
        //     PopupManager.Instance().showDisplayProgress(true);
        //     CommonServer.Instance().requestAcceptPromotion(
        //         UserInfo.instance().getUid(),
        //         UserInfo.instance().getAccessToken(),
        //         UserWelcomeBackRenewalInfo.PromotionKeyName,
        //         3,7,"",
        //         (res) => {
        //             PopupManager.Instance().showDisplayProgress(false);
        //             if (!CommonServer.isServerResponseError(res)) {
        //                 const changeResult = UserInfo.instance().getServerChangeResult(res);
        //                 UserInfo.instance().applyChangeResult(changeResult);
        //             }
        //         }
        //     );
        // }
    }

    /**
     * 设置关闭按钮是否可点击
     */
    setCloseDisable(isDisable: boolean): void {
        if (TSUtility.isValid(isDisable) && TSUtility.isValid(this.closeBtn)) {
            if (!TSUtility.isValid(this._closeBtn)) {
                this._closeBtn = this.closeBtn.node.getComponent(CustomButton);
            }
            this._closeBtn.setInteractable(!isDisable);
        }
    }

    /**
     * 关闭奖励中心弹窗
     */
    close(): void {
        if (this.isStateClose()) return;

        // 清理数据 & 发送刷新消息
        InboxMessagePrefabManager.instance.clear();
        const msgMgr = MessageRoutingManager.instance();
        msgMgr.emitMessage(MessageRoutingManager.MSG.REFRESH_LOBBY_UI);
        msgMgr.emitMessage(MessageRoutingManager.MSG.REFRESH_INGAME_UI);
        msgMgr.emitMessage(MessageRoutingManager.MSG.LOBBY_REFRESH_ALL_BANNER_ITEM);

        // 处理超级赏金完成的任务弹窗
        const hyperBountyInst = HyperBountyManager.instance;
        for (let i = 0; i < hyperBountyInst._arrCompletedSeasonMissionArray.length; i++) {
            const mission = hyperBountyInst._arrCompletedSeasonMissionArray[i];
            if (TSUtility.isValid(mission)) {
                const missionId = mission.hyperBountyMissionInfo.numMissionID;
                if (
                    (missionId >= 801 && missionId <= 803) || 
                    (missionId >= 1001 && missionId <= 1102)
                ) {
                    PopupManager.Instance().addOpenPopup(mission.openPopupInfo);
                    hyperBountyInst._arrCompletedSeasonMissionArray[i] = null;
                }
            }
        }

        // 关闭弹窗动画 & 状态重置
        this.unscheduleAllCallbacks();
        this.setState(DialogState.Close);
        this.clear();
        this._close(cc.fadeOut(0.15));
    }
}