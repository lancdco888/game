import State from "../Slot/State";
import LoadingPopup, { LoadingBGType } from "../Popup/LoadingPopup";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import ServiceInfoManager from "../ServiceInfoManager";
import HRVServiceUtil from "../HRVService/HRVServiceUtil";

/**
 * 大厅 → 大厅 跨区服切换的核心加载状态类
 * 继承公共State基类，属于游戏状态机核心节点
 * 功能：处理从当前大厅切换到【指定区服】的另一个大厅的加载过渡逻辑
 */
export default class L_LoadLobbyToLobbyState extends State {
    /** 目标切换的游戏区服ID */
    public zoneId: number = 0;
    /** 目标切换的游戏区服名称 */
    public zoneName: string = "";

    /**
     * 构造函数 - 初始化区服ID和区服名称
     * @param zoneId 目标区服ID
     * @param zoneName 目标区服名称
     */
    constructor(zoneId: number, zoneName: string) {
        super();
        this.zoneId = zoneId;
        this.zoneName = zoneName;
    }

    /**
     * 状态启动生命周期方法 (继承自State基类核心入口)
     * 100%保留原JS逻辑：日志打印 + 回调注册 + 数据重置 + 加载弹窗调用
     */
    public onStart(): void {
        cc.log("L_LoadLobbyToLobbyState start");
        
        // 注册状态结束回调，打印结束日志
        this.addOnEndCallback(() => {
            cc.log("L_LoadLobbyToLobbyState end");
        });

        // ✅ 核心逻辑：清空上一次大厅的老虎机游戏数据缓存，防止跨区服数据残留
        ServiceInfoManager.STRING_LAST_LOBBY_SLOT_GAME_ID = "";
        ServiceInfoManager.BOOL_LAST_LOBBY_SLOT_TOURNEY = false;

        // 获取【大厅→大厅】专属加载弹窗，加载成功后执行核心业务逻辑
        LoadingPopup.getPopup(LoadingBGType.Lobby_To_Lobby, this.zoneId, this.zoneName, (isError: any, popupIns: LoadingPopup) => {
            if (!isError) {
                this.doProcess(popupIns);
            }
        });
    }

    /**
     * 核心异步业务处理逻辑
     * @param loadingPopup 加载弹窗实例对象
     * 原JS核心逻辑：动态匹配区服对应大厅场景 + 异步加载场景 + 加载完成标记状态 + 异常捕获上报
     */
    public async doProcess(loadingPopup: LoadingPopup): Promise<void> {
        try {
            // 根据【区服名称】动态获取对应匹配的大厅场景名 - 多区服多大厅核心适配逻辑
            const targetSceneName = HRVServiceUtil.getLobbySceneNameWithZoneName(this.zoneName);
            
            // 设置场景加载完成的回调：标记当前状态执行完毕，触发状态机切换
            loadingPopup.onLoadCompletaFunc(() => {
                this.setDone();
            });
            
            // 异步加载目标大厅场景 (LoadingPopup的核心异步方法)
            await loadingPopup.asyncLoadLobbyScene(targetSceneName);
        } catch (error) {
            // ✅ 全局异常捕获：加载失败时上报异常日志到AWS FireHose，不阻断游戏流程
            const errInfo = error as Error;
            FireHoseSender.Instance().sendAws(
                FireHoseSender.Instance().getRecord(FHLogType.Exception, errInfo)
            );
        }
    }
}