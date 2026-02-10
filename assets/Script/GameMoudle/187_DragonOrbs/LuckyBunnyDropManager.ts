import PayCode from "../../Config/PayCode";
import CommonServer from "../../Network/CommonServer";
import CameraControl from "../../Slot/CameraControl";
import Reel from "../../Slot/Reel";
import SlotReelSpinStateManager from "../../Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../Slot/SlotSoundController";
import SymbolAni from "../../Slot/SymbolAni";
import SlotUIRuleManager from "../../Slot/rule/SlotUIRuleManager";
import { BottomTextType } from "../../SubGame/BottomUIText";
import UserInfo from "../../User/UserInfo";
import AsyncHelper from "../../global_utility/AsyncHelper";
import TSUtility from "../../global_utility/TSUtility";
import SlotGameResultManager, { ResultSymbolInfo } from "../../manager/SlotGameResultManager";
import SlotGameRuleManager from "../../manager/SlotGameRuleManager";
import SlotManager from "../../manager/SlotManager";
import SoundManager from "../../manager/SoundManager";
import SymbolPoolManager from "../../manager/SymbolPoolManager";
import GameComponent_LuckyBunnyDrop from "./GameComponent_LuckyBunnyDrop";
import JackpotSymbolComponent_LucykyBunnyDrop from "./JackpotSymbolComponent_LucykyBunnyDrop";
import JackpotSymbolInfoHelper_LuckyBunnyDrop from "./JackpotSymbolInfoHelper_LuckyBunnyDrop";
import ReelMachine_LuckyBunnyDrop from "./ReelMachine_LuckyBunnyDrop";
import SubGameStateManager_LuckyBunnyDrop from "./SubGameStateManager_LuckyBunnyDrop";
import TopUIComponent_LuckyBunnyDrop from "./TopUIComponent_LuckyBunnyDrop";
import WildSymbolComponent_LuckyBunnyDrop from "./WildSymbolComponent_LuckyBunnyDrop";


const { ccclass, property } = cc._decorator;

/**
 * LuckyBunnyDrop老虎机游戏核心管理器
 * 继承通用SlotManager，扩展专属游戏逻辑（基础游戏/免费旋转/锁定滚动模式管理、符号动画、音效、UI状态切换等）
 */
@ccclass()
export default class LuckyBunnyDropManager extends SlotManager {
    // === 编辑器序列化属性 ===
    @property({ type: cc.Node, displayName: '动画预加载节点' })
    readyNode: cc.Node = null!;

    // === 私有状态属性 ===
    private _scatterReelExpect: boolean = false; // 散列滚轮预期效果标记

    /**
     * 获取管理器单例实例
     * @returns LuckyBunnyDropManager单例
     */
    static getInstance(): LuckyBunnyDropManager {
        return SlotManager.Instance as LuckyBunnyDropManager;
    }

    /**
     * 获取当前子游戏状态（区分基础/免费旋转/锁定滚动模式）
     * @returns 对应子游戏状态实例
     */
    getSubGameState(): any {
        const subGameKey = this.getSubGameKeyAtStartSpin();
        switch (subGameKey) {
            case 'base':
                return SubGameStateManager_LuckyBunnyDrop.Instance().getBaseGameState();
            case 'freeSpin':
                return SubGameStateManager_LuckyBunnyDrop.Instance().getFreespinGameState();
            default:
                return SubGameStateManager_LuckyBunnyDrop.Instance().getLockAndRollGameState();
        }
    }

    /**
     * 预加载符号动画（初始化15个24号符号动画）
     */
    readyAniSymbol(): void {
        for (let i = 0; i < 15; i++) {
            this.addAniSymbol(24);
        }
    }

    /**
     * 添加单个符号动画到预加载节点
     * @param symbolId 符号ID（24为目标符号）
     */
    addAniSymbol(symbolId: number): void {
        const symbolNode = SymbolPoolManager.instance.getSymbolAni(symbolId);
        symbolNode.scale = 1;
        symbolNode.opacity = 255;
        symbolNode.setPosition(1000000, -144); // 初始隐藏位置
        this.readyNode.addChild(symbolNode);
        symbolNode.getComponent(SymbolAni)?.playAnimation();
    }

    /**
     * 播放主背景音乐（根据当前子游戏模式切换BGM）
     */
    playMainBgm(): void {
        const subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const bgmName = subGameKey === 'base' ? 'MainBGM' : 
                        subGameKey === 'freeSpin' ? 'FreeSpinBGM' : 'LNR_BGM';
        SlotSoundController.Instance().playAudio(bgmName, 'BGM');
    }

    /**
     * 场景加载准备（异步）
     * 初始化相机、禁用输入、预加载符号动画等
     */
    async asyncSceneLoadPrepare(): Promise<void> {
        // 设置自动旋转延迟
        SlotUIRuleManager.Instance.setAutospinDelay(0.5);
        // 预加载符号动画
        this.readyAniSymbol();
        // 禁用键盘/鼠标拖拽输入
        this.setKeyboardEventFlag(false);
        this.setMouseDragEventFlag(false);
        // 初始化相机控制
        const startPos = cc.v2(0, 0);
        const endPos = cc.v2(0, 724);
        CameraControl.Instance.initCameraControl(startPos, endPos);
        CameraControl.Instance.scrollUpScreen(0);
    }

    /**
     * 场景加载特效处理（异步）
     * 处理不同子游戏模式的UI初始化、音效播放、相机动画等
     */
    async asyncSceneLoadEffect(): Promise<void> {
        const subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const slotManager = SlotManager.Instance;
        const gameComponent = slotManager.getComponent(GameComponent_LuckyBunnyDrop);
        
        // 设置底部欢迎文本
        slotManager.bottomUIText.setBottomTextInfo(
            BottomTextType.CustomData, 
            `Welcome to ${SlotGameRuleManager.Instance.slotName}`
        );

        // 免费旋转模式初始化
        if (subGameKey === 'freeSpin' || subGameKey === 'lockNRollTumble_fromFreeSpin') {
            SlotReelSpinStateManager.Instance.setFreespinMode(true);
            const freeSpinState = SlotGameResultManager.Instance.getSubGameState('freeSpin');
            
            // 初始化免费旋转计数/倍数
            slotManager._freespinTotalCount = freeSpinState.totalCnt;
            slotManager._freespinPastCount = freeSpinState.spinCnt;
            slotManager._freespinMultiplier = freeSpinState.spinMultiplier;
            SubGameStateManager_LuckyBunnyDrop.Instance().changeUIToFreespin();

            // 免费旋转专属Wild符号初始化
            if (subGameKey === 'freeSpin') {
                gameComponent.lockWild.initComponent();
                gameComponent.lockWild.getWildInfo();
                gameComponent.lockWild.fixedWindow(freeSpinState.lastWindows);
            }
        }

        // 锁定滚动模式初始化
        if (subGameKey === 'lockNRollTumble' || subGameKey === 'lockNRollTumble_fromFreeSpin') {
            // 切换滚轮节点显示状态
            gameComponent.normal_Reels.active = false;
            gameComponent.lockAndRoll_Reels.active = true;
            // 初始化锁定滚动UI
            gameComponent.lockAndRoll.setStartFixWindow();
            gameComponent.showLockAndRollUI();
            
            // 处理锁定滚动奖金池
            const stateKey = SlotReelSpinStateManager.Instance.getFreespinMode() 
                ? 'lockNRollTumble_fromFreeSpin' 
                : 'lockNRollTumble';
            const lockState = SlotGameResultManager.Instance.getSubGameState(stateKey);
            let potValue = 0;
            if (TSUtility.isValid(lockState.pots?.Pot_inLockNroll)) {
                potValue = lockState.pots.Pot_inLockNroll.pot;
            }

            // 设置底部UI显示总奖金
            slotManager._bottomUI.setBlockAutoEvent(true);
            slotManager.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, 'TOTAL WIN');
            slotManager.bottomUIText.setWinMoney(potValue);
        } else {
            // 基础游戏模式：显示普通滚轮，隐藏锁定滚动UI
            gameComponent.normal_Reels.active = true;
            gameComponent.lockAndRoll_Reels.active = false;
            gameComponent.hideLockAndRollUI();
        }

        // 初始化顶部UI
        gameComponent.topUI.getComponent(TopUIComponent_LuckyBunnyDrop)?.setEnterance();
        // 播放入场音效
        SlotSoundController.Instance().playAudio('Entrace', 'FX');
        
        // 等待2.5秒后执行后续逻辑
        await AsyncHelper.delay(2.5);
        
        // 绑定相机滚动回调
        CameraControl.Instance.callbackScrollUp = this.callbackOnScrollUp.bind(this);
        CameraControl.Instance.callbackScrollDown = this.callbackOnScrollDown.bind(this);
        
        // 播放主BGM + 相机缩放/滚动动画
        this.playMainBgm();
        CameraControl.Instance.resetZoomRelative(0.8, false);
        CameraControl.Instance.scrollDownScreen(0.8,cc.easeOut(2));
        
        // 等待相机动画完成
        await AsyncHelper.delay(0.8);
        
        // 恢复输入 + 自动启动旋转（如需） + 清理预加载动画节点
        this.setKeyboardEventFlag(true);
        this.setMouseDragEventFlag(true);
        if (this.isNextSpinAutoStart()) {
            this.spinAfterCloseAllPopup();
        }
        this.readyNode.removeAllChildren();
    }

    /**
     * 判断是否需要自动启动下一次旋转（免费旋转/锁定滚动模式自动启动）
     * @returns 是否自动启动
     */
    isNextSpinAutoStart(): boolean {
        const subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        return ['freeSpin', 'lockNRollTumble', 'lockNRollTumble_fromFreeSpin'].includes(subGameKey);
    }

    /**
     * 设置入场滚轮窗口（初始化滚轮符号显示）
     */
    setEntranceWindow(): void {
        const subGameKey = SlotGameResultManager.Instance.getNextSubGameKey() || 'base';
        const entranceWindow = SlotGameRuleManager.Instance.getEntranceWindow(subGameKey);
        let reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey) || 
                        SlotGameRuleManager.Instance.getReelStrip('base');
        const symbolInfo = this.getEntranceSymbolInfo();

        // 初始化普通滚轮
        const reelMachine = this.reelMachine;
        for (let a = 0; a < reelMachine.reels.length; ++a) {
            const reelBand = reelStrip.getReel(a).defaultBand;
            const window = entranceWindow?.GetWindow(a);
            const reelComp = reelMachine.reels[a].getComponent(Reel);
            
            if (window) {
                reelComp.invalidate(
                    reelBand, 
                    Math.floor(Math.random() * reelBand.length), 
                    a, 
                    window, 
                    symbolInfo[a]
                );
            } else {
                reelComp.invalidate(
                    reelBand, 
                    Math.floor(Math.random() * reelBand.length), 
                    a
                );
            }
        }

        // 初始化锁定滚动滚轮
        const reelMachineComp = reelMachine.getComponent(ReelMachine_LuckyBunnyDrop);
        reelStrip = SlotGameRuleManager.Instance.getReelStrip('lockNRollTumble') || 
                    SlotGameRuleManager.Instance.getReelStrip('base');
        for (let a = 0; a < reelMachineComp.lockAndRoll_Reels.length; ++a) {
            const reelBand = reelStrip.getReel(a).defaultBand;
            const reelComp = reelMachineComp.lockAndRoll_Reels[a].getComponent(Reel);
            reelComp.invalidate(
                reelBand, 
                Math.floor(Math.random() * reelBand.length), 
                a
            );
        }

        // 免费旋转模式：恢复Wild/Jackpot符号状态
        if (subGameKey === 'freeSpin') {
            const freeSpinState = SlotGameResultManager.Instance.getSubGameState('freeSpin');
            const betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
            const exData = freeSpinState.exDataWithBetPerLine?.[betPerLine];
            
            // 收集Wild符号计数数据
            const wildCounts: number[] = [];
            for (let a = 0; a < 5; ++a) {
                for (let m = 0; m < 3; ++m) {
                    const index = 3 * a + m;
                    let count = 0;
                    if (exData?.exDatas?.selectedCell?.datas?.[index]) {
                        count = Number(exData.exDatas.selectedCell.datas[index].gauge) || 0;
                    }
                    wildCounts.push(count);
                }
            }

            // 恢复符号显示状态
            if (TSUtility.isValid(freeSpinState) && TSUtility.isValid(freeSpinState.lastWindows)) {
                for (let a = 0; a < 5; a++) {
                    const reelComp = reelMachine.reels[a].getComponent(Reel);
                    for (let m = 0; m < 3; m++) {
                        const symbolId = freeSpinState.lastWindows[a][m];
                        let displayId = symbolId;
                        
                        // 修正符号ID范围
                        if (displayId < 90 && displayId > 71) {
                            displayId = 72;
                        }
                        reelComp.changeSymbol(m, displayId);

                        // Jackpot符号初始化
                        if (symbolId > 90) {
                            const jackpotComp = reelComp.getSymbol(m).getComponent(JackpotSymbolComponent_LucykyBunnyDrop);
                            if (TSUtility.isValid(jackpotComp)) {
                                const jackpotInfo = JackpotSymbolInfoHelper_LuckyBunnyDrop.getSymbolInfo(symbolId);
                                let type = -1;
                                let multiplier = -1;
                                let prize = -1;

                                if (jackpotInfo.type === 'jackpot') {
                                    type = jackpotInfo.key === 'mini' ? 1 :
                                           jackpotInfo.key === 'minor' ? 2 :
                                           jackpotInfo.key === 'major' ? 3 :
                                           jackpotInfo.key === 'mega' ? 4 : 5;
                                } else if (jackpotInfo.type === 'multiplier') {
                                    type = 0;
                                    prize = jackpotInfo.prize;
                                    multiplier = jackpotInfo.multiplier;
                                }
                                jackpotComp.setCenterInfo(symbolId, type, multiplier);
                            }
                        }
                        // Wild符号初始化
                        else if (symbolId > 70) {
                            const wildComp = reelComp.getSymbol(m).getComponent(WildSymbolComponent_LuckyBunnyDrop);
                            if (TSUtility.isValid(wildComp)) {
                                const index = 3 * a + m;
                                const count = index < wildCounts.length ? wildCounts[index] : 0;
                                wildComp.setCount(count - 1);
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * 获取入场符号信息（初始化Jackpot/Wild符号数据）
     * @returns 符号信息二维数组
     */
    getEntranceSymbolInfo(): any[][] {
        const createSymbolInfo = (type: string, prize: number, key?: string) => {
            const info = new ResultSymbolInfo();
            info.type = type;
            info.prize = prize;
            if (key) info.key = key;
            return info;
        };

        return [
            // 第一列：全倍数符号
            [
                createSymbolInfo('multiplier', 300),
                createSymbolInfo('multiplier', 300),
                createSymbolInfo('multiplier', 300)
            ],
            // 第二列：倍数 + Mega Jackpot + 倍数
            [
                createSymbolInfo('multiplier', 300),
                createSymbolInfo('jackpot', 300, 'mega'),
                createSymbolInfo('multiplier', 300)
            ],
            // 第三列：倍数 + Grand Jackpot + 倍数
            [
                createSymbolInfo('multiplier', 300),
                createSymbolInfo('jackpot', 300, 'grand'),
                createSymbolInfo('multiplier', 300)
            ],
            // 第四列：倍数 + Major Jackpot + 倍数
            [
                createSymbolInfo('multiplier', 300),
                createSymbolInfo('jackpot', 300, 'major'),
                createSymbolInfo('multiplier', 300)
            ],
            // 第五列：全倍数符号
            [
                createSymbolInfo('multiplier', 300),
                createSymbolInfo('multiplier', 300),
                createSymbolInfo('multiplier', 300)
            ]
        ];
    }

    /**
     * 设置分享图片名称（不同奖励等级对应不同分享图）
     */
    processChangeShareInfo(): void {
        this.bannerImgNameMinorWin = "slot-luckybunnydrop-win-super-20230214.jpg";
        this.bannerImgNameBigwin = "slot-luckybunnydrop-win-big-20230214.jpg";
        this.bannerImgNameMegawin = "slot-luckybunnydrop-win-mega-20230214.jpg";
        this.bannerImgNameSuperwin = "slot-luckybunnydrop-win-huge-20230214.jpg";
        this.freespinShareImgName = "slot-luckybunnydrop-free-spins-20230214.jpg";
        this.lockandrollShareImgName = "slot-luckybunnydrop-Locknroll-20230317.jpg";
    }

    /**
     * 相机向上滚动回调（顶部UI切换为闲置状态）
     */
    callbackOnScrollUp(): void {
        const gameComponent = SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop);
        gameComponent.topUI.getComponent(TopUIComponent_LuckyBunnyDrop)?.setIdle();
    }

    /**
     * 相机向下滚动回调（停止顶部UI动画）
     */
    callbackOnScrollDown(): void {
        const gameComponent = SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop);
        gameComponent.topUI.getComponent(TopUIComponent_LuckyBunnyDrop)?.stopTopUI();
    }

    /**
     * 发送锁定滚动请求（异步）
     * @param callback 旋转成功后的回调函数
     */
    async sendLockAndRollRequest(callback: () => void): Promise<void> {
        // 发送旋转请求
        const response = await this.sendSpinRequest(null,null);
        
        // 校验实例有效性和请求错误
        if (!TSUtility.isValid(this) || !this.checkSpinErrorState(response)) {
            return;
        }

        // 服务器响应错误处理
        if (CommonServer.isServerResponseError(response)) {
            if (!UserInfo.isAuthFail()) {
                this.showSpinErrorPopup(response);
            }
            SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_STOP);
            return;
        }

        // 处理旋转成功逻辑
        SlotGameResultManager.Instance.resetGameResult();
        SlotGameResultManager.Instance.setGameResult(response);
        
        // 更新用户资产
        const changeResult = UserInfo.instance().getServerChangeResult(response);
        const coinChange = changeResult.removeChangeCoinByPayCode(PayCode.SlotBetWithdraw);
        if (coinChange !== 0) {
            UserInfo.instance().addUserAssetMoney(coinChange);
            this._inGameUI.onSpinBetting(changeResult);
        }

        // 更新等级经验
        const levelExp = changeResult.getTotalChangeLevelPoint();
        this._inGameUI.addLevelExp(levelExp);

        // 处理旋转流程 + 更新状态
        this.onSpinProcess(response, changeResult);
        this._spinChangeResult.addChangeResult(changeResult);
        SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_SKIPABLE);
        
        // 执行回调
        callback();
    }

    /**
     * 设置滚轮预期效果状态（普通符号）
     * @param reelIndex 滚轮索引
     */
    setPlayReelExpectEffectState(reelIndex: number): void {
        // 调试断点
        if (reelIndex === 4) {
            cc.log("break point");
        }

        // 隐藏所有预期效果
        this.reelMachine.hideAllExpectEffects();
        const windows = SlotGameResultManager.Instance.getVisibleSlotWindows();
        
        // 显示当前滚轮预期效果
        if (this.reelMachine.reels.length > reelIndex && this.getExpectEffectFlag(reelIndex, windows)) {
            if (this.reelMachine.shoeExpectEffect(reelIndex)) {
                const audioClip = SlotSoundController.Instance().getAudioClip("ReelExpect");
                if (SoundManager.Instance().isPlayingFxOnce(audioClip)) {
                    SoundManager.Instance().stopFxOnce(audioClip);
                }
                // 播放预期音效 + 降低主音量 + 停止滚轮旋转音效 + 模糊效果
                SlotSoundController.Instance().playAudio("ReelExpect", "FX");
                SoundManager.Instance().setMainVolumeTemporarily(0.1);
                SlotManager.Instance.stopReelSpinSound();
                this.reelMachine.reels[reelIndex].getComponent(Reel)?.setShaderValue("blurOffset", 0.03);
            }
        } else {
            // 恢复音效状态
            const audioClip = SlotSoundController.Instance().getAudioClip("ReelExpect");
            if (SoundManager.Instance().isPlayingFxOnce(audioClip)) {
                SoundManager.Instance().stopFxOnce(audioClip);
            }
            SoundManager.Instance().resetTemporarilyMainVolume();
        }
    }

    /**
     * 设置滚轮Jackpot预期效果状态
     * @param reelIndex 滚轮索引
     */
    setPlayReelExpectJackpotEffectState(reelIndex: number): void {
        // 调试断点
        if (reelIndex === 4) {
            cc.log("break point");
        }

        // 隐藏所有Jackpot预期效果
        this.reelMachine.getComponent(ReelMachine_LuckyBunnyDrop)?.hideAllJackpotExpectEffects();
        const windows = this.getReelStopWindow();
        
        // 显示当前滚轮Jackpot预期效果
        if (this.reelMachine.reels.length > reelIndex && this.getExpectJackpotEffectFlag(reelIndex, windows)) {
            if (!this._scatterReelExpect && this.reelMachine.getComponent(ReelMachine_LuckyBunnyDrop)?.showJackpotExpectEffect(reelIndex)) {
                const audioClip = SlotSoundController.Instance().getAudioClip("ReelExpect");
                if (SoundManager.Instance().isPlayingFxOnce(audioClip)) {
                    SoundManager.Instance().stopFxOnce(audioClip);
                }
                // 播放预期音效 + 降低主音量 + 停止滚轮旋转音效 + 模糊效果
                SlotSoundController.Instance().playAudio("ReelExpect", "FX");
                SoundManager.Instance().setMainVolumeTemporarily(0.1);
                SlotManager.Instance.stopReelSpinSound();
                this.reelMachine.reels[reelIndex].getComponent(Reel)?.setShaderValue("blurOffset", 0.03);
            }
        } else if (!this._scatterReelExpect) {
            // 恢复音效状态
            const audioClip = SlotSoundController.Instance().getAudioClip("ReelExpect");
            if (SoundManager.Instance().isPlayingFxOnce(audioClip)) {
                SoundManager.Instance().stopFxOnce(audioClip);
            }
            SoundManager.Instance().resetTemporarilyMainVolume();
        }
    }

    /**
     * 判断是否显示普通符号预期效果
     * @param reelIndex 滚轮索引
     * @param windows 滚轮窗口数据
     * @returns 是否显示预期效果
     */
    getExpectEffectFlag(reelIndex: number, windows: any): boolean {
        let count = 0;
        const isFreeSpin = SlotReelSpinStateManager.Instance.getFreespinMode();
        const betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
        const freeSpinState = SlotGameResultManager.Instance.getSubGameState('freeSpin');
        const exData = freeSpinState?.exDataWithBetPerLine?.[betPerLine];

        // 统计目标符号数量
        for (let o = 0; o < reelIndex; ++o) {
            const window = windows.GetWindow(o);
            for (let i = 0; i < window.size; ++i) {
                if (window.getSymbol(i) === 51) { // 51为目标符号ID
                    if (isFreeSpin) {
                        const index = 3 * o + i;
                        const data = exData?.exDatas?.selectedCell?.datas?.[index];
                        if (!TSUtility.isValid(data)) {
                            count++;
                        }
                    } else {
                        count++;
                    }
                }
            }
        }

        // 校验Wild符号数量限制
        const gameComponent = this.getComponent(GameComponent_LuckyBunnyDrop);
        const wildCount = gameComponent.lockWild.getFilledWildCount(reelIndex);
        return wildCount <= 2 && count >= 2;
    }

    /**
     * 判断是否显示Jackpot符号预期效果
     * @param reelIndex 滚轮索引
     * @param windows 滚轮窗口数据
     * @returns 是否显示预期效果
     */
    getExpectJackpotEffectFlag(reelIndex: number, windows: any): boolean {
        let count = 0;
        const isFreeSpin = SlotReelSpinStateManager.Instance.getFreespinMode();
        const betPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
        const freeSpinState = SlotGameResultManager.Instance.getSubGameState('freeSpin');
        const exData = freeSpinState?.exDataWithBetPerLine?.[betPerLine];

        // 统计Jackpot符号数量
        for (let o = 0; o < reelIndex; ++o) {
            const window = windows.GetWindow(o);
            for (let i = 0; i < window.size; ++i) {
                if (window.getSymbol(i) >= 90) { // 90+为Jackpot符号ID范围
                    if (isFreeSpin) {
                        const index = 3 * o + i;
                        const data = exData?.exDatas?.selectedCell?.datas?.[index];
                        if (!TSUtility.isValid(data)) {
                            count++;
                        }
                    } else {
                        count++;
                    }
                }
            }
        }

        // 校验Wild符号数量限制 + Jackpot数量阈值
        const gameComponent = this.getComponent(GameComponent_LuckyBunnyDrop);
        const wildCount = gameComponent.lockWild.getFilledWildCount(reelIndex);
        const isWildValid = wildCount <= 2;
        
        if (!isWildValid) return false;

        // 不同滚轮索引的阈值判断
        if (reelIndex === 4) {
            return count === 4 ? wildCount < 2 : count > 4 && wildCount < 3;
        } else {
            return count >= 4;
        }
    }
}