const { ccclass, property } = cc._decorator;

import Reel from "../../Slot/Reel";
import TSUtility from "../../global_utility/TSUtility";
import SymbolPoolManager from "../../manager/SymbolPoolManager";
import ZhuquefortuneManager from "./ZhuquefortuneManager";
import Symbol from "../../Slot/Symbol";
import SlotUIRuleManager from "../../Slot/rule/SlotUIRuleManager";
import SlotManager from "../../manager/SlotManager";
import JackpotSymbolComponent_Zhuquefortune from "./JackpotSymbolComponent_Zhuquefortune";

/**
 * 朱雀财富滚轮类
 * 继承自基础Reel类，扩展Jackpot符号处理、符号隐藏、旋转时间计算等专属功能
 */
@ccclass()
export default class Reel_Zhuquefortune extends Reel {
    // ===== 公共方法（重写/扩展父类方法，实现朱雀专属滚轮逻辑）=====
    /**
     * 获取指定符号ID对应的节点（处理Jackpot符号特殊逻辑）
     * @param symbolId 符号ID
     * @param info Jackpot符号附加信息
     * @returns 符号节点
     */
    public getSymbolNode(symbolId: number, info: any): cc.Node {
        // 1. 处理Jackpot相关符号ID（以9开头的符号，对应Jackpot符号）
        if (Math.floor(symbolId / 10) === 9) {
            symbolId = ZhuquefortuneManager.getInstance().game_components.getjackpotSymbolID() || symbolId;
        }

        // 2. 符号ID边界处理（大于100强制转为100，避免超出符号池范围）
        if (symbolId > 100) {
            symbolId = 100;
        }

        // 3. 处理空符号ID（转为Jackpot符号ID偏移量）
        if (symbolId === 0) {
            const jackpotSymbolId = ZhuquefortuneManager.getInstance()?.game_components.getjackpotSymbolID() || 90;
            symbolId = jackpotSymbolId - 90;
        }

        // 4. 从符号对象池获取符号节点
        const symbolNode = SymbolPoolManager.instance.getSymbol(symbolId);
        if (!TSUtility.isValid(symbolNode)) {
            return null;
        }

        // 5. 为Jackpot符号设置附加信息
        if (Math.floor(symbolId / 10) === 9) {
            const jackpotSymbolId = ZhuquefortuneManager.getInstance()?.game_components.getjackpotSymbolID() || symbolId;
            const jackpotComp = symbolNode.getComponent(JackpotSymbolComponent_Zhuquefortune);
            if (jackpotComp) {
                jackpotComp.setInfo(info);
            }
        }

        return symbolNode;
    }

    /**
     * 为随机触发效果隐藏指定行的符号
     * @param row 要隐藏的符号行索引
     */
    public hideSymbolInRowForAppear(row: number): void {
        // 计算缓冲区行+目标行的索引（兼容父类的bufferRow属性）
        const symbolIndex = this.bufferRow + row;

        // 校验索引有效性并隐藏符号节点
        if (this.symbolArray && this.symbolArray[symbolIndex] && TSUtility.isValid(this.symbolArray[symbolIndex])) {
            this.symbolArray[symbolIndex].active = false;
        }
    }

    /**
     * 更新滚轮上的所有Jackpot符号（替换旧符号，刷新显示状态）
     */
    public updateJackpotSymbolOnReel(): void {
        if (!this.symbolArray || this.symbolArray.length === 0) {
            return;
        }

        // 1. 获取Jackpot相关配置参数
        const zhuqueManager = ZhuquefortuneManager.getInstance();
        if (!zhuqueManager) {
            return;
        }
        const jackpotSymbolId = zhuqueManager.game_components.getjackpotSymbolID();
        const jackpotSymbolOffset = jackpotSymbolId - 90;

        // 2. 遍历滚轮上的所有符号节点，更新Jackpot相关符号
        for (let i = 0; i < this.symbolArray.length; i++) {
            const currentSymbolNode = this.symbolArray[i];
            if (!TSUtility.isValid(currentSymbolNode)) {
                continue;
            }

            const symbolComp = currentSymbolNode.getComponent(Symbol);
            if (!symbolComp) {
                continue;
            }
            const currentSymbolId = symbolComp.symbolId;

            // 3. 判断是否需要更新（Jackpot符号/小于10的特殊符号）
            const isJackpotSymbol = Math.floor(currentSymbolId / 10) === 9;
            const isSpecialSmallSymbol = currentSymbolId < 10;
            if (!isJackpotSymbol && !isSpecialSmallSymbol) {
                continue;
            }

            // 4. 确定目标符号ID
            let targetSymbolId = jackpotSymbolId;
            if (isSpecialSmallSymbol) {
                targetSymbolId = jackpotSymbolOffset;
            }

            // 5. 从符号池获取新的目标符号节点
            const newSymbolNode = this.getSymbolNode(targetSymbolId, null);
            if (!TSUtility.isValid(newSymbolNode)) {
                continue;
            }

            // 6. 配置新符号节点的位置和层级
            const siblingIndex = currentSymbolNode.getSiblingIndex();
            const parentNode = currentSymbolNode.parent;
            newSymbolNode.setPosition(currentSymbolNode.position);

            // 7. 为Jackpot符号设置附加信息
            if (targetSymbolId > 90) {
                const jackpotComp = newSymbolNode.getComponent(JackpotSymbolComponent_Zhuquefortune);
                jackpotComp?.setInfo(null);
            }

            // 8. 插入新符号节点，移除旧符号节点
            if (TSUtility.isValid(parentNode)) {
                parentNode.insertChild(newSymbolNode, siblingIndex);
            } else {
                this.node.insertChild(newSymbolNode, siblingIndex);
            }
            newSymbolNode.active = true;

            // 9. 应用着色器（继承自父类Reel的方法，处理符号视觉效果）
            this.applyShader(newSymbolNode);

            // 10. 替换符号数组中的节点，释放旧符号到对象池
            currentSymbolNode.removeFromParent();
            this.symbolArray.splice(i, 1, newSymbolNode);
            this.resetAllSiblingIndex(); // 重置所有符号节点的层级索引
            SymbolPoolManager.instance.releaseSymbol(symbolComp);
        }
    }

    /**
     * 计算滚轮旋转时间（支持预期特效时间适配，重写父类逻辑）
     * @param reelArray 滚轮数组
     * @param elapsedTime 已流逝时间
     * @param spinIndex 旋转索引
     * @returns 滚轮旋转总时长（秒）
     */
    getReelSpinTimeRenewal(reelArray: any[], elapsedTime: number, winLineIdx: string): number{
        let targetReelIndex = -1;

        // 1. 查找激活的滚轮索引
        for (let i = 0; i < reelArray.length; i++) {
            const reel = reelArray[i];
            if (reel && reel.node && reel.node.active) {
                targetReelIndex = reel.reelindex;
                break;
            }
        }

        // 2. 初始化旋转时间参数
        let totalTimeInExpectEffect = 0;
        let oneSymbolMoveSpeed = 0;
        let spinSymbolCnt = 0;
        let spinTime = 0;

        // 3. 获取旋转控制配置信息
        const reelIndex = targetReelIndex === this.reelindex ? 0 : this.reelindex;
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(winLineIdx)?.infoList[reelIndex];
        if (spinControlInfo) {
            totalTimeInExpectEffect = spinControlInfo.totalTimeInExpectEffect;
            oneSymbolMoveSpeed = spinControlInfo.oneSymbolMoveSpeed;
            spinSymbolCnt = spinControlInfo.spinSymbolCnt;
        }

        // 4. 判断是否需要应用预期特效时间
        const reelStopWindow = SlotManager.Instance.getReelStopWindow();
        const isExpectEffect = SlotUIRuleManager.Instance.getExpectEffectFlag(this.reelindex, reelStopWindow);
        spinTime = isExpectEffect ? totalTimeInExpectEffect : oneSymbolMoveSpeed * spinSymbolCnt;

        // 5. 处理已流逝时间的偏移量
        if (targetReelIndex === this.reelindex) {
            const preSpinTime = this.getPreSpinTime(winLineIdx);
            spinTime += preSpinTime;
            if (elapsedTime > spinTime) {
                spinTime = 0;
            } else {
                spinTime -= elapsedTime;
            }
        }

        return spinTime;
    }
}