import ChangeNumberComponent from "../../Slot/ChangeNumberComponent";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";

const { ccclass, property } = cc._decorator;

/**
 * 奖励信息接口（匹配业务传入的奖励数据结构）
 */
interface PrizeInfo {
    type: string;          // 奖励类型（如 "jackpot"）
    prize: number;         // 奖励金额/基数
    subID: number;         // 子ID（Jackpot类型：0=mini,1=minor,2=major,3=mega）
    prizeUnit: string;     // 奖励单位（如 "FixedCoin"）
    multiplier?: number;   // 倍数（可选）
}

/**
 * 哈迪斯之犬 - 奖励组件
 * 负责奖励UI的初始化、奖金展示、倍数计算、Jackpot标题显示、数字变化动画控制
 */
@ccclass('PrizeComponent_HoundOfHades')
export default class PrizeComponent_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** Jackpot标题节点数组（mini/minor/major/mega） */
    @property([cc.Node])
    public jakcpotTitle_Nodes: cc.Node[] = [];

    /** 倍数显示节点（X2/X4等） */
    @property(cc.Node)
    public multiPlier_Node: cc.Node | null = null;

    /** 奖金显示根节点 */
    @property(cc.Node)
    public prize_Node: cc.Node | null = null;

    /** 奖金标签数组（不同样式/大小的标签） */
    @property([cc.Label])
    public prize_Labels: cc.Label[] = [];

    /** 奖励信息动画节点 */
    @property(cc.Node)
    public info_Ani: cc.Node | null = null;

    // ====== 私有成员变量 ======
    /** 当前倍数（默认1） */
    private _multi: number = 1;

    // ====== 核心方法 ======
    /**
     * 初始化奖励UI（隐藏所有奖励相关节点）
     */
    initPrize(): void {
        // 隐藏所有Jackpot标题
        for (let i = 0; i < this.jakcpotTitle_Nodes.length; i++) {
            this.jakcpotTitle_Nodes[i].active = false;
        }

        // 隐藏所有奖金标签
        for (let i = 0; i < this.prize_Labels.length; i++) {
            this.prize_Labels[i].node.active = false;
        }

        // 隐藏倍数节点
        if (this.multiPlier_Node) {
            this.multiPlier_Node.active = false;
        }

        // 隐藏奖金根节点（检查节点有效性）
        if (TSUtility.isValid(this.prize_Node)) {
            this.prize_Node.active = false;
        }
    }

    /**
     * 初始化倍数（重置为1）
     */
    initMulti(): void {
        this._multi = 1;
    }

    /**
     * 设置中心奖励信息
     * @param prizeInfo 奖励信息对象（无效时显示随机奖金）
     * @param isResetMulti 是否重置倍数（默认false）
     */
    setCenterInfo(prizeInfo: PrizeInfo | null, isResetMulti: boolean = false): void {
        // 初始化奖励UI + 可选重置倍数
        this.initPrize();
        if (isResetMulti) {
            this.initMulti();
        }

        // 奖励信息无效时，显示随机固定奖金
        if (!TSUtility.isValid(prizeInfo)) {
            // 随机奖金基数数组
            const randomPrizeBases = [25, 50, 75, 100, 150, 200, 300, 400];
            // 随机选一个基数
            const randomBase = randomPrizeBases[Math.floor(Math.random() * randomPrizeBases.length)];
            // 计算最终奖金（基数 * 当前每线投注）
            const finalPrize = randomBase * SlotGameRuleManager.Instance.getCurrentBetPerLine();
            // 选择奖金标签索引（<500用索引0，否则用索引1）
            const labelIndex = randomBase < 500 ? 0 : 1;

            // 显示对应奖金标签
            for (let i = 0; i < this.prize_Labels.length; i++) {
                this.prize_Labels[i].node.active = (i === labelIndex);
            }

            // 显示奖金根节点 + 设置奖金文本（格式化）
            if (this.prize_Node) {
                this.prize_Node.active = true;
            }
            this.prize_Labels[labelIndex].string = CurrencyFormatHelper.formatEllipsisNumberUsingDotUnderPointCount(finalPrize, 1);
            return;
        }

        // 奖励信息有效时，处理实际奖励
        this._multi = isResetMulti ? 1 : (prizeInfo.multiplier || 1);
        const prizeType = prizeInfo.type;
        const prizeValue = prizeInfo.prize * this._multi;
        const subId = prizeInfo.subID;

        // 固定金币奖励（FixedCoin）
        if (prizeInfo.prizeUnit === "FixedCoin") {
            const threshold = 500 * SlotGameRuleManager.Instance.getCurrentBetPerLine();
            const labelIndex = prizeInfo.prize < threshold ? 0 : 1;

            // 显示奖金根节点 + 对应标签
            if (this.prize_Node) {
                this.prize_Node.active = true;
            }
            for (let i = 0; i < this.prize_Labels.length; i++) {
                this.prize_Labels[i].node.active = (i === labelIndex);
            }

            // 设置奖金文本（格式化）
            this.prize_Labels[labelIndex].string = CurrencyFormatHelper.formatEllipsisNumberUsingDotUnderPointCount(prizeInfo.prize, 1);
        }
        // Jackpot奖励
        else if (prizeType === "jackpot") {
            // 显示对应Jackpot标题（subId对应索引：0=mini,1=minor,2=major,3=mega）
            if (this.jakcpotTitle_Nodes[subId]) {
                this.jakcpotTitle_Nodes[subId].active = true;
            }

            // 倍数>1时显示倍数节点
            if (this._multi > 1 && this.multiPlier_Node) {
                this.multiPlier_Node.active = true;
                const multiLabel = this.multiPlier_Node.getComponent(cc.Label);
                if (multiLabel) {
                    multiLabel.string = "X" + this._multi.toString();
                }
            }
        }
        // 普通倍数奖励
        else {
            const finalPrize = prizeValue * SlotGameRuleManager.Instance.getCurrentBetPerLine();
            const labelIndex = prizeInfo.prize < 500 ? 0 : 1;

            // 显示奖金根节点 + 对应标签
            if (this.prize_Node) {
                this.prize_Node.active = true;
            }
            for (let i = 0; i < this.prize_Labels.length; i++) {
                this.prize_Labels[i].node.active = (i === labelIndex);
            }

            // 设置奖金文本（格式化）
            this.prize_Labels[labelIndex].string = CurrencyFormatHelper.formatEllipsisNumberUsingDotUnderPointCount(finalPrize, 1);
        }
    }

    /**
     * 设置奖金显示
     * @param prize 奖金金额
     * @param jackpotType Jackpot类型（mini/minor/major/mega，空则显示普通奖金）
     * @param isResetMulti 是否重置倍数（默认false）
     */
    setPrize(prize: number, jackpotType: string = "", isResetMulti: boolean = false): void {
        this.initPrize();

        // 奖金无效时直接返回
        if (prize <= 0) {
            return;
        }

        // 重置倍数
        if (isResetMulti) {
            this.initMulti();
        }

        // Jackpot类型奖励
        if (jackpotType !== "") {
            let jackpotIndex = 0;
            // 匹配Jackpot索引（0=mini,1=minor,2=major,3=mega）
            switch (jackpotType.toLowerCase()) {
                case "mega":
                    jackpotIndex = 3;
                    break;
                case "major":
                    jackpotIndex = 2;
                    break;
                case "minor":
                    jackpotIndex = 1;
                    break;
                case "mini":
                    jackpotIndex = 0;
                    break;
                default:
                    jackpotIndex = 0;
                    break;
            }
            // 显示对应Jackpot标题
            if (this.jakcpotTitle_Nodes[jackpotIndex]) {
                this.jakcpotTitle_Nodes[jackpotIndex].active = true;
            }
        }
        // 普通奖金
        else {
            const finalPrize = prize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
            const labelIndex = prize < 500 ? 0 : 1;

            // 显示奖金根节点 + 对应标签
            if (this.prize_Node) {
                this.prize_Node.active = true;
            }
            for (let i = 0; i < this.prize_Labels.length; i++) {
                this.prize_Labels[i].node.active = (i === labelIndex);
            }

            // 设置奖金文本（格式化）
            this.prize_Labels[labelIndex].string = CurrencyFormatHelper.formatEllipsisNumberUsingDotUnderPointCount(finalPrize, 1);
        }
    }

    /**
     * 设置金币显示（直接显示指定金币数）
     * @param coin 金币数
     */
    setCoin(coin: number): void {
        this.initPrize();

        // 计算标签索引（<500倍每线投注用索引0，否则用索引1）
        const threshold = 500 * SlotGameRuleManager.Instance.getCurrentBetPerLine();
        const labelIndex = coin < threshold ? 0 : 1;

        // 显示奖金根节点 + 对应标签
        if (this.prize_Node) {
            this.prize_Node.active = true;
        }
        for (let i = 0; i < this.prize_Labels.length; i++) {
            this.prize_Labels[i].node.active = (i === labelIndex);
        }

        // 设置金币文本（格式化）
        this.prize_Labels[labelIndex].string = CurrencyFormatHelper.formatEllipsisNumberUsingDotUnderPointCount(coin, 1);
    }

    /**
     * 更新中心奖励信息（倍数翻倍 + 播放数字变化动画）
     * @param prizeInfo 奖励信息对象（无效时显示随机奖金）
     */
    setUpdateCenterInfo(prizeInfo: PrizeInfo | null): void {
        this.initPrize();

        // 奖励信息有效时处理
        if (TSUtility.isValid(prizeInfo)) {
            const prizeType = prizeInfo.type;
            let prizeValue = prizeInfo.prize;
            const subId = prizeInfo.subID;

            // 固定金币奖励（FixedCoin）
            if (prizeInfo.prizeUnit === "FixedCoin") {
                const threshold = 500 * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                // 计算基础值（奖金 / 固定倍数）* 当前倍数
                const baseValue = Math.floor(prizeValue / this.getFixedMulti()) * this._multi;
                // 倍数翻倍
                this._multi *= 2;
                // 计算最终值
                const finalValue = Math.floor(prizeValue / this.getFixedMulti()) * this._multi;
                // 选择标签索引
                const labelIndex = finalValue < threshold ? 0 : 1;

                // 显示奖金根节点 + 对应标签
                if (this.prize_Node) {
                    this.prize_Node.active = true;
                }
                for (let i = 0; i < this.prize_Labels.length; i++) {
                    this.prize_Labels[i].node.active = (i === labelIndex);
                }

                // 播放数字变化动画
                const changeNumberComp = this.prize_Labels[labelIndex].getComponent(ChangeNumberComponent);
                if (changeNumberComp) {
                    changeNumberComp.playChangeNumberFormatEllipsisNumberUsingDotUnderPointCount(
                        baseValue, 
                        finalValue, 
                        1, 
                        null, 
                        0.5
                    );
                } else {
                    cc.log("PrizeComponent: ChangeNumberComponent 组件不存在");
                }
            }
            // Jackpot奖励
            else if (prizeType === "jackpot") {
                // 显示对应Jackpot标题
                if (this.jakcpotTitle_Nodes[subId]) {
                    this.jakcpotTitle_Nodes[subId].active = true;
                }

                // 倍数翻倍
                this._multi *= 2;

                // 倍数>1时显示倍数节点
                if (this._multi > 1 && this.multiPlier_Node) {
                    this.multiPlier_Node.active = true;
                    const multiLabel = this.multiPlier_Node.getComponent(cc.Label);
                    if (multiLabel) {
                        multiLabel.string = "X" + this._multi.toString();
                    }
                }
            }
            // 普通倍数奖励
            else {
                // 计算基础值（奖金 * 当前倍数 * 每线投注）
                const baseValue = prizeValue * this._multi * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                // 倍数翻倍
                this._multi *= 2;
                // 计算最终值
                const finalValue = prizeValue * this._multi * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                // 选择标签索引
                const labelIndex = (prizeValue * (prizeInfo.multiplier || 1)) < 500 ? 0 : 1;

                // 显示奖金根节点 + 对应标签
                if (this.prize_Node) {
                    this.prize_Node.active = true;
                }
                for (let i = 0; i < this.prize_Labels.length; i++) {
                    this.prize_Labels[i].node.active = (i === labelIndex);
                }

                // 播放数字变化动画
                const changeNumberComp = this.prize_Labels[labelIndex].getComponent(ChangeNumberComponent);
                if (changeNumberComp) {
                    changeNumberComp.playChangeNumberFormatEllipsisNumberUsingDotUnderPointCount(
                        baseValue, 
                        finalValue, 
                        1, 
                        null, 
                        0.5
                    );
                } else {
                    cc.log("PrizeComponent: ChangeNumberComponent 组件不存在");
                }
            }
        }
        // 奖励信息无效时，显示随机奖金
        else {
            const randomPrizeBases = [25, 50, 75, 100, 150, 200, 300, 400];
            const randomBase = randomPrizeBases[Math.floor(Math.random() * randomPrizeBases.length)];
            const finalPrize = randomBase * SlotGameRuleManager.Instance.getCurrentBetPerLine();
            const labelIndex = randomBase < 500 ? 0 : 1;

            // 显示对应奖金标签
            for (let i = 0; i < this.prize_Labels.length; i++) {
                this.prize_Labels[i].node.active = (i === labelIndex);
            }

            // 设置奖金文本（格式化）
            this.prize_Labels[labelIndex].string = CurrencyFormatHelper.formatEllipsisNumberUsingDotUnderPointCount(finalPrize, 1);
        }
    }

    /**
     * 获取固定倍数（基于红色符号数量计算：2^红色符号数）
     * @returns 固定倍数
     */
    getFixedMulti(): number {
        let redSymbolCount = 0;
        // 遍历5列3行的滚轮
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                // 统计红色符号数量
                if (this.isNewRed(col, row)) {
                    redSymbolCount++;
                }
            }
        }
        // 倍数 = 2的红色符号数次方
        return Math.pow(2, redSymbolCount);
    }

    /**
     * 检查指定位置是否为新红色符号（符号ID=62）
     * @param col 列索引
     * @param row 行索引
     * @returns 是否为红色符号
     */
    isNewRed(col: number, row: number): boolean {
        const historyWindows = SlotGameResultManager.Instance.getHistoryWindows();
        // 遍历历史窗口，检查符号ID是否为62
        for (let i = 0; i < historyWindows.length; i++) {
            const symbolId = historyWindows[i].GetWindow(col).getSymbol(row);
            if (symbolId === 62) {
                return true;
            }
        }
        return false;
    }

    /**
     * 直接设置倍数显示（仅显示倍数，不修改内部_multi值）
     * @param multi 要显示的倍数
     */
    setJustMulti(multi: number): void {
        this.initPrize();
        // 显示倍数节点并设置文本
        if (this.multiPlier_Node) {
            this.multiPlier_Node.active = true;
            const multiLabel = this.multiPlier_Node.getComponent(cc.Label);
            if (multiLabel) {
                multiLabel.string = "X" + multi.toString();
            }
        }
    }

    /**
     * 播放奖励信息动画
     * @param aniName 动画名称
     */
    setMultiAni(aniName: string): void {
        // 检查动画节点有效性
        if (TSUtility.isValid(this.info_Ani)) {
            const animationComp = this.info_Ani.getComponent(cc.Animation);
            if (animationComp) {
                // 停止当前动画 → 播放指定动画 → 重置动画时间到开头
                animationComp.stop();
                animationComp.play(aniName);
                animationComp.setCurrentTime(0);
            }
        }
    }
}