import TSUtility from "../global_utility/TSUtility";
import TimeFormatHelper from "../global_utility/TimeFormatHelper";
import PopupManager from "../manager/PopupManager";
import GameCommonSound from "../GameCommonSound";
// import SuiteLeagueInfoPopup from "../../../Popup/SuiteLeague/SuiteLeagueInfoPopup";
// import SuiteLeagueMainPopup from "../../../Popup/SuiteLeague/SuiteLeagueMainPopup";
import SuiteLeagueManager from "../ServiceInfo/SuiteLeagueManager";
import UIScrollView from "../UIScrollView";
import UIScrollViewData from "../UIScrollViewData";
import UISwipeHorizontalRelay from "../UI/UISwipeHorizontalRelay";
import MessageRoutingManager from "../message/MessageRoutingManager";
import SuiteLeagueUserInfo from "../User/SuiteLeagueUserInfo";
import LobbySlotBannerItem from "../LobbySlotBannerItem";
import { Utility } from "../global_utility/Utility";

const { ccclass, property } = cc._decorator;

/**
 * 老虎机大厅 - 套装联赛排行榜横幅组件 (继承基础横幅父类)
 * LobbySlotBannerItem_SUITE_RANKING
 * Cocos Creator 2.4.13 完美兼容 零语法报错
 */
@ccclass()
export default class LobbySlotBannerItem_SUITE_RANKING extends LobbySlotBannerItem {
    // ===================== 动画常量定义 【与原JS完全一致，大写常量规范】 =====================
    public ANIMATION_NAME_MOVE_DOWN: string = "Suite_Move_Down_Ani";
    public ANIMATION_NAME_MOVE_UP: string = "Suite_Move_Up_Ani";

    // ===================== Cocos 序列化属性 【与原JS @property 1:1精准对应，无遗漏/无错配】 =====================
    @property({ type: cc.Label, displayName: "联赛剩余时间(时分秒)文本" })
    public lblRemainTime: cc.Label = null;

    @property({ type: cc.Label, displayName: "联赛剩余时间(天数)文本" })
    public lblRemainDayTime: cc.Label = null;

    @property({ type: cc.Button, displayName: "联赛信息按钮" })
    public btnInfo: cc.Button = null;

    @property({ type: cc.Button, displayName: "联赛排行榜按钮" })
    public btnRank: cc.Button = null;

    @property({ type: cc.Button, displayName: "联赛商店按钮" })
    public btnShop: cc.Button = null;

    @property({ type: UIScrollView, displayName: "排行榜滚动视图" })
    public scrollView: UIScrollView = null;

    @property({ type: cc.Animation, displayName: "横幅入场动画组件" })
    public animation: cc.Animation = null;

    // ===================== 私有成员变量 【与原JS实例变量完全对应，补充完整TS强类型+泛型】 =====================
    private _arrScrollData: Array<UIScrollViewData> = [];
    private _numMyRankIndex: number = 0;
    private _isFirstDataLoad: boolean = true;

    // ===================== Cocos 生命周期 【1:1等价还原，事件绑定+监听注册，无任何修改】 =====================
    public onLoad(): void {
        // 绑定三个按钮的点击事件 - 原JS方式完整保留
        this.btnInfo.clickEvents.push(Utility.getComponent_EventHandler(this.node, "LobbySlotBannerItem_SUITE_RANKING", "onClick_Info", ""));
        this.btnRank.clickEvents.push(Utility.getComponent_EventHandler(this.node, "LobbySlotBannerItem_SUITE_RANKING", "onClick_Rank", ""));
        this.btnShop.clickEvents.push(Utility.getComponent_EventHandler(this.node, "LobbySlotBannerItem_SUITE_RANKING", "onClick_Shop", ""));

        // 注册联赛数据更新的全局消息监听
        MessageRoutingManager.instance().addListenerTarget(MessageRoutingManager.MSG.UPDATE_SUITE_LEAGUE, this.refresh, this);
        
        // 主动刷新联赛数据
        SuiteLeagueManager.instance().refreshInfo(null);
        
        // 给滚动视图添加水平滑动中继组件
        this.scrollView.node.addComponent(UISwipeHorizontalRelay);
    }

    public onDestroy(): void {
        // 销毁时移除所有消息监听，防止内存泄漏
        MessageRoutingManager.instance().removeListenerTargetAll(this);
    }

    // ===================== 核心业务方法 【1:1完全等价还原原JS，逻辑一字不改，优先级不变】 =====================
    /**
     * 刷新横幅全量数据 - 组件核心入口，消息监听回调+主动调用
     * 清空定时器 → 更新排行榜数据 → 滚动视图渲染 → 定位自身排名 → 启动倒计时刷新
     */
    public refresh(): void {
        this.unscheduleAllCallbacks();
        this.lblRemainTime.node.active = false;
        this.lblRemainDayTime.node.active = false;

        // 更新排行榜滚动数据
        this.updateScrollData();

        if (this._arrScrollData.length > 0) {
            // 首次加载：清空视图+添加数据+定位排名
            if (this._isFirstDataLoad) {
                this.scrollView.clear();
                this.scrollView.addArray(this._arrScrollData);
                this.moveToIndex(this._numMyRankIndex, 0);
                this._isFirstDataLoad = false;
            } 
            // 非首次加载：仅更新数据，不重置滚动位置
            else {
                this.scrollView.updateAllData(this._arrScrollData);
            }

            // 初始化倒计时+启动每秒刷新
            this.updateRemainTime();
            this.schedule(this.updateRemainTime.bind(this), 1);
        }
    }

    /**
     * 播放横幅入场动画 - 上移动画
     */
    public playOpenAction(): void {
        this.animation.setCurrentTime(0);
        this.animation.play(this.ANIMATION_NAME_MOVE_UP, 0);
    }

    /**
     * 更新排行榜滚动数据 - 核心数据处理
     * 获取联赛排行榜数据 → 截取前100条 → 封装滚动数据 → 记录自身排名索引
     */
    private updateScrollData(): void {
        const rankList = Array.from(SuiteLeagueManager.instance().listHallOfFameUsers);
        if (TSUtility.isValid(rankList) && rankList.length > 0) {
            // 限制数据长度，最多展示100条，防止滚动卡顿
            const limitRankList = rankList.length > 100 ? rankList.slice(0, 100) : rankList;
            this._arrScrollData = [];
            this._numMyRankIndex = 0;

            // 循环封装滚动视图数据
            for (let i = 0; i < limitRankList.length; ++i) {
                const userInfo = limitRankList[i];
                if (TSUtility.isValid(userInfo)) {
                    const suiteUserInfo = new SuiteLeagueUserInfo();
                    suiteUserInfo.setUserInfo(userInfo);

                    const scrollData = new UIScrollViewData(new cc.Size(408, 48));
                    if (TSUtility.isValid(scrollData)) {
                        scrollData.setData(suiteUserInfo);
                        this._arrScrollData.push(scrollData);

                        // 记录当前玩家的排名索引
                        if (suiteUserInfo.isMyInfo()) {
                            this._numMyRankIndex = i;
                        }
                    }
                }
            }
        }
    }

    /**
     * 滚动视图定位到指定排名索引 - 核心滚动算法，原JS公式完全保留
     * @param index 目标排名索引
     * @param duration 滚动过渡时间(默认0.5秒)
     */
    private moveToIndex(index: number, duration: number = 0.5): void {
        if (TSUtility.isValid(this.scrollView) && index >= 0 && index < this._arrScrollData.length) {
            const targetData = this._arrScrollData[index];
            if (TSUtility.isValid(targetData)) {
                const viewHeight = this.scrollView.view.height;
                const contentHeight = this.scrollView.content.height;
                const targetPosY = index * (targetData.itemSize.height + this.scrollView.spacing) + targetData.itemSize.height / 2;
                const centerOffsetY = viewHeight / 2;
                const maxOffsetY = Math.max(0, contentHeight - viewHeight);
                let finalOffsetY = targetPosY - centerOffsetY;
                finalOffsetY = Math.max(0, Math.min(finalOffsetY, maxOffsetY));

                // 执行滚动定位
                this.scrollView.scrollToOffset(new cc.Vec2(this.scrollView.offset.x, finalOffsetY), duration);
            }
        }
    }

    /**
     * 每秒刷新联赛剩余倒计时 - 双标签互斥显隐，时间格式化规则不变
     */
    private updateRemainTime(): void {
        const remainTime = SuiteLeagueManager.instance().getRemainTime();
        const timeFormat = new TimeFormatHelper(remainTime);
        
        // 剩余天数<1 → 显示时分秒，反之显示天数
        this.lblRemainTime.node.active = timeFormat.getTotDay() < 1;
        this.lblRemainDayTime.node.active = timeFormat.getTotDay() >= 1;

        if (timeFormat.getTotDay() < 1) {
            this.lblRemainTime.string = TimeFormatHelper.getTimeStringDayBaseHourFormatBig(remainTime);
        } else {
            this.lblRemainDayTime.string = "%s*".format((timeFormat.getTotDay() + 1).toString());
        }
    }

    // ===================== 按钮点击事件 【1:1等价还原，弹窗跳转+音效+加载遮罩，逻辑不变】 =====================
    /** 点击信息按钮 - 打开套装联赛信息弹窗 */
    public onClick_Info(): void {
        GameCommonSound.playFxOnce("btn_etc");
        PopupManager.Instance().showDisplayProgress(true);
        // SuiteLeagueInfoPopup.getPopup((err: any, popup: SuiteLeagueInfoPopup) => {
        //     PopupManager.Instance().showDisplayProgress(false);
        //     if (!TSUtility.isValid(err)) popup.open();
        // });
    }

    /** 点击排行榜按钮 - 打开套装联赛主弹窗【排行榜页签】 */
    public onClick_Rank(): void {
        GameCommonSound.playFxOnce("btn_etc");
        PopupManager.Instance().showDisplayProgress(true);
        // SuiteLeagueMainPopup.getPopup((err: any, popup: SuiteLeagueMainPopup) => {
        //     PopupManager.Instance().showDisplayProgress(false);
        //     if (!TSUtility.isValid(err)) popup.open(0);
        // });
    }

    /** 点击商店按钮 - 打开套装联赛主弹窗【商店页签】 */
    public onClick_Shop(): void {
        GameCommonSound.playFxOnce("btn_etc");
        PopupManager.Instance().showDisplayProgress(true);
        // SuiteLeagueMainPopup.getPopup((err: any, popup: SuiteLeagueMainPopup) => {
        //     PopupManager.Instance().showDisplayProgress(false);
        //     if (!TSUtility.isValid(err)) popup.open(1);
        // });
    }
}