const { ccclass } = cc._decorator;
import AsyncHelper from "../global_utility/AsyncHelper";
import LocalStorageManager from "../manager/LocalStorageManager";
import Downloader, { MultiDownLoader } from "../Network/Downloader";
import { Utility } from "../global_utility/Utility";

export class ManifestSrc {}
export class DownloadManifest {}

export class DownloadSceneInfo {
    public sceneName: string = "";
    public fileCnt: number = 0;
    public totFileSize: number = 0;

    public getMBFileSize(): number {
        return this.totFileSize / 1048576;
    }

    public getKBFileSize(): number {
        return this.totFileSize / 1024;
    }
}

@ccclass
export default class AssetBundleManager {
    private static _instance: AssetBundleManager = null;
    private _mainManifest: any = null;
    private _cdnUrl: string = "";
    private _mainManifestCompletePath: string = "";
    private _mainManifestTempPath: string = "";
    private _usePatchSystem: boolean = true;
    private _fileManifestcache: { [key: string]: any } = {};
    private _isFileManifestCacheChanged: boolean = false;

    // 单例模式 - 全局唯一实例
    public static Instance(): AssetBundleManager {
        if (AssetBundleManager._instance == null) {
            AssetBundleManager._instance = new AssetBundleManager();
        }
        return AssetBundleManager._instance;
    }

    // 空实现方法 保留原代码结构 无修改
    public initFileManifestcache(): void {}
    public saveFileManifestCache(): void {}
    public setFileManifestCache(): void {}
    public getFileManifestCache(): any { return null; }
    public RemoveFileManifestCache(): void {}

    // 设置主清单文件
    public setMainManifest(manifest: any): void {
        this._mainManifest = manifest;
        Utility.setResourceVersion(manifest.version);
    }

    // 获取主清单文件
    public getMainManifest(): any {
        return this._mainManifest;
    }

    // 设置CDN地址 自动拼接版本尾缀
    public setResCDNUrl(url: string): void {
        this._cdnUrl = url + "2_4_11/";
    }

    // 获取CDN地址
    public getResCDNUrl(): string {
        return this._cdnUrl;
    }

    // 根据UUID获取场景清单
    public getSceneManifest(uuid: string): any {
        const mainManifest = this._mainManifest;
        if (!mainManifest) {
            cc.error("not initialize mainManifest.");
            return null;
        }
        const sceneKeys = Object.keys(mainManifest.scenes_manifest);
        for (let i = 0; i < sceneKeys.length; ++i) {
            const key = sceneKeys[i];
            const sceneManifest = mainManifest.scenes_manifest[key];
            if (sceneManifest.uuid == uuid) {
                return sceneManifest;
            }
        }
        cc.error("not found scene manifest. ", uuid);
        return null;
    }

    // 根据UUID获取场景清单文件名
    public getSceneManifestFileName(uuid: string): string {
        const mainManifest = this._mainManifest;
        if (!mainManifest) {
            cc.error("not initialize mainManifest.");
            return "";
        }
        const sceneKeys = Object.keys(mainManifest.scenes_manifest);
        for (let i = 0; i < sceneKeys.length; ++i) {
            const key = sceneKeys[i];
            const sceneManifest = mainManifest.scenes_manifest[key];
            if (sceneManifest.uuid == uuid) {
                return key;
            }
        }
        cc.error("not found scene manifest. ", uuid);
        return "";
    }

    // 检查场景清单是否有变更
    public isSceneManifestChange(uuid: string): boolean {
        return this._isSceneManifestChange_New(uuid);
    }

    // 内部私有检查清单变更逻辑
    private _isSceneManifestChange_New(uuid: string): boolean {
        if (!this.getSceneManifest(uuid)) {
            cc.error("not found scene manifest ", uuid);
            return true;
        }
        const fileName = this.getSceneManifestFileName(uuid);
        cc.log("_isSceneManifestChange_New", fileName);
        if (!jsb.fileUtils.isFileExist(fileName)) {
            return true;
        }
        const storageKey = this.getSceneManifestLocalStorageKey(fileName);
        return false;//LocalStorageManager.jsonParseWithExceptionHandling(cc.sys.localStorage.getItem(storageKey), "sceneManifestChange fail") == null;
    }

    // 获取场景清单本地存储KEY
    public getSceneManifestLocalStorageKey(fileName: string): string {
        return "%s_%s".format(fileName, Utility.getApplicationVersion());
    }

    // 设置是否启用补丁系统
    public setUsePatchSystem(isUse: boolean): void {
        this._usePatchSystem = isUse;
    }

    // 获取补丁系统启用状态
    public isUsePatchSystem(): boolean {
        return this._usePatchSystem;
    }

    // 获取变更的资源列表
    public getChangedSrcList(oldObj: any, newObj: any): Array<any> {
        const srcList: Array<any> = [];
        const cdnUrl = this.getResCDNUrl();
        const newKeys = Object.keys(newObj);
        for (let i = 0; i < newKeys.length; ++i) {
            const key = newKeys[i];
            const newItem = newObj[key];
            if (!oldObj[key]) {
                cc.log("oldItem not exist ", key);
                const srcInfo = {
                    name: key,
                    size: newItem.size,
                    srcUrl: cdnUrl + key,
                    writePath: jsb.fileUtils.getWritablePath() + key
                };
                srcList.push(srcInfo);
            }
        }
        return srcList;
    }

    // 异步下载主清单文件
    public async downloadMainmanifestSync(version: string): Promise<any> {
        await AsyncHelper.delay(0.01);
        const srcUrl = this.getResCDNUrl() + "main.manifest_" + version;
        this._mainManifestCompletePath = jsb.fileUtils.getWritablePath() + "assets/main.manifest";
        this._mainManifestTempPath = jsb.fileUtils.getWritablePath() + "assets/main.manifest_tmp";
        const downloadResult = await (new Downloader()).asyncDownloadFile(srcUrl, this._mainManifestTempPath);
        if (downloadResult) {
            return downloadResult;
        } else {
            return JSON.parse(jsb.fileUtils.getStringFromFile(this._mainManifestTempPath));
        }
    }

    // 异步获取场景下载信息
    public async getDownloadSceneInfoSync(sceneUuid: string): Promise<DownloadSceneInfo> {
        const sceneInfo = new DownloadSceneInfo();
        sceneInfo.sceneName = sceneUuid;
        sceneInfo.fileCnt = 0;
        sceneInfo.totFileSize = 0;

        if (this.isSceneManifestChange(sceneUuid)) {
            const cdnUrl = this.getResCDNUrl();
            const sceneManifest = this.getSceneManifest(sceneUuid);
            if (sceneManifest) {
                const fileName = this.getSceneManifestFileName(sceneUuid);
                const srcUrl = cdnUrl + fileName;
                const tempPath = jsb.fileUtils.getWritablePath() + fileName + "_tmp";
                const downloadResult = await (new Downloader()).asyncDownloadFile(srcUrl, tempPath);
                if (downloadResult) {
                    return sceneInfo;
                }
                const manifestJson = JSON.parse(jsb.fileUtils.getStringFromFile(tempPath));
                const fileKeys = Object.keys(manifestJson);
                for (let i = 0; i < fileKeys.length; ++i) {
                    const key = fileKeys[i];
                    const fileInfo = manifestJson[key];
                    if (!jsb.fileUtils.isFileExist(key)) {
                        sceneInfo.fileCnt++;
                        sceneInfo.totFileSize += fileInfo.size;
                    }
                }
            } else {
                cc.error("not found getSceneManifest " + sceneUuid);
            }
        }
        return sceneInfo;
    }

    // 异步下载场景资源文件 核心方法
    public async downloadSceneResourceSync(sceneUuid: string, progressCallback: Function): Promise<boolean> {
        if (this.isSceneManifestChange(sceneUuid)) {
            const cdnUrl = this.getResCDNUrl();
            const sceneManifest = this.getSceneManifest(sceneUuid);
            if (!sceneManifest) {
                cc.error("not found getSceneManifest " + sceneUuid);
                return false;
            }
            const fileName = this.getSceneManifestFileName(sceneUuid);
            const srcUrl = cdnUrl + fileName;
            const savePath = jsb.fileUtils.getWritablePath() + fileName;
            const tempPath = jsb.fileUtils.getWritablePath() + fileName + "_tmp";
            
            const downloadResult = await (new Downloader()).asyncDownloadFile(srcUrl, tempPath);
            if (downloadResult) {
                return false;
            }

            const manifestJson = JSON.parse(jsb.fileUtils.getStringFromFile(tempPath));
            const downloadFiles: Array<any> = [];
            const fileKeys = Object.keys(manifestJson);
            for (let i = 0; i < fileKeys.length; ++i) {
                const key = fileKeys[i];
                const fileInfo = manifestJson[key];
                if (!jsb.fileUtils.isFileExist(key)) {
                    const fileObj = {
                        name: key,
                        size: fileInfo.size,
                        srcUrl: cdnUrl + key,
                        writePath: jsb.fileUtils.getWritablePath() + key
                    };
                    downloadFiles.push(fileObj);
                }
            }

            let isSuccess = true;
            let isMultiDownload = false;
            if (downloadFiles.length > 0) {
                const multiDownLoader = new MultiDownLoader();
                const downProgressCallback = (complete: number, total: number, name: string) => {
                    const fileInfo = manifestJson[name];
                    // this.setFileManifestCache(name, fileInfo);
                    progressCallback(multiDownLoader, complete, total);
                };
                isMultiDownload = true;
                isSuccess = await multiDownLoader.asyncDownloadFiles(downloadFiles, downProgressCallback);
            }

            if (isSuccess) {
                cc.log("scene resource download success");
                const storageKey = this.getSceneManifestLocalStorageKey(fileName);
                const saveObj = { size: sceneManifest.size, uuid: sceneManifest.uuid };
                cc.sys.localStorage.setItem(storageKey, JSON.stringify(saveObj));
                // jsb.fileUtils.renameFile(tempPath, savePath);
            }
            if (isMultiDownload) {
                jsb.fileUtils.purgeCachedEntries();
            }
            return isSuccess;
        } else {
            return true;
        }
    }

    // 重置场景清单文件
    public resetSceneManifest(): void {
        const mainManifest = this._mainManifest;
        if (!mainManifest) {
            cc.error("not initialize mainManifest.");
            return;
        }
        const sceneKeys = Object.keys(mainManifest.scenes_manifest);
        for (let i = 0; i < sceneKeys.length; ++i) {
            const fileName = sceneKeys[i];
            AssetBundleManager.removeFile(fileName, jsb.fileUtils.getWritablePath());
        }
    }

    // 完成主清单文件加载 重命名临时文件
    public setCompleteMainManifest(): void {
        // jsb.fileUtils.renameFile(this._mainManifestTempPath, this._mainManifestCompletePath);
        // const srcKeys = Object.keys(this._mainManifest.src);
        // for (let i = 0; i < srcKeys.length; ++i) {
        //     let key = srcKeys[i];
        //     key = key.replace(".jsc", ".js");
        //     if (key.indexOf("src/settings.") !== -1) {
        //         cc.log("setCompleteMainManifest settings-jsb", key);
        //         cc.sys.localStorage.setItem("md5Setting_2_4_11", key);
        //     } else if (key.indexOf("src/cocos2d-jsb.") !== -1) {
        //         cc.log("setCompleteMainManifest cocos2d-jsb", key);
        //         cc.sys.localStorage.setItem("md5CocosJsb_2_4_11", key);
        //     }
        // }
    }

    // 获取本地清单信息
    public getLocalManifestInfo(): any {
        var manifestInfo: any = {};
        const manifestStr = jsb.fileUtils.getStringFromFile("assets/main.manifest");
        if (manifestStr) {
            manifestInfo = JSON.parse(manifestStr);
        } else {
            cc.log("[WARNING] not found manifest");
            manifestInfo.version = -1;
            manifestInfo.src = {};
        }
        return manifestInfo;
    }

    // 静态方法 - 批量删除文件
    public static removeFiles(files: Array<string>, rootPath: string): void {
        for (let i = 0; i < files.length; ++i) {
            AssetBundleManager.removeFile(files[i], rootPath);
        }
    }

    // 静态方法 - 删除单个文件
    public static removeFile(fileName: string, rootPath: string): void {
        const fullPath = rootPath + fileName;
        if (jsb.fileUtils.isFileExist(fullPath)) {
            jsb.fileUtils.removeFile(fullPath);
        }
    }
}