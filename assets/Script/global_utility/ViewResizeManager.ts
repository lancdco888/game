const { ccclass, property } = cc._decorator;

// 导入项目依赖工具类 (路径与原项目一致，请勿修改)
import TSUtility from "../global_utility/TSUtility";

/**
 * 屏幕方向枚举 - 与原代码 CanvasOrientation 完全一致
 */
export enum CanvasOrientation {
    LANDSCAPE = "LANDSCAPE", // 横屏
    PORTRAIT = "PORTRAIT"    // 竖屏
}

/**
 * 屏幕尺寸适配回调接口约束
 * 所有需要监听屏幕尺寸变化的类，都要实现该接口的三个方法
 */
export interface ResizeHandler {
    onBeforeResizeView(): void;  // 尺寸变化前回调
    onResizeView(): void;        // 尺寸变化中回调
    onAfterResizeView(): void;   // 尺寸变化后回调
}

/**
 * 全局屏幕尺寸适配管理器 - 单例模式 (核心组件)
 * 核心功能：监听屏幕尺寸变化/浏览器全屏切换、统一分发适配回调、横竖屏判断、虚拟横竖屏比例计算
 * 项目中所有需要做屏幕适配的组件（如PopupManager）都需注册到此管理器，是屏幕适配的核心中枢
 */
@ccclass('ViewResizeManager')
export default class ViewResizeManager extends cc.Component {
    // ===================== 单例核心配置 (原逻辑完全保留，调用方式不变 不可修改) =====================
    private static _instance: ViewResizeManager = null;
    private _handlers: Array<ResizeHandler> = []; // 屏幕适配回调处理器列表

    /**
     * 获取单例实例 - 项目中唯一调用方式，与原代码一致
     * 自动创建常驻节点并挂载组件，全局唯一
     */
    public static Instance(): ViewResizeManager {
        if (this._instance) {
            return this._instance;
        }
        // 创建单例节点 + 挂载组件 + 设置为常驻节点
        const node = new cc.Node("ViewResizeManager");
        const ins = node.addComponent(ViewResizeManager);
        cc.game.addPersistRootNode(node);
        this._instance = ins;
        this._instance.init();
        return this._instance;
    }

    /**
     * 静态方法：移除适配回调处理器 - 与原代码一致
     * @param handler 要移除的处理器
     */
    public static RemoveHandler(handler: ResizeHandler): void {
        if (TSUtility.isValid(this.Instance())) {
            this._instance._removeHandler(handler);
        }
    }

    // ===================== 私有核心方法 =====================
    /** 初始化：绑定屏幕尺寸变化监听 + 浏览器全屏事件监听 */
    private init(): void {
        // 绑定Cocos原生的屏幕尺寸变化回调
        cc.view.setResizeCallback(this.onResizeView.bind(this));
        // 浏览器环境下，监听全屏切换事件
        if (cc.sys.isBrowser) {
            document.addEventListener("fullscreenchange", this.onFullscreenChange.bind(this));
        }
    }

    /** 移除指定的适配回调处理器 */
    private _removeHandler(handler: ResizeHandler): void {
        const index = this._handlers.indexOf(handler);
        if (index !== -1) {
            this._handlers.splice(index, 1);
        }
    }

    // ===================== 事件监听回调 =====================
    /** 浏览器全屏状态切换回调 → 触发屏幕尺寸适配 */
    public onFullscreenChange(): void {
        cc.log("ViewResizeManager onFullscreenChange");
        this.onResizeView();
    }

    /**
     * 核心方法：屏幕尺寸变化回调分发 (原逻辑完全保留，三层回调机制)
     * 执行顺序：1.前置回调 → 延迟0帧 → 2.适配回调 → 再延迟0帧 → 3.后置回调
     * 切片数组遍历：防止遍历过程中处理器被移除导致的数组越界问题
     */
    public onResizeView(): void {
        const handlers = this._handlers.slice();
        // 第一步：执行【尺寸变化前】的回调
        for (let i = 0; i < handlers.length; ++i) {
            handlers[i].onBeforeResizeView();
        }
        // 第二步：延迟0帧执行【尺寸变化中】的回调 (Cocos渲染帧同步，必加)
        this.scheduleOnce(() => {
            for (let i = 0; i < handlers.length; ++i) {
                if (TSUtility.isValid(handlers[i])) {
                    handlers[i].onResizeView();
                }
            }
            // 第三步：再延迟0帧执行【尺寸变化后】的回调
            this.scheduleOnce(() => {
                for (let i = 0; i < handlers.length; ++i) {
                    if (TSUtility.isValid(handlers[i])) {
                        handlers[i].onAfterResizeView();
                    }
                }
            }, 0);
        }, 0);
    }

    // ===================== 对外暴露核心方法 (全部保留，逻辑不变，补全注释) =====================
    /**
     * 添加屏幕适配回调处理器
     * @param handler 实现了ResizeHandler接口的处理器对象
     */
    public addHandler(handler: ResizeHandler): void {
        this._handlers.push(handler);
    }

    /** 判断当前屏幕是否为【物理横屏】：宽 > 高 */
    public isLandScape(): boolean {
        const frameSize = cc.view.getFrameSize();
        return frameSize.width > frameSize.height;
    }

    /** 判断当前屏幕是否为【物理竖屏】：高 >= 宽 */
    public isPortrait(): boolean {
        return !this.isLandScape();
    }

    /** 获取当前屏幕的【物理方向】枚举值 */
    public getOrientation(): CanvasOrientation {
        return this.isLandScape() ? CanvasOrientation.LANDSCAPE : CanvasOrientation.PORTRAIT;
    }

    /** 判断当前是否为【虚拟竖屏】(按预设比例1.4判断) */
    public isVirtualPortrait(): boolean {
        return ViewResizeManager.isVirtualPortrait_withRatio(1.4);
    }

    /** 获取当前屏幕的【虚拟方向】枚举值 */
    public getVirtualOrientation(): CanvasOrientation {
        return this.isVirtualPortrait() ? CanvasOrientation.PORTRAIT : CanvasOrientation.LANDSCAPE;
    }

    // ===================== 静态工具方法 (原逻辑完全保留，全局可调用) =====================
    /**
     * 静态方法：按指定比例判断是否为【虚拟竖屏】
     * @param ratio 宽高比阈值 (默认1.4)
     */
    public static isVirtualPortrait_withRatio(ratio: number): boolean {
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas).node.getContentSize();
        return canvas.height / canvas.width > ratio;
    }

    /** 静态方法：获取Canvas的实际宽高比 (高/宽) */
    public static getPortraitRatio(): number {
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas).node.getContentSize();
        return canvas.height / canvas.width;
    }
}