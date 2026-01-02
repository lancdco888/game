const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import GameCommonSound from "../GameCommonSound";
import UserHeroInfo from "../User/UserHeroInfo";
import UserInfo from "../User/UserInfo";
import CommonPrefabSetter from "../global_utility/CommonPrefabSetter";
import HeroManager from "../manager/HeroManager";
import TSUtility from "../global_utility/TSUtility";
import DialogBase, { DialogState } from "../DialogBase";
import PopupManager from "../manager/PopupManager";
import HeroInfoPopup from "./HeroInfoPopup";
import HeroInfoUI, { HeroInfoUIType } from "./HeroInfoUI";
import HeroSubPopup from "./HeroSubPopup";
import { Utility } from "../global_utility/Utility";

export enum TypeHeroSubPopup {
    none = 0,
    activeHeroPopup = 1,
    infoPopup = 2
}


@ccclass
export default class HeroMainPopup extends DialogBase {
    // ===================== 原文件枚举 TypeHeroSubPopup 标准化改写 数值完全一致 =====================


    // ===================== 序列化绑定节点属性 原数据完整保留 类型精准匹配 =====================
    @property(cc.Button)
    private infoBtn: cc.Button = null;

    @property(CommonPrefabSetter)
    private prefabSetter: CommonPrefabSetter = null;

    @property(HeroInfoUI)
    private heroTemplate: HeroInfoUI = null;

    @property(cc.Layout)
    private heroLayout: cc.Layout = null;

    @property(cc.Node)
    private decoNode: cc.Node = null;

    @property(cc.Button)
    private prevHeroBtn: cc.Button = null;

    @property(cc.Button)
    private nextHeroBtn: cc.Button = null;

    @property(HeroSubPopup)
    private subPopup: HeroSubPopup = null;

    // ===================== 私有成员变量 原数据完整保留 =====================
    private heroInfos: HeroInfoUI[] = [];
    private _startIndex: number = 0;

    // ===================== 静态核心方法 - 加载弹窗预制体 异常上报+进度显示 逻辑完全一致 =====================
    public static getPopup(callback: Function): void {
        PopupManager.Instance().showDisplayProgress(true);
        const popupPath: string = "Service/01_Content/Hero/HeroMain/HeroMainPopup";

        cc.loader.loadRes(popupPath, (error, prefab) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (error) {
                const loadError = new Error(`cc.loader.loadRes fail ${popupPath}: ${JSON.stringify(error)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, loadError));
                if (callback) callback(error, null);
                return;
            }

            if (callback) {
                const popupNode = cc.instantiate(prefab);
                const popupComp = popupNode.getComponent(HeroMainPopup);
                popupNode.active = false;
                callback(null, popupComp);
            }
        });
    }

    // ===================== 生命周期 - 弹窗加载初始化 事件绑定+子弹窗初始化 =====================
    public onLoad(): void {
        const self = this;
        this.initDailogBase();
        
        if (this.decoNode != null) {
            const canvasNode = cc.director.getScene().getComponentInChildren(cc.Canvas);
            this.decoNode.setContentSize(canvasNode.node.getContentSize());
        }

        // 按钮事件绑定 - 保留原项目工具类调用
        this.infoBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "HeroMainPopup", "onClickInfoBtn", ""));
        this.prevHeroBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "HeroMainPopup", "onClickPrevHeroBtn", ""));
        this.nextHeroBtn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "HeroMainPopup", "onClickNextHeroBtn", ""));

        // 子弹窗初始化
        this.subPopup._heroMainPopup = this;
        this.subPopup.close(false, false);
        this.subPopup.setOnCloseCallback((flag, isCloseMain) => {
            self.closeSubInfo(flag?1:0, isCloseMain);
        });
    }

    public onDestroy(): void {}

    // ===================== 弹窗关闭逻辑 清空数据+关闭基类弹窗 =====================
    public close(): void {
        if (this.isStateClose()) return;
        this.setState(DialogState.Close);
        this.clear();
        this._close(null);
    }

    // ===================== 弹窗打开主逻辑 入口方法 =====================
    public open(subPopupType: number): HeroMainPopup {
        this._open(cc.fadeIn(0.2), true);
        this.initUI(subPopupType);
        return this;
    }

    // ===================== 核心UI初始化 英雄列表渲染+数据赋值+骨骼动画控制 完整保留 =====================
    private initUI(subPopupType: number): void {
        const userHeroInfo = UserInfo.instance().getUserHeroInfo();
        const allHeroIds = HeroManager.Instance().getAllHeroIds();
        const activeHeroId = userHeroInfo.activeHeroID;

        // 英雄排序规则 - 严格保留原排序逻辑
        allHeroIds.sort((a, b) => {
            const heroAInfo = userHeroInfo.getHeroInfo(a);
            const heroBInfo = userHeroInfo.getHeroInfo(b);
            return UserHeroInfo.compareHeroOrder(a, b, heroAInfo, heroBInfo, activeHeroId);
        });

        this.heroTemplate.node.active = false;
        this.heroInfos = [];

        // 遍历创建英雄项
        for (let i = 0; i < allHeroIds.length; ++i) {
            const heroId = allHeroIds[i];
            const heroData = userHeroInfo.getHeroInfo(heroId);
            
            // 过滤百夫长英雄无效数据
            if (heroId === "hero_winston" && !TSUtility.isValid(heroData)) {
                continue;
            }

            const heroNode = cc.instantiate(this.heroTemplate.node);
            const heroUI = heroNode.getComponent(HeroInfoUI);
            heroNode.active = true;
            this.heroLayout.node.addChild(heroNode);
            heroNode.setPosition(cc.Vec2.ZERO);

            // 英雄数据赋值
            const isNewTag = HeroManager.Instance().isNewTag();
            let isActive = false;
            let heroRank = 1;
            let heroForce = 0;

            if (heroData) {
                heroRank = heroData.rank;
                heroForce = heroData.force;
                if (userHeroInfo.isActiveHero(heroId)) {
                    isActive = true;
                    heroUI.setPowerEffect(userHeroInfo.powerLevel);
                } else {
                    heroUI.setPowerEffect(0);
                }
            }

            // 英雄UI状态设置
            heroUI.setInfo(heroId, heroRank);
            heroUI.loadSpineController(HeroInfoUIType.Spine);
            heroUI.setActive(isActive);
            heroUI.setNewTag(isNewTag);
            heroUI.setExpProgress(heroForce);

            // 骨骼动画状态控制
            if (heroData) {
                if (isActive) {
                    heroUI.controller_SetThanks(heroRank);
                } else {
                    heroUI.controller_SetIdle(heroRank);
                }
            } else {
                heroUI.controller_SetSilhoutte();
            }

            // 未解锁英雄状态处理
            if (heroUI.controller_IsSilhoutteState()) {
                heroUI.btn.interactable = false;
                heroUI.hideInfo();
            }

            // 绑定英雄项点击事件
            heroUI.btn.clickEvents.push(Utility.getComponent_EventHandler(this.node, "HeroMainPopup", "onClickOpenSubInfo", heroId));
            this.heroInfos.push(heroUI);
        }

        this.refreshUI();

        // 子弹窗自动打开逻辑
        if (subPopupType === TypeHeroSubPopup.activeHeroPopup) {
            this.rootNode.opacity = 0;
            this.subPopup.open(userHeroInfo.activeHeroID, true);
        } else if (subPopupType === TypeHeroSubPopup.infoPopup) {
            this.showInfoPopup();
        }
    }

    // ===================== 刷新英雄列表 重新排序+状态更新 核心逻辑 =====================
    private refreshUI(): void {
        const userHeroInfo = UserInfo.instance().getUserHeroInfo();
        const activeHeroId = userHeroInfo.activeHeroID;

        // 重新排序英雄列表
        this.heroInfos.sort((a, b) => {
            const heroAInfo = userHeroInfo.getHeroInfo(a.heroId);
            const heroBInfo = userHeroInfo.getHeroInfo(b.heroId);
            return UserHeroInfo.compareHeroOrder(a.heroId, b.heroId, heroAInfo, heroBInfo, activeHeroId);
        });

        // 重新挂载节点
        for (let i = 0; i < this.heroInfos.length; ++i) {
            this.heroInfos[i].node.removeFromParent();
        }
        for (let i = 0; i < this.heroInfos.length; ++i) {
            this.heroLayout.node.addChild(this.heroInfos[i].node);
        }

        // 更新英雄状态
        for (let i = 0; i < this.heroInfos.length; ++i) {
            const heroId = this.heroInfos[i].heroId;
            this.heroInfos[i].setActive(userHeroInfo.isActiveHero(heroId));
            
            const heroData = userHeroInfo.getHeroInfo(heroId);
            if (heroData) {
                const heroRank = heroData.rank;
                if (userHeroInfo.isActiveHero(heroId)) {
                    this.heroInfos[i].controller_SetThanks(heroRank);
                    this.heroInfos[i].setPowerEffect(userHeroInfo.powerLevel);
                } else {
                    this.heroInfos[i].controller_SetIdle(heroRank);
                    this.heroInfos[i].setPowerEffect(0);
                }
            }
            this.heroInfos[i].setNewTag(HeroManager.Instance().isNewTag());
        }

        this._startIndex = 0;
        this.refreshHeroLayout();
    }

    // ===================== 按钮点击事件 - 打开英雄说明弹窗 =====================
    private onClickInfoBtn(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.showInfoPopup();
    }

    private showInfoPopup(): void {
        HeroInfoPopup.getPopup((error, popup) => {
            if (!error) popup.open();
        });
    }

    // ===================== 翻页按钮事件 - 上一页/下一页 步长3 边界校验 =====================
    private onClickPrevHeroBtn(): void {
        this._startIndex = Math.max(this._startIndex - 3, 0);
        this.refreshHeroLayout();
    }

    private onClickNextHeroBtn(): void {
        this._startIndex = Math.min(this._startIndex + 3, this.heroInfos.length - 3);
        this.refreshHeroLayout();
    }

    // ===================== 刷新英雄布局 控制显隐+翻页按钮状态 =====================
    private refreshHeroLayout(): void {
        for (let i = 0; i < this.heroInfos.length; ++i) {
            if (this._startIndex <= i && i < this._startIndex + 3) {
                this.heroInfos[i].node.active = true;
            } else {
                this.heroInfos[i].node.active = false;
            }
        }

        // 翻页按钮显隐控制
        this.prevHeroBtn.node.active = this._startIndex !== 0;
        this.nextHeroBtn.node.active = this._startIndex + 3 < this.heroInfos.length;
    }

    // ===================== 子弹窗关闭回调 核心联动逻辑 =====================
    private closeSubInfo(flag: number, isCloseMain: boolean): void {
        if (isCloseMain) {
            this.close();
        } else if (this.rootNode.opacity !== 255 || flag !== 0) {
            this.rootNode.opacity = 255;
            if (this.subPopup.changeActiveHero) {
                this.refreshUI();
            }
        } else {
            this.close();
        }
    }

    // ===================== 英雄项点击事件 - 打开子弹窗 =====================
    private onClickOpenSubInfo(event: any, heroId: string): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.subPopup.open(heroId, false);
    }

    // ===================== 返回按钮处理 优先关闭子弹窗 =====================
    public onBackBtnProcess(): boolean {
        if (this.subPopup.isOpen()) {
            this.subPopup.close(false, false);
            return true;
        } else {
            this.onClickClose();
            return true;
        }
    }

    // ===================== 清空数据 =====================
    public clear(): void {
        this.heroInfos = [];
        this._startIndex = 0;
    }
}