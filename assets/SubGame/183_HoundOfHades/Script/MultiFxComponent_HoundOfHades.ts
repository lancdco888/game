const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - 倍数特效组件
 * 核心职责：
 * 1. 生成红色符号移动特效并播放位置移动动画
 * 2. 清理所有已生成的特效节点
 */
@ccclass('MultiFxComponent_HoundOfHades')
export default class MultiFxComponent_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 移动特效预制体 */
    @property(cc.Prefab)
    public move_Prefab: cc.Prefab = null;

    /** 特效节点挂载的父节点 */
    @property(cc.Node)
    public move_Node: cc.Node = null;

    // ====== 私有常量（位置计算参数，原代码硬编码值） ======
    /** 符号宽度（位置计算基准） */
    private readonly _Width: number = 160;
    /** 符号高度（位置计算基准） */
    private readonly _Height: number = 128;

    // ====== 核心方法 ======
    /**
     * 播放红色符号移动到目标位置的特效
     * @param col 列索引（用于计算初始X坐标）
     * @param row 行索引（用于计算初始Y坐标）
     */
    playRedMoveTartget(col: number, row: number): void {
        // 安全校验：预制体/父节点未配置时直接返回
        if (!this.move_Prefab || !this.move_Node) {
            console.warn("MultiFxComponent: move_Prefab或move_Node未配置！");
            return;
        }
        // 安全校验：行列参数非数字时返回
        if (typeof col !== 'number' || isNaN(col) || typeof row !== 'number' || isNaN(row)) {
            console.warn("MultiFxComponent: col和row必须为有效数字！");
            return;
        }

        // 实例化移动特效预制体
        const fxNode = cc.instantiate(this.move_Prefab);
        if (!fxNode) {
            console.warn("MultiFxComponent: 实例化move_Prefab失败！");
            return;
        }

        // 将特效节点添加到父节点
        this.move_Node.addChild(fxNode);

        // 计算特效初始位置
        fxNode.x = -2 * this._Width + this._Width * col;
        fxNode.y = this._Height - this._Height * row;

        // 播放移动动画：延迟0.33秒 → 0.83秒内移动到(0, 0)
        fxNode.runAction(cc.sequence(
            cc.delayTime(0.33),
            cc.moveTo(0.83, 0, 0)
        ));
    }

    /**
     * 清理所有已生成的特效节点（包含递归清理子节点）
     */
    clearAllAnis(): void {
        if (this.move_Node) {
            // 移除所有子节点并销毁（true表示递归销毁子节点）
            this.move_Node.removeAllChildren(true);
        } else {
            console.warn("MultiFxComponent: move_Node未配置，无法清理特效节点！");
        }
    }
}