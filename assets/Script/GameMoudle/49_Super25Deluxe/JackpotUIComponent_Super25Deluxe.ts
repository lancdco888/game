import TSUtility from "../../global_utility/TSUtility";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";

const { ccclass, property } = cc._decorator;

/**
 * JackpotUI组件 - Super25Deluxe版本
 * 负责Jackpot图标的动画播放逻辑
 */
@ccclass('JackpotUIComponent_Super25Deluxe')
export default class JackpotUIComponent_Super25Deluxe extends cc.Component {
    /** Jackpot动画组件（需在属性面板赋值） */
    @property(cc.Animation)
    jackpotAni: cc.Animation = null!;

    /**
     * 播放Jackpot动画
     * 根据当前slot是否为动态slot选择对应动画剪辑
     */
    playJackpotAni(): void {
        // 判断当前slot是否为动态类型
        const isDynamic = TSUtility.isDynamicSlot(SlotGameRuleManager.Instance.slotID);
        
        // 停止当前动画并播放对应剪辑（startTime设为0表示从头开始）
        this.jackpotAni.stop();
        this.jackpotAni.play(isDynamic ? 'Jackpot_Icon_Eff_DY' : 'Jackpot_Icon_Eff', 0);
    }
}
