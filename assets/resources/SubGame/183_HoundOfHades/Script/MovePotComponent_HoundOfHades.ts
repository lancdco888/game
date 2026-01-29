import HoundOfHadesManager from "./HoundOfHadesManager";

const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - 移动奖励罐组件
 * 负责控制红绿蓝三种符号（ID:61=绿/62=红/63=蓝）的移动动画、预制体实例化和动画清理
 */
@ccclass()
export default class MovePotComponent_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 移动动画根节点（所有符号预制体的父节点） */
    @property(cc.Node)
    public move_Node: cc.Node | null = null;

    /** 蓝色符号目标节点（动画终点） */
    @property(cc.Node)
    public blue_Node: cc.Node | null = null;

    /** 红色符号目标节点（动画终点） */
    @property(cc.Node)
    public red_Node: cc.Node | null = null;

    /** 绿色符号目标节点（动画终点） */
    @property(cc.Node)
    public green_Node: cc.Node | null = null;

    /** 蓝色符号预制体 */
    @property(cc.Prefab)
    public blue_Prefab: cc.Prefab | null = null;

    /** 红色符号预制体 */
    @property(cc.Prefab)
    public red_Prefab: cc.Prefab | null = null;

    /** 绿色符号预制体 */
    @property(cc.Prefab)
    public green_Prefab: cc.Prefab | null = null;

    // ====== 私有常量（符号尺寸，原代码硬编码值） ======
    /** 符号宽度 */
    private readonly _width: number = 160;
    /** 符号高度 */
    private readonly _height: number = 128;

    // ====== 核心方法 ======
    /**
     * 播放符号移动动画
     * @param symbolId 符号ID（61=绿/62=红/63=蓝，其他ID直接返回）
     * @param col 列索引（用于计算初始X坐标）
     * @param row 行索引（用于计算初始Y坐标）
     */
    moveSymbol(symbolId: number, col: number, row: number): void {
        // 1. 安全检查：核心节点/预制体未配置则直接返回
        if (!this.move_Node) {
            console.warn("MovePotComponent: move_Node 未配置！");
            return;
        }

        // 2. 根据符号ID匹配对应的预制体和目标节点
        let targetPrefab: cc.Prefab | null = null;
        let targetNode: cc.Node | null = null;
        const currentSymbolId = symbolId; // 保存当前ID（避免回调中e值变化）

        switch (symbolId) {
            case 61: // 绿色符号
                targetPrefab = this.green_Prefab;
                targetNode = this.green_Node;
                break;
            case 62: // 红色符号
                targetPrefab = this.red_Prefab;
                targetNode = this.red_Node;
                break;
            case 63: // 蓝色符号
                targetPrefab = this.blue_Prefab;
                targetNode = this.blue_Node;
                break;
            default: // 非目标符号直接返回
                console.log(`MovePotComponent: 不支持的符号ID ${symbolId}，跳过动画`);
                return;
        }

        // 3. 预制体/目标节点为空则返回
        if (!targetPrefab || !targetNode) {
            console.warn(`MovePotComponent: 符号ID ${symbolId} 对应的预制体/目标节点未配置！`);
            return;
        }

        // 4. 实例化符号预制体并设置初始位置
        const symbolNode = cc.instantiate(targetPrefab);
        this.move_Node.addChild(symbolNode);

        // 初始坐标计算：-2*宽度 + 列索引*宽度 | 高度 - 行索引*高度
        symbolNode.setPosition(
            -2 * this._width + col * this._width,
            this._height - row * this._height
        );

        // 5. 运行移动动画（0.6秒移动到目标位置 → 触发Hit回调 → 2秒后移除节点）
        const targetPos = new cc.Vec2(targetNode.x, targetNode.y);
        symbolNode.runAction(
            cc.sequence(
                cc.moveTo(0.6, targetPos), // 0.6秒移动到目标位置
                cc.callFunc(() => {
                    // 动画完成后触发对应颜色的Hit事件
                    const gameManager = HoundOfHadesManager.getInstance();
                    if (gameManager?.game_components?._houndsComponent) {
                        switch (currentSymbolId) {
                            case 61:
                                gameManager.game_components._houndsComponent.setGreenHit();
                                break;
                            case 62:
                                gameManager.game_components._houndsComponent.setRedHit();
                                break;
                            case 63:
                                gameManager.game_components._houndsComponent.setBlueHit();
                                break;
                        }
                    } else {
                        console.warn("MovePotComponent: HoundOfHadesManager 或 _houndsComponent 未初始化！");
                    }
                })
            )
        );

        // 6. 2秒后移除动画节点（释放资源）
        this.scheduleOnce(() => {
            if (symbolNode.isValid) { // 检查节点有效性，避免重复移除
                symbolNode.removeFromParent(true);
            }
        }, 2);
    }

    /**
     * 清理所有移动动画节点（移除move_Node下的所有子节点）
     */
    clearAllAnis(): void {
        if (this.move_Node) {
            this.move_Node.removeAllChildren(true); // true表示同时销毁节点
            console.log("MovePotComponent: 已清理所有移动动画节点");
        } else {
            console.warn("MovePotComponent: move_Node 未配置，无法清理动画节点！");
        }
    }
}