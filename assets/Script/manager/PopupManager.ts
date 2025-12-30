const { ccclass, property } = cc._decorator;

// 导入项目依赖文件 (路径与你的原项目完全一致，请勿修改)
import DialogBase from "../DialogBase";
import DelayProgress from "../DelayProgress";
import TSUtility from "../global_utility/TSUtility";
import ViewResizeManager from "../global_utility/ViewResizeManager";

// 弹窗队列信息实体类 - 原 OpenPopupInfo
export class OpenPopupInfo {
    public type: string = "";
    public openCallback: Function | null = null;
}

/**
 * 全局弹窗管理器 - 单例模式 (核心组件)
 * 核心功能：弹窗统一管理、弹窗层级控制、阻塞遮罩显示、返回键监听处理、弹窗队列调度、背景模糊(截屏)、屏幕适配刷新
 * 所有弹窗(DialogBase子类)均通过该管理器统一打开/关闭，是项目弹窗体系的唯一入口
 */
@ccclass('PopupManager')
export default class PopupManager extends cc.Component {
    // ===================== 单例核心配置 (原逻辑完全保留，调用方式不变) =====================
    private static _instance: PopupManager = null;
    public static Instance(): PopupManager {
        if (this._instance) {
            return this._instance;
        }
        // 创建单例节点并挂载组件
        const node = new cc.Node("PopupManagerInstance");
        this._instance = node.addComponent(PopupManager);
        // 获取Canvas尺寸
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        const canvasSize = canvas.node.getContentSize();
        // 设置为常驻节点 + 位置 + 尺寸
        cc.game.addPersistRootNode(node);
        node.setPosition(canvasSize.width / 2, canvasSize.height / 2);
        node.setContentSize(canvas.node.getContentSize());
        // 异步加载延迟进度条(阻塞遮罩)预制体
        cc.loader.loadRes("SlotCommon/Prefab/DelayProgress", (err, prefab) => {
            if (err) {
                cc.log("DelayProgress load error, ", JSON.stringify(err));
                return;
            }
            const canvasNode = cc.director.getScene().getComponentInChildren(cc.Canvas);
            const progressNode = cc.instantiate(prefab);
            cc.game.addPersistRootNode(progressNode);
            this._instance._delayProgress = progressNode.getComponent(DelayProgress);
            progressNode.setPosition(canvasSize.width / 2, canvasSize.height / 2);
            this._instance._delayProgress.setContentSize(canvasNode.node.getContentSize());
            // 执行预留的遮罩显示指令
            this._instance._reserveShowDelayBlock && this._instance.showBlockingBG(true);
            !this._instance._reserveShowDelayBlock && this._instance.showBlockingBG(false);
            this._instance._reserveShowDelayProgress && this._instance.showDisplayProgress(true);
            !this._instance._reserveShowDelayProgress && this._instance.showDisplayProgress(false);
        });
        return this._instance;
    }

    // 初始化管理器 (原逻辑不变，项目启动时调用一次)
    public static Init(): void {
        this.Instance();
    }

    // ===================== 私有成员变量 (全部补全TS类型注解，原变量名不变) =====================
    private _delayProgress: DelayProgress = null;
    private _reserveShowDelayProgress: boolean = false;
    private _reserveShowDelayBlock: boolean = false;
    private _onAllBlockingPopupClosed: Function | null = null;
    private _observersWhenAddAnyPopup: Array<Function> = [];
    private _openPopInfo: Array<OpenPopupInfo> = [];
    private _isOpen: boolean = false;
    private _openPopupAllCloseCallback: Function | null = null;
    private _baseBackBtnCallback: Function | null = null;
    private _screenShotCamera: cc.Camera = null;
    private _screenShotSprite: cc.Sprite = null;
    private _screenShotTexture: cc.RenderTexture = null;
    private _canvasContentSize: cc.Size = cc.Size.ZERO;
    private _width: number = 0;
    private _height: number = 0;
    private _openCnt: number = 0;
    private _onKeyBlock: boolean = false;
    private _screenShotNode: cc.Node = null;
    public tmpColor: Array<number> = [0, 0, 0, 0];
    private _isOnResize: boolean = false;

    // ===================== 生命周期回调 (原逻辑完全保留) =====================
    onLoad(): void {
        // 监听键盘按键事件 (返回键/ESC)
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown.bind(this), this.node);
        // 注册屏幕尺寸适配回调
        ViewResizeManager.Instance().addHandler(this);

        // 创建截屏相机节点
        const cameraNode = new cc.Node("screenShotCemara");
        this._screenShotCamera = cameraNode.addComponent(cc.Camera);
        this._screenShotCamera.zoomRatio = 1;
        this._screenShotCamera.cullingMask = 4294967295;
        (this._screenShotCamera as any).clearFlags = 7;

        // 创建截屏精灵节点
        const spriteNode = new cc.Node("screenShotSpr");
        this._screenShotSprite = spriteNode.addComponent(cc.Sprite);

        // 获取Canvas尺寸并初始化截屏节点
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        this._canvasContentSize = canvas.node.getContentSize();
        (cc.game as any).groupList.push("popup");
        cc.game.addPersistRootNode(spriteNode);
        spriteNode.setSiblingIndex(this.node.getSiblingIndex());
        spriteNode.setPosition(this._canvasContentSize.width / 2, this._canvasContentSize.height / 2);
        spriteNode.addChild(cameraNode);
        this._screenShotNode = spriteNode;

        this._width = canvas.node.width;
        this._height = canvas.node.height;
        this._screenShotCamera.node.active = false;
        this._screenShotSprite.enabled = false;

        // 初始化截屏纹理
        const renderTexture = new cc.RenderTexture();
        const gl = (cc.game as any)._renderContext;
        renderTexture.initWithSize(this._width, this._height, gl.STENCIL_INDEX8);
        this._screenShotTexture = renderTexture;
    }

    onDestroy(): void {
        // 移除键盘事件监听
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown.bind(this), this.node);
        // 移除屏幕尺寸适配回调
        ViewResizeManager.RemoveHandler(this);
    }

    // ===================== 内部工具方法 (原逻辑完全保留，补全类型注解) =====================
    private setGroup(node: cc.Node, isDefault: boolean): void {
        for (let i = 0; i < node.childrenCount; ++i) {
            const child = node.children[i];
            child.group = isDefault ? "default" : "popup";
            this.setGroup(child, isDefault);
        }
    }

    // ===================== 对外暴露核心方法 (全部保留，补全类型+注释，逻辑不变) =====================
    /** 创建延迟进度条节点实例 */
    public makeDelayProgressNode(): cc.Node {
        return cc.instantiate(this._delayProgress.node);
    }

    /** 设置Canvas显示/隐藏 */
    public setCanvasDisplay(isShow: boolean): void {
        cc.director.getScene().getComponentInChildren(cc.Canvas).node.opacity = isShow ? 255 : 0;
    }

    /** 是否需要模糊背景 */
    public isBlurBackGround(): boolean {
        return this._openCnt > 0;
    }

    /** 显示截屏模糊背景 */
    public showScreenShot(callback?: Function): void {
        this._openCnt++;
        if (this._openCnt > 1) {
            callback && callback();
            return;
        }
        this.makeScreenShot(1, 0.5, () => {
            this._screenShotSprite.enabled = true;
            this.setCanvasDisplay(false);
            callback && callback();
        });
    }

    /** 生成屏幕截图 */
    public makeScreenShot(scale: number, opacity: number, callback?: Function): void {
        this._screenShotSprite.enabled = false;
        this._screenShotCamera.node.active = true;
        this._screenShotCamera.targetTexture = this._screenShotTexture;
        this._screenShotCamera.render();
        this._screenShotSprite.spriteFrame = new cc.SpriteFrame(this._screenShotTexture);
        this._screenShotSprite.node.scaleY = -1;
        this._screenShotSprite.node.setContentSize(this._canvasContentSize.width, this._canvasContentSize.height);
        this._screenShotCamera.targetTexture = null;
        this._screenShotCamera.node.active = false;
        callback && callback();
    }

    /** 获取模糊截图的精灵帧 */
    public getBlurScreenShopSPriteFrame(): cc.SpriteFrame {
        return this._screenShotSprite.spriteFrame;
    }

    /** 隐藏截屏模糊背景 */
    public hideScreenShot(): void {
        this._openCnt--;
        if (this._openCnt <= 0) {
            this.setCanvasDisplay(true);
            this._screenShotSprite.enabled = false;
        }
    }

    /** 重置截屏状态 */
    public resetScreenShot(): void {
        this._openCnt = 0;
        this.setCanvasDisplay(true);
        this._screenShotSprite.enabled = false;
    }

    /** 生成模糊图片的像素数据 */
    public getScaleBlurImage(srcData: Uint8Array, srcW: number, srcH: number, tarW: number, tarH: number, blurSize: number): Uint8Array {
        const dstData = new Uint8Array(tarW * tarH * 4);
        const scaleW = srcW / tarW;
        const scaleH = srcH / tarH;
        for (let y = 0; y < tarH; y++) {
            const yOffset = y * tarW * 4;
            const srcY = Math.floor(y * scaleH);
            for (let x = 0; x < tarW; x++) {
                const xOffset = yOffset + 4 * x;
                const srcX = Math.floor(x * scaleW);
                this.getBlurPixcel(srcData, srcY, srcX, srcW, srcH, blurSize);
                dstData[xOffset] = this.tmpColor[0];
                dstData[xOffset + 1] = this.tmpColor[1];
                dstData[xOffset + 2] = this.tmpColor[2];
                dstData[xOffset + 3] = 255;
            }
        }
        return dstData;
    }

    /** 获取模糊后的像素颜色值 */
    public getBlurPixcel(srcData: Uint8Array, y: number, x: number, srcW: number, srcH: number, blurSize: number): void {
        this.tmpColor = [0, 0, 0, 0];
        let pixelCount = 0;
        for (let dy = -blurSize; dy <= blurSize; ++dy) {
            const ny = y + dy;
            if (ny < 0 || ny >= srcH) continue;
            for (let dx = -blurSize; dx <= blurSize; ++dx) {
                const nx = x + dx;
                if (nx < 0 || nx >= srcW) continue;
                const offset = ny * srcW * 4 + 4 * nx;
                this.tmpColor[0] += srcData[offset];
                this.tmpColor[1] += srcData[offset + 1];
                this.tmpColor[2] += srcData[offset + 2];
                pixelCount++;
            }
        }
        if (pixelCount > 0) {
            this.tmpColor[0] = Math.floor(this.tmpColor[0] / pixelCount);
            this.tmpColor[1] = Math.floor(this.tmpColor[1] / pixelCount);
            this.tmpColor[2] = Math.floor(this.tmpColor[2] / pixelCount);
        }
    }

    // ===================== 屏幕尺寸适配回调 (原逻辑完全保留) =====================
    public onBeforeResizeView(): void { this.refreshPosition(); }
    public onResizeView(): void { this.refreshPosition(); }
    public onAfterResizeView(): void { this.refreshPosition(); }

    /** 刷新弹窗管理器节点位置与尺寸 (适配屏幕缩放/旋转) */
    public refreshPosition(): void {
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        if (!canvas) return;
        cc.log("PopupManager refreshPosition ");
        const canvasSize = canvas.node.getContentSize();
        this.node.setPosition(canvasSize.width / 2, canvasSize.height / 2);
        this.node.setContentSize(canvasSize);

        // 刷新延迟进度条位置尺寸
        if (PopupManager.Instance()._delayProgress) {
            PopupManager.Instance()._delayProgress.node.setPosition(canvasSize.width / 2, canvasSize.height / 2);
            PopupManager.Instance()._delayProgress.node.setContentSize(canvasSize);
            PopupManager.Instance()._delayProgress.setContentSize(canvasSize);
        }

        this._canvasContentSize = canvas.node.getContentSize();
        this._screenShotNode.setPosition(this._canvasContentSize.width / 2, this._canvasContentSize.height / 2);
        this._width = canvas.node.width;
        this._height = canvas.node.height;

        // 重新初始化截屏纹理
        const renderTexture = new cc.RenderTexture();
        const gl = (cc.game as any)._renderContext;
        renderTexture.initWithSize(this._width, this._height, gl.STENCIL_INDEX8);
        this._screenShotTexture = renderTexture;
    }

    // ===================== 阻塞遮罩相关 =====================
    /** 是否处于阻塞状态 (有遮罩/加载中) */
    public isBlocking(): boolean {
        return this._delayProgress && this._delayProgress.isBlocking();
    }

    /** 显示/隐藏阻塞背景遮罩 */
    public showBlockingBG(isShow: boolean): void {
        if (this._delayProgress) {
            this._delayProgress.showBlockingBG(isShow);
        } else {
            this._reserveShowDelayBlock = isShow;
        }
    }

    /** 获取延迟进度条组件 */
    public getDelayProgress(): DelayProgress {
        return this._delayProgress;
    }

    // ===================== 键盘事件相关 (返回键处理 核心) =====================
    /** 设置是否阻塞键盘事件 */
    public setOnKeyBlock(isBlock: boolean): void {
        this._onKeyBlock = isBlock;
    }

    /** 键盘按键按下回调 */
    public onKeyDown(event: cc.Event.EventKeyboard): void {
        // 移动端/编辑器内 且未阻塞键盘事件时处理
        if ((window['Utility'].isMobileGame() || window['Utility'].isCocosEditorPlay()) && !this._onKeyBlock) {
            const keyCode = event.keyCode;
            cc.log("pressed key: " + keyCode);
            // 监听 返回键/退格键/ESC键 统一处理弹窗关闭
            if (keyCode === cc.macro.KEY.back || keyCode === cc.macro.KEY.backspace || keyCode === cc.macro.KEY.escape) {
                this.onBackBtnProcess();
            }
        }
    }

    /** 设置全局返回键兜底回调 */
    public setBaseBackBtnCallback(callback: Function): void {
        this._baseBackBtnCallback = callback;
    }

    /** 返回键处理核心逻辑：从顶层弹窗开始关闭 */
    public onBackBtnProcess(): void {
        if (this.isBlocking()) return;
        // 倒序遍历弹窗，优先关闭顶层弹窗
        for (let i = this.node.childrenCount - 1; i >= 0; --i) {
            const dialog = this.node.children[i].getComponent(DialogBase);
            if (dialog && dialog.onBackBtnProcess()) {
                return;
            }
        }
        // 无弹窗时执行兜底回调
        this._baseBackBtnCallback && this._baseBackBtnCallback();
    }

    // ===================== 进度条显示 =====================
    /** 显示/隐藏加载进度条 */
    public showDisplayProgress(isShow: boolean): void {
        if (this._delayProgress) {
            this._delayProgress.showDisplayProgress(isShow, true);
        } else {
            this._reserveShowDelayProgress = isShow;
        }
    }

    // ===================== 弹窗查找/状态判断 =====================
    /** 根据组件类型查找已打开的弹窗 */
    public getPopup<T>(cls: new () => T): T | null {
        for (let i = 0; i < this.node.childrenCount; ++i) {
            const comp = this.node.children[i].getComponent(cls);
            if (comp) return comp;
        }
        return null;
    }

    /** 是否有阻塞型弹窗打开 */
    public IsBlockingPopupOpen(): boolean {
        for (let i = 0; i < this.node.childrenCount; ++i) {
            const dialog = this.node.children[i].getComponent(DialogBase);
            if (dialog && dialog.isBlockingPopup) {
                return true;
            }
        }
        return false;
    }

    /** 设置所有阻塞弹窗关闭后的回调 */
    public setOnAllPopupClose(callback: Function): void {
        this._onAllBlockingPopupClosed = callback;
    }

    /** 判断弹窗是否为顶层弹窗 */
    public isTopPopup(dialog: DialogBase): boolean {
        const topIdx = this.node.childrenCount - 1;
        return dialog === this.node.children[topIdx].getComponent(DialogBase);
    }

    // ===================== 弹窗添加/移除 核心方法 =====================
    /** 添加弹窗节点到管理器 */
    public addPopup(node: cc.Node): void {
        this.node.addChild(node);
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas).node.getContentSize();
        if (this.node.x !== canvas.width / 2 || this.node.y !== canvas.height / 2) {
            this.refreshPosition();
        }
        this.processAllObserversWhenAddAnyPopup();
    }

    /** 从管理器移除弹窗节点 */
    public removePopup(node: cc.Node): void {
        node.removeFromParent();
        const dialog = node.getComponent(DialogBase);
        if (dialog && dialog.isBlurBackScreen) {
            this.hideScreenShot();
        }
        // 所有阻塞弹窗关闭后执行回调
        if (this._onAllBlockingPopupClosed && !this.IsBlockingPopupOpen()) {
            this._onAllBlockingPopupClosed();
            this._onAllBlockingPopupClosed = null;
        }
    }

    // ===================== 弹窗队列管理 (弹窗排队打开) =====================
    /** 是否有弹窗队列在执行 */
    public isOpenPopupOpen(): boolean {
        return this._isOpen;
    }

    /** 设置弹窗队列全部关闭后的回调 */
    public setOpenPopupAllCloseCallback(callback: Function): void {
        this._openPopupAllCloseCallback = callback;
    }

    /** 重置弹窗队列状态 */
    public resetOpenPopup(): void {
        this._isOpen = false;
        this._openPopInfo = [];
        this._openPopupAllCloseCallback = null;
    }

    /** 添加弹窗到队列(普通优先级，追加到队尾) */
    public addOpenPopup(info: OpenPopupInfo): void {
        if (!this._isOpen) {
            this._isOpen = true;
            info.openCallback && info.openCallback();
        } else {
            this._openPopInfo.push(info);
        }
    }

    /** 添加弹窗到队列(高优先级，插入到队首) */
    public addOpenPopup_Prior(info: OpenPopupInfo): void {
        if (!this._isOpen) {
            this._isOpen = true;
            info.openCallback && info.openCallback();
        } else {
            this._openPopInfo.unshift(info);
        }
    }

    /** 获取弹窗队列长度 */
    public getOpenPopupInfoCount(): number {
        return TSUtility.isValid(this._openPopInfo) ? this._openPopInfo.length : 0;
    }

    /** 检查并打开队列中的下一个弹窗 */
    public checkNextOpenPopup(): void {
        if (this._openPopInfo.length === 0) {
            this._isOpen = false;
            this._openPopupAllCloseCallback && this._openPopupAllCloseCallback();
            this._openPopupAllCloseCallback = null;
            return;
        }
        const nextPopup = this._openPopInfo.splice(0, 1)[0];
        nextPopup.openCallback && nextPopup.openCallback();
    }

    // ===================== 弹窗观察者 =====================
    /** 添加弹窗添加时的观察者回调 */
    public addObserverWhenAddAnyPopup(callback: Function): void {
        this._observersWhenAddAnyPopup.push(callback);
    }

    /** 移除弹窗添加时的观察者回调 */
    public removeObserverWhenAddAnyPopup(callback: Function): void {
        for (let i = 0; i < this._observersWhenAddAnyPopup.length; ++i) {
            if (this._observersWhenAddAnyPopup[i] === callback) {
                this._observersWhenAddAnyPopup.splice(i, 1);
                break;
            }
        }
    }

    /** 执行所有弹窗添加的观察者回调 */
    public processAllObserversWhenAddAnyPopup(): void {
        for (let i = 0; i < this._observersWhenAddAnyPopup.length; ++i) {
            this._observersWhenAddAnyPopup[i]();
        }
    }

    // ===================== 弹窗批量操作 =====================
    /** 判断指定类型的弹窗是否已打开 */
    public isPopupOpen<T>(cls: new () => T): boolean {
        return this.getPopup(cls) !== null;
    }

    /** 关闭所有弹窗 */
    public removeAllPopup(): void {
        for (let i = this.node.children.length - 1; i >= 0; --i) {
            const node = this.node.children[i];
            TSUtility.isValid(node) && this.removePopup(node);
        }
        this.node.removeAllChildren();
    }
}