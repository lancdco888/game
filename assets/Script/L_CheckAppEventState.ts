import FireHoseSender, { FHLogType } from "./FireHoseSender";
import State from "./Slot/State";
import AppEventManager from "./manager/AppEventManager";
import LocalStorageManager from "./manager/LocalStorageManager";

const { ccclass, property } = cc._decorator;


/**
 * 检查App事件状态类
 * 负责登录流程中检查App事件相关标记，初始化事件管理器，并完成埋点统计和异常处理
 */
@ccclass()
export default class L_CheckAppEventState extends State {
    /**
     * 启动检查App事件流程
     */
    public onStart(): void {
        cc.log("L_CheckAppEventState");
        this.doProcess();
    }

    /**
     * 核心处理逻辑（异步执行，包含异常捕获）
     */
    public async doProcess(): Promise<void> {
        try {
            // 1. 埋点：检查App事件流程开始
            //Analytics.default.checkAppEventStart();

            // 2. 检查本地存储的TrackMistPlay标记，为true则初始化AppEventManager
            if (LocalStorageManager.GetTrackMistPlay()) {
                AppEventManager.Init();
            }

            // 3. 埋点：检查App事件流程完成
            //Analytics.checkAppEventComplete();

            // 4. 标记当前状态处理完成
            this.setDone();
        } catch (error) {
            // 全局异常捕获：上报到FireHose日志系统
            FireHoseSender.Instance().sendAws(
                FireHoseSender.Instance().getRecord(FHLogType.Exception, error)
            );
        }
    }
}