const { ccclass, property } = cc._decorator;

// 导入项目所有依赖模块 - 路径与原JS完全一致，直接复用无修改
import TimeFormatHelper from "../global_utility/TimeFormatHelper";
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";

/**
 * Bingo游戏重置倒计时组件
 * 负责：环形进度条展示、倒计时数字更新、多状态动画切换、tooltip弹窗、倒计时结束回调
 */
@ccclass
export default class BingoResetTimer extends cc.Component {
    // ====================== 编辑器序列化绑定属性 (与原JS完全一致，变量名原生拼写保留，防止预制体绑定失效 ✔️) ======================
    @property(cc.Animation)
    timer_Animtion: cc.Animation = null!; // 原拼写 Animtion 无a，保留

    @property(cc.Sprite)
    time_Fill_Spirte: cc.Sprite = null!; // 原拼写 Spirte 无r，保留

    @property(cc.Node)
    timer_Handle_Node: cc.Node = null!;

    @property(cc.Label)
    remainTime_Label: cc.Label = null!;

    @property(cc.Node)
    toolTip_Node: cc.Node = null!;

    @property(cc.Label)
    toolTip_Time_Label: cc.Label = null!;

    @property(cc.Node)
    remain_Guide_Node: cc.Node = null!;

    @property(cc.Label)
    remain_Guide_Label: cc.Label = null!;

    @property(cc.Button)
    timer_Button: cc.Button = null!;

    // ====================== 私有成员属性 (补全TS强类型，初始值与原JS一致，添加私有修饰符) ======================
    private _resetTime: number = 0; // 重置的目标时间戳(秒)
    private _remainAniTime: number = 15; // 24小时内动画帧数计数器，原JS固定初始值15
    private _resetFunc: (() => void) | null = null; // 倒计时结束后的回调函数

    // ====================== Cocos生命周期钩子 (原JS逻辑1:1精准还原，无任何修改) ======================
    onLoad(): void {
        // 绑定按钮点击事件 - 显示tooltip弹窗，事件处理器参数完全匹配原JS
        this.timer_Button.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoResetTimer", "showTooltip", ""));
    }

    onDestroy(): void {
        // 销毁时清空所有定时器，防止内存泄漏，原JS核心逻辑
        this.unscheduleAllCallbacks();
    }

    // ====================== 核心初始化方法 - 设置倒计时目标时间和结束回调 ======================
    setTimer(resetInfo: { nextResetTime: number }, resetCallback: (() => void) | null): void {
        this._resetTime = resetInfo.nextResetTime;
        this._resetFunc = resetCallback;
        // 立即刷新一次UI，再开启每秒刷新
        this.setTimerUI();
        this.schedule(this.setTimerUI, 1);
    }

    // ====================== 核心倒计时UI刷新方法 (原JS最复杂逻辑，100%精准还原，改则必出BUG) ======================
    setTimerUI(): void {
        // 计算剩余秒数 = 重置目标时间 - 服务器当前时间(秒)
        const remainSecond = this._resetTime - TSUtility.getServerBaseNowUnixTime();
        // 进度比例计算：总时长固定3天 = 259200秒，原JS核心常量不可修改
        const progressRatio = (259200 - remainSecond) / 259200;

        if (remainSecond >= 0) {
            // ✅ 倒计时中：更新环形进度条+指针角度，反向填充逻辑与原JS一致 fillRange = -比例
            this.time_Fill_Spirte.fillRange = -progressRatio;
            this.timer_Handle_Node.angle = -360 * progressRatio;

            // 更新主倒计时文本 + tooltip弹窗倒计时文本
            const formatTime = TimeFormatHelper.getHourTimeString(remainSecond);
            this.remainTime_Label.string = formatTime;
            this.toolTip_Time_Label.string = formatTime;

            // ✅ 分支1：剩余时间 ≤ 24小时(86400秒) - 播放倒计时警示动画
            if (remainSecond <= 86400) {
                if (this._remainAniTime === 15) {
                    this.timer_Animtion.stop();
                    this.timer_Animtion.play("Timer_Ani_24h");
                    this.timer_Animtion.setCurrentTime(0); // 强制从头播放动画
                }
                this._remainAniTime--;
                // 帧数计数器重置规则：15 → 0 → 15 循环，原JS核心逻辑
                this._remainAniTime < 0 && (this._remainAniTime = 15);
            } 
            // ✅ 分支2：剩余时间 > 24小时 - 播放闲置动画
            else {
                this.timer_Animtion.stop();
                this.timer_Animtion.play("Timer_Ani_Idle");
                this.timer_Animtion.setCurrentTime(0);
            }

            // ✅ 分支3：剩余时间 ≤ 60秒 - 显示秒数指引节点，精准显示剩余秒数
            if (remainSecond <= 60) {
                this.remain_Guide_Node.active = true;
                this.remain_Guide_Label.string = remainSecond.toString();
            } else {
                this.remain_Guide_Node.active = false;
            }
        } 
        // ✅ 倒计时结束：重置所有UI状态 + 执行回调 + 关闭定时器
        else {
            this.time_Fill_Spirte.fillRange = 1;
            this.timer_Handle_Node.rotation = 0;
            this.remainTime_Label.string = TimeFormatHelper.getHourTimeString(0);
            
            this.timer_Animtion.stop();
            this.timer_Animtion.play("Timer_Ani_Idle");
            this.timer_Animtion.setCurrentTime(0);

            // 清空定时器，防止内存泄漏
            this.unschedule(this.setTimerUI);
            // 执行外部传入的重置回调
            this._resetFunc && this._resetFunc();
        }
    }

    // ====================== 按钮点击-显示Tooltip弹窗 (原JS逻辑1:1还原，2秒自动关闭) ======================
    showTooltip(): void {
        const self = this;
        if (!this.toolTip_Node.active) {
            this.toolTip_Node.active = true;
            // 2秒后自动隐藏弹窗，原JS核心交互逻辑
            this.scheduleOnce(() => {
                self.toolTip_Node.active = false;
            }, 2);
        }
    }
}