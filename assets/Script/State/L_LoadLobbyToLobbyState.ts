import State from "../Slot/State";
import LoadingPopup, { LoadingBGType } from "../Popup/LoadingPopup";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import ServiceInfoManager from "../ServiceInfoManager";
import HRVServiceUtil from "../HRVService/HRVServiceUtil";

export default class L_LoadLobbyToLobbyState extends State {
    /** 目标区服ID */
    public zoneId: number = 0;
    /** 目标区服名称 */
    public zoneName: string = "";

    /**
     * 构造函数 - 初始化切换的目标区服ID和区服名称
     * @param zoneId 目标区服ID
     * @param zoneName 目标区服名称
     */
    constructor(zoneId: number, zoneName: string) {
        super();
        this.zoneId = zoneId;
        this.zoneName = zoneName;
    }

    /**
     * 状态启动生命周期方法 - 父类State基类继承的核心入口
     */
    public onStart(): void {
        cc.log("L_LoadLobbyToLobbyState start");
        // 注册状态结束回调，打印结束日志
        this.addOnEndCallback(() => {
            cc.log("L_LoadLobbyToLobbyState end");
        });

        // ✅ 核心重置逻辑：清空上一次大厅的老虎机游戏ID和锦标赛标记
        ServiceInfoManager.STRING_LAST_LOBBY_SLOT_GAME_ID = "";
        ServiceInfoManager.BOOL_LAST_LOBBY_SLOT_TOURNEY = false;

        // 获取【大厅→大厅】的专属加载弹窗，加载成功后执行业务逻辑
        LoadingPopup.getPopup(LoadingBGType.Lobby_To_Lobby, this.zoneId, this.zoneName, (isError: boolean, popupIns: LoadingPopup) => {
            if (!isError) {
                this.doProcess(popupIns);
            }
        });
    }

    /**
     * 核心异步业务处理逻辑
     * @param loadingPopup 加载弹窗实例对象
     */
    public async doProcess(loadingPopup: LoadingPopup): Promise<void> {
        try {
            // 根据目标区服名称，获取对应匹配的大厅场景名称
            const targetSceneName = HRVServiceUtil.getLobbySceneNameWithZoneName(this.zoneName);
            
            // 设置场景加载完成的回调：直接标记当前状态执行完毕，通知状态机切换
            loadingPopup.onLoadCompletaFunc(() => {
                this.setDone();
            });
            
            // 异步加载目标大厅场景
            await loadingPopup.asyncLoadLobbyScene(targetSceneName);
        } catch (error) {
            // ✅ 全局异常捕获：将错误日志上报到AWS FireHose，不阻断游戏流程
            const errorMsg = error as Error;
            FireHoseSender.Instance().sendAws(
                FireHoseSender.Instance().getRecord(FHLogType.Exception, errorMsg)
            );
        }
    }
}