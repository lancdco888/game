const { ccclass } = cc._decorator;


import FireHoseSender from "../FireHoseSender";
import MobileDeviceHelper from "../MobileDeviceHelper";
import CommonPopup from "../Popup/CommonPopup";
import UserInfo from "../User/UserInfo";
import NativeUtil from "../global_utility/NativeUtil";
import SDefine from "../global_utility/SDefine";
import TSUtility from "../global_utility/TSUtility";
import { Utility } from "../global_utility/Utility";
import LocalStorageManager from "../manager/LocalStorageManager";

// 定义核心接口（补充 TS 类型，提升可维护性，对应原 JS 中的对象字面量）
/** 日志事件基础数据结构 */
export class LogEventData {
    action_type: string;
    uid: number | string;
    waccess_date: string | number;
    client_session_key: string | number;
    service_type: string | number;
    sub_service_type: string | number;
    source: string;
    extra_info: any;
    vip_level: number;
    vip_exp: number;
    level: number;
    level_exp: number;
    revenue: number;
    loc: string;
    subloc: string;
    zoneid: number;
    client_ip: string;
    log_date: number;
    sseq: number;
    audid: string;
    platform_id: string | number;
    account_site: string | number;
    appsflyer_id: string;
    client_version: string;
    cdn_host: string;
    service_mode: string | number;
}

/** 游戏位置信息 */
export class GameLocation {
    loc: string;
    subLoc: string;
    zoneID: number;
}

/** Firehose 请求参数结构 */
export class FirehoseProxyData {
    DeliveryStreamName: string;
    Data: string;
}


// 单例类（对应原 JS 中的 p 构造函数）
@ccclass()
export default class HRVFirehoseSetting {
    // 单例实例（对应原 JS 中的 e._inst）
    private static _inst: HRVFirehoseSetting | null = null;
    
    // 实例属性（对应原 JS 构造函数中的属性）
    private _exceptionLastSentTime: number = 0;
    private _exceptionSentMsgList: string[] = [];
    private _exceptionSentCount: number = 0;

    // 单例获取方法（对应原 JS 中的 e.Instance()）
    public static Instance(): HRVFirehoseSetting | null {
        return this._inst;
    }

    // 单例初始化方法（对应原 JS 中的 e.Init()）
    public static Init(): void {
        this._inst = new HRVFirehoseSetting();
        FireHoseSender.Instance().init(this._inst);
    }

    // 实例方法：获取日志事件（对应原 JS 原型方法 getLogEvent）
    public getLogEvent(actionType: string, extraInfo: any): string {
        const logEvent: LogEventData = {
            action_type: actionType,
            uid: 0,
            waccess_date: Utility.getWebAccessDate(),
            client_session_key: TSUtility.getClientSessionKey(),
            service_type: TSUtility.getServiceType(),
            sub_service_type: TSUtility.getSubServiceType(),
            source: "c",
            extra_info: extraInfo,
            vip_level: 0,
            vip_exp: 0,
            level: 0,
            level_exp: 0,
            revenue: 0,
            loc: "",
            subloc: "",
            zoneid: 0,
            client_ip: "",
            log_date: TSUtility.getServerBaseNowUnixTime(),
            sseq: TSUtility.getNanoTime(),
            audid: "",
            platform_id: TSUtility.getPlatformID(),
            account_site: TSUtility.getAccountSite(),
            appsflyer_id: "",
            client_version: Utility.getClientVersion(),
            cdn_host: TSUtility.getCDNHostURL(),
            service_mode: TSUtility.getServiceMode()
        };

        // 填充移动设备认证 v2 信息
        if (SDefine.Use_Mobile_Auth_v2) {
            const loginInfo = MobileDeviceHelper.Instance.getLoginInfo();
            logEvent.audid = loginInfo.audid;
        }

        return JSON.stringify(logEvent);
    }

    // 实例方法：获取 AppEvent 流名称（对应原 JS 原型方法）
    public getSendAwsForAppEvent_StreamName(): string {
        return TSUtility.isLiveService() 
            ? "HRV.LIVE.AppEventLog" 
            : "HRV.QA.AppEventLog";
    }

    // 实例方法：获取流名称（对应原 JS 原型方法）
    public getStreamName(name: string): string {
        if (name === "Base") {
            return "HRV.LIVE.ClientExceptionLog";
        } else if (name === "TTL") {
            return "HRV.LIVE.ClientLatencyLog";
        } else {
            cc.error("getStreamName invalid name", name);
            return "";
        }
    }

    // 实例方法：获取服务端 URL（对应原 JS 原型方法）
    public getServerUrl(): string {
        return TSUtility.isLiveService()
            ? "https://app-firehoseproxy.highrollervegas.net/firehose/record/put"
            : "https://app-firehoseproxy-dev.highrollervegas.net/firehose/record/put";
    }

    // 静态方法：获取日志事件（对应原 JS 静态方法 getLogEvent，与实例方法逻辑一致）
    public static getLogEvent(actionType: string, extraInfo: any): string {
        const logEvent: LogEventData = {
            action_type: actionType,
            uid: 0,
            waccess_date: Utility.getWebAccessDate(),
            client_session_key: TSUtility.getClientSessionKey(),
            service_type: TSUtility.getServiceType(),
            sub_service_type: TSUtility.getSubServiceType(),
            source: "c",
            extra_info: extraInfo,
            vip_level: 0,
            vip_exp: 0,
            level: 0,
            level_exp: 0,
            revenue: 0,
            loc: "",
            subloc: "",
            zoneid: 0,
            client_ip: "",
            log_date: TSUtility.getServerBaseNowUnixTime(),
            sseq: TSUtility.getNanoTime(),
            audid: "",
            platform_id: TSUtility.getPlatformID(),
            account_site: TSUtility.getAccountSite(),
            appsflyer_id: "",
            client_version: Utility.getClientVersion(),
            cdn_host: TSUtility.getCDNHostURL(),
            service_mode: TSUtility.getServiceMode()
        };

        const userInstance = UserInfo.instance();
        if (userInstance) {
            logEvent.uid = userInstance.getUid();
        }

        if (SDefine.Use_Mobile_Auth_v2) {
            const loginInfo = MobileDeviceHelper.Instance.getLoginInfo();
            logEvent.audid = loginInfo.audid;
        }

        return JSON.stringify(logEvent);
    }

    // 实例方法：根据信息获取记录（对应原 JS 原型方法）
    public getRecordByInfo(
        logType: string,
        t: any,
        url: string,
        lineNumber: number | string,
        colNumber: number | string
    ): string {
        // 截断 URL 字节长度
        if (TSUtility.getStringByteLength(url) > 1900) {
            url = TSUtility.getStringTruncateByteLength(url, 1900);
        }

      

        // 截断错误信息字节长度
        let errorMsg = JSON.stringify(t);
        if (TSUtility.getStringByteLength(errorMsg) > 9990) {
            errorMsg = TSUtility.getStringTruncateByteLength(errorMsg, 9990);
        }

        // 获取设备 UDID
        let udid = "";
        if (Utility.isMobileGame() && SDefine.Use_Mobile_Auth_v2) {
            udid = MobileDeviceHelper.Instance.getLoginInfo().udid;
        } else {
            udid = LocalStorageManager.getLocalDeviceInfo().udid;
        }

       
        var exceptionRecord = {
                uid: "",
                waccess_date: Utility.getWebAccessDate(),
                log_date: TSUtility.getServerBaseNowUnixTime(),
                error_msg: errorMsg,
                url: url,
                line_number: lineNumber,
                col_number: colNumber,
                client_version: Utility.getClientVersion(),
                service_mode: TSUtility.getServiceMode(),
                udid: udid,
                entrance_path: "",
                client_ip: "",
                http_user_agent: cc.sys.browserType ? cc.sys.browserType : "",
                service_type: TSUtility.getServiceType(),
                market: TSUtility.getMarketType(),
                device_os: cc.sys.os ? cc.sys.os : "",
                is_mobile: Utility.isMobileGame(),
                device_platform: "",
                js_engine: "",
                country_iso_code: "",
                subdivisions_name: "",
                city_name: "",
                browser: cc.sys.browserVersion ? cc.sys.browserVersion : "",
                log_type: logType
            };
        

        // 原 JS 中注释的 Facebook 相关逻辑，保留兼容
        // if (Utility.isFacebookInstant() === 1) {
        //     exceptionRecord.fbinstant_platform = FBInstant.getPlatform();
        // }

        return JSON.stringify(exceptionRecord);
    }

    // 实例方法：发送 AWS 异常回调（对应原 JS 原型方法）
    public onSendAwsException(errorInfo: string, t: boolean | undefined): void {
        // 非生产环境且非原生平台，弹出提示/复制剪贴板
        if (!t && TSUtility.isTestAbleSeverMode()) {
            if (!cc.sys.isNative) {
                if (typeof alert !== "undefined") {
                    alert(errorInfo);
                }
            } else {
                NativeUtil.copyToClipBoard(errorInfo);
                CommonPopup.getCommonPopup((close: Error, popup: any) => {
                    if (!close) {
                        popup.open()
                            .setInfo("Exception", errorInfo)
                            .setOkBtn("OK", () => {});
                    }
                });
            }
        }
    }

    // 实例方法：请求 Firehose 代理（对应原 JS 原型方法）
    public requestFirehoseProxy(data: FirehoseProxyData, params: string = ""): void {
        // 构建请求 URL
        let url = this.getServerUrl();
        if (params !== "") {
            url += `?${params}`;
        }

        // 发送 HTTP 请求
        const requestData = JSON.stringify(data);
        Utility.httpCall(
            url,
            requestData,
            (res: any, success: boolean) => {
                if (!success) {
                    cc.log("Get Failed" + res);
                }
            },
            0,
            { "Content-Type": "text/plain" }
        );
    }

    // 实例方法：发送 AWS 异常日志（对应原 JS 原型方法）
    public sendAws(errorInfo: string, t: boolean | undefined, n?: any): void {
        const now = Utility.getUnixTimestamp();
        const interval = now - this._exceptionLastSentTime;
        const minutes = Math.floor(interval / 60 % 60);
        const errorMsg = JSON.parse(errorInfo).error_msg;

        // 去重且发送次数不超过 10 次/分钟
        if (!this._exceptionSentMsgList.includes(errorMsg)) {
            this._exceptionSentMsgList.push(errorMsg);
            this.onSendAwsException(errorInfo, t);

            this._exceptionSentCount = minutes < 1 ? this._exceptionSentCount + 1 : 1;
            if (this._exceptionSentCount <= 10) {
                this._exceptionLastSentTime = now;
                const firehoseData: FirehoseProxyData = {
                    DeliveryStreamName: "HRV.LIVE.ClientExceptionLog",
                    Data: errorInfo
                };
                this.requestFirehoseProxy(firehoseData);
            }
        }
    }

    // 实例方法：发送 AWS TTL 日志（对应原 JS 原型方法）
    public sendAwsForTTL(data: string): void {
        const firehoseData: FirehoseProxyData = {
            DeliveryStreamName: "HRV.LIVE.ClientLatencyLog",
            Data: data
        };
        this.requestFirehoseProxy(firehoseData);
    }

    // 实例方法：发送 AWS AppEvent 日志（对应原 JS 原型方法）
    public sendAwsForAppEvent(actionType: string, extraData: any = {}): void {
        // 服务模式未就绪则不发送
        const serviceMode = TSUtility.getServiceMode();
        if (serviceMode === "") {
            cc.log("sendAwsForAppEvent not ready serviceMode");
            return;
        }

        // 构建日志和请求参数
        const logData = this.getLogEvent(actionType, JSON.stringify(extraData));
        const streamName = this.getSendAwsForAppEvent_StreamName();
        const firehoseData: FirehoseProxyData = {
            DeliveryStreamName: streamName,
            Data: logData
        };
        const requestParams = `CSK=${TSUtility.getClientSessionKey()}&ACT=${actionType}`;

        this.requestFirehoseProxy(firehoseData, requestParams);
    }
}