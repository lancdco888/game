import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";

const { ccclass, property } = cc._decorator;

/**
 * 符号类型ID枚举（匹配原代码中的魔法数值）
 */
export enum SymbolTypeId {
    // 绿色符号ID
    GREEN = 61,
    GREEN_ALT = 161,
    // 红色符号ID
    RED = 62,
    RED_ALT = 162,
    // 蓝色符号ID
    BLUE = 63,
    BLUE_ALT = 163,
    // Jackpot符号ID
    JACKPOT = 91,
    JACKPOT_ALT = 191
}

/**
 * 哈迪斯之犬 - 符号移动组件（核心处理绿色符号，兼容红/蓝/Jackpot）
 * 核心职责：
 * 1. 根据符号类型ID匹配对应预制体
 * 2. 计算符号移动的起始/目标位置
 * 3. 播放符号移动缓动动画并播放音效
 * 4. 清理所有已生成的移动特效节点
 */
@ccclass()
export default class MoveGreen_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 移动特效挂载的父节点 */
    @property(cc.Node)
    public move_Node: cc.Node = null;

    /** Jackpot符号预制体 */
    @property(cc.Prefab)
    public jackpot_Prefab: cc.Prefab = null;

    /** 蓝色符号预制体 */
    @property(cc.Prefab)
    public blue_Prefab: cc.Prefab = null;

    /** 红色符号预制体 */
    @property(cc.Prefab)
    public red_Prefab: cc.Prefab = null;

    /** 绿色符号预制体 */
    @property(cc.Prefab)
    public green_Prefab: cc.Prefab = null;

    // ====== 私有常量（位置计算基准值，原代码硬编码） ======
    /** 符号宽度（位置计算） */
    private readonly _width: number = 160;
    /** 符号高度（位置计算） */
    private readonly _height: number = 128;

    // ====== 核心方法 ======
    /**
     * 播放符号移动动画
     * @param startCol 起始列索引（计算起始X坐标）
     * @param startRow 起始行索引（计算起始Y坐标）
     * @param targetCol 目标列索引（计算目标X坐标）
     * @param targetRow 目标行索引（计算目标Y坐标）
     * @param symbolTypeId 符号类型ID（61/161=绿，62/162=红，63/163=蓝，91/191=Jackpot）
     * @param callback 动画完成后的回调
     */
    moveSymbol(
        startCol: number, 
        startRow: number, 
        targetCol: number, 
        targetRow: number, 
        symbolTypeId: number, 
        callback?: () => void
    ): void {
        // 1. 基础参数校验
        const paramInvalid = [startCol, startRow, targetCol, targetRow, symbolTypeId].some(v => typeof v !== 'number' || isNaN(v));
        if (paramInvalid) {
            console.warn("MoveGreenComponent: 行列/符号类型ID必须为有效数字！");
            TSUtility.isValid(callback) && callback!();
            return;
        }
        if (!this.move_Node) {
            console.warn("MoveGreenComponent: move_Node未配置！");
            TSUtility.isValid(callback) && callback!();
            return;
        }

        // 2. 根据符号类型ID匹配对应预制体
        let targetPrefab: cc.Prefab = null;
        switch (symbolTypeId) {
            case SymbolTypeId.GREEN:
            case SymbolTypeId.GREEN_ALT:
                targetPrefab = this.green_Prefab;
                break;
            case SymbolTypeId.RED:
            case SymbolTypeId.RED_ALT:
                targetPrefab = this.red_Prefab;
                break;
            case SymbolTypeId.BLUE:
            case SymbolTypeId.BLUE_ALT:
                targetPrefab = this.blue_Prefab;
                break;
            case SymbolTypeId.JACKPOT:
            case SymbolTypeId.JACKPOT_ALT:
                targetPrefab = this.jackpot_Prefab;
                break;
            default:
                // 未知符号类型，直接执行回调
                console.warn(`MoveGreenComponent: 未知符号类型ID ${symbolTypeId}！`);
                TSUtility.isValid(callback) && callback!();
                return;
        }

        // 3. 预制体有效性校验
        if (!targetPrefab) {
            console.warn(`MoveGreenComponent: 符号类型ID ${symbolTypeId} 对应的预制体未配置！`);
            TSUtility.isValid(callback) && callback!();
            return;
        }

        // 4. 计算目标位置
        const targetPos = new cc.Vec2(
            -2 * this._width + targetCol * this._width,
            this._height - targetRow * this._height
        );

        // 5. 实例化预制体并设置起始位置
        const symbolNode = cc.instantiate(targetPrefab);
        if (!symbolNode) {
            console.warn("MoveGreenComponent: 实例化符号预制体失败！");
            TSUtility.isValid(callback) && callback!();
            return;
        }

        // 添加到父节点
        this.move_Node.addChild(symbolNode);

        // 设置起始位置
        symbolNode.setPosition(
            -2 * this._width + startCol * this._width,
            this._height - startRow * this._height
        );

        // 6. 播放移动动画（1秒时长，BackIn缓动）
        symbolNode.runAction(
            cc.moveTo(1, targetPos).easing(cc.easeBackIn())
        );

        // 7. 播放移动音效
        SlotSoundController.Instance().playAudio("Bonus3", "FX");

        // 8. 1秒后执行回调（动画完成）
        this.scheduleOnce(() => {
            TSUtility.isValid(callback) && callback!();
        }, 1);
    }

    /**
     * 清理所有已生成的移动特效节点（递归销毁）
     */
    clearAllAnis(): void {
        if (this.move_Node) {
            // true表示递归销毁所有子节点，避免内存泄漏
            this.move_Node.removeAllChildren(true);
        } else {
            console.warn("MoveGreenComponent: move_Node未配置，无法清理特效节点！");
        }
    }
}