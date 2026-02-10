import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";

const { ccclass, property } = cc._decorator;

/**
 * LuckyBunnyDrop LockAndRoll奖励组件
 * 负责LockAndRoll模式下奖励计数、倍数的展示、动画播放、数值累加等逻辑
 */
@ccclass('LockAndRollRewardComponent_LuckyBunnyDrop')
export default class LockAndRollRewardComponent_LuckyBunnyDrop extends cc.Component {
    // 核心动画组件（倍数变化等主动画）
    @property(cc.Animation)
    public component_Animation: cc.Animation | any = null;

    // 倍数显示标签
    @property(cc.Label)
    public multi_Label: cc.Label | null = null;

    // 计数动画组件
    @property(cc.Animation)
    public count_Ani: cc.Animation | any = null;

    // 倍数动画组件
    @property(cc.Animation)
    public multi_Ani: cc.Animation | any = null;

    // 计数节点数组（控制不同计数的显示）
    @property([cc.Node])
    public count_Nodes: cc.Node[] = [];

    // 倍数节点数组（控制不同倍数的显示）
    @property([cc.Node])
    public multi_Nodes: cc.Node[] = [];

    // 计数根节点（控制计数整体显示/隐藏）
    @property(cc.Node)
    public count_Node: cc.Node | null = null;

    // 当前剩余次数显示标签
    @property(cc.Label)
    public current_Label: cc.Label | null = null;

    // 总次数显示标签
    @property(cc.Label)
    public total_Label: cc.Label | null = null;

    // 私有变量：当前倍数
    private _currentMulti: number = 0;
    // 私有变量：当前总计数
    private _currentTotalCnt: number = 0;

    /**
     * 初始化计数状态（停止动画+隐藏所有计数节点）
     */
    public initCount(): void {
        this.count_Ani?.stop();
        
        // 隐藏所有计数节点
        for (const node of this.count_Nodes) {
            node.active = false;
        }
    }

    /**
     * 初始化倍数状态（停止动画+隐藏所有倍数节点）
     */
    public initMulti(): void {
        this.multi_Ani?.stop();
        
        // 隐藏所有倍数节点
        for (const node of this.multi_Nodes) {
            node.active = false;
        }
    }

    /**
     * 播放计数动画（显示指定计数节点+累加总数）
     * @param showIndices 需要显示的计数节点索引数组
     */
    public playCount(showIndices: number[]): void {
        // 重置并播放计数动画
        this.count_Ani?.stop();
        this.count_Ani!.currentTime = 0;
        this.count_Ani?.play();

        // 先隐藏所有计数节点
        for (const node of this.count_Nodes) {
            node.active = false;
        }

        // 显示指定索引的计数节点
        for (const index of showIndices) {
            if (this.count_Nodes[index]) {
                this.count_Nodes[index].active = true;
            }
        }

        // 累加总计数
        this.addTotalCount(showIndices.length);
    }

    /**
     * 播放倍数动画（显示指定倍数节点+累加倍数）
     * @param showIndices 需要显示的倍数节点索引数组
     */
    public playMulti(showIndices: number[]): void {
        // 重置并播放倍数动画
        this.multi_Ani?.stop();
        this.multi_Ani!.currentTime = 0;
        this.multi_Ani?.play();

        // 先隐藏所有倍数节点
        for (const node of this.multi_Nodes) {
            node.active = false;
        }

        // 显示指定索引的倍数节点
        for (const index of showIndices) {
            if (this.multi_Nodes[index]) {
                this.multi_Nodes[index].active = true;
            }
        }

        // 累加倍数
        this.addMulti(showIndices.length);
    }

    /**
     * 累加倍数（延迟1秒播放倍数增加动画+更新显示）
     * @param addValue 要累加的倍数值
     */
    public addMulti(addValue: number): void {
        this.scheduleOnce(() => {
            // 播放倍数增加动画
            this.component_Animation?.stop();
            this.component_Animation!.currentTime = 0;
            this.component_Animation?.play("UI_Multi_Plus_Ani");

            // 更新当前倍数并刷新显示
            this._currentMulti += addValue;
            if (this.multi_Label) {
                this.multi_Label.string = this._currentMulti.toString();
            }
        }, 1);
    }

    /**
     * 累加总计数（延迟1秒更新剩余次数/总次数显示）
     * @param addValue 要累加的计数值
     */
    public addTotalCount(addValue: number): void {
        // 判断是否为免费旋转模式，获取对应的子游戏状态key
        const subGameKey = SlotReelSpinStateManager.Instance.getFreespinMode() 
            ? "lockNRollTumble_fromFreeSpin" 
            : "lockNRollTumble";
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);

        this.scheduleOnce(() => {
            // 更新当前剩余次数
            if (this.current_Label && subGameState) {
                this.current_Label.string = (subGameState.spinCnt - 1).toString();
            }

            // 更新总计数并刷新显示
            this._currentTotalCnt += addValue;
            if (this.total_Label) {
                this.total_Label.string = (this._currentTotalCnt - 1).toString();
            }
        }, 1);
    }

    /**
     * 设置剩余次数（初始化显示当前剩余次数/总次数/倍数）
     */
    public setRemainCount(): void {
        // 判断是否为免费旋转模式，获取对应的子游戏状态key
        const subGameKey = SlotReelSpinStateManager.Instance.getFreespinMode() 
            ? "lockNRollTumble_fromFreeSpin" 
            : "lockNRollTumble";
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
        
        if (!subGameState) return;

        // 初始化当前倍数（从子游戏状态获取potMultiplier，默认1）
        const potMultiplier = TSUtility.isValid(subGameState.gauges?.potMultiplier) 
            ? subGameState.gauges.potMultiplier 
            : "1";
        this._currentMulti = Number(potMultiplier);
        if (this.multi_Label) {
            this.multi_Label.string = potMultiplier+"";
        }

        // 计算并显示当前剩余次数（spinCnt<2时显示0，否则显示spinCnt-1）
        const currentSpinCnt = subGameState.spinCnt < 2 ? 0 : subGameState.spinCnt - 1;
        this.count_Node!.active = true;
        if (this.current_Label) {
            this.current_Label.string = currentSpinCnt.toString();
        }

        // 显示总次数（totalCnt-1）
        if (this.total_Label) {
            this.total_Label.string = (subGameState.totalCnt - 1).toString();
        }
        this._currentTotalCnt = subGameState.totalCnt;
    }

    /**
     * 追加剩余次数（更新剩余次数/总次数/倍数显示）
     */
    public addRemainCount(): void {
        // 判断是否为免费旋转模式，获取对应的子游戏状态key
        const subGameKey = SlotReelSpinStateManager.Instance.getFreespinMode() 
            ? "lockNRollTumble_fromFreeSpin" 
            : "lockNRollTumble";
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
        
        if (!subGameState) return;

        // 显示计数根节点
        this.count_Node!.active = true;

        // 更新当前剩余次数
        if (this.current_Label) {
            this.current_Label.string = subGameState.spinCnt.toString();
        }

        // 更新总次数（totalCnt-1）
        if (this.total_Label) {
            this.total_Label.string = (subGameState.totalCnt - 1).toString();
        }

        // 更新倍数显示
        const potMultiplier = TSUtility.isValid(subGameState.gauges?.potMultiplier) 
            ? subGameState.gauges.potMultiplier 
            : "1";
        if (this.multi_Label) {
            this.multi_Label.string = potMultiplier+"";
        }
    }

    /**
     * 设置总倍数（播放倍数触发动画+播放音效+延迟执行回调）
     * @param callback 动画结束后的回调函数
     */
    public setTotalMulti(callback: Function): void {
        // 播放总倍数触发动画
        this.component_Animation?.stop();
        this.component_Animation!.currentTime = 0;
        this.component_Animation?.play("UI_Multi_Trigger_Ani");

        // 播放倍数音效
        SlotSoundController.Instance().playAudio("LNRMulti", "FX");

        // 延迟3秒执行回调（检查回调有效性）
        this.scheduleOnce(() => {
            if (TSUtility.isValid(callback)) {
                callback();
            }
        }, 3);
    }
}
