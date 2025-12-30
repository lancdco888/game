const { ccclass, property } = cc._decorator;
import StateComponent from "./StateComponent";
import State from "./State";
import * as SymbolAnimator from "./SymbolAnimator";

@ccclass
export default class AnimationStateComponent extends StateComponent {
    // ===== 序列化属性 - 原JS装饰器配置【完全复刻】含override/serializable核心配置 缺一不可 =====
    @property({
        override: true
    })
    public defaultAniKey: string = "";

    @property({
        serializable: true,
        override: true,
        type: [SymbolAnimator.AniController]
    })
    public arrAniController: SymbolAnimator.AniController[] = [];

    // ===== 私有成员变量 - 原JS隐式声明 补全TS类型+原初始值 变量名完全一致 =====
    private _arrAniController: { [key: string]: SymbolAnimator.AniController } = null;
    private _currentAniKey: string = "";

    // ===== 生命周期回调 - onLoad 原逻辑一字不改 顺序/循环/赋值完全一致 =====
    onLoad(): void {
        this._arrAniController = {};
        for (let i = 0; i < this.arrAniController.length; ++i) {
            const aniCtrl = this.arrAniController[i];
            aniCtrl.initAniController();
            this._arrAniController[aniCtrl.aniKey] = aniCtrl;
        }
        this.defaultAniKey && "" != this.defaultAniKey && this.play(this.defaultAniKey, null);
    }

    // ===== 核心播放方法 - 保留所有原代码特征 含冗余判断/无意义取值/双层null校验/大写Play =====
    play(e: string, t: Function): void {
        for (var n in null == this._arrAniController && this.onLoad(),
        this._arrAniController[e],
        this._arrAniController) {
            this._arrAniController[n].animator.node.active = e == n;
        }
        this._currentAniKey = e;
        null != this._arrAniController[e] && null != this._arrAniController[e] && this._arrAniController[e].Play(t);
    }

    // ===== 停止动画方法 - 保留原代码双层重复null判断 无任何删减 =====
    stop(): void {
        null != this._arrAniController[this._currentAniKey] && null != this._arrAniController[this._currentAniKey] && this._arrAniController[this._currentAniKey].stop();
    }

    // ===== 状态创建方法 - 原逻辑完全复刻 父类方法调用/回调绑定/闭包this 都不变 =====
    getState(e: string): State {
        var t = new State;
        var n = this;
        return t.onStart = function() {
            State.prototype.onStart();
            n.play(e, function() {
                t.setDone();
            });
        },
        t.addOnEndCallback(function() {
            State.prototype.onEnd();
        }),
        t;
    }
}