const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import TSUtility from "../global_utility/TSUtility";
import MessageRoutingManager from "../message/MessageRoutingManager";
import NotifyManager, { NotifyType } from "../Notify/NotifyManager";
import NotifyActionBase from "./NotifyActionBase";

// ===================== 俱乐部聊天通知执行类 继承通知基类 =====================
@ccclass
export default class NotifyAction_ClubChat extends NotifyActionBase {
    // ===================== 重写父类方法 - 获取当前通知类型 核心标识 =====================
    public getType(): number|string {
        return NotifyType.CLUB_CHAT;
    }

    // ===================== 重写父类方法 - 追加通知前的前置校验 =====================
    public beforeAppend(data: any): void {
        const infoBase = data.infoBase;
        TSUtility.isValid(infoBase);
    }

    // ===================== 重写父类核心方法 - 执行俱乐部聊天通知的具体动作 =====================
    public action(data: any): void {
        const infoBase = data.infoBase;
        if (TSUtility.isValid(infoBase)) {
            // 派发俱乐部新增聊天消息的全局事件
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.CLUB_ADD_CHAT_MESSAGE, infoBase);
            this.done();
        } else {
            this.done();
        }
    }
}