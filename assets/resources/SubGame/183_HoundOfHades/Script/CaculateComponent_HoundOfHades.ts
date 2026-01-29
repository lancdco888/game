import CurrencyFormatHelper from "../../../../Script/global_utility/CurrencyFormatHelper";
import TSUtility from "../../../../Script/global_utility/TSUtility";
import { ResultSymbolInfo } from "../../../../Script/manager/SlotGameResultManager";
import SlotGameRuleManager from "../../../../Script/manager/SlotGameRuleManager";

const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - 奖金计算组件
 * 核心职责：
 * 1. 控制奖金计算动画（普通/Jackpot类型）
 * 2. 初始化奖金相关UI（隐藏状态）
 * 3. 更新奖金中心信息（金额、倍数、Jackpot标题）
 * 4. 设置奖金UI的暗淡状态动画与文本
 */
@ccclass('CaculateComponent_HoundOfHades')
export default class CaculateComponent_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 主动画组件（locknroll_calculate系列动画） */
    @property(cc.Animation)
    public mainAni: cc.Animation | null = null;

    /** 符号骨骼动画组件 */
    @property(sp.Skeleton)
    public symbol_Ani: sp.Skeleton | null = null;

    /** Jackpot标题节点数组（注：原代码拼写错误jakcpot → jackpot，保留变量名兼容原有逻辑） */
    @property([cc.Node])
    public jakcpotTitle_Nodes: cc.Node[] = [];

    /** 倍数展示节点（X2/X3等） */
    @property(cc.Node)
    public multiPlier_Node: cc.Node | null = null;

    /** 奖金展示根节点 */
    @property(cc.Node)
    public prize_Node: cc.Node | null = null;

    /** 奖金标签数组（不同档位/样式的奖金文本） */
    @property([cc.Label])
    public prize_Labels: cc.Label[] = [];

    /** 是否为Jackpot类型计算 */
    @property
    public isJackpot: boolean = false;

    // ====== 私有常量（动画名称，原代码硬编码值） ======
    /** 计算动画名称 */
    private readonly _aniCacu: string = "locknroll_calculate";
    /** 计算暗淡动画名称 */
    private readonly _aniCacuDim: string = "locknroll_calculate_dim";
    /** 普通计算动画名称（骨骼） */
    private readonly _caculateName: string = "8_calculate";
    /** 普通暗淡计算动画名称（骨骼） */
    private readonly _dimmedName: string = "9_calculate_dim";
    /** Jackpot计算动画名称（骨骼） */
    private readonly _jackpotCaculateName: string = "6_calculate";
    /** Jackpot暗淡计算动画名称（骨骼） */
    private readonly _jackpotDimmedName: string = "7_calculate_dim";

    // ====== 核心方法 ======
    /**
     * 设置奖金计算动画与信息
     * @param resultInfo 结果信息（包含类型、倍数、奖金、subID等）
     * @param callback 动画完成回调
     */
    setCacualte(resultInfo: ResultSymbolInfo | undefined, callback?: () => void): void {
        // 步骤1：播放计算动画并设置中心信息
        const step1 = cc.callFunc(() => {
            if (!this.mainAni || !this.symbol_Ani) {
                console.warn("CaculateComponent: mainAni/symbol_Ani 未配置！");
                return;
            }

            // 选择对应类型的骨骼动画名称
            const aniName = this.isJackpot ? this._jackpotCaculateName : this._caculateName;
            
            // 重置并播放主动画
            this.mainAni.stop();
            this.mainAni.play(this._aniCacu);
            this.mainAni.setCurrentTime(0);
            
            // 播放骨骼动画并设置中心信息
            this.symbol_Ani.setAnimation(0, aniName, false);
            this.setCenterInfo(resultInfo);
        });

        // 步骤2：播放暗淡动画并设置暗淡信息
        const step2 = cc.callFunc(() => {
            if (!this.symbol_Ani) {
                console.warn("CaculateComponent: symbol_Ani 未配置！");
                return;
            }

            // 选择对应类型的暗淡骨骼动画名称
            const dimAniName = this.isJackpot ? this._jackpotDimmedName : this._dimmedName;
            
            // 播放骨骼暗淡动画并设置暗淡信息
            this.symbol_Ani.setAnimation(0, dimAniName, false);
            resultInfo && this.setDimmedInfo(resultInfo);
        });

        // 步骤3：执行回调
        const step3 = cc.callFunc(() => {
            TSUtility.isValid(callback) && callback!();
        });

        // 根据是否为Jackpot设置不同的动画时长
        if (this.isJackpot) {
            this.node.runAction(cc.sequence(step1, cc.delayTime(1), step2, step3));
        } else {
            this.node.runAction(cc.sequence(step1, cc.delayTime(1.5), step2, step3));
        }
    }

    /**
     * 初始化奖金UI（隐藏所有相关节点）
     */
    initPrize(): void {
        // 隐藏所有Jackpot标题节点
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

        // 隐藏奖金根节点
        if (TSUtility.isValid(this.prize_Node)) {
            this.prize_Node!.active = false;
        }
    }

    /**
     * 设置中心信息（奖金、倍数、Jackpot标题）
     * @param resultInfo 结果信息
     */
    setCenterInfo(resultInfo: ResultSymbolInfo | undefined): void {
        // 先初始化UI（隐藏所有元素）
        this.initPrize();

        // 结果信息有效则处理
        if (TSUtility.isValid(resultInfo)) {
            const type = resultInfo.type;
            const multiplier = resultInfo.multiplier || 1;
            let prize = resultInfo.prize * multiplier;
            const subID = resultInfo.subID || 0;
            const prizeUnit = resultInfo.prizeUnit;

            // 固定金币类型处理
            if (prizeUnit === "FixedCoin") {
                // Jackpot类型
                if (type === "jackpot") {
                    // 显示对应subID的Jackpot标题
                    if (this.jakcpotTitle_Nodes[subID]) {
                        const titleNode = this.jakcpotTitle_Nodes[subID];
                        titleNode.active = true;
                        
                        // 播放Jackpot标题Idle动画
                        const titleAni = titleNode.getComponent(cc.Animation);
                        if (titleAni) {
                            titleAni.stop();
                            titleAni.play("Txt_idle");
                            titleAni.setCurrentTime(0);
                        }
                    }

                    // 倍数>1时显示倍数节点
                    if (multiplier > 1 && this.multiPlier_Node) {
                        this.multiPlier_Node.active = true;
                        const multiLabel = this.multiPlier_Node.getComponent(cc.Label);
                        if (multiLabel) {
                            multiLabel.string = "X" + multiplier.toString();
                        }
                    }
                } 
                // 普通固定金币类型
                else {
                    // 计算奖金（500 * 当前每线投注）
                    const basePrize = 500 * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                    const finalPrize = resultInfo.prize * multiplier;
                    
                    // 选择奖金标签（<500用索引0，≥500用索引1）
                    const labelIndex = finalPrize < basePrize ? 0 : 1;
                    
                    // 显示奖金根节点和对应标签
                    if (TSUtility.isValid(this.prize_Node)) {
                        this.prize_Node!.active = true;
                    }
                    if (this.prize_Labels[labelIndex]) {
                        this.prize_Labels[labelIndex].node.active = true;
                        // 格式化奖金显示（保留1位小数，使用点分隔）
                        this.prize_Labels[labelIndex].string = CurrencyFormatHelper.formatEllipsisNumberUsingDotUnderPointCount(finalPrize, 1);
                    }
                }
            } 
            // 非固定金币类型
            else {
                // Jackpot类型
                if (type === "jackpot") {
                    // 显示对应subID的Jackpot标题
                    if (this.jakcpotTitle_Nodes[subID]) {
                        const titleNode = this.jakcpotTitle_Nodes[subID];
                        titleNode.active = true;
                        
                        // 播放Jackpot标题Idle动画
                        const titleAni = titleNode.getComponent(cc.Animation);
                        if (titleAni) {
                            titleAni.stop();
                            titleAni.play("Txt_idle");
                            titleAni.setCurrentTime(0);
                        }
                    }

                    // 倍数>1时显示倍数节点
                    if (multiplier > 1 && this.multiPlier_Node) {
                        this.multiPlier_Node.active = true;
                        const multiLabel = this.multiPlier_Node.getComponent(cc.Label);
                        if (multiLabel) {
                            multiLabel.string = "X" + multiplier.toString();
                        }
                    }
                } 
                // 普通奖金类型
                else {
                    // 计算最终奖金（奖金*倍数*当前每线投注）
                    const finalPrize = prize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                    
                    // 选择奖金标签（<500用索引0，≥500用索引1）
                    const labelIndex = prize < 500 ? 0 : 1;
                    
                    // 显示奖金根节点和对应标签
                    if (TSUtility.isValid(this.prize_Node)) {
                        this.prize_Node!.active = true;
                    }
                    if (this.prize_Labels[labelIndex]) {
                        this.prize_Labels[labelIndex].node.active = true;
                        // 格式化奖金显示
                        this.prize_Labels[labelIndex].string = CurrencyFormatHelper.formatEllipsisNumberUsingDotUnderPointCount(finalPrize, 1);
                    }
                }
            }
        } 
        // 结果信息无效时，显示随机奖金
        else {
            // 随机奖金数组
            const randomPrizeArr = [25, 50, 75, 100, 150, 200, 300, 400];
            // 随机选择一个奖金值
            const randomPrize = randomPrizeArr[Math.floor(Math.random() * randomPrizeArr.length)];
            // 计算最终奖金（随机值*当前每线投注）
            const finalPrize = randomPrize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
            // 选择奖金标签
            const labelIndex = randomPrize < 500 ? 0 : 1;
            
            // 显示对应奖金标签
            for (let i = 0; i < this.prize_Labels.length; i++) {
                this.prize_Labels[i].node.active = i === labelIndex;
            }
            if (this.prize_Labels[labelIndex]) {
                this.prize_Labels[labelIndex].string = CurrencyFormatHelper.formatEllipsisNumberUsingDotUnderPointCount(finalPrize, 1);
            }
        }
    }

    /**
     * 设置暗淡状态的信息（动画+文本）
     * @param resultInfo 结果信息
     */
    setDimmedInfo(resultInfo: ResultSymbolInfo): void {
        const type = resultInfo.type;
        const subID = resultInfo.subID || 0;
        const multiplier = resultInfo.multiplier || 1;

        // Jackpot类型处理
        if (type === "jackpot") {
            // 更新Jackpot标题暗淡动画
            if (this.jakcpotTitle_Nodes[subID]) {
                const titleNode = this.jakcpotTitle_Nodes[subID];
                const titleAni = titleNode.getComponent(cc.Animation);
                if (titleAni) {
                    titleAni.stop();
                    titleAni.play("Txt_dim");
                    titleAni.setCurrentTime(0);
                }
            }

            // 倍数>1时更新倍数文本并播放动画
            if (multiplier > 1 && this.multiPlier_Node) {
                const multiLabel = this.multiPlier_Node.getComponent(cc.Label);
                if (multiLabel) {
                    multiLabel.string = "X" + multiplier.toString();
                }

                // 播放倍数节点动画（修复原代码重复getComponent的错误）
                const multiAni = this.multiPlier_Node.getComponent(cc.Animation);
                if (TSUtility.isValid(multiAni)) {
                    multiAni.stop();
                    multiAni.play();
                    multiAni.setCurrentTime(0);
                }
            }
        } 
        // 普通奖金类型处理
        else {
            // 播放奖金节点暗淡动画
            if (TSUtility.isValid(this.prize_Node)) {
                const prizeAni = this.prize_Node!.getComponent(cc.Animation);
                if (prizeAni) {
                    prizeAni.stop();
                    prizeAni.play();
                    prizeAni.setCurrentTime(0);
                }
            }
        }
    }
}