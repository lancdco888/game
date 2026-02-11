// 导入奖金组件依赖
import PrizeComponent_HoundOfHades from './PrizeComponent_HoundOfHades';

const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - 绿色奖金符号组件
 * 核心职责：
 * 1. 初始化绿色符号状态（播放feature1动画、重置奖金）
 * 2. 累加奖金金额（播放feature2动画、更新奖金UI、调度stay动画）
 */
@ccclass()
export default class BonusGreenComponent_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 符号骨骼动画组件 */
    @property(sp.Skeleton)
    public symbol_Ani: sp.Skeleton = null;

    /** 信息面板动画组件（B3_feature2动画） */
    @property(cc.Animation)
    public info_Animation: cc.Animation = null;

    /** 信息面板根节点（用于重置缩放） */
    @property(cc.Node)
    public info_Node: cc.Node = null;

    // ====== 私有常量（动画名称，原代码硬编码值） ======
    /** feature1动画名称（初始化绿色符号） */
    private readonly _featureName: string = "3_feature1";
    /** feature2动画名称（累加金额） */
    private readonly _featrue2Name: string = "4_feature2";
    /** stay动画名称（持续显示状态） */
    private readonly _stay: string = "2_stay";

    // ====== 私有状态变量 ======
    /** 当前累计金币金额 */
    private _currentCoin: number = 0;

    // ====== 核心方法 ======
    /**
     * 初始化绿色符号状态
     * 1. 重置累计金币为0
     * 2. 播放feature1骨骼动画
     * 3. 初始化奖金组件UI
     */
    setGreen(): void {
        // 重置累计金币
        this._currentCoin = 0;

        // 播放feature1骨骼动画（非循环）
        if (this.symbol_Ani) {
            this.symbol_Ani.setAnimation(0, this._featureName, false);
        } else {
            console.warn("BonusGreenComponent: symbol_Ani 未配置！");
        }

        // 获取并初始化奖金组件
        const prizeComponent = this.getComponent(PrizeComponent_HoundOfHades);
        if (prizeComponent) {
            prizeComponent.initPrize();
        } else {
            console.warn("BonusGreenComponent: 未找到PrizeComponent_HoundOfHades组件！");
        }
    }

    /**
     * 累加奖金金额并更新UI和动画
     * @param addCoin 要累加的金币金额
     */
    addAmount(addCoin: number): void {
        // 安全校验：参数非数字时直接返回
        if (typeof addCoin !== 'number' || isNaN(addCoin)) {
            console.warn("BonusGreenComponent: addCoin必须为有效数字！");
            return;
        }

        // 停止所有已调度的回调（避免重复执行）
        this.unscheduleAllCallbacks();

        // 播放feature2骨骼动画（非循环）
        if (this.symbol_Ani) {
            this.symbol_Ani.setAnimation(0, this._featrue2Name, false);
        }

        // 累加金币金额
        this._currentCoin += addCoin;

        // 更新奖金组件的金币显示
        const prizeComponent = this.getComponent(PrizeComponent_HoundOfHades);
        if (prizeComponent) {
            prizeComponent.setCoin(this._currentCoin);
        }

        // 播放信息面板feature2动画（重置并从头播放）
        if (this.info_Animation) {
            this.info_Animation.stop();
            this.info_Animation.play("B3_feature2");
            this.info_Animation.setCurrentTime(0);
        }

        // 1秒后重置信息节点缩放并播放stay循环动画
        this.scheduleOnce(() => {
            // 重置信息节点缩放为1
            if (this.info_Node) {
                this.info_Node.scale = 1;
            }

            // 播放stay骨骼动画（循环）
            if (this.symbol_Ani) {
                this.symbol_Ani.setAnimation(0, this._stay, true);
            }
        }, 1);
    }
}