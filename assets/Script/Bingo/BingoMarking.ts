const { ccclass, property } = cc._decorator;

@ccclass('BingoMarking')
export default class BingoMarking extends cc.Component {
    @property([cc.Label])
    public bingoLabels: cc.Label[] = [];

    @property([cc.Label])
    public moreLabels: cc.Label[] = [];

    @property(cc.Node)
    public effectNode: cc.Node = null;

    // ===================== 核心方法：设置宾果标记结果+高亮+显示特效 =====================
    public setResult(num: number) {
        const targetIdx = num - 2;
        // 边界判断 防止数组越界报错
        if (targetIdx < 0 || targetIdx >= this.bingoLabels.length) {
            return;
        }

        // 循环设置 bingo标签 高亮/默认颜色
        for (let i = 0; i < this.bingoLabels.length; i++) {
            this.bingoLabels[i].node.color = i === targetIdx ? cc.Color.BLACK.fromHEX("#FFEF6A") : cc.Color.BLACK.fromHEX("#A2D2FE");
        }

        // 循环设置 more标签 高亮/默认颜色
        for (let i = 0; i < this.moreLabels.length; i++) {
            this.moreLabels[i].node.color = i === targetIdx ? cc.Color.BLACK.fromHEX("#FFEF6A") : cc.Color.BLACK.fromHEX("#FD6AFF");
        }

        // 显示特效节点 + 动态设置特效坐标
        this.effectNode.active = true;
        this.effectNode.setPosition(cc.v2(0, -36 * targetIdx));
    }

    // ===================== 核心方法：关闭标记结果+重置颜色+隐藏特效 =====================
    public offResult() {
        // 重置所有bingo标签为默认颜色
        for (let i = 0; i < this.bingoLabels.length; i++) {
            this.bingoLabels[i].node.color = cc.Color.BLACK.fromHEX("#A2D2FE");
        }

        // 重置所有more标签为默认颜色
        for (let i = 0; i < this.moreLabels.length; i++) {
            this.moreLabels[i].node.color = cc.Color.BLACK.fromHEX("#FD6AFF");
        }

        // 隐藏特效节点
        this.effectNode.active = false;
    }
}