import SlotSoundController from '../../../Slot/SlotSoundController';
import TSUtility from '../../../global_utility/TSUtility';
import SlotGameResultManager from '../../../manager/SlotGameResultManager';
import SlotGameRuleManager from '../../../manager/SlotGameRuleManager';
import BeeLovedJarsManager from '../BeeLovedJarsManager';
import FeaturePrizeComponent_BellLovedJars from './FeaturePrizeComponent_BellLovedJars';

const { ccclass, property } = cc._decorator;

/**
 * 结果符号信息接口（匹配getResultSymbolInfoArray返回的结构）
 */
interface ResultSymbolInfo {
    prize: number;
    prizeUnit: string; // 如"FixedCoin"表示固定金额
    [key: string]: any; // 兼容其他未定义字段
}

/**
 * BeeLovedJars 游戏奖品移动动画组件
 * 负责奖品预制体的实例化、移动动画、奖金计算/累加、音效播放、动画清理
 */
@ccclass('MovePrizeComponent_BeeLovedJars')
export default class MovePrizeComponent_BeeLovedJars extends cc.Component {
    // ===================== 核心节点/预制体配置 =====================
    // 奖品移动动画的父节点（承载所有实例化的奖品预制体）
    @property({
        type: cc.Node,
        displayName: "移动动画父节点",
        tooltip: "所有奖品移动预制体的挂载父节点"
    })
    move_Node: cc.Node | null = null;

    // 奖品移动预制体（单个奖品的显示/动画预制体）
    @property({
        type: cc.Prefab,
        displayName: "奖品移动预制体",
        tooltip: "实例化后用于播放移动动画的奖品预制体"
    })
    move_Prefab: cc.Prefab | null = null;

    // 奖品移动的目标节点（动画结束位置）
    @property({
        type: cc.Node,
        displayName: "移动目标节点",
        tooltip: "奖品移动动画的最终位置节点"
    })
    targetNode: cc.Node | null = null;

    // ===================== 位置计算常量 =====================
    // 单个奖品预制体的宽度（用于初始位置计算）
    private _width: number = 172;
    // 单个奖品预制体的高度（用于初始位置计算）
    private _height: number = 136;
    // 总奖金（预留字段，原代码未使用但保留）
    private _totalPrize: number = 0;

    /**
     * 播放奖品移动动画
     * @param row 符号所在行索引（用于计算初始X坐标）
     * @param col 符号所在列索引（用于计算初始Y坐标）
     * @param callback 动画结束后的回调函数（可选）
     */
    movePrize(row: number, col: number, callback?: (() => void) | null): void {
        // 空值检查：预制体/父节点/目标节点未配置时直接返回
        if (!this.move_Prefab || !this.move_Node || !this.move_Node.isValid || !this.targetNode) {
            console.warn("奖品移动动画配置不完整：预制体/父节点/目标节点未正确绑定");
            TSUtility.isValid(callback) && callback!(); // 兜底执行回调
            return;
        }

        // 1. 实例化奖品预制体并挂载到父节点
        const prizeNode = cc.instantiate(this.move_Prefab);
        this.move_Node.addChild(prizeNode);

        // 2. 计算预制体初始位置（基于行列索引+固定宽高）
        prizeNode.x = -2 * this._width + row * this._width;
        prizeNode.y = this._height - col * this._height;

        // 3. 获取目标节点位置
        const targetX = this.targetNode.x;
        const targetY = this.targetNode.y;

        // 4. 播放收集音效
        SlotSoundController.Instance()?.playAudio("Jackpot_Collect", "FX");

        // 5. 执行移动动画序列：延迟0.25s → 0.42s移动到目标 → 执行回调逻辑
        prizeNode.runAction(cc.sequence(
            cc.delayTime(0.25),
            cc.moveTo(0.42, targetX, targetY),
            cc.callFunc(() => {
                // 5.1 计算当前符号的奖金
                let prizeAmount = 0;
                const resultSymbolArray = SlotGameResultManager.Instance.getResultSymbolInfoArray();
                
                // 空值+边界检查：确保行列索引有效
                if (
                    Array.isArray(resultSymbolArray) && 
                    row >= 0 && row < resultSymbolArray.length &&
                    Array.isArray(resultSymbolArray[row]) &&
                    col >= 0 && col < resultSymbolArray[row].length
                ) {
                    const symbolInfo = resultSymbolArray[row][col] as ResultSymbolInfo | null;
                    if (TSUtility.isValid(symbolInfo)) {
                        const betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
                        // 固定金额（FixedCoin）直接用prize，否则用prize*每线投注额
                        prizeAmount = symbolInfo.prizeUnit === "FixedCoin" 
                            ? symbolInfo.prize 
                            : symbolInfo.prize * betPerLine;
                    }
                }

                // 5.2 累加奖金到FeaturePrize组件
                const gameManager = BeeLovedJarsManager.getInstance();
                if (
                    gameManager?.game_components?.featurePrizeComponent && 
                    gameManager.game_components.featurePrizeComponent.isValid
                ) {
                    const prizeComponent = gameManager.game_components.featurePrizeComponent.getComponent(FeaturePrizeComponent_BellLovedJars);
                    if (prizeComponent) {
                        prizeComponent.addPrzie(prizeAmount); // 原代码拼写addPrzie保留（避免修改调用）
                    }
                }

                // 5.3 执行动画结束回调
                TSUtility.isValid(callback) && callback!();
            })
        ));

        // 6. 延迟1秒销毁预制体（释放资源）
        this.scheduleOnce(() => {
            if (prizeNode && prizeNode.isValid) {
                prizeNode.removeFromParent(true); // true=销毁节点
            }
        }, 1);
    }

    /**
     * 清理所有奖品移动动画（移除所有子节点）
     */
    clearAllAnis(): void {
        if (this.move_Node && this.move_Node.isValid) {
            this.move_Node.removeAllChildren(true); // true=销毁所有子节点
        }
    }
}