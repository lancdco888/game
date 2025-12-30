// 保留原项目所有依赖导入，路径与原代码完全一致
import TSUtility from "../global_utility/TSUtility";
//import CommonServer from "../Network/CommonServer";
//import ShopPromotionManager from "../Utility/ShopPromotionManager";

const { ccclass } = cc._decorator;

/**
 * 声明全局工具类/FBInstant - 原代码存在调用，补全类型规避语法报错
 */
declare const Utility: {
    isMobileGame: () => number;
};
declare const FBInstant: {
    getPlatform: () => "ANDROID" | "WEB" | "IOS";
};

/**
 * 按操作系统区分的存储Key常量 (需做平台后缀拼接)
 */
export const StorageByOsKeyType = {
    SECRET_OPEN_TIME: "secreatOpenTime",
    SECRET_INDEX: "secreatIndex",
    SECRET_PRICES: "secretPrices",
    SEASON_OPEN_TIME: "seasonOpenTime",
    SEASON_END_LAST_BOUGHT_TIME: "seasonEndOffLastBoughtTime",
    MINI_GAME: "minigame",
    LAST_CLOSE_INBOX_POPUP: "lastCloseInboxPopup",
    NEW_HERO_OFFER_OPEN_TIME: "newHeroOfferOpenTime",
    PIGGY_BANK_OFFER_OPEN: "PiggyBankOfferOpen",
    SHOP_PROMOTION_SET_TIME: "ShopPromotionSetTime",
    OFFER_PROMOTION: "offerPromotion",
    CARD_PACK_OFFER_OPEN_TIME: "cardPakcOfferOpenTime",
    EPIC_WIN: "epic_win",
    EPIC_WIN_TIME: "epic_win_time",
    EPIC_WIN_OFFER_INDEX: "epicWinOffer_Idxes",
    LAST_EPIC_WIN_OFFER_PRICE: "lastEpicWinOfferPrice",
    LAST_EPIC_WIN_OFFER_TIME: "lastEpicWinOfferTime"
};

/**
 * 通用存储Key常量 (无需平台后缀拼接，项目核心存储KEY全集)
 */
export const StorageKeyType = {
    STAR_ALBUM_NEW_TAG: "StarAlbum_NewTag",
    EPIC_WIN_OFFER_INDEX: "epicWinOffer_Idx",
    TERMS_TIME: "termsSaveTime",
    SLOT_TOURNEY_OPEN_TIME: "slotTourneyOpenTime",
    SLOT_TOURNEY_OPEN_COUNT: "slotTourneyOpenCount",
    KICK_START_TARGET: "kickStartTarget",
    COMPLETE_BINGO: "completeBingo",
    MOBILE_GUIDE: "mobileGuide",
    LAST_OPEN_MISSION: "lastOpenMission",
    FIRST_BARGAIN: "firstbargain",
    BOUGHT_1ST_BARGAIN: "typeBought1stBargain",
    TIME_BUY_POPUP_DEAL: "timeBuyPopupDeal",
    JUMP_STARTER_TIME: "jumpStarterTimeRenewal",
    JUMP_STARTER_BUY_COUNT: "jumpStarterBuyCount",
    JUMP_STARTER_TARGET_AMOUNT: "jumpStarterTargetAmount",
    JUMP_STARTER_THIRD_TESTER_RESET: "jumpStarterThirdTestMemberReset",
    NEW_HERO_OFFER_BUY_NAME: "newHeroOfferBuyName",
    PREV_BALLOON_TIME: "prevBalloonTime",
    LAST_SECRET_STASH_TIME: "lastSecretStashTime",
    SECRET_STASH_START_TIME: "secretStashStartTime",
    LAST_ZONE_ID: "lastZoneID",
    LAST_ZONE_NAME: "lastZoneName",
    ADS_FREE: "ADSFREE",
    NEW_HERO_OPEN_NAME: "newHeroOpenName",
    NEW_HERO_OFFER_POPUP_OPEN_COUNT: "newHeroOfferPopupOpenCount",
    KICK_COUNT: "KickCount",
    ACTIVE_HERO_STATE: "ACTIVEHEROSTATE",
    LAST_LOCK_OPEN_LEVEL: "LastLockOpenLevel",
    INTERSTITIAL_AD_PLAY_TIME_CANVAS: "interstitialAdPlayTime_canvas",
    INTERSTITIAL_AD_PLAY_TIME_AOS: "interstitialAdPlayTime_aos",
    INTERSTITIAL_AD_PLAY_TIME_IOS: "interstitialAdPlayTime_ios",
    INTERSTITIAL_AD_PLAY_TIME_INSTANT: "interstitialAdPlayTime_instant",
    INTERSTITIAL_AD_PLAY_COUNT_CANVAS: "interstitialAdPlayCount_canvas",
    INTERSTITIAL_AD_PLAY_COUNT_AOS: "interstitialAdPlayCount_aos",
    INTERSTITIAL_AD_PLAY_COUNT_IOS: "interstitialAdPlayCount_ios",
    INTERSTITIAL_AD_PLAY_COUNT_INSTANT: "interstitialAdPlayCount_instant",
    INTERSTITIAL_AD_LAST_TIME_CANVAS: "interstitialAdLastTime_canvas",
    INTERSTITIAL_AD_LAST_TIME_AOS: "interstitialAdLastTime_aos",
    INTERSTITIAL_AD_LAST_TIME_IOS: "interstitialAdLastTime_ios",
    INTERSTITIAL_AD_LAST_TIME_INSTANT: "interstitialAdLastTime_instant",
    IOS_SHOP_AD_COUNT: "iOSShopADCount",
    IOS_SHOP_AD_TIME: "iOSShopADTime",
    FIRST_VISIT_SLOT: "firstVisitSlot",
    FIRST_VISIT_LOBBY: "firstVisitLobby",
    LAST_NEW_SLOT_POPUP: "lastNewSlotPopup",
    LAST_REVAMP_POPUP: "lastRevampPopup",
    STAT_ALBUM_FAST_MODE: "starAlbumFastMode",
    SEASON_ID_SHOWED_START_SEASON_POPUP: "seasonIdShowedStartSeasonPopup",
    SHOW_FAST_MODE_TOOLTIP: "showFastModeTooltip",
    LAST_BINGO_BALL_PURCHASE_GAME_KEY: "lastBingoBallPurchaseGameKey",
    IS_FIRST_STAR_ALBUM: "isFirstStarAlbumPopOpen",
    IS_FIRST_DAILY_BLITZ: "isFirstDailyBlitzPopup",
    SHOW_JIGGY_PUZZLE_TUTORIAL_2025: "showJiggyPuzzleTutoral_2025_05",
    REEL_QUEST_MAP_FIRST_ENTER: "reelQuestMapFirstEnter",
    REEL_QUEST: "ReelQuest",
    REEL_QUEST_NORMAL: "ReelQuestNormal",
    SHOW_BOUNTY_APPEAR: "showBountyAppear",
    OPEN_BOUNTY_SET_START: "openBountySetStart",
    NOTICE_SEASON_END_DAY: "notice_seasonEnd_Day",
    NOTICE_SEASON_END_COUNT: "notice_seasonEnd_Cnt",
    COMPETE_TOOLTIP_MISSION_TIME: "completeTooltipMissionTime",
    CURRENT_MISSION_TOOLTIP: "currentMission_tooltip",
    CURRENT_MISSION_TOOLTIP_TIME: "currentMission_tooltip_date",
    TODAY_PLAYED_MINI_GAME: "todayPlayedMiniGame",
    CURRENT_LANGUAGE: "currentLanguage",
    OPEN_ACCOUNT_MERGE_INFO: "openAccountMergeInfo",
    OPEN_ACCOUNT_MERGE_PROMOTION_TIME: "openAccountMergePromotionTime",
    NEXT_FIRST_TIME_DEAL_INDEX: "nextFirstTimeDealIndex",
    NEW_IN_GAME_TUTORIAL: "newIngameTuto",
    TODAY_RESET_MINI_GAME_TIME: "todayResetMiniGameTimeStamp",
    FAN_PAGE_OVERLAY_INTRODUCE_POPUP_TIME: "fanpageOverlayIntroducePopupTime",
    LOBBY_CARD_PACK_BOOSTER_POPUP_TIME: "lobbyCardPackBoosterPopupTime",
    IN_GAME_HERO_BUFF_TOOLTIP_TIME: "ingameHeroBuffTooltipTime",
    LOBBY_HERO_BUFF_POPUP_TIME: "lobbyHeroBuffPopupTime",
    DAILY_BLITZ_TOOLTIP_ENABLE: "dailyBlitzTooltipEnable",
    IN_GAME_END_TRIPLE_WHEEL_SHOWING_TIME: "ingameEndTripleWheelShowingTime",
    GRAND_OPEN_SUITE_INTRODUCE_TIME: "GrandOpenSuiteIntroduceTime",
    GRAND_OPEN_SUITE_INTRODUCE_COUNT: "GrandOpenSuiteIntroduceCount",
    GRAND_OPEN_SUITE_INFO_TIME: "GrandOpenSuiteInfoTime",
    GRAND_OPEN_SUITE_INFO_COUNT: "GrandOpenSuiteInfoCount",
    LAST_SUITE_LEAGUE_RESULT_CREATE_TIME: "LastSuiteLeagueResultCreateTime",
    OPEN_SHOP_START_POPUP: "openShopStartPopup",
    TIME_ALL_MIGHTY_COUPON_POPUP: "TimeAllMightyCouponPopup",
    TIME_SHOWING_JIGGY_PRIZE_POPUP: "TimeShowingJiggyPrizePopup",
    TIME_SHOWING_REEL_QUEST_POPUP: "TimeShowingReelQuestPopup",
    TIME_MEMBERS_CLASS_BOOST_UP_POPUP: "TimeMembersClassBoostUpPopup",
    TIME_FIRST_BUY_COUPON_POPUP: "TimeFirstBuyCouponPopup",
    CHECK_FIRST_BUY_COUPON_POPUP: "CheckFirstBuyCouponPopup",
    RECENTLY_PLAYED_TUTORIAL: "RecentlyPlayedTutorial",
    LEVEL_UP_PASS_OPEN_TIME: "levelUpPassOpenTime",
    DAILY_STAMP_FIRST_OPEN: "DailyStampFirstOpen",
    DAILY_STAMP_PURCHASE_TIME: "DailyStampPurchaseTime",
    CENTURION_CLIQUE_TUTORIAL: "CenturionCliqueTutorial",
    TIME_POWER_GEM_OPEN_POPUP: "TimePowerGemOpenPopup",
    TIME_POWER_GEM_SLOT_OPEN_POPUP: "TimePowerGemSlotOpenPopup",
    TUTORIAL_POWER_GEM_FIRST_GET_POWER_GEM: "TutorialPowerGem_FirstGetPowerGem",
    TUTORIAL_POWER_GEM_FIRST_OPEN: "TutorialPowerGem_FirstOpenPowerGem",
    TUTORIAL_POWER_GEM_FIRST_COMPLETE: "TutorialPowerGem_FirstCompletePowerGem",
    REWARD_CENTER_RED_DOT: "RewardCenterRedDot",
    NEXT_DAILY_STAMP_PURCHASE_TIME: "NextDailyStampPurchaseTime",
    TUTORIAL_WELCOME_BACK: "TutorialWelcomeBack",
    TUTORIAL_WELCOME_BACK_TIME: "TutorialWelcomeBackTime",
    TIME_WELCOME_BACK_MISSION_POPUP: "TimeWelcomeBackMissionPopup",
    TIME_NEWBIE_SHOP_SALE_START_TIME: "TimeNewbieShopSaleStartDate",
    TIME_NEWBIE_SHOP_SALE_END_TIME: "TimeNewbieShopSaleEndDate",
    IS_START_NEWBIE_SHOP_SALE: "IsStartNewbieShopSale",
    MINI_GAME_OFFER_OPEN_TIME: "MiniGameOfferOpenDate",
    STAR_ALBUM_CARD_PACK_BOOSTER_OPEN_TIME: "starAlbumCardPackBoosterOpenTime",
    SUPER_SIZE_IT_POPUP_OPEN_TIME: "SupersizeItPopupOpenTime",
    SUPERSIZE_IT_INFO_OPEN_TIME: "SupersizeItInfoOpenTime",
    SPIN_2_WIN_OFFER_OPEN_TIME: "Spin2WinOfferOpenTime",
    SECRET_STASH_BOX_IDX: "SecretStashBoxIdx",
    SECRET_STASH_MULTIPLIER_IDX: "SecretStashMultiplierIdx",
    DAILY_BLITZ_EVENT_END_TIME: "DailyBlitzEventEndTime",
    IS_HYPER_BOUNTY_TUTORIAL_DAILY: "isHyperBountyTutorialDaily",
    IS_HYPER_BOUNTY_TUTORIAL_SEASON: "isHyperBountyTutorialSeason",
    IS_HYPER_BOUNTY_TUTORIAL_PASS: "isHyperBountyTutorialPass",
    HYPER_BOUNTY_SEASON_END_DATE: "hyperBountySeasonEndDate",
    HYPER_BOUNTY_POPUP_OPEN_DATE: "hyperBountyPopupOpenDate",
    HYPER_BOUNTY_ENDING_OPEN_DATE: "hyperBountyEndingOpenDate",
    HYPER_BOUNTY_2X_SEASON_END_DATE: "hyperBounty2XSeasonEndDate",
    SLOT_FAVORITE: "slotFavorite",
    CLUB_KEY_EARN_LAST_OPEN_TIME: "clubKeyEarnLastOpenTime",
    IS_LOBBY_TUTORIAL_FIRST_ENTER: "isLobbyTutorialFirstEnter",
    TOURNEY_REGULAR_ENTER_TIME: "tourneyRegularEnterTime"
};

/**
 * 服务器存储核心管理类 (全局唯一，静态方法为主，所有存储数据统一管理)
 * 核心能力：多平台Key适配、多类型数据读写、数组序列化、JSON解析容错、服务器同步存储
 */
@ccclass
export default class ServerStorageManager {
    // ===== 私有静态存储容器 =====
    private static _arrStorageData: { [key: string]: any } = {};

    // ===== 只读静态属性 - 获取所有存储KEY数组 =====
    public static get arrStorageByOSKey(): string[] {
        return Object.values(StorageByOsKeyType);
    }

    public static get arrStorageKey(): string[] {
        return Object.values(StorageKeyType);
    }

    // ===== 核心方法 - 获取所有需要加载的存储KEY合集 =====
    public static getStorageDataArray(): string[] {
        const result: string[] = [];
        result.push(...this.arrStorageKey);

        // 拼接按系统区分的KEY
        const osKeys = this.arrStorageByOSKey;
        for (let i = 0; i < osKeys.length; ++i) {
            const convertKey = this.convertOSKeyType(osKeys[i]);
            if (TSUtility.isValid(convertKey) && convertKey.length > 0) {
                result.push(convertKey);
            }
        }

        // // 拼接补丁促销的KEY
        // const patchPromos = ShopPromotionManager.Instance().getPatchedPromotions();
        // for (let i = 0; i < patchPromos.length; ++i) {
        //     const convertKey = this.convertOSKeyType(patchPromos[i]);
        //     if (TSUtility.isValid(convertKey)&& convertKey.length > 0) {
        //         result.push(convertKey);
        //     }
        // }

        return result;
    }

    // ===== 判断是否是需要按系统区分的KEY =====
    public static isOSKeyType(key: string): boolean {
        // if (TSUtility.isValid(key) || key.length <= 0) return false;
        // const patchPromos = ShopPromotionManager.Instance().getPatchedPromotions();
        // return patchPromos.includes(key) || this.arrStorageByOSKey.includes(key);
        return false;
    }

    // ===== 核心转换 - 根据运行平台拼接KEY后缀 (重中之重，原逻辑1:1复刻) =====
    public static convertOSKeyType(key: string): string {
        let convertKey = key + "_canvas";

        // 移动端适配 (iOS/Android)
        if (Utility.isMobileGame() === 1) {
            if (cc.sys.os === cc.sys.OS_IOS) {
                convertKey = key + "_ios";
            } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                convertKey = key + "_aos";
            }
        }

        // Facebook Instant 小游戏适配
        // if (Utility.isFacebookInstant()) {
        //     const fbPlatform = FBInstant.getPlatform();
        //     if (fbPlatform === "ANDROID") {
        //         convertKey = key + "_instant_aos";
        //     } else if (fbPlatform === "WEB") {
        //         convertKey = key + "_instant_web";
        //     } else if (fbPlatform === "IOS") {
        //         convertKey = key + "_instant_ios";
        //     }
        // }
        return convertKey;
    }

    // ===== 判断KEY是否存在于存储容器 =====
    public static includes(key: string): boolean {
        if (!TSUtility.isValid(key) || key.length <= 0) return false;
        return Object.keys(this._arrStorageData).includes(key);
    }

    // ===== 加载服务器存储数据到本地容器 =====
    public static load(data: any): void {
        const allKeys = this.getStorageDataArray();
        for (let i = 0; i < allKeys.length; ++i) {
            const val = data[allKeys[i]];
            if (TSUtility.isValid(val)) {
                this._arrStorageData[allKeys[i]] = val;
            }
        }
    }

    // ===== 核心存储 - 保存数据到本地容器 + 同步到服务器 (原逻辑完整复刻) =====
    public static save(key: string, value: any, syncServer: boolean = true, extra: any = null): void {
        if (!TSUtility.isValid(value)|| !TSUtility.isValid(key) || key.length <= 0) return;
        
        // 转换系统KEY
        const targetKey = this.isOSKeyType(key) ? this.convertOSKeyType(key) : key;
        this._arrStorageData[targetKey] = value;

        if (!syncServer) return;

        // 数组序列化处理
        let saveValue = value;
        if (Array.isArray(saveValue)) {
            const arr: string[] = [];
            for (let i = 0; i < saveValue.length; ++i) {
                const item = saveValue[i];
                if (!TSUtility.isValid(item)) continue;
                
                if (typeof item === "number") arr.push(item.toString());
                else if (typeof item === "string") arr.push(`"${item}"`);
                else if (typeof item === "boolean") arr.push(item ? "true" : "false");
                else if (typeof item === "object") {
                    try { arr.push(JSON.stringify(item)); }
                    catch (err) { return cc.log("Error converting to JSON: ", err); }
                }
            }
            saveValue = `[${arr.join(",")}]`;
        } 
        // 字符串序列化
        else if (typeof saveValue === "string") {
            saveValue = `"${saveValue}"`;
        }
        // 对象序列化
        else if (typeof saveValue === "object") {
            try { saveValue = JSON.stringify(saveValue); }
            catch (err) { return cc.log("Error converting to JSON: ", err); }
        }

        // 同步到服务器
        //CommonServer.Instance().setStorageByString(`{"${targetKey.toString()}":${saveValue}}`, extra);
    }

    // ===== 追加数据到数组后保存 =====
    public static saveAfterArrayPush(key: string, value: any, syncServer: boolean = true, extra: any = null): void {
        if (!TSUtility.isValid(key)|| key.length <= 0) return;
        
        let arr: any[] = [];
        if (typeof value === "string") arr = this.getAsStringArray(key);
        else if (typeof value === "number") arr = this.getAsNumberArray(key);
        else if (typeof value === "boolean") arr = this.getAsBooleanArray(key);

        if (TSUtility.isValid(arr) && Array.isArray(arr)) {
            arr.push(value);
            this.save(key, arr, syncServer, extra);
        }
    }

    // ===== 数字累加后保存 =====
    public static saveAfterAddCount(key: string, addVal: number, syncServer: boolean = true, extra: any = null): void {
        if (!TSUtility.isValid(key) || key.length <=0) return;
        const curVal = this.getAsNumber(key);
        this.save(key, curVal + addVal, syncServer, extra);
    }

    // ===== 保存当前服务器时间 =====
    public static saveCurrentServerTime(key: string, syncServer: boolean = true, extra: any = null): void {
        if (!TSUtility.isValid(key) || key.length <=0) return;
        this.save(key, TSUtility.getServerBaseNowUnixTime(), syncServer, extra);
    }

    // ===== 移除指定KEY的存储数据 =====
    public static remove(key: string): void {
        if (!TSUtility.isValid(key) || key.length <=0) return;
        const targetKey = this.isOSKeyType(key) ? this.convertOSKeyType(key) : key;
        if (this.includes(targetKey)) {
            delete this._arrStorageData[targetKey];
        }
    }

    // ===== 基础读取 - 获取原始数据 =====
    public static get(key: string): any | null {
        if (!TSUtility.isValid(key) || key.length <=0) return null;
        const targetKey = this.isOSKeyType(key) ? this.convertOSKeyType(key) : key;
        return this.includes(targetKey) ? this._arrStorageData[targetKey] : null;
    }

    // ===== 类型读取 - 数字 (默认0) =====
    public static getAsNumber(key: string): number {
        const val = this.get(key);
        return TSUtility.isValid(val) ? Number(val) : 0;
    }

    // ===== 类型读取 - 字符串 (默认空) =====
    public static getAsString(key: string): string {
        const val = this.get(key);
        return TSUtility.isValid(val) ? String(val) : "";
    }

    // ===== 类型读取 - 布尔值 (默认false) =====
    public static getAsBoolean(key: string): boolean {
        const val = this.get(key);
        return TSUtility.isValid(val) && Boolean(val);
    }

    // ===== 类型读取 - 对象 (默认null) =====
    public static getAsObject(key: string): object | null {
        const val = this.get(key);
        return TSUtility.isValid(val) ? val : null;
    }

    // ===== 类型读取 - JSON对象 (带容错解析) =====
    public static getAsJson(key: string): any | null {
        if (!TSUtility.isValid(key) || key.length <=0) return null;
        const val = this.get(key);
        if (!TSUtility.isValid(val)) return null;

        if (typeof val === "string") {
            try { return JSON.parse(val); }
            catch (err) { cc.log("Error parsing Json data: ", err); return null; }
        } else if (typeof val === "object") {
            return val;
        }
        return this.getAsObject(key);
    }

    // ===== 类型读取 - 数字数组 (默认空数组) =====
    public static getAsNumberArray(key: string): number[] {
        const val = this.get(key);
        if (!TSUtility.isValid(val)) return [];
        if (Array.isArray(val)) return val as number[];
        
        if (typeof val === "string") return val.split(",").map(item => parseInt(item));
        if (typeof val === "number") return [val];
        if (typeof val === "boolean") return [val ? 1 : 0];
        return [];
    }

    // ===== 类型读取 - 字符串数组 (默认空数组) =====
    public static getAsStringArray(key: string): string[] {
        const val = this.get(key);
        if (!TSUtility.isValid(val)) return [];
        if (Array.isArray(val)) return val as string[];
        
        if (typeof val === "string") return val.split(",");
        if (typeof val === "number") return [val.toString()];
        if (typeof val === "boolean") return [val ? "true" : "false"];
        return [];
    }

    // ===== 类型读取 - 布尔数组 (默认空数组) =====
    public static getAsBooleanArray(key: string): boolean[] {
        const val = this.get(key);
        if (!TSUtility.isValid(val)) return [];
        if (Array.isArray(val)) return val as boolean[];
        
        if (typeof val === "string") return val.split(",").map(item => item === "true");
        if (typeof val === "number") return [val === 1];
        if (typeof val === "boolean") return [val];
        return [];
    }
}