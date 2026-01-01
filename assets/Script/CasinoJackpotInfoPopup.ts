const { ccclass, property } = cc._decorator;

// 导入所有依赖模块，路径与原JS完全一致，无需修改
import PopupManager from "./manager/PopupManager";
import CasinoZoneManager from "./manager/CasinoZoneManager";
import CurrencyFormatHelper from "./global_utility/CurrencyFormatHelper";
import LobbyTitleEffectSelector from "./LobbyTitleEffectSelector";
import DialogBase, { DialogState } from "./DialogBase";
import SlotJackpotManager from "./manager/SlotJackpotManager";
import SDefine from "./global_utility/SDefine";
import TSUtility from "./global_utility/TSUtility";
//import FBPictureSetter from "../../UI/FBPictureSetter";
import ServiceInfoManager from "./ServiceInfoManager";
import UserInfo from "./User/UserInfo";

/**
 * 大厅大奖信息弹窗 - 继承通用弹窗基类DialogBase
 * 功能：展示赌场大奖投注区间、大奖金额特效、最近中奖玩家信息、中奖金额/游戏/投注/时间、玩家头像加载
 * 与 LobbyTitleEffectSelector.ts 强联动，完美兼容所有前置TS脚本
 */
@ccclass("CasinoJackpotInfoPopup")
export default class CasinoJackpotInfoPopup extends DialogBase {
    // ===================== 【序列化属性】原JS所有拖拽绑定项，100%还原，2.4.13语法适配 =====================
    @property({ type: cc.Prefab, tooltip: "大奖标题特效预制体(关联LobbyTitleEffectSelector)" })
    public prefJackpotTitle: cc.Prefab = null!;

    @property(cc.Label)
    public infoLabel: cc.Label = null!;

    @property(cc.Node)
    public winnerNode: cc.Node = null!;

    @property(cc.Node)
    public winnerFirstNode: cc.Node = null!;

    @property(cc.Node)
    public nodeJackpotTitleRoot: cc.Node = null!;

    @property(cc.Label)
    public winnerName: cc.Label = null!;

    @property(cc.Label)
    public winPrize: cc.Label = null!;

    @property(cc.Label)
    public winGameId: cc.Label = null!;

    @property(cc.Label)
    public betInfo: cc.Label = null!;

    @property(cc.Label)
    public winDateLabel: cc.Label = null!;

    @property(cc.Sprite)
    public winnerPicImg: cc.Sprite = null!;

    @property(cc.Node)
    public bottomLayout: cc.Node = null!;

    @property(cc.Node)
    public lock_Guide_Node: cc.Node = null!;

    @property(cc.Node)
    public open_Guide_Node:cc.Node = null!;

    // ===================== 【私有成员变量】原JS所有变量完整还原，类型精准适配 =====================
    private _jackpot: LobbyTitleEffectSelector = null;

    // ===================== 【静态核心方法】弹窗对外暴露的打开/加载接口，原JS逻辑100%复刻 =====================
    /**
     * 异步加载弹窗预制体
     * @param callback 加载完成回调 (错误信息, 弹窗实例)
     */
    public static getPopup(callback: (err: Error | null, popup: CasinoJackpotInfoPopup | null) => void): void {
        const popupPath = "Service/01_Content/CasinoJackpot/Info/CasinoJackpotInfoPopup";
        cc.loader.loadRes(popupPath, (err, prefab) => {
            if (err) {
                DialogBase.exceptionLogOnResLoad(`cc.loader.loadRes fail ${popupPath}: ${JSON.stringify(err)}`);
                callback(err, null);
                return;
            }
            const popupNode = cc.instantiate(prefab as cc.Prefab);
            const popupComp = popupNode.getComponent(CasinoJackpotInfoPopup);
            popupNode.active = false;
            callback(null, popupComp);
        });
    }

    /**
     * 对外公开的打开弹窗方法
     * @param isOpenGuide 是否显示开启引导
     * @param closeCallback 弹窗关闭后的回调
     */
    public static openPopup(isOpenGuide: boolean = false, closeCallback: Function | null = null): void {
        PopupManager.Instance().showDisplayProgress(true);
        this.getPopup((err, popup) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (err) {
                cc.error("CasinoJackpotInfoPopup.getPopup fail.");
                closeCallback && closeCallback();
                return;
            }
            popup!.open(isOpenGuide);
            closeCallback && popup!.setCloseCallback(closeCallback);
        });
    }

    // ===================== 【生命周期回调】 =====================
    onLoad(): void {
        this.initDailogBase(); // 初始化弹窗基类
    }

    // ===================== 【核心重写方法】重写父类DialogBase的打开弹窗逻辑，原JS核心逻辑完整还原 =====================
    /**
     * 打开弹窗主逻辑
     * @param isOpenGuide 是否显示开启引导
     * @param isLockUI 是否锁定大奖UI
     */
    public open(isOpenGuide: boolean = false, isLockUI: boolean = false): void {
        const self = this;
        // 弹窗初始状态：半透明+缩放到0
        this.rootNode.opacity = 50;
        this.rootNode.setScale(0, 0);

        // 弹窗入场动画：淡入 + 缩放回弹
        const enterAction = cc.spawn(cc.fadeIn(.2), cc.scaleTo(.25, 1, 1).easing(cc.easeBackOut()));

        // 执行入场动画并回调业务逻辑
        this._open(enterAction, true, () => {
            // 1. 初始化投注区间文字：最小投注 ~ 最大投注
            const zoneInfo = CasinoZoneManager.Instance().getZoneInfo(SDefine.VIP_LOUNGE_ZONEID);
            const minBet = zoneInfo.minBet;
            self.infoLabel.string = `MIN ${CurrencyFormatHelper.formatEllipsisNumberUsingDot(minBet)}~MAX ${CurrencyFormatHelper.formatEllipsisNumberUsingDot(zoneInfo.maxBet)}`;

            // 2. 实例化大奖标题特效预制体 + 初始化特效组件
            const jackpotTitleNode = cc.instantiate(self.prefJackpotTitle);
            jackpotTitleNode.parent = self.nodeJackpotTitleRoot;
            jackpotTitleNode.setPosition(cc.Vec2.ZERO);
            self._jackpot = jackpotTitleNode.getComponent(LobbyTitleEffectSelector);
            self._jackpot!.initLobbyTitleEffectSelector();
            self._jackpot!.setActiveLockUI(isLockUI);
            self._jackpot!.setCenter();
            self._jackpot!.setActivePassNode(false);

            // 3. 获取并展示最近中奖玩家信息
            const lastWinInfo = SlotJackpotManager.Instance().getCasinoLastWinInfo(SDefine.VIP_LOUNGE_ZONEID);
            if (lastWinInfo) {
                self.winnerNode.active = true;
                self.winnerFirstNode.active = false;

                // 处理中奖玩家名称（自己/他人 区分 + 名字截断）
                if (lastWinInfo.user.uid === UserInfo.instance().getUid()) {
                    self.winnerName.string = TSUtility.getEllipsisName(UserInfo.instance().getUserName(), 13);
                } else {
                    self.winnerName.string = TSUtility.getEllipsisName(lastWinInfo.user.name, 13);
                }

                // 中奖游戏名称转大写
                self.winGameId.string = SDefine.getSlotName(lastWinInfo.slotID).toUpperCase();

                // 投注信息展示（总投注金币优先，无则展示线数*单注）
                if (lastWinInfo.totalBetCoin > 0) {
                    self.betInfo.string = `${CurrencyFormatHelper.formatEllipsisNumberUsingDot(lastWinInfo.totalBetCoin)} BET`;
                } else {
                    self.betInfo.string = `${CurrencyFormatHelper.formatEllipsisNumberUsingDot(lastWinInfo.betLine * lastWinInfo.betPerLine)} BET`;
                }

                // 中奖时间格式化（Just now / X mins ago / Xh ago）
                const timeDiff = TSUtility.getServerBaseNowUnixTime() - lastWinInfo.winDate;
                if (timeDiff < 120) {
                    self.winDateLabel.string = "Just now";
                } else if (timeDiff < 3600) {
                    const mins = Math.floor(timeDiff / 60 % 60);
                    self.winDateLabel.string = `${mins.toString()}mins ago`;
                } else {
                    const hours = Math.floor(timeDiff / 3600);
                    self.winDateLabel.string = `${hours.toString()}h ago`;
                }

                // 中奖金额展示
                self.winPrize.string = CurrencyFormatHelper.formatNumber(lastWinInfo.totalPrize);

                // 加载中奖玩家头像（自己/他人 区分）
                // if (lastWinInfo.user.uid === UserInfo.instance().getUid()) {
                //     if (UserInfo.instance().getUserPicUrl() !== "") {
                //         FBPictureSetter.loadProfilePicture(UserInfo.instance().getUserPicUrl(), FBPictureSetter.FB_PICTURE_TYPE.NORMAL, self.winnerPicImg, null);
                //     }
                // } else {
                //     if (lastWinInfo.user.picUrl !== "") {
                //         FBPictureSetter.loadProfilePicture(lastWinInfo.user.picUrl(), FBPictureSetter.FB_PICTURE_TYPE.NORMAL, self.winnerPicImg, null);
                //     }
                // }
            } else {
                // 无中奖信息时，显示默认节点
                self.winnerNode.active = false;
                self.winnerFirstNode.active = true;
            }

            // 4. 底部布局自适应宽度：取子节点最大宽度适配
            if (self.bottomLayout) {
                self.scheduleOnce(() => {
                    let maxWidth = 0;
                    for (let i = 0; i < self.bottomLayout.childrenCount; ++i) {
                        maxWidth = Math.max(maxWidth, self.bottomLayout.children[i].width);
                    }
                    self.bottomLayout.setContentSize(maxWidth, self.bottomLayout.height);
                }, 0.05);
            }

            // 5. 引导节点显隐控制：等级<5显示锁定引导，传参为true显示开启引导
            if (self.lock_Guide_Node) {
                self.lock_Guide_Node.active = ServiceInfoManager.instance.getUserLevel() < 5;
            }
            if (self.open_Guide_Node && isOpenGuide) {
                self.open_Guide_Node.active = true;
            }
        });
    }

    // ===================== 【核心重写方法】重写父类DialogBase的关闭弹窗逻辑 =====================
    public close(): void {
        if (this.isStateClose()) return;
        this.setState(DialogState.Close);
        this.clear(); // 清理弹窗状态

        // 弹窗退场动画：淡出 + 缩放到0
        const exitAction = cc.spawn(cc.fadeOut(.15), cc.scaleTo(.15, 0, 0).easing(cc.easeIn(1)));
        this._close(exitAction);
    }
}