// 游戏专属模块
import Reel from '../../Slot/Reel';
import SlotSoundController from '../../Slot/SlotSoundController';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotManager from '../../manager/SlotManager';
import GameComponents_SuperSevenBlasts from './GameComponents_SuperSevenBlasts';

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts 游戏专属奖励移动组件
 * 核心功能：锁定符号管理、奖励移动动画播放、符号位置计算、动画节点清理
 * 注意：原代码存在拼写错误（compareLokedSymbols → compareLockedSymbols），保留原命名避免业务逻辑冲突
 */
@ccclass('MoveBonusComponent_SuperSevenBlasts')
export default class MoveBonusComponent_SuperSevenBlasts extends cc.Component {
    // ========== 编辑器配置属性 ==========
    /** Feature预制体（奖励核心特效） */
    @property({
        type: cc.Prefab,
        displayName: "Feature预制体",
        tooltip: "奖励核心特效的预制体"
    })
    public feature_Prefab: cc.Prefab | null = null;

    /** 扩展特效预制体 */
    @property({
        type: cc.Prefab,
        displayName: "扩展特效预制体",
        tooltip: "奖励扩展特效的预制体"
    })
    public ex_Prefab: cc.Prefab | null = null;

    /** 移动特效预制体 */
    @property({
        type: cc.Prefab,
        displayName: "移动特效预制体",
        tooltip: "奖励移动轨迹的预制体"
    })
    public move_Prefab: cc.Prefab | null = null;

    /** 符号特效挂载节点 */
    @property({
        type: cc.Node,
        displayName: "符号节点",
        tooltip: "承载符号特效的父节点"
    })
    public symbolNode: cc.Node | null = null;

    /** 移动特效挂载节点 */
    @property({
        type: cc.Node,
        displayName: "移动节点",
        tooltip: "承载移动特效的父节点"
    })
    public moveNode: cc.Node | null = null;

    // ========== 固定参数 ==========
    /** 符号宽度（用于位置计算） */
    private width: number = 180;
    /** 符号高度（用于位置计算） */
    private height: number = 118;

    // ========== 状态属性 ==========
    /** 锁定符号数组 */
    private lockedSymbols: number[] = [];
    /** 动画播放索引数组 */
    private playIndexes: number[] = [];

    // ========== 锁定符号管理 ==========
    /**
     * 初始化锁定符号数组
     * 从respin子游戏状态中获取锁定Wild符号，无数据时初始化空数组
     */
    public setLockedSymbols(): void {
        this.lockedSymbols = [];
        // 获取respin子游戏状态
        const respinState = SlotGameResultManager.Instance.getSubGameState("respin");

        // 有效状态且包含锁定Wild数据时，填充锁定符号
        if (TSUtility.isValid(respinState) && TSUtility.isValid(respinState.exData?.lockedWild)) {
            const lockedWild = respinState.exData.lockedWild;
            for (let i = 0; i < lockedWild.gauges.length; ++i) {
                this.lockedSymbols.push(lockedWild.gauges[i]);
            }
        } 
        // 无数据时初始化15个0的数组
        else {
            for (let i = 0; i < 15; i++) {
                this.lockedSymbols.push(0);
            }
        }
    }

    /**
     * 对比锁定符号（原代码拼写错误：Loked → Locked，保留）
     * 生成需要播放动画的索引数组
     * @returns 动画播放索引数组
     */
    public compareLokedSymbols(): number[] {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        let hasBonusSymbol = false;

        // 检查是否存在奖励符号（ID=61）
        for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
            for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
                if (lastHistoryWindows.GetWindow(reelIdx).getSymbol(rowIdx) === 61) {
                    hasBonusSymbol = true;
                    break;
                }
            }
            if (hasBonusSymbol) break;
        }

        // 无奖励符号时返回空数组
        if (!hasBonusSymbol) {
            return [];
        }

        // 获取respin子游戏状态
        const respinState = SlotGameResultManager.Instance.getSubGameState("respin");
        this.playIndexes = [];

        // 有效状态且包含锁定Wild数据时对比符号
        if (TSUtility.isValid(respinState) && TSUtility.isValid(respinState.exData?.lockedWild)) {
            const currentLockedSymbols: number[] = [];
            // 复制当前锁定符号数组
            for (let i = 0; i < respinState.exData.lockedWild.gauges.length; ++i) {
                currentLockedSymbols.push(respinState.exData.lockedWild.gauges[i]);
            }

            // 符号数组一致时返回空播放索引
            if (JSON.stringify(this.lockedSymbols) === JSON.stringify(currentLockedSymbols)) {
                return this.playIndexes;
            }

            // 对比符号差异，生成播放索引
            for (let i = 0; i < currentLockedSymbols.length; ++i) {
                if (this.lockedSymbols[i] !== currentLockedSymbols[i]) {
                    // 原锁定符号大于0时添加索引
                    if (this.lockedSymbols[i] > 0) {
                        this.playIndexes.push(i);
                    } 
                    // 符号ID符合条件时添加索引
                    else {
                        const reelIdx = Math.floor(i / 3);
                        const rowIdx = Math.floor(i % 3);
                        const visibleWindows = SlotGameResultManager.Instance.getVisibleSlotWindows();
                        const historyWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
                        
                        const visibleSymbol = visibleWindows.GetWindow(reelIdx).getSymbol(rowIdx);
                        const historySymbol = historyWindows.GetWindow(reelIdx).getSymbol(rowIdx);
                        
                        if (visibleSymbol > 90 && visibleSymbol < historySymbol - 10) {
                            this.playIndexes.push(i);
                        }
                    }
                }
            }
        }

        return this.playIndexes;
    }

    /**
     * 播放奖励移动动画
     * @param fromReelIdx 起始滚轮索引
     * @param fromRowIdx 起始行索引
     * @param toReelIdx 目标滚轮索引
     * @param toRowIdx 目标行索引
     * @param callback 动画完成回调
     * @param forceFeature 强制播放Feature动画（默认false）
     */
    public playMoveBonus(
        fromReelIdx: number,
        fromRowIdx: number,
        toReelIdx: number,
        toRowIdx: number,
        callback?: () => void,
        forceFeature: boolean = false
    ): void {
        // 禁用起始位置的符号显示
        const fromReel = SlotManager.Instance.reelMachine.reels[fromReelIdx];
        if (TSUtility.isValid(fromReel)) {
            const reelComp = fromReel.getComponent(Reel);
            if (reelComp) {
                reelComp.hideSymbolInRow(fromRowIdx);
            }
        }

        // 清空特效节点子元素并取消所有调度器
        if (TSUtility.isValid(this.symbolNode)) {
            this.symbolNode.removeAllChildren(true);
        }
        if (TSUtility.isValid(this.moveNode)) {
            this.moveNode.removeAllChildren(true);
        }
        this.unscheduleAllCallbacks();

        // 随机选择动画类型（true:ex动画，false:feature动画）
        const isExAni = Math.random() > 0.5;
        // 强制播放Feature动画时覆盖随机结果
        const finalIsExAni = forceFeature ? false : isExAni;

        // ========== Feature动画回调 ==========
        const playFeatureAni = cc.callFunc(() => {
            if (!TSUtility.isValid(this.feature_Prefab) || !TSUtility.isValid(this.symbolNode)) return;
            
            // 创建Feature预制体并设置位置
            const featureNode = cc.instantiate(this.feature_Prefab);
            this.symbolNode.addChild(featureNode);
            featureNode.setPosition(
                -2 * this.width + this.width * fromReelIdx,
                this.height - this.height * fromRowIdx
            );

            // 停止所有符号动画
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
            
            // 再次隐藏起始位置符号（双重保障）
            if (TSUtility.isValid(fromReel)) {
                const reelComp = fromReel.getComponent(Reel);
                if (reelComp) {
                    reelComp.hideSymbolInRow(fromRowIdx);
                }
            }

            // 延迟创建移动特效
            this.scheduleOnce(() => {
                if (!TSUtility.isValid(this.move_Prefab) || !TSUtility.isValid(this.moveNode)) return;
                
                const moveNode = cc.instantiate(this.move_Prefab);
                this.moveNode!.addChild(moveNode);
                moveNode.setPosition(
                    -2 * this.width + this.width * fromReelIdx,
                    this.height - this.height * fromRowIdx
                );

                // 计算目标位置并播放移动动画
                const targetPos = new cc.Vec2(
                    -2 * this.width + this.width * toReelIdx,
                    this.height - this.height * toRowIdx
                );
                moveNode.runAction(cc.moveTo(0.83, targetPos).easing(cc.easeBackIn()));
            }, 0.17);
        });

        // ========== Ex动画回调 ==========
        const playExAni = cc.callFunc(() => {
            if (!TSUtility.isValid(this.ex_Prefab) || !TSUtility.isValid(this.symbolNode)) return;
            
            // 创建Ex预制体并设置位置
            const exNode = cc.instantiate(this.ex_Prefab);
            this.symbolNode.addChild(exNode);
            exNode.setPosition(
                -2 * this.width + this.width * fromReelIdx,
                this.height - this.height * fromRowIdx
            );

            // 延迟创建移动特效
            this.scheduleOnce(() => {
                if (!TSUtility.isValid(this.move_Prefab) || !TSUtility.isValid(this.moveNode)) return;
                
                const moveNode = cc.instantiate(this.move_Prefab);
                this.moveNode!.addChild(moveNode);
                moveNode.setPosition(
                    -2 * this.width + this.width * fromReelIdx,
                    this.height - this.height * fromRowIdx
                );

                // 计算目标位置并播放移动动画
                const targetPos = new cc.Vec2(
                    -2 * this.width + this.width * toReelIdx,
                    this.height - this.height * toRowIdx
                );
                moveNode.runAction(cc.moveTo(0.83, targetPos).easing(cc.easeBackIn()));
            }, 0.5);
        });

        // ========== 符号变更回调 ==========
        const changeSymbol = cc.callFunc(() => {
            // 获取目标位置的符号ID并更新锁定组件
            const historyWindow = SlotGameResultManager.Instance.getLastHistoryWindows().GetWindow(toReelIdx);
            const targetSymbolId = historyWindow.getSymbol(toRowIdx);
            
            const gameComp = SlotManager.Instance.getComponent(GameComponents_SuperSevenBlasts);
            if (gameComp) {
                gameComp.lockComponent.setChangeSymbol(toReelIdx, toRowIdx, targetSymbolId);
            }
        });

        // ========== 完成回调 ==========
        const completeCallback = cc.callFunc(() => {
            if (TSUtility.isValid(callback) && typeof callback === 'function') {
                callback();
            }
        });

        // ========== 播放动画序列 ==========
        if (!finalIsExAni) {
            // 播放Feature动画 + BonusHit音效
            SlotSoundController.Instance().playAudio("BonusHit", "FX");
            this.node.runAction(cc.sequence(
                playFeatureAni,
                cc.delayTime(1),
                changeSymbol,
                cc.delayTime(1),
                completeCallback
            ));
        } else {
            // 播放Ex动画 + BonusExpect音效
            SlotSoundController.Instance().playAudio("BonusExpect", "FX");
            this.node.runAction(cc.sequence(
                playExAni,
                cc.delayTime(1.33),
                changeSymbol,
                cc.delayTime(1),
                completeCallback
            ));
        }
    }

    /**
     * 清空所有动画节点的子元素
     */
    public clearAllAnis(): void {
        if (TSUtility.isValid(this.symbolNode)) {
            this.symbolNode.removeAllChildren(true);
        }
        if (TSUtility.isValid(this.moveNode)) {
            this.moveNode.removeAllChildren(true);
        }
    }
}