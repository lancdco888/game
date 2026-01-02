const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import UserPromotion, { WatchRewardAdPromotion, ADREWARDTYPE } from "./../User/UserPromotion";
import UserInfo from "../User/UserInfo";
import ServiceInfoManager from "../ServiceInfoManager";
import TSUtility from "../global_utility/TSUtility";
import SDefine from "../global_utility/SDefine";
import FBInstantUtil from "../Network/FBInstantUtil";
import AdsManager from "../Utility/AdsManager";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import { Utility } from "../global_utility/Utility";

/**
 * 广告投放策略管理器 - 单例模式
 * 全局统一管理所有广告位的显示条件、多平台适配、广告次数/时间校验，是广告核心策略类
 */
@ccclass
export default class ADTargetManager extends cc.Component {
    // ✅ 单例核心 - 静态私有实例 + 全局访问方法 完整保留原逻辑 一字不差
    private static _instance: ADTargetManager = null;
    public static instance(): ADTargetManager {
        if (ADTargetManager._instance == null) {
            ADTargetManager._instance = new ADTargetManager();
        }
        return ADTargetManager._instance;
    }

    // ===================== 私有成员变量 与原JS完全一致 补全类型注解+初始化值 =====================
    private maxCountInboxAllinReward: number = 7;

    // ==============================================================
    // ✅ 所有广告启用条件校验方法 与原JS逻辑一字不差 完整保留所有分支+判断+多平台适配
    // 全部保留原项目【0 == xxx / 1 == xxx】核心判断风格 未做任何布尔值修改
    // ==============================================================
    /** 校验：时间奖励广告是否启用 */
    public enableTimeBonus(): boolean {
        return AdsManager.Instance().isReadyRewardedAD() 
            && (SDefine.AD_Target_Test 
                || Utility.isMobileGame() 
                || Utility.isFacebookInstant());
    }

    /** 校验：一键领取广告是否启用 */
    public enableCollectAll(): boolean {
        return AdsManager.Instance().isReadyRewardedAD() 
            && (SDefine.AD_Target_Test 
                || (Utility.isMobileGame() && 0 == UserInfo.instance().getPurchaseInfo().cntIn30Days) 
                || Utility.isFacebookInstant());
    }

    /** 校验：收件箱-普通奖励广告是否启用 */
    public enableInboxReward_Normal(): boolean {
        if (SDefine.AD_Target_Test) return true;

        if (Utility.isMobileGame()) {
            if (TSUtility.getADMode()) return true;
            const promotionInfo = UserInfo.instance().getPromotionInfo(WatchRewardAdPromotion.PromotionKeyName);
            if (!this.enableInboxReward_AllIn() && promotionInfo.receiveCountMapper[ADREWARDTYPE.Inbox_Normal] < 15) {
                return true;
            }
        }

        if (Utility.isFacebookInstant()) {
            if (FBInstantUtil.isTargetPlatform([FBInstantUtil.PLATFORM_IOS, FBInstantUtil.PLATFORM_ANDROID]) 
                && ServiceInfoManager.instance.isLobbyEnterUnder2NewbieTarget()) {
                return false;
            }
            
            UserInfo.instance().getPurchaseInfo().cntIn30Days;
            const promotionInfo = UserInfo.instance().getPromotionInfo(WatchRewardAdPromotion.PromotionKeyName);
            if (SDefine.FB_Instant_iOS_Shop_Flag) {
                if (promotionInfo.receiveCountMapper[ADREWARDTYPE.Inbox_Normal] < 15) return true;
            } else if (!this.enableInboxReward_AllIn() && promotionInfo.receiveCountMapper[ADREWARDTYPE.Inbox_Normal] < 15) {
                return true;
            }
        }
        return false;
    }

    /** 校验：收件箱-全押奖励广告是否启用 */
    public enableInboxReward_AllIn(): boolean {
        if (SDefine.AD_Target_Test) return true;

        if (Utility.isMobileGame()) {
            UserInfo.instance().getPurchaseInfo().cntIn30Days;
            ServiceInfoManager.instance.getUserLevel();
            const totalCoin = UserInfo.instance().getTotalCoin();
            const promotionInfo = UserInfo.instance().getPromotionInfo(WatchRewardAdPromotion.PromotionKeyName);
            const isAllIn = ServiceInfoManager.BOOL_ALL_IN;
            let receiveCount = 0;

            if (TSUtility.isValid(promotionInfo.receiveCountMapper[ADREWARDTYPE.Inbox_Allin_Renewal])) {
                receiveCount = promotionInfo.receiveCountMapper[ADREWARDTYPE.Inbox_Allin_Renewal];
            }
            if (isAllIn && totalCoin <= 1000000 && receiveCount < this.maxCountInboxAllinReward) {
                return true;
            }
        }

        if (Utility.isFacebookInstant()) {
            if (FBInstantUtil.isTargetPlatform([FBInstantUtil.PLATFORM_IOS, FBInstantUtil.PLATFORM_ANDROID]) 
                && ServiceInfoManager.instance.isLobbyEnterUnder2NewbieTarget()) {
                return false;
            }

            UserInfo.instance().getPurchaseInfo().cntIn30Days;
            const totalCoin = UserInfo.instance().getTotalCoin();
            const promotionInfo = UserInfo.instance().getPromotionInfo(WatchRewardAdPromotion.PromotionKeyName);
            const isAllIn = ServiceInfoManager.BOOL_ALL_IN;
            let receiveCount = 0;

            if (TSUtility.isValid(promotionInfo.receiveCountMapper[ADREWARDTYPE.Inbox_Allin_Renewal])) {
                receiveCount = promotionInfo.receiveCountMapper[ADREWARDTYPE.Inbox_Allin_Renewal];
            }
            if (SDefine.FB_Instant_iOS_Shop_Flag) {
                if (isAllIn && totalCoin <= 3000000 && receiveCount < this.maxCountInboxAllinReward) return true;
            } else if (isAllIn && totalCoin <= 1000000 && receiveCount < this.maxCountInboxAllinReward) {
                return true;
            }
        }
        return false;
    }

    /** 校验：Bingo游戏广告是否启用 */
    public enableBingo(): boolean {
        if (!AdsManager.Instance().isReadyRewardedAD()) return false;
        if (SDefine.AD_Target_Test) return true;

        if (Utility.isMobileGame()) {
            const promotionInfo = UserInfo.instance().getPromotionInfo(WatchRewardAdPromotion.PromotionKeyName);
            if (promotionInfo.receiveCountMapper[ADREWARDTYPE.BingoBall] < 5) return true;
        }

        if (Utility.isFacebookInstant()) {
            const promotionInfo = UserInfo.instance().getPromotionInfo(WatchRewardAdPromotion.PromotionKeyName);
            if (SDefine.FB_Instant_iOS_Shop_Flag) {
                if (promotionInfo.receiveCountMapper[ADREWARDTYPE.BingoBall] < 5) return true;
            } else if (promotionInfo.receiveCountMapper[ADREWARDTYPE.BingoBall] < 5) {
                return true;
            }
        }
        return false;
    }

    /** 校验：移动端 插屏广告基础投放条件 */
    public enableBasicConditionInterstitial_ForMobile(): boolean {
        const totalPurchaseCnt = UserInfo.instance().getUserServiceInfo().totalPurchaseCnt;
        if (totalPurchaseCnt > 0) {
            cc.log("enableDevMobileBasicCondition purchaseCount %s".format(totalPurchaseCnt.toString()));
            return false;
        }

        if (!ServiceInfoManager.instance.isOverCerateSevenDay()) {
            cc.log("enableDevMobileBasicCondition isOverCerateSevenDay");
            return false;
        }

        if (UserInfo.instance().getEightySpinCount() < 10) {
            cc.log("enableDevMobileBasicCondition spinCnt %s".format(10..toString()));
            return false;
        }

        if (this.getLastTime() + 600 >= TSUtility.getServerBaseNowUnixTime()) {
            cc.log("enableDevMobileBasicCondition getInterstitialAdLastTime");
            return false;
        }

        if (TSUtility.getServerBaseNowUnixTime() - ServerStorageManager.getAsNumber(StorageKeyType.ADS_FREE) <= 86400) {
            return false;
        }

        const playTime = this.getPlayTime();
        const pstPlayTime = TSUtility.getServerBasePstBaseTime(playTime);
        const pstNowTime = TSUtility.getServerBasePstBaseTime(TSUtility.getServerBaseNowUnixTime());
        const adPlayCount = this.getADPlayCount();

        return !(pstNowTime <= pstPlayTime && adPlayCount >= 3 && (cc.log("enableDevMobileBasicCondition playCount %s".format(adPlayCount.toString())), 1));
    }

    /** 校验：FB小游戏 插屏广告基础投放条件 (保留原文件【Baic】拼写错误 不修改) */
    public enableBaicConditionInterstitial_Instant(): boolean {
        if (!Utility.isFacebookInstant()) return false;
        if (TSUtility.getServerBaseNowUnixTime() - ServerStorageManager.getAsNumber(StorageKeyType.ADS_FREE) <= 86400) return false;
        
        if (!SDefine.FB_Instant_iOS_Shop_Flag && UserInfo.instance().getUserServiceInfo().totalPurchaseCnt > 0) {
            return false;
        }

        if (FBInstantUtil.isTargetPlatform([FBInstantUtil.PLATFORM_IOS, FBInstantUtil.PLATFORM_ANDROID])) {
            if (ServiceInfoManager.instance.isLobbyEnterUnder2NewbieTarget()) return false;
        } else if (!ServiceInfoManager.instance.isOverCerateSevenDay()) {
            return false;
        }

        const spinLimit = SDefine.FB_Instant_iOS_Shop_Flag ? 1 : 10;
        if (UserInfo.instance().getEightySpinCount() < spinLimit) return false;

        const timeLimit = SDefine.FB_Instant_iOS_Shop_Flag ? 5 : 10;
        if (this.getLastTime() + 60 * timeLimit >= TSUtility.getServerBaseNowUnixTime()) return false;

        const playTime = this.getPlayTime();
        const pstPlayTime = TSUtility.getServerBasePstBaseTime(playTime);
        const pstNowTime = TSUtility.getServerBasePstBaseTime(TSUtility.getServerBaseNowUnixTime());
        const adPlayCount = this.getADPlayCount();
        const countLimit = Utility.isMobileGame() ? 3 : SDefine.FB_Instant_iOS_Shop_Flag ? 5 : 3;

        return !(pstNowTime <= pstPlayTime && adPlayCount >= countLimit && (cc.log("enableBaicConditionInterstitial_Instant playCount %s".format(adPlayCount.toString())), 1));
    }

    /** 核心对外方法：校验 插屏广告是否可播放 (总入口) */
    public enableInterstitialAD(isReadyCheck: boolean = true): boolean {
        return !Utility.isFacebookWeb() 
            && (!isReadyCheck ||AdsManager.Instance().isReadyInterstitialAD()) 
            && (SDefine.AD_Target_Test 
                || (Utility.isMobileGame() 
                    ? (TSUtility.isDevService() ? this.enableDevMobileBasicCondition() : this.enableBasicConditionInterstitial_ForMobile()) 
                    : (!!Utility.isFacebookInstant() && this.enableBaicConditionInterstitial_Instant())));
    }

    /** 校验：开发环境-移动端 插屏广告投放条件 */
    public enableDevMobileBasicCondition(): boolean {
        const totalPurchaseCnt = UserInfo.instance().getUserServiceInfo().totalPurchaseCnt;
        if (totalPurchaseCnt > 0) {
            cc.log("enableDevMobileBasicCondition purchaseCount %s".format(totalPurchaseCnt.toString()));
            return false;
        }

        if (UserInfo.instance().getEightySpinCount() < 1) {
            cc.log("enableDevMobileBasicCondition spinCnt %s".format(1..toString()));
            return false;
        }

        if (this.getLastTime() + 30 >= TSUtility.getServerBaseNowUnixTime()) {
            cc.log("enableDevMobileBasicCondition getInterstitialAdLastTime");
            return false;
        }

        const playTime = this.getPlayTime();
        const pstPlayTime = TSUtility.getServerBasePstBaseTime(playTime);
        const pstNowTime = TSUtility.getServerBasePstBaseTime(TSUtility.getServerBaseNowUnixTime());
        const adPlayCount = this.getADPlayCount();

        return !(TSUtility.getServerBaseNowUnixTime() - ServerStorageManager.getAsNumber(StorageKeyType.ADS_FREE) <= 86400 
            || (pstNowTime <= pstPlayTime && adPlayCount >= 100 && (cc.log("enableDevMobileBasicCondition playCnt %s".format(100..toString())), 1)));
    }

    // ==============================================================
    // ✅ 广告数据读取方法 多平台适配逻辑完整复刻 分支无删减 存储KEY精准匹配
    // ==============================================================
    /** 获取：插屏广告最后播放时间 (按平台区分存储KEY) */
    public getLastTime(): number {
        if (Utility.isFacebookWeb()) {
            return ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_LAST_TIME_CANVAS);
        } else if (Utility.isMobileGame() && cc.sys.os === cc.sys.OS_ANDROID) {
            return ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_LAST_TIME_AOS);
        } else if (Utility.isMobileGame() && cc.sys.os === cc.sys.OS_IOS) {
            return ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_LAST_TIME_IOS);
        } else if (Utility.isFacebookInstant()) {
            return ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_LAST_TIME_INSTANT);
        }
        return 0;
    }

    /** 获取：插屏广告累计播放次数 (按平台区分存储KEY) */
    public getADPlayCount(): number {
        if (Utility.isFacebookWeb()) {
            return ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_PLAY_COUNT_CANVAS);
        } else if (Utility.isMobileGame() && cc.sys.os === cc.sys.OS_ANDROID) {
            return ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_PLAY_COUNT_AOS);
        } else if (Utility.isMobileGame() && cc.sys.os === cc.sys.OS_IOS) {
            return ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_PLAY_COUNT_IOS);
        } else if (Utility.isFacebookInstant()) {
            return ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_PLAY_COUNT_INSTANT);
        }
        return 0;
    }

    /** 获取：插屏广告播放基准时间 (按平台区分存储KEY) */
    public getPlayTime(): number {
        if (Utility.isFacebookWeb()) {
            return ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_PLAY_TIME_CANVAS);
        } else if (Utility.isMobileGame() && cc.sys.os === cc.sys.OS_ANDROID) {
            return ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_PLAY_TIME_AOS);
        } else if (Utility.isMobileGame() && cc.sys.os === cc.sys.OS_IOS) {
            return ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_PLAY_TIME_IOS);
        } else if (Utility.isFacebookInstant()) {
            return ServerStorageManager.getAsNumber(StorageKeyType.INTERSTITIAL_AD_PLAY_TIME_INSTANT);
        }
        return 0;
    }
}