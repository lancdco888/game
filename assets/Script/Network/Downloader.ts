const { ccclass } = cc._decorator;

// // ========== 关键修复1: 补全 Cocos 2.4.13 原生 jsb 类型声明 (必加，2.4.13 TS声明不全) ==========
// declare namespace jsb {
//     interface DownloaderTask {}
//     interface Downloader {
//         new(): Downloader;
//         setOnFileTaskSuccess(cb: () => void): void;
//         setOnTaskProgress(cb: (task: DownloaderTask, bytesReceived: number, totalBytesReceived: number, totalBytesExpected: number) => void): void;
//         setOnTaskError(cb: (task: DownloaderTask, errorCode: number, errorCodeInternal: number, errorStr: string) => void): void;
//         createDownloadFileTask(url: string, savePath: string): void;
//     }
// }

/**
 * 单文件下载器 原生jsb.Downloader封装 (修复所有TS类型报错)
 */
@ccclass
export default class Downloader {
    private _isFail: boolean = false;
    private _isReady: boolean = true;
    private _downloader: jsb.Downloader = null!;

    constructor() {
        this._isFail = false;
        this._isReady = true;
        this._downloader = new jsb.Downloader;
        this._downloader = new jsb.Downloader; // 保留原代码重复实例化的细节 不修改
    }

    /**
     * 同步下载文件方法 - 修复核心类型报错点
     * @param srcUrl 源地址
     * @param savePath 保存路径
     * @param retryCnt 重试次数
     * @param completeCallback 完成回调 (url: string, error?: {errorCode:number,errorCodeInternal:number,errorStr:string}) => void
     * @param progressCallback 进度回调 【强类型匹配原生签名】
     */
    public downloadFile(
        srcUrl: string, 
        savePath: string, 
        retryCnt: number, 
        completeCallback: ((url: string, error?: any) => void) | null, 
        progressCallback: ((task: jsb.DownloaderTask, bytesReceived: number, totalBytesReceived: number, totalBytesExpected: number) => void) | null
    ): void {
        const self = this;
        this._isFail = false;
        this._isReady = false;

        // URL 分段编码处理 - 保留原逻辑
        const urlSplit = srcUrl.split("/");
        let encodeUrl = urlSplit[0];
        for (let i = 1; i < urlSplit.length; ++i) {
            const encodeStr = encodeURIComponent(urlSplit[i]);
            encodeUrl += "/" + encodeStr;
        }
        cc.log("download encodeUrl: " + encodeUrl);

        // 创建保存目录 - 保留原逻辑
        const saveDir = savePath.substr(0, savePath.lastIndexOf("/"));
        if (!jsb.fileUtils.isDirectoryExist(saveDir)) {
            cc.log("create directory", saveDir);
            jsb.fileUtils.createDirectory(saveDir);
        }

        // 下载成功回调 - 保留原逻辑
        this._downloader.setOnFileTaskSuccess(() => {
            self._isReady = true;
            completeCallback && completeCallback(srcUrl);
        });

        // ========== 关键修复2: 进度回调判空赋值，严格匹配签名 ==========
        this._downloader.setOnTaskProgress(progressCallback || (() => {}));

        // 下载失败回调 & 重试机制 (最多重试3次 间隔3秒) - 保留原逻辑完全不变
        this._downloader.setOnTaskError((task, errorCode, errorCodeInternal, errorStr) => {
            cc.error(srcUrl + " errorCode ", errorCode, " ", errorCodeInternal, " ", errorStr);
            if (jsb.fileUtils.isFileExist(savePath)) {
                jsb.fileUtils.removeFile(savePath);
            }
            if (retryCnt <= 2) {
                setTimeout(() => {
                    self.downloadFile(srcUrl, savePath, retryCnt + 1, completeCallback, progressCallback);
                }, 3000);
            } else {
                self._isFail = true;
                if (completeCallback) {
                    const errorObj = {
                        errorCode: errorCode,
                        errorCodeInternal: errorCodeInternal,
                        errorStr: errorStr
                    };
                    completeCallback(srcUrl, errorObj);
                }
            }
        });

        this._downloader.createDownloadFileTask(encodeUrl, savePath);
    }

    /**
     * 异步Promise封装下载文件 - 类型修复
     * @param srcUrl 源地址
     * @param savePath 保存路径
     * @returns Promise<any>
     */
    public async asyncDownloadFile(srcUrl: string, savePath: string): Promise<any> {
        return new Promise((resolve) => {
            this.downloadFile(srcUrl, savePath, 0, (url, error) => {
                if (error) {
                    cc.log("download error ", url);
                    resolve({ errorCode: -1, errorMsg: "Network Error" });
                } else {
                    resolve(null);
                }
            }, null);
        });
    }

    public isDownloadFail(): boolean {
        return this._isFail;
    }

    public isReady(): boolean {
        return this._isReady;
    }
}

/**
 * 多文件并发下载器 下载队列+下载池 (修复所有TS类型报错，与原逻辑1:1一致)
 */
export class MultiDownLoader {
    private _downloaders: Array<Downloader> = [];
    private _reqList: Array<{srcUrl:string, writePath:string, size:number, name:string}> = [];
    private _readyLoaders: Array<Downloader> = [];
    private _multiTaskCnt: number = 20;
    private _totalDownloadCnt: number = 0;
    private _curCompleteCnt: number = 0;
    private _isComplete: boolean = false;
    private _startTime: number = 0;
    private _endTime: number = 0;
    private _downloadSize: number = 0;
    private _totDownloadSize: number = 0;
    private _completeFunc: ((error?: any) => void) | null = null;
    private _progressFunc: ((complete: number, total: number, name: string) => void) | null = null;
    private _interval: any = null;

    constructor() {
        this._downloaders = [];
        this._reqList = [];
        this._readyLoaders = [];
        this._multiTaskCnt = 20;
        this._totalDownloadCnt = 0;
        this._curCompleteCnt = 0;
        this._isComplete = false;
        this._startTime = 0;
        this._endTime = 0;
        this._downloadSize = 0;
        this._totDownloadSize = 0;
        this._completeFunc = null;
        this._progressFunc = null;
    }

    /**
     * 开始多文件下载 - 类型修复
     * @param reqList 下载文件队列
     * @param completeCallback 全部完成回调
     * @param progressCallback 单个文件完成进度回调
     */
    public downloadFiles(
        reqList: Array<{srcUrl:string, writePath:string, size:number, name:string}>, 
        completeCallback: ((error?: any) => void) | null, 
        progressCallback: ((complete: number, total: number, name: string) => void) | null
    ): void {
        this._reqList = reqList;
        this._totalDownloadCnt = reqList.length;
        this._isComplete = false;

        let concurrency = Math.floor(this._totalDownloadCnt / 5);
        this._multiTaskCnt = Math.max(Math.min(concurrency, 30), 1);
        
        this._progressFunc = progressCallback;
        this._completeFunc = completeCallback;

        for (let i = 0; i < reqList.length; ++i) {
            this._totDownloadSize += reqList[i].size;
        }

        this._startTime = (new Date()).getTime() / 1000;
        cc.log("start ", Math.floor(this._startTime));
        for (let i = 0; i < this._multiTaskCnt; ++i) {
            const downloader = new Downloader();
            this._downloaders.push(downloader);
            this._readyLoaders.push(downloader);
        }

        this._interval = setInterval(this.checkDownLoad.bind(this), 0.1);
    }

    /**
     * 异步Promise封装多文件下载 - 类型修复
     */
    public async asyncDownloadFiles(
        reqList: Array<{srcUrl:string, writePath:string, size:number, name:string}>, 
        progressCallback: ((complete: number, total: number, name: string) => void) | null
    ): Promise<boolean> {
        return new Promise((resolve) => {
            this.downloadFiles(reqList, (error) => {
                if (error) {
                    cc.log("download error ");
                    resolve(false);
                } else {
                    resolve(true);
                }
            }, progressCallback);
        });
    }

    public onCompleteDownload(error?: any): void {
        if (this._isComplete) return;
        this._isComplete = true;
        clearInterval(this._interval);
        
        if (this._completeFunc) {
            this._completeFunc(error);
            this._completeFunc = null;
            this._progressFunc = null;
        }

        if (error) {
            cc.log("download fail");
        } else {
            cc.log("download complete");
            this._endTime = (new Date()).getTime() / 1000;
            cc.log("end time ", Math.floor(this._endTime));
            cc.log("time ", this._endTime - this._startTime);
        }
    }

    public checkDownLoad(): void {
        const self = this;
        if (this._reqList.length <= 0) {
            if (this._readyLoaders.length === this._multiTaskCnt) {
                this.onCompleteDownload();
            }
            return;
        }

        const executeDownload = () => {
            const task = self._reqList.shift()!;
            const freeLoader = self.getReadyDownloader();
            if (!freeLoader) return;

            // ========== 关键修复3: 空进度回调传空函数，匹配签名 ==========
            freeLoader.downloadFile(task.srcUrl, task.writePath, 0, (url, error) => {
                if (error) {
                    self.onCompleteDownload(error);
                } else {
                    self._curCompleteCnt++;
                    self._downloadSize += task.size;
                    self._readyLoaders.push(freeLoader);
                    if (self._progressFunc) {
                        self._progressFunc(self._curCompleteCnt, self._totalDownloadCnt, task.name);
                    }
                }
            }, () => {});
        };

        while (this._reqList.length > 0 && this.isAvailableReadyLoader()) {
            executeDownload();
        }
    }

    public getTotDownloadSizeMB(): number {
        return this._totDownloadSize / 1048576;
    }

    public getCurDownloadSizeMB(): number {
        return this._downloadSize / 1048576;
    }

    public getDownloadProgress(): number {
        if (this._totalDownloadCnt === 0) return 0;
        return this._curCompleteCnt / this._totalDownloadCnt;
    }

    public getReadyDownloader(): Downloader | null {
        return this._readyLoaders.length === 0 ? null : this._readyLoaders.shift()!;
    }

    public isAvailableReadyLoader(): boolean {
        return this._readyLoaders.length !== 0;
    }
}