import SlotSoundController from "../../Slot/SlotSoundController";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import { EventBus } from "./BeeLovedJarsManager";
import MoveComponent_BeeLovedJars from "./MoveComponent_BeeLovedJars";

const { ccclass, property } = cc._decorator;


/**
 * 罐子移动组件 - BeeLovedJars 游戏
 * 监听 movePot 事件，创建移动预制体并播放动画
 * @author 
 * @date 
 */
@ccclass('MovePotComponent_BeeLovedJars')
export default class MovePotComponent_BeeLovedJars extends cc.Component {
    // 移动动画节点容器
    @property({
        type: cc.Node,
        displayName: "移动节点容器",
        tooltip: "用于挂载动态创建的移动预制体"
    })
    move_Node: cc.Node = null;

    // 移动动画预制体
    @property({
        type: cc.Prefab,
        displayName: "移动预制体",
        tooltip: "罐子移动的动画预制体"
    })
    move_Prefab: cc.Prefab = null;

    // 内部尺寸参数（原逻辑保留）
    private _width: number = 172;
    private _height: number = 136;

    onLoad() {
        // 监听 movePot 事件，绑定回调函数（保持 this 指向）
        if (EventBus) {
            EventBus.on("movePot", this.moveSymbol, this);
        } else {
            cc.error("BeeLovedJarsManager.EventBus 不存在，请检查事件总线定义！");
        }
    }

    onDestroy() {
        // 移除事件监听，防止内存泄漏
        if (EventBus) {
            EventBus.off("movePot", this.moveSymbol, this);
        }
    }

    /**
     * 处理罐子移动逻辑（movePot 事件回调）
     * @param param1 动画参数1（原逻辑未明确使用，需根据实际业务补充）
     * @param param2 动画参数2（原逻辑未明确使用，需根据实际业务补充）
     */
    moveSymbol(param1: any, param2: any): void {
        // 校验预制体和容器节点
        if (!this.move_Prefab) {
            cc.error("移动预制体未配置，请检查 move_Prefab 属性！");
            return;
        }
        if (!this.move_Node) {
            cc.error("移动节点容器未配置，请检查 move_Node 属性！");
            return;
        }

        // 1. 创建预制体实例并添加到容器
        const prefabInstance: cc.Node = cc.instantiate(this.move_Prefab);
        this.move_Node.addChild(prefabInstance);
        prefabInstance.setPosition(0, 0); // 初始位置

        // 2. 原逻辑中遍历游戏结果（虽未使用，但保留以兼容原有逻辑）
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        if (lastHistoryWindows) {
            for (let a = 0; a < 5; a++) {
                const window = lastHistoryWindows.GetWindow(a);
                if (window) {
                    for (let i = 0; i < 3; i++) {
                        const symbol = window.getSymbol(i);
                        // 原逻辑仅计算值，未使用，保留以兼容
                        Math.floor(symbol / 9);
                    }
                }
            }
        }

        // 3. 播放移动音效
        if (SlotSoundController.Instance) {
            SlotSoundController.Instance().playAudio("MovePot", "FX");
        } else {
            cc.warn("SlotSoundController 实例不存在，音效播放失败！");
        }

        // 4. 获取动画组件并设置动画参数
        const moveComponent = prefabInstance.getComponent(MoveComponent_BeeLovedJars);
        if (moveComponent) {
            moveComponent.setAnimation(param1, param2);
        } else {
            cc.error("预制体缺少 MoveComponent_BeeLovedJars 组件！");
        }

        // 5. 延迟发送 alivePot 事件
        prefabInstance.runAction(cc.sequence(
            cc.delayTime(1.17),
            cc.callFunc(() => {
                if (EventBus) {
                    EventBus.emit("alivePot");
                }
            })
        ));

        // 6. 延迟清理预制体（防止内存泄漏）
        this.scheduleOnce(() => {
            if (prefabInstance && prefabInstance.isValid) {
                prefabInstance.removeFromParent(true);
            }
        }, 1.5);
    }

    /**
     * 清理所有移动动画节点
     */
    clearAllAnis(): void {
        if (this.move_Node) {
            this.move_Node.removeAllChildren(true);
        }
    }
}