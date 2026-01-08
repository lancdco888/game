const { ccclass } = cc._decorator;

// ===================== 外部依赖类型声明（实际项目中替换为真实import） =====================
/** UserInfo模块类型声明 */
declare const UserInfo: {
    instance(): {
        getUserHeroInfo(): {
            getHeroInfo(heroId: number): {
                rank: number;
                force: number;
            } | null;
        };
    };
};

/** HeroManager模块类型声明 */
declare const HeroManager: {
    Instance(): {
        getHeroConfig(heroId: number): {
            getHeroLevel(force: number): number;
        };
    };
};

/** TSUtility模块类型声明 */
declare const TSUtility: {
    isValid(value: any): boolean;
};

// 实际项目中请替换为真实导入路径
// import UserInfo from '../../User/UserInfo';
// import HeroManager from '../../Utility/HeroManager';
// import TSUtility from '../../../global_utility/TSUtility';

// ===================== 奖励相关枚举定义（TS字符串枚举，保留原字符串值） =====================
/** 奖励动作类型 */
export enum CommonRewardActionType {
    NONE = "NONE",
    MULTI_REWARD = "MULTI_REWARD",
    BINGO = "BINGO",
    CARD_PACK = "CARD_PACK",
    CARD_PACK_BUNDLE = "CARD_PACK_BUNDLE",
    HERO_CARD_PACK = "HERO_CARD_PACK",
    COIN = "COIN",
    COUPON = "COUPON",
    EMOJI = "EMOJI",
    FLIP_A_COIN = "FLIP_A_COIN",
    HERO = "HERO",
    HERO_CARD = "HERO_CARD",
    JOKER = "JOKER",
    JOKER_POINT = "JOKER_POINT",
    LEVEL_BOOSTER = "LEVEL_BOOSTER",
    LOUNGE_PASS = "LOUNGE_PASS",
    PIGGY_BANK = "PIGGY_BANK",
    RANDOM_JOKER = "RANDOM_JOKER",
    STAR_LIGHT_POINT = "STAR_LIGHT_POINT",
    SUITE_PASS = "SUITE_PASS",
    WONDER_BOX = "WONDER_BOX",
    DRAGON = "DRAGON",
    LUCKY_STRIKE_WHEEL = "LUCKY_STRIKE_WHEEL",
    POWER_GEM = "POWER_GEM",
    PIGGIES_IN_LADDERS = "PIGGIES_IN_LADDERS",
    HYPER_BOUNTY_PASS_POINT = "HYPER_BOUNTY_PASS_POINT",
    HYPER_BOUNTY_PASS_BOX = "HYPER_BOUNTY_PASS_BOX",
    GIFT_BOX = "GIFT_BOX",
    GIFT_BOX_RANDOM_CARD_PACK = "GIFT_BOX_RANDOM_CARD_PACK",
    BINGO_BALL = "BINGO_BALL",
    MYSTERY_BOX = "MISTERY_BOX"
}

/** 奖励标题类型 */
export enum CommonRewardTitleType {
    NONE = "NONE",
    WONDERFUL = "WONDERFUL",
    GREAT = "GREAT",
    YOU_WON = "YOU_WON",
    SUPERB = "SUPERB",
    YOU_VE_RECEIVED = "YOU_VE_RECEIVED",
    SCORE_GOT_ONE = "SCORE_GOT_ONE",
    SPLENDID = "SPLENDID",
    GALATIC = "GALATIC",
    POWER_GEM = "POWER_GEM"
}

/** 奖励子标题类型 */
export enum CommonRewardSubTitleType {
    NONE = "NONE",
    COLLECT_YOUR_BONUS_PREMIUM_MULTIPLE = "COLLECT YOUR %sX BONUS PREMIUM",
    COLLECT_YOUR_BONUS_PREMIUM_EXCEPT_TODAY = "TODAY'S CHECK-IN BONUS HAS BEEN EXCLUDED",
    COLLECT_YOUR_BONUS_PREMIUM = "COLLECT YOUR BONUS PREMIUM",
    CHECK_IN_BONUS = "CHECK-IN BONUS",
    DAY_BONUS = "DAY %s BONUS",
    YOU_WON = "YOU WON",
    PRICE_VALUE = "$%s VALUE",
    UP_TO_VALUE = "UP TO %s",
    CENTURION_SHOP_BONUS = "%sX BONUS MULTIPLIER APPLIED",
    EXTENDED_REWARDS = "EXTENDED REWARDS"
}

/** 奖励按钮类型 */
export enum CommonRewardButtonType {
    NONE = "NONE",
    ONCE = "ONCE",
    LOOP = "LOOP"
}

/** 奖励宝箱类型 */
export enum CommonRewardBoxType {
    NONE = "NONE",
    RED = "RED",
    PINK = "PINK",
    GOLD = "GOLD",
    GREEN = "GREEN",
    BLUE = "BLUE",
    PURPLE = "PURPLE"
}

/** WonderBox奖励类型 */
export enum CommonRewardWonderBoxRewardType {
    NONE = "NONE",
    COIN = "COIN",
    CARD_PACK = "CARD_PACK",
    BINGO_BALL = "BINGO_BALL"
}

/** WonderBox金币类型 */
export enum CommonRewardWonderBoxCoinType {
    NONE = "NONE",
    NORMAL_1 = "NORMAL_1",
    NORMAL_2 = "NORMAL_2",
    NORMAL_3 = "NORMAL_3"
}

/** 随机Joker类型 */
export enum CommonRewardRandomJokerType {
    NONE = "NONE",
    RANDOM_ALL = "RANDOM_ALL",
    RANDOM_MIN_3 = "RANDOM_MIN_3",
    RANDOM_3 = "RANDOM_3",
    RANDOM_5 = "RANDOM_5"
}

/** 金币类型 */
export enum CommonRewardCoinType {
    NONE = "NONE",
    NORMAL_1 = "NORMAL_1",
    NORMAL_2 = "NORMAL_2",
    NORMAL_3 = "NORMAL_3",
    NORMAL_4 = "NORMAL_4",
    POCKET_1 = "POCKET_1",
    REELQUEST_1 = "REELQUEST_1",
    REELQUEST_2 = "REELQUEST_2",
    REELQUEST_3 = "REELQUEST_3",
    REELQUEST_4 = "REELQUEST_4",
    REELQUEST_5 = "REELQUEST_5",
    REELQUEST_6 = "REELQUEST_6",
    RANDOM_POCKET_1 = "RANDOM_POCKET_1",
    RANDOM_BOX_1 = "RANDOM_BOX_1",
    BOX_1 = "BOX_1"
}

/** 英雄动作类型 */
export enum CommonRewardHeroActionType {
    NONE = "NONE",
    NEW = "NEW",
    RANK_UP = "RANK_UP",
    FORCE_CHARGE = "FORCE_CHARGE"
}

/** 金币倍数类型 */
export enum CommonRewardCoinMultipleType {
    NONE = "None",
    DAILY_STAMP = "DailyStamp",
    WHEEL_BONUS = "WheelBonus"
}

// ===================== 英雄信息辅助类 =====================
/**
 * 奖励系统-英雄信息辅助类
 */
@ccclass('CommonRewardHeroInfo')
export class CommonRewardHeroInfo {
    /** 英雄名称映射数据（ID -> 英雄名key） */
    public static readonly HERO_NAME_DATA = [
        { key: "hero_cleopatra", value: [110010, 120010, 130010, 140010, 150010] },
        { key: "hero_poseidon", value: [110020, 120020, 130020, 140020, 150020] },
        { key: "hero_perkyturkey", value: [110030, 120030, 130030, 140030, 150030] },
        { key: "hero_lenny", value: [110040, 120040, 130040, 140040, 150040] },
        { key: "hero_sunnybunny", value: [110050, 120050, 130050, 140050, 150050] },
        { key: "hero_cactus", value: [110060, 120060, 130060, 140060, 150060] },
        { key: "hero_eagleeddy", value: [110070, 120070, 130070, 140070, 150070] },
        { key: "hero_cpthook", value: [110080, 120080, 130080, 140080, 150080] },
        { key: "hero_aurora", value: [110090, 120090, 130090, 140090, 150090] },
        { key: "hero_genie", value: [110100, 120100, 130100, 140100, 150100] },
        { key: "hero_raine", value: [110110, 120110, 130110, 140110, 150110] },
        { key: "hero_zelda", value: [110120, 120120, 130120, 140120, 150120] },
        { key: "hero_ragnar", value: [110130, 120130, 130130, 140130, 150130] },
        { key: "hero_santa", value: [110140, 120140, 130140, 140140, 150140] }
    ];

    /**
     * 根据英雄ID获取英雄名称key
     * @param heroId 英雄ID
     * @returns 英雄名称key（如"hero_cleopatra"），未找到返回空字符串
     */
    public static getHeroName(heroId: number): string {
        // 替换原for循环为find，更简洁高效
        const heroData = this.HERO_NAME_DATA.find(item => item.value.includes(heroId));
        return heroData ? heroData.key : "";
    }

    /**
     * 判断英雄是否升级（RankUp）
     * @param heroId 英雄ID
     * @param addForce 新增战力
     * @returns true=升级，false=未升级/英雄信息无效
     */
    public static isHeroRankUp(heroId: number, addForce: number): boolean {
        // 获取用户英雄信息
        const heroInfo = UserInfo.instance().getUserHeroInfo().getHeroInfo(heroId);
        
        // 空值保护：英雄信息无效直接返回false
        if (!TSUtility.isValid(heroInfo) || heroInfo === null) {
            return false;
        }

        // 获取当前英雄等级和配置
        const currentRank = heroInfo.rank;
        const heroConfig = HeroManager.Instance().getHeroConfig(heroId);
        const newForce = heroInfo.force + addForce;
        const newRank = heroConfig.getHeroLevel(newForce);

        // 判断等级是否变化
        return currentRank !== newRank;
    }
}

// ===================== 奖励动作信息类 =====================
/**
 * 奖励系统-动作信息类
 */
@ccclass('CommonRewardActionInfo')
export class CommonRewardActionInfo {
    /** 动作类型 */
    private _eActionType: CommonRewardActionType = CommonRewardActionType.NONE;
    /** 动作参数 */
    private _param: any = null;
    /** 标题信息 */
    private _titleInfo: CommonRewardTitleInfo | null = null;
    /** 是否来自收件箱 */
    private _isFromInbox: boolean = false;
    /** 按钮是否激活 */
    private _isButtonActive: boolean = false;

    /**
     * 构造函数
     * @param actionType 动作类型
     * @param param 动作参数
     */
    constructor(actionType: CommonRewardActionType = CommonRewardActionType.NONE, param: any = null) {
        this._eActionType = actionType;
        this._param = param;
    }

    /**
     * 设置按钮激活状态
     * @param isActive 是否激活
     */
    public setButtonActive(isActive: boolean): void {
        this._isButtonActive = isActive;
    }

    /**
     * 获取按钮激活状态
     * @returns 是否激活
     */
    public getButtonActive(): boolean {
        return this._isButtonActive;
    }

    /**
     * 设置标题信息
     * @param titleInfo 标题信息对象
     */
    public setTitleInfo(titleInfo: CommonRewardTitleInfo): void {
        this._titleInfo = titleInfo;
    }

    /**
     * 获取标题信息
     * @returns 标题信息对象
     */
    public getTitleInfo(): CommonRewardTitleInfo | null {
        return this._titleInfo;
    }

    /**
     * 设置是否来自收件箱
     * @param isFromInbox 是否来自收件箱（默认false）
     */
    public setFromInbox(isFromInbox: boolean = false): void {
        this._isFromInbox = isFromInbox;
    }

    /**
     * 获取是否来自收件箱
     * @returns 是否来自收件箱
     */
    public getFromInbox(): boolean {
        return this._isFromInbox;
    }

    /**
     * 获取动作类型
     * @returns 动作类型
     */
    public getActionType(): CommonRewardActionType {
        return this._eActionType;
    }

    /**
     * 获取动作参数
     * @returns 动作参数
     */
    public getActionParam(): any {
        return this._param;
    }
}

// ===================== 奖励标题信息类 =====================
/**
 * 奖励系统-标题信息类
 */
@ccclass('CommonRewardTitleInfo')
export class CommonRewardTitleInfo {
    /** 标题类型 */
    private _eTitle: CommonRewardTitleType = CommonRewardTitleType.NONE;
    /** 子标题类型 */
    private _eSubTitle: CommonRewardSubTitleType = CommonRewardSubTitleType.NONE;
    /** 标题参数 */
    private _paramTitle: any = null;
    /** 子标题参数 */
    private _paramSubTitle: any = null;

    /**
     * 构造函数
     * @param options 标题配置项 { title?, subTitle?, titleParam?, subTitleParam? }
     */
    constructor(options?: {
        title?: CommonRewardTitleType;
        subTitle?: CommonRewardSubTitleType;
        titleParam?: any;
        subTitleParam?: any;
    }) {
        if (TSUtility.isValid(options)) {
            this._eTitle = options.title ?? this._eTitle;
            this._eSubTitle = options.subTitle ?? this._eSubTitle;
            this._paramTitle = options.titleParam ?? this._paramTitle;
            this._paramSubTitle = options.subTitleParam ?? this._paramSubTitle;
        }
    }

    /**
     * 设置标题
     * @param title 标题类型
     * @param param 标题参数
     */
    public setTitle(title: CommonRewardTitleType, param: any): void {
        this._eTitle = title;
        this._paramTitle = param;
    }

    /**
     * 设置子标题
     * @param subTitle 子标题类型
     * @param param 子标题参数
     */
    public setSubTitle(subTitle: CommonRewardSubTitleType, param: any): void {
        this._eSubTitle = subTitle;
        this._paramSubTitle = param;
    }

    /**
     * 获取标题信息
     * @returns [标题类型, 标题参数]
     */
    public getTitle(): [CommonRewardTitleType, any] {
        return [this._eTitle, this._paramTitle];
    }

    /**
     * 获取子标题信息
     * @returns [子标题类型, 子标题参数]
     */
    public getSubTitle(): [CommonRewardSubTitleType, any] {
        return [this._eSubTitle, this._paramSubTitle];
    }
}

// ===================== 奖励标题类 =====================
/**
 * 奖励系统-标题显示类
 */
@ccclass('CommonRewardTitle')
export class CommonRewardTitle {
    /** 标题节点 */
    private _node: cc.Node | null = null;

    /**
     * 构造函数
     * @param node 标题节点
     */
    constructor(node: cc.Node | null = null) {
        this._node = node;
    }

    /**
     * 获取标题节点
     * @returns 标题节点
     */
    public getNode(): cc.Node | null {
        return this._node;
    }

    /**
     * 获取标题类型（节点名称）
     * @returns 标题类型（节点名称），节点为空返回空字符串
     */
    public getType(): string {
        return this._node ? this._node.name : "";
    }

    /**
     * 设置参数显示（更新Param子节点的Label）
     * @param param 要显示的参数值
     */
    public setParam(param: number | string): void {
        if (!this._node) return;

        // 获取Param子节点
        const paramNode = this._node.getChildByName("Param");
        if (!paramNode) return;

        // 获取Label组件并更新文本
        const labelComp = paramNode.getComponent(cc.Label);
        if (labelComp) {
            labelComp.string = param.toString();
        }
    }
}