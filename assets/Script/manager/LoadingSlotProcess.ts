// 导入Cocos核心模块

import { L_GetBingoGameInfoState, L_GetInstantInfoState } from '../Loading/LoadingLobbyProcess';
import CommonServer from '../Network/CommonServer';
import State, { SequencialState } from '../Slot/State';
import L_LoadSceneCompleteState from '../State/L_LoadSceneCompleteState';
import L_RefreshHeroInfoState from '../State/L_RefreshHeroInfoState';
import L_RefreshUserInfoState from '../State/L_RefreshUserInfoState';
import UserInfo from '../User/UserInfo';
import L_IngameUILoadState from './L_IngameUILoadState';
import L_LoadLauncherToSlotState from './L_LoadLauncherToSlotState';
import L_LoadLobbyToSlotState from './L_LoadLobbyToSlotState';
import L_SlotInitState from './L_SlotInitState';

/**
 * 内部状态类：获取收件箱信息
 * 负责请求服务器收件箱数据，处理异常并刷新用户信息
 */
class L_GetInboxInfoState extends State {
    public _done: boolean = false;

    /**
     * 状态启动方法
     */
    public onStart(): void {
        this._done = false;
        this.doProcess();
    }

    /**
     * 核心处理流程（异步请求收件箱信息）
     */
    private async doProcess(): Promise<void> {
        try {
            // 1. 请求服务器收件箱信息
            const response = await CommonServer.Instance().asyncRequestInboxInfo(
                UserInfo.instance().getUid(),
                UserInfo.instance().getAccessToken()
            );

            // 2. 处理服务器响应错误
            if (CommonServer.isServerResponseError(response)) {
                const error = new Error("L_GetInboxInfoState fail");
                // // 上报异常到AWS FireHose
                // FireHoseSender.Instance().sendAws(
                //     FireHoseSender.Instance().getRecord(FHLogType.Exception, error)
                // );
                // // 兜底空收件箱数据
                // UserInfo.instance().refreshInboxInfo([]);
            } else {
                // 3. 刷新用户收件箱信息
                // UserInfo.instance().refreshInboxInfo(response.inbox || []);
            }
        } catch (error) {
            // 捕获未知异常，上报并兜底
            // const err = error as Error;
            // FireHoseSender.Instance().sendAws(
            //     FireHoseSender.Instance().getRecord(FHLogType.Exception, err)
            // );
            // UserInfo.instance().refreshInboxInfo([]);
        }

        // 标记状态完成
        this.setDone();
    }

    /**
     * 标记状态完成
     */
    public setDone(): void {
        this._done = true;
        // this.onDoneCallback(); // 假设State基类有完成回调（原代码隐含逻辑）
    }
}

/**
 * 老虎机加载流程管理器
 * 单例模式，负责构建不同场景（Launcher→Slot/Lobby→Slot/Slot→Slot）的加载状态流程，管理预制件
 */
export default class LoadingSlotProcess extends State {
    // ===================== 单例相关 =====================
    private static _instance: LoadingSlotProcess | null = null;

    /**
     * 获取单例实例（懒加载+初始化）
     */
    public static Instance(): LoadingSlotProcess {
        if (LoadingSlotProcess._instance === null) {
            LoadingSlotProcess._instance = new LoadingSlotProcess();
        }
        LoadingSlotProcess._instance.init();
        return LoadingSlotProcess._instance;
    }

    // ===================== 成员变量 =====================
    /** 游戏内UI节点/预制件 */
    public ingameUI: any = null;
    /** 服务预制件缓存（key: 预制件名称, value: 预制件实例） */
    private servicePrefabs: Record<string, any> = {};

    // ===================== 初始化 =====================
    /**
     * 初始化方法（原代码为空，保留扩展能力）
     */
    public init(): void {}

    // ===================== 加载状态构建 =====================
    /**
     * 构建从Launcher到Slot的加载状态流程
     * @returns 序列化状态对象
     */
    public getLauncherToSlotState(): SequencialState {
        const rootState = new SequencialState();
        let seqIndex = 0;
        let subIndex = 0;

        // 子状态1：加载Slot+游戏UI+埋点
        const loadSlotSubState = new SequencialState();
        loadSlotSubState.insert(subIndex, new L_LoadLauncherToSlotState());
        loadSlotSubState.insert(subIndex, new L_IngameUILoadState());
        subIndex++;
        // loadSlotSubState.insert(subIndex, new L_LoadSceneCompleteState("load_slot_complete"));
        rootState.insert(seqIndex, loadSlotSubState);

        // 子状态2：获取各类信息+埋点+促销/弹窗/FB状态检查
        subIndex = 0;
        const infoSubState = new SequencialState();
        infoSubState.insert(subIndex, new L_GetInboxInfoState());
        // infoSubState.insert(subIndex, new L_GetJackpotInfo());
        // infoSubState.insert(subIndex, new L_GetFBTournamentInfoState());
        infoSubState.insert(subIndex, new L_RefreshHeroInfoState());
        infoSubState.insert(subIndex, new L_GetBingoGameInfoState());
        infoSubState.insert(subIndex, new L_GetInboxInfoState());
        subIndex++;
        //infoSubState.insert(subIndex, new L_LoadSceneCompleteState("getInfos_complete"));
        // subIndex++;
        // infoSubState.insert(subIndex, new L_AcceptPromotionState());
        // infoSubState.insert(subIndex, new L_SetOfferPopupInfo());
        // infoSubState.insert(subIndex, new L_CheckFBSquadStatus());
        infoSubState.insert(subIndex, new L_GetInstantInfoState());
        subIndex++;
        infoSubState.insert(subIndex, new L_LoadSceneCompleteState("setInfos_complete"));
        rootState.insert(seqIndex, infoSubState);

        // 子状态3：Slot初始化
        seqIndex++;
        rootState.insert(seqIndex, new L_SlotInitState());

        return rootState;
    }

    /**
     * 构建从Lobby到Slot的加载状态流程
     * @returns 序列化状态对象
     */
    public getLobbyToSlotState(): SequencialState {
        const rootState = new SequencialState();
        let subIndex = 0;

        // 基础加载+UI+用户信息刷新
        rootState.insert(subIndex, new L_LoadLobbyToSlotState());
        rootState.insert(subIndex, new L_IngameUILoadState());
        rootState.insert(subIndex, new L_RefreshUserInfoState());
        subIndex++;

        // 收件箱+Jackpot+英雄信息刷新
        // rootState.insert(subIndex, new L_GetInboxInfoState());
        // rootState.insert(subIndex, new L_RefreshJackpotState());
        // rootState.insert(subIndex, new L_RefreshHeroInfoState());
        //subIndex++;

        // Slot初始化
        rootState.insert(subIndex, new L_SlotInitState());

        return rootState;
    }

    /**
     * 构建从Slot到Slot（同游戏内切换）的加载状态流程
     * @param zoneId 区域ID
     * @param zoneName 区域名称
     * @param param3 扩展参数3（原代码未明确，保留兼容）
     * @param param4 扩展参数4（原代码未明确，保留兼容）
     * @returns 序列化状态对象
     */
    public getSlotToSlotState(
        zoneId: string | number,
        zoneName: string,
        param3?: any,
        param4?: any
    ): SequencialState {
        const rootState = new SequencialState();
        let subIndex = 0;

        // 基础加载+UI+用户信息刷新
        // rootState.insert(subIndex, new L_LoadSlotToSlotState(zoneId, zoneName, param3, param4));
        // rootState.insert(subIndex, new L_IngameUILoadState());
        // rootState.insert(subIndex, new L_RefreshUserInfoState());
        subIndex++;

        // 收件箱+Jackpot+英雄信息刷新
        rootState.insert(subIndex, new L_GetInboxInfoState());
        // rootState.insert(subIndex, new L_RefreshJackpotState());
        rootState.insert(subIndex, new L_RefreshHeroInfoState());
        subIndex++;

        // 设置区域信息状态
        const setZoneState = new State();
        setZoneState.addOnStartCallback(() => {
            UserInfo.instance().setZoneID(zoneId);
            UserInfo.instance().setZoneName(zoneName);
            setZoneState.setDone();
        });
        rootState.insert(subIndex, setZoneState);
        subIndex++;

        // Slot初始化
        rootState.insert(subIndex, new L_SlotInitState());

        return rootState;
    }

    // ===================== 预制件管理 =====================
    /**
     * 缓存预制件
     * @param key 预制件唯一标识
     * @param prefab 预制件实例
     */
    public setPrefab(key: string, prefab: any): void {
        this.servicePrefabs[key] = prefab;
    }

    /**
     * 获取缓存的预制件
     * @param key 预制件唯一标识
     * @returns 预制件实例（不存在则返回null并打印错误）
     */
    public getPrefab(key: string): any {
        if (this.servicePrefabs[key] === null || this.servicePrefabs[key] === undefined) {
            console.log(`LoadingSlotProcess getPrefab fail: ${key}`);
            return null;
        }
        return this.servicePrefabs[key];
    }
}