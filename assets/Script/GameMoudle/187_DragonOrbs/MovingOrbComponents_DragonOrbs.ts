import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SymbolAnimationController from "../../Slot/SymbolAnimationController";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import JackpotSymbol_DragonOrbs from "./JackpotSymbol_DragonOrbs";

const { ccclass, property } = cc._decorator;



/**
 * 龙珠游戏移动球组件
 * 管理龙珠预制体创建、移动动画序列、符号动画控制、回调触发等核心逻辑
 */
@ccclass('MovingOrbComponents_DragonOrbs')
export default class MovingOrbComponents_DragonOrbs extends cc.Component {
    // ===================== 序列化属性（与原JS一致） =====================
    /** 龙珠预制体数组（红/蓝/绿三种龙珠） */
    @property([cc.Prefab])
    public orbs: cc.Prefab[] = [];

    /** 免费旋转胜利预制体 */
    @property(cc.Prefab)
    public freeSpinWinPrefab: cc.Prefab | null = null;

    /** 龙珠移动目标节点列表（对应红/蓝/绿龙珠的终点） */
    @property([cc.Node])
    public targetList: cc.Node[] = [];

    /** 闲置节点层（龙珠闲置状态父节点） */
    @property(cc.Node)
    public idleNodeLayer: cc.Node = null;

    // ===================== 核心业务方法（与原JS逻辑1:1） =====================
    /**
     * 创建移动龙珠并执行移动动画序列
     * @param symbolId 符号ID（96/94/92对应红/蓝/绿龙珠）
     * @param reelIndex 滚轮索引（横向位置）
     * @param rowIndex 行索引（纵向位置）
     * @param orbIndex 龙珠类型索引（0=红/1=蓝/2=绿）
     * @param callback 移动完成后的回调函数
     */
    public createOrb(
        symbolId: number,
        reelIndex: number,
        rowIndex: number,
        orbIndex: number,
        callback: (symbolId: number) => void
    ): void {
        // 1. 实例化对应类型的龙珠预制体
        const orbPrefab = this.orbs[orbIndex];
        if (!TSUtility.isValid(orbPrefab)) return; // 预制体无效则直接返回
        
        const orbNode = cc.instantiate(orbPrefab);
        this.node.addChild(orbNode);

        // 2. 设置龙珠初始位置（基于滚轮/行索引计算）
        orbNode.x = 200 * (reelIndex - 1);
        orbNode.y = 148 * (1 - rowIndex);

        // 3. 播放符号动画（基础动画，ID偏移+300）
        SymbolAnimationController.Instance.playAnimationSymbol(
            reelIndex,
            rowIndex,
            symbolId + 300,
            null,
            null,
            false
        );

        // 4. 构建龙珠移动动画序列
        const moveSequence = cc.sequence(
            // 延迟0.25秒
            cc.delayTime(0.25),
            // 0.5秒移动到目标位置
            cc.moveTo(0.5, this.targetList[orbIndex].getPosition()),
            // 移动完成回调
            cc.callFunc(() => {
                // 移除龙珠节点
                if (TSUtility.isValid(orbNode)) {
                    orbNode.removeFromParent(true);
                }

                // 获取下一个子游戏状态
                const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
                // 非自动旋转模式 + base模式 → 播放闲置符号动画
                if (!SlotReelSpinStateManager.Instance.getAutospinMode() && nextSubGameKey === "base") {
                    // 释放原有符号动画
                    SymbolAnimationController.Instance.releaseAnimationSymbol_byKey(reelIndex, rowIndex);
                    // 播放闲置符号动画（ID偏移+200）并初始化Jackpot符号组件
                    const animNode = SymbolAnimationController.Instance.playAnimationSymbol(
                        reelIndex,
                        rowIndex,
                        symbolId + 200,
                        null,
                        null,
                        true
                    );
                    const jackpotSymbol = animNode?.getComponent(JackpotSymbol_DragonOrbs);
                    jackpotSymbol?.init();
                }

                // 触发外部回调
                callback(symbolId);
            })
        );

        // 5. 执行移动动画序列
        orbNode.runAction(moveSequence);
    }
}