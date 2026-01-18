import AllMightyCouponManager from "../ServiceInfo/AllMightyCouponManager";
import MembersClassBoostUpNormalManager from "../ServiceInfo/MembersClassBoostUpNormalManager";
import ServiceInfoManager from "../ServiceInfoManager";
import { StampCardPromotion } from "../User/UserPromotion";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";
import UnlockContentsManager, { UnlockContentsType } from "./UnlockContentsManager";

const { ccclass, property } = cc._decorator;

// ===================== 枚举定义 =====================
/**
 * 广告横幅信息类型（业务类型）
 */
export enum ADBannerInfoType {
    NONE = "NONE",
    STAMP_CARD = "STAMP_CARD",
    MEMBERS_BOOST_UP = "MEMBERS_BOOST_UP",
    MEMBERS_BOOST_UP_EXPAND = "MEMBERS_BOOST_UP_EXPAND",
    ALMIGHTY_COUPON = "ALMIGHTY_COUPON",
    REEL_QUEST_NEWBIE = "REEL_QUEST_NEWBIE",
    REEL_QUEST_NORMAL = "REEL_QUEST_NORMAL",
    JIGGY_PUZZLE = "JIGGY_PUZZLE",
    POWER_GEM = "POWER_GEM",
    WELCOME_BACK = "WELCOME_BACK",
    BOUNTY_SET = "BOUNTY_SET",
    NEWCOMER = "NEWCOMER",
    LEVEL_UP_EVENT = "LEVEL_UP_EVENT",
    LEVEL_UP_PASS = "LEVEL_UP_PASS",
    MOBILE_UPDATE = "MOBILE_UPDATE",
    FACEBOOK_CONNECT = "FACEBOOK_CONNECT",
    COLLECTION_SEASON_END = "COLLECTION_SEASON_END",
    HERO_BUFF = "HERO_BUFF",
    MOBILE_OPEN = "MOBILE_OPEN",
    FAN_PAGE = "FAN_PAGE",
    GROUP_OVERLAY_NOTICE = "GROUP_OVERLAY_NOTICE",
    BINGO = "BINGO",
    VIP_DIAMOND_BLUE = "VIP_DIAMOND_BLUE",
    INVITE_FRIEND = "INVITE_FRIEND",
    NEWCOMER_RENEWAL_1 = "NEWCOMER_RENEWAL_1",
    NEWCOMER_RENEWAL_2 = "NEWCOMER_RENEWAL_2",
    NEWCOMER_RENEWAL_3 = "NEWCOMER_RENEWAL_3",
    NEWCOMER_RENEWAL_4 = "NEWCOMER_RENEWAL_4",
    FIRST_BUY_COUPON = "FIRST_BUY_COUPON",
    JUMP_STATER = "JUMP_STATER",
    STEP_UP_CHANCE = "STEP_UP_CHANCE",
    EPIC_WIN = "EPIC_WIN",
    RECORD_BREAKER = "RECORD_BREAKER",
    SEASON_PROMOTION = "SEASON_PROMOTION",
    NEWBIE_SHOP_SALE = "NEWBIE_SHOP_SALE",
    TIME_OFFER = "TIME_OFFER",
    TIME_OFFER_FLIP = "TIME_OFFER_FLIP",
    TIME_OFFER_BOMB = "TIME_OFFER_BOMB",
    SEASON_END_OFFER = "SEASON_END_OFFER",
    SECRET_DEAL = "SECRET_DEAL",
    PIGGY_BANK_UPTO_MORE = "PIGGY_BANK_UPTO_MORE",
    DAILY_TOP_UP = "DAILY_TOP_UP",
    CARD_PACK_X2 = "CARD_PACK_X2",
    CARD_PACK_BOOSTER = "CARD_PACK_BOOSTER",
    MINI_GAME = "MINI_GAME",
    ALL_IN_OFFER = "ALL_IN_OFFER",
    SUPER_SIZE_IT = "SUPER_SIZE_IT",
    SPIN_2_WIN = "SPIN_2_WIN",
    SECRET_STASH = "SECRET_STASH"
}

/**
 * 广告横幅展示位置类型
 */
export enum ADBannerType {
    LOBBY_FIRST = 0,
    LOBBY_SECOND = 1,
    LOBBY_SUITE = 2,
    SHOP = 3
}

/**
 * 广告横幅预制体类型
 */
export enum ADBannerPrefabType {
    LOBBY = 0,
    SHOP = 1
}

// ===================== 基础广告横幅数据类 =====================
/**
 * 广告横幅数据基类
 * 所有具体横幅类型的父类，定义核心方法接口
 */
export class ADBannerData extends cc.Component {
    /**
     * 获取横幅类型
     */
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.NONE;
    }

    /**
     * 判断是否可以添加到横幅列表
     * @param currentList 当前已选横幅列表
     */
    public isAppendBanner(currentList: ADBannerData[] = []): boolean {
        return false;
    }

    /**
     * 判断是否是促销/折扣类横幅
     */
    public isShowingPromotionOrSale(): boolean {
        return false;
    }

    /**
     * 获取用户等级
     */
    protected getUserLevel(): number {
        return ServiceInfoManager.instance.getUserLevel();
    }

    /**
     * 获取用户VIP等级
     */
    protected getUserVIPLevel(): number {
        return 0;//UserInfo.instance().getUserVipInfo().level;
    }

    /**
     * 检查列表中是否包含促销/折扣类横幅
     * @param bannerList 横幅列表
     */
    protected includeShowingPromotionOrSale(bannerList: ADBannerData[]): boolean {
        for (let i = 0; i < bannerList.length; i++) {
            if (bannerList[i].isShowingPromotionOrSale()) {
                return true;
            }
        }
        return false;
    }
}

// ===================== 具体广告横幅数据子类 =====================
/**
 * 印章卡横幅数据
 */
export class ADBannerData_StampCard extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.STAMP_CARD;
    }

    public isAppendBanner(): boolean {
        // if (SDefine.FB_Instant_iOS_Shop_Flag === 1) return false;
        
        // const promotionInfo = UserInfo.instance().getPromotionInfo(StampCardPromotion.PromotionKeyName);
        // return (
        //     TSUtility.isValid(promotionInfo) &&
        //     promotionInfo.endTime > TSUtility.getServerBaseNowUnixTime() &&
        //     !ServiceInfoManager.instance().isAbleNewbieShopPromotion() &&
        //     !FirstBuyCouponManager.instance.isHaveFirstBuyCouponByInbox()
        // );
        return false;
    }
}

/**
 * 会员等级提升横幅数据
 */
export class ADBannerData_MembersBoostUp extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.MEMBERS_BOOST_UP;
    }

    public isAppendBanner(): boolean {
        // return MembersClassBoostUpManager.instance().isRunningMembersBoostUpProcess() !== 0;
        return false;
    }
}

/**
 * 会员等级提升扩展横幅数据
 */
export class ADBannerData_MembersBoostUpExpand extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.MEMBERS_BOOST_UP_EXPAND;
    }

    public isAppendBanner(): boolean {
        return MembersClassBoostUpNormalManager.instance().isRunningMembersBoostUpExpandProcess() !== 0;
    }
}

/**
 * 全能优惠券横幅数据
 */
export class ADBannerData_AlmightyCoupon extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.ALMIGHTY_COUPON;
    }

    public isAppendBanner(): boolean {
        return AllMightyCouponManager.instance().isRunningAllMightyCouponProcess() !== 0;
    }
}

/**
 * 卷轴任务横幅数据
 */
export class ADBannerData_ReelQuest extends ADBannerData {
    private _isNewbie: boolean = false;

    public getType(): ADBannerInfoType {
        return this._isNewbie ? ADBannerInfoType.REEL_QUEST_NEWBIE : ADBannerInfoType.REEL_QUEST_NORMAL;
    }

    public isAppendBanner(): boolean {
        // if (UserInfo.instance().hasActiveReelQuest() === 0) return false;
        // if (UserInfo.instance().getZoneName() === SDefine.SUITE_ZONENAME) return false;

        // const promotionKey = UserInfo.instance().getActiveReelQuestPromotionKey();
        // const promotionInfo = UserInfo.instance().getPromotionInfo(promotionKey);
        
        // if (TSUtility.isValid(promotionInfo) && promotionInfo.isTargetUser !== 0) {
        //     this._isNewbie = promotionInfo.promotionKey !== UserPromotion.ReelQuestPromotion.Normal_PromotionKeyName;
        //     return true;
        // }
        return false;
    }
}

/**
 * 拼图游戏横幅数据
 */
export class ADBannerData_JiggyPuzzle extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.JIGGY_PUZZLE;
    }

    public isAppendBanner(): boolean {
        // const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.JiggyPuzzlePromotion.PromotionKeyName);
        // return (
        //     TSUtility.isValid(promotionInfo) &&
        //     promotionInfo.isAvailable() !== 0 &&
        //     promotionInfo.curStage > 0
        // );
        return false;
    }
}

/**
 * 能量宝石横幅数据
 */
export class ADBannerData_PowerGem extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.POWER_GEM;
    }

    public isAppendBanner(): boolean {
        // return (
        //     UserInfo.instance().getZoneName() !== SDefine.SUITE_ZONENAME &&
        //     PowerGemManager.instance.isAvailablePowerGem(false, true) !== 0
        // );
        return false;
    }
}

/**
 * 回归玩家横幅数据
 */
export class ADBannerData_WelcomeBack extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.WELCOME_BACK;
    }

    public isAppendBanner(): boolean {
        // const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.UserWelcomeBackRenewalInfo.PromotionKeyName);
        // return (
        //     TSUtility.isValid(promotionInfo) &&
        //     promotionInfo.getBaseCoin() > 0 &&
        //     promotionInfo.isFinishedProm() !== 1 &&
        //     (promotionInfo.endDate - TSUtility.getServerBaseNowUnixTime()) > 0
        // );
        return false;
    }
}

/**
 * 赏金套装横幅数据
 */
export class ADBannerData_BountySet extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.BOUNTY_SET;
    }

    public isAppendBanner(): boolean {
        // return ShopPromotionManager.Instance().isBountySale() !== 0;
        return false;
    }
}

/**
 * 新玩家横幅数据
 */
export class ADBannerData_Newcomer extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.NEWCOMER;
    }

    public isAppendBanner(): boolean {
        // if (SDefine.FB_Instant_iOS_Shop_Flag === 1) return false;
        // if (ServiceInfoManager.instance().isEnable1stBargain() === 0) return false;

        // const currentOffer = FirstBargainSaleManager.Instance().getCurrentOffer();
        // return (
        //     TSUtility.isValid(currentOffer) &&
        //     currentOffer.type === "-1" &&
        //     (currentOffer.startTime + currentOffer.offerTime - Utility.getUnixTimestamp()) > 0
        // );
        return false;
    }
}

/**
 * 等级提升活动横幅数据
 */
export class ADBannerData_LevelUpEvent extends ADBannerData {
    private readonly LIMIT_LEVEL = 9;

    public getType(): ADBannerInfoType {
        return ADBannerInfoType.LEVEL_UP_EVENT;
    }

    public isAppendBanner(): boolean {
        // if (this.getUserLevel() < this.LIMIT_LEVEL) return false;

        // const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.LevelUpEventPromotion.PromotionKeyName);
        // return (
        //     TSUtility.isValid(promotionInfo) &&
        //     promotionInfo.isTargetUser !== 0 &&
        //     !(promotionInfo.endTime > 0 && (promotionInfo.endTime - TSUtility.getServerBaseNowUnixTime()) <= 0)
        // );
        return false;
    }
}

/**
 * 等级提升通行证横幅数据
 */
export class ADBannerData_LevelUpPass extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.LEVEL_UP_PASS;
    }

    public isAppendBanner(): boolean {
        // const unlockLevel = UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsManager.UnlockContentsType.LEVEL_PASS);
        // if (this.getUserLevel() < unlockLevel) return false;

        // const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.LevelUpPassPromotion.PromotionKeyName);
        // return (
        //     TSUtility.isValid(promotionInfo) &&
        //     promotionInfo.isTargetUser !== 0 &&
        //     !(promotionInfo.endDate > 0 && (promotionInfo.endDate - TSUtility.getServerBaseNowUnixTime()) <= 0)
        // );
        return false;
    }
}

/**
 * 超大奖励横幅数据
 */
export class ADBannerData_SuperSizeIt extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.SUPER_SIZE_IT;
    }

    public isAppendBanner(): boolean {
        // const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.SupersizeJackpotEventInfo.PromotionKeyName);
        // return (
        //     TSUtility.isValid(promotionInfo) &&
        //     promotionInfo.numPopupStartDate > 0 &&
        //     promotionInfo.numEventStartDate > 0 &&
        //     !(promotionInfo.numPopupStartDate - TSUtility.getServerBaseNowUnixTime() > 0) &&
        //     (SupersizeItManager.instance.isDisableEvent() !== 1 || SupersizeItManager.instance.isEnableEndEvent() !== 0)
        // );
        return false;
    }
}

/**
 * 移动端更新横幅数据
 */
export class ADBannerData_MobileUpdate extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.MOBILE_UPDATE;
    }

    public isAppendBanner(): boolean {
        // return Utility.isMobileGame() !== 0 && ServiceInfoManager.instance().isRequireUpgrade() !== 0;
        return false;
    }
}

/**
 * Facebook绑定横幅数据
 */
export class ADBannerData_FacebookConnect extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.FACEBOOK_CONNECT;
    }

    public isAppendBanner(): boolean {
        // if (Utility.isMobileGame() === 0) return false;
        // if (UserInfo.instance().isGuestUser() === 0) return false;

        // const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.FBMobileConnectPromotion.PromotionKeyName);
        // return TSUtility.isValid(promotionInfo) && promotionInfo.isReceived !== 1;
        return false;
    }
}

/**
 * 收藏赛季结束横幅数据
 */
export class ADBannerData_CollectionSeasonEnd extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.COLLECTION_SEASON_END;
    }

    public isAppendBanner(): boolean {
        // const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.StarAlbumSeason1ClosePromotionInfo.PromotionKeyName);
        // if (!TSUtility.isValid(promotionInfo) || promotionInfo.isTargetUser === 0) return false;

        // const seasonInfo = StarAlbumManager.instance().getCurrentSeasonInfo();
        // return TSUtility.isValid(seasonInfo) && seasonInfo.numSeasonID === SDefine.TargetCardSeason;
        return false;
    }
}

/**
 * 英雄增益横幅数据
 */
export class ADBannerData_HeroBuff extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.HERO_BUFF;
    }

    public isAppendBanner(): boolean {
        // const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.HeroBuffPromotion.PromotionKeyName);
        // return TSUtility.isValid(promotionInfo) && promotionInfo.isAvailableHeroBuff() !== 0;
        return false;
    }
}

/**
 * 移动端引导横幅数据
 */
export class ADBannerData_MobileOpen extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.MOBILE_OPEN;
    }

    public isAppendBanner(): boolean {
        // return Utility.isFacebookWeb() !== 0 && ServerStorageManager.getAsBoolean(ServerStorageManager.StorageKeyType.MOBILE_GUIDE) !== 1;
        return false;
    }
}

/**
 * 粉丝页横幅数据
 */
export class ADBannerData_FanPage extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.FAN_PAGE;
    }

    public isAppendBanner(): boolean {
        // return Utility.isFacebookInstant() !== 1 && UserInfo.instance().isFacebookLoginUser() !== 0;
        return false;
    }
}

/**
 * 群组覆盖通知横幅数据
 */
export class ADBannerData_GroupOverrayNotice extends ADBannerData {
    private readonly LIMIT_VIP_LEVEL = 3;

    public getType(): ADBannerInfoType {
        return ADBannerInfoType.GROUP_OVERLAY_NOTICE;
    }

    public isAppendBanner(): boolean {
        return Utility.isFacebookInstant() && !(this.getUserVIPLevel() <= this.LIMIT_VIP_LEVEL);
    }
}

/**
 * 宾果游戏横幅数据
 */
export class ADBannerData_Bingo extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.BINGO;
    }

    public isAppendBanner(): boolean {
        const unlockLevel = UnlockContentsManager.instance.getUnlockConditionLevel(UnlockContentsType.BINGO);
        return !(this.getUserLevel() < unlockLevel);
    }
}

/**
 * VIP蓝钻横幅数据
 */
export class ADBannerData_VIPDiamondBlue extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.VIP_DIAMOND_BLUE;
    }

    public isAppendBanner(): boolean {
        return true;
    }
}

/**
 * 邀请好友横幅数据
 */
export class ADBannerData_InviteFriend extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.INVITE_FRIEND;
    }

    public isAppendBanner(): boolean {
        return !Utility.isFacebookInstant();
    }
}

/**
 * 新玩家续费横幅数据
 */
export class ADBannerData_NewcomerRenewal extends ADBannerData {
    private _strType: string = "";

    public getType(): ADBannerInfoType {
        switch (this._strType) {
            case "0": return ADBannerInfoType.NEWCOMER_RENEWAL_1;
            case "1": return ADBannerInfoType.NEWCOMER_RENEWAL_2;
            case "2": return ADBannerInfoType.NEWCOMER_RENEWAL_3;
            case "3": return ADBannerInfoType.NEWCOMER_RENEWAL_4;
            default: return ADBannerInfoType.NONE;
        }
    }

    public isShowingPromotionOrSale(): boolean {
        return true;
    }

    public isAppendBanner(): boolean {
        // if (SDefine.FB_Instant_iOS_Shop_Flag === 1) return false;
        // if (ServiceInfoManager.instance().isEnable1stBargain() === 0) return false;

        // const popInfo = FirstBargainSaleManager.Instance().getOpenablePopInfo(false);
        // if (TSUtility.isValid(popInfo) && popInfo.isAvailable() !== 0) {
        //     this._strType = popInfo.type;
        //     return true;
        // }
        return false;
    }
}

/**
 * 首次购买优惠券横幅数据
 */
export class ADBannerData_FirstBuyCoupon extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.FIRST_BUY_COUPON;
    }

    public isAppendBanner(): boolean {
        // return FirstBuyCouponManager.instance.isRunningFirstBuyCouponProcess() !== 0;
        return false;
    }
}

/**
 * 新手启动包横幅数据
 */
export class ADBannerData_JumpStarter extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.JUMP_STATER;
    }

    public isShowingPromotionOrSale(): boolean {
        return true;
    }

    public isAppendBanner(): boolean {
        // return ServiceInfoManager.instance().isAvailableJumpStarter() !== 0;
        return false;
    }
}

/**
 * 进阶机会横幅数据
 */
export class ADBannerData_StepUpChance extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.STEP_UP_CHANCE;
    }

    public isShowingPromotionOrSale(): boolean {
        return true;
    }

    public isAppendBanner(): boolean {
        // return ServiceInfoManager.instance().isAvailableStepUpChance() !== 0;
        return false;
    }
}

/**
 * 史诗胜利横幅数据
 */
export class ADBannerData_EpicWin extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.EPIC_WIN;
    }

    public isShowingPromotionOrSale(): boolean {
        return true;
    }

    public isAppendBanner(): boolean {
        // return SDefine.FB_Instant_iOS_Shop_Flag !== 1 && ServiceInfoManager.instance().isEpicWinOffer() !== 0;

        return false;
    }
}

/**
 * 破纪录横幅数据
 */
export class ADBannerData_RecordBreaker extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.RECORD_BREAKER;
    }

    public isShowingPromotionOrSale(): boolean {
        return true;
    }

    public isAppendBanner(): boolean {
        return false;
    }
}

/**
 * 赛季促销（大厅）横幅数据
 */
export class ADBannerData_SeasonPromotion_Lobby extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.SEASON_PROMOTION;
    }

    public isShowingPromotionOrSale(): boolean {
        return true;
    }

    public isAppendBanner(): boolean {
        // return (
        //     SDefine.FB_Instant_iOS_Shop_Flag !== 1 &&
        //     (ShopPromotionManager.Instance().getSeasonalPromotionInfo_PopupType() != null ||
        //     ShopPromotionManager.Instance().getSeasonalPromotionInfo_ShopType() != null)
        // );

        return false;
    }
}

/**
 * 赛季促销（商店）横幅数据
 */
export class ADBannerData_SeasonPromotion_Shop extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.SEASON_PROMOTION;
    }

    public isShowingPromotionOrSale(): boolean {
        return true;
    }

    public isAppendBanner(): boolean {
        // return (
        //     SDefine.FB_Instant_iOS_Shop_Flag !== 1 &&
        //     ShopPromotionManager.Instance().getSeasonalPromotionInfo_PopupType() != null
        // );

        return false;
    }
}

/**
 * 新手商店折扣横幅数据
 */
export class ADBannerData_NewbieShopSale extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.NEWBIE_SHOP_SALE;
    }

    public isShowingPromotionOrSale(): boolean {
        return true;
    }

    public isAppendBanner(): boolean {
        return !SDefine.FB_Instant_iOS_Shop_Flag &&ServiceInfoManager.instance.isAbleNewbieShopPromotion();
    }
}

/**
 * 限时优惠横幅数据
 */
export class ADBannerData_TimeOffer extends ADBannerData {
    private _numType: number = 0;

    public getType(): ADBannerInfoType {
        return this._numType === 1 ? ADBannerInfoType.TIME_OFFER_FLIP : 
               this._numType === 2 ? ADBannerInfoType.TIME_OFFER_BOMB : 
               ADBannerInfoType.TIME_OFFER_FLIP;
    }

    public isShowingPromotionOrSale(): boolean {
        return true;
    }

    public isAppendBanner(): boolean {
        return false;
    }
}

/**
 * 赛季结束优惠横幅数据
 */
export class ADBannerData_SeasonEndOffer extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.SEASON_END_OFFER;
    }

    public isAppendBanner(currentList: ADBannerData[]): boolean {
        // return (
        //     SDefine.FB_Instant_iOS_Shop_Flag !== 1 &&
        //     this.includeShowingPromotionOrSale(currentList) !== 1 &&
        //     ServiceInfoManager.instance().isSeasonEndTerm() !== 0 &&
        //     ServiceInfoManager.instance().haveOverFiveCard() !== 0 &&
        //     ServerStorageManager.getAsNumber(ServerStorageManager.StorageByOsKeyType.SEASON_OPEN_TIME) !==
        //     ServerStorageManager.getAsNumber(ServerStorageManager.StorageByOsKeyType.SEASON_END_LAST_BOUGHT_TIME)
        // );
        return false;
    }
}

/**
 * 秘密交易横幅数据
 */
export class ADBannerData_SecretDeal extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.SECRET_DEAL;
    }

    public isAppendBanner(): boolean {
        return !SDefine.FB_Instant_iOS_Shop_Flag && ServiceInfoManager.instance.isEnableSecretDeal();
    }
}

/**
 * 存钱罐加码横幅数据
 */
export class ADBannerData_PiggyBankUptoMore extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.PIGGY_BANK_UPTO_MORE;
    }

    public isAppendBanner(): boolean {
        // return !SDefine.FB_Instant_iOS_Shop_Flag && PiggyBankPromotionManager.instance().isUpToMore() !== 0;
        return false;
    }
}

/**
 * 每日充值横幅数据
 */
export class ADBannerData_DailyTopUp extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.DAILY_TOP_UP;
    }

    public isAppendBanner(): boolean {
        return !SDefine.FB_Instant_iOS_Shop_Flag;
    }
}

/**
 * 卡包双倍横幅数据
 */
export class ADBannerData_CardPackX2 extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.CARD_PACK_X2;
    }

    public isAppendBanner(): boolean {
        // return (
        //     SDefine.FB_Instant_iOS_Shop_Flag !== 1 &&
        //     ServiceInfoManager.instance().isSeasonEndTerm() !== 1 &&
        //     ServiceInfoManager.instance().haveOverFiveCard() !== 0
        // );
        return false;
    }
}

/**
 * 卡包助推器横幅数据
 */
export class ADBannerData_CardPackBooster extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.CARD_PACK_BOOSTER;
    }

    public isAppendBanner(): boolean {
        // const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.CardPackBoosterPromotion.PromotionKeyName);
        // return TSUtility.isValid(promotionInfo) && promotionInfo.isAvailableCardPackBooster() !== 0;
        return false;
    }
}

/**
 * 小游戏横幅数据
 */
export class ADBannerData_MiniGame extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.MINI_GAME;
    }

    public isAppendBanner(): boolean {
        // return SDefine.FB_Instant_iOS_Shop_Flag !== 1 && MinigameManager.instance().isEnableMinigame() !== 0;
        return false;
    }
}

/**
 * 全押优惠横幅数据
 */
export class ADBannerData_AllInOffer extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.ALL_IN_OFFER;
    }

    public isAppendBanner(): boolean {
        // return SDefine.FB_Instant_iOS_Shop_Flag !== 1 && SDefine.BOOL_ENABLE_ALL_IN_OFFER !== 0;
        return false;
    }
}

/**
 * 旋转赢奖励横幅数据
 */
export class ADBannerData_Spin2Win extends ADBannerData {
    public getType(): ADBannerInfoType {
        return ADBannerInfoType.SPIN_2_WIN;
    }

    public isAppendBanner(): boolean {
        // return SDefine.FB_Instant_iOS_Shop_Flag !== 1 && ServiceInfoManager.NUMBER_SPIN_2_WIN_TICKET_COUNT > 0;
        return false;
    }
}

/**
 * 秘密储备横幅数据
 */
export class ADBannerData_SecretStash extends ADBannerData {
    private _numType: number = 0;

    public getType(): ADBannerInfoType {
        return ADBannerInfoType.SECRET_STASH;
    }

    public isShowingPromotionOrSale(): boolean {
        return true;
    }

    public isAppendBanner(): boolean {
        // return (
        //     SDefine.FB_Instant_iOS_Shop_Flag !== 1 &&
        //     UserInfo.instance().getUserServiceInfo().totalPurchaseCnt > 0 &&
        //     ServiceInfoManager.instance().isEnableLimitedTimeOffer() !== 0 &&
        //     ServiceInfoManager.instance().isEpicWinOffer() !== 1 &&
        //     ServiceInfoManager.instance().isAvailableJumpStarter() !== 1 &&
        //     ServiceInfoManager.instance().isAvailableStepUpChance() !== 1
        // );
        return false;
    }
}

// ===================== 广告横幅数据管理器（单例） =====================
/**
 * 广告横幅数据管理器
 * 负责管理不同场景的广告横幅列表，生成符合条件的横幅类型数组
 */
@ccclass("ADBannerDataManager")
export default class ADBannerDataManager extends cc.Component {
    // 单例实例
    private static _instance: ADBannerDataManager | null = null;
    // 最大横幅数量限制
    private readonly MAX_AD_BANNER_COUNT = 5;
    private readonly MAX_AD_BANNER_SHOP_COUNT = 3;

    /**
     * 获取单例实例
     */
    public static get instance(): ADBannerDataManager {
        if (!ADBannerDataManager._instance) {
            ADBannerDataManager._instance = new ADBannerDataManager();
        }
        return ADBannerDataManager._instance;
    }

    /**
     * 获取默认横幅类型数组（大厅）
     */
    public getDefaultTypeArray(): ADBannerInfoType[] {
        return this.getTypeArray(this.getDefaultADBannerArray(), ADBannerPrefabType.LOBBY, this.MAX_AD_BANNER_COUNT);
    }

    /**
     * 获取大厅第一组横幅类型数组
     */
    public getLobbyFirstTypeArray(): ADBannerInfoType[] {
        return this.getTypeArray(this.getLobbyFirstADBannerArray(), ADBannerPrefabType.LOBBY, this.MAX_AD_BANNER_COUNT);
    }

    /**
     * 获取大厅第二组横幅类型数组
     */
    public getLobbySecondTypeArray(): ADBannerInfoType[] {
        return this.getTypeArray(this.getLobbySecondADBannerArray(), ADBannerPrefabType.LOBBY, this.MAX_AD_BANNER_COUNT);
    }

    /**
     * 获取商店横幅类型数组
     */
    public getShopTypeArray(): ADBannerInfoType[] {
        return this.getTypeArray(this.getShopADBannerArray(), ADBannerPrefabType.SHOP, this.MAX_AD_BANNER_SHOP_COUNT);
    }

    /**
     * 获取默认横幅数据数组
     */
    private getDefaultADBannerArray(): ADBannerData[] {
        return [
            new ADBannerData_NewcomerRenewal(),
            new ADBannerData_JumpStarter(),
            new ADBannerData_StepUpChance(),
            new ADBannerData_EpicWin(),
            new ADBannerData_RecordBreaker(),
            new ADBannerData_SeasonPromotion_Lobby(),
            new ADBannerData_NewbieShopSale(),
            new ADBannerData_StampCard(),
            new ADBannerData_MembersBoostUp(),
            new ADBannerData_MembersBoostUpExpand(),
            new ADBannerData_AlmightyCoupon(),
            new ADBannerData_FirstBuyCoupon(),
            new ADBannerData_SuperSizeIt(),
            new ADBannerData_ReelQuest(),
            new ADBannerData_JiggyPuzzle(),
            new ADBannerData_PowerGem(),
            new ADBannerData_WelcomeBack(),
            new ADBannerData_BountySet(),
            new ADBannerData_SecretStash(),
            new ADBannerData_SeasonEndOffer(),
            new ADBannerData_Spin2Win(),
            new ADBannerData_SecretDeal(),
            new ADBannerData_PiggyBankUptoMore(),
            new ADBannerData_LevelUpEvent(),
            new ADBannerData_LevelUpPass(),
            new ADBannerData_MobileUpdate(),
            new ADBannerData_FacebookConnect(),
            new ADBannerData_DailyTopUp(),
            new ADBannerData_CardPackX2(),
            new ADBannerData_CardPackBooster(),
            new ADBannerData_HeroBuff(),
            new ADBannerData_MiniGame(),
            new ADBannerData_MobileOpen(),
            new ADBannerData_FanPage(),
            new ADBannerData_GroupOverrayNotice(),
            new ADBannerData_Bingo(),
            new ADBannerData_VIPDiamondBlue(),
            new ADBannerData_InviteFriend(),
            new ADBannerData_AllInOffer()
        ];
    }

    /**
     * 获取大厅第一组横幅数据数组
     */
    private getLobbyFirstADBannerArray(): ADBannerData[] {
        return [
            new ADBannerData_StampCard(),
            new ADBannerData_MembersBoostUp(),
            new ADBannerData_MembersBoostUpExpand(),
            new ADBannerData_AlmightyCoupon(),
            new ADBannerData_SuperSizeIt(),
            new ADBannerData_ReelQuest(),
            new ADBannerData_JiggyPuzzle(),
            new ADBannerData_PowerGem(),
            new ADBannerData_WelcomeBack(),
            new ADBannerData_BountySet(),
            new ADBannerData_LevelUpEvent(),
            new ADBannerData_LevelUpPass(),
            new ADBannerData_MobileUpdate(),
            new ADBannerData_FacebookConnect(),
            new ADBannerData_CollectionSeasonEnd(),
            new ADBannerData_HeroBuff(),
            new ADBannerData_CardPackBooster(),
            new ADBannerData_MobileOpen(),
            new ADBannerData_FanPage(),
            new ADBannerData_GroupOverrayNotice(),
            new ADBannerData_Bingo(),
            new ADBannerData_VIPDiamondBlue(),
            new ADBannerData_InviteFriend()
        ];
    }

    /**
     * 获取大厅第二组横幅数据数组
     */
    private getLobbySecondADBannerArray(): ADBannerData[] {
        return [
            new ADBannerData_NewcomerRenewal(),
            new ADBannerData_FirstBuyCoupon(),
            new ADBannerData_JumpStarter(),
            new ADBannerData_StepUpChance(),
            new ADBannerData_EpicWin(),
            new ADBannerData_RecordBreaker(),
            new ADBannerData_SeasonPromotion_Lobby(),
            new ADBannerData_NewbieShopSale(),
            new ADBannerData_SecretStash(),
            new ADBannerData_SeasonEndOffer(),
            new ADBannerData_Spin2Win(),
            new ADBannerData_SecretDeal(),
            new ADBannerData_PiggyBankUptoMore(),
            new ADBannerData_DailyTopUp(),
            new ADBannerData_CardPackX2(),
            new ADBannerData_MiniGame()
        ];
    }

    /**
     * 获取商店横幅数据数组
     */
    private getShopADBannerArray(): ADBannerData[] {
        if (SDefine.FB_Instant_iOS_Shop_Flag) return [];

        return [
            new ADBannerData_JumpStarter(),
            new ADBannerData_StepUpChance(),
            new ADBannerData_NewcomerRenewal(),
            new ADBannerData_EpicWin(),
            new ADBannerData_RecordBreaker(),
            new ADBannerData_Spin2Win(),
            new ADBannerData_SeasonPromotion_Shop(),
            new ADBannerData_SecretStash(),
            new ADBannerData_SeasonEndOffer(),
            new ADBannerData_AllInOffer(),
            new ADBannerData_CardPackX2(),
            new ADBannerData_DailyTopUp(),
            new ADBannerData_MiniGame()
        ];
    }

    /**
     * 从横幅数据数组中提取符合条件的类型数组
     * @param bannerArray 横幅数据数组
     * @param prefabType 预制体类型
     * @param maxCount 最大数量
     */
    private getTypeArray(bannerArray: ADBannerData[], prefabType: ADBannerPrefabType, maxCount: number): ADBannerInfoType[] {
        const validBanners: ADBannerData[] = [];
        
        // 筛选符合条件的横幅
        for (let i = 0; i < bannerArray.length; i++) {
            const banner = bannerArray[i];
            if (TSUtility.isValid(banner) && banner.isAppendBanner(validBanners)) {
                validBanners.push(banner);
                if (validBanners.length >= maxCount) break;
            }
        }

        // 提取不重复的类型
        const typeSet = new Set<ADBannerInfoType>();
        for (let i = 0; i < validBanners.length; i++) {
            const type = validBanners[i].getType();
            if (type && !typeSet.has(type)) {
                typeSet.add(type);
            }
        }

        return Array.from(typeSet);
    }
}