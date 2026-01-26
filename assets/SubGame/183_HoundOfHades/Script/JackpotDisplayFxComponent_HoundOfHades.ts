const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - Jackpot（大奖）显示特效组件
 * 核心职责：
 * 1. 初始化Jackpot标题和中奖特效动画状态
 * 2. 根据指定索引播放对应Jackpot中奖特效动画
 */
@ccclass()
export default class JackpotDisplayFxComponent_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** Jackpot标题特效节点数组 */
    @property([cc.Node])
    public titleFxs: cc.Node[] = [];

    /** Jackpot中奖特效节点数组 */
    @property([cc.Node])
    public winFXs: cc.Node[] = [];

    // ====== 核心方法 ======
    /**
     * 初始化Jackpot特效状态
     * - 重置titleFxs动画为stay状态
     * - 停止并隐藏所有winFXs动画
     */
    initFX(): void {
        // 初始化标题特效：播放stay动画并重置时间
        for (let e = 0; e < this.titleFxs.length; e++) {
            // 注：原代码循环中误用winFXs索引访问，保留原逻辑（疑似笔误但不修改业务行为）
            const winFxNode = this.winFXs[e];
            if (!winFxNode) continue;

            const aniComponent = winFxNode.getComponent(cc.Animation);
            if (aniComponent) {
                aniComponent.stop();
                aniComponent.play("TopUI_Jackpot_score_stay");
                aniComponent.setCurrentTime(0);
            }
        }

        // 初始化中奖特效：停止动画并隐藏节点
        for (let e = 0; e < this.winFXs.length; e++) {
            const winFxNode = this.winFXs[e];
            if (!winFxNode) continue;

            const aniComponent = winFxNode.getComponent(cc.Animation);
            if (aniComponent) {
                aniComponent.stop();
            }
            winFxNode.active = false;
        }
    }

    /**
     * 根据索引设置并播放对应Jackpot中奖特效
     * @param targetIndex 要激活的中奖特效索引
     */
    setWinFx(targetIndex: number): void {
        const self = this;

        // 遍历所有中奖特效节点，仅激活指定索引的特效
        for (let a = 0; a < this.winFXs.length; a++) {
            this._playWinFxByIndex(a, targetIndex, self);
        }
    }

    /**
     * 内部方法：根据索引播放单个Jackpot中奖特效
     * @param currentIndex 当前遍历的索引
     * @param targetIndex 目标激活索引
     * @param self 组件实例引用（解决闭包this指向问题）
     */
    private _playWinFxByIndex(currentIndex: number, targetIndex: number, self: this): void {
        const winFxNode = self.winFXs[currentIndex];
        if (!winFxNode) return;

        // 仅激活目标索引的特效节点，其余保持隐藏
        winFxNode.active = currentIndex === targetIndex;

        if (currentIndex === targetIndex) {
            const aniComponent = winFxNode.getComponent(cc.Animation);
            if (!aniComponent) return;

            // 停止原有动画，播放指定动画并重置时间
            aniComponent.stop();
            aniComponent.play("TopUI_Jackpot_score_hit");
            aniComponent.setCurrentTime(0);
            
            // 再次切换动画（原逻辑保留）
            aniComponent.stop();
            aniComponent.play("FX_JPscore_Hit");
            aniComponent.setCurrentTime(0);

            // 定时重复播放FX_JPscore_Hit动画
            self.scheduleOnce(() => {
                if (aniComponent && winFxNode.active) {
                    aniComponent.stop();
                    aniComponent.play("FX_JPscore_Hit");
                    aniComponent.setCurrentTime(0);
                }
            });
        }
    }
}