import SlotSoundController from '../../../Slot/SlotSoundController';
import State from '../../../Slot/State';
import TSUtility from '../../../global_utility/TSUtility';
import SlotGameResultManager from '../../../manager/SlotGameResultManager';
import BeeLovedJarsManager from '../BeeLovedJarsManager';
import JackpotDisplayFxComponent_BeeLovedJars from './JackpotDisplayFxComponent_BeeLovedJars';
import JackpotModeEle_BeeLovedJars from './JackpotModeEle_BeeLovedJars';

const { ccclass, property } = cc._decorator;

/**
 * Jackpot模式罐子状态枚举
 * 对应原代码的r枚举，控制罐子的显示/交互状态
 */
export enum JackpotState {
    NONESELECT = 0,          // 未选中
    NONESELECT_APPEAR = 1,   // 未选中-出现特效
    SELECT = 2,              // 已选中
    WIN = 3,                 // 中奖
    NONESELECT_OPEN = 4,     // 未选中-打开
    DOUBLE_SELECT = 5,       // 双倍选中
    OPEN_DIM = 6             // 打开-变暗
}

/**
 * BeeLovedJars 游戏 Jackpot 模式核心组件
 * 负责Jackpot模式的序列生成、罐子交互、状态管理、动画/音效播放、节点控制等核心逻辑
 */
@ccclass('JackpotModeComponent_BeeLovedJars')
export default class JackpotModeComponent_BeeLovedJars extends cc.Component {
    // ===================== 核心组件/节点 =====================
    // Jackpot罐子元素数组（12个罐子）
    @property({
        type: [JackpotModeEle_BeeLovedJars],
        displayName: "Jackpot罐子元素数组",
        tooltip: "Jackpot模式下的12个罐子元素组件数组"
    })
    jarObjects: JackpotModeEle_BeeLovedJars[] | null = [];

    // 标题动画组件
    @property({
        type: cc.Animation,
        displayName: "标题动画组件",
        tooltip: "Jackpot模式顶部标题的出现动画组件"
    })
    title_Animation: cc.Animation | null = null;

    // 点击屏蔽节点（防止重复点击）
    @property({
        type: cc.Node,
        displayName: "点击屏蔽节点",
        tooltip: "Jackpot模式下屏蔽重复点击的遮罩节点"
    })
    block_Node: cc.Node | null = null;

    // ===================== 私有状态变量 =====================
    // 上一轮Jackpot类型数组
    private prev_jackpotTypes: number[] = [];
    // 当前Jackpot类型数组（12个罐子对应类型）
    private jackpotTypes: number[] = new Array(12).fill(-1);
    // 倍数类型数组（12个罐子对应倍数）
    private multiTypes: number[] = new Array(12).fill(0);
    // 生成的Jackpot序列
    private sequence: number[] = [];
    // 罐子点击状态（12个罐子，true=已点击）
    private clicked: boolean[] = new Array(12).fill(false);
    // Jackpot状态回调函数
    private jackpotStateCallback: (() => void) | null = null;
    // 当前Jackpot类型（0-3）
    private currentJackpotType: number = 0;
    // 当前倍数
    private multi: number = 0;
    // 是否处于事件处理中（防止重复触发）
    private _isEvent: boolean = false;

    /**
     * 进入Jackpot模式回调（清空调度器）
     */
    enterFunc(): void {
        if (!this._isEvent) {
            this.unscheduleAllCallbacks();
        }
    }

    /**
     * 离开Jackpot模式回调（延迟3秒显示罐子）
     */
    leaveFunc(): void {
        this.scheduleOnce(() => {
            this.appearJars();
        }, 3);
    }

    /**
     * 显示Jackpot模式UI
     * @param callback 显示完成后的回调函数
     */
    showJackpotMode(callback?: () => void): void {
        if (!this.node || !this.block_Node) return;

        this.node.active = true;
        this._isEvent = true;
        this.block_Node.active = true;
        
        this.resetCoinState();
        
        this._isEvent = false;
        if (TSUtility.isValid(callback)) {
            callback();
        }
    }

    /**
     * 播放Jackpot模式出现特效（标题动画+FX特效+音效）
     */
    appearJackpotFX(): void {
        const self = this;
        if (!this.title_Animation) return;

        // 播放标题出现动画
        this.title_Animation.play("Top_JP_matcch_appear", 0);
        // 播放Jackpot胜利FX特效
        BeeLovedJarsManager.getInstance().game_components.jackpotWinFxComponent
            .getComponent(JackpotDisplayFxComponent_BeeLovedJars).appearFX();
        // 播放UI出现音效
        SlotSoundController.Instance().playAudio("JackpotModeUIAppear", "FX");

        // 延迟4秒显示罐子
        this.scheduleOnce(() => {
            self.appearJars();
        }, 4);
    }

    /**
     * 隐藏Jackpot模式UI
     */
    hideJackpotMode(): void {
        const self = this;
        if (!this.node) return;

        this.node.runAction(cc.sequence(
            cc.delayTime(0.4),
            cc.callFunc(() => {
                self.node!.active = false;
                self.resetCoinState();
            })
        ));
    }

    /**
     * 创建Jackpot游戏状态机（管理回调）
     * @returns State 状态机实例
     */
    playJackpotGameState(): State {
        const self = this;
        const state = new State();

        state.addOnStartCallback(() => {
            self.jackpotStateCallback = () => {
                state.setDone();
                self.jackpotStateCallback = null;
            };
        });

        return state;
    }

    /**
     * 重置所有罐子状态（位置+状态）
     */
    resetCoinState(): void {
        if (!this.jarObjects || this.jarObjects.length !== 12) return;

        for (let i = 0; i < 12; ++i) {
            const jarObj = this.jarObjects[i];
            if (!jarObj || !jarObj.node) continue;

            // 重置罐子节点层级
            jarObj.node.setSiblingIndex(i);
            // 重置罐子状态为未选中
            this.setCoinState(i, JackpotState.NONESELECT);
        }
    }

    /**
     * 设置单个罐子的状态
     * @param index 罐子索引（0-11）
     * @param state 罐子状态
     * @param jackpotType Jackpot类型（默认-1）
     * @param multi 倍数（默认-1）
     * @param adjustSibling 是否调整节点层级（默认true）
     */
    setCoinState(
        index: number,
        state: JackpotState,
        jackpotType: number = -1,
        multi: number = -1,
        adjustSibling: boolean = true
    ): void {
        if (!this.jarObjects || index < 0 || index >= this.jarObjects.length) return;

        const jarObj = this.jarObjects[index];
        if (!jarObj) return;

        // 根据状态执行对应罐子方法
        switch (state) {
            case JackpotState.NONESELECT:
                jarObj.initJars(this.enterFunc.bind(this), this.leaveFunc.bind(this));
                break;
            case JackpotState.NONESELECT_APPEAR:
                jarObj.shakeCoin();
                break;
            case JackpotState.SELECT:
                jarObj.selectJars(jackpotType, multi);
                break;
            case JackpotState.WIN:
                jarObj.winCoin();
                break;
            case JackpotState.NONESELECT_OPEN:
                jarObj.noneSelectCoin(jackpotType, multi);
                break;
            case JackpotState.DOUBLE_SELECT:
                jarObj.doubleSelectCoin();
                break;
            case JackpotState.OPEN_DIM:
                jarObj.dimmedCoin();
                break;
            default:
                break;
        }

        // 更新当前罐子的Jackpot类型
        this.jackpotTypes[index] = jackpotType;

        // 调整节点层级（置顶）
        if (adjustSibling && jarObj.node && jarObj.node.parent) {
            jarObj.node.setSiblingIndex(jarObj.node.parent.children.length - 1);
        }
    }

    /**
     * 罐子点击事件处理（核心交互逻辑）
     * @param _event 点击事件（未使用）
     * @param indexStr 罐子索引字符串
     */
    onClickJars(_event: cc.Event, indexStr: string): void {
        const self = this;
        const index = parseInt(indexStr);

        // 边界检查：索引无效/已点击/事件处理中 → 直接返回
        if (
            isNaN(index) || index < 0 || index >= 12 ||
            this.clicked[index] || this._isEvent ||
            !this.block_Node || !this.jarObjects
        ) {
            return;
        }

        // 屏蔽点击+标记事件中
        this.block_Node.active = true;
        this._isEvent = true;
        this.unscheduleAllCallbacks();
        this.clicked[index] = true;

        // 获取当前序列头的Jackpot类型和倍数
        const currentSeqType = this.sequence[0];
        const currentMulti = this.multiTypes[0];
        // 移除序列头元素
        this.sequence.shift();
        this.multiTypes.shift();
        // 记录上一轮Jackpot类型
        this.prev_jackpotTypes.push(currentSeqType);

        // 禁用所有罐子交互+重置缩放
        for (let i = 0; i < this.jarObjects.length; i++) {
            const jarObj = this.jarObjects[i];
            if (jarObj) {
                jarObj._isEvent = true;
                if (jarObj.node) jarObj.node.scale = 1;
            }
        }

        // 检查当前Jackpot类型是否还在序列中
        const isCurrentTypeExist = this.sequence.includes(this.currentJackpotType);
        // 统计相同Jackpot类型的数量（原代码逻辑保留）
        this.prev_jackpotTypes.filter(type => type === currentSeqType).length;

        // 步骤1：选中罐子+播放选中音效
        const stepSelect = cc.callFunc(() => {
            self.setCoinState(index, JackpotState.SELECT, currentSeqType, currentMulti);
            SlotSoundController.Instance().playAudio("JackpotModeSelect", "FX");
        });

        // 步骤2：中奖处理（选中了目标Jackpot类型）
        const stepWin = cc.callFunc(() => {
            self.winCoin();
            self.dimSelectedCoin();
            self.flipUnselectedCoins();
        });

        // 步骤3：完成状态回调+恢复罐子交互
        const stepCallback = cc.callFunc(() => {
            if (self.jackpotStateCallback) {
                self.jackpotStateCallback();
            }
            for (let i = 0; i < self.jarObjects!.length; i++) {
                const jarObj = self.jarObjects![i];
                if (jarObj) jarObj._isEvent = false;
            }
        });

        // 步骤4：双倍选中处理（两个相同类型罐子被选中）
        const stepDoubleSelect = cc.callFunc(() => {
            // 收集相同Jackpot类型的已点击罐子
            const sameTypeClicked: number[] = [];
            for (let i = 0; i < self.clicked.length; i++) {
                if (
                    self.clicked[i] &&
                    self.jarObjects![i] &&
                    self.jarObjects![i]._jackpotType === currentSeqType
                ) {
                    sameTypeClicked.push(i);
                }
            }

            // 两个相同类型罐子 → 双倍选中状态
            if (sameTypeClicked.length === 2) {
                for (let i = 0; i < sameTypeClicked.length; i++) {
                    self.setCoinState(sameTypeClicked[i], JackpotState.DOUBLE_SELECT, currentSeqType, currentMulti);
                }
                self.node.runAction(cc.sequence(
                    cc.delayTime(1),
                    cc.callFunc(() => {
                        self._isEvent = false;
                        self.block_Node!.active = false;
                        self.scheduleOnce(() => {
                            self.appearJars();
                        }, 3);
                    })
                ));
            } else {
                // 恢复点击屏蔽+延迟显示罐子
                self.block_Node!.active = false;
                self._isEvent = false;
                self.scheduleOnce(() => {
                    self.appearJars();
                }, 3);
            }

            // 恢复所有罐子交互
            for (let i = 0; i < self.jarObjects!.length; i++) {
                const jarObj = self.jarObjects![i];
                if (jarObj) jarObj._isEvent = false;
            }
        });

        // 执行动画序列：未中奖→仅选中；中奖→选中+中奖+回调
        if (!isCurrentTypeExist) {
            this.node.runAction(cc.sequence(stepSelect, cc.delayTime(1), stepDoubleSelect));
        } else {
            this.node.runAction(cc.sequence(stepSelect, cc.delayTime(1), stepWin, cc.delayTime(1.5), stepCallback));
        }
    }

    /**
     * 生成Jackpot序列（核心随机逻辑）
     * 规则：保证目标Jackpot类型最先凑够3个，其他类型不提前凑够
     * @param targetType 目标Jackpot类型（0-3）
     * @param multi 倍数
     * @returns 生成的12位Jackpot序列数组
     */
    generateSequence(targetType: number, multi: number): number[] {
        // 初始化类型计数（0-3各最多3个）
        let typeCount = [0, 0, 0, 0];
        let tempSequence: number[] = [];

        // 第一步：初步生成12位序列
        const generateTempSeq = (step: number): number => {
            let selectedType: number | undefined;

            // 优先选择目标类型的规则
            if (typeCount[targetType] < 3 && (step === 1 || tempSequence[step - 2] !== targetType)) {
                if (step <= 5 && typeCount[targetType] < 2) {
                    // 前5步：30%概率选目标类型
                    if (Math.random() * 100 < 30) {
                        selectedType = targetType;
                    }
                } else if (step >= 6 && step <= 8) {
                    // 6-8步：概率递增（6步40%、7步70%、8步95%）
                    const prob = step === 6 ? 40 : step === 7 ? 70 : 95;
                    if (Math.random() * 100 < prob) {
                        selectedType = targetType;
                    }
                } else if (step >= 9) {
                    // 9-12步：必选目标类型（如果还没凑够3个）
                    selectedType = targetType;
                }
            }

            // 未选中目标类型 → 随机选其他类型
            if (selectedType === undefined) {
                // 过滤出还能选的类型（计数<3）
                let availableTypes = [0, 1, 2, 3].filter(type => typeCount[type] < 3);
                
                // 排除上一步的类型（避免连续）
                if (step > 1) {
                    const prevType = tempSequence[step - 2];
                    availableTypes = availableTypes.filter(type => type !== prevType);
                }

                // 前5步：过滤出计数<2的类型
                if (step <= 5) {
                    availableTypes = availableTypes.filter(type => typeCount[type] < 2);
                } else {
                    // 后7步：优先选目标类型或计数更少的类型
                    availableTypes = availableTypes.filter(type => {
                        return type === targetType || typeCount[targetType] >= 3 || typeCount[type] < typeCount[targetType];
                    });
                }

                // 兜底：如果没有可选类型，重新过滤（仅计数<3）
                if (availableTypes.length === 0) {
                    availableTypes = [0, 1, 2, 3].filter(type => typeCount[type] < 3);
                }

                // 随机选一个
                selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            }

            return selectedType!;
        };

        // 生成12步临时序列
        for (let step = 1; step <= 12; step++) {
            const selectedType = generateTempSeq(step);
            tempSequence.push(selectedType);
            typeCount[selectedType]++;
        }

        // 第二步：补充不足的类型（确保每个类型至少3个）
        const supplementTypes: number[] = [];
        for (let type = 0; type < 4; type++) {
            while (typeCount[type] < 3) {
                supplementTypes.push(type);
                typeCount[type]++;
            }
        }

        // 第三步：修正序列（保证目标类型最先凑够3个）
        // 收集目标类型的位置
        const targetPositions = new Set<number>();
        for (let i = 0; i < tempSequence.length; i++) {
            if (tempSequence[i] === targetType) {
                targetPositions.add(i);
            }
        }

        // 重新构建最终序列
        const finalSequence: number[] = [];
        const finalCount = [0, 0, 0, 0];
        for (let i = 0; i < tempSequence.length; i++) {
            let currentType = tempSequence[i];
            
            // 目标类型位置 → 保留
            if (targetPositions.has(i)) {
                finalSequence.push(targetType);
                finalCount[targetType]++;
            } else {
                // 非目标类型 → 检查是否需要替换
                if (finalCount[currentType] === 3 && supplementTypes.length > 0) {
                    let replaceType: number | undefined;
                    const isTargetFull = finalCount[targetType] >= 3;

                    // 优先选目标类型或未凑够的类型
                    const sortedSupplement = [...supplementTypes].sort((a, b) => {
                        if (a === targetType) return -1;
                        if (b === targetType) return 1;
                        return 0;
                    });

                    // 找一个不与前一个类型重复的替换类型
                    for (let j = 0; j < sortedSupplement.length; j++) {
                        const type = sortedSupplement[j];
                        if ((isTargetFull || type === targetType) && (i === 0 || finalSequence[i - 1] !== type)) {
                            replaceType = type;
                            // 从补充数组中移除
                            const idx = supplementTypes.indexOf(type);
                            if (idx !== -1) supplementTypes.splice(idx, 1);
                            break;
                        }
                    }

                    // 兜底：选第一个补充类型
                    if (replaceType === undefined && supplementTypes.length > 0) {
                        replaceType = supplementTypes[0];
                        supplementTypes.splice(0, 1);
                    }

                    // 替换类型
                    if (replaceType !== undefined) {
                        finalSequence.push(replaceType);
                        finalCount[replaceType]++;
                    } else {
                        finalSequence.push(currentType);
                        finalCount[currentType]++;
                    }
                } else {
                    // 直接保留
                    finalSequence.push(currentType);
                    finalCount[currentType]++;
                }
            }
        }

        // 第四步：检查序列有效性（目标类型最先凑够3个）
        const completeStep = [0, 0, 0, 0]; // 各类型凑够3个的步数
        let targetCompleteStep = -1;
        var otherCompleteSteps: Record<number, number> = {};

        // 统计各类型凑够3个的步数
        for (let i = 0; i < finalSequence.length; i++) {
            const type = finalSequence[i];
            completeStep[type]++;
            // 凑够3个 → 记录步数
            if (completeStep[type] === 3) {
                if (type === targetType) {
                    targetCompleteStep = i;
                } else if (otherCompleteSteps[type] === undefined) {
                    otherCompleteSteps[type] = i;
                }
            }
        }

        // 检查是否有其他类型比目标类型先凑够3个
        let isNeedRearrange = false;
        const otherSteps = Object.values(otherCompleteSteps);
        for (let i = 0; i < otherSteps.length; i++) {
            if (otherSteps[i] < targetCompleteStep) {
                isNeedRearrange = true;
                break;
            }
        }

        // 需要重新排列 → 生成安全序列
        if (isNeedRearrange) {
            console.warn("⚠️ 检测到序列需要重排 - 开始安全生成");
            
            const safeSequence: number[] = [];
            const safeCount = [0, 0, 0, 0];
            let targetAdded = 0;

            // 先添加3个目标类型（避免连续）
            for (let i = 0; i < 12 && targetAdded < 3; i++) {
                if (i === 0 || safeSequence[i - 1] !== targetType) {
                    safeSequence.push(targetType);
                    safeCount[targetType]++;
                    targetAdded++;
                } else {
                    safeSequence.push(-1);
                }
            }

            // 生成其他类型的序列（各3个）
            const otherTypes: number[] = [];
            for (let type = 0; type < 4; type++) {
                if (type !== targetType) {
                    for (let i = 0; i < 3; i++) {
                        otherTypes.push(type);
                    }
                }
            }

            // 打乱其他类型序列
            for (let i = otherTypes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [otherTypes[i], otherTypes[j]] = [otherTypes[j], otherTypes[i]];
            }

            // 填充安全序列
            let otherIndex = 0;
            for (let i = 0; i < safeSequence.length; i++) {
                if (safeSequence[i] === -1 || safeSequence[i] === undefined) {
                    // 找一个不与前一个重复的类型
                    let found = false;
                    for (let j = 0; j < otherTypes.length && !found; j++) {
                        const type = otherTypes[otherIndex % otherTypes.length];
                        if (i === 0 || safeSequence[i - 1] !== type) {
                            safeSequence[i] = type;
                            otherIndex++;
                            found = true;
                        } else {
                            otherIndex++;
                        }
                    }
                    // 兜底：直接填
                    if (!found && otherIndex < otherTypes.length) {
                        safeSequence[i] = otherTypes[otherIndex++];
                    }
                }
            }

            // 补全到12位
            while (safeSequence.length < 12 && otherIndex < otherTypes.length) {
                safeSequence.push(otherTypes[otherIndex++]);
            }

            // 替换最终序列
            finalSequence.length = 0;
            finalSequence.push(...safeSequence);

            // 重新统计步数
            completeStep.fill(0);
            targetCompleteStep = -1;
            otherCompleteSteps = {};
            for (let i = 0; i < finalSequence.length; i++) {
                const type = finalSequence[i];
                completeStep[type]++;
                if (completeStep[type] === 3) {
                    if (type === targetType) {
                        targetCompleteStep = i;
                    } else if (otherCompleteSteps[type] === undefined) {
                        otherCompleteSteps[type] = i;
                    }
                }
            }
        }

        // 第四步：设置倍数类型数组
        const multiTypes = new Array(12).fill(1);
        // 收集目标类型的位置
        const targetIdxList: number[] = [];
        const otherIdxList: number[] = [];
        for (let i = 0; i < finalSequence.length; i++) {
            if (finalSequence[i] === targetType) {
                targetIdxList.push(i);
            } else {
                otherIdxList.push(i);
            }
        }

        // 设置倍数
        if (multi >= 2) {
            // 倍数≥2 → 随机选一个目标类型位置设置倍数
            if (targetIdxList.length > 0) {
                const randomIdx = targetIdxList[Math.floor(Math.random() * targetIdxList.length)];
                multiTypes[randomIdx] = multi;
            }
        } else if (otherIdxList.length > 0 && Math.random() < 0.5) {
            // 倍数<2 → 50%概率选一个非目标类型位置设置随机倍数（2-10）
            const randomIdx = otherIdxList[Math.floor(Math.random() * otherIdxList.length)];
            const randomMulti = Math.floor(Math.random() * 9) + 2; // 2-10
            multiTypes[randomIdx] = randomMulti;
        }

        // 赋值倍数数组
        this.multiTypes = multiTypes;

        // 日志输出
        console.log("=== 最终Jackpot序列 ===");
        console.log("序列:", finalSequence);
        console.log("各类型数量:", completeStep);
        console.log(`目标类型(${targetType}) 凑够3个: 第${targetCompleteStep + 1}步`);

        // 验证其他类型是否晚于目标类型凑够3个
        let isSuccess = true;
        const otherTypeEntries = Object.entries(otherCompleteSteps);
        for (let i = 0; i < otherTypeEntries.length; i++) {
            const [typeStr, step] = otherTypeEntries[i];
            const type = parseInt(typeStr);
            console.log(`类型 ${type} 凑够3个: 第${step + 1}步`);
            if (step < targetCompleteStep) {
                console.error(`❌ 类型 ${type} 比目标类型更早凑够3个!`);
                isSuccess = false;
            }
        }

        if (isSuccess) {
            console.log("✅ 成功: 目标类型最先凑够3个!");
        }

        return finalSequence;
    }

    /**
     * 设置当前Jackpot类型（请求服务器+生成序列）
     * @param callback 设置完成后的回调函数
     */
    setJackpotType(callback?: () => void): void {
        const self = this;
        if (!this.block_Node) return;

        this._isEvent = true;
        this.block_Node.active = true;

        // 请求BonusGame数据
        BeeLovedJarsManager.getInstance().sendBonusGameRequest(() => {
            // 获取当前Jackpot类型和倍数
            const spinResult = SlotGameResultManager.Instance.getSpinResult();
            self.currentJackpotType = spinResult.jackpotResults[0].jackpotSubID;
            self.multi = SlotGameResultManager.Instance.getSubGameState("jackpot").getGaugesValue("multiplier");

            // 重置状态
            self.clicked.fill(false);
            self.jackpotTypes.fill(-1);
            self.prev_jackpotTypes = [];
            // 生成序列
            self.sequence = self.generateSequence(self.currentJackpotType, self.multi);

            // 恢复状态
            self._isEvent = false;
            self.block_Node!.active = false;

            // 执行回调
            if (TSUtility.isValid(callback)) {
                callback();
            }
        });
    }

    /**
     * 中奖处理：设置所有目标类型罐子为中奖状态
     */
    winCoin(): void {
        if (!this.jarObjects) return;

        for (let i = 0; i < this.jarObjects.length; i++) {
            if (this.jackpotTypes[i] === this.currentJackpotType) {
                this.setCoinState(i, JackpotState.WIN, this.currentJackpotType);
            }
        }

        // 播放中奖音效
        SlotSoundController.Instance().playAudio("JackpotModeWin", "FX");
    }

    /**
     * 变暗已选中但未中奖的罐子
     */
    dimSelectedCoin(): void {
        if (!this.jarObjects) return;

        for (let i = 0; i < this.jarObjects.length; i++) {
            if (this.clicked[i] && this.jackpotTypes[i] !== this.currentJackpotType) {
                this.setCoinState(i, JackpotState.OPEN_DIM, this.currentJackpotType, -1, false);
            }
        }
    }

    /**
     * 翻转未选中的罐子（显示序列内容）
     */
    flipUnselectedCoins(): void {
        if (!this.jarObjects) return;

        let seqIndex = 0;
        for (let i = 0; i < this.clicked.length; ++i) {
            if (!this.clicked[i] && seqIndex < this.sequence.length) {
                this.setCoinState(i, JackpotState.NONESELECT_OPEN, this.sequence[seqIndex], this.multiTypes[seqIndex], false);
                seqIndex++;
            }
        }
    }

    /**
     * 播放未选中罐子的出现特效（随机摇晃）
     */
    appearJars(): void {
        const self = this;
        if (this._isEvent) return;

        // 收集未点击的罐子索引
        const unclickedIndices: number[] = [];
        for (let i = 0; i < this.clicked.length; i++) {
            if (!this.clicked[i]) {
                unclickedIndices.push(i);
            }
        }

        if (unclickedIndices.length === 0) return;

        this.unscheduleAllCallbacks();

        // 随机逻辑：根据未点击数量决定摇晃数量
        const randomFlag = Math.random() > 0.5;
        const isThreeShake = unclickedIndices.length > 6 && randomFlag;
        const isTwoShake = unclickedIndices.length > 6 && !randomFlag;

        // 随机数生成函数
        const randomRange = (min: number, max: number): number => {
            return Math.random() * (max - min) + min;
        };

        if (isThreeShake) {
            // 摇3个罐子（三等分）
            const third = Math.floor(unclickedIndices.length / 3);
            const twoThird = 2 * Math.floor(unclickedIndices.length / 3);
            const idx1 = Math.floor(randomRange(0, third));
            const idx2 = Math.floor(randomRange(third + 1, twoThird));
            const idx3 = Math.floor(randomRange(twoThird + 1, unclickedIndices.length - 1));

            this.setCoinState(unclickedIndices[idx1], JackpotState.NONESELECT_APPEAR);
            this.setCoinState(unclickedIndices[idx2], JackpotState.NONESELECT_APPEAR);
            this.setCoinState(unclickedIndices[idx3], JackpotState.NONESELECT_APPEAR);
        } else if (isTwoShake) {
            // 摇2个罐子（二等分）
            const half = Math.floor(unclickedIndices.length / 2);
            const idx1 = Math.floor(randomRange(0, half));
            const idx2 = Math.floor(randomRange(half + 1, unclickedIndices.length - 1));

            this.setCoinState(unclickedIndices[idx1], JackpotState.NONESELECT_APPEAR);
            this.setCoinState(unclickedIndices[idx2], JackpotState.NONESELECT_APPEAR);
        } else {
            // 摇1个罐子（随机）
            const randomIdx = Math.floor(Math.random() * unclickedIndices.length);
            this.setCoinState(unclickedIndices[randomIdx], JackpotState.NONESELECT_APPEAR);
        }

        // 延迟3秒重复
        this.scheduleOnce(() => {
            self.appearJars();
        }, 3);
    }
}