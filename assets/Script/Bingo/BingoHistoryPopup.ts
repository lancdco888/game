const { ccclass, property } = cc._decorator;

import BingoHistoryCell from "./BingoHistoryCell";
import BingoData, { MaxBingoBallCnt } from "./BingoData";

@ccclass
export default class BingoHistoryPopup extends cc.Component {
    @property(cc.Node)
    public selectLayer: cc.Node = null;

    @property(BingoHistoryCell)
    public cellTemplate: BingoHistoryCell = null;

    private cells: cc.Node[] = [];

    /**
     * 初始化历史球面板格子
     * @param col 列数
     * @param row 行数
     */
    public init(col: number, row: number): void {
        this.cellTemplate.node.active = true;
        for (let i = 0; i < row; ++i) {
            for (let j = 0; j < col; ++j) {
                const cellNode = cc.instantiate(this.cellTemplate.node);
                cellNode.active = true;
                const num = col * i + j + 1;
                cellNode.getComponent(BingoHistoryCell).label.string = num.toString();
                this.selectLayer.addChild(cellNode);
                cellNode.setPosition(40 * i - 19, -29 * j + 13);
                this.cells.push(cellNode);
            }
        }
        this.cellTemplate.node.active = false;
    }

    /**
     * 打开面板并显示已开出的球号
     * @param ballNumArr 已开出的球号数组
     */
    public open(ballNumArr: number[]): void {
        this.node.active = true;
        // 先隐藏所有格子
        for (let i = 0; i < MaxBingoBallCnt; ++i) {
            this.cells[i].active = false;
        }
        // 显示对应开出的球号格子
        for (let i = 0; i < ballNumArr.length; ++i) {
            const idx = ballNumArr[i] - 1;
            this.cells[idx].active = true;
        }
    }

    /**
     * 重置面板 - 隐藏所有球号格子
     */
    public reset(): void {
        for (let i = 0; i < MaxBingoBallCnt; ++i) {
            this.cells[i].active = false;
        }
    }
}