import FireHoseSender, { FHLogType } from "./FireHoseSender";
import LoginProcess, { LoadingBGInfo } from "./LoginProcess";
import Analytics from "./Network/Analytics";
import CommonPopup from "./Popup/CommonPopup";
import State from "./Slot/State";
import TSUtility from "./global_utility/TSUtility";

const { ccclass, property } = cc._decorator;



/**
 * Slot背景加载状态类
 * 负责根据环境（测试/正式）和时间区间选择并加载对应的Slot背景资源
 */
@ccclass()
export default class L_LoadSlotBGState extends State {
    /**
     * 启动背景加载流程
     */
    public onStart(): void {
        // 初始化埋点
        ///Analytics.default.loadSlotBGStart();

        // 1. 测试模式：直接加载指定背景
        if (TSUtility.isTestDirectSlotMode()) {
            const testBGInfo = new LoadingBGInfo();
            // 测试背景：b2bslot，时间设置到2099年
            testBGInfo.initData(
                "b2bslot",
                false,
                0,
                TSUtility.getPstToUtcTimestamp(Date.UTC(2099, 4, 13, 22, 30, 0) / 1000),
                true
            );
            LoginProcess.Instance().selectLoadingBg = testBGInfo;
        } 
        // 2. 正式模式：按时间区间选择背景
        else {
            const bgInfoList: LoadingBGInfo[] = [];
            
            // 定义时间戳（PST转UTC）
            const endTime1 = TSUtility.getPstToUtcTimestamp(Date.UTC(2025, 11, 18, 0, 0, 0) / 1000);
            const startTime1 = TSUtility.getPstToUtcTimestamp(Date.UTC(2025, 11, 13, 0, 0, 0) / 1000);
            const endTime2 = TSUtility.getPstToUtcTimestamp(Date.UTC(2099, 4, 13, 22, 30, 0) / 1000);

            // 背景1：twilightdraon（预热阶段）
            const bgInfo1 = new LoadingBGInfo();
            bgInfo1.initData(
                "twilightdraon",
                true,
                0,
                TSUtility.isLiveService() ? endTime1 - 1 : startTime1 - 1
            );
            bgInfoList.push(bgInfo1);

            // 背景2：twilightdraon（正式阶段）
            const bgInfo2 = new LoadingBGInfo();
            bgInfo2.initData(
                "twilightdraon",
                true,
                TSUtility.isLiveService() ? endTime1 : startTime1,
                endTime2
            );
            bgInfoList.push(bgInfo2);

            // 遍历时间区间，选择当前生效的背景
            const currentTime = TSUtility.getServerBaseNowUnixTime();
            for (const bgInfo of bgInfoList) {
                if (currentTime >= bgInfo.startTime && currentTime <= bgInfo.endTime) {
                    LoginProcess.Instance().selectLoadingBg = bgInfo;
                    break; // 找到匹配的背景后退出循环
                }
            }
        }

        // 加载选中的Slot背景资源
        this.loadSlotIntro(LoginProcess.Instance().selectLoadingBg.gameId, (node: cc.Node | null) => {
            cc.log("L_LoadSlotBGState complete");
            if (node !== null) {
                // 加载成功：完成埋点并标记状态结束
                //Analytics.default.loadSlotBGComplete();
                this.setDone();
            } else {
                // 加载失败：显示错误弹窗
                CommonPopup.loginErrorPopup("Load Slot BG fail");
            }
        });
    }

    /**
     * 加载指定GameId的Slot背景资源
     * @param gameId Slot游戏ID
     * @param callback 加载完成回调（参数：成功返回实例化节点，失败返回null）
     */
    private loadSlotIntro(gameId: string, callback: (node: cc.Node | null) => void): void {
        const resourcePath = `Loading/SlotIntro/i_${gameId}`;
        
        // 加载资源
        cc.loader.loadRes(resourcePath, (error: Error | null, prefab: cc.Prefab) => {
            if (error) {
                // 加载失败：回调null并上报异常到FireHose
                callback(null);
                const errorObj = new Error(`cc.loader.loadRes fail ${gameId}: ${JSON.stringify(error)}`);
                FireHoseSender.Instance().sendAws(
                    FireHoseSender.Instance().getRecord(FHLogType.Exception, errorObj)
                );
            } else {
                // 加载成功：实例化节点并保存到LoginProcess
                const bgNode = cc.instantiate(prefab);
                LoginProcess.Instance().slotBgItem = bgNode;
                callback(bgNode);
            }
        });
    }
}