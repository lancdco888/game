const { ccclass } = cc._decorator;

// ===================== 依赖模块导入 - 与混淆源码映射完全一致 =====================
import TSUtility from "../global_utility/TSUtility";
import ServiceInfoManager from "../ServiceInfoManager";
import MessageRoutingManager from "../message/MessageRoutingManager";
import NotifyManager, { NotifyType } from "../Notify/NotifyManager";
import NotifyActionBase from "./NotifyActionBase";

/**
 * Spin2Win 通知执行类
 * 继承自通知基类，处理【幸运转盘/Spin2Win】相关的全局通知刷新逻辑
 * 负责大厅/老虎机场景的票券数量刷新、状态同步、UI更新
 */
@ccclass("NotifyAction_Spin2Win")
export default class NotifyAction_Spin2Win extends NotifyActionBase {
    // ===================== 【重写基类方法】获取当前通知类型 =====================
    public getType(): string|number {
        return NotifyType.SPIN2WIN;
    }

    // ===================== 【重写基类方法】通知追加执行前的校验 =====================
    public beforeAppend(param: any): void {
        const infoBase = param.infoBase;
        TSUtility.isValid(infoBase);
    }

    // ===================== 【重写基类核心方法】执行通知的具体业务逻辑 =====================
    public action(param: any): void {
        const infoBase = param.infoBase;

        // 数据无效/活动结束且无剩余次数 → 直接完成通知流程
        if (!TSUtility.isValid(infoBase) || (infoBase.info.isEnd === 0 && !TSUtility.isValid(infoBase.info.numCurrentCount))) {
            this.done();
            return;
        }

        // 更新全局Spin2Win票券数量：活动结束则置0，否则赋值当前剩余次数
        ServiceInfoManager.NUMBER_SPIN_2_WIN_TICKET_COUNT = infoBase.info.isEnd === 1 ? 0 : infoBase.info.numCurrentCount;

        // 根据当前场景执行对应刷新逻辑
        if (this.isValidLobbyScene()) {
            this.playAction_Lobby(infoBase).then(() => { this.done(); });
        } else if (this.isValidSlotScene()) {
            this.playAction_Slot(infoBase).then(() => { this.done(); });
        } else {
            this.done();
        }
    }

    // ===================== 【私有异步方法】大厅场景的刷新逻辑 =====================
    private async playAction_Lobby(infoBase: any): Promise<void> {
        if (!this.isValidLobbyScene()) return;
        // 发送全局消息 → 刷新大厅Spin2Win票券数量UI
        MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REFRESH_SPIN_2_WIN_COUNT, infoBase);
    }

    // ===================== 【私有异步方法】老虎机游戏场景的刷新逻辑 =====================
    private async playAction_Slot(infoBase: any): Promise<void> {
        if (!this.isValidSlotScene()) return;
        // 发送全局消息 → 刷新游戏内Spin2Win票券数量UI
        MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REFRESH_SPIN_2_WIN_COUNT, infoBase);
        // 活动结束时 → 强制刷新游戏内UI面板
        if (infoBase.info.isEnd === 1) {
            this.inGameUI.refreshUI();
        }
    }
}