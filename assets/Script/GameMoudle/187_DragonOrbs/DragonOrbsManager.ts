const { ccclass, property } = cc._decorator;

// 导入外部依赖模块（路径与原JS保持一致）
import PayCode from '../../Config/PayCode';
import CommonServer from '../../Network/CommonServer';
import CommonPopup from '../../Popup/CommonPopup';
import CameraControl from '../../Slot/CameraControl';
import Reel from '../../Slot/Reel';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import SlotSoundController from '../../Slot/SlotSoundController';
import State, { SequencialState } from '../../Slot/State';
import SlotUIRuleManager from '../../Slot/rule/SlotUIRuleManager';
import UserInfo from '../../User/UserInfo';
import AsyncHelper from '../../global_utility/AsyncHelper';
import TSUtility from '../../global_utility/TSUtility';
import PopupManager from '../../manager/PopupManager';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotManager from '../../manager/SlotManager';
import SoundManager from '../../manager/SoundManager';
import GameComponents_DragonOrbs from './GameComponents_DragonOrbs';
import SubGameStateManager_DragonOrbs from './SubGameStateManager_DragonOrbs';
;

/**
 * 龙珠游戏管理器（继承SlotManager）
 * 负责子游戏状态管理、投注信息设置、BGM播放、场景加载、奖励游戏请求、滚轮预期特效、分享信息配置等核心逻辑
 */
@ccclass()
export default class DragonOrbsManager extends SlotManager {
    // 自定义消息弹窗节点（临时存储）
    private popupCustomMessage: Node | null = null;


    /**
     * 获取单例实例（兼容原JS逻辑）
     * @returns SlotManager单例
     */
    public static getInstance(): SlotManager {
        return SlotManager.Instance;
    }

    /**
     * 获取当前子游戏状态
     * @returns 子游戏状态（base/freegameChoose/freeSpin）
     */
    public getSubGameState(): any {
        const subGameKey = this.getSubGameKeyAtStartSpin();
        switch (subGameKey) {
            case "base":
                return SubGameStateManager_DragonOrbs.Instance().getBaseGameState();
            case "freegameChoose":
                return SubGameStateManager_DragonOrbs.Instance().getFreeSpinChooseState();
            default: // freeSpin
                return SubGameStateManager_DragonOrbs.Instance().getFreeSpinState();
        }
    }

    /**
     * 设置投注信息（优先使用base子游戏的投注额，无则调用父类逻辑）
     */
    public setBetInfo(): void {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");

        // base模式且有有效投注额 → 优先使用该投注额
        if (nextSubGameKey === "base" && baseGameState && baseGameState.betPerLines > 0) {
            const betPerLine = baseGameState.betPerLines;
            if (betPerLine > 0) {
                SlotGameRuleManager.Instance.setCurrentBetPerLine(betPerLine);
            }
        } else {
            // 其他模式调用父类方法
            super.setBetInfo();
        }
    }

    /**
     * 播放主背景音乐（根据子游戏类型切换BGM）
     */
    public playMainBgm(): void {
        // 先调用父类BGM播放逻辑
        super.playMainBgm();

        // 根据子游戏类型播放对应BGM
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        switch (nextSubGameKey) {
            case "base":
                SlotSoundController.Instance().playAudio("MainBGM", "BGM");
                break;
            case "freegameChoose":
                SlotSoundController.Instance().playAudio("FreeSpinChooseBGM", "BGM");
                break;
            default: // freeSpin
                SlotSoundController.Instance().playAudio("FreeSpinBGM", "BGM");
                break;
        }
    }

    /**
     * 异步场景加载准备（初始化相机、禁用输入、注册投注变更监听）
     * @returns Promise<void>
     */
    public async asyncSceneLoadPrepare(): Promise<void> {
        // 禁用鼠标拖拽/键盘事件
        this.setMouseDragEventFlag(false);
        this.setKeyboardEventFlag(false);

        // 初始化相机控制（坐标与原JS一致）
        const cameraStartPos = new cc.Vec2(35, 0);
        const cameraEndPos = new cc.Vec2(704, 720);
        CameraControl.Instance.initCameraControl(cameraStartPos, cameraEndPos);
        CameraControl.Instance.setScreenTop();

        // 注册投注规则观察者和投注变更事件
        SlotGameRuleManager.Instance.addObserver(this.node);
        this.node.on("changeMoneyState", this.onChangeBetPerLine.bind(this));
    }

    /**
     * 异步场景加载特效（初始化UI、播放入场动画、切换子游戏UI、恢复输入）
     * @returns Promise<void>
     */
    public async asyncSceneLoadEffect(): Promise<void> {
        // 1. 初始化功能组件、播放顶部UI入场动画、播放入场音效
        const gameComp = this.getComponent(GameComponents_DragonOrbs);
        gameComp?.featureComponents.setItem();
        gameComp?.topUI.playIntroAni();
        SlotSoundController.Instance().playAudio("Intro", "FX");

        // 延迟4.5秒（与原JS一致）
        await AsyncHelper.delay(4.5);

        // 2. 根据子游戏类型初始化UI
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        if (nextSubGameKey !== "base" && nextSubGameKey !== "freegameChoose") {
            // 免费旋转模式：初始化锁定符号层、切换到免费旋转UI
            gameComp?.lockSymbolLayer.initWindow();
            SubGameStateManager_DragonOrbs.Instance().changeUIToFreeSpin();
        }
        if (nextSubGameKey === "freegameChoose") {
            // 免费旋转选择模式：切换到选择模式UI
            SubGameStateManager_DragonOrbs.Instance().changeUIToChooseMode();
        }

        // 3. 相机缩放+向下滚动动画（0.8秒，缓出曲线）
        CameraControl.Instance.resetZoomRelative(0.8, false);
        CameraControl.Instance.scrollDownScreen(0.8, cc.easeOut(2));

        // 延迟0.8秒（与原JS一致）
        await AsyncHelper.delay(0.8);

        // 4. 恢复输入、播放BGM、设置相机滚动回调、自动自旋
        this.playMainBgm();
        this.setKeyboardEventFlag(true);
        this.setMouseDragEventFlag(true);
        this.callbackOnScrollDown(); // 初始调用向下滚动回调

        // 设置相机滚动回调
        CameraControl.Instance.callbackScrollUp = this.callbackOnScrollUp.bind(this);
        CameraControl.Instance.callbackScrollDown = this.callbackOnScrollDown.bind(this);

        // 自动启动下一次自旋（非base模式）
        if (this.isNextSpinAutoStart()) {
            this.spinAfterCloseAllPopup();
        }
    }

    /**
     * 发送奖励游戏自旋请求（处理结果、更新用户资产、执行回调）
     * @param callback 请求成功后的回调（参数为自旋结果）
     * @returns Promise<void>
     */
    public async sendBonusGameRequest(callback: (result: any) => void): Promise<void> {
        // 重置自旋请求标识
        this.flagSpinRequest = false;

        // 发送自旋请求（无额外参数）
        const spinResult = await this.sendSpinRequest(null, null);

        // 实例无效/不可用/自旋错误 → 直接返回
        if (!TSUtility.isValid(this) || !this.isAvailable() || !this.checkSpinErrorState(spinResult)) {
            return;
        }

        // 服务器响应错误处理
        if (CommonServer.isServerResponseError(spinResult)) {
            if (!UserInfo.isAuthFail()) {
                this.showSpinErrorPopup(spinResult);
            }
            SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_STOP);
            return;
        }

        // 处理自旋结果
        this.flagSpinRequest = true;
        SlotGameResultManager.Instance.resetGameResult();
        SlotGameResultManager.Instance.setGameResult(spinResult);

        // 更新用户资产
        const serverChangeResult = UserInfo.instance().getServerChangeResult(spinResult);
        const coinChange = serverChangeResult.removeChangeCoinByPayCode(PayCode.SlotBetWithdraw);
        
        if (coinChange !== 0) {
            UserInfo.instance().addUserAssetMoney(coinChange);
            this._inGameUI.onSpinBetting(serverChangeResult);
        }

        // 更新等级经验
        const levelPoint = serverChangeResult.getTotalChangeLevelPoint();
        this._inGameUI.addLevelExp(levelPoint);

        // 处理自旋流程并更新状态
        this.onSpinProcess(spinResult, serverChangeResult);
        this._spinChangeResult.addChangeResult(serverChangeResult);

        // base模式设置为可跳过的自旋状态
        if (SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult() === "base") {
            SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_SKIPABLE);
        }

        // 执行回调
        callback(spinResult);
    }

    /**
     * 自旋流程更新（处理自旋状态、自动自旋、自定义弹窗等逻辑）
     */
    public spinProcessRenewal(): void {
        // 实例不可用 → 直接返回
        if (!this.isAvailable()) return;

        // 应用快速模式
        SlotUIRuleManager.Instance.applyFastMode();

        // 自定义激活自旋按钮状态 → 显示自定义消息弹窗
        if (SlotReelSpinStateManager.Instance.getCurrentState() === SlotReelSpinStateManager.STATE_CUSTOM_ACTIVE_SPINBUTTON) {
            if (!this.popupCustomMessage) {
                CommonPopup.getCommonPopup((_: any, popup: any) => {
                    const caption = SlotReelSpinStateManager.Instance.customCaption;
                    const message = SlotReelSpinStateManager.Instance.customMessage;
                    
                    this.popupCustomMessage = popup.node;
                    popup.open()
                        .setInfo(caption, message)
                        .setOkBtn("OK", () => {
                            popup.close();
                            this.popupCustomMessage = null;
                        });
                });
            }
            return;
        }

        // 已有自旋状态 → 跳过当前自旋动画
        if (this.curState) {
            cc.log("progressing...spin animation");
            this.curState && this.skipReelSpin();
            return;
        }

        // 有阻塞弹窗 → 等待弹窗关闭后自动自旋
        if (PopupManager.Instance().IsBlockingPopupOpen() || PopupManager.Instance().isBlocking()) {
            if (this.isNextSpinAutoStart()) {
                this.spinAfterCloseAllPopup();
            }
            return;
        }

        // 检查游戏可玩状态 → 余额不足则打开商店弹窗
        if (!this.checkCanPlayGame()) {
            SlotReelSpinStateManager.Instance.changeAutospinMode(false);
            SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_STOP);
            this.openNotEnoughMoneyShopPopup();
            return;
        }

        // 自旋停止状态 → 初始化自旋流程
        if (SlotReelSpinStateManager.Instance.getCurrentState() === SlotReelSpinStateManager.STATE_STOP) {
            // 隐藏锁定投注弹窗
            this._bottomUI.hideLockChangeTotalBetPopup();

            // 设置自旋状态（base模式可跳过，其他模式不可跳过）
            const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
            if (nextSubGameKey === "base") {
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_SKIPABLE);
            } else {
                SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_NOTSKIPABLE);
            }
            this.isSkipCurrentSpin = false;

            // 获取子游戏状态并构建状态序列
            const subGameState = this.getSubGameState();
            if (subGameState) {
                const sequenceState = new SequencialState();
                const afterSpinState = SlotManager.Instance.getProcessAfterSpinState();
                const doneState = new State();

                // 完成状态回调：自旋请求完成后检查自旋结束
                doneState.addOnStartCallback(() => {
                    if (this.flagSpinRequest) {
                        sequenceState.addOnEndCallback(() => {
                            SlotManager.Instance.checkEndSpin();
                        });
                    }
                    doneState.setDone();
                });

                // 插入状态序列：子游戏状态 → 自旋后状态 → 完成状态
                sequenceState.insert(0, subGameState);
                sequenceState.insert(1, afterSpinState);
                sequenceState.insert(2, doneState);

                // 启动状态序列
                this.curState = sequenceState;
                sequenceState.onStart();
            }
        } else {
            cc.log("progressing.....");
        }
    }

    /**
     * 相机向上滚动回调（播放顶部UI默认动画）
     */
    public callbackOnScrollUp(): void {
        const gameComp = this.getComponent(GameComponents_DragonOrbs);
        gameComp?.topUI.playDefaultAni();
    }

    /**
     * 相机向下滚动回调（停止顶部UI所有动画）
     */
    public callbackOnScrollDown(): void {
        const gameComp = this.getComponent(GameComponents_DragonOrbs);
        gameComp?.topUI.stopAllAni();
    }

    /**
     * 投注额变更回调（更新功能组件数据）
     */
    public onChangeBetPerLine(): void {
        const gameComp = this.getComponent(GameComponents_DragonOrbs);
        gameComp?.featureComponents.setItem();
    }

    /**
     * 处理分享信息配置（不同中奖等级/Jackpot类型的图片名）
     */
    public processChangeShareInfo(): void {
        this.bannerImgNameBigwin = "slot-dragonorbs-win-big-20240711.jpg";
        this.bannerImgNameSuperwin = "slot-dragonorbs-win-huge-20240711.jpg";
        this.bannerImgNameMegawin = "slot-dragonorbs-win-mega-20240711.jpg";
        this.freespinShareImgName = "slot-dragonorbs-free-spins-20240711.jpg";
        this.jackpotMiniShareImgName = "slot-dragonorbs-jackpot-mini-20240711.jpg";
        this.jackpotMinorShareImgName = "slot-dragonorbs-jackpot-minor-20240711.jpg";
        this.jackpotMajorShareImgName = "slot-dragonorbs-jackpot-major-20240711.jpg";
        this.jackpotGrandShareImgName = "slot-dragonorbs-jackpot-grand-20240711.jpg";
    }

    /**
     * 获取Gauge数据（根据当前投注额和索引）
     * @param index Gauge索引
     * @returns Gauge数据
     */
    public getGauges(index: number): any {
        const currentBetPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
        return SlotGameResultManager.Instance.getSubGameState("base").getGaugeWithBetPerLine(currentBetPerLine+"", index+"");
    }

    /**
     * 判断是否自动启动下一次自旋（非base模式自动自旋）
     * @returns 是否自动自旋
     */
    public isNextSpinAutoStart(): boolean {
        return SlotGameResultManager.Instance.getNextSubGameKey() !== "base";
    }

    /**
     * 设置滚轮预期特效显示状态（普通模式）
     * @param reelIndex 滚轮索引
     */
    public setPlayReelExpectEffectState(reelIndex: number): void {
        // 隐藏所有预期特效
        this.reelMachine?.hideAllExpectEffects();

        const gameComp = this.getComponent(GameComponents_DragonOrbs);
        // 非Jackpot预期、滚轮索引有效、满足预期特效条件
        if (!gameComp?.getJackpotExpectFlag() && this.reelMachine?.reels.length > reelIndex) {
            const isExpect = SlotUIRuleManager.Instance.getExpectEffectFlag(reelIndex, SlotGameResultManager.Instance.getVisibleSlotWindows());
            if (isExpect) {
                if (this.reelMachine.shoeExpectEffect(reelIndex)) {
                    // 停止已有预期音效并播放新音效
                    const audioClip = SlotSoundController.Instance().getAudioClip("ReelExpect");
                    if (SoundManager.Instance().isPlayingFxOnce(audioClip)) {
                        SoundManager.Instance().stopFxOnce(audioClip);
                    }
                    SlotSoundController.Instance().playAudio("ReelExpect", "FX");
                    
                    // 临时降低主音量、停止自旋音效、设置滚轮模糊偏移
                    SoundManager.Instance().setMainVolumeTemporarily(0.1);
                    SlotManager.Instance.stopReelSpinSound();
                    this.reelMachine.reels[reelIndex].getComponent(Reel)?.setShaderValue("blurOffset", 0.03);
                }
            }
        } else {
            // 重置音效和音量
            const audioClip = SlotSoundController.Instance().getAudioClip("ReelExpect");
            if (SoundManager.Instance().isPlayingFxOnce(audioClip)) {
                SoundManager.Instance().stopFxOnce(audioClip);
            }
            SoundManager.Instance().resetTemporarilyMainVolume();
        }
    }

    /**
     * 设置滚轮预期特效显示状态（免费旋转模式）
     * @param reelIndex 滚轮索引
     */
    public setPlayReelExpectForFreeSpin(reelIndex: number): void {
        this.reelMachine.hideAllExpectEffects();
        var t = this.getComponent(GameComponents_DragonOrbs).getJackpotExpectFlag()
        var n = this.getComponent(GameComponents_DragonOrbs).getJackpotSingleExpectFlag(reelIndex)
        var o = 1 == this.getComponent(GameComponents_DragonOrbs).getLeftCellCount()
        var a = this.getComponent(GameComponents_DragonOrbs).getUpDownFlag(reelIndex);

        if (this.reelMachine.reels.length > reelIndex && this.reelMachine.reels[reelIndex].node.active && (t || n && a > -1) || o) {
            if (this.reelMachine.shoeExpectEffect(reelIndex)) {
                var i = SlotSoundController.Instance().getAudioClip("ReelExpect");
                SoundManager.Instance().isPlayingFxOnce(i) && SoundManager.Instance().stopFxOnce(i),
                SlotSoundController.Instance().playAudio("ReelExpect", "FX"),
                SoundManager.Instance().setMainVolumeTemporarily(.1),
                SlotManager.Instance.stopReelSpinSound(),
                this.reelMachine.reels[reelIndex].getComponent(Reel).setShaderValue("blurOffset", .03)
            }
        } else
            i = SlotSoundController.Instance().getAudioClip("ReelExpect"),
            SoundManager.Instance().isPlayingFxOnce(i) && SoundManager.Instance().stopFxOnce(i),
            SoundManager.Instance().resetTemporarilyMainVolume()
    }

    /**
     * 获取滚轮窗口范围（用于符号显示范围判断）
     * @returns 滚轮窗口范围二维数组
     */
    public getWindowRange(): number[][] {
        const windowRange: number[][] = [];
        if (!this.reelMachine?.reels) return windowRange;

        for (let i = 0; i < this.reelMachine.reels.length; i++) {
            const reelComp = this.reelMachine.reels[i].getComponent(Reel);
            if (reelComp) {
                windowRange.push([1, reelComp.visibleRow]);
            }
        }
        return windowRange;
    }
}
