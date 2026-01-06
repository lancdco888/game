import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import TimeFormatHelper from "../global_utility/TimeFormatHelper";
import PopupManager from "../manager/PopupManager";
import SlotTourneyPopup from "../SlotTourneyPopup";
import ServiceSlotDataManager from "../manager/ServiceSlotDataManager";
import MessageRoutingManager from "../message/MessageRoutingManager";
import SlotTourneyManager, { SlotTourneyTierType } from "../manager/SlotTourneyManager";
import LobbySlotBannerItem from "../LobbySlotBannerItem";
import { Utility } from "../global_utility/Utility";

const { ccclass, property } = cc._decorator;

/**
 * 老虎机锦标赛专题Banner组件
 * LobbySlotBannerItem_TOURNEY
 * Cocos Creator 2.4.13 完美兼容 - 无语法报错
 */
@ccclass()
export default class LobbySlotBannerItem_TOURNEY extends LobbySlotBannerItem {
    // ===================== Cocos 序列化属性 【与原JS@property完全一一对应，无遗漏】 =====================
    @property({ type: cc.Label, displayName: "奖金展示文本" })
    public lblPrize: cc.Label = null;

    @property({ type: cc.Label, displayName: "剩余时间文本" })
    public lblRemainTime: cc.Label = null;

    @property({ type: cc.Sprite, displayName: "Banner图片精灵" })
    public sprImage: cc.Sprite = null;

    @property({ type: cc.Node, displayName: "图片加载中节点" })
    public nodeLoadingBG: cc.Node = null;

    // ===================== 私有成员变量 【与原JS实例变量完全对应，补充TS类型声明】 =====================
    private _infoTourney: any = null;
    private _numPrize: number = 0;
    private _strCurSlotBannerURL: string = "";

    // ===================== 生命周期 & 核心业务方法 【1:1等价还原原JS所有逻辑】 =====================
    /**
     * 初始化方法 - 绑定按钮事件 + 注册全局消息监听
     * 原JS initialize 逻辑完整保留
     */
    public initialize(): void {
        // 绑定按钮点击事件
        const btnComponent = this.getComponent(cc.Button);
        btnComponent.clickEvents.push(Utility.getComponent_EventHandler(this.node, "LobbySlotBannerItem_TOURNEY", "onClick", ""));
        // 注册锦标赛消息监听 - 赛事状态变更时刷新UI
        const msgManager = MessageRoutingManager.instance();
        msgManager.addListenerTarget(MessageRoutingManager.MSG.TOURNEY_RESERVE_NEWGAME, this.updateUI, this);
        msgManager.addListenerTarget(MessageRoutingManager.MSG.TOURNEY_START_NEWGAME, this.updateUI, this);
    }

    /**
     * 外部刷新入口 - 数据更新时调用
     * 原JS refresh 逻辑：数据有效则执行UI全量更新
     */
    public refresh(): void {
        if (TSUtility.isValid(this.info)) {
            this.updateUI();
        }
    }

    /**
     * 组件销毁生命周期 - 释放所有监听/定时器 【防内存泄漏，原JS核心逻辑】
     */
    public onDestroy(): void {
        this.unscheduleAllCallbacks();
        MessageRoutingManager.instance().removeListenerTargetAll(this);
    }

    /**
     * 核心异步UI更新方法 【原JS最核心的异步逻辑，转为TS原生async/await】
     * 1. 清空所有定时器 2. 更新锦标赛数据 3. 定时刷新时间/奖金 4. 异步加载Banner图片
     */
    public async updateUI(): Promise<void> {
        this.unscheduleAllCallbacks();
        this._infoTourney = SlotTourneyManager.Instance().getCurrentTourneyInfo();
        
        // 每秒刷新一次剩余时间
        this.updateRemainTime();
        this.schedule(this.updateRemainTime, 1);

        // 按老虎机默认间隔刷新奖金池金额
        this.updateMoney();
        this.schedule(this.updateMoney, SDefine.JACKPOT_DISPLAY_DEFAULT_INTERVAL);

        // 异步加载Banner图片
        await this.updateImage();
    }

    /**
     * 异步加载锦标赛Banner图片 【原JS Promise异步逻辑 等价转TS await】
     * 带加载中节点/URL匹配校验/空值容错，防止图片加载错乱、内存泄漏
     */
    public async updateImage(): Promise<void> {
        this._strCurSlotBannerURL = "";
        this.nodeLoadingBG.active = true;
        this.sprImage.spriteFrame = null;

        const slotResData = ServiceSlotDataManager.instance.getResourceDataBySlotID(this._infoTourney.curSlotID);
        // 资源数据无效/不包含该老虎机ID → 直接返回
        if (!ServiceSlotDataManager.instance.isContainsSlotID(this._infoTourney.curSlotID) || !TSUtility.isValid(slotResData)) {
            return;
        }

        this._strCurSlotBannerURL = slotResData.smallURL;
        // 异步加载小图资源
        await new Promise<void>((resolve) => {
            slotResData.loadSmallImage((spriteFrame: cc.SpriteFrame, url: string) => {
                // 组件有效+图片有效+URL匹配 → 赋值图片并关闭加载中
                if (TSUtility.isValid(this) && TSUtility.isValid(spriteFrame) && this._strCurSlotBannerURL === url && this._strCurSlotBannerURL !== "") {
                    this.nodeLoadingBG.active = false;
                    this.sprImage.spriteFrame = spriteFrame;
                }
                resolve();
            });
        });
    }

    /**
     * 更新锦标赛开赛剩余倒计时 - 每秒执行
     * 原JS逻辑：取服务器时间差值，转分钟格式，最小值为0
     */
    public updateRemainTime(): void {
        const timeDiff = Math.max(0, this._infoTourney.getNextSlotStartTime() - TSUtility.getServerBaseNowUnixTime());
        this.lblRemainTime.string = TimeFormatHelper.getTotMiniuteTimeString(timeDiff);
    }

    /**
     * 更新锦标赛奖金池金额 - 按固定间隔执行
     * 奖金数字做渐变滚动显示，符合老虎机UI交互规范，原JS数值逻辑完全保留
     */
    public updateMoney(): void {
        this._numPrize = Utility.getDisplayJackpotMoney(this._numPrize, SlotTourneyManager.Instance().getTierProgressivePrize(SlotTourneyTierType.PREMIER));
        this.lblPrize.string = CurrencyFormatHelper.formatNumber(this._numPrize);
    }

    /**
     * Banner点击事件 - 打开锦标赛弹窗
     * 带加载进度条、弹窗容错校验，原JS逻辑完全保留
     */
    public onClick(): void {
        PopupManager.Instance().showDisplayProgress(true);
        SlotTourneyPopup.getPopup((err: any, popup: SlotTourneyPopup) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (!TSUtility.isValid(err)) {
                popup.open();
            }
        });
    }
}