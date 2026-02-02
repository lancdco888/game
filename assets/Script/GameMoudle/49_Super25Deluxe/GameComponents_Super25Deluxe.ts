import JackpotUIComponent_Super25Deluxe from "./JackpotUIComponent_Super25Deluxe";
import ReelEffectComponent_Super25Deluxe from "./ReelEffectComponent_Super25Deluxe";

const { ccclass, property } = cc._decorator;

/**
 * 超级25豪华版游戏组件管理类
 * 用于集中管理游戏内关键功能组件的引用
 */
@ccclass()
export default class GameComponents_Super25Deluxe extends cc.Component {
    /**
     * Jackpot UI组件实例引用
     * 用于控制 jackpot 相关的UI显示与逻辑
     */
    @property(JackpotUIComponent_Super25Deluxe)
    public jackpotUI: JackpotUIComponent_Super25Deluxe = null;

    /**
     * 卷轴效果组件实例引用
     * 用于控制卷轴的动画与效果逻辑
     */
    @property(ReelEffectComponent_Super25Deluxe)
    public reelEffects: ReelEffectComponent_Super25Deluxe = null;

    constructor(){
        super()
    }
}