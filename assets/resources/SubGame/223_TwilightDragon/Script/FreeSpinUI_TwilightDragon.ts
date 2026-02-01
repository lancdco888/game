const { ccclass, property } = cc._decorator;


import SlotSoundController from "../../../../Script/Slot/SlotSoundController";
import State, { SequencialState } from "../../../../Script/Slot/State";
import SlotGameResultManager from "../../../../Script/manager/SlotGameResultManager";
import SlotManager from "../../../../Script/manager/SlotManager";
import LevelUpPopup_TwilightDragon from "./LevelUpPopup_TwilightDragon";
import MegaJackpotResultPopup_TwilightDragon from "./MegaJackpotResultPopup_TwilightDragon";


// 定义接口：规范头奖结果结构（解决原始JS隐式类型问题）
interface JackpotResult {
    jackpotSubID: number;
    jackpotSubKey?: string;
    winningCoin: number;
}

// 定义接口：规范免费旋转子游戏状态结构
interface FreeSpinSubGameState {
    getGaugesValue(key: string): number;
}

/**
 * 暮光龙免费旋转UI组件
 * 负责管理免费旋转的等级、倍率、特效及相关弹窗控制
 */
@ccclass("FreeSpinUI_TwilightDragon")
export default class FreeSpinUI_TwilightDragon extends cc.Component {
    // 核心动画与节点属性（对应原始JS，供编辑器序列化）
    @property(cc.Animation)
    rootAnimation: cc.Animation = null!;

    @property([cc.Node])
    cellNodes: cc.Node[] = [];

    @property([cc.Node])
    normalOffCellNodes: cc.Node[] = [];

    @property([cc.Node])
    goldOffCellNodes: cc.Node[] = [];

    @property([cc.Node])
    multiplierNodes: cc.Node[] = [];

    @property(cc.Node)
    machineInfoRoot: cc.Node = null!;

    @property([cc.Node])
    machineInfoMultipliers: cc.Node[] = [];

    @property(cc.Node)
    machineFx: cc.Node = null!;

    @property(cc.Node)
    megaFx: cc.Node = null!;

    @property(cc.Animation)
    topUI: cc.Animation = null!;

    @property(LevelUpPopup_TwilightDragon)
    levelUpPopup: LevelUpPopup_TwilightDragon = null!;

    @property(MegaJackpotResultPopup_TwilightDragon)
    megaJackpotResult: MegaJackpotResultPopup_TwilightDragon = null!;

    @property(cc.Animation)
    multiplierMove: cc.Animation = null!;

    @property(cc.Node)
    goldBG: cc.Node = null!;

    @property(cc.Node)
    normalBG: cc.Node = null!;

    @property(cc.Node)
    lightningFx: cc.Node = null!;

    // 私有状态变量（对应原始JS的下划线开头变量，保持状态一致性）
    private _currentCount: number = 0;
    private _currentLevel: number = 0;
    private _currentMultiplier: number = 0;

    /**
     * 播放轨道闲置特效（循环调度随机时长）
     */
    playIdleFx(): void {
        // 遍历激活的cell节点，播放闲置动画
        this.cellNodes.forEach((cellNode) => {
            if (cellNode.active) {
                const cellAnimation = cellNode.parent?.getComponent(cc.Animation);
                if (cellAnimation) { // TS安全校验：避免组件不存在
                    cellAnimation.play("Gauge_Idle");
                }
            }
        });

        // 随机10秒内重新调度，实现循环闲置特效
        const randomDelay = 10 * Math.random();
        this.scheduleOnce(() => {
            this.playIdleFx();
        }, randomDelay);
    }

    /**
     * 播放奖励闲置特效（顶部UI循环闲置动画）
     */
    playRewardFx(): void {
        this.topUI.play("BonusUI_Top_Idle");

        // 随机10秒内重新调度，实现循环
        const randomDelay = 10 * Math.random();
        this.scheduleOnce(() => {
            this.playRewardFx();
        }, randomDelay);
    }

    /**
     * 初始化等级信息（从游戏结果管理器获取状态，更新UI显示）
     */
    initLevelInfo(): void {
        this.removeOrb();

        // 获取免费旋转子游戏状态
        const freeSpinState = SlotGameResultManager.Instance.getSubGameState("freeSpin") as FreeSpinSubGameState;
        if (!freeSpinState) { // TS安全校验：避免状态不存在
            console.warn("无法获取免费旋转子游戏状态");
            return;
        }

        // 更新私有状态变量
        this._currentLevel = freeSpinState.getGaugesValue("level");
        this._currentMultiplier = freeSpinState.getGaugesValue("multiplier");
        this._currentCount = freeSpinState.getGaugesValue("bonus");
        if (this._currentLevel > 0) {
            this._currentLevel -= 1;
        }

        // 更新倍率节点显示
        this.multiplierNodes.forEach((node, index) => {
            node.active = index === this._currentLevel;
        });

        // 更新机器信息倍率显示
        if (this._currentMultiplier > 1) {
            this.machineInfoMultipliers.forEach((node, index) => {
                node.active = index === this._currentMultiplier - 2;
            });
        } else {
            this._currentMultiplier = 1;
            this.machineInfoMultipliers.forEach((node) => {
                node.active = false;
            });
        }

        // 更新背景与Cell节点样式（普通/黄金模式）
        const isGoldMode = this._currentLevel >= 2;
        this.normalBG.active = !isGoldMode;
        this.goldBG.active = isGoldMode;

        for (let i = 0; i < this.normalOffCellNodes.length; i++) {
            this.normalOffCellNodes[i].active = !isGoldMode;
            this.goldOffCellNodes[i].active = isGoldMode;
        }
    }

    /**
     * 添加轨道光球（更新光球数量，播放激活动画）
     * @param count 光球总数
     * @param isForceSet 是否强制设置数量
     * @param callback 完成后的回调函数
     */
    addOrb(count: number, isForceSet: number, callback?: () => void): void {
        // 强制设置光球数量
        if (isForceSet === 1) {
            this.cellNodes.forEach((node) => {
                node.active = false;
            });
            this._currentCount = count;
        }

        // 光球数量不超过9个（原始逻辑限制）
        if (this._currentCount < 9) {
            // 非强制设置时，光球数量+1
            if (isForceSet === 0) {
                this._currentCount++;
            }

            // 取消所有现有调度，重新规划闲置特效
            this.unscheduleAllCallbacks();
            this.scheduleOnce(() => {
                this.playIdleFx();
                this.playRewardFx();
            }, 2);

            // 激活对应数量的光球，播放激活动画
            for (let i = 0; i < this._currentCount; i++) {
                const cellNode = this.cellNodes[i];
                if (!cellNode.active) {
                    cellNode.active = true;
                    const cellAnimation = cellNode.parent?.getComponent(cc.Animation);
                    if (cellAnimation) { // TS安全校验：避免组件不存在
                        cellAnimation.play("Gauge_On");
                    }
                }
            }
        }

        // 执行回调函数（延迟0.2秒，对应原始逻辑）
        if (callback) {
            this.scheduleOnce(() => {
                callback();
            }, 0.2);
        }
    }

    /**
     * 移除所有光球（隐藏光球，重置数量，取消所有调度）
     */
    removeOrb(): void {
        this.unscheduleAllCallbacks();
        this.cellNodes.forEach((node) => {
            node.active = false;
        });
        this._currentCount = 0;
    }

    /**
     * 获取满光球特效状态（等级提升、头奖展示的顺序状态）
     * @param megaCallback mega头奖回调
     * @param finishCallback 整体完成回调
     * @returns 顺序状态对象
     */
    getPlayFullOrbFxState(megaCallback: () => void, finishCallback: () => void): SequencialState {
        const orbFxState = new SequencialState();

        // 状态开始回调（核心逻辑：等级提升、头奖处理）
        orbFxState.addOnStartCallback(() => {
            // 获取游戏状态与头奖结果
            const freeSpinState = SlotGameResultManager.Instance.getSubGameState("freeSpin") as FreeSpinSubGameState;
            const spinResult = SlotGameResultManager.Instance.getSpinResult();
            const jackpotResults = (spinResult?.jackpotResults || []) as JackpotResult[];
            if (!freeSpinState || !jackpotResults) return;

            const currentLevel = freeSpinState.getGaugesValue("level");
            const isMegaJackpot = jackpotResults.some((result) => result.jackpotSubID === 3);

            // 满足等级提升或Mega头奖条件时，执行后续逻辑
            if ((currentLevel > 1 && currentLevel > this._currentLevel + 1) || isMegaJackpot) {
                this.unscheduleAllCallbacks();
                this._currentCount = 0;
                this._currentLevel++;
                this._currentMultiplier = freeSpinState.getGaugesValue("multiplier");

                // 1. 等级提升动画状态
                const levelUpAnimState = new State();
                levelUpAnimState.addOnStartCallback(() => {
                    const animName = this._currentLevel >= 3 ? "BonusUI_Upgrade1_Mega" : "BonusUI_Upgrade1";

                    // 播放对应音效
                    if (this._currentLevel >= 3) {
                        SlotSoundController.Instance().playAudio("UpgradeMega", "FX");
                        // Mega头奖闪电特效
                        this.scheduleOnce(() => {
                            this.lightningFx.active = true;
                            this.scheduleOnce(() => {
                                this.lightningFx.active = false;
                            }, 3.68);
                            megaCallback();
                        }, 3.5);
                    } else {
                        SlotSoundController.Instance().playAudio("UpgradeNormal", "FX");
                    }

                    // 播放动画并监听完成
                    this.rootAnimation.play(animName);
                    this.rootAnimation.once(cc.Animation.EventType.FINISHED, () => {
                        const delay = isMegaJackpot ? 1 : 0.5;
                        this.scheduleOnce(() => {
                            levelUpAnimState.setDone();
                        }, delay);
                    });
                });
                orbFxState.insert(0, levelUpAnimState);

                // 2. Mega头奖弹窗状态
                const megaJackpotPopupState = new State();
                megaJackpotPopupState.addOnStartCallback(() => {
                    const megaJackpotResult = jackpotResults.find((result) => result.jackpotSubKey === "mega");
                    if (megaJackpotResult) {
                        this.scheduleOnce(() => {
                            SlotManager.Instance.bottomUIText.setWinMoney(megaJackpotResult.winningCoin, "MEGA JACKPOT");
                            this.megaJackpotResult.open(
                                megaJackpotResult.winningCoin,
                                megaJackpotResult.jackpotSubKey!,
                                megaJackpotResult.jackpotSubID,
                                0,
                                1,
                                () => {
                                    finishCallback();
                                    this.scheduleOnce(() => {
                                        megaJackpotPopupState.setDone();
                                    }, 0.5);
                                }
                            );
                        }, 0.5);
                    } else {
                        megaJackpotPopupState.setDone();
                    }
                });
                orbFxState.insert(1, megaJackpotPopupState);

                // 3. 等级提升弹窗状态
                const levelUpPopupState = new State();
                levelUpPopupState.addOnStartCallback(() => {
                    SlotSoundController.Instance().playAudio("LevelUpPopup", "FX");
                    this.levelUpPopup.open(this._currentLevel, () => {
                        this.scheduleOnce(() => {
                            levelUpPopupState.setDone();
                        }, 0.5);
                    });
                });
                orbFxState.insert(2, levelUpPopupState);

                // 4. 倍率更新动画状态
                const multiplierUpdateState = new State();
                multiplierUpdateState.addOnStartCallback(() => {
                    const animName = this._currentLevel === 2 ? "BonusUI_Upgrade2_3X" : 
                                      this._currentLevel > 2 ? "BonusUI_Upgrade2_Mega" : "BonusUI_Upgrade2";

                    this.rootAnimation.play(animName);

                    // 延迟播放等级提升UI音效
                    this.scheduleOnce(() => {
                        SlotSoundController.Instance().playAudio("LevelUpUI", "FX");
                    }, 0.2);

                    // 非Mega头奖时，更新倍率UI
                    if (!isMegaJackpot) {
                        this.scheduleOnce(() => {
                            // 重置并显示当前等级倍率节点
                            this.multiplierNodes.forEach((node, index) => {
                                node.active = index === this._currentLevel;
                            });

                            // 切换黄金模式（等级2及以上）
                            if (this._currentLevel === 2) {
                                for (let i = 0; i < this.normalOffCellNodes.length; i++) {
                                    this.normalOffCellNodes[i].active = false;
                                    this.goldOffCellNodes[i].active = true;
                                }
                            }

                            // 更新机器信息倍率
                            const multiplierIndex = this._currentMultiplier - 2;
                            this.machineInfoMultipliers.forEach((node, index) => {
                                node.active = index === multiplierIndex;
                            });

                            // 播放机器信息升级动画
                            const machineRootAnim = this.machineInfoRoot.getChildByName("Root")?.getComponent(cc.Animation);
                            if (machineRootAnim) {
                                machineRootAnim.play("MultiUI_Upgrade");
                            }
                        }, 0.5);
                    }

                    // 监听动画完成，标记状态结束
                    this.rootAnimation.once(cc.Animation.EventType.FINISHED, () => {
                        this.scheduleOnce(() => {
                            multiplierUpdateState.setDone();
                        }, 0.5);
                    });
                });
                orbFxState.insert(3, multiplierUpdateState);
            }
        });

        // 状态结束回调（恢复闲置特效）
        orbFxState.addOnEndCallback(() => {
            this.unscheduleAllCallbacks();
            this.scheduleOnce(() => {
                this.playIdleFx();
                this.playRewardFx();
            }, 2);
        });

        return orbFxState;
    }

    /**
     * 应用倍率（播放倍率移动动画，播放对应音效）
     */
    applyMultiplier(): void {
        // 确定动画名与音效名
        const [animName, audioName] = this._currentMultiplier >= 3 
            ? ["Multi_Move_3X", "Apply3XMultiplier"] 
            : ["Multi_Move_2X", "Apply2XMultiplier"];

        // 播放倍率动画
        this.multiplierMove.node.active = true;
        this.multiplierMove.play(animName);
        SlotSoundController.Instance().playAudio(audioName, "FX");

        // 动画完成后隐藏节点
        this.multiplierMove.once(cc.Animation.EventType.FINISHED, () => {
            this.multiplierMove.node.active = false;
        });
    }
}