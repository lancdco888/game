const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import TSUtility from "../global_utility/TSUtility";
import UserInfo from "../User/UserInfo";
import SDefine from "../global_utility/SDefine";
import FBInstantUtil from "./FBInstantUtil";
import NativeUtil from "../global_utility/NativeUtil";
import { Utility } from "../global_utility/Utility";

// ==============================================================
// ✅ 原文件4个核心日志状态枚举 完整导出 命名/属性/值 一字不差 顺序一致 无任何修改
// 广告日志上报P2参数的状态常量 - V1/V2版本 激励视频/插屏广告 全量保留
// ==============================================================
export const ADLogV1_RewardedAD_P2Type = {
    ShowUI: "s",
    Closed: "c",
    Rewarded: "r"
};

export const ADLogV1_InterstitialAD_P2Type = {
    ShowUI: "s",
    Match: "m",
    Impression: "i",
    Closed: "c"
};

export const ADLogV2_RewardedAD_P2Type = {
    ShowUI: "p",
    Started: "s",
    Closed: "c",
    Rewarded: "r",
    Failed: "f",
    Loaded: "l"
};

export const ADLogV2_Interstitial_P2Type = {
    ShowUI: "p",
    Started: "s",
    Shown: "c",
    Closed: "r",
    Failed: "f",
    Loaded: "l"
};

/**
 * 广告日志上报核心管理类 - 全局单例
 * 核心作用：封装广告全生命周期行为的日志上报逻辑，对接广告统计后台，区分V2版本激励视频/插屏广告上报，拼接标准化上报参数
 */
@ccclass
export default class ADLogServer {
    // ✅ 单例核心配置 - 完全复刻原文件的单例写法 命名一致
    private static _inst: ADLogServer = null;

    // ✅ 获取全局单例实例 - 原文件逻辑一字不差 无任何修改
    public static Instance(): ADLogServer {
        if (null == ADLogServer._inst) {
            ADLogServer._inst = new ADLogServer();
        }
        return ADLogServer._inst;
    }

    // ==============================================================
    // ✅ 核心上报方法1 - V2版本 激励视频广告日志上报 1:1复刻所有逻辑 优先级最高
    // 完整保留：参数补全/上报地址/参数拼接/VIP等级规则/网络请求 所有细节无删减
    // ==============================================================
    public requestRewardVideoLog_v2(p2Type: string, p4Val: number, extParams: any = {}): void {
        // 扩展参数默认空对象 原文件逻辑保留
        extParams || (extParams = {});
        // 拼接市场信息
        extParams.market = this.getMarketInfo();
        // 移动端拼接AppsFlyerID
        Utility.isMobileGame() && (extParams.af_id = NativeUtil.getAppsFlyerUID());
        
        // 区分正式/测试环境上报地址
        const reportUrl = TSUtility.isLiveService() ? SDefine.SUNDAYTOZAD_LIVE_URL : SDefine.SUNDAYTOZAD_DEV_URL;
        // 获取用户VIP等级 - 核心规则：加载/失败状态下 VIP等级和P4值强制为-1
        let vipLevel = UserInfo.instance().getUserVipInfo().level;
        let p4 = p4Val;
        if (p2Type !== ADLogV2_RewardedAD_P2Type.Loaded && p2Type !== ADLogV2_RewardedAD_P2Type.Failed) {
            // 非加载/失败 正常赋值
        } else {
            vipLevel = -1;
            p4 = -1;
        }

        // 拼接标准化上报参数体 - 原文件字段顺序/命名 一字不差
        const logParams = {
            tm: TSUtility.getServerBaseNowUnixTime(),
            game: this.getGameID(),
            uid: UserInfo.instance().getUid(),
            p1: "ad2",
            p2: p2Type,
            p3: vipLevel,
            p4: p4,
            os: this.getOSValueV2()
        };

        // 合并扩展参数到上报体
        if (void 0 !== extParams) {
            const paramKeys = Object.keys(extParams);
            for (let i = 0; i < paramKeys.length; ++i) {
                const key = paramKeys[i];
                logParams[key] = extParams[key];
            }
        }

        // 转为后台要求的JSON格式 发起网络请求 - 回调为空函数 完全复刻原逻辑
        const postData = JSON.stringify({ logs: [logParams] });
        Utility.httpCall(reportUrl, postData, () => {}, 0, { "Content-Type": "application/json" });
    }

    // ==============================================================
    // ✅ 核心上报方法2 - V2版本 插屏广告日志上报 1:1复刻所有逻辑 与激励视频同源逻辑
    // ==============================================================
    public requestInterstitialLog_v2(p2Type: string, p4Val: number, extParams: any = {}): void {
        // 扩展参数默认空对象 原文件逻辑保留
        extParams || (extParams = {});
        // 拼接市场信息
        extParams.market = this.getMarketInfo();
        // 移动端拼接AppsFlyerID
        Utility.isMobileGame() && (extParams.af_id = NativeUtil.getAppsFlyerUID());
        
        // 区分正式/测试环境上报地址
        const reportUrl = TSUtility.isLiveService() ? SDefine.SUNDAYTOZAD_LIVE_URL : SDefine.SUNDAYTOZAD_DEV_URL;
        // 获取用户VIP等级 - 核心规则：加载/失败状态下 VIP等级和P4值强制为-1
        let vipLevel = UserInfo.instance().getUserVipInfo().level;
        let p4 = p4Val;
        if (p2Type !== ADLogV2_Interstitial_P2Type.Loaded && p2Type !== ADLogV2_Interstitial_P2Type.Failed) {
            // 非加载/失败 正常赋值
        } else {
            vipLevel = -1;
            p4 = -1;
        }

        // 拼接标准化上报参数体 - 插屏广告P1固定为 adi2 区别于激励视频
        const logParams = {
            tm: TSUtility.getServerBaseNowUnixTime(),
            game: this.getGameID(),
            uid: UserInfo.instance().getUid(),
            p1: "adi2",
            p2: p2Type,
            p3: vipLevel,
            p4: p4,
            os: this.getOSValueV2()
        };

        // 合并扩展参数到上报体
        if (void 0 !== extParams) {
            const paramKeys = Object.keys(extParams);
            for (let i = 0; i < paramKeys.length; ++i) {
                const key = paramKeys[i];
                logParams[key] = extParams[key];
            }
        }

        // 转为后台要求的JSON格式 发起网络请求
        const postData = JSON.stringify({ logs: [logParams] });
        Utility.httpCall(reportUrl, postData, () => {}, 0, { "Content-Type": "application/json" });
    }

    // ==============================================================
    // ✅ 所有工具方法 按原文件顺序1:1复刻 逻辑完整无删减 保留所有判断风格/三元表达式
    // ==============================================================
    /**
     * 获取游戏ID - 核心区分FB小游戏/原生游戏
     */
    public getGameID(): number {
        return Utility.isFacebookInstant() ? 301 : 302;
    }

    /**
     * 获取V2版本OS标识 - 多层三元判断 完全复刻原逻辑 字符返回值固定(a/i/p)
     * a=安卓 i=iOS p=其他平台
     */
    public getOSValueV2(): string {
        return Utility.isFacebookInstant() 
            ? FBInstantUtil.isTargetPlatform([FBInstantUtil.PLATFORM_ANDROID]) ? "a" 
                : FBInstantUtil.isTargetPlatform([FBInstantUtil.PLATFORM_IOS]) ? "i" : "p"
            : cc.sys.os === cc.sys.OS_IOS ? "i" 
                : cc.sys.os === cc.sys.OS_ANDROID ? "a" : "p";
    }

    /**
     * 获取市场渠道信息 - 分支判断完整 日志报错逻辑保留 上报统计核心参数
     */
    public getMarketInfo(): string {
        if (Utility.isMobileGame()) {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                return "playstore";
            }
            if (cc.sys.os === cc.sys.OS_IOS) {
                return "appstore";
            }
        } else if (Utility.isFacebookInstant()) {
            return "fbinstant";
        }
        // 未知平台 打印错误日志 并返回默认值
        cc.error("getMarketInfo not found platform " + cc.sys.os, cc.sys.isNative);
        return "unknown_os";
    }
}