const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏 Jackpot 模式特效展示组件
 * 负责Jackpot模式顶部UI特效动画的初始化、中奖特效、出现特效的播放控制
 */
@ccclass('JackpotDisplayFxComponent_BeeLovedJars')
export default class JackpotDisplayFxComponent_BeeLovedJars extends cc.Component {
    // Jackpot特效动画组件数组（对应不同位置的FX动画）
    @property({
        type: [cc.Animation],
        displayName: "Jackpot特效动画数组",
        tooltip: "Jackpot模式顶部UI的多个FX动画组件（如不同档位的JP特效）"
    })
    fx_Animations: cc.Animation[] | null = [];

    /**
     * 初始化特效：停止所有动画，播放停留（stay）动画
     */
    init(): void {
        // 空值安全检查：动画数组不存在/为空时直接返回
        if (!this.fx_Animations || this.fx_Animations.length === 0) return;

        // 遍历所有特效动画，停止当前动画并播放停留动画
        for (let i = 0; i < this.fx_Animations.length; i++) {
            const anim = this.fx_Animations[i];
            if (anim && anim.isValid) { // 检查动画组件是否有效（未销毁）
                anim.stop(); // 停止当前播放的动画
                anim.play("Fx_TopUI_JP_stay", 0); // 播放停留动画（0=不循环）
            }
        }
    }

    /**
     * 播放指定索引的中奖计算特效
     * @param index 动画数组索引（对应不同档位的JP特效）
     */
    winFX(index: number): void {
        // 空值+边界检查：数组不存在/索引越界时直接返回
        if (!this.fx_Animations || index < 0 || index >= this.fx_Animations.length) return;

        const anim = this.fx_Animations[index];
        if (anim && anim.isValid) {
            anim.stop(); // 停止当前动画
            anim.play("Fx_TopUI_JP_calculate", 0); // 播放中奖计算动画
        }
    }

    /**
     * 播放所有特效的出现动画
     */
    appearFX(): void {
        // 空值安全检查：动画数组不存在/为空时直接返回
        if (!this.fx_Animations || this.fx_Animations.length === 0) return;

        // 遍历所有特效动画，停止当前动画并播放出现动画
        for (let i = 0; i < this.fx_Animations.length; i++) {
            const anim = this.fx_Animations[i];
            if (anim && anim.isValid) {
                anim.stop(); // 停止当前播放的动画
                anim.play("Fx_TopUI_JP_appear", 0); // 播放出现动画（0=不循环）
            }
        }
    }
}