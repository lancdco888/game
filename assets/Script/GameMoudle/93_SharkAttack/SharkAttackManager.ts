import CameraControl, { CameraPositionState } from '../../Slot/CameraControl';
import Reel from '../../Slot/Reel';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import SlotSoundController from '../../Slot/SlotSoundController';
import SlotUIRuleManager from '../../Slot/rule/SlotUIRuleManager';
import AsyncHelper from '../../global_utility/AsyncHelper';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import SlotManager, { SlotGameState } from '../../manager/SlotManager';
import SoundManager from '../../manager/SoundManager';
import GameComponents_SharkAttack from './GameComponents_SharkAttack';
import ReelController_SharkAttack from './ReelController_SharkAttack';
import Reel_SharkAttack from './Reel_SharkAttack';
import SubGameStateManager_SharkAttack from './SubGameStateManager_SharkAttack';

const { ccclass } = cc._decorator;

/**
 * 鲨鱼攻击游戏管理器
 * 继承自基础SlotManager，处理该子游戏的相机、音效、滚轮、状态管理等逻辑
 */
@ccclass('SharkAttackManager')
export default class SharkAttackManager extends SlotManager {
    // 游戏状态（替代原JS的松散变量）
    slot_state: SlotGameState = SlotGameState.IntroState;
    // 跳过当前旋转标记
    isSkipCurrentSpin: boolean = false;
    // 当前游戏状态实例（建议根据实际业务替换为具体类型）
    curState: any = null;
    // 分享图片相关命名
    freespinShareImgName: string = '';
    bannerImgNameMinorWin: string = '';
    bannerImgNameBigwin: string = '';
    bannerImgNameSuperwin: string = '';
    bannerImgNameMegawin: string = '';

    /**
     * 获取单例实例（复用父类SlotManager的Instance）
     */
    static getInstance() {
        return SlotManager.Instance;
    }

    /**
     * 播放主背景音乐（区分免费旋转和普通模式）
     */
    playMainBgm(): void {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        nextSubGameKey === 'freeSpin' 
            ? SlotSoundController.Instance().playAudio('FreeSpinBGM', 'BGM')
            : SlotSoundController.Instance().playAudio('MainBGM', 'BGM');
    }

    /**
     * 初始化相机位置和尺寸设置
     */
    initCameraSetting(): void {
        const cameraPos = new cc.Vec2(40, 0);
        const cameraSize = new cc.Vec2(707, 720);
        CameraControl.Instance.initCameraControl(cameraPos, cameraSize);
        
        // 根据横竖屏调整相机初始位置
        !this.isSlotOrientationPortrait()
            ? CameraControl.Instance.scrollUpScreen(0)
            : CameraControl.Instance.scrollDownScreen(0);
    }

    /**
     * 异步准备场景加载（关闭输入事件）
     */
    async asyncSceneLoadPrepare(): Promise<void> {
        this.setKeyboardEventFlag(false);
        this.setMouseDragEventFlag(false);
    }

    /**
     * 异步执行场景加载后的特效和初始化逻辑
     */
    async asyncSceneLoadEffect(): Promise<void> {
        const freeSpinState = SlotGameResultManager.Instance.getSubGameState('freeSpin');
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        SlotGameResultManager.Instance.getSubGameState('base'); // 保留原逻辑的无赋值调用

        // 免费旋转模式初始化
        if (nextSubGameKey === 'freeSpin') {
            SlotManager.Instance._freespinTotalCount = freeSpinState.totalCnt;
            SlotManager.Instance._freespinPastCount = freeSpinState.spinCnt;
            SlotManager.Instance._freespinMultiplier = freeSpinState.spinMultiplier;
            SubGameStateManager_SharkAttack.Instance().changeUIToFreespin();
        }

        // 入场动画和音效执行函数
        const playEntranceAni = () => {
            this.getComponent(GameComponents_SharkAttack).topUI.playEntranceAni();
            SlotSoundController.Instance().playAudio('Intro', 'FX');
        };

        // 执行序列动作：入场动画 → 延迟3秒 → 播放BGM
        const entranceAction = cc.sequence(
            cc.callFunc(playEntranceAni),
            cc.delayTime(3),
            cc.callFunc(this.playMainBgm.bind(this))
        );
        this.node.runAction(entranceAction);

        // 添加游戏规则观察者
        SlotGameRuleManager.Instance.addObserver(this.node);
        await AsyncHelper.delay(3);

        // 竖屏模式下播放顶部UI动画
        if (SlotManager.Instance.isSlotOrientationPortrait()) {
            this.getComponent(GameComponents_SharkAttack).topUI.playAnimation();
        }

        // 绑定相机滚动回调，调整相机缩放和位置
        CameraControl.Instance.callbackScrollUp = this.callbackOnScrollUp.bind(this);
        CameraControl.Instance.callbackScrollDown = this.callbackOnScrollDown.bind(this);
        CameraControl.Instance.resetZoomRelative(0.8, false);
        CameraControl.Instance.scrollDownScreen(0.8, cc.easeOut(2));
        
        await AsyncHelper.delay(0.8);

        // 恢复游戏状态和输入事件
        this.slot_state = SlotGameState.NormalState;
        this.setKeyboardEventFlag(true);
        this.setMouseDragEventFlag(true);

        // 免费旋转模式下自动触发旋转
        if (nextSubGameKey === 'freeSpin') {
            this.spinAfterCloseAllPopup();
        }
    }

    /**
     * 获取当前子游戏状态（基础/免费旋转）
     */
    getSubGameState(): any {
        return this.getSubGameKeyAtStartSpin() === 'base'
            ? SubGameStateManager_SharkAttack.Instance().getBaseGameState()
            : SubGameStateManager_SharkAttack.Instance().getFreeSpinGameState();
    }

    /**
     * 相机上滑回调：播放顶部UI动画
     */
    callbackOnScrollUp(): void {
        if (this.slot_state !== SlotGameState.IntroState) {
            this.getComponent(GameComponents_SharkAttack).topUI.playAnimation();
        }
    }

    /**
     * 相机下滑回调：停止顶部UI动画（仅横屏）
     */
    callbackOnScrollDown(): void {
        if (this.slot_state !== SlotGameState.IntroState && SlotManager.Instance.isSlotOrientationPortrait() === 0) {
            this.getComponent(GameComponents_SharkAttack).topUI.stopAnimation();
        }
    }

    /**
     * 切换到竖屏模式回调
     */
    onChangePortraitMode(): void {
        if (this.slot_state !== SlotGameState.IntroState && CameraControl.Instance.eStateOfCameraPosition === CameraPositionState.Down) {
            this.getComponent(GameComponents_SharkAttack).topUI.playAnimation();
        }
    }

    /**
     * 切换到横屏模式回调
     */
    onChangeLandscapeMode(): void {
        if (this.slot_state !== SlotGameState.IntroState && CameraControl.Instance.eStateOfCameraPosition === CameraPositionState.Down) {
            this.getComponent(GameComponents_SharkAttack).topUI.stopAnimation();
        }
    }

    /**
     * 初始化分享图片命名
     */
    processChangeShareInfo(): void {
        this.freespinShareImgName = 'slot-sharkattack-free-spins-210521.jpg';
        this.bannerImgNameMinorWin = 'slot-sharkattack-win-super-210521.jpg';
        this.bannerImgNameBigwin = 'slot-sharkattack-win-big-210521.jpg';
        this.bannerImgNameSuperwin = 'slot-sharkattack-win-huge-210521.jpg';
        this.bannerImgNameMegawin = 'slot-sharkattack-win-mega-210521.jpg';
    }

    /**
     * 设置滚轮预期特效状态
     * @param index 滚轮索引
     */
    setPlayReelExpectEffectState(index: number): void {
        if (index === 4) cc.log('break point'); // 保留原调试断点

        this.reelMachine.hideAllExpectEffects();

        // 显示预期特效并处理音效/音量
        if (this.reelMachine.reels.length > index && SlotUIRuleManager.Instance.getExpectEffectFlag(index, SlotGameResultManager.Instance.getLastHistoryWindows())) {
            if (this.reelMachine.shoeExpectEffect(index)) {
                const reelExpectClip = SlotSoundController.Instance().getAudioClip('ReelExpect');
                if (SoundManager.Instance().isPlayingFxOnce(reelExpectClip)) {
                    SoundManager.Instance().stopFxOnce(reelExpectClip);
                }
                SlotSoundController.Instance().playAudio('ReelExpect', 'FX');
                SoundManager.Instance().setMainVolumeTemporarily(0.1);
                SlotManager.Instance.stopReelSpinSound();
                this.reelMachine.reels[index].getComponent(Reel).setShaderValue('blurOffset', 0.03);
            }
        } else {
            // 关闭预期特效并恢复音量
            const reelExpectClip = SlotSoundController.Instance().getAudioClip('ReelExpect');
            if (SoundManager.Instance().isPlayingFxOnce(reelExpectClip)) {
                SoundManager.Instance().stopFxOnce(reelExpectClip);
            }
            SoundManager.Instance().resetTemporarilyMainVolume();
        }
    }

    /**
     * 更改滚轮预期特效
     * @param index 滚轮索引
     * @param effectType 特效类型
     */
    changeReelExpectEffect(index: number, effectType: any): void {
        if (index === 4) cc.log('breat point'); // 保留原笔误，避免逻辑变更

        this.reelMachine.hideAllExpectEffects();
        if (this.reelMachine.reels.length > index && SlotUIRuleManager.Instance.getExpectEffectFlag(index, SlotGameResultManager.Instance.getLastHistoryWindows())) {
            var reel = this.reelMachine.reels[index] as ReelController_SharkAttack;
            reel.changeExpectEffect(effectType);
        }
    }

    /**
     * 跳过滚轮旋转
     */
    skipReelSpin(): void {
        const reelSpinState = SlotReelSpinStateManager.Instance.getCurrentState();
        const expandEffectState = this.getComponent(GameComponents_SharkAttack).reelExpandComponent.isShowigExpandReelEffect();
        
        if (reelSpinState === SlotReelSpinStateManager.STATE_SPINNING_SKIPABLE && !expandEffectState && this.curState !== null) {
            this.isSkipCurrentSpin = true;
            this.curState.setSkipFlagDuringPlay(true);
            this.processSkipReel();
        }
    }

    /**
     * 恢复滚轮旋转
     */
    resumeReelSpin(): void {
        const reelSpinState = SlotReelSpinStateManager.Instance.getCurrentState();
        const expandEffectState = this.getComponent(GameComponents_SharkAttack).reelExpandComponent.isShowigExpandReelEffect();
        
        if (reelSpinState === SlotReelSpinStateManager.STATE_SPINNING_SKIPABLE && expandEffectState && this.curState !== null) {
            this.isSkipCurrentSpin = false;
            this.curState.setSkipFlagDuringPlay(false);
        }
    }

    /**
     * 设置入场时的滚轮窗口初始状态
     */
    setEntranceWindow(): void {
        let subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        if (subGameKey === '') subGameKey = 'base';

        const entranceWindow = SlotGameRuleManager.Instance.getEntranceWindow(subGameKey);
        let reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        if (reelStrip === null) reelStrip = SlotGameRuleManager.Instance.getReelStrip('base');

        const offsets: number[] = [];
        for (let a = 0; a < this.reelMachine.reels.length; ++a) {
            const reelIndex = a % 5;
            const defaultBand = reelStrip.getReel(reelIndex).defaultBand;
            const window = entranceWindow?.GetWindow(reelIndex) || null;

            let offset = 0;
            if (a < 5) {
                offset = Math.floor(Math.random() * defaultBand.length);
                offsets.push(offset);
            } else {
                offset = offsets[a % 5];
            }

            // 初始化滚轮显示内容
            const reelComp = this.reelMachine.reels[a].getComponent(Reel);
            window ? reelComp.invalidate(defaultBand, offset, reelIndex, window) : reelComp.invalidate(defaultBand, offset, reelIndex);
        }
    }
}