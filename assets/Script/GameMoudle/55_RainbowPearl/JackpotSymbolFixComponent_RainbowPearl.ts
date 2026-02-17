// 依赖模块导入
import JackpotSymbol_RainbowPearl from './JackpotSymbol_RainbowPearl';

import MovingLightComponent_RainbowPearl from './MovingLightComponent_RainbowPearl';
import GameComponents_RainbowPearl from './GameComponents_RainbowPearl';
import ReelMachine_RainbowPearl from './ReelMachine_RainbowPearl';
import SubGameStateManager_RainbowPearl from './SubGameStateManager_RainbowPearl';
import SlotManager from '../../manager/SlotManager';
import SlotSoundController from '../../Slot/SlotSoundController';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import SymbolPoolManager from '../../manager/SymbolPoolManager';
import Symbol from '../../Slot/Symbol';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';

const { ccclass, property } = cc._decorator;

/**
 * Jackpot符号信息类型（适配原逻辑中的symbolInfo）
 */
interface JackpotSymbolInfo {
    type: string;
    key?: string;
    prize: number;
}

/**
 * 结果数据类型（适配原逻辑中的lockNRoll/jackpot结果）
 */
interface ResultData {
    lockNRollResults: Array<{
        winningCellX: number;
        winningCellY: number;
        winningCoin: number;
    }>;
    jackpotResults: Array<{
        winningCoin: number;
    }>;
}

/**
 * RainbowPearl Jackpot符号固定组件
 * 核心功能：固定Jackpot符号、播放特效、更新奖池金额、重置符号图层、处理结果动画
 */
@ccclass('JackpotSymbolFixComponent_RainbowPearl')
export default class JackpotSymbolFixComponent_RainbowPearl extends cc.Component {
    //#region 组件引用
    /** 移动光效组件 */
    @property({ type: MovingLightComponent_RainbowPearl })
    public moveLightComponent: MovingLightComponent_RainbowPearl | null = null;
    //#endregion

    //#region 私有状态
    /** 固定的Jackpot符号对象（5列×3行） */
    private fixJackpotSymbolObject: (JackpotSymbol_RainbowPearl | null)[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];

    /** 固定的Jackpot符号索引信息（5列，存储每行索引） */
    private fixJackpotSymbolInfo: number[][] = [[], [], [], [], []];
    //#endregion

    /**
     * 固定Jackpot窗口（带特效/音效）
     * @param windows 窗口数据
     * @param symbolInfos 符号信息数组（5×3）
     * @param callback 完成回调
     */
    public fixJackpotWindow(
        windows: { size: number; GetWindow: (index: number) => { size: number; getSymbol: (idx: number) => number } },
        symbolInfos: (JackpotSymbolInfo | null)[][],
        callback?: () => void
    ): void {
        if (!windows || !symbolInfos || symbolInfos.length === 0) {
            callback && callback();
            return;
        }

        let hasJackpotSymbol = false; // 是否有Jackpot符号（90/91）
        let hasMultiSymbol = false;   // 是否有倍数符号（92/93）

        // 第一步：处理Jackpot符号（90/91）
        for (let col = 0; col < windows.size; col++) {
            const window = windows.GetWindow(col);
            for (let row = 0; row < window.size; row++) {
                const symbolId = window.getSymbol(row);
                // 匹配Jackpot符号（90/91）且固定成功
                if ((symbolId === 90 || symbolId === 91) && this.fixJackpotSymbol(col, row, symbolId, symbolInfos[col][row])) {
                    hasJackpotSymbol = true;
                    // 播放顶部移动光效
                    this.moveLightComponent?.playMoveLightWithTop(col, row, 90);
                    // 隐藏滚轮Jackpot符号节点
                    const reelMachine = SlotManager.Instance.reelMachine?.getComponent(ReelMachine_RainbowPearl);
                    reelMachine?.jackpotReels[3 * col + row]?.node && (reelMachine.jackpotReels[3 * col + row].node.active = false);
                }
            }
        }

        // 基础延迟：有Jackpot符号则加2秒（动画时长）
        let baseDelay = hasJackpotSymbol ? 2 : 0;
        if (hasJackpotSymbol) {
            // 播放彩虹奖池动画
            const gameComp = SlotManager.Instance.getComponent(GameComponents_RainbowPearl);
            gameComp?.linkedJackpotUI?.playRainbowPotAni();
            // 播放奖金保存音效
            SlotSoundController.Instance().playAudio("FreespinCoinSave", "FX");
        }

        // 第二步：处理倍数符号（92/93）
        const handleMultiSymbol = (col: number) => {
            const window = windows.GetWindow(col);
            const processRow = (row: number) => {
                const symbolId = window.getSymbol(row);
                // 匹配倍数符号（92/93）且未被固定过
                if ((symbolId === 92 || symbolId === 93) && this.fixJackpotSymbolInfo[col].indexOf(row) === -1) {
                    hasMultiSymbol = true;
                    // 显示滚轮Jackpot符号节点
                    const reelMachine = SlotManager.Instance.reelMachine?.getComponent(ReelMachine_RainbowPearl);
                    reelMachine?.jackpotReels[3 * col + row]?.node && (reelMachine.jackpotReels[3 * col + row].node.active = true);

                    // 播放倍数符号动画流程
                    this.node.runAction(cc.sequence(
                        cc.delayTime(baseDelay),
                        cc.callFunc(() => {
                            const prize = symbolInfos[col][row]?.prize || 0;
                            // 播放顶部移动光效（带奖金）
                            this.moveLightComponent?.playMoveLightWithTop(col, row, 92, prize);
                            // 隐藏滚轮Jackpot符号节点
                            reelMachine?.jackpotReels[3 * col + row]?.node && (reelMachine.jackpotReels[3 * col + row].node.active = false);
                        }),
                        cc.delayTime(1.8),
                        cc.callFunc(() => {
                            // 固定符号为99（最终状态），停止所有符号动画
                            this.fixJackpotSymbol(col, row, 99, symbolInfos[col][row]);
                            SymbolAnimationController.Instance.stopAllAnimationSymbol();
                            // 隐藏滚轮Jackpot符号节点
                            reelMachine?.jackpotReels[3 * col + row]?.node && (reelMachine.jackpotReels[3 * col + row].node.active = false);
                        })
                    ));
                }
            };

            // 遍历当前列所有行
            for (let row = 0; row < window.size; row++) {
                processRow(row);
            }
        };

        // 遍历所有列处理倍数符号
        for (let col = 0; col < windows.size; col++) {
            handleMultiSymbol(col);
        }

        // 第三步：更新奖池金额，执行回调
        this.scheduleOnce(() => {
            this.moveLightComponent?.clearAllAnis();
            // 计算并设置奖池金额
            this.updateJackpotPrizeAmount();
        }, baseDelay);

        // 总延迟：Jackpot(2s) + 倍数(2s)
        const totalDelay = baseDelay + (hasMultiSymbol ? 2 : 0);
        if (hasJackpotSymbol || hasMultiSymbol) {
            this.scheduleOnce(() => {
                this.moveLightComponent?.clearAllAnis();
                // 隐藏彩虹奖池动画
                const gameComp = SlotManager.Instance.getComponent(GameComponents_RainbowPearl);
                gameComp?.linkedJackpotUI?.hideRainbowPotAni();
                // 检查剩余Linked Jackpot次数
                SubGameStateManager_RainbowPearl.Instance().checkRemainLinkedJackpotCount();
                callback && callback();
            }, totalDelay);
        } else {
            callback && callback();
        }
    }

    /**
     * 固定Jackpot窗口（无特效版本）
     * @param windows 窗口数据
     * @param symbolInfos 符号信息数组（5×3）
     */
    public fixJackpotWindowNoneEffect(
        windows: { size: number; GetWindow: (index: number) => { size: number; getSymbol: (idx: number) => number } },
        symbolInfos: (JackpotSymbolInfo | null)[][]
    ): void {
        if (!windows || !symbolInfos || symbolInfos.length === 0) return;

        // 处理Jackpot符号（90/91）
        for (let col = 0; col < windows.size; col++) {
            const window = windows.GetWindow(col);
            for (let row = 0; row < window.size; row++) {
                const symbolId = window.getSymbol(row);
                if ((symbolId === 90 || symbolId === 91) && this.fixJackpotSymbol(col, row, symbolId, symbolInfos[col][row])) {
                    const reelMachine = SlotManager.Instance.reelMachine?.getComponent(ReelMachine_RainbowPearl);
                    reelMachine?.jackpotReels[3 * col + row]?.node && (reelMachine.jackpotReels[3 * col + row].node.active = false);
                }
            }
        }

        // 处理倍数符号（92/93）
        for (let col = 0; col < windows.size; col++) {
            const window = windows.GetWindow(col);
            for (let row = 0; row < window.size; row++) {
                const symbolId = window.getSymbol(row);
                if ((symbolId === 92 || symbolId === 93) && this.fixJackpotSymbolInfo[col].indexOf(row) === -1) {
                    this.fixJackpotSymbol(col, row, 99, symbolInfos[col][row]);
                    SymbolAnimationController.Instance.stopAllAnimationSymbol();
                    const reelMachine = SlotManager.Instance.reelMachine?.getComponent(ReelMachine_RainbowPearl);
                    reelMachine?.jackpotReels[3 * col + row]?.node && (reelMachine.jackpotReels[3 * col + row].node.active = false);
                }
            }
        }

        // 更新奖池金额
        this.updateJackpotPrizeAmount(true);
    }

    /**
     * 固定单个Jackpot符号（从符号池获取、设置位置/信息）
     * @param col 列索引（0-4）
     * @param row 行索引（0-2）
     * @param symbolId 符号ID
     * @param symbolInfo 符号信息
     * @returns 是否固定成功
     */
    public fixJackpotSymbol(
        col: number,
        row: number,
        symbolId: number,
        symbolInfo: JackpotSymbolInfo | null
    ): boolean {
        // 校验条件：未固定过 + 符号信息有效
        if (this.fixJackpotSymbolInfo[col].indexOf(row) !== -1 || !symbolInfo || !symbolInfo.type) {
            return false;
        }

        // 从符号池获取符号节点
        const symbolNode = SymbolPoolManager.instance.getSymbol(symbolId);
        if (!symbolNode) return false;

        // 设置符号位置（5列×3行布局）
        symbolNode.setPosition(new cc.Vec2(186 * col - 372, 157 - 157 * row));
        this.node.addChild(symbolNode);

        // 解析符号类型，设置中心信息
        let typeIdx = 0;
        let prize = 0;
        switch (symbolInfo.type) {
            case "jackpot":
                switch (symbolInfo.key) {
                    case "mini": typeIdx = 1; break;
                    case "minor": typeIdx = 2; break;
                    case "major": typeIdx = 3; break;
                    default: typeIdx = 1; break;
                }
                break;
            case "multiplier":
                typeIdx = 0;
                prize = symbolInfo.prize;
                break;
            default:
                typeIdx = 5;
                prize = symbolInfo.prize;
                break;
        }

        // 设置Jackpot符号中心信息
        const jackpotSymbol = symbolNode.getComponent(JackpotSymbol_RainbowPearl);
        if (jackpotSymbol) {
            jackpotSymbol.setCenterInfoRainbowPearl(typeIdx, prize);
            // 记录固定信息
            this.fixJackpotSymbolInfo[col].push(row);
            this.fixJackpotSymbolObject[col][row] = jackpotSymbol;
            return true;
        }

        return false;
    }

    /**
     * 重置符号图层（释放符号池、清空固定信息）
     */
    public resetLayer(): void {
        // 释放所有子节点到符号池
        while (this.node.childrenCount > 0) {
            const childNode = this.node.children[0];
            const symbolComp = childNode.getComponent(Symbol);
            if (symbolComp) {
                SymbolPoolManager.instance.releaseSymbol(symbolComp);
            } else {
                childNode.destroy(); // 兜底：无Symbol组件则直接销毁
            }
        }

        // 清空固定信息
        for (let col = 0; col < 5; col++) {
            this.fixJackpotSymbolInfo[col] = [];
            for (let row = 0; row < 3; row++) {
                this.fixJackpotSymbolObject[col][row] = null;
            }
        }
    }

    /**
     * 修改符号为「获取结果后」的状态（变暗）
     * @param col 列索引（0-4）
     * @param row 行索引（0-2）
     */
    public changeSymbolToAfterGetResultState(col: number, row: number): void {
        this.fixJackpotSymbolObject[col][row]?.setDimmContents(true);
    }

    /**
     * 设置符号分数
     * @param col 列索引（0-4）
     * @param row 行索引（0-2）
     * @param score 分数
     */
    public setSymbolScore(col: number, row: number, score: number): void {
        this.fixJackpotSymbolObject[col][row]?.setCenterInfoRainbowPearl(0, score);
    }

    /**
     * 播放所有Jackpot符号特效
     * @param callback 完成回调
     */
    public playAllJackpotSymbolEffect(callback: () => void): void {
        this.scheduleOnce(() => {
            // 显示所有固定的Jackpot符号
            for (let col = 0; col < 5; col++) {
                for (let row = 0; row < 3; row++) {
                    this.fixJackpotSymbolObject[col][row]?.node && (this.fixJackpotSymbolObject[col][row].node.active = true);
                }
            }
            // 停止所有符号动画，执行回调
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            callback();
        }, 1.66);
    }

    /**
     * 播放结果特效（遍历所有中奖符号）
     * @param resultData 结果数据
     * @param callback 完成回调
     */
    public playResultEffect(resultData: ResultData, callback?: () => void): void {
        if (!resultData || (!resultData.lockNRollResults && !resultData.jackpotResults)) {
            callback && callback();
            return;
        }

        // 重置Linked Jackpot模式奖金
        SlotGameResultManager.Instance.winMoneyInLinkedJackpotMode = 0;
        let currentIdx = 0; // 当前处理的符号索引（0-14）

        // 递归播放单个结果特效
        const playNextEffect = () => {
            if (currentIdx < 15) {
                const col = Math.floor(currentIdx / 3);
                const row = currentIdx % 3;
                this.playSingleResultEffect(resultData, col, row, playNextEffect);
                currentIdx++;
            } else {
                // 所有特效播放完成，执行回调
                callback && this.scheduleOnce(() => callback(), 1.5);
            }
        };

        // 启动第一个特效
        playNextEffect();
    }

    /**
     * 播放单个结果特效（移动光效、符号变暗）
     * @param resultData 结果数据
     * @param col 列索引（0-4）
     * @param row 行索引（0-2）
     * @param callback 完成回调
     */
    public playSingleResultEffect(
        resultData: ResultData,
        col: number,
        row: number,
        callback: () => void
    ): void {
        // 查找当前位置的中奖结果
        let resultIdx = -1;
        if (resultData.lockNRollResults) {
            resultIdx = resultData.lockNRollResults.findIndex(
                item => item.winningCellX === col && item.winningCellY === row
            );
        }

        if (resultIdx === -1) {
            callback();
            return;
        }

        // 计算总奖金（当前奖金 + Jackpot奖金）
        const jackpotPrize = resultData.jackpotResults?.length > 0 ? resultData.jackpotResults[0].winningCoin : 0;
        const currentPrize = resultData.lockNRollResults[resultIdx].winningCoin;
        const totalPrize = SlotGameResultManager.Instance.winMoneyInLinkedJackpotMode + currentPrize + jackpotPrize;
        
        // 更新累计奖金
        SlotGameResultManager.Instance.winMoneyInLinkedJackpotMode += currentPrize;

        // 播放底部移动光效
        this.moveLightComponent?.playMoveLightWithBottom(col, row, totalPrize);

        // 延迟330ms：符号变暗
        this.scheduleOnce(() => {
            this.fixJackpotSymbolObject[col][row]?.setDimmContents(true);
        }, 0.33);

        // 延迟500ms：执行回调
        this.scheduleOnce(() => {
            callback();
        }, 0.5);
    }

    /**
     * 播放爆炸结果特效
     * @param callback 完成回调
     */
    public playBurstResultEffect(callback: () => void): void {
        // 停止所有符号动画
        SymbolAnimationController.Instance.stopAllAnimationSymbol();
        const lastWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        let hasBurstSymbol = false;

        // 处理爆炸符号（90→95）
        for (let col = 0; col < 5; col++) {
            const window = lastWindows?.GetWindow(col);
            if (!window) continue;

            for (let row = 0; row < 3; row++) {
                const symbolId = window.getSymbol(row);
                if (symbolId === 90) {
                    // 播放爆炸符号动画
                    const aniSymbol = SymbolAnimationController.Instance.playAnimationSymbol(col, row, 95, null, null, true);
                    // 设置符号奖金信息
                    const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[col][row];
                    const jackpotSymbol = aniSymbol?.getComponent(JackpotSymbol_RainbowPearl);
                    jackpotSymbol?.setCenterInfoRainbowPearl(0, symbolInfo?.prize || 0);
                    hasBurstSymbol = true;
                }
            }
        }

        if (hasBurstSymbol) {
            // 滚轮符号变暗
            SlotManager.Instance.reelMachine?.setSymbolsDimmActive(true);

            // 处理触发符号（94）
            for (let col = 0; col < 5; col++) {
                const window = lastWindows?.GetWindow(col);
                if (!window) continue;

                for (let row = 0; row < 3; row++) {
                    const symbolId = window.getSymbol(row);
                    if (symbolId === 94) {
                        // 播放触发符号动画
                        SymbolAnimationController.Instance.playAnimationSymbol(col, row, 94, null, null, true);
                        // 播放爆炸触发音效
                        SlotSoundController.Instance().playAudio("BurstTrigger", "FX");
                    }
                }
            }

            // 延迟1秒：重置图层，执行回调
            this.scheduleOnce(() => {
                this.resetLayer();
                callback();
            }, 1);
        } else {
            callback();
        }
    }

    //#region 私有辅助方法
    /**
     * 更新Jackpot奖池金额
     * @param isNoneEffect 是否为无特效版本
     */
    private updateJackpotPrizeAmount(isNoneEffect = false): void {
        const gameComp = SlotManager.Instance.getComponent(GameComponents_RainbowPearl);
        if (!gameComp?.linkedJackpotUI) return;

        // 优先取lockNRoll奖池，无则计算base模式奖金
        const subGameKey = isNoneEffect ? SlotGameResultManager.Instance.getNextSubGameKey() : "lockNRoll";
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
        let totalPrize = 0;

        if (subGameState?.pots && subGameState.pots["90pot"]) {
            // 直接取lockNRoll奖池金额
            totalPrize = subGameState.pots["90pot"].pot;
        } else {
            // 计算base模式下所有Jackpot符号奖金
            const baseState = SlotGameResultManager.Instance.getSubGameState("base");
            const betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
            
            for (let col = 0; col < 5; col++) {
                for (let row = 0; row < 3; row++) {
                    const symbolId = baseState.lastWindows[col][row];
                    if (symbolId === 90 || symbolId === 91) {
                        totalPrize += baseState.lastSymbolInfoWindow[col][row].prize * betPerLine;
                    }
                }
            }
        }

        // 设置奖池金额
        gameComp.linkedJackpotUI.setPrize(totalPrize);
    }
    //#endregion
}