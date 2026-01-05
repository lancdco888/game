const { ccclass } = cc._decorator;

// ===================== 依赖模块导入 - 路径与混淆源码完全一致 =====================
import TSUtility from "../global_utility/TSUtility";
import SupersizeItManager from "../SupersizeItManager";
import MessageRoutingManager from "../message/MessageRoutingManager";
import UserInfo from "../User/UserInfo";
import NotifyManager, { NotifyType } from "../Notify/NotifyManager";
import NotifyActionBase from "./NotifyActionBase";

/**
 * SupersizeIt 活动 专属通知执行器
 * 继承通知基类，处理【超级奖励/SupersizeIt】的全局通知刷新逻辑
 * 核心特性：分「大厅/老虎机游戏」双场景差异化规则 + 防重复刷新 + 冷却限流 + 中奖用户特权放行
 */
@ccclass()
export default class NotifyAction_SupersizeIt extends NotifyActionBase {
    // ===================== 私有成员变量 - 初始化值与混淆源码完全一致 =====================
    /** 上一次的票券数量，初始值-1 作为【首次加载】的判断标识 */
    private _numPrevTicketCount: number = -1;
    /** 活动是否结束的状态标记，置为true后永久停止所有刷新逻辑 */
    private _isEnd: boolean = false;
    /** 冷却时间戳：记录上次执行刷新的服务器时间，用于防高频刷新 */
    private _timer: number = 0;

    // ===================== 重写基类方法 - 获取当前通知的唯一类型 =====================
    public getType(): number|string {
        return NotifyType.SUPERSIZE_IT;
    }

    // ===================== 重写基类方法 - 通知执行前的前置参数校验 =====================
    public beforeAppend(param: any): void {
        const infoBase = param.infoBase;
        TSUtility.isValid(infoBase);
    }

    // ===================== 重写基类核心方法 - 通知的主业务逻辑入口 =====================
    public action(param: any): void {
        const infoBase = param.infoBase;
        const self = this;

        // 数据有效则按「大厅/游戏」场景分发逻辑，无效则直接完成通知流程
        if (TSUtility.isValid(infoBase)) {
            if (this.isValidLobbyScene() === 1) {
                this.playAction_Lobby(infoBase).then(() => { self.done(); });
            } else if (this.isValidSlotScene() === 1) {
                this.playAction_Slot(infoBase).then(() => { self.done(); });
            } else {
                this.done();
            }
        } else {
            this.done();
        }
    }

    // ===================== 私有异步方法 - 大厅场景的刷新逻辑【简易规则】 =====================
    private async playAction_Lobby(infoBase: any): Promise<void> {
        // 非大厅场景 直接退出
        if (this.isValidLobbyScene() === 0) return;

        // 核心防重规则：仅当「票券数量减少」时才刷新，首次加载(-1)则强制执行
        if (this._numPrevTicketCount <= infoBase.info.numCurrentCount && this._numPrevTicketCount !== -1) {
            return;
        }

        // 更新历史票券数 + 解析通知数据 更新全局状态
        this._numPrevTicketCount = infoBase.info.numCurrentCount;
        SupersizeItManager.instance.parseNotify(infoBase);
    }

    // ===================== 私有异步方法 - 老虎机游戏场景的刷新逻辑【核心复杂规则】 =====================
    private async playAction_Slot(infoBase: any): Promise<void> {
        // 非游戏内场景 直接退出
        if (this.isValidSlotScene() === 0) return;

        // 规则1：活动已结束 → 永久停止所有刷新
        if (this._isEnd) return;

        // 规则2：票券数未减少 且 非首次加载 → 防重复刷新，直接退出
        if (this._numPrevTicketCount <= infoBase.info.numCurrentCount && this._numPrevTicketCount !== -1) {
            return;
        }

        // 更新历史票券数，作为后续所有判断的基准值
        this._numPrevTicketCount = infoBase.info.numCurrentCount;

        // 规则3：活动正式结束 → 标记结束状态 + 解析通知数据
        if (infoBase.info.isEnd === 1) {
            this._isEnd = true;
            SupersizeItManager.instance.parseNotify(infoBase);
            return;
        }

        // 规则4：当前玩家是【大奖中奖用户】→ 特权放行，无冷却无限制，强制刷新
        if (UserInfo.instance().getUid() === infoBase.info.infoJackpotUser.user.uid) {
            SupersizeItManager.instance.parseNotify(infoBase);
            return;
        }

        // 规则5：冷却时间校验【核心限流】→ 硬编码 180秒(3分钟)冷却期，超期才执行刷新
        const currentServerUnixTime = TSUtility.getServerBaseNowUnixTime();
        if (this._timer + 180 < currentServerUnixTime) {
            this._timer = currentServerUnixTime; // 更新冷却时间戳
            SupersizeItManager.instance.parseNotify(infoBase); // 解析通知数据
            // 发送全局消息，通知UI层更新
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.APPEND_SUPERSIZE_IT_NOTIFY, infoBase);
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REFRESH_SUPERSIZE_IT_COUNT_SELF, infoBase);
        }
    }
}