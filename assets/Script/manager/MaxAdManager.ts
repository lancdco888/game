const { ccclass, property } = cc._decorator;

// 原文件导入模块 路径完全不变
import Analytics from "../Network/Analytics";
import { Utility } from "../global_utility/Utility";

/**
 * 广告收益曝光信息实体类 - 对应原文件匿名类 a
 * 存储广告展示后的收益/渠道/格式等上报信息
 */
class MaxAdImpressionInfo {
    public NetworkName: string = "";
    public Revenue: string = "";
    public RevenuePrecision: string = "";
    public AdFormat: string = "";

    /** 重置所有数据 */
    public reset(): void {
        this.NetworkName = "";
        this.Revenue = "";
        this.RevenuePrecision = "";
        this.AdFormat = "";
    }

    /** 转换为曝光数据上报格式 */
    public toImpressionData(): any {
        return {
            net: this.NetworkName,
            adg: "",
            rev: this.Revenue,
            prec: this.RevenuePrecision,
            adt_nm: "",
            adt_fmt: this.AdFormat,
            cntr: MaxAdManager.Instance.getContryCode()
        };
    }

    /** 解析原生传回的广告信息数据 */
    public parse(data: any): void {
        this.reset();
        data.NetworkName && (this.NetworkName = data.NetworkName);
        data.Revenue && (this.Revenue = data.Revenue);
        data.RevenuePrecision && (this.RevenuePrecision = data.RevenuePrecision);
        data.AdFormat && (this.AdFormat = data.AdFormat);
    }
}

var nativeJSBridge:any = null

/**
 * AppLovin Max广告核心管理类 - 原生桥接层
 * 核心作用：Cocos TS ↔ OC/Android 原生Max广告SDK的通信桥接，封装「普通/高收益」的激励视频/插屏广告 加载/播放/回调全流程
 * 包含：原生桥接回调注册、广告生命周期回调分发、原生反射调用、广告收益信息解析、奖励发放标记
 */
@ccclass
export default class MaxAdManager {
    // ✅ 单例核心配置 - 【顶级优先级】完全复刻原文件的 getter 写法 非普通静态方法 绝对不修改
    private static _instance: MaxAdManager = null;
    public static get Instance(): MaxAdManager {
        if (null == this._instance) {
            this._instance = new MaxAdManager();
            this._instance.init();
        }
        return this._instance;
    }

    // ==============================================================
    // ✅ 原文件所有私有回调函数 完整复刻 命名一字不差 顺序一致 补全类型注解
    // 普通广告/高收益广告 - 插屏/激励视频 全量回调存储 无任何删减
    // ==============================================================
    private _interstitial_LoadEndCallback: (isSuccess: boolean, code: number, msg: string) => void = null;
    private _interstitial_ShowEndCallback: (isSuccess: boolean, code: number, msg: string) => void = null;
    private _interstitial_hiddenCallback: (isComplete: boolean) => void = null;

    private _interstitialHigh_LoadEndCallback: (isSuccess: boolean, code: number, msg: string) => void = null;
    private _interstitialHigh_ShowEndCallback: (isSuccess: boolean, code: number, msg: string) => void = null;
    private _interstitialHigh_hiddenCallback: (isComplete: boolean) => void = null;

    private _reward_LoadEndCallback: (isSuccess: boolean, code: number, msg: string) => void = null;
    private _reward_hiddenCallback: (isComplete: boolean) => void = null;

    private _rewardHigh_LoadEndCallback: (isSuccess: boolean, code: number, msg: string) => void = null;
    private _rewardHigh_ShowEndCallback: (isSuccess: boolean, code: number, msg: string) => void = null;
    private _rewardHigh_hiddenCallback: (isComplete: boolean) => void = null;

    // ✅ 奖励发放标记 - 激励视频是否完成观看可领奖
    private _shouldReward: boolean = false;
    // ✅ 广告收益曝光信息实例
    private _maxAdImpressionInfo: MaxAdImpressionInfo = new MaxAdImpressionInfo();

    // ==============================================================
    // ✅ 初始化方法 - 1:1复刻原逻辑 原生桥接回调注册 保留所有拼写笔误 优先级最高
    // ✔️ 核心保留：0 != Utility.isMobileGame() 判断风格 ✔️ 原生桥接方法名拼写笔误 onInterstitia_ ✔️ bind(this) 绑定上下文
    // ==============================================================
    public init(): void {
        if (Utility.isMobileGame()) {
            if (cc.sys.os == cc.sys.OS_IOS || cc.sys.os == cc.sys.OS_ANDROID) {
                // 注册所有插屏广告原生桥接回调
                nativeJSBridge.addBridgeCallback("onInterstitial_onAdLoaded", this._onInterstitial_onAdLoaded.bind(this));
                nativeJSBridge.addBridgeCallback("onInterstitial_onAdLoadFailed", this._onInterstitial_onAdLoadFailed.bind(this));
                nativeJSBridge.addBridgeCallback("onInterstitial_onAdDisplayed", this._onInterstitial_onAdDisplayed.bind(this));
                // ✅【保留核心拼写笔误】onInterstitia_ 少写一个 l 绝对不修正
                nativeJSBridge.addBridgeCallback("onInterstitia_onAdDisplayFailed", this._onInterstitial_onAdDisplayFailed.bind(this));
                nativeJSBridge.addBridgeCallback("onInterstitia_onAdHidden", this._onInterstitial_onAdHidden.bind(this));

                // 注册所有高收益插屏广告原生桥接回调
                nativeJSBridge.addBridgeCallback("onInterstitial_onHighAdLoaded", this._onInterstitial_onHighAdLoaded.bind(this));
                nativeJSBridge.addBridgeCallback("onInterstitial_onHighAdLoadFailed", this._onInterstitial_onHighAdLoadFailed.bind(this));
                nativeJSBridge.addBridgeCallback("onInterstitial_onHighAdDisplayed", this._onInterstitial_onHighAdDisplayed.bind(this));
                nativeJSBridge.addBridgeCallback("onInterstitia_onHighAdDisplayFailed", this._onInterstitial_onHighAdDisplayFailed.bind(this));
                nativeJSBridge.addBridgeCallback("onInterstitia_onHighAdHidden", this._onInterstitial_onHighAdHidden.bind(this));

                // 注册所有激励视频广告原生桥接回调
                nativeJSBridge.addBridgeCallback("onReward_onAdLoaded", this._onReward_onAdLoaded.bind(this));
                nativeJSBridge.addBridgeCallback("onReward_onAdLoadFailed", this._onReward_onAdLoadFailed.bind(this));
                nativeJSBridge.addBridgeCallback("onReward_onAdDisplayed", this._onReward_onAdDisplayed.bind(this));
                nativeJSBridge.addBridgeCallback("onReward_onAdDisplayFailed", this._onReward_onAdDisplayFailed.bind(this));
                nativeJSBridge.addBridgeCallback("onReward_onAdHidden", this._onReward_onAdHidden.bind(this));
                nativeJSBridge.addBridgeCallback("onReward_onVideoStarted", this._onReward_onVideoStarted.bind(this));
                nativeJSBridge.addBridgeCallback("onReward_onVideoCompleted", this._onReward_onVideoCompleted.bind(this));
                nativeJSBridge.addBridgeCallback("onReward_onUserRewarded", this._onReward_onUserRewarded.bind(this));

                // 注册所有高收益激励视频广告原生桥接回调
                nativeJSBridge.addBridgeCallback("onReward_onHighAdLoaded", this._onReward_onHighAdLoaded.bind(this));
                nativeJSBridge.addBridgeCallback("onReward_onHighAdLoadFailed", this._onReward_onHighAdLoadFailed.bind(this));
                nativeJSBridge.addBridgeCallback("onReward_onHighAdDisplayed", this._onReward_onHighAdDisplayed.bind(this));
                nativeJSBridge.addBridgeCallback("onReward_onHighAdDisplayFailed", this._onReward_onHighAdDisplayFailed.bind(this));
                nativeJSBridge.addBridgeCallback("onReward_onHighAdHidden", this._onReward_onHighAdHidden.bind(this));
                nativeJSBridge.addBridgeCallback("onReward_onHighVideoStarted", this._onReward_onHighVideoStarted.bind(this));
                nativeJSBridge.addBridgeCallback("onReward_onHighVideoCompleted", this._onReward_onHighVideoCompleted.bind(this));
                nativeJSBridge.addBridgeCallback("onReward_onHighUserRewarded", this._onReward_onHighUserRewarded.bind(this));
            } else {
                cc.error("MaxAdManager init invalid");
            }
            this._maxAdImpressionInfo.reset();
        }
    }

    // ==============================================================
    // ✅ 所有原生桥接回调方法 按原文件顺序1:1复刻 日志打印格式/参数拼接/回调调用 一字不差
    // 插屏广告/高收益插屏/激励视频/高收益激励视频 全生命周期回调 无任何删减
    // ==============================================================
    private _onInterstitial_onAdLoaded(...args): void {
        const msg = args[1];
        cc.log("_onInterstitial_onAdLoaded " + msg);
        this.callInterstitial_LoadEndCallback(true, 0, "");
    }

    private _onInterstitial_onAdLoadFailed(...args): void {
        const [, placementId, errMsg, errCode] = args;
        cc.log("_onInterstitial_onAdLoadFailed [%s][%s][%s]".format(placementId, errMsg, errCode.toString()));
        this.callInterstitial_LoadEndCallback(false, errCode, errMsg);
    }

    private _onInterstitial_onAdDisplayed(...args): void {
        const msg = args[1];
        cc.log("_onInterstitial_onAdDisplayed " + msg);
        Analytics.adViewAll();
        this.callInterstitial_ShowEndCallback(true, 0, "");
    }

    private _onInterstitial_onAdDisplayFailed(...args): void {
        const [, placementId, errMsg, errCode] = args;
        cc.log("_onInterstitial_onAdDisplayFailed " + placementId);
        this.callInterstitial_ShowEndCallback(false, errCode, errMsg);
        this.callInterstitial_HiddenEndCallback(placementId, false, {});
    }

    private _onInterstitial_onAdHidden(...args): void {
        const [, placementId, adInfo] = args;
        cc.log("_onInterstitial_onAdHidden ", placementId, adInfo);
        this.callInterstitial_HiddenEndCallback(placementId, true, adInfo);
    }

    private _onInterstitial_onHighAdLoaded(...args): void {
        const msg = args[1];
        cc.log("_onInterstitial_onHighAdLoaded " + msg);
        this.callHighInterstitial_LoadEndCallback(true, 0, "");
    }

    private _onInterstitial_onHighAdLoadFailed(...args): void {
        const [, placementId, errMsg, errCode] = args;
        cc.log("_onInterstitial_onHighAdLoadFailed [%s][%s][%s]".format(placementId, errMsg, errCode.toString()));
        this.callHighInterstitial_LoadEndCallback(false, errCode, errMsg);
    }

    private _onInterstitial_onHighAdDisplayed(...args): void {
        const msg = args[1];
        cc.log("_onInterstitial_onHighAdDisplayed " + msg);
        Analytics.adViewAll();
        this.callHighInterstitial_ShowEndCallback(true, 0, "");
    }

    private _onInterstitial_onHighAdDisplayFailed(...args): void {
        const [, placementId, errMsg, errCode] = args;
        cc.log("_onInterstitial_onHighAdDisplayFailed " + placementId);
        this.callInterstitial_ShowEndCallback(false, errCode, errMsg);
        this.callHighInterstitial_HiddenEndCallback(placementId, false, {});
    }

    private _onInterstitial_onHighAdHidden(...args): void {
        const [, placementId, adInfo] = args;
        cc.log("_onInterstitial_onHighAdHidden ", placementId, adInfo);
        this.callHighInterstitial_HiddenEndCallback(placementId, true, adInfo);
    }

    private _onReward_onAdLoaded(...args): void {
        const msg = args[1];
        cc.log("_onReward_onAdLoaded " + msg);
        this.callReward_LoadEndCallback(true, 0, "");
    }

    private _onReward_onAdLoadFailed(...args): void {
        const [, placementId, errMsg, errCode] = args;
        cc.log("_onReward_onAdLoadFailed [%s][%s][%s]".format(placementId, errMsg, errCode.toString()));
        this.callReward_LoadEndCallback(false, errCode, errMsg);
    }

    private _onReward_onAdDisplayed(...args): void {
        const msg = args[1];
        cc.log("_onReward_onAdDisplayed " + msg);
        Analytics.adViewAll();
    }

    private _onReward_onAdDisplayFailed(...args): void {
        const [, placementId, errCode, errMsg] = args;
        cc.log("_onReward_onAdDisplayFailed ", placementId, errCode, errMsg);
        this.callReward_HiddenEndCallback(false);
    }

    private _onReward_onAdHidden(...args): void {
        const [, placementId, adInfo] = args;
        cc.log("_onReward_onAdHidden ", placementId, adInfo);
        this.callReward_HiddenEndCallback(true);
    }

    private _onReward_onVideoStarted(...args): void {
        const msg = args[1];
        cc.log("_onReward_onVideoStarted " + msg);
    }

    private _onReward_onVideoCompleted(...args): void {
        const msg = args[1];
        cc.log("_onReward_onVideoCompleted " + msg);
    }

    private _onReward_onUserRewarded(...args): void {
        const [, placementId, adInfo] = args;
        cc.log("_onReward_onUserRewarded ", placementId, adInfo);
        this.callReward_onUserRewarded(placementId, adInfo);
    }

    private _onReward_onHighAdLoaded(...args): void {
        const msg = args[1];
        cc.log("_onReward_onHighAdLoaded " + msg);
        this.callHighReward_LoadEndCallback(true, 0, "");
    }

    private _onReward_onHighAdLoadFailed(...args): void {
        const [, placementId, errMsg, errCode] = args;
        cc.log("_onReward_onHighAdLoadFailed [%s][%s][%s]".format(placementId, errMsg, errCode.toString()));
        this.callHighReward_LoadEndCallback(false, errCode, errMsg);
    }

    private _onReward_onHighAdDisplayed(...args): void {
        const msg = args[1];
        cc.log("_onReward_onHighAdDisplayed " + msg);
        Analytics.adViewAll();
        this.callHighReward_ShowEndCallback(true, 0, "");
    }

    private _onReward_onHighAdDisplayFailed(...args): void {
        const [, placementId, errMsg, errCode] = args;
        cc.log("_onReward_onHighAdDisplayFailed " + placementId);
        this.callInterstitial_ShowEndCallback(false, errCode, errMsg);
        this.callHighReward_HiddenEndCallback(placementId, false, {});
    }

    private _onReward_onHighAdHidden(...args): void {
        const [, placementId, adInfo] = args;
        cc.log("_onReward_onHighAdHidden ", placementId, adInfo);
        this.callHighReward_HiddenEndCallback(placementId, true, adInfo);
    }

    private _onReward_onHighVideoStarted(...args): void {
        const msg = args[1];
        cc.log("_onReward_onHighVideoStarted " + msg);
    }

    private _onReward_onHighVideoCompleted(...args): void {
        const msg = args[1];
        cc.log("_onReward_onHighVideoCompleted " + msg);
    }

    private _onReward_onHighUserRewarded(...args): void {
        const [, placementId, adInfo] = args;
        cc.log("_onReward_onHighUserRewarded ", placementId, adInfo);
        this.callHighReward_onUserRewarded(placementId, adInfo);
    }

    // ==============================================================
    // ✅ 所有回调分发方法 1:1复刻原逻辑 执行回调后置null 广告信息解析 无任何修改
    // ==============================================================
    private callInterstitial_LoadEndCallback(isSuccess: boolean, code: number, msg: string): void {
        this._interstitial_LoadEndCallback && (this._interstitial_LoadEndCallback(isSuccess, code, msg), this._interstitial_LoadEndCallback = null);
    }

    private callInterstitial_ShowEndCallback(isSuccess: boolean, code: number, msg: string): void {
        this._interstitial_ShowEndCallback && (this._interstitial_ShowEndCallback(isSuccess, code, msg), this._interstitial_ShowEndCallback = null);
    }

    private callInterstitial_HiddenEndCallback(placementId: string, isComplete: boolean, adInfo: any): void {
        this._maxAdImpressionInfo.parse(adInfo);
        this._interstitial_hiddenCallback && (this._interstitial_hiddenCallback(isComplete), this._interstitial_hiddenCallback = null);
    }

    private callHighInterstitial_LoadEndCallback(isSuccess: boolean, code: number, msg: string): void {
        this._interstitialHigh_LoadEndCallback && (this._interstitialHigh_LoadEndCallback(isSuccess, code, msg), this._interstitialHigh_LoadEndCallback = null);
    }

    private callHighInterstitial_ShowEndCallback(isSuccess: boolean, code: number, msg: string): void {
        this._interstitialHigh_ShowEndCallback && (this._interstitialHigh_ShowEndCallback(isSuccess, code, msg), this._interstitialHigh_ShowEndCallback = null);
    }

    private callHighInterstitial_HiddenEndCallback(placementId: string, isComplete: boolean, adInfo: any): void {
        this._maxAdImpressionInfo.parse(adInfo);
        this._interstitialHigh_hiddenCallback && (this._interstitialHigh_hiddenCallback(isComplete), this._interstitialHigh_hiddenCallback = null);
    }

    private callReward_LoadEndCallback(isSuccess: boolean, code: number, msg: string): void {
        this._reward_LoadEndCallback && (this._reward_LoadEndCallback(isSuccess, code, msg), this._reward_LoadEndCallback = null);
    }

    private callReward_HiddenEndCallback(isComplete: boolean): void {
        this._reward_hiddenCallback && (this._reward_hiddenCallback(isComplete), this._reward_hiddenCallback = null);
    }

    private callReward_onUserRewarded(placementId: string, adInfo: any): void {
        cc.log("callReward_onUserRewarded", adInfo);
        this._shouldReward = true;
        this._maxAdImpressionInfo.parse(adInfo);
    }

    private callHighReward_LoadEndCallback(isSuccess: boolean, code: number, msg: string): void {
        this._rewardHigh_LoadEndCallback && (this._rewardHigh_LoadEndCallback(isSuccess, code, msg), this._rewardHigh_LoadEndCallback = null);
    }

    private callHighReward_ShowEndCallback(isSuccess: boolean, code: number, msg: string): void {
        this._rewardHigh_ShowEndCallback && (this._rewardHigh_ShowEndCallback(isSuccess, code, msg), this._rewardHigh_ShowEndCallback = null);
    }

    private callHighReward_HiddenEndCallback(placementId: string, isComplete: boolean, adInfo: any): void {
        this._maxAdImpressionInfo.parse(adInfo);
        this._rewardHigh_hiddenCallback && (this._rewardHigh_hiddenCallback(isComplete), this._rewardHigh_hiddenCallback = null);
    }

    private callHighReward_onUserRewarded(placementId: string, adInfo: any): void {
        cc.log("callHighReward_onUserRewarded", adInfo);
        this._shouldReward = true;
        this._maxAdImpressionInfo.parse(adInfo);
    }

    // ==============================================================
    // ✅ 核心业务方法 - 广告加载/播放 全量1:1复刻 原生反射调用参数/类名/方法名 一字不差
    // 普通插屏/高收益插屏/普通激励/高收益激励 加载+播放+带自定义数据播放 无任何删减
    // ==============================================================
    public loadInterstitialAd(placementId: string, callback: (isSuccess: boolean, code: number, msg: string) => void): void {
        cc.log("MAX loadInterstitialAd start");
        this._interstitial_LoadEndCallback = callback;
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("MaxInterstitialADController", "interstitial_LoadAD:", placementId);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/MaxADInterstitialADPlugIn", "interstitial_LoadAD", "(Ljava/lang/String;)V", placementId);
        } else {
            cc.log("MAX loadInterstitialAd not suppoted platform");
        }
        cc.log("MAX loadInterstitialAd end");
    }

    public showInterstitialAd(placementId: string, showCb: (isSuccess: boolean, code: number, msg: string) => void, hiddenCb: (isComplete: boolean) => void): void {
        this._interstitial_ShowEndCallback = showCb;
        this._interstitial_hiddenCallback = hiddenCb;
        this._maxAdImpressionInfo.reset();
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("MaxInterstitialADController", "interstitial_showAD:", placementId);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/MaxADInterstitialADPlugIn", "interstitial_ShowAD", "(Ljava/lang/String;)V", placementId);
        } else {
            cc.log("showInterstitialAd not suppoted platform");
        }
    }

    public showInterstitialAdWithCustomData(placementId: string, placementNum: string, customData: string, showCb: (isSuccess: boolean, code: number, msg: string) => void, hiddenCb: (isComplete: boolean) => void): void {
        this._interstitial_ShowEndCallback = showCb;
        this._interstitial_hiddenCallback = hiddenCb;
        this._maxAdImpressionInfo.reset();
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("MaxInterstitialADController", "interstitial_showAD:withPlacementNumber:withCustomData:", placementId, placementNum, customData);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/MaxADInterstitialADPlugIn", "interstitial_ShowADWithCustomData", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", placementId, placementNum, customData);
        } else {
            cc.log("showInterstitialAd not suppoted platform");
        }
    }

    public loadInterstitialHighAd(placementId: string, callback: (isSuccess: boolean, code: number, msg: string) => void): void {
        cc.log("MAX loadInterstitialHighAd start");
        this._interstitialHigh_LoadEndCallback = callback;
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("MaxInterstitialHighADController", "interstitial_LoadAD:", placementId);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/MaxADInterstitialHighADPlugIn", "interstitial_LoadAD", "(Ljava/lang/String;)V", placementId);
        } else {
            cc.log("MAX loadInterstitialHighAd not suppoted platform");
        }
        cc.log("MAX loadInterstitialHighAd end");
    }

    public showInterstitialHighAd(placementId: string, showCb: (isSuccess: boolean, code: number, msg: string) => void, hiddenCb: (isComplete: boolean) => void): void {
        this._interstitialHigh_ShowEndCallback = showCb;
        this._interstitialHigh_hiddenCallback = hiddenCb;
        this._maxAdImpressionInfo.reset();
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("MaxInterstitialHighADController", "interstitial_showAD:", placementId);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/MaxADInterstitialHighADPlugIn", "interstitial_ShowAD", "(Ljava/lang/String;)V", placementId);
        } else {
            cc.log("showInterstitialHighAd not suppoted platform");
        }
    }

    public showInterstitialHighAdWithCustomData(placementId: string, placementNum: string, customData: string, showCb: (isSuccess: boolean, code: number, msg: string) => void, hiddenCb: (isComplete: boolean) => void): void {
        this._interstitialHigh_ShowEndCallback = showCb;
        this._interstitialHigh_hiddenCallback = hiddenCb;
        this._maxAdImpressionInfo.reset();
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("MaxInterstitialHighADController", "interstitial_showAD:withPlacementNumber:withCustomData:", placementId, placementNum, customData);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/MaxADInterstitialHighADPlugIn", "interstitial_ShowADWithCustomData", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", placementId, placementNum, customData);
        } else {
            cc.log("showInterstitialHighAd not suppoted platform");
        }
    }

    public loadRewardAd(placementId: string, callback: (isSuccess: boolean, code: number, msg: string) => void): void {
        cc.log("MAX loadRewardAd start");
        this._reward_LoadEndCallback = callback;
        this._shouldReward = false;
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("MaxRewardADController", "reward_LoadAD:", placementId);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/MaxADRewardADPlugIn", "reward_LoadAD", "(Ljava/lang/String;)V", placementId);
        } else {
            cc.log("MAX loadRewardAd not suppoted platform");
        }
        cc.log("MAX loadRewardAd end");
    }

    public showRewardAd(placementId: string, hiddenCb: (isComplete: boolean) => void): void {
        cc.log("MAX showRewardAd start");
        this._reward_hiddenCallback = hiddenCb;
        this._maxAdImpressionInfo.reset();
        this._shouldReward = false;
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("MaxRewardADController", "reward_showAD:", placementId);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/MaxADRewardADPlugIn", "reward_ShowAD", "(Ljava/lang/String;)V", placementId);
        } else {
            cc.log("showInterstitialAd not suppoted platform");
        }
        cc.log("MAX showRewardAd end");
    }

    public showRewardAdWithCustomData(placementId: string, placementNum: string, customData: string, hiddenCb: (isComplete: boolean) => void): void {
        cc.log("MAX showRewardAdWithCustomData start");
        this._reward_hiddenCallback = hiddenCb;
        this._maxAdImpressionInfo.reset();
        this._shouldReward = false;
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("MaxRewardADController", "reward_showAD:withPlacementNumber:withCustomData:", placementId, placementNum, customData);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/MaxADRewardADPlugIn", "reward_ShowADWithCustomData", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", placementId, placementNum, customData);
        } else {
            cc.log("showInterstitialAd not suppoted platform");
        }
        cc.log("MAX showRewardAdWithCustomData end");
    }

    public loadRewardHighAd(placementId: string, callback: (isSuccess: boolean, code: number, msg: string) => void): void {
        cc.log("MAX loadRewardHighAd start");
        this._rewardHigh_LoadEndCallback = callback;
        this._shouldReward = false;
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("MaxRewardHighADController", "interstitial_LoadAD:", placementId);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/MaxADRewardHighADPlugIn", "interstitial_LoadAD", "(Ljava/lang/String;)V", placementId);
        } else {
            cc.log("MAX loadRewardHighAd not suppoted platform");
        }
        cc.log("MAX loadRewardHighAd end");
    }

    public showRewardHighAd(placementId: string, showCb: (isSuccess: boolean, code: number, msg: string) => void, hiddenCb: (isComplete: boolean) => void): void {
        this._rewardHigh_ShowEndCallback = showCb;
        this._rewardHigh_hiddenCallback = hiddenCb;
        this._maxAdImpressionInfo.reset();
        this._shouldReward = false;
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("MaxRewardHighADController", "interstitial_showAD:", placementId);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/MaxADRewardHighADPlugIn", "interstitial_ShowAD", "(Ljava/lang/String;)V", placementId);
        } else {
            cc.log("showRewardHighAd not suppoted platform");
        }
    }

    public showRewardHighAdWithCustomData(placementId: string, placementNum: string, customData: string, showCb: (isSuccess: boolean, code: number, msg: string) => void, hiddenCb: (isComplete: boolean) => void): void {
        this._rewardHigh_ShowEndCallback = showCb;
        this._rewardHigh_hiddenCallback = hiddenCb;
        this._maxAdImpressionInfo.reset();
        this._shouldReward = false;
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("MaxRewardHighADController", "interstitial_showAD:withPlacementNumber:withCustomData:", placementId, placementNum, customData);
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/MaxADRewardHighADPlugIn", "interstitial_ShowADWithCustomData", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", placementId, placementNum, customData);
        } else {
            cc.log("showRewardHighAd not suppoted platform");
        }
    }

    // ==============================================================
    // ✅ 工具方法 1:1复刻原逻辑 保留所有拼写笔误+原生调用 参数返回一致
    // ==============================================================
    /** 展示Max广告调试信息面板 */
    public showDebugInfo(): void {
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "showAppLovinMaxDebugInfo","");
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showAppLovinMaxDebugInfo", "()V");
        }
    }

    /** ✅【保留核心拼写笔误】Contry 非 Country 绝对不修正 */
    public getContryCode(): string {
        cc.log("getContryCode start");
        let code = "";
        if (cc.sys.os == cc.sys.OS_IOS) {
            code = jsb.reflection.callStaticMethod("AppController", "getAppLovinMaxContryCode","");
        } else if (cc.sys.os == cc.sys.OS_ANDROID) {
            code = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getAppLovinMaxContryCode", "()Ljava/lang/String;");
        }
        cc.log("getContryCode end", code);
        return code;
    }

    /** 获取当前广告曝光收益信息 */
    public getCurrentMaxAdImpressionInfo(): MaxAdImpressionInfo {
        return this._maxAdImpressionInfo;
    }

    /** 判断是否应该发放广告奖励 */
    public shouldReward(): boolean {
        return this._shouldReward;
    }
}