const { ccclass } = cc._decorator;

// 导入依赖模块
import State from "../Slot/State";
import UserInfo from "../User/UserInfo";
import FireHoseSender, { FHLogType } from "../FireHoseSender";

@ccclass("L_RefreshJackpotState")
export default class L_RefreshJackpotState extends State {

    /**
     * 状态启动时执行 (父类State的生命周期方法)
     */
    public onStart(): void {
        cc.log("L_RefreshJackpotState start");
        
        // 添加状态结束的回调函数
        this.addOnEndCallback(() => {
            cc.log("L_RefreshJackpotState end");
        });

        // 执行核心业务逻辑
        this.doProcess();
    }

    /**
     * 核心业务：异步刷新Jackpot大奖池数据
     */
    private async doProcess(): Promise<void> {
        try {
            // 调用用户信息模块 - 强制刷新Jackpot大奖信息
            await UserInfo.instance().asyncRefreshJackpotInfo(true);
            // 刷新成功，标记当前状态执行完成
            this.setDone();
        } catch (error) {
            // 异常捕获：上报异常日志到AWS FireHose
            FireHoseSender.Instance().sendAws(
                FireHoseSender.Instance().getRecord(FHLogType.Exception, error)
            );
        }
    }
}