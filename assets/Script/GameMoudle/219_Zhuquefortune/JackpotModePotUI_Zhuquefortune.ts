// 符合 Cocos 2.4.x 原生写法：解构装饰器
const { ccclass, property } = cc._decorator;

/**
 * 朱雀运势 Jackpot 模式单个 Pot UI 组件
 * 负责单个 Jackpot Pot 的节点管理、状态切换、期望展示与中奖特效播放
 */
@ccclass("JackpotModePotUI_Zhuquefortune")
export default class JackpotModePotUI_Zhuquefortune extends cc.Component {
    // Pot 状态节点数组（对应不同激活层级，索引 0/1/2 分别对应不同状态）
    @property([cc.Node])
    public pot_Nodes: cc.Node[] = [];

    // 期望展示节点（选中对应 Pot 后显示的期望效果）
    @property(cc.Node)
    public expect_Node: cc.Node | null = null;

    // 中奖特效节点数组（中奖后播放的所有特效节点）
    @property([cc.Node])
    public win_FX: cc.Node[] = [];

    /**
     * 初始化 Pot UI（隐藏所有节点，重置到默认初始状态）
     */
    public initUI(): void {
        // 隐藏期望节点
        this.expect_Node.active = false;

        // 隐藏所有 Pot 状态节点
        this.pot_Nodes.forEach((node) => {
            node.active = false;
        });

        // 隐藏所有中奖特效节点
        this.win_FX.forEach((node) => {
            node.active = false;
        });
    }

    /**
     * 激活 Pot 对应状态（显示指定索引的 Pot 节点，控制期望节点显隐）
     * @param potIndex Pot 状态索引（0/1/2，对应 pot_Nodes 数组）
     */
    public alivePot(potIndex: number): void {
        // 前置校验：防止索引越界导致报错
        if (potIndex < 0 || potIndex >= this.pot_Nodes.length) {
            cc.warn(`Pot 索引 ${potIndex} 超出节点数组长度，无法激活对应状态`);
            return;
        }

        // 1. 激活对应索引的 Pot 节点
        this.pot_Nodes[potIndex].active = true;

        // 2. 索引为 1 时显示期望节点，其他索引取消定时器并隐藏期望节点
        if (potIndex === 1) {
            this.expect_Node.active = true;
        } else {
            // 取消所有未执行的定时器，避免残留动画逻辑
            this.unscheduleAllCallbacks();
            this.expect_Node.active = false;
        }
    }

    /**
     * 隐藏期望节点（中奖后或切换状态时，隐藏未中奖的期望效果）
     */
    public hideExpect(): void {
        this.expect_Node.active = false;
    }

    /**
     * 播放 Pot 中奖 UI（激活所有中奖特效节点，展示中奖效果）
     */
    public winUI(): void {
        this.win_FX.forEach((node) => {
            node.active = true;
        });
    }
}