import SlotSoundController from "../../Slot/SlotSoundController";

// 符合 Cocos 2.4.x 原生写法：解构装饰器
const { ccclass, property } = cc._decorator;

/**
 * 入场/开场控制组件
 * 负责控制核心UI动画、辅助动画、龙骨动画的播放与暂停，实现入场、展示、闲置、消失的完整视觉流程
 */
@ccclass()
export default class EnteranceComponent_Zhuquefortune extends cc.Component {
    // 核心开场动画组件（控制顶部核心动画：出现/消失/入场/闲置）
    @property(cc.Animation)
    public start_Animation: cc.Animation | null = null;

    // 辅助动画数组（配套的辅助视觉动画）
    @property([cc.Animation])
    public bi_Animation: cc.Animation[] = [];

    // 龙骨动画数组（需要同步暂停/播放的龙骨组件）
    @property([sp.Skeleton])
    public play_Skeletons: sp.Skeleton[] = [];

    /**
     * 暂停所有龙骨与辅助动画（播放消失动画，进入暂停状态）
     */
    public pauseSkeletons(): void {
        // 1. 控制核心开场动画：停止当前动画，播放消失动画并重置时间
        this.start_Animation?.stop();
        this.start_Animation?.play("Top_Disappear_Ani");
        this.start_Animation?.setCurrentTime(0);

        // 2. 暂停所有辅助动画
        for (let i = 0; i < this.bi_Animation.length; i++) {
            this.bi_Animation[i].stop();
        }

        // 3. 暂停所有龙骨动画
        for (let i = 0; i < this.play_Skeletons.length; i++) {
            this.play_Skeletons[i].paused = true;
        }
    }

    /**
     * 播放所有龙骨与辅助动画（播放出现动画，进入激活状态）
     */
    public playSkeletons(): void {
        // 1. 控制核心开场动画：停止当前动画，播放出现动画并重置时间
        this.start_Animation?.stop();
        this.start_Animation?.play("Top_Appear_Ani");
        this.start_Animation?.setCurrentTime(0);

        // 2. 播放所有辅助动画
        for (let i = 0; i < this.bi_Animation.length; i++) {
            this.bi_Animation[i].play();
        }

        // 3. 恢复所有龙骨动画播放
        for (let i = 0; i < this.play_Skeletons.length; i++) {
            this.play_Skeletons[i].paused = false;
        }
    }

    /**
     * 展示开场介绍效果（播放入场动画，播放对应音效，激活所有视觉元素）
     */
    public showIntro(): void {
        // 1. 控制核心开场动画：停止当前动画，播放入场动画并重置时间
        this.start_Animation?.stop();
        this.start_Animation?.play("Top_Enter_Ani");
        this.start_Animation?.setCurrentTime(0);

        // 2. 播放所有龙骨动画（使用默认动画，非循环播放）
        for (let i = 0; i < this.play_Skeletons.length; i++) {
            const defaultAniName = this.play_Skeletons[i].defaultAnimation;
            if (!defaultAniName) {
                cc.warn(`索引 ${i} 的龙骨组件未设置默认动画，无法播放入场龙骨效果`);
                continue;
            }
            this.play_Skeletons[i].paused = false;
            this.play_Skeletons[i].setAnimation(0, defaultAniName, false);
        }

        // 3. 重置并播放所有辅助动画
        for (let i = 0; i < this.bi_Animation.length; i++) {
            this.bi_Animation[i].stop();
            this.bi_Animation[i].play();
            this.bi_Animation[i].setCurrentTime(0);
        }

        // 4. 播放开场介绍音效
        SlotSoundController.Instance().playAudio("Intro", "FX");
    }

    /**
     * 重置为闲置状态（播放闲置动画，暂停所有额外视觉元素）
     */
    public setIdle(): void {
        // 1. 控制核心开场动画：停止当前动画，播放闲置动画并重置时间
        this.start_Animation?.stop();
        this.start_Animation?.play("Top_Idle_Ani");
        this.start_Animation?.setCurrentTime(0);

        // 2. 暂停所有龙骨与辅助动画，进入闲置休眠状态
        this.pauseSkeletons();
    }
}