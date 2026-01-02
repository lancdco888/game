const { ccclass, property } = cc._decorator;

// 原文件导入模块 路径完全不变
import TSUtility from "../global_utility/TSUtility";

/**
 * 活动信息实体类 - 对应原文件匿名类 a
 */
class EventInfo {
    public startDate: number = 0;
    public endDate: number = 0;
    public key: string = "";
    public eventType: number = 0;
}

/**
 * 活动信息Key常量类 - 原文件 EventInfoKey
 */
export class EventInfoKey {
    public static readonly IAA_HIGH_ADS: string = "2024-IAA_HighAD";
}

/**
 * 活动信息管理类 - 全局单例 管理所有周期性/时效性活动的状态、生效判断、数据初始化
 */
@ccclass
export default class EventInfoManager {
    // ✅ 单例核心配置 - 完全复刻原文件的单例写法
    private static _instance: EventInfoManager = null;
    // 私有存储：所有活动信息数组
    private _seasonalEvents: EventInfo[] = [];

    // ✅ 获取全局单例实例 - 原文件逻辑一字不差
    public static Instance(): EventInfoManager {
        if (null == EventInfoManager._instance) {
            EventInfoManager._instance = new EventInfoManager();
        }
        return EventInfoManager._instance;
    }

    // ==============================================================
    // ✅ 所有方法按原文件顺序1:1复刻 逻辑完整无删减 保留原判断风格
    // ==============================================================
    /**
     * 初始化活动管理器
     * @param eventList 活动配置列表
     */
    public initSeasonalEventManager(eventList: any[]): void {
        if (TSUtility.isValid(eventList)) {
            this._seasonalEvents = [];
            for (let i = 0; i < eventList.length; i++) {
                const eventInfo = this.initEventInfo(eventList[i]);
                this._seasonalEvents.push(eventInfo);
            }
            // 按活动开始时间升序排序
            this._seasonalEvents.sort((a: EventInfo, b: EventInfo) => {
                const dateA = a.startDate;
                const dateB = b.startDate;
                return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
            });
        }
    }

    /**
     * 初始化单个活动信息
     * @param data 单个活动配置数据
     * @returns 格式化后的活动信息实体
     */
    public initEventInfo(data: any): EventInfo {
        const eventInfo = new EventInfo();
        eventInfo.eventType = data.eventType;
        eventInfo.startDate = data.startDate;
        eventInfo.endDate = data.endDate;
        eventInfo.key = data.key;
        return eventInfo;
    }

    /**
     * 获取当前所有生效中的活动
     * @returns 生效活动数组
     */
    public getAvailableEvents(): EventInfo[] {
        const availableEvents: EventInfo[] = [];
        const currServerTime = TSUtility.getServerBaseNowUnixTime();
        let currEvent: EventInfo = null;
        for (let i = 0; i < this._seasonalEvents.length; ++i) {
            currEvent = this._seasonalEvents[i];
            // 当前时间在活动起止区间内 判定为生效
            if (currEvent.startDate < currServerTime && currServerTime < currEvent.endDate) {
                availableEvents.push(currEvent);
            }
        }
        return availableEvents;
    }

    /**
     * 根据活动KEY判定该活动是否正在生效
     * @param eventKey 活动唯一标识Key
     * @returns 是否生效
     */
    public isAvailable(eventKey: string): boolean {
        let isAvailable = false;
        const currEvents = this.getAvailableEvents();
        for (let i = 0; i < currEvents.length; ++i) {
            if (currEvents[i].key == eventKey) {
                const currServerTime = TSUtility.getServerBaseNowUnixTime();
                if (currEvents[i].startDate < currServerTime && currServerTime < currEvents[i].endDate) {
                    isAvailable = true;
                }
                break;
            }
        }
        return isAvailable;
    }
}