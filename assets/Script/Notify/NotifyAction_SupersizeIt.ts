const { ccclass } = cc._decorator;

// ===================== 依赖模块导入 - 与混淆源码映射完全一致 =====================
import TSUtility from "../global_utility/TSUtility";
import SupersizeItManager from "../SupersizeItManager";
import MessageRoutingManager from "../message/MessageRoutingManager";
import UserInfo from "../User/UserInfo";
import NotifyManager, { NotifyType } from "../Notify/NotifyManager";
import NotifyActionBase from "../Action/NotifyActionBase";

/**
 * SupersizeIt 通知执行类
 * 继承自通知基类，处理【超级奖励/SupersizeIt】活动的全局通知刷新逻辑
 * 区分大厅/老虎机场景执行差异化业务规则，含防重复刷新、中奖用户校验、冷却时间限制等核心逻辑
 */
@ccclass("NotifyAction_SupersizeIt")
export default class NotifyAction_SupersizeIt extends NotifyActionBase {
    // ===================== 【私有成员变量】源码初始化值精准保留 =====================
    /** 上一次的票券数量，初始-1做首次加载判断 */
    private _numPrevTicketCount: number = -1;
    /** 活动是否已结束标记 */
    private _isEnd: boolean = false;
    /** 冷却时间定时器 - 记录上次刷新的服务器时间戳，防高频刷新 */
    private _timer: number = 0;

    // ===================== 【重写基类方法】获取当前通知类型 =====================
    public getType(): number|string {
        return NotifyType.SUPERSIZE_IT;
    }

    // ===================== 【重写基类方法】通知追加执行前的参数校验 =====================
    public beforeAppend(param: any): void {
        const infoBase = param.infoBase;
        TSUtility.isValid(infoBase);
    }

    // ===================== 【重写基类核心方法】执行通知的具体业务逻辑 =====================
    public action(param: any): void {
        const infoBase = param.infoBase;
        // 数据有效 → 按场景分逻辑执行，无效 → 直接完成通知流程
        if (TSUtility.isValid(infoBase)) {
            if (this.isValidLobbyScene()) {
                this.playAction_Lobby(infoBase).then(() => { this.done(); });
            } else if (this.isValidSlotScene()) {
                this.playAction_Slot(infoBase).then(() => { this.done(); });
            } else {
                this.done();
            }
        } else {
            this.done();
        }
    }

    // ===================== 【私有异步方法】大厅场景的刷新逻辑 - 简易规则 =====================
    private async playAction_Lobby(infoBase: any): Promise<void> {
        if (!this.isValidLobbyScene()) return;
        
        // ✅ 核心规则：仅当【当前票券数 < 上次票券数】时执行刷新，防止重复/无效通知
        // 首次加载(_numPrevTicketCount=-1) 强制执行刷新
        if (this._numPrevTicketCount <= infoBase.info.numCurrentCount && this._numPrevTicketCount !== -1) {
            return;
        }
        
        // 更新上次票券数 + 解析通知数据刷新全局状态
        this._numPrevTicketCount = infoBase.info.numCurrentCount;
        SupersizeItManager.instance.parseNotify(infoBase);
    }

    // ===================== 【私有异步方法】老虎机游戏场景的刷新逻辑 - 复杂多分支规则【核心】 =====================
    private async playAction_Slot(infoBase: any): Promise<void> {
        if (!this.isValidSlotScene()) return;

        // 分支1：活动已结束 → 不再执行任何刷新逻辑
        if (this._isEnd) return;

        // 分支2：票券数未减少/首次加载不满足 → 防重复刷新，直接返回
        if (this._numPrevTicketCount <= infoBase.info.numCurrentCount && this._numPrevTicketCount !== -1) {
            return;
        }

        // 更新上次票券数，作为后续判断基准
        this._numPrevTicketCount = infoBase.info.numCurrentCount;

        // 分支3：活动正式结束 → 标记结束+解析通知
        if (infoBase.info.isEnd === 1) {
            this._isEnd = true;
            SupersizeItManager.instance.parseNotify(infoBase);
            return;
        }

        // 分支4：当前玩家是【大奖中奖用户】→ 强制解析通知，无冷却限制
        if (UserInfo.instance().getUid() === infoBase.info.infoJackpotUser.user.uid) {
            SupersizeItManager.instance.parseNotify(infoBase);
            return;
        }

        // 分支5：冷却时间校验【核心防刷规则】→ 距上次刷新超 180秒(3分钟) 才执行刷新
        const currentServerTime = TSUtility.getServerBaseNowUnixTime();
        if (this._timer + 180 < currentServerTime) {
            this._timer = currentServerTime; // 更新冷却时间戳
            SupersizeItManager.instance.parseNotify(infoBase); // 解析通知数据
            // 发送全局消息 → 追加SupersizeIt通知+刷新自身票券数量UI
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.APPEND_SUPERSIZE_IT_NOTIFY, infoBase);
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REFRESH_SUPERSIZE_IT_COUNT_SELF);
        }
    }
}