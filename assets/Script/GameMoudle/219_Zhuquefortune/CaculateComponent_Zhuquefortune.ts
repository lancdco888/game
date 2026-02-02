import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import JackpotSymbolComponent from "./JackpotSymbolComponent_Zhuquefortune";

// 符合 Cocos 2.4.x 原生写法：解构装饰器
const { ccclass, property } = cc._decorator;

/**
 * Jackpot 结算收集组件
 * 负责 Jackpot 收集时的移动动画、特效播放、预制体实例化，以及后续的动画清理工作
 */
@ccclass()
export default class CaculateComponent_Zhuquefortune extends cc.Component {
    // ===== 序列化属性（编辑器绑定）=====
    // 承载移动预制体的父节点（所有实例化的移动预制体都添加到该节点下）
    @property(cc.Node)
    public move_Node: cc.Node | null = null;

    // Jackpot 收集激活特效节点（播放收集完成特效）
    @property(cc.Node)
    public alive_FX: cc.Node | null = null;

    // 移动预制体数组（对应 5 种 Jackpot 类型：mini/minor/major/mega/grand）
    @property([cc.Prefab])
    public move_Prefabs: cc.Prefab[] = [];

    /**
     * 执行 Jackpot 收集移动与结算动画
     * @param targetNode 目标符号节点（收集的起始节点，用于获取初始坐标）
     * @param jackpotInfo Jackpot 信息（传递给预制体组件初始化）
     * @param callback 动画完成后的回调函数
     */
    public moveJackpotCalculate(
        targetNode: cc.Node,
        jackpotInfo: any,
        callback?: () => void
    ): void {
        const self = this;

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

        // 校验预制体数组有效性，避免索引越界
        if (targetPrefabIndex >= this.move_Prefabs.length || !this.move_Prefabs[targetPrefabIndex]) {
            cc.warn(`索引 ${targetPrefabIndex} 对应的移动预制体未配置，无法执行收集动画`);
            if (TSUtility.isValid(callback)) callback!();
            return;
        }

        // 2. 坐标转换：将目标节点世界坐标转换为激活特效节点的本地坐标（作为预制体初始位置）
        const targetWorldPos = targetNode.parent.convertToWorldSpaceAR(targetNode.getPosition());
        const targetLocalPos = this.alive_FX?.parent.convertToNodeSpaceAR(targetWorldPos) || cc.Vec2.ZERO;

        // 3. 实例化移动预制体，并添加到 move_Node 下
        const movePrefabInstance = cc.instantiate(this.move_Prefabs[targetPrefabIndex]);
        if (!this.move_Node) {
            cc.warn("移动预制体父节点未绑定，无法添加实例化预制体");
            movePrefabInstance.destroy();
            if (TSUtility.isValid(callback)) callback!();
            return;
        }
        this.move_Node.addChild(movePrefabInstance);
        movePrefabInstance.setPosition(targetLocalPos);

        // 4. 获取预制体上的 Jackpot 组件，初始化信息
        const jackpotSymbolComp = movePrefabInstance.getComponent(JackpotSymbolComponent);
        if (!jackpotSymbolComp) {
            cc.warn("移动预制体未挂载 JackpotSymbolComponent，无法初始化信息");
            movePrefabInstance.destroy();
            if (TSUtility.isValid(callback)) callback!();
            return;
        }
        jackpotSymbolComp.setInfo(jackpotInfo);

        // 5. 播放 Jackpot 收集音效
        SlotSoundController.Instance().playAudio("JackpotCollect", "FX");

        // 6. 分步执行动画：0.08秒后播放移动动画，1秒后播放激活特效
        // 步骤1：0.08秒延迟后，播放预制体移动动画（移动到目标坐标 (0, -270)，耗时 0.92 秒）
        this.scheduleOnce(() => {
            movePrefabInstance.runAction(cc.moveTo(0.92, 0, -270));
        }, 0.08);

        // 步骤2：1秒延迟后，播放激活特效动画，执行回调
        this.scheduleOnce(() => {
            // 激活并重置播放特效动画
            if (self.alive_FX) {
                self.alive_FX.active = true;
                const fxAnimation = self.alive_FX.getComponent(cc.Animation);
                if (fxAnimation) {
                    fxAnimation.stop();
                    fxAnimation.play();
                    fxAnimation.setCurrentTime(0);
                }
            }

            // 执行回调函数
            if (TSUtility.isValid(callback)) {
                callback!();
            }
        }, 1);
    }

    /**
     * 清理所有 Jackpot 收集相关动画与预制体（重置组件状态）
     */
    public clearAllAnis(): void {
        // 1. 隐藏激活特效节点
        this.alive_FX.active = false;

        // 2. 移除所有移动预制体实例（带资源清理，避免内存泄漏）
        this.move_Node?.removeAllChildren(true);
    }
}