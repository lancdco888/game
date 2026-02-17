// 游戏专属模块
import GameComponents_RainbowPearl from './GameComponents_RainbowPearl';
import SubGameStateManager_RainbowPearl from './SubGameStateManager_RainbowPearl';
import ReelMachine_RainbowPearl from './ReelMachine_RainbowPearl';
import Reel_RainbowPearl from './Reel_RainbowPearl';
import SlotManager from '../../manager/SlotManager';
import SlotGameResultManager, { ResultSymbolInfo } from '../../manager/SlotGameResultManager';
import SlotSoundController from '../../Slot/SlotSoundController';
import CameraControl from '../../Slot/CameraControl';
import SlotGameRuleManager, { SlotWindows } from '../../manager/SlotGameRuleManager';
import TSUtility from '../../global_utility/TSUtility';
import AsyncHelper from '../../global_utility/AsyncHelper';
import Reel from '../../Slot/Reel';

const { ccclass } = cc._decorator;

/**
 * RainbowPearl老虎机游戏管理器
 * 继承自通用SlotManager，扩展该游戏专属逻辑
 */
@ccclass('RainbowPearlManager')
export default class RainbowPearlManager extends SlotManager {
    /**
     * 获取单例实例（复用父类SlotManager的Instance）
     */
    public static getInstance(): RainbowPearlManager {
        return SlotManager.Instance as RainbowPearlManager;
    }

    /**
     * 播放主背景音乐（根据子游戏状态切换BGM）
     */
    public playMainBgm(): void {
        super.playMainBgm();
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        if (nextSubGameKey === 'lockNRoll') {
            SlotSoundController.Instance().playAudio('LockAndRollBGM', 'BGM');
        } else {
            SlotSoundController.Instance().playAudio('MainBGM', 'BGM');
        }
    }

    /**
     * 场景加载准备（异步）
     */
    public async asyncSceneLoadPrepare(): Promise<void> {
        // 关闭键盘/鼠标拖拽事件
        this.setKeyboardEventFlag(false);
        this.setMouseDragEventFlag(false);
        
        // 初始化相机控制参数
        const cameraPos = new cc.Vec2(35, 0);
        const cameraRange = new cc.Vec2(704, 600);
        CameraControl.Instance.initCameraControl(cameraPos, cameraRange);
        CameraControl.Instance.scrollUpScreen(0);
    }

    /**
     * 场景加载特效（异步）
     */
    public async asyncSceneLoadEffect(): Promise<void> {
        await this.asyncPlaySceneLoadEffect();
        await this.asyncSetSlotGameStateAfterSceneLoadEffect();
    }

    /**
     * 播放场景加载特效（异步）
     */
    public async asyncPlaySceneLoadEffect(): Promise<void> {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        // 根据子游戏状态切换滚轮显示和UI
        if (nextSubGameKey === 'lockNRoll') {
            this.setShowingReelState('jackpot', true);
            SubGameStateManager_RainbowPearl.Instance().changeUIToLockAndRoll();
        } else {
            this.setShowingReelState('base');
            SubGameStateManager_RainbowPearl.Instance().changeUIToNormal();
        }

        // 播放顶部UI入场动画
        this.getComponent(GameComponents_RainbowPearl).topUI.playEntranceAni();

        // 动态老虎机延迟播放Intro音效
        const slotID = SlotGameRuleManager.Instance.slotID;
        if (TSUtility.isDynamicSlot(slotID)) {
            this.scheduleOnce(() => {
                SlotSoundController.Instance().playAudio('IntroAdded_DY', 'FX');
            }, 1.5);
        }

        // 播放入场音效+延迟播放BGM
        const playEntranceAudio = () => {
            SlotSoundController.Instance().playAudio('Entrance', 'FX');
        };
        const entranceSeq = cc.sequence(
            cc.callFunc(playEntranceAudio),
            cc.delayTime(3),
            cc.callFunc(this.playMainBgm.bind(this))
        );
        this.node.runAction(entranceSeq);

        // 延迟2秒后调整相机
        await AsyncHelper.delay(2);
        CameraControl.Instance.resetZoomRelative(0.8, false);
        CameraControl.Instance.scrollDownScreen(0.8, cc.easeOut(2));
        // 绑定相机滚动回调
        CameraControl.Instance.callbackScrollUp = this.callbackOnScrollUp.bind(this);
        CameraControl.Instance.callbackScrollDown = this.callbackOnScrollDown.bind(this);

        await AsyncHelper.delay(0.8);
    }

    /**
     * 场景加载特效后设置游戏状态（异步）
     */
    public async asyncSetSlotGameStateAfterSceneLoadEffect(): Promise<void> {
        const subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        // 开启输入事件
        this.setKeyboardEventFlag(true);
        this.setMouseDragEventFlag(true);
        // 免费旋转子游戏自动触发spin
        if (subGameKey === 'freeSpin') {
            this.spinAfterCloseAllPopup();
        }
    }

    /**
     * 获取子游戏状态
     */
    public getSubGameState(): any { // 建议根据实际类型定义接口，此处先用any
        let subGameState = null;
        const subGameKey = this.getSubGameKeyAtStartSpin();
        
        if (subGameKey === 'base') {
            subGameState = SubGameStateManager_RainbowPearl.Instance().getBaseGameState();
        } else if (subGameKey === 'lockNRoll') {
            subGameState = SubGameStateManager_RainbowPearl.Instance().getLockAndRollGameState();
        }
        
        return subGameState;
    }

    /**
     * 处理分享信息配置
     */
    public processChangeShareInfo(): void {
        this.jackpotCommonShareImgName = 'slot-rainbowpearl-jackpot-200227.jpg';
        this.lockandrollShareImgName = 'slot-rainbowpearl-lock-and-roll-200227.jpg';
        this.bannerImgNameMinorWin = 'slot-rainbowpearl-win-super-200227.jpg';
        this.bannerImgNameBigwin = 'slot-rainbowpearl-win-big-200227.jpg';
        this.bannerImgNameSuperwin = 'slot-rainbowpearl-win-huge-200227.jpg';
        this.bannerImgNameMegawin = 'slot-rainbowpearl-win-mega-200227.jpg';
    }

    /**
     * 相机上滚回调
     */
    public callbackOnScrollUp(): void {
        this.getComponent(GameComponents_RainbowPearl).topUI.playTopAni();
    }

    /**
     * 相机下滚回调
     */
    public callbackOnScrollDown(): void {
        this.getComponent(GameComponents_RainbowPearl).topUI.stopTopAni();
    }

    /**
     * 设置滚轮显示状态
     * @param state 状态类型：base | jackpot
     * @param isTrigger 触发标记（默认false）
     */
    public setShowingReelState(state: 'base' | 'jackpot', isTrigger: boolean = false): void {
        const gameComponents = this.getComponent(GameComponents_RainbowPearl);
        const reelMachine = this.reelMachine.getComponent(ReelMachine_RainbowPearl);
        
        // 隐藏所有滚轮
        this.hideAllReel();
        
        // 重置Jackpot符号固定组件
        if (gameComponents.jackpotSymbolFixComponent) {
            gameComponents.jackpotSymbolFixComponent.resetLayer();
        }

        const reelLineBaseMode = gameComponents.reelLineBaseMode;
        const reelLineLockNRollMode = gameComponents.reelLineLockNRollMode;

        // 基础游戏状态
        if (state === 'base') {
            const reels = reelMachine.reels;
            reelLineBaseMode.active = true;
            reelLineLockNRollMode.active = false;
            
            // 隐藏Jackpot滚轮框
            if (gameComponents.reelFrameLinkedJackpot) {
                gameComponents.reelFrameLinkedJackpot.active = false;
            }

            // 显示基础滚轮
            reels.forEach(reel => {
                reel.node.active = true;
            });
        } 
        // Jackpot游戏状态（Lock&Roll）
        else if (state === 'jackpot') {
            const lockNRollState = SlotGameResultManager.Instance.getSubGameState('lockNRoll');
            reelLineBaseMode.active = false;
            reelLineLockNRollMode.active = true;
            
            // 播放Lock&Roll音效
            SlotSoundController.Instance().playAudio('LockAndRollLineAction', 'FX');

            // 符号ID列表
            const symbolIds = [21, 22, 23, 11, 12, 13, 14, 15];
            let randomSymbolId: number;

            // 禁用下注按钮
            SlotManager.Instance._bottomUI.setInteractableFlagForBetPerLineBtns(false);
            SlotManager.Instance._bottomUI.setInteractableFlagForMaxbetBtn(false);

            const jackpotReels = reelMachine.jackpotReels;
            SubGameStateManager_RainbowPearl.Instance().changeUIToLockAndRoll();

            // 处理剩余旋转次数
            const totalCnt = lockNRollState.totalCnt;
            const spinCnt = lockNRollState.spinCnt;
            let gameState: any;

            if (totalCnt === 0 && spinCnt === 0) {
                // 初始状态：剩余3次旋转
                if (isTrigger) {
                    gameComponents.linkedJackpotUI.showRemainSpins(3);
                }
                SubGameStateManager_RainbowPearl.Instance().remainLinkedJackpotSpins = 3;
                gameState = SlotGameResultManager.Instance.getSubGameState('base');
            } else {
                // 非初始状态：显示剩余次数
                gameComponents.linkedJackpotUI.showRemainSpins(totalCnt - spinCnt);
                SubGameStateManager_RainbowPearl.Instance().remainLinkedJackpotSpins = totalCnt - spinCnt;
                gameState = SlotGameResultManager.Instance.getSubGameState('lockNRoll');
            }

            // 初始化滚轮窗口
            const slotWindows = new SlotWindows([3, 3, 3, 3, 3]);
            const lastWindows = gameState.lastWindows;
            const lastSymbolInfoWindow = gameState.lastSymbolInfoWindow;

            // 填充窗口符号
            for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
                for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
                    slotWindows.GetWindow(reelIdx).setSymbol(rowIdx, lastWindows[reelIdx][rowIdx]);
                }
            }

            // 无特效固定Jackpot窗口
            if (isTrigger) {
                this.fixJackpotWindowNoneEffect(slotWindows, lastSymbolInfoWindow);
            }

            // 随机设置Jackpot滚轮符号
            for (let idx = 0; idx < jackpotReels.length; idx++) {
                const reelCol = Math.floor(idx / 3);
                const reelRow = Math.floor(idx % 3);
                
                // 符号ID小于90时随机替换
                if (lastWindows[reelCol][reelRow] < 90) {
                    randomSymbolId = symbolIds[Math.floor(Math.random() * symbolIds.length)];
                    const reelComp = jackpotReels[idx].node.getComponent(Reel);
                    reelComp.changeSymbol(0, randomSymbolId);
                    
                    const rainbowReelComp = jackpotReels[idx].node.getComponent(Reel_RainbowPearl);
                    rainbowReelComp.setSymbolsDimmActiveJackpot();
                    
                    jackpotReels[idx].node.active = true;
                }
            }
        }
    }

    /**
     * 隐藏所有滚轮
     */
    public hideAllReel(): void {
        const reelMachine = this.reelMachine.getComponent(ReelMachine_RainbowPearl);
        // 隐藏基础滚轮
        reelMachine.reels.forEach(reel => {
            reel.node.active = false;
        });
        // 隐藏Jackpot滚轮
        reelMachine.jackpotReels.forEach(reel => {
            reel.node.active = false;
        });
    }

    /**
     * 固定Jackpot窗口（带特效）
     * @param window 滚轮窗口
     * @param symbolInfo 符号信息
     * @param callback 回调函数
     */
    public fixJackpotWindow(window: any, symbolInfo: any, callback?: () => void): void {
        if (window && symbolInfo) {
            const reelMachine = SlotManager.Instance.reelMachine.getComponent(ReelMachine_RainbowPearl);
            reelMachine.processFixJackpotSymbol(symbolInfo);
            
            const gameComponents = this.getComponent(GameComponents_RainbowPearl);
            if (gameComponents.jackpotSymbolFixComponent) {
                gameComponents.jackpotSymbolFixComponent.fixJackpotWindow(window, symbolInfo, callback);
            }
        } else if (callback) {
            callback();
        }
    }

    /**
     * 固定Jackpot窗口（无特效）
     * @param window 滚轮窗口
     * @param symbolInfo 符号信息
     */
    public fixJackpotWindowNoneEffect(window: any, symbolInfo: any): void {
        if (window && symbolInfo) {
            const reelMachine = SlotManager.Instance.reelMachine.getComponent(ReelMachine_RainbowPearl);
            reelMachine.processFixJackpotSymbol(symbolInfo);
            
            const gameComponents = this.getComponent(GameComponents_RainbowPearl);
            if (gameComponents.jackpotSymbolFixComponent) {
                gameComponents.jackpotSymbolFixComponent.fixJackpotWindowNoneEffect(window, symbolInfo);
            }
        }
    }

    /**
     * 设置入场滚轮窗口
     */
    public setEntranceWindow(): void {
        let subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        if (!subGameKey) {
            subGameKey = 'base';
        }

        // 获取入场窗口和滚轮条配置
        SlotGameRuleManager.Instance.getEntranceWindow(subGameKey);
        let reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        if (!reelStrip) {
            reelStrip = SlotGameRuleManager.Instance.getReelStrip('base');
        }

        // 初始化5列3行的滚轮窗口（默认填充90）
        const slotWindows = new SlotWindows([3, 3, 3, 3, 3]);
        for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
            for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
                slotWindows.GetWindow(reelIdx).setSymbol(rowIdx, 90);
            }
        }

        // 获取入场符号信息
        const entranceSymbolInfo = this.getEntranceSymbolInfo();
        
        // 初始化基础滚轮
        this.reelMachine.reels.forEach((reelNode, idx) => {
            const reelComp = reelNode.getComponent(Reel);
            const reelConfig = reelStrip.getReel(idx);
            const randomPos = Math.floor(Math.random() * reelConfig.defaultBand.length);
            
            reelComp.invalidate(
                reelConfig.defaultBand,
                randomPos,
                idx,
                slotWindows.GetWindow(idx),
                entranceSymbolInfo[idx]
            );
        });

        // 初始化Jackpot滚轮
        const reelMachine = this.reelMachine.getComponent(ReelMachine_RainbowPearl);
        let lockNRollReelStrip = SlotGameRuleManager.Instance.getReelStrip('lockNRoll');
        if (!lockNRollReelStrip) {
            lockNRollReelStrip = SlotGameRuleManager.Instance.getReelStrip('base');
        }

        reelMachine.jackpotReels.forEach((reelNode, idx) => {
            const reelComp = reelNode.getComponent(Reel);
            const reelConfig = lockNRollReelStrip.getReel(idx);
            const randomPos = Math.floor(Math.random() * reelConfig.defaultBand.length);
            
            reelComp.invalidate(reelConfig.defaultBand, randomPos, idx);
        });
    }

    /**
     * 获取入场符号信息（全为300倍乘数符号）
     */
    public getEntranceSymbolInfo(): any[] {
        const createMultiplierSymbol = (prize: number) => {
            const symbolInfo = new ResultSymbolInfo();
            symbolInfo.type = 'multiplier';
            symbolInfo.prize = prize;
            return symbolInfo;
        };

        // 生成5列，每列3个300倍乘数符号
        const symbolInfoList: any[] = [];
        for (let col = 0; col < 5; col++) {
            const colSymbols = [
                createMultiplierSymbol(300),
                createMultiplierSymbol(300),
                createMultiplierSymbol(300)
            ];
            symbolInfoList.push(colSymbols);
        }

        return symbolInfoList;
    }

    /**
     * 获取滚轮窗口范围
     */
    public getWindowRange(): number[][] {
        const windowRange: number[][] = [];
        this.reelMachine.reels.forEach(reelNode => {
            const reelComp = reelNode.getComponent(Reel);
            windowRange.push([1, reelComp.visibleRow + 1]);
        });
        return windowRange;
    }
}