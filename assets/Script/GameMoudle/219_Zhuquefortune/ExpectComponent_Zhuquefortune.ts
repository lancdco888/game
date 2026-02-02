import SlotSoundController from "../../Slot/SlotSoundController";
import SlotGameResultManager from "../../manager/SlotGameResultManager";

// 符合 Cocos 2.4.x 原生写法：解构装饰器
const { ccclass, property } = cc._decorator;

/**
 * 期望展示组件（朱雀特效）
 * 负责控制期望节点显隐、龙骨动画播放与混合、对应音效播放，实现期望/落空的视觉反馈
 */
@ccclass("ExpectComponent_Zhuquefortune")
export default class ExpectComponent_Zhuquefortune extends cc.Component {
    // 常规期望节点数组（大赢期望展示）
    @property([cc.Node])
    public expectNode: cc.Node[] = [];

    // 随机触发期望节点数组（随机触发期望展示）
    @property([cc.Node])
    public randomTrigger_ExpectNode: cc.Node[] = [];

    // 朱雀龙骨组件（控制核心动画播放）
    @property(sp.Skeleton)
    public zhuqueSpine: sp.Skeleton | null = null;

    /**
     * 组件加载完成（初始化龙骨动画混合参数，确保动画过渡平滑）
     */
    public onLoad(): void {
        if (!this.zhuqueSpine) {
            cc.warn("朱雀龙骨组件未绑定，无法初始化动画混合参数");
            return;
        }

        // 设置龙骨动画混合参数（过渡时间 0.2 秒，确保动画切换无卡顿）
        this.zhuqueSpine.setMix("UI_Trigger", "UI_Idle", 0.2);
        this.zhuqueSpine.setMix("UI_Trigger_False", "UI_Idle", 0.2);
        this.zhuqueSpine.setMix("UI_Idle", "UI_Trigger", 0.2);
        this.zhuqueSpine.setMix("UI_Idle", "UI_Trigger_False", 0.2);
    }

    /**
     * 展示期望效果（根据历史窗口数量切换节点，播放成功期望动画与音效）
     */
    public showExpect(): void {
        const self = this;
        const historyWindowLength = SlotGameResultManager.Instance.getHistoryWindows().length;

        // 1. 根据历史窗口数量，切换对应期望节点显隐，播放对应音效
        if (historyWindowLength < 2) {
            // 展示常规期望节点，播放大赢期望音效
            this.expectNode.forEach((node) => {
                node.active = true;
            });
            SlotSoundController.Instance().playAudio("BigWinExpect", "FX");
        } else {
            // 展示随机触发期望节点，播放随机触发期望音效
            this.randomTrigger_ExpectNode.forEach((node) => {
                node.active = true;
            });
            SlotSoundController.Instance().playAudio("RandomTriggerExpect", "FX");
        }

        // 2. 播放朱雀成功期望龙骨动画（非循环）
        this.zhuqueSpine?.setAnimation(0, "UI_Trigger", false);

        // 3. 延迟 3.5 秒重置为闲置状态
        this.scheduleOnce(() => {
            self.setIdle();
        }, 3.5);
    }

    /**
     * 展示落空效果（播放落空龙骨动画，无节点显隐，仅反馈视觉效果）
     */
    public showFalse(): void {
        const self = this;

        // 1. 播放朱雀落空龙骨动画（非循环）
        this.zhuqueSpine?.setAnimation(0, "UI_Trigger_False", false);

        // 2. 延迟 3 秒重置为闲置状态
        this.scheduleOnce(() => {
            self.setIdle();
        }, 3);
    }

    /**
     * 重置为闲置状态（播放循环闲置动画，延迟隐藏所有期望节点）
     */
    public setIdle(): void {
        const self = this;

        // 1. 播放朱雀闲置龙骨动画（循环）
        this.zhuqueSpine?.setAnimation(0, "UI_Idle", true);

        // 2. 延迟 1 秒隐藏所有期望节点，清理界面
        this.scheduleOnce(() => {
            self.expectNode.forEach((node) => {
                node.active = false;
            });
            self.randomTrigger_ExpectNode.forEach((node) => {
                node.active = false;
            });
        }, 1);
    }
}