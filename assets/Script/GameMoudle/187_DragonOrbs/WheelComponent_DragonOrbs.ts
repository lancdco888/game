import SlotSoundController from "../../Slot/SlotSoundController";
import TSUtility from "../../global_utility/TSUtility";
import { Utility } from "../../global_utility/Utility";

const { ccclass, property } = cc._decorator;

// ===================== 核心接口/类型定义 =====================
/** 转盘奖励配置接口（匹配原JS的_wheelInfo结构） */
interface WheelInfo {
    grandTrigger: number[];
    majorTrigger: number[];
    minorTrigger: number[];
    miniTrigger: number[];
    addSpinCnt_3: number[];
    addSpinCnt_2: number[];
    addSpinCnt_5: number[];
    spinMultiplier_1: number[];
    spinMultiplier_2: number[];
    spinMultiplier_5: number[];
}

// ===================== 龙珠游戏转盘组件 =====================
/**
 * 龙珠游戏转盘组件
 * 管理转盘的显隐动画、旋转逻辑（物理速度/角度计算）、结果定位、over/return 状态处理、音效播放等核心逻辑
 */
@ccclass()
export default class WheelComponent_DragonOrbs extends cc.Component {
    // ===================== 序列化属性（与原JS完全一致） =====================
    /** 转盘根节点动画组件（显隐动画） */
    @property(cc.Animation)
    public rootAnimation: cc.Animation | null = null;

    /** 转盘旋转根节点 */
    @property(cc.Node)
    public wheelRoot: cc.Node | null = null;

    /** 箭头动画组件 */
    @property(cc.Animation)
    public arrowAnimation: cc.Animation | null = null;

    /** 中奖特效节点 */
    @property(cc.Node)
    public winFx: cc.Node | null = null;

    /** 转盘整体根节点 */
    @property(cc.Node)
    public root: cc.Node | null = null;

    /** 遮罩背景节点 */
    @property(cc.Node)
    public blockingBG: cc.Node | null = null;

    // ===================== 私有状态变量（与原JS完全一致，补充类型注解） =====================
    /** 旋转结束回调函数 */
    private _endCallback: (() => void) | null = null;

    /** 每个奖项的目标角度（22.5度/份） */
    private _targetAngle: number = 22.5;

    /** 概率结果（未使用，保留原结构） */
    private _probResults: any = null;

    /** 入场动作（未使用，保留原结构） */
    private _introAction: any = null;

    /** 总中奖金额（未使用，保留原结构） */
    private _totalWinMoney: number = 0;

    /** 是否双倍（未使用，保留原结构） */
    private _isDouble: boolean = false;

    /** 变暗部件列表（未使用，保留原结构） */
    private _dimParts: Node[] = [];

    /** 禁用大奖列表（未使用，保留原结构） */
    private _disabledJackpotList: number[] = [];

    /** 目标部件（未使用，保留原结构） */
    private _targetParts: any = null;

    /** 是否停止旋转 */
    private _stopSpin: boolean = false;

    /** 是否开始旋转 */
    private _startSpin: boolean = false;

    /** 转盘旋转角度1（主计算角度） */
    private m_WheelDegree1: number = 0;

    /** 转盘目标角度2 */
    private m_WheelDegree2: number = 0;

    /** 转盘旋转模式（1:加速 2:减速） */
    private m_WheelMode: number = 1;

    /** 旋转速度 */
    private m_Speed: number = 0;

    /** 转盘间隙角度（随机偏移） */
    private _wheelGap: number = 0;

    /** 结果最终角度 */
    private _resultAngle: number = 0;

    /** 目标奖项索引 */
    private _index: number = 0;

    /** 当前索引对应的角度 */
    private _angle: number = 0;

    /** 是否返回旋转（反向微调） */
    private _isReturn: boolean = false;

    /** 是否结束旋转（正向微调） */
    private _isOver: boolean = false;

    /** 转盘奖项配置（角度索引映射） */
    private _wheelInfo: WheelInfo = {
        grandTrigger: [0],
        majorTrigger: [12],
        minorTrigger: [6, 4],
        miniTrigger: [2, 9, 14],
        addSpinCnt_3: [3, 15],
        addSpinCnt_2: [1, 8, 11],
        addSpinCnt_5: [13],
        spinMultiplier_1: [7],
        spinMultiplier_2: [10],
        spinMultiplier_5: [5]
    };

    // ===================== 生命周期方法 =====================
    /**
     * 组件加载时初始化遮罩背景尺寸
     */
    public onLoad(): void {
        if (!TSUtility.isValid(this.blockingBG)) return;
        
        // 获取Canvas节点并设置遮罩背景尺寸
        const canvasNode = cc.director.getScene().getComponentInChildren(cc.Canvas).node;
        if (TSUtility.isValid(canvasNode)) {
            const canvasSize = canvasNode.getContentSize();
            this.blockingBG.setContentSize(canvasSize.width + 5, canvasSize.height + 100);
        }
    }

    // ===================== 核心业务方法（与原JS逻辑1:1保留） =====================
    /**
     * 显示转盘（播放入场动画）
     * @param triggerType 触发类型（匹配_wheelInfo的key）
     * @param callback 入场动画完成回调
     */
    public appearWheel(triggerType: keyof WheelInfo, callback: () => void): void {
        // 重置转盘旋转角度为0
        if (TSUtility.isValid(this.wheelRoot)) {
            Utility.setRotation(this.wheelRoot, 0);
        }

        // 随机获取目标奖项索引
        if (TSUtility.isValid(this._wheelInfo[triggerType])) {
            const triggerList = this._wheelInfo[triggerType];
            const randomIdx = Math.floor(Math.random() * triggerList.length);
            this._index = triggerList[randomIdx];
        }

        // 初始化节点状态
        if (TSUtility.isValid(this.root)) this.root.y = 500;
        if (TSUtility.isValid(this.winFx)) this.winFx.active = false;
        this.node.active = true;

        // 监听入场动画完成回调
        if (TSUtility.isValid(this.rootAnimation)) {
            this.rootAnimation.once("finished", callback);
        }

        // 播放箭头默认动画+转盘入场动画
        if (TSUtility.isValid(this.arrowAnimation)) {
            this.arrowAnimation.play("Wheel_Arrow_Normal_Ani", 0);
        }
        if (TSUtility.isValid(this.rootAnimation)) {
            this.rootAnimation.play("Wheel_Appear_Ani", 0);
        }

        // 播放转盘出现音效
        SlotSoundController.Instance().playAudio("WheelAppear", "FX");
    }

    /**
     * 隐藏转盘（播放退场动画）
     * @param callback 退场动画完成回调
     */
    public disappearWheel(callback: () => void): void {
        const self = this;

        // 监听退场动画完成回调
        if (TSUtility.isValid(this.rootAnimation)) {
            this.rootAnimation.once("finished", () => {
                if (TSUtility.isValid(self.winFx)) self.winFx.active = false;
                self.node.active = false;
                callback();
            });
        }

        // 播放转盘退场动画
        if (TSUtility.isValid(this.rootAnimation)) {
            this.rootAnimation.play("Wheel_Disappear_Ani", 0);
        }

        // 播放转盘消失音效
        SlotSoundController.Instance().playAudio("WheelDisappear", "FX");
    }

    /**
     * 开始转盘旋转
     * @param callback 旋转结束回调
     */
    public startSpin(callback: () => void): void {
        // 播放转盘旋转音效
        SlotSoundController.Instance().playAudio("WheelSpin", "FX");

        // 保存结束回调
        this._endCallback = callback;

        // 计算当前索引对应的角度
        this._angle = this._index * this._targetAngle;

        // 随机判断旋转结束类型（over/return）
        const randomVal = Math.floor(10 * Math.random());
        this._isOver = false;
        this._isReturn = false;
        if (randomVal < 8) {
            this._isOver = true;
        } else {
            this._isReturn = true;
        }

        // 随机生成转盘间隙角度
        this._wheelGap = 10 * Math.random() + 5;

        // 计算最终结果角度（总旋转角度=2520度+目标角度-当前旋转偏移）
        const currentRotation = TSUtility.isValid(this.wheelRoot) ? Utility.getRotation(this.wheelRoot) % 360 : 0;
        this._resultAngle = 2520 + this._angle - currentRotation;

        // 计算微调角度（return: +11.25度 over: -11.25度）
        const adjustAngle = this._isReturn ? this._targetAngle / 2 : -this._targetAngle / 2;
        this.m_WheelDegree1 = 0;
        this.m_WheelDegree2 = this._resultAngle + adjustAngle;

        // 重置旋转状态
        this.m_WheelMode = 1;
        this.m_Speed = 0;
        this._stopSpin = false;
        this._startSpin = true;
    }

    /**
     * 停止转盘旋转（最终定位）
     */
    public stopSpin(): void {
        const self = this;

        // 播放转盘停止音效
        SlotSoundController.Instance().playAudio("WheelStop", "FX");

        // 设置最终结果旋转角度
        this.setResultRotation();

        // 2秒后执行结束回调
        this.scheduleOnce(() => {
            if (self._endCallback) {
                self._endCallback();
            }
        }, 2);
    }

    /**
     * 帧更新（核心旋转物理计算逻辑）
     * @param dt 帧间隔时间
     */
    public update(dt: number): void {
        if (!this._startSpin || !TSUtility.isValid(this.wheelRoot)) return;

        let speed = 10;
        let deltaAngle = 0;

        // 模式1：加速阶段（m_WheelMode=1）
        if (this.m_WheelMode === 1) {
            this.m_Speed += 0.08;
            if (this.m_Speed > 10) this.m_Speed = 10;
            
            this.m_WheelDegree1 += this.m_Speed * this.getFrameFactor(dt);
            
            // 加速到900度后切换到减速模式
            if (this.m_WheelDegree1 > 900) {
                this.m_WheelMode = 2;
            }
        }
        // 模式2：减速阶段（m_WheelMode=2）
        else if (this.m_WheelMode === 2) {
            if (this.m_WheelDegree1 < this.m_WheelDegree2) {
                // 计算剩余角度差
                deltaAngle = this.m_WheelDegree2 - this.m_WheelDegree1;
                
                // 根据剩余角度动态计算减速速度
                if (deltaAngle > 1080) {
                    speed = 10;
                } else if (deltaAngle > 720) {
                    speed = 5 + 5 * (deltaAngle - 720) / 360 / 2;
                } else if (deltaAngle > 360) {
                    speed = 3 + 3 * (deltaAngle - 360) / 360;
                } else if (deltaAngle > 100) {
                    speed = 1 + 2 * (deltaAngle - 100) / 260;
                } else {
                    speed = deltaAngle / 100;
                }

                // 速度下限保护
                if (speed < 0.1) speed = 0.1;

                // 更新旋转角度
                this.m_WheelDegree1 += speed * this.getFrameFactor(dt);

                // 角度上限保护（不超过目标角度）
                if (this.m_WheelDegree1 > this.m_WheelDegree2) {
                    this.m_WheelDegree1 = this.m_WheelDegree2;
                } else if (this.m_WheelDegree1 === this.m_WheelDegree2) {
                    // 角度微调（边界修正）
                    const tempAngle = this.m_WheelDegree1 + this._targetAngle;
                    const angleMod = speed % this._targetAngle;
                    if (angleMod > 17 && angleMod < 31) {
                        this.m_WheelDegree2 -= (tempAngle % this._targetAngle) / 2 + 3;
                    }
                }

                this.m_Speed = speed;
            }
            // 超过目标角度后的修正
            else {
                if (this.m_WheelDegree1 > this.m_WheelDegree2) {
                    this.m_WheelDegree1 += -0.01;
                } else {
                    this.m_WheelDegree1 = this.m_WheelDegree2;
                }
            }
        }

        // 设置转盘实际旋转角度
        Utility.setRotation(this.wheelRoot, this.m_WheelDegree1);

        // 旋转到目标角度后停止
        if (this.m_WheelDegree1 === this.m_WheelDegree2) {
            this._startSpin = false;
            // 根据状态处理最终旋转微调
            if (this._isReturn) {
                this.returnWheel();
            } else if (this._isOver) {
                this.overWheel();
            }
        }
    }

    /**
     * 设置结果旋转角度（最终定位动画）
     */
    public setResultRotation(): void {
        const self = this;
        if (!TSUtility.isValid(this.wheelRoot)) return;

        // 计算需要旋转的差值
        const currentRotation = Utility.getRotation(this.wheelRoot);
        const rotateDelta = currentRotation - this._resultAngle;

        // 构建旋转动作序列：0.3秒旋转到目标角度 → 播放中奖特效
        const rotateAction = cc.rotateBy(0.3, -rotateDelta);
        const winAction = cc.callFunc(() => {
            if (TSUtility.isValid(self.winFx)) self.winFx.active = true;
            if (TSUtility.isValid(self.arrowAnimation)) self.arrowAnimation.play("Wheel_Arrow_Win_Ani", 0);
        });
        const actionSeq = cc.sequence(rotateAction, winAction);

        // 执行旋转动作
        this.wheelRoot.runAction(actionSeq);
    }

    /**
     * Over模式转盘微调（正向偏移）
     */
    public overWheel(): void {
        const self = this;
        if (!TSUtility.isValid(this.wheelRoot)) return;

        // 计算微调时间（偏移角度≥10度则3秒，否则1秒）
        const gap = this._wheelGap;
        const duration = Math.abs(gap) >= 10 ? 3 : 1;

        // 构建微调动作：旋转gap角度 → 停止转盘
        const rotateAction = cc.rotateBy(duration, gap);
        const stopAction = cc.callFunc(() => {
            self.stopSpin();
        });
        const actionSeq = cc.sequence(rotateAction, stopAction);

        // 执行微调动作
        this.wheelRoot.runAction(actionSeq);
    }

    /**
     * Return模式转盘微调（反向偏移）
     */
    public returnWheel(): void {
        const self = this;
        if (!TSUtility.isValid(this.wheelRoot)) return;

        // 计算微调时间（偏移角度≥10度则3秒，否则1秒）
        const gap = -this._wheelGap;
        const duration = Math.abs(gap) >= 10 ? 3 : 1;

        // 构建微调动作：旋转gap角度 → 停止转盘
        const rotateAction = cc.rotateBy(duration, gap);
        const stopAction = cc.callFunc(() => {
            self.stopSpin();
        });
        const actionSeq = cc.sequence(rotateAction, stopAction);

        // 执行微调动作
        this.wheelRoot.runAction(actionSeq);
    }

    /**
     * 获取帧因子（修正不同帧率下的旋转速度）
     * @param dt 帧间隔时间
     * @returns 修正后的帧因子
     */
    public getFrameFactor(dt: number): number {
        let factor = dt / (1 / 60); // 基准60帧
        // 帧因子上下限保护
        if (factor > 2) factor = 2;
        if (factor < 0.9) factor = 0.9;
        return factor;
    }
}