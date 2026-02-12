import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts 顶部七星组件（控制Pot进度、动画与音效）
 */
@ccclass()
export default class TopSevenComponent_SuperSevenBlasts extends cc.Component {
    // ========== 序列化属性（对应Cocos编辑器赋值） ==========
    /** 核心动画组件（控制stay/hit/success等状态动画） */
    @property(cc.Animation)
    public targetAnimation: cc.Animation | null = null;

    /** 停留状态节点数组（对应不同Pot步骤） */
    @property([cc.Node])
    public stay_Nodes: cc.Node[] = [];

    /** 命中状态节点数组（对应不同Pot步骤） */
    @property([cc.Node])
    public hit_Nodes: cc.Node[] = [];

    /** 奖励启动成功节点数组（对应不同Pot步骤） */
    @property([cc.Node])
    public success_Nodes: cc.Node[] = [];

    // ========== 私有状态属性 ==========
    /** 上一次的Pot步骤（用于对比是否变化） */
    private _prevStep: number = 0;

    /**
     * 设置停留状态（基础Pot进度展示）
     * @param isStay 是否为停留状态（默认true）
     */
    public setStay(isStay: boolean = true): void {
        // 获取基础游戏状态中的Pot步骤
        const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");
        let currentStep = 0;
        
        // 安全获取Pot步骤值（多层空值检查）
        if (TSUtility.isValid(baseGameState) && 
            TSUtility.isValid(baseGameState.gauges) && 
            TSUtility.isValid(baseGameState.gauges.UI_Pot_step)) {
            currentStep = baseGameState.gauges.UI_Pot_step;
        }

        // 步骤变化时处理音效与状态更新
        if (this._prevStep !== currentStep) {
            // 停留状态下播放对应Pot音效
            if (isStay) {
                const audioName = currentStep === 0 ? "Pot1" : `Pot${currentStep.toString()}`;
                SlotSoundController.Instance().playAudio(audioName, "FX");
            }
            // 更新上一步骤记录
            this._prevStep = currentStep;
        }

        // 激活对应步骤的停留节点，隐藏其他节点
        this.stay_Nodes.forEach((node, index) => {
            if (TSUtility.isValid(node)) {
                node.active = index === currentStep;
            }
        });

        // 播放对应步骤的停留动画
        const animationName = `Top_Seven_stay_${currentStep.toString()}`;
        this.targetAnimation?.stop();
        this.targetAnimation?.play(animationName);
    }

    /**
     * 设置命中状态（Pot进度命中反馈）
     */
    public setAlive(): void {
        // 取消所有未执行的定时器
        this.unscheduleAllCallbacks();

        // 获取当前Pot步骤
        const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");
        let currentStep = 0;
        if (TSUtility.isValid(baseGameState) && 
            TSUtility.isValid(baseGameState.gauges) && 
            TSUtility.isValid(baseGameState.gauges.UI_Pot_step)) {
            currentStep = baseGameState.gauges.UI_Pot_step;
        }

        // 播放命中动画
        this.targetAnimation?.stop();
        this.targetAnimation?.play("Top_Seven_hit");
        this.targetAnimation?.setCurrentTime(0);

        // 步骤变化时偏移3（原业务逻辑）
        const displayStep = this._prevStep !== currentStep ? currentStep + 3 : currentStep;

        // 激活对应步骤的命中节点并播放骨骼动画
        this.hit_Nodes.forEach((node, index) => {
            if (!TSUtility.isValid(node)) return;
            
            node.active = index === displayStep;
            // 命中节点激活时播放骨骼动画（单次播放）
            if (index === displayStep) {
                const skeleton = node.getComponent(sp.Skeleton);
                if (TSUtility.isValid(skeleton)) {
                    skeleton.setAnimation(0, skeleton.defaultAnimation, false);
                }
            }
        });

        // 1.5秒后恢复停留状态
        this.scheduleOnce(() => {
            this.setStay();
        }, 1.5);
    }

    /**
     * 设置奖励启动状态（Pot满值触发奖励）
     */
    public setBonusStart(): void {
        // 取消所有未执行的定时器
        this.unscheduleAllCallbacks();

        // 获取当前Pot步骤
        const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");
        let currentStep = 0;
        if (TSUtility.isValid(baseGameState) && 
            TSUtility.isValid(baseGameState.gauges) && 
            TSUtility.isValid(baseGameState.gauges.UI_Pot_step)) {
            currentStep = baseGameState.gauges.UI_Pot_step;
        }

        // 激活对应步骤的成功节点
        this.success_Nodes.forEach((node, index) => {
            if (TSUtility.isValid(node)) {
                node.active = index === currentStep;
            }
        });

        // 播放奖励启动成功动画
        this.targetAnimation?.stop();
        this.targetAnimation?.play("Top_Seven_succes");
        this.targetAnimation?.setCurrentTime(0);

        // 播放奖励启动音效
        SlotSoundController.Instance().playAudio("PotWinStart", "FX");
    }

    /**
     * 设置奖励启动二次触发状态（重置成功动画）
     */
    public setBonusStartSecond(): void {
        // 播放奖励启动重置动画
        this.targetAnimation?.stop();
        this.targetAnimation?.play("Top_Seven_succes_restart");
        this.targetAnimation?.setCurrentTime(0);
    }
}