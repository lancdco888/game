
// 游戏专属模块
import Reel from '../../Slot/Reel';
import SymbolPoolManager from '../../manager/SymbolPoolManager';
import ReelController_SuperSevenBlasts from './ReelController_SuperSevenBlasts';
import SuperSevenBlastsManager from './SuperSevenBlastsManager';
import Symbol from '../../Slot/Symbol';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotUIRuleManager from '../../Slot/rule/SlotUIRuleManager';
import SlotManager from '../../manager/SlotManager';

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts 游戏专属滚轮组件
 * 核心功能：符号节点模糊/正常切换、重旋转符号暗化控制、滚轮时间计算、位置重置
 */
@ccclass()
export default class Reel_SuperSevenBlasts extends Reel {
    // ========== 业务状态属性 ==========
    /** 模糊符号标记 */
    public _flagBlur: boolean = false;



    /**
     * 获取符号节点（支持模糊状态和暗化控制）
     * @param symbolId 符号ID
     * @returns 符号节点
     */
    public getSymbolNode(symbolId: number):cc.Node {
        // 修正重旋转符号ID（100+区间减10）
        if (symbolId > 100 && symbolId < 110) {
            symbolId -= 10;
        }

        // 根据模糊标记获取对应符号（模糊符号ID+100）
        let symbolNode = this._flagBlur 
            ? SymbolPoolManager.instance.getSymbol(symbolId + 100) 
            : SymbolPoolManager.instance.getSymbol(symbolId);

        // 暗化控制（根据游戏组件的暗化状态）
        if (SuperSevenBlastsManager.getInstance().game_components.isDimmed()) {
            const symbolComp = symbolNode.getComponent(Symbol);
            if (TSUtility.isValid(symbolComp)) {
                // Jackpot符号(90-110)和奖励符号(61)不暗化，其余暗化
                if ((symbolId > 90 && symbolId < 110) || symbolId === 61) {
                    symbolComp.setDimmActive(false);
                } else {
                    symbolComp.setDimmActive(true);
                }
            }
        }

        return symbolNode;
    }

    /**
     * 将所有符号节点切换为模糊状态
     */
    public changeNodesToBlurSymbol(): void {
        this._flagBlur = true; // 标记为模糊状态

        for (let i = 0; i < this.symbolArray.length; ++i) {
            const symbolNode = this.symbolArray[i];
            if (!TSUtility.isValid(symbolNode)) continue;

            const symbolComp = symbolNode.getComponent(Symbol);
            if (!TSUtility.isValid(symbolComp)) continue;

            // 获取原始符号ID并计算模糊符号ID
            let symbolId = symbolComp.symbolId;
            const blurSymbolId = symbolId < 100 ? symbolId + 100 : symbolId;
            
            // 从对象池获取模糊符号节点
            const blurSymbolNode = SymbolPoolManager.instance.getSymbol(blurSymbolId);
            if (!TSUtility.isValid(blurSymbolNode)) continue;

            // 继承原符号节点的位置
            blurSymbolNode.x = symbolNode.x;
            blurSymbolNode.y = symbolNode.y;

            // 替换符号数组中的节点
            const oldNode = symbolNode;
            this.symbolArray[i] = blurSymbolNode;

            // 释放旧节点到对象池
            SymbolPoolManager.instance.releaseSymbol(symbolComp);
            
            // 添加新节点到滚轮并应用Shader
            this.node.addChild(blurSymbolNode);
            this.applyShader(blurSymbolNode);

            // 重旋转状态下的暗化控制
            if (SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult() === "respin") {
                const blurSymbolComp = blurSymbolNode.getComponent(Symbol);
                if (TSUtility.isValid(blurSymbolComp)) {
                    // Jackpot符号不暗化，其余暗化
                    if (symbolId > 90 && symbolId < 110) {
                        blurSymbolComp.setDimmActive(false);
                    } else {
                        blurSymbolComp.setDimmActive(true);
                    }
                }
            }
        }

        // 重置所有节点的层级
        this.resetAllSiblingIndex();
    }

    /**
     * 将所有符号节点切换为正常状态
     */
    public changeNodesToNormalSymbol(): void {
        this._flagBlur = false; // 标记为正常状态

        for (let i = 0; i < this.symbolArray.length; ++i) {
            const symbolNode = this.symbolArray[i];
            if (!TSUtility.isValid(symbolNode)) continue;

            const symbolComp = symbolNode.getComponent(Symbol);
            if (!TSUtility.isValid(symbolComp)) continue;

            // 获取当前符号ID（模糊符号ID减100）
            let symbolId = symbolComp.symbolId;
            // 跳过特殊符号（90/61/190）
            if (symbolId === 90 || symbolId === 61 || symbolId === 190) continue;
            
            // 还原模糊符号ID到原始ID
            if (symbolId > 100 && symbolId < 200) {
                symbolId -= 100;
            }

            // 从对象池获取正常符号节点
            const normalSymbolNode = SymbolPoolManager.instance.getSymbol(symbolId);
            if (!TSUtility.isValid(normalSymbolNode)) continue;

            // 继承原符号节点的位置
            normalSymbolNode.x = symbolNode.x;
            normalSymbolNode.y = symbolNode.y;

            // 替换符号数组中的节点
            const oldNode = symbolNode;
            this.symbolArray[i] = normalSymbolNode;

            // 释放旧节点到对象池
            SymbolPoolManager.instance.releaseSymbol(symbolComp);
            
            // 添加新节点到滚轮并应用Shader
            this.node.addChild(normalSymbolNode);
            this.applyShader(normalSymbolNode);

            // 重旋转状态下的暗化控制
            if (SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult() === "respin") {
                const normalSymbolComp = normalSymbolNode.getComponent(Symbol);
                if (TSUtility.isValid(normalSymbolComp)) {
                    // Jackpot符号(90-110)和奖励符号(61)不暗化，其余暗化
                    if ((symbolId > 90 && symbolId < 110) || symbolId === 61) {
                        normalSymbolComp.setDimmActive(false);
                    } else {
                        normalSymbolComp.setDimmActive(true);
                    }
                }
            }
        }

        // 重置所有节点的层级
        this.resetAllSiblingIndex();
    }

    /**
     * 获取滚轮旋转时间（重写父类方法）
     * @param reelArray 滚轮数组
     * @param elapsedTime 已流逝时间
     * @param gameKey 游戏标识
     * @returns 旋转时长
     */
    public getReelSpinTimeRenewal(reelArray: cc.Node[], elapsedTime: number, gameKey: string): number {
        let spinTime = 0;
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(gameKey);
        
        if (!spinControlInfo || !spinControlInfo.infoList[this.reelindex]) {
            return 0;
        }

        // 获取旋转控制参数
        const reelInfo = spinControlInfo.infoList[this.reelindex];
        const expectEffectTime = reelInfo.totalTimeInExpectEffect;
        const oneSymbolSpeed = reelInfo.oneSymbolMoveSpeed;
        const spinSymbolCount = reelInfo.spinSymbolCnt;

        // 计算基础旋转时间（是否启用期望特效）
        spinTime = SlotUIRuleManager.Instance.getExpectEffectFlag(this.reelindex, SlotManager.Instance.getReelStopWindow())
            ? expectEffectTime
            : oneSymbolSpeed * spinSymbolCount;

        // 计算前置旋转时间
        const preSpinTime = this.getPreSpinTime(gameKey);
        spinTime += preSpinTime;

        // 查找激活的滚轮索引
        let activeReelIndex = -1;
        for (let i = 0; i < reelArray.length; ++i) {
            const reelComp = reelArray[i].getComponent(Reel);
            if (TSUtility.isValid(reelComp) && reelComp.node.active === true) {
                activeReelIndex = reelComp.reelindex;
                break;
            }
        }

        // 调整旋转时间（当前滚轮为激活滚轮时）
        if (activeReelIndex === this.reelindex) {
            if (elapsedTime > spinTime) {
                spinTime = 0;
            } else {
                spinTime -= elapsedTime;
            }
        }

        return spinTime;
    }

    /**
     * 获取前置旋转时间
     * @param gameKey 游戏标识
     * @returns 前置旋转时长
     */
    public getPreSpinTime(gameKey: string): number {
        if (!gameKey) {
            return 0;
        }

        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(gameKey);
        if (!spinControlInfo) {
            return 0;
        }

        // 获取前置旋转参数
        const preSpinSymbolCount = spinControlInfo.preSpinSymbolCnt;
        const oneSymbolSpeed = spinControlInfo.infoList[this.reelindex]?.oneSymbolMoveSpeed || 0;

        return oneSymbolSpeed * preSpinSymbolCount;
    }

    /**
     * 获取滚轮停止时间
     * @param gameKey 游戏标识
     * @returns 停止时长
     */
    public getReelStopTime(gameKey: string): number {
        if (!gameKey) {
            return 0;
        }

        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(gameKey);
        if (!spinControlInfo || !spinControlInfo.infoList[this.reelindex]) {
            return 0;
        }

        return spinControlInfo.infoList[this.reelindex].postEasingDuration;
    }

    /**
     * 重置滚轮组件位置（SuperSevenBlasts专属逻辑）
     * @param offsetY Y轴偏移量
     */
    public resetPositionOfReelComponents_SuperSevenBlasts(offsetY: number): void {
        if (offsetY === 0) {
            // 无偏移时直接重置位置
            this.node.y = this.originalYPos;
            for (let i = 0; i < this.symbolArray.length; ++i) {
                const symbolNode = this.symbolArray[i];
                if (TSUtility.isValid(symbolNode)) {
                    const targetY = (this.bufferRow - i) * this.symbolHeight;
                    symbolNode.y = targetY;
                }
            }
        } else {
            // 有偏移时通过动画重置
            for (let i = 0; i < this.symbolArray.length; ++i) {
                const symbolNode = this.symbolArray[i];
                if (TSUtility.isValid(symbolNode)) {
                    const targetY = (this.bufferRow - i) * this.symbolHeight;
                    symbolNode.setPosition(symbolNode.x, targetY);
                }
            }

            // 设置初始偏移位置并播放复位动画
            this.node.y = this.originalYPos - offsetY;
            const resetAction = cc.sequence(
                cc.moveTo(0.2, new cc.Vec2(this.node.x, this.originalYPos)).easing(cc.easeBackOut()),
                cc.delayTime(0.01),
                cc.callFunc(() => {
                    this.node.y = this.originalYPos;
                })
            );
            this.node.runAction(resetAction);
        }
    }

    /**
     * 设置重旋转符号暗化状态
     * @param isActive 是否激活暗化
     * @param delay 延迟时间（可选）
     */
    public setRespinSymbolsDimmActive(isActive: boolean, delay: number = 0): void {
        for (let i = 0; i < this.symbolArray.length; ++i) {
            const symbolNode = this.symbolArray[i];
            if (!TSUtility.isValid(symbolNode)) continue;

            const symbolComp = symbolNode.getComponent(Symbol);
            if (TSUtility.isValid(symbolComp) && symbolComp.symbolId < 90) {
                symbolComp.setDimmActive(isActive, delay);
            }
        }
    }

    /**
     * 停止旋转后的处理逻辑
     */
    public processAfterStopSpin(): void {
        // 获取滚轮控制器的偏移值
        const reelController = this.getComponent(ReelController_SuperSevenBlasts);
        const offsetY = reelController._addVlaue || 0;

        // 重置滚轮位置
        this.resetPositionOfReelComponents_SuperSevenBlasts(offsetY);
        // 检查超大符号（需确保父类已实现）
        this.processCheckOverSizeSymbol();
    }

    /**
     * 隐藏奖励符号
     * @returns 是否找到并隐藏奖励符号
     */
    public hideSymbolInBonus(): boolean {
        let isHidden = false;
        for (let i = 0; i < this.symbolArray.length; ++i) {
            const symbolNode = this.symbolArray[i];
            if (TSUtility.isValid(symbolNode) && symbolNode.name === "Bonus") {
                symbolNode.active = false;
                isHidden = true;
                break;
            }
        }
        return isHidden;
    }
}