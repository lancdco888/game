import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import ZhuquefortuneManager, { EventBus } from "./ZhuquefortuneManager";

// 符合 Cocos 2.4.x 原生写法：解构装饰器
const { ccclass, property } = cc._decorator;

/**
 * 奖池核心控制组件（包含普通奖池 & 超级奖池）
 * 负责奖池数值更新、动画播放、音效同步、状态重置，处理奖池升级、触发、落空等完整业务流程
 */
@ccclass()
export default class PotComponent_Zhuquefortune extends cc.Component {
    // ===== 序列化属性（编辑器绑定）=====
    // 超级奖池当前数值标签
    @property(cc.Label)
    public currentSuperJackpot_Label: cc.Label | null = null;

    // 普通奖池核心动画组件（闲置/升级/触发等动画）
    @property(cc.Animation)
    public coin_Ani: cc.Animation | null = null;

    // 超级奖池UI动画组件（闲置/期望/触发等动画）
    @property(cc.Animation)
    public superPotUI_Animation: cc.Animation | null = null;

    // 超级奖池触发节点（激活时显示）
    @property(cc.Node)
    public superJackpotTrigger_Node: cc.Node | null = null;

    // ===== 私有状态属性 =====
    // 普通奖池当前等级
    private _Pot: number = 0;

    // 超级奖池当前数值
    private _superPot: number = 0;

    // 超级奖池当前播放的动画名（用于避免重复播放）
    private _playAniName: string = "";

    // 普通奖池是否处于触发状态
    private _isPot: boolean = false;

    // 普通奖池是否处于更新状态
    private _updatePot: boolean = false;

    // 奖池激活计数
    private _aliveCoutn: number = 0;

    // ===== 组件生命周期 =====
    /**
     * 组件加载完成：绑定奖池激活事件
     */
    public onLoad(): void {
        EventBus.on("alivePot", this.setAlive, this);
    }

    /**
     * 组件销毁：解绑事件，防止内存泄漏
     */
    public onDestroy(): void {
        EventBus.off("alivePot", this.setAlive, this);
    }

    // ===== 超级奖池相关方法 =====
    /**
     * 初始化普通奖池更新状态（重置为未更新）
     */
    public initUpdatePot(): void {
        this._updatePot = false;
    }

    /**
     * 设置超级奖池数值 & 对应动画
     * @param isDirect 是否直接赋值（默认false：数值自增）
     */
    public setSuperPot(isDirect: boolean = false): void {
        // 1. 更新超级奖池数值（非直接赋值则自增）
        if (!isDirect) {
            this._superPot++;
        }

        // 2. 根据剩余数值判断要播放的动画名
        const remaining = 388 - this._superPot;
        let targetAniName: string;
        if (remaining <= 50) {
            targetAniName = "SuperPot_Expect_Fx_Ani_2";
        } else if (remaining <= 100) {
            targetAniName = "SuperPot_Expect_Fx_Ani_1";
        } else {
            targetAniName = "SuperPot_Idle_Ani";
        }

        // 3. 避免重复播放同一动画，更新并播放动画
        if (this._playAniName !== targetAniName) {
            this._playAniName = targetAniName;
            this.superPotUI_Animation?.play(targetAniName, 0);
        }

        // 4. 更新超级奖池数值标签
        this.currentSuperJackpot_Label.string = this._superPot.toString();
    }

    /**
     * 从游戏结果管理器更新超级奖池数值（同步服务器/全局状态）
     */
    public updateSuperPot(): void {
        const baseSubGameState = SlotGameResultManager.Instance.getSubGameState("base");
        if (!baseSubGameState) {
            cc.warn("基础子游戏状态未获取到，无法更新超级奖池数值");
            return;
        }
        this._superPot = baseSubGameState.getGaugesValue("trigger_superjackpot");
    }

    /**
     * 触发超级奖池（播放触发动画、音效，延迟回调）
     * @param callback 触发完成后的回调函数
     */
    public triggetSuperPot(callback?: () => void): void {
        // 1. 激活超级奖池触发节点
        this.superJackpotTrigger_Node.active = true;

        // 2. 播放超级奖池触发动画
        this._playAniName = "SuperPot_Trigger_Ani";
        this.superPotUI_Animation?.play(this._playAniName, 0);

        // 3. 播放触发音效
        SlotSoundController.Instance().playAudio("SuperJackpotTrigger", "FX");

        // 4. 2秒延迟执行回调
        this.node.runAction(cc.sequence(
            cc.delayTime(2),
            cc.callFunc(() => {
                if (TSUtility.isValid(callback)) {
                    callback!();
                }
            })
        ));
    }

    /**
     * 初始化超级奖池（恢复初始状态，设置默认动画与数值）
     */
    public initSuperPot(): void {
        // 1. 隐藏超级奖池触发节点
        this.superJackpotTrigger_Node.active = false;

        // 2. 获取全局超级奖池数值，判断对应动画
        const baseSubGameState = SlotGameResultManager.Instance.getSubGameState("base");
        if (!baseSubGameState) {
            cc.warn("基础子游戏状态未获取到，无法初始化超级奖池");
            return;
        }
        const superPotValue = baseSubGameState.getGaugesValue("trigger_superjackpot");
        const remaining = 388 - superPotValue;

        let targetAniName: string;
        if (remaining <= 50) {
            targetAniName = "SuperPot_Expect_Fx_Ani_2";
        } else if (remaining <= 100) {
            targetAniName = "SuperPot_Expect_Fx_Ani_1";
        } else {
            targetAniName = "SuperPot_Idle_Ani";
        }

        // 3. 播放动画并更新标签
        if (this._playAniName !== targetAniName) {
            this._playAniName = targetAniName;
            this.superPotUI_Animation?.play(targetAniName, 0);
        }
        this.currentSuperJackpot_Label.string = superPotValue.toString();
        this._superPot = superPotValue;
    }

    // ===== 普通奖池相关方法 =====
    /**
     * 获取当前普通奖池等级（根据全局旋转次数判断）
     * @returns 奖池等级（1-4）
     */
    public getPot(): number {
        const baseSubGameState = SlotGameResultManager.Instance.getSubGameState("base");
        if (!baseSubGameState) {
            cc.warn("基础子游戏状态未获取到，默认返回奖池等级1");
            return 1;
        }
        const spinCount = baseSubGameState.getGaugesValue("spinCnt");
        
        if (spinCount < 41) return 1;
        if (spinCount < 81) return 2;
        if (spinCount < 121) return 3;
        return 4;
    }

    /**
     * 初始化普通奖池（设置初始等级，播放闲置动画）
     */
    public initPot(): void {
        this._Pot = this.getPot();
        this.setIdel();
    }

    /**
     * 播放普通奖池闲置动画（根据当前等级匹配对应动画）
     */
    public setIdel(): void {
        // 1. 根据奖池等级匹配闲置动画名
        let idleAniName: string;
        switch (this._Pot) {
            case 1:
                idleAniName = "Pot_Idle_Ani_1";
                break;
            case 2:
                idleAniName = "Pot_Idle_Ani_2";
                break;
            case 3:
                idleAniName = "Pot_Idle_Ani_3";
                break;
            case 4:
                idleAniName = "Pot_Idle_Ani_4";
                break;
            default:
                idleAniName = "Pot_Idle_Ani_1";
                cc.warn(`未知的奖池等级：${this._Pot}，默认播放等级1闲置动画`);
                break;
        }

        // 2. 停止当前动画并播放闲置动画
        this.coin_Ani?.stop();
        this.coin_Ani?.play(idleAniName, 0);
    }

    /**
     * 处理普通奖池激活事件（升级/普通增加，播放对应动画）
     */
    public setAlive(): void {
        this.unscheduleAllCallbacks(); // 清空所有未执行的定时器

        // 过滤无效状态（已触发/已更新则不处理）
        if (this._isPot || this._updatePot) return;

        const zhuqueManager = ZhuquefortuneManager.getInstance();
        if (!zhuqueManager) {
            cc.warn("朱雀管理器未初始化，无法处理奖池激活事件");
            return;
        }

        const currentPot = this.getPot();
        let targetAniName: string;

        // 1. 判断奖池是否升级（当前等级与新等级不一致，且激活计数匹配更新计数）
        if (this._Pot !== currentPot && this._aliveCoutn === zhuqueManager.getUpdateCount()) {
            this._updatePot = true;
            targetAniName = `Pot_Upgrade_${this._Pot}_to_${currentPot}_Ani`;
            this._Pot = currentPot;

            // 2. 播放升级音效（最高等级播放专属音效）
            if (this._Pot === 4) {
                SlotSoundController.Instance().playAudio("Pot_Last_Upgrade", "FX");
            } else {
                SlotSoundController.Instance().playAudio("Pot_Upgrade", "FX");
            }
        } else {
            // 3. 奖池未升级，播放普通增加动画
            targetAniName = "Pot_Plus_Ani";
            this.coin_Ani?.stop();
        }

        // 4. 播放动画，2秒后恢复闲置状态
        this.coin_Ani?.play(targetAniName, 0);
        this.scheduleOnce(() => {
            this.setIdel();
        }, 2);
    }

    /**
     * 更新普通奖池（根据历史窗口符号判断是否升级，延迟回调）
     * @param callback 更新完成后的回调函数
     */
    public updatePot(callback?: () => void): void {
        this.unscheduleAllCallbacks();
        const self = this;

        // 1. 获取历史窗口，判断是否存在目标符号（百位为9的符号）
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        let hasTargetSymbol = false;

        for (let a = 0; a < 5; a++) {
            for (let i = 0; i < 3; i++) {
                const symbolValue = lastHistoryWindows.GetWindow(a).getSymbol(i);
                if (Math.floor(symbolValue / 100) === 9) {
                    hasTargetSymbol = true;
                    break;
                }
            }
            if (hasTargetSymbol) break;
        }

        // 2. 存在目标符号，处理奖池升级
        if (hasTargetSymbol && !this._isPot && !this._updatePot) {
            const currentPot = this.getPot();

            if (this._Pot !== currentPot) {
                const upgradeAniName = `Pot_Upgrade_${this._Pot}_to_${currentPot}_Ani`;
                this._Pot = currentPot;

                // 播放升级音效
                if (this._Pot === 4) {
                    SlotSoundController.Instance().playAudio("Pot_Last_Upgrade", "FX");
                } else {
                    SlotSoundController.Instance().playAudio("Pot_Upgrade", "FX");
                }

                // 播放升级动画，2.5秒后恢复闲置并执行回调
                this.coin_Ani?.play(upgradeAniName, 0);
                this.scheduleOnce(() => {
                    if (TSUtility.isValid(callback)) {
                        callback!();
                    }
                    self.setIdel();
                }, 2.5);
            } else {
                // 等级未变化，直接执行回调
                if (TSUtility.isValid(callback)) {
                    callback!();
                }
            }
        } else {
            // 3. 无目标符号，直接执行回调
            if (TSUtility.isValid(callback)) {
                callback!();
            }
        }
    }

    /**
     * 播放普通奖池触发动画（成功触发）
     */
    public playTriggerAni(): void {
        this.unscheduleAllCallbacks();
        this._isPot = true;

        const triggerAniName = `Pot_Trigger_Ani_${this._Pot.toString()}`;
        this.coin_Ani?.play(triggerAniName, 0);
        SlotSoundController.Instance().playAudio("Pot_Trigger", "FX");
    }

    /**
     * 播放普通奖池落空期望动画（触发失败）
     * @param callback 动画完成后的回调函数
     */
    public playExpectTriggerAni(callback?: () => void): void {
        this.unscheduleAllCallbacks();
        this._isPot = true;

        // 1. 播放落空动画与音效
        const expectAniName = `Pot_Trigger_Expect_Fx_${this._Pot.toString()}`;
        this.coin_Ani?.play(expectAniName, 0);
        SlotSoundController.Instance().playAudio("FailedExpect", "FX");

        // 2. 1.8秒延迟执行回调
        this.node.runAction(cc.sequence(
            cc.delayTime(1.8),
            cc.callFunc(() => {
                if (TSUtility.isValid(callback)) {
                    callback!();
                }
            })
        ));
    }

    /**
     * 重置普通奖池（落空后，保留当前等级，恢复闲置状态）
     */
    public resetFailedPot(): void {
        this._isPot = false;
        this.setIdel();
    }

    /**
     * 重置普通奖池（完全重置，等级恢复为1，恢复闲置状态）
     */
    public resetPot(): void {
        this._isPot = false;
        this._Pot = 1;
        this.setIdel();
    }
}