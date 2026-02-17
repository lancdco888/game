
import Reel from '../../Slot/Reel';
import SlotUIRuleManager from '../../Slot/rule/SlotUIRuleManager';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SymbolPoolManager from '../../manager/SymbolPoolManager';
import ReelCurvedEffect from '../49_Super25Deluxe/ReelCurvedEffect';
import JackpotSymbol_SharkAttack from './JackpotSymbol_SharkAttack';
import Symbol from '../../Slot/Symbol';

const { ccclass, property } = cc._decorator;

/**
 * Jackpot符号信息接口（适配setSymbolInfo参数）
 */
interface JackpotSymbolInfo {
    [key: string]: any; // 兼容原游戏的任意符号信息结构
}

/**
 * 鲨鱼攻击游戏专属滚轮组件
 * 继承自Reel，负责符号创建/更新/替换、旋转时长计算、特殊符号显隐控制
 */
@ccclass('Reel_SharkAttack')
export default class Reel_SharkAttack extends Reel {
    // 滚轮旋转状态标记
    public _isSpinning: boolean = false;

    /**
     * 失效并重建滚轮符号（核心初始化逻辑）
     * @param symbolIdList 符号ID列表
     * @param startIndex 起始索引
     * @param reelCol 滚轮列数
     * @param windowData 窗口数据
     * @param symbolInfoList 符号信息列表（可选）
     */
    invalidate(
        symbolIdList: number[],
        startIndex: number,
        reelCol: number,
        windowData?: { size: number; getSymbol: (index: number) => number } | null,
        symbolInfoList?: JackpotSymbolInfo[] | null
    ): void {
        this.reelCol = reelCol;
        
        // 特殊符号索引校正逻辑（0值符号匹配）
        if (windowData != null && symbolIdList.indexOf(0) !== -1) {
            const midSymbol = windowData[(windowData.size - this.visibleRow) / 2];
            let currentSymbol = symbolIdList[startIndex % symbolIdList.length];
            while ((currentSymbol !== 0 && midSymbol === 0) || (currentSymbol === 0 && midSymbol !== 0)) {
                startIndex++;
                currentSymbol = symbolIdList[startIndex % symbolIdList.length];
            }
        }

        // 遍历创建滚轮符号节点（包含可见行+缓冲行）
        for (let r = this.visibleRow + this.bufferRow - 1; r >= -this.bufferRow; --r) {
            // 计算符号ID（优先取窗口数据，其次取列表数据）
            let symbolId = symbolIdList[(symbolIdList.length + startIndex + r) % symbolIdList.length];
            if (windowData != null) {
                const windowMid = (this.visibleRow - windowData.size) / 2;
                const windowMax = this.visibleRow - 1 + (windowData.size - this.visibleRow) / 2;
                if (r >= windowMid && r <= windowMax) {
                    symbolId = windowData.getSymbol(r + (windowData.size - this.visibleRow) / 2);
                }
            }

            // 获取符号信息（Jackpot符号专用）
            let symbolInfo: JackpotSymbolInfo | null = null;
            if (symbolInfoList != null) {
                const infoMid = (this.visibleRow - symbolInfoList.length) / 2;
                const infoMax = this.visibleRow - 1 + (symbolInfoList.length - this.visibleRow) / 2;
                if (r >= infoMid && r <= infoMax) {
                    symbolInfo = symbolInfoList[r + (symbolInfoList.length - this.visibleRow) / 2];
                }
            }

            // 创建符号节点并配置
            const symbolNode = this.getSymbolNodeSharkAttack(symbolId, symbolInfo);
            this.node.addChild(symbolNode);
            
            // Scatter符号（51）显隐控制：前5个滚轮隐藏，后5个显示
            symbolNode.active = this.reelindex < 5 ? (symbolId !== 51) : (symbolId === 51);

            // 应用特效组件（波浪/曲面效果）
            const waveEffect = this.node.getComponent("WaveEffect") as any;
            waveEffect && waveEffect._use();
            const curvedEffect = this.node.getComponent(ReelCurvedEffect);
            curvedEffect && curvedEffect.setProgram(symbolNode);

            // 设置符号位置并加入数组
            symbolNode.setPosition(0, -this.symbolHeight * r);
            this.symbolArray.splice(0, 0, symbolNode);
        }

        // 重置所有符号的层级
        this.resetAllSiblingIndex();
    }

    /**
     * 帧更新：处理滚轮旋转时的符号滚动逻辑
     */
    update(): void {
        if (!this._getNextSymbolId) return;

        // 向下旋转逻辑
        if (this.directionSpinReel === Reel.SPINDIRECTION_DOWN) {
            let lastSymbolNode = this.symbolArray[this.symbolArray.length - 1];
            while (this.getPositionY(lastSymbolNode.y) < -this.symbolHeight * (this.visibleRow + this.bufferRow / 2)) {
                const lastSymbol = this.getLastSymbol();
                const nextSymbolId = this._getNextSymbolId();
                const nextSymbolInfo = this._getNextSymbolInfo ? this._getNextSymbolInfo() : null;

                if (nextSymbolId === undefined) break;

                // 创建新符号节点
                const newSymbolNode = this.getSymbolNode(nextSymbolId, nextSymbolInfo);
                newSymbolNode.x = 0;
                newSymbolNode.y = lastSymbol.node.y + this.symbolHeight;
                this.node.addChild(newSymbolNode);
                
                // Scatter符号显隐控制
                newSymbolNode.active = this.reelindex < 5 ? (nextSymbolId !== 51) : (nextSymbolId === 51);

                // 设置符号层级
                const lastZOrder = lastSymbol.zOrder;
                const newZOrder = newSymbolNode.getComponent(Symbol)!.zOrder;
                if (!this.symbolsReverseOrder) {
                    if (lastZOrder >= newZOrder) newSymbolNode.setSiblingIndex(lastSymbol.node.getSiblingIndex());
                } else {
                    if (lastZOrder > newZOrder) newSymbolNode.setSiblingIndex(lastSymbol.node.getSiblingIndex());
                }

                // 应用Shader并更新符号数组
                this.applyShader(newSymbolNode);
                this.symbolArray.pop();
                this.symbolArray.splice(0, 0, newSymbolNode);

                // 释放旧符号
                this.node.removeChild(lastSymbolNode);
                lastSymbolNode.parent = null;
                SymbolPoolManager.instance.releaseSymbol(lastSymbolNode.getComponent(Symbol)!);

                lastSymbolNode = this.symbolArray[this.symbolArray.length - 1];
            }
        }
        // 向上旋转逻辑
        else if (this.directionSpinReel === Reel.SPINDIRECTION_UP) {
            let firstSymbolNode = this.symbolArray[0];
            while (this.getPositionY(firstSymbolNode.y) > this.symbolHeight * (this.bufferRow / 2)) {
                const firstSymbol = this.getFirstSymbolForOppositionReel();
                const nextSymbolId = this._getNextSymbolId();
                const nextSymbolInfo = this._getNextSymbolInfo ? this._getNextSymbolInfo() : null;

                if (nextSymbolId === undefined) break;

                // 创建新符号节点
                const newSymbolNode = this.getSymbolNode(nextSymbolId, nextSymbolInfo);
                newSymbolNode.x = 0;
                newSymbolNode.y = firstSymbol.node.y - this.symbolHeight;
                this.node.addChild(newSymbolNode);
                
                // Scatter符号显隐控制
                newSymbolNode.active = this.reelindex < 5 ? (nextSymbolId !== 51) : (nextSymbolId === 51);

                // 设置符号层级
                const firstZOrder = firstSymbol.zOrder;
                const newZOrder = newSymbolNode.getComponent(Symbol)!.zOrder;
                if (!this.symbolsReverseOrder) {
                    if (firstZOrder >= newZOrder) newSymbolNode.setSiblingIndex(firstSymbol.node.getSiblingIndex());
                } else {
                    if (firstZOrder > newZOrder) newSymbolNode.setSiblingIndex(firstSymbol.node.getSiblingIndex());
                }

                // 应用Shader并更新符号数组
                this.applyShader(newSymbolNode);
                this.symbolArray.splice(0, 1);
                this.symbolArray.push(newSymbolNode);

                // 释放旧符号
                this.node.removeChild(firstSymbolNode);
                firstSymbolNode.parent = null;
                SymbolPoolManager.instance.releaseSymbol(firstSymbolNode.getComponent(Symbol)!);

                firstSymbolNode = this.symbolArray[0];
            }
        }
    }

    /**
     * 获取符号节点（通用逻辑，含Wild/Jackpot符号替换）
     * @param symbolId 符号ID
     * @param symbolInfo 符号信息（可选）
     * @returns 符号节点
     */
    getSymbolNode(symbolId: number, symbolInfo?: JackpotSymbolInfo | null): cc.Node {
        // 空符号ID替换为随机虚拟符号
        if (symbolId === -1 || symbolId === 0) {
            const dummySymbols = [31, 22, 23, 21, 14, 13, 12, 11, 10];
            symbolId = dummySymbols[Math.floor(Math.random() * dummySymbols.length)];
        }

        // Wild符号统一替换为71（72/73→71），Jackpot符号替换为90（91→90）
        if (symbolId === 72 || symbolId === 73) symbolId = 71;
        if (symbolId === 91) symbolId = 90;

        // 从对象池获取符号节点
        const symbolNode = SymbolPoolManager.instance.getSymbol(symbolId);
        if (!TSUtility.isValid(symbolNode)) {
            cc.error("not found symbolId: ", symbolId);
        }

        // 设置Jackpot符号信息
        const jackpotComp = symbolNode.getComponent(JackpotSymbol_SharkAttack);
        if (jackpotComp) {
            if (symbolInfo != null) {
                jackpotComp.setSymbolInfo(symbolInfo);
            } else {
                jackpotComp.setDummySymbolInfo();
            }
        }

        return symbolNode;
    }

    /**
     * 获取滚轮旋转时长（含鲨鱼期望效果特殊处理）
     * @param subGameKey 子游戏Key
     * @returns 旋转时长（秒）
     */
    getReelSpinTime(subGameKey: string): number {
        let spinTime = 0;
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[this.reelindex % 5];
        
        const totalTimeInExpectEffect = spinControlInfo.totalTimeInExpectEffect;
        const oneSymbolMoveSpeed = spinControlInfo.oneSymbolMoveSpeed;
        const spinSymbolCnt = spinControlInfo.spinSymbolCnt;
        const speedFactors = [1, 0.7, 0.5]; // 速度因子（对应不同FastMode）

        // 判断是否触发鲨鱼期望效果
        if (this.getExpectSharkEffectFlag(SlotGameResultManager.Instance.getLastHistoryWindows())) {
            // 第2列滚轮额外增加1.5秒，其他列按速度因子计算
            if (this.reelindex % 5 === 2) {
                spinTime = totalTimeInExpectEffect + 1.5;
            } else {
                spinTime = totalTimeInExpectEffect * speedFactors[SlotUIRuleManager.Instance.getFastMode()];
            }
        }
        // 普通期望效果
        else if (SlotUIRuleManager.Instance.getExpectEffectFlag(this.reelindex % 5, SlotGameResultManager.Instance.getLastHistoryWindows())) {
            spinTime = totalTimeInExpectEffect * speedFactors[SlotUIRuleManager.Instance.getFastMode()];
        }
        // 基础旋转时长
        else {
            spinTime = oneSymbolMoveSpeed * spinSymbolCnt;
        }

        return spinTime;
    }

    /**
     * 获取滚轮停止时长（后缓动时长）
     * @param subGameKey 子游戏Key
     * @returns 停止时长（秒）
     */
    getReelStopTime(subGameKey: string): number {
        let stopTime = 0;
        if (subGameKey != null) {
            const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[this.reelindex % 5];
            stopTime = spinControlInfo.postEasingDuration;
        }
        return stopTime;
    }

    /**
     * 判断是否触发鲨鱼期望效果
     * @param windowData 窗口数据
     * @returns 是否触发
     */
    getExpectSharkEffectFlag(windowData: { GetWindow: (index: number) => { size: number; getSymbol: (row: number) => number } }): boolean {
        // 前2列滚轮不触发
        if (this.reelindex % 5 < 2) return false;

        // 检查前2列是否有Wild符号（71/72/73）
        for (let t = 0; t < 2; ++t) {
            const reelWindow = windowData.GetWindow(t);
            let wildCount = 0;
            for (let a = 0; a < reelWindow.size; ++a) {
                const symbolId = reelWindow.getSymbol(a);
                if (this.isWild(symbolId)) wildCount++;
            }
            if (wildCount === 0) return false;
        }

        return true;
    }

    /**
     * 判断是否为Wild符号
     * @param symbolId 符号ID
     * @returns 是否为Wild
     */
    isWild(symbolId: number): boolean {
        return symbolId === 71 || symbolId === 72 || symbolId === 73;
    }

    /**
     * 获取鲨鱼攻击游戏专属符号节点（无Wild/Jackpot替换）
     * @param symbolId 符号ID
     * @param symbolInfo 符号信息（可选）
     * @returns 符号节点
     */
    getSymbolNodeSharkAttack(symbolId: number, symbolInfo?: JackpotSymbolInfo | null): cc.Node {
        // 空符号ID替换为随机虚拟符号
        if (symbolId === -1 || symbolId === 0) {
            const dummySymbols = [31, 22, 23, 21, 14, 13, 12, 11, 10];
            symbolId = dummySymbols[Math.floor(Math.random() * dummySymbols.length)];
        }

        // 从对象池获取符号节点
        const symbolNode = SymbolPoolManager.instance.getSymbol(symbolId);
        if (!TSUtility.isValid(symbolNode)) {
            cc.error("not found symbolId: ", symbolId);
        }

        // 设置Jackpot符号信息
        const jackpotComp = symbolNode.getComponent(JackpotSymbol_SharkAttack);
        if (jackpotComp) {
            if (symbolInfo != null) {
                jackpotComp.setSymbolInfo(symbolInfo);
            } else {
                jackpotComp.setDummySymbolInfo();
            }
        }

        return symbolNode;
    }

    /**
     * 替换指定行的符号（鲨鱼攻击游戏专用）
     * @param row 目标行索引
     * @param newSymbolId 新符号ID
     * @param symbolInfo 符号信息（可选）
     */
    changeSymbolSharkAttack(row: number, newSymbolId: number, symbolInfo: JackpotSymbolInfo | null = null): void {
        for (let a = 0; a < this.symbolArray.length; ++a) {
            const symbolNode = this.symbolArray[a];
            // 匹配目标行的符号位置
            if (symbolNode.y <= -row * this.symbolHeight && symbolNode.y > -(row + 1) * this.symbolHeight) {
                // 创建新符号节点
                const newSymbolNode = this.getSymbolNodeSharkAttack(newSymbolId, symbolInfo);
                const siblingIndex = symbolNode.getSiblingIndex();

                // 配置新符号位置和层级
                newSymbolNode.x = symbolNode.x;
                newSymbolNode.y = symbolNode.y;
                this.node.insertChild(newSymbolNode, siblingIndex);
                newSymbolNode.active = true;
                this.applyShader(newSymbolNode);

                // 替换符号数组并释放旧符号
                symbolNode.removeFromParent();
                this.symbolArray.splice(a, 1, newSymbolNode);
                this.resetAllSiblingIndex();
                SymbolPoolManager.instance.releaseSymbol(symbolNode.getComponent(Symbol)!);

                break;
            }
        }
    }

    /**
     * 在滚轮顶部添加符号
     * @param symbolId 符号ID
     * @param symbolInfo 符号信息（可选）
     */
    pushSymbolAtTopOfReel(symbolId: number, symbolInfo: JackpotSymbolInfo | null = null): void {
        const lastSymbol = this.getLastSymbol();
        const newSymbolNode = this.getSymbolNode(symbolId, symbolInfo);

        // 配置新符号位置
        newSymbolNode.x = 0;
        newSymbolNode.y = lastSymbol.node.y + this.symbolHeight;
        this.node.addChild(newSymbolNode);
        
        // Scatter符号显隐控制
        newSymbolNode.active = this.reelindex < 5 ? (symbolId !== 51) : (symbolId === 51);

        // 设置符号层级
        if (lastSymbol.zOrder >= newSymbolNode.getComponent(Symbol)!.zOrder) {
            newSymbolNode.setSiblingIndex(lastSymbol.node.getSiblingIndex());
        }

        // 应用Shader并更新符号数组
        this.applyShader(newSymbolNode);
        const oldSymbolNode = this.symbolArray[this.symbolArray.length - 1];
        this.symbolArray.pop();
        this.symbolArray.splice(0, 0, newSymbolNode);

        // 释放旧符号
        this.node.removeChild(oldSymbolNode);
        oldSymbolNode.parent = null;
        SymbolPoolManager.instance.releaseSymbol(oldSymbolNode.getComponent(Symbol)!);
    }

    /**
     * 替换滚轮外的Scatter符号（防止重复显示）
     * @param symbolList 符号列表
     */
    changeSymbolOutOfReel(symbolList: number[]): void {
        const scatterIndex = symbolList.indexOf(51);
        const firstSymbolId = this.symbolArray[0].getComponent(Symbol)!.symbolId;

        // 列表前7位有Scatter且第一个符号也是Scatter时替换
        if (scatterIndex > -1 && scatterIndex < 7 && firstSymbolId === 51) {
            const oldSymbolNode = this.symbolArray[0];
            const newSymbolNode = this.getSymbolNode(-1, null);
            const siblingIndex = oldSymbolNode.getSiblingIndex();

            // 配置新符号位置和层级
            newSymbolNode.x = oldSymbolNode.x;
            newSymbolNode.y = oldSymbolNode.y;
            this.node.insertChild(newSymbolNode, siblingIndex);
            newSymbolNode.active = this.reelindex < 5 ? true : false;
            this.applyShader(newSymbolNode);

            // 替换符号数组并释放旧符号
            oldSymbolNode.removeFromParent();
            this.symbolArray.splice(0, 1, newSymbolNode);
            this.resetAllSiblingIndex();
            SymbolPoolManager.instance.releaseSymbol(oldSymbolNode.getComponent(Symbol)!);
        }
    }

    /**
     * 隐藏指定行的符号
     * @param row 目标行索引
     * @returns 是否成功隐藏
     */
    hideSymbolInRow(row: number): boolean {
        let isHidden = false;
        for (let o = 0; o < this.symbolArray.length; ++o) {
            const symbolNode = this.symbolArray[o];
            // 匹配目标行的符号位置
            if (symbolNode.y <= -row * this.symbolHeight && symbolNode.y > -(row + 1) * this.symbolHeight) {
                symbolNode.active = false;
                isHidden = true;
                break;
            }
        }
        return isHidden;
    }

    /**
     * 判断符号是否应该显示（Scatter符号专属规则）
     * @param symbolId 符号ID
     * @returns 是否显示
     */
    isShow(symbolId: number): boolean {
        // 前5个滚轮隐藏Scatter，后5个显示Scatter
        return this.reelindex < 5 ? (symbolId !== 51) : (symbolId === 51);
    }

    /**
     * 显示指定行的符号
     * @param row 目标行索引
     */
    showSymbolInRow(row: number): void {
        for (let n = 0; n < this.symbolArray.length; ++n) {
            const symbolNode = this.symbolArray[n];
            const symbolId = symbolNode.getComponent(Symbol)!.symbolId;
            
            // 匹配目标行且符合显示规则时显示
            if (this.isShow(symbolId) && symbolNode.y <= -row * this.symbolHeight && symbolNode.y > -(row + 1) * this.symbolHeight) {
                symbolNode.active = true;
                break;
            }
        }
    }

    /**
     * 设置所有符号的颜色
     * @param color 目标颜色
     */
    setSymbolColor(color: cc.Color): void {
        for (let t = 0; t < this.symbolArray.length; ++t) {
            this.symbolArray[t].color = color;
        }
    }

    /**
     * 设置所有符号的暗化状态
     * @param isActive 是否激活暗化
     */
    setSymbolsDimmActive(isActive: boolean): void {
        for (let t = 0; t < this.symbolArray.length; ++t) {
            this.symbolArray[t].getComponent(Symbol)!.setDimmActive(isActive);
        }
    }

    /**
     * 显示所有符合规则的符号
     */
    showAllSymbol(): void {
        for (let t = 0; t < this.symbolArray.length; ++t) {
            const symbolNode = this.symbolArray[t];
            const symbolId = symbolNode.getComponent(Symbol)!.symbolId;
            symbolNode.active = this.isShow(symbolId);
        }
    }
}