// BingoBallContainer.ts - Cocos Creator 2.4.13 完美适配版
const { ccclass, property } = cc._decorator;

import BingoBall from "./BingoBall";
import SoundManager from "../manager/SoundManager";

@ccclass
export default class BingoBallContainer extends cc.Component {
    //#region 序列化属性 - 对应原JS绑定的节点组件
    @property(cc.Animation)
    public ballAppearAni: cc.Animation = null!;

    @property(cc.Sprite)
    public appearBallSpr: cc.Sprite = null!;

    @property(cc.Sprite)
    public appearBallSprAdd: cc.Sprite = null!;

    @property(cc.Label)
    public appearBallNumLabel: cc.Label = null!;
    //#endregion

    //#region 私有成员变量 - 原JS所有变量完整保留+类型注解
    private _ballPrefab: cc.Prefab = null!;
    private _balls: BingoBall[] = [];
    private _ballPosition: cc.Vec2[] = [
        cc.Vec2.ZERO, 
        cc.Vec2.ZERO, 
        new cc.Vec2(-128, 0), 
        new cc.Vec2(-241, 0), 
        new cc.Vec2(-241, 300)
    ];
    private _maxDisplayCnt: number = 3;
    private _soundSetter: any = null; // 外部传入的音效配置器，原JS为任意类型，保留any
    private _animState: boolean = false;
    //#endregion

    // 静态缩放常量 - 原JS的类静态属性
    public static smallScale: number = 0.75;

    /**
     * 初始化球容器
     * @param ballPrefab 球预制体
     * @param ballNumArr 球数字数组
     * @param soundSetter 音效设置器
     */
    public initBallContainer(ballPrefab: cc.Prefab, ballNumArr: number[], soundSetter: any): void {
        this._ballPrefab = ballPrefab;
        this._soundSetter = soundSetter;
        // 只显示超出最大数量后的球，保持最多显示指定数量
        const startIdx = Math.max(0, ballNumArr.length - this._maxDisplayCnt);
        for (let i = startIdx; i < ballNumArr.length; ++i) {
            this.addBall(ballNumArr[i], false);
        }
        this.hideBallAppearAni();
    }

    /**
     * 清空所有球
     */
    public clearAllBall(): void {
        this._animState = false;
        this.hideBallAppearAni();
        this.node.stopAllActions();
        // 销毁所有球节点并清空数组
        for (let i = 0; i < this._balls.length; ++i) {
            this._balls[i].node.destroy();
        }
        this._balls = [];
    }

    /**
     * 添加新的球
     * @param num 球的数字
     * @param isPlayAni 是否播放出现动画
     */
    public addBall(num: number, isPlayAni: boolean): void {
        if (!this._animState) {
            const ballNode = cc.instantiate(this._ballPrefab);
            const bingoBall = ballNode.getComponent(BingoBall)!;
            bingoBall.setNumber(num);
            this.node.addChild(ballNode);
            this._balls.push(bingoBall);
            this.arrangeBallPosition(isPlayAni);
        }
    }

    /**
     * 判断容器是否可操作（非动画中）
     */
    public isAvailable(): boolean {
        return !this._animState;
    }

    /**
     * 重新排列球的位置
     * @param isPlayAni 是否播放动画
     */
    public arrangeBallPosition(isPlayAni: boolean): void {
        this._animState = true;
        const actionArr: any[] = [];
        const lastIdx = this._balls.length - 1;

        // 倒序遍历球，处理位置和缩放动画
        for (let i = 0, j = lastIdx; i < this._balls.length; ++i, --j) {
            const bingoBall = this._balls[j];
            if (isPlayAni) {
                bingoBall.node.setPosition(this._ballPosition[i]);
                // 位移动画
                const moveAct = cc.targetedAction(bingoBall.node, cc.moveTo(0.3, this._ballPosition[i + 1]).easing(cc.easeOut(2)));
                actionArr.push(moveAct);
                // 指定索引的球添加缩放动画
                if (i === 1) {
                    const scaleAct = cc.targetedAction(bingoBall.node, cc.scaleTo(0.3, BingoBallContainer.smallScale).easing(cc.easeSineIn()));
                    actionArr.push(scaleAct);
                }
            } else {
                // 不播放动画则直接赋值位置和缩放
                bingoBall.node.setPosition(this._ballPosition[i + 1]);
                if (i === 1) {
                    bingoBall.node.setScale(BingoBallContainer.smallScale);
                }
            }
        }

        if (isPlayAni) {
            // 执行动画+音效+特效
            const runAction = actionArr.length === 1 ? actionArr[0] : cc.spawn(actionArr);
            SoundManager.Instance().playFxOnce(this._soundSetter.getAudioClip("showBall"));
            // 显示球出现的动画特效
            this.showBallAppearAni(this._balls[lastIdx]);
            this._balls[lastIdx].node.active = false;

            // 延迟显示真实球节点
            const delayShow = cc.sequence(
                cc.delayTime(0.75),
                cc.callFunc(() => {
                    this.hideBallAppearAni();
                    this._balls[lastIdx].node.active = true;
                })
            );

            // 组合执行所有动作，动画结束后重置状态
            this.node.runAction(
                cc.sequence(
                    cc.spawn(delayShow, runAction),
                    cc.callFunc(this.endAnimState, this)
                )
            );
        } else {
            // 无动画直接结束状态
            this.endAnimState();
        }
    }

    /**
     * 显示球出现的动画特效
     * @param targetBall 目标球组件
     */
    public showBallAppearAni(targetBall: BingoBall): void {
        this.ballAppearAni.node.active = true;
        this.appearBallSpr.spriteFrame = targetBall.sprite.spriteFrame;
        this.appearBallSprAdd.spriteFrame = targetBall.sprite.spriteFrame;
        this.appearBallNumLabel.string = targetBall.numberLabel.string;
        this.appearBallNumLabel.font = targetBall.numberLabel.font;
        this.appearBallNumLabel.lineHeight = targetBall.numberLabel.lineHeight;
        this.appearBallNumLabel.fontSize = targetBall.numberLabel.fontSize;
        this.appearBallNumLabel.node.setPosition(targetBall.numberLabel.node.getPosition());
    }

    /**
     * 隐藏球出现的动画特效
     */
    public hideBallAppearAni(): void {
        this.ballAppearAni.node.active = false;
    }

    /**
     * 结束动画状态，清理超出显示数量的球
     */
    public endAnimState(): void {
        // 超出最大显示数量，销毁最前面的球
        if (this._balls.length > this._maxDisplayCnt) {
            const delCnt = this._balls.length - this._maxDisplayCnt;
            const delBalls = this._balls.splice(0, delCnt);
            for (let i = 0; i < delBalls.length; ++i) {
                delBalls[i].node.destroy();
            }
        }
        this._animState = false;
    }
}