const { ccclass, property } = cc._decorator;

/**
 * 等级配置数据实体类
 * 承载单级别的所有配置信息：等级、升级所需最小经验、升级奖励金币、本级最大经验值
 */
@ccclass('LevelGradeInfo')
export class LevelGradeInfo {
    public level: number = 0;        // 当前等级
    public minExp: number = 0;       // 升级到该等级所需的最小经验值
    public rewardMoney: number = 0;  // 升级到该等级的奖励金币
    public maxExp: number = 0;       // 该等级的最大经验值(升级到下一级的临界值)

    /** 初始化等级配置数据 */
    public init(data: any): void {
        this.level = data.id;
        this.minExp = data.exp;
        this.rewardMoney = data.rewardMoney;
    }
}

/**
 * 全局等级系统管理器 - 单例模式
 * 核心功能：初始化等级配置表、经验值→等级映射、等级经验百分比计算、获取等级配置信息
 * 项目中所有等级/经验相关逻辑均通过该单例调用，是等级系统的唯一入口
 */
@ccclass('LevelManager')
export default class LevelManager {
    // ===== 单例核心配置 - 完全保留原项目调用方式 不可改动 =====
    private static _instance: LevelManager = null;
    private _levelInfos: Array<LevelGradeInfo> = []; // 等级配置数据表

    /**
     * 获取单例实例 - 原项目调用方式完全不变
     * 注意：必须先调用 Init() 初始化，否则会打印错误日志并返回null
     */
    public static Instance(): LevelManager {
        if (this._instance == null) {
            cc.error("not initialized LevelManager");
        }
        return this._instance;
    }

    /**
     * 初始化等级管理器 - 原项目调用方式完全不变
     * @param config 后端/配置表传入的等级配置总数据
     * @returns 初始化是否成功
     */
    public static Init(config: any): boolean {
        this._instance = new LevelManager();
        this._instance.initLevelManager(config);
        return true;
    }

    // ===== 核心初始化逻辑 - 完全复刻原代码 无任何修改 =====
    /** 初始化等级配置表，处理等级经验区间、最大经验值 */
    private initLevelManager(config: any): void {
        // 遍历配置表 创建等级数据实体 存入数组
        for (let i = 0; i < config.level.length; ++i) {
            const levelInfo = new LevelGradeInfo();
            levelInfo.init(config.level[i]);
            this._levelInfos.push(levelInfo);
        }

        // 为每个等级设置【最大经验值】= 下一级的最小经验值
        for (let i = 0; i < this._levelInfos.length - 1; ++i) {
            this._levelInfos[i].maxExp = this._levelInfos[i + 1].minExp;
        }

        // 最后一个等级的最大经验值 = 自身最小经验值 * 10 (封顶逻辑)
        const lastLevelIdx = this._levelInfos.length - 1;
        const lastMinExp = this._levelInfos[lastLevelIdx].minExp;
        this._levelInfos[lastLevelIdx].maxExp = 10 * lastMinExp;
    }

    // ===== 对外开放的核心业务方法 - 全部保留 类型注解完善 =====
    /** 获取游戏内开放的最大等级 */
    public getMaxLevel(): number {
        return this._levelInfos.length;
    }

    /**
     * 根据等级 获取该等级的详细配置信息
     * @param level 目标等级
     * @returns 等级配置实体
     */
    public getLevelInfo(level: number): LevelGradeInfo {
        return this._levelInfos[level - 1];
    }

    /**
     * 核心方法：根据玩家当前总经验值 匹配对应的等级
     * @param totalExp 玩家总经验值
     * @returns 经验值对应的等级
     */
    public getLevelFromExp(totalExp: number): number {
        for (let i = 0; i < this._levelInfos.length; ++i) {
            if (totalExp < this._levelInfos[i].maxExp) {
                return i + 1;
            }
        }
        // 经验值超过最大等级阈值 直接返回最大等级(兜底逻辑)
        return this._levelInfos.length;
    }

    /**
     * 核心方法：计算玩家当前经验值 在【当前等级】中的进度百分比
     * @param totalExp 玩家总经验值
     * @returns 0~1的百分比值，达到最大等级时固定返回1
     */
    public getLevelExpPercent(totalExp: number): number {
        const curLevel = this.getLevelFromExp(totalExp);
        // 已达最大等级 进度百分比封顶为1
        if (curLevel === this.getMaxLevel()) {
            return 1;
        }
        // 获取当前等级的配置 计算进度
        const levelInfo = this.getLevelInfo(curLevel);
        return (totalExp - levelInfo.minExp) / (levelInfo.maxExp - levelInfo.minExp);
    }
}