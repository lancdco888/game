/**
 * 等级投注锁定 基础数据模型类
 * 存储：玩家等级、解锁投注金额、该等级最大投注金额
 */
export class LevelBetLock_LevelInfo {
    public level: number = 0;
    public betMoney: number = 0;
    public maxBetMoney: number = 0;

    /**
     * 初始化等级投注配置数据
     * @param data 后端/配置表下发的等级投注数据
     */
    public init(data: { level: number, betMoney: number, maxBetMoney: number }): void {
        this.level = data.level;
        this.betMoney = data.betMoney;
        this.maxBetMoney = data.maxBetMoney;
    }
}

/**
 * 分区投注锁定 配置模型类
 * 存储：游戏分区ID、是否启用投注锁定、该分区下所有等级投注配置列表
 */
export class LevelBetLock_ZoneInfo {
    public zoneId: number = 0;
    public useLock: boolean = false;
    public infos: LevelBetLock_LevelInfo[] = [];

    /**
     * 初始化分区投注锁定配置
     * @param data 后端/配置表下发的分区投注锁定数据
     */
    public init(data: { id: number, useLock: number, info: Array<{ level: number, betMoney: number, maxBetMoney: number }> }): void {
        this.zoneId = data.id;
        this.useLock = data.useLock === 1; // 原JS 1==useLock 转布尔值
        
        // 循环初始化等级投注配置列表
        for (let t = 0; t < data.info.length; ++t) {
            const levelInfo = new LevelBetLock_LevelInfo();
            levelInfo.init(data.info[t]);
            this.infos.push(levelInfo);
        }
    }

    /**
     * 获取玩家当前等级 下一个需要解锁的投注等级配置
     * @param currLevel 玩家当前等级
     * @returns 下一级配置/Null(无需解锁/未启用锁定)
     */
    public getNextLevelBetLock_LevelInfo(currLevel: number): LevelBetLock_LevelInfo | null {
        if (!this.useLock) return null;
        for (let t = 0; t < this.infos.length; ++t) {
            if (currLevel < this.infos[t].level) {
                return this.infos[t];
            }
        }
        return null;
    }

    /**
     * 获取玩家当前投注金额 可解锁的最高等级
     * @param currBetMoney 玩家当前投注金额
     * @returns 可解锁等级(未启用锁定返回1)
     */
    public getNextAvailable_Level(currBetMoney: number): number {
        if (!this.useLock) return 1;
        for (let t = 1; t < this.infos.length; ++t) {
            if (currBetMoney < this.infos[t].betMoney) {
                return this.infos[t - 1].level;
            }
        }
        return this.infos[this.infos.length - 1].level;
    }
}

/**
 * 等级投注锁定全局配置管理器 - 纯静态单例模式 (无继承cc.Component)
 * 核心功能：全局初始化投注锁定配置、分区锁定开关校验、投注解锁条件判断、配置查询
 * 无外部依赖 | 无节点挂载 | 全局静态调用
 */
export default class LevelBettingLockConfig {
    // ===================== 【单例核心】原JS完整还原 静态私有实例 =====================
    private static _instance: LevelBettingLockConfig | null = null;
    // 分区配置列表 - 以分区ID为下标存储，原JS核心存储方式
    private _zoneInfos: { [key: number]: LevelBetLock_ZoneInfo } = {};

    // ===================== 【静态全局接口】原JS完整复刻 调用方式不变 =====================
    /**
     * 获取全局单例实例 (未初始化会打印cc.error警告)
     */
    public static Instance(): LevelBettingLockConfig {
        if (this._instance === null) {
            cc.error("LevelBettingLockConfig not initialized");
        }
        return this._instance!;
    }

    /**
     * 全局初始化投注锁定配置 (唯一初始化入口)
     * @param configData 全局投注锁定配置表
     * @returns boolean 初始化成功标记
     */
    public static Init(configData: { levelBettingLock: Array<any> }): boolean {
        this._instance = new LevelBettingLockConfig();
        this._instance.initLevelBettingLockConfig(configData);
        return true;
    }

    // ===================== 【私有初始化方法】原JS逻辑100%复刻 =====================
    private initLevelBettingLockConfig(configData: { levelBettingLock: Array<any> }): void {
        for (let t = 0; t < configData.levelBettingLock.length; ++t) {
            const zoneInfo = new LevelBetLock_ZoneInfo();
            zoneInfo.init(configData.levelBettingLock[t]);
            this._zoneInfos[zoneInfo.zoneId] = zoneInfo; // 按分区ID为下标存储
        }
    }

    // ===================== 【核心业务方法】原JS所有方法完整复刻 =====================
    /**
     * 判断指定分区是否启用 等级投注锁定功能
     * @param zoneId 游戏分区ID
     * @returns boolean 是否启用锁定
     */
    public isUseLevelBettingLock(zoneId: number): boolean {
        return this._zoneInfos[zoneId].useLock;
    }

    /**
     * 根据分区ID 获取该分区的投注锁定完整配置
     * @param zoneId 游戏分区ID
     * @returns 分区投注锁定配置
     */
    public getZoneInfo(zoneId: number): LevelBetLock_ZoneInfo {
        return this._zoneInfos[zoneId];
    }

    /**
     * 核心校验：判断玩家当前等级+投注金额 是否满足分区的投注锁定解锁条件
     * @param currLevel 玩家当前等级
     * @param currBetMoney 玩家当前投注金额
     * @param zoneId 游戏分区ID
     * @returns boolean 是否解锁投注锁定
     */
    public isReleaseBettingLock(currLevel: number, currBetMoney: number, zoneId: number): boolean {
        if (LevelBettingLockConfig.Instance().isUseLevelBettingLock(zoneId)) {
            const zoneInfo = this.getZoneInfo(zoneId);
            for (let i = 0; i < zoneInfo.infos.length; i++) {
                if (currLevel > 1 && currLevel === zoneInfo.infos[i].level) {
                    return currBetMoney <= zoneInfo.infos[i].maxBetMoney;
                }
            }
        }
        return false;
    }
}