import LoadingPopup, { LoadingBGType } from "../Popup/LoadingPopup";
import State from "../Slot/State";
import SlotTourneyManager, { SlotTourneyTierType } from "./SlotTourneyManager";


/**
 * 从Launcher加载到Slot的状态类
 * 负责初始化加载弹窗、配置锦标赛信息、设置加载进度、完成场景加载后标记状态结束
 */
export default class L_LoadLauncherToSlotState extends State {
    /**
     * 状态启动方法（State基类生命周期）
     */
    onStart(): void {
        // 打印状态启动日志
        cc.log("L_LoadLauncherToSlotState start");
        
        // 绑定状态结束回调，打印结束日志
        this.addOnEndCallback(() => {
            cc.log("L_LoadLauncherToSlotState end");
        });

        // 获取加载弹窗并初始化，回调执行核心加载流程
        LoadingPopup.getPopup(
            LoadingBGType.Login_To_Lobby, // 加载背景类型
            0,                           // 优先级
            "",                          // 额外信息
            (isError: boolean, popup: LoadingPopup) => {
                // 无错误时执行核心加载流程
                if (!isError) {
                    this.doProcess(popup);
                }
            }
        );
    }

    /**
     * 核心加载流程
     * @param loadingPopup 加载弹窗实例
     */
    private doProcess(loadingPopup: LoadingPopup): void {
        // // 1. 获取登录流程的核心配置
        // const loginProcess = loginProcess.Instance();
        // const targetSceneName = loginProcess.sceneName;
        // const introPopup = loginProcess.introPopup;
        // const tourneyID = loginProcess.tourneyID;
        // const tourneyTier = loginProcess.tourneyTier;

        // // 2. 配置锦标赛信息（仅当锦标赛ID有效且层级合法时）
        // if (tourneyID !== 0 && tourneyTier !== SlotTourneyTierType.INVALID) {
        //     SlotTourneyManager.Instance().setEnterSlotTourney(tourneyTier, tourneyID);
        // }

        // // 3. 绑定加载弹窗的进度条和信息标签
        // loadingPopup.progressBar = introPopup.progressBar;
        // loadingPopup.infoLabel = introPopup.infoLabel;

        // // 4. 调整introPopup的节点层级（移除常驻节点→脱离原父级→添加到加载弹窗根节点）
        // introPopup.removePresistNode();
        // introPopup.node.removeFromParent(false); // false: 不销毁节点，仅移除父子关系
        // loadingPopup.rootNode.addChild(introPopup.node);
        // introPopup.node.setPosition(cc.Vec2.ZERO); // 重置位置到根节点原点

        // // 5. 配置加载弹窗显示逻辑
        // loadingPopup.setOpenFadeIn(false); // 关闭淡入动画
        // loadingPopup.open(targetSceneName, 4, 5, 1); // 打开弹窗并加载指定场景（参数：场景名、加载参数1/2/3）
        // loadingPopup.showProgressInfo(true); // 显示进度信息
        // loadingPopup.setPreProgress(1, "Loading ...", true); // 设置初始进度（进度值、提示文本、是否显示）

        // // 6. 绑定场景加载完成回调，标记状态结束
        // loadingPopup.setOnLoadCompletaFunc(() => {
        //     cc.log("load loading Popup doProcess end");
        //     this.setDone(); // 通知State基类：当前状态完成
        // });
    }
}