const { ccclass, property } = cc._decorator;


import JackpotMoneyDisplay from '../../JackpotMoneyDisplay';
import CameraControl from '../../Slot/CameraControl';
import SlotSoundController from '../../Slot/SlotSoundController';
import State from '../../Slot/State';
import GameComponents_Base from '../../game/GameComponents_Base';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotManager from '../../manager/SlotManager';
import FeatureComponents_DragonOrbs from './FeatureComponents_DragonOrbs';
import FreeSpinChoosePopup_DragonOrbs from './FreeSpinChoosePopup_DragonOrbs';
import FreeSpinResultPopup_DragonOrbs from './FreeSpinResultPopup_DragonOrbs';
import JackpotResultPopup_DragonOrbs from './JackpotResultPopup_DragonOrbs';
import LockSymbolLayer_DragonOrbs from './LockSymbolLayer_DragonOrbs';
import MultiplierApplyComponent_DragonOrbs from './MultiplierApplyComponent_DragonOrbs';
import TopUI_DragonOrbs from './TopUI_DragonOrbs';
import WheelComponent_DragonOrbs from './WheelComponent_DragonOrbs';
import WheelLeftUI_DragonOrbs from './WheelLeftUI_DragonOrbs';

/**
 * 龙珠游戏核心UI/功能组件
 * 管理免费旋转选择弹窗、Jackpot预期特效、龙形UI动画、滚轮锁定判断、倍数组件等核心逻辑
 */
@ccclass()
export default class GameComponents_DragonOrbs extends GameComponents_Base {
    // ===================== 序列化属性（与原JS一致） =====================
    /** 顶部UI组件 */
    @property(TopUI_DragonOrbs)
    public topUI: TopUI_DragonOrbs | null = null;

    /** 功能组件（特效/交互） */
    @property(FeatureComponents_DragonOrbs)
    public featureComponents: FeatureComponents_DragonOrbs | null = null;

    /** 免费旋转结果弹窗 */
    @property(FreeSpinResultPopup_DragonOrbs)
    public freeSpinResultPopup: FreeSpinResultPopup_DragonOrbs | null = null;

    /** 免费旋转选择弹窗 */
    @property(FreeSpinChoosePopup_DragonOrbs)
    public freeSpinChoose: FreeSpinChoosePopup_DragonOrbs | null = null;

    /** Jackpot结果弹窗 */
    @property(JackpotResultPopup_DragonOrbs)
    public jackpotResultPopup: JackpotResultPopup_DragonOrbs | null = null;

    /** 锁定符号层组件 */
    @property(LockSymbolLayer_DragonOrbs)
    public lockSymbolLayer: LockSymbolLayer_DragonOrbs | null = null;

    /** 转盘组件 */
    @property(WheelComponent_DragonOrbs)
    public wheelComponent: WheelComponent_DragonOrbs | null = null;

    /** 倍数应用组件 */
    @property(MultiplierApplyComponent_DragonOrbs)
    public multiplierApplyComponent: MultiplierApplyComponent_DragonOrbs | null = null;

    /** Jackpot金额显示组件 */
    @property(JackpotMoneyDisplay)
    public jackpotDisplay: JackpotMoneyDisplay | null = null;

    /** 功能入场动画节点数组（base/freeSpin_red/blue/green） */
    @property([cc.Node])
    public featureIntroNodes: cc.Node[] = [];

    /** 龙形状态节点（动画载体） */
    @property(cc.Node)
    public dragonState: cc.Node | null = null;

    /** 转盘左侧UI组件 */
    @property(WheelLeftUI_DragonOrbs)
    public wheelLeftUI: WheelLeftUI_DragonOrbs | null = null;

    // ===================== 私有状态标识（与原JS一致） =====================
    /** 是否显示Jackpot预期特效 */
    private _isShowingJackpotExpectFx: boolean = false;

    /** 单个Jackpot预期特效标识（对应3个滚轮） */
    private _iShowingJackpotSingleExpectFx: boolean[] = [false, false, false];

    /** 上下方向标识（对应3个滚轮：-1=无/0=下/1=上） */
    private _upDownFlag: number[] = [-1, -1, -1];

    /** 是否不可跳过 */
    private _notSkipable: boolean = false;

    // ===================== 核心业务方法（与原JS逻辑1:1） =====================
    /**
     * 获取免费旋转选择项初始化状态
     * @returns State 状态实例（添加事件监听后标记完成）
     */
    public getSettingChooseItemState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.freeSpinChoose?.addAllEventListener();
            state.setDone();
        });
        return state;
    }

    /**
     * 获取等待选择免费旋转状态
     * @returns State 状态实例（设置选择回调后标记完成）
     */
    public getWaitSelectFreeSpinState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.freeSpinChoose?.setSelectCallback(state.setDone.bind(state));
        });
        return state;
    }

    /**
     * 获取显示触发模式状态
     * @returns State 状态实例（显示当前触发球后标记完成）
     */
    public getShowTriggerModeState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            this.freeSpinChoose?.showCurrentTriggerOrb(state.setDone.bind(state));
        });
        return state;
    }

    /**
     * 获取关闭选择弹窗状态
     * @returns State 状态实例（恢复输入、关闭弹窗后标记完成）
     */
    public getCloseChoosePopupState(): State {
        const state = new State();
        state.addOnStartCallback(() => {
            // 恢复鼠标/键盘输入
            SlotManager.Instance.setMouseDragEventFlag(true);
            SlotManager.Instance.setKeyboardEventFlag(true);
            // 关闭弹窗并标记状态完成
            this.freeSpinChoose?.close(state.setDone.bind(state));
        });
        return state;
    }

    /**
     * 触发UI特效（停止原有特效，播放对应子游戏类型的特效）
     */
    public triggerUIFxOn(): void {
        this.featureComponents?.featureFxStop();
        const subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        this.featureComponents?.featureFxPlay(subGameKey);
    }

    /**
     * 关闭UI特效
     */
    public triggerUIFxOff(): void {
        this.featureComponents?.featureFxStop();
    }

    /**
     * 获取播放功能入场动画状态
     * @returns State 状态实例（根据子游戏类型播放对应入场动画）
     */
    public getPlayFeatureIntroState(): State {
        const state = new State();
        const self = this;

        state.addOnStartCallback(() => {
            const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
            const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
            let introNode: cc.Node | null = null;

            // 1. Base模式切换到非Base模式 → 随机播放第一个入场动画
            if (currentSubGameKey === "base" && nextSubGameKey !== "base") {
                if (Math.random() * 10 > 5) {
                    self.setJackpotExpectFlag(true);
                    introNode = self.featureIntroNodes[0];
                }
            } else {
                // 2. 非Base模式 → 检查Jackpot符号数量≥3时播放对应颜色入场动画
                if (currentSubGameKey !== "base") {
                    if (self.getJackpotSymbolCnt() >= 3) {
                        self.setJackpotExpectFlag(true);
                        switch (currentSubGameKey) {
                            case "freeSpin_red":
                                introNode = self.featureIntroNodes[1];
                                break;
                            case "freeSpin_blue":
                                introNode = self.featureIntroNodes[2];
                                break;
                            case "freeSpin_green":
                                introNode = self.featureIntroNodes[3];
                                break;
                        }
                    }
                } else {
                    // Base模式无入场动画 → 直接完成状态
                    state.setDone();
                    return;
                }
            }

            // 3. 入场节点有效 → 播放动画
            if (TSUtility.isValid(introNode)) {
                // 禁用鼠标拖拽、相机向下滚动
                SlotManager.Instance.setMouseDragEventFlag(false);
                if (CameraControl.Instance.eStateOfCameraPosition === 1) {
                    CameraControl.Instance.scrollDownScreen(0.8);
                }

                // 重启节点+播放入场音效
                introNode.active = false;
                introNode.active = true;
                SlotSoundController.Instance().playAudio("FreeSpinIntro", "FX");

                // 播放龙形预期动画（完成后切闲置动画）
                const dragonAni = self.dragonState?.getComponent(cc.Animation);
                dragonAni?.play("Left_UI_Dragon_Expect_Fx_Ani", 0);
                dragonAni?.on("finished", () => {
                    dragonAni.play("Left_UI_Dragon_Idle_Ani", 0);
                });

                // 入场动画完成后标记状态完成
                const introAni = introNode.getComponent(cc.Animation);
                introAni?.once("finished", () => {
                    introNode!.active = false;
                    state.setDone();
                });
            } else {
                // 节点无效 → 直接完成状态
                state.setDone();
            }
        });

        return state;
    }

    /**
     * 触发转盘动画（播放音效+龙形触发动画，8秒后切闲置）
     */
    public wheelTrigger(): void {
        // 播放转盘触发音效
        SlotSoundController.Instance().playAudio("WheelTriggerDragon", "FX");

        // 播放龙形触发动画
        const dragonAni = this.dragonState?.getComponent(cc.Animation);
        dragonAni?.play("Left_UI_Dragon_Wheel_Trigger_Ani", 0);

        // 8秒后切回闲置动画
        this.scheduleOnce(() => {
            dragonAni?.play("Left_UI_Dragon_Idle_Ani", 0);
        }, 8);
    }

    /**
     * 设置单条线预期比例（随机判断是否不可跳过+单个Jackpot预期）
     * @param reelIndex 滚轮索引
     */
    public setSingleLineExpectRatio(reelIndex: number): void {
        const randomVal = Math.random() * 10;
        // 随机值<0.5 → 标记不可跳过+开启单个Jackpot预期
        this._notSkipable = randomVal < 0.5;
        this.setJackpotSingleExpectFlag(reelIndex, randomVal < 0.5);
    }

    /**
     * 获取Jackpot符号数量（遍历窗口符号，排除锁定符号）
     * @returns Jackpot符号数量
     */
    public getJackpotSymbolCnt(): number {
        let count = 0;
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();

        // 遍历所有窗口
        for (let winIdx = 0; winIdx < lastHistoryWindows.size; winIdx++) {
            const window = lastHistoryWindows.GetWindow(winIdx);
            // 遍历窗口内符号
            for (let symIdx = 0; symIdx < window.size; symIdx++) {
                const symbol = window.getSymbol(symIdx);
                const isLocked = this.lockSymbolLayer?.checkLockSymbolPosition(winIdx, symIdx) ?? 0;
                // 符号ID>90且未锁定 → 计数+1
                if (symbol > 90 && isLocked === 0) {
                    count++;
                }
            }
        }

        return count;
    }

    /**
     * 获取Jackpot预期特效标识
     * @returns 是否显示Jackpot预期特效
     */
    public getJackpotExpectFlag(): boolean {
        return this._isShowingJackpotExpectFx;
    }

    /**
     * 设置Jackpot预期特效标识
     * @param flag 是否显示
     */
    public setJackpotExpectFlag(flag: boolean): void {
        this._isShowingJackpotExpectFx = flag;
    }

    /**
     * 设置上下方向标识（根据随机值+锁定符号位置判断）
     * @param reelIndex 滚轮索引
     */
    public setUpDownFlag(reelIndex: number): void {
        const randomVal = Math.random() * 10;
        // 获取滚轮上下位置的锁定状态
        var isTopLocked = this.lockSymbolLayer?.checkLockSymbolPosition(reelIndex, 0) ?? 1;
        var isBottomLocked = this.lockSymbolLayer?.checkLockSymbolPosition(reelIndex, 2) ?? 1;

        // 上下都未锁定 → 随机分配方向
        if (isBottomLocked === 0 && isTopLocked === 0) {
            isBottomLocked = randomVal < 5 ? 1 : 0;
            isTopLocked = randomVal >= 5 ? 1 : 0;
        }

        // 根据单个Jackpot预期标识设置方向
        if (this._iShowingJackpotSingleExpectFx[reelIndex] && isTopLocked === 0) {
            this._upDownFlag[reelIndex] = 1; // 上
        } else if (this._iShowingJackpotSingleExpectFx[reelIndex] && isBottomLocked === 0) {
            this._upDownFlag[reelIndex] = 0; // 下
        } else if (isBottomLocked === 1 && isTopLocked === 1) {
            this._upDownFlag[reelIndex] = -1; // 无
        }
    }

    /**
     * 获取指定滚轮的上下方向标识
     * @param reelIndex 滚轮索引
     * @returns 方向标识（-1=无/0=下/1=上）
     */
    public getUpDownFlag(reelIndex: number): number {
        return this._upDownFlag[reelIndex] ?? -1;
    }

    /**
     * 获取指定滚轮的单个Jackpot预期标识（排除全局Jackpot/剩余单元格≤1的情况）
     * @param reelIndex 滚轮索引
     * @returns 是否显示单个Jackpot预期
     */
    public getJackpotSingleExpectFlag(reelIndex: number): boolean {
        const isGlobalJackpot = this.getJackpotExpectFlag();
        const leftCellCount = this.getLeftCellCount();
        // 全局Jackpot关闭 + 剩余单元格>1 → 返回单个预期标识
        return !isGlobalJackpot && leftCellCount > 1 && this._iShowingJackpotSingleExpectFx[reelIndex];
    }

    /**
     * 设置指定滚轮的单个Jackpot预期标识
     * @param reelIndex 滚轮索引
     * @param flag 是否显示
     */
    public setJackpotSingleExpectFlag(reelIndex: number, flag: boolean): void {
        if (reelIndex >= 0 && reelIndex < this._iShowingJackpotSingleExpectFx.length) {
            this._iShowingJackpotSingleExpectFx[reelIndex] = flag;
        }
    }

    /**
     * 获取剩余单元格数量（委托给锁定符号层）
     * @returns 剩余单元格数量
     */
    public getLeftCellCount(): number {
        return this.lockSymbolLayer?.getLeftCellCount() ?? 0;
    }

    /**
     * 判断当前滚轮是否被完全锁定（3行都锁定）
     * @param reelIndex 滚轮索引（<0时直接返回true）
     * @returns 是否完全锁定
     */
    public isLockCurrentReel(reelIndex: number): boolean {
        // 索引<0 → 强制锁定
        if (reelIndex < 0) return true;

        let lockCount = 0;
        // 遍历3行判断锁定状态
        for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
            const isLocked = this.lockSymbolLayer?.checkLockSymbolPosition(reelIndex, rowIdx) ?? 0;
            if (isLocked) lockCount++;
        }

        // 3行都锁定 → 返回true
        return lockCount === 3;
    }
}