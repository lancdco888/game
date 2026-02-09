import SlotSoundController from "../../Slot/SlotSoundController";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SlotManager from "../../manager/SlotManager";
import ZhuquefortuneManager, { EventBus } from "./ZhuquefortuneManager";

const { ccclass, property } = cc._decorator;

@ccclass('MovePotComponent_Zhuquefortune')
export default class MovePotComponent_Zhuquefortune extends cc.Component {
    // 移动节点容器（对应原JS的move_Node）
    @property({ type: cc.Node })
    move_Node: cc.Node | null = null;

    // 目标节点（对应原JS的target_Node）
    @property({ type: cc.Node })
    target_Node: cc.Node | null = null;

    // 移动预制体（对应原JS的move_Prefab）
    @property({ type: cc.Prefab })
    move_Prefab: cc.Prefab | null = null;

    // 私有尺寸属性，保留原默认值
    private _width: number = 152;
    private _height: number = 138;

    onLoad(): void {
        // 绑定事件，保留原逻辑
        EventBus.on("movePot", this.moveSymbol, this);
    }

    onDestroy(): void {
        // 解绑事件，保留原逻辑
        EventBus.off("movePot");
    }

    /**
     * 移动符号逻辑（对应原JS的moveSymbol）
     * @param col 列索引
     * @param row 行索引
     */
    moveSymbol(col: number, row: number): void {
        // 增加非空判断（TS类型安全，不改变原逻辑）
        if (!this.target_Node || !this.move_Prefab || !this.move_Node) {
            return;
        }

        // 保留原Vec2创建逻辑
        const targetPos = new cc.Vec2(this.target_Node.position.x, this.target_Node.position.y);
        // 实例化预制体，保留原逻辑
        const prefabNode = cc.instantiate(this.move_Prefab);
        this.move_Node.addChild(prefabNode);

        // 设置初始位置，保留原计算逻辑
        prefabNode.x = -2 * this._width + col * this._width;
        prefabNode.y = this._height - row * this._height;

        // 保留原循环查找符号的逻辑
        let targetCol = 0;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        for (let u = 0; u < 5; u++) {
            for (let p = 0; p < 3; p++) {
                const symbol = lastHistoryWindows.GetWindow(u).getSymbol(p);
                if (Math.floor(symbol / 9) === 10) {
                    targetCol = u;
                }
            }
        }

        // 保留原跳过旋转判断逻辑
        const isSkipCurrentSpin = SlotManager.Instance.isSkipCurrentSpin;
        if (isSkipCurrentSpin === 0 || (isSkipCurrentSpin === 1 && col === targetCol)) {
            SlotSoundController.Instance().playAudio("MovePot", "FX");
        }

        // 保留原动画序列逻辑，时间参数完全一致
        prefabNode.runAction(cc.sequence(
            cc.moveTo(0.6, targetPos),
            cc.delayTime(0.1),
            cc.callFunc(() => {
                EventBus.emit("alivePot");
            })
        ));

        // 保留原延迟移除节点逻辑
        this.scheduleOnce(() => {
            prefabNode.removeFromParent(true);
        }, 1.1);
    }

    /**
     * 清除所有动画节点，保留原逻辑
     */
    clearAllAnis(): void {
        if (this.move_Node) { // 增加非空判断，TS类型安全
            this.move_Node.removeAllChildren(true);
        }
    }
}