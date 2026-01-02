// L_LoadSlotToLobbyState.ts
"use strict";

import State from "../Slot/State";
import LoadingPopup, { LoadingBGType } from "../../Popup/LoadingPopup/LoadingPopup";
import SlotManager from "../manager/SlotManager";
import SDefine from "../global_utility/SDefine";

export default class L_LoadSlotToLobbyState extends State {
    /** 游戏区服ID */
    public zoneId: number = 0;
    /** 游戏区服名称 */
    public zoneName: string = SDefine.HIGHROLLER_ZONENAME;
    /** 场景名称 */
    public sceneName: string = "";

    /**
     * 构造函数 - 初始化区服ID和区服名称
     * @param zoneId 区服ID
     * @param zoneName 区服名称
     */
    constructor(zoneId: number, zoneName: string) {
        super();
        this.zoneId = zoneId;
        this.zoneName = zoneName;
    }

    /**
     * 状态启动生命周期方法 - 父类State基类继承
     */
    public onStart(): void {
        cc.log("L_LoadSlotToLobbyState start");
        // 添加状态结束的回调函数，打印结束日志
        this.addOnEndCallback(() => {
            cc.log("L_LoadSlotToLobbyState end");
        });
        // 获取老虎机管理器的当前区服ID
        SlotManager.Instance.getZoneId();
        // 获取【老虎机→大厅】的专属加载弹窗，加载成功后执行业务逻辑
        LoadingPopup.getPopup(LoadingBGType.Slot_To_Lobby, this.zoneId, this.zoneName, (isError: boolean, popupIns: LoadingPopup) => {
            if (!isError) {
                this.doProcess(popupIns);
            }
        });
    }

    /**
     * 核心业务处理逻辑
     * @param loadingPopup 加载弹窗实例对象
     */
    public doProcess(loadingPopup: LoadingPopup): void {
        const self = this;
        // 设置加载完成的回调函数
        loadingPopup.setOnLoadCompletaFunc(() => {
            // 延迟0帧执行状态完成标记 - Cocos经典优化：避免帧内逻辑阻塞/节点渲染异常
            loadingPopup.scheduleOnce(() => {
                self.setDone();
            }, 0);
        });
        // 异步加载大厅场景 L_Lobby
        loadingPopup.asyncLoadLobbyScene("L_Lobby");
    }
}