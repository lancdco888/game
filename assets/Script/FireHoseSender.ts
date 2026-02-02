import TSUtility from "./global_utility/TSUtility";

const { ccclass } = cc._decorator;

export var FHLogType: any = {};
(function (e: any) {
    e.Trace = "trace",
    e.Exception = "exception";
})(FHLogType);

@ccclass
export default class FireHoseSender {
    private static _instance: FireHoseSender | null = null;
    private _fireHoseInterface: any = null;

    public static Instance(): FireHoseSender {
        if (FireHoseSender._instance == null) {
            FireHoseSender._instance = new FireHoseSender();
        }
        return FireHoseSender._instance;
    }

    public init(e: any): void {
        this._fireHoseInterface = e;
    }

    public sendAws(e: any, t?: any, n?: any): void {
        // void 0 !== n && n != FHLogType.Exception || cc.error("Exception ", e),
        // null != this._fireHoseInterface ? this._fireHoseInterface.sendAws(e, t, n) : cc.error("FireHoseSender is not initialized")
    }

    public sendAwsForTTL(e: any): void {
        null != this._fireHoseInterface ? this._fireHoseInterface.sendAwsForTTL(e) : cc.error("FireHoseSender is not initialized");
    }

    public sendAwsForAppEvent(e: any, t?: any): void {
        void 0 === t && (t = {});
        "" != TSUtility.getServiceMode() ? 
            (null != this._fireHoseInterface ? this._fireHoseInterface.sendAwsForAppEvent(e, t) : cc.error("FireHoseSender is not initialized")) : 
            cc.log("sendAwsForAppEvent not ready serviceMode");
    }

    public getRecordByInfo(e: any, t: any, n: any, o: any, a: any): string {
        return null == this._fireHoseInterface ? 
            (cc.error("FireHoseSender is not initialized"), "") : 
            this._fireHoseInterface.getRecordByInfo(e, t, n, o, a);
    }

    public getRecord(e: any, t: any, n?: any): string {
        var o: any = {};
        o.msg = t.toString();
        n && (o.subInfo = n);
        var a = t.stack ? t.stack.toString() : "stack is null";
        return this.getRecordByInfo(e, o, a, -1, -1);
    }
}