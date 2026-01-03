const { ccclass } = cc._decorator;

// ===================== 导入所有依赖模块 - 路径与原JS完全一致 精准无偏差 =====================
import ChangeResult from "./ChangeResult";
import CommonPopup from "../Popup/CommonPopup";
import TSUtility from "../global_utility/TSUtility";
import UserInfo from "../User/UserInfo";
import ServiceInfoManager from "../ServiceInfoManager";
import SDefine from "../global_utility/SDefine";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import LeagueShopInfo from "./LeagueShopInfo";
import HRVServiceUtil from "../HRVService/HRVServiceUtil";
import { Utility } from "../global_utility/Utility";

// ===================== 内部数据模型类1 - 所有模型类与原JS逻辑1:1复刻，解析方法完整保留 =====================
class ReqParamModel {
    url: string = "";
    postData: any = null;
    useQueue: boolean = true;
}

class PurchaseEntryReason {
    isClicked: boolean = false;
    entryPoint: string = "";
    couponItemUid: string = "";
    messageUid: string = "";

    constructor(entryPoint: string, isClicked: boolean) {
        this.entryPoint = entryPoint;
        this.isClicked = isClicked;
    }

    public static parseObj(obj: any): PurchaseEntryReason {
        const info = new PurchaseEntryReason("", false);
        if (obj == null) return info;
        if (obj.entryPoint !== undefined) info.entryPoint = obj.entryPoint;
        if (obj.isClicked !== undefined) info.isClicked = obj.isClicked;
        if (obj.couponItemUid !== undefined) info.couponItemUid = obj.couponItemUid;
        if (obj.messageUid !== undefined) info.messageUid = obj.messageUid;
        return info;
    }
}

class PurchasePayload_SmallInfo {
    p: string = "";
    m: string = "";

    public static parseFromInfo(productId: string, infoStr: string): PurchasePayload_SmallInfo {
        const entryReason = PurchaseEntryReason.parseObj(JSON.parse(infoStr));
        const info = new PurchasePayload_SmallInfo();
        info.p = productId;
        info.m = entryReason.messageUid;
        return info;
    }

    public static parseObj(obj: any): PurchasePayload_SmallInfo {
        const info = new PurchasePayload_SmallInfo();
        if (obj.p !== undefined) info.p = obj.p;
        if (obj.m !== undefined) info.m = obj.m;
        return info;
    }

    public getProductId(): string {
        return this.p;
    }

    public getExtraInfo(): string {
        const entryReason = new PurchaseEntryReason("", false);
        entryReason.messageUid = this.m;
        return JSON.stringify(entryReason);
    }
}

class UnProcessedPopupInfo {
    productId: string = "";
    purchaseTimeStamp: number = 0;
    changeResult: ChangeResult | null = null;

    public static newInst(productId: string, time: number, result: ChangeResult): UnProcessedPopupInfo {
        const info = new UnProcessedPopupInfo();
        info.productId = productId;
        info.purchaseTimeStamp = time;
        info.changeResult = result;
        return info;
    }
}

export enum FBShareType {
    WinShare = "WinShare"
}

class AcceptPromotionInfo {
    promotionKey: string = "";
    val1: number = 0;
    val2: number = 0;
    strVal: string = "";
}

class AcceptPromotionInfoMuti {
    uid: number = 0;
    promotionInfos: AcceptPromotionInfo[] = [];

    public addPromotion(key: string, v1: number, v2: number, sVal: string): void {
        const info = new AcceptPromotionInfo();
        info.promotionKey = key;
        info.val1 = v1;
        info.val2 = v2;
        info.strVal = sVal;
        this.promotionInfos.push(info);
    }
}

class RecommendSlotInfo {
    recommendationSlotList: any[] = [];

    public static parseObj(obj: any): RecommendSlotInfo {
        const info = new RecommendSlotInfo();
        if (obj.recommendationSlotList !== undefined) info.recommendationSlotList = obj.recommendationSlotList;
        return info;
    }
}

class RelatedSlotInfo {
    relatedSlotList: any[] = [];
    targetSlotID: string = "";

    public static parseObj(obj: any): RelatedSlotInfo {
        const info = new RelatedSlotInfo();
        if (obj.relatedSlotList !== undefined) info.relatedSlotList = obj.relatedSlotList;
        if (obj.targetSlotID !== undefined) info.targetSlotID = obj.targetSlotID;
        return info;
    }
}

class AuthToken {
    token: string = "";
    tokenType: number = 0;
}

class FacebookAuth {
    id: string = "";
    token: string = "";
}

class AppleAuth {
    id: string = "";
    token: string = "";
}

class LineAuth {
    id: string = "";
    token: string = "";
}

class Auth2Req {
    uid: number = 0;
    waccessDate: number = 0;
    serviceType: string = "";
    authToken: AuthToken | null = null;
    facebookAuth: FacebookAuth | null = null;
    appleAuth: AppleAuth | null = null;
    lineAuth: LineAuth | null = null;
    appleName: string = "";
    appleEmail: string = "";
    isRenewal: boolean = true;
}

class AuthLinkReq {
    uid: number = 0;
    facebookAuth: FacebookAuth | null = null;
    appleAuth: AppleAuth | null = null;
    lineAuth: LineAuth | null = null;
    audid: string = "";
    isForced: boolean = false;
    appleName: string = "";
    appleEmail: string = "";
    isRenewal: boolean = true;
}

class AuthError {
    code: number = 0;
    msg: string = "";

    public static parseObj(obj: any): AuthError {
        const info = new AuthError();
        if (obj == undefined) return info;
        if (obj.code !== undefined) info.code = obj.code;
        if (obj.msg !== undefined) info.msg = obj.msg;
        return info;
    }
}

class AuthLinkUserLevel {
    level: number = 0;
    exp: number = 0;
}

class AuthLinkUserVipLevel {
    level: number = 0;
    exp: number = 0;
    issueDate: number = 0;
}

class AuthLinkRes {
    error: any = null;
    isPossibleMerge: boolean = false;
    targetUID: number = 0;
    targetUserBingoBall: number = 0;
    targetUserLevel: AuthLinkUserLevel | null = null;
    targetUserName: string = "";
    targetUserTotalCoin: number = 0;
    targetUserVIP: AuthLinkUserVipLevel | null = null;
    uid: number = 0;

    public static parseObj(obj: any): AuthLinkRes {
        const info = new AuthLinkRes();
        if (obj.error !== undefined) info.error = obj.error;
        if (obj.isPossibleMerge !== undefined) info.isPossibleMerge = obj.isPossibleMerge;
        if (obj.targetUID !== undefined) info.targetUID = obj.targetUID;
        if (obj.targetUserBingoBall !== undefined) info.targetUserBingoBall = obj.targetUserBingoBall;
        if (obj.targetUserLevel !== undefined) info.targetUserLevel = obj.targetUserLevel;
        if (obj.targetUserName !== undefined) info.targetUserName = obj.targetUserName;
        if (obj.targetUserTotalCoin !== undefined) info.targetUserTotalCoin = obj.targetUserTotalCoin;
        if (obj.targetUserVIP !== undefined) info.targetUserVIP = obj.targetUserVIP;
        if (obj.uid !== undefined) info.uid = obj.uid;
        return info;
    }
}

class AuthFacebookMergeInfo {
    mergeType: string = "";

    public isMergeUser(): boolean {
        return this.mergeType === "merge";
    }

    public static parseObj(obj: any): AuthFacebookMergeInfo {
        const info = new AuthFacebookMergeInfo();
        if (obj.mergeType !== undefined) info.mergeType = obj.mergeType;
        return info;
    }
}

class QueueReqModel {
    url: string = "";
    postData: any = null;
    completeFunc: Function | null = null;
    timeout: number = 0;
    header: any = null;

    public init(url: string, postData: any, func: Function, timeout: number, header: any): void {
        this.url = url;
        this.postData = postData;
        this.completeFunc = func;
        this.timeout = timeout;
        this.header = header;
    }
}

// ===================== 核心单例类: CommonServer 项目全网络请求根类 ✅ 逻辑100%复刻 =====================
@ccclass()
export default class CommonServer {
    // 静态常量 - 与原JS完全一致
    public static defaultTimeoutSecond: number = 10;
    public static _instance: CommonServer | null = null;
    public static _useCustomCommonServer: boolean = false;
    public static StatusShareExpired: number = 50101;
    public static StatusShareMyLinkError: number = 50102;
    public static StatusShareMaxEntryError: number = 50103;
    public static StatusShareDailyReceiveCntError: number = 50104;
    public static StatusShareAlreayReceiveError: number = 50105;

    // 实例属性
    public commonServerBaseURL: string = "";
    public persistentNodeComp: cc.Component | null = null;
    private _reqId: number = 0;
    private _isProcessing: boolean = false;
    private _queue: QueueReqModel[] = [];
    private _userId: number = -1;
    private _accessToken: string = "";

    // ===================== 单例方法 - 与原JS逻辑一致 =====================
    public static SetInstance(inst: CommonServer): void {
        inst._reqId = Utility.getUnixTimestamp();
        CommonServer._instance = inst;
    }

    public static Instance(): CommonServer {
        return this._instance!;
    }

    public static setUseCumtomCommonServer(flag: boolean): void {
        CommonServer._useCustomCommonServer = flag;
    }

    public static isUseCumtomCommonServer(): boolean {
        return CommonServer._useCustomCommonServer;
    }

    // ===================== 公共基础方法 - 与原JS逻辑1:1复刻 =====================
    public getCommonServerUrl(): string {
        return this.commonServerBaseURL;
    }

    public setCommonServerUrl(url: string): void {
        cc.log("setCommonServerUrl " + url);
        this.commonServerBaseURL = url;
    }

    public isUseCFAcceleration(): boolean {
        return this.commonServerBaseURL.indexOf("cf-") !== -1;
    }

    public setPersistentNodeComp(comp: cc.Component): void {
        this.persistentNodeComp = comp;
    }

    public setAuthInfo(uid: number, token: string): void {
        this._userId = uid;
        this._accessToken = token;
    }

    public isAuthorizationUser(): boolean {
        return this._userId !== -1;
    }

    public getNextReqId(): number {
        return this._reqId++;
    }

    public getReqIdParam(): string {
        return "reqId=%s".format(this.getNextReqId().toString());
    }

    public getAuthParam(uid: number, token: string): string {
        return "HRVAuthorization=" + TSUtility.btoa("Credential=" + uid + "/" + token + ", Signature=SFJW7LSI7LSI64yA67CVIQ");
    }

    public getUidParam(uid: number): string {
        return "UID=" + uid;
    }

    public getGameLocationParam(): string {
        // if (UserInfo.instance() == null) return "HRVGameLocation=";
        // return "HRVGameLocation=" + TSUtility.btoa(JSON.stringify(UserInfo.instance()!.getGameLocation()));
        return null;
    }

    public getUrlRequestSpin(zone: number, slot: string): string {
        let url = "";
        url += this.commonServerBaseURL;
        url += "slots/" + zone + "/" + slot + "/spin";
        return url;
    }

    // ===================== 静态工具方法 - 全局统一错误处理/数据解析 核心中的核心 =====================
    public static isServerResponseError(res: any, retryCnt: number = 0): boolean {
        if (!TSUtility.isValid(res)) return true;
        if (!res || res.errorCode) {
            if (res.errorStatusCode !== undefined) {
                const err = new Error("Network error %s".format(JSON.stringify(res)));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, err), true);
                
                // 断网错误
                if (res.errorStatusCode === 0) {
                    if (UserInfo.isAuthFail()) return true;
                    if (retryCnt === 0) {
                        UserInfo.setAuthFail();
                        // if (UserInfo.instance() != null) UserInfo.instance()!.clearEvent();
                        let btnTxt = "RELOAD";
                        if (Utility.isFacebookInstant()) btnTxt = "CLOSE";
                        CommonPopup.getCommonPopup((_, popup) => {
                            popup.open().setInfo("OOPS...", "Disconnected\nPlease check on your internet connection. %s".format(res.errorCode.toString()))
                                .setOkBtn(btnTxt, () => { HRVServiceUtil.restartGame(); });
                            if (Utility.isMobileGame()) {
                                popup.setCloseBtn(true, () => { TSUtility.endGame(); });
                            }
                        });
                    }
                    return true;
                }

                // 401 鉴权失败
                if (res.errorStatusCode === 401) {
                    UserInfo.setAuthFail();
                    // if (UserInfo.instance() != null) UserInfo.instance()!.clearEvent();
                    const errMsg = res.errorMsg;
                    const isMismatch = errMsg.indexOf("accessToken is mismatch") > -1;
                    const isTimeout = errMsg.indexOf("model.DBStorage.GetUserSessionInfo") > -1;
                    let btnTxt = "RELOAD";
                    let tipMsg = res.errorMsg;

                    if (isMismatch) {
                        btnTxt = "RELOAD";
                        tipMsg = "You have loaded the game\nfrom another computer or device.\nPlease either close the game,\nor press the button continue playing here.";
                        if (Utility.isFacebookInstant()) {
                            btnTxt = "CLOSE";
                            tipMsg = "You have loaded the game\nfrom another computer or device.\nPlease close the game.";
                        }
                    } else if (isTimeout) {
                        btnTxt = "OK";
                        tipMsg = "Connection has timed out.\nPlease restart the game.";
                    }

                    CommonPopup.getCommonPopup((_, popup) => {
                        popup.open().setInfo("NOTICE", tipMsg, false).setOkBtn(btnTxt, () => { HRVServiceUtil.restartGame(); });
                        if (Utility.isMobileGame()) {
                            popup.setCloseBtn(true, () => { TSUtility.endGame(); });
                        }
                    });
                    return true;
                }

                // 版本过低错误
                if (res.errorCode == SDefine.ERR_MINVERSION) {
                    UserInfo.setAuthFail();
                    // if (UserInfo.instance() != null) UserInfo.instance()!.clearEvent();
                    // let btnTxt = "RELOAD";
                    // let tipMsg = "A new version is available.\nPlease restart the app to continue playing the slot game.";
                    // if (Utility.isFacebookInstant()) {
                    //     btnTxt = "CLOSE";
                    //     tipMsg = "A new version is available.\nPlease close the game.";
                    // }
                    // CommonPopup.getCommonPopup((_, popup) => {
                    //     popup.open().setInfo("NOTICE", tipMsg, false).setOkBtn(btnTxt, () => { HRVServiceUtil.restartGame(); });
                    //     if (Utility.isMobileGame()) {
                    //         popup.setCloseBtn(true, () => { TSUtility.endGame(); });
                    //     }
                    // });
                    return true;
                }
            }
            return true;
        }
        return res.error.code !== 0;
    }

    public static isDuplicateError(res: any): boolean {
        return !(res && !res.errorCode || res.errorStatusCode === undefined || res.errorStatusCode !== 401);
    }

    public static isDisconnectError(res: any): boolean {
        return !(res && !res.errorCode || res.errorStatusCode === undefined || res.errorStatusCode !== 0);
    }

    public static getErrorStatusCode(res: any): number {
        return res.errorStatusCode !== undefined ? res.errorStatusCode : -1;
    }

    public static getErrorCode(res: any): number {
        return res.errorCode !== undefined ? res.errorCode : -1;
    }

    public static getErrorMsg(res: any): string {
        return res.errorMsg ? res.errorMsg : "undefined";
    }

    public static getServerChangeResult(res: any): ChangeResult {
        const result = new ChangeResult();
        if (res.changeResult == null) return result;
        result.parseObj(res.changeResult);
        return result;
    }

    public static getLeagueShopInfo(res: any): LeagueShopInfo {
        const info = new LeagueShopInfo();
        if (res.leagueShopInfo == null) return info;
        info.parseObj(res.leagueShopInfo);
        return info;
    }

    public static JSONParse(str: string): any {
        let data = null;
        try {
            data = JSON.parse(str);
        } catch (err) {
            cc.error("JSONParse fail", str);
            data = null;
        }
        return data;
    }

    // ===================== 核心请求队列逻辑 - 防止并发请求异常 原逻辑1:1复刻 =====================
    public gsHttpCall(req: ReqParamModel, completeFunc: Function, timeout: number): void {
        const self = this;
        if (this.persistentNodeComp) {
            this.persistentNodeComp.scheduleOnce(() => {
                self.__InnerGsHttpCall(req, completeFunc, timeout);
            }, 0);
        } else {
            cc.error("gsHttpCall invalid state this.persistentNodeComp");
            this.__InnerGsHttpCall(req, completeFunc, timeout);
        }
    }

    private __InnerGsHttpCall(req: ReqParamModel, completeFunc: Function, timeout: number): void {
        const self = this;
        if (!UserInfo.isAuthFail()) {
            const header = { "Content-Type": "text/plain" };
            req.url += "?" + this.getReqIdParam();
            if (this.isAuthorizationUser()) {
                req.url += "&" + this.getUidParam(this._userId);
                req.url += "&" + this.getAuthParam(this._userId, this._accessToken) + "&" + this.getGameLocationParam();
            }
            if (req.useQueue) {
                this.gsUseQueueHttpCall(req.url, req.postData, completeFunc, timeout, header);
            } else {
                Utility.httpCall(req.url, req.postData, (res, isErr) => {
                    if (completeFunc != null) self.gsCallCompleteFunc(req.url, res, isErr?1:0, completeFunc);
                }, timeout, header, 0);
            }
        } else {
            completeFunc({
                errorCode: 5030,
                errorMsg: "not authorizaed",
                errorStatusCode: 0
            }, null);
        }
    }

    private gsUseQueueHttpCall(url: string, postData: any, completeFunc: Function, timeout: number, header: any): void {
        const self = this;
        if (this._isProcessing) {
            const req = new QueueReqModel();
            req.init(url, postData, completeFunc, timeout, header);
            this._queue.push(req);
            return;
        }
        if (timeout === 0) timeout = CommonServer.defaultTimeoutSecond * 1000;
        this._isProcessing = true;
        Utility.httpCall(url, postData, (res, isErr) => {
            self._isProcessing = false;
            if (self._queue.length > 0) {
                const req = self._queue.shift()!;
                self.gsUseQueueHttpCall(req.url, req.postData, req.completeFunc!, req.timeout, req.header);
            }
            if (completeFunc != null) self.gsCallCompleteFunc(url, res, isErr?1:0, completeFunc);
        }, timeout, header, 0);
    }

    private gsCallCompleteFunc(url: string, resStr: any, isErr: number, completeFunc: Function): void {
        if (isErr !== 1) {
            const res = CommonServer.JSONParse(resStr);
            if (res == null) {
                const err = new Error("JSON Parse fail. UsingQueue. [data:%s][url:%s]".format(resStr, url));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, err), true);
                completeFunc({
                    errorCode: 5120,
                    errorMsg: "json parse fail",
                    errorStatusCode: 1104,
                    requestURI: url
                }, true);
                return;
            }
            completeFunc(res, isErr);
        } else {
            resStr.requestURI = url;
            if (resStr.errorCode === 4051) {
                const err = new Error("JSON Parse fail. UsingQueue. data is empty [err:%s][url:%s]".format(JSON.stringify(resStr), url));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, err), true);
            }
            completeFunc(resStr, isErr);
        }
    }

    // ===================== 以下为【所有网络请求方法】- 与原JS完全一致，参数/URL/回调无任何改动 =====================
    public async getVersion(baseUrl: string): Promise<any> {
        return new Promise((resolve) => {
            const serviceType = TSUtility.getServiceType();
            const appVersion = Utility.getApplicationVersion();
            const platformID = TSUtility.getPlatformID();
            const req = new ReqParamModel();
            req.url = platformID !== "" ? baseUrl + "version/" + serviceType + "/" + appVersion + "/" + platformID : baseUrl + "version/" + serviceType + "/" + appVersion;
            this.gsHttpCall(req, (res) => { resolve(res); }, 0);
        });
    }

    public async requestAuth(type: string, postData: any): Promise<any> {
        return new Promise((resolve) => {
            cc.log("requestAuth postData: ", postData);
            const req = new ReqParamModel();
            req.url = this.commonServerBaseURL + "auth/v3/" + type;
            req.postData = postData;
            this.gsHttpCall(req, (res) => { resolve(res); }, 0);
        });
    }

    public async asyncRequestLoginV2(type: string, postData: any): Promise<any> {
        return new Promise((resolve) => {
            const jsonStr = JSON.stringify(postData);
            cc.log("asyncRequestLoginV2 postData: ", jsonStr);
            const req = new ReqParamModel();
            req.url = this.commonServerBaseURL + "auth/v3/login/" + type;
            req.postData = jsonStr;
            this.gsHttpCall(req, (res) => { resolve(res); }, 0);
        });
    }

    public async asyncRequestAutoAuthV2(type: string, postData: any): Promise<any> {
        return new Promise((resolve) => {
            const jsonStr = JSON.stringify(postData);
            cc.log("asyncRequestAutoAuthV2 postData: ", jsonStr);
            const req = new ReqParamModel();
            req.url = this.commonServerBaseURL + "auth/v3/autoauth/" + type;
            req.postData = jsonStr;
            this.gsHttpCall(req, (res) => { resolve(res); }, 0);
        });
    }

    public async ayncRequestAuthLink(type: string, postData: any): Promise<any> {
        return new Promise((resolve) => {
            const jsonStr = JSON.stringify(postData);
            cc.log("ayncRequestAuthLink postData: ", jsonStr);
            const req = new ReqParamModel();
            req.url = this.commonServerBaseURL + "auth/v3/link/" + type;
            req.postData = jsonStr;
            this.gsHttpCall(req, (res) => { resolve(res); }, 0);
        });
    }

    public async requestPing(uid: number, time: number, zone: number, slot: number): Promise<any> {
        return new Promise((resolve) => {
            const req = new ReqParamModel();
            req.url = this.commonServerBaseURL + "ping/%s/%s/%s".format(uid.toString(), zone.toString(), slot.toString());
            req.useQueue = false;
            this.gsHttpCall(req, (res) => { resolve(res); }, 0);
        });
    }

    public async getUserInfo(uid: number): Promise<any> {
        return new Promise((resolve) => {
            const req = new ReqParamModel();
            req.url = this.commonServerBaseURL + "users/" + uid;
            this.gsHttpCall(req, (res) => { resolve(res); }, 0);
        });
    }

    public async getSlotGameInfo(uid: number, token: string, zone: number, slot: number, postData: any): Promise<any> {
        return new Promise((resolve) => {
            const req = new ReqParamModel();
            req.url = this.commonServerBaseURL + "slots/" + zone + "/" + slot + "/info";
            req.postData = postData;
            this.gsHttpCall(req, (res) => { resolve(res); }, 0);
        });
    }

    public async requestSlotSpin(uid: number, token: string, zone: number, slot: string, postData: any): Promise<any> {
        return new Promise((resolve) => {
            const timeoutSecond = TSUtility.isLiveService() ? CommonServer.defaultTimeoutSecond : 500;
            const timeout = timeoutSecond * 1000;
            const timeoutLog = () => {
                const err = new Error("requestSlotSpin long delay [zone:%s][slot:%s][%s]".format(zone.toString(), slot, postData));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, err), true);
            };
            this.persistentNodeComp!.scheduleOnce(timeoutLog, timeoutSecond);

            const req = new ReqParamModel();
            req.url = this.getUrlRequestSpin(zone, slot);
            req.postData = postData;
            this.gsHttpCall(req, (res) => {
                this.persistentNodeComp!.unschedule(timeoutLog);
                resolve(res);
            }, timeout);
        });
    }

    public async requestZoneInfo(): Promise<any> {
        return new Promise((resolve) => {
            const req = new ReqParamModel();
            req.url = this.commonServerBaseURL + "v2/zones/combined/info";
            req.postData = JSON.stringify({ type: ServiceInfoManager.BOOL_OVER_SLOT_COUNT ? 0 : 1 });
            req.useQueue = false;
            this.gsHttpCall(req, (res) => { resolve(res); }, 0);
        });
    }

    public requestBingoGameInfo(uid: number, token: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "bingo/info";
        req.useQueue = false;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestBingoGameStart(uid: number, token: string, gameType: number, useNewbieTicket: boolean|string, useTicketCnt: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "bingo/start";
        req.postData = JSON.stringify({ gameType: gameType, useNewbieTicket: useNewbieTicket, useTicketCnt: useTicketCnt });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestBingoOpenChest(uid: number, token: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "bingo/openChest";
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestBingoBoostMirrorBall(uid: number, token: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "bingo/boostMirrorBall";
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestBingoRemainGameCollect(uid: number, token: string, boardId: string|number, completeFunc: Function, isWatchedAd: boolean = false): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "bingo/collectRemainGame";
        req.postData = JSON.stringify({ boardId: boardId, isWatchedAd: isWatchedAd });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestSuiteLeagueInfo(completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "suiteleague/info";
        this.gsHttpCall(req, (res, isErr) => { completeFunc(res, isErr); }, 0);
    }

    public requestLeagueInfo(uid: number, token: string, zone: number, leagueId: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "league/" + zone + "/info";
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestSlotTourneyInfo(): Promise<any> {
        return new Promise((resolve) => {
            this.requestSlotTourneyInfo((res) => { resolve(res); });
        });
    }

    public requestSlotTourneyInfo(completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "slotTourney/info";
        req.useQueue = false;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestSlotTourneyInfoByTourneyInfo(tourneyId: number, round: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestSlotTourneyInfoByTourneyInfo(tourneyId, round, (res) => { resolve(res); });
        });
    }

    public requestSlotTourneyInfoByTourneyInfo(tourneyId: number, round: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "slotTourney/info/%s/%s".format(tourneyId.toString(), round.toString());
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestSlotTourneyState(tourneyId: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestSlotTourneyState(tourneyId, (res) => { resolve(res); });
        });
    }

    public requestSlotTourneyState(tourneyId: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "slotTourney/state/" + tourneyId;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestBingoCallNextNumber(boardId: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "bingo/callNumber";
        if (boardId !== "") req.url += "/" + boardId;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestBingoCallNextNumberV2(ballType: number, boardId: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "bingo/callNumber/v2";
        req.postData = JSON.stringify({ bingoBallType: ballType });
        if (boardId !== "") req.url += "/" + boardId;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestBingoSelectNumber(uid: number, token: string, boardId: string, ballNumber: number, completeFunc: Function): Promise<any> {
        return new Promise(() => {
            const req = new ReqParamModel();
            req.url = this.commonServerBaseURL + "bingo/selectNumber";
            req.postData = JSON.stringify({ boardId: boardId, ballNumber: ballNumber });
            this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
        });
    }

    public requestBuyProduct(uid: number, token: string, postData: any, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "shop/buyProduct2";
        req.postData = JSON.stringify(postData);
        this.gsHttpCall(req, (res, isErr) => {
            if (isErr) {
                const err = new Error("ASYNC_Purchase requestBuyProduct fail %s".format(JSON.stringify(res)));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, err), true);
                completeFunc(res);
                return;
            }
            const log = new Error("ASYNC_Purchase requestBuyProduct success %s".format(JSON.stringify(res)));
            FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Trace, log), true, FHLogType.Trace);
            completeFunc(res);
        }, 0);
    }

    public requestBuyProduct_dev(uid: number, token: string, postData: any, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "shop/buyProduct/v3";
        req.postData = JSON.stringify(postData);
        this.gsHttpCall(req, (res, isErr) => {
            if (isErr) {
                const err = new Error("ASYNC_Purchase requestBuyProduct fail %s".format(JSON.stringify(res)));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, err), true);
                completeFunc(res);
                return;
            }
            const log = new Error("ASYNC_Purchase requestBuyProduct success %s".format(JSON.stringify(res)));
            FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Trace, log), true, FHLogType.Trace);
            completeFunc(res);
        }, 0);
    }

    public requestBuyProduct_test(uid: number, token: string, postData: any, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "shop/buyProductTest";
        req.postData = JSON.stringify(postData);
        this.gsHttpCall(req, (res, isErr) => {
            if (isErr) {
                const err = new Error("ASYNC_Purchase requestBuyProduct fail %s".format(JSON.stringify(res)));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, err), true);
                completeFunc(res);
                return;
            }
            const log = new Error("ASYNC_Purchase requestBuyProduct success %s".format(JSON.stringify(res)));
            FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Trace, log), true, FHLogType.Trace);
            completeFunc(res);
        }, 0);
    }

    public async asyncRequestPlayStoreBuyProduct(uid: number, token: string, postData: any): Promise<any> {
        return new Promise((resolve) => {
            this.requestPlayStoreBuyProduct(uid, token, postData, (res) => { resolve(res); });
        });
    }

    public requestPlayStoreBuyProduct(uid: number, token: string, postData: any, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "shop/playStoreBuyProduct";
        req.postData = JSON.stringify(postData);
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestFacebookRetryBuyProduct(uid: number, token: string, postData: any, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "shop/buyProduct/retry";
        req.postData = JSON.stringify(postData);
        this.gsHttpCall(req, (res, isErr) => {
            if (isErr) {
                const err = new Error("ASYNC_Purchase requestFacebookRetryBuyProduct fail %s".format(JSON.stringify(res)));
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, err), true);
                completeFunc(res);
                return;
            }
            completeFunc(res);
        }, 0);
    }

    public async asyncRequestFacebookRetryBuyProduct(uid: number, token: string, postData: any): Promise<any> {
        return new Promise((resolve) => {
            this.requestFacebookRetryBuyProduct(uid, token, postData, (res) => { resolve(res); });
        });
    }

    public async asyncRequestIOSAppstoreBuyProduct(uid: number, token: string, postData: any): Promise<any> {
        return new Promise((resolve) => {
            this.requestIOSAppstoreBuyProduct(uid, token, postData, (res) => { resolve(res); });
        });
    }

    public requestIOSAppstoreBuyProduct(uid: number, token: string, postData: any, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "shop/appStoreBuyProduct";
        req.postData = JSON.stringify(postData);
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestFBInstantBuyProduct(uid: number, token: string, postData: any): Promise<any> {
        return new Promise((resolve) => {
            this.requestFBInstantBuyProduct(uid, token, postData, (res) => { resolve(res); });
        });
    }

    public requestFBInstantBuyProduct(uid: number, token: string, postData: any, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "shop/FBInstantBuyProduct";
        req.postData = JSON.stringify(postData);
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestAcceptPromotion(uid: number, token: string, key: string, v1: number, v2: number, sVal: string, completeFunc: Function | null): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "promotion/accept";
        req.postData = JSON.stringify({ promotionKey: key, uid: uid, val1: v1, val2: v2, strVal: sVal });
        this.gsHttpCall(req, (res) => { if (completeFunc != null) completeFunc(res); }, 0);
    }

    public async asyncRequestAcceptPromotion(uid: number, token: string, key: string, v1: number, v2: number, sVal: string): Promise<any> {
        return new Promise((resolve) => {
            this.requestAcceptPromotion(uid, token, key, v1, v2, sVal, (res) => { resolve(res); });
        });
    }

    public requestAcceptPromotionMulti(uid: number, token: string, postData: any, completeFunc: Function | null): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "promotion/acceptmulti";
        req.postData = JSON.stringify(postData);
        this.gsHttpCall(req, (res) => { if (completeFunc != null) completeFunc(res); }, 0);
    }

    public async asyncRequestAcceptPromotionMulti(uid: number, token: string, postData: any): Promise<any> {
        return new Promise((resolve) => {
            this.requestAcceptPromotionMulti(uid, token, postData, (res) => { resolve(res); });
        });
    }

    public requestgetNewShareInfo(uid: number, token: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "share/newCouponID";
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestgetWinShareInfo(uid: number, token: string, type: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "share/newCouponID/" + type.toString();
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestAcceptShareReward(uid: number, token: string, couponId: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "share/accept/" + couponId;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestAcceptShareReward(uid: number, token: string, couponId: string): Promise<any> {
        return new Promise((resolve) => {
            this.requestAcceptShareReward(uid, token, couponId, (res) => { resolve(res); });
        });
    }

    public requestGetFriendInfo(uid: number, token: string, fbid: string, fbToken: string, isForce: boolean, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "friend/info/v2";
        req.postData = JSON.stringify({ fbid: fbid, fbAccessToken: fbToken, isForce: isForce });
        req.useQueue = false;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestGetFriendInfo(uid: number, token: string, fbid: string, fbToken: string, isForce: boolean): Promise<any> {
        return new Promise((resolve) => {
            this.requestGetFriendInfo(uid, token, fbid, fbToken, isForce, (res) => { resolve(res); });
        });
    }

    public requestHelpDesc_Instant(): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "chatbot/send/message/0";
        req.postData = JSON.stringify({});
        req.useQueue = false;
        this.gsHttpCall(req, () => { }, 0);
    }

    public requestFanpage_Instant(): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "chatbot/send/message/2";
        req.postData = JSON.stringify({});
        req.useQueue = false;
        this.gsHttpCall(req, () => { }, 0);
    }

    public requestGetFriendInfo_Instant(uid: number, token: string, isForce: boolean, fbIdList: any[], completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "friend/info/v3";
        req.postData = JSON.stringify({ isForce: isForce, friendFBidList: fbIdList });
        req.useQueue = false;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestGetFriendInfo_Line(uid: number, token: string, isForce: boolean, lineIdList: any[], completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "friend/info/v4";
        req.postData = JSON.stringify({ isForce: isForce, friendLineIdList: lineIdList });
        req.useQueue = false;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestGetFriendInfo_Instant(uid: number, token: string, isForce: boolean, fbIdList: any[]): Promise<any> {
        return new Promise((resolve) => {
            this.requestGetFriendInfo_Instant(uid, token, isForce, fbIdList, (res) => { resolve(res); });
        });
    }

    public async asyncRequestGetFriendInfo_Line(uid: number, token: string, isForce: boolean, lineIdList: any[]): Promise<any> {
        return new Promise((resolve) => {
            this.requestGetFriendInfo_Line(uid, token, isForce, lineIdList, (res) => { resolve(res); });
        });
    }

    public requestUseItem(itemNo: number, useCnt: number, extraInfo: any, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "item/use";
        req.postData = JSON.stringify({ itemUniqueNo: itemNo, useCnt: useCnt, extraInfo: extraInfo });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestUseItem(itemNo: number, useCnt: number, extraInfo: any): Promise<any> {
        return new Promise((resolve) => {
            this.requestUseItem(itemNo, useCnt, extraInfo, (res) => { resolve(res); });
        });
    }

    public requestFriendSendGift(uid: number, token: string, activeUids: any[], nonActiveUids: any[], giftType: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "friend/send";
        req.postData = JSON.stringify({ toActiveUids: activeUids, toNonActiveUids: nonActiveUids, GiftType: giftType });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestInboxInfo(uid: number, token: string): Promise<any> {
        return new Promise((resolve) => {
            this.requestInboxInfo(uid, token, (res) => { resolve(res); });
        });
    }

    public requestInboxInfo(uid: number, token: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "inbox/info/v2";
        req.useQueue = false;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestPurchaseInfo(uid: number, token: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "users/%s/purchaseInfo".format(uid.toString());
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestAcceptInboxMessage(uid: number, token: string, mid: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "inbox/accept/" + mid;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestAcceptInboxMessageMulti(uid: number, token: string, muidList: any[]): Promise<any> {
        return new Promise((resolve) => {
            this.requestAcceptInboxMessageMulti(uid, token, muidList, (res) => { resolve(res); });
        });
    }

    public requestAcceptInboxMessageMulti(uid: number, token: string, muidList: any[], completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "inbox/acceptmulti";
        req.postData = JSON.stringify({ muids: muidList });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestDeleteInboxMessage(uid: number, token: string, mid: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "inbox/delete/" + mid;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    // 空实现方法 - 原JS保留
    public requestgetMissionInfo(): void { }
    public requestRefreshMissionInfo(): void { }
    public requestMissionComplete(): void { }

    public async asyncRequestMissionComplete(): Promise<any> {
        return new Promise((resolve) => {
            this.requestMissionComplete();
            return Promise.resolve();
        });
    }

    public requestReelQuestRefresh(completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "reelQuest/refresh";
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestReelQuestMissionComplete(completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "reelQuest/complete";
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestReelQuestMissionComplete(): Promise<any> {
        return new Promise((resolve) => {
            this.requestReelQuestMissionComplete((res) => { resolve(res); });
        });
    }

    // 空实现方法 - 原JS保留
    public requestRefreshBlastOffInfo(): void { }
    public requestBlastOffInfoComplete(): void { }

    public async asyncRequestBlastOffComplete(): Promise<any> {
        return new Promise(resolve => resolve(true));
    }

    public requestGetStarAlbumInfo(completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "starAlbum/info";
        req.useQueue = false;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestGetStarAlbumInfo(): Promise<any> {
        return new Promise((resolve) => {
            this.requestGetStarAlbumInfo((res) => { resolve(res); });
        });
    }

    public requestGetHeroInfo(completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "hero/info";
        req.useQueue = false;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestGetHeroInfo(): Promise<any> {
        return new Promise((resolve) => {
            this.requestGetHeroInfo((res) => { resolve(res); });
        });
    }

    public requestChangeActiveHero(heroID: string, completeFunc: Function, isForce: boolean = false): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "hero/change";
        if (isForce) {
            req.postData = JSON.stringify({ heroID: heroID, isForce: true });
        } else {
            req.postData = JSON.stringify({ heroID: heroID });
        }
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestSuiteLeagueShopBuyProduct(productId: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "suiteleague/shop/buy/%s".format(productId);
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestSuiteLeagueJokerProduct(jokerId: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "suiteleague/joker/use/%s".format(jokerId.toString());
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestStarShopBuyProduct(productId: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "starAlbum/shop/buy/%s".format(productId);
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestStarShopUseJoker(jokerId: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "starAlbum/joker/use/%s".format(jokerId.toString());
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestCasinoJackpotWinnerCongratsBonus(uid: number, token: string, jackpotId: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "casinoJackpot/%s/congrats".format(jackpotId.toString());
        req.postData = JSON.stringify({});
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestCasinoJackpotWinnerCongratsUsers(uid: number, token: string, jackpotId: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "casinoJackpot/%s/congratsUsers".format(jackpotId.toString());
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestChangeAvatarInfo(uid: number, token: string, avatarID: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "users/changeAvatarInfo/%s".format(uid.toString());
        req.postData = JSON.stringify({ avatarID: parseInt(avatarID) });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestAppsflyerConversionDataSet(uid: number, token: string, payload: any, completeFunc: Function): void {
        const serviceType = TSUtility.getServiceType();
        const waccessDate = Utility.getWebAccessDate();
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "users/%s/afConversionData/set".format(uid.toString());
        req.postData = JSON.stringify({ payload: payload, serviceType: serviceType, waccessDate: waccessDate, uid: uid });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestLogout(uid: number): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "logout/%s".format(uid.toString());
        req.postData = JSON.stringify({});
        this.gsHttpCall(req, () => { cc.log("logout"); }, 0);
    }

    public requestLineSignOut(completeFunc: Function): void {
        const uid = UserInfo.instance()!.getUid();
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "line/signOut/%s".format(uid.toString());
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestMysteryBoxMinigame(uid: number, token: string, itemNo: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "item/use";
        req.postData = JSON.stringify({ itemUniqueNo: itemNo, useCnt: 1 });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestFBSquadGetStatus(): Promise<any> {
        return new Promise((resolve) => {
            this.requestFBSquadGetStatus((res) => { resolve(res); });
        });
    }

    public requestFBSquadGetStatus(completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "fbSquads/status";
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestFBSquadCreate(postData: any): Promise<any> {
        return new Promise((resolve) => {
            this.requestFBSquadCreate(postData, (res) => { resolve(res); });
        });
    }

    public requestFBSquadCreate(postData: any, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "fbSquads/create";
        req.postData = JSON.stringify(postData);
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestRequestFBSquadJoin(squadID: string): Promise<any> {
        return new Promise((resolve) => {
            this.requestFBSquadJoin(squadID, (res) => { resolve(res); });
        });
    }

    public requestFBSquadJoin(squadID: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "fbSquads/join";
        req.postData = JSON.stringify({ squadID: squadID });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestFBSquadsInfo(): Promise<any> {
        return new Promise((resolve) => {
            this.requestFBSquadsInfo((res) => { resolve(res); });
        });
    }

    public requestFBSquadsInfo(completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "fbSquads/info";
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestFBSquadsMoneyTreeComplete(): Promise<any> {
        return new Promise((resolve) => {
            this.requestFBSquadsMoneyTreeComplete((res) => { resolve(res); });
        });
    }

    public requestFBSquadsMoneyTreeComplete(completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "fbSquads/moneytree/complete";
        req.postData = "{}";
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestFBSquadsList(page: number, size: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestFBSquadsList(page, size, (res) => { resolve(res); });
        });
    }

    public requestFBSquadsList(page: number, size: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "fbSquads/ranks/" + page.toString() + "/" + size.toString();
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestFBTournamentCreate(postData: any): Promise<any> {
        return new Promise((resolve) => {
            this.requestFBTournamentCreate(postData, (res) => { resolve(res); });
        });
    }

    public requestFBTournamentCreate(postData: any, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "fbTournament/create";
        req.postData = JSON.stringify(postData);
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestFBTournamentUpdateScore(tourneyID: string, score: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestFBTournamentUpdateScore(tourneyID, score, (res) => { resolve(res); });
        });
    }

    public requestFBTournamentUpdateScore(tourneyID: string, score: number, completeFunc: Function | null): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "fbTournament/score";
        req.postData = JSON.stringify({ tournamentID: tourneyID, score: score });
        this.gsHttpCall(req, (res) => { if (completeFunc != null) completeFunc(res); }, 0);
    }

    public async asyncRequestGetFBTournamentInfos(): Promise<any> {
        return new Promise((resolve) => {
            this.requestGetFBTournamentInfos((res) => { resolve(res); });
        });
    }

    public requestGetFBTournamentInfos(completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "fbTournament/info";
        req.useQueue = false;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public setStorage(postData: any, completeFunc: Function | null): void {
        const uid = UserInfo.instance()!.getUid();
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "users/%s".format(uid.toString()) + "/storage/set";
        req.postData = JSON.stringify(postData);
        this.gsHttpCall(req, (res, isErr) => {
            if (isErr) {
                cc.log("Save Failed" + res);
                if (completeFunc != null) completeFunc(res);
                return;
            }
            if (completeFunc != null) completeFunc(res);
        }, 0);
    }

    public setStorageByString(postData: string, completeFunc: Function | null): void {
        const uid = UserInfo.instance()!.getUid();
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "users/%s".format(uid.toString()) + "/storage/set";
        req.postData = postData;
        this.gsHttpCall(req, (res, isErr) => {
            if (isErr) {
                cc.log("Save Failed" + res);
                if (completeFunc != null) completeFunc(res);
                return;
            }
            if (completeFunc != null) completeFunc(res);
        }, 0);
    }

    public getShopPromotionInfo(completeFunc: Function | null): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "sale/infos";
        req.useQueue = false;
        this.gsHttpCall(req, (res, isErr) => {
            if (isErr) {
                cc.log("Get Failed" + res);
                if (completeFunc != null) completeFunc(res);
                return;
            }
            if (completeFunc != null) completeFunc(res);
        }, 0);
    }

    public getSkinInfo(completeFunc: Function | null): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "skin/infos";
        req.useQueue = false;
        this.gsHttpCall(req, (res, isErr) => {
            if (isErr) {
                cc.log("Get Failed" + res);
                if (completeFunc != null) completeFunc(res);
                return;
            }
            if (completeFunc != null) completeFunc(res);
        }, 0);
    }

    public getEventInfo(completeFunc: Function | null): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "event/infos";
        req.useQueue = false;
        this.gsHttpCall(req, (res, isErr) => {
            if (isErr) {
                cc.log("Get Failed" + res);
                if (completeFunc != null) completeFunc(res);
                return;
            }
            if (completeFunc != null) completeFunc(res);
        }, 0);
    }

    public getUpSellInfo(completeFunc: Function | null): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "pecan/upsellInfo";
        this.gsHttpCall(req, (res, isErr) => {
            if (isErr) {
                cc.log("Get Failed" + res);
                if (completeFunc != null) completeFunc(res);
                return;
            }
            if (completeFunc != null) completeFunc(res);
        }, 0);
    }

    public getStorage(keys: any[], completeFunc: Function | null): void {
        const uid = UserInfo.instance()!.getUid();
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "users/%s".format(uid.toString()) + "/storage/get";
        req.postData = JSON.stringify({ keys: keys });
        req.useQueue = false;
        this.gsHttpCall(req, (res, isErr) => {
            if (isErr) {
                cc.log("Get Failed" + res);
                if (completeFunc != null) completeFunc(res);
                return;
            }
            if (completeFunc != null) completeFunc(res);
        }, 0);
    }

    public requestModeBetInfo(uid: number, token: string, completeFunc: Function | null): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "users/%s".format(uid.toString()) + "/modeBetInfo";
        this.gsHttpCall(req, (res) => { if (completeFunc != null) completeFunc(res); }, 0);
    }

    public requestAvgBetInfo(uid: number, token: string, completeFunc: Function | null): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "users/%s".format(uid.toString()) + "/avgBetInfo";
        this.gsHttpCall(req, (res, isErr) => {
            if (isErr) {
                cc.log("Get Failed" + res);
                if (completeFunc != null) completeFunc(res);
                return;
            }
            if (completeFunc != null) completeFunc(res);
        }, 0);
    }

    public requestTDJackpotStart(uid: number, token: string, ticketType: number, ticketCnt: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "jackpot/tripleDiamond/spin";
        req.postData = JSON.stringify({ ticketType: ticketType, ticketCnt: ticketCnt });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestTDJackpotInfo(uid: number, token: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "jackpot/tripleDiamond/info";
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestGiftBalloonAccept(uid: number, token: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "jackpot/tripleDiamond/info";
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestCoinshowerInfo(isAd: boolean, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "coinShower/start/v2";
        req.postData = JSON.stringify({ ad: isAd });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestCoinShowerComplete(isAd: boolean, key: string, rewardIndexes: any[], completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "coinShower/complete/v2";
        req.postData = JSON.stringify({ ad: isAd, key: key, rewardIndexes: rewardIndexes });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestCoinShowerStartV3(isAd: boolean, completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "coinShower/start/v3";
        req.postData = JSON.stringify({ ad: isAd });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestCoinShowerCompleteV3(isAd: boolean, key: string, rewardIndexes: any[], completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "coinShower/complete/v3";
        req.postData = JSON.stringify({ ad: isAd, key: key, rewardIndexes: rewardIndexes });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestSecession(completeFunc: Function): void {
        const uid = UserInfo.instance()!.getUid();
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "users/" + uid + "/delete";
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestSecessionCancle(completeFunc: Function): void {
        const tempUid = ServiceInfoManager.NUMBER_TEMP_UID;
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "users/" + tempUid + "/deleteCancel";
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public requestGetStarAlbumSimpleInfo(completeFunc: Function): void {
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "starAlbum/simpleInfo";
        req.useQueue = false;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestGetStarAlbumSimpleInfo(): Promise<any> {
        return new Promise((resolve) => {
            this.requestGetStarAlbumSimpleInfo((res) => { resolve(res); });
        });
    }

    public requestGetMyClubInfo(completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/info/" + uid;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestGetMyClubInfo(): Promise<any> {
        return new Promise((resolve) => {
            this.requestGetMyClubInfo((res) => { resolve(res); });
        });
    }

    public requestGetClubInfo(clubID: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/detail/" + clubID;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestGetClubInfo(clubID: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestGetClubInfo(clubID, (res) => { resolve(res); });
        });
    }

    public requestRecommendClubInfos(completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/infos/recommend/" + uid.toString();
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRecommendClubInfos(): Promise<any> {
        return new Promise((resolve) => {
            this.requestRecommendClubInfos((res) => { resolve(res); });
        });
    }

    public requestCreateClub(name: string, desc: string, logo: string, joinType: number, minVIP: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/create";
        req.postData = JSON.stringify({ uid: uid, name: name, desc: desc, logo: logo, joinType: joinType, minVIPLevel: minVIP });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestCreateClub(name: string, desc: string, logo: string, joinType: number, minVIP: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestCreateClub(name, desc, logo, joinType, minVIP, (res) => { resolve(res); });
        });
    }

    public requestModifyClub(clubID: number, name: string, desc: string, logo: string, joinType: number, minVIP: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/modify";
        req.postData = JSON.stringify({ uid: uid, clubID: clubID, name: name, desc: desc, logo: logo, joinType: joinType, minVIPLevel: minVIP });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestModifyClub(clubID: number, name: string, desc: string, logo: string, joinType: number, minVIP: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestModifyClub(clubID, name, desc, logo, joinType, minVIP, (res) => { resolve(res); });
        });
    }

    public requestRecommendUserInfos(completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/users/recommend/" + uid.toString();
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRecommendUserInfos(): Promise<any> {
        return new Promise((resolve) => {
            this.requestRecommendUserInfos((res) => { resolve(res); });
        });
    }

    public requestJoinPublicClub(clubID: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/join/public";
        req.postData = JSON.stringify({ uid: uid, clubID: clubID });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestJoinPublicClub(clubID: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestJoinPublicClub(clubID, (res) => { resolve(res); });
        });
    }

    public requestJoinPrivateClub(clubID: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/join/private";
        req.postData = JSON.stringify({ uid: uid, clubID: clubID });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestJoinPrivateClub(clubID: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestJoinPrivateClub(clubID, (res) => { resolve(res); });
        });
    }

    public requestJoinCancelClub(clubID: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/private/cancel";
        req.postData = JSON.stringify({ uid: uid, clubID: clubID });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestJoinCancelClub(clubID: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestJoinCancelClub(clubID, (res) => { resolve(res); });
        });
    }

    public requestAcceptJoinClub(acceptUID: number, clubID: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/private/accept";
        req.postData = JSON.stringify({ uid: uid, acceptUID: acceptUID, clubID: clubID });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestAcceptJoinClub(acceptUID: number, clubID: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestAcceptJoinClub(acceptUID, clubID, (res) => { resolve(res); });
        });
    }

    public requestRejectJoinClub(rejectUID: number, clubID: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/private/reject";
        req.postData = JSON.stringify({ uid: uid, rejectUID: rejectUID, clubID: clubID });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestRejectJoinClub(rejectUID: number, clubID: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestRejectJoinClub(rejectUID, clubID, (res) => { resolve(res); });
        });
    }

    public requestInviteUserClub(inviteUID: number, clubID: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/invite";
        req.postData = JSON.stringify({ uid: uid, clubID: clubID, inviteUID: inviteUID });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestInviteUserClub(inviteUID: number, clubID: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestInviteUserClub(inviteUID, clubID, (res) => { resolve(res); });
        });
    }

    public requestBanishClub(clubID: number, banishUID: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/banish";
        req.postData = JSON.stringify({ uid: uid, clubID: clubID, banishUID: banishUID });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestBanishClub(clubID: number, banishUID: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestBanishClub(clubID, banishUID, (res) => { resolve(res); });
        });
    }

    public requestTransferMasterClub(newMasterUID: number, clubID: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/transfer/master";
        req.postData = JSON.stringify({ uid: uid, newMasterUID: newMasterUID, clubID: clubID });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestTransferMasterClub(newMasterUID: number, clubID: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestTransferMasterClub(newMasterUID, clubID, (res) => { resolve(res); });
        });
    }

    public requestLeaveClub(clubID: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/leave";
        req.postData = JSON.stringify({ uid: uid, clubID: clubID });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestLeaveClub(clubID: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestLeaveClub(clubID, (res) => { resolve(res); });
        });
    }

    public requestSearchClub(name: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/search";
        req.postData = JSON.stringify({ uid: uid, name: name, cnt: 10 });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestSearchClub(name: string): Promise<any> {
        return new Promise((resolve) => {
            this.requestSearchClub(name, (res) => { resolve(res); });
        });
    }

    public requestGetClubWall(completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/wall/posts/" + uid;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestGetClubWall(): Promise<any> {
        return new Promise((resolve) => {
            this.requestGetClubWall((res) => { resolve(res); });
        });
    }

    public requestClubWallSend(postType: number, content: string, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/wall/post";
        req.postData = JSON.stringify({ uid: uid, postType: postType, content: content });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestClubWallSend(postType: number, content: string): Promise<any> {
        return new Promise((resolve) => {
            this.requestClubWallSend(postType, content, (res) => { resolve(res); });
        });
    }

    public requestClubWallCollect(postID: string, clubID: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/wall/collect";
        req.postData = JSON.stringify({ uid: uid, clubID: clubID, postID: postID });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestClubWallCollect(postID: string, clubID: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestClubWallCollect(postID, clubID, (res) => { resolve(res); });
        });
    }

    public requestClubMissionInfo(completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/missions/" + uid;
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestClubMissionInfo(): Promise<any> {
        return new Promise((resolve) => {
            this.requestClubMissionInfo((res) => { resolve(res); });
        });
    }

    public requestClubChestReward(clubID: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/chest/collect";
        req.postData = JSON.stringify({ uid: uid, clubID: clubID });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestClubChestReward(clubID: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestClubChestReward(clubID, (res) => { resolve(res); });
        });
    }

    public requestClubMissionReward(clubID: number, MID: number, completeFunc: Function): void {
        const req = new ReqParamModel();
        const uid = UserInfo.instance()!.getUid();
        req.url = this.commonServerBaseURL + "club/mission/collect";
        req.postData = JSON.stringify({ uid: uid, clubID: clubID, MID: MID });
        this.gsHttpCall(req, (res) => { completeFunc(res); }, 0);
    }

    public async asyncRequestClubMissionReward(clubID: number, MID: number): Promise<any> {
        return new Promise((resolve) => {
            this.requestClubMissionReward(clubID, MID, (res) => { resolve(res); });
        });
    }

    public requestFirehoseProxy(postData: any, param: string = ""): void {
        const url = TSUtility.isLiveService() 
            ? "https://app-firehoseproxy.highrollervegas.net/firehose/record/put" 
            : "https://app-firehoseproxy-dev.highrollervegas.net/firehose/record/put";
        const reqUrl = param !== "" ? url + "?" + param : url;
        const jsonStr = JSON.stringify(postData);
        Utility.httpCall(reqUrl, jsonStr, (res, isErr) => {
            if (isErr) cc.log("Get Failed" + res);
        }, 0, { "Content-Type": "text/plain" });
    }

    public requestMultiBalance(zone: number, slot: number, completeFunc: Function): void {
        const uid = UserInfo.instance()!.getUid();
        const req = new ReqParamModel();
        req.url = this.commonServerBaseURL + "admin/set/slot/balance/" + uid + "/" + zone + "/" + slot;
        this.gsHttpCall(req, (res, isErr) => { completeFunc(res, isErr); }, 0);
    }
}

// ===================== 导出所有内部模型类，供外部业务脚本调用 =====================
export {
    PurchaseEntryReason,
    PurchasePayload_SmallInfo,
    UnProcessedPopupInfo,
    AcceptPromotionInfo,
    AcceptPromotionInfoMuti,
    RecommendSlotInfo,
    RelatedSlotInfo,
    AuthToken,
    FacebookAuth,
    AppleAuth,
    LineAuth,
    Auth2Req,
    AuthLinkReq,
    AuthError,
    AuthLinkUserLevel,
    AuthLinkUserVipLevel,
    AuthLinkRes,
    AuthFacebookMergeInfo
};