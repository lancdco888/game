const { ccclass, property } = cc._decorator;

/**
 * 暮光龙支付线控制器
 * 负责管理支付线节点的显示与隐藏
 */
@ccclass("PaylineController_TwilightDragon")
export default class PaylineController_TwilightDragon extends cc.Component {
    // 支付线节点数组（供编辑器序列化配置，对应原始JS的lineNodes）
    @property([cc.Node])
    lineNodes: cc.Node[] = [];

    /**
     * 清空所有支付线（隐藏所有支付线节点）
     */
    clearAll(): void {
        // 遍历所有支付线节点，设置为隐藏状态
        this.lineNodes.forEach((node) => {
            node.active = false;
        });
    }

    /**
     * 显示指定索引的支付线
     * @param lineIndex 要显示的支付线索引（从0开始）
     */
    showPayline(lineIndex: number): void {
        // TS安全校验：避免索引超出数组范围导致报错
        if (lineIndex < 0 || lineIndex >= this.lineNodes.length) {
            console.warn(`支付线索引${lineIndex}超出有效范围`);
            return;
        }

        // 遍历支付线数组，显示指定索引的支付线并终止遍历
        for (let t = 0; t < this.lineNodes.length; t++) {
            if (t === lineIndex) {
                this.lineNodes[t].active = true;
                break;
            }
        }
    }
}