const { ccclass, property } = cc._decorator;

// 导入外部依赖模块（路径与原JS保持一致）
import PayCode from '../../Config/PayCode';
import CommonServer from '../../Network/CommonServer';
import UserInfo from '../../User/UserInfo';


import GameComponent_LuckyBunnyDrop from './GameComponent_LuckyBunnyDrop';
import ReelMachine_LuckyBunnyDrop from './ReelMachine_LuckyBunnyDrop';
import SubGameStateManager_LuckyBunnyDrop from './SubGameStateManager_LuckyBunnyDrop';
import SlotManager from '../../manager/SlotManager';
import CameraControl from '../../Slot/CameraControl';
import SlotGameResultManager, { ResultSymbolInfo } from '../../manager/SlotGameResultManager';
import SlotSoundController from '../../Slot/SlotSoundController';
import SlotUIRuleManager from '../../Slot/rule/SlotUIRuleManager';
import { BottomTextType } from '../../SubGame/BottomUIText';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import TSUtility from '../../global_utility/TSUtility';
import AsyncHelper from '../../global_utility/AsyncHelper';
import Reel from '../../Slot/Reel';
import SoundManager from '../../manager/SoundManager';
import SymbolPoolManager from '../../manager/SymbolPoolManager';
import SymbolAni from '../../Slot/SymbolAni';
import TopUIComponent_LuckyBunnyDrop from './TopUIComponent_LuckyBunnyDrop';
import JackpotSymbolComponent_LucykyBunnyDrop from './JackpotSymbolComponent_LucykyBunnyDrop';
import JackpotSymbolInfoHelper_LuckyBunnyDrop from './JackpotSymbolInfoHelper_LuckyBunnyDrop';
import WildSymbolComponent_LuckyBunnyDrop from './WildSymbolComponent_LuckyBunnyDrop';

/**
 * 幸运兔子掉落游戏管理器（继承SlotManager）
 * 负责场景加载、子游戏状态管理、符号动画、音效控制、滚轮预期特效、LockAndRoll请求等核心逻辑
 */
@ccclass()
export default class LuckyBunnyDropManager extends SlotManager {
    // 符号动画准备节点
    @property(cc.Node)
    public readyNode: cc.Node = null;

    // Scatter滚轮预期状态标识
    private _scatterReelExpect: boolean = false;

  

    /**
     * 获取单例实例（兼容原JS逻辑）
     * @returns SlotManager单例
     */
    public static getInstance(): SlotManager {
        return SlotManager.Instance;
    }

    /**
     * 获取当前子游戏状态
     * @returns 子游戏状态（base/freeSpin/lockAndRoll）
     */
    public getSubGameState(): any {
        const subGameKey = this.getSubGameKeyAtStartSpin();
        switch (subGameKey) {
            case "base":
                return SubGameStateManager_LuckyBunnyDrop.Instance().getBaseGameState();
            case "freeSpin":
                return SubGameStateManager_LuckyBunnyDrop.Instance().getFreespinGameState();
            default:
                return SubGameStateManager_LuckyBunnyDrop.Instance().getLockAndRollGameState();
        }
    }

    /**
     * 准备符号动画（预加载15个符号）
     */
    public readyAniSymbol(): void {
        for (let i = 0; i < 15; i++) {
            this.addAniSymbol(24);
        }
    }

    /**
     * 添加符号动画到准备节点
     * @param symbolId 符号ID
     */
    public addAniSymbol(symbolId: number): void {
        const symbolAniNode = SymbolPoolManager.instance.getSymbolAni(symbolId);
        if (symbolAniNode) {
            // 设置符号动画节点初始属性
            symbolAniNode.scale = 1;
            symbolAniNode.opacity = 255;
            symbolAniNode.x = 1000000; // 初始隐藏在屏幕外
            symbolAniNode.y = -144;
            
            // 添加到准备节点并播放动画
            this.readyNode?.addChild(symbolAniNode);
            const symbolAniComp = symbolAniNode.getComponent(SymbolAni);
            symbolAniComp?.playAnimation();
        }
    }

    /**
     * 播放主背景音乐（根据子游戏类型）
     */
    public playMainBgm(): void {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        switch (nextSubGameKey) {
            case "base":
                SlotSoundController.Instance().playAudio("MainBGM", "BGM");
                break;
            case "freeSpin":
                SlotSoundController.Instance().playAudio("FreeSpinBGM", "BGM");
                break;
            default: // lockNRoll
                SlotSoundController.Instance().playAudio("LNR_BGM", "BGM");
                break;
        }
    }

    /**
     * 异步场景加载准备（初始化相机、禁用输入、准备符号动画）
     * @returns Promise<void>
     */
    public async asyncSceneLoadPrepare(): Promise<void> {
        // 设置自动自旋延迟
        SlotUIRuleManager.Instance.setAutospinDelay(0.5);
        // 准备符号动画
        this.readyAniSymbol();
        // 禁用键盘/鼠标拖拽事件
        this.setKeyboardEventFlag(false);
        this.setMouseDragEventFlag(false);
        
        // 初始化相机控制
        const cameraStartPos = new cc.Vec2(0, 0);
        const cameraEndPos = new cc.Vec2(0, 724);
        CameraControl.Instance.initCameraControl(cameraStartPos, cameraEndPos);
        CameraControl.Instance.scrollUpScreen(0);
    }

    /**
     * 异步场景加载特效（设置UI、音效、滚轮状态、相机动画）
     * @returns Promise<void>
     */
    public async asyncSceneLoadEffect(): Promise<void> {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        
        // 1. 设置底部UI欢迎文本
        SlotManager.Instance.bottomUIText.setBottomTextInfo(
            BottomTextType.CustomData, 
            "Welcome to " + SlotGameRuleManager.Instance.slotName
        );

        // 2. 免费旋转/锁定滚动模式处理
        if (nextSubGameKey === "freeSpin" || nextSubGameKey === "lockNRollTumble_fromFreeSpin") {
            SlotReelSpinStateManager.Instance.setFreespinMode(true);
            const freeSpinState = SlotGameResultManager.Instance.getSubGameState("freeSpin");
            
            // 更新免费旋转计数/倍数
            SlotManager.Instance._freespinTotalCount = freeSpinState.totalCnt;
            SlotManager.Instance._freespinPastCount = freeSpinState.spinCnt;
            SlotManager.Instance._freespinMultiplier = freeSpinState.spinMultiplier;
            SubGameStateManager_LuckyBunnyDrop.Instance().changeUIToFreespin();
        }

        // 3. 免费旋转模式额外处理（Wild符号初始化）
        if (nextSubGameKey === "freeSpin") {
            SlotReelSpinStateManager.Instance.setFreespinMode(true);
            const freeSpinState = SlotGameResultManager.Instance.getSubGameState("freeSpin");
            const lockWildComp = SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop)!.lockWild;
            
            lockWildComp.initComponent();
            lockWildComp.getWildInfo();
            lockWildComp.fixedWindow(freeSpinState.lastWindows);
        }

        // 4. 锁定滚动模式处理
        if (nextSubGameKey === "lockNRollTumble" || nextSubGameKey === "lockNRollTumble_fromFreeSpin") {
            const gameComp = SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop)!;
            // 切换滚轮显示状态
            gameComp.normal_Reels.active = false;
            gameComp.lockAndRoll_Reels.active = true;
            // 初始化锁定滚动UI
            gameComp.lockAndRoll.setStartFixWindow();
            gameComp.showLockAndRollUI();
            
            // 获取锁定滚动奖池数据
            const subGameType = SlotReelSpinStateManager.Instance.getFreespinMode() 
                ? "lockNRollTumble_fromFreeSpin" 
                : "lockNRollTumble";
            const lockNRollState = SlotGameResultManager.Instance.getSubGameState(subGameType);
            let potValue = 0;
            
            if (TSUtility.isValid(lockNRollState.pots?.Pot_inLockNroll)) {
                potValue = lockNRollState.pots.Pot_inLockNroll.pot;
            }

            // 设置底部UI显示总赢奖
            SlotManager.Instance._bottomUI.setBlockAutoEvent(true);
            SlotManager.Instance.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "TOTAL WIN");
            SlotManager.Instance.bottomUIText.setWinMoney(potValue);
        } else {
            // 普通模式：显示普通滚轮，隐藏锁定滚动UI
            const gameComp = SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop)!;
            gameComp.normal_Reels.active = true;
            gameComp.lockAndRoll_Reels.active = false;
            gameComp.hideLockAndRollUI();
        }

        // 5. 设置顶部UI入场状态并播放入场音效
        const topUIComp = SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop)!.topUI.getComponent(TopUIComponent_LuckyBunnyDrop);
        topUIComp.setEnterance();
        SlotSoundController.Instance().playAudio("Entrace", "FX");

        // 6. 延迟执行相机动画和后续逻辑
        await AsyncHelper.delay(2.5);
        
        // 设置相机滚动回调
        CameraControl.Instance.callbackScrollUp = this.callbackOnScrollUp.bind(this);
        CameraControl.Instance.callbackScrollDown = this.callbackOnScrollDown.bind(this);
        
        // 播放主背景音乐
        this.playMainBgm();
        
        // 相机缩放+滚动动画
        CameraControl.Instance.resetZoomRelative(0.8, false);
        CameraControl.Instance.scrollDownScreen(0.8, cc.easeOut(2));
        
        // 延迟恢复输入并自动自旋
        await AsyncHelper.delay(0.8);
        this.setKeyboardEventFlag(true);
        this.setMouseDragEventFlag(true);
        
        // 自动启动下一次自旋（免费旋转/锁定滚动模式）
        if (this.isNextSpinAutoStart()) {
            this.spinAfterCloseAllPopup();
        }

        // 清理准备节点的符号动画
        this.readyNode?.removeAllChildren();
    }

    /**
     * 判断是否自动启动下一次自旋（免费旋转/锁定滚动模式）
     * @returns 是否自动自旋
     */
    public isNextSpinAutoStart(): boolean {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        return nextSubGameKey === "freeSpin" 
            || nextSubGameKey === "lockNRollTumble" 
            || nextSubGameKey === "lockNRollTumble_fromFreeSpin";
    }

    /**
     * 设置入场窗口符号（初始化滚轮显示）
     */
    public setEntranceWindow(): void {
        let subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        if (!subGameKey) subGameKey = "base";

        // 获取入场窗口和滚轮条数据
        const entranceWindow = SlotGameRuleManager.Instance.getEntranceWindow(subGameKey);
        let reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        if (!reelStrip) reelStrip = SlotGameRuleManager.Instance.getReelStrip("base");

        // 获取入场符号信息
        const entranceSymbolInfo = this.getEntranceSymbolInfo();

        // 初始化普通滚轮
        for (let i = 0; i < this.reelMachine.reels.length; i++) {
            const reelBand = reelStrip.getReel(i).defaultBand;
            const window = entranceWindow?.GetWindow(i);
            const reelComp = this.reelMachine.reels[i].getComponent(Reel);
            
            if (window) {
                reelComp.invalidate(
                    reelBand, 
                    Math.floor(Math.random() * reelBand.length), 
                    i, 
                    window, 
                    entranceSymbolInfo[i]
                );
            } else {
                reelComp.invalidate(
                    reelBand, 
                    Math.floor(Math.random() * reelBand.length), 
                    i
                );
            }
        }

        // 初始化锁定滚动滚轮
        const reelMachineComp = this.reelMachine.getComponent(ReelMachine_LuckyBunnyDrop);
        let lockNRollReelStrip = SlotGameRuleManager.Instance.getReelStrip("lockNRollTumble");
        if (!lockNRollReelStrip) lockNRollReelStrip = SlotGameRuleManager.Instance.getReelStrip("base");

        for (let i = 0; i < reelMachineComp.lockAndRoll_Reels.length; i++) {
            const reelBand = lockNRollReelStrip.getReel(i).defaultBand;
            const reelComp = reelMachineComp.lockAndRoll_Reels[i].getComponent(Reel);
            
            reelComp.invalidate(
                reelBand, 
                Math.floor(Math.random() * reelBand.length), 
                i
            );
        }

        // 免费旋转模式：更新Wild/Jackpot符号信息
        if (subGameKey === "freeSpin") {
            const freeSpinState = SlotGameResultManager.Instance.getSubGameState(subGameKey);
            const exData = SlotGameResultManager.Instance.getSubGameState("freeSpin").exDataWithBetPerLine;
            const currentBetPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();
            const lastSymbolInfoWindow = freeSpinState.lastSymbolInfoWindow;
            const gaugeDatas: number[] = [];

            // 解析Gauge数据
            for (let a = 0; a < 5; a++) {
                for (let m = 0; m < 3; m++) {
                    let gaugeValue = 0;
                    const cellIndex = 3 * a + m;
                    
                    if (exData[currentBetPerLine]) {
                        const selectedCell = exData[currentBetPerLine].exDatas.selectedCell;
                        if (TSUtility.isValid(selectedCell) && TSUtility.isValid(selectedCell.datas)) {
                            const cellData = selectedCell.datas[cellIndex];
                            gaugeValue = TSUtility.isValid(cellData) ? Number(cellData.gauge) : 0;
                        }
                    }
                    gaugeDatas.push(gaugeValue);
                }
            }

            // 更新滚轮符号
            if (TSUtility.isValid(freeSpinState) && TSUtility.isValid(freeSpinState.lastWindows)) {
                for (let a = 0; a < 5; a++) {
                    const reelComp = this.reelMachine.reels[a].getComponent(Reel);
                    for (let m = 0; m < 3; m++) {
                        const symbolId = freeSpinState.lastWindows[a][m];
                        let displaySymbolId = symbolId;

                        // Wild符号替换（71-89 → 72）
                        if (displaySymbolId < 90 && displaySymbolId > 71) {
                            displaySymbolId = 72;
                        }

                        // 更新符号显示
                        reelComp.changeSymbol(m, displaySymbolId);

                        // Jackpot符号（>90）：设置中心信息
                        if (symbolId > 90) {
                            const jackpotComp = reelComp.getSymbol(m).getComponent(JackpotSymbolComponent_LucykyBunnyDrop);
                            const symbolInfo = JackpotSymbolInfoHelper_LuckyBunnyDrop.getSymbolInfo(symbolId);
                            
                            let jackpotType = -1;
                            let prize = -1;
                            let multiplier = -1;

                            if (symbolInfo.type === "jackpot") {
                                jackpotType = symbolInfo.key === "mini" ? 1 :
                                               symbolInfo.key === "minor" ? 2 :
                                               symbolInfo.key === "major" ? 3 :
                                               symbolInfo.key === "mega" ? 4 : 5;
                            } else if (symbolInfo.type === "multiplier") {
                                jackpotType = 0;
                                prize = symbolInfo.prize;
                                multiplier = symbolInfo.multiplier;
                            }

                            if (TSUtility.isValid(jackpotComp) && TSUtility.isValid(lastSymbolInfoWindow)) {
                                jackpotComp.setCenterInfo(symbolId, jackpotType, multiplier);
                            }
                        } 
                        // Wild符号（>70）：设置计数
                        else if (symbolId > 70) {
                            const wildComp = reelComp.getSymbol(m).getComponent(WildSymbolComponent_LuckyBunnyDrop);
                            if (TSUtility.isValid(wildComp)) {
                                const cellIndex = 3 * a + m;
                                const gaugeValue = cellIndex < gaugeDatas.length ? gaugeDatas[cellIndex] : 0;
                                wildComp.setCount(gaugeValue - 1);
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * 获取入场符号信息（预定义Jackpot/Multiplier符号信息）
     * @returns 符号信息二维数组
     */
    public getEntranceSymbolInfo(): any[][] {
        const symbolInfoList: any[][] = [];

        // 滚轮0：全Multiplier
        symbolInfoList.push([
            this.createResultSymbolInfo("multiplier", 300),
            this.createResultSymbolInfo("multiplier", 300),
            this.createResultSymbolInfo("multiplier", 300)
        ]);

        // 滚轮1：Multiplier + Mega Jackpot + Multiplier
        symbolInfoList.push([
            this.createResultSymbolInfo("multiplier", 300),
            this.createResultSymbolInfo("jackpot", 300, "mega"),
            this.createResultSymbolInfo("multiplier", 300)
        ]);

        // 滚轮2：Multiplier + Grand Jackpot + Multiplier
        symbolInfoList.push([
            this.createResultSymbolInfo("multiplier", 300),
            this.createResultSymbolInfo("jackpot", 300, "grand"),
            this.createResultSymbolInfo("multiplier", 300)
        ]);

        // 滚轮3：Multiplier + Major Jackpot + Multiplier
        symbolInfoList.push([
            this.createResultSymbolInfo("multiplier", 300),
            this.createResultSymbolInfo("jackpot", 300, "major"),
            this.createResultSymbolInfo("multiplier", 300)
        ]);

        // 滚轮4：全Multiplier
        symbolInfoList.push([
            this.createResultSymbolInfo("multiplier", 300),
            this.createResultSymbolInfo("multiplier", 300),
            this.createResultSymbolInfo("multiplier", 300)
        ]);

        return symbolInfoList;
    }

    /**
     * 创建结果符号信息对象（辅助方法）
     * @param type 符号类型（jackpot/multiplier）
     * @param prize 奖金
     * @param key Jackpot类型（mini/minor/major/mega/grand）
     * @returns 符号信息对象
     */
    private createResultSymbolInfo(type: "jackpot" | "multiplier", prize: number, key?: string): any {
        const symbolInfo = new ResultSymbolInfo();
        symbolInfo.type = type;
        symbolInfo.prize = prize;
        if (key) symbolInfo.key = key;
        return symbolInfo;
    }

    /**
     * 处理分享信息配置（不同中奖等级的图片名）
     */
    public processChangeShareInfo(): void {
        this.bannerImgNameMinorWin = "slot-luckybunnydrop-win-super-20230214.jpg";
        this.bannerImgNameBigwin = "slot-luckybunnydrop-win-big-20230214.jpg";
        this.bannerImgNameMegawin = "slot-luckybunnydrop-win-mega-20230214.jpg";
        this.bannerImgNameSuperwin = "slot-luckybunnydrop-win-huge-20230214.jpg";
        this.freespinShareImgName = "slot-luckybunnydrop-free-spins-20230214.jpg";
        this.lockandrollShareImgName = "slot-luckybunnydrop-Locknroll-20230317.jpg";
    }

    /**
     * 相机向上滚动回调（设置顶部UI为闲置状态）
     */
    public callbackOnScrollUp(): void {
        const topUIComp = SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop)!.topUI.getComponent(TopUIComponent_LuckyBunnyDrop);
        topUIComp.setIdle();
    }

    /**
     * 相机向下滚动回调（停止顶部UI动画）
     */
    public callbackOnScrollDown(): void {
        const topUIComp = SlotManager.Instance.getComponent(GameComponent_LuckyBunnyDrop)!.topUI.getComponent(TopUIComponent_LuckyBunnyDrop);
        topUIComp.stopTopUI();
    }

    /**
     * 发送锁定滚动自旋请求（处理结果、更新状态、执行回调）
     * @param callback 请求成功后的回调
     * @returns Promise<void>
     */
    public async sendLockAndRollRequest(callback: () => void): Promise<void> {
        // 发送自旋请求
        const spinResult = await this.sendSpinRequest(null,null);

        // 实例无效/自旋错误 → 直接返回
        if (!TSUtility.isValid(this) || !this.checkSpinErrorState(spinResult)) {
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
        SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_SKIPABLE);

        // 执行回调
        callback();
    }

    /**
     * 设置滚轮预期特效显示状态（Scatter符号）
     * @param reelIndex 滚轮索引
     */
    public setPlayReelExpectEffectState(reelIndex: number): void {
        // 调试断点（原JS保留）
        if (reelIndex === 4) cc.log("break point");

        // 隐藏所有预期特效
        this.reelMachine.hideAllExpectEffects();

        // 滚轮索引有效且满足预期特效条件
        if (this.reelMachine.reels.length > reelIndex && this.getExpectEffectFlag(reelIndex, SlotGameResultManager.Instance.getVisibleSlotWindows())) {
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
                this.reelMachine.reels[reelIndex].getComponent(Reel)!.setShaderValue("blurOffset", 0.03);
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
     * 设置滚轮Jackpot预期特效显示状态
     * @param reelIndex 滚轮索引
     */
    public setPlayReelExpectJackpotEffectState(reelIndex: number): void {
        // 调试断点（原JS保留）
        if (reelIndex === 4) cc.log("break point");

        // 隐藏所有Jackpot预期特效
        this.reelMachine.getComponent(ReelMachine_LuckyBunnyDrop)!.hideAllJackpotExpectEffects();

        // 滚轮索引有效且满足Jackpot预期特效条件
        if (this.reelMachine.reels.length > reelIndex && this.getExpectJackpotEffectFlag(reelIndex, this.getReelStopWindow())) {
            if (!this._scatterReelExpect && this.reelMachine.getComponent(ReelMachine_LuckyBunnyDrop)!.showJackpotExpectEffect(reelIndex)) {
                // 停止已有预期音效并播放新音效
                const audioClip = SlotSoundController.Instance().getAudioClip("ReelExpect");
                if (SoundManager.Instance().isPlayingFxOnce(audioClip)) {
                    SoundManager.Instance().stopFxOnce(audioClip);
                }
                SlotSoundController.Instance().playAudio("ReelExpect", "FX");
                
                // 临时降低主音量、停止自旋音效、设置滚轮模糊偏移
                SoundManager.Instance().setMainVolumeTemporarily(0.1);
                SlotManager.Instance.stopReelSpinSound();
                this.reelMachine.reels[reelIndex].getComponent(Reel)!.setShaderValue("blurOffset", 0.03);
            }
        } else if (!this._scatterReelExpect) {
            // 重置音效和音量
            const audioClip = SlotSoundController.Instance().getAudioClip("ReelExpect");
            if (SoundManager.Instance().isPlayingFxOnce(audioClip)) {
                SoundManager.Instance().stopFxOnce(audioClip);
            }
            SoundManager.Instance().resetTemporarilyMainVolume();
        }
    }

    /**
     * 判断Scatter预期特效显示条件
     * @param reelIndex 滚轮索引
     * @param windows 可见窗口信息
     * @returns 是否显示预期特效
     */
    public getExpectEffectFlag(reelIndex: number, windows: any): boolean {
        let scatterCount = 0;
        const isFreeSpinMode = SlotReelSpinStateManager.Instance.getFreespinMode();

        // 普通模式：统计Scatter符号（51）数量
        if (!isFreeSpinMode) {
            for (let o = 0; o < reelIndex; o++) {
                const window = windows.GetWindow(o);
                for (let i = 0; i < window.size; i++) {
                    if (window.getSymbol(i) === 51) scatterCount++;
                }
            }
        } 
        // 免费旋转模式：带Gauge数据的Scatter统计
        else {
            const exData = SlotGameResultManager.Instance.getSubGameState("freeSpin").exDataWithBetPerLine;
            const currentBetPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();

            for (let o = 0; o < reelIndex; o++) {
                const window = windows.GetWindow(o);
                for (let i = 0; i < window.size; i++) {
                    if (window.getSymbol(i) === 51) {
                        const cellIndex = 3 * o + i;
                        const selectedCell = exData[currentBetPerLine]?.exDatas.selectedCell;
                        
                        if (!TSUtility.isValid(selectedCell) || !TSUtility.isValid(selectedCell.datas) || !TSUtility.isValid(selectedCell.datas[cellIndex])) {
                            scatterCount++;
                        }
                    }
                }
            }
        }

        // Wild符号填充数>2 → 不显示预期特效
        const filledWildCount = this.getComponent(GameComponent_LuckyBunnyDrop)!.lockWild.getFilledWildCount(reelIndex);
        return filledWildCount <= 2 && scatterCount >= 2;
    }

    /**
     * 判断Jackpot预期特效显示条件
     * @param reelIndex 滚轮索引
     * @param windows 停止窗口信息
     * @returns 是否显示预期特效
     */
    public getExpectJackpotEffectFlag(reelIndex: number, windows: any): boolean {
        let jackpotCount = 0;
        const isFreeSpinMode = SlotReelSpinStateManager.Instance.getFreespinMode();

        // 普通模式：统计Jackpot符号（≥90）数量
        if (!isFreeSpinMode) {
            for (let o = 0; o < reelIndex; o++) {
                const window = windows.GetWindow(o);
                for (let i = 0; i < window.size; i++) {
                    if (window.getSymbol(i) >= 90) jackpotCount++;
                }
            }
        }
        // 免费旋转模式：带Gauge数据的Jackpot统计
        else {
            const exData = SlotGameResultManager.Instance.getSubGameState("freeSpin").exDataWithBetPerLine;
            const currentBetPerLine = SlotGameRuleManager.Instance.getCurrentBetPerLine();

            for (let o = 0; o < reelIndex; o++) {
                const window = windows.GetWindow(o);
                for (let i = 0; i < window.size; i++) {
                    if (window.getSymbol(i) >= 90) {
                        const cellIndex = 3 * o + i;
                        const selectedCell = exData[currentBetPerLine]?.exDatas.selectedCell;
                        
                        if (!TSUtility.isValid(selectedCell) || !TSUtility.isValid(selectedCell.datas) || !TSUtility.isValid(selectedCell.datas[cellIndex])) {
                            jackpotCount++;
                        }
                    }
                }
            }
        }

        // Wild符号填充数判断
        const filledWildCount = this.getComponent(GameComponent_LuckyBunnyDrop)!.lockWild.getFilledWildCount(reelIndex);
        if (filledWildCount > 2) return false;

        // 不同滚轮索引的判断条件
        if (reelIndex === 4) {
            return jackpotCount === 4 ? filledWildCount < 2 : (jackpotCount > 4 && filledWildCount < 3);
        } else {
            return jackpotCount >= 4;
        }
    }

}