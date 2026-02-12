import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts 重旋转剩余次数组件（控制次数显示、动画、音效）
 */
@ccclass()
export default class RemainCountComponent_SuperSevenBlasts extends cc.Component {
    // ========== 序列化属性（对应Cocos编辑器赋值） ==========
    /** 次数动画组件（控制Fx_ReSpin_count_Spot等动画） */
    @property(cc.Animation)
    public targetAni: cc.Animation = null;

    /** 次数标签节点数组（索引对应次数值，如index=3对应剩余3次） */
    @property([cc.Node])
    public count_Labels: cc.Node[] = [];

    // ========== 私有状态属性 ==========
    /** 上一次的次数值（用于对比变化） */
    private prevCount: number = 0;
    /** 当前剩余次数 */
    private _remainCount: number = 0;

    /**
     * 获取重旋转剩余次数
     * @returns 剩余次数值
     */
    public getRemainCount(): number {
        // 获取重旋转子游戏状态
        const respinGameState = SlotGameResultManager.Instance.getSubGameState("respin");
        if (!TSUtility.isValid(respinGameState)) {
            return 0;
        }

        // 业务逻辑：totalCnt为0时默认3次，否则用totalCnt；剩余次数=总次数-已旋转次数
        const totalCnt = respinGameState.totalCnt === 0 ? 3 : respinGameState.totalCnt;
        return totalCnt - respinGameState.spinCnt;
    }

    /**
     * 显示次数UI
     */
    public showUI(): void {
        this.node.active = true;
        this._remainCount = this.getRemainCount();
        this.setCount(this._remainCount, true);
    }

    /**
     * 更新剩余次数（带回调）
     * @param callback 次数更新完成后的回调
     */
    public updateCount(callback?: () => void): void {
        const currentRemainCount = this.getRemainCount();
        
        // 剩余次数变化时处理更新逻辑
        if (this._remainCount !== currentRemainCount) {
            this._remainCount = currentRemainCount;
            this.seUpdateCount(this._remainCount);
            
            // 1秒后执行回调（确保动画完成）
            this.scheduleOnce(() => {
                if (TSUtility.isValid(callback) && typeof callback === 'function') {
                    callback();
                }
            }, 1);
        } else {
            // 次数未变化，直接执行回调
            if (TSUtility.isValid(callback) && typeof callback === 'function') {
                callback();
            }
        }
    }

    /**
     * 减少剩余次数（原拼写decrese保留，避免业务逻辑异常）
     */
    public decreseCount(): void {
        this.node.active = true;
        this._remainCount--;
        this.seUpdateCount(this._remainCount, true);
    }

    /**
     * 核心更新次数逻辑（带动画/音效控制）
     * @param count 目标次数
     * @param isStay 是否为停留状态（默认false）
     */
    public seUpdateCount(count: number, isStay: boolean = false): void {
        this.node.active = true;
        this.prevCount = count;

        // 非停留状态：延迟播放音效+动画
        if (!isStay) {
            this.scheduleOnce(() => {
                // 次数未减少时播放添加音效
                if (this.prevCount <= count) {
                    SlotSoundController.Instance().playAudio("RespinAdd", "FX");
                }

                // 根据次数调整动画节点X坐标
                if (TSUtility.isValid(this.targetAni)) {
                    this.targetAni.node.x = count === 2 ? -65 : -54;
                }

                // 激活对应次数的标签
                this.count_Labels.forEach((node, index) => {
                    if (TSUtility.isValid(node)) {
                        node.active = index === count;
                    }
                });

                // 播放次数变化动画
                this.playAnimation("Fx_ReSpin_count_Spot");
            }, 0.17);
        } else {
            // 停留状态：直接激活标签+播放停留动画
            this.count_Labels.forEach((node, index) => {
                if (TSUtility.isValid(node)) {
                    node.active = index === count;
                }
            });
            this.playAnimation("Fx_ReSpin_count_Spot_stay");
        }
    }

    /**
     * 设置次数并播放对应动画
     * @param count 目标次数
     * @param isStay 是否为停留状态（默认false）
     */
    public setCount(count: number, isStay: boolean = false): void {
        this.node.active = true;

        // 激活对应次数的标签
        this.count_Labels.forEach((node, index) => {
            if (TSUtility.isValid(node)) {
                node.active = index === count;
            }
        });

        this.prevCount = count;

        // 根据状态选择动画
        const animationName = isStay 
            ? "Fx_ReSpin_count_Spot_stay" 
            : "Fx_ReSpin_count_Spot";
        
        this.playAnimation(animationName);
    }

    /**
     * 隐藏次数UI
     */
    public hideUI(): void {
        this.node.active = false;
    }

    /**
     * 播放指定动画（重置并播放）
     * @param animationName 动画剪辑名称
     */
    public playAnimation(animationName: string): void {
        if (TSUtility.isValid(this.targetAni)) {
            this.targetAni.stop();
            this.targetAni.setCurrentTime(0);
            this.targetAni.play(animationName);
        }
    }
}