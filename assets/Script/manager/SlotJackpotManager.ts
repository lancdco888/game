// 保留原项目所有依赖导入，路径与原代码完全一致
import CasinoZoneManager from "./CasinoZoneManager";
import { SlotJackpotInfo, UserSimpleInfo } from "../slot_common/SlotDataDefine";

/**
 * SLOT 奖池核心管理单例类
 * 统一管理：区域奖池信息、联动奖池信息、TD奖池/Thrill奖池数据、中奖者信息
 * 提供奖池数据的读取、更新、动态金额计算等核心能力，是SLOT大奖体系的核心数据中枢
 */
export default class SlotJackpotManager {
    // ===== 单例核心静态变量 (原逻辑完整复刻) =====
    private static _instance: SlotJackpotManager = null;

    // ===== 私有成员变量 (原代码初始化值+类型 完整保留 顺序不变) =====
    private _zoneJackpotInfos: Array<SlotJackpotInfo> = [];
    private _zoneLastWinInfo: Array<any> = [];
    private _zoneSlotJackpotInfos: Array<ZoneSlotJackpotInfo> = [];
    private _tdjakcpotInfos: Array<TDJackpotInfo> = []; // 原代码拼写错误保留 避免调用异常
    private _tdjackpotLastWinnetInfo: TDJackLastWinnerInfo = null;
    private _thrillJackpotInfos: Array<ThrillJackpotInfo> = [];
    private _thrillJackpotLastWinnerInfo: ThrillJackpotLastWinnerInfo = null;

    // ===== 单例获取方法 (全局唯一入口 原逻辑1:1复刻) =====
    public static Instance(): SlotJackpotManager {
        if (SlotJackpotManager._instance == null) {
            SlotJackpotManager._instance = new SlotJackpotManager();
        }
        return SlotJackpotManager._instance;
    }

    // ===== 构造函数 (核心初始化逻辑 所有循环/数量/实例创建完全不变) =====
    private constructor() {
        this._zoneJackpotInfos = [];
        this._zoneLastWinInfo = [];
        this._zoneSlotJackpotInfos = [];
        this._tdjakcpotInfos = [];
        this._thrillJackpotInfos = [];

        // 初始化 区域奖池信息 + 区域中奖信息 + 区域Slot奖池信息
        const maxZoneCount = CasinoZoneManager.Instance().getMaxZoneCount();
        for (let i = 0; i < maxZoneCount; ++i) {
            this._zoneLastWinInfo.push(null);
            this._zoneSlotJackpotInfos.push(new ZoneSlotJackpotInfo());
            this._zoneJackpotInfos.push(new SlotJackpotInfo(i));
        }

        // 初始化 TD奖池信息 x3个
        for (let i = 0; i < 3; ++i) {
            this._tdjakcpotInfos.push(new TDJackpotInfo());
        }

        // 初始化 Thrill奖池信息 x5个
        for (let i = 0; i < 5; ++i) {
            this._thrillJackpotInfos.push(new ThrillJackpotInfo());
        }

        // 初始化 中奖者信息实例
        this._tdjackpotLastWinnetInfo = new TDJackLastWinnerInfo();
        this._thrillJackpotLastWinnerInfo = new ThrillJackpotLastWinnerInfo();
    }

    // ===== 区域奖池相关方法 (原逻辑完整复刻) =====
    public getZoneJackpotInfo(zoneId: number): SlotJackpotInfo {
        const targetIdx = Math.min(zoneId, this._zoneJackpotInfos.length - 1);
        return this._zoneJackpotInfos[targetIdx];
    }

    public getCasinoLastWinInfo(zoneId: number): any {
        return this._zoneLastWinInfo[zoneId];
    }

    public setCasinoLastWinInfo(zoneId: number, info: any): void {
        this._zoneLastWinInfo[zoneId] = info;
    }

    public getZoneSlotJackpotInfo(zoneId: number): ZoneSlotJackpotInfo {
        return this._zoneSlotJackpotInfos[zoneId];
    }

    // ===== 联动奖池相关方法 =====
    public getLinkedJackpotInfo(zoneId: number, key: string): LinkedJackpotInfo {
        return this.getZoneSlotJackpotInfo(zoneId).getLinkedJackpotInfo(key);
    }

    // ===== Slot机型奖池信息 =====
    public getSlotmachineInfo(zoneId: number, slotId: string): SlotJackpotInfo {
        const targetIdx = Math.min(zoneId, this._zoneJackpotInfos.length - 1);
        return this.getZoneSlotJackpotInfo(targetIdx).getSlotmachineInfo(slotId);
    }

    // ===== TD奖池相关方法 (完整复刻 循环匹配type逻辑) =====
    public getTdjJackpotInfo(type: number): TDJackpotInfo {
        for (let i = 0; i < this._tdjakcpotInfos.length; i++) {
            if (this._tdjakcpotInfos[i].type == type) {
                return this._tdjakcpotInfos[i];
            }
        }
        return null;
    }

    public setTdjackpotInfo(type: number, info: any): void {
        if (this._tdjakcpotInfos.length <= type) {
            cc.log("Not have type tdj Info");
            return;
        }
        this._tdjakcpotInfos[type].setInfo(info);
    }

    public setTdjackpotWinnerInfo(info: any): void {
        this._tdjackpotLastWinnetInfo.setInfo(info);
    }

    public getTdjackpotWinnerInfo(): TDJackLastWinnerInfo {
        return this._tdjackpotLastWinnetInfo;
    }

    // ===== Thrill奖池相关方法 (与TD奖池逻辑一致 完整复刻) =====
    public getThrillJackpotInfo(type: number): ThrillJackpotInfo {
        for (let i = 0; i < this._thrillJackpotInfos.length; i++) {
            if (this._thrillJackpotInfos[i].type == type) {
                return this._thrillJackpotInfos[i];
            }
        }
        return null;
    }

    public setThrillJackpotInfo(type: number, info: any): void {
        if (this._thrillJackpotInfos.length <= type) {
            cc.log("Not have type tdj Info");
            return;
        }
        this._thrillJackpotInfos[type].setInfo(info);
    }

    public setThrillJackpotWinnerInfo(info: any): void {
        this._thrillJackpotLastWinnerInfo.setInfo(info);
    }

    public getThrillJackpotWinnerInfo(): ThrillJackpotLastWinnerInfo {
        return this._thrillJackpotLastWinnerInfo;
    }
}

// ============================================================================
// 所有内部数据类 👇 按原代码顺序排列 1:1复刻所有属性/方法/逻辑 零改动
// ============================================================================

/** 区域Slot奖池容器类 - 存储单区域下的所有Slot奖池+联动奖池 */
export class ZoneSlotJackpotInfo {
    private _mapSlotjackpotInfo: { [key: string]: SlotJackpotInfo } = {};
    private _mapLinkedJackpotInfo: { [key: string]: LinkedJackpotInfo } = {};

    public getLinkedJackpotInfo(key: string): LinkedJackpotInfo {
        if (!this._mapLinkedJackpotInfo[key]) {
            this._mapLinkedJackpotInfo[key] = new LinkedJackpotInfo(key);
        }
        return this._mapLinkedJackpotInfo[key];
    }

    public getSlotmachineInfo(slotId: string): SlotJackpotInfo {
        if (!this._mapSlotjackpotInfo[slotId]) {
            this._mapSlotjackpotInfo[slotId] = new SlotJackpotInfo(slotId);
        }
        return this._mapSlotjackpotInfo[slotId];
    }
}

/** 联动奖池信息类 - 存储联动奖池的key+关联的SlotID列表 */
export class LinkedJackpotInfo {
    public linkedKey: string = "";
    public targetSlotIds: Array<string> = [];

    constructor(key: string) {
        this.linkedKey = key;
        this.targetSlotIds = [];
    }

    // 添加目标SlotID 并做去重处理
    public setTargetGame(slotId: string): void {
        for (let i = 0; i < this.targetSlotIds.length; ++i) {
            if (this.targetSlotIds[i] == slotId) {
                return;
            }
        }
        this.targetSlotIds.push(slotId);
    }
}

/** TD奖池 最新中奖者信息类 */
export class TDJackLastWinnerInfo {
    private _user: UserSimpleInfo = null;
    private _jackpotCnt: number = 0;
    private _totalPrize: number = 0;
    private _winDate: number = 0;

    public setInfo(info: any): void {
        this._user = new UserSimpleInfo();
        if (info.user != null) {
            this._user.parseObj(info.user);
        }
        this._jackpotCnt = info.jackpotCnt;
        this._totalPrize = info.totalPrize;
        this._winDate = info.winDate;
    }
}

/** Thrill奖池 最新中奖者信息类 (比TD多一个字段) */
export class ThrillJackpotLastWinnerInfo {
    private _user: UserSimpleInfo = null;
    private _jackpotCnt: number = 0;
    private _totalPrize: number = 0;
    private _winDate: number = 0;
    private _tripleThrillJackpotWinID: number = 0;

    public setInfo(info: any): void {
        this._user = new UserSimpleInfo();
        if (info.user != null) {
            this._user.parseObj(info.user);
        }
        if (info.jackpotCnt != null) this._jackpotCnt = info.jackpotCnt;
        if (info.totalPrize != null) this._totalPrize = info.totalPrize;
        if (info.winDate != null) this._winDate = info.winDate;
        if (info.tripleThrillJackpotWinID) this._tripleThrillJackpotWinID = info.tripleThrillJackpotWinID;
    }
}

/** TD奖池核心数据类 - 含动态增长计算逻辑 🔥 核心展示用 */
export class TDJackpotInfo {
    private _saveTimeStamp: number = 0;
    public prevJackpotMoney: number = 0;
    public increaseRate: number = 1;
    public type: number = 0;
    public jackpotMoney: number = 0;
    public basePrize: number = 0;

    public setInfo(info: any): void {
        if (info.key) {
            this.type = info.key;
        }
        if (info.jackpot) {
            this.prevJackpotMoney = this.jackpotMoney;
            this.jackpotMoney = info.jackpot;
            // 增长率计算公式 完整复刻
            this.increaseRate = Math.abs(this.jackpotMoney - this.prevJackpotMoney) / 60;
            const randomVal = 3000 * Math.random() + 1000;
            this.increaseRate = Math.max(10, this.increaseRate);
            this.increaseRate = Math.min(randomVal, this.increaseRate);
        }
        if (info.basePrize) {
            this.basePrize = info.basePrize;
        }
        this._saveTimeStamp = Date.now();
    }

    // 奖池展示金额 动态计算 核心方法 ✔️
    public getJackpotForDisplay(): number {
        const diffTime = (Date.now() - this._saveTimeStamp) / 1000;
        return this.jackpotMoney + diffTime * this.increaseRate + this.basePrize;
    }
}

/** Thrill奖池核心数据类 (比TD多一个激活状态字段) 🔥 核心展示用 */
export class ThrillJackpotInfo {
    private _saveTimeStamp: number = 0;
    public prevJackpotMoney: number = 0;
    public increaseRate: number = 1;
    public type: number = 0;
    public jackpotMoney: number = 0;
    public basePrize: number = 0;
    public isActive: boolean = false;

    public setInfo(info: any): void {
        if (info.key) {
            this.type = info.key;
        }
        if (info.jackpot) {
            this.prevJackpotMoney = this.jackpotMoney;
            this.jackpotMoney = info.jackpot;
            // 增长率计算公式 与TD完全一致 完整复刻
            this.increaseRate = Math.abs(this.jackpotMoney - this.prevJackpotMoney) / 60;
            const randomVal = 3000 * Math.random() + 1000;
            this.increaseRate = Math.max(10, this.increaseRate);
            this.increaseRate = Math.min(randomVal, this.increaseRate);
        }
        if (info.basePrize) {
            this.basePrize = info.basePrize;
        }
        if (info.isActive) {
            this.isActive = info.isActive;
        }
        this._saveTimeStamp = Date.now();
    }

    // 奖池展示金额 动态计算 核心方法 ✔️
    public getJackpotForDisplay(): number {
        const diffTime = (Date.now() - this._saveTimeStamp) / 1000;
        return this.jackpotMoney + diffTime * this.increaseRate + this.basePrize;
    }
}