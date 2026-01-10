const { ccclass, property } = cc._decorator;

import PopupManager from "../manager/PopupManager";
import CommonPopup from "./CommonPopup";
import LoadingProgressBar from "../UI/LoadingProgressBar";
import UserInfo from "../User/UserInfo";
import AssetBundleManager from "../AssetBundle/AssetBundleManager";
import DialogBase, { DialogState } from "../DialogBase";
import SDefine from "../global_utility/SDefine";
import FireHoseSender, { FHLogType } from "../FireHoseSender";
import AsyncHelper from "../global_utility/AsyncHelper";
import TSUtility from "../global_utility/TSUtility";
import LoadingSlotPrefabComponent from "./LoadingSlotPrefabComponent";
import ServiceSlotDataManager from "../manager/ServiceSlotDataManager";
import { Utility } from "../global_utility/Utility";

/** 弹窗内部状态枚举 - 加载中/正常/加载失败 */
enum LoadingState {
    Normal = 0,
    Loading = 1,
    LoadingFail = 2
}

/** 加载弹窗背景类型枚举 (与原JS完全一致，序号精准匹配，全局共用) */
export enum LoadingBGType {
    Lobby = 0,
    Slot = 1,
    Lobby_To_Lobby = 2,
    Slot_To_Lobby = 3,
    Login_To_Lobby = 4
}

@ccclass
export default class LoadingPopup extends DialogBase {
    // ====================== Cocos 序列化绑定属性 ======================
    @property(cc.Label)
    public infoLabel: cc.Label = null!;

    @property()
    public progressBar: LoadingProgressBar = null!;

    @property(cc.Sprite)
    public sprScreen: cc.Sprite = null!;

    @property(cc.Sprite)
    public sprBannerImage: cc.Sprite = null!;

    @property(cc.Node)
    public nodeBG: cc.Node = null!;

    // ====================== 静态属性 & 全局单例 ======================
    /** 当前打开的Loading弹窗实例 - 全局唯一 */
    public static s_pop: LoadingPopup | null = null;

    // ====================== 成员属性 ======================
    /** 弹窗加载背景类型 */
    public _loadingBGType: LoadingBGType = LoadingBGType.Lobby;
    /** 弹窗内部状态 */
    private _eState: LoadingState = LoadingState.Normal;
    /** 预加载进度占比 */
    private _preProgress: number = 0;
    /** 中加载进度占比 */
    private _midProgress: number = 0;
    /** 后加载进度占比 */
    private _postProgress: number = 0;
    /** 总进度占比 */
    private _totalProgress: number = 0;
    /** 要加载的场景名称 */
    private _sceneName: string = "";
    /** 是否开启淡入动画 */
    private _isOpenFadeIn: boolean = true;
    /** 是否开启淡出动画 */
    private _isCloseFadeOut: boolean = true;
    /** Slot加载文本的颜色数组 */
    private _slotLabelColors: cc.Color[] = [
        cc.Color.BLACK.fromHEX("#ffbaba"),
        cc.Color.BLACK.fromHEX("#fffd71"),
        cc.Color.BLACK.fromHEX("#f2c9ff")
    ];
    /** 关闭回调函数 */
    private _closeCallBack: Function | null = null;
    /** 加载完成回调 */
    public onLoadCompletaFunc: Function | null = null;
    /** 加载失败回调 */
    public onLoadFailFunc: Function | null = null;

    // ====================== 静态工具方法 (全局调用，核心) ======================
    /**
     * 获取加载弹窗实例
     * @param bgType 弹窗背景类型
     * @param zoneId 区服ID
     * @param zoneName 区服名称
     * @param callback 回调 (错误信息, 弹窗实例)
     */
    public static getPopup(bgType: LoadingBGType, zoneId: number, zoneName: string, callback: (err: any, popup: LoadingPopup | null) => void): void {
        PopupManager.Instance().showDisplayProgress(true);
        // 根据登录/大厅切换 加载不同的弹窗预制体
        const resPath = bgType === LoadingBGType.Login_To_Lobby 
            ? "Service/00_Loading/LoadingScene/LoadingPopup_Login" 
            : "Service/00_Loading/LoadingScene/LoadingPopup_Slot";
        
            cc.loader.loadRes(resPath, (err, prefab) => {
            PopupManager.Instance().showDisplayProgress(false);
            if (TSUtility.isValid(err)) {
                const error = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
                callback(err, null);
                return;
            }
            const node = cc.instantiate(prefab);
            const popupComp = node.getComponent(LoadingPopup);
            node.active = false;
            popupComp!._loadingBGType = bgType;
            callback(null, popupComp!);
        });
    }

    /**
     * 检测是否有可用的加载弹窗(当前无打开的弹窗)
     */
    public static isAvailableLoadingPopup(): boolean {
        return !TSUtility.isValid(this.getCurrentOpenPopup());
    }

    /**
     * 加载老虎机信息预制体
     * @param slotId 老虎机ID
     * @param callback 加载完成回调
     */
    public static loadSlotInfo(slotId: string | number, callback: (node: Node | null) => void): void {
        const resPath = `Loading/Slot/l_${slotId}`;
        cc.loader.loadRes(resPath, (err, prefab) => {
            PopupManager.Instance().showBlockingBG(false);
            if (!TSUtility.isValid(err)) {
                const node = cc.instantiate(prefab);
                const slotComp = node.getComponent(LoadingSlotPrefabComponent);
                TSUtility.isValid(slotComp) && slotComp.clear();
                const curPopup = this.getCurrentOpenPopup();
                TSUtility.isValid(curPopup) && curPopup.rootNode.addChild(node);
                callback(node);
            } else {
                callback(null);
                const error = new Error(`cc.loader.loadRes fail ${resPath}: ${JSON.stringify(err)}`);
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
            }
        });
    }

    /**
     * 加载老虎机Banner图
     * @param slotId 老虎机ID
     * @param callback 加载完成回调
     */
    public static loadSlotBannerImg(slotId: string | number, callback: Function): void {
        const curPopup = this.getCurrentOpenPopup();
        ServiceSlotDataManager.instance.getResourceDataBySlotID(slotId).loadLongImage((spFrame) => {
            if (TSUtility.isValid(this) && TSUtility.isValid(spFrame)) {
                curPopup!.sprBannerImage.spriteFrame = spFrame;
                callback();
            } else {
                callback();
            }
        });
    }

    /**
     * 获取当前打开的弹窗实例
     */
    public static getCurrentOpenPopup(): LoadingPopup | null {
        return this.s_pop;
    }

    /**
     * 设置当前打开的弹窗实例
     */
    public static setLoadingPopup(popup: LoadingPopup | null): void {
        this.s_pop = popup;
    }

    // ====================== 生命周期 & 基础方法 ======================
    onLoad(): void {
        this.initDailogBase();
    }

    /** 重置弹窗所有状态数据 */
    reset(): void {
        this._totalProgress = 1;
        this._sceneName = "";
        this._isOpenFadeIn && this.progressBar.reset();
    }

    /** 设置是否开启淡入动画 */
    setOpenFadeIn(isOpen: boolean): void {
        this._isOpenFadeIn = isOpen;
    }

    /** 设置是否开启淡出动画 */
    setCloseFadeOut(isClose: boolean): void {
        this._isCloseFadeOut = isClose;
    }

    /** 获取弹窗当前内部状态 */
    getState(): LoadingState {
        return this._eState;
    }

    /**
     * 打开加载弹窗 核心方法
     * @param sceneName 要加载的场景名
     * @param preProgress 预加载进度占比
     * @param midProgress 中加载进度占比
     * @param postProgress 后加载进度占比
     */
    open(sceneName: string, preProgress: number, midProgress: number, postProgress: number): this | void {
        if (LoadingPopup.s_pop === null) {
            this._open(null, false, null);
            this.reset();
            // 调试标记：是否隐藏弹窗
            this.node.active = SDefine.Use_LoadingPopup_Debug_Flag ? false : true;
            LoadingPopup.setLoadingPopup(this);
            this._eState = LoadingState.Loading;
            this._preProgress = preProgress;
            this._midProgress = midProgress === 0 ? 1 : midProgress;
            this._postProgress = postProgress;
            this._totalProgress = this._preProgress + this._midProgress + this._postProgress;
            this._sceneName = sceneName;
            this.displayProgress("Loading ...", 0);

            let fadeTime = 0;
            this.rootNode.opacity = 255;
            // 淡入动画配置
            if (this._isOpenFadeIn) {
                this.rootNode.opacity = 0;
                fadeTime = 0.4;
            }
            // 执行淡入动画 + 隐藏画布
            const fadeAction = cc.sequence(cc.fadeIn(fadeTime), cc.delayTime(0.1), cc.callFunc(() => {
                if (this.state !== DialogState.Close) {
                    PopupManager.Instance().setCanvasDisplay(false);
                }
            }));
            this.rootNode.runAction(fadeAction);
            
            // 无预加载则直接执行中加载
            preProgress === 0 && this.doMidProgress();
            return this;
        }
        // 弹窗已打开 上报异常日志
        const error = new Error(`already open loadingPopup [${LoadingPopup.s_pop._sceneName}/${sceneName}]`);
        FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Exception, error));
    }

    /** 关闭加载弹窗 核心方法 */
    close(): void {
        if (this.isStateClose()) return;
        
        this.setState(DialogState.Close);
        LoadingPopup.s_pop = null;
        this._closeCallBack && this._closeCallBack();

        if (this._isCloseFadeOut) {
            // 大厅互切/老虎机回大厅 淡出时间加长
            let fadeTime = this._loadingBGType === LoadingBGType.Lobby_To_Lobby || this._loadingBGType === LoadingBGType.Slot_To_Lobby 
                ? 0.5 : 0.3;
            PopupManager.Instance().setCanvasDisplay(true);
            const fadeAction = cc.sequence(cc.fadeOut(fadeTime), cc.callFunc(() => {}));
            this._close(fadeAction);
        } else {
            this._close(null);
        }
    }

    // ====================== 进度条控制 核心方法 ======================
    /** 显示/隐藏进度条和文本 */
    showProgressInfo(isShow: boolean): void {
        this.progressBar.node.active = isShow;
        this.infoLabel.node.active = isShow;
    }

    /**
     * 设置预加载进度
     * @param value 进度值(0-1)
     * @param text 进度文本
     * @param isDoMid 是否执行中加载
     */
    setPreProgress(value: number, text: string, isDoMid: boolean): void {
        value = Math.min(value, 1);
        const progress = this._preProgress * value / this._totalProgress;
        this.displayProgress(text, progress);
        isDoMid && this.doMidProgress();
    }

    /**
     * 设置中加载进度
     * @param value 进度值(0-1)
     * @param text 进度文本
     */
    setMidProgress(value: number, text: string): void {
        value = Math.min(value, 1);
        const progress = (this._preProgress + this._midProgress * value) / this._totalProgress;
        this.displayProgress(text, progress);
    }

    /**
     * 设置后加载进度
     * @param value 进度值(0-1)
     * @param text 进度文本
     * @param isClose 是否加载完成后关闭弹窗
     */
    setPostProgress(value: number, text: string, isClose?: boolean): void {
        value = Math.min(value, 1);
        const progress = (this._preProgress + this._midProgress + this._postProgress * value) / this._totalProgress;
        this.displayProgress(text, progress);
        isClose && this.close();
    }

    /** 设置弹窗关闭回调 */
    setCloseCallBack(cb: Function): void {
        this._closeCallBack = cb;
    }

    /** 更新进度条和文本显示 */
    displayProgress(text: string, progress: number): void {
        this.infoLabel.string = text;
        this.progressBar.setProgress(progress);
    }

    /** 根据区服名称获取进度条索引 */
    getIndexProgressBar(zoneId: number, zoneName: string): number {
        if (zoneName === SDefine.HIGHROLLER_ZONENAME) return 0;
        if (zoneName === SDefine.LIGHTNING_ZONENAME) return 1;
        if (zoneName === SDefine.VIP_LOUNGE_ZONENAME) return 2;
        return 3;
    }

    // ====================== 场景加载 & 资源下载 核心业务逻辑 ======================
    /** 执行中加载逻辑：检测热更/加载场景 */
    doMidProgress(): void {
        this.rootNode.opacity = 255;
        // 原生环境+开启热更+场景清单变更 → 下载场景资源
        if (cc.sys.isNative && AssetBundleManager.Instance().isUsePatchSystem() && AssetBundleManager.Instance().isSceneManifestChange(this._sceneName)) {
            cc.log("scene manifest is change ", this._sceneName);
            this.downloadSceneResource(this._sceneName, 0.5, (isSuccess) => {
                if (isSuccess) {
                    this.loadSceneWithProgress(0.5);
                } else {
                    cc.log("downloadSceneDependencyAsset fail");
                    // 加载失败弹窗提示
                    CommonPopup.getCommonPopup((err, popup) => {
                        popup.open().setInfo("Notice", "Loading Fail", false).setOkBtn("OK", () => {
                            this.close();
                        });
                    });
                    this.onLoadFailFunc && this.onLoadFailFunc();
                }
            });
        } else {
            // 无热更直接加载场景
            this.loadSceneWithProgress(0);
        }
    }

    /**
     * 异步加载大厅场景 核心方法 (供外部状态类调用)
     */
    public async asyncLoadLobbyScene(sceneName: string): Promise<void> {
        // UserInfo.instance().resetInfoBeforeSceneLoad();
        await AsyncHelper.delayWithComponent(0, this);
        
        let blurTime = 0.5;
        // 非Facebook网页环境 模糊时间缩短
        if (!Utility.isFacebookWeb()) blurTime = 0.3;

        // 生成模糊截图 + 加载场景
        PopupManager.Instance().makeScreenShot(3, blurTime, () => {
            this.open(sceneName, 0.1, 6, 1);
            if (TSUtility.isValid(this.sprScreen)) {
                TSUtility.isValid(this.nodeBG) && (this.nodeBG.active = false);
                this.sprScreen.spriteFrame = PopupManager.Instance().getBlurScreenShopSPriteFrame();
                this.sprScreen.node.opacity = 1;
                
                // 添加灰色遮罩层
                const grayNode = new cc.Node();
                const graySprite = grayNode.addComponent(cc.Sprite);
                this.sprScreen.node.addChild(grayNode);
                graySprite.spriteFrame = this.sprScreen.spriteFrame;
                grayNode.color = cc.Color.GRAY;

                // 淡入+变黑+初始化进度
                this.sprScreen.node.runAction(cc.sequence(cc.fadeIn(0.4), cc.callFunc(() => {
                    this.sprScreen.node.color = cc.Color.BLACK;
                    this.setPreProgress(1, "Loading ...", true);
                })));
            } else {
                this.nodeBG.active = true;
                this.setPreProgress(1, "Loading ...", true);
            }
        });
    }

    /**
     * 异步下载场景资源(热更)
     * @param sceneName 场景名
     * @param progressWeight 进度权重
     * @param callback 下载完成回调
     */
    private async downloadSceneResource(sceneName: string, progressWeight: number, callback: (isSuccess: number) => void): Promise<void> {
        const resCode = await AssetBundleManager.Instance().downloadSceneResourceSync(sceneName, (res, cur, total) => {
            if (cc.isValid(this)) {
                const progress = cur / (total === 0 ? 1 : total) * progressWeight;
                this.setMidProgress(progress, "Updating resource …");
            }
        });
        // 下载失败上报日志
        if (!resCode) {
            const cdnUrl = AssetBundleManager.Instance().getResCDNUrl();
            const fullUrl = cdnUrl + sceneName;
            FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Trace, "Scene download Fail", fullUrl));
        }
        callback && callback(resCode?1:0);
    }

    /**
     * 带进度的场景加载 核心方法
     * @param preProgress 预加载进度占比
     */
    private loadSceneWithProgress(preProgress: number): void {
        // UserInfo.instance().resetInfoBeforeSceneLoad();
        cc.log("loadSceneWithProgress ", this._sceneName);

        const progressWeight = 1 - preProgress;
        let maxTotal = 0;
        let maxLoaded = 0;
        // 监听加载进度
        cc.loader.onProgress = (loaded: number, total: number) => {
            if (cc.isValid(this)) {
                total = total === 0 ? 1 : total;
                maxTotal = Math.max(total, maxTotal);
                maxLoaded = Math.max(loaded, maxLoaded);
                const progress = preProgress + maxLoaded / maxTotal * progressWeight;
                this.setMidProgress(progress, "Loading ...");
            }
        };
        // 加载场景
        const isSuccess = cc.director.loadScene(this._sceneName, (err) => {
            cc.loader.onProgress = null;
            PopupManager.Instance().setOnAllPopupClose(null);
            cc.log("loadSceneWithProgress Complete ", this._sceneName);
            
            if (err) {
                // 加载失败 上报日志+弹窗提示
                FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FHLogType.Trace, err, `downloadSuccess ${this._sceneName}`));
                cc.log("Load fail", JSON.stringify(err));
                CommonPopup.getCommonPopup((error, popup) => {
                    error && this.close();
                    popup.open().setInfo("Notice", "Loading Fail", false).setOkBtn("OK", () => {
                        this.close();
                    });
                });
                this.onLoadFailFunc && this.onLoadFailFunc();
                return;
            }
            // 加载成功 执行回调+关闭弹窗
            this.sprScreen && (this.sprScreen.node.stopAllActions(), this.sprScreen.node.opacity = 255);
            this.onLoadCompletaFunc && this.onLoadCompletaFunc();
            this._postProgress === 0 && this.close();
        });
        // 加载异常 清空进度监听
        if (!isSuccess) cc.loader.onProgress = null;
    }

    // ====================== 基类重写 ======================
    onBackBtnProcess(): boolean {
        return true;
    }
}