const { ccclass } = cc._decorator;

import UserInven, { MainShopCouponExtraInfo } from "./UserInven";
import UserInfo from "./UserInfo";
import TSUtility from "../global_utility/TSUtility";
import { ProductItemRelationInfo } from "../Config/ProductConfig";
import InboxMessagePrefabManager, { INBOX_ITEM_TYPE } from "../InboxMessagePrefabManager";
import ServiceInfoManager from "../ServiceInfoManager";

// 全局工具类声明（项目自定义）
declare const Utility: {
    isFacebookInstant: () => number;
};

/**
 * 收件箱消息基础信息类
 */
export class InboxMessageInfo {
    public mUid: string | number = ""; // 消息唯一ID
    public mType: number = 0; // 消息类型
    public senderUid: string | number = ""; // 发送者UID
    public message: string = ""; // 消息内容
    public extraInfo: string = ""; // 扩展信息（JSON字符串）
    public expireDate: number = 0; // 过期时间戳（秒）
    public modifiedDate: number = 0; // 修改时间戳（秒）
    public createdDate: number = 0; // 创建时间戳（秒）
    public uid: string | number = ""; // 用户UID

    /**
     * 初始化收件箱消息信息
     * @param data 原始消息数据
     */
    public initInboxMessageInfo(data: Partial<InboxMessageInfo>): void {
        this.mUid = data.mUid ?? this.mUid;
        this.mType = data.mType ?? this.mType;
        this.senderUid = data.senderUid ?? this.senderUid;
        this.message = data.message ?? this.message;
        this.extraInfo = data.extraInfo ?? this.extraInfo;
        this.expireDate = data.expireDate ?? this.expireDate;
        this.modifiedDate = data.modifiedDate ?? this.modifiedDate;
        this.createdDate = data.createdDate ?? this.createdDate;
        this.uid = data.uid ?? this.uid;
    }

    /**
     * 判断是否为联赛奖励消息
     * @returns 是否为联赛奖励
     */
    public isLeagueReward(): boolean {
        return (
            this.mType >= 3000 &&
            this.mType < 3100 &&
            this.mType !== 3003 &&
            this.mType !== 3005
        );
    }

    /**
     * 判断消息是否有效（未过期）
     * @returns 是否有效
     */
    public isAvailable(): boolean {
        return TSUtility.getServerBaseNowUnixTime() <= this.expireDate;
    }
}

/**
 * 收件箱用户简易信息类
 */
export class InboxUserSimpleInfo {
    public uid: number = 0; // 用户UID
    public fbid: string = ""; // Facebook ID
    public fbasID: string = ""; // Facebook AS ID
    public fbinstantID: string = ""; // Facebook Instant ID
    public name: string = ""; // 用户名
    public picUrl: string = ""; // 头像URL
    public createdDate: number = 0; // 创建时间戳
    public lastLoginDate: number = 0; // 最后登录时间戳
    public lineID: string = ""; // Line ID
    public accountSite: number = 0; // 账号平台

    /**
     * 解析用户简易信息
     * @param data 原始用户数据
     * @returns 解析后的实例
     */
    public static parse(data: Partial<InboxUserSimpleInfo>): InboxUserSimpleInfo {
        const info = new InboxUserSimpleInfo();
        if (data.uid) info.uid = data.uid;
        if (data.fbid) info.fbid = data.fbid;
        if (data.fbasID) info.fbasID = data.fbasID;
        if (data.fbinstantID) info.fbinstantID = data.fbinstantID;
        if (data.name) info.name = data.name;
        if (data.picUrl) info.picUrl = data.picUrl;
        if (data.createdDate) info.createdDate = data.createdDate;
        if (data.lastLoginDate) info.lastLoginDate = data.lastLoginDate;
        if (data.lineID) info.lineID = data.lineID;
        if (data.accountSite) info.accountSite = data.accountSite;
        return info;
    }

    /**
     * 获取用户Facebook平台ID
     * @returns Facebook平台ID
     */
    public getUserFBPlatformID(): string {
        return Utility.isFacebookInstant() === 1 ? this.fbinstantID : this.fbasID;
    }
}

/**
 * 收件箱消息+用户信息组合类
 */
export class InboxMessageUserInfo {
    public message: InboxMessageInfo | null = null; // 消息信息
    public senderInfo: InboxUserSimpleInfo | null = null; // 发送者信息

    /**
     * 初始化消息+用户信息
     * @param data 原始组合数据
     */
    public initInboxMessageUserInfo(data: {
        message: Partial<InboxMessageInfo>;
        senderInfo?: Partial<InboxUserSimpleInfo>;
    }): void {
        this.message = new InboxMessageInfo();
        this.message.initInboxMessageInfo(data.message);
        
        if (data.senderInfo) {
            this.senderInfo = InboxUserSimpleInfo.parse(data.senderInfo);
        }
    }

    /**
     * 判断消息是否有效
     * @returns 是否有效
     */
    public isAvailable(): boolean {
        return this.message?.isAvailable() ?? false;
    }
}

/**
 * 每日签到扩展信息类
 */
export class InboxExtraInfoAttendanceDaily {
    public itemId: string = ""; // 物品ID
    public totCnt: number = 0; // 总数量
    public curCnt: number = 0; // 当前数量
    public reward: number = 0; // 奖励

    /**
     * 解析每日签到信息
     * @param data 原始数据
     * @returns 解析后的实例
     */
    public static parse(data: Partial<InboxExtraInfoAttendanceDaily>): InboxExtraInfoAttendanceDaily {
        const info = new InboxExtraInfoAttendanceDaily();
        info.totCnt = data.totCnt ?? info.totCnt;
        info.curCnt = data.curCnt ?? info.curCnt;
        info.reward = data.reward ?? info.reward;
        
        if (TSUtility.isValid(data.itemId)) {
            info.itemId = data.itemId as string;
        }
        return info;
    }
}

/**
 * 收集奖励扩展信息类
 */
export class InboxExtraInfoCollect {
    public itemId: string = ""; // 物品ID
    public itemType: number = 0; // 物品类型
    public addCnt: number = 0; // 增加数量

    /**
     * 解析收集奖励信息
     * @param data 原始数据
     * @returns 解析后的实例
     */
    public static parse(data: Partial<InboxExtraInfoCollect>): InboxExtraInfoCollect {
        const info = new InboxExtraInfoCollect();
        info.itemId = data.itemId ?? info.itemId;
        info.itemType = data.itemType ?? info.itemType;
        info.addCnt = data.addCnt ?? info.addCnt;
        return info;
    }
}

/**
 * 返现扩展信息类
 */
export class InboxExtraInfoCashback {
    public cashBackCoin: number = 0; // 返现金币
    public cashBackDate: number = 0; // 返现时间戳

    /**
     * 解析返现信息
     * @param data 原始数据
     * @returns 解析后的实例
     */
    public static parse(data: Partial<InboxExtraInfoCashback>): InboxExtraInfoCashback {
        const info = new InboxExtraInfoCashback();
        info.cashBackCoin = data.cashBackCoin ?? info.cashBackCoin;
        info.cashBackDate = data.cashBackDate ?? info.cashBackDate;
        return info;
    }
}

/**
 * 物品奖励扩展信息类
 */
export class InboxExtraInfoItem {
    public itemId: string = ""; // 物品ID
    public itemType: string = ""; // 物品类型
    public addCnt: number = 0; // 增加数量
    public addTime: number = 0; // 增加时间戳
    public payCode: string = ""; // 支付码
    public extraInfo: string = ""; // 额外信息

    /**
     * 解析物品奖励信息
     * @param data 原始数据
     * @returns 解析后的实例
     */
    public static parse(data: Partial<InboxExtraInfoItem> & { rewardItem?: Partial<InboxExtraInfoItem> }): InboxExtraInfoItem {
        const info = new InboxExtraInfoItem();
        info.itemId = data.itemId ?? info.itemId;
        info.itemType = data.itemType ?? info.itemType;
        info.addCnt = data.addCnt ?? info.addCnt;
        info.addTime = data.addTime ?? info.addTime;
        info.payCode = data.payCode ?? info.payCode;
        info.extraInfo = data.extraInfo ?? info.extraInfo;

        // 兼容嵌套的rewardItem结构
        if (data.rewardItem) {
            info.itemId = data.rewardItem.itemId ?? info.itemId;
            info.itemType = data.rewardItem.itemType ?? info.itemType;
            info.addCnt = data.rewardItem.addCnt ?? info.addCnt;
            info.addTime = data.rewardItem.addTime ?? info.addTime;
            info.payCode = data.rewardItem.payCode ?? info.payCode;
            info.extraInfo = data.rewardItem.extraInfo ?? info.extraInfo;
        }
        return info;
    }
}

/**
 * 收件箱商店扩展信息类
 */
export class InboxExtraInfoInboxShop {
    public curClientProductId: string = ""; // 当前客户端产品ID
    public price: number = 0; // 价格
    public baseCoin: number = 0; // 基础金币

    /**
     * 解析商店信息
     * @param data 原始数据
     * @returns 解析后的实例
     */
    public static parse(data: Partial<InboxExtraInfoInboxShop>): InboxExtraInfoInboxShop {
        const info = new InboxExtraInfoInboxShop();
        info.curClientProductId = data.curClientProductId ?? info.curClientProductId;
        info.price = data.price ?? info.price;
        info.baseCoin = data.baseCoin ?? info.baseCoin;
        return info;
    }
}

/**
 * 联赛奖励扩展信息类
 */
export class InboxExtraInfoLeagueReward {
    public zoneId: string | number = ""; // 区域ID
    public rank: number = 0; // 排名
    public rankTier: number = 0; // 排名等级
    public totalRankCount: number = 0; // 总排名数
    public turn: number = 0; // 轮次
    public rewardItem: ProductItemRelationInfo = new ProductItemRelationInfo(); // 奖励物品

    /**
     * 解析联赛奖励信息
     * @param data 原始数据
     * @returns 解析后的实例
     */
    public static parse(data: Partial<InboxExtraInfoLeagueReward>): InboxExtraInfoLeagueReward {
        const info = new InboxExtraInfoLeagueReward();
        info.zoneId = data.zoneId ?? info.zoneId;
        info.rank = data.rank ?? info.rank;
        info.rankTier = data.rankTier ?? info.rankTier;
        info.totalRankCount = data.totalRankCount ?? info.totalRankCount;
        info.turn = data.turn ?? info.turn;
        
        if (data.rewardItem) {
            info.rewardItem.init(data.rewardItem);
        }
        return info;
    }
}

/**
 * 老虎机锦标赛奖励扩展信息类
 */
export class InboxExtraInfoSlotTourneyReward {
    public tier: number = 0; // 等级
    public tourneyID: number = 0; // 锦标赛ID
    public rank: number = 0; // 排名
    public rankGroup: number = 0; // 排名组
    public rewards: InboxExtraInfoItem[] = []; // 奖励列表
    public slotID: string = ""; // 插槽ID

    /**
     * 解析锦标赛奖励信息
     * @param data 原始数据
     * @returns 解析后的实例
     */
    public static parse(data: Partial<InboxExtraInfoSlotTourneyReward>): InboxExtraInfoSlotTourneyReward {
        const info = new InboxExtraInfoSlotTourneyReward();
        if (data.tier) info.tier = data.tier;
        if (data.tourneyID) info.tourneyID = data.tourneyID;
        if (data.rank) info.rank = data.rank;
        if (data.rankGroup) info.rankGroup = data.rankGroup;
        if (data.slotID) info.slotID = data.slotID;

        // 解析奖励列表
        if (data.rewards && Array.isArray(data.rewards)) {
            data.rewards.forEach(rewardData => {
                info.rewards.push(InboxExtraInfoItem.parse(rewardData));
            });
        }
        return info;
    }
}

/**
 * 小队奖励扩展信息类
 */
export class InboxExtraInfoSquadReward {
    public squadID: number = 0; // 小队ID
    public contextID: number = 0; // 上下文ID
    public turn: number = 0; // 轮次
    public stage: number = 0; // 阶段
    public stageCoinReward: number = 0; // 阶段金币奖励
    public stageMaxGauge: number = 0; // 阶段最大进度
    public userRank: number = 0; // 用户排名
    public rewards: InboxExtraInfoItem[] = []; // 奖励列表

    /**
     * 解析小队奖励信息
     * @param data 原始数据
     * @returns 解析后的实例
     */
    public static parse(data: Partial<InboxExtraInfoSquadReward>): InboxExtraInfoSquadReward {
        const info = new InboxExtraInfoSquadReward();
        info.squadID = data.squadID ?? info.squadID;
        info.contextID = data.contextID ?? info.contextID;
        info.turn = data.turn ?? info.turn;
        info.stage = data.stage ?? info.stage;
        info.stageMaxGauge = data.stageMaxGauge ?? info.stageMaxGauge;
        info.stageCoinReward = data.stageCoinReward ?? info.stageCoinReward;
        info.userRank = data.userRank ?? info.userRank;

        // 解析奖励列表
        if (data.rewards && Array.isArray(data.rewards)) {
            data.rewards.forEach(rewardData => {
                info.rewards.push(InboxExtraInfoItem.parse(rewardData));
            });
        }
        return info;
    }
}

/**
 * 收件箱信息主管理类
 */
export default class UserInboxInfo {
    public inboxMessages: InboxMessageUserInfo[] = []; // 收件箱消息列表

    /**
     * 初始化用户收件箱信息
     * @param messageList 原始消息列表
     */
    public initUserInboxInfo(messageList: Array<{
        message: Partial<InboxMessageInfo>;
        senderInfo?: Partial<InboxUserSimpleInfo>;
    }>): void {
        this.inboxMessages = [];
        
        messageList.forEach(msgData => {
            const msgUserInfo = new InboxMessageUserInfo();
            msgUserInfo.initInboxMessageUserInfo(msgData);
            this.inboxMessages.push(msgUserInfo);
        });

        this.refreshAndNotify();
    }

    /**
     * 刷新并通知收件箱状态变更
     */
    public refreshAndNotify(): void {
        // 清理过期消息
        this.updateExpiredInboxMessages();

        let messageCount = 0; // 总消息数（排除特定类型）
        let newFriendRewardCount = 0; // 新好友奖励数
        const squadRewardMessages: InboxMessageInfo[] = []; // 小队奖励消息列表

        // 统计各类消息数量
        this.inboxMessages.forEach(msgUserInfo => {
            const msg = msgUserInfo.message;
            if (!msg) return;

            // 排除特定类型消息的统计
            const excludeTypes = [
                INBOX_ITEM_TYPE.SHOP_FLIPCOIN,
                INBOX_ITEM_TYPE.SHOP_EMOJI777,
                INBOX_ITEM_TYPE.SHOP_8DRAGON,
                INBOX_ITEM_TYPE.SHOP_LUCKNROLL,
                INBOX_ITEM_TYPE.LEAGUE_REWARD_DAILYBONUS,
                INBOX_ITEM_TYPE.SAQUADS_REWARD,
                INBOX_ITEM_TYPE.INBOX_COUPON_RENEWAL_2002,
                INBOX_ITEM_TYPE.INBOX_COUPON_WELCOME_BACK,
                INBOX_ITEM_TYPE.INBOX_COUPON_FIRST_BUY,
                INBOX_ITEM_TYPE.INBOX_REWARD_GOLDTICKET,
                INBOX_ITEM_TYPE.INBOX_REWARD_DIAMONDTICKET,
                INBOX_ITEM_TYPE.INBOX_FAILED_TO_WIN_SUITELEAGUE
            ];
            if (!excludeTypes.includes(msg.mType)) {
                messageCount++;
            }

            // 统计新好友奖励消息
            if (msg.mType === INBOX_ITEM_TYPE.WELCOME_NEWFRIEND_COIN) {
                newFriendRewardCount++;
            }

            // 收集Facebook Instant的小队奖励消息
            if (Utility.isFacebookInstant() === 1 && msg.mType === INBOX_ITEM_TYPE.SAQUADS_REWARD) {
                squadRewardMessages.push(msg);
            }
        });

        // // 更新各类状态
        // FirstBuyCouponManager.instance.setFirstBuyCouponMessageByInbox(this);
        // UserInfo.instance().setUserInboxMessageCnt(messageCount);
        // UserInfo.instance().setUserInboxCollectEnableCnt(this.getEnableCollectMessageCount());
        
        // const mainShopMessages = this.getMainShopInboxMessages();
        // UserInfo.instance().setUserInboxCouponInfo(mainShopMessages);
        // UserInfo.instance().setUserInboxMainShopMessageCnt(mainShopMessages.length);
        
        // ServiceInfoManager.NUMBER_NEW_FRIENDS_REWARD_COUNT = newFriendRewardCount;
        
        // if (Utility.isFacebookInstant() === 1) {
        //     FBSquadManager.Instance().setSquadsRewardInfo(squadRewardMessages);
        // }
    }

    /**
     * 获取主商店收件箱消息（优惠券类）
     * @returns 排序后的主商店消息列表
     */
    public getMainShopInboxMessages(): InboxMessageUserInfo[] {
        const currentTime = TSUtility.getServerBaseNowUnixTime();
        const mainShopMessages: InboxMessageUserInfo[] = [];

        // 筛选有效且符合类型的优惠券消息
        this.inboxMessages.forEach(msgUserInfo => {
            const msg = msgUserInfo.message;
            if (!msg) return;

            // 过期的消息跳过
            if (msg.expireDate - currentTime <= 0) return;

            // 筛选优惠券类型
            const couponTypes = [
                INBOX_ITEM_TYPE.LEAGUE_REWARD_COUPON,
                INBOX_ITEM_TYPE.INBOX_COUPON_RENEWAL_2002,
                INBOX_ITEM_TYPE.INBOX_COUPON_FIRST_BUY,
                INBOX_ITEM_TYPE.INBOX_COUPON_WELCOME_BACK
            ];
            if (couponTypes.includes(msg.mType)) {
                mainShopMessages.push(msgUserInfo);
            }
        });

        // 按金币倍率降序、价格阈值升序排序
        mainShopMessages.sort((a, b) => {
            if (!a.message?.extraInfo || !b.message?.extraInfo) return 0;

            const aExtra = JSON.parse(a.message.extraInfo);
            const bExtra = JSON.parse(b.message.extraInfo);
            
            const aCoupon = MainShopCouponExtraInfo.parse(aExtra.rewardItem.extraInfo);
            const bCoupon = MainShopCouponExtraInfo.parse(bExtra.rewardItem.extraInfo);

            if (aCoupon.moreCoinRate > bCoupon.moreCoinRate) return -1;
            if (aCoupon.moreCoinRate === bCoupon.moreCoinRate && aCoupon.overThePrice <= bCoupon.overThePrice) return -1;
            return 1;
        });

        return mainShopMessages;
    }

    /**
     * 更新过期消息（移除）
     * @returns 是否移除了过期消息
     */
    public updateExpiredInboxMessages(): boolean {
        const currentTime = TSUtility.getServerBaseNowUnixTime();
        let hasRemoved = false;

        // 反向遍历移除过期消息
        for (let i = this.inboxMessages.length - 1; i >= 0; i--) {
            const msg = this.inboxMessages[i].message;
            if (msg && msg.expireDate - currentTime <= 0) {
                this.inboxMessages.splice(i, 1);
                hasRemoved = true;
            }
        }

        return hasRemoved;
    }

    /**
     * 获取可收集的消息数量（礼物类）
     * @returns 可收集消息数
     */
    public getEnableCollectMessageCount(): number {
        const collectableTypes = [
            INBOX_ITEM_TYPE.SENDGIFT_COIN,
            INBOX_ITEM_TYPE.SENDGIFT_BINGOBALL
        ];

        return this.inboxMessages.filter(msgUserInfo => {
            return msgUserInfo.message && collectableTypes.includes(msgUserInfo.message.mType);
        }).length;
    }

    /**
     * 添加收件箱消息（去重）
     * @param msgUserInfo 消息+用户信息
     */
    public addInboxMessage(msgUserInfo: InboxMessageUserInfo): void {
        // 去重检查（按mUid）
        const isDuplicate = this.inboxMessages.some(
            existing => existing.message?.mUid === msgUserInfo.message?.mUid
        );
        if (isDuplicate) return;

        this.inboxMessages.push(msgUserInfo);
        this.refreshAndNotify();
    }

    /**
     * 移除收件箱消息
     * @param mUid 消息唯一ID
     */
    public removeInboxMessage(mUid: string | number): void {
        cc.log("removeInboxMessage:", mUid);

        // 查找并移除消息
        for (let i = 0; i < this.inboxMessages.length; i++) {
            if (this.inboxMessages[i].message?.mUid === mUid) {
                this.inboxMessages.splice(i, 1);
                break;
            }
        }

        this.refreshAndNotify();
    }
}