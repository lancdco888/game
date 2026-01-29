import SymbolAni from "../../../../Script/Slot/SymbolAni";
import Symbol from "../../../../Script/Slot/Symbol";
import SlotGameResultManager, { Cell, JackpotResult, ResultSymbolInfo } from "../../../../Script/manager/SlotGameResultManager";
import SymbolPoolManager from "../../../../Script/manager/SymbolPoolManager";
import PrizeComponent_HoundOfHades from "./PrizeComponent_HoundOfHades";
import ReelMachine_HoundOfHades from "./ReelMachine_HoundOfHades";
import SlotManager from "../../../../Script/manager/SlotManager";
import TSUtility from "../../../../Script/global_utility/TSUtility";
import SlotSoundController from "../../../../Script/Slot/SlotSoundController";
import HoundOfHadesManager from "./HoundOfHadesManager";
import HoundsComponent_HoundOfHades from "./HoundsComponent_HoundOfHades";
import SlotGameRuleManager from "../../../../Script/manager/SlotGameRuleManager";
import LangLocaleManager from "../../../../Script/manager/LangLocaleManager";
import { BottomTextType } from "../../../../Script/SubGame/BottomUIText";
import CaculateComponent_HoundOfHades from "./CaculateComponent_HoundOfHades";
import BonusGreenComponent_HoundOfHades from "./BonusGreenComponent_HoundOfHades";
import BonusRedComponent_HoundOfHades from "./BonusRedComponent_HoundOfHades";
import MultiFxComponent_HoundOfHades from "./MultiFxComponent_HoundOfHades";
import BonusBlueeComponent_HoundOfHades from "./BonusBlueeComponent_HoundOfHades";
import MoveGreen_HoundOfHades from "./MoveGreen_HoundOfHades";
import MoveWinmoneyComponent_HoundOfHades from "./MoveWinmoneyComponent_HoundOfHades";


const { ccclass, property } = cc._decorator;

/**
 * 哈迪斯之犬 - 锁符号组件
 * 核心职责：
 * 1. 锁符号的创建/销毁/位置管理
 * 2. 红绿蓝Bonus触发与动画处理
 * 3. Jackpot奖励计算与展示
 * 4. 奖金统计与UI更新
 * 5. 节点Z轴层级重置
 */
@ccclass('LockComponent_HoundOfHades')
export default class LockComponent_HoundOfHades extends cc.Component {
    // ====== Cocos 属性面板配置 ======
    /** 锁符号根节点（所有锁符号的父节点） */
    @property(cc.Node)
    public lock_Node: cc.Node = null;

    /** 奖金计算移动组件 */
    @property(MoveWinmoneyComponent_HoundOfHades)
    public caculateMove_Node: MoveWinmoneyComponent_HoundOfHades = null;

    /** 绿色Bonus移动组件 */
    @property(MoveGreen_HoundOfHades)
    public move_Jackpot: MoveGreen_HoundOfHades = null;

    /** 倍数特效节点 */
    @property(cc.Node)
    public multiple_FX: cc.Node | null = null;

    // ====== 私有常量（符号尺寸，原代码硬编码值） ======
    /** 符号宽度 */
    private readonly _width: number = 160;
    /** 符号高度 */
    private readonly _height: number = 128;

    // ====== 私有成员变量 ======
    /** 锁符号节点二维数组 [列][行] */
    private _lockNodes: cc.Node[][] = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];
    /** 总赢钱数 */
    private _winMoney: number = 0;
    /** 新增奖励数 */
    private _addPrize: number = 0;
    /** Jackpot结果数组 */
    private _jackpotResult: JackpotResult[] = [];

    // ====== 核心方法 - 锁符号管理 ======
    /**
     * 清理所有已填充的锁符号（释放资源+清空数组）
     */
    clearFilledSymbols(): void {
        if (!this.lock_Node) {
            console.warn("LockComponent: lock_Node 未配置！");
            return;
        }

        // 释放所有符号资源
        const childCount = this.lock_Node.childrenCount;
        for (let i = 0; i < childCount; ++i) {
            const childNode = this.lock_Node.children[0];
            if (childNode) {
                // 释放Symbol组件
                const symbolComp = childNode.getComponent(Symbol);
                if (symbolComp) {
                    SymbolPoolManager.instance.releaseSymbol(symbolComp);
                }
                // 释放SymbolAni组件
                const symbolAniComp = childNode.getComponent(SymbolAni);
                if (symbolAniComp) {
                    SymbolPoolManager.instance.releaseSymbolAni(childNode);
                }
            }
        }

        // 移除所有子节点
        this.lock_Node.removeAllChildren(true);

        // 清空锁符号数组
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                this._lockNodes[col][row] = null;
            }
        }
    }

    /**
     * 修复窗口无特效的符号（填充锁符号）
     * @param windowArr 窗口符号数组
     * @param resultInfoArr 结果信息数组
     */
    fixWindowNoneEffect(windowArr: number[][], resultInfoArr: ResultSymbolInfo[][]): void {
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                let symbolId = windowArr[col][row];
                const resultInfo = resultInfoArr[col][row];
                
                // 符号ID大于100则减100（业务规则）
                if (symbolId > 100) {
                    symbolId -= 100;
                }

                // 仅处理目标符号（61绿/62红/63蓝/91Jackpot）
                if (symbolId === 61 || symbolId === 62 || symbolId === 63 || symbolId === 91) {
                    this.setLockSymbol(col, row, symbolId, resultInfo);
                }
            }
        }

        // 重置Z轴层级
        this.resetZorder();
    }

    /**
     * 设置锁符号（创建并挂载到lock_Node）
     * @param col 列索引
     * @param row 行索引
     * @param symbolId 符号ID
     * @param resultInfo 结果信息
     */
    setLockSymbol(col: number, row: number, symbolId: number, resultInfo: ResultSymbolInfo): void {
        // 已存在则跳过
        if (this._lockNodes[col][row] !== null) return;

        if (!this.lock_Node) {
            console.warn("LockComponent: lock_Node 未配置，无法创建锁符号！");
            return;
        }

        // 计算符号索引和AniID（业务规则：>100则+100，否则+200）
        const symbolIndex = 3 * col + row;
        const aniId = symbolId > 100 ? symbolId + 100 : symbolId + 200;
        
        // 从对象池获取SymbolAni
        const symbolNode = SymbolPoolManager.instance.getSymbolAni(aniId);
        this.lock_Node.addChild(symbolNode);

        // 设置奖金中心信息（仅目标符号）
        const prizeComp = symbolNode.getComponent(PrizeComponent_HoundOfHades);
        if (prizeComp) {
            if ([61, 161, 62, 162, 63, 163, 91, 191].includes(symbolId)) {
                prizeComp.setCenterInfo(resultInfo);
            }
        }

        // 设置符号位置
        symbolNode.setPosition(new cc.Vec2(
            -2 * this._width + this._width * col,
            this._height - this._height * row
        ));

        // 保存到锁符号数组
        this._lockNodes[col][row] = symbolNode;

        // 隐藏滚轮对应位置的节点
        const reelMachine = SlotManager.Instance.reelMachine?.getComponent(ReelMachine_HoundOfHades);
        if (reelMachine?.lockNRollReels[symbolIndex]) {
            reelMachine.lockNRollReels[symbolIndex].node.active = false;
        }
    }

    /**
     * 设置初始锁符号（用于首次加载）
     * @param col 列索引
     * @param row 行索引
     * @param symbolId 符号ID
     */
    setStartLockSymbol(col: number, row: number, symbolId: number): void {
        const targetNode = this._lockNodes[col][row];
        
        // 释放原有符号资源
        if (TSUtility.isValid(targetNode)) {
            const symbolComp = targetNode.getComponent(Symbol);
            if (symbolComp) {
                SymbolPoolManager.instance.releaseSymbol(symbolComp);
            } else {
                const symbolAniComp = targetNode.getComponent(SymbolAni);
                if (symbolAniComp) {
                    SymbolPoolManager.instance.releaseSymbolAni(targetNode);
                }
            }
        }

        if (!this.lock_Node) {
            console.warn("LockComponent: lock_Node 未配置，无法设置初始锁符号！");
            return;
        }

        // 计算符号索引和AniID
        const symbolIndex = 3 * col + row;
        const aniId = symbolId > 100 ? symbolId + 100 : symbolId + 200;
        
        // 从对象池获取SymbolAni
        const symbolNode = SymbolPoolManager.instance.getSymbolAni(aniId);
        this.lock_Node.addChild(symbolNode);

        // 初始化奖金信息
        const prizeComp = symbolNode.getComponent(PrizeComponent_HoundOfHades);
        if (prizeComp) {
            prizeComp.initPrize();
        }

        // 设置位置
        symbolNode.setPosition(new cc.Vec2(
            -2 * this._width + this._width * col,
            this._height - this._height * row
        ));

        // 保存到数组
        this._lockNodes[col][row] = symbolNode;

        // 隐藏滚轮节点
        const reelMachine = SlotManager.Instance.reelMachine?.getComponent(ReelMachine_HoundOfHades);
        if (reelMachine?.lockNRollReels[symbolIndex]) {
            reelMachine.lockNRollReels[symbolIndex].node.active = false;
        }
    }

    /**
     * 设置首次Bonus窗口的锁符号
     */
    setFirstBonusWindow(): void {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        if (!lastHistoryWindows) return;

        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const symbolId = lastHistoryWindows.GetWindow(col).getSymbol(row);
                // 仅处理红绿蓝符号
                if (symbolId === 61 || symbolId === 62 || symbolId === 63) {
                    this.setStartLockSymbol(col, row, symbolId);
                }
            }
        }
    }

    /**
     * 设置首次窗口的Jackpot符号
     * @param callback 完成回调
     */
    setFirstWindow(callback?: () => void): void {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        if (!lastHistoryWindows) {
            callback && callback();
            return;
        }

        // 收集所有Jackpot符号位置（91/191）
        const jackpotCells: Cell[] = [];
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const symbolId = lastHistoryWindows.GetWindow(col).getSymbol(row);
                if (symbolId === 91 || symbolId === 191) {
                    jackpotCells.push(new Cell(col, row));
                }
            }
        }

        // 无Jackpot符号则直接回调
        if (jackpotCells.length <= 0) {
            callback && callback();
            return;
        }

        // 递归处理每个Jackpot符号
        let currentCell: Cell | null = null;
        const processNextCell = () => {
            if (jackpotCells.length > 0) {
                currentCell = jackpotCells[0];
                jackpotCells.splice(0, 1);
                this.setStartAppearSymbol(currentCell.col, currentCell.row, processNextCell);
            } else {
                callback && callback();
            }
        };

        // 1秒后开始处理第一个符号
        this.scheduleOnce(() => {
            currentCell = jackpotCells[0];
            jackpotCells.splice(0, 1);
            this.setStartAppearSymbol(currentCell.col, currentCell.row, processNextCell);
        }, 1);
    }

    /**
     * 设置首次出现的Jackpot符号（播放动画）
     * @param col 列索引
     * @param row 行索引
     * @param callback 完成回调
     */
    setStartAppearSymbol(col: number, row: number, callback?: () => void): void {
        const targetNode = this._lockNodes[col][row];
        
        // 释放原有符号资源
        if (TSUtility.isValid(targetNode)) {
            const symbolComp = targetNode.getComponent(Symbol);
            if (symbolComp) {
                SymbolPoolManager.instance.releaseSymbol(symbolComp);
            } else {
                const symbolAniComp = targetNode.getComponent(SymbolAni);
                if (symbolAniComp) {
                    SymbolPoolManager.instance.releaseSymbolAni(targetNode);
                }
            }
        }

        if (!this.lock_Node) {
            console.warn("LockComponent: lock_Node 未配置，无法设置出现符号！");
            callback && callback();
            return;
        }

        // 计算符号索引，获取97号Ani符号
        const symbolIndex = 3 * col + row;
        const symbolNode = SymbolPoolManager.instance.getSymbolAni(97);
        this.lock_Node.addChild(symbolNode);

        // 构建结果信息（重置倍数为1）
        const originResult = SlotGameResultManager.Instance.getResultSymbolInfoArray()[col][row];
        const resultInfo: any = {
            multiplier: 1,
            key: originResult.key,
            prize: originResult.prize,
            prizeUnit: originResult.prizeUnit,
            subID: originResult.subID
        };

        // 设置奖金信息并播放动画
        const prizeComp = symbolNode.getComponent(PrizeComponent_HoundOfHades);
        if (prizeComp) {
            prizeComp.setCenterInfo(resultInfo, true);
        }

        // 设置位置
        symbolNode.setPosition(new cc.Vec2(
            -2 * this._width + this._width * col,
            this._height - this._height * row
        ));

        // 播放动画
        const symbolAniComp = symbolNode.getComponent(SymbolAni);
        if (symbolAniComp) {
            symbolAniComp.playAnimation();
        }

        // 保存到数组
        this._lockNodes[col][row] = symbolNode;

        // 隐藏滚轮节点
        const reelMachine = SlotManager.Instance.reelMachine?.getComponent(ReelMachine_HoundOfHades);
        if (reelMachine?.lockNRollReels[symbolIndex]) {
            reelMachine.lockNRollReels[symbolIndex].node.active = false;
        }

        // 播放音效
        SlotSoundController.Instance().playAudio("JackpotStartAppear", "FX");

        // 重置Z轴层级
        this.resetZorder();

        // 0.5秒后回调
        this.scheduleOnce(() => {
            callback && callback();
        }, 0.5);
    }

    /**
     * 设置出现的符号（Bonus/Jackpot）
     * @param col 列索引
     * @param row 行索引
     * @param symbolId 符号ID
     */
    setAppearSymbol(col: number, row: number, symbolId: number): void {
        // 已存在则跳过
        if (this._lockNodes[col][row] !== null) return;

        // 符号ID大于100则减100
        let targetSymbolId = symbolId;
        if (targetSymbolId > 100) {
            targetSymbolId -= 100;
        }

        let aniId = 0;
        const gameManager = HoundOfHadesManager.getInstance();

        // 处理红绿蓝Bonus符号
        if (targetSymbolId === 61 || targetSymbolId === 62 || targetSymbolId === 63) {
            gameManager.game_components.setLockNRollDelay(false);
            aniId = targetSymbolId + 5;
            SlotSoundController.Instance().playAudio("BonusAppear", "FX");
        }
        // 处理Jackpot符号
        else if (targetSymbolId === 91) {
            gameManager.game_components.setLockNRollDelay(false);
            aniId = targetSymbolId + 5;
            SlotSoundController.Instance().playAudio("JackpotAppear", "FX");
        }
        // 非目标符号直接返回
        else {
            return;
        }

        if (!this.lock_Node) {
            console.warn("LockComponent: lock_Node 未配置，无法设置出现符号！");
            return;
        }

        // 获取并添加符号节点
        const symbolNode = SymbolPoolManager.instance.getSymbolAni(aniId);
        this.lock_Node.addChild(symbolNode);

        // 获取结果信息
        const resultInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[col][row];

        // 初始化奖金信息（仅Bonus符号）
        const prizeComp = symbolNode.getComponent(PrizeComponent_HoundOfHades);
        if (prizeComp) {
            if (targetSymbolId === 61 || targetSymbolId === 62 || targetSymbolId === 63) {
                prizeComp.initPrize();
            } else if (targetSymbolId === 91) {
                prizeComp.setCenterInfo(resultInfo, true);
            }
        }

        // 设置位置
        symbolNode.setPosition(new cc.Vec2(
            -2 * this._width + this._width * col,
            this._height - this._height * row
        ));

        // 播放动画
        const symbolAniComp = symbolNode.getComponent(SymbolAni);
        if (symbolAniComp) {
            symbolAniComp.playAnimation();
        }

        // 保存到数组并重置Z轴
        this._lockNodes[col][row] = symbolNode;
        this.resetZorder();
    }

    /**
     * 隐藏滚轮对应位置的节点
     * @param col 列索引
     * @param row 行索引
     * @param symbolId 符号ID
     */
    setHideReel(col: number, row: number, symbolId: number): void {
        // 符号ID大于100则减100
        let targetSymbolId = symbolId;
        if (targetSymbolId > 100) {
            targetSymbolId -= 100;
        }

        // 仅处理目标符号
        if (targetSymbolId === 61 || targetSymbolId === 62 || targetSymbolId === 63 || targetSymbolId === 91) {
            const symbolIndex = 3 * col + row;
            const reelMachine = SlotManager.Instance.reelMachine?.getComponent(ReelMachine_HoundOfHades);
            if (reelMachine?.lockNRollReels[symbolIndex]) {
                reelMachine.lockNRollReels[symbolIndex].node.active = false;
            }
        }
    }

    // ====== 核心方法 - Bonus处理（蓝/红/绿） ======
    /**
     * 检查并处理蓝色Bonus符号
     * @param callback 完成回调
     */
    checkBlue(callback?: () => void): void {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        if (!lastHistoryWindows) {
            callback && callback();
            return;
        }

        // 收集新的蓝色Bonus符号位置（163且isNewBlue）
        const blueCells: Cell[] = [];
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const symbolId = lastHistoryWindows.GetWindow(col).getSymbol(row);
                if (symbolId === 163 && this.isNewBlue(col, row)) {
                    blueCells.push(new Cell(col, row));
                }
            }
        }

        // 无蓝色符号则直接回调
        if (blueCells.length <= 0) {
            callback && callback();
            return;
        }

        // 递归处理每个蓝色符号
        let currentCell: Cell | null = null;
        const processNextCell = () => {
            if (blueCells.length > 0) {
                currentCell = blueCells[0];
                blueCells.splice(0, 1);
                this.bonusBlue(currentCell.col, currentCell.row, processNextCell);
            } else {
                callback && callback();
            }
        };

        currentCell = blueCells[0];
        blueCells.splice(0, 1);
        this.bonusBlue(currentCell.col, currentCell.row, processNextCell);
    }

    /**
     * 检查是否为新的蓝色符号
     * @param col 列索引
     * @param row 行索引
     * @returns 是否为新蓝色符号
     */
    isNewBlue(col: number, row: number): boolean {
        const historyWindows = SlotGameResultManager.Instance.getHistoryWindows();
        for (let i = 0; i < historyWindows.length; i++) {
            const symbolId = historyWindows[i].GetWindow(col).getSymbol(row);
            if (symbolId === 63) {
                return true;
            }
        }
        return false;
    }

    /**
     * 处理蓝色Bonus逻辑
     * @param col 列索引
     * @param row 行索引
     * @param callback 完成回调
     */
    bonusBlue(col: number, row: number, callback?: () => void): void {
        const targetNode = this._lockNodes[col][row];

        // 节点有效则处理
        if (TSUtility.isValid(targetNode)) {
            this.scheduleOnce(() => {
                // 触发蓝色Feature
                const gameManager = HoundOfHadesManager.getInstance();
                const houndsComp = gameManager.game_components.houndsComponent?.getComponent(HoundsComponent_HoundOfHades);
                houndsComp.setBlueFeature();

                // 释放原有符号资源
                const symbolComp = targetNode.getComponent(Symbol);
                if (symbolComp) {
                    SymbolPoolManager.instance.releaseSymbol(symbolComp);
                } else {
                    const symbolAniComp = targetNode.getComponent(SymbolAni);
                    if (symbolAniComp) {
                        SymbolPoolManager.instance.releaseSymbolAni(targetNode);
                    }
                }

                // 移除节点并清空数组
                targetNode.removeFromParent(true);
                this._lockNodes[col][row] = null;

                if (!this.lock_Node) {
                    console.warn("LockComponent: lock_Node 未配置，无法创建蓝色Bonus符号！");
                    callback && callback();
                    return;
                }

                // 创建463号蓝色Bonus符号
                const bonusNode = SymbolPoolManager.instance.getSymbolAni(463);
                this.lock_Node.addChild(bonusNode);

                // 初始化奖金信息
                const prizeComp = bonusNode.getComponent(PrizeComponent_HoundOfHades);
                if (prizeComp) {
                    prizeComp.initMulti();
                    prizeComp.initPrize();
                }

                // 设置蓝色Bonus信息
                const blueBonusComp = bonusNode.getComponent(BonusBlueeComponent_HoundOfHades);
                const resultInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[col][row];
                if (blueBonusComp) {
                    blueBonusComp.setBlue(resultInfo, callback);
                }

                // 设置位置
                bonusNode.setPosition(new cc.Vec2(
                    -2 * this._width + this._width * col,
                    this._height - this._height * row
                ));

                // 保存到数组并重置Z轴
                this._lockNodes[col][row] = bonusNode;
                this.resetZorder();
            }, 0.5);
        } else {
            // 节点无效则直接回调
            callback && callback();
        }
    }

    /**
     * 检查并处理红色Bonus符号
     * @param callback 完成回调
     */
    checkRed(callback?: () => void): void {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        if (!lastHistoryWindows) {
            callback && callback();
            return;
        }

        // 收集新的红色Bonus符号位置（162且isNewRed）
        const redCells: Cell[] = [];
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const symbolId = lastHistoryWindows.GetWindow(col).getSymbol(row);
                
                // 处理红色符号
                if (symbolId === 162 && this.isNewRed(col, row)) {
                    redCells.push(new Cell(col, row));
                }
                
                // 处理绿色符号（初始化倍数）
                if (symbolId === 161 && !this.isNewGreen(col, row)) {
                    const targetNode = this._lockNodes[col][row];
                    if (TSUtility.isValid(targetNode)) {
                        const prizeComp = targetNode.getComponent(PrizeComponent_HoundOfHades);
                        prizeComp?.initMulti();
                    }
                }
            }
        }

        // 无红色符号则直接回调
        if (redCells.length <= 0) {
            callback && callback();
            return;
        }

        // 递归处理每个红色符号
        let currentCell: Cell | null = null;
        const processNextCell = () => {
            if (redCells.length > 0) {
                currentCell = redCells[0];
                redCells.splice(0, 1);
                this.setRed(currentCell.col, currentCell.row, processNextCell);
            } else {
                callback && callback();
            }
        };

        // 0.5秒后开始处理
        this.scheduleOnce(() => {
            currentCell = redCells[0];
            redCells.splice(0, 1);
            this.setRed(currentCell.col, currentCell.row, processNextCell);
        }, 0.5);
    }

    /**
     * 设置红色Bonus逻辑（核心动画+奖金翻倍）
     * @param col 列索引
     * @param row 行索引
     * @param callback 完成回调
     */
    setRed(col: number, row: number, callback?: () => void): void {
        const targetNode = this._lockNodes[col][row];

        // 节点有效则处理
        if (TSUtility.isValid(targetNode)) {
            // 步骤1：触发红色Feature
            const step1 = cc.callFunc(() => {
                const gameManager = HoundOfHadesManager.getInstance();
                const houndsComp = gameManager.game_components.houndsComponent?.getComponent(HoundsComponent_HoundOfHades);
                houndsComp?.setRedFeature();

                // 释放原有符号资源
                if (TSUtility.isValid(this._lockNodes[col][row])) {
                    const node = this._lockNodes[col][row];
                    if (node) {
                        const symbolComp = node.getComponent(Symbol);
                        if (symbolComp) {
                            SymbolPoolManager.instance.releaseSymbol(symbolComp);
                        } else {
                            const symbolAniComp = node.getComponent(SymbolAni);
                            if (symbolAniComp) {
                                SymbolPoolManager.instance.releaseSymbolAni(node);
                            }
                        }
                        node.removeFromParent(true);
                        this._lockNodes[col][row] = null;
                    }
                }

                if (!this.lock_Node) {
                    console.warn("LockComponent: lock_Node 未配置，无法创建红色Bonus符号！");
                    return;
                }

                // 创建462号红色Bonus符号
                const bonusNode = SymbolPoolManager.instance.getSymbolAni(462);
                this.lock_Node.addChild(bonusNode);

                // 设置红色Bonus信息
                const redBonusComp = bonusNode.getComponent(BonusRedComponent_HoundOfHades);
                redBonusComp?.setRed();

                // 设置位置
                bonusNode.setPosition(new cc.Vec2(
                    -2 * this._width + this._width * col,
                    this._height - this._height * row
                ));

                // 保存到数组
                this._lockNodes[col][row] = bonusNode;

                // 播放红色移动特效
                const multiFxComp = this.multiple_FX?.getComponent(MultiFxComponent_HoundOfHades);
                multiFxComp?.playRedMoveTartget(col, row);

                // 播放音效
                SlotSoundController.Instance().playAudio("Bonus2", "FX");

                // 重置Z轴
                this.resetZorder();
            });

            // 步骤2：更新所有符号的奖金信息（翻倍）
            const step2 = cc.callFunc(() => {
                const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
                const resultInfoArr = SlotGameResultManager.Instance.getResultSymbolInfoArray();

                if (!lastHistoryWindows || !resultInfoArr) return;

                for (let colIdx = 0; colIdx < 5; colIdx++) {
                    for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
                        // 获取上一行节点
                        const prevNode = rowIdx > 0 ? this._lockNodes[colIdx][rowIdx - 1] : null;
                        const symbolId = lastHistoryWindows.GetWindow(colIdx).getSymbol(rowIdx);
                        const targetNode = this._lockNodes[colIdx][rowIdx];

                        // 处理红色符号
                        if (symbolId === 162 && targetNode) {
                            let isNew = false;
                            // 新红色符号且位置在当前符号之前
                            if (this.isNewRed(colIdx, rowIdx) && (colIdx < col || (colIdx === col && rowIdx < row))) {
                                isNew = true;
                            }
                            // 非新红色符号或位置在前
                            if (!this.isNewRed(colIdx, rowIdx) || isNew) {
                                const prizeComp = targetNode.getComponent(PrizeComponent_HoundOfHades);
                                if (prizeComp) {
                                    prizeComp.setUpdateCenterInfo(resultInfoArr[colIdx][rowIdx]);
                                    prizeComp.setMultiAni("B2_feature_around_prize");
                                    prizeComp.node.setSiblingIndex(prizeComp.node.parent?.childrenCount || 0 - 1);
                                }
                            }
                        }

                        // 处理绿色符号
                        if (symbolId === 161 && !this.isNewGreen(colIdx, rowIdx) && targetNode) {
                            const prizeComp = targetNode.getComponent(PrizeComponent_HoundOfHades);
                            if (prizeComp) {
                                prizeComp.setUpdateCenterInfo(resultInfoArr[colIdx][rowIdx]);
                                prizeComp.setMultiAni("B3_feature_around_prize");
                                prizeComp.node.setSiblingIndex(prizeComp.node.parent?.childrenCount || 0 - 1);
                            }
                        }

                        // 处理蓝色符号
                        if (symbolId === 163 && targetNode) {
                            const prizeComp = targetNode.getComponent(PrizeComponent_HoundOfHades);
                            if (prizeComp) {
                                prizeComp.setUpdateCenterInfo(resultInfoArr[colIdx][rowIdx]);
                                prizeComp.setMultiAni("B1_feature_around_prize");
                                prizeComp.node.setSiblingIndex(prizeComp.node.parent?.childrenCount || 0 - 1);
                            }
                        }

                        // 处理Jackpot符号
                        if (symbolId === 191 && targetNode) {
                            const prizeComp = targetNode.getComponent(PrizeComponent_HoundOfHades);
                            if (prizeComp) {
                                prizeComp.setUpdateCenterInfo(resultInfoArr[colIdx][rowIdx]);
                                prizeComp.setMultiAni("J_feature_around_prize");
                                prizeComp.node.setSiblingIndex(prizeComp.node.parent?.childrenCount || 0 - 1);
                            }
                            // 上一行是Bonus符号则调整层级
                            if (prevNode) {
                                const prevSymbolId = lastHistoryWindows.GetWindow(colIdx).getSymbol(rowIdx - 1);
                                if (prevSymbolId === 161 || prevSymbolId === 162 || prevSymbolId === 163) {
                                    prevNode.setSiblingIndex(targetNode.parent?.childrenCount || 0 - 1);
                                }
                            }
                        }
                    }
                }

                // 播放翻倍音效
                SlotSoundController.Instance().playAudio("DoubleCoin", "FX");
            });

            // 步骤3：设置红色Bonus奖金
            const step3 = cc.callFunc(() => {
                const resultInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[col][row];
                const targetNode = this._lockNodes[col][row];
                if (TSUtility.isValid(resultInfo) && TSUtility.isValid(targetNode)) {
                    const redBonusComp = targetNode.getComponent(BonusRedComponent_HoundOfHades);
                    redBonusComp?.setPrizeRed(resultInfo);
                }
            });

            // 步骤4：清理特效并回调
            const step4 = cc.callFunc(() => {
                const multiFxComp = this.multiple_FX?.getComponent(MultiFxComponent_HoundOfHades);
                multiFxComp?.clearAllAnis();
                callback && callback();
                this.resetZorder();
            });

            // 执行动画序列
            this.node.runAction(cc.sequence(
                step1,
                cc.delayTime(2.5),
                step2,
                cc.delayTime(1),
                step3,
                cc.delayTime(0.5),
                step4
            ));
        } else {
            // 节点无效则直接回调
            callback && callback();
        }
    }

    /**
     * 检查是否为新的红色符号
     * @param col 列索引
     * @param row 行索引
     * @returns 是否为新红色符号
     */
    isNewRed(col: number, row: number): boolean {
        const historyWindows = SlotGameResultManager.Instance.getHistoryWindows();
        for (let i = 0; i < historyWindows.length; i++) {
            const symbolId = historyWindows[i].GetWindow(col).getSymbol(row);
            if (symbolId === 62) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查并处理绿色Bonus符号
     * @param callback 完成回调
     */
    checkGreen(callback?: () => void): void {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        if (!lastHistoryWindows) {
            callback && callback();
            return;
        }

        // 收集新的绿色Bonus符号位置（161且isNewGreen）
        const greenCells: Cell[] = [];
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const symbolId = lastHistoryWindows.GetWindow(col).getSymbol(row);
                if (symbolId === 161 && this.isNewGreen(col, row)) {
                    greenCells.push(new Cell(col, row));
                }
            }
        }

        // 无绿色符号则直接回调
        if (greenCells.length <= 0) {
            callback && callback();
            return;
        }

        // 递归处理每个绿色符号
        let currentCell: Cell | null = null;
        const processNextCell = () => {
            if (greenCells.length > 0) {
                currentCell = greenCells[0];
                greenCells.splice(0, 1);
                this.targetMoveBonus(currentCell.col, currentCell.row, processNextCell);
            } else {
                callback && callback();
            }
        };

        // 0.5秒后开始处理
        this.scheduleOnce(() => {
            currentCell = greenCells[0];
            greenCells.splice(0, 1);
            this.targetMoveBonus(currentCell.col, currentCell.row, processNextCell);
        }, 0.5);
    }

    /**
     * 绿色Bonus目标移动逻辑
     * @param col 列索引
     * @param row 行索引
     * @param callback 完成回调
     */
    targetMoveBonus(col: number, row: number, callback?: () => void): void {
        let count = 0;
        let targetCol = 0;
        let targetRow = 0;
        const originCol = col;
        const originRow = row;

        // 处理单个移动
        const processSingleMove = () => {
            count++;
            targetCol = Math.floor(count / 3);
            targetRow = Math.floor(count % 3);

            // 15次移动后清理动画并回调
            if (count < 15) {
                this.singleMoveBonus(targetCol, targetRow, originCol, originRow, processSingleMove);
            } else {
                this.scheduleOnce(() => {
                    this.move_Jackpot?.clearAllAnis();
                    callback && callback();
                }, 1);
            }
        };

        // 步骤1：创建绿色Bonus符号
        const step1 = cc.callFunc(() => {
            const targetNode = this._lockNodes[originCol][originRow];
            if (TSUtility.isValid(targetNode)) {
                // 释放资源
                const symbolComp = targetNode.getComponent(Symbol);
                if (symbolComp) {
                    SymbolPoolManager.instance.releaseSymbol(symbolComp);
                } else {
                    const symbolAniComp = targetNode.getComponent(SymbolAni);
                    if (symbolAniComp) {
                        SymbolPoolManager.instance.releaseSymbolAni(targetNode);
                    }
                }
                // 移除节点
                targetNode.removeFromParent(true);
            }

            if (!this.lock_Node) {
                console.warn("LockComponent: lock_Node 未配置，无法创建绿色Bonus符号！");
                return;
            }

            // 创建461号绿色Bonus符号
            const bonusNode = SymbolPoolManager.instance.getSymbolAni(461);
            this.lock_Node.addChild(bonusNode);

            // 设置绿色Bonus信息
            const greenBonusComp = bonusNode.getComponent(BonusGreenComponent_HoundOfHades);
            greenBonusComp?.setGreen();

            // 设置位置
            bonusNode.setPosition(new cc.Vec2(
                -2 * this._width + this._width * originCol,
                this._height - this._height * originRow
            ));

            // 保存到数组
            this._lockNodes[originCol][originRow] = bonusNode;

            // 触发绿色Feature
            const gameManager = HoundOfHadesManager.getInstance();
            const houndsComp = gameManager.game_components.houndsComponent?.getComponent(HoundsComponent_HoundOfHades);
            houndsComp?.setGreenFeature();

            // 播放音效
            SlotSoundController.Instance().playAudio("Ready_Green", "FX");
        });

        // 步骤2：开始单个移动
        const step2 = cc.callFunc(() => {
            this.singleMoveBonus(targetCol, targetRow, originCol, originRow, processSingleMove);
        });

        // 执行动画序列
        this.node.runAction(cc.sequence(
            step1,
            cc.delayTime(1.5),
            step2
        ));
    }

    /**
     * 获取最后一个符号索引
     * @param col 列索引
     * @returns 符号索引
     */
    getLastIndex(col: number): number {
        let lastIndex = 0;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        
        if (!lastHistoryWindows) return lastIndex;

        for (let colIdx = 0; colIdx < 5; colIdx++) {
            for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
                const symbolId = lastHistoryWindows.GetWindow(colIdx).getSymbol(rowIdx);
                // 新绿色符号且列>=目标列
                if (symbolId === 161 && this.isNewGreen(colIdx, rowIdx) && colIdx >= col) {
                    continue;
                }
                // 锁符号存在且ID>=100
                if (this._lockNodes[colIdx][rowIdx] === null || symbolId < 100) {
                    continue;
                }
                lastIndex = 3 * colIdx + rowIdx;
            }
        }

        return lastIndex;
    }

    /**
     * 单个绿色Bonus移动逻辑
     * @param col 目标列
     * @param row 目标行
     * @param originCol 原始列
     * @param originRow 原始行
     * @param callback 完成回调
     */
    singleMoveBonus(col: number, row: number, originCol: number, originRow: number, callback?: () => void): void {
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        if (!lastHistoryWindows) {
            callback && callback();
            return;
        }

        // 获取符号ID和结果信息
        const symbolId = lastHistoryWindows.GetWindow(col).getSymbol(row);
        const resultInfo = SlotGameResultManager.Instance.getResultSymbolInfoArray()[col][row];

        // 新绿色符号且列>=原始列 → 直接回调
        if (symbolId === 161 && this.isNewGreen(col, row) && col >= originCol) {
            callback && callback();
            return;
        }

        // 结果信息无效 → 直接回调
        if (!TSUtility.isValid(resultInfo) || !TSUtility.isValid(resultInfo.prize) || resultInfo.prize <= 0) {
            callback && callback();
            return;
        }

        // 计算奖金
        const prize = resultInfo.prize * (resultInfo.multiplier || 1);
        let winMoney = prize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
        
        // 固定金币则直接使用prize
        if (resultInfo.prizeUnit === "FixedCoin") {
            winMoney = resultInfo.prize;
        }

        // 播放移动动画
        this.move_Jackpot?.moveSymbol(col, row, originCol, originRow, symbolId, () => {
            // 添加奖金到绿色Bonus组件
            const targetNode = this._lockNodes[originCol][originRow];
            const greenBonusComp = targetNode?.getComponent(BonusGreenComponent_HoundOfHades);
            if (greenBonusComp) {
                greenBonusComp.addAmount(winMoney);
            } else {
                console.log("LockComponent: 绿色Bonus组件不存在，中断奖金添加");
            }
        });

        // 0.5秒后回调
        this.scheduleOnce(() => {
            callback && callback();
        }, 0.5);
    }

    /**
     * 检查是否为新的绿色符号
     * @param col 列索引
     * @param row 行索引
     * @returns 是否为新绿色符号
     */
    isNewGreen(col: number, row: number): boolean {
        const historyWindows = SlotGameResultManager.Instance.getHistoryWindows();
        for (let i = 0; i < historyWindows.length; i++) {
            const symbolId = historyWindows[i].GetWindow(col).getSymbol(row);
            if (symbolId === 61) {
                return true;
            }
        }
        return false;
    }

    // ====== 核心方法 - 奖金计算与展示 ======
    /**
     * 总赢钱特效
     * @param callback 完成回调
     */
    totalWinFx(callback?: () => void): void {
        const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
        
        // 无赢钱则直接回调
        if (totalWin <= 0) {
            callback && callback();
            return;
        }

        let hasValidSymbol = false;
        const spinResult = SlotGameResultManager.Instance.getSpinResult();
        const symbolInfoWindow = spinResult?.symbolInfoWindow;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();

        if (!symbolInfoWindow || !lastHistoryWindows) {
            callback && callback();
            return;
        }

        // 遍历所有位置
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const symbolId = lastHistoryWindows.GetWindow(col).getSymbol(row);
                const resultInfo = symbolInfoWindow[col][row];

                // 结果信息无效则跳过
                if (!TSUtility.isValid(resultInfo) || resultInfo.type === "") {
                    continue;
                }

                // 确定目标AniID
                let targetAniId = 0;
                if (symbolId === 91 || symbolId === 191) {
                    targetAniId = 91;
                } else if (symbolId === 61 || symbolId === 161) {
                    targetAniId = 61;
                } else if (symbolId === 62 || symbolId === 162) {
                    targetAniId = 62;
                } else if (symbolId === 63 || symbolId === 163) {
                    targetAniId = 63;
                } else {
                    continue;
                }

                // 释放原有符号资源
                const targetNode = this._lockNodes[col][row];
                if (targetNode) {
                    const symbolComp = targetNode.getComponent(Symbol);
                    if (symbolComp) {
                        SymbolPoolManager.instance.releaseSymbol(symbolComp);
                    } else {
                        const symbolAniComp = targetNode.getComponent(SymbolAni);
                        if (symbolAniComp) {
                            SymbolPoolManager.instance.releaseSymbolAni(targetNode);
                        }
                    }
                    targetNode.removeFromParent(true);
                    this._lockNodes[col][row] = null;
                }

                if (!this.lock_Node) {
                    console.warn("LockComponent: lock_Node 未配置，无法创建赢钱符号！");
                    continue;
                }

                // 创建新符号
                const symbolNode = SymbolPoolManager.instance.getSymbolAni(targetAniId);
                this.lock_Node.addChild(symbolNode);

                // 播放动画
                const symbolAniComp = symbolNode.getComponent(SymbolAni);
                symbolAniComp?.playAnimation();

                // 设置奖金信息
                const resultInfoArr = SlotGameResultManager.Instance.getResultSymbolInfoArray();
                const prizeComp = symbolNode.getComponent(PrizeComponent_HoundOfHades);
                if (prizeComp) {
                    prizeComp.setCenterInfo(resultInfoArr[col][row]);
                }

                // 设置位置
                symbolNode.setPosition(new cc.Vec2(
                    -2 * this._width + this._width * col,
                    this._height - this._height * row
                ));

                // 保存到数组
                this._lockNodes[col][row] = symbolNode;
                hasValidSymbol = true;
            }
        }

        // 重置Z轴
        this.resetZorder();

        // 有有效符号则播放音效并延迟回调
        if (hasValidSymbol) {
            SlotSoundController.Instance().playAudio("LockNRollWin", "FX");
            this.scheduleOnce(() => {
                callback && callback();
            }, 1.5);
        } else {
            callback && callback();
        }
    }

    /**
     * 计算Spin奖金
     * @param callback 完成回调
     */
    CalculateSpin(callback?: () => void): void {
        let count = 0;
        let targetCol = 0;
        let targetRow = 0;
        this._winMoney = 0;

        const totalWin = SlotGameResultManager.Instance.getTotalWinMoney();
        const spinResult = SlotGameResultManager.Instance.getSpinResult();
        const symbolInfoWindow = spinResult?.symbolInfoWindow;

        // 无赢钱则直接回调
        if (totalWin <= 0) {
            callback && callback();
            return;
        }

        // 保存Jackpot结果
        this._jackpotResult = spinResult?.jackpotResults || [];

        // 设置底部文本（TOTAL WIN）
        const langText = LangLocaleManager.getInstance().getLocalizedText("TOTAL WIN");
        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, langText.text);

        // 处理单个计算
        const processSingleCalculate = () => {
            count++;
            targetCol = Math.floor(count / 3);
            targetRow = Math.floor(count % 3);

            // 15次计算后更新UI并回调
            if (count < 15) {
                this.singleCaculate(targetCol, targetRow, symbolInfoWindow?.[targetCol][targetRow], processSingleCalculate);
            } else {
                this.scheduleOnce(() => {
                    SlotManager.Instance.bottomUIText.setWinMoney(this._winMoney, "TOTAL WIN");
                    this.caculateMove_Node?.clearAllAnis();
                    callback && callback();
                }, 1);
            }
        };

        // 初始化底部赢钱数
        SlotManager.Instance.bottomUIText.setWinMoney(this._winMoney, "TOTAL WIN");

        // 1秒后开始计算
        this.scheduleOnce(() => {
            this.singleCaculate(targetCol, targetRow, symbolInfoWindow?.[targetCol][targetRow], processSingleCalculate);
        }, 1);
    }

    /**
     * 单个位置奖金计算
     * @param col 列索引
     * @param row 行索引
     * @param resultInfo 结果信息
     * @param callback 完成回调
     */
    singleCaculate(col: number, row: number, resultInfo: ResultSymbolInfo | undefined, callback?: () => void): void {
        // 结果信息无效则直接回调
        if (!TSUtility.isValid(resultInfo) || resultInfo.type === "") {
            callback && callback();
            return;
        }

        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        if (!lastHistoryWindows) {
            callback && callback();
            return;
        }

        // 获取符号ID并确定目标AniID
        const symbolId = lastHistoryWindows.GetWindow(col).getSymbol(row);
        let targetAniId = 0;
        
        if (symbolId === 91 || symbolId === 191) {
            targetAniId = 391;
        } else if (symbolId === 61 || symbolId === 161) {
            targetAniId = 361;
        } else if (symbolId === 62 || symbolId === 162) {
            targetAniId = 362;
        } else if (symbolId === 63 || symbolId === 163) {
            targetAniId = 363;
        } else {
            callback && callback();
            return;
        }

        // 释放原有符号资源
        const targetNode = this._lockNodes[col][row];
        if (targetNode) {
            const symbolComp = targetNode.getComponent(Symbol);
            if (symbolComp) {
                SymbolPoolManager.instance.releaseSymbol(symbolComp);
            } else {
                const symbolAniComp = targetNode.getComponent(SymbolAni);
                if (symbolAniComp) {
                    SymbolPoolManager.instance.releaseSymbolAni(targetNode);
                }
            }
            targetNode.removeFromParent(true);
            this._lockNodes[col][row] = null;
        }

        if (!this.lock_Node) {
            console.warn("LockComponent: lock_Node 未配置，无法创建计算符号！");
            callback && callback();
            return;
        }

        // 创建计算符号
        const symbolNode = SymbolPoolManager.instance.getSymbolAni(targetAniId);
        this.lock_Node.addChild(symbolNode);

        // 设置计算信息
        const caculateComp = symbolNode.getComponent(CaculateComponent_HoundOfHades);
        caculateComp?.setCacualte(resultInfo, null);

        // 设置位置
        symbolNode.setPosition(new cc.Vec2(
            -2 * this._width + this._width * col,
            this._height - this._height * row
        ));

        // 保存到数组
        this._lockNodes[col][row] = symbolNode;

        // 播放音效
        if (targetAniId === 391) {
            SlotSoundController.Instance().playAudio("MoveJackpot", "FX");
        } else {
            SlotSoundController.Instance().playAudio("MoveBonus", "FX");
        }

        // Jackpot类型奖励
        if (resultInfo.type === "jackpot") {
            // 查找匹配的Jackpot结果
            let jackpotResult: JackpotResult = new JackpotResult();
            if (TSUtility.isValid(this._jackpotResult) && this._jackpotResult.length > 0) {
                for (let i = 0; i < this._jackpotResult.length; i++) {
                    if (this._jackpotResult[i].jackpotSubID === resultInfo.subID) {
                        jackpotResult = this._jackpotResult[i];
                        this._jackpotResult.splice(i, 1);
                        break;
                    }
                }
            }

            // 更新总赢钱数
            const winCoin = jackpotResult.winningCoin || 0;
            const prevWinMoney = this._winMoney;
            this._winMoney += winCoin;

            // 更新底部UI赢钱数
            SlotManager.Instance.bottomUIText.playChangeWinMoney(prevWinMoney, this._winMoney, () => {}, false, 1);

            // 计算基础Jackpot奖金
            let baseJackpot = 0;
            const jackpotInfo = SlotManager.Instance.getSlotJackpotInfo();
            switch (jackpotResult.jackpotSubID) {
                case 0:
                    baseJackpot = jackpotInfo.getJackpotMoneyInfo(0).basePrize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                    break;
                case 1:
                    baseJackpot = jackpotInfo.getJackpotMoneyInfo(1).basePrize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                    break;
                case 2:
                    baseJackpot = jackpotInfo.getJackpotMoneyInfo(2).basePrize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                    break;
                case 3:
                    baseJackpot = jackpotInfo.getJackpotMoneyInfo(3).basePrize * SlotGameRuleManager.Instance.getCurrentBetPerLine();
                    break;
            }

            // 倍数>1时调整奖金
            let finalWinCoin = winCoin;
            if (resultInfo.multiplier && resultInfo.multiplier > 1) {
                const diff = winCoin - baseJackpot * resultInfo.multiplier;
                finalWinCoin = baseJackpot + diff;
            }

            // 更新Jackpot UI状态
            const gameManager = HoundOfHadesManager.getInstance();
            gameManager.game_components.jackpotUI.setPlayingState(jackpotResult.jackpotSubKey, false);
            gameManager.game_components.jackpotUI.setShowingMoney(jackpotResult.jackpotSubKey, finalWinCoin);
            gameManager.game_components.jackpotDisplayFX.setWinFx(jackpotResult.jackpotSubID);

            // 播放Jackpot音效
            SlotSoundController.Instance().playAudio("JackpotTriggerFX", "FX");

            // 1秒后显示Jackpot弹窗并回调
            this.scheduleOnce(() => {
                this.resetZorder();
                gameManager.game_components.jackpotResultPopup.showPopup(
                    jackpotResult.winningCoin,
                    jackpotResult.jackpotSubID,
                    () => {
                        gameManager.game_components.jackpotUI.setShowingMoney(jackpotResult.jackpotSubKey, baseJackpot);
                        callback && callback();
                    },
                    resultInfo.multiplier,
                    false
                );
            }, 1);
        }
        // 普通Bonus奖励
        else {
            const spinResult = SlotGameResultManager.Instance.getSpinResult();
            let lockNRollResult = null;

            // 查找匹配的LockNRoll结果
            if (spinResult?.lockNRollResults) {
                for (let i = 0; i < spinResult.lockNRollResults.length; i++) {
                    const result = spinResult.lockNRollResults[i];
                    if (result.winningCellX === col && result.winningCellY === row) {
                        lockNRollResult = result;
                        break;
                    }
                }
            }

            // 播放奖金移动特效
            this.caculateMove_Node?.playBonusMoveTartget(col, row, () => {
                if (lockNRollResult) {
                    const winCoin = lockNRollResult.winningCoin || 0;
                    const prevWinMoney = this._winMoney;
                    this._winMoney += winCoin;
                    // 更新底部UI赢钱数
                    SlotManager.Instance.bottomUIText.playChangeWinMoney(prevWinMoney, this._winMoney, () => {}, false, 1);
                }
            });

            // 1秒后重置Z轴并回调
            this.scheduleOnce(() => {
                this.resetZorder();
                callback && callback();
            }, 1);
        }
    }

    /**
     * 重置所有锁符号的Z轴层级
     */
    resetZorder(): void {
        // 第一步：所有锁符号置为最顶层
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                const targetNode = this._lockNodes[col][row];
                if (targetNode) {
                    targetNode.setSiblingIndex(targetNode.parent?.childrenCount || 0 - 1);
                }
            }
        }

        // 第二步：Bonus符号再次置为最顶层
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const subGameState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
        const lastWindows = subGameState?.lastWindows;

        if (TSUtility.isValid(lastWindows)) {
            for (let col = 0; col < 5; col++) {
                for (let row = 0; row < 3; row++) {
                    const targetNode = this._lockNodes[col][row];
                    const symbolId = lastWindows[col][row];
                    // 仅Bonus符号（161绿/162红/163蓝）
                    if (targetNode && (symbolId === 161 || symbolId === 162 || symbolId === 163)) {
                        targetNode.setSiblingIndex(targetNode.parent?.childrenCount || 0 - 1);
                    }
                }
            }
        }
    }
}