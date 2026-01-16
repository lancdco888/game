// L_LoadLauncherToLobbyState.ts
"use strict";

import State from "../Slot/State";
// import LoadingPopup, { LoadingBGType } from "../../Popup/LoadingPopup/LoadingPopup";
import UserInfo from "../User/UserInfo";
import AsyncHelper from "../global_utility/AsyncHelper";
import TSUtility from "../global_utility/TSUtility";
import Analytics from "../Network/Analytics";
// import LoginProcess from "../../Login/LoginProcess";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import LoadingPopup from "../Popup/LoadingPopup";

export default class L_LoadLauncherToLobbyState extends State {
    /**
     * 状态启动入口 - 父类State的生命周期方法
     */
    public onStart(): void {
        cc.log("L_LoadLauncherToLobbyState start");
        // 添加状态结束的回调函数
        this.addOnEndCallback(() => {
            cc.log("L_LoadLauncherToLobbyState end");
        });
        // 获取「登录转大厅」的加载弹窗，加载成功后执行业务逻辑
        // LoadingPopup.getPopup(LoadingBGType.Login_To_Lobby, 0, "", (isError: boolean, popupIns: LoadingPopup) => {
        //     if (!isError) {
        //         this.doProcess(popupIns);
        //     }
        // });
    }

    /**
     * 核心业务处理逻辑 - 异步方法
     * @param loadingPopup 加载弹窗的实例对象
     */
    public async doProcess(loadingPopup: LoadingPopup): Promise<void> {
        try {
            // // 获取登录流程的核心数据
            // LoginProcess.Instance().zoneId;
            // const sceneName: string = LoginProcess.Instance().sceneName;
            // const introPopup = LoginProcess.Instance().introPopup;

            // // 绑定加载弹窗的进度条、文本UI组件
            // loadingPopup.progressBar = introPopup.progressBar;
            // loadingPopup.infoLabel = introPopup.infoLabel;

            // // 弹窗节点重挂载：移除常驻标记 -> 脱离原父节点 -> 挂载到当前状态根节点 -> 居中显示
            // introPopup.removePresistNode();
            // introPopup.node.removeFromParent(false);
            // loadingPopup.rootNode.addChild(introPopup.node);
            // introPopup.node.setPosition(cc.Vec2.ZERO);

            // // 配置场景加载参数 & 开始加载大厅场景
            // loadingPopup.setOpenFadeIn(false);
            // loadingPopup.open(sceneName, 4, 5, 1);
            // loadingPopup.showProgressInfo(true);

            // 延迟0.01秒让出主线程，保证UI刷新不卡顿（游戏开发通用优化）
            await AsyncHelper.delay(0.01);

            // 更新加载弹窗的初始进度与文本
            loadingPopup.setPreProgress(1, "Loading ...", true);

            // 获取用户登录相关的时间戳数据
            const lastLoginGap = UserInfo.instance().getUserLastLoginGapDate();
            const lastLoginDate = UserInfo.instance().getUserLastLoginDate();
            const loginInterval = lastLoginDate - lastLoginGap;
            const pstLoginTime = TSUtility.getServerBasePstBaseTime(loginInterval);
            const createDate = UserInfo.instance().getCreateDate();
            const pstCreateTime = TSUtility.getServerBasePstBaseTime(createDate);
            const nowServerTime = TSUtility.getServerBaseNowUnixTime();

            // 核心业务：判断是否为「回归用户」(创号超1天 + 上次登录超1天)，触发埋点上报
            const oneDaySecond = 86400;
            if (pstCreateTime + oneDaySecond < nowServerTime && pstLoginTime + oneDaySecond < nowServerTime) {
                Analytics.reLoginDate();
            }

            // 绑定场景加载完成的回调，标记当前状态执行完毕，通知状态机切换下一个状态
            loadingPopup.setOnLoadCompletaFunc(() => {
                cc.log("load loading Popup doProcess end");
                this.setDone();
            });
        } catch (error) {
            // 全局异常捕获：上报错误日志到AWS FireHose，不阻断游戏流程
            const errorMsg = error as Error;
            FireHoseSender.Instance().sendAws(
                FireHoseSender.Instance().getRecord(FHLogType.Exception, errorMsg)
            );
        }
    }
}