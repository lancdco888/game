
// 导入暮光龙专属 Jackpot 符号组件
import SymbolAni from "../../Slot/SymbolAni";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager from "../../manager/SlotGameResultManager";
import SymbolPoolManager, { SymbolInfo } from "../../manager/SymbolPoolManager";
import JackpotSymbol_TwilightDragon from "./JackpotSymbol_TwilightDragon";

const { ccclass } = cc._decorator;


/**
 * 暮光龙（Twilight Dragon）免费旋转符号动画层
 * 继承自 cc.Component，管控免费旋转模式下符号动画的绘制、播放、排序与资源释放
 */
@ccclass()
export default class FreeSpinSymbolAniLayer_TwilightDragon extends cc.Component {
    // ======================================
    // 私有属性：存储符号节点与动画信息的映射表
    // ======================================
    private _info: { [key: string]: any } = {};

    // ======================================
    // 核心方法：绘制最后一轮游戏窗口的符号（还原上一轮中奖符号）
    // ======================================
    public drawLastWindow(): void {
        // 1. 获取子游戏密钥与对应的游戏状态
        const subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        let subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);

        // 2. 若当前子游戏无最后窗口数据，切换到基础模式（base）的游戏状态
        if (!subGameState?.lastWindows || subGameState.lastWindows.length === 0) {
            subGameState = SlotGameResultManager.Instance.getSubGameState("base");
        }

        // 3. 遍历最后一轮窗口数据，播放符合条件的符号动画（>=91 为特殊中奖符号）
        const lastWindows = subGameState?.lastWindows || [];
        for (let colIndex = 0; colIndex < lastWindows.length; colIndex++) {
            const rowArr = lastWindows[colIndex];
            for (let rowIndex = 0; rowIndex < rowArr.length; rowIndex++) {
                const symbolValue = rowArr[rowIndex];
                // 仅对值 >=91 的符号播放停留动画
                if (symbolValue >= 91) {
                    this.playSymbolAnimation(colIndex, rowIndex, true, "J1_Stay");
                }
            }
        }
    }

    // ======================================
    // 核心方法：播放指定位置的符号动画
    // ======================================
    public playSymbolAnimation(
        colIndex: number, 
        rowIndex: number, 
        isBaseMode: boolean, 
        animKey: string
    ): void {
        // 1. 构建符号唯一标识（列_行），用于映射表存储
        const symbolKey = `${colIndex}_${rowIndex}`;

        // 2. 从符号池获取指定 ID（1092）的符号动画节点（原逻辑固定符号 ID）
        const symbolNode = SymbolPoolManager.instance.getSymbolAni(1092);
        if (!symbolNode || this._info[symbolKey]) {
            return; // 节点无效或已存在，直接返回
        }

        // 3. 获取符号动画组件并播放指定动画
        const symbolAniComponent = symbolNode.getComponent(SymbolAni);
        if (symbolAniComponent) {
            symbolAniComponent.playAnimation(animKey);
        }

        // 4. 将符号节点添加到当前层，并设置坐标
        this.node.addChild(symbolNode);
        symbolNode.x = 175 * (colIndex - 1);
        symbolNode.y = 111 * (1 - rowIndex);

        // 5. 存储符号信息到映射表
        this._info[symbolKey] = {
            symbolNode: symbolNode,
            animationKey: animKey
        };

        // 6. 获取子游戏状态，设置 Jackpot 符号信息
        const gameMode = isBaseMode ? "base" : "freeSpin";
        const subGameState = SlotGameResultManager.Instance.getSubGameState(gameMode);
        const symbolInfo = subGameState?.lastSymbolInfoWindow?.[colIndex]?.[rowIndex];
        
        if (symbolInfo) {
            const jackpotSymbolComponent = symbolNode.getComponent(JackpotSymbol_TwilightDragon);
            if (jackpotSymbolComponent) {
                jackpotSymbolComponent.setSymbolInfo(symbolInfo);
            }
        }

        // 7. 排序符号节点（保证层级正确）
        this.sortLockSymbol();
        this.sortLockSymbolByRowIndex();
    }

    // ======================================
    // 辅助方法：按 X 坐标排序符号节点（横向层级调整）
    // ======================================
    public sortLockSymbol(): void {
        // 判空：节点无效则不执行排序
        if (!TSUtility.isValid(this.node)) {
            return;
        }

        // 按 X 坐标倒序排序（X 小的节点在上方，避免遮挡）
        this.node.children.sort((nodeA, nodeB) => {
            const xA = Math.floor(nodeA.position.x);
            const xB = Math.floor(nodeB.position.y);
            return xA < xB ? 1 : -1;
        });
    }

    // ======================================
    // 辅助方法：按 Y 坐标排序符号节点（纵向层级调整）
    // ======================================
    public sortLockSymbolByRowIndex(): void {
        // 判空：节点无效则不执行排序
        if (!TSUtility.isValid(this.node)) {
            return;
        }

        // 按 Y 坐标倒序排序（Y 小的节点在上方，避免遮挡）
        this.node.children.sort((nodeA, nodeB) => {
            const yA = Math.floor(nodeA.position.y);
            const yB = Math.floor(nodeB.position.y);
            return yA < yB ? 1 : -1;
        });
    }

    // ======================================
    // 核心方法：释放所有符号动画节点（回收至符号池）
    // ======================================
    public releaseAllSymbolAnimation(): void {
        // 遍历映射表，释放所有符号节点
        for (const key in this._info) {
            const symbolInfo = this._info[key];
            if (symbolInfo.symbolNode) {
                SymbolPoolManager.instance.releaseSymbolAni(symbolInfo.symbolNode);
            }
        }

        // 清空映射表，释放内存
        this._info = {};
    }

    // ======================================
    // 核心方法：按指定位置释放单个符号动画节点
    // ======================================
    public releaseSymbolAnimationByKey(colIndex: number, rowIndex: number): void {
        // 1. 构建符号唯一标识
        const symbolKey = `${colIndex}_${rowIndex}`;
        const symbolInfo = this._info[symbolKey];

        // 2. 若符号存在，回收至符号池并删除映射
        if (symbolInfo && symbolInfo.symbolNode) {
            SymbolPoolManager.instance.releaseSymbolAni(symbolInfo.symbolNode);
            delete this._info[symbolKey];
        }
    }
}