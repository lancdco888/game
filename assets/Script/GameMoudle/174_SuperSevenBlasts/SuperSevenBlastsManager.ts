// 业务配置与网络模块
import PayCode from '../../Config/PayCode';
import CommonServer from '../../Network/CommonServer';
import UserInfo from '../../User/UserInfo';

// 游戏专属模块
import GameComponents_SuperSevenBlasts from './GameComponents_SuperSevenBlasts';
import SubGameStateManager_SuperSevenBlasts from './SubGameStateManager_SuperSevenBlasts';
import SlotManager from '../../manager/SlotManager';
import State, { SequencialState } from '../../Slot/State';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotSoundController from '../../Slot/SlotSoundController';
import CameraControl from '../../Slot/CameraControl';
import TSUtility from '../../global_utility/TSUtility';
import { BottomTextType } from '../../SubGame/BottomUIText';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import Reel from '../../Slot/Reel';
import Symbol from '../../Slot/Symbol';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import SoundManager from '../../manager/SoundManager';
import SlotUIRuleManager from '../../Slot/rule/SlotUIRuleManager';

const { ccclass } = cc._decorator;

/**
 * SuperSevenBlasts老虎机管理器（继承自SlotManager）
 */
@ccclass()
export default class SuperSevenBlastsManager extends SlotManager {
    // 游戏组件引用
    public game_components: GameComponents_SuperSevenBlasts = null;
    // 子游戏状态管理器
    protected subgame_state: SubGameStateManager_SuperSevenBlasts = null;
    // 下一个特效标记
    protected next_Effect: boolean = false;

    // 滚轮旋转文本
    public _reelSpinTexts: string[] = ["GOOD LUCK!", "BET MULTIPLIER"];

    /**
     * 获取单例实例（兼容原有逻辑）
     * @returns SlotManager单例
     */
    public static getInstance(): SuperSevenBlastsManager {
        return SlotManager.Instance;
    }

    /**
     * 加载时初始化
     */
    public onLoad(): void {
        super.onLoad();
        // 获取游戏组件引用
        this.game_components = this.node.getComponent(GameComponents_SuperSevenBlasts);
        // 初始化子游戏状态管理器
        this.subgame_state = new SubGameStateManager_SuperSevenBlasts();
        this.subgame_state?.setManager(this);
    }

    /**
     * 获取子游戏状态
     * @returns 子游戏状态实例
     */
    public getSubGameState(): State {
        let subGameState: State = null;
        const subGameKey = this.getSubGameKeyAtStartSpin();

        if (subGameKey === "base") {
            subGameState = this.subgame_state?.getBaseGameState() || null;
        } else if (subGameKey === "respin") {
            subGameState = this.subgame_state?.getRespinGameState() || null;
        }

        return subGameState;
    }

    /**
     * 播放主背景音乐
     */
    public playMainBgm(): void {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const soundController = SlotSoundController.Instance();

        switch (nextSubGameKey) {
            case "base":
                soundController.playAudio("MainBGM", "BGM");
                break;
            case "bonusGame":
                soundController.playAudio("BonusGameBGM", "BGM");
                break;
            case "respin":
                soundController.playAudio("RespinBGM", "BGM");
                break;
            default:
                soundController.playAudio("MainBGM", "BGM");
                break;
        }
    }

    /**
     * 异步准备场景加载（替换原__awaiter/generator逻辑）
     */
    public async asyncSceneLoadPrepare(): Promise<void> {
        // 禁用鼠标拖拽和键盘事件
        this.setMouseDragEventFlag(false);
        this.setKeyboardEventFlag(false);

        // 初始化相机控制
        const cameraPos = cc.v2(35, 0);
        const cameraRange = cc.v2(704, 730);
        CameraControl.Instance.initCameraControl(cameraPos, cameraRange);
        CameraControl.Instance.scrollDownScreen(0);

        // 根据画布比例控制游戏标题显示
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        if (TSUtility.isValid(canvas)) {
            const canvasSize = canvas.node.getContentSize();
            const canvasRatio = canvasSize.width / canvasSize.height;
            this.game_components.gameTitle.active = canvasRatio < 1.4;
        }

        // 初始化游戏组件状态
        this.game_components?.reelBGComponent.setBaseNormal();
        this.game_components?.topSevenComponent.setStay(false);
    }

    /**
     * 判断下一次旋转是否自动开始
     * @returns 是否自动开始
     */
    public isNextSpinAutoStart(): boolean {
        return SlotGameResultManager.Instance.getNextSubGameKey() === "respin";
    }

    /**
     * 异步加载场景特效（替换原__awaiter/generator逻辑）
     */
    public async asyncSceneLoadEffect(): Promise<void> {
        // 设置底部文本
        SlotManager.Instance.bottomUIText.setBottomTextInfo(
            BottomTextType.CustomData, 
            "Welcome to " + SlotGameRuleManager.Instance.slotName
        );

        // 播放背景音乐
        this.playMainBgm();
        // 启用键盘事件
        this.setKeyboardEventFlag(true);

        // 根据子游戏类型设置对应模式
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        switch (nextSubGameKey) {
            case "respin":
                this.setRespinMode();
                break;
            case "bonusGame":
                this.setBonusGameMode();
                break;
            default:
                this.setBaseMode();
                break;
        }

        // 自动开始旋转
        if (this.isNextSpinAutoStart()) {
            this.spinAfterCloseAllPopup();
        }
    }

    /**
     * 设置下一个特效标记
     */
    public setNextEffect(): void {
        const baseGameState = SlotGameResultManager.Instance.getSubGameState("base");
        if (TSUtility.isValid(baseGameState?.gauges) && TSUtility.isValid(baseGameState.gauges.featureEffect)) {
            this.next_Effect = baseGameState.gauges.featureEffect === 1;
        } else {
            this.next_Effect = false;
        }
    }

    /**
     * 获取下一个特效状态
     * @returns 下一个特效是否触发
     */
    public getNextEffect(): boolean {
        const currentSubGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        return currentSubGameKey !== "respin" && nextSubGameKey === "respin";
    }

    /**
     * 设置入口窗口
     */
    public setEntranceWindow(): void {
        let subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        if (subGameKey === "") subGameKey = "base";

        // 获取入口窗口和滚轮条配置
        const entranceWindow = SlotGameRuleManager.Instance.getEntranceWindow(subGameKey);
        let reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        if (!reelStrip) reelStrip = SlotGameRuleManager.Instance.getReelStrip("base");

        // 初始化每个滚轮
        if (this.reelMachine?.reels) {
            for (let i = 0; i < this.reelMachine.reels.length; ++i) {
                const reelData = reelStrip.getReel(i);
                const defaultBand = reelData.defaultBand;
                const randomIndex = Math.floor(Math.random() * defaultBand.length);
                const windowData = entranceWindow ? entranceWindow.GetWindow(i) : null;
                
                const reelComponent = this.reelMachine.reels[i].getComponent(Reel);
                if (windowData) {
                    reelComponent.invalidate(defaultBand, randomIndex, i, windowData);
                } else {
                    reelComponent.invalidate(defaultBand, randomIndex, i);
                }
            }
        }
    }

    /**
     * 设置重旋转模式
     */
    public setRespinMode(): void {
        // 禁用下注按钮
        SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(false);
        SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(false);
        
        // 显示剩余次数UI
        this.game_components?.remainCountUI.showUI();
        // 设置底部文本
        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "RESPIN ACTIVATED");

        // 获取重旋转状态（兼容base状态）
        let respinState = SlotGameResultManager.Instance.getSubGameState("respin");
        if (!TSUtility.isValid(respinState?.lastWindows) || respinState.lastWindows.length <= 0) {
            respinState = SlotGameResultManager.Instance.getSubGameState("base");
        }

        // 禁用键盘事件
        this.setKeyboardEventFlag(false);

        // 更新滚轮符号状态
        if (respinState?.lastWindows && this.reelMachine?.reels) {
            for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
                for (let symbolIdx = 0; symbolIdx < 3; symbolIdx++) {
                    let symbolValue = respinState.lastWindows[reelIdx][symbolIdx];
                    // 修正符号值
                    if (symbolValue > 93 && symbolValue < 100) symbolValue -= 3;
                    
                    // 更换符号
                    const reelComponent = this.reelMachine.reels[reelIdx].getComponent(Reel);
                    reelComponent.changeSymbol(symbolIdx, symbolValue);
                    
                    // 设置符号明暗状态
                    const symbolNode = reelComponent.getSymbol(symbolIdx);
                    const symbolComponent = symbolNode.getComponent(Symbol);
                    if (symbolValue > 90 && symbolValue < 110) {
                        symbolComponent.setDimmActive(false);
                    } else {
                        symbolComponent.setDimmActive(true);
                    }
                }
            }
        }

        // 更新UI状态
        this.game_components?.reelBGComponent.setRespinNormal();
        this.game_components?.lockComponent.fixWindowNoneEffect(respinState?.lastWindows || []);
    }

    /**
     * 设置基础游戏模式
     */
    public setBaseMode(): void {
        // 启用下注按钮
        SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(true);
        SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(true);
        
        // 显示所有滚轮
        if (SlotManager.Instance.reelMachine?.reels) {
            for (let i = 0; i < SlotManager.Instance.reelMachine.reels.length; i++) {
                SlotManager.Instance.reelMachine.reels[i].node.active = true;
            }
            SlotManager.Instance.reelMachine.showAllSymbol();
        }

        // 隐藏剩余次数UI
        this.game_components?.remainCountUI.hideUI();
        // 清空锁定符号
        this.game_components?.lockComponent.clearFilledSymbols();
        // 重置滚轮背景
        this.game_components?.reelBGComponent.setBaseNormal();
    }

    /**
     * 设置奖励游戏模式
     */
    public setBonusGameMode(): void {
        // 禁用旋转模式
        SlotReelSpinStateManager.Instance.setSpinMode(false);
        // 重置底部UI按钮
        SlotManager.Instance._bottomUI.setButtonActiveState(null);
        // 禁用下注按钮
        SlotManager.Instance._bottomUI.setChangeBetPerLineBtnInteractable(false);
        SlotManager.Instance._bottomUI.setChangeMaxBetBtnInteractable(false);
        
        // 禁用多点触控
        TSUtility.setMultiTouch(false);
        // 禁用键盘事件
        this.setKeyboardEventFlag(false);
        
        // 设置底部文本
        SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "GOOD LUCK!");
        // 继续奖励游戏
        this.game_components?.continueBonusGame();
    }

    /**
     * 处理分享信息变更
     */
    public processChangeShareInfo(): void {
        this.bannerImgNameMegawin = "slot-supersevenblasts-win-mega-20240207.jpg";
        this.bannerImgNameSuperwin = "slot-supersevenblasts-win-huge-20240207.jpg";
        this.bannerImgNameBigwin = "slot-supersevenblasts-win-big-20240207.jpg";
    }

    /**
     * 发送奖励游戏请求
     * @param callback 回调函数
     * @param params 请求参数
     */
    public async sendBonusGameRequestSuperSevenBlasts(
        callback: (result: any) => void, 
        params: any[] = []
    ): Promise<void> {
        try {
            // 发送旋转请求
            const spinResult = await this.sendSpinRequest(null, params);
            
            // 检查实例有效性
            if (!TSUtility.isValid(this) || !this.isAvailable()) return;
            // 检查旋转错误状态
            if (!this.checkSpinErrorState(spinResult)) return;

            // 处理服务器响应错误
            if (CommonServer.isServerResponseError(spinResult)) {
                if (!UserInfo.isAuthFail()) {
                    this.showSpinErrorPopup(spinResult);
                }
                return;
            }

            // 处理正常响应
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

            // 处理旋转流程
            this.onSpinProcess(spinResult, serverChangeResult);
            this._spinChangeResult.addChangeResult(serverChangeResult);
            
            // 执行回调
            callback(spinResult);
        } catch (error) {
            console.error("发送奖励游戏请求失败:", error);
        }
    }

    /**
     * 设置滚轮期望效果播放状态
     * @param reelIndex 滚轮索引
     */
    public setPlayReelExpectEffectState(reelIndex: number): void {
        // 隐藏所有期望效果
        this.reelMachine?.hideAllExpectEffects();

        // 检查滚轮有效性
        const reelNode = this.reelMachine?.reels[reelIndex];
        if (!reelNode || reelIndex >= this.reelMachine.reels.length || !reelNode.node.active) {
            return;
        }

        // 确定音效类型
        const effectType = this.game_components?.isSlotSlowSpin() ? "SlowReelExpect" : "ReelExpect";
        const soundController = SlotSoundController.Instance();
        const soundManager = SoundManager.Instance();

        // 检查期望效果标记
        const expectEffectFlag = SlotUIRuleManager.Instance.getExpectEffectFlag(
            reelIndex, 
            SlotGameResultManager.Instance.getVisibleSlotWindows()
        );

        if (expectEffectFlag) {
            // 播放期望效果（修正原拼写错误：shoe→show）
            const isShowSuccess = this.reelMachine.shoeExpectEffect(reelIndex) || false;
            if (isShowSuccess) {
                const audioClip = soundController.getAudioClip(effectType);
                if (soundManager.isPlayingFxOnce(audioClip)) {
                    soundManager.stopFxOnce(audioClip);
                }
                // 播放音效
                soundController.playAudio(effectType, "FX");
                // 临时降低主音量
                soundManager.setMainVolumeTemporarily(0.1);
                // 停止滚轮旋转音效
                SlotManager.Instance.stopReelSpinSound();
                // 设置滚轮模糊效果
                const reelComponent = reelNode.getComponent(Reel);
                reelComponent.setShaderValue("blurOffset", 0.03);
            }
        } else {
            // 停止音效并恢复音量
            const audioClip = soundController.getAudioClip(effectType);
            if (soundManager.isPlayingFxOnce(audioClip)) {
                soundManager.stopFxOnce(audioClip);
            }
            soundManager.resetTemporarilyMainVolume();
        }
    }

    /**
     * 获取重旋转开始状态
     * @param subGameKey 子游戏Key
     * @returns 顺序状态实例
     */
    public getReelRespinSpinStartState(subGameKey: string=""): SequencialState {
        const sequentialState = new SequencialState();
        let stateIndex = 0;

        // 插入预旋转状态
        sequentialState.insert(
            stateIndex++, 
            SlotManager.Instance.reelMachine.getPreSpinUsingNextSubGameKeyState(subGameKey)
        );

        // 插入无限旋转状态
        const infiniteSpinState = SlotManager.Instance.reelMachine.getInfiniteSpinUsingNextSubGameKeyState(subGameKey);
        sequentialState.insert(stateIndex, infiniteSpinState);

        // 插入发送旋转请求状态
        const sendSpinRequestState = this.getSendSpinRequestState(true);
        sequentialState.insert(stateIndex++, sendSpinRequestState);

        // 请求结束后完成所有子状态
        sendSpinRequestState.addOnEndCallback(() => {
            infiniteSpinState.setDoneAllSubStates();
        });

        return sequentialState;
    }

    /**
     * 获取发送旋转请求状态
     * @param isRespin 是否重旋转
     * @returns 状态实例
     */
    public getSendSpinRequestState(isRespin: boolean = false): State {
        const requestState = new State();
        
        requestState.addOnStartCallback(() => {
            this.sendSpinRequestProc(() => {
                // 重旋转时设置慢速旋转
                if (isRespin) {
                    this.game_components?.setSlotSlowSpin();
                }
                // 标记状态完成
                requestState.setDone();
            });
        });

        return requestState;
    }
}