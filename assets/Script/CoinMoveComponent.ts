import SlotBigWinEffectController_1022 from "./BigWinEffect/SlotBigWinEffectController_1022";
import SlotManager from "./manager/SlotManager";

const { ccclass, property } = cc._decorator;

/**
 * 金币移动组件
 * 负责金币动画播放、移动到目标节点、缩放动画等逻辑
 */
@ccclass()
export default class CoinMoveComponent extends cc.Component {
    // ===================== 序列化属性（对应编辑器绑定） =====================
    /** 金币根节点 */
    @property({ type: cc.Node })
    public coinRoot: cc.Node = null!;

    /** 金币显示节点 */
    @property({ type: cc.Node })
    public coinObject: cc.Node = null!;

    /** 大额奖金控制器（新版） */
    @property(SlotBigWinEffectController_1022)
    public bigWinControllerNew: SlotBigWinEffectController_1022 = null;

    // ===================== 生命周期函数 =====================
    /**
     * 组件加载时初始化
     */
    onLoad(): void {
        var e = this;
        this.getComponent(cc.Animation).on("finished", function() {
            e.coinRoot.stopAllActions();
            var t = (null != e.bigWinControllerNew ? e.bigWinControllerNew.getCoinTargetNode() : SlotManager.Instance.getBigWinCoinTarget()).convertToWorldSpaceAR(cc.Vec2.ZERO)
              , n = e.coinRoot.parent.convertToNodeSpace(t)
              , o = cc.easeQuadraticActionIn()
              , a = cc.moveTo(.5, n).easing(o)
              , i = cc.scaleTo(.5, 1, 1).easing(o)
              , l = cc.callFunc(function() {
                e.coinObject.active = false
            });
            e.coinRoot.runAction(cc.sequence(cc.delayTime(.5), a, l)),
            e.coinRoot.runAction(cc.sequence(cc.delayTime(.5), i))
        })
    }

    /**
     * 组件启用时重置状态并播放动画
     */
    onEnable(): void {
        // 重置金币根节点缩放
        this.coinRoot.scaleX = 1;
        this.coinRoot.scaleY = 1;
        // 激活金币显示节点
        this.coinObject.active = true;

        // 重启动画
        const animation = this.getComponent(cc.Animation);
        animation.stop();
        animation.play();
    }
}