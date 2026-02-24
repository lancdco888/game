import SlotSoundController from "../../../Slot/SlotSoundController";
import TSUtility from "../../../global_utility/TSUtility";
import SlotGameResultManager from "../../../manager/SlotGameResultManager";

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏 Lock&Roll 模式剩余次数组件
 * 负责剩余次数计算、UI出现动画、次数更新/增减/重置、节点显隐控制、音效播放等逻辑
 */
@ccclass('RemainCountComponent_BeeLovedJars')
export default class RemainCountComponent_BeeLovedJars extends cc.Component {
    // 剩余次数数字标签
    @property({
        type: cc.Label,
        displayName: "剩余次数标签",
        tooltip: "显示Lock&Roll模式剩余旋转次数的数字标签"
    })
    remain_Label: cc.Label | null = null;

    // "Spin"文本节点（剩余次数=1时显示）
    @property({
        type: cc.Node,
        displayName: "Spin文本节点",
        tooltip: "剩余次数为1时显示的'Spin'文本节点"
    })
    spin_Node: cc.Node | null = null;

    // "Spins"文本节点（剩余次数>1时显示）
    @property({
        type: cc.Node,
        displayName: "Spins文本节点",
        tooltip: "剩余次数大于1时显示的'Spins'文本节点"
    })
    spins_Node: cc.Node | null = null;

    // "Last Spin"文本节点（剩余次数=0时显示）
    @property({
        type: cc.Node,
        displayName: "Last Spin文本节点",
        tooltip: "剩余次数为0时显示的'Last Spin'文本节点"
    })
    lastSpin_Node: cc.Node | null = null;

    // UI动画组件（控制次数更新/添加/重置动画）
    @property({
        type: cc.Animation,
        displayName: "UI动画组件",
        tooltip: "控制剩余次数UI的出现/添加/重置动画播放"
    })
    ui_Animation: cc.Animation | null = null;

    // 剩余次数缓存（避免重复计算）
    private _remainCount: number = 0;

    /**
     * 获取当前剩余旋转次数
     * 规则：totalCnt为0则默认6次，否则用totalCnt - spinCnt
     * @returns 剩余旋转次数
     */
    getRemainCount(): number {
        const lockNRollState = SlotGameResultManager.Instance.getSubGameState("lockNRoll");
        // 空值安全：lockNRollState不存在时返回0
        if (!lockNRollState) return 0;

        const totalCnt = lockNRollState.totalCnt || 6; // totalCnt为0时默认6
        return totalCnt - (lockNRollState.spinCnt || 0);
    }

    /**
     * 播放UI出现动画并初始化次数显示
     */
    appearUI(): void {
        if (!this.ui_Animation) return;

        // 停止原有动画，重新播放出现动画（重置播放时间）
        this.ui_Animation.stop();
        this.ui_Animation.play("Fx_respin_bottom");
        this.ui_Animation.setCurrentTime(0);

        // 更新次数显示（无回调）
        this.updateCount(null);
    }

    /**
     * 更新剩余次数显示
     * @param callback 次数更新完成后的回调函数（延迟1秒执行）
     */
    updateCount(callback?: () => void): void {
        const currentRemainCount = this.getRemainCount();

        // 次数有变化时才更新
        if (this._remainCount !== currentRemainCount) {
            this._remainCount = currentRemainCount;
            this.setUpdateCount(); // 更新标签和节点显隐

            // 延迟1秒执行回调
            this.scheduleOnce(() => {
                if (TSUtility.isValid(callback)) callback!();
            }, 1);
        } else {
            // 次数无变化，直接执行回调
            if (TSUtility.isValid(callback)) callback!();
        }
    }

    /**
     * 增加剩余次数（播放添加动画+音效）
     */
    addCount(): void {
        const self = this;
        if (!this.ui_Animation) return;

        // 停止原有动画，播放添加动画（重置播放时间）
        this.ui_Animation.stop();
        this.ui_Animation.play("Fx_respin_bottom_Add");
        this.ui_Animation.setCurrentTime(0);

        // 次数+1
        this._remainCount++;

        // 延迟1.5秒播放音效并更新显示
        this.scheduleOnce(() => {
            // 播放添加次数音效
            SlotSoundController.Instance().playAudio("AddCountUI", "FX");
            // 更新标签和节点显隐
            self.setUpdateCount();
        }, 1.5);
    }

    /**
     * 减少剩余次数（直接更新显示）
     */
    decreseCount(): void {
        // 确保组件激活，次数-1并更新显示
        this.node.active = true;
        this._remainCount--;
        this.setUpdateCount();
    }

    /**
     * 核心更新逻辑：设置次数标签+控制各文本节点显隐
     */
    setUpdateCount(): void {
        // 空值安全检查：核心节点/标签缺失时直接返回
        if (!this.remain_Label || !this.spin_Node || !this.spins_Node || !this.lastSpin_Node) return;

        // 1. 控制剩余次数标签显隐（次数>0时显示）
        this.remain_Label.node.active = this._remainCount > 0;
        // 2. 设置次数标签文本
        this.remain_Label.string = this._remainCount.toString();

        // 3. 控制Spin/Spins/Last Spin节点显隐
        this.spin_Node.active = (this._remainCount === 1) && (this._remainCount > 0); // 次数=1时显示Spin
        this.spins_Node.active = (this._remainCount !== 1) && (this._remainCount > 0); // 次数>1时显示Spins
        this.lastSpin_Node.active = this._remainCount === 0; // 次数=0时显示Last Spin
    }

    /**
     * 重置UI（次数重置为3，播放重置动画）
     */
    resetUI(): void {
        // 仅当当前次数≠3时才重置
        if (this._remainCount !== 3) {
            this._remainCount = 3;

            // 播放重置动画（若动画组件存在）
            if (this.ui_Animation) {
                this.ui_Animation.stop();
                this.ui_Animation.play("LnR_SpinNum_UI_Num_Reset_Ani");
                this.ui_Animation.setCurrentTime(0);
            }

            // 更新标签和节点显隐
            this.setUpdateCount();
        }
    }
}