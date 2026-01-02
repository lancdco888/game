const { ccclass, property } = cc._decorator;

// 导入项目所有依赖模块 - 路径与原JS完全一致，直接复用
import LanguageManager from "../Config/LanguageManager";
import CommonServer from "../Network/CommonServer";
import ServiceInfoManager from "../ServiceInfoManager";
import GameCommonSound from "../GameCommonSound";
import UserHeroInfo from "../User/UserHeroInfo";
import UserInfo from "../User/UserInfo";
import MessageRoutingManager from "../message/MessageRoutingManager";
import CommonPopup from "../Popup/CommonPopup";
import HeroBuff from "./HeroBuff";
import PopupManager from "../manager/PopupManager";
import GraphHeroBuffComponent from "./GraphHeroBuffComponent";
import HeroInfoUI, { HeroInfoUIType } from "./HeroInfoUI";
import HeroStatSetter from "./HeroStatSetter";
import { Utility } from "../global_utility/Utility";

@ccclass
export default class HeroSubPopup extends cc.Component {
    // ====================== 编辑器序列化绑定属性 (与原JS完全一致，直接拖拽绑定) ======================
    @property(cc.Node)
    private subInfoBlockBG: cc.Node = null;

    @property(HeroInfoUI)
    private heroSubInfoUI: HeroInfoUI = null;

    @property(cc.Button)
    private subInfoCloseBtn: cc.Button = null;

    @property(cc.Button)
    private subInfoSelectBtn: cc.Button = null;

    @property(cc.Node)
    private subInfoSelectEffect: cc.Node = null;

    @property(cc.Button)
    private goToMainPopupBtn: cc.Button = null;

    @property(HeroStatSetter)
    private statSetter: HeroStatSetter = null;

    @property([HeroStatSetter])
    private listStatSetter: HeroStatSetter[] = [];

    @property(cc.Node)
    private nodeGraphNormal: cc.Node = null;

    @property(cc.Node)
    private nodeGraphHeroBuff: cc.Node = null;

    @property(cc.Node)
    private nodeIconHeroBuff: cc.Node = null;

    @property(cc.Button)
    private tooltipOpenBtn: cc.Button = null;

    @property(cc.Button)
    private tooltipCloseBtn: cc.Button = null;

    @property(cc.Node)
    private tooltipNode: cc.Node = null;

    @property(cc.Node)
    private rootForce: cc.Node = null;

    @property([cc.Node])
    private listLabelInfoNormal: cc.Node[] = [];

    @property([cc.Node])
    private listLabelInfoCenturionClique: cc.Node[] = [];

    // ====================== 私有成员变量 ======================
    public changeActiveHero: boolean = false;
    public _heroMainPopup: any = null;
    private _closeCallback: (isGoMain: boolean, isGoBuff: boolean) => void = null;
    private _isBlocked: boolean = false;

    // ====================== 生命周期回调 ======================
    protected onLoad(): void {
        // 获取画布节点，设置遮罩层和tooltip关闭按钮的全屏尺寸
        const canvasNode = cc.director.getScene().getComponentInChildren(cc.Canvas).node;
        this.subInfoBlockBG.setContentSize(canvasNode.getContentSize());
        this.tooltipCloseBtn.node.setContentSize(canvasNode.getContentSize());

        // 绑定所有按钮点击事件 - 复用项目通用工具类方法
        this.subInfoCloseBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "HeroSubPopup", "onClickSubInfoCloseBtn", ""));
        this.subInfoSelectBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "HeroSubPopup", "onClickSelectHeroBtn", ""));
        this.tooltipOpenBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "HeroSubPopup", "onClickTooltipOpenBtn", ""));
        this.tooltipCloseBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "HeroSubPopup", "onClickTooltipCloseBtn", ""));
        this.goToMainPopupBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "HeroSubPopup", "onClickGoToMainPopupBtn", ""));
        // 英雄Buff图标按钮单独绑定事件
        this.nodeIconHeroBuff.getComponent(cc.Button).clickEvents.push(Utility.getComponent_EventHandler(this.node, "HeroSubPopup", "onClickHeroBuffIcon", ""));
    }

    // ====================== 对外公开核心方法 ======================
    /**
     * 判断弹窗是否处于打开状态
     */
    public isOpen(): boolean {
        return this.node.active;
    }

    /**
     * 打开英雄子信息弹窗 核心方法
     * @param heroId 英雄唯一ID
     * @param isShowGoMainBtn 是否显示「前往主弹窗」按钮
     */
    public open(heroId: string, isShowGoMainBtn: boolean): void {
        const self = this;
        this.node.active = true;
        this.node.opacity = 0;
        // 淡入动画 0.15秒
        this.node.runAction(cc.fadeIn(0.15));
        
        this.closeTooltip();
        this.changeActiveHero = false;
        this.goToMainPopupBtn.node.active = isShowGoMainBtn;

        // 获取用户英雄数据 & 当前英雄信息
        const userHeroInfo = UserInfo.instance().getUserHeroInfo();
        const curHeroInfo = userHeroInfo.getHeroInfo(heroId);
        const heroRank = curHeroInfo.rank;

        // 设置英雄UI基础信息 + 加载骨骼动画
        this.heroSubInfoUI.setInfo(heroId, heroRank);
        this.heroSubInfoUI.loadSpineController(HeroInfoUIType.Spine);

        // 判断是否为 百夫长阵营英雄 - 切换不同的信息标签组
        if (curHeroInfo.isCenturionCliqueHero()) {
            this.rootForce.active = false;
            this.listLabelInfoNormal.forEach(node => node.active = false);
            this.listLabelInfoCenturionClique.forEach(node => node.active = true);
        } else {
            this.rootForce.active = true;
            this.listLabelInfoNormal.forEach(node => node.active = true);
            this.listLabelInfoCenturionClique.forEach(node => node.active = false);
        }

        // 初始化选中按钮状态 & 英雄动画状态
        this.subInfoSelectBtn.node.active = false;
        let isActiveHero = false;
        const heroForce = curHeroInfo.force;

        // 判断当前英雄是否为已激活英雄
        if (userHeroInfo.isActiveHero(heroId)) {
            isActiveHero = true;
            this.heroSubInfoUI.controller_SetThanks(heroRank);
            this.heroSubInfoUI.setPowerEffect(userHeroInfo.powerLevel);
        } else {
            // 未激活 - 显示选择按钮，并判断是否可切换英雄(冷却判断)
            this.subInfoSelectBtn.node.active = true;
            if (userHeroInfo.isActiveHeroChangeable()) {
                this.subInfoSelectBtn.interactable = true;
                this.subInfoSelectEffect.active = true;
            } else {
                this.subInfoSelectBtn.interactable = false;
                this.subInfoSelectEffect.active = false;
            }
            this.heroSubInfoUI.controller_SetIdle(heroRank);
            this.heroSubInfoUI.setPowerEffect(0);
        }

        // 设置英雄激活状态 & 经验进度条
        this.heroSubInfoUI.setActive(isActiveHero);
        this.heroSubInfoUI.setExpProgress(heroForce);

        // 绘制英雄属性图形 (单个+数组批量绘制)
        this.statSetter.drawStat(heroId, heroRank);
        this.listStatSetter.forEach(item => item.drawStat(heroId, heroRank));

        // 初始化属性图形节点 & Buff图标默认状态
        this.nodeGraphNormal.active = true;
        this.nodeGraphHeroBuff.active = false;
        this.nodeIconHeroBuff.active = false;
        this.nodeIconHeroBuff.getComponent(cc.Button).enabled = false;

        // 如果开启英雄Buff功能 - 切换为Buff属性图 + 显示Buff图标
        // if (ServiceInfoManager.instance.isAvailableHeroBuffInfo()) {
        //     this.nodeIconHeroBuff.active = true;
        //     this.scheduleOnce(() => {
        //         self.nodeIconHeroBuff.getComponent(cc.Button).enabled = true;
        //         self.nodeGraphNormal.active = false;
        //         self.nodeGraphHeroBuff.getComponent(GraphHeroBuffComponent).init();
        //         self.nodeGraphHeroBuff.active = true;
        //     }, 0.5);
        // }
    }

    /**
     * 设置弹窗关闭回调函数
     */
    public setOnCloseCallback(callback: (isGoMain: boolean, isGoBuff: boolean) => void): void {
        this._closeCallback = callback;
    }

    /**
     * 关闭弹窗核心方法
     * @param isGoMain 是否跳转主弹窗
     * @param isGoBuff 是否跳转英雄Buff弹窗
     */
    public close(isGoMain: boolean = false, isGoBuff: boolean = false): void {
        if (this.node.active) {
            this.node.active = false;
            if (this._closeCallback) {
                this._closeCallback(isGoMain, isGoBuff);
            }
        }
    }

    // ====================== 所有按钮点击事件回调方法 ======================
    /** 关闭按钮点击 */
    public onClickSubInfoCloseBtn(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.close(false, false);
    }

    /** 选择/切换激活英雄按钮点击 - 核心业务逻辑 */
    public onClickSelectHeroBtn(): void {
        GameCommonSound.playFxOnce("btn_etc");
        const curHeroId = this.heroSubInfoUI.heroId;
        this._isBlocked = true;

        // 打开确认弹窗
        CommonPopup.getCommonPopup((err, popup) => {
            if (!err) {
                popup.open();
                // 计算冷却小时数 & 获取多语言文本
                const coolTimeHour = Math.floor(UserHeroInfo.HeroActiveHeroChangeCoolTime / 3600);
                const contentTxt = LanguageManager.Instance().getCommonText(
                    "Would you like to change\nyour active Hero?\nYou will not be able to make another change for %s hours."
                ).format(coolTimeHour.toString());
                
                // 设置弹窗标题+内容
                popup.setInfo(
                    LanguageManager.Instance().getCommonText("CHANGE ACTIVE HERO"),
                    contentTxt
                );

                // 确认按钮回调 - 请求服务器切换英雄
                popup.setOkBtn("OK", () => {
                    PopupManager.Instance().showDisplayProgress(true);
                    CommonServer.Instance().requestChangeActiveHero(curHeroId, (res) => {
                        this._isBlocked = false;
                        PopupManager.Instance().showDisplayProgress(false);
                        
                        // 请求成功 无错误
                        if (!CommonServer.isServerResponseError(res)) {
                            UserInfo.instance().changeActiveHero(Number(curHeroId));
                            this.changeActiveHero = true;

                            const userHeroInfo = UserInfo.instance().getUserHeroInfo();
                            const curHeroInfo = userHeroInfo.getHeroInfo(curHeroId);
                            
                            // 更新UI状态
                            this.heroSubInfoUI.controller_SetThanks(curHeroInfo.rank);
                            this.heroSubInfoUI.setPowerEffect(userHeroInfo.powerLevel);
                            this.heroSubInfoUI.setActive(true);
                            this.subInfoSelectBtn.node.active = false;

                            // 发送全局消息 - 通知英雄已切换
                            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.CHANGE_ACTIVE_HERO, null);
                        } else {
                            cc.error(`requestChangeActiveHero fail : ${JSON.stringify(res)}`);
                        }
                    });
                });

                // 取消按钮回调 - 空逻辑
                popup.setCancelBtn("CANCEL", () => {});
            }
        });
    }

    /** 打开提示框按钮点击 */
    public onClickTooltipOpenBtn(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.openTooltip();
    }

    /** 关闭提示框按钮点击 */
    public onClickTooltipCloseBtn(): void {
        this.closeTooltip();
    }

    /** 前往主弹窗按钮点击 */
    public onClickGoToMainPopupBtn(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.close(true, false);
    }

    /** 英雄Buff图标按钮点击 - 跳转Buff弹窗 */
    public onClickHeroBuffIcon(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.close(true, true);
        PopupManager.Instance().showDisplayProgress(true);
        
        HeroBuff.getPopup((err, popup) => {
            if (!err) {
                popup.open(true);
                popup.setCloseCallback(() => {});
            }
        });
    }

    // ====================== 提示框 相关私有方法 ======================
    /** 打开提示框，5秒后自动关闭 */
    private openTooltip(): void {
        this.tooltipCloseBtn.node.active = true;
        this.scheduleOnce(this.closeTooltip.bind(this), 5);
    }

    /** 关闭提示框，清除定时器 */
    private closeTooltip(): void {
        this.unschedule(this.closeTooltip);
        this.tooltipCloseBtn.node.active = false;
    }
}