import GameCommonSound from "../GameCommonSound";
import HeroInfoUI, { HeroInfoUIType } from "../Hero/HeroInfoUI";
import HeroMainPopup, { TypeHeroSubPopup } from "../Hero/HeroMainPopup";
import ServiceInfoManager from "../ServiceInfoManager";
import UserInfo, { MSG } from "../User/UserInfo";
import { HeroBuffPromotion } from "../User/UserPromotion";
import HeroTooltipPopup, { HT_MakingInfo } from "../Utility/HeroTooltipPopup";
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";
import CenturionCliqueManager from "../manager/CenturionCliqueManager";
import PopupManager, { OpenPopupInfo } from "../manager/PopupManager";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import UnlockContentsManager, { UnlockContentsType } from "../manager/UnlockContentsManager";
import MessageRoutingManager from "../message/MessageRoutingManager";

const { ccclass, property } = cc._decorator;


/**
 * 游戏内英雄UI组件（InGameHeroUI）
 * 负责英雄图标显示、动画控制、点击交互、Tooltip提示、状态切换
 */
@ccclass()
export default class InGameHeroUI extends cc.Component {
    // ================= 可序列化属性（编辑器面板配置） =================
    @property(cc.Button)
    public btn: cc.Button | null = null; // 英雄按钮

    @property(cc.Animation)
    public iconAni: cc.Animation | null = null; // 图标动画

    @property(cc.Animation)
    public spinAni: cc.Animation | null = null; // 旋转动画

    @property(HeroInfoUI)
    public heroInfoUI: HeroInfoUI | null = null; // 英雄信息UI组件

    @property(cc.Animation)
    public powerUpAni: cc.Animation | null = null; // 升级动画

    @property(cc.Node)
    public rootActiveHero: cc.Node | null = null; // 已激活英雄根节点

    @property(cc.Node)
    public rootDisableUnlock: cc.Node | null = null; // 未解锁（可解锁）根节点

    @property(cc.Node)
    public rootDisableLock: cc.Node | null = null; // 锁定（等级不足）根节点

    @property(cc.Animation)
    public aniUnlock: cc.Animation | null = null; // 解锁动画

    // ================= 私有状态属性 =================
    private _isContentsLock: boolean = false; // 是否内容锁定
    private _isShowHeroBuffTooltip: boolean = false; // 是否显示英雄Buff提示
    private _flagShowUnlockTooltip: boolean = false; // 解锁提示显示标记

    // ================= 只读属性 =================
    public get isShowHeroBuffTooltip(): boolean {
        return this._isShowHeroBuffTooltip;
    }

    // ================= 生命周期函数 =================
    onLoad() {
        // 初始化旋转动画状态 + 绑定按钮点击事件
        if (this.spinAni) {
            this.spinAni.node.active = false;
        }
        if (this.btn) {
            this.btn.clickEvents.push(
                Utility.getComponent_EventHandler(this.node, "../SubGame/", "onClickBtn", "")
            );
        }
    }

    onDestroy() {
        // 销毁时移除所有事件监听
        this.removeListenerAll();
    }

    // ================= 事件监听管理 =================
    /**
     * 移除所有事件监听
     */
    public removeListenerAll(): void {
        UserInfo.instance().removeListenerTargetAll(this);
        MessageRoutingManager.instance().removeListenerTarget(
            MessageRoutingManager.MSG.RESEVEDACTIVEHEROTOOLTIP,
            this.openNewHeroTooltip,
            this
        );
    }

    /**
     * 初始化组件（绑定事件监听 + 初始化状态）
     */
    public init(): void {
        // 绑定用户英雄相关事件
        const userInfo = UserInfo.instance();
        userInfo.addListenerTarget(MSG.UPDATE_HERO_NEW, this.refreshHero, this);
        userInfo.addListenerTarget(MSG.UPDATE_HERO_RANKUP, this.onUpdateHeroRank, this);
        userInfo.addListenerTarget(MSG.UPDATE_HERO_POWER_LEVELUP, this.onUpdateHeroPowerLevel, this);
        userInfo.addListenerTarget(MSG.UPDATE_LEVEL_UP, this.onLevelUp, this);
        
        // 绑定消息路由事件
        MessageRoutingManager.instance().addListenerTarget(
            MessageRoutingManager.MSG.RESEVEDACTIVEHEROTOOLTIP,
            this.openNewHeroTooltip,
            this
        );

        // 初始化UI状态
        this.hideAllRootNodes();
        this.refreshHero();
        this.endPowerUpAni();
        this.setStateRootNodes();
    }

    // ================= 英雄信息刷新 =================
    /**
     * 刷新英雄显示（等级检查 + 信息更新）
     */
    public refreshHero(): void {
        // 检查英雄解锁等级
        const unlockLevel = UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.HERO);
        const userLevel = ServiceInfoManager.instance.getUserLevel();
        this.node.active = userLevel >= unlockLevel;

        // 获取用户英雄信息并更新UI
        const userHeroInfo = UserInfo.instance().getUserHeroInfo();
        if (TSUtility.isValid(userHeroInfo)) {
            const activeHeroID = userHeroInfo.activeHeroID;
            const heroInfo = userHeroInfo.getHeroInfo(activeHeroID);

            if (TSUtility.isValid(heroInfo) && TSUtility.isValid(this.heroInfoUI)) {
                this.heroInfoUI.setInfo(activeHeroID, heroInfo.rank);
                this.heroInfoUI.controller_SetIdle(heroInfo.rank);
                this.heroInfoUI.loadSpineController(HeroInfoUIType.Small);
                this.refreshHeroPower();
            }

            this.setStateRootNodes();
        }
    }

    /**
     * 刷新英雄战力显示
     */
    public refreshHeroPower(): void {
        const userHeroInfo = UserInfo.instance().getUserHeroInfo();
        const activeHeroID = userHeroInfo.activeHeroID;

        if (activeHeroID === "hero_winston") {
            this.heroInfoUI!.setPowerEffect(0);
        } else {
            userHeroInfo.getHeroInfo(activeHeroID);
            this.heroInfoUI!.setPowerEffect(userHeroInfo.powerLevel);
        }
    }

    /**
     * 设置英雄信息
     * @param heroId 英雄ID
     * @param rank 英雄等级
     */
    public setHero(heroId: string|number, rank: number): void {
        this.heroInfoUI!.setInfo(heroId+"", rank);
        this.heroInfoUI!.loadSpineController(HeroInfoUIType.Small);
        this.heroInfoUI!.controller_SetIdle(rank);
        this.heroInfoUI!.setPowerEffect(rank);
    }

    // ================= 事件回调 =================
    /**
     * 英雄战力等级更新回调
     * @param levelData 等级变化数据 {beforeLevel: number, afterLevel: number}
     */
    public onUpdateHeroPowerLevel(levelData: { beforeLevel: number; afterLevel: number }): void {
        if (levelData.beforeLevel < levelData.afterLevel) {
            // 播放升级动画
            this.powerUpAni!.node.active = true;
            this.powerUpAni!.play();
            
            // 取消旧的调度，重新调度刷新
            this.unschedule(this.refreshHeroPower);
            this.unschedule(this.endPowerUpAni);
            this.scheduleOnce(this.refreshHeroPower, 1);
            this.scheduleOnce(this.endPowerUpAni, 1.5);
        } else {
            this.refreshHeroPower();
        }
    }

    /**
     * 用户等级提升回调
     */
    public onLevelUp(): void {
        this.setStateRootNodes();
    }

    /**
     * 英雄等级提升回调
     * @param heroId 英雄ID
     */
    public onUpdateHeroRank(heroId: string): void {
        if (UserInfo.instance().getUserHeroInfo().activeHeroID === heroId) {
            this.refreshHero();
        }
    }

    // ================= 动画控制 =================
    /**
     * 结束升级动画
     */
    public endPowerUpAni(): void {
        this.powerUpAni!.node.active = false;
    }

    /**
     * 播放旋转动画
     */
    public playSpinAni(): void {
        this.spinAni!.node.active = true;
        this.spinAni!.play();
    }

    // ================= Tooltip弹窗 =================
    /**
     * 打开战力升级Tooltip
     */
    public openPowerUpTooltip(): void {
        const popupInfo = new OpenPopupInfo();
        popupInfo.type = "IngameHeroPowerUpTooltip";
        popupInfo.openCallback = async () => {
            await this.asyncTooltip_powerUp();
            PopupManager.Instance().checkNextOpenPopup();
        };
        PopupManager.Instance().addOpenPopup(popupInfo);
    }

    /**
     * 检查是否可以显示英雄Buff Tooltip
     * @returns 是否可显示
     */
    public isAvailableInGameHeroBuffTooltip(): boolean {
        const promotionInfo = UserInfo.instance().getPromotionInfo(HeroBuffPromotion.PromotionKeyName);
        const tooltipTime = ServerStorageManager.getAsNumber(StorageKeyType.IN_GAME_HERO_BUFF_TOOLTIP_TIME);
        
        return TSUtility.isValid(promotionInfo) 
            && promotionInfo.isAvailableHeroBuff() 
            && (tooltipTime === 0 || !(tooltipTime >= promotionInfo.eventStart && tooltipTime <= promotionInfo.eventEnd));
    }

    /**
     * 打开英雄Buff Tooltip
     */
    public async openHeroBuffTooltip(): Promise<void> {
        if (!this.isAvailableInGameHeroBuffTooltip()) {
            return;
        }

        const popupInfo = new OpenPopupInfo();
        popupInfo.type = "IngameHeroBuffTooltip";
        popupInfo.openCallback = async () => {
            this._isShowHeroBuffTooltip = true;
            ServerStorageManager.saveCurrentServerTime(StorageKeyType.IN_GAME_HERO_BUFF_TOOLTIP_TIME);
            await this.asyncTooltip_HeroBuff();
            PopupManager.Instance().checkNextOpenPopup();
            
            // 5秒后关闭标记
            this.scheduleOnce(() => {
                this._isShowHeroBuffTooltip = false;
            }, 5);
        };
        PopupManager.Instance().addOpenPopup(popupInfo);
    }

    /**
     * 打开新英雄Tooltip
     */
    public openNewHeroTooltip(): void {
        if (ServerStorageManager.getAsNumber(StorageKeyType.ACTIVE_HERO_STATE) === 1) {
            ServerStorageManager.save(StorageKeyType.ACTIVE_HERO_STATE, 2);
            this.asyncTooltip_newHeroTooltip();
        }
    }

    /**
     * 异步加载战力升级Tooltip
     */
    public async asyncTooltip_powerUp(): Promise<void> {
        const tooltipPopup = await HeroTooltipPopup.asyncGetPopup();
        if (!TSUtility.isValid(this) || !TSUtility.isValid(tooltipPopup) || !TSUtility.isValid(this.btn?.node)) {
            return;
        }

        // 配置Tooltip
        tooltipPopup.open(this.btn!.node);
        tooltipPopup.setPivotPosition(this.btn!.node, 40, 0);
        tooltipPopup.setInfoText(HeroTooltipPopup.getIngameHeroPowerUpText());

        const tooltipConfig = {
            settingInfo: {
                useBlockBG: false,
                reserveCloseTime: 3
            },
            frameInfo: {
                paddingWidth: 100,
                paddingHeight: 50,
                textOffsetX: 0,
                textOffsetY: 0,
                useArrow: true,
                arrowPosType: 1,
                arrowPosAnchor: 0.5,
                arrowPosOffset: 0,
                baseFontSize: 26,
                fontLineHeight: 35
            },
            heroInfo: {
                anchorX: 1,
                anchorY: 0.5,
                offsetX: 0,
                offsetY: 0,
                heroId: "hero_cleopatra",
                heroRank: 0,
                iconType: "Small",
                heroState: 2
            },
            startAniInfo: [{
                action: "move",
                duration: 0.4,
                easingType: "easeOut",
                startOffsetX: -20,
                startOffsetY: 0
            }, {
                action: "fadeIn",
                duration: 0.4
            }]
        };

        const makingInfo = HT_MakingInfo.parseObj(tooltipConfig);
        makingInfo.heroInfo.heroId = "";
        makingInfo.heroInfo.heroRank = 0;
        
        tooltipPopup.setHero_HT_MakingInfo(makingInfo);
        tooltipPopup.refreshUI();
    }

    /**
     * 异步加载英雄Buff Tooltip
     */
    public async asyncTooltip_HeroBuff(): Promise<void> {
        const tooltipPopup = await HeroTooltipPopup.asyncGetPopup();
        if (!TSUtility.isValid(this) || !TSUtility.isValid(tooltipPopup) || !TSUtility.isValid(this.btn?.node)) {
            return;
        }

        // 配置Tooltip
        tooltipPopup.open(this.btn!.node);
        tooltipPopup.setPivotPosition(this.btn!.node, 40, 0);
        tooltipPopup.setInfoText(HeroTooltipPopup.getIngameHeroBuffText());

        const tooltipConfig = {
            settingInfo: {
                useBlockBG: false,
                reserveCloseTime: 5
            },
            frameInfo: {
                paddingWidth: 100,
                paddingHeight: 50,
                textOffsetX: 0,
                textOffsetY: 0,
                useArrow: true,
                arrowPosType: 1,
                arrowPosAnchor: 0.5,
                arrowPosOffset: 0,
                baseFontSize: 26,
                fontLineHeight: 35
            },
            heroInfo: {
                anchorX: 1,
                anchorY: 0.5,
                offsetX: 0,
                offsetY: 0,
                heroId: "hero_cleopatra",
                heroRank: 0,
                iconType: "Small",
                heroState: 2
            },
            startAniInfo: [{
                action: "move",
                duration: 0.4,
                easingType: "easeOut",
                startOffsetX: -20,
                startOffsetY: 0
            }, {
                action: "fadeIn",
                duration: 0.4
            }]
        };

        const makingInfo = HT_MakingInfo.parseObj(tooltipConfig);
        makingInfo.heroInfo.heroId = "";
        makingInfo.heroInfo.heroRank = 0;
        
        tooltipPopup.setHero_HT_MakingInfo(makingInfo);
        tooltipPopup.refreshUI();
    }

    /**
     * 异步加载新英雄Tooltip
     */
    public async asyncTooltip_newHeroTooltip(): Promise<void> {
        const tooltipPopup = await HeroTooltipPopup.asyncGetPopup();
        if (!TSUtility.isValid(this) || !TSUtility.isValid(tooltipPopup) || !TSUtility.isValid(this.btn?.node)) {
            return;
        }

        // 配置Tooltip
        tooltipPopup.open(this.btn!.node);
        tooltipPopup.setPivotPosition(this.btn!.node, 40, 0);
        tooltipPopup.setInfoText(HeroTooltipPopup.getIngameNewHeroText());

        const tooltipConfig = {
            settingInfo: {
                useBlockBG: false,
                reserveCloseTime: 3
            },
            frameInfo: {
                paddingWidth: 100,
                paddingHeight: 50,
                textOffsetX: 0,
                textOffsetY: 3,
                useArrow: true,
                arrowPosType: 1,
                arrowPosAnchor: 0.5,
                arrowPosOffset: 0,
                baseFontSize: 26,
                fontLineHeight: 35
            },
            heroInfo: {
                anchorX: 1,
                anchorY: 0.5,
                offsetX: 0,
                offsetY: 0,
                heroId: "hero_cleopatra",
                heroRank: 0,
                iconType: "Small",
                heroState: 2
            },
            startAniInfo: [{
                action: "move",
                duration: 0.4,
                easingType: "easeOut",
                startOffsetX: -20,
                startOffsetY: 0
            }, {
                action: "fadeIn",
                duration: 0.4
            }]
        };

        const makingInfo = HT_MakingInfo.parseObj(tooltipConfig);
        makingInfo.heroInfo.heroId = "";
        makingInfo.heroInfo.heroRank = 0;
        
        tooltipPopup.setHero_HT_MakingInfo(makingInfo);
        tooltipPopup.refreshUI();
    }

    /**
     * 异步加载英雄解锁Tooltip
     */
    public async asyncTooltip_UnlockHero(): Promise<void> {
        if (this._flagShowUnlockTooltip) {
            return;
        }
        this._flagShowUnlockTooltip = true;

        const tooltipPopup = await HeroTooltipPopup.asyncGetPopup();
        if (!TSUtility.isValid(this) || !TSUtility.isValid(tooltipPopup) || !TSUtility.isValid(this.btn?.node)) {
            this._flagShowUnlockTooltip = false;
            return;
        }

        // 配置Tooltip
        tooltipPopup.open(this.rootDisableLock!);
        tooltipPopup.setPivotPosition(this.btn!.node, 40, 0);
        tooltipPopup.setInfoText("HEROES unlocks at <color=#FFFF00> LV.9</color>");

        const tooltipConfig = {
            settingInfo: {
                useBlockBG: false,
                reserveCloseTime: 3
            },
            frameInfo: {
                paddingWidth: 100,
                paddingHeight: 60,
                textOffsetX: -10,
                textOffsetY: 0,
                useArrow: true,
                arrowPosType: 1,
                arrowPosAnchor: 0.5,
                arrowPosOffset: 0,
                baseFontSize: 26,
                fontLineHeight: 35
            },
            heroInfo: {
                anchorX: 1,
                anchorY: 0.5,
                offsetX: 0,
                offsetY: 0,
                heroId: "manager_july",
                heroRank: 0,
                iconType: "Small",
                heroState: 2
            },
            startAniInfo: [{
                action: "move",
                duration: 0.4,
                easingType: "easeOut",
                startOffsetX: -20,
                startOffsetY: 0
            }, {
                action: "fadeIn",
                duration: 0.4
            }]
        };

        const makingInfo = HT_MakingInfo.parseObj(tooltipConfig);
        makingInfo.heroInfo.heroId = "manager_july";
        makingInfo.heroInfo.heroRank = 0;
        
        tooltipPopup.setHero_HT_MakingInfo(makingInfo);
        tooltipPopup.refreshUI();
        
        // 关闭时重置标记
        tooltipPopup.setCloseCallback(() => {
            this._flagShowUnlockTooltip = false;
        });
    }

    // ================= 按钮点击事件 =================
    /**
     * 英雄按钮点击回调
     */
    public onClickBtn(): void {
        // 播放按钮音效
        GameCommonSound.playFxOnce("btn_etc");

        // 检查解锁等级
        const userLevel = UserInfo.instance().getUserLevelInfo().level;
        const unlockLevel = UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.HERO);
        
        if (userLevel < unlockLevel) {
            // 等级不足：显示解锁提示
            this.asyncTooltip_UnlockHero();
            return;
        }

        // 等级足够：检查是否有激活英雄
        const hasActiveHero = UserInfo.instance().getUserHeroInfo().hasActiveHero();
        
        // 激活英雄是百夫长派系：打开百夫长弹窗
        if (hasActiveHero) {
            const activeHeroInfo = UserInfo.instance().getUserHeroInfo().getHeroInfo(
                UserInfo.instance().getUserHeroInfo().activeHeroID
            );
            if (activeHeroInfo.isCenturionCliqueHero()) {
                CenturionCliqueManager.Instance().showCenturionCliqueMainPopup();
                return;
            }
        }

        // 打开英雄主弹窗
        HeroMainPopup.getPopup((err, popup) => {
            if (!err) {
                const popupType = hasActiveHero 
                    ? TypeHeroSubPopup.activeHeroPopup 
                    : TypeHeroSubPopup.none;
                popup.open(popupType);
            }
        });
    }

    // ================= 状态切换 =================
    /**
     * 设置根节点显示状态（激活/未解锁/锁定）
     */
    public setStateRootNodes(): void {
        const userLevel = UserInfo.instance().getUserLevelInfo().level;
        const hasActiveHero = UserInfo.instance().getUserHeroInfo().hasActiveHero();
        const unlockLevel = UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.HERO);

        if (hasActiveHero && userLevel >= unlockLevel) {
            // 已激活英雄
            this.rootActiveHero!.active = true;
            this.rootDisableLock!.active = false;
            this.rootDisableUnlock!.active = false;
            this._isContentsLock = false;
        } else {
            this.rootActiveHero!.active = false;
            
            if (userLevel >= unlockLevel) {
                // 未激活但可解锁
                if (!this.rootDisableUnlock!.active && this._isContentsLock) {
                    // 播放解锁动画
                    this.aniUnlock!.stop();
                    this.aniUnlock!.play("Hero_Icon_ingame_Over_Ani");
                    this.aniUnlock!.once("finished", () => {});
                } else {
                    // 播放闲置动画
                    this.aniUnlock!.stop();
                    this.aniUnlock!.play("Hero_Icon_ingame_Idle_Ani");
                }
                this.rootDisableLock!.active = false;
                this.rootDisableUnlock!.active = true;
                this._isContentsLock = false;
            } else {
                // 等级不足锁定
                this.rootDisableLock!.active = true;
                this.rootDisableUnlock!.active = false;
                this._isContentsLock = true;
            }
        }
    }

    /**
     * 隐藏所有根节点
     */
    public hideAllRootNodes(): void {
        this.rootActiveHero!.active = false;
        this.rootDisableLock!.active = false;
        this.rootDisableUnlock!.active = false;
    }
}