import SlotUIRuleManager from "../../Slot/rule/SlotUIRuleManager";
import SlotGameResultManager from "../../manager/SlotGameResultManager";

const { ccclass } = cc._decorator;


/**
 * 鲨鱼攻击游戏UI规则管理器
 * 继承自SlotUIRuleManager，核心判断期望效果显示和符号动画播放条件
 */
@ccclass('SlotUIRuleManager_SharkAttack')
export default class SlotUIRuleManager_SharkAttack extends SlotUIRuleManager {

    /**
     * 获取期望效果显示标志
     * @param reelIndex 当前滚轮索引
     * @param windowData 窗口数据（包含符号分布信息）
     * @returns 是否显示期望效果
     */
    getExpectEffectFlag(reelIndex: number, windowData: any): boolean {
        let isShowEffect = false;

        // 窗口数据为空直接返回false（修复原代码重复的null判断）
        if (!windowData) {
            return false;
        }

        // 第一步：检查当前滚轮是否在任意规则的生效滚轮列表中
        let isReelInRuleList = false;
        for (let i = 0; i < this._uiExpectEffectRuleList.length; ++i) {
            const rule = this._uiExpectEffectRuleList[i];
            if (rule.appearReelIndexList.indexOf(reelIndex) !== -1) {
                isReelInRuleList = true;
                break;
            }
        }
        // 滚轮不在规则列表中，直接返回false
        if (!isReelInRuleList) {
            return false;
        }

        // 第二步：遍历所有规则，判断是否满足显示条件
        for (let i = 0; i < this._uiExpectEffectRuleList.length; ++i) {
            const rule = this._uiExpectEffectRuleList[i];
            const targetSymbolIds: number[] = [];
            const checkRuleType = rule.checkRule;

            // 过滤子游戏Key不匹配的规则（兼容null/undefined的情况）
            const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            if (rule.subGameKey && rule.subGameKey.indexOf(currentSubGameKey) === -1) {
                continue;
            }

            // 解析目标符号ID（单个数字/数字数组）
            if (typeof rule.symbolId === 'number' && isFinite(rule.symbolId)) {
                targetSymbolIds.push(rule.symbolId);
            } else if (Array.isArray(rule.symbolId)) { // 替换原松散的constructor判断
                for (let j = 0; j < rule.symbolId.length; ++j) {
                    targetSymbolIds.push(rule.symbolId[j]);
                }
            }

            // 处理"OnScreen"类型规则（核心：统计Scatter符号(51)的数量）
            if (checkRuleType === 'OnScreen') {
                let symbolCount = 0;          // 已出现的目标符号数量（仅统计Scatter=51）
                let remainingReelCount = rule.appearReelIndexList.length; // 剩余未旋转滚轮数

                // 当前滚轮不在该规则的生效列表中，跳过
                if (rule.appearReelIndexList.indexOf(reelIndex) === -1) {
                    continue;
                }

                // 统计已旋转滚轮中Scatter符号的数量
                for (let f = 0; f < rule.appearReelIndexList.length; ++f) {
                    const targetReelIdx = rule.appearReelIndexList[f];
                    if (targetReelIdx < reelIndex) { // 仅统计当前滚轮之前的已旋转滚轮
                        for (let d = 0; d < targetSymbolIds.length; ++d) {
                            const symbolId = targetSymbolIds[d];
                            // 仅统计Scatter符号（51）
                            if (symbolId === 51 && windowData.isSymbolInReel(symbolId, targetReelIdx)) {
                                symbolCount += windowData.getSymbolCountInReel(symbolId, targetReelIdx);
                            }
                        }
                        remainingReelCount--; // 已旋转的滚轮，剩余数减1
                    }
                }

                // 满足显示条件：已出现数≥显示阈值 且 已出现+剩余数≥中奖最小数
                if (symbolCount >= rule.symbolAppearCountForShowEffect && 
                    symbolCount + remainingReelCount >= rule.symbolMinimumCountForWin) {
                    isShowEffect = true;
                    break; // 满足一条规则即可，跳出循环
                }
            }
        }

        return isShowEffect;
    }

    /**
     * 判断是否可以播放符号出现动画
     * @param symbolId 目标符号ID
     * @param windowData 窗口数据
     * @param currentReelIndex 当前滚轮索引
     * @param excludeReelIndexList 排除的滚轮索引列表（可选）
     * @returns 是否可以播放动画
     */
    canPlayingAppearSymbomEffect(
        symbolId: number,
        windowData: any,
        currentReelIndex: number,
        excludeReelIndexList?: number[] | null
    ): boolean {
        let canPlayEffect = false;

        // 遍历所有期望效果规则
        for (let i = 0; i < this._uiExpectEffectRuleList.length; ++i) {
            const rule = this._uiExpectEffectRuleList[i];
            const targetSymbolIds: number[] = [];
            const checkRuleType = rule.checkRule;

            // 过滤子游戏Key不匹配的规则
            const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            if (rule.subGameKey && rule.subGameKey.indexOf(currentSubGameKey) === -1) {
                continue;
            }

            // 解析目标符号ID（单个数字/数字数组）
            if (typeof rule.symbolId === 'number' && isFinite(rule.symbolId)) {
                targetSymbolIds.push(rule.symbolId);
            } else if (Array.isArray(rule.symbolId)) {
                for (let j = 0; j < rule.symbolId.length; ++j) {
                    targetSymbolIds.push(rule.symbolId[j]);
                }
            }

            // 目标符号不匹配 或 规则类型不是OnScreen，跳过
            if (targetSymbolIds.indexOf(symbolId) === -1 || checkRuleType !== 'OnScreen') {
                continue;
            }

            // 统计符号数量：已出现数 + 未旋转滚轮数
            let appearedSymbolCount = 0; // 已旋转滚轮中出现的目标符号数
            let unspunReelCount = 0;     // 未旋转的滚轮数量

            // 遍历规则生效的滚轮列表
            for (let d = 0; d < rule.appearReelIndexList.length; ++d) {
                const targetReelIdx = rule.appearReelIndexList[d];

                // 排除指定的滚轮索引（兼容null/undefined）
                if (excludeReelIndexList && excludeReelIndexList.indexOf(targetReelIdx) !== -1) {
                    continue;
                }

                // 当前滚轮未旋转：计入未旋转数量
                if (currentReelIndex < targetReelIdx) {
                    unspunReelCount++;
                } else {
                    // 当前滚轮已旋转：统计目标符号数量
                    const reelWindow = windowData.GetWindow(targetReelIdx);
                    for (let s = 0; s < reelWindow.size; ++s) {
                        if (reelWindow.getSymbol(s) === symbolId) {
                            appearedSymbolCount++;
                        }
                    }
                }
            }

            // 满足条件：已出现+未旋转数量 ≥ 中奖最小数
            if (appearedSymbolCount + unspunReelCount >= rule.symbolMinimumCountForWin) {
                canPlayEffect = true;
                break;
            }
        }

        return canPlayEffect;
    }
}