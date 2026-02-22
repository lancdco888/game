import GameComponents_HundredDollar from './GameComponents_HundredDollar';
import UserInfo from '../../User/UserInfo';
import PayCode from '../../Config/PayCode';
import CommonServer from '../../Network/CommonServer';
import { NewUserMissionPromotion, WelcomeBonusPromotion } from '../../User/UserPromotion';
import SlotManager from '../../manager/SlotManager';
import { SequencialState } from '../../Slot/State';
import SlotSoundController from '../../Slot/SlotSoundController';
import SlotGameResultManager from '../../manager/SlotGameResultManager';
import CameraControl from '../../Slot/CameraControl';
import TSUtility from '../../global_utility/TSUtility';
import SlotGameRuleManager from '../../manager/SlotGameRuleManager';
import AsyncHelper from '../../global_utility/AsyncHelper';
import ServerStorageManager, { StorageKeyType } from '../../manager/ServerStorageManager';
import SlotReelSpinStateManager from '../../Slot/SlotReelSpinStateManager';
import SubGameStateManager_HundredDollar from './SubGameStateManager_HundredDollar';

const { ccclass } = cc._decorator;

/**
 * 百元老虎机核心管理器
 * 负责统筹场景加载、奖励游戏请求、相机控制、音效播放、状态管理等核心逻辑
 */
@ccclass()
export default class HundredDollarManager extends SlotManager {
    /**
     * 获取单例实例（复用父类SlotManager的Instance）
     */
    static getInstance() {
        return SlotManager.Instance;
    }

    constructor(){
        super()
    }

    /**
     * 组件加载初始化
     */
    onLoad(): void {
        super.onLoad();
        // 初始化滚轮旋转提示文本
        this._reelSpinTexts = ["GOOD LUCK!", "PLAYING 1 LINE", "BET MULTIPLIER"];
    }

    /**
     * 播放主背景音乐
     */
    playMainBgm(): void {
        super.playMainBgm();
        SlotSoundController.Instance().playAudio("MainBGM", "BGM");
    }

    /**
     * 播放滚轮旋转音效（随机选择4种音效之一）
     */
    playReelSpinSound(): void {
        if (SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult() === "base") {
            const randomIdx = Math.floor(4 * Math.random());
            SlotSoundController.Instance().playAudio(`ReelSpin_${randomIdx.toString()}`, "FXLoop");
        }
    }

    /**
     * 场景加载准备（异步）
     */
    async asyncSceneLoadPrepare(): Promise<void> {
        // 禁用鼠标拖拽和键盘事件
        this.setMouseDragEventFlag(false);
        this.setKeyboardEventFlag(false);

        // 初始化相机控制参数
        const cameraPos = new cc.Vec2(35, 0);
        const cameraSize = new cc.Vec2(704, 720);
        CameraControl.Instance.initCameraControl(cameraPos, cameraSize);
        CameraControl.Instance.scrollUpScreen(0);

        // 停止所有滚轮动画，初始化顶部UI
        const gameComponents = this.getComponent(GameComponents_HundredDollar);
        if (gameComponents) {
            if (gameComponents.reelFrameAni) {
                gameComponents.reelFrameAni.stopAllAnimation();
            }
            if (gameComponents.topUI) {
                gameComponents.topUI.initControl();
            }
            if (gameComponents.bonusGameComponent) {
                gameComponents.bonusGameComponent.showDefaultAlert("WELCOME");
            }
        } else {
            cc.warn("HundredDollarManager: GameComponents_HundredDollar组件未挂载");
        }
    }

    /**
     * 场景加载特效（异步）
     */
    async asyncSceneLoadEffect(): Promise<void> {
        // 定义音效回调
        const playIntroBgm = cc.callFunc(() => {
            SlotSoundController.Instance().playAudio("IntroBGM", "FX");
        });
        const playMainBgm = cc.callFunc(() => {
            this.playMainBgm();
        });

        // 判断是否为奖励游戏
        if (SlotGameResultManager.Instance.getNextSubGameKey() !== "bonusGame") {
            // 非动态Slot处理
            if (!TSUtility.isDynamicSlot(SlotGameRuleManager.Instance.slotID)) {
                // 播放入场动画和音效
                this.node.runAction(cc.sequence(playIntroBgm, cc.delayTime(3), playMainBgm));
                const gameComponents = SlotManager.Instance.getComponent(GameComponents_HundredDollar);
                if (gameComponents?.topUI) {
                    gameComponents.topUI.playEnterAni();
                }
                await AsyncHelper.delay(2);
            }
        } else {
            // 奖励游戏直接播放主BGM
            this.playMainBgm();
        }

        // 初始化相机回调
        this.initCameraMoveCallback();

        // 处理非奖励游戏的相机动画
        if (SlotGameResultManager.Instance.getNextSubGameKey() !== "bonusGame") {
            // 重置相机缩放并向下滚动
            CameraControl.Instance.resetZoomRelative(0.8, false);
            CameraControl.Instance.scrollDownScreen(0.8, cc.easeOut(2));
            await AsyncHelper.delay(0.8);

            // 显示默认提示，检查新手福利状态
            const gameComponents = this.getComponent(GameComponents_HundredDollar);
            if (gameComponents?.bonusGameComponent) {
                gameComponents.bonusGameComponent.showDefaultAlert();
            }

            // 欢迎奖金检查
            const welcomeBonus = UserInfo.instance().getPromotionInfo(WelcomeBonusPromotion.PromotionKeyName);
            let isWelcomeBonusUnreceived = false;
            if (TSUtility.isValid(welcomeBonus)) {
                isWelcomeBonusUnreceived = TSUtility.isValid(welcomeBonus) && welcomeBonus.isReceived === 0;
            }

            // 新用户任务检查
            const newUserMission = UserInfo.instance().getPromotionInfo(NewUserMissionPromotion.PromotionKeyName);
            let isNewUserMissionTarget = false;
            if (TSUtility.isValid(newUserMission)) {
                isNewUserMissionTarget = newUserMission.isNewTarget;
            }

            // 启用输入事件（根据新手状态）
            const isNewTutorial = ServerStorageManager.getAsBoolean(StorageKeyType.NEW_IN_GAME_TUTORIAL);
            if ((!isWelcomeBonusUnreceived && isNewTutorial) || !isNewUserMissionTarget) {
                this.setMouseDragEventFlag(true);
                this.setKeyboardEventFlag(true);
            }
        } else {
            // 奖励游戏直接播放
            this.playBonusGame();
        }
    }

    /**
     * 播放场景加载特效（异步）
     */
    async asyncPlaySceneLoadEffect(): Promise<void> {
        // 定义音效回调
        const playIntroBgm = cc.callFunc(() => {
            SlotSoundController.Instance().playAudio("IntroBGM", "FX");
        });
        const playMainBgm = cc.callFunc(() => {
            this.playMainBgm();
        });

        // 判断是否为奖励游戏
        if (SlotGameResultManager.Instance.getNextSubGameKey() !== "bonusGame") {
            const slotId = SlotGameRuleManager.Instance.slotID;
            // 非动态Slot处理
            if (!TSUtility.isDynamicSlot(slotId)) {
                this.node.runAction(cc.sequence(playIntroBgm, cc.delayTime(3), playMainBgm));
                const gameComponents = SlotManager.Instance.getComponent(GameComponents_HundredDollar);
                if (gameComponents?.topUI) {
                    gameComponents.topUI.playEnterAni();
                }
                await AsyncHelper.delay(2);
            } else {
                this.playMainBgm();
            }
        } else {
            this.playMainBgm();
        }
    }

    /**
     * 场景加载特效后设置Slot游戏状态（异步）
     */
    async asyncSetSlotGameStateAfterSceneLoadEffect(): Promise<void> {
        // 初始化相机回调
        this.initCameraMoveCallback();

        // 判断是否为奖励游戏
        if (SlotGameResultManager.Instance.getNextSubGameKey() !== "bonusGame") {
            // 重置相机缩放并向下滚动
            CameraControl.Instance.resetZoomRelative(0.8, false);
            CameraControl.Instance.scrollDownScreen(0.8, cc.easeOut(2));
            await AsyncHelper.delay(0.8);

            // 显示默认提示，检查新手福利状态
            const gameComponents = this.getComponent(GameComponents_HundredDollar);
            if (gameComponents?.bonusGameComponent) {
                gameComponents.bonusGameComponent.showDefaultAlert();
            }

            // 欢迎奖金检查
            const welcomeBonus = UserInfo.instance().getPromotionInfo(WelcomeBonusPromotion.PromotionKeyName);
            let isWelcomeBonusUnreceived = false;
            if (TSUtility.isValid(welcomeBonus)) {
                isWelcomeBonusUnreceived = TSUtility.isValid(welcomeBonus) && welcomeBonus.isReceived === 0;
            }

            // 新用户任务检查
            const newUserMission = UserInfo.instance().getPromotionInfo(NewUserMissionPromotion.PromotionKeyName);
            let isNewUserMissionTarget = false;
            if (TSUtility.isValid(newUserMission)) {
                isNewUserMissionTarget = newUserMission.isNewTarget;
            }

            // 启用输入事件（根据新手状态）
            const isNewTutorial = ServerStorageManager.getAsBoolean(StorageKeyType.NEW_IN_GAME_TUTORIAL);
            if ((!isWelcomeBonusUnreceived && isNewTutorial) || !isNewUserMissionTarget) {
                this.setMouseDragEventFlag(true);
                this.setKeyboardEventFlag(true);
            }
        } else {
            // 奖励游戏直接播放
            this.playBonusGame();
        }
    }

    /**
     * 获取子游戏状态（基础游戏/奖励游戏）
     */
    getSubGameState(): any { // 需根据实际SubGameState类补充类型
        const subGameKey = this.getSubGameKeyAtStartSpin();
        let subGameState = null;

        if (subGameKey === "base") {
            subGameState = SubGameStateManager_HundredDollar.Instance().getBaseGameState();
        } else if (subGameKey === "bonusGame") {
            subGameState = SubGameStateManager_HundredDollar.Instance().getBonusGameState();
        }

        return subGameState;
    }

    /**
     * 处理分享信息变更
     */
    processChangeShareInfo(): void {
        this.bannerImgNameMinorWin = "slot-100xdollar-win-super-20190515.jpg";
        this.bannerImgNameBigwin = "slot-100xdollar-win-big-20190515.jpg";
        this.bannerImgNameSuperwin = "slot-100xdollar-win-huge-20190515.jpg";
        this.bannerImgNameMegawin = "slot-100xdollar-win-mega-20190515.jpg";
    }

    /**
     * 相机向上滚动回调
     */
    callbackOnScrollUp(): void {
        const gameComponents = SlotManager.Instance.getComponent(GameComponents_HundredDollar);
        if (gameComponents?.topUI) {
            gameComponents.topUI.playIdleAni();
        }
    }

    /**
     * 相机向下滚动回调
     */
    callbackOnScrollDown(): void {
        const gameComponents = SlotManager.Instance.getComponent(GameComponents_HundredDollar);
        if (gameComponents?.topUI) {
            gameComponents.topUI.stopAni();
        }
    }

    /**
     * 初始化相机移动回调
     */
    initCameraMoveCallback(): void {
        CameraControl.Instance.callbackScrollUp = this.callbackOnScrollUp.bind(this);
        CameraControl.Instance.callbackScrollDown = this.callbackOnScrollDown.bind(this);
    }

    /**
     * 清空相机移动回调
     */
    clearCameraMoveCallback(): void {
        CameraControl.Instance.callbackScrollUp = null;
        CameraControl.Instance.callbackScrollDown = null;
    }

    /**
     * 发送百元老虎机奖励游戏请求（异步）
     * @param params 请求参数
     * @param callback 请求完成后的回调
     */
    async sendBonusGameRequestHundredDollar(params: number[], callback: Function): Promise<void> {
        // 发送Spin请求
        const response = await this.sendSpinRequest(null, params);

        // 检查组件有效性和错误状态
        if (!TSUtility.isValid(this) || !this.isAvailable() || !this.checkSpinErrorState(response)) {
            return;
        }

        // 处理服务器响应错误
        if (CommonServer.isServerResponseError(response)) {
            if (!UserInfo.isAuthFail()) {
                this.showSpinErrorPopup(response);
            }
            SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_STOP);
            return;
        }

        // 处理正常响应
        SlotGameResultManager.Instance.resetGameResult();
        SlotGameResultManager.Instance.setGameResult(response);

        // 更新用户资产和等级
        const serverChangeResult = UserInfo.instance().getServerChangeResult(response);
        const betWithdraw = serverChangeResult.removeChangeCoinByPayCode(PayCode.SlotBetWithdraw);
        if (betWithdraw !== 0) {
            UserInfo.instance().addUserAssetMoney(betWithdraw);
            this._inGameUI.onSpinBetting(serverChangeResult);
        }

        const levelPoint = serverChangeResult.getTotalChangeLevelPoint();
        this._inGameUI.addLevelExp(levelPoint);

        // 处理Spin流程，更新状态
        this.onSpinProcess(response, serverChangeResult);
        this._spinChangeResult.addChangeResult(serverChangeResult);
        SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_SPINNING_SKIPABLE);

        // 执行回调
        if (callback) {
            callback();
        }
    }

    /**
     * 播放奖励游戏
     */
    playBonusGame(): void {
        // 创建顺序状态机
        const seqState = new SequencialState();
        seqState.insert(0, SubGameStateManager_HundredDollar.Instance().getBonusGameState());
        seqState.insert(1, this.getWaitUntilPopupClose());
        seqState.insert(2, this.getShowSpinEndPopup());

        // 设置当前状态并启动
        this.curState = seqState;
        if (this.curState) {
            this.curState.addOnEndCallback(this.checkEndSpin.bind(this));
            this.curState.onStart();
        }
    }

    /**
     * 检查Spin结束状态
     */
    checkEndSpin(): void {
        if (this.curState?.isDone()) {
            cc.log("spin end");
            this.curState = null;
            this.spinEndTime = new Date().getTime();

            // 设置滚轮停止状态
            SlotReelSpinStateManager.Instance.setCurrentState(SlotReelSpinStateManager.STATE_STOP);

            // 判断是否自动开始下一次Spin
            if (this.isNextSpinAutoStart() || SlotGameResultManager.Instance.getNextSubGameKey() === "bonusGame") {
                this.spinAll();
            }
        }
    }

    /**
     * 获取符号宽度（适配缩放）
     */
    getSymbolWidth(): number {
        return 0.85 * this._symbol_width;
    }

    /**
     * 获取符号高度（适配缩放）
     * @param baseHeight 基础高度
     */
    getSymbolHeight(baseHeight: number): number {
        return 1.7 * baseHeight;
    }
}