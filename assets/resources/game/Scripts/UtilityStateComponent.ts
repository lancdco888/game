import CameraControl from "../../../Script/Slot/CameraControl";
import SlotSoundController from "../../../Script/Slot/SlotSoundController";
import State, { SequencialState } from "../../../Script/Slot/State";
import TSUtility from "../../../Script/global_utility/TSUtility";
import SlotGameResultManager from "../../../Script/manager/SlotGameResultManager";
import SlotGameRuleManager from "../../../Script/manager/SlotGameRuleManager";
import SlotManager from "../../../Script/manager/SlotManager";

const { ccclass, property } = cc._decorator;


/**
 * 通用状态工具组件
 * 封装游戏通用逻辑：弹窗控制、相机移动、奖励金额滚动、音效播放、赢奖状态处理等
 */
@ccclass()
export default class UtilityStateComponent {
    // ================= 配置常量（位运算选项） =================
    public readonly option_skip = 1;                  // 跳过动画
    public readonly option_ignore_explodecoin = 2;    // 忽略爆炸金币特效
    public readonly option_ignore_unlock = 4;         // 忽略解锁交互
    public readonly option_total_win_text = 8;        // 显示总赢奖文本
    public readonly option_bigwin_up_screen = 16;     // 大赢奖时屏幕上移
    public readonly option_ignore_jackpot = 32;       // 忽略Jackpot计算
    public readonly option_sub_result_value = 64;     // 子游戏结果值

    // ================= 赢奖等级枚举 =================
    public readonly NORMAL_WIN = 0;   // 普通赢奖
    public readonly BIG_WIN = 1;      // 大赢奖
    public readonly MEGA_WIN = 2;     // 超大赢奖
    public readonly ULTRA_WIN = 3;    // 终极赢奖

    // ================= 核心属性 =================
    public game_manager: SlotManager|any = null;          // 插槽管理器实例
    public game_component: cc.Component = null;          // 游戏组件节点

    /**
     * 构造函数
     * @param slotManager 插槽管理器实例
     * @param gameComponent 游戏组件节点
     */
    constructor(slotManager: SlotManager, gameComponent: cc.Component|any) {
        this.game_manager = slotManager;
        this.game_component = gameComponent;
    }

    // ================= 子游戏状态判断 =================
    /**
     * 判断下一个子游戏是否为基础游戏
     * @returns true=基础游戏，false=其他游戏（免费/奖励）
     */
    public isNextSubGameBase(): boolean {
        return SlotGameResultManager.Instance.getNextSubGameKey() === "base";
    }

    // ================= 弹窗控制 =================
    /**
     * 创建打开弹窗的状态
     * @param popupConfig 弹窗配置
     * @returns 弹窗状态实例
     */
    public openPopupState(popupConfig: any): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_component["onOpenPopup"](popupConfig, () => {
                state.setDone();
            });
        });
        return state;
    }

    /**
     * 创建带相机控制的弹窗状态
     * @param popupConfig 弹窗配置
     * @param isUpScreen 是否上移屏幕（默认false）
     * @param duration 动画时长（默认1）
     * @param isInsertFirst 是否插入到第一个位置（可选）
     * @returns 带相机控制的弹窗序列状态
     */
    public openPopupCameraOptionState(
        popupConfig: any,
        isUpScreen: boolean = false,
        duration: number = 1,
        isInsertFirst?: boolean
    ): SequencialState {
        const seqState = new SequencialState();
        let index = 0;

        // 相机移动子状态
        const cameraSubState = new SequencialState();
        cameraSubState.addOnStartCallback(() => {
            if (isUpScreen) {
                // 上移屏幕时的相机状态判断
                if (CameraControl.Instance.eStateOfCameraPosition !== 2 && !CameraControl.Instance.isOriginalPos()) {
                    cameraSubState.insert(0, this.getMovingCameraState(isUpScreen, duration));
                }
            } else {
                // 下移屏幕时的相机状态判断
                if (CameraControl.Instance.eStateOfCameraPosition !== 1 && !CameraControl.Instance.isOriginalPos()) {
                    cameraSubState.insert(0, this.getMovingCameraState(isUpScreen, duration));
                }
            }
        });

        // 插入相机状态（根据isInsertFirst调整位置）
        const insertIndex = TSUtility.isValid(isInsertFirst) || isInsertFirst ? index++ : index + 1;
        seqState.insert(insertIndex, cameraSubState);

        // 弹窗状态
        const popupState = new State();
        popupState.addOnStartCallback(() => {
            this.game_component["onOpenPopup"](popupConfig, () => {
                popupState.setDone();
            });
        });
        seqState.insert(index++, popupState);

        return seqState;
    }

    // ================= 事件控制 =================
    /**
     * 创建事件控制状态（键盘/鼠标拖拽）
     * @param isEnable 是否启用事件
     * @returns 事件控制状态实例
     */
    public onEventControlState(isEnable: boolean): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager.setKeyboardEventFlag(isEnable);
            this.game_manager.setMouseDragEventFlag(isEnable);
            state.setDone();
        });
        return state;
    }

    // ================= 相机控制 =================
    /**
     * 创建相机移动状态
     * @param isUpScreen 是否上移屏幕（默认false）
     * @param duration 动画时长（默认1）
     * @returns 相机移动序列状态
     */
    public getMovingCameraState(isUpScreen: boolean = false, duration: number = 1): SequencialState {
        const seqState = new SequencialState();

        // 相机移动执行状态
        const moveState = new State();
        moveState.addOnStartCallback(() => {
            CameraControl.Instance.resetZoomRelative(duration, false);
            if (isUpScreen) {
                CameraControl.Instance.scrollUpScreen(duration, cc.easeOut(2));
            } else {
                CameraControl.Instance.scrollDownScreen(duration, cc.easeOut(2));
            }
            moveState.setDone();
        });

        seqState.insert(0, moveState);
        seqState.insert(1, this.getDelayState(duration));

        return seqState;
    }

    /**
     * 创建相机缩放状态
     * @param isZoomIn 是否放大（true=放大，false=缩小）
     * @param duration 动画时长
     * @returns 相机缩放序列状态
     */
    public getSetCameraZoomRelative(isZoomIn: boolean, duration: number): SequencialState {
        const seqState = new SequencialState();

        const zoomState = new State();
        zoomState.addOnStartCallback(() => {
            CameraControl.Instance.setZoomRelative(duration, isZoomIn?1:0, true);
            zoomState.setDone();
        });

        seqState.insert(0, zoomState);
        seqState.insert(1, this.getDelayState(duration));

        return seqState;
    }

    // ================= 延时控制 =================
    /**
     * 创建延时状态
     * @param delayTime 延时时长（秒，默认1）
     * @param endCallback 延时结束回调（可选）
     * @returns 延时状态实例
     */
    public getDelayState(delayTime: number = 1, endCallback?: Function): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.game_manager.scheduleOnce(() => {
                state.setDone();
            }, delayTime);
        });

        if (endCallback) {
            state.addOnEndCallback(endCallback);
        }

        return state;
    }

    // ================= 音效控制 =================
    /**
     * 播放金额滚动结束音效
     */
    public playIncrementEndCoinSound(): void {
        SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");
        const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
        if (totalWin > 0 && SlotSoundController.Instance().getAudioClip("IncrementEndCoin")) {
            SlotSoundController.Instance().playAudio("IncrementEndCoin", "FX");
        }
    }

    // ================= 金额滚动辅助 =================
    /**
     * 金额滚动前置处理
     * @param startValue 起始金额
     * @param targetValue 目标金额
     * @param animationTime 动画时长
     */
    public preIncreaseMoneyChange(startValue: number, targetValue: number, animationTime: number): void {
        SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
        this.game_manager.bottomUIText.playChangeWinMoney(startValue, targetValue, null, false, animationTime);
        this.game_manager.setMouseDragEventFlag(false);
    }

    /**
     * 大赢奖金额滚动处理
     * @param startValue 起始金额
     * @param targetValue 目标金额
     * @param endCallback 结束回调
     * @param options 配置选项（位运算）
     */
    public bigwinIncreaseMoneyChange(
        startValue: number,
        targetValue: number,
        endCallback: Function,
        options: number
    ): void {
        const bigWinEffect = this.game_component["effectBigWinNew"];
        const totalBet = SlotGameRuleManager.Instance.getTotalBet();
        
        // 是否忽略爆炸金币特效
        bigWinEffect._isPlayExplodeCoin = !(options & this.option_ignore_explodecoin);

        if (options & this.option_skip) {
            // 跳过动画直接播放赢奖特效
            bigWinEffect.playWinEffectWithoutIncreaseMoney(targetValue, totalBet, endCallback, null, false);
        } else {
            // 带金额滚动的赢奖特效
            const animationTime = bigWinEffect.playWinEffect(
                targetValue,
                totalBet,
                endCallback,
                () => {
                    this.game_manager.bottomUIText.stopChangeWinMoney(targetValue);
                    this.playIncrementEndCoinSound();
                },
                false,
                startValue
            );

            this.game_manager.bottomUIText.playChangeWinMoney(
                startValue,
                targetValue,
                () => this.playIncrementEndCoinSound(),
                false,
                animationTime
            );
        }
    }

    // ================= 赢奖结束处理 =================
    /**
     * 赢奖流程结束处理
     * @param state 当前状态实例
     * @param winMoney 赢奖金额
     * @param options 配置选项（位运算）
     */
    public winEndProcess(state: State, winMoney: number, options: number): void {
        // 隐藏赢奖特效
        this.game_manager.bottomUIText.showWinEffect(false);

        // 解锁交互（如果未配置忽略）
        if (!(options & this.option_ignore_unlock)) {
            this.game_manager.setKeyboardEventFlag(true);
            this.game_manager.setMouseDragEventFlag(true);
        }

        if (winMoney > 0) {
            // 应用赢奖金额
            if (options & this.option_sub_result_value) {
                if (SlotGameResultManager.Instance.getWinType(winMoney) === SlotGameResultManager.WINSTATE_NORMAL) {
                    this.game_manager.applyGameResultMoneyBySubFromResult(winMoney);
                }
            } else {
                this.game_manager.applyGameResultMoney(winMoney);
            }

            // 设置赢奖文本
            if (options & this.option_total_win_text) {
                this.game_manager.bottomUIText.setWinMoney(winMoney, "TOTAL WIN");
            } else {
                this.game_manager.bottomUIText.setWinMoney(winMoney);
            }

            // 播放结束音效并延时完成状态
            this.playIncrementEndCoinSound();
            this.game_manager.scheduleOnce(() => {
                state.setDone();
            }, 0.4);
        } else {
            // 无赢奖直接完成状态
            state.setDone();
        }
    }

    // ================= Jackpot 计算 =================
    /**
     * 计算Jackpot总奖金
     * @param jackpotResults Jackpot结果数组
     * @returns 总奖金金额
     */
    public getJackpotTotalPay(jackpotResults: Array<{ winningCoin: number }>): number {
        let total = 0;
        if (jackpotResults && jackpotResults.length > 0) {
            for (const result of jackpotResults) {
                total += result.winningCoin;
            }
        }
        return total;
    }

    // ================= 核心：赢奖金额状态创建 =================
    /**
     * 创建赢奖金额展示状态（核心方法）
     * @param options 配置选项（位运算，默认0）
     * @param customWinMoney 获取自定义赢奖金额的回调（可选）
     * @param subtractValue 需扣除的金额（可选）
     * @param cameraDuration 相机动画时长（默认0.8）
     * @param animationConfig 动画配置（可选）
     * @param customJackpotValue 自定义Jackpot金额（默认0）
     * @returns 赢奖金额展示序列状态
     */
    public getWinMoneyState(
        options: number = 0,
        customWinMoney?: () => number,
        subtractValue?: number,
        cameraDuration: number = 0.8,
        animationConfig?: { animation_time: number },
        customJackpotValue: number = 0
    ): SequencialState {
        const seqState = new SequencialState();
        let index = 0;

        // 相机控制子状态
        const cameraSubState = new SequencialState();
        cameraSubState.addOnStartCallback(() => {
            const winMoney = customWinMoney ? customWinMoney() : SlotGameResultManager.Instance.getTotalWinMoney();
            // 普通赢奖且相机非初始状态时，添加相机移动
            if (
                SlotGameResultManager.Instance.getWinType(winMoney) === SlotGameResultManager.WINSTATE_NORMAL &&
                (CameraControl.Instance.eStateOfCameraPosition !== 1 || !CameraControl.Instance.isOriginalPos())
            ) {
                cameraSubState.insert(0, this.getMovingCameraState(!!(options & this.option_bigwin_up_screen), cameraDuration));
                cameraSubState.insert(1, this.getDelayState(cameraDuration));
            }
        });
        seqState.insert(index++, cameraSubState);

        // 赢奖金额处理状态
        const winProcessState = new State();
        winProcessState.addOnStartCallback(() => {
            // 获取最终赢奖金额
            const winMoney = customWinMoney ? customWinMoney() : SlotGameResultManager.Instance.getTotalWinMoney();

            if (winMoney === 0) {
                // 无赢奖直接结束
                this.winEndProcess(winProcessState, winMoney, options);
                return;
            }

            // 计算Jackpot相关金额
            const jackpotResults = SlotGameResultManager.Instance.getSpinResult().jackpotResults;
            const totalJackpot = this.getJackpotTotalPay(jackpotResults);
            const winType = SlotGameResultManager.Instance.getWinType(winMoney);
            const totalBet = SlotGameRuleManager.Instance.getTotalBet();
            // 实际Jackpot金额（是否忽略Jackpot配置）
            const actualJackpot = !!(options & this.option_ignore_jackpot) ? customJackpotValue : totalJackpot;
            const finalWinMoney = winMoney;
            // 赢奖等级判断（3倍总投注以上为MEGA WIN）
            const winLevel = totalBet * 3 < winMoney ? this.MEGA_WIN : this.BIG_WIN;

            // 显示赢奖特效
            this.game_manager.bottomUIText.showWinEffect(true);

            if (winType !== SlotGameResultManager.WINSTATE_NORMAL) {
                // 非普通赢奖（BIG/MEGA/ULTRA WIN）
                const middleValue = actualJackpot + (finalWinMoney - actualJackpot) / 3;
                const animationTime = TSUtility.isValid(animationConfig) && TSUtility.isValid(animationConfig.animation_time)
                    ? animationConfig.animation_time
                    : this.game_manager.getAnimationTime();
                const realMiddleValue = animationTime === 0 ? 0 : middleValue;

                if (options & this.option_skip) {
                    // 跳过动画
                    this.game_manager.node.runAction(
                        cc.callFunc(this.bigwinIncreaseMoneyChange.bind(
                            this, 0, finalWinMoney, this.winEndProcess.bind(this, winProcessState, finalWinMoney, options), options
                        ))
                    );
                } else {
                    // 带金额滚动动画
                    this.game_manager.bottomUIText.setWinMoney(0);
                    this.game_manager.node.runAction(
                        cc.sequence(
                            cc.callFunc(this.preIncreaseMoneyChange.bind(this, actualJackpot, realMiddleValue, animationTime)),
                            cc.delayTime(animationTime),
                            cc.callFunc(this.bigwinIncreaseMoneyChange.bind(
                                this, realMiddleValue, finalWinMoney, this.winEndProcess.bind(this, winProcessState, finalWinMoney, options), options
                            ))
                        )
                    );
                }
            } else {
                // 普通赢奖
                let realWinMoney = finalWinMoney;
                // 扣除指定金额（如果有）
                if (subtractValue !== null && subtractValue !== undefined) {
                    realWinMoney -= subtractValue;
                }

                if (realWinMoney === 0) {
                    // 扣除后无赢奖
                    this.game_manager.bottomUIText.playCoinEffectOfWinCoinArea();
                    this.winEndProcess(winProcessState, finalWinMoney, options);
                } else if (options & this.option_skip) {
                    // 跳过动画直接结束
                    this.winEndProcess(winProcessState, finalWinMoney, options);
                } else {
                    // 普通金额滚动
                    const animationTime = TSUtility.isValid(animationConfig) && TSUtility.isValid(animationConfig.animation_time)
                        ? animationConfig.animation_time
                        : this.game_manager.getAnimationTime() * winLevel;

                    SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                    this.game_manager.bottomUIText.setWinMoney(0);
                    this.game_manager.bottomUIText.playChangeWinMoney(
                        actualJackpot,
                        finalWinMoney,
                        this.winEndProcess.bind(this, winProcessState, finalWinMoney, options),
                        true,
                        animationTime
                    );
                }

                // 更新最大赢奖金额
                SlotManager.Instance.setBiggestWinCoin(finalWinMoney);
            }
        });

        seqState.insert(index++, winProcessState);
        return seqState;
    }
}