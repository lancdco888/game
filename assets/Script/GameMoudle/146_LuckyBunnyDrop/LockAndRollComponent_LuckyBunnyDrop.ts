const { ccclass, property } = cc._decorator;


import GameComponent_LuckyBunnyDrop from './GameComponent_LuckyBunnyDrop';
import ReelMachine_LuckyBunnyDrop from './ReelMachine_LuckyBunnyDrop';
import JackpotSymbolComponent_LucykyBunnyDrop from './JackpotSymbolComponent_LucykyBunnyDrop';
import JackpotSymbolInfoHelper_LuckyBunnyDrop from './JackpotSymbolInfoHelper_LuckyBunnyDrop';
import LockAndRollRewardComponent_LuckyBunnyDrop from './LockAndRollRewardComponent_LuckyBunnyDrop';
import SymbolPoolManager from '../../manager/SymbolPoolManager';
import SymbolAni from '../../Slot/SymbolAni';
import Symbol from '../../Slot/Symbol';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import TSUtility from '../../global_utility/TSUtility';
import SlotManager from '../../manager/SlotManager';
import Reel from '../../Slot/Reel';
import SymbolAnimationController from '../../Slot/SymbolAnimationController';
import { BottomTextType } from '../../SubGame/BottomUIText';
import SlotSoundController from '../../Slot/SlotSoundController';

/**
 * LuckyBunnyDrop LockAndRoll核心组件
 * 负责LockAndRoll模式下符号固定/移动/移除、奖励计算、动画播放、音效控制、层级管理等核心逻辑
 */
@ccclass()
export default class LockAndRollComponent_LuckyBunnyDrop extends cc.Component {
    // 固定符号节点数组
    @property([cc.Node])
    public fixSymbol_Nodes: cc.Node[] = [];

    // 固定符号动画根节点
    @property(cc.Node)
    public fixAniSymbol_Node: cc.Node | null = null;

    // 移除特效节点
    @property(cc.Node)
    public remove_Fx: cc.Node | null = null;

    // 奖励组件引用
    @property(LockAndRollRewardComponent_LuckyBunnyDrop)
    public reward_Component: LockAndRollRewardComponent_LuckyBunnyDrop | null = null;

    // 私有变量：符号是否固定（5列×3行）
    private _isFixed: boolean[][] = [
        [false, false, false],
        [false, false, false],
        [false, false, false],
        [false, false, false],
        [false, false, false]
    ];

    // 私有变量：固定符号节点（5列×3行）
    private _fixNodes: (cc.Node | any)[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];

    // 私有变量：符号移动度数（5列×3行，原JS拼写mvoeCheck保留）
    private _moveDgree: number[][] = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];

    // 私有变量：Jackpot列索引数组
    private _jackpotCol: number[] = [];

    // 私有变量：倍数列索引数组
    private _multiCols: number[] = [];

    // 私有变量：计数列索引数组
    private _countCols: number[] = [];

    // 私有变量：总赢取金额（原JS拼写WinMoeny保留）
    private _totalWinMoeny: number = 0;

    /**
     * 初始化组件状态（重置所有固定符号、数组、金额）
     */
    public init(): void {
        // 清空固定动画符号节点
        this.clearNode(this.fixAniSymbol_Node!);

        // 重置5列×3行的符号状态
        for (let col = 0; col < 5; ++col) {
            for (let row = 0; row < 3; ++row) {
                this._isFixed[col][row] = false;
                this._moveDgree[col][row] = 0;
                this._fixNodes[col][row] = null;
                this.clearNode(this.fixSymbol_Nodes[3 * col + row]);
            }
        }

        // 重置数组和金额
        this._jackpotCol = [];
        this._multiCols = [];
        this._countCols = [];
        this._totalWinMoeny = 0;
    }

    /**
     * 设置启动时的固定窗口（初始化LockAndRoll符号布局）
     */
    public setStartFixWindow(): void {
        // 判断是否为免费旋转模式，获取子游戏状态key
        const subGameKey = SlotReelSpinStateManager.Instance.getFreespinMode() 
            ? "lockNRollTumble_fromFreeSpin" 
            : "lockNRollTumble";
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
        const prevSubGameState = SlotGameResultManager.Instance.getSubGameState(subGameState.prevSubGameKey);
        
        // 初始化总赢取金额
        this._totalWinMoeny = TSUtility.isValid(subGameState.pots?.Pot_inLockNroll) 
            ? subGameState.pots.Pot_inLockNroll.pot 
            : 0;

        // 重置所有Reel的符号为0
        const reelMachine = SlotManager.Instance.reelMachine.getComponent(ReelMachine_LuckyBunnyDrop);
        for (let col = 0; col < 5; ++col) {
            for (let row = 0; row < 3; ++row) {
                const reelComp = reelMachine.lockAndRoll_Reels[3 * col + row].getComponent(Reel);
                reelComp.changeSymbol(0, 0);
                reelComp.changeSymbol(1, 0);
                reelComp.changeSymbol(2, 0);
            }
        }

        // 场景1：当前子游戏有lastWindows且spinCnt>1 → 固定符号
        if (TSUtility.isValid(subGameState.lastWindows) && subGameState.spinCnt > 1) {
            for (let col = 0; col < 5; ++col) {
                for (let row = 0; row < 3; ++row) {
                    if (subGameState.lastWindows[col][row] >= 90) {
                        this.fixSymbolAni(col, row, subGameState.lastWindows[col][row]);
                        this._isFixed[col][row] = true;
                    }
                }
            }
        }
        // 场景2：前一个子游戏有lastWindows → 固定符号
        else if (TSUtility.isValid(prevSubGameState.lastWindows)) {
            for (let col = 0; col < 5; ++col) {
                for (let row = 0; row < 3; ++row) {
                    if (prevSubGameState.lastWindows[col][row] >= 90) {
                        this.fixSymbolAni(col, row, prevSubGameState.lastWindows[col][row]);
                        this._isFixed[col][row] = true;
                    }
                }
            }
        }
        // 场景3：从锁定窗口获取符号 → 固定符号
        else {
            for (let col = 0; col < 5; ++col) {
                for (let row = 0; row < 3; ++row) {
                    const lockedSymbol = subGameState.getLockedWindowSymbol(col, row);
                    if (lockedSymbol > 0) {
                        this.fixSymbolAni(col, row, lockedSymbol);
                        this._isFixed[col][row] = true;
                    }
                }
            }
        }

        // 首次移动单元格 + 重置层级
        this.firstMoveCell();
        this.resetZorder();
    }

    /**
     * 设置固定窗口（更新LockAndRoll符号布局）
     * @param callback 完成后的回调函数
     * @param customWindow 自定义窗口数据（可选）
     */
    public setFixWindow(callback: Function, customWindow: number[][] | null = null): void {
        // 获取历史窗口数据
        const historyWindow = SlotGameResultManager.Instance.getHistoryWindow(0);
        const windowData: number[][] = [
            [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]
        ];

        // 初始化窗口数据
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const symbol = historyWindow.GetWindow(col).getSymbol(row);
                const reelIdx = 3 * col + row;
                const reelComp = SlotManager.Instance.reelMachine.getComponent(ReelMachine_LuckyBunnyDrop)
                    .lockAndRoll_Reels[reelIdx].getComponent(Reel);

                if (symbol >= 90) {
                    windowData[col][row] = symbol;
                    reelComp.changeSymbol(0, 0);
                    reelComp.changeSymbol(1, symbol);
                    reelComp.changeSymbol(2, 0);
                } else {
                    reelComp.changeSymbol(0, 0);
                    reelComp.changeSymbol(1, 0);
                    reelComp.changeSymbol(2, 0);
                }
            }
        }

        // 停止所有符号动画
        SymbolAnimationController.Instance.stopAllAnimationSymbol();

        // 使用自定义窗口或默认窗口数据
        const targetWindow = customWindow ?? windowData;
        if (TSUtility.isValid(targetWindow)) {
            for (let col = 0; col < 5; ++col) {
                for (let row = 0; row < 3; ++row) {
                    if (targetWindow[col][row] >= 90 && this.fixSymbolAni(col, row, targetWindow[col][row]) === 1) {
                        this._isFixed[col][row] = true;
                    }
                }
            }
        }

        // 执行回调
        TSUtility.isValid(callback) && callback();
    }

    /**
     * 播放固定符号动画（创建符号节点并设置Jackpot信息）
     * @param col 列索引
     * @param row 行索引
     * @param symbolId 符号ID
     * @returns 是否成功创建节点（1=成功，0=失败）
     */
    public fixSymbolAni(col: number, row: number, symbolId: number): number {
        let isCreated = false;
        const reelMachine = SlotManager.Instance.reelMachine.getComponent(ReelMachine_LuckyBunnyDrop);

        // 节点未创建时才初始化
        if (this._fixNodes[col][row] === null) {
            // 从符号池获取动画符号
            const symbolNode = SymbolPoolManager.instance.getSymbolAni(100);
            symbolNode.scale = 1;
            symbolNode.opacity = 255;
            symbolNode.x = 186 * col - 372;
            symbolNode.y = 144 - 144 * row;
            
            // 添加到动画根节点
            this.fixAniSymbol_Node?.addChild(symbolNode);
            this._fixNodes[col][row] = symbolNode;

            // 设置Jackpot符号信息
            this.setJakcpotSymbol(symbolNode, symbolId, col, row);
            
            // 隐藏对应Reel节点
            reelMachine.lockAndRoll_Reels[3 * col + row].node.active = false;
            isCreated = true;

            // 重置层级
            this.resetZorder();
        }

        return isCreated ? 1 : 0;
    }

    /**
     * 移动检查（判断是否需要移动符号，更新移动度数）
     * @returns 是否需要移动（1=需要，0=不需要）
     */
    public mvoeCheck(): boolean { // 保留原JS拼写错误，避免调用冲突
        let needMove = false;

        // 重置移动度数
        for (let col = 0; col < 5; ++col) {
            for (let row = 0; row < 3; ++row) {
                this._moveDgree[col][row] = 0;
            }
        }

        // 检查每列的符号移动规则
        for (let col = 0; col < 5; col++) {
            // 行1有符号，行2无 → 下移1格
            if (this._isFixed[col][1] === true && this._isFixed[col][2] === false) {
                this._moveDgree[col][1] = 1;
                this._isFixed[col][1] = false;
                this._isFixed[col][2] = true;
                needMove = true;
            }

            // 行0有符号，行1无
            if (this._isFixed[col][0] === true && this._isFixed[col][1] === false) {
                // 行2也无 → 下移2格
                if (this._isFixed[col][2] === false) {
                    this._moveDgree[col][0] = 2;
                    this._isFixed[col][0] = false;
                    this._isFixed[col][1] = false;
                    this._isFixed[col][2] = true;
                    needMove = true;
                }
                // 行2有 → 下移1格
                else {
                    this._moveDgree[col][0] = 1;
                    this._isFixed[col][0] = false;
                    this._isFixed[col][1] = true;
                    needMove = true;
                }
            }
        }

        return needMove;
    }

    /**
     * 移动单元格（递归处理符号移动和移除）
     * @param callback 完成后的回调函数
     */
    public moveCells(callback: Function): void {
        // 检查是否需要移动
        if (this.mvoeCheck() === true) {
            this.moveCell(() => {
                // 移动后检查是否需要移除
                if (this.removeCell(() => {
                    this.moveCells(callback);
                }) === 0) {
                    TSUtility.isValid(callback) && callback();
                }
            });
        }
        // 无需移动 → 检查移除
        else {
            if (this.removeCell(() => {
                this.moveCells(callback);
            }) === 0) {
                TSUtility.isValid(callback) && callback();
            }
        }
    }

    /**
     * 首次移动单元格（无动画，直接更新位置）
     */
    public firstMoveCell(): void {
        this.mvoeCheck();
        const reelMachine = SlotManager.Instance.reelMachine.getComponent(ReelMachine_LuckyBunnyDrop);

        // 更新符号位置
        for (let col = 0; col < 5; col++) {
            for (let row = 2; row >= 0; row--) {
                if (this._moveDgree[col][row] > 0 && this._fixNodes[col][row] !== null) {
                    const symbolNode = this._fixNodes[col][row];
                    const targetRow = row + this._moveDgree[col][row];
                    
                    // 更新节点坐标
                    symbolNode!.x = 186 * col - 372;
                    symbolNode!.y = 144 - 144 * targetRow;
                    
                    // 更新节点引用
                    this._fixNodes[col][row] = null;
                    this._isFixed[col][targetRow] = true;
                    this._fixNodes[col][targetRow] = symbolNode;
                }
            }
        }

        // 重置层级 + 更新Reel节点显示状态
        this.resetZorder();
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const reelNode = reelMachine.lockAndRoll_Reels[3 * col + row].node;
                reelNode.active = this._fixNodes[col][row] === null;
            }
        }
    }

    /**
     * 移动单元格（带动画）
     * @param callback 完成后的回调函数
     */
    public moveCell(callback: Function): void {
        const reelMachine = SlotManager.Instance.reelMachine.getComponent(ReelMachine_LuckyBunnyDrop);

        // 处理每个符号的移动
        for (let col = 0; col < 5; col++) {
            for (let row = 2; row >= 0; row--) {
                if (this._moveDgree[col][row] > 0 && this._fixNodes[col][row] !== null) {
                    const oldSymbolNode = this._fixNodes[col][row];
                    const rewardID = oldSymbolNode!.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)!.getRewardID();
                    
                    // 移除旧节点，从符号池获取新动画节点
                    oldSymbolNode!.removeFromParent();
                    const newSymbolNode = SymbolPoolManager.instance.getSymbolAni(102);
                    
                    // 初始化新节点
                    newSymbolNode.scale = 1;
                    newSymbolNode.opacity = 255;
                    newSymbolNode.x = 186 * col - 372;
                    newSymbolNode.y = 144 - 144 * row;
                    this.fixAniSymbol_Node?.addChild(newSymbolNode);
                    
                    // 播放动画 + 设置Jackpot信息
                    newSymbolNode.getComponent(SymbolAni)!.playAnimation();
                    this.setJakcpotSymbol(newSymbolNode, rewardID!, col, row);
                    
                    // 移动动画（0.3秒下移对应行数）
                    const targetRow = row + this._moveDgree[col][row];
                    newSymbolNode.runAction(
                        cc.moveBy(0.3, new cc.Vec2(0, -144 * this._moveDgree[col][row]))
                    );
                    
                    // 更新Reel符号 + 节点引用
                    reelMachine.lockAndRoll_Reels[3 * col + row].getComponent(Reel)!.changeSymbol(1, 0);
                    this._fixNodes[col][row] = null;
                    this._isFixed[col][targetRow] = true;
                    this._fixNodes[col][targetRow] = newSymbolNode;
                }
            }
        }

        // 播放移动音效
        SlotSoundController.Instance().playAudio("LNRMove", "FX");
        
        // 重置层级 + 更新Reel节点显示状态
        this.resetZorder();
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const reelNode = reelMachine.lockAndRoll_Reels[3 * col + row].node;
                reelNode.active = this._fixNodes[col][row] === null;
            }
        }

        // 延迟0.4秒执行回调
        this.scheduleOnce(() => {
            TSUtility.isValid(callback) && callback();
        }, 0.4);
    }

    /**
     * 移除单元格（处理符号移除和奖励发放）
     * @param callback 完成后的回调函数
     * @returns 是否需要移除（1=需要，0=不需要）
     */
    public removeCell(callback: Function): number {
        const needRemove = this.removeCheck();
        if (needRemove === 1) {
            const jackpotCols = this.getJackpotCol();
            this._multiCols = [];
            this._countCols = [];

            // 处理每列的符号移除
            for (let col = 0; col < 5; col++) {
                if (this._isFixed[col][2] !== null) {
                    const oldSymbolNode = this._fixNodes[col][2];
                    if (!oldSymbolNode) {
                        cc.log("null");
                        continue;
                    }

                    // 获取Jackpot符号信息
                    const jackpotComp = oldSymbolNode.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)!;
                    const symbolId = jackpotComp._symbolID;
                    const jackpotType = jackpotComp.getJackpotType();
                    const multiplier = jackpotComp._multiplier;
                    const prize = jackpotComp._prize;
                    
                    // 移除旧节点，从符号池获取新动画节点
                    oldSymbolNode.removeFromParent();
                    const newSymbolNode = SymbolPoolManager.instance.getSymbolAni(90);
                    
                    // 初始化新节点
                    newSymbolNode.scale = 1;
                    newSymbolNode.opacity = 255;
                    newSymbolNode.x = 186 * col - 372;
                    newSymbolNode.y = -144;
                    this.fixAniSymbol_Node?.addChild(newSymbolNode);
                    
                    // 播放动画 + 设置Jackpot信息
                    newSymbolNode.getComponent(SymbolAni)!.playAnimation();
                    this._fixNodes[col][2] = newSymbolNode;
                    newSymbolNode.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)!.setCenterInfo(symbolId, jackpotType, multiplier);
                    
                    // 分类记录列索引（92=计数，93=倍数）
                    if (symbolId === 92) {
                        this._countCols.push(col);
                    } else if (symbolId === 93) {
                        this._multiCols.push(col);
                    }

                    // 重置层级
                    this.resetZorder();
                } else {
                    cc.log("null");
                }
            }

            // 播放奖励音效
            SlotSoundController.Instance().playAudio("LNRReward", "FX");

            // 奖励执行链：Jackpot → 倍数 → 计数 → 金币
            const rewardCoin = () => this.rewardCoin(callback);
            const rewardCount = () => this.rewardCount(rewardCoin);
            const rewardMulti = () => this.rewardMulti(rewardCount);

            // 延迟2秒执行奖励逻辑
            this.scheduleOnce(() => {
                if (jackpotCols.length <= 0) {
                    TSUtility.isValid(rewardMulti) && rewardMulti();
                } else {
                    let idx = 0;
                    const processJackpot = () => {
                        idx++;
                        if (idx < jackpotCols.length) {
                            this.rewardJackpot(jackpotCols[idx], processJackpot);
                        } else {
                            cc.log("Come In Reward");
                            TSUtility.isValid(rewardMulti) && rewardMulti();
                        }
                    };
                    this.rewardJackpot(jackpotCols[idx], processJackpot);
                }
            }, 2);
        }

        return needRemove;
    }

    /**
     * 获取Jackpot列索引数组（按Jackpot类型排序）
     * @returns Jackpot列索引数组
     */
    public getJackpotCol(): number[] {
        const jackpotComps: JackpotSymbolComponent_LucykyBunnyDrop[] = [];
        const jackpotCols: number[] = [];

        // 收集有效Jackpot组件
        for (let col = 0; col < 5; col++) {
            const symbolNode = this._fixNodes[col][2];
            if (TSUtility.isValid(symbolNode) && symbolNode!.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)) {
                const jackpotComp = symbolNode!.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)!;
                jackpotComp.setCol(col);
                
                // 仅收集有金额且JackpotType>0的组件
                if (jackpotComp.getJackpotType() > 0) {
                    if (jackpotComp.getMoney() === 0) {
                        cc.log("Not Have Money");
                        continue;
                    }
                    jackpotComps.push(jackpotComp);
                }
            }
        }

        // 按JackpotType升序排序
        jackpotComps.sort((a, b) => {
            if (a._jackpotType < b._jackpotType) return -1;
            if (a._jackpotType > b._jackpotType) return 1;
            return 0;
        });

        // 提取列索引
        for (let i = 0; i < jackpotComps.length; i++) {
            jackpotCols.push(jackpotComps[i].getCol());
        }

        if (jackpotCols.length > 0) cc.log("Have Jackpot");
        return jackpotCols;
    }

    /**
     * 移除检查（判断是否所有列的第3行都有固定符号）
     * @returns 是否需要移除（1=需要，0=不需要）
     */
    public removeCheck(): number {
        let allFixed = true;
        for (let col = 0; col < 5; col++) {
            if (this._isFixed[col][2] === false) {
                allFixed = false;
                break;
            }
        }
        return allFixed ? 1 : 0;
    }

    /**
     * 发放Jackpot奖励
     * @param col 列索引
     * @param callback 完成后的回调函数
     */
    public rewardJackpot(col: number, callback: Function): void {
        const symbolNode = this._fixNodes[col][2];
        if (!symbolNode) return;

        // 获取Jackpot符号信息
        const jackpotComp = symbolNode.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)!;
        const symbolId = jackpotComp._symbolID;
        const jackpotType = jackpotComp.getJackpotType();
        const multiplier = jackpotComp._multiplier;
        const prize = jackpotComp._prize;
        
        // 移除旧节点，从符号池获取新动画节点
        symbolNode.removeFromParent();
        const newSymbolNode = SymbolPoolManager.instance.getSymbolAni(90);
        
        // 初始化新节点
        newSymbolNode.scale = 1;
        newSymbolNode.opacity = 255;
        newSymbolNode.x = 186 * col - 372;
        newSymbolNode.y = -144;
        this.fixAniSymbol_Node?.addChild(newSymbolNode);
        
        // 播放动画 + 设置Jackpot信息
        newSymbolNode.getComponent(SymbolAni)!.playAnimation();
        this._fixNodes[col][2] = newSymbolNode;
        newSymbolNode.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)!.setCenterInfo(symbolId, jackpotType, multiplier);
        
        // 播放奖励音效
        SlotSoundController.Instance().playAudio("LNRReward", "FX");

        // 延迟2秒更新底部UI并执行回调
        this.scheduleOnce(() => {
            let winMoney = 0;
            let jackpotTypeVal = -1;
            if (TSUtility.isValid(jackpotComp)) {
                winMoney = jackpotComp.getMoney();
                jackpotTypeVal = jackpotComp.getJackpotType();
            }

            // 更新底部UI
            SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "JACKPOT");
            SlotManager.Instance.bottomUIText.setWinMoney(winMoney);
            
            // 打开Jackpot奖励弹窗
            SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop)!.jackpotResultPopup.open(
                winMoney, jackpotTypeVal, () => {
                    TSUtility.isValid(callback) ? callback() : cc.log("Not Have Jackpot");
                }
            );
        }, 2);
    }

    /**
     * 发放计数奖励
     * @param callback 完成后的回调函数
     */
    public rewardCount(callback: Function): void {
        if (this._countCols.length > 0) {
            // 处理每个计数列
            for (let i = 0; i < this._countCols.length; i++) {
                const col = this._countCols[i];
                const oldSymbolNode = this._fixNodes[col][2];
                if (!oldSymbolNode) continue;

                // 移除旧节点，从符号池获取新动画节点
                oldSymbolNode.removeFromParent();
                const newSymbolNode = SymbolPoolManager.instance.getSymbolAni(90);
                
                // 初始化新节点
                newSymbolNode.scale = 1;
                newSymbolNode.opacity = 255;
                newSymbolNode.x = 186 * col - 372;
                newSymbolNode.y = -144;
                this.fixAniSymbol_Node?.addChild(newSymbolNode);
                
                // 播放动画 + 设置计数符号信息
                newSymbolNode.getComponent(SymbolAni)!.playAnimation();
                this._fixNodes[col][2] = newSymbolNode;
                newSymbolNode.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)!.setCenterInfo(92, -1, -1);
            }

            // 播放计数奖励动画 + 音效
            this.reward_Component?.playCount(this._countCols);
            SlotSoundController.Instance().playAudio("LNRAdd", "FX");

            // 延迟2.3秒执行回调
            this.scheduleOnce(() => {
                TSUtility.isValid(callback) && callback();
            }, 2.3);
        } else {
            TSUtility.isValid(callback) && callback();
        }
    }

    /**
     * 发放倍数奖励
     * @param callback 完成后的回调函数
     */
    public rewardMulti(callback: Function): void {
        if (this._multiCols.length > 0) {
            // 处理每个倍数列
            for (let i = 0; i < this._multiCols.length; i++) {
                const col = this._multiCols[i];
                const oldSymbolNode = this._fixNodes[col][2];
                if (!oldSymbolNode) continue;

                // 移除旧节点，从符号池获取新动画节点
                oldSymbolNode.removeFromParent();
                const newSymbolNode = SymbolPoolManager.instance.getSymbolAni(90);
                
                // 初始化新节点
                newSymbolNode.scale = 1;
                newSymbolNode.opacity = 255;
                newSymbolNode.x = 186 * col - 372;
                newSymbolNode.y = -144;
                this.fixAniSymbol_Node?.addChild(newSymbolNode);
                
                // 播放动画 + 设置倍数符号信息
                newSymbolNode.getComponent(SymbolAni)!.playAnimation();
                this._fixNodes[col][2] = newSymbolNode;
                newSymbolNode.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)!.setCenterInfo(93, -1, -1);
            }

            // 播放倍数奖励动画 + 音效
            this.reward_Component?.playMulti(this._multiCols);
            SlotSoundController.Instance().playAudio("LNRAdd", "FX");

            // 延迟2.3秒执行回调
            this.scheduleOnce(() => {
                TSUtility.isValid(callback) && callback();
            }, 2.3);
        } else {
            TSUtility.isValid(callback) && callback();
        }
    }

    /**
     * 发放金币奖励
     * @param callback 完成后的回调函数
     */
    public rewardCoin(callback: Function): void {
        const reelMachine = SlotManager.Instance.reelMachine.getComponent(ReelMachine_LuckyBunnyDrop);
        let totalReward = 0;

        // 显示移除特效 + 播放音效
        this.remove_Fx!.active = true;
        SlotSoundController.Instance().playAudio("LNRRemove", "FX");

        // 处理每列的金币奖励
        for (let col = 0; col < 5; col++) {
            const symbolNode = this._fixNodes[col][2];
            if (!TSUtility.isValid(symbolNode)) {
                return void cc.log("Not Have Node");
            }

            // 获取Jackpot符号信息
            const jackpotComp = symbolNode!.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)!;
            const symbolId = jackpotComp._symbolID;
            const jackpotType = jackpotComp.getJackpotType();
            const multiplier = jackpotComp._multiplier;
            const prize = jackpotComp._prize;
            
            // 移除旧节点，从符号池获取新动画节点
            symbolNode!.removeFromParent();
            const newSymbolNode = SymbolPoolManager.instance.getSymbolAni(101);
            
            // 初始化新节点
            newSymbolNode.scale = 1;
            newSymbolNode.opacity = 255;
            newSymbolNode.x = 186 * col - 372;
            newSymbolNode.y = -144;
            this.fixAniSymbol_Node?.addChild(newSymbolNode);
            
            // 设置Jackpot信息并累加奖励
            newSymbolNode.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)!.setCenterInfo(symbolId, jackpotType, multiplier);
            const money = newSymbolNode.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)!.getMoney();
            if (money > 0) {
                newSymbolNode.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)!.getRewardID();
                totalReward += money;
            }

            // 更新节点引用 + 重置层级
            this._fixNodes[col][2] = newSymbolNode;
            this.resetZorder();
        }

        // 累加总奖励（包含Pot金额）
        totalReward += this._totalWinMoeny;
        
        // 更新底部UI（总赢取金额动画）
        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "TOTAL WIN");
        SlotManager.Instance.bottomUIText.playChangeWinMoney(this._totalWinMoeny, totalReward, null, null, 2);
        this._totalWinMoeny = totalReward;

        // 延迟2秒清理节点并执行回调
        this.scheduleOnce(() => {
            // 隐藏移除特效
            this.remove_Fx!.active = false;

            // 清理所有符号节点
            for (let col = 0; col < 5; col++) {
                if (this._fixNodes[col][2] !== null) {
                    this._fixNodes[col][2]!.removeFromParent();
                    this._fixNodes[col][2] = null;
                    this._isFixed[col][2] = false;
                    
                    // 显示Reel节点并重置符号
                    const reelNode = reelMachine.lockAndRoll_Reels[3 * col + 2];
                    reelNode.node.active = true;
                    reelNode.getComponent(Reel)!.changeSymbol(1, 0);
                }
            }

            // 执行回调
            TSUtility.isValid(callback) && callback();
        }, 2);
    }

    /**
     * 设置Jackpot符号信息
     * @param symbolNode 符号节点
     * @param symbolId 符号ID
     * @param col 列索引
     * @param row 行索引
     */
    public setJakcpotSymbol(symbolNode: cc.Node, symbolId: number, col: number, row: number): void {
        let jackpotType = -1;
        let prize = -1;
        let multiplier = -1;

        // 过滤有效符号ID（90/100/200无效，92/93为特殊符号）
        if (symbolId > 90 && symbolId !== 92 && symbolId !== 93 && (symbolId !== 90 && symbolId !== 100 && symbolId !== 200)) {
            // 符号ID<100时，从Helper获取结果ID
            if (symbolId < 100) {
                symbolId = JackpotSymbolInfoHelper_LuckyBunnyDrop.getResultID(col, row);
            }

            // 获取符号信息
            const symbolInfo = JackpotSymbolInfoHelper_LuckyBunnyDrop.getSymbolInfo(symbolId);
            
            // Jackpot类型（mini/minor/major/mega/grand）
            if (symbolInfo.type === "jackpot") {
                jackpotType = symbolInfo.key === "mini" ? 1 :
                              symbolInfo.key === "minor" ? 2 :
                              symbolInfo.key === "major" ? 3 :
                              symbolInfo.key === "mega" ? 4 : 5;
            }
            // 倍数类型
            else if (symbolInfo.type === "multiplier") {
                jackpotType = 0;
                prize = symbolInfo.prize;
                multiplier = symbolInfo.multiplier;
            }
        }

        // 设置Jackpot符号中心信息
        symbolNode.getComponent(JackpotSymbolComponent_LucykyBunnyDrop)!.setCenterInfo(symbolId, jackpotType, multiplier);
    }

    /**
     * 重置节点层级（按Y坐标排序，确保下方节点显示在顶层）
     */
    public resetZorder(): void {
        if (!this.fixAniSymbol_Node) return;

        const children = this.fixAniSymbol_Node.children;
        const sortedNodes: cc.Node[] = [];

        // 按Y坐标升序排序（Y越小，层级越高）
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            let inserted = false;
            
            for (let j = 0; j < sortedNodes.length; j++) {
                if (sortedNodes[j].getSiblingIndex() === node.getSiblingIndex() && sortedNodes[j].y <= node.y) {
                    sortedNodes.splice(j, 0, node);
                    inserted = true;
                    break;
                }
            }
            
            if (!inserted) {
                sortedNodes.push(node);
            }
        }

        // 更新节点层级
        for (let i = 0; i < sortedNodes.length; i++) {
            if (sortedNodes[i] !== null) {
                sortedNodes[i].setSiblingIndex(i);
            }
        }
    }

    /**
     * 清空节点（释放符号池中的节点）
     * @param parentNode 父节点
     */
    public clearNode(parentNode: cc.Node): void {
        const childCount = parentNode.childrenCount;
        for (let i = 0; i < childCount; ++i) {
            const childNode = parentNode.children[0];
            if (!childNode) continue;

            // 释放Symbol或SymbolAni节点到池
            const symbolComp = childNode.getComponent(Symbol);
            if (symbolComp) {
                SymbolPoolManager.instance.releaseSymbol(symbolComp);
            } else {
                const symbolAniComp = childNode.getComponent(SymbolAni);
                if (symbolAniComp) {
                    SymbolPoolManager.instance.releaseSymbolAni(childNode);
                }
            }
        }

        // 移除所有子节点
        parentNode.removeAllChildren();
    }

    /**
     * 检查指定位置是否有固定符号
     * @param col 列索引
     * @param row 行索引
     * @returns 是否有固定符号
     */
    public isFilled(col: number, row: number): boolean {
        return this._fixNodes[col][row] !== null;
    }
}