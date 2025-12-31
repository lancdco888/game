const { ccclass } = cc._decorator;
import SDefine from "./SDefine";

/**
 * URL查询参数解析器 内部工具类 - 原逻辑1:1还原
 */
export class PathSearchParams {
    private params: Map<string, string[]> = null!;

    constructor(queryStr: string) {
        this.params = new Map<string, string[]>();
        if (queryStr.startsWith("?")) {
            queryStr = queryStr.substring(1);
        }
        this.parseString(queryStr);
    }

    public parseString(queryStr: string): void {
        const self = this;
        if (queryStr !== "") {
            queryStr.split("&").forEach((item) => {
                const keyValue = item.split("=").map(decodeURIComponent);
                const key = keyValue[0];
                let value = keyValue[1];
                value = typeof value === "undefined" ? "" : value;
                self.append(key, value);
            });
        }
    }

    public appendFromQueryString(queryStr: string): void {
        if (queryStr.startsWith("?")) {
            queryStr = queryStr.substring(1);
        }
        this.parseString(queryStr);
    }

    public append(key: string, value: string): void {
        if (!this.params.has(key)) {
            this.params.set(key, []);
        }
        this.params.get(key)!.push(value);
    }

    public delete(key: string): void {
        this.params.delete(key);
    }

    public get(key: string): string | null {
        const values = this.params.get(key);
        return values ? values[0] : null;
    }

    public toString(): string {
        const paramArr: string[] = [];
        this.params.forEach((values, key) => {
            values.forEach((val) => {
                paramArr.push(encodeURIComponent(key) + "=" + encodeURIComponent(val));
            });
        });
        return paramArr.join("&");
    }

    public keys(): IterableIterator<string> {
        return this.params.keys();
    }

    public values(): IterableIterator<string[]> {
        return this.params.values();
    }

    public entries(): IterableIterator<[string, string[]]> {
        return this.params.entries();
    }

    public forEach(callback: (value: string, key: string, self: PathSearchParams) => void): void {
        const self = this;
        this.params.forEach((values, key) => {
            values.forEach((val) => {
                callback(val, key, self);
            });
        });
    }
}

/**
 * 入口路径参数管理类 - 全局单例 核心类
 */
@ccclass
export default class EntrancePathManager {
    private static _instance: EntrancePathManager = null!;
    private _entrancePath: string = "";

    // 全局单例获取方法 - 原逻辑完全一致
    public static Instance(): EntrancePathManager {
        if (this._instance == null) {
            this._instance = new EntrancePathManager();
            this._instance.init();
        }
        return this._instance;
    }

    // 入口路径 访问器(get/set) 保留原日志打印逻辑
    public get entrancePath(): string {
        return this._entrancePath;
    }

    public set entrancePath(val: string) {
        cc.log("set entrancePath " + val);
        this._entrancePath = val;
    }

    // 空实现初始化方法 - 保留原代码结构
    public init(): void { }

    /**
     * 根据参数名获取URL参数值 - 核心方法 正则匹配逻辑无修改
     * @param name 参数名
     * @returns 解码后的参数值 无则返回空字符串
     */
    public getParameterByName(name: string): string {
        name = name.replace(/[\[\]]/g, "\\$&");
        const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
        const results = regex.exec(this.entrancePath);
        if (!results || !results[2]) {
            return "";
        }
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    // ========== 所有业务参数获取方法 - 与原JS 1:1 完全一致 ==========
    public getHRVEntryPoint(): string {
        return this.getParameterByName("hrv_entrypoint");
    }

    public getFBSource(): string {
        return this.getParameterByName("fb_source");
    }

    public getRef(): string {
        return this.getParameterByName("ref");
    }

    public getTestAudid(): string {
        return this.getParameterByName("test_audid");
    }

    public getDirectSlotId(): string {
        return this.getParameterByName("directslot");
    }

    public getMode(): string {
        return this.getParameterByName("mode");
    }

    public getSpinKey(): string {
        return this.getParameterByName("spinKey");
    }

    public getResolution(): string {
        return this.getParameterByName("resolution");
    }

    public getFBInstantGameAdId(): string {
        return this.getParameterByName("fb_instant_game_ad_id");
    }

    public getHRVShareInfo(): string {
        return this.getParameterByName("hrv_shareinfo");
    }

    public getLandingSlotId(): string {
        return this.getParameterByName("landing_slot");
    }

    /**
     * 获取着陆区ID - 保留原try/catch异常捕获+默认值逻辑
     */
    public getLandingZoneId(): { isFind: boolean, value: number } {
        try {
            const zoneIdStr = this.getParameterByName("landing_zoneid");
            const zoneId = parseInt(zoneIdStr);
            if (isNaN(zoneId)) {
                return { isFind: false, value: SDefine.HIGHROLLER_ZONEID };
            } else {
                return { isFind: true, value: zoneId };
            }
        } catch (error) {
            return { isFind: false, value: SDefine.HIGHROLLER_ZONEID };
        }
    }
}