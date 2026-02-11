
// 导入暮光龙专属组件/弹窗
import GameComponents_Base from "../../game/GameComponents_Base";
import JackpotMoneyDisplay from "../183_HoundOfHades/JackpotMoneyDisplay";
import FreeSpinResultPopup_TwilightDragon from "./FreeSpinResultPopup_TwilightDragon";
import FreeSpinStartPopup_TwilightDragon from "./FreeSpinStartPopup_TwilightDragon";
import FreeSpinSymbolAniLayer_TwilightDragon from "./FreeSpinSymbolAniLayer_TwilightDragon";
import FreeSpinUI_TwilightDragon from "./FreeSpinUI_TwilightDragon";
import JackpotResultPopup_TwilightDragon from "./JackpotResultPopup_TwilightDragon";
import MovingObjectLayer_TwilightDragon from "./MovingObjectLayer_TwilightDragon";
import PaylineController_TwilightDragon from "./PaylineController_TwilightDragon";
import TopUI_TwilightDragon from "./TopUI_TwilightDragon";

const { ccclass, property } = cc._decorator;

/**
 * 暮光龙（Twilight Dragon）游戏组件管理类
 * 继承自通用基础组件 GameComponents_Base，统一管理所有游戏界面组件、动画、弹窗
 */
@ccclass()
export default class GameComponents_TwilightDragon extends GameComponents_Base {
    // ======================================
    // Cocos 编辑器可绑定属性（对应原 JS 中的 g 装饰器）
    // ======================================
    /** 顶部 UI 组件 */
    @property(TopUI_TwilightDragon)
    public topUI: TopUI_TwilightDragon = null;

    /** 卷轴左侧灯光背景动画（数组） */
    @property({ type: [cc.Animation] })
    public reelLightBG_L: cc.Animation[] = [];

    /** 卷轴右侧灯光背景动画（数组） */
    @property({ type: [cc.Animation] })
    public reelLightBG_R: cc.Animation[] = [];

    /** 卷轴灯光背景节点（数组） */
    @property({ type: [cc.Node] })
    public reelLightBG:cc.Node[] = [];

    /** 基础模式根节点 */
    @property(cc.Node)
    public baseRootNode: cc.Node = null;

    /** 免费旋转模式根节点 */
    @property(cc.Node)
    public freeSpinRootNode: cc.Node = null;

    /** 免费旋转开始弹窗 */
    @property(FreeSpinStartPopup_TwilightDragon)
    public freeSpinStartPopup: FreeSpinStartPopup_TwilightDragon = null;

    /** 免费旋转结果弹窗 */
    @property(FreeSpinResultPopup_TwilightDragon)
    public freeSpinResultPopup: FreeSpinResultPopup_TwilightDragon = null;

    /** 移动对象层（特效/道具等） */
    @property(MovingObjectLayer_TwilightDragon)
    public movingObjectLayer: MovingObjectLayer_TwilightDragon = null;

    /** 免费旋转符号动画层 */
    @property(FreeSpinSymbolAniLayer_TwilightDragon)
    public freeSpinSymbolAniLayer: FreeSpinSymbolAniLayer_TwilightDragon = null;

    /** Jackpot 奖金显示组件 */
    @property(JackpotMoneyDisplay)
    public jackpotMoneyDisplay: JackpotMoneyDisplay = null;

    /** 免费旋转 UI 组件 */
    @property(FreeSpinUI_TwilightDragon)
    public freeSpinUI: FreeSpinUI_TwilightDragon = null;

    /** 场景切换动画节点 */
    @property(cc.Node)
    public sceneChangeNode: cc.Node = null;

    /** 基础模式背景动画 */
    @property(cc.Animation)
    public baseBG: cc.Animation = null;

    /** Jackpot 结果弹窗 */
    @property(JackpotResultPopup_TwilightDragon)
    public jackpotResultPopup: JackpotResultPopup_TwilightDragon = null;

    /** Jackpot 特效节点（数组） */
    @property({ type: [cc.Node] })
    public jackpotFx: cc.Node[] = [];

    /** 相机震动动画 */
    @property(cc.Animation)
    public cameraShaking: cc.Animation = null;

    /** 赔付线控制组件 */
    @property(PaylineController_TwilightDragon)
    public paylineController: PaylineController_TwilightDragon = null;

    /** 场景切换遮罩节点（阻止点击穿透） */
    @property(cc.Node)
    public sceneChangeBlockingNode: cc.Node = null;

    // ======================================
    // 核心方法：播放相机震动动画
    // ======================================
    public playCameraShaking(): void {
        if (this.cameraShaking) {
            this.cameraShaking.play("Camera_Shake");
        }
    }

    // ======================================
    // 核心方法：切换 UI 到免费旋转模式
    // ======================================
    public changeUIToFreeSpin(): void {
        if (this.freeSpinRootNode) this.freeSpinRootNode.active = true;
        if (this.baseRootNode) this.baseRootNode.active = false;
    }

    // ======================================
    // 核心方法：切换 UI 到基础模式（正常模式）
    // ======================================
    public changeUIToNormal(): void {
        if (this.freeSpinRootNode) this.freeSpinRootNode.active = false;
        if (this.baseRootNode) this.baseRootNode.active = true;
        if (this.baseBG) this.baseBG.play("Base_BG_Stay");
    }

    // ======================================
    // 核心方法：播放卷轴灯光动画（根据场景切换）
    // ======================================
    public playReelLight(type: "reelSpin" | "noWin" | "win" | "expect"): void {
        switch (type) {
            case "reelSpin":
                this.startReelSpin();
                break;
            case "noWin":
                this.stopReelSpin_Stay();
                break;
            case "win":
                this.stopReelSpin_Win();
                break;
            case "expect":
                this.reelExpect();
                break;
        }
    }

    // ======================================
    // 辅助方法：开始卷轴旋转（灯光动画）
    // ======================================
    private startReelSpin(): void {
        // 播放左右两侧灯光旋转动画
        this.reelLightBG_L.forEach(ani => ani && ani.play("ReelLight_Spin"));
        this.reelLightBG_R.forEach(ani => ani && ani.play("ReelLight_Spin"));
        // 显示卷轴灯光背景节点
        this.reelLightBG.forEach(node => node && (node.active = true));
    }

    // ======================================
    // 辅助方法：停止卷轴旋转（无奖励，保持灯光）
    // ======================================
    public stopReelSpin_Stay(): void {
        // 播放左右两侧灯光保持动画
        this.reelLightBG_L.forEach(ani => ani && ani.play("ReelLight_Stay"));
        this.reelLightBG_R.forEach(ani => ani && ani.play("ReelLight_Stay"));
        // 隐藏卷轴灯光背景节点
        this.reelLightBG.forEach(node => node && (node.active = false));
    }

    // ======================================
    // 辅助方法：停止卷轴旋转（有奖励，命中灯光）
    // ======================================
    private stopReelSpin_Win(): void {
        // 播放左右两侧灯光命中动画
        this.reelLightBG_L.forEach(ani => ani && ani.play("ReelLight_Hit"));
        this.reelLightBG_R.forEach(ani => ani && ani.play("ReelLight_Hit"));
        // 显示卷轴灯光背景节点
        this.reelLightBG.forEach(node => node && (node.active = true));
    }

    // ======================================
    // 辅助方法：卷轴期望特效（即将中奖提示）
    // ======================================
    private reelExpect(): void {
        // 仅播放中间卷轴（索引 2）的期望动画
        if (this.reelLightBG_L[2]) this.reelLightBG_L[2].play("ReelLight_Expect");
        if (this.reelLightBG_R[2]) this.reelLightBG_R[2].play("ReelLight_Expect");
        // 显示所有卷轴灯光背景节点
        this.reelLightBG.forEach(node => node && (node.active = true));
    }

    // ======================================
    // 核心方法：播放 Jackpot 命中特效
    // ======================================
    public playHitJackpotFx(index: number, money: string | number, duration: number): void {
        // 只显示对应索引的 Jackpot 特效，隐藏其他
        this.jackpotFx.forEach((node, idx) => {
            if (node) node.active = idx === index;
        });
        // 设置奖金显示
        this.setShowingMoney(money, duration);
    }

    // ======================================
    // 核心方法：隐藏所有 Jackpot 特效
    // ======================================
    public hideJackpotFx(): void {
        this.jackpotFx.forEach(node => node && (node.active = false));
    }

    // ======================================
    // 辅助方法：设置 Jackpot 奖金显示
    // ======================================
    private setShowingMoney(money: string | number, duration: number): void {
        if (!this.jackpotMoneyDisplay) return;
        // 此处 money 类型兼容 string/number，适配原逻辑
        this.jackpotMoneyDisplay.setPlayingState(money as string, false);
        this.jackpotMoneyDisplay.setShowingMoney(money as string, duration);
    }

    // ======================================
    // 核心方法：设置 Jackpot 奖金显示为播放状态
    // ======================================
    public setPlayJackpotDisplayMoney(): void {
        if (!this.jackpotMoneyDisplay) return;
        this.jackpotMoneyDisplay.setPlayingState("mini", true);
        this.jackpotMoneyDisplay.setPlayingState("minor", true);
        this.jackpotMoneyDisplay.setPlayingState("major", true);
        this.jackpotMoneyDisplay.setPlayingState("mega", true);
    }

    // ======================================
    // 核心方法：播放场景切换动画
    // ======================================
    public playSceneChangeAni(): void {
        // 获取画布节点，设置遮罩大小（阻止点击穿透）
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        if (canvas && this.sceneChangeBlockingNode) {
            const canvasSize = canvas.node.getContentSize();
            this.sceneChangeBlockingNode.setContentSize(canvasSize.width, canvasSize.height);
        }
        // 显示场景切换动画节点
        if (this.sceneChangeNode) this.sceneChangeNode.active = true;
    }

    // ======================================
    // 核心方法：停止场景切换动画
    // ======================================
    public stopSceneChangeAni(): void {
        if (this.sceneChangeNode) this.sceneChangeNode.active = false;
    }
}