import SlotSoundController from "../../Slot/SlotSoundController";
import CurrencyFormatHelper from "../../global_utility/CurrencyFormatHelper";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SlotManager from "../../manager/SlotManager";

const { ccclass, property } = cc._decorator;


/**
 * 龙珠游戏功能信息单元组件
 * 管理单类龙珠（红/蓝/绿）的计数、倍数、动画特效、置灰状态等核心逻辑
 */
@ccclass()
export default class FeatureInfo_DragonOrbs extends cc.Component {
    // ===================== 序列化属性（与原JS一致） =====================
    /** 龙珠计数文本标签 */
    @property(cc.Label)
    public orbCnt: cc.Label | null = null;

    /** 倍数文本标签（如 2x/3x） */
    @property(cc.Label)
    public multiplier: cc.Label | null = null;

    /** 基础特效节点 */
    @property(cc.Node)
    public baseFx: cc.Node | null = null;

    /** 龙珠动画组件 */
    @property(cc.Animation)
    public orbAnimation: cc.Animation | null = null;

    /** 基础模式下计数增加特效节点 */
    @property(cc.Node)
    public spinCntReceive_base: cc.Node | null = null;

    /** 免费旋转模式下计数增加特效节点 */
    @property(cc.Node)
    public spinCntReceive_freeSpin: cc.Node | null = null;

    /** 倍数增加特效节点 */
    @property(cc.Node)
    public multiplierReceive: cc.Node | null = null;

    /** 倍数动画根节点 */
    @property(cc.Animation)
    public multiplierPivot: cc.Animation | null = null;

    /** 免费旋转数字动画根节点 */
    @property(cc.Animation)
    public FSNumPivot: cc.Animation | null = null;

    /** 置灰遮罩节点 */
    @property(cc.Node)
    public dim: cc.Node | null = null;

    /** 计量表标识（对应Gauge数据） */
    @property
    public gaugeKey: string = "";

    /** 状态标识（base/freeSpin_red/blue/green） */
    @property
    public stateKey: string = "";

    /** 基础倍数（初始倍数） */
    @property
    public baseMultiplier: number = 0;

    // ===================== 私有状态（与原JS一致） =====================
    /** 当前龙珠计数 */
    private _currentOrbCnt: number = 0;

    // ===================== 核心业务方法（与原JS逻辑1:1） =====================
    /**
     * 初始化组件（加载计数/倍数、重置状态）
     */
    public init(): void {
        // 重置当前计数
        this._currentOrbCnt = 0;
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();

        // 1. 非base模式且匹配当前状态 → 从子游戏状态获取总计数
        if (nextSubGameKey !== "base" && nextSubGameKey === this.stateKey) {
            const subGameState = SlotGameResultManager.Instance.getSubGameState(nextSubGameKey);
            if (subGameState) {
                this._currentOrbCnt = subGameState.totalCnt;
            }
        } else {
            // 2. base模式/不匹配状态 → 从计量表获取计数+8
            this._currentOrbCnt = SlotManager.Instance.getGauges(this.gaugeKey) + 8;
        }

        // 更新计数文本（格式化数字）
        this.orbCnt!.string = CurrencyFormatHelper.formatNumber(this._currentOrbCnt);
        // 取消置灰
        this.setDim(false);

        // 3. 匹配当前状态 → 更新倍数文本
        if (nextSubGameKey === this.stateKey) {
            const spinMultiplier = SlotManager.Instance.getGauges("spinMultiplier");
            if (spinMultiplier > 0) {
                this.multiplier!.string = `${spinMultiplier}x`;
            }
        }
    }

    /**
     * 重置组件（恢复初始计数和基础倍数）
     */
    public reset(): void {
        // 恢复初始计数（8）
        this._currentOrbCnt = 8;
        // 更新计数文本
        this.orbCnt!.string = CurrencyFormatHelper.formatNumber(this._currentOrbCnt);
        // 恢复基础倍数文本
        this.multiplier!.string = `${CurrencyFormatHelper.formatNumber(this.baseMultiplier)}x`;
    }

    /**
     * 免费旋转模式下增加计数（播放音效+动画）
     */
    public addCntInFreeSpin(): void {
        const self = this;
        // 获取当前子游戏状态
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const subGameState = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey);

        // 播放计数增加音效
        SlotSoundController.Instance().playAudio("WheelAddCnt", "FX");

        // 重启免费旋转计数特效节点
        this.spinCntReceive_freeSpin!.active = false;
        this.spinCntReceive_freeSpin!.active = true;

        // 子游戏状态有效 → 更新计数+播放动画
        if (subGameState) {
            this._currentOrbCnt = subGameState.totalCnt;
            
            // 播放免费旋转数字增加动画（完成后切闲置动画）
            this.FSNumPivot!.play("Left_UI_Multi_Num_Plus_Ani", 0);
            this.FSNumPivot!.once("finished", () => {
                self.FSNumPivot!.play("Left_UI_Multi_Num_Idle_Ani", 0);
                self.spinCntReceive_freeSpin!.active = false;
            });

            // 更新计数文本
            this.orbCnt!.string = CurrencyFormatHelper.formatNumber(this._currentOrbCnt);
        }
    }

    /**
     * 基础模式下增加计数（播放动画+延迟重置）
     */
    public addCnt(): void {
        const self = this;
        // 计数+1
        this._currentOrbCnt++;

        // 播放龙珠接收动画
        this.orbAnimation!.play("Left_UI_Symbol_Recieve_Ani", 0);
        
        // 重启基础计数特效节点
        this.spinCntReceive_base!.active = false;
        this.spinCntReceive_base!.active = true;

        // 1秒后停止龙珠动画+切闲置动画+隐藏特效节点
        this.scheduleOnce(() => {
            if (TSUtility.isValid(self.orbAnimation)) {
                self.orbAnimation!.stop();
                self.orbAnimation!.play("Left_UI_Symbol_Idle_Ani", 0);
            }
            self.spinCntReceive_base!.active = false;
        }, 1);

        // 播放数字增加动画（完成后切闲置动画）
        this.FSNumPivot!.play("Left_UI_Multi_Num_Plus_Ani", 0);
        this.FSNumPivot!.once("finished", () => {
            self.FSNumPivot!.play("Left_UI_Multi_Num_Idle_Ani", 0);
        });

        // 更新计数文本
        this.orbCnt!.string = CurrencyFormatHelper.formatNumber(this._currentOrbCnt);
    }

    /**
     * 增加倍数（播放音效+动画+更新倍数文本）
     */
    public addMultiplier(): void {
        const self = this;
        // 获取当前倍数
        const spinMultiplier = SlotManager.Instance.getGauges("spinMultiplier");

        // 重启倍数增加特效节点
        this.multiplierReceive!.active = false;
        this.multiplierReceive!.active = true;

        // 重置倍数动画缩放+停止动画
        this.multiplierPivot!.stop();
        this.multiplierPivot!.node.setScale(1, 1);

        // 播放倍数增加音效
        SlotSoundController.Instance().playAudio("WheelAddMulti", "FX");

        // 更新倍数文本
        this.multiplier!.string = `${spinMultiplier}x`;

        // 播放倍数数字增加动画（完成后切脉动动画）
        this.multiplierPivot!.play("Left_UI_Multi_Num_Plus_Ani", 0);
        this.multiplierPivot!.once("finished", () => {
            self.multiplierPivot!.play("Left_UI_Multi_Num_Pumping_Ani", 0);
        });

        // 1秒后隐藏倍数增加特效节点
        this.scheduleOnce(() => {
            self.multiplierReceive!.active = false;
        }, 1);
    }

    /**
     * 设置置灰状态（同步控制基础特效显示）
     * @param isDim 是否置灰
     */
    public setDim(isDim: boolean): void {
        this.dim!.active = isDim;
        this.baseFx!.active = !isDim;
    }

    /**
     * 播放功能特效（放大节点+播放倍数脉动动画+隐藏基础特效）
     */
    public featureFxPlay(): void {
        this.baseFx!.active = false;
        this.multiplierPivot!.play("Left_UI_Multi_Num_Pumping_Ani", 0);
        this.node.scale = 1.13; // 放大13%
    }

    /**
     * 停止功能特效（恢复节点大小+播放倍数闲置动画+显示基础特效）
     */
    public featureFxStop(): void {
        this.baseFx!.active = true;
        this.multiplierPivot!.play("Left_UI_Multi_Num_Idle_Ani", 0);
        this.node.scale = 1; // 恢复原大小
    }
}
