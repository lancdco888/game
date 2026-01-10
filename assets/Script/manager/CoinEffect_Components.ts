import SlotSoundController from "../Slot/SlotSoundController";
import SlotManager from "./SlotManager";

const { ccclass,property } = cc._decorator;
/**
 * 金币爆炸特效核心组件（CoinEffect_Components）
 * 负责播放金币爆炸动画、音效、坐标适配、奖金金额应用
 */
@ccclass()
export default class CoinEffect_Components extends cc.Component {
    // ================= 可序列化属性（编辑器面板配置） =================
    @property(cc.Animation)
    public winExplodeCoin: cc.Animation | null = null; // 金币爆炸动画组件

    @property(cc.Node)
    public winCoinCollectFx: cc.Node | null = null;    // 金币收集特效节点

    // ================= 核心特效播放方法 =================
    /**
     * 播放金币爆炸特效
     * @param reward 奖励金额（用于应用到游戏结果）
     * @param callback 特效完成后的回调函数
     * @param targetNode 特效起始位置目标节点（可选）
     */
    public playExplodeCoinEffect(
        reward: number,
        callback: () => void,
        targetNode: cc.Node | null = null
    ): void {
        // 停止MegaWin循环音效
        SlotSoundController.Instance().stopAudio("MegaWin", "FXLoop");

        // 设置爆炸特效起始位置（优先使用目标节点坐标，否则居中）
        if (targetNode) {
            // 目标节点世界坐标 → 爆炸特效父节点本地坐标
            const worldPos = targetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
            const localPos = this.winExplodeCoin!.node.parent!.convertToNodeSpaceAR(worldPos);
            this.winExplodeCoin!.node.setPosition(localPos);
        } else {
            this.winExplodeCoin!.node.setPosition(cc.Vec2.ZERO);
        }

        // 设置收集特效位置（游戏大赢家金币目标节点 → 收集特效父节点本地坐标）
        const coinTargetWorldPos = SlotManager.Instance.getBigWinCoinTarget().convertToWorldSpaceAR(cc.Vec2.ZERO);
        const coinTargetLocalPos = this.winCoinCollectFx!.parent!.convertToNodeSpaceAR(coinTargetWorldPos);
        this.winCoinCollectFx!.setPosition(coinTargetLocalPos);

        // 构建特效执行序列：播放爆炸动画 → 分步触发音效 → 收集特效显隐 → 应用奖金 → 执行回调
        const explodeAction = cc.callFunc(() => {
            // 激活并播放爆炸动画
            this.winExplodeCoin!.node.active = true;
            this.winExplodeCoin!.stop();
            this.winExplodeCoin!.play();

            // 播放爆炸音效
            SlotSoundController.Instance().playAudio("BigWin_CoinBurst", "FX");

            // 延迟1.1秒播放金币移动音效
            this.scheduleOnce(() => {
                SlotSoundController.Instance().playAudio("BigWin_CoinBurstMove", "FX");
            }, 1.1);

            // 延迟1.35秒显示收集特效
            this.scheduleOnce(() => {
                this.winCoinCollectFx!.active = true;
            }, 1.35);

            // 延迟2.3秒隐藏收集特效
            this.scheduleOnce(() => {
                this.winCoinCollectFx!.active = false;
            }, 2.3);
        });

        // 执行完整特效序列
        this.node.runAction(cc.sequence(
            explodeAction,
            cc.delayTime(1.8), // 延迟1.8秒应用奖金
            cc.callFunc(() => {
                SlotManager.Instance.applyGameResultMoneyBySubFromResult(reward);
            }),
            cc.delayTime(1.2), // 延迟1.2秒执行回调
            cc.callFunc(() => {
                callback();
            })
        ));
    }
}