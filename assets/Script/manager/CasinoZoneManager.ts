// 保留原项目依赖导入路径，与原代码一致
import SDefine from "../global_utility/SDefine";

const { ccclass, property } = cc._decorator;

/**
 * 赌场区域信息数据模型类
 * 封装单个区域的核心配置：区域ID、最小投注额、最大投注额
 */
export class CasinoZoneInfo {
    public zoneID: number = 0;    // 区域ID
    public minBet: number = 0;    // 该区域最小投注金额
    public maxBet: number = 0;    // 该区域最大投注金额

    /** 初始化区域数据 - 解析服务端返回的区域配置对象 */
    public init(data: any): void {
        this.zoneID = data.zoneID;
        this.minBet = data.minBet;
        this.maxBet = data.maxBet;
    }
}

/**
 * 赌场区域核心管理单例类
 * 统一管理所有赌场区域的配置信息，提供区域数据读取、数量获取、区域名称映射等能力
 * ✅ 注意：该类是【特殊单例模式】，Instance() 仅返回实例，不会主动创建，必须先调用 Init() 初始化！
 */
@ccclass
export default class CasinoZoneManager {
    // ===== 单例核心静态变量 =====
    private static _instance: CasinoZoneManager = null;

    // ===== 私有成员变量 - 存储所有区域的信息列表 =====
    private _zoneInfos: Array<CasinoZoneInfo> = [];

    // ===== ✅ 核心静态方法 - 单例实例获取 (原逻辑1:1完整复刻 特殊规则) =====
    // 【重要】只返回已初始化的实例，无实例则抛出cc.error 不主动创建，和常规单例不同！
    public static Instance(): CasinoZoneManager {
        if (CasinoZoneManager._instance == null) {
            cc.error("invalid CasinoZoneManager");
        }
        return CasinoZoneManager._instance;
    }

    // ===== ✅ 核心静态方法 - 单例初始化入口 (原逻辑1:1完整复刻) =====
    // 唯一创建实例+初始化区域数据的入口，返回布尔值标识初始化成功
    public static Init(data: any): boolean {
        CasinoZoneManager._instance = new CasinoZoneManager();
        CasinoZoneManager._instance.initCasinoZoneManager(data);
        return true;
    }

    // ===== 构造函数 - 私有初始化列表 =====
    private constructor() {
        this._zoneInfos = [];
    }

    // ===== 初始化区域管理器 - 解析服务端区域配置数据 =====
    private initCasinoZoneManager(data: any): void {
        for (let i = 0; i < data.zone.length; ++i) {
            const zoneInfo = new CasinoZoneInfo();
            zoneInfo.init(data.zone[i]);
            this._zoneInfos.push(zoneInfo);
        }
    }

    // ===== 对外提供的业务方法 (原逻辑完整复刻 无修改) =====
    /** 根据区域ID获取对应区域的配置信息 */
    public getZoneInfo(zoneId: number): CasinoZoneInfo {
        return this._zoneInfos[zoneId];
    }

    /** 获取赌场区域的总数量 */
    public getMaxZoneCount(): number {
        return this._zoneInfos.length;
    }

    /** 根据区域ID获取区域的显示名称 (映射SDefine的常量配置) */
    public getZoneName(zoneId: number): string {
        return SDefine.getZoneName(zoneId);
    }
}