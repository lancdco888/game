const { ccclass, property } = cc._decorator;

import PayCode from "../../Config/PayCode";
import SDefine from "../../global_utility/SDefine";
import MembersClassBoostUpManager from "../../../ServiceInfo/MembersClassBoostUpManager";
import MembersClassBoostUpNormalManager from "../../../ServiceInfo/MembersClassBoostUpNormalManager";
import UserInfo from "../../User/UserInfo";
import TSUtility from "../../global_utility/TSUtility";
import ServerStorageManager, { StorageKeyType } from "../../manager/ServerStorageManager";

@ccclass
export default class DailyStampManager extends cc.Component {
    // ====================== 每日签到奖励常量配置 【原数据完整保留】 ======================
    private DAILY_STAMP_REWARD_DATA = [
        { key: 1, value: { Coin: 250000 } },
        { key: 2, value: { Coin: 450000 } },
        { key: 3, value: { Coin: 1400000 } },
        { key: 4, value: { Coin: 1750000 } },
        { key: 5, value: { Coin: 2000000 } },
        { key: 6, value: { Coin: 2500000 } },
        { key: 7, value: { Coin: 4000000, "4_CardPack": 1, "5_CardPack": 1 } }
    ];

    private DAILY_STAMP_PURCHASER_REWARD_DATA = [
        { key: 1, value: { Coin: 4250000 } },
        { key: 2, value: { Coin: 7650000 } },
        { key: 3, value: { Coin: 23800000 } },
        { key: 4, value: { Coin: 29750000 } },
        { key: 5, value: { Coin: 34000000, "4_CardPack": 1, "5_CardPack": 1 } },
        { key: 6, value: { Coin: 42500000 } },
        { key: 7, value: { Coin: 68000000, "4_CardPack": 1, "5_CardPack": 1, RandomCardPack: 1 } }
    ];

    private DAILY_STAMP_ACCUMULATED_REWARD_DATA = [
        { key: 3, value: { Coin: 1500000 } },
        { key: 8, value: { Coin: 4000000, FlipACoin: 0.99, LevelBoost_30: 1 } },
        { key: 15, value: { Coin: 6000000, Emoji777: 1.99, StarLightPoints: 300 } },
        { key: 22, value: { Coin: 8500000, PiggyBank: 2.99, Pass: 1 } },
        { key: 30, value: { Coin: 12000000, BingoCard: 2, JokerCard: 1, Coupon: 3 } }
    ];

    private DAILY_STAMP_ACCUMULATED_GAGE_DATA = [
        { key: 0, value: 0 }, { key: 1, value: 46 }, { key: 2, value: 26 }, { key: 3, value: 30 }, { key: 4, value: 48 },
        { key: 5, value: 26 }, { key: 6, value: 26 }, { key: 7, value: 26 }, { key: 8, value: 46 }, { key: 9, value: 36 },
        { key: 10, value: 20 }, { key: 11, value: 20 }, { key: 12, value: 20 }, { key: 13, value: 20 }, { key: 14, value: 20 },
        { key: 15, value: 36 }, { key: 16, value: 36 }, { key: 17, value: 20 }, { key: 18, value: 20 }, { key: 19, value: 20 },
        { key: 20, value: 20 }, { key: 21, value: 20 }, { key: 22, value: 36 }, { key: 23, value: 38 }, { key: 24, value: 16 },
        { key: 25, value: 16 }, { key: 26, value: 16 }, { key: 27, value: 16 }, { key: 28, value: 16 }, { key: 29, value: 16 },
        { key: 30, value: 60 }
    ];

    private DAILY_STAMP_ACCUMULATED_GAGE_REWARD_CENTER_DATA = [
        { key: 0, value: 0 }, { key: 1, value: 28 }, { key: 2, value: 28 }, { key: 3, value: 30 }, { key: 4, value: 48 },
        { key: 5, value: 28 }, { key: 6, value: 28 }, { key: 7, value: 28 }, { key: 8, value: 48 }, { key: 9, value: 36 },
        { key: 10, value: 22 }, { key: 11, value: 22 }, { key: 12, value: 22 }, { key: 13, value: 22 }, { key: 14, value: 22 },
        { key: 15, value: 36 }, { key: 16, value: 36 }, { key: 17, value: 22 }, { key: 18, value: 22 }, { key: 19, value: 22 },
        { key: 20, value: 22 }, { key: 21, value: 22 }, { key: 22, value: 36 }, { key: 23, value: 38 }, { key: 24, value: 16 },
        { key: 25, value: 16 }, { key: 26, value: 16 }, { key: 27, value: 16 }, { key: 28, value: 16 }, { key: 29, value: 16 },
        { key: 30, value: 65 }
    ];

    private DAILY_STAMP_CONSECUTIVE_PAY_CODE = [];
    private DAILY_STAMP_ACCUMULATED_PAY_CODE = [];

    // ====================== 私有成员变量 ======================
    private _numAccumulatedDay: number = 0;
    private _numConsecutiveDay: number = 0;
    private _numNextReceivedTime: number = 0;
    private _numVersion: number = 0;
    private _purchaseChangeResult: any = null;
    private _unProcessedChangeResult: any = null;
    private _isNextDayUnProcessed: boolean = false;
    private _isRewardCenter: boolean = false;

    // ====================== 单例模式 【完整保留原逻辑 懒加载初始化】 ======================
    private static _instance: DailyStampManager = null;
    public static get instance(): DailyStampManager {
        if (DailyStampManager._instance == null) {
            DailyStampManager._instance = new DailyStampManager();
            DailyStampManager._instance.initialize();
        }
        return DailyStampManager._instance;
    }

    // ====================== 初始化方法 ======================
    public initialize(): void {
        // 初始化连续签到支付码配置
        this.DAILY_STAMP_CONSECUTIVE_PAY_CODE.push(PayCode.default.CoinPayCodeDailyStampV2ConsecutiveReward);
        this.DAILY_STAMP_CONSECUTIVE_PAY_CODE.push(PayCode.default.CardPackPayCodeDailyStampV2ConsecutiveReward);
        this.DAILY_STAMP_CONSECUTIVE_PAY_CODE.push(PayCode.default.CoinPayCodeDailyStampV2PremiumReward);
        this.DAILY_STAMP_CONSECUTIVE_PAY_CODE.push(PayCode.default.CardPackPayCodeDailyStampV2PremiumReward);
        
        // 初始化累计签到支付码配置
        this.DAILY_STAMP_ACCUMULATED_PAY_CODE.push(PayCode.default.CoinPayCodeDailyStampV2AccumulatedReward);
        this.DAILY_STAMP_ACCUMULATED_PAY_CODE.push(PayCode.default.ItemPayCodeDailyStampV2AccumulatedFlipCoinReward);
        this.DAILY_STAMP_ACCUMULATED_PAY_CODE.push(PayCode.default.ItemPayCodeDailyStampV2AccumulatedEmoji777Reward);
        this.DAILY_STAMP_ACCUMULATED_PAY_CODE.push(PayCode.default.ItemPayCodeDailyStampV2AccumulatedLevelUpBoosterReward);
        this.DAILY_STAMP_ACCUMULATED_PAY_CODE.push(PayCode.default.ItemPayCodeDailyStampV2AccumulatedStarlightShopCoinReward);
        this.DAILY_STAMP_ACCUMULATED_PAY_CODE.push(PayCode.default.CoinPayCodeDailyStampV2AccumulatedFullPiggyBankCoinReward);
        this.DAILY_STAMP_ACCUMULATED_PAY_CODE.push(PayCode.default.ItemPayCodeDailyStampV2AccumulatedMPassReward);
        this.DAILY_STAMP_ACCUMULATED_PAY_CODE.push(PayCode.default.ItemPayCodeDailyStampV2AccumulatedSuitePassReward);
        this.DAILY_STAMP_ACCUMULATED_PAY_CODE.push(PayCode.default.CoinPayCodeDailyStampV2AccumulatedPassReward);
        this.DAILY_STAMP_ACCUMULATED_PAY_CODE.push(PayCode.default.ItemPayCodeDailyStampV2AccumulatedBingoCardReward);
        this.DAILY_STAMP_ACCUMULATED_PAY_CODE.push(PayCode.default.ItemPayCodeDailyStampV2AccumulatedJokerCardReward);
        this.DAILY_STAMP_ACCUMULATED_PAY_CODE.push(PayCode.default.ItemPayCodeDailyStampV2AccumulatedMainShopCouponReward);
    }

    // ====================== 对外暴露核心方法 【原逻辑完全保留】 ======================
    public setDailyStampV2Promotion(data: any): void {
        this._numAccumulatedDay = data.accumulatedDays;
        this._numConsecutiveDay = data.consecutiveDays;
        this._numVersion = data.version;
        this.setDailyStampNextReceivedTime(data.nextReceivedTime);
    }

    public setSameDayUnProcessedInfo(data: any): void {
        if (TSUtility.default.isValid(data) !== 0) {
            this._unProcessedChangeResult = data;
            this._numConsecutiveDay = this._numConsecutiveDay - 1;
            if (this._numConsecutiveDay <= 0) {
                this._numConsecutiveDay = 7;
            }
        }
    }

    public setNextDaySameDayUnProcessedInfo(): void {
        this._isNextDayUnProcessed = true;
    }

    public getSameDayUnProcessedInfo(): any {
        return this._unProcessedChangeResult;
    }

    public isSameDayUnProcessed(): boolean {
        return TSUtility.default.isValid(this._unProcessedChangeResult) === 1;
    }

    public isNextDayUnProcessed(): boolean {
        return this._isNextDayUnProcessed;
    }

    public setDailyStampNextReceivedTime(time: number): void {
        this._numNextReceivedTime = time;
    }

    public getRewardData(): Array<any> {
        return this.DAILY_STAMP_REWARD_DATA;
    }

    public getRewardDataByDay(day: number): any {
        return this.DAILY_STAMP_REWARD_DATA.find(item => item.key === day).value;
    }

    public getRewardCoinValueByDay(day: number): number {
        const reward = this.DAILY_STAMP_REWARD_DATA.find(item => item.key === day).value;
        return TSUtility.default.isValid(reward) === 0 ? 0 : (TSUtility.default.isValid(reward.Coin) === 0 ? 0 : reward.Coin);
    }

    public getPurchaserRewardData(): Array<any> {
        return this.DAILY_STAMP_PURCHASER_REWARD_DATA;
    }

    public getPurchaserRewardDataByDay(day: number): any {
        return this.DAILY_STAMP_PURCHASER_REWARD_DATA.find(item => item.key === day).value;
    }

    public getPurchaserRewardCoinValueByDay(day: number): number {
        const reward = this.DAILY_STAMP_PURCHASER_REWARD_DATA.find(item => item.key === day).value;
        return TSUtility.default.isValid(reward) === 0 ? 0 : (TSUtility.default.isValid(reward.Coin) === 0 ? 0 : reward.Coin);
    }

    public getAccumulatedDayRewardData(): Array<any> {
        return this.DAILY_STAMP_ACCUMULATED_REWARD_DATA;
    }

    public getAccumulatedDayRewardDataByDay(day: number): any {
        const reward = this.DAILY_STAMP_ACCUMULATED_REWARD_DATA.find(item => item.key === day);
        return TSUtility.default.isValid(reward) === 1 ? reward.value : null;
    }

    public getAccumulatedDayRewardCoinValueByDay(day: number): number {
        const reward = this.DAILY_STAMP_ACCUMULATED_REWARD_DATA.find(item => item.key === day).value;
        return TSUtility.default.isValid(reward) === 0 ? 0 : (TSUtility.default.isValid(reward.Coin) === 0 ? 0 : reward.Coin);
    }

    public getAccumulatedDayGageData(day: number): number {
        let total = 0;
        const gageData = this._isRewardCenter === true ? this.DAILY_STAMP_ACCUMULATED_GAGE_REWARD_CENTER_DATA : this.DAILY_STAMP_ACCUMULATED_GAGE_DATA;
        for (let i = 0; i < gageData.length && !(day < gageData[i].key); i++) {
            total += gageData[i].value;
        }
        return total;
    }

    public setDailyStampInfo(accDay: number, conDay: number, nextTime: number): void {
        this._numAccumulatedDay = accDay;
        this._numConsecutiveDay = conDay;
        this._numNextReceivedTime = nextTime;
    }

    public isFirstOpen(): boolean {
        return !ServerStorageManager.default.getAsBoolean(StorageKeyType.DAILY_STAMP_FIRST_OPEN);
    }

    public setFirstOpen(): void {
        ServerStorageManager.default.save(StorageKeyType.DAILY_STAMP_FIRST_OPEN, true);
    }

    public setPurchaseOpenTime(): void {
        ServerStorageManager.default.saveCurrentServerTime(StorageKeyType.DAILY_STAMP_PURCHASE_TIME);
    }

    public getDailyStampAccumulatedDay(): number {
        return this._numAccumulatedDay;
    }

    public getDailyStampConsecutiveDay(): number {
        return this._numConsecutiveDay;
    }

    public getDailyStampNextReceivedTime(): number {
        return this._numNextReceivedTime;
    }

    public getDailyStampVersion(): number {
        return this._numVersion;
    }

    public getUserVIPLevel(): number {
        if (MembersClassBoostUpManager.default.instance().isRunningMembersBoostUpProcess() === 1) {
            return MembersClassBoostUpManager.default.instance().getBoostedMembersClass();
        }
        if (MembersClassBoostUpNormalManager.default.instance().isRunningMembersBoostUpExpandProcess() === 1) {
            return MembersClassBoostUpNormalManager.default.instance().getBoostedMembersClass();
        }
        const vipInfo = UserInfo.default.instance().getUserVipInfo();
        return TSUtility.default.isValid(vipInfo) === 0 ? 0 : vipInfo.level;
    }

    public getDailyStampProductItem(): any {
        const item = UserInfo.default.instance().getItemInventory().getItemsByItemId(SDefine.default.I_DAILY_STAMP_PREMIUM);
        if (TSUtility.default.isValid(item) === 0 || item.length <= 0) return null;
        
        const productItem = item[0];
        if (TSUtility.default.isValid(productItem) === 0) return null;

        const remainDay = (productItem.expireDate - TSUtility.default.getServerBaseNowUnixTime()) / 60 / 60 / 24;
        const addDay = remainDay % 1 > 0 ? 1 : 0;
        let totalDay = Math.floor(remainDay) + addDay;
        if (totalDay < 0) totalDay = 0;
        
        if (productItem.curCnt >= totalDay) {
            productItem.curCnt = totalDay;
        }
        return productItem;
    }

    public isProductPurchaser(): boolean {
        return TSUtility.default.isValid(this._purchaseChangeResult) === 1 || this.getDailyStampProductItem() != null;
    }

    public getPurchaseRemainCount(): number {
        if (TSUtility.default.isValid(this._purchaseChangeResult) === 1 || this.isSameDayUnProcessed() || this.isNextDayUnProcessed()) {
            return 7;
        }
        const item = this.getDailyStampProductItem();
        return TSUtility.default.isValid(item) === 1 ? item.curCnt : 0;
    }

    public getPurchaseReceivedCount(): number {
        if (this.isSameDayUnProcessed() || this.isNextDayUnProcessed()) return 0;
        const item = this.getDailyStampProductItem();
        return item != null ? item.totCnt - item.curCnt : 0;
    }

    public isConsecutivePayCode(code: any): boolean {
        return this.DAILY_STAMP_CONSECUTIVE_PAY_CODE.includes(code);
    }

    public isAccumulatedPayCode(code: any): boolean {
        return this.DAILY_STAMP_ACCUMULATED_PAY_CODE.includes(code);
    }

    public setPurchaseChangeResult(data: any): void {
        this._purchaseChangeResult = data;
    }

    public getPurchaseChangeResult(): any {
        return this._purchaseChangeResult;
    }

    public setRewardCenter(isRewardCenter: boolean): void {
        this._isRewardCenter = isRewardCenter;
    }

    public isRewardCenter(): boolean {
        return this._isRewardCenter;
    }

    public isPurchaseProduct(): boolean {
        return SDefine.default.FB_Instant_iOS_Shop_Flag !== 1 && this.isProductPurchaser() !== 1 && this.isNextPurchaseTime() !== 0;
    }

    public isNextPurchaseTime(): boolean {
        return !(TSUtility.default.getServerBaseNowUnixTime() < ServerStorageManager.default.getAsNumber(StorageKeyType.NEXT_DAILY_STAMP_PURCHASE_TIME));
    }

    public isNextStampReward(): boolean {
        return !(this.getDailyStampNextReceivedTime() - TSUtility.default.getServerBaseNowUnixTime() > 0);
    }

    public isGetRewardInRewardCenter(): void {}
}