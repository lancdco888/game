// 游戏专属模块
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotManager from '../../manager/SlotManager';
import ReelController_Base from '../../ReelController_Base';
import ReelMachine_Base from '../../ReelMachine_Base';
import Reel from '../../Slot/Reel';
import State, { ConcurrentState, SequencialState } from '../../Slot/State';
import Reel_RainbowPearl from './Reel_RainbowPearl';
import ReelController_RainbowPearl from './ReelController_RainbowPearl';

const { ccclass, property } = cc._decorator;

/**
 * RainbowPearl滚轮管理器（继承自基础滚轮管理器）
 * 负责Jackpot模式下滚轮的状态、显示、符号固定等核心逻辑
 */
@ccclass('ReelMachine_RainbowPearl')
export default class ReelMachine_RainbowPearl extends ReelMachine_Base {
    /** Jackpot模式下的滚轮控制器数组 */
    @property({ type: [ReelController_Base] })
    public jackpotReels: ReelController_Base[] = [];

    /** Jackpot模式下滚轮停止音效播放标记（5列对应5个标记） */
    public flagsPlayReelStopSoundJackpotMode: boolean[] = [false, false, false, false, false];

    /** 暗屏节点（原代码引用但未定义，补充属性以兼容逻辑） */
    @property({ type: cc.Node, visible: false })
    public dimmScreenNode: cc.Node | null = null;

    /**
     * 获取Linked Jackpot模式下的滚轮状态
     * @returns SequencialState 组合后的时序状态
     */
    public getLinkedJackpotReelState(): SequencialState {
        // 创建时序状态和并发状态容器
        const seqState = new SequencialState();
        const concurrentState = new ConcurrentState();

        // 更新历史窗口符号（替换指定符号列表）
        SlotGameResultManager.Instance.changeLastHistoryWindowsSymbol(
            [21, 22, 23, 11, 12, 13, 14, 15, 71],
            [21, 22, 23, 11, 12, 13, 14, 15]
        );

        // 为每个Jackpot滚轮添加对应的Linked Jackpot旋转状态
        this.jackpotReels.forEach(jackpotReel => {
            const reelController = jackpotReel.getComponent(ReelController_RainbowPearl);
            if (reelController) {
                concurrentState.insert(reelController.getLinkedJackpotSpinState());
            }
        });

        // 创建状态：初始化音效标记 + 计算Jackpot模式奖金
        const initState = new State();
        initState.addOnStartCallback(() => {
            // 重置5列滚轮停止音效标记
            this.flagsPlayReelStopSoundJackpotMode = [false, false, false, false, false];
            
            // 计算Jackpot模式总奖金
            SlotGameResultManager.Instance.winMoneyInJackpotMode = 
                SlotGameResultManager.Instance.winMoneyInLinkedJackpotMode + 
                SlotGameResultManager.Instance.getWinningCoin();
            
            initState.setDone();
        });

        // 将初始化状态加入并发状态
        concurrentState.insert(initState);

        // 将并发状态加入时序状态（优先级0）
        seqState.insert(0, concurrentState);

        // 播放滚轮旋转音效
        SlotManager.Instance.playReelSpinSound();

        // 并发状态结束时停止旋转音效
        concurrentState.addOnEndCallback(() => {
            SlotManager.Instance.stopReelSpinSound();
        });

        return seqState;
    }

    /**
     * 显示Jackpot模式滚轮（隐藏普通滚轮，设置Jackpot滚轮符号）
     */
    public showJackpotReel(): void {
        // 隐藏普通滚轮
        this.reels.forEach(reel => {
            if (reel.node) reel.node.active = false;
        });

        // 显示Jackpot滚轮
        this.jackpotReels.forEach(jackpotReel => {
            if (jackpotReel.node) jackpotReel.node.active = true;
        });

        // 获取历史窗口和符号信息
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const resultSymbolInfoArray = SlotGameResultManager.Instance.getResultSymbolInfoArray();

        // 校验数据有效性后设置Jackpot滚轮符号
        if (lastHistoryWindows && lastHistoryWindows.size > 0) {
            this.jackpotReels.forEach((jackpotReel, index) => {
                // 计算滚轮对应的列和行（3行5列布局）
                const col = Math.floor(index / 3);
                const row = Math.floor(index % 3);
                
                // 获取对应位置的符号ID和符号信息
                const symbolId = lastHistoryWindows.GetWindow(col).getSymbol(row);
                const symbolInfo = resultSymbolInfoArray[col][row];
                
                // 设置滚轮符号并激活节点
                if (jackpotReel.node) {
                    jackpotReel.node.active = true;
                    const reelComp = jackpotReel.node.getComponent(Reel);
                    if (reelComp) {
                        reelComp.changeSymbol(0, symbolId, symbolInfo);
                    }
                }
            });

            // 设置Jackpot模式下符号的暗显/激活状态
            this.setSymbolsDimmActiveJackpotMode();
        }
    }

    /**
     * 设置Jackpot模式下符号的暗显/激活状态
     */
    public setSymbolsDimmActiveJackpotMode(): void {
        // 若暗屏节点未定义，则遍历Jackpot滚轮设置符号状态
        if (!this.dimmScreenNode) {
            this.jackpotReels.forEach(jackpotReel => {
                if (jackpotReel) {
                    const reelComp = jackpotReel.getComponent(Reel);
                    const rainbowReelComp = reelComp?.getComponent(Reel_RainbowPearl);
                    if (rainbowReelComp) {
                        rainbowReelComp.setSymbolsDimmActiveJackpot();
                    }
                }
            });
        }
    }

    /**
     * 处理Jackpot符号固定逻辑（根据符号信息显示/隐藏滚轮节点）
     * @param symbolInfoArray 符号信息二维数组
     */
    public processFixJackpotSymbol(symbolInfoArray: any[][]): void {
        symbolInfoArray.forEach((colInfo, colIndex) => {
            colInfo.forEach((symbolInfo, rowIndex) => {
                // 计算Jackpot滚轮的索引（3行5列：colIndex*3 + rowIndex）
                const reelIndex = 3 * colIndex + rowIndex;
                const jackpotReelNode = this.jackpotReels[reelIndex]?.node;
                
                if (jackpotReelNode) {
                    // 无符号信息或类型为空时显示节点，否则隐藏
                    const isActive = !symbolInfo || symbolInfo.type === "";
                    jackpotReelNode.active = isActive;
                }
            });
        });
    }
}