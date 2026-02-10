const { ccclass, property } = cc._decorator;

// 项目内部模块导入 - 路径/顺序 与原JS完全一致，无任何改动
import State, { SequencialState } from "./Slot/State";
import Reel from "./Slot/Reel";
import SlotGameResultManager from "./manager/SlotGameResultManager";
import SlotGameRuleManager from "./manager/SlotGameRuleManager";
import SlotUIRuleManager from "./Slot/rule/SlotUIRuleManager";
import ReelSpinBehaviors, { EasingInfo } from "./ReelSpinBehaviors";
import SlotSoundController from "./Slot/SlotSoundController";
import SoundManager from "./manager/SoundManager";
import SlotManager, { SpecialType, SpecialSymbolInfo } from "./manager/SlotManager";
import TSUtility from "./global_utility/TSUtility";


/**
 * 老虎机单滚轮核心控制器基类
 * 负责单个滚轮的所有旋转状态逻辑、符号数据处理、缓动配置、特效/音效控制
 */
@ccclass
export default class ReelController_Base extends cc.Component {
    // ===================== Cocos 属性绑定 - 与原JS装饰器完全对应 编辑器拖拽绑定 1:1复刻 =====================
    @property({ type: [cc.Node], displayName: "期待特效节点数组" })
    public expectEffects: cc.Node[] = [];

    // ===================== 私有成员变量 - 原JS构造函数初始化的数组 完整保留 =====================
    public easingFuncListOnSpinEnd: Function[] = [];
    public dummySymbolList: any[] = [];

    // ===================== 生命周期回调 - ONLOAD 与原JS逻辑完全一致 =====================
    onLoad(): void {
        this.setShowExpectEffects(false);
    }

    // ===================== 核心旋转状态 - 完整旋转流程(含预旋转) =====================
    public getSpinState(): SequencialState {
        const self = this;
        const seqState = new SequencialState();
        if (!this.node.active) return seqState;

        let idx = 0;
        const reelCom = this.node.getComponent(Reel);
        const reelStopWindows = SlotGameResultManager.Instance.getReelStopWindows();
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinCtrlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];

        // 预旋转状态
        const preSpinState = ReelSpinBehaviors.Instance.getPreSpinUpDownState(reelCom, reelStopWindows, subGameKey);
        preSpinState.flagSkipActive = true;
        seqState.insert(idx++, preSpinState);

        // 旋转至停止前状态
        const spinBeforeStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReel(SlotManager.Instance.reelMachine.reels, reelCom, reelStrip, subGameKey);
        spinBeforeStopState.flagSkipActive = true;
        spinBeforeStopState.addOnStartCallback(() => {
            reelCom.setShaderValue("blurOffset", 0.02);
        });
        seqState.insert(idx++, spinBeforeStopState);

        // 当前滚轮旋转状态
        const currReelSpinState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReel(reelCom, reelStrip, subGameKey);
        currReelSpinState.flagSkipActive = true;
        seqState.insert(idx++, currReelSpinState);

        // 缓动参数配置
        let easingType = null;
        let easingRate = null;
        let easingDuration = null;
        let easingDistance = null;
        if (spinCtrlInfo) {
            easingType = spinCtrlInfo.postEasingType;
            easingRate = spinCtrlInfo.postEasingRate;
            easingDuration = spinCtrlInfo.postEasingDuration;
            easingDistance = spinCtrlInfo.postEasingDistance;
        }

        // 获取结果数据
        const resultSymbolList = this.getResultSymbolList(reelStopWindows.GetWindow(reelCom.reelindex), reelCom);
        const resultSymbolInfoList = this.getResultSymbolInfoList(reelStopWindows.GetWindow(reelCom.reelindex), reelCom);
        const resultSpecialSymbolInfoList = this.getResultSpecialSymbolInfoList(reelStopWindows.GetWindow(reelCom.reelindex), reelCom);

        // 组装缓动信息
        const easingInfo = new EasingInfo();
        easingInfo.easingType = easingType;
        easingInfo.easingDistance = easingDistance;
        easingInfo.easingDuration = easingDuration;
        easingInfo.easingRate = easingRate;
        easingInfo.onEasingStartFuncList.push(() => {
            self.setShowExpectEffects(false);
        });
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 滚轮移动至目标符号状态
        const reelMoveState = this.getReelMoveStateWithLastSymbolList(reelCom, resultSymbolList, subGameKey, easingInfo, resultSymbolInfoList, resultSpecialSymbolInfoList);
        reelMoveState.addOnEndCallback(() => {
            if (reelCom.reelindex === 4) SlotManager.Instance.stopReelSpinSound();
        });
        seqState.insert(idx++, reelMoveState);

        // 旋转结束收尾状态
        const spinEndState = new State();
        spinEndState.addOnStartCallback(() => {
            reelCom.resetPositionOfReelComponents();
            reelCom.setShaderValue("blurOffset", 0);
            if (reelCom.reelindex === SlotManager.Instance.reelMachine.reels.length - 1) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }
            SlotManager.Instance.setPlayReelExpectEffectState(reelCom.reelindex + 1);
            self.processSpinEnd(spinEndState.setDone.bind(spinEndState));
        });
        seqState.insert(idx++, spinEndState);

        return seqState;
    }

    // ===================== 核心旋转状态 - 完整旋转流程(不含预旋转) =====================
    public getSpinExcludePreSpinState(): SequencialState {
        const self = this;
        const seqState = new SequencialState();
        if (!this.node.active) return seqState;

        let idx = 0;
        const reelCom = this.node.getComponent(Reel);
        const reelStopWindows = SlotGameResultManager.Instance.getReelStopWindows();
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinCtrlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];

        // 旋转至停止前状态
        const spinBeforeStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReel(SlotManager.Instance.reelMachine.reels, reelCom, reelStrip, subGameKey);
        spinBeforeStopState.flagSkipActive = true;
        spinBeforeStopState.addOnStartCallback(() => {
            reelCom.setShaderValue("blurOffset", 0.02);
        });
        seqState.insert(idx++, spinBeforeStopState);

        // 当前滚轮旋转状态
        const currReelSpinState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReel(reelCom, reelStrip, subGameKey);
        currReelSpinState.flagSkipActive = true;
        seqState.insert(idx++, currReelSpinState);

        // 缓动参数配置
        let easingType = null;
        let easingRate = null;
        let easingDuration = null;
        let easingDistance = null;
        if (spinCtrlInfo) {
            easingType = spinCtrlInfo.postEasingType;
            easingRate = spinCtrlInfo.postEasingRate;
            easingDuration = spinCtrlInfo.postEasingDuration;
            easingDistance = spinCtrlInfo.postEasingDistance;
        }

        // 获取结果数据
        const resultSymbolList = this.getResultSymbolList(reelStopWindows.GetWindow(reelCom.reelindex), reelCom);
        const resultSymbolInfoList = this.getResultSymbolInfoList(reelStopWindows.GetWindow(reelCom.reelindex), reelCom);
        const resultSpecialSymbolInfoList = this.getResultSpecialSymbolInfoList(reelStopWindows.GetWindow(reelCom.reelindex), reelCom);

        // 组装缓动信息
        const easingInfo = new EasingInfo();
        easingInfo.easingType = easingType;
        easingInfo.easingDistance = easingDistance;
        easingInfo.easingDuration = easingDuration;
        easingInfo.easingRate = easingRate;
        easingInfo.onEasingStartFuncList.push(() => {
            self.setShowExpectEffects(false);
        });
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 滚轮移动至目标符号状态
        const reelMoveState = this.getReelMoveStateWithLastSymbolList(reelCom, resultSymbolList, subGameKey, easingInfo, resultSymbolInfoList, resultSpecialSymbolInfoList);
        reelMoveState.addOnEndCallback(() => {
            if (reelCom.reelindex === 4) SlotManager.Instance.stopReelSpinSound();
        });
        seqState.insert(idx++, reelMoveState);

        // 旋转结束收尾状态
        const spinEndState = new State();
        spinEndState.addOnStartCallback(() => {
            reelCom.resetPositionOfReelComponents();
            reelCom.setShaderValue("blurOffset", 0);
            if (reelCom.reelindex === SlotManager.Instance.reelMachine.reels.length - 1) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }
            SlotManager.Instance.setPlayReelExpectEffectState(reelCom.reelindex + 1);
            self.processSpinEnd(spinEndState.setDone.bind(spinEndState));
        });
        seqState.insert(idx++, spinEndState);

        return seqState;
    }

    // ===================== 核心旋转状态 - 升级版旋转(不含预旋转+请求时间控制) =====================
    public getSpinExcludePreSpinUsingSpinRequestTimeState(spinRequestTime: any = null, reelMachine: any = null): SequencialState {
        const self = this;
        const seqState = new SequencialState();
        if (!this.node.active) return seqState;

        let idx = 0;
        const reelCom = this.node.getComponent(Reel);
        const targetWindows = spinRequestTime ?? SlotGameResultManager.Instance.getReelStopWindows();
        const targetMachine = reelMachine ?? SlotManager.Instance.reelMachine;
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinCtrlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];

        // 旋转至停止前状态(升级版)
        const spinBeforeStopState = ReelSpinBehaviors.Instance.getReelSpinStateUntileStopBeforeReelRenewal(targetMachine.reels, reelCom, reelStrip, subGameKey);
        spinBeforeStopState.flagSkipActive = true;
        spinBeforeStopState.addOnStartCallback(() => {
            reelCom.setShaderValue("blurOffset", 0.02);
        });
        seqState.insert(idx++, spinBeforeStopState);

        // 当前滚轮旋转状态(升级版)
        const currReelSpinState = ReelSpinBehaviors.Instance.getReelSpinStateCurrentReelRenewal(targetMachine.reels, reelCom, reelStrip, subGameKey);
        currReelSpinState.flagSkipActive = true;
        seqState.insert(idx++, currReelSpinState);

        // 缓动参数配置
        let easingType = null;
        let easingRate = null;
        let easingDuration = null;
        let easingDistance = null;
        if (spinCtrlInfo) {
            easingType = spinCtrlInfo.postEasingType;
            easingRate = spinCtrlInfo.postEasingRate;
            easingDuration = spinCtrlInfo.postEasingDuration;
            easingDistance = spinCtrlInfo.postEasingDistance;
        }

        // 获取结果数据
        const resultSymbolList = this.getResultSymbolList(targetWindows.GetWindow(reelCom.reelindex), reelCom);
        const resultSymbolInfoList = this.getResultSymbolInfoList(targetWindows.GetWindow(reelCom.reelindex), reelCom);
        const resultSpecialSymbolInfoList = this.getResultSpecialSymbolInfoList(targetWindows.GetWindow(reelCom.reelindex), reelCom);

        // 组装缓动信息
        const easingInfo = new EasingInfo();
        easingInfo.easingType = easingType;
        easingInfo.easingDistance = easingDistance;
        easingInfo.easingDuration = easingDuration;
        easingInfo.easingRate = easingRate;
        easingInfo.onEasingStartFuncList.push(() => {
            self.setShowExpectEffects(false);
        });
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 滚轮移动至目标符号状态
        const reelMoveState = this.getReelMoveStateWithLastSymbolList(reelCom, resultSymbolList, subGameKey, easingInfo, resultSymbolInfoList, resultSpecialSymbolInfoList);
        reelMoveState.addOnEndCallback(() => {
            if (reelCom.reelindex === 4) SlotManager.Instance.stopReelSpinSound();
        });
        seqState.insert(idx++, reelMoveState);

        // 旋转结束收尾状态
        const spinEndState = new State();
        spinEndState.addOnStartCallback(() => {
            reelCom.resetPositionOfReelComponents();
            reelCom.setShaderValue("blurOffset", 0);
            if (reelCom.reelindex === targetMachine.reels.length - 1) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }
            SlotManager.Instance.setPlayReelExpectEffectState(reelCom.reelindex + 1);
            self.processSpinEnd(spinEndState.setDone.bind(spinEndState));
        });
        seqState.insert(idx++, spinEndState);

        return seqState;
    }

    // ===================== 核心旋转状态 - 滚轮停止状态 =====================
    public getReelStopState(): SequencialState {
        const self = this;
        const seqState = new SequencialState();
        const reelCom = this.node.getComponent(Reel);
        const reelStopWindows = SlotGameResultManager.Instance.getReelStopWindows();
        const resultSymbolList = this.getResultSymbolList(reelStopWindows.GetWindow(reelCom.reelindex), reelCom);
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const easingInfo = new EasingInfo();
        const spinCtrlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];

        // 缓动参数配置
        let easingType = null;
        let easingRate = null;
        let easingDuration = null;
        let easingDistance = null;
        if (spinCtrlInfo) {
            easingType = spinCtrlInfo.postEasingType;
            easingRate = spinCtrlInfo.postEasingRate;
            easingDuration = spinCtrlInfo.postEasingDuration;
            easingDistance = spinCtrlInfo.postEasingDistance;
        }
        easingInfo.easingType = easingType;
        easingInfo.easingDistance = easingDistance;
        easingInfo.easingDuration = easingDuration;
        easingInfo.easingRate = easingRate;
        easingInfo.onEasingStartFuncList.push(() => {
            self.setShowExpectEffects(false);
        });
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 滚轮移动至目标符号
        seqState.insert(0, this.getReelMoveStateWithLastSymbolList(reelCom, resultSymbolList, subGameKey, easingInfo, null));
        
        // 停止收尾
        const stopEndState = new State();
        stopEndState.addOnStartCallback(() => {
            reelCom.resetPositionOfReelComponents.call(reelCom);
            self.processSpinEnd(stopEndState.setDone.bind(stopEndState));
        });
        seqState.insert(1, stopEndState);

        return seqState;
    }

    // ===================== 业务方法 - 获取滚轮最终停止的符号列表 =====================
    public getResultSymbolList(windowData: any, reelCom: Reel): any[] {
        const symbolList = new Array();
        let offset = 0;
        if (windowData.size < reelCom.visibleRow + 2 * reelCom.bufferRow) {
            offset = (reelCom.visibleRow + 2 * reelCom.bufferRow - windowData.size) / 2;
        }

        for (let i = windowData.size - 1; i >= 0; --i) {
            symbolList.push(windowData.getSymbol(i));
        }
        symbolList.length;

        for (let i = 0; i < offset; ++i) {
            symbolList.push(this.dummySymbolList[Math.floor(Math.random() * this.dummySymbolList.length)]);
        }
        return symbolList;
    }

    // ===================== 业务方法 - 获取滚轮最终停止的符号信息列表 =====================
    public getResultSymbolInfoList(windowData: any, reelCom: Reel): any[] | null {
        let symbolInfoList = null;
        const gameResult = SlotGameResultManager.Instance._gameResult;
        if (gameResult.spinResult.symbolInfoWindow && gameResult.spinResult.symbolInfoWindow[reelCom.reelindex]) {
            symbolInfoList = new Array();
            const targetInfo = gameResult.spinResult.symbolInfoWindow[reelCom.reelindex];
            if (windowData.size >= targetInfo.length) {
                const diff = windowData.size - targetInfo.length;
                for (let i = 0; i < diff / 2; ++i) {
                    symbolInfoList.push(null);
                }
                for (let i = targetInfo.length - 1; i >= 0; --i) {
                    symbolInfoList.push(targetInfo[i]);
                }
            }
        }
        return symbolInfoList;
    }

    // ===================== 业务方法 - 获取滚轮最终停止的特殊符号信息列表 =====================
    public getResultSpecialSymbolInfoList(windowData: any, reelCom: Reel): SpecialSymbolInfo[] {
        const specialInfoList: SpecialSymbolInfo[] = [];
        let offset = 0;
        if (windowData.size < reelCom.visibleRow + 2 * reelCom.bufferRow) {
            offset = (reelCom.visibleRow + 2 * reelCom.bufferRow - windowData.size) / 2;
        }

        const windowRange = SlotManager.Instance.getWindowRange();
        for (let i = windowData.size - 1; i >= 0; --i) {
            let specialType = SpecialType.NONE;
            if (TSUtility.isValid(windowRange[reelCom.reelindex])) {
                if (windowRange[reelCom.reelindex][0] <= i && i < windowRange[reelCom.reelindex][1]) {
                    if (SlotManager.Instance.isCheckSpecialInfo(SpecialType.FEVER, reelCom.reelindex, i)) {
                        specialType |= SpecialType.FEVER;
                    }
                }
            }
            specialInfoList.push(new SpecialSymbolInfo(specialType));
        }

        for (let i = 0; i < offset; ++i) {
            specialInfoList.push(new SpecialSymbolInfo(SpecialType.NONE));
        }
        return specialInfoList;
    }

    // ===================== 业务方法 - 对抗模式 - 获取滚轮最终停止的符号列表 =====================
    public getOppositionResultSymbolList(windowData: any, reelCom: Reel): any[] {
        const symbolList = new Array();
        let offset = 0;
        if (windowData.size < reelCom.visibleRow + 2 * reelCom.bufferRow) {
            offset = (reelCom.visibleRow + 2 * reelCom.bufferRow - windowData.size) / 2;
        }

        for (let i = 0; i < offset; ++i) {
            symbolList.push(this.dummySymbolList[Math.floor(Math.random() * this.dummySymbolList.length)]);
        }
        for (let i = windowData.size - 1; i >= 0; --i) {
            symbolList.push(windowData.getSymbol(i));
        }
        return symbolList;
    }

    // ===================== 业务方法 - 对抗模式 - 获取滚轮最终停止的符号信息列表 =====================
    public getOppositionResultSymbolInfoList(windowData: any, reelCom: Reel): any[] | null {
        let symbolInfoList = null;
        const gameResult = SlotGameResultManager.Instance._gameResult;
        if (gameResult.spinResult.symbolInfoWindow && gameResult.spinResult.symbolInfoWindow[reelCom.reelindex]) {
            symbolInfoList = new Array();
            const targetInfo = gameResult.spinResult.symbolInfoWindow[reelCom.reelindex];
            if (windowData.size >= targetInfo.length) {
                const diff = windowData.size - targetInfo.length;
                for (let i = 0; i < diff / 2; ++i) {
                    symbolInfoList.push(null);
                }
                for (let i = targetInfo.length - 1; i >= 0; --i) {
                    symbolInfoList.push(targetInfo[i]);
                }
            }
        }
        return symbolInfoList;
    }

    // ===================== 业务方法 - 对抗模式 - 获取滚轮最终停止的特殊符号信息列表 =====================
    public getOppositionResultSpecialInfoList(windowData: any, reelCom: Reel): SpecialSymbolInfo[] {
        const specialInfoList: SpecialSymbolInfo[] = [];
        let offset = 0;
        if (windowData.size < reelCom.visibleRow + 2 * reelCom.bufferRow) {
            offset = (reelCom.visibleRow + 2 * reelCom.bufferRow - windowData.size) / 2;
        }

        for (let i = 0; i < offset; ++i) {
            specialInfoList.push(new SpecialSymbolInfo(SpecialType.NONE));
        }
        for (let i = reelCom.visibleRow - 1; i >= 0; --i) {
            let specialType = SpecialType.NONE;
            if (SlotManager.Instance.isCheckSpecialInfo(SpecialType.FEVER, reelCom.reelindex, i)) {
                specialType |= SpecialType.FEVER;
            }
            specialInfoList.push(new SpecialSymbolInfo(specialType));
        }
        return specialInfoList;
    }

    // ===================== 业务方法 - 获取指定位置的符号信息 =====================
    public getResultSymbolInfo(reelIdx: number, posIdx: number): any | null {
        let symbolInfo = null;
        const gameResult = SlotGameResultManager.Instance._gameResult;
        if (gameResult.spinResult.symbolInfoWindow[reelIdx] && gameResult.spinResult.symbolInfoWindow[reelIdx][posIdx]) {
            symbolInfo = gameResult.spinResult.symbolInfoWindow[reelIdx][posIdx];
        }
        return symbolInfo;
    }

    // ===================== 业务方法 - 添加旋转结束的缓动回调函数 =====================
    public addEasingFuncListOnStopEasing(easingInfo: EasingInfo|any): void {
        for (let i = 0; i < this.easingFuncListOnSpinEnd.length; ++i) {
            easingInfo.onEasingStartFuncList.push(this.easingFuncListOnSpinEnd[i]);
        }
    }

    // ===================== 空实现 - 旋转结束处理逻辑 (子类重写) =====================
    public processSpinEnd(callback: Function): void {
        callback();
    }

    // ===================== 状态方法 - 预旋转状态 =====================
    public getPreSpinState(): State {
        const reelCom = this.node.getComponent(Reel);
        const reelStopWindows = SlotGameResultManager.Instance.getReelStopWindows();
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const preSpinState = ReelSpinBehaviors.Instance.getPreSpinUpDownState(reelCom, reelStopWindows, subGameKey);
        preSpinState.flagSkipActive = true;
        return preSpinState;
    }

    // ===================== 状态方法 - 预旋转状态(子游戏Key) =====================
    public getPreSpinUsingNextSubGameKeyState(): State {
        const reelCom = this.node.getComponent(Reel);
        const reelStopWindows = SlotGameResultManager.Instance.getReelStopWindows();
        const subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const preSpinState = ReelSpinBehaviors.Instance.getPreSpinUpDownState(reelCom, reelStopWindows, subGameKey);
        preSpinState.flagSkipActive = true;

        return preSpinState;
    }

    // ===================== 状态方法 - 对抗模式预旋转状态 =====================
    public getOppositionPreSpinDownUpState(): State {
        const reelCom = this.node.getComponent(Reel);
        const reelStopWindows = SlotGameResultManager.Instance.getReelStopWindows();
        const subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const preSpinState = ReelSpinBehaviors.Instance.getOppositionPreSpinDownUpState(reelCom, reelStopWindows, subGameKey);
        preSpinState.flagSkipActive = true;
        return preSpinState;
    }

    // ===================== 状态方法 - 无限旋转状态(子游戏Key) =====================
    public getInfiniteSpinUsingNextSubGameKeyState(): State {
        const subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        return ReelSpinBehaviors.Instance.getInfiniteSpinStatePreResponseResult(this.node.getComponent(Reel), subGameKey);
    }

    // ===================== 状态方法 - 无限旋转状态(指定子游戏Key) =====================
    public getInfiniteSpinUsingSubGameKeyState(subGameKey: string): State {
        const reelCom = this.node.getComponent(Reel);
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        return ReelSpinBehaviors.Instance.getInfiniteSpinState(reelCom, reelStrip, subGameKey);
    }

    // ===================== 状态方法 - 对抗模式无限旋转状态 =====================
    public getOppositionInfiniteSpinUsingNextSubGameKeyState(): State {
        const reelCom = this.node.getComponent(Reel);
        const subGameKey = SlotGameResultManager.Instance.getNextSubGameKey();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        return ReelSpinBehaviors.Instance.getOppositionInfiniteSpinState(reelCom, reelStrip, subGameKey);
    }

    // ===================== 状态方法 - 无限旋转状态 =====================
    public getInfiniteSpinState(param: any = null): State {
        const reelCom = this.node.getComponent(Reel);
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
        return ReelSpinBehaviors.Instance.getInfiniteSpinState(reelCom, reelStrip, subGameKey, param);
    }

    // ===================== 状态方法 - 有限旋转状态 =====================
    public getFiniteSpinState(duration: number, speed: number, accel: number, decel: number): State {
        const reelCom = this.node.getComponent(Reel);
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];
        return ReelSpinBehaviors.Instance.getFiniteSpinState(reelCom, reelStrip, duration, subGameKey, speed, accel, decel);
    }

    // ===================== 状态方法 - 符号渐隐为空状态 =====================
    public getShowLastSymbolToBlank(): State {
        const reelCom = this.node.getComponent(Reel);
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        return ReelSpinBehaviors.Instance.getShowLastSymbolToBlank(reelCom, reelStrip, 0.05, subGameKey);
    }

    // ===================== 业务方法 - 显示/隐藏期待特效 =====================
    public setShowExpectEffects(isShow: boolean): void {
        if (isShow && SlotManager.Instance.isSkipCurrentSpin) return;
        for (let i = 0; i < this.expectEffects.length; ++i) {
            if (this.expectEffects[i]) this.expectEffects[i].active = isShow;
        }
    }

    // ===================== 业务方法 - 播放滚轮停止音效 =====================
    public playReelStopSound(): void {
        const reelCom = this.node.getComponent(Reel);
        if (SlotManager.Instance.isSkipCurrentSpin && reelCom.reelindex !== SlotManager.Instance.reelMachine.reels.length - 1) return;
        SlotSoundController.Instance().playAudio("ReelStop", "FX");
    }

    // ===================== 业务方法 - 获取随机占位符号 =====================
    public getDummySymbol(): any | null {
        return this.dummySymbolList.length === 0 ? null : this.dummySymbolList[Math.floor(Math.random() * this.dummySymbolList.length)];
    }

    // ===================== 空实现 - 符号下落结束处理 (子类重写) =====================
    public processSymbolCascadeEnd(reelCom: Reel|number, symbolList: any, easingInfo: EasingInfo|any, callback: Function): void {
        if (callback) callback();
    }

    // ===================== 核心旋转状态 - 对抗模式完整旋转流程 =====================
    public getOppositionSpinState(): SequencialState {
        const self = this;
        const seqState = new SequencialState();
        if (!this.node.active) return seqState;

        let idx = 0;
        const reelCom = this.node.getComponent(Reel);
        const reelStopWindows = SlotGameResultManager.Instance.getReelStopWindows();
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinCtrlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];

        // 对抗模式预旋转
        const preSpinState = ReelSpinBehaviors.Instance.getOppositionPreSpinDownUpState(reelCom, reelStopWindows, subGameKey);
        preSpinState.flagSkipActive = true;
        seqState.insert(idx++, preSpinState);

        // 对抗模式旋转至停止前
        const spinBeforeStopState = ReelSpinBehaviors.Instance.getReelOppositionSpinStateUntileStopBeforeReel(SlotManager.Instance.reelMachine.reels, reelCom, reelStrip, subGameKey);
        spinBeforeStopState.flagSkipActive = true;
        spinBeforeStopState.addOnStartCallback(() => {
            reelCom.setShaderValue("blurOffset", 0.02);
        });
        seqState.insert(idx++, spinBeforeStopState);

        // 对抗模式当前滚轮旋转
        const currReelSpinState = ReelSpinBehaviors.Instance.getReelOppositionSpinStateCurrentReel(reelCom, reelStrip, subGameKey);
        currReelSpinState.flagSkipActive = true;
        seqState.insert(idx++, currReelSpinState);

        // 缓动参数配置
        let easingType = null;
        let easingRate = null;
        let easingDuration = null;
        let easingDistance = null;
        if (spinCtrlInfo) {
            easingType = spinCtrlInfo.postEasingType;
            easingRate = spinCtrlInfo.postEasingRate;
            easingDuration = spinCtrlInfo.postEasingDuration;
            easingDistance = spinCtrlInfo.postEasingDistance;
        }

        // 获取对抗模式结果数据
        const resultSymbolList = this.getOppositionResultSymbolList(reelStopWindows.GetWindow(reelCom.reelindex), reelCom);
        const resultSymbolInfoList = this.getOppositionResultSymbolInfoList(reelStopWindows.GetWindow(reelCom.reelindex), reelCom);
        const resultSpecialInfoList = this.getOppositionResultSpecialInfoList(reelStopWindows.GetWindow(reelCom.reelindex), reelCom);

        // 组装缓动信息
        const easingInfo = new EasingInfo();
        easingInfo.easingType = easingType;
        easingInfo.easingDistance = easingDistance;
        easingInfo.easingDuration = easingDuration;
        easingInfo.easingRate = easingRate;
        easingInfo.onEasingStartFuncList.push(() => {
            self.setShowExpectEffects(false);
        });
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 对抗模式滚轮移动
        const reelMoveState = this.getReelOppositionMoveStateWithLastSymbolListNew(reelCom, resultSymbolList, subGameKey, easingInfo, resultSymbolInfoList, resultSpecialInfoList);
        reelMoveState.addOnEndCallback(() => {
            if (reelCom.reelindex === 4) SlotManager.Instance.stopReelSpinSound();
        });
        seqState.insert(idx++, reelMoveState);

        // 对抗模式旋转结束收尾
        const spinEndState = new State();
        spinEndState.addOnStartCallback(() => {
            reelCom.resetPositionOfReelComponents();
            reelCom.setShaderValue("blurOffset", 0);
            if (reelCom.reelindex === SlotManager.Instance.reelMachine.reels.length - 1) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }
            SlotManager.Instance.setPlayReelExpectEffectState(reelCom.reelindex + 1);
            self.processSpinEnd(spinEndState.setDone.bind(spinEndState));
        });
        seqState.insert(idx++, spinEndState);

        return seqState;
    }

    // ===================== 核心旋转状态 - 对抗模式升级版旋转(不含预旋转) =====================
    public getOppositionSpinExcludePreSpinUsingSpinRequestTimeState(spinRequestTime: any = null): SequencialState {
        const self = this;
        const seqState = new SequencialState();
        if (!this.node.active) return seqState;

        let idx = 0;
        const reelCom = this.node.getComponent(Reel);
        const targetWindows = spinRequestTime ?? SlotGameResultManager.Instance.getReelStopWindows();
        const subGameKey = SlotGameResultManager.Instance.getSubGameKeyOfCurrentGameResult();
        const reelStrip = SlotGameRuleManager.Instance.getReelStrip(subGameKey);
        const spinCtrlInfo = SlotUIRuleManager.Instance.getSpinControlInfo(subGameKey).infoList[reelCom.reelindex];

        // 对抗模式旋转至停止前
        const spinBeforeStopState = ReelSpinBehaviors.Instance.getReelOppositionSpinStateUntileStopBeforeReel(SlotManager.Instance.reelMachine.reels, reelCom, reelStrip, subGameKey);
        spinBeforeStopState.flagSkipActive = true;
        spinBeforeStopState.addOnStartCallback(() => {
            reelCom.setShaderValue("blurOffset", 0.02);
        });
        seqState.insert(idx++, spinBeforeStopState);

        // 对抗模式当前滚轮旋转
        const currReelSpinState = ReelSpinBehaviors.Instance.getReelOppositionSpinStateCurrentReel(reelCom, reelStrip, subGameKey);
        currReelSpinState.flagSkipActive = true;
        seqState.insert(idx++, currReelSpinState);

        // 缓动参数配置
        let easingType = null;
        let easingRate = null;
        let easingDuration = null;
        let easingDistance = null;
        if (spinCtrlInfo) {
            easingType = spinCtrlInfo.postEasingType;
            easingRate = spinCtrlInfo.postEasingRate;
            easingDuration = spinCtrlInfo.postEasingDuration;
            easingDistance = spinCtrlInfo.postEasingDistance;
        }

        // 获取对抗模式结果数据
        const resultSymbolList = this.getOppositionResultSymbolList(targetWindows.GetWindow(reelCom.reelindex), reelCom);
        const resultSymbolInfoList = this.getOppositionResultSymbolInfoList(targetWindows.GetWindow(reelCom.reelindex), reelCom);
        const resultSpecialInfoList = this.getOppositionResultSpecialInfoList(targetWindows.GetWindow(reelCom.reelindex), reelCom);

        // 组装缓动信息
        const easingInfo = new EasingInfo();
        easingInfo.easingType = easingType;
        easingInfo.easingDistance = easingDistance;
        easingInfo.easingDuration = easingDuration;
        easingInfo.easingRate = easingRate;
        easingInfo.onEasingStartFuncList.push(() => {
            self.setShowExpectEffects(false);
        });
        this.addEasingFuncListOnStopEasing(easingInfo);

        // 对抗模式滚轮移动
        const reelMoveState = this.getReelOppositionMoveStateWithLastSymbolListNew(reelCom, resultSymbolList, subGameKey, easingInfo, resultSymbolInfoList, resultSpecialInfoList);
        reelMoveState.addOnEndCallback(() => {
            if (reelCom.reelindex === 4) SlotManager.Instance.stopReelSpinSound();
        });
        seqState.insert(idx++, reelMoveState);

        // 对抗模式旋转结束收尾
        const spinEndState = new State();
        spinEndState.addOnStartCallback(() => {
            reelCom.resetPositionOfReelComponents();
            reelCom.setShaderValue("blurOffset", 0);
            if (reelCom.reelindex === SlotManager.Instance.reelMachine.reels.length - 1) {
                SoundManager.Instance().resetTemporarilyMainVolume();
            }
            SlotManager.Instance.setPlayReelExpectEffectState(reelCom.reelindex + 1);
            self.processSpinEnd(spinEndState.setDone.bind(spinEndState));
        });
        seqState.insert(idx++, spinEndState);

        return seqState;
    }

    // ===================== 状态封装 - 滚轮移动至目标符号(含结束事件) =====================
    public getReelMoveStateWithLastSymbolList(reelCom: Reel, symbolList: any[], subGameKey: string, easingInfo: EasingInfo, symbolInfoList: any[] = null, specialInfoList: any[] = null): SequencialState {
        const seqState = new SequencialState();
        seqState.name = "LastSymbolList"
        let idx = 0;
        seqState.insert(idx++, ReelSpinBehaviors.Instance.getReelMoveStateWithLastSymbolListNew(reelCom, symbolList, subGameKey, easingInfo, symbolInfoList, specialInfoList));
        seqState.insert(idx++, this.getSpinEndEventState());
        return seqState;
    }

    // ===================== 状态封装 - 滚轮移动至目标符号(含空白符号+结束事件) =====================
    public getReelMoveStateWithLastSymbolListContainBlankSymbolNew(reelCom: Reel, symbolList: any[], subGameKey: string, easingInfo: EasingInfo, symbolInfoList: any = null, specialInfoList: any[] = null, blankSymbol: any = null): SequencialState {
        const seqState = new SequencialState();
        let idx = 0;
        seqState.insert(idx++, ReelSpinBehaviors.Instance.getReelMoveStateWithLastSymbolListContainBlankSymbolNew(reelCom, symbolList, subGameKey, easingInfo, symbolInfoList, specialInfoList, blankSymbol));
        seqState.insert(idx++, this.getSpinEndEventState());
        return seqState;
    }

    // ===================== 状态封装 - 对抗模式滚轮移动至目标符号(含结束事件) =====================
    public getReelOppositionMoveStateWithLastSymbolListNew(reelCom: Reel, symbolList: any[], subGameKey: string, easingInfo: EasingInfo, symbolInfoList: any[] = null, specialInfoList: any[] = null): SequencialState {
        const seqState = new SequencialState();
        let idx = 0;
        seqState.insert(idx++, ReelSpinBehaviors.Instance.getReelOppositionMoveStateWithLastSymbolListNew(reelCom, symbolList, subGameKey, easingInfo, symbolInfoList, specialInfoList));
        seqState.insert(idx++, this.getSpinEndEventState());
        return seqState;
    }

    // ===================== 状态封装 - 旋转结束事件链 =====================
    public getSpinEndEventState(): SequencialState {
        const seqState = new SequencialState();
        let idx = 0;
        seqState.insert(idx++, this.getSendSpecialModeState());
        seqState.insert(idx++, this.getSpinEndAddtionalEventState());
        return seqState;
    }

    // ===================== 空实现 - 旋转结束附加事件 (子类重写) =====================
    public getSpinEndAddtionalEventState(): SequencialState {
        return new SequencialState();
    }

    // ===================== 工具方法 - 判断滚轮是否未激活 =====================
    public isDeActiveReel(): boolean {
        return !this.node.active;
    }

    // ===================== 状态方法 - 发送特殊模式消息 =====================
    public getSendSpecialModeState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            const reelCom = self.node.getComponent(Reel);
            if (TSUtility.isValid(reelCom)) reelCom.sendSpecialModeMessage();
            state.setDone();
        });
        return state;
    }
}
