import { Utility } from "../global_utility/Utility";

// Cocos Creator 2.x 标准头部写法 (严格按你的要求)
const { ccclass, property } = cc._decorator;

@ccclass
export default class LobbyThrillWheelSingleItem extends cc.Component {
    /** 序列化绑定：转盘的旋转节点 */
    @property(cc.Node)
    public nodeWheel: cc.Node = null;

    /** 私有状态：是否为【闲置模式】(匀速慢速旋转) */
    private _modeIdle: boolean = true;

    /** 闲置模式下的转盘旋转速度 (默认30度/秒) */
    private m_IdleSpeed: number = 30;

    // ===================================== 核心生命周期 =====================================
    /** 每一帧执行 - 闲置模式下的匀速旋转逻辑 */
    update(deltaTime: number) {
        if (this._modeIdle) {
            // 匀速旋转 + 取模360 防止角度数值无限增大，原代码的工具类写法完全保留
            Utility.setRotation(this.nodeWheel, (this.nodeWheel.rotation + this.m_IdleSpeed * deltaTime) % 360);
        }
    }

    // ===================================== 对外暴露的核心方法 =====================================
    /**
     * 设置为【闲置模式】- 恢复匀速慢速旋转
     * 原逻辑：清空所有定时器 + 停止所有节点动作 + 切换状态
     */
    setModeIdle(): void {
        this.unscheduleAllCallbacks();
        this.nodeWheel.stopAllActions();
        this._modeIdle = true;
    }

    /**
     * 设置为【悬浮模式】- 触发快速旋转动画，动画结束自动切回闲置模式
     * @param delay 动画执行的延迟时间 (秒)，用于多个转盘子项的渐变错开效果
     */
    setModeOver(delay: number): void {
        const self = this;
        // 延迟指定时间后执行动画
        this.scheduleOnce(() => {
            // 关闭闲置旋转状态
            self._modeIdle = false;
            // 执行核心动画：1秒内旋转720度(2圈) + 缓出减速效果
            self.nodeWheel.runAction(cc.rotateBy(1, 720).easing(cc.easeOut(3)));
            // 动画执行完毕后，延迟1秒切回【闲置模式】
            self.scheduleOnce(() => {
                self.setModeIdle();
            }, 1);
        }, delay);
    }
}