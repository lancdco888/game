import SlotSoundController from '../../../Slot/SlotSoundController';
import TSUtility from '../../../global_utility/TSUtility';
import SlotGameResultManager from '../../../manager/SlotGameResultManager';
import BeeLovedJarsManager, { EventBus } from '../BeeLovedJarsManager';

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏奖池核心组件
 * 负责奖池等级计算、节点显隐控制、Spine动画播放、音效管理、事件监听、调度器控制等核心逻辑
 */
@ccclass('PotComponent_BeeLovedJars')
export default class PotComponent_BeeLovedJars extends cc.Component {
    // ===================== 奖池状态节点组 =====================
    // 闲置状态节点组（对应4个奖池等级）
    @property({
        type: [cc.Node],
        displayName: "闲置状态节点组",
        tooltip: "奖池闲置时显示的节点组（索引对应奖池等级：0-3）"
    })
    idle_Nodes: cc.Node[] | null = [];

    // 命中状态节点组（奖池被触发时的动画节点）
    @property({
        type: [cc.Node],
        displayName: "命中状态节点组",
        tooltip: "奖池被命中时显示的节点组（索引对应奖池等级：0-3）"
    })
    hit_Nodes: cc.Node[] | null = [];

    // 更新状态节点组（奖池等级提升时显示）
    @property({
        type: [cc.Node],
        displayName: "更新状态节点组",
        tooltip: "奖池等级提升时显示的节点组（索引对应奖池等级：0-3）"
    })
    update_Nodes: cc.Node[] | null = [];

    // 前更新状态节点组（奖池触发前过渡显示）
    @property({
        type: [cc.Node],
        displayName: "前更新状态节点组",
        tooltip: "奖池触发前过渡显示的节点组（索引对应奖池等级：0-3）"
    })
    prev_update_Nodes: cc.Node[] | null = [];

    // 失败状态节点组（奖池触发失败时显示）
    @property({
        type: [cc.Node],
        displayName: "失败状态节点组",
        tooltip: "奖池触发失败时显示的节点组（索引对应奖池等级：0-3）"
    })
    failed_Nodes: cc.Node[] | null = [];

    // 蜜蜂背景节点组（奖池等级对应的蜜蜂背景）
    @property({
        type: [cc.Node],
        displayName: "蜜蜂背景节点组",
        tooltip: "奖池等级对应的蜜蜂背景节点组（索引对应奖池等级：0-3）"
    })
    back_Bee_Nodes: cc.Node[] | null = [];

    // 蜜蜂前景节点组（奖池等级对应的蜜蜂前景）
    @property({
        type: [cc.Node],
        displayName: "蜜蜂前景节点组",
        tooltip: "奖池等级对应的蜜蜂前景节点组（索引对应奖池等级：0-3）"
    })
    front_Bee_Nodes: cc.Node[] | null = [];

    // 触发状态节点组（奖池成功触发时显示）
    @property({
        type: [cc.Node],
        displayName: "触发状态节点组",
        tooltip: "奖池成功触发时显示的节点组"
    })
    trigger_Nodes: cc.Node[] | null = [];

    // ===================== 私有状态变量 =====================
    // 当前奖池等级（0-3）
    private _Pot: number = 0;
    // 上一帧奖池等级
    private _prevPot: number = 0;
    // 超级奖池等级（预留）
    private _superPot: number = 0;
    // 当前播放的动画名称
    private _playAniName: string = "";
    // 是否处于奖池触发状态
    private _isPot: boolean = false;
    // 是否需要更新奖池等级
    private _updatePot: boolean = false;
    // 奖池存活计数（触发次数）
    private _aliveCout: number = 0;

    /**
     * 组件加载时初始化：订阅alivePot事件
     */
    onLoad(): void {
        EventBus.on("alivePot", this.setAlive, this);
    }

    /**
     * 组件销毁时：取消alivePot事件订阅（避免内存泄漏）
     */
    onDestroy(): void {
        EventBus.off("alivePot", this.setAlive, this); // 修复原代码：取消订阅需匹配上下文
    }

    /**
     * 初始化奖池更新状态（重置为未更新）
     */
    initUpdatePot(): void {
        this._updatePot = false;
    }

    /**
     * 隐藏所有奖池相关节点
     * @param hideBee 是否隐藏蜜蜂节点（默认true）
     */
    allHide(hideBee: boolean = true): void {
        // 空值安全：节点组不存在时直接返回
        const safeHideNodes = (nodes: cc.Node[] | null) => {
            if (nodes && nodes.length > 0) {
                nodes.forEach(node => {
                    if (node && node.isValid) node.active = false;
                });
            }
        };

        // 隐藏基础状态节点
        safeHideNodes(this.idle_Nodes);
        safeHideNodes(this.hit_Nodes);
        safeHideNodes(this.update_Nodes);
        safeHideNodes(this.failed_Nodes);
        safeHideNodes(this.prev_update_Nodes);
        
        // 按需隐藏蜜蜂节点
        if (hideBee) {
            safeHideNodes(this.back_Bee_Nodes);
            safeHideNodes(this.front_Bee_Nodes);
        }
        
        // 隐藏触发节点
        safeHideNodes(this.trigger_Nodes);
    }

    /**
     * 计算当前奖池等级（核心规则）
     * 规则：spinCnt <20→0 | <40→1 | <60→2 | ≥60→3
     * @returns 奖池等级（0-3）
     */
    getPot(): number {
        const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");
        const spinCnt = baseGameState?.getGaugesValue("spinCnt") || 0; // 空值默认0

        if (spinCnt < 20) return 0;
        else if (spinCnt < 40) return 1;
        else if (spinCnt < 60) return 2;
        else return 3;
    }

    /**
     * 初始化奖池等级并设置为闲置状态
     */
    initPot(): void {
        this._Pot = this.getPot();
        this.setIdel();
    }

    /**
     * 初始化奖池存活计数（重置为0）
     */
    initAliveCount(): void {
        this._aliveCout = 0;
    }

    /**
     * 隐藏所有蜜蜂节点
     */
    hideBee(): void {
        const safeHideNodes = (nodes: cc.Node[] | null) => {
            if (nodes && nodes.length > 0) {
                nodes.forEach(node => {
                    if (node && node.isValid) node.active = false;
                });
            }
        };

        safeHideNodes(this.back_Bee_Nodes);
        safeHideNodes(this.front_Bee_Nodes);
    }

    /**
     * 显示当前奖池等级对应的蜜蜂节点
     */
    showBee(): void {
        if (!this.back_Bee_Nodes || !this.front_Bee_Nodes) return;
        if (this._Pot < 0 || this._Pot >= this.back_Bee_Nodes.length) return;

        // 显示对应等级的蜜蜂节点
        const backBeeNode = this.back_Bee_Nodes[this._Pot];
        const frontBeeNode = this.front_Bee_Nodes[this._Pot];
        if (backBeeNode && backBeeNode.isValid) backBeeNode.active = true;
        if (frontBeeNode && frontBeeNode.isValid) frontBeeNode.active = true;
    }

    /**
     * 设置奖池为闲置状态（显示对应等级的闲置节点+蜜蜂节点）
     */
    setIdel(): void {
        // 隐藏所有节点（蜜蜂节点是否隐藏：当前等级≠上一等级时隐藏）
        this.allHide(this._Pot !== this._prevPot);
        
        // 更新上一等级
        if (this._Pot !== this._prevPot) {
            this._prevPot = this._Pot;
        }

        // 显示当前等级的闲置节点
        if (this.idle_Nodes && this._Pot >= 0 && this._Pot < this.idle_Nodes.length) {
            const idleNode = this.idle_Nodes[this._Pot];
            if (idleNode && idleNode.isValid) idleNode.active = true;
        }

        // 显示当前等级的蜜蜂节点
        this.showBee();
    }

    /**
     * 重置奖池更新状态（未更新）
     */
    resetUpdatePot(): void {
        this._updatePot = false;
    }

    /**
     * 奖池存活计数更新（核心触发逻辑）
     * 处理奖池等级提升、命中动画、音效播放、调度器管理
     */
    setAlive(): void {
        const self = this;
        this._aliveCout += 1;

        // 非触发状态且非更新状态时处理
        if (!this._isPot && !this._updatePot) {
            // 清空所有调度器
            this.unscheduleAllCallbacks();

            const currentPot = this.getPot();
            this.allHide(false); // 隐藏所有节点（保留蜜蜂节点）

            // 条件：奖池等级变化 且 存活计数-1 = 更新计数 → 等级提升
            if (this._Pot !== currentPot && (this._aliveCout - 1) === BeeLovedJarsManager.getInstance().getUpdateCount()) {
                this._updatePot = true;
                
                // 显示当前等级的更新节点
                if (this.update_Nodes && this._Pot >= 0 && this._Pot < this.update_Nodes.length) {
                    const updateNode = this.update_Nodes[this._Pot];
                    if (updateNode && updateNode.isValid) updateNode.active = true;
                }

                // 更新奖池等级 + 播放升级音效
                this._Pot = currentPot;
                SlotSoundController.Instance().playAudio("PotUpgrade", "FX");

                // 延迟1秒恢复闲置状态
                this.scheduleOnce(() => {
                    self.setIdel();
                }, 1);
            } 
            // 奖池等级未变化 → 命中逻辑
            else {
                // 重置命中节点显隐（触发动画重新播放）
                if (this.hit_Nodes && this._Pot >= 0 && this._Pot < this.hit_Nodes.length) {
                    const hitNode = this.hit_Nodes[this._Pot];
                    if (hitNode && hitNode.isValid) {
                        hitNode.active = false;
                        hitNode.active = true;

                        // 播放Spine命中动画
                        const skeleton = hitNode.getComponent(sp.Skeleton);
                        if (skeleton && skeleton.isValid) {
                            skeleton.clearTracks();
                            skeleton.setToSetupPose();
                            skeleton.premultipliedAlpha = true;
                            skeleton.setAnimation(0, skeleton.defaultAnimation || "", false);
                        }
                    }
                }

                // 播放命中音效
                SlotSoundController.Instance().playAudio("PotHit", "FX");

                // 存活计数达到总数 → 延迟1秒恢复闲置状态
                if (this._aliveCout === BeeLovedJarsManager.getInstance().getTotalCount()) {
                    this.scheduleOnce(() => {
                        self.setIdel();
                    }, 1);
                }
            }
        }
    }

    /**
     * 播放奖池触发成功动画序列
     * @param callback 动画完成后的回调函数
     */
    playTriggerAni(callback?: () => void): void {
        const self = this;
        // 清空所有调度器 + 标记为触发状态
        this.unscheduleAllCallbacks();
        this._isPot = true;

        // 步骤1：显示前更新节点 + 播放触发音效
        const step1 = cc.callFunc(() => {
            self.allHide();
            if (self.prev_update_Nodes && self._Pot >= 0 && self._Pot < self.prev_update_Nodes.length) {
                const prevUpdateNode = self.prev_update_Nodes[self._Pot];
                if (prevUpdateNode && prevUpdateNode.isValid) prevUpdateNode.active = true;
            }
            SlotSoundController.Instance().playAudio("Pot_Trigger", "FX");
        });

        // 步骤2：显示触发节点 + 延迟1秒播放蜂蜜掉落音效
        const step2 = cc.callFunc(() => {
            self.allHide();
            if (self.trigger_Nodes) {
                self.trigger_Nodes.forEach(node => {
                    if (node && node.isValid) node.active = true;
                });
            }
            this.scheduleOnce(() => {
                SlotSoundController.Instance().playAudio("Honey_Drop", "FX");
            }, 1);
        });

        // 步骤3：执行回调
        const step3 = cc.callFunc(() => {
            if (TSUtility.isValid(callback)) callback!();
        });

        // 执行动画序列：step1 → 延迟1秒 → step2 → 延迟3秒 → step3
        if (this.node.isValid) {
            this.node.runAction(cc.sequence(
                step1,
                cc.delayTime(1),
                step2,
                cc.delayTime(3),
                step3
            ));
        }
    }

    /**
     * 播放奖池触发期望失败动画
     * @param callback 动画完成后的回调函数
     */
    playExpectTriggerAni(callback?: () => void): void {
        const self = this;
        // 清空所有调度器 + 标记为触发状态
        this.unscheduleAllCallbacks();
        this._isPot = true;

        // 隐藏所有节点 + 显示当前等级的失败节点
        this.allHide();
        if (this.failed_Nodes && this._Pot >= 0 && this._Pot < this.failed_Nodes.length) {
            const failedNode = this.failed_Nodes[this._Pot];
            if (failedNode && failedNode.isValid) failedNode.active = true;
        }

        // 播放失败音效
        SlotSoundController.Instance().playAudio("FailedExpect", "FX");

        // 动画序列：延迟2秒 → 恢复闲置状态 + 执行回调
        if (this.node.isValid) {
            this.node.runAction(cc.sequence(
                cc.delayTime(2),
                cc.callFunc(() => {
                    self.allHide();
                    self.setIdel();
                    if (TSUtility.isValid(callback)) callback!();
                })
            ));
        }
    }

    /**
     * 重置失败的奖池状态（恢复闲置，取消触发标记）
     */
    resetFailedPot(): void {
        this._isPot = false;
        this.setIdel();
    }

    /**
     * 重置奖池到初始状态（等级0，闲置）
     */
    resetPot(): void {
        this._isPot = false;
        this._Pot = 0;
        this.setIdel();
    }
}