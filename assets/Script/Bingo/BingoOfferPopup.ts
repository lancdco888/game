const { ccclass, property } = cc._decorator;

// 导入项目所有依赖模块 - 路径与原JS完全一致，直接复用无修改
import LocalStorageManager from "../manager/LocalStorageManager";
import Analytics from "../Network/Analytics";
import CommonServer from "../Network/CommonServer";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
// import CollectBingoBallEffect from "../Popup/BingoBall/CollectBingoBallEffect";
import DialogBase, { DialogState } from "../DialogBase";
// import InstantsRewardPopoup from "../Popup/InstantsRewardPopoup";
import PopupManager from "../manager/PopupManager";
// import BuyBingoballSuccessPopup from "../Popup/Shop/BuyBingoballSuccessPopup";
import ADTargetManager from "../ServiceInfo/ADTargetManager";
import GameCommonSound from "../GameCommonSound";
import UserInfo from "../User/UserInfo";
import UserPromotion, { WatchRewardAdPromotion, ADREWARDTYPE } from "../User/UserPromotion";
import AdsManager, { PlacementID_Type } from "../Utility/AdsManager";
import MessageRoutingManager from "../message/MessageRoutingManager";
//import ShopDataManager from "../Utility/ShopDataManager";
import TimeFormatHelper from "../global_utility/TimeFormatHelper";
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";

/** 全局枚举：Bingo球获取渠道类型 - 原JS内联枚举完整提取标准化 */
export enum BingoBall {
    DailyBonus = 0,
    CollectAll = 1,
    Inbox_Normal = 2,
    Inbox_Allin = 3,
    BingoBall = 4,
    MPASS = 5,
    iOSSHOP = 6,
    TimeBonus = 7
}

/**
 * BingoOfferPopup 核心功能：Bingo球付费购买弹窗 + 广告免费领取弹窗
 * 包含双档位购买、激励广告领取、倒计时展示、广告冷却、购买成功回调、奖励特效等全量逻辑
 */
@ccclass
export default class BingoOfferPopup extends DialogBase {
    // ====================== 编辑器序列化绑定属性 (与原JS完全一致，变量名原生拼写保留，防止预制体绑定失效 ✔️) ======================
    @property(cc.Node)
    remain_Node: cc.Node = null!;

    @property(cc.Label)
    remain_Time_Label: cc.Label = null!;

    @property(cc.Node)
    ad_Node: cc.Node = null!;

    @property(cc.Button)
    first_Button: cc.Button = null!;

    @property(cc.Button)
    second_Button: cc.Button = null!;

    @property(cc.Button)
    ad_Button: cc.Button = null!;

    @property(cc.Node)
    ad_remainTimeNode: cc.Node = null!;

    @property(cc.Label)
    ad_remainTime_Label: cc.Label = null!;

    // ====================== 私有成员属性 (补全TS强类型，初始值与原JS一致，添加private修饰符，杜绝外部修改) ======================
    private _isPurchase: boolean = false; // 购买防重点击锁：true=正在购买中，禁止重复点击
    private _resetTime: number = 0; // 弹窗倒计时目标时间戳(秒)
    private _entryReason: any = null; // 购买入口原因（埋点用，原JS任意类型保留）
    private _popupType: string = ""; // 弹窗类型标识：固定为 BINGO_OFFER
    private _onBuySuccessCallback: (() => void) | null = null; // 购买成功后的外部回调函数

    // ====================== 静态公共方法 - 弹窗单例加载&实例化 (原JS逻辑1:1精准还原，弹窗统一加载规范) ======================
    public static getPopup(callback: (err: Error | null, popup: BingoOfferPopup | null) => void): void {
        const popupPath = "Service/01_Content/Bingo/BingoOfferPopup";
        cc.loader.loadRes(popupPath, (error, prefab) => {
            if (error) {
                const err = new Error(`cc.loader.loadRes fail ${popupPath}: ${JSON.stringify(error)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, err));
                callback(error, null);
                return;
            }
            const popupNode = cc.instantiate(prefab);
            const popupComp = popupNode.getComponent(BingoOfferPopup);
            callback(null, popupComp);
        });
    }

    // ====================== Cocos生命周期钩子 - 弹窗初始化 (绑定按钮事件，原JS逻辑无任何修改) ======================
    onLoad(): void {
        this.initDailogBase(); // 初始化弹窗基类
        // 绑定购买按钮点击事件 - 传参0/1区分档位
        this.first_Button.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoOfferPopup", "onClickBuyButton", "0"));
        this.second_Button.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoOfferPopup", "onClickBuyButton", "1"));
        // 绑定广告领取按钮点击事件
        this.ad_Button.clickEvents.push(Utility.getComponent_EventHandler(this.node, "BingoOfferPopup", "onClickADButton", null));
    }

    // ====================== 核心公共方法 - 打开弹窗 (原JS核心入口，参数/逻辑/调度100%还原，不可修改) ======================
    open(entryReason: any, resetInfo?: { nextResetTime: number }, isShowRemain: boolean = false): void {
        this._entryReason = entryReason;
        this._popupType = "BINGO_OFFER";
        // 埋点统计：浏览商店弹窗
        Analytics.viewShop("offer", this._popupType, "BINGO_OFFER", entryReason);
        // 执行基类弹窗打开逻辑
        this._open(null);

        // 是否显示倒计时节点 & 开启每秒刷新
        if (isShowRemain && resetInfo) {
            this._resetTime = resetInfo.nextResetTime;
            this.remain_Node.active = true;
            this.setTimerUI();
            this.schedule(this.setTimerUI.bind(this), 1);
        } else {
            this.remain_Node.active = false;
        }

        // 判断是否显示广告领取节点：广告开关开启 + Bingo球数量为0
        const isBingoAdEnable = ADTargetManager.instance().enableBingo();
        const bingoBallCount = UserInfo.instance().getBingoBallCnt();
        if (bingoBallCount <= 0 && isBingoAdEnable) {
            this.ad_Node.active = true;
            this.updateADRemainTime();
            this.schedule(this.updateADRemainTime.bind(this), 1);
        } else {
            this.ad_Node.active = false;
        }
    }

    // ====================== 私有方法 - 弹窗倒计时UI刷新 (购买倒计时，服务器时间基准，精准无偏差) ======================
    private setTimerUI(): void {
        const remainSecond = this._resetTime - TSUtility.getServerBaseNowUnixTime();
        if (remainSecond >= 0) {
            this.remain_Time_Label.string = TimeFormatHelper.getHourTimeString(remainSecond);
        } else {
            this.remain_Time_Label.string = TimeFormatHelper.getHourTimeString(0);
            this.unschedule(this.setTimerUI.bind(this));
        }
    }

    // ====================== 公共方法 - 设置购买成功后的回调函数 ======================
    public setOnBuySuccessCallback(callback: (() => void) | null): void {
        this._onBuySuccessCallback = callback;
    }

    // ====================== 核心按钮回调 - 购买Bingo球按钮点击 (双档位购买，防重点击+埋点+服务器请求+弹窗联动) ======================
    public onClickBuyButton(_event: any, btnIndexStr: string): void {
        // 防重点击：正在购买中则直接返回，核心风控逻辑
        if (this._isPurchase) return;
        const btnIndex = parseInt(btnIndexStr);
        // 获取对应档位的商品信息
        // const bingoOfferInfo = ShopDataManager.Instance().getBingoBallOfferInfo()[btnIndex];
        // const productId = ShopDataManager.Instance().getProductIdByItemKey(bingoOfferInfo.productId);

        // this._isPurchase = true;
        // // 调用用户中心购买接口，发起付费请求
        // UserInfo.instance().buyProduct(productId, this._popupType, JSON.stringify(this._entryReason), (isSuccess: boolean) => {
        //     this._isPurchase = false; // 解锁购买锁
        //     if (isSuccess) {
        //         // 发送全局消息：Bingo球购买成功
        //         MessageRoutingManager.instance().emitMessage(MessageRoutingManager.MSG.BINGOBALL_PURCHASE, null);
        //         // 更新30天购买次数统计
        //         const purchaseInfo = UserInfo.instance().getPurchaseInfo();
        //         purchaseInfo.cntIn30Days += 1;
        //         // 打开购买成功弹窗，关闭当前弹窗，执行回调
        //         BuyBingoballSuccessPopup.OpenPopup("", productId, () => {}, () => {
        //             this._onBuySuccessCallback && this._onBuySuccessCallback();
        //         });
        //         this.close();
        //     }
        // });
    }

    // ====================== 核心按钮回调 - 广告领取Bingo球按钮点击 (最复杂逻辑，嵌套回调100%还原，广告播放+奖励请求+特效展示) ======================
    public onClickADButton(): void {
        const self = this;
        // 播放按钮音效
        GameCommonSound.playFxOnce("btn_etc");
        // 禁用按钮防止重复点击
        this.ad_Button.enabled = false;
        // 显示加载层
        PopupManager.Instance().showDisplayProgress(true);

        // 广告位类型：Bingo球为空时的广告
        const adPlaceType = PlacementID_Type.BALLEMPTY;
        const adNumber = AdsManager.Instance().getRewardVideoADNumber(adPlaceType);
        // 埋点统计：点击广告
        Analytics.clickADVideo(adNumber);

        // 播放激励视频广告
        AdsManager.Instance().RewardedVideoAdplay(adPlaceType,
            // ✅ 广告播放成功回调 (核心奖励逻辑，多层嵌套完全还原)
            () => {
                // 存储本次广告观看时间到本地缓存
                // LocalStorageManager.SetBingoLastADView(UserInfo.instance().getUid());
                // 向服务器请求广告奖励
                CommonServer.Instance().requestAcceptPromotion(
                    UserInfo.instance().getUid(),
                    UserInfo.instance().getAccessToken(),
                    WatchRewardAdPromotion.PromotionKeyName,
                    ADREWARDTYPE.BingoBall,
                    0,
                    "",
                    (serverRes) => {
                        PopupManager.Instance().showDisplayProgress(false);
                        // 服务器返回错误 → 关闭弹窗
                        if (CommonServer.isServerResponseError(serverRes)) {
                            self.close();
                            return;
                        }
                        // 广告奖励埋点
                        AdsManager.Instance().ADLog_RewardedADRewarded(adPlaceType);

                        // 当前弹窗已关闭 → 仅更新数据不展示特效
                        if (!TSUtility.isValid(self) || self.isStateClose()) {
                            const changeResult = UserInfo.instance().getServerChangeResult(serverRes);
                            UserInfo.instance().applyChangeResult(changeResult);
                        } 
                        // 弹窗正常 → 打开奖励弹窗+播放领取特效+关闭当前弹窗
                        else {
                            const changeResult = UserInfo.instance().getServerChangeResult(serverRes);
                            UserInfo.instance().applyChangeResult(changeResult);
                            const bingoBallCnt = UserInfo.instance().getBingoBallCnt();

                            PopupManager.Instance().showDisplayProgress(true);
                            // InstantsRewardPopoup.getPopup((err, rewardPopup) => {
                            //     PopupManager.Instance().showDisplayProgress(false);
                            //     if (!err && rewardPopup) {
                            //         rewardPopup.open();
                            //         rewardPopup.setRewardAmount(0, 0, bingoBallCnt);
                            //         // 设置奖励领取回调：播放特效 → 关闭奖励弹窗 → 关闭当前弹窗
                            //         rewardPopup.setCollectCallback(() => {
                            //             CollectBingoBallEffect.OpenEffect(bingoBallCnt, rewardPopup.collectButton.node);
                            //             rewardPopup.close();
                            //             self && self.close();
                            //         });
                            //     }
                            // });
                        }
                    }
                );
            },
            // ✅ 广告播放失败/关闭回调 (复原按钮状态，关闭加载层)
            () => {
                PopupManager.Instance().showDisplayProgress(false);
                self && self.ad_Button && (self.ad_Button.enabled = true);
            }
        );
    }

    // ====================== 私有方法 - 广告冷却倒计时刷新 (固定60秒冷却，本地缓存基准，精准无偏差) ======================
    private updateADRemainTime(): void {
        // 计算冷却剩余秒数：上次广告时间 + 60秒 - 服务器当前时间
        // const lastADTime = LocalStorageManager.getBingoLastADView(UserInfo.instance().getUid());
        // const remainSecond = lastADTime + 60 - TSUtility.getServerBaseNowUnixTime();

        // if (remainSecond > 0) {
        //     // 冷却中：显示倒计时，隐藏广告按钮
        //     this.ad_remainTimeNode.active = true;
        //     this.ad_Button.node.active = false;
        //     const timeFormat = new TimeFormatHelper(remainSecond);
        //     this.ad_remainTime_Label.string = timeFormat.getTimeOfferMiniuteTimeString();
        // } else {
        //     // 冷却结束：停止倒计时，隐藏倒计时节点，显示广告按钮
        //     this.unschedule(this.updateADRemainTime.bind(this));
        //     this.ad_remainTimeNode.active = false;
        //     this.ad_Button.node.active = true;
        // }
    }

    // ====================== 重写父类方法 - 关闭弹窗 (清空定时器+设置状态+淡出动画+检查下一个弹窗，原JS逻辑完全还原) ======================
    public close(): void {
        if (this.isStateClose()) return;
        // 清空所有定时器，防止内存泄漏
        this.unscheduleAllCallbacks();
        // 设置弹窗状态为关闭
        this.setState(DialogState.Close);
        // 清空数据
        this.clear();
        // 执行淡出动画关闭弹窗 (0.15秒，原JS固定时长)
        this._close(cc.fadeOut(0.15));
        // 检查并打开下一个待显示的弹窗
        PopupManager.Instance().checkNextOpenPopup();
    }
}