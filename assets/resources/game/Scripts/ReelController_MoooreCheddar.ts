import ReelController_Base from "../../../Script/ReelController_Base";
import ReelSpinBehaviors, { EasingInfo } from "../../../Script/ReelSpinBehaviors";
import Reel from "../../../Script/Slot/Reel";
import SlotSoundController from "../../../Script/Slot/SlotSoundController";
import State, { SequencialState } from "../../../Script/Slot/State";
import SymbolAni from "../../../Script/Slot/SymbolAni";
import SlotUIRuleManager from "../../../Script/Slot/rule/SlotUIRuleManager";
import TSUtility from "../../../Script/global_utility/TSUtility";
import SlotGameResultManager from "../../../Script/manager/SlotGameResultManager";
import SlotGameRuleManager from "../../../Script/manager/SlotGameRuleManager";
import SlotManager from "../../../Script/manager/SlotManager";
import SoundManager from "../../../Script/manager/SoundManager";
import SymbolPoolManager from "../../../Script/manager/SymbolPoolManager";
import { SIDE_ANI } from "./MsgDataType_MoooreCheddar";
import PrizeSymbol_MoooreCheddar from "./PrizeSymbol_MoooreCheddar";

const { ccclass, property } = cc._decorator;

/**
 * MoooreCheddar 老虎机滚轮控制器
 * 继承自通用滚轮控制器基类，适配该游戏的滚轮旋转、符号特效、音效、免费游戏等专属逻辑
 */
@ccclass()
export default class ReelController_MoooreCheddar extends ReelController_Base {
    // ===================== 序列化属性（对应编辑器绑定） =====================
    /** 符号出现动画的层级节点 */
    @property({ type: cc.Node })
    public appear_layer: cc.Node = null!;

    // ===================== 私有成员变量 =====================
    /** 音效索引列表 */
    private sound_index: number[] = [];
    /** 滚轮索引 */
    private reel_index: number = 0;
    /** 滚轮停止延迟时间（秒） */
    private stop_delay: number = 0.35;
    /** 音效映射表：符号ID → 音效名 */
    private sound_list: Record<number, string> = {
        0: "ReelStop",
        9: "JA",
        6: "BA",
        3: "HSA"
    };
    /** 当前要播放的音效ID */
    private playSound: number = 0;
    /** 出现的符号列表（存储行、索引、ID） */
    private appear_list: Array<{ fixed_row: number; key: number; id: number }> = [];
    /** 是否为免费游戏模式 */
    private isfreegame: boolean = false;
    /** 符号检查回调函数 */
    private check_function: ((windowData: any) => void) | null = null;
    /** 虚拟符号列表（普通游戏/免费游戏不同） */
    public dummySymbolList: number[] = [];

    // ===================== 生命周期函数 =====================
    /**
     * 组件加载初始化
     */
    onLoad(): void {
        // 获取当前节点的滚轮组件，记录滚轮索引
        const reelComp = this.node.getComponent(Reel);
        this.reel_index = reelComp.reelindex;
        
        // 初始化普通游戏的虚拟符号列表
        this.dummySymbolList = [71, 51, 31, 25, 24, 23, 22, 21, 14, 13, 12, 11];
        
        // 绑定符号检查函数的this指向
        this.check_function = this.checkAppearSymbol.bind(this);
        
        // 监听免费游戏标记设置事件
        this.node.on("setFreeFlag", this.setFreeFlag, this);
        
        // 初始化隐藏预期特效
        this.setShowExpectEffects(false);
    }

    /**
     * 组件销毁时清理
     */
    onDestroy(): void {
        // 移除免费游戏标记事件监听，避免内存泄漏
        this.node.off("setFreeFlag", this.setFreeFlag, this);
    }

    // ===================== 公共业务方法 =====================
    /**
     * 设置免费游戏标记，切换虚拟符号列表
     * @param isFree 是否为免费游戏
     */
    setFreeFlag(isFree: boolean): void {
        // 更新免费游戏模式下的虚拟符号列表
        this.dummySymbolList = [61, 31, 25, 24, 23, 22, 21, 14, 13, 12, 11];
        this.isfreegame = isFree;
    }

    /**
     * 设置预期特效的显示/隐藏
     * @param show 是否显示特效
     * @returns 是否成功执行
     */
    setShowExpectEffects(show: boolean): boolean {
        // 跳过当前旋转时，不显示特效
        if (show && SlotManager.Instance.isSkipCurrentSpin) {
            return false;
        }

        // 隐藏特效逻辑
        if (!show) {
            // 关闭所有预期特效节点
            for (let i = 0; i < this.expectEffects.length; i++) {
                this.expectEffects[i].active = false;
            }
            // 停止相关音效
            if (TSUtility.isValid(SlotSoundController.Instance())) {
                SlotSoundController.Instance().stopAudio("BE", "FXLoop");
                SlotSoundController.Instance().stopAudio("JE", "FXLoop");
            }
            return true;
        }

        // 显示特效逻辑
        // 1. 统计最后历史窗口中ID=61的符号数量
        const lastHistoryWindows = SlotGameResultManager.Instance.getLastHistoryWindows();
        let bonusSymbolCount = 0;
        for (let i = 0; i < 3; ++i) {
            const window = lastHistoryWindows.GetWindow(i);
            for (let s = 0; s < window.size; ++s) {
                if (window.getSymbol(s) === 61) {
                    bonusSymbolCount++;
                }
            }
        }

        // 2. 判断是否显示奖励特效（滚轮索引<4且奖励符号数>1）
        const showBonusEffect = bonusSymbolCount > 1 && this.reel_index < 4;
        const effectIndex = showBonusEffect && this.reel_index < 4 ? 1 : 0;

        // 3. 调整并显示预期特效节点
        for (let m = 0; m < this.expectEffects.length; ++m) {
            const effectNode = this.expectEffects[m];
            // 转换坐标：滚轮节点世界坐标 → 特效父节点本地坐标
            const reelWorldPos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
            const effectLocalPos = effectNode.parent!.convertToNodeSpaceAR(reelWorldPos);
            // 保持Y轴不变，更新X轴位置
            effectNode.setPosition(new cc.Vec2(effectLocalPos.x, effectNode.position.y));
            // 仅显示指定索引的特效
            effectNode.active = m === effectIndex;
        }

        // 4. 处理音效和动画
        let soundKey = "";
        if (showBonusEffect) {
            // 奖励特效：发射空闲奖励符号事件
            SlotManager.Instance.node.emit("onIdleBonusSymbol", true);
            
            // 整理appear_layer下的符号动画节点
            const childCount = this.appear_layer.childrenCount;
            for (let m = 0; m < childCount; ++m) {
                const firstChild = this.appear_layer.children[0];
                this.appear_layer.removeChild(firstChild);
                // 释放ID=161的符号动画节点
                const symbolAniComp = firstChild.getComponent(SymbolAni);
                if (symbolAniComp && symbolAniComp.symbolId === 161) {
                    SymbolPoolManager.instance.releaseSymbolAni(firstChild);
                } else {
                    this.appear_layer.addChild(firstChild);
                }
            }
            soundKey = "BE";
        } else {
            soundKey = "JE";
        }

        // 5. 播放指定音效（先停止已有音效，避免重叠）
        const audioClip = SlotSoundController.Instance().getAudioClip(soundKey);
        if (SoundManager.Instance().isPlayingFxOnce(audioClip)) {
            SoundManager.Instance().stopFxOnce(audioClip);
        }
        SlotSoundController.Instance().playAudio(soundKey, "FX");
        
        // 6. 发射侧边动画事件（预期奖励）
        SlotManager.Instance.node.emit(
            "onPlayCharacterAnimationWhileSpinning",
            SIDE_ANI.EXPECT_FEATURE
        );

        return true;
    }

    /**
     * 处理滚轮旋转结束逻辑
     * @param callback 旋转结束后的回调
     */
    processSpinEnd(callback: () => void): void {
        const reelComp = this.node.getComponent(Reel);
        
        // 隐藏appear_list中所有符号
        for (let o = 0; o < this.appear_list.length; ++o) {
            reelComp.hideSymbolInRow(this.appear_list[o].fixed_row);
        }

        // 播放指定音效
        SlotSoundController.Instance().playAudio(this.sound_list[this.playSound], "FX");

        // 延迟调度清理逻辑
        this.scheduleOnce(() => {
            this.appear_list = [];
            // 最后一个滚轮（索引3）停止时，发射空闲奖励符号事件
            if (reelComp.reelindex === 3) {
                SlotManager.Instance.node.emit("onIdleBonusSymbol", false);
            }
            this.playSound = 0;
            // 执行回调
            callback();
        }, this.appear_list.length > 0 ? this.stop_delay : 0);
    }

    /**
     * 获取滚轮旋转状态（排除预旋转，使用旋转请求时间）
     * @param reelStopWindows 滚轮停止窗口数据
     * @param reelMachine 滚轮机器实例
     * @returns 序列化的旋转状态
     */
    getSpinExcludePreSpinUsingSpinRequestTimeState(
        reelStopWindows: any = null,
        reelMachine: any = null
    ): SequencialState {
        const sequencialState = new SequencialState();
        
        // 节点未激活时，返回空状态
        if (!this.node.active) {
            return sequencialState;
        }

        // 1. 获取基础数据
        const reelComp = this.node.getComponent(Reel);
        const targetStopWindows = reelStopWindows ?? SlotGameResultManager.Instance.getReelStopWindows();
        const targetReelMachine = reelMachine ?? SlotManager.Instance.reelMachine;
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinControlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelComp.reelindex];

        // 2. 构建滚轮旋转到停止前的状态
        let spinUntilStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReelRenewal(
            targetReelMachine.reels,
            reelComp,
            reelStrip,
            subGameKey
        );
        spinUntilStopState.flagSkipActive = true;
        spinUntilStopState.addOnStartCallback(() => {
            reelComp.setShaderValue("blurOffset", 0.02);
        });
        sequencialState.insert(0, spinUntilStopState);

        // 3. 构建滚轮更新状态
        let reelRenewalState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReelRenewal(
            targetReelMachine.reels,
            reelComp,
            reelStrip,
            subGameKey
        );
        reelRenewalState.flagSkipActive = true;
        sequencialState.insert(1, reelRenewalState);

        // 4. 解析缓动参数
        let postEasingType: any = undefined;
        let postEasingRate: any = undefined;
        let postEasingDuration: any = undefined;
        let postEasingDistance: any = undefined;
        if (TSUtility.isValid(spinControlInfo)) {
            postEasingType = spinControlInfo.postEasingType;
            postEasingRate = spinControlInfo.postEasingRate;
            postEasingDuration = spinControlInfo.postEasingDuration;
            postEasingDistance = spinControlInfo.postEasingDistance;
        }

        // 5. 获取结果符号列表
        const resultSymbolList = this.getResultSymbolList(targetStopWindows.GetWindow(reelComp.reelindex), reelComp);
        const resultSymbolInfoList = this.getResultSymbolInfoList(targetStopWindows.GetWindow(reelComp.reelindex), reelComp);
        const resultSpecialSymbolInfoList = this.getResultSpecialSymbolInfoList(targetStopWindows.GetWindow(reelComp.reelindex), reelComp);

        // 6. 构建缓动信息
        const easingInfo = new EasingInfo();
        easingInfo.easingType = postEasingType;
        easingInfo.easingDistance = postEasingDistance;
        easingInfo.easingDuration = postEasingDuration;
        easingInfo.easingRate = postEasingRate;
        easingInfo.onEasingStartFuncList.push(() => {});
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 7. 构建滚轮移动状态
        let reelMoveState = this.getReelMoveStateWithLastSymbolList(
            reelComp,
            resultSymbolList,
            subGameKey,
            easingInfo,
            resultSymbolInfoList,
            resultSpecialSymbolInfoList
        );
        reelMoveState.addFrontOnStartCallback(() => {});
        reelMoveState.addOnEndCallback(() => {
            this.check_function && this.check_function(targetStopWindows);
        });
        sequencialState.insert(2, reelMoveState);

        // 8. 构建滚轮停止后的清理状态
        const cleanState = new State();
        cleanState.addOnStartCallback(() => {
            // 重置滚轮组件位置，清除模糊 shader
            reelComp.resetPositionOfReelComponents();
            reelComp.setShaderValue("blurOffset", 0);

            // 查找下一个激活的滚轮索引
            let nextActiveReelIndex = -1;
            for (let t = this.reel_index + 1; t < targetReelMachine.reels.length; ++t) {
                if (targetReelMachine.reels[t].node.active) {
                    nextActiveReelIndex = t;
                    break;
                }
            }

            // 设置预期特效播放状态，处理旋转结束
            SlotManager.Instance.setPlayReelExpectEffectState(nextActiveReelIndex);
            this.processSpinEnd(() => {
                cleanState.setDone();
            });
        });
        sequencialState.insert(3, cleanState);

        return sequencialState;
    }

    // ===================== 私有业务方法 =====================
    /**
     * 检查出现的符号，触发对应动画和音效
     * @param windowData 窗口数据
     */
    private checkAppearSymbol(windowData: any): void {
        const targetWindow = windowData.GetWindow(this.reel_index);
        const resultSymbolInfoArray = SlotGameResultManager.Instance.getResultSymbolInfoArray();

        // 遍历窗口中的符号（排除首尾，只检查中间3行）
        for (let o = 1; o < targetWindow.size - 1; ++o) {
            const rowIndex = o - 1; // 转换为行索引（0-2）
            const symbolId = targetWindow.getSymbol(o);
            let aniNode: cc.Node = null;

            // 1. 处理Jackpot符号（ID>90且满足Jackpot条件）
            if (symbolId > 90 && this.checkJackpotSymbol(windowData)) {
                aniNode = this.playAppearAnimation(109, rowIndex);
                const prizeSymbolComp = aniNode.getComponent(PrizeSymbol_MoooreCheddar);
                if (TSUtility.isValid(prizeSymbolComp)) {
                    prizeSymbolComp.SetSymbolInfo(resultSymbolInfoArray[this.reel_index][rowIndex]);
                }
            }
            // 2. 处理奖励符号（ID=61且满足奖励条件）
            else if (symbolId === 61 && this.checkBonusSymbol(windowData)) {
                aniNode = this.playAppearAnimation(161, rowIndex);
            }
            // 3. 免费游戏模式下的特殊符号（ID=31）
            else if (this.isfreegame && symbolId === 31) {
                aniNode = this.playAppearAnimation(131, rowIndex);
                // 发射预期胜利动画事件
                SlotManager.Instance.node.emit(
                    "onPlayCharacterAnimationWhileSpinning",
                    SIDE_ANI.EXPECT_WIN
                );
            }

            // 4. 处理音效优先级，记录出现的符号
            if (TSUtility.isValid(aniNode)) {
                const soundId = Math.floor(0.1 * symbolId);
                // 保留最高优先级的音效ID
                this.playSound = this.playSound < soundId ? soundId : this.playSound;
                // 添加到出现列表
                this.appear_list.push({
                    fixed_row: rowIndex,
                    key: this.reel_index,
                    id: symbolId
                });
            }
        }
    }

    /**
     * 播放符号出现动画
     * @param symbolAniId 符号动画ID
     * @param rowIndex 行索引
     * @returns 符号动画节点
     */
    private playAppearAnimation(symbolAniId: number, rowIndex: number): cc.Node {
        // 从符号池获取动画节点
        const aniNode = SymbolPoolManager.instance.getSymbolAni(symbolAniId);
        // 重置节点激活状态（先关后开，触发动画）
        aniNode.active = false;
        aniNode.active = true;

        // 计算符号动画节点的目标位置
        const basePos = new cc.Vec2(158 * this.reel_index - 316, 132 - 132 * rowIndex);
        const worldPos = this.node.parent!.convertToWorldSpaceAR(basePos);
        const localPos = this.appear_layer.convertToNodeSpaceAR(worldPos);

        // 设置节点父级和位置
        aniNode.setParent(this.appear_layer);
        aniNode.setPosition(localPos);

        // 延迟清理动画节点
        this.scheduleOnce(() => {
            this.appear_layer.removeChild(aniNode);
            SymbolPoolManager.instance.releaseSymbolAni(aniNode);
            // 显示对应行的符号
            this.node.getComponent(Reel).showSymbolInRow(rowIndex);
        }, 0.35);

        // 播放符号动画
        const symbolAniComp = aniNode.getComponent(SymbolAni);
        if (symbolAniComp) {
            symbolAniComp.playAnimation(null, false);
        }

        return aniNode;
    }

    /**
     * 检查奖励符号（ID=61）是否满足显示条件
     * @param windowData 窗口数据
     * @returns 是否满足条件
     */
    private checkBonusSymbol(windowData: any): boolean {
        // 前2个滚轮（索引<2）直接满足
        if (this.reel_index < 2) {
            return true;
        }

        // 统计前面滚轮中奖励符号的数量
        let bonusSymbolCount = 0;
        for (let n = 0; n < this.reel_index; ++n) {
            const targetWindow = windowData.GetWindow(n);
            for (let a = 1; a < 4; ++a) {
                if (targetWindow.getSymbol(a) === 61) {
                    bonusSymbolCount++;
                    break;
                }
            }
        }

        // 满足条件：已出现的奖励符号数 ≥ 滚轮索引-1
        return this.reel_index - 1 <= bonusSymbolCount;
    }

    /**
     * 检查Jackpot符号是否满足显示条件
     * @param windowData 窗口数据
     * @returns 是否满足条件
     */
    private checkJackpotSymbol(windowData: any): boolean {
        // 前3个滚轮（索引<3）直接满足
        if (this.reel_index < 3) {
            return true;
        }

        // 统计所有滚轮中Jackpot相关符号的数量
        let jackpotSymbolCount = 0;
        for (let n = 0; n <= this.reel_index; ++n) {
            const targetWindow = windowData.GetWindow(n);
            for (let a = 1; a < 4; ++a) {
                const symbolId = targetWindow.getSymbol(a);
                // Jackpot符号判断：Math.floor(0.1 * ID) === 9
                if (Math.floor(0.1 * symbolId) === 9) {
                    jackpotSymbolCount++;
                }
            }
        }

        // 满足条件：Jackpot符号数 ≥ 3*(滚轮索引-2)
        return 3 * (this.reel_index - 2) <= jackpotSymbolCount;
    }
}