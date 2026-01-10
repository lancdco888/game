// 严格遵循指定的装饰器导出方式
const { ccclass, property } = cc._decorator;


import GameCommonSound from "../../../Script/GameCommonSound";
import LobbyUIBase, { LobbyUIType } from "../../../Script/LobbyUIBase";
import TutorialCoinPromotion, { IntroduceInfo } from "../../../Script/TutorialCoinPromotion";
import UserInfo, { MSG } from "../../../Script/User/UserInfo";
import { CardPackBoosterPromotion } from "../../../Script/User/UserPromotion";
import SDefine from "../../../Script/global_utility/SDefine";
import TSUtility from "../../../Script/global_utility/TSUtility";
import TimeFormatHelper from "../../../Script/global_utility/TimeFormatHelper";
import { Utility } from "../../../Script/global_utility/Utility";
import PopupManager from "../../../Script/manager/PopupManager";
import UnlockContentsManager, { UnlockContentsType } from "../../../Script/manager/UnlockContentsManager";
import MessageRoutingManager from "../../../Script/message/MessageRoutingManager";
import AnimationButton from "./AnimationButton";


/**
 * 大厅星册UI组件（LobbyUI_StarAlbum）
 * 负责星册解锁状态、红点、赛季时间、Booster显示，弹窗打开与引导逻辑
 */
@ccclass("LobbyUI_StarAlbum")
export default class LobbyUI_StarAlbum extends LobbyUIBase {
    // ================= 可序列化属性（编辑器面板配置） =================
    @property(cc.Button)
    public btnIcon: cc.Button = null; // 星册图标按钮

    @property(cc.Button)
    public btnLock: cc.Button = null; // 锁定按钮

    @property(AnimationButton)
    public animButton: AnimationButton = null; // 动画按钮组件

    @property(cc.Node)
    public nodeIntroCoin: cc.Node = null; // 引导金币节点

    @property(cc.Node)
    public nodeRedDot: cc.Node = null; // 红点节点

    @property(cc.Node)
    public nodeRedDotPlus: cc.Node = null; // 红点+节点（数量>99时显示）

    @property(cc.Node)
    public nodeRemainTime: cc.Node = null; // 赛季剩余时间节点

    @property(cc.Node)
    public nodeBooster: cc.Node = null; // Booster节点

    @property(cc.Label)
    public lblRedDot: cc.Label = null; // 红点数量标签

    @property(cc.Label)
    public lblRemainTime: cc.Label | null = null; // 剩余时间标签

    // ================= 私有状态变量 =================
    private _infoIntroduce: IntroduceInfo | null = null; // 引导信息实例

    // ================= 访问器（Getter） =================
    /** UI类型（继承自LobbyUIBase） */
    get eType() {
        return LobbyUIType.STAR_ALBUM;
    }

    /** 引导信息 */
    get infoIntroduce() {
        return this._infoIntroduce;
    }

    /** 红点节点 */
    get nodeDot() {
        return this.nodeRedDot;
    }

    /** 数量标签 */
    get lblCount() {
        return this.lblRedDot;
    }

    // ================= 生命周期函数 =================
    onLoad() {
        if (!this.btnIcon || !this.btnLock || !this.animButton) {
            cc.log("LobbyUI_StarAlbum: 核心按钮/动画组件未配置");
            return;
        }

        // 绑定按钮点击事件
        this.btnIcon.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "LobbyUI_StarAlbum", "onClick_Icon", "")
        );
        this.btnLock.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "LobbyUI_StarAlbum", "onClick_Lock", "")
        );

        // // 初始化引导信息
        // this._infoIntroduce = new TutorialCoinPromotion.IntroduceInfo(
        //     TutorialCoinPromotion.INTRODUCE_MAIN.STARALBUM,
        //     "STARALBUM",
        //     this.nodeIntroCoin,
        //     this.openPopup.bind(this)
        // );

        // 注册事件监听
        MessageRoutingManager.instance().addListenerTarget(
            MessageRoutingManager.MSG.UPDATE_SERVICE_INTRODUCE_COIN,
            this.updateIntroduce.bind(this),
            this
        );
        UserInfo.instance().addListenerTarget(
            MSG.UPDATE_INVENTORY,
            this.updateUI.bind(this),
            this
        );
        UserInfo.instance().addListenerTarget(
            MSG.CHANGE_STARALBUM_SEASON,
            this.updateUI.bind(this),
            this
        );
        UserInfo.instance().addListenerTarget(
            MSG.UPDATE_LEVEL_UP,
            this.updateUI.bind(this),
            this
        );

        // // 赛季剩余时间更新（仅目标赛季）
        // const currentSeason = StarAlbumManager.instance().getCurrentSeasonInfo();
        // if (currentSeason.numSeasonID === SDefine.TargetCardSeason) {
        //     this.updateSeasonRemainTime();
        //     this.schedule(() => this.updateSeasonRemainTime(), 1); // 每1秒更新
        // }

        // 卡牌包Booster更新
        this.updateCardPackBooster();
        this.schedule(() => this.updateCardPackBooster(), 1); // 每1秒更新
    }

    onDestroy() {
        // 移除所有事件监听
        MessageRoutingManager.instance().removeListenerTargetAll(this);
        UserInfo.instance().removeListenerTargetAll(this);
        // 取消所有调度
        this.unscheduleAllCallbacks();
    }

    // ================= 核心业务逻辑 =================
    /**
     * 判断星册UI是否可用（达到解锁等级）
     * @returns 是否可用
     */
    public isAvailableUI(): boolean {
        const unlockLevel = UnlockContentsManager.instance.getUnlockConditionLevel(
            UnlockContentsType.STAR_ALBUM
        );
        return this.numUserLevel >= unlockLevel;
    }

    /**
     * 刷新UI状态（解锁状态、红点、动画）
     */
    public refresh(): void {
        if (!this.btnIcon || !this.btnLock || !this.animButton) return;

        // 更新按钮交互状态
        this.btnIcon.interactable = this.isAvailable;
        // 更新锁定按钮显隐
        if (TSUtility.isValid(this.btnLock.node)) {
            this.btnLock.node.active = !this.isAvailable;
        }
        // 停止/启动动画
        this.setStopAnimation(!this.isAvailable);
        // 设置红点数量
        this.setRewardCount(this.numRedDot);
        // 更新赛季剩余时间
        this.updateSeasonRemainTime();
    }

    /**
     * 获取红点数量（卡牌包总数）
     * @returns 红点数量
     */
    public getRedDotCount(): number {
        return this.inventory.getAllCardPackCnt();
    }

    /**
     * 更新卡牌包Booster状态
     */
    public updateCardPackBooster(): void {
        if (!this.nodeBooster) return;

        // 获取Booster促销信息
        const boosterInfo = UserInfo.instance().getPromotionInfo(CardPackBoosterPromotion.PromotionKeyName);
        // 更新Booster节点显隐
        this.nodeBooster.active = TSUtility.isValid(boosterInfo) && boosterInfo.isAvailableCardPackBooster();
    }

    /**
     * 更新赛季剩余时间显示
     */
    public updateSeasonRemainTime(): void {
        if (!this.nodeRemainTime || !this.lblRemainTime || !this.isAvailable) {
            this.nodeRemainTime.active = false;
            this.unschedule(this.updateSeasonRemainTime);
            return;
        }

        // // 获取当前赛季信息
        // const currentSeason = StarAlbumManager.instance().getCurrentSeasonInfo();
        // // 非目标赛季/时间已过期：停止更新并隐藏
        // if (
        //     currentSeason.numSeasonID !== SDefine.TargetCardSeason ||
        //     currentSeason.numEndDate <= TSUtility.getServerBaseNowUnixTime()
        // ) {
            this.unschedule(this.updateSeasonRemainTime);
            this.nodeRemainTime.active = false;
            return;
        // }

        // // 计算剩余秒数（保底0）
        // const remainSeconds = Math.max(0, currentSeason.numEndDate - TSUtility.getServerBaseNowUnixTime());
        // // 格式化时间
        // const timeFormatter = new TimeFormatHelper(remainSeconds);
        // const remainDays = Math.ceil(remainSeconds / 86400); // 转换为天数（向上取整）

        // // 14天内显示剩余时间
        // this.nodeRemainTime.active = remainDays <= 14;
        // // 更新时间标签
        // this.lblRemainTime.string = timeFormatter.getTimeStringDayBaseHourFormatBig();
    }

    /**
     * 设置红点奖励数量
     * @param count 数量
     */
    public setRewardCount(count: number): void {
        if (!this.lblRedDot || !this.nodeRedDot || !this.nodeRedDotPlus) return;

        // 数量超过99显示99，否则显示实际数值
        this.lblRedDot.string = count > 99 ? "99" : count.toString();
        // 更新红点显隐
        this.nodeRedDot.active = count > 0;
        this.nodeRedDotPlus.active = count > 99;
    }

    /**
     * 设置动画停止状态
     * @param isStop 是否停止
     */
    public setStopAnimation(isStop: boolean): void {
        this.animButton?.setStopAnimation(isStop);
    }

    /**
     * 打开星册主弹窗
     */
    public openPopup(): void {
        PopupManager.Instance().showDisplayProgress(true);
        // 异步获取弹窗实例并打开
        // StarAlbumMainPopup.getPopup((err: any, popup: StarAlbumMainPopup) => {
        //     PopupManager.Instance().showDisplayProgress(false);
        //     if (!TSUtility.isValid(err)) {
        //         popup.open();
        //     } else {
        //         error(`LobbyUI_StarAlbum: 打开星册弹窗失败 - ${err}`);
        //     }
        // });
    }

    // ================= 按钮点击回调 =================
    /**
     * 锁定按钮点击回调（显示解锁提示）
     */
    public onClick_Lock(): void {
        // 播放音效
        GameCommonSound.playFxOnce("btn_etc");
        // 显示解锁等级提示
        this.openTooltip({
            id: "LevelLockStarAlbum",
            nodeTarget: this.btnIcon!.node,
            pos: new cc.Vec2(0, 63), // 替换cc.v2为Vec2
            openTime: 3,
            level: UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.STAR_ALBUM)
        });
    }

    /**
     * 星册图标按钮点击回调
     */
    public onClick_Icon(): void {
        // 播放音效
        GameCommonSound.playFxOnce("btn_etc");
        // 可用且非引导状态：打开弹窗
        if (this.isAvailable && !this.isEnableIntroduce()) {
            this.openPopup();
        }
    }
}