// Cocos Creator 2.x 标准头部解构写法 (严格按要求置顶)
const { ccclass, property } = cc._decorator;

// 导入依赖模块 - 路径与原混淆JS完全一致，无任何修改
import SoundManager from "./manager/SoundManager";
import TSUtility from "./global_utility/TSUtility";
import { Utility } from "./global_utility/Utility";

/**
 * 幸运大奖转盘 核心单转盘元素组件
 * 转盘玩法的核心底层组件：实现转盘闲置自转、抽奖加速旋转、物理减速停位、指针联动、中奖特效全套逻辑
 */
@ccclass
export default class ThrillJackpotWheelElement extends cc.Component {
    // ===================== 序列化绑定属性 (与原代码完全一致，顺序不变，编辑器拖拽绑定) =====================
    @property(cc.Node)
    public wheel_Node: cc.Node = null;

    @property(cc.Node)
    public root_Pin_Node: cc.Node = null;

    @property([cc.Animation])
    public frameLights: cc.Animation[] = [];

    @property([cc.Node])
    public fxIdle: cc.Node[] = [];

    @property([cc.Node])
    public fxSpin: cc.Node[] = [];

    @property([cc.Node])
    public fxWins: cc.Node[] = [];

    @property(cc.Node)
    public m_WheelPin: cc.Node = null;

    @property([cc.Float])
    public rangePinDegreeForPinSpin: number[] = [];

    @property([cc.Float])
    public rangeWheelDegreeForPinSpin: number[] = [];

    @property
    public wheel_type: number = 0;

    // ===================== 私有成员变量 (原代码全部保留，补全类型注解，初始值完全一致) =====================
    private _winCount: number = 0;
    private _targetNum: number = 0;
    private _targetAngle: number = 0;
    private _reserveJackpot: boolean = false;
    private _endCallback: Function = null;
    public _modeIdle: boolean = true; // 外部调用过，保留public
    private _startSpin: boolean = false;
    private m_WheelMode: number = 0;
    private m_WheelDegree1: number = 0;
    private m_WheelDegree2: number = 0;
    private m_Speed: number = 0;
    private m_WheelOutDegree2: number = 0;
    private m_IdleSpeed: number = 15; // 闲置自转速度
    private _soundSetter: any = null;
    private _endSpinFunc: Function = null;
    private beforeState: number = -1;
    private _playOncePinDrop: boolean = false;

    // ===================== 生命周期回调 =====================
    onLoad(): void {
        // 初始化进入闲置动画状态
        this.onIdleAni();
        // 根据转盘类型初始化单格角度值 核心规则
        if (this.wheel_type === 0) {
            this._targetAngle = 30;
        } else if (this.wheel_type === 1) {
            this._targetAngle = 22.5;
        } else {
            this._targetAngle = 18;
        }
    }

    // ===================== 对外初始化方法 =====================
    public init(soundSetter: any): void {
        this._soundSetter = soundSetter;
    }

    // ===================== 转盘缩放动画状态切换 =====================
    public onPlayScaleAni(state: number): void {
        // 特殊修正逻辑：2型转盘 上一个状态1切3 → 强制切4
        if (this.wheel_type === 2 && this.beforeState === 1 && state === 3) {
            state = 4;
        }
        this.beforeState = state;
    }

    // ===================== 核心-播放闲置动画 =====================
    public onIdleAni(): void {
        this.fxIdle.forEach(node => node.active = true);
        this.fxSpin.forEach(node => node.active = false);
        this.fxWins.forEach(node => node.active = false);
        this.frameLights.forEach(ani => {
            ani.stop();
            ani.play("Wheel_FrameNeon_Idle_Ani", 0);
        });
    }

    // ===================== 空实现方法 (原代码保留，预留扩展) =====================
    public setIdleBet(): void {}
    public setIdleEffect(): void {}
    public allHideIdleEffect(): void {}

    // ===================== 设置中奖次数 =====================
    public onDefualut(count: number): void {
        this._winCount = count;
    }

    // ===================== 核心-设置转盘停止目标位置 =====================
    public setTargetNum(targetIdx: number): void {
        const target = (360 / this._targetAngle) - targetIdx;
        this._targetNum = target;
    }

    // ===================== 设置大奖预留特效开关 =====================
    public setReserveJackpotEffect(isReserve: boolean = false): void {
        this._reserveJackpot = isReserve;
    }

    // ===================== 空实现方法 (原代码保留) =====================
    public onRoatationReady(): void {}

    // ===================== 核心对外方法 - 触发转盘旋转抽奖 =====================
    public onRotation(endCallback: Function): void {
        this._endSpinFunc = endCallback;
        this.onSpinAni();
        this._modeIdle = false;
        this._startSpin = true;
        this.m_WheelDegree1 = 0;
        // 核心：旋转总角度 = 6圈整(2160度) + 目标位置角度
        this.m_WheelDegree2 = 2160 + (this._targetAngle * this._targetNum);
        this.m_WheelMode = 1;
        this.m_Speed = 0;
    }

    // ===================== 核心-播放转盘旋转动画 =====================
    public onSpinAni(): void {
        this.fxIdle.forEach(node => node.active = false);
        this.fxSpin.forEach(node => node.active = true);
        this.fxWins.forEach(node => node.active = false);
        this.frameLights.forEach(ani => {
            ani.stop();
            ani.play("Wheel_FrameNeon_Spin_Ani", 0);
        });
    }

    // ===================== 核心-播放转盘中奖动画 =====================
    public onWin(): void {
        this.fxIdle.forEach(node => node.active = false);
        this.fxSpin.forEach(node => node.active = false);
        this.fxWins.forEach((node, idx) => {
            node.active = true;
            if (idx === 0) node.rotation = -this.wheel_Node.rotation;
        });
        this.frameLights.forEach(ani => {
            ani.stop();
            ani.play("Wheel_FrameNeon_Win_Ani", 0);
        });
        this._reserveJackpot = false;
    }

    // ===================== 旋转结束播放收尾特效+执行回调 =====================
    public playEndEffect(): void {
        this.onWin();
        if (TSUtility.isValid(this._endSpinFunc)) {
            this.scheduleOnce(this._endSpinFunc, 2);
        }
    }

    // ===================== 帧更新 - 转盘核心物理旋转逻辑【重中之重，无任何修改】 =====================
    update(deltaTime: number): void {
        if (this._startSpin) {
            let n = 10;
            let t = 0;
            // 旋转阶段1：加速旋转 → 速度递增 上限10度/帧
            if (this.m_WheelMode === 1) {
                this.m_Speed += 0.04;
                if (this.m_Speed > 10) this.m_Speed = 10;
                this.m_WheelDegree1 += this.m_Speed * this.getFrameFactor(deltaTime);
                // 旋转900度后进入匀速/减速阶段
                if (this.m_WheelDegree1 > 900) this.m_WheelMode = 2;
            }
            // 旋转阶段2：匀速+减速旋转 → 核心物理减速公式，精准还原原效果
            else if (this.m_WheelMode === 2) {
                if (this.m_WheelDegree1 < this.m_WheelDegree2) {
                    t = this.m_WheelDegree2 - this.m_WheelDegree1;
                    // 剩余角度不同 → 不同减速系数，越靠近目标越慢
                    if (t > 1080) n = 10;
                    else if (t > 720) n = 5 + 5 * (t - 720) / 360 / 2;
                    else if (t > 360) n = 3 + 3 * (t - 360) / 360;
                    else if (t > 100) n = 1 + 2 * (t - 100) / 260;
                    else n = t / 100;

                    if (n < 0.07) n = 0.07;
                    this.m_WheelDegree1 += n * this.getFrameFactor(deltaTime);

                    // 角度边界修正，防止超界
                    if (this.m_WheelDegree1 > this.m_WheelDegree2) {
                        this.m_WheelDegree1 = this.m_WheelDegree2;
                    } else if (this.m_WheelDegree1 === this.m_WheelDegree2) {
                        const e = this.m_WheelDegree1 + this._targetAngle;
                        if (e % this._targetAngle > 17 && e % this._targetAngle < 31) {
                            this.m_WheelDegree2 -= (e % this._targetAngle) / 2 + 3;
                        }
                    }
                    this.m_Speed = n;
                }
            }
            // 角度修正：防止反向偏移
            else {
                if (this.m_WheelDegree1 > this.m_WheelDegree2) this.m_WheelDegree1 += -0.01;
                else if (this.m_WheelDegree1 < this.m_WheelDegree2) this.m_WheelDegree1 = this.m_WheelDegree2;
            }

            // 赋值转盘/指针根节点旋转角度
            Utility.setRotation(this.wheel_Node, this.m_WheelDegree1);
            Utility.setRotation(this.root_Pin_Node, this.m_WheelDegree1);

            n = this.m_WheelDegree1 + this._targetAngle;
            // 旋转结束：精准停位+播放停止音效+重置状态+执行收尾逻辑
            if (this.m_WheelDegree1 === this.m_WheelDegree2) {
                SoundManager.Instance().playFxOnce(this._soundSetter.getAudioClip("wheel_stop"));
                this._startSpin = false;
                Utility.setRotation(this.wheel_Node, this._targetAngle * this._targetNum);
                Utility.setRotation(this.root_Pin_Node, this._targetAngle * this._targetNum);
                this.playEndEffect();
            }
        }
        // 闲置状态：匀速慢速自转，取模360防止角度数值无限累加
        else if (this._modeIdle) {
            Utility.setRotation(this.wheel_Node, (this.wheel_Node.rotation + this.m_IdleSpeed * deltaTime) % 360);
            Utility.setRotation(this.root_Pin_Node, (this.root_Pin_Node.rotation + this.m_IdleSpeed * deltaTime) % 360);
        }
        // 每一帧更新指针角度联动
        this.setPinAngle();
    }

    // ===================== 核心-帧率适配因子 防止不同帧率下旋转速度不一致 =====================
    public getFrameFactor(deltaTime: number): number {
        deltaTime /= 1 / 60;
        if (deltaTime > 2) deltaTime = 2;
        else if (deltaTime < 0.9) deltaTime = 0.9;
        return deltaTime;
    }

    // ===================== 核心-指针角度联动物理逻辑 转盘滚动时指针下压回弹效果 =====================
    public setPinAngle(): void {
        const wheelAngleMod = (this.wheel_Node.rotation + this._targetAngle) % this._targetAngle;
        // 指针在有效角度范围内 → 跟随转盘角度下压
        if (this.rangeWheelDegreeForPinSpin[0] <= wheelAngleMod && this.rangeWheelDegreeForPinSpin[this.rangeWheelDegreeForPinSpin.length - 1] >= wheelAngleMod) {
            this.m_WheelPin.stopAllActions();
            let pinAngle = 0;
            // 遍历角度区间 精准计算指针下压角度
            for (let n = 0; n < this.rangePinDegreeForPinSpin.length - 1; ++n) {
                if (this.rangeWheelDegreeForPinSpin[n] <= wheelAngleMod && this.rangeWheelDegreeForPinSpin[n + 1] >= wheelAngleMod) {
                    pinAngle = (this.rangePinDegreeForPinSpin[n + 1] - this.rangePinDegreeForPinSpin[n]) * (wheelAngleMod - this.rangeWheelDegreeForPinSpin[n]) / (this.rangeWheelDegreeForPinSpin[n + 1] - this.rangeWheelDegreeForPinSpin[n]);
                    pinAngle += this.rangePinDegreeForPinSpin[n];
                    break;
                }
            }
            Utility.setRotation(this.m_WheelPin, -pinAngle);
            this._playOncePinDrop = true;
        }
        // 指针超出有效范围 → 回弹复位+播放指针回弹音效
        else {
            if (this._playOncePinDrop) {
                if (!this._modeIdle) {
                    SoundManager.Instance().playFxOnce(this._soundSetter.getAudioClip("wheel_stick"));
                }
                this.m_WheelPin.runAction(cc.rotateTo(0.05, 0));
            }
            this._playOncePinDrop = false;
        }
    }
}