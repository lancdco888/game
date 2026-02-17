
import Reel from '../../Slot/Reel';
import SlotSoundController from '../../Slot/SlotSoundController';
import State from '../../Slot/State';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import TSUtility from '../../global_utility/TSUtility';
import ViewResizeManager from '../../global_utility/ViewResizeManager';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotManager from '../../manager/SlotManager';
import SymbolPoolManager from '../../manager/SymbolPoolManager';
import JackpotSymbol_SharkAttack from './JackpotSymbol_SharkAttack';
import MovingLightComponent_SharkAttack from './MovingLightComponent_SharkAttack';

const { ccclass, property } = cc._decorator;

/**
 * 鲨鱼攻击游戏大奖收集组件
 * 负责处理大奖闲置动画、奖金收集特效、Wild倍数计算与展示、奖金数字移动等核心逻辑
 */
@ccclass('JackpotCollectComponent_SharkAttack')
export default class JackpotCollectComponent_SharkAttack extends cc.Component {
    // 水流移动特效预制体
    @property({ type: cc.Prefab })
    movingWater: cc.Prefab = null!;

    // 数字移动特效预制体数组
    @property({ type: [cc.Prefab] })
    movingNumber: cc.Prefab[] = [];

    // 奖金数字目标位置节点（底部UI）
    @property({ type: cc.Node })
    targetBottom: cc.Node = null!;

    // 奖金收集成功动画组件
    @property({ type: cc.Animation })
    receiveFx: cc.Animation = null!;

    // 大奖闲置动画根节点
    @property({ type: cc.Node })
    jackpotIdleNode: cc.Node = null!;

    // 动态创建的预制体节点缓存
    private _prefab: cc.Node[] = [];

    // 不同滚轮行数对应的缩放比例
    private scaleState: number[] = [1, 0.88, 0.72];

    // 累计中奖金额缓存
    private _beforeWinningCoin: number = 0;

    // 大奖闲置动画节点列表
    private _idleAnimationList: cc.Node[] = [];

    /**
     * 生命周期：组件加载时注册视图大小调整监听
     */
    onLoad(): void {
        ViewResizeManager.Instance().addHandler(this);
    }

    /**
     * 生命周期：组件销毁时移除视图大小调整监听
     */
    onDestroy(): void {
        ViewResizeManager.RemoveHandler(this);
    }

    /**
     * 视图大小调整前的回调（空实现，保留扩展）
     */
    onBeforeResizeView(): void {}

    /**
     * 视图大小调整中的回调（空实现，保留扩展）
     */
    onResizeView(): void {}

    /**
     * 视图大小调整后的回调：刷新奖金目标位置
     */
    onAfterResizeView(): void {
        this.refresh();
    }

    /**
     * 刷新奖金数字目标位置，对齐底部UI的奖金标签
     */
    refresh(): void {
        if (TSUtility.isValid(SlotManager.Instance.bottomUIText)) {
            const winMoneyLabelNode = SlotManager.Instance.bottomUIText.getWinMoneyLabel().node;
            // 同步目标位置和特效位置到奖金标签
            TSUtility.setNodePositionToTarget(this.targetBottom, winMoneyLabelNode);
            TSUtility.setNodePositionToTarget(this.receiveFx.node, winMoneyLabelNode);
        }
    }

    /**
     * 获取大奖闲置动画状态（创建并返回State实例）
     * @returns State 大奖闲置动画状态对象
     */
    getJackpotIdleAnimationState(): State {
        const state = new State();
        const self = this;

        state.addOnStartCallback(function() {
            const resultSymbolInfoArray = SlotGameResultManager.Instance.getResultSymbolInfoArray();
            const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
            let jackpotSymbolNode: cc.Node | null = null;

            // 遍历滚轮窗口，查找大奖符号（91）并创建闲置动画
            for (let i = 2; i < lastHistoryWindows.size; ++i) {
                let symbolCount = 0;
                const window = lastHistoryWindows.GetWindow(i);
                
                for (let u = 0; u < window.size; ++u) {
                    if (window.getSymbol(u) === 91) {
                        // 从符号池获取大奖符号动画节点
                        jackpotSymbolNode = SymbolPoolManager.instance.getSymbolAni(90);
                        jackpotSymbolNode.getComponent(JackpotSymbol_SharkAttack).setSymbolInfo(resultSymbolInfoArray[i][u]);
                        self.jackpotIdleNode.addChild(jackpotSymbolNode);

                        // 计算符号全局位置并转换为闲置节点本地坐标
                        const reelComp = SlotManager.Instance.reelMachine.reels[i].getComponent(Reel);
                        const globalPos = reelComp.getGlobalPosition.call(reelComp, u);
                        jackpotSymbolNode.position = self.jackpotIdleNode.convertToNodeSpaceAR(globalPos);

                        self._idleAnimationList.push(jackpotSymbolNode);
                        symbolCount++;
                    }
                }

                if (symbolCount === 0) break;
            }

            state.setDone();
        });

        return state;
    }

    /**
     * 获取奖金收集状态（处理奖金收集特效和金额累加）
     * @param reelIndex 滚轮索引
     * @param rowIndex 行索引
     * @param baseWin 基础奖金
     * @param multiplier 倍数
     * @param symbolInfo 符号信息
     * @param idleIndex 闲置动画索引
     * @returns State 奖金收集状态对象
     */
    getCollectPrizeState(
        reelIndex: number, 
        rowIndex: number, 
        baseWin: number, 
        multiplier: number, 
        symbolInfo: any, 
        idleIndex: number
    ): State {
        const state = new State();
        const self = this;

        state.addOnStartCallback(function() {
            // 获取当前子游戏的滚轮行数配置
            const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            let reelRow = SlotGameResultManager.Instance.getSubGameState(subGameKey).gauges.reelRow;
            reelRow = reelRow ?? 0; // 空值处理

            // 创建水流移动特效组件
            const movingLightComp = self.createMovingComponents(self.movingWater);
            
            // 释放闲置的大奖符号动画节点
            SymbolPoolManager.instance.releaseSymbolAni(self._idleAnimationList[idleIndex]);
            
            // 播放符号收集动画
            SymbolAnimationController.Instance.mustPlayAnimationSymbol(
                reelIndex, 
                rowIndex, 
                291, 
                null, 
                SlotManager.Instance.reelMachine, 
                false
            ).getComponent(JackpotSymbol_SharkAttack).setSymbolInfo(symbolInfo);

            // 累计中奖金额
            if (self._beforeWinningCoin === 0) {
                self._beforeWinningCoin = baseWin + multiplier;
            } else {
                self._beforeWinningCoin += baseWin;
            }

            self.refresh();

            // 播放奖金收集特效
            movingLightComp.playCollectPrize(
                reelIndex, 
                rowIndex, 
                self.scaleState[reelRow], 
                self.targetBottom, 
                self._beforeWinningCoin, 
                function() {
                    // 特效完成后播放收集成功动画
                    self.scheduleOnce(function() {
                        state.setDone();
                    }, 0.2);
                    self.receiveFx.node.active = true;
                    self.receiveFx.play();
                }
            );
        });

        return state;
    }

    /**
     * 移除所有水流特效和闲置动画节点
     */
    removeAllWaterLight(): void {
        const self = this;

        // 延迟停止收集成功动画
        this.scheduleOnce(function() {
            self.receiveFx.stop();
            self.receiveFx.node.active = false;
        }, 1);

        // 销毁动态创建的预制体节点
        for (let t = 0; t < this._prefab.length; ++t) {
            this._prefab[t].removeFromParent(true);
        }

        // 清空缓存列表
        this._idleAnimationList = [];
        this._prefab = [];
        
        // 停止所有符号动画
        SymbolAnimationController.Instance.stopAllAnimationSymbol();
    }

    /**
     * 获取Wild倍数收集状态（处理倍数计算和奖金数字动画）
     * 注意：原文件存在拼写错误 Multuplier → 保留以兼容原有调用
     * @param reelIndex 滚轮索引
     * @param rowIndex 行索引
     * @param multiplier 倍数
     * @param baseWin 基础奖金
     * @param duration 动画时长
     * @returns State Wild倍数收集状态对象
     */
    getCollectWildMultuplierState(
        reelIndex: number, 
        rowIndex: number, 
        multiplier: number, 
        baseWin: number, 
        duration: number
    ): State {
        const state = new State();
        const self = this;

        state.addOnStartCallback(function() {
            // 获取当前子游戏的滚轮行数配置
            const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            let reelRow = SlotGameResultManager.Instance.getSubGameState(subGameKey).gauges.reelRow;
            reelRow = reelRow ?? 0; // 空值处理

            const numberIndex = multiplier - 2;
            // 创建数字移动特效组件
            const movingLightComp = self.createMovingComponents(self.movingNumber[numberIndex]);
            let totalWin = self._beforeWinningCoin;

            // 计算累计奖金（首次/非首次）
            if (totalWin === 0) {
                totalWin = baseWin * multiplier;
                self._beforeWinningCoin = baseWin;
            } else {
                totalWin = self._beforeWinningCoin * multiplier;
            }

            self.refresh();

            // 播放倍数收集特效
            movingLightComp.playCollectWildMultiplier(
                reelIndex, 
                rowIndex, 
                self.scaleState[reelRow], 
                self.targetBottom, 
                totalWin, 
                function() {
                    // 播放奖金递增音效
                    SlotSoundController.Instance().playAudio("IncrementCoin", "FXLoop");
                    // 更新底部UI奖金显示
                    SlotManager.Instance.bottomUIText.setWinMoney(self._beforeWinningCoin);
                    // 清空所有定时器
                    self.unscheduleAllCallbacks();
                    // 重置并播放收集成功动画
                    self.receiveFx.setCurrentTime(0);
                    self.receiveFx.node.active = true;
                    self.receiveFx.play();

                    // 播放奖金数字变化动画
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(
                        self._beforeWinningCoin, 
                        totalWin, 
                        function() {
                            // 播放奖金递增结束音效
                            self.playIncrementEndCoinSound();
                            self._beforeWinningCoin = totalWin;
                            // 延迟标记状态完成
                            self.scheduleOnce(function() {
                                state.setDone();
                            }, 0.2);
                        }, 
                        duration, 
                        1
                    );
                }
            );
        });

        return state;
    }

    /**
     * 移除Wild倍数特效节点
     */
    removeWildMultiplier(): void {
        const self = this;

        // 延迟停止收集成功动画
        this.scheduleOnce(function() {
            self.receiveFx.stop();
            self.receiveFx.node.active = false;
        }, 1);

        // 销毁动态创建的预制体节点
        for (let t = 0; t < this._prefab.length; ++t) {
            this._prefab[t].removeFromParent(true);
        }

        // 清空预制体缓存
        this._prefab = [];
    }

    /**
     * 重置累计中奖金额缓存
     */
    resetBeforeWinningCoin(): void {
        this._beforeWinningCoin = 0;
    }

    /**
     * 创建移动特效组件（水流/数字）
     * @param prefab 特效预制体
     * @returns MovingLightComponent_SharkAttack 移动特效组件实例
     */
    createMovingComponents(prefab: cc.Prefab): MovingLightComponent_SharkAttack {
        const node = cc.instantiate(prefab);
        const comp = node.getComponent(MovingLightComponent_SharkAttack)!;
        this.node.addChild(node);
        this._prefab.push(node);
        return comp;
    }

    /**
     * 播放奖金递增结束音效
     */
    playIncrementEndCoinSound(): void {
        // 停止递增中音效
        SlotSoundController.Instance().stopAudio("IncrementCoin", "FXLoop");
        // 有奖金时播放结束音效
        if (SlotGameResultManager.Instance.getTotalWinMoney() > 0 && SlotSoundController.Instance().getAudioClip("IncrementEndCoin")) {
            SlotSoundController.Instance().playAudio("IncrementEndCoin", "FX");
        }
    }
}