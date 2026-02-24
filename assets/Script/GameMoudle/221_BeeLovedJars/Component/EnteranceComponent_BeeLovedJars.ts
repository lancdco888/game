import SlotSoundController from "../../../Slot/SlotSoundController";

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏入场/开场UI组件
 * 负责入场UI的动画状态控制（停止/显示/闲置）、Spine动画暂停/恢复、入场音效播放
 */
@ccclass('EnteranceComponent_BeeLovedJars')
export default class EnteranceComponent_BeeLovedJars extends cc.Component {
    // ===================== 核心动画组件 =====================
    // 入场背景动画组件
    @property({
        type: cc.Animation,
        displayName: "入场背景动画",
        tooltip: "控制入场UI背景的核心动画组件（stay/appear/idle）"
    })
    intro_Animation: cc.Animation | null = null;

    // 入场标题动画组件
    @property({
        type: cc.Animation,
        displayName: "入场标题动画",
        tooltip: "控制入场UI标题的动画组件（title_stay/title）"
    })
    title_Animation: cc.Animation | null = null;

    // 闲置状态Spine动画节点数组
    @property({
        type: [cc.Node],
        displayName: "闲置Spine节点数组",
        tooltip: "需要控制暂停/恢复的Spine动画节点数组（需挂载sp.Skeleton组件）"
    })
    idle_Spine: cc.Node[] | null = [];

    /**
     * 设置入场UI为停止状态：播放停留动画+暂停所有Spine
     */
    setStop(): void {
        // 1. 控制入场背景动画：停止→播放停留→重置时间
        if (this.intro_Animation && this.intro_Animation.isValid) {
            this.intro_Animation.stop();
            this.intro_Animation.play("Intro_stay");
            this.intro_Animation.setCurrentTime(0);
        }

        // 2. 控制入场标题动画：停止→播放标题停留→重置时间
        if (this.title_Animation && this.title_Animation.isValid) {
            this.title_Animation.stop();
            this.title_Animation.play("Intro_title_stay");
            this.title_Animation.setCurrentTime(0);
        }

        // 3. 暂停所有闲置Spine动画
        this.setSpinePaused(true);
    }

    /**
     * 显示入场UI：播放出现动画+播放入场音效
     */
    showIntro(): void {
        // 1. 控制入场背景动画：停止→播放出现→重置时间
        if (this.intro_Animation && this.intro_Animation.isValid) {
            this.intro_Animation.stop();
            this.intro_Animation.play("Intro_appear");
            this.intro_Animation.setCurrentTime(0);
        }

        // 2. 控制入场标题动画：停止→播放标题→重置时间
        if (this.title_Animation && this.title_Animation.isValid) {
            this.title_Animation.stop();
            this.title_Animation.play("Intro_title");
            this.title_Animation.setCurrentTime(0);
        }

        // 3. 播放入场音效
        SlotSoundController.Instance()?.playAudio("Intro", "FX");
    }

    /**
     * 设置入场UI为闲置状态：播放闲置动画+恢复所有Spine
     */
    setIdle(): void {
        // 1. 控制入场背景动画：停止→播放闲置→重置时间
        if (this.intro_Animation && this.intro_Animation.isValid) {
            this.intro_Animation.stop();
            this.intro_Animation.play("Intro_idle");
            this.intro_Animation.setCurrentTime(0);
        }

        // 2. 控制入场标题动画：停止→播放标题→重置时间
        if (this.title_Animation && this.title_Animation.isValid) {
            this.title_Animation.stop();
            this.title_Animation.play("Intro_title");
            this.title_Animation.setCurrentTime(0);
        }

        // 3. 恢复所有闲置Spine动画
        this.setSpinePaused(false);
    }

    /**
     * 通用Spine暂停/恢复控制方法（封装重复逻辑）
     * @param isPaused 是否暂停（true=暂停，false=恢复）
     */
    private setSpinePaused(isPaused: boolean): void {
        // 空值检查：Spine数组不存在/为空时直接返回
        if (!this.idle_Spine || this.idle_Spine.length === 0) return;

        // 遍历所有Spine节点，控制暂停状态
        for (let i = 0; i < this.idle_Spine.length; i++) {
            const spineNode = this.idle_Spine[i];
            // 节点有效性检查
            if (!spineNode || !spineNode.isValid) continue;

            // 获取Spine组件并控制暂停
            const skeleton = spineNode.getComponent(sp.Skeleton);
            if (skeleton && skeleton.isValid) {
                skeleton.paused = isPaused;
            } else {
                console.warn(`索引${i}的Spine节点未挂载sp.Skeleton组件`);
            }
        }
    }
}