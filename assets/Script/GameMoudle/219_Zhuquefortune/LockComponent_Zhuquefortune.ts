import SymbolPoolManager from "../../manager/SymbolPoolManager";
import Symbol from "../../Slot/Symbol";
import ZhuquefortuneManager from "./ZhuquefortuneManager";
import JackpotSymbolComponent_Zhuquefortune from "./JackpotSymbolComponent_Zhuquefortune";
import SymbolAni from "../../Slot/SymbolAni";
import ReelMachine_Zhuquefortune from "./ReelMachine_Zhuquefortune";
import SlotManager from "../../manager/SlotManager";
import RemainCountComponent_Zhuquefortune from "./RemainCountComponent_Zhuquefortune";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import TSUtility from "../../global_utility/TSUtility";
import SlotSoundController from "../../Slot/SlotSoundController";
import UIComponent_Zhuquefortune from "./UIComponent_Zhuquefortune";
import BottomUIText, { BottomTextType } from "../../SubGame/BottomUIText";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";
import LockNRollUpgradeFX_Zhuquefortune from "./LockNRollUpgradeFX_Zhuquefortune";
import CaculateComponent_Zhuquefortune from "./CaculateComponent_Zhuquefortune";
import Reel from "../../Slot/Reel";
import LockMovePotComponent_Zhuquefortune from "./LockMovePotComponent_Zhuquefortune";
import SpecialSymbolComponent_Zhuquefortune from "./SpecialSymbolComponent_Zhuquefortune";

const { ccclass, property } = cc._decorator;

// 定义 Cell 类型（对应 SlotGameResultManager.Cell）
interface Cell {
    col: number;
    row: number;
}

/**
 * 朱雀运势 Lock 核心组件
 * 负责锁符号管理、奖金计算、Jackpot 收集、特效播放、节点层级重置等核心业务
 */
@ccclass("LockComponent_Zhuquefortune")
export default class LockComponent_Zhuquefortune extends cc.Component {
    // 锁符号根节点（所有锁符号都添加到该节点下）
    @property(cc.Node)
    public lock_Node: cc.Node | null = null;

    // 收集特效节点
    @property(cc.Node)
    public collectFX_Node: cc.Node | null = null;

    // 升级特效组件（保留原代码拼写 upgreade → upgrade，避免影响业务调用）
    @property(LockNRollUpgradeFX_Zhuquefortune)
    public upgreadeFX: LockNRollUpgradeFX_Zhuquefortune | null = null;

    // Jackpot 收集移动组件
    @property(LockMovePotComponent_Zhuquefortune)
    public collectMove_Node: LockMovePotComponent_Zhuquefortune | null = null;

    // 奖金计算移动组件
    @property(CaculateComponent_Zhuquefortune)
    public caculateMove_Node: CaculateComponent_Zhuquefortune | null = null;

    // 私有变量：5x3 锁符号节点二维数组（对应 5 列 3 行卷轴）
    private _lockNodes: (cc.Node | null)[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];

    // 私有变量：5x3 结果信息二维数组（存储对应位置的奖金/符号信息）
    private _resultInfos: (any | null)[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];

    // 私有常量：符号节点宽度（用于坐标计算）
    private _width: number = 152;

    // 私有常量：符号节点高度（用于坐标计算）
    private _height: number = 142;

    // 私有变量：总获胜奖金金额
    private _winMoney: number = 0;

    // 私有变量：追加奖金金额
    private _addPrize: number = 0;

    // 私有变量：Jackpot 结果数组
    private _jackpotResult: any[] = [];

    /**
     * 清除所有已填充的符号（释放资源、重置二维数组）
     */
    public clearFilledSymbols(): void {
        if (!this.lock_Node) return;

        // 1. 释放所有子节点的 Symbol/SymbolAni 资源
        const childCount = this.lock_Node.childrenCount;
        for (let i = 0; i < childCount; ++i) {
            const childNode = this.lock_Node.children[0]; // 每次取第一个（移除后后续节点前移）
            if (!childNode) continue;

            // 释放 Symbol 组件资源
            const symbolComp = childNode.getComponent(Symbol);
            if (symbolComp) {
                SymbolPoolManager.instance.releaseSymbol(symbolComp);
            }

            // 释放 SymbolAni 组件资源
            const symbolAniComp = childNode.getComponent(SymbolAni);
            if (symbolAniComp) {
                SymbolPoolManager.instance.releaseSymbolAni(childNode);
            }
        }

        // 2. 移除所有子节点（销毁节点，释放内存）
        this.lock_Node.removeAllChildren(true);

        // 3. 重置 5x3 二维数组（清空锁节点和结果信息）
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                this._lockNodes[col][row] = null;
                this._resultInfos[col][row] = null;
            }
        }
    }

    /**
     * 无特效修复窗口（遍历窗口设置锁符号，不播放额外特效）
     * @param windowSymbols 窗口符号数组
     * @param resultInfos 结果信息数组
     */
    public fixWindowNoneEffect(windowSymbols: number[][], resultInfos: any[][]): void {
        if (!this.lock_Node) return;

        // 遍历 5 列 3 行，设置锁符号（仅处理 90/100 开头的符号）
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const symbolValue = windowSymbols[col][row];
                const symbolType = Math.floor(symbolValue / 10);

                // 仅处理 9（Jackpot）或 10（特殊锁符号）类型的符号
                if (symbolType === 9 || symbolType === 10) {
                    this.setLockSymbol(col, row, symbolValue, resultInfos[col][row]);
                }
            }
        }

        // 重置节点显示层级
        this.resetZorder();
    }

    /**
     * 无特效修复首个窗口（将 10 类型符号转为 90 类型设置锁符号）
     * @param windowSymbols 窗口符号数组
     * @param resultInfos 结果信息数组
     */
    public fixFirstWindowNoneEffect(windowSymbols: number[][], resultInfos: any[][]): void {
        if (!this.lock_Node) return;

        // 遍历 5 列 3 行，将 10 类型符号转为 90 类型设置锁符号
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const symbolValue = windowSymbols[col][row];
                const symbolType = Math.floor(symbolValue / 10);

                // 仅处理 10 类型符号，转为 90 类型设置
                if (symbolType === 10) {
                    this.setLockSymbol(col, row, 90, resultInfos[col][row]);
                }
            }
        }

        // 重置节点显示层级
        this.resetZorder();
    }

    /**
     * 设置锁符号（实例化 SymbolAni、设置位置、播放动画、关联卷轴）
     * @param col 列索引（0-4）
     * @param row 行索引（0-2）
     * @param symbolValue 符号值
     * @param resultInfo 对应结果信息
     */
    public setLockSymbol(col: number, row: number, symbolValue: number, resultInfo: any): void {
        // 已存在锁符号则直接返回，避免重复创建
        if (this._lockNodes[col][row] !== null || !this.lock_Node) return;

        // 1. 计算卷轴索引（3*列 + 行）
        const reelIndex = 3 * col + row;
        const zhuquefortuneManager = ZhuquefortuneManager.getInstance();
        if (!zhuquefortuneManager) return;

        // 2. 获取 Jackpot 符号 ID，根据符号值调整
        let jackpotSymbolID = zhuquefortuneManager.game_components.getjackpotSymbolID();
        const symbolType = Math.floor(symbolValue / 10);
        if (symbolType === 10) {
            jackpotSymbolID = 100;
        } else {
            jackpotSymbolID += 100;
        }

        // 3. 从对象池获取 SymbolAni 实例
        const symbolAniNode = SymbolPoolManager.instance.getSymbolAni(jackpotSymbolID);
        if (!symbolAniNode) return;

        // 4. 处理 Jackpot 符号信息（9 类型符号设置结果信息）
        if (symbolType === 9) {
            const jackpotSymbolComp = symbolAniNode.getComponent(JackpotSymbolComponent_Zhuquefortune);
            if (jackpotSymbolComp) {
                jackpotSymbolComp.setInfo(resultInfo);
            }
        }

        // 5. 添加到锁节点、设置位置、播放动画
        this.lock_Node.addChild(symbolAniNode);
        const posX = -2 * this._width + this._width * col;
        const posY = this._height - this._height * row;
        symbolAniNode.setPosition(new cc.Vec2(posX, posY));

        const symbolAniComp = symbolAniNode.getComponent(SymbolAni);
        if (symbolAniComp) {
            symbolAniComp.playAnimation();
        }

        // 6. 关联锁节点数组、隐藏对应卷轴节点
        this._lockNodes[col][row] = symbolAniNode;
        this._resultInfos[col][row] = resultInfo;

        const reelMachine = SlotManager.Instance.reelMachine.getComponent(ReelMachine_Zhuquefortune);
        if (reelMachine && reelMachine.lockNRoll_Reels[reelIndex]) {
            reelMachine.lockNRoll_Reels[reelIndex].node.active = false;
        }
    }

    /**
     * 设置出现的符号（实例化 SymbolAni、播放对应音效、重置剩余计数 UI）
     * @param col 列索引（0-4）
     * @param row 行索引（0-2）
     * @param symbolValue 符号值
     */
    public setAppearSymbol(col: number, row: number, symbolValue: number): void {
        // 已存在锁符号则直接返回，避免重复创建
        if (this._lockNodes[col][row] !== null || !this.lock_Node) return;

        // 1. 重置剩余计数 UI
        const zhuquefortuneManager = ZhuquefortuneManager.getInstance();
        if (zhuquefortuneManager && zhuquefortuneManager.game_components.remainCount) {
            const remainCountComp = zhuquefortuneManager.game_components.remainCount.getComponent(RemainCountComponent_Zhuquefortune);
            if (remainCountComp) {
                remainCountComp.resetUI();
            }
        }

        // 2. 从对象池获取 SymbolAni 实例（符号值 + 5 偏移）
        const symbolAniNode = SymbolPoolManager.instance.getSymbolAni(symbolValue + 5);
        if (!symbolAniNode) return;

        // 3. 添加到锁节点、设置位置
        this.lock_Node.addChild(symbolAniNode);
        const posX = -2 * this._width + this._width * col;
        const posY = this._height - this._height * row;
        symbolAniNode.setPosition(new cc.Vec2(posX, posY));

        // 4. 处理符号类型，播放对应音效和设置信息
        const symbolType = Math.floor(symbolValue / 10);
        if (symbolType === 9) {
            // Jackpot 符号：设置结果信息、播放专属音效
            const resultSymbolInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[col][row];
            let appearInfo = resultSymbolInfo;

            // 解析扩展映射字符串，覆盖结果信息（如需）
            if (zhuquefortuneManager && TSUtility.isValid(zhuquefortuneManager.parseExMapString())) {
                appearInfo = zhuquefortuneManager.parseExMapString()[col][row];
            }

            const jackpotSymbolComp = symbolAniNode.getComponent(JackpotSymbolComponent_Zhuquefortune);
            if (jackpotSymbolComp) {
                jackpotSymbolComp.setInfo(appearInfo);
            }

            // 停止并重新播放 Jackpot 出现音效
            SlotSoundController.Instance().stopAudio("JackpotAppear", "FX");
            SlotSoundController.Instance().playAudio("JackpotAppear", "FX");

            // 保存结果信息
            this._resultInfos[col][row] = appearInfo;
        } else {
            // 特殊符号：播放普通出现音效
            SlotSoundController.Instance().playAudio("SpecialAppear", "FX");
        }

        // 5. 播放符号动画、关联锁节点数组
        const symbolAniComp = symbolAniNode.getComponent(SymbolAni);
        if (symbolAniComp) {
            symbolAniComp.playAnimation();
        }

        this._lockNodes[col][row] = symbolAniNode;

        // 6. 重置节点显示层级
        this.resetZorder();
    }

    /**
     * 计算旋转结果（遍历 5x3 格子，逐个计算奖金并更新底部文本）
     * @param onComplete 计算完成后的回调函数
     */
    public CalculateSpin(onComplete?: () => void): void {
        const zhuquefortuneManager = ZhuquefortuneManager.getInstance();

        let count = 0;
        let col = 0;
        let row = 0;
        this._winMoney = 0;

        // 1. 获取总获胜奖金和符号信息窗口
        const totalWinMoney = SlotGameResultManager.Instance.getTotalWinMoney();
        const symbolInfoWindow = SlotGameResultManager.Instance.getSpinResult().symbolInfoWindow;

        // 2. 无奖金直接执行回调
        if (totalWinMoney <= 0) {
            if (TSUtility.isValid(onComplete)) {
                onComplete();
            }
            return;
        }

        // 3. 定义递归计算单个格子的回调
        const singleCaculateCallback = () => {
            count++;
            col = Math.floor(count / 3);
            row = Math.floor(count % 3);

            // 未遍历完 15 个格子（5x3）继续递归，否则完成计算
            if (count < 15) {
                this.singleCaculate(col, row, symbolInfoWindow[col][row], singleCaculateCallback);
            } else {
                this.scheduleOnce(() => {
                    // 更新底部总获胜奖金文本
                    SlotManager.Instance.bottomUIText.setWinMoney(this._winMoney, "TOTAL WIN");
                    // 清除所有计算动画
                    this.caculateMove_Node.clearAllAnis();
                    // 执行完成回调
                    if (TSUtility.isValid(onComplete)) {
                        onComplete!();
                    }
                }, 1);
            }
        };

        // 4. 获取计算 UI 并延迟启动递归计算
        if (zhuquefortuneManager.game_components.uiComponent) {
            const uiComp = zhuquefortuneManager.game_components.uiComponent.getComponent(UIComponent_Zhuquefortune);
            if (uiComp) {
                uiComp.getCaculateZhuque();
            }
        }

        this.scheduleOnce(() => {
            this.singleCaculate(col, row, symbolInfoWindow[col][row], singleCaculateCallback);
        }, 2);
    }

    /**
     * 单个格子奖金计算（释放旧符号、创建新符号、计算奖金、更新底部文本）
     * @param col 列索引（0-4）
     * @param row 行索引（0-2）
     * @param symbolInfo 符号信息对象
     * @param onComplete 单个格子计算完成后的回调函数
     */
    public singleCaculate(col: number, row: number, symbolInfo: any, onComplete?: () => void): void {
        const zhuquefortuneManager = ZhuquefortuneManager.getInstance();
        if (!this.lock_Node || !this.caculateMove_Node || !zhuquefortuneManager) return;

        // 1. 无效符号信息直接执行回调
        if (!TSUtility.isValid(symbolInfo) || symbolInfo.type === "") {
            if (TSUtility.isValid(onComplete)) {
                onComplete!();
            }
            return;
        }

        // 2. 释放并移除旧锁符号
        const oldLockNode = this._lockNodes[col][row];
        if (oldLockNode !== null) {
            // 释放 Symbol/SymbolAni 资源
            const symbolComp = oldLockNode.getComponent(Symbol);
            if (symbolComp) {
                SymbolPoolManager.instance.releaseSymbol(symbolComp);
            }

            const symbolAniComp = oldLockNode.getComponent(SymbolAni);
            if (symbolAniComp) {
                SymbolPoolManager.instance.releaseSymbolAni(oldLockNode);
            }

            // 从父节点移除并重置数组
            oldLockNode.removeFromParent(true);
            this._lockNodes[col][row] = null;
            this._resultInfos[col][row] = null;
        }

        // 3. 获取结果信息和 Jackpot 符号 ID
        const resultInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[col][row];
        const jackpotSymbolID = zhuquefortuneManager.game_components.getjackpotSymbolID() + 200;

        // 4. 从对象池获取新 SymbolAni 实例并配置
        const newSymbolAniNode = SymbolPoolManager.instance.getSymbolAni(jackpotSymbolID);
        if (!newSymbolAniNode) return;

        const jackpotSymbolComp = newSymbolAniNode.getComponent(JackpotSymbolComponent_Zhuquefortune);
        if (jackpotSymbolComp) {
            jackpotSymbolComp.setInfo(resultInfo);
        }

        // 5. 添加到锁节点、设置位置、播放动画
        this.lock_Node.addChild(newSymbolAniNode);
        const posX = -2 * this._width + this._width * col;
        const posY = this._height - this._height * row;
        newSymbolAniNode.setPosition(new cc.Vec2(posX, posY));

        const symbolAniComp = newSymbolAniNode.getComponent(SymbolAni);
        if (symbolAniComp) {
            symbolAniComp.playAnimation();
        }

        // 6. 关联锁节点和结果信息数组
        this._lockNodes[col][row] = newSymbolAniNode;
        this._resultInfos[col][row] = resultInfo;

        // 7. 查找当前格子的获胜结果
        const spinResult = SlotGameResultManager.Instance.getSpinResult();
        let winningResult = null;
        for (let i = 0; i < spinResult.lockNRollResults.length; i++) {
            const result = spinResult.lockNRollResults[i];
            if (result.winningCellX === col && result.winningCellY === row) {
                winningResult = result;
                break;
            }
        }

        // 8. 获取对应卷轴并执行奖金计算移动动画
        const reelIndex = 3 * col + row;
        const reelMachine = SlotManager.Instance.reelMachine.getComponent(ReelMachine_Zhuquefortune);
        if (!reelMachine || !reelMachine.lockNRoll_Reels[reelIndex]) return;

        const reelNode = reelMachine.lockNRoll_Reels[reelIndex].node;
        this.caculateMove_Node.moveJackpotCalculate(reelNode, resultInfo, () => {
            if (!winningResult) return;

            // 9. 更新总获胜奖金并播放数字变化动画
            const currentWinMoney = this._winMoney;
            this._winMoney += winningResult.winningCoin;

            const bottomUIText = SlotManager.Instance.bottomUIText;
            bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "TOTAL WIN");
            bottomUIText.playChangeWinMoney(currentWinMoney, this._winMoney, () => {}, false, 0.5);
        });

        // 10. 延迟重置层级并执行回调
        this.scheduleOnce(() => {
            this.resetZorder();
            if (TSUtility.isValid(onComplete)) {
                onComplete!();
            }
        }, 0.5);
    }

    /**
     * 收集 Jackpot（查找目标格子、播放收集特效、逐个收集符号、升级界面）
     * @param onComplete 收集完成后的回调函数
     */
    public CollectJackpot(onComplete?: () => void): void {
        const zhuquefortuneManager = ZhuquefortuneManager.getInstance();
        if (!this.lock_Node || !this.collectFX_Node || !this.collectMove_Node || !zhuquefortuneManager) return;

        let targetCell: Cell | null = null;
        const toCollectCells: Cell[] = [];

        // 1. 查找目标格子（10 类型符号）和待收集格子（9 类型符号）
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const symbolValue = lastHistoryWindows.GetWindow(col).getSymbol(row);
                const symbolType = Math.floor(symbolValue / 10);

                if (symbolType === 10) {
                    targetCell = { col, row };
                } else if (symbolType === 9) {
                    toCollectCells.push({ col, row });
                }
            }
        }

        // 无目标格子直接返回
        if (!targetCell) return;

        // 2. 释放并移除目标格子的旧锁符号
        const targetOldLockNode = this._lockNodes[targetCell.col][targetCell.row];
        if (targetOldLockNode !== null) {
            const symbolComp = targetOldLockNode.getComponent(Symbol);
            if (symbolComp) {
                SymbolPoolManager.instance.releaseSymbol(symbolComp);
            }

            const symbolAniComp = targetOldLockNode.getComponent(SymbolAni);
            if (symbolAniComp) {
                SymbolPoolManager.instance.releaseSymbolAni(targetOldLockNode);
            }

            targetOldLockNode.removeFromParent(true);
            this._lockNodes[targetCell.col][targetCell.row] = null;
            this._resultInfos[targetCell.col][targetCell.row] = null;
        }

        // 3. 创建目标格子新符号并播放收集出现特效
        const targetSymbolAniNode = SymbolPoolManager.instance.getSymbolAni(200);
        if (!targetSymbolAniNode) return;

        this.lock_Node.addChild(targetSymbolAniNode);
        const posX = -2 * this._width + this._width * targetCell.col;
        const posY = this._height - this._height * targetCell.row;
        targetSymbolAniNode.setPosition(new cc.Vec2(posX, posY));

        const symbolAniComp = targetSymbolAniNode.getComponent(SymbolAni);
        if (symbolAniComp) {
            symbolAniComp.playAnimation();
        }

        this._lockNodes[targetCell.col][targetCell.row] = targetSymbolAniNode;

        // 播放收集出现特效
        this.collectFX_Node.active = true;
        const collectAnimComp = this.collectFX_Node.getComponent(cc.Animation);
        if (collectAnimComp) {
            collectAnimComp.stop();
            collectAnimComp.setCurrentTime(0);
            collectAnimComp.play("J3_Recieve_Fx_Appear_Ani");
        }
        this.collectFX_Node.setPosition(new cc.Vec2(posX, posY));

        // 4. 定义变量和回调函数
        let collectCount = 0;
        let totalAddPrize = 0;

        // 单个收集完成后的奖金更新回调
        const onSingleCollectComplete = (jackpotInfo: any) => {
            // 计算最终奖金（结合每线投注）
            let prize = jackpotInfo.prize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
            if (TSUtility.isValid(jackpotInfo) && jackpotInfo.prizeUnit === "FixedCoin") {
                prize = jackpotInfo.prize;
            }
            totalAddPrize += prize;

            // 释放并移除目标格子旧符号，创建新符号显示总奖金
            const targetLockNode = this._lockNodes[targetCell.col][targetCell.row];
            if (targetLockNode !== null) {
                const symbolComp = targetLockNode.getComponent(Symbol);
                if (symbolComp) {
                    SymbolPoolManager.instance.releaseSymbol(symbolComp);
                }

                const symbolAniComp = targetLockNode.getComponent(SymbolAni);
                if (symbolAniComp) {
                    SymbolPoolManager.instance.releaseSymbolAni(targetLockNode);
                }

                targetLockNode.removeFromParent(true);
                this._lockNodes[targetCell.col][targetCell.row] = null;
                this._resultInfos[targetCell.col][targetCell.row] = null;
            }

            // 创建新符号显示总追加奖金
            const newPrizeSymbolNode = SymbolPoolManager.instance.getSymbolAni(300);
            if (newPrizeSymbolNode) {
                this.lock_Node.addChild(newPrizeSymbolNode);
                newPrizeSymbolNode.setPosition(new cc.Vec2(posX, posY));

                const jackpotSymbolComp = newPrizeSymbolNode.getComponent(JackpotSymbolComponent_Zhuquefortune);
                if (jackpotSymbolComp) {
                    jackpotSymbolComp.addPrize(totalAddPrize);
                }

                const newSymbolAniComp = newPrizeSymbolNode.getComponent(SymbolAni);
                if (newSymbolAniComp) {
                    newSymbolAniComp.playAnimation();
                }

                this._lockNodes[targetCell.col][targetCell.row] = newPrizeSymbolNode;
            }
        };

        // 递归收集所有格子的回调
        const onCollectNext = () => {
            collectCount++;
            if (collectCount < toCollectCells.length) {
                this.singleCollect(targetCell, toCollectCells[collectCount], onSingleCollectComplete, onCollectNext);
            } else {
                // 所有格子收集完成，执行收尾逻辑
                this.scheduleOnce(() => {
                    // 释放并移除目标格子最终符号，创建特殊符号
                    const finalLockNode = this._lockNodes[targetCell.col][targetCell.row];
                    if (finalLockNode !== null) {
                        const symbolComp = finalLockNode.getComponent(Symbol);
                        if (symbolComp) {
                            SymbolPoolManager.instance.releaseSymbol(symbolComp);
                        }

                        const symbolAniComp = finalLockNode.getComponent(SymbolAni);
                        if (symbolAniComp) {
                            SymbolPoolManager.instance.releaseSymbolAni(finalLockNode);
                        }

                        finalLockNode.removeFromParent(true);
                        this._lockNodes[targetCell.col][targetCell.row] = null;
                        this._resultInfos[targetCell.col][targetCell.row] = null;
                    }

                    // 创建特殊符号并设置信息
                    const specialSymbolNode = SymbolPoolManager.instance.getSymbolAni(400);
                    if (specialSymbolNode) {
                        const resultInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[targetCell.col][targetCell.row];
                        this.lock_Node.addChild(specialSymbolNode);
                        specialSymbolNode.setPosition(new cc.Vec2(posX, posY));

                        const specialSymbolComp = specialSymbolNode.getComponent(SpecialSymbolComponent_Zhuquefortune);
                        if (specialSymbolComp) {
                            specialSymbolComp.setChangeInfo(resultInfo);
                        }

                        const specialAniComp = specialSymbolNode.getComponent(SymbolAni);
                        if (specialAniComp) {
                            specialAniComp.playAnimation();
                        }

                        this._lockNodes[targetCell.col][targetCell.row] = specialSymbolNode;
                        this._resultInfos[targetCell.col][targetCell.row] = resultInfo;
                    }

                    // 播放特殊符号音效和收集消失特效
                    SlotSoundController.Instance().playAudio("SpecialChange", "FX");
                    if (collectAnimComp) {
                        collectAnimComp.stop();
                        collectAnimComp.setCurrentTime(0);
                        collectAnimComp.play("J3_Recieve_Fx_Disappear_Ani");
                    }

                    // 显示升级特效、切换背景
                    if (this.upgreadeFX) {
                        this.upgreadeFX.showFX();
                    }

                    if (zhuquefortuneManager.game_components.uiComponent) {
                        const uiComp = zhuquefortuneManager.game_components.uiComponent.getComponent(UIComponent_Zhuquefortune);
                        if (uiComp) {
                            uiComp.changeLockNRollBG();
                        }
                    }

                    // 延迟更新 Jackpot 符号、刷新卷轴
                    this.scheduleOnce(() => {
                        zhuquefortuneManager.game_components.setJackpotSymbolID();
                        const reelMachine = zhuquefortuneManager.reelMachine.getComponent(ReelMachine_Zhuquefortune);
                        if (reelMachine) {
                            reelMachine.updateJackpotSymbolOnReel();
                        }

                        if (zhuquefortuneManager.game_components.uiComponent) {
                            const uiComp = zhuquefortuneManager.game_components.uiComponent.getComponent(UIComponent_Zhuquefortune);
                            if (uiComp) {
                                uiComp.getStartFXZhuque();
                            }
                        }
                    }, 1.5);

                    // 延迟执行完成回调、清除动画、隐藏特效
                    this.scheduleOnce(() => {
                        if (TSUtility.isValid(onComplete)) {
                            onComplete!();
                        }

                        if (this.collectMove_Node) {
                            this.collectMove_Node.clearAllAnis();
                        }

                        this.collectFX_Node.active = false;
                        if (this.upgreadeFX) {
                            this.upgreadeFX.hideFX();
                        }
                    }, 3);
                }, 1);
            }
        };

        // 5. 延迟启动首个格子收集
        this.scheduleOnce(() => {
            if (zhuquefortuneManager.game_components.uiComponent) {
                const uiComp = zhuquefortuneManager.game_components.uiComponent.getComponent(UIComponent_Zhuquefortune);
                if (uiComp) {
                    uiComp.getCollectZhuque();
                }
            }

            this.singleCollect(targetCell, toCollectCells[collectCount], onSingleCollectComplete, onCollectNext);
        }, 1);
    }

    /**
     * 单个格子收集（释放旧符号、更新卷轴、执行收集移动动画）
     * @param targetCell 目标格子
     * @param collectCell 待收集格子
     * @param onCollectComplete 收集完成后的奖金回调
     * @param onNext 继续下一个收集的回调
     */
    public singleCollect(
        targetCell: Cell,
        collectCell: Cell,
        onCollectComplete?: (info: any) => void,
        onNext?: () => void
    ): void {
        if (!this.lock_Node || !this.collectMove_Node) return;

        // 1. 释放并移除待收集格子的旧锁符号
        const oldCollectNode = this._lockNodes[collectCell.col][collectCell.row];
        if (oldCollectNode !== null) {
            const symbolComp = oldCollectNode.getComponent(Symbol);
            if (symbolComp) {
                SymbolPoolManager.instance.releaseSymbol(symbolComp);
            }

            const symbolAniComp = oldCollectNode.getComponent(SymbolAni);
            if (symbolAniComp) {
                SymbolPoolManager.instance.releaseSymbolAni(oldCollectNode);
            }

            oldCollectNode.removeFromParent(true);
            this._lockNodes[collectCell.col][collectCell.row] = null;
        }

        // 2. 更新对应卷轴符号并显示卷轴
        const reelIndex = 3 * collectCell.col + collectCell.row;
        const reelMachine = SlotManager.Instance.reelMachine.getComponent(ReelMachine_Zhuquefortune);
        if (!reelMachine || !reelMachine.lockNRoll_Reels[reelIndex]) return;

        const reelComp = reelMachine.lockNRoll_Reels[reelIndex].getComponent(Reel);
        if (reelComp) {
            reelComp.changeSymbol(-1, 0);
            reelComp.changeSymbol(0, 0);
            reelComp.changeSymbol(1, 0);
        }
        reelMachine.lockNRoll_Reels[reelIndex].node.active = true;

        // 3. 执行 Jackpot 收集移动动画
        const collectInfo = this._resultInfos[collectCell.col][collectCell.row];
        this.collectMove_Node.moveJackpotCollect(
            targetCell,
            collectCell,
            collectInfo,
            onCollectComplete,
            onNext
        );
    }

    /**
     * 重置节点显示层级（确保锁符号正确叠加，避免显示异常）
     */
    public resetZorder(): void {
        if (!this.lock_Node) return;

        // 1. 遍历所有锁节点，设置最顶层显示
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const lockNode = this._lockNodes[col][row];
                if (lockNode !== null && lockNode.parent === this.lock_Node) {
                    lockNode.setSiblingIndex(this.lock_Node.childrenCount - 1);
                }
            }
        }

        // 2. 遍历最后窗口信息，特殊符号额外提升层级
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const subGameState = SlotGameResultManager.Instance.getSubGameState(currentSubGameKey);
        const lastWindows = subGameState.lastWindows;

        if (TSUtility.isValid(lastWindows) && lastWindows.length > 0) {
            for (let col = 0; col < 5; col++) {
                for (let row = 0; row < 3; row++) {
                    const lockNode = this._lockNodes[col][row];
                    const windowValue = lastWindows[col][row];

                    // 特殊符号（100-104）额外提升层级
                    if (lockNode !== null && lockNode.parent === this.lock_Node) {
                        if ([100, 101, 102, 103, 104].includes(windowValue)) {
                            lockNode.setSiblingIndex(this.lock_Node.childrenCount - 1);
                        }
                    }
                }
            }
        }
    }
}