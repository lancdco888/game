const { ccclass, property } = cc._decorator;

// 项目内部模块导入 - 与原JS依赖路径/顺序完全一致，无任何改动
import AsyncHelper from "./global_utility/AsyncHelper";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
import PopupManager from "./manager/PopupManager";
// import MessageBoxPopup from "../Popup/Common/MessageBoxPopup";
import ServiceInfoManager from "./ServiceInfoManager";
import UserInfo from "./User/UserInfo";
import UserPromotion from "./User/UserPromotion";
import MessageRoutingManager from "./message/MessageRoutingManager";
import LobbyScene from "./LobbyScene";
// import LobbyTooltip from "./LobbyTooltip/LobbyTooltip";
// import LobbyTutorial from "./LobbyTutorial/LobbyTutorial";
import LobbyUIBase, { LobbyUIType } from "./LobbyUIBase";
import SceneInfo, { LobbySceneUIType } from "./SceneInfo";
import ServiceSlotDataManager from "./manager/ServiceSlotDataManager";
import LobbyUI_SlotScrollView from "./LobbyUI_SlotScrollView";


// ===================== 枚举定义 - 与原JS完全一致 不可修改 =====================



// ===================== 主类 大厅场景UI管理器 - 核心 =====================
@ccclass
export default class LobbySceneUI extends cc.Component {
    // ===================== 常量定义 - 与原JS完全一致 =====================
    public readonly ANIMATION_LOBBY_OPEN: string = "Lobby_Open_Ani";

    // ===================== Cocos 属性绑定 - 与原JS装饰器完全对应 编辑器拖拽绑定 =====================
    @property({ type: cc.Node })
    public nodeRoot: cc.Node = null;

    @property({ type: cc.Prefab })
    public prefTooltip: cc.Prefab = null;

    @property({ type: [SceneInfo] })
    public arrSceneInfo: SceneInfo[] = [];

    // ===================== 私有成员变量 - 完整TS强类型注解 下划线命名规则保留 =====================
    private _type: LobbySceneUIType = LobbySceneUIType.NONE;
    // private _tooltip: LobbyTooltip = null;
    private _animation: cc.Animation = null;
    // private _tutorial: LobbyTutorial = null;
    private _arrLobbyUI: LobbyUIBase[] = [];
    private _arrWidgetNode: cc.Node[] = [];

    // ===================== TS原生GET访问器 - 还原原JS的Object.defineProperty 功能完全一致 =====================
    public get type(): LobbySceneUIType {
        return this._type;
    }

    // public get tutorial(): LobbyTutorial {
    //     return this._tutorial;
    // }

    // ===================== 对外方法 - 获取滚动视图 供外部调用 (LobbyMoveManager核心调用) =====================
    public getScrollView(): LobbyUIBase {
        return this.getLobbyUI(LobbyUIType.BANNER_SCROLL_VIEW);
    }

    // ===================== 生命周期回调 - ONLOAD 1:1复刻原逻辑 =====================
    onLoad(): void {
        // 获取动画组件
        this._animation = this.nodeRoot.getComponent(cc.Animation);
        // 获取所有子UI组件
        this._arrLobbyUI = this.nodeRoot.getComponentsInChildren(LobbyUIBase);
        // 筛选所有Widget开头的节点
        this._arrWidgetNode = this.nodeRoot.children.filter(node => node.name.startsWith("Widget"));

        // 注册全局事件监听 - 全部与原JS一致
        const msgMgr = MessageRoutingManager.instance();
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.REFRESH_LOBBY_UI, this.updateUI, this);
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.LOBBY_CHANGE_UI_TYPE, this.changeSceneUI, this);
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.LOBBY_OPEN_TOOLTIP, this.openTooltip, this);
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.OPEN_MESSAGE_BOX, this.openMessageBox, this);
        msgMgr.addListenerTarget(MessageRoutingManager.MSG.OPEN_SLOT_ERROR_MESSAGE_BOX, this.openSlotErrorMessageBox, this);

        this.initialize(LobbySceneUIType.LOBBY)
    }

    // ===================== 生命周期回调 - ONDESTROY 1:1复刻原逻辑 =====================
    onDestroy(): void {
        this.unscheduleAllCallbacks();
        // 移除所有事件监听
        MessageRoutingManager.instance().removeListenerTargetAll(this);
        // 移除用户信息监听
        if (TSUtility.isValid(UserInfo.instance())) {
            //UserInfo.instance().removeListenerTargetAll(this);
        }
    }

    // ===================== 核心初始化方法 - 异步 完整复刻原逻辑 =====================
    public initialize = async (uiType: LobbySceneUIType): Promise<void> => {
        await ServiceSlotDataManager.instance.initialize();
        await LobbyUI_SlotScrollView.Instance.initialize();
        await this.updateSceneInfo(uiType);

        // 遍历初始化所有子UI组件
        for (let i = 0; i < this._arrLobbyUI.length; i++) {
            await this._arrLobbyUI[i].initialize();
        }

        // // 获取新手引导组件
        // this._tutorial = this.getLobbyUI(LobbyUIType.TUTORIAL);
        // // 预加载弹窗
        // MessageBoxPopup.getPopup(false, null);
        // MessageBoxPopup.getPopup(true, null);
        // 刷新UI
        await this.updateUI();
    }

    // ===================== 核心刷新方法 - 异步 完整复刻原逻辑 =====================
    public refreshUI = async (): Promise<void> => {
        PopupManager.Instance().showDisplayProgress(true);
        this.setActiveAllWidget(true);
        ServiceInfoManager.ARRAY_SHUFFLE_HOT_SLOT = [];

        // 刷新奖池信息
        await UserInfo.instance().asyncRefreshJackpotInfo(true);
        
        // 重置类型后重新初始化
        const oldType = this._type;
        this._type = LobbySceneUIType.NONE;
        await this.initialize(oldType);

        // 滚动视图归位
        const scrollView = this.getScrollView();
        if (TSUtility.isValid(scrollView)) {
            // scrollView.moveFirstPosition();
        }

        PopupManager.Instance().showDisplayProgress(false);
    }

    // ===================== 核心场景信息更新 - 异步 切换大厅类型核心逻辑 1:1复刻 =====================
    public updateSceneInfo = async (uiType: LobbySceneUIType): Promise<void> => {
        if (this._type === uiType) return;

        // 隐藏旧场景的所有节点
        if (this._type !== LobbySceneUIType.NONE) {
            this.arrSceneInfo.forEach(info => {
                if (info.type === this._type) {
                    info.arrActiveObject.forEach(node => node.active = false);
                }
            });
        } else {
            // 首次初始化 隐藏所有节点
            this.arrSceneInfo.forEach(info => {
                info.arrActiveObject.forEach(node => node.active = false);
            });
        }

        // 显示新场景的所有节点
        this.arrSceneInfo.forEach(info => {
            if (info.type === uiType) {
                info.arrActiveObject.forEach(node => node.active = true);
            }
        });

        // 更新当前类型 & 用户区域信息
        this._type = uiType;
        const zoneId = this._type === LobbySceneUIType.SUITE ? SDefine.SUITE_ZONEID : SDefine.VIP_LOUNGE_ZONEID;
        const zoneName = this._type === LobbySceneUIType.SUITE ? SDefine.SUITE_ZONENAME : SDefine.VIP_LOUNGE_ZONENAME;
        // UserInfo.instance().setZoneID(zoneId);
        // UserInfo.instance().setZoneName(zoneName);

        // // 记录大厅信息 & 套房区进入次数统计
        // ServiceInfoManager.STRING_LAST_LOBBY_NAME = UserInfo.instance().getZoneName();
        // if (this._type === LobbySceneUIType.SUITE) {
        //     ServiceInfoManager.NUMBER_SUITE_ENTER_COUNT++;
        // }
    }

    // ===================== UI刷新遍历 - 异步 保留原代码的try/catch容错 =====================
    public updateUI = async (): Promise<void> => {
        this._arrLobbyUI.forEach(uiComp => {
            try {
                uiComp.updateUI();
            } catch (err) {
                const errorMsg = err as Error;
                cc.error(`LobbySceneUI - updateUI: Error updating UI component. :${uiComp.eType}`, errorMsg);
            }
        });
    }

    // ===================== 核心场景切换 - 异步 大厅UI类型切换主入口 =====================
    public changeSceneUI = async (uiType: LobbySceneUIType): Promise<void> => {
        if (uiType === LobbySceneUIType.NONE || this._type === uiType) return;

        PopupManager.Instance().showBlockingBG(true);
        await this.updateSceneInfo(uiType);
        await this.updateUI();
        // 0.6秒延迟 与原JS一致
        await AsyncHelper.delayWithComponent(0.6, this);

        PopupManager.Instance().showBlockingBG(false);
        // 初始化并打开开场弹窗
        // await LobbyScene.instance.mgrLobbyUIStartPopup.initialize(true);
        // LobbyScene.instance.mgrLobbyUIStartPopup.openPopup();
        // // 校验新手引导
        // await this._tutorial.checkTutorial(LobbyTutorialCheckType.CHANGE_SCENE);
    }

    // ===================== 入场动画播放 - 异步 大厅进入动画+滚动位置恢复 =====================
    public playEnterAction = async (): Promise<void> => {
        PopupManager.Instance().showBlockingBG(true);
        const lastScrollOffset = ServiceInfoManager.NUMBER_LAST_LOBBY_SCROLL_OFFSET;

        // 判断是否需要播放入场动画 (非首次登录/非首次进入大厅/有滚动偏移 则不播放)
        if (!this.isFirstLoginUser() && !this.isFirstLobbyEnter() && lastScrollOffset !== 0) {
            // 恢复滚动位置
            MessageRoutingManager.instance().emitMessage(
                MessageRoutingManager.MSG.LOBBY_MOVE_SCROLL_TO_OFFSET,
                { offset: lastScrollOffset, duration: 0.5 }
            );
            await AsyncHelper.delayWithComponent(0.5, this);
        } else {
            // 播放入场动画
            this._animation.setCurrentTime(0);
            this._animation.play(this.ANIMATION_LOBBY_OPEN, 0);
            await AsyncHelper.delayWithComponent(this._animation.getClips()[0].duration, this);
        }

        // 重置滚动偏移记录
        ServiceInfoManager.STRING_LAST_LOBBY_SLOT_GAME_ID = "";
        ServiceInfoManager.NUMBER_LAST_LOBBY_SCROLL_OFFSET = 0;
        PopupManager.Instance().showBlockingBG(false);

        // 校验新手引导
        // await this._tutorial.checkTutorial(LobbyTutorial.LobbyTutorialCheckType.FINISH_ENTER_ACTION);
    }

    // ===================== 辅助判断 - 是否首次登录用户 (未领取欢迎奖励) =====================
    public isFirstLoginUser(): boolean {
        // const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.WelcomeBonusPromotion.PromotionKeyName);
        // return TSUtility.isValid(promotionInfo) && promotionInfo.isReceived === 0;
        return false;
    }

    // ===================== 辅助判断 - 是否首次进入大厅 =====================
    public isFirstLobbyEnter(): boolean {
        return ServiceInfoManager.NUMBER_LOOBY_ENTER_COUNT <= 1;
    }

    // ===================== UI组件获取 单实例 =====================
    public getLobbyUI(type: LobbyUIType): LobbyUIBase {
        const uiArr = this.getLobbyUIArray(type);
        return (TSUtility.isValid(uiArr) && uiArr.length > 0) ? uiArr[0] : null;
    }

    // ===================== UI组件获取 数组 =====================
    public getLobbyUIArray(type: LobbyUIType): LobbyUIBase[] {
        const result: LobbyUIBase[] = [];
        this._arrLobbyUI.forEach(uiComp => {
            if (uiComp.eType === type) {
                result.push(uiComp);
            }
        });
        return result;
    }

    // ===================== 获取UI节点 =====================
    public getLobbyNode(type: LobbyUIType): cc.Node {
        const uiComp = this.getLobbyUI(type);
        return TSUtility.isValid(uiComp) ? uiComp.node : null;
    }

    // ===================== UI组件克隆 =====================
    public getLobbyUIClone(type: LobbyUIType, parentNode: cc.Node): LobbyUIBase {
        if (!TSUtility.isValid(parentNode) || type === LobbyUIType.NONE) return null;
        const uiComp = this.getLobbyUI(type);
        if (!TSUtility.isValid(uiComp)) return null;

        const cloneNode = cc.instantiate(uiComp.node);
        const cloneComp = cloneNode.getComponent(LobbyUIBase);
        if (!TSUtility.isValid(cloneComp)) {
            cloneNode.destroy();
            return null;
        }

        parentNode.addChild(cloneNode);
        const localPos = TSUtility.getLocalPosition(uiComp.node, parentNode);
        cloneNode.setPosition(localPos);
        return cloneComp;
    }

    // ===================== 获取Widget节点 =====================
    public getLobbyWidget(name: string): cc.Node {
        const widgetName = `Widget${name}`;
        const node = this.nodeRoot.getChildByName(widgetName);
        return TSUtility.isValid(node) ? node : null;
    }

    // ===================== 打开提示弹窗 =====================
    public openTooltip(data: any): void {
        // if (!TSUtility.isValid(this._tooltip)) {
        //     const tooltipNode = instantiate(this.prefTooltip);
        //     tooltipNode.parent = this.node;
        //     this._tooltip = tooltipNode.getComponent(LobbyTooltip);
        //     this._tooltip.node.active = false;
        // }
        // this._tooltip.openTooltipInfo(data);
    }

    // ===================== 打开通用消息弹窗 =====================
    public openMessageBox(data: any): void {
        PopupManager.Instance().showDisplayProgress(true);
        // MessageBoxPopup.getPopup(TSUtility.isValid(data.title), (err, popup) => {
        //     PopupManager.Instance().showDisplayProgress(false);
        //     if (!TSUtility.isValid(err)) {
        //         popup.open(data);
        //     }
        // });
    }

    // ===================== 打开老虎机错误弹窗 - 异步 =====================
    public openSlotErrorMessageBox = async (): Promise<void> => {
        this.openMessageBox({
            title: "ISSUE FOUND",
            message: "There was an issue while\nloading slot information.",
            isNotXButton: true,
            close: () => {
                PopupManager.Instance().removeAllPopup();
                this.refreshUI();
            }
        });
    }

    // ===================== 设置所有Widget节点显隐 =====================
    public setActiveAllWidget(isActive: boolean): void {
        this._arrWidgetNode.forEach(node => node.active = isActive);
    }
}