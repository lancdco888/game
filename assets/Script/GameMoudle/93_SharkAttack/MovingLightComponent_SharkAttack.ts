import SlotSoundController from "../../Slot/SlotSoundController";
import { BottomTextType } from "../../SubGame/BottomUIText";
import LangLocaleManager from "../../manager/LangLocaleManager";
import SlotManager from "../../manager/SlotManager";

const { ccclass, property } = cc._decorator;

/**
 * 鲨鱼攻击游戏移动光效组件
 * 负责处理奖金收集、Wild倍数收集的光效移动动画，包含位置计算、音效播放、底部UI奖金更新逻辑
 */
@ccclass('MovingLightComponent_SharkAttack')
export default class MovingLightComponent_SharkAttack extends cc.Component {
    // 光效根节点（用于控制移动的核心节点）
    @property({ type: cc.Node })
    root: cc.Node = null!;

    // 符号宽度（用于光效初始位置计算）
    private symbolWidth: number = 176;

    // 符号高度（用于光效初始位置计算）
    private symbolHeight: number = 140;

    /**
     * 播放奖金收集光效动画
     * @param reelIndex 滚轮索引
     * @param rowIndex 行索引
     * @param scale 缩放比例（适配不同滚轮行数）
     * @param targetNode 目标位置节点（底部奖金标签）
     * @param winMoney 中奖金额
     * @param callback 动画完成后的回调函数
     */
    playCollectPrize(
        reelIndex: number, 
        rowIndex: number, 
        scale: number, 
        targetNode: cc.Node, 
        winMoney: number, 
        callback: () => void
    ): void {
        // 计算光效初始位置（基于滚轮/行索引和缩放比例）
        const initX = (reelIndex - 2) * this.symbolWidth * scale;
        const initY = 710 * scale - rowIndex * this.symbolHeight * scale;

        // 激活节点并设置初始位置
        this.node.active = true;
        this.root.setPosition(initX, initY);

        // 获取目标节点坐标
        const targetX = targetNode.x;
        const targetY = targetNode.y;

        // 播放奖金收集音效
        SlotSoundController.Instance().playAudio("JackpotCollect", "FX");

        // 构建移动动画序列：移动到目标位置 → 执行回调逻辑
        const moveSequence = cc.sequence(
            cc.moveTo(0.3, targetX, targetY).easing(cc.easeIn(2)),
            cc.callFunc(() => {
                // 更新底部UI文本（WIN文案 + 中奖金额）
                const winText = LangLocaleManager.getInstance().getLocalizedText("WIN");
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, winText.text);
                SlotManager.Instance.bottomUIText.setWinMoney(winMoney);

                // 计算动画剩余时长，延迟隐藏节点
                const animComp = this.node.getComponent(cc.Animation)!;
                const defaultClip = animComp.defaultClip;
                const remainingTime = defaultClip.duration - animComp.getAnimationState(defaultClip.name).time;
                
                this.scheduleOnce(() => {
                    this.node.active = false;
                }, remainingTime);

                // 执行外部回调
                callback();
            })
        );

        this.root.runAction(moveSequence);
    }

    /**
     * 播放Wild倍数收集光效动画
     * @param reelIndex 滚轮索引
     * @param rowIndex 行索引
     * @param scale 缩放比例（适配不同滚轮行数）
     * @param targetNode 目标位置节点（底部奖金标签）
     * @param winMoney 中奖金额（含倍数）
     * @param callback 动画完成后的回调函数
     */
    playCollectWildMultiplier(
        reelIndex: number, 
        rowIndex: number, 
        scale: number, 
        targetNode: cc.Node, 
        winMoney: number, 
        callback: () => void
    ): void {
        // 计算光效初始位置（基于滚轮/行索引和缩放比例）
        const initX = (reelIndex - 2) * this.symbolWidth * scale;
        const initY = 710 * scale - rowIndex * this.symbolHeight * scale;

        // 激活节点并设置初始位置
        this.node.active = true;
        this.root.setPosition(initX, initY);

        // 获取目标节点坐标
        const targetX = targetNode.x;
        const targetY = targetNode.y;

        // 播放倍数应用音效
        SlotSoundController.Instance().playAudio("ApplyMultiplier", "FX");

        // 播放光效自身动画
        this.root.getComponent(cc.Animation)!.play();

        // 构建动画序列：延迟0.5秒 → 移动到目标位置 → 执行回调逻辑
        const moveSequence = cc.sequence(
            cc.delayTime(0.5),
            cc.moveTo(0.3, targetX, targetY).easing(cc.easeIn(2)),
            cc.callFunc(() => {
                // 更新底部UI文本（WIN文案 + 含倍数的中奖金额）
                const winText = LangLocaleManager.getInstance().getLocalizedText("WIN");
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, winText.text);
                SlotManager.Instance.bottomUIText.setWinMoney(winMoney);

                // 执行外部回调
                callback();
            })
        );

        this.root.runAction(moveSequence);
    }
}