// UnlockContentsManager.ts
const { ccclass, property } = cc._decorator;
import TSUtility from "../global_utility/TSUtility";
import UserInfo from "../User/UserInfo";

/**
 * 游戏内容解锁类型枚举 - 项目所有可解锁功能模块的类型标识
 * 与原JS枚举值完全一致，无增删改
 */
export enum UnlockContentsType {
    NONE = "None",
    LEVEL_PASS = "LevelPass",
    CASINO_JACKPOT = "CasinoJackpot",
    THE_REEL_QUEST = "TheReelQuest",
    BINGO = "Bingo",
    STAR_ALBUM = "StarAlbum",
    HERO = "Hero",
    CLUB = "Club",
    DAILY_BLITZ = "DailyBlitz"
}

/**
 * 解锁内容数据模型类
 * 封装单类解锁内容的类型/名称/解锁等级/新手标识等数据
 */
export class UnlockContentsData {
    public strType: UnlockContentsType = UnlockContentsType.NONE;
    public strName: string = "";
    public numLevel: number = 0;
    public isNewbieUser: boolean = false;

    /**
     * 只读访问器 - 获取解锁条件等级 (原JS核心保留逻辑)
     */
    public get conditionLevel(): number {
        return this.numLevel;
    }
}

/**
 * 全局解锁内容管理核心组件 (单例模式)
 * 核心职责：统一管理游戏内所有功能模块的等级解锁逻辑、查询解锁状态/等级/名称等
 * 被 HeroTooltipPopup 核心调用 → 英雄卡片解锁等级判断 (14级解锁英雄系统)
 * 无序列化绑定属性，纯逻辑管理组件
 */
@ccclass
export default class UnlockContentsManager extends cc.Component {
    //#region ====== 静态单例核心配置 ======
    private static _instance: UnlockContentsManager | null = null;
    /**
     * 获取全局唯一单例实例 (懒加载初始化)
     */
    public static get instance(): UnlockContentsManager {
        if (!UnlockContentsManager._instance) {
            UnlockContentsManager._instance = new UnlockContentsManager();
            UnlockContentsManager._instance.initialize();
        }
        return UnlockContentsManager._instance;
    }
    //#endregion

    //#region ====== 核心解锁配置常量【原逻辑完全复刻，解锁等级不可修改】 ======
    public readonly UNLOCK_CONTENTS_DATA = [
        { key: UnlockContentsType.LEVEL_PASS, value: { level: 3, name: "LEVEL PASS" } },
        { key: UnlockContentsType.CASINO_JACKPOT, value: { level: 5, name: "CASINO JACKPOT" } },
        { key: UnlockContentsType.THE_REEL_QUEST, value: { level: 7, name: "THE REEL QUEST" } },
        { key: UnlockContentsType.BINGO, value: { level: 9, name: "BINGO" } },
        { key: UnlockContentsType.STAR_ALBUM, value: { level: 12, name: "STAR ALBUM" } },
        { key: UnlockContentsType.HERO, value: { level: 14, name: "HERO" } }, // ✅ 英雄解锁核心等级
        { key: UnlockContentsType.DAILY_BLITZ, value: { level: 1, name: "DAILY BLITZ" } },
        { key: UnlockContentsType.CLUB, value: { level: 15, name: "CLUB" } }
    ];
    //#endregion

    //#region ====== 私有成员变量 ======
    private _isNewbieUser: boolean = false;
    private _initialized: boolean = false;
    private _data: UnlockContentsData[] = [];
    //#endregion

    //#region ====== 初始化核心方法 ======
    /**
     * 初始化解锁数据 - 仅执行一次，生成所有解锁内容的模型数据
     * 懒加载触发，单例创建时自动执行
     */
    public initialize(): void {
        if (this._initialized) return;
        this._data = [];

        for (let i = 0; i < this.UNLOCK_CONTENTS_DATA.length; i++) {
            const configItem = this.UNLOCK_CONTENTS_DATA[i];
            if (!TSUtility.isValid(configItem)) continue;

            const unlockData = new UnlockContentsData();
            if (TSUtility.isValid(configItem.value.level)) unlockData.numLevel = configItem.value.level;
            if (TSUtility.isValid(configItem.value.name)) unlockData.strName = configItem.value.name;
            unlockData.isNewbieUser = this._isNewbieUser;
            unlockData.strType = configItem.key;
            this._data.push(unlockData);
        }

        this._initialized = true;
    }
    //#endregion

    //#region ====== 公共查询方法 - 解锁状态判断【高频调用】 ======
    /**
     * 判断是否已解锁全部游戏内容 (玩家等级足够高)
     * @param userLevel 玩家当前等级 (不传则自动获取)
     * @returns true=全部解锁 false=还有未解锁内容
     */
    public isAllUnlockContentsOpen(userLevel?: number): boolean {
        const level = userLevel ?? UserInfo.instance().getUserLevelInfo().level;
        const currentUnlockData = this.getCurrentUnlockContentsData(level);
        return !TSUtility.isValid(currentUnlockData);
    }

    /**
     * 判断指定类型的内容是否已解锁 ✅【最常用核心方法】
     * @param type 解锁内容类型
     * @returns true=已解锁 false=未解锁
     */
    public isUnlockContentsOpen(type: UnlockContentsType): boolean {
        const userLevel = UserInfo.instance().getUserLevelInfo().level;
        const unlockLevel = this.getUnlockConditionLevel(type);
        return userLevel >= unlockLevel;
    }
    //#endregion

    //#region ====== 公共查询方法 - 解锁数据获取【高频调用】 ======
    /**
     * 根据类型获取指定解锁内容的完整数据模型
     * @param type 解锁内容类型
     * @returns 解锁数据模型 / null(无对应类型)
     */
    public getUnlockContentsData(type: UnlockContentsType): UnlockContentsData | null {
        return this._data.find(item => item.strType === type) || null;
    }

    /**
     * 获取指定类型内容的解锁条件等级 ✅【HeroTooltipPopup核心调用】
     * @param type 解锁内容类型
     * @returns 解锁等级 / 0(无对应类型)
     */
    public getUnlockConditionLevel(type: UnlockContentsType): number {
        const unlockData = this.getUnlockContentsData(type);
        return TSUtility.isValid(unlockData) ? unlockData.conditionLevel : 0;
    }

    /**
     * 获取指定类型内容的展示名称
     * @param type 解锁内容类型
     * @returns 展示名称 / 空字符串(无对应类型)
     */
    public getUnlockContentsName(type: UnlockContentsType): string {
        const unlockData = this.getUnlockContentsData(type);
        return TSUtility.isValid(unlockData) ? unlockData.strName : "";
    }

    /**
     * 获取当前玩家等级下【未解锁的最高优先级】内容数据
     * @param userLevel 玩家当前等级 (不传则自动获取)
     * @returns 未解锁内容数据 / null(全部解锁)
     */
    public getCurrentUnlockContentsData(userLevel?: number): UnlockContentsData | null {
        const level = userLevel ?? UserInfo.instance().getUserLevelInfo().level;
        let targetData: UnlockContentsData | null = null;

        for (let i = 0; i < this._data.length; i++) {
            const unlockData = this._data[i];
            if (!TSUtility.isValid(unlockData)) continue;
            
            if (level < unlockData.conditionLevel && (!TSUtility.isValid(targetData) || targetData.conditionLevel <= unlockData.conditionLevel)) {
                targetData = unlockData;
            }
        }
        return targetData;
    }

    /**
     * 获取所有解锁内容的完整数据列表
     * @returns 解锁数据模型数组
     */
    public getAllUnlockContentsData(): UnlockContentsData[] {
        return this._data;
    }
    //#endregion
}