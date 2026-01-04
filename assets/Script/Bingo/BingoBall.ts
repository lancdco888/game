const { ccclass, property } = cc._decorator;

import BingoData, { MaxRowBingoBallCnt } from "./BingoData";

@ccclass
export default class BingoBall extends cc.Component {
    @property(cc.Label)
    public numberLabel: cc.Label = null;

    @property(cc.Sprite)
    public sprite: cc.Sprite = null;

    @property([cc.SpriteFrame])
    public colSpriteFrames: cc.SpriteFrame[] = [];

    @property([cc.Font])
    public colFonts: cc.Font[] = [];

    /**
     * 设置球的数字 并匹配对应行列的配色/字体
     * @param num 球的数字(1-75)
     */
    public setNumber(num: number): void {
        this.numberLabel.string = num.toString();
        const colIdx = Math.floor((num - 1) / MaxRowBingoBallCnt);
        this.sprite.spriteFrame = this.colSpriteFrames[colIdx];
        this.numberLabel.font = this.colFonts[colIdx];
    }
}