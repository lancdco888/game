import CommonServer from "../Network/CommonServer";
import State from "../Slot/State";
import UserInfo from "../User/UserInfo";

const { ccclass, property } = cc._decorator;


/**
 * 刷新用户信息状态类
 * 负责从服务器请求最新用户信息，刷新本地缓存并处理异常上报
 */
@ccclass()
export default class L_RefreshUserInfoState extends State {
    /**
     * 状态启动入口
     */
    public onStart(): void {
        cc.log("L_RefreshUserInfoState start");
        
        // 添加状态结束回调
        this.addOnEndCallback(() => {
            cc.log("L_RefreshUserInfoState end");
        });

        // 执行核心刷新流程
        this.doProcess();
    }

    /**
     * 核心刷新流程（异步请求用户信息）
     */
    private async doProcess(): Promise<void> {
        try {
            // // 从服务器获取用户信息（传入UID和AccessToken）
            // const userInfoResult = await CommonServer.Instance().getUserInfo(
            //     UserInfo.instance().getUid(),
            //     UserInfo.instance().getAccessToken()
            // );

            // cc.log("UserInfo Result: ", JSON.stringify(userInfoResult));

            // // 检查服务器响应是否出错
            // if (CommonServer.isServerResponseError(userInfoResult)) {
            //     cc.error("get UserInfo fail.");
            //     this.setDone();
            //     return;
            // }

            // 刷新本地用户信息并标记状态完成
            // UserInfo.instance().refreshUserInfo(userInfoResult);
            this.setDone();
        } catch (error) {
            // 捕获异常并上报到FireHose
            // FireHoseSender.default.Instance().sendAws(
            //     FireHoseSender.default.Instance().getRecord(FireHoseSender.default.FHLogType.Exception, error)
            // );
            console.error(error)
        }
    }
}