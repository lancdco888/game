import TSUtility from "../../global_utility/TSUtility";

// 调整点 1：使用 cc._decorator 解构装饰器（符合 Cocos 2.4.x 原生写法）
const { ccclass, property } = cc._decorator;

/**
 * 朱雀运势 Jackpot 模式硬币移动组件
 * 负责处理硬币移动动画、预制体实例化与清理，实现选中硬币到目标节点的移动效果
 */
@ccclass("MoveJackpotModeCoin_Zhuquefortune")
export default class MoveJackpotModeCoin_Zhuquefortune extends cc.Component {
    // 第1组目标节点数组（对应 Jackpot 类型 3）- 直接使用 cc.Node
    @property([cc.Node])
    public first_Nodes: cc.Node[] = [];

    // 第2组目标节点数组（对应 Jackpot 类型 2）- 直接使用 cc.Node
    @property([cc.Node])
    public second_Nodes: cc.Node[] = [];

    // 第3组目标节点数组（对应 Jackpot 类型 1）- 直接使用 cc.Node
    @property([cc.Node])
    public third_Nodes: cc.Node[] = [];

    // 第4组目标节点数组（对应 Jackpot 类型 0）- 直接使用 cc.Node
    @property([cc.Node])
    public fourth_Nodes: cc.Node[] = [];

    // 12 个硬币节点数组（记录硬币初始位置）- 直接使用 cc.Node
    @property([cc.Node])
    public coin_Nodes: cc.Node[] = [];

    // 移动动画根节点（用于承载实例化的移动预制体）- 直接使用 cc.Node
    @property(cc.Node)
    public move_Node: cc.Node | null = null;

    // 移动硬币预制体（实例化后播放移动动画）- 直接使用 cc.Prefab
    @property(cc.Prefab)
    public move_Prefab: cc.Prefab | null = null;

    /**
     * 播放硬币移动动画（实例化预制体、从硬币位置移动到目标节点、完成后回调并清理预制体）
     * @param coinIndex 硬币索引（0-11，对应 coin_Nodes 数组）
     * @param jackpotType Jackpot 类型（0-3，对应四组目标节点）
     * @param targetNodeIndex 目标节点在对应数组中的索引
     * @param onComplete 移动完成后的回调函数
     */
    public moveSymbol(coinIndex: number, jackpotType: number, targetNodeIndex: number, onComplete?: () => void): void {
        // 1. 前置校验：防止关键资源为空导致报错
        if (!this.move_Node || !this.move_Prefab || coinIndex >= this.coin_Nodes.length) {
            cc.warn("硬币移动所需资源不完整或索引越界，无法执行移动动画");
            if (TSUtility.isValid(onComplete)) onComplete!();
            return;
        }

        // 2. 根据 Jackpot 类型选择对应的目标节点数组，获取目标节点
        let targetNode: cc.Node | null = null;
        switch (jackpotType) {
            case 3:
                targetNode = this.first_Nodes[targetNodeIndex] || null;
                break;
            case 2:
                targetNode = this.second_Nodes[targetNodeIndex] || null;
                break;
            case 1:
                targetNode = this.third_Nodes[targetNodeIndex] || null;
                break;
            case 0:
            default:
                targetNode = this.fourth_Nodes[targetNodeIndex] || null;
                break;
        }

        if (!targetNode) {
            cc.warn(`Jackpot 类型 ${jackpotType} 对应的目标节点索引 ${targetNodeIndex} 不存在`);
            if (TSUtility.isValid(onComplete)) onComplete!();
            return;
        }

        // 3. 获取目标位置和硬币初始位置（使用 cc.Vec2）
        const targetPos = new cc.Vec2(targetNode.position.x, targetNode.position.y);
        const coinNode = this.coin_Nodes[coinIndex];
        const startPos = new cc.Vec2(coinNode.position.x, coinNode.position.y);

        // 4. 实例化移动预制体，设置初始位置并添加到根节点（使用 cc.instantiate）
        const movePrefabInstance = cc.instantiate(this.move_Prefab);
        if (!movePrefabInstance) {
            cc.warn("无法实例化移动硬币预制体");
            if (TSUtility.isValid(onComplete)) onComplete!();
            return;
        }

        this.move_Node.addChild(movePrefabInstance);
        movePrefabInstance.setPosition(startPos);

        // 5. 播放移动动画序列（使用 cc. 前缀的动作，符合 Cocos 2.4.x 原生写法）
        const moveAction = cc.moveTo(0.5, targetPos); // 0.5 秒移动到目标位置
        const callbackAction = cc.callFunc(() => {
            // 执行移动完成回调
            if (TSUtility.isValid(onComplete)) onComplete!();
        });

        const moveSequence = cc.sequence(moveAction, callbackAction);
        movePrefabInstance.runAction(moveSequence);

        // 6. 延迟 1.1 秒移除实例化的预制体，释放资源（使用 cc.scheduleOnce）
        this.scheduleOnce(() => {
            if (movePrefabInstance && movePrefabInstance.parent) {
                movePrefabInstance.removeFromParent(true);
            }
        }, 1.1);
    }

    /**
     * 清理所有移动动画预制体（移除 move_Node 下的所有子节点）
     */
    public clearAllAnis(): void {
        if (this.move_Node) {
            this.move_Node.removeAllChildren(true);
        }
    }
}