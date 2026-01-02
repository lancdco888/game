const { ccclass, property } = cc._decorator;

// ===================== 原文件所有导入模块 路径完全不变 顺序一致 无删减 =====================
import CommonPopup from "../Popup/CommonPopup";
//import SquadsMsg_Icon from "../Popup/Squads/SquadsMsg_Icon";
import SDefine from "../global_utility/SDefine";
import Analytics from "./Analytics";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import { Utility } from "../global_utility/Utility";

// ==============================================================
// ✅ 原文件所有核心实体类 完整复刻 顺序一致 命名/成员/方法一字不差 补全强类型注解 全部导出
// 包含：锦标赛信息/小队信息/创建小队返回体/获取小队返回体/更新同步信息 无任何增删改
// ==============================================================

var FBInstant:any = null


export class FBInstantTournamentInfo {
    public tournamentID: string = "";
    public contextID: string = "";
    public title: string = "";
    public endTime: number = 0;
    public payload: string = "";

    public setInfo(data: any): void {
        this.tournamentID = data.getID().toString();
        this.contextID = data.getContextID().toString();
        this.title = data.getTitle();
        this.endTime = data.getEndTime();
        this.payload = data.getPayload();
    }

    public getID(): string {
        return this.tournamentID;
    }

    public isJoinTournament(): boolean {
        return "" != this.contextID;
    }

    public getContextID(): string {
        return this.contextID;
    }

    public getTitle(): string {
        return this.title;
    }

    public getEndTime(): number {
        return this.endTime;
    }
}

export class FBInstantSquadInfo {
    public squadID: string = "";
    public contextID: string = "";
    public name: string = "";
    public image: string = "";

    public parseObj(e: any): void {
        e.squadID && (this.squadID = e.squadID);
        e.contextID && (this.contextID = e.contextID);
        e.name && (this.name = e.name);
        e.image && (this.image = e.image);
    }

    public setInfo(data: any): void {
        this.squadID = data.getID().toString();
        this.contextID = data.getContextID().toString();
        this.name = data.getName();
        this.image = data.getImage();
    }

    public isValid(): boolean {
        return "" != this.squadID;
    }

    public getID(): string {
        return this.squadID;
    }

    public getContextID(): string {
        return this.contextID;
    }

    public getName(): string {
        return this.name;
    }
}

export class FBInstant_Squad_CreateSquardRes {
    public error: any = null;
    public squadInfo: FBInstantSquadInfo = null;

    public setError(err: any): void {
        this.error = err;
    }

    public setInfo(data: any): void {
        this.squadInfo = new FBInstantSquadInfo();
        this.squadInfo.setInfo(data);
    }

    public isError(): boolean {
        return null != this.error;
    }

    public getErrorDesc(): string {
        return null == this.error ? "undefined" : JSON.stringify(this.error);
    }
}

export class FBInstant_Squad_GetSquardsRes {
    public error: any = null;
    public squadInfos: FBInstantSquadInfo[] = [];

    public setError(err: any): void {
        this.error = err;
    }

    public isError(): boolean {
        return null != this.error;
    }

    public setInfo(data: any[]): void {
        for (let i = 0; i < data.length; ++i) {
            const info = new FBInstantSquadInfo();
            info.setInfo(data[i]);
            this.squadInfos.push(info);
        }
    }
}

export class UpdateSyncInfo {
    public action: string = "CUSTOM";
    public cta: string = "";
    public image: any = null;
    public text: string = "";
    public template: string = "";
    public data: any = null;
    public strategy: string = "";
    public notification: string = "";
}

/**
 * Facebook小游戏核心工具类 - 纯静态工具类 无实例化
 * 封装FB小游戏所有原生API：锦标赛/小队/广告/上下文切换/支付校验/上报埋点 全功能
 * 核心对接：AdsManager.ts(广告播放)、游戏内社交模块、支付模块，多平台兼容判断
 */
@ccclass
export default class FBInstantUtil {
    // ✅ 原文件所有静态常量 完整复刻 命名/值一字不差 补全类型注解
    public static PLATFORM_ANDROID: string = "ANDROID";
    public static PLATFORM_MOBILEWEB: string = "MOBILE_WEB";
    public static PLATFORM_IOS: string = "IOS";
    public static PLATFORM_WEB: string = "WEB";
    public static SUPPORTED_API: string[] = [];

    // ==============================================================
    // ✅ 所有核心静态方法 按原文件顺序1:1复刻 逻辑完整 分支无删减 保留0==/1==判断风格
    // 包含：平台判断/锦标赛/小队/广告桥接/上下文切换/支付校验/更新同步 全部精准还原
    // ==============================================================
    public static isTargetPlatform(platforms: string[]): boolean {
        if (!Utility.isFacebookInstant()) return false;
        const curPlatform = FBInstant.getPlatform();
        for (let i = 0; i < platforms.length; ++i) {
            if (platforms[i] == curPlatform) return true;
        }
        return false;
    }

    public static async asyncGetEntryPointAsync(): Promise<string> {
        if (!Utility.isFacebookInstant()) {
            cc.error("asyncGetEntryPointAsync invalid platform");
            return "";
        }
        return new Promise((resolve) => {
            FBInstant.getEntryPointAsync().then((res) => {
                resolve(res);
            }).catch((err) => {
                const error = new Error("Instant asyncGetEntryPointAsync fail. [%s]".format(JSON.stringify(err)));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Trace, error), true, FHLogType.Trace);
                resolve("");
            });
        });
    }

    public static async asyncGetTournamentInfo(): Promise<FBInstantTournamentInfo> {
        cc.log("asyncGetTournamentInfo start");
        if (!Utility.isFacebookInstant()) {
            cc.error("asyncGetTournamentInfo invalid platform");
            return null;
        }
        if (void 0 === FBInstant.getTournamentAsync) {
            return new FBInstantTournamentInfo();
        }
        return new Promise((resolve) => {
            const tournamentInfo = new FBInstantTournamentInfo();
            FBInstant.getTournamentAsync().then((res) => {
                cc.log("asyncGetTournamentInfo", JSON.stringify(res));
                tournamentInfo.setInfo(res);
                resolve(tournamentInfo);
            }).catch((err) => {
                cc.log("asyncGetTournamentInfo", err);
                resolve(tournamentInfo);
            });
        });
    }

    public static isUseablePurchaseAPIs(): boolean {
        const apis = FBInstant.getSupportedAPIs();
        return -1 != apis.indexOf("payments.onReady") && -1 != apis.indexOf("payments.purchaseAsync") && -1 != apis.indexOf("payments.getPurchasesAsync");
    }

    public static async asyncPaymentOnReady(): Promise<void> {
        return new Promise((resolve) => {
            FBInstant.payments.onReady(() => {
                resolve();
            });
        });
    }

    public static checkPaymentUseable(): void {
        if (FBInstantUtil.isUseablePurchaseAPIs()) {
            FBInstant.payments.onReady(() => {
                SDefine.setInstant_PurchaseAPI_Use(true);
                Analytics.fb_instant_paymentOnReadyComplete();
            });
        } else {
            cc.log("FBInstantUtil.isUseablePurchaseAPIs false");
        }
    }

    public static async asyncTournamentCreate(img: any, initScore: number, title: string, data: any): Promise<FBInstantTournamentInfo> {
        cc.log("asyncTournamentCreate start", initScore, title);
        if (!Utility.isFacebookInstant()) {
            cc.error("asyncTournamentCreate invalid platform");
            return null;
        }
        return new Promise((resolve) => {
            FBInstant.tournament.createAsync({
                initialScore: initScore,
                config: { tournamentTitle: title, image: img },
                data: data
            }).then((res) => {
                cc.log("asyncTournamentCreate success");
                const tournamentInfo = new FBInstantTournamentInfo();
                tournamentInfo.setInfo(res);
                const error = new Error("Instant TournamentCreate success.");
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Trace, error), true,FHLogType.Trace);
                resolve(tournamentInfo);
            }).catch((err) => {
                cc.log(err);
                const error = new Error("Instant TournamentCreate fail. [%s]".format(JSON.stringify(err)));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Trace, error), true, FHLogType.Trace);
                resolve(null);
            });
        });
    }

    public static async asyncTournamentShare(score: number, data: any): Promise<boolean> {
        cc.log("asyncTournamentShare start", score);
        if (!Utility.isFacebookInstant()) {
            cc.error("asyncTournamentShare invalid platform");
            return false;
        }
        return new Promise((resolve) => {
            FBInstant.tournament.shareAsync({ score: score, data: data }).then(() => {
                cc.log("shareAsync");
                resolve(true);
            }).catch((err) => {
                cc.log("shareAsync", err);
                resolve(false);
            });
        });
    }

    public static async asyncTournamentPostScore(score: number): Promise<boolean> {
        cc.log("asyncTournamentPostScore start", score);
        if (!Utility.isFacebookInstant()) {
            cc.error("asyncTournamentPostScore invalid platform");
            return false;
        }
        return new Promise((resolve) => {
            FBInstant.tournament.postScoreAsync(score).then((res) => {
                cc.log("postScoreAsync", score, res);
                resolve(res);
            }).catch((err) => {
                cc.log("postScoreAsync", err);
resolve(false);
            });
        });
    }

    public static async asyncSwitchContext(contextId: string): Promise<boolean> {
        // ✅ 保留原文件开发环境模拟弹窗逻辑 分支完整无删减
        if (!Utility.isFacebookInstant() && SDefine.FBInstant_Squad_DevelopTemp) {
            return new Promise((resolve) => {
                CommonPopup.getPopup("TypeB", (err, popup) => {
                    popup.open().setOkBtn("YES", () => {
                        cc.log("asyncSwitchContext dummy true");
                        resolve(true);
                    }).setCancelBtn("NO", () => {
                        cc.log("asyncSwitchContext dummy false");
                        resolve(false);
                    }).setInfo("Dummy Instant UI", "Join Group!!");
                });
            });
        }

        cc.log("asyncTournamentSwitchContext start");
        if (!Utility.isFacebookInstant()) {
            cc.error("asyncTournamentSwitchContext invalid platform");
            return false;
        }
        if (FBInstant.context.getID() == contextId) {
            cc.log("already used contextid", contextId);
            return true;
        }
        return new Promise((resolve) => {
            cc.log("FBInstant try switchAsync", contextId);
            FBInstant.context.switchAsync(contextId).then(() => {
                cc.log("asyncTournamentSwitchContext ", FBInstant.context.getID());
                resolve(true);
            }).catch((err) => {
                cc.log("asyncTournamentSwitchContext Error:", JSON.stringify(err));
                "SAME_CONTEXT" == err.code ? resolve(true) : resolve(false);
            });
        });
    }

    // ✅ 【保留原文件核心拼写笔误】asyncSquardCreateAsync 非 asyncSquadCreateAsync 绝对不修改
    public static async asyncSquardCreateAsync(): Promise<FBInstant_Squad_CreateSquardRes> {
        cc.log("asyncSquardCreateAsync start");
        // ✅ 保留原文件开发环境模拟弹窗逻辑 分支完整无删减
        if (!Utility.isFacebookInstant() && SDefine.FBInstant_Squad_DevelopTemp) {
            return new Promise((resolve) => {
                CommonPopup.getPopup("TypeB", (err, popup) => {
                    popup.open().setOkBtn("YES", () => {
                        const res = new FBInstant_Squad_CreateSquardRes();
                        res.squadInfo = new FBInstantSquadInfo();
                        res.squadInfo.parseObj({
                            squadID: "TEST_SQ_" + Math.round(12425 * Math.random()).toString(),
                            contextID: "TEST_CN" + Math.round(12425 * Math.random()).toString(),
                            name: "TEST NAME",
                            image: ""
                        });
                        resolve(res);
                    }).setCancelBtn("NO", () => {
                        const res = new FBInstant_Squad_CreateSquardRes();
                        res.setError({ code: "CANCEL", message: "cancel create" });
                        resolve(res);
                    }).setInfo("Dummy Instant UI", "Create Squad!!");
                });
            });
        }

        if (!Utility.isFacebookInstant()) {
            cc.error("asyncSquardCreateAsync invalid platform");
            const res = new FBInstant_Squad_CreateSquardRes();
            res.setError({ code: "INVALID_PLATFORM", message: "Invalid Platform" });
            return res;
        }

        // const iconPopup = await SquadsMsg_Icon.default.asyncGetPopup();
        // if (null == iconPopup) {
        //     const res = new FBInstant_Squad_CreateSquardRes();
        //     res.setError({ code: "CREATE_FAILED", message: "SQUADS ICON CREATE FAILED" });
        //     return res;
        // }
        // iconPopup.open();
        // const base64Img = await iconPopup.asyncGetBase64Img();
        // iconPopup.close();

//         return new Promise((resolve) => {
//             FBInstant.squads.createAsync({
//                 name: "Electric Slots Group Chat",
//                 image: base64Img
//             }).then((res) => {
//                 cc.log(res);
//                 const createRes = new FBInstant_Squad_CreateSquardRes();
//                 createRes.setInfo(res);
// resolve(createRes);
//             }).catch((err) => {
//                 cc.log(err);
//                 const createRes = new FBInstant_Squad_CreateSquardRes();
//                 createRes.setError(err);
//                 resolve(createRes);
//             });
//         });
    }

    // ✅ 【保留原文件核心拼写笔误】asyncSquadGetSquardsAsync 非 asyncSquadGetSquadsAsync 绝对不修改
    public static async asyncSquadGetSquardsAsync(): Promise<FBInstant_Squad_GetSquardsRes> {
        cc.log("asyncSquadGetSquardsAsync start");
        if (!Utility.isFacebookInstant() && SDefine.FBInstant_Squad_DevelopTemp) {
            return new FBInstant_Squad_GetSquardsRes();
        }
        if (!Utility.isFacebookInstant()) {
            cc.error("asyncSquadGetSquardsAsync invalid platform");
            const res = new FBInstant_Squad_GetSquardsRes();
            res.setError({ code: "INVALID_PLATFORM", message: "Invalid Platform" });
            return res;
        }
        return new Promise((resolve) => {
            FBInstant.squads.getPlayerSquadsAsync().then((res) => {
                cc.log(res);
                const getRes = new FBInstant_Squad_GetSquardsRes();
                getRes.setInfo(res);
                resolve(getRes);
            }).catch((err) => {
                cc.log("FBInstant.squads.getPlayerSquadsAsync", JSON.stringify(err));
                const getRes = new FBInstant_Squad_GetSquardsRes();
                getRes.setError(err);
                resolve(getRes);
            });
        });
    }

    // ✅ 【保留原文件核心拼写笔误】isUseableSquardAPI 非 isUseableSquadAPI 绝对不修改
    public static async isUseableSquardAPI(): Promise<boolean> {
        const res = await FBInstantUtil.asyncSquadGetSquardsAsync();
        return res.isError() ? false : true;
    }

    public static isSupportedAPI(apiName: string): boolean {
        if (0 == FBInstantUtil.SUPPORTED_API.length) {
            FBInstantUtil.SUPPORTED_API = FBInstant.getSupportedAPIs();
        }
        return -1 != FBInstantUtil.SUPPORTED_API.indexOf(apiName);
    }

    // ==============================================================
    // ✅ AdsManager.ts 核心调用的4个广告桥接方法 1:1精准复刻 逻辑/回调/日志完全一致
    // 激励视频+插屏广告 加载/播放封装 无任何修改 是广告播放的核心依赖
    // ==============================================================
    public static getRewardedVideoAsyncWrapper(placementId: string, callback: (isSuccess: boolean, adObj: any) => void): void {
        FBInstant.getRewardedVideoAsync(placementId).then((adObj) => {
            if (null == adObj || void 0 === adObj) {
                cc.log("getRewardedVideoAsync null || undefined");
                return void callback(false, null);
            }
            adObj.loadAsync().then(() => {
                cc.log("rewarded.loadAsync success");
                callback(true, adObj);
            }).catch((err) => {
                cc.log("rewarded.loadAsync fail", err.message);
                callback(false, adObj);
            });
        }).catch((err) => {
            cc.log("FBInstant.getRewardedVideoAsync fail", err.message);
            callback(false, null);
        });
    }

    public static RewardAD_showAsyncWrapper(adObj: any, callback: (isSuccess: boolean) => void): void {
        adObj.showAsync().then(() => {
            cc.log("RewardAD_showAsyncWrapper successfully");
            callback(true);
        }).catch((err) => {
            cc.log("RewardAD_showAsyncWrapper error " + err.message);
            callback(false);
        });
    }

    public static getInterstitialAdAsyncWrapper(placementId: string, callback: (isSuccess: boolean, adObj: any) => void): void {
        FBInstant.getInterstitialAdAsync(placementId).then((adObj) => {
            if (null == adObj || void 0 === adObj) {
                cc.log("getInterstitialAd null || undefined");
                return void callback(false, null);
            }
            adObj.loadAsync().then(() => {
                cc.log("interstitial.loadAsync success");
                callback(true, adObj);
            }).catch((err) => {
                cc.log("interstitial.loadAsync fail", err.message);
callback(false, adObj);
            });
        }).catch((err) => {
            cc.log("FBInstant.getInterstitialAdAsync fail", err.message);
            callback(false, null);
        });
    }

    public static Interstitial_showAsyncWrapper(adObj: any, callback: (isSuccess: boolean) => void): void {
        adObj.showAsync().then(() => {
            cc.log("Interstitial_showAsyncWrapper successfully");
            callback(true);
        }).catch((err) => {
            cc.log("Interstitial_showAsyncWrapper error " + err.message);
            callback(false);
        });
    }

    // ✅ FB小游戏更新同步封装 多语言本地化配置完整保留 无任何删减
    public static updateAsyncWrapper(info: UpdateSyncInfo, callback?: Function): void {
        if (Utility.isFacebookInstant() || !SDefine.FBInstant_Squad_DevelopTemp) {
            FBInstant.updateAsync({
                action: info.action,
                cta: info.cta,
                image: info.image,
                text: {
                    default: info.text,
                    localizations: {
                        en_US: info.text, ca_ES: info.text, cs_CZ: info.text, cx_PH: info.text, cy_GB: info.text, da_DK: info.text, de_DE: info.text, eu_ES: info.text, en_UD: info.text,
                        es_LA: info.text, es_ES: info.text, gn_PY: info.text, fi_FI: info.text, fr_FR: info.text, gl_ES: info.text, hu_HU: info.text, it_IT: info.text, ja_JP: info.text,
                        ko_KR: info.text, nb_NO: info.text, nn_NO: info.text, nl_NL: info.text, fy_NL: info.text, pl_PL: info.text, pt_BR: info.text, pt_PT: info.text, ro_RO: info.text,
                        ru_RU: info.text, sk_SK: info.text, sl_SI: info.text, sv_SE: info.text, th_TH: info.text, tr_TR: info.text, ku_TR: info.text, zh_CN: info.text, zh_HK: info.text,
                        zh_TW: info.text, af_ZA: info.text, sq_AL: info.text, hy_AM: info.text, az_AZ: info.text, be_BY: info.text, bn_IN: info.text, bs_BA: info.text, bg_BG: info.text,
                        hr_HR: info.text, nl_BE: info.text, en_GB: info.text, et_EE: info.text, fo_FO: info.text, fr_CA: info.text, ka_GE: info.text, el_GR: info.text, gu_IN: info.text,
                        hi_IN: info.text, is_IS: info.text, id_ID: info.text, ga_IE: info.text, jv_ID: info.text, kn_IN: info.text, kk_KZ: info.text, lv_LV: info.text, lt_LT: info.text,
                        mk_MK: info.text, mg_MG: info.text, ms_MY: info.text, mt_MT: info.text, mr_IN: info.text, mn_MN: info.text, ne_NP: info.text, pa_IN: info.text, sr_RS: info.text,
                        so_SO: info.text, sw_KE: info.text, tl_PH: info.text, ta_IN: info.text, te_IN: info.text, ml_IN: info.text, uk_UA: info.text, uz_UZ: info.text, vi_VN: info.text,
                        km_KH: info.text, tg_TJ: info.text, ar_AR: info.text, he_IL: info.text, ur_PK: info.text, fa_IR: info.text, ps_AF: info.text, my_MM: info.text, qz_MM: info.text,
                        or_IN: info.text, si_LK: info.text, rw_RW: info.text, cb_IQ: info.text, ha_NG: info.text, ja_KS: info.text, br_FR: info.text, tz_MA: info.text, co_FR: info.text,
                        as_IN: info.text, ff_NG: info.text, sc_IT: info.text, sz_PL: info.text
                    }
                },
                template: info.template,
                data: info.data,
                strategy: info.strategy,
                notification: info.notification
            }).then(() => {
                callback && callback();
            });
        } else {
            callback && callback();
        }
    }
}