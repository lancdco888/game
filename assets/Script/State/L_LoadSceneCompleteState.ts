import State from "../Slot/State";

const { ccclass, property } = cc._decorator;


/**
 * 场景加载完成状态类
 * 负责标记场景加载完成，并上报加载完成埋点
 */
@ccclass()
export default class L_LoadSceneCompleteState extends State {

    /**
     * 状态启动入口
     */
    public onStart(): void {
        this._done = false;
        this.doProcess();
    }

    /**
     * 核心处理流程
     */
    private doProcess(): void {
        cc.log("L_LoadLobbySceneCompleteState start");
        // 标记状态完成
        this.setDone();
        // 上报加载完成埋点
        //Analytics.loadingComplete();
        cc.log("L_LoadLobbySceneCompleteState end");
    }
}

/**
 * 加载埋点记录状态类
 * 负责上报指定名称的加载埋点
 */
@ccclass()
export class L_LoadingRecordAnalyticsState extends State {
    // 埋点记录名称
    public recordName: string = "";

    /**
     * 构造函数
     * @param recordName 埋点记录名称
     */
    constructor(recordName: string) {
        super();
        this.recordName = "";
        this.recordName = recordName;
    }

    /**
     * 状态启动入口
     */
    public onStart(): void {
        this._done = false;
        this.doProcess();
    }

    /**
     * 核心处理流程（上报埋点）
     */
    private doProcess(): void {
        // 上报自定义加载埋点
        //Analytics.default.customLoadingRecord(this.recordName);
        // 标记状态完成
        this.setDone();
    }
}