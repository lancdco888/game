import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";

const { ccclass, property } = cc._decorator;


/**
 * LuckyBunnyDrop Jackpot符号组件
 * 负责Jackpot符号的显示、奖励金额计算、类型控制等逻辑
 */
@ccclass('JackpotSymbolComponent_LucykyBunnyDrop')
export default class JackpotSymbolComponent_LucykyBunnyDrop extends cc.Component {
    // Jackpot类型节点数组（对应mini/minor/major/mega等）
    @property([cc.Node])
    public jackpot_Nodes: cc.Node[] = [];

    // 倍数显示节点
    @property(cc.Node)
    public multi_Node: cc.Node | null = null;

    // 旋转特效节点
    @property(cc.Node)
    public spin_Node: cc.Node | null = null;

    // 奖励金额显示标签
    @property(cc.Label)
    public prize: cc.Label | null = null;

    // 私有变量：Jackpot类型（1-5对应mini/major等，0为倍数，-1为未初始化）
    public _jackpotType: number = -1;
    // 私有变量：奖励基数
    public _prize: number = 0;
    // 私有变量：倍数
    public _multiplier: number = 0;
    // 私有变量：符号ID
    public _symbolID: number = 0;
    // 私有变量：最终奖励金额
    public _money: number = 0;
    // 私有变量：列索引
    public _col: number = -1;

    /**
     * 初始化符号状态（重置所有节点和变量）
     */
    public initSymbol(): void {
        // 隐藏所有Jackpot类型节点
        for (let i = 0; i < this.jackpot_Nodes.length; i++) {
            this.jackpot_Nodes[i].active = false;
        }

        // 隐藏倍数/旋转/奖励节点
        if (this.multi_Node) this.multi_Node.active = false;
        if (this.spin_Node) this.spin_Node.active = false;
        if (this.prize?.node) this.prize.node.active = false;

        // 重置所有私有变量
        this._jackpotType = -1;
        this._prize = 0;
        this._multiplier = 0;
        this._symbolID = 0;
        this._money = 0;
        this._col = -1;
    }

    /**
     * 设置Jackpot符号中心显示信息
     * @param symbolId 符号ID
     * @param jackpotType Jackpot类型（1-5）
     * @param multiplier 倍数（可选）
     */
    public setCenterInfo(symbolId: number, jackpotType: number, multiplier?: number): void {
        // 初始化符号状态
        this.initSymbol();
        this._money = 0;

        // 过滤无效符号ID（90/100/200为无效）
        if (symbolId !== 90 && symbolId !== 100 && symbolId !== 200) {
            this._symbolID = symbolId;

            // 92号符号：显示旋转节点
            if (symbolId === 92) {
                if (this.spin_Node) this.spin_Node.active = true;
            }
            // 93号符号：显示倍数节点
            else if (symbolId === 93) {
                if (this.multi_Node) this.multi_Node.active = true;
            }
            // 其他有效符号
            else {
                this._symbolID = 91; // 重置为基础Jackpot符号ID

                // 符号ID大于200时，从ID解析奖励信息
                if (symbolId > 200) {
                    this.setSymbolInfo(symbolId);
                }
                // 符号ID≤200时，从传入的Jackpot类型解析
                else {
                    this._jackpotType = jackpotType;

                    // Jackpot类型>0（mini/major等）：设置固定倍数
                    if (jackpotType > 0) {
                        switch (jackpotType) {
                            case 1: this._multiplier = 500; break;    // mini
                            case 2: this._multiplier = 1250; break;   // minor
                            case 3: this._multiplier = 2500; break;   // major
                            case 4: this._multiplier = 5000; break;  // mega
                            case 5: this._multiplier = 50000; break; // grand
                        }
                    }
                    // Jackpot类型=0（倍数类型）：使用传入的倍数
                    else {
                        this._multiplier = multiplier === 0 ? 1 : (multiplier ?? 1);
                    }
                }

                // 倍数类型（_jackpotType=0）：显示奖励金额
                if (this._jackpotType === 0) {
                    if (this.prize?.node) {
                        this.prize.node.active = true;
                        // 计算最终奖励金额（每线投注额 × 倍数）
                        this._money = SlotGameRuleManager.Instance.getCurrentBetPerLine() * this._multiplier;
                        // 格式化金额显示（保留1位小数，省略大数）
                        this.prize.string = CurrencyFormatHelper.formatEllipsisNumberUsingDotUnderPointCount(this._money, 1);
                        // 自适应字体大小
                        this.prize.fontSize = this.prize.string.length > 4 ? 36 : 40;
                    }
                }
                // Jackpot类型（1-5）：显示对应类型节点
                else if (this._jackpotType > 0 && this._jackpotType <= 5) {
                    // 计算最终奖励金额
                    this._money = SlotGameRuleManager.Instance.getCurrentBetPerLine() * this._multiplier;
                    // 显示对应Jackpot类型节点
                    if (this.jackpot_Nodes[this._jackpotType - 1]) {
                        this.jackpot_Nodes[this._jackpotType - 1].active = true;
                    }
                }
            }
        }
        // 无效符号ID：重置为90
        else {
            this._symbolID = 90;
        }
    }

    /**
     * 获取Jackpot类型
     * @returns Jackpot类型（1-5/0/-1）
     */
    public getJackpotType(): number {
        return this._jackpotType;
    }

    /**
     * 根据倍数获取奖励ID
     * @returns 奖励ID（301-315对应不同倍数/Jackpot类型）
     */
    public getRewardID(): number | undefined {
        // 特殊符号ID直接返回
        if ([90, 92, 93].includes(this._symbolID)) {
            return this._symbolID;
        }

        // 根据倍数映射奖励ID
        switch (this._multiplier) {
            case 10: return 301;
            case 15: return 302;
            case 25: return 303;
            case 50: return 304;
            case 75: return 305;
            case 250: return 306;
            case 300: return 307;
            case 350: return 308;
            case 400: return 309;
            case 450: return 310;
            case 500: return 311;
            case 1250: return 312;
            case 2500: return 313;
            case 5000: return 314;
            case 50000: return 315;
            default: return undefined;
        }
    }

    /**
     * 获取最终奖励金额
     * @returns 奖励金额
     */
    public getMoney(): number {
        return this._money;
    }

    /**
     * 设置列索引
     * @param col 列索引
     */
    public setCol(col: number): void {
        this._col = col;
    }

    /**
     * 获取列索引
     * @returns 列索引
     */
    public getCol(): number {
        return this._col;
    }

    /**
     * 根据符号ID设置奖励信息（倍数/Jackpot类型）
     * @param symbolId 符号ID（201-215/301-315）
     */
    public setSymbolInfo(symbolId: number): void {
        switch (symbolId) {
            // 倍数类型（_jackpotType=0）
            case 201: case 301:
                this._jackpotType = 0; this._multiplier = 10; break;
            case 202: case 302:
                this._jackpotType = 0; this._multiplier = 15; break;
            case 203: case 303:
                this._jackpotType = 0; this._multiplier = 25; break;
            case 204: case 304:
                this._jackpotType = 0; this._multiplier = 50; break;
            case 205: case 305:
                this._jackpotType = 0; this._multiplier = 75; break;
            case 206: case 306:
                this._jackpotType = 0; this._multiplier = 250; break;
            case 207: case 307:
                this._jackpotType = 0; this._multiplier = 300; break;
            case 208: case 308:
                this._jackpotType = 0; this._multiplier = 350; break;
            case 209: case 309:
                this._jackpotType = 0; this._multiplier = 400; break;
            case 210: case 310:
                this._jackpotType = 0; this._multiplier = 450; break;
            
            // Jackpot类型（_jackpotType=1-5）
            case 211: case 311:
                this._jackpotType = 1; this._multiplier = 500; break;  // mini
            case 212: case 312:
                this._jackpotType = 2; this._multiplier = 1250; break; // minor
            case 213: case 313:
                this._jackpotType = 3; this._multiplier = 2500; break; // major
            case 214: case 314:
                this._jackpotType = 4; this._multiplier = 5000; break; // mega
            case 215: case 315:
                this._jackpotType = 5; this._multiplier = 50000; break;// grand
        }
    }
}