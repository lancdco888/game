const { ccclass } = cc._decorator;

/**
 * Cocos 2.4.13 异步工具核心类 - 纯静态工具类 无需实例化
 * 原JS逻辑1:1复刻 | 原生TS Async/Await | 无冗余代码 | 完美适配2.4.13
 */
@ccclass
export default class AsyncHelper {

    /**
     * 1. 基础延迟等待 (基于原生setTimeout)
     * @param delaySecond 延迟秒数 例：1 → 延迟1秒
     * @returns Promise<void>
     */
    public static delay(delaySecond: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, delaySecond * 1000);
        });
    }

    /**
     * 2. ✅【2.4.13推荐优先使用】组件安全延迟等待 (基于cc.Component.scheduleOnce)
     * 贴合2.4.13生命周期，组件销毁自动清空定时器，无内存泄漏风险，性能最优
     * @param delaySecond 延迟秒数
     * @param targetComp 挂载组件（传 this 即可）
     * @returns Promise<void>
     */
    public static delayWithComponent(delaySecond: number, targetComp: cc.Component): Promise<void> {
        return new Promise((resolve) => {
            targetComp.scheduleOnce(() => {
                resolve();
            }, delaySecond);
        });
    }

    /**
     * 3. 异步等待【所有动作执行完毕】- 轮询检测cc.Action数组状态
     * 2.4.13 原生cc.Action兼容：moveTo/scaleTo/fadeTo/rotateTo等所有动作都支持
     * @param actions 等待的动作数组 cc.Action[]
     * @param targetComp 挂载组件（传 this 即可）
     */
    public static async asyncWaitEndAllAction(actions: cc.Action[], targetComp: cc.Component): Promise<void> {
        while (true) {
            let isAllDone = true;
            for (let i = 0; i < actions.length; i++) {
                if (!actions[i].isDone()) {
                    isAllDone = false;
                    break;
                }
            }
            if (isAllDone) break;
            await this.delayWithComponent(0.1, targetComp);
        }
    }

    /**
     * 4. ✅【2.4.13最常用】异步等待【自定义条件成立】- 核心业务方法
     * 轮询检测自定义布尔条件，返回true则结束等待，万能异步等待方案
     * @param conditionFunc 条件函数 ()=>boolean
     * @param targetComp 挂载组件（传 this 即可）
     */
    public static async asyncWaitEndCondition(conditionFunc: () => boolean, targetComp: cc.Component): Promise<void> {
        while (true) {
            if (conditionFunc()) break;
            await this.delayWithComponent(0.1, targetComp);
        }
    }
}