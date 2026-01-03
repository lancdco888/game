const { ccclass } = cc._decorator;

// ===================== 依赖模块导入 - 与混淆源码完全一致 =====================
import CurrencyFormatHelper from "../global_utility/CurrencyFormatHelper";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import PopupManager from "./PopupManager";
// import MembersClassBoostUpManager from "../../ServiceInfo/MembersClassBoostUpManager";
// import MembersClassBoostUpNormalManager from "../../ServiceInfo/MembersClassBoostUpNormalManager";
import ServerStorageManager, { StorageKeyType } from "./ServerStorageManager";
import ServiceInfoManager from "../ServiceInfoManager";
import UserInfo from "../User/UserInfo";
import UserPromotion, { HyperBountyDailyNormalPromotionInfo, HyperBountyDailySuperPromotionInfo, HyperBountyPassPromotionInfo, HyperBountySeasonPromotionInfo } from "../User/UserPromotion";
import { HyperBountyUIType } from "../HyperBountyUI";
import MembersClassBoostUpManager from "../ServiceInfo/MembersClassBoostUpManager";
import MembersClassBoostUpNormalManager from "../ServiceInfo/MembersClassBoostUpNormalManager";
// import ShopDataManager from "../Utility/ShopDataManager";
// import VipManager from "../../VIP/VipManager";
// import HyperBountyPopup from "./HyperBountyPopup";
// import HyperBountySeasonMissionCompletePopup from "./HyperBountySeasonMissionCompletePopup";
// import HyperBountyUI from "./HyperBountyUI";

// ===================== 【全局枚举】超级赏金任务类型 =====================
export enum HyperBountyMissionType {
    HYPER_BOUNTY_MISSION_TYPE_SPIN = 101,
    HYPER_BOUNTY_MISSION_TYPE_SPIN_BET = 102,
    HYPER_BOUNTY_MISSION_TYPE_WIN = 201,
    HYPER_BOUNTY_MISSION_TYPE_WIN_BET = 202,
    HYPER_BOUNTY_MISSION_TYPE_WIN_COIN = 203,
    HYPER_BOUNTY_MISSION_TYPE_WIN_SPIN = 204,
    HYPER_BOUNTY_MISSION_TYPE_BIG_WIN_BIG = 301,
    HYPER_BOUNTY_MISSION_TYPE_BIG_WIN_HUGE = 302,
    HYPER_BOUNTY_MISSION_TYPE_BIG_WIN_MEGA = 303,
    HYPER_BOUNTY_MISSION_TYPE_CARD_PACK = 401,
    HYPER_BOUNTY_MISSION_TYPE_MAKE_PURCHASE = 501,
    HYPER_BOUNTY_MISSION_TYPE_LOGIN_FOR_DAY = 601,
    HYPER_BOUNTY_MISSION_TYPE_USE_STAR_POINT = 701,
    HYPER_BOUNTY_MISSION_TYPE_COMPLETE_BINGO = 801,
    HYPER_BOUNTY_MISSION_TYPE_PLAY_BINGO_BALL = 802,
    HYPER_BOUNTY_MISSION_TYPE_MATCH_BINGO = 803,
    HYPER_BOUNTY_MISSION_TYPE_PLAY_FEATURE = 901,
    HYPER_BOUNTY_MISSION_TYPE_SLOT_TOURNEY_FINISH_3RD = 1001,
    HYPER_BOUNTY_MISSION_TYPE_ROLL_RAINBOW_DICE = 1101,
    HYPER_BOUNTY_MISSION_TYPE_PLAY_WHEEL_BONUS = 1102
}

// ===================== 【弹窗打开信息实体类】 =====================
export class HyperBountyPopupOpenInfo {
    private _eType: HyperBountyUIType = HyperBountyUIType.DAILY;
    private _funcLoad: Function | null = null;
    private _funcClose: Function | null = null;
    private _funcOpen: Function | null = null;

    constructor(type: HyperBountyUIType, callbackObj?: { funcLoad?: Function, funcClose?: Function, funcOpen?: Function }) {
        this._eType = type;
        if (TSUtility.isValid(callbackObj)) {
            this._funcLoad = callbackObj.funcLoad;
            this._funcClose = callbackObj.funcClose;
            this._funcOpen = callbackObj.funcOpen;
        }
    }

    get eType(): HyperBountyUIType { return this._eType; }
    get funcLoad(): Function | null { return this._funcLoad; }
    get funcClose(): Function | null { return this._funcClose; }
    get funcOpen(): Function | null { return this._funcOpen; }

    /** 弹窗打开失败的兜底回调 */
    public openFail(): void {
        if (TSUtility.isValid(this._funcLoad)) {
            this._funcLoad!();
        } else if (TSUtility.isValid(this._funcOpen)) {
            this._funcOpen!();
        } else if (TSUtility.isValid(this._funcClose)) {
            this._funcClose!();
        }
    }
}

// ===================== 【核心单例类】超级赏金管理器 =====================
@ccclass("HyperBountyManager")
export default class HyperBountyManager extends cc.Component {
    // ===================== 【静态单例】 =====================
    private static _instance: HyperBountyManager | null = null;
    public static get instance(): HyperBountyManager {
        if (!this._instance) this._instance = new HyperBountyManager();
        return this._instance;
    }

    // ===================== 【固定常量】源码硬编码值，精准还原 =====================
    /** 通行证各等级升级所需经验 */
    public PASS_LEVEL_EXP: number[] = [100,100,150,150,150,200,200,200,200,200,300,300,300,300,300,500,500,500,500,500,600,600,600,600,600,600,700,700,700,700];
    /** 通行证免费奖励池数据 */
    public PASS_REWARD_FREE_DATA: Array<{ itemID: string, addCnt: number }> = [
        { itemID: SDefine.I_GAMEMONEY, addCnt: 500000 },{ itemID: SDefine.I_GAMEMONEY, addCnt: 500000 },{ itemID: SDefine.I_BINGOBALL_FREE, addCnt: 5 },
        { itemID: SDefine.I_GAMEMONEY, addCnt: 500000 },{ itemID: SDefine.I_GAMEMONEY, addCnt: 750000 },{ itemID: SDefine.I_COLLECTION_CARD_PACK_1, addCnt: 1 },
        { itemID: SDefine.I_GAMEMONEY, addCnt: 750000 },{ itemID: SDefine.I_GAMEMONEY, addCnt: 750000 },{ itemID: SDefine.I_COLLECTION_CARD_PACK_2, addCnt: 1 },
        { itemID: SDefine.I_GAMEMONEY, addCnt: 1000000 },{ itemID: SDefine.I_GAMEMONEY, addCnt: 1000000 },{ itemID: SDefine.I_BINGOBALL_FREE, addCnt: 10 },
        { itemID: SDefine.I_GAMEMONEY, addCnt: 1000000 },{ itemID: SDefine.I_GAMEMONEY, addCnt: 1000000 },{ itemID: SDefine.I_STAR_SHOP_COIN, addCnt: 50 },
        { itemID: SDefine.I_GAMEMONEY, addCnt: 1500000 },{ itemID: SDefine.I_GAMEMONEY, addCnt: 1500000 },{ itemID: SDefine.I_COLLECTION_CARD_PACK_1, addCnt: 1 },
        { itemID: SDefine.I_COLLECTION_CARD_PACK_2, addCnt: 1 },{ itemID: SDefine.I_GAMEMONEY, addCnt: 2000000 },{ itemID: SDefine.I_BINGOBALL_FREE, addCnt: 15 },
        { itemID: SDefine.I_GAMEMONEY, addCnt: 2000000 },{ itemID: SDefine.I_COLLECTION_CARD_PACK_3, addCnt: 1 },{ itemID: SDefine.I_GAMEMONEY, addCnt: 2000000 },
        { itemID: SDefine.I_STAR_SHOP_COIN, addCnt: 100 },{ itemID: SDefine.I_COLLECTION_CARD_PACK_2, addCnt: 1 },{ itemID: SDefine.I_GAMEMONEY, addCnt: 3000000 },
        { itemID: SDefine.I_GAMEMONEY, addCnt: 3000000 },{ itemID: SDefine.I_COLLECTION_CARD_PACK_3, addCnt: 1 },{ itemID: SDefine.I_GAMEMONEY, addCnt: 3000000 }
    ];

    /** 通行证付费奖励池数据 */
    public PASS_REWARD_PURCHASE_DATA: Array<{ itemID: string, addCnt: number | string, addTime?: number }> = [
        // { itemID: SDefine.I_GAMEMONEY, addCnt: 2500000 },{ itemID: SDefine.I_COLLECTION_CARD_PACK_4, addCnt: 1 },{ itemID: SDefine.I_GAMEMONEY, addCnt: 2500000 },
        // { itemID: SDefine.I_STAR_SHOP_COIN, addCnt: 100 },{ itemID: SDefine.I_FULLED_PIGGY_BANK, addCnt: 1.99 },{ itemID: SDefine.I_BINGOBALL_FREE, addCnt: 20 },
        // { itemID: SDefine.I_GAMEMONEY, addCnt: 5000000 },{ itemID: SDefine.ITEM_LEVEL_UP_BOOSTER, addTime:30 },{ itemID: SDefine.I_GAMEMONEY, addCnt:5000000 },
        // { itemID: SDefine.I_INBOX_FLIPCOIN, addCnt:1.99 },{ itemID: SDefine.I_COLLECTION_CARD_PACK_5, addCnt:1 },{ itemID: SDefine.I_GAMEMONEY, addCnt:5000000 },
        // { itemID: SDefine.I_STAR_SHOP_COIN, addCnt:250 },{ itemID: SDefine.I_GAMEMONEY, addCnt:5000000 },{ itemID: SDefine.I_INBOX_PIGGIES_LADDERS, addCnt:2.99 },
        // { itemID: SDefine.I_GAMEMONEY, addCnt:10000000 },{ itemID: SDefine.I_COLLECTION_CARD_PACK_5, addCnt:1 },{ itemID: SDefine.I_RANDOM_JOKER_CARD_1_MORE, addCnt:1 },
        // { itemID: SDefine.I_GAMEMONEY, addCnt:10000000 },{ itemID: SDefine.I_INBOX_SCRATCH_EMOJI777, addCnt:4.99 },{ itemID: SDefine.ITEM_LEVEL_UP_BOOSTER, addTime:60 },
        // { itemID: SDefine.I_GAMEMONEY, addCnt:20000000 },{ itemID: SDefine.I_COLLECTION_CARD_PACK_5, addCnt:1 },{ itemID: SDefine.I_GAMEMONEY, addCnt:20000000 },
        // { itemID: SDefine.I_INBOX_SCRATCH_8DRAGON, addCnt:7.99 },{ itemID: SDefine.I_STAR_SHOP_COIN, addCnt:500 },{ itemID: SDefine.I_COLLECTION_CARD_PACK_5, addCnt:1 },
        // { itemID: SDefine.I_GAMEMONEY, addCnt:20000000 },{ itemID: SDefine.I_JOKER_CARD, addCnt:1 },{ itemID: SDefine.I_INBOX_LUCKY_WHEEL, addCnt:9.99 }
    ];
    /** 通行证等级溢出后 拓展奖励所需经验值 */
    public EXTEND_REWARD_GOAL: number = 700;
    /** 每日任务固定数量 */
    public missionCount: number = 5;

    // ===================== 【私有属性】 =====================
    public _isOpenMainPopup: boolean = false;
    public _arrCompletedSeasonMissionArray: Array<any> = [];

    // ===================== 【只读属性 GETTER】与混淆源码完全一致 =====================
    get isPurchaseProduct(): boolean { return TSUtility.isValid(this.getPurchaseProduct()); }
    get is2XEventOn(): boolean { return this.is2XEventActive(); }
    get isPlay2XEvent(): boolean { return this.isPlay2XEventAction(); }
    get numDailyCompleteCount(): number { return this.getDailyCompleteCount(); }
    get numDailyReceiveCount(): number { return this.getDailyReceiveCount(); }
    get numDailyRunningMissionIndex(): number { return this.getRunningMissionIndex(); }
    get numDailyNextResetDate(): number { return this.getDailyNextResetDate(); }
    get numSuperReceiveCount(): number { return this.getSuperReceiveCount(); }
    get numSuperNextResetDate(): number { return this.getSuperNextResetDate(); }
    get numSeasonReceiveCount(): number { return this.getSeasonReceiveCount(); }
    get numSeasonOpenMissionDate(): number { return this.getStartMissionOpenDate(); }
    get numSeasonNextUnlockDate(): number { return this.getNextUnlockData(); }
    get arrSeasonAllMission(): Array<any> { return this.getCurrentSeasonAllMission(); }
    get numPassExtendRewardBoxCount(): number { return TSUtility.isValid(this.getExtendRewardBoxInfo()) ? this.getExtendRewardBoxInfo()!.curCnt : 0; }
    get numPassPoint(): number { return TSUtility.isValid(this.getPassPointInfo()) ? this.getPassPointInfo()!.curCnt : 0; }
    get numPassLevel(): number { return this.getCurrentLevelAndGauge(this.numPassPoint)[0]; }
    get numPassMaxLevel(): number { return this.PASS_LEVEL_EXP.length; }
    get numPassReceiveCount(): number { return this.getPassReceiveCount(this.isPurchaseProduct); }

    // ===================== 【生命周期】 =====================
    protected onLoad(): void {
        HyperBountyManager._instance = this;
        this.initialize();
    }

    /** 初始化：注册用户信息更新监听 */
    public initialize(): void {
        // UserInfo.instance().addListenerTarget(MSG.UPDATE_PROMOTION, this.updateCompleteSeasonMission, this);
    }

    // ===================== 【基础通用方法】 =====================
    public isAvailable(): boolean { return false; }
    public isHyperBountyStart(): boolean { return TSUtility.isValid(UserInfo.instance().getPromotionInfo(HyperBountyDailyNormalPromotionInfo.PromotionKeyName)); }
    /** 是否完成所有每日任务+超级任务 */
    public isCompleteAllMissionIncludeSuper(): boolean {
        const isDailyAllDone = this.getDailyCompleteCount() + this.getDailyReceiveCount() === this.missionCount;
        const isSuperDone = this.getSuperReceiveCount() > 0;
        return isDailyAllDone && isSuperDone;
    }

    // ===================== 【通行证奖励相关核心方法】 =====================
    /** 获取对应等级的免费奖励 */
    public getPassFreeRewardData(level: number): { itemID: string, addCnt: number } | null {
        return level < 0 || level >= this.PASS_REWARD_FREE_DATA.length ? null : this.PASS_REWARD_FREE_DATA[level];
    }
    /** 获取对应等级的付费奖励 */
    public getPassPremiumRewardData(level: number): { itemID: string, addCnt: number | string, addTime?: number } | null {
        return level < 0 || level >= this.PASS_REWARD_PURCHASE_DATA.length ? null : this.PASS_REWARD_PURCHASE_DATA[level];
    }
    /** 奖励数据排序规则（固定优先级） */
    public sortPassRewardData(dataArr: Array<any>): Array<any> {
        const sortPriority = ["VipPoint", SDefine.I_HYPER_BOUNTY_EXTEND_REWARD_BOX, SDefine.I_GAMEMONEY, SDefine.I_JOKER_CARD, SDefine.I_RANDOM_JOKER_CARD_1_MORE,
            SDefine.I_COLLECTION_CARD_PACK_5, SDefine.I_COLLECTION_CARD_PACK_4, SDefine.I_COLLECTION_CARD_PACK_3, SDefine.I_COLLECTION_CARD_PACK_2, SDefine.I_COLLECTION_CARD_PACK_1,
            SDefine.ITEM_LEVEL_UP_BOOSTER, SDefine.I_INBOX_SCRATCH_EMOJI777, SDefine.I_INBOX_PIGGIES_LADDERS, SDefine.I_INBOX_FLIPCOIN, SDefine.I_INBOX_SCRATCH_8DRAGON,
            SDefine.I_INBOX_LUCKY_WHEEL, SDefine.I_FULLED_PIGGY_BANK, SDefine.I_BINGOBALL_FREE, SDefine.I_STAR_SHOP_COIN];
        dataArr.sort((a, b) => {
            let idxA = sortPriority.indexOf(a.itemID);
            let idxB = sortPriority.indexOf(b.itemID);
            idxA = idxA === -1 ? sortPriority.length : idxA;
            idxB = idxB === -1 ? sortPriority.length : idxB;
            return idxA - idxB;
        });
        return dataArr;
    }
    /** 获取付费通行证所有奖励汇总 */
    public getPassPremiumSumRewardData(isPurchase: number): Array<any> {
        const rewardArr: Array<any> = [];
        if (isPurchase === 1) {
            const productInfo = this.getPassProductInfo();
            // const vipPoint = ShopDataManager.Instance().getProductPurchaseVipPoint(productInfo.getPrice());
            // rewardArr.push({ itemID: "VipPoint", addCnt: vipPoint, addTime: 0 });
        }
        this.PASS_REWARD_PURCHASE_DATA.forEach((item, idx) => {
            const cloneItem = JSON.parse(JSON.stringify(item));
            if (!TSUtility.isValid(cloneItem)) return;
            const findItem = rewardArr.find(v => v.itemID === cloneItem.itemID);
            if (TSUtility.isValid(findItem) && cloneItem.itemID !== SDefine.ITEM_LEVEL_UP_BOOSTER) {
                findItem.addCnt += cloneItem.addCnt;
                findItem.addTime += cloneItem.addTime || 0;
            } else {
                rewardArr.push(cloneItem);
            }
        });
        return this.sortPassRewardData(rewardArr);
    }
    /** 获取未领取的付费奖励汇总 */
    public getNotReceivedPassPremiumSumRewardData(): Array<any> {
        const rewardArr: Array<any> = [];
        this.PASS_REWARD_PURCHASE_DATA.forEach((item, idx) => {
            if (this.isReceivedLevel(idx + 1, true)) return;
            const cloneItem = JSON.parse(JSON.stringify(item));
            if (!TSUtility.isValid(cloneItem)) return;
            const findItem = rewardArr.find(v => v.itemID === cloneItem.itemID);
            if (TSUtility.isValid(findItem) && cloneItem.itemID !== SDefine.ITEM_LEVEL_UP_BOOSTER) {
                findItem.addCnt += cloneItem.addCnt;
                findItem.addTime += cloneItem.addTime || 0;
            } else {
                rewardArr.push(cloneItem);
            }
        });
        return this.sortPassRewardData(rewardArr);
    }
    /** 获取所有可领取的奖励汇总(免费+付费) */
    public getPassReceiveSumAllRewardData(): Array<any> {
        const premiumReward = this.getPassReceiveSumRewardData(true);
        const freeReward = this.getPassReceiveSumRewardData(false);
        if (this.isPurchaseProduct) {
            premiumReward.forEach((item, idx) => {
                const cloneItem = JSON.parse(JSON.stringify(item));
                if (!TSUtility.isValid(cloneItem)) return;
                const findItem = freeReward.find(v => v.itemID === cloneItem.itemID);
                if (TSUtility.isValid(findItem) && cloneItem.itemID !== SDefine.ITEM_LEVEL_UP_BOOSTER) {
                    findItem.addCnt += cloneItem.addCnt;
                    findItem.addTime += cloneItem.addTime || 0;
                } else {
                    freeReward.push(cloneItem);
                }
            });
        }
        return this.sortPassRewardData(freeReward);
    }
    /** 获取指定类型的可领取奖励汇总 */
    public getPassReceiveSumRewardData(isPremium: boolean): Array<any> {
        const rewardArr: Array<any> = [];
        if (isPremium) {
            const boxCount = this.numPassExtendRewardBoxCount;
            boxCount > 0 && rewardArr.push({ itemID: SDefine.I_HYPER_BOUNTY_EXTEND_REWARD_BOX, addCnt: boxCount, addTime: 0 });
        }
        const maxLevel = this.numPassLevel > this.numPassMaxLevel ? this.numPassMaxLevel : this.numPassLevel;
        const rewardSource = isPremium ? this.PASS_REWARD_PURCHASE_DATA : this.PASS_REWARD_FREE_DATA;
        rewardSource.forEach((item, idx) => {
            if (idx >= maxLevel || this.isReceivedLevel(idx + 1, isPremium)) return;
            const cloneItem = JSON.parse(JSON.stringify(item));
            if (!TSUtility.isValid(cloneItem)) return;
            const findItem = rewardArr.find(v => v.itemID === cloneItem.itemID);
            if (TSUtility.isValid(findItem) && cloneItem.itemID !== SDefine.ITEM_LEVEL_UP_BOOSTER) {
                findItem.addCnt += cloneItem.addCnt;
                findItem.addTime += cloneItem.addTime || 0;
            } else {
                rewardArr.push(cloneItem);
            }
        });
        return this.sortPassRewardData(rewardArr);
    }

    // ===================== 【通行证等级/经验相关核心方法】 =====================
    /** 根据通行证积分 获取当前等级+当前等级进度 */
    public getCurrentLevelAndGauge(passPoint: number, isCalcExtend: boolean = false): [number, number] {
        let remainExp = passPoint;
        let curLevel = 0;
        for (let i = 0; i < this.PASS_LEVEL_EXP.length; i++) {
            const needExp = this.PASS_LEVEL_EXP[i];
            if (remainExp - needExp < 0) break;
            remainExp -= needExp;
            curLevel++;
        }
        if (curLevel >= this.numPassMaxLevel) {
            const promotionInfo = UserInfo.instance().getPromotionInfo(HyperBountyPassPromotionInfo.PromotionKeyName);
            if (TSUtility.isValid(promotionInfo)) {
                curLevel = this.numPassMaxLevel + promotionInfo.numExtendRewardCollectCount;
            }
            remainExp = passPoint - this.getMaxExp();
            if (isCalcExtend) {
                curLevel += Math.floor(remainExp / this.EXTEND_REWARD_GOAL);
                remainExp %= this.EXTEND_REWARD_GOAL;
            }
        }
        return [curLevel, remainExp];
    }
    /** 获取通行证满级所需总经验 */
    public getMaxExp(): number {
        return this.PASS_LEVEL_EXP.reduce((prev, curr) => prev + curr, 0);
    }
    /** 获取指定等级升级所需经验 */
    public getPassExpByLevel(level: number): number {
        return level < 0 ? 0 : (level - 1 < this.PASS_LEVEL_EXP.length ? this.PASS_LEVEL_EXP[level - 1] : this.EXTEND_REWARD_GOAL);
    }
    /** 获取指定等级的累计经验值 */
    public getPassTotalEXPByLevel(level: number): number {
        if (level < 0 || level >= this.PASS_LEVEL_EXP.length) return 0;
        let totalExp = 0;
        for (let i = 0; i < level - 1; i++) totalExp += this.PASS_LEVEL_EXP[i];
        return totalExp;
    }
    /** 判断指定等级的奖励是否已领取 */
    public isReceivedLevel(level: number, isPremium: boolean): boolean {
        const promotionInfo = UserInfo.instance().getPromotionInfo(HyperBountyPassPromotionInfo.PromotionKeyName);
        if (!TSUtility.isValid(promotionInfo)) return false;
        const rewardArr = isPremium ? promotionInfo.arrCollectPremiumRewardLevel : promotionInfo.arrCollectedRewardLevel;
        return rewardArr.includes(level);
    }
    /** 判断指定等级是否已达成 */
    public isCompleteLevel(level: number): boolean {
        return !(level < 0 || level > this.numPassMaxLevel) && level <= this.numPassLevel;
    }
    /** 获取可领取的奖励总数 */
    public getPassReceiveCount(isPremium: boolean): number {
        const maxLevel = this.numPassLevel > this.numPassMaxLevel ? this.numPassMaxLevel : this.numPassLevel;
        let receiveCount = 0;
        for (let i = 0; i < maxLevel; i++) {
            !this.isReceivedLevel(i + 1, false) && receiveCount++;
            isPremium && !this.isReceivedLevel(i + 1, true) && receiveCount++;
        }
        return receiveCount;
    }

    // ===================== 【任务相关核心方法】 =====================
    /** 获取任务描述文本(带富文本/纯文本) */
    public getMissionDescription(missionInfo: any, isRichText: boolean = true, uiType: HyperBountyUIType = HyperBountyUIType.NONE): string {
        const goalNum = this.getStringGoalCount(missionInfo);
        const currNum = this.getStringCurrentCount(missionInfo);
        const subGoal = CurrencyFormatHelper.formatEllipsisNumberToFixedWholed(missionInfo.numSubGoalCount, 2);
        const subRemain = CurrencyFormatHelper.formatNumber(missionInfo.numSubGoalCount - missionInfo.numSubCurrentCount);
        switch (missionInfo.numMissionID) {
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_SPIN:
                return missionInfo.numGoalCount >= 1000 
                    ? (isRichText ? `Complete\n<color=#00FF00>${goalNum}</color> spins.` : `Complete ${goalNum} spins.`)
                    : (isRichText ? `Complete   <color=#00FF00>${goalNum}</color> spins.` : `Complete ${goalNum} spins.`);
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_SPIN_BET:
                return isRichText ? `Spin   <color=#00FF00>${goalNum}</color> times\nwith   <color=#00FF00>${subGoal}</color> bet min.` : `Spin ${goalNum} times\nwith ${subGoal} bet min.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_WIN:
                return isRichText ? `Win   <color=#00FF00>${goalNum}</color> times.` : `Win ${goalNum} times.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_WIN_BET:
                return isRichText ? `Get   <color=#00FF00>${goalNum}</color> wins with\n<color=#00FF00>${subGoal}</color> bet min.` : `Get ${goalNum} wins with\n${subGoal} bet min.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_WIN_COIN:
                return isRichText ? `Win a total of\n<color=#00FF00>${goalNum}</color> coins.` : `Win a total of\n${goalNum} coins.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_WIN_SPIN:
                return isRichText ? `Win   <color=#00FF00>${goalNum}</color> coins in\n<color=#00FF00>${missionInfo.numSubGoalCount}</color> spins.\n<color=#FFFF00>(${subRemain} spins left)</color>` : `Win ${goalNum} coins\nin ${missionInfo.numSubGoalCount} spins.\n(${subRemain} spins left)`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_BIG_WIN_BIG:
                return isRichText ? `Get   <color=#00FF00>${goalNum}</color> big wins.` : `Get ${goalNum} big wins.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_BIG_WIN_HUGE:
                return isRichText ? `Get   <color=#00FF00>${goalNum}</color> huge wins.` : `Get ${goalNum} huge wins.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_BIG_WIN_MEGA:
                return isRichText ? `Get   <color=#00FF00>${goalNum}</color> mega wins.` : `Get ${goalNum} mega wins.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_CARD_PACK:
                HyperBountyUIType.SEASON;
                return isRichText ? `Obtain   <color=#00FF00>${goalNum}</color> card packs\nby making spins.` : `Obtain ${goalNum} card packs\nby making spins.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_MAKE_PURCHASE:
                return isRichText ? `Make a\npurchase of\n$<color=#00FF00>${missionInfo.strValue_1}</color> or more.` : `Make a\npurchase of\n$${missionInfo.strValue_1} or more.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_LOGIN_FOR_DAY:
                return isRichText ? `Login   <color=#00FF00>${goalNum}</color> days.` : `Login ${goalNum} days.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_USE_STAR_POINT:
                return isRichText ? `Exchange   <color=#00FF00>${goalNum}</color>\nStarlight Points in\nStarlight Shop.` : `Exchange ${goalNum}\nStarlight Points in\nStarlight Shop.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_COMPLETE_BINGO:
                return isRichText ? `Complete   <color=#00FF00>${goalNum}</color>\nbingo cards.` : `Complete ${goalNum}\nbingo cards.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_PLAY_BINGO_BALL:
                return isRichText ? `Play   <color=#00FF00>${goalNum}</color> bingo\nball.` : `Play ${goalNum} bingo\nball.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_MATCH_BINGO:
                return isRichText ? `Get   <color=#00FF00>${goalNum}</color> bingo\nmatches.` : `Get ${goalNum} bingo\nmatches.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_PLAY_FEATURE:
                return isRichText ? `Play   <color=#00FF00>${goalNum}</color> Rounds\nof Free\nSpin Mode.` : `Play ${goalNum} Rounds\nof Free\nSpin Mode.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_SLOT_TOURNEY_FINISH_3RD:
                return `Finish 3rd in\nSlot Tourney.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_ROLL_RAINBOW_DICE:
                return isRichText ? `Roll Rainbow\nDice  <color=#00FF00>${goalNum}</color> times.` : `Roll Rainbow\nDice ${goalNum} times.`;
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_PLAY_WHEEL_BONUS:
                return isRichText ? `Play   <color=#00FF00>${goalNum}</color> Wheel\nBonus.` : `Play ${goalNum} Wheel\nBonus.`;
            default:
                cc.error(`Unknown mission ID: ${missionInfo.numMissionID}`);
                return "";
        }
    }
    /** 获取任务对应的图标名称 */
    public getMissionIconName(missionInfo: any): string {
        switch (missionInfo.numMissionID) {
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_SPIN:
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_SPIN_BET:
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_WIN_COIN:
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_WIN:
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_WIN_BET:
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_WIN_SPIN:
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_BIG_WIN_BIG:
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_BIG_WIN_HUGE:
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_BIG_WIN_MEGA:
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_PLAY_FEATURE:
                return "Spin";
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_CARD_PACK: return "CardPack";
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_MAKE_PURCHASE: return "Buy";
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_LOGIN_FOR_DAY: return "Login";
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_USE_STAR_POINT: return "StarStore";
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_COMPLETE_BINGO:
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_PLAY_BINGO_BALL:
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_MATCH_BINGO: return "Bingo";
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_SLOT_TOURNEY_FINISH_3RD: return "Tourney";
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_ROLL_RAINBOW_DICE:
            case HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_PLAY_WHEEL_BONUS: return "TimeBonus";
            default: return "";
        }
    }
    /** 获取任务目标数的格式化文本 */
    public getStringGoalCount(missionInfo: any): string {
        const isCoinType = missionInfo.numMissionID === HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_WIN_COIN || missionInfo.numMissionID === HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_WIN_SPIN;
        return isCoinType ? CurrencyFormatHelper.formatEllipsisNumber(missionInfo.numGoalCount) : CurrencyFormatHelper.formatNumber(missionInfo.numGoalCount);
    }
    /** 获取任务当前进度的格式化文本 */
    public getStringCurrentCount(missionInfo: any): string {
        const isCoinType = missionInfo.numMissionID === HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_WIN_COIN || missionInfo.numMissionID === HyperBountyMissionType.HYPER_BOUNTY_MISSION_TYPE_WIN_SPIN;
        return isCoinType ? CurrencyFormatHelper.formatEllipsisNumber(missionInfo.numCurrentCount) : CurrencyFormatHelper.formatNumber(missionInfo.numCurrentCount);
    }

    // ===================== 【物品/道具/数据获取相关】 =====================
    /** 获取VIP加成后的金币数量 */
    public getVIPBenefitCoin(coin: number): number {
        // let vipLevel = UserInfo.instance().getUserVipInfo().level;
        // if (MembersClassBoostUpManager.instance().isRunningMembersBoostUpProcess()) {
        //     vipLevel = MembersClassBoostUpManager.instance().getBoostedMembersClass();
        // }
        // if (MembersClassBoostUpNormalManager.instance().isRunningMembersBoostUpExpandProcess()) {
        //     vipLevel = MembersClassBoostUpNormalManager.instance().getBoostedMembersClass();
        // }
        // const vipGrade = VipManager.Instance().getGradeInfo(vipLevel);
        // if (!TSUtility.isValid(vipGrade)) return coin;
        // const bonusCoin = (vipGrade.benefit.shopBonus * coin).toFixed();
        // return parseInt(bonusCoin);
        return 0;
    }
    /** 获取已购买的付费通行证道具信息 */
    public getPurchaseProduct(): any | null {
        // const item = UserInfo.instance().getItemInventory().getItemsByItemId(SDefine.I_HYPER_BOUNTY_PASS_PREMIUM);
        // if (!TSUtility.isValid(item) || item.length <= 0) return null;
        // return item[0];
        return null;
    }
    /** 获取拓展奖励箱信息 */
    public getExtendRewardBoxInfo(): any | null {
        // const item = UserInfo.instance().getItemInventory().getItemsByItemId(SDefine.I_HYPER_BOUNTY_EXTEND_REWARD_BOX);
        // if (!TSUtility.isValid(item) || item.length <= 0) return null;
        // return item[0];
        return null;
    }
    /** 获取通行证积分信息 */
    public getPassPointInfo(): any | null {
        // const item = UserInfo.instance().getItemInventory().getItemsByItemId(SDefine.I_HYPER_BOUNTY_PASS_POINT);
        // if (item.length <= 0) return null;
        // return item[0];
        return null;
    }
    /** 获取通行证商品信息 */
    public getPassProductInfo(): any {
        return null;//ShopDataManager.Instance().getHyperPassProductInfo();
    }
    /** 获取奖励图标配置数据 */
    public getPassRewardIconData(itemId: string, addCnt: number | string, addTime: number, isPremium: boolean): Array<string> | undefined {
        const numAddCnt = typeof addCnt === "number" ? addCnt : parseFloat(addCnt);
        switch (itemId) {
            case "VipPoint": return ["M_Point", `+${numAddCnt.toString()}`, "M Point"];
            case SDefine.I_HYPER_BOUNTY_EXTEND_REWARD_BOX: return ["HyperBountyBox", `X${numAddCnt.toString()}`, "Hyper Bounty Box"];
            case SDefine.I_GAMEMONEY:
                const coin = this.getVIPBenefitCoin(numAddCnt);
                const coinTxt = coin >= 1e6 ? CurrencyFormatHelper.formatEllipsisNumberToFixedWholed(coin,2,0,true) : CurrencyFormatHelper.formatEllipsisNumber(coin);
                return [isPremium ? "PremiumCoins" : "FreeCoins", coinTxt, "Coins"];
            case SDefine.I_BINGOBALL_FREE: return ["BingoBall", `X${numAddCnt.toString()}`, "Bingo Ball"];
            case SDefine.I_COLLECTION_CARD_PACK_1: return ["CardPack_1", `X${numAddCnt.toString()}`, "Card Pack"];
            case SDefine.I_COLLECTION_CARD_PACK_2: return ["CardPack_2", `X${numAddCnt.toString()}`, "Card Pack"];
            case SDefine.I_COLLECTION_CARD_PACK_3: return ["CardPack_3", `X${numAddCnt.toString()}`, "Card Pack"];
            case SDefine.I_COLLECTION_CARD_PACK_4: return ["CardPack_4", `X${numAddCnt.toString()}`, "Card Pack"];
            case SDefine.I_COLLECTION_CARD_PACK_5: return ["CardPack_5", `X${numAddCnt.toString()}`, "Card Pack"];
            case SDefine.I_RANDOM_JOKER_CARD_1_MORE: return ["RandomJoker_3", `X${numAddCnt.toString()}`, "Random Joker"];
            case SDefine.I_JOKER_CARD: return ["Joker", `X${numAddCnt.toString()}`, "Joker Card"];
            case SDefine.I_STAR_SHOP_COIN: return ["StarPoint", CurrencyFormatHelper.formatNumber(numAddCnt), "Starlight points"];
            case SDefine.ITEM_LEVEL_UP_BOOSTER: return ["LevelBooster", `${addTime}min`, "Level booster"];
            case SDefine.I_FULLED_PIGGY_BANK: return ["PiggyBank", `$${numAddCnt} value`, "Piggy bank"];
            case SDefine.I_INBOX_PIGGIES_LADDERS: return ["Ladders", `$${numAddCnt} value`, "Piggies in ladders"];
            case SDefine.I_INBOX_FLIPCOIN: return ["FlipACoin", `$${numAddCnt} value`, "Flip a coin"];
            case SDefine.I_INBOX_SCRATCH_EMOJI777: return ["Emoji", `$${numAddCnt} value`, "Scratch & Win"];
            case SDefine.I_INBOX_SCRATCH_8DRAGON: return ["Dragons", `$${numAddCnt} value`, "Scratch & Win"];
            case SDefine.I_INBOX_LUCKY_WHEEL: return ["LuckyWheel", `$${numAddCnt} value`, "Lucky strike wheel"];
        }
    }

    // ===================== 【每日/赛季/超级任务数据获取】 =====================
    public getCurrentSeasonAllMission(): Array<any> {
        const promotion = UserInfo.instance().getPromotionInfo(HyperBountySeasonPromotionInfo.PromotionKeyName);
        return TSUtility.isValid(promotion) ? this.getSeasonAllMission(promotion) : [];
    }
    public getSeasonAllMission(promotionInfo: any): Array<any> {
        if (!TSUtility.isValid(promotionInfo) || !TSUtility.isValid(promotionInfo.arrMission)) return [];
        const missionArr: Array<any> = [];
        promotionInfo.arrMission.forEach((missionGroup: any, groupIdx: number) => {
            const cloneMission = Array.from(missionGroup.arrMission);
            cloneMission.forEach((mission: any, idx: number) => {
                mission.numClientIndex = 10 * (groupIdx + 1) + (idx + 1);
            });
            missionArr.push(...cloneMission);
        });
        return missionArr;
    }
    public getSeasonReceiveCount(): number {
        const allMission = this.arrSeasonAllMission;
        let count = 0;
        allMission.forEach(mission => {
            if (mission.isComplete && !mission.isReceived) count++;
        });
        return count;
    }
    public getSeasonMissionByIndex(index: number): any | null {
        const promotion = UserInfo.instance().getPromotionInfo(HyperBountySeasonPromotionInfo.PromotionKeyName);
        if (!TSUtility.isValid(promotion)) return null;
        if (index < 0) return null;
        const groupIdx = Math.floor(index /10) -1;
        const missionIdx = index %10 -1;
        if (groupIdx >= promotion.arrMission.length) return null;
        const group = promotion.arrMission[groupIdx];
        if (!TSUtility.isValid(group) || !TSUtility.isValid(group.arrMission)) return null;
        return missionIdx >= group.arrMission.length ? null : group.arrMission[missionIdx];
    }
    public getDailyMissionByIndex(index: number): any | null {
        const promotion = UserInfo.instance().getPromotionInfo(HyperBountyDailyNormalPromotionInfo.PromotionKeyName);
        if (!TSUtility.isValid(promotion)) return null;
        return index <0 || index >= promotion.arrMission.length ? null : promotion.arrMission[index];
    }
    public getStartMissionOpenDate(): number {
        const promotion = UserInfo.instance().getPromotionInfo(HyperBountySeasonPromotionInfo.PromotionKeyName);
        if (!TSUtility.isValid(promotion)) return 0;
        return promotion.arrMission.length <=0 ?0 : promotion.arrMission[0].numMissionOpenDate;
    }
    public getNextUnlockData(): number {
        const startDate = this.getStartMissionOpenDate();
        const currTime = TSUtility.getServerBaseNowUnixTime();
        for (let i=0; i<2; i++) {
            const unlockDate = startDate + 604800*(i+1); // 604800 = 7天秒数
            if (unlockDate > currTime) return unlockDate;
        }
        return 0;
    }
    public getDailyCompleteCount(): number {
        const promotion = UserInfo.instance().getPromotionInfo(HyperBountyDailyNormalPromotionInfo.PromotionKeyName);
        if (!TSUtility.isValid(promotion)) return 0;
        let count =0;
        promotion.arrMission.forEach(mission => {
            if (mission.isReceived) count++;
        });
        return count;
    }
    public getDailyReceiveCount(): number {
        const promotion = UserInfo.instance().getPromotionInfo(HyperBountyDailyNormalPromotionInfo.PromotionKeyName);
        if (!TSUtility.isValid(promotion)) return 0;
        let count =0;
        promotion.arrMission.forEach(mission => {
            if (mission.isComplete && !mission.isReceived) count++;
        });
        return count;
    }
    public getDailyNextResetDate(): number {
        const promotion = UserInfo.instance().getPromotionInfo(HyperBountyDailyNormalPromotionInfo.PromotionKeyName);
        return TSUtility.isValid(promotion) ? promotion.numNextResetDate :0;
    }
    public getSuperReceiveCount(): number {
        const superMission = this.getSuperMissionInfo();
        return TSUtility.isValid(superMission) && superMission.isComplete && !superMission.isReceived ?1 :0;
    }
    public getSuperNextResetDate(): number {
        const promotion = UserInfo.instance().getPromotionInfo(HyperBountyDailySuperPromotionInfo.PromotionKeyName);
        return TSUtility.isValid(promotion) ? promotion.numNextResetDate :0;
    }
    public getSuperMissionInfo(): any | null {
        const promotion = UserInfo.instance().getPromotionInfo(HyperBountyDailySuperPromotionInfo.PromotionKeyName);
        return TSUtility.isValid(promotion) ? promotion.infoMission : null;
    }
    public getRunningMissionIndex(): number {
        const promotion = UserInfo.instance().getPromotionInfo(HyperBountyDailyNormalPromotionInfo.PromotionKeyName);
        if (!TSUtility.isValid(promotion)) return 0;
        for (let i=0; i < promotion.arrMission.length; i++) {
            const mission = promotion.arrMission[i];
            if (!mission.isReceived && !mission.isComplete) return i;
        }
        return -1;
    }

    // ===================== 【倍率事件相关】 =====================
    /** 是否开启2倍积分事件 */
    public is2XEventActive(): boolean {
        const promotion = UserInfo.instance().getPromotionInfo(HyperBountyPassPromotionInfo.PromotionKeyName);
        return TSUtility.isValid(promotion) && promotion.isCheckedBoostUser && promotion.numPointBoostRate >1;
    }
    /** 是否可参与2倍积分事件 */
    public isPlay2XEventAction(): boolean {
        const promotion = UserInfo.instance().getPromotionInfo(HyperBountyPassPromotionInfo.PromotionKeyName);
        const storageDate = ServerStorageManager.getAsNumber(StorageKeyType.HYPER_BOUNTY_2X_SEASON_END_DATE);
        return TSUtility.isValid(promotion) && this.is2XEventOn && !(storageDate >= promotion.numNextResetDate);
    }

    // ===================== 【弹窗调度核心方法】 =====================
    /** 打开超级赏金主弹窗 */
    public openHyperBountyPopup(openInfo: HyperBountyPopupOpenInfo): void {
        if (!TSUtility.isValid(openInfo) || this._isOpenMainPopup) {
            openInfo.openFail();
            return;
        }
        PopupManager.Instance().showDisplayProgress(true);
        // HyperBountyPopup.getPopup((err: any, popup: HyperBountyPopup) => {
        //     PopupManager.Instance().showDisplayProgress(false);
        //     if (TSUtility.isValid(err)) {
        //         openInfo.openFail();
        //         return;
        //     }
        //     this._isOpenMainPopup = true;
        //     TSUtility.isValid(openInfo.funcLoad) && openInfo.funcLoad!();
        //     popup.setOpenComplete(() => { TSUtility.isValid(openInfo.funcOpen) && openInfo.funcOpen!(); });
        //     popup.setCloseCallback(() => {
        //         if (ServiceInfoManager.BOOL_IS_OPEN_NEW_SEASON_HYPER_BOUNTY) {
        //             PopupManager.Instance().showDisplayProgress(true);
        //             HyperBountyPopup.getPopup((err2: any, popup2: HyperBountyPopup) => {
        //                 PopupManager.Instance().showDisplayProgress(false);
        //                 if (!TSUtility.isValid(err2)) {
        //                     popup2.setCloseCallback(() => {
        //                         this._isOpenMainPopup = false;
        //                         TSUtility.isValid(openInfo.funcClose) && openInfo.funcClose!();
        //                     });
        //                     popup2.open(openInfo.eType);
        //                 }
        //             });
        //         } else {
        //             this._isOpenMainPopup = false;
        //             TSUtility.isValid(openInfo.funcClose) && openInfo.funcClose!();
        //         }
        //     });
        //     popup.open(openInfo.eType);
        // });
    }

    // ===================== 【事件回调】赛季任务完成更新 =====================
    public updateCompleteSeasonMission(msgType: string, oldVal: any, newVal: any): void {
        if (msgType !== HyperBountySeasonPromotionInfo.PromotionKeyName) return;
        const oldPromotion = UserInfo.instance().getPromotionInfo(HyperBountySeasonPromotionInfo.PromotionKeyName);
        const newPromotion = newVal;
        if (!TSUtility.isValid(oldPromotion) || !TSUtility.isValid(newPromotion) || oldPromotion.numNextResetDate !== newPromotion.numNextResetDate) return;
        
        const oldMissionArr = this.getSeasonAllMission(oldPromotion);
        const newMissionArr = this.getSeasonAllMission(newPromotion);
        if (!TSUtility.isValid(oldMissionArr) || !TSUtility.isValid(newMissionArr)) return;

        // 筛选未领取的完成任务
        const completeOldMission: Array<any> = [];
        oldMissionArr.forEach(mission => {
            if (TSUtility.isValid(mission) && mission.isComplete && !mission.isReceived) completeOldMission.push(mission);
        });

        const needOpenPopupMission: Array<any> = [];
        completeOldMission.forEach(mission => {
            const findMission = newMissionArr.find((v: any) => v.numClientIndex === mission.numClientIndex);
            if (!TSUtility.isValid(findMission) || findMission.isComplete) return;
            needOpenPopupMission.push(mission);
        });

        // 调度任务完成弹窗
        if (needOpenPopupMission.length <= 0) return;
        // needOpenPopupMission.forEach(mission => {
        //     if (!TSUtility.isValid(mission)) return;
        //     const popupInfo = new PopupManager.OpenPopupInfo();
        //     popupInfo.type = "HyperBountySeasonMissionCompletePopup";
        //     popupInfo.openCallback = () => {
        //         PopupManager.Instance().showDisplayProgress(true);
        //         HyperBountySeasonMissionCompletePopup.getPopup((err: any, popup: HyperBountySeasonMissionCompletePopup) => {
        //             PopupManager.Instance().showDisplayProgress(false);
        //             if (TSUtility.isValid(err)) {
        //                 PopupManager.Instance().checkNextOpenPopup();
        //                 return;
        //             }
        //             popup.setCloseCallback(() => {
        //                 this.scheduleOnce(() => { PopupManager.Instance().checkNextOpenPopup(); }, this._isOpenMainPopup ? 0.5 : 0);
        //             });
        //             popup.open(mission.numClientIndex);
        //         });
        //     };
        //     this._arrCompletedSeasonMissionArray.push({ openPopupInfo: popupInfo, hyperBountyMissionInfo: mission });
        // });
    }
}