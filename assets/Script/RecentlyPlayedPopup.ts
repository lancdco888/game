// Cocos Creator 2.x 标准头部解构写法 (严格统一规范，置顶无修改)
const { ccclass, property } = cc._decorator;

// 所有依赖模块导入 - 路径与原混淆JS完全一致，无任何修改
import SDefine from "./global_utility/SDefine";
import GameCommonSound from "./GameCommonSound";
import UserInfo from "./User/UserInfo";
import MessageRoutingManager from "./message/MessageRoutingManager";
import TSUtility from "./global_utility/TSUtility";
import DialogBase, { DialogState } from "./DialogBase";
import PopupManager from "./manager/PopupManager";
import SlotBannerItem from "./SlotBannerItem";
import LobbySlotBannerInfo,{ SlotBannerType } from "./LobbySlotBannerInfo";
import ServiceInfoManager from "./ServiceInfoManager";
import ServiceSlotDataManager from "./manager/ServiceSlotDataManager";
import { Utility } from "./global_utility/Utility";

/**
 * 最近游玩老虎机 弹窗组件 (核心业务弹窗)
 * 继承通用弹窗基类DialogBase，核心功能：加载并展示用户最近游玩的老虎机列表、点击跳转对应老虎机、弹窗开/关动画、消息通信回调
 */
@ccclass
export default class RecentlyPlayedPopup extends DialogBase {
    // ===================== 全局常量 (原代码完整保留，数值无修改) =====================
    public MAX_COUNT: number = 8;

    // ===================== 序列化绑定属性 (与原代码完全一致，顺序不变，编辑器拖拽绑定) =====================
    @property(cc.Node)
    public pivot: cc.Node = null!;

    @property(cc.Layout)
    public layout: cc.Layout = null!;

    @property(cc.Prefab)
    public prefab: cc.Prefab = null!;

    // ===================== 私有成员变量 (原代码全部保留，补全精准TS类型注解，初始值完全一致) =====================
    private _pivotBanner: cc.Node | null = null;
    private _posXTargetBanner: number = -420;
    private _arrSlotItem: Array<SlotBannerItem> = [];

    // ===================== 核心静态方法 - 全局获取弹窗实例 (弹窗单例加载逻辑，原代码完整保留) =====================
    public static getPopup(callback: (error: Error | number|null, popup: RecentlyPlayedPopup | null) => void): void {
        const resPath = "Service/01_Content/RecentlyPlayed/Recently_Played";
        if (callback) PopupManager.Instance().showDisplayProgress(true);
        
        cc.loader.loadRes(resPath, (error: Error | null, prefab: cc.Prefab) => {
            if (callback) PopupManager.Instance().showDisplayProgress(false);
            if (error) {
                if (callback) {
                    DialogBase.exceptionLogOnResLoad(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(error)}`);
                    callback(error, null);
                }
                return;
            }
            if (callback) {
                const popupNode = cc.instantiate(prefab);
                const popupComp = popupNode.getComponent(RecentlyPlayedPopup);
                popupNode.active = false;
                callback(null, popupComp);
            }
        });
    }

    // ===================== 生命周期 - 弹窗加载初始化 (原逻辑完整保留，消息监听注册) =====================
    public onLoad(): void {
        this.initDailogBase();
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        this.blockingBG.setContentSize(canvas.node.getContentSize());
        // 注册关闭弹窗的消息监听
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.CLOSE_RECENTLYPLAYED, this.closeFromRecentlyPlayedIcon, this);
    }

    // ===================== 生命周期 - 弹窗销毁 (原逻辑完整保留，消息监听移除，防内存泄漏) =====================
    public onDestroy(): void {
        MessageRoutingManager.instance().removeListenerTargetAll(this);
    }

    // ===================== 核心方法 - 打开弹窗，初始化列表+播放动画 =====================
    public open(pivotNode: cc.Node): RecentlyPlayedPopup {
        // 循环创建8个老虎机横幅预制体，添加到布局容器
        for (let i = 0; i < this.MAX_COUNT; ++i) {
            const slotNode = cc.instantiate(this.prefab);
            this.layout.node.addChild(slotNode);
            slotNode.setPosition(cc.v2(0, 0));
            
            const slotItem = slotNode.getComponent(SlotBannerItem);
            if (TSUtility.isValid(slotItem)) {
                slotItem.isUseWithDynamicSlot = false;
                this._arrSlotItem.push(slotItem);
            }
        }

        this._pivotBanner = pivotNode;
        this.refreshUI();
        GameCommonSound.playFxOnce("pop_etc");
        this._open(null);
        
        const pivotPos = this.getPosPivotBanner();
        this.pivot.setPosition(pivotPos);
        this.playOpenAni(null);
        return this;
    }

    // ===================== 私有方法 - 获取基准横幅的本地坐标 (原逻辑完整保留) =====================
    private getPosPivotBanner(): cc.Vec2 {
        return this._pivotBanner ? TSUtility.getLocalPosition(this._pivotBanner, this.rootNode) : cc.Vec2.ZERO;
    }

    // ===================== 核心业务方法 - 刷新弹窗UI，加载最近游玩老虎机列表 (原逻辑完整保留，过滤规则丝毫不差) =====================
    public refreshUI(): void {
        const self = this;
        // 获取用户最近游玩的老虎机数据
        let recentPlaySlots = UserInfo.instance()._userInfo.userGameInfo.recentPlaySlots;
        if (!TSUtility.isValid(recentPlaySlots)) recentPlaySlots = [];

        const currGameId = UserInfo.instance().getGameId();
        const currZoneId = UserInfo.instance().getZoneId();
        let zoneInfo = null;
        let showIndex = 0;
        const addedSlotIds: string[] = [];

        // 遍历最近游玩列表，过滤+赋值数据
        const filterAndSetSlotData = (idx: number) => {
            const slotData = recentPlaySlots[idx];
            if (!TSUtility.isValid(slotData)) return "continue";

            var slotId = slotData.slotID;
            var zoneId = slotData.zoneID;
            // 过滤：排除当前正在游玩的老虎机
            if (currGameId == slotId && currZoneId == zoneId) return "continue";
            // 过滤：去重，同一个老虎机只显示一次
            if (addedSlotIds.indexOf(slotId) !== -1) return "continue";
            
            zoneInfo = UserInfo.instance().slotZoneInfo[zoneId];
            // 过滤：验证老虎机是否在对应分区列表中
            if (!self.isContainZoneSlotList(slotId, zoneInfo)) return "continue";

            const slotItem = self._arrSlotItem[showIndex];
            if (!TSUtility.isValid(slotItem)) return "continue";

            // 分区名称赋值规则
            let zoneName = "";
            if (zoneId === 0) {
                zoneName = SDefine.HIGHROLLER_ZONENAME;
            } else if (zoneId === 1) {
                zoneName = TSUtility.isDynamicSlot(slotId) ? SDefine.SUITE_ZONENAME : SDefine.VIP_LOUNGE_ZONENAME;
            }
            // 动态老虎机强制赋值分区ID和名称
            if (TSUtility.isDynamicSlot(slotId)) {
                zoneId = SDefine.SUITE_ZONEID;
                zoneName = SDefine.SUITE_ZONENAME;
            }

            // 获取老虎机横幅数据并初始化
            const bannerInfo = ServiceSlotDataManager.instance.getSlotBannerInfo(zoneId, slotId);
            slotItem.setLocation("lobby");
            slotItem.initialize(bannerInfo, SlotBannerType.RECENTLY);
            
            // 绑定老虎机点击回调 - 跳转老虎机核心逻辑
            slotItem.funcEntryEvent = () => {
                GameCommonSound.playFxOnce("btn_slots");
                MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.CLOSE_RECENTLYPLAYED, () => {
                    ServiceInfoManager.NUMBER_ENTRY_SLOT_BETTING_INDEX = -1;
                    ServiceInfoManager.STRING_SLOT_ENTER_LOCATION = "recently_played";
                    ServiceInfoManager.STRING_SLOT_ENTER_FLAG = "";
                    MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.MOVE_TO_SLOT, {
                        slotID: slotId,
                        zoneID: zoneId,
                        zoneName: zoneName
                    });
                });
            };

            addedSlotIds.push(slotId);
            showIndex++;
        };

        // 遍历所有最近游玩数据
        for (let i = 0; i < recentPlaySlots.length; ++i) {
            filterAndSetSlotData(i);
        }

        // 剩余空位初始化空数据，隐藏占位
        for (let i = showIndex; i < this.MAX_COUNT; ++i) {
            const slotItem = this._arrSlotItem[i];
            if (TSUtility.isValid(slotItem)) slotItem.initialize(null);
        }
    }

    // ===================== 空方法 - 老虎机点击占位方法 (原代码保留，无逻辑) =====================
    public onClick_Slot(): void {}

    // ===================== 核心动画 - 弹窗打开动画 (原逻辑完整保留，动画参数精准还原) =====================
    public playOpenAni(callback?: Function): void {
        const self = this;
        if (TSUtility.isValid(this._pivotBanner)) this._pivotBanner.active = false;
        
        // 播放弹窗开启动画 + pivot节点位移动画
        this.rootNode.getComponent(cc.Animation)!.play("Popup_Recently_Played_Ani", 0);
        this.pivot.runAction(cc.sequence(
            cc.moveTo(0.5, this._posXTargetBanner, this.getPosPivotBanner().y),
            cc.callFunc(() => {
                if (self.blockingBG) {
                    self.blockingBG.getComponent(cc.Button)!.clickEvents.push(Utility.getComponent_EventHandler(self.node, "DialogBase", "onClickClose", ""));
                }
                if (TSUtility.isValid(callback)) callback();
            })
        ));
    }

    // ===================== 核心动画 - 弹窗关闭动画 (原逻辑完整保留，动画参数精准还原) =====================
    public playCloseAni(callback?: Function): void {
        this.rootNode.getComponent(cc.Animation)!.play("Close_Recently_Played_Ani", 1);
        const pivotPos = this.getPosPivotBanner();
        
        this.pivot.runAction(cc.sequence(
            cc.moveTo(0.5, pivotPos.x, pivotPos.y),
            cc.delayTime(0.5),
            cc.callFunc(() => {
                if (TSUtility.isValid(callback)) callback();
            })
        ));
    }

    // ===================== 重写父类方法 - 返回按钮处理 (原逻辑完整保留) =====================
    public onBackBtnProcess(): boolean {
        this.onClickClose();
        return true;
    }

    // ===================== 核心方法 - 关闭弹窗 (原逻辑完整保留，资源清理+状态重置) =====================
    public close(): void {
        const self = this;
        if (this.isStateClose()) return;

        // 清空遮罩按钮事件 + 定时器 + 设置关闭状态
        this.blockingBG.getComponent(cc.Button)!.clickEvents = [];
        this.unscheduleAllCallbacks();
        this.setState(DialogState.Close);

        // 播放关闭动画后执行清理逻辑
        this.playCloseAni(() => {
            if (TSUtility.isValid(self._pivotBanner)) self._pivotBanner.active = true;
            self._pivotBanner = null;
            self.clear();
            self._close(null);
        });
    }

    // ===================== 消息回调 - 外部触发关闭弹窗 (原逻辑完整保留) =====================
    public closeFromRecentlyPlayedIcon(callback?: Function): void {
        this.setCloseCallback(() => {
            if (TSUtility.isValid(callback)) callback();
        });
        this.close();
    }

    // ===================== 私有工具方法 - 验证老虎机是否在分区列表中 (原逻辑完整保留) =====================
    private isContainZoneSlotList(slotId: string, zoneInfo: any): boolean {
        for (let i = 0; i < zoneInfo.slotList.length; i++) {
            if (slotId == zoneInfo.slotList[i].slotID) {
                return true;
            }
        }
        return false;
    }
}