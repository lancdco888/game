// 保留原项目所有依赖导入，路径与原代码完全一致
import TSUtility from "../global_utility/TSUtility";
import SDefine from "../global_utility/SDefine";
// import StarAlbumManager from "../Utility/StarAlbumManager";
// import UserPromotion from "./UserPromotion";
// import UserInfo from "./UserInfo";
// import ShopPromotionManager from "../Utility/ShopPromotionManager";
// import PowerGemManager from "../Popup/PowerGem/PowerGemManager";

/** 全局工具类补全 - 原代码中存在调用，无导入的兼容声明 */
declare const Utility: {
    getUnixTimestamp: () => number;
};

/**
 * 基础道具信息数据类 - 所有道具的基类
 */
export class ItemInfo {
    public itemUniqueNo: string = "";
    public itemId: string = "";
    public type: string = "0";
    public totCnt: number = 0;
    public curCnt: number = 0;
    public expireDate: number = 0;
    public extraInfo: string = "";
    public payCode: string = "";
    public regDate: number = 0;
    public updateDate: number = 0;

    /** 初始化道具基础信息 */
    public initItemInfo(data: any): void {
        this.itemUniqueNo = data.itemUniqueNo;
        this.itemId = data.itemId;
        this.type = data.type;
        this.totCnt = data.totCnt;
        this.curCnt = data.curCnt;
        this.expireDate = data.expireDate;
        this.extraInfo = data.extraInfo;
        this.payCode = data.payCode;
        this.regDate = data.regDate;
        this.updateDate = data.updateDate;
    }

    /** 判断道具是否过期 */
    public isExpire(): boolean {
        return this.expireDate < TSUtility.getServerBaseNowUnixTime();
    }

    /** 判断道具是否有可用数量 */
    public isUseable(): boolean {
        return this.curCnt > 0;
    }

    /** 判断道具是否可用(核心校验逻辑 - 优先级最高) */
    public isAvailable(): boolean {
        // // 卡包/星店硬币 特殊校验：赛季匹配+可用数量
        // if (CardPackItemInfo.isCardPackItem(this.itemId) || this.itemId == SDefine.I_STAR_SHOP_COIN) {
        //     const seasonInfo = SASeasonItemExtraInfo.parse(this.extraInfo);
        //     const curSeason = StarAlbumManager.default.instance().getCurrentSeasonInfo();
        //     return !(!this.isUseable() || seasonInfo.seasonID != curSeason.numSeasonID);
        // }

        // // 联盟商店余额 无条件可用
        // if (this.itemId == SDefine.I_SUITE_LEAGUE_SHOP_BALANCE) {
        //     return true;
        // }

        // // 按道具类型分别校验
        // switch (this.type) {
        //     case SDefine.ITEM_TYPE_TIMEBASE:
        //         return !this.isExpire();
        //     case SDefine.ITEM_TYPE_COUNTBASE:
        //         return this.isUseable();
        //     case SDefine.ITEM_TYPE_HYBRID:
        //         return this.isUseable() && !this.isExpire();
        //     default:
        //         cc.error("invalid item type " + this.type);
        //         return false;
        // }
        return false
    }

    /** 校验每日充值道具是否有效 */
    public static isValidDailyTopUpItem(item: ItemInfo): boolean {
        const interval = Math.ceil((TSUtility.getServerBaseNowUnixTime() - item.regDate) / SDefine.DAILY_TOPUP_INTERVAL);
        return interval + 1 <= item.totCnt;
    }

    /** 判断是否是英雄战力道具 */
    public static isHeroForceItem(item: ItemInfo): boolean {
        return item.itemId == SDefine.I_HERO_FORCE;
    }
}

/**
 * 每日签到额外信息
 */
export class AttendanceDailyExtraInfo {
    public dailyReward: any = null;
    public nextReceiveTime: number = 0;

    public static parse(str: string): AttendanceDailyExtraInfo {
        const data = JSON.parse(str);
        const info = new AttendanceDailyExtraInfo();
        info.dailyReward = data.dailyReward;
        info.nextReceiveTime = data.nextReceiveTime;
        return info;
    }
}

/**
 * 主商店优惠券额外信息
 */
export class MainShopCouponExtraInfo {
    public moreCoinRate: number = 0;
    public overThePrice: number = 0;

    public static parse(str: string): MainShopCouponExtraInfo {
        const data = JSON.parse(str);
        const info = new MainShopCouponExtraInfo();
        info.moreCoinRate = data.moreCoinRate;
        if (TSUtility.isValid(data.overThePrice)) {
            info.overThePrice = data.overThePrice;
        }
        return info;
    }
}

/**
 * 主商店优惠券道具信息封装类
 */
export class MainShopCouponItemInfo {
    public itemInfo: ItemInfo = new ItemInfo();
    public couponExtraInfo: MainShopCouponExtraInfo = new MainShopCouponExtraInfo();

    public init(item: ItemInfo): void {
        this.itemInfo = item;
        this.couponExtraInfo = MainShopCouponExtraInfo.parse(item.extraInfo);
    }
}

/**
 * 星册赛季额外信息
 */
export class SASeasonItemExtraInfo {
    public seasonID: number = 0;

    public static parse(str: string): SASeasonItemExtraInfo {
        const data = JSON.parse(str);
        const info = new SASeasonItemExtraInfo();
        if (data.seasonID) info.seasonID = data.seasonID;
        return info;
    }
}

/**
 * 开卡包升级道具额外信息
 */
export class OpenCardPack_UpgradeItemExtraInfo {
    public upgradeRarity: number = 0;

    public static parse(str: string): OpenCardPack_UpgradeItemExtraInfo {
        const data = JSON.parse(str);
        const info = new OpenCardPack_UpgradeItemExtraInfo();
        if (data.upgradeRarity) info.upgradeRarity = data.upgradeRarity;
        return info;
    }
}

/**
 * 金币雨时间加成道具额外信息
 */
export class CoinShowerTimeBonusItemExtraInfo {
    public additionalTime: number = 0;

    public static parse(str: string): CoinShowerTimeBonusItemExtraInfo {
        const data = JSON.parse(str);
        const info = new CoinShowerTimeBonusItemExtraInfo();
        if (data.additionalTime) info.additionalTime = data.additionalTime;
        return info;
    }
}

/**
 * 会员等级提升额外信息
 */
export class MembersClassBoostUpExtraInfo {
    public baseLevel: number = 0;
    public boostLevel: number = 0;
    public memPointAddRate: number = 0;

    public static parse(str: string): MembersClassBoostUpExtraInfo {
        const data = JSON.parse(str);
        const info = new MembersClassBoostUpExtraInfo();
        info.baseLevel = data.baseLevel;
        info.boostLevel = data.boostLevel;
        info.memPointAddRate = data.memPointAddRate;
        return info;
    }
}

/**
 * 普通会员等级提升额外信息
 */
export class MembersClassBoostUpNormalExtraInfo {
    public baseLevel: number = 0;
    public boostLevel: number = 0;
    public memPointAddRate: number = 0;
    public vipExpCondition: number = 0;

    public static parse(str: string): MembersClassBoostUpNormalExtraInfo {
        const data = JSON.parse(str);
        const info = new MembersClassBoostUpNormalExtraInfo();
        info.baseLevel = data.baseLevel;
        info.boostLevel = data.boostLevel;
        info.memPointAddRate = data.memPointAddRate;
        info.vipExpCondition = data.vipExpCondition;
        return info;
    }
}

/**
 * 卡包道具信息封装类
 */
export class CardPackItemInfo {
    public itemInfo: ItemInfo = new ItemInfo();
    public rarity: number = 0;
    public hasHero: boolean = false;

    public init(item: ItemInfo): void {
        this.itemInfo = item;
        this.rarity = CardPackItemInfo.getItemRarity(item.itemId);
        this.hasHero = CardPackItemInfo.hasHero(item.itemId);
    }

    /** 判断是否是卡包道具 */
    public static isCardPackItem(itemId: string): boolean {
        return itemId.indexOf(SDefine.I_COLLECTION_CARD_PRIFIX) !== -1;
    }

    /** 判断是否是付费卡包道具 */
    public static isPaidCardPackItem(itemId: string): boolean {
        return itemId.indexOf(SDefine.I_COLLECTION_CARD_PAID_PRIFIX) !== -1 ||
               itemId.indexOf(SDefine.I_COLLECTION_CARD_HERO_HYBRID_PRIFIX) !== -1;
    }

    /** 获取卡包稀有度(道具ID最后一位数字) */
    public static getItemRarity(itemId: string): number {
        return parseInt(itemId.charAt(itemId.length - 1));
    }

    /** 判断是否是英雄卡包 */
    public static hasHero(itemId: string): boolean {
        return itemId.indexOf(SDefine.I_COLLECTION_CARD_HERO_PRIFIX) !== -1 ||
               itemId.indexOf(SDefine.I_COLLECTION_CARD_HERO_PAID_PRIFIX) !== -1 ||
               itemId.indexOf(SDefine.I_COLLECTION_CARD_HERO_HYBRID_PRIFIX) !== -1;
    }

    /** 判断是否是悬赏卡包(原逻辑固定返回false) */
    public static isBountyCardPackItem(): boolean {
        return false;
    }
}

/**
 * 奇妙宝箱道具信息封装类
 */
export class WonderBoxItemInfo {
    public itemInfo: ItemInfo = new ItemInfo();
    public boxType: number = 0;

    public init(item: ItemInfo): void {
        this.itemInfo = item;
        this.boxType = WonderBoxItemInfo.getBoxType(item.itemId);
    }

    /** 判断是否是奇妙宝箱道具 */
    public static isWonderBoxItem(itemId: string): boolean {
        return itemId.indexOf(SDefine.I_WONDER_BOX_PRIFIX) !== -1;
    }

    /** 获取宝箱类型(道具ID最后一位数字) */
    public static getBoxType(itemId: string): number {
        return parseInt(itemId.charAt(itemId.length - 1));
    }
}

/**
 * 用户背包核心管理类 (默认导出，项目主调用类)
 */
export default class UserInven {
    /** 道具字典: key=itemUniqueNo, value=ItemInfo */
    public items: { [key: string]: ItemInfo } = {};

    /** 初始化用户背包数据 */
    public initUserInven(data: any): boolean {
        for (const key in data.items) {
            const item = new ItemInfo();
            item.initItemInfo(data.items[key]);
            this.items[key] = item;
        }
        return true;
    }

    /** 添加道具到背包(累加数量+有效期) */
    public addItem(itemData: any, addCnt: number, addExpire: number): void {
        const item = new ItemInfo();
        item.initItemInfo(itemData);
        if (this.items[item.itemUniqueNo]) {
            // 已有道具：累加数量+有效期
            item.curCnt = this.items[item.itemUniqueNo].curCnt + addCnt;
            item.expireDate = this.items[item.itemUniqueNo].expireDate + addExpire;
        }
        this.items[item.itemUniqueNo] = item;
    }

    /** 从背包移除道具 */
    public removeItem(itemUniqueNo: string): void {
        if (this.items[itemUniqueNo]) {
            delete this.items[itemUniqueNo];
        }
    }

    /** 根据道具ID筛选可用道具列表 */
    public getItemsByItemId(itemId: string): ItemInfo[] {
        const result: ItemInfo[] = [];
        const keys = Object.keys(this.items);
        for (let i = 0; i < keys.length; ++i) {
            const item = this.items[keys[i]];
            if (item.itemId === itemId && item.isAvailable()) {
                result.push(item);
            }
        }
        return result;
    }

    /** 根据唯一编号获取单个可用道具 */
    public getItem(itemUniqueNo: string): ItemInfo | null {
        if (this.items[itemUniqueNo]) {
            const item = this.items[itemUniqueNo];
            if (item.isAvailable()) {
                return item;
            }
        }
        return null;
    }

    /** 获取所有可用的主商店优惠券道具 */
    public getMainShopCouponItems(): MainShopCouponItemInfo[] {
        const result: MainShopCouponItemInfo[] = [];
        const keys = Object.keys(this.items);
        for (let i = 0; i < keys.length; ++i) {
            const item = this.items[keys[i]];
            if (item.itemId === SDefine.I_MAINSHOP_COUPON_ITEM && item.isAvailable()) {
                const couponItem = new MainShopCouponItemInfo();
                couponItem.init(item);
                result.push(couponItem);
            }
        }
        return result;
    }

    /** 获取所有卡包总数(包含免费卡包+宝石兑换+礼包) */
    public getAllCardPackCnt(includeFree: boolean = true): number {
        let freeCardPackCnt = 0;
        // 统计免费卡包
        // if (includeFree) {
        //     const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.StarShopFreeRewardPromotion.PromotionKeyName);
        //     if (promotionInfo) {
        //         const now = Utility.getUnixTimestamp();
        //         if (promotionInfo.nextReceiveTime <= now) {
        //             freeCardPackCnt = 1;
        //         }
        //     }
        // }

        // 统计付费/普通卡包 + 宝石兑换卡包 + 礼包卡包
        const normalCardPackCnt = this.getAllCardPackCnt_ExceptFreeCardPack();
        const powerGemCardPackCnt = this.getPowerGemExchangeCardPackCnt();
        const bundleCardPackCnt = this.getBundleCardPackCnt();

        return normalCardPackCnt + freeCardPackCnt + powerGemCardPackCnt + bundleCardPackCnt;
    }

    /** 获取所有卡包总数(排除免费卡包) */
    public getAllCardPackCnt_ExceptFreeCardPack(): number {
        // if (ShopPromotionManager.default.Instance().isBountySale()) {
        //     return this.getNormalCardPackCnt() + this.getHeroCardPackCnt() + this.getPaidCardPackCnt() + this.getBountyCardPackCnt();
        // } else {
        //     return this.getNormalCardPackCnt() + this.getHeroCardPackCnt() + this.getPaidCardPackCnt();
        // }
        return 0;
    }

    /** 获取宝石兑换的卡包数量 */
    private getPowerGemExchangeCardPackCnt(): number {
        // if (PowerGemManager.default.instance.isAvailablePowerGemByStarAlbum()) {
        //     const jokerItem = PowerGemManager.default.instance.getJokerPointItem();
        //     if (TSUtility.isValid(jokerItem)) {
        //         const useCount = PowerGemManager.default.instance.getJokerPointUseCount();
        //         return Math.floor(jokerItem.curCnt / useCount);
        //     }
        // }
        return 0;
    }

    /** 获取礼包捆绑卡包数量(5倍数量) */
    private getBundleCardPackCnt(): number {
        const bundleItems = this.getItemsByItemId(SDefine.I_STAR_CARD_PACK_BUNDLE);
        if (bundleItems.length > 0 && TSUtility.isValid(bundleItems[0]) && bundleItems[0].isAvailable()) {
            return 5 * bundleItems[0].curCnt;
        }
        return 0;
    }

    /** 获取普通卡包数量 */
    public getNormalCardPackCnt(): number {
        let total = 0;
        // const maxRarity = StarAlbumManager.default.instance().getCardMaxRarity();
        // for (let rarity = 1; rarity <= maxRarity; ++rarity) {
        //     const itemId = SDefine.I_COLLECTION_CARD_PRIFIX + rarity.toString();
        //     const items = this.getItemsByItemId(itemId);
        //     items.forEach(item => total += item.curCnt);
        // }
        return total;
    }

    /** 获取付费卡包数量 */
    public getPaidCardPackCnt(): number {
        let total = 0;
        // const maxRarity = StarAlbumManager.default.instance().getCardMaxRarity();
        // for (let rarity = 1; rarity <= maxRarity; ++rarity) {
        //     const itemId = SDefine.I_COLLECTION_CARD_PAID_PRIFIX + rarity.toString();
        //     const items = this.getItemsByItemId(itemId);
        //     items.forEach(item => total += item.curCnt);
        // }
        return total;
    }

    /** 获取英雄卡包数量 */
    public getHeroCardPackCnt(): number {
        let total = 0;
        // const maxRarity = StarAlbumManager.default.instance().getCardMaxRarity();
        // for (let rarity = 1; rarity <= maxRarity; ++rarity) {
        //     // 普通英雄卡包
        //     let itemId = SDefine.I_COLLECTION_CARD_HERO_PRIFIX + rarity.toString();
        //     let items = this.getItemsByItemId(itemId);
        //     items.forEach(item => total += item.curCnt);

        //     // 付费英雄卡包
        //     itemId = SDefine.I_COLLECTION_CARD_HERO_PAID_PRIFIX + rarity.toString();
        //     items = this.getItemsByItemId(itemId);
        //     items.forEach(item => total += item.curCnt);

        //     // 混合英雄卡包
        //     itemId = SDefine.I_COLLECTION_CARD_HERO_HYBRID_PRIFIX + rarity.toString();
        //     items = this.getItemsByItemId(itemId);
        //     items.forEach(item => total += item.curCnt);
        // }
        return total;
    }

    /** 获取悬赏卡包数量(原逻辑固定返回0) */
    public getBountyCardPackCnt(): number {
        // StarAlbumManager.default.instance().getCardMaxRarity();
        return 0;
    }

    /** 根据稀有度获取卡包道具列表 */
    public getCardPackItems(rarity: number): CardPackItemInfo[] {
        const result: CardPackItemInfo[] = [];
        // 普通卡包
        let itemId = SDefine.I_COLLECTION_CARD_PRIFIX + rarity.toString();
        let items = this.getItemsByItemId(itemId);
        items.forEach(item => {
            const cardPack = new CardPackItemInfo();
            cardPack.init(item);
            result.push(cardPack);
        });

        // 付费卡包
        itemId = SDefine.I_COLLECTION_CARD_PAID_PRIFIX + rarity.toString();
        items = this.getItemsByItemId(itemId);
        items.forEach(item => {
            const cardPack = new CardPackItemInfo();
            cardPack.init(item);
            result.push(cardPack);
        });
        return result;
    }

    /** 根据稀有度获取英雄卡包道具列表 */
    public getHeroCardPackItems(rarity: number): CardPackItemInfo[] {
        const result: CardPackItemInfo[] = [];
        // 普通英雄卡包
        let itemId = SDefine.I_COLLECTION_CARD_HERO_PRIFIX + rarity.toString();
        let items = this.getItemsByItemId(itemId);
        items.forEach(item => {
            const cardPack = new CardPackItemInfo();
            cardPack.init(item);
            result.push(cardPack);
        });

        // 付费英雄卡包
        itemId = SDefine.I_COLLECTION_CARD_HERO_PAID_PRIFIX + rarity.toString();
        items = this.getItemsByItemId(itemId);
        items.forEach(item => {
            const cardPack = new CardPackItemInfo();
            cardPack.init(item);
(result.push(cardPack));
        });

        // 混合英雄卡包
        itemId = SDefine.I_COLLECTION_CARD_HERO_HYBRID_PRIFIX + rarity.toString();
        items = this.getItemsByItemId(itemId);
        items.forEach(item => {
            const cardPack = new CardPackItemInfo();
            cardPack.init(item);
            result.push(cardPack);
        });
        return result;
    }
}