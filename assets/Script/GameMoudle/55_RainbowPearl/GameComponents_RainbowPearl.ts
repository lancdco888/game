import JackpotResult_RainbowPearl from "./JackpotResult_RainbowPearl";
import JackpotSymbolFixComponent_RainbowPearl from "./JackpotSymbolFixComponent_RainbowPearl";
import LinkedJackpotUI_RainbowPearl from "./LinkedJackpotUI_RainbowPearl";
import LockAndRollResult_RainbowPearl from "./LockAndRollResult_RainbowPearl";
import TopUI_RainbowPearl from "./TopUI_RainbowPearl";

const { ccclass, property } = cc._decorator;

/**
 * RainbowPearl游戏核心组件容器
 * 聚合管理游戏内所有功能/UI子组件，统一提供引用入口
 */
@ccclass('GameComponents_RainbowPearl')
export default class GameComponents_RainbowPearl extends cc.Component {
    /** Jackpot符号固定组件 */
    @property({ type: JackpotSymbolFixComponent_RainbowPearl })
    public jackpotSymbolFixComponent: JackpotSymbolFixComponent_RainbowPearl | null = null;

    /** 基础模式滚轮线节点 */
    @property({ type: cc.Node })
    public reelLineBaseMode: cc.Node | null = null;

    /** Lock&Roll模式滚轮线节点 */
    @property({ type: cc.Node })
    public reelLineLockNRollMode: cc.Node | null = null;

    /** Linked Jackpot模式滚轮框架节点 */
    @property({ type: cc.Node })
    public reelFrameLinkedJackpot: cc.Node | null = null;

    /** Linked Jackpot UI组件 */
    @property({ type: LinkedJackpotUI_RainbowPearl })
    public linkedJackpotUI: LinkedJackpotUI_RainbowPearl | null = null;

    /** 顶部UI组件 */
    @property({ type: TopUI_RainbowPearl })
    public topUI: TopUI_RainbowPearl | null = null;

    /** Jackpot结果展示组件 */
    @property({ type: JackpotResult_RainbowPearl })
    public jackpotResult: JackpotResult_RainbowPearl | null = null;

    /** Lock&Roll结果展示组件 */
    @property({ type: LockAndRollResult_RainbowPearl })
    public lockAndRollResult: LockAndRollResult_RainbowPearl | null = null;
}