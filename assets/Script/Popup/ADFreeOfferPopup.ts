const { ccclass, property } = cc._decorator;

import DialogBase, { DialogState } from "../DialogBase";
import PopupManager from "../manager/PopupManager";
import LocalStorageManager from "../manager/LocalStorageManager";
import Analytics from "../Network/Analytics";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import ServiceInfoManager from "../ServiceInfoManager";
import GameCommonSound from "../GameCommonSound";
import UserInfo from "../User/UserInfo";
import AdsManager, { PlacementID_Type } from "../Utility/AdsManager";
import TimeFormatHelper from "../global_utility/TimeFormatHelper";
import TSUtility from "../global_utility/TSUtility";
import ServerStorageManager, { StorageKeyType } from "../manager/ServerStorageManager";
import { Utility } from "../global_utility/Utility";

@ccclass
export default class ADFreeOfferPopup extends DialogBase {
    // ===================== 编辑器绑定属性 =====================
    @property(cc.Animation)
    private openAnimation: cc.Animation = null;

    @property
    private popupType: number = 0; // 1=看广告解锁弹窗 2=倒计时展示弹窗

    @property(cc.Label)
    private time_Label: cc.Label = null;

    @property(cc.Button)
    private ok_Button: cc.Button = null;

    @property(cc.Label)
    private oriLabel: cc.Label = null;

    @property(cc.Label)
    private coinLabel: cc.Label = null;

    @property(cc.Label)
    private priceLabel: cc.Label = null;

    // ===================== 私有成员变量 =====================
    private _itemInfo: any = null;
    private _remainTime: number = 0;

    // ===================== 静态公共方法 =====================
    /**
     * 动态加载并获取弹窗实例
     * @param popupType 弹窗类型 1/2
     * @param callback 加载完成回调 (err, popup实例)
     */
    public static getPopup(popupType: number, callback: (err: Error, popup: ADFreeOfferPopup) => void): void {
        if (callback) PopupManager.Instance().showDisplayProgress(true);
        const resPath = `Service/01_Offer/ADS_Offer/OfferPopup_${popupType}`;

        cc.loader.loadRes(resPath, (err, prefab) => {
            if (callback) PopupManager.Instance().showDisplayProgress(false);
            
            if (err) {
                const error = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                callback && callback(error, null);
                return;
            }

            if (callback) {
                const node = cc.instantiate(prefab);
                const popup = node.getComponent(ADFreeOfferPopup);
                node.active = false;
                callback(null, popup);
            }
        });
    }

    // ===================== 生命周期回调 =====================
    protected onLoad(): void {
        this.initDailogBase();
        // 设置遮罩层尺寸为画布全屏
        const canvasNode = cc.director.getScene().getComponentInChildren(cc.Canvas).node;
        this.blockingBG.setContentSize(canvasNode.getContentSize());
        // 绑定按钮点击事件
        this.ok_Button.clickEvents.push(Utility.getComponent_EventHandler(this.node, "ADFreeOfferPopup", "onClickButton", ""));
    }

    // ===================== 公共方法 =====================
    /**
     * 打开弹窗(核心方法)
     * @returns 当前弹窗实例
     */
    public open(): ADFreeOfferPopup {
        // 广告埋点-展示免费广告弹窗UI
        AdsManager.Instance().ADLog_RewardedADShowUI(PlacementID_Type.ADSFREE);
        // 播放弹窗音效
        GameCommonSound.playFxOnce("pop_etc");
        // 执行父类弹窗打开逻辑
        this._open(null);

        // 修复原JS的动画播放顺序BUG：原顺序stop→play→setCurrentTime 会导致动画播放异常
        this.openAnimation.stop();
        this.openAnimation.setCurrentTime(0);
        this.openAnimation.play();

        // 本地存储标记-已打开免费广告弹窗
        // LocalStorageManager.setOpenADFreeOffer(UserInfo.instance().getUid());

        // 类型2弹窗-开启24小时倒计时(86400秒)
        if (this.popupType === 2) {
            this._remainTime = 86400;
            const timeFormat = new TimeFormatHelper(this._remainTime);
            this.time_Label.string = timeFormat.getHourTimeString();
            
            // 每秒刷新倒计时
            this.schedule(() => {
                this._remainTime--;
                if (this._remainTime < 0) {
                    this.close();
                } else {
                    const timeFormat = new TimeFormatHelper(this._remainTime);
                    this.time_Label.string = timeFormat.getHourTimeString();
                }
            }, 1);
        }

        // 关闭全局弹窗开关，防止重复弹出
        ServiceInfoManager.BOOL_ENABLE_ADS_FREE_POPUP = false;
        return this;
    }

    // ===================== 事件回调 =====================
    /**
     * 确认按钮点击事件
     */
    public onClickButton(): void {
        GameCommonSound.playFxOnce("btn_etc");
        // 类型1弹窗-播放激励广告
        if (this.popupType === 1) {
            const placementId = PlacementID_Type.ADSFREE;
            const adNum = AdsManager.Instance().getRewardVideoADNumber(placementId);
            
            // 广告埋点-点击广告
            Analytics.clickADVideo(adNum);

            // 播放激励视频广告
            AdsManager.Instance().RewardedVideoAdplay(
                placementId,
                // 广告播放成功回调
                () => {
                    ServerStorageManager.saveCurrentServerTime(StorageKeyType.ADS_FREE);
                    AdsManager.Instance().ADLog_RewardedADRewarded(placementId);
                    PopupManager.Instance().showDisplayProgress(true);

                    const oldCloseCallback = this.closeCallback;
                    this.setCloseCallback(null);

                    // 加载类型2的弹窗并打开
                    ADFreeOfferPopup.getPopup(2, (err, popup) => {
                        PopupManager.Instance().showDisplayProgress(false);
                        if (!err) {
                            popup.open();
                            if (TSUtility.isValid(oldCloseCallback)) {
                                popup.setCloseCallback(oldCloseCallback);
                            }
                        }
                    });
                    this.close();
                },
                // 广告播放失败/关闭回调 (测试环境兼容逻辑)
                () => {
                    if (!TSUtility.isLiveService()) {
                        ServerStorageManager.saveCurrentServerTime(StorageKeyType.ADS_FREE);
                        PopupManager.Instance().showDisplayProgress(true);

                        const oldCloseCallback = this.closeCallback;
                        this.setCloseCallback(null);

                        ADFreeOfferPopup.getPopup(2, (err, popup) => {
                            PopupManager.Instance().showDisplayProgress(false);
                            if (!err) {
                                popup.open();
                                if (TSUtility.isValid(oldCloseCallback)) {
                                    popup.setCloseCallback(oldCloseCallback);
                                }
                            }
                        });
                        this.close();
                    }
                }
            );
        } else {
            // 类型2弹窗-直接关闭
            this.close();
        }
    }

    /**
     * 关闭按钮点击事件
     */
    public onClickClose(): void {
        GameCommonSound.playFxOnce("btn_etc");
        this.close();
    }

    /**
     * 关闭弹窗(重写父类方法)
     */
    public close(): void {
        if (this.isStateClose()) return;
        // 清除所有定时器，防止内存泄漏
        this.unscheduleAllCallbacks();
        this.setState(DialogState.Close);
        this.clear();
        // 执行淡出关闭动画(0.3秒)
        this._close(DialogBase.getFadeOutAction(0.3));
    }
}