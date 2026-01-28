import SlotUIRuleManager from '../../../Script/Slot/rule/SlotUIRuleManager';
import HoundOfHadesManager from './HoundOfHadesManager';

const { ccclass } = cc._decorator;

/**
 * 哈迪斯之犬 - Slot UI规则管理器
 * 核心职责：重写基类的getExpectEffectFlag方法，结合游戏专属的下一个特效状态判断预期特效标记
 */
@ccclass()
export default class SlotUIRuleManager_HoundOfHades extends SlotUIRuleManager {
    /**
     * 重写基类方法：获取预期特效标记
     * @param arg1 基类方法入参（原代码未明确，保留兼容）
     * @param arg2 基类方法入参（原代码未明确，保留兼容）
     * @returns 预期特效标记（boolean）
     */
    getExpectEffectFlag(arg1: any, arg2: any): boolean {
        // 1. 判断游戏管理器的下一个特效状态是否为1
        const hasNextEffect = HoundOfHadesManager.getInstance().getNextEffect();
        // 2. 若有下一个特效则返回true，否则调用父类方法
        return hasNextEffect || super.getExpectEffectFlag.call(this, arg1, arg2);
    }
}