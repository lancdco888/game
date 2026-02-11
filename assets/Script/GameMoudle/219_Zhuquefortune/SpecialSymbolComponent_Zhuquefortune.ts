import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";
import ZhuquefortuneManager from "./ZhuquefortuneManager";

// 符合 Cocos 2.4.x 原生写法：解构装饰器
const { ccclass, property } = cc._decorator;

/**
 * 特殊符号（Jackpot）信息展示组件
 * 负责特殊符号的 Jackpot 节点切换、奖金金额格式化显示、专属字体切换、延迟闲置节点激活等视觉反馈
 */
@ccclass()
export default class SpecialSymbolComponent_Zhuquefortune extends cc.Component {
    // ===== 序列化属性（编辑器绑定）=====
    // 普通奖金标签（展示低于3倍总投注的 Jackpot 奖金）
    @property(cc.Label)
    public normal_Label: cc.Label | null = null;

    // 高额奖金标签（展示高于等于3倍总投注的 Jackpot 奖金）
    @property(cc.Label)
    public high_Label: cc.Label | null = null;

    // Jackpot 激活节点数组（对应 5 种 Jackpot 类型：mini/minor/major/mega/grand）
    @property([cc.Node])
    public jackpot_Nodes: cc.Node[] = [];

    // Jackpot 闲置节点数组（对应 5 种 Jackpot 类型，延迟激活展示）
    @property([cc.Node])
    public jackpot_Idle_Nodes: cc.Node[] = [];

    // Grand Jackpot 专属红色字体（延迟切换使用）
    @property(cc.Font)
    public redFont: cc.Font | null = null;

    // 基础粉色字体（默认/其他 Jackpot 类型使用）
    @property(cc.Font)
    public pinkFont: cc.Font | null = null;

    // ===== 核心辅助方法：根据子游戏类型匹配 Jackpot 节点索引 =====
    /**
     * 从子游戏类型字符串匹配对应的 Jackpot 节点索引
     * @param subGameKey 子游戏类型字符串（lockNRoll_xxx）
     * @returns 对应的节点索引（0-4）
     */
    private _getJackpotIndexBySubGameKey(subGameKey: string): number {
        switch (subGameKey) {
            case "lockNRoll_mini":
                return 0;
            case "lockNRoll_minor":
                return 1;
            case "lockNRoll_major":
                return 2;
            case "lockNRoll_mega":
                return 3;
            case "lockNRoll_grand":
                return 4;
            default:
                cc.warn(`未知的子游戏类型：${subGameKey}，默认使用索引 0 节点`);
                return 0;
        }
    }

    // ===== 公开方法：设置普通 Jackpot 信息 =====
    /**
     * 设置普通 Jackpot 信息（切换节点、显示奖金，无延迟字体/闲置节点切换）
     * @param prizeInfo 奖金信息对象（包含 prize 字段）
     */
    public setInfo(prizeInfo: { prize: number }): void {
        // 1. 校验必要依赖，避免后续逻辑报错
        const zhuqueManager = ZhuquefortuneManager.getInstance();
        if (!zhuqueManager || !zhuqueManager.game_components) {
            cc.warn("朱雀管理器或游戏组件未初始化，无法格式化奖金金额");
            return;
        }
        const totalBet = SlotGameRuleManager.Instance.getTotalBet();
        if (isNaN(totalBet)) {
            cc.warn("总投注金额获取失败，无法判断奖金等级");
            return;
        }

        // 2. 获取下一个子游戏类型，匹配 Jackpot 节点索引
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const targetJackpotIndex = this._getJackpotIndexBySubGameKey(nextSubGameKey);

        // 3. 切换 Jackpot 激活节点（仅激活对应索引节点，隐藏其他）
        this.jackpot_Nodes.forEach((node, index) => {
            node.active = index === targetJackpotIndex;
        });

        // 4. 重置奖金标签显示（先清空两个标签内容）
        this.normal_Label.string = "";
        this.high_Label.string = "";

        // 5. 格式化奖金金额，区分普通/高额奖金并赋值给对应标签
        const prizeAmount = prizeInfo.prize;
        const formattedPrize = zhuqueManager.game_components.formatEllipsisNumber(prizeAmount);
        const threeTimesTotalBet = 3 * totalBet;

        if (prizeAmount >= threeTimesTotalBet) {
            this.high_Label.string = formattedPrize;
        } else {
            this.normal_Label.string = formattedPrize;
        }
    }

    // ===== 公开方法：设置变更后的 Jackpot 信息（含延迟视觉效果）=====
    /**
     * 设置变更后的 Jackpot 信息（含字体切换、延迟闲置节点激活等视觉效果）
     * @param prizeInfo 奖金信息对象（包含 prize 字段）
     */
    public setChangeInfo(prizeInfo: { prize: number }): void {
        const self = this;

        // 1. 校验必要依赖，避免后续逻辑报错
        const zhuqueManager = ZhuquefortuneManager.getInstance();
        if (!zhuqueManager || !zhuqueManager.game_components) {
            cc.warn("朱雀管理器或游戏组件未初始化，无法格式化奖金金额");
            return;
        }
        const totalBet = SlotGameRuleManager.Instance.getTotalBet();
        if (isNaN(totalBet)) {
            cc.warn("总投注金额获取失败，无法判断奖金等级");
            return;
        }

        // 2. 初始化：设置高额标签为粉色字体
        if (this.high_Label && this.pinkFont) {
            this.high_Label.font = this.pinkFont;
        }

        // 3. 获取下一个子游戏类型，匹配 Jackpot 节点索引
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const targetJackpotIndex = this._getJackpotIndexBySubGameKey(nextSubGameKey);

        // 4. 切换 Jackpot 激活节点，隐藏所有闲置节点
        this.jackpot_Nodes.forEach((node, index) => {
            node.active = index === targetJackpotIndex;
        });
        this.jackpot_Idle_Nodes.forEach((node) => {
            node.active = false;
        });

        // 5. 重置奖金标签显示（先清空两个标签内容）
        this.normal_Label.string = "";
        this.high_Label.string = "";

        // 6. 格式化奖金金额，区分普通/高额奖金并赋值给对应标签
        const prizeAmount = prizeInfo.prize;
        const formattedPrize = zhuqueManager.game_components.formatEllipsisNumber(prizeAmount);
        const threeTimesTotalBet = 3 * totalBet;

        if (prizeAmount >= threeTimesTotalBet) {
            this.high_Label.string = formattedPrize;
        } else {
            this.normal_Label.string = formattedPrize;
        }

        // 7. 特殊逻辑：Grand Jackpot 延迟 1.33 秒切换为红色字体
        if (nextSubGameKey === "lockNRoll_grand") {
            this.scheduleOnce(() => {
                if (self.high_Label && self.redFont) {
                    self.high_Label.font = self.redFont;
                }
            }, 1.33);
        }

        // 8. 延迟 2 秒激活对应 Jackpot 闲置节点（完成视觉过渡）
        this.scheduleOnce(() => {
            self.jackpot_Idle_Nodes.forEach((node, index) => {
                node.active = index === targetJackpotIndex;
            });
        }, 2);
    }
}