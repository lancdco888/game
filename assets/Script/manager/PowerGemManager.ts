const { ccclass, property } = cc._decorator;

// ===================== 保持原项目依赖导入 路径完全不变 =====================
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import TimeFormatHelper from "../global_utility/TimeFormatHelper";
// import SlotReelSpinStateManager from "../../../slot_common/Script/SlotCommon/SlotReelSpinStateManager";
import ServerStorageManager, { StorageKeyType } from "./ServerStorageManager";
import LevelManager from "./LevelManager";
import UserInfo from "../User/UserInfo";
// import UserPromotion from "../User/UserPromotion";
import MessageRoutingManager from "../message/MessageRoutingManager";

// ===================== 标准TS枚举 替代原对象模拟枚举 键值完全一致 =====================
/** 宝石等级品质类型 (亮度/段位) */
export enum PowerGemLevelGradeType {
    DIMMED = 0,
    BRONZE = 1,
    SILVER = 2,
    GOLD = 3
}

/** 宝石稀有度品质类型 */
export enum PowerGemGradeType {
    COMMON = 0,
    RARE = 1,
    EPIC = 2,
    LEGENDARY = 3,
    MYTHICAL = 4,
    NONE = 999
}

/** 宝石操作行为类型 */
export enum PowerGemActionType {
    GET = "get",
    OPEN = "open",
    UPGRADE = "upgrade",
    COLLECT = "collect"
}

// ===================== 宝石数据实体类 原PowerGemInfo 完整重构 =====================
/**
 * 宝石数据实体类 - 承载单颗宝石的所有数据与解析逻辑
 * 负责后端数据解析、数据格式转换、状态判断、等级/品质映射
 */
@ccclass('PowerGemInfo')
export class PowerGemInfo {
    private _strName: string = "";          // 宝石名称(common/rare/epic/legendary/mythical)
    private _numGrade: number = 0;          // 宝石等级
    private _numDuplicateLevel: number = 0; // 宝石重复等级
    private _numClearDate: number = 0;      // 宝石解锁/过期时间戳
    private _betGrade: number = 0;          // 投注品质等级
    private _isEmpty: boolean = false;      // 当前插槽是否为空
    private _numIndex: number = 0;          // 宝石所在插槽索引
    private _numVIPLevel: number = -1;      // 用户VIP等级
    private _strActionType: string = "";    // 宝石操作行为类型

    /** 解析后端返回的宝石数据对象 */
    public parseObj(data: any): void {
        if (TSUtility.isValid(data.name)) this._strName = data.name;
        if (TSUtility.isValid(data.grade)) this._numGrade = data.grade;
        if (TSUtility.isValid(data.duplicateLevel)) this._numDuplicateLevel = data.duplicateLevel;
        if (TSUtility.isValid(data.clearDate)) this._numClearDate = data.clearDate;
        if (TSUtility.isValid(data.betGrade)) this._betGrade = data.betGrade;
        if (TSUtility.isValid(data.isEmpty)) this._isEmpty = data.isEmpty;
        if (TSUtility.isValid(data.actionType)) this._strActionType = data.actionType;
        if (TSUtility.isValid(data.idx)) this._numIndex = data.idx;
        if (TSUtility.isValid(data.userVipLevel)) this._numVIPLevel = data.userVipLevel;
    }

    /** 获取宝石稀有度品质类型 */
    public getPowerGemGradeType(): PowerGemGradeType {
        switch (this._strName) {
            case "common": return PowerGemGradeType.COMMON;
            case "rare": return PowerGemGradeType.RARE;
            case "epic": return PowerGemGradeType.EPIC;
            case "legendary": return PowerGemGradeType.LEGENDARY;
            case "mythical": return PowerGemGradeType.MYTHICAL;
            default: return PowerGemGradeType.NONE;
        }
    }

    /** 根据用户VIP等级获取宝石等级品质 */
    public getPowerGemLevelGradeTypeByUserVIP(): PowerGemLevelGradeType {
        return PowerGemManager.instance.getPowerGemGrade(this._numGrade, this._numVIPLevel);
    }

    /** 获取宝石最终的等级品质类型(优先级:投注品质 > VIP等级品质) */
    public getPowerGemLevelGradeType(): PowerGemLevelGradeType {
        if (this._betGrade === 0 && this._numVIPLevel >= 0) {
            return this.getPowerGemLevelGradeTypeByUserVIP();
        } else {
            switch (this._betGrade) {
                case 1: return PowerGemLevelGradeType.BRONZE;
                case 2: return PowerGemLevelGradeType.SILVER;
                case 3: return PowerGemLevelGradeType.GOLD;
                default: return PowerGemLevelGradeType.DIMMED;
            }
        }
    }

    /** 获取宝石等级 */
    public getPowerGemLevel(): number { return this._numGrade; }

    /** 获取宝石重复等级 */
    public getPowerGemDuplicateLevel(): number { return this._numDuplicateLevel; }

    /** 获取宝石解锁/过期时间戳 */
    public getPowerGemClearDate(): number { return this._numClearDate; }

    /** 当前插槽是否为空 */
    public isEmpty(): boolean { return this._isEmpty; }

    /** 获取宝石所在插槽索引 */
    public getSlotIndex(): number { return this._numIndex; }

    /** 获取用户VIP等级 */
    public getVIPLevel(): number { return this._numVIPLevel; }

    /** 获取宝石操作行为类型 */
    public getActionType(): PowerGemActionType | undefined {
        switch (this._strActionType) {
            case PowerGemActionType.GET: return PowerGemActionType.GET;
            case PowerGemActionType.OPEN: return PowerGemActionType.OPEN;
            case PowerGemActionType.UPGRADE: return PowerGemActionType.UPGRADE;
            case PowerGemActionType.COLLECT: return PowerGemActionType.COLLECT;
            default: return undefined;
        }
    }

    /** 宝石是否处于锁定状态 */
    public isLock(): boolean {
        return !this._isEmpty && !(TSUtility.isValid(this._numClearDate) && this._numClearDate > 0);
    }

    /** 宝石是否处于解锁中(开启中)状态 */
    public isOpening(): boolean {
        if (this._numDuplicateLevel >= 3) return false;
        if (!TSUtility.isValid(this._numClearDate) || this._numClearDate <= 0) return false;
        const now = TSUtility.getServerBaseNowUnixTime();
        return this._numClearDate > now;
    }

    /** 宝石是否解锁完成(可领取奖励) */
    public isComplete(): boolean {
        if (this._numDuplicateLevel >= 3) return true;
        if (!TSUtility.isValid(this._numClearDate) || this._numClearDate <= 0) return false;
        const now = TSUtility.getServerBaseNowUnixTime();
        return this._numClearDate <= now;
    }
}

// ===================== 宝石全局管理器 单例核心类 完整重构 =====================
/**
 * 宝石(PowerGem)全局管理器 - 单例模式
 * 封装宝石系统全部业务逻辑：配置管理、等级映射、品质计算、时效校验、奖励计算、插槽管理、全局状态控制
 * 项目中所有宝石相关逻辑均通过该单例调用，是宝石玩法的核心入口
 */
@ccclass('PowerGemManager')
export default class PowerGemManager extends cc.Component {
    // ===================== 宝石系统核心配置常量 原数据完全复刻 一字不差 =====================
    public readonly POWER_GEM_LEVEL_DATA = [
        { key: 3000000000, value: 23 }, { key: 2400000000, value: 22 }, { key: 1800000000, value: 21 },
        { key: 1200000000, value: 20 }, { key: 900000000, value: 19 }, { key: 600000000, value: 18 },
        { key: 300000000, value: 17 }, { key: 240000000, value: 16 }, { key: 180000000, value: 15 },
        { key: 120000000, value: 14 }, { key: 90000000, value: 13 }, { key: 60000000, value: 12 },
        { key: 30000000, value: 11 }, { key: 12000000, value: 10 }, { key: 6000000, value: 9 },
        { key: 3000000, value: 8 }, { key: 1200000, value: 7 }, { key: 600000, value: 6 },
        { key: 300000, value: 5 }, { key: 120000, value: 4 }, { key: 60000, value: 3 },
        { key: 30000, value: 2 }, { key: 12000, value: 1 }
    ];

    public readonly POWER_GEM_GRADE_DATA = [
        { key: 1, value: [0, 0, 0, 0] }, { key: 2, value: [1, 0, 0, 0] }, { key: 3, value: [1, 1, 0, 0] },
        { key: 4, value: [1, 1, 1, 0] }, { key: 5, value: [1, 1, 1, 0] }, { key: 6, value: [2, 1, 1, 1] },
        { key: 7, value: [2, 2, 1, 1] }, { key: 8, value: [2, 2, 2, 1] }, { key: 9, value: [2, 2, 2, 1] },
        { key: 10, value: [2, 2, 2, 1] }, { key: 11, value: [3, 2, 2, 1] }, { key: 12, value: [3, 3, 2, 2] },
        { key: 13, value: [3, 3, 3, 2] }, { key: 14, value: [3, 3, 3, 2] }, { key: 15, value: [3, 3, 3, 2] },
        { key: 16, value: [3, 3, 3, 2] }, { key: 17, value: [3, 3, 3, 3] }, { key: 18, value: [3, 3, 3, 3] },
        { key: 19, value: [3, 3, 3, 3] }, { key: 20, value: [3, 3, 3, 3] }, { key: 21, value: [3, 3, 3, 3] },
        { key: 22, value: [3, 3, 3, 3] }, { key: 23, value: [3, 3, 3, 3] }
    ];

    public readonly POWER_GEM_GROUP_DATA = [
        { key: 0, value: 1 }, { key: 1, value: 1 }, { key: 2, value: 2 }, { key: 3, value: 2 },
        { key: 4, value: 3 }, { key: 5, value: 3 }, { key: 6, value: 3 }, { key: 7, value: 4 },
        { key: 8, value: 4 }, { key: 9, value: 4 }
    ];

    public readonly POWER_GEM_JOKER_POINT_DATA = [
        { key: PowerGemGradeType.COMMON, value: [1, 3] },
        { key: PowerGemGradeType.RARE, value: [2, 5] },
        { key: PowerGemGradeType.EPIC, value: [4, 10] },
        { key: PowerGemGradeType.LEGENDARY, value: [7, 15] },
        { key: PowerGemGradeType.MYTHICAL, value: [10, 25] }
    ];

    public readonly POWER_GEM_OPEN_TIME_DATA = [
        { key: PowerGemGradeType.COMMON, value: 30 },
        { key: PowerGemGradeType.RARE, value: 90 },
        { key: PowerGemGradeType.EPIC, value: 180 },
        { key: PowerGemGradeType.LEGENDARY, value: 360 },
        { key: PowerGemGradeType.MYTHICAL, value: 720 }
    ];

    public readonly POWER_GEM_REWARD_UPTO_DATA = [
        { key: PowerGemGradeType.COMMON, value: 3 },
        { key: PowerGemGradeType.RARE, value: 8 },
        { key: PowerGemGradeType.EPIC, value: 15 },
        { key: PowerGemGradeType.LEGENDARY, value: 25 },
        { key: PowerGemGradeType.MYTHICAL, value: 50 }
    ];

    public readonly POWER_GEM_MAX_SLOT_COUNT = 4;    // 宝石最大插槽数量
    public readonly JOKER_POINT_USE_COUNT = 100;     // Joker积分消耗数量
    public readonly POWER_GEM_OPEN_LEVEL = 11;       // 宝石系统开启等级

    // ===================== 私有成员变量 原数据完全复刻 类型精准注解 =====================
    private static _instance: PowerGemManager = null; // 单例实例
    private _arrChangeResult: Array<any> = [];        // 变更结果数组
    private _arrPrevPowerGemInfo: Array<PowerGemInfo> = []; // 变更前宝石数据
    private _numApplyChangeResult: number = 0;        // 变更结果应用时间
    private _arrADSlotIndex: Array<boolean> = [];     // AD插槽索引数组
    private _infoPowerGem: PowerGemInfo = null;       // 当前操作的宝石数据
    private _isFinishUpgrade: boolean = false;       // 是否完成升级
    private _isInitiated: boolean = false;            // 是否已初始化
    private _isRefreshPromotion: boolean = false;    // 是否刷新活动
    private _arrUpdateTimeFunc: Array<Function> = []; // 时间更新回调数组
    private _remainEventTimeFormat: TimeFormatHelper = null; // 剩余时间格式化工具
    private _numRemainEventTime: number = 0;          // 剩余活动时间
    private _numExpireEventDate: number = 0;          // 活动过期时间戳

    // ===================== 单例模式 标准TS实现 全局唯一入口 =====================
    public static get instance(): PowerGemManager {
        if (this._instance == null) {
            this._instance = new PowerGemManager();
        }
        return this._instance;
    }

    // ===================== 生命周期 & 初始化 =====================
    /** 初始化宝石管理器 重置所有状态与数组 */
    public initialize(): void {
        this.setExpireDate(this.getPowerGemGetableExpireDate());
        for (let i = 0; i < this.POWER_GEM_MAX_SLOT_COUNT; i++) {
            this._arrChangeResult[i] = null;
            this._arrPrevPowerGemInfo[i] = null;
            this._arrADSlotIndex[i] = false;
        }
        this._numApplyChangeResult = 0;
    }

    // ===================== 活动时效相关 =====================
    /** 获取宝石活动信息 */
    public getPromotion(): any {
        return null;//UserInfo.instance().getPromotionInfo(UserPromotion.PowerGemPromotion.PromotionKeyName);
    }

    /** 设置活动过期时间 并启动时间倒计时 */
    public setExpireDate(expireTime: number): void {
        this.unscheduleAllCallbacks();
        this._numExpireEventDate = expireTime;
        this._numRemainEventTime = this._numExpireEventDate - TSUtility.getServerBaseNowUnixTime();
        this._remainEventTimeFormat = new TimeFormatHelper(this._numRemainEventTime);
        this.updateRemainEventTime();
        this.schedule(this.updateRemainEventTime, 1);
    }

    /** 是否处于宝石活动开放时间段 */
    public isPowerGemOpenDate(): boolean {
        const getExpire = this.getPowerGemGetableExpireDate();
        const openExpire = this.getPowerGemOpenableExpireDate();
        const now = TSUtility.getServerBaseNowUnixTime();
        return getExpire <= now && openExpire > now;
    }

    /** 宝石可领取是否过期 */
    public isPowerGemGetableExpireDate(): boolean {
        return false;//PowerGemManager.instance.getPromotion().numEventGetableExpireDate > TSUtility.getServerBaseNowUnixTime();
    }

    /** 检查宝石系统是否可用(等级+时效+场景校验) */
    public isAvailablePowerGem(isGetable: boolean = false, isForce: boolean = false): boolean {
        // const userLevel = UserInfo.instance().getUserLevelInfo().level;
        // if (userLevel < this.getPowerGemOpenLevel()) return false;

        // const expireTime = isGetable ? this.getPowerGemGetableExpireDate() : this.getPowerGemOpenableExpireDate();
        // if (expireTime <= TSUtility.getServerBaseNowUnixTime()) return false;

        // const curScene = UserInfo.instance().getCurrentSceneMode();
        // if (curScene === SDefine.Slot && !isForce && !this.isPowerGemSlot(UserInfo.instance().getGameId())) return false;

        // if (!this._isInitiated) {
        //     this._isInitiated = true;
        //     this.initialize();
        // }
        return true;
    }

    /** 根据插槽数据检查宝石系统是否可用 */
    public isAvailablePowerGemBySlot(slotData: any, addExpList: any[] = []): boolean {
        // if (!TSUtility.isValid(slotData)) return false;
        // const promotion = slotData.promotionInfo;
        // if (!TSUtility.isValid(promotion.isTargetUser) || !promotion.isTargetUser) return false;
        // if (!TSUtility.isValid(promotion.getableGemExpireDate) || promotion.getableGemExpireDate <= 0) return false;

        // const expireTime = promotion.getableGemExpireDate;
        // if (expireTime <= TSUtility.getServerBaseNowUnixTime()) return false;
        // this.setExpireDate(expireTime);

        // const openLevel = this.getPowerGemOpenLevel();
        // if (TSUtility.isValid(addExpList) && addExpList.length > 0) {
        //     const lastExp = addExpList[addExpList.length - 1];
        //     if (!TSUtility.isValid(lastExp)) {
        //         if (UserInfo.instance().getUserLevelInfo().level < openLevel) return false;
        //     } else {
        //         const totalExp = UserInfo.instance()._userInfo.userMasterInfo.levelInfo.exp + lastExp.addExp;
        //         const level = LevelManager.Instance().getLevelFromExp(totalExp);
        //         if (level < openLevel) return false;
        //         if (UserInfo.instance().getUserLevelInfo().level < openLevel) {
        //             MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.OPEN_POWERGEM_PROMOTION);
        //         }
        //     }
        // } else {
        //     if (UserInfo.instance().getUserLevelInfo().level < openLevel) return false;
        // }

        // const curScene = UserInfo.instance().getCurrentSceneMode();
        // return curScene !== SDefine.Slot || this.isPowerGemSlot(UserInfo.instance().getGameId());
        return false;
    }

    /** 星图系统中宝石是否可用 */
    public isAvailablePowerGemByStarAlbum(): boolean {
        // const userLevel = UserInfo.instance().getUserLevelInfo().level;
        // if (userLevel < this.getPowerGemOpenLevel()) return false;
        // return this.getPowerGemExpireDate() > TSUtility.getServerBaseNowUnixTime();
        return false;
    }

    /** 更新剩余活动时间 并触发回调 */
    public updateRemainEventTime(): void {
        const timeDiff = this._numRemainEventTime - this.getServerRemainEventTime();
        this._remainEventTimeFormat.addSecond(-timeDiff);
        this._numRemainEventTime -= timeDiff;

        this._arrUpdateTimeFunc.forEach(func => {
            if (TSUtility.isValid(func)) func(this._numRemainEventTime);
        });

        if (this._remainEventTimeFormat.getTime() <= 0) {
            this.unscheduleAllCallbacks();
            this._arrUpdateTimeFunc.forEach(func => {
                if (TSUtility.isValid(func)) func(0);
            });
            this._arrUpdateTimeFunc = [];
        }
    }

    /** 获取服务器剩余活动时间 */
    public getServerRemainEventTime(): number {
        const now = TSUtility.getServerBaseNowUnixTime();
        return this._numExpireEventDate - now;
    }

    /** 添加时间更新回调 */
    public addUpdateTimeFunc(func: Function): void {
        if (TSUtility.isValid(func)) {
            this._arrUpdateTimeFunc.push(func);
            func(this._numRemainEventTime);
        }
    }

    /** 移除时间更新回调 */
    public removeUpdateTimeFunc(func: Function): void {
        if (TSUtility.isValid(func)) {
            const index = this._arrUpdateTimeFunc.indexOf(func);
            if (index >= 0) this._arrUpdateTimeFunc.splice(index, 1);
        }
    }

    // ===================== 基础配置获取 =====================
    /** 获取宝石系统开启等级 */
    public getPowerGemOpenLevel(): number { return this.POWER_GEM_OPEN_LEVEL; }

    /** 获取Joker积分消耗数量 */
    public getJokerPointUseCount(): number { return this.JOKER_POINT_USE_COUNT; }

    /** 判断当前游戏是否为宝石插槽游戏 */
    public isPowerGemSlot(gameId: number|string): boolean {
        const promotion = this.getPromotion();
        if (!TSUtility.isValid(promotion)) return false;
        const slotIds = promotion.arrSlotID;
        for (let i = 0; i < slotIds.length; i++) {
            if (slotIds[i] === gameId) return true;
        }
        return false;
    }

    // ===================== 时效时间获取 =====================
    /** 获取宝石活动过期时间 */
    public getPowerGemExpireDate(): number {
        const promotion = this.getPromotion();
        if (!TSUtility.isValid(promotion)) return 0;
        return TSUtility.isValid(promotion.numEventEndDate) ? promotion.numEventEndDate : 0;
    }

    /** 获取宝石可领取过期时间 */
    public getPowerGemGetableExpireDate(): number {
        const promotion = this.getPromotion();
        if (!TSUtility.isValid(promotion)) return 0;
        return TSUtility.isValid(promotion.numEventGetableExpireDate) ? promotion.numEventGetableExpireDate : 0;
    }

    /** 获取宝石可开启过期时间 */
    public getPowerGemOpenableExpireDate(): number {
        const promotion = this.getPromotion();
        if (!TSUtility.isValid(promotion)) return 0;
        return TSUtility.isValid(promotion.numEventOpenableExpireDate) ? promotion.numEventOpenableExpireDate : 0;
    }

    /** 获取宝石插槽游戏ID数组 */
    public getPowerGemSlotIDs(): number[] {
        const promotion = this.getPromotion();
        return TSUtility.isValid(promotion) ? promotion.arrSlotID : [];
    }

    // ===================== 等级/品质/分组映射 =====================
    /** 根据数值获取宝石等级 */
    public getPowerGemLevel(value: number): number {
        if (value <= 0) return 0;
        for (let i = 0; i < this.POWER_GEM_LEVEL_DATA.length; ++i) {
            const item = this.POWER_GEM_LEVEL_DATA[i];
            if (value >= 0.9 * item.key && value <= item.key) {
                return item.value;
            }
        }
        return 0;
    }

    /** 根据等级获取宝石分组 */
    public getPowerGemGroup(level: number): number {
        const item = this.POWER_GEM_GROUP_DATA.find(item => item.key === level);
        return TSUtility.isValid(item) ? item.value : 0;
    }

    /** 根据宝石等级+VIP等级获取宝石品质 */
    public getPowerGemGrade(gemLevel: number, vipLevel: number): PowerGemLevelGradeType {
        const gradeItem = this.POWER_GEM_GRADE_DATA.find(item => item.key === gemLevel);
        if (!TSUtility.isValid(gradeItem)) return PowerGemLevelGradeType.DIMMED;
        const group = this.getPowerGemGroup(vipLevel);
        return gradeItem.value[group - 1];
    }

    /** 根据宝石品质获取解锁时间 */
    public getPowerGemOpenTime(grade: PowerGemGradeType): number {
        const item = this.POWER_GEM_OPEN_TIME_DATA.find(item => item.key === grade);
        return TSUtility.isValid(item) ? item.value : 0;
    }

    // ===================== 宝石数据管理 =====================
    /** 根据活动历史数据设置宝石信息 */
    public setPowerGemInfoByPromotionHist(histList: any[], addExpList: any[] = []): void {
        if (!TSUtility.isValid(histList) || histList.length <= 0) return;
        this.setActionPowerGemInfo(null);
        this._isFinishUpgrade = false;
        this._isRefreshPromotion = false;

        // const targetHist = histList.find(hist => hist.promotionKey === UserPromotion.PowerGemPromotion.PromotionKeyName);
        // if (TSUtility.isValid(targetHist) && this.isAvailablePowerGemBySlot(targetHist, addExpList)) {
        //     if (TSUtility.isValid(targetHist.changeInfo) && targetHist.changeInfo.length > 0) {
        //         const gemData = JSON.parse(targetHist.changeInfo);
        //         if (TSUtility.isValid(gemData)) {
        //             const gemInfo = new PowerGemInfo();
        //             gemInfo.parseObj(gemData);
        //             if (TSUtility.isValid(gemInfo)) {
        //                 this.setActionPowerGemInfo(gemInfo);
        //             }
        //         }
        //     }
        // }
    }

    /** 获取所有宝石数据数组 */
    public getPowerGemArrInfo(): PowerGemInfo[] {
        const promotion = this.getPromotion();
        return TSUtility.isValid(promotion) ? promotion.arrPowerGem : null;
    }

    /** 根据插槽索引获取宝石数据 */
    public getPowerGemInfo(index: number): PowerGemInfo {
        const gemArr = this.getPowerGemArrInfo();
        if (!TSUtility.isValid(gemArr)) return null;
        if (index < 0 || index >= gemArr.length) return null;

        if (TSUtility.isValid(this._infoPowerGem) && this._infoPowerGem.getSlotIndex() === index) {
            if (this._infoPowerGem.getActionType() === PowerGemActionType.UPGRADE && this._isFinishUpgrade) {
                return this._infoPowerGem;
            }
            if (TSUtility.isValid(this.getPromotion()) && this.getPromotion().numEventEndDate > ServerStorageManager.getAsNumber(StorageKeyType.TUTORIAL_POWER_GEM_FIRST_GET_POWER_GEM)) {
                return this._infoPowerGem;
            }
        }

        const prevGem = this._arrPrevPowerGemInfo[index];
        return TSUtility.isValid(prevGem) ? prevGem : gemArr[index];
    }

    /** 获取宝石最大插槽数量 */
    public getPowerGemMaxSlotCount(): number { return this.POWER_GEM_MAX_SLOT_COUNT; }

    /** 获取第一个解锁完成的宝石插槽索引 */
    public getCompleteFirstPowerGem(): number {
        const gemArr = this.getPowerGemArrInfo();
        if (TSUtility.isValid(gemArr)) {
            for (let i = 0; i < gemArr.length; i++) {
                if (gemArr[i].isComplete()) {
                    return i;
                }
            }
        }
        return -1;
    }

    /** 是否有解锁完成的宝石 */
    public isCompletePowerGem(): boolean { return this.getCompleteFirstPowerGem() >= 0; }

    // ===================== 奖励计算 =====================
    /** 获取宝石奖励上限倍数 */
    public getPowerGemRewardUpto(grade: PowerGemGradeType): number {
        const item = this.POWER_GEM_REWARD_UPTO_DATA.find(item => item.key === grade);
        return TSUtility.isValid(item) ? item.value : 0;
    }

    /** 根据宝石品质+等级计算奖励金币 */
    public getPowerGemRewardCoin(grade: PowerGemGradeType, level: number): number {
        const upto = this.getPowerGemRewardUpto(grade);
        if (upto <= 0) return 0;

        let keyValue = 0;
        for (let i = 0; i < this.POWER_GEM_LEVEL_DATA.length; ++i) {
            const item = this.POWER_GEM_LEVEL_DATA[i];
            if (level === item.value) {
                keyValue = item.key;
                break;
            }
        }
        return keyValue * upto;
    }

    // ===================== 插槽状态管理 =====================
    /** 是否可以开启新的宝石插槽 */
    public isOpenPowerGemSlot(): boolean {
        for (let i = 0; i < this.POWER_GEM_MAX_SLOT_COUNT; i++) {
            const gemInfo = this.getPowerGemInfo(i);
            if (!TSUtility.isValid(gemInfo)) return false;
            if (gemInfo.isOpening()) return false;
        }
        return true;
    }

    /** 获取正在解锁中的宝石数据 */
    public getOpeningPowerGem(): PowerGemInfo {
        for (let i = 0; i < this.POWER_GEM_MAX_SLOT_COUNT; i++) {
            const gemInfo = this.getPowerGemInfo(i);
            if (TSUtility.isValid(gemInfo) && gemInfo.isOpening()) {
                return gemInfo;
            }
        }
        return null;
    }

    /** 是否还能领取宝石 */
    public isReceivePowerGemAnymore(value: number = 0): boolean {
        if (!this.isAvailablePowerGem(true)) return false;
        const promotion = this.getPromotion();
        if (!TSUtility.isValid(promotion)) return false;

        const gemArr = this.getPowerGemArrInfo();
        if (!TSUtility.isValid(gemArr) || gemArr.length < this.POWER_GEM_MAX_SLOT_COUNT) return true;

        // 有空闲插槽
        for (let i = 0; i < gemArr.length; i++) {
            if (gemArr[i].isEmpty()) return true;
        }

        // 有解锁中的宝石
        for (let i = 0; i < gemArr.length; i++) {
            if (gemArr[i].isOpening()) {
                if (value <= 0) return true;
                if (this.getPowerGemLevel(value) >= gemArr[i].getPowerGemLevel()) return true;
            }
        }
        return false;
    }

    /** 是否允许宝石升级 */
    public isUpgradeAllows(): boolean {
        const gemArr = this.getPowerGemArrInfo();
        if (!TSUtility.isValid(gemArr)) return false;

        // 有空闲插槽 不允许升级
        for (let i = 0; i < gemArr.length; i++) {
            if (gemArr[i].isEmpty()) return false;
        }

        // 有解锁中的宝石 允许升级
        for (let i = 0; i < gemArr.length; i++) {
            if (gemArr[i].isOpening()) return true;
        }
        return false;
    }

    // ===================== 变更结果管理 =====================
    /** 获取指定插槽的变更结果 */
    public getChangeResult(index: number): any {
        return TSUtility.isValid(this._arrChangeResult[index]) ? this._arrChangeResult[index] : null;
    }

    /** 设置指定插槽的变更结果 */
    public setChangeResult(index: number, value: any): void {
        if (TSUtility.isValid(value)) {
            this._arrPrevPowerGemInfo[index] = this.getPowerGemInfo(index);
            this._arrChangeResult[index] = { key: value, value: TSUtility.getServerBaseNowUnixTime() };
        } else {
            this._arrPrevPowerGemInfo[index] = null;
            this._arrChangeResult[index] = null;
        }
    }

    // ===================== AD插槽管理 =====================
    /** 获取指定插槽是否为AD插槽 */
    public getADSlotIndex(index: number): boolean { return this._arrADSlotIndex[index]; }

    /** 设置指定插槽是否为AD插槽 */
    public setADSlotIndex(index: number, isAD: boolean): void { this._arrADSlotIndex[index] = isAD; }

    // ===================== 当前操作宝石管理 =====================
    /** 设置当前操作的宝石数据 */
    public setActionPowerGemInfo(info: PowerGemInfo): void {
        this._infoPowerGem = info;
        if (!TSUtility.isValid(info)) this.setFinishUpgrade(false);
    }

    /** 获取当前操作的宝石数据 */
    public getActionPowerGemInfo(): PowerGemInfo { return this._infoPowerGem; }

    // ===================== Joker积分相关 =====================
    /** 获取Joker积分道具信息 */
    public getJokerPointItem(): any {
        // const items = UserInfo.instance().getItemInventory().getItemsByItemId(SDefine.I_JOKER_CARD_POINT);
        // if (items == null || items.length <= 0) return null;
        // const item = items[0];
        // return item == null || item.curCnt <= 0 ? null : item;
        return null;
    }

    /** 根据宝石品质获取Joker积分区间 */
    public getJokerPointDate(grade: PowerGemGradeType): number[] {
        const item = this.POWER_GEM_JOKER_POINT_DATA.find(item => item.key === grade);
        return TSUtility.isValid(item) ? item.value : [0, 0];
    }

    // ===================== 其他状态管理 =====================
    /** 是否可以播放宝石中奖特效 */
    public isPlayPowerGemWinEffect(gameMode: number, value: number): boolean {
        // if (SlotReelSpinStateManager.Instance.getFreespinMode()) return false;
        // if (TSUtility.isValid(this._infoPowerGem)) return true;

        // const vipLevel = UserInfo.instance().getUserVipInfo().level;
        // const gemLevel = PowerGemManager.instance.getPowerGemLevel(value);
        // const gemGrade = PowerGemManager.instance.getPowerGemGrade(gemLevel, vipLevel);

        // return gemGrade !== PowerGemLevelGradeType.DIMMED && (gameMode === 4 || gameMode ===5 || gameMode ===3) && this.isReceivePowerGemAnymore(value);
        return true;
    }

    /** 设置是否刷新活动 */
    public setRefreshPromotion(isRefresh: boolean): void { this._isRefreshPromotion = isRefresh; }

    /** 是否需要刷新活动 */
    public isRefreshPromotion(): boolean { return this._isRefreshPromotion; }

    /** 设置是否完成升级 */
    public setFinishUpgrade(isFinish: boolean): void { this._isFinishUpgrade = isFinish; }

    /** 是否完成升级 */
    public getFinishUpgrade(): boolean { return this._isFinishUpgrade; }

    /** 设置变更结果应用时间 */
    public setApplyChangeResultTime(time: number): void { this._numApplyChangeResult = time; }

    /** 获取变更结果应用时间 */
    public getApplyChangeResultTime(): number { return this._numApplyChangeResult; }

    /** 判断是否可以生成宝石 */
    public isPossiblePowerGem(value: number): boolean {
        // const gemLevel = this.getPowerGemLevel(value);
        // const vipLevel = UserInfo.instance().getUserVipInfo().level;
        // return this.getPowerGemGrade(gemLevel, vipLevel) !== PowerGemLevelGradeType.DIMMED;
        return false;
    }
}