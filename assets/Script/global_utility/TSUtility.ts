import { Utility } from "./Utility";

const { ccclass } = cc._decorator;

export enum ViewFitMode {
    Height = 0,
    Width = 1,
    Both = 2
}

@ccclass
export default class TSUtility {
    // ===================== 静态成员变量 初始化 =====================
    private static _loginServerTime: number = 0;
    private static _loginClientTime: number = 0;
    private static _platformASID: string = "";
    private static _platformID: string = "";
    private static _accountSite: string = "";
    private static _clientSessionKey: string = "";
    private static _cdnHostUrl: string = "";
    private static _setMultiTouchCallback: Function | null = null;
    private static _facebookAppId: string = "";
    private static _shareServerAddress: string = "";
    private static _commonResourceURL: string = "";
    private static _serviceMode: string = "";
    public static appConfigEntrancePath: string = "";
    private static _Mode: boolean = false;
    public static testDirectSlot: string = "";
    public static testAudid: string = "";
    private static _basicCommonServerUrl: string = "";
    private static _basicCFCommonServerUrl: string = "";
    private static _earlyFBInit: boolean | null = null;

    // ===================== Getter / Setter 属性 =====================
    public static get TestDirectSlot(): string {
        return TSUtility.testDirectSlot;
    }

    public static set TestDirectSlot(value: string) {
        TSUtility.testDirectSlot = value;
    }

    public static get TestAudID(): string {
        return TSUtility.testAudid;
    }

    public static set TestAudID(value: string) {
        TSUtility.testAudid = value;
    }

    /**
     * Vec2 转 Vec3 通用函数 (2D专用，z轴固定0)
     * @param vec2 要转换的二维向量
     * @returns 转换后的三维向量
     */
    public static vec2ToVec3(vec2: cc.Vec2): cc.Vec3 {
        return new cc.Vec3(vec2.x, vec2.y, 0);
    }

    // ===================== 全局工具方法 开始 =====================
    public static animationAction(target: cc.Animation | sp.Skeleton, animName: string): cc.ActionInterval | null {
        if (target instanceof cc.Animation) {
            const animState = target.getAnimationState(animName);
            return cc.sequence(
                cc.callFunc(() => target.play(animName, 0)),
                cc.delayTime(animState.duration)
            );
        }
        if (target instanceof sp.Skeleton) {
            return cc.sequence(
                cc.callFunc(() => target.setAnimation(0, animName, false)),
                cc.delayTime(target.findAnimation(animName).duration)
            );
        }
        return null;
    }

    public static moveToNewParent(node: cc.Node, newParent: cc.Node): void {
        const worldPos = node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        node.removeFromParent(false);
        newParent.addChild(node);
        const localPos = newParent.convertToNodeSpaceAR(worldPos);
        node.setPosition(localPos);
    }

    public static moveToNewParentBySelfPostion(node: cc.Node, newParent: cc.Node): void {
        let worldPos = node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        if (node.parent) {
            worldPos = node.parent.convertToWorldSpaceAR(new cc.Vec2(node.position.x, node.position.y));
        }
        node.removeFromParent(false);
        newParent.addChild(node);
        const localPos = newParent.convertToNodeSpaceAR(worldPos);
        node.setPosition(localPos);
    }

    public static shuffle(arr: any[]): any[] {
        let len = arr.length;
        for (; len > 0; ) {
            const randomIdx = Math.floor(Math.random() * len);
            const temp = arr[--len];
            arr[len] = arr[randomIdx];
            arr[randomIdx] = temp;
        }
        return arr;
    }

    public static endGame(): void {
        if (Utility.isMobileGame()) {
            cc.game.end();
        } else if (Utility.isFacebookInstant()) {
            // @ts-ignore
            FBInstant.quit();
        }
    }

    public static restartErrorStatus(): void {
        if (Utility.isFacebookWeb()) {
            const baseUrl = TSUtility.getHrefBaseUrl() + window.location.search;
            window.location.href = baseUrl;
        }
    }

    public static refreshURL(url: string): void {
        if (cc.sys.isBrowser) {
            window.location.href = url;
        }
    }

    public static reloadCurrentPage(): void {
        if (cc.sys.isBrowser) {
            window.location.reload();
        }
    }

    public static setLoginTime(serverTime: number): void {
        TSUtility._loginServerTime = serverTime;
        TSUtility._loginClientTime = Utility.getUnixTimestamp();
    }

    public static getServerClientTimeGap(): number {
        return TSUtility._loginServerTime - TSUtility._loginClientTime;
    }

    public static getServerBaseNowUnixTime(): number {
        return Utility.getUnixTimestamp() + TSUtility.getServerClientTimeGap();
    }

    public static getNanoTime(): number {
        return 1000 * Utility.getUnixTimestamp_MilliSecond();
    }

    public static getPlatformID(): string {
        return TSUtility._platformID;
    }

    public static getAccountSite(): string {
        return TSUtility._accountSite;
    }

    public static setPlatformInfo(platformId: string, accountSite: string): void {
        TSUtility._platformID = platformId;
        TSUtility._accountSite = accountSite;
    }

    public static setESASID(asId: string): void {
        TSUtility._platformASID = asId;
    }

    public static getESASID(): string {
        return TSUtility._platformASID;
    }

    public static changeSubPackagePath(path: string): void {
        if (cc.loader['subPackPipe']) {
            cc.log("has cc.loader.subPackPipe", path);
            for (let i = 0; i < cc.loader['subPackPipe'].paths.length; ++i) {
                cc.log("change cc.loader.subPackPipe", i, path);
                cc.loader['subPackPipe'].paths[i] = path;
            }
        }
    }

    public static setClientSessionKey(key: string): void {
        cc.log("setClientSessionKey", key);
        TSUtility._clientSessionKey = key;
    }

    public static getClientSessionKey(): string {
        return TSUtility._clientSessionKey;
    }

    public static setCDNHostURL(url: string): void {
        const regResult = /^(?:\w+\:\/\/)?([^\/]+)([^\?]*)\??(.*)$/.exec(url);
        if (regResult && regResult[1]) {
            cc.log("setCDNHostURL", url, regResult[1]);
            TSUtility._cdnHostUrl = regResult[1];
        } else {
            TSUtility._cdnHostUrl = url;
        }
    }

    public static getCDNHostURL(): string {
        return TSUtility._cdnHostUrl;
    }

    public static getServerBasePstBaseTime(timestamp: number): number {
        const pstTime = TSUtility.getUtcToPstTimeStamp(timestamp);
        const date = new Date();
        date.setTime(1000 * pstTime);
        date.setUTCHours(0);
        date.setUTCMinutes(0);
        date.setUTCSeconds(0);
        date.setUTCMilliseconds(0);
        const baseTime = Math.floor(date.getTime() / 1000);
        return TSUtility.getPstToUtcTimestamp(baseTime);
    }

    public static setAniSpeed(anim: cc.Animation, speed: number): void {
        anim.getAnimationState(anim.currentClip!.name).speed = speed;
    }

    public static getStringByteLength(str: string): number {
        let len = 0;
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            len += charCode >> 11 ? 3 : charCode >> 7 ? 2 : 1;
        }
        return len;
    }

    public static getStringTruncateByteLength(str: string, maxLen: number): string {
        let currLen = 0;
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            currLen += charCode >> 11 ? 3 : charCode >> 7 ? 2 : 1;
            if (currLen > maxLen) {
                return str.substring(0, i);
            }
        }
        return str;
    }

    public static getServerBasePstBaseTimeHour(timestamp: number): number {
        const pstTime = TSUtility.getUtcToPstTimeStamp(timestamp);
        const date = new Date();
        date.setTime(1000 * pstTime);
        date.setUTCMinutes(0);
        date.setUTCSeconds(0);
        date.setUTCMilliseconds(0);
        const baseTime = Math.floor(date.getTime() / 1000);
        return TSUtility.getPstToUtcTimestamp(baseTime);
    }

    /** 增强版 isValid 判断，兼容cc对象+普通对象 */
    public static isValid(target: any): boolean {
        return typeof target !== "undefined" && target !== null && cc.isValid(target);
    }

    public static getEllipsisName(name: string, maxLen: number = 8): string {
        return name.length > maxLen ? name.substr(0, maxLen) + "..." : name;
    }

    public static getParameterByName(name: string, url: string = window.location.href): string {
        name = name.replace(/[\[\]]/g, "\\$&");
        const reg = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)").exec(url);
        return reg && reg[2] ? decodeURIComponent(reg[2].replace(/\+/g, " ")) : "";
    }

    public static getQueryString(): string {
        return window.location.search ? window.location.search : "";
    }

    public static getQueryStringFromUrl(url: string): string {
        const match = url.match(/\?(.*)$/);
        return match ? match[0] : "";
    }

    public static getHrefBaseUrl(): string {
        return window.location.href.split("?")[0];
    }

    public static checkEndExitFullScreen(): void {
        cc.screen['fullScreen'] && cc.screen['fullScreen']() && cc.screen['exitFullScreen']()
    }

    public static setSetMultiTouchCallback(cb: Function): void {
        TSUtility._setMultiTouchCallback = cb;
    }

    public static setMultiTouch(isOpen: boolean): void {
        if (TSUtility._setMultiTouchCallback) {
            TSUtility._setMultiTouchCallback(isOpen);
        } else {
            cc.error("TSUtility.setMultiTouchCallback not set, use default implementation.");
        }
    }

    public static setFacebookAppId(id: string): void {
        TSUtility._facebookAppId = id;
    }

    public static getFacebookAppId(): string {
        return TSUtility._facebookAppId;
    }

    public static setShareServerAddress(url: string): void {
        TSUtility._shareServerAddress = url;
    }

    public static getShareServerAddress(): string {
        return TSUtility._shareServerAddress;
    }

    public static setCommonResourceUrl(url: string): void {
        TSUtility._commonResourceURL = url;
    }

    public static getCommonResourceUrl(): string {
        // return TSUtility._commonResourceURL;
        return "https://highrollervegas.akamaized.net/common/";
    }

    public static setServiceMode(mode: string): void {
        TSUtility._serviceMode = mode;
    }

    public static getServiceMode(): string {
        return TSUtility._serviceMode;
    }

    public static isLiveService(): boolean {
        return TSUtility._serviceMode === "LIVE";
    }

    public static isDevService(): boolean {
        return TSUtility._serviceMode === "DEV";
    }

    public static isQAService(): boolean {
        return TSUtility._serviceMode === "QA";
    }

    public static setAppConfigEntrancePath(path: string): void {
        TSUtility.appConfigEntrancePath = path;
    }

    public static getAppConfigEntrancePath(): string {
        return TSUtility.appConfigEntrancePath;
    }

    public static jsonParseWithExceptionHandling(jsonStr: string): any | null {
        let result = null;
        try {
            result = JSON.parse(jsonStr);
        } catch (error) {
            cc.error(`JSON.parse fail: [${jsonStr}]`);
            result = null;
        }
        return result;
    }

    public static copyValueObjToObj(src: any, dest: any, key: string): boolean {
        if (!src || !dest || typeof src[key] === "undefined" || typeof dest[key] === "undefined") {
            return false;
        }
        dest[key] = src[key];
        return true;
    }

    public static setADMode(): void {
        TSUtility._Mode = true;
    }

    public static getADMode(): boolean {
        return TSUtility._Mode;
    }

    public static isTestDirectSlotMode(): boolean {
        return TSUtility.isTestAbleSeverMode() && TSUtility.testDirectSlot !== "";
    }

    public static isTestAudIDMode(): boolean {
        return TSUtility.isTestAbleSeverMode() && TSUtility.testAudid !== "";
    }

    public static isTestAbleSeverMode(): boolean {
        return TSUtility.isDevService() || TSUtility.isQAService();
    }

    public static isTestAuthUserId(): boolean {
        return TSUtility.isTestAbleSeverMode() && TSUtility.testAudid !== "";
    }

    public static getUserABTestGroupNum(val: number, groupCount: number): number {
        return Math.floor(val / 2097152) % groupCount;
    }

    public static getUserABTestGroupNumNew(val: number, groupCount: number): number {
        return Math.floor(val / 2097152) % groupCount;
    }

    public static getUtcToPstTimeStamp(timestamp: number): number {
        return timestamp - 28800;
    }

    public static getPstToUtcTimestamp(timestamp: number): number {
        return timestamp + 28800;
    }

    public static getLocalPosition(node: cc.Node, targetNode: cc.Node): cc.Vec2 {
        const worldPos = node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        return targetNode.convertToNodeSpaceAR(worldPos);
    }

    public static setNodePositionToTarget(node: cc.Node, targetNode: cc.Node): void {
        const worldPos = targetNode.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const localPos = node.parent!.convertToNodeSpaceAR(worldPos);
        node.setPosition(localPos);
    }

    public static setBasicCommonServerUrl(url: string): void {
        TSUtility._basicCommonServerUrl = url;
        TSUtility._basicCFCommonServerUrl = TSUtility.getCFAccelerationURL(url);
    }

    public static getBasicCommonServerUrl(): string {
        return TSUtility._basicCommonServerUrl;
    }

    public static getBasicCFCommonServerUrl(): string {
        return TSUtility._basicCFCommonServerUrl;
    }

    public static loadScript(url: string, cb: Function): void {
        const script = document.createElement("script") as any;
        script.type = "text/javascript";
        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    script.onreadystatechange = null;
                    cb();
                }
            };
        } else {
            script.onload = function () {
                cb();
            };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    /** TS原生异步方法 - 加载远程脚本 */
    public static async asyncLoadScript(url: string): Promise<void> {
        return new Promise<void>((resolve) => {
            TSUtility.loadScript(url, () => resolve());
        });
    }

    public static enableEarlyFBInit(): boolean {
        if (TSUtility._earlyFBInit !== null) {
            cc.log("enableEarlyFBInit check ", TSUtility._earlyFBInit);
            return TSUtility._earlyFBInit;
        }
        const isEnable = false;//(typeof __appConfig__ !== "undefined") || TSUtility.getFacebookAppId() !== "";
        cc.log(`enableEarlyFBInit check ${isEnable}`);
        TSUtility._earlyFBInit = isEnable;
        return isEnable;
    }

    public static getCFAccelerationURL(url: string): string {
        if (url.indexOf("cf-") !== -1) return url;
        const splitUrl = url.split("://");
        return splitUrl.length ? `${splitUrl[0]}://cf-${splitUrl[1]}` : `cf-${url}`;
    }

    public static getServiceType(): string {
        if (Utility.isFacebookWeb()) {
            return "h5";
        } else if (Utility.isFacebookInstant()) {
            return "fbinstant";
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            return "ios";
        } else if(cc.sys.os === cc.sys.OS_ANDROID){
            return "android";
        }
        else {
            return "aos";
        }
    }

    public static getSubServiceType(): string {
        if (Utility.isFacebookWeb()) {
            return "WEB";
        } else if (Utility.isFacebookInstant()) {
            // @ts-ignore
            return FBInstant.getPlatform();
        } else if (Utility.isMobileGame()) {
            return cc.sys.os === cc.sys.OS_IOS ? "IOS" : "ANDROID";
        } else {
            cc.error("getSubServiceType not supported");
            return "unknown";
        }
    }

    public static getMarketType(): string {
        if (Utility.isFacebookWeb() || Utility.isFacebookInstant()) {
            return "facebook";
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            return "appstore";
        } else {
            return "googleplay";
        }
    }

    public static btoa(str: string): string | null {
        str = "" + str;
        for (let i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 255) return null;
        }
        let result = "";
        for (let i = 0; i < str.length; i += 3) {
            const codeArr: (number | undefined)[] = [undefined, undefined, undefined, undefined];
            codeArr[0] = str.charCodeAt(i) >> 2;
            codeArr[1] = (3 & str.charCodeAt(i)) << 4;
            if (str.length > i + 1) {
                codeArr[1] |= str.charCodeAt(i + 1) >> 4;
                codeArr[2] = (15 & str.charCodeAt(i + 1)) << 2;
            }
            if (str.length > i + 2) {
                codeArr[2] |= str.charCodeAt(i + 2) >> 6;
                codeArr[3] = 63 & str.charCodeAt(i + 2);
            }
            for (let j = 0; j < codeArr.length; j++) {
                result += codeArr[j] === undefined ? "=" : TSUtility.btoaLookup(codeArr[j] as number);
            }
        }
        return result;
    }

    private static btoaLookup(num: number): string | undefined {
        if (num < 26) return String.fromCharCode(num + "A".charCodeAt(0));
        if (num < 52) return String.fromCharCode(num - 26 + "a".charCodeAt(0));
        if (num < 62) return String.fromCharCode(num - 52 + "0".charCodeAt(0));
        if (num === 62) return "+";
        if (num === 63) return "/";
        return undefined;
    }

    public static atob(str: string): string | null {
        str = ("" + str).replace(/[ \t\n\f\r]/g, "");
        if (str.length % 4 === 0) str = str.replace(/==?$/, "");
        if (str.length % 4 === 1 || /[^+/0-9A-Za-z]/.test(str)) return null;

        let result = "";
        let currCode = 0;
        let bitCount = 0;
        for (let i = 0; i < str.length; i++) {
            currCode <<= 6;
            currCode |= TSUtility.atobLookup(str[i]) as number;
            bitCount += 6;
            if (bitCount === 24) {
                result += String.fromCharCode((16711680 & currCode) >> 16);
                result += String.fromCharCode((65280 & currCode) >> 8);
                result += String.fromCharCode(255 & currCode);
                currCode = 0;
                bitCount = 0;
            }
        }
        if (bitCount === 12) {
            currCode >>= 4;
            result += String.fromCharCode(currCode);
        } else if (bitCount === 18) {
            currCode >>= 2;
            result += String.fromCharCode((65280 & currCode) >> 8);
            result += String.fromCharCode(255 & currCode);
        }
        return result;
    }

    private static atobLookup(char: string): number | undefined {
        if (/[A-Z]/.test(char)) return char.charCodeAt(0) - "A".charCodeAt(0);
        if (/[a-z]/.test(char)) return char.charCodeAt(0) - "a".charCodeAt(0) + 26;
        if (/[0-9]/.test(char)) return char.charCodeAt(0) - "0".charCodeAt(0) + 52;
        if (char === "+") return 62;
        if (char === "/") return 63;
        return undefined;
    }

    public static leftSideRankIsBig(val1: number, val2: number): boolean {
        return val1 !== 0 && (val2 === 0 || val1 < val2);
    }

    public static isDynamicSlot(slotId: string): boolean {
        const splitArr = slotId.split("_");
        return splitArr.length >= 2 && splitArr[splitArr.length - 1] === "dy";
    }

    /** TS原生异步方法 - 异步加载本地资源 */
    public static async asyncLoadResource(resPath: string): Promise<{ error: Error | null, resource: any }> {
        return new Promise((resolve) => {
            cc.loader.loadRes(resPath, (error, resource) => {
                resolve({ error, resource });
            });
        });
    }

    public static setIgnoreStartTouchListener(node: cc.Node): void {
        (node["_touchListener"] as any).onTouchBegan = function (touch: cc.Touch, event: cc.Event|any) {
            const pos = touch.getLocation();
            const target = this.owner;
            if (target._hitTest(pos, this)) {
                event.type = "touchstart";
                event.touch = touch;
                event.bubbles = true;
                target.dispatchEvent(event);
                event.type = "touch";
                event.touch = null;
                event.bubbles = false;
            }
            return false;
        };
    }

    public static setIgnoreEndTouchListener(node: cc.Node): void {
        (node["_touchListener"] as any).onTouchEnd = function (touch: cc.Touch, event: cc.Event|any) {
            const pos = touch.getLocation();
            const target = this.owner;
            if (target._hitTest(pos, this)) {
                event.type = "touchend";
                event.touch = touch;
                event.bubbles = true;
                target.dispatchEvent(event);
                event.type = "touch";
                event.touch = null;
                event.bubbles = false;
            }
            return false;
        };
    }

    public static getWorldParentScale(node: cc.Node | null): number {
        if (node === null) return 1;
        let scale = 1;
        let parent = node.parent;
        while (parent) {
            scale *= parent.scale;
            parent = parent.parent;
        }
        return scale === 0 ? 0.01 : scale;
    }

    public static getConvertFloatingPoint(num: number, decimal: number): number {
        const str = num.toString();
        if (str.indexOf(".") === -1) return num;
        if (str.split(".")[1].length <= decimal) return num;
        return Math.round(10 * (num + Number.EPSILON)) / 10;
    }

    public static strFormat(str: string, ...args: any[]): string {
        try {
            return str.replace(/\${(\d+)}/g, (match, idx) => {
                return typeof args[idx] !== "undefined" ? args[idx].toString() : match;
            });
        } catch (error) {
            cc.error("strFormat error: ", error, " str: ", str, " args: ", args);
            return str;
        }
    }

    public static setNodeViewSizeFit(targetNode: cc.Node | null, fitMode: ViewFitMode = ViewFitMode.Both, offset: number = 200): void {
        if (!targetNode) {
            cc.error("setNodeViewSizeFit  fail. targetNode is null.");
            return;
        }
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        const canvasW = canvas.node.getContentSize().width;
        const canvasH = canvas.node.getContentSize().height;
        const canvasCenter = cc.v2(Math.floor(canvasW / 2), Math.floor(canvasH / 2));
        let parentScale = TSUtility.getWorldParentScale(targetNode);
        if (parentScale === 0) parentScale = 0.01;

        const localCenter = targetNode.parent!.convertToNodeSpaceAR(canvasCenter);
        targetNode.setPosition(targetNode.x, localCenter.y);

        const contentSize = targetNode.getContentSize();
        if (fitMode !== ViewFitMode.Height) contentSize.width = canvasW / parentScale + offset;
        if (fitMode !== ViewFitMode.Width) contentSize.height = canvasH / parentScale + offset;
        targetNode.setContentSize(contentSize);
    }

    public static getSpriteFrame(texture: cc.Texture2D | null): cc.SpriteFrame | null {
        if (!TSUtility.isValid(texture)) return null;
        return new cc.SpriteFrame(texture);
    }

    public static  preprocessJson(jsonStr: string): string {
        if (typeof jsonStr !== "string") return "";
        return jsonStr
            .trim() // 去除首尾空格
            .replace(/[\u0000-\u001F]/g, "") // 移除不可见控制字符
            .replace(/,\s*}/g, "}") // 移除对象末尾多余逗号（如 {"a":1,} → {"a":1}）
            .replace(/,\s*]/g, "]"); // 移除数组末尾多余逗号（如 [1,2,] → [1,2]）
    }
    
}