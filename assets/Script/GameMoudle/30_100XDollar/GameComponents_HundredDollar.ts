import TopUI_HundredDollar from './TopUI_HundredDollar';
import ReelFrameAnimation_HundredDollar from './ReelFrameAnimation_HundredDollar';
import BonusGameComponent_HundredDollar from './BonusGameComponent_HundredDollar';

const { ccclass, property } = cc._decorator;

/**
 * 百元老虎机核心组件容器
 * 统一管理顶部UI、滚轮帧动画、奖励游戏三大核心子组件
 */
@ccclass('GameComponents_HundredDollar')
export default class GameComponents_HundredDollar extends cc.Component {
    /** 顶部UI组件（已转换的 TopUI_HundredDollar） */
    @property({
        type: TopUI_HundredDollar,
        displayName: "顶部UI组件",
        tooltip: "挂载百元老虎机的顶部UI子组件"
    })
    public topUI: TopUI_HundredDollar | null = null;

    /** 滚轮帧动画组件（已转换的 ReelFrameAnimation_HundredDollar） */
    @property({
        type: ReelFrameAnimation_HundredDollar,
        displayName: "滚轮帧动画组件",
        tooltip: "挂载滚轮旋转/中奖动画控制子组件"
    })
    public reelFrameAni: ReelFrameAnimation_HundredDollar | null = null;

    /** 奖励游戏组件（已转换的 BonusGameComponent_HundredDollar） */
    @property({
        type: BonusGameComponent_HundredDollar,
        displayName: "奖励游戏组件",
        tooltip: "挂载奖励游戏交互逻辑子组件"
    })
    public bonusGameComponent: BonusGameComponent_HundredDollar | null = null;

    /**
     * 组件加载时初始化（检查子组件挂载状态）
     */
    onLoad(): void {
        // 开发阶段检查子组件是否正确挂载，便于调试
        this._checkSubComponents();
        
        // 初始化顶部UI的控制逻辑（关联其他已转换组件的核心逻辑）
        if (this.topUI) {
            this.topUI.initControl();
        }
    }

    /**
     * 私有方法：检查子组件挂载状态，未挂载则输出警告
     */
    private _checkSubComponents(): void {
        if (!this.topUI) {
            cc.warn("GameComponents: 顶部UI组件（topUI）未挂载，请在编辑器中配置");
        }
        if (!this.reelFrameAni) {
            cc.warn("GameComponents: 滚轮帧动画组件（reelFrameAni）未挂载，请在编辑器中配置");
        }
        if (!this.bonusGameComponent) {
            cc.warn("GameComponents: 奖励游戏组件（bonusGameComponent）未挂载，请在编辑器中配置");
        }
    }

    /**
     * 组件销毁时清理（可选扩展：若后续有事件绑定/定时器可在此清理）
     */
    onDestroy(): void {
        // 可扩展：清理子组件的事件、定时器等，避免内存泄漏
    }
}