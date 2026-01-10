import CameraControl from "../../../Script/Slot/CameraControl";
import Reel from "../../../Script/Slot/Reel";
import Symbol from "../../../Script/Slot/Symbol";
import SlotReelSpinStateManager from "../../../Script/Slot/SlotReelSpinStateManager";
import SlotSoundController from "../../../Script/Slot/SlotSoundController";
import SymbolAnimationController from "../../../Script/Slot/SymbolAnimationController";
import SlotUIRuleManager from "../../../Script/Slot/rule/SlotUIRuleManager";
import AsyncHelper from "../../../Script/global_utility/AsyncHelper";
import TSUtility from "../../../Script/global_utility/TSUtility";
import SlotGameResultManager from "../../../Script/manager/SlotGameResultManager";
import SlotGameRuleManager, { SlotWindows } from "../../../Script/manager/SlotGameRuleManager";
import SlotManager from "../../../Script/manager/SlotManager";
import SoundManager from "../../../Script/manager/SoundManager";
import { BottomTextType } from "./BottomUIText";
import GameComponent_MoooreCheddar from "./GameComponent_MoooreCheddar";
import { EXPLANE_MSG, PICK_RECOVERY, SIDE_ANI } from "./MsgDataType_MoooreCheddar";
import PrizeSymbol_MoooreCheddar from "./PrizeSymbol_MoooreCheddar";
import SubGameStateManager_MoooreCheddar from "./SubGameStateManager_MoooreCheddar";

// 严格遵循指定的装饰器导出方式
const { ccclass, property } = cc._decorator;



/**
 * Mooore Cheddar老虎机核心管理器
 * 核心功能：场景加载、游戏模式切换、免费旋转控制、奖励收集、动画/音效管理、相机设置等
 */
@ccclass()
export default class MoooreCheddarManager extends SlotManager {
    // ================= 静态常量（与原代码一致） =================
    public static readonly SUBGAMEID_SLOT: string = "mooorecheddar";
    public static readonly NAME_SLOT: string = "Mooore Cheddar!";

    // ================= 组件绑定（与原代码property一一对应） =================
    @property([cc.Node])
    move_popup_pivot: cc.Node[] = [];        // 弹窗移动锚点节点数组
    @property([cc.Node])
    game_rule_node: cc.Node[] = [];          // 游戏规则节点数组
    @property([cc.Node])
    frame_node: cc.Node[] = [];              // 边框节点数组
    @property([cc.Node])
    bg_node: cc.Node[] = [];                 // 背景节点数组
    @property(cc.Prefab)
    move_collect: cc.Prefab = null;          // 收集物移动预制体
    @property(cc.Node)
    collect_effect: cc.Node = null;          // 收集特效节点
    @property(cc.Prefab)
    freepot_move: cc.Prefab = null;          // 免费池移动预制体
    @property([cc.Node])
    freepot_effect: cc.Node[] = [];          // 免费池特效节点数组
    @property(cc.Node)
    freepot_pivot: cc.Node = null;           // 免费池锚点节点

    // ================= 业务属性 =================
    public spin_world_pos: cc.Vec2 = cc.Vec2.ZERO;  // 旋转按钮世界坐标
    public winpanel_pos: cc.Vec2 = cc.Vec2.ZERO;    // 奖励面板坐标
    private game_components: GameComponent_MoooreCheddar = null; // 游戏组件实例
    private subgame_state: SubGameStateManager_MoooreCheddar = null; // 子游戏状态管理器

    // ================= 单例方法（与原代码一致） =================
    public static getInstance(): SlotManager {
        return SlotManager.Instance;
    }

    // ================= 生命周期方法 =================
    /**
     * 组件加载初始化
     * 绑定父类逻辑、初始化子游戏状态、注册动画/事件监听
     */
    onLoad(): void {
        super.onLoad(); // 调用父类onLoad

        // 初始化游戏组件和子游戏状态
        this.game_components = this.node.getComponent(GameComponent_MoooreCheddar);
        this.subgame_state = new SubGameStateManager_MoooreCheddar();
        this.subgame_state.setManager(this, this.game_components.node, this.getAnimationTime());

        // 绑定收集特效动画结束事件
        const collectAni = this.collect_effect.getComponentInChildren(cc.Animation);
        collectAni.on(cc.Animation.EventType.FINISHED, () => {
            this.collect_effect.active = false;
        });

        // 绑定免费池特效动画结束事件
        const bindFreePotAni = (node: cc.Node) => {
            const ani = node.getComponentInChildren(cc.Animation);
            ani.on(cc.Animation.EventType.FINISHED, () => {
                node.active = false;
            });
        };
        this.freepot_effect.forEach(bindFreePotAni);

        // 注册节点事件监听
        this.node.on("changeMoneyState", this.changeMoneyState, this);
        this.node.on("changeGameModeUI", this.changeGameModeUI, this);
        this.node.on("onCollectMove", this.onCollectMove, this);
        this.node.on("onRollupWinMoney", this.onRollupWinMoney, this);
        this.node.on("updateFreeSpinInfo", this.updateFreeSpinInfo, this);
        this.node.on("onIdleBonusSymbol", this.onIdleBonusSymbol, this);
        this.node.on("stepUpgradeFreeInfo", this.stepUpgradeFreeInfo, this);
        this.node.on("onGameRuleText", this.onGameRuleText, this);
    }

    /**
     * 组件销毁清理
     * 解绑事件、调用父类销毁逻辑
     */
    onDestroy(): void {
        // 解绑所有自定义事件
        this.node.off("changeMoneyState");
        this.node.off("changeGameModeUI");
        this.node.off("onCollectMove");
        this.node.off("onRollupWinMoney");
        this.node.off("updateFreeSpinInfo");
        this.node.off("onIdleBonusSymbol");
        this.node.off("stepUpgradeFreeInfo");
        this.node.off("onGameRuleText");

        super.onDestroy(); // 调用父类onDestroy
    }

    // ================= 核心工具方法 =================
    /**
     * 获取动画时长
     * @returns 动画总时长（符号特效时长 * 循环次数）
     */
    getAnimationTime(): number {
        return this.timeOfSymbolEffect * this.loopCountOfSymbolEffect;
    }

    /**
     * 播放主背景音乐
     * 根据子游戏类型切换BGM
     */
    playMainBgm(): void {
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        if (nextSubGameKey.includes("bonus")) {
            SlotSoundController.Instance().playAudio("bonus", "BGM");
        } else {
            SlotSoundController.Instance().playAudio(nextSubGameKey, "BGM");
        }
    }

    /**
     * 获取子游戏状态
     * @returns 当前选中的子游戏状态
     */
    getSubGameState(): any {
        return this.subgame_state.getSelectState();
    }

    /**
     * 设置移动对象位置（旋转按钮、奖励面板、收集特效）
     */
    setUseMoveObjectPosition(): void {
        // 旋转按钮世界坐标
        this.spin_world_pos = this._bottomUI.getSpinBtn().node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        // 奖励面板坐标转换
        this.winpanel_pos = this.specialModeTextLayer.convertToNodeSpaceAR(
            this.bottomUIText.getWinMoneyLabel().node.convertToWorldSpaceAR(cc.Vec2.ZERO)
        );
        // 收集特效坐标
        const collectPos = this.specialModeTextLayer.parent.convertToNodeSpaceAR(
            this.bottomUIText.getWinMoneyLabel().node.convertToWorldSpaceAR(cc.Vec2.ZERO)
        );
        this.collect_effect.setPosition(collectPos);
    }

    // ================= 异步场景加载逻辑 =================
    /**
     * 异步场景加载准备
     * 禁用输入、设置相机
     */
    async asyncSceneLoadPrepare(): Promise<void> {
        this.setKeyboardEventFlag(false);
        this.setMouseDragEventFlag(false);
        this.onCameraSetting();
    }

    /**
     * 异步场景加载特效
     * 处理游戏模式切换、动画、相机、弹窗等逻辑
     */
    async asyncSceneLoadEffect(): Promise<void> {
        this.setUseMoveObjectPosition();
        const nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();

        // 基础状态更新
        this.changeMoneyState();
        this.changeGameModeUI(nextSubGameKey);
        this.onGameRuleText(!nextSubGameKey.includes("free"));
        this.game_components.onEnterAnimation();

        // 处理bonusGame逻辑
        if (nextSubGameKey.indexOf("bonusGame") > -1) {
            // 相机初始化
            const camPos = new cc.Vec2(40, 0);
            const camSize = new cc.Vec2(720, 600);
            CameraControl.Instance.initCameraControl(camPos, camSize);
            CameraControl.Instance.scrollUpScreen(0);

            // 解析bonusGame状态
            const subGameState = SlotGameResultManager.Instance.getSubGameState(nextSubGameKey);
            let a = -1, i = -1;
            const keys = Object.keys(subGameState.exData);
            for (const key of keys) {
                a = parseInt(key);
                i = subGameState.exData[key];
            }

            // 发送pickBonus事件
            this.node.emit("openPickBonus", true, nextSubGameKey.indexOf("free") > -1);
            const pickRecovery = new PICK_RECOVERY();
            pickRecovery.onInit(a, i, subGameState.totalWinningCoin);
            this.node.emit("sendPickBonus", pickRecovery);
            this.subgame_state.setCheddaCheese();
        } else {
            // 非bonusGame逻辑
            SlotSoundController.Instance().playAudio("Intro", "FX");
            await AsyncHelper.delay(3.5);

            // 处理滚轮停止后逻辑
            this.reelMachine.reels.forEach(reel => {
                reel.getComponent(Reel).processAfterStopSpin();
            });

            // 相机重置
            CameraControl.Instance.resetZoomRelative(0.8, false);
            CameraControl.Instance.scrollDownScreen(0.8, cc.easeOut(2));
            await AsyncHelper.delay(0.8);

            this.game_components.onEndEnterAnimation();
        }

        // 绑定相机滚动回调
        CameraControl.Instance.callbackScrollUp = this.onMovePopupPosition.bind(this, true);
        CameraControl.Instance.callbackScrollDown = this.onMovePopupPosition.bind(this, false);

        // 播放BGM、延迟后处理自动旋转
        this.playMainBgm();
        await AsyncHelper.delay(0.5);

        if (this.isNextSpinAutoStart()) {
            this.spinAfterCloseAllPopup();
            this.setMouseDragEventFlag(false);
        } else {
            this.setMouseDragEventFlag(true);
        }
        this.setKeyboardEventFlag(true);
    }

    // ================= 游戏模式与UI控制 =================
    /**
     * 弹窗位置移动回调
     * @param isUp 是否向上滚动
     */
    onMovePopupPosition(isUp: boolean): void {
        this.game_components.onTopAnimationPlay(isUp);
    }

    /**
     * 设置入口窗口（滚轮符号初始化）
     */
    setEntranceWindow(): void {
        this.subgame_state.onUpdatePotValue();
        this.updateFreeSpinInfo();

        let nextSubGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        if (nextSubGameKey === "") nextSubGameKey = "base";

        // 基础模式逻辑
        if (!nextSubGameKey.includes("bonus")) {
            super.setEntranceWindow();
        } else if (nextSubGameKey === "bonusGame_infreespin") {
            // bonusGame_infreespin逻辑
            const freeSpinState = SlotGameResultManager.Instance.getSubGameState("freeSpin");
            let reelStrip = SlotGameRuleManager.Instance.getReelStrip("freeSpin");
            if (!TSUtility.isValid(reelStrip)) {
                reelStrip = SlotGameRuleManager.Instance.getReelStrip("base");
            }

            // 初始化窗口符号
            const windows = new SlotWindows([3, 3, 3, 3, 3]);
            const windowSymbols: number[][] = [];
            for (let l = 0; l < 5; ++l) {
                const row: number[] = [];
                for (let s = 0; s < 3; ++s) {
                    row.push(freeSpinState.lastWindows[l][s] === 31 ? 131 : freeSpinState.lastWindows[l][s]);
                }
                windowSymbols.push(row);
            }
            windows.setWindowSymbols(windowSymbols);

            // 初始化滚轮
            for (let c = 0; c < this.reelMachine.reels.length; ++c) {
                const reelBand = reelStrip.getReel(c).defaultBand;
                const window = windows.GetWindow(c);
                const reelComp = this.reelMachine.reels[c].getComponent(Reel);
                if (window) {
                    reelComp.invalidate(reelBand, Math.floor(Math.random() * reelBand.length), c, window);
                } else {
                    reelComp.invalidate(reelBand, Math.floor(Math.random() * reelBand.length), c);
                }
            }

            // 设置高价值符号信息
            const potInfo = [
                this.subgame_state.PrePot,
                this.subgame_state.PreJackpotType,
                this.subgame_state.PreJackpotValue,
                this.subgame_state.PreJackpotCount
            ];
            for (let l = 0; l < windowSymbols.length; ++l) {
                for (let s = 0; s < windowSymbols[l].length; ++s) {
                    if (windowSymbols[l][s] === 131) {
                        const symbol = this.reelMachine.reels[l].getComponent(Reel).getSymbol(s).getComponent(PrizeSymbol_MoooreCheddar);
                        if (TSUtility.isValid(symbol)) {
                            symbol.SetSymbolInfoByHighSymbol(potInfo);
                        }
                    }
                }
            }
        } else {
            // 其他bonus模式逻辑
            const reelStripKey = nextSubGameKey.includes("free") ? "freeSpin" : "base";
            const subGameState = SlotGameResultManager.Instance.getSubGameState(reelStripKey);
            let reelStrip = SlotGameRuleManager.Instance.getReelStrip(reelStripKey);
            if (!TSUtility.isValid(reelStrip)) {
                reelStrip = SlotGameRuleManager.Instance.getReelStrip("base");
            }

            // 初始化窗口符号
            const windows = new SlotWindows([3, 3, 3, 3, 3]);
            const windowSymbols: number[][] = [];
            for (let l = 0; l < 5; ++l) {
                const row: number[] = [];
                for (let s = 0; s < 3; ++s) {
                    row.push(subGameState.lastWindows[l][s]);
                }
                windowSymbols.push(row);
            }
            windows.setWindowSymbols(windowSymbols);

            // 初始化滚轮
            for (let c = 0; c < this.reelMachine.reels.length; ++c) {
                const reelBand = reelStrip.getReel(c).defaultBand;
                const window = windows.GetWindow(c);
                const reelComp = this.reelMachine.reels[c].getComponent(Reel);
                if (window) {
                    reelComp.invalidate(reelBand, Math.floor(Math.random() * reelBand.length), c, window);
                } else {
                    reelComp.invalidate(reelBand, Math.floor(Math.random() * reelBand.length), c);
                }
            }
        }
    }

    /**
     * 切换游戏模式UI
     * @param gameMode 游戏模式（默认base）
     * @param isActive 是否激活（默认true）
     */
    changeGameModeUI(gameMode: string = "base", isActive: boolean = true): void {
        this.onChangeFrame();
        const isFreeMode = gameMode.indexOf("free") > -1;

        // 免费旋转模式处理
        if (!isFreeMode) {
            SlotManager.Instance._bottomUI.hideFreespinUI();
            SlotReelSpinStateManager.Instance.setFreespinMode(false);
        } else {
            const freeSpinState = SlotGameResultManager.Instance.getSubGameState("freeSpin");
            if (TSUtility.isValid(freeSpinState)) {
                SlotGameResultManager.Instance.winMoneyInFreespinMode = freeSpinState.totalWinningCoin;
                SlotManager.Instance._freespinTotalCount = freeSpinState.totalCnt;
                SlotManager.Instance._freespinPastCount = freeSpinState.spinCnt;
                SlotManager.Instance._freespinMultiplier = freeSpinState.spinMultiplier;
            }

            SlotManager.Instance.setFreespinExtraInfoByCurrentState();
            SlotManager.Instance._bottomUI.setShowFreespinMultiplier(false);
            SlotManager.Instance.bottomUIText.setWinMoney(SlotGameResultManager.Instance.winMoneyInFreespinMode);
            SlotManager.Instance._bottomUI.showFreespinUI();
            SlotReelSpinStateManager.Instance.setFreespinMode(true);
        }

        // 更新背景/边框节点状态
        for (let a = 0; a < 2; ++a) {
            this.bg_node[a].active = a === (isFreeMode ? 1 : 0);
            this.frame_node[a].active = a === (isFreeMode ? 1 : 0);
        }

        // 通知滚轮设置免费模式标记
        this.reelMachine.reels.forEach(reel => {
            reel.node.emit("setFreeFlag", isFreeMode);
        });

        this.onPlayChangeAnimation(gameMode);
    }

    /**
     * 更新游戏规则文本显示
     * @param isShowBase 是否显示基础规则（默认true）
     */
    onGameRuleText(isShowBase: boolean = true): void {
        this.game_rule_node[0].active = isShowBase;
        this.game_rule_node[1].active = !isShowBase;
    }

    // ================= 奖励收集与动画 =================
    /**
     * 收集物移动动画
     * @param reelIdx 滚轮索引
     * @param symbolIdx 符号索引
     * @param winMoney 奖励金额
     * @param duration 动画时长
     */
    onCollectMove(reelIdx: number, symbolIdx: number, winMoney: number, duration: any): void {
        // 实例化收集物预制体
        const collectNode = cc.instantiate(this.move_collect);
        this.specialModeTextLayer.addChild(collectNode);

        // 计算坐标
        const symbolWorldPos = this.reelMachine.reels[reelIdx].getComponent(Reel)
            .getSymbol(symbolIdx).convertToWorldSpaceAR(cc.Vec2.ZERO);
        const symbolLocalPos = this.specialModeTextLayer.convertToNodeSpaceAR(symbolWorldPos);
        collectNode.setPosition(symbolLocalPos);

        // 播放音效+动画
        SlotSoundController.Instance().playAudio("HSP", "FX");
        cc.tween(collectNode)
            .to(0.67, { x: this.winpanel_pos.x, y: this.winpanel_pos.y }, { easing: "cubicOut" })
            .call(() => {
                // 动画结束处理
                this.bottomUIText.setBottomTextInfo(BottomTextType.CustomData, "WIN");
                this.collect_effect.active = true;
                this.onRollupWinMoney(winMoney, duration);
                if (TSUtility.isValid(collectNode.parent)) {
                    collectNode.removeFromParent(false);
                }
            })
            .start();
    }

    /**
     * 滚动更新奖励金额
     * @param addMoney 新增金额
     * @param duration 动画时长
     * @param isSkip 是否跳过（默认false）
     */
    onRollupWinMoney(addMoney: number, duration: any, isSkip: boolean = false): void {
        this.bottomUIText.playChangeWinMoney(
            this.subgame_state.total_money,
            this.subgame_state.total_money + addMoney,
            duration,
            isSkip,
            0.5
        );
        this.subgame_state.total_money += addMoney;
    }

    /**
     * 免费旋转信息升级步骤
     * @param jackpotType  jackpot类型
     * @param jackpotCount jackpot次数
     * @param potValue     池值
     * @param callback     完成回调
     */
    stepUpgradeFreeInfo(
        jackpotType: number = 0,
        jackpotCount: number = 0,
        potValue: number = 0,
        callback?: Function
    ): void {
        const actions = [];

        // 初始动作：侧边角色动画+显示说明
        actions.push(cc.callFunc(() => {
            this.node.emit("onSideCharacterAnimation", SIDE_ANI.START);
            const explaneMsg = new EXPLANE_MSG();
            explaneMsg.onInit(jackpotType, jackpotCount, potValue);
            this.node.emit("setExplaneNode", explaneMsg);
            this.game_rule_node[0].active = false;
            this.game_rule_node[1].active = true;
        }));
        actions.push(cc.delayTime(0.5));

        // 处理每个滚轮的符号动画
        const lastWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        const resultSymbols = SlotGameResultManager.Instance.getResultSymbolInfoArray();
        const processReel = (reelIdx: number) => {
            const reelComp = SlotManager.reelMachine.reels[reelIdx].getComponent(Reel);
            const window = lastWindows.GetWindow(reelIdx);

            const processSymbol = (symbolIdx: number) => {
                const symbolId = window.getSymbol(symbolIdx);
                if (Math.floor(0.1 * symbolId) === 9) {
                    // 播放符号动画
                    actions.push(cc.callFunc(() => {
                        const aniSymbol = SymbolAnimationController.Instance.playAnimationSymbol(reelIdx, symbolIdx, 209)
                            .getComponent(PrizeSymbol_MoooreCheddar);
                        if (TSUtility.isValid(aniSymbol)) {
                            aniSymbol.SetSymbolInfoByHighSymbol([
                                this.subgame_state.PrePot,
                                this.subgame_state.PreJackpotType,
                                this.subgame_state.PreJackpotValue,
                                this.subgame_state.PreJackpotCount
                            ]);
                        }
                        reelComp.hideSymbolInRow(symbolIdx);

                        // 实例化免费池移动预制体
                        const freepotNode = cc.instantiate(this.freepot_move);
                        this.specialModeTextLayer.addChild(freepotNode);

                        // 计算坐标
                        const symbolWorldPos = reelComp.getSymbol(symbolIdx).convertToWorldSpaceAR(cc.Vec3.ZERO);
                        const symbolLocalPos = this.specialModeTextLayer.convertToNodeSpaceAR(symbolWorldPos);
                        freepotNode.setPosition(symbolLocalPos);

                        // 目标坐标
                        const targetOffset = (jackpotCount > 0 || symbolId > 91) ? new cc.Vec3(-45, 0, 0) : cc.Vec3.ZERO;
                        const targetWorldPos = this.freepot_pivot.convertToWorldSpaceAR(targetOffset);
                        const targetLocalPos = this.specialModeTextLayer.convertToNodeSpaceAR(targetWorldPos);

                        // 播放音效+动画
                        SlotSoundController.Instance().playAudio("TUI", "FX");
                        cc.tween(freepotNode)
                            .to(0.67, { x: targetLocalPos.x, y: targetLocalPos.y }, { easing: "cubicOut" })
                            .call(() => {
                                // 更新数值
                                if (symbolId > 91) {
                                    jackpotType = symbolId - 92;
                                    jackpotCount += 1;
                                } else {
                                    potValue += resultSymbols[reelIdx][symbolIdx].prize *
                                        SlotGameRuleManager.Instance.getCurrentBetPerLineApplyFeatureTotalBetRate100();
                                }

                                // 更新说明信息
                                const explaneMsg = new EXPLANE_MSG();
                                explaneMsg.onInit(jackpotType, jackpotCount, potValue);
                                this.node.emit("setExplaneNode", explaneMsg);

                                // 播放免费池特效
                                for (const effectNode of this.freepot_effect) {
                                    if (!effectNode.active) {
                                        const effectPos = effectNode.parent.convertToNodeSpaceAR(targetWorldPos);
                                        effectNode.setPosition(effectPos);
                                        effectNode.active = true;
                                        break;
                                    }
                                }

                                // 清理预制体
                                if (TSUtility.isValid(freepotNode.parent)) {
                                    freepotNode.removeFromParent(false);
                                }
                            })
                            .start();
                    }));
                    actions.push(cc.delayTime(0.5));
                    actions.push(cc.callFunc(() => {
                        SymbolAnimationController.Instance.releaseAnimationSymbol_byKey(reelIdx, symbolIdx);
                        reelComp.showSymbolInRow(symbolIdx);
                    }));
                }
            };

            for (let f = 0; f < 3; ++f) {
                processSymbol(f);
            }
        };

        // 处理所有5个滚轮
        for (let y = 0; y < 5; ++y) {
            processReel(y);
        }

        // 结束动作：停止侧边动画+回调
        actions.push(cc.callFunc(() => {
            this.node.emit("onSideCharacterAnimation", SIDE_ANI.END);
        }));
        actions.push(cc.delayTime(1));
        if (TSUtility.isValid(callback)) {
            actions.push(cc.callFunc(callback));
        }

        // 执行动作序列
        this.node.runAction(cc.sequence(actions));
    }

    /**
     * 更新免费旋转信息
     */
    updateFreeSpinInfo(): void {
        const explaneMsg = new EXPLANE_MSG();
        explaneMsg.onInit(
            this.subgame_state.PreJackpotType,
            this.subgame_state.PreJackpotCount,
            this.subgame_state.PrePot
        );
        this.node.emit("setExplaneNode", explaneMsg);
    }

    /**
     * 闲置奖励符号处理
     * @param isIdle 是否闲置
     * @param reelIdx 滚轮索引（默认-1）
     */
    onIdleBonusSymbol(isIdle: boolean = false, reelIdx: number = -1): void {
        if (isIdle) {
            // 显示闲置符号动画
            this.reelMachine.reels.forEach((reel, n) => {
                const reelComp = reel.getComponent(Reel);
                for (let a = 0; a < 3; ++a) {
                    const symbolNode = reelComp.getSymbol(a);
                    const symbolComp = symbolNode.getComponent(Symbol);
                    if (symbolComp.symbolId === 61) {
                        SymbolAnimationController.Instance.mustPlayAnimationSymbol(n, a, 261);
                        symbolNode.active = false;
                    }
                }
            });
        } else {
            // 停止所有符号动画
            SymbolAnimationController.Instance.stopAllAnimationSymbol();
        }
    }

    // ================= 辅助方法 =================
    /**
     * 判断下一次旋转是否自动开始
     * @returns 是否自动开始
     */
    isNextSpinAutoStart(): boolean {
        return SlotGameResultManager.Instance.getNextSubGameKey() !== "base";
    }

    /**
     * 设置滚轮预期特效状态
     * @param reelIdx 滚轮索引
     */
    setPlayReelExpectEffectState(reelIdx: number): void {
        this.reelMachine.hideAllExpectEffects();

        // 显示预期特效
        if (this.reelMachine.reels.length > reelIdx && 
            SlotUIRuleManager.Instance.getExpectEffectFlag(reelIdx, SlotGameResultManager.Instance.getVisibleSlotWindows())) {
            
            if (this.reelMachine.shoeExpectEffect(reelIdx)) {
                SoundManager.Instance().setMainVolumeTemporarily(0.1);
                SlotManager.Instance.stopReelSpinSound();
                this.reelMachine.reels[reelIdx].getComponent(Reel).setShaderValue("blurOffset", 0.03);
            }
        } else {
            // 停止特效音效+恢复音量
            const beClip = SlotSoundController.Instance().getAudioClip("BE");
            if (SoundManager.Instance().isPlayingFxOnce(beClip)) {
                SoundManager.Instance().stopFxOnce(beClip);
            }
            const jeClip = SlotSoundController.Instance().getAudioClip("JE");
            if (SoundManager.Instance().isPlayingFxOnce(jeClip)) {
                SoundManager.Instance().stopFxOnce(jeClip);
            }
            SoundManager.Instance().resetTemporarilyMainVolume();
        }
    }

    /**
     * 更新分享信息
     */
    processChangeShareInfo(): void {
        this.bannerImgNameBigwin = "slot-mooorecheddar-win-big-20251030.jpg";
        this.bannerImgNameSuperwin = "slot-mooorecheddar-win-huge-20251030.jpg";
        this.bannerImgNameMegawin = "slot-mooorecheddar-win-mega-20251030.jpg";
        this.freespinShareImgName = "slot-mooorecheddar-free-spins-20251030.jpg";
        this.bonusShareImgName = "slot-mooorecheddar-bonus-game-20251030.jpg";
        this.jackpotMiniShareImgName = "slot-mooorecheddar-jackpot-mini-20251030.jpg";
        this.jackpotMinorShareImgName = "slot-mooorecheddar-jackpot-minor-20251030.jpg";
        this.jackpotMajorShareImgName = "slot-mooorecheddar-jackpot-major-20251030.jpg";
        this.jackpotGrandShareImgName = "slot-mooorecheddar-jackpot-grand-20251030.jpg";
    }

    /**
     * 相机设置
     */
    onCameraSetting(): void {
        const ratio = CameraControl.Instance.scaleAdjuster.getResolutionRatio();
        const t = cc.misc.lerp(710, 690, ratio);
        const camPos = new cc.Vec2(40, 0);
        const camSize = new cc.Vec2(720, t);
        CameraControl.Instance.initCameraControl(camPos, camSize);
        CameraControl.Instance.scrollUpScreen(0);
    }

    /**
     * 注册忽略的符号ID
     */
    registerIgnoreSymbols(): void {
        this._special_ignore_symbolId = [-1, 0];
    }

    /**
     * 获取窗口范围
     * @returns 窗口范围数组
     */
    getWindowRange(): number[][] {
        const range: number[][] = [];
        this.reelMachine.reels.forEach(() => {
            range.push([1, 4]);
        });
        return range;
    }

    /**
     * 获取结果窗口
     * @returns 滚轮停止窗口
     */
    getResultWindows(): SlotWindows {
        const historyWindow = SlotGameResultManager.Instance.getHistoryWindow(0);
        const stopWindows = SlotGameResultManager.Instance.getReelStopWindows();
        
        for (let n = 0; n < stopWindows.size; ++n) {
            for (let o = 0; o < 3; ++o) {
                stopWindows.GetWindow(n).setSymbol(o + 1, historyWindow.GetWindow(n).getSymbol(o));
            }
        }
        return stopWindows;
    }

    // ================= 空实现方法（原代码保留） =================
    changeMoneyState(): void {}
    onChangeFrame(): void {}
    onPlayChangeAnimation(data:any): void {}
    recoveryMachine(): void {}
}