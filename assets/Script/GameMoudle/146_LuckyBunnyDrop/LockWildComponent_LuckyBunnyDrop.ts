const { ccclass, property } = cc._decorator;


import TSUtility from '../../global_utility/TSUtility';
import SymbolPoolManager from '../../manager/SymbolPoolManager';
import WildSymbolComponent_LuckyBunnyDrop from './WildSymbolComponent_LuckyBunnyDrop';
import Symbol from '../../Slot/Symbol';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotManager from '../../manager/SlotManager';
import SlotSoundController from '../../Slot/SlotSoundController';
import SymbolAni from '../../Slot/SymbolAni';
import Reel from '../../Slot/Reel';

/**
 * LuckyBunnyDrop 锁Wild组件
 */
@ccclass()
export default class LockWildComponent_LuckyBunnyDrop extends cc.Component {
    // 锁Wild的节点数组（对应5列3行共15个位置）
    @property([cc.Node])
    public lock_Nodes: cc.Node[] = [];

    // 私有变量：上一次剩余计数
    private _prev_remainCounts: number[] = [];
    // 私有变量：当前剩余计数
    private _remainCounts: number[] = [];

    /**
     * 初始化组件
     */
    public initComponent(): void {
        for (let e = 0; e < 15; e++) {
            this._prev_remainCounts.push(0);
            this._remainCounts.push(0);
            this.clearNode(this.lock_Nodes[e]);
        }
    }

    /**
     * 获取指定列已填充的Wild数量
     * @param col 列索引（0-4）
     * @returns 已填充的Wild数量
     */
    public getFilledWildCount(col: number): number {
        let count = 0;
        for (let n = 0; n < this.lock_Nodes.length; n++) {
            // 按列分组：Math.floor(n/3) 对应列索引（0-4）
            if (Math.floor(n / 3) === col && this.lock_Nodes[n].childrenCount > 0) {
                count++;
            }
        }
        return count;
    }

    /**
     * 获取Wild的剩余计数信息
     */
    public getWildInfo(): void {
        // 保存上一次的剩余计数
        for (let e = 0; e < 15; e++) {
            const t = this._remainCounts[e];
            this._prev_remainCounts[e] = t;
        }

        // 获取当前每线投注额
        const currentBetPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
        // 获取免费旋转子游戏状态的扩展数据
        const freeSpinExData = SlotGameResultManager.Instance.getSubGameState("freeSpin").exDataWithBetPerLine;
        let selectedCell = null;

        // 读取选中单元格数据
        if (freeSpinExData && freeSpinExData[currentBetPerLine]) {
            selectedCell = freeSpinExData[currentBetPerLine].exDatas.selectedCell;
        }

        // 遍历5列3行共15个位置，初始化剩余计数
        for (let e = 0; e < 5; ++e) {
            for (let i = 0; i < 3; ++i) {
                const idx = 3 * e + i;
                if (TSUtility.isValid(selectedCell) && TSUtility.isValid(selectedCell.datas)) {
                    const cellData = selectedCell.datas[idx];
                    this._remainCounts[idx] = TSUtility.isValid(cellData) ? Number(cellData.gauge) : 0;
                } else {
                    this._remainCounts[idx] = 0;
                }
            }
        }
    }

    /**
     * 固定窗口符号（基础版）
     * @param windowData 窗口符号数据
     */
    public fixedWindow(windowData: number[][]): void {
        this.getWildInfo();
        if (TSUtility.isValid(windowData)) {
            for (let t = 0; t < 5; ++t) {
                for (let n = 0; n < 3; ++n) {
                    const symbolId = windowData[t][n];
                    // 符号ID在71-90之间（排除边界）时修复符号，否则清空节点
                    if (symbolId < 90 && symbolId > 71) {
                        this.fixSymbol(t, n);
                    } else {
                        this.clearNode(this.lock_Nodes[3 * t + n]);
                    }
                }
            }
        }
    }

    /**
     * 修复指定位置的Wild符号
     * @param col 列索引（0-4）
     * @param row 行索引（0-2）
     * @returns 是否成功修复符号
     */
    public fixSymbol(col: number, row: number): boolean {
        let isFixed = false;
        const idx = 3 * col + row;
        
        // 剩余计数大于1时才创建Wild符号
        if (this._remainCounts[idx] > 1) {
            // 从符号池获取72号Wild符号
            const wildSymbol = SymbolPoolManager.instance.getSymbol(72);
            if (TSUtility.isValid(wildSymbol)) {
                // 重置符号节点属性
                wildSymbol.scale = 1;
                wildSymbol.opacity = 255;
                wildSymbol.x = 0;
                wildSymbol.y = 0;
                // 添加到对应锁节点下
                this.lock_Nodes[idx].addChild(wildSymbol);
                
                // 设置Wild组件的计数
                const wildComp = wildSymbol.getComponent(WildSymbolComponent_LuckyBunnyDrop);
                if (TSUtility.isValid(wildComp) && this._remainCounts[idx] > 0) {
                    wildComp.setCount(this._remainCounts[idx] - 1);
                }
                isFixed = true;
            }
        }
        return isFixed;
    }

    /**
     * 修复窗口符号（带动画版）
     * @param windowData 窗口符号数据
     * @param callback 修复完成后的回调函数
     */
    public fixWindow(windowData: number[][], callback?: Function): void {
        this.getWildInfo();
        
        const reelMachine = SlotManager.Instance.reelMachine;
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        let isAnyFixed = false;

        if (TSUtility.isValid(windowData)) {
            for (let i = 0; i < 5; ++i) {
                for (let c = 0; c < 3; ++c) {
                    const symbolId = windowData[i][c];
                    // 匹配Wild相关符号ID（72-76）
                    if ([72, 73, 74, 75, 76].includes(symbolId)) {
                        if (this.fixSymbolAni(i, c)) {
                            // 获取卷轴组件并修改符号
                            const reelComp = reelMachine.reels[i].getComponent(Reel);
                            if (TSUtility.isValid(reelComp)) {
                                reelComp.changeSymbol(c, symbolId);
                                // 设置Wild组件计数
                                const wildSymbol = reelComp.getSymbol(c);
                                const wildComp = wildSymbol.getComponent(WildSymbolComponent_LuckyBunnyDrop);
                                if (TSUtility.isValid(wildComp)) {
                                    wildComp.setCount(nextSubGameKey === "base" ? 0 : this._remainCounts[3 * i + c] - 1);
                                }
                            }
                            isAnyFixed = true;
                        }
                    } else {
                        this.clearNode(this.lock_Nodes[3 * i + c]);
                    }
                }
            }
        }

        // 播放音效并执行回调
        if (isAnyFixed) {
            SlotSoundController.Instance().playAudio("WildAppear", "FX");
            this.scheduleOnce(() => {
                TSUtility.isValid(callback) && callback();
            }, 1);
        } else {
            TSUtility.isValid(callback) && callback();
        }
    }

    /**
     * 修复带动画的Wild符号
     * @param col 列索引（0-4）
     * @param row 行索引（0-2）
     * @returns 是否成功修复动画符号
     */
    public fixSymbolAni(col: number, row: number): boolean {
        const idx = 3 * col + row;
        const prevCount = this._prev_remainCounts[idx];
        const currCount = this._remainCounts[idx];
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();

        // 计数有变化时才处理
        if (prevCount !== currCount) {
            this.clearNode(this.lock_Nodes[idx]);
            
            // 确定动画符号ID：77（首次出现）/78（计数变化）
            const aniSymbolId = prevCount === 0 ? 77 : 78;
            // 从符号池获取动画符号
            const aniSymbol = SymbolPoolManager.instance.getSymbolAni(aniSymbolId);
            
            if (TSUtility.isValid(aniSymbol)) {
                // 重置动画符号属性
                aniSymbol.scale = 1;
                aniSymbol.opacity = 255;
                aniSymbol.x = 0;
                aniSymbol.y = 0;
                
                // 设置Wild组件的变化值
                const wildComp = aniSymbol.getComponent(WildSymbolComponent_LuckyBunnyDrop);
                if (TSUtility.isValid(wildComp)) {
                    if (aniSymbolId === 77) {
                        wildComp.setChange(0);
                    } else {
                        wildComp.setChange(currCount - 1);
                    }
                }
                
                // 添加到对应锁节点下
                this.lock_Nodes[idx].addChild(aniSymbol);
                return true;
            }
        }
        return false;
    }

    /**
     * 清空指定节点的所有子节点（并释放符号到池）
     * @param node 要清空的节点
     */
    public clearNode(node: cc.Node): void {
        if (!TSUtility.isValid(node)) return;
        
        const childCount = node.childrenCount;
        for (let n = 0; n < childCount; ++n) {
            const child = node.children[0]; // 每次取第一个（移除后后续会前移）
            if (TSUtility.isValid(child)) {
                // 释放Symbol或SymbolAni到对象池
                const symbolComp = child.getComponent(Symbol);
                if (TSUtility.isValid(symbolComp)) {
                    SymbolPoolManager.instance.releaseSymbol(symbolComp);
                } else {
                    const symbolAniComp = child.getComponent(SymbolAni);
                    if (TSUtility.isValid(symbolAniComp)) {
                        SymbolPoolManager.instance.releaseSymbolAni(child);
                    }
                }
            }
        }
        // 移除所有子节点
        node.removeAllChildren();
    }

    /**
     * 显示锁Wild组件
     */
    public showLockWild(): void {
        this.node.active = true;
    }

    /**
     * 隐藏锁Wild组件（并清空剩余计数为1的节点）
     */
    public hideLockWild(): void {
        for (let e = 0; e < 5; e++) {
            for (let t = 0; t < 3; t++) {
                const idx = 3 * e + t;
                if (this._remainCounts[idx] === 1) {
                    this.clearNode(this.lock_Nodes[idx]);
                }
            }
        }
        this.node.active = false;
    }

    /**
     * 检查指定位置是否已固定Wild符号
     * @param col 列索引（0-4）
     * @param row 行索引（0-2）
     * @returns 是否已固定
     */
    public isFixed(col: number, row: number): boolean {
        const idx = 3 * col + row;
        return this.lock_Nodes[idx]?.childrenCount > 0 || false;
    }
}