const { ccclass, property } = cc._decorator;

// 项目全局适配管理器 - 路径与原JS完全一致
import ViewResizeManager from "./global_utility/ViewResizeManager";


/**
 * 老虎机特殊模式文字特效核心控制器
 * 管理所有特殊玩法的文字动画播放 + 免费旋转数字动态渲染 + 全局屏幕适配
 */
@ccclass
export default class SpecialModeTextController extends cc.Component {
    // ===================== 编辑器可配置属性 - 与原JS @property 1:1精准复刻 类型+名称完全一致 =====================
    @property(cc.Animation)
    public jackpotText: cc.Animation = null;               // 大奖模式文字动画
    @property(cc.Animation)
    public bonusgameText: cc.Animation = null;             // 奖金游戏模式文字动画
    @property(cc.Animation)
    public lockAndRollText: cc.Animation = null;           // 锁定旋转模式文字动画
    @property(cc.Animation)
    public freespinIgnoreNumberText: cc.Animation = null;  // 免费旋转(无数字)模式文字动画

    @property(cc.Node)
    public freespinNumIntroAni: cc.Node = null;            // 免费旋转数字动画根节点
    @property(cc.Sprite)
    public freespinIntroNum_10: cc.Sprite = null;          // 免费旋转数字-十位
    @property(cc.Sprite)
    public freespinIntroNum_1: cc.Sprite = null;           // 免费旋转数字-个位
    @property(cc.Sprite)
    public freespinPlus: cc.Sprite = null;                 // 免费旋转重触发 +号图标

    @property([cc.SpriteFrame])
    public freespinNumSpriteFrame: cc.SpriteFrame[] = [];  // 免费旋转数字精灵帧数组 [0-9]

    @property(cc.Node)
    public backFreespinNumberLayer: cc.Node = null;        // 免费旋转数字-底层节点
    @property(cc.Node)
    public frontFreespinNumberLayer: cc.Node = null;       // 免费旋转数字-顶层节点
    @property(cc.Node)
    public rootFreespinNumber: cc.Node = null;             // 免费旋转数字动画根节点
    @property(cc.Node)
    public blockingBG: cc.Node = null;                     // 遮罩背景节点

    // ===================== 生命周期回调 - 与原JS逻辑完全一致 =====================
    onLoad(): void {
        this.resizeView();
        ViewResizeManager.Instance().addHandler(this);
    }

    onDestroy(): void {
        ViewResizeManager.RemoveHandler(this);
    }

    // ===================== 核心特效播放 - 免费旋转数字特效 (主入口) =====================
    playFreespinTextEffect(num: number): void {
        const self = this;
        this.hideAllEffect();
        this.unscheduleAllCallbacks();
        this.resizeView();

        if (num != null && num != null) { // 原JS 冗余空判断 精准保留
            this.freespinNumIntroAni.active = true;
            this.freespinNumIntroAni.getComponent(cc.Animation).stop();
            this.rootFreespinNumber.getComponent(cc.Animation).stop();

            const tens = Math.floor(num / 10);  // 十位数字
            const unit = Math.floor(num % 10);  // 个位数字

            this.freespinPlus.node.active = false;
            this.freespinIntroNum_10.spriteFrame = this.freespinNumSpriteFrame[tens];
            this.freespinIntroNum_1.spriteFrame = this.freespinNumSpriteFrame[unit];

            // 十位为0时的数字排版适配 - 坐标值与原JS完全一致
            if (tens === 0) {
                this.freespinIntroNum_10.node.active = false;
                this.freespinIntroNum_1.node.active = true;
                this.freespinIntroNum_1.node.x = 0;
            } else {
                this.freespinIntroNum_10.node.active = true;
                this.freespinIntroNum_1.node.active = true;
                this.freespinIntroNum_10.node.x = -89;
                this.freespinIntroNum_1.node.x = 89;
            }

            // 节点层级切换：先加到顶层 播放动画 → 延迟后切回底层
            if (this.rootFreespinNumber.parent) this.rootFreespinNumber.removeFromParent();
            this.frontFreespinNumberLayer.addChild(this.rootFreespinNumber);

            this.freespinNumIntroAni.getComponent(cc.Animation).play();
            this.rootFreespinNumber.getComponent(cc.Animation).play();

            // 原JS 精准延迟 1.1秒 无改动
            this.scheduleOnce(() => {
                if (self.rootFreespinNumber.parent) self.rootFreespinNumber.removeFromParent();
                self.backFreespinNumberLayer.addChild(self.rootFreespinNumber);
            }, 1.1);
        } else {
            // 原JS else分支逻辑 一字不差保留
            this.freespinNumIntroAni.active = true;
            this.freespinNumIntroAni.getComponent(cc.Animation).stop();
            this.rootFreespinNumber.getComponent(cc.Animation).stop();
            
            const tens = Math.floor(num / 10);
            const unit = Math.floor(num % 10);

            this.freespinPlus.node.active = false;
            this.freespinIntroNum_10.node.active = false;
            this.freespinIntroNum_1.node.active = false;

            this.freespinNumIntroAni.getComponent(cc.Animation).play();
            
            this.scheduleOnce(() => {
                if (self.rootFreespinNumber.parent) self.rootFreespinNumber.removeFromParent();
                self.backFreespinNumberLayer.addChild(self.rootFreespinNumber);
            }, 1.1);
        }
    }

    // ===================== 核心特效播放 - 免费旋转 重触发特效 (带+号) =====================
    playRetriggerEffect(num: number): void {
        const self = this;
        this.hideAllEffect();
        this.unscheduleAllCallbacks();
        this.resizeView();

        this.freespinNumIntroAni.active = true;
        this.freespinNumIntroAni.getComponent(cc.Animation).stop();
        this.rootFreespinNumber.getComponent(cc.Animation).stop();

        const tens = Math.floor(num / 10);
        const unit = Math.floor(num % 10);

        this.freespinPlus.node.active = true; // 重触发专属 +号显示
        this.freespinIntroNum_10.spriteFrame = this.freespinNumSpriteFrame[tens];
        this.freespinIntroNum_1.spriteFrame = this.freespinNumSpriteFrame[unit];

        if (tens === 0) {
            this.freespinIntroNum_10.node.active = false;
            this.freespinIntroNum_1.node.active = true;
        } else {
            this.freespinIntroNum_10.node.active = true;
            this.freespinIntroNum_1.node.active = true;
        }

        if (this.rootFreespinNumber.parent) this.rootFreespinNumber.removeFromParent();
        this.frontFreespinNumberLayer.addChild(this.rootFreespinNumber);

        this.freespinNumIntroAni.getComponent(cc.Animation).play();
        this.rootFreespinNumber.getComponent(cc.Animation).play();

        this.scheduleOnce(() => {
            if (self.rootFreespinNumber.parent) self.rootFreespinNumber.removeFromParent();
            self.backFreespinNumberLayer.addChild(self.rootFreespinNumber);
        }, 1.1);
    }

    // ===================== 核心特效播放 - 大奖模式文字动画 =====================
    playJackpotTextEffect(): void {
        this.hideAllEffect();
        this.resizeView();
        if (this.jackpotText) {
            this.jackpotText.node.active = true;
            this.jackpotText.stop();
            this.jackpotText.play();
        }
    }

    // ===================== 核心特效播放 - 奖金游戏模式文字动画 =====================
    playBonusgameTextEffect(): void {
        this.hideAllEffect();
        this.resizeView();
        if (this.bonusgameText) {
            this.bonusgameText.node.active = true;
            this.bonusgameText.stop();
            this.bonusgameText.play();
        }
    }

    // ===================== 核心特效播放 - 免费旋转(无数字)模式文字动画 =====================
    playFreespinTextIgnoreNumberEffect(): void {
        this.hideAllEffect();
        this.resizeView();
        if (this.freespinIgnoreNumberText) {
            this.freespinIgnoreNumberText.node.active = true;
            this.freespinIgnoreNumberText.stop();
            this.freespinIgnoreNumberText.play();
        }
    }

    // ===================== 核心特效播放 - 锁定旋转模式文字动画 =====================
    playLockAndRollTextEffect(): void {
        this.hideAllEffect();
        this.resizeView();
        if (this.lockAndRollText) {
            this.lockAndRollText.node.active = true;
            this.lockAndRollText.stop();
            this.lockAndRollText.play();
        }
    }

    // ===================== 核心公共方法 - 隐藏所有特效动画 无残留 =====================
    hideAllEffect(): void {
        if (this.jackpotText) this.jackpotText.node.active = false;
        if (this.bonusgameText) this.bonusgameText.node.active = false;
        if (this.freespinNumIntroAni) this.freespinNumIntroAni.active = false;
        if (this.lockAndRollText) this.lockAndRollText.node.active = false;
        if (this.freespinIgnoreNumberText) this.freespinIgnoreNumberText.node.active = false;
    }

    // ===================== 屏幕适配回调 - ViewResizeManager 空实现 与原JS一致 =====================
    onBeforeResizeView(): void {}

    // ===================== 屏幕适配回调 - ViewResizeManager 空实现 与原JS一致 =====================
    onResizeView(): void {}

    // ===================== 屏幕适配回调 - 适配完成后刷新布局 与原JS一致 =====================
    onAfterResizeView(): void {
        this.resizeView();
    }

    // ===================== 核心适配方法 - 全局屏幕尺寸自适应 公式1:1复刻 =====================
    resizeView(): void {
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        const canvasW = canvas.node.getContentSize().width;
        const canvasH = canvas.node.getContentSize().height;
        const canvasCenter = new cc.Vec2(Math.floor(canvasW / 2), Math.floor(canvasH / 2));

        if (this.blockingBG) {
            const bgPos = this.blockingBG.parent.convertToNodeSpaceAR(canvasCenter);
            this.blockingBG.setPosition(this.blockingBG.x, bgPos.y);
            // 原JS 尺寸补偿 +400 无改动 防止边缘留白
            this.blockingBG.setContentSize(canvasW + 400, canvasH + 400);
        }
    }
}