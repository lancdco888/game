import NativeUtil from "../global_utility/NativeUtil";
import { Utility } from "../global_utility/Utility";

const { ccclass, property } = cc._decorator;

/**
 * App事件管理组件（单例）
 * 负责统计用户活跃时间、监听触摸事件、并在iOS平台上报Playtime事件到AppsFlyer
 */
@ccclass("AppEventManager")
export default class AppEventManager extends cc.Component {
    // ===== 静态常量 =====
    private static readonly _eventVersion: string = "2"; // 事件版本号
    private static _instance: AppEventManager | null = null; // 单例实例

    // ===== 私有成员变量 =====
    private _isActive: boolean = false; // 用户是否处于活跃状态
    private _sumActiveTime: number = 0; // 累计活跃时间（毫秒）
    private _timeLastActive: number = 0; // 最后一次活跃的时间戳（毫秒）
    private _inactivityDelay: number = 30 * 1000; // 非活跃判定延迟：30秒
    private _eventDelay: number = 5 * 60 * 1000; // 事件触发延迟：5分钟

    // ===== 单例方法 =====
    /**
     * 获取单例实例（懒加载，挂载到持久化节点）
     * @returns AppEventManager单例
     */
    public static Instance(): AppEventManager {
        if (AppEventManager._instance) {
            return AppEventManager._instance;
        }

        // 创建持久化节点并挂载组件
        const managerNode = new cc.Node("AppEventManagerInstance");
        AppEventManager._instance = managerNode.addComponent(AppEventManager);
        cc.game.addPersistRootNode(managerNode);

        return AppEventManager._instance;
    }

    /**
     * 初始化方法（对外暴露，触发单例创建）
     */
    public static Init(): void {
        AppEventManager.Instance();
    }

    // ===== 生命周期方法 =====
    /**
     * 组件加载时初始化状态
     */
    protected onLoad(): void {
        this._isActive = true;
        this._timeLastActive = new Date().getTime();
    }

    /**
     * 组件销毁时的清理逻辑（原代码无实现，保留空方法）
     */
    protected onDestroy(): void {}

    /**
     * 帧更新：统计活跃时间，达到阈值触发事件上报
     * @param dt 帧间隔时间（秒）
     */
    protected update(dt: number): void {
        if (!this._isActive) return;

        const currentTime = new Date().getTime();
        // 超过30秒无触摸 → 标记为非活跃
        if (currentTime - this._timeLastActive > this._inactivityDelay) {
            this._isActive = false;
            return;
        }

        // 累计活跃时间（转换为毫秒）
        this._sumActiveTime += 1000 * dt;

        // 累计达到5分钟 → 触发事件上报
        if (this._sumActiveTime >= this._eventDelay) {
            cc.log("time event trigger!!");
            this._sumActiveTime -= this._eventDelay; // 重置累计时间（保留剩余时长）
            this.sendEvent();
        }
    }

    // ===== 事件处理方法 =====
    /**
     * 为节点添加触摸事件监听（触发活跃状态更新）
     * @param node 要监听的节点
     */
    public addTouchEvent(node: cc.Node): void {
        node.on(cc.Node.EventType.TOUCH_START, this.onTouchCallback, this, true);
    }

    /**
     * 触摸事件回调：更新活跃状态和最后活跃时间
     */
    private onTouchCallback(): void {
        cc.log("Touch Screen!!!");
        
        // 计算距离下次上报的剩余时间（秒）
        const remainTime = (this._eventDelay - this._sumActiveTime) / 1000;
        cc.log(`Remain Send Time: ${remainTime}`);
        
        this._isActive = true;
        this._timeLastActive = new Date().getTime();
    }

    /**
     * 发送Playtime事件（仅iOS移动端）
     */
    private sendEvent(): void {
        const currentDate = new Date();
        // 1. 格式化时间为带时区的ISO8601格式
        const iso8601Time = AppEventManager.getISO8601WithTimezone(currentDate);
        // 2. 获取带分隔符的客户端SessionKey
        const sessionKey = AppEventManager.getClientSessionKeyWithDash();
        // 3. 获取DeepLink内容
        const deepLinkContent = NativeUtil.getDeepLinkContent();

        // 调试日志
        cc.log(`iso860 timezone: ${iso8601Time}`);
        cc.log(`sissionKey: ${sessionKey}`);
        cc.log(`deep link: ${deepLinkContent}`);

        // 仅iOS移动端上报AppsFlyer事件
        if (Utility.isMobileGame() && cc.sys.os === cc.sys.OS_IOS) {
            const eventParams = {
                EventVersion: AppEventManager._eventVersion,
                TimeStamp: iso8601Time,
                Session: sessionKey
            };
            //NativeUtil.afLogEvent("Playtime", eventParams);
        }
    }

    // ===== 静态工具方法 =====
    /**
     * 将日期格式化为带时区的ISO8601字符串
     * @param date 要格式化的日期
     * @returns ISO8601格式字符串（带时区）
     */
    public static getISO8601WithTimezone(date: Date): string {
        // 年
        const year = date.getFullYear();
        // 月（补零）
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        // 日（补零）
        const day = date.getDate().toString().padStart(2, "0");
        // 时（补零）
        const hour = date.getHours().toString().padStart(2, "0");
        // 分（补零）
        const minute = date.getMinutes().toString().padStart(2, "0");
        // 秒（补零）
        const second = date.getSeconds().toString().padStart(2, "0");

        // 时区偏移（分钟）
        const timezoneOffset = date.getTimezoneOffset();
        const absOffset = Math.abs(timezoneOffset);
        // 时区小时（补零）
        const offsetHour = Math.floor(absOffset / 60).toString().padStart(2, "0");
        // 时区分钟（补零）
        const offsetMinute = (absOffset % 60).toString().padStart(2, "0");
        // 时区符号（东为+，西为-）
        const offsetSign = timezoneOffset < 0 ? "+" : "-";

        // 拼接ISO8601格式：YYYY-MM-DDTHH:MM:SS±HH:MM
        return `${year}-${month}-${day}T${hour}:${minute}:${second}${offsetSign}${offsetHour}:${offsetMinute}`;
    }

    /**
     * 获取带分隔符的客户端SessionKey（8-4-4-4-12格式）
     * @returns 带分隔符的SessionKey
     */
    public static getClientSessionKeyWithDash(): string {
        const sessionKey = NativeUtil.getClientSessionKey();
        // 按UUID格式拆分：8-4-4-4-12
        return [
            sessionKey.substring(0, 8),
            sessionKey.substring(8, 12),
            sessionKey.substring(12, 16),
            sessionKey.substring(16, 20),
            sessionKey.substring(20)
        ].join("-");
    }
}