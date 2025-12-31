const { ccclass, property } = cc._decorator;
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import UserInfo from "../User/UserInfo";
import UserPromotion from "../User/UserPromotion";
import MessageRoutingManager from "../message/MessageRoutingManager";

/**
 * 时间奖励核心管理类 - 继承cc.Component + 全局单例 原JS逻辑100%完整复刻
 */
@ccclass
export default class TimeBonusManager extends cc.Component {
    // ===================== 原JS所有常量 数值完全一致 一字不改 优先级置顶 =====================
    public readonly SPIN_BOOSTER_LEVEL_DATA_GROUP_A = [
        { key: 1, value: { exp: 0, multiplier: 1 } },
        { key: 2, value: { exp: 5000000, multiplier: 2 } },
        { key: 3, value: { exp: 30000000, multiplier: 3 } },
        { key: 4, value: { exp: 90000000, multiplier: 4 } },
        { key: 5, value: { exp: 350000000, multiplier: 5 } },
        { key: 6, value: { exp: 1500000000, multiplier: 10 } }
    ];

    public readonly SPIN_BOOSTER_LEVEL_DATA_GROUP_B = [
        { key: 1, value: { exp: 0, multiplier: 1 } },
        { key: 2, value: { exp: 30000000, multiplier: 2 } },
        { key: 3, value: { exp: 125000000, multiplier: 3 } },
        { key: 4, value: { exp: 400000000, multiplier: 4 } },
        { key: 5, value: { exp: 1500000000, multiplier: 5 } },
        { key: 6, value: { exp: 6000000000, multiplier: 10 } }
    ];

    public readonly SPIN_BOOSTER_LEVEL_DATA_GROUP_C = [
        { key: 1, value: { exp: 0, multiplier: 1 } },
        { key: 2, value: { exp: 100000000, multiplier: 2 } },
        { key: 3, value: { exp: 350000000, multiplier: 3 } },
        { key: 4, value: { exp: 1200000000, multiplier: 4 } },
        { key: 5, value: { exp: 6000000000, multiplier: 5 } },
        { key: 6, value: { exp: 25000000000, multiplier: 10 } }
    ];

    public readonly SPIN_BOOSTER_LEVEL_DATA_GROUP_D = [
        { key: 1, value: { exp: 0, multiplier: 1 } },
        { key: 2, value: { exp: 450000000, multiplier: 2 } },
        { key: 3, value: { exp: 1500000000, multiplier: 3 } },
        { key: 4, value: { exp: 5000000000, multiplier: 4 } },
        { key: 5, value: { exp: 17500000000, multiplier: 5 } },
        { key: 6, value: { exp: 150000000000, multiplier: 10 } }
    ];

    public readonly WHEEL_BONUS_PRIZE_INFO = [10000000, 400000, 1000000, 300000, 1000000, 350000, 1500000, 700000, 5000000, 500000, 1250000, 350000, 3000000, 300000, 2000000, 600000];
    public readonly WHEEL_BONUS_VIP_INFO = [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2, 2.5, 4];
    public readonly WHEEL_BONUS_PURCHASE_MULTIPLIER = [
        { key: 1, value: 100 },
        { key: 2, value: 120 },
        { key: 3, value: 130 },
        { key: 4, value: 135 },
        { key: 5, value: 175 },
        { key: 10, value: 200 }
    ];

    public readonly WHEEL_BONUS_GAUGE_MAX: number = 5;
    public readonly COIN_SHOWER_GAUGE_MAX: number = 3;

    // ===================== 私有成员变量 与原JS完全一致 补全强类型 =====================
    private static _instance: TimeBonusManager = null!;
    private _numExpireTime: number = 0;

    // ===================== 全局单例模式 - 原JS的get instance()访问器 完美还原 =====================
    public static get instance(): TimeBonusManager {
        if (!TimeBonusManager._instance) {
            TimeBonusManager._instance = new TimeBonusManager();
        }
        return TimeBonusManager._instance;
    }

    onLoad() { }

    // ===================== 所有公有方法 与原JS顺序一致/逻辑一致/无任何增减 1:1复刻 =====================
    public initialize(): void {
        this._numExpireTime = this.getExpirePSTTime();
        this.unscheduleAllCallbacks();
        this.schedule(this.updateTimeBonus, 1);
    }

    public updateTimeBonus(): void {
        if (this._numExpireTime !== this.getExpirePSTTime()) {
            this._numExpireTime = this.getExpirePSTTime();
            const userServiceInfo = UserInfo.instance().getUserServiceInfo();
            if (TSUtility.isValid(userServiceInfo)) {
                userServiceInfo.spinBooster = 1;
                userServiceInfo.dailyAccBetCoinTimeBonus = 0;
            }
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REWARD_CENTER_UPDATE_UI_SPIN_BOOSTER);
            MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REWARD_CENTER_UPDATE_UI_TIME_BONUS);
        }
    }

    public getExpirePSTTime(): number {
        const serverUnixTime = TSUtility.getServerBaseNowUnixTime();
        return TSUtility.getServerBasePstBaseTime(serverUnixTime);
    }

    public getSpinBoosterExp(): number {
        const userServiceInfo = UserInfo.instance().getUserServiceInfo();
        return !TSUtility.isValid(userServiceInfo) ? 0 : userServiceInfo.dailyAccBetCoinTimeBonus;
    }

    public addSpinBoosterExp(expVal: number): void {
        const userServiceInfo = UserInfo.instance().getUserServiceInfo();
        if (TSUtility.isValid(userServiceInfo)) {
            userServiceInfo.dailyAccBetCoinTimeBonus += expVal;
            userServiceInfo.spinBooster = this.getSpinBoosterMultiplierByExp(userServiceInfo.dailyAccBetCoinTimeBonus);
        }
        MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.REWARD_CENTER_UPDATE_UI_SPIN_BOOSTER);
    }

    public getWheelBonusGauge(): number {
        const itemList = UserInfo.instance().getItemInventory().getItemsByItemId(SDefine.I_DAILY_BONUS_WHEEL_TICKET);
        let totalCnt = 0;
        for (let i = 0; i < itemList.length; ++i) {
            totalCnt += itemList[i].curCnt;
        }
        return totalCnt;
    }

    public getCoinShowerGauge(): number {
        const itemList = UserInfo.instance().getItemInventory().getItemsByItemId(SDefine.I_COIN_SHOWER_TICKET);
        let totalCnt = 0;
        for (let i = 0; i < itemList.length; ++i) {
            totalCnt += itemList[i].curCnt;
        }
        return totalCnt;
    }

    public getSpinBoosterLevelData(): Array<any> {
        const userServiceInfo = UserInfo.instance().getUserServiceInfo();
        if (!TSUtility.isValid(userServiceInfo)) return this.SPIN_BOOSTER_LEVEL_DATA_GROUP_A;
        if (!TSUtility.isValid(userServiceInfo.SpinBoosterGroup)) return this.SPIN_BOOSTER_LEVEL_DATA_GROUP_A;
        
        switch (userServiceInfo.SpinBoosterGroup) {
            case "A": return this.SPIN_BOOSTER_LEVEL_DATA_GROUP_A;
            case "B": return this.SPIN_BOOSTER_LEVEL_DATA_GROUP_B;
            case "C": return this.SPIN_BOOSTER_LEVEL_DATA_GROUP_C;
            case "D": return this.SPIN_BOOSTER_LEVEL_DATA_GROUP_D;
            default: return this.SPIN_BOOSTER_LEVEL_DATA_GROUP_A;
        }
    }

    public getSpinBoosterMaxLevel(): number {
        const levelData = this.getSpinBoosterLevelData();
        return !TSUtility.isValid(levelData) ? 0 : levelData.length;
    }

    public getSpinBoosterData(level: number): any | null {
        const levelData = this.getSpinBoosterLevelData();
        for (let i = 0; i < levelData.length; i++) {
            const item = levelData[i];
            if (!TSUtility.isValid(item) && item.key === level) {
                return item.value;
            }
        }
        return null;
    }

    public getSpinBoosterCurLevel(): number {
        return this.getSpinBoosterLevel(this.getSpinBoosterExp());
    }

    public getSpinBoosterLevel(expVal: number): number {
        const levelData = this.getSpinBoosterLevelData();
        let curLevel = 0;
        for (let i = 0; i < levelData.length; i++) {
            const item = levelData[i];
            if (TSUtility.isValid(item)) {
                if (expVal < item.value.exp) break;
                curLevel = item.key;
            }
        }
        return curLevel;
    }

    public getSpinBoosterMultiplierByExp(expVal: number): number {
        const curLevel = this.getSpinBoosterLevel(expVal);
        return curLevel <= 0 ? 0 : this.getSpinBoosterMultiplier(curLevel);
    }

    public getSpinBoosterMultiplier(level: number): number {
        if (level <= 0) return 1;
        const boosterData = this.getSpinBoosterData(level);
        return !TSUtility.isValid(boosterData) ? 1 : boosterData.multiplier;
    }

    public getCurSpinBoosterMultiplier(): number {
        const userServiceInfo = UserInfo.instance().getUserServiceInfo();
        return !TSUtility.isValid(userServiceInfo) ? 1 : userServiceInfo.spinBooster;
    }

    public getCurSpinBoosterExpRatio(): number {
        const levelData = this.getSpinBoosterLevelData();
        if (!TSUtility.isValid(levelData)) return 0;

        const curLevel = this.getSpinBoosterCurLevel();
        if (curLevel >= this.getSpinBoosterMaxLevel()) return 1;

        const curExp = this.getSpinBoosterExp();
        const curLevelExp = this.getSpinBoosterData(curLevel).exp;
        const nextLevelExp = this.getSpinBoosterData(curLevel + 1).exp;
        return (curExp - curLevelExp) / (nextLevelExp - curLevelExp);
    }

    public isAvailableWheelBonus(): boolean {
        return this.getWheelBonusGauge() >= this.WHEEL_BONUS_GAUGE_MAX;
    }

    public isAvailableCoinShower(): boolean {
        return this.getCoinShowerGauge() >= this.COIN_SHOWER_GAUGE_MAX;
    }

    public isAvailableRainbowDice(): boolean {
        const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.RainbowDiceBonusPromotion.PromotionKeyName);
        if (!TSUtility.isValid(promotionInfo)) return false;
        
        const serverNow = TSUtility.getServerBaseNowUnixTime();
        return (promotionInfo.nextReceiveTime - serverNow) <= 0;
    }

    public isAvailableFireDice(): boolean {
        const promotionInfo = UserInfo.instance().getPromotionInfo(UserPromotion.FireDiceBonusPromotion.PromotionKeyName);
        if (!TSUtility.isValid(promotionInfo)) return false;
        
        const serverNow = TSUtility.getServerBaseNowUnixTime();
        return (promotionInfo.nextReceiveTime - serverNow) <= 0;
    }

    public getCurWheelBonusPurchaseMultiplier(): number {
        return this.getWheelBonusPurchaseMultiplier(this.getCurSpinBoosterMultiplier());
    }

    public getWheelBonusPurchaseMultiplier(multiplier: number): number {
        const purchaseData = this.WHEEL_BONUS_PURCHASE_MULTIPLIER;
        for (let i = 0; i < purchaseData.length; i++) {
            const item = purchaseData[i];
            if (TSUtility.isValid(item) && item.key === multiplier) {
                return item.value;
            }
        }
        return 100;
    }
}