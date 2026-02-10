const { ccclass, property } = cc._decorator;


import Reel from '../../Slot/Reel';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SymbolPoolManager from '../../manager/SymbolPoolManager';
// 导入龙珠游戏自定义组件
import GameComponents_DragonOrbs from './GameComponents_DragonOrbs';
import JackpotSymbol_DragonOrbs from './JackpotSymbol_DragonOrbs';
import Symbol from '../../Slot/Symbol';
import SlotUIRuleManager from '../../Slot/rule/SlotUIRuleManager';
import SlotManager from '../../manager/SlotManager';

// ===================== 龙珠游戏卷轴核心类 =====================
/**
 * 龙珠游戏卷轴核心类
 * 负责符号节点获取/替换、卷轴旋转时间计算、符号层级排序、大奖符号适配
 */
@ccclass()
export default class Reel_DragonOrbs extends Reel {
    // ===================== 私有属性（补充TS类型注解） =====================
    /** 暗化标记 */
    private _dimmFlag: boolean = false;

    // ===================== 核心业务方法（完全保留原JS逻辑） =====================
    /**
     * 获取符号节点（适配免费旋转/基础游戏的符号ID替换）
     * @param symbolId 符号ID
     * @param symbolInfo 符号信息（可选）
     * @returns 符号节点
     */
    public getSymbolNode(symbolId: number, symbolInfo?: any): cc.Node {
        // 获取当前子游戏标识
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        
        // 免费旋转模式下替换符号ID（区分红/绿/蓝）
        if (symbolId > 90 && subGameKey !== "base") {
            if (subGameKey === "freeSpin_red") {
                symbolId = 96;
            } else if (subGameKey === "freeSpin_green") {
                symbolId = 92;
            } else if (subGameKey === "freeSpin_blue") {
                symbolId = 94;
            }
        }

        // 从符号池获取符号节点
        const symbolNode = SymbolPoolManager.instance.getSymbol(symbolId);
        if (!TSUtility.isValid(symbolNode)) {
            cc.error("not found symbolId: ", symbolId);
        }

        // 激活符号节点（先禁用再启用确保状态正确）
        symbolNode.active = false;
        symbolNode.active = true;

        // 初始化大奖符号组件
        const jackpotSymbol = symbolNode.getComponent(JackpotSymbol_DragonOrbs);
        if (TSUtility.isValid(jackpotSymbol)) {
            if (subGameKey === "base") {
                // 基础游戏模式初始化大奖符号
                jackpotSymbol.init();
            } else if (TSUtility.isValid(symbolInfo)) {
                // 免费旋转模式设置符号信息
                jackpotSymbol.setSymbol(symbolInfo);
            } else {
                // 无信息时设置dummy符号
                jackpotSymbol.setDummySymbol();
            }
        }

        // 暗化标记生效时，非92以上符号启用暗化效果
        if (this._dimmFlag === true && symbolId < 92) {
            const symbolComp = symbolNode.getComponent(Symbol);
            symbolComp.setDimmActive(true);
        }

        return symbolNode;
    }

    /**
     * 计算卷轴更新时的旋转时间（区分大奖期望/免费旋转/基础游戏）
     * @param reels 卷轴数组
     * @param spinRequestTime 旋转请求时间
     * @param subGameKey 子游戏标识
     * @returns 旋转时长（秒）
     */
    public getReelSpinTimeRenewal(reels: cc.Node[], spinRequestTime: number, subGameKey: string): number {
        // 获取当前卷轴的旋转控制参数
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey) as any;
        const reelControlInfo = spinControlInfo.infoList[this.reelindex];
        
        const totalTimeInExpectEffect = reelControlInfo.totalTimeInExpectEffect;
        const oneSymbolMoveSpeed = reelControlInfo.oneSymbolMoveSpeed;
        const spinSymbolCnt = reelControlInfo.spinSymbolCnt;

        // 获取龙珠游戏组件的状态标记
        const gameComp = SlotManager.Instance.getComponent(GameComponents_DragonOrbs);
        const jackpotExpectFlag = gameComp!.getJackpotExpectFlag(); // 大奖期望标记
        const jackpotSingleExpectFlag = gameComp!.getJackpotSingleExpectFlag(this.reelindex); // 当前卷轴大奖期望标记
        const upDownFlag = gameComp!.getUpDownFlag(this.reelindex); // 上下移动标记
        const leftCellCountFlag = gameComp!.getLeftCellCount() === 1; // 剩余单元格标记

        // 计算基础旋转时间（区分不同游戏状态）
        let spinTime = 0;
        if (jackpotExpectFlag === 0 && subGameKey === "base" && SlotUIRuleManager.Instance.getExpectEffectFlag(this.reelindex, SlotManager.Instance.getReelStopWindow())) {
            // 基础游戏+期望效果：使用期望效果总时长
            spinTime = totalTimeInExpectEffect;
        } else if ((jackpotExpectFlag === 1 || leftCellCountFlag || (jackpotSingleExpectFlag === 1 && upDownFlag > -1)) && subGameKey !== "base") {
            // 免费旋转+大奖期望/剩余单元格：使用期望效果总时长
            spinTime = totalTimeInExpectEffect;
        } else {
            // 普通情况：速度 * 符号数量
            spinTime = oneSymbolMoveSpeed * spinSymbolCnt;
        }

        // 检查当前卷轴是否为第一个激活的卷轴
        let firstActiveReelIndex = -1;
        for (let i = 0; i < reels.length; ++i) {
            const reelComp = reels[i].getComponent(Reel);
            if (reelComp.node.active) {
                firstActiveReelIndex = reelComp.reelindex;
                break;
            }
        }

        // 若为第一个激活卷轴，需结合旋转请求时间调整时长
        if (firstActiveReelIndex === this.reelindex) {
            spinTime += this.getPreSpinTime(subGameKey); // 累加预旋转时间
            if (spinRequestTime > spinTime) {
                spinTime = 0; // 请求时间超过总时长则置0
            } else {
                spinTime -= spinRequestTime; // 减去已请求的时间
            }
        }

        return spinTime;
    }

    /**
     * 替换最后一个符号
     * @param symbolId 新符号ID
     */
    public changeLastSymbol(symbolId: number): void {
        // 获取最后一个符号节点
        const lastSymbolNode = this.getLastSymbol().node;
        // 创建新符号节点
        const newSymbolNode = this.getSymbolNode(symbolId, null);
        
        // 复制位置和层级
        newSymbolNode.x = lastSymbolNode.x;
        newSymbolNode.y = lastSymbolNode.y;
        const siblingIndex = lastSymbolNode.getSiblingIndex();
        
        // 插入新节点并激活
        this.node.insertChild(newSymbolNode, siblingIndex);
        newSymbolNode.active = true;
        
        // 应用着色器（基类方法）
        this.applyShader(newSymbolNode);
        
        // 移除旧节点并释放到符号池
        lastSymbolNode.removeFromParent();
        const oldSymbolComp = lastSymbolNode.getComponent(Symbol);
        SymbolPoolManager.instance.releaseSymbol(oldSymbolComp);
        
        // 更新符号数组并重置层级排序
        this.symbolArray.splice(0, 1, newSymbolNode);
        this.resetAllSiblingIndex();
    }

    /**
     * 符号节点排序函数（按Z序、坐标排序）
     */
    public onSortFunction(): void {
        this.node.children.sort((nodeA: cc.Node, nodeB: cc.Node) => {
            const symbolA = nodeA.getComponent(Symbol);
            const symbolB = nodeB.getComponent(Symbol);
            
            // 优先按Z序排序
            if (symbolA.zOrder > symbolB.zOrder) return 1;
            if (symbolA.zOrder < symbolB.zOrder) return -1;
            
            // Z序相同时按坐标排序（X降序/Y升序）
            const xA = Math.floor(nodeA.position.x);
            const xB = Math.floor(nodeB.position.x);
            const yA = Math.floor(nodeA.position.y);
            const yB = Math.floor(nodeB.position.y);
            
            if (xA > xB || yA < yB) return 1;
            return -1;
        });
    }

    /**
     * 重置所有符号节点的层级索引（调用排序函数）
     */
    public resetAllSiblingIndex(): void {
        this.onSortFunction();
    }
}

