
import GameComponents_HundredDollar from './GameComponents_HundredDollar';
import HundredDollarManager from './HundredDollarManager';
import UserInfo from '../../User/UserInfo';
import SubGameStateManager_Base from '../../SubGameStateManager_Base';
import State, { SequencialState } from '../../Slot/State';
import SlotManager from '../../manager/SlotManager';
import { BottomTextType } from '../../SubGame/BottomUIText';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import CameraControl from '../../Slot/CameraControl';
import SlotSoundController from '../../Slot/SlotSoundController';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import GameComponents_Base from '../../game/GameComponents_Base';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';

const { ccclass, property } = cc._decorator;

/**
 * 百元老虎机子游戏状态管理器
 * 负责构建基础游戏/奖励游戏的状态机，统筹动画、音效、相机、UI文本等状态流转
 */
@ccclass()
export default class SubGameStateManager_HundredDollar extends SubGameStateManager_Base {
    // 单例实例
    private static _instance: SubGameStateManager_HundredDollar | null = null;

    /**
     * 获取单例实例（懒加载创建）
     */
    public static Instance(): SubGameStateManager_HundredDollar {
        if (!SubGameStateManager_HundredDollar._instance) {
            SubGameStateManager_HundredDollar._instance = new SubGameStateManager_HundredDollar();
        }
        return SubGameStateManager_HundredDollar._instance;
    }

    /**
     * 构建基础游戏状态机
     * 包含Spin前准备、滚轮旋转、中奖结果展示等完整流程
     */
    getBaseGameState(): SequencialState {
        const rootSeqState = new SequencialState();
        let stateIndex = 0;

        // 1. Spin前准备状态组
        const preSpinSeqState = new SequencialState();
        preSpinSeqState.insert(stateIndex++, SlotManager.Instance.getSetFlagPlayingSubgameState(true));
        preSpinSeqState.insert(stateIndex++, this.getStopSingleLineActionState());
        preSpinSeqState.insert(stateIndex++, this.getStopAllSymbolAniState());
        preSpinSeqState.insert(stateIndex++, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.SpinReel));
        preSpinSeqState.insert(stateIndex++, SlotManager.Instance.bottomUIText.getChangeWinMoneyTextState(0));
        preSpinSeqState.insert(stateIndex++, this.getSetWinTextAtStartSpin());
        preSpinSeqState.insert(stateIndex++, this.getPlaySpinFrameAnimationState());
        preSpinSeqState.insert(stateIndex++, SlotManager.Instance.getReelSpinStartState());
        rootSeqState.insert(0, preSpinSeqState);

        // 2. Spin执行与结果展示状态组
        const spinResultSeqState = new SequencialState();
        spinResultSeqState.addOnStartCallback(() => {
            if (SlotManager.Instance.flagSpinRequest) {
                // 重置状态索引（避免重复累加）
                var innerIndex = stateIndex;
                // 添加滚轮旋转状态
                spinResultSeqState.insert(innerIndex++, SlotManager.Instance.reelMachine.getNormalSpinReelStateRenewal());
                // 停止所有帧动画
                spinResultSeqState.insert(innerIndex++, this.getStopAllFrameAnimationState());
                // 中奖结果前相机向下滚动
                spinResultSeqState.insert(innerIndex++, this.getScrollDownBeforeWinResultState());
                // 显示触发的支付线
                spinResultSeqState.insert(innerIndex++, this.getShowTotalTriggeredPaylineState());

                // 中奖特效子状态机
                const winEffectSeqState = new SequencialState();
                winEffectSeqState.insert(0, this.getStateShowTotalSymbolEffectOnPayLines());
                winEffectSeqState.insert(0, this.getShowWinFrameEffectState());
                winEffectSeqState.insert(1, this.getSingleLineEffectOnPaylineState());
                spinResultSeqState.insert(innerIndex, winEffectSeqState);

                // 底部奖金文本更新
                spinResultSeqState.insert(innerIndex, this.getSetBottomInfoIncreaseWinMoneyState());
                // 奖金结算
                spinResultSeqState.insert(innerIndex++, this.getWinMoneyState());
                // 标记子游戏结束
                spinResultSeqState.insert(innerIndex++, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
                // 奖励游戏启动检查
                spinResultSeqState.insert(innerIndex++, this.getBonusGameStartState());

                // 设置滚轮旋转状态为可跳过
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_SKIPABLE);
            }
        });

        rootSeqState.insert(1, spinResultSeqState);
        return rootSeqState;
    }

    /**
     * 构建奖励游戏状态机
     * 包含相机调整、奖励游戏播放、结算后重置等流程
     */
    getBonusGameState(): SequencialState {
        const bonusGameSeqState = new SequencialState();
        // 标记子游戏开始
        bonusGameSeqState.insert(0, SlotManager.Instance.getSetFlagPlayingSubgameState(true));

        // 1. 奖励游戏初始化状态（相机调整+音效切换）
        const bonusInitState = new State();
        bonusInitState.addOnStartCallback(() => {
            // 禁用输入事件
            SlotManager.Instance.setMouseDragEventFlag(false);
            SlotManager.Instance.setKeyboardEventFlag(false);
            // 清空相机回调
            HundredDollarManager.getInstance().clearCameraMoveCallback();

            // 相机向上滚动动作
            const cameraAction = cc.callFunc(() => {
                const cameraPos = new cc.Vec2(35, 0);
                const cameraSize = new cc.Vec2(704, 720);
                CameraControl.Instance.initCameraControl(cameraPos, cameraSize);
                CameraControl.Instance.scrollUpScreen(0.5);
            });

            // 执行相机动作+播放奖励游戏BGM
            SlotManager.Instance.node.runAction(
                cc.sequence(
                    cameraAction,
                    cc.delayTime(0.5),
                    cc.callFunc(() => {
                        SlotSoundController.Instance().playAudio("BonusGameBGM", "BGM");
                        bonusInitState.setDone();
                    })
                )
            );
        });
        bonusGameSeqState.insert(1, bonusInitState);

        // 2. 奖励游戏核心播放状态
        const gameComponents = SlotManager.Instance.getComponent(GameComponents_HundredDollar);
        if (gameComponents?.bonusGameComponent) {
            const bonusPlayState = gameComponents.bonusGameComponent.playBonusGameState();
            bonusGameSeqState.insert(2, bonusPlayState);
        } else {
            cc.warn("SubGameStateManager: GameComponents_HundredDollar或bonusGameComponent未挂载");
        }

        // 3. 奖励游戏结束后相机重置状态
        const cameraResetState = new State();
        cameraResetState.addOnStartCallback(() => {
            const cameraAction = cc.callFunc(() => {
                const cameraPos = new cc.Vec2(35, 0);
                const cameraSize = new cc.Vec2(704, 720);
                CameraControl.Instance.initCameraControl(cameraPos, cameraSize);
                CameraControl.Instance.scrollDownScreen(0.5);
                // 恢复符号显示
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
            });

            SlotManager.Instance.node.runAction(
                cc.sequence(
                    cameraAction,
                    cc.delayTime(1),
                    cc.callFunc(() => {
                        cameraResetState.setDone();
                    })
                )
            );
        });
        bonusGameSeqState.insert(3, cameraResetState);

        // 4. 奖励游戏结束后重置状态
        const resetState = new State();
        resetState.addOnStartCallback(() => {
            if (gameComponents?.bonusGameComponent) {
                gameComponents.bonusGameComponent.clearCurrentOfferInfo();
                gameComponents.bonusGameComponent.showDefaultAlert();
            }
            // 恢复相机回调和输入事件
            HundredDollarManager.getInstance().initCameraMoveCallback();
            SlotManager.Instance.setMouseDragEventFlag(true);
            SlotManager.Instance.setKeyboardEventFlag(true);
            resetState.setDone();
        });
        bonusGameSeqState.insert(4, SlotManager.Instance.getSetFlagPlayingSubgameState(false));
        bonusGameSeqState.insert(5, this.getBonusGameWinMoneyState());
        bonusGameSeqState.insert(6, SlotManager.Instance.bottomUIText.getBottomInfoState(BottomTextType.CustomData, "WIN"));
        bonusGameSeqState.insert(7, cameraResetState);
        bonusGameSeqState.insert(8, resetState);
        bonusGameSeqState.insert(9, SlotManager.Instance.getShowSpinEndPopup());

        return bonusGameSeqState;
    }

    /**
     * 构建播放Spin帧动画的状态
     */
    getPlaySpinFrameAnimationState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const gameComponents = SlotManager.Instance.getComponent(GameComponents_HundredDollar);
            if (gameComponents?.reelFrameAni) {
                gameComponents.reelFrameAni.playSpinAnimation();
            } else {
                cc.warn("SubGameStateManager: reelFrameAni组件未挂载，无法播放Spin动画");
            }
            state.setDone();
        });
        return state;
    }

    /**
     * 构建停止所有帧动画的状态
     */
    getStopAllFrameAnimationState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const gameComponents = SlotManager.Instance.getComponent(GameComponents_HundredDollar);
            if (gameComponents?.reelFrameAni) {
                gameComponents.reelFrameAni.stopAllAnimation();
            }
            state.setDone();
        });
        return state;
    }

    /**
     * 构建奖励游戏启动状态
     */
    getBonusGameStartState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            if (SlotGameResultManager.Instance.getNextSubGameKey() === "bonusGame") {
                // 停止所有节点动作和单行动画
                SlotManager.Instance.node.stopAllActions();
                this.stopSingleLineAction();
                SymbolAnimationController.Instance.stopAllAnimationSymbol();
                SlotGameResultManager.Instance.winMoneyInJackpotMode = 0;

                // 奖励游戏触发动作
                const triggerAction = cc.callFunc(() => {
                    // 停止滚轮帧动画
                    const gameComponents = SlotManager.Instance.getComponent(GameComponents_HundredDollar);
                    if (gameComponents?.reelFrameAni) {
                        gameComponents.reelFrameAni.stopAllAnimation();
                    }

                    // 播放61号符号动画（奖励触发符号）
                    const visibleWindows = SlotGameResultManager.Instance.getVisibleSlotWindows();
                    for (let t = 0; t < 3; ++t) {
                        if (visibleWindows.GetWindow(t).getSymbol(1) === 61) {
                            SymbolAnimationController.Instance.playAnimationSymbol(t, 1, 61);
                        }
                    }

                    // 播放奖励触发音效
                    SlotSoundController.Instance().playAudio("BonusGameTrigger", "FX");

                    // 更新底部文本为奖励激活
                    if (SlotManager.Instance.bottomUIText.winText) {
                        SlotManager.Instance.bottomUIText.setWinText("BONUS ACTIVATED!");
                    } else {
                        SlotManager.Instance.bottomUIText.setWinMoney(0);
                        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "BONUS ACTIVATED!");
                    }
                });

                // 停止符号动画动作
                const stopSymbolAniAction = cc.callFunc(() => {
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    SlotManager.Instance.reelMachine.setSymbolsDimmActive(false);
                });

                // 执行动作序列
                SlotManager.Instance.node.runAction(
                    cc.sequence(
                        triggerAction,
                        cc.delayTime(2),
                        stopSymbolAniAction,
                        cc.callFunc(() => {
                            state.setDone();
                        })
                    )
                );
            } else {
                // 非奖励游戏直接完成状态
                state.setDone();
            }
        });
        return state;
    }

    /**
     * 构建显示中奖帧特效的状态
     */
    getShowWinFrameEffectState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            const totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();
            if (totalWinMoney > 0) {
                const winSymbolList = SlotGameResultManager.Instance.getTotalWinSymbolList();
                const gameComponents = SlotManager.Instance.getComponent(GameComponents_HundredDollar);
                
                if (gameComponents?.reelFrameAni) {
                    // 61号符号为奖励中奖，否则为普通中奖
                    if (winSymbolList.indexOf(61) === -1) {
                        gameComponents.reelFrameAni.playNormalWinAnimation();
                    } else {
                        gameComponents.reelFrameAni.playBonusWinAnimation();
                    }
                }
            }
            state.setDone();
        });
        return state;
    }

    /**
     * 构建Spin开始时设置中奖文本的状态
     */
    getSetWinTextAtStartSpin(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            SlotManager.Instance.bottomUIText.setWinText(SlotManager.Instance.getReelSpinStartText());
            state.setDone();
        });
        return state;
    }

    /**
     * 构建奖励游戏奖金结算状态
     */
    getBonusGameWinMoneyState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            // 获取总中奖金额
            SlotGameResultManager.Instance.getSpinResult().payOutResults;
            const totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();
            
            // 获取基础组件的大额中奖特效
            const baseGameComponents = SlotManager.Instance.getComponent(GameComponents_Base);
            const bigWinEffect = baseGameComponents?.effectBigWinNew;

            // 奖金结算完成回调
            const completeWinProcess = () => {
                SlotManager.Instance.bottomUIText.showWinEffect(false);
                SlotManager.Instance.setMouseDragEventFlag(true);
                SlotManager.Instance.applyGameResultMoney(totalWinMoney);
                state.setDone();
            };

            // 显示中奖特效
            SlotManager.Instance.bottomUIText.showWinEffect(true);

            // 无奖金直接完成
            if (totalWinMoney <= 0) {
                completeWinProcess();
                return;
            }

            const totalWin = 0 + totalWinMoney;
            const winType = SlotGameResultManager.Instance.getWinType();

            // 非普通中奖类型（大额/超级/巨型中奖）
            if (winType !== SlotGameResultManager.WINSTATE_NORMAL) {
                SlotManager.Instance.bottomUIText.setWinMoney(0);
                const winAmount = SlotGameResultManager.Instance.getTotalWinMoney();
                const totalBet = SlotGameRuleManager.Instance.getTotalBet();

                // 播放大额中奖特效
                const playBigWinEffect = cc.callFunc(() => {
                    if (bigWinEffect) {
                        bigWinEffect.playWinEffect(winAmount, totalBet, completeWinProcess, () => {
                            this.playIncrementEndCoinSound();
                        });
                    }
                    SlotManager.Instance.bottomUIText.setWinMoney(totalWin);
                });

                SlotManager.Instance.node.runAction(playBigWinEffect);
            } else {
                // 普通中奖直接更新奖金文本
                SlotManager.Instance.bottomUIText.setWinMoney(totalWin);
                // 更新用户最大中奖金额
                UserInfo.instance().setBiggestWinCoin(totalWinMoney);
                completeWinProcess();
            }
        });

        // 状态结束时播放硬币结算音效
        state.addOnEndCallback(() => {
            this.playIncrementEndCoinSound();
        });

        return state;
    }
}