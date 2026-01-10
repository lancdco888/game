
const { ccclass, property } = cc._decorator;

// 导入项目所有依赖文件 (路径与原项目完全一致，请勿修改，完美兼容)
import PopupManager from "./manager/PopupManager";
import SoundManager from "./manager/SoundManager";
import GameCommonSound from "./GameCommonSound";
import FireHoseSender from "./FireHoseSender";

/**
 * 弹窗状态枚举 - 与原代码 DialogState 完全一致，无任何修改
 * 0:初始化 1:正常显示 2:关闭中
 */
export enum DialogState {
    Init = 0,
    Normal = 1,
    Close = 2
}

/**
 * 所有弹窗的基类组件 (核心父类)
 * 所有自定义弹窗都必须继承该类，统一规范弹窗的打开/关闭/初始化/适配/返回键处理逻辑
 * 由 PopupManager 统一管理该类的所有实例，是项目弹窗体系的核心基类
 */
@ccclass()
export default class DialogBase extends cc.Component {
    // ===================== 【序列化属性】与原代码完全一致 (拖拽赋值，Cocos编辑器可见) =====================
    @property(cc.Button)
    public closeBtn: cc.Button = null;          // 弹窗关闭按钮

    @property(cc.Node)
    public blockingBG: cc.Node = null;          // 弹窗遮罩背景节点

    @property(cc.Node)
    public rootNode: cc.Node = null;            // 弹窗根节点 (承载弹窗内容)

    // ===================== 【成员变量】补全TS类型注解，原默认值完全保留，私有成员修饰 =====================
    public state: DialogState = DialogState.Init;          // 当前弹窗状态
    public closeCallback: Function | null = null;          // 弹窗关闭后的回调函数
    public isBlockingPopup: boolean = true;                 // 是否为阻塞型弹窗 (默认true，阻止下层交互)
    public isBlurBackScreen: boolean = false;               // 是否开启背景模糊效果 (默认false)
    private openCompleteCallback: Function | null = null;   // 弹窗打开动画完成后的回调
    public destoryOnClose: boolean = true;                  // 关闭后是否销毁节点 (默认true)

    // ===================== 【生命周期&初始化】原逻辑完全保留 =====================
    /**
     * 弹窗基类初始化方法 (原拼写：initDailogBase 少a，❗必须保留原拼写，否则子类重写会报错)
     * 所有子类弹窗必须在onLoad中调用该方法，完成基础初始化
     */
    public initDailogBase(): void {
        this.setState(DialogState.Init);
        // 绑定关闭按钮点击事件
        if (this.closeBtn) {
            this.closeBtn.clickEvents = [];
            this.closeBtn.clickEvents.push(window['Utility'].getComponent_EventHandler(this.node, "DialogBase", "onClickClose", ""));
        }
        // 初始化遮罩背景尺寸+淡入动画
        if (this.blockingBG) {
            const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
            this.blockingBG.setContentSize(canvas.node.getContentSize());
            const originOpacity = this.blockingBG.opacity;
            this.blockingBG.opacity = 0;
            this.blockingBG.runAction(cc.sequence(cc.delayTime(0.05), cc.fadeTo(0.1, originOpacity)));
        }
        // 初始化根节点尺寸
        if (this.rootNode) {
            const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
            this.rootNode.setContentSize(canvas.node.getContentSize());
        }
    }

    // ===================== 【对外暴露 - 基础配置】原逻辑完全保留 =====================
    /** 设置弹窗关闭后的回调函数 */
    public setCloseCallback(callback: Function): void {
        this.closeCallback = callback;
    }

    /** 设置弹窗打开完成后的回调函数 */
    public setOpenComplete(callback: Function): void {
        this.openCompleteCallback = callback;
    }

    /** 设置弹窗关闭后是否销毁节点 */
    public setDestoryOnClose(isDestroy: boolean): void {
        this.destoryOnClose = isDestroy;
    }

    /** 设置开启背景模糊效果，并通知PopupManager显示模糊截屏 */
    public setBlurBackScreen(callback?: Function): void {
        this.isBlurBackScreen = true;
        PopupManager.Instance().showScreenShot(callback);
    }

    /** 设置弹窗当前状态 */
    public setState(state: DialogState): void {
        this.state = state;
    }

    /** 判断弹窗是否处于关闭状态 */
    public isStateClose(): boolean {
        return this.state === DialogState.Close;
    }

    /** 清空绑定的事件，防止内存泄漏 */
    public clear(): void {
        if (this.closeBtn) {
            this.closeBtn.clickEvents = [];
        }
    }

    // ===================== 【核心交互 - 关闭按钮/返回键】原逻辑完全保留 =====================
    /** 关闭按钮点击事件回调 - 播放音效+执行关闭逻辑 */
    public onClickClose(): void {
        // 播放关闭按钮音效
        SoundManager.Instance() && GameCommonSound.playFxOnce("btn_etc");
        this.close();
    }

    /**
     * 弹窗关闭入口方法 (❗空方法，留给子类重写实现具体关闭动画逻辑)
     * 子类重写时，内部必须调用 this._close(动画Action) 完成最终关闭流程
     */
    public close(): void { }

    /**
     * 返回键处理核心方法 (PopupManager调用)
     * @returns boolean 是否拦截返回键事件
     */
    public onBackBtnProcess(): boolean {
        return this.closeBackBtnProcess();
    }

    /** 返回键触发的关闭逻辑 - 默认调用关闭按钮事件，拦截返回键 */
    public closeBackBtnProcess(): boolean {
        this.onClickClose();
        return true;
    }

    // ===================== 【核心内部方法 - 弹窗打开/关闭 核心流程】原逻辑完全保留 =====================
    /**
     * 弹窗打开核心方法 (由子类调用，添加到PopupManager+播放打开动画+初始化状态)
     * @param openAction 弹窗打开动画
     * @param isBlur 是否开启背景模糊 (默认true)
     * @param callback 打开前的回调
     */
    public _open(openAction: cc.Action|any, isBlur: boolean = true, callback?: Function): void {
        // 开启背景模糊
        if (isBlur) {
            this.setBlurBackScreen();
        }
        // 更新弹窗状态+添加到弹窗管理器+显示节点
        this.setState(DialogState.Normal);
        PopupManager.Instance().addPopup(this.node);
        this.node.active = true;
        // 执行打开前回调
        callback && callback();
        // 执行打开完成回调
        this.openCompleteCallback && this.openCompleteCallback();
        // 播放打开动画+动画完成后更新状态
        if (openAction) {
            this.rootNode.runAction(cc.sequence(openAction, cc.callFunc(this._openComplete, this)));
        }
    }

    /**
     * 弹窗打开(指定父节点) - 不通过PopupManager，直接添加到指定父节点
     * @param openAction 弹窗打开动画
     * @param parentNode 父节点
     */
    public _openWithParent(openAction: cc.Action|any, parentNode: cc.Node): void {
        this.setState(DialogState.Normal);
        parentNode.addChild(this.node);
        this.node.active = true;
        if (openAction) {
            this.rootNode.runAction(cc.sequence(openAction, cc.callFunc(this._openComplete, this)));
        }
    }

    /** 弹窗关闭核心方法 (子类必须调用该方法完成最终关闭流程) */
    public _close(closeAction?: cc.Action|any): void {
        // 防止重复关闭
        if (this.state !== DialogState.Close) {
            this.setState(DialogState.Close);
        }
        // 播放关闭动画后执行收尾，无动画则直接收尾
        if (closeAction) {
            this.rootNode.runAction(cc.sequence(closeAction, cc.callFunc(this._closeComplete, this)));
        } else {
            this._closeComplete();
        }
    }

    /** 弹窗打开动画完成后的回调 - 更新状态为正常显示 */
    private _openComplete(): void {
        this.state = DialogState.Normal;
    }

    /** 弹窗关闭动画完成后的收尾逻辑 - 回调+移除+销毁 */
    private _closeComplete(): void {
        // 执行关闭回调
        this.closeCallback && this.closeCallback();
        // 从PopupManager移除弹窗
        PopupManager.Instance().removePopup(this.node);
        // 销毁节点
        if (this.destoryOnClose) {
            this.node.destroy();
        }
    }

    // ===================== 【静态工具方法】弹窗动画+异常日志，全局可调用，原逻辑完全保留 =====================
    /** 静态方法：获取淡入动画 */
    public static getFadeInAction(duration: number): cc.Action {
        return cc.fadeIn(duration);
    }

    /** 静态方法：获取淡出动画 */
    public static getFadeOutAction(duration: number): cc.Action {
        return cc.fadeOut(duration);
    }

    /**
     * 静态方法：资源加载异常日志上报
     * 编辑器内打印错误，真机上报到AWS日志服务
     */
    public static exceptionLogOnResLoad(msg: string): void {
        if (!window['Utility'].isCocosEditorPlay()) {
            const err = new Error(msg);
            FireHoseSender.Instance().sendAws(FireHoseSender.Instance().getRecord(FireHoseSender['FHLogType'].Exception, err));
        } else {
            cc.error(msg);
        }
    }

    // ===================== 【屏幕适配回调】实现ViewResizeManager的适配接口，原逻辑完全保留 =====================
    /** 屏幕尺寸变化后适配弹窗尺寸 (遮罩+根节点 尺寸+20做溢出适配，原逻辑保留) */
    public onAfterResizeView(): void {
        const canvasSize = cc.director.getScene().getComponentInChildren(cc.Canvas).node.getContentSize();
        if (this.blockingBG) {
            this.blockingBG.setContentSize(canvasSize.width + 20, canvasSize.height + 20);
        }
        if (this.rootNode) {
            this.rootNode.setContentSize(canvasSize.width + 20, canvasSize.height + 20);
        }
    }
}