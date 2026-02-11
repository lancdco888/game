
// 导入奖金组件依赖
import PrizeComponent_HoundOfHades from './PrizeComponent_HoundOfHades';

const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - 红色奖金符号组件
 * 核心职责：
 * 1. 初始化红色符号状态（播放feature1动画）
 * 2. 设置红色符号奖金信息（播放feature2动画、更新奖金UI、调度idle动画）
 */
@ccclass()
export default class BonusRedComponent_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 符号骨骼动画组件 */
    @property(sp.Skeleton)
    public symbol_Ani: sp.Skeleton = null;

    /** 信息面板动画组件（B2_feature1/B2_feature2动画） */
    @property(cc.Animation)
    public info_Animation: cc.Animation = null;

    // ====== 私有常量（动画名称，原代码硬编码值） ======
    /** feature1动画名称（初始化红色符号） */
    private readonly _featureName: string = "3_feature1_B2";
    /** feature2动画名称（设置奖金） */
    private readonly _featrue2Name: string = "4_feature2_B2";
    /** idle动画名称（持续显示状态） */
    private readonly _idleName: string = "2_stay";

    // ====== 核心方法 ======
    /**
     * 初始化红色符号状态
     * 1. 播放feature1骨骼动画（B2版本）
     * 2. 播放信息面板B2_feature1动画
     */
    setRed(): void {
        // 播放feature1骨骼动画（非循环）
        if (this.symbol_Ani) {
            this.symbol_Ani.setAnimation(0, this._featureName, false);
        } else {
            console.warn("BonusRedComponent: symbol_Ani 未配置！");
        }

        // 播放信息面板B2_feature1动画
        if (this.info_Animation) {
            this.info_Animation.play("B2_feature1");
        } else {
            console.warn("BonusRedComponent: info_Animation 未配置！");
        }
    }

    /**
     * 设置红色符号奖金信息并更新UI和动画
     * @param prizeInfo 奖金信息对象（包含类型、key、奖金金额）
     */
    setPrizeRed(prizeInfo: PrizeInfo): void {
        // 安全校验：参数无效时直接返回
        if (!prizeInfo || typeof prizeInfo !== 'object' || isNaN(prizeInfo.prize)) {
            console.warn("BonusRedComponent: prizeInfo必须为包含有效prize的对象！");
            return;
        }

        // 停止所有已调度的回调（避免重复执行）
        this.unscheduleAllCallbacks();

        // 播放feature2骨骼动画（非循环）
        if (this.symbol_Ani) {
            this.symbol_Ani.setAnimation(0, this._featrue2Name, false);
        }

        // 提取奖金信息：jackpot类型时获取key，否则为空字符串
        const { type, key, prize } = prizeInfo;
        const jackpotKey = type === "jackpot" ? key : "";

        // 更新奖金组件的奖金显示（第三个参数为true，对应红色符号标识）
        const prizeComponent = this.getComponent(PrizeComponent_HoundOfHades);
        if (prizeComponent) {
            prizeComponent.setPrize(prize, jackpotKey, true);
        } else {
            console.warn("BonusRedComponent: 未找到PrizeComponent_HoundOfHades组件！");
        }

        // 播放信息面板B2_feature2动画
        if (this.info_Animation) {
            this.info_Animation.play("B2_feature2");
        }

        // 1秒后播放idle循环动画
        this.scheduleOnce(() => {
            if (this.symbol_Ani) {
                this.symbol_Ani.setAnimation(0, this._idleName, true);
            }
        }, 1);
    }
}

/**
 * 奖金信息接口（匹配业务逻辑中用到的属性）
 */
interface PrizeInfo {
    /** 奖金类型（jackpot/普通） */
    type: string;
    /** jackpot标识key（仅jackpot类型有效） */
    key: string;
    /** 奖金金额 */
    prize: number;
}