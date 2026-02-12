// 游戏专属模块
import SuperSevenBlastsManager from './SuperSevenBlastsManager';
import JakpotSymbol_SuperSevenBlasts from './JakpotSymbol_SuperSevenBlasts'; // 保留原命名（Jackpot拼写错误）
import SymbolPoolManager from '../../manager/SymbolPoolManager';
import Symbol from '../../Slot/Symbol';
import SymbolAni from '../../Slot/SymbolAni';
import TSUtility from '../../global_utility/TSUtility';
import SlotManager from '../../manager/SlotManager';
import Reel from '../../Slot/Reel';
import SlotSoundController from '../../Slot/SlotSoundController';
import SlotGameResultManager, { Cell } from '../../manager/SlotGameResultManager';

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts 游戏专属锁定组件
 * 核心功能：锁定符号管理、Respin 初始化、Jackpot 计数/显示、符号变更动画、列隐藏检查
 * 注意：原代码存在拼写错误（countJakcpot → countJackpot），保留原命名避免业务逻辑冲突
 */
@ccclass()
export default class LockComponent_SuperSevenBlasts extends cc.Component {
    // ========== 编辑器配置属性 ==========
    /** 锁定符号挂载根节点 */
    @property({
        type: cc.Node,
        displayName: "锁定根节点",
        tooltip: "承载所有锁定符号的父节点"
    })
    public lock_Node: cc.Node = null;

    // ========== 状态属性 ==========
    /** 锁定符号节点二维数组 [滚轮索引][行索引] */
    private _lockNodes: (cc.Node)[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];
    /** 锁定符号ID二维数组 [滚轮索引][行索引] */
    public _lockSymbolID: number[][] = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    /** 符号宽度（位置计算） */
    private _width: number = 180;
    /** 符号高度（位置计算） */
    private _height: number = 118;

    // ========== 核心方法 - 符号清理 ==========
    /**
     * 清空所有已填充的锁定符号
     * 释放符号池资源，重置锁定节点和符号ID数组
     */
    public clearFilledSymbols(): void {
        if (!TSUtility.isValid(this.lock_Node)) return;

        // 释放符号池资源
        const childCount = this.lock_Node.childrenCount;
        for (let i = 0; i < childCount; ++i) {
            const childNode = this.lock_Node.children[0];
            if (!TSUtility.isValid(childNode)) continue;

            // 释放Symbol组件
            const symbolComp = childNode.getComponent(Symbol);
            if (symbolComp) {
                SymbolPoolManager.instance.releaseSymbol(symbolComp);
            }
            // 释放SymbolAni组件
            const symbolAniComp = childNode.getComponent(SymbolAni);
            if (symbolAniComp) {
                SymbolPoolManager.instance.releaseSymbolAni(childNode);
            }
        }

        // 清空所有子节点
        this.lock_Node.removeAllChildren(true);

        // 重置锁定节点和符号ID数组
        for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
            for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
                this._lockNodes[reelIdx][rowIdx] = null;
                this._lockSymbolID[reelIdx][rowIdx] = 0;
            }
        }
    }

    // ========== 核心方法 - Respin 初始化 ==========
    /**
     * 修复窗口无效果状态，初始化锁定符号并更新Jackpot基数
     * @param windowData 窗口符号数据二维数组
     */
    public fixWindowNoneEffect(windowData: number[][]): void {
        let totalCount = 0;

        // 遍历所有滚轮和行，初始化锁定符号
        for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
            for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
                let symbolId = windowData[reelIdx][rowIdx];
                if (symbolId > 90) {
                    // 符号ID修正规则（原逻辑保留）
                    if (symbolId > 100) {
                        symbolId -= 10;
                        totalCount += symbolId - 100;
                    } else if (symbolId > 93) {
                        symbolId -= 3;
                        totalCount += symbolId - 93;
                    } else {
                        totalCount += symbolId - 90;
                    }
                    this.setLockSymbol(reelIdx, rowIdx, symbolId);
                }
            }
        }

        // 更新Jackpot基数并检查列隐藏
        SuperSevenBlastsManager.getInstance().game_components.jackpotMoneyDisplay.setBaseCount(totalCount);
        this.checkHideCol();
    }

    /**
     * 开始Respin，初始化锁定符号
     * @param windowData 窗口符号数据二维数组
     */
    public startRespin(windowData: number[][]): void {
        // 遍历所有滚轮和行，初始化锁定符号
        for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
            for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
                let symbolId = windowData[reelIdx][rowIdx];
                if (symbolId > 90) {
                    // 符号ID修正规则（原逻辑保留）
                    symbolId = symbolId > 100 ? symbolId - 10 : (symbolId > 93 ? symbolId - 3 : symbolId);
                    this.setLockSymbol(reelIdx, rowIdx, symbolId);
                }
            }
        }
        this.checkHideCol();
    }

    // ========== 核心方法 - 符号设置/变更 ==========
    /**
     * 设置锁定符号
     * @param reelIdx 滚轮索引（0-4）
     * @param rowIdx 行索引（0-2）
     * @param symbolId 符号ID
     * @returns 是否设置成功（已存在则返回false）
     */
    public setLockSymbol(reelIdx: number, rowIdx: number, symbolId: number): boolean {
        // 已存在锁定符号则返回失败
        if (this._lockNodes[reelIdx][rowIdx] !== null) {
            return false;
        }

        // 从符号池获取Jackpot符号动画（ID=391）
        const symbolAniNode = SymbolPoolManager.instance.getSymbolAni(391);
        if (!TSUtility.isValid(symbolAniNode) || !TSUtility.isValid(this.lock_Node)) {
            return false;
        }

        // 添加符号节点并配置
        this.lock_Node.addChild(symbolAniNode);
        const jakpotSymbolComp = symbolAniNode.getComponent(JakpotSymbol_SuperSevenBlasts);
        if (jakpotSymbolComp) {
            jakpotSymbolComp.showSymbol(symbolId);
        }
        symbolAniNode.setPosition(new cc.Vec2(this._width * reelIdx, this._height * -rowIdx));

        // 更新状态数组
        this._lockNodes[reelIdx][rowIdx] = symbolAniNode;
        this._lockSymbolID[reelIdx][rowIdx] = symbolId;

        // 隐藏滚轮对应行的原始符号
        const reelNode = SlotManager.Instance.reelMachine.reels[reelIdx];
        if (TSUtility.isValid(reelNode)) {
            const reelComp = reelNode.getComponent(Reel);
            if (reelComp) {
                reelComp.hideSymbolInRow(rowIdx);
            }
        }

        return true;
    }

    /**
     * 变更锁定符号（播放动画+音效）
     * @param reelIdx 滚轮索引（0-4）
     * @param rowIdx 行索引（0-2）
     * @param newSymbolId 新符号ID
     */
    public setChangeSymbol(reelIdx: number, rowIdx: number, newSymbolId: number): void {
        // 无锁定符号则报错并返回
        if (this._lockNodes[reelIdx][rowIdx] === null) {
            cc.error("Not Have ChangeSymbol: 滚轮" + reelIdx + "行" + rowIdx + "无锁定符号");
            return;
        }

        // 符号ID修正规则（原逻辑保留）
        const oldSymbolId = this._lockSymbolID[reelIdx][rowIdx];
        const correctedNewId = newSymbolId > 100 ? newSymbolId - 10 : newSymbolId;
        const countDiff = correctedNewId - oldSymbolId;

        // 移除旧符号节点
        this._lockNodes[reelIdx][rowIdx]!.removeFromParent(true);

        // 从符号池获取变更动画符号（ID=393）
        const changeSymbolNode = SymbolPoolManager.instance.getSymbolAni(393);
        if (!TSUtility.isValid(changeSymbolNode) || !TSUtility.isValid(this.lock_Node)) {
            return;
        }

        // 添加变更符号节点并配置
        this.lock_Node.addChild(changeSymbolNode);
        const symbolAniComp = changeSymbolNode.getComponent(SymbolAni);
        if (symbolAniComp) {
            symbolAniComp.playAnimation();
        }
        const jakpotSymbolComp = changeSymbolNode.getComponent(JakpotSymbol_SuperSevenBlasts);
        if (jakpotSymbolComp) {
            jakpotSymbolComp.showAddSymbol(newSymbolId - 102);
        }
        changeSymbolNode.setPosition(new cc.Vec2(this._width * reelIdx, this._height * -rowIdx));

        // 更新状态数组
        this._lockNodes[reelIdx][rowIdx] = changeSymbolNode;
        this._lockSymbolID[reelIdx][rowIdx] = correctedNewId;

        // 隐藏滚轮对应行的原始符号
        const reelNode = SlotManager.Instance.reelMachine.reels[reelIdx];
        if (TSUtility.isValid(reelNode)) {
            const reelComp = reelNode.getComponent(Reel);
            if (reelComp) {
                reelComp.hideSymbolInRow(rowIdx);
            }
        }

        // 播放AddJackpot音效
        SlotSoundController.Instance().playAudio("AddJackpot", "FX");

        // 延迟替换为普通锁定符号
        this.scheduleOnce(() => {
            if (!TSUtility.isValid(this._lockNodes[reelIdx][rowIdx])) return;
            
            // 移除变更符号节点
            this._lockNodes[reelIdx][rowIdx]!.removeFromParent(true);

            // 从符号池获取普通锁定符号（ID=391）
            const normalSymbolNode = SymbolPoolManager.instance.getSymbolAni(391);
            if (!TSUtility.isValid(normalSymbolNode) || !TSUtility.isValid(this.lock_Node)) {
                return;
            }

            // 添加普通符号节点并配置
            this.lock_Node.addChild(normalSymbolNode);
            const jakpotComp = normalSymbolNode.getComponent(JakpotSymbol_SuperSevenBlasts);
            if (jakpotComp) {
                jakpotComp.showSymbol(correctedNewId);
            }
            normalSymbolNode.setPosition(new cc.Vec2(this._width * reelIdx, this._height * -rowIdx));

            // 更新状态数组
            this._lockNodes[reelIdx][rowIdx] = normalSymbolNode;
            
            // 更新Jackpot计数
            SuperSevenBlastsManager.getInstance().game_components.jackpotMoneyDisplay.setBaseCount(countDiff);
        }, 0.5);

        this.checkHideCol();
    }

    /**
     * 添加锁定符号（批量）
     * @param callback 添加完成回调
     */
    public addLockSymbols(callback?: () => void): void {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        let isAdded = false;

        // 遍历所有滚轮和行，添加锁定符号
        for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
            for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
                let symbolId = lastHistoryWindows.GetWindow(reelIdx).getSymbol(rowIdx);
                if (symbolId > 90) {
                    // 符号ID修正规则（原逻辑保留）
                    symbolId = symbolId > 100 ? symbolId - 10 : (symbolId > 93 ? symbolId - 3 : symbolId);
                    if (this.setLockSymbol(reelIdx, rowIdx, symbolId)) {
                        isAdded = true;
                    }
                }
            }
        }

        // 有符号添加则延迟回调，否则立即回调
        if (isAdded) {
            this.scheduleOnce(() => {
                if (TSUtility.isValid(callback) && typeof callback === 'function') {
                    callback();
                }
            }, 1);
        } else if (TSUtility.isValid(callback) && typeof callback === 'function') {
            callback();
        }

        this.checkHideCol();
    }

    // ========== 核心方法 - Jackpot 计数 ==========
    /**
     * 计算Respin阶段的Jackpot计数（核心动画+音效逻辑）
     * @param callback 计数完成回调
     */
    public CalculateRespin(callback?: () => void): void {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const jackpotCells: Cell[] = []; // 包含Jackpot符号的单元格列表
        let totalJackpot = 0; // 总Jackpot数值
        let currentCount = 0; // 当前计数
        let delayRatio = 0; // 延迟比例
        let isFirst = true; // 是否首次计数

        // 收集所有Jackpot符号单元格
        for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
            for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
                const symbolId = lastHistoryWindows.GetWindow(reelIdx).getSymbol(rowIdx);
                // 筛选Jackpot符号（>90）
                if (symbolId > 100 || (symbolId > 93) || (symbolId > 90)) {
                    jackpotCells.push(new Cell(reelIdx, rowIdx));
                }
            }
        }

        // 计数完成递归回调
        let cellIndex = 0;
        const countComplete = () => {
            cellIndex++;
            if (cellIndex < jackpotCells.length) {
                // 获取当前单元格符号ID
                const cell = jackpotCells[cellIndex];
                const symbolId = lastHistoryWindows.GetWindow(cell.col).getSymbol(cell.row);
                
                // 更新延迟比例和当前计数
                const addValue = symbolId > 100 ? symbolId - 100 : symbolId - 90;
                delayRatio = 0.5 / ((totalJackpot += addValue) - currentCount);
                currentCount++;

                // 显示计数UI
                SuperSevenBlastsManager.getInstance().game_components.countUI.appearCount(currentCount, isFirst?1:0, delayRatio, countStep);
                
                // 播放LowCount音效（延迟）
                const soundDelay = isFirst ? 0.35 : 0.24;
                this.scheduleOnce(() => {
                    SlotSoundController.Instance().playAudio("LowCount", "FX");
                }, soundDelay);

                // 单个Jackpot计数
                this.singleCountJackpot(cell.col, cell.row, symbolId, countComplete);
            } else {
                // 所有单元格计数完成，隐藏计数UI并执行回调
                SuperSevenBlastsManager.getInstance().game_components.countUI.hideUI();
                if (TSUtility.isValid(callback) && typeof callback === 'function') {
                    callback();
                }
            }
        };

        // 计数步进回调（补全剩余计数）
        const countStep = () => {
            if (currentCount < totalJackpot) {
                currentCount++;
                SuperSevenBlastsManager.getInstance().game_components.countUI.appearCount(currentCount, isFirst?1:0, delayRatio, countStep);
                
                // 播放LowCount音效（延迟）
                const soundDelay = isFirst ? 0.35 : 0.24;
                this.scheduleOnce(() => {
                    SlotSoundController.Instance().playAudio("LowCount", "FX");
                }, soundDelay);
            }
        };

        // 首次计数初始化
        if (jackpotCells.length > 0) {
            const firstCell = jackpotCells[cellIndex];
            const firstSymbolId = lastHistoryWindows.GetWindow(firstCell.col).getSymbol(firstCell.row);
            
            // 初始化总数值和延迟比例
            const addValue = firstSymbolId > 100 ? firstSymbolId - 100 : firstSymbolId - 90;
            delayRatio = 0.5 / ((totalJackpot += addValue) - currentCount);
            currentCount++;

            // 显示首次计数UI
            SuperSevenBlastsManager.getInstance().game_components.countUI.appearCount(currentCount, isFirst?1:0, delayRatio, countStep);
            
            // 播放LowCount音效（延迟）
            const soundDelay = isFirst ? 0.35 : 0.24;
            this.scheduleOnce(() => {
                SlotSoundController.Instance().playAudio("LowCount", "FX");
            }, soundDelay);

            // 首次计数标记置为false
            isFirst = false;

            // 执行首个单元格计数
            this.singleCountJackpot(firstCell.col, firstCell.row, firstSymbolId, countComplete);
        }
    }

    /**
     * 单个单元格Jackpot计数（带延迟回调）
     * @param reelIdx 滚轮索引
     * @param rowIdx 行索引
     * @param symbolId 符号ID
     * @param callback 计数完成回调
     */
    public singleCountJackpot(reelIdx: number, rowIdx: number, symbolId: number, callback?: () => void): void {
        this.countJakcpot(reelIdx, rowIdx, symbolId); // 保留原拼写错误
        this.scheduleOnce(() => {
            if (TSUtility.isValid(callback) && typeof callback === 'function') {
                callback();
            }
        }, 0.5);
    }

    /**
     * 执行Jackpot计数（替换符号动画）
     * 注意：原代码拼写错误（countJakcpot → countJackpot），保留避免业务冲突
     * @param reelIdx 滚轮索引
     * @param rowIdx 行索引
     * @param symbolId 符号ID
     */
    public countJakcpot(reelIdx: number, rowIdx: number, symbolId: number): void {
        // 移除旧锁定符号
        if (this._lockNodes[reelIdx][rowIdx] !== null) {
            this._lockNodes[reelIdx][rowIdx]!.removeFromParent(true);
            this._lockNodes[reelIdx][rowIdx] = null;
            this._lockSymbolID[reelIdx][rowIdx] = 0;
        }

        // 符号ID修正规则（原逻辑保留）
        const correctedSymbolId = symbolId > 100 ? symbolId - 10 : symbolId;

        // 从符号池获取计数动画符号（ID=392）
        const countSymbolNode = SymbolPoolManager.instance.getSymbolAni(392);
        if (!TSUtility.isValid(countSymbolNode) || !TSUtility.isValid(this.lock_Node)) {
            return;
        }

        // 添加计数符号节点并配置
        this.lock_Node.addChild(countSymbolNode);
        const jakpotSymbolComp = countSymbolNode.getComponent(JakpotSymbol_SuperSevenBlasts);
        if (jakpotSymbolComp) {
            jakpotSymbolComp.showSymbol(correctedSymbolId);
        }
        countSymbolNode.setPosition(new cc.Vec2(this._width * reelIdx, this._height * -rowIdx));

        // 更新状态数组
        this._lockNodes[reelIdx][rowIdx] = countSymbolNode;
        this._lockSymbolID[reelIdx][rowIdx] = correctedSymbolId > 100 ? correctedSymbolId - 10 : correctedSymbolId;

        // 隐藏滚轮对应行的原始符号
        const reelNode = SlotManager.Instance.reelMachine.reels[reelIdx];
        if (TSUtility.isValid(reelNode)) {
            const reelComp = reelNode.getComponent(Reel);
            if (reelComp) {
                reelComp.hideSymbolInRow(rowIdx);
            }
        }
    }

    // ========== 辅助方法 ==========
    /**
     * 检查并隐藏全锁定的滚轮列
     * 逻辑：某列所有行都有锁定符号 → 隐藏该列滚轮节点
     */
    public checkHideCol(): void {
        for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
            let isAllLocked = true;
            // 检查当前列所有行是否都有锁定符号
            for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
                if (this._lockNodes[reelIdx][rowIdx] === null) {
                    isAllLocked = false;
                    break;
                }
            }
            // 全锁定则隐藏滚轮节点
            if (isAllLocked) {
                const reelNode = SlotManager.Instance.reelMachine.reels[reelIdx];
                if (TSUtility.isValid(reelNode)) {
                    reelNode.node.active = false;
                }
            }
        }
    }

    /**
     * 显示Jackpot符号（带出场动画）
     * @param reelIdx 滚轮索引
     * @param rowIdx 行索引
     * @param symbolId 符号ID
     * @returns 是否显示成功（已存在则返回false）
     */
    public AppearJackpotSymbol(reelIdx: number, rowIdx: number, symbolId: number): boolean {
        // 已存在锁定符号则返回失败
        if (this._lockNodes[reelIdx][rowIdx] !== null) {
            return false;
        }

        // 符号ID修正规则（原逻辑保留）
        const correctedSymbolId = symbolId > 100 ? symbolId - 10 : symbolId;

        // 从符号池获取出场动画符号（ID=395）
        const appearSymbolNode = SymbolPoolManager.instance.getSymbolAni(395);
        if (!TSUtility.isValid(appearSymbolNode) || !TSUtility.isValid(this.lock_Node)) {
            return false;
        }

        // 添加出场符号节点并配置
        this.lock_Node.addChild(appearSymbolNode);
        const jakpotSymbolComp = appearSymbolNode.getComponent(JakpotSymbol_SuperSevenBlasts);
        if (jakpotSymbolComp) {
            jakpotSymbolComp.showSymbol(correctedSymbolId);
        }
        appearSymbolNode.setPosition(new cc.Vec2(this._width * reelIdx, this._height * -rowIdx));

        // 更新状态数组
        this._lockNodes[reelIdx][rowIdx] = appearSymbolNode;
        this._lockSymbolID[reelIdx][rowIdx] = correctedSymbolId > 100 ? correctedSymbolId - 10 : correctedSymbolId;

        // 隐藏滚轮对应行的原始符号
        const reelNode = SlotManager.Instance.reelMachine.reels[reelIdx];
        if (TSUtility.isValid(reelNode)) {
            const reelComp = reelNode.getComponent(Reel);
            if (reelComp) {
                reelComp.hideSymbolInRow(rowIdx);
            }
        }

        // 检查列隐藏
        this.checkHideCol();

        // 延迟替换为普通锁定符号
        this.scheduleOnce(() => {
            if (!TSUtility.isValid(this._lockNodes[reelIdx][rowIdx])) return;
            
            // 移除出场符号节点
            this._lockNodes[reelIdx][rowIdx]!.removeFromParent(true);

            // 从符号池获取普通锁定符号（ID=391）
            const normalSymbolNode = SymbolPoolManager.instance.getSymbolAni(391);
            if (!TSUtility.isValid(normalSymbolNode) || !TSUtility.isValid(this.lock_Node)) {
                return;
            }

            // 添加普通符号节点并配置
            this.lock_Node.addChild(normalSymbolNode);
            const jakpotComp = normalSymbolNode.getComponent(JakpotSymbol_SuperSevenBlasts);
            if (jakpotComp) {
                jakpotComp.showSymbol(correctedSymbolId);
            }
            normalSymbolNode.setPosition(new cc.Vec2(this._width * reelIdx, this._height * -rowIdx));

            // 更新状态数组
            this._lockNodes[reelIdx][rowIdx] = normalSymbolNode;
        }, 0.7);

        return true;
    }
}