const { ccclass } = cc._decorator;

// 依赖导入 - 与混淆源码的模块映射完全一致
import State from "../Slot/State";
import UserInfo from "../User/UserInfo";
import FireHoseSender, { FHLogType } from "../FireHoseSender";

@ccclass("L_RefreshHeroInfoState")
export default class L_RefreshHeroInfoState extends State {

    /**
     * 状态启动生命周期方法 (继承自父类 State)
     */
    public onStart(): void {
        cc.log("L_RefreshHeroInfoState start");
        // 注册状态执行完毕的回调函数
        this.addOnEndCallback(() => {
            cc.log("L_RefreshHeroInfoState end");
        });
        // 执行当前状态的核心业务逻辑
        this.doProcess();
    }

    /**
     * 核心业务：异步刷新英雄信息数据
     */
    private async doProcess(): Promise<void> {
        try {
            // 调用用户信息单例 异步刷新英雄数据
            await UserInfo.instance().asyncRefreshHeroInfo();
            // 数据刷新成功，标记当前状态执行完成
            this.setDone();
        } catch (error) {
            // 捕获所有异常 & 上报异常日志至AWS FireHose
            FireHoseSender.Instance().sendAws(
                FireHoseSender.Instance().getRecord(FHLogType.Exception, error)
            );
        }
    }
}