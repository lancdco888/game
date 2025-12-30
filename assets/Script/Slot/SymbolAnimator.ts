const { ccclass, property } = cc._decorator;
import SoundManager from "../manager/SoundManager";
import StateComponent from "./StateComponent";
import State from "./State";

/** 动画控制器实体类 - 原JS内联AniController，【核心保留大写Play/小写stop】，序列化配置完全复刻 */
@ccclass("AniController")
export class AniController {
    // ===== 序列化属性 - 原JS @property配置100%复刻，类型/变量名/默认值完全一致 =====
    @property({ type: cc.Animation })
    public animator: cc.Animation = null;

    @property({ type: cc.String })
    public aniKey: string = "";

    @property({ type: cc.String })
    public clipName: string = "";

    @property({ type: cc.AudioClip })
    public audioClip: cc.AudioClip = null;

    // ===== 私有隐式变量 - 原JS未声明直接使用，补全TS类型+初始化，变量名完全保留 =====
    private _onEndCallback: Function = null;
    private _clip: cc.AnimationClip = null;

    // ===== 核心播放方法 - 【重中之重 严格保留大写Play】，原逻辑一字不改，含音频播放冗余判断 =====
    Play(callback: Function): void {
        this._onEndCallback = callback;
        this.animator.play(this.clipName);
        // 原JS冗余的音频判空逻辑，严格保留：audioClip存在 + 转字符串非空
        this.audioClip && "" != this.audioClip.toString() && SoundManager.Instance().playBGM(this.audioClip);
    }

    // ===== 停止动画方法 - 【严格保留小写stop】，原逻辑完全复刻 =====
    stop(): void {
        this.animator.setCurrentTime(this._clip.duration, this.clipName);
    }

    // ===== 初始化动画控制器 - 原逻辑完全复刻，含动画事件绑定/日志打印/报错提示 =====
    initAniController(): void {
        const clips = this.animator.getClips();
        for (let i = 0; i < clips.length; ++i) {
            const clip = clips[i];
            if (clip.name == this.clipName) {
                const callbackName = "onEndAni_" + clip.name;
                // 绑定动画结束回调到animator实例，闭包this绑定，原写法完全保留
                this.animator[callbackName] = function () {
                    this._onEndCallback && (this._onEndCallback(), this._onEndCallback = null);
                }.bind(this);
                // 原日志打印，完全保留
                cc.log("initAniController duration: ", clip.name, " ", clip.duration);
                // 动画帧事件配置，原对象结构完全不变
                const event = {
                    frame: clip.duration,
                    func: callbackName,
                    params: []
                };
                clip.events.push(event);
                this._clip = clip;
                return;
            }
        }
        // 原错误提示，完全保留
        cc.error("not found clip:", this.clipName);
    }
}

/** 符号动画核心控制器 - 继承StateComponent，原逻辑完全复刻，与AnimationStateComponent逻辑一致 */
@ccclass
export default class SymbolAnimator extends StateComponent {
    // ===== 序列化属性 - 原JS @property配置100%复刻，含serializable:true核心配置，缺一不可 =====
    @property({ type: cc.String })
    public symbolId: string = "";

    @property({ type: cc.String })
    public defaultAniKey: string = "";

    @property({
        serializable: true,
        type: [AniController]
    })
    public arrAniController: AniController[] = [];

    // ===== 私有成员变量 - 原JS声明+初始化，变量名/默认值完全一致 =====
    private _arrAniController: { [key: string]: AniController } = {};
    private _currentAniKey: string = "";

    // ===== 生命周期回调 - onLoad 原逻辑一字不改，遍历初始化动画控制器+默认播放 =====
    onLoad(): void {
        for (let i = 0; i < this.arrAniController.length; ++i) {
            const aniCtrl = this.arrAniController[i];
            aniCtrl.initAniController();
            this._arrAniController[aniCtrl.aniKey] = aniCtrl;
        }
        this.defaultAniKey && "" != this.defaultAniKey && this.play(this.defaultAniKey, null);
    }

    // ===== 核心播放方法 - 原逻辑完全复刻，含错误日志提示+大写Play调用 =====
    play(aniKey: string, callback: Function): void {
        this._arrAniController[aniKey] || cc.error("SymbolAnimator play. not found aniKey: ", aniKey, " ", this.name);
        this._currentAniKey = aniKey;
        this._arrAniController[aniKey].Play(callback);
    }

    // ===== 停止动画方法 - 原逻辑完全复刻，调用小写stop =====
    stop(): void {
        this._arrAniController[this._currentAniKey].stop();
    }

    // ===== 状态创建方法 - 与AnimationStateComponent完全一致，原逻辑复刻，闭包+父类方法调用 =====
    getState(aniKey: string): State {
        var t = new State;
        var n = this;
        return t.onStart = function () {
            State.prototype.onStart();
            n.play(aniKey, function () {
                t.setDone();
            });
        },
        t.addOnEndCallback(function () {
            State.prototype.onEnd();
        }),
        t;
    }
}