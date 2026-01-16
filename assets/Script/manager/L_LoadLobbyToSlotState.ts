import LobbyScene from "../LobbyScene";
import LoadingPopup, { LoadingBGType } from "../Popup/LoadingPopup";
import ServiceInfoManager from "../ServiceInfoManager";
import State, { ConcurrentState, SequencialState } from "../Slot/State";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";
import SlotTourneyManager from "./SlotTourneyManager";

const { ccclass } = cc._decorator;

/**
 * 大厅跳转到Slots场景的加载状态类（继承自State状态基类）
 * 负责Loading弹窗控制、资源加载状态管理、屏幕方向切换、埋点记录等逻辑
 */
@ccclass()
export default class L_LoadLobbyToSlotState extends State {
    // ===== 私有属性 =====
    private infoNode: cc.Node = null;
    private _info: {
        slotID: string | number;
        zoneID: string | number;
        zoneName: string;
        sceneName: string;
    } | null = null;

    /**
     * 状态启动入口
     */
    public onStart(): void {
        cc.log("L_LoadLobbyToSlotState start");
        
        // 添加状态结束回调
        this.addOnEndCallback(() => {
            cc.log("L_LoadLobbyToSlotState end");
        });

        // 解析跳转Slots的信息（从ServiceInfoManager读取）
        this._info = JSON.parse(ServiceInfoManager.STRING_MOVE_SLOT_INFO);
        // 记录最后一次大厅Slots游戏ID和锦标赛状态
        ServiceInfoManager.STRING_LAST_LOBBY_SLOT_GAME_ID = this._info.slotID;
        ServiceInfoManager.BOOL_LAST_LOBBY_SLOT_TOURNEY = SlotTourneyManager.Instance().isEnterSlotTourney();

        // 获取Loading弹窗并执行加载流程
        LoadingPopup.getPopup(
            LoadingBGType.Slot,
            this._info.zoneID,
            this._info.zoneName,
            (isCancel: boolean, popup: any) => {
                if (!isCancel) {
                    this.doProcess(popup);
                }
            }
        );
    }

    /**
     * 核心加载流程（初始化Loading弹窗+状态管理）
     * @param popup LoadingPopup实例
     */
    private doProcess(popup: any): void {
        // 配置Loading弹窗并打开
        popup.setOpenFadeIn(false);
        popup.open(this._info!.sceneName, 1, 6, 1);

        // 创建并行状态管理器
        const concurrentState = new ConcurrentState();

        // 非调试模式下，插入Banner和信息加载状态
        if (!SDefine.Use_LoadingPopup_Debug_Flag) {
            concurrentState.insert(this.getMoveBannerAndShowInfoState(popup));
        }

        // 插入等待加载完成的状态
        concurrentState.insert(this.getWaitUntilLoad(popup));

        // // 非直播服务且Slots为竖屏时，切换屏幕方向（仅移动端）
        // if (!TSUtility.isLiveService() && SDefine.getSlotSceneInfo(this._info!.slotID).isPortrait === 1) {
        //     concurrentState.addOnStartCallback(() => {
        //         if (Utility.isMobileGame()) {
        //             const frameSize = cc.view.getFrameSize();
        //             // 切换视图尺寸和方向
        //             cc.view.setFrameSize(frameSize.height, frameSize.width);
        //             cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);

        //             // 原生层切换屏幕方向（iOS/Android区分）
        //             if (cc.sys.os === "ios") {
        //                 jsb.reflection.callStaticMethod("RootViewController", "setOrientation:", "2");
        //                 jsb.reflection.callStaticMethod("AppController", "setOrientation:", "2");
        //             } else {
        //                 jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "setOrientation", "(I)V", 2);
        //             }
        //         }
        //     });
        // }

        // 并行状态结束回调：记录埋点+标记当前状态完成
        concurrentState.addOnEndCallback(() => {
            //Analytics.default.customSlotLoadingRecord("load_slotscene_complete");
            this.setDone();
        });

        // 启动并行状态
        concurrentState.onStart();
    }

    /**
     * 创建等待加载完成的状态
     * @param popup LoadingPopup实例
     * @returns 等待加载状态实例
     */
    private getWaitUntilLoad(popup: any): State {
        const waitState = new State();
        
        waitState.addOnStartCallback(() => {
            // 设置Loading弹窗的加载完成/失败回调
            popup.setOnLoadCompletaFunc(() => {
                waitState.setDone();
            });
            popup.setOnLoadFailFunc(() => {
                // 加载失败时重置场景移动状态
                LobbyScene.instance.mgrLobbyUIMove.isMoveScene = false;
            });
            // 设置加载进度提示
            popup.setPreProgress(1, "Loading ...", true);
        });

        return waitState;
    }

    /**
     * 创建Banner和信息加载+显示的串行状态
     * @param popup LoadingPopup实例
     * @returns 串行状态实例
     */
    private getMoveBannerAndShowInfoState(popup: any): SequencialState {
        const sequencialState = new SequencialState();
        let step = 0;

        // 步骤0：加载Banner图片 + 加载Slots信息（并行）
        sequencialState.insert(step, this.getLoadBannerImg());
        sequencialState.insert(step, this.getLoadInfo());
        step++;

        // 步骤1：显示Slots信息
        sequencialState.insert(step, this.getShowInfo());

        return sequencialState;
    }

    /**
     * 创建加载Slots信息的状态
     * @returns 加载信息状态实例
     */
    private getLoadInfo(): State {
        const loadInfoState = new State("getLoadInfo");
        
        loadInfoState.addOnStartCallback(() => {
            LoadingPopup.loadSlotInfo(this._info!.slotID, (node: cc.Node) => {
                this.infoNode = node;
                loadInfoState.setDone();
            });
        });

        return loadInfoState;
    }

    /**
     * 创建加载Slots Banner图片的状态
     * @returns 加载Banner状态实例
     */
    private getLoadBannerImg(): State {
        const loadBannerState = new State("getLoadBannerImg");
        
        loadBannerState.addOnStartCallback(() => {
            LoadingPopup.loadSlotBannerImg(this._info!.slotID, () => {
                loadBannerState.setDone();
            });
        });

        return loadBannerState;
    }

    /**
     * 创建显示Slots信息的状态
     * @returns 显示信息状态实例
     */
    private getShowInfo(): State {
        const showInfoState = new State();
        
        showInfoState.addOnStartCallback(() => {
            // 标记状态完成
            showInfoState.setDone();
            // 记录埋点
            //Analytics.default.customSlotLoadingRecord("load_slotShowInfo_complete");
            
            // 信息节点淡入显示
            if (this.infoNode != null) {
                this.infoNode.opacity = 0;
                this.infoNode.runAction(
                    cc.sequence(
                        cc.fadeIn(0.3),
                        cc.callFunc(() => {})
                    )
                );
            }
        });

        return showInfoState;
    }
}