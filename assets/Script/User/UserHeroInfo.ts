const { ccclass } = cc._decorator;

// 依赖导入 - 与混淆源码模块映射完全一致
import HeroManager from "../manager/HeroManager";
import TSUtility from "../global_utility/TSUtility";

@ccclass("UserHeroInfo")
export default class UserHeroInfo {
    // ===================== 【常量定义】 =====================
    /** 更换主战英雄的冷却时间(秒) - 源码固定值 43200 = 12小时 */
    public static readonly HeroActiveHeroChangeCoolTime: number = 43200;

    // ===================== 【公共属性】 =====================
    /** 当前激活的英雄ID */
    public activeHeroID: string = "";
    /** 英雄奖励经验槽数值 */
    public bonusGauge: number = 0;
    /** 英雄战力经验槽数值 */
    public powerGauge: number = 0;
    /** 英雄战力等级 */
    public powerLevel: number = 1;
    /** 玩家拥有的英雄列表 */
    public heroes: HeroInfo[] = [];
    /** 上次更换主战英雄的时间戳(秒) */
    public lastActiveHeroChangeDate: number = 0;

    // ===================== 【静态解析方法】 =====================
    /**
     * 服务端数据解析为本地UserHeroInfo对象
     * @param data 服务端返回的英雄信息JSON数据
     */
    public static parse(data: any): UserHeroInfo {
        const info = new UserHeroInfo();
        if (data.activeHeroID) info.activeHeroID = data.activeHeroID;
        if (data.bonusGauge) info.bonusGauge = data.bonusGauge;
        if (data.powerGauge) info.powerGauge = data.powerGauge;
        if (data.powerLevel) info.powerLevel = data.powerLevel;
        if (data.lastChangedDate) info.lastActiveHeroChangeDate = data.lastChangedDate;

        // 解析英雄列表
        if (data.heroes && data.heroes.length > 0) {
            for (let i = 0; i < data.heroes.length; i++) {
                info.heroes.push(HeroInfo.parseObj(data.heroes[i]));
            }
        }
        return info;
    }

    // ===================== 【公共方法】 =====================
    /** 是否拥有激活的主战英雄 */
    public hasActiveHero(): boolean {
        return this.activeHeroID !== "";
    }

    /** 主战英雄是否处于可更换状态(判断冷却时间) */
    public isActiveHeroChangeable(): boolean {
        const currTime = TSUtility.getServerBaseNowUnixTime();
        return this.lastActiveHeroChangeDate + UserHeroInfo.HeroActiveHeroChangeCoolTime < currTime;
    }

    /** 判断传入的英雄ID是否为当前激活的英雄 */
    public isActiveHero(heroId: string): boolean {
        return this.activeHeroID === heroId;
    }

    /** 设置英雄战力槽和等级信息 */
    public setPowerInfo(gauge: number, level: number): void {
        this.powerGauge = gauge;
        this.powerLevel = level;
    }

    /** 判断是否拥有指定ID的英雄 */
    public hasHero(heroId: string): boolean {
        return this.getHeroInfo(heroId) !== null;
    }

    /** 获取拥有的英雄总数量 */
    public getNumberOfHeroesHave(): number {
        return this.heroes.length;
    }

    /** 增加英雄奖励经验槽数值 */
    public addHeroBonusGauge(addVal: number): void {
        this.bonusGauge += addVal;
    }

    /**
     * 给指定英雄增加经验值
     * @param heroId 英雄ID
     * @param addExp 增加的经验值
     */
    public addHeroExp(heroId: string, addExp: number): void {
        let heroInfo = this.getHeroInfo(heroId);
        // 未拥有该英雄则初始化并添加至列表
        if (heroInfo === null) {
            heroInfo = new HeroInfo();
            heroInfo.init(heroId);
            this.heroes.push(heroInfo);
        }

        // 获取英雄配置表 & 经验值上限处理 & 自动升级
        const heroCfg = HeroManager.Instance().getHeroConfig(heroId);
        heroInfo.force += addExp;
        heroInfo.force = Math.min(heroCfg.getMaxHeroLevelExp(), heroInfo.force);
        heroInfo.rank = heroCfg.getHeroLevel(heroInfo.force);
    }

    /** 获取指定英雄的详细信息 */
    public getHeroInfo(heroId: string|number): HeroInfo | null {
        for (let i = 0; i < this.heroes.length; i++) {
            if (this.heroes[i].id === heroId) {
                return this.heroes[i];
            }
        }
        return null;
    }

    /** 获取指定英雄的等级 */
    public getHeroLevel(heroId: string): number {
        const heroInfo = this.getHeroInfo(heroId);
        return heroInfo === null ? 1 : heroInfo.rank;
    }

    /** 获取指定英雄的当前经验值 */
    public getHeroLevelExp(heroId: string): number {
        const heroInfo = this.getHeroInfo(heroId);
        return heroInfo === null ? 0 : heroInfo.force;
    }

    /** 获取当前激活英雄的奖励经验槽数值 */
    public getActiveHeroBonusGauge(): number {
        return this.bonusGauge;
    }

    /**
     * 更换当前激活的主战英雄
     * @param heroId 要更换的英雄ID
     * @returns 是否更换成功
     */
    public changeActiveHero(heroId: string): boolean {
        const heroInfo = this.getHeroInfo(heroId);
        if (heroInfo === null) {
            cc.error("changeActiveHero invalid status");
            return false;
        }
        // 更新更换时间 + 重置战力槽 + 标记英雄激活状态
        this.lastActiveHeroChangeDate = TSUtility.getServerBaseNowUnixTime();
        this.activeHeroID = heroId;
        this.powerGauge = 0;
        this.powerLevel = 1;
        heroInfo.setActivate();
        return true;
    }

    // ===================== 【静态排序方法】 =====================
    /**
     * 英雄列表排序对比器 (用于数组sort方法)
     * @param heroIdA 英雄A的ID
     * @param heroIdB 英雄B的ID
     * @param heroInfoA 英雄A的信息
     * @param heroInfoB 英雄B的信息
     * @param activeHeroId 当前激活的英雄ID
     */
    public static compareHeroOrder(heroIdA: string, heroIdB: string, heroInfoA: HeroInfo | null, heroInfoB: HeroInfo | null, activeHeroId: string): number {
        // 无英雄信息时：按配置表创建时间+名称排序
        if (heroInfoA === null && heroInfoB === null) {
            const cfgA = HeroManager.Instance().getHeroConfig(heroIdA);
            const cfgB = HeroManager.Instance().getHeroConfig(heroIdB);
            if (cfgA.createDate < cfgB.createDate) return 1;
            if (cfgA.createDate > cfgB.createDate) return -1;
            return cfgA.name.localeCompare(cfgB.name);
        }
        // 一方无信息则排后面
        if (heroInfoA === null) return 1;
        if (heroInfoB === null) return -1;

        // 特殊英雄(winston)优先 + 激活英雄优先 + 等级高优先
        if (heroIdA === "hero_winston") return -1;
        if (heroIdB === "hero_winston") return 1;
        if (heroIdA === activeHeroId) return -1;
        if (heroIdB === activeHeroId) return 1;
        if (heroInfoA.rank < heroInfoB.rank) return 1;
        if (heroInfoA.rank === heroInfoB.rank) return 0;
        return -1;
    }
}

// ===================== 【内部子类：单英雄详细信息】 =====================
export class HeroInfo {
    /** 英雄ID */
    public id: string = "";
    /** 英雄等级 */
    public rank: number = 1;
    /** 英雄经验值 */
    public force: number = 0;
    /** 上次激活时间戳(秒) */
    public lastActiveDate: number = 0;
    /** 英雄获取时间戳(秒) */
    public createDate: number = 0;
    /** 英雄过期时间戳(秒) 0=永久 */
    public expireDate: number = 0;

    /** 初始化新英雄数据 */
    public init(heroId: string): void {
        this.id = heroId;
        this.rank = 1;
        this.force = 0;
        this.lastActiveDate = 0;
        this.createDate = TSUtility.getServerBaseNowUnixTime();
        this.expireDate = 0;
    }

    /** 标记英雄为激活状态，更新激活时间 */
    public setActivate(): void {
        this.lastActiveDate = TSUtility.getServerBaseNowUnixTime();
    }

    /** 判断英雄是否过期 */
    public isExpired(): boolean {
        if (this.expireDate === 0) return false;
        const currTime = TSUtility.getServerBaseNowUnixTime();
        return this.expireDate < currTime;
    }

    /** 判断是否为特殊英雄「Centurion Clique」(固定ID: hero_winston) */
    public isCenturionCliqueHero(): boolean {
        return this.id === "hero_winston";
    }

    /**
     * 解析服务端数据为单英雄信息对象
     * @param data 服务端英雄数据
     */
    public static parseObj(data: any): HeroInfo {
        const heroInfo = new HeroInfo();
        if (data.id) heroInfo.id = data.id;
        if (data.rank) heroInfo.rank = data.rank;
        if (data.force) heroInfo.force = data.force;
        if (data.lastActiveDate) heroInfo.lastActiveDate = data.lastActiveDate;
        if (data.createDate) heroInfo.createDate = data.createDate;
        if (data.expireDate) heroInfo.expireDate = data.expireDate;
        return heroInfo;
    }
}