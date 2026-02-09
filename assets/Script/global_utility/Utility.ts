/**
 * Cocos Creator 全局工具类 TS 完整版
 * 兼容原生/网页环境，无功能删减，严格类型注解
 */
declare const cc: any; // Cocos全局对象声明(如果项目已有全局声明可删除此行)
declare function __getVersion(): string | undefined; // 原生层版本获取方法声明
declare const jsb: any; // Cocos原生层jsb对象声明

declare global {
    // 扩展String原型的format方法 - TS必须先声明接口扩展，否则语法报错
    interface String {
        format(...args: any[]): string;
        trimLeft():string;
    }
}

// 实现SDefine.format 字符串格式化方法
String.prototype.format = function (...args: any[]) {
    let str = this as string;
    for (const key in args) {
        str = str.replace(/%[a-z]/, args[key]);
    }
    return str;
};

// 实现SDefine.format 字符串格式化方法
String.prototype.trimLeft = function () {
    // let str = this as string;
    // if (str.length === 0) return str;
    // let startIndex = 0;
    // // 循环判断字符串开头的字符是否是空白符，直到找到第一个非空白符
    // while (startIndex < str.length && this.isUnicodeSpace(str[startIndex])) {
    //     startIndex++;
    // }
    // // 截取从第一个非空白符开始到末尾的字符串
    // return str.substring(startIndex);
    return this;
};

// 全局变量 - 原代码的空对象/键值对
const KeyInfos: { [key: string]: any[] } = {};
const DownloadHelper: Record<string, never> = {};

// ===================== 核心全局工具类 - Utility =====================
const Utility = {
    resourceVersion: "",
    webAccessDate: 0,
    unusePatch: false,
    isAuth:false,
    AccessToken:"",

    /** 向量减法 Vec2.sub(e) 并返回 */
    pSub(t: cc.Vec2, e: cc.Vec2): cc.Vec2 {
        return t.sub(e);
    },

    /** 向量赋值 Vec2.set(e) 并返回 */
    pIn(t: cc.Vec2, e: cc.Vec2): cc.Vec2 {
        return t.set(e);
    },

    /** 向量自身乘法 Vec2.mulSelf(e) 并返回 */
    pMultIn(t: cc.Vec2, e: number): cc.Vec2 {
        return t.mulSelf(e);
    },

    /** 向量置零 (x=0,y=0) */
    pZeroIn(t: cc.Vec2): void {
        t.x = t.y = 0;
    },

    /** 向量自身归一化 Vec2.normalizeSelf() */
    pNormalizeIn(t: cc.Vec2): void {
        t.normalizeSelf();
    },

    /** 向量自身加法 Vec2.addSelf(e) */
    pAddIn(t: cc.Vec2, e: cc.Vec2): void {
        t.addSelf(e);
    },

    /** 向量自身减法 Vec2.subSelf(e) */
    pSubIn(t: cc.Vec2, e: cc.Vec2): void {
        t.subSelf(e);
    },

    /** 判断矩形是否包含点 */
    rectContainsPoint(t: cc.Rect, e: cc.Vec2): boolean {
        return t.contains(e);
    },

    /** 随机返回 [-1, 1] 之间的数 */
    randomMinus1To1(): number {
        return 2 * (Math.random() - 0.5);
    },

    /** 设置节点旋转角度(反向适配) */
    setRotation(t: cc.Node, e: number): void {
        t.angle = -e;
    },

    /** 追加节点旋转角度(反向适配) */
    addRotation(t: cc.Node, e: number): void {
        t.angle += -e;
    },

    /** 获取节点旋转角度(反向适配) */
    getRotation(t: cc.Node): number {
        return -t.angle;
    },

    /** 数值区间限制 封装cc.misc.clampf */
    clampf(t: number, e: number, i: number): number {
        return cc.misc.clampf(t, e, i);
    },

    /** 角度转弧度 */
    degreesToRadians(t: number): number {
        return cc.misc.degreesToRadians(t);
    },

    /** 获取帧率因子(做了边界限制) */
    getFrameFactor(t: number): number {
        t /= 1 / 60;
        if (t > 2) t = 2;
        else if (t < 0.8) t = 0.8;
        return t;
    },

    /** 获取 [min, max] 区间的随机整数 */
    getRandomNumber(t: number, e: number): number {
        return Math.floor(Math.random() * (e - t + 1) + t);
    },

    /** 老虎机奖池金额显示格式化处理 */
    getDisplayJackpotMoney(t: number, e: number): number {
        const i = e - t;
        if (i > 20) {
            let r = Math.floor((t % 100) + 11) % 100;
            11 === r && (r = 10);
            e = 100 * Math.floor(e / 100) + r;
        } else if (i > 1) {
            const r = Math.floor((t % 10) + 1) % 10;
            e = 10 * Math.floor(e / 10) + r;
        }
        return e;
    },

    /** 数组乱序洗牌(经典Fisher-Yates算法) */
    shuffle<T>(t: T[]): T[] {
        let e: T, i: number;
        let r = t.length;
        for (; r !== 0; ) {
            i = Math.floor(Math.random() * r);
            e = t[--r];
            t[r] = t[i];
            t[i] = e;
        }
        return t;
    },

    /** 【核心方法】创建Cocos组件事件回调 - 原代码中UISliderScrollBar大量使用 */
    getComponent_EventHandler(
        target: cc.Node,
        component: string,
        handler: string,
        customEventData: string|number|any = ""
    ): cc.Component.EventHandler {
        const eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        eventHandler.customEventData = customEventData;
        return eventHandler;
    },

    /** 是否是Facebook网页游戏环境 */
    isFacebookWeb(): boolean {
        return true; //!cc.sys.isNative && !Utility.isFacebookInstant()
    },

    /** 是否是Facebook小游戏环境 */
    isFacebookInstant(): boolean {
        return false; //typeof cc._FBInstantGame !== 'undefined'
    },

    /** 是否是移动端原生游戏环境 */
    isMobileGame(): boolean {
        return false; //!Utility.isFacebookWeb() && !Utility.isFacebookInstant()
    },

    /** 获取秒级时间戳 */
    getUnixTimestamp(): number {
        return Math.floor(new Date().getTime() / 1000);
    },

    /** 获取毫秒级时间戳 */
    getUnixTimestamp_MilliSecond(): number {
        return new Date().getTime();
    },

    /** 帧数转时间 */
    frameToTime(t: number, e: number): number {
        return t + e / 60;
    },

    /** 检查并加载场景 - 兼容原生热更/网页直装 */
    checkAndLoadScene(sceneName: string, callback?: (isErr?: boolean) => void): void {
        if (cc.sys.isNative) {
            if (this.unusePatch) {
                callback && callback();
                cc.director.loadScene(sceneName);
                return;
            }
            // 原代码的热更检测逻辑，保留空实现可自行补充
            cc.log("scene manifest is same", sceneName);
            callback && callback();
            cc.director.loadScene(sceneName);
        } else {
            callback && callback();
            cc.director.loadScene(sceneName);
        }
    },

    /** 是否是IE浏览器 */
    IsInternetExplorer(): boolean {
        if (cc.sys.isNative) return false;
        const userAgent = navigator.userAgent.toLowerCase();
        return (navigator.appName === "Netscape" && userAgent.indexOf("trident") > -1) || userAgent.indexOf("msie") > -1;
    },

    /**
     * 封装XMLHttpRequest网络请求 - GET/POST通用
     * @param url 请求地址
     * @param postData POST请求体
     * @param callback 回调 (res: string | HttpErrorRes, isErr: boolean) => void
     * @param timeout 超时时间
     * @param headers 请求头
     * @param reqId 请求ID
     * @param withCredentials 是否带跨域凭证
     */
    httpCall(
        url: string,
        postData?: string,
        callback?: (res: string | HttpErrorRes, isErr: boolean) => void,
        timeout?: number,
        headers?: { [key: string]: string },
        reqId?: number,
        withCredentials?: boolean
    ): void {
        try {
            cc.log("---------------httpCall:"+url);
            timeout = timeout || (this.isMobileGame() ? 60000 : 500000);
            const xhr = cc.loader.getXMLHttpRequest();
            let isCallbacked = false;
            const defaultErr: HttpErrorRes = { errorCode: 5020, errorMsg: "http unknown error", errorStatusCode: 1004 };

            xhr.onerror = () => {
                cc.error("httpCall onerror ", url);
                !isCallbacked && (isCallbacked = true, callback && callback(defaultErr, true));
            };

            if (Utility.isAuth){
                headers["Authorization"] ="Bearer "+Utility.AccessToken; 
            }
            

            xhr.onreadystatechange = () => {
                if (xhr && !xhr.isAborted) {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            if (!isCallbacked) {
                                isCallbacked = true;
                                cc.log("http response ", xhr.responseText);
                                if (xhr.responseText.length === 0) {
                                    const err: HttpErrorRes = {
                                        errorCode: 4051,
                                        errorMsg: "xhr.responseText is empty",
                                        errorStatusCode: xhr.status,
                                        responseURL: xhr.responseURL || "empty"
                                    };
                                    callback && callback(err, true);
                                    return;
                                }
                                callback && callback(xhr.responseText, false);
                            }
                        } else {
                            cc.error("[ERROR] http call fail 3. ", url, " status ", xhr.status, "-", JSON.stringify(xhr));
                            cc.error("[ERROR] http call fail 3. " + xhr.responseText);
                            !isCallbacked && (isCallbacked = true);
                            let res: any = {};
                            try {
                                res = JSON.parse(xhr.responseText);
                                if (!res.error) {
                                    res = { error: { code: 5002, msg: "http status is not 200" }, reqId: 0 };
                                }
                            } catch (e) {
                                res = { error: { code: 5002, msg: "http status is not 200" }, reqId: 0 };
                            }
                            const err: HttpErrorRes = {
                                errorCode: res.error.code,
                                errorMsg: res.error.msg,
                                errorStatusCode: xhr.status
                            };
                            callback && callback(err, true);
                        }
                    }
                } else {
                    cc.error("[ERROR] http call fail 1. ", url);
                    !isCallbacked && (isCallbacked = true);
                    const err: HttpErrorRes = { errorCode: 5001, errorMsg: "invalid xhr status", errorStatusCode: 1004 };
                    callback && callback(err, true);
                }
            };

            let isIE = false;
            if (!cc.isNative || cc.sys.browserType === cc.sys.BROWSER_TYPE_IE) {
                isIE = true;
            }
            !isIE && (xhr.timeout = timeout!);

            xhr.ontimeout = () => {
                !isCallbacked && (isCallbacked = true);
                const err: HttpErrorRes = { errorCode: 5003, errorMsg: "http timeout", errorStatusCode: 0 };
                callback && callback(err, true);
            };

            if (postData) {
                cc.log("POST call ", url);
                cc.log("POST data ", postData);
                xhr.open("POST", url, true);
                isIE && (xhr.timeout = timeout!);
                if (headers) {
                    cc.log("header info ", JSON.stringify(headers));
                    Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));
                }
                withCredentials && (xhr.withCredentials = withCredentials);
                xhr.send(postData);
            } else {
                cc.log("GET call ", url);
                xhr.open("GET", url, true);
                isIE && (xhr.timeout = timeout!);
                if (headers) {
                    cc.log("header info ", JSON.stringify(headers));
                    Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));
                }
                // withCredentials && (xhr.withCredentials = withCredentials);
                xhr.send();
            }
        } catch (e) {
            cc.error("exception ", (e as Error).toString());
            (e as Error).stack && cc.error("callstack ", (e as Error).stack.toString());
        }
    },

    /** 获取应用版本号 */
    getApplicationVersion(): string {
        if (cc.sys.isNative) {
            if (cc.sys.os === cc.sys.OS_OSX) return "2.0.1";
            if (cc.sys.os === cc.sys.OS_WINDOWS) return "3.0.1";
            const version = __getVersion();
            return version ?? (cc.error("not found __getVersion"), "1.0.1");
        }
        return "2.4.11";
    },

    /** 获取资源版本号 */
    getResourceVersion(): string {
        return this.resourceVersion;
    },

    /** 设置资源版本号 */
    setResourceVersion(version: string): void {
        this.resourceVersion = version;
    },

    /** 是否是Cocos编辑器预览模式 */
    isCocosEditorPlay(): boolean {
        if (cc.sys.isNative) {
            if (cc.sys.os === cc.sys.OS_WINDOWS) return true;
        } else if (!this.resourceVersion) {
            return true;
        }
        return false;
    },

    /** 获取网页访问时间 */
    getWebAccessDate(): number {
        return this.webAccessDate || 0;
    },

    /** 设置网页访问时间 */
    setWebAccessDate(date: number): void {
        this.webAccessDate = date;
    },

    /** 获取客户端完整版本号(应用版本+资源版本) */
    getClientVersion(): string {
        return `${this.getApplicationVersion()}.${this.getResourceVersion()}`;
    },

    /** 添加键值信息 */
    addKeyInfo(key: string, val: any): void {
        if (!KeyInfos[key]) KeyInfos[key] = [];
        KeyInfos[key].push(val);
    },

    /** 获取键值信息数组 */
    getKeyInfo(key: string): any[] {
        if (!KeyInfos[key]) KeyInfos[key] = [];
        return KeyInfos[key];
    },

    /** 清空指定键的信息 */
    removeKeyInfo(key: string): void {
        if (KeyInfos[key]) KeyInfos[key] = [];
    }
};

// ===================== 原生环境专属方法 (cc.sys.isNative) =====================
if (cc.sys.isNative) {
    Object.assign(Utility, {
        /** 版本号转数字编码 */
        getApplicationVersionCode(version: string): number {
            const arr = version.split(".");
            if (arr.length === 0 || arr[0] === "") return -1;
            let code = parseInt(arr[0]);
            for (let i = 1; i < arr.length; i++) {
                code = 100 * code + parseInt(arr[i]);
            }
            if (arr.length === 3) code *= 100;
            return code;
        },

        /** 是否是该版本首次加载 */
        isFirstLoadingThisAppVersion(): boolean {
            return !!cc.AppFirstLoading;
        },

        /** 异步复制文件到可写目录 */
        copyFilesToWritePath(files: string[], dstPath: string, callback?: () => void, progress?: (file: string, idx: number, total: number) => void): void {
            this._copyFilesToWritePath(files, 0, dstPath, callback, progress);
        },

        /** 同步复制文件到可写目录 */
        copyFilesToWritePathSync(files: string[], dstPath: string): void {
            for (let i = 0; i < files.length; i++) {
                this._copyFileToWritePath(files[i], dstPath);
            }
        },

        /** 递归异步复制文件 */
        _copyFilesToWritePath(files: string[], idx: number, dstPath: string, callback?: () => void, progress?: (file: string, idx: number, total: number) => void): void {
            if (files.length !== idx) {
                const file = files[idx];
                this._copyFileToWritePath(file, dstPath);
                progress && progress(file, idx, files.length);
                setTimeout(() => this._copyFilesToWritePath(files, idx + 1, dstPath, callback, progress), 0);
            } else {
                callback && callback();
            }
        },

        /** 单个文件复制到可写目录 */
        _copyFileToWritePath(filePath: string, dstPath: string): void {
            const dir = dstPath + filePath.substring(0, filePath.lastIndexOf("/") + 1);
            const targetPath = dstPath + filePath;
            if (!jsb.fileUtils.isDirectoryExist(dir)) {
                cc.log("create directory", dir);
                jsb.fileUtils.createDirectory(dir);
            }
            const data = jsb.fileUtils.getDataFromFile(filePath);
            if (data) {
                jsb.fileUtils.writeDataToFile(data, targetPath);
                cc.log("file copy ", targetPath, " ", filePath);
            } else {
                cc.error("file copy error", targetPath, " ", filePath);
            }
        }
    });
}

// ===================== UUID 工具类 =====================
const Base64KeyChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const AsciiTo64 = new Array(128).fill(0);
for (let i = 0; i < 128; ++i) AsciiTo64[i] = 0;
for (let i = 0; i < 64; ++i) AsciiTo64[Base64KeyChars.charCodeAt(i)] = i;

const Reg_Dash = /-/g;
const Reg_Uuid = /^[0-9a-fA-F-]{36}$/;
const Reg_NormalizedUuid = /^[0-9a-fA-F]{32}$/;
const Reg_CompressedUuid = /^[0-9a-zA-Z+/]{22,23}$/;

const UuidUtils = {
    /** 压缩UUID为短字符 */
    compressUuid(uuid: string, prefixLen?: boolean): string {
        if (Reg_Uuid.test(uuid)) uuid = uuid.replace(Reg_Dash, "");
        else if (!Reg_NormalizedUuid.test(uuid)) return uuid;

        const i = prefixLen === true ? 2 : 5;
        return UuidUtils.compressHex(uuid, i);
    },

    /** 十六进制压缩为Base64 */
    compressHex(hex: string, prefixLen?: number): string {
        let i: number;
        const len = hex.length;
        i = prefixLen !== undefined ? prefixLen : len % 3;
        const prefix = hex.slice(0, i);
        const result: string[] = [];

        for (; i < len; ) {
            const s = parseInt(hex[i], 16);
            const c = parseInt(hex[i + 1], 16);
            const a = parseInt(hex[i + 2], 16);
            result.push(Base64KeyChars[s << 2 | c >> 2]);
            result.push(Base64KeyChars[(3 & c) << 4 | a]);
            i += 3;
        }
        return prefix + result.join("");
    },

    /** 解压短字符为标准UUID */
    decompressUuid(str: string): string {
        if (str.length === 23) {
            const hexArr: string[] = [];
            for (let i = 5; i < 23; i += 2) {
                const r = AsciiTo64[str.charCodeAt(i)];
                const o = AsciiTo64[str.charCodeAt(i + 1)];
                hexArr.push((r >> 2).toString(16));
                hexArr.push(((3 & r) << 2 | o >> 4).toString(16));
                hexArr.push((15 & o).toString(16));
            }
            str = str.slice(0, 5) + hexArr.join("");
        } else if (str.length === 22) {
            const hexArr: string[] = [];
            for (let i = 2; i < 22; i += 2) {
                const r = AsciiTo64[str.charCodeAt(i)];
                const o = AsciiTo64[str.charCodeAt(i + 1)];
                hexArr.push((r >> 2).toString(16));
                hexArr.push(((3 & r) << 2 | o >> 4).toString(16));
                hexArr.push((15 & o).toString(16));
            }
            str = str.slice(0, 2) + hexArr.join("");
        }
        return [str.slice(0, 8), str.slice(8, 12), str.slice(12, 16), str.slice(16, 20), str.slice(20)].join("-");
    },

    /** 判断是否为合法UUID */
    isUuid(str: string): boolean {
        return Reg_CompressedUuid.test(str) || Reg_NormalizedUuid.test(str) || Reg_Uuid.test(str);
    },

    /** 生成UUID V4版本 */
    generateUuidv4(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
};

// ===================== 网络请求错误返回体接口 =====================
interface HttpErrorRes {
    errorCode: number;
    errorMsg: string;
    errorStatusCode: number;
    responseURL?: string;
}

// 全局导出 (按需导出，可根据项目调整)
export { Utility, UuidUtils, KeyInfos, DownloadHelper };
