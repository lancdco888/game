import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";

const { ccclass, property } = cc._decorator;

/**
 * 动画名称常量（封装原代码硬编码的动画名，提升可读性）
 */
export const RemainCountAniName = {
    /** 闲置动画 */
    IDLE: "PU_Respin_Count_Jewel_idle",
    /** 出现动画 */
    APPEAR: "PU_Respin_Count_Jewel_appear"
};

/**
 * 哈迪斯之犬 - 剩余次数显示组件
 * 核心职责：
 * 1. 从游戏结果管理器获取剩余旋转次数
 * 2. 控制剩余次数UI的显示/隐藏/入场动画
 * 3. 更新剩余次数并播放对应元素的动画
 * 4. 播放次数更新相关音效
 */
@ccclass()
export default class RemainCountComponent_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 枢纽节点（播放整体入场动画） */
    @property(cc.Node)
    public pivot_Node: cc.Node | null = null;

    /** 剩余次数元素节点数组（最多3个） */
    @property([cc.Node])
    public ele_Nodes: cc.Node[] = [];

    /** 剩余次数元素动画组件数组（与ele_Nodes一一对应） */
    @property([cc.Animation])
    public ele_Anis: cc.Animation[] = [];

    // ====== 私有状态变量 ======
    /** 上一次的计数（用于对比更新） */
    private prevCount: number = 0;
    /** 当前剩余次数 */
    private _remainCount: number = 0;

    // ====== 核心方法 ======
    /**
     * 获取当前剩余旋转次数
     * @returns 剩余次数（从SlotGameResultManager计算得出）
     */
    getRemainCount(): number {
        // 安全校验：游戏结果管理器实例缺失时返回0
        if (!SlotGameResultManager.Instance) {
            console.warn("RemainCountComponent: SlotGameResultManager.Instance不存在！");
            return 0;
        }

        // 获取当前子游戏Key
        let subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        // base类型时获取下一个子游戏Key
        if (subGameKey === "base") {
            subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        }

        // 获取子游戏状态
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
        if (!subGameState) {
            console.warn(`RemainCountComponent: 未找到子游戏${subGameKey}的状态！`);
            return 0;
        }

        // 计算剩余次数：totalCnt为0时默认3，否则totalCnt - spinCnt
        const totalCnt = subGameState.totalCnt === 0 ? 3 : subGameState.totalCnt;
        return totalCnt - subGameState.spinCnt;
    }

    /**
     * 显示剩余次数UI，并根据当前剩余次数更新元素显示/动画
     */
    showUI(): void {
        // 激活组件根节点
        this.node.active = true;

        // 获取最新剩余次数
        this._remainCount = this.getRemainCount();

        // 遍历3个元素节点，根据剩余次数控制显示和动画
        for (let i = 0; i < 3; i++) {
            // 安全校验：元素节点/动画组件缺失时跳过
            if (!this.ele_Nodes[i] || !this.ele_Anis[i]) {
                console.warn(`RemainCountComponent: 第${i}个元素节点/动画组件未配置！`);
                continue;
            }

            if (i < this._remainCount) {
                // 显示节点并播放闲置动画
                this.ele_Nodes[i].active = true;
                this.ele_Anis[i].stop();
                this.ele_Anis[i].play(RemainCountAniName.IDLE);
                this.ele_Anis[i].setCurrentTime(0);
            } else {
                // 隐藏节点
                this.ele_Nodes[i].active = false;
            }
        }
    }

    /**
     * 打开剩余次数UI（入场动画）
     */
    openUI(): void {
        // 重置剩余次数为3
        this._remainCount = 3;
        // 激活组件根节点
        this.node.active = true;

        // 播放枢纽节点入场动画
        if (this.pivot_Node) {
            const pivotAni = this.pivot_Node.getComponent(cc.Animation);
            if (pivotAni) {
                pivotAni.stop();
                pivotAni.play();
                pivotAni.setCurrentTime(0);
            } else {
                console.warn("RemainCountComponent: pivot_Node未绑定Animation组件！");
            }
        }

        // 遍历所有元素节点，播放出现动画
        for (let i = 0; i < this.ele_Nodes.length; i++) {
            // 安全校验：元素节点/动画组件缺失时跳过
            if (!this.ele_Nodes[i] || !this.ele_Anis[i]) {
                console.warn(`RemainCountComponent: 第${i}个元素节点/动画组件未配置！`);
                continue;
            }

            this.ele_Nodes[i].active = true;
            this.ele_Anis[i].stop();
            this.ele_Anis[i].play(RemainCountAniName.APPEAR);
            this.ele_Anis[i].setCurrentTime(0);
        }

        // 播放入场音效
        SlotSoundController.Instance().playAudio("RemainAppear", "FX");
    }

    /**
     * 更新剩余次数（有变化时执行更新并回调）
     * @param callback 更新完成后的回调
     */
    updateCount(callback?: () => void): void {
        const currentRemainCount = this.getRemainCount();

        // 剩余次数有变化时执行更新
        if (this._remainCount !== currentRemainCount) {
            this._remainCount = currentRemainCount;
            this.setUpdateCount(this._remainCount);

            // 1秒后执行回调
            this.scheduleOnce(() => {
                TSUtility.isValid(callback) && callback!();
            }, 1);
        } else {
            // 无变化时直接执行回调
            TSUtility.isValid(callback) && callback!();
        }
    }

    /**
     * 减少剩余次数（注：原代码拼写错误decrese→decrease，保留原方法名兼容）
     */
    decreseCount(): void {
        // 激活组件根节点
        this.node.active = true;
        // 剩余次数减1
        this._remainCount--;
        // 更新显示
        this.setUpdateCount(this._remainCount);
    }

    /**
     * 根据目标次数更新元素显示和动画
     * @param targetCount 目标剩余次数
     */
    setUpdateCount(targetCount: number): void {
        // 安全校验：目标次数非数字时返回
        if (typeof targetCount !== 'number' || isNaN(targetCount)) {
            console.warn("RemainCountComponent: targetCount必须为有效数字！");
            return;
        }

        // 记录上一次计数
        this.prevCount = targetCount;
        const self = this;

        // 遍历3个元素节点，更新显示和动画
        const updateElement = (index: number) => {
            // 安全校验：元素节点/动画组件缺失时跳过
            if (!self.ele_Nodes[index] || !self.ele_Anis[index]) {
                console.warn(`RemainCountComponent: 第${index}个元素节点/动画组件未配置！`);
                return;
            }

            if (index < targetCount) {
                // 目标次数大于当前索引：显示元素
                if (!self.ele_Nodes[index].active) {
                    // 节点未激活时，播放出现动画，后切换为闲置动画
                    self.ele_Nodes[index].active = true;
                    self.ele_Anis[index].stop();
                    self.ele_Anis[index].play(RemainCountAniName.APPEAR);
                    self.ele_Anis[index].setCurrentTime(0);

                    // 调度切换为闲置动画（无延迟，原代码逻辑）
                    self.scheduleOnce(() => {
                        self.ele_Anis[index].stop();
                        self.ele_Anis[index].play(RemainCountAniName.IDLE);
                        self.ele_Anis[index].setCurrentTime(0);
                    });
                }
            } else {
                // 目标次数小于等于当前索引：隐藏元素
                self.ele_Nodes[index].active = false;
            }
        };

        // 遍历3个元素执行更新
        for (let i = 0; i < 3; i++) {
            updateElement(i);
        }
    }

    /**
     * 隐藏剩余次数UI
     */
    hideUI(): void {
        this.node.active = false;
    }
}