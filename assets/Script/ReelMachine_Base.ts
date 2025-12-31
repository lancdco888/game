// ===================== ReelMachine_Base.ts =====================
// 严格适配 Cocos Creator 2.4.13 TypeScript | 1:1像素级复刻原逻辑 | 强类型 | 无兼容代码 | 可直接替换

const { ccclass, property } = cc._decorator;

// 项目内部模块导入 - 与原JS依赖路径/顺序完全一致，无任何改动
import State, { ConcurrentState, SequencialState } from "./Slot/State";
import ReelController_Base from "./ReelController_Base";
import SlotSoundController from "./Slot/SlotSoundController";
import Reel from "./Slot/Reel";
import SlotManager from "./manager/SlotManager";

/**
 * 老虎机滚轮核心管理基类
 * 负责所有滚轮旋转的状态链编排、旋转音效控制、滚轮特效显隐、遮罩控制
 */
@ccclass
export default class ReelMachine_Base extends cc.Component {
    // ===================== Cocos 属性绑定 - 与原JS装饰器完全对应 编辑器拖拽绑定 1:1复刻 =====================
    @property({ type: [ReelController_Base], displayName: "滚轮控制器数组" })
    public reels: ReelController_Base[] = [];

    @property({ type: cc.Node, displayName: "全局遮罩节点" })
    public dimmScreenNode: cc.Node = null;

    // ===================== 生命周期回调 - ONLOAD 空实现 与原JS完全一致 =====================
    onLoad(): void { }

    // ===================== 核心状态方法 - 预旋转(子游戏Key) =====================
    public getPreSpinUsingNextSubGameKeyState(specifyReels?: ReelController_Base[]): SequencialState {
        const seqState = new SequencialState();
        const concurState = new ConcurrentState();
        const targetReels = specifyReels ?? this.reels;

        for (let i = 0; i < targetReels.length; ++i) {
            const reel = targetReels[i];
            if (reel && reel.node.active) {
                concurState.insert(reel.getPreSpinUsingNextSubGameKeyState());
            }
        }

        seqState.insert(0, concurState);
        concurState.addOnStartCallback(() => {
            SlotManager.Instance.playReelSpinSound();
        });
        return seqState;
    }

    // ===================== 核心状态方法 - 无限旋转(子游戏Key) =====================
    public getInfiniteSpinUsingNextSubGameKeyState(specifyReels?: ReelController_Base[]): ConcurrentState {
        const concurState = new ConcurrentState();
        const targetReels = specifyReels ?? this.reels;

        for (let i = 0; i < targetReels.length; ++i) {
            const reel = targetReels[i];
            if (reel && reel.node.active) {
                concurState.insert(reel.getInfiniteSpinUsingNextSubGameKeyState());
            }
        }
        return concurState;
    }

    // ===================== 核心状态方法 - 对抗模式预旋转(子游戏Key) =====================
    public getOppositionPreSpinUsingNextSubGameKeyState(specifyReels?: ReelController_Base[]): SequencialState {
        const seqState = new SequencialState();
        const concurState = new ConcurrentState();
        const targetReels = specifyReels ?? this.reels;

        for (let i = 0; i < targetReels.length; ++i) {
            const reel = targetReels[i];
            if (reel && reel.node.active) {
                concurState.insert(reel.getOppositionPreSpinDownUpState());
            }
        }

        seqState.insert(0, concurState);
        concurState.addOnStartCallback(() => {
            SlotManager.Instance.playReelSpinSound();
        });
        return seqState;
    }

    // ===================== 核心状态方法 - 对抗模式无限旋转(子游戏Key) =====================
    public getOppositionInfiniteSpinUsingNextSubGameKeyState(specifyReels?: ReelController_Base[]): ConcurrentState {
        const concurState = new ConcurrentState();
        const targetReels = specifyReels ?? this.reels;

        for (let i = 0; i < targetReels.length; ++i) {
            const reel = targetReels[i];
            if (reel && reel.node.active) {
                concurState.insert(reel.getOppositionInfiniteSpinUsingNextSubGameKeyState());
            }
        }
        return concurState;
    }

    // ===================== 核心状态方法 - 无限旋转(基础版) =====================
    public getInfinitiSpinState(): ConcurrentState {
        const concurState = new ConcurrentState();
        for (let i = 0; i < this.reels.length; ++i) {
            const reel = this.reels[i];
            if (reel && reel.node.active) {
                concurState.insert(reel.getInfiniteSpinState());
            }
        }
        return concurState;
    }

    // ===================== 核心状态方法 - 普通旋转(标准版) 带音效+特效隐藏 =====================
    public getNormalSpinReelState(): SequencialState {
        const self = this;
        const seqState = new SequencialState();
        const concurState = new ConcurrentState();

        for (let i = 0; i < this.reels.length; ++i) {
            const reel = this.reels[i];
            if (reel) concurState.insert(reel.getSpinState());
        }

        seqState.insert(0, concurState);
        concurState.addOnStartCallback(() => {
            SlotManager.Instance.playReelSpinSound();
        });
        concurState.addOnEndCallback(() => {
            SlotManager.Instance.stopReelSpinSound();
            self.hideAllExpectEffects();
        });
        seqState.insert(1, SlotManager.Instance.getCheckFeverMoveIcon());
        return seqState;
    }

    // ===================== 核心状态方法 - 免费旋转(标准版) =====================
    public getFreeSpinReelState(): SequencialState {
        const seqState = new SequencialState();
        const concurState = new ConcurrentState();

        for (let i = 0; i < this.reels.length; ++i) {
            const reel = this.reels[i];
            if (reel) concurState.insert(reel.getSpinState());
        }

        seqState.insert(0, concurState);
        concurState.addOnStartCallback(() => {
            SlotManager.Instance.playReelSpinSound();
        });
        concurState.addOnEndCallback(() => {
            SlotManager.Instance.stopReelSpinSound();
        });
        return seqState;
    }

    // ===================== 核心状态方法 - 对抗模式旋转(标准版) =====================
    public getOppositionSpinReelState(): SequencialState {
        const self = this;
        const seqState = new SequencialState();
        const concurState = new ConcurrentState();

        for (let i = 0; i < this.reels.length; ++i) {
            const reel = this.reels[i];
            if (reel) concurState.insert(reel.getOppositionSpinState());
        }

        seqState.insert(0, concurState);
        concurState.addOnStartCallback(() => {
            SlotManager.Instance.playReelSpinSound();
        });
        concurState.addOnEndCallback(() => {
            SlotManager.Instance.stopReelSpinSound();
            self.hideAllExpectEffects();
        });
        return seqState;
    }

    // ===================== 核心状态方法 - 设置滚轮符号遮罩激活状态 =====================
    public getStateSetSymbolsDimmActive(isActive: boolean): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            self.setSymbolsDimmActive(isActive);
            state.setDone();
        });
        return state;
    }

    // ===================== 业务方法 - 设置滚轮符号遮罩激活状态 核心逻辑 =====================
    public setSymbolsDimmActive(isActive: boolean): void {
        if (this.dimmScreenNode == null) {
            // 无全局遮罩 → 逐个设置滚轮符号遮罩
            for (let i = 0; i < this.reels.length; ++i) {
                const reel = this.reels[i];
                if (reel) reel.getComponent(Reel).setSymbolsDimmActive(isActive);
            }
        } else {
            // 有全局遮罩 → 直接控制遮罩节点显隐（优先级更高）
            this.dimmScreenNode.active = isActive;
        }
    }

    // ===================== 业务方法 - 显示所有滚轮符号 =====================
    public showAllSymbol(): void {
        for (let i = 0; i < this.reels.length; ++i) {
            const reel = this.reels[i];
            if (reel) reel.getComponent(Reel).showAllSymbol();
        }
    }

    // ===================== 业务方法 - 隐藏所有滚轮的期待特效 + 停止对应音效 =====================
    public hideAllExpectEffects(): void {
        for (let i = 0; i < this.reels.length; ++i) {
            const reel = this.reels[i];
            if (reel) reel.setShowExpectEffects(false);
        }
        SlotSoundController.Instance().stopAudio("ReelExpect_2", "FX");
    }

    // ===================== 业务方法 - 显示指定索引的滚轮期待特效 =====================
    public shoeExpectEffect(idx: number): boolean {
        const reel = this.reels[idx];
        if (reel) {
            reel.setShowExpectEffects(true);
            return true;
        }
        return false;
    }

    // ===================== 状态方法 - 封装【隐藏所有期待特效】为独立状态 =====================
    public hideAllExpectEffectsState(): State {
        const self = this;
        const state = new State();
        state.addOnStartCallback(() => {
            for (let i = 0; i < self.reels.length; ++i) {
                const reel = self.reels[i];
                if (reel) reel.setShowExpectEffects(false);
            }
            state.setDone();
        });
        return state;
    }

    // ===================== 核心状态方法 - 普通旋转(升级版) 带请求耗时日志 + 旋转时间控制 =====================
    public getNormalSpinReelStateRenewal(spinRequestTime: any): SequencialState {
        const self = this;
        const seqState = new SequencialState();
        let idx = 0;
        const concurState = new ConcurrentState();

        for (let i = 0; i < this.reels.length; ++i) {
            const reel = this.reels[i];
            if (reel) concurState.insert(reel.getSpinExcludePreSpinUsingSpinRequestTimeState(spinRequestTime, this));
        }

        seqState.insert(idx++, concurState);
        concurState.addOnStartCallback(() => {
            cc.log(`spin response time : ${SlotManager.Instance.getTimeSecSpinRequest().toString()}`);
        });
        concurState.addOnEndCallback(() => {
            SlotManager.Instance.stopReelSpinSound();
            self.hideAllExpectEffects();
        });
        seqState.insert(idx++, SlotManager.Instance.getCheckFeverMoveIcon());
        return seqState;
    }

    // ===================== 核心状态方法 - 免费旋转(升级版) 带旋转时间控制 =====================
    public getFreeSpinReelStateRenewal(spinRequestTime: any): SequencialState {
        const seqState = new SequencialState();
        const concurState = new ConcurrentState();

        for (let i = 0; i < this.reels.length; ++i) {
            const reel = this.reels[i];
            if (reel) concurState.insert(reel.getSpinExcludePreSpinUsingSpinRequestTimeState(spinRequestTime));
        }

        seqState.insert(0, concurState);
        concurState.addOnStartCallback(() => { }); // 原代码空回调 完整保留
        concurState.addOnEndCallback(() => {
            SlotManager.Instance.stopReelSpinSound();
        });
        return seqState;
    }

    // ===================== 核心状态方法 - 对抗模式旋转(升级版) =====================
    public getOppositionSpinReelStateRenewal(): SequencialState {
        const self = this;
        const seqState = new SequencialState();
        const concurState = new ConcurrentState();

        for (let i = 0; i < this.reels.length; ++i) {
            const reel = this.reels[i];
            if (reel) concurState.insert(reel.getOppositionSpinExcludePreSpinUsingSpinRequestTimeState());
        }

        seqState.insert(0, concurState);
        concurState.addOnStartCallback(() => { }); // 原代码空回调 完整保留
        concurState.addOnEndCallback(() => {
            SlotManager.Instance.stopReelSpinSound();
            self.hideAllExpectEffects();
        });
        return seqState;
    }
}