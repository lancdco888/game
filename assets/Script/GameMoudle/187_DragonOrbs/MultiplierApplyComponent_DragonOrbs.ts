const { ccclass, property } = cc._decorator;


import SlotSoundController from '../../Slot/SlotSoundController';
import State from '../../Slot/State';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotManager from '../../manager/SlotManager';
import GameComponents_DragonOrbs from './GameComponents_DragonOrbs';
import JackpotSymbol_DragonOrbs from './JackpotSymbol_DragonOrbs';
import Symbol from '../../Slot/Symbol';
import Reel from '../../Slot/Reel';


// ===================== 龙珠游戏倍数应用组件 =====================
/**
 * 龙珠游戏倍数应用组件
 * 管理免费旋转模式切换、倍数应用状态、倍数动画/音效播放、符号倍数更新等核心逻辑
 */
@ccclass()
export default class MultiplierApplyComponent_DragonOrbs extends cc.Component {
    // ===================== 序列化属性（与原JS一致） =====================
    /** 免费旋转模式节点列表（0:red 1:blue 2:green） */
    @property([cc.Node])
    public modes: cc.Node[] = [];

    // ===================== 私有状态（与原JS一致） =====================
    /** 当前激活的模式节点 */
    private _currentModeNode:cc.Node | null = null;

    // ===================== 核心业务方法（与原JS逻辑1:1） =====================
    /**
     * 设置当前免费旋转模式
     * @param mode 模式标识（freeSpin_red/freeSpin_blue/freeSpin_green）
     */
    public setCurrentMode(mode: string): void {
        // 重置所有模式节点显隐状态
        this.modes.forEach(node => {
            if (TSUtility.isValid(node)) node.active = false;
        });

        // 根据模式标识激活对应节点
        if (mode === "freeSpin_red") {
            this.modes[0].active = true;
            this._currentModeNode = this.modes[0];
        } else if (mode === "freeSpin_blue") {
            this.modes[1].active = true;
            this._currentModeNode = this.modes[1];
        } else if (mode === "freeSpin_green") {
            this.modes[2].active = true;
            this._currentModeNode = this.modes[2];
        }
    }

    /**
     * 获取倍数应用状态（返回State对象，包含倍数应用的完整逻辑）
     * @param currentGameMode 当前游戏模式
     * @param prevGameMode 上一游戏模式
     * @param multiplierState 倍数状态数据
     * @returns 状态对象
     */
    public getApplyMultiplierState(
        currentGameMode: string,
        prevGameMode: string,
        multiplierState: any
    ): State {
        const self = this;
        const state = new State();

        // 添加状态开始回调（核心倍数应用逻辑）
        state.addOnStartCallback(() => {
            // 仅当当前模式非base、上一模式为base时执行倍数应用逻辑
            if (currentGameMode !== "base" && prevGameMode === "base") {
                // 设置当前免费旋转模式
                self.setCurrentMode(currentGameMode);
                
                // 激活组件节点并播放倍数触发动画
                self.node.active = true;
                const aniComp = self.node.getComponent(cc.Animation);
                if (TSUtility.isValid(aniComp)) {
                    aniComp.play("Multi_Trigger_Ani", 0);
                }

                // 更新当前模式节点的倍数文本（X倍）
                if (TSUtility.isValid(self._currentModeNode)) {
                    const labelComp = self._currentModeNode.getComponentInChildren(cc.Label);
                    if (TSUtility.isValid(labelComp)) {
                        labelComp.string = `${multiplierState.gauges.spinMultiplier}x`;
                    }
                }

                // 停止所有符号动画+设置卷轴符号变暗
                SymbolAnimationController.Instance.stopAllAnimationSymbol();
                SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);

                // 播放倍数应用音效
                SlotSoundController.Instance().playAudio("ApplyMultiplier", "FX");

                // 存储需要恢复的符号节点
                const symbolNodesToRecover: cc.Node[] = [];

                // 获取历史窗口数据
                const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows() as any;
                // 隐藏锁符号层
                var gameComponents = SlotManager.Instance.getComponent(GameComponents_DragonOrbs) as any;
                
                // 1.5秒后执行符号倍数更新逻辑
                self.scheduleOnce(() => {
         
                    if (TSUtility.isValid(gameComponents) && TSUtility.isValid(gameComponents.lockSymbolLayer)) {
                        gameComponents.lockSymbolLayer.node.opacity = 0;
                    }

                    // 遍历所有卷轴更新符号倍数
                    for (let reelIdx = 0; reelIdx < lastHistoryWindows.size; ++reelIdx) {
                        // 获取卷轴组件和对应窗口数据
                        const reelComp = SlotManager.Instance.reelMachine.reels[reelIdx].getComponent(Reel);
                        const windowData = lastHistoryWindows.GetWindow(reelIdx);
                        if (!TSUtility.isValid(reelComp) || !windowData) continue;

                        // 遍历每行符号
                        const updateSymbol = (rowIndex: number) => {
                            // 获取符号值并修正
                            let symbolValue = windowData.getSymbol(rowIndex);
                            if (symbolValue > 100) symbolValue -= 100;
                            if (symbolValue > 91 && symbolValue % 2 === 1) symbolValue -= 1;

                            // 符号值>91时更新倍数
                            if (symbolValue > 91) {
                                // 获取符号信息
                                const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[reelIdx][rowIndex] as any;
                                // 更换卷轴符号
                                reelComp.changeSymbol(rowIndex, symbolValue, symbolInfo);
                                
                                // 获取符号节点并应用倍数
                                const symbolNode = reelComp.getSymbol(rowIndex);
                                const jackpotSymbolComp = symbolNode.getComponent(JackpotSymbol_DragonOrbs);
                                if (TSUtility.isValid(jackpotSymbolComp)) {
                                    jackpotSymbolComp.applyMultiplier(symbolInfo);
                                    reelComp.hideSymbolInRow(rowIndex);
                                    symbolNodesToRecover.push(symbolNode);

                                    // 播放符号倍数动画
                                    const aniSymbol = SymbolAnimationController.Instance.playAnimationSymbolAbsoluteCoordinate(
                                        reelIdx,
                                        rowIndex,
                                        symbolValue + 600
                                    );
                                    if (TSUtility.isValid(aniSymbol)) {
                                        const aniSymbolComp = aniSymbol.getComponent(JackpotSymbol_DragonOrbs);
                                        if (TSUtility.isValid(aniSymbolComp)) {
                                            aniSymbolComp.setSymbol(symbolInfo);
                                            // 0.5秒后应用倍数到锁符号层
                                            self.scheduleOnce(() => {
                                                aniSymbolComp.applyMultiplier(symbolInfo);
                                                if (TSUtility.isValid(gameComponents) && TSUtility.isValid(gameComponents.lockSymbolLayer)) {
                                                    gameComponents.lockSymbolLayer.applyMultiplier(reelIdx, rowIndex, symbolInfo);
                                                }
                                            }, 0.5);
                                        }
                                    }
                                }
                            }
                        };

                        // 遍历3行符号
                        for (let rowIdx = 0; rowIdx < 3; ++rowIdx) {
                            updateSymbol(rowIdx);
                        }
                    }
                }, 1.5);

                // 监听倍数动画完成事件
                if (TSUtility.isValid(aniComp)) {
                    aniComp.once("finished", () => {
                        // 停止所有符号动画+重置卷轴符号变暗状态
                        SymbolAnimationController.Instance.stopAllAnimationSymbol();
                        SlotManager.Instance.reelMachine.setSymbolsDimmActive(true);
                        self.node.active = false;

                        // 恢复符号节点的变暗状态
                        symbolNodesToRecover.forEach(node => {
                            const symbolComp = node.getComponent(Symbol);
                            if (TSUtility.isValid(symbolComp)) {
                                symbolComp.setDimmActive(false);
                            }
                        });

                        // 重置所有卷轴符号的层级
                        SlotManager.Instance.reelMachine.reels.forEach(reelNode => {
                            const reelComp = reelNode.getComponent(Reel);
                            if (TSUtility.isValid(reelComp)) {
                                reelComp.resetAllSiblingIndex();
                            }
                        });

                        // 恢复锁符号层透明度
                        if (TSUtility.isValid(gameComponents) && TSUtility.isValid(gameComponents.lockSymbolLayer)) {
                            gameComponents.lockSymbolLayer.node.opacity = 255;
                        }

                        // 标记状态完成
                        state.setDone();
                    });
                }
            } else {
                // 非base模式切换场景，直接标记状态完成
                state.setDone();
            }
        });

        return state;
    }
}