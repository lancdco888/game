const { ccclass, property } = cc._decorator;
import SlotManager from "../manager/SlotManager";

@ccclass
export default class SlotReelSpinStateManager extends cc.Component {
    // ✅ 完整复刻原代码 4个核心滚轮旋转状态常量，字符串值一字不改，全项目状态判断的核心基准
    public static readonly STATE_STOP: string = "state_stop";
    public static readonly STATE_SPINNING_NOTSKIPABLE: string = "state_spinning_notskipable";
    public static readonly STATE_SPINNING_SKIPABLE: string = "state_spinning_skipavailable";
    public static readonly STATE_CUSTOM_ACTIVE_SPINBUTTON: string = "state_custom_active_spinbutton";

    // ✅ 单例核心：静态私有实例，原代码完整复刻，全局唯一状态管理器
    private static _instance: SlotReelSpinStateManager = null;

    // ===== 私有成员变量 - 原代码所有变量完整复刻，类型注解精准，默认值完全一致 =====
    private currentState: string = SlotReelSpinStateManager.STATE_STOP; // 当前滚轮旋转状态
    private observers: any[] = []; // 状态监听观察者数组 - 观察者模式核心
    private autospinFlag: boolean = false; // 自动旋转模式开关 (核心控制弹窗自动关闭)
    private freespinFlag: boolean = false; // 免费旋转模式开关
    private jackpotFlag: boolean = false; // 大奖模式开关
    private respinFlag: boolean = false; // 重转模式开关
    private spinFlag: boolean = true; // 基础旋转可用开关
    public customCaption: string = ""; // 自定义标题文案
    public customMessage: string = ""; // 自定义提示文案

    // ✅ 核心单例访问入口，原代码getter逻辑100%复刻，全局唯一实例，项目所有地方通过该方法获取
    public static get Instance(): SlotReelSpinStateManager {
        if (null == SlotReelSpinStateManager._instance) {
            SlotReelSpinStateManager._instance = new SlotReelSpinStateManager();
        }
        return SlotReelSpinStateManager._instance;
    }

    // ✅ 单例销毁方法，原代码逻辑完整复刻，清空观察者+销毁实例
    public static Destroy(): void {
        if (null != SlotReelSpinStateManager._instance) {
            SlotReelSpinStateManager._instance.observers.length = 0;
            SlotReelSpinStateManager._instance.observers = null;
            SlotReelSpinStateManager._instance = null;
        }
    }

    // ===== 生命周期回调 - 原代码空实现，严格保留，预留扩展接口 =====
    onLoad(): void { }

    // ===== 获取当前滚轮旋转状态 =====
    getCurrentState(): string {
        return this.currentState;
    }

    // ===== 获取自定义提示文案 =====
    getCustomMessage(): string {
        return this.customMessage;
    }

    // ===== 核心状态设置方法，修改状态+赋值自定义文案+通知所有观察者，全项目状态变更的唯一入口 =====
    setCurrentState(state: string, caption?: string, message?: string): void {
        this.currentState = state;
        // ✅ 保留原代码 双层null校验铁律：null != xxx && null != xxx，核心容错逻辑，改必导致文案赋值异常！
        this.customCaption = null != caption && null != caption ? caption : "";
        this.customMessage = null != message && null != message ? message : "";
        this.sendChangeStateEventToObservers();
    }

    // ===== 添加状态观察者，注册监听滚轮状态变更事件 =====
    addObserver(observer: any): void {
        this.observers.push(observer);
    }

    // ===== 移除指定状态观察者，取消监听，原代码splice逻辑精准复刻 =====
    removeObserver(observer: any): void {
        for (let i = 0; i < this.observers.length; ++i) {
            if (this.observers[i] == observer) {
                this.observers = this.observers.splice(i, 1);
                break;
            }
        }
    }

    // ===== 切换自动旋转模式，修改开关+通知观察者，核心控制 GameResultPopup 弹窗自动关闭！ =====
    changeAutospinMode(flag: boolean): void {
        this.autospinFlag = flag;
        this.sendChangeStateEventToObservers();
    }

    // ===== 获取自动旋转模式状态，GameResultPopup 核心调用，决定弹窗是否自动关闭 =====
    getAutospinMode(): boolean {
        return this.autospinFlag;
    }

    // ===== 设置免费旋转模式开关 =====
    setFreespinMode(flag: boolean): void {
        this.freespinFlag = flag;
    }

    // ===== 获取免费旋转模式状态 =====
    getFreespinMode(): boolean {
        return this.freespinFlag;
    }

    // ===== 设置重转模式开关 =====
    setRespinMode(flag: boolean): void {
        this.respinFlag = flag;
    }

    // ===== 获取重转模式状态 =====
    getRespinMode(): boolean {
        return this.respinFlag;
    }

    // ===== 设置基础旋转可用开关 + 核心联动逻辑：开启时发送任务更新消息 =====
    setSpinMode(flag: boolean): void {
        this.spinFlag = flag;
        // ✅ 保留原代码 松散判断 1 == e，与全项目统一，改===无影响但严格复刻原逻辑
        if (flag) {
            const msgRouter = SlotManager.Instance.getMessageRoutingManager;
            msgRouter.emitMessage(msgRouter.getMSG().HYPER_BOUNTY_MISSION_UPDATE, true);
        }
    }

    // ===== 获取基础旋转可用状态 =====
    getSpinMode(): boolean {
        return this.spinFlag;
    }

    // ===== 设置大奖模式开关 =====
    setJackpotMode(flag: boolean): void {
        this.jackpotFlag = flag;
    }

    // ===== 获取大奖模式状态 =====
    getJackpotMode(): boolean {
        return this.jackpotFlag;
    }

    // ===== 核心观察者模式：状态变更时，通知所有注册的观察者，事件名一字不改！ =====
    sendChangeStateEventToObservers(): void {
        for (let i = 0; i < this.observers.length; ++i) {
            // ✅ 保留原代码 事件名：changeReelSpinState，全项目唯一，改必导致所有状态监听失效！
            this.observers[i].emit("changeReelSpinState");
        }
    }
}