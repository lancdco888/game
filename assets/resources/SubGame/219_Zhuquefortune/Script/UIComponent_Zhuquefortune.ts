const { ccclass, property } = cc._decorator;

import ZhuquefortuneManager from "./ZhuquefortuneManager";
import EnteranceComponent_Zhuquefortune from "./EnteranceComponent_Zhuquefortune";
import SlotSoundController from "../../../../Script/Slot/SlotSoundController";
import SlotGameResultManager from "../../../../Script/manager/SlotGameResultManager";

/**
 * 朱雀财富UI组件类
 * 负责管理游戏UI/背景切换、Lock&Roll动画、朱雀Spine骨骼动画及对应音效播放
 */
@ccclass()
export default class UIComponent_Zhuquefortune extends cc.Component {
    // ===== 编辑器可配置属性（对应原JS的property定义，补充TS类型）=====
    /** 背景节点数组（索引0：基础模式，索引1：Lock&Roll模式） */
    @property([cc.Node])
    public bg_Nodes: cc.Node[] = [];

    /** UI节点数组（索引0：基础模式，索引1：Lock&Roll模式） */
    @property([cc.Node])
    public ui_Nodes: cc.Node[] = [];

    /** Lock&Roll模式动画组件 */
    @property(cc.Animation)
    public lockNRoll_Animation: cc.Animation | null = null;

    /** 朱雀骨骼节点数组（对应不同Jackpot档位：mini~grand） */
    @property([cc.Node])
    public zhuque_Nodes: cc.Node[] = [];

    // ===== 生命周期方法 =====
    /**
     * 节点加载完成回调（初始化朱雀骨骼动画的混合参数）
     */
    onLoad(): void {
        // 遍历朱雀骨骼节点，设置动画混合（过渡）参数，提升动画切换流畅度
        this.zhuque_Nodes.forEach((node) => {
            const skeletonComp = node.getComponent(sp.Skeleton);
            if (!skeletonComp) return;

            // 设置不同动画之间的混合时长（0.5秒）
            skeletonComp.setMix("Top_Idle", "Top_Idle_J3_Appear", 0.5);
            skeletonComp.setMix("Top_Idle_J3_Appear", "Top_Idle", 0.5);
            skeletonComp.setMix("LnR_Count_Start", "Top_Idle", 0.5);
            skeletonComp.setMix("Top_Idle", "LnR_Count_Start", 0.5);
        });
    }

    // ===== 公共业务方法（模式切换与动画控制）=====
    /**
     * 切换到【基础模式】（隐藏Lock&Roll相关UI/背景，暂停骨骼动画）
     */
    public setBase(): void {
        // 1. 切换背景节点（仅显示索引0的基础模式背景）
        this.bg_Nodes.forEach((node, index) => {
            node.active = index === 0;
        });

        // 2. 切换UI节点（仅显示索引0的基础模式UI）
        this.ui_Nodes.forEach((node, index) => {
            node.active = index === 0;
        });

        // 3. 暂停入口组件的骨骼动画
        const gameComponents = ZhuquefortuneManager.getInstance().game_components;
        const enteranceComp = gameComponents?.enteranceComponent.getComponent(EnteranceComponent_Zhuquefortune);
        enteranceComp.pauseSkeletons();

        // 4. 停止Lock&Roll模式动画
        this.lockNRoll_Animation?.stop();
    }

    /**
     * 切换到【Lock&Roll模式】（显示对应UI/背景，播放闲置动画）
     */
    public setLockNRoll(): void {
        // 1. 切换背景节点（仅显示索引1的Lock&Roll模式背景）
        this.bg_Nodes.forEach((node, index) => {
            node.active = index === 1;
        });

        // 2. 切换UI节点（仅显示索引1的Lock&Roll模式UI）
        this.ui_Nodes.forEach((node, index) => {
            node.active = index === 1;
        });

        // 3. 播放Lock&Roll对应档位的闲置背景动画
        const idleAnimName = this.getIdleAnimationName();
        this.lockNRoll_Animation?.stop();
        this.lockNRoll_Animation?.play(idleAnimName, 0);

        // 4. 播放朱雀骨骼的闲置动画
        const zhuqueIndex = this.getZhuqueIndex();
        const skeletonComp = this.zhuque_Nodes[zhuqueIndex]?.getComponent(sp.Skeleton);
        skeletonComp?.setAnimation(0, "Top_Idle", true);
    }

    /**
     * 切换Lock&Roll模式的背景动画（档位升级时调用）
     */
    public changeLockNRollBG(): void {
        const changeAnimName = this.getChangeAnimationName();
        this.lockNRoll_Animation?.stop();
        this.lockNRoll_Animation?.play(changeAnimName, 0);
    }

    // ===== 公共业务方法（朱雀骨骼动画控制）=====
    /**
     * 播放朱雀【收集奖励】骨骼动画
     */
    public getCollectZhuque(): void {
        const zhuqueIndex = this.getZhuqueIndex(false);
        const skeletonComp = this.zhuque_Nodes[zhuqueIndex]?.getComponent(sp.Skeleton);
        skeletonComp?.setAnimation(0, "Top_Idle_J3_Appear", true);
    }

    /**
     * 播放朱雀【闲置】骨骼动画
     */
    public getIdleZhuque(): void {
        const zhuqueIndex = this.getZhuqueIndex();
        const skeletonComp = this.zhuque_Nodes[zhuqueIndex]?.getComponent(sp.Skeleton);
        skeletonComp?.setAnimation(0, "Top_Idle", true);
    }

    /**
     * 播放朱雀【结算计数】骨骼动画（带后续闲置动画衔接，播放音效）
     */
    public getCaculateZhuque(): void {
        const zhuqueIndex = this.getZhuqueIndex(false);
        const skeletonComp = this.zhuque_Nodes[zhuqueIndex]?.getComponent(sp.Skeleton);
        if (!skeletonComp) return;

        // 播放计数启动动画（单次），后续衔接闲置动画（循环）
        skeletonComp.setAnimation(0, "LnR_Count_Start", false);
        skeletonComp.addAnimation(0, "Top_Idle", true);

        // 播放朱雀叫声音效
        SlotSoundController.Instance()?.playAudio("ZhuqueCry", "FX");
    }

    /**
     * 播放朱雀【启动特效】骨骼动画（带后续闲置动画衔接，播放音效）
     */
    public getStartFXZhuque(): void {
        const zhuqueIndex = this.getZhuqueIndex();
        const skeletonComp = this.zhuque_Nodes[zhuqueIndex]?.getComponent(sp.Skeleton);
        if (!skeletonComp) return;

        // 播放启动动画（单次），后续衔接闲置动画（循环）
        skeletonComp.setAnimation(0, "LnR_Count_Start", false);
        skeletonComp.addAnimation(0, "Top_Idle", true);

        // 播放朱雀叫声音效
        SlotSoundController.Instance()?.playAudio("ZhuqueCry", "FX");
    }

    // ===== 私有辅助方法（动画名称与索引匹配）=====
    /**
     * 获取Lock&Roll模式的【闲置背景动画名称】（根据下一个子游戏密钥匹配）
     * @returns 动画名称字符串
     */
    private getIdleAnimationName(): string {
        const nextSubGameKey = SlotGameResultManager.Instance?.getNextSubGameKey() || "";

        // 匹配不同档位对应的闲置背景动画
        return nextSubGameKey === "lockNRoll_mini" ? "LnR_Bg_Idle_Green"
            : nextSubGameKey === "lockNRoll_minor" ? "LnR_Bg_Idle_Blue"
            : nextSubGameKey === "lockNRoll_major" ? "LnR_Bg_Idle_Violet"
            : nextSubGameKey === "lockNRoll_mega" ? "LnR_Bg_Idle_Red"
            : "LnR_Bg_Idle_Gold";
    }

    /**
     * 获取朱雀骨骼节点的【索引】（根据子游戏密钥匹配，对应mini~grand档位）
     * @param isNext 是否使用下一个子游戏密钥（默认true：下一个，false：当前）
     * @returns 朱雀节点数组索引（0~4）
     */
    private getZhuqueIndex(isNext: boolean = true): number {
        const gameResultManager = SlotGameResultManager.Instance;
        if (!gameResultManager) return 4;

        // 选择使用当前或下一个子游戏密钥
        const subGameKey = isNext
            ? gameResultManager.getNextSubGameKey() || ""
            : gameResultManager.getSubGameKeyOfCurrentGameResult() || "";

        // 匹配不同档位对应的朱雀节点索引
        return subGameKey === "lockNRoll_mini" ? 0
            : subGameKey === "lockNRoll_minor" ? 1
            : subGameKey === "lockNRoll_major" ? 2
            : subGameKey === "lockNRoll_mega" ? 3
            : 4;
    }

    /**
     * 获取Lock&Roll模式的【背景切换动画名称】（档位升级时使用）
     * @returns 动画名称字符串
     */
    private getChangeAnimationName(): string {
        const nextSubGameKey = SlotGameResultManager.Instance?.getNextSubGameKey() || "";

        // 匹配不同档位升级对应的背景切换动画
        return nextSubGameKey === "lockNRoll_minor" ? "LnR_Bg_Change_to_Blue"
            : nextSubGameKey === "lockNRoll_major" ? "LnR_Bg_Change_to_Violet"
            : nextSubGameKey === "lockNRoll_mega" ? "LnR_Bg_Change_to_Red"
            : "LnR_Bg_Change_to_Gold";
    }
}