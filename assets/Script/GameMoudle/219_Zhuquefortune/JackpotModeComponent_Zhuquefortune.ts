import SlotSoundController from "../../Slot/SlotSoundController";
import State from "../../Slot/State";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import JackpotModeCoin_Zhuquefortune from "./JackpotModeCoin_Zhuquefortune";
import JackpotModeUI_Zhuquefortune from "./JackpotModeUI_Zhuquefortune";
import MoveJackpotModeCoin_Zhuquefortune from "./MoveJackpotModeCoin_Zhuquefortune";
import ZhuquefortuneManager from "./ZhuquefortuneManager";

const { ccclass, property } = cc._decorator;

/**
 * Jackpot 硬币状态枚举（对应原代码中的匿名枚举）
 */
export enum JackpotCoinState {
    NONESELECT = 0,          // 未选中（默认状态）
    NONESELECT_APPEAR = 1,   // 未选中-晃动出现
    SELECT = 2,              // 已选中（翻转硬币）
    WIN = 3,                 // 中奖（高亮显示）
    NONESELECT_OPEN = 4,     // 未选中-打开显示
    DOUBLE_SELECT = 5,       // 双重选中
    OPEN_DIM = 6             // 打开-变暗（未中奖）
}

/**
 * 朱雀运势 Jackpot 模式核心组件
 * 负责 Jackpot 模式的显隐、硬币状态管理、游戏序列生成、硬币交互与特效播放
 */
@ccclass()
export default class JackpotModeComponent_Zhuquefortune extends cc.Component {
    // 12 个 Jackpot 硬币对象数组
    @property([JackpotModeCoin_Zhuquefortune])
    public coinObjects: JackpotModeCoin_Zhuquefortune[] = [];

    // 硬币移动组件
    @property(MoveJackpotModeCoin_Zhuquefortune)
    public moveCoinObject: MoveJackpotModeCoin_Zhuquefortune | null = null;

    // Jackpot 模式 UI 组件
    @property(JackpotModeUI_Zhuquefortune)
    public jackpotModeUI: JackpotModeUI_Zhuquefortune | null = null;

    // Jackpot 模式节点动画组件
    @property(cc.Animation)
    public jackpotNodeAni: cc.Animation | null = null;

    // 点击屏蔽节点（防止重复交互）
    @property(cc.Node)
    public block_Node: cc.Node | null = null;

    // 私有变量：上一轮 Jackpot 类型数组
    private prev_jackpotTypes: number[] = [];

    // 私有变量：当前 12 个硬币对应的 Jackpot 类型数组（-1 表示未初始化）
    private jackpotTypes: number[] = new Array(12).fill(-1);

    // 私有变量：游戏执行序列数组
    private sequence: number[] = [];

    // 私有变量：12 个硬币的点击状态数组（false 未点击，true 已点击）
    private clicked: boolean[] = new Array(12).fill(false);

    // 私有变量：Jackpot 状态回调函数
    private jackpotStateCallback: (() => void) | null = null;

    // 私有变量：当前 Jackpot 类型（0-3 对应 mini/ minor/ major/ mega/ grand）
    private currentJackpotType: number = 0;

    // 私有变量：是否处于事件执行中（防止重复交互）
    private _isEvent: boolean = false;

    /**
     * 进入函数（调度回调，取消所有未执行的定时器）
     */
    public enterFunc(): void {
        if (this._isEvent !== true) {
            this.unscheduleAllCallbacks();
        }
    }

    /**
     * 离开函数（延迟 3 秒执行硬币出现逻辑）
     */
    public leaveFunc(): void {
        this.scheduleOnce(() => {
            this.appearCoin();
        }, 3);
    }

    /**
     * 显示 Jackpot 模式（播放闲置动画、初始化 UI、处理子游戏逻辑）
     * @param onComplete 显示完成后的回调函数
     */
    public showJackpotMode(onComplete?: () => void): void {
        if (!this.node || !this.jackpotNodeAni || !this.jackpotModeUI || !this.block_Node) return;

        // 1. 激活节点、播放闲置动画、初始化状态
        this.node.active = true;
        this.jackpotNodeAni.play("JackpotMode_Idle_Ani", 0);
        this._isEvent = true;
        this.block_Node.active = true;
        this.jackpotModeUI.startAnimation();
        this.resetCoinState();

        // 2. 判断下一个子游戏是否为 Jackpot，处理不同逻辑分支
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        if (nextSubGameKey === "jackpot") {
            // 直接完成逻辑，取消屏蔽
            this._isEvent = false;
            this.block_Node.active = false;
            if (TSUtility.isValid(onComplete)) {
                onComplete!();
            }

            // 延迟 3 秒播放硬币出现动画
            this.scheduleOnce(() => {
                this.appearCoin();
            }, 3);
        } else {
            // 延迟 2.5 秒后完成逻辑
            const actionSequence: cc.Action = cc.sequence(
                cc.delayTime(2.5),
                cc.callFunc(() => {
                    this._isEvent = false;
                    this.block_Node!.active = false;
                    if (TSUtility.isValid(onComplete)) {
                        onComplete!();
                    }

                    // 延迟 3 秒播放硬币出现动画
                    this.scheduleOnce(() => {
                        this.appearCoin();
                    }, 3);
                })
            );

            this.node.runAction(actionSequence);
        }
    }

    /**
     * 隐藏 Jackpot 模式（播放消失动画、重置状态、隐藏节点）
     */
    public hideJackpotMode(): void {
        if (!this.node || !this.jackpotNodeAni || !this.jackpotModeUI) return;

        // 1. 播放消失动画
        this.jackpotNodeAni.play("JackpotMode_Disappear_Ani", 0);

        // 2. 延迟 0.4 秒后重置状态并隐藏节点
        const actionSequence: cc.Action = cc.sequence(
            cc.delayTime(0.4),
            cc.callFunc(() => {
                this.node.active = false;
                this.resetCoinState();
                this.jackpotModeUI.clearBetperLine();
                this.jackpotModeUI.initUI();
            })
        );

        this.node.runAction(actionSequence);
    }

    /**
     * 播放 Jackpot 游戏状态（创建状态对象，绑定完成回调）
     * @returns 初始化后的 State 对象
     */
    public playJackpotGameState(): State {
        const state = new State();
        const self = this;

        // 绑定状态启动回调，设置 Jackpot 状态完成回调
        state.addOnStartCallback(() => {
            self.jackpotStateCallback = () => {
                state.setDone();
                self.jackpotStateCallback = null;
            };
        });

        return state;
    }

    /**
     * 重置所有硬币状态（恢复默认层级、设置为未选中状态）
     */
    public resetCoinState(): void {
        for (let i = 0; i < 12; ++i) {
            if (this.coinObjects[i] && this.coinObjects[i].node) {
                // 恢复硬币节点默认层级
                this.coinObjects[i].node.setSiblingIndex(i);
                // 设置硬币为未选中状态
                this.setCoinState(i, JackpotCoinState.NONESELECT);
            }
        }
    }

    /**
     * 设置单个硬币的状态（根据状态执行对应逻辑：初始化、晃动、翻转等）
     * @param index 硬币索引（0-11）
     * @param state 硬币目标状态
     * @param jackpotType Jackpot 类型（可选，默认 -1）
     */
    public setCoinState(index: number, state: JackpotCoinState, jackpotType: number = -1): void {
        const coin = this.coinObjects[index];
        if (!coin || !coin.node || !coin.node.parent) return;

        // 根据不同状态执行硬币对应逻辑
        switch (state) {
            case JackpotCoinState.NONESELECT:
                coin.initCoin(this.enterFunc.bind(this), this.leaveFunc.bind(this));
                break;
            case JackpotCoinState.NONESELECT_APPEAR:
                coin.shakeCoin();
                break;
            case JackpotCoinState.SELECT:
                coin.flipCoin(jackpotType);
                coin.node.setSiblingIndex(coin.node.parent.children.length - 1); // 提升选中硬币层级
                break;
            case JackpotCoinState.WIN:
                coin.winCoin();
                coin.node.setSiblingIndex(coin.node.parent.children.length - 1); // 提升中奖硬币层级
                break;
            case JackpotCoinState.NONESELECT_OPEN:
                coin.noneSelectCoin(jackpotType);
                break;
            case JackpotCoinState.DOUBLE_SELECT:
                coin.doubleSelectCoin();
                break;
            case JackpotCoinState.OPEN_DIM:
                coin.dimmedCoin();
                break;
            default:
                break;
        }

        // 更新硬币对应的 Jackpot 类型，提升父节点层级
        this.jackpotTypes[index] = jackpotType;
        coin.node.parent.setSiblingIndex(coin.node.parent.parent?.children.length - 1 || 0);
    }

    /**
     * 硬币点击事件处理（处理点击逻辑、更新序列、播放动画、执行回调）
     * @param _event 点击事件（未使用）
     * @param indexStr 硬币索引字符串
     */
    public onClickCoin(_event: Event, indexStr: string): void {
        if (!this.block_Node || !this.moveCoinObject || !this.jackpotModeUI) return;

        const index = parseInt(indexStr);
        // 已点击或处于事件执行中，直接返回（防止重复交互）
        if (this.clicked[index] === true || this._isEvent === true) return;

        cc.log("onClickCoin index : " + index);
        this.block_Node.active = true;
        this._isEvent = true;
        this.unscheduleAllCallbacks();
        this.clicked[index] = true;

        // 1. 提取序列首个元素，更新序列和上一轮 Jackpot 类型
        const firstSequence = this.sequence[0];
        this.sequence.shift();
        this.prev_jackpotTypes.push(firstSequence);

        // 2. 锁定所有硬币，重置缩放
        for (let i = 0; i < this.coinObjects.length; i++) {
            if (this.coinObjects[i]) {
                this.coinObjects[i]._isEvent = true;
                this.coinObjects[i].node.scale = 1;
            }
        }

        // 3. 统计当前 Jackpot 类型的选中次数，判断是否还有剩余
        const sameTypeCount = this.prev_jackpotTypes.filter(type => type === firstSequence).length;
        const hasNoRemaining = this.sequence.includes(this.currentJackpotType) === false;

        // 4. 定义各个阶段的回调函数
        const onSelectCoin = () => {
            this.setCoinState(index, JackpotCoinState.SELECT, firstSequence);
            SlotSoundController.Instance().playAudio("JackpotModeSelect", "FX");
        };

        const onMoveCoin = () => {
            this.moveCoinObject!.moveSymbol(index, firstSequence, sameTypeCount - 1, () => {
                this.jackpotModeUI!.aliveJackpot(firstSequence, sameTypeCount - 1);
            });
        };

        const onWinProcess = () => {
            this.winCoin();
            this.dimSelectedCoin();
            this.flipUnselectedCoins();
        };

        const onCompleteSingle = () => {
            // 重置所有硬币事件锁定状态
            for (let i = 0; i < this.coinObjects.length; i++) {
                if (this.coinObjects[i]) {
                    this.coinObjects[i]._isEvent = false;
                }
            }

            // 查找当前 Jackpot 类型的已点击硬币
            const sameTypeClicked: number[] = [];
            for (let i = 0; i < this.clicked.length; i++) {
                if (this.clicked[i] === true && this.jackpotTypes[i] === firstSequence) {
                    sameTypeClicked.push(i);
                }
            }

            // 双重选中处理（2 个相同类型硬币）
            if (sameTypeClicked.length === 2) {
                for (let i = 0; i < sameTypeClicked.length; i++) {
                    this.setCoinState(sameTypeClicked[i], JackpotCoinState.DOUBLE_SELECT, firstSequence);
                }

                // 延迟取消屏蔽，播放硬币出现动画
                this.scheduleOnce(() => {
                    this._isEvent = false;
                    this.block_Node!.active = false;
                    this.appearCoin();
                }, 0.7);
            } else {
                // 直接取消屏蔽，播放硬币出现动画
                this._isEvent = false;
                this.block_Node!.active = false;
                this.appearCoin();
            }
        };

        const onCompleteWin = () => {
            if (this.jackpotStateCallback) {
                this.jackpotStateCallback();
            }

            // 重置所有硬币事件锁定状态
            for (let i = 0; i < this.coinObjects.length; i++) {
                if (this.coinObjects[i]) {
                    this.coinObjects[i]._isEvent = false;
                }
            }
        };

        // 5. 执行不同的动作序列（有剩余中奖 / 无剩余中奖）
        if (!hasNoRemaining) {
            // 无剩余中奖：仅选中和移动硬币
            const actionSequence = cc.sequence(
                cc.callFunc(onSelectCoin),
                cc.delayTime(0.75),
                cc.callFunc(onMoveCoin),
                cc.delayTime(0.5),
                cc.callFunc(onCompleteSingle)
            );
            this.node.runAction(actionSequence);
        } else {
            // 有剩余中奖：完整流程（选中→移动→中奖→完成）
            const actionSequence = cc.sequence(
                cc.callFunc(onSelectCoin),
                cc.delayTime(0.75),
                cc.callFunc(onMoveCoin),
                cc.delayTime(0.5),
                cc.callFunc(onWinProcess),
                cc.delayTime(2),
                cc.callFunc(onCompleteWin)
            );
            this.node.runAction(actionSequence);
        }
    }

    /**
     * 生成 Jackpot 游戏执行序列（随机生成，保证每个类型至少 3 个）
     * @param targetType 目标 Jackpot 类型
     * @returns 生成的 12 位执行序列数组
     */
    public generateSequence(targetType: number): number[] {
        // 1. 初始化计数数组（0-3 对应 4 种 Jackpot 类型）
        const count: number[] = [0, 0, 0, 0];
        let tempSequence: number[] = [];

        // 2. 初步生成 12 位序列
        for (let o = 1; o <= 12; o++) {
            let currentType: number | undefined = undefined;

            // 优先填充目标类型（根据位置设置概率）
            if (count[targetType] < 3) {
                if (o >= 6 && o <= 8) {
                    let probability = 0;
                    if (o === 6) probability = 30;
                    else if (o === 7) probability = 60;
                    else if (o === 8) probability = 90;

                    if (Math.random() * 100 < probability) {
                        currentType = targetType;
                    }
                } else if (o >= 9) {
                    currentType = targetType;
                }
            }

            // 填充其他可用类型
            if (currentType === undefined) {
                // 筛选可用类型（计数 < 3）
                let availableTypes = [0, 1, 2, 3].filter(type => count[type] < 3);

                // 前 5 个位置限制计数 < 2
                if (o <= 5) {
                    availableTypes = availableTypes.filter(type => count[type] < 2);
                }

                // 进一步筛选：目标类型或计数 < 2 或目标类型计数 >= 3
                availableTypes = availableTypes.filter(type => {
                    return type === targetType || count[type] < 2 || count[targetType] >= 3;
                });

                // 随机选择可用类型
                currentType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            }

            // 更新序列和计数
            tempSequence.push(currentType);
            count[currentType]++;
        }

        // 3. 补充不足 3 个的类型，确保每个类型至少 3 个
        const supplement: number[] = [];
        for (let s = 0; s < 4; s++) {
            while (count[s] < 3) {
                supplement.push(s);
                count[s]++;
            }
        }

        // 4. 修正序列，替换超出 3 个的类型为补充类型
        const finalSequence: number[] = [];
        const finalCount: number[] = [0, 0, 0, 0];
        let supplementIndex = 0;

        for (let i = 0; i < tempSequence.length; i++) {
            const type = tempSequence[i];
            if (finalCount[type] >= 3 && supplementIndex < supplement.length) {
                // 替换为补充类型
                const supplementType = supplement[supplementIndex++];
                finalSequence.push(supplementType);
                finalCount[supplementType]++;
            } else {
                finalSequence.push(type);
                finalCount[type]++;
            }
        }

        return finalSequence;
    }

    /**
     * 设置 Jackpot 类型（发送请求、解析结果、生成执行序列）
     * @param onComplete 设置完成后的回调函数
     */
    public setJackpotType(onComplete?: () => void): void {
        if (!this.block_Node) return;

        this._isEvent = true;
        this.block_Node.active = true;

        // 发送 Bonus Game 请求，解析 Jackpot 类型
        ZhuquefortuneManager.getInstance().sendBonusGameRequest(() => {
            let jackpotType = 0;
            const spinResult = SlotGameResultManager.Instance.getSpinResult();
            const jackpotSubKey = spinResult.jackpotResults[0]?.jackpotSubKey || "";
            const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();

            // 解析当前子游戏对应的 Jackpot 类型
            if (currentSubGameKey === "jackpot") {
                switch (jackpotSubKey) {
                    case "mini": jackpotType = 0; break;
                    case "minor": jackpotType = 1; break;
                    case "major": jackpotType = 2; break;
                    case "mega": jackpotType = 3; break;
                    default: jackpotType = 0; break;
                }
            } else {
                switch (jackpotSubKey) {
                    case "minor": jackpotType = 0; break;
                    case "major": jackpotType = 1; break;
                    case "mega": jackpotType = 2; break;
                    case "grand": jackpotType = 3; break;
                    default: jackpotType = 0; break;
                }
            }

            // 重置状态，生成执行序列
            this.currentJackpotType = jackpotType;
            this.clicked.fill(false);
            this.jackpotTypes.fill(-1);
            this.prev_jackpotTypes = [];
            this.sequence = this.generateSequence(this.currentJackpotType);

            // 取消事件锁定，执行回调
            this._isEvent = false;
            this.block_Node!.active = false;
            if (TSUtility.isValid(onComplete)) {
                onComplete!();
            }
        });
    }

    /**
     * 中奖硬币处理（高亮所有对应当前 Jackpot 类型的硬币，播放中奖音效）
     */
    public winCoin(): void {
        for (let i = 0; i < this.coinObjects.length; i++) {
            if (this.jackpotTypes[i] === this.currentJackpotType) {
                this.setCoinState(i, JackpotCoinState.WIN, this.currentJackpotType);
            }
        }

        SlotSoundController.Instance().playAudio("JackpotModeWin", "FX");
    }

    /**
     * 未中奖选中硬币处理（变暗所有已点击但未中奖的硬币）
     */
    public dimSelectedCoin(): void {
        for (let i = 0; i < this.coinObjects.length; i++) {
            if (this.clicked[i] === true && this.jackpotTypes[i] !== this.currentJackpotType) {
                this.setCoinState(i, JackpotCoinState.OPEN_DIM, this.currentJackpotType);
            }
        }
    }

    /**
     * 翻转未选中硬币（显示所有未点击硬币的对应序列类型）
     */
    public flipUnselectedCoins(): void {
        let sequenceIndex = 0;
        for (let i = 0; i < this.clicked.length; ++i) {
            if (this.clicked[i] === false && sequenceIndex < this.sequence.length) {
                this.setCoinState(i, JackpotCoinState.NONESELECT_OPEN, this.sequence[sequenceIndex]);
                sequenceIndex++;
            }
        }
    }

    /**
     * 播放 Jackpot 中奖 UI 动画
     */
    public winJackpotUI(): void {
        if (this.jackpotModeUI) {
            this.jackpotModeUI.winJackpotUI();
        }
    }

    /**
     * 硬币出现动画（随机晃动未点击的硬币，营造交互氛围）
     */
    public appearCoin(): void {
        if (this._isEvent === true) return;

        // 1. 收集所有未点击的硬币索引
        const unclickedCoins: number[] = [];
        for (let i = 0; i < this.clicked.length; i++) {
            if (this.clicked[i] === false) {
                unclickedCoins.push(i);
            }
        }

        if (unclickedCoins.length === 0) return;

        // 2. 取消所有未执行的定时器
        this.unscheduleAllCallbacks();

        // 3. 随机选择晃动的硬币（根据未点击硬币数量选择不同策略）
        const isRandomMore = Math.random() > 0.5;
        const isThreeCoins = unclickedCoins.length > 6 && isRandomMore;
        const isTwoCoins = unclickedCoins.length > 6 && !isRandomMore;

        if (isThreeCoins) {
            // 晃动 3 个硬币（均分未点击硬币数组）
            const third = Math.floor(unclickedCoins.length / 3);
            const twoThird = 2 * Math.floor(unclickedCoins.length / 3);

            const idx1 = Math.floor(this.getRandomNum(0, third));
            const idx2 = Math.floor(this.getRandomNum(third + 1, twoThird));
            const idx3 = Math.floor(this.getRandomNum(twoThird + 1, unclickedCoins.length - 1));

            this.setCoinState(unclickedCoins[idx1], JackpotCoinState.NONESELECT_APPEAR);
            this.setCoinState(unclickedCoins[idx2], JackpotCoinState.NONESELECT_APPEAR);
            this.setCoinState(unclickedCoins[idx3], JackpotCoinState.NONESELECT_APPEAR);
        } else if (isTwoCoins) {
            // 晃动 2 个硬币（均分未点击硬币数组）
            const half = Math.floor(unclickedCoins.length / 2);

            const idx1 = Math.floor(this.getRandomNum(0, half));
            const idx2 = Math.floor(this.getRandomNum(half + 1, unclickedCoins.length - 1));

            this.setCoinState(unclickedCoins[idx1], JackpotCoinState.NONESELECT_APPEAR);
            this.setCoinState(unclickedCoins[idx2], JackpotCoinState.NONESELECT_APPEAR);
        } else {
            // 晃动 1 个硬币（随机选择）
            const randomIdx = Math.floor(Math.random() * unclickedCoins.length);
            this.setCoinState(unclickedCoins[randomIdx], JackpotCoinState.NONESELECT_APPEAR);
        }

        // 4. 延迟 3 秒重复执行，持续营造氛围
        this.scheduleOnce(() => {
            this.appearCoin();
        }, 3);
    }

    /**
     * 获取指定区间的随机数（辅助硬币出现动画的随机选择）
     * @param min 最小值
     * @param max 最大值
     * @returns 区间内的随机数
     */
    private getRandomNum(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}