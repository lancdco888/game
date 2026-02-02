const { ccclass, property } = cc._decorator;

/**
 * 卷轴特效组件（Super25Deluxe 专属）
 * 功能：控制帧动画播放、停止所有相关特效
 */
@ccclass() // 组件名称，与 JS 中保持一致
export default class ReelEffectComponent_Super25Deluxe extends cc.Component {
    // 1. 序列化属性：帧动画 - 旋转预期
    @property(cc.Animation) // 指定属性类型为 cc.Animation，对应 JS 中的 s(cc.Animation)
    public frameSpinExpect: cc.Animation = null!; // TS 强类型声明，! 表示非空断言（避免初始化报错）

    // 2. 序列化属性：帧动画 - 中奖
    @property(cc.Animation)
    public frameWin: cc.Animation = null!;

    // 3. 序列化属性：预期背景节点数组
    @property({ type: [cc.Node] }) // 数组类型需显式指定 { type: [Node] }，对应 JS 中的 s([cc.Node])
    public expectBackgrounds: cc.Node[] = []; // TS 数组类型声明，初始化为空数组

    // 4. 序列化属性：预期特效节点数组
    @property({ type: [cc.Node] })
    public expectEffects: cc.Node[] = [];

    // ======================================
    // 原有方法迁移（保持逻辑不变，补充 TS 类型标注）
    // ======================================

    /**
     * 播放「旋转预期」帧动画
     */
    public playFrameSpinExpectEffect(): void {
        this.stopAllFrameAnis();
        this.frameSpinExpect.node.active = true;
        this.frameSpinExpect.play();
    }

    /**
     * 播放「中奖」帧动画
     */
    public playFrameWinEffect(): void {
        this.stopAllFrameAnis();
        this.frameWin.node.active = true;
        this.frameWin.play();
    }

    /**
     * 停止所有帧动画
     */
    private stopAllFrameAnis(): void {
        this.frameSpinExpect.stop();
        this.frameSpinExpect.node.active = false;
        this.frameWin.stop();
        this.frameWin.node.active = false;
    }

    /**
     * 停止所有预期背景和特效节点
     */
    private stopAllExpectEffects(): void {
        // 遍历关闭所有预期背景
        for (let i = 0; i < this.expectBackgrounds.length; ++i) {
            this.expectBackgrounds[i].active = false;
        }
        // 遍历关闭所有预期特效
        for (let i = 0; i < this.expectEffects.length; ++i) {
            this.expectEffects[i].active = false;
        }
    }

    /**
     * 停止所有特效（帧动画 + 节点特效）
     */
    public stopAllEffects(): void {
        this.stopAllFrameAnis();
        this.stopAllExpectEffects();
    }
}