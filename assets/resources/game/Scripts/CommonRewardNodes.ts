import HRVSlotService from "../../../Script/HRVService/HRVSlotService";
import LobbyScene from "../../../Script/LobbyScene";
import { LobbyUIType } from "../../../Script/LobbyUIBase";
import ServiceInfoManager from "../../../Script/ServiceInfoManager";
import UserInfo from "../../../Script/User/UserInfo";
import SDefine from "../../../Script/global_utility/SDefine";
import TSUtility from "../../../Script/global_utility/TSUtility";
import PowerGemManager from "../../../Script/manager/PowerGemManager";
import SlotGameRuleManager from "../../../Script/manager/SlotGameRuleManager";
import AnimationButton from "./AnimationButton";

const { ccclass, property } = cc._decorator;


// 实际项目中请替换为真实导入路径
// import SDefine from '../../../global_utility/SDefine';
// import ServiceInfoManager from '../../ServiceInfo/ServiceInfoManager';
// import InGameHeroUI from '../../SlotGame/InGameUI/InGameHeroUI';
// import UserInfo from '../../User/UserInfo';
// import TSUtility from '../../../global_utility/TSUtility';
// import CommonRewardInGameHeroIcon from '../CommonRewardPopup/CommonRewardInGameHeroIcon';
// import HRVSlotService from '../../HRVService/HRVSlotService';
// import PowerGemManager from '../PowerGem/PowerGemManager';
// import SlotGameRuleManager from '../../../slot_common/Script/SlotCommon/SlotGameRuleManager';
// import LobbyScene from '../../Lobby/LobbyScene';
// import LobbyUIBase from '../../Lobby/LobbyUI/LobbyUIBase';
// import LobbyUI_StarAlbum from '../../Lobby/LobbyUI/LobbyUI_StarAlbum';
// import LobbyUI_Hero from '../../Lobby/LobbyUI/LobbyUI_Hero';
// import LobbyUI_Bankroll from '../../Lobby/LobbyUI/LobbyUI_Bankroll';
// import LobbyUI_Coupon from '../../Lobby/LobbyUI/LobbyUI_Coupon';
// import LobbyUI_Profile from '../../Lobby/LobbyUI/LobbyUI_Profile';
// import LobbyUI_LevelBooster from '../../Lobby/LobbyUI/LobbyUI_LevelBooster';
// import InGameUI_Bankroll from '../../SlotGame/InGameUI/InGameUI_Bankroll';
// import InGameBankRollPromotionUI from '../../SlotGame/InGameUI/InGameBankRollPromotionUI';
// import TutorialCoinPromotion from '../../Tutorial/TutorialCoinPromotion';
// import LevelInfoUI_2020 from '../../SlotGame/InGameUI/LevelInfoUI_2020';
// import AnimationButton from '../../../global_utility/UI/AnimationButton';

// ===================== 奖励节点管理组件 =====================
/**
 * 奖励系统-节点管理组件
 * 功能：管理奖励相关UI节点（星册/银行roll/英雄/等级Booster/PowerGem），适配大厅/游戏内场景
 */
export default class CommonRewardNodes extends cc.Component {
    /** 游戏内英雄图标节点 */
    @property({
        type: InGameHeroUI,
        displayName: '游戏内英雄图标',
        tooltip: '游戏内显示英雄信息的图标节点'
    })
    public nodeInGameHeroIcon: InGameHeroUI | null = null;

    /** PowerGem插槽底部图标节点 */
    @property({
        type: Node,
        displayName: 'PowerGem插槽图标',
        tooltip: 'PowerGem等级显示的插槽底部图标'
    })
    public nodePowerGemSlotBottomIcon: cc.Node | null = null;

    // ===================== 私有属性（UI实例缓存） =====================
    /** 游戏内英雄收集战力组件 */
    private _inGameHeroCollectForce: CommonRewardInGameHeroIcon | null = null;
    /** 大厅星册UI实例 */
    private _lobbyStarAlbum: LobbyUI_StarAlbum | null = null;
    /** 大厅英雄UI实例 */
    private _lobbyHero: LobbyUI_Hero | null = null;
    /** 大厅银行roll UI实例 */
    private _lobbyBankroll: LobbyUI_Bankroll | null = null;
    /** 大厅优惠券UI实例 */
    private _lobbyCoupon: LobbyUI_Coupon | null = null;
    /** 大厅个人资料UI实例 */
    private _lobbyProfile: LobbyUI_Profile | null = null;
    /** 大厅等级Booster UI实例 */
    private _lobbyLevelBooster: LobbyUI_LevelBooster | null = null;
    /** 游戏内银行roll UI实例 */
    private _inGameBankroll: InGameUI_Bankroll | null = null;
    /** 游戏内星册UI实例 */
    private _inGameStarAlbum: { node: cc.Node; setCardPackCntLabel: (count: number) => void; playActiveStarAlbumAni: () => void } | null = null;
    /** 游戏内个人资料节点 */
    private _inGameProfile: Node | null = null;
    /** 游戏内等级Booster UI实例 */
    private _inGameLevelBooster: LevelInfoUI_2020 | null = null;

    // ===================== 核心控制方法 =====================
    /**
     * 隐藏所有奖励相关UI节点
     */
    public Hide(): void {
        // 大厅星册UI
        if (TSUtility.isValid(this._lobbyStarAlbum)) {
            this._lobbyStarAlbum.node.active = false;
        }
        // 大厅英雄UI
        if (TSUtility.isValid(this._lobbyHero)) {
            this._lobbyHero.node.active = false;
        }
        // 大厅优惠券UI
        if (TSUtility.isValid(this._lobbyCoupon)) {
            this._lobbyCoupon.node.active = false;
        }
        // 游戏内星册UI
        if (TSUtility.isValid(this._inGameStarAlbum)) {
            this._inGameStarAlbum.node.active = false;
        }
        // 大厅银行roll UI
        if (TSUtility.isValid(this._lobbyBankroll)) {
            this._lobbyBankroll.node.active = false;
        }
        // 游戏内银行roll UI
        if (TSUtility.isValid(this._inGameBankroll)) {
            this._inGameBankroll.node.active = false;
        }
        // 游戏内英雄图标
        if (TSUtility.isValid(this.nodeInGameHeroIcon)) {
            this.nodeInGameHeroIcon.node.active = false;
        }
        // 大厅个人资料UI
        if (TSUtility.isValid(this._lobbyProfile)) {
            this._lobbyProfile.node.active = false;
        }
        // 大厅等级Booster UI
        if (TSUtility.isValid(this._lobbyLevelBooster)) {
            this._lobbyLevelBooster.node.active = false;
        }
        // 游戏内等级Booster UI
        if (TSUtility.isValid(this._inGameLevelBooster)) {
            this._inGameLevelBooster.node.active = false;
        }
        // 游戏内个人资料UI
        if (TSUtility.isValid(this._inGameProfile)) {
            this._inGameProfile.active = false;
        }
        // PowerGem插槽图标
        if (TSUtility.isValid(this.nodePowerGemSlotBottomIcon)) {
            this.nodePowerGemSlotBottomIcon.active = false;
        }
    }

    /**
     * 判断当前是否为大厅场景
     * @returns true=大厅场景，false=游戏内场景
     */
    public isLobbyScene(): boolean {
        return UserInfo.instance().getCurrentSceneMode() === SDefine.Lobby;
    }

    /**
     * 克隆节点并移动到新父节点（保留原世界坐标）
     * @param sourceNode 源节点
     * @param newParent 新父节点
     * @returns 克隆后的节点
     */
    public createCloneNode(sourceNode: cc.Node, newParent: cc.Node): cc.Node {
        if (!TSUtility.isValid(sourceNode) || !TSUtility.isValid(newParent)) {
            return new cc.Node();
        }

        // 实例化克隆节点
        const cloneNode = cc.instantiate(sourceNode) as any;
        // 移动到新父节点
        TSUtility.moveToNewParent(cloneNode, newParent);
        // 保持原世界坐标（转换为新父节点的本地坐标）
        const worldPos = sourceNode.convertToWorldSpaceAR(cc.v2());
        const localPos = newParent.convertToNodeSpaceAR(worldPos);
        cloneNode.setPosition(localPos);

        return cloneNode;
    }

    /**
     * 移除节点及其子节点的指定脚本组件（防止交互/动画干扰）
     * @param targetNode 目标节点
     */
    public removeScript(targetNode: cc.Node): void {
        if (!TSUtility.isValid(targetNode)) {
            return;
        }

        // 移除动画按钮组件
        const animationButtons = targetNode.getComponentsInChildren(AnimationButton);
        animationButtons.forEach(btn => {
            btn.isStopAnimation = true;
            btn.btnAni.setCurrentTime(0);
            btn.btnAni.stop();
            btn.node.removeComponent(AnimationButton);
        });

        // 移除按钮组件（清空点击事件）
        const buttons = targetNode.getComponentsInChildren(cc.Button);
        buttons.forEach(btn => {
            btn.clickEvents = [];
            btn.node.removeComponent(cc.Button);
        });

        // 移除动画组件
        const animations = targetNode.getComponentsInChildren(cc.Animation);
        animations.forEach(ani => {
            ani.setCurrentTime(0);
            ani.stop();
            ani.node.removeComponent(Animation);
        });

        // 移除教程金币推广组件
        const tutorialComps = targetNode.getComponentsInChildren(TutorialCoinPromotion);
        tutorialComps.forEach(comp => {
            comp.node.active = false;
            comp.node.removeComponent(TutorialCoinPromotion);
        });
    }

    // ===================== 星册UI控制 =====================
    /**
     * 激活/隐藏星册UI
     * @param isActive 是否激活
     * @param addCount 新增卡包数量（默认0）
     * @param isExclude 是否排除某些卡包（默认false）
     * @returns 星册UI节点
     */
    public activeStarAlbumUI(isActive: boolean, addCount: number = 0, isExclude: boolean = false): cc.Node {
        // 计算总卡包数量
        const totalCount = this.getInventoryCardPackCount(isExclude) + addCount;

        // 大厅场景
        if (this.isLobbyScene()) {
            if (!TSUtility.isValid(this._lobbyStarAlbum)) {
                // 获取大厅星册UI并克隆
                const lobbyStarAlbumUI = LobbyScene.instance.UI.getLobbyUI(LobbyUIType.STAR_ALBUM);
                const cloneNode = this.createCloneNode(lobbyStarAlbumUI.node, this.node);
                this._lobbyStarAlbum = cloneNode.getComponent(LobbyUI_StarAlbum);
                // 移除克隆节点的脚本组件
                this.removeScript(this._lobbyStarAlbum.node);
            }

            this._lobbyStarAlbum.node.active = isActive;
            this._lobbyStarAlbum.setRewardCount(totalCount);
            return this._lobbyStarAlbum.node;
        }

        // 游戏内场景
        if (!TSUtility.isValid(this._inGameStarAlbum)) {
            // 创建游戏内星册节点
            this._inGameStarAlbum = HRVSlotService.instance().getInGameUI().createNewStarAlbumNode(this.node, totalCount);
        }

        this._inGameStarAlbum.node.active = isActive;
        this._inGameStarAlbum.setCardPackCntLabel(totalCount);
        return this._inGameStarAlbum.node;
    }

    /**
     * 获取库存卡包数量
     * @param isExclude 是否排除某些卡包（默认false）
     * @returns 卡包数量
     */
    public getInventoryCardPackCount(isExclude: boolean = false): number {
        return UserInfo.instance().getItemInventory().getAllCardPackCnt(!isExclude);
    }

    /**
     * 增加星册卡包数量并更新显示
     * @param addCount 新增数量
     * @param isExclude 是否排除某些卡包（默认false）
     */
    public addStarAlbumCount(addCount: number, isExclude: boolean = false): void {
        const totalCount = this.getInventoryCardPackCount(isExclude) + addCount;

        // 大厅场景
        if (this.isLobbyScene()) {
            if (TSUtility.isValid(this._lobbyStarAlbum)) {
                this._lobbyStarAlbum.setRewardCount(totalCount);
            }
            return;
        }

        // 游戏内场景
        if (TSUtility.isValid(this._inGameStarAlbum)) {
            this._inGameStarAlbum.playActiveStarAlbumAni();
            this._inGameStarAlbum.setCardPackCntLabel(totalCount);
        }
    }

    // ===================== 银行roll UI控制 =====================
    /**
     * 激活/隐藏银行roll UI
     * @param isActive 是否激活
     * @returns 银行roll UI节点
     */
    public activeBankrollUI(isActive: boolean): Node | null {
        // 大厅场景
        if (this.isLobbyScene()) {
            if (!TSUtility.isValid(this._lobbyBankroll)) {
                // 获取大厅银行roll UI并克隆
                const lobbyBankrollUI = LobbyScene.instance.UI.getLobbyUI(LobbyUIType.BANKROLL);
                lobbyBankrollUI.hideAllButton();
                const cloneNode = this.createCloneNode(lobbyBankrollUI.node, this.node);
                this._lobbyBankroll = cloneNode.getComponent(LobbyUI_Bankroll);
                // 移除克隆节点的脚本组件
                this.removeScript(this._lobbyBankroll.node);
                // 获取优惠券子组件
                this._lobbyCoupon = this._lobbyBankroll.node.getComponentInChildren(LobbyUI_Coupon);
            }

            this._lobbyBankroll.node.active = isActive;
            return this._lobbyBankroll.node;
        }

        // 游戏内场景
        if (!TSUtility.isValid(this._inGameBankroll)) {
            // 克隆游戏内银行roll节点
            const cloneNode = this.createCloneNode(ServiceInfoManager.NODE_IN_GAME_BANKROLL, this.node);
            this._inGameBankroll = cloneNode.getComponent(InGameUI_Bankroll);
            // 移除克隆节点的脚本组件
            this.removeScript(this._inGameBankroll.node);
        }

        this._inGameBankroll.node.active = isActive;
        return this._inGameBankroll.node;
    }

    /**
     * 激活/隐藏银行roll优惠券图标
     * @param isActive 是否激活
     * @returns 优惠券图标节点
     */
    public activeBankrollCouponUI(isActive: boolean): Node | null {
        // 大厅场景
        if (this.isLobbyScene()) {
            if (TSUtility.isValid(this._lobbyCoupon)) {
                this._lobbyCoupon.hideCouponUI();
                this._lobbyCoupon.nodeCouponIcon.active = isActive;
                return this._lobbyCoupon.nodeCouponIcon;
            }
            return null;
        }

        // 游戏内场景
        if (TSUtility.isValid(this._inGameBankroll)) {
            const promotionUI = this._inGameBankroll.node.getComponent(InGameBankRollPromotionUI);
            promotionUI.updateCouponIcon(true);
            promotionUI.couponIcon.active = isActive;
            return promotionUI.couponIcon;
        }

        return null;
    }

    // ===================== 个人资料/等级Booster UI控制 =====================
    /**
     * 激活/隐藏个人资料UI
     * @param isActive 是否激活
     * @returns 个人资料UI节点
     */
    public activeProfileUI(isActive: boolean): Node | null {
        // 大厅场景
        if (this.isLobbyScene()) {
            if (!TSUtility.isValid(this._lobbyProfile)) {
                // 获取大厅个人资料UI并克隆
                const lobbyProfileUI = LobbyScene.instance.UI.getLobbyUI(LobbyUIType.PROFILE);
                const cloneNode = this.createCloneNode(lobbyProfileUI.node, this.node);
                this._lobbyProfile = cloneNode.getComponent(LobbyUI_Profile);
                // 移除克隆节点的脚本组件
                this.removeScript(this._lobbyProfile.node);
                // 获取等级Booster子组件
                this._lobbyLevelBooster = this._lobbyProfile.node.getComponentInChildren(LobbyUI_LevelBooster);
                this._lobbyLevelBooster.setLevelBoosterUI(false, 0);
            }

            this._lobbyProfile.node.active = isActive;
            return this._lobbyProfile.node;
        }

        // 游戏内场景
        if (!TSUtility.isValid(this._inGameProfile)) {
            // 克隆游戏内个人资料节点
            const cloneNode = this.createCloneNode(ServiceInfoManager.NODE_IN_GAME_PROFILE, this.node);
            this._inGameProfile = cloneNode;
            // 移除克隆节点的脚本组件
            this.removeScript(this._inGameProfile);
            // 获取等级Booster子组件
            const boosterNode = this._inGameProfile.getChildByName("BoosterLevel");
            this._inGameLevelBooster = boosterNode.getComponent(LevelInfoUI_2020);
            this._inGameLevelBooster.setLevelGague(ServiceInfoManager.NUMBER_CURRENT_GAUGE_EXP);
        }

        this._inGameProfile.active = isActive;
        return this._inGameProfile;
    }

    /**
     * 激活/隐藏等级Booster UI
     * @param isActive 是否激活
     * @param value Booster数值
     * @returns 等级Booster UI节点
     */
    public activeLevelBoosterUI(isActive: boolean, value: number): Node | null {
        // 大厅场景
        if (this.isLobbyScene()) {
            if (TSUtility.isValid(this._lobbyLevelBooster)) {
                this._lobbyLevelBooster.setLevelBoosterUI(isActive, value);
                return this._lobbyLevelBooster.node;
            }
            return null;
        }

        // 游戏内场景
        if (TSUtility.isValid(this._inGameLevelBooster)) {
            this._inGameLevelBooster.setOnOff(isActive);
            this._inGameLevelBooster.setBoosterInfo(value);
            return this._inGameLevelBooster.node;
        }

        return null;
    }

    // ===================== 英雄UI控制 =====================
    /**
     * 激活/隐藏英雄UI
     * @param isActive 是否激活
     * @returns 英雄UI节点
     */
    public activeHeroUI(isActive: boolean): Node | null {
        // 先隐藏游戏内英雄图标
        if (TSUtility.isValid(this.nodeInGameHeroIcon)) {
            this.nodeInGameHeroIcon.node.active = false;
        }

        // 大厅场景
        if (this.isLobbyScene()) {
            if (!TSUtility.isValid(this._lobbyHero)) {
                // 获取大厅英雄UI并克隆
                const lobbyHeroUI = LobbyScene.instance.UI.getLobbyUI(LobbyUIType.HERO);
                const cloneNode = this.createCloneNode(lobbyHeroUI.node, this.node);
                this._lobbyHero = cloneNode.getComponent(LobbyUI_Hero);
                // 移除克隆节点的脚本组件
                this.removeScript(this._lobbyHero.node);
            }

            this._lobbyHero.node.active = isActive;
            return this._lobbyHero.node;
        }

        // 游戏内场景
        if (!TSUtility.isValid(this._inGameHeroCollectForce)) {
            // 禁用英雄图标所有按钮交互
            const buttons = this.nodeInGameHeroIcon?.node.getComponentsInChildren(cc.Button) || [];
            buttons.forEach(btn => {
                btn.interactable = false;
            });

            // 初始化英雄图标
            if (this.nodeInGameHeroIcon) {
                this.nodeInGameHeroIcon.init();

                // 调整英雄图标位置
                const inGameUI = HRVSlotService.instance().getInGameUI();
                const localPos = TSUtility.getLocalPosition(inGameUI.heroUI.node, this.nodeInGameHeroIcon.node.parent);
                this.nodeInGameHeroIcon.node.setPosition(this.nodeInGameHeroIcon.node.position.x, localPos.y);

                // 设置英雄信息
                const userHeroInfo = UserInfo.instance().getUserHeroInfo();
                if (TSUtility.isValid(userHeroInfo) && userHeroInfo.activeHeroID.length > 0) {
                    const heroInfo = userHeroInfo.getHeroInfo(userHeroInfo.activeHeroID);
                    if (TSUtility.isValid(heroInfo)) {
                        this.nodeInGameHeroIcon.setHero(userHeroInfo.activeHeroID, heroInfo.rank);
                    }
                    // 设置战力特效
                    if (TSUtility.isValid(this.nodeInGameHeroIcon.heroInfoUI)) {
                        this.nodeInGameHeroIcon.heroInfoUI.setPowerEffect(userHeroInfo.powerLevel);
                    }
                }

                // 显示英雄图标
                this.nodeInGameHeroIcon.node.opacity = 255;
                // 获取收集战力组件
                this._inGameHeroCollectForce = this.nodeInGameHeroIcon.getComponent(CommonRewardInGameHeroIcon);
                // 移除所有事件监听
                this.nodeInGameHeroIcon.removeListenerAll();
            }
        }

        // 激活/隐藏英雄图标
        if (this.nodeInGameHeroIcon) {
            this.nodeInGameHeroIcon.node.active = isActive;
            return this.nodeInGameHeroIcon.node;
        }

        return null;
    }

    /**
     * 设置游戏内英雄图标显示的英雄信息
     * @param heroId 英雄ID
     * @param rank 英雄等级
     */
    public setInGameHeroIcon(heroId: string | number, rank: number): void {
        if (TSUtility.isValid(this.nodeInGameHeroIcon)) {
            this.nodeInGameHeroIcon.setHero(heroId, rank);
        }
    }

    /**
     * 播放游戏内英雄图标收集战力动画
     * @param param 动画参数
     */
    public async playInGameHeroIconCollectForce(param: any): Promise<void> {
        if (TSUtility.isValid(this._inGameHeroCollectForce)) {
            await this._inGameHeroCollectForce.playCollectForceAction(param);
        }
    }

    // ===================== PowerGem UI控制 =====================
    /**
     * 激活/隐藏PowerGem插槽底部图标
     * @param isActive 是否激活
     * @returns PowerGem图标节点
     */
    public activePowerGemSlotBottomIcon(isActive: boolean): cc.Node | null {
        // 先隐藏图标
        if (TSUtility.isValid(this.nodePowerGemSlotBottomIcon)) {
            this.nodePowerGemSlotBottomIcon.active = false;
        }

        // 大厅场景不显示PowerGem图标
        if (this.isLobbyScene()) {
            return null;
        }

        // 游戏内场景激活图标
        if (isActive && TSUtility.isValid(this.nodePowerGemSlotBottomIcon)) {
            // 获取等级显示节点
            const levelNode = this.nodePowerGemSlotBottomIcon.getChildByName("Level");
            const levelChildren = levelNode.children;
            const levelLabel = levelNode.getChildByName("Font_Level").getComponent(cc.Label);

            // 获取VIP等级、当前投注金额、PowerGem等级
            const vipLevel = 0;//UserInfo.instance().getUserVipInfo().level;
            const betMoney = SlotGameRuleManager.Instance.getCurrentBetMoney();
            const powerGemLevel = PowerGemManager.instance.getPowerGemLevel(betMoney);
            const powerGemGrade = PowerGemManager.instance.getPowerGemGrade(powerGemLevel, vipLevel);

            // 更新等级显示
            levelChildren.forEach((child, index) => {
                child.active = index === powerGemGrade;
            });
            levelLabel.string = powerGemLevel.toString();
            levelLabel.node.active = true;

            // 调整图标位置
            const sourceIcon = HRVSlotService.instance().getInGameUI().getPowerGemSlotBottomIcon();
            const localPos = TSUtility.getLocalPosition(sourceIcon.node, this.nodePowerGemSlotBottomIcon.parent);
            this.nodePowerGemSlotBottomIcon.setPosition(localPos);

            // 激活图标
            this.nodePowerGemSlotBottomIcon.active = true;
        }

        return this.nodePowerGemSlotBottomIcon;
    }
}