

// 游戏专属组件
import BonusComponent_SuperSevenBlasts from './BonusComponent_SuperSevenBlasts';
import CountComponent_SuperSevenBlasts from './CountComponent_SuperSevenBlasts';
import JackpotMoneyDisplay_SuperSevenBlasts from './JackpotMoneyDisplay_SuperSevenBlasts';
import LockComponent_SuperSevenBlasts from './LockComponent_SuperSevenBlasts';
import MoveBonusComponent_SuperSevenBlasts from './MoveBonusComponent_SuperSevenBlasts';
import MoveJackpotComponent_SuperSevenBlasts from './MoveJackpotComponent_SuperSevenBlasts';
import ReelBGComponent_SuperSevenBlasts from './ReelBGComponent_SuperSevenBlasts';
import RemainCountComponent_SuperSevenBlasts from './RemainCountComponent_SuperSevenBlasts';
import TopSevenComponent_SuperSevenBlasts from './TopSevenComponent_SuperSevenBlasts';
// 弹窗组件
import JackpotResultPopup_SuperSevenBlasts from './JackpotResultPopup_SuperSevenBlasts';
import RespinStartPopup_SuperSevenBlasts from './RespinStartPopup_SuperSevenBlasts';
import GameComponents_Base from '../../game/GameComponents_Base';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotManager from '../../manager/SlotManager';

const { ccclass, property } = cc._decorator;

/**
 * SuperSevenBlasts游戏组件管理器（继承自基础游戏组件类）
 */
@ccclass()
export default class GameComponents_SuperSevenBlasts extends GameComponents_Base {
    // ========== 序列化属性（对应Cocos编辑器赋值） ==========
    @property(cc.Node)
    public gameTitle: cc.Node = null;

    @property(JackpotMoneyDisplay_SuperSevenBlasts)
    public jackpotMoneyDisplay: JackpotMoneyDisplay_SuperSevenBlasts = null;

    @property(ReelBGComponent_SuperSevenBlasts)
    public reelBGComponent: ReelBGComponent_SuperSevenBlasts = null;

    @property(MoveJackpotComponent_SuperSevenBlasts)
    public moveJackpotComponent: MoveJackpotComponent_SuperSevenBlasts = null;

    @property(MoveBonusComponent_SuperSevenBlasts)
    public moveBonusComponent: MoveBonusComponent_SuperSevenBlasts = null;

    @property(TopSevenComponent_SuperSevenBlasts)
    public topSevenComponent: TopSevenComponent_SuperSevenBlasts = null;

    @property(CountComponent_SuperSevenBlasts)
    public countUI: CountComponent_SuperSevenBlasts = null;

    @property(LockComponent_SuperSevenBlasts)
    public lockComponent: LockComponent_SuperSevenBlasts = null;

    @property(RemainCountComponent_SuperSevenBlasts)
    public remainCountUI: RemainCountComponent_SuperSevenBlasts = null;

    @property(RespinStartPopup_SuperSevenBlasts)
    public respinStartPopup: RespinStartPopup_SuperSevenBlasts = null;

    @property(JackpotResultPopup_SuperSevenBlasts)
    public jackpotResultPopup: JackpotResultPopup_SuperSevenBlasts = null;

    @property(cc.Animation)
    public cameraShakerAni: cc.Animation = null;

    @property(cc.Node)
    public bonusNode: cc.Node = null;

    @property(cc.Node)
    public blockNode: cc.Node = null;

    // ========== 私有状态属性 ==========
    /** 是否慢速旋转 */
    private _isSlowSpin: boolean = false;
    /** 是否添加延迟 */
    private _isAddDelay: boolean = false;
    /** 最后一列索引 */
    private _lastCol: number = 0;
    /** 是否变暗 */
    private _isDimmed: boolean = false;

    /**
     * 加载时初始化
     */
    public onLoad(): void {
        super.onLoad();
        
        // 获取画布组件并设置遮挡节点尺寸
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        if (TSUtility.isValid(canvas) && TSUtility.isValid(this.blockNode)) {
            const canvasSize = canvas.node.getContentSize();
            this.blockNode.setContentSize(canvasSize.width + 5, canvasSize.height + 5);
        }
    }

    /**
     * 显示遮挡节点（阻止用户交互）
     */
    public showBlockNode(): void {
        if (TSUtility.isValid(this.blockNode)) {
            this.blockNode.active = true;
        }
    }

    /**
     * 隐藏遮挡节点（恢复用户交互）
     */
    public hideBlockNode(): void {
        if (TSUtility.isValid(this.blockNode)) {
            this.blockNode.active = false;
        }
    }

    /**
     * 打开 jackpot 结果弹窗
     * @param param1 弹窗参数1
     * @param param2 弹窗参数2
     * @param param3 弹窗参数3
     */
    public openJackpotResultPopup(param1: any, param2: any, param3: any): void {
        this.jackpotResultPopup?.showPopup(param1, param2, param3);
    }

    /**
     * 震动相机（播放震动动画）
     */
    public shakeCamera(): void {
        if (TSUtility.isValid(this.cameraShakerAni)) {
            this.cameraShakerAni.stop();
            this.cameraShakerAni.setCurrentTime(0);
            this.cameraShakerAni.play();
        }
    }

    /**
     * 重置相机位置（停止震动）
     */
    public pixCamera(): void {
        if (TSUtility.isValid(this.cameraShakerAni)) {
            this.cameraShakerAni.stop();
            this.cameraShakerAni.node.setPosition(new cc.Vec2(0, 0));
        }
    }

    /**
     * 设置滚轮慢速旋转状态
     */
    public setSlotSlowSpin(): void {
        // 非重旋转状态初始化为false
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        if (currentSubGameKey !== "respin") {
            this._isSlowSpin = false;
        }
        this._isSlowSpin = false;

        // 获取历史窗口数据
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        // 随机标记（10%概率）
        const randomFlag = Math.random() > 0.9;

        // 遍历所有滚轮和符号位置判断是否需要慢速旋转
        for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
            for (let symbolIdx = 0; symbolIdx < 3; symbolIdx++) {
                const symbolValue = lastHistoryWindows.GetWindow(reelIdx).getSymbol(symbolIdx);
                
                // 61号符号触发慢速旋转
                if (symbolValue === 61) {
                    this._isSlowSpin = true;
                    return;
                }

                // 90+号符号且未锁定且随机标记为true时触发慢速旋转
                if (symbolValue > 90 && this.lockComponent?._lockSymbolID[reelIdx][symbolIdx] === 0 && randomFlag) {
                    this._isSlowSpin = true;
                    return;
                }
            }
        }
    }

    /**
     * 判断是否为慢速旋转
     * @returns 是否慢速旋转
     */
    public isSlotSlowSpin(): boolean {
        return this._isSlowSpin;
    }

    /**
     * 获取第一个激活的滚轮索引
     * @returns 滚轮索引（无激活滚轮时返回undefined）
     */
    public firstReelIndex(): number | undefined {
        const reels = SlotManager.Instance.reelMachine?.reels;
        if (!reels) return undefined;

        for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
            if (reels[reelIdx]?.node.active) {
                return reelIdx;
            }
        }
        return undefined;
    }

    /**
     * 启动奖励游戏
     */
    public startBonusGame(): void {
        if (TSUtility.isValid(this.bonusNode)) {
            this.bonusNode.active = true;
            const bonusComponent = this.bonusNode.getComponent(BonusComponent_SuperSevenBlasts);
            bonusComponent.init();
            bonusComponent.openAni();
        }
    }

    /**
     * 继续奖励游戏
     */
    public continueBonusGame(): void {
        if (TSUtility.isValid(this.bonusNode)) {
            this.bonusNode.active = true;
            const bonusComponent = this.bonusNode.getComponent(BonusComponent_SuperSevenBlasts);
            bonusComponent?.init();
            bonusComponent?.stayAni();
            bonusComponent?.continueGame();
        }
    }

    /**
     * 结束奖励游戏
     */
    public endBonusGame(): void {
        if (TSUtility.isValid(this.bonusNode)) {
            this.bonusNode.active = false;
        }
    }

    /**
     * 设置最后一列索引（激活的最后一个滚轮）
     */
    public setLastCol(): void {
        const reels = SlotManager.Instance.reelMachine?.reels;
        if (!reels) return;

        for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
            if (reels[reelIdx]?.node.active) {
                this._lastCol = reelIdx;
            }
        }
    }

    /**
     * 判断是否需要添加延迟
     * @returns 是否添加延迟
     */
    public getAddDelay(): boolean {
        const bonusWindow = this.getBonusWindow();
        if (!TSUtility.isValid(bonusWindow)) {
            return false;
        }

        // 检查最后一列的符号是否触发延迟
        for (let symbolIdx = 0; symbolIdx < 3; symbolIdx++) {
            const symbolValue = bonusWindow.GetWindow(this._lastCol).getSymbol(symbolIdx);
            // 90-100号符号 或 61号符号 触发延迟
            if ((symbolValue > 90 && symbolValue < 100) || symbolValue === 61) {
                return true;
            }
        }
        return false;
    }

    /**
     * 获取奖励窗口（包含61号符号的历史窗口）
     * @returns 奖励窗口实例（无则返回null）
     */
    public getBonusWindow(): any | null {
        const historyWindows = SlotGameResultManager.Instance.getHistoryWindows();
        if (!historyWindows || historyWindows.length === 0) {
            return null;
        }

        // 遍历所有历史窗口找61号符号
        for (let windowIdx = 0; windowIdx < historyWindows.length; windowIdx++) {
            const window = historyWindows[windowIdx];
            for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
                for (let symbolIdx = 0; symbolIdx < 3; symbolIdx++) {
                    if (window.GetWindow(reelIdx).getSymbol(symbolIdx) === 61) {
                        return window;
                    }
                }
            }
        }
        return null;
    }

    /**
     * 设置变暗状态
     * @param isDimmed 是否变暗
     */
    public setDimmedAct(isDimmed: boolean): void {
        this._isDimmed = isDimmed;
    }

    /**
     * 判断是否处于变暗状态
     * @returns 是否变暗
     */
    public isDimmed(): boolean {
        return this._isDimmed;
    }
}