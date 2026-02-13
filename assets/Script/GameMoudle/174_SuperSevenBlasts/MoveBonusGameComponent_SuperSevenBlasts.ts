import SlotSoundController from "../../Slot/SlotSoundController";

const { ccclass, property } = cc._decorator;

/**
 * 超级七爆炸游戏的奖励移动组件
 * 负责 jackpot 符号的移动动画和清理
 */
@ccclass('MoveBonusGameComponent_SuperSevenBlasts')
export default class MoveBonusGameComponent_SuperSevenBlasts extends cc.Component {
    // 挂载移动节点的父节点（对应原JS的moveNode）
    @property({ type: cc.Node, displayName: "移动节点容器" })
    public moveNode: cc.Node = null!;

    // 移动的预制体（对应原JS的movePrefab）
    @property({ type: cc.Prefab, displayName: "移动符号预制体" })
    public movePrefab: cc.Prefab = null!;

    // 符号的宽高（原JS中定义的固定值）
    private readonly width: number = 112;
    private readonly height: number = 118;

    /**
     * 播放Jackpot符号移动动画
     * @param startX 起始X坐标（符号列索引）
     * @param startY 起始Y坐标（符号行索引）
     * @param targetX 目标X坐标（符号列索引）
     * @param targetY 目标Y坐标（符号行索引）
     */
    public moveJackpotSymbol(startX: number, startY: number, targetX: number, targetY: number): void {
        // 播放移动音效
        SlotSoundController.Instance().playAudio("BonusMove", "FX");
        // 清空所有未完成的回调
        this.unscheduleAllCallbacks();

        // 实例化预制体并添加到容器节点
        const moveItem = cc.instantiate(this.movePrefab);
        this.moveNode.addChild(moveItem);
        
        // 计算起始坐标（基于符号宽高）
        moveItem.x = startX * this.width;
        moveItem.y = startY * -this.height;

        // 计算目标坐标
        const targetPosX = targetX * this.width;
        const targetPosY = targetY * -this.height;

        // 执行移动动画（0.83秒，带回退缓动）
        moveItem.runAction(cc.moveTo(0.83, targetPosX, targetPosY).easing(cc.easeBackIn()));
    }

    /**
     * 清除所有移动动画节点
     */
    public clearAllAnis(): void {
        this.moveNode.removeAllChildren(true);
    }
}