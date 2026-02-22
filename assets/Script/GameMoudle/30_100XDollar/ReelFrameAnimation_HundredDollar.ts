const { ccclass, property } = cc._decorator;

/**
 * 百元老虎机滚轮帧动画控制组件
 * 负责管理滚轮旋转、普通中奖、奖励中奖等帧动画的播放与停止
 */
@ccclass('ReelFrameAnimation_HundredDollar')
export default class ReelFrameAnimation_HundredDollar extends cc.Component {
    /** 滚轮旋转动画组件 */
    @property({
        type: cc.Animation,
        displayName: "滚轮旋转动画"
    })
    public spinAnimation: cc.Animation = null;

    /** 中奖动画组件（包含普通/奖励两种动画剪辑） */
    @property({
        type: cc.Animation,
        displayName: "中奖动画"
    })
    public winAnimation: cc.Animation = null;

    /** 旋转动画精灵节点数组（控制显示/隐藏） */
    @property({
        type: [cc.Node],
        displayName: "旋转动画精灵节点"
    })
    public spinAniSprites: cc.Node[] = [];

    constructor(){
        super()
    }

    /**
     * 停止所有动画并隐藏动画节点
     */
    stopAllAnimation(): void {
        // 停止并隐藏旋转动画
        if (this.spinAnimation) {
            this.spinAnimation.stop();
            if (this.spinAnimation.node) {
                this.spinAnimation.node.active = false;
            }
        }

        // 停止并隐藏中奖动画
        if (this.winAnimation) {
            this.winAnimation.stop();
            if (this.winAnimation.node) {
                this.winAnimation.node.active = false;
            }
        }

        // 隐藏所有旋转动画精灵
        this.spinAniSprites.forEach(sprite => {
            if (sprite) {
                sprite.active = false;
            }
        });
    }

    /**
     * 播放滚轮旋转动画
     */
    playSpinAnimation(): void {
        this.stopAllAnimation(); // 先停止所有动画

        // 显示旋转动画精灵（前4个）
        for (let i = 0; i < 4; ++i) {
            if (this.spinAniSprites[i]) {
                this.spinAniSprites[i].active = true;
            }
        }

        // 播放旋转动画
        if (this.spinAnimation) {
            this.spinAnimation.node.active = true;
            this.spinAnimation.play();
        }
    }

    /**
     * 隐藏指定的滚轮旋转动画精灵
     * @param index 隐藏索引（0/1 单独隐藏；2/3 同时隐藏）
     */
    hideReelSpinAni(index: number): void {
        if (index < 0 || index >= this.spinAniSprites.length) {
            cc.warn(`ReelFrameAnimation: 隐藏索引 ${index} 超出精灵数组范围`);
            return;
        }

        // 索引0/1：单独隐藏对应精灵
        if (index < 2) {
            if (this.spinAniSprites[index]) {
                this.spinAniSprites[index].active = false;
            }
        } 
        // 索引>=2：同时隐藏索引2和3的精灵
        else {
            if (this.spinAniSprites[2]) {
                this.spinAniSprites[2].active = false;
            }
            if (this.spinAniSprites[3]) {
                this.spinAniSprites[3].active = false;
            }
        }
    }

    /**
     * 播放普通中奖动画
     */
    playNormalWinAnimation(): void {
        this.stopAllAnimation(); // 先停止所有动画

        if (this.winAnimation) {
            this.winAnimation.node.active = true;
            this.winAnimation.play("Reel_Frame_Win_Normal_Fx_Ani");
        } else {
            cc.warn("ReelFrameAnimation: 中奖动画组件未挂载，无法播放普通中奖动画");
        }
    }

    /**
     * 播放奖励中奖动画
     */
    playBonusWinAnimation(): void {
        this.stopAllAnimation(); // 先停止所有动画

        if (this.winAnimation) {
            this.winAnimation.node.active = true;
            this.winAnimation.play("Reel_Frame_Win_Bonus_Fx_Ani");
        } else {
            cc.warn("ReelFrameAnimation: 中奖动画组件未挂载，无法播放奖励中奖动画");
        }
    }
}