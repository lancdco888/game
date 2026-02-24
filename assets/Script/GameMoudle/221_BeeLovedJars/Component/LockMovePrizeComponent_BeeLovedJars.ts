import SlotSoundController from "../../../Slot/SlotSoundController";
import TSUtility from "../../../global_utility/TSUtility";
import { Cell } from "../../../manager/SlotGameResultManager";
import { SymbolInfo } from "../../../manager/SymbolPoolManager";

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏 Jackpot 收集移动组件
 * 负责Jackpot收集时预制体的移动动画、音效播放、坐标计算、回调执行等逻辑
 */
@ccclass('LockMovePrizeComponent_BeeLovedJars')
export default class LockMovePrizeComponent_BeeLovedJars extends cc.Component {
    // 移动动画根节点（预制体父节点）
    @property({
        type: cc.Node,
        displayName: "移动动画根节点",
        tooltip: "Jackpot收集时移动预制体的父节点"
    })
    move_Node: cc.Node | null = null;

    // 移动预制体（收集时的动画预制体）
    @property({
        type: cc.Prefab,
        displayName: "移动预制体",
        tooltip: "Jackpot收集时从源位置移动到目标位置的预制体"
    })
    move_Prefabs: cc.Prefab | null = null;

    // 符号宽度（用于坐标计算）
    private _width: number = 172;
    // 符号高度（用于坐标计算）
    private _height: number = 136;

    /**
     * 执行Jackpot收集的移动动画
     * @param targetCell 目标单元格（移动终点）
     * @param sourceCell 源单元格（移动起点）
     * @param symbolInfo 符号奖励信息
     * @param prizeCallback 奖励更新回调（动画到达终点时执行）
     * @param completeCallback 整体完成回调（延迟0.5秒执行）
     */
    moveJackPrizeCollect(
        targetCell: Cell,
        sourceCell: Cell,
        symbolInfo: SymbolInfo,
        prizeCallback?: (info: SymbolInfo) => void,
        completeCallback?: () => void
    ): void {
        // 空值安全检查：核心节点/预制体缺失时直接执行完成回调
        if (!this.move_Node || !this.move_Prefabs) {
            if (TSUtility.isValid(completeCallback)) completeCallback!();
            return;
        }

        // 1. 实例化移动预制体并添加到根节点
        const movePrefabNode = cc.instantiate(this.move_Prefabs);
        this.move_Node.addChild(movePrefabNode);

        // 2. 计算源位置坐标（起点）
        const sourceX = -2 * this._width + sourceCell.col * this._width;
        const sourceY = this._height - sourceCell.row * this._height;
        movePrefabNode.setPosition(new cc.Vec3(sourceX, sourceY, 0));

        // 3. 计算目标位置坐标（终点）
        const targetX = -2 * this._width + targetCell.col * this._width;
        const targetY = this._height - targetCell.row * this._height;

        // 4. 播放收集音效
        SlotSoundController.Instance().playAudio("Jackpot_Collect", "FX");

        // 5. 构建动画序列：延迟0.25秒 → 移动0.42秒到目标位置 → 执行奖励回调
        const animationSequence = cc.sequence(
            cc.delayTime(0.25),
            cc.moveTo(0.42, new cc.Vec2(targetX, targetY)),
            cc.callFunc(() => {
                // 执行奖励更新回调（确保回调有效）
                if (TSUtility.isValid(prizeCallback)) {
                    prizeCallback!(symbolInfo);
                }
            })
        );
        movePrefabNode.runAction(animationSequence);

        // 6. 延迟0.5秒执行整体完成回调
        this.scheduleOnce(() => {
            if (TSUtility.isValid(completeCallback)) {
                completeCallback!();
            }
        }, 0.5);

        // 7. 延迟1秒移除预制体（避免节点残留）
        this.scheduleOnce(() => {
            if (movePrefabNode.isValid) {
                movePrefabNode.removeFromParent(true);
            }
        }, 1);
    }
}