
import SlotSoundController from "../../../../Script/Slot/SlotSoundController";
import TSUtility from "../../../../Script/global_utility/TSUtility";
import SlotGameResultManager from "../../../../Script/manager/SlotGameResultManager";
import JackpotSymbolComponent from "./JackpotSymbolComponent_Zhuquefortune";

// 符合 Cocos 2.4.x 原生写法：解构装饰器
const { ccclass, property } = cc._decorator;

/**
 * Lock N Roll 模式专属 Jackpot 移动收集组件
 * 负责 Lock 模式下 Jackpot 从起始坐标到目标坐标的移动动画、预制体管理、音效同步与状态清理
 */
@ccclass("LockMovePotComponent_Zhuquefortune")
export default class LockMovePotComponent_Zhuquefortune extends cc.Component {
    // ===== 序列化属性（编辑器绑定）=====
    // 承载移动预制体的父节点（所有实例化的 Jackpot 移动预制体都添加到该节点下）
    @property(cc.Node)
    public move_Node: cc.Node | null = null;

    // Jackpot 移动预制体数组（对应 5 种 Jackpot 类型：mini/minor/major/mega/grand）
    @property([cc.Prefab])
    public move_Prefabs: cc.Prefab[] = [];

    // ===== 私有常量属性（UI 布局固定参数）=====
    // 单个 Jackpot 符号的宽度（用于坐标计算）
    private _width: number = 152;

    // 单个 Jackpot 符号的高度（用于坐标计算）
    private _height: number = 138;

    /**
     * 执行 Lock 模式下 Jackpot 收集移动动画
     * @param targetPos 目标坐标信息（包含 col/row，用于计算移动终点）
     * @param startPos 起始坐标信息（包含 col/row，用于计算移动起点）
     * @param jackpotInfo Jackpot 信息（传递给预制体组件初始化）
     * @param moveCompleteCallback 单个 Jackpot 移动完成后的回调
     * @param overallCallback 整体动画（延迟0.5秒）完成后的回调
     */
    public moveJackpotCollect(
        targetPos: { col: number; row: number },
        startPos: { col: number; row: number },
        jackpotInfo: any,
        moveCompleteCallback?: (info: any) => void,
        overallCallback?: () => void
    ): void {
        // 1. 根据当前子游戏类型，匹配对应的移动预制体索引
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        let targetPrefabIndex = 0;

        switch (currentSubGameKey) {
            case "lockNRoll_mini":
                targetPrefabIndex = 0;
                break;
            case "lockNRoll_minor":
                targetPrefabIndex = 1;
                break;
            case "lockNRoll_major":
                targetPrefabIndex = 2;
                break;
            case "lockNRoll_mega":
                targetPrefabIndex = 3;
                break;
            case "lockNRoll_grand":
                targetPrefabIndex = 4;
                break;
            default:
                targetPrefabIndex = 0;
                cc.warn(`未知的子游戏类型：${currentSubGameKey}，默认使用索引 0 预制体`);
                break;
        }

        // 校验预制体有效性，避免索引越界或预制体未配置
        if (targetPrefabIndex >= this.move_Prefabs.length || !this.move_Prefabs[targetPrefabIndex]) {
            cc.warn(`索引 ${targetPrefabIndex} 对应的 Jackpot 预制体未配置，无法执行移动动画`);
            // 执行回调避免流程卡死
            if (TSUtility.isValid(moveCompleteCallback)) moveCompleteCallback!(jackpotInfo);
            if (TSUtility.isValid(overallCallback)) overallCallback!();
            return;
        }

        // 2. 实例化移动预制体，并添加到父节点
        const movePrefabInstance = cc.instantiate(this.move_Prefabs[targetPrefabIndex]);
        if (!this.move_Node) {
            cc.warn("移动预制体父节点未绑定，无法添加实例化预制体");
            movePrefabInstance.destroy();
            if (TSUtility.isValid(moveCompleteCallback)) moveCompleteCallback!(jackpotInfo);
            if (TSUtility.isValid(overallCallback)) overallCallback!();
            return;
        }
        this.move_Node.addChild(movePrefabInstance);

        // 3. 计算预制体初始坐标（基于起始 col/row 与固定 UI 尺寸）
        const startX = -2 * this._width + startPos.col * this._width;
        const startY = this._height - startPos.row * this._height;
        movePrefabInstance.setPosition(startX, startY);

        // 4. 初始化预制体上的 Jackpot 组件信息
        const jackpotSymbolComp = movePrefabInstance.getComponent(JackpotSymbolComponent);
        if (!jackpotSymbolComp) {
            cc.warn("移动预制体未挂载 JackpotSymbolComponent，无法初始化 Jackpot 信息");
            movePrefabInstance.destroy();
            if (TSUtility.isValid(moveCompleteCallback)) moveCompleteCallback!(jackpotInfo);
            if (TSUtility.isValid(overallCallback)) overallCallback!();
            return;
        }
        jackpotSymbolComp.setInfo(jackpotInfo);

        // 5. 计算预制体目标坐标（基于目标 col/row 与固定 UI 尺寸）
        const targetX = -2 * this._width + targetPos.col * this._width;
        const targetY = this._height - targetPos.row * this._height;

        // 6. 播放 Jackpot 收集音效
        SlotSoundController.Instance().playAudio("JackpotCollect", "FX");

        // 7. 执行移动动画序列：延迟0.08秒 → 移动0.92秒 → 执行移动完成回调
        movePrefabInstance.runAction(cc.sequence(
            cc.delayTime(0.08),
            cc.moveTo(0.92, targetX, targetY),
            cc.callFunc(() => {
                if (TSUtility.isValid(moveCompleteCallback)) {
                    moveCompleteCallback!(jackpotInfo);
                }
            })
        ));

        // 8. 延迟0.5秒执行整体回调（协调整体流程时序）
        this.scheduleOnce(() => {
            if (TSUtility.isValid(overallCallback)) {
                overallCallback!();
            }
        }, 0.5);
    }

    /**
     * 清理所有 Lock 模式 Jackpot 移动预制体（重置组件状态，避免内存泄漏）
     */
    public clearAllAnis(): void {
        // 移除所有子节点并强制清理资源
        this.move_Node?.removeAllChildren(true);
    }
}