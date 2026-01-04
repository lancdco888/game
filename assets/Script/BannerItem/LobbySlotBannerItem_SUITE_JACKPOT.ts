// ✅ 你指定的 标准头部解构写法 (Cocos 2.x 官方推荐)
const { ccclass, property } = cc._decorator;

// 所有依赖导入 - 完全还原原JS的路径，无修改
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import PopupManager from "../manager/PopupManager";
import ServiceInfoManager from "../ServiceInfoManager";
import ThrillJackpotMoneyDisplay from "../ThrillJackpotMoneyDisplay";
import ThrillWheelJackpot from "../ThrillWheelJackpot";
import LobbyThrillWheelSingleItem from "../Lobby/LobbyThrillWheelSingleItem";
import LobbySlotBannerItem from "../LobbySlotBannerItem";
import { Utility } from "../global_utility/Utility";

// 横幅状态枚举 (原代码的核心枚举，语义化重构)
export enum BannerStateType {
    IDLE = 0,      // 闲置-鼠标未悬浮
    HOVER = 1,     // 悬浮-鼠标移入
    NOTINIT = 2    // 未初始化
}

@ccclass
export default class LobbySlotBannerItem_SUITE_JACKPOT extends LobbySlotBannerItem {
    // ===================== 序列化绑定属性 (和原代码完全一致) =====================
    @property(cc.Button)
    public btnBanner: cc.Button = null;

    @property(cc.Node)
    public nodeMouseOverNeon: cc.Node = null;

    @property(cc.Node)
    public nodeDiamondWadge: cc.Node = null;

    @property(cc.Node)
    public nodeRootJackpotGold: cc.Node = null;

    @property(cc.Node)
    public nodeRootJackpotPurple: cc.Node = null;

    @property(cc.Label)
    public lblJackpotMoneyGold: cc.Label = null;

    @property(cc.Label)
    public lblJackpotMoneyPurple: cc.Label = null;

    @property(cc.Animation)
    public animBG: cc.Animation = null;

    @property(cc.Animation)
    public animWheel: cc.Animation = null;

    @property([cc.Animation])
    public arrWheelFrameAnim: cc.Animation[] = [];

    @property([LobbyThrillWheelSingleItem])
    public arrWheelItem: LobbyThrillWheelSingleItem[] = [];

    // ===================== 私有属性 =====================
    private _eStateType: BannerStateType = BannerStateType.NOTINIT;

    // ===================== 生命周期 & 核心方法 =====================
    onLoad() {
        super.onLoad();
        // 鼠标移入-悬浮状态
        this.btnBanner.node.on(cc.Node.EventType.MOUSE_ENTER, () => {
            this.setBannerState(BannerStateType.HOVER);
        }, this);
        // 鼠标移出-闲置状态
        this.btnBanner.node.on(cc.Node.EventType.MOUSE_LEAVE, () => {
            this.setBannerState(BannerStateType.IDLE);
        }, this);
        // 绑定按钮点击事件
        this.btnBanner.clickEvents.push(
            Utility.getComponent_EventHandler(this.node, "LobbySlotBannerItem_SUITE_JACKPOT", "onClick_Slot", "")
        );
    }

    /** 外部调用刷新入口 */
    public refresh(): void {
        this.setBannerState(BannerStateType.IDLE);
        this.initDiamondJackpotState();
    }

    /** 核心-切换横幅状态+动画+特效 */
    public setBannerState(state: BannerStateType): void {
        if (this._eStateType === state) return;
        this._eStateType = state;

        let bgAniName: string = "";
        let wheelAniName: string = "";
        let frameAniName: string = "";

        if (state === BannerStateType.IDLE) {
            bgAniName = "Bg_Idle_Fx_Ani";
            wheelAniName = "Wheel_Idle_Ani";
            frameAniName = "Wheel_FrameNeon_Idle_Ani";
            this.arrWheelItem.forEach(item => item.setModeIdle());
        } else {
            bgAniName = "Bg_Over_Fx_Ani";
            wheelAniName = "Wheel_Over_Ani";
            frameAniName = "Wheel_FrameNeon_Spin_Ani";
            this.arrWheelItem.forEach((item, index) => item.setModeOver(0.1 * index));
        }

        // 动画切换逻辑
        this.animBG.stop();this.animBG.play(bgAniName);
        this.animWheel.stop();this.animWheel.play(wheelAniName);
        this.arrWheelFrameAnim.forEach(anim => { anim.stop(); anim.play(frameAniName); });
        this.nodeMouseOverNeon.active = state === BannerStateType.HOVER;
    }

    /** 初始化紫金大奖/钻石大奖 显示状态 */
    public initDiamondJackpotState(): void {
        const jackpotDisplay = this.getComponent(ThrillJackpotMoneyDisplay);
        let isDiamondJackpotOpen = false;

        if (ServiceInfoManager.instance && ServiceInfoManager.instance.isEnableDiamondJackpot(SDefine.SUITE_ZONEID)) {
            isDiamondJackpotOpen = true;
        }

        if (TSUtility.isValid(jackpotDisplay)) {
            let targetLabel = null;
            let hideLabel = null;
            isDiamondJackpotOpen ? (targetLabel = this.lblJackpotMoneyPurple, hideLabel = this.lblJackpotMoneyGold) : targetLabel = this.lblJackpotMoneyGold;
            
            for (let i = 0; i < 5; ++i) jackpotDisplay.jackpot_Label[i] = null;
            jackpotDisplay.jackpot_Label[3] = targetLabel;
            jackpotDisplay.jackpot_Label[4] = hideLabel;
        }

        TSUtility.isValid(this.nodeRootJackpotGold) && (this.nodeRootJackpotGold.active = true);
        TSUtility.isValid(this.nodeRootJackpotPurple) && (this.nodeRootJackpotPurple.active = isDiamondJackpotOpen);
        TSUtility.isValid(this.nodeDiamondWadge) && (this.nodeDiamondWadge.active = isDiamondJackpotOpen);
    }

    /** 横幅按钮点击-打开大奖转盘弹窗 */
    public onClick_Slot(): void {
        PopupManager.Instance().showDisplayProgress(true);
        ThrillWheelJackpot.getPopup((e, t) => {
            PopupManager.Instance().showDisplayProgress(false);
            !TSUtility.isValid(e) && t.open();
        });
    }
}