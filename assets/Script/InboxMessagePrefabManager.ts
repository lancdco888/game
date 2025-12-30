const { ccclass } = cc._decorator;

/**
 * 邮件/奖励中心 消息类型枚举（礼包、奖励、通知、活动等所有类型）
 */
export enum INBOX_ITEM_TYPE {
    APP_UPDATE = 1,
    DAILY_TOPUP = 2,
    ADMIN = 3,
    SENDGIFT_COIN = 4,
    SENDGIFT_BINGOBALL = 5,
    DAILY_INBOX_COIN = 7,
    WELCOME_NEWFRIEND_COIN = 8,
    DAILY_SHORTCUT_COIN = 11,
    SHOP_FLIPCOIN = 12,
    SHOP_EMOJI777 = 13,
    SHOP_8DRAGON = 14,
    SHOP_LUCKNROLL = 15,
    SHOP_LUCKYWHEEL = 16,
    SHOP_PIGGIES = 17,
    DAILY_TOPUP_TEMPORARY = 18,
    FACEBOOK_ADON = 20,
    FACEBOOK_ALLIN_ADON = 21,
    BINGO_RESET = 22,
    BINGO_DAILY = 23,
    LEAGUE_REWARD_COIN = 3001,
    LEAGUE_REWARD_BINGOBALL = 3002,
    LEAGUE_REWARD_COUPON = 3003,
    LEAGUE_REWARD_MPASS = 3004,
    LEAGUE_REWARD_MESSAGE = 3005,
    LEAGUE_REWARD_DAILYBONUS = 3006,
    NOINBOX_SENDGIFT = 1001,
    NOINBOX_INVITE = 1002,
    NOINBOX_GUEST = 1003,
    STARALBUM_QUICK_STARTERPACK = 5001,
    BLASTOFF_CARDPACK = 6001,
    COINSHOWER_CARDPACK = 7001,
    COINSHOWER_BINGOBALL = 7002,
    DAILYBLITZ_CARDPACK = 8001,
    DAILYBLITZ_BINGOBALL = 8002,
    DAILYBLITZ_BINGOBALL_2 = 6002,
    TOURNEY_RESULT = 9001,
    SAQUADS_REWARD = 10001,
    INBOX_COUPON_RENEWAL_2002 = 2101,
    INBOX_COUPON_FIRST_BUY = 2102,
    INBOX_COUPON_WELCOME_BACK = 2103,
    INBOX_REWARD_GOLDTICKET = 11001,
    INBOX_REWARD_DIAMONDTICKET = 11002,
    INBOX_REWARD_SUITELEAGUE = 13001,
    INBOX_FAILED_TO_WIN_SUITELEAGUE = 13002,
    INBOX_REWARD_CENTURION_CLIQUE = 13003,
    INBOX_REWARD_SPIN_CASHBACK = 13004,
    INBOX_SUITE_LEAGUE_SHOP_REWARD_JOKER = 13005,
    INBOX_SUITE_LEAGUE_SHOP_REWARD_HERO = 13006,
    INBOX_SHARE_REWARD = 14001,
    INBOX_DAILYSTAMP_BINGOCARD = 15001,
    INBOX_DAILYSTAMP_JOKERCARD = 15002,
    INBOX_DAILYSTAMP_MPASS = 15003,
    INBOX_DAILYSTAMP_SUITEPASS = 15004,
    INBOX_DAILYSTAMP_MAINSHOPCOUPON = 15005,
    INBOX_DAILYSTAMP_STARLIGHTSPOINT = 15006,
    INBOX_DAILYSTAMP_LEVELBOOSTER = 15007,
    INBOX_DAILYSTAMP_FLIPCOIN = 15008,
    INBOX_DAILYSTAMP_EMOJI777 = 15009,
    INBOX_DAILYSTAMP_FULLEDPIGGYBANK = 15010,
    INBOX_DAILYSTAMP_PREMIUMALLRANDOMCARDPACK = 15011,
    INBOX_LEVELUPPASS_FREE = 16001,
    INBOX_LEVELUPPASS_PREMIUM = 16002,
    INBOX_REELQUEST_REWARD_JOKER = 17001,
    INBOX_WELCOMEBACKV2_STAGE1_REWARD = 18001,
    INBOX_WELCOMEBACKV2_STAGE2_REWARD = 18002,
    INBOX_WELCOMEBACKV2_STAGE3_REWARD = 18003,
    INBOX_WELCOMEBACKV2_STAGE4_REWARD = 18004,
    INBOX_WELCOMEBACKV2_STAGE5_REWARD = 18005,
    INBOX_WELCOMEBACKV2_UNCOLLECTED_STAGE1_REWARD = 18011,
    INBOX_WELCOMEBACKV2_UNCOLLECTED_STAGE2_REWARD = 18012,
    INBOX_WELCOMEBACKV2_UNCOLLECTED_STAGE3_REWARD = 18013,
    INBOX_WELCOMEBACKV2_UNCOLLECTED_STAGE4_REWARD = 18014,
    INBOX_WELCOMEBACKV2_UNCOLLECTED_STAGE5_REWARD = 18015,
    INBOX_SPIN_2_WIN_HERO_CARD = 19001,
    INBOX_SPIN_2_WIN_JOKER_CARD = 19002,
    INBOX_HYPER_BOUNTY_PASS_BINGOBALL = 20001,
    INBOX_HYPER_BOUNTY_PASS_STARSHOPPOINT = 20002,
    INBOX_HYPER_BOUNTY_PASS_PREMIUM_BINGOBALL = 20003,
    INBOX_HYPER_BOUNTY_PASS_PREMIUM_STARSHOPPOINT = 20004,
    INBOX_HYPER_BOUNTY_PASS_PREMIUM_FULLPIGGYBANK = 20005,
    INBOX_HYPER_BOUNTY_PASS_PREMIUM_LEVELBOOSTER = 20006,
    INBOX_HYPER_BOUNTY_PASS_PREMIUM_FLIPCOIN = 20007,
    INBOX_HYPER_BOUNTY_PASS_PREMIUM_PIGGIESONLADDERS = 20008,
    INBOX_HYPER_BOUNTY_PASS_PREMIUM_RANDOMJOKERCARD = 20009,
    INBOX_HYPER_BOUNTY_PASS_PREMIUM_SCRATCH8DRAGON = 20010,
    INBOX_HYPER_BOUNTY_PASS_PREMIUM_JOKERCARD = 20011,
    INBOX_HYPER_BOUNTY_PASS_PREMIUM_LUCKYSTRIKEWHEEL = 20012,
    INBOX_HYPER_BOUNTY_PASS_PREMIUM_EMOJI777 = 20013,
    INBOX_HYPER_BOUNTY_PASS_EXTEND_RANDOMJOKERCARD = 20014,
    INBOX_HYPER_BOUNTY_PASS_EXTEND_JOKERCARD = 20015,
    INBOX_CLUB_INVITE = 21001
}

/**
 * 奖励中心消息分类KEY（对应预制体分组）
 */
export enum RewardCenterInboxMessageType {
    NONE = "NONE",
    ADMIN = "ADMIN",
    PURCHASE_MINI_GAME = "PURCHASE_MINI_GAME",
    AD_FACEBOOK = "AD_FACEBOOK",
    BINGO_RESET = "BINGO_RESET",
    BINGO_DAILY = "BINGO_DAILY",
    DAILY_SHORTCUT_COIN = "DAILY_SHORTCUT_COIN",
    DAILY_INBOX_COIN = "DAILY_INBOX_COIN",
    DAILY_BLITZ = "DAILY_BLITZ",
    DAILY_TOP_UP = "DAILY_TOP_UP",
    DAILY_TOP_UP_TEMPORARY = "DAILY_TOP_UP_TEMPORARY",
    SUITE_LEAGUE = "SUITE_LEAGUE",
    SLOT_TOURNEY = "SLOT_TOURNEY",
    SHARE_REWARD = "SHARE_REWARD",
    CHECK_IN_BONUS = "CHECK_IN_BONUS",
    LEVEL_PASS = "LEVEL_PASS",
    REEL_QUEST = "REEL_QUEST",
    APP_UPDATE = "APP_UPDATE",
    SEND_GIFT = "SEND_GIFT",
    NO_INBOX = "NO_INBOX",
    BLAST_OFF = "BLAST_OFF",
    STAR_ALBUM_QUICK_STARTER_PACK = "STAR_ALBUM_QUICK_STARTER_PACK",
    SPIN_CASH_BACK = "SPIN_CASH_BACK",
    WELCOME_NEW_FRIEND_COIN = "WELCOME_NEW_FRIEND_COIN",
    SUITE_LEAGUE_SHOP = "SUITE_LEAGUE_SHOP",
    WELCOME_BACK = "WELCOME_BACK",
    SPIN_2_WIN = "SPIN_2_WIN",
    HYPER_PASS = "HYPER_PASS",
    CLUB_INVITE = "CLUB_INVITE"
}

/**
 * 预制体映射数据结构
 */
interface IPrefabData {
    key: RewardCenterInboxMessageType;
    value: {
        arrMType: INBOX_ITEM_TYPE[];
        Prefab: string;
        ItemSize: cc.Size;
        preloadCount: number;
    }
}

/**
 * 对象池数据结构
 */
interface IPoolData {
    key: string;
    value: cc.NodePool;
}

/**
 * 头像缓存池数据结构
 */
interface IProfileImagePool {
    key: string;
    value: cc.Texture2D;
}

@ccclass
export default class InboxMessagePrefabManager extends cc.Component {
    // 单例实例
    private static _instance: InboxMessagePrefabManager = null;
    public static get instance(): InboxMessagePrefabManager {
        if (!this._instance) {
            this._instance = new InboxMessagePrefabManager();
        }
        return this._instance;
    }

    // 核心：所有邮件类型对应的预制体配置表（完整保留原配置）
    public readonly INBOX_MESSAGE_PREFAB_DATA: IPrefabData[] = [
        {
            key: RewardCenterInboxMessageType.PURCHASE_MINI_GAME,
            value: {
                arrMType: [INBOX_ITEM_TYPE.SHOP_FLIPCOIN, INBOX_ITEM_TYPE.SHOP_EMOJI777, INBOX_ITEM_TYPE.SHOP_8DRAGON, INBOX_ITEM_TYPE.SHOP_LUCKNROLL, INBOX_ITEM_TYPE.SHOP_LUCKYWHEEL, INBOX_ITEM_TYPE.SHOP_PIGGIES],
                Prefab: "INBOX_ITEM_PURCHASE_MINI_GAME",
                ItemSize: new cc.Size(1064, 164),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.AD_FACEBOOK,
            value: {
                arrMType: [INBOX_ITEM_TYPE.FACEBOOK_ADON, INBOX_ITEM_TYPE.FACEBOOK_ALLIN_ADON],
                Prefab: "INBOX_ITEM_AD_FACEBOOK",
                ItemSize: new cc.Size(1064, 134),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.BINGO_RESET,
            value: {
                arrMType: [INBOX_ITEM_TYPE.BINGO_RESET],
                Prefab: "INBOX_ITEM_BINGO_RESET",
                ItemSize: new cc.Size(1064, 146),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.BINGO_DAILY,
            value: {
                arrMType: [INBOX_ITEM_TYPE.BINGO_DAILY],
                Prefab: "INBOX_ITEM_BINGO_DAILY",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.SUITE_LEAGUE,
            value: {
                arrMType: [INBOX_ITEM_TYPE.INBOX_REWARD_SUITELEAGUE],
                Prefab: "INBOX_ITEM_SUITE_LEAGUE",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.SUITE_LEAGUE_SHOP,
            value: {
                arrMType: [INBOX_ITEM_TYPE.INBOX_SUITE_LEAGUE_SHOP_REWARD_JOKER, INBOX_ITEM_TYPE.INBOX_SUITE_LEAGUE_SHOP_REWARD_HERO],
                Prefab: "INBOX_ITEM_SUITE_LEAGUE_SHOP",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.SLOT_TOURNEY,
            value: {
                arrMType: [INBOX_ITEM_TYPE.TOURNEY_RESULT],
                Prefab: "INBOX_ITEM_SLOT_TOURNEY",
                ItemSize: new cc.Size(1064, 142),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.SHARE_REWARD,
            value: {
                arrMType: [INBOX_ITEM_TYPE.INBOX_SHARE_REWARD],
                Prefab: "INBOX_ITEM_SHARE_REWARD",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.CHECK_IN_BONUS,
            value: {
                arrMType: [INBOX_ITEM_TYPE.INBOX_DAILYSTAMP_BINGOCARD, INBOX_ITEM_TYPE.INBOX_DAILYSTAMP_JOKERCARD, INBOX_ITEM_TYPE.INBOX_DAILYSTAMP_MPASS, INBOX_ITEM_TYPE.INBOX_DAILYSTAMP_SUITEPASS, INBOX_ITEM_TYPE.INBOX_DAILYSTAMP_MAINSHOPCOUPON, INBOX_ITEM_TYPE.INBOX_DAILYSTAMP_STARLIGHTSPOINT, INBOX_ITEM_TYPE.INBOX_DAILYSTAMP_LEVELBOOSTER, INBOX_ITEM_TYPE.INBOX_DAILYSTAMP_FLIPCOIN, INBOX_ITEM_TYPE.INBOX_DAILYSTAMP_EMOJI777, INBOX_ITEM_TYPE.INBOX_DAILYSTAMP_FULLEDPIGGYBANK, INBOX_ITEM_TYPE.INBOX_DAILYSTAMP_PREMIUMALLRANDOMCARDPACK],
                Prefab: "INBOX_ITEM_DAILY_STAMP",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 5
            }
        },
        {
            key: RewardCenterInboxMessageType.LEVEL_PASS,
            value: {
                arrMType: [INBOX_ITEM_TYPE.INBOX_LEVELUPPASS_FREE, INBOX_ITEM_TYPE.INBOX_LEVELUPPASS_PREMIUM],
                Prefab: "INBOX_ITEM_LEVEL_UP_PASS",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.REEL_QUEST,
            value: {
                arrMType: [INBOX_ITEM_TYPE.INBOX_REELQUEST_REWARD_JOKER],
                Prefab: "INBOX_ITEM_REEL_QEUST",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.DAILY_BLITZ,
            value: {
                arrMType: [INBOX_ITEM_TYPE.DAILYBLITZ_CARDPACK, INBOX_ITEM_TYPE.DAILYBLITZ_BINGOBALL, INBOX_ITEM_TYPE.DAILYBLITZ_BINGOBALL_2],
                Prefab: "INBOX_ITEM_DAILY_BLITZ",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.APP_UPDATE,
            value: {
                arrMType: [INBOX_ITEM_TYPE.APP_UPDATE],
                Prefab: "INBOX_ITEM_APP_UPDATE",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.DAILY_TOP_UP,
            value: {
                arrMType: [INBOX_ITEM_TYPE.DAILY_TOPUP],
                Prefab: "INBOX_ITEM_DAILY_TOP_UP",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.DAILY_TOP_UP_TEMPORARY,
            value: {
                arrMType: [INBOX_ITEM_TYPE.DAILY_TOPUP_TEMPORARY],
                Prefab: "INBOX_ITEM_DAILY_TOP_UP_TEMPORARY",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.SEND_GIFT,
            value: {
                arrMType: [INBOX_ITEM_TYPE.SENDGIFT_COIN, INBOX_ITEM_TYPE.SENDGIFT_BINGOBALL],
                Prefab: "INBOX_ITEM_SEND_GIFT",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.NO_INBOX,
            value: {
                arrMType: [INBOX_ITEM_TYPE.NOINBOX_GUEST, INBOX_ITEM_TYPE.NOINBOX_INVITE, INBOX_ITEM_TYPE.NOINBOX_SENDGIFT],
                Prefab: "INBOX_ITEM_NO_INBOX",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.BLAST_OFF,
            value: {
                arrMType: [INBOX_ITEM_TYPE.BLASTOFF_CARDPACK],
                Prefab: "INBOX_ITEM_BLAST_OFF",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.DAILY_SHORTCUT_COIN,
            value: {
                arrMType: [INBOX_ITEM_TYPE.DAILY_SHORTCUT_COIN],
                Prefab: "INBOX_ITEM_DAILY_SHORTCUT_COIN",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.STAR_ALBUM_QUICK_STARTER_PACK,
            value: {
                arrMType: [INBOX_ITEM_TYPE.STARALBUM_QUICK_STARTERPACK],
                Prefab: "INBOX_ITEM_STARALBUM_QUICK_STARTERPACK",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.SPIN_CASH_BACK,
            value: {
                arrMType: [INBOX_ITEM_TYPE.INBOX_REWARD_SPIN_CASHBACK],
                Prefab: "INBOX_ITEM_SPIN_CASHBACK",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.DAILY_INBOX_COIN,
            value: {
                arrMType: [INBOX_ITEM_TYPE.DAILY_INBOX_COIN],
                Prefab: "INBOX_ITEM_DAILY_INBOX_COIN",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.WELCOME_NEW_FRIEND_COIN,
            value: {
                arrMType: [INBOX_ITEM_TYPE.WELCOME_NEWFRIEND_COIN],
                Prefab: "INBOX_ITEM_WELCOME_NEW_FRIEND_COIN",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.ADMIN,
            value: {
                arrMType: [INBOX_ITEM_TYPE.ADMIN],
                Prefab: "INBOX_ITEM_ADMIN",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.WELCOME_BACK,
            value: {
                arrMType: [INBOX_ITEM_TYPE.INBOX_WELCOMEBACKV2_STAGE1_REWARD, INBOX_ITEM_TYPE.INBOX_WELCOMEBACKV2_STAGE2_REWARD, INBOX_ITEM_TYPE.INBOX_WELCOMEBACKV2_STAGE3_REWARD, INBOX_ITEM_TYPE.INBOX_WELCOMEBACKV2_STAGE4_REWARD, INBOX_ITEM_TYPE.INBOX_WELCOMEBACKV2_STAGE5_REWARD, INBOX_ITEM_TYPE.INBOX_WELCOMEBACKV2_UNCOLLECTED_STAGE1_REWARD, INBOX_ITEM_TYPE.INBOX_WELCOMEBACKV2_UNCOLLECTED_STAGE2_REWARD, INBOX_ITEM_TYPE.INBOX_WELCOMEBACKV2_UNCOLLECTED_STAGE3_REWARD, INBOX_ITEM_TYPE.INBOX_WELCOMEBACKV2_UNCOLLECTED_STAGE4_REWARD, INBOX_ITEM_TYPE.INBOX_WELCOMEBACKV2_UNCOLLECTED_STAGE5_REWARD],
                Prefab: "INBOX_ITEM_WELCOME_BACK",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 2
            }
        },
        {
            key: RewardCenterInboxMessageType.SPIN_2_WIN,
            value: {
                arrMType: [INBOX_ITEM_TYPE.INBOX_SPIN_2_WIN_HERO_CARD, INBOX_ITEM_TYPE.INBOX_SPIN_2_WIN_JOKER_CARD],
                Prefab: "INBOX_ITEM_SPIN_2_WIN",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        },
        {
            key: RewardCenterInboxMessageType.HYPER_PASS,
            value: {
                arrMType: [INBOX_ITEM_TYPE.INBOX_HYPER_BOUNTY_PASS_BINGOBALL, INBOX_ITEM_TYPE.INBOX_HYPER_BOUNTY_PASS_STARSHOPPOINT, INBOX_ITEM_TYPE.INBOX_HYPER_BOUNTY_PASS_PREMIUM_BINGOBALL, INBOX_ITEM_TYPE.INBOX_HYPER_BOUNTY_PASS_PREMIUM_STARSHOPPOINT, INBOX_ITEM_TYPE.INBOX_HYPER_BOUNTY_PASS_PREMIUM_FULLPIGGYBANK, INBOX_ITEM_TYPE.INBOX_HYPER_BOUNTY_PASS_PREMIUM_LEVELBOOSTER, INBOX_ITEM_TYPE.INBOX_HYPER_BOUNTY_PASS_PREMIUM_FLIPCOIN, INBOX_ITEM_TYPE.INBOX_HYPER_BOUNTY_PASS_PREMIUM_PIGGIESONLADDERS, INBOX_ITEM_TYPE.INBOX_HYPER_BOUNTY_PASS_PREMIUM_RANDOMJOKERCARD, INBOX_ITEM_TYPE.INBOX_HYPER_BOUNTY_PASS_PREMIUM_SCRATCH8DRAGON, INBOX_ITEM_TYPE.INBOX_HYPER_BOUNTY_PASS_PREMIUM_JOKERCARD, INBOX_ITEM_TYPE.INBOX_HYPER_BOUNTY_PASS_PREMIUM_LUCKYSTRIKEWHEEL, INBOX_ITEM_TYPE.INBOX_HYPER_BOUNTY_PASS_PREMIUM_EMOJI777, INBOX_ITEM_TYPE.INBOX_HYPER_BOUNTY_PASS_EXTEND_RANDOMJOKERCARD, INBOX_ITEM_TYPE.INBOX_HYPER_BOUNTY_PASS_EXTEND_JOKERCARD],
                Prefab: "INBOX_ITEM_HYPER_PASS",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 5
            }
        },
        {
            key: RewardCenterInboxMessageType.CLUB_INVITE,
            value: {
                arrMType: [INBOX_ITEM_TYPE.INBOX_CLUB_INVITE],
                Prefab: "INBOX_ITEM_CLUB",
                ItemSize: new cc.Size(1064, 144),
                preloadCount: 1
            }
        }
    ];

    // 邮件预制体对象池
    private _arrObjectPool: IPoolData[] = [];
    // 用户头像缓存池
    private _arrUserProfileImagePool: IProfileImagePool[] = [];

    /**
     * 根据消息分类key获取预制体配置
     */
    public getPrefabData(key: RewardCenterInboxMessageType): { arrMType: INBOX_ITEM_TYPE[], Prefab: string, ItemSize: cc.Size, preloadCount: number } {
        const data = this.INBOX_MESSAGE_PREFAB_DATA.find(item => item.key == key);
        return data ? data.value : null;
    }

    /**
     * 根据INBOX_ITEM_TYPE获取消息分类key
     */
    public getMessageType(mType: INBOX_ITEM_TYPE): RewardCenterInboxMessageType {
        const data = this.INBOX_MESSAGE_PREFAB_DATA.find(item => item.value.arrMType.includes(mType));
        return cc.isValid(data) ? data.key : RewardCenterInboxMessageType.NONE;
    }

    /**
     * 根据消息分类key获取预制体尺寸
     */
    public getPrefabSize(key: RewardCenterInboxMessageType): cc.Size {
        const data = this.getPrefabData(key);
        return cc.isValid(data) ? data.ItemSize : cc.size(0, 0);
    }

    /**
     * 根据INBOX_ITEM_TYPE获取预制体名称
     */
    public getPrefabNameByMType(mType: INBOX_ITEM_TYPE): string {
        const type = this.getMessageType(mType);
        return type !== RewardCenterInboxMessageType.NONE ? this.getPrefabName(type) : "";
    }

    /**
     * 根据消息分类key获取预制体名称
     */
    public getPrefabName(key: RewardCenterInboxMessageType): string {
        const data = this.getPrefabData(key);
        return cc.isValid(data) ? data.Prefab : "";
    }

    /**
     * 清空所有对象池
     */
    public clear(): void {
        this._arrObjectPool.forEach(poolData => {
            if (cc.isValid(poolData.value)) {
                poolData.value.clear();
            }
        });
        this._arrObjectPool = [];
    }

    /**
     * 预加载所有邮件预制体（初始化调用）
     */
    public async preloadAllMessageObject(): Promise<void> {
        const prefabList = this.INBOX_MESSAGE_PREFAB_DATA.map(item => item.value);
        for (let i = 0; i < prefabList.length; i++) {
            const prefabName = prefabList[i].Prefab;
            const needCount = prefabList[i].preloadCount;
            const curCount = this.getPrefabCount(prefabName);
            const lackCount = needCount - curCount;
            if (lackCount > 0) {
                for (let j = 0; j < lackCount; j++) {
                    await this.preloadObject(prefabName);
                }
            }
        }
    }

    /**
     * 获取指定预制体的对象池数量
     */
    public getPrefabCount(prefabName: string): number {
        const pool = this.getObjectPool(prefabName);
        return cc.isValid(pool) ? pool.size() : 0;
    }

    /**
     * 批量预加载指定预制体
     */
    public async preloadMessageObject(prefabNames: string[]): Promise<void> {
        for (let i = 0; i < prefabNames.length; i++) {
            await this.preloadObject(prefabNames[i]);
        }
    }

    /**
     * 预加载单个预制体并加入对象池
     */
    public async preloadObject(prefabName: string): Promise<void> {
        const node = await this.createObject(prefabName);
        if (cc.isValid(node)) {
            await this.restore(node);
        }
    }

    /**
     * 创建单个预制体节点
     */
    public async createObject(prefabName: string): Promise<cc.Node> {
        return new Promise((resolve, reject) => {
            cc.loader.loadRes(`Service/01_Content/RewardCenter/Inbox/${prefabName}`, cc.Prefab, (err, prefab) => {
                if (err) {
                    cc.error(`加载预制体失败: ${prefabName}`, err);
                    resolve(null);
                    return;
                }
                const node = cc.instantiate(prefab);
                node.name = prefabName;
                node.active = false;
                if (cc.isValid(node.parent)) {
                    node.removeFromParent(false);
                }
                resolve(node);
            });
        });
    }

    /**
     * 获取指定预制体的对象池，不存在则创建
     */
    public getObjectPool(prefabName: string): cc.NodePool {
        let poolData = this._arrObjectPool.find(item => item.key === prefabName);
        if (!poolData) {
            poolData = { key: prefabName, value: new cc.NodePool() };
            this._arrObjectPool.push(poolData);
        }
        return poolData.value;
    }

    /**
     * 从对象池取出预制体节点
     */
    public async pop(prefabName: string): Promise<cc.Node> {
        return new Promise(async resolve => {
            const pool = this.getObjectPool(prefabName);
            if (cc.isValid(pool) && pool.size() > 0) {
                const node = pool.get();
                if (cc.isValid(node)) {
                    node.active = true;
                    resolve(node);
                    return;
                }
            }
            resolve(await this.createObject(prefabName));
        });
    }

    /**
     * 将节点归还对象池
     */
    public async restore(node: cc.Node): Promise<void> {
        return new Promise(resolve => {
            if (!cc.isValid(node)) {
                resolve();
                return;
            }
            node.active = false;
            if (cc.isValid(node.parent)) {
                node.removeFromParent(true);
            }
            const pool = this.getObjectPool(node.name);
            if (!pool) {
                node.destroy();
                resolve();
                return;
            }
            pool.put(node);
            resolve();
        });
    }

    /**
     * 清空头像缓存池并释放资源
     */
    public clearProfileImage(): void {
        this._arrUserProfileImagePool.forEach(imgData => {
            if (cc.isValid(imgData.value)) {
                cc.loader.releaseAsset(imgData.value);
            }
        });
        this._arrUserProfileImagePool = [];
    }

    /**
     * 获取缓存的头像纹理
     */
    public getProfileImage(key: string): cc.Texture2D {
        if (!cc.isValid(key) || key.length <= 0) return null;
        const imgData = this._arrUserProfileImagePool.find(item => item.key === key);
        return imgData ? imgData.value : null;
    }

    /**
     * 添加头像纹理到缓存池
     */
    public addProfileImage(key: string, texture: cc.Texture2D): void {
        if (cc.isValid(texture) && cc.isValid(key) && key.length > 0) {
            const isExist = this._arrUserProfileImagePool.some(item => item.key === key);
            if (!isExist) {
                this._arrUserProfileImagePool.push({ key, value: texture });
            }
        }
    }
}