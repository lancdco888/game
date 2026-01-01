const { ccclass } = cc._decorator;

// ===================== 导入所有依赖模块 - 路径与原JS完全一致 =====================
import TSUtility from "../global_utility/TSUtility";
import PopupManager from "../manager/PopupManager";
import TutorialBase from "./TutorialBase";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import ServiceInfoManager from "../ServiceInfoManager";
import UserInfo from "../User/UserInfo";
import LobbySceneUI from "../LobbySceneUI";
import LobbyUIBase, { LobbyUIType } from "../LobbyUIBase";
import { LobbySceneUIType } from "../SceneInfo";

// ===================== 原JS字符串枚举 完整复刻 - TS标准字符串枚举 =====================
export enum LobbyTutorialType {
    NONE = "None",
    LOBBY_FIRST = "LobbyFirst",
    LOBBY_CENTURION = "LobbyCenturion",
    LOBBY_MOVE_HIGH_ZONE = "LobbyMoveHighZone"
}

export enum LobbyTutorialCheckType {
    NONE = "None",
    FINISH_ENTER_ACTION = "FinishEnterAction",
    CHANGE_SCENE = "ChangeScene",
    START_POPUP_OPEN = "StartPopupOpen"
}

// ✅ 核心修复: 自定义Component组件 必须使用 空的@ccclass() 无类名字符串 - 杜绝类名报错
@ccclass()
export default class LobbyTutorial extends LobbyUIBase {
    // ===================== 常量配置 - 引导预制体路径/名称 原JS完整复刻 =====================
    private readonly TUTORIAL_PREFAB_PATH: string = "Service/01_Lobby/LobbyTutorial/";
    private readonly TUTORIAL_NAME_FIRST_LOBBY: string = "LobbyTutorial_FirstLobby";
    private readonly TUTORIAL_NAME_CENTURION: string = "LobbyTutorial_CenturionClique";
    private readonly TUTORIAL_NAME_MOVE_HIGH_ZONE: string = "LobbyTutorial_MoveHighZone";

    // ===================== 私有成员变量 - 补全精准TS类型标注 =====================
    private _curTutorial: TutorialBase | null = null;

    // ===================== 只读属性 Getter - 原JS Object.defineProperty 完整还原 =====================
    public get eType() {
        return LobbyUIType.TUTORIAL;
    }

    public get isPlaying() {
        return TSUtility.isValid(this._curTutorial);
    }

    // ===================== 核心方法 - 检测是否需要播放引导教程 异步方法还原为原生async/await =====================
    public async checkTutorial(checkType: LobbyTutorialCheckType = LobbyTutorialCheckType.NONE) {
        const lobbyUIType = this.lobbyUIType;
        // 场景类型为空 直接返回
        if (lobbyUIType === LobbySceneUIType.NONE) return;
        
        // 已完成首次大厅引导 跳过检测
        if (ServerStorageManager.getAsBoolean(StorageKeyType.IS_LOBBY_TUTORIAL_FIRST_ENTER)) return;

        // 大厅首次进入引导 触发条件
        if (lobbyUIType === LobbySceneUIType.LOBBY && checkType === LobbyTutorialCheckType.FINISH_ENTER_ACTION) {
            // 创建时间阈值 + 等级≥15 触发引导
            if (this.numUserLevel >= 15) {
                await this.playTutorial(LobbyTutorialType.LOBBY_FIRST);
            }
        }

        // 高分区跳转引导 触发条件
        if (checkType === LobbyTutorialCheckType.START_POPUP_OPEN && ServiceInfoManager.STRING_SWITCH_TO_HIGH_SLOT_ID !== "") {
            await this.playTutorial(LobbyTutorialType.LOBBY_MOVE_HIGH_ZONE);
        }
    }

    // ===================== 核心方法 - 播放指定类型的引导教程 异步方法 =====================
    public async playTutorial(tutorialType: LobbyTutorialType, callback?: Function | null) {
        if (callback === void 0) callback = null;
        if (tutorialType === LobbyTutorialType.NONE) return;

        let tutorialComp: TutorialBase = null;
        // 根据引导类型加载对应预制体
        switch (tutorialType) {
            case LobbyTutorialType.LOBBY_FIRST:
                tutorialComp = await this.createTutorial(this.TUTORIAL_NAME_FIRST_LOBBY);
                break;
            case LobbyTutorialType.LOBBY_CENTURION:
                tutorialComp = await this.createTutorial(this.TUTORIAL_NAME_CENTURION);
                break;
            case LobbyTutorialType.LOBBY_MOVE_HIGH_ZONE:
                tutorialComp = await this.createTutorial(this.TUTORIAL_NAME_MOVE_HIGH_ZONE);
                break;
            default:
                return;
        }

        // 播放引导教程
        if (TSUtility.isValid(tutorialComp)) {
            this._curTutorial = tutorialComp;
            // await new Promise<void>(resolve => {
            //     tutorialComp!.startTutorial(() => {
            //         // 执行回调函数
            //         if (TSUtility.isValid(callback)) {
            //             callback!();
            //         }
            //         resolve();
            //     });
            // });
        }
        // 播放完成 清空当前引导组件
        this._curTutorial = null;
    }

    // ===================== 核心方法 - 加载并创建引导预制体 异步加载资源 =====================
    public async createTutorial(prefabName: string): Promise<TutorialBase | null> {
        return new Promise<TutorialBase | null>((resolve, reject) => {
            // 显示遮罩层
            PopupManager.Instance().showBlockingBG(true);
            // 加载预制体资源
            cc.loader.loadRes(this.TUTORIAL_PREFAB_PATH + prefabName, (error, prefab) => {
                if (error) {
                    PopupManager.Instance().showBlockingBG(false);
                    reject(null);
                    return;
                }

                // 实例化预制体并挂载到当前节点
                const tutorialNode = cc.instantiate(prefab);
                tutorialNode.parent = this.node;
                
                // 获取引导基类组件
                const tutorialComp = tutorialNode.getComponent(TutorialBase);
                if (TSUtility.isValid(tutorialComp)) {
                    tutorialComp.node.active = true;
                    resolve(tutorialComp);
                } else {
                    reject(null);
                }
                // 隐藏遮罩层
                PopupManager.Instance().showBlockingBG(false);
            });
        });
    }
}