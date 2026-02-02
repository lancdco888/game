const { ccclass, property } = cc._decorator;


import Reel from "../../Slot/Reel";
import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SlotUIRuleManager from "../../Slot/rule/SlotUIRuleManager";
import TSUtility from "../../global_utility/TSUtility";
import SlotManager from "../../manager/SlotManager";
import SymbolPoolManager from "../../manager/SymbolPoolManager";
// 导入暮光龙游戏自定义模块
import JackpotSymbol_TwilightDragon from "./JackpotSymbol_TwilightDragon";
import Symbol from "../../Slot/Symbol";


// 定义常量：替换魔法值，简化后续维护
const BLUR_SYMBOL_ID_OFFSET = 1000; // 模糊符号ID偏移量
const JACKPOT_SYMBOL_ID_MIN = 91; // 头奖符号最小ID
const JACKPOT_SYMBOL_ID_MAX = 92; // 头奖符号最大ID
const FREESPIN_SYMBOL_SCALE_JACKPOT = 0.8; // 免费旋转下头奖符号缩放
const FREESPIN_SYMBOL_SCALE_NORMAL = 0.68; // 免费旋转下普通符号缩放
const SUB_GAME_KEY_BASE = "base"; // 基础游戏子游戏Key

/**
 * 暮光龙自定义滚轮组件
 * 继承自通用Reel，扩展符号节点配置、模糊符号替换、旋转时间计算功能
 */
@ccclass()
export default class Reel_TwilightDragon extends Reel {
    // 模糊效果标记（控制符号是否显示模糊版本）
    public _blurFlag: boolean = false;


    public reelindex: number = 0;

    /**
     * 获取并配置符号节点（处理头奖符号、模糊符号、免费旋转样式）
     * @param symbolId 符号ID
     * @param symbolInfo 符号信息（可选，用于头奖符号配置）
     * @returns 配置完成的符号节点
     */
    getSymbolNode(symbolId: number, symbolInfo?: any | null): cc.Node | null {
        // 1. 头奖符号归一化处理（91及以上均按91处理，统一样式）
        let targetSymbolId = symbolId;
        if (targetSymbolId >= JACKPOT_SYMBOL_ID_MIN) {
            targetSymbolId = JACKPOT_SYMBOL_ID_MIN;
        }

        // 2. 模糊效果处理（开启模糊标记时，符号ID增加偏移量获取模糊版本）
        if (this._blurFlag && targetSymbolId > 0) {
            targetSymbolId += BLUR_SYMBOL_ID_OFFSET;
        }

        // 3. 从对象池获取符号节点
        const symbolNode = SymbolPoolManager.instance.getSymbol(targetSymbolId);
        if (!TSUtility.isValid(symbolNode)) {
            cc.error(`[Reel_TwilightDragon] 未找到符号ID对应的节点：${targetSymbolId}`);
            return null;
        }

        // 4. 头奖符号额外配置（设置符号信息或虚拟符号标记）
        const jackpotSymbolComp = symbolNode.getComponent(JackpotSymbol_TwilightDragon);
        if (jackpotSymbolComp) {
            if (symbolInfo) {
                // 有符号信息时，配置头奖符号详情
                jackpotSymbolComp.setSymbolInfo(symbolInfo);
            } else {
                // 无符号信息时，标记为虚拟头奖符号
                jackpotSymbolComp.setDummySymbol();
            }
        }

        // 5. 免费旋转模式下的符号样式配置（缩放、暗度）
        const isFreeSpinMode = SlotReelSpinStateManager.Instance.getFreespinMode();
        if (isFreeSpinMode) {
            const symbolComp = symbolNode.getComponent(Symbol);
            if (symbolComp) {
                if (targetSymbolId >= JACKPOT_SYMBOL_ID_MIN) {
                    // 头奖符号：放大缩放，关闭暗度
                    symbolNode.scale = FREESPIN_SYMBOL_SCALE_JACKPOT;
                    symbolComp.setDimmActive(false);
                } else {
                    // 普通符号：缩小缩放，开启暗度
                    symbolNode.scale = FREESPIN_SYMBOL_SCALE_NORMAL;
                    symbolComp.setDimmActive(true);
                }
            }
        } else {
            // 非免费旋转模式：恢复默认缩放
            symbolNode.scale = 1;
        }

        return symbolNode;
    }

    /**
     * 批量替换所有模糊符号（将模糊版本（ID>1000）替换为普通版本）
     */
    changeAllBlurSymbol(): void {
        for (let i = 0; i < this.symbolArray.length; i++) {
            const currentSymbolNode = this.symbolArray[i];
            const symbolComp = currentSymbolNode.getComponent(Symbol);
            if (!symbolComp) continue;

            // 筛选模糊符号（ID大于偏移量，即模糊版本）
            if (symbolComp.symbolId > BLUR_SYMBOL_ID_OFFSET) {
                // 计算原始符号ID（减去模糊偏移量）
                const originalSymbolId = symbolComp.symbolId - BLUR_SYMBOL_ID_OFFSET;

                // 获取普通版本符号节点
                const normalSymbolNode = this.getSymbolNode(originalSymbolId, null);
                if (!normalSymbolNode) continue;

                // 保留原节点的位置、层级信息
                const siblingIndex = currentSymbolNode.getSiblingIndex();
                const parentNode = currentSymbolNode.parent;

                // 配置新节点位置
                normalSymbolNode.setPosition(currentSymbolNode.position);
                normalSymbolNode.active = true;

                // 应用着色器（保留原始逻辑，滚轮模糊效果）
                this.applyShader(normalSymbolNode);

                // 插入新节点，移除旧节点
                if (TSUtility.isValid(parentNode)) {
                    parentNode.insertChild(normalSymbolNode, siblingIndex);
                } else {
                    this.node.insertChild(normalSymbolNode, siblingIndex);
                }

                // 更新符号数组，释放旧节点到对象池
                currentSymbolNode.removeFromParent();
                this.symbolArray.splice(i, 1, normalSymbolNode);
                SymbolPoolManager.instance.releaseSymbol(symbolComp);
            }
        }

        // 重置所有符号节点的兄弟节点索引（确保层级顺序正确）
        this.resetAllSiblingIndex();
    }

    /**
     * 替换滚轮的最后一个符号（数组第一个元素，对应滚轮视觉最后一个显示符号）
     * @param targetSymbolId 目标符号ID
     */
    changeLastSymbol(targetSymbolId: number): void {
        if (this.symbolArray.length === 0) return;

        // 获取旧符号节点
        const oldSymbolNode = this.symbolArray[0];
        const oldSymbolComp = oldSymbolNode.getComponent(Symbol);
        if (!oldSymbolComp) return;

        // 获取新符号节点
        const newSymbolNode = this.getSymbolNode(targetSymbolId, null);
        if (!newSymbolNode) return;

        // 配置新节点位置与着色器
        newSymbolNode.removeFromParent();
        newSymbolNode.setPosition(0, oldSymbolNode.y);
        this.applyShader(newSymbolNode);

        // 更新符号数组，移除旧节点，释放到对象池
        oldSymbolNode.removeFromParent();
        this.symbolArray.splice(0, 1, newSymbolNode);

        // 重置兄弟节点索引，确保层级正确
        this.resetAllSiblingIndex();
        SymbolPoolManager.instance.releaseSymbol(oldSymbolComp);
    }

    /**
     * 计算滚轮旋转更新时间（考虑预期特效、预旋转时间、免费旋转模式）
     * @param reels 滚轮数组
     * @param spinRequestTime 旋转请求时间
     * @param subGameKey 子游戏Key
     * @returns 滚轮旋转更新所需时间
     */
    getReelSpinTimeRenewal(reels: cc.Node[], spinRequestTime: number, subGameKey: string): number {
        let spinRenewalTime = 0;

        // 1. 获取当前滚轮的旋转控制配置信息
        const spinControlInfoList = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey)?.infoList;
        if (!spinControlInfoList || !spinControlInfoList[this.reelindex]) {
            return spinRenewalTime;
        }
        const spinControlInfo = spinControlInfoList[this.reelindex];

        // 提取配置参数
        const expectEffectTotalTime = spinControlInfo.totalTimeInExpectEffect;
        const oneSymbolMoveSpeed = spinControlInfo.oneSymbolMoveSpeed;
        const spinSymbolCount = spinControlInfo.spinSymbolCnt;

        // 2. 统计头奖符号（91、92）的数量
        let jackpotSymbolCount = 0;
        const reelStopWindow = SlotManager.Instance.getReelStopWindow();
        for (let d = 0; d < 2; d++) {
            const window = reelStopWindow.GetWindow(d);
            for (let h = 0; h < window.size; h++) {
                const symbolId = window.getSymbol(h);
                if (symbolId === JACKPOT_SYMBOL_ID_MIN || symbolId === JACKPOT_SYMBOL_ID_MAX) {
                    jackpotSymbolCount++;
                }
            }
        }

        // 3. 判断是否启用预期特效时间，否则使用普通旋转时间
        const isExpectEffect = SlotUIRuleManager.Instance.getExpectEffectFlag(this.reelindex, reelStopWindow)
            && subGameKey === SUB_GAME_KEY_BASE
            && this.reelindex === 2
            && jackpotSymbolCount < 3;

        spinRenewalTime = isExpectEffect ? expectEffectTotalTime : (oneSymbolMoveSpeed * spinSymbolCount);

        // 4. 结合预旋转时间，校准最终旋转更新时间
        const preSpinTime = this.getPreSpinTime(subGameKey);
        let targetReelIndex = -1;

        // 查找第一个激活的滚轮索引
        for (let d = 0; d < reels.length; d++) {
            const reelComp = reels[d].getComponent(Reel);
            if (reelComp?.node.active) {
                targetReelIndex = reelComp.reelindex;
                break;
            }
        }

        // 校准时间（旋转请求时间超过总时间则置0，否则减去请求时间）
        if (targetReelIndex === this.reelindex) {
            spinRenewalTime += preSpinTime;
            if (spinRequestTime > spinRenewalTime) {
                spinRenewalTime = 0;
            } else {
                spinRenewalTime -= spinRequestTime;
            }
        }

        return spinRenewalTime;
    }
}