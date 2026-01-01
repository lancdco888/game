const { ccclass } = cc._decorator;

// 导入工具类依赖
import TSUtility from "../global_utility/TSUtility";

// ===================== ✅ 数据模型类 1:1 精准还原 (原JS所有类完整提取，强类型补全) =====================
/** 英雄等级经验配置模型 */
export class HeroConfigLevelInfo {
    public level: number = 0;
    public exp: number = 0;
    public maxExp: number = 0;

    public static parseObj(data: any): HeroConfigLevelInfo {
        const info = new HeroConfigLevelInfo();
        info.level = data.level;
        info.exp = data.exp;
        return info;
    }
}

/** 英雄属性加成配置模型 */
export class HeroConfigStat {
    public level: number = 0;
    public base: number = 0;
    public starAlbum: number = 0;
    public dailyBlitz: number = 0;
    public freeBonus: number = 0;
    public bingo: number = 0;

    public static parseObj(data: any): HeroConfigStat {
        const stat = new HeroConfigStat();
        if (data.level) stat.level = data.level;
        if (data.base) stat.base = data.base;
        if (data.starAlbum) stat.starAlbum = data.starAlbum;
        if (data.dailyBlitz) stat.dailyBlitz = data.dailyBlitz;
        if (data.freeBonus) stat.freeBonus = data.freeBonus;
        if (data.bingo) stat.bingo = data.bingo;
        return stat;
    }
}

/** 英雄核心配置模型 (等级+属性+基础信息) */
export class HeroConfig {
    public id: string = "";
    public name: string = "";
    public code: string = "";
    public createDate: number = 0;
    public levels: HeroConfigLevelInfo[] = [];
    public stats: HeroConfigStat[] = [];

    /** 根据经验值获取当前等级 */
    public getHeroLevel(exp: number): number {
        let targetLevel = this.levels[this.levels.length - 1];
        for (let i = 1; i < this.levels.length; ++i) {
            if (exp < this.levels[i].exp) {
                targetLevel = this.levels[i - 1];
                break;
            }
        }
        return targetLevel.level;
    }

    /** 根据经验值获取等级配置 */
    public getHeroLevelConfig(exp: number): HeroConfigLevelInfo {
        let targetCfg = this.levels[this.levels.length - 1];
        for (let i = 1; i < this.levels.length; ++i) {
            if (exp < this.levels[i].exp) {
                targetCfg = this.levels[i - 1];
                break;
            }
        }
        return targetCfg;
    }

    /** 获取最大等级 */
    public getMaxHeroLevel(): number {
        return this.levels[this.levels.length - 1].level;
    }

    /** 获取满级所需经验 */
    public getMaxHeroLevelExp(): number {
        return this.levels[this.levels.length - 1].exp;
    }

    /** 获取英雄展示名称 */
    public getDisplayName(): string {
        return this.name;
    }

    /** 根据等级获取属性配置 */
    public getHeroStat(level: number): HeroConfigStat | null {
        for (let i = 0; i < this.stats.length; ++i) {
            if (this.stats[i].level === level) {
                return this.stats[i];
            }
        }
        cc.error("getHeroStat invalid ", level);
        return null;
    }

    /** 解析数据为英雄配置对象 */
    public static parseObj(data: any): HeroConfig {
        const cfg = new HeroConfig();
        if (data.id) cfg.id = data.id;
        if (data.code) cfg.code = data.code;
        if (data.createDate) cfg.createDate = data.createDate;

        // 解析等级经验配置
        if (data.levels) {
            for (let i = 0; i < data.levels.length; ++i) {
                cfg.levels.push(HeroConfigLevelInfo.parseObj(data.levels[i]));
            }
            // 赋值每级最大经验
            for (let i = 1; i < cfg.levels.length; ++i) {
                cfg.levels[i - 1].maxExp = cfg.levels[i].exp;
            }
            const maxLevel = cfg.levels[cfg.levels.length - 1];
            maxLevel.maxExp = maxLevel.exp;
        }

        // 解析属性配置 & 等级成长计算
        if (data.name) cfg.name = data.name;
        if (data.stats) {
            const baseStat = HeroConfigStat.parseObj(data.stats[0]);
            cfg.stats.push(baseStat);
            // 等级2-5 属性成长计算 (原逻辑: 累加等级值+上限10)
            for (let i = 1; i < 5; ++i) {
                const stat = HeroConfigStat.parseObj(data.stats[0]);
                stat.level = i + 1;
                stat.base = Math.min(10, stat.base + i);
                stat.starAlbum = Math.min(10, stat.starAlbum + i);
                stat.dailyBlitz = Math.min(10, stat.dailyBlitz + i);
                stat.freeBonus = Math.min(10, stat.freeBonus + i);
                stat.bingo = Math.min(10, stat.bingo + i);
                cfg.stats.push(stat);
            }
        }
        return cfg;
    }
}

/** 英雄奖励倍率-进度条配置模型 */
export class HeroBonusGaugeConfig {
    public multiplier: number = 0;
    public gauge: number = 0;
    public maxGauge: number = 0;

    public static parseObj(data: any): HeroBonusGaugeConfig {
        const cfg = new HeroBonusGaugeConfig();
        cfg.multiplier = data.multiplier;
        cfg.gauge = data.gauge;
        return cfg;
    }
}

/** 英雄奖励投注配置模型 */
export class HeroBonusBetConfig {
    public betCoin: number = 0;

    public static parseObj(data: any): HeroBonusBetConfig {
        const cfg = new HeroBonusBetConfig();
        cfg.betCoin = data.betCoin;
        return cfg;
    }
}

// ===================== ✅ 核心单例管理器 (全局唯一，英雄数据总控) =====================
@ccclass('HeroManager')
export default class HeroManager {
    // 单例实例
    private static _instance: HeroManager | null = null;

    // 私有配置数据 (补全TS泛型约束，类型精准)
    private _heroConfig: { [heroId: string]: HeroConfig } = {};
    private _bonusGaugeConfig: HeroBonusGaugeConfig[] = [];
    private _bonusBetConfig: HeroBonusBetConfig[] = [];
    private _newTagInfo: any[] = [];

    // ===================== 单例模式 (原JS逻辑1:1还原) =====================
    public static Instance(): HeroManager {
        if (HeroManager._instance === null) {
            HeroManager._instance = new HeroManager();
            HeroManager._instance.initHeroManager();
        }
        return HeroManager._instance;
    }

    // ===================== 初始化所有英雄配置数据 (硬编码数据100%完整保留，无任何修改) =====================
    private initHeroManager(): void {
        // ✅ 所有英雄基础配置数据 (ID/名称/等级经验/属性加成 完整照搬)
        const heroCfgList = [
            {
                id: "hero_cleopatra",
                name: "CLEOPATRA",
                code: "001",
                createDate: TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 1, 1, 0, 0, 0) / 1000),
                levels: [{ level: 1, exp: 0 }, { level: 2, exp: 50 }, { level: 3, exp: 200 }, { level: 4, exp: 450 }, { level: 5, exp: 800 }],
                stats: [{ level: 1, base: 1, starAlbum: 3, dailyBlitz: 1, freeBonus: 3, bingo: 2 }, { level: 2, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 3, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 4, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 5, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }]
            },
            {
                id: "hero_poseidon",
                name: "POSEIDON",
                code: "002",
                createDate: TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 1, 1, 0, 0, 0) / 1000),
                levels: [{ level: 1, exp: 0 }, { level: 2, exp: 50 }, { level: 3, exp: 200 }, { level: 4, exp: 450 }, { level: 5, exp: 800 }],
                stats: [{ level: 1, base: 2, starAlbum: 1, dailyBlitz: 3, freeBonus: 2, bingo: 2 }, { level: 2, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 3, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 4, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 5, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }]
            },
            {
                id: "hero_perkyturkey",
                name: "PERKY TURKEY",
                code: "003",
                createDate: TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 1, 1, 0, 0, 0) / 1000),
                levels: [{ level: 1, exp: 0 }, { level: 2, exp: 50 }, { level: 3, exp: 200 }, { level: 4, exp: 450 }, { level: 5, exp: 800 }],
                stats: [{ level: 1, base: 1, starAlbum: 1, dailyBlitz: 2, freeBonus: 3, bingo: 3 }, { level: 2, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 3, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 4, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 5, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }]
            },
            {
                id: "hero_lenny",
                name: "LENNY",
                code: "004",
                createDate: TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 2, 5, 0, 0, 0) / 1000),
                levels: [{ level: 1, exp: 0 }, { level: 2, exp: 50 }, { level: 3, exp: 200 }, { level: 4, exp: 450 }, { level: 5, exp: 800 }],
                stats: [{ level: 1, base: 2, starAlbum: 3, dailyBlitz: 1, freeBonus: 3, bingo: 1 }, { level: 2, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 3, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 4, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 5, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }]
            },
            {
                id: "hero_sunnybunny",
                name: "SUNNY BUNNY",
                code: "005",
                createDate: TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 2, 17, 0, 0, 0) / 1000),
                levels: [{ level: 1, exp: 0 }, { level: 2, exp: 50 }, { level: 3, exp: 200 }, { level: 4, exp: 450 }, { level: 5, exp: 800 }],
                stats: [{ level: 1, base: 3, starAlbum: 1, dailyBlitz: 2, freeBonus: 2, bingo: 2 }, { level: 2, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 3, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 4, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 5, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }]
            },
            {
                id: "hero_cactus",
                name: "SR.CACTUS",
                code: "006",
                createDate: TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 3, 22, 0, 0, 0) / 1000),
                levels: [{ level: 1, exp: 0 }, { level: 2, exp: 50 }, { level: 3, exp: 200 }, { level: 4, exp: 450 }, { level: 5, exp: 800 }],
                stats: [{ level: 1, base: 2, starAlbum: 3, dailyBlitz: 1, freeBonus: 2, bingo: 4 }, { level: 2, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 3, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 4, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 5, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }]
            },
            {
                id: "hero_eagleeddy",
                name: "EAGLE EDDY",
                code: "007",
                createDate: TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 3, 25, 0, 0, 0) / 1000),
                levels: [{ level: 1, exp: 0 }, { level: 2, exp: 50 }, { level: 3, exp: 200 }, { level: 4, exp: 450 }, { level: 5, exp: 800 }],
                stats: [{ level: 1, base: 4, starAlbum: 2, dailyBlitz: 3, freeBonus: 2, bingo: 1 }, { level: 2, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 3, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 4, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 5, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }]
            },
            {
                id: "hero_cpthook",
                name: "CPT.HOOK",
                code: "008",
                createDate: TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 3, 26, 0, 0, 0) / 1000),
                levels: [{ level: 1, exp: 0 }, { level: 2, exp: 50 }, { level: 3, exp: 200 }, { level: 4, exp: 450 }, { level: 5, exp: 800 }],
                stats: [{ level: 1, base: 2, starAlbum: 4, dailyBlitz: 3, freeBonus: 1, bingo: 4 }, { level: 2, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 3, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 4, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 5, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }]
            },
            {
                id: "hero_aurora",
                name: "AURORA",
                code: "009",
                createDate: TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 3, 27, 0, 0, 0) / 1000),
                levels: [{ level: 1, exp: 0 }, { level: 2, exp: 50 }, { level: 3, exp: 200 }, { level: 4, exp: 450 }, { level: 5, exp: 800 }],
                stats: [{ level: 1, base: 3, starAlbum: 5, dailyBlitz: 1, freeBonus: 1, bingo: 3 }, { level: 2, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 3, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 4, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 5, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }]
            },
            {
                id: "hero_genie",
                name: "GENIE",
                code: "009",
                createDate: TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 3, 28, 0, 0, 0) / 1000),
                levels: [{ level: 1, exp: 0 }, { level: 2, exp: 50 }, { level: 3, exp: 200 }, { level: 4, exp: 450 }, { level: 5, exp: 800 }],
                stats: [{ level: 1, base: 4, starAlbum: 1, dailyBlitz: 1, freeBonus: 3, bingo: 5 }, { level: 2, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 3, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 4, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 5, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }]
            },
            {
                id: "hero_raine",
                name: "RAINE",
                code: "010",
                createDate: TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 3, 29, 0, 0, 0) / 1000),
                levels: [{ level: 1, exp: 0 }, { level: 2, exp: 50 }, { level: 3, exp: 200 }, { level: 4, exp: 450 }, { level: 5, exp: 800 }],
                stats: [{ level: 1, base: 5, starAlbum: 3, dailyBlitz: 2, freeBonus: 3, bingo: 1 }, { level: 2, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 3, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 4, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 5, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }]
            },
            {
                id: "hero_zelda",
                name: "ZELDA",
                code: "010",
                createDate: TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 8, 30, 0, 0, 0) / 1000),
                levels: [{ level: 1, exp: 0 }, { level: 2, exp: 50 }, { level: 3, exp: 200 }, { level: 4, exp: 450 }, { level: 5, exp: 800 }],
                stats: [{ level: 1, base: 1, starAlbum: 5, dailyBlitz: 4, freeBonus: 3, bingo: 1 }, { level: 2, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 3, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 4, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 5, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }]
            },
            {
                id: "hero_ragnar",
                name: "RAGNAR",
                code: "011",
                createDate: TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 10, 21, 0, 0, 0) / 1000),
                levels: [{ level: 1, exp: 0 }, { level: 2, exp: 50 }, { level: 3, exp: 200 }, { level: 4, exp: 450 }, { level: 5, exp: 800 }],
                stats: [{ level: 1, base: 3, starAlbum: 4, dailyBlitz: 2, freeBonus: 3, bingo: 3 }, { level: 2, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 3, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 4, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 5, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }]
            },
            {
                id: "hero_santa",
                name: "SANTA",
                code: "012",
                createDate: TSUtility.getPstToUtcTimestamp(Date.UTC(2021, 11, 5, 0, 0, 0) / 1000),
                levels: [{ level: 1, exp: 0 }, { level: 2, exp: 50 }, { level: 3, exp: 200 }, { level: 4, exp: 450 }, { level: 5, exp: 800 }],
                stats: [{ level: 1, base: 5, starAlbum: 5, dailyBlitz: 1, freeBonus: 1, bingo: 3 }, { level: 2, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 3, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 4, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 5, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }]
            },
            {
                id: "hero_winston",
                name: "WINSTON",
                code: "013",
                createDate: TSUtility.getPstToUtcTimestamp(Date.UTC(2024, 7, 1, 0, 0, 0) / 1000),
                levels: [{ level: 1, exp: 0 }, { level: 2, exp: 50 }, { level: 3, exp: 200 }, { level: 4, exp: 450 }, { level: 5, exp: 800 }],
                stats: [{ level: 1, base: 10, starAlbum: 10, dailyBlitz: 10, freeBonus: 10, bingo: 10 }, { level: 2, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 3, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 4, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }, { level: 5, base: 0, starAlbum: 0, dailyBlitz: 0, freeBonus: 0, bingo: 0 }]
            }
        ];

        // 解析英雄配置
        for (let i = 0; i < heroCfgList.length; ++i) {
            const heroCfg = HeroConfig.parseObj(heroCfgList[i]);
            this._heroConfig[heroCfg.id] = heroCfg;
        }

        // ✅ 奖励倍率-进度条配置
        const bonusGaugeList = [{ multiplier: 1, gauge: 0 }, { multiplier: 2, gauge: 170 }, { multiplier: 3, gauge: 500 }, { multiplier: 4, gauge: 1000 }, { multiplier: 5, gauge: 1500 }];
        for (let i = 0; i < bonusGaugeList.length; ++i) {
            this._bonusGaugeConfig.push(HeroBonusGaugeConfig.parseObj(bonusGaugeList[i]));
        }
        // 赋值最大进度值
        for (let i = 1; i < this._bonusGaugeConfig.length; ++i) {
            this._bonusGaugeConfig[i - 1].maxGauge = this._bonusGaugeConfig[i].gauge;
        }
        const maxGaugeCfg = this._bonusGaugeConfig[this._bonusGaugeConfig.length - 1];
        maxGaugeCfg.maxGauge = maxGaugeCfg.gauge;

        // ✅ 奖励投注配置
        const bonusBetList = [{ betCoin: 0, gauge: 0.7 }, { betCoin: 30000, gauge: 0.72 }, { betCoin: 60000, gauge: 0.74 }, { betCoin: 120000, gauge: 0.77 }, { betCoin: 300000, gauge: 0.8 }, { betCoin: 600000, gauge: 0.84 }, { betCoin: 1200000, gauge: 0.93 }, { betCoin: 3000000, gauge: 1.02 }, { betCoin: 6000000, gauge: 1.16 }, { betCoin: 12000000, gauge: 1.43 }, { betCoin: 30000000, gauge: 1.73 }, { betCoin: 60000000, gauge: 2.15 }, { betCoin: 120000000, gauge: 3 }];
        for (let i = 0; i < bonusBetList.length; ++i) {
            this._bonusBetConfig.push(HeroBonusBetConfig.parseObj(bonusBetList[i]));
        }
    }

    // ===================== ✅ 所有业务方法 1:1 精准还原 (无逻辑改动，补全强类型) =====================
    /** 根据进度值获取奖励倍率 */
    public getBonusMultiplier(gauge: number): number {
        let targetCfg = this._bonusGaugeConfig[this._bonusGaugeConfig.length - 1];
        for (let i = 1; i < this._bonusGaugeConfig.length; ++i) {
            if (gauge < this._bonusGaugeConfig[i].gauge) {
                targetCfg = this._bonusGaugeConfig[i - 1];
                break;
            }
        }
        return targetCfg.multiplier;
    }

    /** 根据英雄ID获取配置 */
    public getHeroConfig(heroId: string): HeroConfig | null {
        const cfg = this._heroConfig[heroId];
        if (cfg === null) {
            cc.error("getHeroConfig invalid heroId", heroId);
            return null;
        }
        return cfg;
    }

    /** 获取英雄经验百分比 (进度条用) */
    public getHeroExpPercent(heroId: string, exp: number): number {
        const cfg = this.getHeroConfig(heroId);
        if (!cfg) return 0;
        const levelCfg = cfg.getHeroLevelConfig(exp);
        return exp >= cfg.getMaxHeroLevelExp() ? 1 : (exp - levelCfg.exp) / (levelCfg.maxExp - levelCfg.exp);
    }

    /** 根据经验值获取英雄等级 */
    public getHeroLevelByExp(heroId: string, exp: number): number {
        const cfg = this.getHeroConfig(heroId);
        return cfg ? cfg.getHeroLevel(exp) : 1;
    }

    /** 获取下一级所需经验 */
    public getHeroLevelNextExp(heroId: string, exp: number): number {
        const cfg = this.getHeroConfig(heroId);
        return cfg ? cfg.getHeroLevelConfig(exp).maxExp : 0;
    }

    /** 获取当前等级最小经验值 */
    public getHeroLevelMinExp(heroId: string, exp: number): number {
        const cfg = this.getHeroConfig(heroId);
        return cfg ? cfg.getHeroLevelConfig(exp).exp : 0;
    }

    /** 根据进度值获取奖励等级 */
    public getBonusGaugeGrade(gauge: number): number {
        for (let i = 1; i < this._bonusGaugeConfig.length; ++i) {
            if (gauge < this._bonusGaugeConfig[i].gauge) {
                return i;
            }
        }
        return this._bonusGaugeConfig.length;
    }

    /** 获取奖励最大等级 */
    public getBonusGaugeMaxGrade(): number {
        return this._bonusGaugeConfig.length;
    }

    /** 获取奖励进度百分比 */
    public getBonusGaugeProgress(gauge: number): number {
        const cfg = this.getBonusGaugeConfigByExp(gauge);
        return cfg.maxGauge === cfg.gauge ? 1 : (gauge - cfg.gauge) / (cfg.maxGauge - cfg.gauge);
    }

    /** 根据索引获取奖励配置 */
    public getBonusGaugeConfig(index: number): HeroBonusGaugeConfig | null {
        return this._bonusGaugeConfig[index] || null;
    }

    /** 根据进度值获取奖励配置 */
    public getBonusGaugeConfigByExp(gauge: number): HeroBonusGaugeConfig {
        const grade = this.getBonusGaugeGrade(gauge) - 1;
        return this.getBonusGaugeConfig(grade)!;
    }

    /** 获取奖励最大进度值 */
    public getMaxBonusGauge(): number {
        return this._bonusGaugeConfig[this._bonusGaugeConfig.length - 1].gauge;
    }

    /** 根据投注金额获取奖励等级 */
    public getBonusBetGauge(betCoin: number): number {
        for (let i = 1; i < this._bonusBetConfig.length; ++i) {
            if (betCoin <= this._bonusBetConfig[i].betCoin) {
                return i;
            }
        }
        return this._bonusBetConfig.length;
    }

    /** 获取投注最大等级 */
    public getMaxBonusBetGauge(): number {
        return this._bonusBetConfig.length;
    }

    /** 获取所有英雄ID */
    public getAllHeroIds(): string[] {
        return Object.keys(this._heroConfig);
    }

    /** 初始化新标签信息 */
    public initNewTagInfo(info: any[]): void {
        this._newTagInfo = info;
    }

    /** 添加新标签 (空实现) */
    public addNewTag(): void {}

    /** 清空新标签 (空实现) */
    public clearNewTag(): void {}

    /** 是否有新标签 (空实现) */
    public isNewTag(): boolean {
        return false;
    }

    /** 是否有任意新标签 (空实现) */
    public hasAnyNewTag(): boolean {
        return false;
    }

    /** 判断是否是阵营英雄 (仅Winston是) */
    public isCenturionCliqueHero(heroId: string): boolean {
        return heroId === "hero_winston";
    }
}