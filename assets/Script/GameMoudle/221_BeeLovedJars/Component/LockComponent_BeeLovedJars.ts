
import SymbolAni from '../../../Slot/SymbolAni';
import SlotGameResultManager, { Cell, JackpotResult, LockNRollResult } from '../../../manager/SlotGameResultManager';
import SymbolPoolManager, { SymbolInfo } from '../../../manager/SymbolPoolManager';
import Symbol from '../../../Slot/Symbol';
import BeeLovedJarsManager from '../BeeLovedJarsManager';
import ReelMachine_BeeLovedJars from '../ReelMachine_BeeLovedJars';
import CaculateComponent_BeeLovedJars from './CaculateComponent_BeeLovedJars';
import JackpotSymbolComponent_BeeLovedJars from './JackpotSymbolComponent_BeeLovedJars';
import LockMovePrizeComponent_BeeLovedJars from './LockMovePrizeComponent_BeeLovedJars';
import LockNRollTopUIComponent_BeeLovedJars from './LockNRollTopUIComponent_BeeLovedJars';
import RemainCountComponent_BeeLovedJars from './RemainCountComponent_BeeLovedJars';
import SlotManager from '../../../manager/SlotManager';
import SlotSoundController from '../../../Slot/SlotSoundController';
import TSUtility from '../../../global_utility/TSUtility';
import { BottomTextType } from '../../../SubGame/BottomUIText';
import SlotGameRuleManager from '../../../manager/SlotGameRuleManager';

const { ccclass, property } = cc._decorator;

/**
 * BeeLovedJars 游戏 Lock&Roll 模式核心组件
 * 负责锁符号显示、奖励计算、符号收集、音效播放等逻辑
 */
@ccclass('LockComponent_BeeLovedJars')
export default class LockComponent_BeeLovedJars extends cc.Component {
    // 锁符号根节点
    @property({
        type: cc.Node,
        displayName: "锁符号根节点",
        tooltip: "Lock&Roll模式下显示锁符号的根节点"
    })
    lock_Node: cc.Node | null = null;

    // 收集奖励移动组件
    @property({
        type: LockMovePrizeComponent_BeeLovedJars,
        displayName: "收集奖励移动组件",
        tooltip: "处理Jackpot收集时的奖励移动逻辑"
    })
    collectMove_Node: LockMovePrizeComponent_BeeLovedJars | null = null;

    // 奖励计算移动组件
    @property({
        type: CaculateComponent_BeeLovedJars,
        displayName: "奖励计算移动组件",
        tooltip: "处理奖励计算时的符号移动逻辑"
    })
    caculateMove_Node: CaculateComponent_BeeLovedJars | null = null;

    // 锁符号节点二维数组 [列][行]
    private _lockNodes: (cc.Node | null)[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];

    // 符号结果信息二维数组 [列][行]
    private _resultInfos: (SymbolInfo | any)[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];

    // 特殊符号节点二维数组 [列][行]
    private _specialNode: (cc.Node | any)[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];

    // 符号宽度
    private _width: number = 172;
    // 符号高度
    private _height: number = 136;
    // 总赢取金额
    private _winMoney: number = 0;
    // 新增奖励金额
    private _addPrize: number = 0;
    // Jackpot结果列表
    private _jackpotResult: JackpotResult[] = [];
    // 目标单元格列表（收集Jackpot用）
    private _targetCells: Cell[] = [];

    /**
     * 清空已填充的锁符号
     */
    clearFilledSymbols(): void {
        if (!this.lock_Node) return;

        // 释放所有子节点的符号/动画并移除
        const childrenCount = this.lock_Node.childrenCount;
        for (let t = 0; t < childrenCount; ++t) {
            const childNode = this.lock_Node.children[0];
            if (!childNode) continue;

            // 释放符号组件
            const symbolComp = childNode.getComponent(Symbol);
            if (symbolComp) {
                SymbolPoolManager.instance.releaseSymbol(symbolComp);
            }
            // 释放符号动画组件
            const symbolAniComp = childNode.getComponent(SymbolAni);
            if (symbolAniComp) {
                SymbolPoolManager.instance.releaseSymbolAni(childNode);
            }
        }
        this.lock_Node.removeAllChildren(true);

        // 重置二维数组
        for (let n = 0; n < 5; n++) {
            for (let t = 0; t < 3; t++) {
                this._lockNodes[n][t] = null;
                this._resultInfos[n][t] = null;
            }
        }
        this._targetCells = [];
    }

    /**
     * 修复无特效窗口的锁符号显示
     * @param symbolMatrix 符号矩阵
     * @param infoMatrix 符号信息矩阵
     */
    fixWindowNoneEffect(symbolMatrix: number[][], infoMatrix: SymbolInfo[][]): void {
        for (let n = 0; n < 5; n++) {
            for (let o = 0; o < 3; o++) {
                const symbolId = symbolMatrix[n][o];
                const symbolInfo = infoMatrix[n][o];
                // 9开头且非97的符号设置为锁符号
                if (Math.floor(symbolId / 10) === 9 && symbolId !== 97) {
                    this.setLockSymbol(n, o, symbolId, symbolInfo);
                }
            }
        }
        this.resetZorder();
    }

    /**
     * 修复首个无特效窗口的锁符号显示
     * @param symbolMatrix 符号矩阵
     * @param infoMatrix 符号信息矩阵
     */
    fixFirstWindowNoneEffect(symbolMatrix: number[][], infoMatrix: SymbolInfo[][]): void {
        for (let n = 0; n < 5; n++) {
            for (let o = 0; o < 3; o++) {
                const symbolId = symbolMatrix[n][o];
                const symbolInfo = infoMatrix[n][o];
                // 10开头的符号设置为90号锁符号
                if (Math.floor(symbolId / 10) === 10) {
                    this.setLockSymbol(n, o, 90, symbolInfo);
                }
            }
        }
        this.resetZorder();
    }

    /**
     * 设置锁符号
     * @param col 列索引
     * @param row 行索引
     * @param symbolId 符号ID
     * @param symbolInfo 符号信息
     */
    setLockSymbol(col: number, row: number, symbolId: number, symbolInfo: SymbolInfo): void {
        if (!this.lock_Node || this._lockNodes[col][row] !== null) return;

        // 计算滚轮索引
        const reelIndex = 3 * col + row;
        // 获取空闲符号ID并创建符号动画
        const idleSymbolId = this.getIdleID(symbolId);
        if (idleSymbolId === undefined) return;

        const symbolAniNode = SymbolPoolManager.instance.getSymbolAni(idleSymbolId);
        const jackpotComp = symbolAniNode.getComponent(JackpotSymbolComponent_BeeLovedJars);
        if (jackpotComp) jackpotComp.setInfo(symbolInfo);

        // 添加到锁节点并设置位置/动画
        this.lock_Node.addChild(symbolAniNode);
        const symbolAniComp = symbolAniNode.getComponent(SymbolAni);
        if (symbolAniComp) symbolAniComp.playAnimation();
        
        const posX = -2 * this._width + this._width * col;
        const posY = this._height - this._height * row;
        symbolAniNode.setPosition(new cc.Vec2(posX, posY));

        // 保存节点和信息，隐藏对应Lock&Roll滚轮
        this._lockNodes[col][row] = symbolAniNode;
        this._resultInfos[col][row] = symbolInfo;
        
        const reelMachineComp = SlotManager.Instance.reelMachine.getComponent(ReelMachine_BeeLovedJars);
        const targetReel = reelMachineComp.lockNRoll_Reels[reelIndex];
        if (targetReel?.node) targetReel.node.active = false;
    }

    /**
     * 设置出现的符号（Jackpot/计数符号）
     * @param col 列索引
     * @param row 行索引
     * @param symbolId 符号ID
     */
    setAppearSymbol(col: number, row: number, symbolId: number): void {
        if (!this.lock_Node || this._lockNodes[col][row] !== null) return;

        // 获取出现符号ID并创建符号动画
        const appearSymbolId = this.getAppearID(symbolId);
        if (appearSymbolId === undefined) return;

        const symbolAniNode = SymbolPoolManager.instance.getSymbolAni(appearSymbolId);
        this.lock_Node.addChild(symbolAniNode);
        symbolAniNode.setSiblingIndex(symbolAniNode.parent!.childrenCount - 1);

        // 处理Jackpot符号信息
        if (appearSymbolId < 196) {
            const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[col][row];
            const jackpotComp = symbolAniNode.getComponent(JackpotSymbolComponent_BeeLovedJars);
            if (jackpotComp) {
                jackpotComp.hideInfo();
                this._resultInfos[col][row] = symbolInfo;
            }
        }

        // 播放对应音效
        if (appearSymbolId === 197) {
            SlotSoundController.Instance().playAudio("AddCount", "FX");
        } else {
            SlotSoundController.Instance().playAudio("JackpotAppear", "FX");
        }

        // 设置位置和动画
        const posX = -2 * this._width + this._width * col;
        const posY = this._height - this._height * row;
        symbolAniNode.setPosition(new cc.Vec2(posX, posY));
        
        const symbolAniComp = symbolAniNode.getComponent(SymbolAni);
        if (symbolAniComp) symbolAniComp.playAnimation();

        // 保存节点（特殊符号/普通锁符号）
        if (symbolId === 97) {
            this._specialNode[col][row] = symbolAniNode;
        } else {
            this._lockNodes[col][row] = symbolAniNode;
        }

        // 96/97号符号增加剩余次数
        if (symbolId === 96 || symbolId === 97) {
            const remainCountComp = BeeLovedJarsManager.getInstance().game_components.remainCount.getComponent(RemainCountComponent_BeeLovedJars);
            remainCountComp.addCount();
        }
    }

    /**
     * 重置特殊符号节点
     */
    resetSpecialSymbol(): void {
        for (let e = 0; e < 5; e++) {
            for (let t = 0; t < 3; t++) {
                const specialNode = this._specialNode[e][t];
                if (!specialNode) continue;

                // 释放符号/动画组件
                const symbolComp = specialNode.getComponent(Symbol);
                if (symbolComp) {
                    SymbolPoolManager.instance.releaseSymbol(symbolComp);
                } else {
                    const symbolAniComp = specialNode.getComponent(SymbolAni);
                    if (symbolAniComp) {
                        SymbolPoolManager.instance.releaseSymbolAni(specialNode);
                    }
                }

                // 移除节点并重置
                specialNode.removeFromParent(true);
                this._specialNode[e][t] = null;

                // 显示对应Lock&Roll滚轮
                const reelIndex = 3 * e + t;
                const reelMachineComp = SlotManager.Instance.reelMachine.getComponent(ReelMachine_BeeLovedJars);
                const targetReel = reelMachineComp.lockNRoll_Reels[reelIndex];
                if (targetReel?.node) targetReel.node.active = true;
            }
        }
    }

    /**
     * 触发Jackpot特效
     */
    triggerFX(): void {
        if (!this.lock_Node) return;

        // 释放并移除所有锁符号
        for (let e = 0; e < 5; e++) {
            for (let t = 0; t < 3; t++) {
                const lockNode = this._lockNodes[e][t];
                if (!lockNode) continue;

                // 释放符号/动画组件
                const symbolComp = lockNode.getComponent(Symbol);
                if (symbolComp) {
                    SymbolPoolManager.instance.releaseSymbol(symbolComp);
                } else {
                    const symbolAniComp = lockNode.getComponent(SymbolAni);
                    if (symbolAniComp) {
                        SymbolPoolManager.instance.releaseSymbolAni(lockNode);
                    }
                }

                lockNode.removeFromParent(true);
                this._lockNodes[e][t] = null;
                this._resultInfos[e][t] = null;

                // 创建新的符号动画
                const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
                const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[e][t];
                const symbolId = lastHistoryWindows.GetWindow(e).getSymbol(t);
                const symbolAniNode = SymbolPoolManager.instance.getSymbolAni(symbolId);
                
                const jackpotComp = symbolAniNode.getComponent(JackpotSymbolComponent_BeeLovedJars);
                if (jackpotComp) jackpotComp.setInfo(symbolInfo);

                // 添加到锁节点并设置位置/动画
                this.lock_Node.addChild(symbolAniNode);
                const posX = -2 * this._width + this._width * e;
                const posY = this._height - this._height * t;
                symbolAniNode.setPosition(new cc.Vec2(posX, posY));
                
                const symbolAniComp = symbolAniNode.getComponent(SymbolAni);
                if (symbolAniComp) symbolAniComp.playAnimation();

                // 保存节点和信息
                this._lockNodes[e][t] = symbolAniNode;
                this._resultInfos[e][t] = symbolInfo;
            }
        }

        // 播放触发音效
        SlotSoundController.Instance().playAudio("JackpotTrigger", "FX");
    }

    /**
     * 计算旋转奖励
     * @param callback 计算完成后的回调
     */
    CalculateSpin(callback: () => void): void {
        const self = this;
        let n = 0; // 总索引
        let o = 0; // 列索引
        let a = 0; // 行索引

        // 重置赢取金额，读取Jackpot奖励
        this._winMoney = 0;
        const spinResult = SlotGameResultManager.Instance.getSpinResult();
        if (spinResult.jackpotResults.length > 0) {
            this._winMoney = spinResult.jackpotResults[0].winningCoin;
        }

        const totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();
        const symbolInfoWindow = spinResult.symbolInfoWindow as any;

        // 无奖励直接执行回调
        if (totalWinMoney <= 0) {
            callback();
            return;
        }

        // 逐单元格计算奖励
        const calculateNext = () => {
            n++;
            o = Math.floor(n / 3);
            a = Math.floor(n % 3);

            if (n < 15) {
                self.singleCaculate(o, a, symbolInfoWindow[o][a], calculateNext);
            } else {
                this.scheduleOnce(() => {
                    // 更新底部UI总赢取金额
                    SlotManager.Instance.bottomUIText.setWinMoney(self._winMoney, "TOTAL WIN");
                    // 清空计算移动组件的动画
                    if (self.caculateMove_Node) self.caculateMove_Node.clearAllAnis();
                    // 执行回调
                    if (TSUtility.isValid(callback)) callback();
                }, 1);
            }
        };

        // 开始第一个单元格计算
        self.singleCaculate(o, a, symbolInfoWindow[o][a], calculateNext);
    }

    /**
     * 单个单元格奖励计算
     * @param col 列索引
     * @param row 行索引
     * @param symbolInfo 符号信息
     * @param callback 计算完成后的回调
     */
    singleCaculate(col: number, row: number, symbolInfo: SymbolInfo|any, callback: () => void): void {
        const self = this;
        if (!this.lock_Node) {
            callback();
            return;
        }

        // 无效符号信息直接执行回调
        if (!TSUtility.isValid(symbolInfo) || symbolInfo.type === "") {
            callback();
            return;
        }

        // 释放并移除原有锁符号
        const lockNode = this._lockNodes[col][row];
        if (lockNode) {
            const symbolComp = lockNode.getComponent(Symbol);
            if (symbolComp) {
                SymbolPoolManager.instance.releaseSymbol(symbolComp);
            } else {
                const symbolAniComp = lockNode.getComponent(SymbolAni);
                if (symbolAniComp) {
                    SymbolPoolManager.instance.releaseSymbolAni(lockNode);
                }
            }
            lockNode.removeFromParent(true);
            this._lockNodes[col][row] = null;
            this._resultInfos[col][row] = null;
        }

        // 创建新的奖励计算符号动画
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const targetSymbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[col][row] as any;
        const symbolId = lastHistoryWindows.GetWindow(col).getSymbol(row);
        const symbolAniNode = SymbolPoolManager.instance.getSymbolAni(symbolId + 300);
        
        const jackpotComp = symbolAniNode.getComponent(JackpotSymbolComponent_BeeLovedJars);
        if (jackpotComp) jackpotComp.setInfo(targetSymbolInfo);

        // 添加到锁节点并设置位置/动画
        this.lock_Node.addChild(symbolAniNode);
        const posX = -2 * this._width + this._width * col;
        const posY = this._height - this._height * row;
        symbolAniNode.setPosition(new cc.Vec2(posX, posY));
        
        const symbolAniComp = symbolAniNode.getComponent(SymbolAni);
        if (symbolAniComp) symbolAniComp.playAnimation();

        // 保存节点和信息
        this._lockNodes[col][row] = symbolAniNode;
        this._resultInfos[col][row] = targetSymbolInfo;

        // 查找当前单元格的Lock&Roll奖励
        let targetLockNRollResult: LockNRollResult | undefined;
        const spinResult = SlotGameResultManager.Instance.getSpinResult();
        for (let b = 0; b < spinResult.lockNRollResults.length; b++) {
            const result = spinResult.lockNRollResults[b];
            if (result.winningCellX === col && result.winningCellY === row) {
                targetLockNRollResult = result;
                break;
            }
        }

        // 获取对应Lock&Roll滚轮并执行奖励移动动画
        const reelIndex = 3 * col + row;
        const reelMachineComp = SlotManager.Instance.reelMachine.getComponent(ReelMachine_BeeLovedJars);
        const targetReel = reelMachineComp.lockNRoll_Reels[reelIndex];
        
        if (this.caculateMove_Node && targetReel?.node) {
            this.caculateMove_Node.moveJackpotCalculate(targetReel.node, targetSymbolInfo, () => {
                if (!targetLockNRollResult) return;

                // 累加奖励金额
                const addWin = targetLockNRollResult.winningCoin;
                const oldWin = self._winMoney;
                self._winMoney += addWin;

                // 更新底部UI奖励金额
                SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "TOTAL WIN");
                SlotManager.Instance.bottomUIText.playChangeWinMoney(
                    oldWin, self._winMoney, () => {}, false, 0.5
                );
            });
        }

        // 延迟重置Z轴并执行回调
        this.scheduleOnce(() => {
            self.resetZorder();
            if (TSUtility.isValid(callback)) callback();
        }, 0.5);
    }

    /**
     * 检查单元格是否已存在于目标列表
     * @param cellList 单元格列表
     * @param col 列索引
     * @param row 行索引
     * @returns 是否存在
     */
    hasCell(cellList: Cell[], col: number, row: number): boolean {
        return cellList.some(cell => cell.col === col && cell.row === row);
    }

    /**
     * 检查是否存在黄色罐子符号
     * @param cell 目标单元格
     * @returns 是否存在
     */
    hasYellowJar(cell: Cell): boolean {
        const historyWindows = SlotGameResultManager.Instance.getHistoryWindows();
        for (let n = 0; n < historyWindows.length; n++) {
            const symbolId = historyWindows[n].GetWindow(cell.col).getSymbol(cell.row);
            if (symbolId === 94) return false;
        }
        return true;
    }

    /**
     * 检查是否存在绿色罐子符号
     * @param cell 目标单元格
     * @returns 是否存在
     */
    hasGreenJar(cell: Cell): boolean {
        const historyWindows = SlotGameResultManager.Instance.getHistoryWindows();
        for (let n = 0; n < historyWindows.length; n++) {
            const symbolId = historyWindows[n].GetWindow(cell.col).getSymbol(cell.row);
            if (symbolId === 92) return false;
        }
        return true;
    }

    /**
     * 收集Jackpot奖励
     * @param type 收集类型（0=绿色罐子 1=黄色罐子）
     * @param callback 收集完成后的回调
     */
    CollectJackpot(type: number, callback: () => void): void {
        const self = this;
        const historyWindows = SlotGameResultManager.Instance.getHistoryWindows();
        // 0=绿色罐子(92) 1=黄色罐子(94)
        const targetSymbolId = type === 0 ? 92 : 94;

        this._targetCells = [];
        // 遍历所有窗口收集目标符号单元格
        for (let i = 0; i < historyWindows.length; i++) {
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 3; c++) {
                    const symbolId = historyWindows[i].GetWindow(r).getSymbol(c);
                    if (symbolId === targetSymbolId && !this.hasCell(this._targetCells, r, c)) {
                        this._targetCells.push(new Cell(r, c));
                    }
                }
            }
        }

        let u = 0; // 收集索引
        // 逐单元格收集奖励
        const collectNext = () => {
            if (++u < self._targetCells.length) {
                self.stepCollect(targetSymbolId, self._targetCells[u], collectNext);
            } else {
                this.scheduleOnce(() => {
                    if (TSUtility.isValid(callback)) callback();
                }, 1);
            }
        };

        // 无目标单元格直接执行回调
        if (this._targetCells.length <= 0) {
            if (TSUtility.isValid(callback)) callback();
            return;
        }

        // 开始第一个单元格收集
        self.stepCollect(targetSymbolId, this._targetCells[u], collectNext);
    }

    /**
     * 单步收集Jackpot奖励
     * @param targetSymbolId 目标符号ID
     * @param targetCell 目标单元格
     * @param callback 收集完成后的回调
     */
    stepCollect(targetSymbolId: number, targetCell: Cell, callback: () => void): void {
        const self = this;
        if (!this.lock_Node) {
            callback();
            return;
        }

        // 初始化各类符号单元格列表
        const aCells: Cell[] = [];    // 91号符号
        const iCells: Cell[] = [];    // 93号符号（黄色罐子）
        const rCells: Cell[] = [];    // 95号符号（黄色罐子）
        const uCells: Cell[] = [];    // 95/93号符号（绿色罐子）

        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        // 收集91号符号单元格
        for (let y = 0; y < 5; y++) {
            for (let _ = 0; _ < 3; _++) {
                const symbolId = lastHistoryWindows.GetWindow(y).getSymbol(_);
                if (symbolId === 91) {
                    aCells.push(new Cell(y, _));
                }
            }
        }

        // 绿色罐子(92)收集逻辑
        if (targetSymbolId === 92) {
            for (let y = 0; y < 5; y++) {
                for (let _ = 0; _ < 3; _++) {
                    const symbolId = lastHistoryWindows.GetWindow(y).getSymbol(_);
                    const cell = new Cell(y, _);
                    const targetReelIndex = 3 * targetCell.col + targetCell.row;
                    const currentReelIndex = 3 * y + _;

                    // 收集95号符号（存在黄色罐子）
                    if (symbolId === 95 && this.hasYellowJar(cell)) {
                        uCells.push(cell);
                    }
                    // 收集93号符号（存在绿色罐子 或 滚轮索引小于目标）
                    if (symbolId === 93 && (this.hasGreenJar(cell) || currentReelIndex < targetReelIndex)) {
                        uCells.push(cell);
                    }
                }
            }
        }

        // 黄色罐子(94)收集逻辑
        if (targetSymbolId === 94) {
            // 收集93号符号
            for (let y = 0; y < 5; y++) {
                for (let _ = 0; _ < 3; _++) {
                    const symbolId = lastHistoryWindows.GetWindow(y).getSymbol(_);
                    if (symbolId === 93) {
                        iCells.push(new Cell(y, _));
                    }
                }
            }
            // 收集95号符号
            for (let y = 0; y < 5; y++) {
                for (let _ = 0; _ < 3; _++) {
                    const symbolId = lastHistoryWindows.GetWindow(y).getSymbol(_);
                    const cell = new Cell(y, _);
                    const targetReelIndex = 3 * targetCell.col + targetCell.row;
                    const currentReelIndex = 3 * y + _;

                    if (symbolId === 95 && (currentReelIndex < targetReelIndex || !this.hasCell(this._targetCells, y, _))) {
                        rCells.push(cell);
                    }
                }
            }
        }

        // 奖励累加变量
        let O = 0;
        // 奖励更新回调
        const updatePrize = (symbolInfo: SymbolInfo|any) => {
            // 移除原有锁符号
            const lockNode = self._lockNodes[targetCell.col][targetCell.row];
            if (lockNode) {
                const symbolComp = lockNode.getComponent(Symbol);
                if (symbolComp) {
                    SymbolPoolManager.instance.releaseSymbol(symbolComp);
                } else {
                    const symbolAniComp = lockNode.getComponent(SymbolAni);
                    if (symbolAniComp) {
                        SymbolPoolManager.instance.releaseSymbolAni(lockNode);
                    }
                }
                lockNode.removeFromParent(true);
                self._lockNodes[targetCell.col][targetCell.row] = null;
                self._resultInfos[targetCell.col][targetCell.row] = null;
            }

            // 计算奖励金额（支持固定金币）
            let prize = symbolInfo.prize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
            if (TSUtility.isValid(symbolInfo) && symbolInfo.prizeUnit === "FixedCoin") {
                prize = symbolInfo.prize;
            }
            O += prize;

            // 创建奖励符号动画
            const symbolAniNode = SymbolPoolManager.instance.getSymbolAni(targetSymbolId + 201);
            self.lock_Node!.addChild(symbolAniNode);
            
            const symbolAniComp = symbolAniNode.getComponent(SymbolAni);
            if (symbolAniComp) symbolAniComp.playAnimation();
            
            const jackpotComp = symbolAniNode.getComponent(JackpotSymbolComponent_BeeLovedJars);
            if (jackpotComp) jackpotComp.addPrize(O);

            // 设置符号位置
            const posX = -2 * self._width + self._width * targetCell.col;
            const posY = self._height - self._height * targetCell.row;
            symbolAniNode.setPosition(new cc.Vec2(posX, posY));

            // 保存节点并播放音效
            self._lockNodes[targetCell.col][targetCell.row] = symbolAniNode;
            SlotSoundController.Instance().playAudio("AlivePrize", "FX");
        };

        // 计算总奖励并更新顶部UI
        const calculateTotalPrize = () => {
            let totalPrize = 0;
            // 累加91号符号奖励
            for (let n = 0; n < aCells.length; n++) {
                const cell = aCells[n];
                const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[cell.col][cell.row];
                let prize = symbolInfo.prize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                if (TSUtility.isValid(symbolInfo) && symbolInfo.prizeUnit === "FixedCoin") {
                    prize = symbolInfo.prize;
                }
                totalPrize += prize;
            }
            // 累加93号符号奖励
            for (let n = 0; n < iCells.length; n++) {
                const cell = iCells[n];
                const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[cell.col][cell.row];
                let prize = symbolInfo.prize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                if (TSUtility.isValid(symbolInfo) && symbolInfo.prizeUnit === "FixedCoin") {
                    prize = symbolInfo.prize;
                }
                totalPrize += prize;
            }
            // 累加95号符号奖励
            for (let n = 0; n < rCells.length; n++) {
                const cell = rCells[n];
                const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[cell.col][cell.row];
                let prize = symbolInfo.prize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                if (TSUtility.isValid(symbolInfo) && symbolInfo.prizeUnit === "FixedCoin") {
                    prize = symbolInfo.prize;
                }
                totalPrize += prize;
            }
            // 累加95/93号符号奖励
            for (let n = 0; n < uCells.length; n++) {
                const cell = uCells[n];
                const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[cell.col][cell.row];
                let prize = symbolInfo.prize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                if (TSUtility.isValid(symbolInfo) && symbolInfo.prizeUnit === "FixedCoin") {
                    prize = symbolInfo.prize;
                }
                totalPrize += prize;
            }
            // 累加目标单元格奖励
            const targetSymbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[targetCell.col][targetCell.row];
            let targetPrize = targetSymbolInfo.prize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
            if (TSUtility.isValid(targetSymbolInfo) && targetSymbolInfo.prizeUnit === "FixedCoin") {
                targetPrize = targetSymbolInfo.prize;
            }
            totalPrize += targetPrize;

            // 更新顶部UI黄色罐子标签
            const topUIComp = BeeLovedJarsManager.getInstance().game_components.lockNRollTopUI.getComponent(LockNRollTopUIComponent_BeeLovedJars);
            topUIComp.setYellowJarsLabel(totalPrize);
        };

        // 遍历收集91号符号
        let R = 0; // aCells索引
        let M = 0; // iCells索引
        let P = 0; // rCells索引

        const collectACells = () => {
            if (++R < aCells.length) {
                self.singleCollect(targetCell, aCells[R], updatePrize, collectACells);
            } else {
                this.scheduleOnce(() => {
                    if (iCells.length > 0) {
                        self.singleCollect(targetCell, iCells[M], updatePrize, collectICells);
                    } else if (rCells.length > 0) {
                        self.singleCollect(targetCell, rCells[P], updatePrize, collectRCells);
                    } else {
                        calculateTotalPrize();
                        if (TSUtility.isValid(callback)) callback();
                    }
                }, 1);
            }
        };

        // 遍历收集93号符号
        const collectICells = () => {
            if (++M < iCells.length) {
                self.singleCollect(targetCell, iCells[M], updatePrize, collectICells);
            } else {
                const delay = iCells.length > 0 ? 1 : 0;
                this.scheduleOnce(() => {
                    if (rCells.length > 0) {
                        self.singleCollect(targetCell, rCells[P], updatePrize, collectRCells);
                    } else {
                        calculateTotalPrize();
                        if (TSUtility.isValid(callback)) callback();
                    }
                }, delay);
            }
        };

        // 遍历收集95号符号
        const collectRCells = () => {
            if (++P < rCells.length) {
                self.singleCollect(targetCell, rCells[P], updatePrize, collectRCells);
            } else {
                const delay = rCells.length > 0 ? 1 : 0;
                this.scheduleOnce(() => {
                    calculateTotalPrize();
                    if (TSUtility.isValid(callback)) callback();
                }, delay);
            }
        };

        // 开始收集91号符号
        this.singleCollect(targetCell, aCells[R], updatePrize, collectACells);
    }

    /**
     * 单个单元格收集处理
     * @param targetCell 目标单元格
     * @param collectCell 收集单元格
     * @param updatePrize 奖励更新回调
     * @param callback 收集完成后的回调
     */
    singleCollect(targetCell: Cell, collectCell: Cell, updatePrize: (info: SymbolInfo) => void, callback: () => void): void {
        if (!this.lock_Node) {
            callback();
            return;
        }

        // 释放并移除原有锁符号
        const lockNode = this._lockNodes[collectCell.col][collectCell.row];
        if (lockNode) {
            const symbolComp = lockNode.getComponent(Symbol);
            if (symbolComp) {
                SymbolPoolManager.instance.releaseSymbol(symbolComp);
            } else {
                const symbolAniComp = lockNode.getComponent(SymbolAni);
                if (symbolAniComp) {
                    SymbolPoolManager.instance.releaseSymbolAni(lockNode);
                }
            }
            lockNode.removeFromParent(true);
            this._lockNodes[collectCell.col][collectCell.row] = null;
            this._resultInfos[collectCell.col][collectCell.row] = null;
        }

        // 创建收集符号动画
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const symbolId = lastHistoryWindows.GetWindow(collectCell.col).getSymbol(collectCell.row);
        const symbolAniNode = SymbolPoolManager.instance.getSymbolAni(symbolId + 199);
        const symbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[collectCell.col][collectCell.row];

        // 添加到锁节点并设置信息/动画/位置
        this.lock_Node.addChild(symbolAniNode);
        const jackpotComp = symbolAniNode.getComponent(JackpotSymbolComponent_BeeLovedJars);
        if (jackpotComp) jackpotComp.setInfo(symbolInfo);
        
        const symbolAniComp = symbolAniNode.getComponent(SymbolAni);
        if (symbolAniComp) symbolAniComp.playAnimation();

        const posX = -2 * this._width + this._width * collectCell.col;
        const posY = this._height - this._height * collectCell.row;
        symbolAniNode.setPosition(new cc.Vec2(posX, posY));

        // 保存节点和信息
        this._lockNodes[collectCell.col][collectCell.row] = symbolAniNode;
        this._resultInfos[collectCell.col][collectCell.row] = symbolInfo;

        // 执行收集移动动画
        if (this.collectMove_Node) {
            this.collectMove_Node.moveJackPrizeCollect(
                targetCell, collectCell, this._resultInfos[collectCell.col][collectCell.row],
                updatePrize, () => {
                    if (TSUtility.isValid(callback)) callback();
                }
            );
        } else {
            if (TSUtility.isValid(callback)) callback();
        }
    }

    /**
     * 重置锁符号的Z轴层级
     */
    resetZorder(): void {
        if (!this.lock_Node) return;

        for (let e = 0; e < 5; e++) {
            for (let t = 0; t < 3; t++) {
                const lockNode = this._lockNodes[e][t];
                if (lockNode) {
                    lockNode.setSiblingIndex(lockNode.parent!.childrenCount - 1);
                }
            }
        }
    }

    /**
     * 获取空闲符号ID
     * @param symbolId 原始符号ID
     * @returns 空闲符号ID
     */
    getIdleID(symbolId: number): number | undefined {
        if (symbolId === 90 || symbolId === 91) return 191;
        if (symbolId === 92 || symbolId === 93) return 193;
        if (symbolId === 94 || symbolId === 95) return 195;
        return undefined;
    }

    /**
     * 获取出现符号ID
     * @param symbolId 原始符号ID
     * @returns 出现符号ID
     */
    getAppearID(symbolId: number): number | undefined {
        if (symbolId === 90 || symbolId === 91) return 190;
        if (symbolId === 92 || symbolId === 93) return 192;
        if (symbolId === 94 || symbolId === 95) return 194;
        if (symbolId === 96) return 196;
        if (symbolId === 97) return 197;
        return undefined;
    }
}