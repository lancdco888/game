import UserInfo from "../User/UserInfo";
import UserPromotion from "../User/UserPromotion";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import ShopPromotionManager from "../message/ShopPromotionManager";
import ADBannerDataManager, { ADBannerInfoType, ADBannerType } from "./ADBannerDataManager";

const { ccclass } = cc._decorator;



/**
 * 广告横幅管理器（单例）
 * 负责管理广告横幅的展示类型、季节促销类型同步、条件回调触发逻辑
 */
@ccclass("ADBannerManager")
export default class ADBannerManager extends cc.Component {
    // ===== 单例实例 =====
    private static _instance: ADBannerManager | null = null;

    // ===== 私有成员变量 =====
    /** 条件回调函数列表 */
    private _arrConditionCallbacks: Array<() => void> = [];
    /** 当前季节促销类型key */
    private _strCurrentSeasonalType: string = "";
    /** 上一次的最大购买金额 */
    private _numPrevMaxPurchase: number = 0;
    /** 是否已触发过回调（避免重复触发） */
    private _isCalledFunc: boolean = false;
    /** Bingo条件添加标记 */
    private _isBingoAdd: boolean = false;

    /**
     * 获取单例实例（懒加载+初始化）
     */
    public static get instance(): ADBannerManager {
        if (!ADBannerManager._instance) {
            ADBannerManager._instance = new ADBannerManager();
            ADBannerManager._instance.initialize();
        }
        return ADBannerManager._instance;
    }

    // ===== 初始化方法 =====
    /**
     * 初始化管理器
     * - 重置回调列表
     * - 同步当前季节促销类型
     * - 启动1秒间隔的条件检查
     */
    private initialize(): void {
        this._arrConditionCallbacks = [];
        this._isCalledFunc = false;
        this.setCurrentSeasonalType();
        // 每1秒检查一次回调条件
        this.schedule(this.checkConditionCallBack, 1);
    }

    // ===== 季节促销类型管理 =====
    /**
     * 设置当前季节促销类型（同步ShopPromotionManager的季节促销信息）
     */
    private setCurrentSeasonalType(): void {
        const popupSeasonalInfo = ShopPromotionManager.Instance().getSeasonalPromotionInfo_PopupType();
        const shopSeasonalInfo = ShopPromotionManager.Instance().getSeasonalPromotionInfo_ShopType();

        if (popupSeasonalInfo) {
            this._strCurrentSeasonalType = popupSeasonalInfo.key;
        } else if (shopSeasonalInfo) {
            this._strCurrentSeasonalType = shopSeasonalInfo.key;
        }
    }

    // ===== 横幅类型数组获取（不同场景） =====
    /**
     * 获取大厅（Lobby）横幅位置类型数组
     */
    public getADBannerTypeArray_Lobby(): ADBannerType[] {
        // 更新上一次最大购买金额 + 同步季节促销类型
        this._numPrevMaxPurchase = 0;//UserInfo.instance().getUserServiceInfo().maxPurchaseCash;
        this.setCurrentSeasonalType();

        const bannerTypes: ADBannerType[] = [ADBannerType.LOBBY_FIRST];
        // 非iOS FB Instant商店环境，添加第二组大厅横幅
        if (!SDefine.FB_Instant_iOS_Shop_Flag) {
            bannerTypes.push(ADBannerType.LOBBY_SECOND);
        }
        return bannerTypes;
    }

    /**
     * 获取套房（Suite）横幅位置类型数组
     */
    public getADBannerTypeArray_Suite(): ADBannerType[] {
        // 更新上一次最大购买金额 + 同步季节促销类型
        this._numPrevMaxPurchase = 0;//UserInfo.instance().getUserServiceInfo().maxPurchaseCash;
        this.setCurrentSeasonalType();

        const bannerTypes: ADBannerType[] = [];
        bannerTypes.push(ADBannerType.SHOP);
        return bannerTypes;
    }

    /**
     * 获取默认横幅信息类型数组
     */
    public getADBannerInfoTypeArray_Default(): ADBannerInfoType[] {
        this.setCurrentSeasonalType();
        return ADBannerDataManager.instance.getDefaultTypeArray();
    }

    /**
     * 获取大厅第一组横幅信息类型数组
     */
    public getADBannerInfoTypeArray_LobbyFirst(): ADBannerInfoType[] {
        this.setCurrentSeasonalType();
        return ADBannerDataManager.instance.getLobbyFirstTypeArray();
    }

    /**
     * 获取大厅第二组横幅信息类型数组
     */
    public getADBannerInfoTypeArray_LobbySecond(): ADBannerInfoType[] {
        this.setCurrentSeasonalType();
        return ADBannerDataManager.instance.getLobbySecondTypeArray();
    }

    /**
     * 获取商店横幅信息类型数组
     */
    public getADBannerInfoTypeArray_Shop(): ADBannerInfoType[] {
        this.setCurrentSeasonalType();
        return ADBannerDataManager.instance.getShopTypeArray();
    }

    /**
     * 获取商店第一个横幅信息类型
     */
    public getADBannerInfoType_ShopFirst(): ADBannerInfoType | null {
        const shopBannerTypes = this.getADBannerInfoTypeArray_Shop();
        return shopBannerTypes.length <= 0 ? null : shopBannerTypes[0];
    }

    // ===== 条件回调管理 =====
    /**
     * 添加条件回调函数
     * @param callback 回调函数
     */
    public addConditionCallback(callback: () => void): void {
        this._arrConditionCallbacks.push(callback);
    }

    /**
     * 重置条件回调函数列表（清空）
     */
    public resetConditionCallback(): void {
        this._arrConditionCallbacks = [];
    }

    /**
     * 判断是否满足回调触发条件
     * 触发条件：
     * 1. Bingo活动时间条件满足
     * 2. 最大购买金额≥100且发生变化
     * 3. 季节促销类型发生变化
     */
    private isCallCondition(): boolean {
        // // 1. 检查Bingo活动条件
        // const bingoPromotion = UserInfo.instance().getPromotionInfo(UserPromotion.DailyBingoBallPromotion.PromotionKeyName);
        // if (!TSUtility.isValid(bingoPromotion)) {
        //     return false;
        // }

        // // 计算Bingo下次领取时间差
        // const timeDiff = bingoPromotion.nextReceiveTime - TSUtility.getServerBaseNowUnixTime();
        // // 根据_isBingoAdd判断时间条件（未添加时：时间差>0；已添加时：时间差≤0）
        // let isConditionMet = this._isBingoAdd ? (timeDiff <= 0) : (timeDiff > 0);

        // // 2. 检查最大购买金额变化条件
        // const currentMaxPurchase = 0;//UserInfo.instance().getUserServiceInfo().maxPurchaseCash;
        // if (currentMaxPurchase >= 100 && this._numPrevMaxPurchase !== currentMaxPurchase) {
        //     this._numPrevMaxPurchase = currentMaxPurchase;
        //     isConditionMet = true;
        // }

        // // 3. 检查季节促销类型变化条件
        // let currentSeasonalKey = "";
        // const popupSeasonalInfo = ShopPromotionManager.Instance().getSeasonalPromotionInfo_PopupType();
        // const shopSeasonalInfo = ShopPromotionManager.Instance().getSeasonalPromotionInfo_ShopType();
        
        // if (popupSeasonalInfo) {
        //     currentSeasonalKey = popupSeasonalInfo.key;
        // } else if (shopSeasonalInfo) {
        //     currentSeasonalKey = shopSeasonalInfo.key;
        // }

        // if (this._strCurrentSeasonalType !== currentSeasonalKey) {
        //     this._strCurrentSeasonalType = currentSeasonalKey;
        //     isConditionMet = true;
        // }

        // return isConditionMet;
        return false;
    }

    /**
     * 检查条件并触发回调（定时执行，1秒/次）
     */
    private checkConditionCallBack(): void {
        const shouldCall = this.isCallCondition();
        
        if (shouldCall) {
            // 未触发过回调时，执行所有回调函数
            if (!this._isCalledFunc) {
                this._isCalledFunc = true;
                for (let i = 0; i < this._arrConditionCallbacks.length; i++) {
                    const callback = this._arrConditionCallbacks[i];
                    if (TSUtility.isValid(callback)) {
                        callback();
                    }
                }
            }
        } else {
            // 条件不满足时，重置触发标记
            this._isCalledFunc = false;
        }
    }
}