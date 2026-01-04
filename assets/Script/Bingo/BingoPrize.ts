const { ccclass, property } = cc._decorator;

@ccclass
export default class BingoPrize extends cc.Component {
    @property([cc.Label])
    public callLabels: cc.Label[] = [];

    @property([cc.Label])
    public prizeLabels: cc.Label[] = [];

    @property(cc.Node)
    public effectNode: cc.Node = null;

    @property(cc.Node)
    public resultEffect: cc.Node = null;

    // ===================== 核心方法：设置奖励档位特效+字体高亮 =====================
    public SetEffect(num: number, isShowResult: boolean = false) {
        const targetIdx = this.getIdx(num);
        
        // 循环设置 数字标签 高亮颜色/默认颜色
        for (let i = 0; i < this.callLabels.length; i++) {
            this.callLabels[i].node.color = i === targetIdx ? cc.Color.BLACK.fromHEX("#FFEF6A") : cc.Color.WHITE;
        }

        // 循环设置 奖励标签 高亮颜色/默认颜色
        for (let i = 0; i < this.callLabels.length; i++) {
            this.prizeLabels[i].node.color = i === targetIdx ? cc.Color.BLACK.fromHEX("#FFEF6A") : cc.Color.BLACK.fromHEX("#A2D2FE");
        }

        // 动态设置特效节点坐标 + 结果特效显隐
        this.effectNode.setPosition(this.getEffectPostion(targetIdx));
        this.resultEffect.active = isShowResult === true;
    }

    // ===================== 核心工具方法：根据数字获取对应档位索引 =====================
    public getIdx(num: number): number {
        if (num < 6) return 0;
        if (num < 11) return 1;
        if (num < 16) return 2;
        if (num < 23) return 3;
        if (num < 30) return 4;
        if (num < 37) return 5;
        return 6;
    }

    // ===================== 核心工具方法：根据档位索引获取特效坐标 ✅ 保留原拼写 Postion =====================
    public getEffectPostion(idx: number): cc.Vec2 {
        return cc.v2(0, -36 * idx);
    }
}