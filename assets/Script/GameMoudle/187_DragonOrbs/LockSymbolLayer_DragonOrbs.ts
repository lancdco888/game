const { ccclass, property } = cc._decorator;


import Reel from '../../Slot/Reel';
import SlotSoundController from '../../Slot/SlotSoundController';
import State from '../../Slot/State';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameResultManager, { SubGameState } from '../../manager/SlotGameResultManager';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotManager from '../../manager/SlotManager';
import SymbolPoolManager, { SymbolInfo } from '../../manager/SymbolPoolManager';
import JackpotSymbol_DragonOrbs from './JackpotSymbol_DragonOrbs';


// ===================== 龙珠游戏锁符号层组件 =====================
/**
 * 龙珠游戏锁符号层组件
 * 管理锁符号的位置检查、添加/合并/移除、卷轴显隐、胜利计算、符号排序、特效播放等核心逻辑
 */
@ccclass()
export default class LockSymbolLayer_DragonOrbs extends cc.Component {
    // ===================== 序列化属性（与原JS一致） =====================
    /** 支付特效节点 */
    @property(cc.Node)
    public payFx: cc.Node | null = null;

    /** 龙珠预制体列表 */
    @property([cc.Prefab])
    public orbs: cc.Prefab[] = [];

    /** 帧图层节点 */
    @property(cc.Node)
    public frameLayer: cc.Node = null;

    /** 接收图层节点 */
    @property(cc.Node)
    public receiveLayer: cc.Node = null;

    /** 发送图层节点 */
    @property(cc.Node)
    public sendLayer: cc.Node = null;

    // ===================== 私有状态（与原JS一致） =====================
    /** 锁符号信息映射表（key: reel_row，value: 锁符号信息） */
    private _info: Record<string, any> = {};

    /** 操作前的金额 */
    private _beforeMoney: number = 0;

    /** 帧节点 */
    private _frame: cc.Node | null = null;

    /** 累计奖励金额 */
    private _accumulatePrize: number = 0;

    // ===================== 核心业务方法（与原JS逻辑1:1） =====================
    /**
     * 检查指定位置是否有锁符号
     * @param reelIndex 卷轴索引
     * @param rowIndex 行索引
     * @returns 是否有锁符号
     */
    public checkLockSymbolPosition(reelIndex: number, rowIndex: number): boolean {
        return this._info[`${reelIndex}_${rowIndex}`] !== null;
    }

    /**
     * 初始化窗口（根据子游戏状态添加锁符号）
     */
    public initWindow(): void {
        // 获取子游戏状态
        const subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey) as SubGameState;
        if (!TSUtility.isValid(subGameState)) return;

        const lastWindows = subGameState.lastWindows;
        const centerPot = subGameState.gauges.centerPot;
        const isBonusWheelTrigger = TSUtility.isValid(subGameState.gauges.bonusWheelTrigger) && subGameState.gauges.bonusWheelTrigger >= 1;

        // 中心奖池触发 → 添加合并锁符号
        if (centerPot === 1) {
            let symbolValue = lastWindows[1][1];
            if (symbolValue > 100) {
                if (symbolValue % 2 === 1) symbolValue -= 1;
                symbolValue -= 100;
            }
            this.addMergeLockSymbol(1, 1, subGameState.pots.centerPot.pot, symbolValue);
        }
        // 非奖励轮触发且有窗口数据 → 遍历添加锁符号
        else if (!isBonusWheelTrigger && TSUtility.isValid(lastWindows)) {
            for (let reelIdx = 0; reelIdx < lastWindows.length; ++reelIdx) {
                const rowValues = lastWindows[reelIdx];
                for (let rowIdx = 0; rowIdx < rowValues.length; ++rowIdx) {
                    let symbolValue = rowValues[rowIdx];
                    
                    // 符号值修正逻辑
                    if (symbolValue > 91 && symbolValue < 100) {
                        if (symbolValue % 2 === 1) symbolValue -= 1;
                    } else if (symbolValue > 100) {
                        if (symbolValue % 2 === 1) symbolValue -= 1;
                        symbolValue -= 100;
                    }

                    // 符号值>91时添加锁符号
                    if (symbolValue > 91) {
                        this.addLockSymbol(reelIdx, rowIdx, symbolValue);
                    }
                }
            }
        }
    }

    /**
     * 添加合并锁符号
     * @param reelIndex 卷轴索引
     * @param rowIndex 行索引
     * @param prize 奖励金额
     * @param symbolValue 符号值
     */
    public addMergeLockSymbol(reelIndex: number, rowIndex: number, prize: number, symbolValue: number): void {
        const key = `${reelIndex}_${rowIndex}`;
        const reelComp = SlotManager.Instance.reelMachine.reels[reelIndex].getComponent(Reel);
        if (!TSUtility.isValid(reelComp)) return;

        // 符号值修正
        if (symbolValue % 2 === 1) symbolValue -= 1;
        
        // 移除原有符号
        this.removeByKey(reelIndex, rowIndex);

        // 符号不存在/未锁定 → 创建新符号
        if (!TSUtility.isValid(this._info[key]) || this._info[key]?.isLock !== true) {
            // 获取符号动画节点
            const symbolNode = SymbolPoolManager.instance.getSymbolAni(symbolValue + 400);
            if (!TSUtility.isValid(symbolNode)) return;

            // 隐藏卷轴对应行符号
            reelComp.hideSymbolInRow(rowIndex);
            
            // 添加符号到当前节点并设置位置
            this.node.addChild(symbolNode);
            symbolNode.x = 199 * (reelIndex - 1);
            symbolNode.y = 148 * (1 - rowIndex);
            symbolNode.active = true;

            // 存储锁符号信息
            this._info[key] = {
                symbol: symbolNode,
                reelIndex,
                rowIndex,
                isLock: true
            };

            // 设置符号奖励
            const symbolInfoArray = SlotGameResultManager.Instance.getResultSymbolInfoArray();
            const symbolInfo = symbolInfoArray.length > 0 ? symbolInfoArray[reelIndex][rowIndex] : null;
            
            const jackpotSymbolComp = symbolNode.getComponent(JackpotSymbol_DragonOrbs);
            if (TSUtility.isValid(jackpotSymbolComp)) {
                if (TSUtility.isValid(symbolInfo) && symbolInfo.prizeUnit === "BetPerLine") {
                    jackpotSymbolComp.setSymbol(symbolInfo);
                    this._accumulatePrize = symbolInfo.prize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                } else {
                    jackpotSymbolComp.setFixedMoney(prize);
                    this._accumulatePrize = prize;
                }
            }

            // 创建帧符号
            const frameSymbol = SymbolPoolManager.instance.getSymbol(2000);
            if (TSUtility.isValid(frameSymbol) && TSUtility.isValid(this.frameLayer)) {
                this.frameLayer.addChild(frameSymbol);
                frameSymbol.x = symbolNode.x;
                frameSymbol.y = symbolNode.y;
                this._frame = frameSymbol;
            }

            // 播放帧出现音效
            SlotSoundController.Instance().playAudio("FrameAppear", "FX");
        }

        // 隐藏对应卷轴
        this.hideFullReel(reelIndex);
    }

    /**
     * 初始化累计奖励
     */
    public initAccumulatePrize(): void {
        this._accumulatePrize = 0;
    }

    /**
     * 获取累计奖励金额
     * @returns 累计奖励
     */
    public getAccumulatePrize(): number {
        return this._accumulatePrize;
    }

    /**
     * 创建向中心移动的龙珠对象
     * @param symbolValue 符号值
     * @param reelIndex 卷轴索引
     * @param rowIndex 行索引
     * @param symbolInfo 符号信息
     */
    public createToCenterObj(symbolValue: number, reelIndex: number, rowIndex: number, symbolInfo: any): void {
        const self = this;
        
        // 确定龙珠索引
        let orbIndex = -1;
        if (symbolValue === 92) orbIndex = 2;
        else if (symbolValue === 94) orbIndex = 1;
        else if (symbolValue === 96) orbIndex = 0;

        // 实例化龙珠预制体
        if (orbIndex === -1 || !TSUtility.isValid(this.orbs[orbIndex])) return;
        const orbNode = cc.instantiate(this.orbs[orbIndex]);
        const orbComp = orbNode.getComponent(JackpotSymbol_DragonOrbs);
        if (TSUtility.isValid(orbComp)) orbComp.setSymbol(symbolInfo);

        // 添加到发送图层并设置位置
        if (TSUtility.isValid(this.sendLayer)) {
            this.sendLayer.addChild(orbNode);
            orbNode.x = 200 * (reelIndex - 1);
            orbNode.y = 148 * (1 - rowIndex);
        }

        // 创建合并符号动画
        const mergeSymbol = SymbolPoolManager.instance.getSymbolAni(symbolValue + 700);
        if (TSUtility.isValid(mergeSymbol)) {
            const mergeSymbolComp = mergeSymbol.getComponent(JackpotSymbol_DragonOrbs);
            if (TSUtility.isValid(mergeSymbolComp)) mergeSymbolComp.setSymbol(symbolInfo);
            
            this.node.addChild(mergeSymbol);
            mergeSymbol.x = orbNode.x;
            mergeSymbol.y = orbNode.y;

            // 播放合并符号音效
            SlotSoundController.Instance().playAudio("MergeSymbol", "FX");

            // 显示卷轴对应行符号
            const reelComp = SlotManager.Instance.reelMachine.reels[reelIndex].getComponent(Reel);
            if (TSUtility.isValid(reelComp)) reelComp.showSymbolInRow(rowIndex);

            // 0.25秒后移除合并符号
            this.scheduleOnce(() => {
                if (TSUtility.isValid(mergeSymbol)) mergeSymbol.removeFromParent(true);
            }, 0.25);
        }

        // 清空锁符号信息
        this._info[`${reelIndex}_${rowIndex}`] = null;

        // 构建龙珠移动动作序列
        const moveAction = cc.sequence(
            cc.delayTime(0.2),
            cc.moveTo(0.5, new cc.Vec2(0, 0)),
            cc.callFunc(() => {
                // 移除龙珠节点
                if (TSUtility.isValid(orbNode)) orbNode.removeFromParent(true);
                SymbolAnimationController.Instance.releaseAnimationSymbol_byKey(1, 1);

                // 创建接收符号动画
                const receiveSymbol = SymbolPoolManager.instance.getSymbolAni(symbolValue + 800);
                if (TSUtility.isValid(receiveSymbol) && TSUtility.isValid(this.receiveLayer)) {
                    const betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
                    const addPrize = symbolInfo.prize * betPerLine;
                    this._accumulatePrize += addPrize;

                    // 更新奖励显示
                    const receiveSymbolComp = receiveSymbol.getComponent(JackpotSymbol_DragonOrbs);
                    if (TSUtility.isValid(receiveSymbolComp)) {
                        receiveSymbolComp.addPrize(this._accumulatePrize - addPrize, this._accumulatePrize);
                    }

                    this.receiveLayer.addChild(receiveSymbol);
                    receiveSymbol.x = 0;
                    receiveSymbol.y = 0;

                    // 更新中心锁符号奖励
                    const centerSymbolInfo = this._info["1_1"];
                    if (TSUtility.isValid(centerSymbolInfo) && TSUtility.isValid(centerSymbolInfo.symbol)) {
                        const centerSymbolComp = centerSymbolInfo.symbol.getComponent(JackpotSymbol_DragonOrbs);
                        if (TSUtility.isValid(centerSymbolComp)) {
                            centerSymbolComp.addPrize(0, this._accumulatePrize);
                        }
                    }

                    // 0.25秒后移除接收符号
                    this.scheduleOnce(() => {
                        if (TSUtility.isValid(receiveSymbol)) receiveSymbol.removeFromParent(true);
                    }, 0.25);
                }
            })
        );

        // 执行移动动作
        if (TSUtility.isValid(orbNode)) orbNode.runAction(moveAction);
    }

    /**
     * 添加锁符号
     * @param reelIndex 卷轴索引
     * @param rowIndex 行索引
     * @param symbolValue 符号值
     */
    public addLockSymbol(reelIndex: number, rowIndex: number, symbolValue: number): void {
        const key = `${reelIndex}_${rowIndex}`;
        if (this._info[key] !== null) return;

        // 获取符号动画节点
        const symbolNode = SymbolPoolManager.instance.getSymbolAni(symbolValue + 200);
        if (!TSUtility.isValid(symbolNode)) return;

        // 获取符号信息
        const currentGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const nextGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const targetGameKey = currentGameKey === "base" ? nextGameKey : currentGameKey;
        const subGameState = SlotGameResultManager.Instance.getSubGameState(targetGameKey) as SubGameState;
        
        const symbolInfo = TSUtility.isValid(subGameState) 
            ? subGameState.lastSymbolInfoWindow[reelIndex][rowIndex] 
            : null;

        // 设置符号信息
        const jackpotSymbolComp = symbolNode.getComponent(JackpotSymbol_DragonOrbs);
        if (TSUtility.isValid(symbolInfo) && TSUtility.isValid(jackpotSymbolComp)) {
            jackpotSymbolComp.setSymbol(symbolInfo);
        }

        // 添加符号到当前节点并设置位置
        this.node.addChild(symbolNode);
        symbolNode.x = 199 * (reelIndex - 1);
        symbolNode.y = 148 * (1 - rowIndex);
        symbolNode.active = true;

        // 存储锁符号信息
        this._info[key] = {
            symbol: symbolNode,
            reelIndex,
            rowIndex
        };

        // 隐藏对应卷轴+排序锁符号
        this.hideFullReel(reelIndex);
        this.sortLockSymbol();
    }

    /**
     * 隐藏完整卷轴（当卷轴有3个锁符号时）
     * @param reelIndex 卷轴索引
     */
    public hideFullReel(reelIndex: number): void {
        const infoKeys = Object.keys(this._info);
        let lockSymbolCount = 0;

        // 统计指定卷轴的锁符号数量
        for (let i = 0; i < infoKeys.length; ++i) {
            const info = this._info[infoKeys[i]];
            if (TSUtility.isValid(info) && info.reelIndex === reelIndex) {
                lockSymbolCount++;
                if (lockSymbolCount === 3) {
                    SlotManager.Instance.reelMachine.hideReel(reelIndex);
                    break;
                }
            }
        }
    }

    /**
     * 根据索引移除锁符号
     * @param reelIndex 卷轴索引
     * @param rowIndex 行索引
     */
    public removeByKey(reelIndex: number, rowIndex: number): void {
        const key = `${reelIndex}_${rowIndex}`;
        const info = this._info[key];
        
        if (info !== null && TSUtility.isValid(info) && TSUtility.isValid(info.symbol)) {
            // 释放符号到对象池
            SymbolPoolManager.instance.releaseSymbolAni(info.symbol);
            // 清空信息
            this._info[key] = null;
            delete this._info[key];
        }
    }

    /**
     * 获取胜利计算状态（返回State对象）
     * @param baseWin 基础胜利金额
     * @param reelIndex 卷轴索引
     * @param rowIndex 行索引
     * @param winParam 胜利参数
     * @param symbolValue 符号值
     * @returns 状态对象
     */
    public getCalculateWinState(
        baseWin: number,
        reelIndex: number,
        rowIndex: number,
        winParam: any,
        symbolValue: number
    ): State {
        const self = this;
        const state = new State();

        // 添加状态开始回调
        state.addOnStartCallback(() => {
            // 播放计算音效
            SlotSoundController.Instance().playAudio("Calculate", "FX");

            // 获取卷轴组件并更新符号
            const reelComp = SlotManager.Instance.reelMachine.reels[reelIndex].getComponent(Reel);
            if (TSUtility.isValid(reelComp)) {
                reelComp.changeSymbol(rowIndex, symbolValue, winParam);
                
                // 应用倍数到符号
                const symbolNode = reelComp.getSymbol(rowIndex);
                const symbolComp = symbolNode.getComponent(JackpotSymbol_DragonOrbs);
                if (TSUtility.isValid(symbolComp)) symbolComp.applyMultiplier(winParam);

                // 隐藏卷轴对应行符号
                reelComp.hideSymbolInRow(rowIndex);
            }

            // 移除锁符号
            self.removeByKey(reelIndex, rowIndex);

            // 创建新符号并设置位置
            const newSymbol = SymbolPoolManager.instance.getSymbolAni(symbolValue);
            if (TSUtility.isValid(newSymbol)) {
                const newSymbolComp = newSymbol.getComponent(JackpotSymbol_DragonOrbs);
                if (TSUtility.isValid(newSymbolComp)) newSymbolComp.applyMultiplier(winParam);
                
                self.node.addChild(newSymbol);
                newSymbol.x = 199 * (reelIndex - 1);
                newSymbol.y = 148 * (1 - rowIndex);
                newSymbol.active = true;
            }

            // 计算最终胜利金额
            const betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
            let finalWin = 0;
            if (winParam.prizeUnit === "BetPerLine") {
                finalWin = baseWin + winParam.prize * betPerLine * (winParam.multiplier || 1);
            } else {
                finalWin = baseWin + winParam.prize;
            }

            // 更新底部胜利金额显示
            const bottomUI = SlotManager.Instance.bottomUIText;
            bottomUI.stopChangeWinMoney();
            bottomUI.setWinMoney(baseWin);
            bottomUI.playChangeWinMoney(baseWin, finalWin, () => {}, false, 1.1);

            // 播放支付特效
            if (TSUtility.isValid(self.payFx)) {
                self.payFx.active = false;
                self.payFx.active = true;
            }

            // 1秒后标记状态完成
            self.scheduleOnce(() => {
                state.setDone();
            }, 1);
        });

        return state;
    }

    /**
     * 设置操作前的金额
     * @param amount 金额
     */
    public setBeforeMoney(amount: number): void {
        this._beforeMoney = amount;
    }

    /**
     * 清除帧节点
     */
    public clearFrame(): void {
        if (TSUtility.isValid(this._frame) && TSUtility.isValid(this._frame)) {
            this._frame.removeFromParent(true);
            this._frame = null;
        }
    }

    /**
     * 移除所有锁符号并重置状态
     */
    public removeAll(): void {
        // 释放所有符号到对象池
        const infoKeys = Object.keys(this._info);
        for (let i = 0; i < infoKeys.length; ++i) {
            const info = this._info[infoKeys[i]];
            if (TSUtility.isValid(info) && TSUtility.isValid(info.symbol)) {
                SymbolPoolManager.instance.releaseSymbolAni(info.symbol);
            }
        }

        // 显示所有卷轴
        for (let i = 0; i < 3; ++i) {
            SlotManager.Instance.reelMachine.showReel(i);
        }

        // 重置状态+清空子节点
        this._info = {};
        this.node.removeAllChildren(true);
    }

    /**
     * 获取剩余空单元格数量
     * @returns 空单元格数
     */
    public getLeftCellCount(): number {
        let totalCells = 9;
        const infoKeys = Object.keys(this._info);
        
        for (let i = 0; i < infoKeys.length; ++i) {
            if (TSUtility.isValid(this._info[infoKeys[i]])) {
                totalCells--;
            }
        }
        
        return totalCells;
    }

    /**
     * 获取第一个空行索引
     * @returns 空行索引
     */
    public getEmptyRowIndex(): number {
        let emptyRowIdx = 0;
        
        outerLoop:
        for (let reelIdx = 0; reelIdx < 3; ++reelIdx) {
            for (let rowIdx = 0; rowIdx < 3; ++rowIdx) {
                if (this._info[`${reelIdx}_${rowIdx}`] === null) {
                    emptyRowIdx = rowIdx;
                    break outerLoop;
                }
            }
        }
        
        return emptyRowIdx;
    }

    /**
     * 排序锁符号（按Y轴从高到低）
     */
    public sortLockSymbol(): void {
        const sortedSymbols: cc.Node[] = [];
        const infoKeys = Object.keys(this._info);
        const symbolList: cc.Node[] = [];

        // 收集所有有效符号
        for (let i = 0; i < infoKeys.length; ++i) {
            const info = this._info[infoKeys[i]];
            if (TSUtility.isValid(info) && TSUtility.isValid(info.symbol)) {
                symbolList.push(info.symbol!);
            }
        }

        // 按Y轴降序排序
        for (let i = 0; i < symbolList.length; ++i) {
            const symbol = symbolList[i];
            let inserted = false;
            
            for (let j = 0; j < sortedSymbols.length; ++j) {
                if (sortedSymbols[j].y < symbol.y) {
                    sortedSymbols.splice(j, 0, symbol);
                    inserted = true;
                    break;
                }
            }
            
            if (!inserted) {
                sortedSymbols.push(symbol);
            }
        }

        // 更新符号层级
        for (let i = 0; i < sortedSymbols.length; ++i) {
            if (TSUtility.isValid(sortedSymbols[i])) {
                sortedSymbols[i].setSiblingIndex(i);
            }
        }
    }

    /**
     * 应用倍数到指定锁符号
     * @param reelIndex 卷轴索引
     * @param rowIndex 行索引
     * @param multiplier 倍数参数
     */
    public applyMultiplier(reelIndex: number, rowIndex: number, multiplier: any): void {
        const info = this._info[`${reelIndex}_${rowIndex}`];
        if (info !== null && TSUtility.isValid(info) && TSUtility.isValid(info.symbol)) {
            const symbolComp = info.symbol!.getComponent(JackpotSymbol_DragonOrbs);
            if (TSUtility.isValid(symbolComp)) {
                symbolComp.applyMultiplier(multiplier);
            }
        }
    }
}