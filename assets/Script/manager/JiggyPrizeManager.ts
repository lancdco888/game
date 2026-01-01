const { ccclass } = cc._decorator;

// 导入所有依赖模块，路径与原JS完全一致，无需修改
import TSUtility from "../global_utility/TSUtility";
import UserInfo from "../User/UserInfo";
import UserPromotion from "../User/UserPromotion";

/**
 * Jiggy拼图活动奖品管理器 - 全局单例模式
 * 核心功能：校验Jiggy活动是否可用、根据用户等级/VIP获取投注金额上限、判断投注是否超限、刷新活动剩余时间
 * 强联动：UserInfo(用户信息) / UserPromotion(活动配置) / TSUtility(工具类)
 */
@ccclass("JiggyPrizeManager")
export default class JiggyPrizeManager extends cc.Component {
    // ===================== 【全局单例核心】原JS完整还原，唯一实例，全局调用：JiggyPrizeManager.instance =====================
    private static _instance: JiggyPrizeManager | null = null;

    public static get instance(): JiggyPrizeManager {
        if (this._instance === null) {
            this._instance = new JiggyPrizeManager();
        }
        return this._instance;
    }

    // ===================== 【核心业务方法】原JS所有方法100%复刻，逻辑/数值/条件判断完全一致 =====================
    /**
     * 校验Jiggy拼图活动是否可用
     * @returns boolean 活动是否开启/可用
     */
    public isAvailable(): boolean {
        const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.JiggyPuzzlePromotion.PromotionKeyName);
        return TSUtility.isValid(promotionInfo) 
            && promotionInfo.isAvailable() 
            && promotionInfo.curStage > 0 
            && UserPromotion.JiggyPuzzlePromotion.isLevelLimit();
    }

    /**
     * 根据用户等级 + VIP等级 获取投注金额上限
     * 原JS数值常量完全复刻：27000/54000/108000/270000/540000
     * @returns number 投注限额金币数
     */
    public getBettingLimitCoin(): number {
        // 玩家等级 < 20级 固定限额 27000
        if (UserInfo.instance().getUserLevelInfo().level < 20) {
            return 27000;
        }
        
        // 等级≥20级 按VIP等级阶梯限额
        const userVipInfo = UserInfo.instance().getUserVipInfo();
        if (userVipInfo.level <= 1) {
            return 54000;
        } else if (userVipInfo.level <= 3) {
            return 108000;
        } else if (userVipInfo.level <= 5) {
            return 270000;
        } else {
            return 540000;
        }
    }

    /**
     * 判断当前投注金额是否超出上限
     * @param betCoin 当前投注的金币数
     * @returns boolean true=投注金额低于限额(可用) false=投注金额超限(不可用)
     */
    public isBettingLimit(betCoin: number): boolean {
        return this.getBettingLimitCoin() > betCoin;
    }

    /**
     * 更新Jiggy活动奖品剩余时间，超时则清理所有定时器
     * 原JS核心逻辑：活动过期后自动停止所有调度任务，无内存泄漏
     */
    public updatePrizeRemainTime(): void {
        const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.PromotionKeyName);
        const remainTime = promotionInfo.endDate - TSUtility.getServerBaseNowUnixTime();
        if (remainTime <= 0) {
            this.unscheduleAllCallbacks();
        }
    }
}