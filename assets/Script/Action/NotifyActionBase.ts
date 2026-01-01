import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import HRVSlotService from "../HRVService/HRVSlotService";
import LobbyScene from "../LobbyScene";
import UserInfo from "../User/UserInfo";
import { NotifyType } from "../Notify/NotifyManager";

const { ccclass, property } = cc._decorator;

/** 通知行为基类 - 所有通知Action的父类，继承Component */
@ccclass
export default class NotifyActionBase extends cc.Component {
    /** 待处理的通知队列 */
    protected _arrNotify: any[] = [];
    /** 通知执行完成状态标记 */
    protected _isDone: boolean = true;

    /** 获取当前通知类型 默认NONE，子类重写实现 */
    public getType(): number {
        return NotifyType.NONE;
    }

    /** 只读属性 - 获取大厅场景实例 */
    public get lobbyScene(): LobbyScene {
        return LobbyScene.instance;
    }

    /** 只读属性 - 获取大厅UI实例 */
    public get lobbyUI(): any {
        return this.lobbyScene.UI;
    }

    /** 只读属性 - 获取游戏内UI实例 */
    public get inGameUI(): any {
        return HRVSlotService.default.instance().getInGameUI();
    }

    /**
     * 追加通知数据到队列/执行
     * @param data 通知数据体
     */
    public append(data: any): void {
        if (TSUtility.isValid(data)) {
            // 预处理逻辑 子类可重写
            this.beforeAppend(data);
            // 无执行中任务则立即执行，否则加入队列缓存
            if (this._isDone ) {
                this._isDone = false;
                this.action(data);
            } else {
                this._arrNotify.push(data);
            }
        }
    }

    /**
     * 通知执行完成 消费队列中的下一条通知
     * 子类执行完业务逻辑后必须调用此方法
     */
    public done(): void {
        if (this._arrNotify.length <= 0) {
            // 队列为空 重置执行状态
            this._isDone = true;
        } else {
            // 取出队列第一条继续执行
            const nextData = this._arrNotify.shift();
            if (TSUtility.isValid(nextData)) {
                this.action(nextData);
            } else {
                this.done();
            }
        }
    }

    /** 追加数据前的预处理钩子 - 空实现，子类按需重写 */
    public beforeAppend(data: any): void { }

    /** 通知核心业务逻辑 - 空实现，子类必须重写实现 */
    public action(data: any): void { }

    /** 判断当前是否是大厅场景 */
    public isLobbyScene(): number {
        return UserInfo.default.instance().getCurrentSceneMode() == SDefine.Lobby ? 1 : 0;
    }

    /** 判断当前是否是SLOT游戏场景 */
    public isSlotScene(): number {
        return UserInfo.default.instance().getCurrentSceneMode() == SDefine.Slot ? 1 : 0;
    }

    /** 判断【有效】的大厅场景：是大厅+大厅UI实例有效 */
    public isValidLobbyScene(): number {
        return (this.isLobbyScene() === 1 && TSUtility.isValid(this.lobbyUI)) ? 1 : 0;
    }

    /** 判断【有效】的游戏场景：是SLOT+游戏内UI实例有效 */
    public isValidSlotScene(): number {
        return (this.isSlotScene() === 1 && TSUtility.isValid(this.inGameUI)) ? 1 : 0;
    }
}