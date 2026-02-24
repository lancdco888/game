import SlotSoundController from '../../../Slot/SlotSoundController';
import TSUtility from '../../../global_utility/TSUtility';
import { SymbolInfo } from '../../../manager/SymbolPoolManager';

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏奖励计算动画组件
 * 负责Jackpot奖励计算时的移动动画、特效播放、音效控制
 */
@ccclass('CaculateComponent_BeeLovedJars')
export default class CaculateComponent_BeeLovedJars extends cc.Component {
    // 移动动画根节点
    @property({
        type: cc.Node,
        displayName: "移动动画根节点",
        tooltip: "奖励计算时移动预制体的父节点"
    })
    move_Node: cc.Node | null = null;

    // 奖励生效节点（用于坐标转换）
    @property({
        type: cc.Node,
        displayName: "奖励生效节点",
        tooltip: "用于世界坐标转本地坐标的参考节点"
    })
    alive_Node: cc.Node | null = null;

    // 奖励生效特效节点
    @property({
        type: cc.Node,
        displayName: "奖励生效特效节点",
        tooltip: "奖励计算完成后播放的特效节点（包含Animation组件）"
    })
    alive_FX: cc.Node | null = null;

    // 移动预制体
    @property({
        type: cc.Prefab,
        displayName: "移动预制体",
        tooltip: "奖励计算时从符号位置移动到奖励区的预制体"
    })
    move_Prefab: cc.Prefab | null = null;

    /**
     * 执行Jackpot奖励计算的移动动画
     * @param targetNode 目标符号节点（用于获取起始位置）
     * @param symbolInfo 符号奖励信息（原逻辑保留参数，暂未直接使用）
     * @param callback 动画完成后的回调函数
     */
    moveJackpotCalculate(targetNode: cc.Node, symbolInfo: SymbolInfo, callback?: () => void): void {
        // 空值安全检查：核心节点/预制体缺失直接执行回调
        if (!this.move_Node || !this.alive_Node || !this.alive_FX || !this.move_Prefab || !targetNode) {
            if (TSUtility.isValid(callback)) callback!();
            return;
        }

        const self = this;
        
        // 1. 坐标转换：目标节点世界坐标 → alive_Node本地坐标
        const worldPos = targetNode.parent!.convertToWorldSpaceAR(targetNode.getPosition());
        const localPos = this.alive_Node.convertToNodeSpaceAR(worldPos);

        // 2. 实例化移动预制体并添加到根节点
        const movePrefabNode = cc.instantiate(this.move_Prefab);
        this.move_Node.addChild(movePrefabNode);
        movePrefabNode.setPosition(localPos);

        // 3. 播放奖励计算音效
        SlotSoundController.Instance().playAudio("Jackpot_Caculator", "FX");

        // 4. 延迟0.25秒执行移动动画（移动到目标位置：0, -285）
        this.scheduleOnce(() => {
            if (movePrefabNode.isValid) {
                const moveAction = cc.moveTo(0.42, new cc.Vec2(0, -285));
                movePrefabNode.runAction(moveAction);
            }
        }, 0.25);

        // 5. 延迟0.67秒播放生效特效并执行回调
        this.scheduleOnce(() => {
            // 激活并重置播放生效特效
            self.alive_FX!.active = true;
            const animationComp = self.alive_FX!.getComponent(cc.Animation);
            if (animationComp) {
                animationComp.stop();
                animationComp.play();
                animationComp.setCurrentTime(0);
            }
            
            // 执行回调（确保回调有效）
            if (TSUtility.isValid(callback)) callback!();
        }, 0.67);
    }

    /**
     * 清空所有动画和特效
     * 重置组件状态，移除所有移动预制体，隐藏生效特效
     */
    clearAllAnis(): void {
        // 隐藏生效特效
        if (this.alive_FX) {
            this.alive_FX.active = false;
        }
        
        // 移除所有移动动画子节点
        if (this.move_Node) {
            this.move_Node.removeAllChildren(true);
        }
    }
}