import ChangeNumberComponent from "../Slot/ChangeNumberComponent";
import SlotSoundController from "../Slot/SlotSoundController";
import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";
import SlotGameRuleManager from "../manager/SlotGameRuleManager";

// 严格遵循指定的装饰器导出方式
const { ccclass, property } = cc._decorator;
/**
 * MoooreCheddar Slots 选奖（Pick Bonus）核心组件
 * 负责选奖交互、动画、音效、金额计算与展示
 */
@ccclass()
export default class PickBonus_MoooreCheddar extends cc.Component {
    // ================= 可序列化属性（编辑器面板配置） =================
    @property([cc.Button])
    public pick_object: cc.Button[] = [];          // 可选奖励按钮数组
    @property([cc.Node])
    public result_object: cc.Node[] = [];          // 选奖结果展示节点数组
    @property(cc.Label)
    public result_total_win: cc.Label = null!;     // 总奖金显示标签
    @property(cc.Node)
    public event_dim_node: cc.Node = null!;        // 事件遮罩节点（防止误操作）
    @property(cc.Node)
    public collect_effect: cc.Node = null!;        // 奖金收集特效节点
    @property(cc.Prefab)
    public move_collect: cc.Prefab = null!;        // 奖金移动特效预制体
    @property(cc.Node)
    public move_layer: cc.Node = null!;            // 奖金移动层节点
    @property(cc.Node)
    public explane_node: cc.Node = null!;          // 选奖说明节点
    @property([sp.Skeleton])
    public character_skeletons: sp.Skeleton[] = []; // 角色骨骼动画数组
    // ================= 私有状态属性 =================
    public inFreeSpinBonus: boolean = false;    // 是否在免费旋转奖励中
    private total_win_money: number = 0;        // 累计获奖金额
    private select_index: number = -1;          // 当前选中的选奖索引
    private idle_repeat_timer: any = null;      // 闲置动画定时器
    private complete_index: number[] = [];      // 已完成选奖的索引数组
    private remain_reulst_value: number[] = []; // 剩余可选结果值
    private remain_add_pick: boolean = true;    // 是否剩余额外选奖机会

    // ================= 生命周期函数 =================
    onLoad() {
        // 绑定收集特效动画结束回调
        const collectAni = this.collect_effect.getComponentInChildren(cc.Animation);
        if (TSUtility.isValid(collectAni)) {
            collectAni.on(cc.Animation.EventType.FINISHED, () => {
                this.collect_effect.active = false;
            });
        }
    }

    onEnable() {
        // 重置选奖状态
        this.total_win_money = 0;
        this.result_total_win.string = "";
        this.complete_index = [];
        this.remain_reulst_value = [1, 2, 3, 4, 5, 6, 7, 8];
        this.remain_add_pick = true;

        // 隐藏所有结果节点
        this.result_object.forEach(node => {
            node.active = false;
            node.opacity = 0;
        });

        // 显示遮罩、隐藏说明、隐藏角色骨骼
        this.event_dim_node.active = true;
        this.explane_node.active = false;
        this.character_skeletons.forEach(skeleton => {
            skeleton.node.active = false;
        });
    }

    // ================= 核心通信方法 =================
    /**
     * 接收外部消息并执行对应方法
     * @param msg 消息体 {name: 方法名, ...参数}
     */
    sendMsg(msg: { name: string, [key: string]: any }) {
        if (TSUtility.isValid((this as any)[msg.name])) {
            if (TSUtility.isDevService()) {
                console.log("PickBonuse Message : " + msg.name);
            }
            (this as any)[msg.name](msg);
        }
    }

    // ================= 选奖状态重置 =================
    /**
     * 重置选奖按钮状态（禁用交互、清空事件）
     */
    resetButton() {
        this.pick_object.forEach(btn => {
            btn.interactable = false;
            btn.clickEvents = [];
            btn.node.off(cc.Node.EventType.MOUSE_ENTER);
            btn.node.off(cc.Node.EventType.MOUSE_LEAVE);
        });
    }

    // ================= 选奖结果恢复（续播/回滚） =================
    /**
     * 恢复选奖结果状态
     * @param params 参数 {win_pay: 累计奖金, select_index: 选中索引}
     */
    onRecovery(params: any) {
        this.total_win_money = params.win_pay;
        // 更新总奖金显示
        if (this.total_win_money > 0) {
            this.result_total_win.string = CurrencyFormatHelper.formatNumber(this.total_win_money);
        }

        // 移除已完成选奖的剩余结果值
        this.complete_index.forEach(idx => {
            const valueIdx = this.remain_reulst_value.indexOf(idx);
            if (valueIdx > -1) {
                this.remain_reulst_value.splice(valueIdx, 1);
            }
        });

        this.remain_add_pick = false;

        // 处理选中索引的结果展示
        if (params.select_index > -1) {
            this.complete_index.push(params.select_index);
            // 播放选奖动画
            this.pick_object[params.select_index].getComponent(cc.Animation)?.play("Option_Pick_Ani");
            // 设置结果信息并显示
            this.setResultObejctInfo(params.select_index, params.result_index, true);
            this.result_object[params.select_index].active = true;
            this.result_object[params.select_index].getComponent(cc.Animation)?.play("Option_Result_Open_Ani");
        }
    }

    // ================= 选奖前置特效 =================
    /**
     * 选奖前置角色动画特效
     * @param params 参数 {callback: 完成回调}
     */
    onPickPreEffect(params: { callback?: () => void }) {
        const actions = [];

        // 第一个角色动画
        actions.push(cc.callFunc(() => {
            SlotSoundController.Instance().playAudio("BI", "FX");
            this.character_skeletons[0].node.setPosition(new cc.Vec3(-280, -190, 0));
            this.character_skeletons[0].node.active = true;
            // 角色位置动画
            cc.tween(this.character_skeletons[0].node)
                .delay(0.8)
                .to(0.5, { position: new cc.Vec3(-340, -190, 0) }, { easing: "sineOut" })
                .start();
            this.character_skeletons[0].setAnimation(0, "Top_Expect_Win", false);
        }));

        // 延迟后第二个角色动画
        actions.push(cc.delayTime(0.65));
        actions.push(cc.callFunc(() => {
            this.character_skeletons[1].node.setPosition(new cc.Vec3(470, -184, 0));
            this.character_skeletons[1].node.active = true;
            this.character_skeletons[1].setAnimation(0, "Top_Expect_Win", false);
            cc.tween(this.character_skeletons[1].node)
                .delay(0.8)
                .to(0.5, { position: new cc.Vec3(550, -184, 0) }, { easing: "sineOut" })
                .start();
        }));

        // 延迟后第三个角色动画
        actions.push(cc.delayTime(0.65));
        actions.push(cc.callFunc(() => {
            this.character_skeletons[2].node.setPosition(new cc.Vec3(-470, -355, 0));
            this.character_skeletons[2].node.active = true;
            this.character_skeletons[2].setAnimation(0, "Top_Expect_Win", false);
            cc.tween(this.character_skeletons[2].node)
                .delay(0.8)
                .to(0.5, { position: new cc.Vec3(-530, -355, 0) }, { easing: "sineOut" })
                .start();
        }));

        // 延迟后执行回调
        actions.push(cc.delayTime(1.15));
        actions.push(cc.callFunc(() => {
            if (TSUtility.isValid(params.callback)) {
                params.callback!();
            }
        }));

        // 执行动画序列
        this.node.runAction(cc.sequence(actions));
    }

    // ================= 选奖开始 =================
    /**
     * 启动选奖流程
     * @param params 参数 {callback: 完成回调}
     */
    onPickStart(params: { callback?: () => void }) {
        this.event_dim_node.active = true;
        this.removeIdleAnimation(); // 停止闲置动画
        this.select_index = -1;
        this.resetButton(); // 重置按钮状态

        const actions = [];

        // 显示说明并绑定选奖按钮事件
        actions.push(cc.callFunc(() => {
            this.explane_node.active = true;
            this.pick_object.forEach((btn, idx) => {
                // 跳过已完成的选奖按钮
                if (this.complete_index.indexOf(idx) > -1) return;
                // 绑定点击事件
                btn.clickEvents.push(Utility.getComponent_EventHandler(
                    this.node,
                    "PickBonus_MoooreCheddar",
                    "onClickPickObject",
                    { index: idx, callback: params.callback }
                ));
                // 绑定悬停/离开动画
                btn.node.on(cc.Node.EventType.MOUSE_ENTER, this.onHoverAnimation.bind(this, idx));
                btn.node.on(cc.Node.EventType.MOUSE_LEAVE, this.onEndHoverAnimation.bind(this, idx));
            });
        }));

        // 延迟后播放选奖开始动画
        actions.push(cc.delayTime(0.8));
        actions.push(cc.callFunc(() => {
            this.pick_object.forEach((btn, idx) => {
                if (this.complete_index.indexOf(idx) > -1) return;
                const ani = btn.getComponent(cc.Animation);
                ani.play("Option_Start_Ani");
                // 动画结束后启用按钮交互
                ani.once(cc.Animation.EventType.FINISHED, () => {
                    btn.interactable = true;
                });
            });
            SlotSoundController.Instance().playAudio("BGS", "FX");
        }));

        // 延迟后隐藏遮罩并启动闲置动画
        actions.push(cc.delayTime(0.8));
        actions.push(cc.callFunc(() => {
            this.event_dim_node.active = false;
            // 循环播放闲置动画
            this.idle_repeat_timer = cc.repeatForever(cc.sequence(
                cc.delayTime(0.5),
                cc.callFunc(this.repeatIdleAnimation.bind(this)),
                cc.delayTime(1)
            ));
            this.node.runAction(this.idle_repeat_timer);
        }));

        // 执行选奖开始序列
        this.node.runAction(cc.sequence(actions));
    }

    // ================= 选奖按钮点击 =================
    /**
     * 选奖按钮点击回调
     * @param _event 鼠标事件（未使用）
     * @param data 自定义数据 {index: 选奖索引, callback: 完成回调}
     */
    onClickPickObject(_event: Event, data: { index: number, callback?: (any) => void }) {
        if (this.select_index > -1) return; // 已选中则忽略

        this.select_index = data.index;
        this.complete_index.push(this.select_index);
        this.resetButton(); // 禁用所有按钮
        this.removeIdleAnimation(); // 停止闲置动画

        // 播放选奖动画并触发音效
        this.pick_object[data.index].getComponent(cc.Animation)?.play("Option_Pick_Ani");
        SlotSoundController.Instance().playAudio("BP", "FX");

        // 执行回调
        if (TSUtility.isValid(data.callback)) {
            data.callback!(this.select_index);
        }
    }

    // ================= 选奖结果展示 =================
    /**
     * 展示选奖结果
     * @param params 参数 {result_index: 结果索引, callback: 完成回调}
     */
    onPickResult(params: { result_index: number, callback?: () => void }) {
        // 设置结果信息并显示
        this.setResultObejctInfo(this.select_index, params.result_index);
        this.result_object[this.select_index].active = true;

        // 播放结果打开动画
        const ani = this.result_object[this.select_index].getComponent(cc.Animation);
        ani.play("Option_Result_Open_Ani");
        ani.once(cc.Animation.EventType.FINISHED, () => {
            if (TSUtility.isValid(params.callback)) {
                params.callback!();
            }
        });
    }

    // ================= 奖金滚动累加 =================
    /**
     * 奖金数字滚动累加
     * @param params 参数 {reward: 奖励金额, callback: 完成回调}
     */
    onResultRollup(params: { reward: number, callback?: () => void }) {
        // 先执行奖金移动动画，再滚动数字
        this.onMoveWin(() => {
            const changeNumber = this.result_total_win.getComponent(ChangeNumberComponent);
            changeNumber.playChangeNumber(
                this.total_win_money,
                this.total_win_money + params.reward,
                () => {
                    // 数字滚动完成后更新总奖金并播放收集特效
                    this.total_win_money += params.reward;
                    this.result_total_win.string = CurrencyFormatHelper.formatNumber(this.total_win_money);
                    this.collect_effect.active = true;
                    if (TSUtility.isValid(params.callback)) {
                        params.callback!();
                    }
                },
                0.5 // 滚动时长
            );
        });
    }

    // ================= 选奖结束 =================
    /**
     * 选奖流程结束处理
     * @param params 参数 {callback: 完成回调}
     */
    onPickEnd(params: { callback?: () => void }) {
        // 随机打乱剩余结果值
        this.remain_reulst_value.sort(() => 0.5 - Math.random());

        // 初始化结果标记数组
        const resultFlags = [0, 0, 0, 0, 0, 0, 0, 0];
        let valueIdx = 0;

        // 标记已完成选奖的索引
        if (this.remain_add_pick) {
            this.complete_index.forEach(idx => {
                resultFlags[idx] = -1;
            });

            // 确定额外选奖标记（免费旋转和普通模式不同）
            const specialValues = this.inFreeSpinBonus ? [8, 5] : [8];
            const normalIndices: number[] = [];

            // 标记特殊/普通结果
            resultFlags.forEach((flag, idx) => {
                if (flag !== -1) {
                    resultFlags[idx] = specialValues.includes(this.remain_reulst_value[valueIdx]) ? -1 : 0;
                    valueIdx++;
                    if (resultFlags[idx] === 0) {
                        normalIndices.push(idx);
                    }
                }
            });

            // 随机选一个普通索引标记为额外选奖
            normalIndices.sort(() => 0.5 - Math.random());
            if (normalIndices.length > 0) {
                resultFlags[normalIndices[0]] = 1;
            }
        }

        valueIdx = 0;
        const self = this;

        // 处理每个选奖按钮的结束动画
        const handleEndAni = (idx: number) => {
            const btnAni = self.pick_object[idx].getComponent(cc.Animation);
            if (self.complete_index.includes(idx)) {
                // 已选中的按钮播放中奖动画
                btnAni.play("Option_EndOn_Ani");
                self.result_object[idx].getComponent(cc.Animation)?.play("Option_Result_Win_Ani");
            } else {
                // 未选中的按钮播放变暗动画
                btnAni.play("Option_Dim_Ani");
                const remainValue = self.remain_reulst_value[valueIdx];
                // 动画结束后设置结果信息
                btnAni.once(cc.Animation.EventType.FINISHED, () => {
                    self.setResultObejctInfo(idx, remainValue, resultFlags[idx] === 1);
                    self.result_object[idx].active = true;
                    self.result_object[idx].getComponent(cc.Animation)?.play("Option_Result_Dim_Ani");
                });
                valueIdx++;
            }
        };

        // 遍历所有8个选奖按钮处理动画
        for (let i = 0; i < 8; i++) {
            handleEndAni(i);
        }

        // 延迟后执行结束回调
        this.scheduleOnce(() => {
            if (TSUtility.isValid(params.callback)) {
                params.callback!();
            }
        }, 1);
    }

    // ================= 奖金移动动画 =================
    /**
     * 奖金从结果位置移动到总奖金位置的动画
     * @param callback 动画完成回调
     */
    onMoveWin(callback?: () => void) {
        // 实例化移动特效预制体
        const collectNode = cc.instantiate(this.move_collect);
        this.move_layer.addChild(collectNode);

        // 计算世界坐标并转换为移动层本地坐标
        const resultTxtNode = this.result_object[this.select_index].getChildByName("Txt");
        const worldPos = resultTxtNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const localPos = this.move_layer.convertToNodeSpaceAR(worldPos);
        collectNode.setPosition(localPos);

        // 播放音效
        SlotSoundController.Instance().playAudio("BPAY", "FX");

        // 执行移动动画
        cc.tween(collectNode)
            .to(0.67, { position: cc.Vec3.ZERO }, { easing: "cubicOut" })
            .call(() => {
                // 动画结束后显示收集特效、销毁移动节点、执行回调
                this.collect_effect.active = true;
                if (TSUtility.isValid(collectNode.parent)) {
                    collectNode.removeFromParent(false);
                }
                if (TSUtility.isValid(callback)) {
                    callback!();
                }
            })
            .start();
    }

    // ================= 结果节点信息设置 =================
    /**
     * 设置选奖结果节点的显示内容
     * @param pickIndex 选奖索引
     * @param resultIndex 结果索引
     * @param hasMorePick 是否有额外选奖机会
     */
    setResultObejctInfo(pickIndex: number, resultIndex: number, hasMorePick: boolean = false) {
        const resultTxtNode = this.result_object[pickIndex].getChildByName("Txt");
        // 隐藏所有子节点
        resultTxtNode.children.forEach(child => {
            child.active = false;
        });

        let prizeAmount = 0;
        const totalBet = SlotGameRuleManager.Instance.getTotalBet();

        // 根据结果索引设置不同显示内容
        if (resultIndex < 5) {
            // 1-4：Jackpot 奖金池
            const jackpotNode = resultTxtNode.getChildByName("Jackpot");
            jackpotNode.active = true;
            jackpotNode.children.forEach((child, idx) => {
                child.active = idx === resultIndex - 1;
            });
            SlotSoundController.Instance().playAudio("BJT", "FX");
        } else if (resultIndex === 8) {
            // 8：额外6次免费旋转
            resultTxtNode.getChildByName("Plus_6Fs").active = true;
            const labelNode = resultTxtNode.getChildByName("label");
            labelNode.active = true;
            prizeAmount = 3 * totalBet;
            labelNode.getComponent(cc.Label).string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(prizeAmount, 3);
        } else if (this.inFreeSpinBonus && resultIndex === 5) {
            // 免费旋转中5：奶酪奖励
            resultTxtNode.getChildByName("CheddarBonus").active = true;
        } else {
            // 5-7：固定倍数奖金（非免费旋转）
            const labelNode = resultTxtNode.getChildByName("label");
            labelNode.active = true;
            // 倍数映射：5→10倍, 6→4倍, 7→3倍
            const multipliers = [10, 4, 3];
            prizeAmount = multipliers[resultIndex - 5] * totalBet;
            labelNode.getComponent(cc.Label).string = CurrencyFormatHelper.formatEllipsisNumberUsingDotMaxCount(prizeAmount, 3);
        }

        // 显示额外选奖机会
        if (hasMorePick) {
            resultTxtNode.getChildByName("1More_Pick").active = true;
            this.remain_add_pick = false;
        }

        // 移除已使用的结果值
        const valueIdx = this.remain_reulst_value.indexOf(resultIndex);
        if (valueIdx > -1) {
            this.remain_reulst_value.splice(valueIdx, 1);
        }
    }

    // ================= 悬停动画处理 =================
    /**
     * 选奖按钮悬停动画
     * @param idx 按钮索引
     */
    onHoverAnimation(idx: number) {
        if (this.pick_object[idx].interactable) {
            SlotSoundController.Instance().playAudio("BGMO", "FX");
            this.pick_object[idx].getComponent(cc.Animation)?.play("Option_Hover_Ani");
        }
    }

    /**
     * 选奖按钮离开悬停动画
     * @param idx 按钮索引
     */
    onEndHoverAnimation(idx: number) {
        if (this.pick_object[idx].interactable) {
            this.pick_object[idx].getComponent(cc.Animation)?.play("Option_Base_Ani");
        }
    }

    // ================= 闲置动画处理 =================
    /**
     * 停止闲置循环动画
     */
    removeIdleAnimation() {
        if (this.idle_repeat_timer) {
            this.node.stopAction(this.idle_repeat_timer);
            this.idle_repeat_timer = null;
        }
    }

    /**
     * 随机播放闲置动画
     */
    repeatIdleAnimation() {
        // 筛选未完成的选奖索引
        const availableIndices = [0, 1, 2, 3, 4, 5, 6, 7].filter(idx => {
            return this.complete_index.indexOf(idx) === -1;
        });

        if (availableIndices.length === 0) return;

        // 随机选一个索引播放闲置动画
        const randomIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        const ani = this.pick_object[randomIdx].getComponent(cc.Animation);
        if (ani.currentClip?.name !== "Option_Hover_Ani") {
            ani.play("Option_Idle_Fx_Ani");
        }
    }
}